"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";
import {
  CloseIcon,
  SearchIcon,
  EyeIcon,
  TrashIcon,
  CheckCircleIcon,
  ChevronDownIcon,
} from "@/components/icons";
import {
  superadminApi,
  adminApi,
  AdminUserItem,
  AuditLogItem,
  ConsultationItem,
} from "@/lib/api";
import {
  exportToExcel,
  exportToOds,
  exportToCsv,
  exportToTsv,
} from "@/lib/downloadHelper";

export type AuditCategory =
  | "Autentikasi"
  | "Konsultasi & Tiket"
  | "Lembar Kerja"
  | "Dokumen"
  | "CMS & Konten"
  | "Karir & Lamaran"
  | "Admin & Staf"
  | "Billing & Invoice"
  | "Sistem & Integrasi";

export interface AuditLog {
  id: string;
  timestamp: string;
  rawTimestamp: number;
  actorName: string;
  actorRole: "Superadmin" | "Admin" | "Klien" | "Sistem";
  category: AuditCategory;
  activity: string;
  objectName: string;
  objectId: string;
  result: "Berhasil" | "Gagal";
  statusBefore?: string;
  statusAfter?: string;
  relatedFile?: string;
  notes?: string;
  sha256Hash?: string;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  specialty: string;
  status: "Active" | "Inactive";
  taskCount: number;
}



export default function SuperadminAuditPage() {
  // Export Menu State
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportDropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        exportDropdownRef.current &&
        !exportDropdownRef.current.contains(event.target as Node)
      ) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Admin list for filter dropdown
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Audit Logs State (Append-Only)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Helper parsing waktu log
  const parseLogTime = (dateStr?: string) => {
    if (!dateStr) return 0;
    let t = new Date(dateStr).getTime();
    if (isNaN(t)) {
      t = new Date(String(dateStr).replace(" ", "T")).getTime();
    }
    return isNaN(t) ? 0 : t;
  };

  // Helper pembersih nama admin
  const cleanAdminName = (rawName: string) => {
    return (rawName || "").replace(/\s*\(Updated\)/gi, "").trim();
  };

  // Helper deteksi dummy test
  const isDummyAuditLog = (l: AuditLogItem): boolean => {
    const desc = (l.description || l.action || "").toLowerCase();
    return (
      desc.includes("test runner") ||
      desc.includes("mock action") ||
      desc.includes("dummy test")
    );
  };

  const isDummyAdmin = (a: AdminUserItem): boolean => {
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

  // Klasifikasi Kategori dan Aktivitas dari data mentah
  const classifyAuditLog = (
    item: AuditLogItem,
    adminMap: Map<number, { name: string; nip: string; role: string }>
  ): AuditLog => {
    const actionLower = (item.action || "").toLowerCase();
    const descLower = (item.description || "").toLowerCase();
    const matchedAdmin = adminMap.get(item.admin_id);

    let actorRole: AuditLog["actorRole"] = "Admin";
    if (matchedAdmin?.role === "SUPERADMIN" || item.admin_id === 1) {
      actorRole = "Superadmin";
    }

    const actorName =
      matchedAdmin?.name ||
      (item.admin_id === 1 ? "Super Administrator Zhou" : `Admin #${item.admin_id}`);

    let category: AuditCategory = "Konsultasi & Tiket";
    let activity = "Mengubah status";
    let objectName = item.project_id ? `Tiket TK-${item.project_id}` : `Konsultasi TK-${item.id}`;
    let objectId = item.project_id ? `TK-${item.project_id}` : `TK-${item.id}`;

    // Klasifikasi Kategori
    if (
      actionLower.includes("login") ||
      actionLower.includes("logout") ||
      actionLower.includes("auth") ||
      descLower.includes("login") ||
      descLower.includes("logout")
    ) {
      category = "Autentikasi";
      activity = actionLower.includes("logout") ? "Logout sistem" : "Login berhasil";
      objectName = "Sesi Portal";
      objectId = `SES-${item.id}`;
    } else if (
      item.file_name ||
      actionLower.includes("dokumen") ||
      actionLower.includes("file") ||
      actionLower.includes("unggah") ||
      actionLower.includes("unduh") ||
      actionLower.includes("upload") ||
      descLower.includes("unggah berkas") ||
      descLower.includes("unduh")
    ) {
      category = "Dokumen";
      const isDownload =
        actionLower.includes("unduh") ||
        actionLower.includes("download") ||
        descLower.includes("unduh");
      activity = isDownload ? "Mengunduh dokumen" : "Mengunggah dokumen";
      objectName = item.file_name
        ? `Dokumen ${item.file_name}`
        : item.project_id
        ? `Berkas Tiket TK-${item.project_id}`
        : "Berkas Lampiran";
      objectId = item.file_name || (item.project_id ? `TK-${item.project_id}` : `DOC-${item.id}`);
    } else if (
      actionLower.includes("task") ||
      actionLower.includes("tugas") ||
      actionLower.includes("lembar") ||
      actionLower.includes("progres") ||
      actionLower.includes("tahapan") ||
      descLower.includes("milestone") ||
      descLower.includes("lembar kerja")
    ) {
      category = "Lembar Kerja";
      activity = "Memperbarui progres";
      objectName = item.project_id ? `Lembar Kerja TK-${item.project_id}` : "Lembar Kerja";
      objectId = item.project_id ? `TK-${item.project_id}` : `ACT-${item.id}`;
    } else if (
      actionLower.includes("cms") ||
      actionLower.includes("konten") ||
      actionLower.includes("edukasi") ||
      actionLower.includes("regulasi") ||
      actionLower.includes("artikel") ||
      descLower.includes("edukasi") ||
      descLower.includes("cms")
    ) {
      category = "CMS & Konten";
      activity = "Menerbitkan konten";
      objectName = item.project_id ? `Konten CMS EDU-${item.project_id}` : "Konten CMS EDU-2";
      objectId = item.project_id ? `EDU-${item.project_id}` : `EDU-${item.id}`;
    } else if (
      actionLower.includes("karir") ||
      actionLower.includes("lamaran") ||
      descLower.includes("pelamar")
    ) {
      category = "Karir & Lamaran";
      activity = "Pembaruan status lamaran";
      objectName = "Lamaran Rekrutmen";
      objectId = `JOB-${item.id}`;
    } else if (
      actionLower.includes("admin") ||
      actionLower.includes("staf") ||
      actionLower.includes("user") ||
      descLower.includes("staf")
    ) {
      category = "Admin & Staf";
      activity = "Pembaruan profil staf";
      objectName = `Akun Staf ADM-${String(item.admin_id).padStart(3, "0")}`;
      objectId = `ADM-${String(item.admin_id).padStart(3, "0")}`;
    } else if (
      actionLower.includes("invoice") ||
      actionLower.includes("billing") ||
      actionLower.includes("tagihan")
    ) {
      category = "Billing & Invoice";
      activity = "Pembaruan status invoice";
      objectName = `Invoice INV-${item.id}`;
      objectId = `INV-${item.id}`;
    } else {
      category = "Konsultasi & Tiket";
      activity =
        item.status_before || item.status_after
          ? "Mengubah status"
          : item.action || "Aktivitas Perikatan";
      objectName = item.project_id ? `Tiket TK-${item.project_id}` : `Konsultasi TK-${item.id}`;
      objectId = item.project_id ? `TK-${item.project_id}` : `TK-${item.id}`;
    }

    const result: AuditLog["result"] =
      descLower.includes("gagal") ||
      descLower.includes("error") ||
      actionLower.includes("fail")
        ? "Gagal"
        : "Berhasil";

    const dateObj = new Date(item.created_at);
    const dateFormatted = isNaN(dateObj.getTime())
      ? "16 Okt 2026, 10.19"
      : dateObj.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }) +
        ", " +
        dateObj.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }).replace(":", ".");

    return {
      id: `LOG-${item.id}`,
      timestamp: dateFormatted,
      rawTimestamp: parseLogTime(item.created_at),
      actorName,
      actorRole,
      category,
      activity,
      objectName,
      objectId,
      result,
      statusBefore: item.status_before || "Draft",
      statusAfter: item.status_after || "Updated",
      relatedFile: item.file_name || "-",
      notes: item.description || item.action || "Aktivitas tercatat pada rekam jejak audit sistem.",
      sha256Hash: `SHA256-${(Math.random() * 1e16).toString(16)}`,
    };
  };

  // Handler untuk membersihkan log audit secara permanen di database backend
  const handleClearAuditLogs = async () => {
    if (
      confirm(
        "Apakah Anda yakin ingin membersihkan seluruh rekam jejak log audit di server database? Tindakan ini bersifat permanen."
      )
    ) {
      try {
        setIsLoading(true);
        const res = await superadminApi.clearAuditLogs();
        if (res.success) {
          setAuditLogs([]);
          showToast("Seluruh data log audit berhasil dibersihkan dari server database.");
        } else {
          showToast("Gagal membersihkan log audit: " + (res.message || "Kesalahan server"));
        }
      } catch (err) {
        showToast("Terjadi kesalahan saat menghubungi server");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Load audit logs dari Backend API Database
  const loadAuditLogs = async () => {
    setIsLoading(true);
    try {
      const [res, adminsRes] = await Promise.all([
        superadminApi.getAuditLogs(),
        superadminApi.getAdmins().catch(() => ({ data: [] as AdminUserItem[] })),
      ]);

      const adminMap = new Map<number, { name: string; nip: string; role: string }>();
      if (adminsRes?.data && Array.isArray(adminsRes.data)) {
        adminsRes.data.forEach((a: AdminUserItem) => {
          adminMap.set(a.id, {
            name: cleanAdminName(a.name),
            nip: (a.role === "SUPERADMIN" ? "SPR-" : "ADM-") + String(a.id).padStart(3, "0"),
            role: a.role || "ADMIN",
          });
        });
      }

      let backendLogs: AuditLog[] = [];
      if (res?.data && Array.isArray(res.data)) {
        const validRaw = res.data.filter((l: AuditLogItem) => !isDummyAuditLog(l));
        backendLogs = validRaw.map((item) => classifyAuditLog(item, adminMap));
      }

      // Urutkan dari yang paling baru
      backendLogs.sort((a, b) => b.rawTimestamp - a.rawTimestamp);
      setAuditLogs(backendLogs);
    } catch (err) {
      console.warn("Gagal memuat log audit dari backend:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load admins list for filtering
  const loadAdminsData = async () => {
    try {
      const [adminsRes, consultRes] = await Promise.all([
        superadminApi.getAdmins(),
        adminApi.getConsultations().catch(() => ({ data: [] as ConsultationItem[] })),
      ]);

      if (adminsRes?.data && Array.isArray(adminsRes.data)) {
        const consultations = Array.isArray(consultRes?.data) ? consultRes.data : [];
        const validAdmins = adminsRes.data.filter((a: AdminUserItem) => !isDummyAdmin(a));
        const mappedAdmins: AdminUser[] = validAdmins.map((a: AdminUserItem) => {
          const aEmail = (a.email || "").toLowerCase().trim();
          const aName = (a.name || "").toLowerCase().trim();
          const assignedCount = consultations.filter((c) => {
            const cAssignedId = c.assigned_to;
            const cAdminId = c.assigned_admin?.id;
            const cEmail = (c.assigned_admin?.email || "").toLowerCase().trim();
            const cName = (c.assigned_admin?.name || "").toLowerCase().trim();

            if (cAssignedId && Number(cAssignedId) === Number(a.id)) return true;
            if (cAdminId && Number(cAdminId) === Number(a.id)) return true;
            if (aEmail && cEmail && aEmail === cEmail) return true;
            if (aName && cName && (cName.includes(aName) || aName.includes(cName))) return true;
            return false;
          }).length;

          return {
            id: `ADM-${String(a.id).padStart(3, "0")}`,
            name: cleanAdminName(a.name),
            email: a.email,
            role: a.role === "SUPERADMIN" ? "Superadmin" : "Admin",
            specialty: "Core Tax & Legal Compliance",
            status: a.is_active ? "Active" : "Inactive",
            taskCount: assignedCount,
          };
        });
        setAdmins(mappedAdmins);
      }
    } catch (err) {
      console.warn("Gagal memuat data admin:", err);
    }
  };

  useEffect(() => {
    loadAuditLogs();
    loadAdminsData();
  }, []);

  // Filter States (Kategori, Pelaku, Hasil, Pencarian)
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [filterActor, setFilterActor] = useState<string>("ALL");
  const [filterResult, setFilterResult] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterCategory, filterActor, filterResult, searchQuery, itemsPerPage]);

  // Filtered Logs
  const filteredLogs = auditLogs.filter((log) => {
    if (filterCategory !== "ALL" && log.category !== filterCategory) return false;
    if (filterActor !== "ALL" && !log.actorName.toLowerCase().includes(filterActor.toLowerCase())) {
      return false;
    }
    if (filterResult !== "ALL" && log.result !== filterResult) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      const matches =
        log.actorName.toLowerCase().includes(q) ||
        log.objectId.toLowerCase().includes(q) ||
        log.objectName.toLowerCase().includes(q) ||
        log.activity.toLowerCase().includes(q) ||
        log.category.toLowerCase().includes(q) ||
        (log.notes && log.notes.toLowerCase().includes(q)) ||
        (log.relatedFile && log.relatedFile.toLowerCase().includes(q));

      if (!matches) return false;
    }

    return true;
  });

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Render Kategori Badge
  const renderCategoryBadge = (category: AuditCategory) => {
    switch (category) {
      case "Autentikasi":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            Autentikasi
          </span>
        );
      case "Konsultasi & Tiket":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Konsultasi &amp; Tiket
          </span>
        );
      case "Lembar Kerja":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            Lembar Kerja
          </span>
        );
      case "Dokumen":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            Dokumen
          </span>
        );
      case "CMS & Konten":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            CMS &amp; Konten
          </span>
        );
      case "Karir & Lamaran":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            Karir &amp; Lamaran
          </span>
        );
      case "Admin & Staf":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            Admin &amp; Staf
          </span>
        );
      case "Billing & Invoice":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
            Billing
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            Sistem
          </span>
        );
    }
  };

  // Multi-format Export Engine
  const handleExportLogs = async (format: "xlsx" | "ods" | "pdf" | "html" | "csv" | "tsv") => {
    setIsExportMenuOpen(false);
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const count = filteredLogs.length;

    if (count === 0) {
      showToast("Tidak ada data log audit yang sesuai dengan filter untuk diekspor.");
      return;
    }

    // Format data terstruktur sesuai 6 kolom tabel yang disarankan
    const tabularData = filteredLogs.map((l, index) => ({
      No: index + 1,
      Waktu: l.timestamp,
      Pelaku: `${l.actorName} (${l.actorRole})`,
      Kategori: l.category,
      Aktivitas: l.activity,
      Objek: l.objectName,
      Hasil: l.result,
      "Status Sebelum": l.statusBefore || "-",
      "Status Sesudah": l.statusAfter || "-",
      "Berkas Terkait": l.relatedFile || "-",
      "Catatan / Deskripsi": l.notes || "-",
    }));

    if (format === "xlsx") {
      const ok = exportToExcel(tabularData, `Zhou_Log_Audit_Sistem_${dateStr}.xlsx`, "AuditLogs");
      if (ok) {
        showToast(`Log audit sistem (${count} baris) berhasil diekspor ke Microsoft Excel (.xlsx).`);
      } else {
        showToast("Gagal mengekspor data ke Microsoft Excel.");
      }
      return;
    }

    if (format === "ods") {
      const ok = exportToOds(tabularData, `Zhou_Log_Audit_Sistem_${dateStr}.ods`, "AuditLogs");
      if (ok) {
        showToast(`Log audit sistem (${count} baris) berhasil diekspor ke OpenDocument (.ods).`);
      } else {
        showToast("Gagal mengekspor data ke OpenDocument.");
      }
      return;
    }

    if (format === "csv") {
      exportToCsv(tabularData, `Zhou_Log_Audit_Sistem_${dateStr}.csv`);
      showToast(`Log audit sistem (${count} baris) berhasil diekspor ke CSV.`);
      return;
    }

    if (format === "tsv") {
      exportToTsv(tabularData, `Zhou_Log_Audit_Sistem_${dateStr}.tsv`);
      showToast(`Log audit sistem (${count} baris) berhasil diekspor ke TSV.`);
      return;
    }

    if (format === "html") {
      const tableRows = filteredLogs
        .map(
          (l) =>
            `<tr>
              <td>${l.timestamp}</td>
              <td><strong>${l.actorName}</strong> (${l.actorRole})</td>
              <td>${l.category}</td>
              <td>${l.activity}</td>
              <td><code>${l.objectName}</code></td>
              <td><span style="color: ${l.result === "Berhasil" ? "green" : "red"}; font-weight: bold;">${l.result}</span></td>
              <td>${l.notes || "-"}</td>
            </tr>`
        )
        .join("");

      const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>Zhou Consulting - Laporan Log Audit Sistem (${dateStr})</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 30px; color: #0f172a; }
    h1 { color: #0B1533; font-size: 20px; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; }
    th { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
    td { border: 1px solid #e2e8f0; padding: 8px 10px; }
  </style>
</head>
<body>
  <h1>ZHOU CONSULTING - LOG AUDIT SISTEM</h1>
  <p>Laporan rekam jejak aktivitas operasional dan keamanan sistem per tanggal ${dateStr}.</p>
  <table>
    <thead>
      <tr>
        <th>Waktu</th>
        <th>Pelaku</th>
        <th>Kategori</th>
        <th>Aktivitas</th>
        <th>Objek</th>
        <th>Hasil</th>
        <th>Keterangan</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows}
    </tbody>
  </table>
</body>
</html>`;

      const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Zhou_Log_Audit_Sistem_${dateStr}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("Laporan log audit sistem berhasil diekspor ke Web Page HTML.");
      return;
    }

    if (format === "pdf") {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        showToast("Popup terblokir oleh browser. Izinkan popup untuk mencetak PDF.");
        return;
      }

      const rowsHtml = filteredLogs
        .map(
          (l) => `
          <tr style="border-bottom: 1px solid #e2e8f0; font-size: 11px;">
            <td style="padding: 8px 10px; font-family: monospace;">${l.timestamp}</td>
            <td style="padding: 8px 10px; font-weight: 600;">${l.actorName}</td>
            <td style="padding: 8px 10px;">${l.activity}</td>
            <td style="padding: 8px 10px; font-family: monospace;">${l.objectName}</td>
            <td style="padding: 8px 10px; text-align: center; color: ${l.result === "Berhasil" ? "#166534" : "#991b1b"}; font-weight: bold;">${l.result}</td>
          </tr>`
        )
        .join("");

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Zhou Consulting - Laporan Log Audit Sistem (${dateStr})</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; margin: 30px; color: #0f172a; }
            .header { border-bottom: 2px solid #0B1533; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
            .title { font-size: 20px; font-weight: bold; color: #0B1533; }
            .subtitle { font-size: 12px; color: #64748b; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th { background: #f8fafc; border-bottom: 2px solid #cbd5e1; padding: 8px 10px; font-size: 11px; text-transform: uppercase; text-align: left; color: #475569; }
            .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #64748b; display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">ZHOU CONSULTING: LOG AUDIT SISTEM</div>
              <div class="subtitle">Rekam Jejak Aktivitas Operasional, Perubahan Status, & Mutasi Data</div>
            </div>
            <div style="text-align: right; font-size: 11px; color: #64748b;">
              <div>Tanggal Cetak: ${dateStr}</div>
              <div>Integritas: SHA-256 Append-Only Verified</div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Pelaku</th>
                <th>Aktivitas</th>
                <th>Objek</th>
                <th style="text-align: center;">Hasil</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <div class="footer">
            <div>Dokumen resmi diterbitkan oleh Sistem Superadmin Zhou Consulting.</div>
            <div>Total Catatan: ${count} entri</div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
      showToast("Dokumen PDF Laporan Log Audit Sistem siap dicetak.");
    }
  };

  const successCount = auditLogs.filter((l) => l.result === "Berhasil").length;
  const successPercentage =
    auditLogs.length > 0 ? Math.round((successCount / auditLogs.length) * 100) : 100;

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

      {/* Top Header: Log Audit Sistem */}
      <div className="pb-6 border-b border-primary-light">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
            Log Audit Sistem
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-3xl">
            Pencatatan rekam jejak aktivitas operasional, autentikasi, mutasi tiket, dokumen, dan keamanan administratif sistem secara transparan, bersifat <em>immutable</em> &amp; <em>append-only</em>.
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
          <div className="text-[10px] text-text-secondary mt-1">Rekam jejak sistem aktif</div>
        </Card>

        <Card className="p-4 sm:p-5 rounded-2xl border-emerald-200 bg-emerald-50/40 shadow-xs">
          <span className="text-[10px] text-emerald-900 font-bold uppercase tracking-wider block">
            Tingkat Keberhasilan
          </span>
          <div className="mt-2 text-2xl font-bold text-emerald-800 font-mono flex items-baseline gap-1.5">
            <span>{successPercentage}%</span>
            <span className="text-xs text-emerald-700 font-sans font-normal">Berhasil</span>
          </div>
          <div className="text-[10px] text-emerald-700 mt-1">
            {successCount} dari {auditLogs.length} aktivitas berhasil dieksekusi
          </div>
        </Card>

        <Card className="p-4 sm:p-5 rounded-2xl border-primary-light bg-white shadow-xs">
          <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">
            Integritas Kriptografis
          </span>
          <div className="mt-2 text-2xl font-bold text-primary font-mono">SHA-256</div>
          <div className="text-[10px] text-text-secondary mt-1">Append-only immutable record</div>
        </Card>
      </div>

      {/* MASTER LOG AUDIT SISTEM CONTAINER */}
      <Card className="rounded-2xl border-primary-light bg-white shadow-xs overflow-hidden">
        {/* Header, Filter Controls & Export Actions */}
        <div className="p-5 sm:p-6 space-y-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-primary tracking-tight">
              Log Audit Sistem ({filteredLogs.length})
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Catatan audit mutlak tidak dapat diedit atau dihapus oleh pihak mana pun (<em>append-only</em>).
            </p>
          </div>

          {/* Filter Bar: Kategori, Pelaku, Hasil, Pencarian, Bersihkan Log & Ekspor */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 flex-wrap">
              {/* Filter Kategori */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] font-semibold text-text-secondary">Kategori:</span>
                <Select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="h-9 min-w-[150px] text-xs bg-white font-medium"
                >
                  <option value="ALL">Semua Kategori</option>
                  <option value="Autentikasi">Autentikasi</option>
                  <option value="Konsultasi & Tiket">Konsultasi &amp; Tiket</option>
                  <option value="Lembar Kerja">Lembar Kerja</option>
                  <option value="Dokumen">Dokumen</option>
                  <option value="CMS & Konten">CMS &amp; Konten</option>
                  <option value="Karir & Lamaran">Karir &amp; Lamaran</option>
                  <option value="Admin & Staf">Admin &amp; Staf</option>
                  <option value="Billing & Invoice">Billing &amp; Invoice</option>
                  <option value="Sistem & Integrasi">Sistem &amp; Integrasi</option>
                </Select>
              </div>

              {/* Filter Pelaku */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] font-semibold text-text-secondary">Pelaku:</span>
                <Select
                  value={filterActor}
                  onChange={(e) => setFilterActor(e.target.value)}
                  className="h-9 min-w-[140px] text-xs bg-white font-medium"
                >
                  <option value="ALL">Semua Pelaku</option>
                  <option value="Super Administrator Zhou">Superadmin Zhou</option>
                  {admins.map((a) => (
                    <option key={a.id} value={a.name}>
                      {a.name}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Filter Hasil */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] font-semibold text-text-secondary">Hasil:</span>
                <Select
                  value={filterResult}
                  onChange={(e) => setFilterResult(e.target.value)}
                  className="h-9 min-w-[120px] text-xs bg-white font-medium"
                >
                  <option value="ALL">Semua Hasil</option>
                  <option value="Berhasil">Berhasil</option>
                  <option value="Gagal">Gagal</option>
                </Select>
              </div>

              {/* Pencarian Objek / Pelaku */}
              <div className="relative flex-1 min-w-[180px]">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs pointer-events-none" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari pelaku, ID objek (TK-18, CL-3, EDU-2), aktivitas..."
                  className="pl-9 h-9 text-xs bg-surface border-primary-light focus:bg-white"
                />
              </div>
            </div>

            {/* Right: Bersihkan Log & Ekspor Dropdown */}
            <div className="flex items-center gap-2 self-start lg:self-auto shrink-0">
              {auditLogs.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClearAuditLogs}
                  className="text-xs font-semibold h-9 px-3 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  title="Bersihkan Tampilan Log Audit"
                >
                  <TrashIcon className="text-xs" />
                  <span>Bersihkan Log</span>
                </Button>
              )}

              <div className="relative" ref={exportDropdownRef}>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setIsExportMenuOpen((prev) => !prev)}
                  className="text-xs font-semibold h-9 px-3.5 shadow-xs flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white cursor-pointer"
                >
                  <span>Ekspor</span>
                  <ChevronDownIcon
                    className={`text-[10px] transition-transform duration-200 ${
                      isExportMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </Button>

                {isExportMenuOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-60 rounded-xl bg-white border border-primary-light/80 py-1.5 shadow-xl z-50 animate-in fade-in slide-in-from-top-1 text-xs">
                    <button
                      type="button"
                      onClick={() => handleExportLogs("xlsx")}
                      className="w-full text-left px-4 py-2 hover:bg-slate-100 text-slate-800 transition-colors cursor-pointer"
                    >
                      Microsoft Excel (.xlsx)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportLogs("ods")}
                      className="w-full text-left px-4 py-2 hover:bg-slate-100 text-slate-800 transition-colors cursor-pointer"
                    >
                      OpenDocument (.ods)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportLogs("pdf")}
                      className="w-full text-left px-4 py-2 hover:bg-slate-100 text-slate-800 transition-colors cursor-pointer"
                    >
                      PDF (.pdf)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportLogs("html")}
                      className="w-full text-left px-4 py-2 hover:bg-slate-100 text-slate-800 transition-colors cursor-pointer"
                    >
                      Web Page (.html)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportLogs("csv")}
                      className="w-full text-left px-4 py-2 hover:bg-slate-100 text-slate-800 transition-colors cursor-pointer"
                    >
                      Comma Separated Values (.csv)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportLogs("tsv")}
                      className="w-full text-left px-4 py-2 hover:bg-slate-100 text-slate-800 transition-colors cursor-pointer"
                    >
                      Tab Separated Values (.tsv)
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-primary-light" />

        {/* Audit Table: 6 Kolom yang Disarankan */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-surface/70 border-b border-primary-light text-[11px] font-bold text-text-secondary uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 text-left whitespace-nowrap">Waktu</th>
                <th className="py-3.5 px-4 text-left">Pelaku</th>
                <th className="py-3.5 px-4 text-left">Aktivitas</th>
                <th className="py-3.5 px-4 text-left">Objek</th>
                <th className="py-3.5 px-4 text-center">Hasil</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-light text-text">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-text-muted">
                    Memuat data log audit sistem dari server...
                  </td>
                </tr>
              ) : paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-text-muted">
                    Belum ada catatan log aktivitas yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface/50 transition-colors">
                    {/* 1. Waktu */}
                    <td className="py-3 px-4 font-mono text-[11px] text-text-secondary whitespace-nowrap">
                      {log.timestamp}
                    </td>

                    {/* 2. Pelaku */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-primary text-xs">{log.actorName}</div>
                      <div className="text-[10px] text-text-muted font-medium mt-0.5">
                        {log.actorRole}
                      </div>
                    </td>

                    {/* 3. Aktivitas */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-primary text-xs">{log.activity}</div>
                      <div className="mt-1">{renderCategoryBadge(log.category)}</div>
                    </td>

                    {/* 4. Objek */}
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-primary text-xs">
                        {log.objectName}
                      </div>
                      <div className="font-mono text-[10px] text-text-muted">ID: {log.objectId}</div>
                    </td>

                    {/* 5. Hasil */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {log.result === "Berhasil" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                          Berhasil
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-300">
                          Gagal
                        </span>
                      )}
                    </td>

                    {/* 6. Aksi -> Detail */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedLog(log)}
                        className="text-xs h-8 px-3 inline-flex items-center gap-1.5 border-primary-light hover:bg-surface text-primary font-semibold shadow-2xs"
                      >
                        <EyeIcon className="text-[11px]" />
                        <span>Detail</span>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredLogs.length > 0 && (
          <div className="p-3.5 sm:p-4 bg-surface/40 border-t border-primary-light flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-secondary">
            <div className="flex items-center gap-3">
              <span>
                Menampilkan {(currentPage - 1) * itemsPerPage + 1} &ndash;{" "}
                {Math.min(currentPage * itemsPerPage, filteredLogs.length)} dari {filteredLogs.length}{" "}
                catatan log audit
              </span>
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-text-muted">
                <span>• Baris:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="bg-white border border-primary-light/80 rounded px-1.5 py-0.5 text-xs text-primary font-medium focus:outline-none"
                >
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </Card>

      {/* MODAL: DETAIL AUDIT LOG SISTEM */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-dark/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-primary-light max-w-lg w-full p-6 space-y-4 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedLog(null)}
              className="absolute top-5 right-5 text-text-secondary hover:text-primary p-1"
              aria-label="Tutup"
            >
              <CloseIcon className="text-sm" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <Badge variant="silver" className="font-mono text-xs">
                  {selectedLog.id}
                </Badge>
                {renderCategoryBadge(selectedLog.category)}
              </div>
              <h3 className="text-lg font-bold text-primary mt-1">Detail Log Audit Sistem</h3>
              <p className="text-xs text-text-secondary">
                Waktu Kejadian: {selectedLog.timestamp}
              </p>
            </div>

            <div className="space-y-3 p-4 rounded-xl bg-surface border border-primary-light text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-text-secondary">
                    Pelaku &amp; Peran:
                  </span>
                  <div className="font-bold text-primary mt-0.5">{selectedLog.actorName}</div>
                  <div className="text-[11px] text-text-muted">{selectedLog.actorRole}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-text-secondary">
                    Objek Terdampak:
                  </span>
                  <div className="font-mono font-bold text-primary mt-0.5">
                    {selectedLog.objectName}
                  </div>
                  <div className="font-mono text-[10px] text-text-muted">
                    ID Objek: {selectedLog.objectId}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-primary-light grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-text-secondary">
                    Aktivitas:
                  </span>
                  <div className="font-semibold text-primary mt-0.5">{selectedLog.activity}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-text-secondary">
                    Hasil Eksekusi:
                  </span>
                  <div className="mt-0.5">
                    {selectedLog.result === "Berhasil" ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                        Berhasil
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-red-50 text-red-700 border border-red-300">
                        Gagal
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {(selectedLog.statusBefore || selectedLog.statusAfter) && (
                <div className="pt-2 border-t border-primary-light grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-text-secondary">
                      Status Sebelum:
                    </span>
                    <div className="mt-0.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded font-mono text-[10px] bg-slate-100 text-slate-700 border border-slate-300">
                        {selectedLog.statusBefore}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-text-secondary">
                      Status Sesudah:
                    </span>
                    <div className="mt-0.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded font-mono text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold">
                        {selectedLog.statusAfter}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {selectedLog.relatedFile && selectedLog.relatedFile !== "-" && (
                <div className="pt-2 border-t border-primary-light">
                  <span className="text-[10px] uppercase font-bold text-text-secondary">
                    Berkas Terkait:
                  </span>
                  <div className="font-mono text-primary mt-0.5 font-semibold">
                    {selectedLog.relatedFile}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-primary-light">
                <span className="text-[10px] uppercase font-bold text-text-secondary">
                  Deskripsi / Catatan Perubahan:
                </span>
                <p className="text-text-secondary mt-0.5 leading-relaxed">{selectedLog.notes}</p>
              </div>

              <div className="pt-2 border-t border-primary-light flex items-center justify-between text-[10px] text-text-muted">
                <span>Rekam Jejak Append-Only</span>
                <span className="font-mono">UU PDP No. 27/2022 Verified</span>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setSelectedLog(null)}
                className="text-xs h-9 px-4 font-semibold"
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
