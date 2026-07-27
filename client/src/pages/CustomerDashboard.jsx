import { useState } from "react";
import { useData } from "../hooks/useData";
import { createData } from "../utils/api";
import { SectionHeader } from "../components/SectionHeader";
import { Table } from "../components/Table";
import { Badge } from "../components/Badge";
import { InvoiceModal } from "../components/InvoiceModal";
import { useAuth } from "../contexts/AuthContext";
import { fmt } from "../utils/helpers";
import { FiUser, FiFileText, FiDollarSign, FiCalendar, FiCreditCard, FiCheckCircle, FiClock, FiAlertCircle, FiTrendingUp } from "react-icons/fi";

export function CustomerDashboard({ dark, toast }) {
  const { user } = useAuth();
  const { data: members } = useData('/members');
  const { data: groups } = useData('/groups');
  const { data: schemes } = useData('/schemes');
  const { data: invoices } = useData('/invoices');
  const { data: auctions } = useData('/auctions');
  const [showInvoicePopup, setShowInvoicePopup] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [generating, setGenerating] = useState(false);

  const customerId = user?.memberId || user?.userId;
  const userMember = Array.isArray(members) ? members.find(m => m.memberId === customerId) : null;
  const userGroupId = userMember?.groups && userMember.groups[0];
  const userGroup = userGroupId && Array.isArray(groups) ? groups.find(g => g.id === userGroupId) : null;
  const userScheme = userGroup && Array.isArray(schemes) ? schemes.find(s => s.id === userGroup.schemeId) : null;
  const userInvoices = Array.isArray(invoices) ? invoices.filter(inv => inv.memberId === customerId) : [];

  const outstandingInvoices = userInvoices.filter(inv => inv.status === 'Due' || inv.status === 'Partially Paid' || inv.status === 'Pending');
  const totalOutstanding = outstandingInvoices.reduce((sum, inv) => sum + (inv.balance || inv.totalPayable || 0), 0);
  const totalPaid = userInvoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);

  const currentInstallment = userGroup?.currentInstallment || 1;
  const nextDueDate = new Date();
  nextDueDate.setDate(5);
  nextDueDate.setMonth(nextDueDate.getMonth() + 1);

  const schemeMonthlyAmounts = userScheme?.monthlyAmounts || [];
  const totalMonths = userScheme?.duration || 0;
  const monthlyInstallment = userScheme?.monthlyAmounts?.[0]?.amount || 0;

  const paidMonthNums = new Set(
    userInvoices.filter(inv => inv.status === 'Paid' || inv.status === 'Proof Submitted')
      .map(inv => inv.currentMonth)
  );
  const paidCount = paidMonthNums.size;

  const paymentSchedule = schemeMonthlyAmounts.map((ma, i) => {
    const monthNum = ma.month || (i + 1);
    const existingInvoice = userInvoices.find(inv => inv.currentMonth === monthNum);
    const isPaid = paidMonthNums.has(monthNum);
    const isDueNow = monthNum === currentInstallment && !isPaid;
    const isOverdue = monthNum < currentInstallment && !isPaid;
    const status = isPaid ? 'Paid' : isDueNow ? 'Due Now' : isOverdue ? 'Overdue' : 'Upcoming';
    return { month: monthNum, amount: ma.amount || monthlyInstallment || 0, auctionAmount: ma.auctionAmount || 0, invoice: existingInvoice, status };
  });

  const handleGenerateInvoice = async (monthNum, amount) => {
    try {
      toast.add("Generating invoice...");
      const invoiceData = {
        invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`,
        receiptNumber: `RCPT-${Math.floor(Math.random() * 9000) + 1000}`,
        date: new Date(), time: new Date().toLocaleTimeString(),
        branch: "Madurai HQ", collectedBy: "Online Portal",
        memberId: customerId, memberName: userMember?.name || user?.name,
        memberMobile: userMember?.phone || user?.phone || "",
        memberAddress: userMember?.address || "",
        memberAadhar: userMember?.aadhaar || "",
        chitName: userScheme?.name || '', chitGroup: userGroup?.name || '',
        chitNumber: `CHIT-${userScheme?.amount || ''}`,
        totalChitValue: userScheme?.amount || 0, monthlyAmount: amount,
        duration: userScheme?.duration || 0, currentMonth: monthNum,
        dueDate: new Date(Date.now() + 5 * 86400000),
        installmentAmount: amount, lateFine: 0, discount: 0, previousDue: 0,
        totalPayable: amount, amountPaid: 0, balance: amount,
        paymentMethod: 'Pending', referenceNumber: '',
        paidInstallments: 0, remainingInstallments: (userScheme?.duration || 0) - monthNum,
        totalPaid: 0, remainingAmount: (userScheme?.amount || 0) - amount,
        status: 'Pending', remarks: `Installment ${monthNum}`
      };
      const result = await createData('/invoices', invoiceData);
      toast.add("Invoice generated!", "success");
      return result.invoice || result;
    } catch (err) {
      toast.add("Error: " + err.message, "error");
      return null;
    }
  };

  return (
    <div>
      <SectionHeader title="My Dashboard" subtitle={`Welcome, ${user?.name || 'Customer'}`} dark={dark} />

      {userMember ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 28 }}>
            <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 11, color: dark ? "rgba(255,255,255,.5)" : "#6b7280" }}>My Scheme</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: dark ? "#f3f4f6" : "#111" }}>{userScheme?.name || "N/A"}</div>
              <div style={{ fontSize: 12, color: dark ? "rgba(255,255,255,.5)" : "#6b7280", marginTop: 4 }}>Group: {userGroup?.name || "N/A"}</div>
            </div>
            <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 11, color: dark ? "rgba(255,255,255,.5)" : "#6b7280" }}>Monthly Installment</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: dark ? "#f3f4f6" : "#111" }}>{fmt(monthlyInstallment)}/mo</div>
              <div style={{ fontSize: 12, color: dark ? "rgba(255,255,255,.5)" : "#6b7280", marginTop: 4 }}>Next Due: {nextDueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
            </div>
            <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 11, color: dark ? "rgba(255,255,255,.5)" : "#6b7280" }}>Outstanding</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: totalOutstanding > 0 ? "#ef4444" : "#10b981" }}>{fmt(totalOutstanding)}</div>
              <div style={{ fontSize: 12, color: dark ? "rgba(255,255,255,.5)" : "#6b7280", marginTop: 4 }}>Total Paid: {fmt(totalPaid)}</div>
            </div>
            <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 11, color: dark ? "rgba(255,255,255,.5)" : "#6b7280" }}>Progress</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: dark ? "#f3f4f6" : "#111" }}>{paidCount}/{totalMonths} months</div>
              <div style={{ width: "100%", height: 6, background: dark ? "rgba(255,255,255,.1)" : "#e5e7eb", borderRadius: 3, marginTop: 8, overflow: "hidden" }}>
                <div style={{ width: `${totalMonths > 0 ? (paidCount / totalMonths) * 100 : 0}%`, height: "100%", background: "linear-gradient(90deg, #10b981, #2563eb)", borderRadius: 3 }} />
              </div>
            </div>
          </div>

          <div className="d-grid d-grid-2" style={{ marginBottom: 20 }}>
            <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 24 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 16 }}>Payment Schedule</div>
              {paymentSchedule.length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10 }}>
                  {paymentSchedule.map(s => {
                    let bg, border, textColor;
                    if (s.status === 'Paid') { bg = "#ecfdf5"; border = "1px solid #10b981"; textColor = "#10b981"; }
                    else if (s.status === 'Due Now') { bg = "#eff6ff"; border = "2px solid #2563eb"; textColor = "#2563eb"; }
                    else if (s.status === 'Overdue') { bg = "#fef2f2"; border = "1px solid #ef4444"; textColor = "#ef4444"; }
                    else { bg = dark ? "rgba(255,255,255,.03)" : "#f9fafb"; border = `1px solid ${dark ? "rgba(255,255,255,.1)" : "#e5e7eb"}`; textColor = dark ? "rgba(255,255,255,.4)" : "#9ca3af"; }
                    return (
                      <div key={s.month} style={{ background: bg, border, borderRadius: 10, padding: "12px 10px", textAlign: "center" }}>
                        <div style={{ fontSize: 11, color: textColor, fontWeight: s.status === 'Paid' || s.status === 'Due Now' ? 700 : 500, marginBottom: 4 }}>Month #{s.month}</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: dark ? "#f3f4f6" : "#111", marginBottom: 2 }}>{fmt(s.amount)}</div>
                        {s.auctionAmount > 0 && <div style={{ fontSize: 10, color: dark ? "rgba(255,255,255,.4)" : "#9ca3af", marginBottom: 6 }}>Auction: {fmt(s.auctionAmount)}</div>}
                        {s.status === 'Paid' ? (
                          <span style={{ fontSize: 11, color: "#10b981", fontWeight: 600 }}>Paid ✓</span>
                        ) : s.status === 'Due Now' || s.status === 'Overdue' ? (
                          <button onClick={async () => {
                            if (generating) return;
                            if (s.invoice) { setSelectedInvoice(s.invoice); setShowInvoicePopup(true); }
                            else {
                              setGenerating(true);
                              const newInv = await handleGenerateInvoice(s.month, s.amount);
                              setGenerating(false);
                              if (newInv) { setSelectedInvoice(newInv); setShowInvoicePopup(true); }
                            }
                          }} style={{ padding: "6px 14px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Pay Now</button>
                        ) : (
                          <span style={{ fontSize: 11, color: dark ? "rgba(255,255,255,.4)" : "#9ca3af" }}>Upcoming</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: 30, color: dark ? "rgba(255,255,255,.5)" : "#6b7280" }}>
                  <FiTrendingUp size={32} style={{ margin: "0 auto 12px", display: "block", opacity: 0.5 }} />
                  <div>No payment schedule available.</div>
                </div>
              )}
            </div>
            <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 24 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 16 }}>Outstanding Payments</div>
              {outstandingInvoices.length === 0 ? (
                <div style={{ textAlign: "center", padding: 30, color: dark ? "rgba(255,255,255,.5)" : "#6b7280" }}>
                  <FiCheckCircle size={32} style={{ margin: "0 auto 12px", display: "block", opacity: 0.5 }} />
                  <div>All payments up to date!</div>
                </div>
              ) : (
                <Table dark={dark} cols={["Invoice", "Amount", "Balance", "Status", "Action"]}
                  rows={outstandingInvoices.map(inv => [
                    inv.invoiceNumber, fmt(inv.totalPayable), fmt(inv.balance || inv.totalPayable),
                    <Badge key={inv._id} text={inv.status} color={inv.status === 'Due' ? 'red' : inv.status === 'Pending' ? 'orange' : 'yellow'} />,
                    <button key={inv._id} onClick={() => { setSelectedInvoice(inv); setShowInvoicePopup(true); }}
                      style={{ fontSize: 11, padding: "6px 12px", borderRadius: 6, border: "none", background: "#2563eb", color: "#fff", cursor: "pointer", fontWeight: 600 }}>Pay Now</button>
                  ])} />
              )}
            </div>
          </div>

          <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 16 }}>Payment History</div>
            {userInvoices.length === 0 ? (
              <div style={{ textAlign: "center", padding: 20, color: dark ? "rgba(255,255,255,.5)" : "#6b7280" }}>No payment history.</div>
            ) : (
              <Table dark={dark} cols={["Invoice", "Date", "Amount Paid", "Mode", "Status"]}
                rows={userInvoices.slice(0, 10).map(inv => [
                  inv.invoiceNumber, new Date(inv.date).toLocaleDateString(),
                  fmt(inv.amountPaid || 0), inv.paymentMethod,
                  <Badge key={inv._id} text={inv.status} color={inv.status === 'Paid' ? 'green' : inv.status === 'Partially Paid' ? 'yellow' : 'red'} />
                ])} />
            )}
          </div>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: 60, background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12 }}>
          <FiUser size={48} style={{ margin: "0 auto 16px", display: "block", opacity: 0.3 }} />
          <div style={{ fontSize: 18, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 8 }}>Welcome to NVS CHIT ENTERPRISES</div>
          <div style={{ fontSize: 13, color: dark ? "rgba(255,255,255,.5)" : "#6b7280", marginBottom: 20 }}>Please contact your agent for more details.</div>
        </div>
      )}

      {showInvoicePopup && selectedInvoice && (
        <InvoiceModal invoice={selectedInvoice} dark={dark}
          onClose={() => { setShowInvoicePopup(false); setSelectedInvoice(null); }}
          onPaymentSuccess={() => { window.location.reload(); }} toast={toast} />
      )}
    </div>
  );
}