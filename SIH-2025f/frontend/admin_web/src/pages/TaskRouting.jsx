import React, { useEffect, useState } from "react";
import {
  Loader2,
  MapPin,
  CheckCircle,
  Clock,
  AlertCircle,
  Upload,
} from "lucide-react";
import { API_BASE_URL } from "@/config/api";

// Loader in center
const Loader = () => (
  <div className="flex items-center justify-center py-10">
    <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
  </div>
);

const TaskRouting = () => {
  const token = localStorage.getItem("employee_token");
  const user = JSON.parse(localStorage.getItem("employee") || "{}");

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aiLoading, setAiLoading] = useState({});

  // --- Fetch tasks ---
  const fetchTasks = async () => {
    try {
      const resMe = await fetch(`${API_BASE_URL}/employee/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resMe.ok) throw new Error(`HTTP ${resMe.status}`);
      const dataMe = await resMe.json();
      const employee = dataMe.employee;
      if (!employee || employee.position !== 0) {
        setTasks([]);
        setError("No Tasks Assigned");
        setLoading(false);
        return;
      }

      const resTasks = await fetch(`${API_BASE_URL}/issues/dept`, {
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
      formData.append("fixedImageFile", fixedImage);

      setAiLoading((prev) => ({ ...prev, [issue_id]: true }));

      try {
        const res = await fetch(`${API_BASE_URL}/issues/agent-update/${issue_id}`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          }
        );
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

  // --- Status badge ---
  const StatusBadge = ({ status }) => {
    let icon, color, bg;
    switch (status) {
      case "Resolved":
        icon = <CheckCircle className="w-4 h-4" />;
        color = "text-green-700";
        bg = "bg-green-100";
        break;
      case "In Progress":
        icon = <Clock className="w-4 h-4" />;
        color = "text-yellow-700";
        bg = "bg-yellow-100";
        break;
      default:
        icon = <AlertCircle className="w-4 h-4" />;
        color = "text-gray-700";
        bg = "bg-gray-100";
    }
    return (
      <span
        className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${bg} ${color}`}
      >
        {icon}
        {status || "Pending"}
      </span>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">📋 My Tasks</h2>

      {loading && <Loader />}
      {!loading && error && <p className="text-red-500">{error}</p>}
      {!loading && !error && tasks.length === 0 && (
        <p className="text-gray-500">No tasks assigned.</p>
      )}

      {!loading && tasks.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <div
              key={task.issue_id}
              className="p-5 bg-white rounded-xl shadow hover:shadow-md transition border border-gray-100 flex flex-col justify-between"
            >
              <div>
                <img
                  src={task.image_url}
                  alt={task.issue_title}
                  className="w-full h-45 object-cover rounded-md mb-2"
                />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {task.issue_title}
                </h3>
                <p className="flex items-center text-sm text-gray-500 mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  {task.address_component || "No location"}
                </p>
              </div>

              <div className="flex items-center justify-between mt-3">
                <StatusBadge status={task.status} />
                <button
                  disabled={aiLoading[task.issue_id]}
                  onClick={() => handleAIUpdate(task.issue_id)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 disabled:opacity-50"
                >
                  {aiLoading[task.issue_id] ? (
                    <>
                      <Loader2 className="animate-spin w-4 h-4" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Update
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskRouting;
