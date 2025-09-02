// backend/controllers/authController.js
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ------------------ REGISTER USER/EMPLOYEE ------------------
const register = async (req, res) => {
  const { email, password, role, emp_id, emp_password, name, emp_dept } = req.body;

  try {
    // Use emp_password for employees
    const finalPassword = role === "employee" ? emp_password : password;

    // 1️⃣ Create Supabase Auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: finalPassword,
      options: {
        emailRedirectTo: process.env.EMAIL_REDIRECT_URL || "http://localhost:3000/verify",
      },
    });
    if (authError) return res.status(400).json({ error: authError.message });

    // 2️⃣ Insert into employee_registry if role is employee
    if (role === "employee") {
      const { data: empData, error: empError } = await supabase
        .from("employee_registry")
        .insert([{ emp_id, dept_name: emp_dept, emp_password }]);
      if (empError) return res.status(400).json({ error: empError.message });
    }

    // 3️⃣ Insert into profiles table
    const { data: profileData, error: profileError } = await supabase.from("profiles").insert([
      {
        auth_id: authData.user.id,
        name,
        role,
        emp_id: role === "employee" ? emp_id : null,
        emp_dept: role === "employee" ? emp_dept : null,
      },
    ]);
    if (profileError) return res.status(400).json({ error: profileError.message });

    res.json({
      message: "Registration successful! Please check your email.",
      user: authData.user,
      profile: profileData[0],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------ LOGIN ------------------
const login = async (req, res) => {
  const { emp_id, password } = req.body;

  try {
    // 1️⃣ Check employee_registry table first
    const { data: employeeData, error: empError } = await supabase
      .from("employee_registry")
      .select("*")
      .eq("emp_id", emp_id)
      .single();

    if (empError && empError.code !== "PGRST116") return res.status(500).json({ error: empError.message });

    if (employeeData) {
      // Plain-text password check
      if (password !== employeeData.emp_password) return res.status(401).json({ error: "Invalid credentials" });

      // Get employee profile info
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("emp_id", emp_id)
        .single();

      return res.json({
        message: "Employee login successful",
        employee: {
          emp_id: employeeData.emp_id,
          dept_name: employeeData.dept_name,
          profile: profileData || null,
        },
      });
    }

    // 2️⃣ Fallback to Supabase normal user login
    const { data, error } = await supabase.auth.signInWithPassword({ email: emp_id, password });
    if (error) return res.status(400).json({ error: error.message });

    if (!data.user?.email_confirmed_at)
      return res.status(401).json({ error: "Email not verified. Please confirm your email." });

    res.json({ user: data.user, session: data.session });
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
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: process.env.PASSWORD_RESET_REDIRECT || "http://localhost:3000/reset-password",
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