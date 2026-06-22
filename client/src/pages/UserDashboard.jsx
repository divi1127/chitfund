import { useState } from "react";
import { useData } from "../hooks/useData";
import { SectionHeader } from "../components/SectionHeader";
import { Table } from "../components/Table";
import { Badge } from "../components/Badge";
import { InvoiceModal } from "../components/InvoiceModal";
import { useAuth } from "../contexts/AuthContext";
import { FiUser, FiFileText, FiDollarSign, FiCalendar, FiCreditCard, FiCheckCircle, FiClock, FiAlertCircle } from "react-icons/fi";

export function UserDashboard({ dark, toast }) {
  const { user } = useAuth();
  const { data: members } = useData('/members');
  const { data: groups } = useData('/groups');
  const { data: schemes } = useData('/schemes');
  const { data: invoices } = useData('/invoices');
  const { data: auctions } = useData('/auctions');
  const [showInvoicePopup, setShowInvoicePopup] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const userMember = Array.isArray(members) ? members.find(m => m.email === user?.email || m.memberId === user?.userId) : null;
  const userGroupId = userMember?.groups && userMember.groups[0];
  const userGroup = userGroupId && Array.isArray(groups) ? groups.find(g => g.id === userGroupId) : null;
  const userScheme = userGroup && Array.isArray(schemes) ? schemes.find(s => s.id === userGroup.schemeId) : null;
  const userInvoices = userMember && Array.isArray(invoices) ? invoices.filter(inv => inv.memberId === userMember.memberId) : [];

  const outstandingInvoices = userInvoices.filter(inv => inv.status === 'Due' || inv.status === 'Partially Paid' || inv.status === 'Pending');
  const totalOutstanding = outstandingInvoices.reduce((sum, inv) => sum + inv.balance, 0);
  const totalPaid = userInvoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);

  const currentInstallment = userGroup?.currentInstallment || 1;
  const nextInstallment = currentInstallment + 1;
  const nextDueDate = new Date();
  nextDueDate.setDate(5);
  nextDueDate.setMonth(nextDueDate.getMonth() + 1);

  const userAuctions = Array.isArray(auctions) ? auctions.filter(a => a.winnerId === userMember?.id || a.groupId === userGroupId) : [];

  return (
    <div>
      <SectionHeader title="My Dashboard" subtitle={`Welcome back, ${user?.name || userMember?.name || 'User'}`} dark={dark} />

      {userMember ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 28 }}>
            <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><FiUser size={18} /></div>
                <div>
                  <div style={{ fontSize: 11, color: dark ? "rgba(255,255,255,.5)" : "#6b7280" }}>Member</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: dark ? "#f3f4f6" : "#111" }}>{userMember.name}</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: dark ? "rgba(255,255,255,.5)" : "#6b7280" }}>ID: {userMember.memberId}</div>
            </div>

            <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><FiFileText size={18} /></div>
                <div>
                  <div style={{ fontSize: 11, color: dark ? "rgba(255,255,255,.5)" : "#6b7280" }}>Scheme</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: dark ? "#f3f4f6" : "#111" }}>{userScheme?.name || "N/A"}</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: dark ? "rgba(255,255,255,.5)" : "#6b7280" }}>Group: {userGroup?.name || "N/A"}</div>
            </div>

            <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><FiDollarSign size={18} /></div>
                <div>
                  <div style={{ fontSize: 11, color: dark ? "rgba(255,255,255,.5)" : "#6b7280" }}>Installment</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: dark ? "#f3f4f6" : "#111" }}>₹{(userScheme?.monthlyInstallment || 0).toLocaleString()}/mo</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: dark ? "rgba(255,255,255,.5)" : "#6b7280" }}>Next: #{nextInstallment}</div>
            </div>

            <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: totalOutstanding > 0 ? "#ef4444" : "#10b981", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>{totalOutstanding > 0 ? <FiAlertCircle size={18} /> : <FiCheckCircle size={18} />}</div>
                <div>
                  <div style={{ fontSize: 11, color: dark ? "rgba(255,255,255,.5)" : "#6b7280" }}>Outstanding</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: totalOutstanding > 0 ? "#ef4444" : "#10b981" }}>₹{totalOutstanding.toLocaleString()}</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: dark ? "rgba(255,255,255,.5)" : "#6b7280" }}>Total Paid: ₹{totalPaid.toLocaleString()}</div>
            </div>
          </div>

          <div style={{ display: "grid", gap: 20, marginBottom: 20 }}>
            <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 24 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 16 }}>Outstanding Payments</div>
              {outstandingInvoices.length === 0 ? (
                <div style={{ textAlign: "center", padding: 30, color: dark ? "rgba(255,255,255,.5)" : "#6b7280" }}>
                  <FiCheckCircle size={32} style={{ margin: "0 auto 12px", display: "block", opacity: 0.5 }} />
                  <div>All payments are up to date!</div>
                </div>
              ) : (
                <Table dark={dark} cols={["Invoice", "Due Date", "Amount", "Balance", "Status", "Action"]}
                  rows={outstandingInvoices.map(inv => [
                    inv.invoiceNumber,
                    new Date(inv.dueDate).toLocaleDateString(),
                    `₹${inv.totalPayable.toLocaleString()}`,
                    `₹${inv.balance.toLocaleString()}`,
                    <Badge key={inv.id} text={inv.status} color={inv.status === 'Due' ? 'red' : inv.status === 'Pending' ? 'orange' : 'yellow'} />,
                    <button key={inv.id} onClick={() => { setSelectedInvoice(inv); setShowInvoicePopup(true); }}
                      style={{ fontSize: 11, padding: "6px 12px", borderRadius: 6, border: "1px solid #2563eb", background: "#2563eb", color: "#fff", cursor: "pointer", fontWeight: 600 }}>Pay Now</button>
                  ])} />
              )}
            </div>

            <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 24 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 16 }}>Payment History</div>
              {userInvoices.length === 0 ? (
                <div style={{ textAlign: "center", padding: 30, color: dark ? "rgba(255,255,255,.5)" : "#6b7280" }}>No payment history available.</div>
              ) : (
                <Table dark={dark} cols={["Invoice", "Date", "Amount Paid", "Mode", "Status"]}
                  rows={userInvoices.map(inv => [
                    inv.invoiceNumber,
                    new Date(inv.date).toLocaleDateString(),
                    `₹${(inv.amountPaid || 0).toLocaleString()}`,
                    inv.paymentMethod,
                    <Badge key={inv.id} text={inv.status} color={inv.status === 'Paid' ? 'green' : inv.status === 'Partially Paid' ? 'yellow' : 'red'} />
                  ])} />
              )}
            </div>
          </div>

          {userAuctions.length > 0 && (
            <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 24 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 16 }}>My Auctions</div>
              <Table dark={dark} cols={["Group", "Date", "Bid Amount", "Status", "Dividend"]}
                rows={userAuctions.map(a => {
                  const g = Array.isArray(groups) ? groups.find(gr => gr.id === a.groupId) : null;
                  return [
                    g?.name || a.groupId,
                    new Date(a.date).toLocaleDateString(),
                    a.bidAmount ? `₹${a.bidAmount.toLocaleString()}` : " ",
                    <Badge key={a.id} text={a.status} color={a.status === 'Completed' ? 'green' : a.status === 'Scheduled' ? 'blue' : 'gray'} />,
                    a.dividend ? `₹${a.dividend.toLocaleString()}` : " "
                  ];
                })} />
            </div>
          )}
        </>
      ) : (
        <div style={{ textAlign: "center", padding: 60, background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12 }}>
          <FiUser size={48} style={{ margin: "0 auto 16px", display: "block", opacity: 0.3 }} />
          <div style={{ fontSize: 18, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 8 }}>Welcome to HR Chits</div>
          <div style={{ fontSize: 13, color: dark ? "rgba(255,255,255,.5)" : "#6b7280", marginBottom: 20 }}>Your member profile is being set up. Please complete your KYC to get started.</div>
          <button onClick={() => window.location.href = "/kyc-verification"} style={{ padding: "12px 24px", borderRadius: 8, border: "none", background: "#2563eb", color: "#fff", cursor: "pointer", fontWeight: 600 }}>Submit KYC</button>
        </div>
      )}

      {showInvoicePopup && selectedInvoice && (
        <InvoiceModal
          invoice={selectedInvoice}
          dark={dark}
          onClose={() => { setShowInvoicePopup(false); setSelectedInvoice(null); }}
          onPaymentSuccess={() => { window.location.reload(); }}
          toast={toast}
        />
      )}
    </div>
  );
}
