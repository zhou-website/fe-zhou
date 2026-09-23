"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { FloatingWhatsAppCTA } from "@/components/landing/FloatingWhatsAppCTA";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  SearchIcon,
  FilterIcon,

  CheckCircleIcon,
  WhatsappIcon,
  ClockIcon,
  CalendarIcon,
  ChevronRightIcon,
} from "@/components/icons";

interface RegulationItem {
  id: string;
  docNumber: string;
  title: string;
  category: "Undang-Undang" | "Peraturan Pemerintah" | "Peraturan Menteri" | "Peraturan DJP" | "Keputusan KMK";
  effectiveDate: string;
  scope: string;
  fileSize: string;
  status: "Berlaku" | "Pembaruan";
}

interface TaxRateItem {
  currency: string;
  name: string;
  rate: string;
  change: string;
  trend: "up" | "down" | "flat";
}

const WEEKLY_RATES: TaxRateItem[] = [
  { currency: "USD", name: "US Dollar", rate: "Rp 15.825,00", change: "+0.15%", trend: "up" },
  { currency: "EUR", name: "Euro", rate: "Rp 16.940,00", change: "-0.08%", trend: "down" },
  { currency: "SGD", name: "Singapore Dollar", rate: "Rp 11.890,00", change: "+0.05%", trend: "up" },
  { currency: "CNY", name: "Chinese Yuan", rate: "Rp 2.185,00", change: "+0.10%", trend: "up" },
  { currency: "JPY", name: "Japanese Yen (100)", rate: "Rp 10.450,00", change: "-0.22%", trend: "down" },
  { currency: "GBP", name: "British Pound", rate: "Rp 20.150,00", change: "+0.18%", trend: "up" },
  { currency: "AUD", name: "Australian Dollar", rate: "Rp 10.320,00", change: "-0.05%", trend: "down" },
];

const REGULATIONS_LIST: RegulationItem[] = [
  {
    id: "REG-01",
    docNumber: "UU No. 7 Tahun 2021",
    title: "Harmonisasi Peraturan Perpajakan (UU HPP)",
    category: "Undang-Undang",
    effectiveDate: "29 Oktober 2021",
    scope: "Reformasi PPh Badan, kenaikan tarif PPN 11%, integrasi NIK menjadi NPWP, dan program pengungkapan sukarela.",
    fileSize: "2.4 MB",
    status: "Berlaku",
  },
  {
    id: "REG-02",
    docNumber: "PMK No. 168/PMK.03/2023",
    title: "Petunjuk Teknis Pemotongan Pajak atas Penghasilan Sehubungan dengan Pekerjaan (PPh 21 TER)",
    category: "Peraturan Menteri",
    effectiveDate: "1 Januari 2024",
    scope: "Penerapan skema Tarif Efektif Rata-Rata (TER) PPh 21 bulanan kategori A, B, C dan TER harian pegawai.",
    fileSize: "1.8 MB",
    status: "Berlaku",
  },
  {
    id: "REG-03",
    docNumber: "PMK No. 81 Tahun 2024",
    title: "Ketentuan Perpajakan dalam Rangka Pelaksanaan Sistem Inti Administrasi Perpajakan (Coretax)",
    category: "Peraturan Menteri",
    effectiveDate: "1 Januari 2025",
    scope: "Standardisasi akun wajib pajak, deposit pajak terpadu, e-Bupot unifikasi, dan pemadanan NIK 16 digit.",
    fileSize: "3.7 MB",
    status: "Pembaruan",
  },
  {
    id: "REG-04",
    docNumber: "PP No. 55 Tahun 2022",
    title: "Penyesuaian Pengaturan di Bidang Pajak Penghasilan Badan dan Orang Pribadi",
    category: "Peraturan Pemerintah",
    effectiveDate: "20 Desember 2022",
    scope: "Perlakuan natura/kenikmatan, instrumen pencegahan penghindaran pajak (GAAR), dan batasan omzet tidak kena pajak UMKM.",
    fileSize: "1.9 MB",
    status: "Berlaku",
  },
  {
    id: "REG-05",
    docNumber: "PER-04/PJ/2024",
    title: "Petunjuk Teknis Administrasi Nomor Pokok Wajib Pajak dan Sertifikat Elektronik Coretax DJP",
    category: "Peraturan DJP",
    effectiveDate: "1 Juli 2024",
    scope: "Tata cara aktivasi akun wajib pajak baru, penataan sertifikat digital, dan otentikasi multi-faktor DJP.",
    fileSize: "2.1 MB",
    status: "Berlaku",
  },
  {
    id: "REG-06",
    docNumber: "KMK No. 38/KM.10/2026",
    title: "Nilai Kurs Valuta Asing sebagai Dasar Pelunasan Bea Masuk, PPN, dan PPh",
    category: "Keputusan KMK",
    effectiveDate: "15 September 2026",
    scope: "Penetapan kurs pajak mingguan resmi Kemenkeu untuk konversi transaksi ekspor, impor, dan faktur valas.",
    fileSize: "850 KB",
    status: "Berlaku",
  },
  {
    id: "REG-07",
    docNumber: "PER-03/PJ/2022 jo PER-11/PJ/2022",
    title: "Pedoman Teknis Faktur Pajak Elektronik (e-Faktur PPN)",
    category: "Peraturan DJP",
    effectiveDate: "1 April 2022",
    scope: "Ketentuan upload faktur pajak keluaran paling lambat tanggal 15 bulan berikutnya serta mitigasi faktur fiktif.",
    fileSize: "1.5 MB",
    status: "Berlaku",
  },
  {
    id: "REG-08",
    docNumber: "PER-17/PJ/2021",
    title: "Tata Cara Pembuatan Bukti Pemotongan/Pemungutan Unifikasi dan Pelaporan SPT Masa PPh Unifikasi",
    category: "Peraturan DJP",
    effectiveDate: "1 Januari 2022",
    scope: "Integrasi pelaporan PPh Pasal 22, 23, 26, dan PPh Final Pasal 4 ayat (2) ke dalam satu format pelaporan digital.",
    fileSize: "2.8 MB",
    status: "Berlaku",
  },
  {
    id: "REG-09",
    docNumber: "PP No. 44 Tahun 2022",
    title: "Penerapan Pajak Pertambahan Nilai Barang dan Jasa serta Pajak Penjualan atas Barang Mewah",
    category: "Peraturan Pemerintah",
    effectiveDate: "2 Desember 2022",
    scope: "Penunjukan pemungut PPN PMSE (perdagangan melalui sistem elektronik) dan fasilitas PPN dibebaskan/tidak dipungut.",
    fileSize: "1.6 MB",
    status: "Berlaku",
  },
  {
    id: "REG-10",
    docNumber: "UU No. 1 Tahun 2022",
    title: "Hubungan Keuangan antara Pemerintah Pusat dan Pemerintahan Daerah (UU HKPD)",
    category: "Undang-Undang",
    effectiveDate: "5 Januari 2022",
    scope: "Penyelarasan Pajak Daerah dan Retribusi Daerah (PDRD) dengan tarif PBJT korporat serta opsen pajak provinsi/kabupaten.",
    fileSize: "3.2 MB",
    status: "Berlaku",
  },
];

const CATEGORIES = [
  "Semua",
  "Undang-Undang",
  "Peraturan Pemerintah",
  "Peraturan Menteri",
  "Peraturan DJP",
  "Keputusan KMK",
];

export default function PeraturanPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const itemsPerPage = 5;

  // Filter regulations based on category and search query
  const filteredRegulations = useMemo(() => {
    return REGULATIONS_LIST.filter((item) => {
      const matchCategory =
        selectedCategory === "Semua" || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        q === "" ||
        item.docNumber.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.scope.toLowerCase().includes(q);
      return matchCategory && matchQuery;
    });
  }, [searchQuery, selectedCategory]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredRegulations.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRegulations.slice(start, start + itemsPerPage);
  }, [filteredRegulations, currentPage]);

  const handleDownload = (docNumber: string, title: string) => {
    setDownloadNotice(`Mengunduh salinan resmi: ${docNumber} — ${title}...`);
    setTimeout(() => {
      setDownloadNotice(null);
    }, 4000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-text-primary font-sans antialiased">
      {/* 1. Header Navbar */}
      <Navbar />

      <main id="main-content" className="flex-grow">
        {/* 2. Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="bg-surface border-b border-primary-light py-3"
        >
          <div className="container-custom">
            <ol className="flex items-center space-x-2 text-xs text-text-secondary font-medium">
              <li>
                <Link
                  href="/"
                  className="hover:text-primary transition-colors duration-150"
                >
                  Beranda
                </Link>
              </li>
              <li className="flex items-center space-x-2">
                <ChevronRightIcon className="text-[9px] text-silver" />
                <span className="text-primary font-semibold">
                  Peraturan Perpajakan &amp; Kurs KMK
                </span>
              </li>
            </ol>
          </div>
        </nav>

        {/* Download Notification Alert */}
        {downloadNotice && (
          <div className="bg-success text-white py-2.5 px-4 text-xs font-medium text-center shadow-md animate-in fade-in transition-all">
            <CheckCircleIcon className="inline mr-2" />
            {downloadNotice}
          </div>
        )}

        {/* 3. Interactive Search & Category Filter Section */}
        <section className="py-8 bg-surface border-b border-primary-light">
          <div className="container-custom space-y-5">
            <div className="space-y-1.5">
              <Badge variant="silver" className="uppercase tracking-wider text-badge font-semibold py-0.5 px-2.5">
                Pusat Regulasi
              </Badge>
              <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
                Peraturan Perpajakan &amp; Kurs Pajak Mingguan KMK
              </h1>
            </div>

            {/* Search bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full flex-grow">
                <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-silver text-sm" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Cari nomor peraturan, topik, kata kunci (misal: TER 21, Coretax, PPN, KMK)..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white border border-primary-light rounded-md text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary shadow-sm"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setCurrentPage(1);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-secondary hover:text-text-primary px-1.5 py-0.5 rounded hover:bg-surface cursor-pointer transition-colors"
                    title="Hapus pencarian"
                  >
                    Hapus
                  </button>
                )}
              </div>

              <div className="w-full sm:w-auto flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full sm:w-auto text-xs px-5 py-2.5 font-semibold justify-center shadow-sm"
                  onClick={() => setCurrentPage(1)}
                >
                  <SearchIcon className="mr-1.5" />
                  Cari Dokumen
                </Button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mr-1 flex items-center">
                <FilterIcon className="mr-1 text-[10px]" /> Kategori:
              </span>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-full font-semibold transition-all whitespace-nowrap cursor-pointer active:scale-[0.98] ${
                    selectedCategory === cat
                      ? "bg-primary text-white shadow-sm"
                      : "bg-white text-text-secondary border border-primary-light hover:border-primary hover:text-primary hover:bg-surface"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Highlight Section (2 Cards Side-by-Side as in Figma) */}
        <section id="kurs-pajak" className="py-10 bg-white border-b border-primary-light">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Highlight Card 1: Kurs Pajak Mingguan KMK */}
              <Card className="border border-primary-light shadow-sm hover:border-primary transition-all">
                <CardHeader className="pb-3 border-b border-primary-light bg-surface/50">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-[10px] font-bold">
                      KMK No. 38/KM.10/2026
                    </Badge>
                    <span className="text-[11px] text-text-secondary flex items-center">
                      <ClockIcon className="mr-1 text-[10px]" /> 15 – 21 Sep 2026
                    </span>
                  </div>
                  <CardTitle className="text-base font-bold text-primary mt-1">
                    Kurs Pajak Mingguan KMK Terkini
                  </CardTitle>
                  <CardDescription className="text-xs text-text-secondary">
                    Nilai kurs resmi Kementerian Keuangan RI untuk perhitungan dasar pelunasan Bea Masuk, PPN, dan PPh.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {WEEKLY_RATES.slice(0, 6).map((item) => (
                      <div
                        key={item.currency}
                        className="p-2.5 rounded-md bg-surface border border-primary-light"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-primary">{item.currency}</span>
                          <span
                            className={`text-[10px] font-semibold ${
                              item.trend === "up"
                                ? "text-success"
                                : item.trend === "down"
                                ? "text-error"
                                : "text-text-secondary"
                            }`}
                          >
                            {item.change}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-text-primary mt-1">
                          {item.rate}
                        </div>
                        <div className="text-[10px] text-text-secondary truncate mt-0.5">
                          {item.name}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload("KMK No. 38/2026", "Tabel Kurs Valas Mingguan Lengkap")}
                      className="text-xs font-semibold w-full sm:w-auto"
                    >
                      Unduh Salinan KMK (PDF)
                    </Button>
                    <span className="hidden sm:inline text-[11px] text-text-secondary">
                      Sumber: Badan Kebijakan Fiskal
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Highlight Card 2: Pembaruan Regulasi & Coretax Ready */}
              <Card className="border border-primary-light shadow-sm hover:border-primary transition-all">
                <CardHeader className="pb-3 border-b border-primary-light bg-surface/50">
                  <div className="flex items-center justify-between">
                    <Badge variant="success" className="text-[10px] font-bold">
                      Coretax Ready 2026
                    </Badge>
                    <span className="text-[11px] text-text-secondary flex items-center">
                      <CalendarIcon className="mr-1 text-[10px]" /> Berlaku Nasional
                    </span>
                  </div>
                  <CardTitle className="text-base font-bold text-primary mt-1">
                    Pembaruan Sistem Regulasi &amp; SP2DK DJP
                  </CardTitle>
                  <CardDescription className="text-xs text-text-secondary">
                    Ketetapan regulasi transformasi digital perpajakan nasional dan mitigasi surat pengawasan fiskal KPP.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div className="space-y-2 text-xs text-text-secondary">
                    <div className="p-3 rounded-md bg-surface border border-primary-light space-y-1">
                      <div className="font-semibold text-primary flex items-center justify-between">
                        <span>PMK No. 81 Tahun 2024 (Sistem Inti DJP)</span>
                        <span className="text-[10px] text-success font-bold">Resmi</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        Mewajibkan pemadanan NIK-NPWP 16 digit, pembuatan bukti potong unifikasi terpadu, dan akun deposit pajak wajib pajak.
                      </p>
                    </div>

                    <div className="p-3 rounded-md bg-surface border border-primary-light space-y-1">
                      <div className="font-semibold text-primary flex items-center justify-between">
                        <span>Asistensi Permintaan Penjelasan SP2DK KPP</span>
                        <span className="text-[10px] text-primary font-bold">Layanan Prioritas</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        Panduan penanganan surat teguran dan ekualisasi omzet data pihak ketiga (ILAP) bersama konsultan BKP Zhou Consulting.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <Button
                      variant="primary"
                      size="sm"
                      asChild
                      className="text-xs font-semibold w-full sm:w-auto"
                    >
                      <Link href="/layanan/tax-service">
                        Layanan Pajak
                      </Link>
                    </Button>
                    <a
                      href="https://pajak.go.id"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hidden sm:inline text-[11px] text-primary hover:underline font-semibold"
                    >
                      Situs DJP Online
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* 6. Comprehensive Interactive Regulations Table Section */}
        <section id="unduh-peraturan" className="py-12 bg-white">
          <div className="container-custom space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-primary-light pb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-primary">
                  Daftar Arsip Regulasi Perpajakan Resmi
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  Menampilkan {filteredRegulations.length} dokumen hukum perpajakan yang dapat diunduh langsung.
                </p>
              </div>

              <div className="text-xs text-text-secondary flex items-center gap-2">
                <span>Filter aktif:</span>
                <Badge variant="outline" className="text-primary font-semibold text-[11px]">
                  {selectedCategory}
                </Badge>
              </div>
            </div>

            {/* Table */}
            <div className="border border-primary-light rounded-lg overflow-hidden shadow-sm">
              <Table>
                <TableHeader className="bg-surface">
                  <TableRow>
                    <TableHead className="w-[130px] font-bold text-xs text-primary">
                      Nomor Dokumen
                    </TableHead>
                    <TableHead className="font-bold text-xs text-primary min-w-[240px]">
                      Judul &amp; Ruang Lingkup Regulasi
                    </TableHead>
                    <TableHead className="font-bold text-xs text-primary w-[160px]">
                      Kategori
                    </TableHead>
                    <TableHead className="font-bold text-xs text-primary w-[130px]">
                      Berlaku Mulai
                    </TableHead>
                    <TableHead className="font-bold text-xs text-primary w-[100px] text-center">
                      Status
                    </TableHead>
                    <TableHead className="font-bold text-xs text-primary w-[110px] text-right">
                      Aksi Unduh
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item) => (
                      <TableRow key={item.id} className="hover:bg-surface/60 transition-colors">
                        <TableCell className="font-semibold text-xs text-primary align-top">
                          {item.docNumber}
                        </TableCell>
                        <TableCell className="align-top">
                          <div className="text-xs font-semibold text-text-primary">
                            {item.title}
                          </div>
                          <div className="text-[11px] text-text-secondary mt-1 leading-relaxed">
                            {item.scope}
                          </div>
                        </TableCell>
                        <TableCell className="align-top">
                          <Badge variant="outline" className="text-[10px] font-medium">
                            {item.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-text-secondary align-top whitespace-nowrap">
                          {item.effectiveDate}
                        </TableCell>
                        <TableCell className="text-center align-top">
                          <Badge
                            variant={item.status === "Pembaruan" ? "secondary" : "success"}
                            className="text-[10px] font-bold"
                          >
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right align-top">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(item.docNumber, item.title)}
                            className="text-[11px] px-2.5 py-1 h-7 border-primary-light hover:border-primary hover:bg-primary hover:text-white transition-colors"
                            title={`Unduh berkas PDF (${item.fileSize})`}
                          >
                            PDF
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-text-secondary text-xs">
                        Tidak ada dokumen peraturan yang cocok dengan kata kunci pencarian atau filter kategori saat ini.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-primary-light text-xs gap-3">
                <div className="text-text-secondary">
                  Menampilkan halaman <span className="font-bold text-text-primary">{currentPage}</span> dari{" "}
                  <span className="font-bold text-text-primary">{totalPages}</span>
                </div>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => setCurrentPage(page)}
                  className="py-0"
                />
              </div>
            )}
          </div>
        </section>

        {/* 7. Consultation Advisory Callout Section */}
        <section className="py-14 bg-surface border-t border-primary-light">
          <div className="container-custom">
            <div className="p-8 rounded-xl bg-primary-dark text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <Badge
                  variant="outline"
                  className="border-white/20 text-silver bg-white/5 uppercase tracking-wider text-[10px]"
                >
                  Telaah Kepatuhan Hukum Fiskal
                </Badge>
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  Butuh Penelaahan Regulasi Khusus untuk Masalah Pajak Perusahaan?
                </h3>
                <p className="text-xs sm:text-sm text-silver leading-relaxed">
                  Konsultan pajak beregister BKP Zhou Consulting siap memberikan opini fiskal komprehensif, mitigasi denda sanksi keterlambatan SPT, dan asistensi pendampingan SP2DK secara profesional.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <Button
                  variant="silver"
                  size="default"
                  asChild
                  className="font-semibold text-xs px-6 py-3 w-full sm:w-auto justify-center"
                >
                  <Link href="/login">
                    Area Klien
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="default"
                  asChild
                  className="border-white/30 text-white hover:bg-white/10 font-semibold text-xs px-6 py-3 w-full sm:w-auto justify-center"
                >
                  <a
                    href="https://wa.me/6281234567890?text=Halo%20Zhou%20Consulting,%20saya%20ingin%20konsultasi%20telaah%20regulasi%20perpajakan%20perusahaan"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <WhatsappIcon className="mr-2 text-sm text-success" />
                    WhatsApp Konsultan
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 8. Footer */}
      <Footer />

      {/* 9. Floating WhatsApp CTA */}
      <FloatingWhatsAppCTA />
    </div>
  );
}
