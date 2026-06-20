// Add Members component for super admin to add new members with auto-generated ID
import { useState } from "react";
import { useData } from "../hooks/useData";
import { createData } from "../utils/api";
import { SectionHeader } from "../components/SectionHeader";
import { Table } from "../components/Table";
import { Badge } from "../components/Badge";
import { Btn } from "../components/Btn";
import { Input } from "../components/Input";
import { useAuth } from "../contexts/AuthContext";

export function AddMembers({ dark, toast }) {
  const { user } = useAuth();
  const { data: members, loading, refresh } = useData('/members');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    address: '',
    scheme: '',
    group: '',
    role: 'user'
  });

  // Auto-generate member ID
  const generateMemberId = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 9000) + 1000;
    return `MEM${year}${month}${random}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const memberId = generateMemberId();
      const memberData = {
        ...form,
        memberId,
        userId: memberId,
        status: 'active',
        createdAt: new Date(),
        modules: ['dashboard', 'members', 'schemes', 'groups', 'collections', 'billing', 'auctions', 'accounting', 'profile', 'payments'],
        permissions: ['view']
      };

      await createData('/members', memberData);
      toast.add('Member added successfully!');
      setShowForm(false);
      setForm({
        name: '',
        email: '',
        mobile: '',
        password: '',
        address: '',
        scheme: '',
        group: '',
        role: 'user'
      });
      refresh();
    } catch (error) {
      toast.add('Error adding member: ' + error.message, 'error');
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;

  return (
    <div>
      <SectionHeader title="Add Members" subtitle="Add new members with auto-generated IDs" dark={dark} />

      <div style={{ display: "grid", gap: 24 }}>
        {/* Add Member Form */}
        {!showForm ? (
          <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 24, textAlign: "center" }}>
            <div style={{ fontSize: 14, color: dark ? "rgba(255,255,255,.6)" : "#6b7280", marginBottom: 16 }}>
              Add new members to the system. IDs will be auto-generated.
            </div>
            <Btn label="Add New Member" onClick={() => setShowForm(true)} primary />
          </div>
        ) : (
          <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: dark ? "#f3f4f6" : "#111" }}>Add New Member</div>
              <button onClick={() => setShowForm(false)} style={{ fontSize: 24, background: "none", border: "none", cursor: "pointer", color: dark ? "#f3f4f6" : "#111" }}>×</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 16 }}>
                <Input label="Full Name" value={form.name} onChange={v => setForm({ ...form, name: v })} dark={dark} required />
                <Input label="Email" value={form.email} onChange={v => setForm({ ...form, email: v })} dark={dark} type="email" required />
                <Input label="Mobile Number" value={form.mobile} onChange={v => setForm({ ...form, mobile: v })} dark={dark} type="tel" required />
                <Input label="Password" value={form.password} onChange={v => setForm({ ...form, password: v })} dark={dark} type="password" required />
                <Input label="Address" value={form.address} onChange={v => setForm({ ...form, address: v })} dark={dark} />
                <Input label="Chit Scheme" value={form.scheme} onChange={v => setForm({ ...form, scheme: v })} dark={dark} />
                <Input label="Group" value={form.group} onChange={v => setForm({ ...form, group: v })} dark={dark} />
              </div>

              <div style={{ padding: 16, background: dark ? "rgba(255,255,255,.05)" : "#f9fafb", borderRadius: 8 }}>
                <div style={{ fontSize: 14, color: dark ? "rgba(255,255,255,.6)" : "#6b7280", marginBottom: 8 }}>
                  Member ID will be auto-generated
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, color: dark ? "#f3f4f6" : "#111" }}>
                  Format: MEM{new Date().getFullYear()}MM#### (e.g., MEM2026011234)
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <Btn label="Add Member" type="submit" primary style={{ flex: 1 }} />
                <Btn label="Cancel" onClick={() => setShowForm(false)} style={{ flex: 1 }} />
              </div>
            </form>
          </div>
        )}

        {/* Members List */}
        <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 16 }}>Existing Members</div>
          <Table dark={dark} cols={["Member ID", "Name", "Email", "Mobile", "Scheme", "Status", "Created"]}
            rows={members.map(member => [
              member.memberId,
              member.name,
              member.email,
              member.mobile,
              member.scheme || '-',
              <Badge key={member.id} text={member.status} color={member.status === 'active' ? 'green' : 'red'} />,
              new Date(member.createdAt).toLocaleDateString()
            ])} />
        </div>
      </div>
    </div>
  );
}
