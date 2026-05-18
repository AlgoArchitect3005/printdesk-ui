import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

const STATUS_META = {
  RECEIVED:           { label: "Received",           color: "#6c8ebf", bg: "#eef2fa" },
  DIAGNOSING:         { label: "Diagnosing",          color: "#d4a017", bg: "#fdf6e3" },
  WAITING_FOR_PARTS:  { label: "Waiting for Parts",   color: "#e07b39", bg: "#fdf0e8" },
  REPAIRED:           { label: "Repaired",            color: "#4caf7d", bg: "#edf7f2" },
  DELIVERED:          { label: "Delivered",           color: "#888",    bg: "#f2f2f2" },
};

const PAYMENT_META = {
  UNPAID:  { label: "Unpaid",   color: "#c0392b", bg: "#fdf0ee" },
  PARTIAL: { label: "Partial",  color: "#e07b39", bg: "#fdf0e8" },
  PAID:    { label: "Paid",     color: "#4caf7d", bg: "#edf7f2" },
};

export default function Dashboard() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const jobsRes = await api.get("/jobs");
        setJobs(jobsRes.data);

        if (isAdmin) {
          const stockRes = await api.get("/inventory/low-stock");
          setLowStock(stockRes.data);
        }
      } catch (err) {
        setError("Data load nahi hua. Backend check karo.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [isAdmin]);

  // Stats compute
  const activeJobs = jobs.filter(j => j.status !== "DELIVERED");
  const todayDelivered = jobs.filter(j => j.status === "DELIVERED").length;
  const waitingParts = jobs.filter(j => j.status === "WAITING_FOR_PARTS").length;

  // Status breakdown
  const statusCount = {};
  jobs.forEach(j => {
    statusCount[j.status] = (statusCount[j.status] || 0) + 1;
  });

  // Recent 8 jobs
  const recentJobs = [...jobs].reverse().slice(0, 8);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  if (loading) return <div className="dash-loading">Loading...</div>;

  return (
    <div className="dash-root">
      {/* ── Sidebar ── */}
      <aside className="dash-sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-icon">🖨️</span>
          <span className="sidebar-name">PrintDesk</span>
        </div>

        <nav className="sidebar-nav">
          <a className="nav-item active" href="/dashboard">Dashboard</a>
          <a className="nav-item" href="/jobs">Job Cards</a>
          <a className="nav-item" href="/customers">Customers</a>
          <a className="nav-item" href="/inventory">Inventory</a>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">{user?.username?.[0]?.toUpperCase()}</div>
            <div>
              <div className="user-name">{user?.username}</div>
              <div className="user-role">{user?.role === "ROLE_ADMIN" ? "Admin" : "Operator"}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="dash-main">
        <header className="dash-header">
          <div>
            <h1 className="dash-title">Dashboard</h1>
            <p className="dash-date">{new Date().toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}</p>
          </div>
          <a href="/jobs/new" className="new-job-btn">+ New Job Card</a>
        </header>

        {error && <div className="dash-error">{error}</div>}

        {/* ── Stat Cards ── */}
        <section className="stat-grid">
          <StatCard label="Active Jobs" value={activeJobs.length} sub="in progress" accent="#6c8ebf" />
          <StatCard label="Delivered Today" value={todayDelivered} sub="completed" accent="#4caf7d" />
          <StatCard label="Waiting for Parts" value={waitingParts} sub="on hold" accent="#e07b39" />
          <StatCard label="Total Jobs" value={jobs.length} sub="all time" accent="#aaa" />
        </section>

        {/* ── Status Breakdown ── */}
        <section className="section-block">
          <h2 className="section-title">Status Breakdown</h2>
          <div className="status-row">
            {Object.entries(STATUS_META).map(([key, meta]) => (
              <div className="status-chip" key={key} style={{ background: meta.bg, color: meta.color }}>
                <span className="chip-count">{statusCount[key] || 0}</span>
                <span className="chip-label">{meta.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Low Stock Alert (admin only) ── */}
        {isAdmin && lowStock.length > 0 && (
          <section className="section-block alert-block">
            <h2 className="section-title">⚠️ Low Stock Alert</h2>
            <div className="low-stock-list">
              {lowStock.map(item => (
                <div className="low-stock-item" key={item.id}>
                  <span className="stock-name">{item.itemName}</span>
                  <span className="stock-qty">{item.quantity} left</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Recent Jobs ── */}
        <section className="section-block">
          <h2 className="section-title">Recent Jobs</h2>
          {recentJobs.length === 0 ? (
            <p className="empty-msg">Koi job nahi mili abhi.</p>
          ) : (
            <div className="jobs-table-wrap">
              <table className="jobs-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Customer</th>
                    <th>Printer</th>
                    <th>Status</th>
                    <th>Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {recentJobs.map(job => {
                    const sm = STATUS_META[job.status] || {};
                    const pm = PAYMENT_META[job.invoice?.paymentStatus] || {};
                    return (
                      <tr key={job.id} onClick={() => navigate(`/jobs/${job.id}`)} className="job-row">
                        <td className="job-id">#{job.id}</td>
                        <td>{job.customer?.name || "—"}</td>
                        <td className="job-printer">{job.printerBrand} {job.printerModel}</td>
                        <td>
                          <span className="badge" style={{ background: sm.bg, color: sm.color }}>
                            {sm.label || job.status}
                          </span>
                        </td>
                        <td>
                          {job.invoice ? (
                            <span className="badge" style={{ background: pm.bg, color: pm.color }}>
                              {pm.label || job.invoice.paymentStatus}
                            </span>
                          ) : <span className="no-invoice">No invoice</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div className="stat-card" style={{ "--accent": accent }}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-sub">{sub}</div>
    </div>
  );
}