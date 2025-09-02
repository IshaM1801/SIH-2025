require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ------------------ USER REGISTRATION ------------------
const register = async (req, res) => {
  const { name, email, password, phone } = req.body;

  try {
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if user already exists in profiles
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("auth_id")
      .eq("email", email)
      .maybeSingle();

    if (existingUser) return res.status(400).json({ error: "Email already registered" });

    // Sign up user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: process.env.EMAIL_REDIRECT_URL || "http://localhost:5173/verify",
      },
    });

    if (authError) return res.status(400).json({ error: authError.message });

    // Wait for email verification before creating profile
    res.json({
      message: "✅ Registration successful! Please verify your email before logging in.",
      user: { id: authData.user.id, email: authData.user.email },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------ LOGIN ------------------
const login = async (req, res) => {
  const { email, password, role, name, phone } = req.body;

  try {
    if (!email || !password || !role) {
      return res.status(400).json({ error: "⚠️ Please fill all required fields" });
    }

    if (role === "user") {
      // User login via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) return res.status(400).json({ error: authError.message });

      // Check if email is verified
      if (!authData.user.email_confirmed_at) {
        return res.status(403).json({ error: "⚠️ Please verify your email before logging in." });
      }

      // Fetch profile from Supabase
      let { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("auth_id", authData.user.id)
        .maybeSingle();

      // Create profile if missing (first-time login)
      if (!profileData) {
        if (!name || !phone) {
          return res.status(400).json({ error: "⚠️ Please provide your name and phone number" });
        }

        const { data: newProfile, error: insertError } = await supabase
          .from("profiles")
          .insert([{ auth_id: authData.user.id, name, email, phone, password }])
          .maybeSingle();

        if (insertError) return res.status(400).json({ error: insertError.message });
        profileData = newProfile;
      }

      return res.json({
        message: `✅ Welcome ${profileData.name}!`,
        user: authData.user,
        profile: profileData,
      });
    }

    // Employee login
    else if (role === "employee") {
      const { data: empData, error: empError } = await supabase
        .from("employee_registry")
        .select("*")
        .eq("emp_email", email)
        .maybeSingle();

      if (empError) return res.status(400).json({ error: empError.message });
      if (!empData) return res.status(400).json({ error: "Invalid employee email" });
      if (empData.password !== password) return res.status(401).json({ error: "Invalid password" });

      return res.json({
        message: `✅ Welcome ${empData.name} to the Department of ${empData.dept_name}`,
        employee: empData,
      });
    } else {
      return res.status(400).json({ error: "Invalid role specified" });
    }
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ------------------ VERIFY TOKEN ------------------
const verifyToken = async (req, res) => {
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

// ------------------ PASSWORD RESET ------------------
const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) return res.status(400).json({ error: "Missing email" });

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: process.env.PASSWORD_RESET_REDIRECT || "http://localhost:5173/reset-password",
    });
    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: "Password reset email sent!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------ UPDATE PASSWORD ------------------
const updatePassword = async (req, res) => {
  const { newPassword } = req.body;
  try {
    if (!newPassword) return res.status(400).json({ error: "Missing new password" });

    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: "Password updated successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------ EXPORT ------------------
module.exports = {
  supabase,
  register,
  login,
  verifyToken,
  requestPasswordReset,
  updatePassword,
};