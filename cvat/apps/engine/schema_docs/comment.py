"""This module contains documentation for the API of the CVAT engine.

Variable naming convention:
    * view
    * <Method>_<Type>
"""
from drf_spectacular.utils import OpenApiResponse, extend_schema

from cvat.apps.engine.serializers import (
    CommentReadSerializer,
    CommentWriteSerializer,
)

view = {
    "retrieve": extend_schema(
        summary="Method returns details of a comment",
        responses={
            "200": CommentReadSerializer,
        },
    ),
    "list": extend_schema(
        summary="Method returns a paginated list of comments according to query parameters",
        responses={
            "200": CommentReadSerializer(many=True),
        },
    ),
    "partial_update": extend_schema(
        summary="Methods does a partial update of chosen fields in a comment",
        request=CommentWriteSerializer,
        responses={
            "200": CommentReadSerializer,  # check CommentWriteSerializer.to_representation
        },
    ),
    "create": extend_schema(
        summary="Method creates a comment",
        request=CommentWriteSerializer,
        responses={
            "201": CommentReadSerializer,  # check CommentWriteSerializer.to_representation
        },
    ),
    "destroy": extend_schema(
        summary="Method deletes a comment",
        responses={
            "204": OpenApiResponse(description="The comment has been deleted"),
        },
    ),
}
