import { useState } from "react";
import { useData } from "../hooks/useData";
import { SectionHeader } from "../components/SectionHeader";
import { Table } from "../components/Table";
import { Badge } from "../components/Badge";
import { fmt, today } from "../utils/helpers";
import { useAuth } from "../contexts/AuthContext";

export function Receipts({ dark, toast }) {
  const { user } = useAuth();
  const { data: collections, loading, error, refetch } = useData('/collections');
  const [search, setSearch] = useState("");

  const customerId = user?.memberId || user?.userId;
  const userCollections = user?.role === 'customer'
    ? (Array.isArray(collections) ? collections.filter(c => c.memberId === customerId) : [])
    : (Array.isArray(collections) ? collections : []);

  const filtered = userCollections.filter(c =>
    !search || c.receiptNo?.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));

  return (
    <div>
      <SectionHeader title="Receipts" subtitle={`View payment receipts ${today()}`} dark={dark} />
      <div style={{ marginBottom: 16, display: "flex", gap: 12, alignItems: "center" }}>
        <input type="text" placeholder="Search by receipt no..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, maxWidth: 360, padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13, outline: "none" }} />
        <span style={{ fontSize: 12, color: dark ? "rgba(255,255,255,.5)" : "#6b7280" }}>{filtered.length} receipts</span>
      </div>
      <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
        <Table dark={dark} cols={["Receipt No", "Date", "Customer", "Amount", "Mode", "Installment", "Status"]}
          rows={filtered.map(c => [
            c.receiptNo || " ", new Date(c.date).toLocaleDateString(),
            c.memberId, fmt(c.amount), c.mode, `Month ${c.installment}`,
            <Badge key={c._id || c.id} text={c.status} color={c.status === 'Paid' ? 'green' : c.status === 'Partially Paid' ? 'yellow' : 'red'} />
          ])} />
      </div>
    </div>
  );
}