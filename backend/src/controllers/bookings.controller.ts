import { Request, Response } from "express";
import { bookingsService, CreateBookingDto, UpdateBookingDto } from "../services/bookings.service";

export class BookingsController {
  /**
   * GET /api/bookings
   * الحصول على جميع الحجوزات
   */
  async getAll(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;
      const userId = req.query.user_id ? parseInt(req.query.user_id as string) : undefined;

      const bookings = await bookingsService.findAll(limit, offset, userId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Error fetching bookings", error: String(error) });
    }
  }

  /**
   * GET /api/bookings/:id
   * الحصول على حجز بواسطة ID
   */
  async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid booking ID" });
      }

      const booking = await bookingsService.findById(id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      res.json(booking);
    } catch (error) {
      console.error("Error fetching booking:", error);
      res.status(500).json({ message: "Error fetching booking", error: String(error) });
    }
  }

  /**
   * POST /api/bookings
   * إنشاء حجز جديد
   */
  async create(req: Request, res: Response) {
    try {
      const data: CreateBookingDto = req.body;

      if (!data.user_id || !data.trip_id || !data.seats_booked || !data.total_price) {
        return res.status(400).json({
          message: "user_id, trip_id, seats_booked, and total_price are required",
        });
      }

      // التحقق من وجود المستخدم والرحلة
      const userExists = await bookingsService.userExists(data.user_id);
      if (!userExists) {
        return res.status(404).json({ message: "User not found" });
      }

      const tripExists = await bookingsService.tripExists(data.trip_id);
      if (!tripExists) {
        return res.status(404).json({ message: "Trip not found" });
      }

      const booking = await bookingsService.create(data);
      res.status(201).json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Error creating booking", error: String(error) });
    }
  }

  /**
   * PATCH /api/bookings/:id
   * تحديث حجز
   */
  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid booking ID" });
      }

      const data: UpdateBookingDto = req.body;
      const booking = await bookingsService.update(id, data);

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      res.json(booking);
    } catch (error) {
      console.error("Error updating booking:", error);
      res.status(500).json({ message: "Error updating booking", error: String(error) });
    }
  }

  /**
   * DELETE /api/bookings/:id
   * حذف حجز
   */
  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid booking ID" });
      }

      const deleted = await bookingsService.delete(id);
      if (!deleted) {
        return res.status(404).json({ message: "Booking not found" });
      }

      res.json({ message: "Booking deleted successfully" });
    } catch (error) {
      console.error("Error deleting booking:", error);
      res.status(500).json({ message: "Error deleting booking", error: String(error) });
    }
  }

  /**
   * GET /api/bookings/user/:userId
   * الحصول على حجوزات مستخدم معين
   */
  async getByUserId(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;

      const bookings = await bookingsService.findByUserId(userId, limit, offset);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      res.status(500).json({ message: "Error fetching user bookings", error: String(error) });
    }
  }

  /**
   * GET /api/bookings/trip/:tripId
   * الحصول على حجوزات رحلة معينة
   */
  async getByTripId(req: Request, res: Response) {
    try {
      const tripId = parseInt(req.params.tripId);
      if (isNaN(tripId)) {
        return res.status(400).json({ message: "Invalid trip ID" });
      }

      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;

      const bookings = await bookingsService.findByTripId(tripId, limit, offset);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching trip bookings:", error);
      res.status(500).json({ message: "Error fetching trip bookings", error: String(error) });
    }
  }
}

export const bookingsController = new BookingsController();
