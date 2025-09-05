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

    // 🔹 Handle uploaded file (if using multer)
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

    // 🔹 Insert issue into Supabase
    const { data: issue, error } = await supabase
      .from("issues")
      .insert([
        {
          issue_title,
          issue_description,
          created_by,
          department: department || null, // leave null if not provided
          image_url: imageUrl,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // 🔹 Auto-classify ONLY if department was not given
    if (!department && issue.image_url) {
      try {
        const fastApiRes = await axios.post("http://127.0.0.1:8000/predict_url", {
          image_url: issue.image_url,
        });

        if (fastApiRes.data && fastApiRes.data.predicted_class) {
          const predictedDept = fastApiRes.data.predicted_class;

          const { error: updateError } = await supabase
            .from("issues")
            .update({ department: predictedDept })
            .eq("issue_id", issue.issue_id);

          if (!updateError) {
            issue.department = predictedDept; // update response object
          }
        }
      } catch (clsErr) {
        console.error("Auto classification failed:", clsErr.message);
      }
    }

    res.status(201).json({
      message: "✅ Issue created successfully",
      issue,
    });
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
  createIssue,
  getDeptIssues,
  updateIssueStatus,
  classifyReport,
};