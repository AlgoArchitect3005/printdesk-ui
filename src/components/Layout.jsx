import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  LayoutDashboard, ClipboardList, Users,
  Package, LogOut, Printer, ChevronRight,
  Sun, Moon, Menu, X,
} from "lucide-react";
import "./Layout.css";

const NAV_ITEMS = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/jobs",      icon: ClipboardList,   label: "Job Cards"  },
  { to: "/customers", icon: Users,           label: "Customers"  },
  { to: "/inventory", icon: Package,         label: "Inventory"  },
];

export default function Layout({ children }) {
  const { user, isAdmin, logout } = useAuth();
  const { isDark, toggleTheme }   = useTheme();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  // Prevent body scroll when sidebar open on mobile
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  function handleLogout() { logout(); navigate("/login"); }

  return (
    <div className="layout-root">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* ── Mobile Top Bar ── */}
      <header className="mobile-topbar">
        <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}>
          <Menu size={22} />
        </button>
        <div className="mobile-brand">
          <div className="brand-icon-wrap sm"><Printer size={14} strokeWidth={2} /></div>
          <span className="brand-name">PrintDesk</span>
        </div>
        <button className="mobile-theme-btn" onClick={toggleTheme}>
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      {/* ── Backdrop (mobile) ── */}
      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>

        {/* Close button — mobile only */}
        <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>
          <X size={18} />
        </button>

        <div className="sidebar-brand">
          <div className="brand-icon-wrap">
            <Printer size={18} strokeWidth={2} />
          </div>
          <div>
            <div className="brand-name">PrintDesk</div>
            <div className="brand-tagline">Service Centre</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-label">Menu</div>
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            >
              <Icon size={17} strokeWidth={2} className="nav-icon" />
              <span>{label}</span>
              <ChevronRight size={14} className="nav-chevron" />
            </NavLink>
          ))}
        </nav>

        {/* Theme Toggle */}
        <div className="theme-toggle-wrap">
          <button className="theme-toggle" onClick={toggleTheme}>
            <div className={`toggle-track ${isDark ? "dark" : "light"}`}>
              <span className="toggle-icon sun"><Sun size={12} /></span>
              <span className="toggle-icon moon"><Moon size={12} /></span>
              <div className="toggle-thumb" />
            </div>
            <span className="toggle-label">{isDark ? "Dark Mode" : "Light Mode"}</span>
          </button>
        </div>

        {/* User Footer */}
        <div className="sidebar-footer">
          <div className="user-block">
            <div className="user-avatar">{user?.username?.[0]?.toUpperCase()}</div>
            <div className="user-info">
              <div className="user-name">{user?.username}</div>
              <div className="user-role">{isAdmin ? "Admin" : "Operator"}</div>
            </div>
            <button className="logout-icon-btn" onClick={handleLogout} title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="layout-main">
        <div className="layout-content">{children}</div>
      </main>
    </div>
  );
}