"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  LockIcon,
  EyeIcon,
  ShieldTaxIcon,
  CheckCircleIcon,
} from "@/components/icons";
import { authApi } from "@/lib/api";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!token) {
      setErrorMessage("Token verifikasi tidak valid atau tidak ditemukan pada link URL.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage("Kata sandi baru minimal harus 8 karakter demi keamanan akun.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Konfirmasi kata sandi tidak cocok dengan kata sandi baru.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await authApi.resetPassword({
        token,
        new_password: newPassword,
      });

      if (res.success) {
        setIsSuccess(true);
      } else {
        setErrorMessage(
          res.message || "Gagal mengatur ulang kata sandi. Token mungkin sudah kedaluwarsa."
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal terhubung ke server.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-between selection:bg-primary selection:text-white">
      {/* Header Bar */}
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

          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/15 hover:border-white/30 text-silver hover:text-white transition-all text-xs font-semibold"
          >
            <span>Masuk Akun</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <div className="w-full max-w-md bg-white rounded-2xl border border-primary-light shadow-xl p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-light text-primary text-[11px] font-semibold">
              <ShieldTaxIcon className="text-xs" />
              <span>Reset Kredensial Pengguna</span>
            </div>
            <h1 className="text-2xl font-bold text-primary tracking-tight">
              Atur Ulang Kata Sandi
            </h1>
            <p className="text-xs text-text-secondary leading-relaxed">
              Buat kata sandi baru yang aman untuk melindungi akun dan dokumen perpajakan Anda.
            </p>
          </div>

          {!token && !isSuccess && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-1">
              <span className="font-bold block">Token Tidak Ditemukan</span>
              <span className="text-[11px] text-amber-800 block">
                Link verifikasi reset kata sandi tidak lengkap atau token kedaluwarsa. Silakan minta tautan baru melalui halaman{" "}
                <Link href="/login/forgot-password" className="underline font-semibold">
                  Lupa Kata Sandi
                </Link>
                .
              </span>
            </div>
          )}

          {isSuccess ? (
            <div className="space-y-6 text-center py-4 animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-success/10 text-success mx-auto flex items-center justify-center text-3xl">
                <CheckCircleIcon />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-primary">Kata Sandi Berhasil Diperbarui!</h3>
                <p className="text-xs text-text-secondary leading-relaxed max-w-sm mx-auto">
                  Kata sandi baru Anda telah aktif. Silakan masuk kembali menggunakan kredensial baru Anda.
                </p>
              </div>

              <Button
                variant="primary"
                size="lg"
                asChild
                className="w-full font-semibold text-xs justify-center shadow-md h-11"
              >
                <Link href="/login">
                  <span>Masuk ke Akun Sekarang</span>
                </Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in">
                  <span className="font-bold text-sm leading-none mt-0.5">⚠️</span>
                  <div>
                    <span className="font-bold block">Gagal Memperbarui</span>
                    <span className="text-[11px] leading-tight block mt-0.5">{errorMessage}</span>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="new-password">Kata Sandi Baru</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 8 karakter"
                    required
                    className="pl-9 pr-9 h-10 bg-surface border-primary-light focus:bg-white text-xs"
                  />
                  <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-silver text-xs pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-silver hover:text-text-secondary p-0.5"
                  >
                    <EyeIcon className="text-xs" />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirm-password">Konfirmasi Kata Sandi Baru</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi baru"
                    required
                    className="pl-9 pr-9 h-10 bg-surface border-primary-light focus:bg-white text-xs"
                  />
                  <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-silver text-xs pointer-events-none" />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isLoading || !token}
                className="w-full font-semibold text-xs tracking-wide py-2.5 shadow-md h-11"
              >
                {isLoading ? "Menyimpan kata sandi..." : "Perbarui Kata Sandi"}
              </Button>
            </form>
          )}

          <div className="text-center pt-2 border-t border-primary-light/50">
            <Link
              href="/login"
              className="text-xs text-text-secondary hover:text-primary transition-colors"
            >
              ← Kembali ke Halaman Masuk
            </Link>
          </div>
        </div>
      </main>

      <footer className="w-full py-4 text-center text-xs text-text-secondary border-t border-primary-light/50">
        © {new Date().getFullYear()} Zhou Consulting. Hak Cipta Dilindungi Undang-Undang.
      </footer>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-surface">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
