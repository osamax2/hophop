-- Add fare_category_id and booking_option_id to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS fare_category_id INTEGER REFERENCES fare_categories(id),
ADD COLUMN IF NOT EXISTS booking_option_id INTEGER REFERENCES booking_options(id);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_bookings_fare_category ON bookings(fare_category_id);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_option ON bookings(booking_option_id);
