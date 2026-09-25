"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  ClockIcon,
  CheckCircleIcon,
  DocumentIcon,
  PlusIcon,
  CloseIcon,
  SearchIcon,
  UserIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChatbotIcon,
  WhatsappIcon,
} from "@/components/icons";

interface Milestone {
  step: string;
  title: string;
  status: "completed" | "in_progress" | "pending";
  date: string;
  description: string;
}

interface Deliverable {
  name: string;
  size: string;
  format: "XLSX" | "PDF";
  date: string;
}

interface Correspondence {
  id: string;
  sender: string;
  role: "Konsultan" | "Klien";
  date: string;
  message: string;
}

interface Ticket {
  id: string;
  title: string;
  category: "Tax Service Core" | "Accounting Service" | "Legal" | "Business Consulting";
  consultant: string;
  status: "In Progress" | "Completed";
  progress: number;
  createdAt: string;
  estimatedCompletion: string;
  milestones: Milestone[];
  deliverables: Deliverable[];
  correspondences: Correspondence[];
}

const INITIAL_TICKETS: Ticket[] = [
  {
    id: "TK-2026-089",
    title: "Pelaporan SPT Tahunan Badan 1771 & Ekualisasi Fiskal",
    category: "Tax Service Core",
    consultant: "Linda David, S.Ak., BKP",
    status: "In Progress",
    progress: 75,
    createdAt: "12 Sep 2026",
    estimatedCompletion: "22 Sep 2026",
    milestones: [
      {
        step: "01",
        title: "Verifikasi Berkas & Bukti Potong",
        status: "completed",
        date: "14 Sep 2026",
        description: "Dokumen bukti potong 1721-A1, PPh 23, dan e-Faktur PPN telah dicocokkan 100% lengkap.",
      },
      {
        step: "02",
        title: "Analisis & Rekonsiliasi Fiskal",
        status: "in_progress",
        date: "17 Sep 2026",
        description: "Penyusunan koreksi fiskal positif/negatif dan penyesuaian beban biaya non-deductible PMK 81/2024.",
      },
      {
        step: "03",
        title: "Finalisasi & Penerbitan BPE DJP",
        status: "pending",
        date: "Estimasi 22 Sep 2026",
        description: "Pengiriman draft final ke manajemen PT MMS, submit formulir 1771 Coretax, dan penerbitan BPE resmi.",
      },
    ],
    deliverables: [
      {
        name: "Kertas_Kerja_Ekualisasi_Fiskal_2026_PT_MMS.xlsx",
        size: "2.4 MB",
        format: "XLSX",
        date: "16 Sep 2026",
      },
      {
        name: "Draft_SPT_Tahunan_Badan_Form_1771_Review.pdf",
        size: "4.1 MB",
        format: "PDF",
        date: "16 Sep 2026",
      },
    ],
    correspondences: [
      {
        id: "msg-1",
        sender: "Linda David, S.Ak., BKP (Lead Tax Consultant)",
        role: "Konsultan",
        date: "16 Sep 2026 &bull; 14:30 WIB",
        message:
          "Selamat siang Pak Budi. Kami telah menyelesaikan rekonsiliasi peredaran bruto dan ekualisasi PPh 21 dengan PPN. Koreksi fiskal positif atas beban natura dan representasi telah kami sesuaikan dengan regulasi PMK terbaru. Berkas kertas kerja telah diunggah untuk ditinjau.",
      },
      {
        id: "msg-2",
        sender: "Linda David, S.Ak., BKP (Lead Tax Consultant)",
        role: "Konsultan",
        date: "16 Sep 2026 &bull; 17:15 WIB",
        message:
          "Kertas kerja ekualisasi dan rekonsiliasi fiskal telah diverifikasi lengkap. Penugasan dilanjutkan ke tahap finalisasi draf pelaporan SPT Tahunan Badan Form 1771 pada sistem Coretax DJP.",
      },
    ],
  },
  {
    id: "TK-2026-042",
    title: "Kompilasi Laporan Keuangan Berstandar SAK EP Q2 2026",
    category: "Accounting Service",
    consultant: "Tasya Anggraeni Firdaus, SE., Ak., CA",
    status: "Completed",
    progress: 100,
    createdAt: "18 Agu 2026",
    estimatedCompletion: "28 Agu 2026",
    milestones: [
      {
        step: "01",
        title: "Pemeriksaan Rekening Koran & Mutasi",
        status: "completed",
        date: "20 Agu 2026",
        description: "Rekonsiliasi transaksi 3 rekening bank korporat dan mutasi kas kecil.",
      },
      {
        step: "02",
        title: "Penyesuaian Jurnal Akrual & Penyusutan",
        status: "completed",
        date: "24 Agu 2026",
        description: "Perhitungan depresiasi aset tetap dan penyesuaian pos beban dibayar di muka.",
      },
      {
        step: "03",
        title: "Penerbitan Laporan Audit SAK",
        status: "completed",
        date: "28 Agu 2026",
        description: "Laporan Neraca, Laba Rugi, dan Arus Kas Q2 2026 disetujui tanpa catatan anomali.",
      },
    ],
    deliverables: [
      {
        name: "Laporan_Keuangan_SAK_Q2_2026_Final_Audited.pdf",
        size: "3.8 MB",
        format: "PDF",
        date: "28 Agu 2026",
      },
      {
        name: "Ledger_Buku_Besar_Rekonsiliasi_Bank_Q2.xlsx",
        size: "5.1 MB",
        format: "XLSX",
        date: "28 Agu 2026",
      },
    ],
    correspondences: [
      {
        id: "msg-3",
        sender: "Tasya Anggraeni Firdaus, SE., Ak., CA (Accounting Partner)",
        role: "Konsultan",
        date: "28 Agu 2026 &bull; 11:00 WIB",
        message:
          "Seluruh kertas kerja kompilasi laporan keuangan kuartal 2 telah selesai dan berstatus final audited. Berkas deliverable resmi siap diunduh.",
      },
    ],
  },
  {
    id: "TK-2026-015",
    title: "Tinjauan Hukum Kontrak Vendor & Kepatuhan PPN Transaksi",
    category: "Legal",
    consultant: "Muhamad Dekhsa Afnan, SH., M.Kn.",
    status: "Completed",
    progress: 100,
    createdAt: "04 Agu 2026",
    estimatedCompletion: "10 Agu 2026",
    milestones: [
      {
        step: "01",
        title: "Telaah Klausul Perjanjian Kerjasama",
        status: "completed",
        date: "06 Agu 2026",
        description: "Analisis klausul ganti rugi, yurisdiksi penyelesaian sengketa, dan termin pembayaran.",
      },
      {
        step: "02",
        title: "Harmonisasi Ketentuan Faktur Pajak PPN",
        status: "completed",
        date: "08 Agu 2026",
        description: "Sinkronisasi klausul penyerahan BKP/JKP dengan mekanisme e-Faktur Pajak 11%.",
      },
      {
        step: "03",
        title: "Legal Opinion & Berita Acara Final",
        status: "completed",
        date: "10 Agu 2026",
        description: "Legal opinion advokat resmi dan draf kontrak amandemen diserahkan ke klien.",
      },
    ],
    deliverables: [
      {
        name: "Legal_Opinion_Kontrak_Vendor_Pengadaan_PT_MMS.pdf",
        size: "1.9 MB",
        format: "PDF",
        date: "10 Agu 2026",
      },
    ],
    correspondences: [
      {
        id: "msg-4",
        sender: "Muhamad Dekhsa Afnan, SH., M.Kn. (Corporate Legal Advisor)",
        role: "Konsultan",
        date: "10 Agu 2026 &bull; 09:30 WIB",
        message:
          "Dokumen legal opinion telah selesai disusun dan ditandatangani. Klausul penagihan dan tanggung renteng PPN telah dimitigasi secara optimal.",
      },
    ],
  },
  {
    id: "TK-2026-008",
    title: "Studi Kelayakan Investasi & Financial Modeling Pabrik Baru",
    category: "Business Consulting",
    consultant: "Linda David, S.Ak., BKP",
    status: "In Progress",
    progress: 40,
    createdAt: "02 Sep 2026",
    estimatedCompletion: "30 Sep 2026",
    milestones: [
      {
        step: "01",
        title: "Pengumpulan Asumsi Makro & Proyeksi Pasar",
        status: "completed",
        date: "08 Sep 2026",
        description: "Kompilasi data biaya CAPEX, OPEX, dan estimasi utilisasi kapasitas produksi.",
      },
      {
        step: "02",
        title: "Penyusunan Model Finansial NPV, IRR & Payback",
        status: "in_progress",
        date: "18 Sep 2026",
        description: "Simulasi skenario sensitivitas kurs valas dan suku bunga pembiayaan perbankan.",
      },
      {
        step: "03",
        title: "Penyusunan Executive Summary & Presentasi Direksi",
        status: "pending",
        date: "Estimasi 30 Sep 2026",
        description: "Penerbitan buku laporan studi kelayakan investasi komprehensif.",
      },
    ],
    deliverables: [
      {
        name: "Draft_Preliminary_Financial_Model_Capex_2026.xlsx",
        size: "3.2 MB",
        format: "XLSX",
        date: "12 Sep 2026",
      },
    ],
    correspondences: [
      {
        id: "msg-5",
        sender: "Linda David, S.Ak., BKP (Business Advisor)",
        role: "Konsultan",
        date: "12 Sep 2026 &bull; 15:15 WIB",
        message:
          "Draft awal financial model telah kami siapkan dengan base rate bunga 7.5%. Kami sedang menjalankan analisis sensitivitas inflasi bahan baku.",
      },
    ],
  },
];

export default function ClientTicketMonitoringPage() {
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [selectedTicketId, setSelectedTicketId] = useState<string>("TK-2026-089");
  const [filterTab, setFilterTab] = useState<"all" | "in_progress" | "completed">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal State for New Ticket
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<Ticket["category"]>("Tax Service Core");
  const [newUrgency, setNewUrgency] = useState("Normal");
  const [newDescription, setNewDescription] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Selected Ticket Object
  const selectedTicket =
    tickets.find((t) => t.id === selectedTicketId) || tickets[0];

  // Filtering Logic
  const filteredTickets = tickets.filter((ticket) => {
    // Tab Filter
    if (filterTab === "in_progress" && ticket.status !== "In Progress") return false;
    if (filterTab === "completed" && ticket.status !== "Completed") return false;

    // Category Filter
    if (categoryFilter !== "all" && ticket.category !== categoryFilter) return false;

    // Search Query
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchId = ticket.id.toLowerCase().includes(q);
      const matchTitle = ticket.title.toLowerCase().includes(q);
      const matchConsultant = ticket.consultant.toLowerCase().includes(q);
      if (!matchId && !matchTitle && !matchConsultant) return false;
    }

    return true;
  });

  // Handle New Ticket Submit
  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) {
      showToast("Mohon lengkapi judul dan deskripsi permohonan konsultasi.");
      return;
    }

    const newId = `TK-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newTicketItem: Ticket = {
      id: newId,
      title: newTitle,
      category: newCategory,
      consultant: "Tim Konsultan Senior Zhou (Dalam Penugasan)",
      status: "In Progress",
      progress: 25,
      createdAt: "Hari ini (17 Sep 2026)",
      estimatedCompletion: "27 Sep 2026",
      milestones: [
        {
          step: "01",
          title: "Intake & Verifikasi Berkas Awal",
          status: "in_progress",
          date: "17 Sep 2026",
          description: "Permohonan konsultasi diterima sistem operasional dan sedang dialokasikan ke lead konsultan terkait.",
        },
        {
          step: "02",
          title: "Analisis & Pengerjaan Lembar Kerja",
          status: "pending",
          date: "Estimasi 22 Sep 2026",
          description: "Peninjauan dokumen pendukung dan penyusunan kertas kerja.",
        },
        {
          step: "03",
          title: "Finalisasi & Penyampaian Hasil",
          status: "pending",
          date: "Estimasi 27 Sep 2026",
          description: "Penerbitan dokumen deliverable resmi.",
        },
      ],
      deliverables: [],
      correspondences: [
        {
          id: `msg-${Date.now()}`,
          sender: "Tim Konsultan Zhou (Sistem Penugasan)",
          role: "Konsultan",
          date: "Hari ini &bull; Baru saja",
          message: `Permohonan konsultasi telah diterima: "${newDescription}". Konsultan pendamping sedang menelaah berkas pendukung.`,
        },
      ],
    };

    setTickets([newTicketItem, ...tickets]);
    setSelectedTicketId(newId);
    setIsNewTicketModalOpen(false);
    setNewTitle("");
    setNewDescription("");
    showToast(`Permohonan konsultasi berhasil dibuat dengan nomor referensi ${newId}. Tim kami akan segera menindaklanjuti.`);
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary text-white text-xs font-semibold py-3 px-5 rounded-xl shadow-2xl border border-white/20 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircleIcon className="text-success text-base" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-silver hover:text-white ml-2 cursor-pointer p-1"
            aria-label="Tutup notifikasi"
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
            <span className="text-primary font-bold">Layanan Konsultasi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
            Monitoring Konsultasi &amp; Lembar Kerja
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-2xl">
            Pantau alur tahapan penugasan akuntansi, kepatuhan pajak Coretax DJP, dan unduh berkas deliverable resmi secara terpusat.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsNewTicketModalOpen(true)}
          className="shadow-sm font-semibold text-xs py-2.5 px-5 flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusIcon className="text-xs" />
          <span>Buat Konsultasi Baru</span>
        </Button>
      </div>

      {/* Row 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Card 1 */}
        <Card className="rounded-xl border-primary-light bg-white p-5 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-text-muted font-medium">Konsultasi Aktif Berjalan</span>
              <div className="text-3xl font-bold text-primary">02</div>
              <span className="text-[11px] text-text-secondary">Dalam telaah konsultan</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xl">
              <ClockIcon />
            </div>
          </div>
          <div className="mt-3 w-full bg-surface h-1.5 rounded-full overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: "65%" }} />
          </div>
        </Card>

        {/* Card 2 */}
        <Card className="rounded-xl border-primary-light bg-white p-5 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-text-muted font-medium">Laporan Selesai &amp; BPE</span>
              <div className="text-3xl font-bold text-success">04</div>
              <span className="text-[11px] text-text-secondary">Terverifikasi resmi</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-success/15 flex items-center justify-center text-success text-xl">
              <CheckCircleIcon />
            </div>
          </div>
          <div className="mt-3 w-full bg-surface h-1.5 rounded-full overflow-hidden">
            <div className="bg-success h-full rounded-full" style={{ width: "100%" }} />
          </div>
        </Card>

        {/* Card 3 */}
        <Card className="rounded-xl border-primary-light bg-white p-5 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-text-muted font-medium">Total Dokumen Luaran</span>
              <div className="text-3xl font-bold text-primary">06</div>
              <span className="text-[11px] text-text-secondary">Tersimpan di Vault</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xl">
              <DocumentIcon />
            </div>
          </div>
          <div className="mt-3 w-full bg-surface h-1.5 rounded-full overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: "80%" }} />
          </div>
        </Card>
      </div>

      {/* MASTER PANEL: TABEL DAFTAR KONSULTASI */}
      <Card className="rounded-2xl border-primary-light bg-white shadow-sm overflow-hidden">
        <CardHeader className="p-5 sm:p-6 border-b border-primary-light space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base sm:text-lg font-bold text-primary">
                Daftar Seluruh Konsultasi
              </CardTitle>
              <CardDescription className="text-xs text-text-secondary mt-0.5">
                Klik baris konsultasi untuk membuka lembar kerja milestone dan berkas deliverable di panel bawah.
              </CardDescription>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-surface p-1 rounded-lg border border-primary-light self-start sm:self-auto text-xs">
              <button
                type="button"
                onClick={() => setFilterTab("all")}
                className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-all ${
                  filterTab === "all"
                    ? "bg-white text-primary shadow-sm font-bold"
                    : "text-text-secondary hover:text-primary"
                }`}
              >
                Semua ({tickets.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab("in_progress")}
                className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-all ${
                  filterTab === "in_progress"
                    ? "bg-white text-primary shadow-sm font-bold"
                    : "text-text-secondary hover:text-primary"
                }`}
              >
                Dalam Proses ({tickets.filter((t) => t.status === "In Progress").length})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab("completed")}
                className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-all ${
                  filterTab === "completed"
                    ? "bg-white text-primary shadow-sm font-bold"
                    : "text-text-secondary hover:text-primary"
                }`}
              >
                Selesai ({tickets.filter((t) => t.status === "Completed").length})
              </button>
            </div>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
            <div className="sm:col-span-8 relative">
              <SearchIcon className="absolute left-3 top-3 text-text-muted text-xs" />
              <Input
                type="text"
                placeholder="Cari ID konsultasi, judul kebutuhan, atau nama konsultan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs h-9 bg-surface border-primary-light"
              />
            </div>
            <div className="sm:col-span-4">
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs h-9 bg-surface border-primary-light"
              >
                <option value="all">Semua Kategori Layanan</option>
                <option value="Tax Service Core">Tax Service Core</option>
                <option value="Accounting Service">Accounting Service</option>
                <option value="Business Consulting">Business Consulting</option>
                <option value="Legal">Legal Compliance</option>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface/80 text-text-secondary font-bold uppercase tracking-wider text-[10px] border-b border-primary-light">
                <tr>
                  <th className="py-3.5 px-4">ID Konsultasi</th>
                  <th className="py-3.5 px-4">Subjek / Kebutuhan</th>
                  <th className="py-3.5 px-4">Divisi</th>
                  <th className="py-3.5 px-4">Konsultan Lead</th>
                  <th className="py-3.5 px-4">Progres</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-light">
                {filteredTickets.map((ticket) => {
                  const isSelected = ticket.id === selectedTicket.id;
                  return (
                    <tr
                      key={ticket.id}
                      onClick={() => setSelectedTicketId(ticket.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-primary-light/40 border-l-4 border-primary font-semibold"
                          : "hover:bg-surface/50"
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-primary">
                        {ticket.id}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="text-primary line-clamp-1 font-bold">
                          {ticket.title}
                        </div>
                        <div className="text-[11px] text-text-muted mt-0.5">
                          Dibuat: {ticket.createdAt}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[11px] text-text-secondary">
                          {ticket.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-text-primary">
                          <UserIcon className="text-[10px] text-text-muted" />
                          <span>{ticket.consultant}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-surface border border-primary-light h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                ticket.progress === 100 ? "bg-success" : "bg-primary"
                              }`}
                              style={{ width: `${ticket.progress}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-primary">
                            {ticket.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-2 py-0.5 font-semibold ${
                            ticket.status === "Completed"
                              ? "bg-success/15 text-success border-success/30"
                              : "bg-primary/10 text-primary border-primary/20"
                          }`}
                        >
                          {ticket.status === "Completed" ? "Selesai" : "Dalam Proses"}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          className={`text-xs py-1 px-3 h-auto font-semibold transition-all ${
                            isSelected
                              ? "bg-primary/10 text-primary border-primary/30"
                              : "border-primary-light text-primary hover:bg-surface"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTicketId(ticket.id);
                          }}
                        >
                          Buka Lembar Kerja
                        </Button>
                      </td>
                    </tr>
                  );
                })}

                {filteredTickets.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-text-muted">
                      Tidak ditemukan konsultasi dengan filter yang dipilih.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-primary-light bg-surface/40 flex items-center justify-between text-xs text-text-muted">
            <span>
              Menampilkan {filteredTickets.length} dari {tickets.length} total konsultasi
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="w-7 h-7 p-0 flex items-center justify-center text-xs border-primary-light text-text-muted hover:text-primary disabled:opacity-40"
                disabled
                aria-label="Halaman Sebelumnya"
              >
                <ChevronLeftIcon className="text-xs" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-7 h-7 p-0 flex items-center justify-center text-xs bg-primary/10 text-primary border-primary/30 font-bold"
              >
                1
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-7 h-7 p-0 flex items-center justify-center text-xs border-primary-light text-text-muted hover:text-primary disabled:opacity-40"
                disabled
                aria-label="Halaman Selanjutnya"
              >
                <ChevronRightIcon className="text-xs" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DETAIL PANEL: LEMBAR KERJA & ALUR TAHAPAN TIKET TERPILIH (MASTER-DETAIL) */}
      <div className="space-y-6 pt-2">
        <div className="flex items-center gap-2.5">
          <span className="text-xs uppercase font-bold tracking-wider text-text-muted">
            Inspeksi Lembar Kerja:
          </span>
          <span className="font-mono text-xs font-bold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded">
            {selectedTicket.id}
          </span>
          <span className="text-xs text-text-secondary font-semibold">
            &bull; {selectedTicket.category}
          </span>
        </div>

        {/* Selected Ticket Overview Card */}
        <Card className="rounded-2xl border-primary-light bg-white shadow-sm p-6 space-y-6">
          <div className="space-y-2">
            <h2 className="text-lg sm:text-xl font-bold text-primary">
              {selectedTicket.title}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary">
              <div>
                <span className="text-text-muted">Lead Konsultan: </span>
                <span className="font-bold text-primary">{selectedTicket.consultant}</span>
              </div>
              <div>
                <span className="text-text-muted">Tanggal Registrasi: </span>
                <span>{selectedTicket.createdAt}</span>
              </div>
              <div>
                <span className="text-text-muted">Akumulasi Progres: </span>
                <span className="font-bold text-primary">{selectedTicket.progress}%</span>
              </div>
            </div>
          </div>

          {/* 3 Horizontal Milestone Tracker Cards */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
              Tahapan Pekerjaan &amp; Alur Verifikasi Konsultan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {selectedTicket.milestones.map((milestone) => {
                const isDone = milestone.status === "completed";
                const isInProg = milestone.status === "in_progress";

                return (
                  <div
                    key={milestone.step}
                    className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                      isDone
                        ? "bg-surface/60 border-success/30"
                        : isInProg
                        ? "bg-white border-primary/40 shadow-sm"
                        : "bg-surface/30 border-primary-light text-text-muted"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                            isDone
                              ? "bg-success/20 text-success"
                              : isInProg
                              ? "bg-primary/15 text-primary border border-primary/30"
                              : "bg-surface border text-text-muted"
                          }`}
                        >
                          Tahap {milestone.step}
                        </span>

                        <span className="text-[11px] font-bold">
                          {isDone && (
                            <span className="text-success flex items-center gap-1">
                              <CheckCircleIcon className="text-xs" />
                              <span>Selesai</span>
                            </span>
                          )}
                          {isInProg && (
                            <span className="text-primary flex items-center gap-1">
                              <ClockIcon className="text-xs" />
                              <span>Berjalan</span>
                            </span>
                          )}
                          {!isDone && !isInProg && <span>Menunggu</span>}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-primary leading-snug">
                        {milestone.title}
                      </h4>
                      <p className="text-[11px] text-text-secondary leading-relaxed">
                        {milestone.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-primary-light text-[10px] text-text-muted">
                      {milestone.date}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Berkas Deliverable / Dokumen Hasil Kerja */}
          <div className="space-y-3 pt-4 border-t border-primary-light">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <span>Berkas Deliverable &amp; Kertas Kerja Resmi</span>
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.2 rounded font-normal">
                  {selectedTicket.deliverables.length} Dokumen
                </span>
              </h3>
              <Link
                href="/dashboard/user/dokumen"
                className="text-xs text-primary font-bold hover:underline"
              >
                <span>Lihat Dokumen</span>
              </Link>
            </div>

            {selectedTicket.deliverables.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedTicket.deliverables.map((doc, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-surface border border-primary-light hover:border-primary transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-9 h-9 rounded-lg bg-white border border-primary-light flex items-center justify-center text-primary font-bold text-xs shrink-0">
                        {doc.format}
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold text-primary truncate">
                          {doc.name}
                        </div>
                        <div className="text-[11px] text-text-muted mt-0.5">
                          {doc.size} &bull; Diterbitkan {doc.date}
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        showToast(`Mengunduh berkas resmi ${doc.name} (Simulasi 256-bit Secured Download).`)
                      }
                      className="text-xs py-1 px-3.5 h-auto border-primary-light text-primary hover:bg-surface font-semibold shrink-0"
                    >
                      Unduh
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-text-muted bg-surface/50 rounded-xl border border-dashed border-primary-light">
                Berkas deliverable sedang dalam proses penyusunan oleh konsultan lead.
              </div>
            )}
          </div>

          {/* Catatan Konsultan Staf */}
          <div className="space-y-4 pt-4 border-t border-primary-light">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                Catatan Konsultan Staf
              </h3>
              <span className="text-[11px] text-text-muted">
                Catatan resmi progres &amp; evaluasi pengerjaan penugasan
              </span>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {selectedTicket.correspondences.map((msg) => (
                <div
                  key={msg.id}
                  className="p-4 rounded-xl border border-primary-light bg-surface/70 text-xs leading-relaxed space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-primary flex items-center gap-2">
                      <span>{msg.sender}</span>
                      <Badge
                        variant="primary"
                        size="sm"
                        className="text-[9px] py-0 px-1.5"
                      >
                        {msg.role}
                      </Badge>
                    </div>
                    <span
                      className="text-[10px] text-text-muted"
                      dangerouslySetInnerHTML={{ __html: msg.date }}
                    />
                  </div>
                  <p className="text-text-secondary">{msg.message}</p>
                </div>
              ))}
            </div>

            {/* Banner Pengalihan Sesi Konsultasi ke Chatbot & WhatsApp */}
            <div className="p-3.5 rounded-xl bg-surface border border-primary-light flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <p className="text-text-secondary text-[11px] leading-relaxed">
                Untuk sesi konsultasi tanya-jawab interaktif dan eskalasi penugasan, silakan gunakan menu <strong>Chatbot Bantuan</strong> atau hubungi konsultan via <strong>WhatsApp Resmi</strong>.
              </p>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href="/dashboard/user/chatbot"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-primary-light text-primary hover:bg-surface text-xs font-semibold shadow-2xs transition-colors"
                >
                  <ChatbotIcon className="text-xs" />
                  <span>Chatbot Bantuan</span>
                </Link>
                <a
                  href="https://wa.me/6281234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success text-white hover:bg-success/90 text-xs font-semibold shadow-2xs transition-colors"
                >
                  <WhatsappIcon className="text-xs" />
                  <span>Konsultasi WA</span>
                </a>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* MODAL: BUAT TIKET KONSULTASI BARU */}
      {isNewTicketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl border border-primary-light shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-5 border-b border-primary-light flex items-center justify-between bg-surface">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center text-sm font-bold">
                  <PlusIcon />
                </div>
                <div>
                  <h3 className="text-base font-bold text-primary">Buat Konsultasi Baru</h3>
                  <p className="text-[11px] text-text-muted">Layanan Klien PT Maju Makmur Sentosa</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewTicketModalOpen(false)}
                className="text-text-muted hover:text-primary p-1 rounded cursor-pointer transition-colors"
                aria-label="Tutup modal"
              >
                <CloseIcon className="text-base" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="font-bold text-primary">
                  Judul Kebutuhan / Permasalahan
                </Label>
                <Input
                  id="title"
                  placeholder="Contoh: Pendampingan Respon SP2DK Pajak Masukan 2025"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="text-xs h-9"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="category" className="font-bold text-primary">
                    Divisi Layanan
                  </Label>
                  <Select
                    id="category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as Ticket["category"])}
                    className="text-xs h-9"
                  >
                    <option value="Tax Service Core">Tax Service Core</option>
                    <option value="Accounting Service">Accounting Service</option>
                    <option value="Business Consulting">Business Consulting</option>
                    <option value="Legal">Legal Compliance</option>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="urgency" className="font-bold text-primary">
                    Prioritas Penanganan
                  </Label>
                  <Select
                    id="urgency"
                    value={newUrgency}
                    onChange={(e) => setNewUrgency(e.target.value)}
                    className="text-xs h-9"
                  >
                    <option value="Normal">Normal (SLA 1x24 Jam)</option>
                    <option value="Tinggi">Tinggi / Urgent (SP2DK Deadline)</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description" className="font-bold text-primary">
                  Uraian Detail Masalah / Pertanyaan
                </Label>
                <Textarea
                  id="description"
                  placeholder="Jelaskan secara ringkas latar belakang persoalan atau ruang lingkup yang ingin dikonsultasikan..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={4}
                  className="text-xs"
                  required
                />
              </div>

              <div className="p-3 bg-surface border border-dashed border-primary-light rounded-xl text-center">
                <DocumentIcon className="mx-auto text-primary text-lg mb-1" />
                <span className="text-[11px] text-text-secondary block">
                  Unggah berkas lampiran pendukung (PDF / XLSX maks. 10MB)
                </span>
                <span className="text-[10px] text-text-muted block mt-0.5">
                  Otomatis terenkripsi dan terikat perjanjian kerahasiaan NDA
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-primary-light">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsNewTicketModalOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Kirim Permohonan Konsultasi
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
