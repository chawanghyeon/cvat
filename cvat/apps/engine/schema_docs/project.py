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
    DatasetFileSerializer,
    LabeledDataSerializer,
    ProjectFileSerializer,
    ProjectReadSerializer,
    TaskReadSerializer,
)

view = {
    "list": extend_schema(
        summary="Returns a paginated list of projects according to query parameters (12 projects per page)",
        responses={
            "200": PolymorphicProxySerializer(
                component_name="PolymorphicProject",
                serializers=[
                    ProjectReadSerializer,
                ],
                resource_type_field_name=None,
                many=True,
            ),
        },
    ),
    "create": extend_schema(
        summary="Method creates a new project",
        # request=ProjectWriteSerializer,
        responses={
            "201": ProjectReadSerializer,  # check ProjectWriteSerializer.to_representation
        },
    ),
    "retrieve": extend_schema(
        summary="Method returns details of a specific project",
        responses={
            "200": ProjectReadSerializer,
        },
    ),
    "destroy": extend_schema(
        summary="Method deletes a specific project",
        responses={
            "204": OpenApiResponse(description="The project has been deleted"),
        },
    ),
    "partial_update": extend_schema(
        summary="Methods does a partial update of chosen fields in a project",
        # request=ProjectWriteSerializer,
        responses={
            "200": ProjectReadSerializer,  # check ProjectWriteSerializer.to_representation
        },
    ),
}

tasks_GET = {
    "summary": "Method returns information of the tasks of the project with the selected id",
    "responses": {
        "200": TaskReadSerializer(many=True),
    },
}

dataset_GET = {
    "methods": ["GET"],
    "summary": "Export project as a dataset in a specific format",
    "parameters": [
        OpenApiParameter(
            "format",
            description="Desired output format name\n"
            "You can get the list of supported formats at:\n/server/annotation/formats",
            location=OpenApiParameter.QUERY,
            type=OpenApiTypes.STR,
            required=False,
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
            description="Used to start downloading process after annotation file had been created",
            location=OpenApiParameter.QUERY,
            type=OpenApiTypes.STR,
            required=False,
            enum=["download", "import_status"],
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
            description="Use the location that was configured in project to import dataset",
            location=OpenApiParameter.QUERY,
            type=OpenApiTypes.BOOL,
            required=False,
            default=True,
        ),
    ],
    "responses": {
        "200": OpenApiResponse(
            OpenApiTypes.BINARY, description="Download of file started"
        ),
        "201": OpenApiResponse(description="Output file is ready for downloading"),
        "202": OpenApiResponse(description="Exporting has been started"),
        "405": OpenApiResponse(description="Format is not available"),
    },
}

dataset_POST = {
    "methods": ["POST"],
    "summary": "Import dataset in specific format as a project",
    "parameters": [
        OpenApiParameter(
            "format",
            description="Desired dataset format name\n"
            "You can get the list of supported formats at:\n/server/annotation/formats",
            location=OpenApiParameter.QUERY,
            type=OpenApiTypes.STR,
            required=False,
        ),
        OpenApiParameter(
            "location",
            description="Where to import the dataset from",
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
            description="Use the location that was configured in the project to import annotations",
            location=OpenApiParameter.QUERY,
            type=OpenApiTypes.BOOL,
            required=False,
            default=True,
        ),
        OpenApiParameter(
            "filename",
            description="Dataset file name",
            location=OpenApiParameter.QUERY,
            type=OpenApiTypes.STR,
            required=False,
        ),
    ],
    "request": PolymorphicProxySerializer(
        "DatasetWrite",
        serializers=[DatasetFileSerializer, OpenApiTypes.NONE],
        resource_type_field_name=None,
    ),
    "responses": {
        "202": OpenApiResponse(description="Exporting has been started"),
        "400": OpenApiResponse(description="Failed to import dataset"),
        "405": OpenApiResponse(description="Format is not available"),
    },
}

append_dataset_chunk_PATCH = {
    "methods": ["PATCH"],
    "operation_id": "projects_partial_update_dataset_file",
    "summary": "Allows to upload a file chunk. "
    "Implements TUS file uploading protocol.",
    "request": OpenApiTypes.BINARY,
    "responses": {},
}

append_dataset_chunk_HEAD = {
    "methods": ["HEAD"],
    "summary": "Implements TUS file uploading protocol.",
}

annotations_GET = {
    "summary": "Method allows to download project annotations",
    "parameters": [
        OpenApiParameter(
            "format",
            description="Desired output format name\n"
            "You can get the list of supported formats at:\n/server/annotation/formats",
            location=OpenApiParameter.QUERY,
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
            description="Used to start downloading process after annotation file had been created",
            location=OpenApiParameter.QUERY,
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
            description="Use the location that was configured in project to export annotation",
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
        "401": OpenApiResponse(description="Format is not specified"),
        "405": OpenApiResponse(description="Format is not available"),
    },
}

export_backup_GET = {
    "summary": "Methods creates a backup copy of a project",
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
            description="Use the location that was configured in project to export backup",
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

import_backup = {
    "summary": "Methods create a project from a backup",
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
    "request": PolymorphicProxySerializer(
        "BackupWrite",
        serializers=[ProjectFileSerializer, OpenApiTypes.NONE],
        resource_type_field_name=None,
    ),
    "responses": {
        "201": OpenApiResponse(
            description="The project has been imported"
        ),  # or better specify {id: project_id}
        "202": OpenApiResponse(description="Importing a backup file has been started"),
    },
}

append_backup_chunk_PATCH = {
    "methods": ["PATCH"],
    "operation_id": "projects_partial_update_backup_file",
    "summary": "Allows to upload a file chunk. "
    "Implements TUS file uploading protocol.",
    "request": OpenApiTypes.BINARY,
    "responses": {},
}

append_backup_chunk_HEAD = {
    "methods": ["HEAD"],
    "summary": "Implements TUS file uploading protocol.",
}

preview_GET = {
    "summary": "Method returns a preview image for the project",
    "responses": {
        "200": OpenApiResponse(description="Project image preview"),
        "404": OpenApiResponse(description="Project image preview not found"),
    },
}
