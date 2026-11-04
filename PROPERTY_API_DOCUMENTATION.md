# Backend API Documentation

## Base URL

- **HTTP API**: `http://localhost:8080`
- **Uploads (static)**: `http://localhost:8080/uploads/<filename>`

## Authentication

- User signup/login endpoints are **public**.
- Most resource endpoints (properties, reels, some user endpoints) are protected by **JWT**.
- **Header**: `Authorization: Bearer <access_token>`
- **Admin** routes (news create/update/delete, `/admin/*`) also require the JWT `user_uuid` to be listed in `ADMIN_USER_UUIDS`. Non-admins receive **403 Forbidden**.

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

### Home Screen Lists (Top by views)

`GET /properties/home`

- **Auth**: Required (JWT) *(same guard as other property endpoints)*

Returns the top 5 properties for each category, ordered by **most viewed** (from `properties_seen_time`), and automatically “fills” with normal/latest properties in that category when view counts are not available.

#### Categories returned

- `rent`: `property_for = "lease/rent"`
- `buy`: `property_for = "sell"`
- `pg`: `property_for = "pg/hotel"`
- `commercial`: `property_type = "commercial"` (case-insensitive)

#### Success response (200)

```json
{
  "rent": [ /* PropertyResponseDto[] */ ],
  "buy": [ /* PropertyResponseDto[] */ ],
  "commercial": [ /* PropertyResponseDto[] */ ],
  "pg": [ /* PropertyResponseDto[] */ ]
}
```

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

### Like Reel

`POST /reels/:id/like`

- **Auth**: Required (JWT)
- Adds a like for the current user if not already liked.
- Increases reel like counter in `properties_reels`.

#### Success response (200)

```json
{
  "reel_id": 12,
  "likes_count": 9,
  "liked": true
}
```

### Dislike Reel

`POST /reels/:id/dislike`

- **Auth**: Required (JWT)
- Removes current user like if present.
- Decreases reel like counter in `properties_reels` (never below 0).

#### Success response (200)

```json
{
  "reel_id": 12,
  "likes_count": 8,
    "liked": false
}
```

---

## News APIs

Base path: `/news`

- **GET** is public (no JWT). Returns only the **latest 10** news items.
- **POST / PUT / DELETE** require **JWT + admin**. The token `user_uuid` must be in `ADMIN_USER_UUIDS`.

Schema fields: `id`, `title`, `image`, `created_at`.

`image` in the response is a stored path (e.g. `/uploads/<filename>`). To **fetch the image**, use the media API (same as properties/reels in production):

`GET /media?fileName=uploads/<filename>&mediaType=image`

Example: if `image` is `/uploads/1730000000000-123456789.jpg`, call:

`GET /media?fileName=uploads/1730000000000-123456789.jpg&mediaType=image`

Drop the leading slash from `image` and pass that as `fileName`.

### List Latest News

`GET /news`

- **Auth**: Not required
- Always returns at most **10** items, newest first (`created_at` descending). No pagination params.

#### Success response (200)

```json
[
  {
    "id": 3,
    "title": "New township launched in Indore",
    "image": "/uploads/1730000000000-123456789.jpg",
    "created_at": "2026-10-20T08:30:00.000Z",
    "news_url": "http://www.youtube.com"
  }
]
```

### Create News

`POST /news`

- **Auth**: Required (JWT + admin)
- **Content-Type**: `multipart/form-data`
- **Form fields**:
  - `title`: required string
  - `image`: required image file (`image/*`)
  "news_url": required string/url

The `image` field in the response is **not** the file bytes. Use this API to fetch the uploaded image:

`GET /media?fileName=uploads/<filename>&mediaType=image`

Take `image` from the create response (e.g. `/uploads/1730000000000-123456789.jpg`), remove the leading `/`, and pass it as `fileName`.

#### Success response (201)

```json
{
  "id": 1,
  "title": "New township launched in Indore",
  "image": "/uploads/1730000000000-123456789.jpg",
  "created_at": "2026-10-20T08:30:00.000Z",
  "news_url": "http://www.youtube.com"
}
```

Fetch that image:

`GET /media?fileName=uploads/1730000000000-123456789.jpg&mediaType=image`

#### Error responses

- **400 Bad Request**: missing `title` or `image`, or non-image file
- **401 Unauthorized**: missing/invalid JWT
- **403 Forbidden**: authenticated user is not an admin

### Update News

`PUT /news/:id`

- **Auth**: Required (JWT + admin)
- **Content-Type**: `multipart/form-data`
- **Form fields** (all optional; send only what you want to change):
  - `title`: string
  - `image`: image file (`image/*`)
   - `news_url`: string

Returns updated `NewsResponseDto`.

#### Error responses

- **400 Bad Request**: non-image file
- **401 Unauthorized**: missing/invalid JWT
- **403 Forbidden**: authenticated user is not an admin
- **404 Not Found**: news id does not exist

### Delete News

`DELETE /news/:id`

- **Auth**: Required (JWT + admin)

Returns **204 No Content** on success.

#### Error responses

- **401 Unauthorized**: missing/invalid JWT
- **403 Forbidden**: authenticated user is not an admin
- **404 Not Found**: news id does not exist

---

## Chat APIs

Base path: `/chat`  
WebSocket path (same Nest port): `ws://localhost:8080/ws/chat?token=<JWT>`

Chat uses the **`ws`** library attached to the existing Nest HTTP server (no extra port).  
Legacy property-view tracking remains on `WS_PORT` (default `4000`).

### REST (JWT required)

#### List conversations

`GET /chat/conversations`

Returns Arrays of conversation with users.

id = conservation_id

[
    {
        "id": 1,
        "created_at": "2026-08-30T11:14:42.742Z",
        "updated_at": "2026-08-30T12:42:36.998Z",
        "other_user": {
            "id": 3,
            "user_uuid": "7051c363-072c-4913-aebc-028f533fcba5",
            "first_name": "Ganesh",
            "last_name": "Gaitonde",
            "is_online": false
        },
        "last_message": {
            "id": 4,
            "conversation_id": 1,
            "sender_id": 2,
            "sender_uuid": "98b38f3c-a4a6-4a3b-8fff-ea02bfcebcf7",
            "content": "Hi, I have some queries about the properties",
            "created_at": "2026-08-30T12:42:36.982Z",
            "is_read": false
        },
        "unread_count": 1
    }
]

#### Start / get direct conversation

`POST /chat/conversations`

use this to create conversation / chat with other users when users are not connected by websockets.

```json
{ "other_user_uuid": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" }
```

Returns `ConversationDto` (creates one if missing).

#### Get messages

`GET /chat/conversations/:id/messages?limit=50&offset=0`

Returns `ChatMessageDto[]` (newest first).

[
    {
        "id": 2,
        "conversation_id": 1,
        "sender_id": 2,
        "sender_uuid": "98b38f3c-a4a6-4a3b-8fff-ea02bfcebcf7",
        "content": "Hi, is this still available?",
        "created_at": "2026-08-30T12:32:11.327Z",
        "is_read": false
    },
    {
        "id": 1,
        "conversation_id": 1,
        "sender_id": 2,
        "sender_uuid": "98b38f3c-a4a6-4a3b-8fff-ea02bfcebcf7",
        "content": "Hello",
        "created_at": "2026-08-30T11:14:42.820Z",
        "is_read": false
    }
]

#### Send message (REST + live fan-out)

`POST /chat/messages`

send message if other user is offline and websocket is disconnected.

```json
{
  "conversation_id": 12,
  "content": "Hello"
}
```

or start/send in one step:

When the conversation is new

```json
{
  "to_user_uuid": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "content": "Hello"
}
```

Online recipients also receive a WS `{ "type": "message", ... }` event.

#### Mark conversation read

`PUT /chat/conversations/:id/read`

```json
{ "ok": true }
```

#### Get user presence

`GET /chat/presence/:userUuid`

```json
{ "user_uuid": "...", "status": "online" }
```

---

### WebSocket protocol

#### Connect

```
ws://localhost:8080/ws/chat?token=<access_token>
```

Auth alternative: `Authorization: Bearer <access_token>` on the upgrade request.

On success:

```json
{
  "type": "connected",
  "user_id": 10,
  "user_uuid": "...",
  "reconnect": true
}
```

- `reconnect: true` means the user was offline and just came back — client should refetch conversations/messages.
- Server heartbeats with WS ping every 30s; dead sockets are dropped and marked offline.

#### Client → Server events

| type | payload | purpose |
|------|---------|---------|
| `ping` | `{}` | keepalive → server replies `pong` |
| `join` | `{ conversation_id }` | subscribe/assert membership |
| `leave` | `{ conversation_id }` | leave room locally |
| `send_message` | `{ conversation_id?, to_user_uuid?, content }` | send chat message |
| `typing` | `{ conversation_id, is_typing }` | live typing indicator |
| `mark_read` | `{ conversation_id }` | mark peer messages read |
| `get_presence` | `{ user_uuids: string[] }` | batch online/offline lookup |

Example send:

```json
{
  "type": "send_message",
  "to_user_uuid": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "content": "Hi, is this still available?"
}
```

Example typing:

```json
{
  "type": "typing",
  "conversation_id": 12,
  "is_typing": true
}
```

#### Server → Client events

| type | meaning |
|------|---------|
| `connected` | auth OK |
| `pong` | response to `ping` |
| `message` | new chat message |
| `typing` | peer typing start/stop |
| `presence` | `{ user_uuid, status: "online"\|"offline" }` |
| `presence_list` | batch presence result |
| `conversation_updated` | inbox row refresh |
| `error` | `{ code, message }` |

#### Online / offline

- First open socket for a user → broadcast `presence` `online`
- Last socket closed / timed out → broadcast `presence` `offline`
- Multi-device: user stays online while any device remains connected

#### Client auto-reconnect (recommended)

Server cannot force reconnect; clients should:

1. On `close` / network error, reconnect with exponential backoff (e.g. 1s → 2s → 4s … max 30s)
2. Reconnect URL must include a fresh JWT (`?token=...`)
3. On `connected` with `reconnect: true`, call:
   - `GET /chat/conversations`
   - `GET /chat/conversations/:id/messages` for open threads
4. Keep sending `ping` every ~20–25s as an app-level keepalive

Example JS reconnect sketch:

```js
let delay = 1000;
function connectChat(token) {
  const ws = new WebSocket(`ws://localhost:8080/ws/chat?token=${token}`);
  ws.onopen = () => { delay = 1000; };
  ws.onclose = () => {
    setTimeout(() => connectChat(token), delay);
    delay = Math.min(delay * 2, 30000);
  };
  ws.onmessage = (e) => {
    const ev = JSON.parse(e.data);
    if (ev.type === 'connected' && ev.reconnect) {
      // refetch conversations + active thread messages
    }
  };
  return ws;
}
```

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

## Maps APIs

Base path: `/maps`

All Maps endpoints require **JWT** (`Authorization: Bearer <access_token>`).

---

### Setup

#### 1. Enable APIs in Google Cloud Console

Go to [console.cloud.google.com](https://console.cloud.google.com) and enable:

- **Geocoding API** — used by `/maps/geocode` and `/maps/reverse-geocode`
- **Places API (New)** — used by `/maps/places/autocomplete` and `/maps/places/details`

> Make sure you enable **Places API (New)**, not the legacy Places API — the legacy version is deprecated and will return an error.

#### 2. Create an API Key

1. Go to **APIs & Services → Credentials → Create Credentials → API Key**
2. Restrict the key to the two APIs above (recommended)
3. Copy the key

#### 4. Add to your `.env`

```
GOOGLE_MAPS_API_KEY=AIza...your_key_here
```

---

### Geocoding — Address to Coordinates

`GET /maps/geocode`

- **Auth**: Required (JWT)

#### Query params

| Param | Required | Description |
|---|---|---|
| `address` | Yes | Human-readable address string |

#### Example request

```
GET /maps/geocode?address=Connaught Place New Delhi
Authorization: Bearer <token>
```

#### Success response (200)

```json
{
  "place_id": "ChIJL1E7VkIDDTkRBHBMnm1mTkE",
  "formatted_address": "Connaught Place, New Delhi, Delhi 110001, India",
  "lat": 28.6315,
  "lng": 77.2167,
  "components": [
    { "name": "Connaught Place", "short_name": "CP", "types": ["sublocality_level_1"] },
    { "name": "New Delhi", "short_name": "New Delhi", "types": ["locality"] },
    { "name": "Delhi", "short_name": "DL", "types": ["administrative_area_level_1"] },
    { "name": "India", "short_name": "IN", "types": ["country"] }
  ]
}
```

#### Error responses

- **400 Bad Request**: no results found for the given address
- **401 Unauthorized**: missing/invalid JWT
- **500 Internal Server Error**: API key not configured or Google returned an error

---

### Reverse Geocoding — Coordinates to Address

`GET /maps/reverse-geocode`

- **Auth**: Required (JWT)

#### Query params

| Param | Required | Validation | Description |
|---|---|---|---|
| `lat` | Yes | -90 to 90 | Latitude |
| `lng` | Yes | -180 to 180 | Longitude |

#### Example request

```
GET /maps/reverse-geocode?lat=28.6315&lng=77.2167
Authorization: Bearer <token>
```

#### Success response (200)

```json
{
  "place_id": "ChIJL1E7VkIDDTkRBHBMnm1mTkE",
  "formatted_address": "Connaught Place, New Delhi, Delhi 110001, India",
  "lat": 28.6315,
  "lng": 77.2167,
  "components": [
    { "name": "Connaught Place", "short_name": "CP", "types": ["sublocality_level_1"] },
    { "name": "New Delhi", "short_name": "New Delhi", "types": ["locality"] },
    { "name": "India", "short_name": "IN", "types": ["country"] }
  ]
}
```

#### Error responses

- **400 Bad Request**: no results found for the given coordinates
- **401 Unauthorized**: missing/invalid JWT

---

### Places Autocomplete — Search Suggestions

`GET /maps/places/autocomplete`

- **Auth**: Required (JWT)
- Returns up to 5 place suggestions for a partial search string.

#### Query params

| Param | Required | Description |
|---|---|---|
| `input` | Yes | Partial search text (e.g. `andheri`) |
| `language` | No | BCP-47 language code (e.g. `en`, `hi`). Defaults to Google's auto-detect. |
| `region` | No | ISO 3166-1 alpha-2 country code(s) to restrict results. Single: `IN`. Multiple (pipe-separated): `IN\|US` |
| `type_filter` | No | Filter result types. Options: `geocode`, `address`, `establishment`, `cities`, `regions`. Multiple (pipe-separated): `address\|cities` |

#### Example requests

Autocomplete within India, in English:
```
GET /maps/places/autocomplete?input=andheri&language=en&region=IN
Authorization: Bearer <token>
```

Autocomplete restricted to addresses only:
```
GET /maps/places/autocomplete?input=sagarp&language=en&region=IN&type_filter=address
Authorization: Bearer <token>
```

#### Success response (200)

```json
{
  "predictions": [
    {
      "place_id": "ChIJP0mGRw_B5zsRgBfxfnj0mCA",
      "description": "Andheri, Mumbai, Maharashtra, India",
      "main_text": "Andheri",
      "secondary_text": "Mumbai, Maharashtra, India",
      "types": ["sublocality", "political", "geocode"]
    },
    {
      "place_id": "ChIJFc9LZRPB5zsRdrQe1dlW3Xo",
      "description": "Andheri East, Mumbai, Maharashtra, India",
      "main_text": "Andheri East",
      "secondary_text": "Mumbai, Maharashtra, India",
      "types": ["sublocality", "political", "geocode"]
    }
  ]
}
```

If no matches are found, `predictions` returns an empty array — not a 404.

#### Error responses

- **400 Bad Request**: `input` is missing or empty
- **401 Unauthorized**: missing/invalid JWT

---

### Place Details — Full Details by Place ID

`GET /maps/places/details`

- **Auth**: Required (JWT)
- Fetches the full details of a place using its `place_id` (obtained from autocomplete).

#### Query params

| Param | Required | Description |
|---|---|---|
| `place_id` | Yes | The place ID from an autocomplete `predictions[].place_id` |
| `language` | No | BCP-47 language code for localised names (e.g. `en`, `hi`) |

#### Example request

```
GET /maps/places/details?place_id=ChIJP0mGRw_B5zsRgBfxfnj0mCA&language=en
Authorization: Bearer <token>
```

#### Success response (200)

```json
{
  "place_id": "ChIJP0mGRw_B5zsRgBfxfnj0mCA",
  "name": "Andheri",
  "formatted_address": "Andheri, Mumbai, Maharashtra 400053, India",
  "lat": 19.1136,
  "lng": 72.8697,
  "types": ["sublocality_level_1", "sublocality", "political"],
  "components": [
    { "name": "Andheri", "short_name": "Andheri", "types": ["sublocality_level_1"] },
    { "name": "Mumbai", "short_name": "Mumbai", "types": ["locality"] },
    { "name": "Maharashtra", "short_name": "MH", "types": ["administrative_area_level_1"] },
    { "name": "India", "short_name": "IN", "types": ["country"] }
  ],
  "maps_uri": "https://maps.google.com/?cid=..."
}
```

#### Error responses

- **400 Bad Request**: `place_id` is missing, empty, or not found
- **401 Unauthorized**: missing/invalid JWT

---

### Typical Usage Flow

The autocomplete and details endpoints are designed to be used together for a location-picker:

```
Step 1 — User types in search box
  → GET /maps/places/autocomplete?input=<text>&region=IN
  ← Show predictions[] as dropdown suggestions

Step 2 — User selects a suggestion
  → GET /maps/places/details?place_id=<selected place_id>
  ← Use lat/lng to store coordinates, formatted_address for display
```

---

### Response field reference

#### `AddressComponent`

| Field | Type | Description |
|---|---|---|
| `name` | string | Full component name (e.g. `Maharashtra`) |
| `short_name` | string | Abbreviated name (e.g. `MH`) |
| `types` | string[] | Component type tags (e.g. `["administrative_area_level_1"]`) |

#### `PlacePrediction`

| Field | Type | Description |
|---|---|---|
| `place_id` | string | Unique place identifier — pass to `/maps/places/details` |
| `description` | string | Full human-readable label |
| `main_text` | string | Primary part of the label (e.g. place name) |
| `secondary_text` | string | Secondary part (e.g. city, state, country) |
| `types` | string[] | Place type tags |

---

## Root Health Endpoint

`GET /`

- **Auth**: Not required

Returns a simple string (e.g. `"Hello World!"`) from `AppController.getHello()` — useful as a health check.
### Signup

## New Sign up
`POST /users/signup`

- **Auth**: Not required
- **Content-Type**: `application/json`

High level body (fields depend on `CreateUserDto`):

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "+919999999999",
  "email": "john@example.com",
  "class": "buyer"
}
```
## Verify otp
`POST /users/verify-otp`

- **Auth**: Not required
- **Content-Type**: `application/json`

High level body (fields depend on `CreateUserDto`):

```json
{ "phone_number": "+919999999999", "otp": "000000" }
```
reponse {
    "is_new_user": true,
    "message": "OTP verified. Complete signup to continue",
    "phone_number": "+919999999999",
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjAsInVzZXJfdXVpZCI6Im90cF9zaWdudXAiLCJwaG9uZV9udW1iZXIiOiIrOTE5OTk5OTk5OTk5IiwicHVycG9zZSI6InNpZ251cCIsIm90cF92ZXJpZmllZCI6dHJ1ZSwiaWF0IjoxNzc1MDUyNDQzLCJleHAiOjE3NzUxMzg4NDN9.oReWqzGZr3AP2vwQhy-ycZVRRa5Y47E_8dfg8tB8NC8",
    "token_type": "Bearer",
    "expires_in": 86400
}
## send otp
`POST /users/send-otp`

- **Auth**: Not required
- **Content-Type**: `application/json`

High level body (fields depend on `CreateUserDto`):

```json
{ "phone_number": "+919999999999" }
