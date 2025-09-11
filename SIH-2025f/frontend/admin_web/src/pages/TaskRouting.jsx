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
  const [aiLoading, setAiLoading] = useState({}); // Track loading per task

  // --- Fetch tasks ---
  const fetchTasks = async () => {
    try {
      const resMe = await fetch("http://localhost:5001/employee/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resMe.ok) throw new Error(`HTTP ${resMe.status}`);
      const dataMe = await resMe.json();
      const employee = dataMe.employee;
      if (!employee || employee.position !== 0) {
        setTasks([]);
        setError("You are not an employee. No tasks assigned.");
        setLoading(false);
        return;
      }

      const resTasks = await fetch(`http://localhost:5001/issues/dept`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resTasks.ok) throw new Error(`HTTP ${resTasks.status}`);
      const dataTasks = await resTasks.json();
      setTasks(dataTasks.issues || []);
      setError(null);
    } catch (err) {
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
    socket.onopen = () => socket.send(JSON.stringify({ employeeId: user.emp_id }));
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "new_issue") setNotifications((prev) => [data, ...prev]);
    };
    setWs(socket);
    return () => socket.close();
  }, [user?.emp_id]);

  useEffect(() => {
    fetchTasks();
  }, []);

  // --- AI Update ---
  const handleAIUpdate = async (issue_id) => {
    const imageInput = document.createElement("input");
    imageInput.type = "file";
    imageInput.accept = "image/*";
    imageInput.onchange = async (e) => {
      const fixedImage = e.target.files[0];
      if (!fixedImage) return;

      const formData = new FormData();
      formData.append("issue_id", issue_id);
      formData.append("fixedImage", fixedImage);

      setAiLoading((prev) => ({ ...prev, [issue_id]: true }));

      try {
        const res = await fetch("http://localhost:5001/agent/update-issue", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "AI update failed");

        alert(`✅ Issue updated by AI. New status: ${data.aiUpdate.status}`);
        fetchTasks(); // Refresh task list
      } catch (err) {
        alert(`❌ AI update failed: ${err.message}`);
      } finally {
        setAiLoading((prev) => ({ ...prev, [issue_id]: false }));
      }
    };

    imageInput.click();
  };

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
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 text-xs font-medium rounded-full ring-1 bg-blue-100 text-blue-800">
                  {task.status || "Pending"}
                </span>
                <button
                  disabled={aiLoading[task.issue_id]}
                  onClick={() => handleAIUpdate(task.issue_id)}
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                >
                  {aiLoading[task.issue_id] ? "Updating..." : "Update Report"}
                </button>
              </div>
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