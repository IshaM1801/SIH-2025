require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // service role key for backend
const supabase = createClient(supabaseUrl, supabaseKey);

// ------------------ USER REGISTRATION ------------------
// ------------------ USER REGISTRATION ------------------
const register = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ error: "Missing fields" });

  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: "http://localhost:5173/verify", // straight to front-end verify page
      },
    });

    if (authError) return res.status(400).json({ error: authError.message });

    res.json({
      message: "✅ Verification email sent! Check your inbox to verify your email.",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// ------------------ LOGIN ------------------
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Please fill all required fields" });

  try {
    // 1. Try employee login first
    const { data: empData, error: empError } = await supabase
      .from("employee_registry")
      .select("*")
      .eq("emp_email", email)
      .maybeSingle();

    if (empError) return res.status(500).json({ error: empError.message });

    if (empData) {
      // Found employee
      if (empData.password !== password)
        return res.status(401).json({ error: "Invalid password" });

      return res.json({
        message: `✅ Welcome ${empData.name} to the Department of ${empData.dept_name}`,
        employee: empData,
        type: "employee",
      });
    }

    // 2. If not employee, try Supabase Auth (normal user)
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) return res.status(401).json({ error: authError.message });

    return res.json({
      message: "✅ Welcome!",
      access_token: authData.session.access_token,
      user: authData.user,
      type: "user",
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// ------------------ VERIFY TOKEN ------------------


// ------------------ PASSWORD RESET ------------------
const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Missing email" });

  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: process.env.PASSWORD_RESET_REDIRECT || process.env.FRONTEND_URL + "/reset-password",
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
  if (!newPassword) return res.status(400).json({ error: "Missing new password" });

  try {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: "Password updated successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// ------------------ COMPLETE PROFILE AFTER VERIFICATION ------------------
const completeProfile = async (req, res) => {
  const { name, phone } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: "Missing name or phone" });
  }

  try {
    // Fetch all users
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) return res.status(400).json({ error: error.message });

    const users = data?.users || [];
    if (users.length === 0) {
      return res.status(400).json({ error: "No users found in Auth" });
    }

    // ✅ Find latest user by created_at timestamp
    const latestUser = users.reduce((latest, user) => {
      return new Date(user.created_at) > new Date(latest.created_at)
        ? user
        : latest;
    }, users[0]);

    if (!latestUser) {
      return res.status(400).json({ error: "Latest user not found" });
    }

    // Insert into profiles
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .insert([
        {
          auth_id: latestUser.id,
          email: latestUser.email,
          name,
          phone,
        },
      ])
      .select()
      .single();

    if (profileError) {
      return res.status(400).json({ error: profileError.message });
    }

    res.json({
      message: "Profile created successfully!",
      profile: profileData,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
module.exports = {
  supabase,
  register,
  login,
  requestPasswordReset,
  updatePassword,
  completeProfile,
};