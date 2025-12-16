import { Request, Response } from "express";
import { usersService, CreateUserDto, UpdateUserDto } from "../services/users.service";

export class UsersController {
  /**
   * GET /api/users
   * الحصول على جميع المستخدمين
   */
  async getAll(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;

      const users = await usersService.findAll(limit, offset);
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Error fetching users", error: String(error) });
    }
  }

  /**
   * GET /api/users/:id
   * الحصول على مستخدم بواسطة ID
   */
  async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const user = await usersService.findById(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Error fetching user", error: String(error) });
    }
  }

  /**
   * POST /api/users
   * إنشاء مستخدم جديد
   */
  async create(req: Request, res: Response) {
    try {
      const data: CreateUserDto = req.body;

      if (!data.email || !data.password_hash) {
        return res.status(400).json({ message: "Email and password_hash are required" });
      }

      // التحقق من عدم وجود مستخدم بنفس البريد الإلكتروني
      const emailExists = await usersService.emailExists(data.email);
      if (emailExists) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const user = await usersService.create(data);
      res.status(201).json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Error creating user", error: String(error) });
    }
  }

  /**
   * PATCH /api/users/:id
   * تحديث مستخدم
   */
  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const data: UpdateUserDto = req.body;

      // التحقق من عدم وجود مستخدم آخر بنفس البريد الإلكتروني
      if (data.email) {
        const emailExists = await usersService.emailExists(data.email, id);
        if (emailExists) {
          return res.status(400).json({ message: "Email already exists" });
        }
      }

      const user = await usersService.update(id, data);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Error updating user", error: String(error) });
    }
  }

  /**
   * DELETE /api/users/:id
   * حذف مستخدم
   */
  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const deleted = await usersService.delete(id);
      if (!deleted) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Error deleting user", error: String(error) });
    }
  }
}

export const usersController = new UsersController();
