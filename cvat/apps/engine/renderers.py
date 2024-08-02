from rest_framework.renderers import JSONRenderer

class CVATAPIRenderer(JSONRenderer):
    media_type = 'application/vnd.cvat+json'
