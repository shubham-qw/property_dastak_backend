CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  service_type VARCHAR(50) NOT NULL,
  city VARCHAR(100) NOT NULL,
  pincode VARCHAR(20) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  extra JSONB NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_leads_service_type ON leads(service_type);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);


