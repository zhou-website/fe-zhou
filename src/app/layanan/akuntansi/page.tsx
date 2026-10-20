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
  id: "SVC-4798",
  code: "SVC-4798",
  title: "Penyusunan Laporan Keuangan & Pembukuan",
  badge: "ACCOUNTING SERVICES",
  subtitle: "Penyusunan laporan posisi keuangan (neraca), laba rugi, perubahan ekuitas, dan arus kas standar resmi perbankan & audit.",
  scopes: [
    "Layanan pengelolaan akuntansi berbasis data yang akurat guna menghasilkan laporan keuangan bulanan dan tahunan yang kredibel. Kami memastikan seluruh pencatatan bisnis Anda rapi, patuh regulasi, serta siap digunakan untuk kebutuhan internal maupun eksternal (seperti perbankan dan audit)."
  ],
  deliverable: "Bundel Laporan Keuangan Lengkap (Audit-ready / Bank-ready) beserta CALK resmi.",
  topicParam: "laporan-keuangan",
  waTemplate: "Halo Zhou Consulting, saya ingin konsultasi mengenai Penyusunan Laporan Keuangan & Pembukuan.",
};

export default function AccountingServicePage() {
  const waPhone = process.env.NEXT_PUBLIC_WA_PHONE || "6285121286086";
  const [modules, setModules] = useState<AccountingModuleItem[]>([DEFAULT_ACCOUNTING_MODULE]);

  useEffect(() => {
    let isMounted = true;

    const syncModules = (apiItems?: PublicServiceItem[]) => {
      const stored = getStoredServices();
      const accItems = stored.filter(
        (s) =>
          s.categoryKey?.toLowerCase() === "akuntansi" &&
          s.status === "Published" &&
          getCmsItemStatus(s.id, s.name, s.status || "Published", [s.code]) !== "Draft" &&
          !isCmsItemDeleted(s.id, s.name, undefined, s.code)
      );

      const isDefaultDeleted =
        isCmsItemDeleted(
          DEFAULT_ACCOUNTING_MODULE.id,
          DEFAULT_ACCOUNTING_MODULE.title,
          undefined,
          DEFAULT_ACCOUNTING_MODULE.code
        ) ||
        getCmsItemStatus(
          DEFAULT_ACCOUNTING_MODULE.id,
          DEFAULT_ACCOUNTING_MODULE.title,
          "Published",
          [DEFAULT_ACCOUNTING_MODULE.code]
        ) === "Draft";

      if (accItems.length > 0) {
        setModules(
          accItems.map((c) => {
            const apiItem = apiItems?.find(
              (a) =>
                (a.service_code && a.service_code.toLowerCase() === (c.code || c.id).toLowerCase()) ||
                (a.service_name && a.service_name.toLowerCase() === c.name.toLowerCase())
            );

            const rawScopes =
              (c.scopes && c.scopes.length > 0 ? c.scopes : undefined) ||
              (c.pillars && c.pillars.length > 0
                ? c.pillars.map((p) => p.title || p.description)
                : undefined) ||
              (apiItem?.features && apiItem.features.length > 0 ? apiItem.features : undefined) ||
              DEFAULT_ACCOUNTING_MODULE.scopes;

            const rawDeliverable =
              (c.deliverable && c.deliverable.trim()) ||
              (c.deliverables && c.deliverables.length > 0 ? c.deliverables[0] : undefined) ||
              DEFAULT_ACCOUNTING_MODULE.deliverable;

            return {
              id: c.id,
              code: c.code || c.id,
              title: c.name || apiItem?.service_name || DEFAULT_ACCOUNTING_MODULE.title,
              badge: c.badge || DEFAULT_ACCOUNTING_MODULE.badge,
              subtitle: c.subtitle || apiItem?.description || DEFAULT_ACCOUNTING_MODULE.subtitle,
              scopes: rawScopes,
              deliverable: rawDeliverable,
              topicParam: c.topicParam || "laporan-keuangan",
              waTemplate:
                c.waTemplate ||
                `Halo Zhou Consulting, saya ingin konsultasi mengenai layanan ${c.name}.`,
            };
          })
        );
      } else if (!isDefaultDeleted) {
        setModules([DEFAULT_ACCOUNTING_MODULE]);
      } else {
        setModules([]);
      }
    };

    syncModules();

    // 1. Ambil langsung dari live endpoint backend (zero-cache)
    publicApi
      .getServices()
      .then((res) => {
        if (!isMounted) return;
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          const accFromApi = res.data.filter((item: PublicServiceItem) => {
            const cat = (item.category || "").toLowerCase();
            const code = (item.service_code || "").toLowerCase();
            const name = (item.service_name || "").toLowerCase();
            return (
              (cat.includes("akuntansi") || code.includes("acc") || name.includes("akuntansi") || name.includes("pembukuan")) &&
              !isCmsItemDeleted(item.id, item.service_name, item.id, item.service_code)
            );
          });

          syncModules(accFromApi);
        }
      })
      .catch(() => {
        syncModules();
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
        {/* Core Accounting Services Card */}
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

            {modules.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-text-secondary text-sm max-w-xl mx-auto">
                Belum ada layanan akuntansi yang dipublikasikan saat ini.
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
