import { Router } from "express";
import { tripsController } from "../controllers/trips.controller";

const router = Router();

/**
 * GET /api/trips-crud
 * الحصول على جميع الرحلات أو البحث
 */
router.get("/", (req, res) => tripsController.getAll(req, res));

/**
 * GET /api/trips-crud/:id
 * الحصول على رحلة بواسطة ID
 */
router.get("/:id", (req, res) => tripsController.getById(req, res));

/**
 * POST /api/trips-crud
 * إنشاء رحلة جديدة
 */
router.post("/", (req, res) => tripsController.create(req, res));

/**
 * PATCH /api/trips-crud/:id
 * تحديث رحلة
 */
router.patch("/:id", (req, res) => tripsController.update(req, res));

/**
 * DELETE /api/trips-crud/:id
 * حذف رحلة
 */
router.delete("/:id", (req, res) => tripsController.delete(req, res));

export default router;
