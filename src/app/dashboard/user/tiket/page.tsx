"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { clientApi, publicApi, ConsultationItem, ClientDocumentItem, PublicServiceItem } from "@/lib/api";
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
import { isDummyTicket, isDummyDocument, useAuth } from "@/context/AuthContext";
import {
  toggleArchiveClientTicket,
  isTicketArchived,
  addStoredClientTicket,
  getStoredClientTickets,
  ClientUploadedFile,
  ConsultationStatus,
  getDisplayPicName,
  formatConsultationDate,
  formatTicketDescription,
  resolveConsultationCategory,
  markTicketAsDeleted,
  cacheFileBlob,
  getCachedFileBlob,
  getCachedFileBlobAsync,
  formatCorrespondenceMessage,
  addSupportingDocumentsToTicket,
  mergeTicketsWithLocalOverrides,
  sortAndNormalizeMilestones,
  getMilestoneRank,
  extractCorrespondencesFromDescription,
} from "@/data/sharedTicketsStorage";
import { downloadBlob, downloadRemoteFile, generateDocumentPdfBlob } from "@/lib/downloadHelper";
import { savePersistentFileBlob } from "@/lib/fileStorageDB";
import {
  CheckCircleIcon,
  DocumentIcon,
  CloseIcon,
  SearchIcon,
  UserIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
  UploadIcon,
  MoreVerticalIcon,
  ArchiveIcon,
  UnarchiveIcon,
  TrashIcon,
} from "@/components/icons";

interface Milestone {
  step: string;
  title: string;
  status: "completed" | "in_progress" | "pending";
  date: string;
  description: string;
}

interface Deliverable {
  id?: number | string;
  name: string;
  size: string;
  format: string;
  type?: string;
  date: string;
  downloadUrl?: string;
}

interface Correspondence {
  id: string;
  sender: string;
  role: "Konsultan" | "Klien" | string;
  date: string;
  message: string;
}

interface Ticket {
  id: string;
  numericId?: number;
  title: string;
  category: "Tax Service Core" | "Accounting Service" | "Legal" | "Business Consulting" | string;
  priority?: "Normal" | "Tinggi" | "Mendesak" | string;
  description?: string;
  consultant: string;
  assignedAdminName?: string;
  assignedAdminDivision?: string;
  clientName?: string;
  clientEmail?: string;
  clientCompany?: string;
  clientDocuments?: ClientUploadedFile[];
  status: ConsultationStatus | string;
  progress: number;
  createdAt: string;
  estimatedCompletion: string;
  milestones: Milestone[];
  deliverables: Deliverable[];
  correspondences: Correspondence[];
  isArchived?: boolean;
  archivedAt?: string;
}

function ClientTicketMonitoringContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlTicketId = searchParams?.get("id");
  const { user } = useAuth();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "detail">(urlTicketId ? "detail" : "list");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Sinkronisasi viewMode dan selectedTicket dengan query parameter di URL (Back/Forward browser support)
  useEffect(() => {
    if (urlTicketId) {
      if (tickets.length > 0) {
        const match = tickets.find((t) => t.id.toLowerCase() === urlTicketId.toLowerCase());
        if (match) {
          setSelectedTicketId(match.id);
        }
      }
      setViewMode("detail");
    } else {
      setViewMode("list");
    }
  }, [urlTicketId, tickets]);

  // Unggah Dokumen Langsung pada Konsultasi Berjalan
  const [isUploadingDirectDoc, setIsUploadingDirectDoc] = useState<boolean>(false);
  const [isDraggingDoc, setIsDraggingDoc] = useState<boolean>(false);

  // Load consultations & deliverables directly from backend API
  const loadAllTickets = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [consultRes, docRes] = await Promise.allSettled([
        clientApi.getConsultations(),
        clientApi.getDocuments(),
      ]);

      let backendDocs: ClientDocumentItem[] = [];
      if (docRes.status === "fulfilled" && docRes.value.success && Array.isArray(docRes.value.data)) {
        backendDocs = docRes.value.data.filter((d: ClientDocumentItem) => !isDummyDocument(d));
      }

      let backendTickets: Ticket[] = [];
      if (consultRes.status === "fulfilled" && consultRes.value.success && Array.isArray(consultRes.value.data)) {
        const validConsultations = consultRes.value.data.filter((c: ConsultationItem) => !isDummyTicket(c));

        backendTickets = validConsultations.map((c: ConsultationItem) => {
          const ticketCode = c.project_code || `TK-${c.id}`;
          const projectDocs = backendDocs.filter(
            (d) => d.project_id === c.id || (c.project_code && d.file_name.includes(c.project_code))
          );
          const isClientUpload = (d: { uploaded_by?: number }) =>
            Boolean(d.uploaded_by && c.client_id && Number(d.uploaded_by) === Number(c.client_id));
          const adminDeliverables = projectDocs.filter((d) => !isClientUpload(d));
          const delivNames = new Set(adminDeliverables.map((d) => d.file_name.toLowerCase().trim()));
          const delivIds = new Set(adminDeliverables.map((d) => String(d.id)));

          const clientSupportingDocs = projectDocs.filter(
            (d) =>
              isClientUpload(d) &&
              !delivNames.has(d.file_name.toLowerCase().trim()) &&
              !delivIds.has(String(d.id))
          );

          const matchingDocs: Deliverable[] = adminDeliverables.map((d) => ({
            id: d.id,
            name: d.file_name,
            size: d.file_size || "1.8 MB",
            format: d.file_type || "PDF",
            downloadUrl: (d as unknown as { download_url?: string }).download_url || d.file_path,
            date: new Date(d.created_at).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
          }));

          const matchingClientDocs: ClientUploadedFile[] = clientSupportingDocs.map((d) => ({
            id: String(d.id),
            numericId: d.id,
            name: d.file_name,
            size: d.file_size || "1.8 MB",
            type: d.file_type || "PDF",
            date: new Date(d.created_at).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
            uploadedBy: c.client?.name || "Klien",
            status: "Diterima",
            downloadUrl: (d as unknown as { download_url?: string }).download_url || d.file_path,
          }));

          const isCompleted = c.status === "COMPLETED";
          const hasAssignedPic = Boolean(
            c.assigned_admin?.name ||
            c.assigned_to ||
            (c as unknown as { assigned_admin_id?: number }).assigned_admin_id
          );

          const sortedRawTasks = (c.tasks && c.tasks.length > 0)
            ? sortAndNormalizeMilestones(c.tasks)
            : [];

          const taskMilestones = sortedRawTasks.length > 0
            ? sortedRawTasks.map((task, idx) => {
                const isPicTask = getMilestoneRank(task.task_name) === 2 || task.task_name.toLowerCase().includes("pic");
                const isDone = Boolean(task.is_completed || (isPicTask && hasAssignedPic));
                return {
                  step: `0${idx + 1}`,
                  title: isPicTask && c.assigned_admin?.name ? `PIC Ditetapkan: ${c.assigned_admin.name}` : task.task_name,
                  status: (isDone
                    ? "completed"
                    : idx === 0 || (idx > 0 && (sortedRawTasks[idx - 1].is_completed || (getMilestoneRank(sortedRawTasks[idx - 1].task_name) === 2 && hasAssignedPic)))
                    ? "in_progress"
                    : "pending") as "completed" | "in_progress" | "pending",
                  date: isDone ? "Selesai" : "Proses",
                  description: task.task_name,
                };
              })
            : [
                {
                  step: "01",
                  title: "Intake & Verifikasi Berkas Awal",
                  status: "completed" as const,
                  date: "Hari ke-1",
                  description: "Permohonan konsultasi diterima sistem operasional dan diverifikasi.",
                },
                {
                  step: "02",
                  title: "Analisis & Pengerjaan Lembar Kerja",
                  status: (isCompleted || matchingDocs.length > 0 ? "completed" : "in_progress") as "completed" | "in_progress" | "pending",
                  date: "Proses",
                  description: "Peninjauan dokumen pendukung dan penyusunan kertas kerja.",
                },
                {
                  step: "03",
                  title: "Finalisasi & Penyampaian Hasil",
                  status: (isCompleted ? "completed" : matchingDocs.length > 0 ? "in_progress" : "pending") as "completed" | "in_progress" | "pending",
                  date: "Final",
                  description: "Penerbitan dokumen deliverable resmi.",
                },
              ];

          return {
            id: ticketCode,
            numericId: c.id,
            title: c.title,
            category: resolveConsultationCategory(c) as Ticket["category"],
            priority: "Normal",
            description: c.description || "Perikatan konsultasi aktif terdaftar pada sistem.",
            consultant: c.assigned_admin?.name || "Menunggu Penugasan PIC oleh Superadmin",
            assignedAdminName: c.assigned_admin?.name,
            status: isCompleted ? "Selesai" : c.assigned_admin ? "Dalam Proses" : "Menunggu Penugasan",
            progress: c.progress_percent || (isCompleted ? 100 : matchingDocs.length > 0 ? 75 : 40),
            createdAt: new Date(c.created_at).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
            estimatedCompletion: "Sesuai Jadwal SLA",
            milestones: taskMilestones,
            deliverables: matchingDocs.length > 0
              ? matchingDocs
              : isCompleted
              ? [
                  {
                    name: "Laporan_Resmi_Konsultasi_Zhou.pdf",
                    size: "1.8 MB",
                    format: "PDF",
                    date: "Selesai",
                  },
                ]
              : [],
            clientDocuments: matchingClientDocs,
            correspondences: extractCorrespondencesFromDescription(c.description, `c-msg-${c.id}`),
            isArchived: isTicketArchived(ticketCode),
          };
        });
      }

      // Gabungkan juga dengan tiket lokal yang disimpan (editan lokal selalu diprioritaskan)
      const localTickets = typeof window !== "undefined" ? getStoredClientTickets() : [];
      const rawMerged = mergeTicketsWithLocalOverrides(backendTickets as any, localTickets);
      const mergedTickets: Ticket[] = rawMerged.map((t) => ({
        ...t,
        category: t.category as Ticket["category"],
        deliverables: (t.deliverables || []).map((d) => ({
          ...d,
          format: (d as { format?: string; type?: string }).format || d.type || "PDF",
        })),
      })) as unknown as Ticket[];

      setTickets(mergedTickets);
      setSelectedTicketId((prev) => {
        if (urlTicketId && mergedTickets.some((t) => t.id.toLowerCase() === urlTicketId.toLowerCase())) {
          return mergedTickets.find((t) => t.id.toLowerCase() === urlTicketId.toLowerCase())!.id;
        }
        return prev && mergedTickets.some((t) => t.id === prev) ? prev : null;
      });
    } catch (err) {
      console.warn("Backend tickets load error, using local fallback:", err);
      const localTickets = typeof window !== "undefined" ? getStoredClientTickets() : [];
      if (localTickets.length > 0) {
        const mappedLocal: Ticket[] = localTickets.map((lt) => ({
          id: lt.id,
          title: lt.title,
          category: lt.category as Ticket["category"],
          priority: "Normal",
          description: lt.description || "Perikatan konsultasi aktif terdaftar pada sistem.",
          consultant: lt.consultant || "Menunggu Penugasan PIC oleh Superadmin",
          assignedAdminName: lt.assignedAdminName,
          status: lt.status === "Selesai" ? "Selesai" : lt.status === "Dalam Proses" ? "Dalam Proses" : "Menunggu Penugasan",
          progress: lt.progress || 15,
          createdAt: lt.createdAt || "Hari ini",
          estimatedCompletion: lt.estimatedCompletion || "Sesuai Jadwal SLA",
          milestones: lt.milestones || [],
          deliverables: (lt.deliverables || []).map((d) => ({
            id: d.id,
            name: d.name,
            size: d.size,
            format: (d as { format?: string; type?: string }).format || d.type || "PDF",
            date: d.date,
            downloadUrl: d.downloadUrl,
          })),
          correspondences: lt.correspondences || [],
          clientDocuments: lt.clientDocuments || [],
          isArchived: Boolean(lt.isArchived),
        }));
        setTickets(mappedLocal);
      }
    } finally {
      setIsLoading(false);
    }
  }, [urlTicketId]);

  useEffect(() => {
    loadAllTickets();
  }, [loadAllTickets]);

  // Sinkronisasi realtime saat ada dokumen/status yang diunggah oleh admin/konsultan di lembar kerja
  useEffect(() => {
    const handleSync = () => {
      loadAllTickets();
    };
    window.addEventListener("zhou_tickets_updated", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("zhou_tickets_updated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, [loadAllTickets]);

  // Modal State for New Ticket
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<string>("");
  const [newDescription, setNewDescription] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Action Menu Titik Tiga (Arsip / Hapus)
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [ticketToDelete, setTicketToDelete] = useState<Ticket | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Tutup dropdown menu saat klik di luar
  useEffect(() => {
    const handleCloseMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest?.("[data-action-menu]")) return;
      setOpenActionMenuId(null);
    };
    document.addEventListener("click", handleCloseMenu);
    return () => document.removeEventListener("click", handleCloseMenu);
  }, []);

  const handleToggleArchiveTicket = (ticket: Ticket) => {
    const isNowArchived = toggleArchiveClientTicket(ticket.id);
    setTickets((prev) =>
      prev.map((t) =>
        t.id.toLowerCase() === ticket.id.toLowerCase()
          ? {
              ...t,
              isArchived: isNowArchived,
              archivedAt: isNowArchived ? new Date().toISOString() : undefined,
            }
          : t
      )
    );
    showToast(
      isNowArchived
        ? `Konsultasi ${ticket.id} berhasil diarsipkan.`
        : `Konsultasi ${ticket.id} berhasil dipulihkan dari arsip.`
    );
  };

  const handleConfirmDelete = async () => {
    if (!ticketToDelete) return;
    const rawId = ticketToDelete.id.replace(/\D/g, "") || ticketToDelete.id;
    markTicketAsDeleted(ticketToDelete.id);
    if (rawId) {
      markTicketAsDeleted(rawId);
    }
    try {
      await clientApi.deleteConsultation(rawId);
    } catch {}
    showToast(`Konsultasi ${ticketToDelete.id} berhasil dihapus.`);
    setIsDeleteModalOpen(false);
    setTicketToDelete(null);
    if (selectedTicketId && selectedTicketId.toLowerCase() === ticketToDelete.id.toLowerCase()) {
      setSelectedTicketId(null);
      setViewMode("list");
      router.push(pathname);
    }
    await loadAllTickets();
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const [backendServiceNames, setBackendServiceNames] = useState<string[]>([]);
  useEffect(() => {
    publicApi
      .getServices()
      .then((res) => {
        if (res?.data && Array.isArray(res.data)) {
          setBackendServiceNames(
            res.data
              .filter((s: PublicServiceItem) => s.is_active !== false)
              .map((s: PublicServiceItem) => s.service_name)
              .filter(Boolean)
          );
        }
      })
      .catch(() => {});
  }, []);

  const serviceOptions = Array.from(
    new Set([
      "Tax Service Core",
      "Accounting Service",
      "Business Consulting",
      "Legal Compliance",
      ...backendServiceNames,
    ])
  );

  const activeCount = tickets.filter(
    (t) => t.status !== "Selesai" && t.status !== "Completed" && t.status !== "Dibatalkan"
  ).length;
  const completedCount = tickets.filter(
    (t) => t.status === "Selesai" || t.status === "Completed"
  ).length;

  // Total Dokumen Layanan mencakup seluruh berkas deliverable tiket
  const allDocNames = new Set<string>();
  tickets.forEach((t) => (t.deliverables || []).forEach((d) => allDocNames.add(d.name.toLowerCase())));
  const totalDeliverablesCount = allDocNames.size;

  // Filtering Logic
  const filteredTickets = tickets.filter((ticket) => {
    // Filter status arsip
    if (statusFilter === "ARCHIVED") {
      if (!ticket.isArchived) return false;
    } else if (statusFilter !== "ALL_WITH_ARCHIVED") {
      // Sembunyikan tiket arsip secara default dari daftar aktif
      if (ticket.isArchived) return false;
    }

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

  const selectedTicket = selectedTicketId
    ? tickets.find((t) => t.id.toLowerCase() === selectedTicketId.toLowerCase()) || null
    : urlTicketId
    ? tickets.find((t) => t.id.toLowerCase() === urlTicketId.toLowerCase()) || null
    : null;

  // Otomatis dedup agar dokumen deliverable resmi konsultan tidak pernah muncul ganda di dokumen pendukung klien
  const cleanClientDocuments = useMemo(() => {
    if (!selectedTicket?.clientDocuments) return [];
    const delivNames = new Set((selectedTicket.deliverables || []).map((d) => d.name.toLowerCase().trim()));
    const delivIds = new Set((selectedTicket.deliverables || []).map((d) => String(d.id)));
    return selectedTicket.clientDocuments.filter(
      (doc) => !delivNames.has(doc.name.toLowerCase().trim()) && !delivIds.has(String(doc.numericId || doc.id))
    );
  }, [selectedTicket?.clientDocuments, selectedTicket?.deliverables]);

  // Handle Download File Deliverable
  const handleDownloadFile = async (deliverableOrName: Deliverable | string) => {
    const deliverable: Deliverable = typeof deliverableOrName === "string"
      ? (selectedTicket?.deliverables?.find((d) => d.name === deliverableOrName) || {
          name: deliverableOrName,
          size: "1.8 MB",
          format: "PDF",
          date: "Hari ini",
        })
      : deliverableOrName;

    showToast(`Menyiapkan unduhan deliverable "${deliverable.name}"...`);

    // 1. Cek blob file di IndexedDB persistent storage dan memory cache
    const cachedBlob =
      (await getCachedFileBlobAsync(deliverable.name)) ||
      (selectedTicket?.id ? await getCachedFileBlobAsync(`${selectedTicket.id}:${deliverable.name}`) : undefined) ||
      (deliverable.id ? await getCachedFileBlobAsync(String(deliverable.id)) : undefined);

    if (cachedBlob) {
      downloadBlob(cachedBlob, deliverable.name);
      showToast(`Berkas deliverable asli "${deliverable.name}" berhasil diunduh.`);
      return;
    }

    // 2. Coba ambil dari endpoint download resmi jika ID dokumen backend tersedia
    if (deliverable.id) {
      try {
        const rawId = String(deliverable.id).replace(/\D/g, "");
        const numericId = parseInt(rawId, 10);
        if (numericId > 0 && numericId <= 2147483647) {
          const res = await clientApi.getDownloadUrl(numericId);
          if (res.success && res.data?.download_url) {
            const dlRes = await downloadRemoteFile(res.data.download_url, deliverable.name);
            if (dlRes.success) {
              showToast(`Deliverable "${deliverable.name}" berhasil diunduh.`);
              return;
            }
            if (typeof window !== "undefined") {
              const link = document.createElement("a");
              link.href = res.data.download_url;
              link.download = deliverable.name;
              link.target = "_blank";
              link.rel = "noopener noreferrer";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              showToast(`Deliverable "${deliverable.name}" berhasil diunduh.`);
              return;
            }
          }
        }
      } catch (err) {
        console.warn("Backend getDownloadUrl error:", err);
      }
    }

    // 3. Jika ada downloadUrl langsung
    if (deliverable.downloadUrl && deliverable.downloadUrl !== "#") {
      const dlRes = await downloadRemoteFile(deliverable.downloadUrl, deliverable.name);
      if (dlRes.success) {
        showToast(`Deliverable "${deliverable.name}" berhasil diunduh.`);
        return;
      }
    }

    // 4. Hanya jika berkas memang merupakan PDF resmi yang digenerate sistem
    if (deliverable.name.toLowerCase().endsWith(".pdf") && selectedTicket && (deliverable.name.toLowerCase().includes("laporan") || deliverable.name.toLowerCase().includes("deliverable"))) {
      const pdfBlob = generateDocumentPdfBlob({
        title: "LAPORAN FINAL HASIL PENUGASAN KONSULTASI",
        category: selectedTicket.category,
        clientName: selectedTicket.clientCompany || selectedTicket.clientName || user?.name || "Klien Terdaftar",
        ticketId: selectedTicket.id,
        date: selectedTicket.createdAt || new Date().toLocaleDateString("id-ID"),
        sections: [
          {
            title: "SUBJEK & DESKRIPSI PENUGASAN",
            paragraphs: [
              `Judul Konsultasi: ${selectedTicket.title}`,
              `Ruang Lingkup: ${selectedTicket.description || "Layanan konsultasi dan kepatuhan perpajakan/akuntansi profesional."}`,
              `Konsultan PIC Bertugas: ${selectedTicket.consultant || "Staf Konsultan Zhou"}`,
            ],
          },
          {
            title: "STATUS & TAHAPAN KERJA",
            paragraphs: [
              `Status Perikatan: ${selectedTicket.status} (Progres: ${selectedTicket.progress}%)`,
              ...(selectedTicket.milestones?.map((m) => `${m.step} - ${m.title}: ${m.status === "completed" ? "Selesai" : "Dalam Proses"}`) || []),
            ],
          },
        ],
      });

      downloadBlob(pdfBlob, deliverable.name);
      showToast(`Laporan resmi "${deliverable.name}" berhasil diunduh.`);
      return;
    }

    showToast(`Berkas fisik "${deliverable.name}" belum tersedia pada penyimpanan server. Silakan hubungi konsultan.`);
  };

  // Handle Download Berkas Pendukung Klien
  const handleDownloadClientDocument = async (doc: ClientUploadedFile) => {
    showToast(`Menyiapkan unduhan berkas pendukung "${doc.name}"...`);

    // 1. Cek blob file di IndexedDB persistent storage dan memory cache
    const cachedBlob =
      (await getCachedFileBlobAsync(doc.name)) ||
      (selectedTicket?.id ? await getCachedFileBlobAsync(`${selectedTicket.id}:${doc.name}`) : undefined) ||
      (doc.id ? await getCachedFileBlobAsync(doc.id) : undefined);

    if (cachedBlob) {
      downloadBlob(cachedBlob, doc.name);
      showToast(`Dokumen pendukung asli "${doc.name}" berhasil diunduh.`);
      return;
    }

    // 2. Coba unduh via downloadUrl jika ada
    if (doc.downloadUrl && doc.downloadUrl !== "#") {
      const dlRes = await downloadRemoteFile(doc.downloadUrl, doc.name);
      if (dlRes.success) {
        showToast(`Dokumen pendukung "${doc.name}" berhasil diunduh.`);
        return;
      }
    }

    if (doc.id) {
      try {
        const rawId = String(doc.id).replace(/\D/g, "");
        const numericId = parseInt(rawId, 10);
        if (numericId > 0 && numericId <= 2147483647) {
          const res = await clientApi.getDownloadUrl(numericId);
          if (res.success && res.data?.download_url) {
            const dlRes = await downloadRemoteFile(res.data.download_url, doc.name);
            if (dlRes.success) {
              showToast(`Dokumen pendukung "${doc.name}" berhasil diunduh.`);
              return;
            }
            if (typeof window !== "undefined") {
              const link = document.createElement("a");
              link.href = res.data.download_url;
              link.download = doc.name;
              link.target = "_blank";
              link.rel = "noopener noreferrer";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              showToast(`Dokumen pendukung "${doc.name}" berhasil diunduh.`);
              return;
            }
          }
        }
      } catch (err) {
        console.warn("Client doc download error:", err);
      }
    }

    // Berkas fisik asli klien tidak boleh digantikan dengan PDF buatan berisi ringkasan konsultasi
    showToast(`Berkas fisik asli "${doc.name}" tidak tersimpan di repositori server browser. Silakan unggah kembali berkas asli.`);
  };

  // Handle Unggah Dokumen Langsung dari Dropzone (Multi-File / Drag & Drop)
  const uploadFiles = async (filesToUpload: File[]) => {
    if (!selectedTicket || filesToUpload.length === 0) return;

    if (selectedTicket.status === "Selesai" || selectedTicket.status === "Dibatalkan" || selectedTicket.status === "Completed") {
      showToast(
        `Konsultasi ini telah berstatus "${selectedTicket.status}". Penambahan dokumen telah ditutup.`
      );
      return;
    }

    const allowedExtensions = [".pdf", ".xlsx", ".xls", ".doc", ".docx"];
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB

    for (const file of filesToUpload) {
      const lower = file.name.toLowerCase();
      const isAllowed = allowedExtensions.some((ext) => lower.endsWith(ext));
      if (!isAllowed) {
        showToast(
          `Format berkas "${file.name}" tidak didukung. Harap gunakan format PDF, Excel (.xlsx/.xls), atau Word (.docx/.doc).`
        );
        return;
      }
      if (file.size > maxSizeBytes) {
        showToast(
          `Ukuran berkas "${file.name}" (${(file.size / (1024 * 1024)).toFixed(2)} MB) melebihi batas maksimal 10MB.`
        );
        return;
      }
    }

    setIsUploadingDirectDoc(true);

    try {
      const nowFormatted = new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }) + " WIB";

      const preparedDocs: ClientUploadedFile[] = [];
      for (let idx = 0; idx < filesToUpload.length; idx++) {
        const file = filesToUpload[idx];
        const docId = `doc-${Date.now()}-${idx}`;
        await savePersistentFileBlob(
          [
            file.name,
            file.name.toLowerCase().trim(),
            docId,
            `${selectedTicket.id}:${file.name}`,
            `${selectedTicket.id}:${file.name}`.toLowerCase().trim(),
          ],
          file
        );
        cacheFileBlob([file.name, docId, `${selectedTicket.id}:${file.name}`], file);
        preparedDocs.push({
          id: docId,
          name: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
          type: file.name.split(".").pop()?.toUpperCase() || "PDF",
          uploadedAt: new Date().toISOString(),
          date: nowFormatted,
          uploadedBy: user?.name || "Klien",
          status: "Diterima PIC",
        });
      }

      // 1. Simpan langsung ke penyimpanan tersinkronisasi
      const fallbackTicketData = {
        ...selectedTicket,
        category: selectedTicket.category as any,
        priority: (selectedTicket.priority === "Tinggi" || selectedTicket.priority === "Mendesak" ? selectedTicket.priority : "Normal") as "Normal" | "Tinggi" | "Mendesak",
        status: (selectedTicket.status as any) || "Dalam Proses",
        deliverables: (selectedTicket.deliverables || []).map((d, i) => ({
          ...d,
          id: String(d.id || `deliv-${Date.now()}-${i}`),
          type: d.format || d.type || "PDF",
          status: "Tersedia",
        })),
        milestones: selectedTicket.milestones as any,
      };

      const saveRes = addSupportingDocumentsToTicket(
        selectedTicket.id,
        preparedDocs,
        user?.email,
        fallbackTicketData
      );

      if (saveRes.success && saveRes.ticket) {
        setTickets((prev) =>
          prev.map((t) =>
            t.id.toLowerCase() === selectedTicket.id.toLowerCase()
              ? {
                  ...t,
                  clientDocuments: saveRes.ticket?.clientDocuments || t.clientDocuments,
                  correspondences: saveRes.ticket?.correspondences || t.correspondences,
                }
              : t
          )
        );
      }

      // 2. Kirim juga ke backend secara aman (field 'file' sesuai skema API)
      for (const f of filesToUpload) {
        try {
          const targetId = selectedTicket.numericId || selectedTicket.id.replace(/\D/g, "") || selectedTicket.id;
          const formData = new FormData();
          formData.append("file", f);
          formData.append("file_name", f.name);
          formData.append("file_type", f.name.toLowerCase().endsWith(".pdf") ? "PDF" : "PDF");
          formData.append("description", "Dokumen pendukung dari klien");
          await clientApi.uploadConsultationDocument(targetId, formData);
        } catch (apiErr) {
          console.warn("Backend consultation upload notice:", apiErr);
        }
      }

      showToast(`${filesToUpload.length} berkas dokumen berhasil diunggah.`);
      await loadAllTickets();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat mengunggah dokumen.";
      showToast(msg);
    } finally {
      setIsUploadingDirectDoc(false);
    }
  };

  const handleDirectDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (selected && selected.length > 0) {
      uploadFiles(Array.from(selected));
    }
    e.target.value = "";
  };

  // Handle New Ticket Submit
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory || !newCategory.trim()) {
      showToast("Gagal: Anda wajib memilih divisi layanan yang ingin dikonsultasikan terlebih dahulu.");
      return;
    }
    if (!newTitle.trim() || !newDescription.trim()) {
      showToast("Mohon lengkapi judul dan deskripsi permohonan konsultasi.");
      return;
    }

    try {
      const res = await clientApi.createConsultation({
        title: newTitle.trim(),
        description: newDescription.trim(),
        category: newCategory,
        priority: "Normal",
      });

      const createdProject = res.data;
      const newId = createdProject?.project_code || (createdProject?.id ? `TCK-${String(createdProject.id).padStart(6, "0")}` : `TK-${Date.now().toString().slice(-4)}`);

      const initialDocId = attachedFile ? `doc-${Date.now()}` : undefined;
      if (attachedFile && initialDocId) {
        await savePersistentFileBlob(
          [
            attachedFile.name,
            attachedFile.name.toLowerCase().trim(),
            initialDocId,
            `${newId}:${attachedFile.name}`,
            `${newId}:${attachedFile.name}`.toLowerCase().trim(),
          ],
          attachedFile
        );
        cacheFileBlob([attachedFile.name, initialDocId, `${newId}:${attachedFile.name}`], attachedFile);
      }

      // Simpan juga ke penyimpanan lokal tersinkronisasi agar langsung muncul di dashboard Admin dan Klien
      addStoredClientTicket({
        id: newId,
        numericId: createdProject?.id,
        title: newTitle.trim(),
        category: newCategory,
        description: newDescription.trim(),
        priority: "Normal",
        status: "Menunggu Penugasan",
        progress: 15,
        createdAt: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
        estimatedCompletion: "14 Hari Kerja",
        clientName: user?.name || "Klien Terdaftar",
        clientEmail: user?.email || "klien@perusahaan.com",
        clientCompany: user?.company || "-",
        consultant: "Menunggu Penugasan PIC",
        milestones: [
          {
            step: "01",
            title: "Permohonan Diterima",
            status: "completed",
            date: "Hari ini",
            description: "Permohonan konsultasi diterima dan sedang menunggu penetapan PIC.",
          },
          {
            step: "02",
            title: "Penetapan PIC & Peninjauan Dokumen",
            status: "in_progress",
            date: "Proses",
            description: "Penetapan konsultan PIC yang bertanggung jawab atas penugasan.",
          },
          {
            step: "03",
            title: "Pengerjaan Kertas Kerja",
            status: "pending",
            date: "-",
            description: "Penyusunan kertas kerja dan analisis kepatuhan.",
          },
          {
            step: "04",
            title: "Laporan Final & Selesai",
            status: "pending",
            date: "-",
            description: "Penyampaian deliverable akhir penugasan.",
          },
        ],
        deliverables: [],
        correspondences: [
          {
            id: `msg-${Date.now()}`,
            sender: user?.name || "Klien",
            role: "Klien",
            date: "Hari ini",
            message: newDescription.trim(),
          },
        ],
        clientDocuments: attachedFile && initialDocId ? [
          {
            id: initialDocId,
            name: attachedFile.name,
            size: `${(attachedFile.size / (1024 * 1024)).toFixed(2)} MB`,
            type: attachedFile.name.split(".").pop()?.toUpperCase() || "PDF",
            date: "Hari ini",
            uploadedBy: user?.name || "Klien",
            status: "Diterima PIC",
          }
        ] : [],
      });

      if (attachedFile && createdProject?.id) {
        try {
          const fd = new FormData();
          fd.append("file", attachedFile);
          await clientApi.uploadConsultationDocument(createdProject.id, fd);
        } catch (uploadErr) {
          console.warn("Upload initial doc error:", uploadErr);
        }
      }

      showToast(`Permohonan konsultasi "${newTitle.trim()}" berhasil diajukan dengan nomor referensi ${newId}.`);
      setIsNewTicketModalOpen(false);
      setNewTitle("");
      setNewCategory("");
      setNewDescription("");
      setAttachedFile(null);
      setViewMode("list");
      await loadAllTickets();
    } catch {
      // Fallback lokal jika jaringan offline
      const fallbackId = `TK-${Date.now().toString().slice(-4)}`;
      const fallbackDocId = attachedFile ? `doc-${Date.now()}` : undefined;
      if (attachedFile && fallbackDocId) {
        await savePersistentFileBlob(
          [
            attachedFile.name,
            attachedFile.name.toLowerCase().trim(),
            fallbackDocId,
            `${fallbackId}:${attachedFile.name}`,
            `${fallbackId}:${attachedFile.name}`.toLowerCase().trim(),
          ],
          attachedFile
        );
        cacheFileBlob([attachedFile.name, fallbackDocId, `${fallbackId}:${attachedFile.name}`], attachedFile);
      }

      addStoredClientTicket({
        id: fallbackId,
        title: newTitle.trim(),
        category: newCategory,
        description: newDescription.trim(),
        priority: "Normal",
        status: "Menunggu Penugasan",
        progress: 15,
        createdAt: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
        estimatedCompletion: "14 Hari Kerja",
        clientName: user?.name || "Klien Terdaftar",
        clientEmail: user?.email || "klien@perusahaan.com",
        clientCompany: user?.company || "-",
        consultant: "Menunggu Penugasan PIC",
        milestones: [],
        deliverables: [],
        correspondences: [],
        clientDocuments: attachedFile && fallbackDocId ? [
          {
            id: fallbackDocId,
            name: attachedFile.name,
            size: `${(attachedFile.size / (1024 * 1024)).toFixed(2)} MB`,
            type: attachedFile.name.split(".").pop()?.toUpperCase() || "PDF",
            date: "Hari ini",
            uploadedBy: user?.name || "Klien",
            status: "Diterima PIC",
          }
        ] : [],
      });
      showToast(`Permohonan konsultasi "${newTitle.trim()}" berhasil disimpan dengan nomor referensi ${fallbackId}.`);
      setIsNewTicketModalOpen(false);
      setNewTitle("");
      setNewCategory("");
      setNewDescription("");
      setAttachedFile(null);
      setViewMode("list");
      await loadAllTickets();
    }
  };

  const renderDetailView = () => {
    if (!selectedTicket) return null;

    // Hitung progress penyelesaian aktual berdasarkan rasio tahapan yang selesai
    const totalMilestones = selectedTicket.milestones?.length || 0;
    const completedMilestones = selectedTicket.milestones?.filter((m) => m.status === "completed").length || 0;
    const calculatedProgress =
      selectedTicket.status === "Selesai" || (selectedTicket.status as string) === "Completed"
        ? 100
        : totalMilestones > 0
        ? Math.round((completedMilestones / totalMilestones) * 100)
        : selectedTicket.progress || 0;

    // Urutkan catatan tim (terbaru di atas jika ada)
    const sortedCorrespondences = [...(selectedTicket.correspondences || [])];

    return (
      <div className="space-y-5 animate-in fade-in">
        {/* Top Breadcrumb & Tombol Kembali */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-primary-light">
          <button
            type="button"
            onClick={() => {
              router.push(pathname);
              setViewMode("list");
              setSelectedTicketId(null);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:text-primary-dark transition-colors bg-white px-3.5 py-2 rounded-xl border border-primary-light shadow-2xs hover:bg-surface cursor-pointer w-fit"
          >
            <ChevronLeftIcon className="text-xs" />
            <span>Kembali ke Daftar Konsultasi Saya</span>
          </button>
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span>Menu Konsultasi</span>
            <span>&rsaquo;</span>
            <span className="font-mono font-bold text-primary">{selectedTicket.id}</span>
          </div>
        </div>

        {/* Container Utama Detail Konsultasi */}
        <Card id="detail-konsultasi-section" className="rounded-2xl border-primary-light bg-white shadow-xs overflow-hidden">
          {/* 1. Header dan Informasi Konsultasi */}
          <CardHeader className="p-5 sm:p-6 border-b border-primary-light bg-surface/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2 flex-1 min-w-0">
                {/* Baris Badge: ID, Status, Divisi */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-primary bg-white border border-primary-light px-2.5 py-0.5 rounded-md shadow-2xs">
                    {selectedTicket.id}
                  </span>
                  {selectedTicket.status === "Menunggu Penugasan" ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      Menunggu PIC
                    </span>
                  ) : selectedTicket.status === "Ditugaskan" ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                      Ditugaskan
                    </span>
                  ) : selectedTicket.status === "Selesai" || selectedTicket.status === "Completed" ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Selesai
                    </span>
                  ) : selectedTicket.status === "Menunggu Klien" ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                      Menunggu Klien
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                      Dalam Proses
                    </span>
                  )}
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-white text-text-secondary border border-primary-light">
                    Divisi: {selectedTicket.category}
                  </span>
                </div>

                {/* Judul Kebutuhan Konsultasi (Tanpa Redundansi ID) */}
                <h2 className="text-lg sm:text-xl font-bold text-primary tracking-tight">
                  {selectedTicket.title}
                </h2>

                {/* Metadata PIC dan Tanggal Pengajuan */}
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-text-secondary">
                  <div className="flex items-center gap-1.5">
                    <span className="text-text-muted">PIC Bertugas:</span>
                    {(() => {
                      const picName = getDisplayPicName(selectedTicket);
                      const isWaiting = picName === "Menunggu PIC";
                      if (isWaiting) {
                        return (
                          <span className="text-amber-800 font-semibold italic bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-[11px]">
                            Menunggu PIC
                          </span>
                        );
                      }
                      return (
                        <span className="font-semibold text-primary">
                          {picName}
                          {selectedTicket.assignedAdminDivision ? ` (${selectedTicket.assignedAdminDivision})` : ""}
                        </span>
                      );
                    })()}
                  </div>
                  <span className="text-text-muted select-none">•</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-text-muted">Tanggal Pengajuan:</span>
                    <span className="font-medium text-text-primary">
                      {formatConsultationDate(selectedTicket.createdAt)}
                    </span>
                  </div>
                  {selectedTicket.clientCompany && (
                    <>
                      <span className="text-text-muted select-none">•</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-text-muted">Entitas:</span>
                        <span className="font-medium text-text-primary">{selectedTicket.clientCompany}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Indikator Penyelesaian Dinamis & Proporsional */}
              <div className="flex items-center gap-3 self-start sm:self-center bg-white px-3.5 py-2 rounded-xl border border-primary-light shadow-2xs shrink-0">
                <div className="text-right">
                  <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider block">Penyelesaian</span>
                  <span className="text-sm font-bold text-primary font-mono">{calculatedProgress}%</span>
                </div>
                <div className="w-20 bg-surface border border-primary-light h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      calculatedProgress === 100 ? "bg-success" : "bg-primary"
                    }`}
                    style={{ width: `${calculatedProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </CardHeader>

          {/* Konten 2 Kolom Seimbang pada Desktop */}
          <CardContent className="p-5 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* KOLOM KIRI (lg:col-span-5): Uraian Kebutuhan & Alur Pengerjaan */}
              <div className="lg:col-span-5 space-y-4">
                {/* 1. Uraian Kebutuhan Klien */}
                <div className="p-4 rounded-xl border border-primary-light bg-surface/30 space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-primary-light/60">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                      Uraian Kebutuhan
                    </h4>
                    <span className="text-[11px] text-text-muted">
                      Pengaju: <strong className="text-primary font-medium">{selectedTicket.clientName || user?.name || "Klien"}</strong>
                    </span>
                  </div>
                  {(() => {
                    const cleanDesc = formatTicketDescription(selectedTicket.description);
                    return cleanDesc ? (
                      <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-line">
                        {cleanDesc}
                      </p>
                    ) : (
                      <p className="text-xs text-text-muted italic">
                        Belum ada uraian kebutuhan dari klien.
                      </p>
                    );
                  })()}
                </div>

                {/* 2. Alur Pengerjaan Konsultasi (Clean Minimal Stepper) */}
                <div className="p-4 rounded-xl border border-primary-light bg-white space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-primary-light/60">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                      Alur Pengerjaan
                    </h4>
                    <span className="text-[10px] font-bold text-text-muted">
                      {completedMilestones} dari {totalMilestones} Selesai
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {selectedTicket.milestones.map((m, idx) => {
                      const isDone = m.status === "completed";
                      const isInProg = m.status === "in_progress";
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-surface/40 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                isDone
                                  ? "bg-emerald-600 text-white"
                                  : isInProg
                                  ? "bg-primary text-white"
                                  : "bg-surface border border-primary-light text-text-muted"
                              }`}
                            >
                              {isDone ? <CheckIcon className="text-[10px]" /> : idx + 1}
                            </div>
                            <span
                              className={`text-xs truncate ${
                                isDone
                                  ? "font-semibold text-primary"
                                  : isInProg
                                  ? "font-bold text-primary"
                                  : "text-text-secondary"
                              }`}
                            >
                              {m.title}
                            </span>
                          </div>

                          <span
                            className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded shrink-0 ${
                              isDone
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : isInProg
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : "bg-slate-100 text-slate-500 border border-slate-200"
                            }`}
                          >
                            {isDone ? "Selesai" : isInProg ? "Proses" : "Menunggu"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* KOLOM KANAN (lg:col-span-7): Pusat Dokumen & Catatan Konsultan */}
              <div className="lg:col-span-7 space-y-4">
                {/* 1. Dokumen Deliverable dari Admin / Konsultan */}
                <div className="p-4 rounded-xl border border-primary-light bg-white space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-primary-light/60">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                        Dokumen Deliverable Resmi
                      </h4>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-surface text-primary border border-primary-light">
                        {selectedTicket.deliverables.length}
                      </span>
                    </div>
                    <span className="text-[10px] text-text-muted">Hasil Kertas Kerja Konsultan</span>
                  </div>

                  {selectedTicket.deliverables.length === 0 ? (
                    <div className="p-3 bg-surface/30 rounded-lg text-center text-xs text-text-muted border border-dashed border-primary-light/60">
                      Konsultan sedang menyusun deliverable resmi penugasan.
                    </div>
                  ) : (
                    <div className="divide-y divide-primary-light/60 border border-primary-light rounded-xl overflow-hidden bg-white">
                      {selectedTicket.deliverables.map((d, dIdx) => (
                        <div
                          key={dIdx}
                          className="p-3 flex items-center justify-between gap-3 hover:bg-surface/30 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-7 h-7 rounded-md flex items-center justify-center text-[9px] font-bold text-white shrink-0 ${
                                d.format.toLowerCase().includes("xls") ? "bg-emerald-600" : "bg-primary"
                              }`}
                            >
                              {d.format.toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-primary truncate text-xs">{d.name}</p>
                              <p className="text-[10px] text-text-muted mt-0.5">
                                {d.size} • {d.date}
                              </p>
                            </div>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadFile(d)}
                            className="shrink-0 text-xs h-7 px-2.5 border-primary-light text-primary hover:bg-surface font-semibold"
                          >
                            Unduh
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Dokumen Pendukung dari Klien & Upload Interaktif */}
                <div className="p-4 rounded-xl border border-primary-light bg-white space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-primary-light/60">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                        Dokumen Pendukung Klien
                      </h4>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-surface text-primary border border-primary-light">
                        {cleanClientDocuments.length}
                      </span>
                    </div>
                    <span className="text-[10px] text-text-muted">Maks. 10 MB (.pdf, .xlsx, .docx)</span>
                  </div>

                  {/* List Dokumen Terunggah */}
                  {cleanClientDocuments.length === 0 ? (
                    <div className="p-3 bg-surface/30 rounded-lg text-center text-xs text-text-muted border border-dashed border-primary-light/60">
                      Belum ada dokumen pendukung yang dilampirkan oleh klien.
                    </div>
                  ) : (
                    <div className="divide-y divide-primary-light/60 border border-primary-light rounded-xl overflow-hidden bg-white">
                      {cleanClientDocuments.map((doc, docIdx) => (
                        <div
                          key={doc.id || docIdx}
                          className="p-2.5 flex items-center justify-between gap-3 hover:bg-surface/30 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-7 h-7 rounded-md flex items-center justify-center text-[9px] font-bold text-white shrink-0 ${
                                doc.type?.toLowerCase().includes("xls") ||
                                doc.name.toLowerCase().endsWith(".xlsx") ||
                                doc.name.toLowerCase().endsWith(".xls")
                                  ? "bg-emerald-600"
                                  : doc.name.toLowerCase().endsWith(".doc") ||
                                    doc.name.toLowerCase().endsWith(".docx")
                                  ? "bg-blue-600"
                                  : "bg-primary"
                              }`}
                            >
                              {doc.name.toLowerCase().endsWith(".xlsx") || doc.name.toLowerCase().endsWith(".xls")
                                ? "XLS"
                                : doc.name.toLowerCase().endsWith(".doc") || doc.name.toLowerCase().endsWith(".docx")
                                ? "DOC"
                                : "PDF"}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-primary truncate text-xs">{doc.name}</p>
                              <p className="text-[10px] text-text-muted mt-0.5">
                                {doc.size} • {doc.date || doc.uploadedAt || "Hari ini"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold border border-emerald-200">
                              {doc.status || "Diterima"}
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadClientDocument(doc)}
                              className="text-xs h-7 px-2.5 font-semibold text-primary border-primary-light hover:bg-surface"
                            >
                              Unduh
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload Bar Responsif & Ringkas */}
                  {selectedTicket.status !== "Selesai" && selectedTicket.status !== "Dibatalkan" && selectedTicket.status !== "Completed" && (
                    <div>
                      {isUploadingDirectDoc ? (
                        <div className="flex items-center justify-center gap-3 p-3 bg-surface/50 border border-dashed border-primary-light rounded-xl text-center">
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs font-semibold text-primary">
                            Mengunggah dokumen pendukung...
                          </span>
                        </div>
                      ) : (
                        <label
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDraggingDoc(true);
                          }}
                          onDragLeave={() => setIsDraggingDoc(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsDraggingDoc(false);
                            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                              uploadFiles(Array.from(e.dataTransfer.files));
                            }
                          }}
                          className={`flex items-center justify-between p-3 bg-surface/40 hover:bg-surface/70 border border-dashed rounded-xl cursor-pointer transition-colors group ${
                            isDraggingDoc ? "border-primary bg-primary/5" : "border-primary-light hover:border-primary"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-white border border-primary-light group-hover:border-primary text-primary flex items-center justify-center shadow-2xs transition-colors">
                              <UploadIcon className="text-sm" />
                            </div>
                            <div>
                              <span className="text-xs font-bold text-primary block">
                                Tambah Dokumen Pendukung
                              </span>
                              <span className="text-[10px] text-text-muted block">
                                Klik untuk memilih berkas atau seret ke area ini
                              </span>
                            </div>
                          </div>

                          <span className="text-xs font-semibold px-3 py-1 bg-white border border-primary-light text-primary rounded-lg shadow-2xs group-hover:bg-primary group-hover:text-white transition-colors">
                            Pilih Berkas
                          </span>

                          <input
                            type="file"
                            multiple
                            accept=".pdf,.xlsx,.xls,.doc,.docx"
                            className="hidden"
                            onChange={handleDirectDocChange}
                          />
                        </label>
                      )}
                    </div>
                  )}
                </div>

                {/* 3. Catatan & Komunikasi Tim Penugasan (Clean, No Raw Robotic Dump) */}
                {(() => {
                  const cleanProblem = formatTicketDescription(selectedTicket.description).trim().toLowerCase();
                  const cleanCorrespondences = sortedCorrespondences
                    .map((c) => ({
                      ...c,
                      cleanMsg: formatCorrespondenceMessage(c.message),
                    }))
                    .filter((c) => {
                      if (!c.cleanMsg || c.cleanMsg.trim().length === 0) return false;
                      if (cleanProblem && c.cleanMsg.trim().toLowerCase() === cleanProblem) return false;
                      return true;
                    });

                  return (
                    <div className="p-4 rounded-xl border border-primary-light bg-white space-y-2.5">
                      <div className="flex items-center justify-between pb-2 border-b border-primary-light/60">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                          Catatan &amp; Komunikasi
                        </h4>
                        <span className="text-[10px] text-text-muted">Resmi dari Penugasan</span>
                      </div>

                      {cleanCorrespondences.length === 0 ? (
                        <div className="p-3 bg-surface/30 rounded-lg text-center text-xs text-text-muted border border-dashed border-primary-light/60">
                          Belum ada catatan atau instruksi tambahan dari tim konsultan untuk perikatan ini.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {cleanCorrespondences.map((c) => (
                            <div
                              key={c.id}
                              className="p-3 bg-surface/30 border border-primary-light/60 rounded-xl space-y-1 hover:bg-surface/60 transition-colors"
                            >
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="font-bold text-primary">{c.sender}</span>
                                <span className="text-text-muted font-mono">{c.date.replace(/&bull;/g, "•")}</span>
                              </div>
                              <p className="text-text-secondary text-xs leading-relaxed whitespace-pre-line">
                                {c.cleanMsg}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
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

      {isLoading ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-medium text-text-secondary">Memuat data dan dokumen konsultasi...</p>
        </div>
      ) : urlTicketId && !selectedTicket ? (
        <Card className="p-10 text-center rounded-2xl border-primary-light bg-white shadow-xs space-y-4 max-w-xl mx-auto my-8 animate-in fade-in">
          <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto text-xl font-bold">
            !
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-primary">Konsultasi Tidak Ditemukan atau Akses Dibatasi</h3>
            <p className="text-xs text-text-secondary max-w-md mx-auto">
              ID konsultasi <strong className="font-mono text-primary">{urlTicketId}</strong> tidak ditemukan pada daftar konsultasi akun Anda atau Anda tidak memiliki hak akses ke perikatan ini.
            </p>
          </div>
          <div className="pt-2">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => {
                router.push(pathname);
                setViewMode("list");
                setSelectedTicketId(null);
              }}
              className="text-xs font-semibold flex items-center gap-1.5 mx-auto"
            >
              <ChevronLeftIcon className="text-xs" />
              <span>Kembali ke Daftar Konsultasi</span>
            </Button>
          </div>
        </Card>
      ) : viewMode === "detail" && selectedTicket ? (
        renderDetailView()
      ) : (
        <>
          {/* Top Header */}
      <div className="pb-6 border-b border-primary-light">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
          Monitoring Konsultasi &amp; Lembar Kerja
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-2xl">
          Pantau alur tahapan penugasan akuntansi, kepatuhan pajak Coretax DJP, dan unduh berkas deliverable resmi secara terpusat.
        </p>
      </div>

      {/* Row 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Card 1 */}
        <Card className="p-4 sm:p-5 rounded-2xl border-primary-light bg-white shadow-xs">
          <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">
            Konsultasi Aktif Berjalan
          </span>
          <div className="mt-2 text-2xl font-bold text-primary font-mono flex items-baseline gap-1.5">
            <span>{activeCount < 10 ? `0${activeCount}` : activeCount}</span>
            <span className="text-xs text-text-secondary font-sans font-normal">Tiket</span>
          </div>
          <div className="mt-3 w-full bg-surface h-1.5 rounded-full overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: `${tickets.length > 0 ? Math.round((activeCount / tickets.length) * 100) : 0}%` }} />
          </div>
        </Card>

        {/* Card 2 */}
        <Card className="p-4 sm:p-5 rounded-2xl border-emerald-200 bg-emerald-50/40 shadow-xs">
          <span className="text-[10px] text-emerald-900 font-bold uppercase tracking-wider block">
            Laporan Selesai &amp; Rilis
          </span>
          <div className="mt-2 text-2xl font-bold text-emerald-800 font-mono flex items-baseline gap-1.5">
            <span>{completedCount < 10 ? `0${completedCount}` : completedCount}</span>
            <span className="text-xs text-emerald-700 font-sans font-normal">Selesai</span>
          </div>
          <div className="mt-3 w-full bg-surface h-1.5 rounded-full overflow-hidden">
            <div className="bg-success h-full rounded-full" style={{ width: `${tickets.length > 0 ? Math.round((completedCount / tickets.length) * 100) : 0}%` }} />
          </div>
        </Card>

        {/* Card 3 */}
        <Card className="p-4 sm:p-5 rounded-2xl border-primary-light bg-white shadow-xs">
          <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">
            Total Dokumen Layanan
          </span>
          <div className="mt-2 text-2xl font-bold text-primary font-mono flex items-baseline gap-1.5">
            <span>{totalDeliverablesCount < 10 ? `0${totalDeliverablesCount}` : totalDeliverablesCount}</span>
            <span className="text-xs text-text-secondary font-sans font-normal">Berkas</span>
          </div>
          <div className="mt-3 w-full bg-surface h-1.5 rounded-full overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: "100%" }} />
          </div>
        </Card>
      </div>

      {/* MASTER PANEL: TABEL DAFTAR KONSULTASI */}
      <Card className="rounded-2xl border-primary-light bg-white shadow-sm overflow-hidden">
        <CardHeader className="p-5 sm:p-6 border-b border-primary-light space-y-4">
          <div className="space-y-1">
            <CardTitle className="text-base sm:text-lg font-bold text-primary">
              Daftar Konsultasi Saya
            </CardTitle>
            <CardDescription className="text-xs text-text-secondary">
              Pantau seluruh permohonan konsultasi perpajakan yang Anda daftarkan di Zhou Consulting beserta progres lembar kerja dan dokumen perikatan.
            </CardDescription>
          </div>

          {/* Search + Filter Kategori + Button Buat Konsultasi Baru Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-2.5 text-text-muted text-xs pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Cari ID konsultasi, judul kebutuhan, atau nama konsultan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 text-xs h-9 bg-surface border-primary-light w-full"
                />
              </div>
              <div className="w-full sm:w-56 shrink-0">
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="text-xs h-9 bg-surface border-primary-light w-full"
                >
                  <option value="all">Semua Kategori Layanan</option>
                  <option value="Tax Service Core">Tax Service Core</option>
                  <option value="Accounting Service">Accounting Service</option>
                  <option value="Business Consulting">Business Consulting</option>
                  <option value="Legal">Legal Compliance</option>
                </Select>
              </div>
              <div className="w-full sm:w-44 shrink-0">
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs h-9 bg-surface border-primary-light w-full"
                >
                  <option value="ALL">Semua Konsultasi Aktif</option>
                  <option value="ARCHIVED">Diarsipkan</option>
                  <option value="ALL_WITH_ARCHIVED">Semua (Termasuk Arsip)</option>
                </Select>
              </div>
            </div>

            <Button
              variant="primary"
              onClick={() => {
                setNewCategory("");
                setNewTitle("");
                setNewDescription("");
                setAttachedFile(null);
                setIsNewTicketModalOpen(true);
              }}
              className="font-semibold text-xs py-2 px-4 shadow-sm shrink-0 whitespace-nowrap self-stretch sm:self-auto cursor-pointer"
            >
              <span>Buat Konsultasi Baru</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto min-h-[380px] pb-24">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface/80 text-text-secondary font-bold uppercase tracking-wider text-[10px] border-b border-primary-light">
                <tr>
                  <th className="py-3.5 px-4 text-center">ID Konsultasi</th>
                  <th className="py-3.5 px-4 text-center">Judul Pekerjaan &amp; Layanan</th>
                  <th className="py-3.5 px-4 text-center">Konsultan Lead</th>
                  <th className="py-3.5 px-4 text-center">Progres</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-light">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-text-muted">
                      <div className="space-y-1">
                        <p className="font-semibold text-primary">Tidak Ada Tiket Konsultasi</p>
                        <p className="text-[11px] text-text-secondary">
                          Belum ada permohonan konsultasi. Klik tombol &quot;Buat Konsultasi Baru&quot; di atas untuk memulai konsultasi.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((ticket) => {
                    const isSelected = selectedTicket?.id === ticket.id;
                    return (
                      <tr
                        key={ticket.id}
                        onClick={(e) => {
                          const target = e.target as HTMLElement | null;
                          if (target?.closest?.("[data-action-menu]")) return;
                          router.push(`${pathname}?id=${encodeURIComponent(ticket.id)}`);
                          setSelectedTicketId(ticket.id);
                          setViewMode("detail");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className={`cursor-pointer transition-colors relative ${
                          openActionMenuId === ticket.id ? "z-40" : "z-auto"
                        } ${
                          isSelected
                            ? "bg-primary/5 border-l-4 border-l-primary font-medium"
                            : "hover:bg-surface/50"
                        }`}
                        title="Klik untuk membuka detail konsultasi, lembar kerja & berkas pendukung"
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-primary">
                          <div className="flex items-center gap-1.5">
                            <span>{ticket.id}</span>
                            {ticket.isArchived && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                Arsip
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="text-primary line-clamp-1 font-bold">
                            {ticket.title}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-text-secondary">
                            <span className="font-semibold text-primary">{ticket.category}</span>
                            <span className="text-text-muted">•</span>
                            <span className="text-text-muted">Dibuat: {formatConsultationDate(ticket.createdAt)}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {(() => {
                            const picName = getDisplayPicName(ticket);
                            const isWaiting = picName === "Menunggu PIC";
                            return (
                              <div
                                className={`flex items-center gap-1.5 ${
                                  isWaiting ? "text-amber-700" : "text-text-primary"
                                }`}
                              >
                                <UserIcon
                                  className={`text-[10px] ${
                                    isWaiting ? "text-amber-500" : "text-text-muted"
                                  }`}
                                />
                                <span className={isWaiting ? "font-semibold italic text-amber-700 text-xs" : "font-medium text-xs"}>
                                  {picName}
                                </span>
                              </div>
                            );
                          })()}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-surface border border-primary-light h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  ticket.status === "Selesai" || ticket.progress === 100 ? "bg-success" : "bg-primary"
                                }`}
                                style={{ width: `${ticket.status === "Selesai" ? 100 : ticket.progress}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-bold text-primary">
                              {ticket.status === "Selesai" ? 100 : ticket.progress}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {ticket.status === "Menunggu Penugasan" ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              Menunggu PIC
                            </span>
                          ) : ticket.status === "Ditugaskan" ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                              Ditugaskan
                            </span>
                          ) : ticket.status === "Selesai" || ticket.status === "Completed" ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              Selesai
                            </span>
                          ) : ticket.status === "Menunggu Klien" ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
                              Menunggu Klien
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">
                              Dalam Proses
                            </span>
                          )}
                        </td>
                        <td className={`py-3.5 px-4 sm:px-6 text-right whitespace-nowrap ${
                          openActionMenuId === ticket.id ? "relative z-50" : "relative"
                        }`}>
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            <Button
                              type="button"
                              variant="primary"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`${pathname}?id=${encodeURIComponent(ticket.id)}`);
                                setSelectedTicketId(ticket.id);
                                setViewMode("detail");
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              className="text-xs py-1.5 px-3.5 h-auto font-semibold shadow-xs"
                            >
                              Detail Konsultasi
                            </Button>

                            {/* Menu Titik Tiga (More Actions: Arsip, Pulihkan, Hapus) */}
                            <div className="relative inline-block text-left" data-action-menu>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenActionMenuId((prev) => (prev === ticket.id ? null : ticket.id));
                                }}
                                className={`p-1.5 inline-flex items-center justify-center rounded-full transition-colors cursor-pointer ${
                                  openActionMenuId === ticket.id
                                    ? "text-primary bg-surface"
                                    : "text-text-muted hover:text-primary hover:bg-surface"
                                }`}
                                title="Pilihan Aksi"
                                aria-label="Pilihan aksi lainnya"
                              >
                                <MoreVerticalIcon className="text-sm pointer-events-none" />
                              </button>

                              {openActionMenuId === ticket.id && (
                                <>
                                  {/* Backdrop transparan untuk menutup menu ketika klik di luar */}
                                  <div
                                    className="fixed inset-0 z-40 bg-transparent"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenActionMenuId(null);
                                    }}
                                  />

                                  <div
                                    className="absolute right-0 top-full mt-1.5 w-44 rounded-xl bg-white border border-primary-light shadow-xl z-50 py-1 text-left ring-1 ring-black/5 animate-in fade-in duration-100"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenActionMenuId(null);
                                        handleToggleArchiveTicket(ticket);
                                      }}
                                      className="w-full px-3 py-2 text-xs flex items-center gap-2.5 text-text-primary hover:bg-surface font-medium transition-colors cursor-pointer"
                                    >
                                      {ticket.isArchived ? (
                                        <>
                                          <UnarchiveIcon className="text-xs text-primary shrink-0" />
                                          <span>Pulihkan dari Arsip</span>
                                        </>
                                      ) : (
                                        <>
                                          <ArchiveIcon className="text-xs text-amber-600 shrink-0" />
                                          <span>Arsip</span>
                                        </>
                                      )}
                                    </button>

                                    <div className="my-1 border-t border-primary-light/60" />

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenActionMenuId(null);
                                        setTicketToDelete(ticket);
                                        setIsDeleteModalOpen(true);
                                      }}
                                      className="w-full px-3 py-2 text-xs flex items-center gap-2.5 text-red-600 hover:bg-red-50 font-medium transition-colors cursor-pointer"
                                    >
                                      <TrashIcon className="text-xs shrink-0" />
                                      <span>Hapus</span>
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
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
        </>
      )}


      {/* MODAL: BUAT TIKET KONSULTASI BARU */}
      {isNewTicketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl border border-primary-light shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-5 border-b border-primary-light flex items-center justify-between bg-surface">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center text-sm font-bold">
                  <DocumentIcon />
                </div>
                <div>
                  <h3 className="text-base font-bold text-primary">Buat Konsultasi Baru</h3>
                  <p className="text-[11px] text-text-muted">Layanan Konsultasi Klien Zhou</p>
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
                  placeholder="Subjek permohonan / kebutuhan konsultasi"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="text-xs h-9"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="category" className="font-bold text-primary flex items-center justify-between">
                  <span>Divisi Layanan</span>
                  <span className="text-[10px] text-error font-medium">* Wajib Dipilih</span>
                </Label>
                <Select
                  id="category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className={`text-xs h-9 transition-colors ${
                    !newCategory
                      ? "border-amber-400 bg-amber-50/20 text-text-muted"
                      : "border-primary-light bg-white text-primary font-medium"
                  }`}
                  required
                >
                  <option value="" disabled>-- Wajib Pilih Divisi Layanan yang Ingin Dikonsultasikan --</option>
                  {serviceOptions.map((srvName) => (
                    <option key={srvName} value={srvName}>
                      {srvName}
                    </option>
                  ))}
                </Select>
                {!newCategory && (
                  <p className="text-[10px] text-amber-600 font-medium">
                    * Harap pilih divisi layanan terlebih dahulu agar formulir dapat dikirim.
                  </p>
                )}
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

              <div className="space-y-1.5">
                <input
                  type="file"
                  id="ticket-attachment-input"
                  accept=".pdf,.xlsx,.xls,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setAttachedFile(file);
                    }
                  }}
                  className="hidden"
                />

                {attachedFile ? (
                  <div className="p-3 bg-surface rounded-xl border border-primary-light flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${
                          attachedFile.name.toLowerCase().endsWith(".xlsx") ||
                          attachedFile.name.toLowerCase().endsWith(".xls")
                            ? "bg-emerald-600"
                            : "bg-primary"
                        }`}
                      >
                        {attachedFile.name.toLowerCase().endsWith(".xlsx") ||
                        attachedFile.name.toLowerCase().endsWith(".xls")
                          ? "XLS"
                          : "PDF"}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-primary truncate text-xs">
                          {attachedFile.name}
                        </p>
                        <p className="text-[10px] text-text-muted">
                          {(attachedFile.size / (1024 * 1024)).toFixed(2)} MB &bull; Terenkripsi NDA
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <label
                        htmlFor="ticket-attachment-input"
                        className="px-2.5 py-1 text-[11px] rounded-lg border border-primary-light bg-white hover:bg-surface text-primary font-medium cursor-pointer transition-colors"
                      >
                        Ganti
                      </label>
                      <button
                        type="button"
                        onClick={() => setAttachedFile(null)}
                        className="p-1 text-text-muted hover:text-error cursor-pointer rounded"
                        title="Hapus berkas"
                      >
                        <CloseIcon className="text-xs" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor="ticket-attachment-input"
                    className="flex flex-col items-center justify-center p-4 bg-white hover:bg-surface/30 border-2 border-dashed border-primary-light hover:border-primary rounded-xl cursor-pointer transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full bg-surface group-hover:bg-primary/10 text-primary flex items-center justify-center mb-2 transition-colors">
                      <UploadIcon className="text-base" />
                    </div>
                    <span className="text-xs font-semibold text-primary">
                      Pilih Dokumen Lampiran Pendukung
                    </span>
                    <span className="text-[11px] text-text-muted mt-0.5">
                      Klik untuk memilih berkas resmi (.pdf, .xlsx, .docx, maks. 10 MB)
                    </span>
                  </label>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-primary-light">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsNewTicketModalOpen(false);
                    setAttachedFile(null);
                  }}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!newCategory.trim() || !newTitle.trim() || !newDescription.trim()}
                  className="disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Kirim Permohonan Konsultasi
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Modal Konfirmasi Hapus Konsultasi */}
      {isDeleteModalOpen && ticketToDelete && (
        <div className="fixed inset-0 z-50 bg-primary/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-primary-light shadow-xl overflow-hidden p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <TrashIcon className="text-lg" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-primary">
                  Hapus Konsultasi?
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Apakah Anda yakin ingin menghapus tiket konsultasi{" "}
                  <span className="font-semibold text-primary">{ticketToDelete.id}</span> - &quot;{ticketToDelete.title}&quot;? Tindakan ini akan menghapus tiket dari daftar pemantauan Anda.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-primary-light">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setTicketToDelete(null);
                }}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleConfirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center gap-1.5"
              >
                <TrashIcon className="text-xs" />
                <span>Ya, Hapus</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ClientTicketMonitoringPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-text-muted">Memuat Layanan Konsultasi...</div>}>
      <ClientTicketMonitoringContent />
    </Suspense>
  );
}
