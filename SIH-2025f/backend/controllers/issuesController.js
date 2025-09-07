const supabase = require("../supabase");
const axios = require("axios");
const { sendWhatsAppMessage } = require("../services/whatsappService");


 const fetchAddress = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: "Latitude and longitude are required" });
    }

    const openCageKey = "ceefcaa44fd14d259322d6c1000b06c3";
    const geoCodeRes = await axios.get(
      `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${openCageKey}&no_annotations=1`
    );

    let formattedAddress = "Address not found";
    if (geoCodeRes.data?.results?.length > 0) {
      const c = geoCodeRes.data.results[0].components;
      formattedAddress = `${c.suburb || c.neighbourhood || c.village || ""}, ${c.city || c.town || c.village || ""}, ${c.state || ""}`;
    }

    res.json({ address: formattedAddress });
  } catch (err) {
    console.error("Error in fetchAddress:", err.message);
    res.status(500).json({ error: "Failed to fetch address" });
  }
};
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
        clientIp = "8.8.8.8";
      }

      const apiKey = process.env.IPGEO_API_KEY;
      const geoResponse = await axios.get(
        `https://api.ipgeolocation.io/v2/ipgeo?apiKey=${apiKey}&ip=${clientIp}&fields=geo,latitude,longitude`
      );

      lat = geoResponse.data?.latitude;
      lng = geoResponse.data?.longitude;
    }

    // Reverse geocode with OpenCage
    

    // 2️⃣ Handle image upload
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

    // 3️⃣ Insert issue into Supabase
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
const getDeptIssues = async (req, res) => {
  try {
    const employeeEmail = req.user.email;

    // Get logged-in employee's team
    const { data: employee, error: empError } = await supabase
      .from("employee_registry")
      .select("team_name")
      .eq("emp_email", employeeEmail)
      .single();

    if (empError || !employee || !employee.team_name) {
      return res.status(403).json({ error: "Employee not found or team not set" });
    }

    // Call the Postgres function
    const { data: issues, error } = await supabase
      .rpc("get_issues_within_team_radius", { p_team_name: employee.team_name });

    if (error) throw error;

    res.json({ issues });
  } catch (err) {
    console.error("getDeptIssues error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Add this function to issuesController.js
const updateIssueStatus = async (req, res) => {
  const { issueId } = req.params;
  const { status } = req.body;

  if (!status) return res.status(400).json({ error: "Status is required" });

  try {
    console.log("➡️ Updating issue:", issueId, "with status:", status);

    // 1️⃣ Update issue status
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

    // 2️⃣ Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("name, phone")
      .eq("auth_id", data.created_by)
      .single();

    if (profileError) {
      console.warn("⚠️ Profile fetch failed:", profileError.message);
    }
    console.log("👤 Profile fetched:", profile);

    // 3️⃣ Send WhatsApp
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

    // 2. Send image_url to FastAPI
    const fastApiRes = await axios.post("http://127.0.0.1:8000/predict_url", {
      image_url: report.image_url,
    });

    if (!fastApiRes.data || !fastApiRes.data.predicted_class) {
      return res.status(500).json({ error: "FastAPI did not return a prediction" });
    }

    const predictedDept = fastApiRes.data.predicted_class;

    // 3. Update Supabase issues table
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
      fastApiResponse: fastApiRes.data,
    });
  } catch (err) {
    console.error("Classification error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getAllIssues,
  getUserIssues,
  getDeptIssues,
  updateIssueStatus,
  classifyReport,
  createIssueWithLocation,
  fetchAddress,
};