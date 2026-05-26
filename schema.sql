-- AI Traffic Analytics Schema
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS ai_traffic_sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    user_id BIGINT NOT NULL REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS ai_traffic_events (
    id BIGSERIAL PRIMARY KEY,
    ai_source TEXT NOT NULL,
    path_name TEXT NOT NULL,
    page_title TEXT NOT NULL,
    site_id UUID NOT NULL REFERENCES ai_traffic_sites(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);