import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

const ROLE_PERMISSIONS = {
  super_admin: {
    navItems: ["dashboard", "members", "schemes", "groups", "collections", "billing", "auctions", "prizes", "accounting", "reports", "employees", "branches", "notifications", "settings", "profile", "enquiries", "user-management", "audit-logs", "kyc"],
    permissions: ["create", "edit", "delete", "view", "approve", "reject", "configure", "export"],
  },
  sub_admin: {
    navItems: ["dashboard", "members", "schemes", "groups", "collections", "billing", "auctions", "reports", "notifications", "profile", "kyc", "enquiries"],
    permissions: ["create", "edit", "view"],
  },
  user: {
    navItems: ["dashboard", "profile", "payments", "notifications", "enquiries"],
    permissions: ["view"],
  },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
      } catch {
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("user");
    window.location.href = "/login";
  }, []);

  const hasPermission = useCallback((permission) => {
    if (!user) return false;
    if (user.role === "super_admin") return true;
    return user.permissions?.includes(permission) || false;
  }, [user]);

  const hasModuleAccess = useCallback((moduleId) => {
    if (!user) return false;
    const roleConfig = ROLE_PERMISSIONS[user.role];
    if (!roleConfig) return false;
    if (user.role === "super_admin") {
      return roleConfig.navItems.includes(moduleId);
    }
    return roleConfig.navItems.includes(moduleId) || user.modules?.includes(moduleId) || false;
  }, [user]);

  const getDashboardForRole = useCallback(() => {
    if (!user) return null;
    return user.role;
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user, loading, login, logout, hasPermission, hasModuleAccess, getDashboardForRole
    }}>
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
