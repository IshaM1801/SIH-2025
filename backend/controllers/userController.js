// backend/controllers/userController.js
const supabase = require('../config/supabaseClient');

/**
 * Return the supabase user object populated by authMiddleware
 */
async function getProfile(req, res) {
  try {
    res.json({ user: req.user });
  } catch (err) {
    console.error('getProfile err', err);
    res.status(500).json({ error: 'Server error' });
  }
}

/**
 * Create a simple report row in `reports` table.
 * Expects JSON body: { category, description, lat, lng, severity }
 */
async function createReport(req, res) {
  try {
    const { category, description, lat, lng, severity } = req.body;
    if (!category || typeof lat === 'undefined' || typeof lng === 'undefined') {
      return res.status(400).json({ error: 'category, lat and lng are required' });
    }

    const payload = {
      reporter_id: req.user.id,
      category,
      description: description || null,
      latitude: lat,
      longitude: lng,
      severity: severity || 'low',
      status: 'submitted',
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('reports')
      .insert([payload])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message || error });
    res.status(201).json({ report: data });
  } catch (err) {
    console.error('createReport err', err);
    res.status(500).json({ error: 'Server error creating report' });
  }
}

/**
 * List reports for logged-in user
 */
async function listReports(req, res) {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('reporter_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message || error });
    res.json({ reports: data || [] });
  } catch (err) {
    console.error('listReports err', err);
    res.status(500).json({ error: 'Server error listing reports' });
  }
}
//backend/
module.exports = { getProfile, createReport, listReports };