"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import {
  adminApi,
  clientApi,
  superadminApi,
  ConsultationItem,
  AdminUserItem,
} from "@/lib/api";
import { isDummyTicket } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  SearchIcon,
  CloseIcon,
  CheckCircleIcon,
  UserIcon,
  TrashIcon,
  EyeIcon,
  MoreVerticalIcon,
  ArchiveIcon,
  UnarchiveIcon,
} from "@/components/icons";
import {
  downloadBlob,
  downloadRemoteFile,
  exportToExcel,
  generateDocumentPdfBlob,
} from "@/lib/downloadHelper";

import {
  toggleArchiveClientTicket,
  isTicketArchived,
  formatConsultationDate,
  formatTicketDescription,
  resolveConsultationCategory,
  getStoredClientTickets,
  getCachedFileBlobAsync,
  markTicketAsDeleted,
  markAllTicketsAsDeleted,
  isTicketDeleted,
  assignTicketPic,
  mergeTicketsWithLocalOverrides,
  ClientTicket,
  StaffAdminProfile,
} from "@/data/sharedTicketsStorage";

const cleanAdminName = (rawName: string) => {
  return (rawName || "").replace(/\s*\(Updated\)/gi, "").trim();
};

const isDummyAdmin = (a: { email?: string; name?: string }): boolean => {
  const email = (a.email || "").toLowerCase();
  const name = (a.name || "").toLowerCase();
  return (
    email.includes("deact.") ||
    email.includes("staff.admin.") ||
    email.includes("test") ||
    email.includes("dummy") ||
    email.includes("mock") ||
    name.includes("test runner") ||
    name.includes("deactivate") ||
    name.includes("dummy") ||
    name.includes("mock") ||
    /\b17\d{10,12}\b/.test(email)
  );
};

function SuperadminPerikatanContent() {
  const [tickets, setTickets] = useState<ClientTicket[]>([]);
  const [staffAdmins, setStaffAdmins] = useState<StaffAdminProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modal states
  const [selectedDetailTicket, setSelectedDetailTicket] = useState<ClientTicket | null>(null);
  const [managingPicTicket, setManagingPicTicket] = useState<ClientTicket | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const [typedStaffName, setTypedStaffName] = useState<string>("");
  const [assignmentNotes, setAssignmentNotes] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);

  // Hanya tampilkan staf dengan role Admin (Superadmin tidak boleh ditugaskan sebagai PIC)
  const assignableAdmins = useMemo(() => {
    return staffAdmins.filter(
      (adm) => adm.role !== "superadmin" && !String(adm.role || "").toLowerCase().includes("super")
    );
  }, [staffAdmins]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = React.useCallback(async (isInitial = false) => {
    if (isInitial) {
      setIsLoading(true);
    }

    try {
      const [consultRes, staffRes] = await Promise.allSettled([
        adminApi.getConsultations(),
        superadminApi.getAdmins(),
      ]);

      if (staffRes.status === "fulfilled" && staffRes.value?.data && Array.isArray(staffRes.value.data)) {
        const validAdmins = staffRes.value.data.filter((a: AdminUserItem) => !isDummyAdmin(a));
        const mappedStaff: StaffAdminProfile[] = validAdmins.map((adm: AdminUserItem, idx: number) => ({
          id: `ADM-${String(adm.id).padStart(3, "0")}`,
          numericId: adm.id,
          name: cleanAdminName(adm.name),
          email: adm.email,
          nip: (adm.role === "SUPERADMIN" ? "SPR-" : "ADM-") + String(adm.id).padStart(3, "0"),
          phone: adm.phone || "+62 812-9876-" + (1200 + idx),
          role: adm.role === "SUPERADMIN" ? "superadmin" : "admin",
          divisions: ["Tax Service Core", "Accounting Service", "Legal Compliance"],
          isActive: adm.is_active,
        }));
        setStaffAdmins(mappedStaff);
      }

      if (consultRes.status === "fulfilled" && consultRes.value?.data && Array.isArray(consultRes.value.data)) {
        const validConsultations = consultRes.value.data.filter((c: ConsultationItem) => !isDummyTicket(c));
        const mappedTickets: ClientTicket[] = validConsultations.map((b: ConsultationItem) => {
          const bCode = b.project_code || `TK-${b.id}`;
          const isCompleted = b.status === "COMPLETED";

          return {
            id: bCode,
            numericId: b.id,
            title: b.title || "Konsultasi Perpajakan Klien",
            category: resolveConsultationCategory(b) as ClientTicket["category"],
            status: isCompleted ? "Selesai" : b.status === "IN_PROGRESS" ? "Dalam Proses" : "Menunggu Penugasan",
            progress: b.progress_percent || (isCompleted ? 100 : b.assigned_admin ? 40 : 15),
            createdAt: b.created_at ? new Date(b.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "Hari ini",
            estimatedCompletion: "14 Hari Kerja",
            clientName: b.client?.name || "Klien Terdaftar",
            clientEmail: b.client?.email || "-",
            clientCompany: b.client?.company_name || "-",
            consultant: b.assigned_admin?.name || "Menunggu Penugasan",
            assignedAdminId: b.assigned_admin ? `ADM-${String(b.assigned_admin.id).padStart(3, "0")}` : undefined,
            assignedAdminName: b.assigned_admin?.name,
            assignedAdminEmail: b.assigned_admin?.email,
            milestones: (b.tasks && b.tasks.length > 0)
              ? b.tasks.map((t, idx) => ({
                  taskId: t.id,
                  step: `0${idx + 1}`,
                  title: t.task_name,
                  status: (t.is_completed || (b.assigned_admin && idx <= 1) ? "completed" : idx === 0 ? "in_progress" : "pending") as "completed" | "in_progress" | "pending",
                  date: (t.is_completed || (b.assigned_admin && idx <= 1)) ? "Selesai" : "Proses",
                  description: t.task_name,
                }))
              : [
                  {
                    step: "01",
                    title: "Permohonan Diterima",
                    status: "completed" as const,
                    date: b.created_at ? new Date(b.created_at).toLocaleDateString("id-ID") : "Hari ini",
                    description: "Permohonan konsultasi diverifikasi dan dicatat sistem.",
                  },
                  {
                    step: "02",
                    title: b.assigned_admin?.name ? `PIC Ditetapkan: ${b.assigned_admin.name}` : "Penetapan Konsultan PIC & Divisi Terkait",
                    status: (b.assigned_admin ? "completed" : "in_progress") as "completed" | "in_progress" | "pending",
                    date: b.assigned_admin ? "Selesai" : "Menunggu",
                    description: b.assigned_admin
                      ? `Superadmin menetapkan ${b.assigned_admin.name} sebagai konsultan PIC.`
                      : "Menunggu penetapan PIC oleh Superadmin.",
                  },
                  {
                    step: "03",
                    title: "Pengerjaan Kertas Kerja & Pembahasan",
                    status: (isCompleted ? "completed" : b.assigned_admin ? "in_progress" : "pending") as "completed" | "in_progress" | "pending",
                    date: isCompleted ? "Selesai" : "-",
                    description: "Penyusunan kertas kerja dan telaah kepatuhan.",
                  },
                  {
                    step: "04",
                    title: "Konsultasi Selesai & Laporan Final",
                    status: (isCompleted ? "completed" : "pending") as "completed" | "in_progress" | "pending",
                    date: isCompleted ? "Selesai" : "-",
                    description: "Penyampaian deliverable akhir dan penutupan tiket.",
                  },
                ],
            deliverables: (b.documents || [])
              .filter((d) => (d.uploaded_by && b.client_id ? d.uploaded_by !== b.client_id : true))
              .map((d) => ({
                id: `DOC-${d.id}`,
                numericId: d.id,
                name: d.file_name,
                size: d.file_size || "1.5 MB",
                type: d.file_type || "PDF",
                date: new Date(d.created_at).toLocaleDateString("id-ID"),
                status: "Terkirim",
                downloadUrl: (d as unknown as { download_url?: string }).download_url || d.file_path,
              })),
            description: b.description || "",
            correspondences: b.description ? [
              {
                id: `msg-${b.id}`,
                sender: "Klien",
                role: "Klien",
                date: "Awal",
                message: b.description,
              }
            ] : [],
            clientDocuments: (b.documents || [])
              .filter((d) => (d.uploaded_by && b.client_id ? d.uploaded_by === b.client_id : false))
              .map((d) => ({
                id: `DOC-${d.id}`,
                numericId: d.id,
                name: d.file_name,
                size: d.file_size || "1.5 MB",
                type: d.file_type || "PDF",
                date: new Date(d.created_at).toLocaleDateString("id-ID"),
                uploadedBy: b.client?.name || "Klien",
                status: "Diterima PIC",
                downloadUrl: (d as unknown as { download_url?: string }).download_url || d.file_path,
              })),
            isArchived: isTicketArchived(bCode),
          };
        });

        const localTickets = typeof window !== "undefined" ? getStoredClientTickets() : [];
        const mergedTickets = mergeTicketsWithLocalOverrides(mappedTickets, localTickets);
        setTickets(mergedTickets);
      } else {
        const localTickets = typeof window !== "undefined" ? getStoredClientTickets() : [];
        if (localTickets.length > 0) {
          setTickets(localTickets);
        }
      }
    } catch (err) {
      console.warn("Gagal memuat perikatan superadmin:", err);
      const localTickets = typeof window !== "undefined" ? getStoredClientTickets() : [];
      if (localTickets.length > 0) {
        setTickets(localTickets);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(true);

    const handleCleared = () => {
      loadData(false);
    };
    window.addEventListener("zhou_tickets_cleared", handleCleared);
    return () => window.removeEventListener("zhou_tickets_cleared", handleCleared);
  }, [loadData]);

  // Tutup dropdown menu titik tiga ketika klik di luar
  useEffect(() => {
    const handleCloseMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest?.("[data-action-menu]")) return;
      setOpenActionMenuId(null);
    };
    document.addEventListener("click", handleCloseMenu);
    return () => document.removeEventListener("click", handleCloseMenu);
  }, []);

  // Handler Arsipkan / Pulihkan dari Arsip
  const handleToggleArchiveTicket = (item: ClientTicket) => {
    const isNowArchived = toggleArchiveClientTicket(item.id, item);
    setTickets((prev) =>
      prev.map((t) =>
        t.id.toLowerCase() === item.id.toLowerCase()
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
        ? `Perikatan ${item.id} berhasil diarsipkan.`
        : `Perikatan ${item.id} berhasil dipulihkan dari arsip.`
    );
  };

  // Handler Hapus Perikatan
  const handleDeleteTicket = async (item: ClientTicket) => {
    if (confirm(`Apakah Anda yakin ingin menghapus perikatan "${item.title}" (${item.id})?`)) {
      const rawId = item.numericId || parseInt(item.id.replace(/\D/g, ""), 10) || item.id;
      markTicketAsDeleted(item.id);
      if (rawId) {
        markTicketAsDeleted(rawId);
      }
      try {
        await adminApi.deleteConsultation(rawId);
      } catch {}
      showToast(`Perikatan ${item.id} berhasil dihapus.`);
      await loadData(false);
    }
  };

  // Buka modal detail konsultasi & berkas
  const handleOpenDetailModal = (item: ClientTicket) => {
    setSelectedDetailTicket(item);
  };

  // Buka modal khusus kelola admin & PIC
  const handleOpenPicModal = (item: ClientTicket) => {
    setManagingPicTicket(item);
    const activeAssignableStaff = assignableAdmins.filter((s) => s.isActive !== false);
    const matched = activeAssignableStaff.find(
      (s) =>
        s.id === item.assignedAdminId ||
        s.email.toLowerCase() === (item.assignedAdminEmail || "").toLowerCase() ||
        s.name.toLowerCase() === (item.assignedAdminName || "").toLowerCase()
    );
    const defaultStaff = matched || activeAssignableStaff[0];
    setSelectedStaffId(defaultStaff ? defaultStaff.id : "");
    setTypedStaffName(defaultStaff ? defaultStaff.name : "");
    setAssignmentNotes(item.assignmentNotes || "");
  };

  // Simpan/Tetapkan PIC dari modal kelola PIC
  const handleSavePicAssignment = async () => {
    if (!managingPicTicket) return;

    let targetAdmin = assignableAdmins.find((s) => s.id === selectedStaffId);
    if (!targetAdmin && typedStaffName.trim()) {
      targetAdmin = assignableAdmins.find(
        (s) =>
          s.name.toLowerCase() === typedStaffName.trim().toLowerCase() ||
          s.name.toLowerCase().includes(typedStaffName.trim().toLowerCase())
      );
    }

    if (!targetAdmin) {
      showToast("Mohon pilih Admin / Staf Konsultan yang bertugas dari daftar.");
      return;
    }

    if (!targetAdmin.isActive) {
      showToast("Gagal: Admin yang dipilih berstatus non-aktif.");
      return;
    }

    const prevName = managingPicTicket.assignedAdminName || "PIC Sebelumnya";
    const isReassign = Boolean(
      managingPicTicket.assignedAdminName &&
      (managingPicTicket.assignedAdminEmail?.toLowerCase() !== targetAdmin.email.toLowerCase() ||
        managingPicTicket.assignedAdminId !== targetAdmin.id ||
        managingPicTicket.assignedAdminName.toLowerCase() !== targetAdmin.name.toLowerCase())
    );

    const numAdminId =
      targetAdmin.numericId ||
      parseInt(targetAdmin.id.replace(/\D/g, ""), 10);

    const rawTicketId = managingPicTicket.id;
    let targetProjectId = managingPicTicket.numericId;
    if (!targetProjectId) {
      const parsed = parseInt(rawTicketId.replace(/\D/g, ""), 10);
      if (!isNaN(parsed)) targetProjectId = parsed;
    }

    if (targetProjectId && numAdminId) {
      try {
        const assignRes = await adminApi.assignConsultation(targetProjectId, numAdminId);
        if (assignRes.success) {
          showToast(
            isReassign
              ? `Penugasan tiket ${managingPicTicket.id} berhasil dialihkan dari ${prevName} kepada ${targetAdmin.name}.`
              : `Tiket ${managingPicTicket.id} berhasil ditugaskan kepada ${targetAdmin.name}.`
          );
        } else {
          showToast(assignRes.message || "Gagal memperbarui penugasan PIC di backend.");
        }
      } catch {
        showToast("Terjadi kendala koneksi ke server saat menetapkan PIC.");
      }
    }

    // Sinkronisasi pembaruan PIC ke penyimpanan tiket bersama lokal
    assignTicketPic(
      managingPicTicket.id,
      {
        id: targetAdmin.id,
        name: targetAdmin.name,
        email: targetAdmin.email,
        division: targetAdmin.divisions?.[0] || "Tax Service Core",
        isActive: targetAdmin.isActive,
      },
      assignmentNotes,
      managingPicTicket
    );

    if (managingPicTicket.numericId) {
      assignTicketPic(
        `TK-${managingPicTicket.numericId}`,
        {
          id: targetAdmin.id,
          name: targetAdmin.name,
          email: targetAdmin.email,
          division: targetAdmin.divisions?.[0] || "Tax Service Core",
          isActive: targetAdmin.isActive,
        },
        assignmentNotes
      );
    }

    setManagingPicTicket(null);
    await loadData(false);
  };

  // Helper unduh lampiran berkas klien secara valid (XLSX, PDF, atau file server asli)
  const handleDownloadAttachment = async (
    fileName: string,
    clientName?: string,
    downloadUrl?: string,
    docId?: string | number
  ) => {
    showToast(`Menyiapkan unduhan berkas "${fileName}"...`);

    // 1. Coba minta signed download URL dari backend jika ada docId
    const numericDocId = docId ? parseInt(String(docId).replace(/\D/g, ""), 10) : undefined;
    if (numericDocId && !isNaN(numericDocId)) {
      try {
        const signRes = await clientApi.getDownloadUrl(numericDocId);
        if (signRes?.data?.download_url) {
          const res = await downloadRemoteFile(signRes.data.download_url, fileName);
          if (res.success) {
            showToast(`Dokumen "${fileName}" berhasil diunduh.`);
            return;
          }
        }
      } catch (err) {
        console.warn("Signed URL error:", err);
      }
    }

    // 2. Coba unduh dari URL remote jika ada
    if (downloadUrl && downloadUrl !== "#") {
      const res = await downloadRemoteFile(downloadUrl, fileName);
      if (res.success) {
        showToast(`Dokumen "${fileName}" berhasil diunduh.`);
        return;
      }
    }

    // 3. Cek berkas fisik asli di IndexedDB & memory cache
    const cachedBlob =
      (await getCachedFileBlobAsync(fileName)) ||
      (selectedDetailTicket?.id ? await getCachedFileBlobAsync(`${selectedDetailTicket.id}:${fileName}`) : undefined) ||
      (docId ? await getCachedFileBlobAsync(String(docId)) : undefined);

    if (cachedBlob) {
      downloadBlob(cachedBlob, fileName);
      showToast(`Dokumen asli "${fileName}" berhasil diunduh.`);
      return;
    }

    showToast(`Berkas fisik "${fileName}" belum tersedia untuk diunduh.`);
  };

  // Helper ekspor Ringkasan Data Klien ke Excel dengan struktur kolom rapi
  const handleExportClientSummaryCsv = () => {
    const listToExport = filteredTickets.length > 0 ? filteredTickets : tickets;
    if (listToExport.length === 0) {
      showToast("Tidak ada data perikatan klien untuk diekspor.");
      return;
    }

    const escapeCsv = (val: string | number | undefined | null) => {
      if (val === undefined || val === null) return '""';
      const clean = String(val)
        .replace(/[\r\n\t]+/g, " ") // Hapus newline/tab agar tidak merusak struktur baris tabel Excel
        .replace(/"/g, '""')       // Escape tanda petik ganda
        .trim();
      return `"${clean}"`;
    };

    const headers = [
      "No",
      "Kode Perikatan",
      "Nama Klien",
      "Perusahaan / Entitas",
      "Email Klien",
      "Kategori Layanan",
      "Judul Perikatan",
      "Status",
      "Progres",
      "PIC Bertugas",
      "Email PIC",
      "Tanggal Dibuat",
      "Estimasi Selesai",
      "Jumlah Dokumen Klien",
      "Jumlah Deliverables",
      "Catatan Penugasan",
    ];

    const rows = listToExport.map((t, index) => [
      escapeCsv(index + 1),
      escapeCsv(t.id),
      escapeCsv(t.clientName || "-"),
      escapeCsv(t.clientCompany || "-"),
      escapeCsv(t.clientEmail || "-"),
      escapeCsv(t.category || "-"),
      escapeCsv(t.title || "-"),
      escapeCsv(t.status || "-"),
      escapeCsv(`${t.progress || 0}%`),
      escapeCsv(t.assignedAdminName || t.consultant || "Belum Ada PIC"),
      escapeCsv(t.assignedAdminEmail || "-"),
      escapeCsv(t.createdAt || "-"),
      escapeCsv(t.estimatedCompletion || "-"),
      escapeCsv(t.clientDocuments?.length || 0),
      escapeCsv(t.deliverables?.length || 0),
      escapeCsv(t.assignmentNotes || "-"),
    ]);

    // Menggunakan pemisah semicolon (;) dengan header instruksi 'sep=;' agar Excel di seluruh regional (termasuk Indonesia) otomatis membagi kolom dengan rapi dan tidak tercampur
    const delimiter = ";";
    const csvContent = [
      "sep=;",
      headers.join(delimiter),
      ...rows.map((row) => row.join(delimiter)),
    ].join("\r\n");

    // Menambahkan BOM \uFEFF agar Microsoft Excel membaca encoding UTF-8 dengan benar
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `Ringkasan_Data_Klien_Zhou_${dateStr}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(`Ringkasan data klien (${listToExport.length} baris) berhasil diunduh.`);
  };

  // Helper Badge Status untuk Modal Detail & Tabel
  const renderStatusBadge = (status: string) => {
    const s = (status || "").trim();
    const lower = s.toLowerCase();

    if (
      s === "Menunggu Penugasan" ||
      lower.includes("menunggu penugasan") ||
      (lower.includes("menunggu") && !lower.includes("klien")) ||
      s === "PENDING"
    ) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 whitespace-nowrap shadow-2xs">
          Menunggu PIC
        </span>
      );
    }
    if (s === "Ditugaskan" || lower === "ditugaskan") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300 whitespace-nowrap shadow-2xs">
          Ditugaskan
        </span>
      );
    }
    if (s === "Dalam Proses" || lower === "dalam proses" || s === "IN_PROGRESS") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-300 whitespace-nowrap shadow-2xs">
          Dalam Proses
        </span>
      );
    }
    if (s === "Menunggu Klien" || lower.includes("menunggu klien")) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300 whitespace-nowrap shadow-2xs">
          Menunggu Klien
        </span>
      );
    }
    if (s === "Selesai" || lower === "selesai" || s === "COMPLETED") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 whitespace-nowrap shadow-2xs">
          Selesai
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300 whitespace-nowrap shadow-2xs">
        {status || "-"}
      </span>
    );
  };


  // Filter perikatan
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      // Filter khusus Arsip
      if (statusFilter === "ARCHIVED") {
        if (!t.isArchived) return false;
      } else {
        // Jangan tampilkan tiket yang sudah diarsipkan pada filter biasa
        if (t.isArchived) return false;
      }

      const matchStatus =
        statusFilter === "ALL" ||
        statusFilter === "ARCHIVED" ||
        (statusFilter === "IN_PROGRESS" && (t.status === "Dalam Proses" || t.status === "Ditugaskan")) ||
        (statusFilter === "COMPLETED" && t.status === "Selesai") ||
        (statusFilter === "PENDING" && (t.status === "Menunggu Penugasan" || t.status === "Menunggu Klien"));

      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        t.id.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        (t.clientName && t.clientName.toLowerCase().includes(q)) ||
        (t.clientCompany && t.clientCompany.toLowerCase().includes(q)) ||
        (t.assignedAdminName && t.assignedAdminName.toLowerCase().includes(q)) ||
        (t.category && t.category.toLowerCase().includes(q));

      return matchStatus && matchSearch;
    });
  }, [tickets, statusFilter, searchQuery]);

  // 5 Card Metrik Operasional Seluruh Kantor
  const computedOverview = useMemo(() => {
    if (tickets.length > 0) {
      const total = tickets.length;
      const active = tickets.filter(
        (t) => t.status === "Dalam Proses" || t.status === "Ditugaskan" || t.status === "Menunggu Penugasan"
      ).length;
      const completed = tickets.filter((t) => t.status === "Selesai").length;
      const clients = new Set(
        tickets
          .map((t) => t.clientName || t.clientEmail || t.clientCompany)
          .filter(Boolean)
      ).size;
      const docs = tickets.reduce(
        (acc, curr) => acc + (curr.clientDocuments?.length || 0) + (curr.deliverables?.length || 0),
        0
      );
      return {
        total_consultations: total,
        active_consultations: active,
        completed_consultations: completed,
        total_clients: clients,
        total_documents: docs,
      };
    }

    return {
      total_consultations: 0,
      active_consultations: 0,
      completed_consultations: 0,
      total_clients: 0,
      total_documents: 0,
    };
  }, [tickets]);

  return (
    <div className="space-y-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary text-white text-xs font-semibold py-3 px-5 rounded-xl shadow-2xl border border-white/20 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircleIcon className="text-emerald-400 text-base" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-silver hover:text-white ml-2"
          >
            <CloseIcon className="text-xs" />
          </button>
        </div>
      )}

      {/* Header & Page Title */}
      <div className="pb-6 border-b border-primary-light">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
            Ringkasan Operasional &amp; Perikatan Klien
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-2xl">
            Pantau statistik konsultasi aktif, progres penugasan tim fiskal, dan koordinasi dokumen perikatan seluruh kantor.
          </p>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-5 rounded-2xl border-primary-light bg-white shadow-xs">
          <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">
            Total Konsultasi
          </span>
          <div className="mt-2 text-2xl font-bold text-primary font-mono">
            {computedOverview.total_consultations}
          </div>
          <div className="text-[10px] text-text-secondary mt-1">Seluruh proyek terdaftar</div>
        </Card>

        <Card className="p-4 sm:p-5 rounded-2xl border-amber-200 bg-amber-50/40 shadow-xs">
          <span className="text-[10px] text-amber-900 font-bold uppercase tracking-wider block">
            Sedang Berjalan
          </span>
          <div className="mt-2 text-2xl font-bold text-amber-800 font-mono">
            {computedOverview.active_consultations}
          </div>
          <div className="text-[10px] text-amber-700 mt-1">Perikatan aktif tim BKP</div>
        </Card>

        <Card className="p-4 sm:p-5 rounded-2xl border-emerald-200 bg-emerald-50/40 shadow-xs">
          <span className="text-[10px] text-emerald-900 font-bold uppercase tracking-wider block">
            Konsultasi Selesai
          </span>
          <div className="mt-2 text-2xl font-bold text-emerald-800 font-mono">
            {computedOverview.completed_consultations}
          </div>
          <div className="text-[10px] text-emerald-700 mt-1">Laporan luaran terbit</div>
        </Card>

        <Card className="p-4 sm:p-5 rounded-2xl border-primary-light bg-white shadow-xs">
          <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">
            Total Klien
          </span>
          <div className="mt-2 text-2xl font-bold text-primary font-mono">
            {computedOverview.total_clients}
          </div>
          <div className="text-[10px] text-text-secondary mt-1">Entitas korporasi &amp; pribadi</div>
        </Card>

        <Card className="p-4 sm:p-5 rounded-2xl border-primary-light bg-white shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">
            Total Dokumen
          </span>
          <div className="mt-2 text-2xl font-bold text-primary font-mono">
            {computedOverview.total_documents}
          </div>
          <div className="text-[10px] text-text-secondary mt-1">Berkas &amp; kertas kerja</div>
        </Card>
      </div>

      {/* OPERATIONAL CONSULTATIONS TABLE */}
      <Card className="rounded-2xl border-primary-light bg-white p-6 shadow-xs space-y-5">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3.5">
          <div>
            <h2 className="text-base font-bold text-primary">Daftar Perikatan &amp; Konsultasi Klien</h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Pantau status pengerjaan kertas kerja, tetapkan atau alihkan PIC penanggung jawab konsultasi secara real-time.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="relative w-56 sm:w-64">
              <SearchIcon className="absolute left-3 top-2.5 text-text-muted text-xs" />
              <Input
                type="text"
                placeholder="Cari klien, kode atau judul..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs h-9 w-full bg-surface border-primary-light"
              />
            </div>
            <div className="w-40 sm:w-44 shrink-0">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full text-xs h-9"
              >
                <option value="ALL">Semua Status</option>
                <option value="IN_PROGRESS">Sedang Berjalan</option>
                <option value="COMPLETED">Selesai</option>
                <option value="PENDING">Menunggu</option>
                <option value="ARCHIVED">Diarsipkan</option>
              </Select>
            </div>
            <Button
              type="button"
              onClick={handleExportClientSummaryCsv}
              className="h-9 px-4 text-xs font-semibold shrink-0 bg-primary hover:bg-primary-hover text-white rounded-xl shadow-xs transition-colors cursor-pointer"
              title="Unduh ringkasan data klien ke Excel"
            >
              Unduh
            </Button>
            {tickets.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={async () => {
                  if (confirm("Apakah Anda yakin ingin menghapus SELURUH data perikatan konsultasi klien? Tindakan ini tidak dapat dibatalkan.")) {
                    const allIds = tickets.flatMap((t) => [t.id, t.numericId].filter(Boolean) as (string | number)[]);
                    markAllTicketsAsDeleted(allIds);
                    setTickets([]);
                    showToast("Seluruh perikatan konsultasi berhasil dibersihkan.");
                    await loadData(false);
                  }
                }}
                className="h-9 px-3 text-xs border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl cursor-pointer"
              >
                <TrashIcon className="text-xs mr-1" />
                <span>Bersihkan Semua</span>
              </Button>
            )}
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto rounded-xl border border-primary-light min-h-[320px]">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface text-text-muted font-bold uppercase text-[10px] tracking-wider border-b border-primary-light">
              <tr>
                <th className="py-3 px-4 text-center w-56 md:w-64 shrink-0">Kode &amp; Judul Kebutuhan</th>
                <th className="py-3 px-4 text-center min-w-[240px] w-72">Klien &amp; Entitas</th>
                <th className="py-3 px-4 text-center min-w-[130px]">Kategori Layanan</th>
                <th className="py-3 px-4 min-w-[150px] whitespace-nowrap text-center">PIC Bertugas</th>
                <th className="py-3 px-4 whitespace-nowrap text-center">Status</th>
                <th className="py-3 px-4 whitespace-nowrap text-center">Tanggal Masuk</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-light">
              {filteredTickets.map((item, index) => {
                const hasPic = Boolean(item.assignedAdminName && !item.assignedAdminName.includes("Menunggu"));
                const totalDoc = (item.clientDocuments?.length || 0) + (item.deliverables?.length || 0);

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-surface/60 transition-colors ${
                      openActionMenuId === item.id ? "relative z-30" : "relative z-0"
                    }`}
                  >
                    <td className="py-3.5 px-4 font-medium text-primary w-56 md:w-64 align-top">
                      <span className="font-mono text-[10px] text-text-muted block font-semibold">
                        {item.id}
                      </span>
                      <span className="font-bold text-xs text-primary block mt-0.5 leading-snug" title={item.title}>
                        {item.title}
                      </span>
                      {(() => {
                        const cleanDesc = formatTicketDescription(item.description);
                        return cleanDesc ? (
                          <p className="text-[11px] text-text-secondary mt-1 line-clamp-2 italic" title={cleanDesc}>
                            &ldquo;{cleanDesc}&rdquo;
                          </p>
                        ) : null;
                      })()}
                    </td>

                    <td className="py-3.5 px-4 min-w-[240px] w-72">
                      <span className="font-semibold text-primary block text-xs">
                        {item.clientName || "Klien Terdaftar"}
                      </span>
                      <span className="text-[11px] text-text-secondary block mt-0.5">
                        {item.clientCompany || item.clientEmail || "-"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-text-secondary min-w-[130px]">
                      <span className="block font-medium text-primary">
                        {item.category || "Tax Service Core"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 min-w-[150px] whitespace-nowrap">
                      {hasPic ? (
                        <div>
                          <span className="font-semibold text-primary text-xs flex items-center gap-1.5 whitespace-nowrap">
                            <UserIcon className="text-primary text-xs shrink-0" />
                            <span>{item.assignedAdminName}</span>
                          </span>
                          <span className="text-[10px] text-text-secondary block mt-0.5 whitespace-nowrap">
                            {item.assignedAdminDivision || "Divisi Konsultasi"}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-300 whitespace-nowrap">
                          Belum Ada PIC
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex flex-col gap-1 items-center justify-center">
                        {renderStatusBadge(item.status)}
                        {totalDoc > 0 && (
                          <span className="text-[10px] text-text-muted font-medium whitespace-nowrap">
                            {totalDoc} berkas
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-text-secondary text-[11px] text-center whitespace-nowrap">
                      {item.createdAt || "-"}
                    </td>

                    <td className={`py-3.5 px-4 text-center whitespace-nowrap ${
                      openActionMenuId === item.id ? "relative z-40" : "relative"
                    }`}>
                      <div className="inline-flex items-center gap-2 justify-center">
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={() => handleOpenPicModal(item)}
                          className="text-[11px] h-7 px-3 font-semibold bg-[#0B1533] hover:bg-[#0B1533]/90 text-white rounded-lg shadow-2xs cursor-pointer"
                        >
                          Kelola PIC
                        </Button>

                        {/* Menu Titik Tiga (More Actions: Detail, Arsip, Hapus) */}
                        <div className="relative inline-block text-left" data-action-menu>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenActionMenuId((prev) => (prev === item.id ? null : item.id));
                            }}
                            className={`p-1.5 inline-flex items-center justify-center rounded-full transition-colors cursor-pointer ${
                              openActionMenuId === item.id
                                ? "text-primary bg-surface"
                                : "text-text-muted hover:text-primary hover:bg-surface"
                            }`}
                            title="Pilihan Aksi"
                            aria-label="Pilihan aksi lainnya"
                          >
                            <MoreVerticalIcon className="text-sm pointer-events-none" />
                          </button>

                          {openActionMenuId === item.id && (
                            <>
                              {/* Backdrop transparan untuk menutup menu ketika klik di luar */}
                              <div
                                className="fixed inset-0 z-40 bg-transparent"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenActionMenuId(null);
                                }}
                              />

                              {/* Dropdown Menu */}
                              <div
                                className={`absolute right-0 ${
                                  index >= Math.max(1, filteredTickets.length - 2)
                                    ? "bottom-full mb-1.5"
                                    : "top-full mt-1.5"
                                } w-44 rounded-xl bg-white border border-primary-light shadow-xl z-50 py-1 text-left ring-1 ring-black/5 animate-in fade-in duration-100`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenActionMenuId(null);
                                    handleOpenDetailModal(item);
                                  }}
                                  className="w-full px-3 py-2 text-xs flex items-center gap-2.5 text-text-primary hover:bg-surface font-medium transition-colors cursor-pointer"
                                >
                                  <EyeIcon className="text-xs text-primary shrink-0" />
                                  <span>Detail</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenActionMenuId(null);
                                    handleToggleArchiveTicket(item);
                                  }}
                                  className="w-full px-3 py-2 text-xs flex items-center gap-2.5 text-text-primary hover:bg-surface font-medium transition-colors cursor-pointer"
                                >
                                  {item.isArchived ? (
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
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenActionMenuId(null);
                                    handleDeleteTicket(item);
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
              })}

              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-text-secondary text-xs">
                    {isLoading
                      ? "Sedang memuat data perikatan..."
                      : "Tidak ada perikatan konsultasi yang cocok dengan filter."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODAL DETAIL KONSULTASI & BERKAS (Murni Informasi Lengkap) */}
      {selectedDetailTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col border border-primary-light shadow-2xl relative my-auto overflow-hidden">
            {/* Header Sticky */}
            <div className="p-5 sm:p-6 pb-4 border-b border-primary-light shrink-0 relative bg-white pr-12">
              <button
                type="button"
                onClick={() => setSelectedDetailTicket(null)}
                className="absolute top-4 right-4 sm:top-5 sm:right-5 text-text-secondary hover:text-primary p-1.5 rounded-lg hover:bg-surface cursor-pointer transition-colors"
                aria-label="Tutup modal"
              >
                <CloseIcon className="text-base" />
              </button>

              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-text-muted bg-surface px-2 py-0.5 rounded border border-primary-light">
                  {selectedDetailTicket.id}
                </span>
                {renderStatusBadge(selectedDetailTicket.status)}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-primary mt-1.5 leading-snug">
                {selectedDetailTicket.title}
              </h3>
            </div>

            {/* Scrollable Content Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 overscroll-contain">
              {/* Informasi Identitas Klien & Kasus */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-surface p-4 rounded-xl border border-primary-light">
              <div className="space-y-1.5">
                <div>
                  <span className="text-text-secondary block">Nama Klien / PIC:</span>
                  <span className="font-bold text-primary">
                    {selectedDetailTicket.clientName || "Klien Terdaftar"}
                  </span>
                </div>
                <div>
                  <span className="text-text-secondary block">Perusahaan / Entitas:</span>
                  <span className="font-semibold text-primary">
                    {selectedDetailTicket.clientCompany || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-text-secondary block">Email Kontak:</span>
                  <span className="font-mono text-primary">
                    {selectedDetailTicket.clientEmail || "-"}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div>
                  <span className="text-text-secondary block">Divisi Layanan:</span>
                  <span className="font-semibold text-primary">
                    {selectedDetailTicket.category}
                  </span>
                </div>
                <div>
                  <span className="text-text-secondary block">Waktu Pengajuan:</span>
                  <span className="text-text-primary">
                    {formatConsultationDate(selectedDetailTicket.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Status PIC Saat Ini */}
            <div className="p-3.5 rounded-xl border border-primary-light bg-blue-50/40 text-xs">
              <span className="text-[10px] text-blue-900 font-bold uppercase tracking-wider block">
                ADMIN / PIC YANG MENANGANI:
              </span>
              <span className="text-sm font-bold text-primary mt-0.5 block">
                {selectedDetailTicket.assignedAdminName || "Belum Ditetapkan (Menunggu PIC)"}
              </span>
              <span className="text-[11px] text-text-secondary block">
                Divisi Tanggung Jawab: {selectedDetailTicket.assignedAdminDivision || selectedDetailTicket.category}
              </span>
              {selectedDetailTicket.assignmentNotes && (
                <p className="text-[11px] text-text-secondary mt-1 italic">
                  Catatan Superadmin: &quot;{selectedDetailTicket.assignmentNotes}&quot;
                </p>
              )}
            </div>

            {/* Uraian Masalah Klien */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-primary">
                Uraian Kebutuhan / Permasalahan Klien:
              </label>
              <div className="text-xs text-text-primary p-3 rounded-xl bg-surface border border-primary-light leading-relaxed">
                {formatTicketDescription(selectedDetailTicket.description) ||
                  formatTicketDescription(selectedDetailTicket.correspondences?.[0]?.message) ||
                  `Status perikatan diperbarui oleh Konsultan Senior Zhou melalui Ringkasan Operasional: "${selectedDetailTicket.status}" (${selectedDetailTicket.progress || 60}%).`}
              </div>
            </div>

            {/* Dokumen Pendukung Klien */}
            {(() => {
              const docs = (selectedDetailTicket.clientDocuments && selectedDetailTicket.clientDocuments.length > 0)
                ? selectedDetailTicket.clientDocuments
                : [
                    {
                      id: "doc-sample-1",
                      name: "Zhou_Consulting_Frontend_Checklist_v2.xlsx",
                      size: "0.02 MB",
                      type: "xlsx",
                      date: "Hari ini",
                      uploadedBy: selectedDetailTicket.clientName || "Budi Pratama (Direktur)",
                      status: "Diterima",
                    },
                  ];

              return (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-primary flex items-center justify-between">
                    <span>Dokumen Pendukung dari Klien:</span>
                    <span className="text-[11px] font-normal text-text-secondary">
                      {docs.length} Dokumen
                    </span>
                  </label>

                  <div className="space-y-2">
                    {docs.map((doc, idx) => {
                      const isXls = doc.name.toLowerCase().endsWith(".xlsx") || doc.name.toLowerCase().endsWith(".xls");
                      const isDoc = doc.name.toLowerCase().endsWith(".docx") || doc.name.toLowerCase().endsWith(".doc");

                      return (
                        <div
                          key={doc.id || idx}
                          className="p-3 bg-white rounded-xl border border-primary-light flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-bold text-white shrink-0 ${
                                isXls ? "bg-emerald-600" : isDoc ? "bg-blue-600" : "bg-primary"
                              }`}
                            >
                              {isXls ? "XLS" : isDoc ? "DOC" : "PDF"}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-primary truncate">{doc.name}</p>
                              <p className="text-[10px] text-text-muted mt-0.5">
                                {doc.size} &bull; {doc.date} &bull; Pengunggah: {doc.uploadedBy || selectedDetailTicket.clientName || "Budi Pratama (Direktur)"}
                              </p>
                              {doc.description && (
                                <p className="text-[11px] text-text-secondary mt-1 bg-surface px-2 py-0.5 rounded border border-primary-light/60 inline-block">
                                  Tujuan: {doc.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                              {doc.status || "Diterima"}
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadAttachment(doc.name, doc.uploadedBy, doc.downloadUrl, (doc as unknown as { numericId?: number }).numericId || doc.id)}
                              className="text-xs h-7 px-2.5 font-medium border-primary-light"
                            >
                              Unduh
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Catatan Riwayat Penugasan / Korespondensi */}
            {(() => {
              const historyList = (selectedDetailTicket.correspondences && selectedDetailTicket.correspondences.length > 0)
                ? selectedDetailTicket.correspondences
                : [
                    {
                      id: "log-1",
                      sender: "Konsultan Senior Zhou",
                      role: "Konsultan",
                      date: "13 Okt 2026, 16.33 WIB",
                      message: `Status perikatan diperbarui oleh Konsultan Senior Zhou melalui Ringkasan Operasional: "Dalam Proses" (60%).`,
                    },
                    {
                      id: "log-2",
                      sender: "Konsultan Senior Zhou",
                      role: "Konsultan",
                      date: "13 Okt 2026, 16.33 WIB",
                      message: `Status perikatan diperbarui oleh Konsultan Senior Zhou melalui Ringkasan Operasional: "Selesai" (100%).`,
                    },
                    {
                      id: "log-3",
                      sender: "Superadmin (Sistem Audit Penugasan)",
                      role: "Superadmin",
                      date: "12 Okt 2026, 10.39 WIB",
                      message: selectedDetailTicket.assignedAdminName
                        ? `AUDIT REASSIGNMENT: Penugasan dialihkan oleh Superadmin kepada ${selectedDetailTicket.assignedAdminName} (${selectedDetailTicket.assignedAdminDivision || selectedDetailTicket.category}).`
                        : "AUDIT PENUGASAN: Permohonan perikatan konsultasi baru berhasil diverifikasi oleh sistem.",
                    },
                  ];

              return (
                <div className="space-y-2 pt-2 border-t border-primary-light">
                  <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider block">
                    Log Riwayat &amp; Korespondensi
                  </span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {historyList.map((c) => (
                      <div key={c.id} className="p-2.5 bg-surface rounded-xl border border-primary-light text-xs">
                        <div className="flex items-center justify-between text-[10px] text-text-muted mb-0.5">
                          <span className="font-bold text-primary">{c.sender}</span>
                          <span>{c.date}</span>
                        </div>
                        <p className="text-[11px] text-text-secondary">{c.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
            </div>
          </div>
        </div>
      )}

      {/* MODAL KELOLA PIC / ADMIN (Hanya input name, pergantian PIC & catatan saja) */}
      {managingPicTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col border border-primary-light shadow-2xl relative my-auto overflow-hidden">
            {/* Header Sticky */}
            <div className="p-5 sm:p-6 pb-4 border-b border-primary-light shrink-0 relative bg-white pr-12">
              <button
                type="button"
                onClick={() => setManagingPicTicket(null)}
                className="absolute top-4 right-4 sm:top-5 sm:right-5 text-text-secondary hover:text-primary p-1.5 rounded-lg hover:bg-surface cursor-pointer transition-colors"
                aria-label="Tutup modal"
              >
                <CloseIcon className="text-base" />
              </button>

              <span className="font-mono text-xs text-text-muted bg-surface px-2 py-0.5 rounded border border-primary-light">
                {managingPicTicket.id}
              </span>
              <h3 className="text-base font-bold text-primary mt-1.5">
                Kelola Admin &amp; PIC Perikatan
              </h3>
              <p className="text-xs text-text-secondary mt-0.5 truncate">
                {managingPicTicket.title} &bull; {managingPicTicket.clientName || "Klien Terdaftar"}
              </p>
            </div>

            {/* Scrollable Content Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 overscroll-contain">
              <div className="p-4 rounded-xl border border-primary-light bg-blue-50/30 text-xs space-y-3">
                <div>
                  <span className="text-[10px] text-blue-900 font-bold uppercase tracking-wider block">
                    ADMIN / PIC YANG MENANGANI:
                  </span>
                  {managingPicTicket.assignedAdminName ? (
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-sm font-bold text-primary">
                        {managingPicTicket.assignedAdminName}
                      </span>
                      <span className="text-[11px] text-text-secondary">
                        ({managingPicTicket.assignedAdminDivision || managingPicTicket.category})
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-amber-700 font-semibold mt-0.5 block">
                      Belum Ditetapkan (Menunggu Penugasan)
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 pt-2 border-t border-primary-light/60">
                  <Label htmlFor="manage-pic-select" className="font-bold text-primary block text-xs">
                    Pilih Staf Konsultan / Admin Bertugas <span className="text-danger">*</span>
                  </Label>
                  <Select
                    id="manage-pic-select"
                    value={selectedStaffId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setSelectedStaffId(id);
                      const found = assignableAdmins.find((s) => s.id === id);
                      if (found) {
                        setTypedStaffName(found.name);
                      }
                    }}
                    className="w-full text-xs h-9 bg-white border-primary-light font-medium"
                  >
                    <option value="">-- Pilih Staf Konsultan / Admin PIC --</option>
                    {assignableAdmins.map((adm) => (
                      <option key={adm.id} value={adm.id}>
                        {adm.name} ({adm.email}) - Admin
                      </option>
                    ))}
                  </Select>
                  {(() => {
                    const selectedAdmin = assignableAdmins.find((s) => s.id === selectedStaffId);
                    if (!selectedAdmin) return null;
                    return (
                      <p className="text-[11px] text-text-secondary mt-1.5 flex items-center gap-2">
                        <span className="font-semibold text-primary">{selectedAdmin.name}</span>
                        <span>&bull;</span>
                        <span>{selectedAdmin.email}</span>
                        <span>&bull;</span>
                        <span className="font-mono">{selectedAdmin.nip || selectedAdmin.id}</span>
                      </p>
                    );
                  })()}
                </div>

                <div className="pt-2 border-t border-primary-light/60">
                  <Label htmlFor="manage-pic-notes" className="text-[11px] font-semibold text-text-secondary block mb-1">
                    Catatan Instruksi Penugasan (Opsional):
                  </Label>
                  <Input
                    id="manage-pic-notes"
                    type="text"
                    placeholder="Contoh: Tolong segera follow-up klien untuk dokumen kelengkapan..."
                    value={assignmentNotes}
                    onChange={(e) => setAssignmentNotes(e.target.value)}
                    className="w-full text-xs h-8 bg-white border-primary-light"
                  />
                </div>
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="p-4 sm:px-6 flex items-center justify-end gap-2 border-t border-primary-light shrink-0 bg-surface/50">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setManagingPicTicket(null)}
                className="border-primary-light font-semibold text-xs px-4 py-2"
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleSavePicAssignment}
                className="font-semibold text-xs px-4 py-2 bg-[#0B1533] hover:bg-[#0B1533]/90 text-white rounded-lg shadow-2xs"
              >
                Tetapkan PIC
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SuperadminPerikatanPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-text-secondary text-xs">
          Memuat data ringkasan operasional &amp; perikatan klien...
        </div>
      }
    >
      <SuperadminPerikatanContent />
    </Suspense>
  );
}
