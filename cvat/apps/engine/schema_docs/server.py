"""This module contains documentation for the API of the CVAT engine.

Variable naming convention:
    * <Method>_<Type>
"""
from drf_spectacular.utils import (
    OpenApiParameter,
    OpenApiResponse,
    OpenApiTypes,
    inline_serializer,
)
from rest_framework import serializers

from cvat.apps.dataset_manager.serializers import DatasetFormatsSerializer
from cvat.apps.engine.serializers import (
    AboutSerializer,
    FileInfoSerializer,
    PluginsSerializer,
)

about_GET = {
    "summary": "Method provides basic CVAT information",
    "responses": {
        "200": AboutSerializer,
    },
}

share_GET = {
    "summary": "Returns all files and folders that are on the server along specified path",
    "parameters": [
        OpenApiParameter(
            "directory",
            description="Directory to browse",
            location=OpenApiParameter.QUERY,
            type=OpenApiTypes.STR,
        )
    ],
    "responses": {"200": FileInfoSerializer(many=True)},
}

annotation_formats_GET = {
    "summary": "Method provides the list of supported annotations formats",
    "responses": {
        "200": DatasetFormatsSerializer,
    },
}

plugins_GET = {
    "summary": "Method provides allowed plugins",
    "responses": {
        "200": PluginsSerializer,
    },
}

advanced_authentication_GET = {
    "summary": "Method provides a list with advanced integrated authentication methods (e.g. social accounts)",
    "responses": {
        "200": OpenApiResponse(
            response=inline_serializer(
                name="AdvancedAuthentication",
                fields={
                    "GOOGLE_ACCOUNT_AUTHENTICATION": serializers.BooleanField(),
                    "GITHUB_ACCOUNT_AUTHENTICATION": serializers.BooleanField(),
                },
            )
        ),
    },
}
