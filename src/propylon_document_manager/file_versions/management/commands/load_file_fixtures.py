from django.core.management.base import BaseCommand, CommandError
from propylon_document_manager.file_versions.models import File, FileVersion
from django.contrib.auth import get_user_model

User = get_user_model()

file_versions = [
    'bill_document',
    'amendment_document',
    'act_document',
    'statute_document',
]

class Command(BaseCommand):
    help = "Load basic file version fixtures"

    def handle(self, *args, **options):
        # Get or create a superuser for testing
        try:
            user = User.objects.get(email='admin@example.com')
        except User.DoesNotExist:
            user = User.objects.create_superuser(
                email='admin@example.com',
                username='admin',
                password='admin'
            )

        for file_name in file_versions:
            # Create the file first
            file = File.objects.create(
                url_path=f'/documents/{file_name}',
                owner=user,
                content_type='application/pdf'
            )
            
            # Then create the file version
            FileVersion.objects.create(
                file=file,
                file_name=file_name,
                version_number=1,
                content=b''  # Empty content for now
            )

        self.stdout.write(
            self.style.SUCCESS('Successfully created %s file versions' % len(file_versions))
        )
