// index.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { supabase } = require("./controllers/authController");

// --- Route imports ---
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const issueRoutes = require("./routes/issues");
const certificatesRoutes = require("./routes/certificates");
const employeeRoutes = require("./routes/employee");
const aiRoutes = require("./routes/aiAllManagerIssues");
const commentRoutes = require("./routes/commentRoutes");

const app = express();
const PORT = process.env.PORT || 5001;

// --- CORS setup (only once) ---
app.use(
  cors({
    origin: function (origin, callback) {
      // ✅ Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      const allowedOrigins = [
        "http://localhost:5173",                // ✅ Local development
        "http://127.0.0.1:5173",              // ✅ Alternative localhost
        "https://fixmycity-opal.vercel.app",   // ✅ Your Vercel deployment
      ];
      
      // ✅ Check exact matches
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // ✅ Allow any Vercel subdomain
      if (origin.includes('.vercel.app')) {
        return callback(null, true);
      }
      
      console.log(`🌐 CORS request from: ${origin}`);
      console.warn(`❌ CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    },
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 200, // For legacy browser support
  })
);

// --- Body parsing middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Trust proxy for real IP ---
app.set("trust proxy", true);

// --- Test route ---
app.get("/", (req, res) => res.send("🚀 Server is running!"));

// --- Email verification route ---
app.post("/auth/finalize-verification", async (req, res) => {
  const { access_token, name, phone } = req.body;
  if (!access_token) return res.status(400).json({ error: "Missing token" });

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser(
      access_token
    );
    if (userError)
      return res.status(400).json({ error: "Invalid or expired token" });

    const userId = userData.user.id;
    const email = userData.user.email;

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .insert([{ auth_id: userId, name, email, phone }])
      .maybeSingle();

    if (profileError)
      return res.status(400).json({ error: profileError.message });

    res.json({
      message: "✅ Email verified and profile created successfully!",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error during email verification" });
  }
});

// --- Mount routes ---
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/issues", issueRoutes);
app.use("/certificates", certificatesRoutes);
app.use("/employee", employeeRoutes);
app.use("/ai", aiRoutes); // ✅ /ai/all-manager-issues
app.use("/comments", commentRoutes);

// --- Start server ---
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);