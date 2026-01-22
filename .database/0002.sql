CREATE TABLE
    IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        name VARCHAR(128) NOT NULL,
        description TEXT,
        location VARCHAR(256) NOT NULL,
        created_by INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
        start_at TIMESTAMP NOT NULL,
        end_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE INDEX IF NOT EXISTS idx_events_start_at ON events (start_at);

CREATE INDEX IF NOT EXISTS idx_events_end_at ON events (end_at);