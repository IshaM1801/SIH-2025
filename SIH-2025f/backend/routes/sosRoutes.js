// routes/sosRoutes.js

const express = require("express");
const router = express.Router();
const { supabase } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

/**
 * @route   POST /sos/trigger
 * @desc    A user triggers an SOS alert
 * @access  Private (Citizen users)
 */
router.post("/trigger", authMiddleware, async (req, res) => {
  const { latitude, longitude } = req.body;
  const userId = req.user.id;

  if (!latitude || !longitude) {
    return res.status(400).json({ error: "Geolocation is required." });
  }

  try {
    // Step 1: Insert the alert and select ALL columns from the new row
    const { data: newAlert, error: insertError } = await supabase
      .from("sos_alerts")
      .insert({
        user_id: userId,
        location: `POINT(${longitude} ${latitude})`,
      })
      .select("*") // ✅ FIX: Changed .select() to .select('*') to get all columns
      .single();

    if (insertError) throw insertError;

    // Step 2: Fetch the user's profile
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("name, phone")
      .eq("auth_id", userId)
      .single();

    if (profileError) {
      console.warn(
        `Could not fetch profile for user ${userId}:`,
        profileError.message
      );
    }

    // Step 3: Combine into a full payload
    const fullAlertPayload = {
      ...newAlert,
      profile: profileData || { name: "Unknown", phone: "N/A" },
    };

    // Step 4: Emit the complete payload
    const io = req.app.get("socketio");
    io.emit("new-sos-alert", fullAlertPayload);

    res
      .status(201)
      .json({
        message: "SOS alert sent successfully.",
        alert: fullAlertPayload,
      });
  } catch (err) {
    console.error("SOS Trigger Error:", err.message);
    res.status(500).json({ error: "Failed to send SOS alert." });
  }
});

/**
 * @route   GET /sos/active
 * @desc    Get all active SOS alerts for managers on page load
 * @access  Private
 */
router.get("/active", authMiddleware, async (req, res) => {
  try {
    // ✅ FIX: Corrected the Supabase join syntax.
    // This now correctly fetches all sos_alerts columns (*) and the related name and phone from the profiles table.
    const { data, error } = await supabase
      .from("sos_alerts")
      .select(
        `
                *,
                profiles ( name, phone )
            `
      )
      .eq("status", "Active")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Supabase returns the joined table as a nested object (e.g., 'profiles').
    // We'll rename it to 'profile' to match the frontend's expectation.
    const formattedData = data.map((alert) => ({
      ...alert,
      profile: alert.profiles, // Rename 'profiles' to 'profile'
    }));

    res.json(formattedData);
  } catch (err) {
    console.error("Fetch Active SOS Error:", err.message);
    res.status(500).json({ error: "Failed to fetch active alerts." });
  }
});

module.exports = router;
