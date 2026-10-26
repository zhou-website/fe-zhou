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

const DEFAULT_LEGAL_MODULES: LegalModuleItem[] = [
  {
    id: "SRV-LAW-CTR",
    code: "LAW-CTR",
    title: "Drafting & Review Kontrak Komersial",
    badge: "KONTRAK & PERJANJIAN BISNIS",
    subtitle: "Penyusunan dan penelaahan perjanjian kerjasama, NDA, MoU, perjanjian pemegang saham, dan kontrak vendor.",
    scopes: [
      "Penyusunan klausul mitigasi risiko sengketa perdata & force majeure",
      "Klausul ganti rugi (indemnification), batasan tanggung jawab, & dispute settlement",
      "Review kepatuhan terhadap Kitab Undang-Undang Hukum Perdata (KUHPerdata)",
      "Penyelarasan hak kekayaan intelektual (HAKI) dan kerahasiaan data komersial",
    ],
    deliverable: "Final Draft Kontrak Bahasa Indonesia / Bilingual & Legal Opinion Ringkas.",
    topicParam: "kontrak-komersial",
    waTemplate: "Halo Zhou Consulting, saya ingin konsultasi mengenai pembuatan dan penelaahan Kontrak Bisnis / Komersial.",
  },
  {
    id: "SRV-LAW-OSS",
    code: "LAW-OSS",
    title: "Perizinan Usaha Berbasis Risiko OSS-RBA",
    badge: "PERIZINAN BERUSAHA & KBLI",
    subtitle: "Pendampingan penerbitan NIB, Sertifikat Standar, dan izin operasional komersial melalui sistem OSS terintegrasi.",
    scopes: [
      "Pemetaan Klasifikasi Baku Lapangan Usaha Indonesia (KBLI) 2020 yang tepat",
      "Penerbitan Nomor Induk Berusaha (NIB) dan pemenuhan persyaratan komitmen",
      "Pengurusan Kesesuaian Kegiatan Pemanfaatan Ruang (KKPR) dan Persetujuan Lingkungan",
      "Migrasi data profil perizinan dan updating penanggung jawab usaha",
    ],
    deliverable: "NIB Terverifikasi, Sertifikat Standar / Izin Operasional Resmi OSS.",
    topicParam: "perizinan-oss",
    waTemplate: "Halo Zhou Consulting, saya ingin konsultasi mengenai perizinan usaha OSS-RBA dan penyesuaian KBLI perusahaan.",
  },
  {
    id: "SRV-LAW-CORP",
    code: "LAW-CORP",
    title: "Restrukturisasi Legalitas & Anggaran Dasar PT",
    badge: "HUKUM PERSEROAN TERBATAS",
    subtitle: "Penyesuaian anggaran dasar, peralihan saham, perubahan susunan direksi/komisaris, dan penerbitan akta notaris Kemenkumham.",
    scopes: [
      "Penyelenggaraan Rapat Umum Pemegang Saham (RUPS) fisik maupun sirkuler",
      "Penyusunan risalah RUPS untuk peningkatan modal disetor dan jual beli saham",
      "Pendampingan penerbitan Surat Keputusan (SK) Pengesahan AHU Kemenkumham",
      "Due diligence legalitas perizinan perseroan dan kelengkapan dokumen pendirian",
    ],
    deliverable: "Risalah RUPS Resmi, Akta Notaris Perubahan, & SK AHU Kemenkumham.",
    topicParam: "restrukturisasi-pt",
    waTemplate: "Halo Zhou Consulting, saya ingin konsultasi mengenai perubahan anggaran dasar PT, RUPS, dan legalitas perseroan.",
  },
  {
    id: "SRV-LEGAL-TAX",
    code: "LEGAL_TAX",
    title: "Legal & Tax Dispute Advisory",
    badge: "ADVOKASI & SENGKETA HUKUM",
    subtitle: "Pendampingan pemeriksaan pajak, klarifikasi SP2DK, pengajuan keberatan, dan mitigasi risiko regulasi.",
    scopes: [
      "Pendampingan Pemeriksaan Pajak (Audit Assistance)",
      "Penyusunan Tanggapan Resmi Surat Klarifikasi SP2DK",
      "Pengajuan Permohonan Keberatan Pajak",
      "Advokasi & Banding di Pengadilan Pajak",
    ],
    deliverable: "Risalah Tanggapan Hukum & SPHP, Surat Keberatan / Memori Banding, & Legal Opinion Resmi.",
    topicParam: "sengketa-hukum-pajak",
    waTemplate: "Halo Zhou Consulting, saya ingin konsultasi mengenai Legal & Tax Dispute Advisory dan pendampingan sengketa hukum.",
  },
];

export default function KonsultasiHukumPage() {
  const waPhone = process.env.NEXT_PUBLIC_WA_PHONE || "6285121286086";
  const [modules, setModules] = useState<LegalModuleItem[]>(() =>
    DEFAULT_LEGAL_MODULES.filter((base) => !isCmsItemDeleted(base.id, base.title, undefined, base.code))
  );

  useEffect(() => {
    let isMounted = true;

    const syncModules = (apiItems?: PublicServiceItem[]) => {
      const stored = getStoredServices();
      const lawItems = stored.filter(
        (s) =>
          (s.categoryKey?.toLowerCase() === "hukum" || s.categoryKey?.toLowerCase() === "legal") &&
          s.status === "Published" &&
          !isCmsItemDeleted(s.id, s.name, undefined, s.code)
      );

      // Modul Utama Law Services (hanya yang belum dihapus oleh admin)
      const baseMerged = DEFAULT_LEGAL_MODULES
        .filter((base) => !isCmsItemDeleted(base.id, base.title, undefined, base.code))
        .map((base) => {
          const storedItem = lawItems.find(
            (c) =>
              c.id === base.id ||
              c.code === base.code ||
              (c.name && c.name.toLowerCase() === base.title.toLowerCase())
          );

          const apiItem = apiItems?.find(
            (a) =>
              (a.service_code && a.service_code.toLowerCase() === base.code.toLowerCase()) ||
              (a.service_name && a.service_name.toLowerCase() === base.title.toLowerCase())
          );

          const rawScopes =
            (storedItem?.scopes && storedItem.scopes.length > 0 ? storedItem.scopes : undefined) ||
            (storedItem?.pillars && storedItem.pillars.length > 0
              ? storedItem.pillars.map((p: any) => p.title || p.description)
              : undefined) ||
            (apiItem?.features && apiItem.features.length > 0 ? apiItem.features : undefined) ||
            base.scopes;

          const rawDeliverable =
            (storedItem?.deliverable && storedItem.deliverable.trim()) ||
            (storedItem?.deliverables && storedItem.deliverables.length > 0 ? storedItem.deliverables[0] : undefined) ||
            base.deliverable;

          return {
            id: base.id,
            code: base.code,
            title: storedItem?.name || apiItem?.service_name || base.title,
            badge: storedItem?.badge || base.badge,
            subtitle: storedItem?.subtitle || apiItem?.description || base.subtitle,
            scopes: rawScopes,
            deliverable: rawDeliverable,
            topicParam: storedItem?.topicParam || base.topicParam,
            waTemplate:
              storedItem?.waTemplate ||
              base.waTemplate ||
              `Halo Zhou Consulting, saya ingin konsultasi mengenai layanan ${base.title}.`,
          };
        });

      // Modul tambahan dari CMS local storage jika ada
      const extraStored = lawItems
        .filter(
          (s) =>
            !DEFAULT_LEGAL_MODULES.some(
              (base) =>
                (s.code && s.code.toLowerCase() === base.code.toLowerCase()) ||
                (s.name && s.name.toLowerCase() === base.title.toLowerCase()) ||
                s.id.toLowerCase() === base.id.toLowerCase()
            )
        )
        .map((c) => ({
          id: c.id,
          code: c.code || c.id,
          title: c.name,
          badge: c.badge || "LAW & LEGAL SERVICES",
          subtitle: c.subtitle || "Layanan hukum bisnis dan kepatuhan regulasi korporasi",
          scopes:
            c.scopes && c.scopes.length > 0
              ? c.scopes
              : c.pillars?.map((p: any) => p.title || p.description) || [
                  "Pendampingan aspek kepatuhan hukum dan regulasi korporasi",
                  "Mitigasi risiko hukum dan telaah perjanjian bisnis",
                ],
          deliverable: c.deliverable || "Dokumen Legal Opinion & Dokumen Kepatuhan Regulasi",
          topicParam: c.topicParam || "hukum",
          waTemplate: c.waTemplate || `Halo Zhou Consulting, saya ingin konsultasi mengenai layanan ${c.name}.`,
        }));

      // Modul tambahan dari backend jika ada
      const extraApi = (apiItems || [])
        .filter(
          (a) =>
            !isCmsItemDeleted(a.id, a.service_name, a.id, a.service_code) &&
            !DEFAULT_LEGAL_MODULES.some(
              (base) =>
                (a.service_code && a.service_code.toLowerCase() === base.code.toLowerCase()) ||
                (a.service_name && a.service_name.toLowerCase() === base.title.toLowerCase())
            )
        )
        .map((c) => ({
          id: `LAW-${c.id}`,
          code: c.service_code || `LAW-${c.id}`,
          title: c.service_name,
          badge: c.category?.toUpperCase() || "LAW & LEGAL SERVICES",
          subtitle: c.description || "Layanan hukum bisnis dan kepatuhan regulasi korporasi",
          scopes:
            c.features && c.features.length > 0
              ? c.features
              : [
                  "Pendampingan aspek kepatuhan hukum dan regulasi korporasi",
                  "Mitigasi risiko hukum dan telaah perjanjian bisnis",
                ],
          deliverable: "Dokumen Legal Opinion & Dokumen Kepatuhan Regulasi",
          topicParam: "hukum",
          waTemplate: `Halo Zhou Consulting, saya ingin konsultasi mengenai layanan ${c.service_name}.`,
        }));

      const combined: LegalModuleItem[] = [];
      const seen = new Set<string>();

      for (const item of [...baseMerged, ...extraStored, ...extraApi]) {
        const titleKey = item.title.trim().toLowerCase();
        const codeKey = item.code.trim().toLowerCase();
        if (seen.has(titleKey) || seen.has(codeKey)) continue;
        if (isCmsItemDeleted(item.id, item.title, undefined, item.code)) continue;
        const status = getCmsItemStatus(item.id, item.title, "Published", [item.code]);
        if (status !== "Published") continue;
        seen.add(titleKey);
        seen.add(codeKey);
        combined.push(item);
      }

      setModules(combined);
    };

    // Sinkronisasi render seketika tanpa delay
    syncModules();

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
            if (item.is_active === false) return false;
            if (isCmsItemDeleted(item.id, item.service_name, item.id, item.service_code)) return false;
            const status = getCmsItemStatus(`SVC-${item.id}`, item.service_name, item.is_active ? "Published" : "Draft", [item.id, item.service_code]);
            if (status !== "Published") return false;
            return (
              (cat.includes("hukum") || cat.includes("legal") || code.includes("law") || code.includes("legal") || name.includes("hukum") || name.includes("legal") || cat.includes("sengketa"))
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
