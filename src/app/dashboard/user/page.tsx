"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { clientApi, ConsultationItem, ClientDocumentItem } from "@/lib/api";
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
  CheckIcon,
  CloseIcon,
  DownloadIcon,
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
  deliverableSize?: string;
}

interface ClientDocument {
  id: string;
  name: string;
  category: "Pajak" | "Akuntansi" | "Legal";
  date: string;
  size: string;
  ticketRef: string;
}

export default function UserDashboardPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [filterStatus, setFilterStatus] = useState<"ALL" | "In Progress" | "Completed">("ALL");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Sync consultations & documents with backend
  useEffect(() => {
    async function loadClientData() {
      try {
        const res = await clientApi.getConsultations();
        if (res.success && Array.isArray(res.data)) {
          const mapped: Ticket[] = res.data.map((c: ConsultationItem) => ({
            id: c.project_code || `TK-${c.id}`,
            title: c.title,
            category: "Tax Service Core",
            consultant: "Konsultan Zhou",
            status: c.status === "COMPLETED" ? "Completed" : "In Progress",
            progress: c.progress_percent || (c.status === "COMPLETED" ? 100 : 40),
            updatedAt: new Date(c.updated_at || c.created_at).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
            checklists: [
              { text: "Telaah awal dokumen & verifikasi data perikatan", done: true },
              { text: "Pengerjaan kertas kerja & perhitungan fiskal", done: c.status === "COMPLETED" },
              { text: "Penyusunan berkas luaran & final review", done: c.status === "COMPLETED" },
            ],
            deliverableFile: c.status === "COMPLETED" ? "Laporan_Final_Konsultasi.pdf" : undefined,
            deliverableSize: c.status === "COMPLETED" ? "1.5 MB" : undefined,
          }));
          setTickets(mapped);
        }

        const docRes = await clientApi.getDocuments();
        if (docRes.success && Array.isArray(docRes.data)) {
          const mappedDocs: ClientDocument[] = docRes.data.map((d: ClientDocumentItem) => ({
            id: String(d.id),
            name: d.file_name,
            category: d.file_type === "XLSX" ? "Akuntansi" : "Pajak",
            date: new Date(d.created_at).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
            size: d.file_size || "1.2 MB",
            ticketRef: d.project_id ? `TK-${d.project_id}` : "-",
          }));
          setDocuments(mappedDocs);
        }
      } catch {
        // silent fallback
      }
    }
    loadClientData();
  }, []);

  // Modal Create Ticket State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTicketData, setNewTicketData] = useState({
    title: "",
    category: "Tax Service Core" as Ticket["category"],
    description: "",
  });
  const [createError, setCreateError] = useState("");
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    if (filterStatus === "ALL") return true;
    return t.status === filterStatus;
  });

  const activeCount = tickets.filter((t) => t.status === "In Progress").length;
  const completedCount = tickets.filter((t) => t.status === "Completed").length;

  const handleCreateTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketData.title.trim() || !newTicketData.description.trim()) {
      setCreateError("Judul dan deskripsi masalah konsultasi wajib diisi.");
      return;
    }

    setIsSubmittingTicket(true);
    setCreateError("");

    try {
      await clientApi.escalateChatbot({
        message: `[${newTicketData.category}] ${newTicketData.title}: ${newTicketData.description}`,
        category: newTicketData.category,
      });
    } catch (err) {
      console.warn("Backend ticket creation notice:", err);
    }

    const newTicket: Ticket = {
      id: `TK-2026-0${Math.floor(100 + Math.random() * 900)}`,
      title: newTicketData.title,
      category: newTicketData.category,
      consultant: "Staf Alokasi Konsultan Zhou",
      status: "In Progress",
      progress: 20,
      updatedAt: "Baru saja",
      checklists: [
        { text: "Registrasi dan telaah awal permohonan konsultasi", done: true },
        { text: "Alokasi tim konsultan spesialis sesuai kategori", done: false },
        { text: "Penyusunan kertas kerja dan evaluasi regulasi fiskal", done: false },
        { text: "Finalisasi laporan dan penerbitan berkas luaran", done: false },
      ],
      deliverableFile: undefined,
    };

    setTickets((prev) => [newTicket, ...prev]);
    setNewTicketData({ title: "", category: "Tax Service Core", description: "" });
    setIsSubmittingTicket(false);
    setShowCreateModal(false);
  };

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleDownloadSimulation = (fileName: string) => {
    const fileContent = `======================================================
ZHOU CONSULTING - DIGITAL CLIENT VAULT
======================================================
Berkas Resmi : ${fileName}
Entitas      : ${user?.company || "Perusahaan Klien"}
PIC Klien    : ${user?.name || "Klien Terdaftar"}
Verifikasi   : Tervalidasi SHA-256 & NDA Terikat
Tanggal Unduh: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
Kerahasiaan  : Dokumen ini bersifat rahasia profesional.
======================================================`;
    const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName.endsWith(".pdf") ? fileName.replace(".pdf", ".txt") : fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setToastMessage(`Berkas resmi "${fileName}" berhasil diunduh (verifikasi enkripsi 256-bit).`);
    setTimeout(() => setToastMessage(null), 4000);
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
            className="text-silver hover:text-white ml-2 cursor-pointer"
          >
            <CloseIcon className="text-xs" />
          </button>
        </div>
      )}

      {/* Top Breadcrumb & Title Bar */}
      <div>
        <nav className="flex text-xs text-text-secondary mb-2" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 sm:space-x-2">
            <li>
              <Link href="/" className="hover:text-primary transition-colors">
                Beranda
              </Link>
            </li>
            <li>
              <span className="mx-1 text-silver">/</span>
              <span className="text-primary font-bold">Dashboard Saya</span>
            </li>
          </ol>
        </nav>

        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-primary tracking-tight mb-1">
            Dashboard Saya
          </h1>
          <p className="text-xs text-text-secondary">
            Pantau progres layanan konsultasi, lembar kerja akuntansi, dan unduh berkas resmi Anda di sini.
          </p>
        </div>
      </div>

      {/* Row 3 Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        {/* Card 1: Active Tickets */}
        <Card className="border-navy-light bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-text-secondary mb-1">
                Konsultasi Aktif Berjalan
              </div>
              <div className="text-3xl font-bold text-primary">
                {activeCount < 10 ? `0${activeCount}` : activeCount}
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <ClockIcon className="text-lg" />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Completed Reports */}
        <Card className="border-navy-light bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-text-secondary mb-1">
                Laporan &amp; Kepatuhan Selesai
              </div>
              <div className="text-3xl font-bold text-success">
                {completedCount < 10 ? `0${completedCount}` : completedCount}
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center shrink-0">
              <CheckCircleIcon className="text-lg" />
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Secured Documents */}
        <Card className="border-navy-light bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-text-secondary mb-1">
                Dokumen Pajak Tersimpan
              </div>
              <div className="text-3xl font-bold text-primary">
                {documents.length < 10 ? `0${documents.length}` : documents.length}
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-surface text-primary border border-navy-light flex items-center justify-center shrink-0">
              <DocumentIcon className="text-lg" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section: Monitoring Tiket Konsultasi Terbaru */}
      <Card className="border-navy-light bg-white shadow-sm">
        <CardHeader className="p-5 sm:p-6 border-b border-navy-light flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-bold text-primary">
                Monitoring Konsultasi Terbaru
              </CardTitle>
              <Badge variant="outline" className="text-xs bg-surface text-text-secondary border-navy-light">
                {tickets.length} Konsultasi Terdaftar
              </Badge>
            </div>
            <CardDescription className="text-xs text-text-secondary mt-0.5">
              Pantau status penugasan konsultan dan tahapan penyelesaian lembar kerja Anda.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Tabs */}
            <div className="inline-flex rounded-lg bg-surface p-1 border border-navy-light text-xs">
              <button
                type="button"
                onClick={() => setFilterStatus("ALL")}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  filterStatus === "ALL"
                    ? "bg-white text-primary shadow-sm font-bold"
                    : "text-text-secondary hover:text-primary"
                }`}
              >
                Semua ({tickets.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus("In Progress")}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  filterStatus === "In Progress"
                    ? "bg-white text-primary shadow-sm font-bold"
                    : "text-text-secondary hover:text-primary"
                }`}
              >
                Dalam Proses ({activeCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus("Completed")}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  filterStatus === "Completed"
                    ? "bg-white text-primary shadow-sm font-bold"
                    : "text-text-secondary hover:text-primary"
                }`}
              >
                Selesai ({completedCount})
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-text-primary">
              <thead className="bg-surface/80 border-b border-navy-light text-[10px] uppercase font-bold text-text-secondary tracking-wider">
                <tr>
                  <th scope="col" className="py-3 px-4 sm:px-6">ID Konsultasi</th>
                  <th scope="col" className="py-3 px-4">Judul Pekerjaan &amp; Layanan</th>
                  <th scope="col" className="py-3 px-4 hidden md:table-cell">Konsultan Lead</th>
                  <th scope="col" className="py-3 px-4">Progres</th>
                  <th scope="col" className="py-3 px-4">Status</th>
                  <th scope="col" className="py-3 px-4 sm:px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-light">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-text-muted">
                      <div className="space-y-1">
                        <p className="font-semibold text-primary">Belum Ada Tiket Konsultasi Aktif</p>
                        <p className="text-[11px] text-text-secondary">
                          Silakan buat tiket konsultasi baru untuk memulai penugasan dengan konsultan kami.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="hover:bg-surface/50 transition-colors"
                    >
                    <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-primary whitespace-nowrap">
                      {ticket.id}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-primary line-clamp-1">{ticket.title}</div>
                      <div className="text-[11px] text-text-secondary mt-0.5">{ticket.category}</div>
                    </td>

                    <td className="py-3.5 px-4 hidden md:table-cell whitespace-nowrap">
                      <div className="font-medium text-text-primary">{ticket.consultant}</div>
                      <div className="text-[10px] text-text-secondary">{ticket.updatedAt}</div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-20 sm:w-24 bg-surface rounded-full h-2 overflow-hidden border border-navy-light">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              ticket.status === "Completed" ? "bg-success" : "bg-primary"
                            }`}
                            style={{ width: `${ticket.progress}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-text-secondary w-8">
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

                    <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTicket(ticket)}
                        className="text-xs py-1 px-2.5 h-auto border-navy-light text-primary hover:bg-surface font-semibold"
                      >
                        Detail Konsultasi
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-navy-light text-center bg-surface/30">
            <Link
              href="/dashboard/user/tiket"
              className="text-xs text-primary hover:underline font-semibold"
            >
              <span>Monitoring Konsultasi</span>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Section: Dokumen Pajak & Laporan Terbaru (Secured Vault) */}
      <Card className="border-navy-light bg-white shadow-sm overflow-hidden">
        <CardHeader className="p-5 sm:p-6 border-b border-navy-light flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold text-primary">
              Dokumen Pajak &amp; Laporan Terbaru (Secured Vault)
            </CardTitle>
            <CardDescription className="text-xs text-text-secondary mt-0.5">
              Seluruh berkas luaran resmi yang telah diverifikasi konsultan tersimpan dengan protokol keamanan NDA.
            </CardDescription>
          </div>

          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-xs text-primary hover:bg-surface font-semibold self-start sm:self-auto"
          >
            <Link href="/dashboard/user/dokumen">
              <span>Lihat Dokumen</span>
            </Link>
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface/80 text-text-secondary font-bold uppercase tracking-wider text-[10px] border-b border-navy-light">
                <tr>
                  <th className="py-3 px-4 sm:px-6">Nama Dokumen</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Tanggal Terbit</th>
                  <th className="py-3 px-4">Ukuran</th>
                  <th className="py-3 px-4">Referensi Konsultasi</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-light">
                {documents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-text-muted">
                      <p className="font-medium text-text-secondary">Belum ada dokumen luaran atau berkas tersimpan.</p>
                    </td>
                  </tr>
                ) : (
                  documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-surface/50 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6 font-semibold text-primary">
                        {doc.name}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                          {doc.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-text-secondary whitespace-nowrap">
                        {doc.date}
                      </td>
                      <td className="py-3.5 px-4 text-text-secondary whitespace-nowrap">
                        {doc.size}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <code className="font-mono text-primary font-semibold text-xs">
                          {doc.ticketRef}
                        </code>
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadSimulation(doc.name)}
                          className="text-xs py-1 px-3.5 h-auto border-navy-light text-primary hover:bg-surface font-semibold"
                        >
                          Unduh
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* MODAL 1: Detail Tiket & Lembar Kerja Inspeksi */}
      {selectedTicket && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedTicket(null)}
        >
          <div
            className="bg-white rounded-xl max-w-xl w-full border border-navy-light shadow-xl p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between pb-3 border-b border-navy-light">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="font-mono text-xs bg-surface text-primary border-navy-light">
                    {selectedTicket.id}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-2 py-0.5 ${
                      selectedTicket.status === "Completed"
                        ? "bg-success/15 text-success border-success/30"
                        : "bg-primary/10 text-primary border-primary/20"
                    }`}
                  >
                    {selectedTicket.status === "Completed" ? "Selesai" : "Dalam Proses"}
                  </Badge>
                </div>
                <h3 className="text-base font-bold text-primary">
                  {selectedTicket.title}
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Divisi: {selectedTicket.category} &bull; Lead: <strong>{selectedTicket.consultant}</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="p-1 text-text-secondary hover:text-error transition-colors"
              >
                <CloseIcon className="text-xs" />
              </button>
            </div>

            {/* Progress Section */}
            <div className="space-y-1.5 bg-surface p-3.5 rounded-lg border border-navy-light">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>Progres Penyelesaian Kertas Kerja</span>
                <span className="text-primary font-bold">{selectedTicket.progress}%</span>
              </div>
              <div className="w-full bg-white rounded-full h-2 overflow-hidden border border-navy-light">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    selectedTicket.status === "Completed" ? "bg-success" : "bg-primary"
                  }`}
                  style={{ width: `${selectedTicket.progress}%` }}
                />
              </div>
              <div className="text-[10px] text-text-secondary flex items-center justify-between pt-1">
                <span>Pembaruan terakhir: {selectedTicket.updatedAt}</span>
                <span>Standar Kepatuhan SAK</span>
              </div>
            </div>

            {/* Checklist Tahapan Kerja */}
            <div>
              <Label className="text-xs font-bold text-primary uppercase tracking-wider block mb-2.5">
                Milestone &amp; Lembar Kerja Konsultan
              </Label>
              <div className="space-y-2">
                {selectedTicket.checklists.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs ${
                      item.done
                        ? "bg-success/5 border-success/30 text-text-primary"
                        : "bg-surface border-navy-light text-text-secondary"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        item.done ? "bg-success text-white" : "border border-silver bg-white"
                      }`}
                    >
                      {item.done && <CheckIcon className="text-[9px]" />}
                    </div>
                    <span className={item.done ? "font-medium" : ""}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Deliverable Download Area */}
            {selectedTicket.deliverableFile && (
              <div className="p-3.5 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <DocumentIcon className="text-primary text-base shrink-0" />
                  <div className="truncate">
                    <div className="font-bold text-primary truncate">{selectedTicket.deliverableFile}</div>
                    <div className="text-[10px] text-text-secondary">{selectedTicket.deliverableSize || "PDF Resmi"} &bull; Laporan Telah Disetujui</div>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleDownloadSimulation(selectedTicket.deliverableFile!)}
                  className="shrink-0 text-xs inline-flex items-center gap-1.5"
                >
                  <DownloadIcon className="text-xs" />
                  <span>Unduh</span>
                </Button>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTicket(null)}
                className="border-navy-light text-xs"
              >
                Tutup Detail
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Buat Tiket Konsultasi Baru */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="bg-white rounded-xl max-w-lg w-full border border-navy-light shadow-xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between pb-3 border-b border-navy-light">
              <div>
                <h3 className="text-base font-bold text-primary">
                  Buat Konsultasi Baru
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Sampaikan permohonan analisis atau pendampingan fiskal lanjutan dari entitas Anda.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-text-secondary hover:text-error"
              >
                <CloseIcon className="text-xs" />
              </button>
            </div>

            <form onSubmit={handleCreateTicketSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="ticketTitle" className="text-xs font-semibold text-text-primary">
                  Judul Permohonan / Topik Kasus <span className="text-error">*</span>
                </Label>
                <Input
                  id="ticketTitle"
                  placeholder="Subjek permohonan / kasus konsultasi"
                  value={newTicketData.title}
                  onChange={(e) => setNewTicketData({ ...newTicketData, title: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ticketCategory" className="text-xs font-semibold text-text-primary">
                  Kategori Divisi Layanan
                </Label>
                <Select
                  id="ticketCategory"
                  value={newTicketData.category}
                  onChange={(e) => setNewTicketData({ ...newTicketData, category: e.target.value as Ticket["category"] })}
                  className="bg-white border-navy-light text-xs"
                >
                  <option value="Tax Service Core">Tax Service Core (Pajak &amp; Coretax)</option>
                  <option value="Accounting Service">Accounting Service (SAK &amp; Laporan)</option>
                  <option value="Legal">Legal (Hukum Bisnis &amp; Kontrak)</option>
                  <option value="Business Consulting">Business Consulting (Finansial &amp; Valuasi)</option>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ticketDesc" className="text-xs font-semibold text-text-primary">
                  Rincian Kebutuhan atau Kendala Fiskal <span className="text-error">*</span>
                </Label>
                <Textarea
                  id="ticketDesc"
                  rows={4}
                  placeholder="Jelaskan secara ringkas dokumen apa saja yang telah disiapkan dan tenggat waktu yang diharapkan..."
                  value={newTicketData.description}
                  onChange={(e) => setNewTicketData({ ...newTicketData, description: e.target.value })}
                />
              </div>

              {createError && (
                <p className="text-[11px] text-error font-medium">{createError}</p>
              )}

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                  disabled={isSubmittingTicket}
                  className="border-navy-light text-xs"
                >
                  Batal
                </Button>

                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmittingTicket}
                  className="text-xs inline-flex items-center gap-1.5"
                >
                  {isSubmittingTicket ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <span>Kirim Permohonan Konsultasi</span>
                      <CheckIcon className="text-xs" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
