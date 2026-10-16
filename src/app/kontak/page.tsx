"use client";

import React, { useState, useEffect } from "react";
import { publicApi, parseContactSettings } from "@/lib/api";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import {
  PhoneIcon,
  WhatsappIcon,
  EnvelopeIcon,
  ClockIcon,
  LocationIcon,
} from "@/components/icons";
import { ChatbotWidget } from "@/components/chatbot/ChatbotWidget";

export default function ContactPage() {
  const [contactInfo, setContactInfo] = useState({
    companyName: "Zhou Consulting",
    email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "consultingzhou@gmail.com",
    phone: "",
    address: "Jl. Botanica Valley Blok B2 No.6, Rawakalong, Kec. Gn. Sindur, Kabupaten Bogor, Jawa Barat 16340",
    whatsapp: process.env.NEXT_PUBLIC_WA_PHONE ? `+${process.env.NEXT_PUBLIC_WA_PHONE}` : "+62 812-9876-5432",
  });

  useEffect(() => {
    let isMounted = true;

    const handleContactUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{
        companyName?: string;
        email?: string;
        whatsapp?: string;
        address?: string;
      }>;
      if (customEvent.detail) {
        setContactInfo((prev) => ({
          ...prev,
          companyName: customEvent.detail.companyName || prev.companyName,
          email: customEvent.detail.email || prev.email,
          whatsapp: customEvent.detail.whatsapp || prev.whatsapp,
          address: customEvent.detail.address || prev.address,
        }));
      }
    };
    window.addEventListener("zhou_contact_updated", handleContactUpdate);

    publicApi
      .getContactSettings()
      .then((res) => {
        if (!isMounted) return;
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          const parsed = parseContactSettings(res.data);
          if (!parsed.email || parsed.email === "contact@zhouconsulting.com") {
            parsed.email = "consultingzhou@gmail.com";
          }
          if (!parsed.address || parsed.address.includes("SCBD") || parsed.address.includes("Sudirman")) {
            parsed.address = "Jl. Botanica Valley Blok B2 No.6, Rawakalong, Kec. Gn. Sindur, Kabupaten Bogor, Jawa Barat 16340";
          }
          parsed.phone = "";
          setContactInfo((prev) => ({
            ...prev,
            ...parsed,
          }));
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
      window.removeEventListener("zhou_contact_updated", handleContactUpdate);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white text-text-primary flex flex-col font-sans selection:bg-primary-light selection:text-primary">
      <Navbar />

      <main className="flex-1 flex flex-col">
        <section className="py-12 md:py-16 bg-surface flex-1" aria-label="Detail Kantor dan Layanan Chatbot">
          <div className="container-custom space-y-8">
            {/* Header Judul Halaman */}
            <div className="max-w-3xl space-y-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary tracking-tight">
                Hubungi Kantor Pusat Zhou Consulting
              </h1>
              <p className="text-body-regular text-text-secondary leading-relaxed text-sm">
                Konsultasikan kebutuhan perpajakan, audit akuntansi, dan legal korporat Anda bersama tim konsultan berlisensi atau tanyakan langsung melalui Asisten Virtual kami di bawah.
              </p>
            </div>

            {/* 1. INFORMASI KONTAK RESMI ZHOU (3 KELOMPOK SEJAJAR DENGAN GARIS PEMISAH TANPA CARD TABEL) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-8 divide-y md:divide-y-0 md:divide-x divide-primary-light/80 py-2">
                {/* Kelompok 1: Alamat Perusahaan */}
                <div className="space-y-3 pt-6 md:pt-0 md:pr-6 lg:pr-8">
                  <div className="flex items-center gap-2 text-primary">
                    <LocationIcon className="text-primary text-xs shrink-0" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                      Alamat Perusahaan
                    </h3>
                  </div>
                  <div className="space-y-1.5 text-xs text-text-secondary leading-relaxed pl-5">
                    <p className="font-semibold text-text-primary text-xs">
                      {contactInfo.address}
                    </p>
                  </div>
                </div>

                {/* Kelompok 2: Hubungi Kami */}
                <div className="space-y-3 pt-6 md:pt-0 md:px-6 lg:px-8">
                  <div className="flex items-center gap-2 text-primary">
                    <PhoneIcon className="text-primary text-xs shrink-0" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                      Hubungi Kami
                    </h3>
                  </div>
                  <div className="space-y-2.5 text-xs text-text-secondary pl-5">
                    <div className="flex items-center gap-2">
                      <EnvelopeIcon className="text-[11px] text-primary/80 shrink-0" />
                      <span className="text-[11px] text-text-muted shrink-0">Email:</span>
                      <a
                        href={`mailto:${!contactInfo.email || contactInfo.email === "contact@zhouconsulting.com" ? "consultingzhou@gmail.com" : contactInfo.email}`}
                        className="font-semibold text-text-primary hover:text-primary transition-colors underline decoration-primary-light hover:decoration-primary"
                      >
                        {!contactInfo.email || contactInfo.email === "contact@zhouconsulting.com" ? "consultingzhou@gmail.com" : contactInfo.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <WhatsappIcon className="text-[11px] text-emerald-600 shrink-0" />
                      <span className="text-[11px] text-text-muted shrink-0">WhatsApp Business:</span>
                      <a
                        href={`https://wa.me/${contactInfo.whatsapp.replace(/[^0-9]/g, "") || "6281298765432"}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
                      >
                        {contactInfo.whatsapp}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Kelompok 3: Jam Operasional */}
                <div className="space-y-3 pt-6 md:pt-0 md:pl-6 lg:pl-8">
                  <div className="flex items-center gap-2 text-primary">
                    <ClockIcon className="text-primary text-xs shrink-0" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                      Jam Operasional
                    </h3>
                  </div>
                  <div className="space-y-2.5 text-xs text-text-secondary pl-5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-text-muted shrink-0 w-28">Senin &ndash; Jumat:</span>
                      <span className="font-semibold text-text-primary">08.00 &ndash; 17.00 WIB</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-[11px] text-text-muted shrink-0 w-28">Sabtu &ndash; Minggu:</span>
                      <div className="flex flex-wrap items-baseline gap-1.5">
                        <span className="font-semibold text-text-primary">Tutup</span>
                        <span className="text-[11px] text-text-muted">(Online Helpdesk via WhatsApp)</span>
                      </div>
                    </div>
                    <p className="pt-2 text-[11px] text-text-muted leading-relaxed border-t border-primary-light/50">
                      Konsultasi tatap muka wajib melakukan reservasi jadwal terlebih dahulu.
                    </p>
                  </div>
                </div>
              </div>

            {/* 2. CHATBOT ASISTEN VIRTUAL (POSISI BAWAH - FULL WIDTH PERSIS GAMBAR 1) */}
            <div className="w-full">
              <ChatbotWidget
                mode="public"
                isEmbeddedInCard={false}
                whatsappNumber={contactInfo.whatsapp}
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
