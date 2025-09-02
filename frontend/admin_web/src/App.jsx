import './App.css'
import Login from './pages/Login'
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
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <div className="p-8">
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p>Welcome to the admin panel!</p>
            </div>
          </ProtectedRoute>
        } />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
    </>
  )
}

export default App
