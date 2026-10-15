"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth, isDummyTicket, normalizeRole } from "@/context/AuthContext";
import { adminApi, ConsultationItem } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircleIcon,
  CheckIcon,
  ChevronLeftIcon,
  DocumentIcon,
  SearchIcon,
  CloseIcon,
  UploadIcon,
  LockIcon,
  SendIcon,
} from "@/components/icons";

import {
  getTicketsForAdmin,
  canAdminAccessTicket,
  getTicketByIdForStaff,
  updateTicketByStaff,
  getStoredStaffAdmins,
  addStoredDocument,
  getStoredClientTickets,
  saveStoredClientTickets,
  formatConsultationDate,
  TICKETS_UPDATED_EVENT,
  DOCUMENTS_UPDATED_EVENT,
  ClientTicket,
  StaffAdminProfile,
  ConsultationStatus,
  Milestone,
} from "@/data/sharedTicketsStorage";

function AdminTugasSayaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlTicketId = searchParams.get("id");

  const { user } = useAuth();
  const normalizedUserRole = normalizeRole(user?.role, user?.email);

  const [staffList, setStaffList] = useState<StaffAdminProfile[]>([]);
  // Profil Admin aktif (default: user login; atau admin terpilih jika superadmin sedang menguji)
  const [activeAdminEmail, setActiveAdminEmail] = useState<string>(user?.email || "admin@zhou.id");

  // Jika bukan Superadmin, selalu kunci activeAdminEmail ke identitas login asli
  useEffect(() => {
    if (normalizedUserRole !== "superadmin" && user?.email) {
      setActiveAdminEmail(user.email);
    }
  }, [normalizedUserRole, user?.email]);

  const [tickets, setTickets] = useState<ClientTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // State Modal Akses Ditolak (Security Boundary)
  const [accessDeniedMessage, setAccessDeniedMessage] = useState<string | null>(null);

  // Modal Detail Konsultasi (Pusat Pengelolaan Dokumen & Catatan)
  const [selectedTicket, setSelectedTicket] = useState<ClientTicket | null>(null);
  const [detailSendFile, setDetailSendFile] = useState<File | null>(null);
  const [detailDocCategory, setDetailDocCategory] = useState<string>("Kertas Kerja & Laporan Akhir");
  const [detailDocNotes, setDetailDocNotes] = useState<string>("");
  const [detailSyncStatus, setDetailSyncStatus] = useState<string>("");
  const [isSendingDetailDoc, setIsSendingDetailDoc] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Muat data staf admin & tiket
  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    const staff = getStoredStaffAdmins();
    setStaffList(staff);

    // Dapatkan data admin aktif saat ini
    const currentStaffProfile = staff.find(
      (s) => s.email.toLowerCase() === activeAdminEmail.toLowerCase()
    );
    const staffContext = currentStaffProfile || {
      email: activeAdminEmail,
      name: user?.name || "Konsultan Senior Zhou",
      role: normalizedUserRole,
      id: user?.id ? String(user.id) : "ADM-002",
    };

    const storedTickets = getTicketsForAdmin(staffContext).filter((t) => !isDummyTicket(t));

    // Sinkronisasi dengan perikatan dari backend (GET /api/v1/admin/consultations)
    let backendTickets: ClientTicket[] = [];
    try {
      const res = await adminApi.getConsultations();
      if (res?.data && Array.isArray(res.data)) {
        backendTickets = res.data
          .filter((c: ConsultationItem) => !isDummyTicket(c))
          .map((c: ConsultationItem) => ({
            id: c.project_code || `TK-${c.id}`,
            title: c.title || "Konsultasi Perpajakan",
            category: (c.service?.service_name as any) || "Tax Service Core",
            status: c.status === "COMPLETED" ? "Selesai" : c.status === "IN_PROGRESS" ? "Dalam Proses" : "Menunggu Penugasan",
            priority: "Normal",
            description: c.description || "",
            progress: c.progress_percent || (c.status === "COMPLETED" ? 100 : 35),
            createdAt: c.created_at ? new Date(c.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "Hari ini",
            estimatedCompletion: "14 Hari Kerja",
            clientName: c.client?.name || "Klien Terdaftar",
            clientEmail: c.client?.email || "-",
            clientCompany: c.client?.company_name || "-",
            consultant: c.assigned_admin?.name || "Menunggu Penugasan PIC oleh Superadmin",
            assignedAdminName: c.assigned_admin?.name,
            milestones: (c.tasks || []).map((task, idx) => ({
              step: `0${idx + 1}`,
              title: task.task_name,
              status: task.is_completed ? ("completed" as const) : idx === 0 ? ("in_progress" as const) : ("pending" as const),
              date: "Proses",
              description: task.task_name,
            })),
            deliverables: [],
            correspondences: [],
            clientDocuments: [],
          }));
      }
    } catch (err) {
      console.warn("Gagal memuat konsultasi backend admin tugas:", err);
    }

    const combined: ClientTicket[] = [...storedTickets];
    for (const b of backendTickets) {
      if (!combined.some((t) => t.id.toLowerCase() === b.id.toLowerCase())) {
        combined.push(b);
      }
    }

    setTickets(combined);
    setIsLoading(false);
  }, [activeAdminEmail, user?.name, normalizedUserRole]);

  useEffect(() => {
    loadData();
    window.addEventListener(TICKETS_UPDATED_EVENT, loadData);
    window.addEventListener(DOCUMENTS_UPDATED_EVENT, loadData);
    window.addEventListener("storage", loadData);
    return () => {
      window.removeEventListener(TICKETS_UPDATED_EVENT, loadData);
      window.removeEventListener(DOCUMENTS_UPDATED_EVENT, loadData);
      window.removeEventListener("storage", loadData);
    };
  }, [loadData]);

  // Admin aktif saat ini
  const activeStaffProfile = useMemo(() => {
    return (
      staffList.find((s) => s.email.toLowerCase() === activeAdminEmail.toLowerCase()) || {
        id: "ADM-001",
        name: user?.name || "Linda David, S.Ak., BKP",
        email: activeAdminEmail,
        nip: "ADM-001",
        phone: "+62 812-9876-1201",
        role: "admin" as const,
        divisions: ["Tax Service Core", "Accounting Service"],
        isActive: true,
      }
    );
  }, [staffList, activeAdminEmail, user?.name]);

  // Validasi URL Parameter ?id=... (Strict Authorization Enforcement)
  useEffect(() => {
    if (!urlTicketId) return;

    const res = getTicketByIdForStaff(urlTicketId, activeStaffProfile);
    if (!res.success) {
      // Tiket bukan tanggung jawab Admin ini -> Tolak akses & jangan bocorkan data
      setAccessDeniedMessage(
        res.error ||
          `Akses Ditolak: Anda tidak memiliki wewenang untuk mengakses tiket ${urlTicketId} karena ditugaskan kepada PIC lain.`
      );
      setSelectedTicket(null);
    } else if (res.ticket) {
      setSelectedTicket(res.ticket);
      setAccessDeniedMessage(null);
    }
  }, [urlTicketId, activeStaffProfile]);

  // Filter tiket milik admin
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchStatus =
        statusFilter === "ALL" ||
        t.status === statusFilter ||
        (statusFilter === "Dalam Proses" && t.status === "Ditugaskan");
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        t.id.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        (t.clientName && t.clientName.toLowerCase().includes(q)) ||
        (t.clientCompany && t.clientCompany.toLowerCase().includes(q));
      return matchStatus && matchSearch;
    });
  }, [tickets, statusFilter, searchQuery]);

  // Statistik Tugas
  const stats = useMemo(() => {
    const total = tickets.length;
    const inProgress = tickets.filter(
      (t) => t.status === "Dalam Proses" || t.status === "Ditugaskan"
    ).length;
    const waitingClient = tickets.filter((t) => t.status === "Menunggu Klien").length;
    const completed = tickets.filter((t) => t.status === "Selesai").length;
    return { total, inProgress, waitingClient, completed };
  }, [tickets]);


  // Kirim Seluruh Dokumen & Catatan dari dalam Lembar Kerja (Fleksibel: Status bisa diubah tanpa wajib kirim berkas atau catatan!)
  const handleSendDocFromDetail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    if (!canAdminAccessTicket(selectedTicket, activeStaffProfile)) {
      showToast("Akses ditolak: Anda tidak memiliki hak akses terhadap konsultasi ini.");
      return;
    }

    if (!detailSendFile && !detailDocNotes.trim() && !detailSyncStatus) {
      showToast("Silakan tentukan status konsultasi, catatan, atau pilih berkas dokumen.");
      return;
    }

    setIsSendingDetailDoc(true);

    try {
      const currentTicket = selectedTicket;
      const fileName = detailSendFile ? detailSendFile.name : "";
      const fileSize = detailSendFile
        ? `${(detailSendFile.size / (1024 * 1024)).toFixed(2)} MB`
        : "";
      const rawExt = fileName ? fileName.split(".").pop()?.toUpperCase() || "DOC" : "DOC";
      const fileType =
        rawExt === "XLSX" || rawExt === "XLS"
          ? "XLSX"
          : rawExt === "PDF"
          ? "PDF"
          : rawExt === "DOC" || rawExt === "DOCX"
          ? "DOC"
          : rawExt === "ZIP" || rawExt === "RAR"
          ? "ZIP"
          : rawExt;

      // 1. Simpan dokumen jika ada file yang diunggah
      if (detailSendFile) {
        addStoredDocument({
          id: `DOC-${Date.now()}`,
          ticketId: currentTicket.id,
          clientName: currentTicket.clientName || "Klien Terdaftar",
          clientEmail: currentTicket.clientEmail,
          clientNpwp: "01.234.567.8-012.000",
          fileName,
          fileSize,
          fileType,
          category: (currentTicket.category.includes("Pajak") || currentTicket.category.includes("Tax")
            ? "Tax Service Core"
            : currentTicket.category.includes("Akuntansi") || currentTicket.category.includes("Account")
            ? "Accounting Service"
            : currentTicket.category.includes("Legal") || currentTicket.category.includes("Hukum")
            ? "Legal"
            : "Business Financial Consulting") as
            | "Tax Service Core"
            | "Accounting Service"
            | "Business Financial Consulting"
            | "Legal",
          invoiceNumber: `INV-${currentTicket.id}`,
          amount: "Sesuai Kontrak Perikatan",
          billingStatus: "Terkirim",
          uploadDate: new Date().toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          consultant: activeStaffProfile.name,
          sha256: `SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        });
      }

      // 2. Susun pesan catatan korespondensi resmi
      let combinedMessage = "";
      if (detailSendFile && detailDocNotes.trim()) {
        combinedMessage = `[Pengiriman Dokumen: ${detailDocCategory}] Berkas: "${fileName}" (${fileSize}). Catatan Konsultan: ${detailDocNotes.trim()}`;
      } else if (detailSendFile) {
        combinedMessage = `[Pengiriman Dokumen: ${detailDocCategory}] Konsultan telah mengunggah berkas: "${fileName}" (${fileSize}). Berkas dapat diunduh oleh Klien di dashboard.`;
      } else if (detailDocNotes.trim()) {
        combinedMessage = detailDocNotes.trim();
      } else if (detailSyncStatus) {
        combinedMessage = `Konsultan PIC memperbarui status konsultasi menjadi "${detailSyncStatus}".`;
      }

      // 3. Tentukan sinkronisasi status & progres jika admin memilih perubahan status
      const nextStatus = (detailSyncStatus as ConsultationStatus) || currentTicket.status;
      let nextProgress = currentTicket.progress;
      if (nextStatus === "Selesai") {
        nextProgress = 100;
      } else if (detailSyncStatus && detailSyncStatus !== currentTicket.status) {
        if (nextStatus === "Menunggu Klien") {
          nextProgress = currentTicket.progress >= 100 ? 50 : currentTicket.progress;
        } else if (nextStatus === "Dalam Proses") {
          nextProgress = currentTicket.progress >= 100 ? 75 : Math.max(currentTicket.progress, 50);
        }
      }

      // Sinkronkan tahapan pengerjaan kertas kerja jika status diubah
      let updatedMilestones: Milestone[] =
        currentTicket.milestones && currentTicket.milestones.length > 0
          ? currentTicket.milestones.map((m) => ({ ...m }))
          : [
              {
                step: "1",
                title: "Permohonan Diterima",
                status: "completed",
                date: formatConsultationDate(currentTicket.createdAt),
                description: "Permohonan konsultasi diterima dan sedang menunggu penetapan PIC oleh Superadmin.",
              },
              {
                step: "2",
                title: `PIC Ditetapkan: ${currentTicket.assignedAdminName || activeStaffProfile.name}`,
                status: "completed",
                date: formatConsultationDate(currentTicket.createdAt),
                description: "Superadmin menetapkan konsultan penanggung jawab kertas kerja.",
              },
              {
                step: "3",
                title: "Pengerjaan Kertas Kerja & Pembahasan",
                status: "in_progress",
                date: formatConsultationDate(currentTicket.createdAt),
                description: "Konsultan PIC sedang menyusun kertas kerja, rekonsiliasi, serta analisis kepatuhan.",
              },
              {
                step: "4",
                title: "Konsultasi Selesai & Laporan Final",
                status: "pending",
                date: "-",
                description: "Penyampaian deliverable akhir dan penutupan perikatan konsultasi.",
              },
            ];

      if (detailSyncStatus) {
        const stepsToComplete = Math.round((nextProgress / 100) * updatedMilestones.length);
        updatedMilestones.forEach((m, idx) => {
          if (idx < stepsToComplete) {
            m.status = "completed";
            if (!m.date || m.date === "-") {
              m.date = formatConsultationDate(new Date().toISOString());
            }
          } else if (idx === stepsToComplete && nextProgress < 100) {
            m.status = "in_progress";
          } else {
            m.status = "pending";
          }
        });
      }

      const updateRes = updateTicketByStaff(currentTicket.id, activeStaffProfile, {
        status: nextStatus,
        progress: nextProgress,
        milestones: updatedMilestones,
        notes: combinedMessage,
      });

      if (updateRes.success && updateRes.ticket) {
        // Sinkronkan ke sharedTicketsStorage
        const allTickets = getStoredClientTickets();
        const tIdx = allTickets.findIndex((t) => t.id.toLowerCase() === currentTicket.id.toLowerCase());
        if (tIdx !== -1) {
          allTickets[tIdx].milestones = updatedMilestones;
          allTickets[tIdx].progress = nextProgress;
          allTickets[tIdx].status = nextStatus;
          saveStoredClientTickets(allTickets);
        }

        setSelectedTicket({
          ...updateRes.ticket,
          milestones: updatedMilestones,
          progress: nextProgress,
          status: nextStatus,
        });

        showToast(
          detailSendFile
            ? `Dokumen "${fileName}" dan status berhasil diperbarui.`
            : detailDocNotes.trim()
            ? `Catatan konsultan berhasil disimpan dan dikirimkan ke Klien.`
            : `Status konsultasi berhasil diperbarui menjadi "${nextStatus}".`
        );
        // Reset input form
        setDetailSendFile(null);
        setDetailDocNotes("");
        setDetailSyncStatus("");
        loadData();
      } else {
        showToast(updateRes.message || "Gagal memperbarui tiket.");
      }
    } catch (err) {
      console.error(err);
      showToast("Terjadi kendala saat memproses pembaruan.");
    } finally {
      setIsSendingDetailDoc(false);
    }
  };

  // Menandai tahapan pengerjaan kertas kerja secara langsung (1-klik langsung update progres & status)
  const handleToggleMilestone = (milestoneIdx: number) => {
    if (!selectedTicket) return;
    if (!canAdminAccessTicket(selectedTicket, activeStaffProfile)) {
      showToast("Akses ditolak: Anda tidak memiliki wewenang untuk tiket ini.");
      return;
    }

    const currentMilestones: Milestone[] =
      selectedTicket.milestones && selectedTicket.milestones.length > 0
        ? selectedTicket.milestones.map((m) => ({ ...m }))
        : [
            {
              step: "1",
              title: "Permohonan Diterima",
              status: "completed",
              date: formatConsultationDate(selectedTicket.createdAt),
              description: "Permohonan konsultasi diterima dan sedang menunggu penetapan PIC oleh Superadmin.",
            },
            {
              step: "2",
              title: `PIC Ditetapkan: ${selectedTicket.assignedAdminName || activeStaffProfile.name}`,
              status: "completed",
              date: formatConsultationDate(selectedTicket.createdAt),
              description: "Superadmin menetapkan konsultan penanggung jawab kertas kerja.",
            },
            {
              step: "3",
              title: "Pengerjaan Kertas Kerja & Pembahasan",
              status: selectedTicket.status === "Selesai" ? "completed" : "in_progress",
              date: formatConsultationDate(selectedTicket.createdAt),
              description: "Konsultan PIC sedang menyusun kertas kerja, rekonsiliasi, serta analisis kepatuhan.",
            },
            {
              step: "4",
              title: "Konsultasi Selesai & Laporan Final",
              status: selectedTicket.status === "Selesai" ? "completed" : "pending",
              date: selectedTicket.status === "Selesai" ? formatConsultationDate(selectedTicket.createdAt) : "-",
              description: "Penyampaian deliverable akhir dan penutupan perikatan konsultasi.",
            },
          ];

    const target = currentMilestones[milestoneIdx];
    const newStatus = target.status === "completed" ? "in_progress" : "completed";
    currentMilestones[milestoneIdx] = {
      ...target,
      status: newStatus,
      date: newStatus === "completed" ? formatConsultationDate(new Date().toISOString()) : target.date,
    };

    const completedCount = currentMilestones.filter((m) => m.status === "completed").length;
    const nextProgress = Math.round((completedCount / currentMilestones.length) * 100);

    let nextStatus: ConsultationStatus = selectedTicket.status;
    if (nextProgress === 100) {
      nextStatus = "Selesai";
    } else if (selectedTicket.status === "Selesai" && nextProgress < 100) {
      nextStatus = "Dalam Proses";
    } else if (nextProgress >= 50 && (selectedTicket.status === "Menunggu Penugasan" || selectedTicket.status === "Ditugaskan")) {
      nextStatus = "Dalam Proses";
    }

    const noteMsg = `Konsultan PIC memperbarui tahapan "${target.title}" menjadi ${newStatus === "completed" ? "Selesai" : "Sedang Berjalan"} (Progres: ${nextProgress}%).`;

    const res = updateTicketByStaff(selectedTicket.id, activeStaffProfile, {
      status: nextStatus,
      progress: nextProgress,
      milestones: currentMilestones,
      notes: noteMsg,
    });

    if (res.success && res.ticket) {
      const allTickets = getStoredClientTickets();
      const tIdx = allTickets.findIndex((t) => t.id.toLowerCase() === selectedTicket.id.toLowerCase());
      if (tIdx !== -1) {
        allTickets[tIdx].milestones = currentMilestones;
        allTickets[tIdx].progress = nextProgress;
        allTickets[tIdx].status = nextStatus;
        saveStoredClientTickets(allTickets);
      }

      setSelectedTicket({
        ...res.ticket,
        milestones: currentMilestones,
        progress: nextProgress,
        status: nextStatus,
      });
      loadData();
      showToast(`Tahapan "${target.title}" berhasil diperbarui. Progres: ${nextProgress}%`);
    } else {
      showToast(res.message || "Gagal memperbarui tahapan.");
    }
  };

  // Pembaruan Cepat Progres Konsultasi oleh PIC (1-Klik langsung sinkron tanpa perlu upload berkas / kirim catatan)
  const handleQuickProgressUpdate = (progressVal: number) => {
    if (!selectedTicket) return;
    if (!canAdminAccessTicket(selectedTicket, activeStaffProfile)) {
      showToast("Akses ditolak: Anda tidak memiliki wewenang untuk tiket ini.");
      return;
    }

    const currentMilestones: Milestone[] =
      selectedTicket.milestones && selectedTicket.milestones.length > 0
        ? selectedTicket.milestones.map((m) => ({ ...m }))
        : [
            {
              step: "1",
              title: "Permohonan Diterima",
              status: "completed",
              date: formatConsultationDate(selectedTicket.createdAt),
              description: "Permohonan konsultasi diterima dan sedang menunggu penetapan PIC oleh Superadmin.",
            },
            {
              step: "2",
              title: `PIC Ditetapkan: ${selectedTicket.assignedAdminName || activeStaffProfile.name}`,
              status: "completed",
              date: formatConsultationDate(selectedTicket.createdAt),
              description: "Superadmin menetapkan konsultan penanggung jawab kertas kerja.",
            },
            {
              step: "3",
              title: "Pengerjaan Kertas Kerja & Pembahasan",
              status: "in_progress",
              date: formatConsultationDate(selectedTicket.createdAt),
              description: "Konsultan PIC sedang menyusun kertas kerja, rekonsiliasi, serta analisis kepatuhan.",
            },
            {
              step: "4",
              title: "Konsultasi Selesai & Laporan Final",
              status: "pending",
              date: "-",
              description: "Penyampaian deliverable akhir dan penutupan perikatan konsultasi.",
            },
          ];

    // Sinkronkan tahapan berdasarkan progressVal
    const totalSteps = currentMilestones.length;
    const stepsToComplete = Math.round((progressVal / 100) * totalSteps);

    currentMilestones.forEach((m, idx) => {
      if (idx < stepsToComplete) {
        m.status = "completed";
        if (!m.date || m.date === "-") {
          m.date = formatConsultationDate(new Date().toISOString());
        }
      } else if (idx === stepsToComplete && progressVal < 100) {
        m.status = "in_progress";
      } else {
        m.status = "pending";
      }
    });

    let nextStatus: ConsultationStatus = selectedTicket.status;
    if (progressVal === 100) {
      nextStatus = "Selesai";
    } else if (selectedTicket.status === "Selesai" && progressVal < 100) {
      nextStatus = "Dalam Proses";
    } else if (progressVal >= 50 && (selectedTicket.status === "Menunggu Penugasan" || selectedTicket.status === "Ditugaskan")) {
      nextStatus = "Dalam Proses";
    }

    const noteMsg = `Konsultan PIC memperbarui progres konsultasi menjadi ${progressVal}% (${nextStatus}).`;

    const res = updateTicketByStaff(selectedTicket.id, activeStaffProfile, {
      status: nextStatus,
      progress: progressVal,
      milestones: currentMilestones,
      notes: noteMsg,
    });

    if (res.success && res.ticket) {
      const allTickets = getStoredClientTickets();
      const tIdx = allTickets.findIndex((t) => t.id.toLowerCase() === selectedTicket.id.toLowerCase());
      if (tIdx !== -1) {
        allTickets[tIdx].milestones = currentMilestones;
        allTickets[tIdx].progress = progressVal;
        allTickets[tIdx].status = nextStatus;
        saveStoredClientTickets(allTickets);
      }

      setSelectedTicket({
        ...res.ticket,
        milestones: currentMilestones,
        progress: progressVal,
        status: nextStatus,
      });
      loadData();
      showToast(`Progres konsultasi berhasil diperbarui menjadi ${progressVal}% (${nextStatus}).`);
    } else {
      showToast(res.message || "Gagal memperbarui progres.");
    }
  };

  // Unduh dokumen pendukung klien (dengan verifikasi otorisasi PIC)
  const handleDownloadClientDoc = (fileName: string, clientName?: string, ticketId?: string, downloadUrl?: string) => {
    if (ticketId) {
      const authCheck = getTicketByIdForStaff(ticketId, activeStaffProfile);
      if (!authCheck.success) {
        showToast("Akses ditolak: Anda tidak memiliki hak akses mengunduh dokumen dari tiket ini.");
        return;
      }
    }
    if (downloadUrl && downloadUrl !== "#" && (downloadUrl.startsWith("http") || downloadUrl.startsWith("data:") || downloadUrl.startsWith("blob:"))) {
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast(`Dokumen "${fileName}" berhasil diunduh.`);
      return;
    }
    const content = `======================================================
ZHOU CONSULTING - DIGITAL AUDIT DOKUMEN PENDUKUNG KLIEN
======================================================
Dokumen      : ${fileName}
Pengunggah   : ${clientName || "Klien Terdaftar"}
Waktu Unduh  : ${new Date().toLocaleString("id-ID")}
PIC Bertugas : ${activeStaffProfile.name}
Kerahasiaan  : Dilindungi Ketentuan NDA Zhou Consulting
======================================================`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName.endsWith(".pdf") ? fileName.replace(".pdf", ".txt") : fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`Dokumen "${fileName}" berhasil diunduh untuk peninjauan.`);
  };

  // Klik langsung berkas klien dari tabel (langsung unduh berkas yang dikirim klien tanpa buka modal detail)
  const handleDirectClientDocClick = (ticket: ClientTicket) => {
    if (!ticket.clientDocuments || ticket.clientDocuments.length === 0) {
      showToast("Klien belum mengunggah dokumen pendukung untuk penugasan ini.");
      return;
    }

    ticket.clientDocuments.forEach((doc, idx) => {
      setTimeout(() => {
        handleDownloadClientDoc(
          doc.name,
          doc.uploadedBy || ticket.clientName,
          ticket.id,
          doc.downloadUrl
        );
      }, idx * 250);
    });
  };

  // Helper Badge Status
  const renderStatusBadge = (status: ConsultationStatus | string) => {
    switch (status) {
      case "Ditugaskan":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
            Ditugaskan
          </span>
        );
      case "Dalam Proses":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">
            Dalam Proses
          </span>
        );
      case "Menunggu Klien":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
            Menunggu Klien
          </span>
        );
      case "Selesai":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            Selesai
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-300">
            {status}
          </span>
        );
    }
  };


  // Render Tampilan Penuh Detail Lembar Kerja Konsultasi (Identik dengan Detail Konsultasi Klien)
  const renderDetailView = () => {
    if (!selectedTicket) return null;

    const milestonesList: Milestone[] =
      selectedTicket.milestones && selectedTicket.milestones.length > 0
        ? selectedTicket.milestones
        : [
            {
              step: "1",
              title: "Permohonan Diterima",
              status: "completed",
              date: formatConsultationDate(selectedTicket.createdAt),
              description: "Permohonan konsultasi diterima dan sedang menunggu penetapan PIC oleh Superadmin.",
            },
            {
              step: "2",
              title: `PIC Ditetapkan: ${selectedTicket.assignedAdminName || activeStaffProfile.name}`,
              status: "completed",
              date: formatConsultationDate(selectedTicket.createdAt),
              description: "Superadmin menetapkan konsultan penanggung jawab kertas kerja.",
            },
            {
              step: "3",
              title: "Pengerjaan Kertas Kerja & Pembahasan",
              status: selectedTicket.status === "Selesai" ? "completed" : "in_progress",
              date: formatConsultationDate(selectedTicket.createdAt),
              description: "Konsultan PIC sedang menyusun kertas kerja, rekonsiliasi, serta analisis kepatuhan.",
            },
            {
              step: "4",
              title: "Konsultasi Selesai & Laporan Final",
              status: selectedTicket.status === "Selesai" ? "completed" : "pending",
              date: selectedTicket.status === "Selesai" ? formatConsultationDate(selectedTicket.createdAt) : "-",
              description: "Penyampaian deliverable akhir dan penutupan perikatan konsultasi.",
            },
          ];

    const completedMilestones = milestonesList.filter((m) => m.status === "completed").length;
    const calculatedProgress =
      selectedTicket.status === "Selesai" || (selectedTicket.status as string) === "Completed"
        ? 100
        : Math.round((completedMilestones / milestonesList.length) * 100);

    return (
      <div className="space-y-5 animate-in fade-in duration-150">
        {/* Top Breadcrumb & Tombol Kembali */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-primary-light">
          <button
            type="button"
            onClick={() => {
              setSelectedTicket(null);
              router.push("/dashboard/admin/tugas");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:text-primary-dark transition-colors bg-white px-3.5 py-2 rounded-xl border border-primary-light shadow-2xs hover:bg-surface cursor-pointer w-fit"
          >
            <ChevronLeftIcon className="text-xs" />
            <span>Kembali ke Daftar Tugas Saya</span>
          </button>
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span>Menu Lembar Kerja</span>
            <span>&rsaquo;</span>
            <span className="font-mono font-bold text-primary">{selectedTicket.id}</span>
          </div>
        </div>

        {/* Container Utama Detail Konsultasi */}
        <Card className="rounded-2xl border-primary-light bg-white shadow-xs overflow-hidden">
          {/* Header Card */}
          <CardHeader className="p-5 sm:p-6 border-b border-primary-light bg-surface/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2 flex-1 min-w-0">
                {/* Baris Badge: ID, Status, Divisi */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-primary bg-white border border-primary-light px-2.5 py-0.5 rounded-md shadow-2xs">
                    {selectedTicket.id}
                  </span>
                  {renderStatusBadge(selectedTicket.status)}
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-white text-text-secondary border border-primary-light">
                    Divisi: {selectedTicket.category}
                  </span>
                </div>

                {/* Judul Kebutuhan Konsultasi */}
                <h2 className="text-lg sm:text-xl font-bold text-primary tracking-tight">
                  {selectedTicket.title}
                </h2>

                {/* Metadata PIC, Tanggal Pengajuan, Entitas */}
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-text-secondary">
                  <div className="flex items-center gap-1.5">
                    <span className="text-text-muted">PIC Bertugas:</span>
                    <span className="font-semibold text-primary">
                      {selectedTicket.assignedAdminName || activeStaffProfile.name}
                      {selectedTicket.assignedAdminDivision ? ` (${selectedTicket.assignedAdminDivision})` : ""}
                    </span>
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
                  {selectedTicket.clientName && (
                    <>
                      <span className="text-text-muted select-none">•</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-text-muted">Klien:</span>
                        <span className="font-medium text-text-primary">{selectedTicket.clientName}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Indikator Penyelesaian Dinamis & Quick 1-Click Update */}
              <div className="flex flex-col sm:items-end gap-2.5 shrink-0">
                <div className="flex items-center gap-3 bg-white px-3.5 py-2 rounded-xl border border-primary-light shadow-2xs">
                  <div className="text-right">
                    <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider block">Penyelesaian</span>
                    <span className="text-sm font-bold text-primary font-mono">{calculatedProgress}%</span>
                  </div>
                  <div className="w-24 bg-surface border border-primary-light h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        calculatedProgress === 100 ? "bg-emerald-500" : "bg-primary"
                      }`}
                      style={{ width: `${calculatedProgress}%` }}
                    />
                  </div>
                </div>

                {/* Tombol 1-Klik Cepat Update Progres (Tanpa Perlu Kirim Catatan / Berkas) */}
                <div className="flex items-center gap-1 bg-surface/90 p-1 rounded-xl border border-primary-light shadow-2xs">
                  <span className="text-[10px] font-bold text-text-secondary px-1.5 hidden sm:inline">Set Progres:</span>
                  {[25, 50, 75, 100].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleQuickProgressUpdate(val)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        calculatedProgress === val
                          ? "bg-primary text-white shadow-2xs scale-105"
                          : "bg-white text-text-secondary hover:text-primary hover:bg-surface border border-primary-light"
                      }`}
                      title={`Klik untuk langsung mengubah progres konsultasi menjadi ${val}%`}
                    >
                      {val === 100 ? "100% Selesai ✓" : `${val}%`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>

          {/* Konten 2 Kolom Seimbang pada Desktop */}
          <CardContent className="p-5 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* KOLOM KIRI (lg:col-span-5): Uraian Kebutuhan & Tahapan Pengerjaan Kertas Kerja */}
              <div className="lg:col-span-5 space-y-5">
                {/* 1. Uraian Kebutuhan Klien */}
                <div className="p-4 rounded-xl border border-primary-light bg-surface/40 space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-primary-light/60">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                      Uraian Kebutuhan Klien
                    </h4>
                    <span className="text-[10px] text-text-muted">
                      Pengaju: <strong className="text-primary font-medium">{selectedTicket.clientName || "Klien Terdaftar"}</strong>
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



                {/* 2. Tahapan Pengerjaan Kertas Kerja (Interactive untuk PIC) */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                        Tahapan Pengerjaan Kertas Kerja
                      </h4>
                      <p className="text-[11px] text-text-muted">
                        Klik tombol untuk menandai kemajuan kertas kerja
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold text-text-muted">
                      {completedMilestones} dari {milestonesList.length} Selesai
                    </span>
                  </div>

                  <div className="divide-y divide-primary-light/60 border border-primary-light rounded-xl overflow-hidden bg-white shadow-2xs">
                    {milestonesList.map((m, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 flex items-start gap-3 hover:bg-surface/30 transition-colors"
                      >
                        <button
                          type="button"
                          onClick={() => handleToggleMilestone(idx)}
                          className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold cursor-pointer transition-transform hover:scale-110 ${
                            m.status === "completed"
                              ? "bg-emerald-600 text-white shadow-2xs"
                              : m.status === "in_progress"
                              ? "bg-primary text-white shadow-2xs"
                              : "bg-surface border border-primary-light text-text-muted hover:border-primary hover:text-primary"
                          }`}
                          title={m.status === "completed" ? "Klik untuk membatalkan" : "Klik untuk menandai selesai"}
                        >
                          {m.status === "completed" ? <CheckIcon className="text-[10px]" /> : m.step}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-primary text-xs">{m.title}</span>
                            <span className="text-[10px] text-text-muted font-mono">{m.date}</span>
                          </div>
                          <p className="text-[11px] text-text-secondary mt-0.5 leading-relaxed">{m.description}</p>
                          
                          {/* Badge Status & Aksi Cepat Menandai */}
                          <div className="mt-2 flex items-center justify-between gap-2">
                            <span
                              className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                m.status === "completed"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : m.status === "in_progress"
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : "bg-slate-100 text-slate-500 border border-slate-200"
                              }`}
                            >
                              {m.status === "completed"
                                ? "Selesai"
                                : m.status === "in_progress"
                                ? "Sedang Berjalan"
                                : "Belum Dimulai"}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleToggleMilestone(idx)}
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded cursor-pointer transition-colors ${
                                m.status === "completed"
                                  ? "text-text-muted hover:text-amber-700 hover:bg-amber-50"
                                  : "text-primary hover:bg-primary-light bg-surface"
                              }`}
                            >
                              {m.status === "completed" ? "Batalkan Selesai" : "Tandai Selesai ✓"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* KOLOM KANAN (lg:col-span-7): Dokumen & Form PIC */}
              <div className="lg:col-span-7 space-y-5">
                {/* 1. Dokumen Deliverable dari Admin / Konsultan */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                      Dokumen Deliverable dari Admin / Konsultan
                    </h4>
                    <span className="text-[11px] font-semibold text-text-secondary">
                      {selectedTicket.deliverables?.length || 0} Berkas
                    </span>
                  </div>

                  {(!selectedTicket.deliverables || selectedTicket.deliverables.length === 0) ? (
                    <div className="p-4 rounded-xl border border-dashed border-primary-light bg-surface/30 text-center space-y-1">
                      <p className="text-xs font-semibold text-primary">Belum ada berkas deliverable terkirim</p>
                      <p className="text-[11px] text-text-secondary max-w-sm mx-auto">
                        Unggah hasil kertas kerja atau laporan pada formulir di bawah ini agar dapat diunduh oleh Klien.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-primary-light/60 border border-primary-light rounded-xl overflow-hidden bg-white shadow-2xs">
                      {selectedTicket.deliverables.map((d, dIdx) => (
                        <div key={dIdx} className="p-3 flex items-center justify-between gap-3 hover:bg-surface/30 transition-colors">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs shrink-0 font-bold">
                              <DocumentIcon className="text-sm" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-primary text-xs truncate">{d.name}</p>
                              <p className="text-[10px] text-text-muted mt-0.5">{d.size} • {d.date}</p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadClientDoc(d.name, "Konsultan PIC", selectedTicket.id, d.downloadUrl)}
                            className="text-xs h-7 px-2.5 font-medium shrink-0"
                          >
                            Unduh
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Dokumen Pendukung dari Klien */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                      Dokumen Pendukung dari Klien
                    </h4>
                    <span className="text-[11px] font-semibold text-text-secondary">
                      {selectedTicket.clientDocuments?.length || 0} Berkas
                    </span>
                  </div>

                  {(!selectedTicket.clientDocuments || selectedTicket.clientDocuments.length === 0) ? (
                    <div className="p-4 rounded-xl border border-dashed border-primary-light bg-surface/30 text-center text-xs text-text-muted">
                      Belum ada dokumen pendukung yang dilampirkan oleh klien pada konsultasi ini.
                    </div>
                  ) : (
                    <div className="divide-y divide-primary-light/60 border border-primary-light rounded-xl overflow-hidden bg-white shadow-2xs">
                      {selectedTicket.clientDocuments.map((doc, docIdx) => (
                        <div key={docIdx} className="p-3 flex items-center justify-between gap-3 hover:bg-surface/30 transition-colors">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-primary shrink-0">
                              <DocumentIcon className="text-sm" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-primary text-xs truncate">{doc.name}</p>
                              <p className="text-[10px] text-text-muted mt-0.5">{doc.size}</p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadClientDoc(doc.name, doc.uploadedBy, selectedTicket.id, doc.downloadUrl)}
                            className="text-xs h-7 px-2.5 font-medium shrink-0"
                          >
                            Unduh
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. Form Kirim Dokumen & Perbarui Status (Fleksibel: Status bisa diubah langsung tanpa file!) */}
                <div className="p-4 sm:p-5 bg-surface/40 rounded-xl border border-primary-light space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-primary-light/60">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                        Kirim Dokumen &amp; Perbarui Status
                      </h4>
                      <p className="text-[11px] text-text-muted mt-0.5">
                        Pilih status baru, kirim catatan, atau lampirkan berkas deliverable
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSendDocFromDetail} className="space-y-3.5 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="detail-doc-category" className="text-[11px] font-semibold text-text-secondary block">
                          Kategori Dokumen
                        </Label>
                        <Select
                          id="detail-doc-category"
                          value={detailDocCategory}
                          onChange={(e) => setDetailDocCategory(e.target.value)}
                          className="w-full text-xs h-9 bg-white"
                        >
                          <option value="Kertas Kerja & Laporan Akhir">Kertas Kerja &amp; Laporan Akhir</option>
                          <option value="Draft Dokumen / Laporan Sementara">Draft Dokumen / Laporan Sementara</option>
                          <option value="Kertas Kerja Rekonsiliasi & Perhitungan">Kertas Kerja Rekonsiliasi &amp; Perhitungan</option>
                          <option value="Draft Tanggapan SP2DK DJP">Draft Tanggapan SP2DK DJP</option>
                          <option value="Dokumen Klarifikasi & Permintaan Data">Dokumen Klarifikasi &amp; Permintaan Data</option>
                          <option value="Bukti Setor / Bukti Lapor Pajak (BPE/NTPN)">Bukti Setor / Lapor Pajak (BPE/NTPN)</option>
                          <option value="Surat Kuasa & Dokumen Legalitas">Surat Kuasa &amp; Dokumen Legalitas</option>
                          <option value="Dokumen Pendukung Lainnya">Dokumen Pendukung Lainnya</option>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="detail-sync-status" className="text-[11px] font-semibold text-text-secondary block">
                          Status Konsultasi
                        </Label>
                        <Select
                          id="detail-sync-status"
                          value={detailSyncStatus}
                          onChange={(e) => setDetailSyncStatus(e.target.value)}
                          className="w-full text-xs h-9 bg-white"
                        >
                          <option value="">Tetap ({selectedTicket.status})</option>
                          <option value="Dalam Proses">Dalam Proses</option>
                          <option value="Menunggu Klien">Menunggu Klien</option>
                          <option value="Selesai">Selesai</option>
                        </Select>
                      </div>
                    </div>

                    {/* Dropzone File Dokumen */}
                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold text-text-secondary block">
                        Berkas Dokumen (Opsional)
                      </Label>
                      <input
                        type="file"
                        id="detail-file-input"
                        accept=".pdf,.xlsx,.xls,.doc,.docx,.zip,.rar,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) setDetailSendFile(f);
                        }}
                        className="hidden"
                      />

                      {detailSendFile ? (
                        <div className="p-3 bg-white rounded-xl border border-primary-light flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-primary shrink-0">
                              <DocumentIcon className="text-sm" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-primary text-xs truncate">
                                {detailSendFile.name}
                              </p>
                              <p className="text-[10px] text-text-muted">
                                {(detailSendFile.size / (1024 * 1024)).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <label
                              htmlFor="detail-file-input"
                              className="h-7 px-2.5 bg-surface hover:bg-primary-light text-primary rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              Ganti
                            </label>
                            <button
                              type="button"
                              onClick={() => setDetailSendFile(null)}
                              className="h-7 px-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                              title="Batal pilih file"
                            >
                              <CloseIcon className="text-[10px]" />
                              <span>Hapus</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label
                          htmlFor="detail-file-input"
                          className="flex flex-col items-center justify-center p-4 bg-white border-2 border-dashed border-primary-light hover:border-primary rounded-xl cursor-pointer transition-colors group"
                        >
                          <div className="w-9 h-9 rounded-full bg-surface group-hover:bg-primary/10 text-primary flex items-center justify-center mb-1.5 transition-colors">
                            <UploadIcon className="text-sm" />
                          </div>
                          <span className="text-xs font-semibold text-primary">
                            Pilih Berkas Dokumen
                          </span>
                          <span className="text-[10px] text-text-muted mt-0.5">
                            Klik untuk memilih berkas (.pdf, .xlsx, .docx, .zip, gambar)
                          </span>
                        </label>
                      )}
                    </div>

                    {/* Kolom Catatan Konsultan */}
                    <div className="space-y-1">
                      <Label htmlFor="detail-doc-notes" className="text-[11px] font-semibold text-text-secondary block">
                        Kolom Catatan Konsultan (Opsional)
                      </Label>
                      <Textarea
                        id="detail-doc-notes"
                        placeholder="Tuliskan catatan kemajuan pengerjaan atau pesan untuk klien..."
                        value={detailDocNotes}
                        onChange={(e) => setDetailDocNotes(e.target.value)}
                        rows={2}
                        className="text-xs bg-white resize-y"
                      />
                    </div>

                    {/* Tombol Simpan & Kirim */}
                    <div className="flex items-center justify-end gap-2.5 pt-2">
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        disabled={isSendingDetailDoc || (!detailSendFile && !detailDocNotes.trim() && !detailSyncStatus)}
                        className="text-xs font-semibold px-4 h-9 shadow-xs cursor-pointer"
                      >
                        <SendIcon className="mr-1.5 text-xs" />
                        {isSendingDetailDoc
                          ? "Menyimpan..."
                          : detailSendFile
                          ? "Kirim Dokumen & Perbarui Status"
                          : detailSyncStatus && !detailDocNotes.trim()
                          ? "Perbarui Status Konsultasi"
                          : detailSyncStatus && detailDocNotes.trim()
                          ? "Kirim Catatan & Perbarui Status"
                          : "Kirim Catatan Konsultan"}
                      </Button>
                    </div>
                  </form>
                </div>

                {/* 4. Catatan Terbaru dari Tim Penugasan */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                    Catatan Terbaru dari Tim Penugasan
                  </h4>
                  {(!selectedTicket.correspondences || selectedTicket.correspondences.length === 0) ? (
                    <div className="p-4 rounded-xl border border-dashed border-primary-light bg-surface/30 text-center text-xs text-text-muted">
                      Belum ada riwayat catatan atau korespondensi pada konsultasi ini.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedTicket.correspondences.map((c) => (
                        <div key={c.id} className="p-3 bg-white rounded-xl border border-primary-light shadow-2xs text-xs space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-text-muted">
                            <span className="font-bold text-primary">{c.sender} <span className="font-normal text-text-secondary">({c.role})</span></span>
                            <span className="font-mono">{c.date}</span>
                          </div>
                          <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-line">{c.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0B1533] text-white px-5 py-3 rounded-xl shadow-xl border border-primary-light flex items-center gap-3 text-xs animate-in fade-in slide-in-from-bottom-2">
          <CheckCircleIcon className="text-emerald-400 text-sm shrink-0" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-silver hover:text-white ml-2 p-1"
          >
            <CloseIcon className="text-xs" />
          </button>
        </div>
      )}

      {selectedTicket ? (
        /* TAMPILAN FULL DETAIL LEMBAR KERJA (IDENTIK DENGAN DETAIL KONSULTASI KLIEN) */
        renderDetailView()
      ) : (
        /* TAMPILAN DAFTAR PENUGASAN (METRIC CARDS + TABEL) */
        <>
          {/* Header & Page Title */}
          <div className="pb-4 border-b border-primary-light">
            <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
              Lembar Kerja
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              Daftar konsultasi yang ditugaskan khusus kepada Anda oleh Superadmin. Kelola pengerjaan kertas kerja, pantau dokumen klien, dan terbitkan berkas deliverable.
            </p>
          </div>

          {/* METRIC CARDS TUGAS SAYA */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Card className="p-4 sm:p-5 rounded-2xl border-primary-light bg-white shadow-xs">
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">
                Total Tugas Saya
              </span>
              <div className="mt-2 text-2xl font-bold text-primary font-mono">{stats.total}</div>
              <div className="text-[10px] text-text-secondary mt-1">Konsultasi ditugaskan</div>
            </Card>

            <Card className="p-4 sm:p-5 rounded-2xl border-indigo-200 bg-indigo-50/40 shadow-xs">
              <span className="text-[10px] text-indigo-900 font-bold uppercase tracking-wider block">
                Dalam Proses
              </span>
              <div className="mt-2 text-2xl font-bold text-indigo-800 font-mono">
                {stats.inProgress}
              </div>
              <div className="text-[10px] text-indigo-700 mt-1">Dalam pengerjaan aktif</div>
            </Card>

            <Card className="p-4 sm:p-5 rounded-2xl border-purple-200 bg-purple-50/40 shadow-xs">
              <span className="text-[10px] text-purple-900 font-bold uppercase tracking-wider block">
                Menunggu Respon Klien
              </span>
              <div className="mt-2 text-2xl font-bold text-purple-800 font-mono">
                {stats.waitingClient}
              </div>
              <div className="text-[10px] text-purple-700 mt-1">Konfirmasi berkas klien</div>
            </Card>

            <Card className="p-4 sm:p-5 rounded-2xl border-emerald-200 bg-emerald-50/40 shadow-xs">
              <span className="text-[10px] text-emerald-900 font-bold uppercase tracking-wider block">
                Selesai
              </span>
              <div className="mt-2 text-2xl font-bold text-emerald-800 font-mono">
                {stats.completed}
              </div>
              <div className="text-[10px] text-emerald-700 mt-1">Deliverable tuntas</div>
            </Card>
          </div>

          {/* TABEL PENUGASAN SAYA */}
          <Card className="rounded-2xl border-primary-light bg-white p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-primary">Daftar Tugas</h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  Daftar perikatan konsultasi aktif yang menjadi tanggung jawab Anda sebagai PIC. Klik &quot;Buka Lembar Kerja&quot; untuk memproses tugas.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-2.5 text-text-muted text-xs" />
                  <Input
                    type="text"
                    placeholder="Cari nomor tiket, judul atau klien..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 text-xs h-9 w-52 sm:w-64 bg-surface border-primary-light"
                  />
                </div>

                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs h-9 min-w-[130px]"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="Dalam Proses">Dalam Proses</option>
                  <option value="Menunggu Klien">Menunggu Klien</option>
                  <option value="Selesai">Selesai</option>
                </Select>
              </div>
            </div>

            {/* Tabel Konsultasi PIC */}
            <div className="overflow-x-auto rounded-xl border border-primary-light">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface text-text-muted font-bold uppercase text-[10px] tracking-wider border-b border-primary-light">
                  <tr>
                    <th className="py-3 px-4 text-center">Kode &amp; Judul Tugas</th>
                    <th className="py-3 px-4 text-center">Klien &amp; Entitas</th>
                    <th className="py-3 px-4 text-center">Kategori Layanan</th>
                    <th className="py-3 px-4 text-center">Status &amp; Progres</th>
                    <th className="py-3 px-4 text-center">Dokumen</th>
                    <th className="py-3 px-4 text-center">Estimasi Selesai</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-light">
                  {filteredTickets.map((ticket) => {
                    const clientDocCount = ticket.clientDocuments?.length || 0;
                    const deliverableCount = ticket.deliverables?.length || 0;
                    const totalDoc = clientDocCount + deliverableCount;

                    return (
                      <tr key={ticket.id} className="hover:bg-surface/60 transition-colors">
                        <td className="py-3.5 px-4 font-medium text-primary">
                          <span className="font-mono text-[10px] text-text-muted block">
                            {ticket.id}
                          </span>
                          <span className="font-semibold text-xs text-primary block max-w-xs truncate">
                            {ticket.title}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-primary block">
                            {ticket.clientName || "Klien Terdaftar"}
                          </span>
                          <span className="text-[11px] text-text-secondary block">
                            {ticket.clientCompany || ticket.clientEmail || "-"}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-text-secondary">
                          <span className="block font-medium text-primary">
                            {ticket.category}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex flex-col gap-1 items-start">
                            {renderStatusBadge(ticket.status)}
                            <div className="w-24 bg-surface rounded-full h-1.5 overflow-hidden border border-primary-light">
                              <div
                                className={`h-full rounded-full ${
                                  ticket.status === "Selesai"
                                    ? "bg-emerald-500"
                                    : ticket.status === "Menunggu Klien"
                                    ? "bg-blue-500"
                                    : "bg-primary"
                                }`}
                                style={{ width: `${ticket.progress || 0}%` }}
                              />
                            </div>
                            <span className="text-[9px] text-text-muted font-mono">
                              {ticket.progress || 0}% selesai
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-text-secondary text-[11px]">
                          <div>{totalDoc} Berkas</div>
                          {clientDocCount > 0 && (
                            <span className="text-[10px] text-text-muted">
                              {clientDocCount} dari klien
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-text-secondary text-[11px]">
                          <div>{ticket.estimatedCompletion || "Menunggu Penetapan PIC"}</div>
                          <div className="text-[10px] text-text-muted">
                            Masuk: {formatConsultationDate(ticket.createdAt)}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              setSelectedTicket(ticket);
                              router.push(`/dashboard/admin/tugas?id=${encodeURIComponent(ticket.id)}`);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="text-xs font-semibold px-3.5 py-1.5 bg-[#0B1533] hover:bg-[#0B1533]/90 text-white rounded-xl shadow-2xs cursor-pointer"
                          >
                            Buka Lembar Kerja
                          </Button>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredTickets.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-text-secondary text-xs">
                        <div className="max-w-sm mx-auto space-y-2">
                          <LockIcon className="mx-auto text-xl text-text-muted" />
                          <p className="font-semibold text-primary">
                            {isLoading
                              ? "Memuat penugasan konsultasi..."
                              : "Tidak Ada Konsultasi yang Ditugaskan"}
                          </p>
                          <p className="text-[11px] text-text-secondary">
                            Hanya konsultasi yang ditugaskan kepada <strong>{activeStaffProfile.name}</strong> oleh Superadmin yang akan ditampilkan di sini.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* MODAL KEAMANAN: AKSES DITOLAK (OTORISASI PIC GAGAL) */}
      {accessDeniedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-rose-300 max-w-md w-full p-6 space-y-4 relative text-center">
            <button
              type="button"
              onClick={() => {
                setAccessDeniedMessage(null);
                router.replace("/dashboard/admin/tugas");
              }}
              className="absolute top-4 right-4 text-text-muted hover:text-primary p-1 cursor-pointer"
            >
              <CloseIcon className="text-sm" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 mx-auto flex items-center justify-center text-xl">
              <LockIcon />
            </div>

            <div>
              <h3 className="text-base font-bold text-rose-950">
                Akses Dibatasi Wewenang PIC Tidak Sesuai
              </h3>
              <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                {accessDeniedMessage}
              </p>
            </div>

            <div className="p-3 bg-surface rounded-xl border border-primary-light text-left text-[11px] text-text-secondary space-y-1">
              <span className="font-semibold text-primary block">Kebijakan Hak Akses PIC:</span>
              <p>
                Sistem Zhou Consulting secara ketat membatasi akses setiap Admin. Anda hanya berwenang melihat, mengelola, dan mengunduh berkas pada tiket yang secara resmi ditugaskan kepada Anda oleh Superadmin.
              </p>
            </div>

            <div className="pt-2">
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => {
                  setAccessDeniedMessage(null);
                  router.replace("/dashboard/admin/tugas");
                }}
                className="w-full text-xs font-semibold"
              >
                Kembali ke Daftar Tugas Saya
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminTugasSayaPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-text-secondary text-xs">
          Memuat daftar penugasan admin...
        </div>
      }
    >
      <AdminTugasSayaContent />
    </Suspense>
  );
}
