import { useState, useEffect } from "react";
import { SectionHeader } from "../components/SectionHeader";
import { Input } from "../components/Input";
import { Btn } from "../components/Btn";
import { useAuth } from "../contexts/AuthContext";

export function PlatformSettings({ dark, toast }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  if (user?.role !== "super_admin") {
    return <div style={{ textAlign: "center", padding: 60, color: "#dc2626" }}>Access denied. Only Super Admins can access platform settings.</div>;
  }

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings', {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify(settings)
      });
      if (response.ok) {
        toast.add("Settings saved successfully!");
      } else {
        const err = await response.json();
        toast.add(err.message || "Failed to save settings", "error");
      }
    } catch (err) {
      toast.add("Error saving settings", "error");
    }
    setSaving(false);
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;

  const sections = [
    {
      title: "Company Information", category: "general",
      fields: [
        { key: "company_name", label: "Company Name" },
        { key: "company_address", label: "Address" },
        { key: "company_phone", label: "Phone" },
        { key: "company_email", label: "Email" },
      ]
    },
    {
      title: "Payment Settings", category: "payment",
      fields: [
        { key: "payment_grace_days", label: "Payment Grace Period (days)", type: "number" },
        { key: "late_fine_percentage", label: "Late Fine (% per month)", type: "number" },
      ]
    },
    {
      title: "Commission & Penalty", category: "commission",
      fields: [
        { key: "commission_rate", label: "Default Commission Rate (%)", type: "number" },
      ]
    },
    {
      title: "KYC Settings", category: "kyc",
      fields: [
        { key: "max_kyc_days", label: "KYC Submission Max Days", type: "number" },
      ]
    },
  ];

  return (
    <div>
      <SectionHeader title="Platform Settings" subtitle="Configure system-wide settings" dark={dark} />

      {sections.map(section => (
        <div key={section.category} style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 20 }}>{section.title}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: "0 20px" }}>
            {section.fields.map(field => (
              <Input key={field.key}
                label={field.label}
                value={settings[field.key] !== undefined ? String(settings[field.key]) : ""}
                onChange={v => updateSetting(field.key, field.type === 'number' ? Number(v) : v)}
                dark={dark}
                type={field.type || "text"}
              />
            ))}
          </div>
        </div>
      ))}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
        <Btn label={saving ? "Saving..." : "Save All Settings"} onClick={handleSave} primary disabled={saving} />
      </div>
    </div>
  );
}
