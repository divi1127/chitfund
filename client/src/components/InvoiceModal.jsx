import React, { useState, useRef } from 'react';
import { Btn } from './Btn';
import { Input } from './Input';
import { Badge } from './Badge';
import { COMPANY } from '../utils/constants';
import { QRCodeCanvas } from 'qrcode.react';
import { HiUser, HiCube, HiCurrencyRupee, HiCheckCircle, HiXCircle } from "react-icons/hi2";

export function InvoiceModal({ invoice, onClose, onPaymentSuccess, toast }) {
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [processing, setProcessing] = useState(false);
  const fileRef = useRef(null);
  const dark = typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark';

  if (!invoice) return null;

  const isDigital = paymentMethod !== 'Cash';

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
      toast.add('Please enter a transaction ID / reference number', 'error');
      return;
    }
    if (isDigital && !proofFile) {
      toast.add('Please upload a payment screenshot as proof', 'error');
      return;
    }

    setProcessing(true);
    try {
      let proofUrl = '';

      // Upload screenshot first if digital payment
      if (isDigital && proofFile) {
        const formData = new FormData();
        formData.append('file', proofFile);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${getToken()}` },
          body: formData
        });
        if (!uploadRes.ok) throw new Error('Screenshot upload failed');
        const uploadData = await uploadRes.json();
        proofUrl = uploadData.url;
      }

      const updateBody = {
        paymentMethod: paymentMethod === 'Bank Transfer' ? 'Bank' : paymentMethod === 'Online Payment' ? 'Online' : paymentMethod,
        referenceNumber: referenceNumber,
        amountPaid: invoice.totalPayable,
        balance: 0,
        totalPaid: (invoice.totalPaid || 0) + invoice.totalPayable,
        paidInstallments: (invoice.paidInstallments || 0) + 1,
        paymentProof: proofUrl,
        updatedAt: new Date()
      };

      if (paymentMethod === 'Cash') {
        // Cash — mark as Pending, admin will approve
        updateBody.status = 'Pending';
        updateBody.remarks = 'Cash payment submitted, awaiting confirmation';
      } else {
        // Digital — mark as Proof Submitted
        updateBody.status = 'Proof Submitted';
        updateBody.remarks = 'Payment proof uploaded, awaiting admin approval';
      }

      const response = await fetch(`/api/invoices/${invoice._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(updateBody)
      });

      if (!response.ok) throw new Error('Payment submission failed');

      toast.add(paymentMethod === 'Cash' ? 'Cash payment noted! Admin will confirm shortly.' : 'Payment proof submitted! Awaiting admin approval.', 'success');
      if (onPaymentSuccess) onPaymentSuccess();
      onClose();
    } catch (error) {
      toast.add('Error: ' + error.message, 'error');
    } finally {
      setProcessing(false);
    }
  };

  const modalStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.75)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
    backdropFilter: "blur(8px)"
  };

  const contentStyle = {
    background: dark ? "#1a1a2e" : "#fff",
    borderRadius: 20,
    width: "95%",
    maxWidth: 800,
    maxHeight: "95vh",
    overflowY: "auto",
    padding: 0,
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
    border: "1px solid var(--border-color)",
    position: "relative",
    color: "var(--text-primary)",
    display: "flex",
    flexDirection: "column"
  };

  const headerStyle = {
    background: dark ? "rgba(37, 99, 235, 0.15)" : "linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)",
    padding: "28px 32px",
    borderBottom: "1px solid var(--border-color)",
    position: "sticky",
    top: 0,
    zIndex: 10
  };

  const bodyStyle = {
    padding: "28px 32px"
  };

  const footerStyle = {
    padding: "20px 32px",
    background: "var(--bg-card-alt)",
    borderTop: "1px solid var(--border-color)",
    display: "flex",
    gap: 12,
    position: "sticky",
    bottom: 0,
    zIndex: 10
  };

  const sectionHeader = {
    fontSize: 13,
    fontWeight: 700,
    color: "#2563eb",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: 14,
    display: "flex",
    alignItems: "center",
    gap: 8
  };

  const gridRow = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
    marginBottom: 28
  };

  const dataItem = (label, value, isBold = false) => (
    <div style={{ marginBottom: 6 }}>
      <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: isBold ? 700 : 500 }}>{value}</div>
    </div>
  );

  return (
    <div style={modalStyle}>
      <div style={contentStyle}>
        {/* Header */}
        <div style={{
          ...headerStyle,
          borderBottom: "3px solid #2563eb",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {COMPANY.logo && <img src={COMPANY.logo} alt="Logo" style={{ height: 50, width: 50, objectFit: "contain" }} />}
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#2563eb", lineHeight: 1 }}>{COMPANY.name}</div>
                <div style={{ fontSize: 13, marginTop: 4, opacity: 0.8 }}>{COMPANY.address}</div>
                <div style={{ fontSize: 12, marginTop: 2, opacity: 0.6 }}>{COMPANY.phone} | {COMPANY.email}</div>
                {COMPANY.gstin && <div style={{ fontSize: 12, marginTop: 2, opacity: 0.6 }}>GSTIN: {COMPANY.gstin}</div>}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "0.05em" }}>INVOICE</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#2563eb", marginTop: 4 }}>#{invoice.invoiceNumber}</div>
              <div style={{ marginTop: 8 }}>
                <Badge text={invoice.status} color={invoice.status === 'Paid' ? 'green' : (invoice.status === 'Pending' ? 'yellow' : 'red')} />
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", cursor: "pointer", fontSize: 24, color: "var(--text-primary)", opacity: 0.5 }}>×</button>
        </div>

        <div style={bodyStyle}>
          {/* Member & Group Info */}
          <div style={gridRow}>
            <div style={{
              background: "var(--bg-card)",
              padding: 20,
              borderRadius: 16,
              border: "2px solid #2563eb",
              boxShadow: "0 2px 8px rgba(37, 99, 235, 0.08)",
            }}>
              <div style={sectionHeader}><HiUser size={14} /> Member Details</div>
              {dataItem("NAME", invoice.memberName, true)}
              {dataItem("MEMBER ID", invoice.memberId)}
              {dataItem("MOBILE", invoice.memberMobile)}
            </div>
            <div style={{
              background: "var(--bg-card)",
              padding: 20,
              borderRadius: 16,
              border: "2px solid #ea580c",
              boxShadow: "0 2px 8px rgba(234, 88, 12, 0.08)",
            }}>
              <div style={sectionHeader}><HiCube size={14} /> Chit Group & Scheme</div>
              {dataItem("GROUP NAME", invoice.chitGroup, true)}
              {dataItem("SCHEME NAME", invoice.chitName)}
              {dataItem("DATE", new Date(invoice.date).toLocaleDateString())}
              {dataItem("DUE DATE", new Date(invoice.dueDate).toLocaleDateString())}
            </div>
          </div>

          {/* Amount Calculation */}
          <div style={{ marginBottom: 32 }}>
            <div style={sectionHeader}><HiCurrencyRupee size={14} /> Payment Summary</div>
            <div style={{
              display: "grid",
              gap: 1,
              border: "2px solid #e2e8f0",
              borderRadius: 12,
              overflow: "hidden",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", background: "var(--bg-card-alt)" }}>
                <span style={{ fontSize: 14 }}>Installment Number:</span>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{invoice.currentMonth || 1}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", background: "var(--bg-card)" }}>
                <span style={{ fontSize: 14 }}>Monthly Installment Amount:</span>
                <span style={{ fontSize: 14, fontWeight: 700 }}>₹{invoice.installmentAmount?.toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", background: "var(--bg-card-alt)" }}>
                <span style={{ fontSize: 14 }}>Previous Due:</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#ef4444" }}>₹{invoice.previousDue?.toLocaleString() || '0'}</span>
              </div>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "20px 16px",
                background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                color: "#fff",
              }}>
                <span style={{ fontSize: 18, fontWeight: 700 }}>Total Payable Amount:</span>
                <span style={{ fontSize: 22, fontWeight: 800 }}>₹{invoice.totalPayable?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          {(invoice.status === 'Pending' || invoice.status === 'Rejected') && (
            <div>
              {invoice.status === 'Rejected' && (
                <div style={{ background: "#fef2f2", padding: 16, borderRadius: 12, border: "1px solid #fecaca", marginBottom: 20 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#dc2626", marginBottom: 4 }}>⚠ Payment Rejected</div>
                  <div style={{ fontSize: 13, color: "#991b1b" }}>{invoice.paymentNote || 'Your previous payment was rejected. Please resubmit with correct proof.'}</div>
                </div>
              )}
              <div style={sectionHeader}>💳 Select Payment Method</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 24 }}>
                {['Cash', 'UPI', 'Bank Transfer', 'Online Payment'].map(method => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    style={{
                      padding: "16px 8px",
                      borderRadius: 12,
                      border: paymentMethod === method ? "2px solid #2563eb" : "1px solid var(--border-color)",
                      background: paymentMethod === method ? "rgba(37, 99, 235, 0.15)" : "transparent",
                      color: paymentMethod === method ? "var(--text-primary)" : "var(--text-muted)",
                      cursor: "pointer",
                      textAlign: "center",
                      transition: "all 0.2s",
                      fontWeight: 700,
                      fontSize: 13
                    }}
                  >
                    {method}
                  </button>
                ))}
              </div>

              <div style={{ background: "var(--bg-card-alt)", padding: 24, borderRadius: 16, border: "1px dashed #2563eb" }}>
                {paymentMethod === 'UPI' && (
                  <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ background: "#fff", padding: 12, borderRadius: 12 }}>
                      <QRCodeCanvas value={`upi://pay?pa=${COMPANY.upiId || 'company@upi'}&pn=${COMPANY.name}&am=${invoice.totalPayable}&cu=INR`} size={140} level="H" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#2563eb", marginBottom: 8 }}>Pay via UPI</div>
                      <div style={{ fontSize: 13, marginBottom: 16, opacity: 0.8 }}>Scan the QR code or use the ID below to pay via any UPI app like GPay, PhonePe, or Paytm.</div>
                      <div style={{ background: "var(--bg-card-alt)", padding: "8px 12px", borderRadius: 8, fontSize: 14, fontWeight: 700 }}>
                        UPI ID: {COMPANY.upiId || 'company@upi'}
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'Bank Transfer' && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    {dataItem("BANK NAME", COMPANY.bankName || "State Bank of India")}
                    {dataItem("ACCOUNT NAME", COMPANY.accountName || COMPANY.name)}
                    {dataItem("ACCOUNT NUMBER", COMPANY.accountNumber || "123456789012")}
                    {dataItem("IFSC CODE", COMPANY.ifscCode || "SBIN0001234")}
                  </div>
                )}

                {paymentMethod === 'Cash' && (
                  <div style={{ textAlign: "center", padding: "10px 0" }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#2563eb" }}>Cash Payment</div>
                    <div style={{ fontSize: 13, marginTop: 8, opacity: 0.8 }}>Please pay the total amount at our office counter. Your payment will be confirmed by the admin after collection.</div>
                  </div>
                )}

                {paymentMethod === 'Online Payment' && (
                  <div style={{ textAlign: "center", padding: "10px 0" }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#2563eb" }}>Online Payment Gateway</div>
                    <div style={{ fontSize: 13, marginTop: 8, opacity: 0.8 }}>Secure online payment via Credit/Debit card or Netbanking.</div>
                  </div>
                )}

                {isDigital && (
                  <div style={{ marginTop: 24 }}>
                    <Input label="Transaction ID / Reference Number *" value={referenceNumber} onChange={setReferenceNumber} placeholder="Enter your payment reference ID" required />
                  </div>
                )}

                {isDigital && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Upload Payment Screenshot / Proof *</div>
                    <div
                      onClick={() => fileRef.current?.click()}
                      style={{
                        border: "2px dashed var(--border-color)",
                        borderRadius: 12,
                        padding: 24,
                        textAlign: "center",
                        cursor: "pointer",
                        background: proofPreview ? "var(--bg-card)" : "transparent"
                      }}
                    >
                      {proofPreview ? (
                        <div>
                          <img src={proofPreview} alt="Proof" style={{ maxHeight: 200, maxWidth: "100%", borderRadius: 8, marginBottom: 8 }} />
                          <div style={{ fontSize: 12, color: "#2563eb" }}>Click to change</div>
                        </div>
                      ) : (
                        <div style={{ color: "var(--text-muted)" }}>
                          <div style={{ fontSize: 28, marginBottom: 8 }}>📷</div>
                          <div style={{ fontWeight: 600 }}>Tap to upload screenshot</div>
                          <div style={{ fontSize: 11, marginTop: 4 }}>JPG, PNG, WEBP (max 5MB)</div>
                        </div>
                      )}
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleFileSelect} style={{ display: "none" }} />
                  </div>
                )}
              </div>
            </div>
          )}

          {invoice.status === 'Proof Submitted' && (
            <div style={{ background: "#fefce8", padding: 24, borderRadius: 16, border: "1px solid #eab308", textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>⏳</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#854d0e" }}>AWAITING APPROVAL</div>
              <div style={{ fontSize: 14, color: "#854d0e", opacity: 0.8, marginTop: 4 }}>Your payment proof has been submitted. Admin will review and confirm shortly.</div>
              {invoice.paymentProof && (
                <div style={{ marginTop: 16 }}>
                  <img src={invoice.paymentProof} alt="Uploaded proof" style={{ maxHeight: 200, maxWidth: "100%", borderRadius: 8, border: "1px solid var(--border-color)" }} />
                </div>
              )}
            </div>
          )}

          {invoice.status === 'Rejected' && (
            <div style={{ background: "#fef2f2", padding: 24, borderRadius: 16, border: "1px solid #fecaca", textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}><HiXCircle size={40} /></div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#991b1b" }}>PAYMENT REJECTED</div>
              <div style={{ fontSize: 14, color: "#991b1b", opacity: 0.8, marginTop: 4 }}>{invoice.paymentNote || 'Your payment was not approved. Please resubmit with correct details.'}</div>
            </div>
          )}

          {invoice.status === 'Paid' && (
            <div style={{ background: "#dcfce7", padding: 24, borderRadius: 16, border: "1px solid #10b981", textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}><HiCheckCircle size={40} /></div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#065f46" }}>PAYMENT COMPLETED</div>
              <div style={{ fontSize: 14, color: "#065f46", opacity: 0.8, marginTop: 4 }}>This invoice was paid on {new Date(invoice.updatedAt || invoice.date).toLocaleDateString()}</div>
              <div style={{ marginTop: 20 }}>
                 <Btn label="Download Receipt" onClick={() => window.print()} primary />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {invoice.status === 'Pending' || invoice.status === 'Rejected' ? (
          <div style={footerStyle}>
            <Btn label={processing ? "Submitting..." : "Submit Payment"} onClick={handleConfirmPayment} primary disabled={processing} style={{ flex: 2, padding: "16px", borderRadius: 12, height: "unset" }} />
            <Btn label="Cancel" onClick={onClose} style={{ flex: 1, padding: "16px", borderRadius: 12, height: "unset" }} />
          </div>
        ) : (
          <div style={footerStyle}>
             <Btn label="Close" onClick={onClose} primary style={{ flex: 1, padding: "16px", borderRadius: 12, height: "unset" }} />
          </div>
        )}
      </div>
    </div>
  );
}
