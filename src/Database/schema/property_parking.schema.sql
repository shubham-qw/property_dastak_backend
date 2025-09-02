CREATE TABLE IF NOT EXISTS parking (
    property_id BIGINT PRIMARY KEY REFERENCES properties(id) ON DELETE CASCADE,
    parking_count INT,
    parking_type VARCHAR(10) CHECK (parking_type IN ('covered', 'open'))
);

