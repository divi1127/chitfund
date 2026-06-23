import { useState } from "react";
import { useData } from "../hooks/useData";
import { fetchData } from "../utils/api";
import { SectionHeader } from "../components/SectionHeader";
import { Table } from "../components/Table";
import { Badge } from "../components/Badge";
import { Btn } from "../components/Btn";
import { fmt } from "../utils/helpers";
import { useAuth } from "../contexts/AuthContext";

export function Accounting({ toast }) {
  const { user } = useAuth();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [accountingData, setAccountingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { data: years } = useData('/accounting/years');

  const months = [
    { value: 1, label: "January" }, { value: 2, label: "February" }, { value: 3, label: "March" },
    { value: 4, label: "April" }, { value: 5, label: "May" }, { value: 6, label: "June" },
    { value: 7, label: "July" }, { value: 8, label: "August" }, { value: 9, label: "September" },
    { value: 10, label: "October" }, { value: 11, label: "November" }, { value: 12, label: "December" }
  ];

  const loadAccountingData = async () => {
    setLoading(true);
    try {
      const data = await fetchData(`/accounting/${selectedYear}/${selectedMonth}`);
      setAccountingData(data);
    } catch (error) {
      toast?.add("Error loading accounting data: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <SectionHeader title="Accounting" subtitle="Year and month-wise financial overview" />

      <div style={{ display: "flex", gap: 16, marginBottom: 24, alignItems: "flex-end", flexWrap: "wrap" }}>
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Year</label>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border-color)", background: "var(--bg-input)", color: "var(--text-primary)", fontSize: 13, minWidth: 120 }}
          >
            {(years.length > 0 ? years : [new Date().getFullYear()]).map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Month</label>
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(Number(e.target.value))}
            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border-color)", background: "var(--bg-input)", color: "var(--text-primary)", fontSize: 13, minWidth: 140 }}
          >
            {months.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
        <Btn label={loading ? "Loading..." : "Load Data"} onClick={loadAccountingData} primary />
      </div>

      {accountingData && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16, marginBottom: 24 }}>
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Period</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)" }}>{months[selectedMonth - 1].label} {selectedYear}</div>
            </div>
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Total Members</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)" }}>{accountingData.totals?.totalMembers || 0}</div>
            </div>
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Scheme Amount</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)" }}>{fmt(accountingData.totals?.totalSchemeAmount || 0)}</div>
            </div>
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Paid Amount</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: "#16a34a" }}>{fmt(accountingData.totals?.totalPaidAmount || 0)}</div>
            </div>
          </div>

          <Table cols={["Invoice No", "Date", "Member Name", "Member ID", "Phone", "Group", "Scheme", "Scheme Amount", "Paid Amount", "Status", "Payment Method"]}
            rows={accountingData.data.map(d => [
              d.invoiceNumber,
              new Date(d.date).toLocaleDateString(),
              d.memberName,
              d.memberId,
              d.phone || "—",
              d.group || "—",
              d.scheme || "—",
              fmt(d.schemeAmount),
              fmt(d.paidAmount),
              <Badge key={d.invoiceNumber} text={d.status} color={d.status === "Paid" ? "green" : "yellow"} />,
              d.paymentMethod
            ])} />
        </>
      )}

      {!accountingData && !loading && (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
          Select a year and month, then click "Load Data" to view accounting records.
        </div>
      )}
    </div>
  );
}
