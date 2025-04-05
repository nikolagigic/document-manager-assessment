import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django.core.files.base import ContentFile

from propylon_document_manager.file_versions.models import File, FileVersion
from tests.factories import UserFactory, FileFactory, FileVersionFactory


@pytest.mark.django_db
class TestFileModels:
    def test_file_creation(self):
        """Test that a file can be created with proper owner."""
        user = UserFactory()
        file = FileFactory(owner=user)
        
        assert file.owner == user
        assert file.url_path.startswith('/')
        assert file.content_type

    def test_file_version_creation(self):
        """Test that a file version can be created with proper content hash."""
        file = FileFactory()
        version = FileVersionFactory(file=file)
        
        assert version.file == file
        assert version.content_hash
        assert version.version_number > 0
        assert version.file_name

    def test_file_version_ordering(self):
        """Test that file versions are ordered by version number."""
        file = FileFactory()
        version1 = FileVersionFactory(file=file, version_number=1)
        version2 = FileVersionFactory(file=file, version_number=2)
        version3 = FileVersionFactory(file=file, version_number=3)
        
        versions = file.versions.all()
        assert list(versions) == [version3, version2, version1]


@pytest.mark.django_db
class TestFileAPI:
    def setup_method(self):
        """Set up test client and user."""
        self.client = APIClient()
        self.user = UserFactory()
        self.client.force_authenticate(user=self.user)
        self.file = FileFactory(owner=self.user)
        self.version = FileVersionFactory(file=self.file)

    def test_file_list(self):
        """Test that a user can list their files."""
        url = reverse('api:file-list')
        response = self.client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]['url_path'] == self.file.url_path

    def test_file_create(self):
        """Test that a user can create a new file."""
        url = reverse('api:file-list')
        data = {
            'url_path': '/test/file.txt',
            'content_type': 'text/plain'
        }
        response = self.client.post(url, data)
        
        assert response.status_code == status.HTTP_201_CREATED
        assert File.objects.filter(url_path=data['url_path']).exists()

    def test_file_version_upload(self):
        """Test that a user can upload a new version of a file."""
        url = reverse('api:file-upload-version', kwargs={'pk': self.file.pk})
        
        # Create a file-like object
        content = ContentFile(b'Hello, World!')
        content.name = 'test.txt'
        
        data = {
            'content': content,
            'file_name': 'test.txt'
        }
        response = self.client.post(url, data, format='multipart')
        
        if response.status_code != status.HTTP_201_CREATED:
            print(f"Upload failed with response: {response.content}")
        
        assert response.status_code == status.HTTP_201_CREATED
        assert self.file.versions.count() == 2  # Original + new version

    def test_file_version_retrieval(self):
        """Test that a user can retrieve a specific version of a file."""
        url = reverse('api:file-get-version', kwargs={
            'pk': self.file.pk,
            'version_number': self.version.version_number
        })
        response = self.client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['version_number'] == self.version.version_number

    def test_unauthorized_access(self):
        """Test that unauthorized users cannot access files."""
        self.client.force_authenticate(user=None)
        url = reverse('api:file-list')
        response = self.client.get(url)
        
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_other_user_access(self):
        """Test that users cannot access other users' files."""
        other_user = UserFactory()
        other_file = FileFactory(owner=other_user)
        url = reverse('api:file-detail', kwargs={'pk': other_file.pk})
        response = self.client.get(url)
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
