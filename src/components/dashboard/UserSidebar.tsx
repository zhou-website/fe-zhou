"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  DocumentIcon,
  ChatbotIcon,
  UserIcon,
  LogoutIcon,
  MenuIcon,
  CloseIcon,
  BuildingIcon,
  ClockIcon,
} from "@/components/icons";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

const USER_NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard Saya",
    href: "/dashboard/user",
    icon: BuildingIcon,
  },
  {
    label: "Tiket Konsultasi",
    href: "/dashboard/user/tiket",
    icon: ClockIcon,
    badge: "3",
    badgeColor: "bg-primary-light text-primary",
  },
  {
    label: "Dokumen Pajak",
    href: "/dashboard/user/dokumen",
    icon: DocumentIcon,
    badge: "6",
    badgeColor: "bg-success/20 text-success",
  },
  {
    label: "Chatbot Bantuan",
    href: "/dashboard/user/chatbot",
    icon: ChatbotIcon,
    badge: "Rule",
    badgeColor: "bg-white/15 text-silver",
  },
  {
    label: "Pengaturan Profil",
    href: "/dashboard/user/profil",
    icon: UserIcon,
  },
];

export function UserSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Mobile Top Header Bar with Hamburger */}
      <div className="lg:hidden bg-[#0B1533] text-white px-4 py-3 flex items-center justify-between border-b border-[#172652] sticky top-0 z-40">
        <Link href="/dashboard/user" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-white text-[#0B1533] font-bold text-sm flex items-center justify-center">
            Z
          </div>
          <div>
            <span className="text-xs font-bold tracking-tight text-white block leading-none">
              ZHOU CONSULTING
            </span>
            <span className="text-[9px] text-silver block uppercase tracking-wider mt-0.5">
              Dashboard Saya
            </span>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 text-silver hover:text-white rounded-md bg-white/5 border border-white/10 cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <CloseIcon className="text-xs" /> : <MenuIcon className="text-xs" />}
        </button>
      </div>

      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container (Desktop Persistent, Mobile Drawer) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0B1533] text-white border-r border-[#172652] flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top: Logo & Header */}
        <div>
          <div className="p-5 border-b border-[#172652] flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-3 group"
              onClick={() => setMobileOpen(false)}
            >
              <div className="w-9 h-9 rounded-lg bg-white text-[#0B1533] font-bold text-base flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                Z
              </div>
              <div className="min-w-0">
                <span className="text-sm font-bold tracking-tight text-white block leading-tight">
                  ZHOU CONSULTING
                </span>
                <span className="text-[10px] text-silver block uppercase tracking-wider">
                  Dashboard Saya
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1 text-silver hover:text-white cursor-pointer"
              aria-label="Tutup navigasi"
            >
              <CloseIcon className="text-xs" />
            </button>
          </div>

          {/* Prominent link to Public Website */}
          <div className="px-3 pt-3">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-silver hover:text-white text-xs font-semibold transition-all border border-white/10 group"
            >
              <span className="text-primary-light group-hover:-translate-x-1 transition-transform">←</span>
              <span>Kembali ke Website</span>
            </Link>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1" aria-label="Navigasi Dashboard Saya">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-silver/60">
              Menu Utama
            </div>

            {USER_NAV_ITEMS.map((item) => {
              const IconComp = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-white/15 text-white font-bold border-l-2 border-primary-light shadow-sm"
                      : "text-silver hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComp
                      className={`text-xs ${
                        isActive ? "text-primary-light" : "text-silver/80"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        item.badgeColor || "bg-white/10 text-white"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom: Client Profile Card & Logout */}
        <div className="p-4 border-t border-[#172652] space-y-3 bg-[#060D22]/60">
          {/* Client Entity Info Box */}
          <div className="rounded-lg bg-white/5 border border-white/10 p-3 text-xs">
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-7 h-7 rounded-full bg-silver/20 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : <UserIcon className="text-xs" />}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {user?.name || "Klien Terdaftar"}
                </div>
                <div className="text-[10px] text-silver truncate">
                  {user?.email || "klien@zhou.co.id"}
                </div>
              </div>
            </div>

            <div className="text-[10px] text-silver/80 flex items-center justify-between pt-1.5 border-t border-white/5">
              <span>Peran: Klien</span>
              <span className="text-success font-semibold">&bull; Aktif</span>
            </div>
          </div>

          {/* Logout Action */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold text-silver hover:text-white hover:bg-white/10 transition-all border border-white/10 cursor-pointer active:scale-[0.98]"
          >
            <LogoutIcon className="text-xs" />
            <span>Keluar Akun</span>
          </button>
        </div>
      </aside>
    </>
  );
}

