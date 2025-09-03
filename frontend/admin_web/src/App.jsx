import './App.css'
import Login from './pages/Login'
import VerificationPage from './pages/VerificationPage';
import Dashboard from './pages/Dashboard';
import ReportIssuePage from './pages/ReportIssuePage';
import {Routes, Route, Navigate} from 'react-router-dom'

// Protected Route Component
function ProtectedRoute({ children }) {
  const adminUser = localStorage.getItem("adminUser");
  return adminUser ? children : <Navigate to="/login" replace />;
}

function App() {

  return (
    <>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/verify" element={<VerificationPage/>} />
      <Route path="/dashboard" element={<Dashboard/>} />
      <Route path="/report-issue" element={<ReportIssuePage/>} />
    </Routes>
    </>
  )
}

export default App
