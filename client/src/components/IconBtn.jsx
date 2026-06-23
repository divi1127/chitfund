export function IconBtn({ icon, onClick, color = "#2563eb", title, size = 14 }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 30,
        height: 30,
        borderRadius: 6,
        border: "none",
        background: "transparent",
        color: color,
        cursor: "pointer",
        fontSize: size,
        transition: "all .2s ease",
      }}
      onMouseEnter={e => { e.currentTarget.background = `${color}15`; e.currentTarget.style.background = `${color}15`; }}
      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
    >
      {icon}
    </button>
  );
}
