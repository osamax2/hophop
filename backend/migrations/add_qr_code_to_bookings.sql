-- Add QR code data column to bookings table (already added)
-- ALTER TABLE bookings 
-- ADD COLUMN IF NOT EXISTS qr_code_data VARCHAR(255) UNIQUE;

-- Update status values to include new statuses
-- No constraint needed - booking_status is just a VARCHAR field

-- Create index on qr_code_data for faster lookups (already created)
-- CREATE INDEX IF NOT EXISTS idx_bookings_qr_code_data ON bookings(qr_code_data);

-- Migration complete - qr_code_data column and index already exist
SELECT 'Migration completed: QR code support added' as status;
