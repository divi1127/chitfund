// Stat card component
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
      background: dark ? "rgba(255,255,255,.05)" : "#fff",
      border: dark ? "1px solid rgba(255,255,255,.1)" : `1px solid ${accentColor}20`,
      borderRadius: 12,
      padding: 20,
      display: "flex",
      alignItems: "center",
      gap: 16,
      transition: "all 0.25s ease",
      cursor: "default",
      position: "relative",
      overflow: "hidden",
      boxShadow: dark ? "none" : `0 1px 3px ${accentColor}08, 0 1px 2px ${accentColor}08`,
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-2px)";
      e.currentTarget.style.boxShadow = dark ? "0 8px 25px rgba(0,0,0,0.3)" : `0 8px 25px ${accentColor}15, 0 4px 10px ${accentColor}10`;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = dark ? "none" : `0 1px 3px ${accentColor}08, 0 1px 2px ${accentColor}08`;
    }}
    >
      <div style={{
        width: 48,
        height: 48,
        borderRadius: 12,
        background: dark ? `${accentColor}30` : `${accentColor}12`,
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
        <div style={{ fontSize: 12, color: dark ? "rgba(255,255,255,.5)" : "#6b7280", marginBottom: 2, fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: dark ? "#f3f4f6" : "#111", lineHeight: 1.3 }}>{value}</div>
        {sub && <div style={{ fontSize: 11, color: dark ? "rgba(255,255,255,.35)" : "#9ca3af", marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}
