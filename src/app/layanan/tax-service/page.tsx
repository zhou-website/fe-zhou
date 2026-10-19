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
    id: "e-billing",
    code: "TAX-EBL",
    title: "e-Billing & VSWP",
    badge: "KODE BILLING & PENYETORAN",
    subtitle: "Penerbitan kode billing setoran pajak tepat waktu dan validasi konfirmasi status wajib pajak.",
    scopes: [
      "Pembuatan kode ID Billing MPN G3 akurat sebelum tanggal jatuh tempo",
      "Verifikasi Kode Akun Pajak (KAP) & Kode Jenis Setoran (KJS) sesuai objek",
      "Validasi Status Wajib Pajak (VSWP / KSWP) untuk kepatuhan perizinan berusaha",
      "Pengecekan Nomor Transaksi Penerimaan Negara (NTPN) bank persepsi",
    ],
    deliverable: "Berkas ID Billing aktif, konfirmasi NTPN perbankan, & arsip validasi VSWP.",
    topicParam: "e-billing",
    waTemplate: "Halo Zhou Consulting, saya ingin konsultasi perihal pembuatan e-Billing dan validasi status pajak (VSWP).",
  },
  {
    id: "pelaporan-spt",
    code: "TAX-SPT",
    title: "Pelaporan SPT (BPE DJP)",
    badge: "PELAPORAN & BPE RESMI",
    subtitle: "Penelaahan ekualisasi fiskal, verifikasi lampiran, dan penyampaian SPT resmi hingga terbit BPE.",
    scopes: [
      "Ekualisasi peredaran usaha vs DPP PPN dan peredaran bruto SPT Tahunan Badan",
      "Verifikasi lampiran khusus (daftar penyusutan, bukti potong, kredit pajak PPh 22/23/25)",
      "Pengisian SPT Masa PPh/PPN dan SPT Tahunan Badan 1771 secara akurat",
      "Penerbitan dan pengarsipan Bukti Penerimaan Elektronik (BPE) resmi DJP",
    ],
    deliverable: "Bukti Penerimaan Elektronik (BPE) resmi Kementerian Keuangan & Kertas Kerja Ekualisasi.",
    topicParam: "pelaporan-spt",
    waTemplate: "Halo Zhou Consulting, saya ingin konsultasi perihal penyusunan dan pelaporan SPT resmi DJP.",
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
    const syncModules = () => {
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
            const defaultItem = TAX_SERVICE_MODULES.find(
              (m) =>
                m.id === c.id ||
                m.code === c.code ||
                m.title.toLowerCase() === c.name.toLowerCase()
            );

            const rawScopes =
              (c.scopes && c.scopes.length > 0 ? c.scopes : undefined) ||
              (c.pillars && c.pillars.length > 0
                ? c.pillars.map((p) => p.title || p.description)
                : undefined) ||
              defaultItem?.scopes || [
                "Konsultasi dan kepatuhan perpajakan terpadu",
                "Mitigasi risiko fiskal dan ekualisasi pelaporan DJP",
              ];

            const rawDeliverable =
              (c.deliverable && c.deliverable.trim()) ||
              (c.deliverables && c.deliverables.length > 0 ? c.deliverables[0] : undefined) ||
              defaultItem?.deliverable ||
              "Kertas Kerja Kepatuhan Fiskal & Bukti Penerimaan Elektronik (BPE)";

            return {
              id: c.id,
              code: c.code || defaultItem?.code || c.id,
              title: c.name,
              badge: c.badge || defaultItem?.badge || "TAX SERVICES",
              subtitle: c.subtitle || defaultItem?.subtitle || "Layanan kepatuhan perpajakan korporat Zhou Consulting.",
              scopes: rawScopes,
              deliverable: rawDeliverable,
              topicParam: c.topicParam || defaultItem?.topicParam || "tax-service",
              waTemplate:
                c.waTemplate ||
                defaultItem?.waTemplate ||
                `Halo Zhou Consulting, saya ingin konsultasi mengenai layanan ${c.name}.`,
            };
          })
        );
      } else {
        setModules(TAX_SERVICE_MODULES);
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
