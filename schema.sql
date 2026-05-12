-- AI Traffic Analytics Schema

CREATE TABLE IF NOT EXISTS ai_traffic_events (
    id BIGSERIAL PRIMARY KEY,

    host_name TEXT NOT NULL,
    ai_source TEXT NOT NULL,
    path_name TEXT NOT NULL,
    page_title TEXT NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);