"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import {
  CloseIcon,
  PlusIcon,
  SearchIcon,
  ExportIcon,
  EyeIcon,
  TrashIcon,
  CheckCircleIcon,
  CheckIcon,
  ShieldTaxIcon,
  DocumentIcon,
  LockIcon,
} from "@/components/icons";

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
  const [admins, setAdmins] = useState<AdminUser[]>([
    {
      id: "ADM-001",
      name: "Linda David, S.Ak., BKP",
      email: "linda.david@zhouconsulting.id",
      role: "Senior Tax Consultant & Admin",
      specialty: "Tax Service Core & Coretax",
      status: "Active",
      taskCount: 18,
    },
    {
      id: "ADM-002",
      name: "Tasya Anggraeni Firdaus, SE., Ak., CA",
      email: "tasya.anggraeni@zhouconsulting.id",
      role: "Senior Accounting Specialist & Admin",
      specialty: "Accounting Service & SAK",
      status: "Active",
      taskCount: 14,
    },
    {
      id: "ADM-003",
      name: "Rian Pratama, SH.",
      email: "rian.pratama@zhouconsulting.id",
      role: "Junior Legal Officer",
      specialty: "Legal & Corporate Compliance",
      status: "Inactive",
      taskCount: 0,
    },
  ]);

  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    name: "",
    email: "",
    role: "Staf Konsultan & Admin",
    specialty: "Tax Service Core",
    initialPassword: "",
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Audit Logs State (Append-Only Mutlak)
  const [auditLogs] = useState<AuditLog[]>([
    {
      id: "LOG-9925",
      timestamp: "18 Sep 2026, 10:15:20 WIB",
      adminName: "Linda David, S.Ak., BKP",
      adminId: "ADM-001",
      clientId: "CL-88219 (PT Maju Makmur)",
      ticketId: "TK-2026-089",
      statusBefore: "In Review",
      statusAfter: "Completed",
      relatedFile: "Laporan_Rekonsiliasi_Fiskal_2025_Final.pdf",
      notes: "Kertas kerja rekonsiliasi fiskal dan faktur billing INV-2026-089 diterbitkan ke Vault klien.",
    },
    {
      id: "LOG-9924",
      timestamp: "17 Sep 2026, 15:40:12 WIB",
      adminName: "Hendro Wibowo, SE., Ak., CA",
      adminId: "ADM-004",
      clientId: "CL-62910 (PT Solusi Niaga)",
      ticketId: "TK-2026-077",
      statusBefore: "In Progress",
      statusAfter: "Completed",
      relatedFile: "Studi_Kelayakan_Investasi_Ekspansi_2026.pdf",
      notes: "Analisis kelayakan investasi disetujui direksi klien.",
    },
    {
      id: "LOG-9923",
      timestamp: "16 Sep 2026, 11:05:40 WIB",
      adminName: "Tasya Anggraeni Firdaus, SE., Ak., CA",
      adminId: "ADM-002",
      clientId: "CL-74102 (CV Borneo Karya)",
      ticketId: "TK-2026-092",
      statusBefore: "Draft",
      statusAfter: "In Progress",
      relatedFile: "Kompilasi_Jurnal_Buku_Besar_Q3_SAK.xlsx",
      notes: "Kompilasi awal jurnal buku besar Q3 dimulai.",
    },
    {
      id: "LOG-9922",
      timestamp: "15 Sep 2026, 09:20:10 WIB",
      adminName: "Siti Nurhaliza, S.E.",
      adminId: "ADM-005",
      clientId: "CL-40112 (PT Cipta Sarana)",
      ticketId: "TK-2026-058",
      statusBefore: "In Progress",
      statusAfter: "Completed",
      relatedFile: "BPE_SPT_Masa_PPN_1111_Agustus.pdf",
      notes: "Pelaporan SPT PPN 1111 berhasil melalui sistem Coretax DJP.",
    },
    {
      id: "LOG-9921",
      timestamp: "14 Sep 2026, 14:30:15 WIB",
      adminName: "Linda David, S.Ak., BKP",
      adminId: "ADM-001",
      clientId: "CL-88219 (PT Maju Makmur)",
      ticketId: "TK-2026-089",
      statusBefore: "In Progress",
      statusAfter: "Completed",
      relatedFile: "Draft_Rekonsiliasi_Fiskal_2025_v1.pdf",
      notes: "Seluruh 4 checklist tugas telah diselesaikan dan diverifikasi.",
    },
    {
      id: "LOG-9918",
      timestamp: "12 Sep 2026, 09:12:44 WIB",
      adminName: "Tasya Anggraeni Firdaus, SE., Ak., CA",
      adminId: "ADM-002",
      clientId: "CL-74102 (CV Borneo Karya)",
      ticketId: "TK-2026-042",
      statusBefore: "In Progress",
      statusAfter: "Completed",
      relatedFile: "Laporan_Keuangan_SAK_Q2_Final.pdf",
      notes: "Kompilasi laporan keuangan SAK Q2 ditandatangani dan diunggah.",
    },
    {
      id: "LOG-9905",
      timestamp: "10 Sep 2026, 16:45:10 WIB",
      adminName: "Muhamad Dekhsa Afnan, SH., M.Kn.",
      adminId: "ADM-SUPER",
      clientId: "CL-51209 (PT Mega Cipta)",
      ticketId: "TK-2026-061",
      statusBefore: "In Progress",
      statusAfter: "Completed",
      relatedFile: "Legal_Opinion_PT_Mega_Cipta.pdf",
      notes: "Opini hukum perjanjian vendor diterbitkan.",
    },
    {
      id: "LOG-9892",
      timestamp: "08 Sep 2026, 11:20:00 WIB",
      adminName: "Tasya Anggraeni Firdaus, SE., Ak., CA",
      adminId: "ADM-002",
      clientId: "CL-33981 (Yayasan Bina)",
      ticketId: "TK-2026-050",
      statusBefore: "In Progress",
      statusAfter: "Completed",
      relatedFile: "SKB_PPh23_Yayasan_Approved.pdf",
      notes: "SKB PPh 23 resmi disetujui KPP Pratama.",
    },
  ]);

  // Audit Filter State
  const [filterAdmin, setFilterAdmin] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Add new admin
  const handleAddAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdmin.name || !newAdmin.email || !newAdmin.initialPassword) {
      showToast("Mohon lengkapi seluruh kolom formulir.");
      return;
    }

    const created: AdminUser = {
      id: `ADM-00${admins.length + 1}`,
      name: newAdmin.name,
      email: newAdmin.email,
      role: newAdmin.role,
      specialty: newAdmin.specialty,
      status: "Active",
      taskCount: 0,
    };

    setAdmins([...admins, created]);
    setShowAddAdminModal(false);
    setNewAdmin({
      name: "",
      email: "",
      role: "Staf Konsultan & Admin",
      specialty: "Tax Service Core",
      initialPassword: "",
    });
    showToast(`Admin ${created.name} berhasil ditambahkan.`);
  };

  // Toggle soft-delete
  const handleToggleStatus = (adminId: string) => {
    setAdmins(
      admins.map((a) => {
        if (a.id === adminId) {
          const next = a.status === "Active" ? "Inactive" : "Active";
          showToast(`Status admin ${a.name} diubah menjadi ${next}.`);
          return { ...a, status: next };
        }
        return a;
      })
    );
  };

  // Hard delete check
  const handleDeleteAdmin = (admin: AdminUser) => {
    if (admin.taskCount > 0) {
      showToast(
        `Penghapusan permanen ditolak: Akun ${admin.name} memiliki ${admin.taskCount} riwayat tugas aktif. Gunakan fitur Nonaktifkan (Soft Delete).`
      );
      return;
    }

    setAdmins(admins.filter((a) => a.id !== admin.id));
    showToast(`Akun admin ${admin.name} berhasil dihapus permanen.`);
  };

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

  // Export functions
  const handleExportCSV = () => {
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-primary-light">
        <div>
          <div className="flex items-center gap-2 text-xs text-text-muted mb-1.5">
            <Link href="/dashboard/superadmin" className="hover:text-primary transition-colors">
              Superadmin Portal
            </Link>
            <span>/</span>
            <span className="text-primary font-bold">Log Audit &amp; Keamanan Sistem</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
            Log Audit Perubahan Status &amp; Aktivitas
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-2xl">
            Pencatatan riwayat perubahan status penugasan klien, unggahan berkas, dan aktivitas administratif yang bersifat <em>immutable</em> &amp; <em>append-only</em> sesuai UU PDP No. 27/2022.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="text-xs h-9 px-3 border-primary-light font-semibold"
          >
            <ExportIcon className="text-xs mr-1.5" />
            Ekspor CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleExportPDF}
            className="text-xs h-9 px-3.5 font-semibold shadow-xs"
          >
            <ExportIcon className="text-xs mr-1.5" />
            Laporan PDF
          </Button>
        </div>
      </div>

      {/* 3 TOP AUDIT METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="p-5 rounded-2xl border-primary-light bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted font-bold uppercase tracking-wider">
              Total Log Aktivitas
            </span>
            <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center text-primary text-xs">
              <DocumentIcon />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-primary font-mono">
              28
            </span>
            <span className="text-xs text-text-secondary">Catatan</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-primary font-medium">
            <ShieldTaxIcon className="text-xs text-emerald-500" />
            <span>Append-Only Mutlak</span>
          </div>
        </Card>

        <Card className="p-5 rounded-2xl border-primary-light bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted font-bold uppercase tracking-wider">
              Perubahan Status Selesai
            </span>
            <div className="w-8 h-8 rounded-lg bg-success/15 flex items-center justify-center text-success text-xs">
              <CheckCircleIcon />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-success font-mono">
              18
            </span>
            <span className="text-xs text-text-secondary">Mutasi Selesai</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-success font-medium">
            <CheckIcon className="text-[9px]" />
            <span>100% Terverifikasi Konsultan</span>
          </div>
        </Card>

        <Card className="p-5 rounded-2xl border-primary-light bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted font-bold uppercase tracking-wider">
              Integritas Kriptografis
            </span>
            <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center text-primary text-xs">
              <LockIcon />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-primary font-mono">
              SHA-256
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
            <CheckIcon className="text-[9px]" />
            <span>Kepatuhan UU PDP No. 27/2022</span>
          </div>
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
                className="text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <PlusIcon className="text-xs" />
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
                      <th className="py-3 px-5">Spesialisasi</th>
                      <th className="py-3 px-5 text-center">Status</th>
                      <th className="py-3 px-5 text-center">Riwayat Tugas</th>
                      <th className="py-3 px-5 text-right">Aksi Kelola</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary-light text-text">
                    {admins.map((admin) => (
                      <tr key={admin.id} className="hover:bg-surface/50 transition-colors">
                        <td className="py-4 px-5">
                          <div className="font-bold text-primary">{admin.name}</div>
                          <span className="font-mono text-[11px] text-text-secondary">{admin.id}</span>
                        </td>
                        <td className="py-4 px-5 text-text-secondary">{admin.email}</td>
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
                              onClick={() => handleToggleStatus(admin.id)}
                              className="text-[11px] py-1 px-2.5 h-auto"
                            >
                              {admin.status === "Active" ? "Nonaktifkan" : "Aktifkan"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => showToast(`Tautan reset password untuk ${admin.email} berhasil dikirimkan ke email resmi.`)}
                              className="text-[11px] py-1 px-2.5 h-auto cursor-pointer"
                            >
                              Reset
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={admin.taskCount > 0}
                              onClick={() => handleDeleteAdmin(admin)}
                              className={`text-[11px] py-1 px-2 h-auto text-error hover:text-error ${
                                admin.taskCount > 0 ? "opacity-30 cursor-not-allowed" : ""
                              }`}
                              title={
                                admin.taskCount > 0
                                  ? "Tidak dapat dihapus permanen karena memiliki riwayat tugas"
                                  : "Hapus permanen"
                              }
                            >
                              <TrashIcon className="text-xs" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LOG AUDIT PERUBAHAN STATUS (APPEND-ONLY) */}
        {activeTab === "audit" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-primary">
                  Log Audit Perubahan Status Tiket &amp; Lembar Kerja
                </h2>
                <p className="text-xs text-text-secondary">
                  Catatan audit mutlak tidak dapat diedit atau dihapus (*append-only*).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCSV}
                  className="text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <ExportIcon className="text-xs" />
                  <span>Ekspor CSV</span>
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleExportPDF}
                  className="text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <ExportIcon className="text-xs" />
                  <span>Ekspor PDF</span>
                </Button>
              </div>
            </div>

            {/* Audit Filter Controls */}
            <div className="p-4 rounded-xl bg-white border border-primary-light shadow-sm flex flex-col sm:flex-row items-center gap-3 text-xs">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="font-semibold text-text-secondary whitespace-nowrap">Admin:</span>
                <select
                  value={filterAdmin}
                  onChange={(e) => setFilterAdmin(e.target.value)}
                  className="h-9 px-3 rounded-md border border-primary-light bg-surface text-text text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                >
                  <option value="ALL">Semua Admin</option>
                  <option value="Linda David">Linda David</option>
                  <option value="Tasya Anggraeni">Tasya Anggraeni</option>
                  <option value="Muhamad Dekhsa">Muhamad Dekhsa</option>
                </select>
              </div>

              <div className="relative flex-1 w-full">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari ID Tiket (TK-...) atau ID Klien (CL-...)..."
                  className="pl-8 h-9 text-xs"
                />
                <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 text-silver text-xs pointer-events-none" />
              </div>
            </div>

            {/* Immutable Audit Table */}
            <div className="bg-white rounded-xl border border-primary-light shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface border-b border-primary-light text-[11px] font-bold text-text-secondary uppercase">
                    <tr>
                      <th className="py-3 px-4">Waktu (Timestamp)</th>
                      <th className="py-3 px-4">Admin Bertugas</th>
                      <th className="py-3 px-4">ID Klien</th>
                      <th className="py-3 px-4">ID Tiket</th>
                      <th className="py-3 px-4 text-center">Status Sebelum</th>
                      <th className="py-3 px-4 text-center">Status Sesudah</th>
                      <th className="py-3 px-4">Berkas Terkait</th>
                      <th className="py-3 px-4 text-right">Detail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary-light text-text">
                    {paginatedLogs.map((log) => (
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
                          <Badge variant="secondary" className="text-[10px] font-mono">
                            {log.statusBefore}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <Badge variant="success" className="text-[10px] font-mono">
                            {log.statusAfter}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-text-secondary font-mono text-[11px]">
                          {log.relatedFile}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedLog(log)}
                            className="text-[11px] py-1 px-2.5 h-auto inline-flex items-center gap-1"
                          >
                            <EyeIcon className="text-[10px]" />
                            <span>Inspeksi</span>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

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
            </div>
          </div>
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
                  placeholder="Contoh: Ahmad Rizki, S.Ak., BKP"
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
                  placeholder="ahmad.rizki@zhouconsulting.id"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="admin-spec">Spesialisasi Penugasan</Label>
                <select
                  id="admin-spec"
                  value={newAdmin.specialty}
                  onChange={(e) => setNewAdmin({ ...newAdmin, specialty: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-primary-light bg-white text-text text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                >
                  <option value="Tax Service Core">Tax Service Core (Coretax DJP)</option>
                  <option value="Accounting Service">Accounting Service (SAK)</option>
                  <option value="Business Financial Consulting">Business &amp; Financial Consulting</option>
                  <option value="Legal & Corporate Compliance">Legal &amp; Corporate Compliance</option>
                </select>
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
                  <div>
                    <Badge variant="secondary">{selectedLog.statusBefore}</Badge>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-text-secondary">Status Sesudah:</span>
                  <div>
                    <Badge variant="success">{selectedLog.statusAfter}</Badge>
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
    </div>
  );
}
