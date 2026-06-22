import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { Toast } from "./components/Toast";
import { PreviewDocument } from "./components/PreviewDocument";
import { Sidebar } from "./components/Sidebar";
import { ScrollToTop } from "./components/ScrollToTop";
import { Login } from "./components/Login"
import { useToast } from "./hooks/useToast";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

import { COMPANY, NAV_ITEMS } from "./utils/constants";

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
  const [dark, setDark] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [preview, setPreview] = useState(null);

  const { toasts, add, remove } = useToast();

  const {
    user,
    loading: authLoading,
    logout,
    hasModuleAccess,
  } = useAuth();

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
              onClick={() => setDark(!dark)}
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
