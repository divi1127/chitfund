import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { COMPANY } from "../utils/constants";
import { ArrowLeft, UserCheck, TrendingUp, Users } from "lucide-react";
import { logo } from "../assets";

const API_BASE = import.meta.env.VITE_API_BASE || "https://chitfund-cxnp.onrender.com/api";

const inputStyle = {
  width: "100%", padding: "12px 16px", border: "1px solid #d1d5db", borderRadius: 10,
  fontSize: 15, boxSizing: "border-box", outline: "none", background: "#fff",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

export function AgentLogin() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/agent-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userId.trim(), password: password.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login failed");
      login(data.user, data.user.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#f8fafc" }}>
      <style>{`
        .login-wrapper { min-height: 100vh; display: flex; background: #f8fafc; }
        .login-form-side { flex: 1; display: flex; align-items: center; justify-content: center; padding: 24px 16px 40px; position: relative; min-height: 100vh; }
        .login-back-btn { position: absolute; top: 20px; left: 16px; }
        .login-card { width: 100%; max-width: 420px; margin-top: 48px; }
        @media (min-width: 480px) { .login-form-side { padding: 32px 32px 40px; } .login-back-btn { left: 32px; top: 28px; } }
        @media (min-width: 1024px) { .login-image-side { display: flex; width: 50%; min-height: 100vh; flex-direction: column; justify-content: flex-end; } .login-card { margin-top: 20px; } }
      `}</style>
      <div className="login-form-side">
        <button onClick={() => navigate("/")} className="login-back-btn" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", cursor: "pointer" }}>
          <ArrowLeft size={18} />
        </button>
        <div className="login-card">
          <div style={{ marginBottom: 32, textAlign: "center" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, #059669, #10b981)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <UserCheck size={36} color="#fff" />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111", margin: "0 0 4px" }}>Agent Login</h1>
            <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>{COMPANY.name}</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 7 }}>Agent ID</label>
              <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="e.g. 2026AG01" required style={inputStyle} onFocus={(e) => { e.target.style.borderColor = "#059669"; e.target.style.boxShadow = "0 0 0 3px rgba(5,150,105,0.1)"; }} onBlur={(e) => { e.target.style.borderColor = "#d1d5db"; e.target.style.boxShadow = "none"; }} />
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>Your password is your date of birth (DDMMYYYY)</div>
            </div>
            <div style={{ marginBottom: 22 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 7 }}>Password (DOB)</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="DDMMYYYY (e.g. 01011990)" required style={inputStyle} onFocus={(e) => { e.target.style.borderColor = "#059669"; e.target.style.boxShadow = "0 0 0 3px rgba(5,150,105,0.1)"; }} onBlur={(e) => { e.target.style.borderColor = "#d1d5db"; e.target.style.boxShadow = "none"; }} />
            </div>
            {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: 12, marginBottom: 18, fontSize: 13, color: "#dc2626" }}>{error}</div>}
            <button type="submit" disabled={loading} style={{ width: "100%", padding: 14, background: loading ? "#9ca3af" : "linear-gradient(135deg, #059669, #10b981)", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 4px 14px rgba(5,150,105,0.3)" }}>
              {loading ? "Signing in..." : "Sign In as Agent"}
            </button>
          </form>
          <div style={{ marginTop: 20, textAlign: "center" }}>
            <button onClick={() => navigate("/login")} style={{ background: "none", border: "none", color: "#059669", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Switch to Admin Login</button>
            <span style={{ color: "#94a3b8", margin: "0 8px", fontSize: 13 }}>|</span>
            <button onClick={() => navigate("/customer-login")} style={{ background: "none", border: "none", color: "#D4AF37", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Customer Login</button>
          </div>
          <p style={{ marginTop: 24, fontSize: 12, color: "#94a3b8", textAlign: "center" }}>&copy; {new Date().getFullYear()} {COMPANY.name}. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}