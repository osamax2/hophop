import { Router } from "express";
import { pool } from "../../db";
import { requireAuth, AuthedRequest } from "../../middleware/auth";
import multer from "multer";
import path from "path";
import fs from "fs";

interface MulterRequest extends AuthedRequest {
  file?: Express.Multer.File;
}

const router = Router();

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req: any, _file: any, cb: any) => {
    cb(null, uploadDir);
  },
  filename: (_req: any, file: any, cb: any) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req: any, file: any, cb: any) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// POST /api/admin/images - Upload an image (Admin/Agent only)
router.post("/", requireAuth, upload.single("image"), async (req: MulterRequest, res) => {
  try {
    const userId = req.user!.id;
    const { entity_type, entity_id } = req.body;

    if (!entity_type || !entity_id) {
      return res.status(400).json({ message: "entity_type and entity_id are required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    // Validate entity_type
    if (!["bus", "station", "trip"].includes(entity_type)) {
      return res.status(400).json({ message: "Invalid entity_type. Must be 'bus', 'station', or 'trip'" });
    }

    // Construct image URL (in production, this would be a CDN URL)
    const imageUrl = `/uploads/${req.file.filename}`;

    const result = await pool.query(
      `
      INSERT INTO images (
        entity_type,
        entity_id,
        image_url,
        image_path,
        file_name,
        file_size,
        mime_type,
        uploaded_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, entity_type, entity_id, image_url, file_name, created_at
      `,
      [
        entity_type,
        entity_id,
        imageUrl,
        req.file.path,
        req.file.originalname,
        req.file.size,
        req.file.mimetype,
        userId,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ message: "Error uploading image", error: String(error) });
  }
});

// GET /api/admin/images/all - Get all images (Admin/Agent only)
router.get("/all", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        i.id,
        i.entity_type,
        i.entity_id,
        i.image_url,
        i.file_name,
        i.file_size,
        i.mime_type,
        i.uploaded_by,
        i.created_at,
        u.first_name || ' ' || u.last_name as uploaded_by_name,
        u.email as uploaded_by_email
      FROM images i
      LEFT JOIN users u ON i.uploaded_by = u.id
      ORDER BY i.created_at DESC
      `
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).json({ message: "Error fetching images", error: String(error) });
  }
});

// DELETE /api/admin/images/:id - Delete an image (Admin/Agent only)
router.delete("/:id", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const imageId = parseInt(req.params.id);
    if (isNaN(imageId)) {
      return res.status(400).json({ message: "Invalid image ID" });
    }

    // Get image path before deleting
    const imageResult = await pool.query("SELECT image_path FROM images WHERE id = $1", [imageId]);
    
    if (imageResult.rows.length === 0) {
      return res.status(404).json({ message: "Image not found" });
    }

    // Delete file from filesystem
    const imagePath = imageResult.rows[0].image_path;
    if (imagePath && fs.existsSync(imagePath)) {
      try {
        fs.unlinkSync(imagePath);
      } catch (err) {
        console.error("Error deleting file:", err);
      }
    }

    // Delete from database
    await pool.query("DELETE FROM images WHERE id = $1", [imageId]);

    res.json({ ok: true, message: "Image deleted" });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ message: "Error deleting image", error: String(error) });
  }
});

export default router;
