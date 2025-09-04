const supabase = require('../supabase');

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

// 3️⃣ Create a new issue
const createIssue = async (req, res) => {
  const { issue_title, issue_description, latitude, longitude, department } = req.body;

  if (!issue_title || !issue_description) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const user = req.user; // ✅ comes from middleware
    const created_by = user.id;

    const { data, error } = await supabase
      .from("issues")
      .insert([
        {
          issue_title,
          issue_description,
          created_by,
          department: department || null,
          location:
            latitude && longitude
              ? `SRID=4326;POINT(${longitude} ${latitude})`
              : null,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res
      .status(201)
      .json({ message: "Issue created successfully", issue: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllIssues,
  getUserIssues,
  createIssue
};//.