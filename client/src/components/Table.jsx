export function Table({ dark, cols, rows }) {
  const headerStyle = {
    background: "var(--table-header-bg)",
    padding: "12px",
    fontSize: 12,
    fontWeight: 600,
    color: "var(--text-secondary)",
    textTransform: "uppercase",
    letterSpacing: 0.5
  };
  
  const cellStyle = {
    padding: "12px",
    fontSize: 13,
    color: "var(--text-secondary)",
    borderBottom: "1px solid var(--table-row-border)"
  };
  
  return (
    <div className="table-wrapper" style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", background: "var(--bg-card)", borderRadius: 12, overflow: "hidden" }}>
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
