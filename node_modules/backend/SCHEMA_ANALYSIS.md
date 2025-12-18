# تحليل قاعدة البيانات - Responsive Bus Schedule Platform

## الجداول الأساسية والعلاقات

### 1. جدول `users` (الحسابات)
**الأعمدة:**
- `id` (SERIAL PRIMARY KEY)
- `email` (VARCHAR UNIQUE)
- `password_hash` (VARCHAR)
- `first_name` (VARCHAR)
- `last_name` (VARCHAR)
- `phone` (VARCHAR)
- `gender` (VARCHAR)
- `date_of_birth` (DATE)
- `address` (TEXT)
- `is_active` (BOOLEAN)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**العلاقات:**
- One-to-Many مع `bookings` (user_id)
- One-to-Many مع `ratings` (user_id)
- Many-to-Many مع `roles` عبر `user_roles`
- One-to-Many مع `favorites` (user_id)

---

### 2. جدول `bookings` (الحجوزات)
**الأعمدة:**
- `id` (SERIAL PRIMARY KEY)
- `user_id` (INTEGER FOREIGN KEY → users.id)
- `trip_id` (INTEGER FOREIGN KEY → trips.id)
- `booking_status` (VARCHAR) - مثل: 'confirmed', 'cancelled', 'pending'
- `seats_booked` (INTEGER)
- `total_price` (DECIMAL)
- `currency` (VARCHAR)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**العلاقات:**
- Many-to-One مع `users` (user_id)
- Many-to-One مع `trips` (trip_id)

---

### 3. جدول `trips` (الرحلات)
**الأعمدة:**
- `id` (SERIAL PRIMARY KEY)
- `route_id` (INTEGER FOREIGN KEY → routes.id)
- `company_id` (INTEGER FOREIGN KEY → companies.id)
- `transport_type_id` (INTEGER FOREIGN KEY → transport_types.id)
- `departure_station_id` (INTEGER FOREIGN KEY → stations.id)
- `arrival_station_id` (INTEGER FOREIGN KEY → stations.id)
- `departure_time` (TIMESTAMP)
- `arrival_time` (TIMESTAMP)
- `duration_minutes` (INTEGER)
- `seats_total` (INTEGER)
- `seats_available` (INTEGER)
- `status` (VARCHAR) - مثل: 'scheduled', 'completed', 'cancelled'
- `is_active` (BOOLEAN)
- `equipment` (TEXT) - مثل: 'wifi,ac,usb'
- `cancellation_policy` (TEXT)
- `extra_info` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**العلاقات:**
- Many-to-One مع `routes` (route_id)
- Many-to-One مع `companies` (company_id)
- Many-to-One مع `transport_types` (transport_type_id)
- Many-to-One مع `stations` (departure_station_id)
- Many-to-One مع `stations` (arrival_station_id)
- One-to-Many مع `bookings` (trip_id)
- One-to-Many مع `trip_fares` (trip_id)
- One-to-Many مع `favorites` (trip_id)

---

### 4. جدول `cities` (المدن)
**الأعمدة:**
- `id` (SERIAL PRIMARY KEY)
- `name` (VARCHAR UNIQUE)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**العلاقات:**
- One-to-Many مع `routes` (from_city_id, to_city_id)
- One-to-Many مع `stations` (city_id)

---

## الجداول المساعدة

### `routes` (الطرق)
- `id`, `from_city_id` → cities.id, `to_city_id` → cities.id

### `stations` (المحطات)
- `id`, `name`, `city_id` → cities.id

### `companies` (الشركات)
- `id`, `name`

### `transport_types` (أنواع النقل)
- `id`, `name`, `type_name`

### `trip_fares` (أسعار الرحلات)
- `id`, `trip_id` → trips.id, `fare_category_id`, `booking_option_id`, `price`, `currency`, `seats_available`

---

## ملخص العلاقات الرئيسية

```
users (1) ──< (N) bookings
trips (1) ──< (N) bookings
cities (1) ──< (N) routes (from_city_id, to_city_id)
trips (N) ──> (1) routes
trips (N) ──> (1) companies
trips (N) ──> (1) transport_types
trips (N) ──> (1) stations (departure_station_id)
trips (N) ──> (1) stations (arrival_station_id)
```
