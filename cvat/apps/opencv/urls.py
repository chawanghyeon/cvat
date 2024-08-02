from django.urls import path
from . import views

urlpatterns = [
    path('opencv.js', views.OpenCVLibrary)
]
