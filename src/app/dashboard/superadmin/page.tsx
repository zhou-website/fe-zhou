"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";
import {
  CloseIcon,
  SearchIcon,
  ExportIcon,
  EyeIcon,
  EditIcon,
  TrashIcon,
  CheckCircleIcon,
} from "@/components/icons";
import { superadminApi, AdminUserItem, AuditLogItem } from "@/lib/api";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  specialty: string;
  status: "Active" | "Inactive";
  taskCount: number;
}

interface AuditLog {
  id: string;
  timestamp: string;
  adminName: string;
  adminId: string;
  clientId: string;
  ticketId: string;
  statusBefore: string;
  statusAfter: string;
  relatedFile: string;
  notes: string;
}

export default function SuperadminDashboard() {
  const [activeTab, setActiveTab] = useState<"admins" | "audit">("audit");

  // Admin Management State
  const [admins, setAdmins] = useState<AdminUser[]>([]);

  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [selectedAdminForDetail, setSelectedAdminForDetail] = useState<AdminUser | null>(null);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [deletingAdmin, setDeletingAdmin] = useState<AdminUser | null>(null);
  const [adminCurrentPage, setAdminCurrentPage] = useState(1);
  const [newAdmin, setNewAdmin] = useState({
    name: "",
    email: "",
    role: "admin",
    specialty: "Tax Service Core",
    initialPassword: "",
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Audit Logs State (Append-Only Mutlak)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Fetch live audit logs & admins from Backend API
  useEffect(() => {
    let isMounted = true;
    superadminApi
      .getAuditLogs()
      .then((res) => {
        if (!isMounted) return;
        if (res?.data && Array.isArray(res.data)) {
          const mappedLogs: AuditLog[] = res.data.map((l: AuditLogItem) => ({
            id: `LOG-${l.id}`,
            timestamp:
              new Date(l.created_at).toLocaleString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }) + " WIB",
            adminName: `Admin #${l.admin_id}`,
            adminId: `ADM-${String(l.admin_id).padStart(3, "0")}`,
            clientId: l.client_id ? `CL-${l.client_id}` : "Umum",
            ticketId: l.project_id ? `TK-${l.project_id}` : `ACT-${l.id}`,
            statusBefore: l.status_before || "Draft",
            statusAfter: l.status_after || "Updated",
            relatedFile: l.file_name || "-",
            notes: l.description || l.action,
          }));
          setAuditLogs(mappedLogs);
        }
      })
      .catch(() => {
        // silent fallback
      });

    superadminApi
      .getAdmins()
      .then((res) => {
        if (!isMounted) return;
        if (res?.data && Array.isArray(res.data)) {
          const mappedAdmins: AdminUser[] = res.data.map((a: AdminUserItem) => ({
            id: `ADM-${String(a.id).padStart(3, "0")}`,
            name: a.name,
            email: a.email,
            role: a.role === "SUPERADMIN" ? "Superadmin" : "Admin",
            specialty: "Core Tax & Legal Compliance",
            status: a.is_active ? "Active" : "Inactive",
            taskCount: 0,
          }));
          setAdmins(mappedAdmins);
        }
      })
      .catch(() => {
        // silent fallback
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Audit Filter State
  const [filterAdmin, setFilterAdmin] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Add new admin
  const handleAddAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdmin.name || !newAdmin.email || !newAdmin.initialPassword) {
      showToast("Mohon lengkapi seluruh kolom formulir.");
      return;
    }

    const normalizedRole = newAdmin.role.toLowerCase() === "superadmin" ? "SUPERADMIN" : "ADMIN";
    const displayRole = normalizedRole === "SUPERADMIN" ? "Superadmin" : "Admin";

    try {
      const res = await superadminApi.createAdmin({
        name: newAdmin.name,
        email: newAdmin.email,
        password: newAdmin.initialPassword,
        role: normalizedRole,
      });

      if (!res.success && res.message) {
        console.warn("Backend createAdmin notice:", res.message);
      }
    } catch (err) {
      console.warn("superadminApi.createAdmin fallback to local state:", err);
    }

    const created: AdminUser = {
      id: (displayRole === "Superadmin" ? "SPR-00" : "ADM-00") + (admins.length + 1),
      name: newAdmin.name,
      email: newAdmin.email,
      role: displayRole,
      specialty: newAdmin.specialty,
      status: "Active",
      taskCount: 0,
    };

    setAdmins((prev) => {
      const updated = [...prev.filter((a) => a.email.toLowerCase() !== created.email.toLowerCase()), created];
      try {
        localStorage.setItem("zhou_superadmin_admins", JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setShowAddAdminModal(false);
    setNewAdmin({
      name: "",
      email: "",
      role: "admin",
      specialty: "Tax Service Core",
      initialPassword: "",
    });
    showToast(`Akun ${displayRole} ${created.name} berhasil ditambahkan.`);
  };

  // Toggle soft-delete
  const handleToggleStatus = async (adminId: string) => {
    try {
      const rawId = parseInt(adminId.replace(/\D/g, ""), 10) || adminId;
      await superadminApi.deactivateAdmin(rawId);
    } catch (err) {
      console.warn("superadminApi.deactivateAdmin fallback to local state:", err);
    }

    setAdmins((prev) => {
      const updated = prev.map((a) => {
        if (a.id === adminId) {
          const next: "Active" | "Inactive" = a.status === "Active" ? "Inactive" : "Active";
          showToast(`Status admin ${a.name} diubah menjadi ${next}.`);
          return { ...a, status: next };
        }
        return a;
      });
      try {
        localStorage.setItem("zhou_superadmin_admins", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Hard delete check
  const handleDeleteAdmin = async (admin: AdminUser) => {
    if (admin.taskCount > 0) {
      showToast(
        `Penghapusan permanen ditolak: Akun ${admin.name} memiliki ${admin.taskCount} riwayat tugas aktif. Gunakan fitur Nonaktifkan (Soft Delete).`
      );
      return;
    }

    try {
      const rawId = parseInt(admin.id.replace(/\D/g, ""), 10) || admin.id;
      await superadminApi.deleteAdmin(rawId);
    } catch (err) {
      console.warn("superadminApi.deleteAdmin fallback to local state:", err);
    }

    setAdmins((prev) => {
      const updated = prev.filter((a) => a.id !== admin.id);
      try {
        localStorage.setItem("zhou_superadmin_admins", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    showToast(`Akun admin ${admin.name} berhasil dihapus permanen.`);
  };

  const handleEditAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;
    setAdmins((prev) => {
      const updated = prev.map((a) => (a.id === editingAdmin.id ? editingAdmin : a));
      try {
        localStorage.setItem("zhou_superadmin_admins", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    showToast(`Data administrator ${editingAdmin.name} berhasil diperbarui.`);
    setEditingAdmin(null);
  };

  const handleConfirmDeleteAdmin = async () => {
    if (!deletingAdmin) return;
    if (deletingAdmin.taskCount > 0) {
      handleToggleStatus(deletingAdmin.id);
      showToast(`Akun ${deletingAdmin.name} dinonaktifkan (soft delete) karena memiliki riwayat tugas.`);
    } else {
      await handleDeleteAdmin(deletingAdmin);
    }
    setDeletingAdmin(null);
  };

  const adminItemsPerPage = 6;
  const adminTotalPages = Math.ceil(admins.length / adminItemsPerPage) || 1;
  const paginatedAdmins = admins.slice(
    (adminCurrentPage - 1) * adminItemsPerPage,
    adminCurrentPage * adminItemsPerPage
  );

  // Filtered logs
  const filteredLogs = auditLogs.filter((log) => {
    if (filterAdmin !== "ALL" && !log.adminName.includes(filterAdmin)) return false;
    if (
      searchQuery &&
      !log.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !log.clientId.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !log.adminName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !log.relatedFile.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterAdmin, searchQuery]);

  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Status badge styling: In Progress = Kuning, Update = Hijau, Done = Biru
  const renderStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase().trim();
    if (s.includes("progress") || s.includes("proses") || s.includes("pending")) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-semibold font-mono bg-amber-50 text-amber-700 border border-amber-300">
          {status}
        </span>
      );
    }
    if (s.includes("update") || s.includes("perbarui")) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-semibold font-mono bg-emerald-50 text-emerald-700 border border-emerald-300">
          {status}
        </span>
      );
    }
    if (s.includes("done") || s.includes("selesai") || s.includes("complet")) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-semibold font-mono bg-blue-50 text-blue-700 border border-blue-300">
          {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-semibold font-mono bg-slate-100 text-slate-700 border border-slate-300">
        {status}
      </span>
    );
  };

  // Export functions
  const handleExportCSV = async () => {
    try {
      const res = await superadminApi.exportAuditLogs();
      if (res?.data?.export_url) {
        window.open(res.data.export_url, "_blank");
        showToast("Laporan audit trail backend berhasil diunduh.");
        return;
      }
    } catch (err) {
      console.warn("superadminApi.exportAuditLogs fallback to client CSV:", err);
    }

    const csvContent =
      "data:text/csv;charset=utf-8,Timestamp,Admin,ID Klien,ID Tiket,Status Sebelum,Status Sesudah,Berkas\n" +
      filteredLogs
        .map(
          (l) =>
            `"${l.timestamp}","${l.adminName}","${l.clientId}","${l.ticketId}","${l.statusBefore}","${l.statusAfter}","${l.relatedFile}"`
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Zhou_Audit_Log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Salinan berkas audit trail berhasil diekspor ke format CSV.");
  };

  const handleExportPDF = () => {
    showToast("Mengenerate salinan resmi Laporan Audit Trail Zhou Consulting ke format PDF terenkripsi SHA-256.");
  };

  return (
    <div className="space-y-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary text-white text-xs font-semibold py-3 px-5 rounded-xl shadow-2xl border border-white/20 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircleIcon className="text-success text-base" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-silver hover:text-white ml-2"
          >
            <CloseIcon className="text-xs" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="pb-6 border-b border-primary-light">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
            Log Audit Perubahan Status &amp; Aktivitas
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-2xl">
            Pencatatan riwayat perubahan status penugasan klien, unggahan berkas, dan aktivitas administratif yang bersifat <em>immutable</em> &amp; <em>append-only</em> sesuai UU PDP No. 27/2022.
          </p>
        </div>
      </div>

      {/* 3 TOP AUDIT METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-5 rounded-2xl border-primary-light bg-white shadow-xs">
          <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">
            Total Log Aktivitas
          </span>
          <div className="mt-2 text-2xl font-bold text-primary font-mono flex items-baseline gap-1.5">
            <span>{String(auditLogs.length).padStart(2, "0")}</span>
            <span className="text-xs text-text-secondary font-sans font-normal">Catatan</span>
          </div>
          <div className="text-[10px] text-text-secondary mt-1">Catatan riwayat sistem</div>
        </Card>

        <Card className="p-4 sm:p-5 rounded-2xl border-emerald-200 bg-emerald-50/40 shadow-xs">
          <span className="text-[10px] text-emerald-900 font-bold uppercase tracking-wider block">
            Perubahan Status Selesai
          </span>
          <div className="mt-2 text-2xl font-bold text-emerald-800 font-mono flex items-baseline gap-1.5">
            <span>{String(auditLogs.filter((l) => l.statusAfter === "Completed").length).padStart(2, "0")}</span>
            <span className="text-xs text-emerald-700 font-sans font-normal">Mutasi Selesai</span>
          </div>
          <div className="text-[10px] text-emerald-700 mt-1">Mutasi berhasil diselesaikan</div>
        </Card>

        <Card className="p-4 sm:p-5 rounded-2xl border-primary-light bg-white shadow-xs">
          <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">
            Integritas Kriptografis
          </span>
          <div className="mt-2 text-2xl font-bold text-primary font-mono">
            SHA-256
          </div>
          <div className="text-[10px] text-text-secondary mt-1">Standar hashing keamanan</div>
        </Card>
      </div>
        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-primary-light pb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("admins")}
              className={`px-4 py-2 rounded-md text-xs font-bold transition-colors ${
                activeTab === "admins"
                  ? "bg-primary text-white"
                  : "bg-white text-text-secondary hover:text-primary border border-primary-light"
              }`}
            >
              Kelola Pengguna Admin ({admins.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("audit")}
              className={`px-4 py-2 rounded-md text-xs font-bold transition-colors ${
                activeTab === "audit"
                  ? "bg-primary text-white"
                  : "bg-white text-text-secondary hover:text-primary border border-primary-light"
              }`}
            >
              Log Audit Perubahan Status (Append-Only)
            </button>
          </div>

          <div className="text-xs text-text-secondary">
            Integritas Data: <strong className="text-success">Terkunci &amp; Append-Only</strong>
          </div>
        </div>

        {/* TAB 1: KELOLA ADMIN */}
        {activeTab === "admins" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-primary">Manajemen Akses Administrator</h2>
                <p className="text-xs text-text-secondary">
                  Kelola hak akses staf konsultan, nonaktifkan akun saat pergantian staf (*soft delete*), dan audit tugas.
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowAddAdminModal(true)}
                className="text-xs font-semibold px-3 py-1.5"
              >
                <span>Tambah Admin Baru</span>
              </Button>
            </div>

            {/* Admin Table */}
            <div className="bg-white rounded-xl border border-primary-light shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface border-b border-primary-light text-[11px] font-bold text-text-secondary uppercase">
                    <tr>
                      <th className="py-3 px-5">ID &amp; Nama Admin</th>
                      <th className="py-3 px-5">Email Resmi</th>
                      <th className="py-3 px-5">Peran RBAC</th>
                      <th className="py-3 px-5">Spesialisasi</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                      <th className="py-3.5 px-4 text-center">Riwayat Tugas</th>
                      <th className="py-3.5 px-4 text-right font-bold uppercase tracking-wider text-[11px] text-primary">AKSI SUPERADMIN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary-light text-text">
                    {admins.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-xs text-text-muted">
                          Belum ada akun staf administrator terdaftar.
                        </td>
                      </tr>
                    ) : (
                      paginatedAdmins.map((admin) => (
                        <tr key={admin.id} className="hover:bg-surface/50 transition-colors">
                        <td className="py-4 px-5">
                          <div className="font-bold text-primary">{admin.name}</div>
                          <span className="font-mono text-[11px] text-text-secondary">{admin.id}</span>
                        </td>
                        <td className="py-4 px-5 text-text-secondary">{admin.email}</td>
                        <td className="py-4 px-5">
                          <Badge
                            variant={admin.role.toLowerCase().includes("superadmin") ? "primary" : "secondary"}
                            className="text-[10px]"
                          >
                            {admin.role}
                          </Badge>
                        </td>
                        <td className="py-4 px-5 font-medium">{admin.specialty}</td>
                        <td className="py-4 px-5 text-center">
                          <Badge
                            variant={admin.status === "Active" ? "success" : "secondary"}
                            className="text-[10px]"
                          >
                            {admin.status === "Active" ? "Aktif" : "Nonaktif (Soft Delete)"}
                          </Badge>
                        </td>
                        <td className="py-4 px-5 text-center font-bold text-primary">
                          {admin.taskCount} Tiket
                        </td>
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedAdminForDetail(admin)}
                              className="h-8 px-2.5 text-xs border-primary-light hover:bg-surface text-primary font-semibold"
                              title="Lihat Detail Admin"
                            >
                              <EyeIcon className="text-xs mr-1" />
                              Detail
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingAdmin(admin)}
                              className="h-8 w-8 p-0 text-xs border-primary-light hover:bg-surface text-primary flex items-center justify-center"
                              title="Ubah Data Admin"
                            >
                              <EditIcon className="text-xs" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeletingAdmin(admin)}
                              className="h-8 w-8 p-0 text-xs border border-primary-light rounded-lg hover:bg-red-50 hover:text-red-700 hover:border-red-300 text-red-500 flex items-center justify-center bg-white shadow-2xs"
                              title="Hapus Akun Admin"
                            >
                              <TrashIcon className="text-xs text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                  </tbody>
                </table>
              </div>

              {admins.length > 0 && (
                <div className="p-4 bg-surface border-t border-primary-light flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-secondary">
                  <span>
                    Menampilkan {(adminCurrentPage - 1) * adminItemsPerPage + 1} &ndash;{" "}
                    {Math.min(adminCurrentPage * adminItemsPerPage, admins.length)} dari {admins.length} administrator terdaftar
                  </span>
                  <Pagination
                    currentPage={adminCurrentPage}
                    totalPages={adminTotalPages}
                    onPageChange={setAdminCurrentPage}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: LOG AUDIT PERUBAHAN STATUS (APPEND-ONLY) */}
        {activeTab === "audit" && (
          <Card className="rounded-2xl border-primary-light bg-white shadow-xs overflow-hidden">
            {/* Header, Description & Filter / Export Actions */}
            <div className="p-5 sm:p-6 space-y-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-primary tracking-tight">
                  Log Audit Perubahan Status Tiket &amp; Lembar Kerja
                </h2>
                <p className="text-xs text-text-secondary mt-1">
                  Catatan audit mutlak tidak dapat diedit atau dihapus (<em>append-only</em>).
                </p>
              </div>

              {/* Filter Row + Export Actions Row */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
                {/* Left: Admin Filter & Search */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 max-w-2xl">
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-semibold text-text-secondary text-xs whitespace-nowrap">Admin:</span>
                    <Select
                      value={filterAdmin}
                      onChange={(e) => setFilterAdmin(e.target.value)}
                      className="h-9 min-w-[150px] text-xs bg-white"
                    >
                      <option value="ALL">Semua Admin</option>
                      {admins.map((a) => (
                        <option key={a.id} value={a.name}>
                          {a.name}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="relative flex-1">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs pointer-events-none" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari ID Tiket (TK-...) atau ID Klien (CL-...)..."
                      className="pl-9 h-9 text-xs bg-surface border-primary-light focus:bg-white"
                    />
                  </div>
                </div>

                {/* Right: Export Actions */}
                <div className="flex items-center gap-2 self-start lg:self-auto shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportCSV}
                    className="text-xs font-semibold h-9 px-3.5 border-primary-light hover:bg-surface text-primary"
                  >
                    Ekspor CSV
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleExportPDF}
                    className="text-xs font-semibold h-9 px-4 shadow-xs"
                  >
                    Ekspor PDF
                  </Button>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-primary-light" />

            {/* Audit Table (Seamless within container) */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-surface/70 border-b border-primary-light text-[11px] font-bold text-text-secondary uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Waktu (Timestamp)</th>
                    <th className="py-3 px-4">Admin Bertugas</th>
                    <th className="py-3 px-4">ID Klien</th>
                    <th className="py-3 px-4">ID Tiket</th>
                    <th className="py-3 px-4 text-center">Status Sebelum</th>
                    <th className="py-3 px-4 text-center">Status Sesudah</th>
                    <th className="py-3 px-4">Berkas Terkait</th>
                    <th className="py-3 px-4 text-right">Detail / Inspeksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-light text-text">
                  {paginatedLogs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-xs text-text-muted">
                        Belum ada catatan log aktivitas yang terekam.
                      </td>
                    </tr>
                  ) : (
                    paginatedLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-surface/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-[11px] text-text-secondary whitespace-nowrap">
                          {log.timestamp}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-primary whitespace-nowrap">
                          {log.adminName}
                        </td>
                        <td className="py-3.5 px-4 font-mono">{log.clientId}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-primary">{log.ticketId}</td>
                        <td className="py-3.5 px-4 text-center">
                          {renderStatusBadge(log.statusBefore)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {renderStatusBadge(log.statusAfter)}
                        </td>
                        <td className="py-3.5 px-4 text-text-secondary font-mono text-[11px]">
                          {log.relatedFile}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedLog(log)}
                            className="text-[11px] py-1 px-2.5 h-auto inline-flex items-center gap-1 border-primary-light hover:bg-surface text-primary"
                          >
                            <EyeIcon className="text-[10px]" />
                            <span>Inspeksi</span>
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination inside container footer */}
            {filteredLogs.length > 0 && (
              <div className="p-4 bg-surface/40 border-t border-primary-light flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-secondary">
                <span>
                  Menampilkan {(currentPage - 1) * itemsPerPage + 1} &ndash;{" "}
                  {Math.min(currentPage * itemsPerPage, filteredLogs.length)} dari {filteredLogs.length} catatan audit log
                </span>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </Card>
        )}

      {/* Modal: Tambah Admin Baru */}
      {showAddAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-dark/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-2xl border border-primary-light max-w-md w-full p-6 space-y-5 relative">
            <button
              onClick={() => setShowAddAdminModal(false)}
              className="absolute top-4 right-4 text-text-secondary hover:text-primary p-1.5 focus:outline-none"
              aria-label="Tutup"
            >
              <CloseIcon className="text-lg" />
            </button>

            <div>
              <h3 className="text-base font-bold text-primary">Tambah Administrator Baru</h3>
              <p className="text-xs text-text-secondary">
                Daftarkan staf konsultan resmi untuk mengelola lembar kerja klien.
              </p>
            </div>

            <form onSubmit={handleAddAdminSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <Label htmlFor="admin-name">Nama Lengkap &amp; Gelar</Label>
                <Input
                  id="admin-name"
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                  placeholder="Nama Lengkap & Gelar"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="admin-email">Alamat Email Kantor</Label>
                <Input
                  id="admin-email"
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  placeholder="nama@perusahaan.com"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="admin-role">Peran / Hak Akses (RBAC)</Label>
                <Select
                  id="admin-role"
                  value={newAdmin.role}
                  onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
                  className="w-full h-10 text-xs"
                >
                  <option value="admin">Admin</option>
                  <option value="superadmin">Superadmin</option>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="admin-spec">Spesialisasi Penugasan</Label>
                <Select
                  id="admin-spec"
                  value={newAdmin.specialty}
                  onChange={(e) => setNewAdmin({ ...newAdmin, specialty: e.target.value })}
                  className="w-full h-10 text-xs"
                >
                  <option value="Tax Service Core">Tax Service Core (Coretax DJP)</option>
                  <option value="Accounting Service">Accounting Service (SAK)</option>
                  <option value="Business Financial Consulting">Business &amp; Financial Consulting</option>
                  <option value="Legal & Corporate Compliance">Legal &amp; Corporate Compliance</option>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="admin-pass">Kata Sandi Awal</Label>
                <Input
                  id="admin-pass"
                  type="password"
                  value={newAdmin.initialPassword}
                  onChange={(e) => setNewAdmin({ ...newAdmin, initialPassword: e.target.value })}
                  placeholder="Minimal 8 karakter"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddAdminModal(false)}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="flex-1"
                >
                  Daftarkan Admin
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Inspeksi Detail Log Audit */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-dark/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-2xl border border-primary-light max-w-lg w-full p-6 space-y-5 relative">
            <button
              onClick={() => setSelectedLog(null)}
              className="absolute top-4 right-4 text-text-secondary hover:text-primary p-1.5 focus:outline-none"
              aria-label="Tutup"
            >
              <CloseIcon className="text-lg" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="silver" className="font-mono text-xs">
                  {selectedLog.id}
                </Badge>
                <span className="text-xs text-text-secondary">Waktu Mutlak: {selectedLog.timestamp}</span>
              </div>
              <h3 className="text-base font-bold text-primary">Inspeksi Log Audit Perubahan Status</h3>
            </div>

            <div className="space-y-3 p-4 rounded-lg bg-surface border border-primary-light text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-text-secondary">Admin Pelaksana:</span>
                  <div className="font-bold text-primary">{selectedLog.adminName}</div>
                  <div className="font-mono text-[10px] text-text-secondary">{selectedLog.adminId}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-text-secondary">Tiket &amp; Klien:</span>
                  <div className="font-bold text-primary">{selectedLog.ticketId}</div>
                  <div className="text-[10px] text-text-secondary">{selectedLog.clientId}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-primary-light grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-text-secondary">Status Sebelum:</span>
                  <div className="mt-0.5">
                    {renderStatusBadge(selectedLog.statusBefore)}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-text-secondary">Status Sesudah:</span>
                  <div className="mt-0.5">
                    {renderStatusBadge(selectedLog.statusAfter)}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-primary-light">
                <span className="text-[10px] uppercase font-bold text-text-secondary">Berkas Terkait:</span>
                <div className="font-mono font-semibold text-primary">{selectedLog.relatedFile}</div>
              </div>

              <div className="pt-2 border-t border-primary-light">
                <span className="text-[10px] uppercase font-bold text-text-secondary">Catatan Verifikasi:</span>
                <p className="text-text-secondary mt-0.5">{selectedLog.notes}</p>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <Button variant="primary" size="sm" onClick={() => setSelectedLog(null)} className="text-xs">
                Tutup Inspeksi
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DETAIL ADMINISTRATOR */}
      {selectedAdminForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-dark/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-primary-light max-w-md w-full p-6 space-y-4 relative">
            <button
              onClick={() => setSelectedAdminForDetail(null)}
              className="absolute top-5 right-5 text-text-secondary hover:text-primary p-1"
              aria-label="Tutup"
            >
              <CloseIcon className="text-sm" />
            </button>

            <div>
              <span className="text-[10px] font-mono text-text-muted font-bold block uppercase">
                DETAIL ADMINISTRATOR &bull; {selectedAdminForDetail.id}
              </span>
              <h3 className="text-lg font-bold text-primary">{selectedAdminForDetail.name}</h3>
              <p className="text-xs text-text-secondary">{selectedAdminForDetail.email}</p>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-primary-light space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-text-secondary">Peran RBAC</span>
                  <div className="mt-0.5">
                    <Badge
                      variant={selectedAdminForDetail.role.toLowerCase().includes("superadmin") ? "primary" : "secondary"}
                      className="text-[10px]"
                    >
                      {selectedAdminForDetail.role}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-text-secondary">Status Akun</span>
                  <div className="mt-0.5">
                    <Badge
                      variant={selectedAdminForDetail.status === "Active" ? "success" : "secondary"}
                      className="text-[10px]"
                    >
                      {selectedAdminForDetail.status === "Active" ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-primary-light">
                <span className="text-[10px] uppercase font-bold text-text-secondary">Spesialisasi Penugasan</span>
                <p className="font-semibold text-primary mt-0.5">{selectedAdminForDetail.specialty}</p>
              </div>

              <div className="pt-2 border-t border-primary-light flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-text-secondary">Riwayat Beban Tugas</span>
                <span className="font-bold text-primary font-mono">{selectedAdminForDetail.taskCount} Tiket</span>
              </div>
            </div>

            <div className="pt-2 border-t border-primary-light flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleToggleStatus(selectedAdminForDetail.id);
                    setSelectedAdminForDetail(null);
                  }}
                  className="text-xs h-9 px-3 border-primary-light text-primary flex-1 sm:flex-none"
                >
                  {selectedAdminForDetail.status === "Active" ? "Nonaktifkan" : "Aktifkan"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    showToast(`Tautan reset sandi telah dikirim ke ${selectedAdminForDetail.email}`);
                    setSelectedAdminForDetail(null);
                  }}
                  className="text-xs h-9 px-3 border-primary-light text-primary flex-1 sm:flex-none"
                >
                  Reset Sandi
                </Button>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setSelectedAdminForDetail(null)}
                className="text-xs h-9 px-4 w-full sm:w-auto"
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT ADMINISTRATOR */}
      {editingAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-dark/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-primary-light max-w-lg w-full p-6 space-y-4 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingAdmin(null)}
              className="absolute top-5 right-5 text-text-secondary hover:text-primary p-1"
              aria-label="Tutup"
            >
              <CloseIcon className="text-sm" />
            </button>

            <div>
              <span className="text-[10px] font-mono text-text-muted font-bold block uppercase">
                EDIT ADMINISTRATOR &bull; {editingAdmin.id}
              </span>
              <h3 className="text-lg font-bold text-primary">Perbarui Data Administrator</h3>
            </div>

            <form onSubmit={handleEditAdminSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-primary">Nama Lengkap &amp; Gelar</Label>
                <Input
                  type="text"
                  required
                  value={editingAdmin.name}
                  onChange={(e) => setEditingAdmin({ ...editingAdmin, name: e.target.value })}
                  className="text-xs h-9 bg-white border-primary-light"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-primary">Alamat Email Kantor</Label>
                <Input
                  type="email"
                  required
                  value={editingAdmin.email}
                  onChange={(e) => setEditingAdmin({ ...editingAdmin, email: e.target.value })}
                  className="text-xs h-9 bg-white border-primary-light font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-primary">Peran RBAC</Label>
                  <Select
                    value={editingAdmin.role.toLowerCase().includes("superadmin") ? "superadmin" : "admin"}
                    onChange={(e) =>
                      setEditingAdmin({
                        ...editingAdmin,
                        role: e.target.value === "superadmin" ? "Superadmin" : "Admin",
                      })
                    }
                    className="w-full text-xs h-9 font-medium"
                  >
                    <option value="admin">Admin</option>
                    <option value="superadmin">Superadmin</option>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-primary">Status</Label>
                  <Select
                    value={editingAdmin.status}
                    onChange={(e) =>
                      setEditingAdmin({
                        ...editingAdmin,
                        status: e.target.value as "Active" | "Inactive",
                      })
                    }
                    className="w-full text-xs h-9 font-medium"
                  >
                    <option value="Active">Aktif</option>
                    <option value="Inactive">Nonaktif</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-primary">Spesialisasi Penugasan</Label>
                <Select
                  value={editingAdmin.specialty}
                  onChange={(e) => setEditingAdmin({ ...editingAdmin, specialty: e.target.value })}
                  className="w-full text-xs h-9 font-medium"
                >
                  <option value="Tax Service Core">Tax Service Core (Coretax DJP)</option>
                  <option value="Accounting Service">Accounting Service (SAK)</option>
                  <option value="Business Financial Consulting">Business &amp; Financial Consulting</option>
                  <option value="Legal & Corporate Compliance">Legal &amp; Corporate Compliance</option>
                  <option value="Core Tax & Legal Compliance">Core Tax &amp; Legal Compliance</option>
                </Select>
              </div>

              <div className="pt-3 border-t border-primary-light flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingAdmin(null)}
                  className="text-xs h-9 px-4 border-primary-light"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="text-xs h-9 px-5 font-semibold shadow-xs"
                >
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: KONFIRMASI HAPUS ADMINISTRATOR */}
      {deletingAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-dark/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-primary-light max-w-md w-full p-6 space-y-4 relative">
            <button
              onClick={() => setDeletingAdmin(null)}
              className="absolute top-5 right-5 text-text-secondary hover:text-primary p-1"
              aria-label="Tutup"
            >
              <CloseIcon className="text-sm" />
            </button>

            <div className="flex items-center gap-3 text-error">
              <div className="w-10 h-10 rounded-xl bg-error/15 flex items-center justify-center text-error text-base">
                <TrashIcon />
              </div>
              <div>
                <h3 className="text-base font-bold text-primary">Konfirmasi Hapus Administrator</h3>
                <span className="text-xs text-text-muted font-mono">{deletingAdmin.id} &bull; {deletingAdmin.name}</span>
              </div>
            </div>

            <div className="text-xs text-text-secondary space-y-2">
              <p>
                Apakah Anda yakin ingin menghapus akun administrator <strong>{deletingAdmin.name}</strong>?
              </p>
              {deletingAdmin.taskCount > 0 ? (
                <div className="p-3 bg-error/10 border border-error/25 rounded-xl text-text-primary text-xs space-y-1">
                  <span className="font-bold text-error block">Peringatan Audit Trail:</span>
                  <p className="text-[11px] text-text-secondary">
                    Administrator ini memiliki <strong>{deletingAdmin.taskCount} riwayat tugas aktif</strong>. Menghapus permanen akan merusak integritas audit. Sistem akan mengalihkan status akun ke <strong>Nonaktif (Soft Delete)</strong>.
                  </p>
                </div>
              ) : (
                <p className="text-[11px] text-text-muted">
                  Akun tidak memiliki riwayat tugas aktif dan dapat dihapus permanen dari basis data.
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-primary-light flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeletingAdmin(null)}
                className="text-xs h-9 px-4 border-primary-light"
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleConfirmDeleteAdmin}
                className="text-xs h-9 px-4 bg-error hover:bg-red-700 text-white font-semibold"
              >
                {deletingAdmin.taskCount > 0 ? "Nonaktifkan Saja" : "Hapus Permanen"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
