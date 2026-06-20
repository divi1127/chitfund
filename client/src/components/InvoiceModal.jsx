import React, { useState } from 'react';
import { Btn } from './Btn';
import { Input } from './Input';
import { Badge } from './Badge';
import { COMPANY } from '../utils/constants';
import { QRCodeCanvas } from 'qrcode.react';

export function InvoiceModal({ invoice, dark, onClose, onPaymentSuccess, toast }) {
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [processing, setProcessing] = useState(false);

  if (!invoice) return null;

  const handleConfirmPayment = async () => {
    if (!referenceNumber && paymentMethod !== 'Cash') {
      toast.add('Please enter a reference number or transaction ID', 'error');
      return;
    }
    
    setProcessing(true);
    try {
      const response = await fetch(`http://localhost:5000/api/invoices/${invoice._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Paid',
          paymentMethod: paymentMethod,
          referenceNumber: referenceNumber,
          amountPaid: invoice.totalPayable,
          balance: 0,
          totalPaid: (invoice.totalPaid || 0) + invoice.totalPayable,
          paidInstallments: (invoice.paidInstallments || 0) + 1,
          updatedAt: new Date()
        })
      });

      if (!response.ok) throw new Error('Payment failed');

      toast.add('Payment confirmed successfully!', 'success');
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
    border: dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e5e7eb",
    position: "relative",
    color: dark ? "#f3f4f6" : "#111",
    display: "flex",
    flexDirection: "column"
  };

  const headerStyle = {
    background: dark ? "rgba(37, 99, 235, 0.15)" : "linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)",
    padding: "28px 32px",
    borderBottom: dark ? "1px solid rgba(255,255,255,0.05)" : "1px solid #e5e7eb",
    position: "sticky",
    top: 0,
    zIndex: 10
  };

  const bodyStyle = {
    padding: "28px 32px"
  };

  const footerStyle = {
    padding: "20px 32px",
    background: dark ? "rgba(37, 99, 235, 0.05)" : "#f9fafb",
    borderTop: dark ? "1px solid rgba(255,255,255,0.05)" : "1px solid #e5e7eb",
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
      <div style={{ fontSize: 11, color: dark ? "rgba(255,255,255,0.5)" : "#6b7280", fontWeight: 600, marginBottom: 2 }}>{label}</div>
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
              <div style={{ fontSize: 20, fontWeight: 800, color: dark ? "#fff" : "#111", letterSpacing: "0.05em" }}>INVOICE</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#2563eb", marginTop: 4 }}>#{invoice.invoiceNumber}</div>
              <div style={{ marginTop: 8 }}>
                <Badge text={invoice.status} color={invoice.status === 'Paid' ? 'green' : (invoice.status === 'Pending' ? 'yellow' : 'red')} />
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", cursor: "pointer", fontSize: 24, color: dark ? "#fff" : "#000", opacity: 0.5 }}>×</button>
        </div>

        <div style={bodyStyle}>
          {/* Member & Group Info */}
          <div style={gridRow}>
            <div style={{
              background: dark ? "rgba(255,255,255,0.03)" : "#fff",
              padding: 20,
              borderRadius: 16,
              border: "2px solid #2563eb",
              boxShadow: "0 2px 8px rgba(37, 99, 235, 0.08)",
            }}>
              <div style={sectionHeader}>👤 Member Details</div>
              {dataItem("NAME", invoice.memberName, true)}
              {dataItem("MEMBER ID", invoice.memberId)}
              {dataItem("MOBILE", invoice.memberMobile)}
            </div>
            <div style={{
              background: dark ? "rgba(255,255,255,0.03)" : "#fff",
              padding: 20,
              borderRadius: 16,
              border: "2px solid #ea580c",
              boxShadow: "0 2px 8px rgba(234, 88, 12, 0.08)",
            }}>
              <div style={sectionHeader}>📦 Chit Group & Scheme</div>
              {dataItem("GROUP NAME", invoice.chitGroup, true)}
              {dataItem("SCHEME NAME", invoice.chitName)}
              {dataItem("DATE", new Date(invoice.date).toLocaleDateString())}
              {dataItem("DUE DATE", new Date(invoice.dueDate).toLocaleDateString())}
            </div>
          </div>

          {/* Amount Calculation */}
          <div style={{ marginBottom: 32 }}>
            <div style={sectionHeader}>💰 Payment Summary</div>
            <div style={{
              display: "grid",
              gap: 1,
              border: "2px solid #e2e8f0",
              borderRadius: 12,
              overflow: "hidden",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", background: dark ? "rgba(255,255,255,0.05)" : "#f9fafb" }}>
                <span style={{ fontSize: 14 }}>Installment Number:</span>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{invoice.currentMonth || 1}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", background: dark ? "rgba(255,255,255,0.05)" : "#fff" }}>
                <span style={{ fontSize: 14 }}>Monthly Installment Amount:</span>
                <span style={{ fontSize: 14, fontWeight: 700 }}>₹{invoice.installmentAmount?.toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", background: dark ? "rgba(255,255,255,0.05)" : "#f9fafb" }}>
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
          {invoice.status === 'Pending' && (
            <div>
              <div style={sectionHeader}>💳 Select Payment Method</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 24 }}>
                {['Cash', 'UPI', 'Bank Transfer', 'Online Payment'].map(method => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    style={{
                      padding: "16px 8px",
                      borderRadius: 12,
                      border: paymentMethod === method ? "2px solid #2563eb" : dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e5e7eb",
                      background: paymentMethod === method ? "rgba(37, 99, 235, 0.15)" : "transparent",
                      color: dark ? (paymentMethod === method ? "#fff" : "rgba(255,255,255,0.6)") : (paymentMethod === method ? "#2563eb" : "#4b5563"),
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

              <div style={{ background: dark ? "rgba(37, 99, 235, 0.05)" : "#f0f7ff", padding: 24, borderRadius: 16, border: "1px dashed #2563eb" }}>
                {paymentMethod === 'UPI' && (
                  <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
                    <div style={{ background: "#fff", padding: 12, borderRadius: 12 }}>
                      <QRCodeCanvas value={`upi://pay?pa=${COMPANY.upiId || 'company@upi'}&pn=${COMPANY.name}&am=${invoice.totalPayable}&cu=INR`} size={140} level="H" />
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#2563eb", marginBottom: 8 }}>Pay via UPI</div>
                      <div style={{ fontSize: 13, marginBottom: 16, opacity: 0.8 }}>Scan the QR code or use the ID below to pay via any UPI app like GPay, PhonePe, or Paytm.</div>
                      <div style={{ background: dark ? "rgba(255,255,255,0.1)" : "rgba(37, 99, 235, 0.1)", padding: "8px 12px", borderRadius: 8, fontSize: 14, fontWeight: 700 }}>
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
                    <div style={{ fontSize: 13, marginTop: 8, opacity: 0.8 }}>Please pay the total amount at our office counter and collect your printed receipt.</div>
                  </div>
                )}

                {paymentMethod === 'Online Payment' && (
                  <div style={{ textAlign: "center", padding: "10px 0" }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#2563eb" }}>Online Payment Gateway</div>
                    <div style={{ fontSize: 13, marginTop: 8, opacity: 0.8 }}>Secure online payment via Credit/Debit card or Netbanking.</div>
                  </div>
                )}

                {paymentMethod !== 'Cash' && (
                  <div style={{ marginTop: 24 }}>
                    <Input label="Transaction ID / Reference Number" value={referenceNumber} onChange={setReferenceNumber} dark={dark} placeholder="Enter your payment reference ID" required />
                  </div>
                )}
              </div>
            </div>
          )}

          {invoice.status === 'Paid' && (
            <div style={{ background: "#dcfce7", padding: 24, borderRadius: 16, border: "1px solid #10b981", textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#065f46" }}>PAYMENT COMPLETED</div>
              <div style={{ fontSize: 14, color: "#065f46", opacity: 0.8, marginTop: 4 }}>This invoice was paid on {new Date(invoice.updatedAt || invoice.date).toLocaleDateString()}</div>
              <div style={{ marginTop: 20 }}>
                 <Btn label="Download Receipt" onClick={() => window.print()} primary />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {invoice.status === 'Pending' ? (
          <div style={footerStyle}>
            <Btn label={processing ? "Confirming..." : "Confirm Payment"} onClick={handleConfirmPayment} primary disabled={processing} style={{ flex: 2, padding: "16px", borderRadius: 12, height: "unset" }} />
            <Btn label="Pay Later" onClick={onClose} style={{ flex: 1, padding: "16px", borderRadius: 12, height: "unset" }} />
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
