import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Search, Bell, Users, Shield, DollarSign, RefreshCw, HelpCircle, FileText,
  MapPin, Settings, MessageSquare, BookOpen, Award
} from 'lucide-react';

const Dashboard = () => {
  const [deptIssues, setDeptIssues] = useState(null);

  useEffect(() => {
    const fetchDeptIssues = async () => {
      try {
        const token = localStorage.getItem("employee_token"); // Make sure token exists
        if (!token) {
          console.error("No token found in localStorage");
          return;
        }

        const response = await fetch("http://localhost:5001/issues/dept", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.status === 401) {
          console.error("Unauthorized! Token invalid or expired.");
        } else {
          setDeptIssues(data);
          console.log("Department Issues:", data);
        }
      } catch (err) {
        console.error("Error fetching department issues:", err);
      }
    };

    fetchDeptIssues();
  }, []);

  // Static Dashboard Data
  const reportsByDistrictData = [
    { month: 'Jan', reports: 185, resolved: 152 },
    { month: 'Feb', reports: 220, resolved: 198 },
    { month: 'Mar', reports: 245, resolved: 201 },
    { month: 'Apr', reports: 312, resolved: 267 },
    { month: 'May', reports: 298, resolved: 243 },
    { month: 'Jun', reports: 267, resolved: 234 },
    { month: 'Jul', reports: 189, resolved: 167 },
    { month: 'Aug', reports: 156, resolved: 142 },
    { month: 'Sep', reports: 278, resolved: 251 },
    { month: 'Oct', reports: 301, resolved: 276 },
    { month: 'Nov', reports: 234, resolved: 209 },
    { month: 'Dec', reports: 198, resolved: 178 }
  ];

  const responseTimeData = [
    { month: 'Jan', hours: 48 },
    { month: 'Feb', hours: 36 },
    { month: 'Mar', hours: 42 },
    { month: 'Apr', hours: 28 },
    { month: 'May', hours: 32 },
    { month: 'Jun', hours: 24 },
    { month: 'Jul', hours: 31 },
    { month: 'Aug', hours: 26 },
    { month: 'Sep', hours: 29 },
    { month: 'Oct', hours: 22 },
    { month: 'Nov', hours: 25 },
    { month: 'Dec', hours: 28 }
  ];

  const issueStatusData = [
    { name: 'Resolved', value: 3247, color: '#10B981' },
    { name: 'In Progress', value: 1853, color: '#3B82F6' },
    { name: 'Pending', value: 892, color: '#F59E0B' }
  ];

  const sidebarItems = [
    { icon: FileText, label: 'Report Management', active: false },
    { icon: Users, label: 'Citizen & Department Management', active: false },
    { icon: BarChart, label: 'KPI Dashboard & Analytics', active: true },
    { icon: Settings, label: 'Issue Categories Setup', active: false },
    { icon: Users, label: 'Department Assignment', active: false },
    { icon: RefreshCw, label: 'Task Routing Module', active: false },
    { icon: Shield, label: 'Escalation Management', active: false },
    { icon: BookOpen, label: 'Performance Monitoring', active: false },
    { icon: MessageSquare, label: 'Citizen Communication', active: false }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0 shadow-sm">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-8 mt-5">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <div className="w-6 h-6 bg-blue-600 rounded"></div>
              </div>
              <h1 className="text-xl font-semibold text-gray-900 truncate">Dashboard</h1>
            </div>
            <nav className="space-y-2">
              {sidebarItems.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl cursor-pointer transition-colors ${
                    item.active 
                      ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium truncate min-w-0">{item.label}</span>
                </div>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Navbar */}
          <div className="bg-white border-b border-gray-200 flex flex-col xl:flex-row xl:items-center xl:justify-between px-4 xl:px-8 py-4 xl:py-6 shadow-sm">
            <h2 className="text-xl xl:text-2xl font-bold text-gray-900 mb-4 xl:mb-0 truncate min-w-0">
              Civic Issue Management Dashboard
            </h2>
            <div className="flex flex-col xl:flex-row xl:items-center space-y-4 xl:space-y-0 xl:space-x-6 min-w-0">
              <div className="relative flex-shrink-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  className="pl-10 pr-4 py-2 w-full xl:w-64 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center space-x-4 flex-shrink-0">
                <Bell className="w-6 h-6 text-gray-500 cursor-pointer hover:text-gray-700 transition-colors" />
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-semibold">JA</span>
                  </div>
                  <div className="hidden xl:block min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">Jamshed Ahmed</div>
                    <div className="text-xs text-gray-500 truncate">Admin</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="flex-1 p-4 xl:p-8 overflow-x-hidden overflow-y-auto bg-gray-50">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 xl:gap-6 mb-8">
              {/* Example Card */}
              <div className="col-span-1">
                <div className="bg-white rounded-2xl p-4 xl:p-6 shadow-sm border border-gray-100 h-36 xl:h-40 hover:shadow-md transition-shadow overflow-hidden">
                  <div className="flex items-center justify-between mb-3 xl:mb-4">
                    <Users className="w-6 xl:w-8 h-6 xl:h-8 text-blue-500 flex-shrink-0" />
                  </div>
                  <div className="text-xl xl:text-2xl font-bold text-gray-900 mb-1 truncate">2.8K</div>
                  <div className="text-xs xl:text-sm text-gray-500 mb-2 truncate">Active Citizens</div>
                  <div className="text-xs text-green-500 truncate">+12.3% Since last month</div>
                </div>
              </div>
              {/* Add other cards similarly */}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 xl:gap-8">
              {/* Issue Status Donut Chart */}
              <div className="col-span-1">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-[400px] xl:h-[450px] hover:shadow-md transition-shadow">
                  <h3 className="text-lg xl:text-xl font-semibold text-gray-900 mb-4 truncate">Issue Status Breakdown</h3>
                  <PieChart width={200} height={200}>
                    <Pie
                      data={issueStatusData}
                      cx={100}
                      cy={100}
                      innerRadius={60}
                      outerRadius={90}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {issueStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </div>
              </div>

              {/* Reports by District */}
              <div className="col-span-1">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-[400px] xl:h-[450px] hover:shadow-md transition-shadow overflow-hidden">
                  <h3 className="text-lg xl:text-xl font-semibold text-gray-900 mb-4 truncate">Monthly Reports by District</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportsByDistrictData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={12} />
                      <YAxis axisLine={false} tickLine={false} fontSize={12} />
                      <Bar dataKey="reports" fill="#3B82F6" radius={[4,4,0,0]} />
                      <Bar dataKey="resolved" fill="#93C5FD" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;