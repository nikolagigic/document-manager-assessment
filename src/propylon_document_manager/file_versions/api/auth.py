from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView, TokenVerifyView
from rest_framework.response import Response
from rest_framework import status


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom token serializer that uses email instead of username."""
    username_field = 'email'

    def validate(self, attrs):
        """Validate the token data."""
        data = super().validate(attrs)
        # Add extra responses here
        data['email'] = self.user.email
        data['name'] = self.user.name
        data['id'] = self.user.id
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom token view that uses email instead of username."""
    serializer_class = CustomTokenObtainPairSerializer


class CustomTokenVerifyView(TokenVerifyView):
    """Custom token verification view that returns user data."""
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == status.HTTP_200_OK:
            # Get the user from the token
            user = request.user
            # Add user data to the response
            response.data.update({
                'id': user.id,
                'email': user.email,
                'name': user.name
            })
        return response 