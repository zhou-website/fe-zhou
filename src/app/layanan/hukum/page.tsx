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
];

export default function KonsultasiHukumPage() {
  const waPhone = process.env.NEXT_PUBLIC_WA_PHONE || "6285121286086";
  const [modules, setModules] = useState<LegalModuleItem[]>(DEFAULT_LEGAL_MODULES);

  useEffect(() => {
    const syncModules = () => {
      const stored = getStoredServices();
      const lawItems = stored.filter(
        (s) =>
          (s.categoryKey?.toLowerCase() === "hukum" || s.categoryKey?.toLowerCase() === "legal") &&
          s.status === "Published" &&
          s.id !== "kepatuhan-pdp" &&
          s.code !== "LAW-PDP" &&
          !(s.name || "").toLowerCase().includes("perlindungan data pribadi") &&
          !isCmsItemDeleted(s.id, s.name, undefined, s.code)
      );

      if (lawItems.length > 0) {
        setModules(
          lawItems.map((c) => {
            const rawScopes =
              (c.scopes && c.scopes.length > 0 ? c.scopes : undefined) ||
              (c.pillars && c.pillars.length > 0
                ? c.pillars.map((p) => p.title || p.description)
                : undefined) || [
                "Pendampingan aspek kepatuhan hukum dan regulasi korporasi",
                "Mitigasi risiko hukum dan telaah perjanjian bisnis",
              ];

            const rawDeliverable =
              (c.deliverable && c.deliverable.trim()) ||
              (c.deliverables && c.deliverables.length > 0 ? c.deliverables[0] : undefined) ||
              "Dokumen Legal Opinion & Panduan Kepatuhan Regulasi";

            return {
              id: c.id,
              code: c.code || c.id,
              title: c.name,
              badge: c.badge || "LAW SERVICES",
              subtitle: c.subtitle || "Layanan pendampingan hukum dan kepatuhan regulasi bisnis Zhou Consulting.",
              scopes: rawScopes,
              deliverable: rawDeliverable,
              topicParam: c.topicParam || "hukum",
              waTemplate:
                c.waTemplate ||
                `Halo Zhou Consulting, saya ingin konsultasi mengenai layanan ${c.name}.`,
            };
          })
        );
      } else {
        setModules(DEFAULT_LEGAL_MODULES);
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
        {/* Core Legal Services Cards Grid (3 Grid) */}
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
