import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import StudentProfile from './pages/StudentProfile';
import Sessions from './pages/Sessions';
import MarkAttendance from './pages/MarkAttendance';
import SessionDetail from './pages/SessionDetail';
import AttendanceHistory from './pages/AttendanceHistory';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import AuditLogs from './pages/AuditLogs';

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/students" element={<ProtectedRoute><Layout><Students /></Layout></ProtectedRoute>} />
        <Route path="/students/:id" element={<ProtectedRoute><Layout><StudentProfile /></Layout></ProtectedRoute>} />
        <Route path="/sessions" element={<ProtectedRoute><Layout><Sessions /></Layout></ProtectedRoute>} />
        <Route path="/sessions/:id" element={<ProtectedRoute><Layout><SessionDetail /></Layout></ProtectedRoute>} />
        <Route path="/sessions/:id/mark" element={<ProtectedRoute roles={['coordinator']}><Layout><MarkAttendance /></Layout></ProtectedRoute>} />
        <Route path="/attendance-history" element={<ProtectedRoute><Layout><AttendanceHistory /></Layout></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Layout><Reports /></Layout></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute roles={['coordinator']}><Layout><Notifications /></Layout></ProtectedRoute>} />
        <Route path="/audit-logs" element={<ProtectedRoute roles={['coordinator']}><Layout><AuditLogs /></Layout></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
