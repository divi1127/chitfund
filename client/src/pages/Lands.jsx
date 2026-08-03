import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { SectionHeader } from "../components/SectionHeader";
import { Btn } from "../components/Btn";
import { Badge } from "../components/Badge";
import { API_BASE } from "../utils/api";

const resolveImg = (url) => {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  const base = API_BASE.replace(/\/api$/, "");
  return url.startsWith("/") ? `${base}${url}` : `${base}/${url}`;
};

const inp = {
  padding: "10px 14px", borderRadius: 8, border: "1px solid #e5e7eb",
  background: "#f8fafc", fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box",
};

const BADGE_OPTIONS = ["DTCP Approved", "RERA Approved", "Agricultural Land", "Commercial Plot", "Industrial Land", "Patta Ready"];
const TYPE_OPTIONS  = ["Residential Plot", "Independent House", "Commercial Plot", "Agricultural Land", "Gated Community", "Villa"];
const STATUS_OPTIONS = ["active", "sold", "inactive"];

const EMPTY_FORM = { name: "", image: "", address: "", amount: "", location: "", area: "", type: "Residential Plot", badge: "DTCP Approved", description: "", phone: "", status: "active" };

export function Lands({ dark, toast }) {
  const { user } = useAuth();
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [viewing, setViewing] = useState(null);

  const canManage = user?.role === "super_admin" || user?.role === "admin";

  const fetchLands = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/lands`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setLands(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchLands(); }, []);

  const validate = () => {
    const e = {};
    if (!form.name.trim())     e.name     = "Name is required";
    if (!form.address.trim())  e.address  = "Address is required";
    if (!form.location.trim()) e.location = "Location is required";
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0)
      e.amount = "Valid amount is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");
      setForm(f => ({ ...f, image: data.url }));
      toast.add("Image uploaded!");
    } catch (err) {
      toast.add("Upload failed: " + err.message, "error");
    }
    setUploading(false);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      const token = localStorage.getItem("token");
      const payload = { ...form, amount: Number(form.amount) };
      const url    = editing ? `${API_BASE}/lands/${editing._id}` : `${API_BASE}/lands`;
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.add(editing ? "Land updated!" : "Land created!");
        resetForm();
        fetchLands();
      } else {
        const d = await res.json();
        toast.add(d.message || "Error saving", "error");
      }
    } catch (err) { toast.add(err.message, "error"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this land listing?")) return;
    try {
      const res = await fetch(`${API_BASE}/lands/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) { toast.add("Deleted!"); fetchLands(); }
      else { const d = await res.json(); toast.add(d.message || "Delete failed", "error"); }
    } catch (err) { toast.add(err.message, "error"); }
  };

  const resetForm = () => { setShowForm(false); setEditing(null); setForm(EMPTY_FORM); setErrors({}); };
  const startEdit = (land) => { setEditing(land); setForm({ ...land, amount: String(land.amount) }); setShowForm(true); };

  const filtered = lands.filter(l =>
    l.name?.toLowerCase().includes(search.toLowerCase()) ||
    l.location?.toLowerCase().includes(search.toLowerCase())
  );

  const amtDisplay = (n) => {
    if (n >= 10000000) return "₹" + (n / 10000000).toFixed(2) + " Cr";
    if (n >= 100000)   return "₹" + (n / 100000).toFixed(2) + " L";
    return "₹" + Number(n).toLocaleString("en-IN");
  };

  if (!canManage) return (
    <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>
      Access restricted to Admin / Super Admin.
    </div>
  );

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading…</div>;

  return (
    <div>
      <SectionHeader
        title="Land & Property Listings"
        subtitle="Manage properties shown on NVS Loans & Promoter landing page"
        dark={dark}
        actions={[
          <Btn key="add" label="+ Add Listing" primary onClick={() => { resetForm(); setShowForm(true); }} />,
        ]}
      />

      {/* ── ADD / EDIT FORM ── */}
      {showForm && (
        <div style={{
          background: dark ? "rgba(255,255,255,.04)" : "#f8fafc",
          border: "1px solid " + (dark ? "rgba(255,255,255,.1)" : "#e5e7eb"),
          borderRadius: 14, padding: 24, marginBottom: 28,
        }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 18, color: dark ? "#f1f5f9" : "#0f172a" }}>
            {editing ? "Edit Land Listing" : "New Land Listing"}
          </div>

          {/* Image upload */}
          <div style={{ display: "flex", gap: 16, alignItems: "center", background: dark ? "rgba(255,255,255,.05)" : "#fff", padding: 14, borderRadius: 10, border: "1px dashed #cbd5e1", marginBottom: 16 }}>
            {form.image ? (
              <img src={resolveImg(form.image)} alt="preview" style={{ width: 80, height: 60, objectFit: "contain", borderRadius: 8, border: "2px solid #e2e8f0" }} />
            ) : (
              <div style={{ width: 80, height: 60, borderRadius: 8, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 11 }}>No img</div>
            )}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#2563eb", cursor: "pointer" }}>
                {uploading ? "Uploading…" : "Upload Property Image"}
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} disabled={uploading} />
              </label>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>Landscape or Portrait photos accepted</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "12px 20px" }}>
            {/* Name */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: dark ? "#94a3b8" : "#374151", display: "block", marginBottom: 4 }}>Land / Property Name *</label>
              <input style={inp} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Prime Residential Plot" />
              {errors.name && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 3 }}>{errors.name}</div>}
            </div>

            {/* Amount */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: dark ? "#94a3b8" : "#374151", display: "block", marginBottom: 4 }}>Amount (₹) *</label>
              <input style={inp} type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="e.g. 1800000" />
              {errors.amount && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 3 }}>{errors.amount}</div>}
            </div>

            {/* Location */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: dark ? "#94a3b8" : "#374151", display: "block", marginBottom: 4 }}>Location *</label>
              <input style={inp} value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Avaniyapuram, Madurai" />
              {errors.location && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 3 }}>{errors.location}</div>}
            </div>

            {/* Area */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: dark ? "#94a3b8" : "#374151", display: "block", marginBottom: 4 }}>Area / Size</label>
              <input style={inp} value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))} placeholder="e.g. 3 Cents / 1200 sqft" />
            </div>

            {/* Type */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: dark ? "#94a3b8" : "#374151", display: "block", marginBottom: 4 }}>Type</label>
              <select style={inp} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {TYPE_OPTIONS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            {/* Badge */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: dark ? "#94a3b8" : "#374151", display: "block", marginBottom: 4 }}>Badge / Approval</label>
              <select style={inp} value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))}>
                {BADGE_OPTIONS.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>

            {/* Phone */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: dark ? "#94a3b8" : "#374151", display: "block", marginBottom: 4 }}>Contact Phone</label>
              <input style={inp} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="96009 24752" />
            </div>

            {/* Status */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: dark ? "#94a3b8" : "#374151", display: "block", marginBottom: 4 }}>Status</label>
              <select style={inp} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            {/* Address (full row) */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: dark ? "#94a3b8" : "#374151", display: "block", marginBottom: 4 }}>Address *</label>
              <input style={inp} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Full property address" />
              {errors.address && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 3 }}>{errors.address}</div>}
            </div>

            {/* Description (full row) */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: dark ? "#94a3b8" : "#374151", display: "block", marginBottom: 4 }}>Description</label>
              <textarea style={{ ...inp, minHeight: 72, resize: "vertical" }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Write a short description of the property…" />
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <Btn label={editing ? "Update Listing" : "Create Listing"} primary onClick={handleSubmit} />
            <Btn label="Cancel" onClick={resetForm} />
          </div>
        </div>
      )}

      {/* ── SEARCH ── */}
      <div style={{ marginBottom: 16 }}>
        <input
          style={{ ...inp, maxWidth: 320 }}
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or location…"
        />
      </div>

      {/* ── LISTINGS GRID ── */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 48, color: "#94a3b8", fontSize: 14 }}>
          No land listings found. Click "+ Add Listing" to create one.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
          {filtered.map(land => (
            <div key={land._id} style={{
              background: dark ? "rgba(255,255,255,.04)" : "#fff",
              border: "1px solid " + (dark ? "rgba(255,255,255,.1)" : "#e5e7eb"),
              borderRadius: 14, overflow: "hidden",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}>
              {/* Property Image */}
              <div style={{ position: "relative", height: 160, background: "linear-gradient(135deg, #0f172a, #1e3a8a)", overflow: "hidden" }}>
                {land.image ? (
                  <img src={resolveImg(land.image)} alt={land.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>🏠</div>
                )}
                {/* Badge overlay */}
                <div style={{ position: "absolute", top: 10, left: 10, background: "#f59e0b", color: "#0f172a", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>
                  {land.badge}
                </div>
                {/* Status */}
                <div style={{ position: "absolute", top: 10, right: 10 }}>
                  <Badge text={land.status} color={land.status === "active" ? "green" : land.status === "sold" ? "red" : "gray"} />
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: dark ? "#f1f5f9" : "#0f172a" }}>{land.name}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{land.type}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: "#f59e0b" }}>{amtDisplay(land.amount)}</div>
                    {land.area && <div style={{ fontSize: 11, color: "#94a3b8" }}>{land.area}</div>}
                  </div>
                </div>

                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>📍 {land.location}</div>
                {land.description && (
                  <div style={{ fontSize: 12, color: dark ? "#94a3b8" : "#64748b", marginBottom: 8, lineHeight: 1.5,
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {land.description}
                  </div>
                )}

                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button onClick={() => setViewing(land)} style={{
                    flex: 1, padding: "8px 0", borderRadius: 8, border: "1px solid #10b981",
                    background: "transparent", color: "#10b981", fontSize: 12, fontWeight: 600, cursor: "pointer",
                  }}>View</button>
                  <button onClick={() => startEdit(land)} style={{
                    flex: 1, padding: "8px 0", borderRadius: 8, border: "1px solid #2563eb",
                    background: "transparent", color: "#2563eb", fontSize: 12, fontWeight: 600, cursor: "pointer",
                  }}>Edit</button>
                  <button onClick={() => handleDelete(land._id)} style={{
                    flex: 1, padding: "8px 0", borderRadius: 8, border: "1px solid #dc2626",
                    background: "transparent", color: "#dc2626", fontSize: 12, fontWeight: 600, cursor: "pointer",
                  }}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── VIEW POPUP MODAL ── */}
      {viewing && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(0,0,0,0.85)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 24, paddingTop: 60
        }}>
          <div style={{
            background: dark ? "#0f172a" : "#fff",
            border: "1px solid " + (dark ? "rgba(255,255,255,.1)" : "#e5e7eb"),
            borderRadius: 16, width: "100%", maxWidth: 800,
            maxHeight: "90vh", display: "flex", flexDirection: "column",
            overflow: "hidden", position: "relative",
            boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
          }}>
            <button onClick={() => setViewing(null)} style={{
              position: "absolute", top: 16, right: 16,
              background: "rgba(0,0,0,0.5)", border: "none", color: "#fff",
              width: 32, height: 32, borderRadius: "50%", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 10,
            }}>✕</button>

            {/* Image Section - Object Fit Contain handles Portait & Landscape */}
            <div style={{ width: "100%", height: "50vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {viewing.image ? (
                <img src={resolveImg(viewing.image)} alt={viewing.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              ) : (
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 48 }}>🏠</div>
              )}
            </div>

            {/* Details Section */}
            <div style={{ padding: 24, overflowY: "auto", flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: dark ? "#f1f5f9" : "#0f172a" }}>{viewing.name}</h3>
                  <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{viewing.type} • {viewing.badge}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#f59e0b" }}>{amtDisplay(viewing.amount)}</div>
                  {viewing.area && <div style={{ fontSize: 13, color: "#94a3b8" }}>{viewing.area}</div>}
                </div>
              </div>

              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16,
                background: dark ? "rgba(255,255,255,0.03)" : "#f8fafc", padding: 16, borderRadius: 12, marginBottom: 16
              }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>LOCATION</div>
                  <div style={{ fontSize: 13, color: dark ? "#e2e8f0" : "#1e293b", marginTop: 2 }}>{viewing.location}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>CONTACT PHONE</div>
                  <div style={{ fontSize: 13, color: dark ? "#e2e8f0" : "#1e293b", marginTop: 2 }}>{viewing.phone || 'N/A'}</div>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>FULL ADDRESS</div>
                  <div style={{ fontSize: 13, color: dark ? "#e2e8f0" : "#1e293b", marginTop: 2 }}>{viewing.address}</div>
                </div>
              </div>

              {viewing.description && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>DESCRIPTION</div>
                  <div style={{ fontSize: 14, lineHeight: 1.6, color: dark ? "#cbd5e1" : "#334155", whiteSpace: "pre-wrap" }}>
                    {viewing.description}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
