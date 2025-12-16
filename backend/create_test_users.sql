-- سكريبت إنشاء حسابات وهمية للاختبار (SQL فقط)
-- ملاحظة: هذا السكريبت يحتاج إلى تشغيل create_test_users.js للحصول على كلمات مرور مشفرة بشكل صحيح
-- أو يمكنك استخدام السكريبت JavaScript مباشرة: node backend/create_test_users.js

-- ============================================
-- إنشاء أدوار (Roles) إن لم تكن موجودة
-- ============================================
INSERT INTO roles (code, name) VALUES 
('ADMIN', 'Administrator'),
('AGENT', 'Agent'),
('USER', 'User')
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- ملاحظة مهمة:
-- كلمات المرور في هذا الملف هي أمثلة فقط
-- يجب تشغيل create_test_users.js للحصول على hash صحيح
-- ============================================

-- للحصول على hash صحيح، شغّل:
-- node -e "const bcrypt = require('bcrypt'); bcrypt.hash('admin123', 10).then(h => console.log(h));"

-- ثم استبدل password_hash في الاستعلامات التالية

-- ============================================
-- حساب Admin (الإداري)
-- Email: admin@test.com
-- Password: admin123
-- ============================================
-- استبدل $2b$10$... بالـ hash الصحيح من create_test_users.js
INSERT INTO users (
  email,
  password_hash,
  first_name,
  last_name,
  phone,
  gender,
  date_of_birth,
  is_active
) VALUES (
  'admin@test.com',
  '$2b$10$EXAMPLE_HASH_REPLACE_WITH_REAL_HASH', -- استبدل هذا بالـ hash الصحيح
  'Admin',
  'User',
  '+963123456789',
  'male',
  '1990-01-01',
  true
)
ON CONFLICT (email) DO NOTHING
RETURNING id;

-- ربط Admin بالدور
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.email = 'admin@test.com' AND r.code = 'ADMIN'
ON CONFLICT DO NOTHING;

-- ============================================
-- حساب Agent (الوكيل/الشركة)
-- Email: agent@test.com
-- Password: agent123
-- ============================================
INSERT INTO users (
  email,
  password_hash,
  first_name,
  last_name,
  phone,
  gender,
  date_of_birth,
  is_active
) VALUES (
  'agent@test.com',
  '$2b$10$EXAMPLE_HASH_REPLACE_WITH_REAL_HASH', -- استبدل هذا بالـ hash الصحيح
  'Agent',
  'Company',
  '+963987654321',
  'male',
  '1985-05-15',
  true
)
ON CONFLICT (email) DO NOTHING
RETURNING id;

-- ربط Agent بالدور
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.email = 'agent@test.com' AND r.code = 'AGENT'
ON CONFLICT DO NOTHING;

-- ============================================
-- حساب User عادي (المستخدم)
-- Email: user@test.com
-- Password: user123
-- ============================================
INSERT INTO users (
  email,
  password_hash,
  first_name,
  last_name,
  phone,
  gender,
  date_of_birth,
  is_active
) VALUES (
  'user@test.com',
  '$2b$10$EXAMPLE_HASH_REPLACE_WITH_REAL_HASH', -- استبدل هذا بالـ hash الصحيح
  'Test',
  'User',
  '+963555123456',
  'female',
  '1995-08-20',
  true
)
ON CONFLICT (email) DO NOTHING
RETURNING id;

-- ربط User بالدور
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.email = 'user@test.com' AND r.code = 'USER'
ON CONFLICT DO NOTHING;

-- ============================================
-- رسالة النجاح
-- ============================================
DO $$
BEGIN
  RAISE NOTICE 'Test users created successfully!';
  RAISE NOTICE 'Admin: admin@test.com / admin123';
  RAISE NOTICE 'Agent: agent@test.com / agent123';
  RAISE NOTICE 'User: user@test.com / user123';
  RAISE NOTICE '';
  RAISE NOTICE 'Note: Make sure to run create_test_users.js for proper password hashing!';
END $$;
