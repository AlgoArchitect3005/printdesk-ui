import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Jobs.css";

export default function JobNew() {
  const navigate = useNavigate();

  // Step 1: customer dhundho ya banao
  const [phoneQuery, setPhoneQuery]     = useState("");
  const [foundCustomer, setFoundCustomer] = useState(null);
  const [phoneSearched, setPhoneSearched] = useState(false);
  const [newCustomer, setNewCustomer]   = useState({ name: "", phone: "", email: "", address: "" });
  const [customerMode, setCustomerMode] = useState("search"); // "search" | "create"

  // Step 2: job details
  const [jobForm, setJobForm] = useState({ printerBrand: "", printerModel: "", problemDescription: "" });

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  // ── Customer search by phone ──
  async function searchByPhone() {
    if (!phoneQuery.trim()) return;
    setError("");
    try {
      const res = await api.get(`/customers/phone/${phoneQuery.trim()}`);
      setFoundCustomer(res.data);
      setPhoneSearched(true);
      setCustomerMode("search");
    } catch {
      setFoundCustomer(null);
      setPhoneSearched(true);
    }
  }

  // ── Submit ──
  async function handleSubmit() {
    setError("");
    setLoading(true);
    try {
      let customerId;

      if (customerMode === "search" && foundCustomer) {
        customerId = foundCustomer.id;
      } else {
        // Naya customer banao
        if (!newCustomer.name || !newCustomer.phone) {
          setError("Customer ka naam aur phone zaroori hai.");
          setLoading(false);
          return;
        }
        const cRes = await api.post("/customers", newCustomer);
        customerId = cRes.data.id;
      }

      if (!jobForm.printerBrand || !jobForm.printerModel || !jobForm.problemDescription) {
        setError("Printer brand, model aur problem description daalna zaroori hai.");
        setLoading(false);
        return;
      }

      const jRes = await api.post(`/jobs/customer/${customerId}`, jobForm);
      navigate(`/jobs/${jRes.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Job create nahi hui. Dobara try karo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-root">
      <div className="page-header">
        <div>
          <h1 className="page-title">New Job Card</h1>
          <p className="page-sub">Customer dhundho phir printer details bharo</p>
        </div>
        <button className="ghost-btn" onClick={() => navigate("/jobs")}>← Back</button>
      </div>

      {error && <div className="page-error">{error}</div>}

      <div className="form-grid">

        {/* ── Section 1: Customer ── */}
        <div className="form-card">
          <h2 className="form-section-title">1. Customer</h2>

          {/* Phone search */}
          <div className="field-row">
            <div className="field-group flex-1">
              <label>Phone Number se Dhundho</label>
              <input
                type="text"
                placeholder="e.g. 9876543210"
                value={phoneQuery}
                onChange={e => setPhoneQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && searchByPhone()}
              />
            </div>
            <button className="search-btn" onClick={searchByPhone}>Search</button>
          </div>

          {/* Found customer */}
          {phoneSearched && foundCustomer && (
            <div className="customer-found">
              <div className="found-badge">✓ Customer Found</div>
              <div className="customer-card-mini">
                <div className="cust-name">{foundCustomer.name}</div>
                <div className="cust-meta">{foundCustomer.phone} {foundCustomer.email && `· ${foundCustomer.email}`}</div>
              </div>
              <button className="link-btn" onClick={() => { setFoundCustomer(null); setPhoneSearched(false); setCustomerMode("create"); }}>
                Naya customer banana hai?
              </button>
            </div>
          )}

          {/* Not found — show create form */}
          {phoneSearched && !foundCustomer && (
            <div className="customer-notfound">
              <div className="notfound-badge">Customer nahi mila — Naya banao</div>
              <div className="fields-stack">
                <div className="field-group">
                  <label>Name *</label>
                  <input type="text" placeholder="Customer ka naam"
                    value={newCustomer.name}
                    onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })} />
                </div>
                <div className="field-group">
                  <label>Phone *</label>
                  <input type="text" placeholder="Phone number" value={phoneQuery}
                    onChange={e => { setPhoneQuery(e.target.value); setNewCustomer({ ...newCustomer, phone: e.target.value }); }} />
                </div>
                <div className="field-group">
                  <label>Email (optional)</label>
                  <input type="email" placeholder="email@example.com"
                    value={newCustomer.email}
                    onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })} />
                </div>
                <div className="field-group">
                  <label>Address (optional)</label>
                  <input type="text" placeholder="Address"
                    value={newCustomer.address}
                    onChange={e => setNewCustomer({ ...newCustomer, address: e.target.value })} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Section 2: Job Details ── */}
        <div className="form-card">
          <h2 className="form-section-title">2. Printer & Problem</h2>
          <div className="fields-stack">
            <div className="field-group">
              <label>Printer Brand *</label>
              <input type="text" placeholder="e.g. HP, Canon, Epson"
                value={jobForm.printerBrand}
                onChange={e => setJobForm({ ...jobForm, printerBrand: e.target.value })} />
            </div>
            <div className="field-group">
              <label>Printer Model *</label>
              <input type="text" placeholder="e.g. LaserJet 1020, L3150"
                value={jobForm.printerModel}
                onChange={e => setJobForm({ ...jobForm, printerModel: e.target.value })} />
            </div>
            <div className="field-group">
              <label>Problem Description *</label>
              <textarea
                placeholder="Customer ne kya problem bataya..."
                rows={4}
                value={jobForm.problemDescription}
                onChange={e => setJobForm({ ...jobForm, problemDescription: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="form-actions">
        <button className="ghost-btn" onClick={() => navigate("/jobs")}>Cancel</button>
        <button
          className="primary-btn"
          onClick={handleSubmit}
          disabled={loading || (!foundCustomer && customerMode === "search" && phoneSearched === false)}
        >
          {loading ? "Creating..." : "Create Job Card →"}
        </button>
      </div>
    </div>
  );
}