import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

function isValidJwt(t) {
  return t && t !== "null" && t !== "undefined" && t.includes(".");
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    if (storedUser && isValidJwt(storedToken)) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
    setLoading(false);
  }, []);

  const login = (userData, tokenValue) => {
    setUser(userData);
    setToken(tokenValue);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", tokenValue);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    if (user.role === "super_admin") return true;
    return user.permissions?.includes(permission) || false;
  };

  const getAuthHeaders = () => {
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  };

  const hasModuleAccess = (moduleId) => {
    if (!user) return false;
    if (user.role === "super_admin") {
      if (moduleId === "payments" || moduleId === "employees") return false;
      return true;
    }
    if (user.role === "sub_admin") return true;
    return user.modules?.includes(moduleId) || false;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, hasPermission, hasModuleAccess, getAuthHeaders }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
