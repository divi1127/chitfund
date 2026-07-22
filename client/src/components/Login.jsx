import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { COMPANY } from "../utils/constants";
import { loginUser } from "../utils/api";
import { ArrowLeft, ShieldCheck, TrendingUp, Users } from "lucide-react";
import { logo } from "../assets";

function ChangePasswordModal({ userId, token, onClose, onSuccess }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required"); return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters"); return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match"); return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/auth/auth-change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center",
      justifyContent: "center", zIndex: 2000, padding: "16px",
    }}>
      <div style={{
        background: "#fff", borderRadius: 16, padding: "28px 24px", maxWidth: 420, width: "100%",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
      }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#111", marginBottom: 8 }}>Change Your Password</div>
          <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
            This is your first login. Please change your default password to continue.
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          {[
            { label: "Current Password", value: currentPassword, setter: setCurrentPassword, placeholder: "Enter current password" },
            { label: "New Password", value: newPassword, setter: setNewPassword, placeholder: "Enter new password (min 6 chars)" },
            { label: "Confirm New Password", value: confirmPassword, setter: setConfirmPassword, placeholder: "Confirm new password" },
          ].map(({ label, value, setter, placeholder }) => (
            <div key={label} style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>{label}</label>
              <input type="password" value={value} onChange={e => setter(e.target.value)} placeholder={placeholder} required
                style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, boxSizing: "border-box", outline: "none" }} />
            </div>
          ))}
          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: 10, marginBottom: 16, fontSize: 13, color: "#dc2626" }}>
              {error}
            </div>
          )}
          <button type="submit" disabled={loading}
            style={{
              width: "100%", padding: 12, background: loading ? "#9ca3af" : "#2563eb",
              color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer"
            }}>
            {loading ? "Changing Password..." : "Change Password & Login"}
          </button>
          <button type="button" onClick={onClose}
            style={{
              width: "100%", padding: 10, marginTop: 8,
              background: "transparent", color: "#6b7280",
              border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, cursor: "pointer"
            }}>
            Skip — Go to Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px 16px",
  border: "1px solid #d1d5db",
  borderRadius: 10,
  fontSize: 15,
  boxSizing: "border-box",
  outline: "none",
  background: "#fff",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

export function Login() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showChangePw, setShowChangePw] = useState(false);
  const [pendingToken, setPendingToken] = useState(null);
  const [pendingUser, setPendingUser] = useState(null);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await loginUser(userId.trim(), password.trim());
      login(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePwChangeSuccess = () => {
    login(pendingUser, pendingToken);
    setShowChangePw(false);
    setPendingToken(null);
    setPendingUser(null);
  };

  return (
    <>
      {/* Responsive styles */}
      <style>{`
        .login-wrapper {
          min-height: 100vh;
          display: flex;
          background: #f8fafc;
        }
        .login-form-side {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 16px 40px;
          position: relative;
          min-height: 100vh;
        }
        .login-back-btn {
          position: absolute;
          top: 20px;
          left: 16px;
        }
        .login-card {
          width: 100%;
          max-width: 420px;
          margin-top: 48px;
        }
        .login-image-side {
          display: none;
        }
        .login-trust-row {
          flex-direction: column;
          gap: 12px;
        }
        @media (min-width: 480px) {
          .login-form-side {
            padding: 32px 32px 40px;
          }
          .login-back-btn {
            left: 32px;
            top: 28px;
          }
        }
        @media (min-width: 1024px) {
          .login-image-side {
            display: flex;
            position: relative;
            width: 50%;
            min-height: 100vh;
            overflow: hidden;
            flex-direction: column;
            justify-content: flex-end;
          }
          .login-card {
            margin-top: 20px;
          }
          .login-trust-row {
            flex-direction: row;
            gap: 24px;
          }
        }
      `}</style>

      <div className="login-wrapper">
        {/* ─── Left: Login Form ─── */}
        <div className="login-form-side">

          {/* Back to Home */}
          <button
            onClick={() => navigate("/")}
            aria-label="Back to Home"
            className="login-back-btn"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 40, height: 40, borderRadius: 10,
              border: "1px solid #e2e8f0", background: "#fff",
              color: "#64748b", cursor: "pointer", transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#1565C0"; e.currentTarget.style.borderColor = "#1565C0"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#64748b"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
          >
            <ArrowLeft size={18} />
          </button>

          <div className="login-card">
            {/* Brand */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <img src={logo} alt="NVS CHIT ENTERPRISES" style={{ height: 44, objectFit: "contain" }} />
                <div>
                  <h1 style={{ fontSize: 19, fontWeight: 800, color: "#111", margin: 0 }}>
                    {COMPANY.name}
                  </h1>
                  <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
                    Chit Fund Management System
                  </p>
                </div>
              </div>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: "#111", margin: "0 0 6px" }}>
                Welcome Back
              </h2>
              <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>
                Sign in to your account to continue
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 7 }}>
                  User ID
                </label>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Enter your User ID"
                  required
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = "#1565C0"; e.target.style.boxShadow = "0 0 0 3px rgba(21,101,192,0.1)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#d1d5db"; e.target.style.boxShadow = "none"; }}
                />
              </div>

              <div style={{ marginBottom: 22 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 7 }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your Password"
                  required
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = "#1565C0"; e.target.style.boxShadow = "0 0 0 3px rgba(21,101,192,0.1)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#d1d5db"; e.target.style.boxShadow = "none"; }}
                />
              </div>

              {error && (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: 12, marginBottom: 18, fontSize: 13, color: "#dc2626" }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%", padding: 14,
                  background: loading ? "#9ca3af" : "linear-gradient(135deg, #1565C0, #1E88E5)",
                  color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: loading ? "none" : "0 4px 14px rgba(21,101,192,0.3)",
                  transition: "opacity 0.2s, transform 0.2s",
                }}
                onMouseEnter={(e) => { if (!loading) { e.target.style.opacity = "0.92"; e.target.style.transform = "translateY(-1px)"; }}}
                onMouseLeave={(e) => { if (!loading) { e.target.style.opacity = "1"; e.target.style.transform = "translateY(0)"; }}}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            {/* Quick Login */}
            <div style={{ marginTop: 28, borderTop: "1px solid #e2e8f0", paddingTop: 20 }}>
              <p style={{ fontSize: 11, color: "#94a3b8", textAlign: "center", marginBottom: 10, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                Quick Login
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[
                  { label: "Super Admin", id: "ADMIN001", pw: "admin123", color: "#1565C0" },
                  { label: "Sub Admin",   id: "SUB001",   pw: "sub123",   color: "#7c3aed" },
                  { label: "Agent",       id: "2026AG01", pw: "user123",  color: "#059669" },
                  { label: "Customer",    id: "2026CM01", pw: "user123",  color: "#D4AF37" },
                ].map((acc) => (
                  <button key={acc.id} type="button"
                    onClick={() => { setUserId(acc.id); setPassword(acc.pw); setError(""); }}
                    style={{
                      flex: 1, padding: "8px 4px", borderRadius: 8,
                      border: `1px solid ${acc.color}22`,
                      background: `${acc.color}0d`,
                      color: acc.color, fontSize: 11, fontWeight: 600,
                      cursor: "pointer", minWidth: 0, transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = `${acc.color}18`}
                    onMouseLeave={(e) => e.currentTarget.style.background = `${acc.color}0d`}
                  >
                    {acc.label}
                  </button>
                ))}
              </div>
            </div>

            <p style={{ marginTop: 24, fontSize: 12, color: "#94a3b8", textAlign: "center" }}>
              &copy; {new Date().getFullYear()} {COMPANY.name}. All rights reserved.
            </p>
          </div>
        </div>

        {/* ─── Right: Image Panel (lg+) ─── */}
        <div className="login-image-side">
            <img
            src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80"
            alt="NVS CHIT ENTERPRISES"
            style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }}
          />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(135deg, rgba(13,71,161,0.88) 0%, rgba(21,101,192,0.62) 50%, rgba(30,136,229,0.32) 100%)",
          }} />

          <div style={{ position: "relative", zIndex: 10, padding: "48px 40px" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "rgba(212,175,55,0.2)", border: "1px solid rgba(212,175,55,0.3)",
              borderRadius: 9999, padding: "4px 14px", marginBottom: 16,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#D4AF37" }} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#D4AF37", textTransform: "uppercase" }}>
                Govt. Registered &amp; Regulated
              </span>
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: "#fff", margin: "0 0 8px", lineHeight: 1.2 }}>
              {COMPANY.name}
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.75)", margin: 0, maxWidth: 400, lineHeight: 1.6 }}>
              India's most transparent chit fund platform. Save systematically, access funds instantly, and earn competitive dividends.
            </p>

            <div className="login-trust-row" style={{
              display: "flex", marginTop: 28,
              paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.12)",
            }}>
              {[
                { icon: <ShieldCheck size={16} />, text: "No Credit Score Needed" },
                { icon: <TrendingUp size={16} />, text: "Up to 11% Annual Dividend" },
                { icon: <Users size={16} />, text: "10,000+ Happy Members" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
                  <span style={{ color: "#D4AF37" }}>{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showChangePw && (
        <ChangePasswordModal
          userId={userId}
          token={pendingToken}
          onClose={() => { login(pendingUser, pendingToken); setShowChangePw(false); setPendingToken(null); setPendingUser(null); }}
          onSuccess={handlePwChangeSuccess}
        />
      )}
    </>
  );
}
