import { useState, useEffect } from "react";
import { useData } from "../hooks/useData";
import { createData, updateData, deleteData } from "../utils/api";
import { SectionHeader } from "../components/SectionHeader";
import { Badge } from "../components/Badge";
import { Btn } from "../components/Btn";
import { IconBtn } from "../components/IconBtn";
import { HiPencil, HiTrash, HiIdentification, HiKey, HiChevronDown, HiChevronUp } from "react-icons/hi2";
import { useAuth } from "../contexts/AuthContext";
import { IDCardModal } from "../components/IDCardModal";

export function Agents({ toast }) {
  const { user } = useAuth();
  const { data: agents, loading, refresh: reloadAgents } = useData("/agents");
  const { data: schemes } = useData("/schemes");
  const { data: groups } = useData("/groups");

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [printingEntity, setPrintingEntity] = useState(null);
  const [expandedAgent, setExpandedAgent] = useState(null);

  // Filters
  const [filterYear, setFilterYear] = useState("");
  const [filterScheme, setFilterScheme] = useState("");
  const [filterGroup, setFilterGroup] = useState("");
  const [summaryData, setSummaryData] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);

  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", pan: "", aadhaar: "", photo: "", dob: "" });
  const [errors, setErrors] = useState({});
  const [resetPwInfo, setResetPwInfo] = useState(null);
  const [newAgentInfo, setNewAgentInfo] = useState(null);

  const isSuperAdmin = user?.role === "super_admin";
  const isAdmin = user?.role === "admin";
  const canEdit = isSuperAdmin || isAdmin;

  // Fetch summary when filters change
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const token = localStorage.getItem("token");
        const API_BASE = import.meta.env.VITE_API_BASE || "https://chitfund-cxnp.onrender.com/api";
        const params = new URLSearchParams();
        if (filterYear) params.set("year", filterYear);
        if (filterScheme) params.set("schemeId", filterScheme);
        if (filterGroup) params.set("groupId", filterGroup);
        const res = await fetch(`${API_BASE}/agents/summary/filter?${params}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setSummaryData(data.agents || []);
          setAvailableYears(data.availableYears || []);
        }
      } catch (e) { /* ignore */ }
    };
    fetchSummary();
  }, [filterYear, filterScheme, filterGroup]);

  const displayAgents = summaryData || agents.map(a => ({
    agentId: a.agentId, name: a.name, phone: a.phone,
    photo: a.photo, status: a.status,
    customerCount: a.customers?.length || 0,
    joinedChitCount: 0, totalPaid: 0, totalPending: 0, totalDue: 0,
    totalCommission: 0, paidCommission: 0, pendingCommission: 0, joinedChits: [],
  }));

  const filtered = displayAgents.filter(
    a => a.name?.toLowerCase().includes(search.toLowerCase()) || a.phone?.includes(search) || a.agentId?.includes(search)
  );

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!/^\d{10}$/.test(form.phone)) e.phone = "10 digit phone required";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
    if (!form.pan.trim()) e.pan = "PAN required";
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(form.pan)) e.pan = "Invalid PAN (e.g. ABCDE1234F)";
    if (!/^\d{12}$/.test(form.aadhaar)) e.aadhaar = "12 digit Aadhaar required";
    if (!form.address.trim()) e.address = "Address required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      if (editingAgent) {
        await updateData("/agents", editingAgent.agentId, { ...editingAgent, ...form });
        toast.add("Agent updated!");
        resetForm();
        reloadAgents();
      } else {
        const created = await createData("/agents", form);
        toast.add("Agent created!");
        resetForm();
        reloadAgents();
        if (created?.agentId) {
          const dobStr = form.dob ? new Date(form.dob).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : null;
          const pw = form.dob ? `${String(new Date(form.dob).getDate()).padStart(2,"0")}${String(new Date(form.dob).getMonth()+1).padStart(2,"0")}${new Date(form.dob).getFullYear()}` : "welcome@2026";
          setNewAgentInfo({ agentId: created.agentId, name: created.name, password: pw, dob: dobStr });
        }
      }
    } catch (err) {
      toast.add("Error: " + err.message, "error");
    }
  };

  const resetForm = () => {
    setShowForm(false); setEditingAgent(null);
    setForm({ name: "", phone: "", email: "", address: "", pan: "", aadhaar: "", photo: "", dob: "" });
    setErrors({});
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setForm({ ...form, photo: ev.target.result });
    reader.readAsDataURL(file);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this agent?")) return;
    try { await deleteData("/agents", id); toast.add("Deleted!"); reloadAgents(); }
    catch (err) { toast.add(err.message, "error"); }
  };

  const handleResetPassword = async (agent) => {
    if (!confirm(`Reset password for ${agent.name} to their DOB?`)) return;
    try {
      const token = localStorage.getItem("token");
      const API_BASE = import.meta.env.VITE_API_BASE || "https://chitfund-cxnp.onrender.com/api";
      const res = await fetch(`${API_BASE}/agents/${agent.agentId}/reset-password`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setResetPwInfo({ agentId: agent.agentId, name: agent.name, password: data.newPassword });
    } catch (err) {
      toast.add("Error: " + err.message, "error");
    }
  };

  if (loading && !summaryData) return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;

  const inp = { padding: "10px 14px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#f8fafc", fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box" };
  const selectStyle = { ...inp, cursor: "pointer" };

  const currentYear = new Date().getFullYear();
  const yearOptions = [...new Set([currentYear, ...availableYears])].sort((a, b) => b - a);

  return (
    <div>
      <SectionHeader
        title="Agent Management"
        subtitle="Manage agents, view payment details, commissions & joined chits"
        actions={canEdit ? [<Btn key="a" label="+ Add Agent" primary onClick={() => { resetForm(); setShowForm(true); }} />] : []}
      />

      {/* Filter Bar */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20, alignItems: "center" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Filters:</div>
        <select value={filterYear} onChange={e => setFilterYear(e.target.value)} style={{ ...selectStyle, maxWidth: 120 }}>
          <option value="">All Years</option>
          {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={filterScheme} onChange={e => { setFilterScheme(e.target.value); setFilterGroup(""); }} style={{ ...selectStyle, maxWidth: 200 }}>
          <option value="">All Schemes</option>
          {schemes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={filterGroup} onChange={e => setFilterGroup(e.target.value)} style={{ ...selectStyle, maxWidth: 200 }}>
          <option value="">All Groups</option>
          {groups.filter(g => !filterScheme || g.schemeId === filterScheme).map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        {(filterYear || filterScheme || filterGroup) && (
          <button onClick={() => { setFilterYear(""); setFilterScheme(""); setFilterGroup(""); }}
            style={{ fontSize: 12, padding: "6px 12px", borderRadius: 6, border: "1px solid #d1d5db", background: "#fff", cursor: "pointer", color: "#6b7280" }}>
            Clear Filters
          </button>
        )}
      </div>

      {showForm && canEdit && (
        <div style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>{editingAgent ? "Edit Agent" : "New Agent"}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "12px 20px" }}>
            <div style={{ gridColumn: "1/-1", display: "flex", gap: 16, alignItems: "center", background: "#fff", padding: 12, borderRadius: 8, border: "1px dashed #cbd5e1" }}>
              {form.photo ? (
                <img src={form.photo} alt="Avatar" style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", border: "2px solid #e2e8f0" }} />
              ) : (
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 12 }}>No img</div>
              )}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#2563eb", cursor: "pointer" }}>
                  Upload Photo
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: "none" }} />
                </label>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>Square photos work best. (Max 2MB)</div>
              </div>
            </div>
            {[["Full Name *", "name"], ["Phone *", "phone"], ["Email", "email"], ["PAN *", "pan"], ["Aadhaar *", "aadhaar"], ["DOB", "dob"]].map(([lbl, key]) => (
              <div key={key}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>{lbl}</label>
                <input type={key === "dob" ? "date" : "text"} style={inp} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
                {errors[key] && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 3 }}>{errors[key]}</div>}
              </div>
            ))}
            <div style={{ gridColumn: "1/-1" }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Address *</label>
              <input style={inp} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
              {errors.address && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 3 }}>{errors.address}</div>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <Btn label={editingAgent ? "Update" : "Add Agent"} primary onClick={handleSubmit} />
            <Btn label="Cancel" onClick={resetForm} />
          </div>
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <input style={{ ...inp, maxWidth: 320 }} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search agent ID, name, or phone..." />
      </div>

      {filtered.map(agent => {
        const isExpanded = expandedAgent === agent.agentId;
        return (
          <div key={agent.agentId} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, marginBottom: 16, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", padding: "14px 20px", gap: 12, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{agent.name}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                  {agent.agentId} · {agent.phone}
                </div>
              </div>

              {summaryData && (
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontWeight: 700, color: "#059669", fontSize: 13 }}>₹{(agent.totalPaid || 0).toLocaleString()}</div>
                    <div style={{ fontSize: 10, color: "#94a3b8" }}>Paid</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontWeight: 700, color: "#d97706", fontSize: 13 }}>₹{(agent.totalPending || 0).toLocaleString()}</div>
                    <div style={{ fontSize: 10, color: "#94a3b8" }}>Pending</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontWeight: 700, color: "#dc2626", fontSize: 13 }}>₹{(agent.totalDue || 0).toLocaleString()}</div>
                    <div style={{ fontSize: 10, color: "#94a3b8" }}>Due</div>
                  </div>
                  <div style={{ textAlign: "center", padding: "0 8px", borderLeft: "1px solid #e5e7eb" }}>
                    <div style={{ fontWeight: 700, color: "#7c3aed", fontSize: 13 }}>₹{(agent.totalCommission || 0).toLocaleString()}</div>
                    <div style={{ fontSize: 10, color: "#94a3b8" }}>Commission</div>
                  </div>
                </div>
              )}

              <div style={{ fontSize: 12, color: "#64748b", textAlign: "center", paddingRight: 10 }}>
                <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 13 }}>{agent.customerCount || 0}</div>
                <div>Customers</div>
              </div>

              {agent.joinedChitCount !== undefined && (
                <div style={{ fontSize: 12, color: "#64748b", textAlign: "center", paddingRight: 10 }}>
                  <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 13 }}>{agent.joinedChitCount}</div>
                  <div>Chits</div>
                </div>
              )}

              <Badge text={agent.status || "Active"} color={agent.status === "Active" ? "green" : "red"} />

              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <IconBtn icon={isExpanded ? <HiChevronUp size={14} /> : <HiChevronDown size={14} />}
                  onClick={() => setExpandedAgent(isExpanded ? null : agent.agentId)} color="#6b7280" title="Details" />
                <IconBtn icon={<HiIdentification size={14} />} onClick={() => setPrintingEntity(agent)} color="#0ea5e9" title="Print ID" />
                {canEdit && <IconBtn icon={<HiKey size={14} />} onClick={() => handleResetPassword(agent)} color="#7c3aed" title="Reset Password to DOB" />}
                {canEdit && <IconBtn icon={<HiPencil size={14} />} onClick={() => { setEditingAgent(agent); setForm({ name: agent.name, phone: agent.phone, email: agent.email || "", address: agent.address || "", pan: agent.pan || "", aadhaar: agent.aadhaar || "", photo: agent.photo || "", dob: agent.dob ? agent.dob.split("T")[0] : "" }); setShowForm(true); }} color="#2563eb" title="Edit" />}
                {canEdit && <IconBtn icon={<HiTrash size={14} />} onClick={() => handleDelete(agent.agentId)} color="#dc2626" title="Delete" />}
              </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
              <div style={{ borderTop: "1px solid #e5e7eb", padding: "16px 20px", background: "#f8fafc" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 12 }}>Joined Chits & Payment Details</div>

                {agent.joinedChits && agent.joinedChits.length > 0 ? (
                  <div style={{ display: "grid", gap: 8 }}>
                    {agent.joinedChits.map((chit, idx) => (
                      <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", borderRadius: 8, padding: "10px 14px", border: "1px solid #e5e7eb", flexWrap: "wrap", gap: 8 }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13, color: "#0f172a" }}>{chit.groupName}</div>
                          <div style={{ fontSize: 11, color: "#64748b" }}>{chit.schemeName} · ₹{chit.schemeAmount?.toLocaleString()} · From ₹{chit.monthlyInstallment}</div>
                        </div>
                        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                          <div style={{ textAlign: "center" }}>
                            <div style={{ fontWeight: 600, fontSize: 13, color: "#0f172a" }}>{chit.memberCount}</div>
                            <div style={{ fontSize: 10, color: "#94a3b8" }}>Members</div>
                          </div>
                          <div style={{ textAlign: "center" }}>
                            <div style={{ fontWeight: 600, fontSize: 13, color: "#059669" }}>₹{(chit.totalPaid || 0).toLocaleString()}</div>
                            <div style={{ fontSize: 10, color: "#94a3b8" }}>Collected</div>
                          </div>
                          <Badge text={chit.status} color={chit.status === "Active" ? "green" : "red"} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: "#94a3b8", textAlign: "center", padding: 16 }}>No chit groups found for this agent.</div>
                )}

                {/* Commission Summary */}
                {agent.totalCommission > 0 && (
                  <div style={{ marginTop: 12, display: "flex", gap: 20, flexWrap: "wrap" }}>
                    <div style={{ background: "#fff", borderRadius: 8, padding: "10px 16px", border: "1px solid #e5e7eb", flex: 1, minWidth: 140 }}>
                      <div style={{ fontSize: 11, color: "#64748b" }}>Total Commission</div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "#7c3aed" }}>₹{(agent.totalCommission || 0).toLocaleString()}</div>
                    </div>
                    <div style={{ background: "#fff", borderRadius: 8, padding: "10px 16px", border: "1px solid #e5e7eb", flex: 1, minWidth: 140 }}>
                      <div style={{ fontSize: 11, color: "#64748b" }}>Paid</div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "#059669" }}>₹{(agent.paidCommission || 0).toLocaleString()}</div>
                    </div>
                    <div style={{ background: "#fff", borderRadius: 8, padding: "10px 16px", border: "1px solid #e5e7eb", flex: 1, minWidth: 140 }}>
                      <div style={{ fontSize: 11, color: "#64748b" }}>Pending</div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "#d97706" }}>₹{(agent.pendingCommission || 0).toLocaleString()}</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: 48, color: "#94a3b8", fontSize: 14 }}>No agents found.</div>
      )}

      {printingEntity && (
        <IDCardModal
          entity={printingEntity}
          type="Agent"
          onClose={() => setPrintingEntity(null)}
        />
      )}

      {resetPwInfo && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,0.7)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 32, maxWidth: 400, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>✅ Password Reset</div>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>Share these credentials with <strong>{resetPwInfo.name}</strong></div>
            <div style={{ background: "#f1f5f9", borderRadius: 10, padding: 16, marginBottom: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 16px", fontSize: 13 }}>
                <span style={{ fontWeight: 600, color: "#64748b" }}>Agent ID:</span>
                <span style={{ fontWeight: 700, color: "#0f172a", fontFamily: "monospace" }}>{resetPwInfo.agentId}</span>
                <span style={{ fontWeight: 600, color: "#64748b" }}>Password:</span>
                <span style={{ fontWeight: 700, color: "#2563eb", fontFamily: "monospace", fontSize: 16 }}>{resetPwInfo.password}</span>
              </div>
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 16 }}>Format: DDMMYYYY (Date of Birth). Agent can change it after login.</div>
            <button onClick={() => setResetPwInfo(null)} style={{ width: "100%", padding: "10px", borderRadius: 8, background: "#2563eb", color: "#fff", border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Done</button>
          </div>
        </div>
      )}

      {newAgentInfo && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,0.7)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 32, maxWidth: 420, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>🎉 Agent Created!</div>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>Share these login credentials with <strong>{newAgentInfo.name}</strong></div>
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: 16, marginBottom: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 16px", fontSize: 13 }}>
                <span style={{ fontWeight: 600, color: "#64748b" }}>Agent ID:</span>
                <span style={{ fontWeight: 700, color: "#0f172a", fontFamily: "monospace" }}>{newAgentInfo.agentId}</span>
                <span style={{ fontWeight: 600, color: "#64748b" }}>Password:</span>
                <span style={{ fontWeight: 700, color: "#16a34a", fontFamily: "monospace", fontSize: 16 }}>{newAgentInfo.password}</span>
                {newAgentInfo.dob && <>
                  <span style={{ fontWeight: 600, color: "#64748b" }}>DOB:</span>
                  <span style={{ color: "#475569" }}>{newAgentInfo.dob}</span>
                </>}
              </div>
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 16 }}>Password = DOB in DDMMYYYY format. If no DOB entered, default is <code>welcome@2026</code>.</div>
            <button onClick={() => setNewAgentInfo(null)} style={{ width: "100%", padding: "10px", borderRadius: 8, background: "#16a34a", color: "#fff", border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Got it!</button>
          </div>
        </div>
      )}
    </div>
  );
}