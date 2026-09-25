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

export default function KonsultasiHukumPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const serviceScopes = [
    {
      title: "Telaah Kontrak & Perjanjian Bisnis",
      desc: "Pemeriksaan menyeluruh terhadap klausul hukum kontrak komersial, vendor agreement, perjanjian kemitraan, dan NDA untuk mencegah risiko sengketa di kemudian hari.",
      points: [
        "Uji keabsahan klausul hak & kewajiban para pihak",
        "Penyelarasan klausul perpajakan (pemotongan PPh/PPN transaksi)",
        "Mitigasi klausul wanprestasi dan penyelesaian sengketa arbitrase",
        "Penyusunan addendum dan redline revisi kontrak resmi",
      ],
    },
    {
      title: "Legalitas Badan Usaha & OSS RBA",
      desc: "Asistensi perizinan berusaha berbasis risiko melalui sistem Online Single Submission (OSS RBA) bagi pendirian PT, CV, maupun penanaman modal asing.",
      points: [
        "Verifikasi Nomor Induk Berusaha (NIB) & Klasifikasi Baku KBLI",
        "Pemenuhan Sertifikat Standar & Izin Operasional Sektoral",
        "Pengurusan legalitas dokumen Kementerian Hukum dan HAM",
        "Pembaruan data perizinan berkala terintegrasi",
      ],
    },
    {
      title: "Tata Kelola Perusahaan (Corporate Governance)",
      desc: "Pendampingan kepatuhan perundang-undangan perseroan terbatas (UU No. 40/2007) guna menjamin legalitas struktur kepemilikan dan keputusan korporasi.",
      points: [
        "Penyusunan Risalah RUPS Tahunan & Luar Biasa",
        "Perubahan struktur direksi, komisaris, dan pemegang saham",
        "Penyusunan Standard Operating Procedure (SOP) kepatuhan internal",
        "Dokumentasi legalitas pembagian dividen perusahaan",
      ],
    },
    {
      title: "Opini Legal & Mitigasi Risiko Fiskal",
      desc: "Penerbitan dokumen Legal Opinion tertulis dari konsultan hukum berizin untuk mengevaluasi dampak hukum dari transaksi bisnis berskala strategis.",
      points: [
        "Kajian hukum atas transaksi merger, akuisisi, dan restrukturisasi",
        "Analisis kepatuhan kontrak terhadap regulasi perpajakan nasional",
        "Pendampingan aspek legal atas klarifikasi administrasi perbankan",
        "Pemberian advisori mitigasi risiko sengketa komersial",
      ],
    },
  ];

  const workflowSteps = [
    {
      step: "01",
      title: "Konsultasi Awal & Intake Berkas",
      desc: "Identifikasi kebutuhan legalitas entitas dan pengumpulan draf dokumen/kontrak kerja sama yang akan ditelaah.",
    },
    {
      step: "02",
      title: "Legal Due Diligence",
      desc: "Pemeriksaan mendalam atas keselarasan regulasi perundang-undangan komersial, ketenagakerjaan, dan hukum perpajakan.",
    },
    {
      step: "03",
      title: "Penyusunan Legal Opinion / Redrafting",
      desc: "Penyusunan draf rekomendasi perbaikan klausul kontrak (redline) serta opini hukum tertulis berlandaskan hukum positif.",
    },
    {
      step: "04",
      title: "Finalisasi & Serah Terima Kertas Kerja",
      desc: "Pemaparan eksekutif bersama manajemen perusahaan dan penyerahan dokumen legal opinion resmi tertanda konsultan berlisensi.",
    },
  ];

  const deliverables = [
    "Dokumen Legal Opinion resmi bertanda tangan konsultan hukum",
    "Draf kontrak hasil revisi komprehensif (clean copy & redline version)",
    "Daftar periksa kepatuhan (checklist compliance) regulasi OSS RBA",
    "Berita acara telaah dokumen legalitas dan catatan rekomendasi mitigasi",
  ];

  const faqs = [
    {
      q: "Berapa lama proses telaah kontrak bisnis biasanya berlangsung?",
      a: "Untuk telaah kontrak standar (1–15 halaman), proses kajian hukum dan penyusunan catatan redline rata-rata membutuhkan waktu 2 hingga 4 hari kerja. Untuk kontrak kompleks atau transaksi kemitraan multinasional, estimasi waktu akan disepakati pada tahap intake awal.",
    },
    {
      q: "Apakah Zhou Consulting menerbitkan dokumen Legal Opinion resmi?",
      a: "Ya. Dokumen Legal Opinion diterbitkan dan ditandatangani secara resmi oleh konsultan hukum berizin kami (SH., M.Kn.) dengan format baku yang dapat dipertanggungjawabkan di hadapan notaris, perbankan, maupun mitra bisnis Anda.",
    },
    {
      q: "Bagaimana Zhou Consulting menjaga kerahasiaan data kontrak bisnis klien?",
      a: "Sebelum menerima berkas kontrak kerja sama atau dokumen rahasia perusahaan, Zhou Consulting menandatangani Non-Disclosure Agreement (NDA) resmi yang mengikat secara hukum demi melindungi seluruh data sensitif bisnis Anda.",
    },
    {
      q: "Dapatkah konsultasi hukum dilakukan secara daring (online)?",
      a: "Tentu. Kami melayani sesi telaah daring via Zoom/Google Meet dengan fitur telaah dokumen bersama, serta opsi pertemuan tatap muka di kantor pusat kami di kawasan bisnis Sudirman, Jakarta Selatan.",
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
              <span className="text-primary font-semibold">Konsultasi Hukum</span>
            </nav>

            <div className="max-w-3xl space-y-3">
              <Badge variant="silver" className="uppercase tracking-wider text-badge font-semibold py-1 px-3">
                Ruang Lingkup
              </Badge>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary tracking-tight">
                Cakupan Layanan Konsultasi Hukum
              </h1>
              <p className="text-body-regular text-text-secondary leading-relaxed">
                Pendekatan hukum preventif untuk melindungi aset, reputasi, dan kelangsungan operasional bisnis perusahaan Anda.
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
                Setiap penugasan dikelola dengan alur terstruktur, akuntabel, dan transparan bagi manajemen klien.
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
                Dokumen formal berstandar kepatuhan resmi yang siap diarsipkan dan digunakan untuk kepentingan perbankan atau mitra bisnis.
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
                  Muhamad Dekhsa Afnan, SH., M.Kn.
                </h3>
                <p className="text-xs text-silver leading-relaxed max-w-2xl">
                  Spesialis hukum korporat dan kepatuhan kontrak bisnis komersial. Berpengalaman menangani legalitas pendirian perusahaan, uji kelayakan hukum kemitraan vendor, dan penyelarasan klausa kontrak dengan regulasi fiskal perundang-undangan nasional.
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
                Seputar Konsultasi Hukum Korporat
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
                  Business Financial Consulting
                </div>
                <div className="text-[11px] text-text-secondary mt-1">
                  Studi kelayakan &amp; proyeksi arus kas ekspansi
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
