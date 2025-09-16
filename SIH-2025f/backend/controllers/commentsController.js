// controllers/commentController.js
const { supabase } = require("./authController");

// Helper to get employee ID from email
const getEmployeeId = async (email) => {
  const { data, error } = await supabase
    .from("employee_registry")
    .select("emp_id")
    .eq("emp_email", email)
    .single();
  if (error || !data) return null;
  return data.emp_id;
};

// GET /issues/comments/:issueId
exports.getCommentsForIssue = async (req, res) => {
  const { issueId } = req.params;

  try {
    // Step 1: Fetch all the raw comments for the issue. This is a simple query.
    const { data: comments, error: commentsError } = await supabase
      .from("comments")
      .select(
        "comment_id, content, image_url, created_at, user_id, employee_id"
      )
      .eq("issue_id", issueId);

    if (commentsError) throw commentsError;

    // If there are no comments, return an empty array right away.
    if (!comments || comments.length === 0) {
      return res.json([]);
    }

    // Step 2: Collect all unique user IDs and employee IDs from the comments.
    const userIds = [
      ...new Set(comments.map((c) => c.user_id).filter((id) => id)),
    ];
    const employeeIds = [
      ...new Set(comments.map((c) => c.employee_id).filter((id) => id)),
    ];

    // Step 3: Fetch all the necessary user profiles and employee details in parallel.
    const [profilesResponse, employeesResponse] = await Promise.all([
      userIds.length > 0
        ? supabase
            .from("profiles")
            .select("auth_id, name")
            .in("auth_id", userIds)
        : Promise.resolve({ data: [], error: null }),
      employeeIds.length > 0
        ? supabase
            .from("employee_registry")
            .select("emp_id, name, dept_name")
            .in("emp_id", employeeIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (profilesResponse.error) throw profilesResponse.error;
    if (employeesResponse.error) throw employeesResponse.error;

    // Step 4: Create simple lookup maps for fast access to names and details.
    const profilesMap = new Map(
      profilesResponse.data.map((p) => [p.auth_id, p])
    );
    const employeesMap = new Map(
      employeesResponse.data.map((e) => [e.emp_id, e])
    );

    // Step 5: Combine the comments with their author details.
    const hydratedComments = comments.map((comment) => {
      let profileData = null;
      let employeeData = null;
      let commenterName = "Anonymous";

      if (comment.user_id && profilesMap.has(comment.user_id)) {
        const profile = profilesMap.get(comment.user_id);
        commenterName = profile.name;
        profileData = { name: profile.name };
      } else if (comment.employee_id && employeesMap.has(comment.employee_id)) {
        const employee = employeesMap.get(comment.employee_id);
        commenterName = employee.name;
        employeeData = { name: employee.name, dept_name: employee.dept_name };
      }

      return {
        ...comment,
        commenter_name: commenterName,
        is_admin: !!comment.employee_id,
        profiles: profileData,
        employee_registry: employeeData,
      };
    });

    // The frontend sort logic will handle the ordering.
    res.json(hydratedComments);
  } catch (err) {
    console.error("Error fetching and hydrating comments:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch comments", details: err.message });
  }
};

// POST /issues/comments/:issueId
exports.createComment = async (req, res) => {
  const { issueId } = req.params;
  const { content, image_url } = req.body;
  const { isEmployee, id: userId, email: empEmail } = req.user;

  try {
    // Step 1: Prepare the basic comment data for insertion.
    let commentData = {
      issue_id: issueId,
      content,
      image_url,
    };

    if (isEmployee) {
      const empId = await getEmployeeId(empEmail);
      if (!empId) return res.status(403).json({ error: "Employee not found." });
      commentData.employee_id = empId;
    } else {
      commentData.user_id = userId;
    }

    // Step 2: Insert the comment and select back only the raw data. NO JOINS.
    const { data: newComment, error: insertError } = await supabase
      .from("comments")
      .insert(commentData)
      .select(
        "comment_id, content, image_url, created_at, user_id, employee_id"
      )
      .single();

    if (insertError) throw insertError;

    // Step 3: Now that the comment is created, fetch the author's details separately.
    let profileData = null;
    let employeeData = null;
    let commenterName = "Anonymous";

    if (newComment.user_id) {
      // It's a user comment, so fetch their profile.
      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("auth_id", newComment.user_id)
        .single();

      if (profile) {
        commenterName = profile.name;
        profileData = { name: profile.name };
      }
    } else if (newComment.employee_id) {
      // It's an employee comment, so fetch their details.
      const { data: employee } = await supabase
        .from("employee_registry")
        .select("name, dept_name")
        .eq("emp_id", newComment.employee_id)
        .single();

      if (employee) {
        commenterName = employee.name;
        employeeData = { name: employee.name, dept_name: employee.dept_name };
      }
    }

    // Step 4: Assemble the final, complete object to send back to the frontend.
    const formattedData = {
      ...newComment,
      commenter_name: commenterName,
      is_admin: !!newComment.employee_id,
      profiles: profileData,
      employee_registry: employeeData,
    };

    res.status(201).json(formattedData);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to create comment", details: err.message });
  }
};

// PUT /issues/comments/:commentId
exports.updateComment = async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const { isEmployee, id: userId, email: empEmail } = req.user;

  if (!content)
    return res.status(400).json({ error: "Content cannot be empty." });

  try {
    // 1. Fetch the comment to verify ownership
    const { data: comment, error: fetchError } = await supabase
      .from("comments")
      .select("user_id, employee_id")
      .eq("comment_id", commentId)
      .single();

    if (fetchError || !comment)
      return res.status(404).json({ error: "Comment not found." });

    // 2. Authorize the update
    let isOwner = false;
    if (isEmployee) {
      const empId = await getEmployeeId(empEmail);
      if (comment.employee_id === empId) isOwner = true;
    } else {
      if (comment.user_id === userId) isOwner = true;
    }

    if (!isOwner)
      return res
        .status(403)
        .json({ error: "You can only edit your own comments." });

    // 3. Perform the update
    const { data, error } = await supabase
      .from("comments")
      .update({ content, updated_at: new Date().toISOString() })
      .eq("comment_id", commentId)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to update comment", details: err.message });
  }
};

// DELETE /issues/comments/:commentId
exports.deleteComment = async (req, res) => {
  const { commentId } = req.params;
  const { isEmployee, id: userId, email: empEmail } = req.user;

  try {
    // 1. Fetch the comment to verify ownership/permissions
    const { data: comment, error: fetchError } = await supabase
      .from("comments")
      .select("user_id, employee_id")
      .eq("comment_id", commentId)
      .single();

    if (fetchError || !comment)
      return res.status(404).json({ error: "Comment not found." });

    // 2. Authorization logic
    let canDelete = false;
    if (isEmployee) {
      const empId = await getEmployeeId(empEmail);
      // Employee can delete their own comment OR any user's comment
      if (comment.employee_id === empId || comment.user_id !== null) {
        canDelete = true;
      }
    } else {
      // User can only delete their own comment
      if (comment.user_id === userId) {
        canDelete = true;
      }
    }

    if (!canDelete)
      return res
        .status(403)
        .json({ error: "You do not have permission to delete this comment." });

    // 3. Perform the deletion
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("comment_id", commentId);

    if (error) throw error;

    res.status(200).json({ message: "Comment deleted successfully." });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to delete comment", details: err.message });
  }
};
