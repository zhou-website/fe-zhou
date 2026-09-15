"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ChevronDownIcon,
  MenuIcon,
  CloseIcon,
  ShieldTaxIcon,
  BriefcaseIcon,
  BookIcon,
  ArrowRightIcon,
} from "@/components/icons";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setServicesDropdownOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setServicesDropdownOpen(false);
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

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setMobileServicesOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-primary/95 backdrop-blur-md text-white shadow-md border-b border-white/10 transition-colors">
      <div className="container-custom flex h-20 items-center justify-between py-4">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 group"
          onClick={closeMobileMenu}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-primary font-bold text-xl tracking-wider shadow-sm group-hover:bg-primary-light transition-colors">
            Z
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-bold tracking-tight text-white group-hover:text-primary-light transition-colors">
              ZHOU CONSULTING
            </span>
            <span className="text-[10px] sm:text-[11px] text-silver tracking-wide uppercase font-medium">
              Finance &bull; Accounting &bull; Tax Partner
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold">
          <Link
            href="/#profil"
            className="text-silver hover:text-white transition-colors duration-150 py-2"
          >
            Profil Perusahaan
          </Link>

          {/* Layanan with Interactive Dropdown */}
          <div
            className="relative"
            ref={dropdownRef}
            onMouseEnter={() => setServicesDropdownOpen(true)}
            onMouseLeave={() => setServicesDropdownOpen(false)}
          >
            <div className="flex items-center gap-1.5 cursor-pointer text-silver hover:text-white transition-colors duration-150 py-2">
              <Link href="/#layanan" className="hover:text-white">
                Layanan
              </Link>
              <button
                type="button"
                onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
                className="p-1 focus:outline-none"
                aria-label="Toggle Layanan dropdown"
                aria-expanded={servicesDropdownOpen}
              >
                <ChevronDownIcon
                  className={`text-[10px] transition-transform duration-200 ${
                    servicesDropdownOpen ? "rotate-180 text-white" : ""
                  }`}
                />
              </button>
            </div>

            {/* Dropdown Menu Card */}
            {servicesDropdownOpen && (
              <div className="absolute top-full left-0 w-80 rounded-lg bg-primary-dark border border-white/15 p-4 shadow-xl text-white space-y-3 z-50 animate-in fade-in duration-150">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-silver pb-1.5 border-b border-white/10">
                    Konsultasi
                  </div>
                  <div className="mt-2 space-y-1.5">
                    <Link
                      href="/#layanan-hukum"
                      onClick={() => setServicesDropdownOpen(false)}
                      className="group/item flex items-center justify-between p-2 rounded-md hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <BriefcaseIcon className="text-xs text-silver group-hover/item:text-white" />
                        <div>
                          <div className="text-xs font-semibold text-white">
                            Konsultasi Hukum
                          </div>
                          <div className="text-[10px] text-silver">
                            Compliance hukum korporat &amp; kontrak
                          </div>
                        </div>
                      </div>
                      <ArrowRightIcon className="text-[10px] text-silver opacity-0 group-hover/item:opacity-100 transition-opacity" />
                    </Link>

                    <Link
                      href="/#layanan-bisnis"
                      onClick={() => setServicesDropdownOpen(false)}
                      className="group/item flex items-center justify-between p-2 rounded-md hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <BriefcaseIcon className="text-xs text-silver group-hover/item:text-white" />
                        <div>
                          <div className="text-xs font-semibold text-white">
                            Konsultasi Business
                          </div>
                          <div className="text-[10px] text-silver">
                            Studi kelayakan &amp; proyeksi kas
                          </div>
                        </div>
                      </div>
                      <ArrowRightIcon className="text-[10px] text-silver opacity-0 group-hover/item:opacity-100 transition-opacity" />
                    </Link>

                    <Link
                      href="/#layanan-akuntansi"
                      onClick={() => setServicesDropdownOpen(false)}
                      className="group/item flex items-center justify-between p-2 rounded-md hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <BookIcon className="text-xs text-silver group-hover/item:text-white" />
                        <div>
                          <div className="text-xs font-semibold text-white">
                            Accounting Service
                          </div>
                          <div className="text-[10px] text-silver">
                            Laporan keuangan berstandar SAK
                          </div>
                        </div>
                      </div>
                      <ArrowRightIcon className="text-[10px] text-silver opacity-0 group-hover/item:opacity-100 transition-opacity" />
                    </Link>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-silver pb-1.5 border-b border-white/10">
                    Tax Service
                  </div>
                  <div className="mt-2">
                    <Link
                      href="/#layanan-pajak"
                      onClick={() => setServicesDropdownOpen(false)}
                      className="group/item flex items-center justify-between p-2 rounded-md hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <ShieldTaxIcon className="text-xs text-success" />
                        <div>
                          <div className="text-xs font-semibold text-white">
                            Tax Service Core
                          </div>
                          <div className="text-[10px] text-silver">
                            SPT Masa/Tahunan &amp; Sistem Coretax DJP
                          </div>
                        </div>
                      </div>
                      <ArrowRightIcon className="text-[10px] text-silver opacity-0 group-hover/item:opacity-100 transition-opacity" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/#peraturan"
            className="text-silver hover:text-white transition-colors duration-150 py-2"
          >
            Peraturan
          </Link>
          <Link
            href="/#edukasi"
            className="text-silver hover:text-white transition-colors duration-150 py-2"
          >
            Edukasi
          </Link>
          <Link
            href="/#karir"
            className="text-silver hover:text-white transition-colors duration-150 py-2"
          >
            Karir
          </Link>
          <Link
            href="/#kontak"
            className="text-silver hover:text-white transition-colors duration-150 py-2"
          >
            Kontak
          </Link>
        </nav>

        {/* Desktop Header CTA Actions */}
        <div className="hidden lg:flex items-center gap-3">
          <Button
            variant="silver"
            size="sm"
            asChild
            className="font-semibold text-xs tracking-wide px-5"
          >
            <Link href="/login">Login</Link>
          </Button>
        </div>

        {/* Mobile / Tablet Hamburger Toggle */}
        <div className="flex lg:hidden items-center gap-2">
          <Button
            variant="silver"
            size="sm"
            asChild
            className="text-xs font-semibold px-3 py-1.5 mr-1"
          >
            <Link href="/login">Login</Link>
          </Button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 text-white hover:text-silver focus:outline-none focus:ring-1 focus:ring-silver/40 rounded-md"
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
        <div className="lg:hidden border-t border-white/10 bg-primary-dark px-4 py-6 space-y-4 shadow-2xl">
          <div className="flex flex-col space-y-2 text-sm font-semibold">
            <Link
              href="/#profil"
              onClick={closeMobileMenu}
              className="py-2.5 px-3 rounded-md text-silver hover:text-white hover:bg-white/5 transition-colors"
            >
              Profil Perusahaan
            </Link>

            {/* Mobile Layanan with Accordion */}
            <div>
              <button
                type="button"
                onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                className="w-full flex items-center justify-between py-2.5 px-3 rounded-md text-silver hover:text-white hover:bg-white/5 transition-colors"
              >
                <span>Layanan</span>
                <ChevronDownIcon
                  className={`text-xs transition-transform duration-200 ${
                    mobileServicesOpen ? "rotate-180 text-white" : ""
                  }`}
                />
              </button>

              {mobileServicesOpen && (
                <div className="pl-5 pr-2 py-2 space-y-1.5 bg-primary/60 rounded-md mt-1 border-l-2 border-silver/40">
                  <div className="text-[10px] font-bold text-silver uppercase tracking-wider pt-1">
                    Konsultasi
                  </div>
                  <Link
                    href="/#layanan-hukum"
                    onClick={closeMobileMenu}
                    className="block py-1.5 text-xs text-silver hover:text-white transition-colors"
                  >
                    &bull; Konsultasi Hukum
                  </Link>
                  <Link
                    href="/#layanan-bisnis"
                    onClick={closeMobileMenu}
                    className="block py-1.5 text-xs text-silver hover:text-white transition-colors"
                  >
                    &bull; Konsultasi Business
                  </Link>
                  <Link
                    href="/#layanan-akuntansi"
                    onClick={closeMobileMenu}
                    className="block py-1.5 text-xs text-silver hover:text-white transition-colors"
                  >
                    &bull; Accounting Service
                  </Link>

                  <div className="text-[10px] font-bold text-silver uppercase tracking-wider pt-2 border-t border-white/10">
                    Tax Service
                  </div>
                  <Link
                    href="/#layanan-pajak"
                    onClick={closeMobileMenu}
                    className="block py-1.5 text-xs text-silver hover:text-white transition-colors"
                  >
                    &bull; Tax Service Core
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/#peraturan"
              onClick={closeMobileMenu}
              className="py-2.5 px-3 rounded-md text-silver hover:text-white hover:bg-white/5 transition-colors"
            >
              Peraturan
            </Link>
            <Link
              href="/#edukasi"
              onClick={closeMobileMenu}
              className="py-2.5 px-3 rounded-md text-silver hover:text-white hover:bg-white/5 transition-colors"
            >
              Edukasi
            </Link>
            <Link
              href="/#karir"
              onClick={closeMobileMenu}
              className="py-2.5 px-3 rounded-md text-silver hover:text-white hover:bg-white/5 transition-colors"
            >
              Karir
            </Link>
            <Link
              href="/#kontak"
              onClick={closeMobileMenu}
              className="py-2.5 px-3 rounded-md text-silver hover:text-white hover:bg-white/5 transition-colors"
            >
              Kontak
            </Link>
          </div>

          <div className="pt-4 border-t border-white/10">
            <Button
              variant="silver"
              size="lg"
              asChild
              className="w-full font-semibold text-sm justify-center"
              onClick={closeMobileMenu}
            >
              <Link href="/login">Portal Login</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

