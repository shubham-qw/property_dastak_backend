# Leads API Documentation

## Overview
The Leads API collects user submissions from marketing forms (Movers & Packers, Interior Designers, Home Loan, Vastu) and stores them in the `leads` table.

- Public endpoints (no auth required)
- JSON request/response
- Validated via class-validator

## Base URL
```
http://localhost:8080/leads
```

## Common Fields
- `city` (string, required)
- `pincode` (string, required)
- `phone` (string, required)

Additional fields per service are noted below.

## Endpoints

### 1) Create Movers & Packers Lead
**POST** `/leads/movers-packers`

Request body:
```json
{
  "moveType": "local",
  "city": "Pune",
  "pincode": "411001",
  "phone": "+919876543210"
}
```

Response (201 Created):
```json
{ "id": 123 }
```

Validation errors (400):
```json
{ "statusCode": 400, "message": ["moveType must be one of the following values: local, intercity"], "error": "Bad Request" }
```

---

### 2) Create Interior Designers Lead
**POST** `/leads/interior-designers`

Request body:
```json
{
  "city": "Bengaluru",
  "pincode": "560001",
  "phone": "+919812345678"
}
```

Response (201 Created):
```json
{ "id": 124 }
```

---

### 3) Create Home Loan Lead
**POST** `/leads/home-loan`

Request body:
```json
{
  "city": "Mumbai",
  "pincode": "400001",
  "phone": "+919700000000"
}
```

Response (201 Created):
```json
{ "id": 125 }
```

---

### 4) Create Vastu Lead
**POST** `/leads/vastu`

Request body:
```json
{
  "consultationType": "online",
  "city": "Delhi",
  "pincode": "110001",
  "phone": "+919600000000"
}
```

Response (201 Created):
```json
{ "id": 126 }
```

Validation errors (400):
```json
{ "statusCode": 400, "message": ["consultationType must be one of the following values: online, offline"], "error": "Bad Request" }
```

## Notes
- Extra fields are stored in `leads.extra` JSONB (fields other than `city`, `pincode`, `phone`).
- DB schema file: `src/Database/schema/leads.schema.sql`. Run your setup to create the table if not present.

## cURL Examples
```bash
# Movers & Packers
curl -X POST http://localhost:8080/leads/movers-packers \
  -H "Content-Type: application/json" \
  -d '{
    "moveType": "intercity",
    "city": "Pune",
    "pincode": "411001",
    "phone": "+919876543210"
  }'

# Interior Designers
curl -X POST http://localhost:8080/leads/interior-designers \
  -H "Content-Type: application/json" \
  -d '{
    "city": "Bengaluru",
    "pincode": "560001",
    "phone": "+919812345678"
  }'

# Home Loan
curl -X POST http://localhost:8080/leads/home-loan \
  -H "Content-Type: application/json" \
  -d '{
    "city": "Mumbai",
    "pincode": "400001",
    "phone": "+919700000000"
  }'

# Vastu
curl -X POST http://localhost:8080/leads/vastu \
  -H "Content-Type: application/json" \
  -d '{
    "consultationType": "online",
    "city": "Delhi",
    "pincode": "110001",
    "phone": "+919600000000"
  }'
```

## Response Codes
- 201 Created: Lead stored, returns `{ id }`
- 400 Bad Request: Validation error (array of messages)


