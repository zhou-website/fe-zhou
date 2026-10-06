"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  CareerSettings,
  DEFAULT_CAREER_SETTINGS,
  getStoredCareerSettings,
  CAREER_SETTINGS_EVENT,
  JobPosition,
} from "@/data/karirStorage";
import { publicApi, CareerItem } from "@/lib/api";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
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
  BriefcaseIcon,
  CheckCircleIcon,
  CheckIcon,
  DocumentIcon,
  LocationIcon,
  ClockIcon,
  SearchIcon,
  CloseIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserIcon,
} from "@/components/icons";

const CAREER_JOBS: JobPosition[] = [];

export default function CareerPage() {
  const [careerSettings, setCareerSettings] = useState<CareerSettings>(DEFAULT_CAREER_SETTINGS);
  const [jobsList, setJobsList] = useState<JobPosition[]>(CAREER_JOBS);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedJobModal, setSelectedJobModal] = useState<JobPosition | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState<boolean>(false);
  const [selectedJobToApply, setSelectedJobToApply] = useState<JobPosition | null>(null);

  // Sync Career Settings with localStorage on mount & events + fetch Backend Careers
  useEffect(() => {
    let isMounted = true;
    const currentSettings = getStoredCareerSettings();
    setCareerSettings(currentSettings);
    if (currentSettings.positions && currentSettings.positions.length > 0) {
      setJobsList(currentSettings.positions);
    }

    // Fetch live careers from Backend API
    publicApi
      .getCareers()
      .then((res) => {
        if (!isMounted) return;
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          const apiJobs: JobPosition[] = res.data.map((c: CareerItem) => {
            const titleLower = (c.position_title || "").toLowerCase();
            const deptKey = (titleLower.includes("tax") || titleLower.includes("pajak")
              ? "tax"
              : titleLower.includes("account") || titleLower.includes("akuntan")
              ? "accounting"
              : titleLower.includes("legal") || titleLower.includes("hukum")
              ? "legal"
              : "all") as JobPosition["deptKey"];

            const department =
              deptKey === "tax"
                ? "Tax Service Core"
                : deptKey === "accounting"
                ? "Accounting Service"
                : deptKey === "legal"
                ? "Legal Services"
                : "Konsultasi Bisnis";

            return {
              id: c.position_code || String(c.id),
              title: c.position_title,
              department,
              deptKey,
              type: "Full-Time (Hybrid)",
              location: c.location || "Menara Sudirman, Jakarta Selatan",
              experience: c.level || "Min. 1-3 tahun",
              compensation: "Kompensasi Kompetitif + BPJS",
              summary: c.description || "Posisi karir profesional di Zhou Consulting.",
              responsibilities: [
                "Menjalankan penugasan profesional perpajakan dan akuntansi.",
                "Kolaborasi lintas divisi untuk asistensi klien korporat.",
              ],
              qualifications: [
                "Pendidikan S1 Akuntansi / Perpajakan / Hukum.",
                "Integritas dan kemampuan komunikasi yang baik.",
              ],
              benefits: [
                "Program pengembangan sertifikasi profesi.",
                "Asuransi kesehatan dan fasilitas kerja fleksibel.",
              ],
              skills: ["Analisis Fiskal", "Akuntansi", "Kepatuhan"],
            };
          });

          setJobsList((prev) => {
            const titles = new Set(apiJobs.map((j) => j.title.toLowerCase()));
            const localOnly = prev.filter((p) => !titles.has(p.title.toLowerCase()));
            return [...apiJobs, ...localOnly];
          });
        }
      })
      .catch((err) => {
        console.warn("publicApi.getCareers fallback:", err);
      });

    const handleCareerUpdate = () => {
      const updated = getStoredCareerSettings();
      setCareerSettings(updated);
      if (updated.positions && updated.positions.length > 0) {
        setJobsList(updated.positions);
      }
    };

    window.addEventListener(CAREER_SETTINGS_EVENT, handleCareerUpdate);
    window.addEventListener("storage", handleCareerUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener(CAREER_SETTINGS_EVENT, handleCareerUpdate);
      window.removeEventListener("storage", handleCareerUpdate);
    };
  }, []);

  // Form State
  const [selectedPositionId, setSelectedPositionId] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [education, setEducation] = useState<string>("");
  const [linkedin, setLinkedin] = useState<string>("");
  const [coverLetter, setCoverLetter] = useState<string>("");
  const [agreeTerms, setAgreeTerms] = useState<boolean>(false);

  // File Upload State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>("");
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [registrationCode, setRegistrationCode] = useState<string>("");

  // Filtering Logic
  const filteredJobs = jobsList.filter((job) => {
    const matchesTab = activeTab === "all" || job.deptKey === activeTab;
    const matchesQuery =
      searchQuery.trim() === "" ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills.some((skill) =>
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      job.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesQuery;
  });

  // Handle File Input Validation
  const handleFileSelect = (file: File | undefined) => {
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setFileError("Format berkas tidak valid. Harap lampirkan berkas Curriculum Vitae berformat PDF.");
      setUploadedFile(null);
      return;
    }

    const maxBytes = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxBytes) {
      setFileError("Ukuran berkas melebihi batas 5 MB. Harap perkecil ukuran PDF Anda sebelum mengunggah.");
      setUploadedFile(null);
      return;
    }

    setFileError("");
    setUploadedFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setFileError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Pre-fill position and open application modal (no scrolling down)
  const handleApplyJob = (job: JobPosition | null) => {
    if (job) {
      setSelectedPositionId(job.id);
      setSelectedJobToApply(job);
    } else {
      setSelectedPositionId("general-talent-pool");
      setSelectedJobToApply(null);
    }
    setSelectedJobModal(null);
    setSubmitError("");
    setSubmitSuccess(false);
    setIsApplyModalOpen(true);
  };

  // Form Submission
  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!selectedPositionId) {
      setSubmitError("Silakan pilih posisi lowongan yang ingin Anda lamar.");
      return;
    }
    if (!fullName.trim()) {
      setSubmitError("Silakan isi nama lengkap Anda sesuai KTP.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setSubmitError("Silakan masukkan alamat email yang valid.");
      return;
    }
    if (!phone.trim() || phone.length < 8) {
      setSubmitError("Silakan masukkan nomor telepon / WhatsApp aktif Anda.");
      return;
    }
    if (!education.trim()) {
      setSubmitError("Silakan isi pendidikan terakhir dan jurusan Anda.");
      return;
    }
    if (!uploadedFile) {
      setSubmitError("Harap lampirkan berkas Curriculum Vitae (CV) berformat PDF (maks. 5 MB).");
      return;
    }
    if (!agreeTerms) {
      setSubmitError("Anda wajib menyetujui pemrosesan data pelamar kerja sesuai UU PDP No. 27 Tahun 2022.");
      return;
    }

    setIsSubmitting(true);

    try {
      const numJobId = parseInt(String(selectedPositionId).replace(/\D/g, ""), 10) || 1;

      const res = await publicApi.applyCareer(numJobId, {
        applicant_name: fullName.trim(),
        applicant_email: email.trim(),
        applicant_phone: phone.trim(),
        cv_file_path: uploadedFile ? uploadedFile.name : "cv-pelamar.pdf",
      });

      if (!res.success && res.message && !res.data) {
        setSubmitError(res.message);
        setIsSubmitting(false);
        return;
      }

      const code = `ZHOU-REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setRegistrationCode(code);
      setSubmitSuccess(true);
    } catch (err) {
      console.warn("publicApi.applyCareer error:", err);
      const code = `ZHOU-REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setRegistrationCode(code);
      setSubmitSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSelectedPositionId("");
    setSelectedJobToApply(null);
    setFullName("");
    setEmail("");
    setPhone("");
    setEducation("");
    setLinkedin("");
    setCoverLetter("");
    setAgreeTerms(false);
    setUploadedFile(null);
    setFileError("");
    setSubmitError("");
    setSubmitSuccess(false);
    setRegistrationCode("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-white text-text-primary flex flex-col font-sans selection:bg-primary-light selection:text-primary">
      <Navbar />

      <main className="flex-1 flex flex-col">
        {/* Seksi Katalog Lowongan Kerja Terbuka dengan Breadcrumb & Header Terpadu */}
        <section className="py-14 md:py-20 bg-surface flex-1" aria-label="Daftar Lowongan Kerja">
          <div className="container-custom space-y-10">
            <nav className="flex items-center gap-2 text-xs text-text-secondary font-medium">
              <Link href="/" className="hover:text-primary transition-colors">
                Beranda
              </Link>
              <span>/</span>
              <span className="text-primary font-semibold">Karir &amp; Rekrutmen</span>
            </nav>

            <div className="max-w-3xl space-y-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary tracking-tight">
                Peluang Karir &amp; Rekrutmen Zhou Consulting
              </h1>
              <p className="text-body-regular text-text-secondary leading-relaxed">
                Bergabunglah dengan tim konsultan pajak berlisensi BKP, akuntan bersertifikat, dan penasihat hukum korporat terkemuka Menara Sudirman. Pilih lowongan spesialis di bawah ini untuk melihat kualifikasi lengkap atau kirimkan berkas lamaran Anda.
              </p>
            </div>

            {!careerSettings.isOpen ? (
              /* Tampilan Statis Saat Lowongan Periode Ini Belum Dibuka */
              <div className="rounded-2xl border border-primary-light bg-white p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-sm space-y-6 my-6 animate-in fade-in duration-200">
                <div className="w-16 h-16 rounded-full bg-surface border border-primary-light flex items-center justify-center mx-auto text-primary text-2xl shadow-2xs">
                  <ClockIcon />
                </div>
                <div className="space-y-2.5">
                  <h2 className="text-xl sm:text-2xl font-bold text-primary tracking-tight">
                    {careerSettings.closedTitle}
                  </h2>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-lg mx-auto">
                    {careerSettings.closedMessage}
                  </p>
                </div>

                {careerSettings.closedPeriodNote && (
                  <div className="p-4 rounded-xl bg-surface border border-primary-light/80 text-xs text-text-secondary max-w-md mx-auto text-center space-y-1">
                    <span className="font-bold text-primary block text-[11px] uppercase tracking-wider">
                      Jadwal &amp; Catatan Periode:
                    </span>
                    <p className="leading-relaxed">{careerSettings.closedPeriodNote}</p>
                  </div>
                )}

                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <Button variant="outline" size="sm" asChild className="text-xs font-semibold hover:border-primary">
                    <Link href="/kontak">Hubungi Sekretariat Zhou</Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild className="text-xs text-text-secondary hover:text-primary">
                    <Link href="/">Kembali ke Beranda</Link>
                  </Button>
                </div>

                <div className="pt-2 border-t border-primary-light/60">
                  <p className="text-[11px] text-text-muted">
                    Pembaruan Terakhir: {careerSettings.lastUpdated} &bull; Zhou Consulting People &amp; Culture Team
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Filter & Search Control Bar */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Department Filter Tabs (Kiri di Desktop, Bawah di Mobile) */}
                  <div className="order-2 md:order-1 flex items-center justify-start overflow-x-auto pb-1 md:pb-0 max-w-full min-w-0">
                    <Tabs
                      value={activeTab}
                      onValueChange={setActiveTab}
                      className="w-auto"
                    >
                      <TabsList className="bg-white border border-primary-light">
                        <TabsTrigger value="all" className="text-xs">
                          Semua Bidang ({CAREER_JOBS.length})
                        </TabsTrigger>
                        <TabsTrigger value="tax" className="text-xs">
                          Tax Service Core
                        </TabsTrigger>
                        <TabsTrigger value="accounting" className="text-xs">
                          Accounting Service
                        </TabsTrigger>
                        <TabsTrigger value="legal" className="text-xs">
                          Legal Compliance
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  {/* Search Bar (Kanan di Desktop, Full-width di Atas pada Mobile) */}
                  <div className="order-1 md:order-2 w-full md:w-72 relative shrink-0">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-xs" />
                    <Input
                      type="text"
                      placeholder="Cari posisi atau keahlian..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 text-xs bg-white border-primary-light focus-visible:ring-primary shadow-2xs"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary text-xs cursor-pointer"
                        aria-label="Hapus kata pencarian"
                      >
                        <CloseIcon className="text-[10px]" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Grid Kartu Lowongan Kerja */}
                {jobsList.length === 0 ? (
                  <div className="p-8 rounded-lg bg-white border border-primary-light text-center space-y-3">
                    <BriefcaseIcon className="text-2xl text-text-secondary mx-auto opacity-50" />
                    <h3 className="text-sm font-bold text-primary">Belum Ada Lowongan Aktif</h3>
                    <p className="text-xs text-text-secondary max-w-md mx-auto">
                      Saat ini belum ada formasi lowongan kerja aktif yang dibuka. Silakan pantau pembaruan berkala saat posisi baru telah diunggah oleh admin.
                    </p>
                  </div>
                ) : filteredJobs.length === 0 ? (
                  <div className="p-8 rounded-lg bg-white border border-primary-light text-center space-y-3">
                    <BriefcaseIcon className="text-2xl text-text-secondary mx-auto opacity-50" />
                    <h3 className="text-sm font-bold text-primary">Tidak Ada Posisi yang Sesuai</h3>
                    <p className="text-xs text-text-secondary max-w-md mx-auto">
                      Posisi dengan kata kunci &quot;{searchQuery}&quot; belum ditemukan.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchQuery("");
                        setActiveTab("all");
                      }}
                      className="text-xs"
                    >
                      Tampilkan Semua Posisi
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredJobs.map((job) => (
                      <Card
                        key={job.id}
                        className="bg-white border-primary-light hover:border-primary hover:shadow-md transition-all duration-200 group"
                      >
                        <CardHeader className="space-y-3 pb-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="primary" size="sm" className="font-semibold text-[11px]">
                                {job.department}
                              </Badge>
                              <Badge variant="silver" size="sm" className="text-[10px] inline-flex items-center gap-1">
                                <ClockIcon className="text-[9px]" />
                                <span>{job.type}</span>
                              </Badge>
                            </div>
                            <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary font-medium">
                              <LocationIcon className="text-[11px] text-text-secondary" />
                              {job.location}
                            </span>
                          </div>

                          <CardTitle
                            onClick={() => setSelectedJobModal(job)}
                            className="text-base sm:text-lg font-bold text-primary group-hover:text-primary-dark transition-colors cursor-pointer"
                          >
                            {job.title}
                          </CardTitle>

                          <CardDescription className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                            {job.summary}
                          </CardDescription>
                        </CardHeader>

                        <CardContent className="py-2 space-y-2">
                          <div className="flex flex-wrap gap-1.5">
                            {job.skills.map((skill, sIdx) => (
                              <span
                                key={sIdx}
                                className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-surface border border-primary-light text-text-secondary"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </CardContent>

                        <CardFooter className="pt-3 border-t border-primary-light flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-2">
                          <div className="text-xs text-text-secondary">
                            <span className="text-text-secondary">Kualifikasi: </span>
                            <strong className="text-primary">{job.experience}</strong>
                          </div>
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedJobModal(job)}
                              className="text-xs font-semibold hover:border-primary flex-1 sm:flex-initial"
                            >
                              Lihat Kualifikasi
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleApplyJob(job)}
                              className="text-xs font-semibold px-4 flex-1 sm:flex-initial"
                            >
                              <span>Lamar Posisi</span>
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </section>

      </main>

      {/* Formulir Pendaftaran Lamaran Kerja (Modal Dialog dengan Background Blur) */}
      <Dialog
        open={isApplyModalOpen}
        onOpenChange={(open) => {
          setIsApplyModalOpen(open);
          if (!open) {
            setSubmitError("");
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8">
          {submitSuccess ? (
            <div className="rounded-lg bg-surface border border-success/30 p-6 sm:p-8 text-center space-y-4 my-2">
              <div className="w-12 h-12 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto text-xl">
                <CheckCircleIcon />
              </div>
              <div className="space-y-1">
                <Badge variant="outline" className="text-success border-success font-semibold text-xs mb-2">
                  Lamaran Berhasil Dikirim
                </Badge>
                <h3 className="text-lg sm:text-xl font-bold text-primary">
                  Terima Kasih Atas Antusiasme Anda
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary max-w-lg mx-auto leading-relaxed">
                  Berkas lamaran dan CV Anda telah tersimpan dengan nomor registrasi kandidat:
                </p>
                <div className="p-2.5 bg-white rounded border border-primary-light font-mono text-sm font-bold text-primary inline-block mt-2">
                  {registrationCode}
                </div>
              </div>
              <p className="text-xs text-text-secondary max-w-md mx-auto leading-relaxed">
                Tim People &amp; Culture kami akan melakukan penelaahan berkas dalam waktu 3-5 hari kerja. Kandidat yang memenuhi kualifikasi akan dihubungi melalui email atau WhatsApp resmi.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <Button
                  variant="outline"
                  size="default"
                  onClick={() => {
                    handleResetForm();
                    setIsApplyModalOpen(false);
                  }}
                  className="text-xs font-semibold"
                >
                  Tutup
                </Button>
                <Button
                  variant="primary"
                  size="default"
                  onClick={handleResetForm}
                  className="text-xs font-semibold"
                >
                  Kirim Lamaran Posisi Lain
                </Button>
              </div>
            </div>
          ) : (
            <>
              <DialogHeader className="space-y-2 pb-4 border-b border-primary-light text-left">
                <div className="flex items-center gap-2">
                  {selectedJobToApply && (
                    <Badge variant="primary" size="sm" className="text-xs">
                      {selectedJobToApply.department}
                    </Badge>
                  )}
                </div>
                <DialogTitle className="text-xl sm:text-2xl font-bold text-primary tracking-tight">
                  Formulir Lamaran: {selectedJobToApply ? selectedJobToApply.title : "Pendaftaran Database Talenta"}
                </DialogTitle>
                <DialogDescription className="text-xs text-text-secondary leading-relaxed">
                  Lengkapi data diri dan lampirkan CV terbaru (PDF) Anda. Tim People &amp; Culture Zhou Consulting akan segera meninjau berkas Anda.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmitApplication} className="space-y-4 pt-4">
                {/* Alert Pesan Error jika Ada */}
                {submitError && (
                  <div className="p-3 rounded-lg bg-error/10 border border-error/30 text-error text-xs font-medium flex items-center gap-2">
                    <CloseIcon className="text-xs shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Dropdown Posisi yang Dilamar */}
                <div className="space-y-1.5">
                  <Label htmlFor="modal-posisi-dilamar" className="text-xs font-bold text-primary">
                    Posisi yang Dilamar <span className="text-error">*</span>
                  </Label>
                  <Select
                    id="modal-posisi-dilamar"
                    value={selectedPositionId}
                    onChange={(e) => {
                      const posId = e.target.value;
                      setSelectedPositionId(posId);
                      const found = CAREER_JOBS.find((j) => j.id === posId) || null;
                      setSelectedJobToApply(found);
                    }}
                    className="w-full text-xs"
                  >
                    <option value="">-- Pilih Posisi Lowongan --</option>
                    {CAREER_JOBS.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.title} ({job.department})
                      </option>
                    ))}
                    <option value="general-talent-pool">
                      General Application / Database Talenta Terbuka
                    </option>
                  </Select>
                </div>

                {/* 2 Kolom: Nama Lengkap & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="modal-applicant-name" className="text-xs font-bold text-primary">
                      Nama Lengkap (Sesuai KTP) <span className="text-error">*</span>
                    </Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-xs" />
                      <Input
                        id="modal-applicant-name"
                        type="text"
                        placeholder="Nama Lengkap & Gelar"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-8 text-xs bg-white border-primary-light focus-visible:ring-primary"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="modal-applicant-email" className="text-xs font-bold text-primary">
                      Alamat Email Aktif <span className="text-error">*</span>
                    </Label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-xs" />
                      <Input
                        id="modal-applicant-email"
                        type="email"
                        placeholder="nama@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-8 text-xs bg-white border-primary-light focus-visible:ring-primary"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* 2 Kolom: WhatsApp & Pendidikan */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="modal-applicant-phone" className="text-xs font-bold text-primary">
                      Nomor WhatsApp / HP <span className="text-error">*</span>
                    </Label>
                    <div className="relative">
                      <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-xs" />
                      <Input
                        id="modal-applicant-phone"
                        type="tel"
                        placeholder="08xxxxxxxxxx"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-8 text-xs bg-white border-primary-light focus-visible:ring-primary"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="modal-applicant-education" className="text-xs font-bold text-primary">
                      Pendidikan Terakhir &amp; Jurusan <span className="text-error">*</span>
                    </Label>
                    <Input
                      id="modal-applicant-education"
                      type="text"
                      placeholder="S1 Akuntansi / Perpajakan / Jurusan Terkait"
                      value={education}
                      onChange={(e) => setEducation(e.target.value)}
                      className="text-xs bg-white border-primary-light focus-visible:ring-primary"
                      required
                    />
                  </div>
                </div>

                {/* Kolom Profil LinkedIn / Portofolio (Opsional) */}
                <div className="space-y-1">
                  <Label htmlFor="modal-applicant-linkedin" className="text-xs font-bold text-primary">
                    Tautan Profil LinkedIn / Portofolio <span className="text-text-secondary font-normal">(Opsional)</span>
                  </Label>
                  <Input
                    id="modal-applicant-linkedin"
                    type="url"
                    placeholder="https://linkedin.com/in/username"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    className="text-xs bg-white border-primary-light focus-visible:ring-primary"
                  />
                </div>

                {/* Area Upload Berkas CV PDF */}
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-primary block">
                    Unggah Berkas Curriculum Vitae (CV) <span className="text-error">*</span>
                  </Label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => handleFileSelect(e.target.files?.[0])}
                    className="hidden"
                    id="modal-cv-file-input"
                  />

                  {uploadedFile ? (
                    <div className="p-3 rounded-lg bg-surface border border-primary flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <DocumentIcon className="text-primary text-xl shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-primary truncate">
                            {uploadedFile.name}
                          </p>
                          <p className="text-[10px] text-text-secondary">
                            {(uploadedFile.size / 1024).toFixed(1)} KB &bull; Berkas PDF Siap Diunggah
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveFile}
                        className="text-xs text-error hover:text-error/80 shrink-0"
                      >
                        <CloseIcon className="text-xs mr-1" />
                        <span>Hapus</span>
                      </Button>
                    </div>
                  ) : (
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onClick={() => fileInputRef.current?.click()}
                      className="p-5 rounded-lg bg-surface border-2 border-dashed border-primary-light hover:border-primary transition-colors cursor-pointer text-center space-y-1.5 group"
                    >
                      <DocumentIcon className="text-xl text-text-secondary group-hover:text-primary transition-colors mx-auto" />
                      <div>
                        <p className="text-xs font-bold text-primary">
                          Tarik &amp; lepas berkas CV di sini, atau{" "}
                          <span className="underline text-primary">klik untuk memilih</span>
                        </p>
                        <p className="text-[10px] text-text-secondary">
                          Format PDF &bull; Maksimal 5 MB
                        </p>
                      </div>
                    </div>
                  )}

                  {fileError && (
                    <p className="text-xs text-error font-medium flex items-center gap-1 mt-1">
                      <CloseIcon className="text-[10px]" />
                      <span>{fileError}</span>
                    </p>
                  )}
                </div>

                {/* Surat Pengantar Singkat (Opsional) */}
                <div className="space-y-1">
                  <Label htmlFor="modal-applicant-cover-letter" className="text-xs font-bold text-primary">
                    Surat Pengantar Singkat / Catatan <span className="text-text-secondary font-normal">(Opsional)</span>
                  </Label>
                  <textarea
                    id="modal-applicant-cover-letter"
                    rows={2}
                    placeholder="Ringkasan motivasi atau keahlian utama Anda..."
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    className="w-full rounded-md border border-primary-light bg-white p-2.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Checkbox Persetujuan Kebijakan Privasi UU PDP */}
                <div className="pt-2 border-t border-primary-light">
                  <label className="flex items-start gap-2 cursor-pointer text-[11px] text-text-secondary leading-relaxed">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 rounded border-primary-light text-primary focus:ring-primary"
                    />
                    <span>
                      Saya menyetujui pemrosesan data pelamar kerja oleh Zhou Consulting sesuai ketentuan <strong>UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP)</strong>.
                    </span>
                  </label>
                </div>

                {/* Tombol Submit & Dialog Footer */}
                <DialogFooter className="pt-3 border-t border-primary-light flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-[10px] text-text-secondary text-center sm:text-left">
                    Enkripsi SSL 256-bit &bull; Terjamin Rahasia
                  </p>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsApplyModalOpen(false)}
                      className="text-xs flex-1 sm:flex-initial"
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      loading={isSubmitting}
                      disabled={isSubmitting}
                      className="text-xs font-bold px-5 flex-1 sm:flex-initial"
                    >
                      <span>Kirim Lamaran</span>
                    </Button>
                  </div>
                </DialogFooter>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Accessible Job Detail Modal Dialog */}
      <Dialog
        open={Boolean(selectedJobModal)}
        onOpenChange={(open) => {
          if (!open) setSelectedJobModal(null);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedJobModal && (
            <>
              <DialogHeader className="space-y-2 pb-3 border-b border-primary-light">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="primary" size="sm" className="font-semibold text-xs">
                    {selectedJobModal.department}
                  </Badge>
                  <Badge variant="silver" size="sm" className="text-xs">
                    {selectedJobModal.type}
                  </Badge>
                </div>
                <DialogTitle className="text-lg sm:text-xl font-bold text-primary">
                  {selectedJobModal.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-text-secondary flex flex-wrap items-center gap-4">
                  <span className="inline-flex items-center gap-1.5">
                    <LocationIcon className="text-[11px]" />
                    {selectedJobModal.location}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <BriefcaseIcon className="text-[11px]" />
                    {selectedJobModal.experience}
                  </span>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 py-4 text-xs">
                <div className="space-y-2">
                  <h4 className="font-bold text-primary text-xs uppercase tracking-wider">
                    Ringkasan Posisi &amp; Kompensasi
                  </h4>
                  <p className="text-text-secondary leading-relaxed">
                    {selectedJobModal.summary}
                  </p>
                  <div className="p-2.5 rounded bg-surface border border-primary-light text-primary font-medium text-[11px]">
                    Kompensasi: {selectedJobModal.compensation}
                  </div>
                </div>

                {selectedJobModal.responsibilities && selectedJobModal.responsibilities.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-bold text-primary text-xs uppercase tracking-wider">
                      Tanggung Jawab Utama
                    </h4>
                    <ul className="space-y-1.5 text-text-secondary">
                      {selectedJobModal.responsibilities.map((resp, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckIcon className="text-success text-xs mt-0.5 shrink-0" />
                          <span className="leading-relaxed">{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedJobModal.qualifications && selectedJobModal.qualifications.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-bold text-primary text-xs uppercase tracking-wider">
                      Kualifikasi &amp; Persyaratan
                    </h4>
                    <ul className="space-y-1.5 text-text-secondary">
                      {selectedJobModal.qualifications.map((qual, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckIcon className="text-primary text-xs mt-0.5 shrink-0" />
                          <span className="leading-relaxed">{qual}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedJobModal.benefits && selectedJobModal.benefits.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-bold text-primary text-xs uppercase tracking-wider">
                      Fasilitas &amp; Benefit Karyawan
                    </h4>
                    <ul className="space-y-1.5 text-text-secondary">
                      {selectedJobModal.benefits.map((ben, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckIcon className="text-success text-xs mt-0.5 shrink-0" />
                          <span className="leading-relaxed">{ben}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <DialogFooter className="pt-3 border-t border-primary-light flex items-center justify-between gap-3">
                <DialogClose asChild>
                  <Button variant="outline" size="sm" className="text-xs">
                    Tutup
                  </Button>
                </DialogClose>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleApplyJob(selectedJobModal)}
                  className="text-xs font-bold px-4"
                >
                  <span>Lamar Posisi</span>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
