import { useState } from "react";
import { useData } from "../hooks/useData";
import { createData, updateData, deleteData } from "../utils/api";
import { SectionHeader } from "../components/SectionHeader";
import { Badge } from "../components/Badge";
import { Btn } from "../components/Btn";
import { IconBtn } from "../components/IconBtn";
import { HiPencil, HiTrash, HiIdentification } from "react-icons/hi2";
import { useAuth } from "../contexts/AuthContext";
import { IDCardModal } from "../components/IDCardModal";

export function Agents({ toast }) {
  const { user } = useAuth();
  const { data: agents, loading, refresh: reloadAgents } = useData("/agents");

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [printingEntity, setPrintingEntity] = useState(null);
  
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", pan: "", aadhaar: "", photo: "", dob: "" });
  const [errors, setErrors] = useState({});

  const isSuperAdmin = user?.role === "super_admin";
  const isAdmin = user?.role === "admin";
  const canEdit = isSuperAdmin || isAdmin;

  const filtered = agents.filter(
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
      } else {
        await createData("/agents", form);
        toast.add("Agent added!");
      }
      resetForm();
      reloadAgents();
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

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;

  const inp = { padding: "10px 14px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#f8fafc", fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box" };

  return (
    <div>
      <SectionHeader
        title="Agents"
        subtitle="Manage agents and print ID Cards"
        actions={canEdit ? [<Btn key="a" label="+ Add Agent" primary onClick={() => { resetForm(); setShowForm(true); }} />] : []}
      />

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

      {filtered.map(agent => (
        <div key={agent.agentId} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, marginBottom: 16, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", padding: "14px 20px", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{agent.name}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                {agent.agentId} · {agent.phone}
                {agent.dob && <span style={{ marginLeft: 8, color: "#94a3b8" }}>DOB: {new Date(agent.dob).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>}
              </div>
            </div>
            
            <div style={{ fontSize: 12, color: "#64748b", textAlign: "center", paddingRight: 10 }}>
              <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 13 }}>{agent.customers?.length || 0}</div>
              <div>Customers</div>
            </div>

            <Badge text={agent.status || "Active"} color={agent.status === "Active" ? "green" : "red"} />
            
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <IconBtn icon={<HiIdentification size={14} />} onClick={() => setPrintingEntity(agent)} color="#0ea5e9" title="Print ID" />
              {canEdit && <IconBtn icon={<HiPencil size={14} />} onClick={() => { setEditingAgent(agent); setForm({ name: agent.name, phone: agent.phone, email: agent.email || "", address: agent.address || "", pan: agent.pan || "", aadhaar: agent.aadhaar || "", photo: agent.photo || "", dob: agent.dob || "" }); setShowForm(true); }} color="#2563eb" title="Edit" />}
              {canEdit && <IconBtn icon={<HiTrash size={14} />} onClick={() => handleDelete(agent.agentId)} color="#dc2626" title="Delete" />}
            </div>
          </div>
        </div>
      ))}

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
    </div>
  );
}
