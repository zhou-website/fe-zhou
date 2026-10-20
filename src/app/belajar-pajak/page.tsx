"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { FloatingWhatsAppCTA } from "@/components/landing/FloatingWhatsAppCTA";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  CheckCircleIcon,
  ShieldTaxIcon,
  SearchIcon,
  CloseIcon,
} from "@/components/icons";
import { BelajarPajakLink } from "@/data/edukasiData";
import {
  getStoredBelajarPajakLinks,
  GOV_LINKS_EVENT,
} from "@/data/edukasiStorage";
import { getCmsItemStatus, CMS_STATUS_UPDATED_EVENT } from "@/data/cmsStatusStorage";

export default function BelajarPajakPage() {
  const [belajarPajakList, setBelajarPajakList] = useState<BelajarPajakLink[]>([]);
  const [institutionFilter, setInstitutionFilter] = useState<"all" | "DJP" | "Kemenkeu">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    setBelajarPajakList(getStoredBelajarPajakLinks());

    const handleLinksUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<BelajarPajakLink[]>;
      if (customEvent.detail && Array.isArray(customEvent.detail)) {
        setBelajarPajakList(customEvent.detail);
      } else {
        setBelajarPajakList(getStoredBelajarPajakLinks());
      }
    };

    const handleStorage = () => {
      setBelajarPajakList(getStoredBelajarPajakLinks());
    };

    window.addEventListener(GOV_LINKS_EVENT, handleLinksUpdate);
    window.addEventListener(CMS_STATUS_UPDATED_EVENT, handleStorage);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(GOV_LINKS_EVENT, handleLinksUpdate);
      window.removeEventListener(CMS_STATUS_UPDATED_EVENT, handleStorage);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const activeBelajarPajakSource = useMemo(() => {
    return belajarPajakList.filter((item) => {
      const currentStatus = getCmsItemStatus(`gov-${item.id}`, item.status || "Published");
      return currentStatus === "Published";
    });
  }, [belajarPajakList]);

  const filteredBelajarPajak = useMemo(() => {
    return activeBelajarPajakSource.filter((item) => {
      const matchInst = institutionFilter === "all" || item.institution === institutionFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.institutionName.toLowerCase().includes(q) ||
        (item.highlights && item.highlights.some((h) => h.toLowerCase().includes(q)));
      return matchInst && matchQuery;
    });
  }, [activeBelajarPajakSource, institutionFilter, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-text selection:bg-primary selection:text-white font-sans">
      <Navbar />

      <main className="flex-1">
        <section id="belajar-pajak" className="py-14 md:py-20 bg-surface border-b border-primary-light">
          <div className="container-custom space-y-10">
            {/* Header Box Belajar Pajak */}
            <div className="rounded-2xl bg-gradient-to-r from-primary to-primary-dark text-white p-6 sm:p-8 md:p-10 shadow-md relative overflow-hidden">
              <div className="relative z-10 space-y-3 max-w-3xl">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  Pusat Tautan &amp; Media Belajar Pajak Resmi
                </h1>
                <p className="text-xs sm:text-sm text-silver leading-relaxed">
                  Akses langsung materi literasi perpajakan nasional, simulasi aplikasi Coretax, kanal video resmi, modul e-learning KLC, dan buku pedoman yang disediakan langsung oleh DJP dan Kementerian Keuangan RI.
                </p>
              </div>
            </div>

            {/* Container Terpadu: Filter & Direktori Tautan Belajar Pajak Menjadi Satu Kesatuan */}
            <div className="bg-white rounded-2xl border border-primary-light shadow-xs overflow-hidden">
              {/* Header Card: Filters & Search Toolbar */}
              <div className="p-4 sm:p-5 space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Filter Institusi */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-primary mr-1">Institusi:</span>
                    <button
                      type="button"
                      onClick={() => setInstitutionFilter("all")}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        institutionFilter === "all"
                          ? "bg-primary text-white"
                          : "bg-surface text-text-secondary border border-primary-light hover:text-primary"
                      }`}
                    >
                      Semua ({activeBelajarPajakSource.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setInstitutionFilter("DJP")}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                        institutionFilter === "DJP"
                          ? "bg-primary text-white"
                          : "bg-surface text-text-secondary border border-primary-light hover:text-primary"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span>DJP (Ditjen Pajak)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setInstitutionFilter("Kemenkeu")}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                        institutionFilter === "Kemenkeu"
                          ? "bg-primary text-white"
                          : "bg-surface text-text-secondary border border-primary-light hover:text-primary"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-blue-400" />
                      <span>Kementerian Keuangan RI</span>
                    </button>
                  </div>

                  {/* Search input */}
                  <div className="relative w-full lg:w-72">
                    <SearchIcon className="absolute left-3 top-2.5 text-text-muted text-xs" />
                    <Input
                      type="text"
                      placeholder="Cari tautan / materi belajar..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 text-xs h-9 bg-surface"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-2.5 text-text-muted hover:text-primary text-xs"
                        aria-label="Hapus pencarian"
                      >
                        <CloseIcon />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Body Card: Grid Kartu / Empty State Tautan Belajar Pajak (Menyatu langsung dengan border-t) */}
              <div className="border-t border-primary-light p-4 sm:p-6 bg-surface/30">
                {filteredBelajarPajak.length === 0 ? (
                  <div className="py-12 px-4 text-center space-y-3">
                    <ShieldTaxIcon className="text-3xl text-silver mx-auto" />
                    <h3 className="text-base font-semibold text-primary">Tautan Tidak Ditemukan</h3>
                    <p className="text-xs text-text-secondary max-w-sm mx-auto">
                      Coba ubah kata kunci atau bersihkan filter institusi untuk melihat direktori link resmi.
                    </p>
                    <Button
                      variant="silver"
                      size="sm"
                      onClick={() => {
                        setInstitutionFilter("all");
                        setSearchQuery("");
                      }}
                      className="text-xs"
                    >
                      Reset Filter
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {filteredBelajarPajak.map((item) => (
                      <Card
                        key={item.id}
                        className="rounded-xl border-primary-light bg-white hover:border-primary hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden"
                      >
                        <CardHeader className="space-y-3 pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="silver"
                                size="sm"
                                className={`text-[10px] font-bold ${
                                  item.institution === "DJP"
                                    ? "bg-amber-50 text-amber-900 border-amber-200"
                                    : "bg-blue-50 text-blue-900 border-blue-200"
                                }`}
                              >
                                {item.institutionName}
                              </Badge>
                              <Badge variant="outline" size="sm" className="text-[10px]">
                                {item.type}
                              </Badge>
                            </div>
                            <span className="text-[10px] text-text-muted font-medium">
                              {item.updatedAt}
                            </span>
                          </div>

                          <div>
                            <CardTitle className="text-base font-bold text-primary leading-snug">
                              {item.title}
                            </CardTitle>
                            <CardDescription className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                              {item.description}
                            </CardDescription>
                          </div>
                        </CardHeader>

                        <CardContent className="pt-0 space-y-3 flex-1">
                          <div className="bg-surface rounded-xl p-3 border border-primary-light/70 space-y-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
                              Cakupan Materi Pembelajaran:
                            </span>
                            <ul className="space-y-1 text-xs text-text">
                              {(item.highlights || [item.type, item.institutionName]).map((point, pIdx) => (
                                <li key={pIdx} className="flex items-start gap-2">
                                  <CheckCircleIcon className="text-success text-xs flex-shrink-0 mt-0.5" />
                                  <span className="text-[11px] leading-tight text-text-secondary">
                                    {point}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>

                        <CardFooter className="pt-3 border-t border-primary-light/60 flex items-center justify-between bg-surface/40">
                          <div className="truncate max-w-[200px] text-[11px] text-text-muted font-mono">
                            {item.url.replace(/^https?:\/\//, "")}
                          </div>

                          <Button
                            variant="primary"
                            size="sm"
                            asChild
                            className="text-xs font-semibold shadow-xs"
                          >
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <span>Buka Situs</span>
                            </a>
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Info Counter di Kanan Bawah Luar Card */}
            <div className="text-right text-xs text-text-secondary">
              Menampilkan <span className="font-semibold text-text-primary">{filteredBelajarPajak.length}</span> dari {activeBelajarPajakSource.length} materi &amp; tautan resmi.
            </div>
          </div>
        </section>
      </main>

      <FloatingWhatsAppCTA />
      <Footer />
    </div>
  );
}
