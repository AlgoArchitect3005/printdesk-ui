import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Jobs.css";

const STATUS_META = {
  ALL:                { label: "All",               color: "#1a1a1a", bg: "#f0ede8" },
  RECEIVED:           { label: "Received",          color: "#6c8ebf", bg: "#eef2fa" },
  DIAGNOSING:         { label: "Diagnosing",        color: "#d4a017", bg: "#fdf6e3" },
  WAITING_FOR_PARTS:  { label: "Waiting Parts",     color: "#e07b39", bg: "#fdf0e8" },
  REPAIRED:           { label: "Repaired",          color: "#4caf7d", bg: "#edf7f2" },
  DELIVERED:          { label: "Delivered",         color: "#888",    bg: "#f2f2f2" },
};

const PAYMENT_META = {
  UNPAID:  { label: "Unpaid",  color: "#c0392b", bg: "#fdf0ee" },
  PARTIAL: { label: "Partial", color: "#e07b39", bg: "#fdf0e8" },
  PAID:    { label: "Paid",    color: "#4caf7d", bg: "#edf7f2" },
};

export default function JobList() {
  const navigate = useNavigate();
  const [jobs, setJobs]           = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [activeStatus, setActive] = useState("ALL");
  const [search, setSearch]       = useState("");
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");

  useEffect(() => {
    api.get("/jobs")
      .then(res => { setJobs(res.data); setFiltered(res.data); })
      .catch(() => setError("Jobs load nahi hue. Backend check karo."))
      .finally(() => setLoading(false));
  }, []);

  // Filter whenever status or search changes
  useEffect(() => {
    let result = jobs;
    if (activeStatus !== "ALL") {
      result = result.filter(j => j.status === activeStatus);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(j =>
        j.customer?.name?.toLowerCase().includes(q) ||
        j.printerBrand?.toLowerCase().includes(q) ||
        j.printerModel?.toLowerCase().includes(q) ||
        String(j.id).includes(q)
      );
    }
    setFiltered(result);
  }, [activeStatus, search, jobs]);

  if (loading) return <div className="page-loading">Loading jobs...</div>;

  return (
    <div className="page-root">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Job Cards</h1>
          <p className="page-sub">{filtered.length} jobs</p>
        </div>
        <button className="primary-btn" onClick={() => navigate("/jobs/new")}>
          + New Job
        </button>
      </div>

      {error && <div className="page-error">{error}</div>}

      {/* Status Filter Tabs */}
      <div className="filter-tabs">
        {Object.entries(STATUS_META).map(([key, meta]) => (
          <button
            key={key}
            className={`filter-tab ${activeStatus === key ? "active" : ""}`}
            style={activeStatus === key ? { background: meta.bg, color: meta.color, borderColor: meta.color } : {}}
            onClick={() => setActive(key)}
          >
            {meta.label}
            <span className="tab-count">
              {key === "ALL" ? jobs.length : jobs.filter(j => j.status === key).length}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="search-wrap">
        <input
          type="text"
          placeholder="Search by customer, printer, or job ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Table */}
      <div className="table-card">
        {filtered.length === 0 ? (
          <p className="empty-msg">Koi job nahi mili.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>#ID</th>
                <th>Customer</th>
                <th>Printer</th>
                <th>Problem</th>
                <th>Status</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(job => {
                const sm = STATUS_META[job.status] || {};
                const pm = job.invoice ? PAYMENT_META[job.invoice.paymentStatus] || {} : null;
                return (
                  <tr key={job.id} className="table-row" onClick={() => navigate(`/jobs/${job.id}`)}>
                    <td className="mono-cell">#{job.id}</td>
                    <td>
                      <div className="cell-primary">{job.customer?.name || "—"}</div>
                      <div className="cell-secondary">{job.customer?.phone}</div>
                    </td>
                    <td>
                      <div className="cell-primary">{job.printerBrand}</div>
                      <div className="cell-secondary">{job.printerModel}</div>
                    </td>
                    <td className="problem-cell">{job.problemDescription}</td>
                    <td>
                      <span className="badge" style={{ background: sm.bg, color: sm.color }}>
                        {sm.label || job.status}
                      </span>
                    </td>
                    <td>
                      {pm ? (
                        <span className="badge" style={{ background: pm.bg, color: pm.color }}>
                          {pm.label}
                        </span>
                      ) : <span className="muted">—</span>}
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