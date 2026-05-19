import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import JobList from "./pages/JobList";
import JobDetails from "./pages/JobDetails";
import JobNew from "./pages/JobNew";

// ─── Protected Route wrapper ───────────────────────────────────────────────
// isLoggedIn nahi hai → /login pe redirect
function PrivateRoute({ children }) {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

// ─── Admin-only Route wrapper ──────────────────────────────────────────────
function AdminRoute({ children }) {
  const { isLoggedIn, isAdmin } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}

// // ─── Placeholder pages (baad mein replace karna) ──────────────────────────
// function Dashboard() { return <h2 style={{padding:32}}>Dashboard — Coming soon</h2>; }

// ─── App with Routes ───────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
 
      {/* Protected */}
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/jobs"      element={<PrivateRoute><JobList /></PrivateRoute>} />
      <Route path="/jobs/new"  element={<PrivateRoute><JobNew /></PrivateRoute>} />
      <Route path="/jobs/:id"  element={<PrivateRoute><JobDetails /></PrivateRoute>} />
 
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}