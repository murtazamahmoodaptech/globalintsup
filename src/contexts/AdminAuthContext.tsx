import { createContext, useContext, useState, ReactNode } from "react";

interface AdminAuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

// HARDCODED CREDENTIALS — replace with real auth later
const ADMIN_EMAIL = "admin@premiumdetail.com";
const ADMIN_PASSWORD = "Admin@123";

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem("admin_auth") === "true"
  );

const login = async (email: string, password: string) => {
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    setIsAuthenticated(true);
    sessionStorage.setItem("admin_auth", "true");
    return true;
  }
  return false;
};

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("admin_auth");
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
