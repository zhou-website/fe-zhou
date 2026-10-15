"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useAuth, isDummyTicket, normalizeRole } from "@/context/AuthContext";
import { adminApi, ConsultationItem } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import {
  SearchIcon,
} from "@/components/icons";

import {
  getTicketsForAdmin,
  getStoredStaffAdmins,
  TICKETS_UPDATED_EVENT,
  DOCUMENTS_UPDATED_EVENT,
  STAFF_UPDATED_EVENT,
  ClientTicket,
} from "@/data/sharedTicketsStorage";

function AdminDashboardContent() {
  const { user } = useAuth();
  const normalizedUserRole = normalizeRole(user?.role, user?.email);

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

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    const staff = getStoredStaffAdmins();

    // Dapatkan data profil admin aktif saat ini
    const currentStaffProfile = staff.find(
      (s) => s.email.toLowerCase() === activeAdminEmail.toLowerCase()
    );
    const staffContext = currentStaffProfile || {
      email: activeAdminEmail,
      name: user?.name || "Linda David, S.Ak., BKP",
      role: normalizedUserRole,
      id: "ADM-001",
    };

    // Muat dari shared storage lokal
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
      console.warn("Gagal memuat konsultasi backend admin:", err);
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

    const intervalId = setInterval(() => {
      loadData();
    }, 4000);

    window.addEventListener(TICKETS_UPDATED_EVENT, loadData);
    window.addEventListener(DOCUMENTS_UPDATED_EVENT, loadData);
    window.addEventListener(STAFF_UPDATED_EVENT, loadData);
    window.addEventListener("storage", loadData);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadData();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener(TICKETS_UPDATED_EVENT, loadData);
      window.removeEventListener(DOCUMENTS_UPDATED_EVENT, loadData);
      window.removeEventListener(STAFF_UPDATED_EVENT, loadData);
      window.removeEventListener("storage", loadData);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loadData]);



  // Filter tugas milik admin yang sedang login
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
        (t.clientCompany && t.clientCompany.toLowerCase().includes(q)) ||
        (t.category && t.category.toLowerCase().includes(q));
      return matchStatus && matchSearch;
    });
  }, [tickets, statusFilter, searchQuery]);

  // Metrik Tugas Pribadi PIC yang login
  const computedStats = useMemo(() => {
    const total = tickets.length;
    const inProgress = tickets.filter(
      (t) => t.status === "Dalam Proses" || t.status === "Ditugaskan"
    ).length;
    const waitingClient = tickets.filter((t) => t.status === "Menunggu Klien").length;
    const completed = tickets.filter((t) => t.status === "Selesai").length;
    
    // Total dokumen pada tugas-tugas milik admin ini
    const totalDocs = tickets.reduce((acc, curr) => {
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
  }, [tickets]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
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
          <div className="w-full sm:w-44">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs h-9"
            >
              <option value="ALL">Semua Status</option>
              <option value="Dalam Proses">Dalam Proses</option>
              <option value="Menunggu Klien">Menunggu Klien</option>
              <option value="Selesai">Selesai</option>
            </Select>
          </div>
        </div>

        {/* Table View (Secara Umum) */}
        <div className="overflow-x-auto rounded-xl border border-primary-light">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface text-text-muted font-bold uppercase text-[10px] tracking-wider border-b border-primary-light">
              <tr>
                <th className="py-3 px-3.5 text-center w-12">No</th>
                <th className="py-3 px-4">Kode Perikatan</th>
                <th className="py-3 px-4">Judul Tugas</th>
                <th className="py-3 px-4">Klien &amp; Entitas</th>
                <th className="py-3 px-4">Kategori Layanan</th>
                <th className="py-3 px-4">Status &amp; Progres</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-light">
              {filteredTickets.map((t, idx) => {
                return (
                  <tr key={t.id} className="hover:bg-surface/60 transition-colors">
                    <td className="py-3.5 px-3.5 text-center text-text-muted font-mono text-[11px]">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs font-semibold text-primary">
                      {t.id}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-primary">
                      <span className="font-semibold text-xs text-primary block max-w-xs truncate">
                        {t.title}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-primary block">
                        {t.clientName || "Klien Terdaftar"}
                      </span>
                      <span className="text-[11px] text-text-secondary block">
                        {t.clientCompany || t.clientEmail || "-"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-text-secondary">
                      <span className="block font-medium text-primary">
                        {t.category}
                      </span>
                      {t.priority && (
                        <span
                          className={`inline-block mt-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            t.priority === "Mendesak"
                              ? "bg-red-100 text-red-800"
                              : t.priority === "Tinggi"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          Prioritas {t.priority}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            t.status === "Selesai"
                              ? "bg-emerald-100 text-emerald-800"
                              : t.status === "Dalam Proses"
                              ? "bg-amber-100 text-amber-800"
                              : t.status === "Menunggu Klien"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {t.status}
                        </span>
                        <div className="w-24 bg-surface rounded-full h-1.5 overflow-hidden border border-primary-light">
                          <div
                            className={`h-full rounded-full ${
                              t.status === "Selesai"
                                ? "bg-emerald-500"
                                : t.status === "Menunggu Klien"
                                ? "bg-blue-500"
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
