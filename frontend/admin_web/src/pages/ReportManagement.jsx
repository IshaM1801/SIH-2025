import React, { useState, useMemo } from "react";
// IMPORTANT: You will need to install recharts for the new charts to work
// Run: npm install recharts
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// --- INLINE SVG ICONS ---
const icons = {
  MapPin: ({ size = 16, className = "" }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>
  ),
  Search: ({ size = 20, className = "" }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  ),
  ClipboardList: (props) => (
    <svg
      {...props}
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
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
      <path d="M12 11h4"></path>
      <path d="M12 16h4"></path>
      <path d="M8 11h.01"></path>
      <path d="M8 16h.01"></path>
    </svg>
  ),
  Loader2: (props) => (
    <svg
      {...props}
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
      <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
    </svg>
  ),
  CheckCircle2: (props) => (
    <svg
      {...props}
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
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
      <path d="m9 12 2 2 4-4"></path>
    </svg>
  ),
  List: (props) => (
    <svg
      {...props}
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
      <line x1="8" y1="6" x2="21" y2="6"></line>
      <line x1="8" y1="12" x2="21" y2="12"></line>
      <line x1="8" y1="18" x2="21" y2="18"></line>
      <line x1="3" y1="6" x2="3.01" y2="6"></line>
      <line x1="3" y1="12" x2="3.01" y2="12"></line>
      <line x1="3" y1="18" x2="3.01" y2="18"></line>
    </svg>
  ),
};

// --- DUMMY DATA ---
const dummyReports = [
  {
    id: "REP-VRR-001",
    issueType: "Water Logging",
    submittedBy: "Rohan Sharma",
    location: {
      lat: 19.4585,
      lng: 72.8095,
      address: "Near Virar Station (West)",
    },
    priority: "High",
    status: "Pending",
    submissionDate: "2025-09-06",
    description:
      "Heavy water logging after overnight rain, blocking the road to the station.",
    imageUrl: "https://placehold.co/400x300/3498db/ffffff?text=Water+Logging",
    assignedDept: "Municipal Corp.",
  },
  {
    id: "REP-VRR-002",
    issueType: "Garbage Collection",
    submittedBy: "Priya Desai",
    location: { lat: 19.4692, lng: 72.7911, address: "Global City, Sector 3" },
    priority: "Medium",
    status: "In Progress",
    submissionDate: "2025-09-05",
    description:
      "Community garbage bin has not been cleared for 4 days and is overflowing.",
    imageUrl:
      "https://placehold.co/400x300/f1c40f/ffffff?text=Garbage+Overflow",
    assignedDept: "Sanitation Dept.",
  },
  {
    id: "REP-VRR-003",
    issueType: "Broken Pavement",
    submittedBy: "Anil Mehta",
    location: {
      lat: 19.442,
      lng: 72.8235,
      address: "Manvelpada Road, Virar East",
    },
    priority: "Low",
    status: "Resolved",
    submissionDate: "2025-08-20",
    description:
      "Pavement blocks are broken near the bus stop, making it difficult for pedestrians.",
    imageUrl: "https://placehold.co/400x300/2ecc71/ffffff?text=Resolved",
    assignedDept: "Public Works",
  },
  {
    id: "REP-VRR-004",
    issueType: "Streetlight Out",
    submittedBy: "Sunita Patil",
    location: {
      lat: 19.4751,
      lng: 72.8018,
      address: "Bolinj, Nalasopara Link Road",
    },
    priority: "Medium",
    status: "Pending",
    submissionDate: "2025-09-06",
    description:
      "The main streetlight on the corner is not working, causing safety concerns at night.",
    imageUrl: "https://placehold.co/400x300/9b59b6/ffffff?text=Streetlight+Out",
    assignedDept: "Electrical Dept.",
  },
  {
    id: "REP-VRR-005",
    issueType: "Pothole",
    submittedBy: "Vikram Singh",
    location: { lat: 19.4298, lng: 72.8543, address: "Near Yazoo Park, Virar" },
    priority: "High",
    status: "In Progress",
    submissionDate: "2025-09-04",
    description:
      "A very large and deep pothole has formed on the main road leading to Yazoo Park.",
    imageUrl: "https://placehold.co/400x300/e74c3c/ffffff?text=Large+Pothole",
    assignedDept: "Public Works",
  },
  {
    id: "REP-VRR-006",
    issueType: "Pothole",
    submittedBy: "Aarav Kumar",
    location: { lat: 19.45, lng: 72.81, address: "Viva College Road" },
    priority: "Medium",
    status: "Pending",
    submissionDate: "2025-09-03",
    description: "Multiple potholes near the college entrance.",
    imageUrl: "https://placehold.co/400x300/e67e22/ffffff?text=College+Pothole",
    assignedDept: "Public Works",
  },
  {
    id: "REP-VRR-007",
    issueType: "Water Logging",
    submittedBy: "Meera Iyer",
    location: { lat: 19.4611, lng: 72.7955, address: "Yashwant Nagar" },
    priority: "High",
    status: "Pending",
    submissionDate: "2025-09-02",
    description: "Main crossroad is flooded, preventing vehicle movement.",
    imageUrl: "https://placehold.co/400x300/3498db/ffffff?text=Flooded+Road",
    assignedDept: "Municipal Corp.",
  },
];

// --- STYLING CONFIGS ---
const statusStyles = {
  Pending: "bg-blue-100 text-blue-800 ring-blue-600/20",
  "In Progress": "bg-purple-100 text-purple-800 ring-purple-600/20",
  Resolved: "bg-green-100 text-green-800 ring-green-600/20",
};
const priorityStyles = {
  High: "bg-red-100 text-red-800 ring-red-600/20",
  Medium: "bg-yellow-100 text-yellow-800 ring-yellow-600/20",
  Low: "bg-sky-100 text-sky-800 ring-sky-600/20",
};
const mapDotStyles = {
  High: "bg-red-500",
  Medium: "bg-yellow-500",
  Low: "bg-sky-500",
};

// --- HELPER COMPONENTS ---

const ReportModal = ({ report, onClose }) => {
  if (!report) return null;
  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-3xl relative animate-in fade-in-0 zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Report Details
              </h2>
              <p className="text-gray-500">{report.id}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-800 transition-colors"
            >
              &times;<span className="sr-only">Close</span>
            </button>
          </div>
          <div className="mt-4 flex flex-col md:flex-row gap-6">
            <img
              src={report.imageUrl}
              alt={report.issueType}
              className="w-full md:w-2/5 h-64 object-cover rounded-lg"
            />
            <div className="flex-1 space-y-3 text-sm">
              <p>
                <strong className="text-gray-600 font-medium">
                  Issue Type:
                </strong>{" "}
                <span className="text-gray-800">{report.issueType}</span>
              </p>
              <div className="flex items-center gap-2">
                <strong className="text-gray-600 font-medium">Status:</strong>{" "}
                <span
                  className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ring-1 ring-inset ${
                    statusStyles[report.status]
                  }`}
                >
                  {report.status}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <strong className="text-gray-600 font-medium">Priority:</strong>{" "}
                <span
                  className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ring-1 ring-inset ${
                    priorityStyles[report.priority]
                  }`}
                >
                  {report.priority}
                </span>
              </div>
              <p>
                <strong className="text-gray-600 font-medium">
                  Submitted By:
                </strong>{" "}
                <span className="text-gray-800">{report.submittedBy}</span>
              </p>
              <p>
                <strong className="text-gray-600 font-medium">Date:</strong>{" "}
                <span className="text-gray-800">
                  {new Date(report.submissionDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </p>
              <p>
                <strong className="text-gray-600 font-medium">
                  Assigned To:
                </strong>{" "}
                <span className="text-gray-800">{report.assignedDept}</span>
              </p>
              <a
                href={`https://maps.google.com/?q=${report.location.lat},${report.location.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:underline"
              >
                <icons.MapPin /> <span>{report.location.address}</span>
              </a>
              <p className="pt-2 text-base">
                <strong className="text-gray-600 font-medium text-sm block">
                  Description:
                </strong>{" "}
                <span className="text-gray-800">{report.description}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- NEW AESTHETIC ANALYTICS COMPONENTS ---

const EnhancedStatCard = ({ title, value, color, icon }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm flex items-center gap-5">
    <div className="p-3 rounded-full" style={{ backgroundColor: `${color}20` }}>
      {React.cloneElement(icon, { style: { color }, size: 22 })}
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
        {title}
      </h4>
    </div>
  </div>
);

const ReportsTimeChart = ({ reports }) => {
  const data = useMemo(() => {
    const today = new Date("2025-09-06T12:43:00");
    const pastWeekData = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      return {
        date: d.toISOString().split("T")[0],
        name: d.toLocaleDateString("en-IN", { weekday: "short" }),
        count: 0,
      };
    }).reverse();

    reports.forEach((report) => {
      const reportDate = report.submissionDate;
      const dayEntry = pastWeekData.find((d) => d.date === reportDate);
      if (dayEntry) {
        dayEntry.count++;
      }
    });
    return pastWeekData;
  }, [reports]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm h-full">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        New Reports This Week
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 12 }} />
            <YAxis
              allowDecimals={false}
              tick={{ fill: "#6b7280", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #ddd",
                borderRadius: "0.5rem",
              }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorReports)"
              strokeWidth={2}
              name="Reports"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const PriorityDistributionChart = ({ reports }) => {
  const data = useMemo(
    () => [
      {
        name: "High",
        value: reports.filter((r) => r.priority === "High").length,
      },
      {
        name: "Medium",
        value: reports.filter((r) => r.priority === "Medium").length,
      },
      {
        name: "Low",
        value: reports.filter((r) => r.priority === "Low").length,
      },
    ],
    [reports]
  );

  const COLORS = ["#ef4444", "#f59e0b", "#38bdf8"];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm h-full">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Priority Distribution
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              paddingAngle={5}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const AnalyticsDashboard = ({ analytics, reports }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-tight">
        Analytics & Insights
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-6">
          <EnhancedStatCard
            title="Pending"
            value={analytics.pending}
            color="#3b82f6"
            icon={<icons.Loader2 className="animate-spin" />}
          />
          <EnhancedStatCard
            title="In Progress"
            value={analytics.inProgress}
            color="#8b5cf6"
            icon={<icons.ClipboardList />}
          />
        </div>
        <div className="lg:col-span-1 xl:col-span-2">
          <ReportsTimeChart reports={reports} />
        </div>
        <div className="lg:col-span-1 xl:col-span-1">
          <PriorityDistributionChart reports={reports} />
        </div>
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
const ReportManagementPage = () => {
  const [reports, setReports] = useState(dummyReports);
  const [filters, setFilters] = useState({ status: "All", priority: "All" });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const handleStatusChange = (reportId, newStatus) => {
    setReports((currentReports) =>
      currentReports.map((report) =>
        report.id === reportId ? { ...report, status: newStatus } : report
      )
    );
  };
  const analytics = useMemo(
    () => ({
      total: reports.length,
      pending: reports.filter((r) => r.status === "Pending").length,
      inProgress: reports.filter((r) => r.status === "In Progress").length,
      resolved: reports.filter((r) => r.status === "Resolved").length,
    }),
    [reports]
  );
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        (filters.status === "All" || report.status === filters.status) &&
        (filters.priority === "All" || report.priority === filters.priority) &&
        (report.id.toLowerCase().includes(searchLower) ||
          report.issueType.toLowerCase().includes(searchLower) ||
          report.submittedBy.toLowerCase().includes(searchLower) ||
          report.location.address.toLowerCase().includes(searchLower))
      );
    });
  }, [reports, filters, searchTerm]);
  const getRelativeDate = (dateString) => {
    const today = new Date("2025-09-06T12:43:00");
    const reportDate = new Date(dateString);
    const diffTime = today - reportDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) - 1;
    if (diffDays <= 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  return (
    <div className="bg-gray-50/50 min-h-screen">
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Live Report Map
          </h3>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 relative border-2 border-dashed">
            <p>Interactive Map of Virar Area</p>
            <div className="absolute top-4 left-4 flex gap-2">
              {reports
                .filter((r) => r.status !== "Resolved")
                .map((report) => (
                  <span
                    key={report.id}
                    className={`w-3 h-3 rounded-full ${
                      mapDotStyles[report.priority]
                    } animate-pulse`}
                    title={`${report.issueType} at ${report.location.address}`}
                  ></span>
                ))}
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-5">
            <div className="relative w-full md:w-1/3">
              <icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by ID, issue, location..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <select
                name="status"
                value={filters.status}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, status: e.target.value }))
                }
                className="p-2 border border-gray-300 rounded-lg bg-white"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
              <select
                name="priority"
                value={filters.priority}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, priority: e.target.value }))
                }
                className="p-2 border border-gray-300 rounded-lg bg-white"
              >
                <option value="All">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                <tr>
                  <th scope="col" className="px-6 py-3 rounded-l-lg">
                    Report ID
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Issue
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Submitted
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Priority
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 rounded-r-lg">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr
                    key={report.id}
                    className="bg-white border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-gray-900">
                      {report.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">
                        {report.issueType}
                      </div>
                      <div className="text-xs text-gray-500">
                        {report.location.address}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getRelativeDate(report.submissionDate)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ring-1 ring-inset ${
                          priorityStyles[report.priority]
                        }`}
                      >
                        {report.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ring-1 ring-inset ${
                          statusStyles[report.status]
                        }`}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="font-medium text-blue-600 hover:underline whitespace-nowrap"
                        >
                          View
                        </button>
                        <select
                          value={report.status}
                          onChange={(e) =>
                            handleStatusChange(report.id, e.target.value)
                          }
                          className="text-xs p-1 border border-gray-300 rounded-md bg-white focus:ring-1 focus:ring-blue-500 w-full"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredReports.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-gray-500">
                      No reports found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <AnalyticsDashboard analytics={analytics} reports={reports} />
      </main>
      <ReportModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
      />
    </div>
  );
};

export default ReportManagementPage;
