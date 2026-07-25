import { useState } from "react";
import { SectionHeader } from "../components/SectionHeader";
import { COMPANY } from "../utils/constants";
import { createData } from "../utils/api";
import { today } from "../utils/helpers";

export function Support({ dark, toast }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createData('/enquiries', { ...form, plan: "Customer Support" });
      setSubmitted(true);
      toast.add("Support request submitted!", "success");
    } catch (err) {
      toast.add("Error: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: 8,
    fontSize: 14, boxSizing: "border-box", outline: "none"
  };

  return (
    <div>
      <SectionHeader title="Support" subtitle={`Get help ${today()}`} dark={dark} />
      <div className="d-grid d-grid-2" style={{ marginBottom: 20 }}>
        <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", margin: "0 0 16px" }}>Contact Information</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div><strong style={{ color: dark ? "#f3f4f6" : "#111" }}>Phone:</strong> <span style={{ color: dark ? "rgba(255,255,255,.6)" : "#6b7280" }}>{COMPANY.phone}</span></div>
            <div><strong style={{ color: dark ? "#f3f4f6" : "#111" }}>Email:</strong> <span style={{ color: dark ? "rgba(255,255,255,.6)" : "#6b7280" }}>{COMPANY.email}</span></div>
            <div><strong style={{ color: dark ? "#f3f4f6" : "#111" }}>Address:</strong> <span style={{ color: dark ? "rgba(255,255,255,.6)" : "#6b7280" }}>{COMPANY.address}</span></div>
            <div><strong style={{ color: dark ? "#f3f4f6" : "#111" }}>Office Hours:</strong> <span style={{ color: dark ? "rgba(255,255,255,.6)" : "#6b7280" }}>9 AM - 6 PM, Monday - Saturday</span></div>
          </div>
        </div>
        <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 24 }}>
          {submitted ? (
            <div style={{ textAlign: "center", padding: 20 }}>
              <div style={{ fontSize: 18, fontWeight: 600, color: "#10b981", marginBottom: 8 }}>Thank You!</div>
              <div style={{ fontSize: 13, color: dark ? "rgba(255,255,255,.6)" : "#6b7280" }}>We'll get back to you shortly.</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", margin: "0 0 16px" }}>Submit a Request</h3>
              <div style={{ marginBottom: 12 }}>
                <input type="text" placeholder="Your Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={inputStyle} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <input type="tel" placeholder="Phone Number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required style={inputStyle} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required style={inputStyle} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <textarea placeholder="Describe your issue..." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required rows={4}
                  style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
              </div>
              <button type="submit" disabled={loading} style={{ padding: "10px 24px", background: loading ? "#9ca3af" : "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>
                {loading ? "Submitting..." : "Submit"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}