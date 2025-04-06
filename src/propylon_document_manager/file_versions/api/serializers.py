from rest_framework import serializers
from ..models import File, FileVersion

class FileVersionSerializer(serializers.ModelSerializer):
    """Serializer for file versions with content-addressable storage."""
    content_hash = serializers.CharField(read_only=True)
    file_name = serializers.CharField(required=True)
    content = serializers.FileField(required=True)
    
    class Meta:
        model = FileVersion
        fields = ['id', 'file', 'file_name', 'content', 'content_hash', 'created_at', 'version_number']
        read_only_fields = ['id', 'content_hash', 'created_at']

    def validate_content(self, value):
        """Validate file content and calculate hash."""
        if not value:
            raise serializers.ValidationError("File content is required")
        return value

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
