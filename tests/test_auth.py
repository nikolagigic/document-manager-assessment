import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from tests.factories import UserFactory


@pytest.mark.django_db
class TestJWTAuth:
    def setup_method(self):
        """Set up test client."""
        self.client = APIClient()
        self.user = UserFactory()
        self.user.set_password('testpass123')
        self.user.save()

    def test_token_obtain(self):
        """Test that a user can obtain a JWT token."""
        url = reverse('token_obtain_pair')
        data = {
            'email': self.user.email,
            'password': 'testpass123'
        }
        response = self.client.post(url, data)
        
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
        assert 'refresh' in response.data
        assert 'email' in response.data
        assert 'name' in response.data

    def test_token_refresh(self):
        """Test that a user can refresh their JWT token."""
        # First get a token
        url = reverse('token_obtain_pair')
        data = {
            'email': self.user.email,
            'password': 'testpass123'
        }
        response = self.client.post(url, data)
        refresh_token = response.data['refresh']

        # Then refresh it
        url = reverse('token_refresh')
        data = {'refresh': refresh_token}
        response = self.client.post(url, data)
        
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data

    def test_token_verify(self):
        """Test that a user can verify their JWT token."""
        # First get a token
        url = reverse('token_obtain_pair')
        data = {
            'email': self.user.email,
            'password': 'testpass123'
        }
        response = self.client.post(url, data)
        access_token = response.data['access']

        # Then verify it
        url = reverse('token_verify')
        data = {'token': access_token}
        response = self.client.post(url, data)
        
        assert response.status_code == status.HTTP_200_OK

    def test_protected_endpoint(self):
        """Test that protected endpoints require JWT authentication."""
        # First get a token
        url = reverse('token_obtain_pair')
        data = {
            'email': self.user.email,
            'password': 'testpass123'
        }
        response = self.client.post(url, data)
        access_token = response.data['access']

        # Try to access a protected endpoint without token
        url = reverse('api:file-list')
        response = self.client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

        # Try with token
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        response = self.client.get(url)
        assert response.status_code == status.HTTP_200_OK 