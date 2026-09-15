"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  LockIcon,
  EnvelopeIcon,
  GoogleIcon,
  ArrowRightIcon,
  ShieldTaxIcon,
  CheckCircleIcon,
  EyeIcon,
} from "@/components/icons";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [selectedRole, setSelectedRole] = useState<"user" | "admin" | "superadmin">("user");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate authentication delay
    setTimeout(() => {
      setIsLoading(false);
      if (selectedRole === "superadmin") {
        router.push("/dashboard/superadmin");
      } else if (selectedRole === "admin") {
        router.push("/dashboard/admin");
      } else {
        router.push("/dashboard/user");
      }
    }, 600);
  };

  const handleQuickLogin = (role: "user" | "admin" | "superadmin") => {
    setSelectedRole(role);
    if (role === "user") {
      setEmail("klien@korporat.com");
      setPassword("klienpassword");
    } else if (role === "admin") {
      setEmail("staff.admin@zhouconsulting.id");
      setPassword("adminpassword");
    } else {
      setEmail("superadmin@zhouconsulting.id");
      setPassword("superadminpassword");
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-between selection:bg-primary selection:text-white">
      {/* Top Header */}
      <header className="w-full bg-primary text-white py-4 px-6 border-b border-white/10 shadow-sm">
        <div className="container-custom flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-primary font-bold text-lg">
              Z
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-white group-hover:text-primary-light transition-colors">
                ZHOU CONSULTING
              </span>
              <span className="text-[10px] text-silver uppercase tracking-wider font-medium">
                Finance &bull; Accounting &bull; Tax Partner
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="text-xs font-semibold text-silver hover:text-white transition-colors"
          >
            &larr; Kembali ke Beranda
          </Link>
        </div>
      </header>

      {/* Main Form Center */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <div className="w-full max-w-md bg-white rounded-xl border border-primary-light shadow-xl p-6 sm:p-8 space-y-6">
          {/* Header text */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-light text-primary text-[11px] font-semibold">
              <ShieldTaxIcon className="text-xs" />
              <span>Portal Akses Resmi &amp; Terenkripsi</span>
            </div>
            <h1 className="text-2xl font-bold text-primary tracking-tight">
              Masuk ke Portal Layanan
            </h1>
            <p className="text-xs text-text-secondary leading-relaxed">
              Gunakan kredensial resmi Anda untuk mengakses monitoring tiket, laporan perpajakan, atau lembar kerja.
            </p>
          </div>

          {/* Quick RBAC Role Switcher (Demo / Evaluator Mode) */}
          <div className="p-3.5 rounded-lg bg-surface border border-primary-light space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                Pilih Peran Akses (RBAC Flow):
              </span>
              <Badge variant="silver" className="text-[10px]">
                {selectedRole === "user" ? "Klien" : selectedRole === "admin" ? "Admin" : "Superadmin"}
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin("user")}
                className={`py-1.5 px-2 rounded font-semibold transition-colors ${
                  selectedRole === "user"
                    ? "bg-primary text-white"
                    : "bg-white border border-primary-light text-text-secondary hover:text-primary"
                }`}
              >
                Klien
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("admin")}
                className={`py-1.5 px-2 rounded font-semibold transition-colors ${
                  selectedRole === "admin"
                    ? "bg-primary text-white"
                    : "bg-white border border-primary-light text-text-secondary hover:text-primary"
                }`}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("superadmin")}
                className={`py-1.5 px-2 rounded font-semibold transition-colors ${
                  selectedRole === "superadmin"
                    ? "bg-primary text-white"
                    : "bg-white border border-primary-light text-text-secondary hover:text-primary"
                }`}
              >
                Superadmin
              </button>
            </div>
          </div>

          {/* Authentication Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <Label htmlFor="auth-email">Alamat Email / ID Pengguna</Label>
              <div className="relative">
                <Input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@perusahaan.com"
                  required
                  className="pl-9"
                />
                <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-silver text-xs pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="auth-password">Kata Sandi</Label>
                <button
                  type="button"
                  onClick={() => alert("Silakan hubungi administrator kantor Zhou Consulting untuk reset password resmi.")}
                  className="text-[11px] text-text-secondary hover:text-primary transition-colors"
                >
                  Lupa kata sandi?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="pl-9 pr-9"
                />
                <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-silver text-xs pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-silver hover:text-text-secondary p-0.5 focus:outline-none"
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
              className="w-full font-semibold text-xs tracking-wide"
            >
              {isLoading ? (
                <span>Memverifikasi kredensial...</span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <span>Masuk ke Portal</span>
                  <ArrowRightIcon className="text-[10px]" />
                </span>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-primary-light w-full" />
            <span className="bg-white px-3 text-[11px] text-text-secondary font-medium uppercase tracking-wider relative">
              atau
            </span>
          </div>

          {/* Google OAuth Simulation Button */}
          <button
            type="button"
            onClick={() => {
              setIsLoading(true);
              setTimeout(() => {
                setIsLoading(false);
                router.push(
                  selectedRole === "superadmin"
                    ? "/dashboard/superadmin"
                    : selectedRole === "admin"
                    ? "/dashboard/admin"
                    : "/dashboard/user"
                );
              }, 500);
            }}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-md border border-primary-light hover:bg-surface text-xs font-semibold text-text transition-colors shadow-sm"
          >
            <GoogleIcon className="text-sm text-[#4285F4]" />
            <span>Masuk dengan Akun Google</span>
          </button>

          {/* Footer disclaimer */}
          <div className="pt-2 text-center text-[11px] text-text-secondary space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-success">
              <CheckCircleIcon className="text-[10px]" />
              <span>Koneksi SSL 256-bit berstandar kerahasiaan klien (NDA)</span>
            </div>
            <p>
              Belum memiliki akses klien? Silakan ajukan melalui{" "}
              <Link href="/#kontak" className="font-semibold text-primary hover:underline">
                Formulir Konsultasi
              </Link>
              .
            </p>
          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="py-4 text-center text-xs text-text-secondary border-t border-primary-light bg-white">
        &copy; {new Date().getFullYear()} Zhou Consulting. Finance, Accounting &amp; Tax Partner.
      </footer>
    </div>
  );
}
