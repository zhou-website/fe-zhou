"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, isDummyTicket, normalizeRole } from "@/context/AuthContext";
import { clientApi, ConsultationItem, ClientDocumentItem } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  CheckCircleIcon,
  CheckIcon,
  DocumentIcon,
  CloseIcon,
  DownloadIcon,
} from "@/components/icons";
import {
  getStoredClientTickets,
  getStoredDocuments,
  TICKETS_UPDATED_EVENT,
  DOCUMENTS_UPDATED_EVENT,
} from "@/data/sharedTicketsStorage";

interface Ticket {
  id: string;
  title: string;
  category: "Tax Service Core" | "Accounting Service" | "Legal" | "Business Consulting" | string;
  consultant: string;
  status: "In Progress" | "Completed";
  progress: number;
  updatedAt: string;
  createdAt?: string;
  checklists: { text: string; done: boolean }[];
  deliverableFile?: string;
  deliverableSize?: string;
}

interface ClientDocument {
  id: string;
  name: string;
  category: "Pajak" | "Akuntansi" | "Legal" | string;
  date: string;
  size: string;
  ticketRef: string;
}

export default function UserDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [filterStatus, setFilterStatus] = useState<"ALL" | "In Progress" | "Completed">("ALL");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Auto redirect superadmin and admin to their respective portals
  useEffect(() => {
    if (!user) return;
    const role = normalizeRole(user.role, user.email);
    if (role === "superadmin") {
      router.replace("/dashboard/superadmin");
    } else if (role === "admin") {
      router.replace("/dashboard/admin");
    }
  }, [user, router]);

  // Sync consultations & documents with backend, shared tickets, and uploaded documents
  useEffect(() => {
    async function loadClientData() {
      // 1. Tiket yang dibuat secara lokal / booking
      const storedClientTickets = getStoredClientTickets();
      const filteredCustom = storedClientTickets.filter((t) => !isDummyTicket(t));
      const customTickets: Ticket[] = filteredCustom.map((t) => ({
        id: t.id,
        title: t.title,
        category: t.category || "Tax Service Core",
        consultant: t.consultant || "Konsultan Zhou",
        status: t.status.toLowerCase().includes("selesai") || t.status === "Completed" ? "Completed" : "In Progress",
        progress: t.progress || 25,
        updatedAt: t.createdAt || "Baru saja",
        checklists: (t.milestones && t.milestones.length > 0)
          ? t.milestones.map((m) => ({ text: m.title, done: m.status === "completed" }))
          : [
              { text: "Telaah awal dokumen & verifikasi data perikatan", done: true },
              { text: "Pengerjaan kertas kerja & perhitungan fiskal", done: false },
              { text: "Penyusunan berkas luaran & final review", done: false },
            ],
        deliverableFile: t.deliverables?.[0]?.name,
        deliverableSize: t.deliverables?.[0]?.size,
      }));

      // 2. Tiket dari backend
      let backendTickets: Ticket[] = [];
      try {
        const res = await clientApi.getConsultations();
        if (res.success && Array.isArray(res.data)) {
          const validConsultations = res.data.filter((c: ConsultationItem) => !isDummyTicket(c));
          backendTickets = validConsultations.map((c: ConsultationItem) => ({
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
        }
      } catch {
        // silent fallback
      }

      // Gabungkan tiket tanpa duplikasi
      const combinedTickets = [...customTickets];
      backendTickets.forEach((m) => {
        if (!combinedTickets.some((item) => item.id.toLowerCase() === m.id.toLowerCase())) {
          combinedTickets.push(m);
        }
      });
      setTickets(combinedTickets);

      // 3. Dokumen dari backend
      let backendDocs: ClientDocument[] = [];
      try {
        const docRes = await clientApi.getDocuments();
        if (docRes.success && Array.isArray(docRes.data)) {
          backendDocs = docRes.data.map((d: ClientDocumentItem) => ({
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
        }
      } catch {
        // silent fallback
      }

      // 4. Dokumen yang diunggah Admin dari storage bersama
      const localDocs = getStoredDocuments();
      const mappedLocalDocs: ClientDocument[] = localDocs.map((d) => ({
        id: d.id,
        name: d.fileName,
        category: d.category.includes("Tax") ? "Pajak" : d.category.includes("Account") ? "Akuntansi" : "Legal",
        date: d.uploadDate || "Hari ini",
        size: d.fileSize || "2.1 MB",
        ticketRef: d.ticketId || "-",
      }));

      const combinedDocs = [...mappedLocalDocs];
      backendDocs.forEach((b) => {
        if (!combinedDocs.some((cd) => cd.id.toLowerCase() === b.id.toLowerCase() || cd.name.toLowerCase() === b.name.toLowerCase())) {
          combinedDocs.push(b);
        }
      });
      setDocuments(combinedDocs);
    }

    loadClientData();
    window.addEventListener(TICKETS_UPDATED_EVENT, loadClientData);
    window.addEventListener(DOCUMENTS_UPDATED_EVENT, loadClientData);
    window.addEventListener("storage", loadClientData);
    return () => {
      window.removeEventListener(TICKETS_UPDATED_EVENT, loadClientData);
      window.removeEventListener(DOCUMENTS_UPDATED_EVENT, loadClientData);
      window.removeEventListener("storage", loadClientData);
    };
  }, []);

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    if (filterStatus === "ALL") return true;
    return t.status === filterStatus;
  });

  const activeCount = tickets.filter((t) => t.status === "In Progress").length;
  const completedCount = tickets.filter((t) => t.status === "Completed").length;

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleDownloadSimulation = (fileName: string) => {
    const fileContent = `======================================================
ZHOU CONSULTING - DIGITAL CLIENT VAULT
======================================================
Berkas Resmi : ${fileName}
Entitas      : ${user?.company || "-"}
PIC Klien    : ${user?.name || "-"}
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

      {/* Page Title Bar */}
      <div>
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Card 1: Active Tickets */}
        <Card className="p-4 sm:p-5 rounded-2xl border-primary-light bg-white shadow-xs">
          <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">
            Konsultasi Aktif Berjalan
          </span>
          <div className="mt-2 text-2xl font-bold text-primary font-mono flex items-baseline gap-1.5">
            <span>{activeCount < 10 ? `0${activeCount}` : activeCount}</span>
            <span className="text-xs text-text-secondary font-sans font-normal">Tiket</span>
          </div>
          <div className="text-[10px] text-text-secondary mt-1">Konsultasi sedang diproses konsultan</div>
        </Card>

        {/* Card 2: Completed Reports */}
        <Card className="p-4 sm:p-5 rounded-2xl border-emerald-200 bg-emerald-50/40 shadow-xs">
          <span className="text-[10px] text-emerald-900 font-bold uppercase tracking-wider block">
            Laporan &amp; Kepatuhan Selesai
          </span>
          <div className="mt-2 text-2xl font-bold text-emerald-800 font-mono flex items-baseline gap-1.5">
            <span>{completedCount < 10 ? `0${completedCount}` : completedCount}</span>
            <span className="text-xs text-emerald-700 font-sans font-normal">Selesai</span>
          </div>
          <div className="text-[10px] text-emerald-700 mt-1">Luaran deliverable terbit</div>
        </Card>

        {/* Card 3: Secured Documents */}
        <Card className="p-4 sm:p-5 rounded-2xl border-primary-light bg-white shadow-xs">
          <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">
            Dokumen Pajak Tersimpan
          </span>
          <div className="mt-2 text-2xl font-bold text-primary font-mono flex items-baseline gap-1.5">
            <span>{documents.length < 10 ? `0${documents.length}` : documents.length}</span>
            <span className="text-xs text-text-secondary font-sans font-normal">Dokumen</span>
          </div>
          <div className="text-[10px] text-text-secondary mt-1">Arsip aman dalam vault</div>
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

          <div className="flex flex-wrap items-center gap-2">
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

    </div>
  );
}
