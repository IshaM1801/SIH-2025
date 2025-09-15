import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import CivicIssueMap from "./Map";
// --- INLINE SVG ICONS ---
const KpiIcon = ({ icon, colorClass, bgClass }) => (
  <div className={`p-3 rounded-full ${bgClass} ${colorClass}`}>{icon}</div>
);

const icons = {
  TotalIssues: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h.01" />
      <path d="M12 4v10.5a3.5 3.5 0 1 0 7 0V8a3.5 3.5 0 1 0-7 0v10.5a3.5 3.5 0 1 0 7 0V8" />
    </svg>
  ),
  Pending: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
  Resolved: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  Team: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Weather: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
    </svg>
  ),
  TrendUp: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" />
      <polyline points="16,7 22,7 22,13" />
    </svg>
  ),
  TrendDown: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22,17 13.5,8.5 8.5,13.5 2,7" />
      <polyline points="16,17 22,17 22,11" />
    </svg>
  ),
  Filter: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" />
    </svg>
  ),
  Calendar: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  ChevronLeft: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="15,18 9,12 15,6" />
    </svg>
  ),
  ChevronRight: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9,18 15,12 9,6" />
    </svg>
  ),
  Activity: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
    </svg>
  ),
  Priority: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  Loader: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="animate-spin"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
    </svg>
  ),
};

// --- UI SUB-COMPONENTS ---
const KpiCard = ({ title, value, icon, color, bg, trend, percentage }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <KpiIcon icon={icon} colorClass={color} bgClass={bg} />
        <div>
          <p className="text-sm text-slate-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-slate-800">{value}</p>
        </div>
      </div>
      {trend && (
        <div
          className={`flex items-center gap-1 text-sm font-medium ${
            trend === "up" ? "text-green-600" : "text-red-600"
          }`}
        >
          {trend === "up" ? icons.TrendUp : icons.TrendDown}
          <span>{percentage}%</span>
        </div>
      )}
    </div>
  </div>
);

const LeafletMap = ({ locations }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (mapRef.current && !mapInstance.current && window.L) {
      const defaultCoords = [19.46, 72.8];
      mapInstance.current = window.L.map(mapRef.current).setView(
        defaultCoords,
        13
      );
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(mapInstance.current);
    }
  }, []);

  useEffect(() => {
    if (mapInstance.current && locations && window.L) {
      mapInstance.current.eachLayer((layer) => {
        if (layer instanceof window.L.Marker) {
          mapInstance.current.removeLayer(layer);
        }
      });
      locations.forEach((loc) => {
        window.L.marker([loc.lat, loc.lon])
          .addTo(mapInstance.current)
          .bindPopup(`<b>${loc.title}</b>`);
      });
    }
  }, [locations]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-800">Issue Locations</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Total Locations:</span>
          <span className="text-sm font-semibold text-slate-700">
            {locations.length}
          </span>
        </div>
      </div>
      <div ref={mapRef} className="h-80 w-full bg-slate-200 rounded-lg"></div>
    </div>
  );
};

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const today = new Date();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const isToday = (day) => {
    return (
      today.getDate() === day &&
      today.getMonth() === currentDate.getMonth() &&
      today.getFullYear() === currentDate.getFullYear()
    );
  };

  const isSelected = (day) => {
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentDate.getMonth() &&
      selectedDate.getFullYear() === currentDate.getFullYear()
    );
  };

  const isHoliday = (day) => {
    // Ganesh Chaturthi on Sept 7, 2025
    return currentDate.getMonth() === 8 && day === 7;
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2 w-full h-8"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isCurrentDay = isToday(day);
      const isSelectedDay = isSelected(day);
      const isHolidayDay = isHoliday(day);

      days.push(
        <button
          key={day}
          onClick={() =>
            setSelectedDate(
              new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
            )
          }
          className={`
            p-2 w-full h-8 text-sm rounded-full flex items-center justify-center transition-colors duration-150
            ${isCurrentDay ? "bg-blue-600 text-white font-bold" : ""}
            ${
              isSelectedDay && !isCurrentDay
                ? "bg-blue-100 text-blue-700 font-semibold"
                : ""
            }
            ${isHolidayDay ? "bg-red-100 text-red-700" : ""}
            ${
              !isCurrentDay && !isSelectedDay && !isHolidayDay
                ? "hover:bg-slate-100 text-slate-700"
                : ""
            }
          `}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icons.Calendar}
          <h3 className="text-lg font-bold text-slate-800">Calendar</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-1 hover:bg-slate-100 rounded-full transition-colors"
          >
            {icons.ChevronLeft}
          </button>
          <span className="text-sm font-semibold text-slate-700 min-w-[120px] text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button
            onClick={() => navigateMonth(1)}
            className="p-1 hover:bg-slate-100 rounded-full transition-colors"
          >
            {icons.ChevronRight}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div key={day} className="font-semibold text-slate-500 p-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">{renderCalendarDays()}</div>

      {currentDate.getMonth() === 8 && currentDate.getFullYear() === 2025 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-red-700 font-medium">
            🎉 Ganesh Chaturthi - September 7th
          </p>
        </div>
      )}

      <div className="mt-4 text-xs text-slate-500 text-center">
        Selected: {selectedDate.toLocaleDateString()}
      </div>
    </div>
  );
};

// Enhanced Doughnut Chart component
const DoughnutChart = ({ data, title }) => {
  const { labels, datasets } = data;
  const chartData = datasets[0].data;
  const backgroundColors = datasets[0].backgroundColor;
  const total = chartData.reduce((sum, value) => sum + value, 0);

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        No data to display
      </div>
    );
  }

  let cumulativePercentage = 0;
  const gradientStops = chartData
    .map((value, index) => {
      const percentage = (value / total) * 100;
      const start = cumulativePercentage;
      cumulativePercentage += percentage;
      const end = cumulativePercentage;
      return `${backgroundColors[index]} ${start}% ${end}%`;
    })
    .join(", ");

  const conicGradient = `conic-gradient(${gradientStops})`;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h3 className="text-lg font-bold mb-4 text-slate-800">{title}</h3>
      <div className="flex flex-col items-center justify-center gap-4">
        <div
          className="relative w-40 h-40 rounded-full"
          style={{ background: conicGradient }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-28 h-28 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
              <span className="text-2xl font-bold text-slate-800">{total}</span>
              <span className="text-xs text-slate-500">Total</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 w-full">
          {labels.map(
            (label, index) =>
              chartData[index] > 0 && (
                <div key={label} className="flex items-center gap-2 text-xs">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: backgroundColors[index] }}
                  ></span>
                  <div className="flex-1">
                    <span className="text-slate-600 block">{label}</span>
                    <span className="font-semibold text-slate-800">
                      {chartData[index]} (
                      {Math.round((chartData[index] / total) * 100)}%)
                    </span>
                  </div>
                </div>
              )
          )}
        </div>
      </div>
    </div>
  );
};

// Team Performance Component
const TeamPerformance = ({ teamWorkload }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-800">Team Performance</h3>
        <button className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
          {icons.Filter}
          <span>Filter</span>
        </button>
      </div>
      <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
        {teamWorkload.map((member, index) => {
          const maxCount = Math.max(...teamWorkload.map((m) => m.count));
          const percentage = maxCount > 0 ? (member.count / maxCount) * 100 : 0;

          return (
            <div key={member.name} className="flex items-center gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {member.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-slate-800 text-sm">
                    {member.name}
                  </p>
                  <span className="text-sm font-bold text-slate-600">
                    {member.count}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {member.count} assigned issue(s)
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Recent Activity Component
const RecentActivity = ({ recentIssues }) => {
  const activities = recentIssues?.slice(0, 5) || [];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center gap-2 mb-4">
        {icons.Activity}
        <h3 className="text-lg font-bold text-slate-800">Recent Activity</h3>
      </div>
      <div className="space-y-4">
        {activities.length > 0 ? (
          activities.map((issue, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
            >
              <div
                className={`w-2 h-2 rounded-full mt-2 ${
                  issue.status === "resolved"
                    ? "bg-green-500"
                    : issue.status === "pending"
                    ? "bg-yellow-500"
                    : "bg-blue-500"
                }`}
              ></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800">
                  {issue.issue_title}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Status: <span className="font-medium">{issue.status}</span>
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-slate-500 text-sm">No recent activity</p>
        )}
      </div>
    </div>
  );
};

// Priority Issues Component
const PriorityIssues = ({ priorityIssues }) => {
  const priorities = priorityIssues?.slice(0, 4) || [];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center gap-2 mb-4">
        {icons.Priority}
        <h3 className="text-lg font-bold text-slate-800">
          High Priority Issues
        </h3>
      </div>
      <div className="space-y-3">
        {priorities.length > 0 ? (
          priorities.map((issue, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border border-red-200 bg-red-50 rounded-lg truncate"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800">
                  {issue.issue_title}
                </p>
                <p className="text-xs text-slate-500">ID: {issue.issue_id}</p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Urgent
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-slate-500 text-sm">No high priority issues</p>
        )}
      </div>
    </div>
  );
};

// Weather Widget Component
const WeatherWidget = () => {
  return (
    <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-6 rounded-xl shadow-sm">
      <h3 className="text-lg font-bold mb-4">Current Weather</h3>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-3xl font-bold">31°C</p>
          <p className="text-blue-100">Partly Cloudy</p>
        </div>
        <div className="text-white opacity-80">{icons.Weather}</div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-blue-100">Humidity</p>
          <p className="font-semibold">65%</p>
        </div>
        <div>
          <p className="text-blue-100">Wind Speed</p>
          <p className="font-semibold">12 km/h</p>
        </div>
      </div>
    </div>
  );
};

// --- DATA PROCESSING LOGIC ---
const processData = (data) => {
  if (!data || !data.team) return null;

  const allIssues = [];
  const issueMap = new Map();

  data.team.forEach((member) => {
    (member.issues || []).forEach((issue) => {
      if (!issueMap.has(issue.issue_id)) {
        issueMap.set(issue.issue_id, issue);
        allIssues.push(issue);
      }
    });
  });

  const statusCounts = {
    pending: 0,
    resolved: 0,
    "In Progress": 0,
    "Needs Review": 0,
  };
  allIssues.forEach((issue) => {
    if (statusCounts[issue.status] !== undefined) {
      statusCounts[issue.status]++;
    }
  });

  const teamMembers = data.team.filter((t) => t.emp_id !== null);
  const teamWorkload = teamMembers
    .map((member) => ({
      name: member.name,
      count: (member.issues || []).length,
    }))
    .sort((a, b) => b.count - a.count);

  // Get recent issues (last 5)
  const recentIssues = allIssues.slice(-5);

  // Get priority issues (pending issues as high priority)
  const priorityIssues = allIssues.filter(
    (issue) => issue.status === "pending"
  );

  return {
    managerName: data.manager ? data.manager.split("@")[0] : "Manager",
    totalIssues: allIssues.length,
    pendingCount: statusCounts.pending,
    resolvedCount: statusCounts.resolved,
    inProgressCount: statusCounts["In Progress"],
    teamSize: teamMembers.length,
    issueLocations: allIssues
      .filter((i) => i.latitude && i.longitude)
      .map((i) => ({
        lat: i.latitude,
        lon: i.longitude,
        title: i.issue_title,
      })),
    statusChartData: {
      labels: ["Pending", "In Progress", "Resolved", "Needs Review"],
      datasets: [
        {
          data: [
            statusCounts.pending,
            statusCounts["In Progress"],
            statusCounts.resolved,
            statusCounts["Needs Review"],
          ],
          backgroundColor: ["#facc15", "#60a5fa", "#4ade80", "#fb923c"],
          borderColor: "#ffffff",
          borderWidth: 4,
        },
      ],
    },
    teamWorkload,
    recentIssues,
    priorityIssues,
    allIssues,
  };
};

// --- MAIN DASHBOARD COMPONENT ---
const ManagerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("employee_token");
    if (!token) {
      setError("Authentication token not found.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5001/issues/dept", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error(
          `Failed to fetch: ${response.status} ${response.statusText}`
        );
      }
      const data = await response.json();
      const processed = processData(data);
      if (processed) {
        setDashboardData(processed);
      } else {
        throw new Error("Invalid data structure received from API.");
      }
    } catch (e) {
      console.error(e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const today = new Date();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          {icons.Loader}
          <p className="mt-4 text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="text-center bg-white p-8 rounded-xl shadow-sm border border-red-200">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-700 mb-2">
            Error Loading Dashboard
          </h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="text-center bg-white p-8 rounded-xl shadow-sm border border-slate-200">
          <div className="text-slate-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">
            No Data Available
          </h3>
          <p className="text-slate-500">
            No data available to display at the moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen mb-100">
      <div className="p-4 sm:p-6 lg:p-2 max-w-7xl mx-auto">
        {/* Header */}
        {/* <header className="mb-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Manager's Dashboard
              </h1>
              <p className="mt-2 text-lg text-slate-600">
                {today.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="text-left lg:text-right">
              <p className="text-xl font-semibold text-slate-800 capitalize">
                Welcome back, {dashboardData.managerName}
              </p>
            </div>
          </div>
        </header> */}

        <main className="space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <KpiCard
              title="Total Issues"
              value={dashboardData.totalIssues}
              icon={icons.TotalIssues}
              color="text-blue-600"
              bg="bg-blue-100"
              trend="up"
              percentage="12"
            />
            <KpiCard
              title="Pending Issues"
              value={dashboardData.pendingCount}
              icon={icons.Pending}
              color="text-yellow-600"
              bg="bg-yellow-100"
              trend="down"
              percentage="8"
            />
            <KpiCard
              title="Resolved Issues"
              value={dashboardData.resolvedCount}
              icon={icons.Resolved}
              color="text-green-600"
              bg="bg-green-100"
              trend="up"
              percentage="15"
            />
            <KpiCard
              title="Team Members"
              value={dashboardData.teamSize}
              icon={icons.Team}
              color="text-indigo-600"
              bg="bg-indigo-100"
            />
          </div>

          {/* Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <DoughnutChart
              data={dashboardData.statusChartData}
              title="Issues by Status"
            />
            <TeamPerformance teamWorkload={dashboardData.teamWorkload} />
            <PriorityIssues priorityIssues={dashboardData.priorityIssues} />
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-800">
                  Resolution Rate
                </h3>
              </div>
              <p className="text-3xl font-bold text-slate-800 mb-2">
                {dashboardData.totalIssues > 0
                  ? Math.round(
                      (dashboardData.resolvedCount /
                        dashboardData.totalIssues) *
                        100
                    )
                  : 0}
                %
              </p>
              <p className="text-sm text-slate-500">
                {dashboardData.resolvedCount} of {dashboardData.totalIssues}{" "}
                issues resolved
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-800">
                  Avg. Response Time
                </h3>
              </div>
              <p className="text-3xl font-bold text-slate-800 mb-2">2.5</p>
              <p className="text-sm text-slate-500">hours average response</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-800">
                  Team Efficiency
                </h3>
              </div>
              <p className="text-3xl font-bold text-slate-800 mb-2">94%</p>
              <p className="text-sm text-slate-500">overall team performance</p>
            </div>
          </div>

          {/* Main Content Grid */}
          {/* <div className="grid grid-cols-2 xl:grid-cols-2 gap-6"> */}
          {/* Map Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-40">
            <CivicIssueMap locations={dashboardData.issueLocations} />{" "}
            <RecentActivity recentIssues={dashboardData.recentIssues} />
          </div>

          {/* Right Sidebar */}
          {/* <div className="xl:col-span-2 space-y-6">
              <Calendar />
              <WeatherWidget />
            </div> */}
          {/* </div> */}
        </main>
      </div>
    </div>
  );
};

export default ManagerDashboard;
