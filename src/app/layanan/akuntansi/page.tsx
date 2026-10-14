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

interface AccountingModuleItem {
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

const ACCOUNTING_SERVICE_MODULES: AccountingModuleItem[] = [
  {
    id: "laporan-keuangan",
    code: "ACC-REP",
    title: "Penyusunan Laporan Keuangan SAK EP / PSAK",
    badge: "FINANCIAL STATEMENTS",
    subtitle: "Penyusunan laporan posisi keuangan (neraca), laba rugi, perubahan ekuitas, dan arus kas standar resmi perbankan & audit.",
    scopes: [
      "Penyusunan Laporan Posisi Keuangan (Neraca) komparatif multi-periode",
      "Penyusunan Laporan Laba Rugi dan Penghasilan Komprehensif Lain",
      "Laporan Arus Kas (Metode Langsung maupun Tidak Langsung) yang akurat",
      "Penyusunan Catatan atas Laporan Keuangan (CALK) standar perbankan dan investor",
    ],
    deliverable: "Bundel Laporan Keuangan Lengkap (Audit-ready / Bank-ready) beserta CALK resmi.",
    topicParam: "laporan-keuangan",
    waTemplate: "Halo Zhou Consulting, saya ingin konsultasi mengenai penyusunan Laporan Keuangan standar SAK EP/PSAK.",
  },
  {
    id: "penataan-coa",
    code: "ACC-COA",
    title: "Perancangan & Restrukturisasi Bagan Akun (COA)",
    badge: "CHART OF ACCOUNTS",
    subtitle: "Standardisasi struktur kode akun akuntansi yang selaras dengan pusat biaya, unit bisnis, dan pemetaan kewajiban perpajakan.",
    scopes: [
      "Penyusunan hierarki kode akun bertingkat (Header, Sub-akun, Cost Center)",
      "Sinkronisasi akun komersial dengan pos ekualisasi fiskal pelaporan DJP",
      "Penyusunan kamus akun (Account Dictionary) dan petunjuk teknis penjurnalan",
      "Migrasi saldo awal dari sistem pembukuan lama ke bagan akun baru terintegrasi",
    ],
    deliverable: "Master Chart of Accounts (COA) Terstandar & Panduan SOP Teknis Penjurnalan.",
    topicParam: "penataan-coa",
    waTemplate: "Halo Zhou Consulting, saya ingin konsultasi perihal penataan dan standardisasi Chart of Accounts (COA).",
  },
  {
    id: "rekonsiliasi-fiskal",
    code: "ACC-REC",
    title: "Rekonsiliasi Fiskal & Penyesuaian Akuntansi Pajak",
    badge: "FISCAL RECONCILIATION",
    subtitle: "Penyelarasan laba rugi komersial dengan peraturan perpajakan (beda tetap dan beda waktu) untuk pelaporan SPT Tahunan Badan.",
    scopes: [
      "Identifikasi koreksi fiskal positif & negatif (nontaxable income & non-deductible expense)",
      "Perhitungan penyusutan & amortisasi fiskal sesuai kelompok aset UU PPh",
      "Penentuan aset & liabilitas Pajak Tangguhan (Deferred Tax) PSAK 46",
      "Penyusunan Kertas Kerja Rekonsiliasi Fiskal teruji untuk lampiran SPT Badan",
    ],
    deliverable: "Kertas Kerja Rekonsiliasi Fiskal Komprehensif & Tabel Perhitungan Beda Waktu/Tetap.",
    topicParam: "rekonsiliasi-fiskal",
    waTemplate: "Halo Zhou Consulting, saya ingin konsultasi mengenai rekonsiliasi fiskal dan penyesuaian laba rugi komersial ke fiskal.",
  },
  {
    id: "pendampingan-audit",
    code: "ACC-ADT",
    title: "Pendampingan Audit Eksternal & Review Independen",
    badge: "AUDIT READINESS & ASSISTANCE",
    subtitle: "Penyiapan working papers, data konfirmasi perbankan/piutang, serta asistensi komunikasi teknis dengan KAP auditor eksternal.",
    scopes: [
      "Penyusunan Lead Schedule dan Kertas Kerja Audit (Working Papers)",
      "Pengelolaan surat konfirmasi bank, piutang debitur, dan utang pemasok",
      "Klarifikasi teknis sampling transaksi terhadap pertanyaan auditor independen",
      "Review draft laporan auditor independen (LAI) sebelum penandatanganan final",
    ],
    deliverable: "Audit Readiness Dossier, Kertas Kerja Pendukung Lengkap, & Notulensi Asistensi Audit.",
    topicParam: "pendampingan-audit",
    waTemplate: "Halo Zhou Consulting, saya ingin konsultasi mengenai pendampingan audit eksternal KAP dan penyiapan working papers.",
  },
];

export default function AccountingServicePage() {
  const waPhone = process.env.NEXT_PUBLIC_WA_PHONE || "6281234567890";
  const [extraModules, setExtraModules] = useState<AccountingModuleItem[]>([]);

  useEffect(() => {
    const syncModules = () => {
      const stored = getStoredServices();
      const customItems = stored.filter(
        (s) =>
          s.categoryKey?.toLowerCase() === "akuntansi" &&
          s.status === "Published" &&
          !isCmsItemDeleted(s.id, s.name, undefined, s.code) &&
          s.id !== "SRV-ACC-SERV"
      );
      setExtraModules(
        customItems.map((c) => ({
          id: c.id,
          code: c.code || c.id,
          title: c.name,
          badge: c.badge || "ACCOUNTING SERVICES",
          subtitle: c.subtitle,
          scopes: c.pillars?.map((p) => p.title || p.description) || [
            "Konsultasi dan asistensi pembukuan berstandar SAK",
            "Penyelarasan laporan komersial dan kepatuhan perpajakan",
          ],
          deliverable: c.deliverables?.[0] || "Laporan & Rekomendasi Akuntansi Resmi",
          topicParam: "akuntansi",
          waTemplate: `Halo Zhou Consulting, saya ingin konsultasi mengenai layanan ${c.name}.`,
        }))
      );
    };

    syncModules();
    window.addEventListener(SERVICES_EVENT, syncModules);
    return () => window.removeEventListener(SERVICES_EVENT, syncModules);
  }, []);

  const visibleModules = [
    ...ACCOUNTING_SERVICE_MODULES.filter(
      (m) => !isCmsItemDeleted(m.id, m.title, undefined, m.code)
    ),
    ...extraModules,
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-text selection:bg-primary selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* 5 Core Accounting Services Cards Grid */}
        <section className="py-14 md:py-20 bg-white border-b border-primary-light">
          <div className="container-custom space-y-10">
            <div className="space-y-2 text-center md:text-left max-w-2xl">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary tracking-tight">
                Layanan Accounting Services Zhou Consulting
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                Setiap modul dirancang untuk menjamin integritas catatan finansial, kepatuhan standar SAK EP/PSAK, dan kesiapan menghadapi audit eksternal.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
