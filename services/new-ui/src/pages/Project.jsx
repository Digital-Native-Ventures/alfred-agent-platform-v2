import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

export default function ProjectDashboard() {
  const [projects, setProjects] = useState([])

  useEffect(() => {
    fetch("http://localhost:8083/sync/status")
      .then(res => res.json())
      .then(setProjects)
  }, [])

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">📦 Project State Overview</h1>
        <Link to="/" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
          🧠 Memory Panel
        </Link>
      </div>
      <div className="grid gap-4">
        {projects.length === 0 ? (
          <div className="bg-white border rounded shadow p-4 text-center text-gray-500">
            No project states found. The sync worker may be starting up or no memory items exist yet.
          </div>
        ) : (
          projects.map(p => (
            <div key={p.prd_id} className="bg-white border rounded shadow p-4">
              <h2 className="text-xl font-semibold">{p.title}</h2>
              <p className="text-gray-600 mb-2">Last Sync: {new Date(p.last_synced_at).toLocaleString()}</p>
              <div className="text-sm text-gray-700 space-y-1">
                <p>🧩 Issues: {p.planner_issues.length}</p>
                <p>🔍 PRs: {p.reviewer_prs.length}</p>
                <p>🧠 Errors: {p.sync_errors?.length || 0}</p>
                <p>📝 Summaries:</p>
                <ul className="list-disc ml-6 text-xs text-gray-600">
                  {p.summariser_logs?.map((s, i) => <li key={i}>{s}</li>) || <li>None</li>}
                </ul>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}