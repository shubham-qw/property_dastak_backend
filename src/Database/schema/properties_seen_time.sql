CREATE TABLE properties_seen_time (
    id SERIAL PRIMARY KEY,
    property_id TEXT NOT NULL,
    user_id TEXT,
    time_seconds INT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);