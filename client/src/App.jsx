import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toast } from "./components/Toast";
import { useToast } from "./hooks/useToast";
import { PreviewDocument } from "./components/PreviewDocument";
import { Sidebar } from "./components/Sidebar";
import { SectionHeader } from "./components/SectionHeader";
import { Btn } from "./components/Btn";
import { Input } from "./components/Input";
import { Login } from "./components/Login";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ScrollToTop } from "./components/ScrollToTop";
import { COMPANY, NAV_ITEMS, ROUTES } from "./utils/constants";
import { Dashboard } from "./pages/Dashboard";
import { Members } from "./pages/Members";
import { Schemes } from "./pages/Schemes";
import { Groups } from "./pages/Groups";
import { Collections } from "./pages/Collections";
import { BillingDashboard } from "./pages/BillingDashboard";
import { Auctions } from "./pages/Auctions";
import { Prizes } from "./pages/Prizes";
import { Accounting } from "./pages/Accounting";
import { ReportsDashboard } from "./pages/ReportsDashboard";
import { Employees } from "./pages/Employees";
import { Branches } from "./pages/Branches";
import { Notifications } from "./pages/Notifications";
import { Settings } from "./pages/Settings";
import { UserProfile } from "./pages/UserProfile";
import { UserPaymentPortal } from "./pages/UserPaymentPortal";

// ─── PAGE WRAPPER ─────────────────────────────────────────────────────────────
function PageWrapper({ children, title, subtitle, dark, actions }) {
  return (
    <>
      {title && <SectionHeader title={title} subtitle={subtitle} dark={dark} actions={actions} />}
      {children}
    </>
  );
}

// ─── AUTH LAYOUT ──────────────────────────────────────────────────────────────
function AuthLayout({ children }) {
  const { user } = useAuth();
  if (!user) return <Login />;
  return children;
}

// ─── APP LAYOUT ───────────────────────────────────────────────────────────────
function AppLayout() {
  const [dark, setDark] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [preview, setPreview] = useState(null);
  const { toasts, add, remove } = useToast();
  const { user, loading: authLoading, logout, hasModuleAccess } = useAuth();

  if (authLoading) {
    return (
      <div style={{
        display: "flex", justifyContent: "center", alignItems: "center",
        minHeight: "100vh", background: "#0f172a", color: "#fff"
      }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  // Filter navigation items based on user permissions
  const filteredNavItems = NAV_ITEMS.filter(item => hasModuleAccess(item.id));

  const isUserRole = user?.role === "user";

  return (
    <div style={{
      display: "flex",
      height: "100vh",
      background: dark ? "#0f172a" : "#f1f5f9",
    }}>
      {/* Sidebar - Fixed */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        navItems={filteredNavItems}
      />

      {/* Main Content Area - Offset by sidebar width */}
      <div style={{
        flex: 1,
        marginLeft: collapsed ? 64 : 240,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        transition: "margin-left .25s ease",
      }}>
        {/* Header */}
        <header style={{
          background: dark ? "rgba(255,255,255,.04)" : "#fff",
          borderBottom: dark ? "1px solid rgba(255,255,255,.08)" : "1px solid #e2e8f0",
          padding: "14px 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 50,
          backdropFilter: "blur(12px)",
          boxShadow: dark ? "none" : "0 1px 3px rgba(0,0,0,.04)",
        }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: dark ? "#f1f5f9" : "#0f172a" }}>
            {COMPANY.name}
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{
              fontSize: 13,
              color: dark ? "rgba(255,255,255,.5)" : "#64748b",
              fontWeight: 500,
            }}>
              {user.name}
              <span style={{ opacity: 0.5, marginLeft: 8 }}>
                ({user.role === "super_admin" ? "Super Admin" : user.role === "sub_admin" ? "Sub Admin" : "User"})
              </span>
            </div>
            <button
              onClick={() => setDark(!dark)}
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                border: dark ? "1px solid rgba(255,255,255,.12)" : "1px solid #e2e8f0",
                background: dark ? "rgba(255,255,255,.06)" : "#fff",
                color: dark ? "#f1f5f9" : "#0f172a",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 500,
                transition: "all .15s ease",
              }}
            >
              {dark ? "☀️ Light" : "🌙 Dark"}
            </button>
            <button
              onClick={logout}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "1px solid #ef4444",
                background: "transparent",
                color: "#ef4444",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                transition: "all .15s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#ef4444"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#ef4444"; }}
            >
              Logout
            </button>
          </div>
        </header>

        {/* Main Content - Scrollable */}
        <main style={{
          flex: 1,
          overflowY: "auto",
          padding: "28px",
          background: dark ? "transparent" : "#f1f5f9",
        }}>
          <Routes>
            <Route path={ROUTES.dashboard} element={<Dashboard dark={dark} toast={{ add }} />} />
            <Route path={ROUTES.members} element={<Members dark={dark} toast={{ add }} setPreview={setPreview} />} />
            <Route path={ROUTES.schemes} element={<Schemes dark={dark} toast={{ add }} />} />
            <Route path={ROUTES.groups} element={<Groups dark={dark} toast={{ add }} />} />
            <Route path={ROUTES.collections} element={<Collections dark={dark} toast={{ add }} setPreview={setPreview} />} />
            <Route path={ROUTES.billing} element={<BillingDashboard dark={dark} toast={{ add }} />} />
            <Route path={ROUTES.auctions} element={<Auctions dark={dark} toast={{ add }} setPreview={setPreview} />} />
            <Route path={ROUTES.prizes} element={<Prizes dark={dark} />} />
            <Route path={ROUTES.accounting} element={<Accounting dark={dark} />} />
            <Route path={ROUTES.reports} element={<ReportsDashboard dark={dark} toast={{ add }} />} />
            <Route path={ROUTES.employees} element={<Employees dark={dark} toast={{ add }} />} />
            <Route path={ROUTES.branches} element={<Branches dark={dark} toast={{ add }} />} />
            <Route path={ROUTES.notifications} element={<Notifications dark={dark} />} />
            <Route path={ROUTES.settings} element={<Settings dark={dark} toast={{ add }} />} />
            <Route path={ROUTES.profile} element={<UserProfile dark={dark} />} />
            <Route path={ROUTES.payments} element={<UserPaymentPortal dark={dark} toast={{ add }} />} />
            <Route path="*" element={<Navigate to={ROUTES.dashboard} replace />} />
          </Routes>
        </main>
      </div>

      {/* Toast Notifications */}
      <Toast toasts={toasts} remove={remove} />

      {/* Preview Modal */}
      {preview && <PreviewDocument doc={preview} onClose={() => setPreview(null)} />}
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
