"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth, isDummyTicket, normalizeRole } from "@/context/AuthContext";
import { adminApi, ConsultationItem } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircleIcon,
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
  TICKETS_UPDATED_EVENT,
  DOCUMENTS_UPDATED_EVENT,
  ClientTicket,
  StaffAdminProfile,
  ConsultationStatus,
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


  // Kirim Seluruh Dokumen & Catatan dari dalam Modal Detail
  const handleSendDocFromDetail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    if (!canAdminAccessTicket(selectedTicket, activeStaffProfile)) {
      showToast("Akses ditolak: Anda tidak memiliki hak akses terhadap konsultasi ini.");
      return;
    }

    if (!detailSendFile && !detailDocNotes.trim()) {
      showToast("Silakan pilih dokumen yang ingin dikirim atau isi kolom catatan konsultan.");
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
      } else {
        combinedMessage = detailDocNotes.trim();
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
          nextProgress = currentTicket.progress >= 100 ? 60 : currentTicket.progress;
        }
      }

      const updateRes = updateTicketByStaff(currentTicket.id, activeStaffProfile, {
        status: nextStatus,
        progress: nextProgress,
        notes: combinedMessage,
      });

      if (updateRes.success && updateRes.ticket) {
        setSelectedTicket(updateRes.ticket);
        showToast(
          detailSendFile
            ? `Dokumen "${fileName}" dan catatan berhasil dikirimkan ke Klien.`
            : `Catatan konsultan berhasil disimpan dan dikirimkan ke Klien.`
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
      showToast("Terjadi kendala saat memproses dokumen.");
    } finally {
      setIsSendingDetailDoc(false);
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
                <th className="py-3 px-4">Kode &amp; Judul Tugas</th>
                <th className="py-3 px-4">Klien &amp; Entitas</th>
                <th className="py-3 px-4">Kategori Layanan</th>
                <th className="py-3 px-4">Status &amp; Progres</th>
                <th className="py-3 px-4">Dokumen</th>
                <th className="py-3 px-4">Estimasi Selesai</th>
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
                      {ticket.priority && (
                        <span
                          className={`inline-block mt-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            ticket.priority === "Mendesak"
                              ? "bg-red-100 text-red-800"
                              : ticket.priority === "Tinggi"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          Prioritas {ticket.priority}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            ticket.status === "Selesai"
                              ? "bg-emerald-100 text-emerald-800"
                              : ticket.status === "Dalam Proses"
                              ? "bg-amber-100 text-amber-800"
                              : ticket.status === "Menunggu Klien"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {ticket.status}
                        </span>
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

                    <td className="py-3.5 px-4 text-text-secondary">
                      {clientDocCount > 0 ? (
                        <button
                          type="button"
                          onClick={() => handleDirectClientDocClick(ticket)}
                          className="flex items-center gap-1.5 text-primary hover:text-primary-dark group cursor-pointer text-left"
                          title="Klik untuk langsung mengunduh berkas klien"
                        >
                          <DocumentIcon className="text-text-muted group-hover:text-primary text-xs" />
                          <span className="text-xs font-semibold group-hover:underline">{totalDoc} berkas</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <DocumentIcon className="text-text-muted text-xs" />
                          <span className="text-xs font-semibold text-primary">{totalDoc} berkas</span>
                        </div>
                      )}
                      {clientDocCount > 0 && (
                        <span className="text-[10px] text-text-muted block">
                          {clientDocCount} dari klien
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-text-secondary text-[11px]">
                      <div>{ticket.estimatedCompletion || "Menunggu Penetapan PIC"}</div>
                      <div className="text-[10px] text-text-muted">
                        Masuk: {ticket.createdAt || "Hari ini"}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => setSelectedTicket(ticket)}
                        className="text-xs font-semibold px-3.5 py-1.5 bg-[#0B1533] hover:bg-[#0B1533]/90 text-white rounded-xl shadow-2xs"
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

      {/* MODAL DETAIL KONSULTASI UNTUK PIC */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-primary-light max-w-4xl w-full p-6 sm:p-7 space-y-4 max-h-[90vh] overflow-y-auto relative">
            <button
              type="button"
              onClick={() => setSelectedTicket(null)}
              className="absolute top-5 right-5 text-text-secondary hover:text-primary p-1 cursor-pointer"
              aria-label="Tutup modal"
            >
              <CloseIcon className="text-sm" />
            </button>

            {/* Header Modal */}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-text-muted bg-surface px-2 py-0.5 rounded border border-primary-light">
                  {selectedTicket.id}
                </span>
                {renderStatusBadge(selectedTicket.status)}
              </div>
              <h3 className="text-lg font-bold text-primary mt-1">
                {selectedTicket.title}
              </h3>
            </div>

            {/* Ringkasan Informasi Klien & Penugasan (Tanpa Kotak/Tabel) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
              <div>
                <span className="text-xs font-bold text-primary block mb-1">Klien / Entitas</span>
                <span className="font-semibold text-sm text-primary block truncate">
                  {selectedTicket.clientName || "Klien Terdaftar"}
                </span>
                <span className="text-xs text-text-secondary block truncate mt-0.5">
                  {selectedTicket.clientCompany || "-"}
                </span>
              </div>

              <div>
                <span className="text-xs font-bold text-primary block mb-1">Divisi Layanan</span>
                <span className="font-semibold text-sm text-primary block truncate">
                  {selectedTicket.category}
                </span>
                <span className="text-xs text-text-secondary block truncate mt-0.5">
                  Prioritas: {selectedTicket.priority || "Normal"}
                </span>
              </div>

              <div>
                <span className="text-xs font-bold text-primary block mb-1">Kontak Klien</span>
                <span className="font-semibold text-sm text-primary block truncate">
                  {selectedTicket.clientEmail || "-"}
                </span>
                <span className="text-xs text-text-secondary block truncate mt-0.5">
                  {selectedTicket.clientPhone || "PIC Terhubung"}
                </span>
              </div>
            </div>

            {/* Uraian Singkat Kebutuhan Klien (Tanpa Kotak/Tabel) */}
            <div className="space-y-1 text-xs">
              <span className="font-bold text-primary block">
                Uraian Kebutuhan Kasus:
              </span>
              <p className="text-text-secondary leading-relaxed">
                {selectedTicket.description?.trim() || "Belum ada rincian kebutuhan yang diinputkan oleh klien."}
              </p>
            </div>

            {/* Grid 2 Kolom Berkas: Dokumen Klien (Kiri) & Dokumen Terkirim (Kanan) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Kolom 1: Berkas dari Klien */}
              <div className="space-y-2 p-3 bg-surface/40 rounded-xl border border-primary-light">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary">Dokumen dari Klien</span>
                  <span className="text-[10px] text-text-muted">
                    {selectedTicket.clientDocuments?.length || 0} Berkas
                  </span>
                </div>

                {(!selectedTicket.clientDocuments || selectedTicket.clientDocuments.length === 0) ? (
                  <div className="p-3 bg-white rounded-lg border border-dashed border-primary-light text-center text-xs text-text-secondary">
                    Tidak ada berkas dari klien.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-0.5">
                    {selectedTicket.clientDocuments.map((doc, idx) => (
                      <div
                        key={doc.id || idx}
                        className="p-2 bg-white rounded-lg border border-primary-light flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => handleDownloadClientDoc(doc.name, doc.uploadedBy, selectedTicket.id)}
                            className="font-semibold text-primary truncate text-xs text-left hover:underline block max-w-full cursor-pointer"
                            title="Klik untuk mengunduh berkas"
                          >
                            {doc.name}
                          </button>
                          <p className="text-[10px] text-text-muted">{doc.size}</p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadClientDoc(doc.name, doc.uploadedBy, selectedTicket.id)}
                          className="text-xs h-6 px-2 font-medium shrink-0"
                        >
                          Unduh
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Kolom 2: Berkas Terkirim ke Klien */}
              <div className="space-y-2 p-3 bg-surface/40 rounded-xl border border-primary-light">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary">Dokumen Terkirim</span>
                  <span className="text-[10px] text-text-muted">
                    {selectedTicket.deliverables?.length || 0} Berkas
                  </span>
                </div>

                {(!selectedTicket.deliverables || selectedTicket.deliverables.length === 0) ? (
                  <div className="p-3 bg-white rounded-lg border border-dashed border-primary-light text-center text-xs text-text-secondary">
                    Belum ada dokumen yang dikirimkan.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-0.5">
                    {selectedTicket.deliverables.map((deliv, idx) => (
                      <div
                        key={deliv.id || idx}
                        className="p-2 bg-white rounded-lg border border-primary-light flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => handleDownloadClientDoc(deliv.name, "Konsultan PIC", selectedTicket.id)}
                            className="font-semibold text-primary truncate text-xs text-left hover:underline block max-w-full cursor-pointer"
                            title="Klik untuk mengunduh berkas"
                          >
                            {deliv.name}
                          </button>
                          <p className="text-[10px] text-text-muted">{deliv.size}</p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadClientDoc(deliv.name, "Konsultan PIC", selectedTicket.id)}
                          className="text-xs h-6 px-2 font-medium shrink-0"
                        >
                          Unduh
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Form Ringkas: Kirim Seluruh Dokumen & Catatan */}
            <div className="p-3.5 bg-surface rounded-xl border border-primary-light space-y-3">
              <span className="text-xs font-bold text-primary block">
                Kirim Dokumen &amp; Catatan
              </span>

              <form id="detail-send-form" onSubmit={handleSendDocFromDetail} className="space-y-2.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <Label htmlFor="detail-doc-category" className="text-[11px] font-semibold text-text-secondary block">
                      Kategori Dokumen
                    </Label>
                    <Select
                      id="detail-doc-category"
                      value={detailDocCategory}
                      onChange={(e) => setDetailDocCategory(e.target.value)}
                      className="w-full text-xs h-8 bg-white"
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
                      className="w-full text-xs h-8 bg-white"
                    >
                      <option value="">Tetap ({selectedTicket.status})</option>
                      <option value="Dalam Proses">Dalam Proses</option>
                      <option value="Menunggu Klien">Menunggu Klien</option>
                      <option value="Selesai">Selesai</option>
                    </Select>
                  </div>
                </div>

                {/* Pilih File Dokumen (Sesuai Gaya Dropzone Gambar 2) */}
                <div className="space-y-1">
                  <Label htmlFor="detail-file-input" className="text-[11px] font-semibold text-text-secondary block">
                    Berkas Dokumen
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
                      className="flex flex-col items-center justify-center p-5 bg-white border-2 border-dashed border-primary-light hover:border-primary rounded-xl cursor-pointer transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-full bg-surface group-hover:bg-primary/10 text-primary flex items-center justify-center mb-2 transition-colors">
                        <UploadIcon className="text-base" />
                      </div>
                      <span className="text-xs font-semibold text-primary">
                        Pilih Berkas Dokumen
                      </span>
                      <span className="text-[11px] text-text-muted mt-0.5">
                        Klik untuk memilih berkas (.pdf, .xlsx, .docx, .zip, gambar)
                      </span>
                    </label>
                  )}
                </div>

                {/* Kolom Catatan Konsultan */}
                <div className="space-y-1">
                  <Label htmlFor="detail-doc-notes" className="text-[11px] font-semibold text-text-secondary block">
                    Kolom Catatan
                  </Label>
                  <Textarea
                    id="detail-doc-notes"
                    placeholder="Tuliskan catatan atau pesan untuk klien..."
                    value={detailDocNotes}
                    onChange={(e) => setDetailDocNotes(e.target.value)}
                    rows={2}
                    className="text-xs bg-white resize-y"
                  />
                </div>

              </form>
            </div>

            {/* Riwayat Catatan / Log Ringkas */}
            {selectedTicket.correspondences && selectedTicket.correspondences.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-primary-light">
                <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider block">
                  Riwayat Komunikasi &amp; Catatan
                </span>
                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                  {selectedTicket.correspondences.map((c) => (
                    <div key={c.id} className="p-2 bg-surface rounded-lg border border-primary-light/70 text-xs">
                      <div className="flex items-center justify-between text-[10px] text-text-muted mb-0.5">
                        <span className="font-bold text-primary">{c.sender}</span>
                        <span>{c.date}</span>
                      </div>
                      <p className="text-[11px] text-text-secondary leading-snug">{c.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Modal: Tombol Tutup & Kirim Sejejer */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-primary-light">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedTicket(null)}
                className="text-xs px-4 h-8 font-medium"
              >
                Tutup
              </Button>
              <Button
                type="submit"
                form="detail-send-form"
                variant="primary"
                size="sm"
                disabled={isSendingDetailDoc || (!detailSendFile && !detailDocNotes.trim())}
                className="text-xs font-semibold px-4 h-8"
              >
                <SendIcon className="mr-1.5 text-xs" />
                {isSendingDetailDoc ? "Mengirimkan..." : "Kirim Dokumen & Catatan"}
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
