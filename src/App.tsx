import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ModalProvider } from './context/ModalContext';
import GlobalModal from './components/ui/GlobalModal';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/auth/Login';
import ServerList from './pages/servers/ServerList';
import IncidentList from './pages/incidents/IncidentList';
import IncidentDetail from './pages/incidents/IncidentDetail';
import SolutionList from './pages/solutions/SolutionList';
import SolutionForm from './pages/solutions/SolutionForm';
import ScriptList from './pages/scripts/ScriptList';
import Dashboard from './pages/dashboard/Dashboard';
import Reports from './pages/reports/Reports';
import Search from './pages/search/Search';
import Settings from './pages/settings/Settings';
import AuditLogList from './pages/audit/AuditLogList';
import MonitoringDashboard from './pages/monitoring/MonitoringDashboard';
import NotesDashboard from './pages/notes/NotesDashboard';
import { RemindersDashboard } from './pages/reminders/RemindersDashboard';
import { KnowledgeDashboard } from './pages/knowledge/KnowledgeDashboard';
import { JournalDashboard } from './pages/journal/JournalDashboard';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ModalProvider>
          <GlobalModal />
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="monitoring" element={<MonitoringDashboard />} />
              <Route path="notes" element={<NotesDashboard />} />
              <Route path="reminders" element={<RemindersDashboard />} />
              <Route path="knowledge" element={<KnowledgeDashboard />} />
              <Route path="journal" element={<JournalDashboard />} />
              <Route path="incidents" element={<IncidentList />} />
              <Route path="incidents/:id" element={<IncidentDetail />} />
              <Route path="servers" element={<ServerList />} />
              <Route path="solutions" element={<SolutionList />} />
              <Route path="solutions/new" element={<SolutionForm />} />
              <Route path="solutions/:id" element={<SolutionForm />} />
              <Route path="solutions/:id/edit" element={<SolutionForm />} />
              <Route path="scripts" element={<ScriptList />} />
              <Route path="reports" element={<Reports />} />
              <Route path="search" element={<Search />} />
              <Route path="settings" element={<Settings />} />
              <Route path="audit" element={<AuditLogList />} />
            </Route>
          </Routes>
        </ModalProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
