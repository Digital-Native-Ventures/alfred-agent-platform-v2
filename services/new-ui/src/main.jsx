import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import App from './App.jsx'
import ProjectDashboard from './pages/Project.jsx'
import ControlPanel from './pages/Control.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <div className="bg-gray-900 text-white p-4 flex gap-6 text-sm">
      <Link to="/">📚 Memory</Link>
      <Link to="/project">📦 Project</Link>
      <Link to="/control">🛠️ Control</Link>
    </div>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/project" element={<ProjectDashboard />} />
      <Route path="/control" element={<ControlPanel />} />
    </Routes>
  </BrowserRouter>
)
