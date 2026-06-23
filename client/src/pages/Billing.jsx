// Billing page component
import { useState } from "react";
import { useData } from "../hooks/useData";
import { SectionHeader } from "../components/SectionHeader";
import { Btn } from "../components/Btn";
import { Input } from "../components/Input";
import { COMPANY } from "../utils/constants";
import { fmt, numberToWords, genId } from "../utils/helpers";
import { HiXMark, HiPlus, HiEye, HiArrowDownTray } from "react-icons/hi2";
import { IconBtn } from "../components/IconBtn";

export function Billing({ toast, setPreview }) {
  const { data: members } = useData('/members');
  const { data: groups } = useData('/groups');
  const { data: schemes } = useData('/schemes');
  const [memberId, setMemberId] = useState("");
  const [groupId, setGroupId] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [items, setItems] = useState([{ desc: "", qty: 1, rate: "" }]);
  const [note, setNote] = useState("");

  const memberById = (id) => members.find((m) => m.id === id);
  const groupById = (id) => groups.find((g) => g.id === id);
  const schemeById = (id) => schemes.find((s) => s.id === id);

  const total = items.reduce((s, i) => s + (Number(i.qty) * Number(i.rate) || 0), 0);

  const genInvoice = () => {
    if (!memberId || !groupId || total === 0) { toast.add("Fill member, group and at least one line item", "error"); return; }
    const m = memberById(memberId); const g = groupById(groupId); const s = g ? schemeById(g.schemeId) : null;
    setPreview({
      title: "Tax Invoice",
      docNo: "INV" + genId(""),
      member: m,
      chit: { "Group": g?.name, "Scheme": s?.name, "GSTIN": COMPANY.gstin, "Place of Supply": "Tamil Nadu", "Payment Mode": paymentMode || "Cash" },
      payments: {
        headers: ["Description", "Qty", "Rate", "Amount"],
        rows: [...items.map(i => [i.desc, i.qty, fmt(i.rate), fmt(Number(i.qty) * Number(i.rate))]),
          ["Subtotal", "", "", fmt(total)], ["CGST @2.5%", "", "", fmt(total * 0.025)], ["SGST @2.5%", "", "", fmt(total * 0.025)], ["Total", "", "", fmt(total * 1.05)]]
      },
      amount: Math.round(total * 1.05),
      notes: note || "GST Invoice as per CGST Act 2017."
    });
  };

  const downloadInvoice = () => {
    if (!memberId || !groupId || total === 0) { toast.add("Fill member, group and at least one line item", "error"); return; }
    const m = memberById(memberId); const g = groupById(groupId); const s = g ? schemeById(g.schemeId) : null;
    
    const invoiceData = {
      title: "Tax Invoice",
      docNo: "INV" + genId(""),
      member: m,
      chit: { "Group": g?.name, "Scheme": s?.name, "GSTIN": COMPANY.gstin, "Place of Supply": "Tamil Nadu", "Payment Mode": paymentMode || "Cash" },
      payments: {
        headers: ["Description", "Qty", "Rate", "Amount"],
        rows: [...items.map(i => [i.desc, i.qty, fmt(i.rate), fmt(Number(i.qty) * Number(i.rate))]),
          ["Subtotal", "", "", fmt(total)], ["CGST @2.5%", "", "", fmt(total * 0.025)], ["SGST @2.5%", "", "", fmt(total * 0.025)], ["Total", "", "", fmt(total * 1.05)]]
      },
      amount: Math.round(total * 1.05),
      notes: note || "GST Invoice as per CGST Act 2017."
    };

    // Create a simple text-based invoice for download
    const invoiceText = `
${COMPANY.name}
${COMPANY.address}
Phone: ${COMPANY.phone}
Email: ${COMPANY.email}
GSTIN: ${COMPANY.gstin}
CIN: ${COMPANY.cin}

${invoiceData.title}
Document No: ${invoiceData.docNo}
Date: ${new Date().toLocaleDateString()}

FROM:
${COMPANY.name}
${COMPANY.address}
Phone: ${COMPANY.phone}
Email: ${COMPANY.email}
GSTIN: ${COMPANY.gstin}

TO:
${invoiceData.member?.name}
${invoiceData.member?.address}
Phone: ${invoiceData.member?.phone}
Email: ${invoiceData.member?.email}
PAN: ${invoiceData.member?.pan}
Aadhaar: ${invoiceData.member?.aadhaar}

Chit Details:
Group: ${invoiceData.chit["Group"]}
Scheme: ${invoiceData.chit["Scheme"]}
Payment Mode: ${invoiceData.chit["Payment Mode"]}
GSTIN: ${invoiceData.chit["GSTIN"]}
Place of Supply: ${invoiceData.chit["Place of Supply"]}

${invoiceData.payments.headers.join("\t")}
${invoiceData.payments.rows.map(row => row.join("\t")).join("\n")}

Amount in Words: ${numberToWords(invoiceData.amount)} Rupees Only

Notes: ${invoiceData.notes}

Thank you for your business!
    `.trim();

    const blob = new Blob([invoiceText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice_${invoiceData.docNo}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.add("Invoice downloaded successfully!");
  };

  return (
    <div>
      <SectionHeader title="Billing & Invoicing" subtitle="Generate GST invoices and bills" />
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "0 20px" }}>
          <Input label="Member" value={memberId} onChange={setMemberId} options={members.map(m => ({ value: m.id, label: m.name }))} />
          <Input label="Group" value={groupId} onChange={setGroupId} options={groups.map(g => ({ value: g.id, label: g.name }))} />
          <Input label="Payment Mode" value={paymentMode} onChange={setPaymentMode} options={["Cash", "Online", "Cheque", "DD", "UPI"].map(v => ({ value: v, label: v }))} />
        </div>

        {/* Line items */}
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Line Items</div>
        {items.map((item, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1fr auto", gap: 10, marginBottom: 8 }}>
            <input value={item.desc} onChange={e => setItems(items.map((it, j) => j === i ? { ...it, desc: e.target.value } : it))} placeholder="Description" style={{ padding: "8px 12px", border: "1px solid " + ("var(--border-color)"), borderRadius: 8, fontSize: 13, background: "var(--bg-card)", color: "var(--text-primary)" }} />
            <input value={item.qty} onChange={e => setItems(items.map((it, j) => j === i ? { ...it, qty: e.target.value } : it))} placeholder="Qty" type="number" style={{ padding: "8px 12px", border: "1px solid " + ("var(--border-color)"), borderRadius: 8, fontSize: 13, background: "var(--bg-card)", color: "var(--text-primary)" }} />
            <input value={item.rate} onChange={e => setItems(items.map((it, j) => j === i ? { ...it, rate: e.target.value } : it))} placeholder="Rate" type="number" style={{ padding: "8px 12px", border: "1px solid " + ("var(--border-color)"), borderRadius: 8, fontSize: 13, background: "var(--bg-card)", color: "var(--text-primary)" }} />
<IconBtn icon={<HiXMark size={14} />} onClick={() => setItems(items.filter((_, j) => j !== i))} color="#dc2626" title="Remove" />
          </div>
        ))}
        <IconBtn icon={<HiPlus size={14} />} onClick={() => setItems([...items, { desc: "", qty: 1, rate: "" }])} color="#2563eb" title="Add Line" />

        <div style={{ marginTop: 16, fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>Total (incl. GST): {fmt(Math.round(total * 1.05))}</div>
        <div style={{ marginTop: 12 }}>
          <Input label="Notes" value={note} onChange={setNote} />
        </div>
        <div style={{ marginTop: 4, display: "flex", gap: 10 }}>
          <IconBtn icon={<HiEye size={14} />} onClick={genInvoice} color="#2563eb" title="Preview Invoice" />
          <IconBtn icon={<HiArrowDownTray size={14} />} onClick={downloadInvoice} color="#10b981" title="Download Invoice" />
        </div>
      </div>
    </div>
  );
}
