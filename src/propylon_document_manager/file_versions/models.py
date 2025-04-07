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
    Model representing a file in the system.
    Each file has a unique URL path per user and can have multiple versions.
    """
    url_path = models.CharField(max_length=255)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='files')
    created_at = models.DateTimeField(auto_now_add=True)
    content_type = models.CharField(max_length=100)

    class Meta:
        unique_together = ('url_path', 'owner')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.url_path} (owned by {self.owner.username})"


class FileVersion(models.Model):
    """
    Model representing a version of a file.
    Uses content-addressable storage with SHA-256 hashing.
    """
    file = models.ForeignKey(File, on_delete=models.CASCADE, related_name='versions')
    version_number = models.IntegerField()
    content_hash = models.CharField(max_length=64, db_index=True)
    content = models.BinaryField()
    created_at = models.DateTimeField(auto_now_add=True)
    file_name = models.CharField(max_length=255)
    can_read = models.ManyToManyField(User, related_name='readable_versions', blank=True)
    can_write = models.ManyToManyField(User, related_name='writable_versions', blank=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ('file', 'version_number')
        indexes = [
            models.Index(fields=['content_hash'], name='content_hash_idx'),
        ]

    def __str__(self):
        return f"Version {self.version_number} of {self.file.url_path}"

    def calculate_content_hash(self):
        """Calculate SHA-256 hash of the file content."""
        return hashlib.sha256(self.content).hexdigest()

    def save(self, *args, **kwargs):
        if not self.content_hash:
            self.content_hash = self.calculate_content_hash()
        super().save(*args, **kwargs)
