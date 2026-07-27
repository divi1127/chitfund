import { useState } from "react";
import { useData } from "../hooks/useData";
import { SectionHeader } from "../components/SectionHeader";
import { StatCard } from "../components/StatCard";
import { Table } from "../components/Table";
import { Badge } from "../components/Badge";
import { fmt, today } from "../utils/helpers";
import { PaymentModal } from "../components/PaymentModal";
import { FiDollarSign, FiUsers, FiFileText, FiTrendingUp, FiCreditCard, FiCheckCircle } from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";

export function AgentDashboard({ dark, toast }) {
  const [payTarget, setPayTarget] = useState(null);
  const { user } = useAuth();
  const { data: members } = useData('/members');
  const { data: collections } = useData('/collections');
  const { data: commissions } = useData('/commissions');
  const { data: schemes } = useData('/schemes');
  const { data: groups } = useData('/groups');

  const agentId = user?.agentId || user?.userId;

  // Agent's own Member record (auto-created when group assigned)
  const mySelfRecord = Array.isArray(members) ? members.find(m => m.agentId === agentId) : null;
  const myOwnMemberId = mySelfRecord?.memberId;

  const myCustomers = Array.isArray(members) ? members.filter(m => m.agentId === agentId && m.memberId !== myOwnMemberId) : [];
  const myCustomerIds = myCustomers.map(m => m.memberId);

  const todayCollections = Array.isArray(collections) ? collections.filter(c => {
    const d = new Date(c.date);
    return d.toDateString() === new Date().toDateString() && myCustomerIds.includes(c.memberId);
  }) : [];
  const todayCollectionAmount = todayCollections.reduce((sum, c) => sum + (c.amount || 0), 0);

  const myCollections = Array.isArray(collections) ? collections.filter(c => myCustomerIds.includes(c.memberId)) : [];

  // Agent's own payments
  const myOwnPayments = myOwnMemberId ? Array.isArray(collections) ? collections.filter(c => c.memberId === myOwnMemberId) : [] : [];
  const myOwnTotalPaid = myOwnPayments.reduce((sum, c) => sum + (c.amount || 0), 0);

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
        <StatCard label="My Groups" value={Array.isArray(groups) ? groups.length : 0} sub="Assigned groups" color="#8b5cf6" dark={dark} icon={<FiFileText size={22} />} />
        <StatCard label="My Own Paid" value={fmt(myOwnTotalPaid)} sub="My installment payments" color="#10b981" dark={dark} icon={<FiCheckCircle size={22} />} />
        <StatCard label="Pending Approvals" value={fmt(pendingAmount)} sub={`${pendingApprovalsCount} pending collections`} color="#ef4444" dark={dark} icon={<FiCreditCard size={22} />} />
        <StatCard label="Today's Collections" value={fmt(todayCollectionAmount)} sub={`${todayCollections.length} collections`} color="#10b981" dark={dark} icon={<FiDollarSign size={22} />} />
        <StatCard label="Commission Earned" value={fmt(totalCommissionEarned)} sub={`${myCommissions.length} payments`} color="#f59e0b" dark={dark} icon={<FiTrendingUp size={22} />} />
      </div>

      <div className="d-grid d-grid-2" style={{ marginBottom: 20 }}>
        <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 14 }}>My Groups</div>
          {Array.isArray(groups) && groups.length > 0 ? (
            <Table dark={dark} cols={["Group", "Scheme", "Customers", "My Status", "Action"]}
              rows={groups.map(g => {
                const s = Array.isArray(schemes) ? schemes.find(sc => sc.id === g.schemeId) : null;
                const myMonthPaid = myOwnMemberId ? Array.isArray(collections) ? collections.some(c => c.memberId === myOwnMemberId && Number(c.installment) === (g.currentInstallment || 1) && c.status === 'Paid') : false : false;
                return [
                  g.name,
                  s?.name || "—",
                  `${g.members?.length || 0}/${g.maxMembers || s?.members || 10}`,
                  myMonthPaid ? <Badge key="paid" text="Paid" color="green" /> : <Badge key="due" text="Due" color="red" />,
                  <button key={g.id} onClick={() => window.location.href = "/members"} style={{ padding: "6px 12px", borderRadius: 6, border: "none", background: "#2563eb", color: "#fff", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>View</button>
                ];
              })} />
          ) : (
            <div style={{ textAlign: "center", padding: 30, color: dark ? "rgba(255,255,255,.4)" : "#9ca3af", fontSize: 13 }}>No groups assigned yet. Contact admin.</div>
          )}
        </div>
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

      {mySelfRecord && Array.isArray(groups) && groups.length > 0 && (
        <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 14 }}>My Installment Schedule</div>
          {groups.map(g => {
            const s = Array.isArray(schemes) ? schemes.find(sc => sc.id === g.schemeId) : null;
            if (!s) return null;
            const months = s.monthlyAmounts?.length ? s.monthlyAmounts : Array.from({ length: s.duration }, (_, i) => ({ month: i + 1, amount: 0, auctionAmount: 0 }));
            const paidMonths = myOwnMemberId ? Array.isArray(collections) ? collections.filter(c => c.memberId === myOwnMemberId && c.status === 'Paid').map(c => Number(c.installment)) : [] : [];
            const pendingMonths = myOwnMemberId ? Array.isArray(collections) ? collections.filter(c => c.memberId === myOwnMemberId && c.status === 'Pending').map(c => Number(c.installment)) : [] : [];
            return (
              <div key={g.id} style={{ marginBottom: 16, padding: 12, background: dark ? "rgba(255,255,255,.03)" : "#f8fafc", borderRadius: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: dark ? "#f3f4f6" : "#0f172a", marginBottom: 8 }}>{g.name} ({s.name})</div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: dark ? "rgba(255,255,255,.05)" : "#f1f5f9" }}>
                        {["Month", "Due", "Amount", "Status", ""].map(h => <th key={h} style={{ padding: "6px 10px", textAlign: "left", color: dark ? "rgba(255,255,255,.5)" : "#64748b", fontWeight: 600, borderBottom: "1px solid " + (dark ? "rgba(255,255,255,.1)" : "#e5e7eb") }}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {months.map(m => {
                        const paid = paidMonths.includes(m.month);
                        const pending = pendingMonths.includes(m.month);
                        const now = new Date();
                        const due = new Date(mySelfRecord.joined || now);
                        due.setMonth(due.getMonth() + m.month - 1);
                        due.setDate(5);
                        const overdue = !paid && !pending && due < now;
                        return (
                          <tr key={m.month} style={{ borderBottom: "1px solid " + (dark ? "rgba(255,255,255,.05)" : "#f1f5f9"), background: paid ? "#f0fdf4" : pending ? "#fffbeb" : overdue ? "#fef2f2" : "transparent" }}>
                            <td style={{ padding: "6px 10px", fontWeight: 700 }}>Month {m.month}</td>
                            <td style={{ padding: "6px 10px", color: overdue ? "#dc2626" : dark ? "rgba(255,255,255,.5)" : "#64748b" }}>{due.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                            <td style={{ padding: "6px 10px", fontWeight: 700 }}>{fmt(m.amount)}</td>
                            <td style={{ padding: "6px 10px" }}>
                              {paid ? <Badge text="Paid" color="green" /> : pending ? <Badge text="Pending" color="yellow" /> : overdue ? <Badge text="Overdue" color="red" /> : <Badge text="Due" color="orange" />}
                            </td>
                            <td style={{ padding: "6px 10px" }}>
                              {!paid && !pending && (
                                <button onClick={() => setPayTarget({ member: mySelfRecord, group: g, scheme: s, installment: m })}
                                  style={{ padding: "4px 12px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                                  Pay
                                </button>
                              )}
                              {pending && <span style={{ fontSize: 11, color: "#92400e" }}>Awaiting</span>}
                              {paid && <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 600 }}>✓</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

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

      {payTarget && (
        <PaymentModal
          member={payTarget.member}
          group={payTarget.group}
          scheme={payTarget.scheme}
          installment={payTarget.installment}
          onClose={() => setPayTarget(null)}
          onSuccess={() => { setPayTarget(null); window.location.reload(); }}
        />
      )}
    </div>
  );
}