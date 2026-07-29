import { useState } from "react";
import { useData } from "../hooks/useData";
import { SectionHeader } from "../components/SectionHeader";
import { StatCard } from "../components/StatCard";
import { Table } from "../components/Table";
import { Badge } from "../components/Badge";
import { fmt, today } from "../utils/helpers";
import { FiDollarSign, FiUsers, FiFolder, FiFileText, FiBarChart2, FiTag, FiTrendingUp, FiCheckCircle, FiAlertCircle, FiHome, FiUserCheck, FiBriefcase } from "react-icons/fi";

export function SuperAdminDashboard({ dark, toast }) {
  const { data: members } = useData('/members');
  const { data: groups } = useData('/groups');
  const { data: collections } = useData('/collections');
  const { data: auctions } = useData('/auctions');
  const { data: schemes } = useData('/schemes');
  const { data: invoices } = useData('/invoices');
  const { data: enquiries } = useData('/enquiries');
  const { data: kyc } = useData('/kyc');
  const { data: auditStats } = useData('/audit-logs/stats');
  const { data: branches } = useData('/branches');
  const { data: agents } = useData('/agents');
  const { data: users } = useData('/users');

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyCollections = collections.filter(c => {
    const d = new Date(c.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const monthlyCollectionsAmount = monthlyCollections.reduce((sum, c) => sum + (c.amount || 0), 0);
  const totalCollected = collections.reduce((sum, c) => sum + (c.amount || 0), 0);
  const pendingCollections = collections.filter(c => c.status === 'Pending' || c.status === 'Partially Paid');
  const pendingAmount = pendingCollections.reduce((sum, c) => sum + (c.pendingBalance || c.amount || 0), 0);
  const pendingKyc = Array.isArray(kyc) ? kyc.filter(k => k.status === 'pending').length : 0;
  const totalKyc = Array.isArray(kyc) ? kyc.length : 0;
  const activeMembers = members.filter(m => m.status === 'Active').length;
  const activeGroups = groups.filter(g => g.status === 'Active').length;
  const activeSchemes = schemes.filter(s => s.status === 'Active').length;
  const completedSchemes = schemes.filter(s => s.status === 'Closed').length;
  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);
  const totalBranches = branches?.length || 0;
  const totalAdmins = users?.filter(u => u.role === 'admin').length || 0;

  const chartYear = 2026;
  const monthlyMap = {};
  collections.forEach(c => {
    const d = new Date(c.date);
    if (d.getFullYear() !== chartYear) return;
    const key = d.getMonth();
    if (!monthlyMap[key]) monthlyMap[key] = 0;
    monthlyMap[key] += c.amount || 0;
  });
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const chartData = monthNames.map((l, i) => ({ l, v: monthlyMap[i] || 0 }));

  const memberById = (id) => members.find((m) => m.memberId === id || m.id === id);
  const groupById = (id) => groups.find((g) => g.id === id);
  const schemeById = (id) => schemes.find((s) => s.id === id);

  return (
    <div>
      <SectionHeader title="Super Admin Dashboard" subtitle={`Full system overview  ${today()}`} dark={dark} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16, marginBottom: 28 }}>
        <StatCard label="Total Branches" value={totalBranches} sub="Registered branches" color="#2563eb" dark={dark} icon={<FiHome size={22} />} />
        <StatCard label="Total Admins" value={totalAdmins} sub="Branch admins" color="#7c3aed" dark={dark} icon={<FiUserCheck size={22} />} />
        <StatCard label="Total Agents" value={agents?.length || 0} sub="Field agents" color="#f59e0b" dark={dark} icon={<FiBriefcase size={22} />} />
        <StatCard label="Total Customers" value={members.length} sub="Registered members" color="#d97706" dark={dark} icon={<FiUsers size={22} />} />
        <StatCard label="Running Schemes" value={activeSchemes} sub={`${schemes.length} total schemes`} color="#10b981" dark={dark} icon={<FiFileText size={22} />} />
        <StatCard label="Completed Schemes" value={completedSchemes} sub="Closed schemes" color="#16a34a" dark={dark} icon={<FiCheckCircle size={22} />} />
        <StatCard label="Monthly Collection" value={fmt(monthlyCollectionsAmount)} sub="Current month" color="#3b82f6" dark={dark} icon={<FiDollarSign size={22} />} />
        <StatCard label="Pending Collection" value={fmt(pendingAmount)} sub={`${pendingCollections.length} pending`} color="#ef4444" dark={dark} icon={<FiAlertCircle size={22} />} />
        <StatCard label="Total Revenue" value={fmt(totalRevenue)} sub="All time revenue" color="#059669" dark={dark} icon={<FiTrendingUp size={22} />} />
      </div>

      <div className="d-grid d-grid-2-1" style={{ marginBottom: 20 }}>
        <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 4 }}>Monthly Collections Trend</div>
          <div style={{ fontSize: 12, color: dark ? "rgba(255,255,255,.4)" : "#9ca3af", marginBottom: 16 }}>Jan - Dec 2026</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 160, padding: "0 4px" }}>
            {chartData.map((d, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ fontSize: 10, color: dark ? "rgba(255,255,255,.5)" : "#6b7280" }}>{(d.v / 1000).toFixed(0)}k</div>
                <div style={{ width: "100%", height: `${(d.v / 310000) * 120}px`, background: "linear-gradient(180deg, #3b82f6, #1d4ed8)", borderRadius: "4px 4px 0 0", minHeight: 20, transition: "height 0.3s" }} />
                <div style={{ fontSize: 10, color: dark ? "rgba(255,255,255,.5)" : "#6b7280" }}>{d.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 12 }}>Quick Actions</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button onClick={() => window.location.href = "/user-management"} style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid #2563eb", background: "rgba(37,99,235,0.1)", color: "#2563eb", cursor: "pointer", fontSize: 12, fontWeight: 600, textAlign: "left" }}> Manage Users</button>
            <button onClick={() => window.location.href = "/kyc-verification"} style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid #7c3aed", background: "rgba(124,58,237,0.1)", color: "#7c3aed", cursor: "pointer", fontSize: 12, fontWeight: 600, textAlign: "left" }}>{`Review KYC (${pendingKyc} pending)`}</button>
            <button onClick={() => window.location.href = "/audit-logs"} style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid #059669", background: "rgba(5,150,105,0.1)", color: "#059669", cursor: "pointer", fontSize: 12, fontWeight: 600, textAlign: "left" }}> View Audit Logs</button>
            <button onClick={() => window.location.href = "/settings"} style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid #d97706", background: "rgba(217,119,6,0.1)", color: "#d97706", cursor: "pointer", fontSize: 12, fontWeight: 600, textAlign: "left" }}> Platform Settings</button>
            <button onClick={() => window.location.href = "/reports"} style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid #dc2626", background: "rgba(220,38,38,0.1)", color: "#dc2626", cursor: "pointer", fontSize: 12, fontWeight: 600, textAlign: "left" }}> Generate Reports</button>
          </div>
        </div>
      </div>

      {/* ── Customer Approval Flow ── */}
      <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 20, marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 16 }}>
          Customer Approval Flow
          <span style={{ fontSize: 11, fontWeight: 400, color: dark ? "rgba(255,255,255,.4)" : "#9ca3af", marginLeft: 8 }}>End-to-end process from hierarchy to activation</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          {/* Hierarchy */}
          <div style={{ flex: "1 1 200px", minWidth: 160 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Hierarchy</div>
            {[
              { label: "Super Admin", color: "#2563eb" },
              { label: "Admin", color: "#7c3aed" },
              { label: "Agent", color: "#f59e0b" },
            ].map((r, i, arr) => (
              <div key={r.label}>
                <div style={{ padding: "10px 14px", borderRadius: 8, background: dark ? "rgba(255,255,255,.06)" : "#f8fafc", border: `2px solid ${r.color}22`, borderLeft: `4px solid ${r.color}`, fontWeight: 600, fontSize: 13, color: dark ? "#f3f4f6" : "#1e293b" }}>
                  {r.label}
                </div>
                {i < arr.length - 1 && (
                  <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 14, lineHeight: "20px" }}>▼</div>
                )}
              </div>
            ))}
          </div>

          {/* Agent Steps */}
          <div style={{ flex: "2 1 280px", minWidth: 200 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Agent Process</div>
            {[
              { label: "Create Customer", desc: "Enter customer details", color: "#2563eb" },
              { label: "Upload KYC", desc: "Aadhaar, PAN, Photo, etc.", color: "#7c3aed" },
              { label: "Select Chit Scheme", desc: "Choose a chit plan", color: "#f59e0b" },
              { label: "Submit for Approval", desc: "Send to Super Admin", color: "#dc2626" },
            ].map((s, i, arr) => (
              <div key={s.label}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, background: dark ? "rgba(255,255,255,.04)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.08)" : "1px solid #e2e8f0" }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: s.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: dark ? "#f3f4f6" : "#1e293b" }}>{s.label}</div>
                    <div style={{ fontSize: 11, color: dark ? "rgba(255,255,255,.4)" : "#94a3b8" }}>{s.desc}</div>
                  </div>
                </div>
                {i < arr.length - 1 && (
                  <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 12, lineHeight: "18px" }}>▼</div>
                )}
              </div>
            ))}
            <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 12, lineHeight: "18px" }}>▼</div>
            <div style={{ padding: "8px 12px", borderRadius: 8, background: "#fef3c7", border: "1px solid #f59e0b", textAlign: "center", fontWeight: 600, fontSize: 12, color: "#92400e" }}>
              ⏳ Pending Approval
            </div>
          </div>

          {/* Super Admin Review */}
          <div style={{ flex: "1 1 200px", minWidth: 160 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Super Admin Review</div>
            <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 14, lineHeight: "20px" }}>▼</div>
            <div style={{ padding: "10px 14px", borderRadius: 8, background: dark ? "rgba(255,255,255,.06)" : "#f0fdf4", border: "2px solid #22c55e", fontWeight: 600, fontSize: 13, color: dark ? "#bbf7d0" : "#166534", marginBottom: 4 }}>
              ✅ Approve
            </div>
            <div style={{ padding: "10px 14px", borderRadius: 8, background: dark ? "rgba(255,255,255,.06)" : "#fef2f2", border: "2px solid #ef4444", fontWeight: 600, fontSize: 13, color: dark ? "#fca5a5" : "#991b1b", marginBottom: 4 }}>
              ❌ Reject
            </div>
            <div style={{ padding: "10px 14px", borderRadius: 8, background: dark ? "rgba(255,255,255,.06)" : "#fffbeb", border: "2px solid #f59e0b", fontWeight: 600, fontSize: 13, color: dark ? "#fde68a" : "#92400e" }}>
              ✏️ Request Changes
            </div>
            <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 14, lineHeight: "20px" }}>▼</div>
            <div style={{ padding: "10px 14px", borderRadius: 8, background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "#fff", fontWeight: 700, fontSize: 13, textAlign: "center" }}>
              Customer becomes Active
            </div>
          </div>
        </div>
      </div>

      <div className="d-grid d-grid-2" style={{ marginBottom: 20 }}>
        <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 14 }}>Recent Collections</div>
          <Table dark={dark} cols={["Receipt", "Member", "Group", "Amount", "Mode", "Status"]}
            rows={collections.slice(0, 5).map(c => {
              const m = memberById(c.memberId); const g = groupById(c.groupId);
              return [c.receiptNo || " ", m?.name || c.memberId, g?.name || c.groupId, fmt(c.amount), c.mode,
                <Badge key={c.id} text={c.status} color={c.status === "Paid" ? "green" : "yellow"} />];
            })} />
        </div>
        <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 14 }}>Upcoming Auctions</div>
          {auctions.filter(a => a.status === "Scheduled").length === 0 ? (
            <div style={{ textAlign: "center", padding: 30, color: dark ? "rgba(255,255,255,.4)" : "#9ca3af", fontSize: 13 }}>No scheduled auctions</div>
          ) : auctions.filter(a => a.status === "Scheduled").map(a => {
            const g = groupById(a.groupId);
            const s = g ? schemeById(g.schemeId) : null;
            return (
              <div key={a.id} style={{ padding: "10px 0", borderBottom: dark ? "1px solid rgba(255,255,255,.07)" : "1px solid #f3f4f6" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: dark ? "#f3f4f6" : "#111" }}>{g?.name}</div>
                <div style={{ fontSize: 11, color: dark ? "rgba(255,255,255,.4)" : "#9ca3af", marginBottom: 4 }}>{a.date?.split('T')[0]}  {s?.name}</div>
                <Badge text="Scheduled" color="blue" />
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 14 }}>Platform Analytics</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 16 }}>
          <div style={{ padding: 16, background: dark ? "rgba(255,255,255,.03)" : "#f9fafb", borderRadius: 8, textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#10b981" }}>{activeMembers}</div>
            <div style={{ fontSize: 11, color: dark ? "rgba(255,255,255,.5)" : "#6b7280", marginTop: 4 }}>Active Members</div>
          </div>
          <div style={{ padding: 16, background: dark ? "rgba(255,255,255,.03)" : "#f9fafb", borderRadius: 8, textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#3b82f6" }}>{activeGroups}</div>
            <div style={{ fontSize: 11, color: dark ? "rgba(255,255,255,.5)" : "#6b7280", marginTop: 4 }}>Active Groups</div>
          </div>
          <div style={{ padding: 16, background: dark ? "rgba(255,255,255,.03)" : "#f9fafb", borderRadius: 8, textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#8b5cf6" }}>{invoices.filter(i => i.status === 'Due').length}</div>
            <div style={{ fontSize: 11, color: dark ? "rgba(255,255,255,.5)" : "#6b7280", marginTop: 4 }}>Due Payments</div>
          </div>
          <div style={{ padding: 16, background: dark ? "rgba(255,255,255,.03)" : "#f9fafb", borderRadius: 8, textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#f59e0b" }}>{pendingKyc}</div>
            <div style={{ fontSize: 11, color: dark ? "rgba(255,255,255,.5)" : "#6b7280", marginTop: 4 }}>Pending KYC</div>
          </div>
          <div style={{ padding: 16, background: dark ? "rgba(255,255,255,.03)" : "#f9fafb", borderRadius: 8, textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#ef4444" }}>{enquiries?.filter(e => e.status === 'New').length || 0}</div>
            <div style={{ fontSize: 11, color: dark ? "rgba(255,255,255,.5)" : "#6b7280", marginTop: 4 }}>New Enquiries</div>
          </div>
          <div style={{ padding: 16, background: dark ? "rgba(255,255,255,.03)" : "#f9fafb", borderRadius: 8, textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#06b6d4" }}>{auditStats?.totalLogs || 0}</div>
            <div style={{ fontSize: 11, color: dark ? "rgba(255,255,255,.5)" : "#6b7280", marginTop: 4 }}>Audit Events</div>
          </div>
        </div>
      </div>
    </div>
  );
}
