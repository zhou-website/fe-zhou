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
import { publicApi, PublicServiceItem } from "@/lib/api";

interface TaxModuleItem {
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



export default function TaxServicePage() {
  const waPhone = process.env.NEXT_PUBLIC_WA_PHONE || "6285121286086";
  const [modules, setModules] = useState<TaxModuleItem[]>([]);

  useEffect(() => {
    let isMounted = true;

    const syncModules = (apiItems?: PublicServiceItem[]) => {
      if (apiItems && apiItems.length > 0) {
        setModules(
          apiItems.map((c) => ({
            id: `TAX-${c.id}`,
            code: c.service_code || `TAX-${c.id}`,
            title: c.service_name,
            badge: c.category?.toUpperCase() || "TAX SERVICES",
            subtitle: c.description || "Layanan kepatuhan perpajakan korporasi terintegrasi",
            scopes: c.features && c.features.length > 0 ? c.features : [
              "Konsultasi dan kepatuhan perpajakan terpadu",
              "Mitigasi risiko fiskal dan ekualisasi pelaporan DJP",
            ],
            deliverable: "Kertas Kerja Kepatuhan Fiskal & Bukti Penerimaan Elektronik (BPE)",
            topicParam: "tax-service",
            waTemplate: `Halo Zhou Consulting, saya ingin konsultasi mengenai layanan ${c.service_name}.`,
          }))
        );
        return;
      }

      const stored = getStoredServices();
      const taxStored = stored.filter(
        (s) =>
          (s.categoryKey?.toLowerCase() === "tax-service" || s.categoryKey?.toLowerCase() === "tax") &&
          s.status === "Published" &&
          !isCmsItemDeleted(s.id, s.name, undefined, s.code)
      );

      if (taxStored.length > 0) {
        setModules(
          taxStored.map((c) => {
            const rawScopes =
              (c.scopes && c.scopes.length > 0 ? c.scopes : undefined) ||
              (c.pillars && c.pillars.length > 0
                ? c.pillars.map((p: any) => p.title || p.description)
                : undefined) || [
                "Konsultasi dan kepatuhan perpajakan terpadu",
                "Mitigasi risiko fiskal dan ekualisasi pelaporan DJP",
              ];

            return {
              id: c.id,
              code: c.code || c.id,
              title: c.name,
              badge: c.badge || "TAX SERVICES",
              subtitle: c.subtitle || "Layanan kepatuhan perpajakan korporat Zhou Consulting.",
              scopes: rawScopes,
              deliverable: c.deliverable || "Kertas Kerja Kepatuhan Fiskal & Bukti Penerimaan Elektronik (BPE)",
              topicParam: c.topicParam || "tax-service",
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

    // 1. Ambil data dari live endpoint backend (zero-cache) untuk sinkronisasi atribut terbaru
    publicApi
      .getServices()
      .then((res) => {
        if (!isMounted) return;
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          const taxFromApi = res.data.filter((item: PublicServiceItem) => {
            const cat = (item.category || "").toLowerCase();
            const code = (item.service_code || "").toLowerCase();
            const name = (item.service_name || "").toLowerCase();
            return (
              (cat.includes("tax") || cat.includes("pajak") || code.includes("tax") || name.includes("tax") || name.includes("pajak")) &&
              !isCmsItemDeleted(item.id, item.service_name, item.id, item.service_code)
            );
          });

          syncModules(taxFromApi);
        } else {
          syncModules();
        }
      })
      .catch(() => {
        if (isMounted) syncModules();
      });

    window.addEventListener(SERVICES_EVENT, () => syncModules());
    return () => {
      isMounted = false;
      window.removeEventListener(SERVICES_EVENT, () => syncModules());
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-text selection:bg-primary selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* 6 Core Tax Services Cards Grid */}
        <section className="py-14 md:py-20 bg-white border-b border-primary-light">
          <div className="container-custom space-y-10">
            <div className="space-y-2 text-center md:text-left max-w-2xl">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary tracking-tight">
                Layanan Tax Services Zhou Consulting
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                Setiap modul dirancang untuk menjamin kepatuhan administratif, akurasi perhitungan, dan mitigasi risiko sengketa fiskal perusahaan Anda.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          </div>
        </section>
      </main>

      <Footer />
      <FloatingWhatsAppCTA />
    </div>
  );
}
