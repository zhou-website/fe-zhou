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
  ShieldTaxIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  CheckIcon,
  DocumentIcon,
  UserIcon,
  ExportIcon,
  SettingsIcon,
} from "@/components/icons";

export default function TaxServicePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const taxServiceModules = [
    {
      id: "e-faktur",
      tag: "Modul e-Faktur & PPN",
      title: "e-Faktur / PPN",
      icon: DocumentIcon,
      desc: "Pengelolaan faktur pajak elektronik otomatis, administrasi PPN Keluaran & Masukan, penatausahaan nota retur, dan kompilasi SPT Masa PPN 1111 tepat waktu.",
      points: [
        "Penerbitan, approval, dan distribusi e-Faktur sah DJP",
        "Pencocokan dan validasi QR Code Faktur Pajak Masukan",
        "Penyusunan dan pelaporan SPT Masa PPN 1111 tepat waktu",
        "Penanganan pembatalan faktur dan nota retur komersial",
      ],
      ctaText: "Konsultasi e-Faktur & PPN",
    },
    {
      id: "e-bupot-21",
      tag: "Modul PPh 21/26",
      title: "e-Bupot PPh 21/26",
      icon: UserIcon,
      desc: "Manajemen pemotongan pajak penghasilan karyawan, ekspatriat, dan tenaga ahli menggunakan skema Tarif Efektif Rata-rata (TER) PP 58/2023.",
      points: [
        "Kalkulasi TER Kategori A, B, dan C per masa pajak",
        "Penerbitan bukti potong bulanan & formulir 1721-A1 tahunan",
        "Ekualisasi biaya gaji vs objek pemotongan PPh 21",
        "Pelaporan SPT Masa PPh 21/26 terintegrasi DJP Online",
      ],
      ctaText: "Konsultasi PPh 21/26",
    },
    {
      id: "e-bupot-unifikasi",
      tag: "Modul Unifikasi",
      title: "e-Bupot Unifikasi",
      icon: CheckCircleIcon,
      desc: "Satu pintu pembuatan bukti potong dan pelaporan SPT Masa Unifikasi untuk PPh 23, 22, 15, dan PPh Final Pasal 4 ayat (2).",
      points: [
        "Penomoran otomatis bukti potong unifikasi terstandar DJP",
        "Administrasi PPh 23 atas jasa teknik, manajemen, dan sewa",
        "Kepatuhan PPh Final 4(2) atas sewa tanah/gedung & konstruksi",
        "Satu SPT Masa Unifikasi tanpa redundansi entri dokumen",
      ],
      ctaText: "Konsultasi e-Bupot Unifikasi",
    },
    {
      id: "e-billing",
      tag: "Modul Billing & VSWP",
      title: "e-Billing & VSWP",
      icon: CheckIcon,
      desc: "Pembuatan kode billing penyetoran kas negara multi-KAP/KJS serta Validasi Status Wajib Pajak (VSWP) massal untuk memastikan kredibilitas lawan transaksi.",
      points: [
        "Penerbitan kode billing Surat Setoran Pajak (SSP) instan",
        "Validasi Nomor Transaksi Penerimaan Negara (NTPN)",
        "Pengecekan massal status NPWP 16 digit & SPT lawan transaksi",
        "Mitigasi risiko sanksi denda bunga akibat keterlambatan bayar",
      ],
      ctaText: "Konsultasi Billing & VSWP",
    },
    {
      id: "pelaporan-spt",
      tag: "Coretax Ready 2026",
      title: "Pelaporan SPT (Coretax Ready)",
      icon: ExportIcon,
      desc: "Penyusunan dan pelaporan SPT Masa & Tahunan Badan (1771) dan Orang Pribadi (1770) yang diuji silang dan siap diunggah ke Coretax DJP.",
      points: [
        "Rekonsiliasi fiskal positif dan negatif berlandaskan UU HPP",
        "Kompilasi lampiran khusus & daftar nominatif biaya promosi",
        "Sinkronisasi akun deposit pajak (Tax Deposit Account)",
        "Penerbitan Bukti Penerimaan Elektronik (BPE) sah pemerintah",
      ],
      ctaText: "Konsultasi Pelaporan SPT",
    },
    {
      id: "integrasi-api",
      tag: "Otomasi Sistem ERP",
      title: "Automasi & Integrasi API",
      icon: SettingsIcon,
      desc: "Penyelarasan data transaksi dari sistem keuangan dan ERP perusahaan agar siap digunakan dalam proses pelaporan pajak tanpa duplikasi entri data.",
      points: [
        "Koneksi data transaksi massal (bulk data) secara terstruktur",
        "Validasi format skema data dini (pre-validation engine)",
        "Enkripsi data berlapis & keamanan transfer SSL 256-bit",
        "Optimalisasi efisiensi waktu kerja administrasi perpajakan tim internal",
      ],
      ctaText: "Konsultasi Integrasi Data ERP",
    },
  ];

  const serviceScopes = [
    {
      title: "Kepatuhan SPT Masa & Tahunan (PPh & PPN)",
      desc: "Penanganan komprehensif atas kewajiban administrasi pelaporan pajak rutin bulanan dan tahunan badan usaha sesuai kalender kepatuhan Direktorat Jenderal Pajak (DJP).",
      points: [
        "Perhitungan dan pelaporan SPT Masa PPh 21/26 (Gaji dan Imbalan Tenaga Kerja)",
        "Administrasi pemotongan SPT Masa PPh 23, 22, dan PPh Final Pasal 4 ayat (2)",
        "Rekonsiliasi PPh Pasal 25/29 dan perhitungan angsuran pajak badan berjalan",
        "Penyusunan SPT Masa PPN 1111 tepat waktu sebelum batas akhir pelaporan",
      ],
    },
    {
      title: "Administrasi e-Faktur & Bukti Potong Unifikasi",
      desc: "Pengelolaan teknis faktur pajak elektronik dan bukti potong unifikasi pada ekosistem digital DJP Online guna menjamin validitas kredit pajak masukan perusahaan.",
      points: [
        "Penerbitan dan approval Faktur Pajak Elektronik (e-Faktur) secara tepat waktu",
        "Pencocokan dan validasi Faktur Pajak Masukan guna mencegah faktur fiktif",
        "Pembuatan Bukti Pemotongan Pajak Penghasilan Unifikasi secara terpadu",
        "Penatausahaan dokumen retur faktur pajak dan pembatalan transaksi sah",
      ],
    },
    {
      title: "Tax Planning Strategis & Diagnostic Review Fiskal",
      desc: "Penyusunan perencanaan pajak legal (legal tax avoidance) untuk mengoptimalkan efisiensi beban kas perusahaan tanpa melanggar batasan Undang-Undang HPP.",
      points: [
        "Audit diagnostik kepatuhan fiskal untuk mendeteksi potensi risiko denda dini",
        "Optimalisasi pemanfaatan fasilitas insentif pajak nasional yang berlaku",
        "Penelaahan kepatuhan transaksi afiliasi dan prinsip kewajaran (Arm's Length)",
        "Simulasi dampak perubahan regulasi fiskal terhadap margin laba bersih usaha",
      ],
    },
    {
      title: "Pendampingan SP2DK & Asistensi Pemeriksaan Pajak",
      desc: "Bantuan teknis dan legal dalam menanggapi surat klarifikasi dari Kantor Pelayanan Pajak (KPP) serta pendampingan langsung selama proses pemeriksaan fiskal berlangsung.",
      points: [
        "Penyusunan surat tanggapan resmi dan penjelasan logis atas SP2DK KPP",
        "Penyediaan kertas kerja ekualisasi dan rekonsiliasi data pembanding DJP",
        "Pendampingan langsung dalam sesi pembahasan tatap muka dengan Account Representative (AR)",
        "Asistensi dalam proses pemeriksaan bukti permulaan dan peninjauan STP/SKP",
      ],
    },
  ];

  const workflowSteps = [
    {
      step: "01",
      title: "Rekonsiliasi & Intake Data",
      desc: "Pengumpulan dan rekonsiliasi seluruh dokumen transaksi, faktur komersial, bukti potong, dan mutasi kas/bank masa terkait.",
    },
    {
      step: "02",
      title: "Ekualisasi & Kalkulasi Pajak",
      desc: "Uji silang ekualisasi peredaran usaha vs PPh Badan dan PPN, serta kalkulasi beban pajak terutang secara akurat.",
    },
    {
      step: "03",
      title: "Billing & e-Filing DJP",
      desc: "Penerbitan kode billing perbankan, validasi Nomor Transaksi Penerimaan Negara (NTPN), dan pengunggahan SPT via e-Filing.",
    },
    {
      step: "04",
      title: "Penerbitan BPE & Dokumen Arsip",
      desc: "Penerbitan Bukti Penerimaan Elektronik (BPE) resmi DJP dan penyerahan bundel dokumen kepatuhan terenkripsi bagi arsip klien.",
    },
  ];

  const deliverables = [
    "Bukti Penerimaan Elektronik (BPE) & Bukti Penerimaan Surat (BPS) resmi dari Direktorat Jenderal Pajak (DJP)",
    "Kertas Kerja Ekualisasi Omzet Usaha vs PPh Badan serta Ekualisasi PPN Masukan-Keluaran Lengkap",
    "Induk SPT Masa & Tahunan (PPh Badan / Orang Pribadi) beserta seluruh lampiran daftar nominatif resmi",
    "Executive Tax Review Memo & Rekomendasi Mitigasi Risiko Kepatuhan Surat Klarifikasi SP2DK KPP",
  ];

  const faqs = [
    {
      q: "Bagaimana Zhou Consulting memastikan sistem perpajakan klien siap menghadapi transisi Coretax DJP?",
      a: "Seluruh proses administrasi pajak di Zhou Consulting telah diselaraskan dengan arsitektur sistem inti perpajakan nasional (Coretax DJP). Kami memvalidasi pemadanan NIK-NPWP 16 digit, mengadopsi standar bukti potong elektronik terpadu, dan menerapkan akun deposit pajak (Tax Deposit Account) secara tertib.",
    },
    {
      q: "Apa langkah awal yang dilakukan jika perusahaan kami menerima Surat Permintaan Penjelasan (SP2DK)?",
      a: "Jangan panik. Tim kami akan segera menganalisis pokok data pemicu SP2DK (umumnya selisih ekualisasi omzet atau data pihak ketiga). Kami kemudian menyusun kertas kerja rekonsiliasi data tervalidasi dan membuat draf surat tanggapan resmi yang siap diajukan ke Account Representative (AR) KPP dalam batas waktu 14 hari.",
    },
    {
      q: "Kapan batas waktu rutin pengiriman dokumen transaksi bulanan dari tim keuangan klien?",
      a: "Untuk SPT Masa PPh, kami menyarankan pengiriman data selambatnya tanggal 5 setiap bulannya (batas bayar tgl 10/15 dan batas lapor tgl 20). Untuk SPT Masa PPN, data faktur sebaiknya diserahkan selambatnya tanggal 15 sebelum batas akhir pelaporan di akhir bulan berjalan.",
    },
    {
      q: "Apakah data omzet dan strategi bisnis kami terjamin kerahasiaannya dari pihak luar?",
      a: "Kerahasiaan data adalah mandat etika utama konsultan pajak berizin. Sebelum proses analisis dimulai, Zhou Consulting menandatangani Perjanjian Kerahasiaan (Non-Disclosure Agreement / NDA) resmi yang mengikat secara hukum demi melindungi seluruh rahasia dagang dan data laporan finansial perusahaan Anda.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-text selection:bg-primary selection:text-white">
      {/* 1. Header / Navbar */}
      <Navbar />

      {/* 2. Main Content */}
      <main className="flex-1">
        {/* Breadcrumb Navigation */}
        <div className="bg-surface border-b border-primary-light py-3">
          <div className="container-custom flex items-center gap-2 text-breadcrumb text-text-secondary">
            <Link href="/" className="hover:text-primary transition-colors">
              Beranda
            </Link>
            <span>/</span>
            <Link href="/#layanan" className="hover:text-primary transition-colors">
              Layanan
            </Link>
            <span>/</span>
            <span className="text-primary font-semibold">Tax Service Core</span>
          </div>
        </div>

        {/* Service Scopes Grid */}
        <section className="py-12 md:py-16 bg-surface border-b border-primary-light">
          <div className="container-custom space-y-10">
            <div className="max-w-3xl space-y-3">
              <Badge variant="silver" className="uppercase tracking-wider text-badge font-semibold py-1 px-3">
                Ruang Lingkup
              </Badge>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary tracking-tight">
                Cakupan Layanan Tax Service Core
              </h1>
              <p className="text-body-regular text-text-secondary leading-relaxed">
                Pendampingan teknis dan strategis terpadu dari administrasi faktur harian hingga pembelaan fiskal terstruktur.
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
                      <ShieldTaxIcon />
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

        {/* Modul Layanan Pajak Terintegrasi (Ekosistem Tax Service Core & Coretax DJP) */}
        <section
          id="modul-pajak"
          aria-label="Modul Tax Service & Coretax"
          className="py-16 md:py-20 bg-background border-b border-primary-light scroll-mt-20"
        >
          <div className="container-custom space-y-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div className="max-w-2xl space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="silver" className="uppercase tracking-wider text-badge font-semibold py-1 px-3">
                    Modul Terintegrasi
                  </Badge>
                  <Badge variant="success" size="sm" dot>
                    Tax Service Core &amp; Coretax 2026
                  </Badge>
                </div>
                <h2 className="text-[20px] leading-[28px] sm:text-[21px] sm:leading-[29px] lg:text-section-heading font-bold text-primary tracking-tight">
                  Sub-Layanan Pajak: Otomasi &amp; Administrasi Lengkap
                </h2>
                <p className="text-body-regular text-text-secondary leading-relaxed">
                  Solusi administrasi per sub-menu berbasis modul kepatuhan perpajakan dan arsitektur Coretax DJP guna meniadakan risiko denda administratif.
                </p>
              </div>

              <Button variant="primary" asChild className="self-start sm:self-auto shadow-sm">
                <Link href="/#kontak">Konsultasi Modul Pajak</Link>
              </Button>
            </div>

            {/* 6 Tax Service Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {taxServiceModules.map((mod) => {
                const IconComponent = mod.icon;
                return (
                  <div
                    key={mod.id}
                    id={mod.id}
                    className="scroll-mt-28 flex"
                  >
                    <Card className="rounded-xl border-primary-light bg-white hover:shadow-lg hover:border-silver transition-all duration-200 flex flex-col justify-between w-full">
                      <CardHeader className="space-y-3 pb-3">
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 rounded-lg bg-primary-light text-primary flex items-center justify-center text-base">
                            <IconComponent />
                          </div>
                          <Badge variant="outline" size="sm" className="text-[10px] border-primary-light text-text-secondary">
                            {mod.tag}
                          </Badge>
                        </div>
                        <div>
                          <CardTitle className="text-card-heading font-bold text-primary">
                            {mod.title}
                          </CardTitle>
                          <CardDescription className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                            {mod.desc}
                          </CardDescription>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0 flex-1 space-y-3">
                        <div className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                          Fitur &amp; Kepatuhan Utama:
                        </div>
                        <ul className="space-y-2 text-xs text-text">
                          {mod.points.map((pt, pIdx) => (
                            <li key={pIdx} className="flex items-start gap-2">
                              <CheckCircleIcon className="text-success text-xs flex-shrink-0 mt-0.5" />
                              <span className="leading-snug">{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>

                      <div className="p-5 pt-0 border-t border-primary-light/50 mt-4 flex items-center justify-between gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="w-full text-xs font-semibold justify-between group hover:border-primary"
                        >
                          <a
                            href={`https://wa.me/6281234567890?text=Halo%20Zhou%20Consulting,%20saya%20tertarik%20dengan%20layanan%20${encodeURIComponent(mod.title)}.`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <span>{mod.ctaText}</span>
                          </a>
                        </Button>
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Workflow & Process Steps */}
        <section className="py-16 md:py-20 bg-white border-b border-primary-light">
          <div className="container-custom space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <Badge variant="silver" className="uppercase tracking-wider text-badge font-semibold py-1 px-3">
                Metodologi Kepatuhan
              </Badge>
              <h2 className="text-[20px] leading-[28px] sm:text-[21px] sm:leading-[29px] lg:text-section-heading font-bold text-primary tracking-tight">
                4 Langkah Sistematis Pengelolaan Perpajakan
              </h2>
              <p className="text-body-regular text-text-secondary leading-relaxed">
                Alur kepatuhan berbasis ekualisasi teliti demi memastikan nihil selisih sebelum pelaporan di sistem resmi DJP.
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
                Luaran Kepatuhan yang Diterima Klien
              </h2>
              <p className="text-body-regular text-text-secondary leading-relaxed">
                Arsip bukti pelaporan resmi negara dan lembar ekualisasi komprehensif untuk perlindungan hukum wajib pajak.
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
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-silver text-[11px] font-semibold">
                  <ShieldTaxIcon className="text-xs" />
                  <span>Konsultan Pajak Berlisensi (BKP) Kemenkeu RI</span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                  Konsultan Pajak Teregistrasi &amp; Kuasa Hukum Pengadilan Pajak
                </h3>
                <p className="text-xs text-silver leading-relaxed max-w-2xl">
                  Layanan perpajakan Zhou Consulting dipimpin oleh praktisi Bersertifikat Konsultan Pajak (BKP) dengan Izin Praktik Resmi Kementerian Keuangan RI. Memiliki keahlian mendalam dalam litigasi sengketa fiskal, telaah surat SP2DK, dan kepatuhan Coretax bagi entitas perseroan nasional.
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
                Seputar Layanan Tax Service Core
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
                href="/layanan/akuntansi"
                className="p-4 rounded-lg bg-surface border border-primary-light hover:border-primary hover:shadow-sm transition-all group"
              >
                <div className="text-xs font-semibold text-primary group-hover:text-primary-dark">
                  Accounting Service
                </div>
                <div className="text-[11px] text-text-secondary mt-1">
                  Kompilasi laporan keuangan SAK &amp; rekonsiliasi kas
                </div>
              </Link>
              <Link
                href="/layanan/bisnis"
                className="p-4 rounded-lg bg-surface border border-primary-light hover:border-primary hover:shadow-sm transition-all group"
              >
                <div className="text-xs font-semibold text-primary group-hover:text-primary-dark">
                  Konsultasi Bisnis
                </div>
                <div className="text-[11px] text-text-secondary mt-1">
                  Studi kelayakan &amp; pemodelan keuangan kas
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
                  Kepatuhan regulasi korporat &amp; kontrak usaha
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
