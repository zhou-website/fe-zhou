"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ChevronDownIcon,
  MenuIcon,
  CloseIcon,
  UserIcon,
  LogoutIcon,
} from "@/components/icons";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { language, setLanguage, t } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [layananOpen, setLayananOpen] = useState(false);
  const [mobileLayananOpen, setMobileLayananOpen] = useState(false);
  const [peraturanOpen, setPeraturanOpen] = useState(false);
  const [mobilePeraturanOpen, setMobilePeraturanOpen] = useState(false);
  const [edukasiOpen, setEdukasiOpen] = useState(false);
  const [mobileEdukasiOpen, setMobileEdukasiOpen] = useState(false);

  const layananRef = useRef<HTMLDivElement>(null);
  const peraturanRef = useRef<HTMLDivElement>(null);
  const edukasiRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        layananRef.current &&
        !layananRef.current.contains(event.target as Node)
      ) {
        setLayananOpen(false);
      }
      if (
        peraturanRef.current &&
        !peraturanRef.current.contains(event.target as Node)
      ) {
        setPeraturanOpen(false);
      }
      if (
        edukasiRef.current &&
        !edukasiRef.current.contains(event.target as Node)
      ) {
        setEdukasiOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setLayananOpen(false);
        setPeraturanOpen(false);
        setEdukasiOpen(false);
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const closeAllMenus = () => {
    setMobileMenuOpen(false);
    setLayananOpen(false);
    setMobileLayananOpen(false);
    setPeraturanOpen(false);
    setMobilePeraturanOpen(false);
    setEdukasiOpen(false);
    setMobileEdukasiOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md text-text-primary shadow-sm border-b border-primary-light transition-colors">
      <div className="container-custom flex h-20 items-center justify-between py-4">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group"
          onClick={closeAllMenus}
        >
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-md bg-primary text-white font-bold text-base sm:text-lg tracking-wider shadow-sm group-hover:bg-primary-dark transition-colors">
            Z
          </div>
          <span className="text-base sm:text-lg font-bold tracking-tight text-primary group-hover:text-primary-dark transition-colors">
            ZHOU CONSULTING
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-6 text-sm font-semibold">
          <Link
            href="/"
            className={`transition-colors duration-150 py-2 relative ${
              isHome
                ? "text-primary font-bold after:absolute after:-bottom-[23px] after:left-0 after:right-0 after:h-[2.5px] after:bg-primary"
                : "text-text-secondary hover:text-primary"
            }`}
          >
            {t.nav.home}
          </Link>

          {/* Unified Layanan Dropdown (Ringkas & Simpel persis gaya dropdown Peraturan) */}
          <div
            className="relative"
            ref={layananRef}
            onMouseEnter={() => setLayananOpen(true)}
            onMouseLeave={() => setLayananOpen(false)}
          >
            <button
              type="button"
              className="flex items-center gap-1.5 cursor-pointer text-text-secondary hover:text-primary transition-colors duration-150 py-2 focus:outline-none"
              onClick={() => setLayananOpen(!layananOpen)}
              aria-expanded={layananOpen}
              aria-haspopup="true"
            >
              <span className="font-semibold text-sm">{t.nav.services}</span>
              <ChevronDownIcon
                className={`text-[10px] transition-transform duration-200 ${
                  layananOpen ? "rotate-180 text-primary" : ""
                }`}
              />
            </button>

            {/* Dropdown Container Ringkas 1 Kolom Vertikal */}
            {layananOpen && (
              <div className="absolute top-full left-0 w-72 rounded-xl bg-white border border-primary-light p-2 shadow-xl text-text-primary z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                {/* BAGIAN 1: KONSULTASI */}
                <div className="px-3.5 pt-1.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-text-secondary select-none">
                  {t.nav.consultationSection}
                </div>
                <Link
                  href="/layanan/akuntansi"
                  onClick={closeAllMenus}
                  className="block px-3.5 py-2 text-sm font-medium text-text-primary hover:text-primary hover:bg-surface rounded-lg transition-colors"
                >
                  Accounting Services
                </Link>
                <Link
                  href="/layanan/bisnis"
                  onClick={closeAllMenus}
                  className="block px-3.5 py-2 text-sm font-medium text-text-primary hover:text-primary hover:bg-surface rounded-lg transition-colors"
                >
                  Business &amp; Financial Services
                </Link>
                <Link
                  href="/layanan/tax-service"
                  onClick={closeAllMenus}
                  className="block px-3.5 py-2 text-sm font-medium text-text-primary hover:text-primary hover:bg-surface rounded-lg transition-colors"
                >
                  Tax Services
                </Link>
                <Link
                  href="/layanan/hukum"
                  onClick={closeAllMenus}
                  className="block px-3.5 py-2 text-sm font-medium text-text-primary hover:text-primary hover:bg-surface rounded-lg transition-colors"
                >
                  Law Services
                </Link>

                {/* Garis pemisah halus / divider tipis */}
                <hr className="my-2 border-gray-100" />

                {/* BAGIAN 2: TAX SERVICE CORE */}
                <div className="px-3.5 pt-1.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-text-secondary select-none">
                  {t.nav.taxCoreSection}
                </div>
                <Link
                  href="/layanan/tax-service#e-faktur"
                  onClick={closeAllMenus}
                  className="block px-3.5 py-2 text-sm font-medium text-text-primary hover:text-primary hover:bg-surface rounded-lg transition-colors"
                >
                  e-Faktur Pajak
                </Link>
                <Link
                  href="/layanan/tax-service#e-bupot-21"
                  onClick={closeAllMenus}
                  className="block px-3.5 py-2 text-sm font-medium text-text-primary hover:text-primary hover:bg-surface rounded-lg transition-colors"
                >
                  e-Bupot 21/26
                </Link>
                <Link
                  href="/layanan/tax-service#e-bupot-unifikasi"
                  onClick={closeAllMenus}
                  className="block px-3.5 py-2 text-sm font-medium text-text-primary hover:text-primary hover:bg-surface rounded-lg transition-colors"
                >
                  e-Bupot Unifikasi
                </Link>
                <Link
                  href="/layanan/tax-service#e-billing"
                  onClick={closeAllMenus}
                  className="block px-3.5 py-2 text-sm font-medium text-text-primary hover:text-primary hover:bg-surface rounded-lg transition-colors"
                >
                  e-Billing &amp; VSWP
                </Link>
                <Link
                  href="/layanan/tax-service#pelaporan-spt"
                  onClick={closeAllMenus}
                  className="block px-3.5 py-2 text-sm font-medium text-text-primary hover:text-primary hover:bg-surface rounded-lg transition-colors"
                >
                  Pelaporan SPT (BPE DJP)
                </Link>
                <Link
                  href="/layanan/tax-service#integrasi-api"
                  onClick={closeAllMenus}
                  className="block px-3.5 py-2 text-sm font-medium text-text-primary hover:text-primary hover:bg-surface rounded-lg transition-colors"
                >
                  Integrasi API Coretax
                </Link>
              </div>
            )}
          </div>

          {/* Peraturan Dropdown */}
          <div
            className="relative"
            ref={peraturanRef}
            onMouseEnter={() => setPeraturanOpen(true)}
            onMouseLeave={() => setPeraturanOpen(false)}
          >
            <button
              type="button"
              className="flex items-center gap-1.5 cursor-pointer text-text-secondary hover:text-primary transition-colors duration-150 py-2 focus:outline-none"
              onClick={() => setPeraturanOpen(!peraturanOpen)}
              aria-expanded={peraturanOpen}
              aria-haspopup="true"
            >
              <span className="font-semibold text-sm">{t.nav.regulations}</span>
              <ChevronDownIcon
                className={`text-[10px] transition-transform duration-200 ${
                  peraturanOpen ? "rotate-180 text-primary" : ""
                }`}
              />
            </button>

            {peraturanOpen && (
              <div className="absolute top-full left-0 w-52 rounded-xl bg-white border border-primary-light py-2 px-1.5 shadow-xl text-text-primary z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <Link
                  href="/peraturan"
                  onClick={closeAllMenus}
                  className="block px-3.5 py-2.5 text-sm font-medium text-text-primary hover:text-primary hover:bg-surface rounded-lg transition-colors"
                >
                  {t.nav.regulations}
                </Link>
                <Link
                  href="/peraturan#kurs-pajak"
                  onClick={closeAllMenus}
                  className="block px-3.5 py-2.5 text-sm font-medium text-text-primary hover:text-primary hover:bg-surface rounded-lg transition-colors"
                >
                  Kurs Pajak
                </Link>
                <Link
                  href="/peraturan#unduh-peraturan"
                  onClick={closeAllMenus}
                  className="block px-3.5 py-2.5 text-sm font-medium text-text-primary hover:text-primary hover:bg-surface rounded-lg transition-colors"
                >
                  Unduh Peraturan
                </Link>
              </div>
            )}
          </div>

          {/* Edukasi Pajak Dropdown */}
          <div
            className="relative"
            ref={edukasiRef}
            onMouseEnter={() => setEdukasiOpen(true)}
            onMouseLeave={() => setEdukasiOpen(false)}
          >
            <button
              type="button"
              className="flex items-center gap-1.5 cursor-pointer text-text-secondary hover:text-primary transition-colors duration-150 py-2 focus:outline-none"
              onClick={() => setEdukasiOpen(!edukasiOpen)}
              aria-expanded={edukasiOpen}
              aria-haspopup="true"
            >
              <span className="font-semibold text-sm">{t.nav.education}</span>
              <ChevronDownIcon
                className={`text-[10px] transition-transform duration-200 ${
                  edukasiOpen ? "rotate-180 text-primary" : ""
                }`}
              />
            </button>

            {edukasiOpen && (
              <div className="absolute top-full left-0 w-64 rounded-xl bg-white border border-primary-light py-2 px-1.5 shadow-xl text-text-primary z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <Link
                  href="/edukasi?tab=edukasi-zhou"
                  onClick={closeAllMenus}
                  className="block px-3.5 py-2.5 text-sm font-medium text-text-primary hover:text-primary hover:bg-surface rounded-lg transition-colors"
                >
                  {t.nav.educationZhou}
                </Link>
                <Link
                  href="/edukasi?tab=belajar-pajak"
                  onClick={closeAllMenus}
                  className="block px-3.5 py-2.5 text-sm font-medium text-text-primary hover:text-primary hover:bg-surface rounded-lg transition-colors"
                >
                  {t.nav.belajarPajak}
                </Link>
              </div>
            )}
          </div>

          <Link
            href="/kontak"
            className="text-text-secondary hover:text-primary transition-colors duration-150 py-2"
          >
            {t.nav.contact}
          </Link>
          <Link
            href="/karir"
            className="text-text-secondary hover:text-primary transition-colors duration-150 py-2"
          >
            {t.nav.career}
          </Link>
        </nav>

        {/* Desktop Header Actions (Language Switcher & Auth Buttons) */}
        <div className="hidden xl:flex items-center gap-5">
          {/* Language Switcher */}
          <div className="flex items-center gap-1.5 text-xs select-none">
            <button
              type="button"
              onClick={() => setLanguage("ID")}
              className={`transition-colors cursor-pointer ${
                language === "ID"
                  ? "font-bold text-primary"
                  : "text-text-secondary hover:text-primary font-medium"
              }`}
            >
              ID
            </button>
            <span className="text-silver/60">|</span>
            <button
              type="button"
              onClick={() => setLanguage("EN")}
              className={`transition-colors cursor-pointer ${
                language === "EN"
                  ? "font-bold text-primary"
                  : "text-text-secondary hover:text-primary font-medium"
              }`}
            >
              EN
            </button>
          </div>

          {/* Action Buttons: Masuk & Daftar OR Role-Based Portal, Profil & Logout */}
          <div className="flex items-center gap-2">
            {isAuthenticated && user ? (
              <>
                {user.role === "superadmin" ? (
                  <Button
                    variant="primary"
                    size="sm"
                    asChild
                    className="bg-primary hover:bg-primary-dark text-white font-semibold text-xs tracking-wide px-3.5 py-2 rounded-md shadow-xs transition-colors"
                  >
                    <Link href="/dashboard/superadmin">Superadmin Portal</Link>
                  </Button>
                ) : user.role === "admin" ? (
                  <Button
                    variant="primary"
                    size="sm"
                    asChild
                    className="bg-primary hover:bg-primary-dark text-white font-semibold text-xs tracking-wide px-3.5 py-2 rounded-md shadow-xs transition-colors"
                  >
                    <Link href="/dashboard/admin">Admin Portal</Link>
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    asChild
                    className="bg-primary hover:bg-primary-dark text-white font-semibold text-xs tracking-wide px-3.5 py-2 rounded-md shadow-xs transition-colors"
                  >
                    <Link href="/dashboard/user">Dashboard Saya</Link>
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="h-8 w-8 p-0 rounded-lg border-primary-light text-text-secondary hover:text-primary hover:border-primary hover:bg-surface transition-colors shrink-0"
                  title="Profil Pengguna"
                  aria-label="Profil Pengguna"
                >
                  <Link
                    href={
                      user.role === "superadmin"
                        ? "/dashboard/superadmin/users"
                        : user.role === "admin"
                        ? "/dashboard/admin?section=company"
                        : "/dashboard/user/profil"
                    }
                  >
                    <UserIcon className="text-xs" />
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={logout}
                  className="h-8 w-8 p-0 rounded-lg border-primary-light text-text-secondary hover:text-error hover:border-error/40 hover:bg-error/5 transition-colors cursor-pointer shrink-0"
                  title="Keluar / Logout"
                  aria-label="Keluar / Logout"
                >
                  <LogoutIcon className="text-xs" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="border-primary-light text-primary hover:bg-surface font-semibold text-xs tracking-wide px-4 py-2 rounded-md transition-colors"
                >
                  <Link href="/login">{t.nav.login}</Link>
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  asChild
                  className="bg-primary hover:bg-primary-dark text-white font-semibold text-xs tracking-wide px-4 py-2 rounded-md shadow-xs transition-colors"
                >
                  <Link href="/register">{t.nav.register}</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Mobile / Tablet Hamburger & Actions */}
        <div className="flex xl:hidden items-center gap-2">
          <div className="flex items-center gap-1 text-xs font-semibold mr-1">
            <button
              type="button"
              onClick={() => setLanguage("ID")}
              className={`${language === "ID" ? "font-bold text-primary" : "text-text-secondary"}`}
            >
              ID
            </button>
            <span className="text-silver/60">|</span>
            <button
              type="button"
              onClick={() => setLanguage("EN")}
              className={`${language === "EN" ? "font-bold text-primary" : "text-text-secondary"}`}
            >
              EN
            </button>
          </div>

          {isAuthenticated && user ? (
            <Button
              variant="primary"
              size="sm"
              asChild
              className="text-xs font-semibold px-2.5 py-1.5 bg-primary text-white"
            >
              <Link
                href={
                  user.role === "superadmin"
                    ? "/dashboard/superadmin"
                    : user.role === "admin"
                    ? "/dashboard/admin"
                    : "/dashboard/user"
                }
              >
                {user.role === "superadmin"
                  ? "Superadmin Portal"
                  : user.role === "admin"
                  ? "Admin Portal"
                  : "Dashboard Saya"}
              </Link>
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="text-xs font-semibold px-2.5 py-1.5 border-primary-light text-primary"
              >
                <Link href="/login">{t.nav.login}</Link>
              </Button>
              <Button
                variant="primary"
                size="sm"
                asChild
                className="text-xs font-semibold px-2.5 py-1.5 bg-primary text-white"
              >
                <Link href="/register">{t.nav.register}</Link>
              </Button>
            </>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-text-primary hover:text-primary focus:outline-none focus:ring-1 focus:ring-primary-light rounded-md"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <CloseIcon className="text-xl" />
            ) : (
              <MenuIcon className="text-xl" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile / Tablet Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-primary-light bg-white px-4 py-6 space-y-4 shadow-xl max-h-[85vh] overflow-y-auto">
          <div className="flex flex-col space-y-2 text-sm font-semibold">
            <Link
              href="/"
              onClick={closeAllMenus}
              className={`py-2.5 px-3 rounded-md transition-colors ${
                isHome
                  ? "text-primary font-bold bg-surface"
                  : "text-text-primary hover:bg-surface"
              }`}
            >
              {t.nav.home}
            </Link>

            {/* Unified Mobile Layanan Accordion */}
            <div className="border border-primary-light rounded-xl overflow-hidden bg-white shadow-xs">
              <button
                type="button"
                onClick={() => setMobileLayananOpen(!mobileLayananOpen)}
                className="w-full flex items-center justify-between py-3 px-3.5 bg-surface text-text-primary transition-colors text-left font-bold"
              >
                <span>{t.nav.services}</span>
                <ChevronDownIcon
                  className={`text-xs transition-transform duration-200 ${
                    mobileLayananOpen ? "rotate-180 text-primary" : ""
                  }`}
                />
              </button>

              {mobileLayananOpen && (
                <div className="p-2 space-y-1 bg-white border-t border-primary-light text-xs">
                  {/* BAGIAN 1: KONSULTASI */}
                  <div className="px-2.5 pt-1.5 pb-0.5 text-[10px] font-bold uppercase tracking-wider text-text-secondary select-none">
                    {t.nav.consultationSection}
                  </div>
                  <Link
                    href="/layanan/akuntansi"
                    onClick={closeAllMenus}
                    className="block py-2 px-2.5 rounded hover:bg-surface text-text-secondary hover:text-primary font-medium"
                  >
                    Accounting Services
                  </Link>
                  <Link
                    href="/layanan/bisnis"
                    onClick={closeAllMenus}
                    className="block py-2 px-2.5 rounded hover:bg-surface text-text-secondary hover:text-primary font-medium"
                  >
                    Business &amp; Financial Services
                  </Link>
                  <Link
                    href="/layanan/tax-service"
                    onClick={closeAllMenus}
                    className="block py-2 px-2.5 rounded hover:bg-surface text-text-secondary hover:text-primary font-medium"
                  >
                    Tax Services
                  </Link>
                  <Link
                    href="/layanan/hukum"
                    onClick={closeAllMenus}
                    className="block py-2 px-2.5 rounded hover:bg-surface text-text-secondary hover:text-primary font-medium"
                  >
                    Law Services
                  </Link>

                  {/* Garis pemisah halus */}
                  <hr className="my-2 border-gray-100" />

                  {/* BAGIAN 2: TAX SERVICE CORE */}
                  <div className="px-2.5 pt-1.5 pb-0.5 text-[10px] font-bold uppercase tracking-wider text-text-secondary select-none">
                    {t.nav.taxCoreSection}
                  </div>
                  <Link
                    href="/layanan/tax-service#e-faktur"
                    onClick={closeAllMenus}
                    className="block py-2 px-2.5 rounded hover:bg-surface text-text-secondary hover:text-primary font-medium"
                  >
                    e-Faktur Pajak
                  </Link>
                  <Link
                    href="/layanan/tax-service#e-bupot-21"
                    onClick={closeAllMenus}
                    className="block py-2 px-2.5 rounded hover:bg-surface text-text-secondary hover:text-primary font-medium"
                  >
                    e-Bupot 21/26
                  </Link>
                  <Link
                    href="/layanan/tax-service#e-bupot-unifikasi"
                    onClick={closeAllMenus}
                    className="block py-2 px-2.5 rounded hover:bg-surface text-text-secondary hover:text-primary font-medium"
                  >
                    e-Bupot Unifikasi
                  </Link>
                  <Link
                    href="/layanan/tax-service#e-billing"
                    onClick={closeAllMenus}
                    className="block py-2 px-2.5 rounded hover:bg-surface text-text-secondary hover:text-primary font-medium"
                  >
                    e-Billing &amp; VSWP
                  </Link>
                  <Link
                    href="/layanan/tax-service#pelaporan-spt"
                    onClick={closeAllMenus}
                    className="block py-2 px-2.5 rounded hover:bg-surface text-text-secondary hover:text-primary font-medium"
                  >
                    Pelaporan SPT (BPE DJP)
                  </Link>
                  <Link
                    href="/layanan/tax-service#integrasi-api"
                    onClick={closeAllMenus}
                    className="block py-2 px-2.5 rounded hover:bg-surface text-text-secondary hover:text-primary font-medium"
                  >
                    Integrasi API Coretax
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Peraturan Accordion */}
            <div className="border border-primary-light rounded-xl overflow-hidden bg-white shadow-xs">
              <button
                type="button"
                onClick={() => setMobilePeraturanOpen(!mobilePeraturanOpen)}
                className="w-full flex items-center justify-between py-3 px-3.5 bg-surface text-text-primary transition-colors text-left font-bold"
              >
                <span>{t.nav.regulations}</span>
                <ChevronDownIcon
                  className={`text-xs transition-transform duration-200 ${
                    mobilePeraturanOpen ? "rotate-180 text-primary" : ""
                  }`}
                />
              </button>

              {mobilePeraturanOpen && (
                <div className="p-3.5 space-y-1 bg-white border-t border-primary-light text-xs">
                  <Link
                    href="/peraturan"
                    onClick={closeAllMenus}
                    className="block py-2 px-2.5 rounded hover:bg-surface text-text-secondary hover:text-primary font-medium"
                  >
                    {t.nav.regulations}
                  </Link>
                  <Link
                    href="/peraturan#kurs-pajak"
                    onClick={closeAllMenus}
                    className="block py-2 px-2.5 rounded hover:bg-surface text-text-secondary hover:text-primary font-medium"
                  >
                    Kurs Pajak
                  </Link>
                  <Link
                    href="/peraturan#unduh-peraturan"
                    onClick={closeAllMenus}
                    className="block py-2 px-2.5 rounded hover:bg-surface text-text-secondary hover:text-primary font-medium"
                  >
                    Unduh Peraturan
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Edukasi Pajak Accordion */}
            <div className="border border-primary-light rounded-xl overflow-hidden bg-white shadow-xs">
              <button
                type="button"
                onClick={() => setMobileEdukasiOpen(!mobileEdukasiOpen)}
                className="w-full flex items-center justify-between py-3 px-3.5 bg-surface text-text-primary transition-colors text-left font-bold"
              >
                <span>{t.nav.education}</span>
                <ChevronDownIcon
                  className={`text-xs transition-transform duration-200 ${
                    mobileEdukasiOpen ? "rotate-180 text-primary" : ""
                  }`}
                />
              </button>

              {mobileEdukasiOpen && (
                <div className="p-3.5 space-y-1 bg-white border-t border-primary-light text-xs">
                  <Link
                    href="/edukasi?tab=edukasi-zhou"
                    onClick={closeAllMenus}
                    className="block py-2 px-2.5 rounded hover:bg-surface text-text-secondary hover:text-primary font-medium"
                  >
                    {t.nav.educationZhou}
                  </Link>
                  <Link
                    href="/edukasi?tab=belajar-pajak"
                    onClick={closeAllMenus}
                    className="block py-2 px-2.5 rounded hover:bg-surface text-text-secondary hover:text-primary font-medium"
                  >
                    {t.nav.belajarPajak}
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/kontak"
              onClick={closeAllMenus}
              className="py-2.5 px-3 rounded-md text-text-primary hover:bg-surface transition-colors"
            >
              {t.nav.contact}
            </Link>
            <Link
              href="/karir"
              onClick={closeAllMenus}
              className="py-2.5 px-3 rounded-md text-text-primary hover:bg-surface transition-colors"
            >
              {t.nav.career}
            </Link>
          </div>

          <div className="pt-4 border-t border-primary-light flex flex-col gap-2.5">
            {isAuthenticated && user ? (
              <>
                <div className="px-3 py-2 rounded-lg bg-surface text-xs text-text-secondary flex items-center justify-between">
                  <span className="font-semibold text-text-primary truncate">{user.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-primary/10 text-primary">
                    {user.role === "superadmin"
                      ? "Superadmin"
                      : user.role === "admin"
                      ? "Staff Admin"
                      : "Klien"}
                  </span>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  asChild
                  className="w-full font-semibold text-xs justify-center bg-primary hover:bg-primary-dark text-white"
                  onClick={closeAllMenus}
                >
                  <Link
                    href={
                      user.role === "superadmin"
                        ? "/dashboard/superadmin"
                        : user.role === "admin"
                        ? "/dashboard/admin"
                        : "/dashboard/user"
                    }
                  >
                    {user.role === "superadmin"
                      ? "Superadmin Portal"
                      : user.role === "admin"
                      ? "Admin Portal"
                      : "Dashboard Saya"}
                  </Link>
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="default"
                    asChild
                    className="w-full font-semibold text-xs justify-center border-primary-light text-text-primary hover:bg-surface gap-1.5"
                    onClick={closeAllMenus}
                  >
                    <Link
                      href={
                        user.role === "superadmin"
                          ? "/dashboard/superadmin/users"
                          : user.role === "admin"
                          ? "/dashboard/admin?section=company"
                          : "/dashboard/user/profil"
                      }
                    >
                      <UserIcon className="text-xs" />
                      <span>Profil</span>
                    </Link>
                  </Button>

                  <Button
                    variant="outline"
                    size="default"
                    type="button"
                    onClick={() => {
                      closeAllMenus();
                      logout();
                    }}
                    className="w-full font-semibold text-xs justify-center border-error/30 text-error hover:bg-error/10 cursor-pointer gap-1.5"
                  >
                    <LogoutIcon className="text-xs" />
                    <span>Logout</span>
                  </Button>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="w-full font-semibold text-sm justify-center border-primary-light text-primary hover:bg-surface"
                  onClick={closeAllMenus}
                >
                  <Link href="/login">{t.nav.login}</Link>
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  asChild
                  className="w-full font-semibold text-sm justify-center bg-primary hover:bg-primary-dark text-white"
                  onClick={closeAllMenus}
                >
                  <Link href="/register">{t.nav.register}</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
