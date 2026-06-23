import { useState } from "react";
import { useData } from "../hooks/useData";
import { createData, updateData, deleteData } from "../utils/api";
import { SectionHeader } from "../components/SectionHeader";
import { Table } from "../components/Table";
import { Badge } from "../components/Badge";
import { Btn } from "../components/Btn";
import { Input } from "../components/Input";
import { HiPencil, HiTrash, HiEye, HiEyeSlash } from "react-icons/hi2";
import { IconBtn } from "../components/IconBtn";
import { useAuth } from "../contexts/AuthContext";

const ALL_MODULES = ["dashboard", "members", "schemes", "groups", "collections", "billing", "auctions", "prizes", "accounting", "reports", "employees", "branches", "notifications", "settings"];

const ALL_PERMISSIONS = ["create", "edit", "delete", "view"];

export function UserManagement({ toast }) {
  const { user: currentUser } = useAuth();
  const { data: users, loading } = useData('/users');
  const [refresh, setRefresh] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ userId: "", password: "", name: "", email: "", role: "user", modules: [], permissions: [] });
  const [errors, setErrors] = useState({});
  const [visiblePw, setVisiblePw] = useState({});
  const isSuperAdmin = currentUser?.role === "super_admin";

  const togglePwVisibility = (userId) => {
    setVisiblePw(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

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
        permissions: form.role === "super_admin" ? ALL_PERMISSIONS : form.permissions,
        plainPassword: form.password
      };

      if (editingUser) {
        await updateData('/users', editingUser.id, userData);
        toast.add("User updated successfully!");
      } else {
        await createData('/users', userData);
        toast.add("User created successfully!");
      }
      
      setShowForm(false);
      setEditingUser(null);
      setForm({ userId: "", password: "", name: "", email: "", role: "user", modules: [], permissions: [] });
      setErrors({});
      setRefresh(refresh + 1);
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
      role: user.role,
      modules: user.modules || [],
      permissions: user.permissions || []
    });
    setShowForm(true);
  };

  const handleDelete = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteData('/users', userId);
      toast.add("User deleted successfully!");
      setRefresh(refresh + 1);
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
      <SectionHeader title="User Management" subtitle="Manage system users and permissions"
        actions={isSuperAdmin ? [<Btn key="add" label="+ Add User" onClick={() => { setEditingUser(null); setForm({ userId: "", password: "", name: "", email: "", role: "user", modules: [], permissions: [] }); setShowForm(true); }} primary />] : []} />

      {showForm && isSuperAdmin && (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>{editingUser ? "Edit User" : "New User"}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "0 20px" }}>
            <div>
              <Input label="User ID *" value={form.userId} onChange={v => setForm({ ...form, userId: v })} />
              {errors.userId && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.userId}</div>}
            </div>
            <div>
              <Input label="Password *" value={form.password} onChange={v => setForm({ ...form, password: v })} type="password" placeholder={editingUser ? "Leave blank to keep current" : ""} />
              {errors.password && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.password}</div>}
            </div>
            <div>
              <Input label="Full Name *" value={form.name} onChange={v => setForm({ ...form, name: v })} />
              {errors.name && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.name}</div>}
            </div>
            <div>
              <Input label="Email *" value={form.email} onChange={v => setForm({ ...form, email: v })} />
              {errors.email && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.email}</div>}
            </div>
            <div>
              <Input label="Role *" value={form.role} onChange={v => setForm({ ...form, role: v })} options={["super_admin", "sub_admin", "user"].map(v => ({ value: v, label: v === "super_admin" ? "Super Admin" : v === "sub_admin" ? "Sub Admin" : "User" }))} />
            </div>
          </div>

          {form.role !== "super_admin" && (
            <>
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 12 }}>Module Access</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 8 }}>
                  {ALL_MODULES.map(module => (
                    <label key={module} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-secondary)", cursor: "pointer" }}>
                      <input type="checkbox" checked={form.modules.includes(module)} onChange={() => toggleModule(module)} style={{ cursor: "pointer" }} />
                      {module.charAt(0).toUpperCase() + module.slice(1)}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 12 }}>Permissions</div>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  {ALL_PERMISSIONS.map(permission => (
                    <label key={permission} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-secondary)", cursor: "pointer" }}>
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
            <Btn label="Cancel" onClick={() => { setShowForm(false); setEditingUser(null); setForm({ userId: "", password: "", name: "", email: "", role: "user", modules: [], permissions: [] }); setErrors({}); }} />
          </div>
        </div>
      )}

      <Table cols={["User ID", "Name", "Email", "Password", "Role", "Modules", "Status", "Actions"]}
        rows={users.map(u => [
          u.userId,
          u.name,
          u.email,
          <div key={u.id + "pw"} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontFamily: "monospace", fontSize: 12 }}>
              {visiblePw[u.userId] ? (u.plainPassword || "—") : "••••••••"}
            </span>
            {isSuperAdmin && (
              <IconBtn
                icon={visiblePw[u.userId] ? <HiEyeSlash size={14} /> : <HiEye size={14} />}
                onClick={() => togglePwVisibility(u.userId)}
                color="#6b7280"
                title={visiblePw[u.userId] ? "Hide" : "Show"}
              />
            )}
          </div>,
          <Badge key={u.id} text={u.role === "super_admin" ? "Super Admin" : u.role === "sub_admin" ? "Sub Admin" : "User"} color={u.role === "super_admin" ? "purple" : u.role === "sub_admin" ? "blue" : "gray"} />,
          u.role === "super_admin" ? "All" : `${u.modules?.length || 0} modules`,
          <Badge key={u.id} text={u.status} color={u.status === "active" ? "green" : "red"} />,
          <div key={u.id} style={{ display: "flex", gap: 6 }}>
            {isSuperAdmin && <IconBtn icon={<HiPencil size={14} />} onClick={() => handleEdit(u)} color="#2563eb" title="Edit" />}
            {isSuperAdmin && <IconBtn icon={<HiTrash size={14} />} onClick={() => handleDelete(u.id)} color="#dc2626" title="Delete" />}
          </div>
        ])} />
    </div>
  );
}
