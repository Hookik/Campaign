"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface User {
  id: string;
  email: string;
  role: string;
  name: string;
  businessId?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (role: string) => Promise<void>;
  logout: () => void;
  isCreator: boolean;
  isBusiness: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("hookik_token");
      const storedUser = localStorage.getItem("hookik_user");
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch {
      localStorage.removeItem("hookik_token");
      localStorage.removeItem("hookik_user");
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync across tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "hookik_token" && !e.newValue) {
        setToken(null);
        setUser(null);
      }
      if (e.key === "hookik_user" && e.newValue) {
        try { setUser(JSON.parse(e.newValue)); } catch {}
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const login = useCallback(async (role: string) => {
    const res = await fetch(`${API_BASE.replace('/api', '')}/api/dev/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    const data = await res.json();
    if (data.success) {
      localStorage.setItem("hookik_token", data.data.token);
      localStorage.setItem("hookik_user", JSON.stringify(data.data.user));
      setToken(data.data.token);
      setUser(data.data.user);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("hookik_token");
    localStorage.removeItem("hookik_user");
    setToken(null);
    setUser(null);
  }, []);

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    logout,
    isCreator: user?.role === "creator",
    isBusiness: user?.role === "business",
    isAdmin: user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
