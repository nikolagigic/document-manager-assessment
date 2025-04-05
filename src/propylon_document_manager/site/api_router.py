from django.conf import settings
from rest_framework.routers import DefaultRouter, SimpleRouter

from propylon_document_manager.file_versions.api.views import FileViewSet, FileVersionViewSet

if settings.DEBUG:
    router = DefaultRouter()
else:
    router = SimpleRouter()

router.register("files", FileViewSet, basename="file")
router.register("versions", FileVersionViewSet, basename="version")

app_name = "api"
urlpatterns = router.urls
