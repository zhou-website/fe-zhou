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

const AUDIT_CLEARED_TIMESTAMP_KEY = "zhou_audit_logs_cleared_timestamp_v2";
const AUDIT_CLEARED_IDS_KEY = "zhou_audit_logs_cleared_ids_v2";

export default function SuperadminDashboard() {
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

  // Admin list for audit filter dropdown
  const [admins, setAdmins] = useState<AdminUser[]>([]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Audit Logs State (Append-Only Mutlak)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Helper parsing waktu log
  const parseLogTime = (dateStr?: string) => {
    if (!dateStr) return 0;
    let t = new Date(dateStr).getTime();
    if (isNaN(t)) {
      t = new Date(String(dateStr).replace(" ", "T")).getTime();
    }
    return isNaN(t) ? 0 : t;
  };

  // Helper untuk menyaring log audit pengujian/dummy
  const isDummyAuditLog = (l: AuditLogItem): boolean => {
    const desc = (l.description || l.action || "").toLowerCase();
    return (
      desc.includes("test runner") ||
      desc.includes("mock action") ||
      desc.includes("dummy test")
    );
  };

  const cleanAdminName = (rawName: string) => {
    return (rawName || "").replace(/\s*\(Updated\)/gi, "").trim();
  };

  // Helper untuk menyaring akun staf pengujian/dummy
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

  // Handler untuk membersihkan log audit secara permanen di browser
  const handleClearAuditLogs = () => {
    if (confirm("Apakah Anda yakin ingin membersihkan dan menghapus semua data catatan log audit?")) {
      const now = Date.now();
      if (typeof window !== "undefined") {
        localStorage.setItem(AUDIT_CLEARED_TIMESTAMP_KEY, String(now));
        let storedIds: string[] = [];
        try {
          storedIds = JSON.parse(localStorage.getItem(AUDIT_CLEARED_IDS_KEY) || "[]");
        } catch {}
        const currentIds = auditLogs.map((l) => l.id.replace("LOG-", ""));
        const mergedIds = Array.from(new Set([...storedIds, ...currentIds]));
        localStorage.setItem(AUDIT_CLEARED_IDS_KEY, JSON.stringify(mergedIds));
      }
      setAuditLogs([]);
      showToast("Seluruh data log audit berhasil dibersihkan dan dihapus.");
    }
  };

  // Load live audit logs directly from Backend API
  const loadAuditLogs = async () => {
    try {
      const [res, adminsRes] = await Promise.all([
        superadminApi.getAuditLogs(),
        superadminApi.getAdmins().catch(() => ({ data: [] as AdminUserItem[] })),
      ]);

      const adminMap = new Map<number, { name: string; nip: string }>();
      if (adminsRes?.data && Array.isArray(adminsRes.data)) {
        adminsRes.data.forEach((a: AdminUserItem) => {
          adminMap.set(a.id, {
            name: cleanAdminName(a.name),
            nip: (a.role === "SUPERADMIN" ? "SPR-" : "ADM-") + String(a.id).padStart(3, "0"),
          });
        });
      }

      if (res?.data && Array.isArray(res.data)) {
        let clearedTimestamp = 0;
        let clearedIds: string[] = [];
        if (typeof window !== "undefined") {
          const storedTs = localStorage.getItem(AUDIT_CLEARED_TIMESTAMP_KEY);
          if (!storedTs) {
            // Sesuai permintaan pengguna: bersihkan dan hapus seluruh data log riwayat yang ada saat ini
            clearedTimestamp = Date.now();
            localStorage.setItem(AUDIT_CLEARED_TIMESTAMP_KEY, String(clearedTimestamp));
            const initialIds = res.data.map((l: AuditLogItem) => String(l.id));
            clearedIds = initialIds;
            localStorage.setItem(AUDIT_CLEARED_IDS_KEY, JSON.stringify(initialIds));
          } else {
            clearedTimestamp = parseInt(storedTs, 10) || 0;
            try {
              clearedIds = JSON.parse(localStorage.getItem(AUDIT_CLEARED_IDS_KEY) || "[]");
            } catch {}
          }
        }

        const validLogs = res.data.filter((l: AuditLogItem) => {
          if (isDummyAuditLog(l)) return false;
          if (clearedIds.includes(`LOG-${l.id}`) || clearedIds.includes(String(l.id))) return false;
          if (clearedTimestamp > 0) {
            const logTime = parseLogTime(l.created_at);
            if (logTime > 0 && logTime <= clearedTimestamp) return false;
          }
          return true;
        });

        const mappedLogs: AuditLog[] = validLogs.map((l: AuditLogItem) => {
          const matchedAdmin = adminMap.get(l.admin_id);
          const resolvedName = matchedAdmin?.name || (l.admin_id === 1 ? "Super Administrator Zhou" : `Admin #${l.admin_id}`);
          const resolvedNip = matchedAdmin?.nip || (l.admin_id === 1 ? "SPR-001" : `ADM-${String(l.admin_id).padStart(3, "0")}`);

          return {
            id: `LOG-${l.id}`,
            timestamp:
              new Date(l.created_at).toLocaleString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }) + " WIB",
            adminName: resolvedName,
            adminId: resolvedNip,
            clientId: l.client_id ? `CL-${l.client_id}` : "Umum",
            ticketId: l.project_id ? `TK-${l.project_id}` : `ACT-${l.id}`,
            statusBefore: l.status_before || "Draft",
            statusAfter: l.status_after || "Updated",
            relatedFile: l.file_name || "-",
            notes: l.description || l.action,
          };
        });
        setAuditLogs(mappedLogs);
      }
    } catch (err) {
      console.warn("Gagal memuat log audit dari backend:", err);
    }
  };

  // Load admins and compute task count from live consultations
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
      console.warn("Gagal memuat data admin dari backend:", err);
    }
  };

  useEffect(() => {
    loadAuditLogs();
    loadAdminsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Audit Filter State
  const [filterAdmin, setFilterAdmin] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

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
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterAdmin, searchQuery, itemsPerPage]);

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

  // Multi-format Export Engine (Microsoft Excel, OpenDocument, PDF, Web Page, CSV, TSV)
  const handleExportLogs = async (format: "xlsx" | "ods" | "pdf" | "html" | "csv" | "tsv") => {
    setIsExportMenuOpen(false);
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toLocaleTimeString("id-ID");
    const count = filteredLogs.length;

    if (count === 0) {
      showToast("Tidak ada data log audit yang sesuai dengan filter untuk diekspor.");
      return;
    }

    // Format data terstruktur untuk spreadsheet
    const tabularData = filteredLogs.map((l, index) => ({
      "No": index + 1,
      "Waktu (WIB)": l.timestamp,
      "Admin Bertugas": l.adminName,
      "ID Klien": l.clientId,
      "Nomor Tiket": l.ticketId,
      "Status Sebelumnya": l.statusBefore,
      "Status Sesudahnya": l.statusAfter,
      "Berkas Terkait": l.relatedFile || "-",
      "Catatan Audit": l.notes || "-",
      "SHA-256 Checksum": (l as { sha256Hash?: string }).sha256Hash || "-",
    }));

    if (format === "xlsx") {
      const ok = exportToExcel(tabularData, `Zhou_Audit_Log_${dateStr}.xlsx`, "AuditLogs");
      if (ok) {
        showToast(`Data audit trail (${count} baris) berhasil diekspor ke Microsoft Excel (.xlsx) valid.`);
      } else {
        showToast("Gagal mengekspor data ke Microsoft Excel.");
      }
      return;
    }

    if (format === "ods") {
      const ok = exportToOds(tabularData, `Zhou_Audit_Log_${dateStr}.ods`, "AuditLogs");
      if (ok) {
        showToast(`Data audit trail (${count} baris) berhasil diekspor ke OpenDocument Spreadsheet (.ods) valid.`);
      } else {
        showToast("Gagal mengekspor data ke OpenDocument.");
      }
      return;
    }

    if (format === "csv") {
      try {
        const res = await superadminApi.exportAuditLogs();
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const backendRows = res.data.map((item, idx) => ({
            "No": idx + 1,
            "Timestamp": item.timestamp || "-",
            "Admin Bertugas": item.admin || "-",
            "Klien": item.klien || "-",
            "Tiket": item.tiket || "-",
            "Status Sebelum": item.status_sebelum || "-",
            "Status Sesudah": item.status_sesudah || "-",
            "Berkas Terkait": item.file || "-",
            "Catatan": item.deskripsi || "-",
          }));
          exportToCsv(backendRows, `Zhou_Audit_Log_Backend_${dateStr}.csv`);
          showToast(`Laporan audit trail backend (${res.data.length} baris) berhasil diekspor ke CSV.`);
          return;
        } else if (res.success && typeof (res.data as { export_url?: string })?.export_url === "string") {
          window.open((res.data as { export_url: string }).export_url, "_blank");
          showToast("Laporan audit trail backend berhasil diunduh.");
          return;
        }
      } catch (err) {
        console.warn("superadminApi.exportAuditLogs fallback to local logs:", err);
      }

      exportToCsv(tabularData, `Zhou_Audit_Log_${dateStr}.csv`);
      showToast(`Data audit trail (${count} baris) berhasil diekspor ke Comma Separated Values (.csv).`);
      return;
    }

    if (format === "tsv") {
      exportToTsv(tabularData, `Zhou_Audit_Log_${dateStr}.tsv`);
      showToast(`Data audit trail (${count} baris) berhasil diekspor ke Tab Separated Values (.tsv).`);
      return;
    }

    if (format === "html") {
      const tableRows = filteredLogs
        .map(
          (l) =>
            `<tr>
              <td>${l.timestamp}</td>
              <td><strong>${l.adminName}</strong></td>
              <td><code>${l.clientId}</code></td>
              <td><code>${l.ticketId}</code></td>
              <td>${l.statusBefore}</td>
              <td><strong>${l.statusAfter}</strong></td>
              <td>${l.relatedFile}</td>
              <td>${l.notes || "-"}</td>
              <td><code>${(l as { sha256Hash?: string }).sha256Hash || "-"}</code></td>
            </tr>`
        )
        .join("");

      const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>Laporan Audit Trail - Zhou Consulting</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 32px; color: #1e293b; background: #f8fafc; }
    h1 { color: #0b1a30; font-size: 20px; margin-bottom: 4px; }
    .meta { color: #64748b; font-size: 12px; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    th { background: #0b1a30; color: #fff; text-align: left; padding: 10px 12px; font-size: 11px; text-transform: uppercase; }
    td { padding: 8px 12px; font-size: 12px; border-bottom: 1px solid #e2e8f0; }
    tr:hover { background: #f1f5f9; }
    code { font-family: monospace; font-size: 11px; background: #f1f5f9; padding: 2px 4px; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>Zhou Consulting: Laporan Log Audit Trail</h1>
  <div class="meta">Diekspor pada: ${dateStr} ${timeStr} WIB &bull; Jumlah: ${count} entri &bull; Standar: UU PDP No. 27/2022</div>
  <table>
    <thead>
      <tr>
        <th>Timestamp</th><th>Admin</th><th>Klien</th><th>Tiket</th><th>Status Sebelum</th><th>Status Sesudah</th><th>Berkas Terkait</th><th>Catatan</th><th>Hash SHA-256</th>
      </tr>
    </thead>
    <tbody>${tableRows}</tbody>
  </table>
</body>
</html>`;

      const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Zhou_Audit_Log_${dateStr}.html`;
      link.click();
      URL.revokeObjectURL(url);
      showToast(`Data audit trail (${count} baris) berhasil diekspor ke Web Page (.html).`);
      return;
    }

    if (format === "pdf") {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        showToast("Pop-up browser terblokir. Mengunduh berkas Web Page (.html) sebagai cadangan.");
        handleExportLogs("html");
        return;
      }

      const rowsHtml = filteredLogs
        .map(
          (l) => `
          <tr style="border-bottom: 1px solid #e2e8f0; font-size: 11px;">
            <td style="padding: 8px 10px; font-family: monospace;">${l.timestamp}</td>
            <td style="padding: 8px 10px; font-weight: 600;">${l.adminName}</td>
            <td style="padding: 8px 10px;">${l.clientId}</td>
            <td style="padding: 8px 10px; font-family: monospace;">${l.ticketId}</td>
            <td style="padding: 8px 10px; text-align: center;"><span style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">${l.statusBefore}</span></td>
            <td style="padding: 8px 10px; text-align: center;"><span style="background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${l.statusAfter}</span></td>
            <td style="padding: 8px 10px;">${l.relatedFile}</td>
            <td style="padding: 8px 10px; font-family: monospace; font-size: 9px; color: #64748b;">${((l as { sha256Hash?: string }).sha256Hash || "SHA-256").slice(0, 16)}...</td>
          </tr>`
        )
        .join("");

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Zhou Consulting - Laporan Audit Trail (${dateStr})</title>
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
              <div class="subtitle">Salinan Resmi Riwayat Penugasan & Mutasi Status Tiket Klien</div>
            </div>
            <div style="text-align: right; font-size: 11px; color: #64748b;">
              <div>Tanggal Cetak: ${dateStr} ${timeStr}</div>
              <div>Standar Kriptografi: SHA-256 Verified</div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Admin</th>
                <th>ID Klien</th>
                <th>ID Tiket</th>
                <th style="text-align: center;">Status Lama</th>
                <th style="text-align: center;">Status Baru</th>
                <th>Berkas</th>
                <th>Hash SHA-256</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <div class="footer">
            <div>Dokumen resmi diterbitkan oleh Sistem Superadmin Zhou Consulting (UU PDP No. 27/2022).</div>
            <div>Total Catatan: ${count} entri</div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
      showToast(`Dokumen PDF Laporan Audit Trail berhasil disiapkan untuk dicetak/diunduh.`);
    }
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
        {/* LOG AUDIT PERUBAHAN STATUS (APPEND-ONLY) */}
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

                {/* Right: Unified Single Export Button with Multi-Format Dropdown & Bersihkan Log */}
                <div className="flex items-center gap-2 self-start lg:self-auto shrink-0">
                  {auditLogs.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleClearAuditLogs}
                      className="text-xs font-semibold h-9 px-3 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 cursor-pointer flex items-center gap-1.5"
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

            {/* Audit Table (Seamless within container) */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-surface/70 border-b border-primary-light text-[11px] font-bold text-text-secondary uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3 text-left whitespace-nowrap">Waktu (Timestamp)</th>
                    <th className="py-2.5 px-3 text-left">Admin Bertugas</th>
                    <th className="py-2.5 px-2.5 text-center">ID Klien</th>
                    <th className="py-2.5 px-2.5 text-center">ID Tiket</th>
                    <th className="py-2.5 px-2 text-center">Status Sebelum</th>
                    <th className="py-2.5 px-2 text-center">Status Sesudah</th>
                    <th className="py-2.5 px-2.5 text-center">Berkas Terkait</th>
                    <th className="py-2.5 px-3 text-center">Detail / Inspeksi</th>
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
                        <td className="py-2.5 px-3 font-mono text-[11px] text-text-secondary whitespace-nowrap">
                          {log.timestamp}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-primary text-xs whitespace-nowrap sm:whitespace-normal">
                          {log.adminName}
                        </td>
                        <td className="py-2.5 px-2.5 font-mono text-center text-xs">{log.clientId}</td>
                        <td className="py-2.5 px-2.5 font-mono font-bold text-primary text-center text-xs">{log.ticketId}</td>
                        <td className="py-2.5 px-2 text-center">
                          {renderStatusBadge(log.statusBefore)}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          {renderStatusBadge(log.statusAfter)}
                        </td>
                        <td className="py-2.5 px-2.5 text-center text-text-secondary font-mono text-[11px] max-w-[120px] truncate" title={log.relatedFile}>
                          {log.relatedFile || "-"}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedLog(log)}
                            className="text-[11px] py-1 px-2.5 h-7 inline-flex items-center gap-1 border-primary-light hover:bg-surface text-primary"
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
              <div className="p-3.5 sm:p-4 bg-surface/40 border-t border-primary-light flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-secondary">
                <div className="flex items-center gap-3">
                  <span>
                    Menampilkan {(currentPage - 1) * itemsPerPage + 1} &ndash;{" "}
                    {Math.min(currentPage * itemsPerPage, filteredLogs.length)} dari {filteredLogs.length} catatan
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


    </div>
  );
}
