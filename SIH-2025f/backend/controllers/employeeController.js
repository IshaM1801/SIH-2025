const supabase = require("../supabase");

// 1️⃣ Get all employees under logged-in manager
const getTeamEmployees = async (req, res) => {
    try {
      // Logged-in user's email from token
      const managerEmail = req.user.email;
  
      // Fetch manager info
      const { data: manager, error: mgrError } = await supabase
        .from("employee_registry")
        .select("emp_id, emp_email, dept_name, team_name, position")
        .eq("emp_email", managerEmail)
        .single();
  
      if (mgrError || !manager) {
        return res.status(403).json({ error: "Manager not found" });
      }
  
      // Check if logged-in user is a manager
      if (manager.position !== 1) {
        return res
          .status(403)
          .json({ error: "Access denied. Only managers can view team employees." });
      }
  
      // Fetch all employees in the same team with issue_id foreign key
      const { data: employees, error } = await supabase
        .from("employee_registry")
        .select("emp_id, name, emp_email, dept_name, team_name, position, issue_id")
        .eq("team_name", manager.team_name)
        .eq("position", 0);
  
      if (error) throw error;
  
      // If employees have issue_ids, fetch their issue details
      let employeesWithIssues = [];
      if (employees && employees.length > 0) {
        const issueIds = employees
          .map(e => e.issue_id)
          .filter(id => id !== null); // only valid ids
  
        let issues = [];
        if (issueIds.length > 0) {
          const { data: issueData, error: issueError } = await supabase
            .from("issues")
            .select("issue_id, issue_title, issue_description, status, created_at")
            .in("issue_id", issueIds);
  
          if (issueError) throw issueError;
          issues = issueData;
        }
  
        // Map employees with their issue details
        employeesWithIssues = employees.map(emp => {
          const empIssue = issues.find(i => i.issue_id === emp.issue_id) || null;
          return {
            ...emp,
            issue: empIssue,
          };
        });
      }
  
      res.json({
        manager: manager.emp_email,
        team: manager.team_name,
        employees: employeesWithIssues,
      });
    } catch (err) {
      console.error("getTeamEmployees error:", err);
      res.status(500).json({ error: err.message });
    }
  };

// 2️⃣ Optional: Get a single employee by ID
const getEmployeeById = async (req, res) => {
    try {
      // Assume middleware already set req.emp_email
      const employeeEmail = req.user.email;
      if (!employeeEmail) return res.status(401).json({ error: "Access token required" });
  
      // Fetch employee by email from DB
      const { data: employee, error } = await supabase
        .from("employee_registry")
        .select("*")
        .eq("emp_email", employeeEmail)
        .single();
  
      if (error || !employee)
        return res.status(404).json({ error: "Employee not found" });
  
      res.json({ employee });
    } catch (err) {
      console.error("getEmployeeByEmail error:", err);
      res.status(500).json({ error: err.message });
    }
  };

module.exports = {
  getTeamEmployees,
  getEmployeeById,
};