"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { clientApi, ConsultationItem } from "@/lib/api";
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
import { isDummyTicket, useAuth } from "@/context/AuthContext";
import {
  getTicketsForClient,
  addStoredClientTicket,
  getStoredDocuments,
  addSupportingDocumentsToTicket,
  TICKETS_UPDATED_EVENT,
  DOCUMENTS_UPDATED_EVENT,
  ClientTicket,
  ClientUploadedFile,
  ConsultationStatus,
} from "@/data/sharedTicketsStorage";
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
  format: string;
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

  // Modal Unggah Dokumen Tambahan pada Konsultasi Berjalan
  const [isAdditionalDocModalOpen, setIsAdditionalDocModalOpen] = useState<boolean>(false);
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const [additionalDocNote, setAdditionalDocNote] = useState<string>("");
  const [isUploadingAdditional, setIsUploadingAdditional] = useState<boolean>(false);
  const [additionalUploadError, setAdditionalUploadError] = useState<string | null>(null);

  // Sync consultations & deliverables, filtering out any backend dummy seed projects
  useEffect(() => {
    async function loadAllTickets() {
      // 1. Ambil dokumen yang diunggah Admin dari shared storage
      const storedDocs = getStoredDocuments();

      // 2. Cek tiket milik klien yang sedang login dari storage bersama
      const stored = getTicketsForClient(user?.email).filter((t) => !isDummyTicket(t));
      const mappedStored: Ticket[] = stored.map((t) => {
        // Berkas deliverable yang dikirim admin khusus untuk tiket ini
        const docDeliverables: Deliverable[] = storedDocs
          .filter((d) => d.ticketId && d.ticketId.toLowerCase() === t.id.toLowerCase())
          .map((d) => ({
            name: d.fileName,
            size: d.fileSize || "1.8 MB",
            format: d.fileType || "PDF",
            date: d.uploadDate || "Hari ini",
            downloadUrl: d.downloadUrl,
          }));

        const existingDelivs: Deliverable[] = (t.deliverables || []).map((d) => ({
          name: d.name,
          size: d.size,
          format: d.type || "PDF",
          date: d.date,
          downloadUrl: d.downloadUrl,
        }));

        const combinedDeliverables = [...existingDelivs];
        docDeliverables.forEach((dd) => {
          if (!combinedDeliverables.some((cd) => cd.name.toLowerCase() === dd.name.toLowerCase())) {
            combinedDeliverables.push(dd);
          }
        });

        const isCompleted =
          t.status === "Selesai" ||
          (t.status as string) === "Completed" ||
          (combinedDeliverables.length > 0 && t.progress === 100);

        return {
          id: t.id,
          title: t.title,
          category: t.category,
          priority: t.priority || "Normal",
          description: t.description,
          consultant: t.consultant,
          assignedAdminName: t.assignedAdminName,
          assignedAdminDivision: t.assignedAdminDivision,
          clientName: t.clientName,
          clientEmail: t.clientEmail,
          clientCompany: t.clientCompany,
          clientDocuments: t.clientDocuments || [],
          status: t.status,
          progress: t.progress || (combinedDeliverables.length > 0 ? 75 : 25),
          createdAt: t.createdAt || "Hari ini",
          estimatedCompletion: t.estimatedCompletion || "Sesuai Jadwal SLA",
          milestones:
            t.milestones && t.milestones.length > 0
              ? t.milestones.map((m, idx) => ({
                  ...m,
                  status:
                    idx === 2 && isCompleted
                      ? "completed"
                      : idx === 1 && combinedDeliverables.length > 0
                      ? "completed"
                      : m.status,
                }))
              : [
                  {
                    step: "01",
                    title: "Intake & Verifikasi Berkas Awal",
                    status: "completed",
                    date: "Hari ke-1",
                    description: "Permohonan konsultasi diterima sistem operasional dan diverifikasi.",
                  },
                  {
                    step: "02",
                    title: "Analisis & Pengerjaan Lembar Kerja",
                    status: combinedDeliverables.length > 0 ? "completed" : "in_progress",
                    date: "Proses",
                    description: "Peninjauan dokumen pendukung dan penyusunan kertas kerja.",
                  },
                  {
                    step: "03",
                    title: "Finalisasi & Penyampaian Hasil",
                    status: isCompleted ? "completed" : combinedDeliverables.length > 0 ? "in_progress" : "pending",
                    date: "Final",
                    description: "Penerbitan dokumen deliverable resmi.",
                  },
                ],
          deliverables: combinedDeliverables,
          correspondences: t.correspondences || [],
        };
      });

      // 3. Muat tiket backend dan filter keluar tiket dummy (PRJ-TAX-2026-001 / Maju Sukses)
      let backendTickets: Ticket[] = [];
      try {
        const res = await clientApi.getConsultations();
        if (res.success && Array.isArray(res.data)) {
          const validConsultations = res.data.filter((c: ConsultationItem) => !isDummyTicket(c));
          if (validConsultations.length > 0) {
            backendTickets = validConsultations.map((c: ConsultationItem) => {
              const ticketCode = c.project_code || `TK-${c.id}`;
              const matchingDocs: Deliverable[] = storedDocs
                .filter((d) => d.ticketId && d.ticketId.toLowerCase() === ticketCode.toLowerCase())
                .map((d) => ({
                  name: d.fileName,
                  size: d.fileSize || "1.8 MB",
                  format: d.fileType || "PDF",
                  date: d.uploadDate || "Hari ini",
                  downloadUrl: d.downloadUrl,
                }));

              const isCompleted = c.status === "COMPLETED";

              return {
                id: ticketCode,
                title: c.title,
                category: (c.service?.service_name as any) || "Tax Service Core",
                priority: "Normal",
                description: c.description,
                consultant: (c as any).assigned_admin?.name || "Menunggu Penugasan PIC oleh Superadmin",
                assignedAdminName: (c as any).assigned_admin?.name,
                status: isCompleted ? "Selesai" : (c as any).assigned_admin ? "Dalam Proses" : "Menunggu Penugasan",
                progress: c.progress_percent || (isCompleted ? 100 : matchingDocs.length > 0 ? 75 : 40),
                createdAt: new Date(c.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }),
                estimatedCompletion: "Sesuai Jadwal SLA",
                milestones: [
                  {
                    step: "01",
                    title: "Intake & Verifikasi Berkas Awal",
                    status: "completed",
                    date: "Hari ke-1",
                    description: "Permohonan konsultasi diterima sistem operasional dan diverifikasi.",
                  },
                  {
                    step: "02",
                    title: "Analisis & Pengerjaan Lembar Kerja",
                    status: isCompleted || matchingDocs.length > 0 ? "completed" : "in_progress",
                    date: "Proses",
                    description: "Peninjauan dokumen pendukung dan penyusunan kertas kerja.",
                  },
                  {
                    step: "03",
                    title: "Finalisasi & Penyampaian Hasil",
                    status: isCompleted ? "completed" : matchingDocs.length > 0 ? "in_progress" : "pending",
                    date: "Final",
                    description: "Penerbitan dokumen deliverable resmi.",
                  },
                ],
                deliverables:
                  matchingDocs.length > 0
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
                correspondences: [
                  {
                    id: `msg-${c.id}`,
                    sender: "Tim Konsultan Zhou (Sistem Penugasan)",
                    role: "Konsultan",
                    date: "Terbaru",
                    message:
                      c.description || "Perikatan konsultasi sedang dalam proses penanganan oleh konsultan kami.",
                  },
                ],
              };
            });
          }
        }
      } catch (err) {
        console.warn("Backend tickets load fallback:", err);
      }

      // Gabungkan tanpa duplikasi ID
      const combined = [...mappedStored];
      backendTickets.forEach((bt) => {
        if (!combined.some((item) => item.id.toLowerCase() === bt.id.toLowerCase())) {
          combined.push(bt);
        }
      });

      setTickets(combined);
      setSelectedTicketId((prev) => {
        if (urlTicketId && combined.some((t) => t.id.toLowerCase() === urlTicketId.toLowerCase())) {
          return combined.find((t) => t.id.toLowerCase() === urlTicketId.toLowerCase())!.id;
        }
        return prev && combined.some((t) => t.id === prev) ? prev : null;
      });
      setIsLoading(false);
    }

    loadAllTickets();
    window.addEventListener(TICKETS_UPDATED_EVENT, loadAllTickets);
    window.addEventListener(DOCUMENTS_UPDATED_EVENT, loadAllTickets);
    window.addEventListener("storage", loadAllTickets);
    return () => {
      window.removeEventListener(TICKETS_UPDATED_EVENT, loadAllTickets);
      window.removeEventListener(DOCUMENTS_UPDATED_EVENT, loadAllTickets);
      window.removeEventListener("storage", loadAllTickets);
    };
  }, [user?.email, urlTicketId]);

  // Modal State for New Ticket
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<Ticket["category"]>("Tax Service Core");
  const [newUrgency, setNewUrgency] = useState("Normal");
  const [newDescription, setNewDescription] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const storedDocs = typeof window !== "undefined" ? getStoredDocuments() : [];
  const activeCount = tickets.filter(
    (t) => t.status !== "Selesai" && t.status !== "Completed" && t.status !== "Dibatalkan"
  ).length;
  const completedCount = tickets.filter(
    (t) => t.status === "Selesai" || t.status === "Completed"
  ).length;

  // Total Dokumen Layanan mencakup seluruh berkas deliverable tiket & dokumen yang dikirim Admin
  const allDocNames = new Set<string>();
  tickets.forEach((t) => (t.deliverables || []).forEach((d) => allDocNames.add(d.name.toLowerCase())));
  storedDocs.forEach((d) => allDocNames.add(d.fileName.toLowerCase()));
  const totalDeliverablesCount = allDocNames.size;

  // Filtering Logic
  const filteredTickets = tickets.filter((ticket) => {
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

  // Handle Download File Deliverable
  const handleDownloadFile = (fileName: string) => {
    const fileContent = `======================================================
ZHOU CONSULTING - DIGITAL CLIENT VAULT
======================================================
Berkas Resmi : ${fileName}
Tiket Ref    : ${selectedTicket?.id || "-"}
Subjek       : ${selectedTicket?.title || "-"}
Divisi       : ${selectedTicket?.category || "-"}
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
    showToast(`Berkas "${fileName}" berhasil diunduh.`);
  };

  // Handle Download Berkas Pendukung Klien
  const handleDownloadClientDocument = (doc: ClientUploadedFile) => {
    const fileContent = `======================================================
ZHOU CONSULTING - DIGITAL CLIENT VAULT
======================================================
Berkas Dokumen : ${doc.name}
Konsultasi Ref : ${selectedTicket?.id || "-"}
Subjek Kasus   : ${selectedTicket?.title || "-"}
Divisi Layanan : ${selectedTicket?.category || "-"}
Pengunggah     : ${doc.uploadedBy || selectedTicket?.clientName || "Klien Terdaftar"}
Keterangan     : ${doc.description || "Dokumen Pendukung Perikatan Konsultasi"}
Status Berkas  : ${doc.status || "Diterima PIC"}
Ukuran Berkas  : ${doc.size}
Waktu Unggah   : ${doc.date || doc.uploadedAt || "Hari ini"}
Kerahasiaan    : Dokumen ini terenkripsi dan terikat perjanjian kerahasiaan (NDA).
======================================================`;
    const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = doc.name.endsWith(".pdf") ? doc.name.replace(".pdf", ".txt") : doc.name;
    document.body.appendChild(link);
    link.click();
    showToast(`Dokumen "${doc.name}" berhasil diunduh.`);
  };

  // Handle Submit Dokumen Tambahan pada Konsultasi Berjalan
  const handleUploadAdditionalDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    // 1. Validasi status konsultasi: tidak boleh jika sudah selesai/dibatalkan
    if (selectedTicket.status === "Selesai" || selectedTicket.status === "Dibatalkan") {
      setAdditionalUploadError(
        `Konsultasi ini telah berstatus "${selectedTicket.status}". Penambahan dokumen pendukung baru telah ditutup.`
      );
      return;
    }

    // 2. Validasi file terpilih
    if (additionalFiles.length === 0) {
      setAdditionalUploadError("Silakan pilih minimal satu berkas dokumen untuk diunggah.");
      return;
    }

    // 3. Validasi ukuran (maks 10MB) dan format per file
    const allowedExtensions = [".pdf", ".xlsx", ".xls", ".doc", ".docx"];
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB

    for (const file of additionalFiles) {
      const lowerName = file.name.toLowerCase();
      const hasValidExt = allowedExtensions.some((ext) => lowerName.endsWith(ext));
      if (!hasValidExt) {
        setAdditionalUploadError(
          `Format berkas "${file.name}" tidak didukung. Harap gunakan format PDF, Excel (.xlsx/.xls), atau Word (.docx/.doc).`
        );
        return;
      }
      if (file.size > maxSizeBytes) {
        setAdditionalUploadError(
          `Ukuran berkas "${file.name}" (${(file.size / (1024 * 1024)).toFixed(2)} MB) melebihi batas maksimal 10MB.`
        );
        return;
      }
    }

    setAdditionalUploadError(null);
    setIsUploadingAdditional(true);

    try {
      // 4. Integrasi endpoint upload backend jika API tersedia
      try {
        const formData = new FormData();
        additionalFiles.forEach((f) => formData.append("files", f));
        if (additionalDocNote.trim()) {
          formData.append("description", additionalDocNote.trim());
        }
        await clientApi.uploadConsultationDocument(selectedTicket.id, formData);
      } catch (backendErr) {
        console.warn("Backend consultation upload notice:", backendErr);
      }

      // 5. Simpan metadata dokumen ke storage bersama klien
      const nowFormatted = new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }) + " WIB";

      const docItems: ClientUploadedFile[] = additionalFiles.map((file, i) => {
        const lower = file.name.toLowerCase();
        const type = lower.endsWith(".xlsx") || lower.endsWith(".xls")
          ? "XLSX"
          : lower.endsWith(".doc") || lower.endsWith(".docx")
          ? "DOCX"
          : "PDF";

        return {
          id: `doc-${Date.now()}-${i}`,
          name: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
          type,
          uploadedAt: new Date().toISOString(),
          date: nowFormatted,
          uploadedBy: user?.name || "Klien",
          description: additionalDocNote.trim() || "Dokumen Pendukung Tambahan",
          status: "Diterima PIC",
        };
      });

      const res = addSupportingDocumentsToTicket(selectedTicket.id, docItems, user?.email);
      if (res.success) {
        showToast(
          `${additionalFiles.length} berkas berhasil diunggah ke konsultasi ${selectedTicket.id}.`
        );
        setIsAdditionalDocModalOpen(false);
        setAdditionalFiles([]);
        setAdditionalDocNote("");
        setAdditionalUploadError(null);
      } else {
        setAdditionalUploadError(res.message);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat mengunggah dokumen.";
      setAdditionalUploadError(msg);
    } finally {
      setIsUploadingAdditional(false);
    }
  };

  // Handle New Ticket Submit
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) {
      showToast("Mohon lengkapi judul dan deskripsi permohonan konsultasi.");
      return;
    }

    let backendProject: ConsultationItem | null = null;
    try {
      const res = await clientApi.createConsultation({
        title: newTitle.trim(),
        description: newDescription.trim(),
        category: newCategory,
        priority: newUrgency,
      });
      if (res?.success && res.data) {
        backendProject = res.data;
      } else {
        const escRes = await clientApi.escalateChatbot({
          message: `[${newCategory}] [Urgensi: ${newUrgency}] ${newTitle.trim()}: ${newDescription.trim()}`,
          category: newCategory,
        });
        if (escRes?.success && escRes.data) {
          backendProject = escRes.data as ConsultationItem;
        }
      }
    } catch (err) {
      console.warn("Backend ticket creation notice:", err);
    }

    const fallbackCode = `TK-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newId = backendProject?.project_code || (backendProject?.id ? `TK-${backendProject.id}` : fallbackCode);

    // Unggah dokumen pendukung awal ke backend jika ada
    if (attachedFile && backendProject?.id) {
      try {
        const fd = new FormData();
        fd.append("file", attachedFile);
        await clientApi.uploadConsultationDocument(backendProject.id, fd);
      } catch (uploadErr) {
        console.warn("Upload initial doc error:", uploadErr);
      }
    }

    const initialClientDocs: ClientUploadedFile[] = attachedFile
      ? [
          {
            name: attachedFile.name,
            size: `${(attachedFile.size / (1024 * 1024)).toFixed(2)} MB`,
            type:
              attachedFile.name.toLowerCase().endsWith(".xlsx") ||
              attachedFile.name.toLowerCase().endsWith(".xls")
                ? "XLSX"
                : "PDF",
            date: "Hari ini",
            uploadedBy: user?.name || "Klien",
          },
        ]
      : [];

    const newTicketItem: ClientTicket = {
      id: newId,
      title: newTitle,
      category: newCategory,
      consultant: "Menunggu Penugasan PIC oleh Superadmin",
      status: "Menunggu Penugasan",
      priority: (newUrgency as "Normal" | "Tinggi" | "Mendesak") || "Normal",
      description: newDescription,
      progress: 15,
      createdAt: "Hari ini",
      estimatedCompletion: "Menunggu Penetapan PIC",
      clientName: user?.name || "Klien Terdaftar",
      clientEmail: user?.email || "klien@perusahaan.com",
      clientCompany: user?.company || "Perusahaan Klien",
      clientDocuments: initialClientDocs,
      milestones: [
        {
          step: "01",
          title: "Permohonan Diterima",
          status: "completed",
          date: "Hari ini",
          description: "Permohonan konsultasi diterima dan sedang menunggu penetapan Admin/PIC oleh Superadmin.",
        },
        {
          step: "02",
          title: "Penetapan Admin / PIC",
          status: "in_progress",
          date: "Proses",
          description: "Superadmin menentukan konsultan PIC berdasarkan divisi layanan terkait.",
        },
        {
          step: "03",
          title: "Analisis & Pengerjaan Lembar Kerja",
          status: "pending",
          date: "Estimasi 3 hari",
          description: "Peninjauan dokumen pendukung dan penyusunan kertas kerja.",
        },
        {
          step: "04",
          title: "Finalisasi & Penyampaian Hasil",
          status: "pending",
          date: "Estimasi 7 hari",
          description: "Penerbitan dokumen deliverable resmi.",
        },
      ],
      deliverables: [],
      correspondences: [
        {
          id: `msg-${Date.now()}`,
          sender: "Superadmin (Sistem Zhou)",
          role: "Superadmin",
          date: "Hari ini • Baru saja",
          message: `Permohonan konsultasi telah diterima: "${newDescription}". Masuk ke antrian penugasan Superadmin untuk dialokasikan ke PIC divisi terkait.`,
        },
      ],
    };

    // Tambah ke storage bersama sehingga Superadmin langsung dapat melihat tiket ini di antrian penugasan
    addStoredClientTicket(newTicketItem);

    // Langsung perbarui state tiket lokal di komponen agar segera tampil di bagian "Daftar Seluruh Konsultasi"
    setTickets((prev) => [newTicketItem, ...prev.filter((t) => t.id.toLowerCase() !== newId.toLowerCase())]);
    setSelectedTicketId(newId);
    setViewMode("list");
    setIsNewTicketModalOpen(false);
    setNewTitle("");
    setNewDescription("");
    setAttachedFile(null);
    showToast(`Permohonan konsultasi berhasil dibuat dengan nomor referensi ${newId}.`);
  };  const renderDetailView = () => {
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
            <span>Kembali ke Daftar Seluruh Konsultasi</span>
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
                {/* Baris Badge: ID, Status, Prioritas, Divisi */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-primary bg-white border border-primary-light px-2.5 py-0.5 rounded-md shadow-2xs">
                    {selectedTicket.id}
                  </span>
                  {selectedTicket.status === "Menunggu Penugasan" ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      Menunggu Penugasan
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
                  {selectedTicket.priority && (
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                        selectedTicket.priority === "Mendesak"
                          ? "bg-rose-50 text-rose-800 border-rose-200"
                          : selectedTicket.priority === "Tinggi"
                          ? "bg-orange-50 text-orange-800 border-orange-200"
                          : "bg-slate-50 text-slate-700 border-slate-200"
                      }`}
                    >
                      Prioritas: {selectedTicket.priority}
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
                    {selectedTicket.assignedAdminName ? (
                      <span className="font-semibold text-primary">
                        {selectedTicket.assignedAdminName}
                        {selectedTicket.assignedAdminDivision ? ` (${selectedTicket.assignedAdminDivision})` : ""}
                      </span>
                    ) : (
                      <span className="text-amber-800 font-medium bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 text-[11px]">
                        Belum ditugaskan (Menunggu penugasan Superadmin)
                      </span>
                    )}
                  </div>
                  <span className="text-text-muted select-none">•</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-text-muted">Tanggal Pengajuan:</span>
                    <span className="font-medium text-text-primary">{selectedTicket.createdAt}</span>
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
              {/* KOLOM KIRI (lg:col-span-5): Uraian Masalah Klien & Tahapan Kertas Kerja */}
              <div className="lg:col-span-5 space-y-5">
                {/* 2. Bagian Uraian dan Penjelasan Kebutuhan dari Klien */}
                <div className="p-4 rounded-xl border border-primary-light bg-surface/40 space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-primary-light/60">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                      Uraian Kebutuhan Klien
                    </h4>
                    <span className="text-[10px] text-text-muted">
                      Pengaju: <strong className="text-primary font-medium">{selectedTicket.clientName || user?.name || "Klien"}</strong>
                    </span>
                  </div>
                  {selectedTicket.description && selectedTicket.description.trim() ? (
                    <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-line">
                      {selectedTicket.description}
                    </p>
                  ) : (
                    <p className="text-xs text-text-muted italic">
                      Belum ada uraian kebutuhan dari klien.
                    </p>
                  )}
                </div>

                {/* 3. Rapikan Tahapan Pengerjaan Kertas Kerja Konsultan */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                      Tahapan Pengerjaan Kertas Kerja
                    </h4>
                    <span className="text-[10px] font-semibold text-text-muted">
                      {completedMilestones} dari {totalMilestones} Selesai
                    </span>
                  </div>

                  <div className="divide-y divide-primary-light/60 border border-primary-light rounded-xl overflow-hidden bg-white shadow-2xs">
                    {selectedTicket.milestones.map((m, idx) => (
                      <div key={idx} className="p-3.5 flex items-start gap-3 hover:bg-surface/30 transition-colors">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold ${
                            m.status === "completed"
                              ? "bg-emerald-600 text-white"
                              : m.status === "in_progress"
                              ? "bg-primary text-white"
                              : "bg-surface border border-primary-light text-text-muted"
                          }`}
                        >
                          {m.status === "completed" ? <CheckIcon className="text-[9px]" /> : m.step}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-primary text-xs">{m.title}</span>
                            <span className="text-[10px] text-text-muted font-mono">{m.date}</span>
                          </div>
                          <p className="text-[11px] text-text-secondary mt-0.5 leading-relaxed">{m.description}</p>
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <span
                              className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                m.status === "completed"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : m.status === "in_progress"
                                  ? "bg-blue-50 text-blue-700"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {m.status === "completed"
                                ? "Selesai"
                                : m.status === "in_progress"
                                ? "Sedang Berjalan"
                                : "Belum Dimulai"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* KOLOM KANAN (lg:col-span-7): Dokumen & Catatan Tim Penugasan */}
              <div className="lg:col-span-7 space-y-5">
                {/* 4A. Dokumen Deliverable dari Admin / Konsultan */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                      Dokumen Deliverable dari Admin / Konsultan
                    </h4>
                    <span className="text-[11px] font-semibold text-text-secondary">
                      {selectedTicket.deliverables.length} Berkas
                    </span>
                  </div>

                  {selectedTicket.deliverables.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed border-primary-light bg-surface/30 text-center space-y-1">
                      <p className="text-xs font-semibold text-primary">Belum ada berkas deliverable masuk</p>
                      <p className="text-[11px] text-text-secondary max-w-sm mx-auto">
                        Konsultan sedang menyelesaikan kertas kerja penugasan. Berkas resmi akan muncul di sini begitu diterbitkan.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-primary-light/60 border border-primary-light rounded-xl overflow-hidden bg-white shadow-2xs">
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
                                {d.size} • {d.date} •{" "}
                                <span className="text-emerald-700 font-medium">Deliverable Resmi</span>
                              </p>
                            </div>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadFile(d.name)}
                            className="shrink-0 text-xs h-7 px-2.5 border-primary-light text-primary hover:bg-surface font-semibold"
                          >
                            Unduh
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4B. Dokumen Pendukung dari Klien */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                      Dokumen Pendukung dari Klien
                    </h4>

                    {selectedTicket.status === "Selesai" || selectedTicket.status === "Dibatalkan" ? (
                      <span className="text-[10px] font-medium text-text-muted bg-surface px-2 py-0.5 rounded border border-primary-light shrink-0">
                        Pengunggahan Ditutup ({selectedTicket.status})
                      </span>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setAdditionalFiles([]);
                          setAdditionalDocNote("");
                          setAdditionalUploadError(null);
                          setIsAdditionalDocModalOpen(true);
                        }}
                        className="text-xs h-7 px-2.5 font-semibold text-primary border-primary-light hover:bg-primary/5 flex items-center gap-1 shrink-0"
                      >
                        <UploadIcon className="text-[10px]" />
                        <span>Unggah Dokumen</span>
                      </Button>
                    )}
                  </div>

                  {(!selectedTicket.clientDocuments || selectedTicket.clientDocuments.length === 0) ? (
                    <div className="p-4 rounded-xl border border-dashed border-primary-light bg-surface/30 text-center space-y-1.5">
                      <p className="text-xs font-semibold text-primary">
                        Belum ada dokumen pada konsultasi ini. Anda dapat mengunggah dokumen pendukung jika diperlukan.
                      </p>
                      <p className="text-[11px] text-text-secondary max-w-sm mx-auto">
                        Unggah dokumen pendukung seperti SPT, bukti potong, laporan keuangan, atau berkas terkait untuk dianalisis oleh PIC konsultan.
                      </p>
                      {selectedTicket.status !== "Selesai" && selectedTicket.status !== "Dibatalkan" && (
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            setAdditionalFiles([]);
                            setAdditionalDocNote("");
                            setAdditionalUploadError(null);
                            setIsAdditionalDocModalOpen(true);
                          }}
                          className="text-xs h-7 px-3 mt-1 font-semibold"
                        >
                          Unggah Dokumen
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="divide-y divide-primary-light/60 border border-primary-light rounded-xl overflow-hidden bg-white shadow-2xs">
                      {selectedTicket.clientDocuments.map((doc, docIdx) => (
                        <div
                          key={doc.id || docIdx}
                          className="p-3 flex items-center justify-between gap-3 hover:bg-surface/30 transition-colors"
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
                                {doc.size} • {doc.date || doc.uploadedAt || "Hari ini"} • Pengunggah:{" "}
                                <strong className="text-text-primary font-medium">{doc.uploadedBy || "Klien"}</strong>
                              </p>
                              {doc.description && (
                                <p className="text-[10px] text-text-secondary mt-0.5 italic">
                                  Keterangan: {doc.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold border border-emerald-200">
                              {doc.status || "Diterima PIC"}
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
                </div>

                {/* 5. Sederhanakan Catatan Terbaru dari Tim Penugasan */}
                {sortedCorrespondences.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                      Catatan Terbaru dari Tim Penugasan
                    </h4>
                    <div className="divide-y divide-primary-light/60 border border-primary-light rounded-xl overflow-hidden bg-surface/30">
                      {sortedCorrespondences.map((c) => (
                        <div key={c.id} className="p-3 text-xs hover:bg-surface/60 transition-colors">
                          <div className="flex items-center justify-between text-[10px] text-text-muted mb-0.5">
                            <span className="font-semibold text-primary">{c.sender}</span>
                            <span className="font-mono">{c.date.replace(/&bull;/g, "•")}</span>
                          </div>
                          <p className="text-text-secondary text-[11px] leading-relaxed">{c.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
              Daftar Seluruh Konsultasi
            </CardTitle>
            <CardDescription className="text-xs text-text-secondary">
              Pilih dan klik baris atau tombol Detail Konsultasi untuk membuka lembar kerja dan mengelola dokumen perikatan.
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
              <div className="w-full sm:w-60 shrink-0">
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
            </div>

            <Button
              variant="primary"
              onClick={() => setIsNewTicketModalOpen(true)}
              className="font-semibold text-xs py-2 px-4 shadow-sm shrink-0 whitespace-nowrap self-stretch sm:self-auto"
            >
              <span>Buat Konsultasi Baru</span>
            </Button>
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
                  <th className="py-3.5 px-4 sm:px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-light">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-text-muted">
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
                        onClick={() => {
                          router.push(`${pathname}?id=${encodeURIComponent(ticket.id)}`);
                          setSelectedTicketId(ticket.id);
                          setViewMode("detail");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-primary/5 border-l-4 border-l-primary font-medium"
                            : "hover:bg-surface/50"
                        }`}
                        title="Klik untuk membuka detail konsultasi, lembar kerja & berkas pendukung"
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
                            <span className="font-medium">
                              {ticket.assignedAdminName || ticket.consultant}
                            </span>
                          </div>
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
                              Menunggu Penugasan
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
                        <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
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
                    <option value="Mendesak">Mendesak (Penanganan Segera)</option>
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
                    className="p-3.5 bg-surface hover:bg-surface/80 border border-dashed border-primary-light hover:border-primary/50 rounded-xl text-center block cursor-pointer transition-colors group"
                  >
                    <DocumentIcon className="mx-auto text-primary/70 group-hover:text-primary text-lg mb-1" />
                    <span className="text-[11px] font-bold text-primary block">
                      Unggah berkas lampiran pendukung (PDF / XLSX maks. 10MB)
                    </span>
                    <span className="text-[10px] text-text-muted block mt-0.5">
                      Otomatis terenkripsi dan terikat perjanjian kerahasiaan NDA
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
                <Button type="submit" variant="primary" size="sm">
                  Kirim Permohonan Konsultasi
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: UNGGAH DOKUMEN TAMBAHAN PADA KONSULTASI BERJALAN */}
      {isAdditionalDocModalOpen && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-primary-light shadow-2xl max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-primary-light flex items-center justify-between bg-surface shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center text-sm font-bold">
                  <UploadIcon />
                </div>
                <div>
                  <h3 className="text-base font-bold text-primary">Unggah Dokumen Tambahan</h3>
                  <p className="text-[11px] text-text-muted">
                    Konsultasi Ref: <span className="font-mono font-bold text-primary">{selectedTicket.id}</span> &bull; PIC: {selectedTicket.assignedAdminName || "Tim Konsultan"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!isUploadingAdditional) {
                    setIsAdditionalDocModalOpen(false);
                    setAdditionalFiles([]);
                    setAdditionalDocNote("");
                    setAdditionalUploadError(null);
                  }
                }}
                disabled={isUploadingAdditional}
                className="text-text-muted hover:text-primary p-1 rounded cursor-pointer disabled:opacity-40"
                aria-label="Tutup modal"
              >
                <CloseIcon className="text-base" />
              </button>
            </div>

            <form onSubmit={handleUploadAdditionalDoc} className="p-5 space-y-4 text-xs overflow-y-auto flex-1">
              {/* Alert Penjelasan */}
              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-text-secondary leading-relaxed">
                Dokumen yang Anda unggah di sini akan langsung terhubung ke perikatan <strong>{selectedTicket.id}</strong> dan dapat diakses oleh konsultan PIC untuk kelanjutan proses telaah lembar kerja, tanpa perlu membuat konsultasi baru.
              </div>

              {/* Alert Error jika ada */}
              {additionalUploadError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2">
                  <span className="font-bold shrink-0">Kesalahan:</span>
                  <span>{additionalUploadError}</span>
                </div>
              )}

              {/* Area Pilih Berkas (Multi-File) */}
              <div className="space-y-1.5">
                <Label className="font-bold text-primary flex items-center justify-between">
                  <span>Pilih Berkas Lampiran Pendukung (PDF, Excel, Word)</span>
                  <span className="text-[10px] text-text-muted font-normal">Maks. 10MB per file</span>
                </Label>

                <input
                  type="file"
                  id="additional-doc-input"
                  multiple
                  accept=".pdf,.xlsx,.xls,.doc,.docx,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => {
                    const selected = e.target.files;
                    if (selected && selected.length > 0) {
                      const newArr = Array.from(selected);
                      setAdditionalFiles((prev) => {
                        // Gabungkan file tanpa duplikasi nama
                        const combined = [...prev];
                        newArr.forEach((nf) => {
                          if (!combined.some((cf) => cf.name === nf.name)) {
                            combined.push(nf);
                          }
                        });
                        return combined;
                      });
                      setAdditionalUploadError(null);
                    }
                  }}
                  className="hidden"
                  disabled={isUploadingAdditional}
                />

                <label
                  htmlFor="additional-doc-input"
                  className={`p-4 bg-surface hover:bg-surface/80 border border-dashed border-primary-light hover:border-primary/50 rounded-xl text-center block cursor-pointer transition-colors ${
                    isUploadingAdditional ? "opacity-50 pointer-events-none" : ""
                  }`}
                >
                  <UploadIcon className="mx-auto text-primary/70 text-lg mb-1" />
                  <span className="text-[11px] font-bold text-primary block">
                    {additionalFiles.length > 0 ? "+ Tambah Berkas Lainnya" : "Klik untuk memilih satu atau beberapa berkas"}
                  </span>
                  <span className="text-[10px] text-text-muted block mt-0.5">
                    Format didukung: PDF, XLSX, XLS, DOC, DOCX
                  </span>
                </label>

                {/* Preview Berkas yang Dipilih */}
                {additionalFiles.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                      Berkas Terpilih ({additionalFiles.length} file):
                    </span>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {additionalFiles.map((f, fIdx) => (
                        <div
                          key={fIdx}
                          className="p-2.5 bg-surface rounded-xl border border-primary-light flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-6 h-6 rounded bg-primary text-white flex items-center justify-center text-[9px] font-bold shrink-0">
                              {f.name.toLowerCase().endsWith(".xlsx") || f.name.toLowerCase().endsWith(".xls")
                                ? "XLS"
                                : f.name.toLowerCase().endsWith(".doc") || f.name.toLowerCase().endsWith(".docx")
                                ? "DOC"
                                : "PDF"}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-primary truncate text-xs">{f.name}</p>
                              <p className="text-[10px] text-text-muted">
                                {(f.size / (1024 * 1024)).toFixed(2)} MB
                              </p>
                            </div>
                          </div>

                          {!isUploadingAdditional && (
                            <button
                              type="button"
                              onClick={() => {
                                setAdditionalFiles((prev) => prev.filter((_, idx) => idx !== fIdx));
                              }}
                              className="p-1 text-text-muted hover:text-rose-600 rounded cursor-pointer"
                              title="Hapus dari antrian"
                            >
                              <CloseIcon className="text-xs" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Input Keterangan / Tujuan Dokumen */}
              <div className="space-y-1.5">
                <Label htmlFor="additional-doc-note" className="font-bold text-primary block">
                  Keterangan / Tujuan Dokumen (Opsional)
                </Label>
                <Textarea
                  id="additional-doc-note"
                  placeholder="Contoh: Rekening koran bank periode Nov-Des 2025 untuk rekonsiliasi PPh Badan..."
                  value={additionalDocNote}
                  onChange={(e) => setAdditionalDocNote(e.target.value)}
                  rows={3}
                  className="text-xs"
                  disabled={isUploadingAdditional}
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-primary-light shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAdditionalDocModalOpen(false);
                    setAdditionalFiles([]);
                    setAdditionalDocNote("");
                    setAdditionalUploadError(null);
                  }}
                  disabled={isUploadingAdditional}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={additionalFiles.length === 0 || isUploadingAdditional}
                  className="min-w-[120px] font-semibold flex items-center justify-center gap-1.5"
                >
                  {isUploadingAdditional ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Mengunggah...</span>
                    </>
                  ) : (
                    <span>Unggah ke Konsultasi</span>
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

export default function ClientTicketMonitoringPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-text-muted">Memuat Layanan Konsultasi...</div>}>
      <ClientTicketMonitoringContent />
    </Suspense>
  );
}
