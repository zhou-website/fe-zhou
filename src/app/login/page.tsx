"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { GoogleAuthModal, GoogleAuthAccount } from "@/components/auth/GoogleAuthModal";
import {
  LockIcon,
  EnvelopeIcon,
  GoogleColorIcon,
  ShieldTaxIcon,
  CheckCircleIcon,
  EyeIcon,
} from "@/components/icons";

function LoginFormContent() {
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const { login, loginWithApi } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [selectedRole, setSelectedRole] = useState<"user" | "admin" | "superadmin">("user");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const res = await loginWithApi(
        email || "klien@perusahaan.com",
        password || "Client123!",
        redirectParam
      );

      if (!res.success) {
        setErrorMessage(res.message || "Email atau kata sandi tidak valid. Silakan coba kembali.");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal menghubungi server live backend.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (role: "user" | "admin" | "superadmin") => {
    setSelectedRole(role);
    setErrorMessage("");
    if (role === "user") {
      setEmail("klien@perusahaan.com");
      setPassword("Client123!");
    } else if (role === "admin") {
      setEmail("admin@zhouconsulting.com");
      setPassword("Admin123!");
    } else {
      setEmail("superadmin@zhouconsulting.com");
      setPassword("SuperAdmin123!");
    }
  };

  const handleGoogleLogin = () => {
    setIsGoogleModalOpen(true);
  };

  const handleGoogleSuccess = (account: GoogleAuthAccount) => {
    setIsGoogleLoading(true);
    login(account.email, account.role || selectedRole, redirectParam, {
      name: account.name,
      company: account.company,
      avatarText: account.avatarText,
      avatarUrl: account.avatarUrl,
      provider: "google",
    });
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-between selection:bg-primary selection:text-white">
      {/* Top Header Navigation Bar */}
      <header className="w-full bg-primary text-white py-4 px-6 border-b border-white/10 shadow-sm">
        <div className="container-custom flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-primary font-bold text-lg shadow-sm">
              Z
            </div>
            <span className="text-base font-bold tracking-tight text-white group-hover:text-primary-light transition-colors">
              ZHOU CONSULTING
            </span>
          </Link>

          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/15 hover:border-white/30 text-silver hover:text-white transition-all text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 cursor-pointer active:scale-[0.98]"
              title="Kembali ke Beranda"
            >
              <span>Kembali ke Beranda</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <div className="w-full max-w-lg bg-white rounded-2xl border border-primary-light shadow-xl p-6 sm:p-8 space-y-6">
          {/* Header text */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-light text-primary text-[11px] font-semibold">
              <ShieldTaxIcon className="text-xs" />
              <span>Sistem Akses Terenkripsi</span>
            </div>
            <h1 className="text-2xl sm:text-[26px] font-bold text-primary tracking-tight">
              Masuk ke Akun Layanan
            </h1>
            <p className="text-xs text-text-secondary leading-relaxed max-w-md mx-auto">
              Gunakan kredensial akun Anda untuk mengakses monitoring tiket, laporan perpajakan, atau lembar kerja.
            </p>
          </div>

          {/* Alert Notice jika dialihkan otomatis dari landing page */}
          {redirectParam && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2.5 animate-in fade-in">
              <ShieldTaxIcon className="text-amber-700 text-sm mt-0.5 shrink-0" />
              <div>
                <span className="font-bold block">Autentikasi Diperlukan</span>
                <span className="text-[11px] text-amber-800 leading-tight block mt-0.5">
                  Silakan masuk ke akun Anda terlebih dahulu. Sistem akan otomatis mengarahkan Anda ke halaman yang Anda tuju setelah berhasil masuk.
                </span>
              </div>
            </div>
          )}


          {/* Quick RBAC Role Switcher (Akses Cepat Demo) */}
          <div className="p-3.5 rounded-xl bg-surface border border-primary-light space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                Akses Instan Peran (Demo RBAC):
              </span>
              <Badge variant="silver" className="text-[10px]">
                {selectedRole === "user" ? "Klien" : selectedRole === "admin" ? "Staff Admin" : "Superadmin"}
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin("user")}
                className={`py-2 px-2.5 rounded-lg font-semibold transition-all cursor-pointer active:scale-[0.98] ${
                  selectedRole === "user"
                    ? "bg-primary text-white shadow-xs"
                    : "bg-white border border-primary-light text-text-secondary hover:text-primary hover:bg-surface"
                }`}
              >
                Klien
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("admin")}
                className={`py-2 px-2.5 rounded-lg font-semibold transition-all cursor-pointer active:scale-[0.98] ${
                  selectedRole === "admin"
                    ? "bg-primary text-white shadow-xs"
                    : "bg-white border border-primary-light text-text-secondary hover:text-primary hover:bg-surface"
                }`}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("superadmin")}
                className={`py-2 px-2.5 rounded-lg font-semibold transition-all cursor-pointer active:scale-[0.98] ${
                  selectedRole === "superadmin"
                    ? "bg-primary text-white shadow-xs"
                    : "bg-white border border-primary-light text-text-secondary hover:text-primary hover:bg-surface"
                }`}
              >
                Superadmin
              </button>
            </div>
          </div>

          {/* Error Notice jika autentikasi backend gagal */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in">
              <span className="font-bold text-sm leading-none mt-0.5">⚠️</span>
              <div>
                <span className="font-bold block">Gagal Masuk</span>
                <span className="text-[11px] leading-tight block mt-0.5">{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Authentication Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <Label htmlFor="auth-email" className="font-semibold text-primary">
                Alamat Email Korporat / ID Pengguna
              </Label>
              <div className="relative">
                <Input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@perusahaan.com"
                  required
                  className="pl-9 h-10 bg-surface border-primary-light focus:bg-white text-xs"
                />
                <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-silver text-xs pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="auth-password" className="font-semibold text-primary">
                  Kata Sandi
                </Label>
                <Link
                  href="/login/forgot-password"
                  className="text-[11px] text-text-secondary hover:text-primary transition-colors"
                >
                  Lupa kata sandi?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="pl-9 pr-9 h-10 bg-surface border-primary-light focus:bg-white text-xs"
                />
                <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-silver text-xs pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-silver hover:text-text-secondary p-0.5 focus:outline-none cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  <EyeIcon className="text-xs" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="remember-me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-primary-light text-primary focus:ring-primary w-4 h-4 cursor-pointer"
              />
              <label htmlFor="remember-me" className="text-xs text-text-secondary cursor-pointer select-none">
                Ingat sesi saya di perangkat ini
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading}
              className="w-full font-semibold text-xs tracking-wide py-2.5 shadow-md h-11"
            >
              {isLoading ? (
                <span>Memverifikasi kredensial...</span>
              ) : (
                <span>Masuk</span>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 pt-1">
            <div className="flex-1 border-t border-primary-light" />
            <span className="shrink-0 text-[11px] text-text-secondary font-medium uppercase tracking-wider">
              atau
            </span>
            <div className="flex-1 border-t border-primary-light" />
          </div>

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading || isGoogleLoading}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-primary-light hover:bg-surface text-xs font-semibold text-text transition-all shadow-xs cursor-pointer active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
          >
            {isGoogleLoading ? (
              <span className="flex items-center gap-2">
                <span className="inline-block animate-spin rounded-full h-3.5 w-3.5 border-2 border-primary border-t-transparent" />
                <span>Menghubungkan akun Google...</span>
              </span>
            ) : (
              <>
                <GoogleColorIcon className="w-4 h-4" />
                <span>Masuk dengan Google</span>
              </>
            )}
          </button>

          {/* Google Authentication Account Picker Modal */}
          <GoogleAuthModal
            isOpen={isGoogleModalOpen}
            onClose={() => setIsGoogleModalOpen(false)}
            onSuccess={handleGoogleSuccess}
            targetRole={selectedRole}
          />

          {/* Footer disclaimer */}
          <div className="pt-2 text-center text-[11px] text-text-secondary space-y-2 border-t border-primary-light/60">
            <div className="flex items-center justify-center gap-1.5 text-success">
              <CheckCircleIcon className="text-xs" />
              <span>Koneksi SSL 256-bit berstandar kerahasiaan klien (NDA)</span>
            </div>
            <p>
              Belum memiliki akun layanan?{" "}
              <Link
                href={redirectParam ? `/register?redirect=${encodeURIComponent(redirectParam)}` : "/register"}
                className="font-semibold text-primary hover:underline"
              >
                Daftar Akun Baru
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="py-4 text-center text-xs text-text-secondary border-t border-primary-light bg-white">
        &copy; {new Date().getFullYear()} Zhou Consulting.
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface flex items-center justify-center text-xs text-text-muted">
          Memuat halaman masuk...
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
