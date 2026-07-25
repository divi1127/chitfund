import { useState } from "react";
import { useData } from "../hooks/useData";
import { SectionHeader } from "../components/SectionHeader";
import { Table } from "../components/Table";
import { Badge } from "../components/Badge";
import { fmt, today } from "../utils/helpers";
import { useAuth } from "../contexts/AuthContext";

export function Invoices({ dark, toast }) {
  const { user } = useAuth();
  const { data: invoices, loading, error, refetch } = useData('/invoices');
  const [search, setSearch] = useState("");

  const customerId = user?.memberId || user?.userId;
  const userInvoices = user?.role === 'customer'
    ? (Array.isArray(invoices) ? invoices.filter(inv => inv.memberId === customerId) : [])
    : (Array.isArray(invoices) ? invoices : []);

  const filtered = userInvoices.filter(inv =>
    !search || inv.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
    inv.memberName?.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));

  return (
    <div>
      <SectionHeader title="Invoices" subtitle={`Manage invoices ${today()}`} dark={dark} />
      <div style={{ marginBottom: 16, display: "flex", gap: 12, alignItems: "center" }}>
        <input type="text" placeholder="Search by invoice no. or name..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, maxWidth: 360, padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13, outline: "none" }} />
        <span style={{ fontSize: 12, color: dark ? "rgba(255,255,255,.5)" : "#6b7280" }}>{filtered.length} invoices</span>
      </div>
      <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
        <Table dark={dark} cols={["Invoice No", "Date", "Customer", "Group", "Amount", "Paid", "Balance", "Status"]}
          rows={filtered.map(inv => [
            inv.invoiceNumber, new Date(inv.date).toLocaleDateString(),
            inv.memberName, inv.chitGroup, fmt(inv.totalPayable || 0),
            fmt(inv.amountPaid || 0), fmt(inv.balance || 0),
            <Badge key={inv._id} text={inv.status} color={inv.status === 'Paid' ? 'green' : inv.status === 'Partially Paid' ? 'yellow' : inv.status === 'Due' ? 'red' : 'orange'} />
          ])} />
      </div>
    </div>
  );
}