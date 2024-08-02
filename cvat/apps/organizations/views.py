from rest_framework import mixins, viewsets, status
from rest_framework.permissions import SAFE_METHODS
from django.utils.crypto import get_random_string
import django_rq

from drf_spectacular.utils import OpenApiResponse, extend_schema, extend_schema_view
from django.conf import settings
from cvat.apps.engine.mixins import PartialUpdateModelMixin, DestroyModelMixin, CreateModelMixin
from cvat.apps.engine.models import Job, Label, LabeledShape, Segment, Umap

from cvat.apps.iam.permissions import (
    InvitationPermission, MembershipPermission, OrganizationPermission)
from cvat.utils.umap import process
from .models import Invitation, Membership, Organization

from .serializers import (
    InvitationReadSerializer, InvitationWriteSerializer,
    MembershipReadSerializer, MembershipWriteSerializer,
    OrganizationReadSerializer, OrganizationWriteSerializer)

from rest_framework.response import Response
from rest_framework.decorators import action
from cvat.apps.engine.serializers import StatisticSerializer, UmapSerializer
from drf_spectacular.utils import OpenApiParameter
from django.db.models import Q


@extend_schema(tags=['organizations'])
@extend_schema_view(
    retrieve=extend_schema(
        summary='Method returns details of an organization',
        responses={
            '200': OrganizationReadSerializer,
        }),
    list=extend_schema(
        summary='Method returns a paginated list of organizations',
        responses={
            '200': OrganizationReadSerializer(many=True),
        }),
    partial_update=extend_schema(
        summary='Methods does a partial update of chosen fields in an organization',
        request=OrganizationWriteSerializer(partial=True),
        responses={
            '200': OrganizationReadSerializer, # check OrganizationWriteSerializer.to_representation
        }),
    create=extend_schema(
        summary='Method creates an organization',
        request=OrganizationWriteSerializer,
        responses={
            '201': OrganizationReadSerializer, # check OrganizationWriteSerializer.to_representation
        }),
    destroy=extend_schema(
        summary='Method deletes an organization',
        responses={
            '204': OpenApiResponse(description='The organization has been deleted'),
        })
)
class OrganizationViewSet(viewsets.GenericViewSet,
                   mixins.RetrieveModelMixin,
                   mixins.ListModelMixin,
                   mixins.CreateModelMixin,
                   mixins.DestroyModelMixin,
                   PartialUpdateModelMixin,
    ):
    queryset = Organization.objects.all()
    search_fields = ('name', 'owner')
    filter_fields = list(search_fields) + ['id', 'slug']
    simple_filters = list(search_fields) + ['slug']
    lookup_fields = {'owner': 'owner__username'}
    ordering_fields = list(filter_fields)
    ordering = '-id'
    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']
    iam_organization_field = None

    def get_queryset(self):
        queryset = super().get_queryset()

        permission = OrganizationPermission.create_scope_list(self.request)
        return permission.filter(queryset)

    def get_serializer_class(self):
        if self.request.method in SAFE_METHODS:
            return OrganizationReadSerializer
        else:
            return OrganizationWriteSerializer

    def perform_create(self, serializer):
        extra_kwargs = { 'owner': self.request.user }
        if not serializer.validated_data.get('name'):
            extra_kwargs.update({ 'name': serializer.validated_data['slug'] })
        serializer.save(**extra_kwargs)

    @extend_schema(
        summary = "Method returns a calculate statics for the organization or worker",
        parameters = [
            OpenApiParameter(
                "worker",
                location="path",
                description="Provide statics data that includes worker",
                type=str,
                required=False,
            ),
        ],
        responses = {
            "200": StatisticSerializer,
        },
    )
    @action(detail=False, methods=["GET"], url_path=r"statistic/(?P<worker>\d+)?")
    def statistic(self, request, worker=None):
        organization = request.iam_context["organization"]
        if organization is None:
            return Response({"detail": "No organization found"}, status=404)

        jobs = Job.objects.filter(Q(segment__task__project__organization=organization) | Q(segment__task__organization=organization))

        if worker:
            jobs = jobs.filter(worker_id=worker)

        jobs = jobs.select_related("segment__task__project", "segment__task", "worker").distinct().values(
            "id", "state", "stage", "etc", "worker__username", "segment__task__name", "segment__task__project__name"
        )

        # 작업에 대한 라벨 정보를 가져오고 가공하는 코드
        labels = set()
        job_labels = {job["id"]: {} for job in jobs}

        annotations = LabeledShape.objects.filter(
            job_id__in=job_labels.keys(), parent=None
        ).values_list("job_id", "label_id")

        for job, label in annotations:
            job_labels[job][label] = job_labels[job].get(label, 0) + 1
            labels.add(label)

        labels = {
            id: name
            for id, name in Label.objects.filter(id__in=labels).values_list(
                "id", "name"
            )
        }

        # 작업에 대한 정보를 업데이트하는 코드
        for job in jobs:
            job.update(
                {
                    "worker": job.get("worker__username"),
                    "project": job.get("segment__task__project__name"),
                    "task": job.get("segment__task__name"),
                    "labels": job_labels.get(job["id"]),
                }
            )

        serializer = StatisticSerializer(data={"labels": labels, "jobs": jobs})
        serializer.is_valid(raise_exception=True)

        return Response(serializer.data)


    @extend_schema(
        summary="Method returns umap data",
        parameters=[
            OpenApiParameter(
                "label",
                location="path",
                description="Provide umap data that includes label",
                type=str,
                required=True,
            ),
        ],
        responses={
            "200": UmapSerializer,
        },
    )
    @action(detail=False, methods=["GET"], url_path=r"umap/(?P<label>\d+)?")
    def get_umap_data(self, request, label):
        if label is None:
            return Response({"detail": "Label is required"}, status=status.HTTP_400_BAD_REQUEST)

        if request.iam_context["organization"] is None:
            return Response({"detail": "No organization found"}, status=status.HTTP_404_NOT_FOUND)

        if LabeledShape.objects.filter(label_id=label, encoding__isnull=False).count() < 20:
            return Response({"detail": "인코딩된 데이터가 부족합니다. 최소 데이터 20개"}, status=status.HTTP_400_BAD_REQUEST)

        organization_id = request.iam_context["organization"].id
        rq_id = f"umap:organization.id{organization_id}-label.id{label}"

        umap = Umap.objects.filter(label_id=label).first()
        if umap:
            if umap.is_expired() is False:
                serializer = UmapSerializer(umap)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                umap.delete()

        queue = django_rq.get_queue(settings.CVAT_QUEUES.UMAP.value)
        rq_job = queue.fetch_job(rq_id)

        if rq_job:
            if rq_job.is_failed:
                return Response({"detail": str(rq_job.exc_info)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            if rq_job.is_started:
                return Response({"detail": "작업 진행중"}, status=status.HTTP_202_ACCEPTED)
            return Response({"detail": "작업 대기중"}, status=status.HTTP_202_ACCEPTED)

        queue.enqueue_call(
            func=process,
            args=(label, ),
            job_id=rq_id,
            result_ttl=500,
            failure_ttl=500,
        )

        return Response({"detail": "작업 대기중"}, status=status.HTTP_202_ACCEPTED)

    class Meta:
        model = Membership
        fields = ("user", )

@extend_schema(tags=['memberships'])
@extend_schema_view(
    retrieve=extend_schema(
        summary='Method returns details of a membership',
        responses={
            '200': MembershipReadSerializer,
        }),
    list=extend_schema(
        summary='Method returns a paginated list of memberships',
        responses={
            '200': MembershipReadSerializer(many=True),
        }),
    partial_update=extend_schema(
        summary='Methods does a partial update of chosen fields in a membership',
        request=MembershipWriteSerializer(partial=True),
        responses={
            '200': MembershipReadSerializer, # check MembershipWriteSerializer.to_representation
        }),
    destroy=extend_schema(
        summary='Method deletes a membership',
        responses={
            '204': OpenApiResponse(description='The membership has been deleted'),
        })
)
class MembershipViewSet(mixins.RetrieveModelMixin, DestroyModelMixin,
    mixins.ListModelMixin, PartialUpdateModelMixin, viewsets.GenericViewSet):
    queryset = Membership.objects.all()
    ordering = '-id'
    http_method_names = ['get', 'patch', 'delete', 'head', 'options']
    search_fields = ('user', 'role')
    filter_fields = list(search_fields) + ['id']
    simple_filters = list(search_fields)
    ordering_fields = list(filter_fields)
    lookup_fields = {'user': 'user__username'}
    iam_organization_field = 'organization'

    def get_serializer_class(self):
        if self.request.method in SAFE_METHODS:
            return MembershipReadSerializer
        else:
            return MembershipWriteSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        permission = MembershipPermission.create_scope_list(self.request)
        return permission.filter(queryset)

@extend_schema(tags=['invitations'])
@extend_schema_view(
    retrieve=extend_schema(
        summary='Method returns details of an invitation',
        responses={
            '200': InvitationReadSerializer,
        }),
    list=extend_schema(
        summary='Method returns a paginated list of invitations',
        responses={
            '200': InvitationReadSerializer(many=True),
        }),
    partial_update=extend_schema(
        summary='Methods does a partial update of chosen fields in an invitation',
        request=InvitationWriteSerializer(partial=True),
        responses={
            '200': InvitationReadSerializer, # check InvitationWriteSerializer.to_representation
        }),
    create=extend_schema(
        summary='Method creates an invitation',
        request=InvitationWriteSerializer,
        responses={
            '201': InvitationReadSerializer, # check InvitationWriteSerializer.to_representation
        }),
    destroy=extend_schema(
        summary='Method deletes an invitation',
        responses={
            '204': OpenApiResponse(description='The invitation has been deleted'),
        })
)
class InvitationViewSet(viewsets.GenericViewSet,
                   mixins.RetrieveModelMixin,
                   mixins.ListModelMixin,
                   PartialUpdateModelMixin,
                   CreateModelMixin,
                   DestroyModelMixin,
    ):
    queryset = Invitation.objects.all()
    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']
    iam_organization_field = 'membership__organization'

    search_fields = ('owner',)
    filter_fields = list(search_fields)
    simple_filters = list(search_fields)
    ordering_fields = list(filter_fields) + ['created_date']
    ordering = '-created_date'
    lookup_fields = {'owner': 'owner__username'}

    def get_serializer_class(self):
        if self.request.method in SAFE_METHODS:
            return InvitationReadSerializer
        else:
            return InvitationWriteSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        permission = InvitationPermission.create_scope_list(self.request)
        return permission.filter(queryset)

    def perform_create(self, serializer, **kwargs):
        extra_kwargs = {
            'owner': self.request.user,
            'key': get_random_string(length=64),
            'organization': self.request.iam_context['organization']
        }
        super().perform_create(serializer, **extra_kwargs)

    def perform_update(self, serializer):
        if 'accepted' in self.request.query_params:
            serializer.instance.accept()
        else:
            super().perform_update(serializer)
