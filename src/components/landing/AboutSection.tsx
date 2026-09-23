"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {

} from "@/components/icons";
import { useLanguage } from "@/context/LanguageContext";

export function AboutSection() {
  const { t } = useLanguage();

  return (
    <section
      id="profil"
      aria-label="Profil Perusahaan"
      className="py-16 md:py-20 lg:py-24 bg-white border-b border-primary-light scroll-mt-20"
    >
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Sisi Kiri: Badge, Headline Utama & Aksi Cepat */}
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2">
              <Badge
                variant="silver"
                className="uppercase tracking-wider text-badge font-semibold py-1 px-3"
              >
                {t.about.badge}
              </Badge>
            </div>

            <h2 className="text-[18px] leading-[28px] sm:text-[20px] sm:leading-[32px] lg:text-[22px] lg:leading-[36px] font-medium text-primary tracking-tight text-balance">
              {t.about.headline}
            </h2>

            <div className="w-16 h-1 bg-primary rounded-full" />

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Button variant="primary" size="sm" asChild className="text-xs font-semibold">
                <Link href="/konsultasi">
                  <span>{t.about.btnSchedule}</span>
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="text-xs font-semibold">
                <Link href="/#layanan">{t.about.btnCatalog}</Link>
              </Button>
            </div>
          </div>

          {/* Sisi Kanan: Kartu Narasi Mengapa Zhou Consulting */}
          <div className="lg:col-span-6" id="mengapa-zhou">
            <div className="p-6 sm:p-8 md:p-9 rounded-2xl bg-surface border border-primary-light shadow-xs relative overflow-hidden space-y-4">
              <div className="inline-flex items-center">
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-primary select-none">
                  {t.about.whyBadge}
                </span>
              </div>
              <p className="text-[14px] sm:text-[15px] leading-relaxed text-text-secondary">
                {t.about.whyText}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
