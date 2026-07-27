import { useState, useEffect } from "react";
import { SectionHeader } from "../components/SectionHeader";
import { Table } from "../components/Table";
import { Badge } from "../components/Badge";
import { Btn } from "../components/Btn";
import { Input } from "../components/Input";
import { HiPencil, HiTrash, HiIdentification } from "react-icons/hi2";
import { IconBtn } from "../components/IconBtn";
import { useAuth } from "../contexts/AuthContext";
import { IDCardModal } from "../components/IDCardModal";

const ALL_MODULES = ["dashboard", "members", "schemes", "groups", "collections", "billing", "auctions", "prizes", "accounting", "reports", "employees", "branches", "notifications", "settings", "enquiries", "kyc", "agents", "user-management", "audit-logs"];

const ALL_PERMISSIONS = ["create", "edit", "delete", "view"];

const ROLE_OPTIONS = [
  { value: "super_admin", label: "Super Admin" },
  { value: "admin", label: "Admin" },
  { value: "agent", label: "Agent" },
  { value: "customer", label: "Customer" },
];

export function UserManagement({ dark, toast }) {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [roleFilter, setRoleFilter] = useState("");
  const [form, setForm] = useState({ userId: "", password: "", name: "", email: "", phone: "", role: "user", modules: [], permissions: [], modulePermissions: [] });
  const [errors, setErrors] = useState({});
  const [printingUser, setPrintingUser] = useState(null);
  const isSuperAdmin = currentUser?.role === "super_admin";

  const canManageAll = currentUser?.role === "super_admin";

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const API_BASE = import.meta.env.VITE_API_BASE || "https://chitfund-cxnp.onrender.com/api";
      const response = await fetch(`${API_BASE}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
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

  const filteredUsers = roleFilter ? users.filter(u => u.role === roleFilter) : users;

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
      const token = localStorage.getItem("token");
      const API_BASE = import.meta.env.VITE_API_BASE || "https://chitfund-cxnp.onrender.com/api";

      const userData = {
        ...form,
        modules: form.role === "super_admin" ? ALL_MODULES : form.modules,
        permissions: form.role === "super_admin" ? ALL_PERMISSIONS : form.permissions,
        modulePermissions: form.role === "super_admin"
          ? ALL_MODULES.map(m => ({ module: m, create: true, edit: true, delete: true, view: true }))
          : form.modulePermissions,
        plainPassword: form.password
      };

      if (editingUser && !userData.password) delete userData.password;

      const url = editingUser ? `${API_BASE}/users/${editingUser._id}` : `${API_BASE}/users`;
      const method = editingUser ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        toast.add(editingUser ? "User updated!" : "User created!");
        setShowForm(false);
        setEditingUser(null);
        setForm({ userId: "", password: "", name: "", email: "", phone: "", role: "user", modules: [], permissions: [], modulePermissions: [] });
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
      permissions: user.permissions || [],
      modulePermissions: user.modulePermissions || []
    });
    setShowForm(true);
  };

  const handleDelete = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const token = localStorage.getItem("token");
      const API_BASE = import.meta.env.VITE_API_BASE || "https://chitfund-cxnp.onrender.com/api";
      const response = await fetch(`${API_BASE}/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        toast.add("User deleted!");
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
    const newModules = form.modules.includes(moduleId)
      ? form.modules.filter(m => m !== moduleId)
      : [...form.modules, moduleId];
    const newMp = form.modulePermissions.filter(p => p.module !== moduleId);
    if (!form.modules.includes(moduleId)) {
      newMp.push({ module: moduleId, create: false, edit: false, delete: false, view: true });
    }
    setForm({ ...form, modules: newModules, modulePermissions: newMp });
  };

  const togglePermission = (permission) => {
    setForm({
      ...form,
      permissions: form.permissions.includes(permission)
        ? form.permissions.filter(p => p !== permission)
        : [...form.permissions, permission]
    });
  };

  const setModulePerm = (moduleId, perm, value) => {
    const mp = [...form.modulePermissions];
    const idx = mp.findIndex(p => p.module === moduleId);
    if (idx >= 0) {
      mp[idx] = { ...mp[idx], [perm]: value };
    } else {
      mp.push({ module: moduleId, create: false, edit: false, delete: false, view: false, [perm]: value });
    }
    setForm({ ...form, modulePermissions: mp });
  };

  const getModulePerm = (moduleId, perm) => {
    const mp = form.modulePermissions.find(p => p.module === moduleId);
    return mp ? !!mp[perm] : false;
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;

  const selectStyle = {
    padding: "9px 12px", borderRadius: 8, border: "1px solid " + (dark ? "rgba(255,255,255,.15)" : "#d1d5db"),
    background: dark ? "rgba(255,255,255,.05)" : "#fff", color: dark ? "#f3f4f6" : "#111",
    fontSize: 13, outline: "none", cursor: "pointer"
  };

  return (
    <div>
      <SectionHeader title="User Management" subtitle={canManageAll ? "Manage all system users and permissions" : "Manage users in your branch"} dark={dark}
        actions={[
          <div key="filter" style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={selectStyle}>
              <option value="">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="agent">Agent</option>
              <option value="customer">Customer</option>
            </select>
          </div>,
          <Btn key="add" label="+ Add User" onClick={() => { setEditingUser(null); setForm({ userId: "", password: "", name: "", email: "", phone: "", role: "user", modules: [], permissions: [], modulePermissions: [] }); setShowForm(true); }} primary />
        ]} />

      {showForm && isSuperAdmin && (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 24, marginBottom: 24, maxHeight: "80vh", overflowY: "auto" }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>{editingUser ? "Edit User" : "New User"}</div>
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
              <Input label="Full Name *" value={form.name} onChange={v => setForm({ ...form, name: v })} />
              {errors.name && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.name}</div>}
            </div>
            <div>
              <Input label="Email *" value={form.email} onChange={v => setForm({ ...form, email: v })} />
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
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 12 }}>Module Access & Permissions</div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid " + (dark ? "rgba(255,255,255,.1)" : "#e5e7eb") }}>
                        <th style={{ textAlign: "left", padding: "8px 12px", color: dark ? "rgba(255,255,255,.6)" : "#64748b", fontWeight: 600 }}>Module</th>
                        <th style={{ textAlign: "center", padding: "8px 12px", color: dark ? "rgba(255,255,255,.6)" : "#64748b", fontWeight: 600 }}>Access</th>
                        <th style={{ textAlign: "center", padding: "8px 12px", color: dark ? "rgba(255,255,255,.6)" : "#64748b", fontWeight: 600 }}>View</th>
                        <th style={{ textAlign: "center", padding: "8px 12px", color: dark ? "rgba(255,255,255,.6)" : "#64748b", fontWeight: 600 }}>Create</th>
                        <th style={{ textAlign: "center", padding: "8px 12px", color: dark ? "rgba(255,255,255,.6)" : "#64748b", fontWeight: 600 }}>Edit</th>
                        <th style={{ textAlign: "center", padding: "8px 12px", color: dark ? "rgba(255,255,255,.6)" : "#64748b", fontWeight: 600 }}>Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ALL_MODULES.map(module => (
                        <tr key={module} style={{ borderBottom: "1px solid " + (dark ? "rgba(255,255,255,.05)" : "#f1f5f9") }}>
                          <td style={{ padding: "6px 12px", color: dark ? "rgba(255,255,255,.8)" : "#374151", fontWeight: 500, whiteSpace: "nowrap" }}>
                            {module.charAt(0).toUpperCase() + module.slice(1).replace(/-/g, ' ')}
                          </td>
                          <td style={{ textAlign: "center", padding: "6px 12px" }}>
                            <input type="checkbox" checked={form.modules.includes(module)} onChange={() => toggleModule(module)} style={{ cursor: "pointer" }} />
                          </td>
                          {["view", "create", "edit", "delete"].map(perm => (
                            <td key={perm} style={{ textAlign: "center", padding: "6px 12px" }}>
                              <input
                                type="checkbox"
                                checked={getModulePerm(module, perm)}
                                disabled={!form.modules.includes(module)}
                                onChange={() => setModulePerm(module, perm, !getModulePerm(module, perm))}
                                style={{ cursor: form.modules.includes(module) ? "pointer" : "not-allowed", opacity: form.modules.includes(module) ? 1 : 0.3 }}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <Btn label={editingUser ? "Update User" : "Create User"} onClick={handleSubmit} primary />
            <Btn label="Cancel" onClick={() => { setShowForm(false); setEditingUser(null); setForm({ userId: "", password: "", name: "", email: "", phone: "", role: "user", modules: [], permissions: [], modulePermissions: [] }); setErrors({}); }} />
          </div>
        </div>
      )}

      <Table dark={dark} cols={["User ID", "Name", "Email", "Role", "Modules", "Branch", "Status", "Actions"]}
        rows={filteredUsers.map(u => [
          u.userId,
          u.name,
          u.email,
          <Badge key={u._id} text={u.role === "super_admin" ? "Super Admin" : u.role === "admin" ? "Admin" : u.role === "agent" ? "Agent" : u.role === "customer" ? "Customer" : "Agent"} color={u.role === "super_admin" ? "purple" : u.role === "admin" ? "blue" : u.role === "agent" ? "green" : u.role === "customer" ? "gray" : "gray"} />,
          u.role === "super_admin" ? "All" : `${u.modules?.length || 0} modules`,
          u.branch || u.assignedBranch || "-",
          <Badge key={u._id} text={u.status} color={u.status === "active" ? "green" : "red"} />,
          <div key={u._id} style={{ display: "flex", gap: 6 }}>
            <IconBtn icon={<HiIdentification size={14} />} onClick={() => setPrintingUser(u)} color="#0ea5e9" title="Print ID" />
            <button onClick={() => handleEdit(u)} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: "1px solid #2563eb", background: "transparent", color: "#2563eb", cursor: "pointer" }}>Edit</button>
            {canManageAll && u.role !== "super_admin" && (
              <button onClick={() => handleDelete(u._id)} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: "1px solid #dc2626", background: "transparent", color: "#dc2626", cursor: "pointer" }}>Delete</button>
            )}
          </div>
        ])} />

      {printingUser && (
        <IDCardModal
          entity={{
            ...printingUser,
            agentId: printingUser.userId,
            memberId: printingUser.userId,
            phone: printingUser.phone || "-",
            aadhaar: "-",
          }}
          type={printingUser.role === "agent" ? "Agent" : "Member"}
          onClose={() => setPrintingUser(null)}
        />
      )}
    </div>
  );
}