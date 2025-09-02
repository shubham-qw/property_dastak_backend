CREATE TABLE IF NOT EXISTS property_details (
    property_id BIGINT PRIMARY KEY REFERENCES properties(id) ON DELETE CASCADE,
    rooms INT,
    bathrooms INT,
    balconies INT,
    other_rooms TEXT,
    floors INT
);

