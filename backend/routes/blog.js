import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Generate URL-friendly slug from title
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .replace(/^-|-$/g, '');
}

// Auth middleware
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fluidlive-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// POST /api/blog/login - Admin login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const db = req.app.get('db');
    const { rows } = await db.query('SELECT * FROM admin_users WHERE email = $1', [email]);
    const user = rows[0];

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET || 'fluidlive-secret-key',
      { expiresIn: '24h' }
    );

    res.json({ success: true, token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/blog - Get all published blog posts (public)
router.get('/', async (req, res) => {
  try {
    const db = req.app.get('db');
    const { rows } = await db.query(
      'SELECT * FROM blog_posts WHERE published = true ORDER BY created_at DESC'
    );
    const posts = rows.map(formatPost);
    res.json({ success: true, posts });
  } catch (error) {
    console.error('Blog fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
});

// GET /api/blog/all - Get all blog posts including drafts (admin only)
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const db = req.app.get('db');
    const { rows } = await db.query('SELECT * FROM blog_posts ORDER BY created_at DESC');
    const posts = rows.map(formatPost);
    res.json({ success: true, posts });
  } catch (error) {
    console.error('Blog fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
});

// GET /api/blog/:slug - Get a single blog post by slug or id
router.get('/:slug', async (req, res) => {
  try {
    const db = req.app.get('db');
    const param = req.params.slug;
    // Try slug first, then fall back to id
    let result = await db.query('SELECT * FROM blog_posts WHERE slug = $1', [param]);
    if (result.rows.length === 0) {
      result = await db.query('SELECT * FROM blog_posts WHERE id = $1', [param]);
    }
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ success: true, post: formatPost(result.rows[0]) });
  } catch (error) {
    console.error('Blog post fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch blog post' });
  }
});

// POST /api/blog - Create a new blog post (admin only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, content, category, excerpt, readTime, published = true } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const db = req.app.get('db');
    
    // Generate unique slug
    let slug = generateSlug(title);
    const { rows: existing } = await db.query('SELECT id FROM blog_posts WHERE slug = $1', [slug]);
    if (existing.length > 0) {
      slug = `${slug}-${Date.now()}`;
    }

    const { rows } = await db.query(
      `INSERT INTO blog_posts (title, content, category, excerpt, read_time, author, published, slug)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        title,
        content,
        category || 'GENERAL',
        excerpt || content.substring(0, 150) + '...',
        readTime || '5 min read',
        req.user.name,
        published,
        slug
      ]
    );

    const newPost = formatPost(rows[0]);

    // Emit real-time event
    const io = req.app.get('io');
    if (io) io.emit('blog:created', newPost);

    res.status(201).json({ success: true, message: 'Blog post created', post: newPost });
  } catch (error) {
    console.error('Blog creation error:', error);
    res.status(500).json({ error: 'Failed to create blog post' });
  }
});

// PUT /api/blog/:id - Update a blog post (admin only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const db = req.app.get('db');
    const { title, content, category, excerpt, readTime, published } = req.body;

    // Build dynamic update query
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (title) { fields.push(`title = $${paramIndex++}`); values.push(title); }
    if (content) { fields.push(`content = $${paramIndex++}`); values.push(content); }
    if (category) { fields.push(`category = $${paramIndex++}`); values.push(category); }
    if (excerpt) { fields.push(`excerpt = $${paramIndex++}`); values.push(excerpt); }
    if (readTime) { fields.push(`read_time = $${paramIndex++}`); values.push(readTime); }
    if (published !== undefined) { fields.push(`published = $${paramIndex++}`); values.push(published); }
    fields.push(`updated_at = NOW()`);

    if (fields.length === 1) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(req.params.id);
    const { rows } = await db.query(
      `UPDATE blog_posts SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const updatedPost = formatPost(rows[0]);

    // Emit real-time event
    const io = req.app.get('io');
    if (io) io.emit('blog:updated', updatedPost);

    res.json({ success: true, message: 'Blog post updated', post: updatedPost });
  } catch (error) {
    console.error('Blog update error:', error);
    res.status(500).json({ error: 'Failed to update blog post' });
  }
});

// DELETE /api/blog/:id - Delete a blog post (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const db = req.app.get('db');
    const { rowCount } = await db.query('DELETE FROM blog_posts WHERE id = $1', [req.params.id]);

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Emit real-time event
    const io = req.app.get('io');
    if (io) io.emit('blog:deleted', req.params.id);

    res.json({ success: true, message: 'Blog post deleted' });
  } catch (error) {
    console.error('Blog deletion error:', error);
    res.status(500).json({ error: 'Failed to delete blog post' });
  }
});

// Helper to format DB row to API response
function formatPost(row) {
  return {
    id: row.id.toString(),
    slug: row.slug,
    title: row.title,
    content: row.content,
    category: row.category,
    excerpt: row.excerpt,
    readTime: row.read_time,
    author: row.author,
    published: row.published,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export default router;
