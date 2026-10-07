"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import {
  adminCmsApi,
  JobApplicationItem,
} from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SearchIcon,
  DocumentIcon,
  TrashIcon,
  EyeIcon,
  EnvelopeIcon,
  PhoneIcon,
  CheckCircleIcon,
  CloseIcon,
} from "@/components/icons";

function AdminLamaranPageContent() {
  const [applications, setApplications] = useState<JobApplicationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApp, setSelectedApp] = useState<JobApplicationItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadApplications = async () => {
    setIsLoading(true);
    try {
      const res = await adminCmsApi.getJobApplications();
      if (res?.data && Array.isArray(res.data)) {
        setApplications(res.data);
      } else {
        setApplications([]);
      }
    } catch (err) {
      console.warn("Gagal memuat daftar lamaran:", err);
      setApplications([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleDelete = async (appItem: JobApplicationItem) => {
    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin menghapus data lamaran dari "${appItem.applicant_name}"?`
    );
    if (!confirmDelete) return;

    try {
      await adminCmsApi.deleteJobApplication(appItem.id);
      setApplications((prev) => prev.filter((a) => a.id !== appItem.id));
      if (selectedApp?.id === appItem.id) {
        setSelectedApp(null);
      }
      showToast(`Data lamaran "${appItem.applicant_name}" berhasil dihapus.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal menghapus lamaran";
      showToast(msg);
    }
  };

  const filteredApplications = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return applications;

    return applications.filter((item) => {
      const name = (item.applicant_name || "").toLowerCase();
      const email = (item.applicant_email || "").toLowerCase();
      const phone = (item.applicant_phone || "").toLowerCase();
      const job = (item.job?.position_title || "").toLowerCase();
      return (
        name.includes(q) ||
        email.includes(q) ||
        phone.includes(q) ||
        job.includes(q)
      );
    });
  }, [applications, searchQuery]);

  // Statistik Ringkasan Lamaran
  const totalApps = applications.length;
  const uniquePositions = useMemo(() => {
    const set = new Set(
      applications.map((a) => a.job?.position_title || `ID #${a.job_id || a.career_id || "-"}`)
    );
    return set.size;
  }, [applications]);

  const recentApps = useMemo(() => {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return applications.filter((a) => {
      if (!a.applied_at) return false;
      const t = new Date(a.applied_at).getTime();
      return t >= oneWeekAgo;
    }).length;
  }, [applications]);

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
            className="text-slate-400 hover:text-white ml-2 p-1 cursor-pointer"
          >
            <CloseIcon className="text-xs" />
          </button>
        </div>
      )}

      {/* Header Halaman */}
      <div className="pb-4 border-b border-primary-light">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
          Lamaran Masuk
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
          Daftar pelamar karir yang masuk melalui portal publik Zhou Consulting. Verifikasi berkas CV dan koordinasikan proses seleksi kandidat.
        </p>
      </div>

      {/* Metric Cards Ringkasan */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 sm:p-5 rounded-2xl border-primary-light bg-white shadow-xs">
          <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">
            Total Lamaran Masuk
          </span>
          <div className="mt-2 text-2xl font-bold text-primary font-mono">
            {totalApps}
          </div>
          <div className="text-[10px] text-text-secondary mt-1">
            Seluruh berkas pelamar terdaftar di sistem
          </div>
        </Card>

        <Card className="p-4 sm:p-5 rounded-2xl border-blue-200 bg-blue-50/40 shadow-xs">
          <span className="text-[10px] text-blue-900 font-bold uppercase tracking-wider block">
            Posisi Dilamar
          </span>
          <div className="mt-2 text-2xl font-bold text-blue-800 font-mono">
            {uniquePositions}
          </div>
          <div className="text-[10px] text-blue-700 mt-1">
            Variasi divisi &amp; jabatan yang menerima lamaran
          </div>
        </Card>

        <Card className="p-4 sm:p-5 rounded-2xl border-emerald-200 bg-emerald-50/40 shadow-xs">
          <span className="text-[10px] text-emerald-900 font-bold uppercase tracking-wider block">
            Lamaran Baru (7 Hari)
          </span>
          <div className="mt-2 text-2xl font-bold text-emerald-800 font-mono">
            {recentApps}
          </div>
          <div className="text-[10px] text-emerald-700 mt-1">
            Kandidat baru dalam minggu ini
          </div>
        </Card>
      </div>

      {/* Tabel Data Lamaran Masuk */}
      <Card className="rounded-2xl border-primary-light bg-white p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-primary">Daftar Berkas Pelamar</h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Klik &quot;Lihat Detail&quot; untuk memeriksa informasi lengkap atau unduh CV pelamar.
            </p>
          </div>

          <div className="relative">
            <SearchIcon className="absolute left-3 top-2.5 text-text-muted text-xs" />
            <Input
              type="text"
              placeholder="Cari nama, email, telp, atau posisi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-xs h-9 w-64 sm:w-80 bg-surface border-primary-light"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-primary-light">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface/80 border-b border-primary-light/60 text-primary font-semibold">
              <tr>
                <th className="py-3 px-4">Nama Pelamar</th>
                <th className="py-3 px-4">Kontak (Email / Telp)</th>
                <th className="py-3 px-4">Posisi Lowongan</th>
                <th className="py-3 px-4">Berkas CV</th>
                <th className="py-3 px-4">Tanggal Masuk</th>
                <th className="py-3 px-4 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-light/40">
              {filteredApplications.map((app) => {
                const positionTitle =
                  app.job?.position_title || `Posisi ID #${app.job_id || app.career_id || "-"}`;

                return (
                  <tr key={app.id} className="hover:bg-surface/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-primary">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                          {app.applicant_name ? app.applicant_name.charAt(0).toUpperCase() : "P"}
                        </span>
                        <span>{app.applicant_name}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-text-secondary">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <EnvelopeIcon className="text-[10px] text-slate-400 shrink-0" />
                          <span className="font-mono text-[11px]">{app.applicant_email}</span>
                        </div>
                        {app.applicant_phone && (
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <PhoneIcon className="text-[10px] text-slate-400 shrink-0" />
                            <span className="font-mono text-[11px]">{app.applicant_phone}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant="outline" className="text-[11px] font-semibold text-primary border-primary-light">
                        {positionTitle}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4">
                      {app.cv_file_path ? (
                        <a
                          href={app.cv_file_path}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline bg-primary/5 px-2.5 py-1 rounded-md"
                        >
                          <DocumentIcon className="text-xs shrink-0 text-primary" />
                          <span className="truncate max-w-[140px]">
                            {app.cv_file_path.split("/").pop() || "Lihat CV"}
                          </span>
                        </a>
                      ) : (
                        <span className="text-text-muted italic text-[11px]">Tidak ada lampiran</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-text-secondary font-mono text-[11px]">
                      {app.applied_at
                        ? new Date(app.applied_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "-"}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedApp(app)}
                          className="h-7 px-2 text-xs font-semibold text-primary hover:bg-primary/10"
                          title="Lihat Detail Pelamar"
                        >
                          <EyeIcon className="text-xs" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(app)}
                          className="h-7 px-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                          title="Hapus Lamaran"
                        >
                          <TrashIcon className="text-xs" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {/* State Kosong */}
              {filteredApplications.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-text-secondary text-xs">
                    <div className="max-w-sm mx-auto space-y-2">
                      <p className="font-semibold text-primary text-sm">
                        {isLoading
                          ? "Sedang memuat data lamaran masuk..."
                          : "Belum ada berkas lamaran masuk."}
                      </p>
                      {!isLoading && (
                        <p className="text-[11px] text-text-muted">
                          Ketika pelamar mengirimkan form lamaran di halaman publik Karir, data akan otomatis muncul di sini.
                        </p>
                      )}
                      {!isLoading && searchQuery && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setSearchQuery("")}
                          className="mt-2 text-xs"
                        >
                          Reset Pencarian
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Detail Pelamar */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-primary-light max-w-lg w-full p-6 space-y-5 relative">
            <button
              type="button"
              onClick={() => setSelectedApp(null)}
              className="absolute top-5 right-5 text-text-secondary hover:text-primary p-1 cursor-pointer"
            >
              <CloseIcon className="text-sm" />
            </button>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                Detail Berkas Pelamar
              </span>
              <h3 className="text-lg font-bold text-primary mt-0.5">
                {selectedApp.applicant_name}
              </h3>
            </div>

            <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Posisi yang Dilamar</span>
                <span className="font-bold text-primary">
                  {selectedApp.job?.position_title || `ID #${selectedApp.job_id || selectedApp.career_id || "-"}`}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Email Pelamar</span>
                <a
                  href={`mailto:${selectedApp.applicant_email}`}
                  className="font-mono text-primary font-semibold hover:underline"
                >
                  {selectedApp.applicant_email}
                </a>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Nomor Telepon / WA</span>
                <span className="font-mono text-slate-800 font-semibold">
                  {selectedApp.applicant_phone || "-"}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Tanggal Melamar</span>
                <span className="text-slate-800">
                  {selectedApp.applied_at
                    ? new Date(selectedApp.applied_at).toLocaleString("id-ID", {
                        dateStyle: "long",
                        timeStyle: "short",
                      })
                    : "-"}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-500 font-medium">Berkas CV (Resume)</span>
                {selectedApp.cv_file_path ? (
                  <a
                    href={selectedApp.cv_file_path}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-primary font-bold hover:underline"
                  >
                    <DocumentIcon className="text-xs" />
                    Buka Berkas CV
                  </a>
                ) : (
                  <span className="text-slate-400 italic">Tidak ada berkas</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              {selectedApp.applicant_phone && (
                <a
                  href={`https://wa.me/${selectedApp.applicant_phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                >
                  <PhoneIcon className="text-xs" />
                  Hubungi via WhatsApp
                </a>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedApp(null)}
                className="text-xs"
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

export default function AdminLamaranPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-text-muted">
          Memuat portal lamaran masuk...
        </div>
      }
    >
      <AdminLamaranPageContent />
    </Suspense>
  );
}
