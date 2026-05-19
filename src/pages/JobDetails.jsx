import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./Jobs.css";

const STATUS_META = {
  RECEIVED:           { label: "Received",          color: "#6c8ebf", bg: "#eef2fa" },
  DIAGNOSING:         { label: "Diagnosing",        color: "#d4a017", bg: "#fdf6e3" },
  WAITING_FOR_PARTS:  { label: "Waiting for Parts", color: "#e07b39", bg: "#fdf0e8" },
  REPAIRED:           { label: "Repaired",          color: "#4caf7d", bg: "#edf7f2" },
  DELIVERED:          { label: "Delivered",         color: "#888",    bg: "#f2f2f2" },
};

const STATUS_FLOW = ["RECEIVED", "DIAGNOSING", "WAITING_FOR_PARTS", "REPAIRED", "DELIVERED"];

const PAYMENT_META = {
  UNPAID:  { label: "Unpaid",  color: "#c0392b", bg: "#fdf0ee" },
  PARTIAL: { label: "Partial", color: "#e07b39", bg: "#fdf0e8" },
  PAID:    { label: "Paid",    color: "#4caf7d", bg: "#edf7f2" },
};

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [job, setJob]           = useState(null);
  const [invoice, setInvoice]   = useState(null);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  // Add parts form
  const [partForm, setPartForm] = useState({ inventoryId: "", quantityUsed: 1 });
  const [addingPart, setAddingPart] = useState(false);

  // Invoice form
  const [serviceCharge, setServiceCharge] = useState("");
  const [generatingInvoice, setGeneratingInvoice] = useState(false);

  // Payment form
  const [amountPaid, setAmountPaid] = useState("");
  const [payingInvoice, setPayingInvoice] = useState(false);

  // Status update
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => { fetchAll(); }, [id]);

  async function fetchAll() {
    setLoading(true);
    try {
      const [jobRes, invRes] = await Promise.all([
        api.get(`/jobs/${id}`),
        api.get("/inventory"),
      ]);
      setJob(jobRes.data);

      // Invoice fetch
      try {
        const invRes2 = await api.get(`/invoices/job/${id}`);
        setInvoice(invRes2.data);
      } catch { setInvoice(null); }

      setInventory(invRes.data);
    } catch {
      setError("Job load nahi hua.");
    } finally {
      setLoading(false);
    }
  }

  // ── Status Update ──
  async function updateStatus(newStatus) {
    setUpdatingStatus(true);
    try {
      await api.patch(`/jobs/${id}/status`, { status: newStatus });
      setJob(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      setError(err.response?.data?.message || "Status update nahi hua.");
    } finally {
      setUpdatingStatus(false);
    }
  }

  // ── Add Part ──
  async function addPart() {
    if (!partForm.inventoryId) return;
    setAddingPart(true);
    try {
      await api.post(`/jobs/${id}/parts`, {
        inventoryId: Number(partForm.inventoryId),
        quantityUsed: Number(partForm.quantityUsed),
      });
      setPartForm({ inventoryId: "", quantityUsed: 1 });
      fetchAll(); // refresh to get updated parts list
    } catch (err) {
      setError(err.response?.data?.message || "Part add nahi hua.");
    } finally {
      setAddingPart(false);
    }
  }

  // ── Generate Invoice ──
  async function generateInvoice() {
    if (!serviceCharge) return;
    setGeneratingInvoice(true);
    try {
      const res = await api.post(`/invoices/job/${id}/generate`, {
        serviceCharge: Number(serviceCharge),
      });
      setInvoice(res.data);
      setServiceCharge("");
    } catch (err) {
      setError(err.response?.data?.message || "Invoice generate nahi hua.");
    } finally {
      setGeneratingInvoice(false);
    }
  }

  // ── Record Payment ──
  async function recordPayment() {
    if (!amountPaid || !invoice) return;
    setPayingInvoice(true);
    try {
      const res = await api.patch(`/invoices/${invoice.id}/payment`, {
        amountPaid: Number(amountPaid),
      });
      setInvoice(res.data);
      setAmountPaid("");
    } catch (err) {
      setError(err.response?.data?.message || "Payment record nahi hua.");
    } finally {
      setPayingInvoice(false);
    }
  }

  if (loading) return <div className="page-loading">Loading job...</div>;
  if (!job)    return <div className="page-loading">Job nahi mila.</div>;

  const sm = STATUS_META[job.status] || {};
  const currentIdx = STATUS_FLOW.indexOf(job.status);
  const nextStatus = STATUS_FLOW[currentIdx + 1];

  return (
    <div className="page-root">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Job #{job.id}</h1>
          <p className="page-sub">{job.printerBrand} {job.printerModel}</p>
        </div>
        <button className="ghost-btn" onClick={() => navigate("/jobs")}>← All Jobs</button>
      </div>

      {error && <div className="page-error" onClick={() => setError("")}>{error} ✕</div>}

      {/* Status Progress Bar */}
      <div className="status-progress">
        {STATUS_FLOW.map((s, i) => {
          const meta = STATUS_META[s];
          const done = i <= currentIdx;
          return (
            <div key={s} className={`progress-step ${done ? "done" : ""} ${job.status === s ? "current" : ""}`}>
              <div className="step-dot" style={done ? { background: meta.color } : {}} />
              <div className="step-label" style={done ? { color: meta.color } : {}}>{meta.label}</div>
              {i < STATUS_FLOW.length - 1 && <div className={`step-line ${i < currentIdx ? "done" : ""}`} />}
            </div>
          );
        })}
      </div>

      <div className="detail-grid">

        {/* ── Left Column ── */}
        <div className="detail-left">

          {/* Customer + Job Info */}
          <div className="detail-card">
            <h2 className="card-title">Job Info</h2>
            <div className="info-rows">
              <InfoRow label="Customer"    value={job.customer?.name} />
              <InfoRow label="Phone"       value={job.customer?.phone} />
              <InfoRow label="Email"       value={job.customer?.email || "—"} />
              <InfoRow label="Brand"       value={job.printerBrand} />
              <InfoRow label="Model"       value={job.printerModel} />
              <InfoRow label="Status">
                <span className="badge" style={{ background: sm.bg, color: sm.color }}>{sm.label}</span>
              </InfoRow>
              <InfoRow label="Problem" value={job.problemDescription} />
            </div>
          </div>

          {/* Status Update */}
          {nextStatus && (
            <div className="detail-card">
              <h2 className="card-title">Update Status</h2>
              <p className="card-sub">Next step: <strong>{STATUS_META[nextStatus]?.label}</strong></p>
              <button
                className="primary-btn full-width"
                onClick={() => updateStatus(nextStatus)}
                disabled={updatingStatus}
              >
                {updatingStatus ? "Updating..." : `Mark as ${STATUS_META[nextStatus]?.label} →`}
              </button>
            </div>
          )}

          {/* Parts Used */}
          <div className="detail-card">
            <h2 className="card-title">Parts Used</h2>
            {job.parts?.length > 0 ? (
              <table className="data-table small-table">
                <thead>
                  <tr>
                    <th>Part</th>
                    <th>Qty</th>
                    <th>Price at Time</th>
                  </tr>
                </thead>
                <tbody>
                  {job.parts.map((p, i) => (
                    <tr key={i}>
                      <td>{p.inventoryItem?.itemName || `Item #${p.inventoryId}`}</td>
                      <td className="mono-cell">{p.quantityUsed}</td>
                      <td className="mono-cell">₹{p.unitPriceAtTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="muted">Koi part nahi add kiya abhi.</p>
            )}

            {/* Add Part Form */}
            <div className="add-part-form">
              <select
                value={partForm.inventoryId}
                onChange={e => setPartForm({ ...partForm, inventoryId: e.target.value })}
                className="select-input"
              >
                <option value="">Select part...</option>
                {inventory.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.itemName} (Stock: {item.quantity})
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                value={partForm.quantityUsed}
                onChange={e => setPartForm({ ...partForm, quantityUsed: e.target.value })}
                className="qty-input"
                placeholder="Qty"
              />
              <button className="primary-btn" onClick={addPart} disabled={addingPart || !partForm.inventoryId}>
                {addingPart ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </div>

        {/* ── Right Column — Invoice ── */}
        <div className="detail-right">
          <div className="detail-card">
            <h2 className="card-title">Invoice</h2>

            {invoice ? (
              <>
                <div className="info-rows">
                  <InfoRow label="Invoice #"     value={`#${invoice.id}`} />
                  <InfoRow label="Parts Total"   value={`₹${invoice.partsTotal}`} />
                  <InfoRow label="Service Charge" value={`₹${invoice.serviceCharge}`} />
                  <InfoRow label="Grand Total"   value={`₹${invoice.grandTotal}`} />
                  <InfoRow label="Amount Paid"   value={`₹${invoice.amountPaid}`} />
                  <InfoRow label="Balance"       value={`₹${invoice.grandTotal - invoice.amountPaid}`} />
                  <InfoRow label="Payment">
                    <span className="badge"
                      style={{ background: PAYMENT_META[invoice.paymentStatus]?.bg, color: PAYMENT_META[invoice.paymentStatus]?.color }}>
                      {PAYMENT_META[invoice.paymentStatus]?.label}
                    </span>
                  </InfoRow>
                </div>

                {/* Record Payment */}
                {invoice.paymentStatus !== "PAID" && (
                  <div className="invoice-action">
                    <h3 className="action-title">Record Payment</h3>
                    <div className="inline-form">
                      <input
                        type="number"
                        placeholder="Amount (₹)"
                        value={amountPaid}
                        onChange={e => setAmountPaid(e.target.value)}
                        className="amount-input"
                      />
                      <button className="primary-btn" onClick={recordPayment} disabled={payingInvoice || !amountPaid}>
                        {payingInvoice ? "Saving..." : "Record"}
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="muted">Invoice abhi generate nahi hua.</p>
                <div className="invoice-action">
                  <h3 className="action-title">Generate Invoice</h3>
                  <div className="inline-form">
                    <input
                      type="number"
                      placeholder="Service charge (₹)"
                      value={serviceCharge}
                      onChange={e => setServiceCharge(e.target.value)}
                      className="amount-input"
                    />
                    <button className="primary-btn" onClick={generateInvoice} disabled={generatingInvoice || !serviceCharge}>
                      {generatingInvoice ? "Generating..." : "Generate"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Small helper component
function InfoRow({ label, value, children }) {
  return (
    <div className="info-row">
      <span className="info-label">{label}</span>
      <span className="info-value">{children || value}</span>
    </div>
  );
}