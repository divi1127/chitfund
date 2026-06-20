// Authentication context for managing user authentication state
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    if (user.role === "super_admin") return true;
    return user.permissions?.includes(permission) || false;
  };

  const hasModuleAccess = (moduleId) => {
    if (!user) return false;
    if (user.role === "super_admin") {
      // Super Admin cannot access My Payments and Employees modules
      if (moduleId === "payments" || moduleId === "employees") return false;
      return true;
    }
    return user.modules?.includes(moduleId) || false;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasPermission, hasModuleAccess }}>
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
