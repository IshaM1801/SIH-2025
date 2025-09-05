const supabase = require('../supabase');
const axios = require("axios"); // ✅ for API call
//
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

const createIssue = async (req, res) => {
  const { issue_title, issue_description, department } = req.body;

  if (!issue_title || !issue_description) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const user = req.user; // Comes from authMiddleware
    const created_by = user.id;

    // Handle uploaded file (optional, if using multer)
    let imageUrl = null;
    if (req.file) {
      const file = req.file;
      const fileExt = file.originalname.split(".").pop();
      const fileName = `issues/${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
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

    // Get client IP
    let clientIp =
      req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;

    // Fallback if localhost
    if (clientIp === "::1" || clientIp === "127.0.0.1") {
      clientIp = "8.8.8.8"; // Example fallback IP
    }

    // Call Ambee Geolocation API
    const ambeeApiKey = "17a5ef9024968d4934217a74dc987394313f247569767fd3570ab8349162f96e";
    const geoUrl = `https://api.ambeedata.com/geo/ip/${clientIp}`;

    let latitude = null;
    let longitude = null;

    try {
      const geoResponse = await axios.get(geoUrl, {
        headers: { "x-api-key": ambeeApiKey },
      });
      latitude = geoResponse.data?.data?.latitude || null;
      longitude = geoResponse.data?.data?.longitude || null;
    } catch (geoErr) {
      console.warn("Ambee geolocation API failed:", geoErr.message);
    }

    // Insert issue into Supabase
    const { data, error } = await supabase
      .from("issues")
      .insert([
        {
          issue_title,
          issue_description,
          created_by,
          department: department || null,
          image_url: imageUrl,
          location:
            latitude && longitude
              ? `SRID=4326;POINT(${longitude} ${latitude})`
              : null,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: "Issue created successfully", issue: data });
  } catch (err) {
    console.error("createIssue error:", err);
    res.status(500).json({ error: err.message });
  }
};


//  Fetch issues only of the logged-in user's department
const getDeptIssues = async (req, res) => {
  try {
    console.log("Decoded JWT:", req.user);

    const employeeEmail = req.user.email;

    // Get department of employee
    const { data: employee, error: empError } = await supabase
      .from("employee_registry")
      .select("dept_name")
      .eq("emp_email", employeeEmail)
      .single();

    if (empError || !employee) {
      return res.status(403).json({ error: "Department not found for employee" });
    }

    // Fetch issues for that department
    const { data: issues, error: issueError } = await supabase
      .from("issues")
      .select("*") // include status, image_url, etc.
      .eq("department", employee.dept_name);

    if (issueError) throw issueError;

    // Optional: map to add extra info if needed (e.g., location lat/lon)
    const issuesWithLocation = issues.map(issue => {
      const loc = issue.location?.coordinates;
      return {
        ...issue,
        latitude: loc ? loc[1] : null,
        longitude: loc ? loc[0] : null,
      };
    });

    res.json({ issues: issuesWithLocation });
  } catch (err) {
    console.error("getDeptIssues error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Add this function to issuesController.js
const updateIssueStatus = async (req, res) => {
  const { issueId } = req.params;
  const { status } = req.body;

  if (!status) return res.status(400).json({ error: 'Status is required' });

  try {
    const { data, error } = await supabase
      .from('issues')
      .update({ status })
      .eq('issue_id', issueId)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Status updated successfully', issue: data });
  } catch (err) {
    console.error('updateIssueStatus error:', err);
    res.status(500).json({ error: err.message });
  }
};



module.exports = {
  getAllIssues,
  getUserIssues,
  createIssue,
  getDeptIssues,
  updateIssueStatus,
};