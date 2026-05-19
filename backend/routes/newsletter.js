import express from 'express';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const subscribeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

// POST /api/newsletter - Subscribe
router.post('/', subscribeLimiter, async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  try {
    const db = req.app.get('db');
    await db.query(
      'INSERT INTO newsletter_subscribers (email) VALUES ($1) ON CONFLICT (email) DO NOTHING',
      [email]
    );
    res.json({ success: true, message: 'You have been subscribed successfully!' });
  } catch (error) {
    console.error('Newsletter subscribe error:', error);
    res.status(500).json({ error: 'Failed to subscribe. Please try again later.' });
  }
});

// GET /api/newsletter - Get all subscribers (admin)
router.get('/', async (req, res) => {
  try {
    const db = req.app.get('db');
    const { rows } = await db.query('SELECT * FROM newsletter_subscribers ORDER BY subscribed_at DESC');
    res.json({ success: true, subscribers: rows });
  } catch (error) {
    console.error('Newsletter fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch subscribers' });
  }
});

export default router;
