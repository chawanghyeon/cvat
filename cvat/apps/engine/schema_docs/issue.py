"""This module contains documentation for the API of the CVAT engine.

Variable naming convention:
    * view
    * <Method>_<Type>
"""
from drf_spectacular.utils import OpenApiResponse, extend_schema

from cvat.apps.engine.serializers import (
    IssueReadSerializer,
    IssueWriteSerializer,
    IssueContentSerializer,
)

view = {
    "retrieve": extend_schema(
        summary="Method returns details of an issue",
        responses={
            "200": IssueReadSerializer,
        },
    ),
    "list": extend_schema(
        summary="Method returns a paginated list of issues according to query parameters",
        responses={
            "200": IssueReadSerializer(many=True),
        },
    ),
    "partial_update": extend_schema(
        summary="Methods does a partial update of chosen fields in an issue",
        request=IssueWriteSerializer,
        responses={
            "200": IssueReadSerializer,  # check IssueWriteSerializer.to_representation
        },
    ),
    "create": extend_schema(
        summary="Method creates an issue",
        request=IssueWriteSerializer,
        responses={
            "201": IssueReadSerializer,  # check IssueWriteSerializer.to_representation
        },
    ),
    "destroy": extend_schema(
        summary="Method deletes an issue",
        responses={
            "204": OpenApiResponse(description="The issue has been deleted"),
        },
    ),
}

content_GET = {
    "summary": "유저에게 할당된 작업 중 이슈가 등록되어 있는 리스트 반환",
    "responses": IssueContentSerializer(many=True),
}
