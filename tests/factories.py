from collections.abc import Sequence
from typing import Any

from django.contrib.auth import get_user_model
from factory import Faker, post_generation, SubFactory
from factory.django import DjangoModelFactory

from propylon_document_manager.file_versions.models import File, FileVersion


class UserFactory(DjangoModelFactory):
    email = Faker("email")
    name = Faker("name")

    @post_generation
    def password(self, create: bool, extracted: Sequence[Any], **kwargs):
        password = (
            extracted
            if extracted
            else Faker(
                "password",
                length=42,
                special_chars=True,
                digits=True,
                upper_case=True,
                lower_case=True,
            ).evaluate(None, None, extra={"locale": None})
        )
        self.set_password(password)

    class Meta:
        model = get_user_model()
        django_get_or_create = ["email"]


class FileFactory(DjangoModelFactory):
    url_path = Faker("uri_path", deep=1)  # Generate deeper paths
    content_type = Faker("mime_type")
    owner = SubFactory(UserFactory)

    @post_generation
    def ensure_slash_prefix(self, create, extracted, **kwargs):
        if not self.url_path.startswith('/'):
            self.url_path = '/' + self.url_path

    class Meta:
        model = File
        django_get_or_create = ["url_path", "owner"]


class FileVersionFactory(DjangoModelFactory):
    file = SubFactory(FileFactory)
    version_number = Faker("random_int", min=1, max=100)
    file_name = Faker("file_name")
    content = Faker("binary", length=1024)  # 1KB of random binary data

    class Meta:
        model = FileVersion
        django_get_or_create = ["file", "version_number"]
