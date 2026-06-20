// Table component
export function Table({ dark, cols, rows }) {
  const headerStyle = {
    background: dark ? "rgba(255,255,255,.08)" : "#f9fafb",
    padding: "12px",
    fontSize: 12,
    fontWeight: 600,
    color: dark ? "rgba(255,255,255,.8)" : "#374151",
    textTransform: "uppercase",
    letterSpacing: 0.5
  };
  
  const cellStyle = {
    padding: "12px",
    fontSize: 13,
    color: dark ? "rgba(255,255,255,.7)" : "#374151",
    borderBottom: "1px solid " + (dark ? "rgba(255,255,255,.05)" : "#e5e7eb")
  };
  
  return (
    <div className="table-wrapper" style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", background: dark ? "rgba(255,255,255,.02)" : "#fff", borderRadius: 12, overflow: "hidden" }}>
        <thead>
          <tr>
            {cols.map((col, i) => (
              <th key={i} style={headerStyle}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} style={cellStyle}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
