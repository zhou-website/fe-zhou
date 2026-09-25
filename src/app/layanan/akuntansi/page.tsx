"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { FloatingWhatsAppCTA } from "@/components/landing/FloatingWhatsAppCTA";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  BookIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  CheckIcon,
} from "@/components/icons";

export default function AccountingServicePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const serviceScopes = [
    {
      title: "Kompilasi Laporan Keuangan Standar SAK",
      desc: "Penyusunan laporan keuangan periodik (bulanan, kuartalan, tahunan) yang mengacu penuh pada Standar Akuntansi Keuangan (SAK Entitas Privat / ETAP / IFRS) untuk keperluan direksi, perbankan, dan pemegang saham.",
      points: [
        "Penyajian Laporan Posisi Keuangan (Neraca) secara terperinci",
        "Laporan Laba Rugi Komprehensif dan perhitungan margin operasional",
        "Laporan Arus Kas (Metode Langsung dan Tidak Langsung)",
        "Penyusunan Catatan atas Laporan Keuangan (CALK) resmi",
      ],
    },
    {
      title: "Pembukuan & Rekonsiliasi Kas/Bank Bulanan",
      desc: "Penatausahaan transaksi harian perusahaan secara tertib dan akurat, mencakup pencatatan bukti pengeluaran kas/bank, penagihan piutang, dan pencocokan mutasi rekening koran perbankan.",
      points: [
        "Pencatatan jurnal transaksi harian berbasis double-entry bookkeeping",
        "Penyusunan rekonsiliasi bank dan verifikasi selisih mutasi kas",
        "Pemantauan saldo kas kecil (Petty Cash) dan kontrol bukti kas keluar",
        "Jadwal umur piutang dan utang dagang (Aging Schedule Report)",
      ],
    },
    {
      title: "Review & Penataan Bagan Akun (Chart of Accounts / COA)",
      desc: "Standardisasi dan rekonstruksi struktur bagan akun perusahaan agar selaras dengan model bisnis operasional serta terintegrasi langsung dengan klasifikasi akun fiskal perpajakan nasional.",
      points: [
        "Evaluasi bagan akun eksisting dan eliminasi akun redundan",
        "Penyusunan struktur COA hierarkis multi-departemen/cabang usaha",
        "Standardisasi mapping akun akuntansi ke format SPT Tahunan Badan",
        "Penyusunan buku pedoman kebijakan akuntansi (Accounting Manual)",
      ],
    },
    {
      title: "Pendampingan Pemeriksaan & Audit Eksternal KAP",
      desc: "Dukungan profesional dalam mempersiapkan seluruh kertas kerja pemeriksaan, bukti transaksi, dan pendampingan teknis menghadapi auditor independen dari Kantor Akuntan Publik (KAP).",
      points: [
        "Penyusunan berkas Audit Working Paper (kertas kerja audit) lengkap",
        "Penyesuaian jurnal audit (Audit Adjusting Entries) yang disepakati",
        "Fasilitasi konfirmasi saldo piutang, utang, dan perbankan",
        "Pendampingan langsung sesi tanya jawab klarifikasi teknis auditor",
      ],
    },
  ];

  const workflowSteps = [
    {
      step: "01",
      title: "Setup Bagan Akun & Integrasi Data",
      desc: "Evaluasi sistem pencatatan eksisting, standardisasi bagan akun (COA), dan pengumpulan seluruh dokumen bukti transaksi perusahaan.",
    },
    {
      step: "02",
      title: "Posting Jurnal & Rekonsiliasi",
      desc: "Pencatatan jurnal transaksi harian, verifikasi dokumen pendukung, dan pencocokan saldo kas/bank dengan mutasi rekening koran.",
    },
    {
      step: "03",
      title: "Trial Balance & Penyesuaian SAK",
      desc: "Penyusunan neraca saldo percobaan, kalkulasi penyusutan aset tetap, penyesuaian akrual, dan verifikasi kepatuhan terhadap SAK.",
    },
    {
      step: "04",
      title: "Penerbitan Laporan & Briefing",
      desc: "Penerbitan berkas laporan keuangan final lengkap (Neraca, Laba Rugi, CALK) serta pemaparan ringkasan rasio keuangan kepada manajemen.",
    },
  ];

  const deliverables = [
    "Laporan Keuangan Lengkap Standar SAK (Neraca, Laba Rugi, Arus Kas, Perubahan Ekuitas, & CALK)",
    "Kertas Kerja Buku Besar (General Ledger) & Jurnal Penyesuaian (Adjusting Entries) Terverifikasi",
    "Laporan Rekonsiliasi Bank Bulanan & Lembar Jadwal Umur Piutang/Utang (Aging Schedule)",
    "Executive Briefing Ringkasan Rasio Likuiditas, Solvabilitas, dan Analisis Beban Usaha",
  ];

  const faqs = [
    {
      q: "Standar Akuntansi Keuangan (SAK) mana yang diterapkan dalam penyusunan laporan keuangan kami?",
      a: "Penerapan standar disesuaikan dengan skala dan kebutuhan entitas bisnis Anda. Untuk entitas tanpa akuntabilitas publik signifikan, kami mengacu pada SAK Entitas Privat (SAK EP / pengganti SAK ETAP). Untuk entitas yang mempersiapkan penawaran umum atau kepatuhan holding internasional, kami menerapkan SAK berbasis IFRS.",
    },
    {
      q: "Bagaimana alur koordinasi dan pengiriman dokumen transaksi antara tim klien dengan Zhou Consulting?",
      a: "Klien dapat mengirimkan salinan digital dokumen transaksi (faktur penjualan, bukti kas keluar, rekening koran) melalui sistem klien terenkripsi Zhou Consulting atau media komunikasi terdedikasi setiap pekan atau akhir bulan. Seluruh data diproses secara sistematis oleh tim akuntan penanggung jawab.",
    },
    {
      q: "Apakah laporan keuangan yang disusun langsung terintegrasi dengan pelaporan pajak (SPT Tahunan Badan)?",
      a: "Ya. Setiap bagan akun dan laporan keuangan yang kami susun telah dirancang untuk memudahkan rekonsiliasi fiskal positif dan negatif. Hal ini memastikan proses pengisian SPT Tahunan PPh Badan dan pelaporan di sistem Coretax DJP berjalan cepat, akurat, dan bebas selisih.",
    },
    {
      q: "Bagaimana jaminan keamanan dan kerahasiaan atas data pembukuan keuangan perusahaan kami?",
      a: "Kerahasiaan adalah prinsip etika tertinggi kami. Sebelum proses pengerjaan dimulai, Zhou Consulting menandatangani Perjanjian Kerahasiaan (Non-Disclosure Agreement / NDA) resmi yang mengikat secara hukum demi melindungi seluruh kerahasiaan data pembukuan, margin usaha, dan transaksi bisnis klien.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-text selection:bg-primary selection:text-white">
      {/* 1. Header / Navbar */}
      <Navbar />

      {/* 2. Main Content */}
      <main className="flex-1">
        {/* Service Scopes Grid with Integrated Breadcrumb */}
        <section className="py-14 md:py-20 bg-surface border-b border-primary-light">
          <div className="container-custom space-y-10">
            <nav className="flex items-center gap-2 text-xs text-text-secondary font-medium">
              <Link href="/" className="hover:text-primary transition-colors">
                Beranda
              </Link>
              <span>/</span>
              <Link href="/#layanan" className="hover:text-primary transition-colors">
                Layanan
              </Link>
              <span>/</span>
              <span className="text-primary font-semibold">Accounting Service</span>
            </nav>

            <div className="max-w-3xl space-y-3">
              <Badge variant="silver" className="uppercase tracking-wider text-badge font-semibold py-1 px-3">
                Ruang Lingkup
              </Badge>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary tracking-tight">
                Cakupan Layanan Accounting Service
              </h1>
              <p className="text-body-regular text-text-secondary leading-relaxed">
                Tata kelola pembukuan komprehensif yang menjamin integritas catatan finansial usaha Anda sesuai regulasi akuntansi Indonesia.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {serviceScopes.map((scope, idx) => (
                <Card
                  key={idx}
                  className="rounded-xl border-primary-light bg-white hover:shadow-md hover:border-silver transition-all duration-200 flex flex-col justify-between"
                >
                  <CardHeader className="space-y-3 pb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-light text-primary flex items-center justify-center text-base">
                      <BookIcon />
                    </div>
                    <div>
                      <CardTitle className="text-card-heading font-semibold text-primary">
                        {scope.title}
                      </CardTitle>
                      <CardDescription className="text-xs text-text-secondary mt-1 leading-relaxed">
                        {scope.desc}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 flex-1">
                    <ul className="space-y-2 text-xs text-text">
                      {scope.points.map((pt, pIdx) => (
                        <li key={pIdx} className="flex items-start gap-2">
                          <CheckCircleIcon className="text-success text-xs flex-shrink-0 mt-0.5" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Workflow & Process Steps */}
        <section className="py-16 md:py-20 bg-white border-b border-primary-light">
          <div className="container-custom space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <Badge variant="silver" className="uppercase tracking-wider text-badge font-semibold py-1 px-3">
                Metodologi Kerja
              </Badge>
              <h2 className="text-[20px] leading-[28px] sm:text-[21px] sm:leading-[29px] lg:text-section-heading font-bold text-primary tracking-tight">
                4 Tahapan Sistematis Pelaksanaan Jasa Akuntansi
              </h2>
              <p className="text-body-regular text-text-secondary leading-relaxed">
                Alur kerja pembukuan yang tertib, transparan, dan teruji untuk menghasilkan laporan keuangan berkualitas audit.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {workflowSteps.map((wf, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-xl bg-surface border border-primary-light space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <span className="text-2xl font-bold text-primary/30 tracking-tight">
                      {wf.step}
                    </span>
                    <h3 className="text-card-heading font-semibold text-primary">
                      {wf.title}
                    </h3>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {wf.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Deliverables Section */}
        <section className="py-16 md:py-20 bg-surface border-b border-primary-light">
          <div className="container-custom space-y-10">
            <div className="max-w-2xl space-y-3">
              <Badge variant="silver" className="uppercase tracking-wider text-badge font-semibold py-1 px-3">
                Output Kertas Kerja
              </Badge>
              <h2 className="text-[20px] leading-[28px] sm:text-[21px] sm:leading-[29px] lg:text-section-heading font-bold text-primary tracking-tight">
                Luaran Nyata yang Diterima Klien
              </h2>
              <p className="text-body-regular text-text-secondary leading-relaxed">
                Dokumen resmi dan kertas kerja pembukuan terperinci yang siap diserahkan kepada pimpinan, perbankan, dan auditor.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {deliverables.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg bg-white border border-primary-light flex items-start gap-3 shadow-sm"
                >
                  <div className="w-7 h-7 rounded-md bg-success/10 text-success flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckIcon className="text-xs" />
                  </div>
                  <span className="text-xs font-semibold text-primary leading-relaxed">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Lead Consultant Credibility Box */}
        <section className="py-16 md:py-20 bg-white border-b border-primary-light">
          <div className="container-custom">
            <div className="p-6 md:p-8 rounded-2xl bg-primary text-white border border-white/10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-8 space-y-3">
                <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                  Chartered Accountant (CA) &amp; Tim Akuntan Berpraktik
                </h3>
                <p className="text-xs text-silver leading-relaxed max-w-2xl">
                  Layanan akuntansi kami dipimpin oleh Akuntan Profesional Beregister (Chartered Accountant / CA) anggota Ikatan Akuntan Indonesia (IAI). Menjamin seluruh kompilasi laporan keuangan memenuhi kaidah standar akuntansi berlaku serta siap dipertanggungjawabkan di hadapan auditor independen.
                </p>
              </div>

              <div className="lg:col-span-4 flex flex-col gap-3 justify-end">
                <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
                  <Button variant="silver" asChild className="w-full justify-center text-xs font-semibold shadow-md">
                    <Link href="/konsultasi">Reservasi Konsultasi</Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full justify-center text-xs font-semibold border-white/30 text-white hover:bg-white/10">
                    <a href="https://wa.me/6281234567890?text=Halo%20Zhou%20Consulting,%20saya%20tertarik%20dengan%20layanan%20Anda." target="_blank" rel="noopener noreferrer">Hubungi Kami</a>
                  </Button>
                </div>
                <div className="text-center text-[11px] text-silver/80">
                  Terlindungi Perjanjian Kerahasiaan (NDA)
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive FAQ Section */}
        <section className="py-16 md:py-20 bg-surface border-b border-primary-light">
          <div className="container-custom max-w-3xl space-y-10">
            <div className="text-center space-y-3">
              <Badge variant="silver" className="uppercase tracking-wider text-badge font-semibold py-1 px-3">
                Pertanyaan Umum
              </Badge>
              <h2 className="text-[20px] leading-[28px] sm:text-[21px] sm:leading-[29px] lg:text-section-heading font-bold text-primary tracking-tight">
                Seputar Jasa Accounting Service
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-lg bg-white border border-primary-light overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between p-4 text-left font-semibold text-xs text-primary hover:bg-surface/50 transition-colors"
                    aria-expanded={openFaq === idx}
                  >
                    <span>{faq.q}</span>
                    <ChevronDownIcon
                      className={`text-[10px] text-silver transition-transform duration-200 ${
                        openFaq === idx ? "rotate-180 text-primary" : ""
                      }`}
                    />
                  </button>
                  {openFaq === idx && (
                    <div className="px-4 pb-4 pt-1 text-xs text-text-secondary leading-relaxed border-t border-primary-light/50 animate-in fade-in duration-150">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom Related Services Navigator */}
        <section className="py-12 bg-white border-b border-primary-light">
          <div className="container-custom space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
              Eksplorasi Layanan Terkait Lainnya:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                href="/layanan/bisnis"
                className="p-4 rounded-lg bg-surface border border-primary-light hover:border-primary hover:shadow-sm transition-all group"
              >
                <div className="text-xs font-semibold text-primary group-hover:text-primary-dark">
                  Konsultasi Bisnis
                </div>
                <div className="text-[11px] text-text-secondary mt-1">
                  Studi kelayakan, financial model &amp; proyeksi arus kas
                </div>
              </Link>
              <Link
                href="/layanan/hukum"
                className="p-4 rounded-lg bg-surface border border-primary-light hover:border-primary hover:shadow-sm transition-all group"
              >
                <div className="text-xs font-semibold text-primary group-hover:text-primary-dark">
                  Konsultasi Hukum
                </div>
                <div className="text-[11px] text-text-secondary mt-1">
                  Kepatuhan regulasi korporat &amp; telaah kontrak usaha
                </div>
              </Link>
              <Link
                href="/layanan/tax-service"
                className="p-4 rounded-lg bg-surface border border-primary-light hover:border-primary hover:shadow-sm transition-all group"
              >
                <div className="text-xs font-semibold text-primary group-hover:text-primary-dark">
                  Tax Service Core
                </div>
                <div className="text-[11px] text-text-secondary mt-1">
                  Kepatuhan SPT dan asistensi Coretax DJP
                </div>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 3. Footer */}
      <Footer />

      {/* 4. Floating WhatsApp CTA */}
      <FloatingWhatsAppCTA />
    </div>
  );
}
