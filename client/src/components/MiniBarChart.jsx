// Mini bar chart component
export function MiniBarChart({ data }) {
  const max = Math.max(...data.map((d) => d.v));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80, padding: "0 4px" }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ width: "100%", background: "#d97706", borderRadius: "3px 3px 0 0", height: Math.max(4, (d.v / max) * 60), transition: "height .4s ease" }}></div>
          <span style={{ fontSize: 9, color: "var(--text-muted-2)", whiteSpace: "nowrap" }}>{d.l}</span>
        </div>
      ))}
    </div>
  );
}
