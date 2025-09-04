import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Search, Bell, Users, Shield, DollarSign, RefreshCw, HelpCircle, FileText,
  MapPin, Settings, MessageSquare, BookOpen, Award, Eye
} from 'lucide-react';
import DepartmentIssuesComponent from '@/components/ui/DepartmentIssues';

const Dashboard = () => {
  // Data for civic issue reporting system
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
        {/* Left Sidebar */}
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
          {/* Top Navbar */}
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
              
              <div className="flex flex-col xl:flex-row xl:items-center space-y-3 xl:space-y-0 xl:space-x-4 min-w-0">
                <select className="px-4 py-2 border border-gray-300 rounded-xl text-sm min-w-[160px] truncate">
                  <option>District Jamshoro</option>
                </select>
                
                <div className="hidden xl:flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-xl flex-shrink-0">
                  <span className="text-sm text-gray-600 whitespace-nowrap">Custom Date Range</span>
                </div>
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
            {/* KPI Cards Row */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 xl:gap-6 mb-8">
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

              <div className="col-span-1">
                <div className="bg-white rounded-2xl p-4 xl:p-6 shadow-sm border border-gray-100 h-36 xl:h-40 hover:shadow-md transition-shadow overflow-hidden">
                  <div className="flex items-center justify-between mb-3 xl:mb-4">
                    <MapPin className="w-6 xl:w-8 h-6 xl:h-8 text-green-500 flex-shrink-0" />
                  </div>
                  <div className="text-xl xl:text-2xl font-bold text-gray-900 mb-1 truncate">145</div>
                  <div className="text-xs xl:text-sm text-gray-500 mb-2 truncate">Active Hotspots</div>
                  <div className="text-xs text-green-500 truncate">+8.7% Since last month</div>
                </div>
              </div>

              <div className="col-span-1">
                <div className="bg-white rounded-2xl p-4 xl:p-6 shadow-sm border border-gray-100 h-36 xl:h-40 hover:shadow-md transition-shadow overflow-hidden">
                  <div className="flex items-center justify-between mb-3 xl:mb-4">
                    <DollarSign className="w-6 xl:w-8 h-6 xl:h-8 text-purple-500 flex-shrink-0" />
                  </div>
                  <div className="text-xl xl:text-2xl font-bold text-gray-900 mb-1 truncate">24.2H</div>
                  <div className="text-xs xl:text-sm text-gray-500 mb-2 truncate">Avg Response Time</div>
                  <div className="text-xs text-red-500 truncate">-15.2% Since last month</div>
                </div>
              </div>

              <div className="col-span-1">
                <div className="bg-white rounded-2xl p-4 xl:p-6 shadow-sm border border-gray-100 h-36 xl:h-40 hover:shadow-md transition-shadow overflow-hidden">
                  <div className="flex items-center justify-between mb-3 xl:mb-4">
                    <FileText className="w-6 xl:w-8 h-6 xl:h-8 text-blue-500 flex-shrink-0" />
                  </div>
                  <div className="text-xl xl:text-2xl font-bold text-gray-900 mb-1 truncate">5.9K</div>
                  <div className="text-xs xl:text-sm text-gray-500 mb-2 truncate">Total Reports</div>
                  <div className="text-xs text-green-500 truncate">+18.2% Since last month</div>
                </div>
              </div>

              <div className="col-span-1">
                <div className="bg-white rounded-2xl p-4 xl:p-6 shadow-sm border border-gray-100 h-36 xl:h-40 hover:shadow-md transition-shadow overflow-hidden">
                  <div className="flex items-center justify-between mb-3 xl:mb-4">
                    <HelpCircle className="w-6 xl:w-8 h-6 xl:h-8 text-orange-500 flex-shrink-0" />
                  </div>
                  <div className="text-xl xl:text-2xl font-bold text-gray-900 mb-1 truncate">3.2K</div>
                  <div className="text-xs xl:text-sm text-gray-500 mb-2 truncate">Reports Resolved</div>
                  <div className="text-xs text-orange-500 truncate">Downtown Area</div>
                </div>
              </div>

              <div className="col-span-1">
                <div className="bg-white rounded-2xl p-4 xl:p-6 shadow-sm border border-gray-100 h-36 xl:h-40 hover:shadow-md transition-shadow overflow-hidden">
                  <div className="flex items-center justify-between mb-3 xl:mb-4">
                    <Award className="w-6 xl:w-8 h-6 xl:h-8 text-gray-500 flex-shrink-0" />
                  </div>
                  <div className="text-xl xl:text-2xl font-bold text-gray-900 mb-1 truncate">87%</div>
                  <div className="text-xs xl:text-sm text-gray-500 mb-2 truncate">Resolution Rate</div>
                  <div className="text-xs text-green-500 truncate">+5.1% Since last month</div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <DepartmentIssuesComponent />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 xl:gap-8">
              
              {/* Map Section */}
              <div className="col-span-1">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-[400px] xl:h-[450px] hover:shadow-md transition-shadow overflow-hidden">
                  <h3 className="text-lg xl:text-xl font-semibold text-gray-900 mb-4 truncate">Issue Distribution Map</h3>
                  <div className="relative h-[320px] xl:h-[360px] bg-gradient-to-br from-blue-100 to-indigo-200 rounded-xl overflow-hidden">
                    {/* City Map with Issue Markers */}
                    <svg viewBox="0 0 400 300" className="w-full h-full">
                      <rect x="0" y="0" width="400" height="300" fill="#E0F2FE" />
                      {/* City blocks */}
                      <rect x="50" y="50" width="80" height="60" fill="#BAE6FD" stroke="#3B82F6" strokeWidth="1" />
                      <rect x="150" y="40" width="100" height="80" fill="#BAE6FD" stroke="#3B82F6" strokeWidth="1" />
                      <rect x="270" y="60" width="70" height="50" fill="#BAE6FD" stroke="#3B82F6" strokeWidth="1" />
                      <rect x="80" y="140" width="90" height="70" fill="#BAE6FD" stroke="#3B82F6" strokeWidth="1" />
                      <rect x="200" y="150" width="120" height="80" fill="#BAE6FD" stroke="#3B82F6" strokeWidth="1" />
                      
                      {/* Issue markers */}
                      <circle cx="90" cy="80" r="8" fill="#EF4444" stroke="#ffffff" strokeWidth="2" />
                      <circle cx="200" cy="70" r="6" fill="#F59E0B" stroke="#ffffff" strokeWidth="2" />
                      <circle cx="300" cy="85" r="5" fill="#10B981" stroke="#ffffff" strokeWidth="2" />
                      <circle cx="125" cy="175" r="7" fill="#EF4444" stroke="#ffffff" strokeWidth="2" />
                      <circle cx="260" cy="190" r="6" fill="#F59E0B" stroke="#ffffff" strokeWidth="2" />
                      <circle cx="150" cy="220" r="4" fill="#10B981" stroke="#ffffff" strokeWidth="2" />
                      
                      <text x="50" y="25" fill="#374151" fontSize="10" fontWeight="bold">Downtown</text>
                      <text x="270" y="25" fill="#374151" fontSize="10" fontWeight="bold">Residential</text>
                      <text x="200" y="280" fill="#374151" fontSize="10" fontWeight="bold">Industrial Zone</text>
                    </svg>
                    
                    {/* Legend */}
                    <div className="absolute bottom-4 left-4 bg-white rounded-lg p-3 shadow-lg">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <div className="flex items-center space-x-1 whitespace-nowrap">
                          <div className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0"></div>
                          <span>High</span>
                        </div>
                        <div className="flex items-center space-x-1 whitespace-nowrap">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full flex-shrink-0"></div>
                          <span>Medium</span>
                        </div>
                        <div className="flex items-center space-x-1 whitespace-nowrap">
                          <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                          <span>Low</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Issue Status Breakdown Donut Chart */}
              <div className="col-span-1">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-[400px] xl:h-[450px] hover:shadow-md transition-shadow">
                  <h3 className="text-lg xl:text-xl font-semibold text-gray-900 mb-4 truncate">Issue Status Breakdown</h3>
                  <div className="flex flex-row items-center justify-center h-[300px] xl:h-[350px] overflow-hidden">
                    <div className="relative mb-4 xl:mb-0 flex-shrink-0">
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
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl xl:text-3xl font-bold text-gray-900">5.9K</div>
                        </div>
                      </div>
                    </div>
                    <div className="xl:ml-8 space-y-4 min-w-0 flex-1 ml-50">
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xl font-semibold text-gray-900 truncate">3.2K</div>
                          <div className="text-lg text-gray-500 truncate">Resolved Issues</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xl font-semibold text-gray-900 truncate">1.9K</div>
                          <div className="text-lg text-gray-500 truncate">In Progress</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full flex-shrink-0"></div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xl font-semibold text-gray-900 truncate">0.8K</div>
                          <div className="text-lg text-gray-500 truncate">Pending</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reports by District Chart */}
              <div className="col-span-1">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-[400px] xl:h-[450px] hover:shadow-md transition-shadow overflow-hidden">
                  <h3 className="text-lg xl:text-xl font-semibold text-gray-900 mb-4 truncate">Monthly Reports by District</h3>
                  <div className="h-[320px] xl:h-[360px] overflow-hidden">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reportsByDistrictData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <XAxis 
                          dataKey="month" 
                          axisLine={false} 
                          tickLine={false} 
                          fontSize={12}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          fontSize={12}
                          tick={{ fontSize: 12 }}
                        />
                        <Bar dataKey="reports" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="resolved" fill="#93C5FD" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Department Response Time Chart */}
              <div className="col-span-1">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-[425px] xl:h-[450px] hover:shadow-md transition-shadow">
                  <div className="mb-4">
                    <h3 className="text-lg xl:text-xl font-semibold text-gray-900 truncate">Department Response Time</h3>
                    <p className="text-sm text-gray-500 truncate">Average time from report submission to first department response</p>
                  </div>
                  <div className="h-[280px] xl:h-[320px] overflow-hidden">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={responseTimeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <XAxis 
                          dataKey="month" 
                          axisLine={false} 
                          tickLine={false} 
                          fontSize={12}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          fontSize={12}
                          tick={{ fontSize: 12 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="hours" 
                          stroke="#3B82F6" 
                          strokeWidth={3}
                          dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 flex justify-center">
                    <div className="bg-gray-900 text-white px-3 py-1 rounded-lg text-sm">24H Avg</div>
                  </div>
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