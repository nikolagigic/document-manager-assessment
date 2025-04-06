from django.shortcuts import render

from rest_framework import viewsets, status, permissions
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
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return files owned by the current user."""
        return File.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        # Check if a file with the same URL path already exists for this user
        url_path = self.request.data.get('url_path')
        existing_file = File.objects.filter(owner=self.request.user, url_path=url_path).first()
        
        if existing_file:
            # Create a new version of the existing file
            content = self.request.FILES.get('content').read()
            file_version = FileVersion.objects.create(
                file=existing_file,
                file_name=self.request.data.get('file_name'),
                content=content,
                version_number=existing_file.versions.count() + 1
            )
            # Return the updated file with all versions
            return Response(FileSerializer(existing_file).data, status=status.HTTP_201_CREATED)
        
        # If no existing file, create a new one with content_type
        file = serializer.save(
            owner=self.request.user,
            content_type=self.request.data.get('content_type')
        )
        
        # Create the initial version
        content = self.request.FILES.get('content').read()
        file_version = FileVersion.objects.create(
            file=file,
            file_name=self.request.data.get('file_name'),
            content=content,
            version_number=1
        )
        
        # Return the file with its initial version
        return Response(FileSerializer(file).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def versions(self, request, pk=None):
        file = self.get_object()
        versions = FileVersion.objects.filter(file=file).order_by('-created_at')
        serializer = FileVersionSerializer(versions, many=True)
        return Response(serializer.data)

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
