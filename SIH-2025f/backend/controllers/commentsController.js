const { supabase } = require("./authController");

/**
 * @desc    Get all comments for a specific issue
 * @route   GET /api/issues/:issueId/comments
 * @access  Public
 */
const getCommentsForIssue = async (req, res) => {
  const { issueId } = req.params;
  try {
    // FIXED: Trim the issueId to remove any trailing characters like newlines (\n)
    const sanitizedIssueId = issueId.trim();

    // This now calls the 'get_comments_for_issue' function from your db_functions.sql file.
    // This is the correct way to perform the join for your database structure.
    const { data, error } = await supabase.rpc("get_comments_for_issue", {
      issue_uuid: sanitizedIssueId,
    });

    if (error) throw error;

    // The function returns a flat object. We will nest the profile info
    // to match what the frontend component expects.
    const formattedData = data.map((comment) => ({
      ...comment,
      profiles: {
        name: comment.name,
        email: comment.email,
      },
    }));

    res.status(200).json(formattedData);
  } catch (err) {
    console.error("Error fetching comments:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * @desc    Create a new comment on an issue
 * @route   POST /api/issues/:issueId/comments
 * @access  Private
 */
const createComment = async (req, res) => {
  const { issueId } = req.params;
  const { content } = req.body;
  const userId = req.user.id; // From authMiddleware

  if (!content) {
    return res.status(400).json({ error: "Comment content cannot be empty." });
  }

  try {
    // FIXED: Trim the issueId here as well for safety.
    const sanitizedIssueId = issueId.trim();

    // Step 1: Just insert the new comment and get its ID back.
    const { data: insertData, error: insertError } = await supabase
      .from("comments")
      .insert([{ content, issue_id: sanitizedIssueId, user_id: userId }])
      .select("comment_id")
      .single();

    if (insertError) throw insertError;

    // Step 2: Call the 'get_single_comment_with_profile' function from db_functions.sql
    // to get the full comment data, including the joined profile info.
    const { data: rpcData, error: rpcError } = await supabase
      .rpc("get_single_comment_with_profile", {
        comment_uuid: insertData.comment_id,
      })
      .single();

    if (rpcError) throw rpcError;

    // Nest the profile data to match the frontend's expected format.
    const formattedData = {
      ...rpcData,
      profiles: {
        name: rpcData.name,
        email: rpcData.email,
      },
    };

    res.status(201).json(formattedData);
  } catch (err) {
    console.error("Error creating comment:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getCommentsForIssue,
  createComment,
};
