# JWT Authentication Implementation

## Overview
JWT (JSON Web Token) authentication has been successfully implemented in the Property Dastak user management system.

## Features Added

### 1. JWT Configuration
- **File**: `src/config/jwt.config.ts`
- **Secret Key**: Configurable via environment variable `JWT_SECRET`
- **Token Expiration**: Configurable via environment variable `JWT_EXPIRES_IN` (default: 24h)

### 2. JWT Service
- **File**: `src/User/Providers/jwt.service.ts`
- **Functions**:
  - `generateToken(payload)`: Creates JWT tokens
  - `verifyToken(token)`: Validates JWT tokens
  - `decodeToken(token)`: Decodes JWT tokens
  - `getTokenExpirationTime()`: Returns expiration time in seconds

### 3. Updated User Service
- **File**: `src/User/Providers/portalUser.service.ts`
- **Changes**:
  - `createUser()`: Now returns JWT token with user data
  - `loginUser()`: Now returns JWT token with user data
  - Both methods generate tokens with user ID, UUID, email, and class

### 4. JWT Authentication Guard
- **File**: `src/User/guards/jwt-auth.guard.ts`
- **Protected Routes**:
  - `GET /users` - Get all users
  - `GET /users/:id` - Get user by ID
  - `GET /users/uuid/:uuid` - Get user by UUID
  - `PUT /users/:id` - Update user
  - `DELETE /users/:id` - Delete user

### 5. Updated DTOs
- **File**: `src/User/dto/user.dto.ts`
- **New DTOs**:
  - `AuthResponseDto`: For login responses
  - `SignupResponseDto`: For signup responses

## API Response Format

### Signup Response
```json
{
  "user": {
    "id": 1,
    "user_uuid": "550e8400-e29b-41d4-a716-446655440000",
    "first_name": "John",
    "last_name": "Doe",
    "phone_number": "+1234567890",
    "email": "john.doe@example.com",
    "class": "buyer",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 86400,
  "message": "User registered successfully"
}
```

### Login Response
```json
{
  "user": {
    "id": 1,
    "user_uuid": "550e8400-e29b-41d4-a716-446655440000",
    "first_name": "John",
    "last_name": "Doe",
    "phone_number": "+1234567890",
    "email": "john.doe@example.com",
    "class": "buyer",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 86400
}
```

## Environment Variables

Add these to your `.env` file:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
```

## Usage

### 1. Signup (No Authentication Required)
```bash
curl -X POST http://localhost:3000/users/signup \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "phone_number": "+1234567890",
    "email": "john.doe@example.com",
    "password": "SecurePass123!",
    "class": "buyer"
  }'
```

### 2. Login (No Authentication Required)
```bash
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123!"
  }'
```

### 3. Protected Routes (Authentication Required)
```bash
# Get all users
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get user by ID
curl -X GET http://localhost:3000/users/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Update user
curl -X PUT http://localhost:3000/users/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Jane"
  }'
```

## Token Payload Structure

The JWT token contains:
```json
{
  "sub": 1,                    // User ID
  "user_uuid": "550e8400...",  // User UUID
  "email": "john.doe@example.com",
  "class": "buyer",
  "iat": 1642234567,           // Issued at
  "exp": 1642320967            // Expires at
}
```

## Security Features

1. **Token Expiration**: Tokens expire after 24 hours (configurable)
2. **Secure Secret**: Uses environment variable for JWT secret
3. **Protected Routes**: All user management routes (except signup/login) require authentication
4. **Token Validation**: Automatic token validation on protected routes
5. **Error Handling**: Proper error responses for invalid/missing tokens

## Dependencies Added

- `jsonwebtoken`: For JWT token generation and validation
- `@types/jsonwebtoken`: TypeScript types for jsonwebtoken

