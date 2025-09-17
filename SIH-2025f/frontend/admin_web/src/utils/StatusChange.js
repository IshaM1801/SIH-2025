import axios from "axios";
import { API_BASE_URL } from "../config/api.js";

export const updateIssueStatus = async (issueId, newStatus) => {
  try {
    const token = localStorage.getItem("employee_token"); // must exist
    if (!token) throw new Error("No token found in localStorage");

    const response = await axios.patch(
      `${API_BASE_URL}/issues/update-status/${issueId}`,
      { status: newStatus },
      {
        headers: {
          Authorization: `Bearer ${token}`, // pass token to backend
          "Content-Type": "application/json",
        },
      }
    );

    return response.data; // updated issue
  } catch (error) {
    console.error("Failed to update issue status", error);
    throw error;
  }
};