"use client";

import React, { useState, useEffect } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircleIcon } from "@/components/icons";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { StoredServiceItem } from "@/data/layananStorage";
import { publicApi, PublicServiceItem } from "@/lib/api";

export function ServicesSection() {
  const [activeTab, setActiveTab] = useState<"all" | "konsultasi" | "tax">("all");
  const [services, setServices] = useState<StoredServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();

  const getAuthHref = (target: string) => {
    if (isAuthenticated) return target;
    return `/login?redirect=${encodeURIComponent(target)}`;
  };

  useEffect(() => {
    let isMounted = true;

    // Fetch live backend services only (no mock data fallback)
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

          setServices(apiServices);
        } else {
          setServices([]);
        }
      })
      .catch((err) => {
        console.warn("publicApi.getServices in ServicesSection:", err);
        setServices([]);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const publishedServices = services.filter((s) => s.status === "Published");

  const filteredServices = publishedServices.filter((s) => {
    if (activeTab === "all") return true;
    if (activeTab === "konsultasi") return s.categoryKey !== "tax-service";
    if (activeTab === "tax") return s.categoryKey === "tax-service";
    return true;
  });

  return (
    <section
      id="layanan"
      aria-label="Katalog Layanan"
      className="py-16 md:py-20 lg:py-24 bg-surface border-b border-primary-light scroll-mt-20"
    >
      <div className="container-custom space-y-10 md:space-y-12">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <h2 className="text-[22px] leading-[30px] sm:text-[26px] sm:leading-[34px] lg:text-[32px] lg:leading-[40px] font-bold text-primary tracking-tight text-balance">
            {t.services.headline}
          </h2>
          <p className="text-[15px] leading-[24px] sm:text-body-large text-text-secondary leading-relaxed">
            {t.services.subheading}
          </p>
        </div>

        {/* Category Filter Tabs or Skeleton */}
        {isLoading ? (
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24 rounded-md" />
            <Skeleton className="h-8 w-28 rounded-md" />
            <Skeleton className="h-8 w-24 rounded-md" />
          </div>
        ) : publishedServices.length > 0 ? (
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
        ) : null}

        {/* Services List / Skeleton / Empty State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card
                key={i}
                className="flex flex-col justify-between w-full rounded-xl bg-white border-primary-light p-6 space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between h-6">
                    <Skeleton className="h-5 w-24 rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-3.5 w-full" />
                    <Skeleton className="h-3.5 w-5/6" />
                  </div>
                </div>
                <div className="space-y-2 pt-2 flex-1">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3.5 w-3.5 rounded-full shrink-0" />
                    <Skeleton className="h-3.5 w-4/5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3.5 w-3.5 rounded-full shrink-0" />
                    <Skeleton className="h-3.5 w-3/5" />
                  </div>
                </div>
                <div className="pt-3 border-t border-primary-light">
                  <Skeleton className="h-9 w-full rounded-md" />
                </div>
              </Card>
            ))}
          </div>
        ) : publishedServices.length === 0 ? (
          <div className="py-14 px-6 rounded-2xl bg-white border border-dashed border-primary-light text-center space-y-4 max-w-2xl mx-auto shadow-xs">
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-primary">Katalog Layanan Sedang Dipersiapkan</h3>
              <p className="text-xs text-text-secondary leading-relaxed max-w-lg mx-auto">
                Daftar divisi dan rincian cakupan layanan profesional Zhou Consulting akan segera diperbarui oleh tim administrator.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3">
              <Button variant="primary" size="sm" asChild className="text-xs">
                <Link href={getAuthHref("/konsultasi")}>Konsultasi Langsung</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <Card
                key={service.id}
                className="hover:border-primary hover:shadow-md transition-all duration-200 flex flex-col justify-between w-full rounded-xl bg-white border-primary-light"
              >
                <CardHeader className="space-y-3 pb-3">
                  <div className="flex items-center justify-between h-6">
                    <Badge variant="silver" size="sm">
                      {service.badge || service.categoryKey.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <CardTitle className="text-card-heading font-bold text-primary">
                      {service.name}
                    </CardTitle>
                    <CardDescription className="text-xs text-text-secondary mt-1 line-clamp-2">
                      {service.subtitle}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-xs text-text flex-1 pt-0">
                  {service.pillars?.slice(0, 3).map((pillar, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircleIcon className="text-success text-xs flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{pillar.title}</span>
                    </div>
                  ))}
                </CardContent>
                <CardFooter className="pt-3 border-t border-primary-light">
                  <Button
                    variant="outline"
                    asChild
                    className="w-full justify-center text-xs font-bold border-primary text-primary hover:bg-primary/5 transition-colors"
                  >
                    <Link href={getAuthHref(service.route || `/layanan/${service.categoryKey}`)}>
                      <span>Lihat Layanan</span>
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
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
              <Link href={getAuthHref("/layanan/tax-service")}>Katalog Layanan</Link>
            </Button>
            <Button
              variant="silver"
              size="lg"
              asChild
              className="font-bold text-xs sm:text-sm px-6 shadow-md"
            >
              <Link href={getAuthHref("/konsultasi")}>Reservasi Konsultasi</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
