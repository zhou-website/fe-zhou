"use client";

import React, { useState, useEffect } from "react";
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
import { CheckCircleIcon, DocumentIcon } from "@/components/icons";
import { useLanguage } from "@/context/LanguageContext";
import {
  StoredRegulationItem,
  StoredKmkData,
  DEFAULT_KMK_DATA,
  getStoredRegulations,
  getStoredKmkRates,
  REGULATIONS_EVENT,
  KMK_RATES_EVENT,
} from "@/data/regulasiStorage";
import { publicApi, RegulationItem, TaxRateItem } from "@/lib/api";

export function RegulationsSection() {
  const { t } = useLanguage();
  const [regulations, setRegulations] = useState<StoredRegulationItem[]>([]);
  const [kmkData, setKmkData] = useState<StoredKmkData>(DEFAULT_KMK_DATA);

  useEffect(() => {
    let isMounted = true;
    setRegulations(getStoredRegulations());
    setKmkData(getStoredKmkRates());

    const handleRegUpdate = (e: Event) => {
      const custom = e as CustomEvent<StoredRegulationItem[]>;
      if (custom.detail) {
        setRegulations(custom.detail);
      } else {
        setRegulations(getStoredRegulations());
      }
    };

    const handleKmkUpdate = () => {
      setKmkData(getStoredKmkRates());
    };

    window.addEventListener(REGULATIONS_EVENT, handleRegUpdate);
    window.addEventListener(KMK_RATES_EVENT, handleKmkUpdate);

    // Fetch live backend regulations
    publicApi
      .getRegulations()
      .then((res) => {
        if (!isMounted) return;
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          const apiRegs: StoredRegulationItem[] = res.data.map((item: RegulationItem) => ({
            id: `BE-${item.id}`,
            docNumber: item.title,
            title: item.title,
            category: "Peraturan Menteri",
            effectiveDate: new Date(item.created_at || Date.now()).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
            scope: item.regulation_type || "Regulasi kepatuhan perpajakan nasional.",
            fileSize: item.file_size || "1.2 MB",
            status: "Berlaku",
            downloadUrl: item.file_path || "#",
          }));

          setRegulations((prev) => {
            const titles = new Set(apiRegs.map((r) => r.docNumber.toLowerCase()));
            const localOnly = prev.filter((p) => !titles.has(p.docNumber.toLowerCase()));
            return [...apiRegs, ...localOnly];
          });
        }
      })
      .catch((err) => {
        console.warn("publicApi.getRegulations fallback in RegulationsSection:", err);
      });

    // Fetch live backend tax rates
    publicApi
      .getLatestTaxRates()
      .then((res) => {
        if (!isMounted) return;
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          const mappedRates = res.data.map((r: TaxRateItem) => ({
            currency: r.currency_code,
            name: r.currency_code === "USD" ? "Dolar Amerika Serikat" : r.currency_code,
            rate: `Rp ${Number(r.rate_value).toLocaleString("id-ID")},00`,
            change: "+0,00%",
            trend: "flat" as const,
          }));

          setKmkData((prev) => ({
            ...prev,
            kmkNumber: `KMK No. ${new Date().getFullYear()}`,
            period: new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" }),
            rates: mappedRates,
          }));
        }
      })
      .catch((err) => {
        console.warn("publicApi.getLatestTaxRates fallback in RegulationsSection:", err);
      });

    return () => {
      isMounted = false;
      window.removeEventListener(REGULATIONS_EVENT, handleRegUpdate);
      window.removeEventListener(KMK_RATES_EVENT, handleKmkUpdate);
    };
  }, []);

  const displayRegulations = regulations.slice(0, 3);

  return (
    <section
      id="peraturan"
      aria-label="Regulasi dan Kurs Pajak"
      className="py-16 md:py-20 lg:py-24 bg-white border-b border-primary-light scroll-mt-20"
    >
      <div className="container-custom space-y-12">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
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
                    {kmkData.kmkNumber && kmkData.kmkNumber !== "-" && (
                      <Badge variant="secondary" size="sm">
                        {kmkData.kmkNumber}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-text-secondary mt-0.5 block">
                    {kmkData.period && kmkData.period !== "-"
                      ? `Periode Aktif: ${kmkData.period}`
                      : "Pembaruan kurs mingguan resmi Kemenkeu"}
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
                  {kmkData.rates.length > 0 ? (
                    kmkData.rates.map((item) => (
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
                              item.trend === "up"
                                ? "text-success font-semibold inline-flex items-center gap-1"
                                : "text-text-secondary font-medium inline-flex items-center gap-1"
                            }
                          >
                            {item.change}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10 text-xs text-text-secondary">
                        Belum ada penetapan kurs pajak KMK periode terbaru oleh admin.
                      </TableCell>
                    </TableRow>
                  )}
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
              {displayRegulations.length > 0 ? (
                displayRegulations.map((reg) => (
                  <div
                    key={reg.id}
                    className="p-3.5 rounded-lg bg-white border border-primary-light flex items-start justify-between gap-3 text-xs hover:border-silver transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-primary">
                          {reg.docNumber || reg.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-text-secondary leading-normal line-clamp-2">
                        {reg.title !== reg.docNumber ? reg.title : reg.scope}
                      </p>
                    </div>
                    <Badge variant="outline" size="sm" className="whitespace-nowrap flex-shrink-0">
                      {reg.fileSize || "PDF"}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="p-6 rounded-lg bg-white border border-primary-light text-center space-y-2">
                  <DocumentIcon className="mx-auto text-silver text-2xl" />
                  <p className="text-xs font-medium text-text-secondary">
                    Belum ada dokumen regulasi yang dipublikasikan.
                  </p>
                  <p className="text-[11px] text-text-muted">
                    Regulasi resmi akan tampil otomatis setelah ditambahkan oleh admin melalui dashboard.
                  </p>
                </div>
              )}
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
