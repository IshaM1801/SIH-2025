const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes"); // if exists

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("server hi"));
app.post("/auth/finalize-verification", async (req, res) => {
    const { access_token, name, phone } = req.body;
    if (!access_token) return res.status(400).json({ error: "Missing token" });
  
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser(access_token);
      if (userError) return res.status(400).json({ error: "Invalid or expired token" });
  
      const userId = userData.user.id;
      const email = userData.user.email;
  
      // Insert profile now that email is verified
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .insert([{ auth_id: userId, name, email, phone }])
        .maybeSingle();
  
      if (profileError) return res.status(400).json({ error: profileError.message });
  
      res.json({ message: "✅ Email verified and profile created successfully!" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error during email verification" });
    }
  });
app.use("/auth", authRoutes);
app.use("/user", userRoutes);

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));