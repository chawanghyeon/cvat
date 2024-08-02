import os
import random
import shutil
from io import BytesIO
import logging
from django.contrib.auth.models import Group, User
from PIL import Image
from rest_framework import status
from rest_framework.test import APIClient, APITestCase
import django_rq
from django.conf import settings
from cvat.apps.engine.models import (AttributeSpec, Job, LabeledShape, Project,
    Segment, Task, Label)
from cvat.apps.engine.serializers import UmapSerializer
from cvat.apps.engine.tests.utils import get_paginated_collection
from cvat.apps.organizations.models import Organization, Membership, Invitation
from django.utils.crypto import get_random_string
from allauth.account.models import EmailAddress

from cvat.utils.encoding import encode_image
#supress av warnings
logging.getLogger('libav').setLevel(logging.ERROR)


def create_users(cls):
    # make admin
    (group_admin, _) = Group.objects.get_or_create(name="admin")
    user_admin = User.objects.create_superuser(username="admin", password="admin", email="admin@admin.com")
    user_admin.groups.add(group_admin)

    # make maintainer
    (group_maintainer, _) = Group.objects.get_or_create(name="maintainer")
    user_maintainer = User.objects.create_user(username="maintainer", password="maintainer", email="maintainer@maintainer.com")
    user_maintainer.groups.add(group_maintainer)

    # make workers
    (group_worker, _) = Group.objects.get_or_create(name="worker")
    user_worker1 = User.objects.create_user(username="worker1", password="worker1", email="worker1@worker.com")
    user_worker1.groups.add(group_worker)
    user_worker2 = User.objects.create_user(username="worker2", password="worker2", email="worker2@worker.com")
    user_worker2.groups.add(group_worker)

    cls.admin = user_admin
    cls.maintainer = user_maintainer
    cls.worker1 = user_worker1
    cls.worker2 = user_worker2


def invite_user(user, organization, role):
    EmailAddress.objects.create(
        user=user,
        email=user.email,
        verified=True,
        primary=True,
    )
    membership = Membership.objects.create(
        user=user,
        organization=organization,
        is_active=True,
        joined_date=organization.created_date,
        role=role,
    )
    Invitation.objects.create(
        key=get_random_string(64),
        owner=organization.owner,
        membership=membership,
    )


def create_organizations(cls):
    data = {
        "slug": "myorg",
        "name": "my organization",
        "owner": cls.admin,
    }
    organization = Organization.objects.create(**data)

    invite_user(cls.maintainer, organization, "maintainer")
    invite_user(cls.worker1, organization, "worker")
    invite_user(cls.worker2, organization, "worker")

    cls.organization = organization


def create_db_task(data):
    db_task = Task.objects.create(**data)
    shutil.rmtree(db_task.get_dirname(), ignore_errors=True)
    os.makedirs(db_task.get_dirname())
    os.makedirs(db_task.get_task_logs_dirname())
    os.makedirs(db_task.get_task_artifacts_dirname())
    db_task.save()

    return db_task

def create_db_project(data):
    organization = Organization.objects.get(slug="myorg")
    data["organization"] = organization
    labels = data.pop('labels', None)
    db_project = Project.objects.create(**data)
    shutil.rmtree(db_project.get_dirname(), ignore_errors=True)
    os.makedirs(db_project.get_dirname())
    os.makedirs(db_project.get_project_logs_dirname())

    if not labels is None:
        for label_data in labels:
            attributes = label_data.pop('attributes', None)
            db_label = Label(project=db_project, **label_data)
            db_label.save()

            if not attributes is None:
                for attribute_data in attributes:
                    db_attribute = AttributeSpec(label=db_label, **attribute_data)
                    db_attribute.save()

    return db_project


def create_dummy_project_and_task(obj):
    data = {
        "name": "super project",
        "owner": obj.admin,
        "assignee": obj.maintainer,
        "labels": [{"name": "car"}]
    }
    project = create_db_project(data)
    data = {
        "name": "my task #1",
        "owner_id": obj.admin.id,
        "assignee_id": obj.maintainer.id,
        "overlap": 0,
        "segment_size": 100,
        "project": project,
    }
    task = create_db_task(data)

    return project, task


class ForceLogin:
    def __init__(self, user, client):
        self.user = user
        self.client = client

    def __enter__(self):
        if self.user:
            self.client.force_login(self.user, backend='django.contrib.auth.backends.ModelBackend')

        return self

    def __exit__(self, exception_type, exception_value, traceback):
        if self.user:
            self.client.logout()


def generate_image_file(filename):
    f = BytesIO()
    gen = random.SystemRandom()
    width = gen.randint(100, 800)
    height = gen.randint(100, 800)
    image = Image.new('RGB', size=(width, height))
    image.save(f, 'jpeg')
    f.name = filename
    f.seek(0)

    return (width, height), f


class JobAnnotationAPITestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()

    @classmethod
    def setUpTestData(cls):
        create_users(cls)
        create_organizations(cls)

    def _init_data(self, owner):
        _, task = create_dummy_project_and_task(self)

        with ForceLogin(owner, self.client):
            tid = task.id

            images = {
                "client_files[0]": generate_image_file("test_1.jpg")[1],
                "client_files[1]": generate_image_file("test_2.jpg")[1],
                "client_files[2]": generate_image_file("test_3.jpg")[1],
                "client_files[4]": generate_image_file("test_4.jpg")[1],
                "client_files[5]": generate_image_file("test_5.jpg")[1],
                "client_files[6]": generate_image_file("test_6.jpg")[1],
                "client_files[7]": generate_image_file("test_7.jpg")[1],
                "client_files[8]": generate_image_file("test_8.jpg")[1],
                "client_files[9]": generate_image_file("test_9.jpg")[1],
                "image_quality": 75,
                "frame_filter": "step=3",
            }

            response = self.client.post("/api/tasks/{}/data".format(tid), data=images)
            assert response.status_code == status.HTTP_202_ACCEPTED

            db_data = None
            while db_data is None:
                try:
                    db_data = Task.objects.get(id=tid).data
                except Exception as e:
                    pass

            task = Task.objects.get(id=tid)

            for x in range(0, db_data.size, task.segment_size):
                start_frame = x
                stop_frame = min(x + task.segment_size - 1, db_data.size - 1)

                db_segment = Segment()
                db_segment.task = task
                db_segment.start_frame = start_frame
                db_segment.stop_frame = stop_frame
                db_segment.save()

                db_job = Job()
                db_job.segment = db_segment
                db_job.save()

            task.refresh_from_db()
            job = Job.objects.filter(segment__task=task).first()

        return (task, job)

    def _get_api_v2_organization_umap(self, user, label_id):
        with ForceLogin(user, self.client):
            response = self.client.get(f"/api/organizations/umap/{label_id}?org={self.organization.slug}")

        return response

    def _patch_api_v2_jobs_id_data(self, jid, user, action, data):
        with ForceLogin(user, self.client):
            response = self.client.patch(
                "/api/jobs/{}/annotations?action={}".format(jid, action),
                data=data, format="json")

        return response

    def test_api_v2_jobs_id_annotations_to_check_encoding(self):
        task, job = self._init_data(self.admin)
        label_id = Label.objects.filter(project=task.project).first().id

        data = {
            "version": 1,
            "tags": [],
            "shapes": [
                {
                    "frame": 0,
                    "label_id": label_id,
                    "group": None,
                    "source": "manual",
                    "points": [1.0, 2.1, 100, 300.222],
                    "type": "rectangle",
                    "occluded": False
                },
                {
                    "frame": 2,
                    "label_id": label_id,
                    "group": None,
                    "source": "manual",
                    "attributes": [],
                    "points": [2.0, 2.1, 100, 300.222, 400, 500, 1, 3],
                    "type": "polygon",
                    "occluded": False
                },
            ],
            "tracks": []
        }

        response = self._patch_api_v2_jobs_id_data(job.id, self.admin, "create", data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        annotations = LabeledShape.objects.filter(job=job, type__in=["rectangle", "mask"])
        queue = django_rq.get_queue(settings.CVAT_QUEUES.ENCODE.value)
        for annotation in annotations:
            job_id = job.id
            rq_id = f"encode:job.id{job_id}-annotation.id{annotation.id}"
            rq_job = queue.fetch_job(rq_id)

            while rq_job is None or rq_job.is_finished is False:
                rq_job = queue.fetch_job(rq_id)

            annotation.refresh_from_db()
            self.assertIsNotNone(annotation.encoding)

    def test_api_v2_organizations_umap(self):
        task, job = self._init_data(self.admin)
        job_id = job.id
        task_id = task.id
        label_id = Label.objects.filter(project=task.project).first().id
        queue = django_rq.get_queue(settings.CVAT_QUEUES.ENCODE.value)

        for i in range(20):
            annotation = LabeledShape.objects.create(
                job_id=job_id,
                frame=0,
                label_id=label_id,
                group=None,
                source="manual",
                points=[1.0 * float(i), 2.1 * float(i), 100, 300.222],
                type="rectangle",
                occluded=False
            )
            rq_id = f"encode:job.id{job_id}-annotation.id{annotation.id}"
            queue.enqueue_call(
                func=encode_image,
                args=(annotation.id, task_id),
                job_id=rq_id,
                result_ttl=500,
                failure_ttl=500
            )
        response = self._get_api_v2_organization_umap(self.admin, label_id)
        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
        while response.status_code == status.HTTP_202_ACCEPTED:
            response = self._get_api_v2_organization_umap(self.admin, label_id)

        if response.status_code == status.HTTP_200_OK:
            serializer = UmapSerializer(data=response.data)
            self.assertTrue(serializer.is_valid())

        response = self._get_api_v2_organization_umap(self.worker1, label_id)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
