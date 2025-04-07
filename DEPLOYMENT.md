# Deployment Guide

## Prerequisites

- Python 3.11
- Node.js v18.19.0 (LTS)
- PostgreSQL (for production)
- Nginx (recommended for production)
- SSL certificate

## Environment Configuration

### Backend (.env)

```env
DEBUG=False
SECRET_KEY=your-secure-secret-key
ALLOWED_HOSTS=your-domain.com
CORS_ALLOWED_ORIGINS=https://your-domain.com
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
JWT_SECRET_KEY=your-secure-jwt-secret
JWT_ACCESS_TOKEN_LIFETIME=5
```

### Frontend (.env)

```env
REACT_APP_API_URL=https://api.your-domain.com
REACT_APP_ENV=production
```

## Security Considerations

### 1. JWT Token Security
- Store JWT secret key securely
- Use environment variables for sensitive data
- Implement token refresh mechanism
- Set appropriate token expiration times

### 2. CORS Configuration
- Configure CORS to only allow specific origins
- Use HTTPS in production
- Implement proper CORS headers

### 3. File Upload Security
- Implement file size limits
- Validate file types
- Scan files for malware (consider implementing)
- Use secure file storage

### 4. Database Security
- Use strong passwords
- Implement connection pooling
- Regular backups
- Use SSL for database connections

### 5. API Security
- Rate limiting
- Input validation
- Proper error handling
- Logging and monitoring

## Deployment Steps

### 1. Backend Deployment

```bash
# Install dependencies
pip install -r requirements.txt

# Collect static files
python manage.py collectstatic

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run with Gunicorn
gunicorn propylon_document_manager.wsgi:application --bind 0.0.0.0:8000
```

### 2. Frontend Deployment

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Serve with Nginx
```

### 3. Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Frontend
    location / {
        root /path/to/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Monitoring and Maintenance

1. Set up logging
   - Use proper log levels
   - Implement log rotation
   - Monitor error logs

2. Regular backups
   - Database backups
   - File storage backups
   - Configuration backups

3. Security updates
   - Regular dependency updates
   - Security patches
   - SSL certificate renewal

4. Performance monitoring
   - Set up monitoring tools
   - Monitor API response times
   - Track resource usage

## Troubleshooting

1. Check logs
   - Application logs
   - Nginx logs
   - Database logs

2. Common issues
   - Database connection issues
   - File permission problems
   - CORS errors
   - SSL certificate issues

## Support

For deployment support, contact:
- Email: support@your-domain.com
- Documentation: https://docs.your-domain.com 