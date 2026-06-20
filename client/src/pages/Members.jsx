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
import { useAuth } from "../contexts/AuthContext";

export function Members({ dark, toast, setPreview }) {
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
  
  // Auto-generate member ID
  const generateMemberId = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 9000) + 1000;
    return `M${year}${month}${random}`;
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
      if (!form.email.trim()) newErrors.email = "Email is required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Invalid email format";
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
      if (!form.email.trim()) newErrors.email = "Email is required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Invalid email format";
      if (!form.pan.trim()) newErrors.pan = "PAN is required";
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.pan)) newErrors.pan = "Invalid PAN format";
      if (!form.aadhaar.trim()) newErrors.aadhaar = "Aadhaar is required";
      if (!/^\d{12}$/.test(form.aadhaar)) newErrors.aadhaar = "Aadhaar must be 12 digits";
      if (!form.address.trim()) newErrors.address = "Address is required";
      if (!form.password.trim()) newErrors.password = "Password is required";
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
        modules: ['dashboard', 'members', 'schemes', 'groups', 'collections', 'billing', 'auctions', 'accounting', 'profile', 'payments'],
        permissions: ['view']
      };

      if (editingMember) {
        await updateData('/members', editingMember.id, memberData);
        toast.add("Member updated successfully!");
      } else {
        // Create member
        await createData('/members', memberData);
        
        // Also create user entry for login
        const userData = {
          userId: memberId,
          name: form.name,
          email: form.email,
          password: form.password,
          role: 'user',
          modules: ['dashboard', 'members', 'schemes', 'groups', 'collections', 'billing', 'auctions', 'accounting', 'profile', 'payments'],
          permissions: ['view']
        };
        await createData('/users', userData);
        
        // Automatically create invoice if member is assigned to a group
        if (memberData.groups && memberData.groups.length > 0) {
          try {
            const memberGroupId = memberData.groups[0];
            const memberGroup = groups.find(g => g.id === memberGroupId);
            const memberScheme = memberGroup ? schemes.find(s => s.id === memberGroup.schemeId) : null;
            
            console.log('Invoice creation attempt:', {
              memberGroupId,
              memberGroup: memberGroup?.name,
              memberScheme: memberScheme?.name,
              hasScheme: !!memberScheme
            });
            
            if (memberScheme) {
              // Generate invoice number
              const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
              
              // Set due date to next month
              const dueDate = new Date();
              dueDate.setDate(5);
              dueDate.setMonth(dueDate.getMonth() + 1);
              
              const invoiceData = {
                invoiceNumber: invoiceNumber,
                receiptNumber: `RCP-${String(Math.floor(Math.random() * 9000) + 1000)}`,
                branch: "Madurai Branch",
                collectedBy: user.name,
                memberId: memberId,
                memberName: form.name,
                memberMobile: form.phone,
                memberAddress: form.address || "",
                memberAadhar: form.aadhaar || "",
                chitName: memberScheme.name,
                chitGroup: memberGroup.name,
                chitNumber: `CHIT-${memberScheme.amount}-001`,
                totalChitValue: memberScheme.amount,
                monthlyAmount: memberScheme.monthlyInstallment,
                duration: memberScheme.duration,
                currentMonth: 1,
                dueDate: dueDate,
                installmentAmount: memberScheme.monthlyInstallment,
                lateFine: 0,
                discount: 0,
                previousDue: 0,
                totalPayable: memberScheme.monthlyInstallment,
                amountPaid: 0,
                balance: memberScheme.monthlyInstallment,
                paymentMethod: 'Pending',
                referenceNumber: '',
                paidInstallments: 0,
                remainingInstallments: memberScheme.duration,
                totalPaid: 0,
                remainingAmount: memberScheme.amount,
                status: 'Pending',
                remarks: 'First installment - Temporary development mode',
                date: new Date(),
                time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                qrCodeData: JSON.stringify({
                  invoiceNumber: invoiceNumber,
                  memberId: memberId,
                  paymentDate: new Date().toISOString(),
                  amountPaid: memberScheme.monthlyInstallment,
                  verificationUrl: `http://localhost:5000/api/invoices/verify/${invoiceNumber}`
                }),
                verificationUrl: `http://localhost:5000/api/invoices/verify/${invoiceNumber}`
              };
              
              await createData('/invoices', invoiceData);
              toast.add("Member added successfully! Invoice created automatically.");
            } else {
              console.warn('No scheme found for group:', memberGroupId);
              toast.add("Member added successfully! (No invoice created - group has no scheme)");
            }
          } catch (invoiceError) {
            console.error('Invoice creation error:', invoiceError);
            toast.add("Member added successfully! (Invoice creation failed - check console)");
          }
        } else {
          toast.add("Member added successfully! User can now login.");
        }
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
        dark={dark}
        actions={user?.role !== 'user' ? [<Btn key="add" label="+ Add Member" onClick={() => { setEditingMember(null); setForm({ name: "", phone: "", email: "", address: "", pan: "", aadhaar: "" }); setShowForm(true); }} primary />] : []}
      />

      {showForm && (
        <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#f9fafb", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 16 }}>{editingMember ? "Edit Member" : "Add New Member"}</div>
          
          {!editingMember && (
            <div style={{ padding: 16, background: dark ? "rgba(255,255,255,.05)" : "#f9fafb", borderRadius: 8, marginBottom: 16 }}>
              <div style={{ fontSize: 14, color: dark ? "rgba(255,255,255,.6)" : "#6b7280", marginBottom: 8 }}>
                Member ID will be auto-generated
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, color: dark ? "#f3f4f6" : "#111" }}>
                Format: M202601#### (e.g., M2026011234)
              </div>
            </div>
          )}
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "0 20px" }}>
            <div>
              <Input label="Full Name *" value={form.name} onChange={v => setForm({ ...form, name: v })} dark={dark} />
              {errors.name && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.name}</div>}
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
              <Input label="PAN *" value={form.pan} onChange={v => setForm({ ...form, pan: v })} dark={dark} />
              {errors.pan && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.pan}</div>}
            </div>
            <div>
              <Input label="Aadhaar *" value={form.aadhaar} onChange={v => setForm({ ...form, aadhaar: v })} dark={dark} />
              {errors.aadhaar && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.aadhaar}</div>}
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <Input label="Address *" value={form.address} onChange={v => setForm({ ...form, address: v })} dark={dark} />
              {errors.address && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.address}</div>}
            </div>
            {!editingMember && (
              <div style={{ gridColumn: "1 / -1" }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 8 }}>Assign to Group (Optional)</div>
                <select
                  value={form.groupId || ""}
                  onChange={e => setForm({ ...form, groupId: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: dark ? "1px solid rgba(255,255,255,.2)" : "1px solid #d1d5db",
                    background: dark ? "rgba(255,255,255,.05)" : "#fff",
                    color: dark ? "#f3f4f6" : "#111",
                    fontSize: 14
                  }}
                >
                  <option value="">-- Select Group --</option>
                  {groups.map(group => (
                    <option key={group.id} value={group.id}>{group.name}</option>
                  ))}
                </select>
                <div style={{ fontSize: 12, color: dark ? "rgba(255,255,255,.5)" : "#6b7280", marginTop: 4 }}>
                  If a group is selected, an invoice will be automatically created for the first installment.
                </div>
              </div>
            )}
            <div>
              <Input label="Password *" value={form.password} onChange={v => setForm({ ...form, password: v })} dark={dark} type="password" />
              {errors.password && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.password}</div>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <Btn label={editingMember ? "Update Member" : "Add Member"} onClick={handleSubmit} primary />
            <Btn label="Cancel" onClick={() => { setShowForm(false); setEditingMember(null); setForm({ name: "", phone: "", email: "", address: "", pan: "", aadhaar: "", password: "", groupId: "" }); setErrors({}); }} />
          </div>
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <Input label="Search members" value={search} onChange={setSearch} placeholder="Search by name or phone..." dark={dark} />
      </div>

      <Table dark={dark} cols={["ID", "Name", "Phone", "Email", "Joined", "Groups", "Status", "Actions"]}
        rows={filtered.map(m => [
          m.id,
          m.name,
          m.phone,
          m.email,
          m.joined,
          m.groups?.length || 0,
          <Badge key={m.id} text={m.status} color={m.status === "Active" ? "green" : "red"} />,
          <div key={m.id} style={{ display: "flex", gap: 6 }}>
            <button onClick={() => handleLedger(m)} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: "1px solid #d97706", background: "transparent", color: "#d97706", cursor: "pointer" }}>Ledger</button>
            <button onClick={() => handleEdit(m)} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: "1px solid #2563eb", background: "transparent", color: "#2563eb", cursor: "pointer" }}>Edit</button>
            <button onClick={() => handleDelete(m.id)} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: "1px solid #dc2626", background: "transparent", color: "#dc2626", cursor: "pointer" }}>Delete</button>
          </div>
        ])} />
    </div>
  );
}
