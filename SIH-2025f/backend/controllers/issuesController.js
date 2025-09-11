const supabase = require("../supabase");
const axios = require("axios");
const { sendWhatsAppMessage } = require("../services/whatsappService");


const createIssueWithLocation = async (req, res) => {
  try {
    const { issue_title, issue_description, department, latitude, longitude } = req.body;
    const user = req.user;
    const created_by = user.id;

    if (!issue_title || !issue_description) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 1️⃣ Handle coordinates
    let lat = latitude;
    let lng = longitude;

    if (!lat || !lng) {
      let clientIp = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket?.remoteAddress;

      if (!clientIp || clientIp === "::1" || clientIp === "127.0.0.1") {
        clientIp = "8.8.8.8"; // fallback to Google DNS for testing
      }

      const apiKey = process.env.IPGEO_API_KEY;
      const geoResponse = await axios.get(
        `https://api.ipgeolocation.io/v2/ipgeo?apiKey=${apiKey}&ip=${clientIp}&fields=geo,latitude,longitude`
      );

      lat = geoResponse.data?.latitude;
      lng = geoResponse.data?.longitude;
    }

    // 2️⃣ Reverse geocode with OpenCage
    let formattedAddress = "Address not found";
    try {
      const openCageKey = process.env.OPENCAGE_KEY || "ceefcaa44fd14d259322d6c1000b06c3";
      const geoCodeRes = await axios.get(
        `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${openCageKey}&no_annotations=1`
      );

      if (geoCodeRes.data?.results?.length > 0) {
        const c = geoCodeRes.data.results[0].components;
        formattedAddress = `${c.suburb || c.neighbourhood || c.village || ""}, ${c.city || c.town || c.village || ""}, ${c.state || ""}`;
      }
    } catch (geoErr) {
      console.warn("⚠️ Reverse geocode failed:", geoErr.message);
    }

    // 3️⃣ Handle image upload
    let imageUrl = null;
    if (req.file) {
      const file = req.file;
      const fileExt = file.originalname.split(".").pop();
      const fileName = `issues/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("issue-photos")
        .upload(fileName, file.buffer, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.mimetype,
        });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from("issue-photos")
        .getPublicUrl(fileName);

      imageUrl = publicData.publicUrl;
    }

    // 4️⃣ Insert issue into Supabase
    const { data, error } = await supabase
      .from("issues")
      .insert([
        {
          issue_title,
          issue_description,
          created_by,
          department: department || null,
          image_url: imageUrl,
          latitude: lat,
          longitude: lng,
          address_component: formattedAddress,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      message: "Issue created successfully",
      issue: data,
      location: { latitude: lat, longitude: lng, address_component: formattedAddress },
    });
  } catch (err) {
    console.error("createIssueWithLocation error:", err);
    res.status(500).json({ error: err.message });
  }
};


// 1️⃣ Fetch all issues
const getAllIssues = async (req, res) => {
  try {
    let { data: issues, error } = await supabase.from('issues').select('*');
    if (error) throw error;

    // Convert PostGIS location to lat/lon
    issues = issues.map(issue => {
      const loc = issue.location?.coordinates;
      return {
        ...issue,
        latitude: loc ? loc[1] : null,
        longitude: loc ? loc[0] : null,
      };
    });//..

    res.json({ issues });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2️⃣ Fetch issues of logged-in user
const getUserIssues = async (req, res) => {
  const userId = req.params.userId; // pass userId from frontend
  try {
    let { data: issues, error } = await supabase
      .from('issues')
      .select('*')
      .eq('created_by', userId);

    if (error) throw error;

    issues = issues.map(issue => {
      const loc = issue.location?.coordinates;
      return {
        ...issue,
        latitude: loc ? loc[1] : null,
        longitude: loc ? loc[0] : null,
      };
    });

    res.json({ issues });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const { createClient } = require("@supabase/supabase-js");

//  Fetch issues only of the logged-in user's department
// Fetch issues only of the logged-in user's department
// Modified getDeptIssues
const getDeptIssues = async (req, res) => {
  try {
    const employeeEmail = req.user.email;
    const { issue_id } = req.params; // <-- from URL param
    const { manager_email } = req.query; // <-- optional query

    // Fetch logged-in employee
    const { data: employee, error: empError } = await supabase
      .from("employee_registry")
      .select("emp_id, emp_email, dept_name, team_name, position, name")
      .eq("emp_email", employeeEmail)
      .single();

    if (empError || !employee) return res.status(403).json({ error: "Employee not found" });

    // ---------------- SINGLE ISSUE FETCH ----------------
    if (issue_id) {
      const { data: issue, error: singleIssueError } = await supabase
        .from("issues")
        .select("*")
        .eq("issue_id", issue_id)
        .single();

      if (singleIssueError || !issue) return res.status(404).json({ error: "Issue not found" });
      return res.json({ issue });
    }

    // ---------------- EMPLOYEE ----------------
    if (employee.position === 0) {
      // Fetch all issues assigned to this employee from employee_issues_map
      const { data: assignments, error: assignError } = await supabase
        .from("employee_issue_map")
        .select("issue_id")
        .eq("emp_id", employee.emp_id);

      if (assignError) return res.status(500).json({ error: assignError.message });

      const issueIds = assignments.map(a => a.issue_id);
      if (issueIds.length === 0) return res.json({ employee: employee.emp_email, issues: [] });

      const { data: issues, error: issuesError } = await supabase
        .from("issues")
        .select("*")
        .in("issue_id", issueIds);

      if (issuesError) return res.status(500).json({ error: issuesError.message });

      return res.json({ employee: employee.emp_email, issues });
    }

    // ---------------- MANAGER ----------------
    if (employee.position === 1) {
      if (!employee.team_name) return res.status(403).json({ error: "Team not set" });

      const { data: teamMembers } = await supabase
        .from("employee_registry")
        .select("emp_id, emp_email, name, issue_id")
        .eq("team_name", employee.team_name)
        .eq("position", 0);

      const { data: issues } = await supabase.rpc("get_issues_within_team_radius", {
        p_team_name: employee.team_name,
      });

      const teamWithIssues = teamMembers.map((member) => {
        const ids = member.issue_id ? member.issue_id.split(",").map(id => id.trim()) : [];
        const memberIssues = issues.filter((i) => ids.includes(i.issue_id));
        return { ...member, issues: memberIssues };
      });

      const allAssignedIds = teamMembers
        .map((m) => (m.issue_id ? m.issue_id.split(",").map(id => id.trim()) : []))
        .flat();

      const unassigned = issues.filter((i) => !allAssignedIds.includes(i.issue_id));
      if (unassigned.length > 0) teamWithIssues.push({ emp_name: "Unassigned", emp_email: "unassigned", issues: unassigned });

      return res.json({ manager: employee.emp_email, team: teamWithIssues });
    }

    // ---------------- HOD ----------------
    if (employee.position === 2) {
      // Fetch manager issues if query param given
      if (manager_email) {
        const { data: manager } = await supabase
          .from("employee_registry")
          .select("team_name")
          .eq("emp_email", manager_email)
          .eq("dept_name", employee.dept_name)
          .eq("position", 1)
          .single();

        const { data: issues } = await supabase.rpc("get_issues_within_team_radius", {
          p_team_name: manager.team_name,
        });

        return res.json({ manager: manager_email, issues });
      }

      // Else, HOD fetching all managers in dept
      const { data: managers } = await supabase
        .from("employee_registry")
        .select("emp_id, emp_email, team_name")
        .eq("dept_name", employee.dept_name)
        .eq("position", 1);

      return res.json({ hod: employee.emp_email, managers });
    }

    res.status(403).json({ error: "Access denied" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
// Add this function to issuesController.js
const updateIssueStatus = async (req, res) => {
  const { issueId } = req.params;
  const { status } = req.body;

  if (!status) return res.status(400).json({ error: "Status is required" });

  try {
    // 0️⃣ Get user info from request (assuming you have a middleware that sets req.user)
    const user = req.user; // { emp_email, position, ... }
    console.log("➡️ User trying to update status:", user);

    // 1️⃣ Permission check: position 0 = regular employee
    if (user.position === 0) {
      return res.status(403).json({ error: "You are not allowed to update issue status" });
    }

    console.log("➡️ Updating issue:", issueId, "with status:", status);

    // 2️⃣ Update issue status in Supabase
    const { data, error } = await supabase
      .from("issues")
      .update({ status })
      .eq("issue_id", issueId)
      .select("issue_id, issue_title, created_by")
      .single();

    if (error) {
      console.error("❌ Supabase update error:", error);
      throw error;
    }
    console.log("✅ Updated issue:", data);

    // 3️⃣ Fetch user profile to send WhatsApp
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("name, phone")
      .eq("auth_id", data.created_by)
      .single();

    if (profileError) {
      console.warn("⚠️ Profile fetch failed:", profileError.message);
    }
    console.log("👤 Profile fetched:", profile);

    // 4️⃣ Send WhatsApp notification if phone exists
    if (profile?.phone) {
      const msg = `Hello ${profile.name},\n\nYour issue *${data.issue_title}* is now marked as *${status}*.\nCheck the app for details.`;
      console.log("📲 Sending WhatsApp to:", profile.phone, "message:", msg);

      await sendWhatsAppMessage(profile.phone, msg);
    }

    res.json({
      message: "Status updated & WhatsApp sent successfully",
      issue: data,
    });
  } catch (err) {
    console.error("🔥 updateIssueStatus error:", err);
    res.status(500).json({ error: err.message });
  }
};


const classifyReport = async (req, res) => {
  try {
    const { reportId } = req.body;

    // 1. Fetch report from Supabase
    const { data: report, error } = await supabase
      .from("issues")
      .select("issue_id, image_url")
      .eq("issue_id", reportId)
      .single();

    if (error || !report) {
      return res.status(404).json({ error: "Report not found" });
    }

    console.log("🔍 Report fetched:", report);

    // 2. Download image from Supabase public URL
    const imgRes = await fetch(report.image_url);
    if (!imgRes.ok) {
      throw new Error(`Failed to fetch image: ${imgRes.status}`);
    }
    const imgBuffer = await imgRes.arrayBuffer();
    const base64Image = Buffer.from(imgBuffer).toString("base64");

    // Detect mime type from extension
    const mimeType = report.image_url.endsWith(".png")
      ? "image/png"
      : report.image_url.endsWith(".jpg") || report.image_url.endsWith(".jpeg")
      ? "image/jpeg"
      : "image/webp";

    // 3. Call Gemini Vision API
    let geminiRes;
    try {
      geminiRes = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `Classify the civic issue shown in the image into:
      1. **Department** (Water, Roads, Electricity, Waste, Other)
      2. **Priority** (Low, Medium, High)
      
      Return the result in strict JSON format like:
      {
        "department": "<DEPARTMENT>",
        "priority": "<PRIORITY>"
      }`
                },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Image,
                  }
                }
              ]
            }
          ]
        }
      );
    } catch (err) {
      console.error("❌ Gemini error:", err.response?.data || err.message);
      return res.status(500).json({
        error: "Gemini classification failed",
        details: err.response?.data || err.message,
      });
    }

    console.log("✅ Gemini response:", geminiRes.data);

    const predictedDept =
      geminiRes.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "Unclassified";

    // 4. Update Supabase issues table
    const { error: updateError } = await supabase
      .from("issues")
      .update({ department: predictedDept })
      .eq("issue_id", reportId);

    if (updateError) {
      return res.status(500).json({ error: "Failed to update department in Supabase" });
    }

    res.json({
      success: true,
      reportId,
      department: predictedDept,
      geminiResponse: geminiRes.data,
    });
  } catch (err) {
    console.error("Classification error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { classifyReport };
// Assign an issue to an employee
const assignIssueToEmployee = async (req, res) => {
  try {
    const { issueId, emp_emails } = req.body;

    if (!issueId || !emp_emails) {
      return res.status(400).json({ error: "issueId and emp_emails are required" });
    }

    // Normalize to array
    const emails = Array.isArray(emp_emails) ? emp_emails : [emp_emails];

    // 1️⃣ Fetch employees by email
    const { data: employees, error: empError } = await supabase
      .from("employee_registry")
      .select("emp_id, emp_email, position")
      .in("emp_email", emails);

    if (empError) {
      return res.status(500).json({ error: empError.message });
    }

    if (!employees || employees.length === 0) {
      return res.status(404).json({ error: "No employees found" });
    }

    // 2️⃣ (Optional) filter by position
    const assignable = employees.filter(e => e.position === 0);

    if (assignable.length === 0) {
      return res.status(403).json({ error: "No assignable employees (position != 0)" });
    }

    // 3️⃣ Prepare rows for bulk insert
    const rowsToInsert = assignable.map(e => ({
      emp_id: e.emp_id,
      issue_id: issueId,
    }));

    // 4️⃣ Bulk insert (⚠️ no `.single()`)
    const { data: mappings, error: mapError } = await supabase
      .from("employee_issue_map")
      .insert(rowsToInsert)
      .select("*"); // 👈 keep it as array

    if (mapError) {
      return res.status(500).json({ error: mapError.message });
    }

    res.json({
      message: "Issue assigned to employees successfully",
      mappings, // will be an array of inserted rows
    });
  } catch (err) {
    console.error("assignIssueToEmployee error:", err);
    res.status(500).json({ error: err.message });
  }
};
// ✅ Remove assignment function
const removeIssueAssignment = async (req, res) => {
  try {
    const { issueId } = req.body; // issueId comes from frontend

    if (!issueId) {
      return res.status(400).json({ error: "issueId is required" });
    }

    // 1️⃣ Delete all mappings for this issueId
    const { error: deleteError } = await supabase
      .from("employee_issue_map")
      .delete()
      .eq("issue_id", issueId);

    if (deleteError) {
      return res.status(500).json({ error: deleteError.message });
    }

    res.json({
      message: `All assignments for issue ${issueId} removed successfully`,
    });
  } catch (err) {
    console.error("removeIssueAssignment error:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllIssues,
  getUserIssues,
  assignIssueToEmployee,
  removeIssueAssignment, // 👈 make sure name matches router
  classifyReport,
  getDeptIssues,
  updateIssueStatus,
 
  createIssueWithLocation,
};