// backend/controllers/authController.js
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY; 
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports.supabase = supabase;

// ------------------ REGISTER (with email verification) ------------------
exports.register = async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: process.env.EMAIL_REDIRECT_URL || "http://localhost:3000/verify", 
      },
    });

    if (error) return res.status(400).json({ error: error.message });

    res.json({
      message: "Registration successful! Please check your email for verification link.",
      user: data.user,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------ LOGIN ------------------
exports.login = async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return res.status(400).json({ error: error.message });

  // If email is not verified, block login
  if (!data.user?.email_confirmed_at) {
    return res.status(401).json({ error: "Email not verified. Please confirm your email." });
  }

  res.json({ user: data.user, session: data.session });
};

// ------------------ VERIFY TOKEN ------------------
exports.verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    const { data, error } = await supabase.auth.getUser(token);

    if (error) return res.status(401).json({ error: error.message });

    res.json({ user: data.user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};