-- Allow NULL user_id for guest bookings
ALTER TABLE bookings ALTER COLUMN user_id DROP NOT NULL;
