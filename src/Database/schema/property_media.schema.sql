CREATE TABLE IF NOT EXISTS property_media (
  id SERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  media_type VARCHAR(20) NOT NULL, -- image | video
  url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_property_media_property_id ON property_media(property_id);


