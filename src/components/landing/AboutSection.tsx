import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ShieldTaxIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  BuildingIcon,
  BookIcon,
  CheckIcon,
} from "@/components/icons";

export function AboutSection() {
  return (
    <section
      id="profil"
      aria-label="Profil Perusahaan"
      className="py-16 md:py-20 lg:py-24 bg-white border-b border-primary-light scroll-mt-20"
    >
      <div className="container-custom space-y-12 md:space-y-16">
        {/* Section Header */}
        <div className="max-w-3xl space-y-4">
          <Badge
            variant="silver"
            className="uppercase tracking-wider text-badge font-semibold py-1 px-3"
          >
            Profil Perusahaan
          </Badge>
          <h2 className="text-[20px] leading-[28px] sm:text-[21px] sm:leading-[29px] lg:text-section-heading font-bold text-primary tracking-tight text-balance">
            Dedikasi Menuju Kemitraan Keuangan yang Transparan &amp; Berkelanjutan
          </h2>
          <p className="text-[15px] leading-[24px] sm:text-body-large text-text-secondary leading-relaxed">
            Zhou Consulting hadir sebagai mitra strategis dalam tata kelola akuntansi, perencanaan perpajakan, dan konsultasi keuangan komprehensif. Kami mengutamakan kepatuhan terhadap perundang-undangan fiskal nasional demi ketenangan pertumbuhan usaha Anda.
          </p>
        </div>

        {/* 3 Core Pillars Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Card 1: Visi & Misi */}
          <Card className="rounded-lg border-primary-light bg-surface hover:shadow-md hover:border-silver transition-all duration-200 flex flex-col justify-between">
            <CardHeader className="space-y-4 pb-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-lg">
                <ShieldTaxIcon />
              </div>
              <CardTitle className="text-card-heading font-semibold text-primary">
                Visi &amp; Komitmen Kepatuhan
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-body-regular text-text-secondary leading-relaxed">
                Menjadi kantor konsultan akuntansi dan perpajakan terdepan yang mengedepankan akurasi, integritas, dan keselarasan penuh dengan transformasi digital Coretax DJP.
              </p>
            </CardContent>
          </Card>

          {/* Card 2: Profesionalisme */}
          <Card className="rounded-lg border-primary-light bg-surface hover:shadow-md hover:border-silver transition-all duration-200 flex flex-col justify-between">
            <CardHeader className="space-y-4 pb-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-lg">
                <BriefcaseIcon />
              </div>
              <CardTitle className="text-card-heading font-semibold text-primary">
                Standar Profesional Tinggi
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-body-regular text-text-secondary leading-relaxed">
                Didukung tim konsultan ahli bersertifikat resmi, berpengalaman menangani berbagai sektor industri dari UMKM hingga entitas perseroan skala multinasional.
              </p>
            </CardContent>
          </Card>

          {/* Card 3: Nilai Utama */}
          <Card className="rounded-lg border-primary-light bg-surface hover:shadow-md hover:border-silver transition-all duration-200 flex flex-col justify-between">
            <CardHeader className="space-y-4 pb-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-lg">
                <CheckCircleIcon />
              </div>
              <CardTitle className="text-card-heading font-semibold text-primary">
                Tata Kelola Berkelanjutan
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-body-regular text-text-secondary leading-relaxed">
                Kami mendampingi restrukturisasi pembukuan, mitigasi risiko fiskal, dan efisiensi laporan keuangan secara terukur demi kelangsungan operasional yang sehat.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Corporate Trust Credentials Bar */}
        <div className="p-6 md:p-8 rounded-xl bg-surface border border-primary-light grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-md bg-success/15 text-success flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckIcon className="text-xs" />
            </div>
            <div>
              <h4 className="text-card-heading font-semibold text-primary">
                Sertifikasi BKP Resmi
              </h4>
              <p className="text-body-small text-text-secondary mt-0.5">
                Konsultan Pajak Beregister &amp; Berizin Praktik Kemenkeu RI.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-md bg-primary-light text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
              <BuildingIcon className="text-xs" />
            </div>
            <div>
              <h4 className="text-card-heading font-semibold text-primary">
                Akuntan Beregister (CA)
              </h4>
              <p className="text-body-small text-text-secondary mt-0.5">
                Penyusunan laporan keuangan mengacu SAK ETAP &amp; IFRS.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-md bg-primary-light text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
              <BookIcon className="text-xs" />
            </div>
            <div>
              <h4 className="text-card-heading font-semibold text-primary">
                Kesiapan Sistem Coretax
              </h4>
              <p className="text-body-small text-text-secondary mt-0.5">
                Transisi proses bisnis fiskal bebas kendala dan tervalidasi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
