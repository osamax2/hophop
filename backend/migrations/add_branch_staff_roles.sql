-- Migration: Add branch_staff_roles table
-- This table defines roles for staff within a branch

-- Create the branch_staff_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS branch_staff_roles (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Add branch_staff_role_id column to users if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'branch_staff_role_id'
    ) THEN
        ALTER TABLE users ADD COLUMN branch_staff_role_id INTEGER REFERENCES branch_staff_roles(id);
    END IF;
END $$;

-- Insert default branch staff roles
INSERT INTO branch_staff_roles (code, name, description) VALUES
    ('branch_manager', 'Branch Manager', 'Full access to branch operations'),
    ('ticket_agent', 'Ticket Agent', 'Can manage bookings and tickets'),
    ('driver', 'Driver', 'Can view assigned trips and verify QR codes'),
    ('dispatcher', 'Dispatcher', 'Can manage trip schedules and assignments')
ON CONFLICT (code) DO NOTHING;

-- Add comment
COMMENT ON TABLE branch_staff_roles IS 'Defines roles for staff within a transport company branch';
