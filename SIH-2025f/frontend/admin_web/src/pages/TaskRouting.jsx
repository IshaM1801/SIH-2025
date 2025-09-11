import React, { useEffect, useState } from "react";

// Inline loader icon
const Loader = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="animate-spin h-8 w-8 text-blue-500 mx-auto"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v8z"
    ></path>
  </svg>
);

const TaskRouting = () => {
  const token = localStorage.getItem("employee_token");
  const user = JSON.parse(localStorage.getItem("employee") || "{}");

  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ws, setWs] = useState(null);

  // --- Fetch employee info and tasks ---
  const fetchTasks = async () => {
    try {
      const resMe = await fetch("http://localhost:5001/employee/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resMe.ok) throw new Error(`HTTP ${resMe.status}`);
      const dataMe = await resMe.json();
      console.log("📄 /employee/me response:", dataMe);

      const employee = dataMe.employee;
      if (!employee) throw new Error("No employee data returned");

      if (employee.position !== 0) {
        console.log("❌ Not an employee, no tasks assigned");
        setTasks([]);
        setError("You are not an employee. No tasks assigned.");
        setLoading(false);
        return;
      }

      console.log("✅ Employee detected, fetching tasks for:", employee.name);

      const resTasks = await fetch(`http://localhost:5001/issues/dept`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resTasks.ok) throw new Error(`HTTP ${resTasks.status}`);
      const dataTasks = await resTasks.json();
      console.log("📄 /employee/tasks response:", dataTasks);

      setTasks(dataTasks.issues || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("Failed to load tasks");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // --- WebSocket notifications ---
  useEffect(() => {
    if (!user?.emp_id) return;

    const socket = new WebSocket("ws://localhost:8080");
    window.testWS = socket; // Expose globally for console testing

    socket.onopen = () => {
      console.log("🔗 WebSocket connected");
      socket.send(JSON.stringify({ employeeId: user.emp_id }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("📣 Raw WebSocket message received:", data);
      if (data.type === "new_issue") {
        setNotifications((prev) => [data, ...prev]);
      }
    };

    socket.onclose = () => console.log("❌ WebSocket disconnected");
    socket.onerror = (err) => console.error("WebSocket error:", err);

    setWs(socket);

    return () => socket.close();
  }, [user?.emp_id]);

  // --- Fetch tasks on mount ---
  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-4">My Tasks</h2>

      {loading && <Loader />}

      {!loading && error && <p className="text-red-500">{error}</p>}

      {!loading && !error && tasks.length === 0 && (
        <p className="text-gray-500">No tasks assigned.</p>
      )}

      {!loading && tasks.length > 0 && (
        <ul className="divide-y divide-gray-200 mb-6">
          {tasks.map((task) => (
            <li
              key={task.issue_id}
              className="p-4 bg-white rounded shadow mb-2 flex justify-between items-center"
            >
              <div>
                <h3 className="font-semibold text-gray-800">{task.issue_title}</h3>
                <p className="text-sm text-gray-500">
                  {task.address_component || "No location"}
                </p>
              </div>
              <span className="px-2 py-1 text-xs font-medium rounded-full ring-1 bg-blue-100 text-blue-800">
                {task.status || "Pending"}
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* Notifications */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-2">Notifications</h3>
        {notifications.length === 0 ? (
          <p className="text-gray-500 text-sm">No new notifications</p>
        ) : (
          <ul className="space-y-2">
            {notifications.map((n, idx) => (
              <li
                key={idx}
                className="p-2 bg-blue-50 border-l-4 border-blue-500 rounded text-sm text-blue-700"
              >
                {n.message}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TaskRouting;