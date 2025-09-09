const jwt = require("jsonwebtoken");
const { supabase } = require("../controllers/authController");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer "))
      return res.status(401).json({ error: "No token provided" });

    const token = authHeader.split(" ")[1];

    // 1️⃣ Try verifying as employee token first
    try {
      const decoded = jwt.verify(token, process.env.EMPLOYEE_JWT_SECRET);
      req.user = {
        email: decoded.email,
        role: decoded.role,
        isEmployee: true,
      };
      return next();
    } catch (_) {
      // Not an employee token, try Supabase token
    }
//.
    // 2️⃣ Verify Supabase user token
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) return res.status(401).json({ error: "Invalid or expired token" });

    req.user = {
      email: user.email,
      id: user.id,
      role: "user",
      isEmployee: false,
    };

    next();

  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = authMiddleware;