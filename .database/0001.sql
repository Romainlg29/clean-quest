CREATE TABLE
    IF NOT EXISTS paths (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
        description TEXT,
        path GEOMETRY (LINESTRING, 4326) NOT NULL,
        polygon GEOMETRY (POLYGON, 4326) NOT NULL,
        -- The distance is based on the path
        distance FLOAT NOT NULL,
        -- The surface is based on the polygon
        surface FLOAT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE INDEX IF NOT EXISTS idx_paths_user_id ON paths (user_id);

CREATE INDEX IF NOT EXISTS idx_paths_path ON paths USING GIST (path);

CREATE INDEX IF NOT EXISTS idx_paths_polygon ON paths USING GIST (polygon);

CREATE INDEX IF NOT EXISTS idx_paths_surface ON paths (surface);

CREATE TABLE
    IF NOT EXISTS path_images (
        id SERIAL PRIMARY KEY,
        path_id INTEGER NOT NULL REFERENCES paths (id) ON DELETE CASCADE,
        image_url VARCHAR(256) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

ALTER TABLE users
ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0;