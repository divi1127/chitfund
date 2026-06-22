import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { SectionHeader } from "../components/SectionHeader";
import { Table } from "../components/Table";

const STATUS_COLORS = {
  New: { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
  Contacted: { bg: "#fefce8", color: "#b45309", border: "#fde68a" },
  Converted: { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  Closed: { bg: "#f1f5f9", color: "#64748b", border: "#e2e8f0" },
};

export function Enquiries({ dark, toast }) {
  const { user } = useAuth();
  if (!user) return null;
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  const fetchEnquiries = async () => {
    try {
      const res = await fetch("/api/enquiries", { headers: user?.token ? { 'Authorization': `Bearer ${user.token}` } : {} });
      if (res.ok) {
        const data = await res.json();
        setEnquiries(data);
      } else {
        toast.add("Failed to fetch enquiries", "error");
      }
    } catch {
      toast.add("Error fetching enquiries", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/enquiries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(user?.token ? { 'Authorization': `Bearer ${user.token}` } : {}) },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.add("Status updated", "success");
        setEnquiries((prev) =>
          prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
        );
      } else {
        toast.add("Failed to update status", "error");
      }
    } catch {
      toast.add("Error updating status", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this enquiry? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/enquiries/${id}`, {
        method: "DELETE",
        headers: user?.token ? { 'Authorization': `Bearer ${user.token}` } : {},
      });
      if (res.ok) {
        toast.add("Enquiry deleted", "success");
        setEnquiries((prev) => prev.filter((e) => e.id !== id));
      } else {
        toast.add("Failed to delete", "error");
      }
    } catch {
      toast.add("Error deleting enquiry", "error");
    }
  };

  // Filter
  const filtered = enquiries.filter((e) => {
    const matchSearch =
      e.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.phone?.includes(searchTerm);
    const matchStatus = statusFilter === "All" || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Stats
  const stats = {
    total: enquiries.length,
    New: enquiries.filter((e) => e.status === "New").length,
    Contacted: enquiries.filter((e) => e.status === "Contacted").length,
    Converted: enquiries.filter((e) => e.status === "Converted").length,
    Closed: enquiries.filter((e) => e.status === "Closed").length,
  };

  const cardStyle = (color) => ({
    background: dark ? "rgba(255,255,255,.05)" : "#fff",
    border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb",
    borderRadius: 12,
    padding: "16px 20px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  });

  const inp = {
    padding: "10px 14px",
    borderRadius: 8,
    border: dark ? "1px solid rgba(255,255,255,.15)" : "1px solid #e5e7eb",
    background: dark ? "rgba(255,255,255,.06)" : "#f8fafc",
    color: dark ? "#f1f5f9" : "#0f172a",
    fontSize: 14,
    outline: "none",
    width: "100%",
  };

  return (
    <div>
      <SectionHeader
        title="Enquiry Management"
        subtitle="View and manage website enquiries from the landing page"
        dark={dark}
      />

      {/* Summary Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Total", value: stats.total, color: "#6366f1" },
          { label: "New", value: stats.New, color: "#2563eb" },
          { label: "Contacted", value: stats.Contacted, color: "#b45309" },
          { label: "Converted", value: stats.Converted, color: "#16a34a" },
          { label: "Closed", value: stats.Closed, color: "#64748b" },
        ].map((s) => (
          <div key={s.label} style={cardStyle(s.color)}>
            <span style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</span>
            <span style={{ fontSize: 12, color: dark ? "rgba(255,255,255,.5)" : "#64748b", fontWeight: 600 }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
          placeholder="Search by name, email or phone…"
          style={{ ...inp, maxWidth: 320 }}
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          style={{ ...inp, maxWidth: 160 }}
        >
          {["All", "New", "Contacted", "Converted", "Closed"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button
          onClick={fetchEnquiries}
          style={{
            padding: "10px 18px", borderRadius: 8,
            background: "#2563eb", color: "#fff", border: "none",
            fontWeight: 600, fontSize: 13, cursor: "pointer",
          }}
        >
          Refresh
        </button>
      </div>

      {/* Table */}
      <div style={{
        background: dark ? "rgba(255,255,255,.05)" : "#fff",
        border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb",
        borderRadius: 12, padding: 20
      }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 48, color: dark ? "rgba(255,255,255,.5)" : "#94a3b8" }}>
            Loading enquiries…
          </div>
        ) : paginated.length === 0 ? (
          <div style={{ textAlign: "center", padding: 48, color: dark ? "rgba(255,255,255,.5)" : "#94a3b8" }}>
            No enquiries found.
          </div>
        ) : (
          <Table
            dark={dark}
            cols={["Date", "Name & Contact", "Subject / Plan", "Message", "Status", "Actions"]}
            rows={paginated.map((e) => {
              const sc = STATUS_COLORS[e.status] || STATUS_COLORS.New;
              return [
                // Date
                new Date(e.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),

                // Name & contact
                <div key={`c-${e.id}`} style={{ minWidth: 160 }}>
                  <div style={{ fontWeight: 600, color: dark ? "#f1f5f9" : "#0f172a" }}>{e.name}</div>
                  <div style={{ fontSize: 12, color: "#2563eb", marginTop: 2 }}>{e.phone}</div>
                  <div style={{ fontSize: 12, color: dark ? "rgba(255,255,255,.45)" : "#64748b" }}>{e.email}</div>
                </div>,

                // Plan/Subject
                <span key={`p-${e.id}`} style={{
                  display: "inline-block", padding: "3px 10px", borderRadius: 20,
                  background: "#eff6ff", color: "#1d4ed8", fontSize: 12, fontWeight: 600
                }}>{e.plan || "—"}</span>,

                // Message
                <div key={`m-${e.id}`} title={e.message} style={{
                  maxWidth: 200, whiteSpace: "nowrap", overflow: "hidden",
                  textOverflow: "ellipsis", fontSize: 13,
                  color: dark ? "rgba(255,255,255,.6)" : "#475569"
                }}>
                  {e.message || "—"}
                </div>,

                // Status dropdown
                <select
                  key={`s-${e.id}`}
                  value={e.status}
                  onChange={(ev) => handleStatusChange(e.id, ev.target.value)}
                  style={{
                    padding: "5px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700,
                    background: sc.bg, color: sc.color,
                    border: `1px solid ${sc.border}`, outline: "none", cursor: "pointer",
                  }}
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Converted">Converted</option>
                  <option value="Closed">Closed</option>
                </select>,

                // Delete
                <button
                  key={`d-${e.id}`}
                  onClick={() => handleDelete(e.id)}
                  style={{
                    fontSize: 12, padding: "6px 12px", borderRadius: 6, fontWeight: 600,
                    background: "rgba(239,68,68,0.08)", color: "#ef4444",
                    border: "1px solid rgba(239,68,68,0.2)", cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.18)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")}
                >
                  Delete
                </button>,
              ];
            })}
          />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 20 }}>
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              style={{
                padding: "7px 16px", borderRadius: 7, border: "1px solid #e5e7eb",
                background: "#fff", cursor: page === 1 ? "not-allowed" : "pointer", fontSize: 13,
                opacity: page === 1 ? 0.4 : 1,
              }}
            >
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  padding: "7px 13px", borderRadius: 7, fontSize: 13, fontWeight: 600,
                  border: p === page ? "none" : "1px solid #e5e7eb",
                  background: p === page ? "#2563eb" : "#fff",
                  color: p === page ? "#fff" : "#374151",
                  cursor: "pointer",
                }}
              >
                {p}
              </button>
            ))}
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              style={{
                padding: "7px 16px", borderRadius: 7, border: "1px solid #e5e7eb",
                background: "#fff", cursor: page === totalPages ? "not-allowed" : "pointer", fontSize: 13,
                opacity: page === totalPages ? 0.4 : 1,
              }}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
