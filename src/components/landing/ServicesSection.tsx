"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { CheckCircleIcon, WhatsappIcon } from "@/components/icons";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import {
  StoredServiceItem,
  DEFAULT_SERVICES,
  getStoredServices,
  SERVICES_EVENT,
} from "@/data/layananStorage";
import { publicApi, PublicServiceItem } from "@/lib/api";
import { isCmsItemDeleted } from "@/data/cmsDeletedStorage";
import { getCmsItemStatus } from "@/data/cmsStatusStorage";

export function ServicesSection() {
  const [services, setServices] = useState<StoredServiceItem[]>(DEFAULT_SERVICES);
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();

  const rawPhone = process.env.NEXT_PUBLIC_WA_PHONE || "6285121286086";
  const cleanPhone = rawPhone.replace(/[^0-9]/g, "") || "6285121286086";

  const getAuthHref = (target: string) => {
    if (target.startsWith("/dashboard") && !isAuthenticated) {
      return `/login?redirect=${encodeURIComponent(target)}`;
    }
    return target;
  };

  useEffect(() => {
    let isMounted = true;

    // Load initial services from local storage or default official services
    const localServices = getStoredServices();
    if (localServices.length > 0) {
      setServices(localServices);
    }

    const handleStorageUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<StoredServiceItem[]>;
      if (customEvent.detail && Array.isArray(customEvent.detail)) {
        setServices(customEvent.detail);
      } else {
        setServices(getStoredServices());
      }
    };

    window.addEventListener(SERVICES_EVENT, handleStorageUpdate);

    // Sync directly from live backend API as primary source of truth
    publicApi
      .getServices()
      .then((res) => {
        if (!isMounted) return;
        if (res?.data && Array.isArray(res.data)) {
          const apiServices: StoredServiceItem[] = res.data
            .filter((item: PublicServiceItem) => {
              if (item.is_active === false) return false;
              if (isCmsItemDeleted(item.id, item.service_name, item.id, item.service_code)) return false;
              const pubStatus = getCmsItemStatus(`SVC-${item.id}`, item.service_name, item.is_active ? "Published" : "Draft", [item.id, item.service_code]);
              return pubStatus === "Published";
            })
            .map((item: PublicServiceItem) => {
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
              status: getCmsItemStatus(`SVC-${item.id}`, item.service_name, item.is_active ? "Published" : "Draft", [item.id, item.service_code]),
              lastUpdated: item.created_at
                ? new Date(item.created_at).toLocaleDateString("id-ID", { month: "short", year: "numeric" })
                : "Oktober 2026",
            };
          });

          setServices(apiServices);
        }
      })
      .catch((err) => {
        console.warn("publicApi.getServices in ServicesSection:", err);
      });

    window.addEventListener(SERVICES_EVENT, handleStorageUpdate);
    window.addEventListener("zhou_deleted_cms_items_updated", handleStorageUpdate);
    window.addEventListener("zhou_cms_status_updated", handleStorageUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener(SERVICES_EVENT, handleStorageUpdate);
      window.removeEventListener("zhou_deleted_cms_items_updated", handleStorageUpdate);
      window.removeEventListener("zhou_cms_status_updated", handleStorageUpdate);
    };
  }, []);

  const displayServices = services.filter(
    (s) => s && s.name && s.status !== "Draft" && s.status !== "Archived"
  );

  return (
    <section
      id="layanan"
      aria-label="Layanan Konsultasi Zhou Consulting"
      className="py-16 md:py-20 lg:py-24 bg-surface border-b border-primary-light scroll-mt-20 font-sans"
    >
      <div className="container-custom space-y-10 md:space-y-12">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <h2 className="text-[22px] leading-[30px] sm:text-[26px] sm:leading-[34px] lg:text-[32px] lg:leading-[40px] font-bold text-primary tracking-tight text-balance">
            {t.services.headline || "Layanan Konsultasi Profesional Terpadu"}
          </h2>
          <p className="text-[14px] leading-[22px] sm:text-[15px] sm:leading-[24px] text-text-secondary leading-relaxed">
            {t.services.subheading ||
              "Solusi terintegrasi perpajakan korporat, akuntansi berstandar SAK, pengelolaan keuangan strategis, dan kepatuhan hukum bisnis terpercaya."}
          </p>
        </div>

        {/* 4 Core Services Grid */}
        {displayServices.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-slate-100/80 animate-pulse border border-slate-200/60 p-5 flex flex-col justify-between" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayServices.slice(0, 4).map((service) => (
              <Card
                key={service.id || service.route}
                className="hover:border-primary hover:shadow-md transition-all duration-200 flex flex-col justify-between w-full rounded-2xl bg-white border-primary-light p-5 space-y-5"
              >
                <div className="space-y-3">
                  <CardHeader className="p-0 space-y-2">
                    <Link
                      href={getAuthHref(service.route || `/layanan/${service.categoryKey}`)}
                      className="hover:underline"
                    >
                      <CardTitle className="text-base font-bold text-primary leading-snug">
                        {service.name}
                      </CardTitle>
                    </Link>
                    <CardDescription className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                      {service.subtitle}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="p-0 pt-2 space-y-2 text-xs text-text-primary">
                    {service.pillars?.slice(0, 3).map((pillar: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircleIcon className="text-emerald-600 text-xs shrink-0 mt-0.5" />
                        <span className="line-clamp-1 text-[11px] font-medium text-text-secondary">
                          {pillar.title}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </div>

                <CardFooter className="p-0 pt-4 border-t border-primary-light/80">
                  <a
                    href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                      `Halo Zhou Consulting, saya ingin konsultasi mengenai ${service.name}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-1.5 h-9 rounded-lg bg-[#060D22] hover:bg-[#111e42] text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                  >
                    <WhatsappIcon className="text-xs text-emerald-400" />
                    <span>Konsultasi</span>
                  </a>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
