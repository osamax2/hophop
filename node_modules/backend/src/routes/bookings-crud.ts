import { Router } from "express";
import { bookingsController } from "../controllers/bookings.controller";

const router = Router();

/**
 * GET /api/bookings-crud
 * الحصول على جميع الحجوزات
 */
router.get("/", (req, res) => bookingsController.getAll(req, res));

/**
 * GET /api/bookings-crud/user/:userId
 * الحصول على حجوزات مستخدم معين
 */
router.get("/user/:userId", (req, res) => bookingsController.getByUserId(req, res));

/**
 * GET /api/bookings-crud/trip/:tripId
 * الحصول على حجوزات رحلة معينة
 */
router.get("/trip/:tripId", (req, res) => bookingsController.getByTripId(req, res));

/**
 * GET /api/bookings-crud/:id
 * الحصول على حجز بواسطة ID
 */
router.get("/:id", (req, res) => bookingsController.getById(req, res));

/**
 * POST /api/bookings-crud
 * إنشاء حجز جديد
 */
router.post("/", (req, res) => bookingsController.create(req, res));

/**
 * PATCH /api/bookings-crud/:id
 * تحديث حجز
 */
router.patch("/:id", (req, res) => bookingsController.update(req, res));

/**
 * DELETE /api/bookings-crud/:id
 * حذف حجز
 */
router.delete("/:id", (req, res) => bookingsController.delete(req, res));

export default router;
