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
    IssueReadSerializer,
    JobReadSerializer,
    JobWriteSerializer,
    LabeledDataSerializer,
)

view = {
    "retrieve": extend_schema(
        summary="Method returns details of a job",
        responses={
            "200": JobReadSerializer,
        },
    ),
    "list": extend_schema(
        summary="Method returns a paginated list of jobs according to query parameters",
        responses={
            "200": JobReadSerializer(many=True),
        },
    ),
    "partial_update": extend_schema(
        summary="Methods does a partial update of chosen fields in a job",
        request=JobWriteSerializer,
        responses={
            "200": JobReadSerializer,  # check JobWriteSerializer.to_representation
        },
    ),
}

annotation_GET = {
    "methods": ["GET"],
    "summary": "Method returns annotations for a specific job as a JSON document. "
    "If format is specified, a zip archive is returned.",
    "parameters": [
        OpenApiParameter(
            "format",
            location=OpenApiParameter.QUERY,
            description="Desired output format name\nYou can get the list of supported formats at:\n/server/annotation/formats",
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
            location=OpenApiParameter.QUERY,
            description="Used to start downloading process after annotation file had been created",
            type=OpenApiTypes.STR,
            required=False,
            enum=["download"],
        ),
        OpenApiParameter(
            "location",
            description="Where need to save downloaded annotation",
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
        "201": OpenApiResponse(description="Output file is ready for downloading"),
        "202": OpenApiResponse(description="Exporting has been started"),
        "405": OpenApiResponse(description="Format is not available"),
    },
}

annotation_POST = {
    "methods": ["POST"],
    "summary": "Method allows to upload job annotations",
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
            description="Use the location that was configured in the task to import annotation",
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
    "request": AnnotationFileSerializer,
    "responses": {
        "201": OpenApiResponse(description="Uploading has finished"),
        "202": OpenApiResponse(description="Uploading has been started"),
        "405": OpenApiResponse(description="Format is not available"),
    },
}

annotation_PUT = {
    "methods": ["PUT"],
    "summary": "Method performs an update of all annotations in a specific job",
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
        component_name="JobAnnotationsUpdate",
        serializers=[LabeledDataSerializer, AnnotationFileSerializer],
        resource_type_field_name=None,
    ),
    "responses": {
        "201": OpenApiResponse(description="Uploading has finished"),
        "202": OpenApiResponse(description="Uploading has been started"),
        "405": OpenApiResponse(description="Format is not available"),
    },
}

annotation_PATCH = {
    "methods": ["PATCH"],
    "summary": "Method performs a partial update of annotations in a specific job",
    "parameters": [
        OpenApiParameter(
            "action",
            location=OpenApiParameter.QUERY,
            type=OpenApiTypes.STR,
            required=True,
            enum=["create", "update", "delete"],
        )
    ],
    "request": LabeledDataSerializer,
    "responses": {
        "200": OpenApiResponse(description="Annotations successfully uploaded"),
    },
}

annotation_DELETE = {
    "methods": ["DELETE"],
    "summary": "Method deletes all annotations for a specific job",
    "responses": {
        "204": OpenApiResponse(description="The annotation has been deleted"),
    },
}

append_annotations_chunk_PATCH = {
    "methods": ["PATCH"],
    "operation_id": "jobs_partial_update_annotations_file",
    "summary": "Allows to upload an annotation file chunk. "
    "Implements TUS file uploading protocol.",
    "request": OpenApiTypes.BINARY,
    "responses": {},
}

append_annotations_chunk_HEAD = {
    "methods": ["HEAD"],
    "summary": "Implements TUS file uploading protocol.",
}

dataset_export_GET = {
    "summary": "Export job as a dataset in a specific format",
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
            description="Use the location that was configured in the task to export dataset",
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
        "405": OpenApiResponse(description="Format is not available"),
    },
}

issues_GET = {
    "summary": "Method returns list of issues for the job",
    "responses": IssueReadSerializer(many=True),
}

data_GET = {
    "summary": "Method returns data for a specific job",
    "parameters": [
        OpenApiParameter(
            "type",
            description="Specifies the type of the requested data",
            location=OpenApiParameter.QUERY,
            required=False,
            type=OpenApiTypes.STR,
            enum=["chunk", "frame", "context_image"],
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
        "200": OpenApiResponse(
            OpenApiTypes.BINARY, description="Data of a specific type"
        ),
    },
}

metadata_GET = {
    "summary": "Method provides a meta information about media files which are related with the job",
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
    "tags": ["tasks"],
    "versions": ["2.0"],
}

preview_GET = {
    "summary": "Method returns a preview image for the job",
    "parameters": [
        OpenApiParameter(
            "frame_id",
            description="frame id 기준으로 preview 노출",
            location=OpenApiParameter.QUERY,
            required=False,
            type=OpenApiTypes.INT,
        ),
    ],
    "responses": {
        "200": OpenApiResponse(description="Job image preview"),
    },
}
