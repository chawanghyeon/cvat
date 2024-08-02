from typing import Any
import numpy as np
import matplotlib.pyplot as plt
from cvat.apps.engine.models import Label, LabeledShape, Umap

import umap
import os
from cvat.settings.base import DATA_ROOT
import json


def scale_to_01_range(x: np.ndarray):
    value_range = (np.max(x) - np.min(x))
    starts_from_zero = x - np.min(x)

    return starts_from_zero / value_range


def run_umap(features: list[Any]) -> tuple[np.ndarray, np.ndarray]:
    reduction = umap.UMAP().fit_transform(features)

    tx = reduction[:, 0]
    ty = reduction[:, 1]

    return scale_to_01_range(tx), scale_to_01_range(ty)


def get_data(label_id: int):
    annotations = LabeledShape.objects.filter(label_id=label_id, parent=None, encoding__isnull=False).values_list("encoding", "id", "frame", "job_id")

    features = np.array([np.frombuffer(anno[0], dtype=np.float32) for anno in annotations])
    annotation_ids = [[anno[1], anno[2], anno[3]] for anno in annotations]

    return features, annotation_ids


def save_umap(tx: np.ndarray, ty: np.ndarray, label, annotation_ids, name):
    plt.rcParams['axes.unicode_minus'] = False
    fig = plt.figure(figsize=(10, 10))
    ax = fig.add_subplot(111)

    ax.scatter(tx, ty, label=label.name)
    ax.legend(loc='best')

    plt.savefig(name, format='png')

    Umap.objects.create(label=label, tx=tx.tobytes(), ty=ty.tobytes(), annotations=json.dumps(annotation_ids), result_image=name)


def process(label_id: int):
    label = Label.objects.get(id=label_id)
    task = label.task
    project = label.project

    if task:
        path = task.get_dirname()
    elif project:
        path = project.get_dirname()

    name = os.path.join(path, f'{label.name}.png')
    if os.path.exists(name):
        os.remove(name)

    features, annotation_ids = get_data(label_id)
    tx, ty = run_umap(features)

    save_umap(tx, ty, label, annotation_ids, name)
