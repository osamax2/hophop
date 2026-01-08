-- Add guest booking fields to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS guest_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS guest_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS guest_phone VARCHAR(50);

-- Update booking_status to support 'pending' for guest bookings
-- Existing statuses: 'confirmed', 'cancelled', 'completed'
-- Guest bookings will start as 'pending' and be confirmed by company
