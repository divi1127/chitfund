import { useState } from "react";
import { useData } from "../hooks/useData";
import { createData, updateData, deleteData } from "../utils/api";
import { SectionHeader } from "../components/SectionHeader";
import { StatCard } from "../components/StatCard";
import { Table } from "../components/Table";
import { Badge } from "../components/Badge";
import { Btn } from "../components/Btn";
import { Input } from "../components/Input";
import { fmt } from "../utils/helpers";
import { useAuth } from "../contexts/AuthContext";
import { FiDollarSign, FiCalendar, FiCheckCircle, FiBarChart2 } from "react-icons/fi";
import { HiReceiptRefund, HiPencil, HiTrash, HiCheckBadge } from "react-icons/hi2";
import { IconBtn } from "../components/IconBtn";

export function Collections({ toast, setPreview }) {
  const { user } = useAuth();
  const { data: collections, loading, refresh: reload } = useData("/collections");
  const { data: members } = useData("/members");
  const { data: groups } = useData("/groups");
  const { data: schemes } = useData("/schemes");
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [form, setForm] = useState({ memberId: "", groupId: "", amount: "", mode: "", date: "", installment: "" });
  const [errors, setErrors] = useState({});

  const isSuperAdmin = user?.role === "super_admin";
  const isSubAdmin = user?.role === "sub_admin";
  const canEdit = isSuperAdmin;
  const canApprove = isSuperAdmin || isSubAdmin;

  const filteredCollections = user?.role === "user"
    ? collections.filter(c => {
        const m = members.find(m => m.id === c.memberId);
        return m && (m.memberId === user.userId || m.email === user.email);
      })
    : collections;

  const pendingCash = collections.filter(c => c.status === "Pending" && c.mode === "Cash");

  const memberById = (id) => members.find(m => m.id === id);
  const groupById = (id) => groups.find(g => g.id === id);

  const validateForm = () => {
    const e = {};
    if (!form.memberId) e.memberId = "Member is required";
    if (!form.groupId) e.groupId = "Group is required";
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) e.amount = "Valid amount is required";
    if (!form.mode) e.mode = "Payment mode is required";
    if (!form.date) e.date = "Date is required";
    if (!form.installment || isNaN(form.installment) || Number(form.installment) <= 0) e.installment = "Valid installment number is required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      const data = { ...form, id: editingCollection ? editingCollection.id : "C" + Date.now().toString().slice(-6), amount: Number(form.amount), installment: Number(form.installment), status: "Paid" };
      if (editingCollection) {
        await updateData("/collections", editingCollection.id, data);
        toast.add("Collection updated!");
      } else {
        await createData("/collections", data);
        toast.add("Collection recorded!");
      }
      setShowForm(false); setEditingCollection(null);
      setForm({ memberId: "", groupId: "", amount: "", mode: "", date: "", installment: "" });
      setErrors({}); reload();
    } catch (err) { toast.add("Error: " + err.message, "error"); }
  };

  const handleEdit = (c) => {
    setEditingCollection(c);
    setForm({ memberId: c.memberId, groupId: c.groupId, amount: c.amount, mode: c.mode, date: c.date?.split("T")[0], installment: c.installment });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this collection?")) return;
    try { await deleteData("/collections", id); toast.add("Deleted!"); reload(); }
    catch (err) { toast.add(err.message, "error"); }
  };

  const handleApprove = async (c) => {
    if (!confirm(`Approve cash payment ${fmt(c.amount)} for Month ${c.installment}?`)) return;
    try {
      await updateData("/collections", `${c.id}/approve`, {});
      toast.add("Cash payment approved!");
      reload();
    } catch (err) { toast.add("Error: " + err.message, "error"); }
  };

  const handleGenerate = (c) => {
    if (c.status === "Pending") { toast.add("Cannot generate receipt for pending payment", "error"); return; }
    const m = memberById(c.memberId); const g = groupById(c.groupId);
    setPreview({
      title: "Collection Receipt", docNo: c.receiptNo || "RCP" + c.id,
      member: m,
      chit: { "Group": g?.name, "Installment": "#" + c.installment, "Payment Mode": c.mode, "Receipt Date": c.date?.split("T")[0] },
      payments: { headers: ["Description", "Amount"], rows: [["Monthly Chit Installment", fmt(c.amount)], ["Late Fee", "₹0.00"], ["Total", fmt(c.amount)]] },
      amount: c.amount, notes: "Thank you for your timely payment.",
    });
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;

  const now = new Date();
  const thisMonthCollections = filteredCollections.filter(c => {
    const d = new Date(c.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  return (
    <div>
      <SectionHeader
        title="Monthly Collections"
        subtitle={user?.role === "user" ? "My Collection History" : "Record and manage installment collections"}
        actions={user?.role !== "user" ? [<Btn key="add" label="+ Record Collection" primary onClick={() => { setEditingCollection(null); setForm({ memberId: "", groupId: "", amount: "", mode: "", date: new Date().toISOString().split("T")[0], installment: "" }); setShowForm(true); }} />] : []}
      />

      {/* Stats */}
      {user?.role !== "user" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16, marginBottom: 24 }}>
          <StatCard label="Total Collections" value={filteredCollections.length} sub="All time" color="blue" icon={<FiBarChart2 size={22} />} />
          <StatCard label="This Month" value={thisMonthCollections.length} sub="Current month" color="green" icon={<FiCalendar size={22} />} />
          <StatCard label="Total Collected" value={fmt(filteredCollections.reduce((s, c) => s + (c.amount || 0), 0))} sub="Cumulative" color="purple" icon={<FiDollarSign size={22} />} />
          <StatCard label="Paid" value={filteredCollections.filter(c => c.status === "Paid").length} sub="Completed" color="orange" icon={<FiCheckCircle size={22} />} />
        </div>
      )}

      {/* ── Pending Cash Approvals ── */}
      {canApprove && pendingCash.length > 0 && (
        <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#92400e", marginBottom: 14 }}>
            ⏳ Pending Cash Approvals — {pendingCash.length} request{pendingCash.length > 1 ? "s" : ""}
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#fef3c7" }}>
                {["Receipt No", "Member", "Group", "Month", "Amount", "Date", "Action"].map(h => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, color: "#92400e", borderBottom: "1px solid #fde68a" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pendingCash.map(c => {
                const m = memberById(c.memberId);
                const g = groupById(c.groupId);
                return (
                  <tr key={c.id} style={{ borderBottom: "1px solid #fef9c3" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 600 }}>{c.receiptNo || "—"}</td>
                    <td style={{ padding: "10px 12px" }}>
                      <div style={{ fontWeight: 600 }}>{m?.name || "—"}</div>
                      <div style={{ fontSize: 11, color: "#92400e" }}>{m?.memberId}</div>
                    </td>
                    <td style={{ padding: "10px 12px" }}>{g?.name || "—"}</td>
                    <td style={{ padding: "10px 12px", fontWeight: 700 }}>Month {c.installment}</td>
                    <td style={{ padding: "10px 12px", fontWeight: 800, color: "#0f172a" }}>{fmt(c.amount)}</td>
                    <td style={{ padding: "10px 12px", color: "#64748b" }}>{c.date?.split("T")[0]}</td>
                    <td style={{ padding: "10px 12px" }}>
                      <button onClick={() => handleApprove(c)}
                        style={{ padding: "6px 16px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                        ✓ Approve
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Search */}
      {user?.role !== "user" && (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, marginBottom: 20 }}>
          <Input label="Search by Member, Group or Receipt" value={searchTerm} onChange={setSearchTerm} placeholder="Type to filter..." />
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && user?.role !== "user" && (
        <div style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>{editingCollection ? "Edit Collection" : "Record Collection"}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "0 20px" }}>
            <div>
              <Input label="Member *" value={form.memberId} onChange={v => setForm({ ...form, memberId: v })} options={members.map(m => ({ value: m.id, label: m.name }))} />
              {errors.memberId && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.memberId}</div>}
            </div>
            <div>
              <Input label="Group *" value={form.groupId} onChange={v => setForm({ ...form, groupId: v })} options={groups.map(g => ({ value: g.id, label: g.name }))} />
              {errors.groupId && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.groupId}</div>}
            </div>
            <div>
              <Input label="Amount (₹) *" value={form.amount} onChange={v => setForm({ ...form, amount: v })} type="number" />
              {errors.amount && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.amount}</div>}
            </div>
            <div>
              <Input label="Installment No *" value={form.installment} onChange={v => setForm({ ...form, installment: v })} type="number" />
              {errors.installment && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.installment}</div>}
            </div>
            <div>
              <Input label="Payment Mode *" value={form.mode} onChange={v => setForm({ ...form, mode: v })} options={["Cash", "UPI", "Online", "Cheque", "DD"].map(v => ({ value: v, label: v }))} />
              {errors.mode && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.mode}</div>}
            </div>
            <div>
              <Input label="Date *" value={form.date} onChange={v => setForm({ ...form, date: v })} type="date" />
              {errors.date && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.date}</div>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <Btn label={editingCollection ? "Update Collection" : "Save Collection"} onClick={handleSubmit} primary />
            <Btn label="Cancel" onClick={() => { setShowForm(false); setEditingCollection(null); setForm({ memberId: "", groupId: "", amount: "", mode: "", date: "", installment: "" }); setErrors({}); }} />
          </div>
        </div>
      )}

      {/* Table */}
      <Table
        cols={["Receipt No", "Member", "User ID", "Group", "Month", "Scheme Amt", "Paid", "Date", "Mode", "Status", "Actions"]}
        rows={filteredCollections.filter(c => {
          if (!searchTerm) return true;
          const m = memberById(c.memberId); const g = groupById(c.groupId);
          const t = searchTerm.toLowerCase();
          return c.receiptNo?.toLowerCase().includes(t) || m?.name?.toLowerCase().includes(t) || g?.name?.toLowerCase().includes(t);
        }).map(c => {
          const m = memberById(c.memberId); const g = groupById(c.groupId);
          const s = g ? schemes.find(sc => sc.id === g.schemeId) : null;
          return [
            c.receiptNo || "—", m?.name || "—", m?.userId || "—", g?.name || "—",
            "#" + c.installment,
            fmt(s?.monthlyInstallment || 0),
            fmt(c.amount),
            c.date?.split("T")[0], c.mode,
            <Badge key={c.id + "s"} text={c.status} color={c.status === "Paid" ? "green" : "yellow"} />,
            <div key={c.id + "a"} style={{ display: "flex", gap: 6 }}>
              <IconBtn icon={<HiReceiptRefund size={14} />} onClick={() => handleGenerate(c)} color={c.status === "Pending" ? "#9ca3af" : "#d97706"} title={c.status === "Pending" ? "Pending" : "Receipt"} />
              {canApprove && c.status === "Pending" && c.mode === "Cash" && (
                <IconBtn icon={<HiCheckBadge size={14} />} onClick={() => handleApprove(c)} color="#16a34a" title="Approve Cash" />
              )}
              {canEdit && <IconBtn icon={<HiPencil size={14} />} onClick={() => handleEdit(c)} color="#2563eb" title="Edit" />}
              {canEdit && <IconBtn icon={<HiTrash size={14} />} onClick={() => handleDelete(c.id)} color="#dc2626" title="Delete" />}
            </div>,
          ];
        })}
      />
    </div>
  );
}
