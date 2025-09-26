// index.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const http = require("http"); // ✅ 1. Import http module
const { Server } = require("socket.io"); // ✅ 2. Import Server from socket.io

const { supabase } = require("./controllers/authController");

// --- Route imports ---
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const issueRoutes = require("./routes/issues");
const certificatesRoutes = require("./routes/certificates");
const employeeRoutes = require("./routes/employee");
const aiRoutes = require("./routes/aiAllManagerIssues");
const commentRoutes = require("./routes/commentRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const sosRoutes = require("./routes/sosRoutes"); // ✅ 3. Import the new SOS routes

const app = express();
const server = http.createServer(app); // ✅ 4. Create an HTTP server from the Express app

// ✅ 5. Initialize Socket.IO and configure CORS
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "https://fixmycity-opal.vercel.app",
    ],
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 5001;

// --- CORS setup (no changes) ---
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      const allowedOrigins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://fixmycity-opal.vercel.app",
      ];
      if (allowedOrigins.includes(origin) || origin.includes(".vercel.app")) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// --- Body parsing middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Trust proxy for real IP ---
app.set("trust proxy", true);

// ✅ 6. Make the 'io' instance available to all routes
app.set("socketio", io);

// ✅ 7. Set up a listener for new real-time connections
io.on("connection", (socket) => {
  console.log("✅ Real-time client connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("❌ Real-time client disconnected:", socket.id);
  });
});

// --- Test route ---
app.get("/", (req, res) => res.send("🚀 Server is running!"));

// --- Email verification route (no changes) ---
app.post("/auth/finalize-verification", async (req, res) => {
  const { access_token, name, phone } = req.body;
  if (!access_token) return res.status(400).json({ error: "Missing token" });
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(access_token);
    if (userError)
      return res.status(400).json({ error: "Invalid or expired token" });

    const { error: profileError } = await supabase
      .from("profiles")
      .insert([{ auth_id: user.id, name, email: user.email, phone }])
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
app.use("/ai", aiRoutes);
app.use("/comments", commentRoutes);
app.use("/announcements", announcementRoutes);
app.use("/sos", sosRoutes); // ✅ 8. Mount the new SOS routes

// --- Start server ---
// ✅ 9. Use 'server.listen' instead of 'app.listen' to enable real-time features
server.listen(PORT, () =>
  console.log(
    `🚀 Server with real-time support running on http://localhost:${PORT}`
  )
);
