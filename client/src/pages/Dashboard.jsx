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

export function Dashboard({ dark, toast }) {
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

  // Calculate outstanding amount
  const outstandingInvoices = userInvoices.filter(inv => inv.status === 'Due' || inv.status === 'Partially Paid' || inv.status === 'Pending');
  const totalOutstanding = outstandingInvoices.reduce((sum, inv) => sum + inv.balance, 0);

  // Calculate next month details
  const currentInstallment = userGroup?.currentInstallment || 1;
  const nextInstallment = currentInstallment + 1;
  const nextDueDate = new Date();
  nextDueDate.setDate(5);
  nextDueDate.setMonth(nextDueDate.getMonth() + 1);
  const nextMonthAmount = userScheme?.monthlyInstallment || 0;

  const chartData = [
    { l: "Jan", v: 180000 }, { l: "Feb", v: 220000 }, { l: "Mar", v: 195000 },
    { l: "Apr", v: 260000 }, { l: "May", v: 310000 }, { l: "Jun", v: 285000 },
  ];

  const memberById = (id) => members.find((m) => m.id === id);
  const schemeById = (id) => schemes.find((s) => s.id === id);
  const groupById = (id) => groups.find((g) => g.id === id);

  // Regular user/member dashboard
  if (user?.role === 'user' && userMember) {
    return (
      <>
        <div>
        <SectionHeader title="My Dashboard" subtitle={"Welcome back, " + userMember.name} dark={dark} />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 16, marginBottom: 28 }}>
          <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 12, color: dark ? "rgba(255,255,255,.5)" : "#6b7280", marginBottom: 4 }}>Member Name</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: dark ? "#f3f4f6" : "#111" }}>{userMember.name}</div>
          </div>
          <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 12, color: dark ? "rgba(255,255,255,.5)" : "#6b7280", marginBottom: 4 }}>Member ID</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: dark ? "#f3f4f6" : "#111" }}>{userMember.memberId}</div>
          </div>
          <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 12, color: dark ? "rgba(255,255,255,.5)" : "#6b7280", marginBottom: 4 }}>Group</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: dark ? "#f3f4f6" : "#111" }}>{userGroup?.name || "Not Assigned"}</div>
          </div>
          <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 12, color: dark ? "rgba(255,255,255,.5)" : "#6b7280", marginBottom: 4 }}>Scheme</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: dark ? "#f3f4f6" : "#111" }}>{userScheme?.name || "Not Assigned"}</div>
          </div>
          <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 12, color: dark ? "rgba(255,255,255,.5)" : "#6b7280", marginBottom: 4 }}>Monthly Installment</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: dark ? "#f3f4f6" : "#111" }}>₹{userScheme?.monthlyInstallment?.toLocaleString() || "0"}</div>
          </div>
          <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 12, color: dark ? "rgba(255,255,255,.5)" : "#6b7280", marginBottom: 4 }}>Current Due</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "#ef4444" }}>₹{totalOutstanding.toLocaleString()}</div>
          </div>
          <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 12, color: dark ? "rgba(255,255,255,.5)" : "#6b7280", marginBottom: 4 }}>Next Installment</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: dark ? "#f3f4f6" : "#111" }}>#{nextInstallment}</div>
          </div>
          <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 12, color: dark ? "rgba(255,255,255,.5)" : "#6b7280", marginBottom: 4 }}>Next Due Date</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: dark ? "#f3f4f6" : "#111" }}>{nextDueDate.toLocaleDateString()}</div>
          </div>
          <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 12, color: dark ? "rgba(255,255,255,.5)" : "#6b7280", marginBottom: 4 }}>Next Month Amount</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: dark ? "#f3f4f6" : "#111" }}>₹{nextMonthAmount.toLocaleString()}</div>
          </div>
        </div>

        {/* Outstanding Payments */}
        <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 16 }}>Outstanding Payments</div>
          {outstandingInvoices.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: dark ? "rgba(255,255,255,.6)" : "#6b7280" }}>
              <div style={{ marginBottom: 16 }}>No outstanding payments. All payments are up to date!</div>
              {userScheme && userInvoices.length === 0 && (
                <button
                  onClick={async () => {
                    try {
                      toast.add("Generating invoice...");
                      const generateInvoiceNumber = () => `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;
                      const generateReceiptNumber = () => `RCPT-${Math.floor(Math.random() * 9000) + 1000}`;
                      
                      const invoiceData = {
                          invoiceNumber: generateInvoiceNumber(),
                          receiptNumber: generateReceiptNumber(),
                          date: new Date(),
                          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                          branch: "Main Branch",
                          collectedBy: "Online Portal",
                          memberId: userMember.memberId,
                          memberName: userMember.name,
                          memberMobile: userMember.phone || userMember.mobile,
                          memberAddress: userMember.address || "",
                          memberAadhar: userMember.aadhaar || "",
                          chitName: userScheme.name,
                          chitGroup: userGroup.name,
                          chitNumber: `CHIT-${userScheme.amount}-001`,
                          totalChitValue: userScheme.amount,
                          monthlyAmount: userScheme.monthlyInstallment,
                          duration: userScheme.duration,
                          currentMonth: userGroup.currentInstallment || 1,
                          dueDate: new Date(new Date().setDate(new Date().getDate() + 5)),
                          installmentAmount: userScheme.monthlyInstallment,
                          lateFine: 0,
                          discount: 0,
                          previousDue: 0,
                          totalPayable: userScheme.monthlyInstallment,
                          amountPaid: 0,
                          balance: userScheme.monthlyInstallment,
                          paymentMethod: 'Pending',
                          referenceNumber: '',
                          paidInstallments: 0,
                          remainingInstallments: userScheme.duration,
                          totalPaid: 0,
                          remainingAmount: userScheme.amount,
                          status: 'Pending',
                          remarks: 'First installment'
                      };

                      const response = await fetch('http://localhost:5000/api/invoices', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(invoiceData)
                      });

                      if (response.ok) {
                          const data = await response.json();
                          const newInvoice = data.invoice || data;
                          setSelectedInvoice(newInvoice);
                          setShowInvoicePopup(true);
                      } else {
                          const err = await response.json().catch(() => ({}));
                          toast.add(err.message || "Failed to generate. Please try again.", "error");
                      }
                    } catch (err) {
                      console.error(err);
                      toast.add("Error generating the invoice.", "error");
                    }
                  }}
                  style={{ fontSize: 14, padding: "10px 20px", borderRadius: 8, border: "1px solid #2563eb", background: "#2563eb", color: "#fff", cursor: "pointer", fontWeight: 600 }}
                >
                  Pay Now
                </button>
              )}
            </div>
          ) : (
            <Table dark={dark} cols={["Invoice No", "Due Date", "Amount", "Balance", "Status", "Action"]}
              rows={outstandingInvoices.map(inv => [
                inv.invoiceNumber,
                new Date(inv.dueDate).toLocaleDateString(),
                `₹${inv.totalPayable.toLocaleString()}`,
                `₹${inv.balance.toLocaleString()}`,
                <Badge key={inv.id} text={inv.status} color={inv.status === 'Due' ? 'red' : inv.status === 'Pending' ? 'orange' : 'yellow'} />,
                inv.status !== 'Paid' ? (
                  <button
                    key={inv.id}
                    onClick={() => {
                      setSelectedInvoice(inv);
                      setShowInvoicePopup(true);
                    }}
                    style={{ fontSize: 11, padding: "6px 12px", borderRadius: 6, border: "1px solid #2563eb", background: "#2563eb", color: "#fff", cursor: "pointer", fontWeight: 600 }}
                  >
                    Pay Now
                  </button>
                ) : (
                  <span key={inv.id} style={{ fontSize: 11, color: "#10b981", fontWeight: 600 }}>Paid</span>
                )
              ])} />
          )}
        </div>

        {/* Payment History */}
        <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 16 }}>Payment History</div>
          {userInvoices.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: dark ? "rgba(255,255,255,.6)" : "#6b7280" }}>
              No payment history available.
            </div>
          ) : (
            <Table dark={dark} cols={["Invoice No", "Date", "Amount Paid", "Payment Mode", "Status"]}
              rows={userInvoices.map(inv => [
                inv.invoiceNumber,
                new Date(inv.date).toLocaleDateString(),
                `₹${inv.amountPaid.toLocaleString()}`,
                inv.paymentMethod,
                <Badge key={inv.id} text={inv.status} color={inv.status === 'Paid' ? 'green' : inv.status === 'Partially Paid' ? 'yellow' : 'red'} />
              ])} />
          )}
        </div>
      </div>

      {/* Invoice Modal for user */}
      {showInvoicePopup && selectedInvoice && (
        <InvoiceModal
          invoice={selectedInvoice}
          dark={dark}
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
      <SectionHeader title="Dashboard" subtitle={"Good morning! Here's what's happening today, " + today()} dark={dark} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16, marginBottom: 28 }}>
        <StatCard label="Monthly Collections" value={`₹${monthlyCollectionsAmount.toLocaleString()}`} sub={`Current month (${new Date().toLocaleString('default', { month: 'long' })})`} color="#10b981" dark={dark} icon={<FiDollarSign size={22} />} />
        <StatCard label="Total Members" value={members.length} sub="Active members" color="#d97706" dark={dark} icon={<FiUsers size={22} />} />
        <StatCard label="Total Groups" value={groups.length} sub="Running groups" color="#16a34a" dark={dark} icon={<FiFolder size={22} />} />
        <StatCard label="Total Schemes" value={schemes.length} sub="Available schemes" color="#2563eb" dark={dark} icon={<FiFileText size={22} />} />
        <StatCard label="Total Collections" value={collections.length} sub="All collections" color="#8b5cf6" dark={dark} icon={<FiBarChart2 size={22} />} />
        <StatCard label="Auctions" value={auctions.length} sub="Total auctions" color="#f59e0b" dark={dark} icon={<FiTag size={22} />} />
        <StatCard label="Auctions Pending" value={auctions.filter(a => a.status === "Scheduled").length} sub="Scheduled auctions" color="#dc2626" dark={dark} icon={<FiClock size={22} />} />
        <StatCard label="Total Amount" value={fmt(collections.reduce((sum, c) => sum + (c.amount || 0), 0))} sub="Collected amount" color="#dc2626" dark={dark} icon={<FiTrendingUp size={22} />} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Collections chart */}
        <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 4 }}>Monthly Collections</div>
          <div style={{ fontSize: 12, color: dark ? "rgba(255,255,255,.4)" : "#9ca3af", marginBottom: 16 }}>Jan – Jun 2024</div>
          <MiniBarChart data={chartData} dark={dark} />
        </div>
        {/* Upcoming auctions */}
        <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 12 }}>Upcoming Auctions</div>
          {auctions.filter(a => a.status === "Scheduled").map(a => {
            const g = groupById(a.groupId);
            const s = g ? schemeById(g.schemeId) : null;
            return (
              <div key={a.id} style={{ padding: "10px 0", borderBottom: dark ? "1px solid rgba(255,255,255,.07)" : "1px solid #f3f4f6" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: dark ? "#f3f4f6" : "#111" }}>{g?.name}</div>
                <div style={{ fontSize: 11, color: dark ? "rgba(255,255,255,.4)" : "#9ca3af" }}>{a.date?.split('T')[0]} · {s?.name}</div>
                <Badge text="Scheduled" color="blue" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent collections */}
      <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 14 }}>Recent Collections</div>
        <Table dark={dark} cols={["Receipt No", "Member", "Group", "Amount", "Date", "Mode", "Status"]}
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
          dark={dark}
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
