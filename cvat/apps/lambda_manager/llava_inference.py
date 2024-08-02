import base64

import django_rq
import rq

from django.conf import settings
from django.core.exceptions import ValidationError
from rest_framework import status

import cvat.apps.dataset_manager as dm
from cvat.apps.engine.frame_provider import FrameProvider
from cvat.apps.engine.models import Task, Image
from cvat.apps.engine.serializers import LabeledDataSerializer
from cvat.apps.engine.models import ShapeType
import requests


class LlavaQueue:
    def _get_queue(self):
        return django_rq.get_queue(settings.CVAT_QUEUES.AUTO_ANNOTATION.value)

    def get_jobs(self):
        queue = self._get_queue()
        # Only failed jobs are not included in the list below.
        job_ids = set(
            queue.get_job_ids()
            + queue.started_job_registry.get_job_ids()
            + queue.finished_job_registry.get_job_ids()
            + queue.scheduled_job_registry.get_job_ids()
            + queue.deferred_job_registry.get_job_ids()
        )
        jobs = queue.job_class.fetch_many(job_ids, queue.connection)

        return [LlavaJob(job) for job in jobs if job.meta.get("lambda")]

    def enqueue(self, task, cleanup):
        jobs = self.get_jobs()
        # It is still possible to run several concurrent jobs for the same task.
        # But the race isn't critical. The filtration is just a light-weight
        # protection.
        if list(
            filter(lambda job: job.get_task() == task and not job.is_finished, jobs)
        ):
            raise ValidationError(
                "Only one running request is allowed for the same task #{}".format(
                    task
                ),
                code=status.HTTP_409_CONFLICT,
            )

        queue = self._get_queue()
        # LlavaJob(None) is a workaround for python-rq. It has multiple issues
        # with invocation of non-trivial functions. For example, it cannot run
        # staticmethod, it cannot run a callable class. Thus I provide an object
        # which has __call__ function.
        job = queue.create_job(
            LlavaJob(None),
            meta={"lambda": True},
            kwargs={
                "task": task,
                "cleanup": cleanup,
            },
        )

        queue.enqueue_job(job)

        return LlavaJob(job)

    def fetch_job(self, pk):
        queue = self._get_queue()
        job = queue.fetch_job(pk)
        if job is None or not job.meta.get("lambda"):
            raise ValidationError(
                "{} lambda job is not found".format(pk), code=status.HTTP_404_NOT_FOUND
            )

        return LlavaJob(job)


class LlavaJob:
    def __init__(self, job):
        self.job = job

    def to_dict(self):
        return {
            "id": self.job.id,
            "task": self.job.kwargs.get("task"),
            "status": self.job.get_status(),
            "progress": self.job.meta.get("progress", 0),
            "enqueued": self.job.enqueued_at,
            "started": self.job.started_at,
            "ended": self.job.ended_at,
            "exc_info": self.job.exc_info,
        }

    def get_task(self):
        return self.job.kwargs.get("task")

    def get_status(self):
        return self.job.get_status()

    @property
    def is_finished(self):
        return self.get_status() == rq.job.JobStatus.FINISHED

    @property
    def is_queued(self):
        return self.get_status() == rq.job.JobStatus.QUEUED

    @property
    def is_failed(self):
        return self.get_status() == rq.job.JobStatus.FAILED

    @property
    def is_started(self):
        return self.get_status() == rq.job.JobStatus.STARTED

    @property
    def is_deferred(self):
        return self.get_status() == rq.job.JobStatus.DEFERRED

    @property
    def is_scheduled(self):
        return self.get_status() == rq.job.JobStatus.SCHEDULED

    def delete(self):
        self.job.delete()

    # TODO: 에러 해결
    @staticmethod
    def _get_image(db_task, frame, quality):
        if quality is None or quality == "original":
            quality = FrameProvider.Quality.ORIGINAL
        elif quality == "compressed":
            quality = FrameProvider.Quality.COMPRESSED

        frame_provider = FrameProvider(db_task.data)
        image = frame_provider.get_frame(frame, quality=quality)

        return base64.b64encode(image[0].getvalue()).decode("utf-8")

    @staticmethod
    def _call_detector(db_task, labels):
        class Results:
            def __init__(self, task_id):
                self.task_id = task_id
                self.reset()

            def append_shape(self, shape):
                self.data["shapes"].append(shape)

            def submit(self):
                if not self.is_empty():
                    serializer = LabeledDataSerializer(data=self.data)
                    if serializer.is_valid(raise_exception=True):
                        dm.task.patch_task_data(self.task_id, serializer.data, "create")
                    self.reset()

            def is_empty(self):
                return not (
                    self.data["tags"] or self.data["shapes"] or self.data["tracks"]
                )

            def reset(self):
                # TODO: need to make "tags" and "tracks" are optional
                # FIXME: need to provide the correct version here
                self.data = {"version": 0, "tags": [], "shapes": [], "tracks": []}

        results = Results(db_task.id)

        for frame in range(db_task.data.size):
            if frame in db_task.data.deleted_frames:
                continue

            image = LlavaJob._get_image(db_task, frame, quality=None)
            for label_name, label in labels.items():
                points = llava_inference(image, [label_name])
                points = points.get(label_name, [])

                for point in points:
                    shape = {
                        "frame": frame,
                        "label_id": label["id"],
                        "type": ShapeType.RECTANGLE,
                        "occluded": False,
                        "points": point,
                        "z_order": 0,
                        "group": None,
                        "attributes": [],
                        "source": "auto",
                    }

                    results.append_shape(shape)

            progress = (frame + 1) / db_task.data.size
            if not LlavaJob._update_progress(progress):
                break

            # Accumulate data during 100 frames before sumbitting results.
            # It is optimization to make fewer calls to our server. Also
            # it isn't possible to keep all results in memory.
            if frame and frame % 100 == 0:
                results.submit()

        results.submit()

    @staticmethod
    # progress is in [0, 1] range
    def _update_progress(progress):
        job = rq.get_current_job()
        # If the job has been deleted, get_status will return None. Thus it will
        # exist the loop.
        job.meta["progress"] = int(progress * 100)
        job.save_meta()

        return job.get_status()

    @staticmethod
    def __call__(task, cleanup, **kwargs):
        db_task = Task.objects.get(pk=task)
        if cleanup:
            dm.task.delete_task_data(db_task.id)
        db_labels = (
            (db_task.project.label_set if db_task.project_id else db_task.label_set)
            .prefetch_related("attributespec_set")
            .all()
        )
        labels = {}
        for label in db_labels:
            labels[label.name] = {"id": label.id, "attributes": {}}
            for attr in label.attributespec_set.values():
                labels[label.name]["attributes"][attr["name"]] = attr["id"]

        LlavaJob._call_detector(db_task, labels)


# 라바 서버로 이미지 전송, 공유기 설정을 통해 122.38.149.83:5000 -> 192.168.219.151:5000 으로 포트포워딩
def llava_inference(image, labels):
    response = requests.post(
        "http://122.38.149.83:5000/inference", json={"image": image, "labels": labels}
    )
    response = response.json()
    return response.get("bbox", {})
