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
  LogoutIcon,
  UserIcon,
  CloseIcon,
} from "@/components/icons";

interface AdminTicket {
  id: string;
  clientName: string;
  clientId: string;
  title: string;
  category: "Accounting Service" | "Business Financial Consulting" | "Legal" | "Tax Service Core" | "Others";
  consultant: string;
  status: "In Progress" | "Completed";
  deliverableFile?: string;
  checklists: { id: number; text: string; done: boolean }[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"worksheet" | "cms">("worksheet");

  // Worksheet State
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [selectedTicket, setSelectedTicket] = useState<AdminTicket | null>(null);
  const [auditMessage, setAuditMessage] = useState<string | null>(null);
  const [uploadFileName, setUploadFileName] = useState("");

  const [tickets, setTickets] = useState<AdminTicket[]>([
    {
      id: "TK-2026-089",
      clientName: "PT Maju Makmur Sentosa",
      clientId: "CL-88219",
      title: "Pelaporan SPT Tahunan Badan & Ekualisasi Fiskal",
      category: "Tax Service Core",
      consultant: "Linda David, S.Ak., BKP",
      status: "In Progress",
      checklists: [
        { id: 1, text: "Telaah laporan keuangan komersial & jurnal penyesuaian", done: true },
        { id: 2, text: "Kompilasi rekonsiliasi fiskal positif/negatif", done: true },
        { id: 3, text: "Verifikasi kredit pajak PPh 22, 23, 25 & bukti potong unifikasi", done: true },
        { id: 4, text: "Finalisasi draft SPT Tahunan & pengunggahan ke portal Coretax DJP", done: false },
      ],
      deliverableFile: "Draft_Rekonsiliasi_Fiskal_2025_v1.pdf",
    },
    {
      id: "TK-2026-092",
      clientName: "CV Borneo Karya Prima",
      clientId: "CL-74102",
      title: "Penyusunan Jurnal Buku Besar & Laporan Laba Rugi Q3",
      category: "Accounting Service",
      consultant: "Tasya Anggraeni Firdaus, SE.",
      status: "In Progress",
      checklists: [
        { id: 1, text: "Verifikasi nota transaksi pembelian & penjualan", done: true },
        { id: 2, text: "Posting jurnal ke buku besar SAK", done: false },
        { id: 3, text: "Rekonsiliasi mutasi kas & bank", done: false },
      ],
    },
    {
      id: "TK-2026-077",
      clientName: "PT Solusi Niaga Terpadu",
      clientId: "CL-90145",
      title: "Studi Kelayakan Investasi & Proyeksi Finansial Ekspansi",
      category: "Business Financial Consulting",
      consultant: "Linda David, S.Ak., BKP",
      status: "In Progress",
      checklists: [
        { id: 1, text: "Pengumpulan data historis arus kas 3 tahun terakhir", done: true },
        { id: 2, text: "Perhitungan NPV, IRR, dan Payback Period", done: true },
        { id: 3, text: "Penyusunan executive presentation kelayakan modal", done: false },
      ],
    },
    {
      id: "TK-2026-061",
      clientName: "PT Mega Cipta Pratama",
      clientId: "CL-51209",
      title: "Pemeriksaan Legalitas Kemitraan & Klausa Pajak Kontrak",
      category: "Legal",
      consultant: "Muhamad Dekhsa Afnan, SH., M.Kn.",
      status: "Completed",
      checklists: [
        { id: 1, text: "Uji kepatuhan legalitas hukum perseroan OSS", done: true },
        { id: 2, text: "Kaji risiko sengketa perpajakan pasal ganti rugi", done: true },
        { id: 3, text: "Penerbitan legal summary review", done: true },
      ],
      deliverableFile: "Legal_Opinion_PT_Mega_Cipta.pdf",
    },
    {
      id: "TK-2026-050",
      clientName: "Yayasan Bina Sejahtera",
      clientId: "CL-33981",
      title: "Permohonan SKB PPh Pasal 23 & Pendampingan Non-Profit",
      category: "Others",
      consultant: "Tasya Anggraeni Firdaus, SE.",
      status: "Completed",
      checklists: [
        { id: 1, text: "Pemeriksaan syarat administratif nirlaba", done: true },
        { id: 2, text: "Pengajuan SKB ke KPP Pratama", done: true },
      ],
      deliverableFile: "SKB_PPh23_Yayasan_Approved.pdf",
    },
  ]);

  // CMS State
  const [cmsSection, setCmsSection] = useState<"profil" | "kurs" | "regulasi" | "edukasi" | "karir">("profil");
  const [cmsNotification, setCmsNotification] = useState<string | null>(null);
  const [cmsProfilData, setCmsProfilData] = useState({
    headline: "Solusi Terintegrasi Akuntansi, Pajak & Tata Kelola Finansial Bisnis",
    subheadline: "Zhou Consulting mendampingi entitas bisnis, korporasi, dan wirausaha dalam mencapai kepatuhan pajak paripurna...",
    vision: "Menjadi kantor konsultan akuntansi dan perpajakan terdepan yang mengedepankan akurasi, integritas, dan keselarasan penuh dengan transformasi digital Coretax DJP.",
  });
  const [cmsKursData, setCmsKursData] = useState([
    { currency: "USD", rate: "Rp 15.825" },
    { currency: "EUR", rate: "Rp 16.940" },
    { currency: "SGD", rate: "Rp 11.890" },
  ]);

  // Toggle checklist item
  const handleToggleChecklist = (ticketId: string, checklistId: number) => {
    const updated = tickets.map((t) => {
      if (t.id === ticketId) {
        const updatedChecklists = t.checklists.map((c) =>
          c.id === checklistId ? { ...c, done: !c.done } : c
        );
        return { ...t, checklists: updatedChecklists };
      }
      return t;
    });
    setTickets(updated);

    if (selectedTicket && selectedTicket.id === ticketId) {
      const updatedSel = updated.find((t) => t.id === ticketId) || null;
      setSelectedTicket(updatedSel);
    }
  };

  // Complete ticket action (enforces rule: all checklist must be done)
  const handleMarkAsCompleted = (ticketId: string) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    const allDone = ticket.checklists.every((c) => c.done);
    if (!allDone) {
      alert("Peringatan: Seluruh butir checklist tugas wajib diselesaikan sebelum mengubah status menjadi Completed.");
      return;
    }

    const updated = tickets.map((t) =>
      t.id === ticketId ? { ...t, status: "Completed" as const } : t
    );
    setTickets(updated);

    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, status: "Completed" });
    }

    // Trigger Audit Log
    const now = new Date().toLocaleString("id-ID");
    const logNotice = `Log Audit Otomatis Tercatat: Status tiket ${ticket.id} (${ticket.clientName}) diubah dari 'In Progress' menjadi 'Completed' oleh Admin Linda David pada ${now}.`;
    setAuditMessage(logNotice);
    setTimeout(() => setAuditMessage(null), 7000);
  };

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    if (categoryFilter === "ALL") return true;
    return t.category === categoryFilter;
  });

  // Save CMS notification
  const handleSaveCMS = () => {
    setCmsNotification("Perubahan konten CMS berhasil disimpan dan langsung diterbitkan ke Landing Page publik.");
    setTimeout(() => setCmsNotification(null), 5000);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col selection:bg-primary selection:text-white">
      {/* Top Header */}
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
                  Portal Staf &amp; Administrasi
                </span>
              </div>
            </Link>

            <Badge variant="silver" className="text-[10px] hidden md:inline-flex">
              Staff Console
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-md bg-white/10 text-xs text-white">
              <div className="w-6 h-6 rounded-full bg-silver/30 flex items-center justify-center text-xs">
                <UserIcon />
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="font-semibold text-xs leading-none">Linda David, S.Ak., BKP</span>
                <span className="text-[10px] text-silver">Konsultan Pajak &amp; Administrator</span>
              </div>
            </div>

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

      {/* Main Workspace Container */}
      <main className="container-custom flex-1 py-8 space-y-6">
        {/* Audit Log Trigger Alert Banner */}
        {auditMessage && (
          <div className="p-4 rounded-lg bg-primary text-white border border-silver/30 shadow-md flex items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5 text-xs">
              <ShieldTaxIcon className="text-success text-sm flex-shrink-0" />
              <span>{auditMessage}</span>
            </div>
            <button
              onClick={() => setAuditMessage(null)}
              className="text-silver hover:text-white p-1"
            >
              <CloseIcon className="text-xs" />
            </button>
          </div>
        )}

        {/* Navigation Tabs: Worksheet vs CMS */}
        <div className="flex items-center justify-between border-b border-primary-light pb-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("worksheet")}
              className={`px-4 py-2 rounded-md text-xs font-bold transition-colors ${
                activeTab === "worksheet"
                  ? "bg-primary text-white"
                  : "bg-white text-text-secondary hover:text-primary border border-primary-light"
              }`}
            >
              Manajemen Lembar Kerja &amp; Tugas
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("cms")}
              className={`px-4 py-2 rounded-md text-xs font-bold transition-colors ${
                activeTab === "cms"
                  ? "bg-primary text-white"
                  : "bg-white text-text-secondary hover:text-primary border border-primary-light"
              }`}
            >
              CMS Landing Page Editor
            </button>
          </div>

          <span className="text-xs text-text-secondary hidden md:inline">
            Akses Hak: <strong>Admin / Konsultan Staf</strong>
          </span>
        </div>

        {/* TAB 1: MANAJEMEN LEMBAR KERJA & CHECKLIST TUGAS */}
        {activeTab === "worksheet" && (
          <div className="space-y-6">
            {/* Category Filter Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-text-secondary font-semibold whitespace-nowrap">Filter Kategori:</span>
              {[
                { label: "Semua", val: "ALL" },
                { label: "Accounting Service", val: "Accounting Service" },
                { label: "Business Financial Consulting", val: "Business Financial Consulting" },
                { label: "Legal", val: "Legal" },
                { label: "Tax Service Core", val: "Tax Service Core" },
                { label: "Others", val: "Others" },
              ].map((c) => (
                <button
                  key={c.val}
                  type="button"
                  onClick={() => setCategoryFilter(c.val)}
                  className={`px-3 py-1.5 rounded-md font-semibold whitespace-nowrap transition-colors ${
                    categoryFilter === c.val
                      ? "bg-primary text-white"
                      : "bg-white border border-primary-light text-text-secondary hover:text-primary"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Tickets Table / List */}
            <div className="bg-white rounded-xl border border-primary-light shadow-sm overflow-hidden">
              <div className="p-4 bg-surface border-b border-primary-light flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-primary">Daftar Tiket Klien Aktif</h3>
                  <span className="text-xs text-text-secondary">
                    Menampilkan {filteredTickets.length} tiket penugasan
                  </span>
                </div>
              </div>

              <div className="divide-y divide-primary-light text-xs">
                {filteredTickets.map((ticket) => {
                  const allDone = ticket.checklists.every((c) => c.done);
                  return (
                    <div
                      key={ticket.id}
                      className="p-5 hover:bg-surface/50 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 max-w-xl">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-primary bg-primary-light px-2 py-0.5 rounded">
                            {ticket.id}
                          </span>
                          <span className="text-text-secondary">&bull; {ticket.clientId}</span>
                          <span className="font-semibold text-primary">{ticket.clientName}</span>
                          <Badge
                            variant={ticket.status === "Completed" ? "success" : "silver"}
                            className="text-[10px]"
                          >
                            {ticket.status}
                          </Badge>
                        </div>
                        <h4 className="text-sm font-bold text-primary">{ticket.title}</h4>
                        <div className="flex flex-wrap items-center gap-3 text-text-secondary text-[11px]">
                          <span>Kategori: <strong>{ticket.category}</strong></span>
                          <span>&bull; PIC: <strong>{ticket.consultant}</strong></span>
                          <span>
                            &bull; Checklist:{" "}
                            <strong>
                              {ticket.checklists.filter((c) => c.done).length} / {ticket.checklists.length}
                            </strong>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 self-start lg:self-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTicket(ticket)}
                          className="text-xs font-semibold"
                        >
                          Kelola Checklist ({ticket.checklists.filter((c) => c.done).length}/{ticket.checklists.length})
                        </Button>

                        {ticket.status === "In Progress" && (
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={!allDone}
                            onClick={() => handleMarkAsCompleted(ticket.id)}
                            className={`text-xs font-semibold ${
                              !allDone ? "opacity-40 cursor-not-allowed" : ""
                            }`}
                            title={
                              allDone
                                ? "Tandai Selesai"
                                : "Checklist belum 100% lengkap"
                            }
                          >
                            Tandai Selesai
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CMS LANDING PAGE EDITOR */}
        {activeTab === "cms" && (
          <div className="bg-white rounded-xl border border-primary-light p-6 shadow-sm space-y-6">
            {cmsNotification && (
              <div className="p-3.5 rounded-md bg-success/15 text-success border border-success/30 text-xs font-semibold flex items-center gap-2">
                <CheckCircleIcon className="text-sm" />
                <span>{cmsNotification}</span>
              </div>
            )}

            <div className="flex items-center justify-between border-b border-primary-light pb-4">
              <div>
                <h3 className="text-base font-bold text-primary">Content Management System (CMS)</h3>
                <p className="text-xs text-text-secondary">
                  Sunting profil, tabel kurs KMK mingguan, regulasi DJP, artikel edukasi, dan informasi karir.
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveCMS}
                className="text-xs font-semibold"
              >
                Simpan &amp; Terbitkan Langsung
              </Button>
            </div>

            {/* Sub-tabs for CMS Sections */}
            <div className="flex gap-2 border-b border-primary-light pb-2 text-xs overflow-x-auto">
              <button
                type="button"
                onClick={() => setCmsSection("profil")}
                className={`px-3 py-1.5 rounded font-semibold ${
                  cmsSection === "profil" ? "bg-primary text-white" : "text-text-secondary hover:text-primary"
                }`}
              >
                Profil Perusahaan
              </button>
              <button
                type="button"
                onClick={() => setCmsSection("kurs")}
                className={`px-3 py-1.5 rounded font-semibold ${
                  cmsSection === "kurs" ? "bg-primary text-white" : "text-text-secondary hover:text-primary"
                }`}
              >
                Kurs Pajak KMK
              </button>
              <button
                type="button"
                onClick={() => setCmsSection("regulasi")}
                className={`px-3 py-1.5 rounded font-semibold ${
                  cmsSection === "regulasi" ? "bg-primary text-white" : "text-text-secondary hover:text-primary"
                }`}
              >
                Regulasi &amp; DJP
              </button>
              <button
                type="button"
                onClick={() => setCmsSection("edukasi")}
                className={`px-3 py-1.5 rounded font-semibold ${
                  cmsSection === "edukasi" ? "bg-primary text-white" : "text-text-secondary hover:text-primary"
                }`}
              >
                Artikel Edukasi
              </button>
              <button
                type="button"
                onClick={() => setCmsSection("karir")}
                className={`px-3 py-1.5 rounded font-semibold ${
                  cmsSection === "karir" ? "bg-primary text-white" : "text-text-secondary hover:text-primary"
                }`}
              >
                Informasi Karir
              </button>
            </div>

            {/* Section 1: Profil */}
            {cmsSection === "profil" && (
              <div className="space-y-4 max-w-2xl text-xs">
                <div className="space-y-1.5">
                  <Label htmlFor="cms-headline">Headline Utama Landing Page</Label>
                  <Input
                    id="cms-headline"
                    value={cmsProfilData.headline}
                    onChange={(e) => setCmsProfilData({ ...cmsProfilData, headline: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cms-subheadline">Deskripsi Singkat Perusahaan</Label>
                  <Textarea
                    id="cms-subheadline"
                    rows={3}
                    value={cmsProfilData.subheadline}
                    onChange={(e) => setCmsProfilData({ ...cmsProfilData, subheadline: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cms-vision">Pernyataan Visi &amp; Kepatuhan Fiskal</Label>
                  <Textarea
                    id="cms-vision"
                    rows={3}
                    value={cmsProfilData.vision}
                    onChange={(e) => setCmsProfilData({ ...cmsProfilData, vision: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Section 2: Kurs Pajak */}
            {cmsSection === "kurs" && (
              <div className="space-y-4 max-w-xl text-xs">
                <span className="font-bold text-primary block">Tabel Kurs Pajak KMK Mingguan Terbitan DJP:</span>
                <div className="space-y-2">
                  {cmsKursData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-surface rounded-md border border-primary-light">
                      <span className="font-bold text-primary w-16">{item.currency}</span>
                      <Input
                        value={item.rate}
                        onChange={(e) => {
                          const updated = [...cmsKursData];
                          updated[idx].rate = e.target.value;
                          setCmsKursData(updated);
                        }}
                        className="flex-1"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 3: Regulasi */}
            {cmsSection === "regulasi" && (
              <div className="space-y-4 max-w-2xl text-xs">
                <div className="space-y-1.5">
                  <Label>Tautan Portal Resmi DJP Online</Label>
                  <Input defaultValue="https://djponline.pajak.go.id" />
                </div>
                <div className="space-y-1.5">
                  <Label>Rangkuman UU Harmonisasi Peraturan Perpajakan (HPP)</Label>
                  <Textarea
                    rows={3}
                    defaultValue="Penyesuaian tarif PPh Badan, batasan omzet PT KP, dan integrasi NIK menjadi NPWP 16 digit."
                  />
                </div>
              </div>
            )}

            {/* Section 4: Edukasi */}
            {cmsSection === "edukasi" && (
              <div className="space-y-4 max-w-2xl text-xs">
                <div className="p-4 rounded-md border border-primary-light bg-surface space-y-2">
                  <span className="font-bold text-primary">Artikel Aktif 1:</span>
                  <Input defaultValue="Navigasi Coretax: Strategi Transisi Pelaporan Pajak Digital bagi Badan Usaha" />
                  <Input defaultValue="Kategori: Transformasi Digital | Terbit: September 2026" />
                </div>
                <div className="p-4 rounded-md border border-primary-light bg-surface space-y-2">
                  <span className="font-bold text-primary">Artikel Aktif 2:</span>
                  <Input defaultValue="Manajemen Kepatuhan PPh Badan dan Mitigasi Risiko Penerbitan SP2DK" />
                  <Input defaultValue="Kategori: Kepatuhan Pajak | Terbit: Agustus 2026" />
                </div>
              </div>
            )}

            {/* Section 5: Karir */}
            {cmsSection === "karir" && (
              <div className="space-y-4 max-w-2xl text-xs">
                <div className="p-4 rounded-md border border-primary-light bg-surface space-y-2">
                  <span className="font-bold text-primary">Posisi 1: Senior Tax Consultant (Coretax Specialist)</span>
                  <Input defaultValue="Persyaratan: Min. 3 tahun di KAP/KKP, sertifikat Brevet AB/C, paham Coretax." />
                </div>
                <div className="p-4 rounded-md border border-primary-light bg-surface space-y-2">
                  <span className="font-bold text-primary">Posisi 2: Staff Akuntansi & Pembukuan</span>
                  <Input defaultValue="Persyaratan: S1 Akuntansi, mahir rekonsiliasi bank, jurnal penyesuaian, pelaporan SAK." />
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-primary-light">
              <Button variant="primary" size="sm" onClick={handleSaveCMS} className="text-xs">
                Simpan &amp; Terbitkan Perubahan
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Task Checklist Management Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-dark/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-2xl border border-primary-light max-w-lg w-full p-6 space-y-5 relative max-h-[90vh] overflow-y-auto">
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
                Klien: <strong>{selectedTicket.clientName}</strong> ({selectedTicket.clientId})
              </p>
            </div>

            {/* Checklist items with interactive toggle */}
            <div className="space-y-3 border-y border-primary-light py-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-primary uppercase tracking-wider">
                  Checklist Tugas Penugasan:
                </span>
                <span className="text-text-secondary">
                  {selectedTicket.checklists.filter((c) => c.done).length} dari {selectedTicket.checklists.length} selesai
                </span>
              </div>

              <div className="space-y-2">
                {selectedTicket.checklists.map((c) => (
                  <label
                    key={c.id}
                    className="flex items-start gap-2.5 p-2.5 rounded-md border border-primary-light bg-surface hover:bg-white cursor-pointer select-none transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={c.done}
                      onChange={() => handleToggleChecklist(selectedTicket.id, c.id)}
                      className="rounded border-primary-light text-primary focus:ring-primary w-4 h-4 mt-0.5 cursor-pointer"
                    />
                    <span className={c.done ? "line-through text-text-secondary" : "font-medium text-text"}>
                      {c.text}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Upload final report simulation */}
            <div className="space-y-2 text-xs">
              <Label>Unggah Berkas Laporan Kertas Kerja Klien</Label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Nama berkas laporan hasil (e.g. Laporan_Audit_Final.pdf)"
                  value={uploadFileName}
                  onChange={(e) => setUploadFileName(e.target.value)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (!uploadFileName) return alert("Pilih atau ketik nama berkas laporan.");
                    alert(`Berkas ${uploadFileName} berhasil diunggah dan ditautkan ke akun klien.`);
                    setUploadFileName("");
                  }}
                  className="whitespace-nowrap"
                >
                  Unggah
                </Button>
              </div>
            </div>

            {/* Status change actions */}
            <div className="flex items-center justify-between pt-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedTicket(null)}>
                Tutup Lembar Kerja
              </Button>

              {selectedTicket.status === "In Progress" ? (
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!selectedTicket.checklists.every((c) => c.done)}
                  onClick={() => handleMarkAsCompleted(selectedTicket.id)}
                  className={`text-xs font-semibold ${
                    !selectedTicket.checklists.every((c) => c.done)
                      ? "opacity-40 cursor-not-allowed"
                      : ""
                  }`}
                >
                  Tandai Selesai (Completed)
                </Button>
              ) : (
                <div className="flex items-center gap-1.5 text-success text-xs font-bold">
                  <CheckCircleIcon />
                  <span>Telah Berstatus Completed</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
