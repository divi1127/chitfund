// Preview document component
import { Btn } from "./Btn";

function ActionBtn({ icon, label, onClick, color }) {
  return (
    <button 
      onClick={onClick}
      style={{
        padding: "8px 14px",
        borderRadius: 8,
        border: "none",
        background: color,
        color: "#fff",
        cursor: "pointer",
        fontSize: 12,
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        gap: 6
      }}
    >
      <span>{icon}</span> {label}
    </button>
  );
}

export function PreviewDocument({ doc, onClose }) {
  const handlePrint = () => window.print();
  const handleShare = () => navigator.share ? navigator.share({ title: doc.title, text: doc.docNo }) : alert("Copy link: " + doc.docNo);
  const handleEmail = () => window.open(`mailto:?subject=${doc.title}&body=Document No: ${doc.docNo}`);
  const handleWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(doc.title + " – " + doc.docNo)}`);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 1000, display: "flex", flexDirection: "column", alignItems: "center", overflowY: "auto", padding: "24px 16px" }}>
      {/* Action Bar */}
      <div style={{ width: "100%", maxWidth: 860, display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20, justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <ActionBtn icon="🖨" label="Print" onClick={handlePrint} color="#2563eb" />
          <ActionBtn icon="📤" label="Share" onClick={handleShare} color="#7c3aed" />
          <ActionBtn icon="📧" label="Email" onClick={handleEmail} color="#0891b2" />
          <ActionBtn icon="💬" label="WhatsApp" onClick={handleWhatsApp} color="#16a34a" />
          <ActionBtn icon="⬇" label="Download PDF" onClick={() => alert("PDF export requires backend integration.")} color="#d97706" />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onClose} style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid #555", background: "transparent", color: "#fff", cursor: "pointer", fontSize: 13 }}>← Back to Edit</button>
          <button onClick={onClose} style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: "#ef4444", color: "#fff", cursor: "pointer", fontSize: 13 }}>✕ Close</button>
        </div>
      </div>

      {/* A4 Document */}
      <div style={{ background: "#fff", width: "100%", maxWidth: 860, minHeight: 1100, padding: 48, borderRadius: 4, boxShadow: "0 10px 40px rgba(0,0,0,0.4)" }}>
        <div style={{ borderBottom: "2px solid #1e3a5f", paddingBottom: 16, marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#1e3a5f", margin: 0 }}>{doc.title}</h1>
          <div style={{ fontSize: 14, color: "#6b7280", marginTop: 8 }}>Document No: {doc.docNo}</div>
        </div>

        {doc.member && (
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1e3a5f", marginBottom: 8 }}>Bill To:</h3>
            <div style={{ fontSize: 13, color: "#374151" }}>
              <div style={{ fontWeight: 600 }}>{doc.member.name}</div>
              <div>{doc.member.address}</div>
              <div>Phone: {doc.member.phone}</div>
              {doc.member.pan && <div>PAN: {doc.member.pan}</div>}
            </div>
          </div>
        )}

        {doc.chit && (
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1e3a5f", marginBottom: 8 }}>Chit Details:</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 8, fontSize: 13, color: "#374151" }}>
              {Object.entries(doc.chit).map(([k, v]) => (
                <div key={k}><span style={{ fontWeight: 600 }}>{k}:</span> {v}</div>
              ))}
            </div>
          </div>
        )}

        {doc.payments && (
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1e3a5f", marginBottom: 8 }}>Payment Details:</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  {doc.payments.headers.map((h, i) => (
                    <th key={i} style={{ padding: "10px", textAlign: "left", borderBottom: "1px solid #e5e7eb", color: "#374151", fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {doc.payments.rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j} style={{ padding: "10px", borderBottom: "1px solid #e5e7eb", color: "#374151" }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {doc.amount && (
          <div style={{ textAlign: "right", marginTop: 24 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#1e3a5f" }}>Total: ₹{doc.amount.toLocaleString("en-IN")}</div>
          </div>
        )}

        {doc.notes && (
          <div style={{ marginTop: 24, padding: 16, background: "#f9fafb", borderRadius: 8, fontSize: 13, color: "#6b7280" }}>
            <strong>Notes:</strong> {doc.notes}
          </div>
        )}
      </div>
    </div>
  );
}
