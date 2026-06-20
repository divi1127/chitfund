// Collections page component
import { useState } from "react";
import { useData } from "../hooks/useData";
import { createData, updateData, deleteData } from "../utils/api";
import { SectionHeader } from "../components/SectionHeader";
import { StatCard } from "../components/StatCard";
import { Table } from "../components/Table";
import { Badge } from "../components/Badge";
import { Btn } from "../components/Btn";
import { Input } from "../components/Input";
import { fmt, genId } from "../utils/helpers";
import { useAuth } from "../contexts/AuthContext";
import { FiDollarSign, FiUsers, FiCalendar, FiCheckCircle, FiClock, FiBarChart2 } from "react-icons/fi";

export function Collections({ dark, toast, setPreview }) {
  const { user } = useAuth();
  const { data: collections, loading } = useData('/collections');
  const [refresh, setRefresh] = useState(0);
  const { data: members } = useData('/members');
  const { data: groups } = useData('/groups');
  const { data: schemes } = useData('/schemes');
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [showForm, setShowForm] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [form, setForm] = useState({ memberId: "", groupId: "", amount: "", mode: "", date: "", installment: "" });
  const [errors, setErrors] = useState({});
  
  // Filter collections based on logged-in user role
  const filteredCollections = user?.role === 'user' 
    ? collections.filter(c => {
        const member = members.find(m => m.id === c.memberId);
        return member && (member.memberId === user.userId || member.email === user.email);
      })
    : collections;
  
  const memberById = (id) => members.find((m) => m.id === id);
  const groupById = (id) => groups.find((g) => g.id === id);

  const validateForm = () => {
    const newErrors = {};
    if (!form.memberId) newErrors.memberId = "Member is required";
    if (!form.groupId) newErrors.groupId = "Group is required";
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) newErrors.amount = "Valid amount is required";
    if (!form.mode) newErrors.mode = "Payment mode is required";
    if (!form.date) newErrors.date = "Date is required";
    if (!form.installment || isNaN(form.installment) || Number(form.installment) <= 0) newErrors.installment = "Valid installment number is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      const collectionData = {
        ...form,
        id: editingCollection ? editingCollection.id : "C" + Date.now().toString().slice(-6),
        receiptNo: editingCollection ? editingCollection.receiptNo : "RCP" + genId(""),
        amount: Number(form.amount),
        installment: Number(form.installment),
        status: "Paid"
      };

      if (editingCollection) {
        await updateData('/collections', editingCollection.id, collectionData);
        toast.add("Collection updated successfully!");
      } else {
        await createData('/collections', collectionData);
        toast.add("Collection recorded successfully!");
      }
      
      setShowForm(false);
      setEditingCollection(null);
      setForm({ memberId: "", groupId: "", amount: "", mode: "", date: "", installment: "" });
      setErrors({});
      setRefresh(refresh + 1);
    } catch (error) {
      toast.add("Error saving collection: " + error.message, "error");
    }
  };

  const handleEdit = (collection) => {
    setEditingCollection(collection);
    setForm({
      memberId: collection.memberId,
      groupId: collection.groupId,
      amount: collection.amount,
      mode: collection.mode,
      date: collection.date?.split('T')[0],
      installment: collection.installment
    });
    setShowForm(true);
  };

  const handleDelete = async (collectionId) => {
    if (!confirm("Are you sure you want to delete this collection?")) return;
    
    try {
      await deleteData('/collections', collectionId);
      toast.add("Collection deleted successfully!");
      setRefresh(refresh + 1);
    } catch (error) {
      toast.add("Error deleting collection: " + error.message, "error");
    }
  };

  const handleGenerate = (collection) => {
    const m = memberById(collection.memberId); const g = groupById(collection.groupId);
    setPreview({
      title: "Collection Receipt",
      docNo: collection.receiptNo || "RCP" + collection.id,
      member: m,
      chit: { "Group": g?.name, "Installment": "#" + collection.installment, "Payment Mode": collection.mode, "Receipt Date": collection.date?.split('T')[0] },
      payments: { headers: ["Description", "Amount"], rows: [["Monthly Chit Installment", fmt(collection.amount)], ["Late Fee", "₹0.00"], ["Total", fmt(collection.amount)]] },
      amount: collection.amount,
      notes: "Thank you for your timely payment."
    });
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;

  return (
    <div>
      <SectionHeader 
        title="Monthly Collections" 
        subtitle={user?.role === 'user' ? "My Collection History" : "Record and manage installment collections"} 
        dark={dark}
        actions={user?.role !== 'user' ? [<Btn key="add" label="+ Record Collection" onClick={() => { setEditingCollection(null); setForm({ memberId: "", groupId: "", amount: "", mode: "", date: new Date().toISOString().split('T')[0], installment: "" }); setShowForm(true); }} primary />] : []}
      />

      {/* Summary Cards */}
      {user?.role !== 'user' && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16, marginBottom: 24 }}>
          <StatCard label="Total Collections" value={filteredCollections.length} sub="All time" color="blue" dark={dark} icon={<FiBarChart2 size={22} />} />
          <StatCard label="This Month" value={filteredCollections.filter(c => {
            const d = new Date(c.date);
            return d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear();
          }).length} sub="Current month" color="green" dark={dark} icon={<FiCalendar size={22} />} />
          <StatCard label="Total Collected" value={fmt(filteredCollections.reduce((sum, c) => sum + (c.amount || 0), 0))} sub="Cumulative amount" color="purple" dark={dark} icon={<FiDollarSign size={22} />} />
          <StatCard label="Paid Collections" value={filteredCollections.filter(c => c.status === 'Paid').length} sub="Completed" color="orange" dark={dark} icon={<FiCheckCircle size={22} />} />
        </div>
      )}

      {/* Search */}
      {user?.role !== 'user' && (
        <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 16, marginBottom: 20 }}>
          <Input label="Search by Member, Group or Receipt" value={searchTerm} onChange={setSearchTerm} dark={dark} placeholder="Type to filter..." />
        </div>
      )}

      {showForm && (
        <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#f9fafb", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 16 }}>{editingCollection ? "Edit Collection" : "Record Collection"}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "0 20px" }}>
            <div>
              <Input label="Member *" value={form.memberId} onChange={v => setForm({ ...form, memberId: v })} dark={dark} options={members.map(m => ({ value: m.id, label: m.name }))} />
              {errors.memberId && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.memberId}</div>}
            </div>
            <div>
              <Input label="Group *" value={form.groupId} onChange={v => setForm({ ...form, groupId: v })} dark={dark} options={groups.map(g => ({ value: g.id, label: g.name }))} />
              {errors.groupId && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.groupId}</div>}
            </div>
            <div>
              <Input label="Amount (₹) *" value={form.amount} onChange={v => setForm({ ...form, amount: v })} type="number" dark={dark} />
              {errors.amount && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.amount}</div>}
            </div>
            <div>
              <Input label="Installment No *" value={form.installment} onChange={v => setForm({ ...form, installment: v })} type="number" dark={dark} />
              {errors.installment && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.installment}</div>}
            </div>
            <div>
              <Input label="Payment Mode *" value={form.mode} onChange={v => setForm({ ...form, mode: v })} dark={dark} options={["Cash", "Online", "Cheque", "DD"].map(v => ({ value: v, label: v }))} />
              {errors.mode && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.mode}</div>}
            </div>
            <div>
              <Input label="Date *" value={form.date} onChange={v => setForm({ ...form, date: v })} type="date" dark={dark} />
              {errors.date && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.date}</div>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <Btn label={editingCollection ? "Update Collection" : "Save Collection"} onClick={handleSubmit} primary />
            <Btn label="Cancel" onClick={() => { setShowForm(false); setEditingCollection(null); setForm({ memberId: "", groupId: "", amount: "", mode: "", date: "", installment: "" }); setErrors({}); }} />
          </div>
        </div>
      )}

      <Table dark={dark} cols={["Receipt No", "Member", "Group", "Installment", "Scheme Amount", "Paid", "Date", "Mode", "Status", "Actions"]}
        rows={filteredCollections.filter(c => {
          if (!searchTerm) return true;
          const m = memberById(c.memberId);
          const g = groupById(c.groupId);
          const term = searchTerm.toLowerCase();
          return (c.receiptNo && c.receiptNo.toLowerCase().includes(term)) ||
                 (m?.name && m.name.toLowerCase().includes(term)) ||
                 (g?.name && g.name.toLowerCase().includes(term));
        }).map(c => {
          const m = memberById(c.memberId); const g = groupById(c.groupId);
          const s = g ? schemes.find(sch => sch.id === g.schemeId) : null;
          const monthlyInstallment = s?.monthlyInstallment || 0;
          const totalSchemeAmount = s?.amount || 0;
          return [c.receiptNo || "–", m?.name, g?.name, "#" + c.installment, `₹${monthlyInstallment?.toLocaleString()}`, fmt(c.amount), c.date?.split('T')[0], c.mode,
            <Badge key={c.id} text={c.status} color={c.status === "Paid" ? "green" : "yellow"} />,
            <div key={c.id} style={{ display: "flex", gap: 6 }}>
              <button onClick={() => handleGenerate(c)} style={{ fontSize: 11, padding: "5px 10px", borderRadius: 6, border: "1px solid #d97706", background: "#d97706", color: "#fff", cursor: "pointer", fontWeight: 600, transition: "all 0.2s", opacity: 0.9 }} onMouseEnter={e => e.currentTarget.style.opacity = "1"} onMouseLeave={e => e.currentTarget.style.opacity = "0.9"}>Receipt</button>
              <button onClick={() => handleEdit(c)} style={{ fontSize: 11, padding: "5px 10px", borderRadius: 6, border: "1px solid #2563eb", background: "#2563eb", color: "#fff", cursor: "pointer", fontWeight: 600, transition: "all 0.2s", opacity: 0.9 }} onMouseEnter={e => e.currentTarget.style.opacity = "1"} onMouseLeave={e => e.currentTarget.style.opacity = "0.9"}>Edit</button>
              <button onClick={() => handleDelete(c.id)} style={{ fontSize: 11, padding: "5px 10px", borderRadius: 6, border: "1px solid #dc2626", background: "#dc2626", color: "#fff", cursor: "pointer", fontWeight: 600, transition: "all 0.2s", opacity: 0.9 }} onMouseEnter={e => e.currentTarget.style.opacity = "1"} onMouseLeave={e => e.currentTarget.style.opacity = "0.9"}>Delete</button>
            </div>
          ];
        })} />
    </div>
  );
}
