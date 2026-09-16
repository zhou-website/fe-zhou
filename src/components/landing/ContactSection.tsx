"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
} from "@/components/icons";

export function ContactSection() {
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    service: "tax",
    message: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "Nama lengkap wajib diisi.";
    if (!formData.email.trim()) {
      errors.email = "Alamat email wajib diisi.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Format alamat email tidak valid.";
    }
    if (!formData.message.trim()) {
      errors.message = "Rincian kebutuhan konsultasi wajib diisi.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitted(true);
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
    });
    setFormErrors({});
  };

  return (
    <section
      id="kontak"
      aria-label="Pusat Konsultasi dan Kontak Kami"
      className="py-16 md:py-20 lg:py-24 bg-surface border-b border-primary-light scroll-mt-20"
    >
      <div className="container-custom space-y-12">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <Badge
            variant="silver"
            className="uppercase tracking-wider text-badge font-semibold py-1 px-3 inline-flex items-center gap-1.5"
          >
            <EnvelopeIcon className="text-xs" />
            <span>Hubungi Kami</span>
          </Badge>
          <h2 className="text-[20px] leading-[28px] sm:text-[21px] sm:leading-[29px] lg:text-section-heading font-bold text-primary tracking-tight text-balance">
            Mulai Diskusi Konsultasi Bersama Pakar Kami
          </h2>
          <p className="text-[15px] leading-[24px] sm:text-body-large text-text-secondary leading-relaxed">
            Sampaikan kebutuhan akuntansi, perpajakan, atau konsultasi bisnis Anda. Tim konsultan berlisensi Zhou Consulting siap memberikan evaluasi awal dan penjadwalan sesi telaah dokumen fiskal.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form (7 cols) */}
          <Card className="lg:col-span-7 bg-white shadow-sm hover:border-primary-light transition-all">
            <CardHeader className="space-y-1.5 pb-4">
              <CardTitle className="text-lg font-bold text-primary">
                Formulir Permohonan Konsultasi
              </CardTitle>
              <CardDescription className="text-xs text-text-secondary">
                Lengkapi rincian usaha dan kebutuhan spesifik Anda untuk kami hubungkan dengan konsultan terkait.
              </CardDescription>
            </CardHeader>

            <CardContent>
              {!submitted ? (
                <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="contact-name" className="text-xs font-semibold text-primary">
                        Nama Lengkap *
                      </Label>
                      <Input
                        id="contact-name"
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value });
                          if (formErrors.name) setFormErrors({ ...formErrors, name: "" });
                        }}
                        placeholder="Nama Anda atau perwakilan"
                        error={Boolean(formErrors.name)}
                        className="text-xs"
                      />
                      {formErrors.name && (
                        <p className="text-[11px] text-error font-medium">{formErrors.name}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="contact-company" className="text-xs font-semibold text-primary">
                        Nama Perusahaan / Entitas
                      </Label>
                      <Input
                        id="contact-company"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="PT / CV / Usaha Dagang"
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="contact-email" className="text-xs font-semibold text-primary">
                        Alamat Email Resmi *
                      </Label>
                      <Input
                        id="contact-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value });
                          if (formErrors.email) setFormErrors({ ...formErrors, email: "" });
                        }}
                        placeholder="nama@perusahaan.com"
                        error={Boolean(formErrors.email)}
                        className="text-xs"
                      />
                      {formErrors.email && (
                        <p className="text-[11px] text-error font-medium">{formErrors.email}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="contact-phone" className="text-xs font-semibold text-primary">
                        Nomor Telepon / WhatsApp
                      </Label>
                      <Input
                        id="contact-phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="081234567890"
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="contact-service" className="text-xs font-semibold text-primary">
                      Pilar Layanan yang Dibutuhkan *
                    </Label>
                    <Select
                      id="contact-service"
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="text-xs"
                    >
                      <option value="tax">Tax Service Core &amp; Migrasi Coretax 2026</option>
                      <option value="accounting">Accounting Service &amp; Penyusunan Laporan SAK</option>
                      <option value="business">Konsultasi Bisnis, Keuangan &amp; Studi Kelayakan</option>
                      <option value="legal">Konsultasi Hukum Korporat &amp; Perizinan Usaha</option>
                      <option value="sp2dk">Pendampingan SP2DK, Pemeriksaan &amp; Sengketa Pajak</option>
                      <option value="training">In-House Corporate Training Perpajakan</option>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="contact-message" className="text-xs font-semibold text-primary">
                      Rincian Kebutuhan atau Kendala Fiskal *
                    </Label>
                    <Textarea
                      id="contact-message"
                      rows={4}
                      value={formData.message}
                      onChange={(e) => {
                        setFormData({ ...formData, message: e.target.value });
                        if (formErrors.message) setFormErrors({ ...formErrors, message: "" });
                      }}
                      placeholder="Ceritakan gambaran singkat permasalahan akuntansi, kendala pelaporan SPT, ekualisasi omzet, SP2DK, atau restrukturisasi keuangan yang ingin Anda diskusikan..."
                      error={Boolean(formErrors.message)}
                      className="text-xs"
                    />
                    {formErrors.message && (
                      <p className="text-[11px] text-error font-medium">{formErrors.message}</p>
                    )}
                  </div>

                  <div className="pt-2">
                    <Button
                      variant="primary"
                      size="default"
                      type="submit"
                      className="w-full font-semibold text-xs tracking-wide py-2.5"
                    >
                      Kirim Permohonan Konsultasi
                    </Button>
                  </div>

                  <p className="text-[11px] text-text-secondary text-center pt-1">
                    Informasi dan data rahasia perusahaan Anda dilindungi sesuai standar kerahasiaan profesi akuntan dan konsultan pajak.
                  </p>
                </form>
              ) : (
                <div className="py-8 text-center space-y-4 bg-surface rounded-lg border border-primary-light p-6 animate-in fade-in duration-200">
                  <div className="w-12 h-12 rounded-full bg-success/15 text-success flex items-center justify-center mx-auto text-2xl">
                    <CheckCircleIcon />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-lg font-bold text-primary">Permohonan Konsultasi Diterima!</h4>
                    <p className="text-xs text-text-secondary max-w-md mx-auto leading-relaxed">
                      Terima kasih, <strong>{formData.name}</strong>. Permohonan Anda telah diteruskan ke tim konsultan spesialis kami. Kami akan menelaah data awal dan menghubungi Anda melalui email (<strong>{formData.email}</strong>) dalam 1x24 jam kerja.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetForm}
                    className="text-xs mt-2 font-semibold hover:border-primary"
                  >
                    Kirim Permohonan Lainnya
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Column: Contact Details & WhatsApp Button (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* WhatsApp Quick Response Card */}
            <div className="rounded-lg border border-primary-light bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success text-xl shrink-0">
                  <WhatsappIcon />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-primary">Respon Cepat WhatsApp CS</h4>
                  <p className="text-xs text-text-secondary">Konsultasi interaktif langsung via WhatsApp Business resmi</p>
                </div>
              </div>

              <Button
                variant="primary"
                size="default"
                asChild
                className="w-full bg-success hover:bg-success/90 text-white font-semibold text-xs tracking-wide shadow-sm"
              >
                <a
                  href="https://wa.me/6281234567890?text=Halo%20Zhou%20Consulting,%20saya%20ingin%20berkonsultasi%20mengenai%20layanan%20akuntansi%20dan%20pajak."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2"
                >
                  <WhatsappIcon className="text-base" />
                  <span>Chat WhatsApp Customer Service</span>
                </a>
              </Button>
            </div>

            {/* Office Information Card */}
            <div className="rounded-lg border border-primary-light bg-white p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2 text-primary font-bold text-sm border-b border-primary-light pb-3">
                <ShieldTaxIcon className="text-primary text-sm" />
                <h4>Informasi Kantor &amp; Layanan Resmi</h4>
              </div>

              <div className="space-y-4 text-xs text-text">
                <div className="flex items-start gap-3">
                  <LocationIcon className="text-primary text-sm shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-semibold block text-primary">Kantor Operasional Utama</span>
                    <span className="text-text-secondary leading-relaxed">
                      Gedung Pusat Bisnis Lantai 8, Jl. Jend. Sudirman Kav. 21, Jakarta Selatan 12920
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <PhoneIcon className="text-primary text-sm shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-semibold block text-primary">Saluran Telepon Kantor</span>
                    <span className="text-text-secondary">
                      (021) 5290-8800 / (021) 5290-8801
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <EnvelopeIcon className="text-primary text-sm shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-semibold block text-primary">Surat Elektronik (Email)</span>
                    <span className="text-text-secondary">
                      consult@zhouconsulting.id &bull; info@zhouconsulting.id
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ClockIcon className="text-primary text-sm shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-semibold block text-primary">Jam Operasional Konsultasi</span>
                    <span className="text-text-secondary">
                      Senin &ndash; Jumat: 08.30 &ndash; 17.30 WIB (Sabtu, Minggu &amp; Hari Libur Nasional Tutup)
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-md bg-surface border border-primary-light text-[11px] text-text-secondary leading-relaxed">
                Kunjungan konsultasi tatap muka di kantor dianjurkan melalui reservasi jadwal terlebih dahulu demi ketersediaan konsultan ahli.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
