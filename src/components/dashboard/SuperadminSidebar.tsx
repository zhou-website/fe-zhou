"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  UserIcon,
  CloseIcon,
  ShieldTaxIcon,
  SearchIcon,
} from "@/components/icons";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const SUPERADMIN_MAIN_NAV: NavItem[] = [
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

interface SuperadminSidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export function SuperadminSidebar({
  mobileOpen: externalMobileOpen,
  setMobileOpen: externalSetMobileOpen,
}: SuperadminSidebarProps) {
  const pathname = usePathname();
  const [internalMobileOpen, setInternalMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isMobileOpen = externalMobileOpen !== undefined ? externalMobileOpen : internalMobileOpen;
  const setMobileOpenState = (open: boolean) => {
    if (externalSetMobileOpen) {
      externalSetMobileOpen(open);
    } else {
      setInternalMobileOpen(open);
    }
  };

  React.useEffect(() => {
    const handleToggle = () => {
      if (externalSetMobileOpen) {
        externalSetMobileOpen(!isMobileOpen);
      } else {
        setInternalMobileOpen((prev) => !prev);
      }
    };
    window.addEventListener("toggle-dashboard-sidebar", handleToggle);
    return () => window.removeEventListener("toggle-dashboard-sidebar", handleToggle);
  }, [externalSetMobileOpen, isMobileOpen]);

  const filteredMainNav = SUPERADMIN_MAIN_NAV.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setMobileOpenState(false)}
        />
      )}

      {/* Modern Seamless Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Top Brand Logo */}
          <div className="p-5 flex items-center justify-between">
            <Link
              href="/dashboard/superadmin"
              className="flex items-center gap-3 group"
              onClick={() => setMobileOpenState(false)}
            >
              <div className="w-9 h-9 rounded-xl bg-primary text-white font-extrabold text-base flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform shrink-0">
                Z
              </div>
              <div className="min-w-0">
                <span className="text-sm font-bold tracking-tight text-slate-900 block leading-tight">
                  ZHOU CONSULTING
                </span>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold tracking-wider">
                  Superadmin Portal
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpenState(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              aria-label="Tutup navigasi"
            >
              <CloseIcon className="text-xs" />
            </button>
          </div>

          {/* Search Box in Sidebar */}
          <div className="px-4 pt-4 pb-2">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-2.5 text-slate-400 text-xs" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search menu..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-4 flex-1" aria-label="Navigasi Superadmin Portal">
            {/* Section 1: MAIN MENU */}
            <div>
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                MAIN MENU
              </span>
              <div className="space-y-1">
                {filteredMainNav.map((item) => {
                  const IconComp = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpenState(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                        isActive
                          ? "bg-primary text-white font-bold shadow-md shadow-primary/20"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 font-semibold"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <IconComp
                          className={`text-xs ${
                            isActive ? "text-white" : "text-slate-400"
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
}
