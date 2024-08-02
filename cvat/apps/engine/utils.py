import ast
import math
import cv2 as cv
from collections import namedtuple
import hashlib
import importlib
import sys
import traceback
import subprocess
import os
import urllib.parse
from django.utils import timezone

from av import VideoFrame
from PIL import Image

from django.core.exceptions import ValidationError
import numpy as np

Import = namedtuple("Import", ["module", "name", "alias"])

def parse_imports(source_code: str):
    root = ast.parse(source_code)

    for node in ast.iter_child_nodes(root):
        if isinstance(node, ast.Import):
            module = []
        elif isinstance(node, ast.ImportFrom):
            module = node.module
        else:
            continue

        for n in node.names:
            yield Import(module, n.name, n.asname)

def import_modules(source_code: str):
    results = {}
    imports = parse_imports(source_code)
    for import_ in imports:
        module = import_.module if import_.module else import_.name
        loaded_module = importlib.import_module(module)

        if not import_.name == module:
            loaded_module = getattr(loaded_module, import_.name)

        if import_.alias:
            results[import_.alias] = loaded_module
        else:
            results[import_.name] = loaded_module

    return results

class InterpreterError(Exception):
    pass

def execute_python_code(source_code, global_vars=None, local_vars=None):
    try:
        # pylint: disable=exec-used
        exec(source_code, global_vars, local_vars)
    except SyntaxError as err:
        error_class = err.__class__.__name__
        details = err.args[0]
        line_number = err.lineno
        raise InterpreterError("{} at line {}: {}".format(error_class, line_number, details))
    except AssertionError as err:
        # AssertionError doesn't contain any args and line number
        error_class = err.__class__.__name__
        raise InterpreterError("{}".format(error_class))
    except Exception as err:
        error_class = err.__class__.__name__
        details = err.args[0]
        _, _, tb = sys.exc_info()
        line_number = traceback.extract_tb(tb)[-1][1]
        raise InterpreterError("{} at line {}: {}".format(error_class, line_number, details))

def av_scan_paths(*paths):
    if 'yes' == os.environ.get('CLAM_AV'):
        command = ['clamscan', '--no-summary', '-i', '-o']
        command.extend(paths)
        res = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE) # nosec
        if res.returncode:
            raise ValidationError(res.stdout)

def rotate_image(image, angle):
    height, width = image.shape[:2]
    image_center = (width/2, height/2)
    matrix = cv.getRotationMatrix2D(image_center, angle, 1.)
    abs_cos = abs(matrix[0,0])
    abs_sin = abs(matrix[0,1])
    bound_w = int(height * abs_sin + width * abs_cos)
    bound_h = int(height * abs_cos + width * abs_sin)
    matrix[0, 2] += bound_w/2 - image_center[0]
    matrix[1, 2] += bound_h/2 - image_center[1]
    matrix = cv.warpAffine(image, matrix, (bound_w, bound_h))
    return matrix

def md5_hash(frame):
    if isinstance(frame, VideoFrame):
        frame = frame.to_image()
    elif isinstance(frame, str):
        frame = Image.open(frame, 'r')
    return hashlib.md5(frame.tobytes()).hexdigest() # nosec

def parse_specific_attributes(specific_attributes):
    assert isinstance(specific_attributes, str), 'Specific attributes must be a string'
    parsed_specific_attributes = urllib.parse.parse_qsl(specific_attributes)
    return {
        key: value for (key, value) in parsed_specific_attributes
    } if parsed_specific_attributes else dict()


def parse_exception_message(msg):
    parsed_msg = msg
    try:
        if 'ErrorDetail' in msg:
            # msg like: 'rest_framework.exceptions.ValidationError:
            # [ErrorDetail(string="...", code=\'invalid\')]\n'
            parsed_msg = msg.split('string=')[1].split(', code=')[0].strip("\"")
        elif msg.startswith('rest_framework.exceptions.'):
            parsed_msg = msg.split(':')[1].strip()
    except Exception: # nosec
        pass
    return parsed_msg

def process_failed_job(rq_job):
    if os.path.exists(rq_job.meta['tmp_file']):
        os.remove(rq_job.meta['tmp_file'])
    exc_info = str(rq_job.exc_info or rq_job.dependency.exc_info)
    if rq_job.dependency:
        rq_job.dependency.delete()
    rq_job.delete()

    return parse_exception_message(exc_info)

def configure_dependent_job(queue, rq_id, rq_func, db_storage, filename, key, request):
    rq_job_id_download_file = rq_id + f'?action=download_{filename}'
    rq_job_download_file = queue.fetch_job(rq_job_id_download_file)
    if not rq_job_download_file:
        # note: boto3 resource isn't pickleable, so we can't use storage
        rq_job_download_file = queue.enqueue_call(
            func=rq_func,
            args=(db_storage, filename, key),
            job_id=rq_job_id_download_file,
            meta=get_rq_job_meta(request=request, db_obj=db_storage),
        )
    return rq_job_download_file

def get_rq_job_meta(request, db_obj):
    # to prevent circular import
    from cvat.apps.webhooks.signals import project_id, organization_id
    from cvat.apps.events.handlers import task_id, job_id, organization_slug

    oid = organization_id(db_obj)
    oslug = organization_slug(db_obj)
    pid = project_id(db_obj)
    tid = task_id(db_obj)
    jid = job_id(db_obj)

    return {
        'user': {
            'id': getattr(request.user, "id", None),
            'username': getattr(request.user, "username", None),
            'email': getattr(request.user, "email", None),
        },
        'request': {
            "uuid": request.uuid,
            "timestamp": timezone.localtime(),
        },
        'org_id': oid,
        'org_slug': oslug,
        'project_id': pid,
        'task_id': tid,
        'job_id': jid,
    }


# mask validation을 위한 함수들
def mask2Rle(mask):
    rle = []

    if mask[0] > 0:
        rle.extend([0, 1])
    else:
        rle.append(1)

    for i in range(1, len(mask)):
        if mask[i - 1] == mask[i]:
            rle[-1] += 1
        else:
            rle.append(1)

    return rle


def rle2mask(rle: list[int], width: int, height: int) -> np.ndarray:
    decoded = np.zeros((width * height), dtype=np.uint8)
    cumsum = np.cumsum(rle)

    for i in range(1, len(rle), 2):
        decoded[cumsum[i-1]:cumsum[i]] = 1

    return decoded.reshape((height, width))


def crop_mask(points: list[int], width: int, height: int) -> list[int]:
    rle = points[:-4]
    left, top, right, bottom = list(math.trunc(v) for v in points[-4:])
    should_fix = False

    # 왼쪽 오른쪽 이미지 범위 체크
    for point in left, right:
        if point < 0 or point >= width:
            should_fix = True

    # 위 아래 이미지 범위 체크
    for point in top, bottom:
        if point < 0 or point >= height:
            should_fix = True

    if not should_fix:
        return points

    # 이미지 범위 안에 있도록 수정
    new_left = min(max(0, left), width - 1)
    new_top = min(max(0, top), height - 1)
    new_right = max(min(width - 1, right), 0)
    new_bottom = max(min(height - 1, bottom), 0)

    # 원래의 마스크 크기
    mask_width = right - left + 1
    mask_height = bottom - top + 1
    mask = rle2mask(rle, mask_width, mask_height)

    # 새로운 마스크와 원래 마스크의 차이
    left_gap = abs(new_left - left)
    top_gap = abs(new_top - top)
    right_gap = abs(new_right - right)
    bottom_gap = abs(new_bottom - bottom)

    # 새로운 마스크의 범위
    new_width_start = max(0, left_gap)
    new_width_end = mask_width - right_gap
    new_height_start = max(0, top_gap)
    new_height_end = mask_height - bottom_gap

    # 새로운 마스크의 범위로 자르기
    mask = mask[new_height_start:new_height_end, new_width_start:new_width_end]

    # RLE 인코딩
    rle = mask2Rle(mask.flatten())

    # 새로운 좌표로 추가
    rle.extend([new_left, new_top, new_right, new_bottom])

    return rle
