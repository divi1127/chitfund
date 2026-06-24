import { useState } from "react";
import { useData } from "../hooks/useData";
import { createData, updateData, deleteData } from "../utils/api";
import { SectionHeader } from "../components/SectionHeader";
import { Table } from "../components/Table";
import { Badge } from "../components/Badge";
import { Btn } from "../components/Btn";
import { Input } from "../components/Input";
import { PaymentModal } from "../components/PaymentModal";
import { fmt, genId } from "../utils/helpers";
import { IconBtn } from "../components/IconBtn";
import { HiPencil, HiTrash, HiBookOpen, HiChevronDown, HiChevronUp } from "react-icons/hi2";
import { useAuth } from "../contexts/AuthContext";

export function Members({ toast, setPreview }) {
  const { user } = useAuth();
  const { data: members, loading, refresh: reloadMembers } = useData("/members");
  const { data: groups } = useData("/groups");
  const { data: schemes } = useData("/schemes");
  const { data: collections, refresh: reloadCollections } = useData("/collections");

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [expandedMember, setExpandedMember] = useState(null); // member id with schedule open
  const [payTarget, setPayTarget] = useState(null); // { member, group, scheme, installment }
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", pan: "", aadhaar: "", groupId: "" });
  const [errors, setErrors] = useState({});

  const isSuperAdmin = user?.role === "super_admin";
  const isSubAdmin = user?.role === "sub_admin";
  const canEdit = isSuperAdmin;
  const isUser = user?.role === "user";

  const generateMemberId = () => {
    const yr = String(new Date().getFullYear()).slice(-2);
    const prefix = `HRCHIT${yr}`;
    const max = members
      .filter(m => m.memberId?.startsWith(prefix))
      .reduce((n, m) => Math.max(n, parseInt(m.memberId.slice(prefix.length), 10) || 0), 0);
    return `${prefix}${String(max + 1).padStart(3, "0")}`;
  };

  const myMembers = isUser
    ? members.filter(m => m.memberId === user.userId || m.email === user.email)
    : members;

  const filtered = myMembers.filter(
    m => m.name?.toLowerCase().includes(search.toLowerCase()) || m.phone?.includes(search)
  );

  // ── helpers ──────────────────────────────────────────────────────────────────
  const getMemberGroup = (m) => groups.find(g => m.groups?.includes(g.id));
  const getScheme = (g) => schemes.find(s => s.id === g?.schemeId);

  // Due date = scheme start month + (month index) months. If no start, use joined date.
  const getDueDate = (member, monthNum) => {
    const base = member.joined ? new Date(member.joined) : new Date();
    const due = new Date(base.getFullYear(), base.getMonth() + monthNum - 1, 5); // 5th of that month
    return due.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const isPaid = (member, monthNum) =>
    collections.some(
      c => (c.memberId === member.id || c.memberId === member.memberId) &&
        Number(c.installment) === monthNum &&
        c.status === "Paid"
    );

  const isPending = (member, monthNum) =>
    collections.some(
      c => (c.memberId === member.id || c.memberId === member.memberId) &&
        Number(c.installment) === monthNum &&
        c.status === "Pending"
    );

  // ── form validation ──────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!/^\d{10}$/.test(form.phone)) e.phone = "10 digit phone required";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
    if (!form.pan.trim()) e.pan = "PAN required";
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(form.pan)) e.pan = "Invalid PAN (e.g. ABCDE1234F)";
    if (!/^\d{12}$/.test(form.aadhaar)) e.aadhaar = "12 digit Aadhaar required";
    if (!form.address.trim()) e.address = "Address required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      if (editingMember) {
        await updateData("/members", editingMember.id, { ...editingMember, ...form });
        toast.add("Member updated!");
      } else {
        const memberId = generateMemberId();
        await createData("/members", {
          ...form,
          id: "M" + Date.now().toString().slice(-6),
          memberId, userId: memberId,
          joined: new Date().toISOString().split("T")[0],
          status: "Active",
          groups: form.groupId ? [form.groupId] : [],
          modules: ["dashboard","members","schemes","groups","collections","billing","auctions","accounting","profile","payments"],
          permissions: ["view"],
        });
        toast.add("Member added!");
      }
      resetForm();
      reloadMembers();
    } catch (err) {
      toast.add("Error: " + err.message, "error");
    }
  };

  const resetForm = () => {
    setShowForm(false); setEditingMember(null);
    setForm({ name: "", phone: "", email: "", address: "", pan: "", aadhaar: "", groupId: "" });
    setErrors({});
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this member?")) return;
    try { await deleteData("/members", id); toast.add("Deleted!"); reloadMembers(); }
    catch (err) { toast.add(err.message, "error"); }
  };

  const handleLedger = (member) => {
    const mc = collections.filter(c => c.memberId === member.id || c.memberId === member.memberId);
    const total = mc.reduce((s, c) => s + (c.amount || 0), 0);
    setPreview({
      title: "Member Ledger", docNo: "LED" + genId(""),
      member,
      chit: { "Total Paid": fmt(total), "Transactions": mc.length, "Status": member.status },
      payments: {
        headers: ["Date", "Description", "Amount", "Mode", "Status"],
        rows: mc.map(c => [c.date?.split("T")[0], "Installment #" + c.installment, fmt(c.amount), c.mode, c.status])
      },
      amount: total, notes: "Complete payment history for " + member.name,
    });
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;

  const inp = { padding: "10px 14px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#f8fafc", fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box" };

  return (
    <div>
      <SectionHeader
        title="Members"
        subtitle={isUser ? "My installment schedule" : "Manage members & installment schedules"}
        actions={isSuperAdmin ? [<Btn key="a" label="+ Add Member" primary onClick={() => { resetForm(); setShowForm(true); }} />] : []}
      />

      {/* ── Add / Edit Form ── */}
      {showForm && canEdit && (
        <div style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>{editingMember ? "Edit Member" : "New Member"}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "12px 20px" }}>
            {[["Full Name *", "name"], ["Phone *", "phone"], ["Email", "email"], ["PAN *", "pan"], ["Aadhaar *", "aadhaar"]].map(([lbl, key]) => (
              <div key={key}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>{lbl}</label>
                <input style={inp} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
                {errors[key] && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 3 }}>{errors[key]}</div>}
              </div>
            ))}
            <div style={{ gridColumn: "1/-1" }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Address *</label>
              <input style={inp} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
              {errors.address && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 3 }}>{errors.address}</div>}
            </div>
            {!editingMember && (
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Assign Group</label>
                <select style={inp} value={form.groupId} onChange={e => setForm({ ...form, groupId: e.target.value })}>
                  <option value="">— No group —</option>
                  {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <Btn label={editingMember ? "Update" : "Add Member"} primary onClick={handleSubmit} />
            <Btn label="Cancel" onClick={resetForm} />
          </div>
        </div>
      )}

      {/* ── Search ── */}
      {!isUser && (
        <div style={{ marginBottom: 16 }}>
          <input style={{ ...inp, maxWidth: 320 }} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or phone..." />
        </div>
      )}

      {/* ── Member list ── */}
      {filtered.map(member => {
        const group = getMemberGroup(member);
        const scheme = getScheme(group);
        const isExpanded = expandedMember === member.id;

        return (
          <div key={member.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, marginBottom: 16, overflow: "hidden" }}>
            {/* Member row */}
            <div style={{ display: "flex", alignItems: "center", padding: "14px 20px", gap: 12, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{member.name}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                  {member.memberId} · {member.phone}
                  {group && <span style={{ marginLeft: 8, color: "#7c3aed", fontWeight: 600 }}>{group.name}</span>}
                </div>
              </div>
              {scheme && (
                <div style={{ fontSize: 12, color: "#64748b", textAlign: "center" }}>
                  <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 13 }}>{scheme.name}</div>
                  <div>{fmt(scheme.monthlyInstallment)}/mo · {scheme.duration} months</div>
                </div>
              )}
              <Badge text={member.status} color={member.status === "Active" ? "green" : "red"} />
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {scheme && (
                  <button
                    onClick={() => setExpandedMember(isExpanded ? null : member.id)}
                    style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 8, border: "1px solid #7c3aed", background: isExpanded ? "#7c3aed" : "transparent", color: isExpanded ? "#fff" : "#7c3aed", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    Schedule {isExpanded ? <HiChevronUp size={14} /> : <HiChevronDown size={14} />}
                  </button>
                )}
                <IconBtn icon={<HiBookOpen size={14} />} onClick={() => handleLedger(member)} color="#d97706" title="Ledger" />
                {canEdit && <IconBtn icon={<HiPencil size={14} />} onClick={() => { setEditingMember(member); setForm({ name: member.name, phone: member.phone, email: member.email || "", address: member.address || "", pan: member.pan || "", aadhaar: member.aadhaar || "", groupId: "" }); setShowForm(true); }} color="#2563eb" title="Edit" />}
                {canEdit && <IconBtn icon={<HiTrash size={14} />} onClick={() => handleDelete(member.id)} color="#dc2626" title="Delete" />}
              </div>
            </div>

            {/* ── Monthly Installment Schedule ── */}
            {isExpanded && scheme && (
              <div style={{ borderTop: "1px solid #f1f5f9", padding: "0 20px 16px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", padding: "12px 0 8px", letterSpacing: 1 }}>
                  MONTHLY INSTALLMENT SCHEDULE — {scheme.name}
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: "#f8fafc" }}>
                        {["Month", "Due Date", "Installment (₹)", "Auction Amt (₹)", "Status", "Action"].map(h => (
                          <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: "#64748b", fontWeight: 600, fontSize: 12, borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(scheme.monthlyAmounts?.length
                        ? scheme.monthlyAmounts
                        : Array.from({ length: scheme.duration }, (_, i) => ({ month: i + 1, amount: scheme.monthlyInstallment, auctionAmount: 0 }))
                      ).map((m) => {
                        const paid = isPaid(member, m.month);
                        const pending = isPending(member, m.month);
                        const dueDate = getDueDate(member, m.month);
                        const now = new Date();
                        const dueD = new Date(member.joined || now);
                        dueD.setMonth(dueD.getMonth() + m.month - 1);
                        dueD.setDate(5);
                        const overdue = !paid && !pending && dueD < now;

                        return (
                          <tr key={m.month} style={{ borderBottom: "1px solid #f1f5f9", background: paid ? "#f0fdf4" : pending ? "#fffbeb" : overdue ? "#fef2f2" : "#fff" }}>
                            <td style={{ padding: "10px 12px", fontWeight: 700, color: "#0f172a" }}>Month {m.month}</td>
                            <td style={{ padding: "10px 12px", color: overdue ? "#dc2626" : "#64748b", fontWeight: overdue ? 600 : 400 }}>
                              {dueDate}{overdue && <span style={{ marginLeft: 6, fontSize: 11, background: "#fef2f2", color: "#dc2626", borderRadius: 4, padding: "1px 6px" }}>Overdue</span>}
                            </td>
                            <td style={{ padding: "10px 12px", fontWeight: 700, color: "#0f172a" }}>{fmt(m.amount)}</td>
                            <td style={{ padding: "10px 12px", color: m.auctionAmount > 0 ? "#7c3aed" : "#94a3b8", fontWeight: m.auctionAmount > 0 ? 700 : 400 }}>
                              {m.auctionAmount > 0 ? fmt(m.auctionAmount) : "—"}
                            </td>
                            <td style={{ padding: "10px 12px" }}>
                              {paid
                                ? <span style={{ background: "#dcfce7", color: "#166534", borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>✓ Paid</span>
                                : pending
                                  ? <span style={{ background: "#fef9c3", color: "#854d0e", borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>⏳ Pending</span>
                                  : <span style={{ background: overdue ? "#fee2e2" : "#f1f5f9", color: overdue ? "#dc2626" : "#64748b", borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>
                                    {overdue ? "Overdue" : "Due"}
                                  </span>
                              }
                            </td>
                            <td style={{ padding: "10px 12px" }}>
                              {!paid && !pending ? (
                                <button
                                  onClick={() => setPayTarget({ member, group, scheme, installment: m })}
                                  style={{ padding: "6px 14px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                                  Pay ₹{m.amount.toLocaleString("en-IN")}
                                </button>
                              ) : pending ? (
                                <span style={{ fontSize: 12, color: "#92400e" }}>Awaiting approval</span>
                              ) : (
                                <span style={{ fontSize: 12, color: "#16a34a" }}>Completed</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Progress bar */}
                {(() => {
                  const total = scheme.duration || 0;
                  const paidCount = (scheme.monthlyAmounts?.length
                    ? scheme.monthlyAmounts
                    : Array.from({ length: total }, (_, i) => ({ month: i + 1 }))
                  ).filter(m => isPaid(member, m.month)).length;
                  const pct = total ? Math.round((paidCount / total) * 100) : 0;
                  return (
                    <div style={{ marginTop: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                        <span>{paidCount} of {total} months paid</span>
                        <span style={{ fontWeight: 700 }}>{pct}% complete</span>
                      </div>
                      <div style={{ background: "#e5e7eb", borderRadius: 99, height: 8 }}>
                        <div style={{ width: `${pct}%`, background: "linear-gradient(90deg,#2563eb,#7c3aed)", borderRadius: 99, height: 8, transition: "width .4s" }} />
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        );
      })}

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: 48, color: "#94a3b8", fontSize: 14 }}>No members found.</div>
      )}

      {/* ── Payment Modal ── */}
      {payTarget && (
        <PaymentModal
          member={payTarget.member}
          group={payTarget.group}
          scheme={payTarget.scheme}
          installment={payTarget.installment}
          onClose={() => setPayTarget(null)}
          onSuccess={() => { setPayTarget(null); reloadCollections(); reloadMembers(); }}
        />
      )}
    </div>
  );
}
