import { useEffect, useState } from "react"

export default function PRDStatusDashboard() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch("http://localhost:8083/metrics/prd-status-counts")
      .then(res => res.json())
      .then(setData)
  }, [])

  if (!data) return null

  return (
    <div className="bg-white border rounded p-4 mb-8">
      <h2 className="text-xl font-semibold mb-2">📘 PRD Status Dashboard</h2>
      <ul className="text-sm text-gray-800 mb-4 space-y-1">
        {Object.entries(data.status_counts).map(([status, count]) => (
          <li key={status}>
            {status.charAt(0).toUpperCase() + status.slice(1)}: <strong>{count}</strong>
          </li>
        ))}
      </ul>
      <h3 className="text-sm font-semibold text-gray-600 mb-1">Recent Updates:</h3>
      <ul className="text-xs text-gray-700 space-y-1">
        {data.recent_prds.map((p, idx) => (
          <li key={idx}>
            <span className="font-medium">{p.title}</span> — <span>{p.status}</span> ·{" "}
            {new Date(p.updated_at).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  )
}