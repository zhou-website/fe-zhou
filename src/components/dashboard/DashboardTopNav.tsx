"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  QuestionCircleIcon,
  EnvelopeIcon,
  BellIcon,
  ChevronDownIcon,
  UserIcon,
  LogoutIcon,
  CheckCircleIcon,
  MenuIcon,
  ChatbotIcon,
  WhatsappIcon,
  BuildingIcon,
} from "@/components/icons";

interface DashboardTopNavProps {
  role: "user" | "admin" | "superadmin";
  profileUrl?: string;
}

export function DashboardTopNav({
  role,
  profileUrl,
}: DashboardTopNavProps) {
  const { user, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const handleToggleMobileMenu = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("toggle-dashboard-sidebar"));
    }
  };

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const helpRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (messagesRef.current && !messagesRef.current.contains(event.target as Node)) {
        setMessagesOpen(false);
      }
      if (helpRef.current && !helpRef.current.contains(event.target as Node)) {
        setHelpOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Format display name
  const displayName = user?.name || (role === "admin" ? "Staff Konsultan" : role === "superadmin" ? "Super Administrator" : "Klien");
  const displayEmail = user?.email || (role === "admin" ? "admin@zhouconsulting.co.id" : role === "superadmin" ? "superadmin@zhouconsulting.co.id" : "klien@zhouconsulting.co.id");
  const displayRoleLabel = role === "superadmin" ? "Superadmin" : role === "admin" ? "Staf Konsultan" : "Klien Terdaftar";

  return (
    <header className="sticky top-0 z-30 bg-[#0B1533] px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex items-center justify-between gap-4 max-w-[1600px] mx-auto w-full">
        {/* Left Side: Mobile Menu Button & Personalized Greeting */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={handleToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl text-white hover:bg-white/10 border border-white/20 transition-colors"
            aria-label="Buka menu navigasi"
          >
            <MenuIcon className="text-sm" />
          </button>

          <div>
            <h1 className="text-base sm:text-lg lg:text-xl font-bold text-white tracking-tight truncate">
              Welcome back, {displayName}
            </h1>
          </div>
        </div>

        {/* Right Side: Action Icons & Profile Card */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Help Button (?) - Hanya untuk portal User/Klien */}
          {role === "user" && (
            <div className="relative" ref={helpRef}>
              <button
                type="button"
                onClick={() => {
                  setHelpOpen(!helpOpen);
                  setNotificationsOpen(false);
                  setMessagesOpen(false);
                  setProfileDropdownOpen(false);
                }}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 border border-white/15 shadow-2xs flex items-center justify-center text-white hover:bg-white/20 hover:border-white/30 transition-all cursor-pointer ${
                  helpOpen ? "bg-white/20 ring-2 ring-white/30" : ""
                }`}
                title="Pusat Bantuan"
                aria-label="Pusat Bantuan"
              >
                <QuestionCircleIcon className="text-sm sm:text-base" />
              </button>

              {helpOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 text-xs z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="font-bold text-slate-900 text-sm mb-1">Pusat Bantuan &amp; Dukungan</div>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Butuh konsultasi lanjutan atau panduan operasional sistem?
                  </p>
                  <div className="space-y-2">
                    <Link
                      href="/dashboard/user/chatbot"
                      onClick={() => setHelpOpen(false)}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 hover:bg-primary-light/40 border border-slate-200/60 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center text-xs shrink-0">
                        <ChatbotIcon />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">AI Konsultan Pajak</div>
                        <div className="text-[10px] text-slate-500">Tanya jawab instan regulasi UU HPP &amp; PPh</div>
                      </div>
                    </Link>

                    <a
                      href="https://wa.me/6281234567890?text=Halo%20Admin%20Zhou%20Consulting,%20saya%20butuh%20bantuan."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/60 border border-emerald-200/60 text-emerald-900 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs shrink-0">
                        <WhatsappIcon />
                      </div>
                      <div>
                        <div className="font-bold text-emerald-950">Customer Care WhatsApp</div>
                        <div className="text-[10px] text-emerald-700">Respons langsung staf penugasan kami</div>
                      </div>
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Messages / Inbox Button - Hanya untuk portal User/Klien */}
          {role === "user" && (
            <div className="relative" ref={messagesRef}>
              <button
                type="button"
                onClick={() => {
                  setMessagesOpen(!messagesOpen);
                  setHelpOpen(false);
                  setNotificationsOpen(false);
                  setProfileDropdownOpen(false);
                }}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 border border-white/15 shadow-2xs flex items-center justify-center text-white hover:bg-white/20 hover:border-white/30 transition-all cursor-pointer ${
                  messagesOpen ? "bg-white/20 ring-2 ring-white/30" : ""
                }`}
                title="Pesan & Komunikasi"
                aria-label="Pesan & Komunikasi"
              >
                <EnvelopeIcon className="text-sm sm:text-base" />
              </button>

              {messagesOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 text-xs z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900 text-sm">Saluran Komunikasi</span>
                    <span className="text-[10px] font-semibold text-primary bg-primary-light px-2 py-0.5 rounded-md">
                      Aktif
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Koordinasi berkas resmi terhubung dengan PIC konsultan bersertifikat BKP.
                  </p>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-[11px] text-slate-700 space-y-1">
                    <div className="font-semibold text-slate-900">Email Resmi Korespondensi:</div>
                    <div className="font-mono text-primary">client.support@zhouconsulting.co.id</div>
                    <div className="text-[10px] text-slate-500">Senin - Jumat (09:00 - 18:00 WIB)</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notifications Button (Bell with unread dot) */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setHelpOpen(false);
                setMessagesOpen(false);
                setProfileDropdownOpen(false);
              }}
              className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 border border-white/15 shadow-2xs flex items-center justify-center text-white hover:bg-white/20 hover:border-white/30 transition-all cursor-pointer ${
                notificationsOpen ? "bg-white/20 ring-2 ring-white/30" : ""
              }`}
              title="Pemberitahuan Sistem"
              aria-label="Pemberitahuan Sistem"
            >
              <BellIcon className="text-sm sm:text-base" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-error ring-2 ring-[#0B1533]" />
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 text-xs z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div className="font-bold text-slate-900 text-sm">Pemberitahuan Sistem</div>
                  <span className="text-[10px] font-bold text-success bg-success/15 px-2 py-0.5 rounded-md">
                    3 Baru
                  </span>
                </div>

                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  <div className="p-2.5 rounded-xl bg-surface border border-primary-light/60 hover:bg-white transition-colors">
                    <div className="flex items-center gap-2 text-primary font-bold text-[11px] mb-0.5">
                      <CheckCircleIcon className="text-success text-xs shrink-0" />
                      <span>Tiket Penugasan Aktif</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Konsultasi pajak dan pelaporan SPT telah diverifikasi oleh tim konsultan BKP.
                    </p>
                    <span className="text-[9px] text-slate-400 mt-1 block">Baru saja</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-surface border border-primary-light/60 hover:bg-white transition-colors">
                    <div className="flex items-center gap-2 text-primary font-bold text-[11px] mb-0.5">
                      <CheckCircleIcon className="text-success text-xs shrink-0" />
                      <span>Deliverable Vault Terbit</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Berkas laporan kompilasi audit &amp; SPT resmi terenkripsi SHA-256 siap diunduh.
                    </p>
                    <span className="text-[9px] text-slate-400 mt-1 block">2 jam lalu</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-surface border border-primary-light/60 hover:bg-white transition-colors">
                    <div className="flex items-center gap-2 text-primary font-bold text-[11px] mb-0.5">
                      <CheckCircleIcon className="text-success text-xs shrink-0" />
                      <span>Integritas UU PDP 2026</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Sistem proteksi data terintegrasi penuh dengan standar keamanan ISO 27001.
                    </p>
                    <span className="text-[9px] text-slate-400 mt-1 block">1 hari lalu</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Widget Card with Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => {
                setProfileDropdownOpen(!profileDropdownOpen);
                setHelpOpen(false);
                setNotificationsOpen(false);
                setMessagesOpen(false);
              }}
              className={`flex items-center gap-2 sm:gap-3 p-1 sm:pl-1.5 sm:pr-3 sm:py-1.5 rounded-2xl bg-white/10 border border-white/15 hover:border-white/30 hover:bg-white/15 transition-all cursor-pointer group ${
                profileDropdownOpen ? "bg-white/20 ring-2 ring-white/30" : ""
              }`}
              aria-label="Menu Profil Pengguna"
            >
              {/* Avatar circle */}
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white text-[#0B1533] font-bold flex items-center justify-center text-xs shrink-0 shadow-xs ring-2 ring-white/20">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : "ZH"}
              </div>

              {/* Name & Email (desktop) */}
              <div className="hidden sm:block text-left min-w-0 max-w-[130px] lg:max-w-[170px]">
                <span className="text-xs font-bold text-white block truncate leading-tight">
                  {displayName}
                </span>
                <span className="text-[10px] text-blue-200/70 block truncate leading-tight mt-0.5">
                  {displayEmail}
                </span>
              </div>

              <ChevronDownIcon
                className={`text-[10px] text-blue-200/60 group-hover:text-white transition-transform hidden sm:block ${
                  profileDropdownOpen ? "rotate-180 text-white" : ""
                }`}
              />
            </button>

            {/* Profile Dropdown Menu */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 text-xs z-50 animate-in fade-in slide-in-from-top-2">
                <div className="p-3 border-b border-slate-100">
                  <div className="font-bold text-slate-900 text-sm truncate">{displayName}</div>
                  <div className="text-[11px] text-slate-500 truncate">{displayEmail}</div>
                  <span className="inline-block mt-1.5 text-[9px] font-bold uppercase tracking-wider text-primary bg-primary-light px-2 py-0.5 rounded-md">
                    {displayRoleLabel}
                  </span>
                </div>

                <div className="py-1">
                  <Link
                    href="/"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors font-medium"
                  >
                    <BuildingIcon className="text-xs text-slate-400" />
                    <span>Kembali ke Website Utama</span>
                  </Link>
                </div>

                <div className="pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-error hover:bg-red-50 transition-colors font-semibold cursor-pointer"
                  >
                    <LogoutIcon className="text-xs" />
                    <span>Keluar Akun</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
