"use client";

import React, { useState } from "react";
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
  DocumentIcon,
  LocationIcon,
  ClockIcon,
  ShieldTaxIcon,
  BuildingIcon,
  ArrowRightIcon,
} from "@/components/icons";

interface JobPosition {
  id: string;
  title: string;
  department: string;
  deptKey: "all" | "tax" | "accounting" | "advisory";
  type: string;
  location: string;
  experience: string;
  summary: string;
  skills: string[];
}

const JOBS: JobPosition[] = [
  {
    id: "senior-tax-coretax",
    title: "Senior Tax Consultant (Coretax Specialist)",
    department: "Tax Service Core",
    deptKey: "tax",
    type: "Full-Time",
    location: "Jakarta (Hybrid)",
    experience: "Min. 3 tahun di KAP/KKP",
    summary:
      "Memimpin penelaahan kepatuhan SPT Masa & Tahunan, memandu migrasi data klien ke ekosistem Coretax DJP 2026, dan menangani pendampingan SP2DK.",
    skills: ["Brevet AB / BKP", "Coretax DJP", "Audit SP2DK", "Tax Planning"],
  },
  {
    id: "staff-accounting-sak",
    title: "Staff Akuntansi & Pelaporan Keuangan (SAK)",
    department: "Accounting Service",
    deptKey: "accounting",
    type: "Full-Time",
    location: "Jakarta (On-Site)",
    experience: "Min. 1-2 tahun",
    summary:
      "Bertanggung jawab atas penjurnalan transaksi berpasangan harian, rekonsiliasi bank multi-rekening, dan penyusunan laporan keuangan terstandar SAK EP.",
    skills: ["S1 Akuntansi", "SAK EP / IFRS", "Rekonsiliasi Bank", "Jurnal Penyesuaian"],
  },
  {
    id: "financial-business-analyst",
    title: "Junior Financial & Business Analyst",
    department: "Business Advisory",
    deptKey: "advisory",
    type: "Full-Time",
    location: "Jakarta (Remote/Hybrid)",
    experience: "Fresh Graduate / 1 tahun",
    summary:
      "Membantu penyusunan model proyeksi arus kas, analisis kelayakan investasi (feasibility study), dan evaluasi rasio leverage modal kerja perbankan.",
    skills: ["Financial Modeling", "Rasio DSCR/DER", "Studi Kelayakan", "Valuasi"],
  },
  {
    id: "tax-compliance-associate",
    title: "Tax Compliance Associate (PPh & PPN)",
    department: "Tax Service Core",
    deptKey: "tax",
    type: "Full-Time",
    location: "Jakarta (On-Site)",
    experience: "Min. 1 tahun",
    summary:
      "Menangani ekualisasi faktur e-Faktur PPN, kalkulasi pemotongan PPh Pasal 21 skema TER bulanan, dan pengarsipan bukti potong unifikasi.",
    skills: ["Brevet A/B", "TER PMK 168", "e-Bupot Unifikasi", "e-Faktur PPN"],
  },
];

export function CareerSection() {
  const [selectedJob, setSelectedJob] = useState<JobPosition | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [applicantName, setApplicantName] = useState<string>("");
  const [applicantEmail, setApplicantEmail] = useState<string>("");
  const [applicantPhone, setApplicantPhone] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [fileError, setFileError] = useState<string>("");

  const filteredJobs =
    activeTab === "all"
      ? JOBS
      : JOBS.filter((job) => job.deptKey === activeTab);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setFileError("Hanya berkas berformat PDF yang diperbolehkan.");
        setFileName("");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setFileError("Ukuran berkas maksimal 5 MB.");
        setFileName("");
        return;
      }
      setFileError("");
      setFileName(file.name);
    }
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName || !applicantEmail || !applicantPhone || !fileName) {
      setFileError("Mohon lengkapi seluruh kolom formulir dan lampirkan berkas CV PDF Anda.");
      return;
    }
    setFormSubmitted(true);
  };

  const handleOpenModal = (job: JobPosition) => {
    setSelectedJob(job);
    setFormSubmitted(false);
    setApplicantName("");
    setApplicantEmail("");
    setApplicantPhone("");
    setFileName("");
    setFileError("");
  };

  const handleCloseModal = () => {
    setSelectedJob(null);
    setFormSubmitted(false);
    setApplicantName("");
    setApplicantEmail("");
    setApplicantPhone("");
    setFileName("");
    setFileError("");
  };

  return (
    <section
      id="karir"
      aria-label="Peluang Karir Zhou Consulting"
      className="py-16 md:py-20 lg:py-24 bg-white border-b border-primary-light scroll-mt-20"
    >
      <div className="container-custom space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            <Badge
              variant="silver"
              className="uppercase tracking-wider text-badge font-semibold py-1 px-3 inline-flex items-center gap-1.5"
            >
              <BriefcaseIcon className="text-xs" />
              <span>Informasi Karir</span>
            </Badge>
            <h2 className="text-[20px] leading-[28px] sm:text-[21px] sm:leading-[29px] lg:text-section-heading font-bold text-primary tracking-tight text-balance">
              Berkembang Bersama Tim Profesional Zhou Consulting
            </h2>
            <p className="text-[15px] leading-[24px] sm:text-body-large text-text-secondary leading-relaxed">
              Kami membuka kesempatan bagi talenta berdedikasi tinggi di bidang perpajakan, akuntansi, dan analisis keuangan untuk bergabung dalam kultur kerja yang kolaboratif dan berintegritas.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <Badge variant="outline" className="text-xs font-semibold py-1.5 px-3">
              {JOBS.length} Posisi Terbuka
            </Badge>
          </div>
        </div>

        {/* Department Filter Tabs */}
        <div className="flex items-center justify-start overflow-x-auto pb-2">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-auto"
          >
            <TabsList className="bg-surface">
              <TabsTrigger value="all" className="text-xs">
                Semua Bidang ({JOBS.length})
              </TabsTrigger>
              <TabsTrigger value="tax" className="text-xs">
                Perpajakan &amp; Coretax
              </TabsTrigger>
              <TabsTrigger value="accounting" className="text-xs">
                Akuntansi &amp; SAK
              </TabsTrigger>
              <TabsTrigger value="advisory" className="text-xs">
                Business Advisory
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Main Grid: Listings (8 cols) + Benefits (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Job Cards Column */}
          <div className="lg:col-span-8 space-y-4">
            {filteredJobs.map((job) => (
              <Card
                key={job.id}
                className="hover:border-primary hover:shadow-md transition-all duration-200 bg-white group"
              >
                <CardHeader className="space-y-3 pb-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" size="sm" className="font-semibold text-[11px]">
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
                    onClick={() => handleOpenModal(job)}
                    className="text-base sm:text-lg font-bold text-primary group-hover:text-primary-dark transition-colors cursor-pointer"
                  >
                    {job.title}
                  </CardTitle>

                  <CardDescription className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                    {job.summary}
                  </CardDescription>
                </CardHeader>

                <CardContent className="py-2">
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

                <CardFooter className="pt-3 border-t border-primary-light flex items-center justify-between mt-2">
                  <span className="text-xs text-text-secondary font-medium">
                    Kualifikasi: <strong>{job.experience}</strong>
                  </span>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleOpenModal(job)}
                    className="text-xs font-semibold inline-flex items-center gap-1.5"
                  >
                    <span>Lamar Posisi</span>
                    <ArrowRightIcon className="text-[10px]" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Culture & Benefits Sidebar */}
          <div className="lg:col-span-4 rounded-lg border border-primary-light bg-surface p-6 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <BuildingIcon className="text-primary text-sm" />
                <h3>Mengapa Berkarir di Zhou?</h3>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Kami membina talenta dengan standar kepatuhan tinggi, etika profesional, dan kompensasi yang kompetitif.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <CheckCircleIcon className="text-success text-sm shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-semibold text-primary">Sertifikasi &amp; Continuing Education</div>
                  <div className="text-text-secondary leading-relaxed">
                    Dukungan pembiayaan ujian sertifikasi Brevet Pajak AB/C, USKP, serta workshop reguler Coretax DJP.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircleIcon className="text-success text-sm shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-semibold text-primary">Eksposur Proyek Korporat Nyata</div>
                  <div className="text-text-secondary leading-relaxed">
                    Menangani studi kasus langsung entitas multi-sektor: manufaktur, jasa, ekspor-impor, dan holding group.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircleIcon className="text-success text-sm shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-semibold text-primary">Kultur Kerja Terstruktur &amp; Hibrida</div>
                  <div className="text-text-secondary leading-relaxed">
                    SOP digital terdokumentasi rapi, fleksibilitas kerja hybrid, dan apresiasi berbasis meritokrasi kinerja.
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-white border border-primary-light space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-primary">
                <ShieldTaxIcon className="text-xs text-primary" />
                <span>Pengiriman CV Terbuka (General)</span>
              </div>
              <p className="text-text-secondary text-[11px] leading-relaxed">
                Tidak menemukan posisi yang sesuai? Kirimkan resume PDF Anda ke tim People &amp; Culture kami:
              </p>
              <a
                href="mailto:career@zhouconsulting.id"
                className="font-bold text-primary hover:underline block text-xs"
              >
                career@zhouconsulting.id
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Accessible Job Application Dialog */}
      <Dialog
        open={Boolean(selectedJob)}
        onOpenChange={(open) => {
          if (!open) handleCloseModal();
        }}
      >
        <DialogContent className="max-w-lg">
          {selectedJob && (
            <>
              {!formSubmitted ? (
                <>
                  <DialogHeader className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="silver" size="sm" className="font-bold uppercase">
                        Formulir Lamaran
                      </Badge>
                      <span className="text-text-secondary">&bull;</span>
                      <span className="text-text-secondary text-xs">{selectedJob.department}</span>
                    </div>
                    <DialogTitle className="text-lg font-bold text-primary leading-snug">
                      {selectedJob.title}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-text-secondary leading-relaxed">
                      Lengkapi identitas diri Anda dan lampirkan curriculum vitae (CV) format PDF terbaru (maks. 5 MB).
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleApplySubmit} className="space-y-4 py-2 border-y border-primary-light">
                    <div className="space-y-1.5">
                      <Label htmlFor="app-name" className="text-xs font-semibold text-primary">
                        Nama Lengkap Sesuai KTP *
                      </Label>
                      <Input
                        id="app-name"
                        value={applicantName}
                        onChange={(e) => setApplicantName(e.target.value)}
                        placeholder="Contoh: Budi Santoso, S.Ak."
                        required
                        className="text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="app-email" className="text-xs font-semibold text-primary">
                          Alamat Email Aktif *
                        </Label>
                        <Input
                          id="app-email"
                          type="email"
                          value={applicantEmail}
                          onChange={(e) => setApplicantEmail(e.target.value)}
                          placeholder="budi@example.com"
                          required
                          className="text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="app-phone" className="text-xs font-semibold text-primary">
                          Nomor WhatsApp *
                        </Label>
                        <Input
                          id="app-phone"
                          type="tel"
                          value={applicantPhone}
                          onChange={(e) => setApplicantPhone(e.target.value)}
                          placeholder="081234567890"
                          required
                          className="text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="app-cv" className="text-xs font-semibold text-primary">
                        Lampirkan Berkas CV (PDF, maks. 5 MB) *
                      </Label>
                      <div className="border border-dashed border-silver hover:border-primary rounded-lg p-5 bg-surface text-center transition-colors">
                        <input
                          type="file"
                          id="app-cv"
                          accept=".pdf,application/pdf"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <label
                          htmlFor="app-cv"
                          className="cursor-pointer inline-flex flex-col items-center gap-1.5 text-text-secondary hover:text-primary"
                        >
                          <DocumentIcon className="text-2xl text-primary" />
                          <span className="font-semibold text-xs text-primary">
                            {fileName || "Pilih Berkas CV (PDF)"}
                          </span>
                          <span className="text-[11px] text-text-secondary">
                            Klik di sini untuk mengunggah dari perangkat Anda
                          </span>
                        </label>
                      </div>
                      {fileError && (
                        <p className="text-error text-xs font-medium mt-1">{fileError}</p>
                      )}
                    </div>

                    <DialogFooter className="flex gap-2 pt-2">
                      <DialogClose asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs"
                        >
                          Batal
                        </Button>
                      </DialogClose>
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        className="flex-1 text-xs font-semibold"
                      >
                        Kirim Lamaran Sekarang
                      </Button>
                    </DialogFooter>
                  </form>
                </>
              ) : (
                <div className="py-6 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-success/15 text-success flex items-center justify-center mx-auto text-2xl">
                    <CheckCircleIcon />
                  </div>
                  <div className="space-y-1.5">
                    <DialogTitle className="text-base font-bold text-primary">
                      Lamaran Berhasil Diterima!
                    </DialogTitle>
                    <DialogDescription className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
                      Terima kasih, <strong>{applicantName}</strong>. Berkas lamaran Anda untuk posisi <strong>{selectedJob.title}</strong> telah tersimpan di sistem rekrutmen Zhou Consulting. Tim HR kami akan menghubungi Anda melalui email atau WhatsApp untuk tahapan evaluasi selanjutnya.
                    </DialogDescription>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleCloseModal}
                    className="mt-2 text-xs font-semibold"
                  >
                    Selesai
                  </Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
