"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ShieldTaxIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  QuestionCircleIcon,
  PhoneIcon,
  SendIcon,
} from "@/components/icons";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim()) {
      setErrorMessage("Alamat email atau ID pengguna wajib diisi.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage("Format alamat email tidak valid.");
      return;
    }

    setIsLoading(true);

    // Simulate verification dispatch
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 600);
  };

  const handleResend = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
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
            href="/login"
            className="text-xs font-semibold text-silver hover:text-white transition-colors"
          >
            &larr; Kembali ke Halaman Masuk
          </Link>
        </div>
      </header>

      {/* Main Form Center */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <div className="w-full max-w-md bg-white rounded-xl border border-primary-light shadow-xl p-6 sm:p-8 space-y-6">
          {/* Header Badge & Title */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-light text-primary text-[11px] font-semibold">
              <ShieldTaxIcon className="text-xs" />
              <span>Pemulihan Kredensial Resmi</span>
            </div>
            <h1 className="text-2xl font-bold text-primary tracking-tight">
              Lupa Kata Sandi?
            </h1>
            <p className="text-xs text-text-secondary leading-relaxed">
              Masukkan alamat email korporat terdaftar Anda. Kami akan mengirimkan tautan verifikasi aman untuk mereset kata sandi akun Anda.
            </p>
          </div>

          {!isSubmitted ? (
            /* Reset Request Form */
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="reset-email">Alamat Email / ID Klien Terdaftar</Label>
                <div className="relative">
                  <Input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMessage) setErrorMessage("");
                    }}
                    placeholder="nama@perusahaan.com"
                    required
                    className={`pl-9 ${errorMessage ? "border-error focus:ring-error" : ""}`}
                  />
                  <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-silver text-xs pointer-events-none" />
                </div>
                {errorMessage && (
                  <p className="text-[11px] text-error mt-1">{errorMessage}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isLoading}
                className="w-full font-semibold text-xs tracking-wide"
              >
                {isLoading ? (
                  <span>Mengirimkan tautan...</span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <span>Kirim Tautan Verifikasi</span>
                    <SendIcon className="text-[10px]" />
                  </span>
                )}
              </Button>
            </form>
          ) : (
            /* Success State Feedback */
            <div className="space-y-4 text-xs animate-in fade-in duration-200">
              <div className="p-4 rounded-lg bg-success/10 border border-success/30 text-text space-y-2">
                <div className="flex items-center gap-2 text-success font-semibold text-sm">
                  <CheckCircleIcon className="text-base flex-shrink-0" />
                  <span>Tautan Verifikasi Terkirim</span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Instruksi pemulihan kata sandi telah dikirimkan ke{" "}
                  <strong className="text-primary font-semibold">{email}</strong>.
                  Silakan periksa kotak masuk atau folder spam Anda dalam 5 menit.
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-text-secondary">Tidak menerima email?</span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isLoading}
                  className="font-semibold text-primary hover:underline transition-colors disabled:opacity-50"
                >
                  {isLoading ? "Mengirim ulang..." : "Kirim ulang instruksi"}
                </button>
              </div>
            </div>
          )}

          {/* Administrator Support Info Card */}
          <div className="p-3.5 rounded-lg bg-surface border border-primary-light space-y-2">
            <div className="flex items-center gap-1.5 text-primary font-semibold text-xs">
              <QuestionCircleIcon className="text-silver text-xs" />
              <span>Butuh Bantuan Akses Langsung?</span>
            </div>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              Bagi klien korporat dengan kendala otentikasi akun atau pergantian penanggung jawab (PIC) fiskal, silakan hubungi kantor Zhou Consulting.
            </p>
            <div className="flex items-center gap-4 text-[11px] text-primary font-semibold pt-1 border-t border-primary-light/60">
              <div className="flex items-center gap-1.5">
                <PhoneIcon className="text-silver text-[10px]" />
                <span>(021) 2988-8888</span>
              </div>
              <div className="flex items-center gap-1.5">
                <EnvelopeIcon className="text-silver text-[10px]" />
                <span>admin@zhouconsulting.id</span>
              </div>
            </div>
          </div>

          {/* Navigation link back to Login */}
          <div className="text-center pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline transition-colors"
            >
              <span>&larr; Kembali ke Halaman Masuk</span>
            </Link>
          </div>

          {/* Security notice */}
          <div className="pt-2 text-center text-[11px] text-text-secondary border-t border-primary-light">
            <div className="flex items-center justify-center gap-1.5 text-success">
              <CheckCircleIcon className="text-[10px]" />
              <span>Koneksi SSL 256-bit terenkripsi berstandar kerahasiaan klien (NDA)</span>
            </div>
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
