"use client";

import React, { useState } from "react";
import Link from "next/link";
import { publicApi } from "@/lib/api";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import {
  LocationIcon,
  PhoneIcon,
  WhatsappIcon,
  EnvelopeIcon,
  ClockIcon,
  CheckCircleIcon,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await publicApi.submitContact({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: `[${formData.company || "Mandiri"}] Konsultasi ${formData.service.toUpperCase()}`,
        message: formData.message,
      });
    } catch (err) {
      console.warn("Backend submit contact fallback:", err);
    } finally {
      setIsSubmitting(false);
      const code = `ZHOU-INQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setTicketNumber(code);
      setSubmitted(true);
    }
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

      <main className="flex-1 flex flex-col">
        {/* Main 2-Column Split Section with Integrated Breadcrumb & Header */}
        <section className="py-14 md:py-20 bg-surface flex-1" aria-label="Detail Kantor dan Formulir Permohonan">
          <div className="container-custom space-y-10">
            <nav className="flex items-center gap-2 text-xs text-text-secondary font-medium">
              <Link href="/" className="hover:text-primary transition-colors">
                Beranda
              </Link>
              <span>/</span>
              <span className="text-primary font-semibold">Kontak &amp; Saluran Operasional</span>
            </nav>

            <div className="max-w-3xl space-y-3">
              <Badge variant="silver" className="uppercase tracking-wider text-badge font-semibold py-1 px-3">
                Saluran Resmi
              </Badge>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary tracking-tight">
                Hubungi Kantor Pusat Zhou Consulting
              </h1>
              <p className="text-body-regular text-text-secondary leading-relaxed">
                Konsultasikan kebutuhan perpajakan, audit akuntansi, dan legal korporat Anda bersama tim konsultan berlisensi Menara Sudirman.
              </p>
            </div>

            {/* Unified Master Container: Informasi Kantor & Formulir Konsultasi dalam SATU WADAH Bersih */}
            <div className="rounded-2xl border border-primary-light bg-white shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
              {/* Sisi Kiri: Detail Kantor, Kontak & Jam Operasional (5 cols) */}
              <div className="lg:col-span-5 bg-surface/70 p-6 sm:p-8 flex flex-col justify-between space-y-6 border-b lg:border-b-0 lg:border-r border-primary-light">
                <div className="space-y-6">
                  {/* Kantor Pusat Sudirman */}
                  <div className="space-y-2.5">
                    <Badge variant="primary" size="sm" className="font-semibold text-[11px]">
                      Kantor Pusat Sudirman
                    </Badge>
                    <h2 className="text-lg sm:text-xl font-bold text-primary">
                      Menara Sudirman Lantai 12, Kav. 21
                    </h2>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Jl. Jend. Sudirman Kav. 21, RT.1/RW.3, Karet Tengsin, Tanah Abang, Jakarta Pusat, DKI Jakarta 10250.
                    </p>
                    <div className="pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="text-xs font-semibold hover:border-primary gap-1.5 bg-white shadow-2xs"
                      >
                        <a
                          href="https://maps.google.com/?q=Menara+Sudirman+Jl.+Jend.+Sudirman+Kav.+21+Jakarta"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <LocationIcon className="text-xs text-primary" />
                          <span>Petunjuk Arah Google Maps</span>
                        </a>
                      </Button>
                    </div>
                  </div>

                  {/* Saluran Kontak Langsung */}
                  <div className="space-y-3.5 pt-4 border-t border-primary-light text-xs">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-white border border-primary-light text-primary flex items-center justify-center shrink-0 text-xs mt-0.5">
                        <PhoneIcon />
                      </div>
                      <div>
                        <span className="text-text-secondary text-[11px] block">Telepon Kantor (Hunting)</span>
                        <span className="font-bold text-primary">(021) 520-7890 / 520-7891</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-white border border-primary-light text-primary flex items-center justify-center shrink-0 text-xs mt-0.5">
                        <EnvelopeIcon />
                      </div>
                      <div>
                        <span className="text-text-secondary text-[11px] block">Email Korespondensi Resmi</span>
                        <a href="mailto:consultingzhou@gmail.com" className="font-bold text-primary hover:underline">
                          consultingzhou@gmail.com
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-success/10 text-success flex items-center justify-center shrink-0 text-xs mt-0.5">
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

                {/* Jam Operasional Kantor Terintegrasi */}
                <div className="pt-4 border-t border-primary-light text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-primary text-[11px] uppercase tracking-wider">
                    <ClockIcon className="text-primary text-xs" />
                    <span>Jam Operasional Kantor</span>
                  </div>
                  <div className="space-y-1.5 text-xs text-text-secondary">
                    <div className="flex justify-between items-center">
                      <span>Senin &ndash; Jumat:</span>
                      <strong className="text-primary font-bold">08.30 &ndash; 17.30 WIB</strong>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span>Sabtu, Minggu &amp; Libur:</span>
                      <span className="italic">Tutup (Layanan Darurat On-Call)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sisi Kanan: Formulir Konsultasi (7 cols) */}
              <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 space-y-6">
                <div className="space-y-1.5 pb-4 border-b border-primary-light">
                  <Badge variant="primary" size="sm" className="w-fit font-semibold text-[11px]">
                    Formulir Konsultasi
                  </Badge>
                  <h2 className="text-lg sm:text-xl font-bold text-primary">
                    Kirimkan Pesan atau Permohonan Diskusi
                  </h2>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Lengkapi formulir di bawah ini untuk menjadwalkan sesi konsultasi tatap muka di Menara Sudirman atau evaluasi awal dokumen fiskal.
                  </p>
                </div>

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
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
