# Propylon Document Manager

A document management system built with Django and React, featuring version control and permission management.

## Features

- Document version control
- User authentication and authorization
- File upload and management
- Permission-based access control
- RESTful API
- Modern React frontend with Material-UI

## Prerequisites

- Python 3.11
- Node.js v18.19.0 (LTS)
- Make
- nvm (Node Version Manager)

## Installation

### Backend Setup

1. Clone the repository:
   ```bash
   git clone git@github.com:nikolagigic/document-manager-assessment.git
   cd document-manager-assessment
   ```

2. Create and activate a virtual environment:
   ```bash
   make build
   source .env_python3.11/bin/activate  # On Windows: .env_python3.11\Scripts\activate
   ```

3. Install dependencies and set up the database:
   ```bash
   make fixture
   make serve
   ```

4. Create two superusers for testing:
   ```bash
   python manage.py createsuperuser
   # Create first user with email: admin@example.com
   # Create second user with email: user2@example.com
   ```

The backend will be running at http://localhost:8001

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd client/doc-manager
   ```

2. Use the correct Node.js version:
   ```bash
   nvm use 18.19.0
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm start
   ```

The frontend will be running at http://localhost:3000

## Testing the Application

1. Log in with the first superuser (admin@example.com)
2. Upload some test files
3. Log in with the second superuser (user2@example.com)
4. Test the permission management system:
   - Try to access files owned by the first user
   - Request permissions
   - Test read/write access

### Test Data

The application comes with pre-loaded test data:

1. Two superusers:
   - admin@example.com / admin
   - user2@example.com / (password set during creation)

2. Sample documents:
   - bill_document
   - amendment_document
   - act_document
   - statute_document

## Available Make Commands

- `make build` - Install dependencies and build the project
- `make fixtures` - Load initial test data
- `make serve` - Run the development server
- `make test` - Run tests
- `make clean` - Clean build artifacts
- `make env_clean` - Clean virtual environment

## Project Structure

```
document-manager-assessment/
├── src/
│   └── propylon_document_manager/
│       ├── file_versions/      # File version management
│       ├── site/              # Django project settings
│       └── utils/             # Utility functions
├── client/
│   └── doc-manager/          # React frontend
├── requirements/             # Python dependencies
├── Makefile                 # Build and development commands
└── README.md
```

## Database

The project uses SQLite for development. The database file is located at `src/propylon_document_manager/db.sqlite3`.

## API Documentation

The API documentation is available at http://localhost:8001/api/docs/ when running in development mode.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
