"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { GoogleAuthModal, GoogleAuthAccount } from "@/components/auth/GoogleAuthModal";
import {
  ShieldTaxIcon,
  UserIcon,
  BuildingIcon,
  EnvelopeIcon,
  PhoneIcon,
  LockIcon,
  EyeIcon,
  GoogleColorIcon,
  CheckCircleIcon,
} from "@/components/icons";

function RegisterFormContent() {
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const { login, registerWithApi } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.fullName.trim()) {
      setErrorMessage("Nama lengkap wajib diisi.");
      return;
    }
    if (!formData.companyName.trim()) {
      setErrorMessage("Nama perusahaan atau entitas usaha wajib diisi.");
      return;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrorMessage("Alamat email korporat tidak valid.");
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMessage("Nomor WhatsApp / telepon aktif wajib diisi.");
      return;
    }
    if (!formData.agreeTerms) {
      setErrorMessage("Anda wajib menyetujui Pakta Kerahasiaan (NDA) & UU PDP untuk mendaftar.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Konfirmasi kata sandi tidak cocok dengan kata sandi yang dimasukkan.");
      return;
    }

    if (formData.password.length < 8) {
      setErrorMessage("Kata sandi minimal 8 karakter demi keamanan akun.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await registerWithApi(
        {
          name: formData.fullName,
          company_name: formData.companyName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        },
        redirectParam
      );

      if (!res.success) {
        setErrorMessage(res.message || "Registrasi gagal. Pastikan email belum pernah terdaftar.");
        setIsLoading(false);
      } else {
        setIsSuccess(true);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal menghubungi server live backend.";
      setErrorMessage(message);
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    setIsGoogleModalOpen(true);
  };

  const handleGoogleSuccess = (account: GoogleAuthAccount) => {
    setIsGoogleLoading(true);
    login(account.email, "user", redirectParam, {
      name: account.name,
      company: account.company || "Klien Mandiri",
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
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-xl bg-white rounded-2xl border border-primary-light shadow-xl p-6 sm:p-8 space-y-6">
          {/* Header text */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-light text-primary text-[11px] font-semibold">
              <ShieldTaxIcon className="text-xs" />
              <span>Registrasi Klien Terproteksi</span>
            </div>
            <h1 className="text-2xl sm:text-[26px] font-bold text-primary tracking-tight">
              Daftar Akun Layanan
            </h1>
            <p className="text-xs text-text-secondary leading-relaxed max-w-md mx-auto">
              Lengkapi informasi entitas bisnis Anda untuk mengakses konsultasi, kepatuhan perpajakan, dan lembar kerja.
            </p>
          </div>

          {/* Alert Notice jika dialihkan otomatis */}
          {redirectParam && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2.5 animate-in fade-in">
              <ShieldTaxIcon className="text-amber-700 text-sm mt-0.5 shrink-0" />
              <div>
                <span className="font-bold block">Autentikasi Diperlukan</span>
                <span className="text-[11px] text-amber-800 leading-tight block mt-0.5">
                  Silakan daftarkan akun baru Anda terlebih dahulu. Sistem akan otomatis mengarahkan Anda ke halaman yang Anda tuju setelah pendaftaran.
                </span>
              </div>
            </div>
          )}

          {/* Success State */}
          {isSuccess ? (
            <div className="space-y-6 text-center py-6 animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-success/10 text-success mx-auto flex items-center justify-center text-3xl">
                <CheckCircleIcon />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-primary">
                  Pendaftaran Akun Berhasil!
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed max-w-sm mx-auto">
                  Akun atas nama <strong className="text-primary font-semibold">{formData.fullName}</strong> ({formData.companyName}) telah aktif dan siap digunakan.
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2.5 max-w-xs mx-auto">
                <Button
                  variant="primary"
                  size="lg"
                  asChild
                  className="w-full font-semibold text-xs justify-center shadow-md h-11"
                >
                  <Link href={redirectParam || "/dashboard/user"}>
                    <span>{redirectParam ? "Lanjutkan ke Halaman Pilihan Anda" : "Buka Dashboard Saya"}</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="w-full font-semibold text-xs border-primary-light text-text-secondary hover:text-primary hover:bg-surface cursor-pointer h-10"
                >
                  <Link href="/">Kembali ke Beranda</Link>
                </Button>
              </div>
            </div>
          ) : (
            /* Registration Form */
            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-error text-xs font-semibold animate-in fade-in">
                  {errorMessage}
                </div>
              )}

              {/* Group 1: Profil Entitas & PIC */}
              <div className="space-y-3">
                <div className="pb-1 border-b border-primary-light/50">
                  <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                    Informasi Kontak &amp; Perusahaan
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-name" className="font-semibold text-primary">
                      Nama Lengkap *
                    </Label>
                    <div className="relative">
                      <Input
                        id="reg-name"
                        name="fullName"
                        type="text"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Nama Lengkap"
                        required
                        className="pl-9 h-10 bg-surface border-primary-light focus:bg-white text-xs"
                      />
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-silver text-xs pointer-events-none" />
                    </div>
                  </div>

                  {/* Company Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-company" className="font-semibold text-primary">
                      Nama Entitas / PT / CV *
                    </Label>
                    <div className="relative">
                      <Input
                        id="reg-company"
                        name="companyName"
                        type="text"
                        value={formData.companyName}
                        onChange={handleChange}
                        placeholder="Nama Perusahaan"
                        required
                        className="pl-9 h-10 bg-surface border-primary-light focus:bg-white text-xs"
                      />
                      <BuildingIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-silver text-xs pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Email */}
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-email" className="font-semibold text-primary">
                      Email Korporat *
                    </Label>
                    <div className="relative">
                      <Input
                        id="reg-email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="nama@perusahaan.com"
                        required
                        className="pl-9 h-10 bg-surface border-primary-light focus:bg-white text-xs"
                      />
                      <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-silver text-xs pointer-events-none" />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-phone" className="font-semibold text-primary">
                      Nomor WhatsApp *
                    </Label>
                    <div className="relative">
                      <Input
                        id="reg-phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="0812-XXXX-XXXX"
                        required
                        className="pl-9 h-10 bg-surface border-primary-light focus:bg-white text-xs"
                      />
                      <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-silver text-xs pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Group 2: Keamanan Akun */}
              <div className="space-y-3 pt-1">
                <div className="pb-1 border-b border-primary-light/50">
                  <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                    Keamanan Akun
                  </span>
                </div>

                {/* Passwords */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-password" className="font-semibold text-primary">
                      Kata Sandi *
                    </Label>
                    <div className="relative">
                      <Input
                        id="reg-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Min. 8 karakter"
                        required
                        className="pl-9 pr-9 h-10 bg-surface border-primary-light focus:bg-white text-xs"
                      />
                      <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-silver text-xs pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-silver hover:text-text-secondary p-0.5 cursor-pointer"
                        aria-label="Toggle password visibility"
                      >
                        <EyeIcon className="text-xs" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="reg-confirm" className="font-semibold text-primary">
                      Konfirmasi Kata Sandi *
                    </Label>
                    <div className="relative">
                      <Input
                        id="reg-confirm"
                        name="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Ulangi kata sandi"
                        required
                        className="pl-9 h-10 bg-surface border-primary-light focus:bg-white text-xs"
                      />
                      <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-silver text-xs pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Agreement Checkbox */}
              <div className="flex items-start gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="reg-agree"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="rounded border-primary-light text-primary focus:ring-primary w-4 h-4 mt-0.5 cursor-pointer accent-primary"
                  required
                />
                <label
                  htmlFor="reg-agree"
                  className="text-[11px] text-text-secondary leading-relaxed cursor-pointer select-none"
                >
                  Saya menyetujui <span className="font-semibold text-primary">Ketentuan Layanan</span> &amp;{" "}
                  <span className="font-semibold text-primary">Kebijakan Kerahasiaan (NDA)</span> Zhou Consulting.
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isLoading}
                className="w-full font-semibold text-xs tracking-wide py-2.5 shadow-md h-11 cursor-pointer active:scale-[0.99]"
              >
                {isLoading ? (
                  <span>Memproses pendaftaran akun...</span>
                ) : (
                  <span>Daftarkan Akun Sekarang</span>
                )}
              </Button>

              {/* Divider */}
              <div className="flex items-center gap-3 pt-1">
                <div className="flex-1 border-t border-primary-light" />
                <span className="shrink-0 text-[11px] text-text-secondary font-medium uppercase tracking-wider">
                  atau
                </span>
                <div className="flex-1 border-t border-primary-light" />
              </div>

              {/* Google OAuth Option */}
              <button
                type="button"
                onClick={handleGoogleSignup}
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
                    <span>Daftar dengan Google</span>
                  </>
                )}
              </button>

              {/* Google Authentication Account Picker Modal */}
              <GoogleAuthModal
                isOpen={isGoogleModalOpen}
                onClose={() => setIsGoogleModalOpen(false)}
                onSuccess={handleGoogleSuccess}
                targetRole="user"
              />

              {/* Footer Links */}
              <div className="pt-2 text-center text-[11px] text-text-secondary space-y-2 border-t border-primary-light/60">
                <div className="flex items-center justify-center gap-1.5 text-success">
                  <CheckCircleIcon className="text-xs" />
                  <span>Koneksi SSL 256-bit berstandar kerahasiaan klien (NDA)</span>
                </div>
                <p>
                  Sudah memiliki akun layanan?{" "}
                  <Link
                    href={redirectParam ? `/login?redirect=${encodeURIComponent(redirectParam)}` : "/login"}
                    className="font-semibold text-primary hover:underline"
                  >
                    Masuk ke Akun
                  </Link>
                </p>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="py-4 text-center text-xs text-text-secondary border-t border-primary-light bg-white">
        &copy; {new Date().getFullYear()} Zhou Consulting.
      </footer>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface flex items-center justify-center text-xs text-text-muted">
          Memuat halaman registrasi...
        </div>
      }
    >
      <RegisterFormContent />
    </Suspense>
  );
}
