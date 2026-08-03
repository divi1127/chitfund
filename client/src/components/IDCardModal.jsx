import { useState } from "react";
import { Btn } from "./Btn";
import { COMPANY } from "../utils/constants";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useRef } from "react";

export function IDCardModal({ entity, type = "Member", onClose }) {
  const [layout, setLayout] = useState("portrait");
  const isPortrait = layout === "portrait";

  const cardRef = useRef(null);

  const handlePrint = () => window.print();

  const handleDownloadJPG = async () => {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, { scale: 3, useCORS: true });
    const link = document.createElement("a");
    link.download = `ID_${entity.name || "Card"}.jpg`;
    link.href = canvas.toDataURL("image/jpeg", 0.9);
    link.click();
  };

  const handleDownloadPDF = async () => {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, { scale: 3, useCORS: true });
    const imgData = canvas.toDataURL("image/jpeg", 0.9);
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "in",
      format: "a4"
    });
    // A4 is 8.27 x 11.69 inches. We place the card at the top left margin.
    pdf.addImage(imgData, "JPEG", 0.2, 0.2, isPortrait ? 2.25 : 3.5, isPortrait ? 3.5 : 2.25);
    pdf.save(`ID_${entity.name || "Card"}.pdf`);
  };

  const defaultAvatar =
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiB2aWV3Qm94PSIwIDAgMTIwIDEyMCI+CiAgPHJlY3Qgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxMjAiIGZpbGw9IiNlMmU4ZjAiLz4KICA8Y2lyY2xlIGN4PSI2MCIgY3k9IjQ1IiByPSIyMiIgZmlsbD0iI2NhY2VjYyIvPgogIDxwYXRoIGQ9Ik0zMCwxMjAgQTMwLDMwIDAgMCwxIDkwLDEyMCIgZmlsbD0iI2NhY2VjYyIgb3BhY2l0eT0iMC44Ii8+Cjwvc3ZnPg==";

  const photoUrl = entity.photo || defaultAvatar;
  const isAgent = type === "Agent";

  const id = entity.agentId || entity.memberId || entity.id || "—";
  const name = entity.name || "—";
  const phone = entity.phone || "—";
  const email = entity.email || null;
  const address = entity.address || null;
  const rawAadhaar = entity.aadhaar && entity.aadhaar.length ? entity.aadhaar.replace(/\D/g, '') : "";
  const aadhaar = rawAadhaar.length === 12 ? rawAadhaar.replace(/(\d{4})(\d{4})(\d{4})/, "$1 $2 $3") : (entity.aadhaar || "—");
  const pan = entity.pan || null;
  const dob = entity.dob
    ? new Date(entity.dob).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "—";
  const joined = entity.joined
    ? new Date(entity.joined).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : null;
  const branch = entity.branch || COMPANY.branch || "Madurai HQ";

  // Colors per type
  const themeGrad = isAgent
    ? "linear-gradient(135deg, #065f46 0%, #059669 100%)"
    : "linear-gradient(135deg, #1e3a8a 0%, #ca8a04 100%)"; // Blue and Gold
  const badgeBg   = isAgent ? "#dcfce7" : "#fef3c7"; // Light gold
  const badgeClr  = isAgent ? "#166534" : "#92400e"; // Dark gold
  const badgeTxt  = isAgent ? "AUTHORIZED AGENT" : "VERIFIED MEMBER";

  // ── Reusable mini row ──
  const Row = ({ label, value, mono }) => value ? (
    <div style={{ display: "flex", gap: 4, alignItems: "flex-start", marginBottom: 3 }}>
      <span style={{ fontSize: 8.5, color: "#94a3b8", fontWeight: 700, minWidth: 52, flexShrink: 0, paddingTop: 1 }}>{label}:</span>
      <span style={{ fontSize: 8.5, color: "#334155", fontWeight: 600, fontFamily: mono ? "monospace" : undefined, wordBreak: "break-all" }}>{value}</span>
    </div>
  ) : null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(15,23,42,0.85)", zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      backdropFilter: "blur(6px)",
    }}>
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 0; }
          body * { visibility: hidden; }
          .printable-card, .printable-card * { visibility: visible; }
          .printable-card { position: absolute !important; left: 20px !important; top: 20px !important; transform: none !important; margin: 0; padding: 0; box-shadow: none !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", display: "flex", flexDirection: "column", maxWidth: "100%", maxHeight: "96vh", minWidth: 360, boxShadow: "0 32px 80px rgba(0,0,0,0.35)" }}>

        {/* ── Header ── */}
        <div className="no-print" style={{ padding: "14px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc" }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a" }}>ID Card — {name}</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>{badgeTxt} · {id}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#64748b", lineHeight: 1 }}>×</button>
        </div>

        <div style={{ padding: 24, overflowY: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>

          {/* Layout toggle */}
          <div className="no-print" style={{ display: "flex", gap: 8, background: "#f1f5f9", padding: "6px 10px", borderRadius: 10 }}>
            {["portrait", "landscape"].map(l => (
              <button key={l} onClick={() => setLayout(l)} style={{
                padding: "7px 18px", borderRadius: 8, border: "none",
                background: layout === l ? "#2563eb" : "transparent",
                color: layout === l ? "#fff" : "#475569",
                fontWeight: 700, cursor: "pointer", fontSize: 13, textTransform: "capitalize"
              }}>{l}</button>
            ))}
          </div>

          {/* ════════ ACTUAL CARD ════════ */}
          <div ref={cardRef} className="printable-card" style={{
            width:  isPortrait ? "2.25in" : "3.5in",
            height: isPortrait ? "3.5in"  : "2.25in",
            background: "#fff",
            borderRadius: 14,
            boxShadow: "0 12px 32px rgba(0,0,0,0.18)",
            border: "1px solid #e2e8f0",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: isPortrait ? "column" : "row",
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
          }}>

            {/* ── Brand strip (top in portrait, left in landscape) ── */}
            <div style={{
              background: themeGrad,
              color: "#fff",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: isPortrait ? "flex-start" : "center",
              padding: isPortrait ? "18px 10px 10px" : "10px",
              width:  isPortrait ? "100%" : "32%",
              height: isPortrait ? "30%"  : "100%",
              boxSizing: "border-box",
              gap: 3,
            }}>
              <div style={{ fontWeight: 900, fontSize: isPortrait ? 12 : 10, letterSpacing: 0.5, textTransform: "uppercase", textAlign: "center", lineHeight: 1.2 }}>
                {COMPANY.name}
              </div>
              {!isPortrait && (
                <div style={{ fontSize: 8, opacity: 0.75, textAlign: "center", marginTop: 2 }}>CHIT FUND</div>
              )}
            </div>

            {/* ── Photo circle (floated at join of strip + body) ── */}
            <div style={{
              position: "absolute",
              width: 66, height: 66,
              borderRadius: "50%",
              border: "3px solid #fff",
              boxShadow: "0 3px 10px rgba(0,0,0,0.18)",
              top:  isPortrait ? "30%" : "50%",
              left: isPortrait ? "50%" : "32%",
              transform: isPortrait ? "translate(-50%, -50%)" : "translate(-50%, -50%)",
              zIndex: 10,
              overflow: "hidden",
              background: "#e2e8f0",
            }}>
              <img src={photoUrl} alt="Photo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>

            {/* ── Body / Details ── */}
            <div style={{
              flex: 1,
              padding: isPortrait ? "42px 14px 10px" : "12px 12px 10px 42px",
              display: "flex",
              flexDirection: "column",
              alignItems: isPortrait ? "center" : "flex-start",
              textAlign: isPortrait ? "center" : "left",
              boxSizing: "border-box",
              overflow: "hidden",
            }}>

              {/* Name + badge */}
              <div style={{ fontWeight: 800, fontSize: isPortrait ? 14 : 13, color: "#0f172a", marginBottom: 3, lineHeight: 1.2 }}>{name}</div>
              <div style={{ fontSize: 8, fontWeight: 800, color: badgeClr, background: badgeBg, padding: "2px 8px", borderRadius: 4, marginBottom: 8, letterSpacing: 0.6 }}>
                {badgeTxt}
              </div>

              {/* Details grid */}
              <div style={{ width: "100%", textAlign: "left" }}>
                <Row label="ID"      value={id} />
                <Row label="DOB"     value={dob} />
                <Row label="Phone"   value={phone} />
                {email   && <Row label="Email"   value={email} />}
                {pan     && <Row label="PAN"     value={pan} mono />}
                <Row label="Aadhaar" value={aadhaar} mono />
                {address && <Row label="Address" value={address} />}
                {joined  && <Row label="Joined"  value={joined} />}
                {isAgent
                  ? <Row label="Branch" value={branch} />
                  : entity.agentId && <Row label="Agent" value={entity.agentId} />
                }
              </div>

              {/* Footer divider */}
              <div style={{ marginTop: "auto", width: "100%", borderTop: "1px dashed #e2e8f0", paddingTop: 5, fontSize: 7, color: "#94a3b8", fontWeight: 600, textAlign: "center" }}>
                {COMPANY.phone && `☎ ${COMPANY.phone}  ·  `}IF FOUND RETURN TO BRANCH
              </div>
            </div>
          </div>
          {/* ════════ END CARD ════════ */}

          {/* Print tip */}
          <div className="no-print" style={{ padding: "10px 14px", borderRadius: 8, background: "#fff7ed", color: "#c2410c", fontSize: 12, display: "flex", gap: 8, alignItems: "flex-start", maxWidth: 360 }}>
            <span>⚠️</span>
            <span>Set printer to <strong>Background graphics: ON</strong> to print colors correctly.</span>
          </div>
        </div>

        {/* ── Footer buttons ── */}
        <div className="no-print" style={{ padding: "14px 20px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: 10, background: "#f8fafc", flexWrap: "wrap" }}>
          <Btn label="Cancel" onClick={onClose} />
          <Btn label="JPG" onClick={handleDownloadJPG} />
          <Btn label="PDF" onClick={handleDownloadPDF} />
          <Btn label="🖨 Print ID Card" primary onClick={handlePrint} />
        </div>
      </div>
    </div>
  );
}
