// Accounting page component
import { useData } from "../hooks/useData";
import { SectionHeader } from "../components/SectionHeader";
import { Table } from "../components/Table";
import { fmt } from "../utils/helpers";
import { useAuth } from "../contexts/AuthContext";

export function Accounting({ dark }) {
  const { user } = useAuth();
  const { data: collections, loading } = useData('/collections');
  const { data: invoices, loading: invoicesLoading } = useData('/invoices');
  
  // Filter invoices for the current user (if user role)
  const userInvoices = user?.role === 'user' 
    ? invoices.filter(inv => inv.memberId === user.userId || inv.memberName === user.name)
    : invoices;

  const totalCollected = userInvoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);
  const cashCollections = userInvoices.filter(inv => inv.paymentMethod === "Cash").reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);
  const onlineCollections = userInvoices.filter(inv => inv.paymentMethod === "UPI" || inv.paymentMethod === "Bank").reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);

  if (loading || invoicesLoading) return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;

  return (
    <div>
      <SectionHeader title="Accounting" subtitle="Financial overview and transactions" dark={dark} />
      
      {user?.role === 'user' && (
        <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 8 }}>My Account</div>
          <div style={{ fontSize: 12, color: dark ? "rgba(255,255,255,.6)" : "#6b7280" }}>
            {user.name} ({user.userId})
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 24 }}>
        <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 12, color: dark ? "rgba(255,255,255,.5)" : "#6b7280", marginBottom: 8 }}>Total Payments</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: dark ? "#f3f4f6" : "#111" }}>{fmt(totalCollected)}</div>
        </div>
        <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 12, color: dark ? "rgba(255,255,255,.5)" : "#6b7280", marginBottom: 8 }}>Cash Payments</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: dark ? "#f3f4f6" : "#111" }}>{fmt(cashCollections)}</div>
        </div>
        <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 12, color: dark ? "rgba(255,255,255,.5)" : "#6b7280", marginBottom: 8 }}>Online Payments</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: dark ? "#f3f4f6" : "#111" }}>{fmt(onlineCollections)}</div>
        </div>
        <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 12, color: dark ? "rgba(255,255,255,.5)" : "#6b7280", marginBottom: 8 }}>Total Transactions</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: dark ? "#f3f4f6" : "#111" }}>{userInvoices.length}</div>
        </div>
      </div>

      <Table dark={dark} cols={["Invoice No", "Date", "Payment Mode", "Amount", "Status"]}
        rows={userInvoices.slice(0, 10).map(inv => [
          inv.invoiceNumber,
          new Date(inv.date).toLocaleDateString(),
          inv.paymentMethod,
          fmt(inv.amountPaid),
          inv.status
        ])} />
    </div>
  );
}
