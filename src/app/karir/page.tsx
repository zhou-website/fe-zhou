"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  CareerSettings,
  DEFAULT_CAREER_SETTINGS,
  getStoredCareerSettings,
  CAREER_SETTINGS_EVENT,
} from "@/data/karirStorage";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
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

interface JobPosition {
  id: string;
  title: string;
  department: string;
  deptKey: "all" | "tax" | "accounting" | "legal";
  type: string;
  location: string;
  experience: string;
  compensation: string;
  summary: string;
  responsibilities: string[];
  qualifications: string[];
  benefits: string[];
  skills: string[];
}

const CAREER_JOBS: JobPosition[] = [
  {
    id: "senior-tax-coretax",
    title: "Senior Tax Consultant (Coretax & SP2DK Specialist)",
    department: "Tax Service Core",
    deptKey: "tax",
    type: "Full-Time (Hybrid)",
    location: "Menara Sudirman, Jakarta Selatan",
    experience: "Min. 3-5 tahun di KKP/KAP",
    compensation: "Kompensasi Kompetitif + Tunjangan Kinerja & BPJS",
    summary:
      "Memimpin audit kepatuhan SPT Masa & Tahunan badan, memandu migrasi data klien ke ekosistem Coretax DJP 2026, dan mendampingi klarifikasi SP2DK hingga pemeriksaan DJP.",
    responsibilities: [
      "Mengelola portofolio kepatuhan perpajakan berkala (PPh 21/26, PPh 23/26, PPh Final, dan PPN) untuk klien multi-sektor.",
      "Memimpin simulasi dan asistensi migrasi data perpajakan korporat ke sistem Coretax DJP 2026.",
      "Menyusun tanggapan resmi dan strategi klarifikasi Surat Permintaan Penjelasan atas Data dan/atau Keterangan (SP2DK).",
      "Melakukan review ekualisasi omzet vs DPP PPN dan biaya vs objek PPh pemotongan/pemungutan.",
      "Membimbing associate junior dalam penyiapan kertas kerja kepatuhan dan rekonsiliasi fiskal.",
    ],
    qualifications: [
      "Pendidikan minimal S1 Akuntansi atau Perpajakan dari universitas terakreditasi.",
      "Memiliki sertifikasi Brevet Pajak AB & C, diutamakan memiliki sertifikat BKP (Konsultan Pajak).",
      "Pengalaman kerja minimal 3-5 tahun di Kantor Konsultan Pajak (KKP) atau KAP ternama.",
      "Menguasai regulasi terbaru UU HPP, PMK 81/2024, dan alur administrasi Coretax DJP.",
      "Memiliki integritas tinggi, kemampuan komunikasi analitis, dan kemampuan representasi klien.",
    ],
    benefits: [
      "Fasilitas pembiayaan berkelanjutan untuk sertifikasi profesi USKP & PPL berlisensi IKPI.",
      "Skema kerja fleksibel hybrid (3 hari kantor / 2 hari remote).",
      "Asuransi kesehatan swasta dan BPJS Ketenagakerjaan lengkap.",
      "Bonus kinerja berbasis keberhasilan penanganan penugasan advisory korporat.",
    ],
    skills: ["Coretax DJP 2026", "Mitigasi SP2DK", "Brevet AB / BKP", "Tax Planning", "Ekualisasi SPT"],
  },
  {
    id: "junior-auditor-sak",
    title: "Junior Auditor & Financial Reporting Specialist",
    department: "Accounting Service",
    deptKey: "accounting",
    type: "Full-Time (On-Site)",
    location: "Menara Sudirman, Jakarta Selatan",
    experience: "Min. 1-2 tahun / Fresh Graduate Berprestasi",
    compensation: "Gaji Pokok + Uang Makan, Transport & BPJS",
    summary:
      "Bertanggung jawab atas kompilasi laporan keuangan terstandar SAK EP/IFRS, rekonsiliasi bank multi-rekening, penataan bagan akun (COA), dan asistensi kertas kerja audit KAP.",
    responsibilities: [
      "Menjalankan penjurnalan transaksi berpasangan harian dan rekonsiliasi rekening koran perbankan multi-valuta.",
      "Menyusun laporan posisi keuangan, laba rugi komprehensif, dan arus kas sesuai SAK Entitas Privat (SAK EP).",
      "Melakukan review periodik atas bagan akun standar (Chart of Accounts) klien korporat.",
      "Menyiapkan dokumen pendukung dan kertas kerja asistensi pemeriksaan auditor eksternal (KAP).",
      "Melakukan inventarisasi aset tetap dan perhitungan amortisasi/penyusutan fiskal vs komersial.",
    ],
    qualifications: [
      "S1 Akuntansi dengan IPK minimal 3.20 dari universitas terkemuka.",
      "Memahami standar akuntansi keuangan (SAK EP, SAK EMKM, dan pengenalan IFRS).",
      "Mahir mengoperasikan software akuntansi korporat (Accurate, Zahir, SAP, atau Xero) dan Advanced Excel.",
      "Memiliki pemahaman dasar mengenai keterkaitan jurnal akuntansi komersial dengan penyesuaian fiskal.",
      "Teliti, disiplin terhadap tenggat waktu pelaporan bulanan, dan memiliki etika kerja tinggi.",
    ],
    benefits: [
      "Dukungan pendaftaran dan pembiayaan ujian profesi Chartered Accountant (CA) & BAP.",
      "Program mentoring intensif 1-on-1 bersama Akuntan Beregister CA dan Partner Senior.",
      "Lingkungan kerja kolaboratif di kawasan sentra bisnis Sudirman, Jakarta Selatan.",
      "Jenjang karir transparan menuju posisi Senior Financial Analyst dalam 2 tahun.",
    ],
    skills: ["SAK EP / IFRS", "Bank Reconciliation", "COA Review", "General Ledger", "Kertas Kerja KAP"],
  },
  {
    id: "corporate-legal-contract",
    title: "Corporate Legal & Contract Specialist",
    department: "Legal Services",
    deptKey: "legal",
    type: "Full-Time (Hybrid)",
    location: "Menara Sudirman, Jakarta Selatan",
    experience: "Min. 2-3 tahun di Law Firm / Legal Korporat",
    compensation: "Kompensasi Kompetitif + Tunjangan Legal & BPJS",
    summary:
      "Menangani drafting & telaah kontrak komersial korporat, perizinan berusaha OSS-RBA, kepatuhan ketenagakerjaan, serta audit tata kelola kepatuhan UU PDP No. 27 Tahun 2022.",
    responsibilities: [
      "Menyusun dan menelaah (drafting & reviewing) kontrak bisnis, perjanjian kerja sama (MOU), NDA, dan perjanjian kerja.",
      "Mengurus perizinan berusaha berbasis risiko melalui sistem Online Single Submission (OSS-RBA) dan AHU Kemenkumham.",
      "Melakukan audit kepatuhan korporat terhadap regulasi ketenagakerjaan (PP/PKB) dan UU Pelindungan Data Pribadi (UU PDP).",
      "Menyusun legal opinion dan memo analisis risiko hukum atas restrukturisasi bisnis atau merger & akuisisi klien.",
      "Berkoordinasi dengan instansi pemerintah, notaris, dan mitra hukum eksternal.",
    ],
    qualifications: [
      "Pendidikan S1 Ilmu Hukum (Sarjana Hukum) dari perguruan tinggi terakreditasi A.",
      "Pengalaman kerja 2-3 tahun di Law Firm korporat atau divisi legal entitas swasta skala menengah-besar.",
      "Telah lulus Pendidikan Khusus Profesi Advokat (PKPA) dan Ujian Profesi Advokat (UPA) merupakan nilai plus.",
      "Memiliki pemahaman mendalam tentang hukum perseroan terbatas (UU PT), ketenagakerjaan, dan OSS-RBA.",
      "Kemampuan legal drafting dalam bahasa Indonesia dan bahasa Inggris secara lugas dan teliti.",
    ],
    benefits: [
      "Dukungan keanggotaan organisasi profesi advokat (PERADI) dan continuing legal education.",
      "Fasilitas kerja hybrid dengan fleksibilitas koordinasi dokumen digital.",
      "Asuransi kesehatan komprehensif rawat inap & jalan.",
      "Eksposur penanganan transaksi komersial strategis lintas industri.",
    ],
    skills: ["Corporate Contract", "OSS-RBA", "UU PDP 2022", "Legal Due Diligence", "Perizinan Korporat"],
  },
  {
    id: "tax-compliance-associate",
    title: "Tax Compliance Associate (PPh & PPN)",
    department: "Tax Service Core",
    deptKey: "tax",
    type: "Full-Time (On-Site)",
    location: "Menara Sudirman, Jakarta Selatan",
    experience: "Min. 1 tahun / Fresh Graduate Brevet A/B",
    compensation: "Gaji Pokok + Uang Makan & BPJS Ketenagakerjaan",
    summary:
      "Menangani administrasi teknis operasional perpajakan klien: pembuatan faktur pajak e-Faktur PPN, kalkulasi pemotongan PPh Pasal 21 skema TER, dan pengelolaan bukti potong unifikasi.",
    responsibilities: [
      "Mengelola penerbitan dan rekonsiliasi faktur pajak keluaran dan masukan pada aplikasi e-Faktur DJP.",
      "Menghitung pemotongan PPh Pasal 21 pegawai tetap & bukan pegawai menggunakan skema Tarif Efektif Rata-rata (TER).",
      "Menerbitkan bukti pemotongan PPh Unifikasi (PPh 23, 22, 15, dan PPh Final Pasal 4 ayat 2) melalui e-Bupot.",
      "Membuat kode billing pembayaran pajak (e-Billing) dan memverifikasi Bukti Penerimaan Negara (BPN).",
      "Menyiapkan draft SPT Masa dan mengarsipkan Bukti Penerimaan Elektronik (BPE) resmi DJP.",
    ],
    qualifications: [
      "Pendidikan D3 / S1 Perpajakan atau Akuntansi.",
      "Memiliki sertifikat Brevet Pajak A & B terverifikasi.",
      "Memahami skema TER PMK 168/2023 dan alur kepatuhan SPT Masa PPh & PPN.",
      "Terampil mengoperasikan sistem DJP Online, e-Faktur, dan e-Bupot Unifikasi.",
      "Disiplin terhadap tenggat waktu pelaporan tanggal 20 dan akhir bulan fiskal.",
    ],
    benefits: [
      "Pelatihan langsung dan workshop berkala simulasi operasional sistem Coretax 2026.",
      "Jalur karir terstruktur menuju posisi Junior Tax Consultant dalam 18 bulan.",
      "Tunjangan lembur pada periode puncak pelaporan SPT Masa/Tahunan.",
      "Paket perlindungan BPJS Kesehatan dan BPJS Ketenagakerjaan resmi.",
    ],
    skills: ["TER PMK 168", "e-Bupot Unifikasi", "e-Faktur PPN", "e-Billing DJP", "SPT Masa"],
  },
];

export default function CareerPage() {
  const [careerSettings, setCareerSettings] = useState<CareerSettings>(DEFAULT_CAREER_SETTINGS);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedJobModal, setSelectedJobModal] = useState<JobPosition | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState<boolean>(false);
  const [selectedJobToApply, setSelectedJobToApply] = useState<JobPosition | null>(null);

  // Sync Career Settings with localStorage on mount & events
  useEffect(() => {
    setCareerSettings(getStoredCareerSettings());

    const handleCareerUpdate = () => {
      setCareerSettings(getStoredCareerSettings());
    };

    window.addEventListener(CAREER_SETTINGS_EVENT, handleCareerUpdate);
    window.addEventListener("storage", handleCareerUpdate);
    return () => {
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
  const filteredJobs = CAREER_JOBS.filter((job) => {
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
  const handleSubmitApplication = (e: React.FormEvent) => {
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

    // Simulate reliable dispatch
    setTimeout(() => {
      setIsSubmitting(false);
      const code = `ZHOU-REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setRegistrationCode(code);
      setSubmitSuccess(true);
    }, 1200);
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
              <Badge variant="silver" className="uppercase tracking-wider text-badge font-semibold py-1 px-3">
                Talenta &amp; Karir
              </Badge>
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
                  <Badge variant="silver" className="text-xs uppercase tracking-wider font-semibold py-1 px-3">
                    Status: Rekrutmen Belum Dibuka
                  </Badge>
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
                {filteredJobs.length === 0 ? (
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
                Tim People &amp; Culture kami akan melakukan penelaahan berkas dalam waktu 3–5 hari kerja. Kandidat yang memenuhi kualifikasi akan dihubungi melalui email atau WhatsApp resmi.
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
                  <Badge variant="silver" className="uppercase tracking-wider text-badge font-semibold py-0.5 px-2.5">
                    Pendaftaran Online
                  </Badge>
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
                  <select
                    id="modal-posisi-dilamar"
                    value={selectedPositionId}
                    onChange={(e) => {
                      const posId = e.target.value;
                      setSelectedPositionId(posId);
                      const found = CAREER_JOBS.find((j) => j.id === posId) || null;
                      setSelectedJobToApply(found);
                    }}
                    className="w-full rounded-md border border-primary-light bg-white px-3 py-2 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
                  </select>
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
                        placeholder="cth. Hendra Wijaya, S.E."
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
                        placeholder="cth. hendra.wijaya@email.com"
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
                        placeholder="cth. 081234567890"
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
                      placeholder="cth. S1 Akuntansi - PTN/PTS"
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
                    placeholder="cth. https://linkedin.com/in/hendrawijaya"
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
