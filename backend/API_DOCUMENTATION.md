# API Documentation - CRUD Endpoints

## نظرة عامة

تم إنشاء CRUD endpoints منظمة للجداول الأساسية:
- **users** (الحسابات)
- **bookings** (الحجوزات)
- **trips** (الرحلات)
- **cities** (المدن)

## البنية المعمارية

```
routes/          → تعريف الـ endpoints
controllers/     → معالجة الطلبات والاستجابات
services/        → منطق العمل والتفاعل مع قاعدة البيانات
```

---

## 1. Users API (الحسابات)

### GET /api/users
الحصول على جميع المستخدمين

**Query Parameters:**
- `limit` (optional): عدد النتائج (default: 100)
- `offset` (optional): عدد النتائج المراد تخطيها (default: 0)

**Response:**
```json
[
  {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+1234567890",
    "gender": "male",
    "date_of_birth": "1990-01-01",
    "address": "123 Main St",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

### GET /api/users/:id
الحصول على مستخدم بواسطة ID

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  ...
}
```

### POST /api/users
إنشاء مستخدم جديد

**Request Body:**
```json
{
  "email": "user@example.com",
  "password_hash": "hashed_password",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "gender": "male",
  "date_of_birth": "1990-01-01",
  "address": "123 Main St",
  "is_active": true
}
```

**Required Fields:** `email`, `password_hash`

### PATCH /api/users/:id
تحديث مستخدم

**Request Body:**
```json
{
  "first_name": "Jane",
  "phone": "+9876543210"
}
```

### DELETE /api/users/:id
حذف مستخدم

**Response:**
```json
{
  "message": "User deleted successfully"
}
```

---

## 2. Bookings API (الحجوزات)

### GET /api/bookings-crud
الحصول على جميع الحجوزات

**Query Parameters:**
- `limit` (optional): عدد النتائج (default: 100)
- `offset` (optional): عدد النتائج المراد تخطيها (default: 0)
- `user_id` (optional): تصفية حسب user_id

### GET /api/bookings-crud/:id
الحصول على حجز بواسطة ID

### GET /api/bookings-crud/user/:userId
الحصول على حجوزات مستخدم معين

**Query Parameters:**
- `limit` (optional)
- `offset` (optional)

### GET /api/bookings-crud/trip/:tripId
الحصول على حجوزات رحلة معينة

**Query Parameters:**
- `limit` (optional)
- `offset` (optional)

### POST /api/bookings-crud
إنشاء حجز جديد

**Request Body:**
```json
{
  "user_id": 1,
  "trip_id": 5,
  "booking_status": "confirmed",
  "seats_booked": 2,
  "total_price": 100.50,
  "currency": "USD"
}
```

**Required Fields:** `user_id`, `trip_id`, `seats_booked`, `total_price`

### PATCH /api/bookings-crud/:id
تحديث حجز

**Request Body:**
```json
{
  "booking_status": "cancelled",
  "seats_booked": 1
}
```

### DELETE /api/bookings-crud/:id
حذف حجز

---

## 3. Trips API (الرحلات)

### GET /api/trips-crud
الحصول على جميع الرحلات أو البحث

**Query Parameters (للحصول على جميع الرحلات):**
- `limit` (optional): عدد النتائج (default: 100)
- `offset` (optional): عدد النتائج المراد تخطيها (default: 0)

**Query Parameters (للبحث):**
- `fromCityId` (optional): ID المدينة المنطلقة
- `toCityId` (optional): ID المدينة الواصلة
- `date` (optional): تاريخ الرحلة (YYYY-MM-DD)
- `status` (optional): حالة الرحلة
- `isActive` (optional): true/false
- `limit` (optional)
- `offset` (optional)

**Example:**
```
GET /api/trips-crud?fromCityId=1&toCityId=2&date=2024-12-20&isActive=true
```

### GET /api/trips-crud/:id
الحصول على رحلة بواسطة ID

### POST /api/trips-crud
إنشاء رحلة جديدة

**Request Body:**
```json
{
  "route_id": 1,
  "company_id": 1,
  "transport_type_id": 1,
  "departure_station_id": 1,
  "arrival_station_id": 2,
  "departure_time": "2024-12-20T10:00:00Z",
  "arrival_time": "2024-12-20T14:00:00Z",
  "duration_minutes": 240,
  "seats_total": 50,
  "seats_available": 50,
  "status": "scheduled",
  "is_active": true,
  "equipment": "wifi,ac,usb",
  "cancellation_policy": "Free cancellation up to 24h",
  "extra_info": "Additional information"
}
```

**Required Fields:** `route_id`, `company_id`, `transport_type_id`, `departure_station_id`, `arrival_station_id`, `departure_time`, `arrival_time`, `duration_minutes`, `seats_total`

### PATCH /api/trips-crud/:id
تحديث رحلة

**Request Body:**
```json
{
  "seats_available": 45,
  "status": "completed"
}
```

### DELETE /api/trips-crud/:id
حذف رحلة

---

## 4. Cities API (المدن)

### GET /api/cities
الحصول على جميع المدن

**Query Parameters:**
- `limit` (optional): عدد النتائج (default: 100)
- `offset` (optional): عدد النتائج المراد تخطيها (default: 0)

**Response:**
```json
[
  {
    "id": 1,
    "name": "Damascus",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

### GET /api/cities/search
البحث عن مدن

**Query Parameters:**
- `q` (required): مصطلح البحث
- `limit` (optional): عدد النتائج (default: 50)

**Example:**
```
GET /api/cities/search?q=dam
```

### GET /api/cities/:id
الحصول على مدينة بواسطة ID

### POST /api/cities
إنشاء مدينة جديدة

**Request Body:**
```json
{
  "name": "Damascus"
}
```

**Required Fields:** `name`

### PATCH /api/cities/:id
تحديث مدينة

**Request Body:**
```json
{
  "name": "Damascus City"
}
```

### DELETE /api/cities/:id
حذف مدينة

---

## ملاحظات مهمة

1. **أسماء الأعمدة:** تم استخدام نفس أسماء الأعمدة الموجودة في قاعدة البيانات بدون تغيير
2. **العلاقات:** 
   - `bookings` مرتبطة بـ `users` و `trips`
   - `trips` مرتبطة بـ `routes`, `companies`, `transport_types`, `stations`
   - `cities` مرتبطة بـ `routes` (من خلال from_city_id و to_city_id)
3. **التحقق من البيانات:** يتم التحقق من وجود السجلات المرتبطة قبل الإنشاء
4. **التوافق:** الـ endpoints الجديدة لا تتعارض مع الـ endpoints الموجودة (`/api/trips`, `/api/bookings`, إلخ)

## أمثلة الاستخدام

### إنشاء مدينة جديدة
```bash
curl -X POST http://localhost:4000/api/cities \
  -H "Content-Type: application/json" \
  -d '{"name": "Aleppo"}'
```

### البحث عن رحلات
```bash
curl "http://localhost:4000/api/trips-crud?fromCityId=1&toCityId=2&date=2024-12-20"
```

### إنشاء حجز
```bash
curl -X POST http://localhost:4000/api/bookings-crud \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "trip_id": 5,
    "seats_booked": 2,
    "total_price": 100.50
  }'
```
