import { Request, Response } from "express";
import { tripsService, CreateTripDto, UpdateTripDto } from "../services/trips.service";

export class TripsController {
  /**
   * GET /api/trips
   * الحصول على جميع الرحلات أو البحث
   */
  async getAll(req: Request, res: Response) {
    try {
      // company_id filter for agent managers
      const companyId = req.query.company_id ? parseInt(req.query.company_id as string) : undefined;

      // إذا كان هناك معايير بحث، استخدم search
      if (req.query.fromCityId || req.query.toCityId || req.query.date || req.query.status || req.query.isActive !== undefined || companyId) {
        const filters = {
          fromCityId: req.query.fromCityId ? parseInt(req.query.fromCityId as string) : undefined,
          toCityId: req.query.toCityId ? parseInt(req.query.toCityId as string) : undefined,
          date: req.query.date as string | undefined,
          status: req.query.status as string | undefined,
          isActive: req.query.isActive !== undefined ? req.query.isActive === "true" : undefined,
          companyId: companyId,
          limit: req.query.limit ? parseInt(req.query.limit as string) : 100,
          offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
        };

        const trips = await tripsService.search(filters);
        return res.json(trips);
      }

      // وإلا، احصل على جميع الرحلات
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;

      const trips = await tripsService.findAll(limit, offset);
      res.json(trips);
    } catch (error) {
      console.error("Error fetching trips:", error);
      res.status(500).json({ message: "Error fetching trips", error: String(error) });
    }
  }

  /**
   * GET /api/trips/:id
   * الحصول على رحلة بواسطة ID
   */
  async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid trip ID" });
      }

      const trip = await tripsService.findById(id);
      if (!trip) {
        return res.status(404).json({ message: "Trip not found" });
      }

      res.json(trip);
    } catch (error) {
      console.error("Error fetching trip:", error);
      res.status(500).json({ message: "Error fetching trip", error: String(error) });
    }
  }

  /**
   * POST /api/trips
   * إنشاء رحلة جديدة
   */
  async create(req: Request, res: Response) {
    try {
      const data: CreateTripDto = req.body;

      if (
        !data.route_id ||
        !data.company_id ||
        !data.transport_type_id ||
        !data.departure_station_id ||
        !data.arrival_station_id ||
        !data.departure_time ||
        !data.arrival_time ||
        !data.duration_minutes ||
        !data.seats_total
      ) {
        return res.status(400).json({
          message:
            "route_id, company_id, transport_type_id, departure_station_id, arrival_station_id, departure_time, arrival_time, duration_minutes, and seats_total are required",
        });
      }

      const trip = await tripsService.create(data);
      res.status(201).json(trip);
    } catch (error) {
      console.error("Error creating trip:", error);
      res.status(500).json({ message: "Error creating trip", error: String(error) });
    }
  }

  /**
   * PATCH /api/trips/:id
   * تحديث رحلة
   */
  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid trip ID" });
      }

      const data: UpdateTripDto = req.body;
      const trip = await tripsService.update(id, data);

      if (!trip) {
        return res.status(404).json({ message: "Trip not found" });
      }

      res.json(trip);
    } catch (error) {
      console.error("Error updating trip:", error);
      res.status(500).json({ message: "Error updating trip", error: String(error) });
    }
  }

  /**
   * DELETE /api/trips/:id
   * حذف رحلة
   */
  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid trip ID" });
      }

      const deleted = await tripsService.delete(id);
      if (!deleted) {
        return res.status(404).json({ message: "Trip not found" });
      }

      res.json({ message: "Trip deleted successfully" });
    } catch (error) {
      console.error("Error deleting trip:", error);
      res.status(500).json({ message: "Error deleting trip", error: String(error) });
    }
  }
}

export const tripsController = new TripsController();
