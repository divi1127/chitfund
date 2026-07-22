import { useNavigate, useLocation } from "react-router-dom";
import { ROUTES } from "../utils/constants";
import {
  HiHome, HiUserGroup, HiDocumentText, HiSquares2X2, HiCreditCard,
  HiCurrencyRupee, HiScale, HiTrophy, HiPresentationChartBar,
  HiPresentationChartLine, HiBriefcase, HiBuildingOffice2, HiBell,
  HiCog6Tooth, HiUser, HiWallet,
} from "react-icons/hi2";

const ICON_MAP = {
  dashboard: HiHome, members: HiUserGroup, schemes: HiDocumentText,
  groups: HiSquares2X2, collections: HiCreditCard, billing: HiCurrencyRupee,
  auctions: HiScale, prizes: HiTrophy, accounting: HiPresentationChartBar,
  reports: HiPresentationChartLine, employees: HiBriefcase,
  branches: HiBuildingOffice2, notifications: HiBell, settings: HiCog6Tooth,
  profile: HiUser, payments: HiWallet,
};

function NavItem({ id, label, icon, active, collapsed, onNavigate }) {
  const IconComponent = ICON_MAP[icon] || HiHome;
  const isActive = active === id;

  return (
    <button
      onClick={() => onNavigate(id)}
      title={collapsed ? label : ""}
      style={{
        width: "100%",
        padding: collapsed ? "12px 0" : "10px 14px",
        minHeight: 44,
        borderRadius: 8,
        border: "none",
        background: isActive ? "rgba(59,130,246,0.18)" : "transparent",
        color: isActive ? "#fff" : "rgba(255,255,255,.6)",
        cursor: "pointer",
        fontSize: 13.5,
        fontWeight: isActive ? 600 : 400,
        display: "flex",
        alignItems: "center",
        gap: collapsed ? 0 : 12,
        justifyContent: collapsed ? "center" : "flex-start",
        transition: "background .15s, color .15s",
        marginBottom: 1,
        borderLeft: isActive ? "3px solid #3b82f6" : "3px solid transparent",
        position: "relative",
        textAlign: "left",
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = "rgba(255,255,255,.07)";
          e.currentTarget.style.color = "#fff";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "rgba(255,255,255,.6)";
        }
      }}
    >
      <span style={{
        fontSize: collapsed ? 19 : 17,
        minWidth: collapsed ? "auto" : 22,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <IconComponent />
      </span>
      {!collapsed && (
        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1 }}>
          {label}
        </span>
      )}
      {isActive && !collapsed && (
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3b82f6", flexShrink: 0 }} />
      )}
    </button>
  );
}

function SidebarInner({ collapsed, setCollapsed, navItems, active, onNavigate, showCollapse = true }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Brand */}
      <div
        onClick={() => onNavigate("dashboard")}
        style={{
          padding: collapsed ? "18px 0" : "18px 20px",
          borderBottom: "1px solid rgba(255,255,255,.08)",
          display: "flex", alignItems: "center", gap: 12,
          cursor: "pointer", flexShrink: 0,
          justifyContent: collapsed ? "center" : "flex-start",
        }}
      >
        <div style={{
          width: 38, height: 38, borderRadius: 10, flexShrink: 0,
          background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, fontWeight: 800, color: "#fff",
          boxShadow: "0 4px 12px rgba(59,130,246,0.35)",
        }}>
          NVS
        </div>
        {!collapsed && (
          <div style={{ overflow: "hidden" }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#fff", display: "block", lineHeight: 1.2 }}>NVS CHIT</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,.4)", display: "block", marginTop: 2 }}>ENTERPRISES</span>
          </div>
        )}
      </div>

      {/* Nav items */}
      <div style={{
        flex: 1, overflowY: "auto", overflowX: "hidden",
        padding: collapsed ? "12px 6px" : "12px 10px",
      }}>
        {navItems.map((item) => (
          <NavItem key={item.id} {...item} active={active} collapsed={collapsed} onNavigate={onNavigate} />
        ))}
      </div>

      {/* Collapse toggle — desktop only */}
      {showCollapse && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand" : "Collapse"}
          style={{
            padding: collapsed ? "14px 0" : "13px 18px",
            borderTop: "1px solid rgba(255,255,255,.08)",
            background: "transparent", border: "none",
            color: "rgba(255,255,255,.4)", cursor: "pointer",
            display: "flex", justifyContent: collapsed ? "center" : "space-between",
            alignItems: "center", gap: 8, width: "100%",
            transition: "color .15s",
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = "rgba(255,255,255,.8)"}
          onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,.4)"}
        >
          {!collapsed && <span style={{ fontSize: 12, fontWeight: 500 }}>Collapse</span>}
          {collapsed
            ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          }
        </button>
      )}
    </div>
  );
}

export function Sidebar({ collapsed, setCollapsed, navItems = [], mobileOpen, onMobileToggle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const active = Object.entries(ROUTES).find(([, p]) => p === location.pathname)?.[0] || "dashboard";

  const handleNavigate = (id) => {
    const route = ROUTES[id];
    if (route) {
      navigate(route);
      if (onMobileToggle) onMobileToggle();
    }
  };

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <div
        className="hidden md:block"
        style={{
          width: collapsed ? 64 : 240,
          height: "100vh",
          background: "#0f172a",
          position: "fixed",
          left: 0, top: 0,
          zIndex: 100,
          transition: "width .25s ease",
          boxShadow: "2px 0 16px rgba(0,0,0,0.25)",
          overflow: "hidden",
        }}
      >
        <SidebarInner
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          navItems={navItems}
          active={active}
          onNavigate={handleNavigate}
          showCollapse={true}
        />
      </div>

      {/* ── Mobile overlay backdrop ── */}
      {mobileOpen && (
        <div
          onClick={() => { if (onMobileToggle) onMobileToggle(); }}
          className="md:hidden"
          style={{
            position: "fixed", inset: 0, zIndex: 199,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(2px)",
          }}
        />
      )}

      {/* ── Mobile drawer ── */}
      <div
        className="md:hidden"
        style={{
          position: "fixed",
          left: 0, top: 0, bottom: 0,
          width: 260,
          background: "#0f172a",
          zIndex: 200,
          transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform .28s cubic-bezier(.4,0,.2,1)",
          boxShadow: mobileOpen ? "4px 0 24px rgba(0,0,0,0.4)" : "none",
          display: "flex", flexDirection: "column",
        }}
      >
        {/* Close button */}
        <div style={{ display: "flex", justifyContent: "flex-end", padding: "12px 12px 0", flexShrink: 0 }}>
          <button
            onClick={() => { if (onMobileToggle) onMobileToggle(); }}
            style={{
              background: "rgba(255,255,255,.08)", border: "none", cursor: "pointer",
              width: 32, height: 32, borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "rgba(255,255,255,.6)",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div style={{ flex: 1, overflow: "hidden" }}>
          <SidebarInner
            collapsed={false}
            setCollapsed={setCollapsed}
            navItems={navItems}
            active={active}
            onNavigate={handleNavigate}
            showCollapse={false}
          />
        </div>
      </div>
    </>
  );
}
