import { Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import TasksPage from './pages/TasksPage';
import ProjectsPage from './pages/ProjectsPage';
import CalendarPage from './pages/CalendarPage';
import GanttPage from './pages/GanttPage';
import TeamPage from './pages/TeamPage';
import MemberPage from './pages/MemberPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ChatPage from './pages/ChatPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/tasks" replace />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="gantt" element={<GanttPage />} />
        <Route path="team" element={<TeamPage />} />
        <Route path="team/:member" element={<MemberPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="chat" element={<ChatPage />} />
      </Route>
    </Routes>
  );
}
