export function StatCard({ label, value, icon, color, dark, sub }) {
  const colors = {
    blue: "#2563eb",
    green: "#059669",
    purple: "#7c3aed",
    orange: "#d97706",
    red: "#dc2626"
  };
  
  const accentColor = colors[color] || colors.blue;
  
  return (
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border-color)",
      borderRadius: 12,
      padding: 20,
      display: "flex",
      alignItems: "center",
      gap: 16,
      transition: "all 0.25s ease",
      cursor: "default",
      position: "relative",
      overflow: "hidden",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-2px)";
      e.currentTarget.style.boxShadow = dark ? "0 8px 25px rgba(0,0,0,0.3)" : `0 8px 25px ${accentColor}15, 0 4px 10px ${accentColor}10`;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "none";
    }}
    >
      <div style={{
        width: 48,
        height: 48,
        borderRadius: 12,
        background: `${accentColor}18`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 22,
        color: accentColor,
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 2, fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.3 }}>{value}</div>
        {sub && <div style={{ fontSize: 11, color: "var(--text-muted-2)", marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}
