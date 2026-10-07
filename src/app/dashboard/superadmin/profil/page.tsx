"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  UserIcon,
  LockIcon,
  CheckCircleIcon,
  CheckIcon,
  ClockIcon,
  ShieldTaxIcon,
} from "@/components/icons";

export default function SuperadminProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"info" | "security">("info");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form profile
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [officeRole, setOfficeRole] = useState("Executive Superadmin");

  // Form password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Nama superadmin tidak boleh kosong.");
      return;
    }
    showToast("Profil superadmin berhasil diperbarui.");
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (!currentPassword) {
      setPasswordError("Kata sandi saat ini wajib diisi.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("Kata sandi baru minimal 8 karakter.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    showToast("Kata sandi superadmin berhasil diperbarui.");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0B1533] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 text-xs border border-white/20 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircleIcon className="text-emerald-400 text-sm" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="space-y-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-1">
          <div>
            <h1 className="text-2xl font-bold text-primary font-serif">
              Profil Eksekutif Superadmin
            </h1>
            <p className="text-xs text-text-secondary mt-0.5">
              Kelola kredensial otoritas tertinggi sistem, izin akses RBAC, dan parameter keamanan console Zhou Consulting.
            </p>
          </div>
          <Badge className="bg-primary text-white border border-primary/20 text-xs font-semibold py-1 px-3 self-start sm:self-auto shadow-xs">
            Role: SUPERADMIN (Otoritas Penuh)
          </Badge>
        </div>
      </div>

      {/* Main Profile Summary Card */}
      <Card className="rounded-2xl border-primary-light bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0 border border-white/20">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : "SA"}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-lg font-bold text-primary">
                  {user?.name || "Super Administrator"}
                </h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Otoritas Eksekutif Aktif
                </span>
              </div>
              <p className="text-xs text-text-secondary">
                {user?.email || "-"}
              </p>
              <div className="flex items-center gap-3 text-[11px] text-text-muted pt-0.5">
                <span className="flex items-center gap-1">
                  <ShieldTaxIcon className="text-xs text-primary" />
                  Hak Akses Root / Master RBAC
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <ClockIcon className="text-xs" />
                  Sesi Kredensial Terenkripsi
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/superadmin"
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:text-primary hover:bg-surface border border-primary-light transition-all"
            >
              Kembali ke Console
            </Link>
          </div>
        </div>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-primary-light pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("info")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "info"
              ? "bg-primary text-white shadow-xs"
              : "text-text-secondary hover:text-primary hover:bg-surface"
          }`}
        >
          <UserIcon className="text-xs" />
          <span>Informasi Otoritas</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "security"
              ? "bg-primary text-white shadow-xs"
              : "text-text-secondary hover:text-primary hover:bg-surface"
          }`}
        >
          <LockIcon className="text-xs" />
          <span>Keamanan &amp; Autentikasi</span>
        </button>
      </div>

      {/* Tab 1: Informasi Otoritas */}
      {activeTab === "info" && (
        <Card className="rounded-2xl border-primary-light bg-white shadow-xs overflow-hidden">
          <div className="p-5 border-b border-primary-light bg-surface/50">
            <CardTitle className="text-sm font-bold text-primary">
              Informasi Pengguna Eksekutif
            </CardTitle>
            <CardDescription className="text-xs text-text-secondary mt-0.5">
              Data identitas pemilik wewenang kontrol sistem Zhou Consulting.
            </CardDescription>
          </div>
          <CardContent className="p-6">
            <form onSubmit={handleSaveProfile} className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-primary">
                    Nama Lengkap Superadmin
                  </label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama super administrator"
                    className="text-xs h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-primary">
                    Alamat Email (Root)
                  </label>
                  <Input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="text-xs h-10 bg-surface text-text-muted cursor-not-allowed"
                  />
                  <p className="text-[10px] text-text-muted">
                    Email utama terikat langsung dengan otorisasi hak akses master.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-primary">
                    Nomor Kontak Darurat
                  </label>
                  <Input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Nomor kontak resmi"
                    className="text-xs h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-primary">
                    Posisi / Jabatan
                  </label>
                  <Input
                    type="text"
                    value={officeRole}
                    onChange={(e) => setOfficeRole(e.target.value)}
                    placeholder="Posisi eksekutif"
                    className="text-xs h-10"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="text-xs font-semibold px-5 h-9 shadow-xs"
                >
                  <CheckIcon className="text-xs mr-1.5" />
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Keamanan & Autentikasi */}
      {activeTab === "security" && (
        <Card className="rounded-2xl border-primary-light bg-white shadow-xs overflow-hidden">
          <div className="p-5 border-b border-primary-light bg-surface/50">
            <CardTitle className="text-sm font-bold text-primary">
              Perbarui Kata Sandi Superadmin
            </CardTitle>
            <CardDescription className="text-xs text-text-secondary mt-0.5">
              Kredensial akun ini memiliki akses tak terbatas ke seluruh audit trail dan modul RBAC. Pastikan kata sandi memiliki tingkat entropi tinggi.
            </CardDescription>
          </div>
          <CardContent className="p-6">
            <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
              {passwordError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {passwordError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-primary">
                  Kata Sandi Saat Ini
                </label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Masukkan kata sandi root saat ini"
                  className="text-xs h-10"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-primary">
                  Kata Sandi Baru
                </label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 8 karakter kompleks"
                  className="text-xs h-10"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-primary">
                  Konfirmasi Kata Sandi Baru
                </label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi baru"
                  className="text-xs h-10"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="text-xs font-semibold px-5 h-9 shadow-xs"
                >
                  <LockIcon className="text-xs mr-1.5" />
                  Perbarui Kata Sandi Superadmin
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
