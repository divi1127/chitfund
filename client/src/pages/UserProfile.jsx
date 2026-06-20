// User Profile page showing user details and assigned modules
import { useAuth } from "../contexts/AuthContext";
import { SectionHeader } from "../components/SectionHeader";
import { Badge } from "../components/Badge";
import { COMPANY } from "../utils/constants";

export function UserProfile({ dark }) {
  const { user } = useAuth();

  if (!user) {
    return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;
  }

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
      <SectionHeader title="My Profile" subtitle="View your profile and assigned permissions" dark={dark} />

      <div style={{ display: "grid", gap: 24 }}>
        {/* User Information Card */}
        <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 24 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 24 }}>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: 16,
              background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 700,
              color: "#fff",
              boxShadow: "0 8px 20px rgba(37, 99, 235, 0.3)"
            }}>
              {user.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: dark ? "#f3f4f6" : "#111", margin: "0 0 8px" }}>
                {user.name}
              </h2>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                <Badge text={roleLabels[user.role]} color={roleColors[user.role]} />
                <span style={{ fontSize: 13, color: dark ? "rgba(255,255,255,.5)" : "#6b7280" }}>• {user.userId}</span>
              </div>
              <div style={{ fontSize: 14, color: dark ? "rgba(255,255,255,.6)" : "#6b7280" }}>
                {user.email}
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, paddingTop: 20, borderTop: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb" }}>
            <div>
              <div style={{ fontSize: 12, color: dark ? "rgba(255,255,255,.5)" : "#6b7280", marginBottom: 4 }}>User ID</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: dark ? "#f3f4f6" : "#111" }}>{user.userId}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: dark ? "rgba(255,255,255,.5)" : "#6b7280", marginBottom: 4 }}>Role</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: dark ? "#f3f4f6" : "#111" }}>{roleLabels[user.role]}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: dark ? "rgba(255,255,255,.5)" : "#6b7280", marginBottom: 4 }}>Email</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: dark ? "#f3f4f6" : "#111" }}>{user.email}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: dark ? "rgba(255,255,255,.5)" : "#6b7280", marginBottom: 4 }}>Status</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: dark ? "#f3f4f6" : "#111" }}>Active</div>
            </div>
          </div>
        </div>

        {/* Assigned Modules */}
        <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 16 }}>Assigned Modules</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 12 }}>
            {(user.role === "super_admin" ? Object.keys(moduleLabels) : user.modules || []).map(moduleId => (
              <div key={moduleId} style={{
                padding: 12,
                background: dark ? "rgba(255,255,255,.05)" : "#f9fafb",
                borderRadius: 8,
                border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                gap: 10
              }}>
                <span style={{ fontSize: 16 }}>{moduleId === "dashboard" ? "🏠" : moduleId === "members" ? "👥" : moduleId === "schemes" ? "📋" : moduleId === "groups" ? "▤" : moduleId === "collections" ? "💳" : moduleId === "billing" ? "📄" : moduleId === "auctions" ? "🔨" : moduleId === "prizes" ? "🏆" : moduleId === "accounting" ? "📊" : moduleId === "reports" ? "📈" : moduleId === "employees" ? "👤" : moduleId === "branches" ? "🏢" : moduleId === "notifications" ? "🔔" : moduleId === "settings" ? "⚙" : "👥"}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: dark ? "#f3f4f6" : "#111" }}>{moduleLabels[moduleId] || moduleId}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Permissions */}
        <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 16 }}>Permissions</h3>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {(user.role === "super_admin" ? ["create", "edit", "delete", "view"] : user.permissions || []).map(permission => (
              <Badge key={permission} text={permission.charAt(0).toUpperCase() + permission.slice(1)} color="blue" />
            ))}
          </div>
        </div>

        {/* Company Information */}
        <div style={{ background: dark ? "rgba(255,255,255,.05)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid #e5e7eb", borderRadius: 12, padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: dark ? "#f3f4f6" : "#111", marginBottom: 16 }}>Organization Information</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, color: dark ? "rgba(255,255,255,.5)" : "#6b7280", marginBottom: 4 }}>Company</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: dark ? "#f3f4f6" : "#111" }}>{COMPANY.name}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: dark ? "rgba(255,255,255,.5)" : "#6b7280", marginBottom: 4 }}>Phone</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: dark ? "#f3f4f6" : "#111" }}>{COMPANY.phone}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: dark ? "rgba(255,255,255,.5)" : "#6b7280", marginBottom: 4 }}>Email</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: dark ? "#f3f4f6" : "#111" }}>{COMPANY.email}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: dark ? "rgba(255,255,255,.5)" : "#6b7280", marginBottom: 4 }}>GSTIN</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: dark ? "#f3f4f6" : "#111" }}>{COMPANY.gstin}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
