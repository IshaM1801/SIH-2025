
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


const fs = require('fs');
const path = require('path');

// EWKB parser
function wkbToLatLng(wkbHex) {
  const bytes = new Uint8Array(wkbHex.match(/.{2}/g).map(b => parseInt(b, 16)));
  const view = new DataView(bytes.buffer);

  const littleEndian = view.getUint8(0) === 1;
  let geometryType = view.getUint32(1, littleEndian);
  const typeCode = geometryType & 0xFF;

  if (typeCode !== 1) throw new Error('This function only supports POINT geometry');

  const hasSrid = (geometryType & 0x20000000) !== 0;
  let offset = 5;
  let srid = null;
  if (hasSrid) {
    srid = view.getUint32(5, littleEndian);
    offset += 4;
  }

  const longitude = view.getFloat64(offset, littleEndian);
  const latitude = view.getFloat64(offset + 8, littleEndian);

  return { latitude, longitude, srid };
}

// EWKB POINT parser


// listReports template function
// Accepts any array of items with `location` field in WKB hex
async function listReports(req, res) {
  try {
    const userId = req.user.id; // Assuming auth middleware sets req.user

    // Fetch issues from Supabase where created_by == current user
    const { data: issues, error } = await supabase
      .from('issues')
      .select('*')
      .eq('created_by', userId);

    if (error) throw error;

    // Return issues directly
    res.json(issues || []);
  } catch (err) {
    console.error('Error fetching issues:', err);
    res.status(500).json({ error: err.message });
  }
}

// Get profile details from profiles table
async function getProfileDetails(req, res) {
  try {
    const userId = req.params.userId || req.user.id;
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      throw error;
    }

    res.json({ profile: profile || null });
  } catch (err) {
    console.error('Error fetching profile details:', err);
    res.status(500).json({ error: err.message });
  }
}

// Update profile
async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { name, phone } = req.body;

    const { data: profile, error } = await supabase
      .from('profiles')
      .upsert({
        auth_id: userId,
        name,
        phone,
        email: req.user.email,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ 
      message: 'Profile updated successfully',
      profile 
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: err.message });
  }
}



module.exports = { getProfile, createReport, listReports, getProfileDetails, updateProfile };
//