import { useState, useEffect } from "react";
import { SectionHeader } from "../components/SectionHeader";
import { Table } from "../components/Table";
import { Badge } from "../components/Badge";
import { Input } from "../components/Input";
import { useAuth } from "../contexts/AuthContext";

export function AuditLogs({ dark, toast }) {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState({ action: "", resource: "", userId: "" });
  const [stats, setStats] = useState(null);

  if (user?.role !== "super_admin") {
    return <div style={{ textAlign: "center", padding: 60, color: "#dc2626" }}>Access denied. Only Super Admins can view audit logs.</div>;
  }

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 30 });
      if (filter.action) params.append("action", filter.action);
      if (filter.resource) params.append("resource", filter.resource);
      if (filter.userId) params.append("userId", filter.userId);
      const response = await fetch(`/api/audit-logs?${params}`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/audit-logs/stats', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchLogs(); }, [page]);
  useEffect(() => { fetchStats(); }, []);

  const actionColors = {
    LOGIN: "blue", LOGOUT: "gray", USER_CREATE: "green", USER_UPDATE: "yellow",
    USER_DELETE: "red", KYC_SUBMIT: "purple", KYC_APPROVE: "green", KYC_REJECT: "red",
    NOTIFICATION_SEND: "blue", SETTINGS_UPDATE: "orange", MEMBER_CREATE: "green",
    MEMBER_UPDATE: "yellow", MEMBER_DELETE: "red", PAYMENT_RECORD: "green",
  };

  return (
    <div>
      <SectionHeader title="Audit Logs" subtitle="Complete system activity tracking" dark={dark} />

      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 16, marginBottom: 24 }}>
          <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#3b82f6" }}>{stats.totalLogs}</div>
            <div style={{ fontSize: 11, color: dark ? "rgba(255,255,255,.5)" : "#6b7280" }}>Total Events</div>
          </div>
          <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#10b981" }}>{stats.uniqueUsers}</div>
            <div style={{ fontSize: 11, color: dark ? "rgba(255,255,255,.5)" : "#6b7280" }}>Unique Users</div>
          </div>
          <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 4 }}>Top Actions</div>
            <div style={{ fontSize: 11, color: dark ? "rgba(255,255,255,.5)" : "#6b7280" }}>
              {stats.topActions?.slice(0, 3).map(a => `${a._id} (${a.count})`).join(', ')}
            </div>
          </div>
        </div>
      )}

      <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 12 }}>Filter Logs</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 200px" }}>
            <Input label="Action" value={filter.action} onChange={v => setFilter({ ...filter, action: v })} dark={dark} placeholder="e.g. LOGIN, USER_CREATE" />
          </div>
          <div style={{ flex: "1 1 200px" }}>
            <Input label="Resource" value={filter.resource} onChange={v => setFilter({ ...filter, resource: v })} dark={dark} placeholder="e.g. User, KYC, Auth" />
          </div>
          <div style={{ flex: "1 1 200px" }}>
            <Input label="User ID" value={filter.userId} onChange={v => setFilter({ ...filter, userId: v })} dark={dark} placeholder="e.g. ADMIN001" />
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <button onClick={() => { setPage(1); fetchLogs(); }} style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: "#2563eb", color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>Search</button>
            <button onClick={() => { setFilter({ action: "", resource: "", userId: "" }); setPage(1); }} style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid #d1d5db", background: "transparent", color: dark ? "#f3f4f6" : "#111", cursor: "pointer", fontSize: 13 }}>Clear</button>
          </div>
        </div>
      </div>

      <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 24 }}>
        <Table dark={dark} cols={["Timestamp", "User", "Role", "Action", "Resource", "Status", "Details"]}
          rows={logs.map((log, i) => [
            new Date(log.timestamp).toLocaleString(),
            `${log.userName} (${log.userId})`,
            <Badge key={i} text={log.userRole} color={log.userRole === 'super_admin' ? 'purple' : log.userRole === 'sub_admin' ? 'blue' : 'gray'} />,
            <Badge key={i} text={log.action} color={actionColors[log.action] || 'gray'} />,
            log.resource,
            <Badge key={i} text={log.status} color={log.status === 'success' ? 'green' : 'red'} />,
            <span key={i} style={{ fontSize: 11, color: dark ? "rgba(255,255,255,.5)" : "#6b7280", maxWidth: 200, display: "inline-block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {log.resourceId || log.action}
            </span>
          ])} />
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16 }}>
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
              style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid #d1d5db", background: page <= 1 ? "#f3f4f6" : "#fff", color: page <= 1 ? "#9ca3af" : "#111", cursor: page <= 1 ? "not-allowed" : "pointer", fontSize: 12 }}>Previous</button>
            <span style={{ padding: "8px 16px", fontSize: 12, color: dark ? "rgba(255,255,255,.6)" : "#6b7280" }}>Page {page} of {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
              style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid #d1d5db", background: page >= totalPages ? "#f3f4f6" : "#fff", color: page >= totalPages ? "#9ca3af" : "#111", cursor: page >= totalPages ? "not-allowed" : "pointer", fontSize: 12 }}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
