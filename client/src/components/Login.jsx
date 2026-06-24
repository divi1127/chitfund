import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { COMPANY } from "../utils/constants";
import { loginUser } from "../utils/api";

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
      justifyContent: "center", zIndex: 2000
    }}>
      <div style={{
        background: "#fff", borderRadius: 16, padding: 32, maxWidth: 420, width: "90%",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
      }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#111", marginBottom: 8 }}>Change Your Password</div>
          <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
            This is your first login. Please change your default password to continue.
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Current Password</label>
            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Enter current password" required
              style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, boxSizing: "border-box", outline: "none" }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>New Password</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Enter new password (min 6 chars)" required
              style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, boxSizing: "border-box", outline: "none" }} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Confirm New Password</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm new password" required
              style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, boxSizing: "border-box", outline: "none" }} />
          </div>
          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px", marginBottom: 16, fontSize: 13, color: "#dc2626" }}>
              {error}
            </div>
          )}
          <button type="submit" disabled={loading}
            style={{
              width: "100%", padding: "12px", background: loading ? "#9ca3af" : "#2563eb",
              color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer"
            }}>
            {loading ? "Changing Password..." : "Change Password & Login"}
          </button>
          <button type="button" onClick={onClose}
            style={{
              width: "100%", padding: "10px", marginTop: 8,
              background: "transparent", color: "#6b7280",
              border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14,
              cursor: "pointer"
            }}>
            Skip — Go to Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}

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
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)",
      padding: "20px"
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 16,
        padding: 40,
        width: "100%",
        maxWidth: 420,
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
      }}>
        <div style={{ textAlign: "center", marginBottom: 32, position: "relative" }}>
          <button
            onClick={() => navigate("/")}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              background: "#fff",
              color: "#374151",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            ← Back to Home
          </button>
          <div style={{
            width: 64, height: 64, borderRadius: 14,
            background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, fontWeight: 700, color: "#fff",
            margin: "0 auto 16px", boxShadow: "0 8px 20px rgba(37, 99, 235, 0.3)"
          }}>
            HR
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111", margin: "0 0 8px" }}>
            {COMPANY.name}
          </h1>
          <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>
            Chit Fund Management System
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>
              User ID
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter your User ID"
              required
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "1px solid #d1d5db",
                borderRadius: 10,
                fontSize: 14,
                boxSizing: "border-box",
                outline: "none"
              }}
              onFocus={(e) => e.target.style.borderColor = "#2563eb"}
              onBlur={(e) => e.target.style.borderColor = "#d1d5db"} />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your Password"
              required
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "1px solid #d1d5db",
                borderRadius: 10,
                fontSize: 14,
                boxSizing: "border-box",
                outline: "none"
              }}
              onFocus={(e) => e.target.style.borderColor = "#2563eb"}
              onBlur={(e) => e.target.style.borderColor = "#d1d5db"} />
          </div>

          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "12px", marginBottom: 20, fontSize: 13, color: "#dc2626" }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            style={{
              width: "100%", padding: "14px", background: loading ? "#9ca3af" : "#2563eb",
              color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer"
            }}
            onMouseEnter={(e) => !loading && (e.target.style.background = "#1e40af")}
            onMouseLeave={(e) => !loading && (e.target.style.background = "#2563eb")}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div style={{ marginTop: 24, borderTop: "1px solid #f3f4f6", paddingTop: 20 }}>
          <p style={{ fontSize: 11, color: "#9ca3af", textAlign: "center", marginBottom: 10 }}>
            Quick Login (Development)
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { label: "Super Admin", id: "ADMIN001", pw: "admin123", color: "#2563eb" },
              { label: "Sub Admin",   id: "SUB001",   pw: "sub123",   color: "#7c3aed" },
              { label: "User",        id: "USER001",  pw: "user123",  color: "#059669" },
            ].map((acc) => (
              <button key={acc.id} type="button"
                onClick={() => { setUserId(acc.id); setPassword(acc.pw); setError(""); }}
                style={{
                  flex: 1,
                  padding: "8px 4px",
                  borderRadius: 8,
                  border: `1px solid ${acc.color}22`,
                  background: `${acc.color}0d`,
                  color: acc.color,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                  minWidth: 0,
                }}
              >
                {acc.label}
              </button>
            ))}
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
    </div>
  );
}
