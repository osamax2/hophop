-- Add soft delete support to bookings table

-- Add deleted_at column
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bookings_deleted_at ON bookings(deleted_at);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_trip_id ON bookings(trip_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at);

-- Add comment
COMMENT ON COLUMN bookings.deleted_at IS 'Soft delete timestamp. NULL means active, otherwise deleted';
