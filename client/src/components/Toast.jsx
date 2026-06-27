// Toast notification component
export function Toast({ toasts, remove }) {
  return (
    <div className="toast-wrapper" style={{
      position: "fixed", bottom: 16, zIndex: 9999,
      display: "flex", flexDirection: "column", gap: 10,
      left: 16, right: 16,
    }}>
      <style>{`@media (min-width: 640px) { .toast-wrapper { left: auto !important; right: 24px !important; width: auto !important; min-width: 320px; } }`}</style>
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
