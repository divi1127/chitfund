import { useState, useEffect } from "react";
import { createData } from "../utils/api";
import { fmt } from "../utils/helpers";
import { COMPANY } from "../utils/constants";
import { useAuth } from "../contexts/AuthContext";

export function PaymentModal({ member, group, scheme, installment, agentInfo, onClose, onSuccess }) {
  const { user } = useAuth();
  const [mode, setMode] = useState("");
  const [upiRef, setUpiRef] = useState("");
  const [upiProof, setUpiProof] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState("start");
  const [paymentType, setPaymentType] = useState("full");
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [existingCollection, setExistingCollection] = useState(null);

  const BLOCKS = 10;

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/collections`);
        const all = await res.json();
        const found = Array.isArray(all) ? all.find(c =>
          c.memberId === member.memberId &&
          c.groupId === group.id &&
          Number(c.installment) === Number(installment.month)
        ) : null;
        if (found) setExistingCollection(found);
      } catch (_) {}
    })();
  }, [member.memberId, group.id, installment.month]);

  const monthData = scheme?.monthlyAmounts?.find(m => m.month === installment.month)
    ?? { amount: 0, auctionAmount: 0 };
  const totalAmount = monthData.amount;
  const blockValue = totalAmount / BLOCKS;

  const paidAmount = existingCollection
    ? (existingCollection.partialPayments || []).filter(p => p.status === 'Paid').reduce((s, p) => s + (p.amount || 0), 0)
    : 0;
  const paidBlocks = Math.round(paidAmount / (blockValue || 1));
  const balanceAmount = Math.max(0, totalAmount - paidAmount);
  const isFullyPaid = existingCollection?.status === 'Paid' || (paidBlocks >= BLOCKS && totalAmount > 0);
  const hasPartialPayment = paidAmount > 0;

  const payAmount = paymentType === "parts"
    ? blockValue
    : paymentType === "balance"
      ? balanceAmount
      : totalAmount;

  const dueDate = (() => {
    const d = new Date(member.joined || new Date());
    d.setMonth(d.getMonth() + installment.month - 1);
    d.setDate(5);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  })();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setUpiProof(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handlePay = async () => {
    if (!mode) { setError("Select a payment mode"); return; }
    if (mode === "UPI" && !upiRef.trim()) { setError("Enter UPI reference / transaction ID"); return; }
    if (mode === "UPI" && !upiProof) { setError("Upload payment screenshot as proof"); return; }
    setError(""); setLoading(true);
    try {
      await createData("/collections/member-payment", {
        memberId: member.id,
        groupId: group.id,
        amount: payAmount,
        fullAmount: totalAmount,
        paymentType: paymentType === "parts" ? "parts" : "full",
        numParts: paymentType === "parts" ? BLOCKS : undefined,
        installment: installment.month,
        mode,
        date: new Date().toISOString().split("T")[0],
        upiRef: mode === "UPI" ? upiRef : undefined,
        upiProof: mode === "UPI" ? upiProof : undefined,
        status: mode === "UPI" ? "Paid" : "Pending",
      });
      setStep("success");
      onSuccess?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const overlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 };
  const card = { background: "#fff", borderRadius: 16, width: "100%", maxWidth: 540, maxHeight: "92vh", overflowY: "auto", boxShadow: "0 28px 64px rgba(0,0,0,.28)" };

  const InfoRow = ({ l, v, highlight }) => (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #f1f5f9", fontSize: 13 }}>
      <span style={{ color: "#64748b" }}>{l}</span>
      <span style={{ fontWeight: highlight ? 800 : 600, color: highlight ? "#1e40af" : "#0f172a", fontSize: highlight ? 15 : 13 }}>{v}</span>
    </div>
  );

  if (step === "success") {
    const isNowFullyPaid = paymentType !== "parts" || payAmount >= balanceAmount || isFullyPaid;
    const newPaidAmount = isNowFullyPaid ? totalAmount : paidAmount + payAmount;
    const newBalance = Math.max(0, totalAmount - newPaidAmount);
    return (
      <div style={overlay}>
        <div style={{ ...card, padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>
            {isNowFullyPaid ? "✅" : "✅"}
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>
            {isNowFullyPaid
              ? "Installment Paid Successfully"
              : "Payment Recorded!"}
          </div>
          <div style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7, marginBottom: 28 }}>
            {isNowFullyPaid
              ? <>All {BLOCKS} blocks have been paid for <strong>Month {installment.month}</strong>.</>
              : <>Payment of <strong>{fmt(payAmount)}</strong> for <strong>Month {installment.month}</strong> submitted.<br />{mode === "UPI" ? "Receipt will be available once verified." : "Status will change to <strong>Paid</strong> once admin approves."}</>
            }
          </div>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 24 }}>
            <div style={{ background: "#f0fdf4", borderRadius: 10, padding: "12px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "#16a34a", fontWeight: 600 }}>Paid Amount</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#15803d" }}>{fmt(newPaidAmount)}</div>
            </div>
            <div style={{ background: "#fef2f2", borderRadius: 10, padding: "12px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "#ef4444", fontWeight: 600 }}>Balance</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#dc2626" }}>{fmt(newBalance)}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ padding: "12px 32px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
            Done
          </button>
        </div>
      </div>
    );
  }

  const buttons = (() => {
    if (isFullyPaid) {
      return {
        left: { label: "Paid ✅", disabled: true, action: null },
        right: { label: "Completed", disabled: true, action: null },
      };
    }
    if (hasPartialPayment) {
      return {
        left: { label: `Pay Balance Amount ${fmt(balanceAmount)}`, action: "balance" },
        right: { label: "Continue Part Payment", action: "parts" },
      };
    }
    return {
      left: { label: `Pay Full Amount ${fmt(totalAmount)}`, action: "full" },
      right: { label: "Pay in Parts", action: "parts" },
    };
  })();

  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={card}>
        <div style={{ background: "linear-gradient(135deg,#1e3a8a,#2563eb)", padding: "20px 24px", borderRadius: "16px 16px 0 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 17 }}>{COMPANY.name}</div>
            <div style={{ color: "rgba(255,255,255,.65)", fontSize: 12, marginTop: 2 }}>Monthly Installment Payment</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,.15)", border: "none", color: "#fff", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>

        <div style={{ padding: 24 }}>
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
            {user?.role === 'agent' ? (
              <>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#16a34a", letterSpacing: 1.2, marginBottom: 10 }}>AGENT DETAILS</div>
                <InfoRow l="Name" v={agentInfo?.name || member.name} />
                <InfoRow l="Agent ID" v={agentInfo?.agentId || member.agentId || "—"} />
                {agentInfo?.phone && <InfoRow l="Phone" v={agentInfo.phone} />}
                {agentInfo?.branch && <InfoRow l="Branch" v={agentInfo.branch} />}
                <InfoRow l="Group" v={group.name} />
                <InfoRow l="Scheme" v={scheme.name} />
              </>
            ) : (
              <>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#16a34a", letterSpacing: 1.2, marginBottom: 10 }}>CUSTOMER DETAILS</div>
                <InfoRow l="Name" v={member.name} />
                <InfoRow l="Member ID" v={member.memberId} />
                {member.phone && <InfoRow l="Phone" v={member.phone} />}
                {member.email && <InfoRow l="Email" v={member.email} />}
                {member.address && <InfoRow l="Address" v={member.address} />}
                <InfoRow l="Group" v={group.name} />
                <InfoRow l="Scheme" v={scheme.name} />
              </>
            )}
          </div>

          <div style={{ background: "#f8fafc", borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", letterSpacing: 1.2, marginBottom: 10 }}>INVOICE DETAILS</div>
            <InfoRow l="Installment" v={`Month ${installment.month} of ${scheme.duration}`} />
            <InfoRow l="Due Date" v={dueDate} />
          </div>

          <div style={{ background: "linear-gradient(135deg,#eff6ff,#dbeafe)", border: "1px solid #bfdbfe", borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, textAlign: "center" }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#3b82f6", letterSpacing: 0.5, marginBottom: 4 }}>Total Installment</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#1e40af" }}>{fmt(totalAmount)}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#16a34a", letterSpacing: 0.5, marginBottom: 4 }}>Paid Amount</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#15803d" }}>{fmt(paidAmount)}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#ef4444", letterSpacing: 0.5, marginBottom: 4 }}>Balance Amount</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#dc2626" }}>{fmt(balanceAmount)}</div>
              </div>
            </div>
          </div>

          {!isFullyPaid && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 10 }}>
                {[buttons.left, buttons.right].map((btn, idx) => (
                  <button key={idx} onClick={() => {
                    if (!btn.disabled && btn.action) {
                      setPaymentType(btn.action);
                      if (btn.action === "full" || btn.action === "balance") {
                        setStep("pay");
                      } else {
                        setSelectedBlock(null);
                      }
                    }
                  }}
                    disabled={btn.disabled}
                    style={{
                      flex: 1, padding: "12px 8px", borderRadius: 10,
                      border: `2px solid ${paymentType === btn.action && step === "start" ? "#2563eb" : btn.disabled ? "#d1d5db" : "#e2e8f0"}`,
                      background: btn.disabled ? "#f3f4f6"
                        : paymentType === btn.action && step === "start" ? "#eff6ff"
                        : "#fff",
                      color: btn.disabled ? "#9ca3af"
                        : paymentType === btn.action && step === "start" ? "#1e40af"
                        : "#374151",
                      fontWeight: 700, fontSize: 12, cursor: btn.disabled ? "not-allowed" : "pointer",
                      opacity: btn.disabled ? 0.6 : 1
                    }}>
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isFullyPaid && (
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: 16, textAlign: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#16a34a" }}>✅ This Month's Installment Completed</div>
              <div style={{ fontSize: 13, color: "#15803d", marginTop: 4 }}>All {BLOCKS} blocks have been paid successfully.</div>
            </div>
          )}

          {step === "start" && (
            <>
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: 14, marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 12 }}>
                  Payment Blocks
                  {!isFullyPaid && paymentType === "parts" && (
                    <span style={{ color: "#2563eb", marginLeft: 8, fontSize: 11, fontWeight: 400 }}>Select a block to pay</span>
                  )}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
                  {Array.from({ length: BLOCKS }, (_, i) => {
                    const isBlockPaid = i < paidBlocks;
                    const isBlockSelected = selectedBlock === i;
                    let bg, borderColor, textColor, cursor, content;
                    if (isBlockPaid) {
                      bg = "#16a34a";
                      borderColor = "#16a34a";
                      textColor = "#fff";
                      cursor = "default";
                      content = "✓";
                    } else if (isBlockSelected && paymentType === "parts") {
                      bg = "#2563eb";
                      borderColor = "#2563eb";
                      textColor = "#fff";
                      cursor = "pointer";
                      content = String(i + 1);
                    } else if (paymentType === "parts" && !isFullyPaid) {
                      bg = "#fff";
                      borderColor = "#e2e8f0";
                      textColor = "#374151";
                      cursor = "pointer";
                      content = String(i + 1);
                    } else {
                      bg = "#f8fafc";
                      borderColor = "#e2e8f0";
                      textColor = "#94a3b8";
                      cursor = "default";
                      content = String(i + 1);
                    }
                    return (
                      <button key={i} onClick={() => {
                        if (!isBlockPaid && !isFullyPaid && paymentType === "parts") {
                          setSelectedBlock(selectedBlock === i ? null : i);
                        }
                      }}
                        disabled={isBlockPaid || isFullyPaid || paymentType !== "parts"}
                        style={{
                          width: "100%", height: 40, borderRadius: 8,
                          border: `2px solid ${borderColor}`,
                          background: bg,
                          color: textColor,
                          fontWeight: 700, fontSize: 14,
                          cursor: isBlockPaid || paymentType !== "parts" ? "default" : "pointer",
                          transition: "all 0.15s",
                          display: "flex", alignItems: "center", justifyContent: "center"
                        }}>
                        {content}
                      </button>
                    );
                  })}
                </div>
                <div style={{ marginTop: 10, background: "#eff6ff", borderRadius: 8, padding: "10px 14px", fontSize: 13 }}>
                  <span style={{ color: "#64748b" }}>Each block </span>
                  <strong style={{ color: "#1e40af", fontSize: 15 }}>{fmt(blockValue)}</strong>
                  <span style={{ color: "#64748b" }}> · {paidBlocks} of {BLOCKS} blocks paid</span>
                </div>
              </div>

              {(paymentType === "full" || paymentType === "balance" || selectedBlock !== null) && !isFullyPaid && (
                <button onClick={() => setStep("pay")}
                  style={{ width: "100%", padding: 14, background: "#2563eb", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                  Proceed to Pay {fmt(payAmount)} →
                </button>
              )}
            </>
          )}

          {step === "pay" && (
            <>
              <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: 14, textAlign: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#3b82f6", letterSpacing: 0.5 }}>AMOUNT TO PAY</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#1e40af", marginTop: 4 }}>{fmt(payAmount)}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                  {paymentType === "parts" ? `Block ${selectedBlock + 1} of ${BLOCKS}` : `Remaining balance of Month ${installment.month}`}
                </div>
              </div>

              <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 10 }}>Choose Payment Mode</div>
              <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
                {[["UPI", "📱 UPI / Online"], ["Cash", "💵 Cash"]].map(([val, lbl]) => (
                  <button key={val} onClick={() => { setMode(val); setError(""); }}
                    style={{ flex: 1, padding: "13px 8px", borderRadius: 10, border: `2px solid ${mode === val ? "#2563eb" : "#e2e8f0"}`, background: mode === val ? "#eff6ff" : "#fff", color: mode === val ? "#1e40af" : "#374151", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                    {lbl}
                  </button>
                ))}
              </div>

              {mode === "UPI" && (
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: 16, marginBottom: 14 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#166534", marginBottom: 12 }}>Pay to any UPI ID below</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
                    {[["Google Pay", COMPANY.googlePay], ["PhonePe", COMPANY.phonePe], ["Paytm", COMPANY.paytm], ["UPI ID", COMPANY.upiId]].map(([l, v]) => (
                      <div key={l} style={{ background: "#fff", borderRadius: 8, padding: "9px 12px", border: "1px solid #d1fae5" }}>
                        <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 2 }}>{l}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>UPI Reference / Transaction ID *</label>
                    <input value={upiRef} onChange={e => setUpiRef(e.target.value)} placeholder="Enter UTR / Txn ID after payment"
                      style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13, boxSizing: "border-box", outline: "none" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Upload Payment Screenshot (Proof) *</label>
                    <input type="file" accept="image/*" onChange={handleFile}
                      style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 8, padding: 8, fontSize: 12, boxSizing: "border-box" }} />
                    {upiProof && (
                      <img src={upiProof} alt="proof" style={{ marginTop: 10, width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 8, border: "1px solid #bbf7d0" }} />
                    )}
                  </div>
                </div>
              )}

              {mode === "Cash" && (
                <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: 16, marginBottom: 14 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#92400e", marginBottom: 8 }}>💵 Cash Payment Instructions</div>
                  <div style={{ fontSize: 13, color: "#78350f", lineHeight: 1.75 }}>{COMPANY.cashInstructions}</div>
                  <div style={{ marginTop: 12, background: "#fef3c7", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#92400e", fontWeight: 600, display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span>⚠️</span>
                    <span>Your payment will show as <strong>Pending</strong> until the admin verifies and approves the cash payment.</span>
                  </div>
                </div>
              )}

              {error && (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", marginBottom: 12, fontSize: 13, color: "#dc2626" }}>
                  {error}
                </div>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button onClick={() => { setStep("start"); setError(""); setMode(""); }}
                  style={{ flex: 1, padding: 12, background: "#f1f5f9", color: "#374151", border: "1px solid #e2e8f0", borderRadius: 10, fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
                  ← Back
                </button>
                <button onClick={handlePay} disabled={loading || !mode}
                  style={{ flex: 2, padding: 12, background: loading || !mode ? "#9ca3af" : "#2563eb", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, cursor: loading || !mode ? "not-allowed" : "pointer", fontSize: 13 }}>
                  {loading ? "Processing..." : mode === "Cash" ? "Submit Cash Request" : "Confirm UPI Payment"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
