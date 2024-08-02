import os
import math
import numpy as np

import onnxruntime as ort

from cvat.utils.singleton import SingletonMeta
from cvat.settings.base import MODEL_PATH
from cvat.apps.engine.models import LabeledShape, Task
from PIL import Image as PILImage


class Model(metaclass=SingletonMeta):
    def __init__(self, model_path: str) -> None:
        self.model = ort.InferenceSession(model_path)

    def _crop_image(self, image_path: str, points: list[int]) -> PILImage:
        pil_image = PILImage.open(image_path).convert('RGB')
        return pil_image.crop(points)

    def _encode_image(self, image: PILImage) -> bytes:
        image = image.resize((224, 224), 2)
        image = np.array(image, dtype=np.float32) / 255.0
        image = np.transpose(image, (2, 0, 1))
        image = np.expand_dims(image, axis=0)
        ort_inputs = {self.model.get_inputs()[0].name: image}
        ort_output = np.array(self.model.run(None, ort_inputs))[0]

        return ort_output.tobytes()

    def run(self, annotation_id: int, task_id: int):
        task = Task.objects.get(id=task_id)

        if task.dimension == '3d':
            return

        annotation = LabeledShape.objects.get(id=annotation_id)

        if annotation.encoding:
            return

        if annotation.type == 'mask':
            points = list(math.trunc(v) for v in annotation.points[-4:])
        elif annotation.type == 'rectangle':
            points = annotation.points
        else:
            return

        data = task.data
        image = data.images.filter(frame=annotation.frame).first()

        image_path = os.path.join(data.get_upload_dirname(), image.path)
        cropped_image = self._crop_image(image_path, points)

        annotation.encoding = self._encode_image(cropped_image)
        annotation.save()


def encode_image(annotation_id: int, task_id: int):
    model = Model(MODEL_PATH)
    try:
        model.run(annotation_id, task_id)
    except Exception as e:
        print(e, annotation_id, task_id)
        return
