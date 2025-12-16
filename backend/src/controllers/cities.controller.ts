import { Request, Response } from "express";
import { citiesService, CreateCityDto, UpdateCityDto } from "../services/cities.service";

export class CitiesController {
  /**
   * GET /api/cities
   * الحصول على جميع المدن
   */
  async getAll(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;

      console.log(`Fetching cities: limit=${limit}, offset=${offset}`);
      const cities = await citiesService.findAll(limit, offset);
      console.log(`Found ${cities.length} cities`);
      res.json(cities);
    } catch (error: any) {
      console.error("Error fetching cities:", error);
      console.error("Error details:", error.message, error.stack);
      res.status(500).json({ 
        message: "Error fetching cities", 
        error: String(error),
        details: error.message 
      });
    }
  }

  /**
   * GET /api/cities/search
   * البحث عن مدن
   */
  async search(req: Request, res: Response) {
    try {
      const searchTerm = req.query.q as string;
      if (!searchTerm) {
        return res.status(400).json({ message: "Search term (q) is required" });
      }

      const limit = parseInt(req.query.limit as string) || 50;
      const cities = await citiesService.search(searchTerm, limit);
      res.json(cities);
    } catch (error) {
      console.error("Error searching cities:", error);
      res.status(500).json({ message: "Error searching cities", error: String(error) });
    }
  }

  /**
   * GET /api/cities/:id
   * الحصول على مدينة بواسطة ID
   */
  async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid city ID" });
      }

      const city = await citiesService.findById(id);
      if (!city) {
        return res.status(404).json({ message: "City not found" });
      }

      res.json(city);
    } catch (error) {
      console.error("Error fetching city:", error);
      res.status(500).json({ message: "Error fetching city", error: String(error) });
    }
  }

  /**
   * POST /api/cities
   * إنشاء مدينة جديدة
   */
  async create(req: Request, res: Response) {
    try {
      const data: CreateCityDto = req.body;

      if (!data.name) {
        return res.status(400).json({ message: "Name is required" });
      }

      // التحقق من عدم وجود مدينة بنفس الاسم
      const nameExists = await citiesService.nameExists(data.name);
      if (nameExists) {
        return res.status(400).json({ message: "City with this name already exists" });
      }

      const city = await citiesService.create(data);
      res.status(201).json(city);
    } catch (error) {
      console.error("Error creating city:", error);
      res.status(500).json({ message: "Error creating city", error: String(error) });
    }
  }

  /**
   * PATCH /api/cities/:id
   * تحديث مدينة
   */
  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid city ID" });
      }

      const data: UpdateCityDto = req.body;

      // التحقق من عدم وجود مدينة أخرى بنفس الاسم
      if (data.name) {
        const nameExists = await citiesService.nameExists(data.name, id);
        if (nameExists) {
          return res.status(400).json({ message: "City with this name already exists" });
        }
      }

      const city = await citiesService.update(id, data);
      if (!city) {
        return res.status(404).json({ message: "City not found" });
      }

      res.json(city);
    } catch (error) {
      console.error("Error updating city:", error);
      res.status(500).json({ message: "Error updating city", error: String(error) });
    }
  }

  /**
   * DELETE /api/cities/:id
   * حذف مدينة
   */
  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid city ID" });
      }

      const deleted = await citiesService.delete(id);
      if (!deleted) {
        return res.status(404).json({ message: "City not found" });
      }

      res.json({ message: "City deleted successfully" });
    } catch (error) {
      console.error("Error deleting city:", error);
      res.status(500).json({ message: "Error deleting city", error: String(error) });
    }
  }
}

export const citiesController = new CitiesController();
