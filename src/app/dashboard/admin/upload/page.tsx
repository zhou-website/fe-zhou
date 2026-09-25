"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import {
  ShieldTaxIcon,
  CheckCircleIcon,
  CheckIcon,
  ClockIcon,
  DocumentIcon,
  SearchIcon,
  PlusIcon,
  CloseIcon,
  DownloadIcon,
  SendIcon,
} from "@/components/icons";

interface ReportItem {
  id: string;
  ticketId: string;
  clientName: string;
  clientNpwp: string;
  fileName: string;
  fileSize: string;
  fileType: "PDF" | "XLSX";
  category: "Tax Service Core" | "Accounting Service" | "Business Financial Consulting" | "Legal";
  invoiceNumber: string;
  amount: string;
  billingStatus: "Lunas" | "Menunggu Verifikasi" | "Terkirim";
  uploadDate: string;
  consultant: string;
  sha256: string;
}

const INITIAL_REPORTS: ReportItem[] = [
  {
    id: "REP-01",
    ticketId: "TK-2026-089",
    clientName: "PT Maju Makmur Sentosa",
    clientNpwp: "01.234.567.8-012.000",
    fileName: "Laporan_Rekonsiliasi_Fiskal_2025_Final.pdf",
    fileSize: "4.2 MB",
    fileType: "PDF",
    category: "Tax Service Core",
    invoiceNumber: "INV-2026-089",
    amount: "Rp 15.000.000",
    billingStatus: "Lunas",
    uploadDate: "17 Sep 2026",
    consultant: "Linda David, S.Ak., BKP",
    sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  },
  {
    id: "REP-02",
    ticketId: "TK-2026-092",
    clientName: "CV Borneo Karya Prima",
    clientNpwp: "02.345.678.9-023.000",
    fileName: "Kompilasi_Jurnal_Buku_Besar_Q3_SAK.xlsx",
    fileSize: "8.1 MB",
    fileType: "XLSX",
    category: "Accounting Service",
    invoiceNumber: "INV-2026-092",
    amount: "Rp 8.500.000",
    billingStatus: "Menunggu Verifikasi",
    uploadDate: "16 Sep 2026",
    consultant: "Tasya Anggraeni Firdaus, SE., Ak., CA",
    sha256: "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
  },
  {
    id: "REP-03",
    ticketId: "TK-2026-077",
    clientName: "PT Solusi Niaga Terpadu",
    clientNpwp: "03.456.789.0-034.000",
    fileName: "Studi_Kelayakan_Investasi_Ekspansi_2026.pdf",
    fileSize: "6.7 MB",
    fileType: "PDF",
    category: "Business Financial Consulting",
    invoiceNumber: "INV-2026-077",
    amount: "Rp 25.000.000",
    billingStatus: "Terkirim",
    uploadDate: "15 Sep 2026",
    consultant: "Linda David, S.Ak., BKP",
    sha256: "d41d8cd98f00b204e9800998ecf8427e99b0c44298fc1c149afbf4c8996fb924",
  },
  {
    id: "REP-04",
    ticketId: "TK-2026-061",
    clientName: "PT Mega Cipta Pratama",
    clientNpwp: "04.567.890.1-045.000",
    fileName: "Legal_Opinion_Kemitraan_Bisnis_2026.pdf",
    fileSize: "3.5 MB",
    fileType: "PDF",
    category: "Legal",
    invoiceNumber: "INV-2026-061",
    amount: "Rp 12.000.000",
    billingStatus: "Lunas",
    uploadDate: "12 Sep 2026",
    consultant: "Muhamad Dekhsa Afnan, SH., M.Kn.",
    sha256: "1f8ac10f23c5b5bc1167bda84b833e5c057a77d2ec3f674da153e7b1ff6ca182",
  },
  {
    id: "REP-05",
    ticketId: "TK-2026-050",
    clientName: "Yayasan Bina Sejahtera",
    clientNpwp: "05.678.901.2-056.000",
    fileName: "Salinan_SKB_PPh23_Approved_DJP.pdf",
    fileSize: "2.1 MB",
    fileType: "PDF",
    category: "Tax Service Core",
    invoiceNumber: "INV-2026-050",
    amount: "Rp 5.000.000",
    billingStatus: "Lunas",
    uploadDate: "08 Sep 2026",
    consultant: "Tasya Anggraeni Firdaus, SE., Ak., CA",
    sha256: "b10a8db164e0754105b7a99be72e3fe57f83b1657ff1fc53b92dc18148a1d65d",
  },
];

export default function AdminUploadBillingPage() {
  const [reports, setReports] = useState<ReportItem[]>(INITIAL_REPORTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [billingFilter, setBillingFilter] = useState<string>("ALL");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Selected invoice for detail modal
  const [selectedInvoice, setSelectedInvoice] = useState<ReportItem | null>(null);

  // New report modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    ticketId: "TK-2026-089",
    clientName: "PT Maju Makmur Sentosa",
    clientNpwp: "01.234.567.8-012.000",
    fileName: "",
    category: "Tax Service Core" as ReportItem["category"],
    amount: "Rp 15.000.000",
    invoiceNumber: "INV-2026-095",
    consultant: "Linda David, S.Ak., BKP",
    sendNotification: true,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.fileName.trim()) return;

    const ext = uploadForm.fileName.endsWith(".xlsx") ? "XLSX" : "PDF";
    const newReport: ReportItem = {
      id: "REP-0" + (reports.length + 1),
      ticketId: uploadForm.ticketId,
      clientName: uploadForm.clientName,
      clientNpwp: uploadForm.clientNpwp,
      fileName: uploadForm.fileName.trim(),
      fileSize: "3.8 MB",
      fileType: ext,
      category: uploadForm.category,
      invoiceNumber: uploadForm.invoiceNumber,
      amount: uploadForm.amount,
      billingStatus: "Menunggu Verifikasi",
      uploadDate: "18 Sep 2026",
      consultant: uploadForm.consultant,
      sha256: "c" + Math.random().toString(16).substring(2) + "94ca495991b7852b855e3b0c442",
    };

    setReports((prev) => [newReport, ...prev]);
    setIsUploadModalOpen(false);
    setUploadForm({
      ticketId: "TK-2026-089",
      clientName: "PT Maju Makmur Sentosa",
      clientNpwp: "01.234.567.8-012.000",
      fileName: "",
      category: "Tax Service Core",
      amount: "Rp 15.000.000",
      invoiceNumber: "INV-2026-" + Math.floor(100 + Math.random() * 900),
      consultant: "Linda David, S.Ak., BKP",
      sendNotification: true,
    });

    showToast(
      `Berkas ${newReport.fileName} berhasil diterbitkan ke Vault klien. Notifikasi WhatsApp terkirim.`
    );
  };

  const handleSendClientReminder = (item: ReportItem) => {
    showToast(
      `Notifikasi WhatsApp & Email resmi untuk invoice ${item.invoiceNumber} berhasil dikirimkan ke PIC ${item.clientName}.`
    );
  };

  const handleDownloadFile = (fileName: string) => {
    alert(`Mengunduh berkas: ${fileName}`);
  };

  const handleDownloadInvoice = (invoiceNumber: string) => {
    alert(`Mengunduh faktur: ${invoiceNumber}`);
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

      {/* Top Header & Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-primary-light">
        <div>
          <div className="flex items-center gap-2 text-xs text-text-muted mb-1.5">
            <span className="text-text-muted">Dashboard Staf &amp; Administrasi</span>
            <span>/</span>
            <span className="text-primary font-bold">Upload Laporan &amp; Billing</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
            Upload Laporan Kertas Kerja &amp; Billing Klien
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-2xl">
            Unggah deliverable laporan final (PDF/XLSX), tautkan ke tiket penugasan klien, dan terbitkan invoice billing resmi terenkripsi 256-bit.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => setIsUploadModalOpen(true)}
            className="text-xs font-semibold h-10 px-4 shadow-sm flex items-center gap-2"
          >
            <PlusIcon className="text-xs" />
            <span>Upload Berkas Laporan Baru</span>
          </Button>
        </div>
      </div>

      {/* 4 TOP OPERATIONAL METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <Card className="p-5 rounded-2xl border-primary-light bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted font-bold uppercase tracking-wider">
              Berkas Terunggah
            </span>
            <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center text-primary text-xs">
              <DocumentIcon />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-primary font-mono">
              {totalReportsCount < 10 ? `0${totalReportsCount}` : totalReportsCount}
            </span>
            <span className="text-xs text-text-secondary">Berkas</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-primary font-medium">
            <ShieldTaxIcon className="text-xs text-emerald-500" />
            <span>Terverifikasi SHA-256</span>
          </div>
        </Card>

        {/* Card 2 */}
        <Card className="p-5 rounded-2xl border-primary-light bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted font-bold uppercase tracking-wider">
              Menunggu Pembayaran
            </span>
            <div className="w-8 h-8 rounded-lg bg-silver/30 flex items-center justify-center text-text-primary text-xs">
              <ClockIcon />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-primary font-mono">
              0{pendingPaymentCount}
            </span>
            <span className="text-xs text-text-secondary">Tagihan</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-text-muted font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-silver" />
            <span>Nominal Rp 38.500.000</span>
          </div>
        </Card>

        {/* Card 3 */}
        <Card className="p-5 rounded-2xl border-primary-light bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted font-bold uppercase tracking-wider">
              Billing Lunas Bulan Ini
            </span>
            <div className="w-8 h-8 rounded-lg bg-success/15 flex items-center justify-center text-success text-xs">
              <CheckCircleIcon />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-success font-mono">
              {paidCount < 10 ? `0${paidCount}` : paidCount}
            </span>
            <span className="text-xs text-text-secondary">Faktur</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-success font-medium">
            <CheckIcon className="text-[9px]" />
            <span>100% terekonsiliasi rekening</span>
          </div>
        </Card>

        {/* Card 4 */}
        <Card className="p-5 rounded-2xl border-primary-light bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted font-bold uppercase tracking-wider">
              Rata-Rata Waktu Rilis
            </span>
            <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center text-primary text-xs">
              <ClockIcon />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-primary font-mono">
              1.2
            </span>
            <span className="text-xs text-text-secondary">Hari Kerja</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-primary font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Tepat waktu sesuai SLA Klien</span>
          </div>
        </Card>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white rounded-2xl border border-primary-light p-4 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="absolute left-3 top-2.5 text-text-muted text-xs" />
          <Input
            type="text"
            placeholder="Cari berkas, nama klien, tiket, atau invoice..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-xs h-9 bg-surface border-primary-light focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs h-9 px-3 rounded-xl border border-primary-light bg-surface text-text-primary focus:bg-white font-medium focus:outline-none"
          >
            <option value="ALL">Semua Kategori</option>
            <option value="Tax Service Core">Tax Service Core</option>
            <option value="Accounting Service">Accounting Service</option>
            <option value="Business Financial Consulting">Business Financial Consulting</option>
            <option value="Legal">Legal</option>
          </select>

          <select
            value={billingFilter}
            onChange={(e) => setBillingFilter(e.target.value)}
            className="text-xs h-9 px-3 rounded-xl border border-primary-light bg-surface text-text-primary focus:bg-white font-medium focus:outline-none"
          >
            <option value="ALL">Semua Status Billing</option>
            <option value="Lunas">Lunas</option>
            <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
            <option value="Terkirim">Terkirim</option>
          </select>
        </div>
      </div>

      {/* MASTER DELIVERABLE & BILLING TABLE */}
      <Card className="rounded-2xl border-primary-light bg-white shadow-xs overflow-hidden">
        <div className="p-4 bg-surface/60 border-b border-primary-light flex items-center justify-between">
          <span className="text-xs font-bold text-primary">
            Daftar Berkas Deliverable Kertas Kerja &amp; Faktur Billing ({filteredReports.length})
          </span>
          <span className="text-[11px] text-text-muted">
            Tersinkronisasi otomatis dengan modul Vault Dokumen pada Dashboard Klien.
          </span>
        </div>

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
                    <span className="font-mono text-text-muted text-[11px]">
                      {report.invoiceNumber}
                    </span>
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
                    <span>&bull;</span>
                    <span className="text-success font-medium flex items-center gap-1">
                      <CheckIcon className="text-[9px]" />
                      Terenkripsi SHA-256
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadFile(report.fileName)}
                    className="text-[11px] h-8 px-2.5 border-primary-light text-text-secondary hover:text-primary"
                  >
                    <DownloadIcon className="text-xs mr-1" />
                    Unduh Berkas
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadInvoice(report.invoiceNumber)}
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

      {/* BOTTOM SPLIT SECTION (2 COLUMNS): Quick Upload Form & Security Assurance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* COLUMN 1: Quick Upload Form */}
        <div className="lg:col-span-7">
          <Card className="rounded-2xl border-primary-light bg-white p-6 shadow-xs space-y-5">
            <div>
              <h3 className="text-base font-bold text-primary">
                Formulir Cepat Upload Laporan Hasil Kerja
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Unggah berkas deliverable final untuk secara otomatis diterbitkan ke akun Vault klien.
              </p>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-primary">
                    Pilih Tiket Penugasan Selesai <span className="text-error">*</span>
                  </Label>
                  <select
                    value={uploadForm.ticketId}
                    onChange={(e) => {
                      const tId = e.target.value;
                      if (tId === "TK-2026-089") {
                        setUploadForm((prev) => ({
                          ...prev,
                          ticketId: tId,
                          clientName: "PT Maju Makmur Sentosa",
                          clientNpwp: "01.234.567.8-012.000",
                          category: "Tax Service Core",
                        }));
                      } else {
                        setUploadForm((prev) => ({
                          ...prev,
                          ticketId: tId,
                          clientName: "CV Borneo Karya Prima",
                          clientNpwp: "02.345.678.9-023.000",
                          category: "Accounting Service",
                        }));
                      }
                    }}
                    className="w-full text-xs h-9 px-3 rounded-xl border border-primary-light bg-surface text-text-primary focus:bg-white font-medium focus:outline-none font-mono"
                  >
                    <option value="TK-2026-089">TK-2026-089 (PT Maju Makmur Sentosa)</option>
                    <option value="TK-2026-092">TK-2026-092 (CV Borneo Karya Prima)</option>
                  </select>
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

              {/* Drag and Drop Zone */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-primary">
                  Nama Berkas Deliverable (PDF / XLSX maks. 25MB) <span className="text-error">*</span>
                </Label>
                <div className="border-2 border-dashed border-primary-light rounded-xl p-6 text-center bg-surface/40 hover:bg-surface transition-colors space-y-2">
                  <DocumentIcon className="text-2xl text-primary mx-auto" />
                  <div className="text-xs font-semibold text-primary">
                    Ketik nama berkas deliverable yang telah siap:
                  </div>
                  <Input
                    type="text"
                    required
                    placeholder="e.g. Laporan_Audit_SAK_Final_2026.pdf"
                    value={uploadForm.fileName}
                    onChange={(e) =>
                      setUploadForm((prev) => ({ ...prev, fileName: e.target.value }))
                    }
                    className="max-w-md mx-auto text-xs h-9 bg-white border-primary-light"
                  />
                  <p className="text-[10px] text-text-muted">
                    Format resmi didukung: PDF, XLSX, ZIP berenkripsi SSL 256-bit.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-primary">
                    Nominal Honorarium Penugasan (IDR) <span className="text-error">*</span>
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

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={uploadForm.sendNotification}
                    onChange={(e) =>
                      setUploadForm((prev) => ({ ...prev, sendNotification: e.target.checked }))
                    }
                    className="rounded border-primary-light text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs text-text-secondary">
                    Kirim notifikasi otomatis secara langsung via WhatsApp &amp; Email resmi PIC Klien.
                  </span>
                </label>
              </div>

              <div className="pt-3 border-t border-primary-light flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="text-xs h-9 px-5 font-semibold shadow-xs"
                >
                  Unggah &amp; Terbitkan ke Vault Klien
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* COLUMN 2: Security & Digital Signature Assurance */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="rounded-2xl border-primary-light bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 text-primary font-bold text-sm">
              <ShieldTaxIcon className="text-base" />
              <span>Integritas Dokumen &amp; Tanda Tangan Digital</span>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              Seluruh laporan yang diunggah melalui konsol ini secara otomatis dihitung nilai hash kriptografisnya (SHA-256) untuk menjamin berkas tidak mengalami manipulasi di kemudian hari.
            </p>

            <div className="p-3.5 rounded-xl bg-surface border border-primary-light space-y-2 text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-text-muted font-semibold">Protokol Enkripsi:</span>
                <span className="font-mono font-bold text-primary">AES-256 &bull; TLS 1.3</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-text-muted font-semibold">UU PDP No. 27/2022:</span>
                <span className="text-success font-semibold flex items-center gap-1">
                  <CheckIcon className="text-[9px]" /> Patuh Penuh
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-text-muted font-semibold">Tanda Tangan Elektronik:</span>
                <span className="text-primary font-semibold">BKP &amp; Akuntan CA</span>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-primary-light text-xs">
              <span className="font-bold text-primary block">Ketentuan Rilis Berkas Klien:</span>
              <ul className="space-y-1.5 text-[11px] text-text-secondary">
                <li className="flex items-start gap-1.5">
                  <span className="text-primary font-bold">&bull;</span>
                  <span>Berkas laporan langsung muncul di menu &quot;Dokumen Pajak&quot; pada dashboard klien.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-primary font-bold">&bull;</span>
                  <span>Status tagihan terintegrasi otomatis dengan konfirmasi transfer rekening Zhou Consulting.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-primary font-bold">&bull;</span>
                  <span>Penerbitan faktur pajak keluaran (e-Faktur PPN) diproses setelah pembayaran lunas.</span>
                </li>
              </ul>
            </div>
          </Card>
        </div>
      </div>

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
                    {selectedInvoice.category} &mdash; Penugasan {selectedInvoice.ticketId}
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
                Atas Nama: <strong>PT Zhou Konsultindo Nusantara</strong>
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
                  showToast(`Invoice ${selectedInvoice.invoiceNumber} berhasil diunduh dalam format PDF.`);
                  setSelectedInvoice(null);
                }}
                className="text-xs h-8 px-4 font-semibold"
              >
                Unduh Salinan Faktur PDF
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
                  <select
                    value={uploadForm.ticketId}
                    onChange={(e) => {
                      const tId = e.target.value;
                      if (tId === "TK-2026-089") {
                        setUploadForm((prev) => ({
                          ...prev,
                          ticketId: tId,
                          clientName: "PT Maju Makmur Sentosa",
                          clientNpwp: "01.234.567.8-012.000",
                          category: "Tax Service Core",
                        }));
                      } else {
                        setUploadForm((prev) => ({
                          ...prev,
                          ticketId: tId,
                          clientName: "CV Borneo Karya Prima",
                          clientNpwp: "02.345.678.9-023.000",
                          category: "Accounting Service",
                        }));
                      }
                    }}
                    className="w-full text-xs h-9 px-3 rounded-xl border border-primary-light bg-surface text-text-primary focus:bg-white font-medium focus:outline-none font-mono"
                  >
                    <option value="TK-2026-089">TK-2026-089 (PT Maju Makmur Sentosa)</option>
                    <option value="TK-2026-092">TK-2026-092 (CV Borneo Karya Prima)</option>
                  </select>
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
                  Nama Berkas Deliverable (PDF / XLSX) <span className="text-error">*</span>
                </Label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Laporan_Audit_SAK_Final_2026.pdf"
                  value={uploadForm.fileName}
                  onChange={(e) =>
                    setUploadForm((prev) => ({ ...prev, fileName: e.target.value }))
                  }
                  className="text-xs h-9 bg-white border-primary-light"
                />
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
