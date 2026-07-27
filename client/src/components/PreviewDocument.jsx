// Preview document component
import { Btn } from "./Btn";
import { IconBtn } from "./IconBtn";
import { HiPrinter, HiShare, HiEnvelope, HiDevicePhoneMobile, HiArrowDownTray, HiXMark } from "react-icons/hi2";

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
      {icon} {label}
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
          <ActionBtn icon={<HiPrinter size={14} />} label="Print" onClick={handlePrint} color="#2563eb" />
          <ActionBtn icon={<HiShare size={14} />} label="Share" onClick={handleShare} color="#7c3aed" />
          <ActionBtn icon={<HiEnvelope size={14} />} label="Email" onClick={handleEmail} color="#0891b2" />
          <ActionBtn icon={<HiDevicePhoneMobile size={14} />} label="WhatsApp" onClick={handleWhatsApp} color="#16a34a" />
          <ActionBtn icon={<HiArrowDownTray size={14} />} label="Download PDF" onClick={() => alert("PDF export requires backend integration.")} color="#d97706" />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onClose} style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid #555", background: "transparent", color: "#fff", cursor: "pointer", fontSize: 13 }}>← Back to Edit</button>
          <IconBtn icon={<HiXMark size={16} />} onClick={onClose} color="#ef4444" title="Close" />
        </div>
      </div>

      {/* A4 Document */}
      <div style={{ background: "#fff", width: "100%", maxWidth: 860, minHeight: 1100, padding: 48, borderRadius: 4, boxShadow: "0 10px 40px rgba(0,0,0,0.4)" }}>
        {/* Header Block */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #1e3a5f", paddingBottom: 16, marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: "#1565C0", margin: "0 0 4px 0", letterSpacing: "-0.5px" }}>NVS CHIT ENTERPRISES</h1>
            <div style={{ fontSize: 13, color: "#475569" }}>1538, North Veli Street, Simmakkal</div>
            <div style={{ fontSize: 13, color: "#475569" }}>Madurai – 625001</div>
            <div style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>Phone: 96009 4752 | Email: nvschit@gmail.com</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "#1e3a5f", margin: "0 0 8px 0" }}>{doc.title}</h2>
            <div style={{ fontSize: 14, color: "#1e3a5f", fontWeight: 600 }}>No: {doc.docNo}</div>
            {doc.chit && doc.chit["Receipt Date"] && (
              <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Date: {doc.chit["Receipt Date"]}</div>
            )}
            {doc.chit && doc.chit["Invoice Date"] && (
              <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Date: {doc.chit["Invoice Date"]}</div>
            )}
          </div>
        </div>

        {/* Info Grid: Customer, Agent, Chit */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
          {doc.member && (
            <div style={{ background: "#f8fafc", padding: 16, border: "1px solid #e2e8f0", borderRadius: 8 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "#1565C0", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>Customer Details</h3>
              <div style={{ fontSize: 14, color: "#1e293b", display: "grid", gap: 6 }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{doc.member.name}</div>
                {doc.member.memberId && <div><span style={{ color: "#64748b", fontSize: 13 }}>ID:</span> {doc.member.memberId}</div>}
                <div><span style={{ color: "#64748b", fontSize: 13 }}>Phone:</span> {doc.member.phone}</div>
                {doc.member.address && <div><span style={{ color: "#64748b", fontSize: 13 }}>Address:</span> {doc.member.address}</div>}
                {doc.member.aadhaar && <div><span style={{ color: "#64748b", fontSize: 13 }}>Aadhaar:</span> {doc.member.aadhaar}</div>}
                {doc.member.pan && <div><span style={{ color: "#64748b", fontSize: 13 }}>PAN:</span> {doc.member.pan}</div>}
              </div>
            </div>
          )}

          {doc.chit && (
            <div style={{ background: "#f8fafc", padding: 16, border: "1px solid #e2e8f0", borderRadius: 8 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "#1565C0", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>Chit & Agent Details</h3>
              <div style={{ display: "grid", gap: 6, fontSize: 14, color: "#1e293b" }}>
                {Object.entries(doc.chit).filter(([k]) => !k.includes("Date")).map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b", fontSize: 13 }}>{k}:</span>
                    <span style={{ fontWeight: 600, textAlign: "right" }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

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
