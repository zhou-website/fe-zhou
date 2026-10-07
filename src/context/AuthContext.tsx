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

export function normalizeRole(backendRole?: string | null, email?: string | null): "user" | "admin" | "superadmin" {
  const emailLower = String(email || "").toLowerCase().trim();
  if (emailLower.includes("superadmin")) return "superadmin";
  if (emailLower.startsWith("admin@") || emailLower.includes("admin@") || emailLower.includes("konsultan@")) return "admin";

  if (!backendRole) return "user";
  const lower = String(backendRole).toLowerCase().trim();
  if (lower.includes("super")) return "superadmin";
  if (lower.includes("admin")) return "admin";
  return "user";
}

export function isDummyValue(val?: string | null): boolean {
  if (!val) return true;
  const s = val.trim().toLowerCase();
  if (s === "-" || s === "") return true;
  if (
    s.includes("mitra klien") ||
    s.includes("perusahaan klien") ||
    s.includes("zhou consulting klien") ||
    s.includes("maju makmur") ||
    s === "klien terdaftar" ||
    s === "nama klien" ||
    s === "pmk" ||
    s === "pk" ||
    s === "mms" ||
    s === "kl"
  ) {
    return true;
  }
  const cleanDigits = s.replace(/\D/g, "");
  if (
    cleanDigits === "6281234567890" ||
    cleanDigits === "081234567890" ||
    cleanDigits === "6281123456789"
  ) {
    return true;
  }
  return false;
}

export function isDummyTicket(c: { project_code?: string; title?: string; id?: string | number }): boolean {
  const code = (c.project_code || String(c.id || "")).toLowerCase();
  const title = (c.title || "").toLowerCase();
  return (
    code.includes("prj-tax-2026-001") ||
    title.includes("spt tahunan badan pt maju") ||
    title.includes("dummy") ||
    title.includes("mock")
  );
}

function cleanCompany(comp?: string, role?: string): string | undefined {
  if (!comp || isDummyValue(comp)) {
    return role === "admin" ? "Zhou Consulting" : undefined;
  }
  return comp;
}

function cleanPhone(phone?: string): string | undefined {
  if (!phone || isDummyValue(phone)) return undefined;
  return phone;
}

function getInitials(name: string): string {
  if (!name || isDummyValue(name)) return "-";
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
    (rawRole: string, redirectUrl?: string | null, email?: string | null) => {
      const role = normalizeRole(rawRole, email);
      let destination =
        role === "superadmin"
          ? "/dashboard/superadmin"
          : role === "admin"
          ? "/dashboard/admin"
          : "/dashboard/user";

      if (
        redirectUrl &&
        redirectUrl.trim() !== "" &&
        redirectUrl !== "/login" &&
        redirectUrl !== "/register" &&
        redirectUrl !== "/dashboard"
      ) {
        if (role === "superadmin") {
          // Superadmin default adalah /dashboard/superadmin. Cegah terlempar ke /dashboard/user
          destination = redirectUrl.startsWith("/dashboard/user") ? "/dashboard/superadmin" : redirectUrl;
        } else if (role === "admin") {
          // Admin default adalah /dashboard/admin. Cegah terlempar ke /dashboard/superadmin atau /dashboard/user
          destination =
            redirectUrl.startsWith("/dashboard/superadmin") || redirectUrl.startsWith("/dashboard/user")
              ? "/dashboard/admin"
              : redirectUrl;
        } else {
          // Klien biasa tidak boleh mengakses portal admin atau superadmin
          destination =
            redirectUrl.startsWith("/dashboard/admin") || redirectUrl.startsWith("/dashboard/superadmin")
              ? "/dashboard/user"
              : redirectUrl;
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
        const mappedRole = normalizeRole(profile.role, profile.email);
        setUser((prev) => {
          const comp = cleanCompany(profile.company_name, mappedRole) || cleanCompany(prev?.company, mappedRole);
          const ph = cleanPhone(profile.phone) || cleanPhone(prev?.phone);
          const updated: AuthUser = {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role: mappedRole,
            company: comp,
            phone: ph,
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
          parsed.role = normalizeRole(parsed.role, parsed.email);
          if (parsed.company && isDummyValue(parsed.company)) {
            parsed.company = undefined;
          }
          if (parsed.phone && isDummyValue(parsed.phone)) {
            parsed.phone = undefined;
          }
          if (parsed.avatarText && isDummyValue(parsed.avatarText)) {
            parsed.avatarText = "-";
          }
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
      const userEmail = backendUser.email || email;
      const role = normalizeRole(backendUser.role, userEmail);

      const authData: AuthUser = {
        id: backendUser.id,
        name: backendUser.name,
        email: userEmail,
        role,
        company: cleanCompany(backendUser.company_name, role),
        phone: cleanPhone(backendUser.phone),
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

      navigateByRole(role, redirectUrl, userEmail);

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
    role?: "user" | "admin" | "superadmin",
    redirectUrl?: string | null,
    customData?: Partial<AuthUser>
  ) => {
    const resolvedRole = normalizeRole(role, email);
    let name = "-";
    let company: string | undefined = undefined;
    let avatarText = "-";

    if (resolvedRole === "admin") {
      name = "Konsultan Senior Zhou";
      company = "Zhou Consulting";
      avatarText = "KZ";
    } else if (resolvedRole === "superadmin") {
      name = "Super Administrator Zhou";
      company = "Zhou Consulting";
      avatarText = "SZ";
    }

    const resolvedToken =
      customData?.token || getAuthToken() || `demo_token_${resolvedRole}_${Date.now()}`;

    const authData: AuthUser = {
      name: customData?.name || name,
      email: customData?.email || email,
      role: resolvedRole,
      company: customData?.company || company,
      avatarText: customData?.avatarText || avatarText,
      avatarUrl: customData?.avatarUrl,
      provider: customData?.provider || "credentials",
      token: resolvedToken,
    };

    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
    } catch (err) {
      console.error("Gagal menyimpan sesi auth ke localStorage:", err);
    }

    setAuthToken(resolvedToken);
    setTokenState(resolvedToken);
    setUser(authData);
    setIsAuthenticated(true);

    navigateByRole(resolvedRole, redirectUrl, email);
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
