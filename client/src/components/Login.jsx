import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { COMPANY } from "../utils/constants";
import { loginUser } from "../utils/api";

export function Login() {
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
      const data = await loginUser(userId.trim(), password.trim());
      login(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: 14,
            background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            fontWeight: 700,
            color: "#fff",
            margin: "0 auto 16px",
            boxShadow: "0 8px 20px rgba(37, 99, 235, 0.3)"
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
              onBlur={(e) => e.target.style.borderColor = "#d1d5db"}
            />
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
              onBlur={(e) => e.target.style.borderColor = "#d1d5db"}
            />
          </div>

          {error && (
            <div style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 8,
              padding: "12px",
              marginBottom: 20,
              fontSize: 13,
              color: "#dc2626"
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              background: loading ? "#9ca3af" : "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.2s"
            }}
            onMouseEnter={(e) => !loading && (e.target.style.background = "#1e40af")}
            onMouseLeave={(e) => !loading && (e.target.style.background = "#2563eb")}
          >
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
              <button
                key={acc.id}
                type="button"
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
    </div>
  );
}
