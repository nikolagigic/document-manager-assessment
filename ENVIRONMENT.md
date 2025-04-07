# Environment Configuration

This document outlines the environment variables and configuration settings needed for both development and production environments.

## Backend Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Django Settings
DEBUG=True
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000

# Database Settings
DATABASE_URL=sqlite:///db.sqlite3

# JWT Settings
JWT_SECRET_KEY=your-jwt-secret
JWT_ACCESS_TOKEN_LIFETIME=5

# File Storage
MEDIA_ROOT=media/
MAX_UPLOAD_SIZE=10485760  # 10MB in bytes
```

### Production Settings

For production, update the following variables:

```env
DEBUG=False
ALLOWED_HOSTS=your-domain.com
CORS_ALLOWED_ORIGINS=https://your-domain.com
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

## Frontend Environment Variables

Create a `.env` file in the `client/doc-manager` directory:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:8000
REACT_APP_ENV=development

# Feature Flags
REACT_APP_ENABLE_FILE_PREVIEW=true
REACT_APP_MAX_FILE_SIZE=10485760
```

### Production Settings

For production, update the following variables:

```env
REACT_APP_API_URL=https://api.your-domain.com
REACT_APP_ENV=production
```

## Development Setup

1. Clone the repository
2. Create virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   cd client/doc-manager
   npm install
   ```

4. Set up environment variables:
   - Copy `.env.example` to `.env` in both root and client/doc-manager directories
   - Update the variables as needed

5. Run migrations:
   ```bash
   python manage.py migrate
   ```

6. Start development servers:
   ```bash
   # Backend
   python manage.py runserver

   # Frontend
   cd client/doc-manager
   npm start
   ```

## Production Setup

1. Set up a production server with:
   - Python 3.11
   - Node.js v18.19.0
   - PostgreSQL
   - Nginx
   - SSL certificate

2. Configure environment variables for production

3. Set up the database:
   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   ```

4. Build the frontend:
   ```bash
   cd client/doc-manager
   npm run build
   ```

5. Configure Nginx (see DEPLOYMENT.md)

6. Set up SSL certificate

7. Configure systemd service for the backend

## Environment-specific Features

### Development
- Debug toolbar
- Detailed error pages
- Hot reloading
- SQLite database
- CORS enabled for localhost

### Production
- Minified assets
- Production database
- Error logging
- Security headers
- Rate limiting
- SSL/TLS
- CORS restricted to specific domains

## Security Considerations

1. Never commit `.env` files
2. Use strong, unique secrets
3. Regularly rotate secrets
4. Use HTTPS in production
5. Implement rate limiting
6. Set up proper CORS policies
7. Configure security headers
8. Enable file type validation
9. Implement file size limits
10. Set up proper backup procedures

## Troubleshooting

### Common Issues

1. Database Connection
   - Check DATABASE_URL format
   - Verify database credentials
   - Ensure database server is running

2. CORS Issues
   - Verify CORS_ALLOWED_ORIGINS
   - Check frontend REACT_APP_API_URL
   - Ensure protocols match (http/https)

3. File Upload Issues
   - Check MEDIA_ROOT permissions
   - Verify MAX_UPLOAD_SIZE
   - Ensure storage directory exists

4. JWT Authentication
   - Verify JWT_SECRET_KEY
   - Check token expiration
   - Ensure proper token format

### Logging

Enable detailed logging in development:
```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
}
```

For production, configure file-based logging:
```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'class': 'logging.FileHandler',
            'filename': 'debug.log',
        },
    },
    'root': {
        'handlers': ['file'],
        'level': 'ERROR',
    },
}
``` 