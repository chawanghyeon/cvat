import os

from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "cvat.settings.{}" \
    .format(os.environ.get("DJANGO_CONFIGURATION", "development")))

application = get_asgi_application()