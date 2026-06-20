// Groups page component
import { useState } from "react";
import { useData } from "../hooks/useData";
import { createData, updateData, deleteData } from "../utils/api";
import { SectionHeader } from "../components/SectionHeader";
import { Table } from "../components/Table";
import { Badge } from "../components/Badge";
import { Btn } from "../components/Btn";
import { Input } from "../components/Input";

export function Groups({ dark, toast }) {
  const { data: groups, loading } = useData('/groups');
  const [refresh, setRefresh] = useState(0);
  const { data: schemes } = useData('/schemes');
  const { data: members } = useData('/members');
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
      <SectionHeader title="Group Management" subtitle="Track all active chit groups" dark={dark}
        actions={[<Btn key="a" label="+ New Group" onClick={() => { setEditingGroup(null); setForm({ name: "", schemeId: "", startDate: "", agentId: "" }); setShowForm(true); }} primary />]} />

      {showForm && (
        <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#f9fafb", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 16 }}>{editingGroup ? "Edit Group" : "New Group"}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "0 20px" }}>
            <div>
              <Input label="Group Name *" value={form.name} onChange={v => setForm({ ...form, name: v })} dark={dark} />
              {errors.name && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.name}</div>}
            </div>
            <div>
              <Input label="Scheme *" value={form.schemeId} onChange={v => setForm({ ...form, schemeId: v })} dark={dark} options={schemes.map(s => ({ value: s.id, label: s.name }))} />
              {errors.schemeId && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.schemeId}</div>}
            </div>
            <div>
              <Input label="Start Date *" value={form.startDate} onChange={v => setForm({ ...form, startDate: v })} type="date" dark={dark} />
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
          <div style={{ background: dark ? "#1f2937" : "#fff", borderRadius: 12, padding: 24, maxWidth: 600, width: "90%", maxHeight: "80vh", overflow: "auto" }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 16 }}>Manage Members - {editingGroup.name}</div>
            <div style={{ marginBottom: 16, fontSize: 12, color: dark ? "rgba(255,255,255,.5)" : "#6b7280" }}>Select members to add to this group:</div>
            <div style={{ display: "grid", gap: 8, maxHeight: "400px", overflow: "auto" }}>
              {members.map(m => (
                <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, background: dark ? "rgba(255,255,255,.05)" : "#f9fafb", borderRadius: 8, border: selectedMembers.includes(m.id) ? "2px solid #2563eb" : "1px solid " + (dark ? "rgba(255,255,255,.1)" : "#e5e7eb") }}>
                  <input 
                    type="checkbox" 
                    checked={selectedMembers.includes(m.id)}
                    onChange={() => toggleMember(m.id)}
                    style={{ width: 18, height: 18, cursor: "pointer" }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: dark ? "#f3f4f6" : "#111" }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: dark ? "rgba(255,255,255,.5)" : "#6b7280" }}>{m.phone} · {m.address}</div>
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

      <Table dark={dark} cols={["Group", "Scheme", "Start Date", "Installment", "Members (Limit)", "Status", "Actions"]}
        rows={groups.map(g => {
          const s = schemeById(g.schemeId);
          const memberCount = g.members ? g.members.length : 0;
          const memberLimit = s?.members || 20;
          return [g.name, s?.name, g.startDate?.split('T')[0], "#" + g.currentInstallment, `${memberCount}/${memberLimit}`,
            <Badge key={g.id} text={g.status} color="green" />,
            <div key={g.id} style={{ display: "flex", gap: 6 }}>
              <button onClick={() => handleManageMembers(g)} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: "1px solid #d97706", background: "transparent", color: "#d97706", cursor: "pointer" }}>Members</button>
              <button onClick={() => handleEdit(g)} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: "1px solid #2563eb", background: "transparent", color: "#2563eb", cursor: "pointer" }}>Edit</button>
              <button onClick={() => handleDelete(g.id)} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: "1px solid #dc2626", background: "transparent", color: "#dc2626", cursor: "pointer" }}>Delete</button>
            </div>
          ];
        })} />
    </div>
  );
}
