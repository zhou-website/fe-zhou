import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircleIcon, ShieldTaxIcon, BriefcaseIcon } from "@/components/icons";

export function AboutSection() {
  return (
    <section id="profil" className="py-20 bg-white border-b border-primary-light scroll-mt-20">
      <div className="container-custom space-y-12">
        <div className="max-w-2xl space-y-3">
          <Badge variant="silver" className="uppercase tracking-wider text-badge font-bold">
            Profil Perusahaan
          </Badge>
          <h2 className="text-section-heading font-bold text-primary tracking-tight">
            Dedikasi Menuju Kemitraan Keuangan yang Transparan &amp; Berkelanjutan
          </h2>
          <p className="text-body-large text-text-secondary leading-relaxed">
            Zhou Consulting hadir sebagai mitra strategis dalam tata kelola akuntansi, perencanaan perpajakan, dan konsultasi keuangan komprehensif. Kami mengutamakan kepatuhan terhadap perundang-undangan fiskal nasional demi ketenangan pertumbuhan usaha Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Visi & Misi */}
          <div className="p-6 rounded-lg border border-primary-light bg-surface space-y-4">
            <div className="w-10 h-10 rounded-md bg-primary-light flex items-center justify-center text-primary">
              <ShieldTaxIcon />
            </div>
            <h3 className="text-card-heading font-semibold text-primary">Visi &amp; Komitmen Kepatuhan</h3>
            <p className="text-body-regular text-text-secondary leading-relaxed">
              Menjadi kantor konsultan akuntansi dan perpajakan terdepan yang mengedepankan akurasi, integritas, dan keselarasan penuh dengan transformasi digital Coretax DJP.
            </p>
          </div>

          {/* Card 2: Profesionalisme */}
          <div className="p-6 rounded-lg border border-primary-light bg-surface space-y-4">
            <div className="w-10 h-10 rounded-md bg-primary-light flex items-center justify-center text-primary">
              <BriefcaseIcon />
            </div>
            <h3 className="text-card-heading font-semibold text-primary">Standar Profesional Tinggi</h3>
            <p className="text-body-regular text-text-secondary leading-relaxed">
              Didukung tim konsultan ahli bersertifikat resmi, berpengalaman menangani berbagai sektor industri dari UMKM hingga entitas perseroan skala multinasional.
            </p>
          </div>

          {/* Card 3: Nilai Utama */}
          <div className="p-6 rounded-lg border border-primary-light bg-surface space-y-4">
            <div className="w-10 h-10 rounded-md bg-primary-light flex items-center justify-center text-primary">
              <CheckCircleIcon />
            </div>
            <h3 className="text-card-heading font-semibold text-primary">Tata Kelola Berkelanjutan</h3>
            <p className="text-body-regular text-text-secondary leading-relaxed">
              Kami mendampingi restrukturisasi pembukuan, mitigasi risiko fiskal, dan efisiensi laporan keuangan secara terukur demi kelangsungan operasional yang sehat.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
