import { useData } from "../hooks/useData";
import { SectionHeader } from "../components/SectionHeader";
import { StatCard } from "../components/StatCard";
import { Table } from "../components/Table";
import { Badge } from "../components/Badge";
import { fmt, today } from "../utils/helpers";
import { FiDollarSign, FiUsers, FiFileText, FiTrendingUp, FiCreditCard, FiCheckCircle } from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";

export function AgentDashboard({ dark, toast }) {
  const { user } = useAuth();
  const { data: members } = useData('/members');
  const { data: collections } = useData('/collections');
  const { data: commissions } = useData('/commissions');
  const { data: schemes } = useData('/schemes');

  const agentId = user?.agentId || user?.userId;

  const myCustomers = Array.isArray(members) ? members.filter(m => m.agentId === agentId) : [];
  const myCustomerIds = myCustomers.map(m => m.memberId);

  const todayCollections = Array.isArray(collections) ? collections.filter(c => {
    const d = new Date(c.date);
    return d.toDateString() === new Date().toDateString() && myCustomerIds.includes(c.memberId);
  }) : [];
  const todayCollectionAmount = todayCollections.reduce((sum, c) => sum + (c.amount || 0), 0);

  const myCollections = Array.isArray(collections) ? collections.filter(c => myCustomerIds.includes(c.memberId)) : [];

  const pendingApprovalsCount = myCollections.reduce((count, c) => {
     if (c.status === 'Pending' && c.mode === 'Cash' && (!c.partialPayments || c.partialPayments.length === 0)) return count + 1;
     return count + (c.partialPayments?.filter(p => p.status === 'Pending').length || 0);
  }, 0);
  
  const pendingAmount = myCollections.reduce((sum, c) => {
      let pendingSum = 0;
      if (c.status === 'Pending' && c.mode === 'Cash' && (!c.partialPayments || c.partialPayments.length === 0)) pendingSum += c.amount || 0;
      pendingSum += (c.partialPayments || []).filter(p => p.status === 'Pending').reduce((pSum, p) => pSum + (p.amount || 0), 0);
      return sum + pendingSum;
  }, 0);

  const myCommissions = Array.isArray(commissions) ? commissions.filter(c => c.agentId === agentId) : [];
  const totalCommissionEarned = myCommissions.reduce((sum, c) => sum + c.commissionAmount, 0);

  const activeSchemes = Array.isArray(schemes) ? schemes.filter(s => s.status === 'Active').length : 0;

  return (
    <div>
      <SectionHeader title="Agent Dashboard" subtitle={`Welcome, ${user?.name || 'Agent'} ${today()}`} dark={dark} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16, marginBottom: 28 }}>
        <StatCard label="My Customers" value={myCustomers.length} sub="Registered customers" color="#2563eb" dark={dark} icon={<FiUsers size={22} />} />
        <StatCard label="Pending Approvals" value={fmt(pendingAmount)} sub={`${pendingApprovalsCount} pending collections`} color="#ef4444" dark={dark} icon={<FiCreditCard size={22} />} />
        <StatCard label="Today's Collections" value={fmt(todayCollectionAmount)} sub={`${todayCollections.length} collections`} color="#10b981" dark={dark} icon={<FiDollarSign size={22} />} />
        <StatCard label="Commission Earned" value={fmt(totalCommissionEarned)} sub={`${myCommissions.length} payments`} color="#f59e0b" dark={dark} icon={<FiTrendingUp size={22} />} />
        <StatCard label="Running Schemes" value={activeSchemes} sub="Active schemes" color="#8b5cf6" dark={dark} icon={<FiFileText size={22} />} />
      </div>

      <div className="d-grid d-grid-2" style={{ marginBottom: 20 }}>
        <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 14 }}>My Customers</div>
          {myCustomers.length > 0 ? (
            <Table dark={dark} cols={["ID", "Name", "Phone", "Groups", "Status"]}
              rows={myCustomers.slice(0, 5).map(m => [m.memberId, m.name, m.phone, m.groups?.length || 0,
                <Badge key={m.memberId} text={m.status} color={m.status === 'Active' ? 'green' : 'red'} />])} />
          ) : (
            <div style={{ textAlign: "center", padding: 30, color: dark ? "rgba(255,255,255,.4)" : "#9ca3af", fontSize: 13 }}>No customers yet. Register your first customer!</div>
          )}
          <button onClick={() => window.location.href = "/members"} style={{ marginTop: 12, padding: "8px 16px", borderRadius: 8, border: "1px solid #2563eb", background: "rgba(37,99,235,0.1)", color: "#2563eb", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Register New Customer</button>
        </div>
        <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 14 }}>Quick Actions</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button onClick={() => window.location.href = "/members"} style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid #2563eb", background: "rgba(37,99,235,0.1)", color: "#2563eb", cursor: "pointer", fontSize: 12, fontWeight: 600, textAlign: "left" }}> Register Customer</button>
            <button onClick={() => window.location.href = "/collections"} style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid #10b981", background: "rgba(16,185,129,0.1)", color: "#10b981", cursor: "pointer", fontSize: 12, fontWeight: 600, textAlign: "left" }}> Collect Installment</button>
            <button onClick={() => window.location.href = "/collections"} style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid #f59e0b", background: "rgba(245,158,11,0.1)", color: "#f59e0b", cursor: "pointer", fontSize: 12, fontWeight: 600, textAlign: "left" }}> View Collection History</button>
            <button onClick={() => window.location.href = "/commissions"} style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid #8b5cf6", background: "rgba(139,92,246,0.1)", color: "#8b5cf6", cursor: "pointer", fontSize: 12, fontWeight: 600, textAlign: "left" }}> View Commission</button>
          </div>
        </div>
      </div>

      <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 14 }}>Commission Summary</div>
        {myCommissions.length > 0 ? (
          <Table dark={dark} cols={["Month", "Year", "Total Collection", "Rate", "Commission", "Status"]}
            rows={myCommissions.slice(0, 5).map(c => [
              `Month ${c.month}`, c.year, fmt(c.totalCollection), `${c.commissionRate}%`, fmt(c.commissionAmount),
              <Badge key={c._id} text={c.status} color={c.status === 'Paid' ? 'green' : c.status === 'Calculated' ? 'blue' : 'yellow'} />
            ])} />
        ) : (
          <div style={{ textAlign: "center", padding: 20, color: dark ? "rgba(255,255,255,.4)" : "#9ca3af", fontSize: 13 }}>No commission data yet.</div>
        )}
      </div>
    </div>
  );
}