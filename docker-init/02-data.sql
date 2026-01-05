--
-- PostgreSQL database dump
--

\restrict PoMqUmboZEHs9Tj1CtRwAaLbxCMI8fZIUs2g9iNm0veuvtSsRzvDDq5dPfXt8bl

-- Dumped from database version 16.11
-- Dumped by pg_dump version 16.11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: transport_companies; Type: TABLE DATA; Schema: public; Owner: hophop
--

INSERT INTO public.transport_companies (id, name, logo_url, description, address, phone, cr_number, is_active, created_at, email, deleted_at) VALUES (1, 'HopHop Transport', NULL, NULL, NULL, NULL, NULL, true, '2025-12-14 17:50:20.475619', NULL, NULL);
INSERT INTO public.transport_companies (id, name, logo_url, description, address, phone, cr_number, is_active, created_at, email, deleted_at) VALUES (2, 'الأحمد', '', '', '', '004915560132131', '1173739sjdjdb', true, '2025-12-27 13:50:23.889761', 'ahmed-hajhamoud@hotmail.de', NULL);


--
-- Data for Name: user_types; Type: TABLE DATA; Schema: public; Owner: hophop
--

INSERT INTO public.user_types (id, code, name, description, name_ar) VALUES (1, 'manager', 'Manager', 'Company manager with full access', 'مدير');
INSERT INTO public.user_types (id, code, name, description, name_ar) VALUES (2, 'driver', 'Driver', 'Bus driver', 'سائق');
INSERT INTO public.user_types (id, code, name, description, name_ar) VALUES (3, 'assistant', 'Driver Assistant', 'Driver helper/assistant', 'مساعد السائق');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: hophop
--

INSERT INTO public.users (id, email, phone, is_active, first_name, last_name, gender, address, company_id, user_type_id, created_at, password_hash, birth_date, updated_at, date_of_birth, status, verification_token, verification_token_expires, email_verified) VALUES (10, 'ahmed-hajhamoud@hotmail.de', '', true, 'أحمد', 'حاج حمود', NULL, NULL, 2, NULL, '2025-12-27 13:50:23.889761', '$2b$10$H.s2UCsW2wi8KpkYs3gIZeUz1vQFpWabJZ8JsM.4Q2oM80FLSWGSe', NULL, '2025-12-27 13:50:23.889761', NULL, 'active', NULL, NULL, false);
INSERT INTO public.users (id, email, phone, is_active, first_name, last_name, gender, address, company_id, user_type_id, created_at, password_hash, birth_date, updated_at, date_of_birth, status, verification_token, verification_token_expires, email_verified) VALUES (11, 'osamax2@live.com', '0988884475', true, 'موم', 'ممم', 'male', NULL, NULL, NULL, '2025-12-27 20:44:00.953921', '$2b$10$ARvNGbmh0bU.eZVp1DfO5.O3oGJoVgK0CoGVONtiX2WNfC6mdr3ui', NULL, '2025-12-28 00:27:44.780979', NULL, 'active', NULL, '2025-12-28 20:46:29.633', true);
INSERT INTO public.users (id, email, phone, is_active, first_name, last_name, gender, address, company_id, user_type_id, created_at, password_hash, birth_date, updated_at, date_of_birth, status, verification_token, verification_token_expires, email_verified) VALUES (2, 'monamarashli@gmail.com', NULL, true, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-14 21:08:16.764495', '$2b$10$mBNO564xZNjo/QWoGQjJsu9oMkd10Ix4uGsdrYoIFsSDvh94TQsGG', NULL, '2025-12-26 10:41:49.720867', NULL, 'active', NULL, NULL, true);
INSERT INTO public.users (id, email, phone, is_active, first_name, last_name, gender, address, company_id, user_type_id, created_at, password_hash, birth_date, updated_at, date_of_birth, status, verification_token, verification_token_expires, email_verified) VALUES (7, 'osobaji@gmail.com', '093338890', true, 'sam', 'sam', 'male', NULL, NULL, NULL, '2025-12-18 15:02:25.992879', '$2b$10$dzAQWGU5WHuGlcbhBU7.suE0okGScJQzKe2vyREEE81/LW78VlcOS', NULL, '2025-12-26 11:43:34.997751', NULL, 'active', NULL, NULL, true);
INSERT INTO public.users (id, email, phone, is_active, first_name, last_name, gender, address, company_id, user_type_id, created_at, password_hash, birth_date, updated_at, date_of_birth, status, verification_token, verification_token_expires, email_verified) VALUES (4, 'admin@test.com', '+963999888777', true, 'Admin', 'User', 'male', NULL, NULL, NULL, '2025-12-16 14:39:29.812011', '$2b$10$znN0zF2qsYzJAyJmMPHaTuXQKTHO5WeoMtPggr4TO8nC2/W8xIF7a', '2025-12-17', '2025-12-26 10:45:11.690924', '2025-12-17', 'active', NULL, NULL, true);
INSERT INTO public.users (id, email, phone, is_active, first_name, last_name, gender, address, company_id, user_type_id, created_at, password_hash, birth_date, updated_at, date_of_birth, status, verification_token, verification_token_expires, email_verified) VALUES (1, 'admin@hophop.com', '+963123456789', true, 'Admin', 'HopHop', 'male', NULL, NULL, NULL, '2025-12-14 16:36:14.613423', '$2b$10$ABqr7V0l9DTrd0qNKxdz7O2A8Iqvi9RofPbl9pQJ3kIQ4IQe97d5a', '1991-07-12', '2025-12-26 14:24:36.653895', NULL, 'active', NULL, NULL, true);
INSERT INTO public.users (id, email, phone, is_active, first_name, last_name, gender, address, company_id, user_type_id, created_at, password_hash, birth_date, updated_at, date_of_birth, status, verification_token, verification_token_expires, email_verified) VALUES (8, 'testuser123@test.com', '+963999888777', true, 'زاجل', NULL, NULL, NULL, NULL, NULL, '2025-12-26 14:17:37.235554', '$2b$10$Binc/T33AJClPmpIgPwH3usvzuo6iD1Kbh5vSkqWE9At6BAmzZ9ly', NULL, '2025-12-26 23:25:02.066555', NULL, 'active', NULL, NULL, true);
INSERT INTO public.users (id, email, phone, is_active, first_name, last_name, gender, address, company_id, user_type_id, created_at, password_hash, birth_date, updated_at, date_of_birth, status, verification_token, verification_token_expires, email_verified) VALUES (5, 'agent@test.com', '+963987654321', true, 'البكري', 'Company', 'male', NULL, NULL, NULL, '2025-12-16 14:39:29.853381', '$2b$10$UNJIuGSZVwVfRmyoezVRROLEm91MmFJKgF6ck0JVdyrFy.08j36pK', NULL, '2025-12-26 23:25:42.019041', NULL, 'active', NULL, NULL, true);
INSERT INTO public.users (id, email, phone, is_active, first_name, last_name, gender, address, company_id, user_type_id, created_at, password_hash, birth_date, updated_at, date_of_birth, status, verification_token, verification_token_expires, email_verified) VALUES (6, 'user@test.com', '+963555123456', true, 'Test', 'User', 'male', NULL, NULL, NULL, '2025-12-16 14:39:29.857346', '$2b$10$7NGjOvNSi4MaERnFGnXty.6lTYde5dNXZirC1MvV5p4Z5UCDrt23i', NULL, '2025-12-26 23:32:43.878889', NULL, 'active', NULL, NULL, true);
INSERT INTO public.users (id, email, phone, is_active, first_name, last_name, gender, address, company_id, user_type_id, created_at, password_hash, birth_date, updated_at, date_of_birth, status, verification_token, verification_token_expires, email_verified) VALUES (9, 'ss@ss.com', '12453245434543', true, 'القدموس', NULL, NULL, NULL, 2, 1, '2025-12-26 15:53:18.276128', '$2b$10$vJX1JIafWXdMHmwxKvMAqu84p4cWVB4kG8Bw2dx0qILvC7AGKwu8a', NULL, '2025-12-27 19:33:14.715368', NULL, 'active', NULL, NULL, true);


--
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: hophop
--



--
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: hophop
--



--
-- Data for Name: transport_types; Type: TABLE DATA; Schema: public; Owner: hophop
--

INSERT INTO public.transport_types (id, code, label) VALUES (2, 'BUS', 'Bus');


--
-- Data for Name: booking_options; Type: TABLE DATA; Schema: public; Owner: hophop
--

INSERT INTO public.booking_options (id, transport_type_id, code, label, description) VALUES (1, 2, 'DEFAULT', 'Default', 'Default booking option');


--
-- Data for Name: cities; Type: TABLE DATA; Schema: public; Owner: hophop
--

INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (53, 'حلب', 'SY', NULL, 36.202100, 37.134300);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (54, 'حمص', 'SY', NULL, 34.726800, 36.723400);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (55, 'اللاذقية', 'SY', NULL, 35.513800, 35.779400);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (56, 'طرطوس', 'SY', NULL, 34.888600, 35.886400);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (57, 'دير الزور', 'SY', NULL, 35.335400, 40.140800);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (58, 'الحسكة', 'SY', NULL, 36.504700, 40.748900);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (59, 'الرقة', 'SY', NULL, 35.950600, 39.009400);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (60, 'السويداء', 'SY', NULL, 32.708900, 36.569400);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (61, 'درعا', 'SY', NULL, 32.618900, 36.101900);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (62, 'إدلب', 'SY', NULL, 35.933300, 36.633300);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (63, 'حماة', 'SY', NULL, 35.131800, 36.757800);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (64, 'القنيطرة', 'SY', NULL, 33.123900, 35.824400);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (65, 'دوما', 'SY', NULL, 33.571100, 36.402800);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (66, 'داريا', 'SY', NULL, 33.458100, 36.232200);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (67, 'السيدة زينب', 'SY', NULL, 33.444400, 36.336100);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (68, 'التل', 'SY', NULL, 33.600000, 36.300000);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (69, 'الزبداني', 'SY', NULL, 33.716700, 36.100000);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (70, 'قطنا', 'SY', NULL, 33.433300, 36.116700);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (71, 'يبرود', 'SY', NULL, 33.966700, 36.666700);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (72, 'النبك', 'SY', NULL, 34.016700, 36.733300);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (73, 'الزاهرة', 'SY', NULL, 33.516700, 36.300000);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (74, 'برزة', 'SY', NULL, 33.516700, 36.283300);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (75, 'كفر سوسة', 'SY', NULL, 33.500000, 36.283300);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (76, 'المزة', 'SY', NULL, 33.483300, 36.250000);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (77, 'جوبر', 'SY', NULL, 33.533300, 36.333300);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (78, 'القدم', 'SY', NULL, 33.466700, 36.300000);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (79, 'الميدان', 'SY', NULL, 33.450000, 36.316700);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (80, 'الصالحية', 'SY', NULL, 33.483300, 36.316700);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (81, 'باب توما', 'SY', NULL, 33.516700, 36.316700);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (82, 'باب شرقي', 'SY', NULL, 33.516700, 36.316700);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (83, 'الشارع المستقيم', 'SY', NULL, 33.516700, 36.316700);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (84, 'سوق الحميدية', 'SY', NULL, 33.516700, 36.316700);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (85, 'المرجة', 'SY', NULL, 33.516700, 36.316700);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (86, 'العباسيين', 'SY', NULL, 33.516700, 36.316700);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (87, 'الركن الشمالي', 'SY', NULL, 33.516700, 36.316700);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (88, 'الركن الجنوبي', 'SY', NULL, 33.516700, 36.316700);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (89, 'العدوي', 'SY', NULL, 33.516700, 36.316700);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (90, 'القدس', 'SY', NULL, 33.516700, 36.316700);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (91, 'الزهراء', 'SY', NULL, 33.516700, 36.316700);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (92, 'الروضة', 'SY', NULL, 33.516700, 36.316700);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (93, 'المالكي', 'SY', NULL, 33.516700, 36.316700);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (94, 'أبو رمانة', 'SY', NULL, 33.516700, 36.316700);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (95, 'منبج', 'SY', NULL, 36.528100, 37.955000);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (96, 'الباب', 'SY', NULL, 36.370600, 37.515800);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (97, 'عفرين', 'SY', NULL, 36.511400, 36.866400);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (98, 'إعزاز', 'SY', NULL, 36.586100, 37.044400);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (99, 'السفيرة', 'SY', NULL, 36.066700, 37.366700);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (100, 'تل رفعت', 'SY', NULL, 36.466700, 37.100000);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (101, 'جبل سمعان', 'SY', NULL, 36.200000, 37.133300);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (102, 'عندان', 'SY', NULL, 36.300000, 37.050000);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (103, 'نبل', 'SY', NULL, 36.366700, 37.016700);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (104, 'الزهراء', 'SY', NULL, 36.183300, 37.166700);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (105, 'تدمر', 'SY', NULL, 34.558100, 38.273900);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (106, 'القصير', 'SY', NULL, 34.933300, 36.733300);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (107, 'تلكلخ', 'SY', NULL, 34.666700, 36.250000);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (108, 'مشتى', 'SY', NULL, 35.066700, 36.350000);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (109, 'شين', 'SY', NULL, 34.783300, 36.466700);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (110, 'القصير', 'SY', NULL, 34.516700, 36.583300);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (111, 'القصاير', 'SY', NULL, 34.916700, 36.116700);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (112, 'تادمور', 'SY', NULL, 34.558100, 38.273900);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (113, 'جبلة', 'SY', NULL, 35.366700, 35.933300);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (114, 'بانياس', 'SY', NULL, 35.183300, 35.950000);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (115, 'صافيتا', 'SY', NULL, 34.816700, 36.116700);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (116, 'الحفة', 'SY', NULL, 35.600000, 36.033300);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (117, 'قرداحة', 'SY', NULL, 35.450000, 36.000000);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (118, 'كسب', 'SY', NULL, 35.916700, 36.116700);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (119, 'الدريكيش', 'SY', NULL, 34.900000, 36.116700);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (120, 'الشيخ بدر', 'SY', NULL, 34.833300, 36.050000);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (121, 'البوكمال', 'SY', NULL, 34.450000, 40.916700);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (122, 'الميادين', 'SY', NULL, 34.450000, 40.783300);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (123, 'أبو كمال', 'SY', NULL, 34.450000, 40.916700);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (124, 'القامشلي', 'SY', NULL, 37.051100, 41.229400);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (125, 'رأس العين', 'SY', NULL, 36.850000, 40.066700);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (126, 'المالكية', 'SY', NULL, 37.166700, 42.133300);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (127, 'عامودا', 'SY', NULL, 37.000000, 41.016700);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (128, 'ديريك', 'SY', NULL, 37.050000, 42.200000);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (129, 'تل تمر', 'SY', NULL, 36.650000, 40.366700);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (130, 'شدادي', 'SY', NULL, 36.816700, 40.516700);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (131, 'عين العرب', 'SY', NULL, 36.816700, 38.016700);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (132, 'الطبقة', 'SY', NULL, 35.833300, 38.550000);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (133, 'شهبا', 'SY', NULL, 32.850000, 36.566700);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (134, 'صلخد', 'SY', NULL, 32.483300, 36.716700);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (135, 'بصرى', 'SY', NULL, 32.516700, 36.483300);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (136, 'إزرع', 'SY', NULL, 32.866700, 36.250000);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (137, 'نوى', 'SY', NULL, 32.883300, 36.033300);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (138, 'طفس', 'SY', NULL, 32.733300, 36.066700);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (139, 'الشيخ مسكين', 'SY', NULL, 32.816700, 36.150000);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (140, 'جاسم', 'SY', NULL, 32.783300, 36.050000);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (141, 'إنخل', 'SY', NULL, 32.750000, 36.016700);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (142, 'داعل', 'SY', NULL, 32.816700, 36.083300);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (143, 'معرة النعمان', 'SY', NULL, 35.633300, 36.683300);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (144, 'جسر الشغور', 'SY', NULL, 35.816700, 36.316700);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (145, 'أريحا', 'SY', NULL, 35.816700, 36.600000);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (146, 'كفر تخاريم', 'SY', NULL, 36.116700, 36.516700);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (147, 'حارم', 'SY', NULL, 36.200000, 36.516700);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (148, 'سلقين', 'SY', NULL, 35.866700, 36.716700);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (149, 'بنش', 'SY', NULL, 35.816700, 36.633300);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (150, 'الدانا', 'SY', NULL, 35.766700, 36.783300);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (151, 'السلمية', 'SY', NULL, 35.016700, 37.050000);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (7, 'Damascus', 'SY', NULL, NULL, NULL);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (8, 'Rif Dimashq', 'SY', NULL, NULL, NULL);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (9, 'Aleppo', 'SY', NULL, NULL, NULL);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (10, 'Homs', 'SY', NULL, NULL, NULL);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (11, 'Hama', 'SY', NULL, NULL, NULL);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (12, 'Latakia', 'SY', NULL, NULL, NULL);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (13, 'Tartus', 'SY', NULL, NULL, NULL);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (14, 'Idlib', 'SY', NULL, NULL, NULL);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (15, 'Deir ez-Zor', 'SY', NULL, NULL, NULL);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (16, 'Raqqa', 'SY', NULL, NULL, NULL);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (17, 'Hasakah', 'SY', NULL, NULL, NULL);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (18, 'Qamishli', 'SY', NULL, NULL, NULL);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (19, 'Daraa', 'SY', NULL, NULL, NULL);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (20, 'As-Suwayda', 'SY', NULL, NULL, NULL);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (21, 'Quneitra', 'SY', NULL, NULL, NULL);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (22, 'Palmyra', 'SY', NULL, NULL, NULL);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (23, 'Al-Bab', 'SY', NULL, NULL, NULL);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (24, 'Manbij', 'SY', NULL, NULL, NULL);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (25, 'Afrin', 'SY', NULL, NULL, NULL);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (26, 'Kobani', 'SY', NULL, NULL, NULL);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (27, 'Al-Mayadin', 'SY', NULL, NULL, NULL);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (28, 'Al-Bukamal', 'SY', NULL, NULL, NULL);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (29, 'Salamiyah', 'SY', NULL, NULL, NULL);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (30, 'Jableh', 'SY', NULL, NULL, NULL);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (31, 'Baniyas', 'SY', NULL, NULL, NULL);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (32, 'Safita', 'SY', NULL, NULL, NULL);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (33, 'Tal Kalakh', 'SY', NULL, NULL, NULL);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (34, 'Masyaf', 'SY', NULL, NULL, NULL);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (35, 'Al-Qusayr', 'SY', NULL, NULL, NULL);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (36, 'Douma', 'SY', NULL, NULL, NULL);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (37, 'Harasta', 'SY', NULL, NULL, NULL);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (38, 'Zabadani', 'SY', NULL, NULL, NULL);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (39, 'Al-Nabek', 'SY', NULL, NULL, NULL);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (40, 'Yabroud', 'SY', NULL, NULL, NULL);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (41, 'Al-Tall', 'SY', NULL, NULL, NULL);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (42, 'Qatana', 'SY', NULL, NULL, NULL);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (43, 'Darayya', 'SY', NULL, NULL, NULL);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (44, 'Al-Tanam', 'SY', NULL, NULL, NULL);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (45, 'Al-Hajar al-Aswad', 'SY', NULL, NULL, NULL);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (46, 'Sahnaya', 'SY', NULL, NULL, NULL);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (47, 'Kafr Batna', 'SY', NULL, NULL, NULL);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (48, 'Jaramana', 'SY', NULL, NULL, NULL);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (49, 'Damascus', 'SY', NULL, NULL, NULL);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (50, 'Homs', 'SY', NULL, NULL, NULL);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (51, 'Aleppo', 'SY', NULL, NULL, NULL);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (52, 'دمشق', 'SY', NULL, 33.513800, 36.276500);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (152, 'محردة', 'SY', NULL, 35.250000, 36.566700);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (153, 'كفر نبودة', 'SY', NULL, 35.116700, 36.600000);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (154, 'اللطامنة', 'SY', NULL, 35.083300, 36.500000);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (155, 'مورك', 'SY', NULL, 35.200000, 36.683300);
INSERT INTO public.cities (id, name, country_code, address, latitude, longitude) VALUES (156, 'كفر زيتا', 'SY', NULL, 35.133300, 36.550000);


--
-- Data for Name: routes; Type: TABLE DATA; Schema: public; Owner: hophop
--

INSERT INTO public.routes (id, from_city_id, to_city_id) VALUES (5, 7, 10);
INSERT INTO public.routes (id, from_city_id, to_city_id) VALUES (6, 7, 50);
INSERT INTO public.routes (id, from_city_id, to_city_id) VALUES (7, 49, 10);
INSERT INTO public.routes (id, from_city_id, to_city_id) VALUES (8, 49, 50);
INSERT INTO public.routes (id, from_city_id, to_city_id) VALUES (9, 7, 9);
INSERT INTO public.routes (id, from_city_id, to_city_id) VALUES (10, 7, 51);
INSERT INTO public.routes (id, from_city_id, to_city_id) VALUES (11, 49, 9);
INSERT INTO public.routes (id, from_city_id, to_city_id) VALUES (12, 49, 51);
INSERT INTO public.routes (id, from_city_id, to_city_id) VALUES (13, 25, 51);
INSERT INTO public.routes (id, from_city_id, to_city_id) VALUES (14, 23, 51);
INSERT INTO public.routes (id, from_city_id, to_city_id) VALUES (15, 41, 20);
INSERT INTO public.routes (id, from_city_id, to_city_id) VALUES (16, 45, 51);
INSERT INTO public.routes (id, from_city_id, to_city_id) VALUES (17, 17, 51);
INSERT INTO public.routes (id, from_city_id, to_city_id) VALUES (18, 26, 51);
INSERT INTO public.routes (id, from_city_id, to_city_id) VALUES (19, 48, 51);
INSERT INTO public.routes (id, from_city_id, to_city_id) VALUES (20, 14, 50);
INSERT INTO public.routes (id, from_city_id, to_city_id) VALUES (21, 28, 51);
INSERT INTO public.routes (id, from_city_id, to_city_id) VALUES (22, 50, 51);
INSERT INTO public.routes (id, from_city_id, to_city_id) VALUES (23, 49, 47);
INSERT INTO public.routes (id, from_city_id, to_city_id) VALUES (24, 35, 51);
INSERT INTO public.routes (id, from_city_id, to_city_id) VALUES (25, 44, 50);
INSERT INTO public.routes (id, from_city_id, to_city_id) VALUES (26, 51, 43);
INSERT INTO public.routes (id, from_city_id, to_city_id) VALUES (27, 36, 51);
INSERT INTO public.routes (id, from_city_id, to_city_id) VALUES (28, 35, 45);
INSERT INTO public.routes (id, from_city_id, to_city_id) VALUES (29, 44, 45);
INSERT INTO public.routes (id, from_city_id, to_city_id) VALUES (30, 20, 45);
INSERT INTO public.routes (id, from_city_id, to_city_id) VALUES (31, 48, 50);
INSERT INTO public.routes (id, from_city_id, to_city_id) VALUES (32, 27, 45);
INSERT INTO public.routes (id, from_city_id, to_city_id) VALUES (33, 41, 45);
INSERT INTO public.routes (id, from_city_id, to_city_id) VALUES (34, 31, 45);
INSERT INTO public.routes (id, from_city_id, to_city_id) VALUES (35, 39, 45);
INSERT INTO public.routes (id, from_city_id, to_city_id) VALUES (36, 51, 45);
INSERT INTO public.routes (id, from_city_id, to_city_id) VALUES (37, 49, 45);
INSERT INTO public.routes (id, from_city_id, to_city_id) VALUES (38, 51, 19);


--
-- Data for Name: stations; Type: TABLE DATA; Schema: public; Owner: hophop
--

INSERT INTO public.stations (id, city_id, name, address, latitude, longitude, is_active) VALUES (7, 7, 'Damascus Central Station', NULL, NULL, NULL, true);
INSERT INTO public.stations (id, city_id, name, address, latitude, longitude, is_active) VALUES (8, 8, 'Rif Dimashq Central Station', NULL, NULL, NULL, true);
INSERT INTO public.stations (id, city_id, name, address, latitude, longitude, is_active) VALUES (9, 9, 'Aleppo Central Station', NULL, NULL, NULL, true);
INSERT INTO public.stations (id, city_id, name, address, latitude, longitude, is_active) VALUES (10, 10, 'Homs Central Station', NULL, NULL, NULL, true);
INSERT INTO public.stations (id, city_id, name, address, latitude, longitude, is_active) VALUES (11, 11, 'Hama Central Station', NULL, NULL, NULL, true);
INSERT INTO public.stations (id, city_id, name, address, latitude, longitude, is_active) VALUES (12, 12, 'Latakia Central Station', NULL, NULL, NULL, true);
INSERT INTO public.stations (id, city_id, name, address, latitude, longitude, is_active) VALUES (13, 13, 'Tartus Central Station', NULL, NULL, NULL, true);
INSERT INTO public.stations (id, city_id, name, address, latitude, longitude, is_active) VALUES (14, 14, 'Idlib Central Station', NULL, NULL, NULL, true);
INSERT INTO public.stations (id, city_id, name, address, latitude, longitude, is_active) VALUES (15, 15, 'Deir ez-Zor Central Station', NULL, NULL, NULL, true);
INSERT INTO public.stations (id, city_id, name, address, latitude, longitude, is_active) VALUES (16, 16, 'Raqqa Central Station', NULL, NULL, NULL, true);
INSERT INTO public.stations (id, city_id, name, address, latitude, longitude, is_active) VALUES (17, 17, 'Hasakah Central Station', NULL, NULL, NULL, true);
INSERT INTO public.stations (id, city_id, name, address, latitude, longitude, is_active) VALUES (18, 18, 'Qamishli Central Station', NULL, NULL, NULL, true);
INSERT INTO public.stations (id, city_id, name, address, latitude, longitude, is_active) VALUES (19, 19, 'Daraa Central Station', NULL, NULL, NULL, true);
INSERT INTO public.stations (id, city_id, name, address, latitude, longitude, is_active) VALUES (20, 20, 'As-Suwayda Central Station', NULL, NULL, NULL, true);
INSERT INTO public.stations (id, city_id, name, address, latitude, longitude, is_active) VALUES (21, 21, 'Quneitra Central Station', NULL, NULL, NULL, true);
INSERT INTO public.stations (id, city_id, name, address, latitude, longitude, is_active) VALUES (22, 22, 'Palmyra Central Station', NULL, NULL, NULL, true);
INSERT INTO public.stations (id, city_id, name, address, latitude, longitude, is_active) VALUES (23, 23, 'Al-Bab Central Station', NULL, NULL, NULL, true);
INSERT INTO public.stations (id, city_id, name, address, latitude, longitude, is_active) VALUES (24, 24, 'Manbij Central Station', NULL, NULL, NULL, true);
INSERT INTO public.stations (id, city_id, name, address, latitude, longitude, is_active) VALUES (25, 25, 'Afrin Central Station', NULL, NULL, NULL, true);
INSERT INTO public.stations (id, city_id, name, address, latitude, longitude, is_active) VALUES (26, 26, 'Kobani Central Station', NULL, NULL, NULL, true);
INSERT INTO public.stations (id, city_id, name, address, latitude, longitude, is_active) VALUES (27, 27, 'Al-Mayadin Central Station', NULL, NULL, NULL, true);
INSERT INTO public.stations (id, city_id, name, address, latitude, longitude, is_active) VALUES (28, 28, 'Al-Bukamal Central Station', NULL, NULL, NULL, true);
INSERT INTO public.stations (id, city_id, name, address, latitude, longitude, is_active) VALUES (29, 29, 'Salamiyah Central Station', NULL, NULL, NULL, true);
INSERT INTO public.stations (id, city_id, name, address, latitude, longitude, is_active) VALUES (30, 30, 'Jableh Central Station', NULL, NULL, NULL, true);
INSERT INTO public.stations (id, city_id, name, address, latitude, longitude, is_active) VALUES (31, 31, 'Baniyas Central Station', NULL, NULL, NULL, true);
INSERT INTO public.stations (id, city_id, name, address, latitude, longitude, is_active) VALUES (32, 32, 'Safita Central Station', NULL, NULL, NULL, true);
INSERT INTO public.stations (id, city_id, name, address, latitude, longitude, is_active) VALUES (33, 33, 'Tal Kalakh Central Station', NULL, NULL, NULL, true);
INSERT INTO public.stations (id, city_id, name, address, latitude, longitude, is_active) VALUES (34, 34, 'Masyaf Central Station', NULL, NULL, NULL, true);
INSERT INTO public.stations (id, city_id, name, address, latitude, longitude, is_active) VALUES (35, 35, 'Al-Qusayr Central Station', NULL, NULL, NULL, true);
INSERT INTO public.stations (id, city_id, name, address, latitude, longitude, is_active) VALUES (36, 36, 'Douma Central Station', NULL, NULL, NULL, true);
INSERT INTO public.stations (id, city_id, name, address, latitude, longitude, is_active) VALUES (37, 37, 'Harasta Central Station', NULL, NULL, NULL, true);
INSERT INTO public.stations (id, city_id, name, address, latitude, longitude, is_active) VALUES (38, 38, 'Zabadani Central Station', NULL, NULL, NULL, true);
INSERT INTO public.stations (id, city_id, name, address, latitude, longitude, is_active) VALUES (39, 39, 'Al-Nabek Central Station', NULL, NULL, NULL, true);
INSERT INTO public.stations (id, city_id, name, address, latitude, longitude, is_active) VALUES (40, 40, 'Yabroud Central Station', NULL, NULL, NULL, true);
INSERT INTO public.stations (id, city_id, name, address, latitude, longitude, is_active) VALUES (41, 41, 'Al-Tall Central Station', NULL, NULL, NULL, true);
INSERT INTO public.stations (id, city_id, name, address, latitude, longitude, is_active) VALUES (42, 42, 'Qatana Central Station', NULL, NULL, NULL, true);
INSERT INTO public.stations (id, city_id, name, address, latitude, longitude, is_active) VALUES (43, 43, 'Darayya Central Station', NULL, NULL, NULL, true);
INSERT INTO public.stations (id, city_id, name, address, latitude, longitude, is_active) VALUES (44, 44, 'Al-Tanam Central Station', NULL, NULL, NULL, true);
INSERT INTO public.stations (id, city_id, name, address, latitude, longitude, is_active) VALUES (45, 45, 'Al-Hajar al-Aswad Central Station', NULL, NULL, NULL, true);
INSERT INTO public.stations (id, city_id, name, address, latitude, longitude, is_active) VALUES (46, 46, 'Sahnaya Central Station', NULL, NULL, NULL, true);
INSERT INTO public.stations (id, city_id, name, address, latitude, longitude, is_active) VALUES (47, 47, 'Kafr Batna Central Station', NULL, NULL, NULL, true);
INSERT INTO public.stations (id, city_id, name, address, latitude, longitude, is_active) VALUES (48, 48, 'Jaramana Central Station', NULL, NULL, NULL, true);
INSERT INTO public.stations (id, city_id, name, address, latitude, longitude, is_active) VALUES (49, 49, 'Damascus Central Station', NULL, NULL, NULL, true);
INSERT INTO public.stations (id, city_id, name, address, latitude, longitude, is_active) VALUES (50, 50, 'Homs Central Station', NULL, NULL, NULL, true);
INSERT INTO public.stations (id, city_id, name, address, latitude, longitude, is_active) VALUES (51, 51, 'Aleppo Central Station', NULL, NULL, NULL, true);


--
-- Data for Name: trips; Type: TABLE DATA; Schema: public; Owner: hophop
--

INSERT INTO public.trips (id, route_id, company_id, transport_type_id, departure_station_id, arrival_station_id, departure_time, arrival_time, duration_minutes, seats_total, seats_available, status, is_active, equipment, cancellation_policy, extra_info, bus_number, driver_name, deleted_at) VALUES (4, 8, 1, 2, 49, 50, '2025-12-27 08:00:00', '2025-12-27 10:00:00', 120, 40, 40, 'scheduled', true, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.trips (id, route_id, company_id, transport_type_id, departure_station_id, arrival_station_id, departure_time, arrival_time, duration_minutes, seats_total, seats_available, status, is_active, equipment, cancellation_policy, extra_info, bus_number, driver_name, deleted_at) VALUES (2, 8, 1, 2, 7, 50, '2025-12-27 08:00:00', '2025-12-27 10:00:00', 120, 40, 40, 'scheduled', true, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.trips (id, route_id, company_id, transport_type_id, departure_station_id, arrival_station_id, departure_time, arrival_time, duration_minutes, seats_total, seats_available, status, is_active, equipment, cancellation_policy, extra_info, bus_number, driver_name, deleted_at) VALUES (1, 5, 1, 2, 7, 10, '2025-12-20 08:00:00', '2025-12-20 10:00:00', 120, 40, 36, 'scheduled', true, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.trips (id, route_id, company_id, transport_type_id, departure_station_id, arrival_station_id, departure_time, arrival_time, duration_minutes, seats_total, seats_available, status, is_active, equipment, cancellation_policy, extra_info, bus_number, driver_name, deleted_at) VALUES (6, 38, 1, 2, 7, 51, '2025-12-26 18:00:00', '2025-12-26 20:00:00', 120, 40, 40, 'scheduled', true, NULL, 'uhkbjubnkj', 'huuizghh', NULL, NULL, NULL);
INSERT INTO public.trips (id, route_id, company_id, transport_type_id, departure_station_id, arrival_station_id, departure_time, arrival_time, duration_minutes, seats_total, seats_available, status, is_active, equipment, cancellation_policy, extra_info, bus_number, driver_name, deleted_at) VALUES (9, 37, 1, 2, 28, 45, '2025-12-28 12:50:00', '2025-12-28 15:50:00', 180, 43, 43, 'scheduled', true, 'fsdfsd', 'sdfds', 'dsfdsfsd', NULL, NULL, NULL);
INSERT INTO public.trips (id, route_id, company_id, transport_type_id, departure_station_id, arrival_station_id, departure_time, arrival_time, duration_minutes, seats_total, seats_available, status, is_active, equipment, cancellation_policy, extra_info, bus_number, driver_name, deleted_at) VALUES (3, 8, 1, 2, 49, 10, '2025-12-28 08:00:00', '2025-12-28 10:00:00', 120, 40, 40, 'scheduled', true, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.trips (id, route_id, company_id, transport_type_id, departure_station_id, arrival_station_id, departure_time, arrival_time, duration_minutes, seats_total, seats_available, status, is_active, equipment, cancellation_policy, extra_info, bus_number, driver_name, deleted_at) VALUES (5, 12, 1, 2, 7, 9, '2025-12-27 08:00:00', '2025-12-27 10:00:00', 120, 40, 40, 'scheduled', true, NULL, NULL, NULL, NULL, NULL, NULL);


--
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: hophop
--

INSERT INTO public.bookings (id, user_id, trip_id, booking_status, seats_booked, total_price, currency, created_at, updated_at, deleted_at) VALUES (1, 1, 1, 'confirmed', 2, 20.00, 'USD', '2025-12-14 18:29:14.403809', '2025-12-26 14:17:05.817284', NULL);
INSERT INTO public.bookings (id, user_id, trip_id, booking_status, seats_booked, total_price, currency, created_at, updated_at, deleted_at) VALUES (2, 1, 1, 'confirmed', 2, 20.00, 'USD', '2025-12-14 18:36:06.939585', '2025-12-26 14:17:05.817284', NULL);


--
-- Data for Name: fare_categories; Type: TABLE DATA; Schema: public; Owner: hophop
--

INSERT INTO public.fare_categories (id, code, label, description, is_extra) VALUES (2, 'STANDARD', 'Standard', NULL, false);


--
-- Data for Name: favorites; Type: TABLE DATA; Schema: public; Owner: hophop
--

INSERT INTO public.favorites (id, user_id, trip_id, created_at) VALUES (1, 8, 1, '2025-12-26 14:17:46.569549');
INSERT INTO public.favorites (id, user_id, trip_id, created_at) VALUES (3, 6, 6, '2025-12-26 15:03:45.451756');
INSERT INTO public.favorites (id, user_id, trip_id, created_at) VALUES (4, 4, 5, '2025-12-26 23:19:20.944963');


--
-- Data for Name: images; Type: TABLE DATA; Schema: public; Owner: hophop
--

INSERT INTO public.images (id, entity_type, entity_id, image_url, uploaded_by, created_at, image_path, file_name, file_size, mime_type) VALUES (1, 'bus', 12333, '/uploads/image-1766758496914-4707804.png', 1, '2025-12-26 14:14:56.917593', '/app/uploads/image-1766758496914-4707804.png', 'Screenshot 2025-12-18 at 16.18.58.png', 81272, 'image/png');


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: hophop
--



--
-- Data for Name: media; Type: TABLE DATA; Schema: public; Owner: hophop
--



--
-- Data for Name: media_relations; Type: TABLE DATA; Schema: public; Owner: hophop
--



--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: hophop
--



--
-- Data for Name: ratings; Type: TABLE DATA; Schema: public; Owner: hophop
--

INSERT INTO public.ratings (id, user_id, transport_company_id, punctuality_rating, friendliness_rating, cleanliness_rating, comment, created_at, updated_at, deleted_at) VALUES (2, 6, 1, 5, 5, 5, NULL, '2025-12-26 23:30:34.621424', '2025-12-26 23:30:34.621424', NULL);
INSERT INTO public.ratings (id, user_id, transport_company_id, punctuality_rating, friendliness_rating, cleanliness_rating, comment, created_at, updated_at, deleted_at) VALUES (1, 4, 1, 1, 4, 2, 'تأخر الباص ساعة ونص', '2025-12-22 22:22:11.731526', '2025-12-27 12:22:41.008024', NULL);


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: hophop
--



--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: hophop
--

INSERT INTO public.roles (id, name, description) VALUES (1, 'ADMIN', 'Full access');
INSERT INTO public.roles (id, name, description) VALUES (2, 'AGENT', 'Manage trips and fares');
INSERT INTO public.roles (id, name, description) VALUES (3, 'USER', 'Standard user');
INSERT INTO public.roles (id, name, description) VALUES (4, 'Administrator', 'Full admin access');
INSERT INTO public.roles (id, name, description) VALUES (5, 'Agent', 'Company agent access');
INSERT INTO public.roles (id, name, description) VALUES (6, 'User', 'Regular user access');


--
-- Data for Name: route_stops; Type: TABLE DATA; Schema: public; Owner: hophop
--

INSERT INTO public.route_stops (id, route_id, station_id, stop_order, arrival_time, departure_time, created_at) VALUES (1, 37, 27, 1, '16:04:00', '17:04:00', '2025-12-26 14:04:11.83995');
INSERT INTO public.route_stops (id, route_id, station_id, stop_order, arrival_time, departure_time, created_at) VALUES (2, 37, 41, 2, '18:04:00', '19:04:00', '2025-12-26 14:04:24.331681');


--
-- Data for Name: trip_fares; Type: TABLE DATA; Schema: public; Owner: hophop
--

INSERT INTO public.trip_fares (id, trip_id, fare_category_id, booking_option_id, price, currency, seats_available) VALUES (9, 1, 2, 1, 10.00, 'USD', 38);
INSERT INTO public.trip_fares (id, trip_id, fare_category_id, booking_option_id, price, currency, seats_available) VALUES (4, 6, 2, 1, 10.00, 'USD', 40);
INSERT INTO public.trip_fares (id, trip_id, fare_category_id, booking_option_id, price, currency, seats_available) VALUES (10, 9, 2, 1, 534534.00, 'SYP', 43);
INSERT INTO public.trip_fares (id, trip_id, fare_category_id, booking_option_id, price, currency, seats_available) VALUES (2, 3, 2, 1, 10.00, 'USD', 40);
INSERT INTO public.trip_fares (id, trip_id, fare_category_id, booking_option_id, price, currency, seats_available) VALUES (8, 5, 2, 1, 10.00, 'USD', 40);
INSERT INTO public.trip_fares (id, trip_id, fare_category_id, booking_option_id, price, currency, seats_available) VALUES (6, 4, 2, 1, 10.00, 'USD', 40);
INSERT INTO public.trip_fares (id, trip_id, fare_category_id, booking_option_id, price, currency, seats_available) VALUES (5, 2, 2, 1, 10.00, 'USD', 40);


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: hophop
--

INSERT INTO public.user_roles (id, user_id, role_id) VALUES (1, 4, 4);
INSERT INTO public.user_roles (id, user_id, role_id) VALUES (3, 6, 6);
INSERT INTO public.user_roles (id, user_id, role_id) VALUES (5, 1, 1);
INSERT INTO public.user_roles (id, user_id, role_id) VALUES (6, 7, 4);
INSERT INTO public.user_roles (id, user_id, role_id) VALUES (8, 8, 5);
INSERT INTO public.user_roles (id, user_id, role_id) VALUES (10, 5, 5);
INSERT INTO public.user_roles (id, user_id, role_id) VALUES (11, 10, 5);
INSERT INTO public.user_roles (id, user_id, role_id) VALUES (13, 9, 5);
INSERT INTO public.user_roles (id, user_id, role_id) VALUES (14, 11, 6);


--
-- Name: accounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hophop
--

SELECT pg_catalog.setval('public.accounts_id_seq', 1, false);


--
-- Name: activity_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hophop
--

SELECT pg_catalog.setval('public.activity_logs_id_seq', 1, false);


--
-- Name: booking_options_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hophop
--

SELECT pg_catalog.setval('public.booking_options_id_seq', 1, true);


--
-- Name: bookings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hophop
--

SELECT pg_catalog.setval('public.bookings_id_seq', 2, true);


--
-- Name: cities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hophop
--

SELECT pg_catalog.setval('public.cities_id_seq', 156, true);


--
-- Name: fare_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hophop
--

SELECT pg_catalog.setval('public.fare_categories_id_seq', 3, true);


--
-- Name: favorites_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hophop
--

SELECT pg_catalog.setval('public.favorites_id_seq', 4, true);


--
-- Name: images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hophop
--

SELECT pg_catalog.setval('public.images_id_seq', 2, true);


--
-- Name: invoices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hophop
--

SELECT pg_catalog.setval('public.invoices_id_seq', 1, false);


--
-- Name: media_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hophop
--

SELECT pg_catalog.setval('public.media_id_seq', 1, false);


--
-- Name: media_relations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hophop
--

SELECT pg_catalog.setval('public.media_relations_id_seq', 1, false);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hophop
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1, false);


--
-- Name: ratings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hophop
--

SELECT pg_catalog.setval('public.ratings_id_seq', 2, true);


--
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hophop
--

SELECT pg_catalog.setval('public.reviews_id_seq', 1, false);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hophop
--

SELECT pg_catalog.setval('public.roles_id_seq', 6, true);


--
-- Name: route_stops_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hophop
--

SELECT pg_catalog.setval('public.route_stops_id_seq', 2, true);


--
-- Name: routes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hophop
--

SELECT pg_catalog.setval('public.routes_id_seq', 38, true);


--
-- Name: stations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hophop
--

SELECT pg_catalog.setval('public.stations_id_seq', 51, true);


--
-- Name: transport_companies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hophop
--

SELECT pg_catalog.setval('public.transport_companies_id_seq', 2, true);


--
-- Name: transport_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hophop
--

SELECT pg_catalog.setval('public.transport_types_id_seq', 2, true);


--
-- Name: trip_fares_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hophop
--

SELECT pg_catalog.setval('public.trip_fares_id_seq', 10, true);


--
-- Name: trips_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hophop
--

SELECT pg_catalog.setval('public.trips_id_seq', 9, true);


--
-- Name: user_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hophop
--

SELECT pg_catalog.setval('public.user_roles_id_seq', 14, true);


--
-- Name: user_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hophop
--

SELECT pg_catalog.setval('public.user_types_id_seq', 3, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hophop
--

SELECT pg_catalog.setval('public.users_id_seq', 11, true);


--
-- PostgreSQL database dump complete
--

\unrestrict PoMqUmboZEHs9Tj1CtRwAaLbxCMI8fZIUs2g9iNm0veuvtSsRzvDDq5dPfXt8bl

