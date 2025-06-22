import { useEffect, useState } from "react"

export default function ApprovalMetrics() {
  const [metrics, setMetrics] = useState(null)

  useEffect(() => {
    fetch("http://localhost:8083/metrics/prd-approvals")
      .then(res => res.json())
      .then(setMetrics)
  }, [])

  if (!metrics) return null

  return (
    <div className="bg-white border rounded p-4 mb-8">
      <h2 className="text-xl font-semibold mb-2">📊 PRD Approval Metrics</h2>
      <ul className="text-sm text-gray-800 mb-4 space-y-1">
        <li>Total AI PRDs: <strong>{metrics.total_auto_prds}</strong></li>
        <li>Approved: <strong>{metrics.approved_count}</strong></li>
        <li>Approval Rate: <strong>{metrics.approval_rate}%</strong></li>
      </ul>
      <h3 className="text-sm font-semibold text-gray-600 mb-1">Recent Activity:</h3>
      <ul className="text-xs text-gray-700 space-y-1">
        {metrics.recent_activity.map((r, idx) => (
          <li key={idx}>
            <span className="font-medium">{r.title}</span> — <span>{r.status}</span> ·{" "}
            {new Date(r.created_at).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  )
}