// Sidebar component with fixed positioning and professional react-icons
import { useNavigate, useLocation } from "react-router-dom";
import { ROUTES } from "../utils/constants";
import {
  HiHome,
  HiUserGroup,
  HiDocumentText,
  HiSquares2X2,
  HiCreditCard,
  HiCurrencyRupee,
  HiScale,
  HiTrophy,
  HiPresentationChartBar,
  HiPresentationChartLine,
  HiBriefcase,
  HiBuildingOffice2,
  HiBell,
  HiCog6Tooth,
  HiUser,
  HiWallet,
} from "react-icons/hi2";

const ICON_MAP = {
  dashboard: HiHome,
  members: HiUserGroup,
  schemes: HiDocumentText,
  groups: HiSquares2X2,
  collections: HiCreditCard,
  billing: HiCurrencyRupee,
  auctions: HiScale,
  prizes: HiTrophy,
  accounting: HiPresentationChartBar,
  reports: HiPresentationChartLine,
  employees: HiBriefcase,
  branches: HiBuildingOffice2,
  notifications: HiBell,
  settings: HiCog6Tooth,
  profile: HiUser,
  payments: HiWallet,
};

function NavItem({ id, label, icon, active, collapsed, onNavigate }) {
  const IconComponent = ICON_MAP[icon] || HiHome;

  return (
    <button
      onClick={() => onNavigate(id)}
      title={collapsed ? label : ""}
      style={{
        width: "100%",
        padding: collapsed ? "14px 0" : "12px 16px",
        borderRadius: 10,
        border: "none",
        background: active === id ? "rgba(255,255,255,.15)" : "transparent",
        color: active === id ? "#fff" : "rgba(255,255,255,.65)",
        cursor: "pointer",
        fontSize: 14,
        fontWeight: active === id ? 600 : 400,
        display: "flex",
        alignItems: "center",
        gap: collapsed ? 0 : 14,
        justifyContent: collapsed ? "center" : "flex-start",
        transition: "all .2s ease",
        marginBottom: 2,
        borderLeft: active === id ? "3px solid #3b82f6" : "3px solid transparent",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        if (active !== id) {
          e.currentTarget.style.background = "rgba(255,255,255,.06)";
          e.currentTarget.style.color = "#fff";
        }
      }}
      onMouseLeave={(e) => {
        if (active !== id) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "rgba(255,255,255,.65)";
        }
      }}
    >
      <span style={{
        fontSize: collapsed ? 20 : 18,
        minWidth: collapsed ? "auto" : 24,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexShrink: 0,
      }}>
        <IconComponent />
      </span>
      {!collapsed && (
        <span style={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}>{label}</span>
      )}
      {active === id && !collapsed && (
        <span style={{
          position: "absolute",
          right: 8,
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "#3b82f6",
        }} />
      )}
    </button>
  );
}

export function Sidebar({ collapsed, setCollapsed, navItems = [], mobileOpen, onMobileToggle }) {
  const navigate = useNavigate();
  const location = useLocation();

  const path = location.pathname;
  const active = Object.entries(ROUTES).find(([, p]) => p === path)?.[0] || "dashboard";

  const handleNavigate = (id) => {
    const route = ROUTES[id];
    if (route) {
      navigate(route);
      if (mobileOpen && onMobileToggle) onMobileToggle();
    }
  };

  const sidebarContent = (
    <>
      <div style={{
        padding: collapsed ? "20px 12px" : "20px 24px",
        borderBottom: "1px solid rgba(255,255,255,.08)",
        display: "flex",
        alignItems: "center",
        gap: 14,
        cursor: "pointer",
        transition: "padding .25s ease",
      }} onClick={() => handleNavigate("dashboard")}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 15,
          fontWeight: 800,
          color: "#fff",
          boxShadow: "0 4px 12px rgba(59, 130, 246, 0.35)",
          flexShrink: 0,
        }}>
          HR
        </div>
        {!collapsed && (
          <div>
            <span style={{ fontSize: 17, fontWeight: 700, color: "#fff", display: "block", lineHeight: 1.2 }}>HR Chits</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,.4)", display: "block", marginTop: 2 }}>Enterprises</span>
          </div>
        )}
      </div>

      <div style={{
        flex: 1,
        padding: collapsed ? "16px 6px" : "16px 12px",
        overflowY: "auto",
        overflowX: "hidden",
        transition: "padding .25s ease",
      }}>
        {navItems.map((item) => (
          <NavItem key={item.id} {...item} active={active} collapsed={collapsed} onNavigate={handleNavigate} />
        ))}
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          padding: collapsed ? "16px 0" : "14px 20px",
          borderTop: "1px solid rgba(255,255,255,.08)",
          background: "transparent",
          border: "none",
          color: "rgba(255,255,255,.45)",
          cursor: "pointer",
          fontSize: 13,
          display: "flex",
          justifyContent: collapsed ? "center" : "flex-end",
          alignItems: "center",
          gap: 8,
          transition: "all .2s ease",
          fontWeight: 500,
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = "rgba(255,255,255,.8)"}
        onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,.45)"}
      >
        {collapsed ? "→" : "← Collapse"}
      </button>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div style={{
        width: collapsed ? 64 : 240,
        height: "100vh",
        background: "#0f172a",
        display: "flex",
        flexDirection: "column",
        transition: "width .25s ease",
        flexShrink: 0,
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 100,
        boxShadow: "2px 0 20px rgba(0,0,0,0.3)",
      }}
        className="hidden md:flex"
      >
        {sidebarContent}
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => { if (onMobileToggle) onMobileToggle(); }}
          style={{
            position: "fixed", inset: 0, zIndex: 99,
            background: "rgba(0,0,0,0.5)",
          }}
          className="md:hidden"
        />
      )}

      <div style={{
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        width: 260,
        background: "#0f172a",
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform .25s ease",
        boxShadow: mobileOpen ? "2px 0 20px rgba(0,0,0,0.3)" : "none",
      }}
        className="md:hidden"
      >
        {sidebarContent}
      </div>
    </>
  );
}
