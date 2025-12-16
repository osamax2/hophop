import { Router } from "express";
import { usersController } from "../controllers/users.controller";

const router = Router();

/**
 * GET /api/users
 * الحصول على جميع المستخدمين
 */
router.get("/", (req, res) => usersController.getAll(req, res));

/**
 * GET /api/users/:id
 * الحصول على مستخدم بواسطة ID
 */
router.get("/:id", (req, res) => usersController.getById(req, res));

/**
 * POST /api/users
 * إنشاء مستخدم جديد
 */
router.post("/", (req, res) => usersController.create(req, res));

/**
 * PATCH /api/users/:id
 * تحديث مستخدم
 */
router.patch("/:id", (req, res) => usersController.update(req, res));

/**
 * DELETE /api/users/:id
 * حذف مستخدم
 */
router.delete("/:id", (req, res) => usersController.delete(req, res));

export default router;
