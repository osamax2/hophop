-- Migration: Add bus_number and driver_name columns to trips table
-- Date: 2025-12-25

-- Add bus_number column
ALTER TABLE trips 
ADD COLUMN IF NOT EXISTS bus_number VARCHAR(50);

-- Add driver_name column
ALTER TABLE trips 
ADD COLUMN IF NOT EXISTS driver_name VARCHAR(100);

-- Add comments for documentation
COMMENT ON COLUMN trips.bus_number IS 'رقم الباص';
COMMENT ON COLUMN trips.driver_name IS 'اسم السائق';

