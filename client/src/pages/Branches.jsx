// Branches page component
import { useState } from "react";
import { useData } from "../hooks/useData";
import { createData, updateData, deleteData } from "../utils/api";
import { SectionHeader } from "../components/SectionHeader";
import { Badge } from "../components/Badge";
import { Btn } from "../components/Btn";
import { Input } from "../components/Input";

export function Branches({ dark, toast }) {
  const { data: branches, loading } = useData('/branches');
  const [refresh, setRefresh] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [form, setForm] = useState({ name: "", address: "", city: "", phone: "", manager: "" });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Branch name is required";
    if (!form.address.trim()) newErrors.address = "Address is required";
    if (!form.city.trim()) newErrors.city = "City is required";
    if (!form.phone.trim()) newErrors.phone = "Phone is required";
    if (!/^\d{10}$/.test(form.phone)) newErrors.phone = "Phone must be 10 digits";
    if (!form.manager.trim()) newErrors.manager = "Manager name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      const branchData = {
        ...form,
        id: editingBranch ? editingBranch.id : "B" + Date.now().toString().slice(-6),
        status: "Active",
        groups: editingBranch ? editingBranch.groups : [],
        members: editingBranch ? editingBranch.members : 0
      };

      if (editingBranch) {
        await updateData('/branches', editingBranch.id, branchData);
        toast.add("Branch updated successfully!");
      } else {
        await createData('/branches', branchData);
        toast.add("Branch added successfully!");
      }
      
      setShowForm(false);
      setEditingBranch(null);
      setForm({ name: "", address: "", city: "", phone: "", manager: "" });
      setErrors({});
      setRefresh(refresh + 1);
    } catch (error) {
      toast.add("Error saving branch: " + error.message, "error");
    }
  };

  const handleEdit = (branch) => {
    setEditingBranch(branch);
    setForm({
      name: branch.name,
      address: branch.address,
      city: branch.city || "",
      phone: branch.phone,
      manager: branch.manager
    });
    setShowForm(true);
  };

  const handleDelete = async (branchId) => {
    if (!confirm("Are you sure you want to delete this branch?")) return;
    
    try {
      await deleteData('/branches', branchId);
      toast.add("Branch deleted successfully!");
      setRefresh(refresh + 1);
    } catch (error) {
      toast.add("Error deleting branch: " + error.message, "error");
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;

  return (
    <div>
      <SectionHeader title="Branch Management" subtitle="All company branches" dark={dark}
        actions={[<Btn key="a" label="+ Add Branch" onClick={() => { setEditingBranch(null); setForm({ name: "", address: "", city: "", phone: "", manager: "" }); setShowForm(true); }} primary />]} />

      {showForm && (
        <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#f9fafb", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 16 }}>{editingBranch ? "Edit Branch" : "New Branch"}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "0 20px" }}>
            <div>
              <Input label="Branch Name *" value={form.name} onChange={v => setForm({ ...form, name: v })} dark={dark} />
              {errors.name && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.name}</div>}
            </div>
            <div>
              <Input label="Address *" value={form.address} onChange={v => setForm({ ...form, address: v })} dark={dark} />
              {errors.address && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.address}</div>}
            </div>
            <div>
              <Input label="City *" value={form.city} onChange={v => setForm({ ...form, city: v })} dark={dark} />
              {errors.city && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.city}</div>}
            </div>
            <div>
              <Input label="Phone *" value={form.phone} onChange={v => setForm({ ...form, phone: v })} dark={dark} />
              {errors.phone && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.phone}</div>}
            </div>
            <div>
              <Input label="Manager *" value={form.manager} onChange={v => setForm({ ...form, manager: v })} dark={dark} />
              {errors.manager && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.manager}</div>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <Btn label={editingBranch ? "Update Branch" : "Save Branch"} onClick={handleSubmit} primary />
            <Btn label="Cancel" onClick={() => { setShowForm(false); setEditingBranch(null); setForm({ name: "", address: "", city: "", phone: "", manager: "" }); setErrors({}); }} />
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16 }}>
        {branches.map(b => (
          <div key={b.id} style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 20, borderLeft: "4px solid #d97706" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: dark ? "#f3f4f6" : "#111", marginBottom: 6 }}>🏢 {b.name}</div>
            <div style={{ fontSize: 12, color: dark ? "rgba(255,255,255,.5)" : "#6b7280", marginBottom: 12 }}>{b.address}</div>
            {[["Manager", b.manager], ["Phone", b.phone], ["Active Groups", b.groups || 0], ["Members", b.members || 0]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                <span style={{ color: dark ? "rgba(255,255,255,.5)" : "#6b7280" }}>{k}</span>
                <span style={{ fontWeight: 600, color: dark ? "#f3f4f6" : "#111" }}>{v}</span>
              </div>
            ))}
            <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
              <button onClick={() => handleEdit(b)} style={{ fontSize: 11, padding: "4px 8px", borderRadius: 6, border: "1px solid #2563eb", background: "transparent", color: "#2563eb", cursor: "pointer" }}>Edit</button>
              <button onClick={() => handleDelete(b.id)} style={{ fontSize: 11, padding: "4px 8px", borderRadius: 6, border: "1px solid #dc2626", background: "transparent", color: "#dc2626", cursor: "pointer" }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
