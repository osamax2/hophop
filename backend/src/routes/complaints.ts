import { Router, Request, Response } from 'express';
import { pool } from '../db';
import { requireAuth, AuthedRequest } from '../middleware/auth';

const router = Router();

// Generate unique complaint number
const generateComplaintNumber = (): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `CMP-${year}-${random}`;
};

// Generate unique deletion request number
const generateDeletionRequestNumber = (): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `DEL-${year}-${random}`;
};

// Submit a new complaint (public - no auth required)
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      complainerType,
      againstType,
      userId,
      name,
      email,
      phone,
      subject,
      description,
      tripDate,
      tripRoute,
    } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate unique complaint number
    let complaintNumber = generateComplaintNumber();
    
    // Make sure it's unique
    let attempts = 0;
    while (attempts < 10) {
      const existing = await pool.query(
        'SELECT id FROM complaints WHERE complaint_number = $1',
        [complaintNumber]
      );
      if (existing.rows.length === 0) break;
      complaintNumber = generateComplaintNumber();
      attempts++;
    }

    const result = await pool.query(
      `INSERT INTO complaints (
        complaint_number, complainer_type, against_type, user_id, name, email, phone,
        subject, description, trip_date, trip_route, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending')
      RETURNING *`,
      [
        complaintNumber,
        complainerType || 'passenger',
        againstType || 'company',
        userId || null,
        name,
        email,
        phone || null,
        subject,
        description,
        tripDate || null,
        tripRoute || null,
      ]
    );

    res.status(201).json({
      success: true,
      complaintNumber: result.rows[0].complaint_number,
      id: result.rows[0].id,
    });
  } catch (error) {
    console.error('Error creating complaint:', error);
    res.status(500).json({ error: 'Failed to submit complaint' });
  }
});

// Get all complaints (admin only)
router.get('/admin', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    // Check if user is admin
    if (!user || !['admin', 'Admin', 'ADMIN', 'administrator', 'Administrator'].includes(user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { status, search, limit = 100, offset = 0 } = req.query;

    let query = 'SELECT * FROM complaints';
    const params: any[] = [];
    const conditions: string[] = [];

    if (status && status !== 'all') {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(complaint_number ILIKE $${params.length} OR name ILIKE $${params.length} OR subject ILIKE $${params.length})`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';
    
    params.push(limit);
    query += ` LIMIT $${params.length}`;
    
    params.push(offset);
    query += ` OFFSET $${params.length}`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

// Get single complaint (admin only)
router.get('/admin/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    if (!user || !['admin', 'Admin', 'ADMIN', 'administrator', 'Administrator'].includes(user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { id } = req.params;
    const result = await pool.query('SELECT * FROM complaints WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching complaint:', error);
    res.status(500).json({ error: 'Failed to fetch complaint' });
  }
});

// Update complaint status (admin only)
router.put('/admin/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    if (!user || !['admin', 'Admin', 'ADMIN', 'administrator', 'Administrator'].includes(user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { id } = req.params;
    const { status, admin_notes } = req.body;

    const result = await pool.query(
      `UPDATE complaints 
       SET status = COALESCE($1, status), 
           admin_notes = COALESCE($2, admin_notes),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [status, admin_notes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating complaint:', error);
    res.status(500).json({ error: 'Failed to update complaint' });
  }
});

// Delete complaint (admin only)
router.delete('/admin/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    if (!user || !['admin', 'Admin', 'ADMIN', 'administrator', 'Administrator'].includes(user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { id } = req.params;
    const result = await pool.query('DELETE FROM complaints WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    res.json({ success: true, message: 'Complaint deleted' });
  } catch (error) {
    console.error('Error deleting complaint:', error);
    res.status(500).json({ error: 'Failed to delete complaint' });
  }
});

export default router;
