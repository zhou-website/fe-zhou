"use client";

import { ContentStatus } from "./publicContentData";
import { isCmsItemDeleted, recordDeletedCmsItem } from "./cmsDeletedStorage";
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
    id: "SVC-4798",
    code: "SVC-4798",
    categoryKey: "akuntansi",
    name: "Penyusunan Laporan Keuangan & Pembukuan",
    subtitle: "Penyusunan laporan posisi keuangan (neraca), laba rugi, perubahan ekuitas, dan arus kas standar resmi perbankan & audit.",
    badge: "ACCOUNTING SERVICES",
    route: "/layanan/akuntansi",
    pillars: [
      {
        title: "Pencatatan Buku Besar & Jurnal",
        description: "Pengelolaan akuntansi berbasis data yang akurat guna menghasilkan laporan bulanan dan tahunan kredibel.",
      },
    ],
    workflow: [],
    deliverables: [
      "Bundel Laporan Keuangan Lengkap (Audit-ready / Bank-ready) beserta CALK resmi.",
    ],
    status: "Published",
    lastUpdated: "19 Okt 2026",
    scopes: [
      "Laporan Posisi Keuangan (Neraca)",
      "Laporan Laba Rugi Komprehensif",
      "Laporan Arus Kas",
    ],
  },
  {
    id: "SVC-5021",
    code: "SVC-5021",
    categoryKey: "tax-service",
    name: "Kepatuhan Pajak Korporasi & Pelaporan SPT",
    subtitle: "Pendampingan perhitungan, penyetoran, dan pelaporan SPT Masa & Tahunan (PPh Badan, PPh 21, PPh 23, PPN).",
    badge: "TAX SERVICES",
    route: "/layanan/tax-service",
    pillars: [
      {
        title: "Perhitungan & Rekonsiliasi Fiskal",
        description: "Pemeriksaan rekonsiliasi komersial ke fiskal untuk meminimalisasi risiko koreksi pajak.",
      },
    ],
    workflow: [],
    deliverables: [
      "Bukti Penerimaan Elektronik (BPE) & Laporan SPT Tahunan PPh Badan.",
    ],
    status: "Published",
    lastUpdated: "19 Okt 2026",
    scopes: [
      "SPT Tahunan PPh Badan",
      "SPT Masa PPh & PPN",
      "Tax Planning & Review",
    ],
  },
  {
    id: "SVC-6034",
    code: "SVC-6034",
    categoryKey: "hukum",
    name: "Kepatuhan Hukum & Legal Drafting Kontrak",
    subtitle: "Penyusunan dan review perjanjian bisnis, uji tuntas hukum (legal due diligence), serta perizinan berusaha OSS-RBA.",
    badge: "LEGAL COMPLIANCE",
    route: "/layanan/hukum",
    pillars: [
      {
        title: "Perjanjian Bisnis & Kepatuhan Korporasi",
        description: "Mitigasi risiko perikatan hukum komersial dan pemenuhan perizinan OSS terintegrasi.",
      },
    ],
    workflow: [],
    deliverables: [
      "Draft Kontrak Final & Legal Opinion Resmi Rekomendasi Advokat.",
    ],
    status: "Published",
    lastUpdated: "19 Okt 2026",
    scopes: [
      "Perjanjian Kerjasama (MoU/PKS)",
      "Uji Tuntas Hukum Usaha",
      "Perizinan OSS-RBA",
    ],
  },
  {
    id: "SVC-7045",
    code: "SVC-7045",
    categoryKey: "bisnis",
    name: "Konsultasi Strategi Finansial & Restrukturisasi",
    subtitle: "Perencanaan arus kas korporasi, analisis kelayakan investasi bisnis, serta restrukturisasi permodalan usaha.",
    badge: "BUSINESS CONSULTING",
    route: "/layanan/bisnis",
    pillars: [
      {
        title: "Analisis Kelayakan Finansial",
        description: "Pemetaan kesehatan neraca dan permodelan proyeksi keuangan ekspansi bisnis.",
      },
    ],
    workflow: [],
    deliverables: [
      "Laporan Financial Feasibility Study & Roadmap Restrukturisasi.",
    ],
    status: "Published",
    lastUpdated: "19 Okt 2026",
    scopes: [
      "Studi Kelayakan Bisnis",
      "Manajemen Modal Kerja",
      "Valuasi & Restrukturisasi",
    ],
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

// In-memory runtime state, tidak lagi menggunakan localStorage
let memoryServices: StoredServiceItem[] = [...DEFAULT_SERVICES];

/**
 * Mendapatkan daftar layanan (in-memory)
 */
export function getStoredServices(): StoredServiceItem[] {
  return memoryServices.filter((s) => !isCmsItemDeleted(s.id, s.name, undefined, s.code));
}

/**
 * Menyimpan daftar layanan ke in-memory dan memicu custom event untuk sinkronisasi antar-komponen
 */
export function saveStoredServices(services: StoredServiceItem[]): void {
  memoryServices = services;
  if (typeof window !== "undefined") {
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
  serviceData: Omit<StoredServiceItem, "id" | "lastUpdated"> & { id?: string }
): StoredServiceItem {
  const current = getStoredServices();
  const id = serviceData.id || `SRV-${Date.now().toString(36).toUpperCase()}`;

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

  adminCmsApi
    .createService({
      service_code: newService.id,
      service_name: newService.name,
      category: newService.categoryKey,
      description: newService.subtitle,
      is_active: newService.status === "Published",
    })
    .catch((err) => {
      console.warn("adminCmsApi.createService sinkronisasi:", err);
    });

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
    if (!isNaN(numericBackendId) && numericBackendId > 0 && numericBackendId < 1000) {
      adminCmsApi
        .updateService(numericBackendId, {
          service_name: updatedItem.name,
          category: updatedItem.categoryKey,
          description: updatedItem.subtitle,
          is_active: updatedItem.status === "Published",
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

  const numId = parseInt(idOrTitle.replace(/\D/g, ""), 10);
  if (!isNaN(numId) && numId > 0 && numId < 1000) {
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
