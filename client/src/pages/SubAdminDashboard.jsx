import { useState } from "react";
import { useData } from "../hooks/useData";
import { SectionHeader } from "../components/SectionHeader";
import { StatCard } from "../components/StatCard";
import { Table } from "../components/Table";
import { Badge } from "../components/Badge";
import { fmt, today } from "../utils/helpers";
import { FiDollarSign, FiUsers, FiFolder, FiFileText, FiBarChart2, FiBell, FiCheckCircle } from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";

export function SubAdminDashboard({ dark, toast }) {
  const { user } = useAuth();
  const { data: members } = useData('/members');
  const { data: groups } = useData('/groups');
  const { data: collections } = useData('/collections');
  const { data: auctions } = useData('/auctions');
  const { data: schemes } = useData('/schemes');
  const { data: kyc } = useData('/kyc');

  const userBranch = user?.branch || user?.assignedBranch || "Chennai HQ";

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyCollections = collections.filter(c => {
    const d = new Date(c.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const monthlyCollectionsAmount = monthlyCollections.reduce((sum, c) => sum + (c.amount || 0), 0);
  const pendingKyc = Array.isArray(kyc) ? kyc.filter(k => k.status === 'pending').length : 0;

  const chartData = [
    { l: "Jan", v: 180000 }, { l: "Feb", v: 220000 }, { l: "Mar", v: 195000 },
    { l: "Apr", v: 260000 }, { l: "May", v: 310000 }, { l: "Jun", v: 285000 },
  ];

  const memberById = (id) => members.find((m) => m.id === id);
  const groupById = (id) => groups.find((g) => g.id === id);

  return (
    <div>
      <SectionHeader title={`Sub Admin Dashboard  ${userBranch}`} subtitle={`Branch overview  ${today()}`} dark={dark} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16, marginBottom: 28 }}>
        <StatCard label="Monthly Collections" value={fmt(monthlyCollectionsAmount)} sub="Current month" color="#10b981" dark={dark} icon={<FiDollarSign size={22} />} />
        <StatCard label="Total Members" value={members.length} sub="Branch members" color="#d97706" dark={dark} icon={<FiUsers size={22} />} />
        <StatCard label="Active Groups" value={groups.filter(g => g.status === 'Active').length} sub="Running groups" color="#16a34a" dark={dark} icon={<FiFolder size={22} />} />
        <StatCard label="Pending KYC" value={pendingKyc} sub="Awaiting review" color={pendingKyc > 0 ? "#dc2626" : "#10b981"} dark={dark} icon={<FiCheckCircle size={22} />} />
        <StatCard label="Auctions" value={auctions.filter(a => a.status === 'Scheduled').length} sub="Scheduled" color="#f59e0b" dark={dark} icon={<FiBarChart2 size={22} />} />
      </div>

      <div className="d-grid d-grid-2-1" style={{ marginBottom: 20 }}>
        <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 4 }}>Branch Collections Trend</div>
          <div style={{ fontSize: 12, color: dark ? "rgba(255,255,255,.4)" : "#9ca3af", marginBottom: 16 }}>{userBranch}</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 140, padding: "0 4px" }}>
            {chartData.map((d, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ fontSize: 10, color: dark ? "rgba(255,255,255,.5)" : "#6b7280" }}>{(d.v / 1000).toFixed(0)}k</div>
                <div style={{ width: "100%", height: `${(d.v / 310000) * 100}px`, background: "linear-gradient(180deg, #8b5cf6, #6d28d9)", borderRadius: "4px 4px 0 0", minHeight: 20 }} />
                <div style={{ fontSize: 10, color: dark ? "rgba(255,255,255,.5)" : "#6b7280" }}>{d.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 12 }}>Quick Actions</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button onClick={() => window.location.href = "/members"} style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid #2563eb", background: "rgba(37,99,235,0.1)", color: "#2563eb", cursor: "pointer", fontSize: 12, fontWeight: 600, textAlign: "left" }}> Manage Members</button>
            <button onClick={() => window.location.href = "/collections"} style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid #059669", background: "rgba(5,150,105,0.1)", color: "#059669", cursor: "pointer", fontSize: 12, fontWeight: 600, textAlign: "left" }}> Record Collection</button>
            <button onClick={() => window.location.href = "/kyc-verification"} style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid #7c3aed", background: "rgba(124,58,237,0.1)", color: "#7c3aed", cursor: "pointer", fontSize: 12, fontWeight: 600, textAlign: "left" }}>{`Review KYC (${pendingKyc})`}</button>
            <button onClick={() => window.location.href = "/auctions"} style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid #d97706", background: "rgba(217,119,6,0.1)", color: "#d97706", cursor: "pointer", fontSize: 12, fontWeight: 600, textAlign: "left" }}> Manage Auctions</button>
            <button onClick={() => window.location.href = "/notifications"} style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid #0ea5e9", background: "rgba(14,165,233,0.1)", color: "#0ea5e9", cursor: "pointer", fontSize: 12, fontWeight: 600, textAlign: "left" }}> Send Notification</button>
          </div>
        </div>
      </div>

      <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 14 }}>Recent Collections  {userBranch}</div>
        <Table dark={dark} cols={["Receipt No", "Member", "Group", "Amount", "Mode", "Status"]}
          rows={collections.slice(0, 5).map(c => {
            const m = memberById(c.memberId); const g = groupById(c.groupId);
            return [c.receiptNo || " ", m?.name || c.memberId, g?.name || c.groupId, fmt(c.amount), c.mode,
              <Badge key={c.id} text={c.status} color={c.status === "Paid" ? "green" : "yellow"} />];
          })} />
      </div>
    </div>
  );
}
