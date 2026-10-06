"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  DocumentIcon,
  UserIcon,
  LogoutIcon,
  MenuIcon,
  CloseIcon,
  BuildingIcon,
  ShieldTaxIcon,
  EditIcon,
  BookIcon,
  BriefcaseIcon,
  PhoneIcon,
  CheckCircleIcon,
} from "@/components/icons";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const MAIN_NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard Operasional",
    href: "/dashboard/admin",
    icon: BuildingIcon,
  },
  {
    label: "Pusat Manajemen CMS",
    href: "/dashboard/admin/cms",
    icon: EditIcon,
  },
  {
    label: "Upload Dokumen",
    href: "/dashboard/admin/upload",
    icon: DocumentIcon,
  },
];

const PUBLIC_PAGE_ITEMS: NavItem[] = [
  { label: "Materi Edukasi", href: "/dashboard/admin/cms?tab=edukasi", icon: BookIcon },
  { label: "Katalog Layanan", href: "/dashboard/admin/cms?tab=services", icon: CheckCircleIcon },
  { label: "Regulasi DJP", href: "/dashboard/admin/cms?tab=regulasi", icon: DocumentIcon },
  { label: "Kurs Pajak KMK", href: "/dashboard/admin/cms?tab=kurs", icon: ShieldTaxIcon },
  { label: "Lowongan Karir", href: "/dashboard/admin/cms?tab=karir", icon: BriefcaseIcon },
  { label: "Lamaran Masuk", href: "/dashboard/admin/cms?tab=applications", icon: DocumentIcon },
  { label: "Profil & Kontak", href: "/dashboard/admin/cms?tab=kontak", icon: PhoneIcon },
];

export function AdminSidebar() {
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
        <Link href="/dashboard/admin" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-white text-[#0B1533] font-bold text-sm flex items-center justify-center">
            Z
          </div>
          <div>
            <span className="text-xs font-bold tracking-tight text-white block leading-none">
              ZHOU CONSULTING
            </span>
            <span className="text-[9px] text-silver block uppercase tracking-wider mt-0.5">
              Admin Portal
            </span>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 text-silver hover:text-white rounded-md bg-white/5 border border-white/10"
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

      {/* Persistent Left Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0B1533] text-white flex flex-col justify-between border-r border-[#172652] transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Brand Header */}
          <div className="p-5 border-b border-[#172652] flex items-center justify-between">
            <Link href="/dashboard/admin" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white text-[#0B1533] font-bold text-lg flex items-center justify-center shadow-sm">
                Z
              </div>
              <div>
                <span className="text-sm font-bold tracking-tight text-white block leading-tight">
                  ZHOU CONSULTING
                </span>
                <span className="text-[10px] text-silver block tracking-wider uppercase font-semibold">
                  Admin Portal
                </span>
              </div>
            </Link>

            {/* Close button for mobile */}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="lg:hidden text-silver hover:text-white p-1 cursor-pointer"
            >
              <CloseIcon className="text-xs" />
            </button>
          </div>

          {/* Quick link back to Public Website */}
          <div className="px-3 pt-3">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="w-full flex items-center justify-center py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-silver hover:text-white text-xs font-semibold transition-all border border-white/10 shadow-xs active:scale-[0.98]"
            >
              Kembali ke Website
            </Link>
          </div>

          {/* Navigation Items (Clean & Simple, No Truncation) */}
          <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto scrollbar-thin">
            {/* Menu Utama */}
            <div className="space-y-1">
              <span className="px-3 text-[10px] uppercase font-bold tracking-wider text-silver/50 block">
                Menu Utama
              </span>
              {MAIN_NAV_ITEMS.map((item) => {
                const isCurrent = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                      isCurrent
                        ? "bg-white text-[#0B1533] shadow-sm font-bold"
                        : "text-silver hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon className={`text-xs shrink-0 ${isCurrent ? "text-[#0B1533]" : "text-silver/80"}`} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Kelola Halaman Publik */}
            <div className="space-y-0.5">
              <span className="px-3 text-[10px] uppercase font-bold tracking-wider text-silver/50 block">
                Kelola Halaman Publik
              </span>
              {PUBLIC_PAGE_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-1.5 rounded-lg text-xs font-medium text-silver/90 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <Icon className="text-[11px] text-silver/70 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Bottom: Staff Profile & Logout */}
        <div className="p-3 border-t border-[#172652] space-y-2.5 bg-[#060D22]/60">
          <Link
            href="/dashboard/admin/profil"
            onClick={() => setMobileOpen(false)}
            title="Buka Pengaturan Profil Admin"
            className={`block rounded-lg p-2 transition-all border group cursor-pointer ${
              pathname === "/dashboard/admin/profil"
                ? "bg-white/15 border-primary-light shadow-sm"
                : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-silver/20 text-white flex items-center justify-center shrink-0 font-bold text-xs group-hover:bg-primary-light group-hover:text-[#0B1533] transition-colors">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : <UserIcon className="text-xs" />}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-white block truncate group-hover:text-primary-light transition-colors">
                  {user?.name || "Staff Administrator"}
                </span>
                <span className="text-[10px] text-silver block truncate">
                  {user?.email || ""}
                </span>
              </div>
            </div>
          </Link>

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
