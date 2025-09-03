import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Search, Bell, Users, Shield, DollarSign, RefreshCw, HelpCircle, FileText,
  MapPin, Settings, MessageSquare, BookOpen, Award, Eye
} from 'lucide-react';

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
    <div className="min-h-screen bg-white">
      <div className="flex h-screen">
        {/* Left Sidebar */}
        <div className="w-80 bg-gray-50 border-r border-gray-200">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <div className="w-6 h-6 bg-blue-600 rounded"></div>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
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
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Navbar */}
          <div className="h-20 border-b border-gray-200 flex items-center justify-between px-8">
            <h2 className="text-2xl font-bold text-gray-900">Civic Issue Management Dashboard</h2>
            
            <div className="flex items-center space-x-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <select className="px-4 py-2 border border-gray-300 rounded-xl text-sm">
                  <option>District Jamshoro</option>
                </select>
                
                <div className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-xl">
                  <span className="text-sm text-gray-600">Custom Date Range</span>
                </div>
              </div>
              
              <Bell className="w-6 h-6 text-gray-500 cursor-pointer" />
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">JA</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Jamshed Ahmed</div>
                  <div className="text-xs text-gray-500">Admin</div>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="flex-1 p-8 overflow-auto">
            <div className="grid grid-cols-12 gap-6">
              {/* KPI Cards Row */}
              <div className="col-span-2">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <Users className="w-8 h-8 text-blue-500" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">2.8K</div>
                  <div className="text-sm text-gray-500 mb-3">Active Citizens</div>
                  <div className="text-sm text-green-500">+12.3% Since last month</div>
                </div>
              </div>

              <div className="col-span-2">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <MapPin className="w-8 h-8 text-green-500" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">145</div>
                  <div className="text-sm text-gray-500 mb-3">Active Hotspots</div>
                  <div className="text-sm text-green-500">+8.7% Since last month</div>
                </div>
              </div>

              <div className="col-span-2">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <DollarSign className="w-8 h-8 text-purple-500" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">24.2H</div>
                  <div className="text-sm text-gray-500 mb-3">Avg Response Time</div>
                  <div className="text-sm text-red-500">-15.2% Since last month</div>
                </div>
              </div>

              {/* Map Section */}
              <div className="col-span-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Issue Distribution Map</h3>
                  <div className="relative h-64 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-xl overflow-hidden">
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
                      
                      <text x="50" y="25" fill="#374151" fontSize="12" fontWeight="bold">Downtown</text>
                      <text x="270" y="25" fill="#374151" fontSize="12" fontWeight="bold">Residential</text>
                      <text x="200" y="280" fill="#374151" fontSize="12" fontWeight="bold">Industrial Zone</text>
                    </svg>
                    
                    {/* Legend */}
                    <div className="absolute bottom-4 left-4 bg-white rounded-lg p-3 shadow-lg">
                      <div className="flex items-center space-x-4 text-xs">
                        <div className="flex items-center space-x-1">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span>High Priority</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <span>Medium</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span>Low</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Second Row of KPI Cards */}
              <div className="col-span-2">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <FileText className="w-8 h-8 text-blue-500" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">5.9K</div>
                  <div className="text-sm text-gray-500 mb-3">Total Reports Submitted</div>
                  <div className="text-sm text-green-500">+18.2% Since last month</div>
                </div>
              </div>

              <div className="col-span-2">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <HelpCircle className="w-8 h-8 text-orange-500" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">3.2K</div>
                  <div className="text-sm text-gray-500 mb-3">Reports Resolved</div>
                  <div className="text-sm text-orange-500">Downtown Area</div>
                </div>
              </div>

              <div className="col-span-2">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <Award className="w-8 h-8 text-gray-500" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">87%</div>
                  <div className="text-sm text-gray-500 mb-3">Resolution Rate</div>
                  <div className="text-sm text-green-500">+5.1% Since last month</div>
                </div>
              </div>
              

              {/* Issue Status Breakdown Donut Chart. */}
              <div className="col-span-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Issue Status Breakdown</h3>
                  <div className="flex items-center justify-center h-48">
                    <div className="relative">
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
                          <div className="text-3xl font-bold text-gray-900">5.9K</div>
                        </div>
                      </div>
                    </div>
                    <div className="ml-8 space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <div>
                          <div className="text-lg font-semibold text-gray-900">3.2K</div>
                          <div className="text-sm text-gray-500">Resolved Issues</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <div>
                          <div className="text-lg font-semibold text-gray-900">1.9K</div>
                          <div className="text-sm text-gray-500">In Progress</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div>
                          <div className="text-lg font-semibold text-gray-900">0.8K</div>
                          <div className="text-sm text-gray-500">Pending</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reports by District Chart */}
              <div className="col-span-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Reports by District</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={reportsByDistrictData}>
                      <XAxis dataKey="month" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Bar dataKey="reports" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="resolved" fill="#93C5FD" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Department Response Time Chart */}
              <div className="col-span-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Department Response Time</h3>
                    <p className="text-sm text-gray-500">Average time from report submission to first department response</p>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={responseTimeData}>
                      <XAxis dataKey="month" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Line 
                        type="monotone" 
                        dataKey="hours" 
                        stroke="#3B82F6" 
                        strokeWidth={3}
                        dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
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