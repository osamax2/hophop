import { Router } from "express";
import { pool } from "../db";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import multer from "multer";
import path from "path";
import fs from "fs";

// Extend AuthedRequest with multer's file property
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
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
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

// GET /api/images/:id - Get image by ID (MUST come before GET / to avoid route conflict)
router.get("/:id", async (req, res) => {
  try {
    const imageId = parseInt(req.params.id);
    if (isNaN(imageId) || imageId <= 0) {
      return res.status(400).json({ message: "Invalid image ID" });
    }

    console.log(`[GET /api/images/:id] Fetching image with ID: ${imageId}`);

    // Check if is_active column exists first
    const columnCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='images' AND column_name='is_active'
    `);
    
    const hasIsActiveColumn = columnCheck.rows.length > 0;
    
    // First check if image exists at all
    let checkQuery = `SELECT id`;
    if (hasIsActiveColumn) {
      checkQuery += `, is_active`;
    }
    checkQuery += ` FROM images WHERE id = $1`;
    
    const checkResult = await pool.query(checkQuery, [imageId]);

    if (checkResult.rows.length === 0) {
      console.log(`[GET /api/images/:id] Image ${imageId} not found in database`);
      return res.status(404).json({ message: "Image not found" });
    }

    if (hasIsActiveColumn) {
      const imageStatus = checkResult.rows[0].is_active;
      console.log(`[GET /api/images/:id] Image ${imageId} found, is_active: ${imageStatus}`);
      
      // Check for images where is_active is true or NULL (NULL means active by default)
      const result = await pool.query(
        `
        SELECT id, image_url as url, file_name as name, mime_type as type
        FROM images
        WHERE id = $1 AND (is_active = true OR is_active IS NULL)
        `,
        [imageId]
      );

      if (result.rows.length === 0) {
        // Image exists but is inactive
        console.log(`[GET /api/images/:id] Image ${imageId} exists but is inactive`);
        return res.status(404).json({ message: "Image is inactive" });
      }
      
      console.log(`[GET /api/images/:id] Image ${imageId} found and active, returning data`);
      res.json(result.rows[0]);
    } else {
      // No is_active column, just return the image
      console.log(`[GET /api/images/:id] Image ${imageId} found (no is_active column), returning data`);
      const result = await pool.query(
        `
        SELECT id, image_url as url, file_name as name, mime_type as type
        FROM images
        WHERE id = $1
        `,
        [imageId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Image not found" });
      }
      
      res.json(result.rows[0]);
    }

  } catch (error: any) {
    console.error("[GET /api/images/:id] Error fetching image:", error);
    console.error("[GET /api/images/:id] Error stack:", error?.stack);
    const errorMessage = error?.message || String(error) || "Unknown database error";
    res.status(500).json({ 
      message: "Failed to fetch image from database", 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    });
  }
});

// GET /api/images - Get images by entity type and id
router.get("/", async (req, res) => {
  try {
    const { entity_type, entity_id } = req.query;

    if (!entity_type || !entity_id) {
      return res.status(400).json({ message: "entity_type and entity_id are required" });
    }

    // Check if is_active column exists
    const columnCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='images' AND column_name='is_active'
    `);
    
    const hasIsActiveColumn = columnCheck.rows.length > 0;
    
    let query = `
      SELECT id, entity_type, entity_id, image_url, file_name, created_at
      FROM images
      WHERE entity_type = $1 AND entity_id = $2
    `;
    
    if (hasIsActiveColumn) {
      query += ` AND (is_active = true OR is_active IS NULL)`;
    }
    
    query += ` ORDER BY created_at DESC`;
    
    const result = await pool.query(query, [entity_type, entity_id]);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).json({ message: "Error fetching images", error: String(error) });
  }
});

// POST /api/images - Upload an image
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

// DELETE /api/images/:id - Delete an image
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

