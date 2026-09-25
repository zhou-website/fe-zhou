"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  CheckCircleIcon,
} from "@/components/icons";
import { useLanguage } from "@/context/LanguageContext";

export function RegulationsSection() {
  const { t } = useLanguage();
  const taxRates = [
    {
      currency: "USD",
      name: "US Dollar",
      rate: "Rp 15.825,00",
      change: "+0.15%",
      status: "up",
    },
    {
      currency: "EUR",
      name: "Euro",
      rate: "Rp 16.940,00",
      change: "-0.08%",
      status: "down",
    },
    {
      currency: "SGD",
      name: "Singapore Dollar",
      rate: "Rp 11.890,00",
      change: "+0.05%",
      status: "up",
    },
    {
      currency: "CNY",
      name: "Chinese Yuan",
      rate: "Rp 2.185,00",
      change: "+0.10%",
      status: "up",
    },
    {
      currency: "JPY",
      name: "Japanese Yen (100)",
      rate: "Rp 10.450,00",
      change: "-0.22%",
      status: "down",
    },
    {
      currency: "GBP",
      name: "British Pound",
      rate: "Rp 20.150,00",
      change: "+0.18%",
      status: "up",
    },
    {
      currency: "AUD",
      name: "Australian Dollar",
      rate: "Rp 10.320,00",
      change: "-0.05%",
      status: "down",
    },
  ];

  const regulations = [
    {
      title: "UU No. 7 Tahun 2021 tentang HPP",
      category: "Undang-Undang",
      desc: "Harmonisasi Peraturan Perpajakan (PPh Badan, PPN 11%, NIK-NPWP).",
      size: "2.4 MB",
    },
    {
      title: "PMK No. 168/PMK.03/2023",
      category: "Peraturan Menteri",
      desc: "Petunjuk Teknis Pemotongan Pajak atas Penghasilan Pasal 21 (TER).",
      size: "1.8 MB",
    },
    {
      title: "Panduan Teknis Transisi Coretax DJP 2026",
      category: "Panduan Resmi",
      desc: "SOP Deposit Pajak, e-Bupot unifikasi, dan administrasi akun wajib pajak.",
      size: "3.5 MB",
    },
  ];

  return (
    <section
      id="peraturan"
      aria-label="Regulasi dan Kurs Pajak"
      className="py-16 md:py-20 lg:py-24 bg-white border-b border-primary-light scroll-mt-20"
    >
      <div className="container-custom space-y-12">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <Badge
            variant="silver"
            className="uppercase tracking-wider text-badge font-semibold py-1 px-3"
          >
            {t.regulations.badge}
          </Badge>
          <h2 className="text-[20px] leading-[28px] sm:text-[21px] sm:leading-[29px] lg:text-section-heading font-bold text-primary tracking-tight text-balance">
            {t.regulations.headline}
          </h2>
          <p className="text-[15px] leading-[24px] sm:text-body-large text-text-secondary leading-relaxed">
            {t.regulations.subheading}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Table Container (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-lg border border-primary-light bg-white overflow-hidden shadow-sm">
              <div className="bg-surface px-5 py-4 border-b border-primary-light flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-primary">
                      Kurs Menteri Keuangan (KMK)
                    </h3>
                    <Badge variant="secondary" size="sm">
                      KMK No. 38/KM.10/2026
                    </Badge>
                  </div>
                  <span className="text-xs text-text-secondary mt-0.5 block">
                    Periode Aktif: 10 September – 16 September 2026
                  </span>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="py-3 px-5">Mata Uang</TableHead>
                    <TableHead className="py-3 px-5">Nama Valuta</TableHead>
                    <TableHead className="py-3 px-5 text-right">Nilai Kurs (IDR)</TableHead>
                    <TableHead className="py-3 px-5 text-right">Fluktuasi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taxRates.map((item) => (
                    <TableRow key={item.currency} className="hover:bg-surface/50">
                      <TableCell className="py-3 px-5 font-bold text-primary">
                        {item.currency}
                      </TableCell>
                      <TableCell className="py-3 px-5 text-text-secondary text-xs">
                        {item.name}
                      </TableCell>
                      <TableCell className="py-3 px-5 text-right font-semibold text-text">
                        {item.rate}
                      </TableCell>
                      <TableCell className="py-3 px-5 text-right text-xs">
                        <span
                          className={
                            item.status === "up"
                              ? "text-success font-semibold inline-flex items-center gap-1"
                              : "text-text-secondary font-medium inline-flex items-center gap-1"
                          }
                        >
                          {item.change}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <p className="text-[11px] text-text-secondary leading-normal">
              * Nilai kurs KMK digunakan sebagai dasar pelunasan Bea Masuk, Pajak Pertambahan Nilai (PPN) Barang dan Jasa, serta Pajak Penghasilan (PPh) Pasal 22 Impor.
            </p>
          </div>

          {/* Regulation Quick Links & Downloads (5 cols) */}
          <div className="lg:col-span-5 rounded-lg border border-primary-light bg-surface p-6 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-card-heading font-semibold text-primary">
                  {t.regulations.badge}
                </h3>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                {t.regulations.subheading}
              </p>
            </div>

            {/* Official Portal Quick Link */}
            <a
              href="https://djponline.pajak.go.id"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between p-3.5 rounded-lg bg-white border border-primary-light hover:border-primary hover:shadow-sm transition-all text-xs font-semibold text-primary"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-primary-light text-primary flex items-center justify-center text-xs">
                  <CheckCircleIcon className="text-success" />
                </div>
                <span>{t.regulations.portalDjp}</span>
              </div>
            </a>

            {/* Regulation Documents List */}
            <div className="space-y-2.5">
              <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block">
                {t.regulations.docTitle}
              </span>
              {regulations.map((reg, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-lg bg-white border border-primary-light flex items-start justify-between gap-3 text-xs hover:border-silver transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-primary">
                        {reg.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-text-secondary leading-normal">
                      {reg.desc}
                    </p>
                  </div>
                  <Badge variant="outline" size="sm" className="whitespace-nowrap flex-shrink-0">
                    {reg.size}
                  </Badge>
                </div>
              ))}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <Button
                variant="primary"
                size="sm"
                asChild
                className="flex-1 text-xs font-semibold justify-center gap-2"
              >
                <Link
                  href="/peraturan"
                  className="inline-flex items-center justify-center gap-2"
                >
                  <span>{t.regulations.btnAll}</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="flex-1 text-xs font-semibold hover:border-primary justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Link
                  href="/peraturan#kurs-pajak"
                  className="inline-flex items-center justify-center gap-2"
                  title="Lihat Tabel & Unduh KMK Kurs Pajak Mingguan"
                >
                  <span>Unduh KMK (PDF)</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

