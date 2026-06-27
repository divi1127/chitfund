// Settings page component
import { useState } from "react";
import { SectionHeader } from "../components/SectionHeader";
import { Btn } from "../components/Btn";
import { Input } from "../components/Input";
import { COMPANY } from "../utils/constants";

export function Settings({ toast }) {
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  const [form, setForm] = useState({
    companyName: COMPANY.name,
    address: COMPANY.address,
    phone: COMPANY.phone,
    email: COMPANY.email,
    gstin: COMPANY.gstin,
    website: COMPANY.website,
    bankName: COMPANY.bankName || "",
    accountName: COMPANY.accountName || "",
    accountNumber: COMPANY.accountNumber || "",
    ifscCode: COMPANY.ifscCode || "",
    branch: COMPANY.branch || "",
    upiId: COMPANY.upiId || "",
    googlePay: COMPANY.googlePay || "",
    phonePe: COMPANY.phonePe || "",
    paytm: COMPANY.paytm || "",
    bhim: COMPANY.bhim || "",
    cardGateway: COMPANY.cardGateway || "",
    merchantId: COMPANY.merchantId || "",
    apiKey: COMPANY.apiKey || "",
    cashInstructions: COMPANY.cashInstructions || ""
  });
  const [qrCode, setQrCode] = useState(null);

  const handleSave = () => {
    toast.add("Settings saved successfully!");
  };

  const handleQrCodeUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setQrCode(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <SectionHeader title="Settings" subtitle="Configure application settings" />
      
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 20 }}>Company Information</h3>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: "0 20px" }}>
          <Input label="Company Name" value={form.companyName} onChange={v => setForm({ ...form, companyName: v })} />
          <Input label="Address" value={form.address} onChange={v => setForm({ ...form, address: v })} />
          <Input label="Phone" value={form.phone} onChange={v => setForm({ ...form, phone: v })} />
          <Input label="Email" value={form.email} onChange={v => setForm({ ...form, email: v })} />
          <Input label="GSTIN" value={form.gstin} onChange={v => setForm({ ...form, gstin: v })} />
          <Input label="Website" value={form.website} onChange={v => setForm({ ...form, website: v })} />
        </div>

        <div style={{ marginTop: 24 }}>
          <Btn label="Save Settings" onClick={handleSave} primary />
        </div>
      </div>

      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 24, marginTop: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 20 }}>Bank Details</h3>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: "0 20px" }}>
          <Input label="Bank Name" value={form.bankName} onChange={v => setForm({ ...form, bankName: v })} />
          <Input label="Account Name" value={form.accountName} onChange={v => setForm({ ...form, accountName: v })} />
          <Input label="Account Number" value={form.accountNumber} onChange={v => setForm({ ...form, accountNumber: v })} />
          <Input label="IFSC Code" value={form.ifscCode} onChange={v => setForm({ ...form, ifscCode: v })} />
          <Input label="Branch" value={form.branch} onChange={v => setForm({ ...form, branch: v })} />
        </div>

        <div style={{ marginTop: 24 }}>
          <Btn label="Save Bank Details" onClick={handleSave} primary />
        </div>
      </div>

      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 24, marginTop: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 20 }}>UPI Details</h3>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: "0 20px" }}>
          <Input label="UPI ID" value={form.upiId} onChange={v => setForm({ ...form, upiId: v })} placeholder="company@upi" />
          <Input label="Google Pay" value={form.googlePay} onChange={v => setForm({ ...form, googlePay: v })} placeholder="company@okhdfcbank" />
          <Input label="PhonePe" value={form.phonePe} onChange={v => setForm({ ...form, phonePe: v })} placeholder="company@ybl" />
          <Input label="Paytm" value={form.paytm} onChange={v => setForm({ ...form, paytm: v })} placeholder="company@paytm" />
          <Input label="BHIM" value={form.bhim} onChange={v => setForm({ ...form, bhim: v })} placeholder="company@upi" />
        </div>

        <div style={{ marginTop: 24 }}>
          <Btn label="Save UPI Details" onClick={handleSave} primary />
        </div>
      </div>

      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 24, marginTop: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 20 }}>QR Code</h3>
        
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8, display: "block" }}>Upload QR Code</label>
          <input 
            type="file" 
            accept="image/png,image/jpeg,image/svg+xml"
            onChange={handleQrCodeUpload}
            style={{ padding: 8, borderRadius: 8, border: "1px solid var(--border-color)", background: "var(--bg-card)", color: "var(--text-primary)", width: "100%" }}
          />
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
            Accepted formats: PNG, JPG, SVG
          </div>
        </div>

        {qrCode && (
          <div style={{ marginBottom: 20, textAlign: "center" }}>
            <img src={qrCode} alt="QR Code" style={{ maxWidth: 200, maxHeight: 200, borderRadius: 8 }} />
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>Preview</div>
          </div>
        )}

        <div style={{ marginTop: 24 }}>
          <Btn label="Save QR Code" onClick={handleSave} primary />
        </div>
      </div>

      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 24, marginTop: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 20 }}>Card Payment Details</h3>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: "0 20px" }}>
          <Input label="Card Payment Gateway" value={form.cardGateway || ""} onChange={v => setForm({ ...form, cardGateway: v })} placeholder="Razorpay, Stripe, etc." />
          <Input label="Merchant ID" value={form.merchantId || ""} onChange={v => setForm({ ...form, merchantId: v })} />
          <Input label="API Key" value={form.apiKey || ""} onChange={v => setForm({ ...form, apiKey: v })} type="password" />
        </div>

        <div style={{ marginTop: 24 }}>
          <Btn label="Save Card Details" onClick={handleSave} primary />
        </div>
      </div>

      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 24, marginTop: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 20 }}>Cash Payment Instructions</h3>
        
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8, display: "block" }}>Cash Collection Instructions</label>
          <textarea
            value={form.cashInstructions || ""}
            onChange={e => setForm({ ...form, cashInstructions: e.target.value })}
            placeholder="Enter instructions for cash payments (e.g., Visit office at X address, contact person Y, etc.)"
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: 8,
              border: "1px solid var(--border-color)",
              background: "var(--bg-card)",
              color: "var(--text-primary)",
              fontSize: 14,
              minHeight: 100,
              resize: "vertical"
            }}
          />
        </div>

        <div style={{ marginTop: 24 }}>
          <Btn label="Save Cash Instructions" onClick={handleSave} primary />
        </div>
      </div>

      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 24, marginTop: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 20 }}>Application Preferences</h3>
        
        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Dark Mode</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Toggle dark theme</div>
            </div>
            <button style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #d1d5db", background: "#fff", color: "#111", cursor: "pointer", fontSize: 12 }}>
              {isDark ? "Enabled" : "Disabled"}
            </button>
          </div>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Email Notifications</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Receive email alerts</div>
            </div>
            <button style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #d1d5db", background: "#fff", color: "#111", cursor: "pointer", fontSize: 12 }}>
              Enabled
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
