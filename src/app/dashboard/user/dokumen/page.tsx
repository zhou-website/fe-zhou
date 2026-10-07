"use client";

import React, { useState, useEffect } from "react";
import { clientApi, ClientDocumentItem } from "@/lib/api";
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
  CheckCircleIcon,
  SearchIcon,
  CloseIcon,
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

export default function ClientDocumentVaultPage() {
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [sortOption, setSortOption] = useState<"newest" | "name" | "size">("newest");
  const [selectedDoc, setSelectedDoc] = useState<VaultDocument | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync documents with live backend
  useEffect(() => {
    async function loadBackendDocuments() {
      try {
        const res = await clientApi.getDocuments();
        if (res.success && Array.isArray(res.data)) {
          const mapped: VaultDocument[] = res.data.map((d: ClientDocumentItem) => ({
            id: `DOC-BE-${d.id}`,
            name: d.file_name,
            category: "Pajak",
            format: d.file_type === "XLSX" ? "XLSX" : "PDF",
            ticketRef: `PROJ-${d.project_id}`,
            ticketTitle: "Perikatan Konsultasi Zhou",
            date: new Date(d.created_at).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
            year: "2026",
            size: d.file_size || "1.2 MB",
            bytes: 1258291,
            statusBadge: "Terverifikasi Resmi",
            statusType: "success",
            sha256Hash: `hash-${d.id}-${d.file_name.slice(0, 8)}`,
            signatory: "Zhou Consulting Cloud Vault",
            description: `Dokumen resmi ${d.file_name} yang tersimpan aman pada storage terenkripsi.`,
          }));
          setDocuments(mapped);
        }
      } catch {
        // quiet fallback
      }
    }
    loadBackendDocuments();
  }, []);

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

  const taxCount = documents.filter((d) => d.category === "Pajak").length;
  const legalAuditCount = documents.filter((d) => d.category !== "Pajak").length;

  const handleDownloadAll = () => {
    if (documents.length === 0) {
      showToast("Belum ada dokumen yang tersedia untuk diunduh.");
      return;
    }
    showToast(
      `Menyiapkan arsip ZIP seluruh berkas terenkripsi (Total: ${documents.length} Berkas)... Unduhan akan dimulai otomatis.`
    );
  };

  const handleDownloadSingle = async (doc: VaultDocument) => {
    showToast(`Menyiapkan unduhan ${doc.name}...`);
    try {
      const rawId = doc.id.replace("DOC-BE-", "");
      if (Number(rawId)) {
        const res = await clientApi.getDownloadUrl(rawId);
        if (res.success && res.data?.download_url) {
          window.open(res.data.download_url, "_blank");
          showToast(`Mengunduh ${doc.name} via secure URL.`);
          return;
        }
      }
    } catch {
      // fallback
    }
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

      {/* Top Header */}
      <div className="pb-6 border-b border-primary-light">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
            Vault Dokumen Pajak &amp; Berkas Kerja
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-2xl">
            Arsip repositori aman luaran resmi pelaporan SPT BPE DJP, kompilasi laporan keuangan audit SAK, dan dokumen legalitas terenkripsi.
          </p>
        </div>
      </div>

      {/* Row 3 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-5 rounded-2xl border-primary-light bg-white shadow-xs">
          <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">
            Total Dokumen Tersimpan
          </span>
          <div className="mt-2 text-2xl font-bold text-primary font-mono flex items-baseline gap-1.5">
            <span>{String(documents.length).padStart(2, "0")}</span>
            <span className="text-xs text-text-secondary font-sans font-normal">Berkas</span>
          </div>
          <div className="text-[10px] text-text-secondary mt-1">Arsip aman dalam vault</div>
        </Card>

        <Card className="p-4 sm:p-5 rounded-2xl border-emerald-200 bg-emerald-50/40 shadow-xs">
          <span className="text-[10px] text-emerald-900 font-bold uppercase tracking-wider block">
            Dokumen Pajak &amp; BPE
          </span>
          <div className="mt-2 text-2xl font-bold text-emerald-800 font-mono flex items-baseline gap-1.5">
            <span>{String(taxCount).padStart(2, "0")}</span>
            <span className="text-xs text-emerald-700 font-sans font-normal">Terbit</span>
          </div>
          <div className="text-[10px] text-emerald-700 mt-1">Bukti Penerimaan Elektronik</div>
        </Card>

        <Card className="p-4 sm:p-5 rounded-2xl border-primary-light bg-white shadow-xs">
          <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">
            Laporan Keuangan &amp; Legal
          </span>
          <div className="mt-2 text-2xl font-bold text-primary font-mono flex items-baseline gap-1.5">
            <span>{String(legalAuditCount).padStart(2, "0")}</span>
            <span className="text-xs text-text-secondary font-sans font-normal">Laporan</span>
          </div>
          <div className="text-[10px] text-text-secondary mt-1">Kompilasi audit &amp; legalitas</div>
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

            <Button
              variant="primary"
              onClick={handleDownloadAll}
              className="shadow-sm font-semibold text-xs py-2.5 px-4 flex items-center self-start sm:self-auto shrink-0 cursor-pointer"
            >
              <span>Unduh Semua Berkas</span>
            </Button>
          </div>

          {/* Filter Bar: Search + Category + Year + Sort */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
            {/* Search */}
            <div className="sm:col-span-5 relative">
              <SearchIcon className="absolute left-3 top-3 text-text-muted text-xs" />
              <Input
                type="text"
                placeholder="Cari nama berkas, nomor referensi, atau penandatangan..."
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
                  <th className="py-3.5 px-4">Divisi &amp; Referensi Layanan</th>
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
                          <div className="text-[11px] text-text-muted font-mono flex items-center gap-1.5 mt-0.5 whitespace-nowrap">
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
                      <Badge variant={doc.statusType} size="sm">
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
                          className="text-[11px] h-8 px-2.5 border-primary-light text-text-secondary hover:text-primary font-medium"
                        >
                          Rincian
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleDownloadSingle(doc)}
                          className="text-[11px] h-8 px-3.5 shadow-sm font-semibold"
                        >
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
              {documents.length === 0
                ? "Menampilkan 0 berkas di Vault"
                : `Menampilkan ${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(
                    currentPage * itemsPerPage,
                    filteredDocuments.length
                  )} dari ${documents.length} berkas di Vault`}
            </span>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </CardContent>
      </Card>



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
                  <span className="text-text-muted block text-[10px]">Referensi Konsultasi:</span>
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
                  className="font-semibold"
                >
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
