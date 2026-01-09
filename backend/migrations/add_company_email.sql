-- Migration: Add email column to transport_companies table
-- This allows sending cancellation notifications to companies

ALTER TABLE transport_companies 
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

COMMENT ON COLUMN transport_companies.email IS 'Company contact email for notifications';
