"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import {
  adminApi,
  ConsultationItem,
  AdminDashboardOverviewData,
} from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  CheckCircleIcon,
  DocumentIcon,
  BuildingIcon,
  SearchIcon,
  CloseIcon,
  EditIcon,
  ClockIcon,
  UserIcon,
} from "@/components/icons";

function AdminDashboardContent() {
  const [overview, setOverview] = useState<AdminDashboardOverviewData>({
    total_consultations: 0,
    active_consultations: 0,
    completed_consultations: 0,
    total_clients: 0,
    total_documents: 0,
  });
  const [consultations, setConsultations] = useState<ConsultationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedConsultation, setSelectedConsultation] = useState<ConsultationItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [overviewRes, consultRes] = await Promise.allSettled([
        adminApi.getDashboardOverview(),
        adminApi.getConsultations(),
      ]);

      if (overviewRes.status === "fulfilled" && overviewRes.value.data) {
        setOverview(overviewRes.value.data);
      }
      if (consultRes.status === "fulfilled" && Array.isArray(consultRes.value.data)) {
        setConsultations(consultRes.value.data);
      }
    } catch (err) {
      console.warn("Gagal memuat data operasional:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (
    id: number,
    newStatus: "PENDING" | "IN_PROGRESS" | "COMPLETED"
  ) => {
    try {
      await adminApi.updateConsultationStatus(id, newStatus);
      setConsultations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
      );
      if (selectedConsultation?.id === id) {
        setSelectedConsultation((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      showToast(`Status perikatan konsultasi #${id} berhasil diubah ke ${newStatus}.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal memperbarui status";
      showToast(msg);
    }
  };

  const filteredConsultations = useMemo(() => {
    return consultations.filter((item) => {
      const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        item.title?.toLowerCase().includes(q) ||
        item.project_code?.toLowerCase().includes(q) ||
        item.client?.name?.toLowerCase().includes(q) ||
        item.client?.company_name?.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [consultations, statusFilter, searchQuery]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0B1533] text-white px-5 py-3 rounded-xl shadow-xl border border-primary-light flex items-center gap-3 text-xs animate-in fade-in slide-in-from-bottom-2">
          <CheckCircleIcon className="text-success text-sm shrink-0" />
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-primary-light">
        <div>
          <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
            <span>Portal Staf Konsultan</span>
            <span>/</span>
            <span className="text-primary font-bold">Dashboard Operasional</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
            Ringkasan Operasional &amp; Perikatan Klien
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Pantau statistik konsultasi aktif, progres penugasan tim fiskal, dan koordinasi dokumen perikatan.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={isLoading}
            className="text-xs font-semibold h-9 px-3.5 border-primary-light bg-white"
          >
            {isLoading ? "Memuat..." : "Segarkan Data"}
          </Button>

          <Link
            href="/dashboard/admin/cms"
            className="inline-flex items-center gap-2 px-4 h-9 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
          >
            <EditIcon className="text-xs" />
            <span>Pusat Manajemen CMS</span>
          </Link>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-5 rounded-2xl border-primary-light bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
              Total Konsultasi
            </span>
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs">
              <BuildingIcon />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-primary font-mono">
            {overview.total_consultations}
          </div>
          <div className="text-[10px] text-text-secondary mt-1">Seluruh proyek terdaftar</div>
        </Card>

        <Card className="p-4 sm:p-5 rounded-2xl border-amber-200 bg-amber-50/40 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-amber-900 font-bold uppercase tracking-wider">
              Sedang Berjalan
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-200/60 flex items-center justify-center text-amber-800 text-xs">
              <ClockIcon />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-800 font-mono">
            {overview.active_consultations}
          </div>
          <div className="text-[10px] text-amber-700 mt-1">Perikatan aktif tim BKP</div>
        </Card>

        <Card className="p-4 sm:p-5 rounded-2xl border-emerald-200 bg-emerald-50/40 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-emerald-900 font-bold uppercase tracking-wider">
              Konsultasi Selesai
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-200/60 flex items-center justify-center text-emerald-800 text-xs">
              <CheckCircleIcon />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-800 font-mono">
            {overview.completed_consultations}
          </div>
          <div className="text-[10px] text-emerald-700 mt-1">Laporan luaran terbit</div>
        </Card>

        <Card className="p-4 sm:p-5 rounded-2xl border-primary-light bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
              Total Klien
            </span>
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs">
              <UserIcon />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-primary font-mono">
            {overview.total_clients}
          </div>
          <div className="text-[10px] text-text-secondary mt-1">Entitas korporasi &amp; pribadi</div>
        </Card>

        <Card className="p-4 sm:p-5 rounded-2xl border-primary-light bg-white shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
              Total Dokumen
            </span>
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs">
              <DocumentIcon />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-primary font-mono">
            {overview.total_documents}
          </div>
          <div className="text-[10px] text-text-secondary mt-1">Berkas &amp; kertas kerja</div>
        </Card>
      </div>

      {/* CALLOUT BANNER: PUSAT MANAJEMEN CMS SATU PINTU */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-[#0B1533] to-[#172652] text-white p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-semibold">
            <EditIcon className="text-[10px]" />
            <span>Pusat Manajemen Konten Terpadu</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold">
            Kelola Seluruh Publikasi Website di Pusat CMS
          </h2>
          <p className="text-xs text-silver leading-relaxed">
            Pusat manajemen konten publik telah disatukan dalam satu halaman terstruktur: Materi Edukasi, Katalog Layanan, Regulasi DJP, Kurs Pajak KMK, Lowongan Karir, Pelamar Masuk, FAQ Chatbot, dan Profil &amp; Kontak.
          </p>
          <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
            <Link href="/dashboard/admin/cms?tab=services" className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors">
              + Katalog Layanan
            </Link>
            <Link href="/dashboard/admin/cms?tab=edukasi" className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors">
              + Edukasi Pajak
            </Link>
            <Link href="/dashboard/admin/cms?tab=regulasi" className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors">
              + Regulasi DJP
            </Link>
            <Link href="/dashboard/admin/cms?tab=kurs" className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors">
              + Kurs KMK
            </Link>
            <Link href="/dashboard/admin/cms?tab=karir" className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors">
              + Lowongan Karir
            </Link>
            <Link href="/dashboard/admin/cms?tab=applications" className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors">
              + Pelamar Masuk
            </Link>
          </div>
        </div>

        <Link
          href="/dashboard/admin/cms"
          className="self-start md:self-center shrink-0 px-5 py-2.5 rounded-xl bg-white text-[#0B1533] font-bold text-xs hover:bg-silver/90 transition-all shadow-md active:scale-95"
        >
          Buka Manajemen CMS &rarr;
        </Link>
      </div>

      {/* OPERATIONAL CONSULTATIONS TABLE */}
      <Card className="rounded-2xl border-primary-light bg-white p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-primary">Daftar Perikatan &amp; Konsultasi Klien</h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Kelola status pengerjaan kertas kerja dan verifikasi berkas perpajakan klien secara real-time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-2.5 text-text-muted text-xs" />
              <Input
                type="text"
                placeholder="Cari klien, kode atau judul..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs h-9 w-48 sm:w-64 bg-surface border-primary-light"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs h-9 px-3 rounded-xl border border-primary-light bg-surface text-text-primary focus:bg-white font-medium focus:outline-none"
            >
              <option value="ALL">Semua Status</option>
              <option value="IN_PROGRESS">Sedang Berjalan</option>
              <option value="COMPLETED">Selesai</option>
              <option value="PENDING">Menunggu</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto rounded-xl border border-primary-light">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface text-text-muted font-bold uppercase text-[10px] tracking-wider border-b border-primary-light">
              <tr>
                <th className="py-3 px-4">Kode &amp; Judul Proyek</th>
                <th className="py-3 px-4">Klien &amp; Entitas</th>
                <th className="py-3 px-4">Kategori Layanan</th>
                <th className="py-3 px-4">Tanggal Masuk</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-light">
              {filteredConsultations.map((item) => (
                <tr key={item.id} className="hover:bg-surface/60 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-primary">
                    <span className="font-mono text-[10px] text-text-muted block">
                      {item.project_code || `#PRJ-${item.id}`}
                    </span>
                    <span className="font-semibold text-xs text-primary">{item.title}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-primary block">
                      {item.client?.name || `Klien ID: #${item.client_id}`}
                    </span>
                    <span className="text-[11px] text-text-secondary block">
                      {item.client?.company_name || item.client?.email || "-"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-text-secondary">
                    {item.service?.service_name || "Konsultasi Perpajakan"}
                  </td>
                  <td className="py-3.5 px-4 text-text-secondary text-[11px]">
                    {item.created_at
                      ? new Date(item.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "-"}
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge
                      variant={
                        item.status === "COMPLETED"
                          ? "success"
                          : item.status === "IN_PROGRESS"
                          ? "primary"
                          : "silver"
                      }
                      size="sm"
                    >
                      {item.status === "COMPLETED"
                        ? "Selesai"
                        : item.status === "IN_PROGRESS"
                        ? "Sedang Berjalan"
                        : "Menunggu"}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                    {item.status !== "COMPLETED" ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateStatus(item.id, "COMPLETED")}
                        className="text-[11px] h-7 px-2.5 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border-emerald-200"
                      >
                        Tandai Selesai
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateStatus(item.id, "IN_PROGRESS")}
                        className="text-[11px] h-7 px-2.5"
                      >
                        Buka Kembali
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedConsultation(item)}
                      className="text-[11px] h-7 px-2.5"
                    >
                      Detail
                    </Button>
                  </td>
                </tr>
              ))}

              {filteredConsultations.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-text-secondary text-xs">
                    {isLoading
                      ? "Sedang memuat data perikatan dari backend..."
                      : "Tidak ada perikatan konsultasi yang cocok dengan filter."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* DETAIL MODAL */}
      {selectedConsultation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-primary-light max-w-lg w-full p-6 space-y-4 relative">
            <button
              type="button"
              onClick={() => setSelectedConsultation(null)}
              className="absolute top-5 right-5 text-text-secondary hover:text-primary p-1"
            >
              <CloseIcon className="text-sm" />
            </button>

            <div>
              <span className="font-mono text-[10px] text-text-muted">
                {selectedConsultation.project_code || `#PRJ-${selectedConsultation.id}`}
              </span>
              <h3 className="text-base font-bold text-primary mt-0.5">
                {selectedConsultation.title}
              </h3>
            </div>

            <div className="space-y-2.5 text-xs bg-surface p-4 rounded-xl border border-primary-light">
              <div className="flex justify-between">
                <span className="text-text-secondary">Nama Klien:</span>
                <span className="font-semibold text-primary">
                  {selectedConsultation.client?.name || `#CL-${selectedConsultation.client_id}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Perusahaan:</span>
                <span className="font-semibold text-primary">
                  {selectedConsultation.client?.company_name || "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Email:</span>
                <span className="font-mono text-primary">
                  {selectedConsultation.client?.email || "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Layanan:</span>
                <span className="font-semibold text-primary">
                  {selectedConsultation.service?.service_name || "Layanan Konsultasi Pajak"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Status Pengerjaan:</span>
                <Badge
                  variant={
                    selectedConsultation.status === "COMPLETED"
                      ? "success"
                      : selectedConsultation.status === "IN_PROGRESS"
                      ? "primary"
                      : "silver"
                  }
                  size="sm"
                >
                  {selectedConsultation.status}
                </Badge>
              </div>
            </div>

            {selectedConsultation.description && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-secondary">Uraian Kebutuhan Klien:</label>
                <p className="text-xs text-text-primary p-3 rounded-xl bg-surface border border-primary-light leading-relaxed">
                  {selectedConsultation.description}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-primary-light">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedConsultation(null)}
                className="text-xs"
              >
                Tutup
              </Button>
              <Link
                href="/dashboard/admin/upload"
                className="inline-flex items-center gap-1.5 px-3.5 h-8 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors"
              >
                <DocumentIcon className="text-xs" />
                <span>Upload Dokumen Luaran</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-text-secondary text-xs">
          Memuat data operasional admin...
        </div>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}
