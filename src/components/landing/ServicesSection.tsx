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
    <section id="layanan" className="py-20 bg-surface border-b border-primary-light scroll-mt-20">
      <div className="container-custom space-y-12">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <Badge variant="silver" className="uppercase tracking-wider text-[11px] font-bold">
              Katalog Layanan
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
              Spektrum Layanan Konsultasi &amp; Tax Service Profesional
            </h2>
            <p className="text-text-secondary text-base leading-relaxed">
              Solusi terintegrasi yang disesuaikan dengan kebutuhan entitas usaha, mulai dari konsultasi kepatuhan hukum, advisori finansial bisnis, hingga tata kelola perpajakan selaras Coretax DJP.
            </p>
          </div>

          <Button variant="primary" asChild className="self-start sm:self-auto">
            <Link href="#kontak">Konsultasi Sekarang</Link>
          </Button>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-primary-light pb-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
              activeTab === "all"
                ? "bg-primary text-white"
                : "text-text-secondary hover:text-primary hover:bg-white"
            }`}
          >
            Semua Layanan
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("konsultasi")}
            className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
              activeTab === "konsultasi"
                ? "bg-primary text-white"
                : "text-text-secondary hover:text-primary hover:bg-white"
            }`}
          >
            Konsultasi (Hukum, Business, Akuntansi)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("tax")}
            className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
              activeTab === "tax"
                ? "bg-primary text-white"
                : "text-text-secondary hover:text-primary hover:bg-white"
            }`}
          >
            Tax Service Core
          </button>
        </div>

        {/* Services Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Konsultasi Hukum */}
          {(activeTab === "all" || activeTab === "konsultasi") && (
            <div id="layanan-hukum" className="scroll-mt-28 flex">
              <Card className="hover:border-primary transition-all duration-200 flex flex-col justify-between w-full">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 rounded-md bg-primary-light flex items-center justify-center text-primary">
                      <BriefcaseIcon />
                    </div>
                    <Badge variant="silver">Konsultasi</Badge>
                  </div>
                  <CardTitle>Konsultasi Hukum</CardTitle>
                  <CardDescription>
                    Kepatuhan regulasi korporat, legalitas perizinan usaha, dan telaah aspek legal transaksi bisnis.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2.5 text-xs text-text flex-1">
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="text-success text-xs flex-shrink-0 mt-0.5" />
                    <span>Telaah Perjanjian &amp; Kontrak Kerja Sama Bisnis</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="text-success text-xs flex-shrink-0 mt-0.5" />
                    <span>Legalitas Badan Usaha &amp; Perizinan OSS</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="text-success text-xs flex-shrink-0 mt-0.5" />
                    <span>Tata Kelola Perusahaan (Corporate Governance)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="text-success text-xs flex-shrink-0 mt-0.5" />
                    <span>Mitigasi Sengketa Bisnis &amp; Aspek Hukum Fiskal</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="card-action" asChild className="w-full justify-between">
                    <Link href="#kontak">
                      <span>Konsultasi Hukum</span>
                      <ArrowRightIcon className="text-xs" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {/* Card 2: Konsultasi Business */}
          {(activeTab === "all" || activeTab === "konsultasi") && (
            <div id="layanan-bisnis" className="scroll-mt-28 flex">
              <Card className="hover:border-primary transition-all duration-200 flex flex-col justify-between w-full">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 rounded-md bg-primary-light flex items-center justify-center text-primary">
                      <BriefcaseIcon />
                    </div>
                    <Badge variant="silver">Konsultasi</Badge>
                  </div>
                  <CardTitle>Konsultasi Business</CardTitle>
                  <CardDescription>
                    Advisori strategis finansial bisnis untuk akselerasi pertumbuhan, kelayakan investasi, dan mitigasi risiko.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2.5 text-xs text-text flex-1">
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
                <CardFooter>
                  <Button variant="card-action" asChild className="w-full justify-between">
                    <Link href="#kontak">
                      <span>Konsultasi Finansial</span>
                      <ArrowRightIcon className="text-xs" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {/* Card 3: Accounting Service */}
          {(activeTab === "all" || activeTab === "konsultasi") && (
            <div id="layanan-akuntansi" className="scroll-mt-28 flex">
              <Card className="hover:border-primary transition-all duration-200 flex flex-col justify-between w-full">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 rounded-md bg-primary-light flex items-center justify-center text-primary">
                      <BookIcon />
                    </div>
                    <Badge variant="silver">Konsultasi</Badge>
                  </div>
                  <CardTitle>Accounting Service</CardTitle>
                  <CardDescription>
                    Penyusunan pembukuan presisi dan laporan keuangan berkala berstandar Standar Akuntansi Keuangan (SAK).
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2.5 text-xs text-text flex-1">
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
                    <span>Kompilasi Laporan Keuangan Tahunan Audit</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="card-action" asChild className="w-full justify-between">
                    <Link href="#kontak">
                      <span>Konsultasi Akuntansi</span>
                      <ArrowRightIcon className="text-xs" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {/* Card 4: Tax Service Core */}
          {(activeTab === "all" || activeTab === "tax") && (
            <div id="layanan-pajak" className="scroll-mt-28 flex">
              <Card className="hover:border-primary border-primary/40 shadow-sm transition-all duration-200 bg-white flex flex-col justify-between w-full">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 rounded-md bg-primary-light flex items-center justify-center text-primary">
                      <ShieldTaxIcon />
                    </div>
                    <Badge variant="success">Standar Coretax</Badge>
                  </div>
                  <CardTitle>Tax Service Core</CardTitle>
                  <CardDescription>
                    Penataan administrasi perpajakan menyeluruh dan kepatuhan penuh regulasi sistem digital Coretax DJP.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2.5 text-xs text-text flex-1">
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="text-success text-xs flex-shrink-0 mt-0.5" />
                    <span>Pelaporan SPT Masa PPh &amp; Faktur Pajak PPN</span>
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
                <CardFooter>
                  <Button variant="card-action" asChild className="w-full justify-between">
                    <Link href="#kontak">
                      <span>Konsultasi Pajak</span>
                      <ArrowRightIcon className="text-xs" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

