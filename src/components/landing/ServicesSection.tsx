"use client";

import React, { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookIcon,
  ShieldTaxIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from "@/components/icons";

export function ServicesSection() {
  const [activeTab, setActiveTab] = useState<"all" | "konsultasi" | "tax">("all");

  return (
    <section
      id="layanan"
      aria-label="Katalog Layanan"
      className="py-16 md:py-20 lg:py-24 bg-surface border-b border-primary-light scroll-mt-20"
    >
      <div className="container-custom space-y-10 md:space-y-12">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <Badge variant="silver" className="uppercase tracking-wider text-badge font-semibold py-1 px-3">
              Katalog Layanan
            </Badge>
            <h2 className="text-[20px] leading-[28px] sm:text-[21px] sm:leading-[29px] lg:text-section-heading font-bold text-primary tracking-tight text-balance">
              Spektrum Layanan Konsultasi &amp; Tax Service Profesional
            </h2>
            <p className="text-[15px] leading-[24px] sm:text-body-large text-text-secondary leading-relaxed">
              Solusi terintegrasi yang disesuaikan dengan kebutuhan entitas usaha, mulai dari konsultasi kepatuhan hukum, advisori finansial bisnis, hingga tata kelola perpajakan selaras Coretax DJP.
            </p>
          </div>

          <Button variant="primary" asChild className="self-start sm:self-auto">
            <Link href="#kontak">Konsultasi Sekarang</Link>
          </Button>
        </div>

        {/* Category Filter Tabs with Design System Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as "all" | "konsultasi" | "tax")}
          className="w-full"
        >
          <TabsList className="bg-white border-primary-light h-auto p-1.5 flex flex-wrap justify-start gap-1">
            <TabsTrigger value="all" className="text-xs">
              Semua Layanan
            </TabsTrigger>
            <TabsTrigger value="konsultasi" className="text-xs">
              Konsultasi (Hukum, Bisnis, Akuntansi)
            </TabsTrigger>
            <TabsTrigger value="tax" className="text-xs">
              Tax Service Core
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Services Cards Grid */}
        <div
          className={cn(
            "grid gap-6",
            activeTab === "all"
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          )}
        >
          {/* Card 1: Konsultasi Hukum */}
          {(activeTab === "all" || activeTab === "konsultasi") && (
            <div id="layanan-hukum" className="scroll-mt-28 flex">
              <Card className="hover:border-primary hover:shadow-md transition-all duration-200 flex flex-col justify-between w-full rounded-lg bg-white">
                <CardHeader className="space-y-3 pb-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-md bg-primary-light flex items-center justify-center text-primary text-base">
                      <BriefcaseIcon />
                    </div>
                    <Badge variant="silver" size="sm">
                      Konsultasi
                    </Badge>
                  </div>
                  <div>
                    <CardTitle className="text-card-heading font-semibold text-primary">
                      Konsultasi Hukum
                    </CardTitle>
                    <CardDescription className="text-sm text-text-secondary mt-1">
                      Kepatuhan regulasi korporat, legalitas perizinan usaha, dan telaah aspek legal transaksi bisnis.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2.5 text-xs text-text flex-1 pt-0">
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="text-success text-xs flex-shrink-0 mt-0.5" />
                    <span>Telaah Perjanjian &amp; Kontrak Kerja Sama Bisnis</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="text-success text-xs flex-shrink-0 mt-0.5" />
                    <span>Legalitas Badan Usaha &amp; Perizinan OSS RBA</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="text-success text-xs flex-shrink-0 mt-0.5" />
                    <span>Tata Kelola Perusahaan (Corporate Governance)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="text-success text-xs flex-shrink-0 mt-0.5" />
                    <span>Mitigasi Sengketa Bisnis &amp; Aspek Legal Fiskal</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <Button variant="card-action" asChild className="group w-full justify-between">
                    <Link href="#kontak">
                      <span>Konsultasi Hukum</span>
                      <ArrowRightIcon className="text-xs text-primary transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {/* Card 2: Konsultasi Business Financial */}
          {(activeTab === "all" || activeTab === "konsultasi") && (
            <div id="layanan-bisnis" className="scroll-mt-28 flex">
              <Card className="hover:border-primary hover:shadow-md transition-all duration-200 flex flex-col justify-between w-full rounded-lg bg-white">
                <CardHeader className="space-y-3 pb-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-md bg-primary-light flex items-center justify-center text-primary text-base">
                      <BriefcaseIcon />
                    </div>
                    <Badge variant="silver" size="sm">
                      Konsultasi
                    </Badge>
                  </div>
                  <div>
                    <CardTitle className="text-card-heading font-semibold text-primary">
                      Business Financial Consulting
                    </CardTitle>
                    <CardDescription className="text-sm text-text-secondary mt-1">
                      Advisori strategis finansial bisnis untuk akselerasi pertumbuhan, kelayakan investasi, dan mitigasi risiko.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2.5 text-xs text-text flex-1 pt-0">
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="text-success text-xs flex-shrink-0 mt-0.5" />
                    <span>Studi Kelayakan Bisnis (Feasibility Study)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="text-success text-xs flex-shrink-0 mt-0.5" />
                    <span>Analisis Rasio Kesehatan Finansial Perusahaan</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="text-success text-xs flex-shrink-0 mt-0.5" />
                    <span>Proyeksi Arus Kas &amp; Penganggaran Modal</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="text-success text-xs flex-shrink-0 mt-0.5" />
                    <span>Restrukturisasi Portofolio Modal &amp; Aset</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <Button variant="card-action" asChild className="group w-full justify-between">
                    <Link href="#kontak">
                      <span>Konsultasi Finansial</span>
                      <ArrowRightIcon className="text-xs text-primary transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {/* Card 3: Accounting Service */}
          {(activeTab === "all" || activeTab === "konsultasi") && (
            <div id="layanan-akuntansi" className="scroll-mt-28 flex">
              <Card className="hover:border-primary hover:shadow-md transition-all duration-200 flex flex-col justify-between w-full rounded-lg bg-white">
                <CardHeader className="space-y-3 pb-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-md bg-primary-light flex items-center justify-center text-primary text-base">
                      <BookIcon />
                    </div>
                    <Badge variant="silver" size="sm">
                      Konsultasi
                    </Badge>
                  </div>
                  <div>
                    <CardTitle className="text-card-heading font-semibold text-primary">
                      Accounting Service
                    </CardTitle>
                    <CardDescription className="text-sm text-text-secondary mt-1">
                      Penyusunan pembukuan presisi dan laporan keuangan berkala berstandar Standar Akuntansi Keuangan (SAK).
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2.5 text-xs text-text flex-1 pt-0">
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="text-success text-xs flex-shrink-0 mt-0.5" />
                    <span>Pencatatan Jurnal Transaksi &amp; Buku Besar</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="text-success text-xs flex-shrink-0 mt-0.5" />
                    <span>Laporan Neraca &amp; Laba Rugi Bulanan/Kuartalan</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="text-success text-xs flex-shrink-0 mt-0.5" />
                    <span>Rekonsiliasi Rekening Koran Bank &amp; Arus Kas</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="text-success text-xs flex-shrink-0 mt-0.5" />
                    <span>Kompilasi Laporan Keuangan Tahunan Audit SAK</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <Button variant="card-action" asChild className="group w-full justify-between">
                    <Link href="#kontak">
                      <span>Konsultasi Akuntansi</span>
                      <ArrowRightIcon className="text-xs text-primary transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {/* Card 4: Tax Service Core (Overview for 'all') */}
          {activeTab === "all" && (
            <div id="layanan-pajak" className="scroll-mt-28 flex">
              <Card className="hover:border-primary border-primary/30 shadow-sm hover:shadow-md transition-all duration-200 bg-white flex flex-col justify-between w-full rounded-lg">
                <CardHeader className="space-y-3 pb-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-md bg-primary-light flex items-center justify-center text-primary text-base">
                      <ShieldTaxIcon />
                    </div>
                    <Badge variant="success" size="sm" dot>
                      Standar Coretax
                    </Badge>
                  </div>
                  <div>
                    <CardTitle className="text-card-heading font-semibold text-primary">
                      Tax Service Core
                    </CardTitle>
                    <CardDescription className="text-sm text-text-secondary mt-1">
                      Penataan administrasi perpajakan menyeluruh dan kepatuhan penuh regulasi sistem digital Coretax DJP.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2.5 text-xs text-text flex-1 pt-0">
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="text-success text-xs flex-shrink-0 mt-0.5" />
                    <span>Pelaporan SPT Masa PPh &amp; e-Faktur PPN</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="text-success text-xs flex-shrink-0 mt-0.5" />
                    <span>Penyusunan SPT Tahunan Badan &amp; Orang Pribadi</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="text-success text-xs flex-shrink-0 mt-0.5" />
                    <span>Perencanaan Pajak Efisien (Tax Planning Legal)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="text-success text-xs flex-shrink-0 mt-0.5" />
                    <span>Pendampingan Tanggapan SP2DK &amp; Pemeriksaan</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <Button variant="card-action" asChild className="group w-full justify-between">
                    <Link href="#kontak">
                      <span>Konsultasi Pajak</span>
                      <ArrowRightIcon className="text-xs text-primary transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {/* Dedicated Tax Service Specialist Cards (When 'tax' tab is active) */}
          {activeTab === "tax" && (
            <>
              {/* Tax Sub-Service 1: Kepatuhan & Pelaporan Rutin */}
              <div className="scroll-mt-28 flex">
                <Card className="hover:border-primary hover:shadow-md transition-all duration-200 flex flex-col justify-between w-full rounded-lg bg-white">
                  <CardHeader className="space-y-3 pb-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-md bg-primary-light flex items-center justify-center text-primary text-base">
                        <ShieldTaxIcon />
                      </div>
                      <Badge variant="success" size="sm" dot>
                        Coretax DJP
                      </Badge>
                    </div>
                    <div>
                      <CardTitle className="text-card-heading font-semibold text-primary">
                        Kepatuhan &amp; Pelaporan SPT
                      </CardTitle>
                      <CardDescription className="text-sm text-text-secondary mt-1">
                        Pengelolaan kepatuhan SPT Masa dan SPT Tahunan terintegrasi ekosistem Coretax DJP.
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2.5 text-xs text-text flex-1 pt-0">
                    <div className="flex items-start gap-2">
                      <CheckCircleIcon className="text-success text-xs flex-shrink-0 mt-0.5" />
                      <span>Pelaporan SPT Masa PPh 21, 23, 4(2) &amp; e-Faktur PPN</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircleIcon className="text-success text-xs flex-shrink-0 mt-0.5" />
                      <span>Penyusunan SPT Tahunan Badan 1771 &amp; Lampiran Khusus</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircleIcon className="text-success text-xs flex-shrink-0 mt-0.5" />
                      <span>Administrasi Deposit Pajak &amp; Bukti Potong Unifikasi</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircleIcon className="text-success text-xs flex-shrink-0 mt-0.5" />
                      <span>Rekonsiliasi Fiskal &amp; Validasi NPWP 16 Digit / NITKU</span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button variant="card-action" asChild className="group w-full justify-between">
                      <Link href="#kontak">
                        <span>Konsultasi Pelaporan SPT</span>
                        <ArrowRightIcon className="text-xs text-primary transition-transform duration-200 group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              {/* Tax Sub-Service 2: Perencanaan Pajak Strategis */}
              <div className="scroll-mt-28 flex">
                <Card className="hover:border-primary hover:shadow-md transition-all duration-200 flex flex-col justify-between w-full rounded-lg bg-white">
                  <CardHeader className="space-y-3 pb-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-md bg-primary-light flex items-center justify-center text-primary text-base">
                        <BookIcon />
                      </div>
                      <Badge variant="silver" size="sm">
                        Strategic Advisory
                      </Badge>
                    </div>
                    <div>
                      <CardTitle className="text-card-heading font-semibold text-primary">
                        Tax Planning &amp; Advisory
                      </CardTitle>
                      <CardDescription className="text-sm text-text-secondary mt-1">
                        Strategi efisiensi beban fiskal korporat yang legal dan berdaya saing sesuai regulasi UU HPP.
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2.5 text-xs text-text flex-1 pt-0">
                    <div className="flex items-start gap-2">
                      <CheckCircleIcon className="text-success text-xs flex-shrink-0 mt-0.5" />
                      <span>Analisis Tarif Beban Pajak Efektif (Effective Tax Rate)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircleIcon className="text-success text-xs flex-shrink-0 mt-0.5" />
                      <span>Pemanfaatan Insentif Fiskal &amp; Super Tax Deduction</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircleIcon className="text-success text-xs flex-shrink-0 mt-0.5" />
                      <span>Telaah Kebijakan Dividen &amp; Ekualisasi Penghasilan</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircleIcon className="text-success text-xs flex-shrink-0 mt-0.5" />
                      <span>Dokumentasi Transfer Pricing (TP Doc Lokal &amp; Induk)</span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button variant="card-action" asChild className="group w-full justify-between">
                      <Link href="#kontak">
                        <span>Konsultasi Tax Planning</span>
                        <ArrowRightIcon className="text-xs text-primary transition-transform duration-200 group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              {/* Tax Sub-Service 3: Pendampingan SP2DK & Litigasi */}
              <div className="scroll-mt-28 flex">
                <Card className="hover:border-primary hover:shadow-md transition-all duration-200 flex flex-col justify-between w-full rounded-lg bg-white">
                  <CardHeader className="space-y-3 pb-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-md bg-primary-light flex items-center justify-center text-primary text-base">
                        <BriefcaseIcon />
                      </div>
                      <Badge variant="error" size="sm">
                        Audit &amp; SP2DK
                      </Badge>
                    </div>
                    <div>
                      <CardTitle className="text-card-heading font-semibold text-primary">
                        Pendampingan SP2DK &amp; Audit
                      </CardTitle>
                      <CardDescription className="text-sm text-text-secondary mt-1">
                        Solusi profesional dan responsif menghadapi surat klarifikasi fiskal dan audit pemeriksa DJP.
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2.5 text-xs text-text flex-1 pt-0">
                    <div className="flex items-start gap-2">
                      <CheckCircleIcon className="text-success text-xs flex-shrink-0 mt-0.5" />
                      <span>Analisis Data Pihak Ketiga &amp; Telaah Materi SP2DK</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircleIcon className="text-success text-xs flex-shrink-0 mt-0.5" />
                      <span>Penyusunan Kertas Kerja Tanggapan Resmi ke AR KPP</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircleIcon className="text-success text-xs flex-shrink-0 mt-0.5" />
                      <span>Pendampingan Pembahasan Akhir Hasil Pemeriksaan</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircleIcon className="text-success text-xs flex-shrink-0 mt-0.5" />
                      <span>Mitigasi Sanksi Administrasi &amp; Pengajuan Keberatan</span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button variant="card-action" asChild className="group w-full justify-between">
                      <Link href="#kontak">
                        <span>Konsultasi Sengketa Pajak</span>
                        <ArrowRightIcon className="text-xs text-primary transition-transform duration-200 group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </>
          )}
        </div>

        {/* Coretax DJP Integration Highlight Banner */}
        <div className="p-6 md:p-8 rounded-xl bg-white border border-primary-light shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge variant="success" size="sm" dot>
                Kesiapan Sistem 2026
              </Badge>
              <span className="text-xs font-semibold text-primary">
                Standar Kepatuhan Coretax DJP
              </span>
            </div>
            <h3 className="text-base font-bold text-primary">
              Transisi Pembukuan &amp; Pelaporan Pajak Tanpa Kendala Bersama Zhou Consulting
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Seluruh konsultan pajak dan staf akuntan kami telah menguasai arsitektur proses bisnis Coretax, mulai dari integrasi deposit pajak, e-Bupot unifikasi, hingga mitigasi perbedaan data SPT tahunan.
            </p>
          </div>
          <Button variant="primary" asChild className="whitespace-nowrap flex-shrink-0">
            <Link href="#kontak" className="inline-flex items-center gap-2">
              <span>Konsultasi Kesiapan Coretax</span>
              <ArrowRightIcon className="text-xs" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

