// Toast notification component
export function Toast({ toasts, remove }) {
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 10 }}>
      {toasts.map((t) => (
        <div key={t.id} onClick={() => remove(t.id)} style={{
          background: t.type === "success" ? "#14532d" : t.type === "error" ? "#7f1d1d" : "#1e3a5f",
          color: "#fff", padding: "12px 18px", borderRadius: 10, fontSize: 14, cursor: "pointer",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)", minWidth: 240, display: "flex", alignItems: "center", gap: 10,
          animation: "fadeIn .3s ease"
        }}>
          <span>{t.type === "success" ? "✓" : t.type === "error" ? "✗" : "ℹ"}</span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}
