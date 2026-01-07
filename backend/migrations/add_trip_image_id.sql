-- Migration: Add image_id column to trips table
-- هذا السكريبت يضيف عمود image_id إلى جدول trips مع Foreign Key إلى images

-- ============================================
-- إضافة عمود image_id إلى جدول trips
-- ============================================
DO $$ 
BEGIN
  -- Check if column already exists
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'trips' 
    AND column_name = 'image_id'
  ) THEN
    -- Add image_id column as nullable
    ALTER TABLE trips ADD COLUMN image_id INTEGER;
    
    -- Add foreign key constraint with ON DELETE SET NULL
    ALTER TABLE trips 
    ADD CONSTRAINT fk_trips_image_id 
    FOREIGN KEY (image_id) 
    REFERENCES images(id) 
    ON DELETE SET NULL;
    
    -- Add index for better query performance
    CREATE INDEX IF NOT EXISTS idx_trips_image_id ON trips(image_id);
    
    RAISE NOTICE 'Added image_id column to trips table with foreign key constraint';
  ELSE
    RAISE NOTICE 'image_id column already exists in trips table';
  END IF;
END $$;

