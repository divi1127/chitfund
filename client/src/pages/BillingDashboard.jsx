import { useState } from "react";
import { useData } from "../hooks/useData";
import { SectionHeader } from "../components/SectionHeader";
import { Table } from "../components/Table";
import { Badge } from "../components/Badge";
import { useAuth } from "../contexts/AuthContext";
import { COMPANY } from "../utils/constants";
import { QRCodeCanvas } from "qrcode.react";
import { IconBtn } from "../components/IconBtn";
import { HiEye, HiPrinter, HiArrowDownTray, HiReceiptRefund } from "react-icons/hi2";

export function BillingDashboard({ toast }) {
  const { user } = useAuth();
  const { data: invoices, loading: invoicesLoading } = useData('/invoices');
  const { data: members } = useData('/members');
  const [selectedYear, setSelectedYear] = useState("all");
  const [showReceiptPopup, setShowReceiptPopup] = useState(false);
  const [selectedInvoiceForReceipt, setSelectedInvoiceForReceipt] = useState(null);
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState(null);

  // Agent sees only their customers
  const agentCustomerIds = user?.role === 'agent' && members 
    ? members.filter(m => m.agentId === user.agentId || m.agentId === user.userId).map(m => m.memberId)
    : [];

  const roleFilteredInvoices = user?.role === 'customer'
    ? invoices.filter(inv => inv.memberId === user.userId || inv.memberName === user.name)
    : user?.role === 'agent'
    ? invoices.filter(inv => agentCustomerIds.includes(inv.memberId))
    : invoices;

  const invoiceYears = [...new Set(roleFilteredInvoices.map(inv => new Date(inv.date).getFullYear()))].sort((a, b) => b - a);
  
  const filteredInvoices = selectedYear === "all"
    ? roleFilteredInvoices
    : roleFilteredInvoices.filter(inv => new Date(inv.date).getFullYear() === Number(selectedYear));

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'green';
      case 'Partially Paid': return 'yellow';
      case 'Due': return 'red';
      case 'Cancelled': return 'gray';
      default: return 'gray';
    }
  };

  if (invoicesLoading) return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;

  return (
    <div>
      <SectionHeader title="Payments Dashboard" subtitle="View all customer and agent payments" />

      <div style={{ display: "grid", gap: 24 }}>
        {/* Invoices Table */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>Payment Records</div>
            {invoiceYears.length > 0 && (
              <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)}
                style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid var(--border-color)", background: "var(--bg-card)", color: "var(--text-primary)" }}>
                <option value="all">All Years</option>
                {invoiceYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            )}
          </div>
          {filteredInvoices.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>No invoices found.</div>
          ) : (
            <Table cols={["Invoice No", "Member", "Amount", "Payment Mode", "Status", "Date", "Actions"]}
              rows={filteredInvoices.map(inv => [
                inv.invoiceNumber,
                inv.memberName,
                `₹${inv.amountPaid?.toLocaleString()}`,
                inv.paymentMethod,
                <Badge key={inv.id} text={inv.status} color={getStatusColor(inv.status)} />,
                new Date(inv.date).toLocaleDateString(),
                <div key={inv.id} style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
                  <IconBtn icon={<HiEye size={14} />} onClick={() => { setPreviewInvoice(inv); setShowInvoicePreview(true); }} color="#2563eb" title="View" />
                  <IconBtn icon={<HiPrinter size={14} />} onClick={() => window.print()} color="#10b981" title="Print" />
                  {(inv.status === 'Paid' || inv.status === 'Partially Paid') && (
                    <IconBtn icon={<HiReceiptRefund size={14} />} onClick={() => { setSelectedInvoiceForReceipt(inv); setShowReceiptPopup(true); }} color="#8b5cf6" title="Receipt" />
                  )}
                  <IconBtn icon={<HiArrowDownTray size={14} />} onClick={() => toast.add("Downloading PDF...")} color="#f59e0b" title="Download" />
                </div>
              ])} />
          )}
        </div>

        {/* Invoice Preview */}
        {showInvoicePreview && previewInvoice && (
          <InvoicePreview invoice={previewInvoice} onClose={() => setShowInvoicePreview(false)} />
        )}

        {/* Receipt Popup */}
        {showReceiptPopup && selectedInvoiceForReceipt && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "var(--bg-card)", borderRadius: 12, maxWidth: 700, width: "90%", maxHeight: "90vh", overflow: "auto", padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>Payment Receipt</div>
                <button onClick={() => setShowReceiptPopup(false)} style={{ fontSize: 24, background: "none", border: "none", cursor: "pointer", color: "var(--text-primary)" }}>×</button>
              </div>

              <div style={{ textAlign: "center", marginBottom: 32, paddingBottom: 24, borderBottom: "2px solid #2563eb" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#2563eb", marginBottom: 8 }}>{COMPANY.name}</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{COMPANY.address}</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Tel: {COMPANY.phone} | Email: {COMPANY.email}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginTop: 16, textTransform: "uppercase", letterSpacing: "1px" }}>Official Payment Receipt</div>
              </div>

              <div className="receipt-detail-grid" style={{ display: "grid", gap: 20, marginBottom: 32 }}>
                <style>{`@media (min-width: 640px) { .receipt-detail-grid { grid-template-columns: 1fr 1fr !important; gap: 32px !important; } }`}</style>
                <div style={{ background: "var(--bg-card)", padding: 20, borderRadius: 12, border: "1px solid var(--border-color)" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#2563eb", marginBottom: 12, textTransform: "uppercase" }}>Member Details</div>
                  <div style={{ marginBottom: 8 }}><span style={{ fontSize: 12, color: "#6b7280" }}>Name:</span> <span style={{ fontSize: 14, fontWeight: 700 }}>{selectedInvoiceForReceipt.memberName}</span></div>
                  <div style={{ marginBottom: 8 }}><span style={{ fontSize: 12, color: "#6b7280" }}>ID:</span> <span style={{ fontSize: 14, fontWeight: 600 }}>{selectedInvoiceForReceipt.memberId}</span></div>
                  <div style={{ marginBottom: 8 }}><span style={{ fontSize: 12, color: "#6b7280" }}>Mobile:</span> <span style={{ fontSize: 14, fontWeight: 600 }}>{selectedInvoiceForReceipt.memberMobile}</span></div>
                  <div style={{ marginBottom: 0 }}><span style={{ fontSize: 12, color: "#6b7280" }}>Scheme:</span> <span style={{ fontSize: 14, fontWeight: 600 }}>{selectedInvoiceForReceipt.chitName}</span></div>
                </div>
                <div style={{ background: "var(--bg-card)", padding: 20, borderRadius: 12, border: "1px solid var(--border-color)" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#2563eb", marginBottom: 12, textTransform: "uppercase" }}>Transaction Info</div>
                  <div style={{ marginBottom: 8 }}><span style={{ fontSize: 12, color: "#6b7280" }}>Receipt No:</span> <span style={{ fontSize: 14, fontWeight: 700 }}>{selectedInvoiceForReceipt.receiptNumber}</span></div>
                  <div style={{ marginBottom: 8 }}><span style={{ fontSize: 12, color: "#6b7280" }}>Date:</span> <span style={{ fontSize: 14, fontWeight: 600 }}>{new Date(selectedInvoiceForReceipt.date).toLocaleDateString()}</span></div>
                  <div style={{ marginBottom: 8 }}><span style={{ fontSize: 12, color: "#6b7280" }}>Method:</span> <span style={{ fontSize: 14, fontWeight: 600 }}>{selectedInvoiceForReceipt.paymentMethod}</span></div>
                  <div style={{ marginBottom: 0 }}><span style={{ fontSize: 12, color: "#6b7280" }}>Trans ID:</span> <span style={{ fontSize: 14, fontWeight: 600 }}>{selectedInvoiceForReceipt.referenceNumber || 'N/A'}</span></div>
                </div>
              </div>

              <div style={{ marginBottom: 32 }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                      <th style={{ textAlign: "left", padding: "12px", fontSize: 12, color: "#6b7280" }}>Description</th>
                      <th style={{ textAlign: "right", padding: "12px", fontSize: 12, color: "#6b7280" }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px", fontSize: 14 }}>Chit Installment Amount</td>
                      <td style={{ padding: "12px", textAlign: "right", fontSize: 14, fontWeight: 600 }}>₹{selectedInvoiceForReceipt.installmentAmount?.toLocaleString()}</td>
                    </tr>
                    {selectedInvoiceForReceipt.previousDue > 0 && (
                      <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "12px", fontSize: 14 }}>Previous Arrears</td>
                        <td style={{ padding: "12px", textAlign: "right", fontSize: 14, fontWeight: 600 }}>₹{selectedInvoiceForReceipt.previousDue?.toLocaleString()}</td>
                      </tr>
                    )}
                    {selectedInvoiceForReceipt.lateFine > 0 && (
                      <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "12px", fontSize: 14 }}>Late Fee / Penal Interest</td>
                        <td style={{ padding: "12px", textAlign: "right", fontSize: 14, fontWeight: 600 }}>₹{selectedInvoiceForReceipt.lateFine?.toLocaleString()}</td>
                      </tr>
                    )}
                    <tr style={{ background: "#2563eb", color: "#fff" }}>
                      <td style={{ padding: "16px", fontSize: 16, fontWeight: 700, borderRadius: "0 0 0 12px" }}>Total Paid Amount</td>
                      <td style={{ padding: "16px", textAlign: "right", fontSize: 20, fontWeight: 800, borderRadius: "0 0 12px 0" }}>₹{selectedInvoiceForReceipt.amountPaid?.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div style={{ textAlign: "center" }}>
                  <QRCodeCanvas value={selectedInvoiceForReceipt.verificationUrl || `VERIFY-${selectedInvoiceForReceipt.invoiceNumber}`} size={100} level="H" />
                  <div style={{ fontSize: 10, color: "#6b7280", marginTop: 4 }}>Scan to Verify</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ width: 150, borderBottom: "1px solid #000", marginBottom: 8 }}></div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>Authorized Signatory</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 40 }}>
                <button onClick={() => window.print()} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, flex: 1, padding: "10px 20px", borderRadius: 8, border: "none", background: "#2563eb", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}><HiPrinter size={16} /> Print</button>
                <button onClick={() => toast.add("Downloading professional PDF...")} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, flex: 1, padding: "10px 20px", borderRadius: 8, border: "none", background: "#10b981", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}><HiArrowDownTray size={16} /> Download</button>
                <button onClick={() => setShowReceiptPopup(false)} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, flex: 1, padding: "10px 20px", borderRadius: 8, border: "1px solid var(--border-color)", background: "transparent", color: "var(--text-primary)", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Invoice Preview Component
function InvoicePreview({ invoice, onClose }) {
  const statusColors = {
    'Paid': '#10b981',
    'Partially Paid': '#f59e0b',
    'Due': '#ef4444',
    'Cancelled': '#6b7280'
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#fff", borderRadius: 12, maxWidth: 800, width: "90%", maxHeight: "90vh", overflow: "auto", padding: 40 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#111" }}>Payment Receipt / Invoice</div>
          <button onClick={onClose} style={{ fontSize: 24, background: "none", border: "none", cursor: "pointer", color: "#111" }}>×</button>
        </div>

        <div style={{ textAlign: "center", marginBottom: 24, paddingBottom: 24, borderBottom: "2px solid #e5e7eb" }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#111", marginBottom: 8 }}>{COMPANY.name}</div>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>{COMPANY.address}</div>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Phone: {COMPANY.phone} | Email: {COMPANY.email}</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>GSTIN: {COMPANY.gstin}</div>
        </div>

        <div className="invoice-detail-grid" style={{ display: "grid", gap: 16, marginBottom: 24, paddingBottom: 24, borderBottom: "2px solid #e5e7eb" }}>
          <style>{`@media (min-width: 640px) { .invoice-detail-grid { grid-template-columns: 1fr 1fr !important; gap: 20px !important; } }`}</style>
          <div>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Invoice No</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>{invoice.invoiceNumber}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Receipt No</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>{invoice.receiptNumber}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Date</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>{new Date(invoice.date).toLocaleDateString()}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Time</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>{invoice.time}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Branch</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>{invoice.branch}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Collected By</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>{invoice.collectedBy}</div>
          </div>
        </div>

        <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: "2px solid #e5e7eb" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 12 }}>MEMBER DETAILS</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Member ID</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>{invoice.memberId}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Member Name</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>{invoice.memberName}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Mobile Number</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>{invoice.memberMobile}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Address</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>{invoice.memberAddress}</div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: "2px solid #e5e7eb" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 12 }}>CHIT DETAILS</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Chit Name</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>{invoice.chitName}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Chit Group</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>{invoice.chitGroup}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Chit Number</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>{invoice.chitNumber}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Total Chit Value</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>₹{invoice.totalChitValue?.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Monthly Amount</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>₹{invoice.monthlyAmount?.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Duration</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>{invoice.duration} Months</div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: "2px solid #e5e7eb" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 12 }}>PAYMENT DETAILS</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Installment Amount</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>₹{invoice.installmentAmount?.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Late Fine</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>₹{invoice.lateFine?.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Discount</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>₹{invoice.discount?.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Previous Due</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>₹{invoice.previousDue?.toLocaleString()}</div>
            </div>
          </div>
          <div style={{ background: "#f9fafb", padding: 16, borderRadius: 8, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 14, color: "#6b7280" }}>Total Payable</span>
              <span style={{ fontSize: 16, fontWeight: 600, color: "#111" }}>₹{invoice.totalPayable?.toLocaleString()}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 14, color: "#6b7280" }}>Amount Paid</span>
              <span style={{ fontSize: 16, fontWeight: 600, color: "#111" }}>₹{invoice.amountPaid?.toLocaleString()}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 14, color: "#6b7280" }}>Balance</span>
              <span style={{ fontSize: 16, fontWeight: 600, color: "#111" }}>₹{invoice.balance?.toLocaleString()}</span>
            </div>
          </div>
          <div className="receipt-grid sm-grid-2" style={{ display: "grid", gap: 12 }}>
            <style>{`@media (min-width: 640px) { .sm-grid-2 { grid-template-columns: 1fr 1fr !important; } }`}</style>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Payment Method</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>{invoice.paymentMethod}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Reference No</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>{invoice.referenceNumber || 'N/A'}</div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: "2px solid #e5e7eb" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 12 }}>ACCOUNT STATUS</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Paid Installments</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>{invoice.paidInstallments} / {invoice.duration}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Remaining Installments</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>{invoice.remainingInstallments}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Total Paid</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>₹{invoice.totalPaid?.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Remaining Amount</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>₹{invoice.remainingAmount?.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: "2px solid #e5e7eb" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 12 }}>REMARKS</div>
          <div style={{ fontSize: 14, color: "#6b7280" }}>{invoice.remarks || 'Payment received successfully.'}</div>
        </div>

        <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: "2px solid #e5e7eb" }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: statusColors[invoice.status] }}></div>
            <div style={{ fontSize: 16, fontWeight: 600, color: statusColors[invoice.status] }}>{invoice.status}</div>
          </div>
        </div>

        <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: "2px solid #e5e7eb" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 12 }}>COMPANY PAYMENT DETAILS</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Bank Name</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>{COMPANY.bankName}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Account Number</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>{COMPANY.accountNumber}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>IFSC Code</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>{COMPANY.ifscCode}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Branch</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>{COMPANY.bankBranch}</div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 8 }}>
          <button onClick={onClose} style={{ padding: "12px 32px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 14 }}>Close</button>
        </div>
      </div>
    </div>
  );
}