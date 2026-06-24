import { useState } from "react";
import { useData } from "../hooks/useData";
import { createData, updateData, deleteData } from "../utils/api";
import { SectionHeader } from "../components/SectionHeader";
import { Badge } from "../components/Badge";
import { Btn } from "../components/Btn";
import { Input } from "../components/Input";
import { Table } from "../components/Table";
import { fmt } from "../utils/helpers";
import { useAuth } from "../contexts/AuthContext";

export function Schemes({ dark, toast }) {
  const { user } = useAuth();
  const { data: schemes, loading, refresh: reload } = useData("/schemes");
  const { data: groups } = useData("/groups");
  const { data: members } = useData("/members");
  const [showForm, setShowForm] = useState(false);
  const [editingScheme, setEditingScheme] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [form, setForm] = useState({ name: "", amount: "", duration: "", members: "", monthlyInstallment: "", commission: "", monthlyAmounts: [] });
  const [errors, setErrors] = useState({});

  const isUser = user?.role === "user";
  const canEdit = user?.role === "super_admin" || user?.role === "sub_admin";

  // User: only see scheme linked to their group
  const userMember = isUser ? members.find(m => m.memberId === user.userId || m.email === user.email) : null;
  const userGroupIds = userMember?.groups || [];
  const userSchemeIds = groups.filter(g => userGroupIds.includes(g.id)).map(g => g.schemeId);
  const visibleSchemes = isUser ? schemes.filter(s => userSchemeIds.includes(s.id)) : schemes;

  const statStyle = (color) => ({
    background: dark ? "rgba(255,255,255,.05)" : "#fff",
    border: dark ? "1px solid rgba(255,255,255,.1)" : `1px solid ${color}20`,
    borderRadius: 12, padding: "16px 20px",
  });

  const filtered = visibleSchemes.filter(s => {
    const matchSearch = s.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const updateMonthAmount = (i, val) => setForm(f => { const ma = [...f.monthlyAmounts]; ma[i] = { ...ma[i], amount: val }; return { ...f, monthlyAmounts: ma }; });
  const updateMonthAuction = (i, val) => setForm(f => { const ma = [...f.monthlyAmounts]; ma[i] = { ...ma[i], auctionAmount: val }; return { ...f, monthlyAmounts: ma }; });

  const validateForm = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Scheme name is required";
    if (!form.amount || Number(form.amount) <= 0) e.amount = "Valid amount required";
    if (!form.duration || Number(form.duration) <= 0) e.duration = "Valid duration required";
    if (!form.members || Number(form.members) <= 0) e.members = "Valid member count required";
    if (!form.monthlyInstallment || Number(form.monthlyInstallment) <= 0) e.monthlyInstallment = "Valid installment required";
    if (form.commission === "" || Number(form.commission) < 0 || Number(form.commission) > 100) e.commission = "Commission 0–100";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      const schemeData = {
        ...form,
        id: editingScheme ? editingScheme.id : "S" + Date.now().toString().slice(-6),
        amount: Number(form.amount), duration: Number(form.duration),
        members: Number(form.members), monthlyInstallment: Number(form.monthlyInstallment),
        commission: Number(form.commission),
        monthlyAmounts: form.monthlyAmounts.map(m => ({ month: m.month, amount: Number(m.amount), auctionAmount: Number(m.auctionAmount) || 0 })),
        status: editingScheme?.status || "Active",
      };
      if (editingScheme) { await updateData("/schemes", editingScheme.id, schemeData); toast.add("Scheme updated!"); }
      else { await createData("/schemes", schemeData); toast.add("Scheme added!"); }
      setShowForm(false); setEditingScheme(null);
      setForm({ name: "", amount: "", duration: "", members: "", monthlyInstallment: "", commission: "", monthlyAmounts: [] });
      setErrors({}); reload();
    } catch (err) { toast.add("Error: " + err.message, "error"); }
  };

  const handleEdit = (s) => {
    setEditingScheme(s);
    setForm({
      name: s.name, amount: s.amount, duration: s.duration, members: s.members,
      monthlyInstallment: s.monthlyInstallment, commission: s.commission,
      monthlyAmounts: s.monthlyAmounts?.length > 0
        ? s.monthlyAmounts.map(m => ({ month: m.month, amount: m.amount, auctionAmount: m.auctionAmount || 0 }))
        : Array.from({ length: s.duration }, (_, i) => ({ month: i + 1, amount: s.monthlyInstallment, auctionAmount: 0 })),
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this scheme?")) return;
    try { await deleteData("/schemes", id); toast.add("Deleted!"); reload(); }
    catch (err) { toast.add(err.message, "error"); }
  };

  const handleToggleStatus = async (s) => {
    try {
      const newStatus = s.status === "Active" ? "Closed" : "Active";
      await updateData("/schemes", s.id, { ...s, status: newStatus });
      toast.add(`Scheme ${newStatus}!`); reload();
    } catch (err) { toast.add(err.message, "error"); }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;

  const inp = { padding: "10px 14px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#f8fafc", fontSize: 14, outline: "none" };

  return (
    <div>
      <SectionHeader
        title="Chit Schemes"
        subtitle={isUser ? "Your enrolled scheme details" : "Manage chit fund scheme configurations"}
        dark={dark}
        actions={canEdit ? [<Btn key="a" label="+ New Scheme" primary onClick={() => { setEditingScheme(null); setForm({ name: "", amount: "", duration: "", members: "", monthlyInstallment: "", commission: "", monthlyAmounts: [] }); setShowForm(true); }} />] : []}
      />

      {/* Admin form */}
      {showForm && canEdit && (
        <div style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>{editingScheme ? "Edit Scheme" : "New Scheme"}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "12px 20px" }}>
            {[["Scheme Name *","name"],["Chit Amount (₹) *","amount"],["Duration (months) *","duration"],["Members *","members"],["Monthly Installment *","monthlyInstallment"],["Commission (%) *","commission"]].map(([lbl,key]) => (
              <div key={key}>
                <Input label={lbl} value={form[key]} onChange={v => {
                  const updated = { ...form, [key]: v };
                  if ((key === "duration" || key === "monthlyInstallment") && Number(updated.duration) > 0) {
                    updated.monthlyAmounts = Array.from({ length: Number(updated.duration) }, (_, i) => ({
                      month: i + 1, amount: Number(updated.monthlyInstallment) || 0, auctionAmount: form.monthlyAmounts[i]?.auctionAmount || 0,
                    }));
                  }
                  setForm(updated);
                }} type={key === "name" ? "text" : "number"} />
                {errors[key] && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 3 }}>{errors[key]}</div>}
              </div>
            ))}
          </div>

          {form.monthlyAmounts.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#64748b", marginBottom: 10 }}>Monthly Installment Breakdown</div>
              <div style={{ maxHeight: 300, overflowY: "auto", border: "1px solid #e5e7eb", borderRadius: 8 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#f1f5f9", position: "sticky", top: 0 }}>
                      {["Month","Installment (₹)","Auction Amount (₹)"].map(h => (
                        <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, color: "#64748b" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {form.monthlyAmounts.map((m, i) => (
                      <tr key={i} style={{ borderTop: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "8px 12px", fontWeight: 600 }}>Month {m.month}</td>
                        <td style={{ padding: "4px 12px" }}>
                          <input type="number" value={m.amount} onChange={e => updateMonthAmount(i, e.target.value)} style={{ ...inp, width: "100%", boxSizing: "border-box" }} />
                        </td>
                        <td style={{ padding: "4px 12px" }}>
                          <input type="number" value={m.auctionAmount || 0} onChange={e => updateMonthAuction(i, e.target.value)} style={{ ...inp, width: "100%", boxSizing: "border-box" }} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <Btn label={editingScheme ? "Update Scheme" : "Save Scheme"} onClick={handleSubmit} primary />
            <Btn label="Cancel" onClick={() => { setShowForm(false); setEditingScheme(null); setForm({ name: "", amount: "", duration: "", members: "", monthlyInstallment: "", commission: "", monthlyAmounts: [] }); setErrors({}); }} />
          </div>
        </div>
      )}

      {/* Stats — only for admins */}
      {!isUser && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 24 }}>
          <div style={statStyle("#3b82f6")}><div style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, marginBottom: 4 }}>Total Schemes</div><div style={{ fontSize: 24, fontWeight: 800, color: "#3b82f6" }}>{schemes.length}</div></div>
          <div style={statStyle("#10b981")}><div style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, marginBottom: 4 }}>Active</div><div style={{ fontSize: 24, fontWeight: 800, color: "#10b981" }}>{schemes.filter(s => s.status === "Active").length}</div></div>
          <div style={statStyle("#f59e0b")}><div style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, marginBottom: 4 }}>Total Chit Value</div><div style={{ fontSize: 20, fontWeight: 800, color: "#f59e0b" }}>{fmt(schemes.reduce((s, c) => s + (c.amount || 0), 0))}</div></div>
          <div style={statStyle("#8b5cf6")}><div style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, marginBottom: 4 }}>Monthly Inflow</div><div style={{ fontSize: 20, fontWeight: 800, color: "#8b5cf6" }}>{fmt(schemes.reduce((s, c) => s + (c.monthlyInstallment || 0), 0))}</div></div>
        </div>
      )}

      {/* Search/filter — only for admins */}
      {!isUser && (
        <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search schemes..." style={{ ...inp, maxWidth: 280 }} />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ ...inp, maxWidth: 150 }}>
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      )}

      {/* User: card view of their scheme */}
      {isUser && filtered.length > 0 && (
        <div style={{ display: "grid", gap: 20 }}>
          {filtered.map(s => (
            <div key={s.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>{s.name}</div>
                  <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>Chit Value: <strong>{fmt(s.amount)}</strong> · Duration: <strong>{s.duration} months</strong></div>
                </div>
                <Badge text={s.status} color={s.status === "Active" ? "green" : "gray"} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12, marginBottom: 20 }}>
                {[["Monthly Installment", fmt(s.monthlyInstallment), "#2563eb"],["Commission", s.commission + "%", "#7c3aed"],["Members", s.members, "#0891b2"],["Duration", s.duration + " months", "#059669"]].map(([lbl,val,color]) => (
                  <div key={lbl} style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 16px", border: `1px solid ${color}20` }}>
                    <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, marginBottom: 4 }}>{lbl}</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color }}>{val}</div>
                  </div>
                ))}
              </div>
              {s.monthlyAmounts?.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 10, letterSpacing: 1 }}>MONTHLY BREAKDOWN</div>
                  <div style={{ maxHeight: 260, overflowY: "auto", border: "1px solid #e5e7eb", borderRadius: 8 }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: "#f1f5f9" }}>
                          {["Month","Installment (₹)","Auction Amount (₹)"].map(h => (
                            <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, color: "#64748b", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {s.monthlyAmounts.map(m => (
                          <tr key={m.month} style={{ borderBottom: "1px solid #f1f5f9" }}>
                            <td style={{ padding: "9px 12px", fontWeight: 700 }}>Month {m.month}</td>
                            <td style={{ padding: "9px 12px", fontWeight: 700, color: "#0f172a" }}>{fmt(m.amount)}</td>
                            <td style={{ padding: "9px 12px", color: m.auctionAmount > 0 ? "#7c3aed" : "#94a3b8", fontWeight: m.auctionAmount > 0 ? 700 : 400 }}>
                              {m.auctionAmount > 0 ? fmt(m.auctionAmount) : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {isUser && filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>No scheme assigned to your account yet.</div>
      )}

      {/* Admin: table view */}
      {!isUser && (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
          <Table dark={dark} cols={["Scheme Name","Chit Value","Duration","Members","Monthly Installment","Commission","Status","Actions"]}
            rows={filtered.map(s => [
              <span key={s.id} style={{ fontWeight: 600 }}>{s.name}</span>,
              <span key={s.id+"v"} style={{ fontWeight: 700, color: "#10b981" }}>{fmt(s.amount)}</span>,
              s.duration + " months", s.members,
              <span key={s.id+"mi"} style={{ fontWeight: 600 }}>{fmt(s.monthlyInstallment)}</span>,
              s.commission + "%",
              <Badge key={s.id+"st"} text={s.status} color={s.status === "Active" ? "green" : "gray"} />,
              <div key={s.id+"a"} style={{ display: "flex", gap: 6 }}>
                {canEdit && <>
                  <button onClick={() => handleEdit(s)} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: "1px solid #2563eb", background: "transparent", color: "#2563eb", cursor: "pointer", fontWeight: 600 }}>Edit</button>
                  <button onClick={() => handleToggleStatus(s)} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: `1px solid ${s.status === "Active" ? "#dc2626" : "#10b981"}`, background: s.status === "Active" ? "#dc2626" : "#10b981", color: "#fff", cursor: "pointer", fontWeight: 600 }}>{s.status === "Active" ? "Close" : "Activate"}</button>
                  <button onClick={() => handleDelete(s.id)} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: "1px solid #dc2626", background: "transparent", color: "#dc2626", cursor: "pointer", fontWeight: 600 }}>Delete</button>
                </>}
              </div>,
            ])} />
        </div>
      )}
    </div>
  );
}
