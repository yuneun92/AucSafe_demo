-- AucSafe Database Initialization Script
-- This script runs on first container startup

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS aucsafe;

-- Set search path
SET search_path TO aucsafe, public;

-- Grant privileges
GRANT ALL PRIVILEGES ON SCHEMA aucsafe TO aucsafe;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA aucsafe TO aucsafe;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA aucsafe TO aucsafe;

-- Default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA aucsafe
GRANT ALL PRIVILEGES ON TABLES TO aucsafe;

ALTER DEFAULT PRIVILEGES IN SCHEMA aucsafe
GRANT ALL PRIVILEGES ON SEQUENCES TO aucsafe;

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'AucSafe database initialized successfully';
END $$;
