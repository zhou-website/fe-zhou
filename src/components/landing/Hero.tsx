import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRightIcon, ShieldTaxIcon, CheckCircleIcon } from "@/components/icons";

export function Hero() {
  return (
    <section id="hero" className="relative bg-primary-dark text-white py-16 md:py-20 lg:py-28 overflow-hidden">
      {/* Background Decorative Accent */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/50 via-primary-dark to-primary-dark pointer-events-none"
      />
      {/* Subtle grid pattern overlay for texture */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"
      />

      <div className="container-custom relative z-10 space-y-12">
        <div className="max-w-3xl space-y-6">
          {/* Badge indicator */}
          <Badge
            variant="silver"
            className="inline-flex items-center gap-2 py-1.5 px-3.5 bg-white/10 text-white border-white/20 backdrop-blur-sm shadow-sm"
          >
            <ShieldTaxIcon className="text-xs text-silver" />
            <span className="text-xs font-semibold text-white">
              Kepatuhan Berstandar Coretax DJP
            </span>
          </Badge>

          {/* Main Hero Headline */}
          <h1 className="text-[28px] leading-[36px] sm:text-[30px] sm:leading-[38px] lg:text-page-heading font-bold tracking-tight text-white">
            Solusi Terintegrasi Akuntansi, Pajak &amp; Tata Kelola Finansial Bisnis
          </h1>

          {/* Subheadline */}
          <p className="text-[15px] leading-[24px] sm:text-body-large text-silver leading-relaxed max-w-2xl">
            Zhou Consulting mendampingi entitas bisnis, korporasi, dan wirausaha dalam mencapai kepatuhan pajak paripurna, pencatatan keuangan presisi, dan strategi fiskal yang berdaya saing.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Button
              variant="silver"
              size="lg"
              asChild
              className="font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
            >
              <Link href="/#kontak" className="inline-flex items-center gap-2">
                <span>Konsultasi Sekarang</span>
                <ArrowRightIcon className="text-xs text-primary" />
              </Link>
            </Button>

            <Button
              variant="outline"
              size="lg"
              asChild
              className="border-silver/40 text-white hover:bg-white/10 hover:text-white font-semibold text-sm transition-all duration-200 active:scale-[0.98]"
            >
              <Link href="/#layanan">Lihat Katalog Layanan</Link>
            </Button>
          </div>
        </div>

        {/* Hero Trust Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-8 border-t border-white/10">
          <div className="p-4 sm:p-5 rounded-lg bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all duration-200">
            <div className="text-[28px] leading-[36px] sm:text-[30px] sm:leading-[38px] lg:text-metric-number font-bold text-white tracking-tight">
              150+
            </div>
            <div className="text-[12px] leading-[18px] sm:text-metric-label text-silver mt-1">
              Entitas Klien Korporat
            </div>
          </div>
          <div className="p-4 sm:p-5 rounded-lg bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all duration-200">
            <div className="text-[28px] leading-[36px] sm:text-[30px] sm:leading-[38px] lg:text-metric-number font-bold text-white tracking-tight">
              99.8%
            </div>
            <div className="text-[12px] leading-[18px] sm:text-metric-label text-silver mt-1">
              Akurasi Kepatuhan Pajak
            </div>
          </div>
          <div className="p-4 sm:p-5 rounded-lg bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all duration-200">
            <div className="text-[28px] leading-[36px] sm:text-[30px] sm:leading-[38px] lg:text-metric-number font-bold text-white tracking-tight">
              100%
            </div>
            <div className="text-[12px] leading-[18px] sm:text-metric-label text-silver mt-1">
              Kesiapan Sistem Coretax
            </div>
          </div>
          <div className="p-4 sm:p-5 rounded-lg bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all duration-200 flex items-center gap-3">
            <CheckCircleIcon className="text-2xl text-success flex-shrink-0" />
            <div className="text-[12px] leading-[18px] sm:text-metric-label text-silver">
              Konsultan Pajak &amp; Akuntan Tersertifikasi
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
