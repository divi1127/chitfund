import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Toast } from "./components/Toast";
import { useToast } from "./hooks/useToast";
import { PreviewDocument } from "./components/PreviewDocument";
import { Sidebar } from "./components/Sidebar";
import { SectionHeader } from "./components/SectionHeader";
import { Login } from "./components/Login";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ScrollToTop } from "./components/ScrollToTop";
import { COMPANY, NAV_ITEMS } from "./utils/constants";
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
import { fetchData } from "./utils/api";

// ─── APP LAYOUT ───────────────────────────────────────────────────────────────
function AppLayout() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [collapsed, setCollapsed] = useState(false);
  const [preview, setPreview] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const { toasts, add, remove } = useToast();
  const { user, loading: authLoading, logout, hasModuleAccess } = useAuth();

  useEffect(() => {
    if (!user) return;
    const loadCount = async () => {
      try {
        const [auctions, collections, invoicesData] = await Promise.all([
          fetchData('/auctions').catch(() => []),
          fetchData('/collections').catch(() => []),
          user.role !== 'user' ? fetchData('/invoices').catch(() => []) : []
        ]);
        const scheduledAuctions = auctions.filter(a => a.status === "Scheduled").length || 0;
        const dueCollections = collections.filter(c => c.status === "Due" || c.status === "Pending").length || 0;
        const pendingApprovals = user.role !== 'user' ? invoicesData.filter(inv => inv.status === 'Proof Submitted' || inv.status === 'Pending').length || 0 : 0;
        setNotificationCount(scheduledAuctions + dueCollections + pendingApprovals);
      } catch (e) { setNotificationCount(0); }
    };
    loadCount();
    const interval = setInterval(loadCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const dark = theme === 'dark';
  const toggleTheme = () => {
    const next = dark ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
  };

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

  return (
    <div data-theme={theme} style={{
      display: "flex",
      height: "100vh",
      background: "var(--bg-primary)",
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
          background: "var(--bg-card)",
          borderBottom: "1px solid var(--border-color)",
          padding: "14px 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 50,
          backdropFilter: "blur(12px)",
          boxShadow: "var(--shadow-sm)",
        }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
            {COMPANY.name}
          </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{
              fontSize: 13,
              color: "var(--text-muted)",
              fontWeight: 500,
            }}>
              {user.name}
              <span style={{ opacity: 0.5, marginLeft: 8 }}>
                ({user.role === "super_admin" ? "Super Admin" : user.role === "sub_admin" ? "Sub Admin" : "User"})
              </span>
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => navigate("/notifications")}
              style={{
                position: "relative",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid var(--border-color)",
                background: "var(--bg-card)",
                color: "var(--text-primary)",
                cursor: "pointer",
                fontSize: 16,
                transition: "var(--transition)",
              }}
            >
              🔔
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
                border: "1px solid var(--border-color)",
                background: "var(--bg-card)",
                color: "var(--text-primary)",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 500,
                transition: "var(--transition)",
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
                transition: "var(--transition)",
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
        }}>
          <Routes>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard toast={{ add }} />} />
            <Route path="/members" element={<Members toast={{ add }} setPreview={setPreview} />} />
            <Route path="/schemes" element={<Schemes toast={{ add }} />} />
            <Route path="/groups" element={<Groups toast={{ add }} />} />
            <Route path="/collections" element={<Collections toast={{ add }} setPreview={setPreview} />} />
            <Route path="/billing" element={<BillingDashboard toast={{ add }} />} />
            <Route path="/auctions" element={<Auctions toast={{ add }} setPreview={setPreview} />} />
            <Route path="/prizes" element={<Prizes />} />
            <Route path="/accounting" element={<Accounting toast={{ add }} />} />
            <Route path="/reports" element={<ReportsDashboard toast={{ add }} />} />
            <Route path="/employees" element={<Employees toast={{ add }} />} />
            <Route path="/branches" element={<Branches toast={{ add }} />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<Settings toast={{ add }} />} />
            <Route path="/profile" element={<UserProfile toast={{ add }} />} />
            <Route path="/payments" element={<UserPaymentPortal toast={{ add }} />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
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
