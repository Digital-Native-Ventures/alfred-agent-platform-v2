import PRDStatusDashboard from '../components/PRDStatusDashboard';
import ApprovalMetrics from '../components/ApprovalMetrics';
import SuggestedPRDs from '../components/SuggestedPRDs';
import ArchivedPRDs from '../components/ArchivedPRDs';
import { useEffect, useState } from "react"

export default function ControlPanel() {
  const [projects, setProjects] = useState([])
  const [logs, setLogs] = useState("")
  const [nextPRD, setNextPRD] = useState("")
  const [title, setTitle] = useState("")
  const [desc, setDesc] = useState("")
  const [report, setReport] = useState("")
  const [slackStatus, setSlackStatus] = useState("")

  const fetchState = () =>
    fetch("http://localhost:8083/sync/status")
      .then(res => res.json())
      .then(setProjects)

  const reflect = () =>
    fetch("http://localhost:8083/reflect")
      .then(res => res.json())
      .then(data => setLogs(data.summary))

  const nextPrd = () =>
    fetch("http://localhost:8083/next-prd")
      .then(res => res.json())
      .then(data => {
        setNextPRD(data.next_prd)
        const [first, ...rest] = data.next_prd.split(" - ")
        setTitle(first || "")
        setDesc(rest.join(" - ").trim())
      })

  const generateReport = () =>
    fetch("http://localhost:8083/report")
      .then(res => res.json())
      .then(data => setReport(data.report))

  const postToSlack = () =>
    fetch("/run/push-report", { method: "POST" })
      .then(() => setSlackStatus("✅ Report posted to Slack."))
      .catch(() => setSlackStatus("❌ Failed to post report."))

  const submitToPlanner = () =>
    fetch("http://localhost:8083/control/submit-prd", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description: desc })
    })
      .then(res => res.json())
      .then(data => alert(`✅ Sent to Planner → ${JSON.stringify(data.planner_response)}`))

  const post = (path, prd_id, title) =>
    fetch(`http://localhost:8083/control/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prd_id, title }),
    })
      .then(res => res.json())
      .then(data => alert(`✅ ${path} → ${data.message || "ok"}`))

  useEffect(() => {
    fetchState()
  }, [])

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">🛠️ Manual Agent Control</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        <button onClick={reflect} className="bg-blue-600 text-white px-4 py-2 rounded">
          🔍 Run Reflect
        </button>
        <button onClick={nextPrd} className="bg-teal-600 text-white px-4 py-2 rounded">
          🎯 Suggest Next PRD
        </button>
        <button onClick={generateReport} className="bg-gray-800 text-white px-4 py-2 rounded">
          📄 Generate Report
        </button>
        <button onClick={postToSlack} className="bg-pink-600 text-white px-4 py-2 rounded">
          📤 Post Report to Slack
        </button>
        {slackStatus && <p className="text-sm mt-1 text-gray-700">{slackStatus}</p>}
      </div>

      {logs && (
        <pre className="bg-white border rounded p-4 text-sm whitespace-pre-wrap mb-6">
          {logs}
        </pre>
      )}

      {nextPRD && (
        <div className="bg-white border rounded p-4 mb-6 space-y-2">
          <h2 className="text-lg font-semibold">🎯 Suggested Next PRD</h2>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="border p-1 rounded w-full text-sm"
            placeholder="PRD Title"
          />
          <textarea
            value={desc}
            onChange={e => setDesc(e.target.value)}
            className="border p-1 rounded w-full text-sm"
            placeholder="PRD Description"
            rows={3}
          />
          <button
            onClick={submitToPlanner}
            className="bg-green-600 text-white px-3 py-2 rounded text-sm"
          >
            🚀 Send to Planner
          </button>
        </div>
      )}

      {report && (
        <div className="bg-white border rounded p-4 mb-6 text-sm whitespace-pre-wrap">
          <h2 className="text-lg font-semibold mb-2">📄 Project Report</h2>
          {report}
        </div>
      )}

      <div className="grid gap-4">
        {projects.map(p => (
          <div key={p.prd_id} className="bg-white shadow p-4 rounded border">
            <h2 className="text-lg font-bold">{p.title}</h2>
            <p className="text-gray-600">Last Sync: {new Date(p.last_synced_at).toLocaleString()}</p>
            <p className="text-sm text-red-500">
              {p.sync_errors?.length ? `⚠️ ${p.sync_errors.join(", ")}` : "✅ No errors"}
            </p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => post("retry-planner", p.prd_id, p.title)}
                className="bg-yellow-500 text-white px-3 py-1 rounded text-sm"
              >
                🔁 Retry Planner
              </button>
              <button
                onClick={() => post("retry-reviewer", p.prd_id, p.title)}
                className="bg-indigo-500 text-white px-3 py-1 rounded text-sm"
              >
                🔁 Retry Reviewer
              </button>
              <button
                onClick={() => post("mark-complete", p.prd_id, p.title)}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm"
              >
                ✅ Mark Complete
              </button>
            </div>
          </div>
        ))}
      </div>
      <PRDStatusDashboard />
      <ApprovalMetrics />
      <SuggestedPRDs />
      <ArchivedPRDs />
    </div>
  )
}