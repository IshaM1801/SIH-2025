import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";

// --- ENHANCED INLINE SVG ICONS ---
const icons = {
  MapPin: ({ className = "h-4 w-4" }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="16"
      height="16"
      className={className}
    >
      <defs>
        <linearGradient id="grad-pin" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#A5B4FC" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
      </defs>
      <path
        d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
        fill="url(#grad-pin)"
      />
      <circle cx="12" cy="10" r="3" fill="#fff" />
    </svg>
  ),
  Search: ({ className = "h-5 w-5" }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
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
  ChevronDown: ({ className = "h-5 w-5" }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 50 50"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  ),

  X: ({ className = "h-6 w-6" }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  ),

  Users: ({ className = "h-4 w-4" }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
      />
    </svg>
  ),
};

// --- STYLES ---
const statusStyles = {
  pending: "bg-blue-100 text-center text-blue-800 ring-blue-600/20",
  "In Progress": "bg-purple-100 text-center text-purple-800 ring-purple-600/20",
  resolved: "bg-green-100 text-center text-green-800 ring-green-600/20",
};

// --- Custom Dropdown Component ---
const CustomSelect = ({ options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value]
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (selectedValue) => {
    onChange(selectedValue);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={selectRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center w-30 bg-white text-sm border border-gray-300 rounded-lg py-2 pl-4 pr-1  cursor-pointer "
      >
        <span>{selectedOption?.label || "Select..."}</span>
        {/* <icons.ChevronDown
          className={`text-gray-400  transition-transform duration-200 ${
            isOpen ? "transform rotate-180" : ""
          }`}
        /> */}
      </button>
      {isOpen && (
        <div className="absolute z-10 top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 cursor-pointer"
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Issue Detail Modal Component ---
const IssueDetailModal = ({ issue, onClose }) => {
  if (!issue) return null;

  return (
    <div
      className="fixed inset-0 bg-gray-900/20 z-50 flex justify-center items-center p-4 animate-in fade-in-0 duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              {issue.issue_title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <icons.X />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <span
              className={`px-3 py-1 text-xs font-medium rounded-full ${
                statusStyles[issue.status]
              }`}
            >
              {issue.status}
            </span>

            {/* Show all assigned employees */}
            {issue.assignedEmployees && issue.assignedEmployees.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {issue.assignedEmployees.map((emp, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700"
                  >
                    {emp}
                  </span>
                ))}
              </div>
            ) : (
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                Unassigned
              </span>
            )}
          </div>

          <p className="text-gray-600 mb-6">{issue.issue_description}</p>

          {issue.image_url && (
            <div className="mb-6">
              <img
                src={issue.image_url}
                alt="Issue"
                className="rounded-lg w-full object-cover max-h-80"
              />
            </div>
          )}

          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <icons.MapPin className="text-indigo-500" />
              <span>{issue.address_component}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReportManagementPage = () => {
  const token = localStorage.getItem("employee_token");
  const [issues, setIssues] = useState([]);
  const [team, setTeam] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ status: "All" });
  const [reassigningIssue, setReassigningIssue] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);

  // --- Fetch all necessary data ---
  const fetchAllData = useCallback(async () => {
    try {
      if (!token) {
        if (isInitialLoading) setIsInitialLoading(false);
        return;
      }

      const [issuesRes, teamRes] = await Promise.all([
        fetch("http://localhost:5001/issues/dept", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:5001/employee/team", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!issuesRes.ok)
        throw new Error(`Issues fetch error: ${issuesRes.status}`);
      if (!teamRes.ok) throw new Error(`Team fetch error: ${teamRes.status}`);

      const issuesData = await issuesRes.json();
      const teamData = await teamRes.json();

      // Fixed logic to handle multiple employee assignments per issue
      const issueMap = {};

      issuesData.team.forEach((member) => {
        (member.issues || []).forEach((issue) => {
          if (!issueMap[issue.issue_id]) {
            issueMap[issue.issue_id] = {
              ...issue,
              assignedEmployees: [],
            };
          }

          // Add employee name to the assignedEmployees array if not "unassigned"
          if (member.emp_email !== "unassigned" && member.name) {
            if (
              !issueMap[issue.issue_id].assignedEmployees.includes(member.name)
            ) {
              issueMap[issue.issue_id].assignedEmployees.push(member.name);
            }
          }
        });
      });

      // Convert to array and add backward compatibility
      const uniqueIssues = Object.values(issueMap).map((issue) => ({
        ...issue,
        // Keep emp_name for backward compatibility (shows first assigned employee)
        emp_name:
          issue.assignedEmployees.length > 0
            ? issue.assignedEmployees[0]
            : null,
      }));

      setIssues(uniqueIssues);
      setTeam(teamData.employees || []);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      if (isInitialLoading) {
        setIsInitialLoading(false);
      }
    }
  }, [token, isInitialLoading]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // --- API Actions ---
  const assignIssue = async (issueId, emp_email) => {
    try {
      if (!token) return;
      await fetch("http://localhost:5001/issues/assign-issue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ issueId, emp_email }),
      });
      await fetchAllData();
      setReassigningIssue(null);
    } catch (err) {
      console.error("Error assigning issue:", err);
    }
  };

  const updateStatus = async (issueId, newStatus) => {
    try {
      if (!token) return;
      await fetch(`http://localhost:5001/issues/update-status/${issueId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      await fetchAllData();
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  // --- Filtering Logic ---
  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const searchLower = searchTerm.toLowerCase();
      const searchMatch =
        issue.issue_title.toLowerCase().includes(searchLower) ||
        (issue.address_component || "").toLowerCase().includes(searchLower);
      const statusMatch =
        filters.status === "All" || issue.status === filters.status;
      return searchMatch && statusMatch;
    });
  }, [issues, filters, searchTerm]);

  // --- Date Formatting ---
  const getRelativeDate = (dateString) => {
    if (!dateString) return "Invalid date";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reportDate = new Date(dateString);
    reportDate.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - reportDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  // --- Sub-components ---
  // const PageHeader = () => (
  //   <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
  //     <h1 className="text-3xl font-bold text-gray-800">
  //       Civic Issue Management
  //     </h1>
  //     <div className="flex items-center gap-4">
  //       <button className="text-gray-500 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors">
  //         {" "}
  //         <icons.Bell />{" "}
  //       </button>
  //       <button className="flex items-center gap-2 text-gray-500 hover:text-gray-800">
  //         {" "}
  //         <icons.Logout /> <span>Logout</span>{" "}
  //       </button>
  //       <div className="flex items-center gap-3">
  //         <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
  //           NA
  //         </div>
  //         <div>
  //           <div className="font-semibold text-gray-800">Naman</div>
  //           <div className="text-sm text-gray-500">water</div>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );

  const ReportItem = ({ report }) => (
    <li
      className="px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-gray-50/70 transition-colors duration-200 cursor-pointer"
      onClick={() => setSelectedIssue(report)}
    >
      <div className="flex-grow">
        <h4 className="text-lg font-semibold text-gray-900">
          {report.issue_title}
        </h4>
        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
          <icons.MapPin className="text-indigo-500" />
          <span>{report.address_component}</span>
        </div>
      </div>
      <div
        className="flex items-center gap-4 flex-shrink-0 w-full sm:w-auto justify-end"
        onClick={(e) => e.stopPropagation()}
      >
        <select
          value={report.status}
          onChange={(e) => updateStatus(report.issue_id, e.target.value)}
          className={`text-xs font-semibold py-1.5 px-3 rounded-full  appearance-none cursor-pointer ring-1 ${
            statusStyles[report.status]
          }`}
        >
          <option value="pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>

        {/* Enhanced assignment display to show multiple employees */}
        {report.assignedEmployees && report.assignedEmployees.length > 0 ? (
          reassigningIssue === report.issue_id ? (
            <select
              onChange={(e) => assignIssue(report.issue_id, e.target.value)}
              className="text-xs border rounded-full py-1.5 px-2  bg-gray-50 hover:bg-gray-100 cursor-pointer"
              defaultValue=""
            >
              <option value="" disabled>
                Assign to...
              </option>
              {team.map((emp) => (
                <option key={emp.emp_email} value={emp.emp_email}>
                  {emp.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {/* <icons.Users className="text-gray-500" /> */}
                <span className="text-xs font-medium py-1.5 px-3 rounded-full bg-gray-100 text-gray-800 ring-1 ring-gray-200">
                  {report.assignedEmployees.length === 1
                    ? report.assignedEmployees[0]
                    : `${report.assignedEmployees.length} employees assigned`}
                </span>
              </div>
              <button
                onClick={() => setReassigningIssue(report.issue_id)}
                className="text-xs font-semibold text-white bg-indigo-500 hover:bg-indigo-600 rounded-full px-4 py-1.5 transition-colors"
              >
                + Assign
              </button>
            </div>
          )
        ) : (
          <select
            onChange={(e) => assignIssue(report.issue_id, e.target.value)}
            className="text-xs border rounded-full py-1.5 px-2  bg-gray-50 hover:bg-gray-100 cursor-pointer"
            defaultValue=""
          >
            <option value="" disabled>
              Assign to
            </option>
            {team.map((emp) => (
              <option key={emp.emp_email} value={emp.emp_email}>
                {emp.name}
              </option>
            ))}
          </select>
        )}
        <span className="text-xs text-gray-500 w-24 text-right">
          {getRelativeDate(report.created_at)}
        </span>
      </div>
    </li>
  );

  const ReportsHeader = () => {
    const statusOptions = [
      { value: "All", label: "All Statuses" },
      { value: "pending", label: "Pending" },
      { value: "In Progress", label: "In Progress" },
      { value: "resolved", label: "Resolved" },
    ];

    return (
      <div className="p-6 flex flex-col md:flex-row gap-4 justify-between items-center border-b border-gray-200">
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <icons.Search className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg "
          />
        </div>
        <div className="w-full md:w-auto min-w-[200px]">
          <CustomSelect
            options={statusOptions}
            value={filters.status}
            onChange={(status) => setFilters({ status })}
          />
        </div>
      </div>
    );
  };

  // --- Main Render ---
  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-screen-xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <ReportsHeader />
          {isInitialLoading ? (
            <div className="text-center py-20">
              <p className="text-gray-500 mt-3">Loading reports...</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredIssues.length > 0 ? (
                filteredIssues.map((report) => (
                  <ReportItem key={report.issue_id} report={report} />
                ))
              ) : (
                <li className="text-center py-16 text-gray-500">
                  No reports found.
                </li>
              )}
            </ul>
          )}
        </div>
        <IssueDetailModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
        />
      </div>
    </div>
  );
};

export default ReportManagementPage;
