-- Allow NULL user_id for guest bookings
ALTER TABLE bookings ALTER COLUMN user_id DROP NOT NULL;
-- Add guest booking fields to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS guest_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS guest_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS guest_phone VARCHAR(50);

-- Update booking_status to support 'pending' for guest bookings
-- Existing statuses: 'confirmed', 'cancelled', 'completed'
-- Guest bookings will start as 'pending' and be confirmed by company
-- Add QR code data column to bookings table (already added)
-- ALTER TABLE bookings 
-- ADD COLUMN IF NOT EXISTS qr_code_data VARCHAR(255) UNIQUE;

-- Update status values to include new statuses
-- No constraint needed - booking_status is just a VARCHAR field

-- Create index on qr_code_data for faster lookups (already created)
-- CREATE INDEX IF NOT EXISTS idx_bookings_qr_code_data ON bookings(qr_code_data);

-- Migration complete - qr_code_data column and index already exist
SELECT 'Migration completed: QR code support added' as status;
