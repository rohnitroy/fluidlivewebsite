import express from 'express';
import nodemailer from 'nodemailer';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiter: max 3 submissions per IP per 15 minutes
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: { error: 'Too many submissions. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

router.post('/', contactLimiter, async (req, res) => {
  const { name, email, company, message } = req.body;

  // Validate required fields
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  try {
    // Store in database
    const db = req.app.get('db');
    await db.query(
      'INSERT INTO contact_submissions (name, email, company, message) VALUES ($1, $2, $3, $4)',
      [name, email, company || null, message]
    );

    // Send email using Nodemailer (non-blocking — don't fail if email fails)
    try {
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT) || 587,
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });

        const mailOptions = {
          from: `"FluidLive Contact Form" <${process.env.SMTP_USER}>`,
          to: 'sodhi@fluid.live',
          replyTo: email,
          subject: `New Contact Form Submission from ${name}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Company:</strong> ${company || 'Not provided'}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
            <hr />
            <p style="color: #666; font-size: 12px;">This message was sent from the Fluid.Live website contact form.</p>
          `
        };

        await transporter.sendMail(mailOptions);
      }
    } catch (emailError) {
      console.error('Email send failed (submission still saved):', emailError.message);
    }

    res.json({ success: true, message: 'Your message has been sent successfully!' });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ error: 'Failed to send message. Please try again later.' });
  }
});

// GET /api/contact - Get all contact submissions (admin only - optional)
router.get('/', async (req, res) => {
  try {
    const db = req.app.get('db');
    const { rows } = await db.query('SELECT * FROM contact_submissions ORDER BY created_at DESC');
    res.json({ success: true, submissions: rows });
  } catch (error) {
    console.error('Contact fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

export default router;
