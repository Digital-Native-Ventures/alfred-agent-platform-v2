import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

function App() {
  const [memory, setMemory] = useState([])

  useEffect(() => {
    fetch("http://localhost:8083/memory/list")
      .then(res => res.json())
      .then(setMemory)
  }, [])

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">🧠 Architect Memory Panel</h1>
        <Link to="/project" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          📦 Project Dashboard
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {memory.map(item => (
          <div key={item.id} className="bg-white shadow p-4 rounded border">
            <h2 className="text-xl font-semibold">{item.title}</h2>
            <p className="text-gray-600">{item.description}</p>
            <div className="mt-2 text-sm text-gray-500">
              <span className="mr-2">📌 {item.phase}</span>
              <span className="mr-2">📈 {item.status}</span>
              <span>🏷️ {item.type}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {item.tags?.map((tag, i) => (
                <span key={i} className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
