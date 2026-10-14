"use client";

import { ContentStatus } from "./publicContentData";
import { adminCmsApi } from "@/lib/api";
import { isCmsItemDeleted, recordDeletedCmsItem } from "./cmsDeletedStorage";

export interface ServicePillar {
  title: string;
  description: string;
}

export interface ServiceFAQ {
  q: string;
  a: string;
}

export interface StoredServiceItem {
  id: string;
  code?: string;
  categoryKey: "hukum" | "bisnis" | "akuntansi" | "tax-service" | string;
  name: string;
  subtitle: string;
  badge?: string;
  route: string;
  leadConsultant?: string;
  pillars: ServicePillar[];
  workflow: string[];
  deliverables: string[];
  faqs?: ServiceFAQ[];
  status: ContentStatus;
  lastUpdated: string;
}

export const DEFAULT_SERVICES: StoredServiceItem[] = [
  {
    id: "SRV-ACC-SERV",
    code: "ACC_SERV",
    categoryKey: "akuntansi",
    name: "Accounting Services",
    subtitle: "Layanan akuntansi profesional berstandar SAK untuk laporan keuangan yang akuntabel, transparan, dan siap audit.",
    badge: "ACCOUNTING SERVICES",
    route: "/layanan/akuntansi",
    leadConsultant: "Praktisi Akuntan Berlisensi CA (Chartered Accountant)",
    pillars: [
      { title: "Penyusunan Laporan Keuangan SAK EP / PSAK", description: "Penyusunan neraca, laba rugi, perubahan ekuitas, arus kas, dan CALK standar audit perbankan." },
      { title: "Perancangan & Restrukturisasi Bagan Akun (COA)", description: "Standardisasi hierarki kode akun akuntansi yang selaras dengan pusat biaya dan ekualisasi fiskal." },
      { title: "Rekonsiliasi Fiskal & Penyesuaian Akuntansi Pajak", description: "Penyelarasan laba rugi komersial dengan ketentuan perpajakan serta perhitungan beda tetap dan waktu." },
    ],
    workflow: ["Verifikasi Dokumen Transaksi", "Penjurnalan & Posting Buku Besar", "Penyusunan Trial Balance & Koreksi", "Penerbitan Laporan Keuangan Final"],
    deliverables: ["Bundel Laporan Keuangan Lengkap", "Master Chart of Accounts (COA)", "Kertas Kerja Rekonsiliasi Fiskal"],
    faqs: [
      { q: "Apakah laporan keuangan dapat digunakan untuk audit eksternal atau bank?", a: "Ya, laporan disusun mengacu pada SAK Entitas Privat/PSAK resmi yang siap diaudit." },
    ],
    status: "Published",
    lastUpdated: "Oktober 2026",
  },
  {
    id: "SRV-FIN-CONS",
    code: "FIN_CONS",
    categoryKey: "bisnis",
    name: "Business & Financial Services",
    subtitle: "Konsultasi perencanaan keuangan korporat, pemodelan arus kas, efisiensi modal kerja, dan restrukturisasi finansial.",
    badge: "BUSINESS & FINANCIAL",
    route: "/layanan/bisnis",
    leadConsultant: "Konsultan Keuangan & Advisory Bisnis Zhou Consulting",
    pillars: [
      { title: "Diagnostic & Financial Health Check", description: "Audit mendalam atas efisiensi rasio likuiditas, solvabilitas, dan profitabilitas korporasi." },
      { title: "Proyeksi Arus Kas & Penganggaran Finansial", description: "Pemodelan skenario proyeksi likuiditas 1-3 tahun dan optimalisasi modal kerja operasional." },
      { title: "Perencanaan Pajak Strategis (Tax Planning)", description: "Efisiensi struktur transaksi dan beban pajak legal tanpa melanggar ketentuan perundang-undangan." },
    ],
    workflow: ["Diagnostik Finansial & Operasional", "Pemodelan Strategis & Skenario", "Rekomendasi Kebijakan Bisnis", "Pendampingan Implementasi"],
    deliverables: ["Dokumen Rekomendasi Advisory Finansial", "Model Proyeksi Cashflow 3 Tahun", "Executive Summary Dewan Direksi"],
    faqs: [
      { q: "Bagaimana tahapan awal konsultasi bisnis?", a: "Kami memulai dengan sesi diagnosa komprehensif untuk memetakan tantangan fiskal dan finansial perusahaan Anda." },
    ],
    status: "Published",
    lastUpdated: "Oktober 2026",
  },
  {
    id: "SRV-TAX-CORE",
    code: "TAX_CORE",
    categoryKey: "tax-service",
    name: "Tax Services",
    subtitle: "Layanan kepatuhan perpajakan korporat, asistensi pelaporan SPT Masa & Tahunan, transisi Coretax DJP, serta mitigasi risiko SP2DK.",
    badge: "TAX SERVICES",
    route: "/layanan/tax-service",
    leadConsultant: "Tim Konsultan Pajak BKP Zhou Consulting",
    pillars: [
      { title: "Kepatuhan SPT Masa & Tahunan Badan", description: "Penyusunan dan pelaporan SPT Masa PPh, PPN, dan SPT Tahunan Badan akurat dan tepat waktu." },
      { title: "Pendampingan Integrasi Coretax DJP 2026", description: "Asistensi adaptasi akun deposit pajak, e-Faktur Coretax, dan rekonsiliasi data fiskal sistem baru." },
      { title: "Mitigasi SP2DK & Telaah Pajak (Tax Review)", description: "Penyusunan tanggapan formal, klarifikasi pengawasan fiskal, dan review kepatuhan sebelum audit." },
    ],
    workflow: ["Pengumpulan Bukti Potong & Dokumen", "Rekonsiliasi Fiskal & Ekualisasi", "Validasi Draft & Konfirmasi PIC", "Submit Pelaporan Coretax DJP"],
    deliverables: ["Buku Laporan Kepatuhan Pajak", "Bukti Penerimaan Elektronik (BPE)", "Kertas Kerja Ekualisasi PPh & PPN"],
    faqs: [
      { q: "Apakah layanan ini mencakup transisi Coretax DJP 2026?", a: "Ya, seluruh proses perpajakan disesuaikan dengan protokol akun deposit pajak dan sistem baru DJP." },
    ],
    status: "Published",
    lastUpdated: "Oktober 2026",
  },
  {
    id: "SRV-LEGAL-TAX",
    code: "LEGAL_TAX",
    categoryKey: "hukum",
    name: "Law Services",
    subtitle: "Pendampingan hukum bisnis, mitigasi sengketa perpajakan, penelaahan kontrak komersial, dan advisori kepatuhan regulasi.",
    badge: "LAW SERVICES",
    route: "/layanan/hukum",
    leadConsultant: "Tim Kuasa Hukum Pajak & Advokat PERADI Zhou Consulting",
    pillars: [
      { title: "Pendampingan Pemeriksaan & Sengketa Pajak", description: "Asistensi tatap muka dengan fungsional pemeriksa dan penyusunan berkas tanggapan SPHP." },
      { title: "Keberatan & Banding di Pengadilan Pajak", description: "Penyusunan surat keberatan formal, memori banding, dan pendampingan di Pengadilan Pajak." },
      { title: "Kepatuhan Hukum & Review Kontrak Komersial", description: "Penelaahan kontrak bisnis dari aspek hukum perdata, ketenagakerjaan, dan implikasi perpajakan." },
    ],
    workflow: ["Analisis Surat Klarifikasi / Pemeriksaan", "Penyusunan Bukti & Argumen Hukum", "Asistensi Pembahasan Akhir (Closing)", "Evaluasi Tindak Lanjut"],
    deliverables: ["Risalah Tanggapan Hukum & SPHP", "Surat Keberatan / Memori Banding", "Legal Opinion Kepatuhan Regulasi"],
    faqs: [
      { q: "Kapan perusahaan harus meminta pendampingan sengketa hukum?", a: "Sebaiknya segera setelah menerima surat klarifikasi (SP2DK) atau Surat Pemberitahuan Pemeriksaan Lapangan (SP2)." },
    ],
    status: "Published",
    lastUpdated: "Oktober 2026",
  },
];

export const SERVICES_STORAGE_KEY = "zhou_services_data_v1";
export const SERVICES_EVENT = "zhou_services_updated";

/**
 * Mendapatkan daftar layanan dari localStorage (atau default jika belum ada)
 */
export function getStoredServices(): StoredServiceItem[] {
  if (typeof window === "undefined") {
    return DEFAULT_SERVICES;
  }

  try {
    const raw = localStorage.getItem(SERVICES_STORAGE_KEY);
    const source: StoredServiceItem[] = raw ? JSON.parse(raw) : DEFAULT_SERVICES;
    const coreKeys = ["akuntansi", "bisnis", "tax-service", "hukum"];

    if (Array.isArray(source)) {
      const filtered = source.filter((s) => !isCmsItemDeleted(s.id, s.name, undefined, s.code));
      // Jika sudah memiliki minimal 4 layanan valid, periksa kelengkapan 4 kategori utama
      const hasAllCore = coreKeys.every((k) =>
        filtered.some((s) => s.categoryKey?.toLowerCase() === k)
      );
      if (hasAllCore) return filtered;

      // Lengkapi kategori yang belum ada dari DEFAULT_SERVICES
      const merged = coreKeys.map((k) => {
        const found = filtered.find((s) => s.categoryKey?.toLowerCase() === k);
        return found || DEFAULT_SERVICES.find((d) => d.categoryKey === k)!;
      });
      return merged;
    }
    return DEFAULT_SERVICES;
  } catch (error) {
    console.error("Gagal membaca zhou_services_data dari localStorage:", error);
    return DEFAULT_SERVICES;
  }
}

/**
 * Menyimpan daftar layanan ke localStorage dan memicu custom event untuk sinkronisasi antar-komponen
 */
export function saveStoredServices(services: StoredServiceItem[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(services));
    window.dispatchEvent(new CustomEvent(SERVICES_EVENT, { detail: services }));
  } catch (error) {
    console.error("Gagal menyimpan zhou_services_data ke localStorage:", error);
  }
}

/**
 * Mengambil layanan berdasarkan categoryKey (misal: "akuntansi", "bisnis", "tax-service", "hukum")
 */
export function getStoredServiceByCategory(categoryKey: string): StoredServiceItem | undefined {
  const services = getStoredServices();
  return services.find(
    (s) => s.categoryKey.toLowerCase() === categoryKey.toLowerCase() && s.status === "Published"
  );
}

/**
 * Menambahkan layanan baru (CREATE)
 */
export function addStoredService(
  serviceData: Omit<StoredServiceItem, "id" | "lastUpdated"> & { id?: string }
): StoredServiceItem {
  const current = getStoredServices();
  const id =
    serviceData.id ||
    `SRV-${Date.now().toString(36).toUpperCase()}`;

  const today = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const newService: StoredServiceItem = {
    ...serviceData,
    id,
    lastUpdated: today,
    status: serviceData.status || "Published",
  };

  const updated = [newService, ...current];
  saveStoredServices(updated);

  // Sambungkan penambahan ke Backend API
  adminCmsApi
    .createService({
      service_code: newService.id,
      service_name: newService.name,
      category: newService.categoryKey,
      description: newService.subtitle,
      is_active: newService.status === "Published",
    })
    .catch((err) => {
      console.warn("adminCmsApi.createService fallback:", err);
    });

  return newService;
}

/**
 * Memperbarui layanan yang ada (UPDATE).
 * Jika tidak ditemukan, upsert (tambah baru) agar edit layanan dari backend juga tersimpan lokal.
 */
export function updateStoredService(
  id: string,
  updates: Partial<StoredServiceItem>
): StoredServiceItem | null {
  const current = getStoredServices();
  const index = current.findIndex((s) => s.id === id);

  const today = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  if (index !== -1) {
    const updatedItem: StoredServiceItem = {
      ...current[index],
      ...updates,
      lastUpdated: today,
    };
    const updatedList = [...current];
    updatedList[index] = updatedItem;
    saveStoredServices(updatedList);

    adminCmsApi
      .updateService(id, {
        service_name: updatedItem.name,
        category: updatedItem.categoryKey,
        description: updatedItem.subtitle,
        is_active: updatedItem.status === "Published",
      })
      .catch((err) => {
        console.warn("adminCmsApi.updateService fallback:", err);
      });

    return updatedItem;
  } else {
    // Upsert: backend item not in localStorage, create it
    const upserted: StoredServiceItem = {
      id,
      code: (updates as StoredServiceItem).code,
      categoryKey: (updates as StoredServiceItem).categoryKey || "tax-service",
      name: (updates as StoredServiceItem).name || id,
      subtitle: (updates as StoredServiceItem).subtitle || "",
      badge: (updates as StoredServiceItem).badge || "LAYANAN",
      route: (updates as StoredServiceItem).route || "/layanan",
      pillars: (updates as StoredServiceItem).pillars || [],
      workflow: (updates as StoredServiceItem).workflow || [],
      deliverables: (updates as StoredServiceItem).deliverables || [],
      status: (updates as StoredServiceItem).status || "Published",
      lastUpdated: today,
      ...updates,
    };
    saveStoredServices([upserted, ...current]);
    return upserted;
  }
}

/**
 * Menghapus layanan (DELETE)
 */
export function deleteStoredService(idOrTitle: string): boolean {
  recordDeletedCmsItem({ id: idOrTitle, title: idOrTitle });
  const current = getStoredServices();
  const target = idOrTitle.trim().toLowerCase();
  const targetSlug = target.replace(/[^a-z0-9]+/g, "-");
  const filtered = current.filter((s) => {
    if (isCmsItemDeleted(s.id, s.name, undefined, s.code)) return false;
    const sName = s.name.trim().toLowerCase();
    const sId = s.id.trim().toLowerCase();
    const sCode = (s.code || "").trim().toLowerCase();
    return (
      s.id !== idOrTitle &&
      sId !== target &&
      sId !== targetSlug &&
      sName !== target &&
      sCode !== target
    );
  });

  saveStoredServices(filtered);

  // Sambungkan penghapusan ke Backend API
  adminCmsApi.deleteService(idOrTitle).catch((err) => {
    console.warn("adminCmsApi.deleteService fallback:", err);
  });

  return true;
}

/**
 * Reset data layanan ke default (kosong)
 */
export function resetServicesToDefault(): void {
  saveStoredServices(DEFAULT_SERVICES);
}
