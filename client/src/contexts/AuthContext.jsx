import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

const ROLE_PERMISSIONS = {
  super_admin: {
    navItems: ["dashboard", "branches", "schemes", "groups", "agents", "members", "collections", "billing", "auctions", "prizes", "accounting", "reports", "enquiries", "notifications", "kyc", "user-management", "audit-logs", "platform-settings", "invoice-settings", "receipt-settings", "notification-settings", "role-permissions", "backup-restore", "lands"],
    permissions: ["create", "edit", "delete", "view", "approve", "reject", "configure", "export"],
  },
  admin: {
    navItems: ["dashboard", "branches", "schemes", "groups", "agents", "members", "collections", "billing", "auctions", "reports", "notifications", "kyc", "enquiries", "user-management", "audit-logs", "role-permissions", "lands"],
    permissions: ["create", "edit", "view", "approve"],
  },
  agent: {
    navItems: ["dashboard", "members", "collections", "notifications"],
    permissions: ["create", "view", "edit"],
  },
  customer: {
    navItems: ["dashboard", "schemes", "auctions", "notifications"],
    permissions: ["view"],
  },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
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

  const login = (userData, tokenValue) => {
    setUser(userData);
    setToken(tokenValue);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", tokenValue);
  };

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
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

  const hasModulePermission = useCallback((moduleId, permission) => {
    if (!user) return false;
    if (user.role === "super_admin") return true;
    if (!hasModuleAccess(moduleId)) return false;
    const mp = user.modulePermissions || [];
    const modPerm = mp.find(p => p.module === moduleId);
    if (modPerm) return !!modPerm[permission];
    return user.permissions?.includes(permission) || false;
  }, [user, hasModuleAccess]);

  const getDashboardForRole = useCallback(() => {
    if (!user) return null;
    return user.role;
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user, loading, login, logout, hasPermission, hasModuleAccess, hasModulePermission, getDashboardForRole
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
