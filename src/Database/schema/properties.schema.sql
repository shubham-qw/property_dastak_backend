CREATE TABLE IF NOT EXISTS properties (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255), -- optional title
    property_for VARCHAR(20) NOT NULL CHECK (property_for IN ('sell', 'lease/rent', 'pg/hotel')),
    property_type VARCHAR(20) NOT NULL,
    city VARCHAR(100) NOT NULL,
    locality VARCHAR(100) NOT NULL,
    sub_locality VARCHAR(100),
    apartment VARCHAR(100),
    availability_status VARCHAR(20) NOT NULL CHECK (availability_status IN ('ready_to_move', 'under_construction')),
    property_age INT, -- in years
    ownership VARCHAR(30) CHECK (ownership IN ('freehold', 'leasehold', 'co-operative', 'power_of_attorney')),
    price_per_sqft DECIMAL(10,2),
    brokerage_charge DECIMAL(10,2),
    property_size JSONB default null,
    property_latitude double precision default null,
    property_longitude double precision default null,
    description TEXT,
    property_features VARCHAR(256)[] default null,
    property_amenities VARCHAR(256)[] default null,
    created_by UUID NOT NULL,
    updated_by UUID default null,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE properties ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) default null;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS price_interval VARCHAR(20) CHECK (price_interval IN ('MONTHLY', 'TOTAL'));
ALTER TABLE properties ADD COLUMN IF NOT EXISTS property_latitude double precision default null;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS property_longitude double precision default null;

CREATE EXTENSION IF NOT EXISTS postgis;
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS property_location GEOGRAPHY(Point, 4326);

ALTER TABLE properties ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE properties ALTER COLUMN is_verified TYPE VARCHAR(20);
ALTER TABLE properties ALTER COLUMN is_verified SET DEFAULT NULL;
