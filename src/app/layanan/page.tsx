"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { FloatingWhatsAppCTA } from "@/components/landing/FloatingWhatsAppCTA";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  CheckCircleIcon,
  BookIcon,
  ShieldTaxIcon,
  ArrowRightIcon,
} from "@/components/icons";

interface ServiceCardItem {
  id: string;
  category: "akuntansi" | "pajak" | "bisnis" | "hukum";
  badge: string;
  title: string;
  desc: string;
  features: string[];
  href: string;
  accent: string;
}

const SERVICES_LIST: ServiceCardItem[] = [
  {
    id: "akuntansi",
    category: "akuntansi",
    badge: "SAK EP / IFRS",
    title: "Accounting Services",
    desc: "Penyusunan pembukuan presisi, jurnal periodik, dan laporan keuangan komprehensif berstandar SAK Entitas Privat dan IFRS.",
    features: [
      "Kompilasi Neraca, Laba Rugi & Arus Kas",
      "Rekonsiliasi Bank Bulanan & Petty Cash",
      "Penyusunan Catatan atas Laporan Keuangan (CALK)",
      "Pendampingan Audit Eksternal KAP",
    ],
    href: "/layanan/akuntansi",
    accent: "text-primary",
  },
  {
    id: "pajak",
    category: "pajak",
    badge: "BKP Terdaftar & Coretax",
    title: "Tax Consulting & Compliance",
    desc: "Perencanaan pajak terukur, pelaporan SPT Masa/Tahunan terpadu, dan kepatuhan penuh ekosistem Coretax DJP.",
    features: [
      "Pelaporan SPT Masa PPh & PPN terintegrasi",
      "e-Faktur, e-Bupot 21/26 & Unifikasi",
      "Pendampingan SP2DK & Pemeriksaan Pajak DJP",
      "Review Ekualisasi Peredaran Usaha & Biaya",
    ],
    href: "/layanan/tax-service",
    accent: "text-primary",
  },
  {
    id: "bisnis",
    category: "bisnis",
    badge: "Advisory & Restrukturisasi",
    title: "Business & Financial Advisory",
    desc: "Studi kelayakan finansial, analisis restrukturisasi utang modal kerja, serta optimalisasi cash flow korporat.",
    features: [
      "Financial Due Diligence & Valuasi Bisnis",
      "Perencanaan Arus Kas (Cash Flow Forecasting)",
      "Advisory Tata Kelola Finansial Perusahaan",
      "Restrukturisasi Permodalan & Pembiayaan",
    ],
    href: "/layanan/bisnis",
    accent: "text-primary",
  },
  {
    id: "hukum",
    category: "hukum",
    badge: "Advokat PERADI",
    title: "Legal & Corporate Law",
    desc: "Penyusunan perjanjian komersial, perizinan berusaha OSS RBA, dan mitigasi risiko sengketa perdata bisnis.",
    features: [
      "Review & Drafting Kontrak Komersial / NDA",
      "Legal Compliance & Perizinan OSS Berbasis Risiko",
      "Pendampingan Hukum Sengketa Bisnis",
      "Advisory Struktur Holding & Merger",
    ],
    href: "/layanan/hukum",
    accent: "text-primary",
  },
  {
    id: "coretax",
    category: "pajak",
    badge: "Sistem Terpadu DJP",
    title: "Coretax Implementation & Support",
    desc: "Asistensi komprehensif bagi perusahaan dalam adaptasi dan migrasi sistem perpajakan terbaru DJP Coretax.",
    features: [
      "Pemetaan Modul Administrasi Coretax DJP",
      "Pelatihan Staf Akuntansi & Keuangan Klien",
      "Penyelarasan Data Master NPWP 16 Digit & NIK",
      "Uji Coba Simulator Pelaporan Faktur & Bukti Potong",
    ],
    href: "/layanan/coretax",
    accent: "text-primary",
  },
];

export default function LayananIndexPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredServices = SERVICES_LIST.filter((s) => {
    if (activeCategory === "all") return true;
    return s.category === activeCategory;
  });

  return (
    <div className="min-h-screen flex flex-col bg-surface text-text-primary selection:bg-primary-light selection:text-primary">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-primary text-white py-16 md:py-20 lg:py-24 border-b border-primary-dark relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
          <div className="container-custom relative z-10 space-y-6 text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold backdrop-blur-xs border border-white/20">
              <ShieldTaxIcon className="text-secondary" />
              <span>Katalog Layanan Profesional Terpadu</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
              Solusi Terpadu Akuntansi, Perpajakan &amp; Hukum Korporat
            </h1>
            <p className="text-sm sm:text-base text-gray-200 leading-relaxed max-w-2xl mx-auto">
              Didukung oleh Konsultan Pajak BKP, Akuntan Praktisi CA, dan Advokat Korporat PERADI berpengalaman untuk memastikan kepatuhan regulasi dan pertumbuhan bisnis Anda.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link href="/konsultasi">
                <Button variant="secondary" size="default" className="font-semibold shadow-md">
                  Jadwalkan Konsultasi Gratis
                </Button>
              </Link>
              <a
                href="https://wa.me/6281234567890?text=Halo%20Admin%20Zhou%20Consulting,%20saya%20ingin%20berkonsultasi%20mengenai%20layanan"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="default" className="bg-white/10 text-white border-white/30 hover:bg-white/20">
                  Hubungi via WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* Services Directory Section */}
        <section className="py-12 md:py-16">
          <div className="container-custom space-y-8">
            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 pb-4">
              {[
                { key: "all", label: "Semua Layanan" },
                { key: "akuntansi", label: "Akuntansi & Pembukuan" },
                { key: "pajak", label: "Perpajakan & Coretax" },
                { key: "bisnis", label: "Advisory Bisnis" },
                { key: "hukum", label: "Hukum Korporat" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveCategory(tab.key)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                    activeCategory === tab.key
                      ? "bg-primary text-white shadow-xs"
                      : "bg-white border border-primary-light text-text-secondary hover:text-primary hover:border-primary"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Service Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <Card
                  key={service.id}
                  className="bg-white border-primary-light hover:border-primary hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                >
                  <CardHeader className="space-y-3 pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="silver" size="sm">
                        {service.badge}
                      </Badge>
                      <BookIcon className="text-primary opacity-60 text-sm" />
                    </div>
                    <div>
                      <CardTitle className="text-base sm:text-lg font-bold text-primary">
                        {service.title}
                      </CardTitle>
                      <CardDescription className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                        {service.desc}
                      </CardDescription>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-2 text-xs text-text-primary flex-1 pt-0">
                    <div className="pt-2 border-t border-gray-100 space-y-2">
                      {service.features.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <CheckCircleIcon className="text-success text-xs flex-shrink-0 mt-0.5" />
                          <span className="leading-snug text-text-secondary">{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>

                  <CardFooter className="pt-3 border-t border-primary-light">
                    <Link href={service.href} className="w-full">
                      <Button variant="outline" size="sm" className="w-full text-xs font-semibold justify-between group">
                        <span>Lihat Detail Layanan</span>
                        <ArrowRightIcon className="text-[10px] group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Consultation Callout Banner */}
        <section className="py-12 bg-white border-t border-primary-light">
          <div className="container-custom">
            <div className="bg-surface rounded-2xl border border-primary-light p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left max-w-xl">
                <h3 className="text-lg sm:text-xl font-bold text-primary">
                  Butuh Konsultasi Kustom Sesuai Kebutuhan Bisnis Anda?
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  Diskusikan tantangan pembukuan, kepatuhan Coretax, atau audit perpajakan dengan konsultan ahli Zhou Consulting.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/konsultasi">
                  <Button variant="primary" size="default" className="font-semibold text-xs sm:text-sm shadow-xs">
                    Hubungi Konsultan Sekarang
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <FloatingWhatsAppCTA />
    </div>
  );
}
