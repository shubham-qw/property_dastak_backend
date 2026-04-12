CREATE TABLE IF NOT EXISTS properties_reels (
    id BIGSERIAL PRIMARY KEY,
        
    description TEXT,
    
    media_path TEXT NOT NULL,
    
    thumbnail_path TEXT,
    
    duration_seconds INTEGER,
    
    views_count BIGINT DEFAULT 0,
    likes_count BIGINT DEFAULT 0,
    
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE properties_reels ADD COLUMN IF NOT EXISTS created_by UUID;