"use client";

import { ContentStatus } from "./publicContentData";
import { isCmsItemDeleted, recordDeletedCmsItem, removeDeletedCmsItem } from "./cmsDeletedStorage";
import { adminCmsApi } from "@/lib/api";

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
  pillars?: ServicePillar[];
  scopes?: string[];
  workflow?: string[];
  deliverables?: string[];
  deliverable?: string;
  faqs?: ServiceFAQ[];
  status: ContentStatus;
  lastUpdated: string;
  topicParam?: string;
  waTemplate?: string;
}

export const DEFAULT_SERVICES: StoredServiceItem[] = [
  {
    id: "SRV-ACC-SERV",
    code: "ACC_SERV",
    categoryKey: "akuntansi",
    name: "Accounting Services",
    subtitle: "Penyusunan laporan keuangan berstandar SAK/PSAK, pembukuan komprehensif, neraca, laba rugi, dan rekonsiliasi profesional.",
    badge: "AKUNTANSI & SAK",
    route: "/layanan/akuntansi",
    scopes: [
      "Laporan Posisi Keuangan (Neraca) & Laba Rugi",
      "Pencatatan Jurnal & Buku Besar Terstandar PSAK",
      "Rekonsiliasi Bank & Manajemen Kas Berkala",
      "Review & Supervisi Akuntansi Korporasi",
    ],
    deliverable: "Buku Besar, Neraca, Laba Rugi, & Laporan Keuangan Lengkap Berstandar SAK.",
    pillars: [
      {
        title: "Laporan Posisi Keuangan (Neraca) & Laba Rugi",
        description: "Penyusunan laporan posisi keuangan dan laba rugi berstandar PSAK/SAK.",
      },
      {
        title: "Pencatatan Jurnal & Buku Besar Terstandar PSAK",
        description: "Pencatatan jurnal transaksi dan buku besar terstruktur serta rapi.",
      },
      {
        title: "Rekonsiliasi Bank & Manajemen Kas Berkala",
        description: "Rekonsiliasi rekening koran dan tata kelola arus kas berkala.",
      },
    ],
    status: "Published",
    lastUpdated: "Oktober 2026",
    topicParam: "akuntansi",
    waTemplate: "Halo Zhou Consulting, saya ingin konsultasi mengenai Accounting Services.",
  },
  {
    id: "SRV-FIN-CONS",
    code: "FIN_CONS",
    categoryKey: "bisnis",
    name: "Business & Financial Services",
    subtitle: "Advisori strategi finansial korporasi, studi kelayakan investasi bisnis, optimalisasi arus kas, dan perencanaan anggaran.",
    badge: "KONSULTASI BISNIS & FINANSIAL",
    route: "/layanan/bisnis",
    scopes: [
      "Analisis Kesehatan & Kinerja Finansial Korporasi",
      "Perencanaan Anggaran & Optimalisasi Arus Kas",
      "Evaluasi Kelayakan Investasi & Studi Finansial",
      "Restrukturisasi Finansial & Mitigasi Risiko",
    ],
    deliverable: "Laporan Studi Kelayakan, Analisis Rasio Keuangan, & Model Proyeksi Finansial.",
    pillars: [
      {
        title: "Analisis Kesehatan & Kinerja Finansial Korporasi",
        description: "Evaluasi rasio likuiditas, solvabilitas, dan profitabilitas korporasi.",
      },
      {
        title: "Perencanaan Anggaran & Optimalisasi Arus Kas",
        description: "Perencanaan anggaran belanja modal dan manajemen likuiditas kerja.",
      },
      {
        title: "Evaluasi Kelayakan Investasi & Studi Finansial",
        description: "Uji kelayakan finansial dan proyeksi return of investment (ROI).",
      },
    ],
    status: "Published",
    lastUpdated: "Oktober 2026",
    topicParam: "bisnis",
    waTemplate: "Halo Zhou Consulting, saya ingin konsultasi mengenai Business & Financial Services.",
  },
  {
    id: "SRV-TAX-CORE",
    code: "TAX_CORE",
    categoryKey: "tax-service",
    name: "Tax Services",
    subtitle: "Pendampingan kepatuhan perpajakan korporasi, transisi Coretax DJP, pelaporan SPT Masa & Tahunan, serta mitigasi risiko fiskal.",
    badge: "STANDAR CORETAX DJP",
    route: "/layanan/tax-service",
    scopes: [
      "Pendampingan Transisi & Kesiapan Coretax DJP",
      "Pelaporan SPT Masa PPh & PPN Tepat Waktu",
      "Rekonsiliasi Fiskal & SPT Tahunan Badan 1771",
      "Mitigasi Risiko Denda & Kepatuhan Regulasi Pajak",
    ],
    deliverable: "Bukti Penerimaan Elektronik (BPE) DJP & Kertas Kerja Rekonsiliasi Fiskal.",
    pillars: [
      {
        title: "Pendampingan Transisi & Kesiapan Coretax DJP",
        description: "Asistensi transisi kesiapan modul Coretax DJP 2026.",
      },
      {
        title: "Pelaporan SPT Masa PPh & PPN Tepat Waktu",
        description: "Pelaporan tepat waktu SPT Masa PPh 21/23/25/PPN dan validasi faktur.",
      },
      {
        title: "Rekonsiliasi Fiskal & SPT Tahunan Badan 1771",
        description: "Ekualisasi omzet, rekonsiliasi fiskal, serta SPT Tahunan Badan.",
      },
    ],
    status: "Published",
    lastUpdated: "Oktober 2026",
    topicParam: "tax-service",
    waTemplate: "Halo Zhou Consulting, saya ingin konsultasi mengenai Tax Services.",
  },
  {
    id: "SRV-LEGAL-TAX",
    code: "LEGAL_TAX",
    categoryKey: "hukum",
    name: "Law Services",
    subtitle: "Pendampingan aspek hukum bisnis, drafting dan review kontrak komersial, perizinan OSS-RBA, serta advokasi sengketa regulasi.",
    badge: "HUKUM & LEGALITAS BISNIS",
    route: "/layanan/hukum",
    scopes: [
      "Drafting & Review Kontrak Komersial",
      "Perizinan Usaha Berbasis Risiko OSS-RBA",
      "Restrukturisasi Legalitas & Anggaran Dasar PT",
      "Pendampingan Pemeriksaan & Sengketa Pajak",
    ],
    deliverable: "Draft Perjanjian Komersial, Dokumen Izin OSS-RBA, & Legal Opinion Resmi.",
    pillars: [
      {
        title: "Drafting & Review Kontrak Komersial",
        description: "Penyusunan perjanjian kerjasama bisnis, NDA, MoU, dan kontrak vendor.",
      },
      {
        title: "Perizinan Usaha Berbasis Risiko OSS-RBA",
        description: "Penerbitan NIB, Sertifikat Standar, dan kepatuhan komitmen izin usaha.",
      },
      {
        title: "Pendampingan Pemeriksaan & Sengketa Pajak",
        description: "Pendampingan aspek legalitas korporasi, SP2DK, dan advokasi sengketa.",
      },
    ],
    status: "Published",
    lastUpdated: "Oktober 2026",
    topicParam: "hukum",
    waTemplate: "Halo Zhou Consulting, saya ingin konsultasi mengenai Law Services.",
  },
];

export const SERVICES_STORAGE_KEY = "zhou_services_data_v2";
export const SERVICES_EVENT = "zhou_services_updated";

export function formatDocNumberFromTitle(title?: string, id?: string | number): string {
  if (!title) return `SRV-${id || "NEW"}`;
  return `SRV-${title.slice(0, 3).toUpperCase()}-${id || "001"}`;
}

export function inferCategoryFromTitle(title?: string): string {
  if (!title) return "Tax Service Core";
  const lower = title.toLowerCase();
  if (lower.includes("pajak") || lower.includes("tax")) return "Tax Service Core";
  if (lower.includes("akuntansi") || lower.includes("accounting") || lower.includes("buku")) return "Accounting Service";
  if (lower.includes("hukum") || lower.includes("legal") || lower.includes("perjanjian")) return "Legal Compliance";
  return "Konsultasi Bisnis";
}

export function inferDeliverableFromTitle(title?: string): string {
  if (!title) return "Dokumen Laporan Resmi";
  const lower = title.toLowerCase();
  if (lower.includes("spt")) return "Bukti Penerimaan Elektronik (BPE) & Formulir Induk SPT";
  if (lower.includes("laporan") || lower.includes("keuangan")) return "Buku Besar & Laporan Keuangan Lengkap";
  if (lower.includes("kontrak") || lower.includes("legal")) return "Draft Perjanjian Hukum & Legal Opinion Final";
  return "Dokumen Laporan & Rekomendasi Resmi";
}

// Persistent & In-memory runtime state untuk sinkronisasi layanan
function loadInitialServices(): StoredServiceItem[] {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(SERVICES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Gagal membaca layanan dari localStorage:", e);
    }
  }
  return [...DEFAULT_SERVICES];
}

let memoryServices: StoredServiceItem[] = loadInitialServices();

/**
 * Mendapatkan daftar layanan
 */
export function getStoredServices(): StoredServiceItem[] {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(SERVICES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          memoryServices = parsed;
        }
      }
    } catch {}
  }
  return memoryServices.filter((s) => !isCmsItemDeleted(s.id, s.name, undefined, s.code));
}

/**
 * Menyimpan daftar layanan ke persistent localStorage dan memicu custom event untuk sinkronisasi
 */
export function saveStoredServices(services: StoredServiceItem[]): void {
  memoryServices = services;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(services));
    } catch (e) {
      console.warn("Gagal menyimpan layanan ke localStorage:", e);
    }
    window.dispatchEvent(new CustomEvent(SERVICES_EVENT, { detail: services }));
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
  serviceData: Omit<StoredServiceItem, "id" | "lastUpdated"> & { id?: string; skipApiSync?: boolean }
): StoredServiceItem {
  const current = getStoredServices();
  const id = serviceData.id || `SRV-${Date.now().toString(36).toUpperCase()}`;

  // Pastikan tombstone dihapus agar layanan baru/re-published langsung tampil
  removeDeletedCmsItem(id, serviceData.code, serviceData.name);

  const today = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const { skipApiSync, ...rest } = serviceData;

  const newService: StoredServiceItem = {
    ...rest,
    id,
    lastUpdated: today,
    status: serviceData.status || "Published",
  };

  const updated = [newService, ...current];
  saveStoredServices(updated);

  if (!skipApiSync) {
    adminCmsApi
      .createService({
        service_code: newService.code || newService.id,
        service_name: newService.name,
        category: newService.categoryKey,
        description: newService.subtitle,
        is_active: true, // Selalu true di backend agar query prisma where: { is_active: true } tidak menyembunyikannya
      })
      .catch((err) => {
        console.warn("adminCmsApi.createService sinkronisasi:", err);
      });
  }

  return newService;
}

/**
 * Memperbarui layanan yang ada (UPDATE)
 */
export function updateStoredService(
  id: string,
  updates: Partial<StoredServiceItem>
): StoredServiceItem | null {
  const current = getStoredServices();
  const normId = id.trim().toLowerCase();
  const index = current.findIndex((s) => {
    if (s.id.toLowerCase() === normId) return true;
    if (s.code && s.code.toLowerCase() === normId) return true;
    if (updates.code && s.code && s.code.toLowerCase() === updates.code.toLowerCase()) return true;
    if (updates.id && s.id.toLowerCase() === updates.id.toLowerCase()) return true;
    if (updates.name && s.name && s.name.trim().toLowerCase() === updates.name.trim().toLowerCase()) return true;
    if (normId && s.name && s.name.trim().toLowerCase() === normId) return true;
    const sIdClean = s.id.toLowerCase().replace(/^(srv-|svc-)/, "").replace(/[-_]/g, "");
    const targetClean = normId.replace(/^(srv-|svc-)/, "").replace(/[-_]/g, "");
    if (sIdClean && targetClean && sIdClean === targetClean) return true;
    return false;
  });

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

    const numericBackendId = parseInt(String(id).replace(/\D/g, ""), 10);
    if (!isNaN(numericBackendId) && numericBackendId > 0) {
      adminCmsApi
        .updateService(numericBackendId, {
          service_name: updatedItem.name,
          category: updatedItem.categoryKey,
          description: updatedItem.subtitle,
          is_active: true, // Selalu true di backend database agar prisma where: { is_active: true } tidak mengabaikannya
        })
        .catch((err) => {
          console.warn("adminCmsApi.updateService sinkronisasi:", err);
        });
    }

    return updatedItem;
  } else {
    const upserted: StoredServiceItem = {
      id,
      code: updates.code,
      categoryKey: updates.categoryKey || "tax-service",
      name: updates.name || "Layanan",
      subtitle: updates.subtitle || "",
      badge: updates.badge || "LAYANAN",
      route: updates.route || "/layanan",
      pillars: updates.pillars || (updates.scopes ? updates.scopes.map((sc) => ({ title: sc, description: sc })) : []),
      workflow: updates.workflow || ["Konsultasi Kebutuhan Awal", "Analisis & Telaah Regulasi", "Eksekusi Layanan", "Penyampaian Laporan Final"],
      deliverables: updates.deliverables || (updates.deliverable ? [updates.deliverable] : ["Laporan Hasil Kerja Resmi"]),
      deliverable: updates.deliverable,
      scopes: updates.scopes,
      status: updates.status || "Published",
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
  const current = getStoredServices();
  const target = idOrTitle.trim().toLowerCase();
  const targetSlug = target.replace(/[^a-z0-9]+/g, "-");

  const toDelete = current.find((s) => {
    const sName = s.name.trim().toLowerCase();
    const sId = s.id.trim().toLowerCase();
    const sCode = (s.code || "").trim().toLowerCase();
    return s.id === idOrTitle || sId === target || sId === targetSlug || sName === target || sCode === target;
  });

  recordDeletedCmsItem({
    id: toDelete?.id || idOrTitle,
    title: toDelete?.name || idOrTitle,
    code: toDelete?.code || idOrTitle,
    category: toDelete?.categoryKey,
  });

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

  const numId = parseInt(idOrTitle.replace(/\D/g, ""), 10);
  if (!isNaN(numId) && numId > 0) {
    adminCmsApi.updateService(numId, { is_active: false }).catch(() => {});
    adminCmsApi.deleteService(numId).catch((err) => {
      console.warn("adminCmsApi.deleteService sinkronisasi:", err);
    });
  }

  return true;
}


/**
 * Reset data layanan ke default
 */
export function resetServicesToDefault(): void {
  saveStoredServices(DEFAULT_SERVICES);
}
