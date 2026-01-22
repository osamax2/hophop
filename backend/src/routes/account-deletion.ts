import { Router, Request, Response } from 'express';
import { pool } from '../db';
import { requireAuth, AuthedRequest } from '../middleware/auth';

const router = Router();

// Generate unique request number
const generateRequestNumber = (): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `DEL-${year}-${random}`;
};

// Submit account deletion request (public - no auth required)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { email, reason, userId } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if there's already a pending request for this email
    const existing = await pool.query(
      "SELECT id FROM account_deletion_requests WHERE email = $1 AND status = 'pending'",
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ 
        error: 'A pending deletion request already exists for this email' 
      });
    }

    // Generate unique request number
    let requestNumber = generateRequestNumber();
    
    // Make sure it's unique
    let attempts = 0;
    while (attempts < 10) {
      const check = await pool.query(
        'SELECT id FROM account_deletion_requests WHERE request_number = $1',
        [requestNumber]
      );
      if (check.rows.length === 0) break;
      requestNumber = generateRequestNumber();
      attempts++;
    }

    const result = await pool.query(
      `INSERT INTO account_deletion_requests (
        request_number, user_id, email, reason, status
      ) VALUES ($1, $2, $3, $4, 'pending')
      RETURNING *`,
      [requestNumber, userId || null, email, reason || null]
    );

    res.status(201).json({
      success: true,
      requestNumber: result.rows[0].request_number,
      id: result.rows[0].id,
    });
  } catch (error) {
    console.error('Error creating deletion request:', error);
    res.status(500).json({ error: 'Failed to submit deletion request' });
  }
});

// Get all deletion requests (admin only)
router.get('/admin', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    if (!user || !['admin', 'Admin', 'ADMIN', 'administrator', 'Administrator'].includes(user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { status, limit = 100, offset = 0 } = req.query;

    let query = 'SELECT * FROM account_deletion_requests';
    const params: any[] = [];

    if (status && status !== 'all') {
      params.push(status);
      query += ` WHERE status = $${params.length}`;
    }

    query += ' ORDER BY created_at DESC';
    
    params.push(limit);
    query += ` LIMIT $${params.length}`;
    
    params.push(offset);
    query += ` OFFSET $${params.length}`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching deletion requests:', error);
    res.status(500).json({ error: 'Failed to fetch deletion requests' });
  }
});

// Update deletion request status (admin only)
router.put('/admin/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    if (!user || !['admin', 'Admin', 'ADMIN', 'administrator', 'Administrator'].includes(user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { id } = req.params;
    const { status, admin_notes } = req.body;

    const updateFields: string[] = [];
    const params: any[] = [];

    if (status) {
      params.push(status);
      updateFields.push(`status = $${params.length}`);
      
      if (status === 'completed' || status === 'rejected') {
        updateFields.push('processed_at = CURRENT_TIMESTAMP');
        params.push(user.id);
        updateFields.push(`processed_by = $${params.length}`);
      }
    }

    if (admin_notes !== undefined) {
      params.push(admin_notes);
      updateFields.push(`admin_notes = $${params.length}`);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(id);
    const result = await pool.query(
      `UPDATE account_deletion_requests 
       SET ${updateFields.join(', ')}
       WHERE id = $${params.length}
       RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating deletion request:', error);
    res.status(500).json({ error: 'Failed to update deletion request' });
  }
});

// Process account deletion (admin only) - actually deletes the user
router.post('/admin/:id/process', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    if (!user || !['admin', 'Admin', 'ADMIN', 'administrator', 'Administrator'].includes(user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { id } = req.params;

    // Get the deletion request
    const request = await pool.query(
      'SELECT * FROM account_deletion_requests WHERE id = $1',
      [id]
    );

    if (request.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const deletionRequest = request.rows[0];

    if (deletionRequest.status === 'completed') {
      return res.status(400).json({ error: 'Request already processed' });
    }

    // If there's a user_id, delete the user
    if (deletionRequest.user_id) {
      await pool.query('DELETE FROM users WHERE id = $1', [deletionRequest.user_id]);
    }

    // Update the request status
    await pool.query(
      `UPDATE account_deletion_requests 
       SET status = 'completed', processed_at = CURRENT_TIMESTAMP, processed_by = $1
       WHERE id = $2`,
      [user.id, id]
    );

    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error processing deletion:', error);
    res.status(500).json({ error: 'Failed to process deletion' });
  }
});

export default router;
