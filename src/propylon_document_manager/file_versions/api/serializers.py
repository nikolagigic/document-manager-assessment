from rest_framework import serializers
from django.contrib.auth import get_user_model
from ..models import File, FileVersion
import difflib

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'username']
        read_only_fields = ['id', 'email', 'username']

class FileVersionSerializer(serializers.ModelSerializer):
    """Serializer for file versions with content-addressable storage."""
    content_hash = serializers.CharField(read_only=True)
    file_name = serializers.CharField(required=True)
    content = serializers.FileField(required=True)
    can_read = serializers.PrimaryKeyRelatedField(many=True, queryset=User.objects.all(), required=False)
    can_write = serializers.PrimaryKeyRelatedField(many=True, queryset=User.objects.all(), required=False)
    diff_with_previous = serializers.SerializerMethodField()
    file_owner = serializers.SerializerMethodField()
    
    class Meta:
        model = FileVersion
        fields = ['id', 'file', 'file_name', 'content', 'content_hash', 'created_at', 'version_number', 'can_read', 'can_write', 'diff_with_previous', 'file_owner']
        read_only_fields = ['id', 'content_hash', 'created_at', 'version_number']

    def validate_content(self, value):
        """Validate file content and calculate hash."""
        if not value:
            raise serializers.ValidationError("File content is required")
        return value

    def get_diff_with_previous(self, obj):
        """Get the differences between this version and the previous version."""
        previous_version = FileVersion.objects.filter(
            file=obj.file,
            version_number__lt=obj.version_number
        ).order_by('-version_number').first()

        if not previous_version:
            return None

        # Convert binary content to strings for comparison
        current_content = obj.content.decode('utf-8', errors='ignore')
        previous_content = previous_version.content.decode('utf-8', errors='ignore')

        # Generate diff
        diff = difflib.unified_diff(
            previous_content.splitlines(),
            current_content.splitlines(),
            fromfile=f'v{previous_version.version_number}',
            tofile=f'v{obj.version_number}',
            lineterm=''
        )
        return '\n'.join(diff)

    def get_file_owner(self, obj):
        """Get the owner of the file."""
        return {
            'id': obj.file.owner.id,
            'username': obj.file.owner.username
        }

class FileSerializer(serializers.ModelSerializer):
    """Serializer for files with their latest version."""
    latest_version = serializers.SerializerMethodField()
    versions = FileVersionSerializer(many=True, read_only=True)
    
    class Meta:
        model = File
        fields = ['id', 'url_path', 'owner', 'versions', 'created_at', 'content_type', 'latest_version']
        read_only_fields = ['id', 'owner', 'created_at']

    def get_latest_version(self, obj):
        """Get the latest version of the file."""
        if hasattr(obj, 'versions'):
            latest = obj.versions.first()
        else:
            return None
            
        if latest:
            return FileVersionSerializer(latest).data
        return None

    def validate_url_path(self, value):
        """Validate URL path format."""
        if not value.startswith('/'):
            raise serializers.ValidationError("URL path must start with a forward slash")
        return value

    def create(self, validated_data):
        """Create a new file with initial version."""
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)
