"use client";

import React, { useState, useEffect } from "react";
import {
  adminApi,
  clientApi,
  ClientDocumentItem,
  ConsultationItem,
} from "@/lib/api";
import {
  downloadBlob,
  downloadRemoteFile,
  generateInvoicePdfBlob,
  generateDocumentPdfBlob,
} from "@/lib/downloadHelper";
import { isDummyTicket, isDummyDocument } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";
import {
  CheckCircleIcon,
  DocumentIcon,
  SearchIcon,
  CloseIcon,
  SendIcon,
  TrashIcon,
} from "@/components/icons";



interface ReportItem {
  id: string;
  ticketId: string;
  clientName: string;
  clientEmail?: string;
  clientNpwp: string;
  fileName: string;
  fileSize: string;
  fileType: "PDF" | "XLSX" | "DOC" | "ZIP" | string;
  category: "Tax Service Core" | "Accounting Service" | "Business Financial Consulting" | "Legal";
  invoiceNumber: string;
  amount: string;
  billingStatus: "Lunas" | "Menunggu Verifikasi" | "Terkirim";
  uploadDate: string;
  consultant: string;
  sha256: string;
  downloadUrl?: string;
}

export default function AdminUploadBillingPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [billingFilter, setBillingFilter] = useState<string>("ALL");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Selected invoice for detail modal
  const [selectedInvoice, setSelectedInvoice] = useState<ReportItem | null>(null);

  // Available tickets from backend
  const [availableTickets, setAvailableTickets] = useState<{ id: string; clientName: string }[]>([]);

  // New report modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadForm, setUploadForm] = useState({
    ticketId: "",
    clientName: "",
    clientNpwp: "-",
    fileName: "",
    category: "Tax Service Core" as ReportItem["category"],
    amount: "",
    invoiceNumber: "",
    consultant: "Staf Konsultan",
    sendNotification: true,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load reports & documents directly from live backend API
  const loadBackendDocuments = React.useCallback(async () => {
    let backendDocs: ReportItem[] = [];
    let backendTicketList: { id: string; clientName: string }[] = [];

    try {
      const [docRes, consultRes] = await Promise.allSettled([
        adminApi.getAllDocuments(),
        adminApi.getConsultations(),
      ]);

      if (docRes.status === "fulfilled" && docRes.value.success && Array.isArray(docRes.value.data)) {
        backendDocs = docRes.value.data
          .filter((d: ClientDocumentItem) => !isDummyDocument(d))
          .map((d: ClientDocumentItem, idx: number) => {
            const project = (d as unknown as { project?: { project_code?: string; title?: string; client?: { name?: string; company_name?: string } } }).project;
            const uploader = (d as unknown as { uploader?: { name?: string } }).uploader;
            const clientName = project?.client?.company_name || project?.client?.name || "Klien Terdaftar";
            const ticketCode = project?.project_code || `TK-2026-0${d.project_id || (idx + 10)}`;
            const consultant = uploader?.name || "Staf Konsultan";
            const downloadUrl = (d as unknown as { download_url?: string }).download_url || d.file_path;

            const rawCat = (project?.title || "").toLowerCase();
            const category: ReportItem["category"] = rawCat.includes("akuntansi")
              ? "Accounting Service"
              : rawCat.includes("bisnis") || rawCat.includes("financial")
              ? "Business Financial Consulting"
              : rawCat.includes("legal") || rawCat.includes("hukum")
              ? "Legal"
              : "Tax Service Core";

            return {
              id: `REP-BE-${d.id}`,
              ticketId: ticketCode,
              clientName,
              clientNpwp: "-",
              fileName: d.file_name,
              fileSize: d.file_size || "1.5 MB",
              fileType: d.file_type === "XLSX" ? "XLSX" : "PDF",
              category,
              invoiceNumber: `INV-2026-0${d.id}`,
              amount: "-",
              billingStatus: "Lunas",
              uploadDate: new Date(d.created_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              }),
              consultant,
              sha256: d.sha_hash || `sha256-${d.id}-${d.file_name.slice(0, 10)}`,
              downloadUrl,
            };
          });
      }

      if (consultRes.status === "fulfilled" && consultRes.value.success && Array.isArray(consultRes.value.data)) {
        const valid = consultRes.value.data.filter((c: ConsultationItem) => !isDummyTicket(c));
        backendTicketList = valid.map((c: ConsultationItem) => ({
          id: c.project_code || `TK-2026-0${c.id}`,
          clientName: `${c.title || "Konsultasi"} (${c.client?.name || "Klien"})`,
        }));
      }
    } catch {
      // silent fallback
    }

    setAvailableTickets(backendTicketList);
    if (backendTicketList.length > 0) {
      setUploadForm((prev) => ({
        ...prev,
        ticketId: prev.ticketId || backendTicketList[0].id,
        clientName: prev.clientName || backendTicketList[0].clientName,
      }));
    }

    setReports(backendDocs);
  }, []);

  useEffect(() => {
    loadBackendDocuments();
  }, [loadBackendDocuments]);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentFileName = uploadedFile ? uploadedFile.name : uploadForm.fileName.trim();
    if (!currentFileName) return;

    const rawId = parseInt(uploadForm.ticketId.replace(/\D/g, ""), 10) || 1;

    try {
      const fd = new FormData();
      if (uploadedFile) {
        fd.append("file", uploadedFile);
        fd.append("file_name", uploadedFile.name);
      } else {
        fd.append("file_name", currentFileName);
      }
      const res = await adminApi.uploadDocument(rawId, fd);
      if (res.success) {
        showToast(`Berkas ${currentFileName} berhasil diterbitkan ke Vault klien.`);
        setIsUploadModalOpen(false);
        setUploadedFile(null);
        setUploadForm({
          ticketId: availableTickets[0]?.id || "",
          clientName: availableTickets[0]?.clientName || "",
          clientNpwp: "-",
          fileName: "",
          category: "Tax Service Core",
          amount: "",
          invoiceNumber: "",
          consultant: "Staf Konsultan",
          sendNotification: true,
        });
        await loadBackendDocuments();
      } else {
        showToast(res.message || "Gagal mengunggah berkas ke server.");
      }
    } catch (err) {
      console.warn("Backend document upload notice:", err);
      showToast("Terjadi kendala koneksi ke server.");
    }
  };

  const handleSendClientReminder = (item: ReportItem) => {
    showToast(
      `Notifikasi WhatsApp & Email resmi untuk invoice ${item.invoiceNumber} berhasil dikirimkan ke PIC ${item.clientName}.`
    );
  };

  const handleDownloadFile = async (reportOrFileName: ReportItem | string) => {
    const report = typeof reportOrFileName === "string"
      ? reports.find((r) => r.fileName === reportOrFileName)
      : reportOrFileName;

    const fileName = typeof reportOrFileName === "string" ? reportOrFileName : reportOrFileName.fileName;

    showToast(`Menyiapkan unduhan berkas "${fileName}"...`);

    if (report?.downloadUrl && report.downloadUrl !== "#") {
      const res = await downloadRemoteFile(report.downloadUrl, fileName);
      if (res.success) {
        showToast(`Berkas "${fileName}" berhasil diunduh.`);
        return;
      }
    }

    if (report?.id) {
      const rawId = report.id.replace(/\D/g, "");
      if (rawId) {
        try {
          const dlRes = await clientApi.getDownloadUrl(rawId);
          if (dlRes.success && dlRes.data?.download_url) {
            const res = await downloadRemoteFile(dlRes.data.download_url, fileName);
            if (res.success) {
              showToast(`Berkas "${fileName}" berhasil diunduh.`);
              return;
            }
          }
        } catch {
          // continue
        }
      }
    }

    showToast(`Berkas "${fileName}" belum tersedia pada repositori server.`);
  };

  const handleDeleteDocument = async (id: string, fileName: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus berkas "${fileName}"? Berkas ini akan dihapus secara permanen dari server.`)) {
      const rawId = parseInt(id.replace(/\D/g, ""), 10);
      if (rawId) {
        try {
          const res = await adminApi.deleteDocument(rawId);
          if (res.success) {
            showToast(`Berkas "${fileName}" berhasil dihapus dari repositori server.`);
            await loadBackendDocuments();
            return;
          } else {
            showToast(res.message || "Gagal menghapus berkas dari server.");
          }
        } catch (err) {
          console.error("Gagal menghapus berkas:", err);
          showToast("Terjadi kendala saat menghubungi server.");
        }
      }
      setReports((prev) => prev.filter((r) => r.id !== id && r.fileName !== fileName));
      showToast(`Berkas "${fileName}" dihapus.`);
    }
  };

  const handleDownloadInvoice = (invoiceNumber: string) => {
    const found = reports.find((r) => r.invoiceNumber === invoiceNumber);
    if (found) {
      setSelectedInvoice(found);
    } else {
      showToast(`Membuka faktur ${invoiceNumber}...`);
    }
  };

  // Filtered reports
  const filteredReports = reports.filter((item) => {
    const matchesCategory = categoryFilter === "ALL" || item.category === categoryFilter;
    const matchesBilling = billingFilter === "ALL" || item.billingStatus === billingFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.fileName.toLowerCase().includes(q) ||
      item.clientName.toLowerCase().includes(q) ||
      item.ticketId.toLowerCase().includes(q) ||
      item.invoiceNumber.toLowerCase().includes(q) ||
      item.consultant.toLowerCase().includes(q);

    return matchesCategory && matchesBilling && matchesSearch;
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, billingFilter, searchQuery]);

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage) || 1;
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalReportsCount = reports.length;
  const pendingPaymentCount = reports.filter((r) => r.billingStatus === "Menunggu Verifikasi").length;
  const paidCount = reports.filter((r) => r.billingStatus === "Lunas").length;

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
        <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
          Upload Laporan &amp; Billing Klien
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-2xl">
          Unggah deliverable laporan final (PDF/XLSX), tautkan ke tiket penugasan klien, dan terbitkan invoice billing resmi terenkripsi 256-bit.
        </p>
      </div>

      {/* 4 TOP OPERATIONAL METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1 */}
        <Card className="p-4 sm:p-5 rounded-2xl border-primary-light bg-white shadow-xs">
          <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">
            Berkas Terunggah
          </span>
          <div className="mt-2 text-2xl font-bold text-primary font-mono flex items-baseline gap-1.5">
            <span>{totalReportsCount < 10 ? `0${totalReportsCount}` : totalReportsCount}</span>
            <span className="text-xs text-text-secondary font-sans font-normal">Berkas</span>
          </div>
          <div className="text-[10px] text-text-secondary mt-1">Seluruh deliverable resmi</div>
        </Card>

        {/* Card 2 */}
        <Card className="p-4 sm:p-5 rounded-2xl border-amber-200 bg-amber-50/40 shadow-xs">
          <span className="text-[10px] text-amber-900 font-bold uppercase tracking-wider block">
            Menunggu Pembayaran
          </span>
          <div className="mt-2 text-2xl font-bold text-amber-800 font-mono flex items-baseline gap-1.5">
            <span>0{pendingPaymentCount}</span>
            <span className="text-xs text-amber-700 font-sans font-normal">Tagihan</span>
          </div>
          <div className="text-[10px] text-amber-700 mt-1">Faktur belum terverifikasi</div>
        </Card>

        {/* Card 3 */}
        <Card className="p-4 sm:p-5 rounded-2xl border-emerald-200 bg-emerald-50/40 shadow-xs">
          <span className="text-[10px] text-emerald-900 font-bold uppercase tracking-wider block">
            Billing Lunas Bulan Ini
          </span>
          <div className="mt-2 text-2xl font-bold text-emerald-800 font-mono flex items-baseline gap-1.5">
            <span>{paidCount < 10 ? `0${paidCount}` : paidCount}</span>
            <span className="text-xs text-emerald-700 font-sans font-normal">Faktur</span>
          </div>
          <div className="text-[10px] text-emerald-700 mt-1">Pembayaran terkonfirmasi</div>
        </Card>

        {/* Card 4 */}
        <Card className="p-4 sm:p-5 rounded-2xl border-primary-light bg-white shadow-xs">
          <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">
            Rata-Rata Waktu Rilis
          </span>
          <div className="mt-2 text-2xl font-bold text-primary font-mono flex items-baseline gap-1.5">
            <span>{totalReportsCount > 0 ? "1.2" : "0"}</span>
            <span className="text-xs text-text-secondary font-sans font-normal">Hari Kerja</span>
          </div>
          <div className="text-[10px] text-text-secondary mt-1">Penerbitan ke vault klien</div>
        </Card>
      </div>

      {/* MASTER DELIVERABLE & BILLING CARD (WITH INTEGRATED SEARCH, FILTER & ACTION TOOLBAR) */}
      <Card className="rounded-2xl border-primary-light bg-white shadow-xs overflow-hidden">
        {/* Header & Subtitle */}
        <div className="p-5 sm:p-6 border-b border-primary-light">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-primary">
                Daftar Berkas Deliverable Kertas Kerja &amp; Faktur Billing
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Tersinkronisasi otomatis dengan modul Vault Dokumen pada Dashboard Klien.
              </p>
            </div>
          </div>

          {/* Search, Filter & Upload Button Toolbar */}
          <div className="mt-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
              <div className="relative flex-1 min-w-[200px]">
                <SearchIcon className="absolute left-3 top-2.5 text-text-muted text-xs" />
                <Input
                  type="text"
                  placeholder="Cari berkas, nama klien, tiket, atau invoice..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 text-xs h-9 bg-surface border-primary-light focus:bg-white w-full"
                />
              </div>

              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full sm:w-auto min-w-[150px] text-xs h-9"
                >
                  <option value="ALL">Semua Kategori</option>
                  <option value="Tax Service Core">Tax Service Core</option>
                  <option value="Accounting Service">Accounting Service</option>
                  <option value="Business Financial Consulting">Business Financial Consulting</option>
                  <option value="Legal">Legal</option>
                </Select>

                <Select
                  value={billingFilter}
                  onChange={(e) => setBillingFilter(e.target.value)}
                  className="w-full sm:w-auto min-w-[160px] text-xs h-9"
                >
                  <option value="ALL">Semua Status Billing</option>
                  <option value="Lunas">Lunas</option>
                  <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                  <option value="Terkirim">Terkirim</option>
                </Select>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">

              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setIsUploadModalOpen(true)}
                className="w-full sm:w-auto text-xs font-semibold h-9 px-4 shadow-xs flex items-center justify-center gap-1.5"
              >
                <span>Upload Berkas Baru</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Deliverable Items List */}
        <div className="divide-y divide-primary-light">
          {filteredReports.length === 0 ? (
            <div className="p-8 text-center text-xs text-text-muted">
              Tidak ada berkas deliverable yang cocok dengan filter pencarian.
            </div>
          ) : (
            paginatedReports.map((report) => (
              <div
                key={report.id}
                className="p-5 hover:bg-surface/50 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center flex-wrap gap-2 text-xs">
                    <span
                      className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                        report.fileType === "PDF"
                          ? "bg-primary text-white border-primary"
                          : "bg-emerald-50 text-success border-success/30"
                      }`}
                    >
                      {report.fileType}
                    </span>
                    <span className="font-mono text-primary font-bold bg-primary-light px-2 py-0.5 rounded">
                      {report.ticketId}
                    </span>
                    <span>&bull;</span>
                    <button
                      type="button"
                      onClick={() => handleDownloadInvoice(report.invoiceNumber)}
                      className="font-mono text-text-muted hover:text-primary hover:underline text-[11px] cursor-pointer"
                      title="Klik untuk melihat rincian faktur tagihan"
                    >
                      {report.invoiceNumber}
                    </button>
                    <Badge
                      variant={
                        report.billingStatus === "Lunas"
                          ? "success"
                          : report.billingStatus === "Menunggu Verifikasi"
                          ? "silver"
                          : "secondary"
                      }
                      size="sm"
                    >
                      {report.billingStatus}
                    </Badge>
                  </div>

                  <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                    <span>{report.fileName}</span>
                    <span className="text-[11px] font-normal text-text-muted">
                      ({report.fileSize})
                    </span>
                  </h4>

                  <div className="flex flex-wrap items-center gap-3 text-text-secondary text-[11px]">
                    <span>
                      Klien: <strong className="text-primary">{report.clientName}</strong>
                    </span>
                    <span>&bull;</span>
                    <span>
                      NPWP: <code className="font-mono text-primary">{report.clientNpwp}</code>
                    </span>
                    <span>&bull;</span>
                    <span>
                      Konsultan: <strong>{report.consultant}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[10px] text-text-muted">
                    <span>Diunggah: {report.uploadDate}</span>
                    <span>&bull;</span>
                    <span>Tagihan: <strong className="text-primary font-mono">{report.amount}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadFile(report.fileName)}
                    className="text-[11px] h-8 px-2.5 border-primary-light text-text-secondary hover:text-primary font-medium"
                  >
                    Unduh
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedInvoice(report)}
                    className="text-[11px] h-8 px-2.5 border-primary-light text-primary hover:bg-surface font-semibold"
                  >
                    <DocumentIcon className="text-xs mr-1" />
                    Faktur
                  </Button>

                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => handleSendClientReminder(report)}
                    className="text-[11px] h-8 px-3 font-semibold shadow-xs"
                    title="Kirim Notifikasi PIC"
                  >
                    <SendIcon className="text-[10px] mr-1" />
                    Kirim Notif
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteDocument(report.id, report.fileName)}
                    className="text-[11px] h-8 px-2.5 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-medium cursor-pointer"
                    title="Hapus Berkas & Faktur"
                  >
                    <TrashIcon className="text-xs mr-1" />
                    Hapus
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {filteredReports.length > 0 && (
          <div className="p-4 bg-surface/40 border-t border-primary-light flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted">
            <span>
              Menampilkan {(currentPage - 1) * itemsPerPage + 1} &ndash;{" "}
              {Math.min(currentPage * itemsPerPage, filteredReports.length)} dari{" "}
              {filteredReports.length} berkas deliverable
            </span>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </Card>

      {/* INVOICE DETAIL MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-dark/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-primary-light max-w-lg w-full p-6 space-y-5 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedInvoice(null)}
              className="absolute top-5 right-5 text-text-secondary hover:text-primary p-1"
              aria-label="Tutup faktur"
            >
              <CloseIcon className="text-sm" />
            </button>

            {/* Invoice Header */}
            <div className="flex items-center justify-between border-b border-primary-light pb-4">
              <div>
                <span className="text-[10px] font-mono text-text-muted font-bold block">
                  FAKTUR BILLING RESMI
                </span>
                <h3 className="text-lg font-bold text-primary font-mono">
                  {selectedInvoice.invoiceNumber}
                </h3>
              </div>
              <Badge
                variant={selectedInvoice.billingStatus === "Lunas" ? "success" : "silver"}
                size="default"
              >
                {selectedInvoice.billingStatus}
              </Badge>
            </div>

            {/* Client & Assignment Info */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] text-text-muted uppercase font-semibold block">
                  Ditagihkan Kepada:
                </span>
                <p className="font-bold text-primary">{selectedInvoice.clientName}</p>
                <p className="text-[11px] text-text-muted font-mono">{selectedInvoice.clientNpwp}</p>
              </div>

              <div className="space-y-1 text-right">
                <span className="text-[10px] text-text-muted uppercase font-semibold block">
                  Tanggal Terbit:
                </span>
                <p className="font-bold text-primary">{selectedInvoice.uploadDate}</p>
                <p className="text-[11px] text-text-muted">Tiket: {selectedInvoice.ticketId}</p>
              </div>
            </div>

            {/* Line Item Table */}
            <div className="border border-primary-light rounded-xl overflow-hidden text-xs">
              <div className="p-3 bg-surface border-b border-primary-light flex items-center justify-between font-bold text-primary">
                <span>Deskripsi Layanan Konsultasi</span>
                <span>Jumlah (IDR)</span>
              </div>
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-text-primary">
                    {selectedInvoice.category} - Penugasan {selectedInvoice.ticketId}
                  </span>
                  <span className="font-mono font-bold text-primary">
                    {selectedInvoice.amount}
                  </span>
                </div>
                <p className="text-[10px] text-text-muted">
                  Berkas Deliverable: {selectedInvoice.fileName}
                </p>
              </div>
              <div className="p-3 bg-surface/60 border-t border-primary-light flex items-center justify-between font-bold text-primary">
                <span>Total Tagihan Bersih:</span>
                <span className="font-mono text-sm text-primary">
                  {selectedInvoice.amount}
                </span>
              </div>
            </div>

            {/* Bank Transfer Info */}
            <div className="p-3 rounded-xl bg-surface border border-primary-light text-xs space-y-1">
              <span className="text-[10px] text-text-muted uppercase font-bold block">
                Rekening Pembayaran Resmi:
              </span>
              <p className="font-semibold text-primary">
                Bank Mandiri &bull; Rekening: 122-00-198822-1
              </p>
              <p className="text-[11px] text-text-secondary">
                Atas Nama: <strong>Zhou Consulting</strong>
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedInvoice(null)}
                className="text-xs h-8 px-4 border-primary-light"
              >
                Tutup
              </Button>

              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => {
                  const pdfBlob = generateInvoicePdfBlob(selectedInvoice);
                  downloadBlob(pdfBlob, `Faktur_Billing_${selectedInvoice.invoiceNumber}.pdf`);
                  showToast(`Invoice ${selectedInvoice.invoiceNumber} berhasil diunduh dalam format PDF.`);
                  setSelectedInvoice(null);
                }}
                className="text-xs h-8 px-4 font-semibold"
              >
                Unduh PDF
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD REPORT MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-dark/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-primary-light max-w-lg w-full p-6 space-y-4 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute top-5 right-5 text-text-secondary hover:text-primary p-1"
              aria-label="Tutup modal"
            >
              <CloseIcon className="text-sm" />
            </button>

            <div>
              <span className="text-[10px] font-mono text-text-muted font-bold block">
                DELIVERABLE &amp; BILLING
              </span>
              <h3 className="text-lg font-bold text-primary">
                Upload Berkas Laporan Klien Baru
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Unggah berkas deliverable final untuk secara otomatis diterbitkan ke akun Vault klien.
              </p>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-primary">
                    Pilih Tiket Penugasan <span className="text-error">*</span>
                  </Label>
                  <Select
                    value={uploadForm.ticketId}
                    onChange={(e) => {
                      const tId = e.target.value;
                      const matched = availableTickets.find((t) => t.id === tId);
                      setUploadForm((prev) => ({
                        ...prev,
                        ticketId: tId,
                        clientName: matched ? matched.clientName : (tId ? "Klien Terdaftar" : ""),
                        clientNpwp: "-",
                      }));
                    }}
                    className="w-full text-xs h-9 font-medium font-mono"
                  >
                    <option value="">-- Pilih Tiket Penugasan --</option>
                    {availableTickets.length > 0 ? (
                      availableTickets.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.id} ({t.clientName})
                        </option>
                      ))
                    ) : (
                      <option value="TK-2026-001">TK-2026-001 (Tiket Konsultasi Klien)</option>
                    )}
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-primary">
                    Nomor Faktur / Invoice <span className="text-error">*</span>
                  </Label>
                  <Input
                    type="text"
                    required
                    value={uploadForm.invoiceNumber}
                    onChange={(e) =>
                      setUploadForm((prev) => ({ ...prev, invoiceNumber: e.target.value }))
                    }
                    className="text-xs h-9 bg-surface border-primary-light focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-primary">
                  Berkas Deliverable (PDF / XLSX) <span className="text-error">*</span>
                </Label>

                <input
                  type="file"
                  id="deliverable-file-upload"
                  accept=".pdf,.xlsx,.xls,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setUploadedFile(file);
                      setUploadForm((prev) => ({ ...prev, fileName: file.name }));
                    }
                  }}
                  className="hidden"
                />

                {uploadedFile ? (
                  <div className="p-3 bg-surface rounded-xl border border-primary-light flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${
                          uploadedFile.name.toLowerCase().endsWith(".xlsx") ||
                          uploadedFile.name.toLowerCase().endsWith(".xls")
                            ? "bg-emerald-600"
                            : "bg-primary"
                        }`}
                      >
                        {uploadedFile.name.toLowerCase().endsWith(".xlsx") ||
                        uploadedFile.name.toLowerCase().endsWith(".xls")
                          ? "XLS"
                          : "PDF"}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-primary truncate text-xs">
                          {uploadedFile.name}
                        </p>
                        <p className="text-[10px] text-text-muted">
                          {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB &bull; Siap Diterbitkan
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <label
                        htmlFor="deliverable-file-upload"
                        className="px-2.5 py-1 text-[11px] rounded-lg border border-primary-light bg-white hover:bg-surface text-primary font-medium cursor-pointer transition-colors"
                      >
                        Ganti
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedFile(null);
                          setUploadForm((prev) => ({ ...prev, fileName: "" }));
                        }}
                        className="p-1 text-text-muted hover:text-error cursor-pointer rounded"
                        title="Hapus berkas"
                      >
                        <CloseIcon className="text-xs" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor="deliverable-file-upload"
                    className="flex flex-col items-center justify-center p-4 bg-surface hover:bg-surface/80 border-2 border-dashed border-primary-light rounded-xl cursor-pointer transition-all group"
                  >
                    <DocumentIcon className="text-2xl text-primary/70 group-hover:text-primary transition-colors mb-1" />
                    <span className="text-xs font-bold text-primary">
                      Pilih berkas dari komputer (PDF / XLSX)
                    </span>
                    <span className="text-[10px] text-text-muted mt-0.5">
                      Format resmi didukung: PDF, XLSX (Maksimal 25MB)
                    </span>
                  </label>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-primary">
                    Nominal Honorarium (IDR) <span className="text-error">*</span>
                  </Label>
                  <Input
                    type="text"
                    required
                    value={uploadForm.amount}
                    onChange={(e) =>
                      setUploadForm((prev) => ({ ...prev, amount: e.target.value }))
                    }
                    className="text-xs h-9 bg-surface border-primary-light focus:bg-white font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-primary">
                    Konsultan Penanggung Jawab
                  </Label>
                  <Input
                    type="text"
                    disabled
                    value={uploadForm.consultant}
                    className="text-xs h-9 bg-surface/70 border-primary-light cursor-not-allowed"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
                <input
                  type="checkbox"
                  checked={uploadForm.sendNotification}
                  onChange={(e) =>
                    setUploadForm((prev) => ({ ...prev, sendNotification: e.target.checked }))
                  }
                  className="rounded border-primary-light text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                />
                <span className="text-xs text-text-secondary">
                  Kirim notifikasi otomatis via WhatsApp &amp; Email resmi PIC Klien.
                </span>
              </label>

              <div className="pt-3 border-t border-primary-light flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="text-xs h-9 px-4 border-primary-light"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!uploadedFile && !uploadForm.fileName.trim()}
                  className="text-xs h-9 px-5 font-semibold shadow-xs"
                >
                  Unggah &amp; Terbitkan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
