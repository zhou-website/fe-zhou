"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { FloatingWhatsAppCTA } from "@/components/landing/FloatingWhatsAppCTA";
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
  WhatsappIcon,
} from "@/components/icons";
import {
  getStoredServices,
  SERVICES_EVENT,
} from "@/data/layananStorage";
import { isCmsItemDeleted } from "@/data/cmsDeletedStorage";
import { getCmsItemStatus } from "@/data/cmsStatusStorage";
import { publicApi, PublicServiceItem } from "@/lib/api";

interface LegalModuleItem {
  id: string;
  code: string;
  title: string;
  badge: string;
  subtitle: string;
  scopes: string[];
  deliverable: string;
  topicParam: string;
  waTemplate: string;
}

export default function KonsultasiHukumPage() {
  const waPhone = process.env.NEXT_PUBLIC_WA_PHONE || "6285121286086";
  const [modules, setModules] = useState<LegalModuleItem[]>([]);

  useEffect(() => {
    let isMounted = true;

    const syncModules = (apiItems?: PublicServiceItem[]) => {
      if (apiItems !== undefined) {
        setModules(
          apiItems.map((c) => ({
            id: `LAW-${c.id}`,
            code: c.service_code || `LAW-${c.id}`,
            title: c.service_name,
            badge: c.category?.toUpperCase() || "LAW & LEGAL SERVICES",
            subtitle: c.description || "Layanan hukum bisnis dan kepatuhan regulasi korporasi",
            scopes: c.features && c.features.length > 0 ? c.features : [
              "Pendampingan aspek kepatuhan hukum dan regulasi korporasi",
              "Mitigasi risiko hukum dan telaah perjanjian bisnis",
            ],
            deliverable: "Dokumen Legal Opinion & Dokumen Kepatuhan Regulasi",
            topicParam: "hukum",
            waTemplate: `Halo Zhou Consulting, saya ingin konsultasi mengenai layanan ${c.service_name}.`,
          }))
        );
        return;
      }

      // Fallback hanya saat backend API offline
      const stored = getStoredServices();
      const lawItems = stored.filter(
        (s) =>
          (s.categoryKey?.toLowerCase() === "hukum" || s.categoryKey?.toLowerCase() === "legal") &&
          s.status === "Published" &&
          !isCmsItemDeleted(s.id, s.name, undefined, s.code)
      );

      if (lawItems.length > 0) {
        setModules(
          lawItems.map((c) => {
            const rawScopes =
              (c.scopes && c.scopes.length > 0 ? c.scopes : undefined) ||
              (c.pillars && c.pillars.length > 0
                ? c.pillars.map((p: any) => p.title || p.description)
                : undefined) || [
                "Pendampingan aspek kepatuhan hukum dan regulasi korporasi",
                "Mitigasi risiko hukum dan telaah perjanjian bisnis",
              ];

            return {
              id: c.id,
              code: c.code || c.id,
              title: c.name,
              badge: c.badge || "LAW SERVICES",
              subtitle: c.subtitle || "Layanan pendampingan hukum dan kepatuhan regulasi bisnis Zhou Consulting.",
              scopes: rawScopes,
              deliverable: c.deliverable || "Dokumen Legal Opinion & Panduan Kepatuhan Regulasi",
              topicParam: c.topicParam || "hukum",
              waTemplate:
                c.waTemplate ||
                `Halo Zhou Consulting, saya ingin konsultasi mengenai layanan ${c.name}.`,
            };
          })
        );
      } else {
        setModules([]);
      }
    };

    // 1. Ambil langsung dari live endpoint backend (zero-cache)
    publicApi
      .getServices()
      .then((res) => {
        if (!isMounted) return;
        if (res?.data && Array.isArray(res.data)) {
          const lawFromApi = res.data.filter((item: PublicServiceItem) => {
            const cat = (item.category || "").toLowerCase();
            const code = (item.service_code || "").toLowerCase();
            const name = (item.service_name || "").toLowerCase();
            return (
              item.is_active !== false &&
              (cat.includes("hukum") || cat.includes("legal") || code.includes("law") || code.includes("legal") || name.includes("hukum") || name.includes("legal") || cat.includes("sengketa")) &&
              !isCmsItemDeleted(item.id, item.service_name, item.id, item.service_code)
            );
          });

          syncModules(lawFromApi);
        } else {
          syncModules();
        }
      })
      .catch(() => {
        if (isMounted) syncModules();
      });

    const handleUpdate = () => syncModules();
    window.addEventListener(SERVICES_EVENT, handleUpdate);
    window.addEventListener("zhou_deleted_cms_items_updated", handleUpdate);
    window.addEventListener("zhou_cms_status_updated", handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener(SERVICES_EVENT, handleUpdate);
      window.removeEventListener("zhou_deleted_cms_items_updated", handleUpdate);
      window.removeEventListener("zhou_cms_status_updated", handleUpdate);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-text selection:bg-primary selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* Core Legal Services Cards Grid */}
        <section className="py-14 md:py-20 bg-white border-b border-primary-light">
          <div className="container-custom space-y-10">
            <div className="space-y-2 text-center md:text-left max-w-2xl">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary tracking-tight">
                Layanan Law Services Zhou Consulting
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                Setiap modul dirancang untuk memitigasi risiko gugatan hukum, menjaga integritas reputasi korporasi, dan menjamin kepatuhan penuh undang-undang.
              </p>
            </div>

            {modules.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-text-secondary text-sm">
                Belum ada layanan hukum yang dipublikasikan saat ini.
              </div>
            ) : (
              <div className={`grid grid-cols-1 ${modules.length === 1 ? "max-w-xl mx-auto" : "md:grid-cols-2"} gap-6`}>
              {modules.map((item) => (
                <Card
                  key={item.id}
                  id={item.id}
                  className="scroll-mt-24 rounded-2xl border-primary-light hover:border-primary hover:shadow-lg transition-all duration-200 bg-white flex flex-col justify-between"
                >
                  <CardHeader className="space-y-2.5 pb-3">
                    <div className="flex items-center justify-end">
                      <span className="text-[10px] font-mono font-semibold text-text-muted">
                        {item.code}
                      </span>
                    </div>
                    <CardTitle className="text-lg font-bold text-primary leading-snug">
                      {item.title}
                    </CardTitle>
                    <CardDescription className="text-xs text-text-secondary leading-relaxed">
                      {item.subtitle}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3.5 text-xs text-text-primary flex-1 pt-0">
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <span className="text-[11px] font-bold text-primary block">
                        Cakupan Layanan:
                      </span>
                      {item.scopes.map((scope, sIdx) => (
                        <div key={sIdx} className="flex items-start gap-2">
                          <CheckCircleIcon className="text-success text-xs flex-shrink-0 mt-0.5" />
                          <span className="leading-snug text-text-secondary text-[11px]">{scope}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>

                  <CardFooter className="pt-3 border-t border-primary-light">
                    <a
                      href={`https://wa.me/${waPhone}?text=${encodeURIComponent(item.waTemplate)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-emerald-600/30 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-semibold text-xs transition-colors"
                    >
                      <WhatsappIcon className="text-xs" />
                      <span>Konsultasi</span>
                    </a>
                  </CardFooter>
                </Card>
              ))}
            </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
      <FloatingWhatsAppCTA />
    </div>
  );
}
