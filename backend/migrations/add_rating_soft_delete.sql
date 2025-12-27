-- Add soft delete functionality to ratings table
-- Run this migration to enable soft delete for ratings

-- Add deleted_at column for soft delete
ALTER TABLE ratings ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Create index for faster queries on deleted ratings
CREATE INDEX IF NOT EXISTS idx_ratings_deleted_at ON ratings(deleted_at);

-- Create index for company_id for faster filtering
CREATE INDEX IF NOT EXISTS idx_ratings_company_id ON ratings(transport_company_id);

-- Create index for user_id for faster filtering
CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON ratings(user_id);

-- Comment
COMMENT ON COLUMN ratings.deleted_at IS 'Timestamp when rating was soft deleted (NULL = active)';
