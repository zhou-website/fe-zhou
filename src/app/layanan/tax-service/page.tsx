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

const TAX_SERVICE_MODULES: TaxModuleItem[] = [
  {
    id: "e-faktur",
    code: "TAX-EFK",
    title: "e-Faktur Pajak",
    badge: "PPN & FAKTUR ELEKTRONIK",
    subtitle: "Penerbitan, validasi, dan rekonsiliasi faktur pajak keluaran & masukan terintegrasi sistem DJP.",
    scopes: [
      "Pembuatan & upload faktur pajak keluaran e-Faktur resmi DJP",
      "Validasi Nomor Seri Faktur Pajak (NSFP) & rekonsiliasi faktur masukan",
      "Penanganan faktur retur, pembatalan faktur, dan troubleshooting error DJP",
      "Ekualisasi omzet SPT Masa PPN 1111 dengan Buku Penjualan perbankan",
    ],
    deliverable: "Draft SPT Masa PPN 1111, Kertas Kerja Ekualisasi, & Bukti Penerimaan Elektronik (BPE).",
    topicParam: "e-faktur",
    waTemplate: "Halo Zhou Consulting, saya ingin konsultasi mengenai pengelolaan dan kepatuhan e-Faktur Pajak (PPN).",
  },
  {
    id: "e-bupot-21",
    code: "TAX-B21",
    title: "e-Bupot 21/26",
    badge: "PPH PASAL 21/26",
    subtitle: "Perhitungan PPh 21 skema TER PP 58/2023, bukti potong bulanan & tahunan, dan pelaporan SPT Masa.",
    scopes: [
      "Perhitungan PPh 21 berbasis Tarif Efektif Rata-Rata (TER) Kategori A, B, dan C",
      "Penerbitan Bukti Pemotongan 1721-VIII bulanan dan formulir 1721-A1 tahunan",
      "Penanganan pemotongan PPh 21 bukan pegawai, tenaga ahli, dan komisaris",
      "Rekonsiliasi ekualisasi beban gaji akun laba rugi vs DPP PPh Pasal 21",
    ],
    deliverable: "File Bukti Potong resmi DJP, formulir 1721-A1, & BPE SPT Masa PPh 21/26.",
    topicParam: "e-bupot-21",
    waTemplate: "Halo Zhou Consulting, saya ingin konsultasi mengenai perhitungan TER dan pelaporan e-Bupot 21/26.",
  },
  {
    id: "e-bupot-unifikasi",
    code: "TAX-BUN",
    title: "e-Bupot Unifikasi",
    badge: "WITHHOLDING TAX TERPUSAT",
    subtitle: "Penerbitan bukti potong PPh Pasal 22, 23, 15, dan 4 ayat (2) serta pelaporan SPT Masa Unifikasi.",
    scopes: [
      "Pemotongan PPh 23 atas jasa manajemen, teknik, konsultan, dan sewa harta",
      "Pemotongan PPh Final Pasal 4(2) persewaan tanah/bangunan & jasa konstruksi",
      "Verifikasi keabsahan NPWP/NIK lawan transaksi dan dasar pengenaan pajak (DPP)",
      "Penyampaian SPT Masa Unifikasi satu pintu terstandar PER-24/PJ/2021",
    ],
    deliverable: "Buku Register Bukti Potong Unifikasi & BPE SPT Masa Unifikasi resmi DJP.",
    topicParam: "e-bupot-unifikasi",
    waTemplate: "Halo Zhou Consulting, saya ingin konsultasi mengenai pengelolaan bukti potong e-Bupot Unifikasi.",
  },
  {
    id: "kesiapan-coretax",
    code: "SRV-TAX-CTX",
    title: "Layanan Mitigasi Pajak",
    badge: "CORETAX DJP 2026",
    subtitle: "Penyelesaian SP2DK yang Tepat dan Akurat.",
    scopes: [
      "Kami mendampingi Anda dalam menghadapi Fase Pengawasan Awal dari Kantor Pelayanan Pajak (KPP). Tim kami membantu menyusun tanggapan resmi, melakukan rekonsiliasi data, serta mendampingi proses konseling atas Surat Permintaan Penjelasan atas Data dan/atau Keterangan (SP2DK) guna menyelesaikan ketidaksesuaian data secara persuasif sebelum masuk ke ranah pemeriksaan."
    ],
    deliverable: "Laporan Kesiapan Coretax, Berita Acara Pendampingan, & Draf Resmi Tanggapan SP2DK.",
    topicParam: "coretax",
    waTemplate: "Halo Zhou Consulting, saya ingin konsultasi mengenai Layanan Mitigasi Pajak dan respon surat SP2DK.",
  },
];

export default function TaxServicePage() {
  const waPhone = process.env.NEXT_PUBLIC_WA_PHONE || "6285121286086";
  const [modules, setModules] = useState<TaxModuleItem[]>(TAX_SERVICE_MODULES);

  useEffect(() => {
    const syncModules = (apiItems?: PublicServiceItem[]) => {
      const stored = getStoredServices();
      const taxStored = stored.filter(
        (s) =>
          (s.categoryKey?.toLowerCase() === "tax-service" || s.categoryKey?.toLowerCase() === "tax") &&
          s.status === "Published" &&
          s.id !== "e-billing" &&
          s.id !== "SRV-TAX-EBL" &&
          s.id !== "pelaporan-spt" &&
          s.id !== "SRV-TAX-SPT" &&
          s.code !== "TAX-EBL" &&
          s.code !== "SRV-TAX-EBL" &&
          s.code !== "TAX-SPT" &&
          s.code !== "SRV-TAX-SPT" &&
          !isCmsItemDeleted(s.id, s.name, undefined, s.code)
      );

      // 1. Modul Dasar (Core Modules)
      // Hanya tampilkan jika TIDAK dihapus di CMS dan TIDAK berstatus Draft
      const baseMerged = TAX_SERVICE_MODULES
        .filter((base) => {
          if (isCmsItemDeleted(base.id, base.title, undefined, base.code)) return false;
          if (base.code && isCmsItemDeleted(base.code)) return false;
          if (base.id && isCmsItemDeleted(base.id)) return false;
          const status = getCmsItemStatus(base.id, base.title, "Published", [base.code]);
          if (status === "Draft") return false;
          return true;
        })
        .map((base) => {
          const storedItem = taxStored.find(
            (c) =>
              c.id === base.id ||
              c.code === base.code ||
              (c.code && base.id && c.code.toLowerCase().includes(base.id.toLowerCase())) ||
              (base.code && c.id && base.code.toLowerCase() === c.id.toLowerCase()) ||
              (c.name && c.name.toLowerCase() === base.title.toLowerCase())
          );

          // Cek apakah item di storage diatur menjadi Draft
          const rawStored = stored.find(
            (c) =>
              c.id === base.id ||
              c.code === base.code ||
              (c.name && c.name.toLowerCase() === base.title.toLowerCase())
          );
          if (rawStored && rawStored.status === "Draft") {
            return null;
          }

          const apiItem = apiItems?.find(
            (a) =>
              (a.service_code && a.service_code.toLowerCase() === base.code.toLowerCase()) ||
              (a.service_name && a.service_name.toLowerCase() === base.title.toLowerCase())
          );

          const rawScopes =
            (storedItem?.scopes && storedItem.scopes.length > 0 ? storedItem.scopes : undefined) ||
            (storedItem?.pillars && storedItem.pillars.length > 0
              ? storedItem.pillars.map((p) => p.title || p.description)
              : undefined) ||
            (apiItem?.features && apiItem.features.length > 0 ? apiItem.features : undefined) ||
            base.scopes;

          const rawDeliverable =
            (storedItem?.deliverable && storedItem.deliverable.trim()) ||
            (storedItem?.deliverables && storedItem.deliverables.length > 0 ? storedItem.deliverables[0] : undefined) ||
            base.deliverable;

          return {
            id: base.id,
            code: storedItem?.code || base.code,
            title: storedItem?.name || apiItem?.service_name || base.title,
            badge: storedItem?.badge || base.badge,
            subtitle: storedItem?.subtitle || apiItem?.description || base.subtitle,
            scopes: rawScopes,
            deliverable: rawDeliverable,
            topicParam: storedItem?.topicParam || base.topicParam,
            waTemplate:
              storedItem?.waTemplate ||
              base.waTemplate ||
              `Halo Zhou Consulting, saya ingin konsultasi mengenai layanan ${storedItem?.name || base.title}.`,
          };
        })
        .filter((b): b is TaxModuleItem => b !== null);

      // Tambahkan layanan tambahan kustom jika ditambahkan oleh admin/superadmin
      const extraStored = taxStored.filter(
        (c) =>
          c.id !== "e-billing" &&
          c.id !== "SRV-TAX-EBL" &&
          c.id !== "pelaporan-spt" &&
          c.id !== "SRV-TAX-SPT" &&
          c.code !== "TAX-EBL" &&
          c.code !== "SRV-TAX-EBL" &&
          c.code !== "TAX-SPT" &&
          c.code !== "SRV-TAX-SPT" &&
          getCmsItemStatus(c.id, c.name, c.status || "Published", [c.code]) !== "Draft" &&
          !isCmsItemDeleted(c.id, c.name, undefined, c.code) &&
          !TAX_SERVICE_MODULES.some(
            (base) =>
              base.id === c.id ||
              base.code === c.code ||
              (c.name && c.name.toLowerCase() === base.title.toLowerCase())
          )
      );

      const extraMapped: TaxModuleItem[] = extraStored.map((c) => {
        const rawScopes =
          (c.scopes && c.scopes.length > 0 ? c.scopes : undefined) ||
          (c.pillars && c.pillars.length > 0
            ? c.pillars.map((p) => p.title || p.description)
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
      });

      setModules([...baseMerged, ...extraMapped]);
    };

    let isMounted = true;

    // Inisialisasi awal 4 modul tax services
    syncModules();

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
              code !== "tax-ebl" &&
              code !== "srv-tax-ebl" &&
              code !== "tax-spt" &&
              code !== "srv-tax-spt" &&
              !isCmsItemDeleted(item.id, item.service_name, item.id, item.service_code)
            );
          });

          syncModules(taxFromApi);
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
        {/* Core Tax Services Cards Grid */}
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

            {modules.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-text-secondary text-sm">
                Belum ada layanan perpajakan yang dipublikasikan saat ini.
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
