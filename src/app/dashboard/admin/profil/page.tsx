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

export default function AdminProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"info" | "security">("info");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form profile
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [specialization, setSpecialization] = useState("Konsultan Pajak & Akuntansi");

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
      showToast("Nama administrator tidak boleh kosong.");
      return;
    }
    showToast("Profil administrator berhasil diperbarui.");
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
    showToast("Kata sandi berhasil diperbarui dengan aman.");
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
              Profil Staf Administrator
            </h1>
            <p className="text-xs text-text-secondary mt-0.5">
              Kelola data identitas, preferensi operasional tim konsultan, dan kredensial keamanan akun Anda.
            </p>
          </div>
          <Badge className="bg-primary/10 text-primary border border-primary/20 text-xs font-semibold py-1 px-3 self-start sm:self-auto">
            Role: {user?.role ? user.role.toUpperCase() : "ADMIN"}
          </Badge>
        </div>
      </div>

      {/* Main Profile Summary Card */}
      <Card className="rounded-2xl border-primary-light bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : "AD"}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-lg font-bold text-primary">
                  {user?.name || "Staff Administrator"}
                </h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Akun Aktif
                </span>
              </div>
              <p className="text-xs text-text-secondary">
                {user?.email || "-"}
              </p>
              <div className="flex items-center gap-3 text-[11px] text-text-muted pt-0.5">
                <span className="flex items-center gap-1">
                  <ShieldTaxIcon className="text-xs text-primary" />
                  Staff Administrator Zhou
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <ClockIcon className="text-xs" />
                  Otoritas Terverifikasi
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/admin"
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:text-primary hover:bg-surface border border-primary-light transition-all"
            >
              Dashboard Utama
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
          <span>Informasi Identitas</span>
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
          <span>Keamanan &amp; Kata Sandi</span>
        </button>
      </div>

      {/* Tab 1: Informasi Identitas */}
      {activeTab === "info" && (
        <Card className="rounded-2xl border-primary-light bg-white shadow-xs overflow-hidden">
          <div className="p-5 border-b border-primary-light bg-surface/50">
            <CardTitle className="text-sm font-bold text-primary">
              Informasi Pribadi &amp; Penugasan
            </CardTitle>
            <CardDescription className="text-xs text-text-secondary mt-0.5">
              Data identitas staf konsultan yang tercatat dalam sistem Zhou Consulting.
            </CardDescription>
          </div>
          <CardContent className="p-6">
            <form onSubmit={handleSaveProfile} className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-primary">
                    Nama Lengkap
                  </label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama staf administrator"
                    className="text-xs h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-primary">
                    Alamat Email (Akun)
                  </label>
                  <Input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="text-xs h-10 bg-surface text-text-muted cursor-not-allowed"
                  />
                  <p className="text-[10px] text-text-muted">
                    Email terikat dengan otentikasi login sistem.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-primary">
                    Nomor WhatsApp / Telepon
                  </label>
                  <Input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: 08123456789"
                    className="text-xs h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-primary">
                    Divisi / Spesialisasi Penugasan
                  </label>
                  <Input
                    type="text"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    placeholder="Spesialisasi konsultan"
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

      {/* Tab 2: Keamanan & Sandi */}
      {activeTab === "security" && (
        <Card className="rounded-2xl border-primary-light bg-white shadow-xs overflow-hidden">
          <div className="p-5 border-b border-primary-light bg-surface/50">
            <CardTitle className="text-sm font-bold text-primary">
              Perbarui Kata Sandi
            </CardTitle>
            <CardDescription className="text-xs text-text-secondary mt-0.5">
              Gunakan kombinasi minimal 8 karakter dengan huruf kapital, angka, dan simbol untuk keamanan maksimal.
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
                  placeholder="Masukkan kata sandi lama"
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
                  placeholder="Minimal 8 karakter"
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
                  Perbarui Kata Sandi
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
