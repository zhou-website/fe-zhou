"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth, isDummyTicket, normalizeRole } from "@/context/AuthContext";
import { adminApi, clientApi, ConsultationItem } from "@/lib/api";
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
import { downloadBlob, downloadRemoteFile, generateDocumentPdfBlob } from "@/lib/downloadHelper";

import {
  canAdminAccessTicket,
  getTicketByIdForStaff,
  getStoredStaffAdmins,
  getStoredClientTickets,
  formatConsultationDate,
  formatTicketDescription,
  resolveConsultationCategory,
  ClientTicket,
  StaffAdminProfile,
  ConsultationStatus,
  Milestone,
  addAdminDeliverableToTicket,
  cacheFileBlob,
  getCachedFileBlobAsync,
  formatCorrespondenceMessage,
  updateStoredClientTicketProgress,
  mergeTicketsWithLocalOverrides,
  sortAndNormalizeMilestones,
  getMilestoneRank,
  formatConsultantNoteForStorage,
  appendConsultantNoteToDescription,
  extractCorrespondencesFromDescription,
  extractAssignmentNotesFromDescription,
  extractSuperadminInstructions,
} from "@/data/sharedTicketsStorage";

function AdminTugasSayaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlTicketId = searchParams.get("id");

  const { user } = useAuth();
  const normalizedUserRole = normalizeRole(user?.role, user?.email);

  // Inisialisasi daftar staf admin lokal hanya satu kali saat mount (mencegah loop re-render)
  const [staffList, setStaffList] = useState<StaffAdminProfile[]>(() =>
    typeof window !== "undefined" ? getStoredStaffAdmins() : []
  );
  // Profil Admin aktif (default: user login; atau admin terpilih jika superadmin sedang menguji)
  const [activeAdminEmail, setActiveAdminEmail] = useState<string>(user?.email || "admin@zhou.id");

  // Auto redirect superadmin ke portal superadmin
  useEffect(() => {
    if (normalizedUserRole === "superadmin") {
      router.replace("/dashboard/superadmin/perikatan");
    }
  }, [normalizedUserRole, router]);

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
  const [isSendingDetailDoc, setIsSendingDetailDoc] = useState(false);

  // Otomatis dedup agar dokumen deliverable resmi konsultan tidak pernah muncul ganda di dokumen pendukung klien
  const cleanClientDocuments = useMemo(() => {
    if (!selectedTicket?.clientDocuments) return [];
    const delivNames = new Set((selectedTicket.deliverables || []).map((d) => d.name.toLowerCase().trim()));
    const delivIds = new Set((selectedTicket.deliverables || []).map((d) => String(d.numericId || d.id)));
    return selectedTicket.clientDocuments.filter(
      (doc) => !delivNames.has(doc.name.toLowerCase().trim()) && !delivIds.has(String(doc.numericId || doc.id))
    );
  }, [selectedTicket?.clientDocuments, selectedTicket?.deliverables]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

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

  // Muat data penugasan langsung dari backend API
  const loadData = React.useCallback(async () => {
    setIsLoading(true);

    try {
      const res = await adminApi.getConsultations();
      if (res?.data && Array.isArray(res.data)) {
        const email = (activeAdminEmail || "").toLowerCase().trim();
        const userName = (user?.name || "").toLowerCase().trim();

        const validConsultations = res.data.filter((c: ConsultationItem) => !isDummyTicket(c));

        // Filter tiket yang ditugaskan ke admin aktif ini
        const assignedConsultations = validConsultations.filter((c: ConsultationItem) => {
          if (normalizedUserRole === "superadmin") return true;
          const assignedEmail = (c.assigned_admin?.email || "").toLowerCase().trim();
          const assignedName = (c.assigned_admin?.name || "").toLowerCase().trim();

          if (email && assignedEmail && assignedEmail === email) return true;
          if (userName && assignedName && (assignedName.includes(userName) || userName.includes(assignedName))) return true;
          return false; // Tiket hanya muncul jika sudah resmi ditugaskan kepada admin yang bersangkutan
        });

        const mappedTickets: ClientTicket[] = assignedConsultations.map((c: ConsultationItem) => {
          const isCompleted = c.status === "COMPLETED";
          const hasAssignedPic = Boolean(
            c.assigned_admin?.name ||
            c.assigned_to ||
            (c as unknown as { assigned_admin_id?: number }).assigned_admin_id
          );
          const progressVal =
            typeof c.progress_percent === "number" && !isNaN(c.progress_percent)
              ? c.progress_percent
              : isCompleted
              ? 100
              : hasAssignedPic
              ? Math.max(50, c.progress_percent || 0)
              : 35;

          // Urutkan task sesuai alur kerja kronologis (1: Intake/Verifikasi, 2: Penetapan PIC, 3: Analisis/Kertas Kerja, 4: Finalisasi/Hasil)
          const sortedRawTasks = (c.tasks && c.tasks.length > 0)
            ? sortAndNormalizeMilestones(c.tasks)
            : [];

          const taskMilestones: Milestone[] = sortedRawTasks.length > 0
            ? sortedRawTasks.map((task, idx) => {
                const isPicTask = getMilestoneRank(task.task_name) === 2 || task.task_name.toLowerCase().includes("pic");
                // Syarat penting: Task no 2 penetapan PIC otomatis checklist selesai jika PIC sudah ditugaskan
                const isTaskDone = Boolean(task.is_completed || (isPicTask && hasAssignedPic));

                return {
                  taskId: task.id,
                  step: `0${idx + 1}`,
                  title: isPicTask && c.assigned_admin?.name
                    ? `PIC Ditetapkan: ${c.assigned_admin.name}`
                    : task.task_name,
                  status: (isTaskDone
                    ? "completed"
                    : idx === 0 || (idx > 0 && (sortedRawTasks[idx - 1].is_completed || (getMilestoneRank(sortedRawTasks[idx - 1].task_name) === 2 && hasAssignedPic)))
                    ? "in_progress"
                    : "pending") as "completed" | "in_progress" | "pending",
                  date: isTaskDone ? "Selesai" : "Proses",
                  description: task.task_name,
                };
              })
            : [
                {
                  step: "1",
                  title: "Permohonan Diterima",
                  status: "completed" as const,
                  date: c.created_at ? new Date(c.created_at).toLocaleDateString("id-ID") : "Hari ini",
                  description: "Permohonan konsultasi diterima dan sedang menunggu penetapan PIC oleh Superadmin.",
                },
                {
                  step: "2",
                  title: `PIC Ditetapkan: ${c.assigned_admin?.name || "Konsultan Zhou"}`,
                  status: "completed" as const,
                  date: c.created_at ? new Date(c.created_at).toLocaleDateString("id-ID") : "Hari ini",
                  description: "Superadmin menetapkan konsultan penanggung jawab kertas kerja.",
                },
                {
                  step: "3",
                  title: "Pengerjaan Kertas Kerja & Pembahasan",
                  status: (progressVal >= 75 || isCompleted ? "completed" : "in_progress") as "completed" | "in_progress" | "pending",
                  date: (progressVal >= 75 || isCompleted) ? "Selesai" : "Proses",
                  description: "Konsultan PIC sedang menyusun kertas kerja, rekonsiliasi, serta analisis kepatuhan.",
                },
                {
                  step: "4",
                  title: "Konsultasi Selesai & Laporan Final",
                  status: (progressVal >= 100 || isCompleted ? "completed" : (progressVal >= 75 ? "in_progress" : "pending")) as "completed" | "in_progress" | "pending",
                  date: (progressVal >= 100 || isCompleted) ? "Selesai" : "-",
                  description: "Penyampaian deliverable akhir dan penutupan perikatan konsultasi.",
                },
              ];

          return {
            id: c.project_code || `TK-${c.id}`,
            numericId: c.id,
            title: c.title || "Konsultasi Perpajakan",
            category: resolveConsultationCategory(c) as ClientTicket["category"],
            status: isCompleted ? "Selesai" : c.status === "IN_PROGRESS" ? "Dalam Proses" : "Menunggu Penugasan",
            priority: "Normal",
            description: c.description || "",
            progress: progressVal,
            createdAt: c.created_at ? new Date(c.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "Hari ini",
            estimatedCompletion: "14 Hari Kerja",
            clientName: c.client?.name || "Klien Terdaftar",
            clientEmail: c.client?.email || "-",
            clientCompany: c.client?.company_name || "-",
            consultant: c.assigned_admin?.name || "Menunggu Penugasan PIC oleh Superadmin",
            assignedAdminName: c.assigned_admin?.name,
            assignedAdminEmail: c.assigned_admin?.email,
            milestones: taskMilestones,
            deliverables: (() => {
              const rawDocs = c.documents || [];
              const isClientUpload = (d: { uploaded_by?: number }) =>
                Boolean(d.uploaded_by && c.client_id && Number(d.uploaded_by) === Number(c.client_id));
              const isInstructionDoc = (d: { description?: string; file_name?: string }) =>
                Boolean(
                  (d.description && (d.description.toLowerCase().includes("instruksi") || d.description.toLowerCase().includes("superadmin"))) ||
                  (d.file_name && (d.file_name.toLowerCase().includes("instruksi") || d.file_name.toLowerCase().includes("superadmin")))
                );
              return rawDocs
                .filter((d) => !isClientUpload(d) && !isInstructionDoc(d))
                .map((d) => ({
                  id: `DOC-${d.id}`,
                  numericId: d.id,
                  name: d.file_name,
                  size: d.file_size || "1.5 MB",
                  type: d.file_type || "PDF",
                  date: new Date(d.created_at).toLocaleDateString("id-ID"),
                  status: "Terkirim",
                  downloadUrl: (d as unknown as { download_url?: string }).download_url || d.file_path,
                }));
            })(),
            assignmentNotes: extractAssignmentNotesFromDescription(c.description),
            correspondences: (() => {
              const corrs = extractCorrespondencesFromDescription(c.description, `msg-${c.id}`);
              if (corrs.length === 0) {
                const note = extractAssignmentNotesFromDescription(c.description);
                if (note) {
                  corrs.unshift({
                    id: `instr-superadmin-${c.id}`,
                    sender: "Superadmin (Instruksi Penugasan)",
                    role: "Superadmin",
                    date: c.created_at ? new Date(c.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) + " WIB" : "Saat Penugasan",
                    message: note,
                  });
                }
              }
              return corrs;
            })(),
            clientDocuments: (() => {
              const rawDocs = c.documents || [];
              const isClientUpload = (d: { uploaded_by?: number }) =>
                Boolean(d.uploaded_by && c.client_id && Number(d.uploaded_by) === Number(c.client_id));
              const isInstructionDoc = (d: { description?: string; file_name?: string }) =>
                Boolean(
                  (d.description && (d.description.toLowerCase().includes("instruksi") || d.description.toLowerCase().includes("superadmin"))) ||
                  (d.file_name && (d.file_name.toLowerCase().includes("instruksi") || d.file_name.toLowerCase().includes("superadmin")))
                );
              const adminDeliverables = rawDocs.filter((d) => !isClientUpload(d) && !isInstructionDoc(d));
              const delivNames = new Set(adminDeliverables.map((d) => d.file_name.toLowerCase().trim()));
              const delivIds = new Set(adminDeliverables.map((d) => String(d.id)));

              return rawDocs
                .filter(
                  (d) =>
                    (isClientUpload(d) || isInstructionDoc(d)) &&
                    !delivNames.has(d.file_name.toLowerCase().trim()) &&
                    !delivIds.has(String(d.id))
                )
                .map((d) => ({
                  id: `DOC-${d.id}`,
                  numericId: d.id,
                  name: d.file_name,
                  size: d.file_size || "1.5 MB",
                  type: d.file_type || "PDF",
                  date: new Date(d.created_at).toLocaleDateString("id-ID"),
                  uploadedBy: isInstructionDoc(d) ? "Superadmin (Instruksi)" : (c.client?.name || "Klien"),
                  status: isInstructionDoc(d) ? "Instruksi Superadmin" : "Diterima PIC",
                  downloadUrl: (d as unknown as { download_url?: string }).download_url || d.file_path,
                }));
            })(),
          };
        });

        // Gabungkan juga dengan tiket lokal yang diinput klien (hanya yang ditugaskan ke admin ini)
        const localTickets = typeof window !== "undefined" ? getStoredClientTickets() : [];
        const mergedTickets = mergeTicketsWithLocalOverrides(mappedTickets, localTickets)
          .filter((t) => normalizedUserRole === "superadmin" || canAdminAccessTicket(t, activeStaffProfile));

        setTickets(mergedTickets);

        setSelectedTicket((prev) => {
          if (!prev) return null;
          const updated = mergedTickets.find(
            (t) =>
              t.id.toLowerCase() === prev.id.toLowerCase() ||
              (prev.numericId && t.numericId === prev.numericId)
          );
          if (!updated) return prev;
          const prevCompleted = (prev.milestones || []).filter((m) => m.status === "completed").length;
          const updatedCompleted = (updated.milestones || []).filter((m) => m.status === "completed").length;
          return {
            ...updated,
            assignmentNotes: updated.assignmentNotes || prev.assignmentNotes || extractAssignmentNotesFromDescription(updated.description) || extractAssignmentNotesFromDescription(prev.description),
            milestones: prevCompleted > updatedCompleted ? prev.milestones : updated.milestones,
            progress: Math.max(updated.progress || 0, prev.progress || 0),
          };
        });
      } else {
        const localTickets = typeof window !== "undefined" ? getStoredClientTickets() : [];
        const adminTickets = localTickets.filter((lt) => normalizedUserRole === "superadmin" || canAdminAccessTicket(lt, activeStaffProfile));
        setTickets(adminTickets);
      }
    } catch (err) {
      console.warn("Gagal memuat konsultasi backend admin tugas, menggunakan penyimpanan lokal:", err);
      const localTickets = typeof window !== "undefined" ? getStoredClientTickets() : [];
      const adminTickets = normalizedUserRole === "superadmin"
        ? localTickets
        : localTickets.filter((lt) => canAdminAccessTicket(lt, activeStaffProfile));
      setTickets(adminTickets);
    } finally {
      setIsLoading(false);
    }
  }, [activeAdminEmail, user?.name, normalizedUserRole, activeStaffProfile]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Sinkronisasi realtime saat ada dokumen/tugas yang diunggah oleh Klien
  useEffect(() => {
    const handleSync = () => {
      loadData();
    };
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "zhou_staff_admins_roster") {
        setStaffList(getStoredStaffAdmins());
      }
      loadData();
    };
    window.addEventListener("zhou_tickets_updated", handleSync);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("zhou_tickets_updated", handleSync);
      window.removeEventListener("storage", handleStorage);
    };
  }, [loadData]);

  // Validasi URL Parameter ?id=... (Strict Authorization Enforcement)
  useEffect(() => {
    if (!urlTicketId) return;

    // Cari dari tickets state terlebih dahulu (yang sudah mencakup data live backend & lokal)
    const matchTicket = tickets.find(
      (t) =>
        t.id.toLowerCase() === urlTicketId.toLowerCase() ||
        (t.numericId && String(t.numericId) === urlTicketId) ||
        (urlTicketId.startsWith("TK-") && t.id.includes(urlTicketId.replace("TK-", "")))
    );

    if (matchTicket) {
      if (canAdminAccessTicket(matchTicket, activeStaffProfile)) {
        setSelectedTicket(matchTicket);
        setAccessDeniedMessage(null);
      } else {
        setAccessDeniedMessage(
          `Akses Ditolak: Anda tidak memiliki wewenang untuk mengakses tiket ${urlTicketId} karena ditugaskan kepada PIC lain.`
        );
        setSelectedTicket(null);
      }
      return;
    }

    const res = getTicketByIdForStaff(urlTicketId, activeStaffProfile);
    if (!res.success) {
      if (!isLoading) {
        setAccessDeniedMessage(
          res.error ||
            `Akses Ditolak: Anda tidak memiliki wewenang untuk mengakses tiket ${urlTicketId} karena ditugaskan kepada PIC lain.`
        );
        setSelectedTicket(null);
      }
    } else if (res.ticket) {
      setSelectedTicket(res.ticket);
      setAccessDeniedMessage(null);
    }
  }, [urlTicketId, activeStaffProfile, tickets, isLoading]);

  // Filter tiket milik admin
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      // Keamanan ganda: pastikan admin ini memang PIC dari tiket tersebut
      if (normalizedUserRole !== "superadmin" && !canAdminAccessTicket(t, activeStaffProfile)) {
        return false;
      }
      const matchStatus =
        statusFilter === "ALL" ||
        t.status === statusFilter ||
        (statusFilter === "Dalam Proses" && t.status === "Ditugaskan");
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        t.id.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.clientName && t.clientName.toLowerCase().includes(q)) ||
        (t.clientCompany && t.clientCompany.toLowerCase().includes(q));
      return matchStatus && matchSearch;
    });
  }, [tickets, statusFilter, searchQuery, normalizedUserRole, activeStaffProfile]);

  // Statistik Tugas
  const stats = useMemo(() => {
    const validTickets = normalizedUserRole === "superadmin"
      ? tickets
      : tickets.filter((t) => canAdminAccessTicket(t, activeStaffProfile));
    const total = validTickets.length;
    const inProgress = validTickets.filter(
      (t) => t.status === "Dalam Proses" || t.status === "Ditugaskan"
    ).length;
    const waitingClient = validTickets.filter((t) => t.status === "Menunggu Klien").length;
    const completed = validTickets.filter((t) => t.status === "Selesai").length;
    return { total, inProgress, waitingClient, completed };
  }, [tickets, normalizedUserRole, activeStaffProfile]);


  // Kirim Seluruh Dokumen & Catatan dari dalam Lembar Kerja
  const handleSendDocFromDetail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    if (!canAdminAccessTicket(selectedTicket, activeStaffProfile)) {
      showToast("Akses ditolak: Anda tidak memiliki hak akses terhadap konsultasi ini.");
      return;
    }

    setIsSendingDetailDoc(true);

    try {
      const rawId =
        selectedTicket.numericId ||
        (selectedTicket.id.startsWith("TK-") ? parseInt(selectedTicket.id.replace(/\D/g, ""), 10) : undefined) ||
        tickets.find((t) => t.id === selectedTicket.id)?.numericId ||
        parseInt(selectedTicket.id.replace(/\D/g, ""), 10);

      const staffName = activeStaffProfile.name || selectedTicket.assignedAdminName || "Tim Konsultan Zhou";

      if (detailSendFile) {
        // Cache blob untuk unduhan instan langsung dari memori browser & IndexedDB
        cacheFileBlob(
          [detailSendFile.name, `${selectedTicket.id}:${detailSendFile.name}`, selectedTicket.id],
          detailSendFile
        );

        // Siapkan catatan konsultan untuk disimpan ke shared storage dan backend database
        const noteText = detailDocNotes.trim()
          ? `Berkas deliverable resmi telah diterbitkan: "${detailSendFile.name}". Catatan: "${detailDocNotes.trim()}"`
          : `Berkas deliverable resmi telah diterbitkan: "${detailSendFile.name}".`;
        const formattedNote = formatConsultantNoteForStorage(noteText, staffName);
        const combinedDesc = appendConsultantNoteToDescription(selectedTicket.description, formattedNote);

        // 1. Simpan deliverable langsung ke shared storage (agar instan tersinkron ke portal klien)
        const saveRes = addAdminDeliverableToTicket(
          selectedTicket.id,
          {
            name: detailSendFile.name,
            size: `${(detailSendFile.size / (1024 * 1024)).toFixed(2)} MB`,
            category: detailDocCategory,
            notes: detailDocNotes.trim() || undefined,
          },
          activeStaffProfile,
          selectedTicket
        );

        if (saveRes.success && saveRes.ticket) {
          const updatedTicket = {
            ...selectedTicket,
            description: combinedDesc,
            deliverables: saveRes.ticket.deliverables,
            clientDocuments: saveRes.ticket.clientDocuments,
            correspondences: saveRes.ticket.correspondences,
          };
          setSelectedTicket(updatedTicket);
          setTickets((prev) =>
            prev.map((t) => (t.id.toLowerCase() === selectedTicket.id.toLowerCase() ? updatedTicket : t))
          );
        }

        // 2. Coba kirim juga ke backend secara aman (tidak memblokir jika mock/offline)
        try {
          const formData = new FormData();
          formData.append("file", detailSendFile);
          if (detailDocNotes.trim()) {
            formData.append("description", `[${detailDocCategory}] ${detailDocNotes.trim()}`);
          }
          await adminApi.uploadDocument(rawId, formData);
          if (rawId) {
            await adminApi.updateConsultation(rawId, {
              description: combinedDesc,
            });
          }
        } catch (apiErr) {
          console.warn("Backend deliverable upload notice:", apiErr);
        }

        showToast(`Dokumen deliverable "${detailSendFile.name}" berhasil dikirimkan ke Klien.`);
      } else if (detailDocNotes.trim()) {
        const formattedNote = formatConsultantNoteForStorage(detailDocNotes.trim(), staffName);
        const combinedDesc = appendConsultantNoteToDescription(selectedTicket.description, formattedNote);

        if (rawId) {
          try {
            await adminApi.updateConsultation(rawId, {
              description: combinedDesc,
            });
          } catch (apiErr) {
            console.warn("Backend consultation notes update:", apiErr);
          }
        }

        const updateRes = updateStoredClientTicketProgress(
          selectedTicket.id,
          { notes: detailDocNotes.trim() },
          activeStaffProfile,
          selectedTicket
        );
        if (updateRes.success && updateRes.ticket) {
          const updatedTicket = {
            ...selectedTicket,
            description: combinedDesc,
            correspondences: updateRes.ticket.correspondences,
          };
          setSelectedTicket(updatedTicket);
          setTickets((prev) =>
            prev.map((t) => (t.id.toLowerCase() === selectedTicket.id.toLowerCase() ? updatedTicket : t))
          );
        }
        showToast("Catatan konsultan berhasil disimpan dan diteruskan ke klien.");
      } else {
        // Pembaruan progres murni tanpa berkas maupun catatan
        const currentMilestones = selectedTicket.milestones || [];
        const completedCount = currentMilestones.filter((m) => m.status === "completed").length;
        const calcProgress = currentMilestones.length > 0
          ? Math.round((completedCount / currentMilestones.length) * 100)
          : selectedTicket.progress;
        const calcStatus: ConsultationStatus = calcProgress === 100 ? "Selesai" : "Dalam Proses";

        const updateRes = updateStoredClientTicketProgress(
          selectedTicket.id,
          {
            progress: calcProgress,
            status: calcStatus,
            milestones: currentMilestones,
          },
          activeStaffProfile,
          selectedTicket
        );

        try {
          await adminApi.updateConsultationStatus(rawId, calcProgress === 100 ? "COMPLETED" : "IN_PROGRESS");
        } catch (apiErr) {
          console.warn("Backend consultation status update notice:", apiErr);
        }

        if (updateRes.success && updateRes.ticket) {
          setSelectedTicket(updateRes.ticket);
          setTickets((prev) =>
            prev.map((t) => (t.id.toLowerCase() === selectedTicket.id.toLowerCase() ? updateRes.ticket! : t))
          );
        }
        showToast(`Progres konsultasi berhasil diperbarui (${calcProgress}% - ${calcStatus}).`);
      }

      setDetailSendFile(null);
      setDetailDocNotes("");
      await loadData();
    } catch (err) {
      console.error(err);
      showToast("Terjadi kendala saat memproses pembaruan.");
    } finally {
      setIsSendingDetailDoc(false);
    }
  };

  // Menandai tahapan pengerjaan kertas kerja secara langsung (1-klik langsung update progres & status)
  const handleToggleMilestone = async (milestoneIdx: number) => {
    if (!selectedTicket) return;
    if (!canAdminAccessTicket(selectedTicket, activeStaffProfile)) {
      showToast("Akses ditolak: Anda tidak memiliki wewenang untuk tiket ini.");
      return;
    }

    const rawMilestones: Milestone[] =
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
              status: (selectedTicket.progress >= 75 || selectedTicket.status === "Selesai") ? "completed" : "in_progress",
              date: formatConsultationDate(selectedTicket.createdAt),
              description: "Konsultan PIC sedang menyusun kertas kerja, rekonsiliasi, serta analisis kepatuhan.",
            },
            {
              step: "4",
              title: "Konsultasi Selesai & Laporan Final",
              status: (selectedTicket.progress >= 100 || selectedTicket.status === "Selesai") ? "completed" : (selectedTicket.progress >= 75 ? "in_progress" : "pending"),
              date: selectedTicket.status === "Selesai" ? formatConsultationDate(selectedTicket.createdAt) : "-",
              description: "Penyampaian deliverable akhir dan penutupan perikatan konsultasi.",
            },
          ];

    const currentMilestones: Milestone[] = sortAndNormalizeMilestones(rawMilestones).map((m, idx) => ({
      ...m,
      step: `0${idx + 1}`,
    }));

    const target = currentMilestones[milestoneIdx];
    const newStatus = target.status === "completed" ? "in_progress" : "completed";
    const newIsCompleted = newStatus === "completed";
    currentMilestones[milestoneIdx] = {
      ...target,
      status: newStatus,
      date: newStatus === "completed" ? formatConsultationDate(new Date().toISOString()) : target.date,
    };

    const completedCount = currentMilestones.filter((m) => m.status === "completed").length;
    const nextProgress = Math.round((completedCount / currentMilestones.length) * 100);

    const nextStatus: ConsultationStatus = nextProgress === 100 ? "Selesai" : "Dalam Proses";
    const backendStatus = nextProgress === 100 ? "COMPLETED" : "IN_PROGRESS";

    const rawId = selectedTicket.numericId || parseInt(selectedTicket.id.replace(/\D/g, ""), 10) || selectedTicket.id;

    // Segera perbarui state UI secara optimistik agar responsif dan tidak berkedip
    setSelectedTicket((prev) =>
      prev
        ? {
            ...prev,
            milestones: currentMilestones,
            progress: nextProgress,
            status: nextStatus,
          }
        : null
    );
    setTickets((prev) =>
      prev.map((t) =>
        t.id.toLowerCase() === selectedTicket.id.toLowerCase()
          ? {
              ...t,
              milestones: currentMilestones,
              progress: nextProgress,
              status: nextStatus,
            }
          : t
      )
    );

    // 1. Simpan langsung ke backend API (Task checklist & Consultation Status/Progress)
    try {
      if (target.taskId) {
        await adminApi.updateTask(rawId, target.taskId, newIsCompleted);
      }
      await adminApi.updateConsultation(rawId, {
        progress_percent: nextProgress,
        status: backendStatus,
      });
      await adminApi.updateConsultationStatus(rawId, backendStatus);
    } catch (apiErr) {
      console.warn("Update consultation task/status backend notice:", apiErr);
    }

    // 2. Simpan ke local storage tersinkronisasi sebagai cache
    updateStoredClientTicketProgress(
      selectedTicket.id,
      {
        status: nextStatus,
        progress: nextProgress,
        milestones: currentMilestones,
      },
      activeStaffProfile,
      selectedTicket
    );

    showToast(`Tahapan "${target.title}" berhasil diperbarui. Progres: ${nextProgress}% (${nextStatus})`);
    await loadData();
  };

  // Unduh dokumen pendukung klien atau deliverable resmi (langsung memanggil signed URL backend / Supabase)
  const handleDownloadClientDoc = async (
    fileName: string,
    clientName?: string,
    ticketId?: string,
    downloadUrl?: string,
    docId?: string | number
  ) => {
    const cleanFileName = (fileName || "Dokumen.pdf").trim();
    showToast(`Menyiapkan unduhan berkas "${cleanFileName}"...`);

    // 1. Coba minta signed download URL dari backend jika ada docId numerik yang valid (PostgreSQL 32-bit int)
    const numericDocId = docId ? parseInt(String(docId).replace(/\D/g, ""), 10) : undefined;
    if (numericDocId && !isNaN(numericDocId) && numericDocId > 0 && numericDocId <= 2147483647) {
      try {
        const signRes = await clientApi.getDownloadUrl(numericDocId);
        if (signRes?.data?.download_url) {
          const res = await downloadRemoteFile(signRes.data.download_url, cleanFileName);
          if (res.success) {
            showToast(`Dokumen "${cleanFileName}" berhasil diunduh.`);
            return;
          }
          // Direct anchor trigger jika fetch kena hambatan CORS
          if (typeof window !== "undefined") {
            const link = document.createElement("a");
            link.href = signRes.data.download_url;
            link.download = cleanFileName;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast(`Dokumen "${cleanFileName}" berhasil diunduh.`);
            return;
          }
        }
      } catch (err) {
        console.warn("Signed URL fetch notice:", err);
      }
    }

    // 2. Coba unduh dari URL remote server jika ada (sudah signed URL atau URL Supabase)
    if (downloadUrl && downloadUrl !== "#") {
      const res = await downloadRemoteFile(downloadUrl, cleanFileName);
      if (res.success) {
        showToast(`Dokumen "${cleanFileName}" berhasil diunduh.`);
        return;
      }
    }

    // 3. Cek blob file di IndexedDB persistent storage dan memory cache sebagai fallback
    const cachedBlob =
      (await getCachedFileBlobAsync(cleanFileName)) ||
      (ticketId ? await getCachedFileBlobAsync(`${ticketId}:${cleanFileName}`) : undefined) ||
      (docId ? await getCachedFileBlobAsync(String(docId)) : undefined) ||
      (downloadUrl ? await getCachedFileBlobAsync(downloadUrl) : undefined);

    if (cachedBlob) {
      downloadBlob(cachedBlob, cleanFileName);
      showToast(`Dokumen asli "${cleanFileName}" berhasil diunduh.`);
      return;
    }

    // 4. Fallback Pembuatan Dokumen PDF Resmi Standar Zhou Consulting
    const pdfBlob = generateDocumentPdfBlob({
      title: cleanFileName.replace(/\.[^/.]+$/, "").toUpperCase(),
      category: selectedTicket?.category || "Dokumen Deliverable Resmi",
      clientName: selectedTicket?.clientName || clientName || "Klien Zhou Consulting",
      ticketId: ticketId || selectedTicket?.id || "-",
      author: "Konsultan Zhou Consulting",
      date: new Date().toLocaleDateString("id-ID"),
    });
    downloadBlob(pdfBlob, cleanFileName.toLowerCase().endsWith(".pdf") ? cleanFileName : `${cleanFileName}.pdf`);
    showToast(`Dokumen "${cleanFileName}" berhasil diunduh.`);
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

    const rawMilestonesList: Milestone[] =
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
              status: (selectedTicket.progress >= 75 || selectedTicket.status === "Selesai") ? "completed" : "in_progress",
              date: (selectedTicket.progress >= 75 || selectedTicket.status === "Selesai") ? "Selesai" : formatConsultationDate(selectedTicket.createdAt),
              description: "Konsultan PIC sedang menyusun kertas kerja, rekonsiliasi, serta analisis kepatuhan.",
            },
            {
              step: "4",
              title: "Konsultasi Selesai & Laporan Final",
              status: (selectedTicket.progress >= 100 || selectedTicket.status === "Selesai") ? "completed" : (selectedTicket.progress >= 75 ? "in_progress" : "pending"),
              date: (selectedTicket.progress >= 100 || selectedTicket.status === "Selesai") ? formatConsultationDate(selectedTicket.createdAt) : "-",
              description: "Penyampaian deliverable akhir dan penutupan perikatan konsultasi.",
            },
          ];

    const milestonesList: Milestone[] = sortAndNormalizeMilestones(rawMilestonesList).map((m, idx) => ({
      ...m,
      step: `0${idx + 1}`,
    }));

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

              {/* Indikator Penyelesaian Dinamis */}
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
                      Pengaju: <strong className="text-primary font-medium">{selectedTicket.clientName || "Klien Terdaftar"}</strong>
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

                  {/* Catatan Instruksi Khusus Penugasan dari Superadmin (Internal PIC) */}
                  {(() => {
                    const instructions = extractSuperadminInstructions(selectedTicket);
                    if (instructions.length === 0) return null;
                    return (
                      <div className="mt-3 pt-3 border-t border-primary-light/60 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900">
                            Instruksi Penugasan Superadmin ({instructions.length})
                          </span>
                          <span className="text-[9px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                            Khusus Internal PIC
                          </span>
                        </div>
                        <div className="space-y-2">
                          {instructions.map((inst, idx) => (
                            <div
                              key={inst.id || idx}
                              className="p-3 rounded-xl bg-amber-50/95 border border-amber-200 text-xs text-amber-950 font-medium leading-relaxed space-y-1.5 shadow-2xs"
                            >
                              <div className="flex items-center justify-between text-[10px] text-amber-800 font-semibold border-b border-amber-200/60 pb-1">
                                <span>{inst.sender}</span>
                                <span className="font-mono text-text-muted">{inst.date}</span>
                              </div>
                              <p className="whitespace-pre-line leading-relaxed">{inst.message}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* 2. Alur Pengerjaan Kertas Kerja (Interactive Minimal Stepper untuk Admin) */}
                <div className="p-4 rounded-xl border border-primary-light bg-white space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-primary-light/60">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                        Alur Pengerjaan
                      </h4>
                      <p className="text-[10px] text-text-muted">
                        Klik tombol untuk memperbarui status pengerjaan
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-text-muted">
                      {completedMilestones} dari {milestonesList.length} Selesai
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {milestonesList.map((m, idx) => {
                      const isDone = m.status === "completed";
                      const isInProg = m.status === "in_progress";
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-primary-light/60 hover:bg-surface/30 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <button
                              type="button"
                              onClick={() => handleToggleMilestone(idx)}
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 cursor-pointer transition-transform hover:scale-105 ${
                                isDone
                                  ? "bg-emerald-600 text-white shadow-2xs"
                                  : isInProg
                                  ? "bg-primary text-white shadow-2xs"
                                  : "bg-surface border border-primary-light text-text-muted hover:border-primary hover:text-primary"
                              }`}
                              title={isDone ? "Klik untuk membatalkan" : "Klik untuk menandai selesai"}
                            >
                              {isDone ? <CheckIcon className="text-[10px]" /> : idx + 1}
                            </button>
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

                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                                isDone
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : isInProg
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : "bg-slate-100 text-slate-500 border border-slate-200"
                              }`}
                            >
                              {isDone ? "Selesai" : isInProg ? "Proses" : "Menunggu"}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleToggleMilestone(idx)}
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded cursor-pointer transition-colors ${
                                isDone
                                  ? "text-text-muted hover:text-amber-700 hover:bg-amber-50"
                                  : "text-primary hover:bg-primary hover:text-white bg-surface border border-primary-light"
                              }`}
                            >
                              {isDone ? "Ubah" : "Selesai ✓"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* KOLOM KANAN (lg:col-span-7): Pusat Dokumen & Form PIC */}
              <div className="lg:col-span-7 space-y-4">
                {/* 1. Dokumen Deliverable dari Admin / Konsultan */}
                <div className="p-4 rounded-xl border border-primary-light bg-white space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-primary-light/60">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                        Dokumen Deliverable Resmi
                      </h4>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-surface text-primary border border-primary-light">
                        {selectedTicket.deliverables?.length || 0}
                      </span>
                    </div>
                    <span className="text-[10px] text-text-muted">Hasil Kertas Kerja Konsultan</span>
                  </div>

                  {(!selectedTicket.deliverables || selectedTicket.deliverables.length === 0) ? (
                    <div className="p-3 bg-surface/30 rounded-lg text-center text-xs text-text-muted border border-dashed border-primary-light/60">
                      Belum ada berkas deliverable resmi yang dikirimkan ke klien.
                    </div>
                  ) : (
                    <div className="divide-y divide-primary-light/60 border border-primary-light rounded-xl overflow-hidden bg-white">
                      {selectedTicket.deliverables.map((d, dIdx) => (
                        <div key={dIdx} className="p-2.5 flex items-center justify-between gap-3 hover:bg-surface/30 transition-colors">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-md bg-primary/10 text-primary flex items-center justify-center text-[10px] shrink-0 font-bold">
                              <DocumentIcon className="text-xs" />
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
                            onClick={() => handleDownloadClientDoc(d.name, "Konsultan PIC", selectedTicket.id, d.downloadUrl, d.numericId || d.id)}
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
                <div className="p-4 rounded-xl border border-primary-light bg-white space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-primary-light/60">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                        Dokumen Pendukung &amp; Berkas Instruksi
                      </h4>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-surface text-primary border border-primary-light">
                        {cleanClientDocuments.length}
                      </span>
                    </div>
                    <span className="text-[10px] text-text-muted">Berkas Unggahan &amp; Arahan Tim</span>
                  </div>

                  {cleanClientDocuments.length === 0 ? (
                    <div className="p-3 bg-surface/30 rounded-lg text-center text-xs text-text-muted border border-dashed border-primary-light/60">
                      Belum ada dokumen pendukung atau instruksi penugasan yang dilampirkan.
                    </div>
                  ) : (
                    <div className="divide-y divide-primary-light/60 border border-primary-light rounded-xl overflow-hidden bg-white">
                      {cleanClientDocuments.map((doc, docIdx) => {
                        const isInstrDoc = doc.status === "Instruksi Superadmin" || doc.uploadedBy?.toLowerCase().includes("superadmin");
                        return (
                          <div
                            key={docIdx}
                            className={`p-2.5 flex items-center justify-between gap-3 transition-colors ${
                              isInstrDoc ? "bg-amber-50/50 hover:bg-amber-50/80" : "hover:bg-surface/30"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] shrink-0 font-bold border ${
                                  isInstrDoc
                                    ? "bg-amber-100 text-amber-900 border-amber-300"
                                    : "bg-surface text-primary border-primary-light"
                                }`}
                              >
                                <DocumentIcon className="text-xs" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <p className="font-semibold text-primary text-xs truncate">{doc.name}</p>
                                  {isInstrDoc && (
                                    <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300">
                                      Instruksi Superadmin
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-text-muted mt-0.5">
                                  {doc.size} {doc.date ? `• ${doc.date}` : ""} {doc.uploadedBy ? `• Oleh: ${doc.uploadedBy}` : ""}
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadClientDoc(doc.name, doc.uploadedBy, selectedTicket.id, doc.downloadUrl, doc.numericId || doc.id)}
                              className="text-xs h-7 px-2.5 font-medium shrink-0"
                            >
                              Unduh
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 3. Form Kirim Dokumen & Catatan Konsultan PIC */}
                <div className="p-4 bg-white rounded-xl border border-primary-light space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-primary-light/60">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                      Kirim Deliverable &amp; Catatan
                    </h4>
                    <span className="text-[10px] text-text-muted">Tersinkron Langsung ke Klien</span>
                  </div>

                  <form onSubmit={handleSendDocFromDetail} className="space-y-3 text-xs">
                    <div className="space-y-1">
                      <Label htmlFor="detail-doc-category" className="text-[11px] font-semibold text-text-secondary block">
                        Kategori Dokumen Deliverable
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

                    {/* File Dokumen Input Ringkas */}
                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold text-text-secondary block">
                        Berkas Dokumen Deliverable (Opsional)
                      </Label>
                      <input
                        type="file"
                        id="detail-file-input"
                        accept=".pdf,.xlsx,.xls,.doc,.docx,.zip,.rar"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) setDetailSendFile(f);
                        }}
                        className="hidden"
                      />

                      {detailSendFile ? (
                        <div className="p-2.5 bg-surface/50 rounded-xl border border-primary-light flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-md bg-white border border-primary-light flex items-center justify-center text-primary shrink-0">
                              <DocumentIcon className="text-xs" />
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
                              className="h-6 px-2 bg-white border border-primary-light text-primary rounded-md text-[10px] font-semibold flex items-center gap-1 cursor-pointer hover:bg-surface transition-colors"
                            >
                              Ganti
                            </label>
                            <button
                              type="button"
                              onClick={() => setDetailSendFile(null)}
                              className="h-6 px-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-md text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <CloseIcon className="text-[9px]" />
                              <span>Hapus</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label
                          htmlFor="detail-file-input"
                          className="flex items-center justify-between p-2.5 bg-surface/30 border border-dashed border-primary-light hover:border-primary rounded-xl cursor-pointer transition-colors group"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-md bg-white border border-primary-light group-hover:border-primary text-primary flex items-center justify-center shadow-2xs transition-colors">
                              <UploadIcon className="text-xs" />
                            </div>
                            <span className="text-xs font-semibold text-primary">
                              Pilih Berkas Deliverable (.pdf, .xlsx, .docx)
                            </span>
                          </div>
                          <span className="text-[11px] font-semibold px-2.5 py-1 bg-white border border-primary-light text-primary rounded-lg shadow-2xs group-hover:bg-primary group-hover:text-white transition-colors">
                            Pilih Berkas
                          </span>
                        </label>
                      )}
                    </div>

                    {/* Kolom Catatan Konsultan */}
                    <div className="space-y-1">
                      <Label htmlFor="detail-doc-notes" className="text-[11px] font-semibold text-text-secondary block">
                        Catatan Konsultan untuk Klien (Opsional)
                      </Label>
                      <Textarea
                        id="detail-doc-notes"
                        placeholder="Tuliskan catatan kemajuan pengerjaan atau instruksi untuk klien..."
                        value={detailDocNotes}
                        onChange={(e) => setDetailDocNotes(e.target.value)}
                        rows={2}
                        className="text-xs bg-white resize-y"
                      />
                    </div>

                    {/* Tombol Simpan & Kirim */}
                    <div className="flex items-center justify-end gap-2.5 pt-1">
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        disabled={isSendingDetailDoc}
                        className="text-xs font-semibold px-4 h-8.5 shadow-xs cursor-pointer"
                      >
                        <SendIcon className="mr-1.5 text-xs" />
                        {isSendingDetailDoc
                          ? "Memproses..."
                          : detailSendFile
                          ? "Kirim Deliverable ke Klien"
                          : detailDocNotes.trim()
                          ? "Kirim Catatan ke Klien"
                          : "Perbarui Progres & Simpan"}
                      </Button>
                    </div>
                  </form>
                </div>

                {/* 4. Catatan & Komunikasi dengan Klien (Khusus Korespondensi Klien - Konsultan) */}
                {(() => {
                  const cleanProblem = formatTicketDescription(selectedTicket.description).trim().toLowerCase();

                  const cleanCorrespondences = (selectedTicket.correspondences || [])
                    .map((c) => ({
                      ...c,
                      cleanMsg: formatCorrespondenceMessage(c.message),
                    }))
                    .filter((c) => {
                      if (!c.cleanMsg || c.cleanMsg.trim().length === 0) return false;
                      if (cleanProblem && c.cleanMsg.trim().toLowerCase() === cleanProblem) return false;
                      // Saring instruksi internal Superadmin agar TIDAK tercampur ke riwayat korespondensi klien
                      const isSuperadmin =
                        c.role === "Superadmin" ||
                        c.sender.toLowerCase().includes("superadmin") ||
                        c.sender.toLowerCase().includes("instruksi");
                      if (isSuperadmin) return false;
                      return true;
                    });

                  return (
                    <div className="p-4 rounded-xl border border-primary-light bg-white space-y-2.5">
                      <div className="flex items-center justify-between pb-2 border-b border-primary-light/60">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                          Catatan &amp; Komunikasi Klien
                        </h4>
                        <span className="text-[10px] text-text-muted">Korespondensi Klien &bull; Konsultan</span>
                      </div>

                      {cleanCorrespondences.length === 0 ? (
                        <div className="p-3 bg-surface/30 rounded-lg text-center text-xs text-text-muted border border-dashed border-primary-light/60">
                          Belum ada catatan atau korespondensi dengan klien untuk perikatan ini.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {cleanCorrespondences.map((c) => {
                            const isSuperadminNote = c.role === "Superadmin" || c.sender.toLowerCase().includes("superadmin");
                            return (
                              <div
                                key={c.id}
                                className={`p-3 rounded-xl space-y-1.5 transition-colors border ${
                                  isSuperadminNote
                                    ? "bg-amber-50/70 border-amber-200/90 hover:bg-amber-50/90"
                                    : "bg-surface/30 border-primary-light/60 hover:bg-surface/60"
                                }`}
                              >
                                <div className="flex items-center justify-between text-[10px]">
                                  <div className="flex items-center gap-1.5">
                                    <span className={`font-bold ${isSuperadminNote ? "text-amber-900" : "text-primary"}`}>
                                      {c.sender}
                                    </span>
                                    <span
                                      className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border ${
                                        isSuperadminNote
                                          ? "bg-amber-100 text-amber-800 border-amber-300"
                                          : "bg-surface text-text-muted border-primary-light"
                                      }`}
                                    >
                                      {c.role}
                                    </span>
                                  </div>
                                  <span className="text-text-muted font-mono">{c.date}</span>
                                </div>
                                <p
                                  className={`text-xs leading-relaxed whitespace-pre-line ${
                                    isSuperadminNote ? "text-amber-950 font-medium" : "text-text-secondary"
                                  }`}
                                >
                                  {c.cleanMsg}
                                </p>
                              </div>
                            );
                          })}
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
                  <option value="Selesai">Selesai</option>
                </Select>
              </div>
            </div>

            {/* Tabel Konsultasi PIC */}
            <div className="overflow-x-auto rounded-xl border border-primary-light">
              <table className="w-full text-left text-xs min-w-[800px]">
                <thead className="bg-surface text-text-muted font-bold uppercase text-[10px] tracking-wider border-b border-primary-light">
                  <tr>
                    <th className="py-3 px-4 text-center min-w-[200px]">Kode &amp; Judul Kebutuhan</th>
                    <th className="py-3 px-4 text-center w-48 min-w-[170px]">Uraian Detail Masalah</th>
                    <th className="py-3 px-4 text-center min-w-[230px]">Klien &amp; Entitas</th>
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
                    const cleanProblemDesc = formatTicketDescription(ticket.description);

                    return (
                      <tr key={ticket.id} className="hover:bg-surface/60 transition-colors">
                        <td className="py-3.5 px-4 font-medium text-primary align-top min-w-[200px]">
                          <span className="font-mono text-[10px] text-text-muted block font-semibold">
                            {ticket.id}
                          </span>
                          <span className="font-bold text-xs text-primary block mt-0.5 leading-snug">
                            {ticket.title || "Konsultasi Kebutuhan Klien"}
                          </span>
                          {(ticket.assignmentNotes || extractAssignmentNotesFromDescription(ticket.description)) && (
                            <span className="inline-flex items-center mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                              Instruksi Superadmin
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-text-secondary align-top w-48 min-w-[170px]">
                          {cleanProblemDesc ? (
                            <div className="bg-surface/60 border border-primary-light/70 rounded-lg p-2.5 space-y-1">
                              <p className="text-xs text-text-primary leading-relaxed whitespace-pre-line line-clamp-3" title={cleanProblemDesc}>
                                {cleanProblemDesc}
                              </p>
                            </div>
                          ) : (
                            <span className="text-[11px] text-text-muted italic">
                              Belum ada uraian masalah
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 align-top min-w-[230px]">
                          <span className="font-semibold text-primary block">
                            {ticket.clientName || "Klien Terdaftar"}
                          </span>
                          <span className="text-[11px] text-text-secondary block">
                            {ticket.clientCompany || ticket.clientEmail || "-"}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-text-secondary align-top">
                          <span className="block font-medium text-primary">
                            {ticket.category}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 align-top">
                          <div className="flex flex-col gap-1 items-start">
                            {renderStatusBadge(ticket.status)}
                            <div className="w-24 bg-surface rounded-full h-1.5 overflow-hidden border border-primary-light">
                              <div
                                className={`h-full rounded-full ${
                                  ticket.status === "Selesai"
                                    ? "bg-emerald-500"
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

                        <td className="py-3.5 px-4 text-text-secondary text-[11px] align-top">
                          <div>{totalDoc} Berkas</div>
                          {clientDocCount > 0 && (
                            <span className="text-[10px] text-text-muted">
                              {clientDocCount} dari klien
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-text-secondary text-[11px] align-top">
                          <div>{ticket.estimatedCompletion || "Menunggu Penetapan PIC"}</div>
                          <div className="text-[10px] text-text-muted">
                            Masuk: {formatConsultationDate(ticket.createdAt)}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-center whitespace-nowrap align-top">
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
                      <td colSpan={8} className="py-10 text-center text-text-secondary text-xs">
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
