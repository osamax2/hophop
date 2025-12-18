-- Insert All Syrian Cities
-- This script inserts all major Syrian cities with their coordinates
-- Uses ON CONFLICT DO NOTHING to avoid duplicates if name has UNIQUE constraint

-- Governorate Capitals (14 governorates)
INSERT INTO cities (name, country_code, latitude, longitude) VALUES
('دمشق', 'SY', 33.5138, 36.2765),
('حلب', 'SY', 36.2021, 37.1343),
('حمص', 'SY', 34.7268, 36.7234),
('اللاذقية', 'SY', 35.5138, 35.7794),
('طرطوس', 'SY', 34.8886, 35.8864),
('دير الزور', 'SY', 35.3354, 40.1408),
('الحسكة', 'SY', 36.5047, 40.7489),
('الرقة', 'SY', 35.9506, 39.0094),
('السويداء', 'SY', 32.7089, 36.5694),
('درعا', 'SY', 32.6189, 36.1019),
('إدلب', 'SY', 35.9333, 36.6333),
('حماة', 'SY', 35.1318, 36.7578),
('القنيطرة', 'SY', 33.1239, 35.8244),
('دوما', 'SY', 33.5711, 36.4028)
ON CONFLICT (name) DO NOTHING;

-- Major Cities in Damascus Governorate (Rif Dimashq)
INSERT INTO cities (name, country_code, latitude, longitude) VALUES
('داريا', 'SY', 33.4581, 36.2322),
('السيدة زينب', 'SY', 33.4444, 36.3361),
('التل', 'SY', 33.6000, 36.3000),
('الزبداني', 'SY', 33.7167, 36.1000),
('قطنا', 'SY', 33.4333, 36.1167),
('يبرود', 'SY', 33.9667, 36.6667),
('النبك', 'SY', 34.0167, 36.7333),
('الزاهرة', 'SY', 33.5167, 36.3000),
('برزة', 'SY', 33.5167, 36.2833),
('كفر سوسة', 'SY', 33.5000, 36.2833),
('المزة', 'SY', 33.4833, 36.2500),
('جوبر', 'SY', 33.5333, 36.3333),
('القدم', 'SY', 33.4667, 36.3000),
('الميدان', 'SY', 33.4500, 36.3167),
('الصالحية', 'SY', 33.4833, 36.3167),
('باب توما', 'SY', 33.5167, 36.3167),
('باب شرقي', 'SY', 33.5167, 36.3167),
('الشارع المستقيم', 'SY', 33.5167, 36.3167),
('سوق الحميدية', 'SY', 33.5167, 36.3167),
('المرجة', 'SY', 33.5167, 36.3167),
('العباسيين', 'SY', 33.5167, 36.3167),
('الركن الشمالي', 'SY', 33.5167, 36.3167),
('الركن الجنوبي', 'SY', 33.5167, 36.3167),
('العدوي', 'SY', 33.5167, 36.3167),
('القدس', 'SY', 33.5167, 36.3167),
('الزهراء', 'SY', 33.5167, 36.3167),
('الروضة', 'SY', 33.5167, 36.3167),
('المالكي', 'SY', 33.5167, 36.3167),
('أبو رمانة', 'SY', 33.5167, 36.3167)
ON CONFLICT (name) DO NOTHING;

-- Major Cities in Aleppo Governorate
INSERT INTO cities (name, country_code, latitude, longitude) VALUES
('منبج', 'SY', 36.5281, 37.9550),
('الباب', 'SY', 36.3706, 37.5158),
('عفرين', 'SY', 36.5114, 36.8664),
('إعزاز', 'SY', 36.5861, 37.0444),
('السفيرة', 'SY', 36.0667, 37.3667),
('تل رفعت', 'SY', 36.4667, 37.1000),
('جبل سمعان', 'SY', 36.2000, 37.1333),
('عندان', 'SY', 36.3000, 37.0500),
('نبل', 'SY', 36.3667, 37.0167),
('الزهراء', 'SY', 36.2000, 37.1500),
('السريان', 'SY', 36.1833, 37.1667)
ON CONFLICT (name) DO NOTHING;

-- Major Cities in Homs Governorate
INSERT INTO cities (name, country_code, latitude, longitude) VALUES
('تدمر', 'SY', 34.5581, 38.2739),
('الرستن', 'SY', 34.9333, 36.7333),
('تلكلخ', 'SY', 34.6667, 36.2500),
('مصياف', 'SY', 35.0667, 36.3500),
('شين', 'SY', 34.7833, 36.4667),
('القصير', 'SY', 34.5167, 36.5833),
('القدموس', 'SY', 34.9167, 36.1167),
('الرقة', 'SY', 35.9506, 39.0094),
('تادمور', 'SY', 34.5581, 38.2739)
ON CONFLICT (name) DO NOTHING;

-- Major Cities in Latakia Governorate
INSERT INTO cities (name, country_code, latitude, longitude) VALUES
('جبلة', 'SY', 35.3667, 35.9333),
('بانياس', 'SY', 35.1833, 35.9500),
('صافيتا', 'SY', 34.8167, 36.1167),
('الحفة', 'SY', 35.6000, 36.0333),
('قرداحة', 'SY', 35.4500, 36.0000),
('القدموس', 'SY', 34.9167, 36.1167),
('كسب', 'SY', 35.9167, 36.1167)
ON CONFLICT (name) DO NOTHING;

-- Major Cities in Tartus Governorate
INSERT INTO cities (name, country_code, latitude, longitude) VALUES
('الدريكيش', 'SY', 34.9000, 36.1167),
('الشيخ بدر', 'SY', 34.8333, 36.0500),
('بانياس', 'SY', 35.1833, 35.9500),
('صافيتا', 'SY', 34.8167, 36.1167)
ON CONFLICT (name) DO NOTHING;

-- Major Cities in Deir ez-Zor Governorate
INSERT INTO cities (name, country_code, latitude, longitude) VALUES
('البوكمال', 'SY', 34.4500, 40.9167),
('الميادين', 'SY', 34.4500, 40.7833),
('أبو كمال', 'SY', 34.4500, 40.9167),
('الموصل', 'SY', 36.3400, 43.1300),
('الطبقة', 'SY', 35.8333, 38.5500)
ON CONFLICT (name) DO NOTHING;

-- Major Cities in Al-Hasakah Governorate
INSERT INTO cities (name, country_code, latitude, longitude) VALUES
('القامشلي', 'SY', 37.0511, 41.2294),
('رأس العين', 'SY', 36.8500, 40.0667),
('المالكية', 'SY', 37.1667, 42.1333),
('عامودا', 'SY', 37.0000, 41.0167),
('ديريك', 'SY', 37.0500, 42.2000),
('تل تمر', 'SY', 36.6500, 40.3667),
('شددي', 'SY', 36.8167, 40.5167)
ON CONFLICT (name) DO NOTHING;

-- Major Cities in Raqqa Governorate
INSERT INTO cities (name, country_code, latitude, longitude) VALUES
('عين العرب', 'SY', 36.8167, 38.0167),
('الطبقة', 'SY', 35.8333, 38.5500),
('منبج', 'SY', 36.5281, 37.9550)
ON CONFLICT (name) DO NOTHING;

-- Major Cities in As-Suwayda Governorate
INSERT INTO cities (name, country_code, latitude, longitude) VALUES
('شهبا', 'SY', 32.8500, 36.5667),
('صلخد', 'SY', 32.4833, 36.7167),
('السويداء', 'SY', 32.7089, 36.5694),
('شهبا', 'SY', 32.8500, 36.5667)
ON CONFLICT (name) DO NOTHING;

-- Major Cities in Daraa Governorate
INSERT INTO cities (name, country_code, latitude, longitude) VALUES
('بصرى', 'SY', 32.5167, 36.4833),
('إزرع', 'SY', 32.8667, 36.2500),
('نوى', 'SY', 32.8833, 36.0333),
('طفس', 'SY', 32.7333, 36.0667),
('الشيخ مسكين', 'SY', 32.8167, 36.1500),
('جاسم', 'SY', 32.7833, 36.0500),
('إنخل', 'SY', 32.7500, 36.0167),
('داعل', 'SY', 32.8167, 36.0833)
ON CONFLICT (name) DO NOTHING;

-- Major Cities in Idlib Governorate
INSERT INTO cities (name, country_code, latitude, longitude) VALUES
('معرة النعمان', 'SY', 35.6333, 36.6833),
('جسر الشغور', 'SY', 35.8167, 36.3167),
('أريحا', 'SY', 35.8167, 36.6000),
('كفر تخاريم', 'SY', 36.1167, 36.5167),
('حارم', 'SY', 36.2000, 36.5167),
('سرمين', 'SY', 35.8667, 36.7167),
('بينش', 'SY', 35.8167, 36.6333),
('الدانا', 'SY', 35.7667, 36.7833)
ON CONFLICT (name) DO NOTHING;

-- Major Cities in Hama Governorate
INSERT INTO cities (name, country_code, latitude, longitude) VALUES
('السلمية', 'SY', 35.0167, 37.0500),
('مصياف', 'SY', 35.0667, 36.3500),
('محردة', 'SY', 35.2500, 36.5667),
('كفر زيتا', 'SY', 35.1167, 36.6000),
('اللطامنة', 'SY', 35.0833, 36.5000),
('سلمية', 'SY', 35.0167, 37.0500),
('مورك', 'SY', 35.2000, 36.6833),
('كفر نبودة', 'SY', 35.1333, 36.5500)
ON CONFLICT (name) DO NOTHING;

-- Note: Coordinates are approximate. Some cities may have multiple entries
-- if they appear in different governorates (like بانياس which appears in both
-- Latakia and Tartus). The ON CONFLICT clause will prevent duplicates if
-- the name column has a UNIQUE constraint.
