import { useState, useEffect } from "react";
import { SectionHeader } from "../components/SectionHeader";
import { Btn } from "../components/Btn";
import { Input } from "../components/Input";
import { Badge } from "../components/Badge";
import { useAuth } from "../contexts/AuthContext";

export function Notifications({ dark, toast }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showSendForm, setShowSendForm] = useState(false);
  const [sendForm, setSendForm] = useState({ title: "", message: "", type: "info", recipientType: "all" });

  const canSend = user?.role === "super_admin" || user?.role === "sub_admin";

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markAsRead = async (id) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      toast.add("All notifications marked as read");
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async () => {
    if (!sendForm.title || !sendForm.message) {
      toast.add("Title and message are required", "error");
      return;
    }
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify(sendForm)
      });
      if (response.ok) {
        toast.add("Notification sent successfully!");
        setShowSendForm(false);
        setSendForm({ title: "", message: "", type: "info", recipientType: "all" });
        fetchNotifications();
      } else {
        const err = await response.json();
        toast.add(err.message || "Failed to send", "error");
      }
    } catch (err) {
      toast.add("Error sending notification", "error");
    }
  };

  const typeColors = { info: "blue", warning: "orange", success: "green", error: "red" };
  const typeIcons = { info: "i", warning: "!", success: "", error: "x" };

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;

  return (
    <div>
      <SectionHeader title="Notifications" subtitle={`${unreadCount} unread notifications`} dark={dark}
        actions={[
          unreadCount > 0 && <Btn key="read" label="Mark All Read" onClick={markAllRead} />,
          canSend && <Btn key="send" label="+ Send Notification" onClick={() => setShowSendForm(true)} primary />
        ].filter(Boolean)} />

      {showSendForm && (
        <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#f9fafb", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 16 }}>Send Notification</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "0 20px" }}>
            <Input label="Title *" value={sendForm.title} onChange={v => setSendForm({ ...sendForm, title: v })} dark={dark} />
            <Input label="Type" value={sendForm.type} onChange={v => setSendForm({ ...sendForm, type: v })} dark={dark} options={[
              { value: "info", label: "Info" }, { value: "warning", label: "Warning" },
              { value: "success", label: "Success" }, { value: "error", label: "Error" }
            ]} />
            <Input label="Recipients" value={sendForm.recipientType} onChange={v => setSendForm({ ...sendForm, recipientType: v })} dark={dark} options={[
              { value: "all", label: "All Users" }, { value: "super_admin", label: "Super Admin" },
              { value: "sub_admin", label: "Sub Admins" }, { value: "user", label: "Users" }
            ]} />
          </div>
          <div style={{ marginTop: 12 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: dark ? "rgba(255,255,255,.7)" : "#374151", marginBottom: 6 }}>Message *</label>
            <textarea value={sendForm.message} onChange={e => setSendForm({ ...sendForm, message: e.target.value })}
              style={{
                width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid " + (dark ? "rgba(255,255,255,.15)" : "#d1d5db"),
                fontSize: 13, background: dark ? "rgba(255,255,255,.05)" : "#fff", color: dark ? "#f3f4f6" : "#111",
                minHeight: 80, resize: "vertical", boxSizing: "border-box"
              }} />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <Btn label="Send Notification" onClick={handleSend} primary />
            <Btn label="Cancel" onClick={() => { setShowSendForm(false); setSendForm({ title: "", message: "", type: "info", recipientType: "all" }); }} />
          </div>
        </div>
      )}

      <div style={{ display: "grid", gap: 12 }}>
        {notifications.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: dark ? "rgba(255,255,255,.4)" : "#9ca3af" }}>
            <div style={{ fontSize: 16, marginBottom: 8 }}>No notifications</div>
          </div>
        ) : notifications.map(n => {
          const isUnread = !n.readBy?.includes(user?.userId);
          return (
            <div key={n._id} onClick={() => isUnread && markAsRead(n._id)}
              style={{
                background: dark ? (isUnread ? "rgba(255,255,255,.08)" : "rgba(255,255,255,.03)") : (isUnread ? "#f0f7ff" : "#fff"),
                border: dark ? "1px solid rgba(255,255,255,.1)" : `1px solid ${isUnread ? "#bfdbfe" : "#e5e7eb"}`,
                borderRadius: 12, padding: 20, cursor: isUnread ? "pointer" : "default",
                borderLeft: `4px solid ${n.type === 'success' ? '#059669' : n.type === 'warning' ? '#d97706' : n.type === 'error' ? '#dc2626' : '#2563eb'}`,
                transition: "all .2s ease"
              }}
              onMouseEnter={e => { if (isUnread) e.currentTarget.style.background = dark ? "rgba(255,255,255,.12)" : "#e8f4fd"; }}
              onMouseLeave={e => { if (isUnread) e.currentTarget.style.background = dark ? "rgba(255,255,255,.08)" : "#f0f7ff"; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {isUnread && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#3b82f6", flexShrink: 0 }} />}
                  <div style={{ fontSize: 14, fontWeight: isUnread ? 700 : 500, color: dark ? "#f3f4f6" : "#111" }}>{n.title}</div>
                  <Badge text={n.type} color={typeColors[n.type]} />
                </div>
                <div style={{ fontSize: 11, color: dark ? "rgba(255,255,255,.4)" : "#9ca3af", whiteSpace: "nowrap" }}>
                  {new Date(n.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div style={{ fontSize: 13, color: dark ? "rgba(255,255,255,.6)" : "#6b7280", marginLeft: 16 }}>{n.message}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
