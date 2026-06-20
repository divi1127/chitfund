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

  // Public Routes
  if (!user) {
    return (
      <Routes>
          <Route
              path="/login"
              element={
                <Login
                />
              }
            />
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
      {/* Sidebar */}
      <Sidebar
        dark={dark}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        navItems={filteredNavItems}
      />

      {/* Main Content */}
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
        {/* Header */}
        <header
          style={{
            background: dark
              ? "rgba(255,255,255,.04)"
              : "#fff",
            borderBottom: dark
              ? "1px solid rgba(255,255,255,.08)"
              : "1px solid #e2e8f0",
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

          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontSize: 13,
                color: dark
                  ? "rgba(255,255,255,.5)"
                  : "#64748b",
              }}
            >
              {user?.name}

              <span
                style={{
                  opacity: 0.5,
                  marginLeft: 8,
                }}
              >
                (
                {user?.role === "super_admin"
                  ? "Super Admin"
                  : user?.role === "sub_admin"
                  ? "Sub Admin"
                  : "User"}
                )
              </span>
            </div>

            <button
              onClick={() => setDark(!dark)}
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                cursor: "pointer",
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
              }}
            >
              Logout
            </button>
          </div>
        </header>

        {/* Pages */}
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 28,
          }}
        >
          <Routes>
            <Route
              path="/dashboard"
              element={
                <Dashboard
                  dark={dark}
                  toast={{ add }}
                />
              }
            />
          

            <Route
              path="/members"
              element={
                <Members
                  dark={dark}
                  toast={{ add }}
                  setPreview={setPreview}
                />
              }
            />

            <Route
              path="/schemes"
              element={
                <Schemes
                  dark={dark}
                  toast={{ add }}
                />
              }
            />

            <Route
              path="/groups"
              element={
                <Groups
                  dark={dark}
                  toast={{ add }}
                />
              }
            />

            <Route
              path="/collections"
              element={
                <Collections
                  dark={dark}
                  toast={{ add }}
                  setPreview={setPreview}
                />
              }
            />

            <Route
              path="/billing"
              element={
                <BillingDashboard
                  dark={dark}
                  toast={{ add }}
                />
              }
            />

            <Route
              path="/auctions"
              element={
                <Auctions
                  dark={dark}
                  toast={{ add }}
                  setPreview={setPreview}
                />
              }
            />

            <Route
              path="/prizes"
              element={<Prizes dark={dark} />}
            />

            <Route
              path="/accounting"
              element={<Accounting dark={dark} />}
            />

            <Route
              path="/reports"
              element={
                <ReportsDashboard
                  dark={dark}
                  toast={{ add }}
                />
              }
            />

            <Route
              path="/employees"
              element={
                <Employees
                  dark={dark}
                  toast={{ add }}
                />
              }
            />

            <Route
              path="/branches"
              element={
                <Branches
                  dark={dark}
                  toast={{ add }}
                />
              }
            />

            <Route
              path="/notifications"
              element={<Notifications dark={dark} />}
            />

            <Route
              path="/settings"
              element={
                <Settings
                  dark={dark}
                  toast={{ add }}
                />
              }
            />

            <Route
              path="/profile"
              element={<UserProfile dark={dark} />}
            />

            <Route
              path="/payments"
              element={
                <UserPaymentPortal
                  dark={dark}
                  toast={{ add }}
                />
              }
            />

            <Route
              path="*"
              element={
                <Navigate
                  to="/dashboard"
                  replace
                />
              }
            />
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