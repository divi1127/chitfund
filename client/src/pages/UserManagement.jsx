import { useState, useEffect } from "react";
import { SectionHeader } from "../components/SectionHeader";
import { Table } from "../components/Table";
import { Badge } from "../components/Badge";
import { Btn } from "../components/Btn";
import { Input } from "../components/Input";
import { useAuth } from "../contexts/AuthContext";

const ALL_MODULES = ["dashboard", "members", "schemes", "groups", "collections", "billing", "auctions", "prizes", "accounting", "reports", "employees", "branches", "notifications", "settings", "enquiries", "kyc"];

const ALL_PERMISSIONS = ["create", "edit", "delete", "view"];

const ROLE_OPTIONS = [
  { value: "super_admin", label: "Super Admin" },
  { value: "sub_admin", label: "Sub Admin" },
  { value: "user", label: "User" },
];

export function UserManagement({ dark, toast }) {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ userId: "", password: "", name: "", email: "", phone: "", role: "user", modules: [], permissions: [] });
  const [errors, setErrors] = useState({});

  const canManageAll = currentUser?.role === "super_admin";

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${currentUser.token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!form.userId.trim()) newErrors.userId = "User ID is required";
    if (!form.password.trim() && !editingUser) newErrors.password = "Password is required";
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Invalid email format";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      const userData = {
        ...form,
        modules: form.role === "super_admin" ? ALL_MODULES : form.modules,
        permissions: form.role === "super_admin" ? ALL_PERMISSIONS : form.permissions
      };

      const url = editingUser ? `/api/users/${editingUser._id}` : '/api/users';
      const method = editingUser ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentUser.token}` },
        body: JSON.stringify(editingUser && !userData.password ? { ...userData, password: undefined } : userData)
      });

      if (response.ok) {
        toast.add(editingUser ? "User updated successfully!" : "User created successfully!");
        setShowForm(false);
        setEditingUser(null);
        setForm({ userId: "", password: "", name: "", email: "", phone: "", role: "user", modules: [], permissions: [] });
        setErrors({});
        fetchUsers();
      } else {
        const err = await response.json();
        toast.add(err.message || "Error saving user", "error");
      }
    } catch (error) {
      toast.add("Error saving user: " + error.message, "error");
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setForm({
      userId: user.userId,
      password: "",
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      role: user.role,
      modules: user.modules || [],
      permissions: user.permissions || []
    });
    setShowForm(true);
  };

  const handleDelete = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${currentUser.token}` }
      });
      if (response.ok) {
        toast.add("User deleted successfully!");
        fetchUsers();
      } else {
        const err = await response.json();
        toast.add(err.message || "Error deleting user", "error");
      }
    } catch (error) {
      toast.add("Error deleting user: " + error.message, "error");
    }
  };

  const toggleModule = (moduleId) => {
    if (form.modules.includes(moduleId)) {
      setForm({ ...form, modules: form.modules.filter(m => m !== moduleId) });
    } else {
      setForm({ ...form, modules: [...form.modules, moduleId] });
    }
  };

  const togglePermission = (permission) => {
    if (form.permissions.includes(permission)) {
      setForm({ ...form, permissions: form.permissions.filter(p => p !== permission) });
    } else {
      setForm({ ...form, permissions: [...form.permissions, permission] });
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;

  return (
    <div>
      <SectionHeader title="User Management" subtitle={canManageAll ? "Manage all system users and permissions" : "Manage users in your branch"} dark={dark}
        actions={[<Btn key="add" label="+ Add User" onClick={() => { setEditingUser(null); setForm({ userId: "", password: "", name: "", email: "", phone: "", role: "user", modules: [], permissions: [] }); setShowForm(true); }} primary />]} />

      {showForm && (
        <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#f9fafb", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 16 }}>{editingUser ? "Edit User" : "New User"}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "0 20px" }}>
            <div>
              <Input label="User ID *" value={form.userId} onChange={v => setForm({ ...form, userId: v })} dark={dark} disabled={!!editingUser} />
              {errors.userId && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.userId}</div>}
            </div>
            <div>
              <Input label={editingUser ? "Password (leave blank to keep)" : "Password *"} value={form.password} onChange={v => setForm({ ...form, password: v })} dark={dark} type="password" />
              {errors.password && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.password}</div>}
            </div>
            <div>
              <Input label="Full Name *" value={form.name} onChange={v => setForm({ ...form, name: v })} dark={dark} />
              {errors.name && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.name}</div>}
            </div>
            <div>
              <Input label="Email *" value={form.email} onChange={v => setForm({ ...form, email: v })} dark={dark} />
              {errors.email && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.email}</div>}
            </div>
            <div>
              <Input label="Phone" value={form.phone} onChange={v => setForm({ ...form, phone: v })} dark={dark} />
            </div>
            {canManageAll && (
              <div>
                <Input label="Role *" value={form.role} onChange={v => setForm({ ...form, role: v })} dark={dark} options={ROLE_OPTIONS} />
              </div>
            )}
          </div>

          {form.role !== "super_admin" && canManageAll && (
            <>
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: dark ? "rgba(255,255,255,.6)" : "#374151", marginBottom: 12 }}>Module Access</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 8 }}>
                  {ALL_MODULES.map(module => (
                    <label key={module} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: dark ? "rgba(255,255,255,.7)" : "#374151", cursor: "pointer" }}>
                      <input type="checkbox" checked={form.modules.includes(module)} onChange={() => toggleModule(module)} style={{ cursor: "pointer" }} />
                      {module.charAt(0).toUpperCase() + module.slice(1).replace(/-/g, ' ')}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: dark ? "rgba(255,255,255,.6)" : "#374151", marginBottom: 12 }}>Permissions</div>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  {ALL_PERMISSIONS.map(permission => (
                    <label key={permission} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: dark ? "rgba(255,255,255,.7)" : "#374151", cursor: "pointer" }}>
                      <input type="checkbox" checked={form.permissions.includes(permission)} onChange={() => togglePermission(permission)} style={{ cursor: "pointer" }} />
                      {permission.charAt(0).toUpperCase() + permission.slice(1)}
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <Btn label={editingUser ? "Update User" : "Create User"} onClick={handleSubmit} primary />
            <Btn label="Cancel" onClick={() => { setShowForm(false); setEditingUser(null); setForm({ userId: "", password: "", name: "", email: "", phone: "", role: "user", modules: [], permissions: [] }); setErrors({}); }} />
          </div>
        </div>
      )}

      <Table dark={dark} cols={["User ID", "Name", "Email", "Role", "Modules", "Branch", "Status", "Actions"]}
        rows={users.map(u => [
          u.userId,
          u.name,
          u.email,
          <Badge key={u._id} text={u.role === "super_admin" ? "Super Admin" : u.role === "sub_admin" ? "Sub Admin" : "User"} color={u.role === "super_admin" ? "purple" : u.role === "sub_admin" ? "blue" : "gray"} />,
          u.role === "super_admin" ? "All" : `${u.modules?.length || 0} modules`,
          u.branch || u.assignedBranch || " ",
          <Badge key={u._id} text={u.status} color={u.status === "active" ? "green" : "red"} />,
          <div key={u._id} style={{ display: "flex", gap: 6 }}>
            <button onClick={() => handleEdit(u)} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: "1px solid #2563eb", background: "transparent", color: "#2563eb", cursor: "pointer" }}>Edit</button>
            {canManageAll && u.role !== "super_admin" && (
              <button onClick={() => handleDelete(u._id)} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: "1px solid #dc2626", background: "transparent", color: "#dc2626", cursor: "pointer" }}>Delete</button>
            )}
          </div>
        ])} />
    </div>
  );
}
