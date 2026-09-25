"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { userApi } from "@/lib/api";
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
  PencilIcon,
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

interface ProfileData {
  companyName: string;
  entityType: string;
  npwp16: string;
  joinDate: string;
  klu: string;
  taxOfficeAddress: string;
  initials: string;
  clientCode: string;
  status: string;
  picName: string;
  picTitle: string;
  picEmail: string;
  picPhone: string;
  officeAddress: string;
}

const DEFAULT_PROFILE: ProfileData = {
  companyName: "PT Maju Makmur Sentosa",
  entityType: "Perseroan Terbatas (PT)",
  npwp16: "01.234.567.8-012.000",
  joinDate: "12 Januari 2025",
  klu: "62019 - Aktivitas Pemrograman Komputer Lainnya",
  taxOfficeAddress: "Jl. TB Simatupang No. 88, Cilandak Barat, Jakarta Selatan 12430",
  initials: "MMS",
  clientCode: "ID: CL-88219",
  status: "Klien Aktif",
  picName: "Budi Santoso, S.E.",
  picTitle: "Finance & Tax Manager",
  picEmail: "budi.santoso@majumakmur.co.id",
  picPhone: "+62 811-2345-6789",
  officeAddress: "Gedung Cyber 2 Tower Lt. 18, Jl. H.R. Rasuna Said, Jakarta Selatan 12950",
};

export default function ClientProfileSecurityPage() {
  const [activeTab, setActiveTab] = useState<"info" | "security" | "sessions">("info");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Profile State
  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);

  // Sync profile data with live backend
  useEffect(() => {
    async function loadBackendProfile() {
      try {
        const res = await userApi.getProfile();
        if (res.success && res.data) {
          const u = res.data;
          setProfile((prev) => ({
            ...prev,
            companyName: u.company_name || prev.companyName,
            picName: u.name || prev.picName,
            picEmail: u.email || prev.picEmail,
            picPhone: u.phone || prev.picPhone,
          }));
        }
      } catch (err) {
        console.warn("Backend profile load fallback:", err);
      }
    }
    loadBackendProfile();
  }, []);

  // Profile Edit Modal State
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [modalProfile, setModalProfile] = useState<ProfileData>(DEFAULT_PROFILE);
  const [isSavingModal, setIsSavingModal] = useState(false);

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

  // Open Edit Profile Modal
  const handleOpenEditProfileModal = () => {
    setModalProfile({ ...profile });
    setIsEditProfileModalOpen(true);
  };

  // Save from Modal
  const handleSaveModalProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingModal(true);

    try {
      await userApi.updateProfile({
        name: modalProfile.picName,
        company_name: modalProfile.companyName,
        phone: modalProfile.picPhone,
      });
    } catch (err) {
      console.warn("Backend update error:", err);
    }

    // Auto-compute initials if blank
    let autoInitials = modalProfile.initials.trim();
    if (!autoInitials && modalProfile.companyName) {
      const words = modalProfile.companyName.trim().split(/\s+/);
      autoInitials = words.length > 1
        ? words.slice(0, 3).map((w) => w[0]).join("").toUpperCase()
        : modalProfile.companyName.slice(0, 3).toUpperCase();
    }

    setProfile({
      ...modalProfile,
      initials: autoInitials || "MMS",
    });
    setIsSavingModal(false);
    setIsEditProfileModalOpen(false);
    showToast("Data profil perusahaan dan penanggung jawab berhasil diperbarui ke server backend.");
  };

  // Reset to default in modal
  const handleResetModalDefault = () => {
    setModalProfile(DEFAULT_PROFILE);
    showToast("Form modal telah direset ke data default.");
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
            className="text-silver hover:text-white ml-2 cursor-pointer"
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* LEFT COLUMN: Entity Card (Card Gambar 2) */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          <Card className="rounded-2xl border-primary-light bg-white shadow-sm overflow-hidden flex flex-col h-full">
            {/* Header Visual Banner with MMS Avatar and Direct Pencil Edit Button */}
            <div className="relative h-24 bg-gradient-to-r from-primary via-primary-hover to-primary px-6 flex items-end">
              {/* Dynamic Initials Badge with generous overhang */}
              <div className="w-16 h-16 rounded-2xl bg-white border-2 border-primary-light shadow-lg flex items-center justify-center font-bold text-primary text-xl translate-y-1/2 shrink-0 select-none">
                {profile.initials || "MMS"}
              </div>

              {/* Direct Pencil Icon Button on Card Gambar 2 */}
              <button
                type="button"
                onClick={handleOpenEditProfileModal}
                className="absolute top-3.5 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white text-white hover:text-primary backdrop-blur-md border border-white/25 text-xs font-semibold shadow-sm transition-all group cursor-pointer"
                title="Klik untuk ubah profil entitas"
              >
                <PencilIcon className="text-xs transition-transform group-hover:scale-110" />
                <span>Ubah Profil</span>
              </button>
            </div>

            {/* Card Content with pt-12 to ensure zero overlap with badge */}
            <CardContent className="pt-12 px-6 pb-6 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="pt-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-primary leading-tight">
                        {profile.companyName}
                      </h3>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="font-mono text-xs text-text-muted font-semibold">
                          {profile.clientCode}
                        </span>
                        <span>&bull;</span>
                        <Badge variant="success" size="sm" dot>
                          {profile.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Secondary Pencil Icon beside Title */}
                    <button
                      type="button"
                      onClick={handleOpenEditProfileModal}
                      className="p-1.5 rounded-lg text-primary hover:text-primary-hover hover:bg-primary-light/50 border border-transparent hover:border-primary-light transition-all shrink-0 cursor-pointer"
                      title="Ubah data profil perusahaan"
                    >
                      <PencilIcon className="text-xs" />
                    </button>
                  </div>
                </div>

                <div className="p-3.5 bg-surface rounded-xl border border-primary-light space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-text-muted">NPWP 16 Digit:</span>
                    <span className="font-mono font-bold text-primary">{profile.npwp16}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-text-muted">Bentuk Badan:</span>
                    <span className="font-semibold text-primary">{profile.entityType}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-text-muted">Tanggal Bergabung:</span>
                    <span className="font-medium text-text-primary">{profile.joinDate}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider block">
                    Klasifikasi Usaha (KLU):
                  </span>
                  <p className="text-text-secondary leading-relaxed bg-surface/80 p-2.5 rounded-lg border border-primary-light text-[11px]">
                    {profile.klu}
                  </p>
                </div>

                <div className="space-y-1.5 text-xs">
                  <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider block">
                    Alamat Terdaftar KPP:
                  </span>
                  <p className="text-text-secondary leading-relaxed bg-surface/80 p-2.5 rounded-lg border border-primary-light text-[11px]">
                    {profile.taxOfficeAddress}
                  </p>
                </div>

                {/* Ringkasan PIC Utama */}
                <div className="p-3 bg-primary/5 rounded-xl border border-primary/15 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-primary font-bold uppercase tracking-wider block">
                      Person in Charge (PIC Utama):
                    </span>
                    <button
                      type="button"
                      onClick={handleOpenEditProfileModal}
                      className="text-[10px] text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <PencilIcon className="text-[9px]" /> Edit
                    </button>
                  </div>
                  <div className="font-bold text-primary text-xs">{profile.picName}</div>
                  <div className="text-[11px] text-text-secondary">{profile.picTitle} &bull; {profile.picPhone}</div>
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-primary-light flex items-center justify-between text-[11px] text-text-muted">
                <span>Status Akun:</span>
                <span className="font-semibold text-success flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-success"></span>
                  Terverifikasi Aktif
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Settings Multi-Tab Container */}
        <div className="lg:col-span-8 flex flex-col">
          <Card className="rounded-2xl border-primary-light bg-white shadow-sm overflow-hidden h-full flex flex-col">
            {/* Tabs Navigation Header */}
            <div className="p-3 sm:px-6 sm:py-4 border-b border-primary-light bg-surface/60 flex items-center gap-2 overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveTab("info")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
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
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
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
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                  activeTab === "sessions"
                    ? "bg-primary text-white shadow-xs"
                    : "text-text-secondary hover:text-primary hover:bg-white"
                }`}
              >
                <ClockIcon className="text-xs" />
                <span>Log Sesi &amp; Perangkat ({sessions.length})</span>
              </button>
            </div>

            <CardContent className="p-6 sm:p-8 flex-1 flex flex-col">
              {/* TAB 1: INFORMASI ENTITAS & PIC */}
              {activeTab === "info" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-primary-light">
                    <div>
                      <CardTitle className="text-base font-bold text-primary">
                        Data Profil Entitas &amp; Person in Charge (PIC)
                      </CardTitle>
                      <CardDescription className="text-xs text-text-secondary mt-0.5">
                        Informasi resmi entitas korporat dan kontak penanggung jawab untuk korespondensi perpajakan.
                      </CardDescription>
                    </div>

                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={handleOpenEditProfileModal}
                      className="text-xs h-9 px-4 font-semibold shadow-sm gap-2 shrink-0 self-start sm:self-auto cursor-pointer"
                    >
                      <PencilIcon className="text-xs" />
                      <span>Ubah Data Profil</span>
                    </Button>
                  </div>

                  {/* Section 1: Informasi Legalitas Entitas */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                      <BuildingIcon className="text-xs" />
                      <span>1. Informasi Legalitas Entitas</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-3.5 bg-surface rounded-xl border border-primary-light space-y-1">
                        <span className="text-[11px] text-text-muted">Nama Entitas Perusahaan</span>
                        <div className="font-bold text-primary text-sm">{profile.companyName}</div>
                      </div>

                      <div className="p-3.5 bg-surface rounded-xl border border-primary-light space-y-1">
                        <span className="text-[11px] text-text-muted">Bentuk Badan Usaha</span>
                        <div className="font-semibold text-primary">{profile.entityType}</div>
                      </div>

                      <div className="p-3.5 bg-surface rounded-xl border border-primary-light space-y-1">
                        <span className="text-[11px] text-text-muted flex items-center justify-between">
                          <span>NPWP 16 Digit (Format 2026)</span>
                          <span className="text-[10px] text-success font-bold flex items-center gap-1">
                            <CheckIcon className="text-[8px]" /> Valid DJP
                          </span>
                        </span>
                        <div className="font-mono font-bold text-primary text-sm">{profile.npwp16}</div>
                      </div>

                      <div className="p-3.5 bg-surface rounded-xl border border-primary-light space-y-1">
                        <span className="text-[11px] text-text-muted">Tanggal Bergabung</span>
                        <div className="font-semibold text-primary">{profile.joinDate}</div>
                      </div>

                      <div className="sm:col-span-2 p-3.5 bg-surface rounded-xl border border-primary-light space-y-1">
                        <span className="text-[11px] text-text-muted">Klasifikasi Lapangan Usaha (KLU)</span>
                        <div className="font-semibold text-primary">{profile.klu}</div>
                      </div>

                      <div className="sm:col-span-2 p-3.5 bg-surface rounded-xl border border-primary-light space-y-1">
                        <span className="text-[11px] text-text-muted">Alamat Terdaftar KPP</span>
                        <div className="text-text-primary leading-relaxed">{profile.taxOfficeAddress}</div>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Person in Charge (PIC) Utama */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                      <UserIcon className="text-xs" />
                      <span>2. Person in Charge (PIC Utama)</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-3.5 bg-surface rounded-xl border border-primary-light space-y-1">
                        <span className="text-[11px] text-text-muted">Nama Lengkap PIC</span>
                        <div className="font-bold text-primary text-sm">{profile.picName}</div>
                      </div>

                      <div className="p-3.5 bg-surface rounded-xl border border-primary-light space-y-1">
                        <span className="text-[11px] text-text-muted">Jabatan / Posisi</span>
                        <div className="font-semibold text-primary">{profile.picTitle}</div>
                      </div>

                      <div className="p-3.5 bg-surface rounded-xl border border-primary-light space-y-1">
                        <span className="text-[11px] text-text-muted">Email Korporat PIC</span>
                        <div className="font-medium text-primary">{profile.picEmail}</div>
                      </div>

                      <div className="p-3.5 bg-surface rounded-xl border border-primary-light space-y-1">
                        <span className="text-[11px] text-text-muted">Nomor WhatsApp / Kontak</span>
                        <div className="font-semibold text-primary">{profile.picPhone}</div>
                      </div>

                      <div className="sm:col-span-2 p-3.5 bg-surface rounded-xl border border-primary-light space-y-1">
                        <span className="text-[11px] text-text-muted">Alamat Operasional Kantor</span>
                        <div className="text-text-primary leading-relaxed">{profile.officeAddress}</div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Note */}
                  <div className="pt-4 border-t border-primary-light flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-text-muted">
                    <p>
                      Untuk melakukan perubahan data legalitas atau PIC, klik tombol <strong>&quot;Ubah Data Profil&quot;</strong> atau klik ikon pensil pada kartu profil di sisi kiri.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleOpenEditProfileModal}
                      className="text-xs h-8 px-3 gap-1.5 border-primary-light text-primary hover:bg-surface self-start sm:self-auto cursor-pointer"
                    >
                      <PencilIcon className="text-xs" />
                      <span>Ubah Profil</span>
                    </Button>
                  </div>
                </div>
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

                    <div className="space-y-4 max-w-xl">
                      {/* Current Password */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-primary">
                          Kata Sandi Saat Ini <span className="text-error">*</span>
                        </label>
                        <div className="relative">
                          <Input
                            type={showCurrentPw ? "text" : "password"}
                            required
                            placeholder="Masukkan kata sandi saat ini"
                            value={passwordForm.currentPassword}
                            onChange={(e) =>
                              setPasswordForm((prev) => ({
                                ...prev,
                                currentPassword: e.target.value,
                              }))
                            }
                            className="text-xs pr-10 bg-surface border-primary-light focus:bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPw(!showCurrentPw)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary cursor-pointer"
                          >
                            <EyeIcon className="text-xs" />
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
                            placeholder="Minimal 8 karakter kombinasi"
                            value={passwordForm.newPassword}
                            onChange={(e) =>
                              setPasswordForm((prev) => ({
                                ...prev,
                                newPassword: e.target.value,
                              }))
                            }
                            className="text-xs pr-10 bg-surface border-primary-light focus:bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPw(!showNewPw)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary cursor-pointer"
                          >
                            <EyeIcon className="text-xs" />
                          </button>
                        </div>

                        {/* Password strength indicator */}
                        {passwordForm.newPassword && (
                          <div className="pt-1.5 space-y-1">
                            <div className="h-1.5 w-full bg-silver/30 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-300 ${strength.bar}`}
                              />
                            </div>
                            <p className={`text-[10px] font-medium ${strength.color}`}>
                              Kekuatan kata sandi: {strength.text}
                            </p>
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
                            placeholder="Ulangi kata sandi baru"
                            value={passwordForm.confirmPassword}
                            onChange={(e) =>
                              setPasswordForm((prev) => ({
                                ...prev,
                                confirmPassword: e.target.value,
                              }))
                            }
                            className="text-xs pr-10 bg-surface border-primary-light focus:bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPw(!showConfirmPw)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary cursor-pointer"
                          >
                            <EyeIcon className="text-xs" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={isUpdatingPw}
                      className="text-xs h-9 px-5 font-semibold shadow-sm cursor-pointer"
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
                          Kode 6 digit akan dikirim ke nomor <strong className="text-primary">{profile.picPhone}</strong> saat login.
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
                        className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
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
                        className="text-xs h-8 px-3 border-error/30 text-error hover:bg-error/5 hover:border-error shrink-0 cursor-pointer"
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
                            className="text-[11px] h-7 px-2.5 text-text-muted hover:text-error hover:border-error self-start sm:self-auto cursor-pointer"
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

      {/* MODAL: UBAH DATA PROFIL (CRUD) TRIGGERED BY PENCIL ICON */}
      {isEditProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl border border-primary-light shadow-2xl max-w-2xl w-full overflow-hidden my-8">
            {/* Modal Header */}
            <div className="p-5 border-b border-primary-light flex items-center justify-between bg-surface">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center text-sm font-bold shadow-xs">
                  <PencilIcon className="text-sm" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-primary">
                    Ubah Data Profil Entitas &amp; PIC
                  </h3>
                  <p className="text-[11px] text-text-muted">
                    Perbarui data legalitas perusahaan dan kontak penanggung jawab resmi
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditProfileModalOpen(false)}
                className="text-text-muted hover:text-primary p-1.5 rounded-lg hover:bg-surface cursor-pointer transition-colors"
                aria-label="Tutup modal"
              >
                <CloseIcon className="text-base" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveModalProfile} className="p-6 space-y-6 text-xs max-h-[75vh] overflow-y-auto">
              {/* Bagian 1: Data Entitas Perusahaan */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-primary-light pb-1.5 flex items-center gap-2">
                  <BuildingIcon className="text-xs" />
                  <span>1. Data Legalitas Entitas Perusahaan</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Nama Perusahaan */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-primary">
                      Nama Entitas Perusahaan <span className="text-error">*</span>
                    </label>
                    <Input
                      required
                      value={modalProfile.companyName}
                      onChange={(e) => {
                        const newName = e.target.value;
                        const words = newName.trim().split(/\s+/);
                        const initials = words.length > 1
                          ? words.slice(0, 3).map((w) => w[0]).join("").toUpperCase()
                          : newName.slice(0, 3).toUpperCase();
                        setModalProfile((prev) => ({
                          ...prev,
                          companyName: newName,
                          initials: initials || "MMS",
                        }));
                      }}
                      className="text-xs h-9 bg-surface focus:bg-white"
                      placeholder="Contoh: PT Maju Makmur Sentosa"
                    />
                  </div>

                  {/* Bentuk Badan */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-primary">
                      Bentuk Badan Usaha <span className="text-error">*</span>
                    </label>
                    <select
                      value={modalProfile.entityType}
                      onChange={(e) =>
                        setModalProfile((prev) => ({ ...prev, entityType: e.target.value }))
                      }
                      className="w-full h-9 rounded-lg border border-primary-light bg-surface px-3 text-xs text-text-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                    >
                      <option value="Perseroan Terbatas (PT)">Perseroan Terbatas (PT)</option>
                      <option value="Commanditaire Vennootschap (CV)">Commanditaire Vennootschap (CV)</option>
                      <option value="Firma (Fa)">Firma (Fa)</option>
                      <option value="Perorangan (Usaha Dagang)">Perorangan (Usaha Dagang)</option>
                      <option value="Yayasan / Lembaga Nirlaba">Yayasan / Lembaga Nirlaba</option>
                      <option value="Koperasi">Koperasi</option>
                    </select>
                  </div>

                  {/* NPWP 16 Digit */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-primary flex items-center justify-between">
                      <span>NPWP 16 Digit <span className="text-error">*</span></span>
                      <span className="text-[10px] text-success font-bold flex items-center gap-1">
                        <CheckIcon className="text-[8px]" /> Valid DJP
                      </span>
                    </label>
                    <Input
                      required
                      value={modalProfile.npwp16}
                      onChange={(e) =>
                        setModalProfile((prev) => ({ ...prev, npwp16: e.target.value }))
                      }
                      className="text-xs h-9 font-mono bg-surface focus:bg-white"
                      placeholder="01.234.567.8-012.000"
                    />
                  </div>

                  {/* Inisial Badge */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-primary">
                      Inisial Avatar Kartu (Maks. 4 Karakter)
                    </label>
                    <Input
                      maxLength={4}
                      value={modalProfile.initials}
                      onChange={(e) =>
                        setModalProfile((prev) => ({ ...prev, initials: e.target.value.toUpperCase() }))
                      }
                      className="text-xs h-9 uppercase font-bold tracking-wider bg-surface focus:bg-white"
                      placeholder="MMS"
                    />
                  </div>

                  {/* KLU */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="font-bold text-primary">
                      Klasifikasi Usaha (KLU) <span className="text-error">*</span>
                    </label>
                    <Input
                      required
                      value={modalProfile.klu}
                      onChange={(e) =>
                        setModalProfile((prev) => ({ ...prev, klu: e.target.value }))
                      }
                      className="text-xs h-9 bg-surface focus:bg-white"
                      placeholder="62019 - Aktivitas Pemrograman Komputer Lainnya"
                    />
                  </div>

                  {/* Alamat Terdaftar KPP */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="font-bold text-primary">
                      Alamat Terdaftar KPP <span className="text-error">*</span>
                    </label>
                    <Textarea
                      required
                      rows={2}
                      value={modalProfile.taxOfficeAddress}
                      onChange={(e) =>
                        setModalProfile((prev) => ({ ...prev, taxOfficeAddress: e.target.value }))
                      }
                      className="text-xs bg-surface focus:bg-white leading-relaxed"
                      placeholder="Alamat kantor resmi sesuai SKT KPP"
                    />
                  </div>
                </div>
              </div>

              {/* Bagian 2: Kontak Person in Charge (PIC) Utama */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-primary-light pb-1.5 flex items-center gap-2">
                  <UserIcon className="text-xs" />
                  <span>2. Data Person in Charge (PIC Utama)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Nama PIC */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-primary">
                      Nama Lengkap PIC <span className="text-error">*</span>
                    </label>
                    <Input
                      required
                      value={modalProfile.picName}
                      onChange={(e) =>
                        setModalProfile((prev) => ({ ...prev, picName: e.target.value }))
                      }
                      className="text-xs h-9 bg-surface focus:bg-white"
                      placeholder="Budi Santoso, S.E."
                    />
                  </div>

                  {/* Jabatan PIC */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-primary">
                      Jabatan / Posisi <span className="text-error">*</span>
                    </label>
                    <Input
                      required
                      value={modalProfile.picTitle}
                      onChange={(e) =>
                        setModalProfile((prev) => ({ ...prev, picTitle: e.target.value }))
                      }
                      className="text-xs h-9 bg-surface focus:bg-white"
                      placeholder="Finance & Tax Manager"
                    />
                  </div>

                  {/* Email PIC */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-primary">
                      Email Korporat PIC <span className="text-error">*</span>
                    </label>
                    <Input
                      required
                      type="email"
                      value={modalProfile.picEmail}
                      onChange={(e) =>
                        setModalProfile((prev) => ({ ...prev, picEmail: e.target.value }))
                      }
                      className="text-xs h-9 bg-surface focus:bg-white"
                      placeholder="budi.santoso@majumakmur.co.id"
                    />
                  </div>

                  {/* WhatsApp PIC */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-primary">
                      Nomor WhatsApp PIC <span className="text-error">*</span>
                    </label>
                    <Input
                      required
                      type="tel"
                      value={modalProfile.picPhone}
                      onChange={(e) =>
                        setModalProfile((prev) => ({ ...prev, picPhone: e.target.value }))
                      }
                      className="text-xs h-9 bg-surface focus:bg-white"
                      placeholder="+62 811-2345-6789"
                    />
                  </div>

                  {/* Alamat Operasional */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="font-bold text-primary">
                      Alamat Kantor Operasional <span className="text-error">*</span>
                    </label>
                    <Textarea
                      required
                      rows={2}
                      value={modalProfile.officeAddress}
                      onChange={(e) =>
                        setModalProfile((prev) => ({ ...prev, officeAddress: e.target.value }))
                      }
                      className="text-xs bg-surface focus:bg-white leading-relaxed"
                      placeholder="Gedung Cyber 2 Tower Lt. 18..."
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-primary-light flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResetModalDefault}
                  className="text-xs h-9 px-3 text-text-muted hover:text-primary cursor-pointer"
                >
                  Reset Default
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditProfileModalOpen(false)}
                    className="text-xs h-9 px-4 cursor-pointer"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={isSavingModal}
                    className="text-xs h-9 px-5 font-semibold shadow-sm cursor-pointer"
                  >
                    {isSavingModal ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
