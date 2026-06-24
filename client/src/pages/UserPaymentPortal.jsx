// User Payment Portal for online payments
import { useState } from "react";
import { useData } from "../hooks/useData";
import { createData } from "../utils/api";
import { SectionHeader } from "../components/SectionHeader";
import { Table } from "../components/Table";
import { Badge } from "../components/Badge";
import { Btn } from "../components/Btn";
import { Input } from "../components/Input";
import { useAuth } from "../contexts/AuthContext";
import { COMPANY } from "../utils/constants";
import { QRCodeCanvas } from "qrcode.react";
import { IconBtn } from "../components/IconBtn";
import { HiCreditCard } from "react-icons/hi2";

export function UserPaymentPortal({ toast }) {
  const { user } = useAuth();
  const { data: invoices, loading: invoicesLoading, refresh: refreshInvoices } = useData('/invoices');
  const { data: members, loading: membersLoading } = useData('/members');
  const { data: groups } = useData('/groups');
  const { data: schemes } = useData('/schemes');
  const { data: collections, refresh: refreshCollections } = useData('/collections');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [form, setForm] = useState({
    amount: 0,
    paymentMethod: 'UPI',
    upiId: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    referenceNumber: ''
  });

  // Find member associated with current user
  const userMember = members.find(m => m.email === user?.email || m.memberId === user?.userId);

  // Get user's group and scheme data
  const userGroupId = userMember?.groups && userMember.groups[0];
  const userGroup = userGroupId ? groups.find(g => g.id === userGroupId) : null;
  const userScheme = userGroup ? schemes.find(s => s.id === userGroup.schemeId) : null;

  // Get user's invoices
  const userInvoices = userMember ? invoices.filter(inv => inv.memberId === userMember.memberId) : [];

  // Calculate outstanding amount
  const outstandingInvoices = userInvoices.filter(inv => inv.status === 'Due' || inv.status === 'Partially Paid');
  const totalOutstanding = outstandingInvoices.reduce((sum, inv) => sum + inv.balance, 0);

  // Build payment schedule from installments
  const duration = userScheme?.duration || 50;
  const monthlyAmount = userScheme?.monthlyAmounts?.[(userGroup?.currentInstallment || 1) - 1]?.amount || userScheme?.monthlyInstallment || 0;
  const currentInstallment = userGroup?.currentInstallment || 1;
  const paidInstallmentNumbers = userInvoices
    .filter(inv => inv.status === 'Paid')
    .map(inv => inv.currentMonth || 0);
  
  const scheduleStartDate = new Date();
  scheduleStartDate.setDate(5);
  // Set to previous months to show from beginning of scheme
  const schedule = Array.from({ length: duration }, (_, i) => {
    const installmentNo = i + 1;
    const dueDate = new Date(scheduleStartDate);
    dueDate.setMonth(dueDate.getMonth() + (i - (currentInstallment - 1)));
    const isPaid = paidInstallmentNumbers.includes(installmentNo);
    const isCurrent = installmentNo === currentInstallment;
    const isOverdue = installmentNo < currentInstallment && !isPaid;
    const status = isPaid ? 'Paid' : isCurrent ? 'Due Now' : isOverdue ? 'Overdue' : 'Upcoming';
    return { installment: installmentNo, dueDate, amount: monthlyAmount, status };
  });

  // Show only recent + current + upcoming months (last 3 paid, current, next 3)
  const currentIndex = schedule.findIndex(s => s.installment === currentInstallment);
  const visibleSchedule = schedule.slice(Math.max(0, currentIndex - 3), currentIndex + 4);

  const handlePayment = async () => {
    if (!selectedInvoice) {
      toast.add("Please select an invoice to pay", "error");
      return;
    }

    try {
      const paymentData = {
        ...selectedInvoice,
        amountPaid: parseFloat(form.amount),

        balance: selectedInvoice.balance - parseFloat(form.amount),
        status: parseFloat(form.amount) >= selectedInvoice.balance ? 'Paid' : 'Partially Paid',
        remarks: `Online payment via user portal - ${form.paymentMethod}`
      };

      await createData('/invoices', paymentData);
      
      // Automatically create collection entry
      const memberCollections = collections.filter(c => c.memberId === selectedInvoice.memberId);
      const previousTotal = memberCollections.reduce((sum, c) => sum + (c.amount || 0), 0);
      
      const collectionData = {
        memberId: selectedInvoice.memberId,
        groupId: userGroupId,
        amount: parseFloat(form.amount),
        mode: form.paymentMethod,
        date: new Date().toISOString().split('T')[0],
        status: 'Paid',
        installment: userGroup?.currentInstallment || 1,
        receiptNo: `RCP-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        cumulativeAmount: previousTotal + parseFloat(form.amount),
        totalSchemeValue: userScheme?.amount || 0
      };
      await createData('/collections', collectionData);
      
      toast.add("Payment successful!");
      setShowPaymentForm(false);
      setSelectedInvoice(null);
      setForm({ amount: 0, paymentMethod: 'UPI', upiId: '', cardNumber: '', expiryDate: '', cvv: '', referenceNumber: '' });
      refreshInvoices();
      refreshCollections();
    } catch (error) {
      toast.add("Payment failed: " + error.message, "error");
    }
  };

  if (invoicesLoading || membersLoading) return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;

  return (
    <div>
      <SectionHeader title="My Payments" subtitle="View and pay your chit installments online" />

      <div style={{ display: "grid", gap: 24 }}>
        {/* User Summary Card */}
        {userMember && (
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>My Account Summary</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16 }}>
              <div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Member Name</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>{userMember.name}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Member ID</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>{userMember.memberId}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Group</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>{userGroup?.name || "Not Assigned"}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Scheme</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>{userScheme?.name || "Not Assigned"}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Monthly Installment</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>₹{(userScheme?.monthlyAmounts?.[(userGroup?.currentInstallment || 1) - 1]?.amount || userScheme?.monthlyInstallment)?.toLocaleString() || "0"}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Current Due</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#ef4444" }}>₹{totalOutstanding.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Next Due Date</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>{outstandingInvoices.length > 0 ? new Date(outstandingInvoices[0].dueDate).toLocaleDateString() : "No pending dues"}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Status</div>
                <Badge text={totalOutstanding > 0 ? "Pending" : "Up to Date"} color={totalOutstanding > 0 ? "red" : "green"} />
              </div>
            </div>
          </div>
        )}

        {/* Outstanding Payments */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>Outstanding Payments</div>
          {outstandingInvoices.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
              No outstanding payments. All payments are up to date!
            </div>
          ) : (
            <Table cols={["Invoice No", "Due Date", "Amount", "Balance", "Status", "Action"]}
              rows={outstandingInvoices.map(inv => [
                inv.invoiceNumber,
                new Date(inv.dueDate).toLocaleDateString(),
                `₹${inv.totalPayable.toLocaleString()}`,
                `₹${inv.balance.toLocaleString()}`,
                <Badge key={inv.id} text={inv.status} color={inv.status === 'Due' ? 'red' : 'yellow'} />,
                <IconBtn key={inv.id} icon={<HiCreditCard size={14} />} onClick={() => { setSelectedInvoice(inv); setForm({ ...form, amount: inv.balance }); setShowPaymentForm(true); }} color="#2563eb" title="Pay Now" />
              ])} />
          )}
        </div>

        {/* Payment Schedule Tracker */}
        {userScheme && (
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>
              Payment Schedule
              <span style={{ fontSize: 12, fontWeight: 400, marginLeft: 12, color: "var(--text-muted-2)" }}>
                Installment {currentInstallment} of {duration}
              </span>
            </div>
            
            {/* Progress Bar */}
            <div style={{ background: "var(--border-color)", borderRadius: 8, height: 8, marginBottom: 20, position: "relative", overflow: "hidden" }}>
              <div style={{ width: `${(currentInstallment / duration) * 100}%`, height: "100%", background: "linear-gradient(90deg, #2563eb, #10b981)", borderRadius: 8, transition: "width 0.5s ease" }} />
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, fontSize: 13, color: "var(--text-muted)" }}>
              <span>Paid: {paidInstallmentNumbers.length} / {duration}</span>
              <span>₹{monthlyAmount.toLocaleString()}/month</span>
              <span>Total: ₹{(monthlyAmount * duration).toLocaleString()}</span>
            </div>

            {/* Schedule Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10 }}>
              {visibleSchedule.map((item) => {
                const isPaid = item.status === 'Paid';
                const isDueNow = item.status === 'Due Now';
                const isOverdue = item.status === 'Overdue';
                const isUpcoming = item.status === 'Upcoming';
                
                let bg, border, textColor;
                if (isPaid) {
                  bg = "#ecfdf5";
                  border = "1px solid #10b981";
                  textColor = "#10b981";
                } else if (isDueNow) {
                  bg = "#eff6ff";
                  border = "2px solid #2563eb";
                  textColor = "#2563eb";
                } else if (isOverdue) {
                  bg = "#fef2f2";
                  border = "1px solid #ef4444";
                  textColor = "#ef4444";
                } else {
                  bg = "var(--bg-card-alt)";
                  border = "1px solid var(--border-color)";
                  textColor = "var(--text-muted-2)";
                }

                return (
                  <div key={item.installment} style={{
                    background: bg,
                    border,
                    borderRadius: 10,
                    padding: "12px 10px",
                    textAlign: "center",
                    transition: "all 0.2s",
                    cursor: isDueNow ? "pointer" : "default",
                  }}>
                    <div style={{ fontSize: 11, color: textColor, fontWeight: isDueNow || isPaid ? 700 : 500, marginBottom: 4 }}>
                      #{item.installment}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>
                      ₹{item.amount.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 10, color: textColor, marginTop: 4 }}>
                      {item.status === 'Paid' ? '✅ Paid' : item.status === 'Due Now' ? '🔵 Due Now' : item.status === 'Overdue' ? '🔴 Overdue' : item.dueDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Legend */}
            <div style={{ display: "flex", gap: 20, marginTop: 16, fontSize: 11, color: "var(--text-muted)", justifyContent: "center" }}>
              <span><span style={{ color: "#10b981" }}>●</span> Paid</span>
              <span><span style={{ color: "#2563eb" }}>●</span> Due Now</span>
              <span><span style={{ color: "#ef4444" }}>●</span> Overdue</span>
              <span><span style={{ color: "#d1d5db" }}>●</span> Upcoming</span>
            </div>
          </div>
        )}

        {/* Payment History */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>Payment History</div>
          {userInvoices.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
              No payment history available.
            </div>
          ) : (
            <Table cols={["Invoice No", "Date", "Amount Paid", "Payment Mode", "Status"]}
              rows={userInvoices.map(inv => [
                inv.invoiceNumber,
                new Date(inv.date).toLocaleDateString(),
                `₹${inv.amountPaid.toLocaleString()}`,
                inv.paymentMethod,
                <Badge key={inv.id} text={inv.status} color={inv.status === 'Paid' ? 'green' : inv.status === 'Partially Paid' ? 'yellow' : 'red'} />
              ])} />
          )}
        </div>

        {/* Payment Form Modal */}
        {showPaymentForm && selectedInvoice && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "var(--bg-card)", borderRadius: 12, maxWidth: 500, width: "90%", maxHeight: "90vh", overflow: "auto", padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>Make Payment</div>
                <button onClick={() => setShowPaymentForm(false)} style={{ fontSize: 24, background: "none", border: "none", cursor: "pointer", color: "var(--text-primary)" }}>×</button>
              </div>

              <div style={{ marginBottom: 20, padding: 16, background: "var(--bg-card)", borderRadius: 8 }}>
                <div style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 4 }}>Invoice Number</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>{selectedInvoice.invoiceNumber}</div>
                <div style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 4 }}>Amount Due</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#ef4444" }}>₹{selectedInvoice.balance.toLocaleString()}</div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <Input label="Payment Amount" value={form.amount} onChange={v => setForm({ ...form, amount: v })} type="number" />
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 12 }}>Payment Method</div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {['Cash', 'Bank Transfer', 'UPI', 'Card', 'Net Banking'].map(method => (
                    <button
                      key={method}
                      onClick={() => setForm({ ...form, paymentMethod: method })}
                      style={{
                        padding: "10px 20px",
                        borderRadius: 8,
                        border: form.paymentMethod === method ? "2px solid #2563eb" : "1px solid #d1d5db",
                        background: form.paymentMethod === method ? "rgba(37, 99, 235, 0.1)" : "var(--bg-card)",
                        color: "var(--text-primary)",
                        cursor: "pointer",
                        fontSize: 14,
                        fontWeight: form.paymentMethod === method ? 600 : 400
                      }}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {form.paymentMethod === 'Cash' && (
                <div style={{ marginBottom: 20, padding: 16, background: "var(--bg-card)", borderRadius: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>Cash Payment Instructions</div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12, whiteSpace: "pre-line" }}>
                    {COMPANY.cashInstructions || "Please visit our office to make cash payment."}
                  </div>
                  <Input label="Reference Number (Optional)" value={form.referenceNumber} onChange={v => setForm({ ...form, referenceNumber: v })} placeholder="Receipt number" />
                </div>
              )}

              {form.paymentMethod === 'Bank Transfer' && (
                <div style={{ marginBottom: 20, padding: 16, background: "var(--bg-card)", borderRadius: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>Bank Transfer Details</div>
                  {COMPANY.bankName && <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>Bank Name: {COMPANY.bankName}</div>}
                  {COMPANY.accountName && <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>Account Name: {COMPANY.accountName}</div>}
                  {COMPANY.accountNumber && <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>Account Number: {COMPANY.accountNumber}</div>}
                  {COMPANY.ifscCode && <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>IFSC Code: {COMPANY.ifscCode}</div>}
                  <div style={{ marginTop: 16 }}>
                    <Input label="Transaction Reference Number" value={form.referenceNumber} onChange={v => setForm({ ...form, referenceNumber: v })} placeholder="Enter transaction ID" />
                  </div>
                </div>
              )}

              {form.paymentMethod === 'UPI' && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ marginBottom: 16, padding: 16, background: "var(--bg-card)", borderRadius: 8 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>UPI Payment Options</div>
                    {COMPANY.upiId && <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>UPI ID: {COMPANY.upiId}</div>}
                    {COMPANY.googlePay && <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>Google Pay: {COMPANY.googlePay}</div>}
                    {COMPANY.phonePe && <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>PhonePe: {COMPANY.phonePe}</div>}
                    {COMPANY.paytm && <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>Paytm: {COMPANY.paytm}</div>}
                  </div>
                  <Input label="Select UPI App" value={form.upiId} onChange={v => setForm({ ...form, upiId: v })} placeholder="Enter UPI ID from above" />
                  <div style={{ marginTop: 16, textAlign: "center" }}>
                    <QRCodeCanvas value={`upi://pay?pa=${form.upiId || COMPANY.upiId}&pn=${COMPANY.name}&am=${form.amount}&cu=INR`} size={150} level="H" />
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>Scan to pay via UPI</div>
                  </div>
                </div>
              )}

              {form.paymentMethod === 'Card' && (
                <>
                  <div style={{ marginBottom: 16, padding: 16, background: "var(--bg-card)", borderRadius: 8 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>Card Payment Gateway</div>
                    <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>Payment Gateway: {COMPANY.cardGateway || "—"}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted-2)" }}>
                      {COMPANY.cardGateway ? `Secure payment processing via ${COMPANY.cardGateway}` : ""}
                    </div>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <Input label="Card Number" value={form.cardNumber} onChange={v => setForm({ ...form, cardNumber: v })} placeholder="1234 5678 9012 3456" />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                    <Input label="Expiry Date" value={form.expiryDate} onChange={v => setForm({ ...form, expiryDate: v })} placeholder="MM/YY" />
                    <Input label="CVV" value={form.cvv} onChange={v => setForm({ ...form, cvv: v })} placeholder="123" type="password" />
                  </div>
                </>
              )}

              {form.paymentMethod === 'Net Banking' && (
                <div style={{ marginBottom: 20, padding: 16, background: "var(--bg-card)", borderRadius: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>Net Banking</div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>
                    You will be redirected to your bank's secure payment gateway
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted-2)", marginBottom: 12 }}>
                    Supported banks: All major Indian banks
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>
                    Payment Gateway: {COMPANY.cardGateway || "—"}
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                <Btn label="Pay Now" onClick={handlePayment} primary style={{ flex: 1 }} />
                <Btn label="Cancel" onClick={() => setShowPaymentForm(false)} style={{ flex: 1 }} />
              </div>

              <div style={{ marginTop: 16, textAlign: "center", fontSize: 12, color: "var(--text-muted-2)" }}>
                🔒 Secure payment powered by {COMPANY.name}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
