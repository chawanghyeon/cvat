from django.http import HttpRequest
from django.utils.timezone import now
from django.utils.crypto import get_random_string
from django.contrib import admin
from .models import Task, Segment, Job, Label, AttributeSpec, Project, CloudStorage
from cvat.apps.organizations.models import Organization, Membership, Invitation

# admin.py

from django.urls import path
from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth.admin import UserAdmin as DefaultUserAdmin
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from allauth.account.models import EmailAddress
from django.utils.translation import gettext_lazy as _

from .admin_forms import BulkUserCreationForm, BulkMembershipCreationForm

User = get_user_model()

class UserAdmin(DefaultUserAdmin):
    change_list_template = "admin/user_changelist.html"
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name', 'email')}),
        (_('Permissions'), {'fields': ('is_active', 'is_staff', 'is_superuser',
                                       'groups',)}),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path("bulk-create/", self.bulk_create_users, name="bulk-create-users"),
        ]
        return custom_urls + urls

    def bulk_create_users(self, request):
        if request.method == "POST":
            form = BulkUserCreationForm(request.POST)
            if form.is_valid():
                count = form.cleaned_data["count"]
                base_username = form.cleaned_data["prefix"]
                password = form.cleaned_data["password"]
                group = Group.objects.get(name=form.cleaned_data["group"])

                for i in range(1, count + 1):
                    username = f"{base_username}{i}"
                    email = f"{username}@salmon.com"
                    password = f"{password}"
                    user = User(username=username, email=email)
                    user.set_password(password)
                    user.save()

                    user.groups.add(group)
                    user.save()

                    EmailAddress.objects.get_or_create(user=user, email=user.email, primary=True, verified=False)

                messages.success(request, f"{count} users created successfully!")
                return redirect("..")
        else:
            form = BulkUserCreationForm()

        context = {"form": form}
        return render(request, "admin/bulk_create_users.html", context)

    def has_delete_permission(self, request):
        return False

class JobInline(admin.TabularInline):
    model = Job
    can_delete = False

    # Don't show extra lines to add an object
    def has_add_permission(self, request, obj):
        return False


class SegmentInline(admin.TabularInline):
    model = Segment
    show_change_link = True
    readonly_fields = ('start_frame', 'stop_frame')
    can_delete = False

    # Don't show extra lines to add an object
    def has_add_permission(self, request, obj):
        return False


class AttributeSpecInline(admin.TabularInline):
    model = AttributeSpec
    extra = 0
    max_num = None


class LabelInline(admin.TabularInline):
    model = Label
    show_change_link = True
    extra = 0
    max_num = None


class LabelAdmin(admin.ModelAdmin):
    # Don't show on admin index page
    def has_module_permission(self, request):
        return False

    inlines = [
        AttributeSpecInline
    ]


class SegmentAdmin(admin.ModelAdmin):
    # Don't show on admin index page
    def has_module_permission(self, request):
        return False

    inlines = [
        JobInline
    ]


class ProjectAdmin(admin.ModelAdmin):
    date_hierarchy = 'updated_date'
    readonly_fields = ('created_date', 'updated_date', 'status')
    fields = ('name', 'owner', 'created_date', 'updated_date', 'status')
    search_fields = ('name', 'owner__username', 'owner__first_name',
        'owner__last_name', 'owner__email', 'assignee__username', 'assignee__first_name',
        'assignee__last_name')
    inlines = [
        LabelInline
    ]

    def has_add_permission(self, _request):
        return False


class TaskAdmin(admin.ModelAdmin):
    date_hierarchy = 'updated_date'
    readonly_fields = ('created_date', 'updated_date', 'overlap')
    list_display = ('name', 'mode', 'owner', 'assignee', 'created_date', 'updated_date')
    search_fields = ('name', 'mode', 'owner__username', 'owner__first_name',
        'owner__last_name', 'owner__email', 'assignee__username', 'assignee__first_name',
        'assignee__last_name')
    inlines = [
        SegmentInline,
        LabelInline
    ]

    # Don't allow to add a task because it isn't trivial operation
    def has_add_permission(self, request):
        return False


class CloudStorageAdmin(admin.ModelAdmin):
    date_hierarchy = 'updated_date'
    readonly_fields = ('created_date', 'updated_date', 'provider_type')
    list_display = ('__str__', 'resource', 'owner', 'created_date', 'updated_date')
    search_fields = ('provider_type', 'display_name', 'resource', 'owner__username', 'owner__first_name',
        'owner__last_name', 'owner__email',)

    empty_value_display = 'unknown'

    def has_add_permission(self, request):
        return False


class InvitationInline(admin.TabularInline):
    model = Invitation
    extra = 0
    max_num = None


class MembershipInline(admin.TabularInline):
    model = Membership
    extra = 0
    max_num = None


class OrganizationAdmin(admin.ModelAdmin):
    date_hierarchy = 'updated_date'
    readonly_fields = ('created_date', 'updated_date')
    list_display = ('name', 'owner', 'slug', 'created_date', 'updated_date')
    search_fields = ('name', 'owner__username', 'owner__first_name',
        'owner__last_name', 'owner__email',)

    empty_value_display = 'unknown'

    inlines = [MembershipInline]


class MembershipAdmin(admin.ModelAdmin):
    date_hierarchy = 'joined_date'
    readonly_fields = ('joined_date', )
    list_display = ('organization', 'user', 'role', 'is_active', 'joined_date')
    search_fields = ('organization__name', 'user__username', 'user__first_name',
        'user__last_name', 'user__email',)

    empty_value_display = 'unknown'

    inlines = [InvitationInline]

    change_list_template = "admin/membership_changelist.html"

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path("bulk-create/", self.bulk_create_memberships, name="bulk-create-memberships"),
        ]
        return custom_urls + urls

    def bulk_create_memberships(self, request):
        if request.method == "POST":
            form = BulkMembershipCreationForm(request.POST)
            if form.is_valid():
                base_username = form.cleaned_data["prefix"]
                role = form.cleaned_data["role"]
                organization = form.cleaned_data["organization"]

                owner = organization.owner
                users = User.objects.filter(username__startswith=base_username, email__startswith=base_username)

                for user in users:
                    membership = Membership(user=user, organization=organization, is_active=True, joined_date=now(), role=role)
                    membership.save()

                    if user == owner:
                        membership.role = 'owner'
                        membership.save()

                    Invitation.objects.create(membership=membership, owner=owner, key=get_random_string(length=64))

                messages.success(request, "Membership created successfully!")
                return redirect("..")
        else:
            form = BulkMembershipCreationForm()

        context = {"form": form}
        return render(request, "admin/bulk_create_memberships.html", context)


admin.site.register(Task, TaskAdmin)
admin.site.register(Segment, SegmentAdmin)
admin.site.register(Label, LabelAdmin)
admin.site.register(Project, ProjectAdmin)
admin.site.register(CloudStorage, CloudStorageAdmin)
admin.site.unregister(User)
admin.site.register(User, UserAdmin)
admin.site.register(Organization, OrganizationAdmin)
admin.site.register(Membership, MembershipAdmin)
