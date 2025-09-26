const express = require("express");
const router = express.Router();
const { supabase } = require("../controllers/authController"); // Assuming db connection is managed here or import your db pool
const authMiddleware = require("../middleware/authMiddleware");

/**
 * @route   GET /api/announcements
 * @desc    Get all active announcements (for citizens and employees)
 * @access  Private (requires any logged-in user)
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    // This query is tailored to your 'employee_registry' schema
    const { data, error } = await supabase
      .from("announcements")
      .select(
        `
        announcement_id,
        title,
        content,
        created_at,
        employee_registry (
          name,
          dept_name
        )
      `
      )
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Restructure the data to be flat and match the frontend's expectations
    const formattedData = data.map((ann) => ({
      announcement_id: ann.announcement_id,
      title: ann.title,
      content: ann.content,
      created_at: ann.created_at,
      manager_name: ann.employee_registry.name,
      department_name: ann.employee_registry.dept_name,
    }));

    res.json(formattedData);
  } catch (err) {
    console.error("Error fetching announcements:", err.message);
    res.status(500).send("Server Error");
  }
});

/**
 * @route   POST /api/announcements
 * @desc    Create a new announcement
 * @access  Private (manager only)
 */
router.post("/", authMiddleware, async (req, res) => {
  const { title, content } = req.body;
  // Your authMiddleware provides the manager's email
  const managerEmail = req.user.email;

  if (!title || !content) {
    return res.status(400).json({ msg: "Please provide a title and content." });
  }

  try {
    // 1. Get the manager's integer 'emp_id' from their email
    const { data: managerData, error: managerError } = await supabase
      .from("employee_registry")
      .select("emp_id")
      .eq("emp_email", managerEmail)
      .single();

    if (managerError || !managerData) {
      throw new Error("Manager profile not found for the given token.");
    }

    const managerId = managerData.emp_id;

    // 2. Insert the announcement with the correct integer manager_id
    const { data: newAnnouncement, error: insertError } = await supabase
      .from("announcements")
      .insert({ title, content, manager_id: managerId })
      .select()
      .single();

    if (insertError) throw insertError;

    res.status(201).json(newAnnouncement);
  } catch (err) {
    console.error("Error creating announcement:", err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
