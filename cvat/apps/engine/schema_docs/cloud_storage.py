"""This module contains documentation for the API of the CVAT engine.

Variable naming convention:
    * view
    * <Method>_<Type>
"""
from drf_spectacular.plumbing import build_array_type, build_basic_type
from drf_spectacular.utils import (
    OpenApiParameter,
    OpenApiResponse,
    OpenApiTypes,
    extend_schema,
)

from cvat.apps.engine.serializers import (
    CloudStorageReadSerializer,
    CloudStorageWriteSerializer,
)

view = {
    "retrieve": extend_schema(
        summary="Method returns details of a specific cloud storage",
        responses={
            "200": CloudStorageReadSerializer,
        },
    ),
    "list": extend_schema(
        summary="Returns a paginated list of storages according to query parameters",
        responses={
            "200": CloudStorageReadSerializer(many=True),
        },
    ),
    "destroy": extend_schema(
        summary="Method deletes a specific cloud storage",
        responses={
            "204": OpenApiResponse(description="The cloud storage has been removed"),
        },
    ),
    "partial_update": extend_schema(
        summary="Methods does a partial update of chosen fields in a cloud storage instance",
        request=CloudStorageWriteSerializer,
        responses={
            "200": CloudStorageReadSerializer,  # check CloudStorageWriteSerializer.to_representation
        },
    ),
    "create": extend_schema(
        summary="Method creates a cloud storage with a specified characteristics",
        request=CloudStorageWriteSerializer,
        responses={
            "201": CloudStorageReadSerializer,  # check CloudStorageWriteSerializer.to_representation
        },
    ),
}

content_GET = {
    "summary": "Method returns a manifest content",
    "parameters": [
        OpenApiParameter(
            "manifest_path",
            description="Path to the manifest file in a cloud storage",
            location=OpenApiParameter.QUERY,
            type=OpenApiTypes.STR,
        ),
    ],
    "responses": {
        "200": OpenApiResponse(
            response=build_array_type(build_basic_type(OpenApiTypes.STR)),
            description="A manifest content",
        ),
    },
}

preview_GET = {
    "summary": "Method returns a preview image from a cloud storage",
    "responses": {
        "200": OpenApiResponse(description="Cloud Storage preview"),
        "400": OpenApiResponse(description="Failed to get cloud storage preview"),
        "404": OpenApiResponse(description="Cloud Storage preview not found"),
    },
}

status_GET = {
    "summary": "Method returns a cloud storage status",
    "responses": {
        "200": OpenApiResponse(
            response=OpenApiTypes.STR,
            description="Cloud Storage status (AVAILABLE | NOT_FOUND | FORBIDDEN)",
        ),
    },
}

actions_GET = {
    "summary": "Method returns allowed actions for the cloud storage",
    "responses": {
        "200": OpenApiResponse(
            response=OpenApiTypes.STR,
            description="Cloud Storage actions (GET | PUT | DELETE)",
        ),
    },
}
