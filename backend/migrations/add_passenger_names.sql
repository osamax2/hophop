-- Create table for passenger names (multiple passengers per booking)
CREATE TABLE IF NOT EXISTS booking_passengers (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  passenger_name VARCHAR(255) NOT NULL,
  seat_number INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add booking token for encrypted status links
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS status_token VARCHAR(255) UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_booking_passengers_booking_id ON booking_passengers(booking_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status_token ON bookings(status_token);
