"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { BackendStatusBadge } from "@/components/common/BackendStatusBadge";
import {
  DocumentIcon,
  UserIcon,
  LogoutIcon,
  MenuIcon,
  CloseIcon,
  BuildingIcon,
  ShieldTaxIcon,
} from "@/components/icons";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const SUPERADMIN_NAV_ITEMS: NavItem[] = [
  {
    label: "Log Audit & Sistem",
    href: "/dashboard/superadmin",
    icon: ShieldTaxIcon,
  },
  {
    label: "Kelola Admin & Staf",
    href: "/dashboard/superadmin/users",
    icon: UserIcon,
  },
];

const QUICK_SWITCH_ITEMS: NavItem[] = [
  {
    label: "Admin Portal",
    href: "/dashboard/admin",
    icon: BuildingIcon,
  },
  {
    label: "Dashboard Saya",
    href: "/dashboard/user",
    icon: DocumentIcon,
  },
];

export function SuperadminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Mobile Top Header Bar with Hamburger */}
      <div className="md:hidden bg-primary-dark text-white px-4 py-3 flex items-center justify-between border-b border-white/10 sticky top-0 z-40">
        <Link href="/dashboard/superadmin" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-white text-primary font-bold text-sm">
            Z
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight leading-tight">
              ZHOU CONSULTING
            </span>
            <span className="text-[9px] text-silver uppercase tracking-wider font-semibold">
              Superadmin Portal
            </span>
          </div>
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded-lg text-silver hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Toggle Navigation Menu"
        >
          {mobileOpen ? <CloseIcon className="text-base" /> : <MenuIcon className="text-base" />}
        </button>
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-primary-dark/80 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Persistent Superadmin Sidebar (Desktop + Mobile Drawer) */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-primary-dark text-white flex flex-col justify-between border-r border-white/10 transition-transform duration-300 ease-in-out md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Brand Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <Link
              href="/dashboard/superadmin"
              className="flex items-center gap-3"
              onClick={() => setMobileOpen(false)}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-primary font-bold text-base shadow-xs">
                Z
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight leading-tight text-white">
                  ZHOU CONSULTING
                </span>
                <span className="text-[10px] text-silver uppercase tracking-wider font-semibold mt-0.5">
                  Superadmin Portal
                </span>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="md:hidden p-1 text-silver hover:text-white cursor-pointer"
              aria-label="Tutup navigasi"
            >
              <CloseIcon className="text-sm" />
            </button>
          </div>

          {/* Quick link back to Public Website */}
          <div className="px-3 pt-3">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-silver hover:text-white text-xs font-semibold transition-all border border-white/10 group"
            >
              <span className="text-primary-light group-hover:-translate-x-1 transition-transform">←</span>
              <span>Kembali ke Website</span>
            </Link>
          </div>

          {/* Main Navigation Links (Clean, No Badges) */}
          <div className="px-3 py-3 space-y-1">
            <div className="px-3 pb-1 text-[10px] uppercase font-bold text-silver/50 tracking-wider">
              Menu Superadmin
            </div>
            {SUPERADMIN_NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-primary text-white shadow-xs border border-white/15"
                      : "text-silver hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className={`text-sm shrink-0 ${isActive ? "text-white" : "text-silver/80"}`} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Quick Cross-Portal Switcher Links */}
          <div className="px-3 py-3 border-t border-white/10 space-y-1">
            <div className="px-3 pb-1 text-[10px] uppercase font-bold text-silver/50 tracking-wider">
              Akses Portal Lain
            </div>
            {QUICK_SWITCH_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs text-silver hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Icon className="text-xs text-silver/70 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Superadmin Profile & Logout Footer */}
        <div className="p-3 border-t border-white/10 bg-black/20 space-y-2.5">
          <div className="flex items-center gap-2.5 px-1 py-1">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white border border-white/20 shrink-0">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : "SA"}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-bold text-white truncate">
                {user?.name || "Muhamad Dekhsa Afnan, SH., M.Kn."}
              </span>
              <span className="text-[10px] text-silver truncate">
                {user?.email || "superadmin@zhou.co.id"}
              </span>
            </div>
          </div>

          <BackendStatusBadge compact className="w-full justify-center py-1 bg-white/5 border-white/10" />

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-silver hover:text-white hover:bg-white/10 transition-colors border border-white/10 cursor-pointer active:scale-[0.98]"
          >
            <LogoutIcon className="text-xs" />
            <span>Keluar Akun</span>
          </button>
        </div>
      </aside>
    </>
  );
}
