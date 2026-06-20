// Notifications page component
import { SectionHeader } from "../components/SectionHeader";

export function Notifications({ dark }) {
  const notes = [
    { id: 1, title: "Auction Scheduled", message: "Group A auction scheduled for tomorrow at 10 AM", time: "2 hours ago", type: "info" },
    { id: 2, title: "Payment Due", message: "Member John Doe has installment payment due", time: "5 hours ago", type: "warning" },
    { id: 3, title: "New Member", message: "New member Jane Smith registered", time: "1 day ago", type: "success" },
  ];

  return (
    <div>
      <SectionHeader title="Notifications" subtitle="View all notifications and alerts" dark={dark} />
      
      <div style={{ display: "grid", gap: 16 }}>
        {notes.map(note => (
          <div key={note.id} style={{ 
            background: dark ? "rgba(255,255,255,.05)" : "#fff", 
            border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", 
            borderRadius: 12, 
            padding: 20,
            borderLeft: note.type === "success" ? "4px solid #059669" : note.type === "warning" ? "4px solid #d97706" : "4px solid #2563eb"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: dark ? "#f3f4f6" : "#111" }}>{note.title}</div>
              <div style={{ fontSize: 11, color: dark ? "rgba(255,255,255,.4)" : "#9ca3af" }}>{note.time}</div>
            </div>
            <div style={{ fontSize: 13, color: dark ? "rgba(255,255,255,.6)" : "#6b7280" }}>{note.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
