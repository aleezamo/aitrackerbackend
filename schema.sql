-- AI Traffic Analytics Schema
CREATE TABLE IF NOT EXISTS ai_traffic_sites (
    id BIGSERIAL PRIMARY KEY,
    domain TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_traffic_events (
    id BIGSERIAL PRIMARY KEY,
    ai_source TEXT NOT NULL,
    path_name TEXT NOT NULL,
    page_title TEXT NOT NULL,
    site_id BIGINT NOT NULL REFERENCES ai_traffic_sites(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);