"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, isDummyTicket, isDummyDocument, normalizeRole } from "@/context/AuthContext";
import { clientApi, ConsultationItem, ClientDocumentItem } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  CheckCircleIcon,
  CloseIcon,
  UserIcon,
} from "@/components/icons";
import {
  getDisplayPicName,
  resolveConsultationCategory,
  getStoredClientTickets,
  getStoredDocuments,
  getCachedFileBlobAsync,
  isTicketDeleted,
  formatConsultationDate,
} from "@/data/sharedTicketsStorage";
import { downloadRemoteFile, downloadBlob } from "@/lib/downloadHelper";


interface Ticket {
  id: string;
  title: string;
  category: "Tax Service Core" | "Accounting Service" | "Legal" | "Business Consulting" | string;
  consultant: string;
  status: string;
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

  // Auto redirect superadmin and admin to their respective portals
  useEffect(() => {
    if (!user) return;
    const role = normalizeRole(user.role, user.email);
    if (role === "superadmin") {
      router.replace("/dashboard/superadmin/perikatan");
    } else if (role === "admin") {
      router.replace("/dashboard/admin");
    }
  }, [user, router]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load client consultations and documents directly from backend API
  const loadClientData = React.useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const [consultRes, docRes] = await Promise.allSettled([
        clientApi.getConsultations(),
        clientApi.getDocuments(),
      ]);

      // 1. Konsultasi dari backend
      if (consultRes.status === "fulfilled" && consultRes.value.success && Array.isArray(consultRes.value.data)) {
        const userEmail = (user?.email || "").toLowerCase().trim();
        const userName = (user?.name || "").toLowerCase().trim();
        const userId = user?.id;

        const validConsultations = consultRes.value.data
          .filter((c: ConsultationItem) => !isDummyTicket(c))
          .filter((c: ConsultationItem) => {
            const cEmail = (c.client?.email || "").toLowerCase().trim();
            const cName = (c.client?.name || "").toLowerCase().trim();
            const cId = c.client_id || c.client?.id;

            if (userEmail && cEmail && cEmail === userEmail) return true;
            if (userId && cId && String(cId) === String(userId)) return true;
            if (userName && cName && (cName === userName || cName.includes(userName))) return true;

            // Jika backend sudah memfilter per pengguna terautentikasi (Bearer token)
            return true;
          });

        const mappedTickets: Ticket[] = validConsultations.map((c: ConsultationItem) => ({
          id: c.project_code || `TK-${c.id}`,
          title: c.title,
          category: resolveConsultationCategory(c),
          consultant: c.assigned_admin?.name || "Menunggu PIC",
          status: c.status === "COMPLETED" ? "Selesai" : "Dalam Proses",
          progress: c.progress_percent || (c.status === "COMPLETED" ? 100 : 40),
          updatedAt: new Date(c.updated_at || c.created_at).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          checklists: (c.tasks && c.tasks.length > 0)
            ? c.tasks.map((t) => ({ text: t.task_name, done: t.is_completed }))
            : [
                { text: "Telaah awal dokumen & verifikasi data perikatan", done: true },
                { text: "Pengerjaan kertas kerja & perhitungan fiskal", done: c.status === "COMPLETED" },
                { text: "Penyusunan berkas luaran & final review", done: c.status === "COMPLETED" },
              ],
          deliverableFile: c.status === "COMPLETED" ? "Laporan_Final_Konsultasi.pdf" : undefined,
          deliverableSize: c.status === "COMPLETED" ? "1.5 MB" : undefined,
        }));

        const localTickets = typeof window !== "undefined" ? getStoredClientTickets() : [];
        const mergedTickets = [...mappedTickets];
        localTickets.forEach((lt) => {
          const existingIdx = mergedTickets.findIndex(
            (mt) =>
              mt.id.toLowerCase() === lt.id.toLowerCase() ||
              (lt.numericId && mt.id.includes(String(lt.numericId))) ||
              (lt.title && mt.title && lt.title.toLowerCase().trim() === mt.title.toLowerCase().trim())
          );
          const mappedLt = {
            id: lt.id,
            title: lt.title,
            category: resolveConsultationCategory(lt),
            consultant: lt.assignedAdminName || lt.consultant || "Menunggu PIC",
            status: lt.status === "Selesai" ? "Selesai" : "Dalam Proses",
            progress: lt.progress !== undefined ? lt.progress : 35,
            updatedAt: lt.createdAt || "Hari ini",
            createdAt: lt.createdAt,
            checklists: (lt.milestones && lt.milestones.length > 0)
              ? lt.milestones.map((m) => ({ text: m.title, done: m.status === "completed" }))
              : [
                  { text: "Telaah awal dokumen & verifikasi data perikatan", done: true },
                  { text: "Pengerjaan kertas kerja & perhitungan fiskal", done: lt.status === "Selesai" },
                  { text: "Penyusunan berkas luaran & final review", done: lt.status === "Selesai" },
                ],
            deliverableFile: lt.status === "Selesai" ? "Laporan_Final_Konsultasi.pdf" : undefined,
            deliverableSize: lt.status === "Selesai" ? "1.5 MB" : undefined,
          };
          if (existingIdx !== -1) {
            mergedTickets[existingIdx] = {
              ...mergedTickets[existingIdx],
              ...mappedLt,
              id: mergedTickets[existingIdx].id || mappedLt.id,
              consultant: (mappedLt.consultant && !mappedLt.consultant.includes("Menunggu"))
                ? mappedLt.consultant
                : (mergedTickets[existingIdx].consultant || mappedLt.consultant),
            };
          } else {
            mergedTickets.unshift(mappedLt);
          }
        });

        setTickets(mergedTickets);
      } else if (consultRes.status === "rejected") {
        setLoadError("Gagal memuat konsultasi dari server.");
        const localTickets = typeof window !== "undefined" ? getStoredClientTickets() : [];
        if (localTickets.length > 0) {
          setTickets(
            localTickets.map((lt) => ({
              id: lt.id,
              title: lt.title,
              category: resolveConsultationCategory(lt),
              consultant: lt.assignedAdminName || lt.consultant || "Menunggu PIC",
              status: lt.status === "Selesai" ? "Selesai" : "Dalam Proses",
              progress: lt.progress || 35,
              updatedAt: lt.createdAt || "Hari ini",
              createdAt: lt.createdAt,
              checklists: [
                { text: "Telaah awal dokumen & verifikasi data perikatan", done: true },
                { text: "Pengerjaan kertas kerja & perhitungan fiskal", done: lt.status === "Selesai" },
                { text: "Penyusunan berkas luaran & final review", done: lt.status === "Selesai" },
              ],
              deliverableFile: lt.status === "Selesai" ? "Laporan_Final_Konsultasi.pdf" : undefined,
              deliverableSize: lt.status === "Selesai" ? "1.5 MB" : undefined,
            }))
          );
        }
      }

      // 2. Kumpulkan seluruh dokumen: backend, shared documents, serta dokumen tiket aktif (pendukung & deliverable)
      let backendDocs: ClientDocument[] = [];
      if (docRes.status === "fulfilled" && docRes.value.success && Array.isArray(docRes.value.data)) {
        const validBackendDocs = docRes.value.data.filter((d: ClientDocumentItem) => !isDummyDocument(d));
        backendDocs = validBackendDocs.map((d: ClientDocumentItem) => ({
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

      const localShared = typeof window !== "undefined" ? getStoredDocuments() : [];
      const sharedDocs: ClientDocument[] = localShared
        .filter((d) => !d.ticketId || !isTicketDeleted(d.ticketId))
        .map((d) => ({
          id: d.id,
          name: d.fileName,
          category: d.category.toLowerCase().includes("akuntansi") ? "Akuntansi" : "Pajak",
          date: d.uploadDate,
          size: d.fileSize || "1.5 MB",
          ticketRef: d.ticketId || "-",
        }));

      const allClientTickets = typeof window !== "undefined" ? getStoredClientTickets() : [];
      const ticketDocs: ClientDocument[] = [];
      allClientTickets
        .filter((t) => !isTicketDeleted(t.id) && (!t.numericId || !isTicketDeleted(t.numericId)))
        .forEach((t) => {
          const cat = t.category?.toLowerCase() || "";
          const catLabel = cat.includes("akuntansi") ? "Akuntansi" : "Pajak";

          // Dokumen pendukung klien
          (t.clientDocuments || []).forEach((cd, i) => {
            ticketDocs.push({
              id: cd.id || `cd-${t.id}-${i}`,
              name: cd.name,
              category: catLabel,
              date: cd.date || cd.uploadedAt || "Hari ini",
              size: cd.size || "1.0 MB",
              ticketRef: t.id,
            });
          });

          // Deliverables
          (t.deliverables || []).forEach((deliv, i) => {
            ticketDocs.push({
              id: deliv.id || `deliv-${t.id}-${i}`,
              name: deliv.name,
              category: catLabel,
              date: deliv.date || "Hari ini",
              size: deliv.size || "1.5 MB",
              ticketRef: t.id,
            });
          });
        });

      const mergedDocs: ClientDocument[] = [];
      const seenNames = new Set<string>();
      [...ticketDocs, ...sharedDocs, ...backendDocs].forEach((doc) => {
        const key = doc.name.toLowerCase().trim();
        if (!seenNames.has(key)) {
          seenNames.add(key);
          mergedDocs.push(doc);
        }
      });
      setDocuments(mergedDocs);
    } catch {
      setLoadError("Terjadi kendala saat menghubungkan ke server backend.");
      const localTickets = typeof window !== "undefined" ? getStoredClientTickets() : [];
      if (localTickets.length > 0) {
        setTickets(
          localTickets.map((lt) => ({
            id: lt.id,
            title: lt.title,
            category: lt.category,
            consultant: lt.assignedAdminName || lt.consultant || "Menunggu PIC",
            status: lt.status === "Selesai" ? "Selesai" : "Dalam Proses",
            progress: lt.progress || 35,
            updatedAt: lt.createdAt || "Hari ini",
            createdAt: lt.createdAt,
            checklists: [
              { text: "Telaah awal dokumen & verifikasi data perikatan", done: true },
              { text: "Pengerjaan kertas kerja & perhitungan fiskal", done: lt.status === "Selesai" },
              { text: "Penyusunan berkas luaran & final review", done: lt.status === "Selesai" },
            ],
            deliverableFile: lt.status === "Selesai" ? "Laporan_Final_Konsultasi.pdf" : undefined,
            deliverableSize: lt.status === "Selesai" ? "1.5 MB" : undefined,
          }))
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [user?.email, user?.name, user?.id]);

  useEffect(() => {
    loadClientData();
  }, [loadClientData]);

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    if (filterStatus === "ALL") return true;
    if (filterStatus === "In Progress") {
      return t.status !== "Selesai" && t.status !== "Completed";
    }
    if (filterStatus === "Completed") {
      return t.status === "Selesai" || t.status === "Completed";
    }
    return true;
  });

  const activeCount = tickets.filter((t) => t.status !== "Selesai" && t.status !== "Completed").length;
  const completedCount = tickets.filter((t) => t.status === "Selesai" || t.status === "Completed").length;

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);

  const handleDownloadDocument = async (doc: ClientDocument) => {
    setDownloadingDocId(doc.id);
    setToastMessage(`Menyiapkan unduhan berkas resmi "${doc.name}"...`);

    try {
      // 1. Cek berkas fisik asli di IndexedDB & memory cache
      const cachedBlob =
        (await getCachedFileBlobAsync(doc.name)) ||
        (doc.ticketRef ? await getCachedFileBlobAsync(`${doc.ticketRef}:${doc.name}`) : undefined) ||
        (doc.id ? await getCachedFileBlobAsync(doc.id) : undefined);

      if (cachedBlob) {
        downloadBlob(cachedBlob, doc.name);
        setToastMessage(`Berkas asli "${doc.name}" berhasil diunduh.`);
        return;
      }

      // 2. Coba endpoint backend jika tersedia
      const rawId = doc.id.replace(/\D/g, "");
      if (rawId) {
        const res = await clientApi.getDownloadUrl(rawId);
        if (res.success && res.data?.download_url) {
          const dlRes = await downloadRemoteFile(res.data.download_url, doc.name);
          if (dlRes.success) {
            setToastMessage(`Berkas resmi "${doc.name}" berhasil diunduh.`);
            return;
          }
        }
      }

      setToastMessage(`Berkas fisik asli "${doc.name}" tidak tersimpan di repositori server browser.`);
    } catch {
      setToastMessage(`Terjadi kendala saat mengunduh "${doc.name}".`);
    } finally {
      setDownloadingDocId(null);
      setTimeout(() => setToastMessage(null), 5000);
    }
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
                  <th scope="col" className="py-3 px-4 sm:px-6 text-center">ID Konsultasi</th>
                  <th scope="col" className="py-3 px-4 text-center">Judul Pekerjaan &amp; Layanan</th>
                  <th scope="col" className="py-3 px-4 hidden md:table-cell text-center">Konsultan Lead</th>
                  <th scope="col" className="py-3 px-4 text-center">Progres</th>
                  <th scope="col" className="py-3 px-4 sm:px-6 text-center">Status</th>
                  <th scope="col" className="py-3 px-4 sm:px-6 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-light">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-text-muted">
                      Memuat data konsultasi dari server backend...
                    </td>
                  </tr>
                ) : loadError ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-red-500">
                      {loadError}
                    </td>
                  </tr>
                ) : filteredTickets.length === 0 ? (
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
                      onClick={() => router.push(`/dashboard/user/tiket?id=${encodeURIComponent(ticket.id)}`)}
                      className="hover:bg-surface/60 transition-colors cursor-pointer"
                    >
                    <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-primary whitespace-nowrap">
                      {ticket.id}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-primary line-clamp-1">{ticket.title}</div>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-text-secondary">
                        <span className="font-semibold text-primary">{ticket.category}</span>
                        <span className="text-text-muted">•</span>
                        <span className="text-text-muted">Dibuat: {formatConsultationDate(ticket.createdAt || ticket.updatedAt)}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 hidden md:table-cell whitespace-nowrap">
                      {(() => {
                        const picName = getDisplayPicName(ticket);
                        const isWaiting = picName === "Menunggu PIC";
                        return (
                          <div>
                            <div
                              className={`flex items-center gap-1.5 ${
                                isWaiting ? "text-amber-700 font-semibold italic text-xs" : "font-medium text-text-primary text-xs"
                              }`}
                            >
                              <UserIcon
                                className={`text-[10px] ${
                                  isWaiting ? "text-amber-500" : "text-text-muted"
                                }`}
                              />
                              <span>{picName}</span>
                            </div>
                            <div className="text-[10px] text-text-secondary mt-0.5">{ticket.updatedAt}</div>
                          </div>
                        );
                      })()}
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

                    <td className="py-3.5 px-4 sm:px-6 text-center whitespace-nowrap">
                      {ticket.status === "Menunggu Penugasan" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          Menunggu PIC
                        </span>
                      ) : ticket.status === "Ditugaskan" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                          Ditugaskan
                        </span>
                      ) : ticket.status === "Selesai" || ticket.status === "Completed" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Selesai
                        </span>
                      ) : ticket.status === "Menunggu Klien" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
                          Menunggu Klien
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">
                          Dalam Proses
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 sm:px-6 text-center whitespace-nowrap">
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/user/tiket?id=${encodeURIComponent(ticket.id)}`);
                        }}
                        className="text-xs font-semibold px-3 py-1 bg-[#0B1533] hover:bg-[#0B1533]/90 text-white rounded-xl shadow-2xs cursor-pointer"
                      >
                        Buka Tiket
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
                          disabled={downloadingDocId === doc.id}
                          onClick={() => handleDownloadDocument(doc)}
                          className="text-xs py-1 px-3.5 h-auto border-navy-light text-primary hover:bg-surface font-semibold"
                        >
                          {downloadingDocId === doc.id ? "Mengunduh..." : "Unduh"}
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

      {/* Detail Konsultasi & Pengelolaan Dokumen kini berpusat di Menu Konsultasi (/dashboard/user/tiket) */}
    </div>
  );
}
