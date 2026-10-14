"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { FloatingWhatsAppCTA } from "@/components/landing/FloatingWhatsAppCTA";
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
  WhatsappIcon,
} from "@/components/icons";
import {
  getStoredServices,
  SERVICES_EVENT,
} from "@/data/layananStorage";
import { isCmsItemDeleted } from "@/data/cmsDeletedStorage";

interface BusinessModuleItem {
  id: string;
  code: string;
  title: string;
  badge: string;
  subtitle: string;
  scopes: string[];
  deliverable: string;
  topicParam: string;
  waTemplate: string;
}

const BUSINESS_SERVICE_MODULES: BusinessModuleItem[] = [
  {
    id: "studi-kelayakan",
    code: "BIZ-FS",
    title: "Studi Kelayakan Bisnis & Feasibility Study",
    badge: "FEASIBILITY & MARKET ANALYSIS",
    subtitle: "Analisis komprehensif aspek pasar, teknis operasional, regulasi, dan finansial untuk peluncuran unit bisnis baru.",
    scopes: [
      "Riset pasar, analisis kompetitor, dan estimasi pangsa pasar potensial",
      "Perhitungan Capital Expenditure (CAPEX) dan Operational Expenditure (OPEX)",
      "Analisis kelayakan investasi: Net Present Value (NPV), Internal Rate of Return (IRR), dan Payback Period",
      "Penyusunan skenario sensitivitas bisnis (Best-case, Base-case, Worst-case)",
    ],
    deliverable: "Laporan Studi Kelayakan Bisnis Resmi, Model Finansial Excel Dinamis, & Executive Presentation.",
    topicParam: "studi-kelayakan",
    waTemplate: "Halo Zhou Consulting, saya ingin konsultasi mengenai Studi Kelayakan Bisnis (Feasibility Study) dan rencana investasi.",
  },
  {
    id: "financial-modeling",
    code: "BIZ-FM",
    title: "Financial Modeling & Proyeksi Finansial",
    badge: "PROYEKSI KEUANGAN 3-5 TAHUN",
    subtitle: "Pemodelan terintegrasi laporan laba rugi, neraca, dan arus kas dengan parameter variabel bisnis yang fleksibel.",
    scopes: [
      "Pemodelan tiga laporan keuangan (Three-Statement Financial Model)",
      "Simulasi pendapatan berbasis volume, harga, dan biaya variabel per unit",
      "Struktur permodalan (Debt vs Equity Financing) dan Weighted Average Cost of Capital (WACC)",
      "Analisis titik impas (Break-Even Point Analysis) per lini produk",
    ],
    deliverable: "Workbook Financial Model Interaktif Berbasis Excel & Manual Asumsi Finansial.",
    topicParam: "financial-modeling",
    waTemplate: "Halo Zhou Consulting, saya ingin konsultasi mengenai pembuatan Financial Modeling dan proyeksi arus kas perusahaan.",
  },
  {
    id: "valuasi-bisnis",
    code: "BIZ-VAL",
    title: "Valuasi Bisnis & Financial Due Diligence",
    badge: "VALUASI & DUE DILIGENCE",
    subtitle: "Penentuan estimasi nilai wajar entitas untuk merger, akuisisi, pendanaan ventura, atau kemitraan strategis.",
    scopes: [
      "Metodologi Discounted Cash Flow (DCF) dan Comparable Company Analysis (CCA)",
      "Analisis kualitas laba (Quality of Earnings / QoE) dan normalisasi EBITDA",
      "Identifikasi kewajiban kontinjensi, liabilitas tersembunyi, dan risiko pajak",
      "Penyusunan rekomendasi valuasi untuk negosiasi pemegang saham",
    ],
    deliverable: "Laporan Valuasi Perusahaan Independen, Dossier Financial Due Diligence, & Term Sheet Review.",
    topicParam: "valuasi-bisnis",
    waTemplate: "Halo Zhou Consulting, saya ingin konsultasi perihal Valuasi Bisnis dan Financial Due Diligence untuk aksi korporasi.",
  },
  {
    id: "restrukturisasi-cashflow",
    code: "BIZ-CASH",
    title: "Restrukturisasi Arus Kas & Manajemen Likuiditas",
    badge: "CASH FLOW OPTIMIZATION",
    subtitle: "Optimasi siklus konversi kas (Cash Conversion Cycle), penataan utang piutang, dan penyelamatan solvabilitas bisnis.",
    scopes: [
      "Diagnostik Cash Inflow & Outflow mingguan dan rolling forecast 13-pekan",
      "Restrukturisasi jadwal jatuh tempo utang perbankan dan vendor pihak ketiga",
      "Efisiensi manajemen piutang (Aging AR) dan negosiasi syarat pembayaran",
      "Protokol pengendalian pengeluaran darurat untuk perbaikan margin laba",
    ],
    deliverable: "Model 13-Week Cash Flow Forecast, Matriks Efisiensi Modal Kerja, & Rencana Aksi Solvabilitas.",
    topicParam: "restrukturisasi-cashflow",
    waTemplate: "Halo Zhou Consulting, saya ingin konsultasi mengenai restrukturisasi arus kas, likuiditas, dan efisiensi modal kerja.",
  },
];

export default function KonsultasiBisnisPage() {
  const waPhone = process.env.NEXT_PUBLIC_WA_PHONE || "6281234567890";
  const [extraModules, setExtraModules] = useState<BusinessModuleItem[]>([]);

  useEffect(() => {
    const syncModules = () => {
      const stored = getStoredServices();
      const customItems = stored.filter(
        (s) =>
          (s.categoryKey?.toLowerCase() === "bisnis" || s.categoryKey?.toLowerCase() === "fin") &&
          s.status === "Published" &&
          !isCmsItemDeleted(s.id, s.name, undefined, s.code) &&
          s.id !== "SRV-FIN-CONS"
      );
      setExtraModules(
        customItems.map((c) => ({
          id: c.id,
          code: c.code || c.id,
          title: c.name,
          badge: c.badge || "BUSINESS & FINANCIAL",
          subtitle: c.subtitle,
          scopes: c.pillars?.map((p) => p.title || p.description) || [
            "Konsultasi permodelan finansial dan analisis strategi bisnis",
            "Optimalisasi struktur permodalan dan mitigasi risiko usaha",
          ],
          deliverable: c.deliverables?.[0] || "Laporan Rekomendasi Finansial & Bisnis Resmi",
          topicParam: "bisnis",
          waTemplate: `Halo Zhou Consulting, saya ingin konsultasi mengenai layanan ${c.name}.`,
        }))
      );
    };

    syncModules();
    window.addEventListener(SERVICES_EVENT, syncModules);
    return () => window.removeEventListener(SERVICES_EVENT, syncModules);
  }, []);

  const visibleModules = [
    ...BUSINESS_SERVICE_MODULES.filter(
      (m) => !isCmsItemDeleted(m.id, m.title, undefined, m.code)
    ),
    ...extraModules,
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-text selection:bg-primary selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* 4 Core Business Services Cards Grid */}
        <section className="py-14 md:py-20 bg-white border-b border-primary-light">
          <div className="container-custom space-y-10">
            <div className="space-y-2 text-center md:text-left max-w-2xl">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary tracking-tight">
                Layanan Business &amp; Financial Services
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                Setiap modul dirancang menggunakan pendekatan kuantitatif berbasis data nyata untuk memandu keputusan strategis manajemen puncak.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {visibleModules.map((item) => (
                <Card
                  key={item.id}
                  id={item.id}
                  className="scroll-mt-24 rounded-2xl border-primary-light hover:border-primary hover:shadow-lg transition-all duration-200 bg-white flex flex-col justify-between"
                >
                  <CardHeader className="space-y-2.5 pb-3">
                    <div className="flex items-center justify-end">
                      <span className="text-[10px] font-mono font-semibold text-text-muted">
                        {item.code}
                      </span>
                    </div>
                    <CardTitle className="text-lg font-bold text-primary leading-snug">
                      {item.title}
                    </CardTitle>
                    <CardDescription className="text-xs text-text-secondary leading-relaxed">
                      {item.subtitle}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3.5 text-xs text-text-primary flex-1 pt-0">
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <span className="text-[11px] font-bold text-primary block">
                        Cakupan Layanan:
                      </span>
                      {item.scopes.map((scope, sIdx) => (
                        <div key={sIdx} className="flex items-start gap-2">
                          <CheckCircleIcon className="text-success text-xs flex-shrink-0 mt-0.5" />
                          <span className="leading-snug text-text-secondary text-[11px]">{scope}</span>
                        </div>
                      ))}
                    </div>

                    <div className="p-2.5 rounded-lg bg-surface border border-primary-light/70 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
                        Luaran / Deliverable:
                      </span>
                      <p className="text-[11px] text-primary font-medium leading-relaxed">
                        {item.deliverable}
                      </p>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-3 border-t border-primary-light">
                    <a
                      href={`https://wa.me/${waPhone}?text=${encodeURIComponent(item.waTemplate)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-emerald-600/30 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-semibold text-xs transition-colors"
                    >
                      <WhatsappIcon className="text-xs" />
                      <span>Konsultasi</span>
                    </a>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <FloatingWhatsAppCTA />
    </div>
  );
}
