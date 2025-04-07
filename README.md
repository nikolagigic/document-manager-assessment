# Document Manager

A web application for managing document versions with user permissions.

## Features

- User authentication with JWT tokens
- File version management
- Granular permission control (read/write)
- Material-UI based responsive interface
- TypeScript support

## Tech Stack

### Backend
- Django
- Django REST Framework
- JWT Authentication
- PostgreSQL

### Frontend
- React
- TypeScript
- Material-UI
- Axios

## Prerequisites

- Python 3.8+
- Node.js 14+
- PostgreSQL

## Setup

### Backend Setup

1. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run migrations:
```bash
python manage.py migrate
```

5. Create a superuser:
```bash
python manage.py createsuperuser
```

6. Run the development server:
```bash
python manage.py runserver
```

### Frontend Setup

1. Install dependencies:
```bash
cd client/doc-manager
npm install
```

2. Start the development server:
```bash
npm start
```

## API Documentation

See [API.md](API.md) for detailed API documentation.

## Project Structure

```
.
├── client/
│   └── doc-manager/          # Frontend React application
│       ├── src/
│       │   ├── components/   # React components
│       │   ├── contexts/     # React contexts
│       │   └── types/        # TypeScript type definitions
│       └── package.json
├── src/
│   └── propylon_document_manager/  # Backend Django application
│       ├── file_versions/    # File version management app
│       ├── users/           # User management app
│       └── settings.py      # Django settings
├── requirements.txt
└── manage.py
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
