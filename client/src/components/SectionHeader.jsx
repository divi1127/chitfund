export function SectionHeader({ title, subtitle, dark, actions }) {
  return (
    <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{title}</h2>
        <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "4px 0 0 0" }}>{subtitle}</p>
      </div>
      {actions && <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{actions}</div>}
    </div>
  );
}
