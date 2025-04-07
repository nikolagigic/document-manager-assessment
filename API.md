# Document Manager API Documentation

## Authentication

All API endpoints require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Authentication Endpoints

#### Login
- **URL**: `/api/token/`
- **Method**: `POST`
- **Description**: Authenticate user and receive JWT token
- **Request Body**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "access": "string",
    "refresh": "string"
  }
  ```

#### Refresh Token
- **URL**: `/api/token/refresh/`
- **Method**: `POST`
- **Description**: Get new access token using refresh token
- **Request Body**:
  ```json
  {
    "refresh": "string"
  }
  ```
- **Response**:
  ```json
  {
    "access": "string"
  }
  ```

## File Versions

### List File Versions
- **URL**: `/api/file-versions/`
- **Method**: `GET`
- **Description**: Get list of all file versions
- **Response**:
  ```json
  [
    {
      "id": number,
      "version_number": number,
      "file": {
        "id": number,
        "name": string,
        "owner": {
          "id": number,
          "username": string
        }
      },
      "file_owner": {
        "id": number,
        "username": string
      },
      "uploaded_at": string,
      "can_read": [
        {
          "id": number,
          "username": string,
          "email": string
        }
      ],
      "can_write": [
        {
          "id": number,
          "username": string,
          "email": string
        }
      ]
    }
  ]
  ```

### Create File Version
- **URL**: `/api/file-versions/`
- **Method**: `POST`
- **Description**: Upload a new file version
- **Request Body**: `multipart/form-data`
  - `file`: File to upload
  - `description`: Version description
- **Response**: Created file version object

### Delete File Version
- **URL**: `/api/file-versions/{version_id}/`
- **Method**: `DELETE`
- **Description**: Delete a specific file version
- **Response**: 204 No Content

### Set File Version Permissions
- **URL**: `/api/file-versions/{version_id}/set_permissions/`
- **Method**: `POST`
- **Description**: Set read/write permissions for a file version
- **Request Body**:
  ```json
  {
    "can_read": [number],  // Array of user IDs
    "can_write": [number]  // Array of user IDs
  }
  ```
- **Response**: Updated file version object

## Users

### List Users
- **URL**: `/api/users/`
- **Method**: `GET`
- **Description**: Get list of all users
- **Response**:
  ```json
  [
    {
      "id": number,
      "username": string,
      "email": string
    }
  ]
  ```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "detail": "Error message describing what went wrong"
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
  "detail": "You do not have permission to perform this action."
}
```

### 404 Not Found
```json
{
  "detail": "Not found."
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error occurred."
}
```

## Notes

1. All timestamps are in ISO 8601 format
2. File permissions can only be set by the file owner
3. Users cannot set permissions for the file owner
4. The file owner always has full read/write access to their files 