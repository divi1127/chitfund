import { useState } from "react";
import { useData } from "../hooks/useData";
import { createData, updateData, deleteData } from "../utils/api";
import { SectionHeader } from "../components/SectionHeader";
import { Badge } from "../components/Badge";
import { Btn } from "../components/Btn";
import { Input } from "../components/Input";
import { Table } from "../components/Table";
import { fmt } from "../utils/helpers";
import { useAuth } from "../contexts/AuthContext";

export function Schemes({ dark, toast }) {
  const { user } = useAuth();
  const { data: schemes, loading } = useData('/schemes');
  const [refresh, setRefresh] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingScheme, setEditingScheme] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [form, setForm] = useState({ name: "", amount: "", duration: "", members: "", monthlyInstallment: "", commission: "" });
  const [errors, setErrors] = useState({});

  const canEdit = user?.role === "super_admin" || user?.role === "sub_admin";
  const statStyle = (color) => ({
    background: dark ? "rgba(255,255,255,.05)" : "#fff",
    border: dark ? "1px solid rgba(255,255,255,.1)" : `1px solid ${color}20`,
    borderRadius: 12, padding: "16px 20px",
  });

  const activeSchemes = schemes.filter(s => s.status === "Active");
  const totalValue = schemes.reduce((sum, s) => sum + (s.amount || 0), 0);
  const totalMonthly = schemes.reduce((sum, s) => sum + (s.monthlyInstallment || 0), 0);

  const filtered = schemes.filter(s => {
    const matchSearch = s.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Scheme name is required";
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) newErrors.amount = "Valid amount is required";
    if (!form.duration || isNaN(form.duration) || Number(form.duration) <= 0) newErrors.duration = "Valid duration is required";
    if (!form.members || isNaN(form.members) || Number(form.members) <= 0) newErrors.members = "Valid member count is required";
    if (!form.monthlyInstallment || isNaN(form.monthlyInstallment) || Number(form.monthlyInstallment) <= 0) newErrors.monthlyInstallment = "Valid monthly installment is required";
    if (!form.commission || isNaN(form.commission) || Number(form.commission) < 0 || Number(form.commission) > 100) newErrors.commission = "Commission must be 0-100";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      const schemeData = {
        ...form,
        id: editingScheme ? editingScheme.id : "S" + Date.now().toString().slice(-6),
        amount: Number(form.amount),
        duration: Number(form.duration),
        members: Number(form.members),
        monthlyInstallment: Number(form.monthlyInstallment),
        commission: Number(form.commission),
        status: editingScheme?.status || "Active"
      };
      if (editingScheme) {
        await updateData('/schemes', editingScheme.id, schemeData);
        toast.add("Scheme updated successfully!");
      } else {
        await createData('/schemes', schemeData);
        toast.add("Scheme added successfully!");
      }
      setShowForm(false);
      setEditingScheme(null);
      setForm({ name: "", amount: "", duration: "", members: "", monthlyInstallment: "", commission: "" });
      setErrors({});
      setRefresh(refresh + 1);
    } catch (error) {
      toast.add("Error saving scheme: " + error.message, "error");
    }
  };

  const handleEdit = (scheme) => {
    setEditingScheme(scheme);
    setForm({
      name: scheme.name,
      amount: scheme.amount,
      duration: scheme.duration,
      members: scheme.members,
      monthlyInstallment: scheme.monthlyInstallment,
      commission: scheme.commission
    });
    setShowForm(true);
  };

  const handleDelete = async (schemeId) => {
    if (!confirm("Are you sure you want to delete this scheme?")) return;
    try {
      await deleteData('/schemes', schemeId);
      toast.add("Scheme deleted successfully!");
      setRefresh(refresh + 1);
    } catch (error) {
      toast.add("Error deleting scheme: " + error.message, "error");
    }
  };

  const handleToggleStatus = async (scheme) => {
    try {
      const newStatus = scheme.status === "Active" ? "Closed" : "Active";
      await updateData('/schemes', scheme.id, { ...scheme, status: newStatus });
      toast.add(`Scheme ${newStatus === "Active" ? "activated" : "closed"} successfully!`);
      setRefresh(refresh + 1);
    } catch (error) {
      toast.add("Error updating scheme status: " + error.message, "error");
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: dark ? "rgba(255,255,255,.5)" : "#94a3b8" }}>Loading...</div>;

  const inp = {
    padding: "10px 14px", borderRadius: 8,
    border: dark ? "1px solid rgba(255,255,255,.15)" : "1px solid #e5e7eb",
    background: dark ? "rgba(255,255,255,.06)" : "#f8fafc",
    color: dark ? "#f1f5f9" : "#0f172a", fontSize: 14, outline: "none",
  };

  return (
    <div>
      <SectionHeader title="Chit Schemes" subtitle="Manage chit fund scheme configurations" dark={dark}
        actions={canEdit ? [<Btn key="a" label="+ New Scheme" onClick={() => { setEditingScheme(null); setForm({ name: "", amount: "", duration: "", members: "", monthlyInstallment: "", commission: "" }); setShowForm(true); }} primary />] : []} />

      {showForm && (
        <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#f9fafb", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 16 }}>{editingScheme ? "Edit Scheme" : "New Scheme"}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "0 20px" }}>
            <div>
              <Input label="Scheme Name *" value={form.name} onChange={v => setForm({ ...form, name: v })} dark={dark} />
              {errors.name && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.name}</div>}
            </div>
            <div>
              <Input label="Chit Amount (₹) *" value={form.amount} onChange={v => setForm({ ...form, amount: v })} type="number" dark={dark} />
              {errors.amount && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.amount}</div>}
            </div>
            <div>
              <Input label="Duration (months) *" value={form.duration} onChange={v => setForm({ ...form, duration: v })} type="number" dark={dark} />
              {errors.duration && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.duration}</div>}
            </div>
            <div>
              <Input label="Members *" value={form.members} onChange={v => setForm({ ...form, members: v })} type="number" dark={dark} />
              {errors.members && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.members}</div>}
            </div>
            <div>
              <Input label="Monthly Installment (₹) *" value={form.monthlyInstallment} onChange={v => setForm({ ...form, monthlyInstallment: v })} type="number" dark={dark} />
              {errors.monthlyInstallment && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.monthlyInstallment}</div>}
            </div>
            <div>
              <Input label="Commission (%) *" value={form.commission} onChange={v => setForm({ ...form, commission: v })} type="number" dark={dark} />
              {errors.commission && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.commission}</div>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <Btn label={editingScheme ? "Update Scheme" : "Save Scheme"} onClick={handleSubmit} primary />
            <Btn label="Cancel" onClick={() => { setShowForm(false); setEditingScheme(null); setForm({ name: "", amount: "", duration: "", members: "", monthlyInstallment: "", commission: "" }); setErrors({}); }} />
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 24 }}>
        <div style={statStyle("#3b82f6")}>
          <div style={{ fontSize: 11, color: dark ? "rgba(255,255,255,.5)" : "#6b7280", marginBottom: 4, fontWeight: 600 }}>Total Schemes</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#3b82f6" }}>{schemes.length}</div>
        </div>
        <div style={statStyle("#10b981")}>
          <div style={{ fontSize: 11, color: dark ? "rgba(255,255,255,.5)" : "#6b7280", marginBottom: 4, fontWeight: 600 }}>Active</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#10b981" }}>{activeSchemes.length}</div>
        </div>
        <div style={statStyle("#f59e0b")}>
          <div style={{ fontSize: 11, color: dark ? "rgba(255,255,255,.5)" : "#6b7280", marginBottom: 4, fontWeight: 600 }}>Total Chit Value</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#f59e0b" }}>{fmt(totalValue)}</div>
        </div>
        <div style={statStyle("#8b5cf6")}>
          <div style={{ fontSize: 11, color: dark ? "rgba(255,255,255,.5)" : "#6b7280", marginBottom: 4, fontWeight: 600 }}>Monthly Inflow</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#8b5cf6" }}>{fmt(totalMonthly)}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search schemes..." style={{ ...inp, maxWidth: 280 }} />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ ...inp, maxWidth: 150 }}>
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 0, overflow: "hidden" }}>
        <Table dark={dark} cols={["Scheme Name", "Chit Value", "Duration", "Members", "Monthly Installment", "Commission", "Status", "Actions"]}
          rows={filtered.map(s => [
            <span key={`n-${s.id}`} style={{ fontWeight: 600, color: dark ? "#f1f5f9" : "#0f172a" }}>{s.name}</span>,
            <span key={`v-${s.id}`} style={{ fontWeight: 700, color: "#10b981" }}>{fmt(s.amount)}</span>,
            <span key={`d-${s.id}`}>{s.duration} months</span>,
            <span key={`m-${s.id}`}>{s.members}</span>,
            <span key={`mi-${s.id}`} style={{ fontWeight: 600 }}>{fmt(s.monthlyInstallment)}</span>,
            <span key={`c-${s.id}`}>{s.commission}%</span>,
            <Badge key={`st-${s.id}`} text={s.status} color={s.status === "Active" ? "green" : "gray"} />,
            <div key={`a-${s.id}`} style={{ display: "flex", gap: 6 }}>
              {canEdit && (
                <>
                  <button onClick={() => handleEdit(s)} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: "1px solid #2563eb", background: "transparent", color: "#2563eb", cursor: "pointer", fontWeight: 600 }}>Edit</button>
                  <button onClick={() => handleToggleStatus(s)} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: `1px solid ${s.status === "Active" ? "#dc2626" : "#10b981"}`, background: s.status === "Active" ? "#dc2626" : "#10b981", color: "#fff", cursor: "pointer", fontWeight: 600 }}>
                    {s.status === "Active" ? "Close" : "Activate"}
                  </button>
                  <button onClick={() => handleDelete(s.id)} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: "1px solid #dc2626", background: "transparent", color: "#dc2626", cursor: "pointer", fontWeight: 600 }}>Delete</button>
                </>
              )}
            </div>
          ])} />
      </div>
    </div>
  );
}
