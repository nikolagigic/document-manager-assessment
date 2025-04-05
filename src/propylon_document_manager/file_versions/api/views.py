from django.shortcuts import render

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Max

from ..models import File, FileVersion
from .serializers import FileSerializer, FileVersionSerializer
from .permissions import IsOwnerOrReadOnly

class FileViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing files and their versions.
    Provides endpoints for:
    - Creating new files
    - Uploading new versions
    - Retrieving file versions
    - Listing user's files
    """
    serializer_class = FileSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
    
    def get_queryset(self):
        """Return files owned by the current user."""
        return File.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        """Create a new file with initial version."""
        file = serializer.save()
        # Create initial version if file content is provided
        if 'content' in self.request.FILES:
            FileVersion.objects.create(
                file=file,
                version_number=1,
                content=self.request.FILES['content'].read(),
                file_name=self.request.FILES['content'].name
            )

    @action(detail=True, methods=['post'])
    def upload_version(self, request, pk=None):
        """Upload a new version of an existing file."""
        file = self.get_object()
        if 'content' not in request.FILES:
            return Response(
                {'error': 'No file content provided'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get the next version number
        latest_version = file.versions.aggregate(Max('version_number'))['version_number__max'] or 0
        new_version = latest_version + 1

        # Create new version
        version = FileVersion.objects.create(
            file=file,
            version_number=new_version,
            content=request.FILES['content'].read(),
            file_name=request.FILES['content'].name
        )

        return Response(
            FileVersionSerializer(version).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['get'], url_path='get_version/(?P<version_number>[0-9]+)')
    def get_version(self, request, pk=None, version_number=None):
        """Get a specific version of a file."""
        file = self.get_object()
        version = get_object_or_404(
            file.versions,
            version_number=version_number
        )
        return Response(FileVersionSerializer(version).data)

class FileVersionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for retrieving file versions.
    Read-only access to file versions with content-addressable storage.
    """
    serializer_class = FileVersionSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'content_hash'

    def get_queryset(self):
        """Return versions of files owned by the current user."""
        return FileVersion.objects.filter(file__owner=self.request.user)
