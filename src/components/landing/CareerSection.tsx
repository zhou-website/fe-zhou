"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BriefcaseIcon, CheckCircleIcon, CloseIcon, DocumentIcon } from "@/components/icons";

export function CareerSection() {
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [applicantName, setApplicantName] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");
  const [applicantPhone, setApplicantPhone] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState("");

  const jobs = [
    {
      title: "Senior Tax Consultant (Coretax Specialist)",
      type: "Full-Time",
      location: "Jakarta / Hybrid",
      requirements: "Min. 3 tahun pengalaman di KAP/KKP, sertifikat Brevet AB/C, paham alur implementasi Coretax DJP.",
    },
    {
      title: "Staff Akuntansi & Pembukuan",
      type: "Full-Time",
      location: "Jakarta",
      requirements: "S1 Akuntansi, mahir rekonsiliasi bank, jurnal penyesuaian, dan kompilasi pelaporan SAK.",
    },
    {
      title: "Junior Financial Analyst",
      type: "Full-Time",
      location: "Jakarta / Remote",
      requirements: "S1 Keuangan/Manajemen, terampil financial modeling, analisis rasio solvabilitas, dan proyeksi kas.",
    },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setFileError("Hanya berkas berformat PDF yang diperbolehkan.");
        setFileName("");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setFileError("Ukuran berkas maksimal 5MB.");
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
      setFileError("Mohon lengkapi seluruh kolom formulir dan unggah berkas CV Anda.");
      return;
    }
    setFormSubmitted(true);
  };

  const closeModal = () => {
    setSelectedJob(null);
    setFormSubmitted(false);
    setApplicantName("");
    setApplicantEmail("");
    setApplicantPhone("");
    setFileName("");
    setFileError("");
  };

  return (
    <section id="karir" className="py-20 bg-white border-b border-primary-light scroll-mt-20">
      <div className="container-custom space-y-12">
        <div className="max-w-2xl space-y-3">
          <Badge variant="silver" className="uppercase tracking-wider text-[11px] font-bold">
            Informasi Karir
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
            Berkembang Bersama Tim Profesional Zhou Consulting
          </h2>
          <p className="text-text-secondary text-base leading-relaxed">
            Kami membuka kesempatan bagi talenta berdedikasi tinggi di bidang perpajakan, akuntansi, dan analisis keuangan untuk bergabung dalam kultur kerja yang kolaboratif dan berintegritas.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job Listings (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            {jobs.map((job, idx) => (
              <div
                key={idx}
                className="p-6 rounded-lg border border-primary-light bg-surface hover:border-primary transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-primary">{job.title}</h3>
                    <Badge variant="silver" className="text-[10px]">{job.type}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-text-secondary">
                    <span className="flex items-center gap-1.5">
                      <BriefcaseIcon className="text-[11px]" />
                      {job.location}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary max-w-xl">
                    {job.requirements}
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedJob(job.title)}
                  className="self-start sm:self-center text-xs font-semibold whitespace-nowrap"
                >
                  Lamar Posisi
                </Button>
              </div>
            ))}
          </div>

          {/* Culture & Benefits Highlight */}
          <div className="rounded-lg border border-primary-light bg-surface p-6 space-y-6">
            <h3 className="text-base font-bold text-primary">Mengapa Berkarir di Zhou?</h3>
            <div className="space-y-3.5 text-xs text-text">
              <div className="flex items-start gap-2.5">
                <CheckCircleIcon className="text-success text-sm flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-primary">Pengembangan Profesional Berkelanjutan</div>
                  <div className="text-text-secondary">Pelatihan sertifikasi Brevet, seminar fiskal, dan adopsi teknologi Coretax terdepan.</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircleIcon className="text-success text-sm flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-primary">Portofolio Klien Korporat Beragam</div>
                  <div className="text-text-secondary">Pengalaman langsung menangani kasus riil dari aneka sektor industri nasional.</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircleIcon className="text-success text-sm flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-primary">Lingkungan Kerja Berbasis Integritas</div>
                  <div className="text-text-secondary">Mendukung work-life balance dan apresiasi nyata atas kontribusi kinerja.</div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-md bg-white border border-primary-light text-xs text-text-secondary space-y-1">
              <div className="font-semibold text-primary">Kirimkan Berkas CV Terbuka</div>
              <div>Format PDF maksimal 5MB ke <span className="font-semibold text-primary">career@zhouconsulting.id</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Job Application Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-dark/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-2xl border border-primary-light max-w-lg w-full p-6 space-y-5 relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-text-secondary hover:text-primary p-1.5 focus:outline-none"
              aria-label="Tutup modal"
            >
              <CloseIcon className="text-lg" />
            </button>

            {!formSubmitted ? (
              <>
                <div>
                  <Badge variant="silver" className="text-[10px] uppercase font-bold mb-2">
                    Formulir Lamaran
                  </Badge>
                  <h3 className="text-lg font-bold text-primary">{selectedJob}</h3>
                  <p className="text-xs text-text-secondary mt-1">
                    Silakan isi data diri dan lampirkan curriculum vitae (CV) terbaru Anda.
                  </p>
                </div>

                <form onSubmit={handleApplySubmit} className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <Label htmlFor="app-name">Nama Lengkap</Label>
                    <Input
                      id="app-name"
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      placeholder="Masukkan nama lengkap Anda"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="app-email">Email</Label>
                      <Input
                        id="app-email"
                        type="email"
                        value={applicantEmail}
                        onChange={(e) => setApplicantEmail(e.target.value)}
                        placeholder="nama@email.com"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="app-phone">Nomor Telepon / WhatsApp</Label>
                      <Input
                        id="app-phone"
                        type="tel"
                        value={applicantPhone}
                        onChange={(e) => setApplicantPhone(e.target.value)}
                        placeholder="08xxxxxxxxxx"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="app-cv">Lampirkan Berkas CV (PDF, maks 5MB)</Label>
                    <div className="border border-dashed border-silver rounded-md p-4 bg-surface text-center">
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
                          {fileName || "Klik untuk memilih file PDF"}
                        </span>
                        <span className="text-[11px] text-silver">Maksimal ukuran file 5 MB</span>
                      </label>
                    </div>
                    {fileError && <p className="text-error text-xs">{fileError}</p>}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={closeModal}
                      className="flex-1"
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      className="flex-1"
                    >
                      Kirim Lamaran
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div className="py-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-success/15 text-success flex items-center justify-center mx-auto text-2xl">
                  <CheckCircleIcon />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-primary">Lamaran Berhasil Terkirim!</h4>
                  <p className="text-xs text-text-secondary max-w-sm mx-auto">
                    Terima kasih, <strong>{applicantName}</strong>. Berkas lamaran Anda untuk posisi <strong>{selectedJob}</strong> telah diterima tim HR Zhou Consulting. Kami akan menghubungi Anda melalui email atau WhatsApp.
                  </p>
                </div>
                <Button variant="primary" size="sm" onClick={closeModal} className="mt-2">
                  Tutup
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

