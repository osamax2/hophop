-- Migration Script for Existing Database
-- هذا السكريبت يضيف الجداول المفقودة فقط دون التأثير على البيانات الموجودة

-- ============================================
-- إضافة أعمدة latitude و longitude لجدول cities (إن لم تكن موجودة)
-- ============================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cities' AND column_name = 'latitude') THEN
    ALTER TABLE cities ADD COLUMN latitude DECIMAL(10, 8);
    ALTER TABLE cities ADD COLUMN longitude DECIMAL(11, 8);
    RAISE NOTICE 'Added latitude and longitude columns to cities table';
  ELSE
    RAISE NOTICE 'latitude and longitude columns already exist in cities table';
  END IF;
END $$;

-- ============================================
-- إنشاء جدول favorites (إن لم يكن موجوداً)
-- ============================================
CREATE TABLE IF NOT EXISTS favorites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, trip_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_trip_id ON favorites(trip_id);

-- ============================================
-- إنشاء جدول ratings (إن لم يكن موجوداً)
-- ============================================
CREATE TABLE IF NOT EXISTS ratings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  punctuality_rating INTEGER NOT NULL CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5),
  friendliness_rating INTEGER NOT NULL CHECK (friendliness_rating >= 1 AND friendliness_rating <= 5),
  cleanliness_rating INTEGER NOT NULL CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, company_id)
);

CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_company_id ON ratings(company_id);

-- ============================================
-- إنشاء جدول images (إن لم يكن موجوداً)
-- ============================================
CREATE TABLE IF NOT EXISTS images (
  id SERIAL PRIMARY KEY,
  entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('bus', 'station', 'trip')),
  entity_id INTEGER NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  image_path VARCHAR(500),
  file_name VARCHAR(255),
  file_size INTEGER,
  mime_type VARCHAR(50),
  uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_images_entity ON images(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_images_uploaded_by ON images(uploaded_by);

-- ============================================
-- إنشاء جدول notifications (إن لم يكن موجوداً)
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  related_entity_type VARCHAR(50),
  related_entity_id INTEGER,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================
-- إنشاء جدول activity_logs (إن لم يكن موجوداً)
-- ============================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id INTEGER,
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- ============================================
-- إنشاء جدول reviews (إن لم يكن موجوداً)
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
  company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  rating_id INTEGER REFERENCES ratings(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_trip_id ON reviews(trip_id);
CREATE INDEX IF NOT EXISTS idx_reviews_company_id ON reviews(company_id);

-- ============================================
-- إنشاء جدول route_stops (إن لم يكن موجوداً)
-- ============================================
CREATE TABLE IF NOT EXISTS route_stops (
  id SERIAL PRIMARY KEY,
  route_id INTEGER NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  station_id INTEGER NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  stop_order INTEGER NOT NULL,
  arrival_time TIME,
  departure_time TIME,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(route_id, stop_order)
);

CREATE INDEX IF NOT EXISTS idx_route_stops_route_id ON route_stops(route_id);
CREATE INDEX IF NOT EXISTS idx_route_stops_station_id ON route_stops(station_id);

-- ============================================
-- إنشاء Views (إن لم تكن موجودة)
-- ============================================

-- View لتفاصيل الرحلة
CREATE OR REPLACE VIEW trip_details_view AS
SELECT
  t.id,
  t.route_id,
  t.company_id,
  t.transport_type_id,
  t.departure_station_id,
  t.arrival_station_id,
  t.departure_time,
  t.arrival_time,
  t.duration_minutes,
  t.seats_total,
  t.seats_available,
  t.status,
  t.is_active,
  t.equipment,
  t.cancellation_policy,
  t.extra_info,
  c_from.name AS from_city,
  c_to.name AS to_city,
  s_from.name AS departure_station,
  s_to.name AS arrival_station,
  co.name AS company_name,
  tt.name AS transport_type_name,
  MIN(tf.price) AS min_price,
  MIN(tf.currency) AS currency
FROM trips t
JOIN routes r ON t.route_id = r.id
JOIN cities c_from ON r.from_city_id = c_from.id
JOIN cities c_to ON r.to_city_id = c_to.id
JOIN stations s_from ON t.departure_station_id = s_from.id
JOIN stations s_to ON t.arrival_station_id = s_to.id
LEFT JOIN companies co ON t.company_id = co.id
LEFT JOIN transport_types tt ON t.transport_type_id = tt.id
LEFT JOIN trip_fares tf ON tf.trip_id = t.id
GROUP BY
  t.id, t.route_id, t.company_id, t.transport_type_id,
  t.departure_station_id, t.arrival_station_id,
  t.departure_time, t.arrival_time, t.duration_minutes,
  t.seats_total, t.seats_available, t.status, t.is_active,
  t.equipment, t.cancellation_policy, t.extra_info,
  c_from.name, c_to.name, s_from.name, s_to.name,
  co.name, tt.name;

-- View لتلخيص تقييمات الشركات
CREATE OR REPLACE VIEW company_ratings_summary AS
SELECT
  company_id,
  COUNT(*) AS total_ratings,
  ROUND(AVG(punctuality_rating), 2) AS avg_punctuality,
  ROUND(AVG(friendliness_rating), 2) AS avg_friendliness,
  ROUND(AVG(cleanliness_rating), 2) AS avg_cleanliness,
  ROUND(
    (AVG(punctuality_rating) + AVG(friendliness_rating) + AVG(cleanliness_rating)) / 3,
    2
  ) AS overall_average
FROM ratings
GROUP BY company_id;

-- ============================================
-- إنشاء Functions و Triggers
-- ============================================

-- Function لتحديث updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger لـ ratings
DROP TRIGGER IF EXISTS update_ratings_updated_at ON ratings;
CREATE TRIGGER update_ratings_updated_at
  BEFORE UPDATE ON ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger لـ reviews
DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- رسالة النجاح
-- ============================================
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'All required tables, indexes, views, and triggers have been created or verified.';
END $$;
