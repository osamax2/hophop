import { Router, Request, Response } from 'express';
import { emailService } from '../services/email';

const router = Router();

/**
 * POST /api/contact
 * Send a contact form submission
 * Public endpoint - no authentication required
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).json({ 
        message: 'All fields are required',
        missing: {
          name: !name,
          email: !email,
          phone: !phone,
          subject: !subject,
          message: !message
        }
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }

    console.log(`📧 Contact form submission from ${name} (${email})`);

    // Send email to info@hophopsy.com
    await emailService.sendContactFormSubmission({
      name,
      email,
      phone,
      subject,
      message
    });

    res.json({ 
      message: 'Contact form submitted successfully',
      success: true
    });
  } catch (error: any) {
    console.error('Error processing contact form:', error);
    res.status(500).json({ 
      message: 'Error sending message. Please try again later.',
      error: String(error)
    });
  }
});

export default router;
