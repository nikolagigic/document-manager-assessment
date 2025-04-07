from django.shortcuts import render
from django.db import models

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Max
from django.contrib.auth import get_user_model

from ..models import File, FileVersion
from .serializers import FileSerializer, FileVersionSerializer, UserSerializer
from .permissions import IsOwnerOrReadOnly

User = get_user_model()

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

class FileVersionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for retrieving file versions.
    Read-only access to file versions with content-addressable storage.
    """
    serializer_class = FileVersionSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'content_hash'

    def get_queryset(self):
        """Return versions that the user has read access to."""
        user = self.request.user
        return FileVersion.objects.filter(
            models.Q(file__owner=user) |  # User owns the file
            models.Q(can_read=user)       # User has read permission
        ).distinct()

    def get_object(self):
        """
        Override get_object to handle multiple versions with the same content hash.
        Returns the latest version when multiple versions share the same content hash.
        """
        queryset = self.get_queryset()
        content_hash = self.kwargs.get('content_hash')
        
        # Get all versions with the given content hash
        versions = queryset.filter(content_hash=content_hash)
        
        if not versions.exists():
            raise Http404("No version found with this content hash")
            
        # Return the latest version
        return versions.latest('created_at')

    def perform_create(self, serializer):
        """Create a new version with proper permissions."""
        file = serializer.validated_data['file']
        if file.owner != self.request.user and self.request.user not in file.versions.first().can_write.all():
            raise permissions.PermissionDenied("You don't have write permission for this file.")
        
        # Set the version number
        latest_version = file.versions.order_by('-version_number').first()
        version_number = (latest_version.version_number + 1) if latest_version else 1
        
        serializer.save(version_number=version_number)

    @action(detail=True, methods=['post'])
    def set_permissions(self, request, content_hash=None):
        """Set read/write permissions for a version."""
        version = self.get_object()
        if version.file.owner != request.user:
            raise permissions.PermissionDenied("Only the file owner can set permissions.")
        
        can_read = request.data.get('can_read', [])
        can_write = request.data.get('can_write', [])
        
        # Get the users
        read_users = User.objects.filter(id__in=can_read)
        write_users = User.objects.filter(id__in=can_write)
        
        # Prevent setting permissions for the file owner
        if version.file.owner in read_users or version.file.owner in write_users:
            raise permissions.PermissionDenied("Cannot set permissions for the file owner.")
        
        version.can_read.set(read_users)
        version.can_write.set(write_users)
        
        return Response(FileVersionSerializer(version).data)

    @action(detail=False, methods=['get'])
    def available_users(self, request):
        """Get list of users that can be granted permissions."""
        users = User.objects.exclude(id=request.user.id)  # Exclude current user
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)
