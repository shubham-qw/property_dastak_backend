# Property CRUD API Documentation

## Overview
The Property API provides comprehensive CRUD operations for managing properties, including related property details and parking information. All endpoints require JWT authentication.

## Base URL
```
http://localhost:3000/properties
```

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## API Endpoints

### 1. Create Property
**POST** `/properties`

Creates a new property with optional property details and parking information.

**Request Body:**
```json
{
  "title": "Beautiful 3BHK Apartment",
  "property_for": "sell",
  "property_type": "apartment",
  "city": "Mumbai",
  "locality": "Andheri West",
  "sub_locality": "Lokhandwala",
  "apartment": "Sunshine Towers",
  "availability_status": "ready_to_move",
  "property_age": 2,
  "ownership": "freehold",
  "price_per_sqft": 15000.50,
  "brokerage_charge": 50000.00,
  "description": "Beautiful apartment with modern amenities",
  "property_features": ["Balcony", "Garden View", "Modern Kitchen"],
  "property_amenities": ["Swimming Pool", "Gym", "Security"],
  "property_details": {
    "rooms": 3,
    "bathrooms": 2,
    "balconies": 1,
    "other_rooms": "Study room",
    "floors": 15
  },
  "parking": {
    "parking_count": 1,
    "parking_type": "covered"
  }
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "title": "Beautiful 3BHK Apartment",
  "property_for": "sell",
  "property_type": "apartment",
  "city": "Mumbai",
  "locality": "Andheri West",
  "sub_locality": "Lokhandwala",
  "apartment": "Sunshine Towers",
  "availability_status": "ready_to_move",
  "property_age": 2,
  "ownership": "freehold",
  "price_per_sqft": 15000.50,
  "brokerage_charge": 50000.00,
  "description": "Beautiful apartment with modern amenities",
  "property_features": ["Balcony", "Garden View", "Modern Kitchen"],
  "property_amenities": ["Swimming Pool", "Gym", "Security"],
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z",
  "property_details": {
    "property_id": 1,
    "rooms": 3,
    "bathrooms": 2,
    "balconies": 1,
    "other_rooms": "Study room",
    "floors": 15
  },
  "parking": {
    "property_id": 1,
    "parking_count": 1,
    "parking_type": "covered"
  }
}
```

### 2. Get All Properties
**GET** `/properties`

Retrieves all properties with their details and parking information.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "title": "Beautiful 3BHK Apartment",
    "property_for": "sell",
    "property_type": "apartment",
    "city": "Mumbai",
    "locality": "Andheri West",
    "sub_locality": "Lokhandwala",
    "apartment": "Sunshine Towers",
    "availability_status": "ready_to_move",
    "property_age": 2,
    "ownership": "freehold",
    "price_per_sqft": 15000.50,
    "brokerage_charge": 50000.00,
    "description": "Beautiful apartment with modern amenities",
    "property_features": ["Balcony", "Garden View", "Modern Kitchen"],
    "property_amenities": ["Swimming Pool", "Gym", "Security"],
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z",
    "property_details": {
      "property_id": 1,
      "rooms": 3,
      "bathrooms": 2,
      "balconies": 1,
      "other_rooms": "Study room",
      "floors": 15
    },
    "parking": {
      "property_id": 1,
      "parking_count": 1,
      "parking_type": "covered"
    }
  }
]
```

### 3. Get Property by ID
**GET** `/properties/:id`

Retrieves a specific property by its ID.

**Response (200 OK):**
```json
{
  "id": 1,
  "title": "Beautiful 3BHK Apartment",
  "property_for": "sell",
  "property_type": "apartment",
  "city": "Mumbai",
  "locality": "Andheri West",
  "sub_locality": "Lokhandwala",
  "apartment": "Sunshine Towers",
  "availability_status": "ready_to_move",
  "property_age": 2,
  "ownership": "freehold",
  "price_per_sqft": 15000.50,
  "brokerage_charge": 50000.00,
  "description": "Beautiful apartment with modern amenities",
  "property_features": ["Balcony", "Garden View", "Modern Kitchen"],
  "property_amenities": ["Swimming Pool", "Gym", "Security"],
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z",
  "property_details": {
    "property_id": 1,
    "rooms": 3,
    "bathrooms": 2,
    "balconies": 1,
    "other_rooms": "Study room",
    "floors": 15
  },
  "parking": {
    "property_id": 1,
    "parking_count": 1,
    "parking_type": "covered"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Property not found",
  "error": "Not Found"
}
```

### 4. Update Property
**PUT** `/properties/:id`

Updates an existing property. Only provided fields will be updated.

**Request Body:**
```json
{
  "title": "Updated Beautiful 3BHK Apartment",
  "price_per_sqft": 16000.00,
  "property_details": {
    "rooms": 4,
    "bathrooms": 3
  },
  "parking": {
    "parking_count": 2,
    "parking_type": "covered"
  }
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "title": "Updated Beautiful 3BHK Apartment",
  "property_for": "sell",
  "property_type": "apartment",
  "city": "Mumbai",
  "locality": "Andheri West",
  "sub_locality": "Lokhandwala",
  "apartment": "Sunshine Towers",
  "availability_status": "ready_to_move",
  "property_age": 2,
  "ownership": "freehold",
  "price_per_sqft": 16000.00,
  "brokerage_charge": 50000.00,
  "description": "Beautiful apartment with modern amenities",
  "property_features": ["Balcony", "Garden View", "Modern Kitchen"],
  "property_amenities": ["Swimming Pool", "Gym", "Security"],
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T11:00:00.000Z",
  "property_details": {
    "property_id": 1,
    "rooms": 4,
    "bathrooms": 3,
    "balconies": 1,
    "other_rooms": "Study room",
    "floors": 15
  },
  "parking": {
    "property_id": 1,
    "parking_count": 2,
    "parking_type": "covered"
  }
}
```

### 5. Delete Property
**DELETE** `/properties/:id`

Deletes a property and all its related data (property details and parking).

**Response (204 No Content):**
No response body

### 6. Search Properties by City
**GET** `/properties/search/city/:city`

Retrieves all properties in a specific city.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "title": "Beautiful 3BHK Apartment",
    "property_for": "sell",
    "property_type": "apartment",
    "city": "Mumbai",
    "locality": "Andheri West",
    // ... other fields
  }
]
```

### 7. Search Properties by Type
**GET** `/properties/search/type/:type`

Retrieves all properties of a specific type.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "title": "Beautiful 3BHK Apartment",
    "property_for": "sell",
    "property_type": "apartment",
    "city": "Mumbai",
    "locality": "Andheri West",
    // ... other fields
  }
]
```

## Data Types and Enums

### PropertyFor
- `sell` - Property for sale
- `lease/rent` - Property for lease/rent
- `pg/hotel` - PG/Hotel accommodation

### AvailabilityStatus
- `ready_to_move` - Ready to move in
- `under_construction` - Under construction

### Ownership
- `freehold` - Freehold property
- `leasehold` - Leasehold property
- `co-operative` - Co-operative society
- `power_of_attorney` - Power of attorney

### ParkingType
- `covered` - Covered parking
- `open` - Open parking

## Validation Rules

### Property Fields
- `title`: Optional, max 255 characters
- `property_for`: Required, must be one of the PropertyFor enum values
- `property_type`: Required, max 20 characters
- `city`: Required, max 100 characters
- `locality`: Required, max 100 characters
- `sub_locality`: Optional, max 100 characters
- `apartment`: Optional, max 100 characters
- `availability_status`: Required, must be one of the AvailabilityStatus enum values
- `property_age`: Optional, must be non-negative integer
- `ownership`: Optional, must be one of the Ownership enum values
- `price_per_sqft`: Optional, decimal number
- `brokerage_charge`: Optional, decimal number
- `description`: Optional, text
- `property_features`: Optional, array of strings
- `property_amenities`: Optional, array of strings

### Property Details Fields
- `rooms`: Optional, non-negative integer
- `bathrooms`: Optional, non-negative integer
- `balconies`: Optional, non-negative integer
- `other_rooms`: Optional, max 500 characters
- `floors`: Optional, non-negative integer

### Parking Fields
- `parking_count`: Optional, non-negative integer
- `parking_type`: Optional, must be one of the ParkingType enum values

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": ["property_for should not be empty"],
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "No authorization header",
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Property not found",
  "error": "Not Found"
}
```

## Usage Examples

### Create a Property
```bash
curl -X POST http://localhost:3000/properties \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Modern 2BHK Flat",
    "property_for": "lease/rent",
    "property_type": "apartment",
    "city": "Delhi",
    "locality": "Dwarka",
    "availability_status": "ready_to_move",
    "property_details": {
      "rooms": 2,
      "bathrooms": 2,
      "balconies": 1
    },
    "parking": {
      "parking_count": 1,
      "parking_type": "open"
    }
  }'
```

### Get All Properties
```bash
curl -X GET http://localhost:3000/properties \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update a Property
```bash
curl -X PUT http://localhost:3000/properties/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "price_per_sqft": 18000.00,
    "description": "Updated description"
  }'
```

### Search by City
```bash
curl -X GET http://localhost:3000/properties/search/city/Mumbai \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Database Schema

The API uses three main tables:

1. **properties** - Main property information
2. **property_details** - Detailed property specifications (linked by property_id)
3. **parking** - Parking information (linked by property_id)

All operations maintain referential integrity and use database transactions for data consistency.

