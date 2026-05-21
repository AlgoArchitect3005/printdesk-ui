import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Layout    from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import JobList   from "./pages/JobList";
import JobNew    from "./pages/JobNew";
import JobDetail from "./pages/JobDetails";

// ─── Protected Route — Layout ke saath ────────────────────────────────────
function PrivateRoute({ children }) {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

// ─── Admin-only Route ──────────────────────────────────────────────────────
function AdminRoute({ children }) {
  const { isLoggedIn, isAdmin } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (!isAdmin)    return <Navigate to="/dashboard" replace />;
  return <Layout>{children}</Layout>;
}

// ─── Routes ───────────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected — Layout wrap hoga automatically */}
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/jobs"      element={<PrivateRoute><JobList /></PrivateRoute>} />
      <Route path="/jobs/new"  element={<PrivateRoute><JobNew /></PrivateRoute>} />
      <Route path="/jobs/:id"  element={<PrivateRoute><JobDetail /></PrivateRoute>} />

      {/* Default */}
      <Route path="/"  element={<Navigate to="/dashboard" replace />} />
      <Route path="*"  element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
    </BrowserRouter>
  );
}