import { useEffect, useState } from "react"

export default function SuggestedPRDs() {
  const [drafts, setDrafts] = useState([])

  useEffect(() => {
    fetch("http://localhost:8083/memory/suggested")
      .then(res => res.json())
      .then(setDrafts)
  }, [])

  const approve = (id, title, description) => {
    fetch("http://localhost:8083/control/submit-prd", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description })
    })
      .then(() => {
        return fetch("http://localhost:8083/memory/mark-approved", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prd_id: id })
        })
      })
      .then(() => {
        alert(`✅ "${title}" submitted and marked as approved.`)
        setDrafts(prev => prev.filter(d => d.id !== id))
      })
  }

  return (
    <div className="bg-white border rounded p-4 mt-8">
      <h2 className="text-xl font-semibold mb-2">📚 Suggested PRDs (AI-generated)</h2>
      {drafts.length === 0 && <p className="text-sm text-gray-500">No suggestions pending.</p>}
      <ul className="space-y-3">
        {drafts.map(d => (
          <li key={d.id} className="text-sm border rounded p-3">
            <h3 className="font-semibold mb-1">{d.title}</h3>
            <p className="text-gray-700 mb-1 whitespace-pre-wrap">{d.description}</p>
            <p className="text-xs text-gray-400">Suggested: {new Date(d.created_at).toLocaleString()}</p>
            <button
              onClick={() => approve(d.id, d.title, d.description)}
              className="bg-green-600 text-white mt-2 px-3 py-1 rounded text-xs"
            >
              ✅ Approve & Send to Planner
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}