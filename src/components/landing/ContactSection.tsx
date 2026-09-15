"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  LocationIcon,
  PhoneIcon,
  WhatsappIcon,
  EnvelopeIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@/components/icons";

export function ContactSection() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert("Mohon isi nama, email, dan rincian pesan konsultasi.");
      return;
    }
    setSubmitted(true);
  };

  const resetForm = () => {
    setSubmitted(false);
    setFormData({
      name: "",
      company: "",
      email: "",
      phone: "",
      message: "",
    });
  };

  return (
    <section id="kontak" className="py-20 bg-surface border-b border-primary-light scroll-mt-20">
      <div className="container-custom space-y-12">
        <div className="max-w-2xl space-y-3">
          <Badge variant="silver" className="uppercase tracking-wider text-[11px] font-bold">
            Hubungi Kami
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
            Mulai Diskusi Konsultasi Bersama Pakar Kami
          </h2>
          <p className="text-text-secondary text-base leading-relaxed">
            Sampaikan kebutuhan akuntansi, perpajakan, atau konsultasi bisnis Anda. Tim kami siap memberikan evaluasi awal dan penjadwalan sesi telaah dokumen.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form (7 cols) */}
          <div className="lg:col-span-7 rounded-lg border border-primary-light bg-white p-8 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-primary">Formulir Permohonan Konsultasi</h3>

            {!submitted ? (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-name">Nama Lengkap</Label>
                    <Input
                      id="contact-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nama Anda atau perwakilan"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-company">Nama Perusahaan / Usaha</Label>
                    <Input
                      id="contact-company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="PT / CV / Perorangan"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-email">Alamat Email</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="nama@perusahaan.com"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-phone">Nomor Telepon / WhatsApp</Label>
                    <Input
                      id="contact-phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="contact-message">Rincian Kebutuhan Konsultasi</Label>
                  <Textarea
                    id="contact-message"
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Ceritakan permasalahan akuntansi, kendala pelaporan SPT, SP2DK, atau perencanaan keuangan yang ingin Anda diskusikan..."
                    required
                  />
                </div>

                <Button variant="primary" size="lg" type="submit" className="w-full font-semibold">
                  Kirim Permohonan Konsultasi
                </Button>
              </form>
            ) : (
              <div className="py-8 text-center space-y-4 bg-surface rounded-lg border border-primary-light p-6">
                <div className="w-12 h-12 rounded-full bg-success/15 text-success flex items-center justify-center mx-auto text-2xl">
                  <CheckCircleIcon />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-lg font-bold text-primary">Permohonan Konsultasi Terkirim!</h4>
                  <p className="text-xs text-text-secondary max-w-md mx-auto">
                    Terima kasih, <strong>{formData.name}</strong>. Tim konsultan Zhou Consulting telah menerima permohonan konsultasi Anda. Kami akan menelaah kebutuhan Anda dan menghubungi via email (<strong>{formData.email}</strong>) dalam 1x24 jam kerja.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={resetForm} className="text-xs mt-2">
                  Kirim Pesan Lainnya
                </Button>
              </div>
            )}
          </div>

          {/* Right Column: Contact Details & WhatsApp Button (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* WhatsApp Card */}
            <div className="rounded-lg border border-primary-light bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success text-xl flex-shrink-0">
                  <WhatsappIcon />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-primary">Layanan Respon Cepat WhatsApp</h4>
                  <p className="text-xs text-text-secondary">Konsultasi interaktif langsung via WhatsApp Business CS</p>
                </div>
              </div>

              <Button
                variant="primary"
                size="default"
                asChild
                className="w-full bg-[#12B76A] hover:bg-[#0E9355] text-white font-semibold text-xs tracking-wide"
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

            {/* Office Information */}
            <div className="rounded-lg border border-primary-light bg-white p-6 shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-primary">Informasi Kantor &amp; Layanan</h4>

              <div className="space-y-3.5 text-xs text-text">
                <div className="flex items-start gap-3">
                  <LocationIcon className="text-primary text-sm flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-primary">Kantor Utama</span>
                    <span className="text-text-secondary">Gedung Pusat Bisnis Lantai 8, Jl. Jend. Sudirman Kav. 21, Jakarta Selatan</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <PhoneIcon className="text-primary text-sm flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-primary">Telepon Kantor</span>
                    <span className="text-text-secondary">(021) 5290-8800 / (021) 5290-8801</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <EnvelopeIcon className="text-primary text-sm flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-primary">Surat Elektronik</span>
                    <span className="text-text-secondary">consult@zhouconsulting.id / info@zhouconsulting.id</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ClockIcon className="text-primary text-sm flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-primary">Jam Operasional Konsultasi</span>
                    <span className="text-text-secondary">Senin &ndash; Jumat: 08.30 &ndash; 17.30 WIB (Sabtu &amp; Minggu Libur)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

