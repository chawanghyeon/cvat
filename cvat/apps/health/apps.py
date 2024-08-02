from django.apps import AppConfig

from health_check.plugins import plugin_dir

class HealthConfig(AppConfig):
    name = 'cvat.apps.health'

    def ready(self):
        from .backends import OPAHealthCheck
        plugin_dir.register(OPAHealthCheck)
