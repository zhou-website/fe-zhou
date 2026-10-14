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

      // HANYA route internal privat (/dashboard/...) yang diarahkan ke login
      if (href.startsWith("/dashboard")) {
        e.preventDefault();
        e.stopPropagation();
        router.push(`/login?redirect=${encodeURIComponent(href)}`);
        return;
      }

      // Seluruh route publik (/, /layanan/*, /peraturan, /edukasi, /karir, /kontak, /konsultasi, external links, dll.)
      // dapat diakses secara bebas tanpa login.
      return;
    }

    // 2. Intersepsi elemen Tombol (<button>)
    // Semua tombol publik (modal lamaran, tabs, CTA WhatsApp, baca artikel) dapat diakses bebas tanpa login
    return;
  };

  return (
    <div onClickCapture={handleClickCapture} className="contents">
      {children}
    </div>
  );
}
