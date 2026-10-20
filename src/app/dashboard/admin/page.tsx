"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAuth, isDummyTicket, normalizeRole } from "@/context/AuthContext";
import { adminApi, ConsultationItem } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  SearchIcon,
  CheckCircleIcon,
  CloseIcon,
} from "@/components/icons";

import {
  ClientTicket,
  getStoredClientTickets,
  formatTicketDescription,
  resolveConsultationCategory,
  canAdminAccessTicket,
  mergeTicketsWithLocalOverrides,
} from "@/data/sharedTicketsStorage";

function AdminDashboardContent() {
  const router = useRouter();
  const { user } = useAuth();
  const normalizedUserRole = normalizeRole(user?.role, user?.email);

  // Auto redirect superadmin ke portal superadmin
  useEffect(() => {
    if (normalizedUserRole === "superadmin") {
      router.replace("/dashboard/superadmin/perikatan");
    }
  }, [normalizedUserRole, router]);

  const [activeAdminEmail, setActiveAdminEmail] = useState<string>(user?.email || "admin@zhou.id");
  const [tickets, setTickets] = useState<ClientTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Jika bukan Superadmin, selalu kunci activeAdminEmail ke identitas login asli
  useEffect(() => {
    if (normalizedUserRole !== "superadmin" && user?.email) {
      setActiveAdminEmail(user.email);
    }
  }, [normalizedUserRole, user?.email]);

  const currentStaffProfile = useMemo(() => ({
    id: user?.id || "ADM-001",
    name: user?.name || "Admin",
    email: activeAdminEmail,
    role: normalizedUserRole,
  }), [user?.id, user?.name, activeAdminEmail, normalizedUserRole]);

  const loadData = React.useCallback(async () => {
    setIsLoading(true);

    try {
      const res = await adminApi.getConsultations();
      if (res?.data && Array.isArray(res.data)) {
        const email = (activeAdminEmail || "").toLowerCase().trim();
        const userName = (user?.name || "").toLowerCase().trim();

        const validConsultations = res.data.filter((c: ConsultationItem) => !isDummyTicket(c));

        // Filter tiket yang relevan dengan admin yang sedang bertugas
        const assignedConsultations = validConsultations.filter((c: ConsultationItem) => {
          if (normalizedUserRole === "superadmin") return true;
          const assignedEmail = (c.assigned_admin?.email || "").toLowerCase().trim();
          const assignedName = (c.assigned_admin?.name || "").toLowerCase().trim();

          if (email && assignedEmail && assignedEmail === email) return true;
          if (userName && assignedName && (assignedName.includes(userName) || userName.includes(assignedName))) return true;
          return false; // HANYA tiket yang sudah resmi ditugaskan kepada admin ini
        });

        const mappedTickets: ClientTicket[] = assignedConsultations.map((c: ConsultationItem) => ({
          id: c.project_code || `TK-${c.id}`,
          title: c.title || "Konsultasi Perpajakan",
          category: resolveConsultationCategory(c) as ClientTicket["category"],
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
          assignedAdminEmail: c.assigned_admin?.email,
          milestones: (c.tasks || []).map((task, idx) => ({
            step: `0${idx + 1}`,
            title: task.task_name,
            status: task.is_completed ? ("completed" as const) : idx === 0 ? ("in_progress" as const) : ("pending" as const),
            date: "Proses",
            description: task.task_name,
          })),
          deliverables: (c.documents || []).map((d) => ({
            id: `DOC-${d.id}`,
            name: d.file_name,
            size: d.file_size || "1.5 MB",
            type: d.file_type || "PDF",
            date: new Date(d.created_at).toLocaleDateString("id-ID"),
            status: "Terkirim",
          })),
          correspondences: [],
          clientDocuments: [],
        }));

        const localTickets = typeof window !== "undefined" ? getStoredClientTickets() : [];
        const mergedTickets = mergeTicketsWithLocalOverrides(mappedTickets, localTickets)
          .filter((t) => normalizedUserRole === "superadmin" || canAdminAccessTicket(t, currentStaffProfile));

        setTickets(mergedTickets);
      } else {
        const localTickets = typeof window !== "undefined" ? getStoredClientTickets() : [];
        const adminTickets = localTickets.filter((lt) => normalizedUserRole === "superadmin" || canAdminAccessTicket(lt, currentStaffProfile));
        setTickets(adminTickets);
      }
    } catch (err) {
      console.warn("Gagal memuat konsultasi backend admin:", err);
      const localTickets = typeof window !== "undefined" ? getStoredClientTickets() : [];
      const adminTickets = localTickets.filter((lt) => normalizedUserRole === "superadmin" || canAdminAccessTicket(lt, currentStaffProfile));
      setTickets(adminTickets);
    } finally {
      setIsLoading(false);
    }
  }, [activeAdminEmail, user?.name, normalizedUserRole, currentStaffProfile]);

  useEffect(() => {
    loadData();
  }, [loadData]);



  // Filter tugas milik admin yang sedang login
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      // Keamanan ganda: pastikan admin ini memang PIC dari tiket tersebut
      if (normalizedUserRole !== "superadmin" && !canAdminAccessTicket(t, currentStaffProfile)) {
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
        (t.clientName && t.clientName.toLowerCase().includes(q)) ||
        (t.clientCompany && t.clientCompany.toLowerCase().includes(q)) ||
        (t.category && t.category.toLowerCase().includes(q));
      return matchStatus && matchSearch;
    });
  }, [tickets, statusFilter, searchQuery, normalizedUserRole, currentStaffProfile]);

  // Metrik Tugas Pribadi PIC yang login
  const computedStats = useMemo(() => {
    const validTickets = normalizedUserRole === "superadmin"
      ? tickets
      : tickets.filter((t) => canAdminAccessTicket(t, currentStaffProfile));
    const total = validTickets.length;
    const inProgress = validTickets.filter(
      (t) => t.status === "Dalam Proses" || t.status === "Ditugaskan"
    ).length;
    const waitingClient = validTickets.filter((t) => t.status === "Menunggu Klien").length;
    const completed = validTickets.filter((t) => t.status === "Selesai").length;
    
    // Total dokumen pada tugas-tugas milik admin ini
    const totalDocs = validTickets.reduce((acc, curr) => {
      const clientDocs = curr.clientDocuments?.length || 0;
      const deliverables = curr.deliverables?.length || 0;
      return acc + clientDocs + deliverables;
    }, 0);

    return {
      total,
      inProgress,
      waitingClient,
      completed,
      totalDocs,
    };
  }, [tickets, normalizedUserRole, currentStaffProfile]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleExportTasksCsv = () => {
    const listToExport = filteredTickets.length > 0 ? filteredTickets : tickets;
    if (listToExport.length === 0) {
      showToast("Tidak ada data lembar kerja untuk diekspor.");
      return;
    }

    const escapeCsv = (val: string | number | undefined | null) => {
      if (val === undefined || val === null) return '""';
      const clean = String(val)
        .replace(/[\r\n\t]+/g, " ")
        .replace(/"/g, '""')
        .trim();
      return `"${clean}"`;
    };

    const headers = [
      "No",
      "Kode Tiket",
      "Judul Kebutuhan",
      "Uraian Masalah",
      "Klien",
      "Entitas / Perusahaan",
      "Kategori Layanan",
      "Status",
      "Progres (%)",
      "Tanggal Masuk",
    ];

    const rows = listToExport.map((t, index) => [
      escapeCsv(index + 1),
      escapeCsv(t.id),
      escapeCsv(t.title || "-"),
      escapeCsv(formatTicketDescription(t.description) || "-"),
      escapeCsv(t.clientName || "-"),
      escapeCsv(t.clientCompany || t.clientEmail || "-"),
      escapeCsv(t.category || "-"),
      escapeCsv(t.status || "-"),
      escapeCsv(`${t.progress || 0}%`),
      escapeCsv(t.createdAt || "-"),
    ]);

    const delimiter = ";";
    const csvContent = [
      "sep=;",
      headers.join(delimiter),
      ...rows.map((row) => row.join(delimiter)),
    ].join("\r\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `Lembar_Kerja_Admin_${dateStr}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(`Daftar tugas (${listToExport.length} baris) berhasil diunduh.`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0B1533] text-white px-5 py-3 rounded-xl shadow-xl border border-primary-light flex items-center gap-3 text-xs animate-in fade-in slide-in-from-bottom-2">
          <CheckCircleIcon className="text-emerald-400 text-sm shrink-0" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-silver hover:text-white ml-2 p-1 cursor-pointer"
          >
            <CloseIcon className="text-xs" />
          </button>
        </div>
      )}

      {/* Header & Page Title */}
      <div className="pb-4 border-b border-primary-light">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
          Overview Lembar Kerja
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
          Pantau ringkasan penugasan konsultasi, progres pengerjaan kertas kerja, dan koordinasi dokumen klien yang ditugaskan kepada Anda.
        </p>
      </div>

      {/* METRIC CARDS TUGAS SAYA */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-5 rounded-2xl border-primary-light bg-white shadow-xs">
          <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">
            Total Tugas Saya
          </span>
          <div className="mt-2 text-2xl font-bold text-primary font-mono">
            {computedStats.total}
          </div>
          <div className="text-[10px] text-text-secondary mt-1">Tugas ditugaskan kepada Anda</div>
        </Card>

        <Card className="p-4 sm:p-5 rounded-2xl border-amber-200 bg-amber-50/40 shadow-xs">
          <span className="text-[10px] text-amber-900 font-bold uppercase tracking-wider block">
            Dalam Proses
          </span>
          <div className="mt-2 text-2xl font-bold text-amber-800 font-mono">
            {computedStats.inProgress}
          </div>
          <div className="text-[10px] text-amber-700 mt-1">Dalam proses penyusunan</div>
        </Card>

        <Card className="p-4 sm:p-5 rounded-2xl border-blue-200 bg-blue-50/40 shadow-xs">
          <span className="text-[10px] text-blue-900 font-bold uppercase tracking-wider block">
            Menunggu Klien
          </span>
          <div className="mt-2 text-2xl font-bold text-blue-800 font-mono">
            {computedStats.waitingClient}
          </div>
          <div className="text-[10px] text-blue-700 mt-1">Menunggu berkas / review klien</div>
        </Card>

        <Card className="p-4 sm:p-5 rounded-2xl border-emerald-200 bg-emerald-50/40 shadow-xs">
          <span className="text-[10px] text-emerald-900 font-bold uppercase tracking-wider block">
            Tugas Selesai
          </span>
          <div className="mt-2 text-2xl font-bold text-emerald-800 font-mono">
            {computedStats.completed}
          </div>
          <div className="text-[10px] text-emerald-700 mt-1">Laporan luaran final terbit</div>
        </Card>

        <Card className="p-4 sm:p-5 rounded-2xl border-primary-light bg-white shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">
            Dokumen Tugas
          </span>
          <div className="mt-2 text-2xl font-bold text-primary font-mono">
            {computedStats.totalDocs}
          </div>
          <div className="text-[10px] text-text-secondary mt-1">Berkas klien &amp; kertas kerja</div>
        </Card>
      </div>

      {/* MY TASKS OVERVIEW TABLE (SECARA UMUM) */}
      <Card className="rounded-2xl border-primary-light bg-white p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-80 md:w-96">
            <SearchIcon className="absolute left-3 top-2.5 text-text-muted text-xs" />
            <Input
              type="text"
              placeholder="Cari nomor tiket, judul atau klien..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-xs h-9 w-full bg-surface border-primary-light"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="w-full sm:w-44">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full text-xs h-9"
              >
                <option value="ALL">Semua Status</option>
                <option value="Dalam Proses">Dalam Proses</option>
                <option value="Selesai">Selesai</option>
              </Select>
            </div>
            <Button
              type="button"
              onClick={handleExportTasksCsv}
              className="h-9 px-4 text-xs font-semibold shrink-0 bg-primary hover:bg-primary-hover text-white rounded-xl shadow-xs transition-colors cursor-pointer"
              title="Unduh daftar tugas ke Excel"
            >
              Unduh
            </Button>
          </div>
        </div>

        {/* Table View (Secara Umum) */}
        <div className="overflow-x-auto rounded-xl border border-primary-light">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface text-text-muted font-bold uppercase text-[10px] tracking-wider border-b border-primary-light">
              <tr>
                <th className="py-3 px-3.5 text-center w-12">No</th>
                <th className="py-3 px-4 text-center min-w-[190px]">Kode &amp; Judul Kebutuhan</th>
                <th className="py-3 px-4 text-center w-48 min-w-[170px]">Uraian Detail Masalah</th>
                <th className="py-3 px-4 text-center min-w-[230px]">Klien &amp; Entitas</th>
                <th className="py-3 px-4 text-center">Kategori Layanan</th>
                <th className="py-3 px-4 text-center">Status &amp; Progres</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-light">
              {filteredTickets.map((t, idx) => {
                const cleanProblemDesc = formatTicketDescription(t.description);

                return (
                  <tr
                    key={t.id}
                    className="hover:bg-surface/60 transition-colors"
                  >
                    <td className="py-3.5 px-3.5 text-center text-text-muted font-mono text-[11px] align-top">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-primary align-top min-w-[190px]">
                      <span className="font-mono text-[10px] text-text-muted block font-semibold">
                        {t.id}
                      </span>
                      <span className="font-bold text-xs text-primary block mt-0.5 leading-snug">
                        {t.title || "Konsultasi Kebutuhan Klien"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-text-secondary align-top w-48 min-w-[170px]">
                      {cleanProblemDesc ? (
                        <div className="bg-surface/60 border border-primary-light/70 rounded-lg p-2">
                          <p className="text-xs text-text-primary leading-relaxed whitespace-pre-line line-clamp-2" title={cleanProblemDesc}>
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
                        {t.clientName || "Klien Terdaftar"}
                      </span>
                      <span className="text-[11px] text-text-secondary block">
                        {t.clientCompany || t.clientEmail || "-"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-text-secondary align-top">
                      <span className="block font-medium text-primary">
                        {t.category || "Tax Service Core"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            t.status === "Selesai"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : t.status === "Dalam Proses"
                              ? "bg-indigo-100 text-indigo-800 border-indigo-300"
                              : t.status === "Ditugaskan"
                              ? "bg-blue-100 text-blue-800 border-blue-300"
                              : t.status === "Menunggu Penugasan"
                              ? "bg-amber-100 text-amber-800 border-amber-300"
                              : t.status === "Menunggu Klien"
                              ? "bg-purple-100 text-purple-800 border-purple-300"
                              : "bg-slate-100 text-slate-700 border-slate-300"
                          }`}
                        >
                          {t.status === "Menunggu Penugasan" ? "Menunggu PIC" : t.status}
                        </span>
                        <div className="w-24 bg-surface rounded-full h-1.5 overflow-hidden border border-primary-light">
                          <div
                            className={`h-full rounded-full ${
                              t.status === "Selesai"
                                ? "bg-emerald-500"
                                : "bg-primary"
                            }`}
                            style={{ width: `${t.progress || 0}%` }}
                          />
                        </div>
                        <span className="text-[9px] text-text-muted font-mono">{t.progress || 0}% selesai</span>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-text-secondary text-xs">
                    {isLoading ? (
                      "Sedang memuat data tugas Anda..."
                    ) : (
                      <div className="space-y-1">
                        <p className="font-semibold text-primary text-sm">Tidak ada tugas yang sesuai filter</p>
                        <p className="text-text-muted text-xs">
                          Seluruh tugas yang ditugaskan kepada Anda akan muncul di sini.
                        </p>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-text-secondary text-xs">
          Memuat overview tugas admin...
        </div>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}
