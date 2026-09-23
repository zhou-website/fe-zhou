"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export interface AuthUser {
  name: string;
  email: string;
  role: "user" | "admin" | "superadmin";
  company?: string;
  avatarText?: string;
  avatarUrl?: string;
  provider?: "credentials" | "google";
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    email: string,
    role?: "user" | "admin" | "superadmin",
    redirectUrl?: string | null,
    customData?: Partial<AuthUser>
  ) => void;
  logout: () => void;
  requireAuth: (targetUrl: string, e?: React.MouseEvent) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "zhou_auth_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load auth state from localStorage on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AuthUser;
        if (parsed && parsed.email) {
          setUser(parsed);
          setIsAuthenticated(true);
        }
      }
    } catch (err) {
      console.error("Gagal membaca status auth dari localStorage:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (
    email: string,
    role: "user" | "admin" | "superadmin" = "user",
    redirectUrl?: string | null,
    customData?: Partial<AuthUser>
  ) => {
    let name = "Klien";
    let company = "PT Sinar Mas Perkasa";
    let avatarText = "KL";

    if (role === "admin") {
      name = "Staff Administrator";
      company = "Zhou Consulting Internal";
      avatarText = "AD";
    } else if (role === "superadmin") {
      name = "Muhamad Dekhsa Afnan, SH.";
      company = "Zhou Consulting Leadership";
      avatarText = "MD";
    } else {
      if (email.includes("@")) {
        const prefix = email.split("@")[0];
        name = prefix.charAt(0).toUpperCase() + prefix.slice(1);
        avatarText = prefix.substring(0, 2).toUpperCase();
      }
    }

    const authData: AuthUser = {
      name: customData?.name || name,
      email: customData?.email || email,
      role,
      company: customData?.company || company,
      avatarText: customData?.avatarText || avatarText,
      avatarUrl: customData?.avatarUrl,
      provider: customData?.provider || "credentials",
    };

    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
    } catch (err) {
      console.error("Gagal menyimpan sesi auth ke localStorage:", err);
    }

    setUser(authData);
    setIsAuthenticated(true);

    // Determine target route according to Role-Based Redirect Matrix
    let destination = "/";
    if (role === "admin") {
      destination = "/dashboard/admin";
    } else if (role === "superadmin") {
      destination = "/dashboard/superadmin";
    } else {
      // Role: USER / CLIENT default destination is Public Website (/)
      destination = "/";
    }

    if (
      redirectUrl &&
      redirectUrl.trim() !== "" &&
      redirectUrl !== "/login" &&
      redirectUrl !== "/register"
    ) {
      const isTryingAdmin = redirectUrl.startsWith("/dashboard/admin");
      const isTryingSuperadmin = redirectUrl.startsWith("/dashboard/superadmin");

      if (role === "user") {
        if (isTryingAdmin || isTryingSuperadmin) {
          destination = "/";
        } else {
          destination = redirectUrl;
        }
      } else if (role === "admin") {
        if (isTryingSuperadmin) {
          destination = "/dashboard/admin";
        } else {
          destination = redirectUrl;
        }
      } else {
        destination = redirectUrl;
      }
    }

    router.push(destination);
  };

  const logout = () => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (err) {
      console.error("Gagal menghapus sesi auth:", err);
    }
    setUser(null);
    setIsAuthenticated(false);
    // Standard logout behavior: return user to Public Website (/)
    router.push("/");
  };

  const requireAuth = (targetUrl: string, e?: React.MouseEvent): boolean => {
    if (isAuthenticated) {
      return true;
    }
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    router.push(`/login?redirect=${encodeURIComponent(targetUrl)}`);
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        requireAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth harus digunakan di dalam AuthProvider");
  }
  return context;
}
