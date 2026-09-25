"use client";

import React, { useState } from "react";
import Link from "next/link";
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
  CheckCircleIcon,
} from "@/components/icons";
import { useLanguage } from "@/context/LanguageContext";

export function ServicesSection() {
  const [activeTab, setActiveTab] = useState<"all" | "konsultasi" | "tax">("all");
  const { t } = useLanguage();

  return (
    <section
      id="layanan"
      aria-label="Katalog Layanan"
      className="py-16 md:py-20 lg:py-24 bg-surface border-b border-primary-light scroll-mt-20"
    >
      <div className="container-custom space-y-10 md:space-y-12">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <Badge variant="silver" className="uppercase tracking-wider text-badge font-semibold py-1 px-3">
            {t.services.badge}
          </Badge>
          <h2 className="text-[22px] leading-[30px] sm:text-[26px] sm:leading-[34px] lg:text-[32px] lg:leading-[40px] font-bold text-primary tracking-tight text-balance">
            {t.services.headline}
          </h2>
          <p className="text-[15px] leading-[24px] sm:text-body-large text-text-secondary leading-relaxed">
            {t.services.subheading}
          </p>
        </div>

        {/* Category Filter Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as "all" | "konsultasi" | "tax")}
          className="w-full"
        >
          <TabsList className="bg-white border-primary-light h-auto p-1.5 flex flex-wrap justify-start gap-1">
            <TabsTrigger value="all" className="text-xs">
              {t.services.tabAll}
            </TabsTrigger>
            <TabsTrigger value="konsultasi" className="text-xs">
              {t.services.tabConsult}
            </TabsTrigger>
            <TabsTrigger value="tax" className="text-xs">
              {t.services.tabTax}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* SECTION GROUP 1: KONSULTASI (4 BIDANG LAYANAN) */}
        {(activeTab === "all" || activeTab === "konsultasi") && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-primary-light">
              <div className="flex items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Sub-Besar 1: Layanan Konsultasi
                </span>
              </div>
              <span className="text-xs text-text-muted">
                Pendampingan oleh Konsultan BKP, Akuntan CA &amp; Advokat PERADI
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1: Accounting Services */}
              <Card className="hover:border-primary hover:shadow-md transition-all duration-200 flex flex-col justify-between w-full rounded-xl bg-white border-primary-light">
                <CardHeader className="space-y-3 pb-3">
                  <div className="flex items-center justify-end h-6">
                    <Badge variant="silver" size="sm">
                      SAK &amp; IFRS
                    </Badge>
                  </div>
                  <div>
                    <CardTitle className="text-card-heading font-bold text-primary">
                      Accounting Services
                    </CardTitle>
                    <CardDescription className="text-xs text-text-secondary mt-1">
                      Penyusunan pembukuan presisi dan laporan keuangan berkala standar SAK EP/IFRS.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-xs text-text flex-1 pt-0">
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="text-success text-xs flex-shrink-0 mt-0.5" />
                    <span>Pencatatan Jurnal &amp; Rekonsiliasi Bank</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="text-success text-xs flex-shrink-0 mt-0.5" />
                    <span>Laporan Laba Rugi, Neraca &amp; Arus Kas</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="text-success text-xs flex-shrink-0 mt-0.5" />
                    <span>Kompilasi Laporan Keuangan Audit KAP</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-3 border-t border-primary-light">
                  <Button variant="outline" asChild className="w-full justify-center text-xs font-bold border-primary text-primary hover:bg-primary/5">
                    <Link href="/layanan/akuntansi">
                      <span>Lihat Layanan</span>
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Card 2: Business & Financial Services */}
              <Card className="hover:border-primary hover:shadow-md transition-all duration-200 flex flex-col justify-between w-full rounded-xl bg-white border-primary-light">
                <CardHeader className="space-y-3 pb-3">
                  <div className="flex items-center justify-end h-6">
                    <Badge variant="silver" size="sm">
                      Advisory
                    </Badge>
                  </div>
                  <div>
                    <CardTitle className="text-card-heading font-bold text-primary">
                      Business &amp; Financial
                    </CardTitle>
                    <CardDescription className="text-xs text-text-secondary mt-1">
                      Advisori finansial bisnis, studi kelayakan investasi, dan pemodelan proyeksi modal.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-xs text-text flex-1 pt-0">
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="text-success text-xs flex-shrink-0 mt-0.5" />
                    <span>Studi Kelayakan Bisnis (Feasibility Study)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="text-success text-xs flex-shrink-0 mt-0.5" />
                    <span>Analisis Rasio Kesehatan Finansial</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="text-success text-xs flex-shrink-0 mt-0.5" />
                    <span>Restrukturisasi Portofolio &amp; Valuasi</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-3 border-t border-primary-light">
                  <Button variant="outline" asChild className="w-full justify-center text-xs font-bold border-primary text-primary hover:bg-primary/5">
                    <Link href="/layanan/bisnis">
                      <span>Lihat Layanan</span>
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Card 3: Tax Services (Langsung ke Page Tax Service) */}
              <Card className="hover:border-primary border-primary/40 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between w-full rounded-xl bg-white">
                <CardHeader className="space-y-3 pb-3">
                  <div className="flex items-center justify-end h-6">
                    <Badge variant="silver" size="sm">
                      Tax Compliance
                    </Badge>
                  </div>
                  <div>
                    <CardTitle className="text-card-heading font-bold text-primary">
                      Tax Services
                    </CardTitle>
                    <CardDescription className="text-xs text-text-secondary mt-1">
                      Kepatuhan SPT, perencanaan pajak strategis UU HPP, dan pendampingan SP2DK.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-xs text-text flex-1 pt-0">
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="text-success text-xs flex-shrink-0 mt-0.5" />
                    <span>SPT Masa PPh, PPN &amp; SPT Tahunan Badan</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="text-success text-xs flex-shrink-0 mt-0.5" />
                    <span>Perencanaan Pajak Efisien (Tax Planning)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="text-success text-xs flex-shrink-0 mt-0.5" />
                    <span>Tanggapan SP2DK &amp; Asistensi Pemeriksaan</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-3 border-t border-primary-light">
                  <Button variant="primary" asChild className="w-full justify-center text-xs font-bold shadow-sm">
                    <Link href="/layanan/tax-service">
                      <span>Lihat Layanan</span>
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Card 4: Law Services */}
              <Card className="hover:border-primary hover:shadow-md transition-all duration-200 flex flex-col justify-between w-full rounded-xl bg-white border-primary-light">
                <CardHeader className="space-y-3 pb-3">
                  <div className="flex items-center justify-end h-6">
                    <Badge variant="silver" size="sm">
                      Hukum Korporat
                    </Badge>
                  </div>
                  <div>
                    <CardTitle className="text-card-heading font-bold text-primary">
                      Law Services
                    </CardTitle>
                    <CardDescription className="text-xs text-text-secondary mt-1">
                      Kepatuhan regulasi korporat, legalitas perizinan usaha, dan telaah kontrak.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-xs text-text flex-1 pt-0">
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="text-success text-xs flex-shrink-0 mt-0.5" />
                    <span>Telaah Perjanjian &amp; Kontrak Kerjasama</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="text-success text-xs flex-shrink-0 mt-0.5" />
                    <span>Legalitas Badan Usaha &amp; Perizinan OSS</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="text-success text-xs flex-shrink-0 mt-0.5" />
                    <span>Tata Kelola Good Corporate Governance</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-3 border-t border-primary-light">
                  <Button variant="outline" asChild className="w-full justify-center text-xs font-bold border-primary text-primary hover:bg-primary/5">
                    <Link href="/layanan/hukum">
                      <span>Lihat Layanan</span>
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}

        {/* SECTION GROUP 2: TAX SERVICE CORE (CORETAX) */}
        {activeTab === "tax" && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between pb-2 border-b border-primary-light">
              <div className="flex items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Sub-Besar 2: Tax Services
                </span>
              </div>
              <Link
                href="/layanan/tax-service"
                className="text-xs font-bold text-primary hover:underline"
              >
                <span>Panduan Tax Services</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Feature 1: e-Faktur Pajak */}
              <div className="p-4 rounded-xl bg-white border border-primary-light hover:border-primary hover:shadow-sm transition-all flex flex-col justify-between">
                <div className="space-y-2">

                  <h4 className="text-sm font-bold text-primary">e-Faktur Pajak</h4>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Penerbitan, validasi QR Code, dan rekonsiliasi faktur pajak keluaran/masukan SPT Masa PPN 1111 secara otomatis.
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-primary-light flex justify-end">
                  <Link
                    href="/layanan/tax-service#e-faktur"
                    className="text-xs font-bold text-primary hover:underline transition-colors flex items-center gap-1 group"
                  >
                    <span>Lihat Modul</span>
                  </Link>
                </div>
              </div>

              {/* Feature 2: e-Bupot 21/26 */}
              <div className="p-4 rounded-xl bg-white border border-primary-light hover:border-primary hover:shadow-sm transition-all flex flex-col justify-between">
                <div className="space-y-2">

                  <h4 className="text-sm font-bold text-primary">e-Bupot 21/26</h4>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Penghitungan tarif efektif rata-rata (TER) PP 58/2023, pembuatan bukti potong 1721-VIII &amp; 1721-A1 secara tepat.
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-primary-light flex justify-end">
                  <Link
                    href="/layanan/tax-service#e-bupot-21"
                    className="text-xs font-bold text-primary hover:underline transition-colors flex items-center gap-1 group"
                  >
                    <span>Lihat Modul</span>
                  </Link>
                </div>
              </div>

              {/* Feature 3: e-Bupot Unifikasi */}
              <div className="p-4 rounded-xl bg-white border border-primary-light hover:border-primary hover:shadow-sm transition-all flex flex-col justify-between">
                <div className="space-y-2">

                  <h4 className="text-sm font-bold text-primary">e-Bupot Unifikasi</h4>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Sentralisasi bukti pemotongan PPh Pasal 22, 23, 15, dan Final Pasal 4 ayat (2) ke dalam satu pelaporan tunggal.
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-primary-light flex justify-end">
                  <Link
                    href="/layanan/tax-service#e-bupot-unifikasi"
                    className="text-xs font-bold text-primary hover:underline transition-colors flex items-center gap-1 group"
                  >
                    <span>Lihat Modul</span>
                  </Link>
                </div>
              </div>

            </div>

            <div className="flex justify-center pt-4 mt-2">
              <Button variant="outline" asChild className="border-primary text-primary hover:bg-primary/5 font-bold text-sm px-8 shadow-sm">
                <Link href="/login">Lainnya</Link>
              </Button>
            </div>
          </div>
        )}

        {/* Unified Bottom Callout */}
        <div className="p-6 md:p-8 rounded-2xl bg-primary text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 max-w-2xl text-center md:text-left">
            <h3 className="text-lg sm:text-xl font-bold text-white">
              Membutuhkan Analisis Awal Perpajakan &amp; Keuangan Entitas Bisnis Anda?
            </h3>
            <p className="text-xs sm:text-sm text-silver leading-relaxed">
              Tim ahli Zhou Consulting siap memberikan review awal dan mitigasi risiko fiskal secara profesional dengan perlindungan kerahasiaan NDA.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="lg"
              asChild
              className="border-white/30 text-white hover:bg-white/10 font-bold text-xs sm:text-sm px-5"
            >
              <Link href="/#layanan">Katalog Layanan</Link>
            </Button>
            <Button
              variant="silver"
              size="lg"
              asChild
              className="font-bold text-xs sm:text-sm px-6 shadow-md"
            >
              <Link href="/konsultasi">Reservasi Konsultasi</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
