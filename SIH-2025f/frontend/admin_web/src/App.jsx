// App.jsx
import "./App.css";
import Login from "./pages/Login";
import VerificationPage from "./pages/VerificationPage";
import IssuesPage from "./pages/IssuesPage";
import UserReports from "./pages/UserReports";
import ReportIssuePage from "./pages/ReportIssuePage";
import ReportManagement from "./pages/ReportManagement";
import CitizenManagement from "./pages/CitizenManagement";
import IssueCategories from "./pages/IssueCategories";
import DepartmentAssignment from "./pages/DepartmentAssignment";
import TaskRouting from "./pages/TaskRouting";
import EscalationManagement from "./pages/EscalationManagement";
import PerformanceMonitoring from "./pages/PerformanceMonitoring";
import CitizenCommunication from "./pages/CitizenCommunication";
import Analytics from "./pages/Analytics";
import Layout from "./components/Layout";
import { Routes, Route, Navigate } from "react-router-dom";
import UserAccount from "./pages/UserAccount";
import Map from "./pages/Map";
import CertificatesPage from './pages/CertificatesPage'

// Protected Route Components
function AdminProtectedRoute({ children }) {
  const adminUser = localStorage.getItem("adminUser");
  return adminUser ? children : <Navigate to="/login" replace />;
}

function UserProtectedRoute({ children }) {
  const user = localStorage.getItem("user"); // Corrected to check for 'user'
  return user ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <>
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/login" element={<Login />} />
        <Route path="/verify" element={<VerificationPage />} />

        {/* --- Protected Admin Routes --- */}
        <Route element={<Layout />}>
          <Route
            path="/dashboard"
            element={
              <AdminProtectedRoute>
                <Analytics />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/map"
            element={
              <AdminProtectedRoute>
                <Map />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <AdminProtectedRoute>
                <ReportManagement />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/citizens"
            element={
              <AdminProtectedRoute>
                <CitizenManagement />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/categories"
            element={
              <AdminProtectedRoute>
                <IssueCategories />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/department-assignment"
            element={
              <AdminProtectedRoute>
                <DepartmentAssignment />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/task-routing"
            element={
              <AdminProtectedRoute>
                <TaskRouting />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/escalations"
            element={
              <AdminProtectedRoute>
                <EscalationManagement />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/performance"
            element={
              <AdminProtectedRoute>
                <PerformanceMonitoring />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/communication"
            element={
              <AdminProtectedRoute>
                <CitizenCommunication />
              </AdminProtectedRoute>
            }
          />
        </Route>

        {/* --- Protected User Routes --- */}
        <Route
          path="/issues"
          element={
            <UserProtectedRoute>
              <IssuesPage />
            </UserProtectedRoute>
          }
        />
        <Route
          path="/report-issue"
          element={
            <UserProtectedRoute>
              <ReportIssuePage />
            </UserProtectedRoute>
          }
        />
        <Route
          path="/my-reports"
          element={
            <UserProtectedRoute>
              <UserReports />
            </UserProtectedRoute>
          }
        />
        <Route
          path="/my-account"
          element={
            <UserProtectedRoute>
              <UserAccount />
            </UserProtectedRoute>
          }
        />
        <Route
          path="/certificates"
          element={
            <UserProtectedRoute>
              <CertificatesPage />
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

export default App;
