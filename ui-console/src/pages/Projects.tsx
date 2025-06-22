import { Plus, Search, Folder, Clock, MoreVertical } from "lucide-react";

export default function Projects() {
  const projects = [
    {
      id: 1,
      name: "Customer Service Bot",
      description: "Automated customer support agent handling tier-1 queries",
      status: "active",
      lastActive: "2 hours ago",
      tasksCompleted: 234,
      successRate: "94%",
    },
    {
      id: 2,
      name: "Data Analysis Pipeline",
      description: "Processes and analyzes sales data from multiple sources",
      status: "active",
      lastActive: "5 minutes ago",
      tasksCompleted: 89,
      successRate: "98%",
    },
    {
      id: 3,
      name: "Content Generator",
      description: "Creates blog posts and social media content",
      status: "paused",
      lastActive: "1 day ago",
      tasksCompleted: 156,
      successRate: "87%",
    },
    {
      id: 4,
      name: "Code Review Assistant",
      description: "Automated code review and suggestions for PRs",
      status: "active",
      lastActive: "30 minutes ago",
      tasksCompleted: 412,
      successRate: "91%",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-1">Manage your AI agent projects and workflows</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow">
          <Plus size={20} />
          <span>New Project</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search projects..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Status</option>
            <option>Active</option>
            <option>Paused</option>
            <option>Archived</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <div key={project.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Folder className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{project.name}</h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                      project.status === "active" 
                        ? "bg-green-100 text-green-700" 
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {project.status}
                    </span>
                  </div>
                </div>
                <button className="p-1 hover:bg-gray-100 rounded-lg">
                  <MoreVertical size={16} className="text-gray-400" />
                </button>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">{project.description}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Tasks Completed</span>
                  <span className="font-medium text-gray-900">{project.tasksCompleted}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Success Rate</span>
                  <span className="font-medium text-green-600">{project.successRate}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 mt-3">
                  <Clock size={14} />
                  <span className="text-xs">{project.lastActive}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}