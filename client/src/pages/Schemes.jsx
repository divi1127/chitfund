import { useState, useEffect } from "react";
import { useData } from "../hooks/useData";
import { createData, updateData, deleteData } from "../utils/api";
import { SectionHeader } from "../components/SectionHeader";
import { Badge } from "../components/Badge";
import { Btn } from "../components/Btn";
import { Input } from "../components/Input";
import { fmt } from "../utils/helpers";
import { IconBtn } from "../components/IconBtn";
import { HiPencil, HiTrash, HiCheckCircle, HiPause } from "react-icons/hi2";
import { useAuth } from "../contexts/AuthContext";

export function Schemes({ toast }) {
  const { user } = useAuth();
  const { data: schemes, loading } = useData('/schemes');
  const [refresh, setRefresh] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingScheme, setEditingScheme] = useState(null);
  const [form, setForm] = useState({ name: "", amount: "", duration: "", members: "", monthlyInstallment: "", commission: "", monthlyAmounts: [] });
  const [errors, setErrors] = useState({});

  const isSuperAdmin = user?.role === "super_admin";

  useEffect(() => {
    const dur = Number(form.duration);
    if (dur > 0 && form.monthlyAmounts.length !== dur) {
      const newAmounts = Array.from({ length: dur }, (_, i) => ({
        month: i + 1,
        amount: form.monthlyAmounts[i]?.amount || Number(form.monthlyInstallment) || 0,
        auctionAmount: form.monthlyAmounts[i]?.auctionAmount || 0
      }));
      setForm(prev => ({ ...prev, monthlyAmounts: newAmounts }));
    }
  }, [form.duration]);

  const updateMonthAmount = (index, value) => {
    const newAmounts = form.monthlyAmounts.map((m, i) =>
      i === index ? { ...m, amount: Number(value) || 0 } : m
    );
    setForm(prev => ({ ...prev, monthlyAmounts: newAmounts, monthlyInstallment: (Number(value) || 0).toString() }));
  };

  const updateMonthAuction = (index, value) => {
    const newAmounts = form.monthlyAmounts.map((m, i) =>
      i === index ? { ...m, auctionAmount: Number(value) || 0 } : m
    );
    setForm(prev => ({ ...prev, monthlyAmounts: newAmounts }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Scheme name is required";
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) newErrors.amount = "Valid amount is required";
    if (!form.duration || isNaN(form.duration) || Number(form.duration) <= 0) newErrors.duration = "Valid duration is required";
    if (!form.members || isNaN(form.members) || Number(form.members) <= 0) newErrors.members = "Valid member count is required";
    if (!form.monthlyInstallment || isNaN(form.monthlyInstallment) || Number(form.monthlyInstallment) <= 0) newErrors.monthlyInstallment = "Valid monthly installment is required";
    if (!form.commission || isNaN(form.commission) || Number(form.commission) < 0 || Number(form.commission) > 100) newErrors.commission = "Commission must be between 0-100";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      const totalAuction = form.monthlyAmounts.reduce((sum, m) => sum + (Number(m.auctionAmount) || 0), 0);
      const schemeData = {
        ...form,
        id: editingScheme ? editingScheme.id : "S" + Date.now().toString().slice(-6),
        amount: Number(form.amount),
        duration: Number(form.duration),
        members: Number(form.members),
        monthlyInstallment: Number(form.monthlyInstallment),
        monthlyAmounts: form.monthlyAmounts.map(m => ({ month: m.month, amount: Number(m.amount), auctionAmount: Number(m.auctionAmount) || 0 })),
        commission: Number(form.commission),
        auctionAmount: totalAuction || Number(form.amount) || 0,
        status: editingScheme ? editingScheme.status : "Active"
      };

      if (editingScheme) {
        await updateData('/schemes', editingScheme.id, schemeData);
        toast.add("Scheme updated successfully!");
      } else {
        await createData('/schemes', schemeData);
        toast.add("Scheme added successfully!");
      }
      
      setShowForm(false);
      setEditingScheme(null);
      setForm({ name: "", amount: "", duration: "", members: "", monthlyInstallment: "", commission: "", auctionAmount: "", monthlyAmounts: [] });
      setErrors({});
      setRefresh(refresh + 1);
    } catch (error) {
      toast.add("Error saving scheme: " + error.message, "error");
    }
  };

  const handleEdit = (scheme) => {
    setEditingScheme(scheme);
    setForm({
      name: scheme.name,
      amount: scheme.amount,
      duration: scheme.duration,
      members: scheme.members,
      monthlyInstallment: scheme.monthlyInstallment,
      monthlyAmounts: scheme.monthlyAmounts?.length > 0
        ? scheme.monthlyAmounts.map(m => ({ month: m.month, amount: m.amount, auctionAmount: m.auctionAmount || 0 }))
        : Array.from({ length: scheme.duration }, (_, i) => ({ month: i + 1, amount: scheme.monthlyInstallment, auctionAmount: 0 })),
      commission: scheme.commission
    });
    setShowForm(true);
  };

  const handleDelete = async (schemeId) => {
    if (!confirm("Are you sure you want to delete this scheme?")) return;
    try {
      await deleteData('/schemes', schemeId);
      toast.add("Scheme deleted successfully!");
      setRefresh(refresh + 1);
    } catch (error) {
      toast.add("Error deleting scheme: " + error.message, "error");
    }
  };

  const handleToggleStatus = async (scheme) => {
    try {
      const newStatus = scheme.status === "Active" ? "Finished" : "Active";
      await updateData('/schemes', scheme.id, { ...scheme, status: newStatus });
      toast.add(`Scheme ${newStatus === "Active" ? "activated" : "finished"} successfully!`);
      setRefresh(refresh + 1);
    } catch (error) {
      toast.add("Error updating scheme status: " + error.message, "error");
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;

  return (
    <div>
      <SectionHeader title="Chit Schemes" subtitle="Manage chit fund scheme configurations"
        actions={isSuperAdmin ? [<Btn key="a" label="+ New Scheme" onClick={() => { setEditingScheme(null); setForm({ name: "", amount: "", duration: "", members: "", monthlyInstallment: "", commission: "", monthlyAmounts: [] }); setShowForm(true); }} primary />] : []} />

      {showForm && isSuperAdmin && (
        <div style={{ background: "var(--bg-card-alt)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>{editingScheme ? "Edit Scheme" : "New Scheme"}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "0 20px" }}>
            <div>
              <Input label="Scheme Name *" value={form.name} onChange={v => setForm({ ...form, name: v })} />
              {errors.name && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.name}</div>}
            </div>
            <div>
              <Input label="Chit Amount (₹) *" value={form.amount} onChange={v => setForm({ ...form, amount: v })} type="number" />
              {errors.amount && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.amount}</div>}
            </div>
            <div>
              <Input label="Duration (months) *" value={form.duration} onChange={v => setForm({ ...form, duration: v })} type="number" />
              {errors.duration && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.duration}</div>}
            </div>
            <div>
              <Input label="Number of Members *" value={form.members} onChange={v => setForm({ ...form, members: v })} type="number" />
              {errors.members && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.members}</div>}
            </div>
            <div>
              <Input label="Commission (%) *" value={form.commission} onChange={v => setForm({ ...form, commission: v })} type="number" />
              {errors.commission && <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.commission}</div>}
            </div>
          </div>

          {Number(form.duration) > 0 && form.monthlyAmounts.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 10 }}>Monthly Installment Breakdown</div>
              <div style={{ maxHeight: 300, overflowY: "auto", border: "1px solid var(--border-color)", borderRadius: 8 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "var(--table-header-bg)", position: "sticky", top: 0 }}>
                      <th style={{ padding: "8px 12px", textAlign: "left", color: "var(--text-secondary)", fontWeight: 600 }}>Month</th>
                      <th style={{ padding: "8px 12px", textAlign: "left", color: "var(--text-secondary)", fontWeight: 600 }}>Installment (₹)</th>
                      <th style={{ padding: "8px 12px", textAlign: "right", color: "var(--text-secondary)", fontWeight: 600 }}>Auction Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.monthlyAmounts.map((m, i) => (
                      <tr key={i} style={{ borderTop: "1px solid var(--border-color)" }}>
                        <td style={{ padding: "8px 12px", color: "var(--text-primary)", fontWeight: 600 }}>Month {m.month}</td>
                        <td style={{ padding: "4px 12px" }}>
                          <input
                            type="number"
                            value={m.amount}
                            onChange={e => updateMonthAmount(i, e.target.value)}
                            style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: "1px solid var(--border-input)", background: "var(--bg-input)", color: "var(--text-primary)", fontSize: 13, outline: "none" }}
                          />
                        </td>
                        <td style={{ padding: "4px 12px" }}>
                          <input
                            type="number"
                            value={m.auctionAmount || 0}
                            onChange={e => updateMonthAuction(i, e.target.value)}
                            style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: "1px solid var(--border-input)", background: "var(--bg-input)", color: "var(--text-primary)", fontSize: 13, outline: "none", textAlign: "right" }}
                          />
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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
        {schemes.map(s => (
          <div key={s.id} style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 20, borderTop: "3px solid var(--scheme-color, #d97706)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {s.icon ? <span style={{ fontSize: 18 }}>{s.icon}</span> : <span style={{ fontSize: 18 }}>📋</span>}
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{s.name}</div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Badge text={s.status} color={s.status === "Active" ? "green" : s.status === "Finished" ? "gray" : "yellow"} />
                {isSuperAdmin && (
                  <>
                    <IconBtn icon={s.status === "Active" ? <HiPause size={14} /> : <HiCheckCircle size={14} />} onClick={() => handleToggleStatus(s)} color={s.status === "Active" ? "#dc2626" : "#10b981"} title={s.status === "Active" ? "Finish" : "Activate"} />
                    <IconBtn icon={<HiPencil size={14} />} onClick={() => handleEdit(s)} color="#2563eb" title="Edit" />
                    <IconBtn icon={<HiTrash size={14} />} onClick={() => handleDelete(s.id)} color="#dc2626" title="Delete" />
                  </>
                )}
              </div>
            </div>
            {[["Chit Value", fmt(s.amount)], ["Duration", s.duration + " months"], ["Members", s.members], ["Monthly", fmt(s.monthlyInstallment)], ["Commission", s.commission + "%"]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                <span style={{ color: "var(--text-muted)" }}>{k}</span>
                <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{v}</span>
              </div>
            ))}
            {s.monthlyAmounts?.length > 0 && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--border-color)" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>Month-wise Breakdown</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 4 }}>
                  {s.monthlyAmounts.map(m => {
                    const auc = m.auctionAmount || 0;
                    return (
                      <div key={m.month} style={{ fontSize: 11, padding: "4px 8px", background: "var(--bg-card-alt)", borderRadius: 4, color: "var(--text-secondary)" }}>
                        <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>M{m.month}</span>: {fmt(m.amount)}
                        <span style={{ color: "var(--text-muted)", marginLeft: 4 }}>| Auc: {fmt(auc)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
