// middleware/authMiddleware.js
const { supabase } = require("../controllers/authController"); // ✅ FIXED

const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1]; // after "Bearer"

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  req.user = data.user; // ✅ attach user
  next();
};

module.exports = authenticateUser;