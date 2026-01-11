-- Seed Fare Categories and Booking Options
-- This script adds common fare categories and booking options

-- Insert Fare Categories if they don't exist
INSERT INTO fare_categories (code, label, description, is_extra) 
VALUES 
  ('ADULT', 'Adult', 'Standard adult fare', false),
  ('STUDENT', 'Student', 'Discounted fare for students with valid ID', false),
  ('SENIOR', 'Senior', 'Discounted fare for seniors (60+)', false),
  ('CHILD', 'Child', 'Discounted fare for children (6-12 years)', false),
  ('INFANT', 'Infant', 'Free or minimal fare for infants (0-5 years)', false)
ON CONFLICT (code) DO NOTHING;

-- Insert Booking Options for Bus (transport_type_id = 2)
-- First check if they don't already exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM booking_options WHERE code = 'FLEXIBLE' AND transport_type_id = 2) THEN
    INSERT INTO booking_options (transport_type_id, code, label, description)
    VALUES (2, 'FLEXIBLE', 'Flexible', 'Change or cancel up to 24h before departure');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM booking_options WHERE code = 'EARLY_BIRD' AND transport_type_id = 2) THEN
    INSERT INTO booking_options (transport_type_id, code, label, description)
    VALUES (2, 'EARLY_BIRD', 'Early Bird', 'Book early and save');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM booking_options WHERE code = 'WINDOW_SEAT' AND transport_type_id = 2) THEN
    INSERT INTO booking_options (transport_type_id, code, label, description)
    VALUES (2, 'WINDOW_SEAT', 'Window Seat', 'Guaranteed window seat');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM booking_options WHERE code = 'EXTRA_LUGGAGE' AND transport_type_id = 2) THEN
    INSERT INTO booking_options (transport_type_id, code, label, description)
    VALUES (2, 'EXTRA_LUGGAGE', 'Extra Luggage', 'Additional 20kg luggage allowance');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM booking_options WHERE code = 'VIP' AND transport_type_id = 2) THEN
    INSERT INTO booking_options (transport_type_id, code, label, description)
    VALUES (2, 'VIP', 'VIP', 'Priority boarding and extra legroom');
  END IF;
END $$;

-- Insert Booking Options for Train (transport_type_id = 7) if exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM transport_types WHERE id = 7) AND 
     NOT EXISTS (SELECT 1 FROM booking_options WHERE code = 'FLEXIBLE' AND transport_type_id = 7) THEN
    INSERT INTO booking_options (transport_type_id, code, label, description)
    VALUES (7, 'FLEXIBLE', 'Flexible', 'Change or cancel up to 24h before departure');
  END IF;
END $$;

-- Display results
SELECT 'Fare Categories:' as info;
SELECT * FROM fare_categories ORDER BY id;

SELECT 'Booking Options:' as info;
SELECT * FROM booking_options ORDER BY id;
