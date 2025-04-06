from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models import CharField, EmailField
from django.urls import reverse
from django.utils.translation import gettext_lazy as _
import hashlib
import os

class User(AbstractUser):
    """
    Default custom user model for Propylon Document Manager.
    If adding fields that need to be filled at user signup,
    check forms.SignupForm and forms.SocialSignupForms accordingly.
    """

    # First and last name do not cover name patterns around the globe
    name = CharField(_("Name of User"), blank=True, max_length=255)
    first_name = None  # type: ignore
    last_name = None  # type: ignore
    email = EmailField(_("email address"), unique=True)
    username = CharField(_("username"), max_length=150, unique=True, null=True, blank=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def get_absolute_url(self) -> str:
        """Get URL for user's detail view.

        Returns:
            str: URL for user detail.

        """
        return reverse("users:detail", kwargs={"pk": self.id})


class File(models.Model):
    """
    Represents a document in the system. Each file can have multiple versions.
    The url_path is unique per user, allowing different users to have files at the same path.
    """
    url_path = models.CharField(max_length=1024)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="documents")
    content_type = models.CharField(max_length=255, help_text="MIME type of the file")
    
    class Meta:
        unique_together = ['url_path', 'owner']
        indexes = [
            models.Index(fields=['url_path', 'owner'], name='file_url_owner_idx'),
        ]

    def __str__(self):
        return f"{self.url_path} (owned by {self.owner.email})"


class FileVersion(models.Model):
    """
    Represents a specific version of a file. Uses content addressable storage
    to store the actual file content.
    """
    file = models.ForeignKey(File, on_delete=models.CASCADE, related_name="versions")
    version_number = models.IntegerField()
    content_hash = models.CharField(max_length=64, help_text="SHA-256 hash of the file content")
    content = models.BinaryField()
    created_at = models.DateTimeField(auto_now_add=True)
    file_name = models.CharField(max_length=512)
    
    class Meta:
        unique_together = ['file', 'version_number']
        ordering = ['-version_number']
        indexes = [
            models.Index(fields=['content_hash'], name='file_content_hash_idx'),
        ]

    def __str__(self):
        return f"{self.file.url_path} v{self.version_number}"

    @classmethod
    def calculate_content_hash(cls, content):
        """Calculate SHA-256 hash of the content."""
        return hashlib.sha256(content).hexdigest()

    def save(self, *args, **kwargs):
        if not self.content_hash:
            self.content_hash = self.calculate_content_hash(self.content)
        super().save(*args, **kwargs)
