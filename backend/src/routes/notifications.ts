import { Router } from "express";
import { pool } from "../db";
import { requireAuth, AuthedRequest } from "../middleware/auth";

const router = Router();

// GET /api/notifications - Get user's notifications
router.get("/", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const userId = req.user!.id;
    const { limit = 50, offset = 0, unread_only = false } = req.query;

    let query = `
      SELECT
        id,
        type,
        title,
        message,
        related_entity_type,
        related_entity_id,
        is_read,
        created_at
      FROM notifications
      WHERE user_id = $1
    `;

    const values: any[] = [userId];

    if (unread_only === "true") {
      query += ` AND is_read = false`;
    }

    query += ` ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(parseInt(limit as string), parseInt(offset as string));

    const result = await pool.query(query, values);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Error fetching notifications", error: String(error) });
  }
});

// GET /api/notifications/unread-count - Get count of unread notifications
router.get("/unread-count", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const userId = req.user!.id;

    const result = await pool.query(
      `SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false`,
      [userId]
    );

    res.json({ count: parseInt(result.rows[0].count) || 0 });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({ message: "Error fetching unread count", error: String(error) });
  }
});

// PATCH /api/notifications/:id/read - Mark notification as read
router.patch("/:id/read", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const userId = req.user!.id;
    const notificationId = parseInt(req.params.id);

    if (isNaN(notificationId)) {
      return res.status(400).json({ message: "Invalid notification ID" });
    }

    const result = await pool.query(
      `UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING id`,
      [notificationId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ ok: true, message: "Notification marked as read" });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Error marking notification as read", error: String(error) });
  }
});

// PATCH /api/notifications/read-all - Mark all notifications as read
router.patch("/read-all", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const userId = req.user!.id;

    await pool.query(
      `UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false`,
      [userId]
    );

    res.json({ ok: true, message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ message: "Error marking all notifications as read", error: String(error) });
  }
});

// DELETE /api/notifications/:id - Delete a notification
router.delete("/:id", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const userId = req.user!.id;
    const notificationId = parseInt(req.params.id);

    if (isNaN(notificationId)) {
      return res.status(400).json({ message: "Invalid notification ID" });
    }

    const result = await pool.query(
      `DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING id`,
      [notificationId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ ok: true, message: "Notification deleted" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ message: "Error deleting notification", error: String(error) });
  }
});

export default router;
