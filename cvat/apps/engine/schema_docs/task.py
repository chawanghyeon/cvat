"""This module contains documentation for the API of the CVAT engine.

Variable naming convention:
    * view
    * <Method>_<Type>
"""
from drf_spectacular.utils import (
    OpenApiParameter,
    OpenApiResponse,
    OpenApiTypes,
    PolymorphicProxySerializer,
    extend_schema,
)

from cvat.apps.engine.models import Location
from cvat.apps.engine.serializers import (
    AnnotationFileSerializer,
    DataMetaReadSerializer,
    DataMetaWriteSerializer,
    DataSerializer,
    JobReadSerializer,
    LabeledDataSerializer,
    RqStatusSerializer,
    TaskFileSerializer,
    TaskReadSerializer,
    TaskWriteSerializer,
)

view = {
    "list": extend_schema(
        summary="Returns a paginated list of tasks according to query parameters (10 tasks per page)",
        responses={
            "200": TaskReadSerializer(many=True),
        },
    ),
    "create": extend_schema(
        summary="Method creates a new task in a database without any attached images and videos",
        request=TaskWriteSerializer,
        responses={
            "201": TaskReadSerializer,  # check TaskWriteSerializer.to_representation
        },
    ),
    "retrieve": extend_schema(
        summary="Method returns details of a specific task",
        responses={"200": TaskReadSerializer},
    ),
    "destroy": extend_schema(
        summary="Method deletes a specific task, all attached jobs, annotations, and data",
        responses={
            "204": OpenApiResponse(description="The task has been deleted"),
        },
    ),
    "partial_update": extend_schema(
        summary="Methods does a partial update of chosen fields in a task",
        request=TaskWriteSerializer(partial=True),
        responses={
            "200": TaskReadSerializer,  # check TaskWriteSerializer.to_representation
        },
    ),
}

import_backup = {
    "summary": "Method recreates a task from an attached task backup file",
    "parameters": [
        OpenApiParameter(
            "location",
            description="Where to import the backup file from",
            location=OpenApiParameter.QUERY,
            type=OpenApiTypes.STR,
            required=False,
            enum=Location.list(),
            default=Location.LOCAL,
        ),
        OpenApiParameter(
            "cloud_storage_id",
            description="Storage id",
            location=OpenApiParameter.QUERY,
            type=OpenApiTypes.NUMBER,
            required=False,
        ),
        OpenApiParameter(
            "filename",
            description="Backup file name",
            location=OpenApiParameter.QUERY,
            type=OpenApiTypes.STR,
            required=False,
        ),
    ],
    "request": TaskFileSerializer(required=False),
    "responses": {
        "201": OpenApiResponse(
            description="The task has been imported"
        ),  # or better specify {id: task_id}
        "202": OpenApiResponse(description="Importing a backup file has been started"),
    },
}

append_backup_chunk_PATCH = {
    "methods": ["PATCH"],
    "operation_id": "tasks_partial_update_backup_file",
    "summary": "Allows to upload a file chunk. "
    "Implements TUS file uploading protocol.",
    "request": OpenApiTypes.BINARY,
    "responses": {},
}

append_backup_chunk_HEAD = {
    "methods": ["HEAD"],
    "summary": "Implements TUS file uploading protocol.",
}

export_backup_GET = {
    "summary": "Method backup a specified task",
    "parameters": [
        OpenApiParameter(
            "action",
            location=OpenApiParameter.QUERY,
            description="Used to start downloading process after backup file had been created",
            type=OpenApiTypes.STR,
            required=False,
            enum=["download"],
        ),
        OpenApiParameter(
            "filename",
            description="Backup file name",
            location=OpenApiParameter.QUERY,
            type=OpenApiTypes.STR,
            required=False,
        ),
        OpenApiParameter(
            "location",
            description="Where need to save downloaded backup",
            location=OpenApiParameter.QUERY,
            type=OpenApiTypes.STR,
            required=False,
            enum=Location.list(),
        ),
        OpenApiParameter(
            "cloud_storage_id",
            description="Storage id",
            location=OpenApiParameter.QUERY,
            type=OpenApiTypes.NUMBER,
            required=False,
        ),
        OpenApiParameter(
            "use_default_location",
            description="Use the location that was configured in the task to export backup",
            location=OpenApiParameter.QUERY,
            type=OpenApiTypes.BOOL,
            required=False,
            default=True,
        ),
    ],
    "responses": {
        "200": OpenApiResponse(description="Download of file started"),
        "201": OpenApiResponse(
            description="Output backup file is ready for downloading"
        ),
        "202": OpenApiResponse(description="Creating a backup file has been started"),
    },
}

jobs_GET = {
    "summary": "Method returns a list of jobs for a specific task",
    "responses": JobReadSerializer(many=True),
}

data_POST = {
    "methods": ["POST"],
    "summary": "Method permanently attaches images or video to a task. Supports tus uploads, see more https://tus.io/",
    "request": DataSerializer,
    "parameters": [
        OpenApiParameter(
            "Upload-Start",
            location=OpenApiParameter.HEADER,
            type=OpenApiTypes.BOOL,
            description="Initializes data upload. No data should be sent with this header",
        ),
        OpenApiParameter(
            "Upload-Multiple",
            location=OpenApiParameter.HEADER,
            type=OpenApiTypes.BOOL,
            description="Indicates that data with this request are single or multiple files that should be attached to a task",
        ),
        OpenApiParameter(
            "Upload-Finish",
            location=OpenApiParameter.HEADER,
            type=OpenApiTypes.BOOL,
            description="Finishes data upload. Can be combined with Upload-Start header to create task data with one request",
        ),
    ],
    "responses": {
        "202": OpenApiResponse(description=""),
    },
}

data_GET = {
    "methods": ["GET"],
    "summary": "Method returns data for a specific task",
    "parameters": [
        OpenApiParameter(
            "type",
            location=OpenApiParameter.QUERY,
            required=False,
            type=OpenApiTypes.STR,
            enum=["chunk", "frame", "context_image"],
            description="Specifies the type of the requested data",
        ),
        OpenApiParameter(
            "quality",
            location=OpenApiParameter.QUERY,
            required=False,
            type=OpenApiTypes.STR,
            enum=["compressed", "original"],
            description="Specifies the quality level of the requested data",
        ),
        OpenApiParameter(
            "number",
            location=OpenApiParameter.QUERY,
            required=False,
            type=OpenApiTypes.INT,
            description="A unique number value identifying chunk or frame",
        ),
    ],
    "responses": {
        "200": OpenApiResponse(description="Data of a specific type"),
    },
}

worker_GET = {
    "methods": ["GET"],
    "summary": "Method returns data for a tasks",
    "parameters": [
        OpenApiParameter(
            "worker_name",
            location=OpenApiParameter.QUERY,
            required=False,
            type=OpenApiTypes.STR,
            description="Specifies the worker name of the requested data",
        ),
    ],
    "responses": {
        "200": OpenApiResponse(description="Data of a specific type"),
    },
}

append_data_chunk_PATCH = {
    "methods": ["PATCH"],
    "operation_id": "tasks_partial_update_data_file",
    "summary": "Allows to upload a file chunk. "
    "Implements TUS file uploading protocol.",
    "request": OpenApiTypes.BINARY,
    "responses": {},
}

append_data_chunk_HEAD = {
    "methods": ["HEAD"],
    "summary": "Implements TUS file uploading protocol.",
}

annotations_GET = {
    "methods": ["GET"],
    "summary": "Method allows to download task annotations",
    "parameters": [
        OpenApiParameter(
            "format",
            location=OpenApiParameter.QUERY,
            type=OpenApiTypes.STR,
            required=False,
            description="Desired output format name\nYou can get the list of supported formats at:\n/server/annotation/formats",
        ),
        OpenApiParameter(
            "filename",
            description="Desired output file name",
            location=OpenApiParameter.QUERY,
            type=OpenApiTypes.STR,
            required=False,
        ),
        OpenApiParameter(
            "action",
            location=OpenApiParameter.QUERY,
            description="Used to start downloading process after annotation file had been created",
            type=OpenApiTypes.STR,
            required=False,
            enum=["download"],
        ),
        OpenApiParameter(
            "location",
            description="Where need to save downloaded dataset",
            location=OpenApiParameter.QUERY,
            type=OpenApiTypes.STR,
            required=False,
            enum=Location.list(),
        ),
        OpenApiParameter(
            "cloud_storage_id",
            description="Storage id",
            location=OpenApiParameter.QUERY,
            type=OpenApiTypes.NUMBER,
            required=False,
        ),
        OpenApiParameter(
            "use_default_location",
            description="Use the location that was configured in the task to export annotation",
            location=OpenApiParameter.QUERY,
            type=OpenApiTypes.BOOL,
            required=False,
            default=True,
        ),
    ],
    "responses": {
        "200": OpenApiResponse(
            PolymorphicProxySerializer(
                component_name="AnnotationsRead",
                serializers=[LabeledDataSerializer, OpenApiTypes.BINARY],
                resource_type_field_name=None,
            ),
            description="Download of file started",
        ),
        "201": OpenApiResponse(description="Annotations file is ready to download"),
        "202": OpenApiResponse(description="Dump of annotations has been started"),
        "400": OpenApiResponse(description="Exporting without data is not allowed"),
        "405": OpenApiResponse(description="Format is not available"),
    },
}

annotations_PUT = {
    "methods": ["PUT"],
    "summary": "Method allows to upload task annotations",
    "parameters": [
        OpenApiParameter(
            "format",
            location=OpenApiParameter.QUERY,
            type=OpenApiTypes.STR,
            required=False,
            description="Input format name\nYou can get the list of supported formats at:\n/server/annotation/formats",
        ),
    ],
    "request": PolymorphicProxySerializer(
        "TaskAnnotationsUpdate",
        serializers=[
            LabeledDataSerializer,
            AnnotationFileSerializer,
            OpenApiTypes.NONE,
        ],
        resource_type_field_name=None,
    ),
    "responses": {
        "201": OpenApiResponse(description="Uploading has finished"),
        "202": OpenApiResponse(description="Uploading has been started"),
        "405": OpenApiResponse(description="Format is not available"),
    },
}

annotations_POST = {
    "methods": ["POST"],
    "summary": "Method allows to upload task annotations from a local file or a cloud storage",
    "parameters": [
        OpenApiParameter(
            "format",
            location=OpenApiParameter.QUERY,
            type=OpenApiTypes.STR,
            required=False,
            description="Input format name\nYou can get the list of supported formats at:\n/server/annotation/formats",
        ),
        OpenApiParameter(
            "location",
            description="where to import the annotation from",
            location=OpenApiParameter.QUERY,
            type=OpenApiTypes.STR,
            required=False,
            enum=Location.list(),
        ),
        OpenApiParameter(
            "cloud_storage_id",
            description="Storage id",
            location=OpenApiParameter.QUERY,
            type=OpenApiTypes.NUMBER,
            required=False,
        ),
        OpenApiParameter(
            "use_default_location",
            description="Use the location that was configured in task to import annotations",
            location=OpenApiParameter.QUERY,
            type=OpenApiTypes.BOOL,
            required=False,
            default=True,
        ),
        OpenApiParameter(
            "filename",
            description="Annotation file name",
            location=OpenApiParameter.QUERY,
            type=OpenApiTypes.STR,
            required=False,
        ),
    ],
    "request": PolymorphicProxySerializer(
        "TaskAnnotationsWrite",
        serializers=[AnnotationFileSerializer, OpenApiTypes.NONE],
        resource_type_field_name=None,
    ),
    "responses": {
        "201": OpenApiResponse(description="Uploading has finished"),
        "202": OpenApiResponse(description="Uploading has been started"),
        "405": OpenApiResponse(description="Format is not available"),
    },
}

annotations_PATCH = {
    "methods": ["PATCH"],
    "summary": "Method performs a partial update of annotations in a specific task",
    "parameters": [
        OpenApiParameter(
            "action",
            location=OpenApiParameter.QUERY,
            required=True,
            type=OpenApiTypes.STR,
            enum=["create", "update", "delete"],
        ),
    ],
    "request": LabeledDataSerializer,
    "responses": {
        "200": LabeledDataSerializer,
    },
}

annotations_DELETE = {
    "methods": ["DELETE"],
    "summary": "Method deletes all annotations for a specific task",
    "responses": {
        "204": OpenApiResponse(description="The annotation has been deleted"),
    },
}

append_annotations_chunk_PATCH = {
    "methods": ["PATCH"],
    "operation_id": "tasks_partial_update_annotations_file",
    "summary": "Allows to upload an annotation file chunk. "
    "Implements TUS file uploading protocol.",
    "request": OpenApiTypes.BINARY,
    "responses": {},
}

append_annotations_chunk_HEAD = {
    "methods": ["HEAD"],
    "operation_id": "tasks_annotations_file_retrieve_status",
    "summary": "Implements TUS file uploading protocol.",
}

status_GET = {
    "summary": "When task is being created the method returns information about a status of the creation process",
    "responses": {
        "200": RqStatusSerializer,
    },
}

metadata_GET = {
    "summary": "Method provides a meta information about media files which are related with the task",
    "responses": {
        "200": DataMetaReadSerializer,
    },
}

metadata_PATCH = {
    "methods": ["PATCH"],
    "summary": "Method performs an update of data meta fields (deleted frames)",
    "request": DataMetaWriteSerializer,
    "responses": {
        "200": DataMetaReadSerializer,
    },
}

dataset_export_GET = {
    "summary": "Export task as a dataset in a specific format",
    "parameters": [
        OpenApiParameter(
            "format",
            location=OpenApiParameter.QUERY,
            description="Desired output format name\nYou can get the list of supported formats at:\n/server/annotation/formats",
            type=OpenApiTypes.STR,
            required=True,
        ),
        OpenApiParameter(
            "filename",
            description="Desired output file name",
            location=OpenApiParameter.QUERY,
            type=OpenApiTypes.STR,
            required=False,
        ),
        OpenApiParameter(
            "action",
            location=OpenApiParameter.QUERY,
            description="Used to start downloading process after annotation file had been created",
            type=OpenApiTypes.STR,
            required=False,
            enum=["download"],
        ),
        OpenApiParameter(
            "use_default_location",
            description="Use the location that was configured in task to export annotations",
            location=OpenApiParameter.QUERY,
            type=OpenApiTypes.BOOL,
            required=False,
            default=True,
        ),
        OpenApiParameter(
            "location",
            description="Where need to save downloaded dataset",
            location=OpenApiParameter.QUERY,
            type=OpenApiTypes.STR,
            required=False,
            enum=Location.list(),
        ),
        OpenApiParameter(
            "cloud_storage_id",
            description="Storage id",
            location=OpenApiParameter.QUERY,
            type=OpenApiTypes.NUMBER,
            required=False,
        ),
    ],
    "responses": {
        "200": OpenApiResponse(
            OpenApiTypes.BINARY, description="Download of file started"
        ),
        "201": OpenApiResponse(description="Output file is ready for downloading"),
        "202": OpenApiResponse(description="Exporting has been started"),
        "400": OpenApiResponse(description="Exporting without data is not allowed"),
        "405": OpenApiResponse(description="Format is not available"),
    },
}

preview_GET = {
    "summary": "Method returns a preview image for the task",
    "responses": {
        "200": OpenApiResponse(description="Task image preview"),
        "404": OpenApiResponse(description="Task image preview not found"),
    },
}
