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
  UserIcon,
  ShieldTaxIcon,
  CheckCircleIcon,
  CheckIcon,
  SearchIcon,
  PlusIcon,
  CloseIcon,
  EditIcon,
  TrashIcon,
  EyeIcon,
  LockIcon,
} from "@/components/icons";

export interface StaffAdmin {
  id: string;
  name: string;
  nip: string;
  email: string;
  phone: string;
  role: string;
  division: "Tax Service Core" | "Accounting Service" | "Business Financial Consulting" | "Legal Compliance" | "IT & Operasional";
  tasksCount: number;
  status: "Aktif" | "Nonaktif";
  twoFactorEnabled: boolean;
  joinDate: string;
}

const INITIAL_STAFF: StaffAdmin[] = [
  {
    id: "STF-01",
    name: "Linda David, S.Ak., BKP",
    nip: "ADM-001",
    email: "linda.david@zhouconsulting.id",
    phone: "+62 812-9876-1201",
    role: "Senior Tax Consultant & Admin",
    division: "Tax Service Core",
    tasksCount: 5,
    status: "Aktif",
    twoFactorEnabled: true,
    joinDate: "15 Jan 2024",
  },
  {
    id: "STF-02",
    name: "Tasya Anggraeni Firdaus, SE., Ak., CA",
    nip: "ADM-002",
    email: "tasya.anggraeni@zhouconsulting.id",
    phone: "+62 812-9876-1202",
    role: "Senior Accounting Specialist",
    division: "Accounting Service",
    tasksCount: 3,
    status: "Aktif",
    twoFactorEnabled: true,
    joinDate: "01 Mar 2024",
  },
  {
    id: "STF-03",
    name: "Muhamad Dekhsa Afnan, SH., M.Kn.",
    nip: "ADM-003",
    email: "dekhsa.afnan@zhouconsulting.id",
    phone: "+62 812-9876-1203",
    role: "Corporate Legal Partner",
    division: "Legal Compliance",
    tasksCount: 2,
    status: "Aktif",
    twoFactorEnabled: true,
    joinDate: "10 Okt 2023",
  },
  {
    id: "STF-04",
    name: "Hendro Wibowo, SE., Ak., CA",
    nip: "ADM-004",
    email: "hendro.wibowo@zhouconsulting.id",
    phone: "+62 812-9876-1204",
    role: "Lead Financial Analyst",
    division: "Business Financial Consulting",
    tasksCount: 4,
    status: "Aktif",
    twoFactorEnabled: true,
    joinDate: "20 Mei 2024",
  },
  {
    id: "STF-05",
    name: "Siti Nurhaliza, S.E.",
    nip: "ADM-005",
    email: "siti.nurhaliza@zhouconsulting.id",
    phone: "+62 812-9876-1205",
    role: "Tax Compliance Specialist",
    division: "Tax Service Core",
    tasksCount: 2,
    status: "Aktif",
    twoFactorEnabled: true,
    joinDate: "12 Jul 2024",
  },
  {
    id: "STF-06",
    name: "Ahmad Fauzi, S.Ak.",
    nip: "ADM-006",
    email: "ahmad.fauzi@zhouconsulting.id",
    phone: "+62 812-9876-1206",
    role: "Junior Auditor SAK",
    division: "Accounting Service",
    tasksCount: 1,
    status: "Aktif",
    twoFactorEnabled: true,
    joinDate: "05 Nov 2024",
  },
  {
    id: "STF-07",
    name: "Rian Pratama, SH.",
    nip: "ADM-007",
    email: "rian.pratama@zhouconsulting.id",
    phone: "+62 812-9876-1207",
    role: "Junior Legal Officer",
    division: "Legal Compliance",
    tasksCount: 0,
    status: "Nonaktif",
    twoFactorEnabled: false,
    joinDate: "18 Des 2024",
  },
  {
    id: "STF-08",
    name: "Dewi Lestari, S.Kom.",
    nip: "ADM-008",
    email: "dewi.lestari@zhouconsulting.id",
    phone: "+62 812-9876-1208",
    role: "System & Operations Admin",
    division: "IT & Operasional",
    tasksCount: 1,
    status: "Aktif",
    twoFactorEnabled: true,
    joinDate: "02 Feb 2025",
  },
];

export default function SuperadminUsersPage() {
  const [staffList, setStaffList] = useState<StaffAdmin[]>(INITIAL_STAFF);
  const [searchQuery, setSearchQuery] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffAdmin | null>(null);
  const [deletingStaff, setDeletingStaff] = useState<StaffAdmin | null>(null);

  // Add Form State
  const [newStaffForm, setNewStaffForm] = useState({
    name: "",
    email: "",
    phone: "+62 8",
    role: "Junior Consultant",
    division: "Tax Service Core" as StaffAdmin["division"],
    initialPassword: "ZhouPass" + Math.floor(1000 + Math.random() * 9000) + "!",
    twoFactorEnabled: true,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffForm.name.trim() || !newStaffForm.email.trim()) return;

    const nextId = "STF-0" + (staffList.length + 1);
    const nextNip = "ADM-00" + (staffList.length + 1);

    const created: StaffAdmin = {
      id: nextId,
      name: newStaffForm.name.trim(),
      nip: nextNip,
      email: newStaffForm.email.trim(),
      phone: newStaffForm.phone.trim(),
      role: newStaffForm.role,
      division: newStaffForm.division,
      tasksCount: 0,
      status: "Aktif",
      twoFactorEnabled: newStaffForm.twoFactorEnabled,
      joinDate: "18 Sep 2026",
    };

    setStaffList((prev) => [created, ...prev]);
    setIsAddModalOpen(false);
    setNewStaffForm({
      name: "",
      email: "",
      phone: "+62 8",
      role: "Junior Consultant",
      division: "Tax Service Core",
      initialPassword: "ZhouPass" + Math.floor(1000 + Math.random() * 9000) + "!",
      twoFactorEnabled: true,
    });

    showToast(
      `Akun staf ${created.name} (${created.nip}) berhasil dibuat. Akses kredensial dikirimkan via email.`
    );
  };

  const handleEditStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;

    setStaffList((prev) =>
      prev.map((s) => (s.id === editingStaff.id ? editingStaff : s))
    );
    showToast(`Data akun ${editingStaff.name} berhasil diperbarui.`);
    setEditingStaff(null);
  };

  const handleToggleStatus = (staffId: string) => {
    setStaffList((prev) =>
      prev.map((s) => {
        if (s.id === staffId) {
          const nextStatus = s.status === "Aktif" ? "Nonaktif" : "Aktif";
          showToast(`Status akun ${s.name} diubah menjadi ${nextStatus}.`);
          return { ...s, status: nextStatus };
        }
        return s;
      })
    );
  };

  const handleConfirmDelete = () => {
    if (!deletingStaff) return;

    if (deletingStaff.tasksCount > 0) {
      showToast(
        `Penghapusan permanen ditolak: ${deletingStaff.name} memiliki ${deletingStaff.tasksCount} tiket aktif. Akun dialihkan ke status Nonaktif.`
      );
      handleToggleStatus(deletingStaff.id);
      setDeletingStaff(null);
      return;
    }

    setStaffList((prev) => prev.filter((s) => s.id !== deletingStaff.id));
    showToast(`Akun ${deletingStaff.name} berhasil dihapus permanen dari sistem.`);
    setDeletingStaff(null);
  };

  // Filter staff list
  const filteredStaff = staffList.filter((s) => {
    const matchesDiv = divisionFilter === "ALL" || s.division === divisionFilter;
    const matchesStatus = statusFilter === "ALL" || s.status === statusFilter;
    const matchesRole = roleFilter === "ALL" || s.role.includes(roleFilter);
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.nip.toLowerCase().includes(q) ||
      s.division.toLowerCase().includes(q) ||
      s.role.toLowerCase().includes(q);

    return matchesDiv && matchesStatus && matchesRole && matchesSearch;
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [divisionFilter, statusFilter, roleFilter, searchQuery]);

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage) || 1;
  const paginatedStaff = filteredStaff.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalStaffCount = staffList.length;
  const activeStaffCount = staffList.filter((s) => s.status === "Aktif").length;
  const twoFactorCount = staffList.filter((s) => s.twoFactorEnabled).length;
  const twoFactorPercentage = Math.round((twoFactorCount / totalStaffCount) * 100);

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

      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-primary-light">
        <div>
          <div className="flex items-center gap-2 text-xs text-text-muted mb-1.5">
            <Link href="/dashboard/superadmin" className="hover:text-primary transition-colors">
              Superadmin Portal
            </Link>
            <span>/</span>
            <span className="text-primary font-bold">Kelola Admin &amp; Staf</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
            Kelola Akun Staf Konsultan &amp; Admin
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-2xl">
            Manajemen akun kredensial staf operasional, penetapan hak akses role-based (RBAC), penugasan divisi, dan penegakan keamanan multi-faktor (2FA).
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="text-xs font-semibold h-10 px-4 shadow-sm flex items-center gap-2"
          >
            <PlusIcon className="text-xs" />
            <span>Tambah Akun Staf Baru</span>
          </Button>
        </div>
      </div>

      {/* 3 TOP OPERATIONAL & SECURITY METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Card 1 */}
        <Card className="p-5 rounded-2xl border-primary-light bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted font-bold uppercase tracking-wider">
              Total Akun Staf
            </span>
            <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center text-primary text-xs">
              <UserIcon />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-primary font-mono">
              {totalStaffCount < 10 ? `0${totalStaffCount}` : totalStaffCount}
            </span>
            <span className="text-xs text-text-secondary">Staf Terdaftar</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-primary font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span>4 Divisi Layanan Utama</span>
          </div>
        </Card>

        {/* Card 2 */}
        <Card className="p-5 rounded-2xl border-primary-light bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted font-bold uppercase tracking-wider">
              Staf Aktif Bertugas
            </span>
            <div className="w-8 h-8 rounded-lg bg-success/15 flex items-center justify-center text-success text-xs">
              <CheckCircleIcon />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-success font-mono">
              {activeStaffCount < 10 ? `0${activeStaffCount}` : activeStaffCount}
            </span>
            <span className="text-xs text-text-secondary">Akun Aktif</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-text-muted font-medium">
            <CheckIcon className="text-[9px] text-success" />
            <span>{totalStaffCount - activeStaffCount} Akun Ditangguhkan (Nonaktif)</span>
          </div>
        </Card>

        {/* Card 3 */}
        <Card className="p-5 rounded-2xl border-primary-light bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted font-bold uppercase tracking-wider">
              Proteksi Multi-Faktor (2FA)
            </span>
            <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center text-primary text-xs">
              <ShieldTaxIcon />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-primary font-mono">
              {twoFactorPercentage}%
            </span>
            <span className="text-xs text-text-secondary">Terproteksi</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
            <LockIcon className="text-[9px]" />
            <span>Standar Enkripsi SHA-256 &bull; UU PDP</span>
          </div>
        </Card>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white rounded-2xl border border-primary-light p-4 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="absolute left-3 top-2.5 text-text-muted text-xs" />
          <Input
            type="text"
            placeholder="Cari staf, email, NIP, atau keahlian..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-xs h-9 bg-surface border-primary-light focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={divisionFilter}
            onChange={(e) => setDivisionFilter(e.target.value)}
            className="text-xs h-9 px-3 rounded-xl border border-primary-light bg-surface text-text-primary focus:bg-white font-medium focus:outline-none"
          >
            <option value="ALL">Semua Divisi</option>
            <option value="Tax Service Core">Tax Service Core</option>
            <option value="Accounting Service">Accounting Service</option>
            <option value="Business Financial Consulting">Business Financial Consulting</option>
            <option value="Legal Compliance">Legal Compliance</option>
            <option value="IT & Operasional">IT &amp; Operasional</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs h-9 px-3 rounded-xl border border-primary-light bg-surface text-text-primary focus:bg-white font-medium focus:outline-none"
          >
            <option value="ALL">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Nonaktif">Nonaktif</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs h-9 px-3 rounded-xl border border-primary-light bg-surface text-text-primary focus:bg-white font-medium focus:outline-none"
          >
            <option value="ALL">Semua Peran</option>
            <option value="Senior">Senior Specialist</option>
            <option value="Partner">Partner &amp; Lead</option>
            <option value="Specialist">Specialist</option>
            <option value="Junior">Junior Officer</option>
          </select>
        </div>
      </div>

      {/* MASTER STAFF TABLE */}
      <Card className="rounded-2xl border-primary-light bg-white shadow-xs overflow-hidden">
        <div className="p-4 bg-surface/60 border-b border-primary-light flex items-center justify-between">
          <span className="text-xs font-bold text-primary">
            Daftar Akun Staf Konsultan &amp; Otoritas RBAC ({filteredStaff.length})
          </span>
          <span className="text-[11px] text-text-muted hidden sm:inline">
            Akses root penuh untuk menambah, menyunting peran, dan menonaktifkan akun staf operasional.
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface border-b border-primary-light text-text-muted font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Staf &amp; NIP</th>
                <th className="py-3.5 px-4">Email &amp; WhatsApp</th>
                <th className="py-3.5 px-4">Divisi &amp; Peran RBAC</th>
                <th className="py-3.5 px-4 text-center">Beban Tugas</th>
                <th className="py-3.5 px-4 text-center">Status Akun</th>
                <th className="py-3.5 px-4 text-center">Keamanan 2FA</th>
                <th className="py-3.5 px-4 text-right">Aksi Superadmin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-light">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-text-muted text-xs">
                    Tidak ada akun staf yang cocok dengan kriteria pencarian dan filter.
                  </td>
                </tr>
              ) : (
                paginatedStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-surface/50 transition-colors">
                    {/* Staf & NIP */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary-light text-primary font-bold flex items-center justify-center text-xs shrink-0">
                          {staff.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-primary truncate max-w-xs sm:max-w-sm">
                            {staff.name}
                          </div>
                          <div className="font-mono text-[11px] text-text-muted">
                            NIP: {staff.nip}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Divisi & Departemen */}
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-text-primary text-xs">
                        {staff.division}
                      </span>
                    </td>

                    {/* Peran & Hak Akses */}
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          staff.role.includes("Superadmin")
                            ? "primary"
                            : staff.role.includes("Lead")
                            ? "secondary"
                            : "outline"
                        }
                        size="sm"
                        className="font-medium"
                      >
                        {staff.role}
                      </Badge>
                    </td>

                    {/* Kontak Email & Telepon */}
                    <td className="py-3.5 px-4 text-text-secondary text-xs">
                      <div className="font-mono text-[11px] text-primary">{staff.email}</div>
                      <div className="text-[11px] text-text-muted">{staff.phone}</div>
                    </td>

                    {/* Keamanan & 2FA */}
                    <td className="py-3.5 px-4 text-center">
                      {staff.twoFactorEnabled ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-success bg-emerald-50 px-2 py-0.5 rounded-full border border-success/30">
                          <CheckIcon className="text-[9px]" />
                          2FA Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-300">
                          Non-Aktif
                        </span>
                      )}
                    </td>

                    {/* Status Akun */}
                    <td className="py-3.5 px-4 text-center">
                      <Badge
                        variant={staff.status === "Aktif" ? "success" : "silver"}
                        size="sm"
                        dot={staff.status === "Aktif"}
                      >
                        {staff.status}
                      </Badge>
                    </td>

                    {/* Aksi Superadmin */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            showToast(`Melihat detail izin RBAC untuk: ${staff.name}`);
                          }}
                          className="h-8 px-2.5 text-xs border-primary-light hover:bg-surface text-primary"
                          title="Lihat Detail Izin RBAC"
                        >
                          <EyeIcon className="text-xs mr-1" />
                          Detail
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingStaff(staff)}
                          className="h-8 px-2 text-xs border-primary-light hover:bg-surface text-primary"
                          title="Ubah Data / Hak Akses"
                        >
                          <EditIcon className="text-xs" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeletingStaff(staff)}
                          className="h-8 px-2.5 text-xs border-primary-light hover:bg-red-50 hover:text-error hover:border-error/30 text-text-muted"
                          title="Hapus Akun Staf"
                        >
                          <TrashIcon className="text-xs" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-surface border-t border-primary-light flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-secondary">
          <span>
            Menampilkan {(currentPage - 1) * itemsPerPage + 1} &ndash;{" "}
            {Math.min(currentPage * itemsPerPage, filteredStaff.length)} dari {totalStaffCount} staf operasional terdaftar
          </span>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </Card>

      {/* MODAL 1: TAMBAH AKUN STAF BARU */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-dark/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-primary-light max-w-lg w-full p-6 space-y-4 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 text-text-secondary hover:text-primary p-1"
              aria-label="Tutup modal"
            >
              <CloseIcon className="text-sm" />
            </button>

            <div>
              <span className="text-[10px] font-mono text-text-muted font-bold block">
                SUPERADMIN AUTHORITY
              </span>
              <h3 className="text-lg font-bold text-primary">
                Tambah Akun Staf Konsultan Baru
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Pendaftaran kredensial staf operasional dan konfigurasi hak akses role-based (RBAC).
              </p>
            </div>

            <form onSubmit={handleAddStaffSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-primary">
                    Nama Lengkap &amp; Gelar <span className="text-error">*</span>
                  </Label>
                  <Input
                    type="text"
                    required
                    placeholder="e.g. Linda David, S.Ak., BKP"
                    value={newStaffForm.name}
                    onChange={(e) =>
                      setNewStaffForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="text-xs h-9 bg-white border-primary-light"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-primary">
                    Email Korporat <span className="text-error">*</span>
                  </Label>
                  <Input
                    type="email"
                    required
                    placeholder="nama@zhouconsulting.id"
                    value={newStaffForm.email}
                    onChange={(e) =>
                      setNewStaffForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                    className="text-xs h-9 bg-white border-primary-light font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-primary">
                    Nomor WhatsApp Resmi
                  </Label>
                  <Input
                    type="text"
                    value={newStaffForm.phone}
                    onChange={(e) =>
                      setNewStaffForm((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    className="text-xs h-9 bg-white border-primary-light font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-primary">
                    Divisi Layanan Penugasan <span className="text-error">*</span>
                  </Label>
                  <select
                    value={newStaffForm.division}
                    onChange={(e) =>
                      setNewStaffForm((prev) => ({
                        ...prev,
                        division: e.target.value as StaffAdmin["division"],
                      }))
                    }
                    className="w-full text-xs h-9 px-3 rounded-xl border border-primary-light bg-surface text-text-primary focus:bg-white font-medium focus:outline-none"
                  >
                    <option value="Tax Service Core">Tax Service Core</option>
                    <option value="Accounting Service">Accounting Service</option>
                    <option value="Business Financial Consulting">Business Financial Consulting</option>
                    <option value="Legal Compliance">Legal Compliance</option>
                    <option value="IT & Operasional">IT &amp; Operasional</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-primary">
                    Peran / Hak Akses (RBAC) <span className="text-error">*</span>
                  </Label>
                  <select
                    value={newStaffForm.role}
                    onChange={(e) =>
                      setNewStaffForm((prev) => ({ ...prev, role: e.target.value }))
                    }
                    className="w-full text-xs h-9 px-3 rounded-xl border border-primary-light bg-surface text-text-primary focus:bg-white font-medium focus:outline-none"
                  >
                    <option value="Senior Tax Consultant & Admin">Senior Tax Consultant &amp; Admin</option>
                    <option value="Senior Accounting Specialist">Senior Accounting Specialist</option>
                    <option value="Corporate Legal Partner">Corporate Legal Partner</option>
                    <option value="Lead Financial Analyst">Lead Financial Analyst</option>
                    <option value="Tax Compliance Specialist">Tax Compliance Specialist</option>
                    <option value="Junior Consultant">Junior Consultant</option>
                    <option value="Junior Auditor SAK">Junior Auditor SAK</option>
                    <option value="System & Operations Admin">System &amp; Operations Admin</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-primary">
                    Kata Sandi Sementara
                  </Label>
                  <Input
                    type="text"
                    required
                    value={newStaffForm.initialPassword}
                    onChange={(e) =>
                      setNewStaffForm((prev) => ({ ...prev, initialPassword: e.target.value }))
                    }
                    className="text-xs h-9 bg-surface border-primary-light font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-surface rounded-xl border border-primary-light space-y-2">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={newStaffForm.twoFactorEnabled}
                    onChange={(e) =>
                      setNewStaffForm((prev) => ({ ...prev, twoFactorEnabled: e.target.checked }))
                    }
                    className="rounded border-primary-light text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-primary">
                    Wajibkan Autentikasi Dua Faktor (2FA OTP via WhatsApp/Email)
                  </span>
                </label>
                <p className="text-[10px] text-text-muted pl-6.5">
                  Staf wajib melakukan verifikasi OTP pada setiap sesi login sesuai standar kepatuhan UU PDP No. 27/2022.
                </p>
              </div>

              <div className="pt-3 border-t border-primary-light flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddModalOpen(false)}
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
                  Simpan &amp; Terbitkan Akun
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT AKUN & PERAN RBAC */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-dark/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-primary-light max-w-lg w-full p-6 space-y-4 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingStaff(null)}
              className="absolute top-5 right-5 text-text-secondary hover:text-primary p-1"
              aria-label="Tutup modal"
            >
              <CloseIcon className="text-sm" />
            </button>

            <div>
              <span className="text-[10px] font-mono text-text-muted font-bold block">
                EDIT DATA STAF ({editingStaff.nip})
              </span>
              <h3 className="text-lg font-bold text-primary">
                Perbarui Profil &amp; Hak Akses
              </h3>
            </div>

            <form onSubmit={handleEditStaffSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-primary">Nama Lengkap &amp; Gelar</Label>
                <Input
                  type="text"
                  required
                  value={editingStaff.name}
                  onChange={(e) =>
                    setEditingStaff({ ...editingStaff, name: e.target.value })
                  }
                  className="text-xs h-9 bg-white border-primary-light"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-primary">Email Korporat</Label>
                  <Input
                    type="email"
                    required
                    value={editingStaff.email}
                    onChange={(e) =>
                      setEditingStaff({ ...editingStaff, email: e.target.value })
                    }
                    className="text-xs h-9 bg-white border-primary-light font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-primary">Nomor WhatsApp</Label>
                  <Input
                    type="text"
                    value={editingStaff.phone}
                    onChange={(e) =>
                      setEditingStaff({ ...editingStaff, phone: e.target.value })
                    }
                    className="text-xs h-9 bg-white border-primary-light font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-primary">Peran RBAC</Label>
                  <Input
                    type="text"
                    required
                    value={editingStaff.role}
                    onChange={(e) =>
                      setEditingStaff({ ...editingStaff, role: e.target.value })
                    }
                    className="text-xs h-9 bg-white border-primary-light"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-primary">Divisi</Label>
                  <select
                    value={editingStaff.division}
                    onChange={(e) =>
                      setEditingStaff({
                        ...editingStaff,
                        division: e.target.value as StaffAdmin["division"],
                      })
                    }
                    className="w-full text-xs h-9 px-3 rounded-xl border border-primary-light bg-surface text-text-primary focus:bg-white font-medium focus:outline-none"
                  >
                    <option value="Tax Service Core">Tax Service Core</option>
                    <option value="Accounting Service">Accounting Service</option>
                    <option value="Business Financial Consulting">Business Financial Consulting</option>
                    <option value="Legal Compliance">Legal Compliance</option>
                    <option value="IT & Operasional">IT &amp; Operasional</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-surface rounded-xl border border-primary-light space-y-2">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editingStaff.twoFactorEnabled}
                    onChange={(e) =>
                      setEditingStaff({ ...editingStaff, twoFactorEnabled: e.target.checked })
                    }
                    className="rounded border-primary-light text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-primary">
                    Proteksi Autentikasi Dua Faktor (2FA OTP) Aktif
                  </span>
                </label>
              </div>

              <div className="pt-3 border-t border-primary-light flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingStaff(null)}
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

      {/* MODAL 3: KONFIRMASI NONAKTIFKAN / HAPUS */}
      {deletingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-dark/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-primary-light max-w-md w-full p-6 space-y-4 relative">
            <button
              onClick={() => setDeletingStaff(null)}
              className="absolute top-5 right-5 text-text-secondary hover:text-primary p-1"
              aria-label="Tutup modal"
            >
              <CloseIcon className="text-sm" />
            </button>

            <div className="flex items-center gap-3 text-error">
              <div className="w-10 h-10 rounded-xl bg-error/15 flex items-center justify-center text-error text-base">
                <TrashIcon />
              </div>
              <div>
                <h3 className="text-base font-bold text-primary">Konfirmasi Hapus Akun</h3>
                <span className="text-xs text-text-muted font-mono">{deletingStaff.nip} &bull; {deletingStaff.name}</span>
              </div>
            </div>

            <div className="text-xs text-text-secondary space-y-2">
              <p>
                Apakah Anda yakin ingin menghapus akun staf <strong>{deletingStaff.name}</strong>?
              </p>
              {deletingStaff.tasksCount > 0 ? (
                <div className="p-3 bg-error/10 border border-error/25 rounded-xl text-text-primary text-xs space-y-1">
                  <span className="font-bold text-error block">Peringatan Audit Trail:</span>
                  <p className="text-[11px] text-text-secondary">
                    Staf ini memiliki <strong>{deletingStaff.tasksCount} tiket penugasan aktif</strong>. Menghapus permanen akan merusak rekam jejak audit. Sistem akan mengalihkan status akun ke <strong>Nonaktif (Soft Delete)</strong>.
                  </p>
                </div>
              ) : (
                <p className="text-[11px] text-text-muted">
                  Akun tidak memiliki tiket aktif dan dapat dihapus permanen dari basis data.
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-primary-light flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeletingStaff(null)}
                className="text-xs h-9 px-4 border-primary-light"
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleConfirmDelete}
                className="text-xs h-9 px-4 bg-error hover:bg-red-700 text-white font-semibold"
              >
                {deletingStaff.tasksCount > 0 ? "Nonaktifkan Saja" : "Hapus Permanen"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
