import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./Layout";
import Home from "./pages/Home";
import ChatPage from "./pages/ChatPage";
import PlanPage from "./pages/PlanPage";
import Alerts from "./pages/Alerts";
import Overview from "./pages/Overview";
import Projects from "./pages/Projects";
import ProjectPlan from "./pages/ProjectPlan";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/overview" replace />} />
          <Route path="/overview" element={<Overview />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id/plan" element={<ProjectPlan />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/plan/:id" element={<PlanPage />} />
          <Route path="/alerts" element={<Alerts />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}