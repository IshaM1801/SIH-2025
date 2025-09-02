require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ------------------ REGISTER ------------------
const register = async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password || !phone)
    return res.status(400).json({ error: "Missing required fields" });

  try {
    // Check if profile already exists
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("auth_id")
      .eq("email", email)
      .maybeSingle();

    if (existingUser)
      return res.status(400).json({ error: "Email already registered" });

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) return res.status(400).json({ error: authError.message });

    const userId = authData.user.id;

    // Immediately create profile in profiles table
    const { data: profileData, error: insertError } = await supabase
      .from("profiles")
      .insert([{ auth_id: userId, name, phone, email }])
      .maybeSingle();

    if (insertError) return res.status(400).json({ error: insertError.message });

    res.json({
      message: "✅ Registration successful! Profile created.",
      user: { id: userId, email },
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
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({ email, password });

      if (authError) return res.status(400).json({ error: authError.message });

      // Fetch profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("auth_id", authData.user.id)
        .maybeSingle();

      return res.json({
        message: `✅ Welcome ${profile.name}!`,
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

// ------------------ EXPORT ------------------
module.exports = {
  supabase,
  register,
  login,
};