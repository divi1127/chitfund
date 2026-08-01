import { useState, useEffect } from "react";
import { SectionHeader } from "../components/SectionHeader";
import { Table } from "../components/Table";
import { Badge } from "../components/Badge";
import { Btn } from "../components/Btn";
import { Input } from "../components/Input";
import { useAuth } from "../contexts/AuthContext";
import { API_BASE } from "../utils/api";

export function KycVerification({ dark, toast }) {
  const { user } = useAuth();
  const [kycRecords, setKycRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ memberId: "", memberName: "", aadhaarNumber: "", panNumber: "", aadhaarDoc: "", panDoc: "" });
  const [reviewingKyc, setReviewingKyc] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const canReview = user?.role === "super_admin" || user?.role === "admin";

  const fetchKyc = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${user.token}` };
      const response = await fetch('/api/kyc', { headers });
      if (response.ok) {
        const data = await response.json();
        setKycRecords(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchKyc(); }, []);

  const handleFileUpload = async (field, e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_BASE}/upload`, {
         method: 'POST',
         headers: { Authorization: `Bearer ${user.token}` },
         body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      setForm({ ...form, [field]: data.url });
      toast.add(`Document uploaded successfully!`);
    } catch (err) {
      console.error('Upload Error:', err);
      toast.add(`Upload failed: ${err.message}`, "error");
    }
  };

  const handleSubmit = async () => {
    if (!form.memberId || !form.memberName) {
      toast.add("Member ID and name are required", "error");
      return;
    }
    try {
      const response = await fetch('/api/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify(form)
      });
      if (response.ok) {
        toast.add("KYC submitted successfully!");
        setShowForm(false);
        setForm({ memberId: "", memberName: "", aadhaarNumber: "", panNumber: "", aadhaarDoc: "", panDoc: "" });
        fetchKyc();
      } else {
        const err = await response.json();
        toast.add(err.message || "Failed to submit KYC", "error");
      }
    } catch (err) {
      toast.add("Error submitting KYC", "error");
    }
  };

  const handleReview = async (id, status) => {
    if (status === 'rejected' && !rejectionReason) {
      toast.add("Please provide a rejection reason", "error");
      return;
    }
    try {
      const response = await fetch(`/api/kyc/${id}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify({ status, rejectionReason: status === 'rejected' ? rejectionReason : undefined })
      });
      if (response.ok) {
        toast.add(`KYC ${status} successfully!`);
        setReviewingKyc(null);
        setRejectionReason("");
        fetchKyc();
      } else {
        const err = await response.json();
        toast.add(err.message || "Failed to review KYC", "error");
      }
    } catch (err) {
      toast.add("Error reviewing KYC", "error");
    }
  };

  const pendingRecords = kycRecords.filter(k => k.status === 'pending');

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;

  return (
    <div>
      <SectionHeader title="KYC Verification" subtitle="Know Your Customer document verification"
        dark={dark}
        actions={!canReview ? [<Btn key="add" label="+ Submit KYC" onClick={() => setShowForm(true)} primary />] : []} />

      {canReview && pendingRecords.length > 0 && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: 16, marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 13, color: "#dc2626", flex: 1 }}>
            <strong>{pendingRecords.length}</strong> KYC record(s) pending review
          </div>
          <button onClick={() => document.getElementById('pending-section')?.scrollIntoView({ behavior: 'smooth' })}
            style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #dc2626", background: "transparent", color: "#dc2626", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>View Pending</button>
        </div>
      )}

      {showForm && (
        <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#f9fafb", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 16 }}>Submit KYC Documents</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "0 20px" }}>
            <Input label="Member ID *" value={form.memberId} onChange={v => setForm({ ...form, memberId: v })} dark={dark} />
            <Input label="Full Name *" value={form.memberName} onChange={v => setForm({ ...form, memberName: v })} dark={dark} />
            <Input label="Aadhaar Number" value={form.aadhaarNumber} onChange={v => setForm({ ...form, aadhaarNumber: v })} dark={dark} placeholder="XXXX-XXXX-XXXX" />
            <Input label="PAN Number" value={form.panNumber} onChange={v => setForm({ ...form, panNumber: v })} dark={dark} placeholder="ABCDE1234F" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "20px", marginTop: "20px" }}>
            <div style={{ background: dark ? "rgba(255,255,255,.02)" : "#fff", padding: 16, borderRadius: 8, border: `1px dashed ${dark ? "rgba(255,255,255,.2)" : "#cbd5e1"}` }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: dark ? "#f3f4f6" : "#333", marginBottom: 8 }}>Aadhaar Document</div>
              {form.aadhaarDoc ? (
                <div style={{ padding: "8px 12px", background: "#dcfce7", color: "#166534", borderRadius: 6, fontSize: 12, fontWeight: 600, marginBottom: 8 }}>✓ Uploaded</div>
              ) : null}
              <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileUpload('aadhaarDoc', e)} style={{ fontSize: 12, color: dark ? "rgba(255,255,255,.7)" : "#666" }} />
            </div>
            <div style={{ background: dark ? "rgba(255,255,255,.02)" : "#fff", padding: 16, borderRadius: 8, border: `1px dashed ${dark ? "rgba(255,255,255,.2)" : "#cbd5e1"}` }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: dark ? "#f3f4f6" : "#333", marginBottom: 8 }}>PAN Document</div>
              {form.panDoc ? (
                <div style={{ padding: "8px 12px", background: "#dcfce7", color: "#166534", borderRadius: 6, fontSize: 12, fontWeight: 600, marginBottom: 8 }}>✓ Uploaded</div>
              ) : null}
              <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileUpload('panDoc', e)} style={{ fontSize: 12, color: dark ? "rgba(255,255,255,.7)" : "#666" }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            <Btn label="Submit KYC" onClick={handleSubmit} primary />
            <Btn label="Cancel" onClick={() => { setShowForm(false); setForm({ memberId: "", memberName: "", aadhaarNumber: "", panNumber: "", aadhaarDoc: "", panDoc: "" }); }} />
          </div>
        </div>
      )}

      {reviewingKyc && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 1000
        }} onClick={() => setReviewingKyc(null)}>
          <div style={{ background: dark ? "#1e293b" : "#fff", borderRadius: 16, padding: 28, maxWidth: 480, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 16, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 16 }}>Review KYC  {reviewingKyc.memberName}</div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: dark ? "rgba(255,255,255,.5)" : "#6b7280", marginBottom: 4 }}>Member ID</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: dark ? "#f3f4f6" : "#111" }}>{reviewingKyc.memberId}</div>
            </div>
            {reviewingKyc.aadhaarNumber && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: dark ? "rgba(255,255,255,.5)" : "#6b7280", marginBottom: 4 }}>Aadhaar Number</div>
                <div style={{ fontSize: 14, color: dark ? "#f3f4f6" : "#111" }}>{reviewingKyc.aadhaarNumber}</div>
              </div>
            )}
            {reviewingKyc.panNumber && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: dark ? "rgba(255,255,255,.5)" : "#6b7280", marginBottom: 4 }}>PAN Number</div>
                <div style={{ fontSize: 14, color: dark ? "#f3f4f6" : "#111" }}>{reviewingKyc.panNumber}</div>
              </div>
            )}
            
            <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
              {reviewingKyc.aadhaarDoc && (
                <div style={{ flex: 1, padding: 12, background: dark ? "rgba(255,255,255,.05)" : "#f8fafc", borderRadius: 8, border: `1px solid ${dark ? "rgba(255,255,255,.1)" : "#e2e8f0"}` }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: dark ? "rgba(255,255,255,.6)" : "#475569", marginBottom: 6 }}>Aadhaar Document</div>
                  {reviewingKyc.aadhaarDoc.endsWith(".pdf") ? (
                    <a href={`${API_BASE.replace('/api', '')}${reviewingKyc.aadhaarDoc}`} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#2563eb", textDecoration: "none", fontWeight: 600 }}>View PDF</a>
                  ) : (
                    <a href={`${API_BASE.replace('/api', '')}${reviewingKyc.aadhaarDoc}`} target="_blank" rel="noreferrer">
                      <img src={`${API_BASE.replace('/api', '')}${reviewingKyc.aadhaarDoc}`} alt="Aadhaar" style={{ width: "100%", maxHeight: 80, objectFit: "cover", borderRadius: 4 }} />
                    </a>
                  )}
                </div>
              )}
              {reviewingKyc.panDoc && (
                <div style={{ flex: 1, padding: 12, background: dark ? "rgba(255,255,255,.05)" : "#f8fafc", borderRadius: 8, border: `1px solid ${dark ? "rgba(255,255,255,.1)" : "#e2e8f0"}` }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: dark ? "rgba(255,255,255,.6)" : "#475569", marginBottom: 6 }}>PAN Document</div>
                  {reviewingKyc.panDoc.endsWith(".pdf") ? (
                    <a href={`${API_BASE.replace('/api', '')}${reviewingKyc.panDoc}`} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#2563eb", textDecoration: "none", fontWeight: 600 }}>View PDF</a>
                  ) : (
                    <a href={`${API_BASE.replace('/api', '')}${reviewingKyc.panDoc}`} target="_blank" rel="noreferrer">
                      <img src={`${API_BASE.replace('/api', '')}${reviewingKyc.panDoc}`} alt="PAN" style={{ width: "100%", maxHeight: 80, objectFit: "cover", borderRadius: 4 }} />
                    </a>
                  )}
                </div>
              )}
            </div>

            <div style={{ fontSize: 12, color: dark ? "rgba(255,255,255,.5)" : "#6b7280", marginBottom: 4 }}>Submitted</div>
            <div style={{ fontSize: 13, color: dark ? "#f3f4f6" : "#111", marginBottom: 16 }}>{new Date(reviewingKyc.submittedAt).toLocaleString()}</div>

            <Input label="Rejection Reason (required if rejecting)" value={rejectionReason} onChange={setRejectionReason} dark={dark} placeholder="Enter reason for rejection..." />

            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <Btn label="Approve" onClick={() => handleReview(reviewingKyc._id, 'approved')} primary />
              <Btn label="Reject" onClick={() => handleReview(reviewingKyc._id, 'rejected')} danger />
              <Btn label="Cancel" onClick={() => { setReviewingKyc(null); setRejectionReason(""); }} />
            </div>
          </div>
        </div>
      )}

      {canReview && pendingRecords.length > 0 && (
        <div id="pending-section" style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 12 }}>Pending Review ({pendingRecords.length})</div>
          <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
            <Table dark={dark} cols={["Member ID", "Name", "Aadhaar", "PAN", "Submitted", "Action"]}
              rows={pendingRecords.map(k => [
                k.memberId,
                k.memberName,
                k.aadhaarNumber || " ",
                k.panNumber || " ",
                new Date(k.submittedAt).toLocaleDateString(),
                <button key={k._id} onClick={() => { setReviewingKyc(k); setRejectionReason(""); }}
                  style={{ fontSize: 11, padding: "6px 12px", borderRadius: 6, border: "1px solid #7c3aed", background: "rgba(124,58,237,0.1)", color: "#7c3aed", cursor: "pointer", fontWeight: 600 }}>Review</button>
              ])} />
          </div>
        </div>
      )}

      <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 14 }}>All KYC Records</div>
        <Table dark={dark} cols={["Member ID", "Name", "Status", "Reviewed By", "Date", "Docs"]}
          rows={kycRecords.map(k => [
            k.memberId,
            k.memberName,
            <Badge key={k._id} text={k.status} color={k.status === 'approved' ? 'green' : k.status === 'rejected' ? 'red' : 'yellow'} />,
            k.reviewedBy || " ",
            new Date(k.submittedAt).toLocaleDateString(),
            `${k.aadhaarNumber ? 'A' : ''}${k.aadhaarNumber && k.panNumber ? '+' : ''}${k.panNumber ? 'P' : ''}` || "N/A"
          ])} />
      </div>
    </div>
  );
}
