require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Must be service role key
const supabase = createClient(supabaseUrl, supabaseKey);

// ------------------ REGISTER ------------------
const register = async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password || !phone)
    return res.status(400).json({ error: "Missing required fields" });

  if (password.length < 6)
    return res.status(400).json({ error: "Password must be at least 6 characters" });

  try {
    // Check if profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from("profiles")
      .select("auth_id")
      .eq("email", email)
      .maybeSingle();

    if (checkError) {
      console.log("Check profile error:", checkError);
      return res.status(500).json({ error: "Server error checking profile" });
    }

    if (existingProfile) return res.status(400).json({ error: "Email already registered" });

    // Step 1: Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // optional, automatically confirms email
    });

    if (authError) {
      console.log("Supabase createUser error:", authError);
      return res.status(400).json({ error: authError.message });
    }

    const auth_id = authData.user.id;

    // Step 2: Insert profile immediately
    const { data: profileData, error: insertError } = await supabase
      .from("profiles")
      .insert([{ auth_id, name, email, phone }])
      .maybeSingle();

    if (insertError) {
      console.log("Insert profile error:", insertError);
      return res.status(400).json({ error: insertError.message });
    }

    res.json({
      message: "✅ Registration successful! Profile created immediately.",
      user: { id: auth_id, email },
      profile: profileData,
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ------------------ LOGIN ------------------
const login = async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role)
    return res.status(400).json({ error: "Please fill all required fields" });

  try {
    if (role === "user") {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) return res.status(400).json({ error: authError.message });

      // Fetch profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("auth_id", authData.user.id)
        .maybeSingle();

      return res.json({
        message: `✅ Welcome ${profile?.name || "User"}!`,
        user: authData.user,
        profile,
      });
    } else if (role === "employee") {
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
    res.status(500).json({ error: err.message });
  }
};

module.exports = { supabase, register, login };