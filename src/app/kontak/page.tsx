"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  LocationIcon,
  PhoneIcon,
  WhatsappIcon,
  EnvelopeIcon,
  ClockIcon,
  CheckCircleIcon,
  ShieldTaxIcon,
  BookIcon,
  BriefcaseIcon,
  UserIcon,
  BuildingIcon,
} from "@/components/icons";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    service: "tax",
    message: "",
    agreeTerms: false,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [ticketNumber, setTicketNumber] = useState<string>("");

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "Nama lengkap PIC wajib diisi.";
    if (!formData.email.trim()) {
      errors.email = "Alamat email resmi wajib diisi.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Format alamat email tidak valid.";
    }
    if (!formData.phone.trim() || formData.phone.length < 8) {
      errors.phone = "Nomor WhatsApp / telepon aktif wajib diisi.";
    }
    if (!formData.message.trim()) {
      errors.message = "Rincian kebutuhan konsultasi wajib diisi.";
    }
    if (!formData.agreeTerms) {
      errors.agreeTerms = "Anda wajib menyetujui pemrosesan data sesuai UU PDP No. 27 Tahun 2022.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const code = `ZHOU-INQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setTicketNumber(code);
      setSubmitted(true);
    }, 1200);
  };

  const resetForm = () => {
    setSubmitted(false);
    setFormData({
      name: "",
      company: "",
      email: "",
      phone: "",
      service: "tax",
      message: "",
      agreeTerms: false,
    });
    setFormErrors({});
    setTicketNumber("");
  };

  return (
    <div className="min-h-screen bg-white text-text-primary flex flex-col font-sans selection:bg-primary-light selection:text-primary">
      <Navbar />

      <main className="flex-1">
        {/* Breadcrumb Navigation */}
        <section className="bg-surface border-b border-primary-light/60 py-3.5" aria-label="Breadcrumb">
          <div className="container-custom">
            <nav className="flex items-center gap-2 text-xs text-text-secondary font-medium">
              <Link href="/" className="hover:text-primary transition-colors">
                Beranda
              </Link>
              <span>/</span>
              <span className="text-primary font-semibold">Kontak &amp; Saluran Operasional</span>
            </nav>
          </div>
        </section>

        {/* Main 2-Column Split Section */}
        <section className="py-10 md:py-14 bg-white" aria-label="Detail Kantor dan Formulir Permohonan">
          <div className="container-custom">
            <h1 className="sr-only">Hubungi Kantor Pusat Zhou Consulting Sudirman</h1>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Office Details, Map & Operating Hours (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                {/* Office Address Card */}
                <div className="rounded-xl border border-primary-light bg-white p-6 shadow-sm space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-base mt-0.5">
                      <BuildingIcon />
                    </div>
                    <div className="space-y-1">
                      <Badge variant="primary" size="sm" className="font-semibold text-[11px] mb-1">
                        Kantor Pusat Sudirman
                      </Badge>
                      <h2 className="text-base sm:text-lg font-bold text-primary">
                        Menara Sudirman Lantai 12, Kav. 21
                      </h2>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        Jl. Jend. Sudirman Kav. 21, RT.1/RW.3, Karet Tengsin, Tanah Abang, Jakarta Pusat, DKI Jakarta 10250.
                      </p>
                    </div>
                  </div>

                  {/* Simulated Interactive Map Card */}
                  <div className="rounded-lg border border-primary-light bg-surface p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-primary">
                        <LocationIcon className="text-primary text-xs" />
                        <span>Akses Transportasi Publik</span>
                      </div>
                      <Badge variant="outline" className="text-[10px] text-text-secondary font-medium">
                        Zona Ring 1 Sudirman
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 rounded bg-white border border-primary-light/60 space-y-0.5">
                        <span className="font-bold text-primary block">Stasiun MRT</span>
                        <span className="text-text-secondary block">Bendungan Hilir (250m)</span>
                        <span className="text-text-secondary block">Setiabudi Astra (400m)</span>
                      </div>
                      <div className="p-2 rounded bg-white border border-primary-light/60 space-y-0.5">
                        <span className="font-bold text-primary block">Halte TransJakarta</span>
                        <span className="text-text-secondary block">Karet Sudirman (150m)</span>
                        <span className="text-text-secondary block">Polda Metro Jaya (500m)</span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="w-full text-xs font-semibold hover:border-primary gap-1.5"
                    >
                      <a
                        href="https://maps.google.com/?q=Menara+Sudirman+Jl.+Jend.+Sudirman+Kav.+21+Jakarta"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <LocationIcon className="text-xs text-primary" />
                        <span>Buka Petunjuk Arah di Google Maps</span>
                      </a>
                    </Button>
                  </div>

                  {/* Contact Direct Channels */}
                  <div className="space-y-3 pt-2 border-t border-primary-light text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface text-primary flex items-center justify-center shrink-0 text-xs">
                        <PhoneIcon />
                      </div>
                      <div>
                        <span className="text-text-secondary text-[11px] block">Telepon Kantor (Hunting)</span>
                        <span className="font-bold text-primary">(021) 520-7890 / (021) 520-7891</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface text-primary flex items-center justify-center shrink-0 text-xs">
                        <EnvelopeIcon />
                      </div>
                      <div>
                        <span className="text-text-secondary text-[11px] block">Email Korespondensi Resmi</span>
                        <a href="mailto:consultingzhou@gmail.com" className="font-bold text-primary hover:underline">
                          consultingzhou@gmail.com
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-success/10 text-success flex items-center justify-center shrink-0 text-xs">
                        <WhatsappIcon />
                      </div>
                      <div>
                        <span className="text-text-secondary text-[11px] block">WhatsApp Business Helpdesk</span>
                        <a
                          href="https://wa.me/6281299887766?text=Halo%20Zhou%20Consulting,%20saya%20ingin%20berkonsultasi%20terkait%20layanan%20fiskal."
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-success hover:underline"
                        >
                          +62 812-9988-7766 (Fast Response)
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Operating Hours Card */}
                <div className="rounded-xl border border-primary-light bg-surface p-5 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
                    <ClockIcon className="text-primary text-xs" />
                    <span>Jam Operasional Kantor</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-primary-light/60">
                      <span className="text-text-secondary">Senin &ndash; Jumat</span>
                      <strong className="text-primary font-bold">08.30 &ndash; 17.30 WIB</strong>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-primary-light/60">
                      <span className="text-text-secondary">Sabtu &amp; Minggu</span>
                      <span className="text-text-secondary italic">Tutup (Layanan Darurat On-Call)</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-text-secondary">Hari Libur Nasional</span>
                      <span className="text-text-secondary italic">Tutup Sesuai SKB 3 Menteri</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Inquiry Form (7 cols) */}
              <div className="lg:col-span-7">
                <Card className="bg-white border-primary-light shadow-sm">
                  <CardHeader className="space-y-1.5 pb-4 border-b border-primary-light/60">
                    <Badge variant="primary" size="sm" className="w-fit font-semibold text-[11px]">
                      Formulir Konsultasi
                    </Badge>
                    <CardTitle className="text-lg sm:text-xl font-bold text-primary">
                      Kirimkan Pesan atau Permohonan Diskusi
                    </CardTitle>
                    <CardDescription className="text-xs text-text-secondary leading-relaxed">
                      Lengkapi formulir di bawah ini untuk menjadwalkan sesi konsultasi tatap muka di Menara Sudirman atau evaluasi awal dokumen fiskal.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-6">
                    {submitted ? (
                      <div className="rounded-lg bg-surface border border-success/30 p-6 sm:p-8 text-center space-y-4 animate-in fade-in duration-200">
                        <div className="w-12 h-12 rounded-full bg-success/15 text-success flex items-center justify-center mx-auto text-2xl">
                          <CheckCircleIcon />
                        </div>
                        <div className="space-y-1.5">
                          <Badge variant="outline" className="text-success border-success font-semibold text-xs mb-1">
                            Tiket Konsultasi Diterima
                          </Badge>
                          <h3 className="text-lg sm:text-xl font-bold text-primary">
                            Terima Kasih, {formData.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-text-secondary max-w-md mx-auto leading-relaxed">
                            Permohonan Anda telah tersimpan dengan nomor tiket pelacakan:
                          </p>
                          <div className="p-2.5 bg-white rounded border border-primary-light font-mono text-sm font-bold text-primary inline-block mt-2">
                            {ticketNumber}
                          </div>
                        </div>
                        <p className="text-xs text-text-secondary max-w-md mx-auto leading-relaxed">
                          Konsultan spesialis kami akan menelaah data awal Anda dan menghubungi melalui email (<strong>{formData.email}</strong>) atau WhatsApp dalam waktu 1x24 jam kerja.
                        </p>
                        <div className="pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={resetForm}
                            className="text-xs font-semibold hover:border-primary"
                          >
                            Kirim Permohonan Lainnya
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                        {/* 2 Kolom: Nama Lengkap & Perusahaan */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="contact-name" className="text-xs font-semibold text-primary">
                              Nama Lengkap (PIC) <span className="text-error">*</span>
                            </Label>
                            <div className="relative">
                              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-xs" />
                              <Input
                                id="contact-name"
                                value={formData.name}
                                onChange={(e) => {
                                  setFormData({ ...formData, name: e.target.value });
                                  if (formErrors.name) setFormErrors({ ...formErrors, name: "" });
                                }}
                                placeholder="cth. Budi Santoso"
                                error={Boolean(formErrors.name)}
                                className="pl-8 text-xs bg-white"
                              />
                            </div>
                            {formErrors.name && (
                              <p className="text-[11px] text-error font-medium">{formErrors.name}</p>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="contact-company" className="text-xs font-semibold text-primary">
                              Nama Perusahaan / Entitas Bisnis
                            </Label>
                            <div className="relative">
                              <BuildingIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-xs" />
                              <Input
                                id="contact-company"
                                value={formData.company}
                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                placeholder="cth. PT Maju Bersama Makmur"
                                className="pl-8 text-xs bg-white"
                              />
                            </div>
                          </div>
                        </div>

                        {/* 2 Kolom: Email & WhatsApp */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="contact-email" className="text-xs font-semibold text-primary">
                              Alamat Email Resmi <span className="text-error">*</span>
                            </Label>
                            <div className="relative">
                              <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-xs" />
                              <Input
                                id="contact-email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => {
                                  setFormData({ ...formData, email: e.target.value });
                                  if (formErrors.email) setFormErrors({ ...formErrors, email: "" });
                                }}
                                placeholder="cth. budi@perusahaan.co.id"
                                error={Boolean(formErrors.email)}
                                className="pl-8 text-xs bg-white"
                              />
                            </div>
                            {formErrors.email && (
                              <p className="text-[11px] text-error font-medium">{formErrors.email}</p>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="contact-phone" className="text-xs font-semibold text-primary">
                              Nomor WhatsApp / Telepon Aktif <span className="text-error">*</span>
                            </Label>
                            <div className="relative">
                              <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-xs" />
                              <Input
                                id="contact-phone"
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => {
                                  setFormData({ ...formData, phone: e.target.value });
                                  if (formErrors.phone) setFormErrors({ ...formErrors, phone: "" });
                                }}
                                placeholder="cth. 081234567890"
                                error={Boolean(formErrors.phone)}
                                className="pl-8 text-xs bg-white"
                              />
                            </div>
                            {formErrors.phone && (
                              <p className="text-[11px] text-error font-medium">{formErrors.phone}</p>
                            )}
                          </div>
                        </div>

                        {/* Bidang Layanan Dropdown */}
                        <div className="space-y-1.5">
                          <Label htmlFor="contact-service" className="text-xs font-semibold text-primary">
                            Bidang Layanan yang Dibutuhkan <span className="text-error">*</span>
                          </Label>
                          <Select
                            id="contact-service"
                            value={formData.service}
                            onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                            className="text-xs bg-white"
                          >
                            <option value="tax">Tax Service Core (Kepatuhan SPT Masa/Tahunan &amp; Ekualisasi)</option>
                            <option value="coretax">Kesiapan Transisi Coretax DJP 2026 &amp; Mitigasi SP2DK</option>
                            <option value="accounting">Accounting Service &amp; Penyusunan Laporan Standar SAK</option>
                            <option value="business">Konsultasi Bisnis, Financial Modeling &amp; Studi Kelayakan</option>
                            <option value="legal">Konsultasi Hukum Korporat, Perizinan OSS-RBA &amp; Kontrak</option>
                            <option value="training">Program In-House Corporate Tax &amp; Coretax Training</option>
                            <option value="general">Lainnya / Evaluasi Dokumen Awal</option>
                          </Select>
                        </div>

                        {/* Rincian Pesan / Kebutuhan */}
                        <div className="space-y-1.5">
                          <Label htmlFor="contact-message" className="text-xs font-semibold text-primary">
                            Pokok Kebutuhan atau Kendala Fiskal yang Dihadapi <span className="text-error">*</span>
                          </Label>
                          <Textarea
                            id="contact-message"
                            rows={4}
                            value={formData.message}
                            onChange={(e) => {
                              setFormData({ ...formData, message: e.target.value });
                              if (formErrors.message) setFormErrors({ ...formErrors, message: "" });
                            }}
                            placeholder="Ceritakan gambaran permasalahan akuntansi, kendala pelaporan SPT, ekualisasi omzet, SP2DK, atau rencana restrukturisasi korporat yang ingin Anda diskusikan..."
                            error={Boolean(formErrors.message)}
                            className="text-xs bg-white"
                          />
                          {formErrors.message && (
                            <p className="text-[11px] text-error font-medium">{formErrors.message}</p>
                          )}
                        </div>

                        {/* Checkbox Persetujuan UU PDP */}
                        <div className="pt-2 border-t border-primary-light/60">
                          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-text-secondary leading-relaxed">
                            <input
                              type="checkbox"
                              checked={formData.agreeTerms}
                              onChange={(e) => {
                                setFormData({ ...formData, agreeTerms: e.target.checked });
                                if (formErrors.agreeTerms) setFormErrors({ ...formErrors, agreeTerms: "" });
                              }}
                              className="mt-0.5 rounded border-primary-light text-primary focus:ring-primary"
                            />
                            <span>
                              Saya menyetujui data formulir ini digunakan oleh konsultan Zhou Consulting untuk keperluan follow-up konsultasi sesuai <strong>UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP)</strong> dan standar kerahasiaan profesi (NDA).
                            </span>
                          </label>
                          {formErrors.agreeTerms && (
                            <p className="text-[11px] text-error font-medium mt-1">{formErrors.agreeTerms}</p>
                          )}
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                          <p className="text-[11px] text-text-secondary text-center sm:text-left">
                            Dilindungi enkripsi SSL 256-bit. Respon terjamin dalam 1x24 jam kerja.
                          </p>
                          <Button
                            variant="primary"
                            size="default"
                            type="submit"
                            loading={isSubmitting}
                            disabled={isSubmitting}
                            className="w-full sm:w-auto font-bold text-xs tracking-wide py-2.5 px-6 shrink-0"
                          >
                            <span>Kirim Pesan</span>
                          </Button>
                        </div>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Seksi Direktori Saluran Kontak Khusus per Divisi (3 Kartu) */}
        <section className="py-12 bg-surface border-t border-primary-light/60" aria-label="Direktori Divisi Khusus">
          <div className="container-custom space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <Badge
                variant="silver"
                className="uppercase tracking-wider text-badge font-semibold py-1 px-3"
              >
                <span>Direktori Spesialis</span>
              </Badge>
              <h2 className="text-xl sm:text-2xl font-bold text-primary tracking-tight">
                Saluran Komunikasi Khusus Berdasarkan Divisi
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                Hubungi langsung tim spesialis terkait untuk percepatan tindak lanjut telaah dokumen dan kebutuhan mendesak.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Divisi Pajak */}
              <Card className="bg-white border-primary-light hover:border-primary hover:shadow-md transition-all duration-200">
                <CardHeader className="space-y-2.5 pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="primary" size="sm" className="font-semibold text-[11px]">
                      Tax Service Core
                    </Badge>
                    <ShieldTaxIcon className="text-primary text-base" />
                  </div>
                  <CardTitle className="text-base font-bold text-primary">
                    Divisi Perpajakan &amp; Coretax
                  </CardTitle>
                  <CardDescription className="text-xs text-text-secondary leading-relaxed">
                    Konsultasi kepatuhan SPT Masa/Tahunan PPh &amp; PPN, ekualisasi faktur, tanggapan SP2DK, dan asistensi sistem Coretax DJP 2026.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 pt-2 text-xs border-t border-primary-light/60">
                  <div className="space-y-1">
                    <span className="text-[11px] text-text-secondary block">Email Khusus Pajak:</span>
                    <a href="mailto:consultingzhou@gmail.com" className="font-bold text-primary hover:underline block truncate">
                      consultingzhou@gmail.com
                    </a>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] text-text-secondary block">Hotline WhatsApp Divisi:</span>
                    <a
                      href="https://wa.me/6281299887711?text=Halo%20Divisi%20Pajak%20Zhou%20Consulting,%20saya%20ingin%20berkonsultasi%20mengenai%20SPT/SP2DK."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-success hover:underline inline-flex items-center gap-1.5"
                    >
                      <WhatsappIcon className="text-xs" />
                      <span>+62 812-9988-7711</span>
                    </a>
                  </div>
                  <div className="pt-2">
                    <Button variant="outline" size="sm" asChild className="w-full text-xs font-semibold hover:border-primary">
                      <a href="https://wa.me/6281299887711?text=Halo%20Divisi%20Pajak%20Zhou%20Consulting">
                        Hubungi Divisi Pajak
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Card 2: Divisi Akuntansi */}
              <Card className="bg-white border-primary-light hover:border-primary hover:shadow-md transition-all duration-200">
                <CardHeader className="space-y-2.5 pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="primary" size="sm" className="font-semibold text-[11px]">
                      Accounting Service
                    </Badge>
                    <BookIcon className="text-primary text-base" />
                  </div>
                  <CardTitle className="text-base font-bold text-primary">
                    Divisi Akuntansi &amp; Standar SAK
                  </CardTitle>
                  <CardDescription className="text-xs text-text-secondary leading-relaxed">
                    Kompilasi laporan keuangan berkala SAK EP/IFRS, rekonsiliasi bank multi-valuta, review COA, dan pendampingan audit KAP eksternal.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 pt-2 text-xs border-t border-primary-light/60">
                  <div className="space-y-1">
                    <span className="text-[11px] text-text-secondary block">Email Khusus Akuntansi:</span>
                    <a href="mailto:consultingzhou@gmail.com" className="font-bold text-primary hover:underline block truncate">
                      consultingzhou@gmail.com
                    </a>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] text-text-secondary block">Hotline WhatsApp Divisi:</span>
                    <a
                      href="https://wa.me/6281299887722?text=Halo%20Divisi%20Akuntansi%20Zhou%20Consulting,%20saya%20ingin%20berkonsultasi%20mengenai%20laporan%20SAK."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-success hover:underline inline-flex items-center gap-1.5"
                    >
                      <WhatsappIcon className="text-xs" />
                      <span>+62 812-9988-7722</span>
                    </a>
                  </div>
                  <div className="pt-2">
                    <Button variant="outline" size="sm" asChild className="w-full text-xs font-semibold hover:border-primary">
                      <a href="https://wa.me/6281299887722?text=Halo%20Divisi%20Akuntansi%20Zhou%20Consulting">
                        Hubungi Divisi Akuntansi
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Card 3: Divisi Legal */}
              <Card className="bg-white border-primary-light hover:border-primary hover:shadow-md transition-all duration-200">
                <CardHeader className="space-y-2.5 pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="primary" size="sm" className="font-semibold text-[11px]">
                      Legal Services
                    </Badge>
                    <BriefcaseIcon className="text-primary text-base" />
                  </div>
                  <CardTitle className="text-base font-bold text-primary">
                    Divisi Hukum Korporat &amp; Legal
                  </CardTitle>
                  <CardDescription className="text-xs text-text-secondary leading-relaxed">
                    Drafting &amp; review kontrak komersial, audit kepatuhan UU PDP No. 27/2022, perizinan berusaha OSS-RBA, dan legal due diligence.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 pt-2 text-xs border-t border-primary-light/60">
                  <div className="space-y-1">
                    <span className="text-[11px] text-text-secondary block">Email Khusus Legal:</span>
                    <a href="mailto:consultingzhou@gmail.com" className="font-bold text-primary hover:underline block truncate">
                      consultingzhou@gmail.com
                    </a>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] text-text-secondary block">Hotline WhatsApp Divisi:</span>
                    <a
                      href="https://wa.me/6281299887733?text=Halo%20Divisi%20Legal%20Zhou%20Consulting,%20saya%20ingin%20berkonsultasi%20mengenai%20kontrak/hukum."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-success hover:underline inline-flex items-center gap-1.5"
                    >
                      <WhatsappIcon className="text-xs" />
                      <span>+62 812-9988-7733</span>
                    </a>
                  </div>
                  <div className="pt-2">
                    <Button variant="outline" size="sm" asChild className="w-full text-xs font-semibold hover:border-primary">
                      <a href="https://wa.me/6281299887733?text=Halo%20Divisi%20Legal%20Zhou%20Consulting">
                        Hubungi Divisi Legal
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
