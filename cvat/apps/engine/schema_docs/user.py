"""This module contains documentation for the API of the CVAT engine.

Variable naming convention:
    * view
    * <Method>_<Type>
"""
from drf_spectacular.utils import (
    OpenApiResponse,
    PolymorphicProxySerializer,
    extend_schema,
)

from cvat.apps.engine.serializers import BasicUserSerializer, UserSerializer

view = {
    "list": extend_schema(
        summary="Method provides a paginated list of users registered on the server",
        responses={
            "200": PolymorphicProxySerializer(
                component_name="MetaUser",
                serializers=[
                    UserSerializer,
                    BasicUserSerializer,
                ],
                resource_type_field_name=None,
            ),
        },
    ),
    "retrieve": extend_schema(
        summary="Method provides information of a specific user",
        responses={
            "200": PolymorphicProxySerializer(
                component_name="MetaUser",
                serializers=[
                    UserSerializer,
                    BasicUserSerializer,
                ],
                resource_type_field_name=None,
            ),
        },
    ),
    "partial_update": extend_schema(
        summary="Method updates chosen fields of a user",
        responses={
            "200": PolymorphicProxySerializer(
                component_name="MetaUser",
                serializers=[
                    UserSerializer,
                    BasicUserSerializer,
                ],
                resource_type_field_name=None,
            ),
        },
    ),
    "destroy": extend_schema(
        summary="Method deletes a specific user from the server",
        responses={
            "204": OpenApiResponse(description="The user has been deleted"),
        },
    ),
}

self_GET = {
    "summary": "Method returns an instance of a user who is currently authorized",
    "responses": {
        "200": PolymorphicProxySerializer(
            component_name="MetaUser",
            serializers=[
                UserSerializer,
                BasicUserSerializer,
            ],
            resource_type_field_name=None,
        ),
    },
}
