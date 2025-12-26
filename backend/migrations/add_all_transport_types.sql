-- إضافة جميع أنواع النقل إلى قاعدة البيانات
-- Add all transport types to the database

-- إضافة أنواع النقل إذا لم تكن موجودة
-- Insert transport types if they don't exist

INSERT INTO transport_types (code, label) VALUES
  ('BUS', 'Bus'),
  ('VAN', 'Van'),
  ('VIP_VAN', 'VIP Van'),
  ('SHIP', 'Ship'),
  ('TRAIN', 'Train'),
  ('NORMAL', 'Normal')
ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label;

-- التحقق من النتيجة
-- Verify the result
SELECT id, code, label FROM transport_types ORDER BY id;

