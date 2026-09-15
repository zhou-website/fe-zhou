"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ShieldTaxIcon,
  CheckCircleIcon,
  DownloadIcon,
  ChatbotIcon,
  LogoutIcon,
  UserIcon,
  CloseIcon,
  PlusIcon,
  CheckIcon,
  DocumentIcon,
} from "@/components/icons";

interface Ticket {
  id: string;
  title: string;
  category: "Tax Service Core" | "Accounting Service" | "Legal" | "Business Consulting";
  consultant: string;
  status: "In Progress" | "Completed";
  progress: number;
  updatedAt: string;
  checklists: { text: string; done: boolean }[];
  deliverableFile?: string;
}

export default function UserDashboard() {
  const router = useRouter();
  const [filterStatus, setFilterStatus] = useState<"ALL" | "In Progress" | "Completed">("ALL");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatbotStep, setChatbotStep] = useState<"categories" | "answer" | "create_ticket" | "success">("categories");
  const [selectedQuery, setSelectedQuery] = useState<{ q: string; a: string; category: string } | null>(null);
  const [newTicketData, setNewTicketData] = useState({ title: "", category: "Tax Service Core", description: "" });
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Client tickets
  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: "TK-2026-089",
      title: "Pelaporan SPT Tahunan Badan & Ekualisasi Fiskal",
      category: "Tax Service Core",
      consultant: "Linda David, S.Ak., BKP",
      status: "In Progress",
      progress: 75,
      updatedAt: "14 Sep 2026, 14:30 WIB",
      checklists: [
        { text: "Telaah awal laporan keuangan komersial & jurnal penyesuaian", done: true },
        { text: "Kompilasi rekonsiliasi fiskal positif/negatif", done: true },
        { text: "Verifikasi kredit pajak PPh 22, 23, 25 & bukti potong unifikasi", done: true },
        { text: "Finalisasi draft SPT Tahunan & pengunggahan ke portal Coretax DJP", done: false },
      ],
      deliverableFile: "Draft_Rekonsiliasi_Fiskal_2025_v1.pdf",
    },
    {
      id: "TK-2026-042",
      title: "Kompilasi Laporan Keuangan Berstandar SAK Q2 2026",
      category: "Accounting Service",
      consultant: "Tasya Anggraeni Firdaus, SE.",
      status: "Completed",
      progress: 100,
      updatedAt: "08 Sep 2026, 11:15 WIB",
      checklists: [
        { text: "Rekonsiliasi rekening koran operasional 3 bank", done: true },
        { text: "Pencatatan depresiasi aset tetap & amortisasi beban", done: true },
        { text: "Penerbitan Neraca & Laporan Laba Rugi Komprehensif", done: true },
        { text: "Penandatanganan berita acara telaah laporan akuntansi", done: true },
      ],
      deliverableFile: "Laporan_Keuangan_SAK_Q2_Final_Signed.pdf",
    },
    {
      id: "TK-2026-015",
      title: "Tinjauan Hukum Kontrak Vendor & Kepatuhan PPN Transaksi",
      category: "Legal",
      consultant: "Muhamad Dekhsa Afnan, SH., M.Kn.",
      status: "Completed",
      progress: 100,
      updatedAt: "28 Agu 2026, 16:45 WIB",
      checklists: [
        { text: "Pemeriksaan klausul hak & kewajiban fiskal kedua belah pihak", done: true },
        { text: "Validasi NPWP 16 digit & SPPKP rekanan", done: true },
        { text: "Pemberian opini legal hukum perpajakan tertulis", done: true },
      ],
      deliverableFile: "Legal_Opinion_PPN_Kontrak_Vendor.pdf",
    },
  ]);

  // Client downloadable secured documents
  const clientFiles = [
    {
      name: "Bukti Penerimaan Elektronik (BPE) SPT Masa PPN Juli 2026",
      category: "Pajak",
      date: "10 Agu 2026",
      size: "820 KB",
    },
    {
      name: "Laporan Keuangan Neraca & Laba Rugi Q2 2026 (Final SAK)",
      category: "Akuntansi",
      date: "08 Sep 2026",
      size: "2.4 MB",
    },
    {
      name: "Dokumen Rekonsiliasi Fiskal & Ekualisasi Omzet 2025",
      category: "Pajak",
      date: "14 Sep 2026",
      size: "1.8 MB",
    },
  ];

  // Rule-based decision tree items (Pure rule-based, NO external AI)
  const decisionTree = [
    {
      category: "Transformasi Coretax DJP",
      q: "Bagaimana cara validasi aktivasi akun NPWP 16 digit & Deposit Pajak di Coretax?",
      a: "Untuk memvalidasi kesiapan Coretax: 1) Masuk ke portal DJP Online; 2) Buka menu Profil dan cocokkan NIK/NPWP 16 digit; 3) Pastikan penanggung jawab badan usaha telah mengaktifkan sertifikat digital elektronik. Zhou Consulting menyediakan asistensi sinkronisasi jika data profil Anda belum tervalidasi.",
    },
    {
      category: "Pelaporan SPT & Faktur Pajak",
      q: "Apa yang harus disiapkan sebelum penutupan SPT Masa PPN tanggal akhir bulan?",
      a: "Pastikan seluruh Faktur Pajak Masukan telah di-approve pada aplikasi e-Faktur/Coretax, seluruh Faktur Pajak Keluaran telah diterbitkan sebelum batas waktu, serta rekonsiliasi retur faktur pajak telah tercatat di buku besar akuntansi.",
    },
    {
      category: "Tanggapan Surat SP2DK",
      q: "Perusahaan kami menerima surat SP2DK dari KPP, apa langkah pertama yang harus dilakukan?",
      a: "Langkah pertama: Jangan panik. KPP memberikan waktu 14 hari kalender untuk memberikan klarifikasi tertulis. Kumpulkan data ekualisasi fiskal pada tahun pajak yang dimaksud, dan segera kirimkan salinan surat SP2DK kepada tim konsultan Zhou Consulting untuk penyusunan surat tanggapan formal.",
    },
    {
      category: "Standar Pembukuan SAK",
      q: "Mengapa rekonsiliasi bank bulanan mutlak dibutuhkan dalam laporan keuangan berstandar SAK?",
      a: "Rekonsiliasi bank memastikan bahwa saldo kas internal dan catatan bank tidak memiliki selisih (outstanding check atau deposit in transit). Laporan keuangan yang tidak memiliki rekonsiliasi bank valid akan diragukan kredibilitasnya oleh auditor dan pihak perbankan.",
    },
  ];

  const filteredTickets = tickets.filter((t) => {
    if (filterStatus === "ALL") return true;
    return t.status === filterStatus;
  });

  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketData.title || !newTicketData.description) {
      alert("Mohon isi judul dan deskripsi masalah konsultasi.");
      return;
    }

    const createdTicket: Ticket = {
      id: `TK-2026-0${Math.floor(100 + Math.random() * 900)}`,
      title: newTicketData.title,
      category: newTicketData.category as Ticket["category"],
      consultant: "Staf Alokasi Konsultan Zhou",
      status: "In Progress",
      progress: 25,
      updatedAt: "Hari ini, Baru saja",
      checklists: [
        { text: "Registrasi dan verifikasi berkas permohonan klien", done: true },
        { text: "Penugasan konsultan spesialis sesuai bidang permohonan", done: false },
        { text: "Penyusunan telaah awal dan tindak lanjut kertas kerja", done: false },
      ],
      deliverableFile: undefined,
    };

    setTickets([createdTicket, ...tickets]);
    setChatbotStep("success");
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col selection:bg-primary selection:text-white">
      {/* Top Navbar */}
      <header className="bg-primary text-white border-b border-white/10 sticky top-0 z-30">
        <div className="container-custom flex items-center justify-between h-18 py-3">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-primary font-bold text-lg">
                Z
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-white">
                  ZHOU CONSULTING
                </span>
                <span className="text-[10px] text-silver uppercase tracking-wider font-medium">
                  Portal Klien Terintegrasi
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {/* User Profile Trigger */}
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/15 text-xs text-white transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-silver/30 flex items-center justify-center text-xs">
                <UserIcon />
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="font-semibold text-xs leading-none">PT Maju Makmur Sentosa</span>
                <span className="text-[10px] text-silver">Budi Santoso (Direktur)</span>
              </div>
            </button>

            {/* Logout button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/login")}
              className="border-white/20 text-white hover:bg-white/10 hover:text-white text-xs px-3"
            >
              <LogoutIcon className="text-xs sm:mr-1.5" />
              <span className="hidden sm:inline">Keluar</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="container-custom flex-1 py-8 space-y-8">
        {/* Welcome Banner & Action Row */}
        <div className="rounded-xl bg-white border border-primary-light p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="silver" className="text-[10px] uppercase font-bold">
                Klien Terverifikasi
              </Badge>
              <span className="text-xs text-text-secondary">ID Klien: <strong>CL-88219</strong></span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-primary">
              Selamat Datang, PT Maju Makmur Sentosa
            </h1>
            <p className="text-xs text-text-secondary">
              Pantau kemajuan lembar kerja akuntansi, pelaporan pajak Coretax, dan unduh berkas resmi Anda di sini.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setShowChatbot(true);
                setChatbotStep("create_ticket");
              }}
              className="text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <PlusIcon className="text-xs" />
              <span>Tiket Konsultasi Baru</span>
            </Button>
            <Button
              variant="silver"
              size="sm"
              onClick={() => {
                setShowChatbot(true);
                setChatbotStep("categories");
              }}
              className="text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <ChatbotIcon className="text-xs" />
              <span>Chatbot Bantuan</span>
            </Button>
          </div>
        </div>

        {/* Dashboard Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Ticket Monitoring (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-primary-light pb-3">
              <div>
                <h2 className="text-base font-bold text-primary">
                  Monitoring Progres Tiket Konsultasi
                </h2>
                <p className="text-xs text-text-secondary">
                  Sinkronisasi otomatis dengan lembar kerja tim konsultan Zhou Consulting
                </p>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setFilterStatus("ALL")}
                  className={`px-3 py-1 rounded font-semibold transition-colors ${
                    filterStatus === "ALL"
                      ? "bg-primary text-white"
                      : "bg-white border border-primary-light text-text-secondary hover:text-primary"
                  }`}
                >
                  Semua ({tickets.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus("In Progress")}
                  className={`px-3 py-1 rounded font-semibold transition-colors ${
                    filterStatus === "In Progress"
                      ? "bg-primary text-white"
                      : "bg-white border border-primary-light text-text-secondary hover:text-primary"
                  }`}
                >
                  In Progress
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus("Completed")}
                  className={`px-3 py-1 rounded font-semibold transition-colors ${
                    filterStatus === "Completed"
                      ? "bg-primary text-white"
                      : "bg-white border border-primary-light text-text-secondary hover:text-primary"
                  }`}
                >
                  Completed
                </button>
              </div>
            </div>

            {/* Ticket Cards List */}
            <div className="space-y-3">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-white rounded-lg border border-primary-light p-5 shadow-sm hover:border-primary transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-primary bg-primary-light px-2 py-0.5 rounded">
                        {ticket.id}
                      </span>
                      <Badge
                        variant={ticket.status === "Completed" ? "success" : "silver"}
                        className="text-[10px]"
                      >
                        {ticket.status}
                      </Badge>
                      <span className="text-xs text-text-secondary font-medium">
                        &bull; {ticket.category}
                      </span>
                    </div>
                    <span className="text-[11px] text-text-secondary">
                      Update: {ticket.updatedAt}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-primary">{ticket.title}</h3>

                  {/* Progress Bar & Checklist Summary */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-secondary">
                        Konsultan: <strong className="text-primary">{ticket.consultant}</strong>
                      </span>
                      <span className="font-bold text-primary">{ticket.progress}% Selesai</span>
                    </div>
                    <div className="w-full h-2 bg-surface rounded-full overflow-hidden border border-primary-light">
                      <div
                        className={`h-full transition-all duration-300 ${
                          ticket.status === "Completed" ? "bg-success" : "bg-primary"
                        }`}
                        style={{ width: `${ticket.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Action row */}
                  <div className="flex items-center justify-between pt-2 border-t border-primary-light text-xs">
                    <span className="text-text-secondary">
                      {ticket.checklists.filter((c) => c.done).length} dari {ticket.checklists.length} tugas telah diselesaikan
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedTicket(ticket)}
                      className="text-xs font-semibold py-1 px-3"
                    >
                      Lihat Rincian Tugas &rarr;
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Secured Documents & Contact Consultant (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Secured Files Download Card */}
            <div className="bg-white rounded-lg border border-primary-light p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DocumentIcon className="text-primary text-sm" />
                  <h3 className="text-sm font-bold text-primary">Akses Berkas &amp; Laporan</h3>
                </div>
                <Badge variant="silver" className="text-[10px]">Terenkripsi</Badge>
              </div>

              <p className="text-xs text-text-secondary leading-relaxed">
                Dokumen resmi hasil audit, SPT, dan kertas kerja berlisensi NDA Anda.
              </p>

              <div className="space-y-2.5 pt-1">
                {clientFiles.map((file, fIdx) => (
                  <div
                    key={fIdx}
                    className="p-3 rounded-md border border-primary-light bg-surface hover:bg-white hover:border-primary transition-all flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold text-primary leading-snug line-clamp-1">
                        {file.name}
                      </div>
                      <div className="text-[10px] text-text-secondary">
                        {file.category} &bull; {file.date} &bull; {file.size}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => alert(`Mengunduh berkas terverifikasi: ${file.name}`)}
                      className="p-2 rounded hover:bg-primary-light text-primary hover:text-primary-dark transition-colors flex-shrink-0"
                      title="Unduh Berkas"
                    >
                      <DownloadIcon className="text-xs" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Fast Assistance Card */}
            <div className="bg-primary text-white rounded-lg p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <ShieldTaxIcon className="text-sm text-silver" />
                <h4 className="text-sm font-bold">Pusat Asistensi Konsultan</h4>
              </div>
              <p className="text-xs text-silver leading-relaxed">
                Butuh klarifikasi cepat atau jadwal tatap muka/online dengan konsultan penanggung jawab tiket Anda?
              </p>
              <div className="pt-2">
                <Button
                  variant="silver"
                  size="sm"
                  asChild
                  className="w-full text-xs font-semibold justify-center"
                >
                  <a
                    href="https://wa.me/6281234567890?text=Halo%20Zhou%20Consulting,%20saya%20klien%20CL-88219%20ingin%20berkonsultasi%20mengenai%20tiket%20aktif."
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Hubungi via WhatsApp CS
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-dark/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-2xl border border-primary-light max-w-lg w-full p-6 space-y-5 relative">
            <button
              onClick={() => setSelectedTicket(null)}
              className="absolute top-4 right-4 text-text-secondary hover:text-primary p-1.5 focus:outline-none"
              aria-label="Tutup"
            >
              <CloseIcon className="text-lg" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-primary bg-primary-light px-2 py-0.5 rounded">
                  {selectedTicket.id}
                </span>
                <Badge variant={selectedTicket.status === "Completed" ? "success" : "silver"}>
                  {selectedTicket.status}
                </Badge>
              </div>
              <h3 className="text-base font-bold text-primary">{selectedTicket.title}</h3>
              <p className="text-xs text-text-secondary">
                Konsultan Bertugas: <strong>{selectedTicket.consultant}</strong> &bull; {selectedTicket.category}
              </p>
            </div>

            {/* Checklist items */}
            <div className="space-y-2 border-y border-primary-light py-4">
              <span className="text-xs font-bold text-primary uppercase tracking-wider block">
                Lembar Kerja Tugas:
              </span>
              <div className="space-y-2">
                {selectedTicket.checklists.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-2.5 p-2 rounded text-xs ${
                      item.done ? "bg-surface text-text" : "bg-white border border-primary-light text-text-secondary"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center text-[10px] ${
                        item.done ? "bg-success text-white" : "border border-silver text-transparent"
                      }`}
                    >
                      <CheckIcon />
                    </div>
                    <span className={item.done ? "line-through text-text-secondary" : "font-medium text-text"}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {selectedTicket.deliverableFile && (
              <div className="p-3 rounded-md bg-surface border border-primary-light flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-silver">Berkas Laporan Terkait:</span>
                  <div className="text-xs font-semibold text-primary">{selectedTicket.deliverableFile}</div>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => alert(`Mengunduh ${selectedTicket.deliverableFile}...`)}
                  className="text-xs"
                >
                  Unduh
                </Button>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedTicket(null)}>
                Tutup Rincian
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Pure Rule-Based Decision Tree Chatbot Modal / Widget */}
      {showChatbot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-dark/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-2xl border border-primary-light max-w-lg w-full p-6 space-y-5 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowChatbot(false)}
              className="absolute top-4 right-4 text-text-secondary hover:text-primary p-1.5 focus:outline-none"
              aria-label="Tutup"
            >
              <CloseIcon className="text-lg" />
            </button>

            {/* Chatbot Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center text-lg">
                <ChatbotIcon />
              </div>
              <div>
                <h3 className="text-base font-bold text-primary">Asisten Bantuan &amp; FAQ Pajak</h3>
                <span className="text-[11px] text-text-secondary">
                  Rule-based decision tree sistem informasi Zhou Consulting
                </span>
              </div>
            </div>

            {/* STEP 1: Categories & Common Queries */}
            {chatbotStep === "categories" && (
              <div className="space-y-4">
                <p className="text-xs text-text-secondary">
                  Pilih topik pertanyaan di bawah ini untuk melihat panduan instan atau ajukan tiket permohonan baru jika kendala Anda belum terdaftar:
                </p>

                <div className="space-y-2">
                  {decisionTree.map((item, qIdx) => (
                    <button
                      key={qIdx}
                      type="button"
                      onClick={() => {
                        setSelectedQuery(item);
                        setChatbotStep("answer");
                      }}
                      className="w-full text-left p-3 rounded-lg border border-primary-light bg-surface hover:bg-white hover:border-primary transition-all text-xs space-y-1 block"
                    >
                      <Badge variant="silver" className="text-[9px] uppercase font-bold">
                        {item.category}
                      </Badge>
                      <div className="font-semibold text-primary">{item.q}</div>
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-primary-light flex items-center justify-between">
                  <span className="text-xs text-text-secondary">Topik Anda tidak tersedia?</span>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setChatbotStep("create_ticket")}
                    className="text-xs"
                  >
                    Buat Tiket Baru &rarr;
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: Answer & Evaluation */}
            {chatbotStep === "answer" && selectedQuery && (
              <div className="space-y-5">
                <div className="p-3.5 rounded-lg bg-surface border border-primary-light space-y-1.5">
                  <Badge variant="silver" className="text-[10px] uppercase">
                    {selectedQuery.category}
                  </Badge>
                  <h4 className="text-sm font-bold text-primary">{selectedQuery.q}</h4>
                </div>

                <div className="p-4 rounded-lg bg-white border border-primary-light space-y-2 text-xs text-text leading-relaxed">
                  <span className="font-bold text-primary block">Panduan Penyelesaian:</span>
                  <p>{selectedQuery.a}</p>
                </div>

                {/* Evaluation Prompt: Solusi Ditemukan / Belum? */}
                <div className="p-4 rounded-lg bg-primary-light/50 border border-primary-light text-center space-y-3">
                  <span className="text-xs font-semibold text-primary block">
                    Apakah panduan di atas telah menyelesaikan kendala Anda?
                  </span>
                  <div className="flex gap-2 justify-center">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setShowChatbot(false)}
                      className="text-xs px-4"
                    >
                      Ya, Masalah Selesai
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setChatbotStep("create_ticket")}
                      className="text-xs px-4"
                    >
                      Belum, Buat Tiket Konsultasi
                    </Button>
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setChatbotStep("categories")}
                    className="text-xs text-text-secondary hover:text-primary"
                  >
                    &larr; Kembali ke daftar pertanyaan
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Create Ticket Form */}
            {chatbotStep === "create_ticket" && (
              <form onSubmit={handleCreateTicketSubmit} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-primary">Buat Tiket Konsultasi Baru</h4>
                  <p className="text-text-secondary text-[11px]">
                    Tim konsultan Zhou Consulting akan menelaah permohonan Anda dan mengalokasikan staf spesialis.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="ticket-title">Judul Tiket / Pokok Permasalahan</Label>
                  <Input
                    id="ticket-title"
                    value={newTicketData.title}
                    onChange={(e) => setNewTicketData({ ...newTicketData, title: e.target.value })}
                    placeholder="Contoh: Ekualisasi Omzet SPT Masa PPN Juli"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="ticket-category">Kategori Layanan</Label>
                  <select
                    id="ticket-category"
                    value={newTicketData.category}
                    onChange={(e) => setNewTicketData({ ...newTicketData, category: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-primary-light bg-white text-text text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                  >
                    <option value="Tax Service Core">Tax Service Core (Coretax &amp; SPT)</option>
                    <option value="Accounting Service">Accounting Service (Pembukuan SAK)</option>
                    <option value="Legal">Legal Consulting (Hukum &amp; Kontrak)</option>
                    <option value="Business Consulting">Business &amp; Financial Consulting</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="ticket-desc">Deskripsi Rinci Permasalahan</Label>
                  <Textarea
                    id="ticket-desc"
                    rows={4}
                    value={newTicketData.description}
                    onChange={(e) => setNewTicketData({ ...newTicketData, description: e.target.value })}
                    placeholder="Jelaskan kronologi, nilai transaksi, atau kendala teknis yang dihadapi..."
                    required
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setChatbotStep("categories")}
                    className="flex-1"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="flex-1"
                  >
                    Kirim Permohonan Tiket
                  </Button>
                </div>
              </form>
            )}

            {/* STEP 4: Ticket Creation Success */}
            {chatbotStep === "success" && (
              <div className="py-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-success/15 text-success flex items-center justify-center mx-auto text-2xl">
                  <CheckCircleIcon />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-primary">Tiket Berhasil Didaftarkan!</h4>
                  <p className="text-xs text-text-secondary max-w-sm mx-auto">
                    Tiket konsultasi baru telah ditambahkan ke lembar kerja monitoring Anda dengan status <strong>In Progress</strong>. Konsultan akan segera menindaklanjuti.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowChatbot(false)}
                  className="mt-2 text-xs"
                >
                  Lihat Lembar Kerja
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-dark/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-2xl border border-primary-light max-w-md w-full p-6 space-y-5 relative">
            <button
              onClick={() => setShowProfileModal(false)}
              className="absolute top-4 right-4 text-text-secondary hover:text-primary p-1.5 focus:outline-none"
              aria-label="Tutup"
            >
              <CloseIcon className="text-lg" />
            </button>

            <h3 className="text-base font-bold text-primary">Profil Klien &amp; Keamanan</h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-md bg-surface border border-primary-light space-y-2">
                <div>
                  <span className="text-[10px] text-text-secondary uppercase font-bold">Nama Perusahaan:</span>
                  <div className="font-bold text-primary text-sm">PT Maju Makmur Sentosa</div>
                </div>
                <div>
                  <span className="text-[10px] text-text-secondary uppercase font-bold">NPWP 16 Digit:</span>
                  <div className="font-mono text-primary">01.234.567.8-012.000</div>
                </div>
                <div>
                  <span className="text-[10px] text-text-secondary uppercase font-bold">Narahubung:</span>
                  <div className="text-primary font-medium">Budi Santoso &bull; direktur@majumakmur.co.id</div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-primary-light">
                <Label htmlFor="change-pass">Ganti Kata Sandi</Label>
                <Input id="change-pass" type="password" placeholder="Kata sandi baru" />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    alert("Kata sandi berhasil diperbarui.");
                    setShowProfileModal(false);
                  }}
                  className="w-full text-xs"
                >
                  Simpan Perubahan
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
