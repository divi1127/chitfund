// Badge component for status indicators
export function Badge({ text, color }) {
  const colors = {
    green: "#059669",
    red: "#dc2626",
    yellow: "#d97706",
    blue: "#2563eb",
    gray: "#6b7280",
    purple: "#7c3aed"
  };
  
  return (
    <span style={{
      background: colors[color] || colors.gray,
      color: "#fff",
      padding: "4px 10px",
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: 0.5
    }}>
      {text}
    </span>
  );
}
