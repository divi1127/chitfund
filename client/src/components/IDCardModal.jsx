import React, { useRef, useState } from "react";
import { Btn } from "./Btn";
import { COMPANY } from "../utils/constants";

export function IDCardModal({ entity, type = "Member", onClose }) {
  // entity can be an Agent or a Member
  const [layout, setLayout] = useState("portrait"); // portrait | landscape

  const handlePrint = () => {
    window.print();
  };

  const isPortrait = layout === "portrait";

  const defaultAvatar = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiB2aWV3Qm94PSIwIDAgMTIwIDEyMCI+CiAgPHJlY3Qgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxMjAiIGZpbGw9IiNlMmU4ZjAiLz4KICA8Y2lyY2xlIGN4PSI2MCIgY3k9IjQ1IiByPSIyMiIgZmlsbD0iI2NhY2VjYyIvPgogIDxwYXRoIGQ9Ik0zMCwxMjAgQTMwLDMwIDAgMCwxIDkwLDEyMCIgZmlsbD0iI2NhY2VjYyIgb3BhY2l0eT0iMC44Ii8+Cjwvc3ZnPg==";
  const photoUrl = entity.photo || defaultAvatar;

  const getRoleBadge = () => {
    if (type === "Agent") return { bg: "#dcfce7", color: "#166534", text: "AUTHORIZED AGENT" };
    return { bg: "#dbeafe", color: "#1e40af", text: "VERIFIED MEMBER" };
  };
  const badge = getRoleBadge();

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(15,23,42,0.8)", zIndex: 9999, display: "flex",
      alignItems: "center", justifyContent: "center", padding: 20,
      backdropFilter: "blur(4px)"
    }}>
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            .printable-card, .printable-card * { visibility: visible; }
            .printable-card {
              position: absolute;
              left: 40px;
              top: 40px;
              margin: 0;
              padding: 0;
              box-shadow: none !important;
              transform: scale(1.05); /* slightly scale up for printing */
            }
            .no-print { display: none !important; }
          }
        `}
      </style>

      <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column", maxWidth: "100%", maxHeight: "100%" }}>
        <div className="no-print" style={{ padding: "16px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc" }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>Print ID Card: {entity.name}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#64748b" }}>&times;</button>
        </div>

        <div style={{ padding: 24, overflowY: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 32 }}>
          {/* Controls */}
          <div className="no-print" style={{ display: "flex", gap: 12, background: "#f1f5f9", padding: "8px 12px", borderRadius: 12 }}>
            <button
              onClick={() => setLayout("portrait")}
              style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: isPortrait ? "#2563eb" : "transparent", color: isPortrait ? "#fff" : "#475569", fontWeight: 600, cursor: "pointer", fontSize: 14 }}
            >
              Portrait Badge
            </button>
            <button
              onClick={() => setLayout("landscape")}
              style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: !isPortrait ? "#2563eb" : "transparent", color: !isPortrait ? "#fff" : "#475569", fontWeight: 600, cursor: "pointer", fontSize: 14 }}
            >
              Landscape Card
            </button>
          </div>

          {/* Actual Card */}
          <div className="printable-card" style={{
            width: isPortrait ? "2.12in" : "3.37in",
            height: isPortrait ? "3.37in" : "2.12in",
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            border: "1px solid #e5e7eb",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: isPortrait ? "column" : "row",
            fontFamily: "Inter, sans-serif"
          }}>
            {/* Top/Left Brand Header */}
            <div style={{
              background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
              color: "#fff",
              padding: isPortrait ? "16px 8px 32px" : "12px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: isPortrait ? "flex-start" : "center",
              width: isPortrait ? "100%" : "35%",
              height: isPortrait ? "35%" : "100%",
              boxSizing: "border-box",
            }}>
              <div style={{ fontWeight: 800, fontSize: isPortrait ? 13 : 11, letterSpacing: -0.5, lineHeight: 1.1, textTransform: "uppercase" }}>{COMPANY.name}</div>
            </div>

            {/* Photo Avatar placement */}
            <div style={{
              position: "absolute",
              width: 72, height: 72,
              borderRadius: "50%",
              border: "3px solid #fff",
              background: "#fff",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              top: isPortrait ? "24%" : "50%",
              left: isPortrait ? "50%" : "35%",
              transform: isPortrait ? "translateX(-50%)" : "translate(-50%, -50%)",
              zIndex: 10,
              overflow: "hidden"
            }}>
              <img src={photoUrl} alt="Photo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>

            {/* Identity Info */}
            <div style={{
              flex: 1, padding: isPortrait ? "32px 16px 12px" : "16px 16px 16px 36px",
              display: "flex", flexDirection: "column", alignItems: isPortrait ? "center" : "flex-start",
              justifyContent: "center", textAlign: isPortrait ? "center" : "left", boxSizing: "border-box"
            }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", marginBottom: 2 }}>{entity.name}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: badge.color, background: badge.bg, padding: "2px 8px", borderRadius: 4, marginBottom: 8, letterSpacing: 0.5 }}>{badge.text}</div>
              
              <div style={{ fontSize: 9, color: "#64748b", display: "grid", gap: 4, width: "100%", gridTemplateColumns: isPortrait ? "1fr" : "auto 1fr" }}>
                <div style={{ fontWeight: 600, color: "#94a3b8" }}>ID:</div>
                <div style={{ fontWeight: 700, color: "#334155" }}>{entity.agentId || entity.memberId || entity.id}</div>
                
                <div style={{ fontWeight: 600, color: "#94a3b8" }}>Ph:</div>
                <div style={{ fontWeight: 600, color: "#475569" }}>{entity.phone}</div>
                
                <div style={{ fontWeight: 600, color: "#94a3b8" }}>Aadhaar:</div>
                <div style={{ fontWeight: 600, color: "#475569" }}>{entity.aadhaar || "—"}</div>
              </div>

              {/* Bottom detail */}
              <div style={{ marginTop: "auto", width: "100%", borderTop: "1px dashed #e2e8f0", paddingTop: 8, textAlign: "center", fontSize: 7, color: "#94a3b8", fontWeight: 600 }}>
                IF FOUND RETURN TO BRANCH
              </div>
            </div>
          </div>

          <div className="no-print" style={{ 
            marginTop: 12, padding: "12px 16px", borderRadius: 8, background: "#fff7ed", color: "#c2410c", fontSize: 13, display: "flex", gap: 8, alignItems: "flex-start", maxWidth: 350
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <div>Ensure your printer settings are set to "Background graphics: ON" to print colors properly.</div>
          </div>

        </div>

        <div className="no-print" style={{ padding: "16px 24px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: 12, background: "#f8fafc" }}>
          <Btn label="Cancel" onClick={onClose} />
          <Btn label="Print ID Card" primary onClick={handlePrint} />
        </div>
      </div>
    </div>
  );
}
