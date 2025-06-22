import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./Layout";
import Overview from "./pages/Overview";
import Projects from "./pages/Projects";
import Chat from "./pages/Chat";
import ChatPanel from "./modules/chat/ChatPanel";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/overview" replace />} />
          <Route path="/overview" element={<Overview />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/architect" element={<ChatPanel />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}