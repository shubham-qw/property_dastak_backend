<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

# Property Dastak - User Management API

A robust NestJS-based REST API for user management with secure authentication, password hashing, and comprehensive CRUD operations.

## 🚀 Features

- **User Registration & Authentication** - Secure signup and login with bcrypt password hashing
- **Password Security** - Salt-based password hashing with configurable rounds
- **Input Validation** - Comprehensive validation using class-validator
- **Database Integration** - PostgreSQL with connection pooling
- **UUID Generation** - Secure user identification
- **RESTful API** - Complete CRUD operations for user management
- **TypeScript** - Full type safety and IntelliSense support

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd project-property_dastak
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PASSWORD=your_postgres_password
   DB_NAME=property_dastak
   DB_PORT=5432
   DB_USER=postgres
   
   # Application Configuration
   PORT=3000
   NODE_ENV=development
   ```

4. **Set up the database**
   ```bash
   # Run the database setup script
   node src/Database/dbSetup.js
   ```

5. **Start the application**
   ```bash
   # Development mode with hot reload
   npm run start:dev
   
   # Production mode
   npm run start:prod
   ```

## 🗄️ Database Schema

The application automatically creates the following tables:

### Users Table
```sql
CREATE TABLE IF NOT EXISTS users (
    id SERIAL,
    user_uuid UUID NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    salt VARCHAR(255) NOT NULL,
    class VARCHAR(10) NOT NULL CHECK (class IN ('buyer', 'seller', 'user')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000
```

### Authentication Endpoints

#### 1. User Registration (Signup)
**POST** `/users/signup`

Creates a new user account with secure password hashing.

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "+1234567890",
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "class": "buyer"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

**User Classes:**
- `buyer` - Property buyers
- `seller` - Property sellers
- `user` - General users

**Response (201 Created):**
```json
{
  "id": 1,
  "user_uuid": "550e8400-e29b-41d4-a716-446655440000",
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "+1234567890",
  "email": "john.doe@example.com",
  "class": "buyer",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

#### 2. User Login
**POST** `/users/login`

Authenticates a user with email and password.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "user_uuid": "550e8400-e29b-41d4-a716-446655440000",
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "+1234567890",
  "email": "john.doe@example.com",
  "class": "buyer",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

### User Management Endpoints

#### 3. Get All Users
**GET** `/users`

Retrieves all users (paginated results).

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "user_uuid": "550e8400-e29b-41d4-a716-446655440000",
    "first_name": "John",
    "last_name": "Doe",
    "phone_number": "+1234567890",
    "email": "john.doe@example.com",
    "class": "buyer",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
]
```

#### 4. Get User by ID
**GET** `/users/:id`

Retrieves a specific user by their ID.

**Response (200 OK):**
```json
{
  "id": 1,
  "user_uuid": "550e8400-e29b-41d4-a716-446655440000",
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "+1234567890",
  "email": "john.doe@example.com",
  "class": "buyer",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

#### 5. Get User by UUID
**GET** `/users/uuid/:uuid`

Retrieves a specific user by their UUID.

**Response (200 OK):**
```json
{
  "id": 1,
  "user_uuid": "550e8400-e29b-41d4-a716-446655440000",
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "+1234567890",
  "email": "john.doe@example.com",
  "class": "buyer",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

#### 6. Update User
**PUT** `/users/:id`

Updates user information. All fields are optional.

**Request Body:**
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "phone_number": "+1987654321",
  "email": "jane.smith@example.com",
  "password": "NewSecurePass456!",
  "class": "seller"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "user_uuid": "550e8400-e29b-41d4-a716-446655440000",
  "first_name": "Jane",
  "last_name": "Smith",
  "phone_number": "+1987654321",
  "email": "jane.smith@example.com",
  "class": "seller",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T11:45:00.000Z"
}
```

#### 7. Delete User
**DELETE** `/users/:id`

Deletes a user account.

**Response (204 No Content)**

### Property Management Endpoints

#### 1. Create Property
**POST** `/properties`

Creates a new property with all related details, parking, amenities, and features.

**Request Body:**
```json
{
  "title": "Beautiful 3BHK Apartment",
  "property_for": "sell",
  "property_type_id": 1,
  "city": "Mumbai",
  "locality": "Andheri West",
  "sub_locality": "Lokhandwala",
  "apartment": "Sunshine Towers",
  "availability_status": "ready_to_move",
  "property_age": 2,
  "ownership": "freehold",
  "price_per_sqft": "15000.00",
  "brokerage_charge": "50000.00",
  "description": "Beautiful 3BHK apartment with modern amenities",
  "property_details": {
    "rooms": 3,
    "bathrooms": 2,
    "balconies": 2,
    "other_rooms": "Study Room, Pooja Room",
    "floors": 15
  },
  "property_parking": {
    "parking_count": 1,
    "parking_type": "covered"
  },
  "amenity_ids": [1, 2, 3, 4, 5],
  "feature_ids": [1, 6, 7, 8]
}
```

**Property For Options:**
- `sell` - For sale
- `lease/rent` - For rent/lease
- `pg/hotel` - PG/Hotel accommodation

**Availability Status:**
- `ready_to_move` - Ready to move in
- `under_construction` - Under construction

**Ownership Types:**
- `freehold` - Freehold property
- `leasehold` - Leasehold property
- `co-operative` - Co-operative society
- `power_of_attorney` - Power of attorney

**Parking Types:**
- `covered` - Covered parking
- `open` - Open parking

**Response (201 Created):**
```json
{
  "id": 1,
  "title": "Beautiful 3BHK Apartment",
  "property_for": "sell",
  "property_type_id": 1,
  "city": "Mumbai",
  "locality": "Andheri West",
  "sub_locality": "Lokhandwala",
  "apartment": "Sunshine Towers",
  "availability_status": "ready_to_move",
  "property_age": 2,
  "ownership": "freehold",
  "price_per_sqft": "15000.00",
  "brokerage_charge": "50000.00",
  "description": "Beautiful 3BHK apartment with modern amenities",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z",
  "property_details": {
    "rooms": 3,
    "bathrooms": 2,
    "balconies": 2,
    "other_rooms": "Study Room, Pooja Room",
    "floors": 15
  },
  "property_parking": {
    "parking_count": 1,
    "parking_type": "covered"
  },
  "amenities": [
    { "id": 1, "name": "Swimming Pool" },
    { "id": 2, "name": "Gym" },
    { "id": 3, "name": "Garden" },
    { "id": 4, "name": "Parking" },
    { "id": 5, "name": "Security" }
  ],
  "features": [
    { "id": 1, "name": "Furnished" },
    { "id": 6, "name": "Corner Property" },
    { "id": 7, "name": "Main Road Facing" },
    { "id": 8, "name": "Park Facing" }
  ],
  "property_type": {
    "id": 1,
    "name": "Apartment"
  }
}
```

#### 2. Get All Properties
**GET** `/properties`

Retrieves all properties with complete details.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "title": "Beautiful 3BHK Apartment",
    "property_for": "sell",
    "property_type_id": 1,
    "city": "Mumbai",
    "locality": "Andheri West",
    "sub_locality": "Lokhandwala",
    "apartment": "Sunshine Towers",
    "availability_status": "ready_to_move",
    "property_age": 2,
    "ownership": "freehold",
    "price_per_sqft": "15000.00",
    "brokerage_charge": "50000.00",
    "description": "Beautiful 3BHK apartment with modern amenities",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z",
    "property_details": {
      "rooms": 3,
      "bathrooms": 2,
      "balconies": 2,
      "other_rooms": "Study Room, Pooja Room",
      "floors": 15
    },
    "property_parking": {
      "parking_count": 1,
      "parking_type": "covered"
    },
    "amenities": [
      { "id": 1, "name": "Swimming Pool" },
      { "id": 2, "name": "Gym" }
    ],
    "features": [
      { "id": 1, "name": "Furnished" },
      { "id": 6, "name": "Corner Property" }
    ],
    "property_type": {
      "id": 1,
      "name": "Apartment"
    }
  }
]
```

#### 3. Get Property by ID
**GET** `/properties/:id`

Retrieves a specific property by ID.

**Response (200 OK):**
```json
{
  "id": 1,
  "title": "Beautiful 3BHK Apartment",
  "property_for": "sell",
  "property_type_id": 1,
  "city": "Mumbai",
  "locality": "Andheri West",
  "sub_locality": "Lokhandwala",
  "apartment": "Sunshine Towers",
  "availability_status": "ready_to_move",
  "property_age": 2,
  "ownership": "freehold",
  "price_per_sqft": "15000.00",
  "brokerage_charge": "50000.00",
  "description": "Beautiful 3BHK apartment with modern amenities",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z",
  "property_details": {
    "rooms": 3,
    "bathrooms": 2,
    "balconies": 2,
    "other_rooms": "Study Room, Pooja Room",
    "floors": 15
  },
  "property_parking": {
    "parking_count": 1,
    "parking_type": "covered"
  },
  "amenities": [
    { "id": 1, "name": "Swimming Pool" },
    { "id": 2, "name": "Gym" }
  ],
  "features": [
    { "id": 1, "name": "Furnished" },
    { "id": 6, "name": "Corner Property" }
  ],
  "property_type": {
    "id": 1,
    "name": "Apartment"
  }
}
```

#### 4. Update Property
**PUT** `/properties/:id`

Updates property information. All fields are optional.

**Request Body:**
```json
{
  "title": "Updated Beautiful 3BHK Apartment",
  "price_per_sqft": "16000.00",
  "property_details": {
    "rooms": 4,
    "bathrooms": 3
  },
  "amenity_ids": [1, 2, 3, 4, 5, 6]
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "title": "Updated Beautiful 3BHK Apartment",
  "property_for": "sell",
  "property_type_id": 1,
  "city": "Mumbai",
  "locality": "Andheri West",
  "sub_locality": "Lokhandwala",
  "apartment": "Sunshine Towers",
  "availability_status": "ready_to_move",
  "property_age": 2,
  "ownership": "freehold",
  "price_per_sqft": "16000.00",
  "brokerage_charge": "50000.00",
  "description": "Beautiful 3BHK apartment with modern amenities",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T11:45:00.000Z",
  "property_details": {
    "rooms": 4,
    "bathrooms": 3,
    "balconies": 2,
    "other_rooms": "Study Room, Pooja Room",
    "floors": 15
  },
  "property_parking": {
    "parking_count": 1,
    "parking_type": "covered"
  },
  "amenities": [
    { "id": 1, "name": "Swimming Pool" },
    { "id": 2, "name": "Gym" },
    { "id": 3, "name": "Garden" },
    { "id": 4, "name": "Parking" },
    { "id": 5, "name": "Security" },
    { "id": 6, "name": "Lift" }
  ],
  "features": [
    { "id": 1, "name": "Furnished" },
    { "id": 6, "name": "Corner Property" }
  ],
  "property_type": {
    "id": 1,
    "name": "Apartment"
  }
}
```

#### 5. Delete Property
**DELETE** `/properties/:id`

Deletes a property and all related data.

**Response (204 No Content)**

#### 6. Get Property Types
**GET** `/properties/types/all`

Retrieves all available property types.

**Response (200 OK):**
```json
[
  { "id": 1, "name": "Apartment" },
  { "id": 2, "name": "Villa" },
  { "id": 3, "name": "House" },
  { "id": 4, "name": "Plot" },
  { "id": 5, "name": "Commercial" }
]
```

#### 7. Get Amenities
**GET** `/properties/amenities/all`

Retrieves all available amenities.

**Response (200 OK):**
```json
[
  { "id": 1, "name": "Swimming Pool" },
  { "id": 2, "name": "Gym" },
  { "id": 3, "name": "Garden" },
  { "id": 4, "name": "Parking" },
  { "id": 5, "name": "Security" }
]
```

#### 8. Get Features
**GET** `/properties/features/all`

Retrieves all available features.

**Response (200 OK):**
```json
[
  { "id": 1, "name": "Furnished" },
  { "id": 2, "name": "Semi-Furnished" },
  { "id": 3, "name": "Unfurnished" },
  { "id": 4, "name": "Pet Friendly" },
  { "id": 5, "name": "Wheelchair Accessible" }
]
```

## 🔧 Testing the API

### Using cURL

#### Signup Example:
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

#### Login Example:
```bash
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123!"
  }'
```

#### Get All Users:
```bash
curl -X GET http://localhost:3000/users
```

### Property API Testing Examples

#### Create Property Example:
```bash
curl -X POST http://localhost:3000/properties \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Beautiful 3BHK Apartment",
    "property_for": "sell",
    "property_type_id": 1,
    "city": "Mumbai",
    "locality": "Andheri West",
    "sub_locality": "Lokhandwala",
    "apartment": "Sunshine Towers",
    "availability_status": "ready_to_move",
    "property_age": 2,
    "ownership": "freehold",
    "price_per_sqft": "15000.00",
    "brokerage_charge": "50000.00",
    "description": "Beautiful 3BHK apartment with modern amenities",
    "property_details": {
      "rooms": 3,
      "bathrooms": 2,
      "balconies": 2,
      "other_rooms": "Study Room, Pooja Room",
      "floors": 15
    },
    "property_parking": {
      "parking_count": 1,
      "parking_type": "covered"
    },
    "amenity_ids": [1, 2, 3, 4, 5],
    "feature_ids": [1, 6, 7, 8]
  }'
```

#### Get All Properties:
```bash
curl -X GET http://localhost:3000/properties
```

#### Get Property Types:
```bash
curl -X GET http://localhost:3000/properties/types/all
```

#### Get Amenities:
```bash
curl -X GET http://localhost:3000/properties/amenities/all
```

### Using Postman

1. **Import the collection** (if available)
2. **Set the base URL** to `http://localhost:3000`
3. **Use the provided examples** above for request bodies

## 🛡️ Security Features

- **Password Hashing**: Uses bcrypt with 12 salt rounds
- **Input Validation**: Comprehensive validation for all inputs
- **SQL Injection Protection**: Parameterized queries
- **UUID Generation**: Secure user identification
- **Error Handling**: Proper error responses without exposing sensitive data

## 📝 Error Handling

The API returns appropriate HTTP status codes and error messages:

- **400 Bad Request**: Validation errors
- **401 Unauthorized**: Invalid login credentials
- **404 Not Found**: User not found
- **409 Conflict**: User already exists
- **500 Internal Server Error**: Server errors

### Example Error Response:
```json
{
  "statusCode": 400,
  "message": [
    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
  ],
  "error": "Bad Request"
}
```

## 🏗️ Project Structure

```
src/
├── Database/
│   ├── dbConn/
│   │   ├── dbClass.ts          # Database connection class
│   │   └── nodeDB.ts           # Database instance
│   ├── dbSetup.js              # Database initialization
│   └── schema/
│       └── user.schema.sql     # User table schema
├── User/
│   ├── dto/
│   │   └── user.dto.ts         # Data transfer objects
│   ├── Providers/
│   │   └── portalUser.service.ts # User service
│   ├── user.controller.ts      # User controller
│   └── user.module.ts          # User module
├── app.controller.ts           # Main app controller
├── app.module.ts              # Main app module
├── app.service.ts             # Main app service
└── main.ts                    # Application entry point
```

## 🚀 Deployment

### Development
```bash
npm run start:dev
```

### Production
```bash
npm run build
npm run start:prod
```

### Docker (Optional)
```bash
# Build the image
docker build -t property-dastak .

# Run the container
docker run -p 3000:3000 property-dastak
```

## 📊 Monitoring

The application logs important events:
- Database connection status
- User registration attempts
- Login attempts
- API request/response logs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Happy Coding! 🎉**
