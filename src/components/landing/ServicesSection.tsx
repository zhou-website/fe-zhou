"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { CheckCircleIcon, WhatsappIcon } from "@/components/icons";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { publicApi, PublicServiceItem, parseContactSettings } from "@/lib/api";

export interface CoreLandingService {
  id: string;
  categoryKey: "akuntansi" | "bisnis" | "tax-service" | "hukum";
  name: string;
  subtitle: string;
  route: string;
  pillars: { title: string }[];
  waTemplate: string;
}

const CANONICAL_SERVICES: CoreLandingService[] = [
  {
    id: "core-accounting",
    categoryKey: "akuntansi",
    name: "Accounting Services",
    subtitle:
      "Penyusunan laporan keuangan berstandar SAK/PSAK, pembukuan komprehensif, neraca, laba rugi, dan rekonsiliasi profesional.",
    route: "/layanan/akuntansi",
    pillars: [
      { title: "Laporan Posisi Keuangan (Neraca) & Laba Rugi" },
      { title: "Pencatatan Jurnal & Buku Besar Terstandar PSAK" },
      { title: "Rekonsiliasi Bank & Manajemen Kas Berkala" },
    ],
    waTemplate:
      "Halo Zhou Consulting, saya ingin konsultasi mengenai Accounting Services.",
  },
  {
    id: "core-business",
    categoryKey: "bisnis",
    name: "Business & Financial Services",
    subtitle:
      "Advisori strategi finansial korporasi, studi kelayakan investasi bisnis, optimalisasi arus kas, dan perencanaan anggaran.",
    route: "/layanan/bisnis",
    pillars: [
      { title: "Analisis Kesehatan & Kinerja Finansial Korporasi" },
      { title: "Perencanaan Anggaran & Optimalisasi Arus Kas" },
      { title: "Evaluasi Kelayakan Investasi & Studi Finansial" },
    ],
    waTemplate:
      "Halo Zhou Consulting, saya ingin konsultasi mengenai Business & Financial Services.",
  },
  {
    id: "core-tax",
    categoryKey: "tax-service",
    name: "Tax Services",
    subtitle:
      "Pendampingan kepatuhan perpajakan korporasi, transisi Coretax DJP, pelaporan SPT Masa & Tahunan, serta mitigasi risiko fiskal.",
    route: "/layanan/tax-service",
    pillars: [
      { title: "Pendampingan Transisi & Kesiapan Coretax DJP" },
      { title: "Pelaporan SPT Masa PPh & PPN Tepat Waktu" },
      { title: "Rekonsiliasi Fiskal & SPT Tahunan Badan 1771" },
    ],
    waTemplate:
      "Halo Zhou Consulting, saya ingin konsultasi mengenai Tax Services.",
  },
  {
    id: "core-law",
    categoryKey: "hukum",
    name: "Law Services",
    subtitle:
      "Pendampingan aspek hukum bisnis, drafting dan review kontrak komersial, perizinan OSS-RBA, serta advokasi sengketa regulasi.",
    route: "/layanan/hukum",
    pillars: [
      { title: "Drafting & Review Kontrak Komersial" },
      { title: "Perizinan Usaha Berbasis Risiko OSS-RBA" },
      { title: "Pendampingan Pemeriksaan & Sengketa Pajak" },
    ],
    waTemplate:
      "Halo Zhou Consulting, saya ingin konsultasi mengenai Law Services.",
  },
];

function isTechnicalTaxService(name?: string, code?: string): boolean {
  const n = (name || "").toLowerCase();
  const c = (code || "").toLowerCase();
  return (
    n.includes("e-faktur") ||
    n.includes("e-bupot") ||
    n.includes("e-billing") ||
    n.includes("pelaporan spt") ||
    c.includes("faktur") ||
    c.includes("bupot") ||
    c.includes("billing")
  );
}

export function ServicesSection() {
  const [cards, setCards] = useState<CoreLandingService[]>(CANONICAL_SERVICES);
  const [waPhone, setWaPhone] = useState<string>(() => {
    const raw = process.env.NEXT_PUBLIC_WA_PHONE || "6285121286086";
    return raw.replace(/[^0-9]/g, "") || "6285121286086";
  });
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();

  const getAuthHref = (target: string) => {
    if (target.startsWith("/dashboard") && !isAuthenticated) {
      return `/login?redirect=${encodeURIComponent(target)}`;
    }
    return target;
  };

  useEffect(() => {
    let isMounted = true;

    // Load contact settings for official WhatsApp phone number
    publicApi
      .getContactSettings()
      .then((res) => {
        if (!isMounted) return;
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          const cfg = parseContactSettings(res.data);
          if (cfg.whatsapp) {
            const clean = cfg.whatsapp.replace(/[^0-9]/g, "");
            if (clean) setWaPhone(clean);
          }
        }
      })
      .catch(() => {});

    // Sinkronisasi data layanan langsung dari REST API Backend
    const syncCanonicalServices = (apiItems: PublicServiceItem[] = []) => {
      const updatedCards = CANONICAL_SERVICES.map((canon) => {
        const apiMatch = apiItems.find((a: PublicServiceItem) => {
          if (a.is_active === false) return false;
          if (isTechnicalTaxService(a.service_name, a.service_code)) return false;
          const catLower = (a.category || "").toLowerCase();
          const codeUpper = (a.service_code || "").toUpperCase();
          if (canon.categoryKey === "akuntansi") {
            return catLower.includes("akuntansi") || codeUpper.includes("ACC");
          }
          if (canon.categoryKey === "bisnis") {
            return catLower.includes("bisnis") || codeUpper.includes("FIN");
          }
          if (canon.categoryKey === "tax-service") {
            return (
              (catLower.includes("tax") || catLower.includes("pajak") || codeUpper.includes("TAX")) &&
              !catLower.includes("hukum") &&
              !catLower.includes("legal")
            );
          }
          if (canon.categoryKey === "hukum") {
            return catLower.includes("hukum") || codeUpper.includes("LAW") || codeUpper.includes("LEGAL");
          }
          return false;
        });

        const subtitle = apiMatch?.description || canon.subtitle;
        const pillars =
          apiMatch?.features && apiMatch.features.length > 0
            ? apiMatch.features.slice(0, 3).map((f) => ({ title: f }))
            : canon.pillars;

        return {
          ...canon,
          subtitle,
          pillars,
        };
      });

      if (isMounted) {
        setCards(updatedCards);
      }
    };

    publicApi
      .getServices()
      .then((res) => {
        if (!isMounted) return;
        if (res?.data && Array.isArray(res.data)) {
          syncCanonicalServices(res.data);
        }
      })
      .catch((err) => {
        console.warn("publicApi.getServices in ServicesSection:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section
      id="layanan"
      aria-label="Layanan Konsultasi Zhou Consulting"
      className="py-16 md:py-20 lg:py-24 bg-surface border-b border-primary-light scroll-mt-20 font-sans"
    >
      <div className="container-custom space-y-10 md:space-y-12">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <h2 className="text-[22px] leading-[30px] sm:text-[26px] sm:leading-[34px] lg:text-[32px] lg:leading-[40px] font-bold text-primary tracking-tight text-balance">
            {t.services.headline || "Layanan Konsultasi & Tax Services Profesional"}
          </h2>
          <p className="text-[14px] leading-[22px] sm:text-[15px] sm:leading-[24px] text-text-secondary leading-relaxed">
            {t.services.subheading ||
              "Layanan utama Zhou: Solusi konsultasi strategis multi-disiplin dan administrasi perpajakan digital berstandar regulasi Coretax DJP."}
          </p>
        </div>

        {/* 4 Core Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((service) => (
            <Card
              key={service.id}
              className="hover:border-primary hover:shadow-md transition-all duration-200 flex flex-col justify-between w-full rounded-2xl bg-white border-primary-light p-5 space-y-5"
            >
              <div className="space-y-3">
                <CardHeader className="p-0 space-y-2">
                  <Link
                    href={getAuthHref(service.route)}
                    className="hover:underline"
                  >
                    <CardTitle className="text-base font-bold text-primary leading-snug">
                      {service.name}
                    </CardTitle>
                  </Link>
                  <CardDescription className="text-xs text-text-secondary line-clamp-3 leading-relaxed min-h-[3rem]">
                    {service.subtitle}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-0 pt-2 space-y-2 text-xs text-text-primary">
                  {service.pillars.slice(0, 3).map((pillar, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircleIcon className="text-emerald-600 text-xs shrink-0 mt-0.5" />
                      <span className="line-clamp-1 text-[11px] font-medium text-text-secondary">
                        {pillar.title}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </div>

              <CardFooter className="p-0 pt-4 border-t border-primary-light/80">
                <a
                  href={`https://wa.me/${waPhone}?text=${encodeURIComponent(
                    service.waTemplate
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-1.5 h-9 rounded-lg bg-[#060D22] hover:bg-[#111e42] text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  <WhatsappIcon className="text-xs text-emerald-400" />
                  <span>Konsultasi</span>
                </a>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
