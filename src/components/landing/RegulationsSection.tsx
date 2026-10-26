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
import { Skeleton } from "@/components/ui/skeleton";
import { DocumentIcon } from "@/components/icons";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import {
  StoredRegulationItem,
  StoredKmkData,
  mapToRegulationCategory,
  getStoredRegulations,
  getStoredKmkRates,
  syncKmkRatesFromDjp,
  REGULATIONS_EVENT,
  KMK_RATES_EVENT,
} from "@/data/regulasiStorage";
import { isCmsItemDeleted } from "@/data/cmsDeletedStorage";
import { getCmsItemStatus, CMS_STATUS_UPDATED_EVENT } from "@/data/cmsStatusStorage";
import { publicApi, RegulationItem } from "@/lib/api";

export function RegulationsSection() {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [regulations, setRegulations] = useState<StoredRegulationItem[]>([]);
  const [kmkData, setKmkData] = useState<StoredKmkData>(() => getStoredKmkRates());
  const [isLoadingRegs, setIsLoadingRegs] = useState<boolean>(true);
  const [isLoadingKmk, setIsLoadingKmk] = useState<boolean>(true);

  const getAuthHref = (target: string) => {
    if (target.startsWith("/dashboard") && !isAuthenticated) {
      return `/login?redirect=${encodeURIComponent(target)}`;
    }
    return target;
  };

  useEffect(() => {
    let isMounted = true;

    const getPublishedStoredRegs = () => {
      return getStoredRegulations().filter((r) => {
        if (isCmsItemDeleted(r.id, r.title, undefined, r.docNumber)) return false;
        const pubStatus = getCmsItemStatus(
          r.id,
          r.title,
          r.status === "Draft" ? "Draft" : "Published",
          [r.docNumber]
        );
        return pubStatus === "Published";
      });
    };

    setRegulations(getPublishedStoredRegs());

    // Fetch live backend regulations
    publicApi
      .getRegulations()
      .then((res) => {
        if (!isMounted) return;
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          const apiRegs: StoredRegulationItem[] = res.data
            .filter((item: RegulationItem) => {
              if (isCmsItemDeleted(item.id, item.title, undefined, item.file_path)) return false;
              const pubStatus = getCmsItemStatus(`BE-${item.id}`, item.title, "Published", [item.id]);
              return pubStatus === "Published";
            })
            .map((item: RegulationItem) => {
              const category = mapToRegulationCategory(item.regulation_type, item.title);
              return {
                id: `BE-${item.id}`,
                docNumber: item.title,
                title: item.title,
                category,
                effectiveDate: new Date(item.created_at || Date.now()).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }),
                scope: item.regulation_type || category,
                fileSize: item.file_size || "1.2 MB",
                status: "Published",
                downloadUrl: item.file_path || "#",
              };
            });

          setRegulations(apiRegs);
        } else if (res?.data && Array.isArray(res.data) && res.data.length === 0) {
          setRegulations([]);
        }
      })
      .catch((err) => {
        console.warn("publicApi.getRegulations in RegulationsSection:", err);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingRegs(false);
        }
      });

    const handleUpdate = () => {
      setRegulations(getPublishedStoredRegs());
      setKmkData(getStoredKmkRates());
    };

    window.addEventListener(REGULATIONS_EVENT, handleUpdate);
    window.addEventListener(KMK_RATES_EVENT, handleUpdate);
    window.addEventListener(CMS_STATUS_UPDATED_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);

    // Sinkronisasi otomatis kurs KMK langsung dari DJP / Kementerian Keuangan
    syncKmkRatesFromDjp()
      .then((liveKmk) => {
        if (!isMounted) return;
        setKmkData(liveKmk);
      })
      .catch((err) => {
        console.warn("syncKmkRatesFromDjp in RegulationsSection:", err);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingKmk(false);
        }
      });

    return () => {
      isMounted = false;
      window.removeEventListener(REGULATIONS_EVENT, handleUpdate);
      window.removeEventListener(KMK_RATES_EVENT, handleUpdate);
      window.removeEventListener(CMS_STATUS_UPDATED_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
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
              <div className="bg-surface px-4 sm:px-5 py-3.5 sm:py-4 border-b border-primary-light flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-primary">
                      Kurs Menteri Keuangan (KMK)
                    </h3>
                    {isLoadingKmk ? (
                      <Skeleton className="h-5 w-20 rounded-full" />
                    ) : kmkData.kmkNumber && kmkData.kmkNumber !== "-" ? (
                      <Badge variant="secondary" size="sm">
                        {kmkData.kmkNumber}
                      </Badge>
                    ) : null}
                  </div>
                  <span className="text-xs text-text-secondary mt-0.5 block">
                    {isLoadingKmk ? (
                      <Skeleton className="h-3.5 w-44 mt-1" />
                    ) : kmkData.period && kmkData.period !== "-" ? (
                      `Periode: ${kmkData.period}`
                    ) : (
                      "Pembaruan kurs mingguan resmi Kemenkeu"
                    )}
                  </span>
                </div>
                <a
                  href={kmkData.officialDjpUrl || "https://fiskal.kemenkeu.go.id/informasi-publik/kurs-pajak"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-primary bg-primary/10 hover:bg-primary hover:text-white transition-colors shrink-0"
                >
                  Buka Portal Resmi DJP
                </a>
              </div>

              <Table className="min-w-[480px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="py-3 px-3 sm:px-5">Mata Uang</TableHead>
                    <TableHead className="py-3 px-3 sm:px-5">Nama Valuta</TableHead>
                    <TableHead className="py-3 px-3 sm:px-5 text-right">Nilai Kurs (IDR)</TableHead>
                    <TableHead className="py-3 px-3 sm:px-5 text-right">Fluktuasi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingKmk ? (
                    [1, 2, 3, 4, 5].map((i) => (
                      <TableRow key={i}>
                        <TableCell className="py-3 px-3 sm:px-5">
                          <Skeleton className="h-4 w-12" />
                        </TableCell>
                        <TableCell className="py-3 px-3 sm:px-5">
                          <Skeleton className="h-4 w-32" />
                        </TableCell>
                        <TableCell className="py-3 px-3 sm:px-5 text-right">
                          <Skeleton className="h-4 w-24 ml-auto" />
                        </TableCell>
                        <TableCell className="py-3 px-3 sm:px-5 text-right">
                          <Skeleton className="h-4 w-14 ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : kmkData.rates.length > 0 ? (
                    kmkData.rates.map((item) => (
                      <TableRow key={item.currency} className="hover:bg-surface/50">
                        <TableCell className="py-3 px-3 sm:px-5 font-bold text-primary">
                          {item.currency}
                        </TableCell>
                        <TableCell className="py-3 px-3 sm:px-5 text-text-secondary text-xs">
                          {item.name}
                        </TableCell>
                        <TableCell className="py-3 px-3 sm:px-5 text-right font-semibold text-text">
                          {item.rate}
                        </TableCell>
                        <TableCell className="py-3 px-3 sm:px-5 text-right text-xs">
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

            {/* Regulation Documents List */}
            <div className="space-y-2.5">
              {isLoadingRegs ? (
                [1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-lg bg-white border border-primary-light space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-4 w-12 rounded-sm" />
                    </div>
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-4/5" />
                  </div>
                ))
              ) : displayRegulations.length > 0 ? (
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

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5 sm:gap-2">
              <Button
                variant="primary"
                size="sm"
                asChild
                className="w-full sm:flex-1 h-11 sm:h-9 px-4 sm:px-3 text-sm sm:text-xs font-semibold justify-center gap-2 rounded-lg"
              >
                <Link
                  href={getAuthHref("/peraturan")}
                  className="inline-flex items-center justify-center gap-2 w-full h-full"
                >
                  <span>{t.regulations.btnAll}</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="w-full sm:flex-1 h-11 sm:h-9 px-4 sm:px-3 text-sm sm:text-xs font-semibold hover:border-primary justify-center gap-2 cursor-pointer shadow-xs rounded-lg"
              >
                <Link
                  href={getAuthHref("/peraturan#kurs-pajak")}
                  className="inline-flex items-center justify-center gap-2 w-full h-full"
                  title="Lihat Tabel & Unduh KMK Kurs Pajak Mingguan"
                >
                  <span>Unduh</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
