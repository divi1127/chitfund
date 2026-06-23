// Members page component
import { useState } from "react";
import { useData } from "../hooks/useData";
import { fetchData, createData, updateData, deleteData } from "../utils/api";
import { SectionHeader } from "../components/SectionHeader";
import { Table } from "../components/Table";
import { Badge } from "../components/Badge";
import { Btn } from "../components/Btn";
import { Input } from "../components/Input";
import { fmt, genId } from "../utils/helpers";
import { IconBtn } from "../components/IconBtn";
import { HiPencil, HiTrash, HiBookOpen } from "react-icons/hi2";
import { useAuth } from "../contexts/AuthContext";
import { COMPANY } from "../utils/constants";

export function Members({ toast, setPreview }) {
  const { user } = useAuth();
  const { data: members, loading } = useData('/members');
  const { data: groups } = useData('/groups');
  const { data: schemes } = useData('/schemes');
  const [refresh, setRefresh] = useState(0);
  const { data: collections } = useData('/collections');
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", pan: "", aadhaar: "", password: "", groupId: "" });
  const [errors, setErrors] = useState({});
  const isSuperAdmin = user?.role === "super_admin";
  const isSubAdmin = user?.role === "sub_admin";
  const canEdit = isSuperAdmin;
  
  // Auto-generate member ID
  const generateMemberId = () => {
    const yr = String(new Date().getFullYear()).slice(-2);
    const prefix = `HRCHIT${yr}`;
    const existing = members.filter(m => m.memberId && m.memberId.startsWith(prefix));
    const max = existing.reduce((n, m) => {
      const num = parseInt(m.memberId.slice(prefix.length), 10);
      return num > n ? num : n;
    }, 0);
    return `${prefix}${String(max + 1).padStart(3, '0')}`;
  };
  
  // Filter members based on logged-in user role
  const filteredMembers = user?.role === 'user' 
    ? members.filter(m => m.memberId === user.userId || m.email === user.email)
    : members;
  
  const filtered = filteredMembers.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.phone.includes(search));
  
  const groupById = (id) => groups.find((g) => g.id === id);

  const validateForm = () => {
    const newErrors = {};
    if (editingMember) {
      // For editing, require all fields
      if (!form.name.trim()) newErrors.name = "Name is required";
      if (!form.phone.trim()) newErrors.phone = "Phone is required";
      if (!/^\d{10}$/.test(form.phone)) newErrors.phone = "Phone must be 10 digits";
      if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Invalid email format";
      if (!form.pan.trim()) newErrors.pan = "PAN is required";
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.pan)) newErrors.pan = "Invalid PAN format";
      if (!form.aadhaar.trim()) newErrors.aadhaar = "Aadhaar is required";
      if (!/^\d{12}$/.test(form.aadhaar)) newErrors.aadhaar = "Aadhaar must be 12 digits";
      if (!form.address.trim()) newErrors.address = "Address is required";
    } else {
      // For adding new member, require all fields
      if (!form.name.trim()) newErrors.name = "Name is required";
      if (!form.phone.trim()) newErrors.phone = "Phone is required";
      if (!/^\d{10}$/.test(form.phone)) newErrors.phone = "Phone must be 10 digits";
      if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Invalid email format";
      if (!form.pan.trim()) newErrors.pan = "PAN is required";
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.pan)) newErrors.pan = "Invalid PAN format";
      if (!form.aadhaar.trim()) newErrors.aadhaar = "Aadhaar is required";
      if (!/^\d{12}$/.test(form.aadhaar)) newErrors.aadhaar = "Aadhaar must be 12 digits";
      if (!form.address.trim()) newErrors.address = "Address is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    // Validate group member limit based on scheme
    if (form.groupId && !editingMember) {
      const groupMembersCount = members.filter(m => m.groups && m.groups.includes(form.groupId)).length;
      const selectedGroup = groups.find(g => g.id === form.groupId);
      const selectedScheme = selectedGroup ? schemes.find(s => s.id === selectedGroup.schemeId) : null;
      const memberLimit = selectedScheme?.members || 20;

      if (groupMembersCount >= memberLimit) {
        toast.add(`Group limit reached. Maximum ${memberLimit} members allowed.`, "error");
        return;
      }
    }

    try {
      const memberId = editingMember ? editingMember.memberId : generateMemberId();
      const memberData = {
        ...form,
        id: editingMember ? editingMember.id : "M" + Date.now().toString().slice(-6),
        memberId: memberId,
        userId: memberId,
        joined: editingMember ? editingMember.joined : new Date().toISOString().split('T')[0],
        status: "Active",
        groups: editingMember ? editingMember.groups : (form.groupId ? [form.groupId] : []),
        modules: editingMember?.modules || ['dashboard', 'members', 'schemes', 'groups', 'collections', 'billing', 'auctions', 'accounting', 'profile', 'payments'],
        permissions: editingMember?.permissions || ['view']
      };

      if (editingMember) {
        await updateData('/members', editingMember.id, memberData);
        toast.add("Member updated successfully!");
      } else {
        // Create member (server auto-creates user + invoice)
        await createData('/members', memberData);
        toast.add("Member added successfully!");
      }
      
      setShowForm(false);
      setEditingMember(null);
      setForm({ name: "", phone: "", email: "", address: "", pan: "", aadhaar: "", password: "", groupId: "" });
      setErrors({});
      setRefresh(refresh + 1);
    } catch (error) {
      toast.add("Error saving member: " + error.message, "error");
    }
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setForm({
      name: member.name,
      phone: member.phone,
      email: member.email,
      address: member.address,
      pan: member.pan,
      aadhaar: member.aadhaar
    });
    setShowForm(true);
  };

  const handleDelete = async (memberId) => {
    if (!confirm("Are you sure you want to delete this member?")) return;
    
    try {
      await deleteData('/members', memberId);
      toast.add("Member deleted successfully!");
      setRefresh(refresh + 1);
    } catch (error) {
      toast.add("Error deleting member: " + error.message, "error");
    }
  };

  const handleLedger = (member) => {
    const memberCollections = collections.filter(c => c.memberId === member.id);
    const totalPaid = memberCollections.reduce((sum, c) => sum + (c.amount || 0), 0);
    
    setPreview({
      title: "Member Ledger",
      docNo: "LED" + genId(""),
      member: member,
      chit: { "Total Paid": fmt(totalPaid), "Transactions": memberCollections.length, "Status": member.status },
      payments: {
        headers: ["Date", "Description", "Amount", "Mode"],
        rows: memberCollections.map(c => [c.date?.split('T')[0], "Installment #" + c.installment, fmt(c.amount), c.mode])
      },
      amount: totalPaid,
      notes: "Complete payment history for " + member.name
    });
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;

  return (
    <div>
      <SectionHeader 
        title="Members Management" 
        subtitle={user?.role === 'user' ? "My Member Details" : "Manage all registered members"} 
        actions={isSuperAdmin ? [<Btn key="add" label="+ Add Member" onClick={() => { setEditingMember(null); setForm({ name: "", phone: "", email: "", address: "", pan: "", aadhaar: "", password: "", groupId: "" }); setShowForm(true); }} primary />] : []}
      />

      {showForm && canEdit && (
        <div style={{ background: "var(--bg-card-alt)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>{editingMember ? "Edit Member" : "Add New Member"}</div>
          
          {!editingMember && (
            <div style={{ padding: 16, background: "var(--bg-card-alt)", borderRadius: 8, marginBottom: 16 }}>
              <div style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 8 }}>
                Member ID will be auto-generated
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>
                Format: M202601#### (e.g., M2026011234)
              </div>
            </div>
          )}
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "0 20px" }}>
            <div>
              <Input label="Full Name *" value={form.name} onChange={v => setForm({ ...form, name: v })} />
              {errors.name && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.name}</div>}
            </div>
            <div>
              <Input label="Phone *" value={form.phone} onChange={v => setForm({ ...form, phone: v })} />
              {errors.phone && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.phone}</div>}
            </div>
            <div>
              <Input label="Email" value={form.email} onChange={v => setForm({ ...form, email: v })} />
              {errors.email && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.email}</div>}
            </div>
            <div>
              <Input label="PAN *" value={form.pan} onChange={v => setForm({ ...form, pan: v })} />
              {errors.pan && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.pan}</div>}
            </div>
            <div>
              <Input label="Aadhaar *" value={form.aadhaar} onChange={v => setForm({ ...form, aadhaar: v })} />
              {errors.aadhaar && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.aadhaar}</div>}
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <Input label="Address *" value={form.address} onChange={v => setForm({ ...form, address: v })} />
              {errors.address && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.address}</div>}
            </div>
            {!editingMember && (
              <div style={{ background: "var(--bg-card)", padding: 12, borderRadius: 8, border: "1px solid var(--border-color)" }}>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Auto-generated Password</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>HRchit@{String(new Date().getFullYear()).slice(-2)}</div>
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <Btn label={editingMember ? "Update Member" : "Add Member"} onClick={handleSubmit} primary />
            <Btn label="Cancel" onClick={() => { setShowForm(false); setEditingMember(null); setForm({ name: "", phone: "", email: "", address: "", pan: "", aadhaar: "", password: "", groupId: "" }); setErrors({}); }} />
          </div>
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <Input label="Search members" value={search} onChange={setSearch} placeholder="Search by name or phone..." />
      </div>

      <Table cols={["ID", "Name", "Phone", "Email", "Joined", "Groups", "Status", "Actions"]}
        rows={filtered.map(m => [
          m.userId,
          m.name,
          m.phone,
          m.email,
          m.joined,
          m.groups?.length || 0,
          <Badge key={m.id} text={m.status} color={m.status === "Active" ? "green" : "red"} />,
          <div key={m.id} style={{ display: "inline-flex", gap: 6 }}>
            <IconBtn icon={<HiBookOpen size={14} />} onClick={() => handleLedger(m)} color="#d97706" title="Ledger" />
            {canEdit && <IconBtn icon={<HiPencil size={14} />} onClick={() => handleEdit(m)} color="#2563eb" title="Edit" />}
            {canEdit && <IconBtn icon={<HiTrash size={14} />} onClick={() => handleDelete(m.id)} color="#dc2626" title="Delete" />}
          </div>
        ])} />
    </div>
  );
}
