export function Input({ label, value, onChange, type = "text", dark, options, placeholder, style, disabled }) {
  const baseStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid var(--border-input)",
    fontSize: 13,
    background: disabled ? (dark ? "rgba(255,255,255,.02)" : "#f3f4f6") : (dark ? "rgba(255,255,255,.05)" : "#fff"),
    color: dark ? "#f3f4f6" : "#111",
    outline: "none",
    transition: "border-color 0.2s ease",
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? "not-allowed" : "auto"
  };

  const labelStyle = {
    display: "block",
    fontSize: 12,
    fontWeight: 600,
    color: "var(--text-secondary)",
    marginBottom: 6
  };

  return (
    <div style={style}>
      {label && <label style={labelStyle}>{label}</label>}
      {options ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={baseStyle}
          disabled={disabled}
        >
          <option value="">Select...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={baseStyle}
          disabled={disabled}
        />
      )}
    </div>
  );
}
