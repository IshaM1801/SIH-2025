const { createClient } = require("@supabase/supabase-js");
const axios = require("axios");
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const createIssue = async (req, res) => {
  try {
    const { issue_title, issue_description, department } = req.body;
    const user = req.user; 
    const created_by = user.id;

    if (!issue_title || !issue_description) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Handle uploaded file
    let imageUrl = null;
    if (req.file) {
      const file = req.file; // multer file object
      const fileExt = file.originalname.split(".").pop();
      const fileName = `issues/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("issue-photos")
        .upload(fileName, file.buffer, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.mimetype,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicData } = supabase.storage
        .from("issue-photos")
        .getPublicUrl(fileName);

      imageUrl = publicData.publicUrl;
    }

    // Get client IP
    let clientIp =
      req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;

    if (clientIp === "::1" || clientIp === "127.0.0.1") {
      clientIp = "8.8.8.8"; // fallback IP
    }

    const apiKey = process.env.IPGEO_API_KEY; 
    const geoUrl = `https://api.ipgeolocation.io/v2/ipgeo?apiKey=${apiKey}&ip=${clientIp}&fields=location`;

    const geoResponse = await axios.get(geoUrl);
    const locationData = geoResponse.data.location;
    const latitude = locationData.latitude;
    const longitude = locationData.longitude;

    // Insert issue into Supabase
    const { data, error } = await supabase
      .from("issues")
      .insert([
        {
          issue_title,
          issue_description,
          created_by,
          department: department || null,
          image_url: imageUrl, // store image URL
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
};///