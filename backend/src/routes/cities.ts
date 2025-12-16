import { Router } from "express";
import { citiesController } from "../controllers/cities.controller";

const router = Router();

/**
 * GET /api/cities
 * الحصول على جميع المدن
 */
router.get("/", (req, res) => citiesController.getAll(req, res));

/**
 * GET /api/cities/search
 * البحث عن مدن
 */
router.get("/search", (req, res) => citiesController.search(req, res));

/**
 * GET /api/cities/:id
 * الحصول على مدينة بواسطة ID
 */
router.get("/:id", (req, res) => citiesController.getById(req, res));

/**
 * POST /api/cities
 * إنشاء مدينة جديدة
 */
router.post("/", (req, res) => citiesController.create(req, res));

/**
 * PATCH /api/cities/:id
 * تحديث مدينة
 */
router.patch("/:id", (req, res) => citiesController.update(req, res));

/**
 * DELETE /api/cities/:id
 * حذف مدينة
 */
router.delete("/:id", (req, res) => citiesController.delete(req, res));

export default router;
