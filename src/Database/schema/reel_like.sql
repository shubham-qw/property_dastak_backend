CREATE TABLE IF NOT EXISTS reel_like (
    id BIGSERIAL PRIMARY KEY,
    reel_id BIGINT NOT NULL REFERENCES properties_reels(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reel_like_reel_id ON reel_like(reel_id);
CREATE INDEX IF NOT EXISTS idx_reel_like_user_id ON reel_like(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_reel_like_reel_user ON reel_like(reel_id, user_id);