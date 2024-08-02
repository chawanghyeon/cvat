from django.contrib.admin import apps
from django.contrib import admin

class CustomAdminSite(admin.AdminSite):
    def has_permission(self, request):
        return request.user.is_active and request.user.is_staff and request.user.is_superuser

    def register(self, model_or_iterable, admin_class=None, **options) -> None:
        admin_class.has_delete_permission = lambda self, request, obj=None: False
        admin_class.has_change_permission = lambda self, request, obj=None: False
        return super().register(model_or_iterable, admin_class, **options)


class CustomAdminConfig(apps.AdminConfig):
    default_site = 'cvat.utils.admin_config.CustomAdminSite'
