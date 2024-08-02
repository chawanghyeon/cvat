"""This module contains documentation for the API of the CVAT engine.

Variable naming convention:
    * view
    * <Method>_<Type>
"""
from drf_spectacular.utils import (
    OpenApiParameter,
    OpenApiResponse,
    OpenApiTypes,
    extend_schema,
)

from cvat.apps.engine.serializers import LabelSerializer

view = {
    "retrieve":extend_schema(
        summary='Method returns details of a label',
        responses={
            '200': LabelSerializer,
        }),
    "list":extend_schema(
        summary='Method returns a paginated list of labels',
        parameters=[
            # These filters are implemented differently from others
            OpenApiParameter('job_id', type=OpenApiTypes.INT,
                description='A simple equality filter for job id'),
            OpenApiParameter('task_id', type=OpenApiTypes.INT,
                description='A simple equality filter for task id'),
            OpenApiParameter('project_id', type=OpenApiTypes.INT,
                description='A simple equality filter for project id'),
        ],
        responses={
            '200': LabelSerializer(many=True),
        }),
    "partial_update":extend_schema(
        summary='Methods does a partial update of chosen fields in a label'
        'To modify a sublabel, please use the PATCH method of the parent label',
        request=LabelSerializer(partial=True),
        responses={
            '200': LabelSerializer,
        }),
    "destroy":extend_schema(
        summary='Method deletes a label. '
        'To delete a sublabel, please use the PATCH method of the parent label',
        responses={
            '204': OpenApiResponse(description='The label has been deleted'),
        })
}