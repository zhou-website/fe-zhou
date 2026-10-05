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
  CheckCircleIcon,
  DocumentIcon,
  LocationIcon,
  ClockIcon,
} from "@/components/icons";
import { useLanguage } from "@/context/LanguageContext";
import {
  CareerSettings,
  JobPosition,
  DEFAULT_CAREER_SETTINGS,
  getStoredCareerSettings,
  CAREER_SETTINGS_EVENT,
} from "@/data/karirStorage";
import { publicApi, CareerItem } from "@/lib/api";

export function CareerSection() {
  const { t } = useLanguage();
  const [careerSettings, setCareerSettings] = useState<CareerSettings>(DEFAULT_CAREER_SETTINGS);
  const [jobs, setJobs] = useState<JobPosition[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedJob, setSelectedJob] = useState<JobPosition | null>(null);
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [applicantName, setApplicantName] = useState<string>("");
  const [applicantEmail, setApplicantEmail] = useState<string>("");
  const [applicantPhone, setApplicantPhone] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [fileError, setFileError] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    const settings = getStoredCareerSettings();
    setCareerSettings(settings);
    if (settings.positions && Array.isArray(settings.positions)) {
      setJobs(settings.positions);
    }

    const handleUpdate = () => {
      const s = getStoredCareerSettings();
      setCareerSettings(s);
      if (s.positions && Array.isArray(s.positions)) {
        setJobs(s.positions);
      }
    };

    window.addEventListener(CAREER_SETTINGS_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);

    // Fetch live backend careers
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
        }
      })
      .catch((err) => {
        console.warn("publicApi.getCareers fallback in CareerSection:", err);
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
      if (file.type !== "application/pdf") {
        setFileError("Harap unggah berkas dalam format PDF.");
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

  const isHiringOpen = careerSettings.isOpen && jobs.length > 0;

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
            <h2 className="text-[20px] leading-[28px] sm:text-[21px] sm:leading-[29px] lg:text-section-heading font-bold text-primary tracking-tight text-balance">
              {t.career.headline}
            </h2>
            <p className="text-[15px] leading-[24px] sm:text-body-large text-text-secondary leading-relaxed">
              {t.career.subheading}
            </p>
          </div>

          {isHiringOpen && (
            <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
              <Badge variant="outline" className="text-xs font-semibold py-1.5 px-3">
                {jobs.length} Posisi Terbuka
              </Badge>
            </div>
          )}
        </div>

        {!isHiringOpen ? (
          /* Tampilan Pengumuman Statis Saat Belum Ada Lowongan */
          <div className="max-w-3xl mx-auto rounded-2xl bg-surface border border-primary-light p-8 md:p-12 text-center space-y-5 shadow-xs">
            <div className="w-14 h-14 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center text-xl">
              <ClockIcon />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold text-primary tracking-tight">
                {careerSettings.closedTitle || "Lowongan Periode Ini Belum Dibuka"}
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-lg mx-auto">
                {careerSettings.closedMessage ||
                  "Saat ini seluruh posisi di Zhou Consulting telah terisi dan belum ada lowongan baru yang dibuka untuk publik."}
              </p>
            </div>
            {careerSettings.closedPeriodNote && (
              <div className="p-3.5 rounded-xl bg-white border border-primary-light/80 text-xs text-text-secondary max-w-md mx-auto text-center space-y-1">
                <span className="font-bold text-primary block text-[11px] uppercase tracking-wider">
                  Catatan Periode:
                </span>
                <p className="leading-relaxed">{careerSettings.closedPeriodNote}</p>
              </div>
            )}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Button variant="outline" size="sm" asChild className="text-xs font-semibold hover:border-primary">
                <Link href="/kontak">Hubungi Sekretariat</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild className="text-xs text-text-secondary hover:text-primary">
                <Link href="/karir">Lihat Portal Karir</Link>
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
                <TabsList className="bg-surface">
                  <TabsTrigger value="all" className="text-xs">
                    Semua Bidang ({jobs.length})
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

            {/* Main List: Listings */}
            <div className="max-w-4xl mx-auto items-start">
              <div className="space-y-4">
                {filteredJobs.slice(0, 3).map((job) => (
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

                      <CardDescription className="text-xs text-text-secondary leading-relaxed">
                        {job.summary}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3 pt-0">
                      <div className="flex flex-wrap gap-1.5">
                        {job.skills?.map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-surface text-text-secondary border border-primary-light"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </CardContent>

                    <CardFooter className="pt-3 border-t border-primary-light flex items-center justify-between">
                      <span className="text-xs text-text-secondary font-medium">
                        Pengalaman: {job.experience}
                      </span>
                      <Button
                        variant="card-action"
                        size="sm"
                        onClick={() => handleOpenModal(job)}
                        className="text-xs font-semibold"
                      >
                        Lihat Kualifikasi
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>

            {/* Portal Link */}
            <div className="flex justify-center -mt-2">
              <Button
                variant="outline"
                size="default"
                asChild
                className="text-xs font-bold gap-2 hover:border-primary"
              >
                <Link href="/karir">
                  <span>Lihat Seluruh Lowongan</span>
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Modal Detail & Lamaran */}
      <Dialog open={Boolean(selectedJob)} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedJob && (
            <>
              <DialogHeader className="space-y-2 border-b border-primary-light pb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" size="sm">
                    {selectedJob.department}
                  </Badge>
                  <span className="text-xs text-text-secondary">{selectedJob.type}</span>
                  <span className="text-xs text-text-secondary">&bull;</span>
                  <span className="text-xs text-text-secondary">{selectedJob.location}</span>
                </div>
                <DialogTitle className="text-lg sm:text-xl font-bold text-primary">
                  {selectedJob.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-text-secondary">
                  Persyaratan Pengalaman: {selectedJob.experience}
                </DialogDescription>
              </DialogHeader>

              {formSubmitted ? (
                <div className="py-8 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-success/10 text-success mx-auto flex items-center justify-center text-2xl">
                    <CheckCircleIcon />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-primary">
                      Lamaran Berhasil Terkirim
                    </h4>
                    <p className="text-xs text-text-secondary max-w-xs mx-auto">
                      Terima kasih, <strong>{applicantName}</strong>. Berkas Anda untuk posisi <strong>{selectedJob.title}</strong> telah kami terima. Tim HR Zhou Consulting akan meninjau kualifikasi Anda.
                    </p>
                  </div>
                  <Button variant="primary" size="sm" onClick={handleCloseModal} className="text-xs mt-2">
                    Selesai
                  </Button>
                </div>
              ) : (
                <div className="space-y-5 py-4 text-xs">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                      Ringkasan Tanggung Jawab
                    </h4>
                    <p className="text-text-secondary leading-relaxed">
                      {selectedJob.summary}
                    </p>
                  </div>

                  <form onSubmit={handleApplySubmit} className="space-y-4 py-2 border-y border-primary-light">
                    <div className="space-y-1.5">
                      <Label htmlFor="app-name" className="text-xs font-semibold text-primary">
                        Nama Lengkap Sesuai KTP *
                      </Label>
                      <Input
                        id="app-name"
                        value={applicantName}
                        onChange={(e) => setApplicantName(e.target.value)}
                        placeholder="Nama Lengkap & Gelar"
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
                          placeholder="pelamar@email.com"
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
                          placeholder="08xxxxxxxxxx"
                          required
                          className="text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="app-cv" className="text-xs font-semibold text-primary">
                        Unggah Resume / CV (PDF, Maks. 5 MB) *
                      </Label>
                      <div className="flex items-center gap-2">
                        <label
                          htmlFor="app-cv"
                          className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-primary-light bg-surface hover:bg-surface/80 text-xs font-semibold text-primary transition-colors"
                        >
                          <DocumentIcon className="text-xs" />
                          <span>Pilih Berkas PDF</span>
                        </label>
                        <input
                          id="app-cv"
                          type="file"
                          accept=".pdf,application/pdf"
                          onChange={handleFileChange}
                          className="hidden"
                          required
                        />
                        {fileName && (
                          <span className="text-xs text-text-secondary truncate max-w-[200px]">
                            {fileName}
                          </span>
                        )}
                      </div>
                      {fileError && (
                        <p className="text-[11px] text-error">{fileError}</p>
                      )}
                    </div>

                    <DialogFooter className="pt-3 border-t border-primary-light">
                      <DialogClose asChild>
                        <Button type="button" variant="outline" size="sm" className="text-xs">
                          Batal
                        </Button>
                      </DialogClose>
                      <Button type="submit" variant="primary" size="sm" className="text-xs font-semibold">
                        Kirim Berkas Lamaran
                      </Button>
                    </DialogFooter>
                  </form>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
