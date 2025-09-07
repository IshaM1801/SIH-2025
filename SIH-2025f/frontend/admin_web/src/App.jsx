import './App.css'
import Login from './pages/Login'
import VerificationPage from './pages/VerificationPage';
import Dashboard from './pages/Dashboard';
import IssuesPage from './pages/IssuesPage';
import UserReports from './pages/UserReports';
import ReportIssuePage from './pages/ReportIssuePage';
import UserAccount from './pages/UserAccount';
import Map from './pages/Map'; // Your page wrapper
import CertificatesPage from './pages/CertificatesPage'
import { Routes, Route, Navigate } from 'react-router-dom';

// Protected Route Components
function AdminProtectedRoute({ children }) {
  const adminUser = localStorage.getItem("adminUser");
  return adminUser ? children : <Navigate to="/login" replace />;
}

function UserProtectedRoute({ children }) {
  const user = localStorage.getItem("user");
  return user ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/verify" element={<VerificationPage/>} />
        <Route path="/certificates" element={<CertificatesPage/>} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <AdminProtectedRoute>
            <Dashboard />
          </AdminProtectedRoute>
        } />

        <Route path="/map" element={
          <AdminProtectedRoute>
            <Map/>
          </AdminProtectedRoute>
        } />
        
        <Route path="/issues" element={
          <UserProtectedRoute>
            <IssuesPage />
          </UserProtectedRoute>
        } />

        <Route path="/my-reports" element={
          <UserProtectedRoute>
            <UserReports/>
          </UserProtectedRoute>
        } />

        <Route path="/my-account" element={
          <UserProtectedRoute>
            <UserAccount/>
          </UserProtectedRoute>
        } />
        
        <Route path="/report-issue" element={
          <UserProtectedRoute>
            <ReportIssuePage />
          </UserProtectedRoute>
        }
        />

        {/* Default redirects */}
        <Route path="/" element={<Navigate to="/issues" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default App