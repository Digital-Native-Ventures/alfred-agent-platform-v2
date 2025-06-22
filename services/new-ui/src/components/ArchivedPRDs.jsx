import { useEffect, useState } from "react"

export default function ArchivedPRDs() {
  const [items, setItems] = useState([])

  useEffect(() => {
    fetch("http://localhost:8083/memory/archived")
      .then(res => res.json())
      .then(setItems)
  }, [])

  const revive = (id) => {
    fetch("http://localhost:8083/memory/revive-prd", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prd_id: id })
    }).then(() => {
      setItems(prev => prev.filter(p => p.id !== id))
      alert("✅ PRD revived to suggested")
    })
  }

  return (
    <div className="bg-white border rounded p-4 mt-8">
      <h2 className="text-xl font-semibold mb-2">🗂️ Archived PRDs</h2>
      {items.length === 0 && <p className="text-sm text-gray-500">No archived PRDs.</p>}
      <ul className="text-sm space-y-3">
        {items.map(p => (
          <li key={p.id} className="border rounded p-3">
            <h3 className="font-semibold mb-1">{p.title}</h3>
            <p className="text-gray-600 whitespace-pre-wrap mb-1">{p.description}</p>
            <p className="text-xs text-gray-400">Archived on: {new Date(p.updated_at).toLocaleString()}</p>
            <button
              onClick={() => revive(p.id)}
              className="mt-1 bg-yellow-500 text-white text-xs px-3 py-1 rounded"
            >
              ♻️ Revive PRD
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}