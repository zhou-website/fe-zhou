"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  CheckCircleIcon,
  CheckIcon,
  ShieldTaxIcon,
  CloseIcon,
  UserIcon,
  LockIcon,
  BuildingIcon,
  ClockIcon,
  EyeIcon,
} from "@/components/icons";

interface SessionLog {
  id: string;
  device: string;
  browser: string;
  ip: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

const INITIAL_SESSIONS: SessionLog[] = [
  {
    id: "sess-01",
    device: "Windows 11 PC",
    browser: "Google Chrome 128.0",
    ip: "182.253.12.88",
    location: "Jakarta Selatan, Indonesia",
    lastActive: "Sesi Ini (Aktif Sekarang)",
    isCurrent: true,
  },
  {
    id: "sess-02",
    device: "MacBook Pro 14 (macOS Sonoma)",
    browser: "Apple Safari 17.5",
    ip: "36.85.22.14",
    location: "Jakarta Pusat, Indonesia",
    lastActive: "15 Sep 2026, 14:20 WIB",
    isCurrent: false,
  },
  {
    id: "sess-03",
    device: "iPhone 15 Pro (iOS 18)",
    browser: "Mobile Safari",
    ip: "114.125.45.19",
    location: "Tangerang Selatan, Indonesia",
    lastActive: "12 Sep 2026, 09:15 WIB",
    isCurrent: false,
  },
];

export default function ClientProfileSecurityPage() {
  const [activeTab, setActiveTab] = useState<"info" | "security" | "sessions">("info");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // PIC Form State
  const [picForm, setPicForm] = useState({
    companyName: "PT Maju Makmur Sentosa",
    npwp16: "01.234.567.8-012.000",
    picName: "Budi Santoso, S.E.",
    picTitle: "Finance & Tax Manager",
    picEmail: "budi.santoso@majumakmur.co.id",
    picPhone: "+62 811-2345-6789",
    officeAddress: "Jl. TB Simatupang No. 88, Cilandak Barat, Jakarta Selatan 12430",
    klu: "62019 - Aktivitas Pemrograman Komputer Lainnya",
  });

  const [isSavingPic, setIsSavingPic] = useState(false);

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [isUpdatingPw, setIsUpdatingPw] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  // Sessions State
  const [sessions, setSessions] = useState<SessionLog[]>(INITIAL_SESSIONS);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, text: "Belum diisi", color: "text-text-muted", bar: "w-0 bg-silver" };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 1) return { score, text: "Lemah (Gunakan min 8 karakter & kombinasi)", color: "text-error", bar: "w-1/4 bg-error" };
    if (score === 2) return { score, text: "Cukup (Tambahkan angka dan simbol)", color: "text-silver", bar: "w-2/4 bg-silver" };
    if (score === 3) return { score, text: "Kuat (Kombinasi baik)", color: "text-primary", bar: "w-3/4 bg-primary" };
    return { score, text: "Sangat Kuat (Aman terenkripsi)", color: "text-success", bar: "w-full bg-success" };
  };

  const handleSavePic = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPic(true);
    setTimeout(() => {
      setIsSavingPic(false);
      showToast("Data kontak PIC dan alamat operasional berhasil diperbarui.");
    }, 700);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.currentPassword) {
      showToast("Masukkan kata sandi saat ini untuk verifikasi.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast("Kata sandi baru dan konfirmasi kata sandi tidak cocok.");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      showToast("Kata sandi baru minimal harus 8 karakter.");
      return;
    }

    setIsUpdatingPw(true);
    setTimeout(() => {
      setIsUpdatingPw(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      showToast("Kata sandi akun Anda berhasil diperbarui dengan aman.");
    }, 800);
  };

  const handleTerminateOtherSessions = () => {
    setSessions((prev) => prev.filter((s) => s.isCurrent));
    showToast("Berhasil keluar dari seluruh sesi perangkat lain.");
  };

  const strength = getPasswordStrength(passwordForm.newPassword);

  return (
    <div className="space-y-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary text-white text-xs font-semibold py-3 px-5 rounded-xl shadow-2xl border border-white/20 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircleIcon className="text-success text-base" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-silver hover:text-white ml-2"
          >
            <CloseIcon className="text-xs" />
          </button>
        </div>
      )}

      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-primary-light">
        <div>
          <div className="flex items-center gap-2 text-xs text-text-muted mb-1.5">
            <Link href="/dashboard/user" className="hover:text-primary transition-colors">
              Dashboard Saya
            </Link>
            <span>/</span>
            <span className="text-primary font-bold">Pengaturan Profil</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
            Pengaturan Profil &amp; Keamanan Akun
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-2xl">
            Kelola data legalitas entitas perusahaan, kontak Person in Charge (PIC), kredensial kata sandi, dan pemantauan sesi aktif.
          </p>
        </div>


      </div>

      {/* MAIN 2-COLUMN SPLIT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Entity Card & Legal Verification */}
        <div className="lg:col-span-4 space-y-6">
          {/* Corporate Entity Identification Card */}
          <Card className="rounded-2xl border-primary-light bg-white shadow-sm overflow-hidden">
            <div className="h-20 bg-primary relative flex items-end px-5">
              <div className="w-16 h-16 rounded-2xl bg-white border-2 border-primary-light shadow-md flex items-center justify-center font-bold text-primary text-xl absolute -bottom-8">
                MMS
              </div>
            </div>

            <CardContent className="pt-11 p-5 space-y-4">
              <div>
                <h3 className="text-base font-bold text-primary">
                  {picForm.companyName}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-xs text-text-muted font-semibold">
                    ID: CL-88219
                  </span>
                  <span>&bull;</span>
                  <Badge variant="success" size="sm">
                    Klien Aktif
                  </Badge>
                </div>
              </div>

              <div className="p-3 bg-surface rounded-xl border border-primary-light space-y-2 text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-text-muted">NPWP 16 Digit:</span>
                  <span className="font-mono font-bold text-primary">{picForm.npwp16}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-text-muted">Bentuk Badan:</span>
                  <span className="font-semibold text-primary">Perseroan Terbatas (PT)</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-text-muted">Tanggal Bergabung:</span>
                  <span className="font-medium text-text-primary">12 Januari 2025</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider block">
                  Klasifikasi Usaha (KLU):
                </span>
                <p className="text-text-secondary leading-relaxed bg-surface/80 p-2.5 rounded-lg border border-primary-light text-[11px]">
                  {picForm.klu}
                </p>
              </div>

              <div className="space-y-1.5 text-xs">
                <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider block">
                  Alamat Terdaftar KPP:
                </span>
                <p className="text-text-secondary leading-relaxed bg-surface/80 p-2.5 rounded-lg border border-primary-light text-[11px]">
                  {picForm.officeAddress}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Security & Compliance Trust Card */}
          <Card className="rounded-2xl border-primary-light bg-surface p-5 space-y-3.5 text-xs">
            <div className="flex items-center gap-2.5 text-primary font-bold">
              <ShieldTaxIcon className="text-base" />
              <span>Status Proteksi &amp; Kerahasiaan</span>
            </div>

            <ul className="space-y-2.5 text-[11px] text-text-secondary">
              <li className="flex items-start gap-2">
                <CheckCircleIcon className="text-success text-xs mt-0.5 shrink-0" />
                <span>
                  <strong className="text-primary">Enkripsi 256-Bit SSL/TLS:</strong> Kredensial akun dan berkas pajak terlindungi secara end-to-end.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircleIcon className="text-success text-xs mt-0.5 shrink-0" />
                <span>
                  <strong className="text-primary">Pakta Kerahasiaan NDA:</strong> Terikat perjanjian kerahasiaan master tanggal 01 Jan 2026.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircleIcon className="text-success text-xs mt-0.5 shrink-0" />
                <span>
                  <strong className="text-primary">Kepatuhan UU PDP No. 27/2022:</strong> Data tidak pernah dialihkan ke pihak manapun tanpa otorisasi klien.
                </span>
              </li>
            </ul>
          </Card>
        </div>

        {/* RIGHT COLUMN: Settings Multi-Tab Container */}
        <div className="lg:col-span-8">
          <Card className="rounded-2xl border-primary-light bg-white shadow-sm overflow-hidden">
            {/* Tabs Navigation Header */}
            <div className="p-3 sm:px-6 sm:py-4 border-b border-primary-light bg-surface/60 flex items-center gap-2 overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveTab("info")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
                  activeTab === "info"
                    ? "bg-primary text-white shadow-xs"
                    : "text-text-secondary hover:text-primary hover:bg-white"
                }`}
              >
                <UserIcon className="text-xs" />
                <span>Informasi Entitas &amp; PIC</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("security")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
                  activeTab === "security"
                    ? "bg-primary text-white shadow-xs"
                    : "text-text-secondary hover:text-primary hover:bg-white"
                }`}
              >
                <LockIcon className="text-xs" />
                <span>Keamanan &amp; Kata Sandi</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("sessions")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
                  activeTab === "sessions"
                    ? "bg-primary text-white shadow-xs"
                    : "text-text-secondary hover:text-primary hover:bg-white"
                }`}
              >
                <ClockIcon className="text-xs" />
                <span>Log Sesi &amp; Perangkat ({sessions.length})</span>
              </button>
            </div>

            <CardContent className="p-6 sm:p-8">
              {/* TAB 1: INFORMASI ENTITAS & PIC */}
              {activeTab === "info" && (
                <form onSubmit={handleSavePic} className="space-y-6">
                  <div>
                    <CardTitle className="text-base font-bold text-primary">
                      Profil Kontak Person in Charge (PIC)
                    </CardTitle>
                    <CardDescription className="text-xs text-text-secondary mt-0.5">
                      Informasi PIC digunakan oleh tim konsultan Zhou Consulting untuk korespondensi resmi penugasan.
                    </CardDescription>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Company Name (Locked) */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-text-muted flex items-center justify-between">
                        <span>Nama Entitas Terdaftar</span>
                        <span className="text-[10px] text-primary">Terkunci Coretax</span>
                      </label>
                      <Input
                        type="text"
                        disabled
                        value={picForm.companyName}
                        className="text-xs bg-surface/70 border-primary-light font-medium cursor-not-allowed text-text-primary"
                      />
                    </div>

                    {/* NPWP 16 (Locked) */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-text-muted flex items-center justify-between">
                        <span>NPWP 16 Digit (Format 2026)</span>
                        <span className="text-[10px] text-success font-bold flex items-center gap-1">
                          <CheckIcon className="text-[8px]" /> Valid DJP
                        </span>
                      </label>
                      <Input
                        type="text"
                        disabled
                        value={picForm.npwp16}
                        className="text-xs font-mono bg-surface/70 border-primary-light cursor-not-allowed text-text-primary"
                      />
                    </div>

                    {/* PIC Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-primary">
                        Nama Lengkap PIC <span className="text-error">*</span>
                      </label>
                      <Input
                        type="text"
                        required
                        value={picForm.picName}
                        onChange={(e) =>
                          setPicForm((prev) => ({ ...prev, picName: e.target.value }))
                        }
                        className="text-xs bg-surface border-primary-light focus:bg-white"
                      />
                    </div>

                    {/* PIC Title */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-primary">
                        Jabatan / Posisi <span className="text-error">*</span>
                      </label>
                      <Input
                        type="text"
                        required
                        value={picForm.picTitle}
                        onChange={(e) =>
                          setPicForm((prev) => ({ ...prev, picTitle: e.target.value }))
                        }
                        className="text-xs bg-surface border-primary-light focus:bg-white"
                      />
                    </div>

                    {/* PIC Email */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-primary">
                        Email Korporat PIC <span className="text-error">*</span>
                      </label>
                      <Input
                        type="email"
                        required
                        value={picForm.picEmail}
                        onChange={(e) =>
                          setPicForm((prev) => ({ ...prev, picEmail: e.target.value }))
                        }
                        className="text-xs bg-surface border-primary-light focus:bg-white"
                      />
                    </div>

                    {/* PIC WhatsApp */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-primary">
                        Nomor WhatsApp PIC <span className="text-error">*</span>
                      </label>
                      <Input
                        type="tel"
                        required
                        value={picForm.picPhone}
                        onChange={(e) =>
                          setPicForm((prev) => ({ ...prev, picPhone: e.target.value }))
                        }
                        className="text-xs bg-surface border-primary-light focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Operational Address */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-primary">
                      Alamat Operasional Perusahaan <span className="text-error">*</span>
                    </label>
                    <Textarea
                      required
                      rows={3}
                      value={picForm.officeAddress}
                      onChange={(e) =>
                        setPicForm((prev) => ({ ...prev, officeAddress: e.target.value }))
                      }
                      className="text-xs bg-surface border-primary-light focus:bg-white"
                    />
                  </div>

                  <div className="pt-4 border-t border-primary-light flex items-center justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPicForm({
                          companyName: "PT Maju Makmur Sentosa",
                          npwp16: "01.234.567.8-012.000",
                          picName: "Budi Santoso, S.E.",
                          picTitle: "Finance & Tax Manager",
                          picEmail: "budi.santoso@majumakmur.co.id",
                          picPhone: "+62 811-2345-6789",
                          officeAddress: "Jl. TB Simatupang No. 88, Cilandak Barat, Jakarta Selatan 12430",
                          klu: "62019 - Aktivitas Pemrograman Komputer Lainnya",
                        })
                      }
                      className="text-xs h-9 px-4 border-primary-light"
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={isSavingPic}
                      className="text-xs h-9 px-5 font-semibold shadow-sm"
                    >
                      {isSavingPic ? "Menyimpan..." : "Simpan Perubahan PIC"}
                    </Button>
                  </div>
                </form>
              )}

              {/* TAB 2: KEAMANAN & KATA SANDI */}
              {activeTab === "security" && (
                <div className="space-y-8">
                  <form onSubmit={handleUpdatePassword} className="space-y-6">
                    <div>
                      <CardTitle className="text-base font-bold text-primary">
                        Perbarui Kata Sandi Akun
                      </CardTitle>
                      <CardDescription className="text-xs text-text-secondary mt-0.5">
                        Pastikan menggunakan kombinasi kata sandi yang kuat untuk menjaga keamanan data perpajakan entitas Anda.
                      </CardDescription>
                    </div>

                    <div className="space-y-4 max-w-lg">
                      {/* Current Password */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-primary">
                          Kata Sandi Saat Ini <span className="text-error">*</span>
                        </label>
                        <div className="relative">
                          <Input
                            type={showCurrentPw ? "text" : "password"}
                            required
                            value={passwordForm.currentPassword}
                            onChange={(e) =>
                              setPasswordForm((prev) => ({
                                ...prev,
                                currentPassword: e.target.value,
                              }))
                            }
                            placeholder="Masukkan kata sandi lama Anda"
                            className="text-xs h-9 bg-surface border-primary-light pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPw(!showCurrentPw)}
                            className="absolute right-3 top-2.5 text-text-muted hover:text-primary text-xs"
                          >
                            <EyeIcon />
                          </button>
                        </div>
                      </div>

                      {/* New Password */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-primary">
                          Kata Sandi Baru <span className="text-error">*</span>
                        </label>
                        <div className="relative">
                          <Input
                            type={showNewPw ? "text" : "password"}
                            required
                            value={passwordForm.newPassword}
                            onChange={(e) =>
                              setPasswordForm((prev) => ({
                                ...prev,
                                newPassword: e.target.value,
                              }))
                            }
                            placeholder="Minimal 8 karakter kombinasi"
                            className="text-xs h-9 bg-surface border-primary-light pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPw(!showNewPw)}
                            className="absolute right-3 top-2.5 text-text-muted hover:text-primary text-xs"
                          >
                            <EyeIcon />
                          </button>
                        </div>

                        {/* Password Strength Meter */}
                        {passwordForm.newPassword && (
                          <div className="pt-1.5 space-y-1">
                            <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden border border-primary-light">
                              <div className={`h-full transition-all duration-300 ${strength.bar}`} />
                            </div>
                            <span className={`text-[10px] font-semibold ${strength.color}`}>
                              Kekuatan: {strength.text}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Confirm New Password */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-primary">
                          Konfirmasi Kata Sandi Baru <span className="text-error">*</span>
                        </label>
                        <div className="relative">
                          <Input
                            type={showConfirmPw ? "text" : "password"}
                            required
                            value={passwordForm.confirmPassword}
                            onChange={(e) =>
                              setPasswordForm((prev) => ({
                                ...prev,
                                confirmPassword: e.target.value,
                              }))
                            }
                            placeholder="Ulangi kata sandi baru Anda"
                            className="text-xs h-9 bg-surface border-primary-light pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPw(!showConfirmPw)}
                            className="absolute right-3 top-2.5 text-text-muted hover:text-primary text-xs"
                          >
                            <EyeIcon />
                          </button>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={isUpdatingPw}
                      className="text-xs h-9 px-5 font-semibold shadow-sm"
                    >
                      {isUpdatingPw ? "Menyimpan..." : "Perbarui Kata Sandi"}
                    </Button>
                  </form>

                  {/* Two-Factor Authentication Section */}
                  <div className="pt-6 border-t border-primary-light space-y-4">
                    <div>
                      <CardTitle className="text-base font-bold text-primary">
                        Autentikasi Dua Faktor (2FA)
                      </CardTitle>
                      <CardDescription className="text-xs text-text-secondary mt-0.5">
                        Tingkatkan keamanan akun dengan mewajibkan verifikasi kode OTP setiap kali masuk dari perangkat baru.
                      </CardDescription>
                    </div>

                    <div className="p-4 rounded-xl bg-surface border border-primary-light flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-primary">
                            Verifikasi OTP via WhatsApp &amp; Email
                          </span>
                          <Badge variant={twoFactorEnabled ? "success" : "silver"} size="sm">
                            {twoFactorEnabled ? "Aktif" : "Nonaktif"}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-text-secondary">
                          Kode 6 digit akan dikirim ke nomor <strong className="text-primary">{picForm.picPhone}</strong> saat login.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setTwoFactorEnabled(!twoFactorEnabled);
                          showToast(
                            twoFactorEnabled
                              ? "2FA telah dinonaktifkan."
                              : "2FA berhasil diaktifkan untuk akun ini."
                          );
                        }}
                        className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                          twoFactorEnabled ? "bg-primary" : "bg-silver"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white transition-transform ${
                            twoFactorEnabled ? "translate-x-6" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: LOG SESI & PERANGKAT TERDAFTAR */}
              {activeTab === "sessions" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-base font-bold text-primary">
                        Log Sesi &amp; Perangkat Terdaftar
                      </CardTitle>
                      <CardDescription className="text-xs text-text-secondary mt-0.5">
                        Daftar seluruh browser dan perangkat yang saat ini memiliki akses terotorisasi ke akun klien Anda.
                      </CardDescription>
                    </div>

                    {sessions.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleTerminateOtherSessions}
                        className="text-xs h-8 px-3 border-error/30 text-error hover:bg-error/5 hover:border-error shrink-0"
                      >
                        Keluar dari Sesi Lain
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {sessions.map((sess) => (
                      <div
                        key={sess.id}
                        className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          sess.isCurrent
                            ? "bg-white border-primary shadow-xs"
                            : "bg-surface border-primary-light"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0 mt-0.5 ${
                              sess.isCurrent
                                ? "bg-primary text-white"
                                : "bg-silver/40 text-text-primary"
                            }`}
                          >
                            <BuildingIcon className="text-xs" />
                          </div>

                          <div className="space-y-1 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-primary">{sess.device}</span>
                              {sess.isCurrent && (
                                <Badge variant="success" size="sm" dot>
                                  Sesi Ini
                                </Badge>
                              )}
                            </div>
                            <div className="text-[11px] text-text-secondary flex flex-wrap items-center gap-1.5">
                              <span>{sess.browser}</span>
                              <span>&bull;</span>
                              <span className="font-mono">{sess.ip}</span>
                              <span>&bull;</span>
                              <span>{sess.location}</span>
                            </div>
                            <div className="text-[10px] text-text-muted">
                              Aktivitas: {sess.lastActive}
                            </div>
                          </div>
                        </div>

                        {!sess.isCurrent && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSessions((prev) => prev.filter((s) => s.id !== sess.id));
                              showToast(`Sesi perangkat ${sess.device} telah ditutup.`);
                            }}
                            className="text-[11px] h-7 px-2.5 text-text-muted hover:text-error hover:border-error self-start sm:self-auto"
                          >
                            Tutup Sesi
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-xl bg-surface border border-primary-light flex items-start gap-2.5 text-xs text-text-secondary">
                    <ShieldTaxIcon className="text-primary text-sm shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed">
                      Jika Anda melihat aktivitas login mencurigakan dari IP atau lokasi yang tidak dikenali, segera ganti kata sandi Anda dan klik tombol <strong className="text-primary">&quot;Keluar dari Sesi Lain&quot;</strong> untuk mencabut otorisasi akses.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
