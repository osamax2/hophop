-- Migration: Add branch_staff_roles table and related columns
-- This migration adds the branch staff roles system for company employees

-- Create branch_staff_roles table if not exists
CREATE TABLE IF NOT EXISTS public.branch_staff_roles (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Insert default branch staff roles
INSERT INTO public.branch_staff_roles (code, name, description) 
VALUES 
    ('branch_manager', 'Branch Manager', 'Full access to branch operations'),
    ('ticket_agent', 'Ticket Agent', 'Can manage bookings and tickets'),
    ('driver', 'Driver', 'Can view assigned trips and verify QR codes'),
    ('dispatcher', 'Dispatcher', 'Can manage trip schedules and assignments')
ON CONFLICT (code) DO NOTHING;

-- Add branch_staff_role_id column to users table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'branch_staff_role_id'
    ) THEN
        ALTER TABLE public.users ADD COLUMN branch_staff_role_id INTEGER;
        ALTER TABLE public.users 
            ADD CONSTRAINT fk_users_branch_staff_role 
            FOREIGN KEY (branch_staff_role_id) 
            REFERENCES public.branch_staff_roles(id);
    END IF;
END $$;

-- Create branches table if not exists (for company branch locations)
CREATE TABLE IF NOT EXISTS public.branches (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    city_id INTEGER,
    address TEXT,
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_branches_company FOREIGN KEY (company_id) 
        REFERENCES public.transport_companies(id) ON DELETE CASCADE
);

-- Add branch_id column to users table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'branch_id'
    ) THEN
        ALTER TABLE public.users ADD COLUMN branch_id INTEGER;
        ALTER TABLE public.users 
            ADD CONSTRAINT fk_users_branch 
            FOREIGN KEY (branch_id) 
            REFERENCES public.branches(id);
    END IF;
END $$;

-- Create index for faster role lookups
CREATE INDEX IF NOT EXISTS idx_users_branch_staff_role_id ON public.users(branch_staff_role_id);
CREATE INDEX IF NOT EXISTS idx_users_branch_id ON public.users(branch_id);
