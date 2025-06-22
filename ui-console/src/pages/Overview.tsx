import { Activity, Bot, CheckCircle2, Clock, TrendingUp, Users } from "lucide-react";

export default function Overview() {
  const stats = [
    { label: "Active Agents", value: "12", icon: Bot, trend: "+2 this week", color: "blue" },
    { label: "Tasks Completed", value: "847", icon: CheckCircle2, trend: "+15% from last week", color: "green" },
    { label: "Avg Response Time", value: "1.2s", icon: Clock, trend: "-0.3s improvement", color: "purple" },
    { label: "Active Users", value: "34", icon: Users, trend: "+5 today", color: "orange" },
  ];

  const recentActivity = [
    { agent: "Data Processor", task: "Analyzed Q4 sales report", time: "2 minutes ago", status: "completed" },
    { agent: "Email Assistant", task: "Sent 15 follow-up emails", time: "10 minutes ago", status: "completed" },
    { agent: "Code Reviewer", task: "Reviewing PR #234", time: "15 minutes ago", status: "in-progress" },
    { agent: "Meeting Scheduler", task: "Scheduled 3 client meetings", time: "1 hour ago", status: "completed" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
        <p className="text-gray-600 mt-1">Monitor your AI agents and system performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, trend, color }) => (
          <div key={label} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${
                color === "blue" ? "bg-blue-50" : 
                color === "green" ? "bg-green-50" : 
                color === "purple" ? "bg-purple-50" : 
                "bg-orange-50"
              }`}>
                <Icon className={`w-6 h-6 ${
                  color === "blue" ? "text-blue-600" : 
                  color === "green" ? "text-green-600" : 
                  color === "purple" ? "text-purple-600" : 
                  "text-orange-600"
                }`} />
              </div>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            <p className="text-sm text-gray-600 mt-1">{label}</p>
            <p className="text-xs text-green-600 mt-2">{trend}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {recentActivity.map((activity, index) => (
            <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === "completed" ? "bg-green-500" : "bg-yellow-500"
                  }`} />
                  <div>
                    <p className="font-medium text-gray-900">{activity.agent}</p>
                    <p className="text-sm text-gray-600">{activity.task}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Chart Placeholder */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">System Performance</h2>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Performance chart will be displayed here</p>
        </div>
      </div>
    </div>
  );
}