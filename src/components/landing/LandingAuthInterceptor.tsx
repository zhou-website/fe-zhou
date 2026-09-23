"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface LandingAuthInterceptorProps {
  children: React.ReactNode;
}

/**
 * LandingAuthInterceptor
 * Mengintersepsi klik pada tombol dan tautan di landing page:
 * Jika user BELUM login, sistem mengalihkan user ke halaman /login?redirect=<targetUrl>
 * Jika user SUDAH login, navigasi berjalan normal langsung ke halaman yang dituju.
 */
export function LandingAuthInterceptor({ children }: LandingAuthInterceptorProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const handleClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    // Jika user sudah terautentikasi (login), biarkan navigasi normal terjadi
    if (isAuthenticated) {
      return;
    }

    // Cari elemen interaktif terdekat (a atau button)
    const target = (e.target as HTMLElement).closest("a, button");
    if (!target) return;

    // 1. Intersepsi elemen Link / Anchor (<a>)
    if (target.tagName.toLowerCase() === "a") {
      const href = target.getAttribute("href");
      if (!href) return;

      // Pengecualian: link internal scroll anchor (# atau /#), external http/https/tel/mailto, dan halaman login/register
      if (
        href.startsWith("#") ||
        href.startsWith("/#") ||
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("/login") ||
        href.startsWith("/register")
      ) {
        return;
      }

      // Ini adalah link menuju halaman internal (/konsultasi, /layanan/*, /peraturan, /edukasi, /karir, dll.)
      e.preventDefault();
      e.stopPropagation();
      router.push(`/login?redirect=${encodeURIComponent(href)}`);
      return;
    }

    // 2. Intersepsi elemen Tombol (<button>)
    if (target.tagName.toLowerCase() === "button") {
      // Abaikan kontrol UI internal yang tidak berpindah halaman:
      // - Switch tab kategori
      // - Tombol ganti bahasa (ID | EN)
      // - Tombol toggle menu mobile (hamburger / close)
      // - Tombol close modal dialog
      const isTab =
        target.getAttribute("role") === "tab" ||
        Boolean(target.closest('[role="tablist"]'));
      const isLangSwitch =
        target.textContent?.trim() === "ID" ||
        target.textContent?.trim() === "EN";
      const isCloseBtn =
        target.getAttribute("aria-label")?.toLowerCase().includes("tutup") ||
        target.getAttribute("aria-label")?.toLowerCase().includes("close");
      const isMobileMenu =
        target.getAttribute("aria-label")?.toLowerCase().includes("menu");

      if (isTab || isLangSwitch || isCloseBtn || isMobileMenu) {
        return;
      }

      // Tombol aksi seperti "Lamar Posisi" di Karir atau "Selengkapnya" di Edukasi
      const btnText = target.textContent?.trim() || "";
      if (
        btnText.includes("Lamar Posisi") ||
        btnText.includes("Lamar Pekerjaan") ||
        btnText.includes("Selengkapnya")
      ) {
        e.preventDefault();
        e.stopPropagation();
        const targetPath = btnText.includes("Lamar") ? "/karir" : "/edukasi";
        router.push(`/login?redirect=${encodeURIComponent(targetPath)}`);
        return;
      }
    }
  };

  return (
    <div onClickCapture={handleClickCapture} className="contents">
      {children}
    </div>
  );
}
