const { createClient } = require("@supabase/supabase-js");
const { v4: uuidv4 } = require("uuid");

const uploadCommentImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image file provided." });
  }

  try {
    let supabaseClient;

    // --- THIS IS THE NEW LOGIC ---
    if (req.user.isEmployee) {
      // If the user is an employee, we use the powerful SERVICE_ROLE_KEY to perform the upload.
      // This is secure because our middleware has already verified they are a valid employee.
      // The service role bypasses all RLS policies.
      console.log("Action performed by: Employee (using service role)");
      supabaseClient = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        { auth: { persistSession: false } } // Important for server-side
      );
    } else {
      // If it's a regular user, we create a client that acts on their behalf
      // using their own token, and RLS policies WILL apply.
      console.log("Action performed by: User (using user role)");
      supabaseClient = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY,
        {
          global: {
            headers: {
              Authorization: req.headers.authorization,
            },
          },
        }
      );
    }
    // ----------------------------

    const file = req.file;
    const bucketName = "comment-uploads";
    const fileName = `comments/${uuidv4()}-${file.originalname}`;

    // Use the dynamically created supabaseClient for the upload
    const { data, error } = await supabaseClient.storage
      .from(bucketName)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Use the same client to get the public URL
    const { data: urlData } = supabaseClient.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    res.json({ imageUrl: urlData.publicUrl });
  } catch (error) {
    console.error("Image upload error:", error);
    res.status(500).json({ error: "Failed to upload image." });
  }
};

module.exports = { uploadCommentImage };
