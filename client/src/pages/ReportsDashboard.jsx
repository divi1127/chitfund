// Admin Reports Dashboard
import { useState } from "react";
import { useData } from "../hooks/useData";
import { SectionHeader } from "../components/SectionHeader";
import { Table } from "../components/Table";
import { Badge } from "../components/Badge";
import { IconBtn } from "../components/IconBtn";
import { Input } from "../components/Input";
import { HiArrowDownTray, HiPrinter } from "react-icons/hi2";

export function ReportsDashboard({ toast }) {
  const { data: invoices, loading } = useData('/invoices');
  const [selectedReport, setSelectedReport] = useState('daily');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const calculateDailyReport = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayInvoices = invoices.filter(inv => {
      const invDate = new Date(inv.date);
      return invDate >= today && invDate < tomorrow;
    });

    const total = todayInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
    const cash = todayInvoices.filter(inv => inv.paymentMethod === 'Cash').reduce((sum, inv) => sum + inv.amountPaid, 0);
    const upi = todayInvoices.filter(inv => inv.paymentMethod === 'UPI').reduce((sum, inv) => sum + inv.amountPaid, 0);
    const bank = todayInvoices.filter(inv => inv.paymentMethod === 'Bank').reduce((sum, inv) => sum + inv.amountPaid, 0);
    const cheque = todayInvoices.filter(inv => inv.paymentMethod === 'Cheque').reduce((sum, inv) => sum + inv.amountPaid, 0);
    const fine = todayInvoices.reduce((sum, inv) => sum + inv.lateFine, 0);

    return {
      date: today.toLocaleDateString(),
      totalInvoices: todayInvoices.length,
      totalAmount: total,
      paymentMethods: { cash, upi, bank, cheque },
      totalFine: fine,
      invoices: todayInvoices
    };
  };

  const calculateMonthlyReport = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const monthInvoices = invoices.filter(inv => {
      const invDate = new Date(inv.date);
      return invDate >= startOfMonth && invDate <= endOfMonth;
    });

    const total = monthInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
    const fine = monthInvoices.reduce((sum, inv) => sum + inv.lateFine, 0);

    return {
      month: now.toLocaleString('default', { month: 'long' }),
      year: now.getFullYear(),
      totalInvoices: monthInvoices.length,
      totalAmount: total,
      totalFine: fine,
      invoices: monthInvoices
    };
  };

  const calculateOutstandingReport = () => {
    const outstandingInvoices = invoices.filter(inv => inv.status === 'Due' || inv.status === 'Partially Paid');
    const totalOutstanding = outstandingInvoices.reduce((sum, inv) => sum + inv.balance, 0);

    return {
      totalOutstanding,
      totalInvoices: outstandingInvoices.length,
      invoices: outstandingInvoices
    };
  };

  const calculateFineReport = () => {
    const invoicesWithFine = invoices.filter(inv => inv.lateFine > 0);
    const totalFine = invoicesWithFine.reduce((sum, inv) => sum + inv.lateFine, 0);

    return {
      totalFine,
      totalInvoices: invoicesWithFine.length,
      invoices: invoicesWithFine
    };
  };

  const calculateCashBookReport = () => {
    const cashInvoices = invoices.filter(inv => inv.paymentMethod === 'Cash');
    const totalCash = cashInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0);

    return {
      totalCash,
      totalInvoices: cashInvoices.length,
      invoices: cashInvoices
    };
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;

  const dailyReport = calculateDailyReport();
  const monthlyReport = calculateMonthlyReport();
  const outstandingReport = calculateOutstandingReport();
  const fineReport = calculateFineReport();
  const cashBookReport = calculateCashBookReport();

  const getReportData = () => {
    switch (selectedReport) {
      case 'daily': return dailyReport;
      case 'monthly': return monthlyReport;
      case 'outstanding': return outstandingReport;
      case 'fine': return fineReport;
      case 'cashbook': return cashBookReport;
      default: return dailyReport;
    }
  };

  const currentReport = getReportData();

  return (
    <div>
      <SectionHeader title="Reports Dashboard" subtitle="View and generate various reports" />

      <div style={{ display: "grid", gap: 24 }}>
        {/* Report Type Selection */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>Select Report Type</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[
              { id: 'daily', label: '📅 Daily Collection' },
              { id: 'monthly', label: '📆 Monthly Collection' },
              { id: 'outstanding', label: '⚠️ Outstanding Due' },
              { id: 'fine', label: '💰 Fine Report' },
              { id: 'cashbook', label: '💵 Cash Book' }
            ].map(report => (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report.id)}
                style={{
                  padding: "12px 24px",
                  borderRadius: 8,
                  border: selectedReport === report.id ? "2px solid #2563eb" : "1px solid #d1d5db",
                  background: selectedReport === report.id ? "rgba(37, 99, 235, 0.1)" : "var(--bg-card)",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: selectedReport === report.id ? 600 : 400,
                  transition: "all .2s ease"
                }}
              >
                {report.label}
              </button>
            ))}
          </div>
        </div>

        {/* Report Summary Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16 }}>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>Total Invoices</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "var(--text-primary)" }}>{currentReport.totalInvoices}</div>
          </div>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>Total Amount</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#10b981" }}>₹{(currentReport.totalAmount || currentReport.totalOutstanding || currentReport.totalFine || currentReport.totalCash || 0).toLocaleString()}</div>
          </div>
          {selectedReport === 'daily' && (
            <>
              <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>Cash</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)" }}>₹{currentReport.paymentMethods?.cash?.toLocaleString() || 0}</div>
              </div>
              <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>UPI</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)" }}>₹{currentReport.paymentMethods?.upi?.toLocaleString() || 0}</div>
              </div>
            </>
          )}
          {selectedReport === 'monthly' && (
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>Total Fine</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#ef4444" }}>₹{currentReport.totalFine?.toLocaleString() || 0}</div>
            </div>
          )}
        </div>

        {/* Report Details */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>
            {selectedReport === 'daily' && `Daily Collection Report - ${dailyReport.date}`}
            {selectedReport === 'monthly' && `Monthly Collection Report - ${monthlyReport.month} ${monthlyReport.year}`}
            {selectedReport === 'outstanding' && 'Outstanding Due Report'}
            {selectedReport === 'fine' && 'Fine Collection Report'}
            {selectedReport === 'cashbook' && 'Cash Book Report'}
          </div>

          <Table cols={["Invoice No", "Member", "Amount", "Payment Mode", "Status", "Date"]}
            rows={currentReport.invoices?.map(inv => [
              inv.invoiceNumber,
              inv.memberName,
              `₹${inv.amountPaid.toLocaleString()}`,
              inv.paymentMethod,
              <Badge key={inv.id} text={inv.status} color={inv.status === 'Paid' ? 'green' : inv.status === 'Partially Paid' ? 'yellow' : inv.status === 'Due' ? 'red' : 'gray'} />,
              new Date(inv.date).toLocaleDateString()
            ]) || []}
          />
        </div>

        {/* Export Options */}
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <IconBtn icon={<HiArrowDownTray size={14} />} onClick={() => toast.add("Exporting to Excel...")} color="#10b981" title="Export Excel" />
          <IconBtn icon={<HiArrowDownTray size={14} />} onClick={() => toast.add("Exporting to PDF...")} color="#2563eb" title="Export PDF" />
          <IconBtn icon={<HiPrinter size={14} />} onClick={() => window.print()} color="#d97706" title="Print Report" />
        </div>
      </div>
    </div>
  );
}
