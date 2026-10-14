"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DocumentIcon,
  LocationIcon,
  ClockIcon,
  BriefcaseIcon,
} from "@/components/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/context/LanguageContext";
import {
  CareerSettings,
  JobPosition,
  DEFAULT_CAREER_SETTINGS,
  getStoredCareerSettings,
  CAREER_SETTINGS_EVENT,
  hasAppliedToCareer,
  recordCareerApplication,
  saveStoredJobApplication,
} from "@/data/karirStorage";
import { publicApi, CareerItem } from "@/lib/api";
import { isCmsItemDeleted } from "@/data/cmsDeletedStorage";

export function CareerSection() {
  const { t } = useLanguage();
  const [careerSettings, setCareerSettings] = useState<CareerSettings>(DEFAULT_CAREER_SETTINGS);
  const [jobs, setJobs] = useState<JobPosition[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("all");

  // Modal states
  const [selectedJobDetail, setSelectedJobDetail] = useState<JobPosition | null>(null);
  const [selectedJobApply, setSelectedJobApply] = useState<JobPosition | null>(null);
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);

  // Form states
  const [applicantName, setApplicantName] = useState<string>("");
  const [applicantEmail, setApplicantEmail] = useState<string>("");
  const [applicantPhone, setApplicantPhone] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [fileError, setFileError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [applyError, setApplyError] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    const settings = getStoredCareerSettings();
    setCareerSettings(settings);

    const handleUpdate = () => {
      const s = getStoredCareerSettings();
      setCareerSettings(s);
    };

    window.addEventListener(CAREER_SETTINGS_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);

    // Fetch live backend careers only
    publicApi
      .getCareers()
      .then((res) => {
        if (!isMounted) return;
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          const apiJobs: JobPosition[] = res.data
            .filter((c: CareerItem) => !isCmsItemDeleted(c.id, c.position_title, c.id, c.position_code))
            .map((c: CareerItem) => {
            const titleLower = (c.position_title || "").toLowerCase();
            const deptKey = (titleLower.includes("tax") || titleLower.includes("pajak")
              ? "tax"
              : titleLower.includes("account") || titleLower.includes("akuntan")
              ? "accounting"
              : titleLower.includes("legal") || titleLower.includes("hukum")
              ? "legal"
              : "advisory") as JobPosition["deptKey"];

            const department =
              deptKey === "tax"
                ? "Tax Service Core"
                : deptKey === "accounting"
                ? "Accounting Service"
                : deptKey === "legal"
                ? "Legal Services"
                : "Business Advisory";

            return {
              id: c.position_code || String(c.id),
              backendId: c.id,
              title: c.position_title,
              department,
              deptKey,
              type: "Full-Time",
              location: c.location || "Jakarta (Hybrid)",
              experience: c.level || "Min. 1-3 tahun",
              summary: c.description || "Posisi karir profesional di Zhou Consulting.",
              skills: ["Kepatuhan", "Akuntansi", "Analisis"],
            };
          });

          setJobs(apiJobs);
        } else {
          setJobs([]);
        }
      })
      .catch((err) => {
        console.warn("publicApi.getCareers in CareerSection:", err);
        setJobs([]);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
      window.removeEventListener(CAREER_SETTINGS_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const filteredJobs =
    activeTab === "all"
      ? jobs
      : jobs.filter((j) => j.deptKey === activeTab);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        setFileError("Format CV harus PDF.");
        setFileName("");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setFileError("Ukuran CV melebihi batas 5 MB.");
        setFileName("");
        return;
      }
      setFileError("");
      setFileName(file.name);
    }
  };

  const handleOpenDetailModal = (job: JobPosition) => {
    setSelectedJobDetail(job);
  };

  const handleOpenApplyModal = (job: JobPosition | null) => {
    setSelectedJobDetail(null);
    setSelectedJobApply(job);
    setFormSubmitted(false);
    setApplicantName("");
    setApplicantEmail("");
    setApplicantPhone("");
    setFileName("");
    setFileError("");
    setApplyError("");
  };

  const handleCloseApplyModal = () => {
    setSelectedJobApply(null);
    setFormSubmitted(false);
    setApplicantName("");
    setApplicantEmail("");
    setApplicantPhone("");
    setFileName("");
    setFileError("");
    setApplyError("");
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName.trim() || !applicantEmail.trim() || !applicantPhone.trim() || !fileName) {
      return;
    }

    const numId =
      selectedJobApply?.backendId ??
      (selectedJobApply?.id ? parseInt(selectedJobApply.id.replace(/\D/g, ""), 10) || 1 : 1);

    const cleanEmail = applicantEmail.trim().toLowerCase();

    // Validasi satu email hanya dapat melamar satu kali pada lowongan yang sama
    if (
      hasAppliedToCareer(numId, cleanEmail) ||
      (selectedJobApply?.id && hasAppliedToCareer(selectedJobApply.id, cleanEmail))
    ) {
      setApplyError("Email ini sudah digunakan untuk melamar posisi ini. Silakan periksa kembali data lamaran Anda.");
      return;
    }

    setIsSubmitting(true);
    setApplyError("");

    try {
      // 1. Panggil server apply route untuk validasi duplikasi & pengiriman email konfirmasi
      const serverRes = await fetch("/api/karir/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_id: String(selectedJobApply?.id || numId),
          position_title: selectedJobApply?.title || "Database Talenta",
          full_name: applicantName.trim(),
          email: cleanEmail,
          phone: applicantPhone.trim(),
          education: "S1 / D4 / Pengalaman Profesional",
          agree_terms: true,
          cv_file_name: fileName || "cv_applicant.pdf",
        }),
      })
        .then((r) => r.json())
        .catch(() => null);

      if (serverRes && !serverRes.success) {
        if (serverRes.duplicate) {
          setApplyError("Email ini sudah digunakan untuk melamar posisi ini. Silakan periksa kembali data lamaran Anda.");
          return;
        }
      }

      // 2. Simpan ke backend remote jika aktif
      const res = await publicApi.applyCareer(numId, {
        applicant_name: applicantName.trim(),
        applicant_email: cleanEmail,
        applicant_phone: applicantPhone.trim(),
        cv_file_path: fileName || "cv_applicant.pdf",
      });

      if (!res.success && res.error !== "NETWORK_ERROR") {
        const errorText = (res.message || res.error || "").toLowerCase();
        if (
          errorText.includes("already") ||
          errorText.includes("sudah") ||
          errorText.includes("duplicate")
        ) {
          setApplyError("Email ini sudah digunakan untuk melamar posisi ini. Silakan periksa kembali data lamaran Anda.");
          return;
        }
      }

      // Berhasil
      recordCareerApplication(numId, cleanEmail);
      if (selectedJobApply?.id) recordCareerApplication(selectedJobApply.id, cleanEmail);

      const regCode =
        serverRes?.data?.registration_code ||
        `ZHOU-REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      // Simpan ke storage lokal agar terintegrasi dengan CMS lamaran
      saveStoredJobApplication({
        id: Date.now(),
        job_id: numId,
        applicant_name: applicantName.trim(),
        applicant_email: cleanEmail,
        applicant_phone: applicantPhone.trim(),
        education: "S1 / D4 / Pengalaman Profesional",
        cv_file_path: "cv_applicant.pdf",
        cv_file_name: fileName,
        status: "Baru Masuk",
        applied_at: new Date().toISOString(),
        registration_code: regCode,
        cover_letter: selectedJobApply ? `Melamar posisi ${selectedJobApply.title}` : "Pendaftaran Database Talenta",
        job: {
          position_code: selectedJobApply?.id || "TALENT",
          position_title: selectedJobApply?.title || "Database Talenta",
          department: selectedJobApply?.department || "Umum",
        },
      });

      setFormSubmitted(true);
    } catch (err) {
      console.warn("handleApplySubmit error:", err);
      setApplyError("Lamaran belum berhasil dikirim karena gangguan koneksi atau server. Silakan coba kembali.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isHiringOpen = jobs.length > 0;

  return (
    <section
      id="karir"
      aria-label="Peluang Karir Zhou Consulting"
      className="py-16 md:py-20 lg:py-24 bg-white border-b border-primary-light scroll-mt-20 font-sans"
    >
      <div className="container-custom space-y-10 md:space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            <h2 className="text-[20px] leading-[28px] sm:text-[22px] sm:leading-[30px] lg:text-[28px] lg:leading-[36px] font-bold text-primary tracking-tight text-balance">
              {t.career.headline || "Bergabung Bersama Tim Profesional Zhou Consulting"}
            </h2>
            <p className="text-[14px] leading-[22px] sm:text-[15px] sm:leading-[24px] text-text-secondary leading-relaxed">
              {t.career.subheading ||
                "Kembangkan potensi Anda di lingkungan kerja kolaboratif dengan standar kepatuhan dan integritas profesional tertinggi."}
            </p>
          </div>

          {isLoading ? (
            <Skeleton className="h-8 w-32 rounded-lg self-start md:self-auto shrink-0" />
          ) : isHiringOpen ? (
            <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
              <Badge variant="outline" className="text-xs font-semibold py-1.5 px-3 border-primary-light text-primary">
                {jobs.length} Posisi Terbuka
              </Badge>
            </div>
          ) : null}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-200">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-white border-primary-light p-6 space-y-4 rounded-xl">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-24 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-28" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-6 w-3/5" />
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="h-3.5 w-4/5" />
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-primary-light">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-24 rounded-md" />
                </div>
              </Card>
            ))}
          </div>
        ) : !isHiringOpen ? (
          /* Tampilan Pengumuman Statis Saat Belum Ada Lowongan */
          <div className="max-w-3xl mx-auto rounded-2xl bg-surface/60 border border-primary-light p-8 md:p-12 text-center space-y-6 shadow-xs">
            <div className="w-14 h-14 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center text-xl">
              <ClockIcon />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold text-primary tracking-tight">
                {careerSettings.closedTitle || "Lowongan Periode Ini Belum Dibuka"}
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-lg mx-auto">
                {careerSettings.closedMessage ||
                  "Saat ini seluruh posisi di Zhou Consulting telah terisi dan belum ada formasi baru yang dibuka untuk publik."}
              </p>
            </div>
            {careerSettings.closedPeriodNote && (
              <div className="p-3.5 rounded-xl bg-white border border-primary-light/80 text-xs text-text-secondary max-w-md mx-auto text-center space-y-1">
                <p className="leading-relaxed">{careerSettings.closedPeriodNote}</p>
              </div>
            )}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Button variant="outline" size="sm" asChild className="text-xs font-semibold hover:border-primary h-9 px-4">
                <Link href="/kontak">Hubungi Sekretariat</Link>
              </Button>
              <Button variant="primary" size="sm" onClick={() => handleOpenApplyModal(null)} className="text-xs font-semibold h-9 px-4">
                <BriefcaseIcon className="text-xs mr-1.5" />
                <span>Daftar Database Talenta</span>
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Department Filter Tabs */}
            <div className="flex items-center justify-start overflow-x-auto pb-2">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-auto"
              >
                <TabsList className="bg-surface border border-primary-light p-1">
                  <TabsTrigger value="all" className="text-xs">
                    Semua Bidang ({jobs.length})
                  </TabsTrigger>
                  <TabsTrigger value="tax" className="text-xs">
                    Perpajakan &amp; Coretax
                  </TabsTrigger>
                  <TabsTrigger value="accounting" className="text-xs">
                    Akuntansi &amp; SAK
                  </TabsTrigger>
                  <TabsTrigger value="legal" className="text-xs">
                    Legal Services
                  </TabsTrigger>
                  <TabsTrigger value="advisory" className="text-xs">
                    Business Advisory
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* List Kartu Lowongan Kerja (Tampilan Rapi Sesuai Halaman Karir) */}
            <div className="max-w-4xl mx-auto space-y-4">
              {filteredJobs.slice(0, 3).map((job) => (
                <Card
                  key={job.id}
                  className="bg-white border-primary-light hover:border-primary hover:shadow-md transition-all duration-200 group rounded-xl p-5 space-y-3"
                >
                  <CardHeader className="p-0 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="primary" size="sm" className="font-semibold text-[11px]">
                          {job.department}
                        </Badge>
                        <Badge variant="outline" size="sm" className="text-[10px] border-primary-light text-text-secondary">
                          <span>{job.type}</span>
                        </Badge>
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary font-medium">
                        <LocationIcon className="text-[11px] text-text-secondary" />
                        {job.location}
                      </span>
                    </div>

                    <CardTitle
                      onClick={() => handleOpenDetailModal(job)}
                      className="text-base sm:text-lg font-bold text-primary group-hover:text-primary-dark transition-colors cursor-pointer"
                    >
                      {job.title}
                    </CardTitle>

                    <CardDescription className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                      {job.summary}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="p-0 pt-1 space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                      {job.skills?.map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-surface border border-primary-light text-text-secondary"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </CardContent>

                  <CardFooter className="p-0 pt-3 border-t border-primary-light flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
                    <div className="text-xs text-text-secondary">
                      <span>Kualifikasi: </span>
                      <strong className="text-primary">{job.experience}</strong>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDetailModal(job)}
                        className="text-xs font-semibold hover:border-primary flex-1 sm:flex-initial h-8 px-3"
                      >
                        Lihat Kualifikasi
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleOpenApplyModal(job)}
                        className="text-xs font-semibold px-4 flex-1 sm:flex-initial h-8"
                      >
                        <span>Lamar Posisi</span>
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>


            {/* Link Menuju Portal Karir */}
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                size="default"
                asChild
                className="text-xs font-bold gap-2 hover:border-primary h-9 px-5"
              >
                <Link href="/karir">
                  <span>Lihat Seluruh Lowongan di Portal Karir</span>
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>

      {/* 1. Modal Detail Kualifikasi Posisi */}
      <Dialog open={Boolean(selectedJobDetail)} onOpenChange={(open) => !open && setSelectedJobDetail(null)}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedJobDetail && (
            <>
              <DialogHeader className="space-y-2 border-b border-primary-light pb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="primary" size="sm">
                    {selectedJobDetail.department}
                  </Badge>
                  <span className="text-xs text-text-secondary">{selectedJobDetail.type}</span>
                  <span className="text-xs text-text-secondary">&bull;</span>
                  <span className="text-xs text-text-secondary">{selectedJobDetail.location}</span>
                </div>
                <DialogTitle className="text-lg sm:text-xl font-bold text-primary">
                  {selectedJobDetail.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-text-secondary">
                  Persyaratan Pengalaman: {selectedJobDetail.experience}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4 text-xs text-text-primary">
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                    Ringkasan Posisi &amp; Tanggung Jawab
                  </h4>
                  <p className="text-text-secondary leading-relaxed">
                    {selectedJobDetail.summary}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                    Kompetensi yang Dibutuhkan
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedJobDetail.skills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-surface border border-primary-light text-text-secondary"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-3 border-t border-primary-light flex items-center justify-end gap-2">
                <DialogClose asChild>
                  <Button type="button" variant="outline" size="sm" className="text-xs">
                    Tutup
                  </Button>
                </DialogClose>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => handleOpenApplyModal(selectedJobDetail)}
                  className="text-xs font-semibold px-4"
                >
                  Lamar Sekarang
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 2. Modal Formulir Pendaftaran Lamaran Kerja */}
      <Dialog open={Boolean(selectedJobApply)} onOpenChange={(open) => !open && handleCloseApplyModal()}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedJobApply !== undefined && (
            <>
              <DialogHeader className="space-y-2 border-b border-primary-light pb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="primary" size="sm">
                    {selectedJobApply?.department || "Database Talenta"}
                  </Badge>
                  {selectedJobApply?.location && (
                    <span className="text-xs text-text-secondary">{selectedJobApply.location}</span>
                  )}
                </div>
                <DialogTitle className="text-lg sm:text-xl font-bold text-primary">
                  {selectedJobApply ? `Lamar: ${selectedJobApply.title}` : "Pendaftaran Database Talenta"}
                </DialogTitle>
                <DialogDescription className="text-xs text-text-secondary">
                  Lengkapi formulir di bawah ini dengan data asli untuk ditelaah oleh tim HR Zhou Consulting.
                </DialogDescription>
              </DialogHeader>

              {formSubmitted ? (
                <div className="py-6 sm:py-8 text-center space-y-5">
                  <div className="space-y-2">
                    <h4 className="text-lg sm:text-xl font-bold text-primary tracking-tight">
                      Lamaran Berhasil Dikirim
                    </h4>
                    <p className="text-xs sm:text-sm text-text-secondary max-w-sm mx-auto leading-relaxed">
                      Terima kasih telah melamar di Zhou Consulting. Berkas lamaran Anda berhasil disimpan.
                    </p>
                  </div>
                  <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
                    Tim People &amp; Culture akan meninjau lamaran Anda. Kandidat yang memenuhi kualifikasi akan dihubungi melalui email atau WhatsApp resmi.
                  </p>
                  <Button variant="primary" size="default" onClick={handleCloseApplyModal} className="text-xs px-6">
                    Tutup
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleApplySubmit} className="space-y-4 py-3 text-xs">
                  <div className="space-y-1.5">
                    <Label htmlFor="land-app-name" className="text-xs font-semibold text-primary">
                      Nama Lengkap Sesuai KTP *
                    </Label>
                    <Input
                      id="land-app-name"
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      placeholder="Masukkan nama lengkap Anda"
                      required
                      className="text-xs h-9"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="land-app-email" className="text-xs font-semibold text-primary">
                        Alamat Email Aktif *
                      </Label>
                      <Input
                        id="land-app-email"
                        type="email"
                        value={applicantEmail}
                        onChange={(e) => setApplicantEmail(e.target.value)}
                        placeholder="pelamar@email.com"
                        required
                        className="text-xs h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="land-app-phone" className="text-xs font-semibold text-primary">
                        Nomor WhatsApp *
                      </Label>
                      <Input
                        id="land-app-phone"
                        type="tel"
                        value={applicantPhone}
                        onChange={(e) => setApplicantPhone(e.target.value)}
                        placeholder="08xxxxxxxxxx"
                        required
                        className="text-xs h-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="land-app-cv" className="text-xs font-semibold text-primary">
                      Unggah Resume / CV (PDF, Maks. 5 MB) *
                    </Label>
                    <div className="flex items-center gap-2.5">
                      <label
                        htmlFor="land-app-cv"
                        className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-primary-light bg-surface hover:bg-surface/80 text-xs font-semibold text-primary transition-colors"
                      >
                        <DocumentIcon className="text-xs" />
                        <span>Pilih Berkas PDF</span>
                      </label>
                      <input
                        id="land-app-cv"
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        required={!fileName}
                      />
                      {fileName ? (
                        <span className="text-xs text-text-secondary truncate max-w-[200px] font-medium">
                          {fileName}
                        </span>
                      ) : (
                        <span className="text-[11px] text-text-muted">
                          Belum ada file dipilih
                        </span>
                      )}
                    </div>
                    {fileError && (
                      <p className="text-[11px] text-error font-medium">{fileError}</p>
                    )}
                  </div>

                  {applyError && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-[11px] text-red-700 font-medium">
                      {applyError}
                    </div>
                  )}

                  <DialogFooter className="pt-3 border-t border-primary-light flex items-center justify-end gap-2">
                    <DialogClose asChild>
                      <Button type="button" variant="outline" size="sm" className="text-xs" disabled={isSubmitting}>
                        Batal
                      </Button>
                    </DialogClose>
                    <Button type="submit" variant="primary" size="sm" className="text-xs font-semibold px-4" disabled={isSubmitting}>
                      {isSubmitting ? "Mengirimkan..." : "Kirim Berkas Lamaran"}
                    </Button>
                  </DialogFooter>
                </form>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
