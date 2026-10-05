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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircleIcon,
  ArrowRightIcon,
} from "@/components/icons";
import { useLanguage } from "@/context/LanguageContext";
import {
  StoredServiceItem,
  getStoredServices,
  SERVICES_EVENT,
} from "@/data/layananStorage";

export function ServicesSection() {
  const [activeTab, setActiveTab] = useState<"all" | "konsultasi" | "tax">("all");
  const [services, setServices] = useState<StoredServiceItem[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    setServices(getStoredServices());

    const handleUpdate = () => {
      setServices(getStoredServices());
    };

    window.addEventListener(SERVICES_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener(SERVICES_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
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

        {/* Category Filter Tabs */}
        {publishedServices.length > 0 && (
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
        )}

        {/* Services List / Empty State */}
        {publishedServices.length === 0 ? (
          <div className="py-14 px-6 rounded-2xl bg-white border border-dashed border-primary-light text-center space-y-4 max-w-2xl mx-auto shadow-xs">
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-primary">Katalog Layanan Sedang Dipersiapkan</h3>
              <p className="text-xs text-text-secondary leading-relaxed max-w-lg mx-auto">
                Daftar divisi dan rincian cakupan layanan profesional Zhou Consulting akan segera diperbarui oleh tim administrator.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3">
              <Button variant="primary" size="sm" asChild className="text-xs">
                <Link href="/konsultasi">Konsultasi Langsung</Link>
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
                    className="w-full justify-between text-xs font-bold border-primary text-primary hover:bg-primary/5 group"
                  >
                    <Link href={service.route || `/layanan/${service.categoryKey}`}>
                      <span>Lihat Layanan</span>
                      <ArrowRightIcon className="text-[10px] group-hover:translate-x-1 transition-transform" />
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
