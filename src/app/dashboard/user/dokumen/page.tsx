"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  DocumentIcon,
  DownloadIcon,
  CheckCircleIcon,
  ShieldTaxIcon,
  SearchIcon,
  CloseIcon,
  BriefcaseIcon,
  BookIcon,
} from "@/components/icons";

interface VaultDocument {
  id: string;
  name: string;
  category: "Pajak" | "Akuntansi" | "Legal";
  format: "PDF" | "XLSX";
  ticketRef: string;
  ticketTitle: string;
  date: string;
  year: "2026" | "2025";
  size: string;
  bytes: number;
  statusBadge: string;
  statusType: "success" | "primary" | "silver";
  sha256Hash: string;
  signatory: string;
  description: string;
}

const INITIAL_DOCUMENTS: VaultDocument[] = [
  {
    id: "DOC-2026-001",
    name: "BPE_SPT_Masa_PPN_1111_Masa_Agustus_2026.pdf",
    category: "Pajak",
    format: "PDF",
    ticketRef: "TK-2026-089",
    ticketTitle: "Pelaporan SPT Tahunan Badan & Ekualisasi Fiskal",
    date: "16 Sep 2026",
    year: "2026",
    size: "1.2 MB",
    bytes: 1258291,
    statusBadge: "Terverifikasi BPE DJP",
    statusType: "success",
    sha256Hash: "8f2a9c4b1e5d7a8f3b2c1e4d5a6f7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4",
    signatory: "DJP Coretax System & Linda David, S.Ak., BKP",
    description: "Bukti Penerimaan Elektronik resmi pelaporan SPT Masa PPN 1111 Masa Pajak Agustus 2026 dengan QR Code DJP valid.",
  },
  {
    id: "DOC-2026-002",
    name: "Kertas_Kerja_Ekualisasi_Fiskal_PPh_Badan_2026.xlsx",
    category: "Pajak",
    format: "XLSX",
    ticketRef: "TK-2026-089",
    ticketTitle: "Pelaporan SPT Tahunan Badan & Ekualisasi Fiskal",
    date: "15 Sep 2026",
    year: "2026",
    size: "2.4 MB",
    bytes: 2516582,
    statusBadge: "Final Review Disetujui",
    statusType: "success",
    sha256Hash: "3e5a7f9b1c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4",
    signatory: "Linda David, S.Ak., BKP (Lead Tax Consultant)",
    description: "Kertas kerja rekonsiliasi peredaran bruto dan penyesuaian koreksi fiskal positif/negatif sesuai ketentuan PMK 81/2024.",
  },
  {
    id: "DOC-2026-003",
    name: "Laporan_Keuangan_SAK_Q2_2026_Final_Audited.pdf",
    category: "Akuntansi",
    format: "PDF",
    ticketRef: "TK-2026-042",
    ticketTitle: "Kompilasi Laporan Keuangan Berstandar SAK EP Q2 2026",
    date: "28 Agu 2026",
    year: "2026",
    size: "3.8 MB",
    bytes: 3984588,
    statusBadge: "Audit KAP Disetujui",
    statusType: "success",
    sha256Hash: "1b3d5f7a9c1e3b5d7f9a1c3e5b7d9f1a3c5e7b9d1f3a5c7e9b1d3f5a7c9e1b3",
    signatory: "Tasya Anggraeni Firdaus, SE. (Chartered Accountant)",
    description: "Laporan posisi keuangan neraca, laporan laba rugi, dan catatan atas laporan keuangan (CALK) standar SAK EP.",
  },
  {
    id: "DOC-2026-004",
    name: "Ledger_Buku_Besar_Rekonsiliasi_Bank_Q2.xlsx",
    category: "Akuntansi",
    format: "XLSX",
    ticketRef: "TK-2026-042",
    ticketTitle: "Kompilasi Laporan Keuangan Berstandar SAK EP Q2 2026",
    date: "28 Agu 2026",
    year: "2026",
    size: "5.1 MB",
    bytes: 5347737,
    statusBadge: "Terverifikasi SAK",
    statusType: "primary",
    sha256Hash: "7c9e1b3d5f7a9c1e3b5d7f9a1c3e5b7d9f1a3c5e7b9d1f3a5c7e9b1d3f5a7c9",
    signatory: "Tasya Anggraeni Firdaus, SE. (Senior Accountant)",
    description: "Buku besar umum rekonsiliasi tiga rekening koran korporat serta mutasi kas operasional kuartal kedua 2026.",
  },
  {
    id: "DOC-2026-005",
    name: "Legal_Opinion_Kontrak_Vendor_Pengadaan_PT_MMS.pdf",
    category: "Legal",
    format: "PDF",
    ticketRef: "TK-2026-015",
    ticketTitle: "Tinjauan Hukum Kontrak Vendor & Kepatuhan PPN",
    date: "10 Agu 2026",
    year: "2026",
    size: "1.9 MB",
    bytes: 1992294,
    statusBadge: "Tandatangan Advokat",
    statusType: "success",
    sha256Hash: "4d6f8a0b2c4e6f8a0b2c4e6f8a0b2c4e6f8a0b2c4e6f8a0b2c4e6f8a0b2c4e6",
    signatory: "Muhamad Dekhsa Afnan, SH., M.Kn. (Advokat PERADI)",
    description: "Pendapat hukum advokat terkait mitigasi klausul wanprestasi dan tanggung renteng faktur pajak pada kontrak vendor pengadaan.",
  },
  {
    id: "DOC-2026-006",
    name: "Pakta_Integritas_Kerahasiaan_NDA_PT_MMS_2026.pdf",
    category: "Legal",
    format: "PDF",
    ticketRef: "MASTER-DOC",
    ticketTitle: "Perjanjian Kerahasiaan Induk Zhou Consulting",
    date: "01 Jan 2026",
    year: "2026",
    size: "850 KB",
    bytes: 870400,
    statusBadge: "Terikat UU PDP",
    statusType: "primary",
    sha256Hash: "9a0b2c4e6f8a0b2c4e6f8a0b2c4e6f8a0b2c4e6f8a0b2c4e6f8a0b2c4e6f8a0",
    signatory: "Managing Partner Zhou Consulting & Direktur Utama PT MMS",
    description: "Non-Disclosure Agreement resmi yang mengikat perlindungan kerahasiaan seluruh dokumen fiskal dan finansial klien.",
  },
];

export default function ClientDocumentVaultPage() {
  const [documents] = useState<VaultDocument[]>(INITIAL_DOCUMENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [sortOption, setSortOption] = useState<"newest" | "name" | "size">("newest");
  const [selectedDoc, setSelectedDoc] = useState<VaultDocument | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filter and Sorting Logic
  const filteredDocuments = documents
    .filter((doc) => {
      // Category Filter
      if (categoryFilter !== "all" && doc.category !== categoryFilter) return false;

      // Year Filter
      if (yearFilter !== "all" && doc.year !== yearFilter) return false;

      // Search Query
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchName = doc.name.toLowerCase().includes(q);
        const matchTicket = doc.ticketRef.toLowerCase().includes(q);
        const matchSignatory = doc.signatory.toLowerCase().includes(q);
        if (!matchName && !matchTicket && !matchSignatory) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortOption === "name") {
        return a.name.localeCompare(b.name);
      }
      if (sortOption === "size") {
        return b.bytes - a.bytes;
      }
      // Default: newest
      return b.id.localeCompare(a.id);
    });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, yearFilter, searchQuery, sortOption]);

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage) || 1;
  const paginatedDocuments = filteredDocuments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDownloadAll = () => {
    showToast(
      "Menyiapkan arsip ZIP seluruh berkas terenkripsi (Total: 6 Berkas, 15.2 MB)... Unduhan akan dimulai otomatis."
    );
  };

  const handleDownloadSingle = (doc: VaultDocument) => {
    showToast(`Mengunduh ${doc.name} (Enkripsi SSL 256-bit terverifikasi).`);
  };

  return (
    <div className="space-y-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary text-white text-xs font-semibold py-3 px-5 rounded-xl shadow-2xl border border-white/20 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircleIcon className="text-success text-base" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-silver hover:text-white ml-2"
          >
            <CloseIcon className="text-xs" />
          </button>
        </div>
      )}

      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-primary-light">
        <div>
          <div className="flex items-center gap-2 text-xs text-text-muted mb-1.5">
            <Link href="/dashboard/user" className="hover:text-primary transition-colors">
              Dashboard Saya
            </Link>
            <span>/</span>
            <span className="text-primary font-bold">Dokumen Pajak</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
            Vault Dokumen Pajak &amp; Berkas Kerja
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-2xl">
            Arsip repositori aman luaran resmi pelaporan SPT BPE DJP, kompilasi laporan keuangan audit SAK, dan dokumen legalitas terenkripsi.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleDownloadAll}
          className="shadow-sm font-semibold text-xs py-2.5 px-5 flex items-center gap-2 self-start sm:self-auto"
        >
          <DownloadIcon className="text-xs" />
          <span>Unduh Semua Berkas (ZIP)</span>
        </Button>
      </div>

      {/* Row 3 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="rounded-xl border-primary-light bg-white p-5 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-text-muted font-medium">Total Dokumen Tersimpan</span>
              <div className="text-3xl font-bold text-primary">06</div>
              <span className="text-[11px] text-text-secondary">Arsip aktif terenkripsi</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xl">
              <DocumentIcon />
            </div>
          </div>
        </Card>

        <Card className="rounded-xl border-primary-light bg-white p-5 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-text-muted font-medium">Dokumen Pajak &amp; BPE</span>
              <div className="text-3xl font-bold text-success">02</div>
              <span className="text-[11px] text-text-secondary">Terverifikasi DJP Coretax</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-success/15 flex items-center justify-center text-success text-xl">
              <ShieldTaxIcon />
            </div>
          </div>
        </Card>

        <Card className="rounded-xl border-primary-light bg-white p-5 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-text-muted font-medium">Laporan Keuangan &amp; Legal</span>
              <div className="text-3xl font-bold text-primary">04</div>
              <span className="text-[11px] text-text-secondary">Audit SAK &amp; Opini Advokat</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xl">
              <BriefcaseIcon />
            </div>
          </div>
        </Card>
      </div>

      {/* SEARCH, FILTER & TABLE CONTAINER */}
      <Card className="rounded-2xl border-primary-light bg-white shadow-sm overflow-hidden">
        <CardHeader className="p-5 sm:p-6 border-b border-primary-light space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base sm:text-lg font-bold text-primary">
                Daftar Seluruh Berkas Vault Klien
              </CardTitle>
              <CardDescription className="text-xs text-text-secondary mt-0.5">
                Setiap dokumen dilengkapi hash integritas SHA-256 dan terproteksi perjanjian kerahasiaan NDA.
              </CardDescription>
            </div>
            <div className="text-xs text-text-muted">
              Menampilkan <span className="font-bold text-primary">{filteredDocuments.length}</span> dari {documents.length} berkas
            </div>
          </div>

          {/* Filter Bar: Search + Category + Year + Sort */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
            {/* Search */}
            <div className="sm:col-span-5 relative">
              <SearchIcon className="absolute left-3 top-3 text-text-muted text-xs" />
              <Input
                type="text"
                placeholder="Cari nama berkas, nomor tiket, atau penandatangan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs h-9 bg-surface border-primary-light"
              />
            </div>

            {/* Category */}
            <div className="sm:col-span-3">
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs h-9 bg-surface border-primary-light"
              >
                <option value="all">Semua Kategori</option>
                <option value="Pajak">Pajak (BPE &amp; Fiskal)</option>
                <option value="Akuntansi">Akuntansi (Laporan SAK)</option>
                <option value="Legal">Legal (Opini &amp; NDA)</option>
              </Select>
            </div>

            {/* Fiscal Year */}
            <div className="sm:col-span-2">
              <Select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="text-xs h-9 bg-surface border-primary-light"
              >
                <option value="all">Semua Tahun</option>
                <option value="2026">Tahun 2026</option>
                <option value="2025">Tahun 2025</option>
              </Select>
            </div>

            {/* Sort */}
            <div className="sm:col-span-2">
              <Select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as "newest" | "name" | "size")}
                className="text-xs h-9 bg-surface border-primary-light"
              >
                <option value="newest">Terbaru</option>
                <option value="name">Nama (A-Z)</option>
                <option value="size">Ukuran File</option>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface/80 text-text-secondary font-bold uppercase tracking-wider text-[10px] border-b border-primary-light">
                <tr>
                  <th className="py-3.5 px-4">Nama Dokumen &amp; Format</th>
                  <th className="py-3.5 px-4">Divisi &amp; Referensi Tiket</th>
                  <th className="py-3.5 px-4">Tanggal &amp; Ukuran</th>
                  <th className="py-3.5 px-4">Status Keabsahan</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-light">
                {paginatedDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-surface/50 transition-colors">
                    {/* File Name & Format */}
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                            doc.format === "PDF"
                              ? "bg-red-50 text-error border border-red-200"
                              : "bg-emerald-50 text-success border border-emerald-200"
                          }`}
                        >
                          {doc.format}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-primary truncate max-w-xs sm:max-w-sm" title={doc.name}>
                            {doc.name}
                          </div>
                          <div className="text-[11px] text-text-muted font-mono flex items-center gap-1.5 mt-0.5">
                            <span>ID: {doc.id}</span>
                            <span>&bull;</span>
                            <span className="text-primary font-semibold">{doc.signatory}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category & Ticket Ref */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-text-primary text-xs">
                          {doc.category}
                        </span>
                        <div className="font-mono text-[11px] text-primary">
                          {doc.ticketRef}
                        </div>
                      </div>
                    </td>

                    {/* Date & Size */}
                    <td className="py-3.5 px-4 text-text-secondary text-xs">
                      <div>{doc.date}</div>
                      <div className="font-mono text-[11px] text-text-muted">{doc.size}</div>
                    </td>

                    {/* Verified Status */}
                    <td className="py-3.5 px-4">
                      <Badge variant={doc.statusType} size="sm" dot>
                        {doc.statusBadge}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedDoc(doc)}
                          className="text-[11px] h-8 px-2.5 border-primary-light text-text-secondary hover:text-primary"
                        >
                          Rincian
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleDownloadSingle(doc)}
                          className="text-[11px] h-8 px-3.5 flex items-center gap-1.5 shadow-sm"
                        >
                          <DownloadIcon className="text-xs" />
                          <span>Unduh</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredDocuments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-text-muted">
                      Tidak ditemukan berkas dokumen dengan filter pencarian tersebut.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="p-4 border-t border-primary-light bg-surface/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-text-muted">
            <span>
              Menampilkan {(currentPage - 1) * itemsPerPage + 1} &ndash;{" "}
              {Math.min(currentPage * itemsPerPage, filteredDocuments.length)} dari {documents.length} berkas di Vault
            </span>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </CardContent>
      </Card>

      {/* COMPLIANCE & SECURITY ASSURANCE BANNER */}
      <div className="p-6 rounded-2xl bg-surface border border-primary-light grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-base shrink-0">
            <ShieldTaxIcon />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-primary">Enkripsi 256-Bit SSL/TLS</h4>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              Seluruh berkas pelaporan dan kertas kerja tersimpan dengan enkripsi standar korporat perbankan.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-success/15 flex items-center justify-center text-success text-base shrink-0">
            <CheckCircleIcon />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-primary">Kepatuhan UU PDP No. 27/2022</h4>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              Data finansial klien terlindungi pakta integritas dan tidak pernah dibagikan ke pihak ketiga.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-base shrink-0">
            <BookIcon className="text-sm" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-primary">Audit Trail Terverifikasi</h4>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              Setiap aktivitas unduh dan akses dokumen dicatat secara otomatis dalam sistem log audit perusahaan.
            </p>
          </div>
        </div>
      </div>

      {/* DETAIL MODAL: METADATA & KEABSAHAN DOKUMEN */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl border border-primary-light shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-5 border-b border-primary-light flex items-center justify-between bg-surface">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center text-sm font-bold">
                  {selectedDoc.format}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-primary">Rincian Keabsahan Dokumen</h3>
                  <p className="text-[11px] text-text-muted">{selectedDoc.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-text-muted hover:text-primary p-1 rounded"
              >
                <CloseIcon className="text-base" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <span className="text-[11px] text-text-muted">Nama Berkas:</span>
                <div className="font-bold text-primary text-sm break-all">
                  {selectedDoc.name}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-surface rounded-xl border border-primary-light">
                <div>
                  <span className="text-text-muted block text-[10px]">Kategori:</span>
                  <span className="font-semibold text-primary">{selectedDoc.category}</span>
                </div>
                <div>
                  <span className="text-text-muted block text-[10px]">Ukuran Berkas:</span>
                  <span className="font-semibold text-primary">{selectedDoc.size}</span>
                </div>
                <div>
                  <span className="text-text-muted block text-[10px]">Tanggal Terbit:</span>
                  <span className="font-semibold text-primary">{selectedDoc.date}</span>
                </div>
                <div>
                  <span className="text-text-muted block text-[10px]">Referensi Tiket:</span>
                  <span className="font-mono font-bold text-primary">{selectedDoc.ticketRef}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] text-text-muted">Penandatangan / Verifikator:</span>
                <div className="p-2.5 rounded-lg bg-surface text-text-primary font-medium flex items-center gap-2">
                  <CheckCircleIcon className="text-success text-sm shrink-0" />
                  <span>{selectedDoc.signatory}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] text-text-muted">Integritas Hash SHA-256:</span>
                <div className="p-2.5 rounded-lg bg-surface font-mono text-[10px] text-text-secondary break-all select-all border border-primary-light">
                  {selectedDoc.sha256Hash}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-text-muted">Keterangan Dokumen:</span>
                <p className="text-text-secondary leading-relaxed bg-surface p-2.5 rounded-lg">
                  {selectedDoc.description}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-primary-light">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDoc(null)}
                >
                  Tutup
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    handleDownloadSingle(selectedDoc);
                    setSelectedDoc(null);
                  }}
                  className="flex items-center gap-1.5"
                >
                  <DownloadIcon className="text-xs" />
                  <span>Unduh Berkas Ini</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
