export function Badge({ text, color = "gray" }) {
  const colors = {
    green: { bg: "#dcfce7", text: "#166534" },
    red: { bg: "#fef2f2", text: "#dc2626" },
    yellow: { bg: "#fef9c3", text: "#a16207" },
    orange: { bg: "#ffedd5", text: "#c2410c" },
    blue: { bg: "#dbeafe", text: "#1e40af" },
    purple: { bg: "#f3e8ff", text: "#6b21a8" },
    gray: { bg: "#f3f4f6", text: "#374151" },
    indigo: { bg: "#e0e7ff", text: "#3730a3" },
    pink: { bg: "#fce7f3", text: "#9d174d" },
  };

  const c = colors[color] || colors.gray;

  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: 9999,
        background: c.bg,
        color: c.text,
        fontSize: 11,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </span>
  );
}
