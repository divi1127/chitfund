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

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: dark ? "#0f172a" : "#f1f5f9",
      }}
    >

      <Sidebar
        dark={dark}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        navItems={filteredNavItems}
      />

      <div
        style={{
          flex: 1,
          marginLeft: collapsed ? 64 : 240,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          transition: "margin-left .25s ease",
        }}
      >
        <header
          style={{
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
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: dark ? "#f1f5f9" : "#0f172a",
            }}
          >
            {COMPANY.name}
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ fontSize: 13, color: dark ? "rgba(255,255,255,.5)" : "#64748b" }}>
              {user?.name}
              <span style={{ opacity: 0.5, marginLeft: 8 }}>
                ({user?.role === "super_admin" ? "Super Admin" : user?.role === "sub_admin" ? "Sub Admin" : "User"})
              </span>
            </div>


            <button
              onClick={() => navigate("/notifications")}
              style={{
                position: "relative",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid " + (dark ? "rgba(255,255,255,.15)" : "#d1d5db"),
                background: dark ? "rgba(255,255,255,.05)" : "#fff",
                color: dark ? "#f3f4f6" : "#111",
                cursor: "pointer",
                fontSize: 16,
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={dark ? "#f3f4f6" : "#374151"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {notificationCount > 0 && (
                <span style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  background: "#ef4444",
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 700,
                  borderRadius: "50%",
                  width: 18,
                  height: 18,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                }}>
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              )}
            </button>

            <button
              onClick={toggleTheme}
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                cursor: "pointer",
                border: "1px solid " + (dark ? "rgba(255,255,255,.15)" : "#d1d5db"),
                background: dark ? "rgba(255,255,255,.05)" : "#fff",
                color: dark ? "#f3f4f6" : "#111",
                fontSize: 12,
              }}
            >
              {dark ? " Light" : " Dark"}
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
                fontSize: 12,
                fontWeight: 600,

              }}
            >
              Logout
            </button>
          </div>
        </header>

        <main style={{ flex: 1, overflowY: "auto", padding: 28 }}>
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
