import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Clock, Package, Layers } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

const STATUS_META = {
  RECEIVED:           { label: "Received",         color: "var(--status-received-color)",   bg: "var(--status-received-bg)"   },
  DIAGNOSING:         { label: "Diagnosing",        color: "var(--status-diagnosing-color)", bg: "var(--status-diagnosing-bg)" },
  WAITING_FOR_PARTS:  { label: "Waiting for Parts", color: "var(--status-waiting-color)",    bg: "var(--status-waiting-bg)"    },
  REPAIRED:           { label: "Repaired",          color: "var(--status-repaired-color)",   bg: "var(--status-repaired-bg)"   },
  DELIVERED:          { label: "Delivered",         color: "var(--status-delivered-color)",  bg: "var(--status-delivered-bg)"  },
};

const PAYMENT_META = {
  UNPAID:  { label: "Unpaid",  color: "var(--pay-unpaid-color)",  bg: "var(--pay-unpaid-bg)"  },
  PARTIAL: { label: "Partial", color: "var(--pay-partial-color)", bg: "var(--pay-partial-bg)" },
  PAID:    { label: "Paid",    color: "var(--pay-paid-color)",    bg: "var(--pay-paid-bg)"    },
};

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs]         = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const jobsRes = await api.get("/jobs");
        setJobs(jobsRes.data);
        if (isAdmin) {
          const stockRes = await api.get("/inventory/low-stock");
          setLowStock(stockRes.data);
        }
      } catch { setError("Data load nahi hua. Backend check karo."); }
      finally  { setLoading(false); }
    }
    fetchData();
  }, [isAdmin]);

  const activeJobs     = jobs.filter(j => j.status !== "DELIVERED").length;
  const todayDelivered = jobs.filter(j => j.status === "DELIVERED").length;
  const waitingParts   = jobs.filter(j => j.status === "WAITING_FOR_PARTS").length;
  const recentJobs     = [...jobs].reverse().slice(0, 8);
  const statusCount    = {};
  jobs.forEach(j => { statusCount[j.status] = (statusCount[j.status] || 0) + 1; });

  if (loading) return <div className="dash-loading">Loading...</div>;

  return (
    <div className="dash-root">
      <div className="dash-header">
        <div>
          <h1 className="dash-title">
            Good {getGreeting()}, <span className="grad-text">{user?.username}</span> 👋
          </h1>
          <p className="dash-date">
            {new Date().toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}
          </p>
        </div>
        <button className="new-job-btn" onClick={() => navigate("/jobs/new")}>+ New Job</button>
      </div>

      {error && <div className="dash-error">{error}</div>}

      <div className="stat-grid">
        <StatCard icon={<Layers size={20}/>}     label="Active Jobs"       value={activeJobs}     grad="var(--grad-primary)"   />
        <StatCard icon={<TrendingUp size={20}/>} label="Delivered"         value={todayDelivered} grad="var(--grad-success)"   />
        <StatCard icon={<Clock size={20}/>}      label="Waiting for Parts" value={waitingParts}   grad="var(--grad-warm)"      />
        <StatCard icon={<Package size={20}/>}    label="Total Jobs"        value={jobs.length}    grad="var(--grad-secondary)" />
      </div>

      {isAdmin && lowStock.length > 0 && (
        <div className="alert-card">
          <div className="alert-header">
            <span className="alert-dot" />
            <span className="alert-title">Low Stock Alert — {lowStock.length} items</span>
          </div>
          <div className="low-stock-list">
            {lowStock.map(item => (
              <div className="low-stock-item" key={item.id}>
                <span>{item.itemName}</span>
                <span className="stock-qty">{item.quantity} left</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="section-card">
        <h2 className="section-title">Status Breakdown</h2>
        <div className="status-chips">
          {Object.entries(STATUS_META).map(([key, meta]) => (
            <div className="status-chip" key={key}
              style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.color}22` }}>
              <span className="chip-count">{statusCount[key] || 0}</span>
              <span>{meta.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="section-card">
        <h2 className="section-title">Recent Jobs</h2>
        {recentJobs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p>Koi job nahi mili abhi.</p>
            <button className="new-job-btn" onClick={() => navigate("/jobs/new")}>Create First Job</button>
          </div>
        ) : (
          <table className="dash-table">
            <thead>
              <tr><th>#</th><th>Customer</th><th>Printer</th><th>Status</th><th>Payment</th></tr>
            </thead>
            <tbody>
              {recentJobs.map(job => {
                const sm = STATUS_META[job.status] || {};
                const pm = job.invoice ? PAYMENT_META[job.invoice.paymentStatus] || {} : null;
                return (
                  <tr key={job.id} className="dash-row" onClick={() => navigate(`/jobs/${job.id}`)}>
                    <td><span className="job-id">#{job.id}</span></td>
                    <td>
                      <div className="cell-name">{job.customer?.name || "—"}</div>
                      <div className="cell-sub">{job.customer?.phone}</div>
                    </td>
                    <td>
                      <div className="cell-name">{job.printerBrand}</div>
                      <div className="cell-sub">{job.printerModel}</div>
                    </td>
                    <td><span className="badge" style={{ background: sm.bg, color: sm.color }}>{sm.label}</span></td>
                    <td>
                      {pm
                        ? <span className="badge" style={{ background: pm.bg, color: pm.color }}>{pm.label}</span>
                        : <span className="cell-sub">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, grad }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: grad }}>{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-glow" style={{ background: grad }} />
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Morning";
  if (h < 17) return "Afternoon";
  return "Evening";
}