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
  BriefcaseIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  CheckIcon,
} from "@/components/icons";

export default function KonsultasiBisnisPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const serviceScopes = [
    {
      title: "Studi Kelayakan Bisnis & Proyek (Feasibility Study)",
      desc: "Evaluasi komprehensif atas aspek pasar, operasional, dan kelayakan finansial sebelum perusahaan melakukan ekspansi cabang, peluncuran produk, atau akuisisi aset.",
      points: [
        "Kalkulasi metrik investasi: Net Present Value (NPV) & Payback Period",
        "Analisis tingkat pengembalian modal: Internal Rate of Return (IRR)",
        "Pengujian sensitivitas multi-skenario (Best, Base, dan Worst Case)",
        "Identifikasi dan mitigasi risiko alokasi belanja modal (CapEx)",
      ],
    },
    {
      title: "Pemodelan Keuangan & Proyeksi Arus Kas (Financial Modeling)",
      desc: "Konstruksi model finansial dinamis 3-statement terintegrasi untuk perencanaan anggaran strategis tahunan dan pengendalian likuiditas usaha secara presisi.",
      points: [
        "Simulasi proyeksi Laba Rugi, Neraca, dan Arus Kas 3–5 tahun ke depan",
        "Perhitungan kebutuhan modal kerja (Working Capital) bulanan",
        "Analisis titik impas (Break-Even Point) dan margin kontribusi produk",
        "Dashboard visual proyeksi rasio finansial yang dapat disesuaikan mandiri",
      ],
    },
    {
      title: "Diagnosis Kesehatan Finansial (Financial Health Check)",
      desc: "Audit performa finansial mendalam untuk mengidentifikasi inefisiensi beban operasional, menganalisis struktur utang-piutang, dan memperkuat profitabilitas.",
      points: [
        "Analisis rasio likuiditas, solvabilitas, perputaran aset, dan profitabilitas",
        "Pemeriksaan struktur penagihan piutang dan umur utang dagang (Aging Schedule)",
        "Benchmarking kinerja finansial terhadap standar rata-rata industri",
        "Penyusunan rekomendasi efisiensi biaya operasional (OpEx Optimization)",
      ],
    },
    {
      title: "Struktur Modal, Penilaian Usaha & Advisori Pendanaan",
      desc: "Pemberian advisori strategis terkait struktur permodalan optimal, estimasi valuasi wajar perusahaan, dan penyusunan proposal pembiayaan bagi perbankan atau investor.",
      points: [
        "Valuasi bisnis berbasis metode Discounted Cash Flow (DCF) & Market Multiples",
        "Optimasi rasio utang terhadap modal (Debt-to-Equity Optimization)",
        "Penyusunan Executive Pitch Deck & Investment Memorandum resmi",
        "Pendampingan teknis dalam negosiasi fasilitas permodalan korporat",
      ],
    },
  ];

  const workflowSteps = [
    {
      step: "01",
      title: "Diagnostic Review & Intake Data",
      desc: "Pengumpulan data historis laporan keuangan 3 tahun, bagan akun, rencana anggaran, dan model bisnis perusahaan.",
    },
    {
      step: "02",
      title: "Financial Modeling & Simulasi",
      desc: "Konstruksi model matematis proyeksi kas, pengujian rasio sensitivitas, dan kalkulasi parameter kelayakan investasi.",
    },
    {
      step: "03",
      title: "Penyusunan Executive Report",
      desc: "Penyusunan dokumen resmi studi kelayakan, strategi optimalisasi struktur modal, dan visualisasi dashboard ringkasan.",
    },
    {
      step: "04",
      title: "Pemaparan Direksi & Serah Terima",
      desc: "Sesi presentasi eksekutif di hadapan jajaran pimpinan/investor serta penyerahan berkas model finansial terproteksi.",
    },
  ];

  const deliverables = [
    "Berkas Financial Model dinamis terintegrasi (Microsoft Excel / Spreadsheet dinamis)",
    "Dokumen Laporan Studi Kelayakan Bisnis resmi (Feasibility Study Report PDF)",
    "Executive Pitch Deck & Investment Memorandum berstandar investor institusional",
    "Lembar rekomendasi optimalisasi modal kerja dan mitigasi risiko likuiditas perusahaan",
  ];

  const faqs = [
    {
      q: "Berapa lama proses penyusunan Financial Model dan Studi Kelayakan berlangsung?",
      a: "Untuk penyusunan financial model standar dan analisis kesehatan kas, proses pengerjaan membutuhkan waktu 5 hingga 10 hari kerja setelah seluruh data historis terkumpul. Untuk studi kelayakan ekspansi kompleks, waktu estimasi rata-rata 2 hingga 3 minggu kerja.",
    },
    {
      q: "Apakah berkas Financial Model yang diserahkan dapat diedit sendiri oleh tim internal klien?",
      a: "Ya. Kami menyerahkan file spreadsheet dengan formula terbuka, struktur dinamis, dan panduan penggunaan (user manual), sehingga tim keuangan perusahaan Anda dapat mengubah asumsi variabel (misal: proyeksi pertumbuhan penjualan atau inflasi) di kemudian hari.",
    },
    {
      q: "Apakah layanan ini terintegrasi dengan perencanaan pajak (Tax Planning)?",
      a: "Tentu. Keunggulan utama Zhou Consulting adalah integrasi antara pemodelan finansial bisnis dengan kepatuhan fiskal nasional. Setiap proyeksi laba dan arus kas secara otomatis memperhitungkan beban pajak riil (PPh Badan, PPh Final, dan PPN) yang selaras dengan regulasi Coretax DJP.",
    },
    {
      q: "Bagaimana Zhou Consulting menjaga kerahasiaan data proyeksi dan transaksi bisnis klien?",
      a: "Kerahasiaan adalah prioritas mutlak. Sebelum pertukaran data historis dan laporan keuangan dimulai, kami menandatangani Non-Disclosure Agreement (NDA) resmi yang mengikat secara hukum demi melindungi seluruh strategi rahasia dagang perusahaan Anda.",
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
              <span className="text-primary font-semibold">Konsultasi Bisnis &amp; Keuangan</span>
            </nav>

            <div className="max-w-3xl space-y-3">
              <Badge variant="silver" className="uppercase tracking-wider text-badge font-semibold py-1 px-3">
                Ruang Lingkup
              </Badge>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary tracking-tight">
                Cakupan Layanan Konsultasi Finansial Bisnis
              </h1>
              <p className="text-body-regular text-text-secondary leading-relaxed">
                Pendekatan kuantitatif berbasis data nyata untuk memandu keputusan strategis penganggaran modal dan ekspansi usaha Anda.
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
                      <BriefcaseIcon />
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
                4 Tahapan Sistematis Pelaksanaan Konsultasi
              </h2>
              <p className="text-body-regular text-text-secondary leading-relaxed">
                Penyusunan financial model dan feasibility study yang terstruktur, berbasis validasi data akuntansi nyata, serta transparan bagi manajemen.
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
                Kertas kerja analitis komprehensif yang siap digunakan sebagai acuan pengambilan keputusan manajemen, perbankan, dan calon investor.
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
                  Linda David, S.Ak., BKP
                </h3>
                <p className="text-xs text-silver leading-relaxed max-w-2xl">
                  Lead Business Financial Analyst dan Konsultan Pajak Berlisensi (BKP). Memiliki rekam jejak panjang dalam perancangan model finansial korporat, valuasi merger/akuisisi bisnis UMKM hingga perseroan, serta penataan struktur modal kerja yang efisien dari sisi beban perpajakan nasional.
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
                Seputar Konsultasi Finansial Bisnis
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
                href="/layanan/akuntansi"
                className="p-4 rounded-lg bg-surface border border-primary-light hover:border-primary hover:shadow-sm transition-all group"
              >
                <div className="text-xs font-semibold text-primary group-hover:text-primary-dark">
                  Accounting Service
                </div>
                <div className="text-[11px] text-text-secondary mt-1">
                  Laporan keuangan berkala berstandar SAK
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
