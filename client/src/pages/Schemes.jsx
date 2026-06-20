// Schemes page component
import { useState } from "react";
import { useData } from "../hooks/useData";
import { createData, updateData, deleteData } from "../utils/api";
import { SectionHeader } from "../components/SectionHeader";
import { Badge } from "../components/Badge";
import { Btn } from "../components/Btn";
import { Input } from "../components/Input";
import { fmt } from "../utils/helpers";

export function Schemes({ dark, toast }) {
  const { data: schemes, loading } = useData('/schemes');
  const [refresh, setRefresh] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingScheme, setEditingScheme] = useState(null);
  const [form, setForm] = useState({ name: "", amount: "", duration: "", members: "", monthlyInstallment: "", commission: "" });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Scheme name is required";
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) newErrors.amount = "Valid amount is required";
    if (!form.duration || isNaN(form.duration) || Number(form.duration) <= 0) newErrors.duration = "Valid duration is required";
    if (!form.members || isNaN(form.members) || Number(form.members) <= 0) newErrors.members = "Valid member count is required";
    if (!form.monthlyInstallment || isNaN(form.monthlyInstallment) || Number(form.monthlyInstallment) <= 0) newErrors.monthlyInstallment = "Valid monthly installment is required";
    if (!form.commission || isNaN(form.commission) || Number(form.commission) < 0 || Number(form.commission) > 100) newErrors.commission = "Commission must be between 0-100";
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
        status: "Active"
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

  const isSchemeFinished = (scheme) => {
    // Check if scheme status is explicitly set to Finished or Completed
    if (scheme.status === "Finished" || scheme.status === "Completed") return true;
    return false;
  };

  const handleToggleStatus = async (scheme) => {
    try {
      const newStatus = scheme.status === "Active" ? "Finished" : "Active";
      await updateData('/schemes', scheme.id, { ...scheme, status: newStatus });
      toast.add(`Scheme ${newStatus === "Active" ? "activated" : "finished"} successfully!`);
      setRefresh(refresh + 1);
    } catch (error) {
      toast.add("Error updating scheme status: " + error.message, "error");
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;

  return (
    <div>
      <SectionHeader title="Chit Schemes" subtitle="Manage chit fund scheme configurations" dark={dark}
        actions={[<Btn key="a" label="+ New Scheme" onClick={() => { setEditingScheme(null); setForm({ name: "", amount: "", duration: "", members: "", monthlyInstallment: "", commission: "" }); setShowForm(true); }} primary />]} />

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
              <Input label="Number of Members *" value={form.members} onChange={v => setForm({ ...form, members: v })} type="number" dark={dark} />
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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
        {schemes.map(s => (
          <div key={s.id} style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 20, borderTop: "3px solid #d97706" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: dark ? "#f3f4f6" : "#111" }}>{s.name}</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Badge text={s.status} color={s.status === "Active" ? "green" : s.status === "Finished" ? "gray" : "yellow"} />
                <button
                  onClick={() => handleToggleStatus(s)}
                  disabled={isSchemeFinished(s)}
                  style={{
                    fontSize: 11,
                    padding: "4px 8px",
                    borderRadius: 6,
                    border: s.status === "Active" ? "1px solid #dc2626" : "1px solid #10b981",
                    background: s.status === "Active" ? "#dc2626" : "#10b981",
                    color: "#fff",
                    cursor: isSchemeFinished(s) ? "not-allowed" : "pointer",
                    opacity: isSchemeFinished(s) ? 0.5 : 1
                  }}
                >
                  {s.status === "Active" ? "Finish" : "Activate"}
                </button>
                <button onClick={() => handleEdit(s)} style={{ fontSize: 11, padding: "4px 8px", borderRadius: 6, border: "1px solid #2563eb", background: "transparent", color: "#2563eb", cursor: "pointer" }}>Edit</button>
                <button onClick={() => handleDelete(s.id)} style={{ fontSize: 11, padding: "4px 8px", borderRadius: 6, border: "1px solid #dc2626", background: "transparent", color: "#dc2626", cursor: "pointer" }}>Delete</button>
              </div>
            </div>
            {[["Chit Value", fmt(s.amount)], ["Duration", s.duration + " months"], ["Members", s.members], ["Monthly", fmt(s.monthlyInstallment)], ["Commission", s.commission + "%"]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                <span style={{ color: dark ? "rgba(255,255,255,.5)" : "#6b7280" }}>{k}</span>
                <span style={{ fontWeight: 600, color: dark ? "#f3f4f6" : "#111" }}>{v}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
