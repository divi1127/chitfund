import { useState, useRef } from "react";
import { Btn } from "./Btn";
import { Input } from "./Input";
import { Badge } from "./Badge";
import { COMPANY } from "../utils/constants";
import { logo } from "../assets";
import { QRCodeCanvas } from "qrcode.react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export function InvoiceModal({ invoice, onClose, onPaymentSuccess, toast }) {
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [processing, setProcessing] = useState(false);
  const fileRef = useRef(null);
  const contentRef = useRef(null);

  const handleDownloadPdf = async () => {
    if (!contentRef.current) return;
    try {
      toast.add("Generating PDF...");
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff"
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`${invoice.invoiceNumber || "document"}.pdf`);
      toast.add("PDF downloaded!", "success");
    } catch (err) {
      toast.add("Failed to generate PDF: " + err.message, "error");
    }
  };

  if (!invoice) return null;

  const isDigital = paymentMethod !== "Cash";

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProofFile(file);
    const reader = new FileReader();
    reader.onload = () => setProofPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const getToken = () => localStorage.getItem("token");

  const handleConfirmPayment = async () => {
    if (isDigital && !referenceNumber) {
      toast.add("Please enter a transaction ID / reference number", "error");
      return;
    }
    if (isDigital && !proofFile) {
      toast.add("Please upload a payment screenshot as proof", "error");
      return;
    }
    setProcessing(true);
    try {
      let proofUrl = "";
      if (isDigital && proofFile) {
        const formData = new FormData();
        formData.append("file", proofFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${getToken()}` },
          body: formData,
        });
        if (!uploadRes.ok) throw new Error("Screenshot upload failed");
        const uploadData = await uploadRes.json();
        proofUrl = uploadData.url;
      }

      const updateBody = {
        paymentMethod:
          paymentMethod === "Bank Transfer"
            ? "Bank"
            : paymentMethod === "Online Payment"
              ? "Online"
              : paymentMethod,
        referenceNumber,
        amountPaid: invoice.totalPayable,
        balance: 0,
        totalPaid: (invoice.totalPaid || 0) + invoice.totalPayable,
        paidInstallments: (invoice.paidInstallments || 0) + 1,
        paymentProof: proofUrl,
        updatedAt: new Date(),
      };

      if (paymentMethod === "Cash") {
        updateBody.status = "Pending";
        updateBody.remarks = "Cash payment submitted, awaiting confirmation";
      } else {
        updateBody.status = "Proof Submitted";
        updateBody.remarks = "Payment proof uploaded, awaiting admin approval";
      }

      const response = await fetch(`/api/invoices/${invoice._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(updateBody),
      });

      if (!response.ok) throw new Error("Payment submission failed");

      toast.add(
        paymentMethod === "Cash"
          ? "Cash payment noted! Admin will confirm shortly."
          : "Payment proof submitted! Awaiting admin approval.",
        "success"
      );
      if (onPaymentSuccess) onPaymentSuccess();
      onClose();
    } catch (error) {
      toast.add("Error: " + error.message, "error");
    } finally {
      setProcessing(false);
    }
  };

  const isReceipt = invoice.status === "Paid";

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 2000
    }}>
      <div ref={contentRef} style={{
        background: "#fff", borderRadius: 16, width: "95%", maxWidth: 800,
        maxHeight: "95vh", overflowY: "auto", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
        border: "2px solid #2563eb", display: "flex", flexDirection: "column"
      }}>
        {/* Orange Header */}
        <div style={{
          background: "linear-gradient(135deg, #ea580c, #c2410c)", padding: "20px 28px",
          display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <img src={logo} alt="HR" style={{ height: 44, borderRadius: 8 }} />
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>{COMPANY.name}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>{COMPANY.address}</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "0.05em" }}>
              {isReceipt ? "RECEIPT" : "INVOICE"}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.85)", marginTop: 2 }}>
              #{invoice.invoiceNumber}
            </div>
          </div>
          <button onClick={onClose} style={{
            position: "absolute", top: 16, right: 16,
            background: "rgba(255,255,255,0.2)", border: "none", cursor: "pointer",
            fontSize: 18, color: "#fff", width: 32, height: 32, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>×</button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px 28px" }}>
          {/* Paid status banner for receipt */}
          {isReceipt && (
            <div style={{
              background: "#dcfce7", borderRadius: 10, padding: "12px 16px",
              border: "1px solid #10b981", marginBottom: 20, textAlign: "center"
            }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#065f46" }}>PAID ✓</div>
              <div style={{ fontSize: 12, color: "#065f46", marginTop: 2 }}>
                Paid on {new Date(invoice.updatedAt || invoice.date).toLocaleDateString("en-IN")}
              </div>
            </div>
          )}

          {/* Member Details + Scheme/Group — side by side */}
          <div className="inv-grid" style={{ display: "grid", gap: 16, marginBottom: 24 }}>
          <style>{`@media (min-width: 640px) { .inv-grid { grid-template-columns: 1fr 1fr !important; } }`}</style>
            <div style={{ border: "1.5px solid #2563eb", borderRadius: 12, padding: 16, background: "#f8faff" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Member Details</div>
              <div style={{ marginBottom: 4 }}><span style={{ fontSize: 11, color: "#64748b" }}>Name</span><div style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>{invoice.memberName}</div></div>
              <div style={{ marginBottom: 4 }}><span style={{ fontSize: 11, color: "#64748b" }}>Member ID</span><div style={{ fontSize: 13, color: "#111" }}>{invoice.memberId}</div></div>
              <div><span style={{ fontSize: 11, color: "#64748b" }}>Mobile</span><div style={{ fontSize: 13, color: "#111" }}>{invoice.memberMobile}</div></div>
            </div>
            <div style={{ border: "1.5px solid #ea580c", borderRadius: 12, padding: 16, background: "#fffaf5" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#ea580c", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Chit Details</div>
              <div style={{ marginBottom: 4 }}><span style={{ fontSize: 11, color: "#64748b" }}>Scheme</span><div style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>{invoice.chitName}</div></div>
              <div style={{ marginBottom: 4 }}><span style={{ fontSize: 11, color: "#64748b" }}>Group</span><div style={{ fontSize: 13, color: "#111" }}>{invoice.chitGroup}</div></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 12px" }}>
                <div><span style={{ fontSize: 11, color: "#64748b" }}>Installment</span><div style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>#{invoice.currentMonth || 1}</div></div>
                <div><span style={{ fontSize: 11, color: "#64748b" }}>Date</span><div style={{ fontSize: 13, color: "#111" }}>{new Date(invoice.date).toLocaleDateString("en-IN")}</div></div>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
              Payment Summary
            </div>
            <div style={{ border: "1.5px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 16px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: 13, color: "#475569" }}>Installment #{invoice.currentMonth || 1}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>₹{invoice.installmentAmount?.toLocaleString()}</span>
              </div>
              {invoice.previousDue > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 16px", background: "#fef2f2", borderBottom: "1px solid #e2e8f0" }}>
                  <span style={{ fontSize: 13, color: "#991b1b" }}>Previous Due</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#dc2626" }}>₹{invoice.previousDue?.toLocaleString()}</span>
                </div>
              )}
              <div style={{
                display: "flex", justifyContent: "space-between",
                padding: "14px 16px", background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "#fff"
              }}>
                <span style={{ fontSize: 15, fontWeight: 700 }}>Total Payable</span>
                <span style={{ fontSize: 18, fontWeight: 800 }}>₹{invoice.totalPayable?.toLocaleString()}</span>
              </div>
              {isReceipt && (
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  padding: "12px 16px", background: "#ecfdf5"
                }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#065f46" }}>Amount Paid</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#10b981" }}>₹{(invoice.amountPaid || invoice.totalPayable)?.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Method Selection (only for pending/rejected) */}
          {(invoice.status === "Pending" || invoice.status === "Rejected") && (
            <div>
              {invoice.status === "Rejected" && (
                <div style={{ background: "#fef2f2", padding: 14, borderRadius: 10, border: "1px solid #fecaca", marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#dc2626", marginBottom: 2 }}>Payment Rejected</div>
                  <div style={{ fontSize: 12, color: "#991b1b" }}>{invoice.paymentNote || "Please resubmit with correct proof."}</div>
                </div>
              )}

              <div style={{ fontSize: 11, fontWeight: 700, color: "#ea580c", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
                Select Payment Method
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10, marginBottom: 20 }}>
                {["Cash", "UPI", "Bank Transfer", "Online Payment"].map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    style={{
                      padding: "12px 8px", borderRadius: 10,
                      border: paymentMethod === method ? "2px solid #2563eb" : "1.5px solid #e2e8f0",
                      background: paymentMethod === method ? "rgba(37,99,235,0.08)" : "#fff",
                      color: paymentMethod === method ? "#2563eb" : "#64748b",
                      cursor: "pointer", textAlign: "center", fontWeight: 700, fontSize: 12,
                      transition: "all 0.2s"
                    }}
                  >
                    {method}
                  </button>
                ))}
              </div>

              <div style={{ background: "#f8fafc", padding: 20, borderRadius: 12, border: "1.5px dashed #2563eb" }}>
                {paymentMethod === "UPI" && (
                  <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ background: "#fff", padding: 10, borderRadius: 10 }}>
                      <QRCodeCanvas
                        value={`upi://pay?pa=${COMPANY.upiId || "company@upi"}&pn=${COMPANY.name}&am=${invoice.totalPayable}&cu=INR`}
                        size={130} level="H"
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#2563eb", marginBottom: 6 }}>Pay via UPI</div>
                      <div style={{ fontSize: 12, marginBottom: 12, color: "#475569" }}>Scan QR or use ID below</div>
                      <div style={{ background: "#fff", padding: "8px 12px", borderRadius: 8, fontSize: 13, fontWeight: 700, border: "1px solid #e2e8f0" }}>
                        {COMPANY.upiId || "company@upi"}
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === "Bank Transfer" && (
                  <div className="bank-grid" style={{ display: "grid", gap: 12 }}>
                    <style>{`@media (min-width: 640px) { .bank-grid { grid-template-columns: 1fr 1fr !important; } }`}</style>
                    <div><span style={{ fontSize: 11, color: "#64748b" }}>Bank</span><div style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>{COMPANY.bankName || "State Bank of India"}</div></div>
                    <div><span style={{ fontSize: 11, color: "#64748b" }}>Account Name</span><div style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>{COMPANY.accountName || COMPANY.name}</div></div>
                    <div><span style={{ fontSize: 11, color: "#64748b" }}>Account No.</span><div style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>{COMPANY.accountNumber || "123456789012"}</div></div>
                    <div><span style={{ fontSize: 11, color: "#64748b" }}>IFSC</span><div style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>{COMPANY.ifscCode || "SBIN0001234"}</div></div>
                  </div>
                )}

                {paymentMethod === "Cash" && (
                  <div style={{ textAlign: "center", padding: "8px 0" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#ea580c" }}>Cash Payment</div>
                    <div style={{ fontSize: 12, color: "#475569", marginTop: 6 }}>Pay at our office. Admin will confirm after collection.</div>
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>{COMPANY.address}</div>
                  </div>
                )}

                {paymentMethod === "Online Payment" && (
                  <div style={{ textAlign: "center", padding: "8px 0" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#2563eb" }}>Online Payment Gateway</div>
                    <div style={{ fontSize: 12, color: "#475569", marginTop: 6 }}>Pay via Credit/Debit card or Netbanking.</div>
                  </div>
                )}

                {isDigital && (
                  <div style={{ marginTop: 16 }}>
                    <Input label="Transaction ID / Reference Number *" value={referenceNumber} onChange={setReferenceNumber} placeholder="Enter payment reference ID" />
                  </div>
                )}

                {isDigital && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Upload Payment Screenshot / Proof *</div>
                    <div onClick={() => fileRef.current?.click()} style={{
                      border: "2px dashed #cbd5e1", borderRadius: 10, padding: 20,
                      textAlign: "center", cursor: "pointer", background: proofPreview ? "#fff" : "transparent"
                    }}>
                      {proofPreview ? (
                        <div>
                          <img src={proofPreview} alt="Proof" style={{ maxHeight: 160, maxWidth: "100%", borderRadius: 8, marginBottom: 6 }} />
                          <div style={{ fontSize: 11, color: "#2563eb" }}>Click to change</div>
                        </div>
                      ) : (
                        <div style={{ color: "#94a3b8" }}>
                          <div style={{ fontSize: 24, marginBottom: 4 }}>📷</div>
                          <div style={{ fontWeight: 600, fontSize: 12 }}>Tap to upload screenshot</div>
                          <div style={{ fontSize: 11, marginTop: 2 }}>JPG, PNG, WEBP (max 5MB)</div>
                        </div>
                      )}
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleFileSelect} style={{ display: "none" }} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Proof Submitted status */}
          {invoice.status === "Proof Submitted" && (
            <div style={{ background: "#fefce8", padding: 20, borderRadius: 12, border: "1px solid #eab308", textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#854d0e" }}>AWAITING APPROVAL</div>
              <div style={{ fontSize: 12, color: "#854d0e", marginTop: 4 }}>Your payment proof has been submitted. Admin will review shortly.</div>
              {invoice.paymentProof && (
                <img src={invoice.paymentProof} alt="Uploaded proof" style={{ maxHeight: 160, maxWidth: "100%", borderRadius: 8, marginTop: 12 }} />
              )}
            </div>
          )}

          {/* Rejected status */}
          {invoice.status === "Rejected" && (
            <div style={{ background: "#fef2f2", padding: 20, borderRadius: 12, border: "1px solid #fecaca", textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#991b1b" }}>PAYMENT REJECTED</div>
              <div style={{ fontSize: 12, color: "#991b1b", marginTop: 4 }}>{invoice.paymentNote || "Please resubmit with correct proof."}</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: "16px 28px", borderTop: "1.5px solid #e2e8f0",
          background: "#f8fafc", display: "flex", gap: 12
        }}>
          {invoice.status === "Pending" || invoice.status === "Rejected" ? (
            <>
              <Btn label={processing ? "Submitting..." : "Submit Payment"} onClick={handleConfirmPayment} primary disabled={processing} style={{ flex: 2, borderRadius: 10 }} />
              <Btn label="Cancel" onClick={onClose} style={{ flex: 1, borderRadius: 10 }} />
            </>
          ) : (
            <>
              {isReceipt && <Btn label="Download PDF" onClick={handleDownloadPdf} primary style={{ flex: 1, borderRadius: 10 }} />}
              {!isReceipt && <Btn label="Download PDF" onClick={handleDownloadPdf} primary style={{ flex: 1, borderRadius: 10 }} />}
              <Btn label="Close" onClick={onClose} style={{ flex: 1, borderRadius: 10 }} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
