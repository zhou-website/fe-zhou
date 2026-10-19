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

interface AccountingModuleItem {
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

const DEFAULT_ACCOUNTING_MODULE: AccountingModuleItem = {
  id: "SRV-ACC-SERV",
  code: "ACC-SERV",
  title: "Penyusunan Laporan Keuangan SAK EP / PSAK",
  badge: "ACCOUNTING SERVICES",
  subtitle: "Penyusunan laporan posisi keuangan (neraca), laba rugi, perubahan ekuitas, arus kas, dan restrukturisasi pembukuan standar resmi perbankan & audit.",
  scopes: [
    "Penyusunan Laporan Posisi Keuangan (Neraca) komparatif multi-periode",
    "Penyusunan Laporan Laba Rugi dan Penghasilan Komprehensif Lain",
    "Laporan Arus Kas, Catatan atas Laporan Keuangan (CALK), & Rekonsiliasi Fiskal",
    "Perancangan & Restrukturisasi Bagan Akun (COA) serta asistensi audit eksternal",
  ],
  deliverable: "Bundel Laporan Keuangan Lengkap (Audit-ready / Bank-ready) beserta CALK resmi.",
  topicParam: "laporan-keuangan",
  waTemplate: "Halo Zhou Consulting, saya ingin konsultasi mengenai penyusunan Laporan Keuangan standar SAK EP/PSAK.",
};

export default function AccountingServicePage() {
  const waPhone = process.env.NEXT_PUBLIC_WA_PHONE || "6285121286086";
  const [modules, setModules] = useState<AccountingModuleItem[]>([DEFAULT_ACCOUNTING_MODULE]);

  useEffect(() => {
    const syncModules = () => {
      const stored = getStoredServices();
      const accItems = stored.filter(
        (s) =>
          s.categoryKey?.toLowerCase() === "akuntansi" &&
          s.status === "Published" &&
          !isCmsItemDeleted(s.id, s.name, undefined, s.code)
      );

      if (accItems.length > 0) {
        setModules(
          accItems.map((c) => {
            const rawScopes =
              (c.scopes && c.scopes.length > 0 ? c.scopes : undefined) ||
              (c.pillars && c.pillars.length > 0
                ? c.pillars.map((p) => p.title || p.description)
                : undefined) ||
              DEFAULT_ACCOUNTING_MODULE.scopes;

            const rawDeliverable =
              (c.deliverable && c.deliverable.trim()) ||
              (c.deliverables && c.deliverables.length > 0 ? c.deliverables[0] : undefined) ||
              DEFAULT_ACCOUNTING_MODULE.deliverable;

            return {
              id: c.id,
              code: c.code || c.id,
              title: c.name,
              badge: c.badge || "ACCOUNTING SERVICES",
              subtitle: c.subtitle || DEFAULT_ACCOUNTING_MODULE.subtitle,
              scopes: rawScopes,
              deliverable: rawDeliverable,
              topicParam: c.topicParam || "laporan-keuangan",
              waTemplate:
                c.waTemplate ||
                `Halo Zhou Consulting, saya ingin konsultasi mengenai layanan ${c.name}.`,
            };
          })
        );
      } else {
        setModules([DEFAULT_ACCOUNTING_MODULE]);
      }
    };

    syncModules();
    window.addEventListener(SERVICES_EVENT, syncModules);
    return () => window.removeEventListener(SERVICES_EVENT, syncModules);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-text selection:bg-primary selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* Core Accounting Services Card (1 Grid) */}
        <section className="py-14 md:py-20 bg-white border-b border-primary-light">
          <div className="container-custom space-y-10">
            <div className="space-y-2 text-center max-w-2xl mx-auto">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary tracking-tight">
                Layanan Accounting Services Zhou Consulting
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                Modul terpadu untuk menjamin integritas catatan finansial, kepatuhan standar SAK EP/PSAK, dan kesiapan menghadapi audit eksternal.
              </p>
            </div>

            <div className="grid grid-cols-1 max-w-2xl mx-auto gap-6">
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
