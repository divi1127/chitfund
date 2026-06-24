// Groups page component
import { useState } from "react";
import { useData } from "../hooks/useData";
import { createData, updateData, deleteData } from "../utils/api";
import { SectionHeader } from "../components/SectionHeader";
import { Table } from "../components/Table";
import { Badge } from "../components/Badge";
import { Btn } from "../components/Btn";
import { Input } from "../components/Input";
import { IconBtn } from "../components/IconBtn";
import { HiPencil, HiTrash, HiUserGroup } from "react-icons/hi2";
import { useAuth } from "../contexts/AuthContext";

export function Groups({ toast }) {
  const { user } = useAuth();
  const { data: groups, loading } = useData('/groups');
  const [refresh, setRefresh] = useState(0);
  const { data: schemes } = useData('/schemes');
  const { data: members } = useData('/members');

  const isUser = user?.role === 'user';
  const canEdit = user?.role === 'super_admin' || user?.role === 'sub_admin';
  // user sees only their groups
  const userMember = isUser ? members.find(m => m.memberId === user.userId || m.email === user.email) : null;
  const userGroupIds = userMember?.groups || [];
  const visibleGroups = isUser ? groups.filter(g => userGroupIds.includes(g.id)) : groups;
  const [showForm, setShowForm] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [form, setForm] = useState({ name: "", schemeId: "", startDate: "" });
  const [errors, setErrors] = useState({});
  const [selectedMembers, setSelectedMembers] = useState([]);
  
  const schemeById = (id) => schemes.find((s) => s.id === id);

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Group name is required";
    if (!form.schemeId) newErrors.schemeId = "Scheme is required";
    if (!form.startDate) newErrors.startDate = "Start date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      const groupData = {
        ...form,
        id: editingGroup ? editingGroup.id : "G" + Date.now().toString().slice(-6),
        status: "Active",
        currentInstallment: editingGroup ? editingGroup.currentInstallment : 1,
        members: editingGroup ? editingGroup.members : []
      };

      if (editingGroup) {
        await updateData('/groups', editingGroup.id, groupData);
        toast.add("Group updated successfully!");
      } else {
        await createData('/groups', groupData);
        toast.add("Group added successfully!");
      }
      
      setShowForm(false);
      setEditingGroup(null);
      setForm({ name: "", schemeId: "", startDate: "", agentId: "" });
      setErrors({});
      setRefresh(refresh + 1);
    } catch (error) {
      toast.add("Error saving group: " + error.message, "error");
    }
  };

  const handleEdit = (group) => {
    setEditingGroup(group);
    setForm({
      name: group.name,
      schemeId: group.schemeId,
      startDate: group.startDate?.split('T')[0]
    });
    setShowForm(true);
  };

  const handleDelete = async (groupId) => {
    if (!confirm("Are you sure you want to delete this group?")) return;
    
    try {
      await deleteData('/groups', groupId);
      toast.add("Group deleted successfully!");
      setRefresh(refresh + 1);
    } catch (error) {
      toast.add("Error deleting group: " + error.message, "error");
    }
  };

  const handleManageMembers = (group) => {
    setEditingGroup(group);
    setSelectedMembers(group.members || []);
    setShowMemberModal(true);
  };

  const handleSaveMembers = async () => {
    try {
      // Update group's members array
      await updateData('/groups', editingGroup.id, {
        ...editingGroup,
        members: selectedMembers
      });

      // Update each member's groups array
      const previousMembers = editingGroup.members || [];
      
      // Remove this group from members who were removed
      for (const memberId of previousMembers) {
        if (!selectedMembers.includes(memberId)) {
          const member = members.find(m => m.id === memberId);
          if (member) {
            await updateData('/members', memberId, {
              ...member,
              groups: (member.groups || []).filter(gId => gId !== editingGroup.id)
            });
          }
        }
      }

      // Add this group to members who were added
      for (const memberId of selectedMembers) {
        if (!previousMembers.includes(memberId)) {
          const member = members.find(m => m.id === memberId);
          if (member) {
            await updateData('/members', memberId, {
              ...member,
              groups: [...(member.groups || []), editingGroup.id]
            });
          }
        }
      }

      toast.add("Group members updated successfully!");
      setShowMemberModal(false);
      setEditingGroup(null);
      setSelectedMembers([]);
      setRefresh(refresh + 1);
    } catch (error) {
      toast.add("Error updating members: " + error.message, "error");
    }
  };

  const toggleMember = (memberId) => {
    if (selectedMembers.includes(memberId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== memberId));
    } else {
      setSelectedMembers([...selectedMembers, memberId]);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;

  return (
    <div>
      <SectionHeader
        title="Group Management"
        subtitle={isUser ? "Your enrolled group details" : "Track all active chit groups"}
        actions={canEdit ? [<Btn key="a" label="+ New Group" onClick={() => { setEditingGroup(null); setForm({ name: "", schemeId: "", startDate: "", agentId: "" }); setShowForm(true); }} primary />] : []}
      />

      {showForm && canEdit && (
        <div style={{ background: "var(--bg-card-alt)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>{editingGroup ? "Edit Group" : "New Group"}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "0 20px" }}>
            <div>
              <Input label="Group Name *" value={form.name} onChange={v => setForm({ ...form, name: v })} />
              {errors.name && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.name}</div>}
            </div>
            <div>
              <Input label="Scheme *" value={form.schemeId} onChange={v => setForm({ ...form, schemeId: v })} options={schemes.map(s => ({ value: s.id, label: s.name }))} />
              {errors.schemeId && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.schemeId}</div>}
            </div>
            <div>
              <Input label="Start Date *" value={form.startDate} onChange={v => setForm({ ...form, startDate: v })} type="date" />
              {errors.startDate && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.startDate}</div>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <Btn label={editingGroup ? "Update Group" : "Save Group"} onClick={handleSubmit} primary />
            <Btn label="Cancel" onClick={() => { setShowForm(false); setEditingGroup(null); setForm({ name: "", schemeId: "", startDate: "" }); setErrors({}); }} />
          </div>
        </div>
      )}

      {/* Member Management Modal */}
      {showMemberModal && editingGroup && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "var(--bg-card)", borderRadius: 12, padding: 24, maxWidth: 600, width: "90%", maxHeight: "80vh", overflow: "auto" }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>Manage Members - {editingGroup.name}</div>
            <div style={{ marginBottom: 16, fontSize: 12, color: "var(--text-muted)" }}>Select members to add to this group:</div>
            <div style={{ display: "grid", gap: 8, maxHeight: "400px", overflow: "auto" }}>
              {members.map(m => (
                <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, background: "var(--bg-card-alt)", borderRadius: 8, border: selectedMembers.includes(m.id) ? "2px solid #2563eb" : "1px solid var(--border-color)" }}>
                  <input 
                    type="checkbox" 
                    checked={selectedMembers.includes(m.id)}
                    onChange={() => toggleMember(m.id)}
                    style={{ width: 18, height: 18, cursor: "pointer" }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>ID: {m.userId} · {m.phone} · {m.address}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "flex-end" }}>
              <Btn label="Cancel" onClick={() => { setShowMemberModal(false); setEditingGroup(null); setSelectedMembers([]); }} />
              <Btn label={`Save Members (${selectedMembers.length})`} onClick={handleSaveMembers} primary />
            </div>
          </div>
        </div>
      )}

      <Table cols={["Group", "Scheme", "Start Date", "Duration", "Members (Limit)", "Status", ...(canEdit ? ["Actions"] : [])]}
        rows={visibleGroups.map(g => {
          const s = schemeById(g.schemeId);
          const memberCount = g.members ? g.members.length : 0;
          const memberLimit = s?.members || 20;
          return [g.name, s?.name, g.startDate?.split('T')[0], s?.duration ? s.duration + " months" : "-", `${memberCount}/${memberLimit}`,
            <Badge key={g.id} text={g.status} color="green" />,
            canEdit ? (
              <div key={g.id} style={{ display: "inline-flex", gap: 6 }}>
                <IconBtn icon={<HiUserGroup size={14} />} onClick={() => handleManageMembers(g)} color="#d97706" title="Members" />
                <IconBtn icon={<HiPencil size={14} />} onClick={() => handleEdit(g)} color="#2563eb" title="Edit" />
                <IconBtn icon={<HiTrash size={14} />} onClick={() => handleDelete(g.id)} color="#dc2626" title="Delete" />
              </div>
            ) : null
          ];
        })} />
    </div>
  );
}
