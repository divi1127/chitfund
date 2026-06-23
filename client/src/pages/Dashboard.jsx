// Dashboard page component
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../hooks/useData";
import { SectionHeader } from "../components/SectionHeader";
import { StatCard } from "../components/StatCard";
import { MiniBarChart } from "../components/MiniBarChart";
import { Table } from "../components/Table";
import { Badge } from "../components/Badge";
import { Btn } from "../components/Btn";
import { fmt, today } from "../utils/helpers";
import { FiDollarSign, FiUsers, FiFolder, FiFileText, FiBarChart2, FiTag, FiClock, FiTrendingUp } from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";
import { COMPANY, ROUTES } from "../utils/constants";
import { InvoiceModal } from "../components/InvoiceModal";

export function Dashboard({ toast }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: members } = useData('/members');
  const { data: groups } = useData('/groups');
  const { data: collections } = useData('/collections');
  const { data: auctions } = useData('/auctions');
  const { data: schemes } = useData('/schemes');
  const { data: invoices, loading: invoicesLoading } = useData('/invoices');
  const [showInvoicePopup, setShowInvoicePopup] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Find current user's member data
  const userMember = members.find(m => m.email === user?.email || m.memberId === user?.userId);
  
  // Get user's group and scheme data
  const userGroupId = userMember?.groups && userMember.groups[0];
  const userGroup = userGroupId ? groups.find(g => g.id === userGroupId) : null;
  const userScheme = userGroup ? schemes.find(s => s.id === userGroup.schemeId) : null;
  
  // Get user's invoices
  const userInvoices = userMember ? invoices.filter(inv => inv.memberId === userMember.memberId) : [];

  // Calculate outstanding amount - include Due, Pending, Rejected invoices
  const outstandingInvoices = userInvoices.filter(inv => inv.status === 'Due' || inv.status === 'Partially Paid' || inv.status === 'Pending' || inv.status === 'Rejected');
  const totalOutstanding = outstandingInvoices.reduce((sum, inv) => sum + inv.balance, 0);

  // Determine current paid month and next due month — count submitted payments too (Pending, Proof Submitted)
  const paidInvoices = userInvoices.filter(inv => inv.status === 'Paid' || inv.status === 'Proof Submitted' || inv.status === 'Pending');
  const lastPaidMonth = paidInvoices.length > 0 ? Math.max(...paidInvoices.map(inv => inv.currentMonth || 0)) : 0;
  const currentInstallment = paidInvoices.length > 0 ? lastPaidMonth + 1 : (userGroup?.currentInstallment || 1);
  const nextInstallment = currentInstallment + 1;
  const nextDueDate = new Date();
  nextDueDate.setDate(5);
  nextDueDate.setMonth(nextDueDate.getMonth() + 1);
  const nextMonthAmount = userScheme?.monthlyAmounts?.[currentInstallment - 1]?.amount || userScheme?.monthlyInstallment || 0;

  const totalMonths = userScheme?.duration || 0;
  const paidCount = paidInvoices.length;
  const paidMonthNums = new Set(paidInvoices.map(inv => inv.currentMonth));

  const handleGenerateInvoice = async (monthNum, amount, toast) => {
    try {
      toast.add("Generating invoice...");
      const invoiceData = {
        invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`,
        receiptNumber: `RCPT-${Math.floor(Math.random() * 9000) + 1000}`,
        date: new Date(),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        branch: COMPANY.branch,
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
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(invoiceData)
      });
      if (response.ok) {
        const data = await response.json();
        return data.invoice || data;
      } else {
        const err = await response.json().catch(() => ({}));
        toast.add(err.message || "Failed to generate invoice.", "error");
        return null;
      }
    } catch (err) {
      console.error(err);
      toast.add("Error generating invoice.", "error");
      return null;
    }
  };

  const monthlyMap = {};
  collections.forEach(c => {
    const d = new Date(c.date);
    const key = d.getMonth();
    if (!monthlyMap[key]) monthlyMap[key] = 0;
    monthlyMap[key] += c.amount || 0;
  });
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const chartData = monthNames.map((l, i) => ({ l, v: monthlyMap[i] || 0 }));

  const memberById = (id) => members.find((m) => m.id === id);
  const schemeById = (id) => schemes.find((s) => s.id === id);
  const groupById = (id) => groups.find((g) => g.id === id);

  // Regular user/member dashboard
  if (user?.role === 'user' && userMember) {
    return (
      <>
        <div>
        <SectionHeader title="My Dashboard" subtitle={"Welcome back, " + userMember.name}  />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 16, marginBottom: 28 }}>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Member Name</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)" }}>{userMember.name}</div>
          </div>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Member ID</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)" }}>{userMember.memberId}</div>
          </div>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Group</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)" }}>{userGroup?.name || "Not Assigned"}</div>
          </div>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Scheme</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)" }}>{userScheme?.name || "Not Assigned"}</div>
          </div>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Monthly Installment</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)" }}>₹{userScheme?.monthlyInstallment?.toLocaleString() || "0"}</div>
          </div>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Current Due</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "#ef4444" }}>₹{totalOutstanding.toLocaleString()}</div>
          </div>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Next Installment</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)" }}>#{nextInstallment}</div>
          </div>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Next Due Date</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)" }}>{nextDueDate.toLocaleDateString()}</div>
          </div>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Next Month Amount</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)" }}>₹{nextMonthAmount.toLocaleString()}</div>
          </div>
        </div>

        {/* My Payment - Payment Schedule */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>My Payment — Payment Schedule</div>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)" }}>
                Installment <span style={{ color: "#2563eb" }}>{currentInstallment > totalMonths ? totalMonths : currentInstallment}</span> of {totalMonths}
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)" }}>
                Paid: <span style={{ color: "#10b981" }}>{paidCount}</span> / {totalMonths}
              </span>
            </div>
          </div>
          {(() => {
            // Build schedule from scheme's monthlyAmounts
            const monthAmounts = userScheme?.monthlyAmounts || [];
            const totalChitValue = userScheme?.amount || 0;
            const monthlyInstallment = userScheme?.monthlyInstallment || 0;
            const schedule = [];
            for (let i = 0; i < monthAmounts.length; i++) {
              const ma = monthAmounts[i];
              const monthNum = ma.month || (i + 1);
              if (paidMonthNums.has(monthNum)) continue;
              const existingInvoice = userInvoices.find(inv => inv.currentMonth === monthNum);
              const isDue = existingInvoice && (existingInvoice.status === 'Due' || existingInvoice.status === 'Pending' || existingInvoice.status === 'Rejected');
              const isProofSubmitted = existingInvoice?.status === 'Proof Submitted';
              schedule.push({
                month: monthNum,
                amount: ma.amount || monthlyInstallment || 0,
                auctionAmount: ma.auctionAmount || 0,
                invoice: existingInvoice,
                status: existingInvoice?.status || '—',
                canPay: !existingInvoice || (existingInvoice.status !== 'Paid' && existingInvoice.status !== 'Proof Submitted')
              });
            }

            if (schedule.length === 0) {
              return (
                <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
                  <div style={{ fontSize: 15, marginBottom: 8 }}>All installments are paid! 🎉</div>
                  <div style={{ fontSize: 13 }}>No pending payments.</div>
                </div>
              );
            }

            const aucTotal = monthAmounts.reduce((s, m) => s + (m.auctionAmount || 0), 0);
            const emiTotal = monthAmounts.reduce((s, m) => s + (m.amount || monthlyInstallment || 0), 0);

            return (
              <div>
                {/* Summary */}
                <div style={{ display: "flex", gap: 24, padding: "14px 0", borderBottom: "1px solid var(--border-color)", marginBottom: 12 }}>
                  <div><span style={{ fontSize: 12, color: "var(--text-muted)" }}>Monthly </span><span style={{ fontSize: 15, fontWeight: 700 }}>₹{monthlyInstallment.toLocaleString()}/mo</span></div>
                  <div><span style={{ fontSize: 12, color: "var(--text-muted)" }}>Total </span><span style={{ fontSize: 15, fontWeight: 700 }}>₹{emiTotal.toLocaleString()}</span></div>
                  <div><span style={{ fontSize: 12, color: "var(--text-muted)" }}>Chit Value </span><span style={{ fontSize: 15, fontWeight: 700 }}>₹{totalChitValue.toLocaleString()}</span></div>
                </div>

                {/* Installment list */}
                {schedule.map((s) => {
                  const isFirst = s.month === schedule[0]?.month;
                  return (
                    <div key={s.month} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 0", borderBottom: "1px solid var(--border-color)" }}>
                      <div style={{ width: 40, height: 40, borderRadius: "50%", background: isFirst ? "#2563eb" : "var(--bg-card-alt)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: isFirst ? "#fff" : "var(--text-muted)", flexShrink: 0 }}>#{s.month}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>₹{s.amount.toLocaleString()}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{s.auctionAmount > 0 ? `Auction: ₹${s.auctionAmount.toLocaleString()}` : 'No auction'}</div>
                      </div>
                      <div>
                        {s.canPay ? (
                          isFirst ? (
                            <button onClick={async () => {
                              if (s.invoice) { setSelectedInvoice(s.invoice); setShowInvoicePopup(true); }
                              else {
                                const newInv = await handleGenerateInvoice(s.month, s.amount, toast);
                                if (newInv) { setSelectedInvoice(newInv); setShowInvoicePopup(true); }
                              }
                            }} style={{ padding: "8px 18px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Due Now</button>
                          ) : (
                            <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>5 {new Date(new Date().getFullYear(), new Date().getMonth() + (s.month - schedule[0].month) + 1, 5).toLocaleString('default', { month: 'short' })}</span>
                          )
                        ) : (
                          <span style={{ fontSize: 12, color: "#10b981", fontWeight: 600 }}>{s.status === 'Proof Submitted' ? 'Awaiting' : 'Paid ✓'}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

        {/* Payment History */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>Payment History</div>
          {(() => {
            const paidUserInvoices = userInvoices.filter(inv => inv.status === 'Paid' || inv.status === 'Proof Submitted');
            if (paidUserInvoices.length === 0) {
              return <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>No payment history available.</div>;
            }
            return (
              <Table  cols={["Invoice No", "Date", "Amount Paid", "Payment Mode", "Status"]}
                rows={paidUserInvoices.map(inv => [
                  inv.invoiceNumber,
                  new Date(inv.date).toLocaleDateString(),
                  `₹${inv.amountPaid.toLocaleString()}`,
                  inv.paymentMethod,
                  <Badge key={inv.id} text={inv.status} color={inv.status === 'Paid' ? 'green' : 'blue'} />
                ])} />
            );
          })()}
        </div>
      </div>

      {/* Invoice Modal for user */}
      {showInvoicePopup && selectedInvoice && (
        <InvoiceModal
          invoice={selectedInvoice}
          onClose={() => { setShowInvoicePopup(false); setSelectedInvoice(null); }}
          onPaymentSuccess={() => { window.location.reload(); }}
          toast={toast}
        />
      )}
    </>
    );
  }

  // Admin dashboard (super_admin, sub_admin)
  // Calculate monthly collections for current month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyCollections = collections.filter(c => {
    const collectionDate = new Date(c.date);
    return collectionDate.getMonth() === currentMonth && collectionDate.getFullYear() === currentYear;
  });
  const monthlyCollectionsAmount = monthlyCollections.reduce((sum, c) => sum + (c.amount || 0), 0);

  return (
    <div>
      <SectionHeader title="Dashboard" subtitle={"Good morning! Here's what's happening today, " + today()}  />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16, marginBottom: 28 }}>
        <StatCard label="Monthly Collections" value={`₹${monthlyCollectionsAmount.toLocaleString()}`} sub={`Current month (${new Date().toLocaleString('default', { month: 'long' })})`} color="#10b981"  icon={<FiDollarSign size={22} />} />
        <StatCard label="Total Members" value={members.length} sub="Active members" color="#d97706"  icon={<FiUsers size={22} />} />
        <StatCard label="Total Groups" value={groups.length} sub="Running groups" color="#16a34a"  icon={<FiFolder size={22} />} />
        <StatCard label="Total Schemes" value={schemes.length} sub="Available schemes" color="#2563eb"  icon={<FiFileText size={22} />} />
        <StatCard label="Total Collections" value={collections.filter(c => c.status === "Paid").length} sub="Paid collections" color="#8b5cf6"  icon={<FiBarChart2 size={22} />} />
        <StatCard label="Auctions" value={auctions.length} sub="Total auctions" color="#f59e0b"  icon={<FiTag size={22} />} />
        <StatCard label="Auctions Pending" value={auctions.filter(a => a.status === "Scheduled").length} sub="Scheduled auctions" color="#dc2626"  icon={<FiClock size={22} />} />
        <StatCard label="Total Amount" value={fmt(collections.reduce((sum, c) => sum + (c.amount || 0), 0))} sub="Collected amount" color="#dc2626"  icon={<FiTrendingUp size={22} />} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Collections chart */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>Monthly Collections</div>
          <div style={{ fontSize: 12, color: "var(--text-muted-2)", marginBottom: 16 }}>{new Date().getFullYear()}</div>
          <MiniBarChart data={chartData}  />
        </div>
        {/* Upcoming auctions */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>Upcoming Auctions</div>
          {auctions.filter(a => a.status === "Scheduled").map(a => {
            const g = groupById(a.groupId);
            const s = g ? schemeById(g.schemeId) : null;
            return (
              <div key={a.id} style={{ padding: "10px 0", borderBottom: "1px solid var(--border-color)" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{g?.name}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted-2)" }}>{a.date?.split('T')[0]} · {s?.name}</div>
                <Badge text="Scheduled" color="blue" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Approvals (admin only) */}
      {user?.role !== 'user' && (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 14 }}>
            Payment Approvals {invoices.filter(inv => inv.status === 'Proof Submitted' || inv.status === 'Pending').length > 0 && (
              <span style={{ background: "#ef4444", color: "#fff", borderRadius: 12, padding: "2px 10px", fontSize: 11, marginLeft: 8, fontWeight: 700 }}>
                {invoices.filter(inv => inv.status === 'Proof Submitted' || inv.status === 'Pending').length}
              </span>
            )}
          </div>
          {(() => {
            const pendingApprovals = invoices.filter(inv => inv.status === 'Proof Submitted' || inv.status === 'Pending');
            if (pendingApprovals.length === 0) return <div style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", padding: 20 }}>No pending payment approvals.</div>;
            return pendingApprovals.map(inv => (
              <div key={inv._id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 0", borderBottom: "1px solid var(--border-color)" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>{inv.memberName}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{inv.invoiceNumber} · ₹{inv.totalPayable?.toLocaleString()} · {inv.paymentMethod}</div>
                  <div style={{ fontSize: 11, color: inv.status === 'Proof Submitted' ? '#2563eb' : '#d97706' }}>{inv.status === 'Proof Submitted' ? 'Screenshot uploaded' : 'Cash payment pending'}</div>
                </div>
                {inv.paymentProof && (
                  <a href={inv.paymentProof} target="_blank" rel="noopener noreferrer" style={{ width: 60, height: 60, borderRadius: 8, overflow: "hidden", border: "1px solid var(--border-color)", display: "block", flexShrink: 0 }}>
                    <img src={inv.paymentProof} alt="Proof" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </a>
                )}
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button onClick={async () => {
                    try {
                      const res = await fetch(`/api/invoices/${inv._id}/approve`, {
                        method: 'PATCH',
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                      });
                      if (res.ok) { toast.add(`Payment approved for ${inv.memberName}`, 'success'); window.location.reload(); }
                      else { const d = await res.json(); toast.add(d.message || 'Approval failed', 'error'); }
                    } catch (e) { toast.add('Approval error', 'error'); }
                  }} style={{ padding: "6px 14px", background: "#10b981", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Approve</button>
                  <button onClick={async () => {
                    const reason = prompt('Rejection reason:');
                    if (!reason) return;
                    try {
                      const res = await fetch(`/api/invoices/${inv._id}/reject`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
                        body: JSON.stringify({ reason })
                      });
                      if (res.ok) { toast.add(`Payment rejected for ${inv.memberName}`, 'error'); window.location.reload(); }
                      else { const d = await res.json(); toast.add(d.message || 'Rejection failed', 'error'); }
                    } catch (e) { toast.add('Rejection error', 'error'); }
                  }} style={{ padding: "6px 14px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Reject</button>
                </div>
              </div>
            ));
          })()}
        </div>
      )}

      {/* Recent collections */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 14 }}>Recent Collections</div>
        <Table  cols={["Receipt No", "Member", "Group", "Amount", "Date", "Mode", "Status"]}
          rows={collections.slice(0, 5).map(c => {
            const m = memberById(c.memberId); const g = groupById(c.groupId);
            return [c.receiptNo || "–", m?.name, g?.name, fmt(c.amount), c.date?.split('T')[0], c.mode,
              <Badge key={c.id} text={c.status} color={c.status === "Paid" ? "green" : "yellow"} />
            ];
          })}
        />
      </div>

      {/* Invoice Modal */}
      {showInvoicePopup && (
        <InvoiceModal
          invoice={selectedInvoice}
          onClose={() => setShowInvoicePopup(false)}
          onPaymentSuccess={() => {
            // Re-fetch data if needed or refresh
            window.location.reload();
          }}
          toast={toast}
        />
      )}
    </div>
  );
}
