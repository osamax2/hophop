-- Migration: Add booking_passengers table
-- This table stores passenger names for multi-seat bookings

CREATE TABLE IF NOT EXISTS booking_passengers (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    passenger_name VARCHAR(255) NOT NULL,
    seat_number INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_booking_passengers_booking_id ON booking_passengers(booking_id);

-- Comments
COMMENT ON TABLE booking_passengers IS 'Stores passenger names for multi-seat bookings';
COMMENT ON COLUMN booking_passengers.booking_id IS 'Reference to the booking';
COMMENT ON COLUMN booking_passengers.passenger_name IS 'Full name of the passenger';
COMMENT ON COLUMN booking_passengers.seat_number IS 'Seat position (1-based)';
