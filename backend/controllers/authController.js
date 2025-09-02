require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ------------------ REGISTER ------------------
const register = async (req, res) => {
  const { email, password, role, emp_id, name } = req.body;

  try {
    if (!email || !password || !name)
      return res.status(400).json({ error: "Missing required fields" });

    let deptName = null;

    // Employee validation
    if (role === "employee") {
      if (!emp_id) return res.status(400).json({ error: "Missing employee ID" });

      const empIdQuery = isNaN(emp_id) ? emp_id : Number(emp_id);

      // Fetch employee data safely
      const { data: empData, error: empError } = await supabase
        .from("employee_registry")
        .select("*")
        .eq("emp_id", empIdQuery)
        .maybeSingle(); // <- safer than .single() or .limit(1)

      if (empError) return res.status(400).json({ error: "Error fetching employee data" });
      if (!empData) return res.status(400).json({ error: "Invalid employee ID" });

      // Validate password
      if (password !== empData.emp_password)
        return res.status(400).json({ error: "Invalid employee password" });

      deptName = empData.dept_name; // fetch department from registry
    }

    // Supabase Auth signup
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: process.env.EMAIL_REDIRECT_URL || "http://localhost:5174/verify",
      },
    });
    if (authError) return res.status(400).json({ error: authError.message });

    // Insert into profiles table
    const { data: profileData, error: profileError } = await supabase.from("profiles").insert([
      {
        auth_id: authData.user.id,
        name,
        role,
        emp_id: role === "employee" ? emp_id : null,
        dept_name: deptName,
      },
    ]).maybeSingle(); // <- safer

    if (profileError) return res.status(400).json({ error: profileError.message });

    res.json({
      message: "Registration successful! Please check your email.",
      user: authData.user,
      profile: profileData,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------ LOGIN ------------------
const login = async (req, res) => {
  const { email, password, role, emp_id } = req.body;

  try {
    if (!email || !password) return res.status(400).json({ error: "Missing email or password" });

    // Employee login validation
    if (role === "employee") {
      if (!emp_id) return res.status(400).json({ error: "Missing employee ID" });

      const empIdQuery = isNaN(emp_id) ? emp_id : Number(emp_id);

      const { data: empData, error: empError } = await supabase
        .from("employee_registry")
        .select("emp_password, dept_name")
        .eq("emp_id", empIdQuery)
        .maybeSingle(); // <- safer

      if (empError) return res.status(400).json({ error: "Error fetching employee data" });
      if (!empData) return res.status(400).json({ error: "Invalid employee ID" });
      if (password !== empData.emp_password) return res.status(401).json({ error: "Invalid employee password" });
    }

    // Supabase login
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(400).json({ error: error.message });

    // Fetch profile info to send name (and department if employee)
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("name, emp_id, dept_name")
      .eq("auth_id", data.user.id)
      .maybeSingle(); // <- safer

    if (profileError) return res.status(400).json({ error: profileError.message });

    let response = {
      message: "Login successful",
      user: data.user,
      session: data.session,
      name: profileData?.name || "Unknown",
    };

    if (role === "employee") {
      response.dept_name = profileData?.dept_name || "Unknown";
    }

    res.json(response);

  } catch (err) {
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
      redirectTo: process.env.PASSWORD_RESET_REDIRECT || "http://localhost:5174/reset-password",
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

module.exports = {
  supabase,
  register,
  login,
  verifyToken,
  requestPasswordReset,
  updatePassword,
};