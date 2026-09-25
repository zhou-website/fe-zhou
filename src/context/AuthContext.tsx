"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  authApi,
  userApi,
  getAuthToken,
  setAuthToken,
  removeAuthToken,
} from "@/lib/api";

export interface AuthUser {
  id?: number;
  name: string;
  email: string;
  role: "user" | "admin" | "superadmin";
  company?: string;
  phone?: string;
  avatarText?: string;
  avatarUrl?: string;
  provider?: "credentials" | "google";
  token?: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  company_name?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    email: string,
    role?: "user" | "admin" | "superadmin",
    redirectUrl?: string | null,
    customData?: Partial<AuthUser>
  ) => void;
  loginWithApi: (
    email: string,
    password: string,
    redirectUrl?: string | null
  ) => Promise<{ success: boolean; message?: string }>;
  registerWithApi: (
    payload: RegisterInput,
    redirectUrl?: string | null
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  requireAuth: (targetUrl: string, e?: React.MouseEvent) => boolean;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "zhou_auth_user";

function normalizeRole(backendRole: string): "user" | "admin" | "superadmin" {
  const lower = backendRole.toLowerCase();
  if (lower.includes("super")) return "superadmin";
  if (lower.includes("admin")) return "admin";
  return "user";
}

function getInitials(name: string): string {
  if (!name) return "ZC";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Helper redirect according to role matrix
  const navigateByRole = useCallback(
    (role: "user" | "admin" | "superadmin", redirectUrl?: string | null) => {
      let destination = "/";
      if (role === "admin") {
        destination = "/dashboard/admin";
      } else if (role === "superadmin") {
        destination = "/dashboard/superadmin";
      } else {
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
          destination = isTryingAdmin || isTryingSuperadmin ? "/" : redirectUrl;
        } else if (role === "admin") {
          destination = isTryingSuperadmin ? "/dashboard/admin" : redirectUrl;
        } else {
          destination = redirectUrl;
        }
      }

      router.push(destination);
    },
    [router]
  );

  // Refresh profile from live backend
  const refreshUserProfile = useCallback(async () => {
    const existingToken = getAuthToken();
    if (!existingToken) return;

    try {
      const res = await userApi.getProfile();
      if (res.success && res.data) {
        const profile = res.data;
        const mappedRole = normalizeRole(profile.role);
        setUser((prev) => {
          const updated: AuthUser = {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role: mappedRole,
            company: profile.company_name || prev?.company || "Zhou Consulting Klien",
            phone: profile.phone || prev?.phone,
            avatarUrl: profile.avatar_url || prev?.avatarUrl,
            avatarText: getInitials(profile.name),
            provider: prev?.provider || "credentials",
            token: existingToken,
          };
          try {
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
          } catch {}
          return updated;
        });
        setTokenState(existingToken);
        setIsAuthenticated(true);
      } else if (res.error === "UNAUTHORIZED" || res.message?.toLowerCase().includes("unauthorized") || res.message?.toLowerCase().includes("token")) {
        // Token expired/revoked in backend Redis blacklist
        removeAuthToken();
        localStorage.removeItem(AUTH_STORAGE_KEY);
        setUser(null);
        setTokenState(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error("Gagal sinkronisasi profil dari backend:", err);
    }
  }, []);

  // Load auth state from localStorage and verify with backend on client mount
  useEffect(() => {
    try {
      const storedToken = getAuthToken();
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);

      if (storedToken) {
        setTokenState(storedToken);
      }

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

    // Background verify session with live server
    if (getAuthToken()) {
      refreshUserProfile();
    }
  }, [refreshUserProfile]);

  /**
   * Login dengan kredensial nyata ke live REST backend http://43.173.2.162/api/v1/auth/login
   */
  const loginWithApi = async (
    email: string,
    password: string,
    redirectUrl?: string | null
  ): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    try {
      const res = await authApi.login({ email, password });

      if (!res.success || !res.data) {
        setIsLoading(false);
        return {
          success: false,
          message: res.message || "Email atau kata sandi tidak valid.",
        };
      }

      const { token: jwtToken, user: backendUser } = res.data;
      const role = normalizeRole(backendUser.role);

      const authData: AuthUser = {
        id: backendUser.id,
        name: backendUser.name,
        email: backendUser.email,
        role,
        company: backendUser.company_name || (role === "admin" ? "Zhou Consulting Internal" : "Zhou Consulting Klien"),
        phone: backendUser.phone,
        avatarText: getInitials(backendUser.name),
        avatarUrl: backendUser.avatar_url || undefined,
        provider: "credentials",
        token: jwtToken,
      };

      setAuthToken(jwtToken);
      setTokenState(jwtToken);
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
      } catch (err) {
        console.error("Gagal menyimpan sesi auth ke localStorage:", err);
      }

      setUser(authData);
      setIsAuthenticated(true);
      setIsLoading(false);

      navigateByRole(role, redirectUrl);

      return {
        success: true,
        message: res.message || "Login berhasil",
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal menghubungi server backend.";
      setIsLoading(false);
      return {
        success: false,
        message,
      };
    }
  };

  /**
   * Registrasi klien baru ke live REST backend http://43.173.2.162/api/v1/auth/register
   */
  const registerWithApi = async (
    payload: RegisterInput,
    redirectUrl?: string | null
  ): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    try {
      const res = await authApi.register(payload);

      if (!res.success) {
        setIsLoading(false);
        return {
          success: false,
          message: res.message || "Gagal melakukan registrasi akun.",
        };
      }

      // Auto login setelah registrasi berhasil
      await loginWithApi(payload.email, payload.password, redirectUrl);
      return {
        success: true,
        message: res.message || "Registrasi berhasil.",
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan saat registrasi.";
      setIsLoading(false);
      return {
        success: false,
        message,
      };
    }
  };

  /**
   * Fallback / Direct Login (untuk Google OAuth Modal atau demonstrasi lokal)
   */
  const login = (
    email: string,
    role: "user" | "admin" | "superadmin" = "user",
    redirectUrl?: string | null,
    customData?: Partial<AuthUser>
  ) => {
    let name = "Budi Pratama (Direktur)";
    let company = "PT Maju Makmur Sentosa";
    let avatarText = "BP";

    if (role === "admin") {
      name = "Konsultan Senior Zhou";
      company = "Zhou Consulting Internal";
      avatarText = "KZ";
    } else if (role === "superadmin") {
      name = "Super Administrator Zhou";
      company = "Zhou Consulting Leadership";
      avatarText = "SZ";
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

    navigateByRole(role, redirectUrl);
  };

  /**
   * Logout dengan memanggil backend API (blacklist Redis token) dan membersihkan storage
   */
  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.warn("Backend logout notice:", err);
    } finally {
      removeAuthToken();
      try {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } catch (err) {
        console.error("Gagal menghapus sesi auth:", err);
      }
      setUser(null);
      setTokenState(null);
      setIsAuthenticated(false);
      router.push("/");
    }
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
        token,
        isAuthenticated,
        isLoading,
        login,
        loginWithApi,
        registerWithApi,
        logout,
        requireAuth,
        refreshUserProfile,
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
