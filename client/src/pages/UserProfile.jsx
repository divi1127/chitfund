import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { SectionHeader } from "../components/SectionHeader";
import { Badge } from "../components/Badge";
import { Btn } from "../components/Btn";
import { Input } from "../components/Input";
import { COMPANY } from "../utils/constants";

export function UserProfile({ toast }) {
  const { user, logout } = useAuth();
  const [showChangePw, setShowChangePw] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");

  if (!user) {
    return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;
  }

  const handleChangePassword = async () => {
    setPwError("");
    if (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword) {
      setPwError("All fields are required"); return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwError("New password must be at least 6 characters"); return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError("Passwords do not match"); return;
    }
    setPwLoading(true);
    try {
      const response = await fetch("/api/auth/auth-change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({
          currentPassword: pwForm.currentPassword,
          newPassword: pwForm.newPassword
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      toast?.add("Password changed successfully!");
      setShowChangePw(false);
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      logout();
    } catch (err) {
      setPwError(err.message);
    } finally {
      setPwLoading(false);
    }
  };

  const roleLabels = {
    super_admin: "Super Administrator",
    sub_admin: "Sub Administrator",
    user: "User"
  };

  const roleColors = {
    super_admin: "purple",
    sub_admin: "blue",
    user: "gray"
  };

  const moduleLabels = {
    dashboard: "Dashboard",
    members: "Members",
    schemes: "Chit Schemes",
    groups: "Groups",
    collections: "Collections",
    billing: "Billing",
    auctions: "Auctions",
    prizes: "Prize Payments",
    accounting: "Accounting",
    reports: "Reports",
    employees: "Employees",
    branches: "Branches",
    notifications: "Notifications",
    settings: "Settings",
    user_management: "User Management"
  };

  return (
    <div>
      <SectionHeader title="My Profile" subtitle="View your profile and change password" />

      <div style={{ display: "grid", gap: 24 }}>
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 24 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 24 }}>
            <div style={{
              width: 80, height: 80, borderRadius: 16,
              background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28, fontWeight: 700, color: "#fff",
              boxShadow: "0 8px 20px rgba(37, 99, 235, 0.3)"
            }}>
              {user.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 8px" }}>
                {user.name}
              </h2>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                <Badge text={roleLabels[user.role]} color={roleColors[user.role]} />
                <span style={{ fontSize: 13, color: "var(--text-muted)" }}>• {user.userId}</span>
              </div>
              <div style={{ fontSize: 14, color: "var(--text-muted)" }}>{user.email}</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, paddingTop: 20, borderTop: "1px solid var(--border-color)" }}>
            <div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>User ID</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>{user.userId}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Role</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>{roleLabels[user.role]}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Email</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>{user.email}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Status</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>Active</div>
            </div>
          </div>
        </div>

        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Password</h3>
            <Btn label={showChangePw ? "Cancel" : "Change Password"} onClick={() => { setShowChangePw(!showChangePw); setPwError(""); setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); }} primary={!showChangePw} />
          </div>
          {showChangePw && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16 }}>
                <Input label="Current Password" value={pwForm.currentPassword} onChange={v => setPwForm({ ...pwForm, currentPassword: v })} type="password" />
                <Input label="New Password" value={pwForm.newPassword} onChange={v => setPwForm({ ...pwForm, newPassword: v })} type="password" />
                <Input label="Confirm New Password" value={pwForm.confirmPassword} onChange={v => setPwForm({ ...pwForm, confirmPassword: v })} type="password" />
              </div>
              {pwError && <div style={{ color: "#dc2626", fontSize: 13, marginTop: 8 }}>{pwError}</div>}
              <div style={{ marginTop: 12 }}>
                <Btn label={pwLoading ? "Changing..." : "Save New Password"} onClick={handleChangePassword} primary disabled={pwLoading} />
                <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 12 }}>You will be logged out after changing password</span>
              </div>
            </div>
          )}
        </div>

        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>Assigned Modules</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 12 }}>
            {(user.role === "super_admin" ? Object.keys(moduleLabels) : user.modules || []).map(moduleId => (
              <div key={moduleId} style={{
                padding: 12, background: "var(--bg-card)", borderRadius: 8,
                border: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: 10
              }}>
                <span style={{ fontSize: 16 }}>
                  {moduleId === "dashboard" ? "🏠" : moduleId === "members" ? "👥" : moduleId === "schemes" ? "📋" :
                   moduleId === "groups" ? "▤" : moduleId === "collections" ? "💳" : moduleId === "billing" ? "📄" :
                   moduleId === "auctions" ? "🔨" : moduleId === "prizes" ? "🏆" : moduleId === "accounting" ? "📊" :
                   moduleId === "reports" ? "📈" : moduleId === "employees" ? "👤" : moduleId === "branches" ? "🏢" :
                   moduleId === "notifications" ? "🔔" : moduleId === "settings" ? "⚙" : "👥"}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{moduleLabels[moduleId] || moduleId}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>Permissions</h3>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {(user.role === "super_admin" ? ["create", "edit", "delete", "view"] : user.permissions || []).map(permission => (
              <Badge key={permission} text={permission.charAt(0).toUpperCase() + permission.slice(1)} color="blue" />
            ))}
          </div>
        </div>

        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>Organization Information</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Company</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>{COMPANY.name}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Phone</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>{COMPANY.phone}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Email</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>{COMPANY.email}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>GSTIN</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>{COMPANY.gstin}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
