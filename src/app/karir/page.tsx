"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  CareerSettings,
  DEFAULT_CAREER_SETTINGS,
  getStoredCareerSettings,
  CAREER_SETTINGS_EVENT,
  JobPosition,
  hasAppliedToCareer,
  recordCareerApplication,
  saveStoredJobApplication,
} from "@/data/karirStorage";
import { isCmsItemDeleted } from "@/data/cmsDeletedStorage";
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
  CheckIcon,
  DocumentIcon,
  LocationIcon,
  ClockIcon,
  SearchIcon,
  CloseIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserIcon,
  AlertIcon,
} from "@/components/icons";
import { getCmsItemStatus, CMS_STATUS_UPDATED_EVENT } from "@/data/cmsStatusStorage";

export interface FormFieldErrors {
  position?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  education?: string;
  linkedin?: string;
  cv?: string;
  agreeTerms?: string;
}

const CAREER_JOBS: JobPosition[] = [];

export default function CareerPage() {
  const [careerSettings, setCareerSettings] = useState<CareerSettings>(DEFAULT_CAREER_SETTINGS);
  const [jobsList, setJobsList] = useState<JobPosition[]>(CAREER_JOBS);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedJobModal, setSelectedJobModal] = useState<JobPosition | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState<boolean>(false);
  const [selectedJobToApply, setSelectedJobToApply] = useState<JobPosition | null>(null);

  // Sync Career Settings with Backend API Database on mount & events + fetch Backend Careers
  useEffect(() => {
    let isMounted = true;
    const currentSettings = getStoredCareerSettings();
    setCareerSettings(currentSettings);
    if (currentSettings.positions && currentSettings.positions.length > 0) {
      setJobsList(currentSettings.positions);
    }

    // Ambil pengaturan status karir dari database server
    publicApi
      .getCareerSettings()
      .then((sRes) => {
        if (!isMounted || !sRes?.data) return;
        const cData = sRes.data;
        setCareerSettings((prev) => ({
          ...prev,
          isOpen: cData.isOpen,
          closedTitle: cData.closedTitle,
          closedMessage: cData.closedMessage,
          closedPeriodNote: cData.closedPeriodNote,
        }));
      })
      .catch(() => {});

    // Fetch live careers from Backend API
    publicApi
      .getCareers()
      .then((res) => {
        if (!isMounted) return;
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          const apiJobs: JobPosition[] = res.data
            .filter((c: CareerItem) => !isCmsItemDeleted(c.id, c.position_title, undefined, c.position_code))
            .map((c: CareerItem) => {
            const titleLower = (c.position_title || "").toLowerCase();
            const deptKey = (titleLower.includes("tax") || titleLower.includes("pajak")
              ? "tax"
              : titleLower.includes("account") || titleLower.includes("akuntan")
              ? "accounting"
              : titleLower.includes("legal") || titleLower.includes("hukum")
              ? "legal"
              : "business") as JobPosition["deptKey"];

            const department =
              deptKey === "tax"
                ? "Tax Service Core"
                : deptKey === "accounting"
                ? "Accounting Service"
                : deptKey === "legal"
                ? "Legal Compliance"
                : "Konsultasi Bisnis";

            return {
              id: c.position_code || String(c.id),
              backendId: c.id,
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
              status: getCmsItemStatus(c.position_code || String(c.id), c.position_title, c.is_active ? "Published" : "Draft", [c.id]),
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
        const mapped = updated.positions.map((p) => ({
          ...p,
          status: getCmsItemStatus(p.id, p.title, p.status === "Draft" ? "Draft" : "Published"),
        }));
        setJobsList(mapped);
      }
    };

    window.addEventListener(CAREER_SETTINGS_EVENT, handleCareerUpdate);
    window.addEventListener(CMS_STATUS_UPDATED_EVENT, handleCareerUpdate);
    window.addEventListener("storage", handleCareerUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener(CAREER_SETTINGS_EVENT, handleCareerUpdate);
      window.removeEventListener(CMS_STATUS_UPDATED_EVENT, handleCareerUpdate);
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

  // Submission & Validation State
  const [fieldErrors, setFieldErrors] = useState<FormFieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>("");
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [registrationCode, setRegistrationCode] = useState<string>("");
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const handleCopyRegistrationCode = (code: string) => {
    if (typeof window !== "undefined" && navigator?.clipboard) {
      navigator.clipboard.writeText(code).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
      }).catch(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
      });
    }
  };

  // Filtering Logic (Hanya tampilkan lowongan berstatus Published untuk publik)
  const publishedJobs = jobsList.filter((job) => job.status !== "Draft");

  const filteredJobs = publishedJobs.filter((job) => {
    const matchesTab =
      activeTab === "all" ||
      job.deptKey === activeTab ||
      (activeTab === "business" && (job.deptKey === "business" || job.department.toLowerCase().includes("bisnis")));
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
      const err = "Format CV harus PDF.";
      setFileError(err);
      setFieldErrors((prev) => ({ ...prev, cv: err }));
      setUploadedFile(null);
      return;
    }

    const maxBytes = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxBytes) {
      const err = "Ukuran CV melebihi batas yang diizinkan.";
      setFileError(err);
      setFieldErrors((prev) => ({ ...prev, cv: err }));
      setUploadedFile(null);
      return;
    }

    setFileError("");
    setFieldErrors((prev) => ({ ...prev, cv: undefined }));
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
    setFieldErrors((prev) => ({ ...prev, cv: undefined }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Validasi Seluruh Field Formulir Sebelum Dikirim ke Backend
  const validateForm = (): boolean => {
    const errors: FormFieldErrors = {};

    // 1. Validasi Posisi
    if (!selectedPositionId) {
      errors.position = "Silakan pilih posisi lowongan yang ingin Anda lamar.";
    } else if (selectedJobToApply && selectedJobToApply.status === "Draft") {
      errors.position = "Lowongan ini sudah tidak tersedia. Silakan pilih lowongan lain.";
    }

    // 2. Validasi Nama Lengkap
    if (!fullName.trim() || fullName.trim().length < 2) {
      errors.fullName = "Nama lengkap wajib diisi.";
    }

    // 3. Validasi Format Email
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    if (!email.trim() || !emailRegex.test(email.trim().toLowerCase())) {
      errors.email = "Masukkan alamat email yang valid.";
    }

    // 4. Validasi Nomor Telepon / WhatsApp
    const cleanPhone = phone.replace(/[\s\-()]/g, "");
    const phoneRegex = /^(\+?\d{9,15})$/;
    if (!phone.trim()) {
      errors.phone = "Nomor WhatsApp/HP wajib diisi.";
    } else if (!phoneRegex.test(cleanPhone)) {
      errors.phone = "Periksa kembali nomor WhatsApp/HP Anda.";
    }

    // 5. Validasi Pendidikan Terakhir & Jurusan
    if (!education.trim() || education.trim().length < 2) {
      errors.education = "Pendidikan terakhir dan jurusan wajib diisi.";
    }

    // 6. Validasi Tautan LinkedIn / Portofolio (Opsional jika diisi)
    if (linkedin.trim()) {
      try {
        const fullUrl = linkedin.trim().startsWith("http") ? linkedin.trim() : `https://${linkedin.trim()}`;
        const parsed = new URL(fullUrl);
        if (!parsed.hostname || !parsed.hostname.includes(".")) {
          errors.linkedin = "Masukkan tautan profil LinkedIn atau portofolio yang valid.";
        }
      } catch {
        errors.linkedin = "Masukkan tautan profil LinkedIn atau portofolio yang valid.";
      }
    }

    // 7. Validasi Berkas CV
    if (!uploadedFile) {
      errors.cv = "Silakan unggah CV sebelum mengirim lamaran.";
    } else if (fileError) {
      errors.cv = fileError;
    } else if (uploadedFile.type !== "application/pdf" && !uploadedFile.name.toLowerCase().endsWith(".pdf")) {
      errors.cv = "Format CV harus PDF.";
    } else if (uploadedFile.size > 5 * 1024 * 1024) {
      errors.cv = "Ukuran CV melebihi batas yang diizinkan.";
    }

    // 8. Validasi Persetujuan Pemrosesan Data UU PDP
    if (!agreeTerms) {
      errors.agreeTerms = "Centang persetujuan pemrosesan data untuk melanjutkan.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Pre-fill position and open application modal (state reset properly per vacancy)
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
    setFieldErrors({});
    setSubmitSuccess(false);
    setIsApplyModalOpen(true);
  };

  // Form Submission
  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    // 1. Validasi formulir secara komprehensif
    const isValid = validateForm();
    if (!isValid) {
      return;
    }

    // 2. Periksa apakah posisi yang dipilih masih aktif dan tersedia
    if (selectedJobToApply) {
      const isJobStillActive = publishedJobs.some(
        (j) => String(j.id) === String(selectedJobToApply.id) && j.status !== "Draft"
      );
      if (!isJobStillActive) {
        setSubmitError("Lowongan ini sudah tidak tersedia. Silakan pilih lowongan lain.");
        return;
      }
    }

    // 3. Tentukan target lowongan dan ID backend yang benar
    let targetJob: JobPosition | undefined;
    if (selectedJobToApply) {
      targetJob = selectedJobToApply;
    } else if (selectedPositionId && selectedPositionId !== "general-talent-pool") {
      targetJob = publishedJobs.find((j) => String(j.id) === String(selectedPositionId));
    }

    const targetPositionKey = targetJob?.id || selectedPositionId;

    // Tentukan ID numerik backend yang valid (bukan default 1 jika tidak ada ID)
    const validFallbackJob = publishedJobs.find((j) => j.backendId || /^\d+$/.test(j.id));
    const fallbackId = validFallbackJob?.backendId ?? (validFallbackJob?.id ? parseInt(validFallbackJob.id, 10) : 8);

    let numJobId: number;
    if (targetJob?.backendId) {
      numJobId = targetJob.backendId;
    } else if (targetJob?.id && /^\d+$/.test(targetJob.id)) {
      numJobId = parseInt(targetJob.id, 10);
    } else if (targetJob?.id) {
      const extracted = parseInt(String(targetJob.id).replace(/\D/g, ""), 10);
      numJobId = extracted || fallbackId;
    } else {
      numJobId = fallbackId;
    }

    const cleanEmail = email.trim().toLowerCase();

    // 4. Validasi duplikasi: satu email hanya dapat melamar satu kali pada lowongan yang sama
    const dupMsg = "Email ini sudah digunakan untuk melamar posisi ini. Silakan periksa kembali data lamaran Anda.";
    if (
      hasAppliedToCareer(targetPositionKey, cleanEmail) ||
      hasAppliedToCareer(numJobId, cleanEmail) ||
      (selectedJobToApply?.id && hasAppliedToCareer(selectedJobToApply.id, cleanEmail))
    ) {
      setSubmitError(dupMsg);
      setFieldErrors((prev) => ({ ...prev, email: dupMsg }));
      return;
    }

    setIsSubmitting(true);

    try {
      // 5. Validasi Server-Side melalui Route Handler Next.js & Backend dengan Berkas Fisik Asli
      const formData = new FormData();
      formData.append("job_id", String(numJobId));
      formData.append("position_title", targetJob?.title || "Pendaftaran Karir");
      formData.append("applicant_name", fullName.trim());
      formData.append("name", fullName.trim());
      formData.append("applicant_email", cleanEmail);
      formData.append("email", cleanEmail);
      formData.append("applicant_phone", phone.trim());
      formData.append("phone", phone.trim());
      if (education.trim()) formData.append("education", education.trim());
      if (linkedin.trim()) formData.append("linkedin", linkedin.trim());
      if (coverLetter.trim()) formData.append("cover_letter", coverLetter.trim());
      formData.append("agree_terms", String(agreeTerms));
      if (uploadedFile) {
        formData.append("file", uploadedFile);
        formData.append("cv", uploadedFile);
        formData.append("resume", uploadedFile);
      }

      const serverValidationPromise = fetch("/api/karir/apply", {
        method: "POST",
        body: formData,
      })
        .then((r) => r.json().catch(() => null))
        .catch(() => null);

      const remoteApiPromise = publicApi.applyCareer(numJobId, formData);

      const [serverRes, res] = await Promise.all([serverValidationPromise, remoteApiPromise]);

      // Periksa apakah server route mendeteksi duplikasi atau error
      if (serverRes && !serverRes.success) {
        if (serverRes.duplicate || (serverRes.message && serverRes.message.includes("sudah digunakan"))) {
          setSubmitError(dupMsg);
          setFieldErrors((prev) => ({ ...prev, email: dupMsg }));
          return;
        }
        if (serverRes.errors && typeof serverRes.errors === "object") {
          setFieldErrors((prev) => ({ ...prev, ...(serverRes.errors as FormFieldErrors) }));
          setSubmitError(serverRes.message || "Terdapat data yang belum sesuai. Silakan periksa formulir Anda.");
          return;
        }
      }

      if (!res.success) {
        const errorText = (res.message || res.error || "").toLowerCase();
        const rawErrors = typeof res.errors === "string" ? res.errors.toLowerCase() : "";

        // 1. Gangguan koneksi atau server
        if (
          res.error === "NETWORK_ERROR" ||
          errorText.includes("network") ||
          errorText.includes("failed to fetch") ||
          errorText.includes("gagal terhubung") ||
          errorText.includes("connection") ||
          errorText.includes("500") ||
          errorText.includes("502") ||
          errorText.includes("503")
        ) {
          setSubmitError("Lamaran belum berhasil dikirim karena gangguan koneksi atau server. Silakan coba kembali.");
        }
        // 2. Email sudah pernah digunakan pada lowongan yang sama
        else if (
          errorText.includes("already") ||
          errorText.includes("sudah") ||
          errorText.includes("pernah") ||
          errorText.includes("duplicate") ||
          errorText.includes("conflict")
        ) {
          setSubmitError(dupMsg);
          setFieldErrors((prev) => ({ ...prev, email: dupMsg }));
        }
        // 3. Posisi tidak tersedia (misal foreign key violated di DB atau deleted)
        else if (
          errorText.includes("not found") ||
          errorText.includes("tidak ditemukan") ||
          errorText.includes("tidak tersedia") ||
          errorText.includes("closed") ||
          rawErrors.includes("foreign key") ||
          rawErrors.includes("fkey")
        ) {
          setSubmitError("Lowongan ini sudah tidak tersedia. Silakan pilih lowongan lain.");
        }
        // 4. Validasi field spesifik dari backend (HTTP 422 / 400)
        else if (res.errors && typeof res.errors === "object") {
          const serverErrors: FormFieldErrors = {};
          Object.entries(res.errors).forEach(([field, msg]) => {
            const messageStr = Array.isArray(msg) ? msg[0] : String(msg);
            if (field.includes("name")) serverErrors.fullName = messageStr;
            else if (field.includes("email")) serverErrors.email = messageStr;
            else if (field.includes("phone")) serverErrors.phone = messageStr;
            else if (field.includes("cv") || field.includes("resume")) serverErrors.cv = messageStr;
            else if (field.includes("education")) serverErrors.education = messageStr;
          });
          setFieldErrors((prev) => ({ ...prev, ...serverErrors }));
          setSubmitError(res.message || "Terdapat data yang belum sesuai. Silakan periksa formulir Anda.");
        }
        // 5. Pesan error server lainnya (tanpa menampilkan stack trace teknis internal)
        else {
          setSubmitError(
            res.message && res.message !== "Gagal mengirimkan lamaran"
              ? res.message
              : "Lamaran belum berhasil dikirim karena gangguan koneksi atau server. Silakan coba kembali."
          );
        }
        // Data form & file CV tetap dipertahankan
        return;
      }

      // Berhasil mengirim lamaran
      recordCareerApplication(targetPositionKey, cleanEmail);
      recordCareerApplication(numJobId, cleanEmail);
      if (selectedJobToApply?.id) {
        recordCareerApplication(selectedJobToApply.id, cleanEmail);
      }

      const code = serverRes?.data?.registration_code || `ZHOU-REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      // Simpan data lamaran ke penyimpanan persisten agar langsung terintegrasi dengan Superadmin Lamaran Masuk
      saveStoredJobApplication({
        id: Date.now(),
        job_id: numJobId,
        applicant_name: fullName.trim(),
        applicant_email: cleanEmail,
        applicant_phone: phone.trim(),
        education: education.trim(),
        linkedin: linkedin.trim(),
        cover_letter: coverLetter.trim(),
        cv_file_path: uploadedFile ? URL.createObjectURL(uploadedFile) : "cv-pelamar.pdf",
        cv_file_name: uploadedFile ? uploadedFile.name : "cv-pelamar.pdf",
        applied_at: new Date().toISOString(),
        registration_code: code,
        job: {
          position_code: String(targetJob?.id || targetPositionKey),
          position_title: targetJob?.title || "Posisi Karir",
          department: targetJob?.department || "Tax Service Core",
        },
      });

      setRegistrationCode(code);
      setSubmitSuccess(true);
    } catch (err: unknown) {
      console.warn("publicApi.applyCareer unexpected error:", err);
      setSubmitError("Lamaran belum berhasil dikirim karena gangguan koneksi atau server. Silakan coba kembali.");
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
    setFieldErrors({});
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
            <div className="max-w-3xl space-y-4">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary tracking-tight">
                Peluang Karir &amp; Rekrutmen Zhou Consulting
              </h1>
              <p className="text-body-regular text-text-secondary leading-relaxed">
                Bergabunglah dengan tim konsultan pajak berlisensi BKP, akuntan bersertifikat, dan penasihat hukum korporat terkemuka Menara Sudirman. Pilih lowongan spesialis di bawah ini untuk melihat kualifikasi lengkap atau kirimkan berkas lamaran Anda.
              </p>
            </div>

            {!(careerSettings.isOpen || publishedJobs.length > 0) ? (
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
                          Semua Bidang ({publishedJobs.length})
                        </TabsTrigger>
                        <TabsTrigger value="tax" className="text-xs">
                          Tax Service Core ({publishedJobs.filter((j) => j.deptKey === "tax").length})
                        </TabsTrigger>
                        <TabsTrigger value="accounting" className="text-xs">
                          Accounting Service ({publishedJobs.filter((j) => j.deptKey === "accounting").length})
                        </TabsTrigger>
                        <TabsTrigger value="legal" className="text-xs">
                          Legal Compliance ({publishedJobs.filter((j) => j.deptKey === "legal").length})
                        </TabsTrigger>
                        <TabsTrigger value="business" className="text-xs">
                          Konsultasi Bisnis ({publishedJobs.filter((j) => j.deptKey === "business" || j.department.toLowerCase().includes("bisnis")).length})
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
                              <Badge variant="silver" size="sm" className="text-[10px]">
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
            setFieldErrors({});
            if (submitSuccess) {
              handleResetForm();
            }
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8">
          {submitSuccess ? (
            <div className="py-6 sm:py-8 text-center space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-bold text-primary tracking-tight">
                  Lamaran Berhasil Dikirim
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary max-w-md mx-auto leading-relaxed">
                  Terima kasih telah melamar di Zhou Consulting. Berkas lamaran Anda berhasil disimpan.
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block">
                  Nomor Registrasi Kandidat
                </span>
                <div className="inline-flex items-center justify-center gap-2.5 p-3 px-4 bg-surface rounded-xl border border-primary-light shadow-2xs">
                  <span className="font-mono text-base sm:text-lg font-bold text-primary tracking-wider select-all">
                    {registrationCode}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyRegistrationCode(registrationCode)}
                    className="text-xs px-2.5 py-1 rounded-md bg-white hover:bg-slate-100 border border-primary-light text-primary font-medium transition-colors cursor-pointer"
                    title="Salin nomor registrasi"
                  >
                    {isCopied ? "Tersalin!" : "Salin"}
                  </button>
                </div>
              </div>

              <p className="text-xs text-text-secondary max-w-md mx-auto leading-relaxed">
                Tim People &amp; Culture akan meninjau lamaran Anda. Kandidat yang memenuhi kualifikasi akan dihubungi melalui email atau WhatsApp resmi.
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <Button
                  variant="outline"
                  size="default"
                  onClick={() => {
                    handleResetForm();
                    setIsApplyModalOpen(false);
                  }}
                  className="text-xs font-semibold px-5"
                >
                  Tutup
                </Button>
                <Button
                  variant="primary"
                  size="default"
                  onClick={handleResetForm}
                  className="text-xs font-semibold px-5"
                >
                  Lamar Posisi Lain
                </Button>
              </div>
            </div>
          ) : (
            <>
              <DialogHeader className="space-y-2 pb-4 border-b border-primary-light text-left">
                <DialogTitle className="text-xl sm:text-2xl font-bold text-primary tracking-tight">
                  Formulir Lamaran: {selectedJobToApply ? selectedJobToApply.title : "Posisi Karir"}
                </DialogTitle>
                <DialogDescription className="text-xs text-text-secondary leading-relaxed">
                  Lengkapi data diri dan lampirkan CV terbaru (PDF) Anda. Tim People &amp; Culture Zhou Consulting akan segera meninjau berkas Anda.
                </DialogDescription>
              </DialogHeader>

              {/* Menentukan status ketersediaan posisi yang dipilih */}
              {(() => {
                const isSelectedJobValid = selectedJobToApply
                  ? publishedJobs.some(
                      (j) => String(j.id) === String(selectedJobToApply.id) && j.status !== "Draft"
                    )
                  : true;

                return (
                  <form onSubmit={handleSubmitApplication} noValidate className="space-y-4 pt-4">
                    {/* Alert Pesan Error Server / Umum di Bagian Atas Form */}
                    {submitError && (
                      <div className="p-3.5 rounded-lg bg-error/10 border border-error/30 text-error text-xs font-medium flex items-start gap-2.5 animate-in fade-in">
                        <AlertIcon className="text-sm shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <p className="font-bold">Gagal Mengirimkan Lamaran</p>
                          <p className="leading-relaxed">{submitError}</p>
                        </div>
                      </div>
                    )}

                    {/* Tampilan Posisi yang Dilamar: Detail Posisi Terpilih vs Dropdown Pemilihan Posisi */}
                    {selectedJobToApply ? (
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-primary block">
                          Posisi yang Dilamar
                        </Label>
                        <div
                          className={`p-3.5 rounded-lg border transition-colors ${
                            !isSelectedJobValid
                              ? "bg-amber-50/70 border-amber-300"
                              : "bg-surface border-primary-light"
                          } flex flex-col sm:flex-row sm:items-center justify-between gap-2.5`}
                        >
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="primary" size="sm" className="text-[10px] font-semibold">
                                {selectedJobToApply.department}
                              </Badge>
                              <Badge variant="outline" size="sm" className="text-[10px] text-primary border-primary/30 bg-white">
                                {selectedJobToApply.type}
                              </Badge>
                              <span className="text-[10px] text-text-secondary">
                                &bull; {selectedJobToApply.location}
                              </span>
                            </div>
                            <p className="text-sm font-bold text-primary">
                              {selectedJobToApply.title}
                            </p>
                          </div>
                          {!isSelectedJobValid && (
                            <div className="self-start sm:self-auto shrink-0">
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-md">
                                <AlertIcon className="text-[10px]" />
                                Tidak Tersedia
                              </span>
                            </div>
                          )}
                        </div>

                        {!isSelectedJobValid && (
                          <p className="text-xs text-amber-700 font-medium flex items-center gap-1.5 mt-1">
                            <AlertIcon className="text-[11px] shrink-0" />
                            <span>Lowongan ini sudah tidak tersedia. Silakan pilih lowongan lain.</span>
                          </p>
                        )}
                      </div>
                    ) : (
                      /* Alur Pemilihan Posisi Karir yang Sedang Dibuka */
                      <div className="space-y-1.5">
                        <Label htmlFor="modal-posisi-dilamar" className="text-xs font-bold text-primary">
                          Posisi yang Diminati <span className="text-error">*</span>
                        </Label>
                        <Select
                          id="modal-posisi-dilamar"
                          value={selectedPositionId}
                          onChange={(e) => {
                            const posId = e.target.value;
                            setSelectedPositionId(posId);
                            const found = publishedJobs.find((j) => j.id === posId);
                            if (found) setSelectedJobToApply(found);
                            if (fieldErrors.position) {
                              setFieldErrors((prev) => ({ ...prev, position: undefined }));
                            }
                          }}
                          className={`w-full text-xs bg-white ${
                            fieldErrors.position ? "border-error focus-visible:ring-error" : "border-primary-light focus-visible:ring-primary"
                          }`}
                        >
                          <option value="" disabled>
                            -- Pilih Posisi Lowongan --
                          </option>
                          {publishedJobs.map((job) => (
                            <option key={job.id} value={job.id}>
                              {job.title} ({job.department})
                            </option>
                          ))}
                        </Select>
                        {fieldErrors.position && (
                          <p className="text-xs text-error font-medium flex items-center gap-1 mt-1">
                            <AlertIcon className="text-[10px] shrink-0" />
                            <span>{fieldErrors.position}</span>
                          </p>
                        )}
                      </div>
                    )}

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
                            onChange={(e) => {
                              setFullName(e.target.value);
                              if (fieldErrors.fullName) {
                                setFieldErrors((prev) => ({ ...prev, fullName: undefined }));
                              }
                            }}
                            className={`pl-8 text-xs bg-white ${
                              fieldErrors.fullName
                                ? "border-error focus-visible:ring-error"
                                : "border-primary-light focus-visible:ring-primary"
                            }`}
                          />
                        </div>
                        {fieldErrors.fullName && (
                          <p className="text-xs text-error font-medium flex items-center gap-1 mt-1">
                            <AlertIcon className="text-[10px] shrink-0" />
                            <span>{fieldErrors.fullName}</span>
                          </p>
                        )}
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
                            onChange={(e) => {
                              setEmail(e.target.value);
                              if (fieldErrors.email) {
                                setFieldErrors((prev) => ({ ...prev, email: undefined }));
                              }
                            }}
                            className={`pl-8 text-xs bg-white ${
                              fieldErrors.email
                                ? "border-error focus-visible:ring-error"
                                : "border-primary-light focus-visible:ring-primary"
                            }`}
                          />
                        </div>
                        {fieldErrors.email && (
                          <p className="text-xs text-error font-medium flex items-center gap-1 mt-1">
                            <AlertIcon className="text-[10px] shrink-0" />
                            <span>{fieldErrors.email}</span>
                          </p>
                        )}
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
                            onChange={(e) => {
                              setPhone(e.target.value);
                              if (fieldErrors.phone) {
                                setFieldErrors((prev) => ({ ...prev, phone: undefined }));
                              }
                            }}
                            className={`pl-8 text-xs bg-white ${
                              fieldErrors.phone
                                ? "border-error focus-visible:ring-error"
                                : "border-primary-light focus-visible:ring-primary"
                            }`}
                          />
                        </div>
                        {fieldErrors.phone && (
                          <p className="text-xs text-error font-medium flex items-center gap-1 mt-1">
                            <AlertIcon className="text-[10px] shrink-0" />
                            <span>{fieldErrors.phone}</span>
                          </p>
                        )}
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
                          onChange={(e) => {
                            setEducation(e.target.value);
                            if (fieldErrors.education) {
                              setFieldErrors((prev) => ({ ...prev, education: undefined }));
                            }
                          }}
                          className={`text-xs bg-white ${
                            fieldErrors.education
                              ? "border-error focus-visible:ring-error"
                              : "border-primary-light focus-visible:ring-primary"
                          }`}
                        />
                        {fieldErrors.education && (
                          <p className="text-xs text-error font-medium flex items-center gap-1 mt-1">
                            <AlertIcon className="text-[10px] shrink-0" />
                            <span>{fieldErrors.education}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Kolom Profil LinkedIn / Portofolio */}
                    <div className="space-y-1">
                      <Label htmlFor="modal-applicant-linkedin" className="text-xs font-bold text-primary">
                        Tautan Profil LinkedIn / Portofolio
                      </Label>
                      <Input
                        id="modal-applicant-linkedin"
                        type="url"
                        placeholder="https://linkedin.com/in/username"
                        value={linkedin}
                        onChange={(e) => {
                          setLinkedin(e.target.value);
                          if (fieldErrors.linkedin) {
                            setFieldErrors((prev) => ({ ...prev, linkedin: undefined }));
                          }
                        }}
                        className={`text-xs bg-white ${
                          fieldErrors.linkedin
                            ? "border-error focus-visible:ring-error"
                            : "border-primary-light focus-visible:ring-primary"
                        }`}
                      />
                      {fieldErrors.linkedin && (
                        <p className="text-xs text-error font-medium flex items-center gap-1 mt-1">
                          <AlertIcon className="text-[10px] shrink-0" />
                          <span>{fieldErrors.linkedin}</span>
                        </p>
                      )}
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
                          className={`p-5 rounded-lg bg-surface border-2 border-dashed ${
                            fieldErrors.cv
                              ? "border-error bg-error/5"
                              : "border-primary-light hover:border-primary"
                          } transition-colors cursor-pointer text-center space-y-1.5 group`}
                        >
                          <DocumentIcon
                            className={`text-xl mx-auto transition-colors ${
                              fieldErrors.cv ? "text-error" : "text-text-secondary group-hover:text-primary"
                            }`}
                          />
                          <p className="text-[10px] text-text-secondary">
                            Format PDF &bull; Maksimal 5 MB
                          </p>
                        </div>
                      )}

                      {fieldErrors.cv && (
                        <p className="text-xs text-error font-medium flex items-center gap-1 mt-1">
                          <AlertIcon className="text-[10px] shrink-0" />
                          <span>{fieldErrors.cv}</span>
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
                        className="w-full rounded-md border border-primary-light bg-white p-2.5 text-xs text-slate-600 placeholder:text-slate-400 placeholder:text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    {/* Checkbox Persetujuan Kebijakan Privasi UU PDP */}
                    <div className="pt-2 border-t border-primary-light space-y-1">
                      <label className="flex items-start gap-2 cursor-pointer text-[11px] text-text-secondary leading-relaxed">
                        <input
                          type="checkbox"
                          checked={agreeTerms}
                          onChange={(e) => {
                            setAgreeTerms(e.target.checked);
                            if (fieldErrors.agreeTerms) {
                              setFieldErrors((prev) => ({ ...prev, agreeTerms: undefined }));
                            }
                          }}
                          className={`mt-0.5 rounded ${
                            fieldErrors.agreeTerms ? "border-error ring-1 ring-error" : "border-primary-light"
                          } text-primary focus:ring-primary`}
                        />
                        <span>
                          Saya menyetujui pemrosesan data pelamar kerja oleh Zhou Consulting sesuai ketentuan <strong>UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP)</strong>. <span className="text-error">*</span>
                        </span>
                      </label>
                      {fieldErrors.agreeTerms && (
                        <p className="text-xs text-error font-medium flex items-center gap-1 pl-5">
                          <AlertIcon className="text-[10px] shrink-0" />
                          <span>{fieldErrors.agreeTerms}</span>
                        </p>
                      )}
                    </div>

                    {/* Tombol Submit & Dialog Footer */}
                    <DialogFooter className="pt-3 border-t border-primary-light flex flex-col sm:flex-row items-center justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isSubmitting}
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
                        disabled={isSubmitting || (selectedJobToApply ? !isSelectedJobValid : false)}
                        className="text-xs font-bold px-5 flex-1 sm:flex-initial"
                      >
                        <span>{isSubmitting ? "Mengirimkan Lamaran..." : "Kirim Lamaran"}</span>
                      </Button>
                    </DialogFooter>
                  </form>
                );
              })()}
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
