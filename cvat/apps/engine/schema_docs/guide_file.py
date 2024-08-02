"""This module contains documentation for the API of the CVAT engine.

Variable naming convention:
    * view
    * <Method>_<Type>
"""

from drf_spectacular.utils import extend_schema

from cvat.apps.engine.serializers import GuideFileSerializer

view = {
    "retrieve": extend_schema(
        summary="Method returns details of a guide file",
        responses={
            "200": GuideFileSerializer(many=True),
        },
    ),
    "list": extend_schema(
        summary="Method returns a paginated list of guide according to query parameters",
        responses={
            "200": GuideFileSerializer(many=True),
        },
    ),
}

content_GET = {
    "summary": "project id 기준으로 guild_file 반환",
    "responses": GuideFileSerializer,
}
