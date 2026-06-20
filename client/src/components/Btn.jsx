// Button component
export function Btn({ label, onClick, primary, secondary, danger, disabled, style }) {
  const baseStyle = {
    padding: "10px 20px",
    borderRadius: 8,
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: 13,
    fontWeight: 600,
    transition: "all 0.2s ease",
    opacity: disabled ? 0.5 : 1
  };
  
  const variantStyles = {
    primary: { background: "#2563eb", color: "#fff" },
    secondary: { background: "#6b7280", color: "#fff" },
    danger: { background: "#dc2626", color: "#fff" },
    default: { background: "#e5e7eb", color: "#111" }
  };
  
  const selectedStyle = primary ? variantStyles.primary : secondary ? variantStyles.secondary : danger ? variantStyles.danger : variantStyles.default;
  
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      style={{ ...baseStyle, ...selectedStyle, ...style }}
    >
      {label}
    </button>
  );
}
