import { useState } from "react";
import { useData } from "../hooks/useData";
import { SectionHeader } from "../components/SectionHeader";
import { StatCard } from "../components/StatCard";
import { Table } from "../components/Table";
import { Badge } from "../components/Badge";
import { fmt, today } from "../utils/helpers";
import { FiDollarSign, FiUsers, FiFolder, FiFileText, FiBell, FiCheckCircle, FiAlertCircle, FiTrendingUp } from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";

export function AdminDashboard({ dark, toast }) {
  const { user } = useAuth();
  const { data: members } = useData('/members');
  const { data: groups } = useData('/groups');
  const { data: collections } = useData('/collections');
  const { data: auctions } = useData('/auctions');
  const { data: schemes } = useData('/schemes');
  const { data: agents } = useData('/agents');

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const todayCollections = collections.filter(c => {
    const d = new Date(c.date);
    return d.toDateString() === new Date().toDateString();
  });
  const todayCollectionAmount = todayCollections.reduce((sum, c) => sum + (c.amount || 0), 0);

  const monthlyCollections = collections.filter(c => {
    const d = new Date(c.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const monthlyCollectionsAmount = monthlyCollections.reduce((sum, c) => sum + (c.amount || 0), 0);

  const pendingCollections = collections.filter(c => c.status === 'Pending' || c.status === 'Partially Paid');
  const pendingAmount = pendingCollections.reduce((sum, c) => sum + (c.pendingBalance || c.amount || 0), 0);

  const activeGroups = groups.filter(g => g.status === 'Active').length;
  const activeSchemes = schemes.filter(s => s.status === 'Active').length;

  const todayAuction = auctions.filter(a => {
    const d = new Date(a.date);
    return d.toDateString() === new Date().toDateString();
  });

  const groupById = (id) => groups.find((g) => g.id === id);

  return (
    <div>
      <SectionHeader title="Admin Dashboard" subtitle={`Branch overview ${today()}`} dark={dark} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16, marginBottom: 28 }}>
        <StatCard label="Today's Collection" value={fmt(todayCollectionAmount)} sub="Today" color="#10b981" dark={dark} icon={<FiDollarSign size={22} />} />
        <StatCard label="Pending Collection" value={fmt(pendingAmount)} sub={`${pendingCollections.length} pending`} color="#ef4444" dark={dark} icon={<FiAlertCircle size={22} />} />
        <StatCard label="Total Agents" value={agents?.length || 0} sub="Under this branch" color="#8b5cf6" dark={dark} icon={<FiUsers size={22} />} />
        <StatCard label="Total Customers" value={members?.length || 0} sub="Registered members" color="#d97706" dark={dark} icon={<FiUsers size={22} />} />
        <StatCard label="Running Schemes" value={activeSchemes} sub="Active schemes" color="#16a34a" dark={dark} icon={<FiFileText size={22} />} />
        <StatCard label="Today's Auction" value={todayAuction.length} sub={todayAuction.length > 0 ? "Scheduled today" : "No auction today"} color="#f59e0b" dark={dark} icon={<FiBell size={22} />} />
      </div>

      <div className="d-grid d-grid-2" style={{ marginBottom: 20 }}>
        <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 14 }}>Recent Collections</div>
          <Table dark={dark} cols={["Receipt", "Customer", "Group", "Amount", "Status"]}
            rows={collections.slice(0, 5).map(c => {
              const m = members.find(mem => mem.memberId === c.memberId);
              const g = groupById(c.groupId);
              return [c.receiptNo || " ", m?.name || c.memberId, g?.name || c.groupId, fmt(c.amount),
                <Badge key={c.id} text={c.status} color={c.status === "Paid" ? "green" : c.status === "Partially Paid" ? "yellow" : "red"} />];
            })} />
        </div>
        <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 14 }}>Quick Actions</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button onClick={() => window.location.href = "/agents"} style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid #8b5cf6", background: "rgba(139,92,246,0.1)", color: "#8b5cf6", cursor: "pointer", fontSize: 12, fontWeight: 600, textAlign: "left" }}> Manage Agents</button>
            <button onClick={() => window.location.href = "/collections"} style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid #10b981", background: "rgba(16,185,129,0.1)", color: "#10b981", cursor: "pointer", fontSize: 12, fontWeight: 600, textAlign: "left" }}> Record Collection</button>
            <button onClick={() => window.location.href = "/auctions"} style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid #f59e0b", background: "rgba(245,158,11,0.1)", color: "#f59e0b", cursor: "pointer", fontSize: 12, fontWeight: 600, textAlign: "left" }}> Manage Auctions</button>
            <button onClick={() => window.location.href = "/members"} style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid #2563eb", background: "rgba(37,99,235,0.1)", color: "#2563eb", cursor: "pointer", fontSize: 12, fontWeight: 600, textAlign: "left" }}> Create Customer</button>
            <button onClick={() => window.location.href = "/reports"} style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid #dc2626", background: "rgba(220,38,38,0.1)", color: "#dc2626", cursor: "pointer", fontSize: 12, fontWeight: 600, textAlign: "left" }}> View Reports</button>
          </div>
        </div>
      </div>

      <div className="d-grid d-grid-2" style={{ marginBottom: 20 }}>
        <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 14 }}>Monthly Collections Trend</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120, padding: "0 4px" }}>
            {[{ l: "This Month", v: monthlyCollectionsAmount }, { l: "Last Month", v: 0 }].map((d, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ fontSize: 10, color: dark ? "rgba(255,255,255,.5)" : "#6b7280" }}>{fmt(d.v)}</div>
                <div style={{ width: "100%", height: `${Math.min((d.v / 500000) * 100, 100)}px`, background: "linear-gradient(180deg, #8b5cf6, #6d28d9)", borderRadius: "4px 4px 0 0", minHeight: 10 }} />
                <div style={{ fontSize: 10, color: dark ? "rgba(255,255,255,.5)" : "#6b7280" }}>{d.l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 14 }}>Agents Overview</div>
          {agents && agents.length > 0 ? (
            <Table dark={dark} cols={["ID", "Name", "Customers", "Status"]}
              rows={agents.slice(0, 5).map(a => [a.agentId, a.name, a.customers?.length || 0,
                <Badge key={a.agentId} text={a.status} color={a.status === 'Active' ? 'green' : 'red'} />])} />
          ) : (
            <div style={{ textAlign: "center", padding: 30, color: dark ? "rgba(255,255,255,.4)" : "#9ca3af", fontSize: 13 }}>No agents yet</div>
          )}
        </div>
      </div>
    </div>
  );
}