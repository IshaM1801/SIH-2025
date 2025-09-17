const supabase = require("../supabase");
const axios = require("axios");
const { sendWhatsAppMessage } = require("../services/whatsappService");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const fetch = require("node-fetch");

// ✅ Create a shared reverse geocoding function
const reverseGeocode = async (latitude, longitude) => {
  try {
    const openCageKey = process.env.OPENCAGE_KEY;
    const geoCodeRes = await axios.get(
      `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${openCageKey}&no_annotations=1`
    );

    if (geoCodeRes.data?.results?.length > 0) {
      const c = geoCodeRes.data.results[0].components;
      return [
        c.suburb || c.neighbourhood || c.village,
        c.city || c.town || c.village,
        c.state,
        c.country,
      ]
        .filter(Boolean)
        .join(", ");
    }
    return "Unknown location";
  } catch (geoErr) {
    console.warn("⚠️ Reverse geocode failed:", geoErr.message);
    return "Unknown location";
  }
};

//function to convert image URL to base64 to pass gemini
async function urlToGenerativePart(url) {
  try {
    const response = await axios.get(url, {
      responseType: "arraybuffer",
    });

    // Convert the image data to a base64 string
    const base64Data = Buffer.from(response.data, "binary").toString("base64");

    // Get the mime type from the response headers
    const mimeType = response.headers["content-type"];

    if (!mimeType || !base64Data) {
      throw new Error("Could not fetch or process image from URL.");
    }

    return {
      inlineData: {
        data: base64Data,
        mimeType: mimeType,
      },
    };
  } catch (error) {
    console.error(`Error fetching image from ${url}:`, error.message);
    // Re-throw the error to be caught by the main controller's catch block
    throw new Error(`Failed to process image from URL: ${url}`);
  }
}

const createIssueWithLocation = async (req, res) => {
  try {
    const { issue_title, issue_description, department, latitude, longitude } =
      req.body;
    const user = req.user;
    const created_by = user.id;

    if (!issue_title || !issue_description) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 1️⃣ Handle coordinates
    let lat = latitude ? Number(latitude) : null;
    let lng = longitude ? Number(longitude) : null;

    if (!lat || !lng) {
      let clientIp =
        req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.socket?.remoteAddress;

      if (!clientIp || clientIp === "::1" || clientIp === "127.0.0.1") {
        clientIp = "8.8.8.8"; // fallback for localhost/dev
      }

      try {
        const apiKey = process.env.IPGEO_API_KEY;
        const geoResponse = await axios.get(
          `https://api.ipgeolocation.io/v2/ipgeo?apiKey=${apiKey}&ip=${clientIp}&fields=geo,latitude,longitude`
        );
        lat = Number(geoResponse.data?.latitude) || null;
        lng = Number(geoResponse.data?.longitude) || null;
      } catch (ipErr) {
        console.warn("⚠️ IP-based geolocation failed:", ipErr.message);
      }
    }

    // 2️⃣ Reverse geocode with OpenCage
    let formattedAddress = "Unknown location";
    if (lat && lng) {
      try {
        const openCageKey = process.env.OPENCAGE_KEY;
        const geoCodeRes = await axios.get(
          `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${openCageKey}&no_annotations=1`
        );

        if (geoCodeRes.data?.results?.length > 0) {
          const c = geoCodeRes.data.results[0].components;
          formattedAddress = [
            c.suburb || c.neighbourhood || c.village,
            c.city || c.town || c.village,
            c.state,
            c.country,
          ]
            .filter(Boolean)
            .join(", ");
        }
      } catch (geoErr) {
        console.warn("⚠️ Reverse geocode failed:", geoErr.message);
      }
    }

    // 3️⃣ Handle image upload
    let imageUrl = null;
    if (req.file) {
      try {
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
      } catch (uploadErr) {
        console.error("⚠️ Image upload failed:", uploadErr.message);
      }
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
      success: true,
      message: "Issue created successfully",
      issue: data,
      location: {
        latitude: lat,
        longitude: lng,
        address: formattedAddress,
      },
    });
  } catch (err) {
    console.error("createIssueWithLocation error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 1️⃣ Fetch all issues
const getAllIssues = async (req, res) => {
  try {
    let { data: issues, error } = await supabase.from("issues").select("*");
    if (error) throw error;

    // If you don’t use PostGIS, just return the existing lat/lon
    issues = issues.map((issue) => ({
      ...issue,
      latitude: issue.latitude,
      longitude: issue.longitude,
    }));

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
      .from("issues")
      .select("*")
      .eq("created_by", userId);

    if (error) throw error;

    issues = issues.map((issue) => {
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
      .select(
        "emp_id, emp_email, dept_name, team_name, position, issue_id, name"
      )
      .eq("emp_email", employeeEmail)
      .single();

    if (empError || !employee)
      return res.status(403).json({ error: "Employee not found" });

    // ---------------- SINGLE ISSUE FETCH ----------------
    if (issue_id) {
      const { data: issue, error: singleIssueError } = await supabase
        .from("issues")
        .select("*")
        .eq("issue_id", issue_id)
        .single();

      if (singleIssueError || !issue)
        return res.status(404).json({ error: "Issue not found" });
      return res.json({ issue });
    }
    if (employee.position === 0) {
      // 1️⃣ Get issue IDs assigned to this employee
      const { data: mappings, error: mapError } = await supabase
        .from("employee_issue_map")
        .select("issue_id")
        .eq("emp_id", employee.emp_id);

      if (mapError) return res.status(500).json({ error: mapError.message });

      const assignedIssueIds = mappings.map((m) => m.issue_id);

      if (assignedIssueIds.length === 0) {
        return res.json({
          employee: employee.emp_email,
          issues: [],
        });
      }

      // 2️⃣ Fetch issue details
      const { data: issues, error: issueError } = await supabase
        .from("issues")
        .select("*")
        .in("issue_id", assignedIssueIds);

      if (issueError)
        return res.status(500).json({ error: issueError.message });

      return res.json({
        employee: employee.emp_email,
        issues,
      });
    }

    // ---------------- MANAGER ----------------
    if (employee.position === 1) {
      if (!employee.team_name)
        return res.status(403).json({ error: "Team not set" });

      // 1️⃣ Fetch team members
      const { data: teamMembers } = await supabase
        .from("employee_registry")
        .select("emp_id, emp_email, name")
        .eq("team_name", employee.team_name)
        .eq("position", 0);

      // 2️⃣ Fetch all issues within radius (using RPC)
      const { data: issues } = await supabase.rpc(
        "get_issues_within_team_radius",
        { p_team_name: employee.team_name }
      );

      // 3️⃣ Fetch employee-issue mapping
      const { data: mappings } = await supabase
        .from("employee_issue_map")
        .select("emp_id, issue_id");

      // 4️⃣ Attach assigned employees to each issue
      const issuesWithAssignments = issues.map((issue) => {
        const assignedEmployees = mappings
          .filter((m) => m.issue_id === issue.issue_id)
          .map((m) => {
            const emp = teamMembers.find((t) => t.emp_id === m.emp_id);
            return emp
              ? { emp_id: emp.emp_id, emp_email: emp.emp_email, name: emp.name }
              : null;
          })
          .filter(Boolean);

        return { ...issue, assigned_to: assignedEmployees };
      });

      // 5️⃣ Separate unassigned and assigned issues
      const teamWithIssues = teamMembers.map((member) => {
        const memberIssues = issuesWithAssignments.filter((i) =>
          i.assigned_to.some((e) => e.emp_id === member.emp_id)
        );
        return { ...member, issues: memberIssues };
      });

      const allAssignedIds = mappings.map((m) => m.issue_id);
      const unassigned = issuesWithAssignments.filter(
        (i) => !allAssignedIds.includes(i.issue_id)
      );

      if (unassigned.length > 0) {
        teamWithIssues.push({
          emp_id: null,
          emp_email: "unassigned",
          name: "Unassigned",
          issues: unassigned,
        });
      }

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

        const { data: issues } = await supabase.rpc(
          "get_issues_within_team_radius",
          {
            p_team_name: manager.team_name,
          }
        );

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

/**
 * @param {string} url The public URL of the image.
 * @returns {Promise<Buffer>} A promise that resolves with the image data as a Buffer.
 */
const fetchImageAsBuffer = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch image. Status: ${response.status} ${response.statusText}`
      );
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error(`Error fetching image from ${url}:`, error.message);
    throw error;
  }
};

const agentUpdateIssue = async (req, res) => {
  console.log("🟢 agentUpdateIssue invoked");
  try {
    // 1. Validate Input
    const { issue_id } = req.params;
    const fixedImageFile = req.file;

    if (!issue_id || !fixedImageFile) {
      return res
        .status(400)
        .json({ error: "Missing issueId or fixedImage file." });
    }
    console.log(`➡️ Received update for issue_id: ${issue_id}`);

    // 2. Upload "Fixed" Image to Supabase Storage
    // **NOTE: Changed bucket to 'issue-resolutions' as per previous discussion.**
    const fileName = `resolved-${issue_id}-${Date.now()}`;
    const { error: uploadError } = await supabase.storage
      .from("issue-resolutions")
      .upload(fileName, fixedImageFile.buffer, {
        contentType: fixedImageFile.mimetype,
      });

    if (uploadError) {
      console.error("❌ Supabase storage upload error:", uploadError.message);
      throw new Error("Failed to upload fixed image.");
    }

    const { data: urlData } = supabase.storage
      .from("issue-resolutions")
      .getPublicUrl(fileName);
    const fixedImageUrl = urlData.publicUrl;
    console.log("✅ 'Fixed' image uploaded:", fixedImageUrl);

    // 3. Fetch Original Issue Details
    const { data: originalIssue, error: fetchError } = await supabase
      .from("issues")
      .select("issue_id, issue_title, issue_description, image_url, created_by")
      .eq("issue_id", issue_id)
      .single();

    if (fetchError || !originalIssue) {
      console.error("❌ Failed to fetch original issue:", fetchError?.message);
      return res.status(404).json({ error: "Original issue not found." });
    }
    console.log("✅ Fetched original issue:", originalIssue.issue_title);

    // 4. AI Verification with Gemini
    console.log("🤖 Downloading images to send to Gemini...");

    const originalImagePart = await urlToGenerativePart(
      originalIssue.image_url
    );
    const fixedImagePart = await urlToGenerativePart(fixedImageUrl);

    console.log("🤖 Preparing prompt with inline image data...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are an AI verification agent for a civic issue platform. Your task is to determine if a reported issue has been resolved based on two images and its description.
              
              Issue Title: "${originalIssue.issue_title}"
              Issue Description: "${originalIssue.issue_description}"

              Analyze the 'Original Problem Image' (first image) and compare it to the 'Submitted Fix Image' (second image). Decide on a new status: 'resolved' or 'in progress' or 'pending'.
              
              Return ONLY a valid JSON object with the keys: "new_status" and "justification" and "post_text" which should be the text of the post to be posted on X.`,
            },
            originalImagePart,
            fixedImagePart,
          ],
        },
      ],
    };

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const aiResponse = JSON.parse(responseText.replace(/```json\n?|```/g, ""));

    console.log("✅ Parsed AI response:", aiResponse);

    // 5. Update Issue Status in the 'issues' table
    const { data: updatedIssue, error: updateError } = await supabase
      .from("issues")
      .update({
        status: aiResponse.new_status,
      })
      .eq("issue_id", issue_id)
      .select("issue_id, issue_title, created_by")
      .single();

    if (updateError) {
      console.error("❌ Supabase update error:", updateError.message);
      throw new Error("Failed to update issue status in database.");
    }
    console.log("✅ Issue status updated in DB to:", aiResponse.new_status);

    // 6. Conditionally Create a Record in 'issue_posts'
    if (aiResponse.new_status === "resolved" || "in progress") {
      const { data, error } = await supabase
        .from("issue_posts")
        .insert([
          {
            issue_id: originalIssue.issue_id,
            ai_generated_text: aiResponse.post_text,
            before_image_url: originalIssue.image_url,
            after_image_url: fixedImageUrl,
            posted_to_x: false, // This is a flag for the background job
          },
        ])
        .select();

      if (error) {
        console.error(
          "❌ Supabase insert into issue_posts error:",
          error.message
        );
        throw new Error("Failed to create post record.");
      }
      console.log("✅ Post record created in 'issue_posts'. Ready for X.");
    }

    // 7. Send Success Response
    res.json({
      success: true,
      message: "AI analysis complete and issue updated.",
      aiUpdate: {
        status: aiResponse.new_status,
        justification: aiResponse.justification,
      },
    });
  } catch (err) {
    console.error(
      "🔥 Unhandled error in agentUpdateIssue:",
      err.stack || err.message
    );
    res
      .status(500)
      .json({ error: err.message || "An internal server error occurred." });
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
  console.log("🟢 classifyReport invoked");
  try {
    const { reportId } = req.body;
    console.log("➡️ Input reportId:", reportId);

    // 1. Supabase fetch
    let issues, error;
    try {
      let result = await supabase
        .from("issues")
        .select("*")
        .eq("issue_id", reportId);

      issues = result.data;
      error = result.error;
    } catch (dbErr) {
      console.error("❌ Supabase fetch threw exception:", dbErr.message);
      return res.status(500).json({ error: "Supabase fetch crashed" });
    }

    if (error) {
      console.error("❌ Supabase fetch error:", error.message);
      return res.status(500).json({ error: "Failed to fetch issue" });
    }
    if (!issues || issues.length === 0) {
      console.warn("⚠️ No issue found for reportId:", reportId);
      return res.status(404).json({ error: "Report not found" });
    }

    const report = issues[0];
    console.log("✅ Issue fetched:", report.issue_id, report.image_url);

    // 2. Call Gemini
    let rawText;
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" },
      });

      const prompt = {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Classify civic issue into: ["water","electricity","road","garbage","other"].
Return JSON with keys: predicted_class, confidence (0-100), priority_level (high|medium|low), source_url.

Image: ${report.image_url}`,
              },
            ],
          },
        ],
      };

      console.log("📡 Sending prompt to Gemini…");
      const geminiRes = await model.generateContent(prompt);
      rawText = geminiRes.response.text();
      console.log("📩 Gemini raw response:", rawText);
    } catch (aiErr) {
      console.error("❌ Gemini API error:", aiErr.message);
      return res.status(500).json({ error: "Gemini call failed" });
    }

    // 3. Parse Gemini response
    let parsed;
    try {
      parsed = JSON.parse(rawText);
      console.log("✅ Parsed AI response:", parsed);
    } catch (parseErr) {
      console.error("❌ JSON parse error:", parseErr.message);
      return res
        .status(500)
        .json({ error: "Invalid AI response", raw: rawText });
    }

    // 4. Update Supabase
    try {
      const { error: updateError } = await supabase
        .from("issues")
        .update({
          department: parsed.predicted_class,
          priority: parsed.priority_level,
        })
        .eq("issue_id", reportId);

      if (updateError) {
        console.error("❌ Supabase update error:", updateError.message);
        return res.status(500).json({ error: "Failed to update Supabase" });
      }
      console.log("✅ Supabase updated successfully");
    } catch (updateCrash) {
      console.error("❌ Supabase update crashed:", updateCrash.message);
      return res.status(500).json({ error: "Supabase update crashed" });
    }

    // 5. Success
    res.json({
      success: true,
      reportId,
      department: parsed.predicted_class,
      GeminiAPIResponse: parsed,
    });
  } catch (err) {
    console.error(
      "🔥 Unhandled classification error:",
      err.stack || err.message
    );
    res.status(500).json({ error: "Internal server error (unhandled)" });
  }
};
// 3. Update Supabase issues table

// Assign an issue to an employee
const assignIssueToEmployee = async (req, res) => {
  try {
    const { issueId, emp_emails } = req.body;

    if (!issueId || !emp_emails) {
      return res
        .status(400)
        .json({ error: "issueId and emp_emails are required" });
    }

    // Normalize to array
    const emails = Array.isArray(emp_emails) ? emp_emails : [emp_emails];

    // 1️⃣ Fetch employees by email
    const { data: employees, error: empError } = await supabase
      .from("employee_registry")
      .select("emp_id, emp_email, name, position")
      .in("emp_email", emails);

    if (empError) return res.status(500).json({ error: empError.message });
    if (!employees || employees.length === 0)
      return res.status(404).json({ error: "No employees found" });

    // 2️⃣ Filter only assignable employees (position === 0)
    const assignable = employees.filter((e) => e.position === 0);
    if (assignable.length === 0)
      return res
        .status(403)
        .json({ error: "No assignable employees (position != 0)" });

    // 3️⃣ Check if mapping already exists to prevent duplicates
    const { data: existingMappings } = await supabase
      .from("employee_issue_map")
      .select("emp_id, issue_id")
      .in(
        "emp_id",
        assignable.map((e) => e.emp_id)
      )
      .eq("issue_id", issueId);

    const existingKeys = new Set(
      existingMappings?.map((m) => `${m.emp_id}-${m.issue_id}`) || []
    );

    const rowsToInsert = assignable
      .filter((e) => !existingKeys.has(`${e.emp_id}-${issueId}`))
      .map((e) => ({
        emp_id: e.emp_id,
        issue_id: issueId,
      }));

    if (rowsToInsert.length === 0) {
      return res.status(200).json({
        message: "All employees are already assigned to this issue",
        mappings: [],
      });
    }

    // 4️⃣ Insert new mappings
    const { data: mappings, error: mapError } = await supabase
      .from("employee_issue_map")
      .insert(rowsToInsert)
      .select("*");

    if (mapError) return res.status(500).json({ error: mapError.message });

    res.json({
      message: "Issue assigned to employees successfully",
      mappings,
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

// ✅ Enhanced fetch-address route that just calls the shared function
const fetchAddress = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res
        .status(400)
        .json({ error: "Latitude and longitude are required" });
    }

    console.log("🌍 Fetching address for:", latitude, longitude);

    const formattedAddress = await reverseGeocode(latitude, longitude);

    console.log("✅ Address resolved:", formattedAddress);

    res.json({ address: formattedAddress });
  } catch (err) {
    console.error("fetchAddress error:", err);
    res.status(500).json({ error: "Internal server error" });
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
  agentUpdateIssue,
  createIssueWithLocation,
  fetchAddress,
};
