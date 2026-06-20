// Comprehensive Billing Dashboard with Invoice Generation
import { useState } from "react";
import { useData } from "../hooks/useData";
import { createData, updateData, deleteData } from "../utils/api";
import { SectionHeader } from "../components/SectionHeader";
import { Table } from "../components/Table";
import { Badge } from "../components/Badge";
import { Btn } from "../components/Btn";
import { Input } from "../components/Input";
import { useAuth } from "../contexts/AuthContext";
import { COMPANY } from "../utils/constants";
import { QRCodeCanvas } from "qrcode.react";

export function BillingDashboard({ dark, toast }) {
  const { user } = useAuth();
  const { data: members, loading: membersLoading } = useData('/members');
  const { data: invoices, loading: invoicesLoading, refresh: refreshInvoices } = useData('/invoices');
  const { data: groups } = useData('/groups');
  const { data: schemes } = useData('/schemes');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [generatedInvoice, setGeneratedInvoice] = useState(null);
  const [showReceiptPopup, setShowReceiptPopup] = useState(false);
  const [selectedInvoiceForReceipt, setSelectedInvoiceForReceipt] = useState(null);
  
  // Filter members based on logged-in user role and search term
  const roleFilteredMembers = user?.role === 'user' 
    ? members.filter(m => m.memberId === user.userId || m.email === user.email)
    : members;
  
  const filteredMembers = roleFilteredMembers.filter(m => 
    m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.memberId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.mobile?.includes(searchTerm)
  );
  
  // Filter invoices based on logged-in user role
  const filteredInvoices = user?.role === 'user' 
    ? invoices.filter(inv => inv.memberId === user.userId || inv.memberName === user.name)
    : invoices;

  const [form, setForm] = useState({
    installmentAmount: 10000,
    lateFine: 0,
    discount: 0,
    previousDue: 0,
    paymentMethod: 'Cash',
    referenceNumber: '',
    remarks: ''
  });

  const calculateTotal = () => {
    return parseFloat(form.installmentAmount) + parseFloat(form.lateFine) - parseFloat(form.discount) + parseFloat(form.previousDue);
  };

  const handleGenerateInvoice = async () => {
    if (!selectedMember) {
      toast.add("Please select a member first", "error");
      return;
    }

    // Validate member has required fields
    if (!selectedMember.memberId || !selectedMember.name || !selectedMember.phone) {
      toast.add("Selected member is missing required information. Please select a valid member.", "error");
      return;
    }

    // Validate payment amount
    if (!form.installmentAmount || parseFloat(form.installmentAmount) <= 0) {
      toast.add("Please enter a valid payment amount", "error");
      return;
    }

    try {
      // Get member's group and scheme to calculate correct monthly installment
      const memberGroupId = selectedMember.groups && selectedMember.groups[0];
      const memberGroup = memberGroupId ? groups.find(g => g.id === memberGroupId) : null;
      const memberScheme = memberGroup ? schemes.find(s => s.id === memberGroup.schemeId) : null;
      
      const monthlyInstallment = memberScheme ? memberScheme.monthlyInstallment : parseFloat(form.installmentAmount);
      const duration = memberScheme ? memberScheme.duration : 50;
      const totalChitValue = memberScheme ? memberScheme.amount : 500000;

      const invoiceData = {
        branch: "Madurai Branch",
        collectedBy: user.name,
        memberId: selectedMember.memberId,
        memberName: selectedMember.name,
        memberMobile: selectedMember.phone,
        memberAddress: selectedMember.address || "",
        memberAadhar: selectedMember.aadhaar || "",
        chitName: memberScheme ? memberScheme.name : "Gold Savings Scheme",
        chitGroup: memberGroup ? memberGroup.name : "G-25",
        chitNumber: memberGroup ? `CHIT-${memberScheme?.amount || 500000}-001` : "CHIT-25-001",
        totalChitValue: totalChitValue,
        monthlyAmount: monthlyInstallment,
        duration: duration,
        currentMonth: memberGroup ? memberGroup.currentInstallment : 12,
        dueDate: new Date(),
        installmentAmount: monthlyInstallment,
        lateFine: parseFloat(form.lateFine),
        discount: parseFloat(form.discount),
        previousDue: parseFloat(form.previousDue),
        totalPayable: monthlyInstallment + parseFloat(form.lateFine) - parseFloat(form.discount) + parseFloat(form.previousDue),
        amountPaid: monthlyInstallment + parseFloat(form.lateFine) - parseFloat(form.discount) + parseFloat(form.previousDue),
        balance: 0,
        paymentMethod: form.paymentMethod,
        referenceNumber: form.referenceNumber,
        paidInstallments: memberGroup ? memberGroup.currentInstallment - 1 : 11,
        remainingInstallments: duration - (memberGroup ? memberGroup.currentInstallment - 1 : 11),
        totalPaid: monthlyInstallment * (memberGroup ? memberGroup.currentInstallment - 1 : 11),
        remainingAmount: totalChitValue - (monthlyInstallment * (memberGroup ? memberGroup.currentInstallment - 1 : 11)),
        status: 'Paid',
        remarks: form.remarks
      };

      const response = await createData('/invoices', invoiceData);
      setGeneratedInvoice(response.invoice);
      setShowInvoicePreview(true);
      setShowInvoiceForm(false);
      toast.add("Invoice generated successfully!");
      refreshInvoices();
    } catch (error) {
      toast.add("Error generating invoice: " + error.message, "error");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'green';
      case 'Partially Paid': return 'yellow';
      case 'Due': return 'red';
      case 'Cancelled': return 'gray';
      default: return 'gray';
    }
  };

  if (membersLoading || invoicesLoading) return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;

  return (
    <div>
      <SectionHeader title="Invoice Generation" subtitle="Generate and manage payment invoices" dark={dark} />

      <div style={{ display: "grid", gap: 24 }}>
        {/* Search Section */}
        <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 16 }}>Search Member</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16 }}>
            <Input 
              label="Member ID" 
              value={searchTerm} 
              onChange={setSearchTerm} 
              placeholder="Enter Member ID or Mobile" 
              dark={dark} 
            />
            <Btn label="Search" onClick={() => {}} primary style={{ marginTop: 24 }} />
          </div>

          {filteredMembers.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: dark ? "rgba(255,255,255,.6)" : "#374151", marginBottom: 12 }}>
                Found {filteredMembers.length} member(s)
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>
                {filteredMembers.map(member => (
                  <div 
                    key={member.id}
                    onClick={() => setSelectedMember(member)}
                    style={{
                      background: dark ? "rgba(255,255,255,.05)" : "#f9fafb",
                      border: selectedMember?.id === member.id ? "2px solid #2563eb" : dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb",
                      borderRadius: 8,
                      padding: 16,
                      cursor: "pointer",
                      transition: "all .2s ease"
                    }}
                  >
                    <div style={{ fontSize: 15, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 8 }}>
                      {member.name}
                    </div>
                    <div style={{ fontSize: 13, color: dark ? "rgba(255,255,255,.6)" : "#6b7280", marginBottom: 4 }}>
                      ID: {member.memberId}
                    </div>
                    <div style={{ fontSize: 13, color: dark ? "rgba(255,255,255,.6)" : "#6b7280", marginBottom: 4 }}>
                      Mobile: {member.mobile}
                    </div>
                    <div style={{ fontSize: 13, color: dark ? "rgba(255,255,255,.6)" : "#6b7280" }}>
                      Address: {member.address}
                    </div>
                    <Badge text={member.status || "Active"} color="green" style={{ marginTop: 12 }} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Selected Member Information */}
        {selectedMember && (() => {
          const memberGroupId = selectedMember.groups && selectedMember.groups[0];
          const memberGroup = memberGroupId ? groups.find(g => g.id === memberGroupId) : null;
          const memberScheme = memberGroup ? schemes.find(s => s.id === memberGroup.schemeId) : null;
          return (
          <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 16 }}>Member Information</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 12, color: dark ? "rgba(255,255,255,.5)" : "#6b7280", marginBottom: 4 }}>Member Name</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: dark ? "#f3f4f6" : "#111" }}>{selectedMember.name}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: dark ? "rgba(255,255,255,.5)" : "#6b7280", marginBottom: 4 }}>Member ID</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: dark ? "#f3f4f6" : "#111" }}>{selectedMember.memberId}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: dark ? "rgba(255,255,255,.5)" : "#6b7280", marginBottom: 4 }}>Mobile</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: dark ? "#f3f4f6" : "#111" }}>{selectedMember.mobile}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: dark ? "rgba(255,255,255,.5)" : "#6b7280", marginBottom: 4 }}>Address</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: dark ? "#f3f4f6" : "#111" }}>{selectedMember.address}</div>
              </div>
            </div>

            <div style={{ fontSize: 16, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 16, marginTop: 24 }}>Chit Information</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 12, color: dark ? "rgba(255,255,255,.5)" : "#6b7280", marginBottom: 4 }}>Chit Name</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: dark ? "#f3f4f6" : "#111" }}>{memberScheme?.name || "Not Assigned"}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: dark ? "rgba(255,255,255,.5)" : "#6b7280", marginBottom: 4 }}>Chit Group</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: dark ? "#f3f4f6" : "#111" }}>{memberGroup?.name || "Not Assigned"}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: dark ? "rgba(255,255,255,.5)" : "#6b7280", marginBottom: 4 }}>Monthly Amount</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: dark ? "#f3f4f6" : "#111" }}>₹{memberScheme?.monthlyInstallment?.toLocaleString() || "0"}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: dark ? "rgba(255,255,255,.5)" : "#6b7280", marginBottom: 4 }}>Current Installment</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: dark ? "#f3f4f6" : "#111" }}>{memberGroup?.currentInstallment || "0"}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: dark ? "rgba(255,255,255,.5)" : "#6b7280", marginBottom: 4 }}>Next Due Date</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: dark ? "#f3f4f6" : "#111" }}>{memberGroup?.nextDueDate ? new Date(memberGroup.nextDueDate).toLocaleDateString() : "Not Set"}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: dark ? "rgba(255,255,255,.5)" : "#6b7280", marginBottom: 4 }}>Auction Status</div>
                <Badge text={memberGroup?.status || "Active"} color={memberGroup?.status === "Active" ? "green" : "yellow"} />
              </div>
            </div>

            {user?.role !== 'super_admin' && (
              <Btn label="Generate Invoice" onClick={() => setShowInvoiceForm(true)} primary style={{ marginTop: 16 }} />
            )}
          </div>
          );
        })()}

        {/* Invoice Form */}
        {showInvoiceForm && selectedMember && (
          <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 16 }}>Billing Section</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16 }}>
              <div>
                <Input label="Monthly Amount" value={form.installmentAmount} onChange={v => setForm({ ...form, installmentAmount: v })} dark={dark} type="number" />
              </div>
              <div>
                <Input label="Late Fine" value={form.lateFine} onChange={v => setForm({ ...form, lateFine: v })} dark={dark} type="number" />
              </div>
              <div>
                <Input label="Discount" value={form.discount} onChange={v => setForm({ ...form, discount: v })} dark={dark} type="number" />
              </div>
              <div>
                <Input label="Other Charges" value={form.previousDue} onChange={v => setForm({ ...form, previousDue: v })} dark={dark} type="number" />
              </div>
            </div>

            <div style={{ marginTop: 20, padding: 16, background: dark ? "rgba(255,255,255,.05)" : "#f9fafb", borderRadius: 8, border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb" }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: dark ? "#f3f4f6" : "#111", marginBottom: 8 }}>
                Total Amount: ₹{calculateTotal().toLocaleString()}
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: dark ? "rgba(255,255,255,.6)" : "#374151", marginBottom: 12 }}>Payment Mode</div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {['Cash', 'UPI', 'Bank', 'Cheque'].map(mode => (
                  <button
                    key={mode}
                    onClick={() => setForm({ ...form, paymentMethod: mode })}
                    style={{
                      padding: "10px 20px",
                      borderRadius: 8,
                      border: form.paymentMethod === mode ? "2px solid #2563eb" : "1px solid #d1d5db",
                      background: form.paymentMethod === mode ? "rgba(37, 99, 235, 0.1)" : dark ? "rgba(255,255,255,.05)" : "#fff",
                      color: dark ? "#f3f4f6" : "#111",
                      cursor: "pointer",
                      fontSize: 14,
                      fontWeight: form.paymentMethod === mode ? 600 : 400,
                      transition: "all .2s ease"
                    }}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <Input label="Reference Number" value={form.referenceNumber} onChange={v => setForm({ ...form, referenceNumber: v })} dark={dark} placeholder="Optional" />
            </div>

            <div style={{ marginTop: 16 }}>
              <Input label="Remarks" value={form.remarks} onChange={v => setForm({ ...form, remarks: v })} dark={dark} placeholder="Payment received successfully" />
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <Btn label="Generate Invoice" onClick={handleGenerateInvoice} primary />
              <Btn label="Cancel" onClick={() => setShowInvoiceForm(false)} />
            </div>
          </div>
        )}

        {/* Invoice Preview */}
        {showInvoicePreview && generatedInvoice && (
          <InvoicePreview invoice={generatedInvoice} dark={dark} onClose={() => setShowInvoicePreview(false)} />
        )}

        {/* Recent Invoices */}
        <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 16 }}>Recent Invoices</div>
          <Table dark={dark} cols={["Invoice No", "Member", "Amount", "Payment Mode", "Status", "Date", "Actions"]}
            rows={filteredInvoices.slice(0, 10).map(inv => [
              inv.invoiceNumber,
              inv.memberName,
              `₹${inv.amountPaid.toLocaleString()}`,
              inv.paymentMethod,
              <Badge key={inv.id} text={inv.status} color={getStatusColor(inv.status)} />,
              new Date(inv.date).toLocaleDateString(),
              <div key={inv.id} style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button onClick={() => { setGeneratedInvoice(inv); setShowInvoicePreview(true); }} style={{ fontSize: 11, padding: "5px 10px", borderRadius: 6, border: "1px solid #2563eb", background: "#2563eb", color: "#fff", cursor: "pointer", fontWeight: 600, transition: "all 0.2s", opacity: 0.9 }} onMouseEnter={e => e.currentTarget.style.opacity = "1"} onMouseLeave={e => e.currentTarget.style.opacity = "0.9"}>View</button>
                <button onClick={() => window.print()} style={{ fontSize: 11, padding: "5px 10px", borderRadius: 6, border: "1px solid #10b981", background: "#10b981", color: "#fff", cursor: "pointer", fontWeight: 600, transition: "all 0.2s", opacity: 0.9 }} onMouseEnter={e => e.currentTarget.style.opacity = "1"} onMouseLeave={e => e.currentTarget.style.opacity = "0.9"}>Print</button>
                {inv.status === 'Paid' && (
                  <button onClick={() => { setSelectedInvoiceForReceipt(inv); setShowReceiptPopup(true); }} style={{ fontSize: 11, padding: "5px 10px", borderRadius: 6, border: "1px solid #8b5cf6", background: "#8b5cf6", color: "#fff", cursor: "pointer", fontWeight: 600, transition: "all 0.2s", opacity: 0.9 }} onMouseEnter={e => e.currentTarget.style.opacity = "1"} onMouseLeave={e => e.currentTarget.style.opacity = "0.9"}>Receipt</button>
                )}
                <button onClick={() => toast.add("Downloading PDF...")} style={{ fontSize: 11, padding: "5px 10px", borderRadius: 6, border: "1px solid #f59e0b", background: "#f59e0b", color: "#fff", cursor: "pointer", fontWeight: 600, transition: "all 0.2s", opacity: 0.9 }} onMouseEnter={e => e.currentTarget.style.opacity = "1"} onMouseLeave={e => e.currentTarget.style.opacity = "0.9"}>Download</button>
                <button onClick={async () => {
                  try {
                    await fetch(`/api/invoices/${inv._id}/send-whatsapp`, { method: 'POST' });
                    toast.add("WhatsApp receipt sent successfully!");
                  } catch (error) {
                    toast.add("Error sending WhatsApp receipt", "error");
                  }
                }} style={{ fontSize: 11, padding: "5px 10px", borderRadius: 6, border: "1px solid #25D366", background: "#25D366", color: "#fff", cursor: "pointer", fontWeight: 600, transition: "all 0.2s", opacity: 0.9 }} onMouseEnter={e => e.currentTarget.style.opacity = "1"} onMouseLeave={e => e.currentTarget.style.opacity = "0.9"}>WhatsApp</button>
                <button onClick={async () => {
                  try {
                    await fetch(`/api/invoices/${inv._id}/send-email`, { method: 'POST' });
                    toast.add("Email receipt sent successfully!");
                  } catch (error) {
                    toast.add("Error sending email receipt", "error");
                  }
                }} style={{ fontSize: 11, padding: "5px 10px", borderRadius: 6, border: "1px solid #ea4335", background: "#ea4335", color: "#fff", cursor: "pointer", fontWeight: 600, transition: "all 0.2s", opacity: 0.9 }} onMouseEnter={e => e.currentTarget.style.opacity = "1"} onMouseLeave={e => e.currentTarget.style.opacity = "0.9"}>Email</button>
              </div>
            ])} />
        </div>

        {/* Payment History */}
        {selectedMember && (
          <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 16 }}>Payment History - {selectedMember.name}</div>
            {filteredInvoices.filter(inv => inv.memberId === selectedMember.memberId).length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: dark ? "rgba(255,255,255,.6)" : "#6b7280" }}>
                No payment history available for this member.
              </div>
            ) : (
              <Table dark={dark} cols={["Invoice No", "Date", "Amount Paid", "Payment Mode", "Status", "Actions"]}
                rows={filteredInvoices.filter(inv => inv.memberId === selectedMember.memberId).map(inv => [
                  inv.invoiceNumber,
                  new Date(inv.date).toLocaleDateString(),
                  `₹${inv.amountPaid.toLocaleString()}`,
                  inv.paymentMethod,
                  <Badge key={inv.id + "badge"} text={inv.status} color={inv.status === 'Paid' ? 'green' : inv.status === 'Partially Paid' ? 'yellow' : 'red'} />,
                  <button key={inv.id + "btn"} onClick={() => { setSelectedInvoiceForReceipt(inv); setShowReceiptPopup(true); }} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: "1px solid #8b5cf6", background: "transparent", color: "#8b5cf6", cursor: "pointer" }}>Receipt</button>
                ])} />
            )}
          </div>
        )}

        {/* Receipt Popup */}
        {showReceiptPopup && selectedInvoiceForReceipt && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: dark ? "#1e1b4b" : "#fff", borderRadius: 12, maxWidth: 700, width: "90%", maxHeight: "90vh", overflow: "auto", padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: dark ? "#f3f4f6" : "#111" }}>Payment Receipt</div>
                <button onClick={() => setShowReceiptPopup(false)} style={{ fontSize: 24, background: "none", border: "none", cursor: "pointer", color: dark ? "#f3f4f6" : "#111" }}>×</button>
              </div>

                {/* Receipt Header */}
                <div style={{ textAlign: "center", marginBottom: 32, paddingBottom: 24, borderBottom: "2px solid #2563eb" }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "#2563eb", marginBottom: 8 }}>{COMPANY.name}</div>
                  <div style={{ fontSize: 13, color: dark ? "rgba(255,255,255,0.6)" : "#6b7280" }}>{COMPANY.address}</div>
                  <div style={{ fontSize: 13, color: dark ? "rgba(255,255,255,0.6)" : "#6b7280" }}>Tel: {COMPANY.phone} | Email: {COMPANY.email}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: dark ? "#f3f4f6" : "#111", marginTop: 16, textTransform: "uppercase", letterSpacing: "1px" }}>Official Payment Receipt</div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 32 }}>
                   {/* Member Details */}
                  <div style={{ background: dark ? "rgba(255,255,255,0.03)" : "#f8fafc", padding: 20, borderRadius: 12, border: dark ? "1px solid rgba(255,255,255,0.05)" : "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#2563eb", marginBottom: 12, textTransform: "uppercase" }}>Member Details</div>
                    <div style={{ marginBottom: 8 }}><span style={{ fontSize: 12, color: "#6b7280" }}>Name:</span> <span style={{ fontSize: 14, fontWeight: 700 }}>{selectedInvoiceForReceipt.memberName}</span></div>
                    <div style={{ marginBottom: 8 }}><span style={{ fontSize: 12, color: "#6b7280" }}>ID:</span> <span style={{ fontSize: 14, fontWeight: 600 }}>{selectedInvoiceForReceipt.memberId}</span></div>
                    <div style={{ marginBottom: 8 }}><span style={{ fontSize: 12, color: "#6b7280" }}>Mobile:</span> <span style={{ fontSize: 14, fontWeight: 600 }}>{selectedInvoiceForReceipt.memberMobile}</span></div>
                    <div style={{ marginBottom: 0 }}><span style={{ fontSize: 12, color: "#6b7280" }}>Scheme:</span> <span style={{ fontSize: 14, fontWeight: 600 }}>{selectedInvoiceForReceipt.chitName}</span></div>
                  </div>

                  {/* Payment Details */}
                  <div style={{ background: dark ? "rgba(255,255,255,0.03)" : "#f8fafc", padding: 20, borderRadius: 12, border: dark ? "1px solid rgba(255,255,255,0.05)" : "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#2563eb", marginBottom: 12, textTransform: "uppercase" }}>Transaction Info</div>
                    <div style={{ marginBottom: 8 }}><span style={{ fontSize: 12, color: "#6b7280" }}>Receipt No:</span> <span style={{ fontSize: 14, fontWeight: 700 }}>{selectedInvoiceForReceipt.receiptNumber}</span></div>
                    <div style={{ marginBottom: 8 }}><span style={{ fontSize: 12, color: "#6b7280" }}>Date:</span> <span style={{ fontSize: 14, fontWeight: 600 }}>{new Date(selectedInvoiceForReceipt.date).toLocaleDateString()}</span></div>
                    <div style={{ marginBottom: 8 }}><span style={{ fontSize: 12, color: "#6b7280" }}>Method:</span> <span style={{ fontSize: 14, fontWeight: 600 }}>{selectedInvoiceForReceipt.paymentMethod}</span></div>
                    <div style={{ marginBottom: 0 }}><span style={{ fontSize: 12, color: "#6b7280" }}>Trans ID:</span> <span style={{ fontSize: 14, fontWeight: 600 }}>{selectedInvoiceForReceipt.referenceNumber || 'N/A'}</span></div>
                  </div>
                </div>

                {/* Amount Table */}
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
                  <Btn label="Print Receipt" onClick={() => window.print()} primary style={{ flex: 1 }} />
                  <Btn label="Download PDF" onClick={() => toast.add("Downloading professional PDF...")} style={{ flex: 1, background: "#10b981", color: "#fff" }} />
                  <Btn label="Close" onClick={() => setShowReceiptPopup(false)} style={{ flex: 1 }} />
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Invoice Preview Component
function InvoicePreview({ invoice, dark, onClose }) {
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

        {/* Invoice Header */}
        <div style={{ textAlign: "center", marginBottom: 24, paddingBottom: 24, borderBottom: "2px solid #e5e7eb" }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#111", marginBottom: 8 }}>{COMPANY.name}</div>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>{COMPANY.address}</div>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Phone: {COMPANY.phone} | Email: {COMPANY.email}</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>GSTIN: {COMPANY.gstin}</div>
        </div>

        {/* Invoice Details */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24, paddingBottom: 24, borderBottom: "2px solid #e5e7eb" }}>
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

        {/* Member Details */}
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

        {/* Chit Details */}
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
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>₹{invoice.totalChitValue.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Monthly Amount</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>₹{invoice.monthlyAmount.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Duration</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>{invoice.duration} Months</div>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: "2px solid #e5e7eb" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 12 }}>PAYMENT DETAILS</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Installment Amount</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>₹{invoice.installmentAmount.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Late Fine</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>₹{invoice.lateFine.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Discount</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>₹{invoice.discount.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Previous Due</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>₹{invoice.previousDue.toLocaleString()}</div>
            </div>
          </div>
          <div style={{ background: "#f9fafb", padding: 16, borderRadius: 8, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 14, color: "#6b7280" }}>Total Payable</span>
              <span style={{ fontSize: 16, fontWeight: 600, color: "#111" }}>₹{invoice.totalPayable.toLocaleString()}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 14, color: "#6b7280" }}>Amount Paid</span>
              <span style={{ fontSize: 16, fontWeight: 600, color: "#111" }}>₹{invoice.amountPaid.toLocaleString()}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 14, color: "#6b7280" }}>Balance</span>
              <span style={{ fontSize: 16, fontWeight: 600, color: "#111" }}>₹{invoice.balance.toLocaleString()}</span>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
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

        {/* Account Status */}
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
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>₹{invoice.totalPaid.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Remaining Amount</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>₹{invoice.remainingAmount.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Remarks */}
        <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: "2px solid #e5e7eb" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 12 }}>REMARKS</div>
          <div style={{ fontSize: 14, color: "#6b7280" }}>{invoice.remarks || 'Payment received successfully.'}</div>
        </div>

        {/* Status */}
        <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: "2px solid #e5e7eb" }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: statusColors[invoice.status] }}></div>
            <div style={{ fontSize: 16, fontWeight: 600, color: statusColors[invoice.status] }}>{invoice.status}</div>
          </div>
        </div>

        {/* Company Payment Details */}
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
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>UPI ID</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>{COMPANY.upiId}</div>
            </div>
          </div>
        </div>

        {/* QR Code Section */}
        <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: "2px solid #e5e7eb", textAlign: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 12 }}>Scan to Pay / Verify Invoice</div>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <QRCodeCanvas 
              value={`upi://pay?pa=${COMPANY.upiId}&pn=${COMPANY.name}&am=${invoice.amountPaid}&cu=INR`}
              size={128}
              level="H"
            />
          </div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>
            Invoice Number: {invoice.invoiceNumber}
          </div>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
            Verification: <a href={invoice.verificationUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb" }}>{invoice.verificationUrl}</a>
          </div>
        </div>

        {/* Signatures */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginTop: 40 }}>
          <div>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 40 }}>Collector Signature</div>
            <div style={{ height: 2, background: "#e5e7eb" }}></div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 40 }}>Member Signature</div>
            <div style={{ height: 2, background: "#e5e7eb" }}></div>
          </div>
        </div>

        {/* Thank You */}
        <div style={{ textAlign: "center", marginTop: 32, fontSize: 14, color: "#6b7280" }}>
          Thank You for Your Payment
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: 12, marginTop: 24, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => window.print()} style={{ padding: "12px 24px", borderRadius: 8, border: "1px solid #2563eb", background: "#2563eb", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
            Print Invoice
          </button>
          <button onClick={() => toast.add("Downloading PDF...")} style={{ padding: "12px 24px", borderRadius: 8, border: "1px solid #10b981", background: "#10b981", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
            Download PDF
          </button>
          <button onClick={async () => {
            try {
              await fetch(`/api/invoices/${invoice._id}/send-whatsapp`, { method: 'POST' });
              toast.add("WhatsApp receipt sent successfully!");
            } catch (error) {
              toast.add("Error sending WhatsApp receipt", "error");
            }
          }} style={{ padding: "12px 24px", borderRadius: 8, border: "1px solid #25D366", background: "#25D366", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
            Send WhatsApp
          </button>
          <button onClick={async () => {
            try {
              await fetch(`/api/invoices/${invoice._id}/send-email`, { method: 'POST' });
              toast.add("Email receipt sent successfully!");
            } catch (error) {
              toast.add("Error sending email receipt", "error");
            }
          }} style={{ padding: "12px 24px", borderRadius: 8, border: "1px solid #2563eb", background: "#2563eb", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
            Send Email
          </button>
        </div>
      </div>
    </div>
  );
}
