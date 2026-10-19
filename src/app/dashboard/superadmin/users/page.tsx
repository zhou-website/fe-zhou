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
  CheckCircleIcon,
  CheckIcon,
  SearchIcon,
  CloseIcon,
  EditIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  LockIcon,
} from "@/components/icons";
import { superadminApi, adminApi, AdminUserItem, ConsultationItem } from "@/lib/api";

export interface StaffAdmin {
  id: string;
  name: string;
  nip: string;
  email: string;
  phone: string;
  role: "Admin" | "Superadmin" | string;
  division: "Tax Service Core" | "Accounting Service" | "Business Financial Consulting" | "Legal Compliance" | "IT & Operasional";
  tasksCount: number;
  status: "Aktif" | "Nonaktif";
  twoFactorEnabled: boolean;
  joinDate: string;
  password?: string;
}

const STORAGE_KEY_STAFF_OVERRIDES = "zhou_staff_admin_overrides_v2";
const STORAGE_KEY_STAFF_CREATED = "zhou_staff_admin_created_v2";
const STORAGE_KEY_STAFF_DELETED = "zhou_staff_admin_deleted_v2";
const STORAGE_KEY_ADMIN_PASSWORDS = "zhou_admin_passwords_v2";

const getSavedAdminPasswords = (): Record<string, string> => {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ADMIN_PASSWORDS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveAdminPassword = (key: string, pass: string) => {
  if (typeof window === "undefined" || !key || !pass) return;
  try {
    const map = getSavedAdminPasswords();
    map[key.toLowerCase().trim()] = pass;
    localStorage.setItem(STORAGE_KEY_ADMIN_PASSWORDS, JSON.stringify(map));
  } catch {}
};

const getLocalStaffCache = () => {
  if (typeof window === "undefined") {
    return {
      overrides: {} as Record<string, Partial<StaffAdmin>>,
      created: [] as StaffAdmin[],
      deleted: [] as string[],
    };
  }
  try {
    const rawOverrides = localStorage.getItem(STORAGE_KEY_STAFF_OVERRIDES);
    const rawCreated = localStorage.getItem(STORAGE_KEY_STAFF_CREATED);
    const rawDeleted = localStorage.getItem(STORAGE_KEY_STAFF_DELETED);

    return {
      overrides: rawOverrides ? (JSON.parse(rawOverrides) as Record<string, Partial<StaffAdmin>>) : {},
      created: rawCreated ? (JSON.parse(rawCreated) as StaffAdmin[]) : [],
      deleted: rawDeleted ? (JSON.parse(rawDeleted) as string[]) : [],
    };
  } catch (err) {
    console.warn("Error reading staff cache from localStorage:", err);
    return {
      overrides: {} as Record<string, Partial<StaffAdmin>>,
      created: [] as StaffAdmin[],
      deleted: [] as string[],
    };
  }
};

const isDummyAdmin = (adm: {
  id?: string | number;
  name?: string;
  email?: string;
}): boolean => {
  return false;
};

const cleanAdminName = (rawName: string) => {
  return (rawName || "").replace(/\s*\(Updated\)/gi, "").trim();
};

const DEFAULT_PERMANENT_STAFF: StaffAdmin[] = [
  {
    id: "ADM-001",
    name: "Super Administrator Zhou",
    nip: "SPR-001",
    email: "superadmin@zhouconsulting.com",
    phone: "+6281234567890",
    role: "Superadmin",
    division: "IT & Operasional",
    tasksCount: 0,
    status: "Aktif",
    twoFactorEnabled: true,
    joinDate: "01 Jan 2026",
    password: "SuperAdmin123!",
  },
  {
    id: "ADM-002",
    name: "Konsultan Senior Zhou",
    nip: "ADM-002",
    email: "admin@zhouconsulting.com",
    phone: "+6281234567899",
    role: "Admin",
    division: "Tax Service Core",
    tasksCount: 0,
    status: "Aktif",
    twoFactorEnabled: true,
    joinDate: "01 Jan 2026",
    password: "Admin123!",
  },
  {
    id: "ADM-005",
    name: "Muhammad Dekhsa Afnan",
    nip: "SPR-005",
    email: "dekhsafnan@gmail.com",
    phone: "+62 81210619043",
    role: "Superadmin",
    division: "IT & Operasional",
    tasksCount: 0,
    status: "Aktif",
    twoFactorEnabled: true,
    joinDate: "15 Jan 2026",
    password: "SuperAdmin123!",
  },
  {
    id: "ADM-023",
    name: "Ana, S.E",
    nip: "ADM-023",
    email: "ana@zhouconsulting",
    phone: "+62 812-9876-1202",
    role: "Admin",
    division: "Accounting Service",
    tasksCount: 0,
    status: "Aktif",
    twoFactorEnabled: true,
    joinDate: "01 Okt 2026",
    password: "Admin123!",
  },
  {
    id: "ADM-024",
    name: "Admin2",
    nip: "ADM-024",
    email: "admin2@zhouconsulting",
    phone: "+62 812-9876-1201",
    role: "Admin",
    division: "Tax Service Core",
    tasksCount: 0,
    status: "Aktif",
    twoFactorEnabled: true,
    joinDate: "01 Okt 2026",
    password: "Admin123!",
  },
  {
    id: "STF-BE-32",
    name: "Tasya",
    nip: "ADM-032",
    email: "tasya123@gmail.com",
    phone: "+62 81536749946",
    role: "Admin",
    division: "Tax Service Core",
    tasksCount: 0,
    status: "Aktif",
    twoFactorEnabled: true,
    joinDate: "19 Okt 2026",
    password: "Tasya123",
  },
  {
    id: "STF-BE-33",
    name: "Anna",
    nip: "SPR-033",
    email: "Anna123@gmail.com",
    phone: "+62 82914658836",
    role: "Superadmin",
    division: "IT & Operasional",
    tasksCount: 0,
    status: "Aktif",
    twoFactorEnabled: true,
    joinDate: "19 Okt 2026",
    password: "Anna123",
  },
  {
    id: "STF-BE-26",
    name: "Lydian,S.AK",
    nip: "ADM-026",
    email: "lydia123@gmail.com",
    phone: "+62 81532638856",
    role: "Admin",
    division: "Accounting Service",
    tasksCount: 0,
    status: "Aktif",
    twoFactorEnabled: true,
    joinDate: "15 Okt 2026",
    password: "Admin123!",
  },
];

export default function SuperadminUsersPage() {
  const [staffList, setStaffList] = useState<StaffAdmin[]>(DEFAULT_PERMANENT_STAFF);
  const [searchQuery, setSearchQuery] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStaffForDetail, setSelectedStaffForDetail] = useState<StaffAdmin | null>(null);
  const [editingStaff, setEditingStaff] = useState<StaffAdmin | null>(null);
  const [deletingStaff, setDeletingStaff] = useState<StaffAdmin | null>(null);

  // Edit Staff Password States (Kata Sandi Saat Ini & Form Perubahan Password)
  const [currentStaffPassword, setCurrentStaffPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [newStaffPassword, setNewStaffPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Pre-fill password with the staff's existing created password when edit modal opens
  useEffect(() => {
    if (editingStaff) {
      const savedPasswords = getSavedAdminPasswords();
      const existingPassword =
        savedPasswords[editingStaff.email?.toLowerCase().trim()] ||
        savedPasswords[editingStaff.id?.toLowerCase()] ||
        savedPasswords[editingStaff.nip?.toLowerCase()] ||
        editingStaff.password ||
        (editingStaff.role.toLowerCase().includes("superadmin") ? "SuperAdmin123!" : "Admin123!");
      setCurrentStaffPassword(existingPassword);
      setShowCurrentPassword(false);
      setNewStaffPassword("");
      setShowNewPassword(false);
    }
  }, [editingStaff?.id]);

  // Add Form State
  const [newStaffForm, setNewStaffForm] = useState({
    name: "",
    email: "",
    phone: "+62 8",
    role: "admin",
    division: "Tax Service Core" as StaffAdmin["division"],
    initialPassword: "",
    twoFactorEnabled: true,
  });
  const [showAddPassword, setShowAddPassword] = useState(true);

  const [isLoading, setIsLoading] = useState(false);

  // Initial load from localStorage cache for instant zero-flicker UI
  useEffect(() => {
    const cache = getLocalStaffCache();
    if (cache.created.length > 0 || Object.keys(cache.overrides).length > 0) {
      const initialMerged: StaffAdmin[] = [];
      cache.created.forEach((item) => {
        if (!cache.deleted.includes(item.id) && !cache.deleted.includes(item.email.toLowerCase())) {
          const override = cache.overrides[item.id] || cache.overrides[item.email.toLowerCase()];
          initialMerged.push(override ? { ...item, ...override } : item);
        }
      });
      if (initialMerged.length > 0) {
        setStaffList(initialMerged);
      }
    }
  }, []);

  // Sync staff with Backend API and merge with persistent local overrides
  const loadStaff = async () => {
    setIsLoading(true);
    try {
      const [adminsRes, consultRes] = await Promise.all([
        superadminApi.getAdmins(),
        adminApi.getConsultations().catch(() => ({ data: [] as ConsultationItem[] })),
      ]);

      const cache = getLocalStaffCache();
      const consultations = Array.isArray(consultRes?.data) ? consultRes.data : [];

      if (adminsRes?.data && Array.isArray(adminsRes.data)) {
        const validAdmins = adminsRes.data;
        const apiStaff: StaffAdmin[] = validAdmins.map((adm: AdminUserItem, idx: number) => {
          const admEmail = (adm.email || "").toLowerCase().trim();
          const admName = (adm.name || "").toLowerCase().trim();
          const assignedCount = consultations.filter((c) => {
            const cAssignedId = c.assigned_to;
            const cAdminId = c.assigned_admin?.id;
            const cEmail = (c.assigned_admin?.email || "").toLowerCase().trim();
            const cName = (c.assigned_admin?.name || "").toLowerCase().trim();

            if (cAssignedId && Number(cAssignedId) === Number(adm.id)) return true;
            if (cAdminId && Number(cAdminId) === Number(adm.id)) return true;
            if (admEmail && cEmail && admEmail === cEmail) return true;
            if (admName && cName && (cName.includes(admName) || admName.includes(cName))) return true;
            return false;
          }).length;

          const baseItem: StaffAdmin = {
            id: `STF-BE-${adm.id}`,
            name: cleanAdminName(adm.name),
            nip: (adm.role === "SUPERADMIN" ? "SPR-" : "ADM-") + String(adm.id).padStart(3, "0"),
            email: adm.email,
            phone: adm.phone || "+62 812-9876-" + (1200 + idx),
            role: adm.role === "SUPERADMIN" ? "Superadmin" : "Admin",
            division: "Tax Service Core",
            tasksCount: assignedCount,
            status: adm.is_active ? "Aktif" : "Nonaktif",
            twoFactorEnabled: true,
            joinDate: new Date(adm.created_at || Date.now()).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
            password: adm.role === "SUPERADMIN" ? "SuperAdmin123!" : "Admin123!",
          };

          // Reconcile with local overrides by ID, Email, NIP, or raw backend ID
          const rawId = String(adm.id);
          const override =
            cache.overrides[baseItem.id] ||
            cache.overrides[baseItem.email.toLowerCase()] ||
            cache.overrides[baseItem.nip] ||
            cache.overrides[rawId];

          const savedPasswords = getSavedAdminPasswords();
          const knownPassword =
            savedPasswords[adm.email?.toLowerCase().trim()] ||
            savedPasswords[baseItem.id.toLowerCase()] ||
            savedPasswords[baseItem.nip.toLowerCase()] ||
            savedPasswords[rawId] ||
            override?.password;

          if (knownPassword) {
            baseItem.password = knownPassword;
          }

          if (override) {
            return {
              ...baseItem,
              ...override,
              password: knownPassword || override.password || baseItem.password,
              tasksCount: override.tasksCount !== undefined ? override.tasksCount : assignedCount,
            };
          }

          return baseItem;
        });

        // Filter out deleted staff
        let mergedList = apiStaff.filter((s) => {
          const rawId = s.id.replace(/\D/g, "");
          const isDeleted =
            cache.deleted.includes(s.id) ||
            cache.deleted.includes(s.email.toLowerCase()) ||
            cache.deleted.includes(s.nip) ||
            (rawId && cache.deleted.includes(rawId));
          return !isDeleted;
        });

        // Prepend locally created staff not yet returned by backend
        cache.created.forEach((createdItem) => {
          const isDeleted =
            cache.deleted.includes(createdItem.id) ||
            cache.deleted.includes(createdItem.email.toLowerCase()) ||
            cache.deleted.includes(createdItem.nip);
          if (isDeleted) return;

          const alreadyInList = mergedList.some(
            (s) =>
              s.id === createdItem.id ||
              s.email.toLowerCase() === createdItem.email.toLowerCase() ||
              s.nip === createdItem.nip
          );

          if (!alreadyInList) {
            const override =
              cache.overrides[createdItem.id] ||
              cache.overrides[createdItem.email.toLowerCase()] ||
              cache.overrides[createdItem.nip];
            mergedList.unshift(override ? { ...createdItem, ...override } : createdItem);
          }
        });

        setStaffList(mergedList);
      }
    } catch (err) {
      console.warn("Gagal memuat staf admin dari backend:", err);
      // Fallback to cache if network fails
      const cache = getLocalStaffCache();
      const fallbackList: StaffAdmin[] = [];
      cache.created.forEach((c) => {
        if (!cache.deleted.includes(c.id) && !cache.deleted.includes(c.email.toLowerCase())) {
          const override = cache.overrides[c.id] || cache.overrides[c.email.toLowerCase()];
          fallbackList.push(override ? { ...c, ...override } : c);
        }
      });
      if (fallbackList.length > 0) {
        setStaffList(fallbackList);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenAddModal = () => {
    setNewStaffForm({
      name: "",
      email: "",
      phone: "+62 8",
      role: "admin",
      division: "Tax Service Core",
      initialPassword: "",
      twoFactorEnabled: true,
    });
    setShowAddPassword(true);
    setIsAddModalOpen(true);
  };

  const handleAddStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffForm.name.trim() || !newStaffForm.email.trim()) {
      showToast("Nama dan email wajib diisi.");
      return;
    }

    const emailVal = newStaffForm.email.trim();
    if (!emailVal.includes("@") || !emailVal.includes(".")) {
      showToast("Format email tidak valid. Pastikan menyertakan domain lengkap (misal: @zhouconsulting.com).");
      return;
    }

    const passwordVal = newStaffForm.initialPassword.trim();
    if (!passwordVal) {
      showToast("Kata sandi akun wajib diisi oleh Superadmin.");
      return;
    }
    if (passwordVal.length < 6) {
      showToast("Kata sandi minimal 6 karakter.");
      return;
    }

    const normalizedRole = newStaffForm.role.toLowerCase() === "superadmin" ? "SUPERADMIN" : "ADMIN";
    const displayRole = normalizedRole === "SUPERADMIN" ? "Superadmin" : "Admin";

    setIsLoading(true);
    try {
      // 1. Buat akun terlebih dahulu ke live backend API
      const res = await superadminApi.createAdmin({
        name: newStaffForm.name.trim(),
        email: emailVal,
        password: passwordVal,
        phone: newStaffForm.phone.trim(),
        role: normalizedRole,
      });

      if (!res.success) {
        showToast(res.message || "Gagal membuat akun staf di server backend.");
        setIsLoading(false);
        return;
      }

      // 2. Ambil ID resmi yang dikembalikan oleh backend
      const createdBackendId = res.data?.id;
      const finalId = createdBackendId ? `STF-BE-${createdBackendId}` : `STF-LOCAL-${Date.now()}`;
      const finalNip =
        (normalizedRole === "SUPERADMIN" ? "SPR-" : "ADM-") +
        (createdBackendId ? String(createdBackendId).padStart(3, "0") : String(Math.floor(100 + Math.random() * 900)));

      const newStaffItem: StaffAdmin = {
        id: finalId,
        name: newStaffForm.name.trim(),
        nip: finalNip,
        email: emailVal,
        phone: newStaffForm.phone.trim(),
        role: displayRole,
        division: newStaffForm.division,
        tasksCount: 0,
        status: "Aktif",
        twoFactorEnabled: newStaffForm.twoFactorEnabled,
        joinDate: new Date().toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        password: passwordVal,
      };

      // 3. Simpan ke local cache
      if (typeof window !== "undefined") {
        try {
          const cache = getLocalStaffCache();
          cache.created.unshift(newStaffItem);
          cache.overrides[newStaffItem.id] = newStaffItem;
          cache.overrides[newStaffItem.email.toLowerCase()] = newStaffItem;
          cache.overrides[newStaffItem.nip] = newStaffItem;
          saveAdminPassword(emailVal, passwordVal);
          saveAdminPassword(finalId, passwordVal);
          saveAdminPassword(finalNip, passwordVal);
          if (createdBackendId) {
            cache.overrides[String(createdBackendId)] = newStaffItem;
            saveAdminPassword(String(createdBackendId), passwordVal);
            saveAdminPassword(`ADM-${String(createdBackendId).padStart(3, "0")}`, passwordVal);
            saveAdminPassword(`SPR-${String(createdBackendId).padStart(3, "0")}`, passwordVal);
          }

          localStorage.setItem(STORAGE_KEY_STAFF_CREATED, JSON.stringify(cache.created));
          localStorage.setItem(STORAGE_KEY_STAFF_OVERRIDES, JSON.stringify(cache.overrides));
        } catch (err) {
          console.warn("Gagal menyimpan akun baru ke localStorage:", err);
        }
      }

      // 4. Update state dan tampilkan notifikasi sukses beserta kredensial
      setStaffList((prev) => [newStaffItem, ...prev]);
      showToast(`Akun ${displayRole} ${newStaffItem.name} berhasil dibuat dengan kata sandi yang Anda tentukan!`);
      setIsAddModalOpen(false);
      setNewStaffForm({
        name: "",
        email: "",
        phone: "+62 8",
        role: "admin",
        division: "Tax Service Core",
        initialPassword: "",
        twoFactorEnabled: true,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal membuat akun admin di server backend.";
      showToast(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;

    let finalPassword = currentStaffPassword.trim();
    if (newStaffPassword.trim()) {
      if (newStaffPassword.trim().length < 6) {
        showToast("Kata sandi baru minimal 6 karakter.");
        return;
      }
      finalPassword = newStaffPassword.trim();
    }

    if (!finalPassword) {
      showToast("Kata sandi akun wajib diisi.");
      return;
    }

    const updatedStaff: StaffAdmin = {
      ...editingStaff,
      password: finalPassword,
    };

    // 1. Update state immediately
    setStaffList((prev) =>
      prev.map((s) => (s.id === updatedStaff.id ? updatedStaff : s))
    );

    // 2. Persist override to localStorage
    if (typeof window !== "undefined") {
      try {
        const cache = getLocalStaffCache();
        cache.overrides[updatedStaff.id] = updatedStaff;
        cache.overrides[updatedStaff.email.toLowerCase()] = updatedStaff;
        cache.overrides[updatedStaff.nip] = updatedStaff;
        saveAdminPassword(updatedStaff.email, finalPassword);
        saveAdminPassword(updatedStaff.id, finalPassword);
        saveAdminPassword(updatedStaff.nip, finalPassword);
        const rawId = updatedStaff.id.replace(/\D/g, "");
        if (rawId) {
          cache.overrides[rawId] = updatedStaff;
          saveAdminPassword(rawId, finalPassword);
        }

        // Also update inside created list if it was locally created
        const updatedCreated = cache.created.map((c) =>
          c.id === updatedStaff.id || c.email.toLowerCase() === updatedStaff.email.toLowerCase()
            ? updatedStaff
            : c
        );

        localStorage.setItem(STORAGE_KEY_STAFF_OVERRIDES, JSON.stringify(cache.overrides));
        localStorage.setItem(STORAGE_KEY_STAFF_CREATED, JSON.stringify(updatedCreated));
      } catch (err) {
        console.warn("Gagal menyimpan pembaruan ke localStorage:", err);
      }
    }

    // 3. Sync to backend API if applicable
    let numericId: number | null = null;
    if (updatedStaff.id.startsWith("STF-BE-")) {
      numericId = parseInt(updatedStaff.id.replace("STF-BE-", ""), 10);
    } else if (!updatedStaff.id.startsWith("STF-LOCAL-")) {
      const parsed = parseInt(updatedStaff.id.replace(/\D/g, ""), 10);
      if (!isNaN(parsed) && parsed > 0 && parsed < 100000) {
        numericId = parsed;
      }
    }

    if (numericId && !isNaN(numericId)) {
      superadminApi
        .updateAdmin(numericId, {
          name: updatedStaff.name,
          email: updatedStaff.email,
          phone: updatedStaff.phone,
          role: updatedStaff.role.toUpperCase() === "SUPERADMIN" ? "SUPERADMIN" : "ADMIN",
          password: updatedStaff.password,
        })
        .catch((err) => {
          console.warn("Backend updateAdmin notification:", err);
        });
    }

    if (newStaffPassword.trim()) {
      showToast(`Data akun dan kata sandi baru untuk ${updatedStaff.name} berhasil diperbarui.`);
    } else {
      showToast(`Data akun ${updatedStaff.name} berhasil diperbarui.`);
    }

    setEditingStaff(null);
    setCurrentStaffPassword("");
    setNewStaffPassword("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
  };

  const handleToggleStatus = async (staffId: string) => {
    const currentStaff = staffList.find((s) => s.id === staffId);
    if (!currentStaff) return;

    const newStatus: StaffAdmin["status"] = currentStaff.status === "Aktif" ? "Nonaktif" : "Aktif";
    const updated: StaffAdmin = { ...currentStaff, status: newStatus };

    setStaffList((prev) =>
      prev.map((s) => (s.id === staffId ? updated : s))
    );

    if (typeof window !== "undefined") {
      try {
        const cache = getLocalStaffCache();
        cache.overrides[updated.id] = updated;
        cache.overrides[updated.email.toLowerCase()] = updated;
        localStorage.setItem(STORAGE_KEY_STAFF_OVERRIDES, JSON.stringify(cache.overrides));
      } catch {}
    }

    try {
      const rawId = parseInt(staffId.replace(/\D/g, ""), 10) || staffId;
      await superadminApi.deactivateAdmin(rawId);
      showToast("Status akun berhasil diperbarui di sistem.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengubah status akun di server.";
      showToast(msg);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingStaff) return;

    if (deletingStaff.tasksCount > 0) {
      showToast(
        `Penghapusan permanen ditolak: ${deletingStaff.name} memiliki ${deletingStaff.tasksCount} perikatan aktif. Akun dialihkan ke status Nonaktif.`
      );
      handleToggleStatus(deletingStaff.id);
      setDeletingStaff(null);
      return;
    }

    // 1. Persist deletion in localStorage
    if (typeof window !== "undefined") {
      try {
        const cache = getLocalStaffCache();
        const rawId = deletingStaff.id.replace(/\D/g, "");
        if (!cache.deleted.includes(deletingStaff.id)) cache.deleted.push(deletingStaff.id);
        if (!cache.deleted.includes(deletingStaff.email.toLowerCase())) cache.deleted.push(deletingStaff.email.toLowerCase());
        if (!cache.deleted.includes(deletingStaff.nip)) cache.deleted.push(deletingStaff.nip);
        if (rawId && !cache.deleted.includes(rawId)) cache.deleted.push(rawId);

        const filteredCreated = cache.created.filter(
          (c) =>
            c.id !== deletingStaff.id &&
            c.email.toLowerCase() !== deletingStaff.email.toLowerCase()
        );

        localStorage.setItem(STORAGE_KEY_STAFF_DELETED, JSON.stringify(cache.deleted));
        localStorage.setItem(STORAGE_KEY_STAFF_CREATED, JSON.stringify(filteredCreated));
      } catch (err) {
        console.warn("Gagal menyimpan penghapusan ke localStorage:", err);
      }
    }

    // 2. Remove from state immediately
    setStaffList((prev) => prev.filter((s) => s.id !== deletingStaff.id));

    const rawId = parseInt(deletingStaff.id.replace(/\D/g, ""), 10) || deletingStaff.id;
    try {
      await superadminApi.deleteAdmin(rawId);
      showToast(`Akun ${deletingStaff.name} berhasil dihapus dari sistem.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menghapus akun di server.";
      showToast(msg);
    }
    setDeletingStaff(null);
  };

  // Filter staff list
  const filteredStaff = staffList.filter((s) => {
    const matchesDiv = divisionFilter === "ALL" || s.division === divisionFilter;
    const matchesStatus = statusFilter === "ALL" || s.status === statusFilter;
    const matchesRole =
      roleFilter === "ALL" ||
      s.role.toLowerCase() === roleFilter.toLowerCase();
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

      {/* Top Header */}
      <div className="pb-6 border-b border-primary-light">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
            Kelola Akun Staf Konsultan &amp; Admin
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-2xl">
            Manajemen akun kredensial staf operasional, penetapan hak akses role-based (RBAC), penugasan divisi, dan penegakan keamanan multi-faktor (2FA).
          </p>
        </div>
      </div>

      {/* 3 TOP OPERATIONAL & SECURITY METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Card 1 */}
        <Card className="p-4 sm:p-5 rounded-2xl border-primary-light bg-white shadow-xs">
          <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">
            Total Akun Staf
          </span>
          <div className="mt-2 text-2xl font-bold text-primary font-mono flex items-baseline gap-1.5">
            <span>{totalStaffCount < 10 ? `0${totalStaffCount}` : totalStaffCount}</span>
            <span className="text-xs text-text-secondary font-sans font-normal">Staf Terdaftar</span>
          </div>
          <div className="text-[10px] text-text-secondary mt-1">Staf operasional terdaftar</div>
        </Card>

        {/* Card 2 */}
        <Card className="p-4 sm:p-5 rounded-2xl border-emerald-200 bg-emerald-50/40 shadow-xs">
          <span className="text-[10px] text-emerald-900 font-bold uppercase tracking-wider block">
            Staf Aktif Bertugas
          </span>
          <div className="mt-2 text-2xl font-bold text-emerald-800 font-mono flex items-baseline gap-1.5">
            <span>{activeStaffCount < 10 ? `0${activeStaffCount}` : activeStaffCount}</span>
            <span className="text-xs text-emerald-700 font-sans font-normal">Akun Aktif</span>
          </div>
          <div className="text-[10px] text-emerald-700 mt-1">Akun staf aktif bertugas</div>
        </Card>

        {/* Card 3 */}
        <Card className="p-4 sm:p-5 rounded-2xl border-primary-light bg-white shadow-xs">
          <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">
            Proteksi Multi-Faktor (2FA)
          </span>
          <div className="mt-2 text-2xl font-bold text-primary font-mono flex items-baseline gap-1.5">
            <span>{twoFactorPercentage}%</span>
            <span className="text-xs text-text-secondary font-sans font-normal">Terproteksi</span>
          </div>
          <div className="text-[10px] text-text-secondary mt-1">Tingkat proteksi akun</div>
        </Card>
      </div>

      {/* MASTER STAFF MANAGEMENT MODULE - UNIFIED CONTAINER */}
      <Card className="rounded-2xl border-primary-light bg-white shadow-xs overflow-hidden">
        {/* Module Header & Compact Filter Controls */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Section Title & Description */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-primary tracking-tight">
                Daftar Akun Staf Konsultan ({filteredStaff.length})
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Akses root penuh untuk menambah, menyunting peran, dan menonaktifkan akun staf operasional.
              </p>
            </div>
          </div>

          {/* Search Field, Compact Horizontal Filter Dropdowns, and Tambah Akun Staf Button */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
              <div className="relative flex-1 min-w-[200px]">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Cari staf, email, NIP, atau keahlian..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 text-xs h-9 bg-surface border-primary-light focus:bg-white"
                />
              </div>

              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
                <Select
                  value={divisionFilter}
                  onChange={(e) => setDivisionFilter(e.target.value)}
                  className="text-xs h-9 min-w-[140px] bg-white"
                >
                  <option value="ALL">Semua Divisi</option>
                  <option value="Tax Service Core">Tax Service Core</option>
                  <option value="Accounting Service">Accounting Service</option>
                  <option value="Business Financial Consulting">Business Financial Consulting</option>
                  <option value="Legal Compliance">Legal Compliance</option>
                  <option value="IT & Operasional">IT &amp; Operasional</option>
                </Select>

                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs h-9 min-w-[120px] bg-white"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Nonaktif</option>
                </Select>

                <Select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="text-xs h-9 min-w-[120px] bg-white"
                >
                  <option value="ALL">Semua Peran</option>
                  <option value="Admin">Admin</option>
                  <option value="Superadmin">Superadmin</option>
                </Select>
              </div>
            </div>

            {/* Tombol Tambah Akun Staf Baru (Di sebelah kanan dropdown peran) */}
            <div className="shrink-0 self-start lg:self-auto">
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleOpenAddModal}
                className="text-xs font-semibold h-9 px-4 shadow-sm flex items-center justify-center whitespace-nowrap"
              >
                <span>Tambah Akun Staf Baru</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Subtle Divider */}
        <div className="border-t border-primary-light" />

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface/70 border-b border-primary-light text-text-muted font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Staf &amp; NIP</th>
                <th className="py-3.5 px-4">Divisi Penugasan</th>
                <th className="py-3.5 px-4">Peran RBAC</th>
                <th className="py-3.5 px-4">Kontak Resmi</th>
                <th className="py-3.5 px-4 text-center">Keamanan 2FA</th>
                <th className="py-3.5 px-4 text-center">Status Akun</th>
                <th className="py-3.5 px-4 text-right">Aksi Superadmin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-light">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-text-muted text-xs">
                    Memuat data staf admin dari server backend...
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
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
                          staff.role.toLowerCase().includes("superadmin")
                            ? "primary"
                            : "secondary"
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
                          onClick={() => setSelectedStaffForDetail(staff)}
                          className="h-8 px-2.5 text-xs border border-primary-light rounded-lg hover:bg-surface text-primary font-semibold inline-flex items-center gap-1.5 bg-white shadow-2xs"
                          title="Lihat Detail & Ubah Hak Akses / Password"
                        >
                          <EyeIcon className="text-xs mr-1" />
                          Detail
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeletingStaff(staff)}
                          className="h-8 w-8 p-0 text-xs border border-primary-light rounded-lg hover:bg-red-50 hover:text-red-700 hover:border-red-300 text-red-500 flex items-center justify-center bg-white shadow-2xs"
                          title="Hapus Akun Staf"
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
                    placeholder="Nama Lengkap & Gelar"
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
                  <Select
                    value={newStaffForm.division}
                    onChange={(e) =>
                      setNewStaffForm((prev) => ({
                        ...prev,
                        division: e.target.value as StaffAdmin["division"],
                      }))
                    }
                    className="w-full text-xs h-9 font-medium"
                  >
                    <option value="Tax Service Core">Tax Service Core</option>
                    <option value="Accounting Service">Accounting Service</option>
                    <option value="Business Financial Consulting">Business Financial Consulting</option>
                    <option value="Legal Compliance">Legal Compliance</option>
                    <option value="IT & Operasional">IT &amp; Operasional</option>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-primary">
                    Peran / Hak Akses (RBAC) <span className="text-error">*</span>
                  </Label>
                  <Select
                    value={newStaffForm.role}
                    onChange={(e) =>
                      setNewStaffForm((prev) => ({ ...prev, role: e.target.value }))
                    }
                    className="w-full text-xs h-9 font-medium"
                  >
                    <option value="admin">Admin</option>
                    <option value="superadmin">Superadmin</option>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-primary">
                    Kata Sandi Akun <span className="text-error">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type={showAddPassword ? "text" : "password"}
                      required
                      placeholder="Masukkan kata sandi (min. 6 karakter)"
                      value={newStaffForm.initialPassword}
                      onChange={(e) =>
                        setNewStaffForm((prev) => ({ ...prev, initialPassword: e.target.value }))
                      }
                      className="text-xs h-9 bg-white border-primary-light pr-9 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAddPassword(!showAddPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary p-1 cursor-pointer"
                      aria-label="Lihat kata sandi"
                    >
                      {showAddPassword ? (
                        <EyeSlashIcon className="text-xs" />
                      ) : (
                        <EyeIcon className="text-xs" />
                      )}
                    </button>
                  </div>
                  <span className="text-[10px] text-text-muted block">
                    Ketik kata sandi resmi yang Anda tentukan untuk akun staf ini.
                  </span>
                </div>
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
                  <Label className="text-xs font-semibold text-primary">Peran / Hak Akses (RBAC)</Label>
                  <Select
                    value={editingStaff.role.toLowerCase().includes("superadmin") ? "superadmin" : "admin"}
                    onChange={(e) =>
                      setEditingStaff({
                        ...editingStaff,
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
                  <Label className="text-xs font-semibold text-primary">Divisi</Label>
                  <Select
                    value={editingStaff.division}
                    onChange={(e) =>
                      setEditingStaff({
                        ...editingStaff,
                        division: e.target.value as StaffAdmin["division"],
                      })
                    }
                    className="w-full text-xs h-9 font-medium"
                  >
                    <option value="Tax Service Core">Tax Service Core</option>
                    <option value="Accounting Service">Accounting Service</option>
                    <option value="Business Financial Consulting">Business Financial Consulting</option>
                    <option value="Legal Compliance">Legal Compliance</option>
                    <option value="IT & Operasional">IT &amp; Operasional</option>
                  </Select>
                </div>
              </div>

              {/* Form Kredensial Password: Kata Sandi Saat Ini & Form Perubahan Kata Sandi Baru */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-primary">
                    Kata Sandi yang Sudah Dibuat
                  </Label>
                  <div className="relative">
                    <Input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentStaffPassword}
                      onChange={(e) => setCurrentStaffPassword(e.target.value)}
                      placeholder="Kata sandi aktif"
                      className="text-xs h-9 bg-surface/80 border-primary-light pr-9 font-mono text-text-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary p-1"
                      aria-label="Lihat kata sandi saat ini"
                    >
                      {showCurrentPassword ? (
                        <EyeSlashIcon className="text-xs" />
                      ) : (
                        <EyeIcon className="text-xs" />
                      )}
                    </button>
                  </div>
                  <span className="text-[10px] text-text-muted block">
                    Kata sandi aktif yang saat ini tersimpan untuk akun.
                  </span>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-primary">
                    Ubah Kata Sandi Baru
                  </Label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      value={newStaffPassword}
                      onChange={(e) => setNewStaffPassword(e.target.value)}
                      placeholder="Ketik kata sandi baru (opsional)..."
                      className="text-xs h-9 bg-white border-primary-light pr-9 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary p-1"
                      aria-label="Lihat kata sandi baru"
                    >
                      {showNewPassword ? (
                        <EyeSlashIcon className="text-xs" />
                      ) : (
                        <EyeIcon className="text-xs" />
                      )}
                    </button>
                  </div>
                  <span className="text-[10px] text-text-muted block">
                    Ketik sandi baru jika ingin mengubah password akun.
                  </span>
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

      {/* MODAL 4: DETAIL AKUN STAF */}
      {selectedStaffForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-dark/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-primary-light max-w-md w-full p-6 space-y-4 relative">
            <button
              onClick={() => setSelectedStaffForDetail(null)}
              className="absolute top-5 right-5 text-text-secondary hover:text-primary p-1"
              aria-label="Tutup modal"
            >
              <CloseIcon className="text-sm" />
            </button>

            <div>
              <span className="text-[10px] font-mono text-text-muted font-bold block uppercase">
                DETAIL KREDENSIAL &bull; {selectedStaffForDetail.nip}
              </span>
              <h3 className="text-lg font-bold text-primary">{selectedStaffForDetail.name}</h3>
              <p className="text-xs text-text-secondary">{selectedStaffForDetail.email}</p>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-primary-light space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-text-secondary">Divisi Penugasan</span>
                  <div className="font-semibold text-primary mt-0.5">{selectedStaffForDetail.division}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-text-secondary">Peran RBAC</span>
                  <div className="mt-0.5">
                    <Badge
                      variant={selectedStaffForDetail.role.toLowerCase().includes("superadmin") ? "primary" : "secondary"}
                      className="text-[10px]"
                    >
                      {selectedStaffForDetail.role}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-primary-light grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-text-secondary">Kontak WhatsApp</span>
                  <div className="font-mono text-text-secondary mt-0.5">{selectedStaffForDetail.phone}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-text-secondary">Status Akun</span>
                  <div className="mt-0.5">
                    <Badge variant={selectedStaffForDetail.status === "Aktif" ? "success" : "silver"} size="sm">
                      {selectedStaffForDetail.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-primary-light flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-text-secondary">Keamanan 2FA</span>
                  <div className="mt-0.5">
                    {selectedStaffForDetail.twoFactorEnabled ? (
                      <span className="text-success font-semibold text-xs">Aktif Terproteksi</span>
                    ) : (
                      <span className="text-amber-700 font-semibold text-xs">Non-Aktif</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-text-secondary">Tanggal Bergabung</span>
                  <div className="font-mono text-text-secondary mt-0.5">{selectedStaffForDetail.joinDate}</div>
                </div>
              </div>

              {(() => {
                const savedPasswords = getSavedAdminPasswords();
                const displayPwd =
                  savedPasswords[selectedStaffForDetail.email?.toLowerCase().trim()] ||
                  savedPasswords[selectedStaffForDetail.id?.toLowerCase()] ||
                  savedPasswords[selectedStaffForDetail.nip?.toLowerCase()] ||
                  selectedStaffForDetail.password;

                if (!displayPwd) return null;

                return (
                  <div className="pt-2 border-t border-primary-light flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-text-secondary">Kata Sandi (Terakhir Diatur)</span>
                      <div className="font-mono text-primary font-bold text-xs mt-0.5">{displayPwd}</div>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="pt-2 border-t border-primary-light flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingStaff(selectedStaffForDetail);
                  setSelectedStaffForDetail(null);
                }}
                className="text-xs h-9 px-4 border-primary-light text-primary font-medium hover:bg-surface inline-flex items-center gap-1.5"
              >
                <EditIcon className="text-xs" />
                Ubah Profil &amp; Sandi
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setSelectedStaffForDetail(null)}
                className="text-xs h-9 px-4"
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
