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

export function UserDashboard({ dark, toast }) {
  const { user } = useAuth();
  const { data: members } = useData('/members');
  const { data: groups } = useData('/groups');
  const { data: schemes } = useData('/schemes');
  const { data: invoices } = useData('/invoices');
  const { data: auctions } = useData('/auctions');
  const [showInvoicePopup, setShowInvoicePopup] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [generating, setGenerating] = useState(false);

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

  const userAuctions = Array.isArray(auctions) ? auctions.filter(a => a.winnerId === userMember?.userId || a.winnerId === userMember?.memberId) : [];

  const schemeMonthlyAmounts = userScheme?.monthlyAmounts || [];
  const totalMonths = userScheme?.duration || 0;
  const monthlyInstallment = userScheme?.monthlyInstallment || 0;

  const paidMonthNums = new Set(
    userInvoices.filter(inv => inv.status === 'Paid' || inv.status === 'Proof Submitted')
      .map(inv => inv.currentMonth)
  );
  const paidCount = paidMonthNums.size;

  const scheduleStartDate = new Date();
  scheduleStartDate.setDate(5);

  const paymentSchedule = schemeMonthlyAmounts.map((ma, i) => {
    const monthNum = ma.month || (i + 1);
    const existingInvoice = userInvoices.find(inv => inv.currentMonth === monthNum);
    const isPaid = paidMonthNums.has(monthNum);
    const isDueNow = monthNum === currentInstallment && !isPaid;
    const isOverdue = monthNum < currentInstallment && !isPaid;
    const status = isPaid ? 'Paid' : isDueNow ? 'Due Now' : isOverdue ? 'Overdue' : 'Upcoming';
    const dueDate = new Date(scheduleStartDate);
    dueDate.setMonth(dueDate.getMonth() + (monthNum - currentInstallment));
    return { month: monthNum, amount: ma.amount || monthlyInstallment || 0, auctionAmount: ma.auctionAmount || 0, invoice: existingInvoice, status, dueDate };
  });

  const handleGenerateInvoice = async (monthNum, amount) => {
    try {
      toast.add("Generating invoice...");
      const invoiceData = {
        invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`,
        receiptNumber: `RCPT-${Math.floor(Math.random() * 9000) + 1000}`,
        date: new Date(),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        branch: "Chennai Main Branch",
        collectedBy: "Online Portal",
        memberId: userMember.memberId,
        memberName: userMember.name,
        memberMobile: userMember.phone || userMember.mobile,
        memberAddress: userMember.address || "",
        memberAadhar: userMember.aadhaar || "",
        chitName: userScheme?.name || '',
        chitGroup: userGroup?.name || '',
        chitNumber: `CHIT-${userScheme?.amount || ''}-001`,
        totalChitValue: userScheme?.amount || 0,
        monthlyAmount: amount,
        duration: userScheme?.duration || 0,
        currentMonth: monthNum,
        dueDate: new Date(new Date().setDate(new Date().getDate() + 5)),
        installmentAmount: amount,
        lateFine: 0,
        discount: 0,
        previousDue: 0,
        totalPayable: amount,
        amountPaid: 0,
        balance: amount,
        paymentMethod: 'Pending',
        referenceNumber: '',
        paidInstallments: 0,
        remainingInstallments: (userScheme?.duration || 0) - monthNum,
        totalPaid: 0,
        remainingAmount: (userScheme?.amount || 0) - amount,
        status: 'Pending',
        remarks: `Installment ${monthNum}`
      };
      const result = await createData('/invoices', invoiceData);
      toast.add("Invoice generated!", "success");
      return result.invoice || result;
    } catch (err) {
      toast.add("Error generating invoice: " + err.message, "error");
      return null;
    }
  };

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
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#8b5cf6", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><FiCalendar size={18} /></div>
                <div>
                  <div style={{ fontSize: 11, color: dark ? "rgba(255,255,255,.5)" : "#6b7280" }}>Next Due Date</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: dark ? "#f3f4f6" : "#111" }}>{nextDueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: dark ? "rgba(255,255,255,.5)" : "#6b7280" }}>Installment #{nextInstallment}</div>
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
            {/* My Payment — Payment Schedule */}
            <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: dark ? "#f3f4f6" : "#111" }}>My Payment — Payment Schedule</div>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: dark ? "rgba(255,255,255,.5)" : "#6b7280" }}>
                    Installment <span style={{ color: "#2563eb" }}>{currentInstallment > totalMonths ? totalMonths : currentInstallment}</span> of {totalMonths}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: dark ? "rgba(255,255,255,.5)" : "#6b7280" }}>
                    Paid: <span style={{ color: "#10b981" }}>{paidCount}</span> / {totalMonths}
                  </span>
                </div>
              </div>
              {paymentSchedule.length > 0 ? (
                <>
                  <div style={{ background: dark ? "rgba(255,255,255,.1)" : "#e5e7eb", borderRadius: 8, height: 8, marginBottom: 20, overflow: "hidden" }}>
                    <div style={{ width: `${totalMonths > 0 ? (paidCount / totalMonths) * 100 : 0}%`, height: "100%", background: "linear-gradient(90deg, #2563eb, #10b981)", borderRadius: 8, transition: "width 0.5s ease" }} />
                  </div>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap", padding: "14px 0", borderBottom: "1px solid var(--border-color)", marginBottom: 16 }}>
                    <div><span style={{ fontSize: 12, color: "var(--text-muted)" }}>Installment </span><span style={{ fontSize: 15, fontWeight: 700 }}>₹{monthlyInstallment.toLocaleString()}/mo</span></div>
                    <div><span style={{ fontSize: 12, color: "var(--text-muted)" }}>Paid </span><span style={{ fontSize: 15, fontWeight: 700, color: "#10b981" }}>{fmt(totalPaid)}</span></div>
                    <div><span style={{ fontSize: 12, color: "var(--text-muted)" }}>Outstanding </span><span style={{ fontSize: 15, fontWeight: 700, color: "#ef4444" }}>{fmt(totalOutstanding)}</span></div>
                    <div><span style={{ fontSize: 12, color: "var(--text-muted)" }}>Chit Value </span><span style={{ fontSize: 15, fontWeight: 700 }}>{fmt(userScheme?.amount || 0)}</span></div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
                    {paymentSchedule.map(s => {
                      let bg, border, textColor;
                      if (s.status === 'Paid') { bg = "#ecfdf5"; border = "1px solid #10b981"; textColor = "#10b981"; }
                      else if (s.status === 'Due Now') { bg = "#eff6ff"; border = "2px solid #2563eb"; textColor = "#2563eb"; }
                      else if (s.status === 'Overdue') { bg = "#fef2f2"; border = "1px solid #ef4444"; textColor = "#ef4444"; }
                      else { bg = dark ? "rgba(255,255,255,.03)" : "#f9fafb"; border = "1px solid var(--border-color)"; textColor = "var(--text-muted-2)"; }
                      return (
                        <div key={s.month} style={{ background: bg, border, borderRadius: 10, padding: "12px 10px", textAlign: "center" }}>
                          <div style={{ fontSize: 11, color: textColor, fontWeight: s.status === 'Paid' || s.status === 'Due Now' ? 700 : 500, marginBottom: 4 }}>#{s.month}</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: dark ? "#f3f4f6" : "#111", marginBottom: 2 }}>₹{s.amount.toLocaleString()}</div>
                          <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 6 }}>{s.dueDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</div>
                          {s.status === 'Paid' ? (
                            <span style={{ fontSize: 11, color: "#10b981", fontWeight: 600 }}>Paid ✓</span>
                          ) : s.status === 'Due Now' || s.status === 'Overdue' ? (
                            <button onClick={async () => {
                              if (generating) return;
                              if (s.invoice) { setSelectedInvoice(s.invoice); setShowInvoicePopup(true); }
                              else {
                                const existingPending = userInvoices.find(inv => inv.currentMonth === s.month && (inv.status === 'Pending' || inv.status === 'Proof Submitted' || inv.status === 'Due'));
                                if (existingPending) { setSelectedInvoice(existingPending); setShowInvoicePopup(true); return; }
                                setGenerating(true);
                                const newInv = await handleGenerateInvoice(s.month, s.amount);
                                setGenerating(false);
                                if (newInv) { setSelectedInvoice(newInv); setShowInvoicePopup(true); }
                              }
                            }} style={{ padding: "6px 14px", background: generating ? "#93c5fd" : "#2563eb", color: "#fff", border: "none", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: generating ? "not-allowed" : "pointer" }}>{generating ? "..." : "Pay Now"}</button>
                          ) : (
                            <span style={{ fontSize: 11, color: "var(--text-muted-2)" }}>Upcoming</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
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
