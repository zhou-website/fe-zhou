"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { FloatingWhatsAppCTA } from "@/components/landing/FloatingWhatsAppCTA";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  BookIcon,
  ShieldTaxIcon,
  ArrowRightIcon,
} from "@/components/icons";
import {
  StoredServiceItem,
  getStoredServices,
  SERVICES_EVENT,
} from "@/data/layananStorage";
import { publicApi, PublicServiceItem } from "@/lib/api";

export default function LayananIndexPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [services, setServices] = useState<StoredServiceItem[]>([]);

  useEffect(() => {
    let isMounted = true;
    setServices(getStoredServices());

    const handleUpdate = () => {
      setServices(getStoredServices());
    };

    window.addEventListener(SERVICES_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);

    publicApi
      .getServices()
      .then((res) => {
        if (!isMounted) return;
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          const apiServices: StoredServiceItem[] = res.data.map((item: PublicServiceItem) => {
            const catLower = (item.category || "").toLowerCase();
            const codeUpper = (item.service_code || "").toUpperCase();
            const catKey =
              catLower.includes("akuntansi") || codeUpper.includes("ACC")
                ? "akuntansi"
                : catLower.includes("bisnis") || codeUpper.includes("FIN") || catLower.includes("konsultasi")
                ? "bisnis"
                : catLower.includes("hukum") || codeUpper.includes("LEGAL") || catLower.includes("sengketa")
                ? "hukum"
                : "tax-service";

            const route =
              catKey === "akuntansi"
                ? "/layanan/akuntansi"
                : catKey === "bisnis"
                ? "/layanan/bisnis"
                : catKey === "hukum"
                ? "/layanan/hukum"
                : "/layanan/tax-service";

            return {
              id: `BE-${item.id}`,
              code: item.service_code,
              categoryKey: catKey,
              name: item.service_name,
              subtitle: item.description || "Layanan profesional terintegrasi Zhou Consulting.",
              badge: item.category?.toUpperCase() || "LAYANAN",
              route,
              leadConsultant: "Tim Konsultan Spesialis Zhou Consulting",
              pillars: [
                {
                  title: item.service_name,
                  description: item.description || "Asistensi kepatuhan dan pelaporan profesional terintegrasi.",
                },
              ],
              workflow: [
                "Konsultasi Kebutuhan Awal",
                "Analisis Teknis & Regulasi",
                "Eksekusi Penugasan",
                "Penyampaian Laporan Final",
              ],
              deliverables: ["Laporan Hasil Kerja & Risalah Penugasan Resmi"],
              status: item.is_active ? "Published" : "Draft",
              lastUpdated: item.created_at
                ? new Date(item.created_at).toLocaleDateString("id-ID", { month: "short", year: "numeric" })
                : "Oktober 2026",
            };
          });

          setServices((prev) => {
            const apiCodes = new Set(apiServices.map((s) => (s.code || s.name).toLowerCase()));
            const localOnly = prev.filter((p) => !apiCodes.has((p.code || p.name).toLowerCase()));
            return [...apiServices, ...localOnly];
          });
        }
      })
      .catch((err) => {
        console.warn("publicApi.getServices fallback in LayananIndexPage:", err);
      });

    return () => {
      isMounted = false;
      window.removeEventListener(SERVICES_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const publishedServices = services.filter((s) => s.status === "Published");

  const filteredServices = publishedServices.filter((s) => {
    if (activeCategory === "all") return true;
    return s.categoryKey.toLowerCase() === activeCategory.toLowerCase();
  });

  return (
    <div className="min-h-screen flex flex-col bg-surface text-text-primary selection:bg-primary-light selection:text-primary">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-primary text-white py-16 md:py-20 lg:py-24 border-b border-primary-dark relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
          <div className="container-custom relative z-10 space-y-6 text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold backdrop-blur-xs border border-white/20">
              <ShieldTaxIcon className="text-secondary" />
              <span>Katalog Layanan Profesional Terpadu</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
              Solusi Terpadu Akuntansi, Perpajakan &amp; Hukum Korporat
            </h1>
            <p className="text-sm sm:text-base text-gray-200 leading-relaxed max-w-2xl mx-auto">
              Didukung oleh Konsultan Pajak BKP, Akuntan Praktisi CA, dan Advokat Korporat PERADI berpengalaman untuk memastikan kepatuhan regulasi dan pertumbuhan bisnis Anda.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link href="/konsultasi">
                <Button variant="secondary" size="default" className="font-semibold shadow-md">
                  Jadwalkan Konsultasi
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Services Directory Section */}
        <section className="py-12 md:py-16">
          <div className="container-custom space-y-8">
            {/* Filter Tabs if services exist */}
            {publishedServices.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-2 pb-4">
                {[
                  { key: "all", label: "Semua Layanan" },
                  { key: "akuntansi", label: "Akuntansi & Pembukuan" },
                  { key: "tax-service", label: "Perpajakan & Coretax" },
                  { key: "bisnis", label: "Advisory Bisnis" },
                  { key: "hukum", label: "Hukum Korporat" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveCategory(tab.key)}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                      activeCategory === tab.key
                        ? "bg-primary text-white shadow-xs"
                        : "bg-white border border-primary-light text-text-secondary hover:text-primary hover:border-primary"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            {/* Empty State */}
            {publishedServices.length === 0 ? (
              <div className="py-16 px-6 rounded-2xl bg-white border border-dashed border-primary-light text-center space-y-4 max-w-2xl mx-auto shadow-xs">
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-primary">Katalog Layanan Sedang Dipersiapkan</h3>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-md mx-auto">
                    Daftar divisi dan rincian modul layanan Zhou Consulting akan segera diperbarui oleh tim administrator melalui Admin Dashboard.
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-center gap-3">
                  <Button variant="primary" size="sm" asChild className="text-xs">
                    <Link href="/konsultasi">Konsultasi Langsung</Link>
                  </Button>
                </div>
              </div>
            ) : (
              /* Service Cards Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service) => (
                  <Card
                    key={service.id}
                    className="bg-white border-primary-light hover:border-primary hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                  >
                    <CardHeader className="space-y-3 pb-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="silver" size="sm">
                          {service.badge || service.categoryKey.toUpperCase()}
                        </Badge>
                        <BookIcon className="text-primary opacity-60 text-sm" />
                      </div>
                      <div>
                        <CardTitle className="text-base sm:text-lg font-bold text-primary">
                          {service.name}
                        </CardTitle>
                        <CardDescription className="text-xs text-text-secondary mt-1.5 leading-relaxed line-clamp-2">
                          {service.subtitle}
                        </CardDescription>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-2 text-xs text-text-primary flex-1 pt-0">
                      <div className="pt-2 border-t border-gray-100 space-y-2">
                        {service.pillars?.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <CheckCircleIcon className="text-success text-xs flex-shrink-0 mt-0.5" />
                            <span className="leading-snug text-text-secondary line-clamp-1">{item.title}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>

                    <CardFooter className="pt-3 border-t border-primary-light">
                      <Link href={service.route || `/layanan/${service.categoryKey}`} className="w-full">
                        <Button variant="outline" size="sm" className="w-full text-xs font-semibold justify-between group">
                          <span>Lihat Detail Layanan</span>
                          <ArrowRightIcon className="text-[10px] group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Consultation Callout Banner */}
        <section className="py-12 bg-white border-t border-primary-light">
          <div className="container-custom">
            <div className="bg-surface rounded-2xl border border-primary-light p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left max-w-xl">
                <h3 className="text-lg sm:text-xl font-bold text-primary">
                  Butuh Konsultasi Kustom Sesuai Kebutuhan Bisnis Anda?
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  Diskusikan tantangan pembukuan, kepatuhan Coretax, atau audit perpajakan dengan konsultan ahli Zhou Consulting.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/konsultasi">
                  <Button variant="primary" size="default" className="font-semibold text-xs sm:text-sm shadow-xs">
                    Hubungi Konsultan Kami
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <FloatingWhatsAppCTA />
    </div>
  );
}
