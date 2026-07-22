import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import { Toast } from "./components/Toast";
import { PreviewDocument } from "./components/PreviewDocument";
import { Sidebar } from "./components/Sidebar";
import { ScrollToTop } from "./components/ScrollToTop";
import { Login } from "./components/Login"
import { useToast } from "./hooks/useToast";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

import { COMPANY, NAV_ITEMS } from "./utils/constants";
import { fetchData } from "./utils/api";

import Landingpage from "./landingpage/Landingpage";

import { SuperAdminDashboard } from "./pages/SuperAdminDashboard";
import { SubAdminDashboard } from "./pages/SubAdminDashboard";
import { UserDashboard } from "./pages/UserDashboard";
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
import { PlatformSettings } from "./pages/PlatformSettings";
import { UserProfile } from "./pages/UserProfile";
import { UserPaymentPortal } from "./pages/UserPaymentPortal";
import { Enquiries } from "./pages/Enquiries";
import { UserManagement } from "./pages/UserManagement";
import { AuditLogs } from "./pages/AuditLogs";
import { KycVerification } from "./pages/KycVerification";

function ProtectedRoute({ children, requiredRole, requiredModule }) {
  const { user, hasModuleAccess } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && !requiredRole.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  if (requiredModule && !hasModuleAccess(requiredModule)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function RoleBasedDashboard({ dark, toast }) {
  const { user } = useAuth();
  if (user?.role === "super_admin") return <SuperAdminDashboard dark={dark} toast={toast} />;
  if (user?.role === "sub_admin") return <SubAdminDashboard dark={dark} toast={toast} />;
  return <UserDashboard dark={dark} toast={toast} />;
}

function AppLayout() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [preview, setPreview] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);


  const { toasts, add, remove } = useToast();

  const {
    user,
    loading: authLoading,
    logout,
    hasModuleAccess,
  } = useAuth();

  useEffect(() => {
    if (!user) return;
    const loadCount = async () => {
      try {
        const res = await fetch('/api/notifications', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          const data = await res.json();
          const count = data.unreadCount || 0;
          setNotificationCount(count);
        }
      } catch (e) { /* ignore */ }
    };
    loadCount();
    const interval = setInterval(loadCount, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const dark = theme === 'dark';
  const toggleTheme = () => {
    const next = dark ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
  };

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [dark]);

  if (authLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: "#0f172a",
          color: "#fff",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Landingpage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  const filteredNavItems = NAV_ITEMS.filter((item) =>
    hasModuleAccess(item.id)
  );

  const sidebarW = collapsed ? 64 : 240;

  return (
    <div style={{ minHeight: "100vh", background: dark ? "#0f172a" : "#f1f5f9" }}>

      <Sidebar
        dark={dark}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        navItems={filteredNavItems}
        mobileOpen={mobileOpen}
        onMobileToggle={() => setMobileOpen(false)}
      />

      <div
        className="app-main"
        style={{
          marginLeft: sidebarW,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          transition: "margin-left .25s ease",
        }}
      >
        <style>{`
          @media (max-width: 767px) {
            .app-main { margin-left: 0 !important; }
            .mobile-hamburger { display: flex !important; }
            .desktop-user-name { display: none !important; }
            .header-btn-text { display: none !important; }
          }
          @media (min-width: 768px) {
            .mobile-hamburger { display: none !important; }
          }
          @media (min-width: 640px) {
            .main-content { padding: 24px !important; }
          }
          @media (min-width: 1024px) {
            .main-content { padding: 28px !important; }
          }
          .d-grid { display: grid !important; gap: 16px; }
          @media (min-width: 768px) {
            .d-grid { gap: 20px; }
            .d-grid-2 { grid-template-columns: 1fr 1fr !important; }
            .d-grid-2-1 { grid-template-columns: 2fr 1fr !important; }
          }
          .d-flex { display: flex; gap: 24px; }
          @media (max-width: 767px) {
            .d-flex { flex-direction: column; gap: 16px; }
          }
        `}</style>
        <header
          className="app-header"
          style={{
            background: dark ? "rgba(255,255,255,.04)" : "#fff",
            borderBottom: dark ? "1px solid rgba(255,255,255,.08)" : "1px solid #e2e8f0",
            padding: "12px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "sticky",
            top: 0,
            zIndex: 50,
            backdropFilter: "blur(12px)",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <button
              onClick={() => setMobileOpen(true)}
              className="mobile-hamburger"
              style={{
                background: "none", border: "none", cursor: "pointer",
                padding: 4, color: dark ? "#f1f5f9" : "#0f172a",
                display: "flex", alignItems: "center", flexShrink: 0,
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div style={{ fontSize: 16, fontWeight: 700, color: dark ? "#f1f5f9" : "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {COMPANY.name}
            </div>
          </div>

          <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
            <div className="desktop-user-name" style={{ fontSize: 13, color: dark ? "rgba(255,255,255,.5)" : "#64748b", whiteSpace: "nowrap" }}>
              {user?.name}
              <span style={{ opacity: 0.5, marginLeft: 8 }}>
                ({user?.role === "super_admin" ? "Super Admin" : user?.role === "sub_admin" ? "Sub Admin" : "User"})
              </span>
            </div>

            <button
              onClick={() => navigate("/notifications")}
              className="header-btn"
              style={{
                position: "relative",
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid " + (dark ? "rgba(255,255,255,.15)" : "#d1d5db"),
                background: dark ? "rgba(255,255,255,.05)" : "#fff",
                color: dark ? "#f3f4f6" : "#111",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={dark ? "#f3f4f6" : "#374151"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {notificationCount > 0 && (
                <span style={{
                  position: "absolute", top: -4, right: -4,
                  background: "#ef4444", color: "#fff",
                  fontSize: 10, fontWeight: 700, borderRadius: "50%",
                  width: 17, height: 17,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                }}>
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              )}
            </button>

            <button
              onClick={toggleTheme}
              className="header-btn"
              style={{
                padding: "8px 10px",
                borderRadius: 8,
                cursor: "pointer",
                border: "1px solid " + (dark ? "rgba(255,255,255,.15)" : "#d1d5db"),
                background: dark ? "rgba(255,255,255,.05)" : "#fff",
                color: dark ? "#f3f4f6" : "#111",
                fontSize: 12, display: "flex", alignItems: "center", gap: 4,
              }}
            >
              {dark
                ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              }
              <span className="header-btn-text">{dark ? "Light" : "Dark"}</span>
            </button>

            <button
              onClick={logout}
              className="header-btn"
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #ef4444",
                background: "transparent",
                color: "#ef4444",
                cursor: "pointer",
                fontSize: 12, fontWeight: 600,
                display: "flex", alignItems: "center", gap: 4,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              <span className="header-btn-text">Logout</span>
            </button>
          </div>
        </header>

        <main style={{ flex: 1, overflowY: "auto", padding: "16px", minHeight: 0 }} className="main-content">
          <Routes>
            <Route path="/dashboard" element={<RoleBasedDashboard dark={dark} toast={{ add }} />} />

            <Route path="/members" element={
              <ProtectedRoute requiredModule="members">
                <Members dark={dark} toast={{ add }} setPreview={setPreview} />
              </ProtectedRoute>
            } />

            <Route path="/schemes" element={
              <ProtectedRoute requiredModule="schemes">
                <Schemes dark={dark} toast={{ add }} />
              </ProtectedRoute>
            } />

            <Route path="/groups" element={
              <ProtectedRoute requiredModule="groups">
                <Groups dark={dark} toast={{ add }} />
              </ProtectedRoute>
            } />

            <Route path="/collections" element={
              <ProtectedRoute requiredModule="collections">
                <Collections dark={dark} toast={{ add }} setPreview={setPreview} />
              </ProtectedRoute>
            } />

            <Route path="/billing" element={
              <ProtectedRoute requiredModule="billing">
                <BillingDashboard dark={dark} toast={{ add }} />
              </ProtectedRoute>
            } />

            <Route path="/auctions" element={
              <ProtectedRoute requiredModule="auctions">
                <Auctions dark={dark} toast={{ add }} setPreview={setPreview} />
              </ProtectedRoute>
            } />

            <Route path="/prizes" element={
              <ProtectedRoute requiredModule="prizes">
                <Prizes dark={dark} />
              </ProtectedRoute>
            } />

            <Route path="/accounting" element={
              <ProtectedRoute requiredModule="accounting">
                <Accounting dark={dark} />
              </ProtectedRoute>
            } />

            <Route path="/reports" element={
              <ProtectedRoute requiredModule="reports">
                <ReportsDashboard dark={dark} toast={{ add }} />
              </ProtectedRoute>
            } />

            <Route path="/employees" element={
              <ProtectedRoute requiredModule="employees">
                <Employees dark={dark} toast={{ add }} />
              </ProtectedRoute>
            } />

            <Route path="/branches" element={
              <ProtectedRoute requiredModule="branches">
                <Branches dark={dark} toast={{ add }} />
              </ProtectedRoute>
            } />

            <Route path="/notifications" element={
              <ProtectedRoute requiredModule="notifications">
                <Notifications dark={dark} toast={{ add }} />
              </ProtectedRoute>
            } />

            <Route path="/settings" element={
              <ProtectedRoute requiredModule="settings">
                <Settings dark={dark} toast={{ add }} />
              </ProtectedRoute>
            } />

            <Route path="/platform-settings" element={
              <ProtectedRoute requiredRole={["super_admin"]}>
                <PlatformSettings dark={dark} toast={{ add }} />
              </ProtectedRoute>
            } />

            <Route path="/profile" element={
              <ProtectedRoute requiredModule="profile">
                <UserProfile dark={dark} />
              </ProtectedRoute>
            } />

            <Route path="/payments" element={
              <ProtectedRoute requiredModule="payments">
                <UserPaymentPortal dark={dark} toast={{ add }} />
              </ProtectedRoute>
            } />

            <Route path="/agents" element={
              <ProtectedRoute requiredModule="agents">
                <Members dark={dark} toast={{ add }} setPreview={setPreview} />
              </ProtectedRoute>
            } />

            <Route path="/commissions" element={
              <ProtectedRoute requiredModule="commissions">
                <Prizes dark={dark} />
              </ProtectedRoute>
            } />

            <Route path="/enquiries" element={
              <ProtectedRoute requiredModule="enquiries">
                <Enquiries dark={dark} toast={{ add }} />
              </ProtectedRoute>
            } />

            <Route path="/user-management" element={
              <ProtectedRoute requiredRole={["super_admin", "sub_admin"]}>
                <UserManagement dark={dark} toast={{ add }} />
              </ProtectedRoute>
            } />

            <Route path="/audit-logs" element={
              <ProtectedRoute requiredRole={["super_admin"]}>
                <AuditLogs dark={dark} toast={{ add }} />
              </ProtectedRoute>
            } />

            <Route path="/kyc-verification" element={
              <ProtectedRoute requiredModule="kyc">
                <KycVerification dark={dark} toast={{ add }} />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>

      <Toast toasts={toasts} remove={remove} />

      {preview && (
        <PreviewDocument
          doc={preview}
          onClose={() => setPreview(null)}
        />
      )}
    </div>
  );
}

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
