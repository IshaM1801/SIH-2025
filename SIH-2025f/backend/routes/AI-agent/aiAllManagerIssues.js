import fetch from "node-fetch";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

// --- Helper to get current date in ISO format ---
const getCurrentDate = () => {
  const now = new Date();
  return now.toISOString().split("T")[0]; // YYYY-MM-DD
};

/**
 * Fetch all managers from /issues/dept
 */
const fetchManagers = async (token) => {
  const res = await fetch("http://localhost:5001/issues/dept", {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(`Failed to fetch managers: HTTP ${res.status}`);
  const data = await res.json();
  return data.managers || [];
};

/**
 * Fetch all issues for a manager
 */
const fetchManagerIssues = async (managerEmail, token) => {
  const res = await fetch(
    `http://localhost:5001/issues/dept?manager_email=${managerEmail}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  if (!res.ok) throw new Error(`Failed to fetch issues for ${managerEmail}: HTTP ${res.status}`);
  const data = await res.json();

  // Flatten employee issues into a single array
  const issues = data.employees
    ? data.employees.flatMap(emp => (emp.issue ? [emp.issue] : []))
    : data.issues || [];

  // Add manager info to each issue
  return issues.map(issue => ({ ...issue, manager_email: managerEmail }));
};

/**
 * Fetch all managers' issues and send to AI
 */
export const analyzeAllManagerIssues = async (token) => {
  // Step 1: Get all managers
  const managers = await fetchManagers(token);

  // Step 2: Fetch issues for all managers
  const allIssues = [];
  for (const manager of managers) {
    const managerIssues = await fetchManagerIssues(manager.emp_email, token);
    allIssues.push(...managerIssues);
  }

  // Step 3: Get current date
  const currentDate = getCurrentDate();

  // Step 4: Send all clubbed issues to Gemini AI
  const prompt = `
  You are an AI assistant analyzing city maintenance issues.
  
  I will provide a JSON array of issues across multiple managers. Each issue has:
  - issue_id
  - issue_title
  - status (pending, In Progress, resolved)
  - created_at (ISO 8601 string)
  - manager_email
  
  The current system date is: "${currentDate}".
  
  Your task:
  
  1. Identify all issues that have **status not 'resolved'** and have been idle for **more than 30 days**, calculating **days_idle as the difference between the current date and created_at**.
  2. Return a strictly **JSON object** (do NOT include explanations outside the JSON) with this structure:
  
  {
    "idle_issues": [
      {
        "issue_id": "string",
        "title": "string",
        "status": "string",
        "created_at": "YYYY-MM-DD",
        "days_idle": number,
        "manager_email": "string"
      }
    ],
    "summary_by_manager": {
      "manager_email": {
        "idle_issues": number_of_idle_issues,
        "total_issues": total_number_of_issues
      }
    },
    "conclusion": "string summarizing the manager with the most idle issues or stating 'No idle issues found.'"
  }
  
  3. Ensure all keys are double-quoted, numeric fields are numbers, arrays/objects are properly formatted, and empty lists are represented as [].
  4. Sort the idle_issues array in **descending order of days_idle**.
  5. Include all managers in summary_by_manager, even if they have zero idle issues.
  6. If no issues meet the criteria, set idle_issues count to 0 for all managers, but still include their total number of issues in total_issues.
  7. Return only valid JSON that can be directly parsed in JavaScript/React. Do not include any extra text. Do NOT use backticks or markdown formatting.
  
  JSON issues array:
  ${JSON.stringify(allIssues, null, 2)}
  `;

  const aiResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt
  });

  return aiResponse.text;
};