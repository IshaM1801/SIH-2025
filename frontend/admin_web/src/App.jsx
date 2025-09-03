import './App.css'
import Login from './pages/Login'
import VerificationPage from './pages/VerificationPage';
import Dashboard from './pages/Dashboard';
import IssuesPage from './pages/IssuesPage';
import ReportIssuePage from './pages/ReportIssuePage';
import {Routes, Route, Navigate} from 'react-router-dom'

// Protected Route Component
function AdminProtectedRoute({ children }) {
  const adminUser = localStorage.getItem("adminUser");
  return adminUser ? children : <Navigate to="/login" replace />;
}

function UserProtectedRoute({ children }) {
  const adminUser = localStorage.getItem("user");
  return adminUser ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/verify" element={<VerificationPage/>} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <AdminProtectedRoute>
            <Dashboard/>
          </AdminProtectedRoute>
        } />
        
        <Route path="/issues" element={
          <AdminProtectedRoute>
            <IssuesPage/>
          </AdminProtectedRoute>
        } />
        
        <Route path="/report-issue" element={
          <UserProtectedRoute>
            <ReportIssuePage/>
          </UserProtectedRoute>
        } />
        
        {/* Default redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  )
}

export default App