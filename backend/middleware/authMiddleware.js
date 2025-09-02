// backend/middleware/authMiddleware.js
const supabase = require('../config/supabaseClient');
//backend/
async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = data.user; // supabase user object

    // Optional: ensure a row exists in your 'users' table for quick joins/metadata
    // check and insert if missing (non-blocking if you prefer)
    const { data: existing, error: fetchErr } = await supabase
      .from('users')
      .select('id')
      .eq('id', data.user.id)
      .maybeSingle();

    if (fetchErr) {
      console.warn('Warning: error checking users table:', fetchErr);
    } else if (!existing || existing.length === 0) {
      // create minimal user record
      await supabase.from('users').insert([{
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.full_name || null,
        created_at: new Date().toISOString()
      }]);
    }

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ error: 'Auth verification failed' });
  }
}

module.exports = authMiddleware;