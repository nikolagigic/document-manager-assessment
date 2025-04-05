from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom token serializer that uses email instead of username."""
    username_field = 'email'

    def validate(self, attrs):
        """Validate the token data."""
        data = super().validate(attrs)
        # Add extra responses here
        data['email'] = self.user.email
        data['name'] = self.user.name
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom token view that uses email instead of username."""
    serializer_class = CustomTokenObtainPairSerializer 