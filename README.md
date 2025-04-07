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
- SQLite (default, can be changed to PostgreSQL)

### Frontend
- React
- TypeScript
- Material-UI
- Axios

## Prerequisites

- Python 3.11 (required for virtual environment)
- Node.js v18.19.0 (LTS)
- Make

## Setup

### Backend Setup

1. Create the virtual environment and install dependencies:
```bash
make build
```

2. Create initial fixtures (sample data):
```bash
make fixtures
```

3. Create two superusers for testing:
```bash
python manage.py createsuperuser
# Follow the prompts to create the first user
python manage.py createsuperuser
# Follow the prompts to create the second user
```

4. Start the development server:
```bash
make serve
```
The server will start on port 8001.

5. (Optional) Run tests:
```bash
make test
```

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client/doc-manager
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```
The React app will start on port 3000.

## Testing the Application

1. Open your browser and navigate to `http://localhost:3000`
2. Log in with one of the superuser accounts you created
3. Upload a file using the file upload component
4. Create another file version
5. Test the permissions by:
   - Logging in as the second user
   - Verifying that you can see the files shared with you
   - Attempting to modify permissions (should be restricted)

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
├── Makefile                 # Development utilities
└── manage.py
```

## Available Make Commands

- `make build` - Create virtual environment and install dependencies
- `make fixtures` - Create initial fixtures
- `make serve` - Start the development server
- `make test` - Run the test suite
- `make clean` - Clean up build artifacts

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
