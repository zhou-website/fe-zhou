"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { FloatingWhatsAppCTA } from "@/components/landing/FloatingWhatsAppCTA";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
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
  CloseIcon,
  CheckCircleIcon,
  ChevronRightIcon,
} from "@/components/icons";

import {
  StoredRegulationItem,
  REGULATION_CATEGORIES,
  getStoredRegulations,
  REGULATIONS_EVENT,
  StoredKmkData,
  DEFAULT_KMK_DATA,
  getStoredKmkRates,
  KMK_RATES_EVENT,
} from "@/data/regulasiStorage";

export default function PeraturanPage() {
  const [regulations, setRegulations] = useState<StoredRegulationItem[]>([]);
  const [kmkData, setKmkData] = useState<StoredKmkData>(DEFAULT_KMK_DATA);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [selectedStatus, setSelectedStatus] = useState<string>("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const itemsPerPage = 5;

  // Load from localStorage or defaults and listen to updates from Admin CRUD & KMK
  useEffect(() => {
    setRegulations(getStoredRegulations());
    setKmkData(getStoredKmkRates());

    const handleUpdate = () => {
      setRegulations(getStoredRegulations());
      setKmkData(getStoredKmkRates());
    };

    window.addEventListener(REGULATIONS_EVENT, handleUpdate);
    window.addEventListener(KMK_RATES_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener(REGULATIONS_EVENT, handleUpdate);
      window.removeEventListener(KMK_RATES_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // Total count per category for badge counters
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      Semua: regulations.length,
    };
    REGULATION_CATEGORIES.forEach((cat) => {
      if (cat !== "Semua") {
        counts[cat] = regulations.filter((r) => r.category === cat).length;
      }
    });
    return counts;
  }, [regulations]);

  const handleResetFilters = () => {
    setSelectedCategory("Semua");
    setSelectedStatus("Semua");
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Filter regulations based on category, status, and search query
  const filteredRegulations = useMemo(() => {
    return regulations.filter((item) => {
      const matchCategory =
        selectedCategory === "Semua" || item.category === selectedCategory;
      const matchStatus =
        selectedStatus === "Semua" || item.status === selectedStatus;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        q === "" ||
        item.docNumber.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.scope.toLowerCase().includes(q);
      return matchCategory && matchStatus && matchQuery;
    });
  }, [regulations, searchQuery, selectedCategory, selectedStatus]);

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

      <main id="main-content" className="flex-1 flex flex-col">
        {/* Download Notification Alert */}
        {downloadNotice && (
          <div className="bg-success text-white py-2.5 px-4 text-xs font-medium text-center shadow-md animate-in fade-in transition-all">
            <CheckCircleIcon className="inline mr-2" />
            {downloadNotice}
          </div>
        )}

        {/* 2. Top Section: Arsip Regulasi Perpajakan Resmi (Pencarian & Tabel Peraturan) */}
        <section id="unduh-peraturan" className="py-12 md:py-16 bg-surface border-b border-primary-light">
          <div className="container-custom space-y-6">
            <nav aria-label="Breadcrumb">
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
            </nav>

            <div className="space-y-2">
              <Badge variant="silver" className="uppercase tracking-wider text-badge font-semibold py-0.5 px-2.5">
                Pusat Regulasi Perpajakan
              </Badge>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary tracking-tight">
                Daftar Arsip Regulasi Perpajakan Resmi
              </h1>
              <p className="text-body-regular text-text-secondary max-w-4xl leading-relaxed">
                Akses langsung ke regulasi induk perpajakan nasional, harmonisasi UU HPP, dan petunjuk teknis implementasi perpajakan yang dapat disaring dan diunduh langsung.
              </p>
            </div>

            {/* Filter & Pencarian Dokumen Regulasi */}
            <div className="bg-white p-4 rounded-xl border border-primary-light space-y-3.5 shadow-xs">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-8 relative">
                  <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-silver text-xs" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Saring cepat nomor dokumen, judul, atau ruang lingkup peraturan..."
                    className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-primary-light rounded-lg text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary shadow-2xs"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setCurrentPage(1);
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-text-secondary hover:text-text-primary p-1 cursor-pointer"
                      title="Hapus pencarian"
                    >
                      <CloseIcon className="text-[10px]" />
                    </button>
                  )}
                </div>

                <div className="sm:col-span-4 flex items-center gap-2">
                  <div className="w-full">
                    <Select
                      value={selectedStatus}
                      onChange={(e) => {
                        setSelectedStatus(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="text-xs h-9 py-1 px-3"
                    >
                      <option value="Semua">Semua Status</option>
                      <option value="Berlaku">Status: Berlaku</option>
                      <option value="Pembaruan">Status: Pembaruan</option>
                    </Select>
                  </div>

                  {(selectedCategory !== "Semua" || selectedStatus !== "Semua" || searchQuery) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResetFilters}
                      className="text-xs px-3 h-9 shrink-0 text-text-secondary hover:text-error hover:border-error"
                      title="Reset semua filter"
                    >
                      Reset
                    </Button>
                  )}
                </div>
              </div>

              {/* Category Pills directly above table */}
              <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-primary-light/60 pb-1 text-xs">
                <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mr-1 shrink-0 flex items-center">
                  <FilterIcon className="mr-1 text-[10px]" /> Kategori:
                </span>
                {REGULATION_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-full font-semibold transition-all whitespace-nowrap cursor-pointer active:scale-[0.98] text-xs ${
                      selectedCategory === cat
                        ? "bg-primary text-white shadow-sm"
                        : "bg-surface text-text-secondary border border-primary-light hover:border-primary hover:text-primary hover:bg-white"
                    }`}
                  >
                    {cat} <span className="opacity-80 text-[10px]">({categoryCounts[cat] || 0})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Header info tabel regulasi */}
            <div className="flex items-center justify-between text-xs text-text-secondary pt-1">
              <div>
                Menampilkan <span className="font-semibold text-text-primary">{filteredRegulations.length}</span> dari {regulations.length} dokumen hukum perpajakan resmi.
              </div>
              {(selectedCategory !== "Semua" || selectedStatus !== "Semua" || searchQuery) && (
                <div className="flex items-center gap-1">
                  <span>Filter: <strong>{selectedCategory}</strong> ({selectedStatus})</span>
                </div>
              )}
            </div>

            {/* Tabel Arsip Peraturan */}
            <div className="border border-primary-light rounded-lg overflow-hidden shadow-sm bg-white">
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
                          {item.category === "Regulasi Zhou" ? (
                            <Badge variant="primary" className="text-[10px] font-bold bg-primary text-white border-primary shadow-2xs">
                              {item.category}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] font-medium">
                              {item.category}
                            </Badge>
                          )}
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
                      <TableCell colSpan={6} className="text-center py-12 text-text-secondary text-xs space-y-3">
                        <p>Tidak ada dokumen peraturan yang cocok dengan kata kunci pencarian atau filter saat ini.</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleResetFilters}
                          className="text-xs mt-2 font-semibold"
                        >
                          Reset Pencarian &amp; Filter
                        </Button>
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

        {/* 3. Bottom Section: Kurs Pajak Mingguan Menteri Keuangan (KMK) */}
        <section id="kurs-pajak" className="py-14 md:py-20 bg-white flex-1">
          <div className="container-custom space-y-6">
            <div className="space-y-2">
              <Badge variant="silver" className="uppercase tracking-wider text-badge font-semibold py-0.5 px-2.5">
                Kurs Pajak Mingguan KMK
              </Badge>
              <h2 className="text-xl sm:text-2xl font-bold text-primary tracking-tight">
                Kurs Pajak Mingguan Menteri Keuangan (KMK)
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary max-w-4xl leading-relaxed">
                Nilai kurs resmi Kementerian Keuangan Republik Indonesia sebagai acuan dasar pelunasan Bea Masuk, Pajak Pertambahan Nilai (PPN), dan PPh Pasal 22 Impor yang terupdate berkala.
              </p>
            </div>

            {/* Tabel Kurs KMK (Lebar Presisi Penuh Kontainer) */}
            <div className="space-y-4">
              <div className="rounded-lg border border-primary-light bg-white overflow-hidden shadow-sm">
                <div className="bg-surface px-5 py-4 border-b border-primary-light flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-primary">
                        Kurs Menteri Keuangan (KMK)
                      </h3>
                      <Badge variant="secondary" size="sm">
                        {kmkData.kmkNumber}
                      </Badge>
                    </div>
                    <span className="text-xs text-text-secondary mt-0.5 block">
                      Periode Aktif: {kmkData.period}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={kmkData.officialDjpUrl || "https://fiskal.kemenkeu.go.id/informasi-publik/kurs-pajak"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-primary-light bg-white text-primary text-xs font-semibold hover:border-primary hover:bg-surface transition-all shadow-2xs"
                      title="Buka portal resmi Kurs Pajak Badan Kebijakan Fiskal / DJP di tab baru"
                    >
                      <span>Lihat Kurs Resmi DJP</span>
                      <svg className="w-3.5 h-3.5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(kmkData.kmkNumber, "Tabel Kurs Valas Mingguan Lengkap")}
                      className="text-xs font-semibold hover:border-primary hover:text-primary transition-colors cursor-pointer"
                    >
                      Unduh Salinan KMK (PDF)
                    </Button>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="py-3 px-5">Mata Uang</TableHead>
                      <TableHead className="py-3 px-5">Nama Valuta</TableHead>
                      <TableHead className="py-3 px-5 text-right">Nilai Kurs (IDR)</TableHead>
                      <TableHead className="py-3 px-5 text-right">Fluktuasi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {kmkData.rates.map((item) => (
                      <TableRow key={item.currency} className="hover:bg-surface/50">
                        <TableCell className="py-3 px-5 font-bold text-primary">
                          {item.currency}
                        </TableCell>
                        <TableCell className="py-3 px-5 text-text-secondary text-xs">
                          {item.name}
                        </TableCell>
                        <TableCell className="py-3 px-5 text-right font-semibold text-text">
                          {item.rate}
                        </TableCell>
                        <TableCell className="py-3 px-5 text-right text-xs">
                          <span
                            className={
                              item.trend === "up"
                                ? "text-success font-semibold inline-flex items-center gap-1"
                                : "text-text-secondary font-medium inline-flex items-center gap-1"
                            }
                          >
                            {item.change}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-[11px] text-text-secondary gap-2">
                <p>
                  * Nilai kurs KMK digunakan sebagai dasar pelunasan Bea Masuk, Pajak Pertambahan Nilai (PPN) Barang dan Jasa, serta Pajak Penghasilan (PPh) Pasal 22 Impor.
                </p>
                <div className="flex items-center gap-1.5 shrink-0 text-text-secondary">
                  <span className="w-1.5 h-1.5 rounded-full bg-success inline-block"></span>
                  <span>Terupdate berkala pada website Zhou (Rilis: {kmkData.lastUpdated})</span>
                </div>
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
