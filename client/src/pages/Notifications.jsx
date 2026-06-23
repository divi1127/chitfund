import { useData } from "../hooks/useData";
import { SectionHeader } from "../components/SectionHeader";

export function Notifications() {
  const { data: auctions, loading: aLoading } = useData('/auctions');
  const { data: collections, loading: cLoading } = useData('/collections');
  const { data: members, loading: mLoading } = useData('/members');

  if (aLoading || cLoading || mLoading) return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;

  const notes = [];
  auctions?.filter(a => a.status === "Scheduled").forEach(a => {
    notes.push({ id: "auc-"+a.id, title: "Auction Scheduled", message: `${a.groupName || "Group"} auction scheduled on ${a.date?.split('T')[0]}`, time: a.date, type: "info" });
  });
  collections?.filter(c => c.status === "Due").forEach(c => {
    const m = members?.find(mm => mm.id === c.memberId);
    notes.push({ id: "col-"+c.id, title: "Payment Due", message: `${m?.name || "Member"} has due payment of ₹${c.amount}`, time: c.date, type: "warning" });
  });
  members?.filter(m => m.status === "Active").slice(0, 3).forEach(m => {
    notes.push({ id: "mem-"+m.id, title: "Member Activity", message: `${m.name} joined on ${m.joined}`, time: m.joined, type: "success" });
  });

  if (notes.length === 0) {
    return (
      <div>
        <SectionHeader title="Notifications" subtitle="View all notifications and alerts" />
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>No notifications available.</div>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader title="Notifications" subtitle="View all notifications and alerts" />
      
      <div style={{ display: "grid", gap: 16 }}>
        {notes.map(note => (
          <div key={note.id} style={{ 
            background: "var(--bg-card)", 
            border: "1px solid var(--border-color)", 
            borderRadius: 12, 
            padding: 20,
            borderLeft: note.type === "success" ? "4px solid #059669" : note.type === "warning" ? "4px solid #d97706" : "4px solid #2563eb"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{note.title}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{note.time?.split('T')[0]}</div>
            </div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{note.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
