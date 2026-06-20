// Employees page component
import { useState } from "react";
import { useData } from "../hooks/useData";
import { createData, updateData, deleteData } from "../utils/api";
import { SectionHeader } from "../components/SectionHeader";
import { Table } from "../components/Table";
import { Badge } from "../components/Badge";
import { Btn } from "../components/Btn";
import { Input } from "../components/Input";

export function Employees({ dark, toast }) {
  const { data: employees, loading } = useData('/employees');
  const [refresh, setRefresh] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [form, setForm] = useState({ name: "", role: "", phone: "", email: "", branchId: "" });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.role.trim()) newErrors.role = "Role is required";
    if (!form.phone.trim()) newErrors.phone = "Phone is required";
    if (!/^\d{10}$/.test(form.phone)) newErrors.phone = "Phone must be 10 digits";
    if (!form.email.trim()) newErrors.email = "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Invalid email format";
    if (!form.branchId) newErrors.branchId = "Branch is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      const employeeData = {
        ...form,
        id: editingEmployee ? editingEmployee.id : "E" + Date.now().toString().slice(-6),
        status: "Active"
      };

      if (editingEmployee) {
        await updateData('/employees', editingEmployee.id, employeeData);
        toast.add("Employee updated successfully!");
      } else {
        await createData('/employees', employeeData);
        toast.add("Employee added successfully!");
      }
      
      setShowForm(false);
      setEditingEmployee(null);
      setForm({ name: "", role: "", phone: "", email: "", branchId: "" });
      setErrors({});
      setRefresh(refresh + 1);
    } catch (error) {
      toast.add("Error saving employee: " + error.message, "error");
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setForm({
      name: employee.name,
      role: employee.role,
      phone: employee.phone,
      email: employee.email,
      branchId: employee.branchId
    });
    setShowForm(true);
  };

  const handleDelete = async (employeeId) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;
    
    try {
      await deleteData('/employees', employeeId);
      toast.add("Employee deleted successfully!");
      setRefresh(refresh + 1);
    } catch (error) {
      toast.add("Error deleting employee: " + error.message, "error");
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;

  return (
    <div>
      <SectionHeader title="Employee Management" subtitle="Manage staff and employees" dark={dark}
        actions={[<Btn key="a" label="+ Add Employee" onClick={() => { setEditingEmployee(null); setForm({ name: "", role: "", phone: "", email: "", branchId: "" }); setShowForm(true); }} primary />]} />

      {showForm && (
        <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#f9fafb", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 16 }}>{editingEmployee ? "Edit Employee" : "New Employee"}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "0 20px" }}>
            <div>
              <Input label="Full Name *" value={form.name} onChange={v => setForm({ ...form, name: v })} dark={dark} />
              {errors.name && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.name}</div>}
            </div>
            <div>
              <Input label="Role *" value={form.role} onChange={v => setForm({ ...form, role: v })} dark={dark} options={["Manager", "Agent", "Collector", "Accountant", "Admin"].map(v => ({ value: v, label: v }))} />
              {errors.role && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.role}</div>}
            </div>
            <div>
              <Input label="Phone *" value={form.phone} onChange={v => setForm({ ...form, phone: v })} dark={dark} />
              {errors.phone && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.phone}</div>}
            </div>
            <div>
              <Input label="Email *" value={form.email} onChange={v => setForm({ ...form, email: v })} dark={dark} />
              {errors.email && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.email}</div>}
            </div>
            <div>
              <Input label="Branch *" value={form.branchId} onChange={v => setForm({ ...form, branchId: v })} dark={dark} options={["Main Branch", "Branch A", "Branch B"].map(v => ({ value: v, label: v }))} />
              {errors.branchId && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.branchId}</div>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <Btn label={editingEmployee ? "Update Employee" : "Save Employee"} onClick={handleSubmit} primary />
            <Btn label="Cancel" onClick={() => { setShowForm(false); setEditingEmployee(null); setForm({ name: "", role: "", phone: "", email: "", branchId: "" }); setErrors({}); }} />
          </div>
        </div>
      )}

      <Table dark={dark} cols={["ID", "Name", "Role", "Phone", "Email", "Branch", "Status", "Actions"]}
        rows={employees.map(e => [
          e.id,
          e.name,
          e.role,
          e.phone,
          e.email,
          e.branchId,
          <Badge key={e.id} text={e.status} color={e.status === "Active" ? "green" : "red"} />,
          <div key={e.id} style={{ display: "flex", gap: 6 }}>
            <button onClick={() => handleEdit(e)} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: "1px solid #2563eb", background: "transparent", color: "#2563eb", cursor: "pointer" }}>Edit</button>
            <button onClick={() => handleDelete(e.id)} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: "1px solid #dc2626", background: "transparent", color: "#dc2626", cursor: "pointer" }}>Delete</button>
          </div>
        ])} />
    </div>
  );
}
