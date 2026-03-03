# Backend API Documentation

## Base URL

- **HTTP API**: `http://localhost:8080`
- **Uploads (static)**: `http://localhost:8080/uploads/<filename>`

## Authentication

- User signup/login endpoints are **public**.
- Most resource endpoints (properties, reels, some user endpoints) are protected by **JWT**.
- **Header**: `Authorization: Bearer <access_token>`

If the token is missing/invalid/expired, you will receive **401 Unauthorized** where JWT is required.

## Common Types

### Enums

- **property_for**: `sell` | `lease/rent` | `pg/hotel`
- **availability_status**: `ready_to_move` | `under_construction`
- **ownership**: `freehold` | `leasehold` | `co-operative` | `power_of_attorney`
- **price_interval**: `MONTHLY` | `TOTAL`
- **parking_type**: `covered` | `open`

### Notes

- **price_per_sqft**: numeric (stored as `DECIMAL(10,2)`).
- **price_interval**: indicates whether the entered price amount should be treated as **MONTHLY** or **TOTAL**.
- **property_features / property_amenities**: arrays of strings.
- **property_size**: JSON object (arbitrary shape).

---

## Property APIs

### Create Property

### Create Property

`POST /properties`

- **Auth**: Required
- **Content-Type**: `application/json`

#### Request body (CreatePropertyDto)

```json
{
  "title": "2BHK in Central Park",
  "property_for": "lease/rent",
  "property_type": "apartment",
  "city": "Indore",
  "locality": "Vijay Nagar",
  "sub_locality": "Scheme 54",
  "apartment": "Central Park",
  "availability_status": "ready_to_move",
  "property_age": 3,
  "ownership": "freehold",
  "price_per_sqft": 2500,
  "price_interval": "MONTHLY",
  "brokerage_charge": 5000,
  "price": 25000,
  "property_size": { "unit": "sqft", "value": 1200 },
  "description": "Well ventilated, near main road",
  "property_features": ["corner", "park_facing"],
  "property_amenities": ["lift", "gym"],
  "property_details": {
    "rooms": 2,
    "bathrooms": 2,
    "balconies": 1,
    "other_rooms": "store",
    "floors": 5
  },
  "parking": {
    "parking_count": 1,
    "parking_type": "covered"
  }
}
```

#### Success response (201)

```json
{
  "id": 123,
  "title": "2BHK in Central Park",
  "property_for": "lease/rent",
  "property_type": "apartment",
  "city": "Indore",
  "locality": "Vijay Nagar",
  "sub_locality": "Scheme 54",
  "apartment": "Central Park",
  "availability_status": "ready_to_move",
  "property_age": 3,
  "ownership": "freehold",
  "price_per_sqft": "2500.00",
  "price_interval": "MONTHLY",
  "brokerage_charge": "5000.00",
  "price": "25000.00",
  "description": "Well ventilated, near main road",
  "property_features": ["corner", "park_facing"],
  "property_amenities": ["lift", "gym"],
  "created_at": "2026-03-03T12:00:00.000Z",
  "updated_at": "2026-03-03T12:00:00.000Z",
  "property_details": {
    "property_id": 123,
    "rooms": 2,
    "bathrooms": 2,
    "balconies": 1,
    "other_rooms": "store",
    "floors": 5
  },
  "parking": {
    "property_id": 123,
    "parking_count": 1,
    "parking_type": "covered"
  }
}
```

#### Error responses

- **400 Bad Request**: validation error / DB error
- **401 Unauthorized**: missing/invalid JWT

---

### Upload Property Media (Images + Video)

`POST /properties/:id/media`

- **Auth**: Required
- **Content-Type**: `multipart/form-data`
- **Uploads directory**: `./uploads` (served via `/uploads/`)

#### Form-data fields

- **images**: up to 10 files (optional)
- **video**: up to 1 file (optional)

#### Success response (201)

```json
{
  "uploaded": 2,
  "items": [
    { "media_type": "image", "url": "/uploads/1750000000000-123456789.png" },
    { "media_type": "video", "url": "/uploads/1750000000000-987654321.mp4" }
  ]
}
```

---

### Get All Properties (for current user)

`GET /properties`

- **Auth**: Required

#### Success response (200)

Returns an array of `PropertyResponseDto`. Each item may include:

- `images`: string[]
- `videos`: string[]
- `property_details`: object (optional)
- `parking`: object (optional)

---

### Get Most Clicked Properties

`GET /properties/most-clicked?limit=1`

- **Auth**: Required
- **Query params**:
  - `limit` (optional, default `1`, min `1`)

#### Success response (200)

If `limit=1`, returns a **single object** (or a `{ "message": "No property found" }` object if none).
If `limit>1`, returns an array.

Example (limit=1):

```json
{
  "id": 123,
  "name": "2BHK in Central Park",
  "price": "25000.00",
  "image": "/uploads/1750000000000-123456789.png",
  "location": null,
  "description": "Well ventilated, near main road",
  "_clicks": 10
}
```

---

### Get Property By ID

`GET /properties/:id`

- **Auth**: Required

#### Success response (200)

Returns a `PropertyResponseDto`.

#### Error responses

- **404 Not Found**: property not found

---

### Update Property

`PUT /properties/:id`

- **Auth**: Required
- **Content-Type**: `application/json`
- Send only fields you want to update.

#### Example request body

```json
{
  "price_per_sqft": 2800,
  "price_interval": "TOTAL",
  "price": 7200000,
  "description": "Updated description"
}
```

#### Success response (200)

Returns updated `PropertyResponseDto`.

---

### Delete Property

`DELETE /properties/:id`

- **Auth**: Required

#### Success response (204)

No content.

---

### Search Properties by City

`GET /properties/search/city/:city`

- **Auth**: Required

#### Success response (200)

Array of `PropertyResponseDto`.

---

### Search Properties by Type

`GET /properties/search/type/:type`

- **Auth**: Required

#### Success response (200)

Array of `PropertyResponseDto`.

---

### Save a Property (bookmark)

`POST /properties/user/save`

- **Auth**: Required
- **Content-Type**: `application/json`

#### Request body

```json
{ "propertyId": 123 }
```

#### Success response (201)

No body.

#### Error responses

- **400 Bad Request**: property already saved / other failure

---

### Get Saved Properties (bookmarks)

`GET /properties/user/save`

- **Auth**: Required

#### Success response (200)

```json
[
  { "userId": 10, "propertyId": 123 },
  { "userId": 10, "propertyId": 456 }
]
```

---

## User APIs

Base path: `/users`

### Signup

`POST /users/signup`

- **Auth**: Not required
- **Content-Type**: `application/json`

High level body (fields depend on `CreateUserDto`):

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "StrongPassword123"
}
```

Returns a `SignupResponseDto` (user info + any auth-related data defined in the service).

### Login

`POST /users/login`

- **Auth**: Not required
- **Content-Type**: `application/json`

Example body (based on `LoginUserDto`):

```json
{
  "email": "john@example.com",
  "password": "StrongPassword123"
}
```

Returns an `AuthResponseDto`, typically:

```json
{
  "access_token": "<JWT>",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Get All Users

`GET /users`

- **Auth**: Required (JWT)

Returns an array of `UserResponseDto`.

### Get User By ID

`GET /users/:id`

- **Auth**: Required (JWT)

Returns a single `UserResponseDto`.

### Get User By UUID

`GET /users/uuid/:uuid`

- **Auth**: Required (JWT)

Returns a single `UserResponseDto`.

### Update User

`PUT /users/:id`

- **Auth**: Required (JWT)
- **Content-Type**: `application/json`

Body: any subset of `CreateUserDto` fields to update.

Returns updated `UserResponseDto`.

### Delete User

`DELETE /users/:id`

- **Auth**: Required (JWT)

Returns **204 No Content** on success.

---

## Reels APIs

Base path: `/reels`

All reels endpoints require **JWT**.

### Create Reel

`POST /reels`

- **Auth**: Required (JWT)
- **Content-Type**: `multipart/form-data`
- **Form fields**:
  - `video`: required video file.
  - other text fields as defined in `CreateReelDto` (e.g. `title`, `description`, etc.).

On success returns a `ReelResponseDto` with fields such as id, title, description, media URL, timestamps, etc.

### List Reels

`GET /reels?limit=20&offset=0`

- **Auth**: Required (JWT)
- **Query params**:
  - `limit` (optional, default `20`, min `1`)
  - `offset` (optional, default `0`, min `0`)

Returns an array of `ReelResponseDto`. The current user id (if present in JWT) is passed through to the service for any personalization.

### Get Reel By ID

`GET /reels/:id`

- **Auth**: Required (JWT)

Returns a single `ReelResponseDto`.

### Update Reel

`PUT /reels/:id`

- **Auth**: Required (JWT)
- **Content-Type**: `application/json`

Body: subset of fields from `UpdateReelDto` (e.g. `title`, `description`, etc.).

Returns updated `ReelResponseDto`.

### Delete Reel

`DELETE /reels/:id`

- **Auth**: Required (JWT)

Returns **204 No Content** on success.

---

## Leads APIs

Base path: `/leads`

All lead endpoints are **public** (no auth guard in the controller).

Each endpoint accepts a JSON body conforming to its respective DTO and stores the lead with a specific type.

### Movers & Packers Lead

`POST /leads/movers-packers`

Body: `MoversPackersLeadDto` (e.g. name, phone, city, move date, etc.).

### Interior Designers Lead

`POST /leads/interior-designers`

Body: `InteriorDesignersLeadDto` (e.g. name, phone, city, budget, etc.).

### Home Loan Lead

`POST /leads/home-loan`

Body: `HomeLoanLeadDto` (e.g. name, phone, income, loan amount, etc.).

### Vastu Lead

`POST /leads/vastu`

Body: `VastuLeadDto` (e.g. name, phone, city, property type, etc.).

All four endpoints return whatever the `LeadsService.createLead(...)` method returns (typically a persisted lead record or status object).

---

## Media Streaming API

Base path: `/media`

### Stream Image or Video

`GET /media?fileName=<name>&mediaType=<image|video>`

- **Auth**: Not required (controller has no guard).
- **Query params**:
  - `fileName`: required, the exact file name as stored on disk (e.g. `1750000000000-123456789.mp4`).
  - `mediaType`: required, either `image` or `video`.

#### Behavior

- Validates `fileName` and `mediaType`.
- Resolves the file path safely via the media service.
- Determines MIME type from the file extension.
- For `image`:
  - Streams the full file with `Content-Type` set appropriately.
- For `video`:
  - Supports HTTP **Range** requests for efficient streaming/seek.
  - If `Range` header is missing, returns the full file with `200 OK`.
  - If `Range` is present, returns partial content with `206 Partial Content` and correct `Content-Range`, `Content-Length`, etc.

#### Error responses

- **400 Bad Request**: missing `fileName` or invalid `mediaType`.
- **404 Not Found**: file missing or invalid path.
- **416 Range Not Satisfiable**: bad range header for video.

---

## Root Health Endpoint

`GET /`

- **Auth**: Not required

Returns a simple string (e.g. `"Hello World!"`) from `AppController.getHello()` — useful as a health check.

