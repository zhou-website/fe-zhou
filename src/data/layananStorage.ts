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
    id: "SRV-LAW-CTR",
    code: "LAW-CTR",
    categoryKey: "hukum",
    name: "Drafting & Review Kontrak Komersial",
    subtitle: "Penyusunan dan penelaahan perjanjian kerjasama, NDA, MoU, perjanjian pemegang saham, dan kontrak vendor.",
    badge: "KONTRAK & PERJANJIAN BISNIS",
    route: "/layanan/hukum",
    scopes: [
      "Penyusunan klausul mitigasi risiko sengketa perdata & force majeure",
      "Klausul ganti rugi (indemnification), batasan tanggung jawab, & dispute settlement",
      "Review kepatuhan terhadap Kitab Undang-Undang Hukum Perdata (KUHPerdata)",
      "Penyelarasan hak kekayaan intelektual (HAKI) dan kerahasiaan data komersial",
    ],
    deliverable: "Final Draft Kontrak Bahasa Indonesia / Bilingual & Legal Opinion Ringkas.",
    pillars: [
      {
        title: "Drafting Kontrak Komersial",
        description: "Penyusunan perjanjian kerjasama, NDA, MoU, dan kontrak bisnis dengan mitigasi risiko hukum.",
      },
    ],
    status: "Published",
    lastUpdated: "Oktober 2026",
    topicParam: "kontrak-komersial",
    waTemplate: "Halo Zhou Consulting, saya ingin konsultasi mengenai pembuatan dan penelaahan Kontrak Bisnis / Komersial.",
  },
  {
    id: "SRV-LAW-OSS",
    code: "LAW-OSS",
    categoryKey: "hukum",
    name: "Perizinan Usaha Berbasis Risiko OSS-RBA",
    subtitle: "Pendampingan penerbitan NIB, Sertifikat Standar, dan izin operasional komersial melalui sistem OSS terintegrasi.",
    badge: "PERIZINAN BERUSAHA & KBLI",
    route: "/layanan/hukum",
    scopes: [
      "Pemetaan Klasifikasi Baku Lapangan Usaha Indonesia (KBLI) 2020 yang tepat",
      "Penerbitan Nomor Induk Berusaha (NIB) dan pemenuhan persyaratan komitmen",
      "Pengurusan Kesesuaian Kegiatan Pemanfaatan Ruang (KKPR) dan Persetujuan Lingkungan",
      "Migrasi data profil perizinan dan updating penanggung jawab usaha",
    ],
    deliverable: "NIB Terverifikasi, Sertifikat Standar / Izin Operasional Resmi OSS.",
    pillars: [
      {
        title: "Perizinan OSS-RBA",
        description: "Penerbitan NIB, Sertifikat Standar, dan pemenuhan komitmen izin berusaha terintegrasi.",
      },
    ],
    status: "Published",
    lastUpdated: "Oktober 2026",
    topicParam: "perizinan-oss",
    waTemplate: "Halo Zhou Consulting, saya ingin konsultasi mengenai perizinan usaha OSS-RBA dan penyesuaian KBLI perusahaan.",
  },
  {
    id: "SRV-LAW-CORP",
    code: "LAW-CORP",
    categoryKey: "hukum",
    name: "Restrukturisasi Legalitas & Anggaran Dasar PT",
    subtitle: "Penyesuaian anggaran dasar, peralihan saham, perubahan susunan direksi/komisaris, dan penerbitan akta notaris Kemenkumham.",
    badge: "HUKUM PERSEROAN TERBATAS",
    route: "/layanan/hukum",
    scopes: [
      "Penyelenggaraan Rapat Umum Pemegang Saham (RUPS) fisik maupun sirkuler",
      "Penyusunan risalah RUPS untuk peningkatan modal disetor dan jual beli saham",
      "Pendampingan penerbitan Surat Keputusan (SK) Pengesahan AHU Kemenkumham",
      "Due diligence legalitas perizinan perseroan dan kelengkapan dokumen pendirian",
    ],
    deliverable: "Risalah RUPS Resmi, Akta Notaris Perubahan, & SK AHU Kemenkumham.",
    pillars: [
      {
        title: "Hukum Perseroan Terbatas",
        description: "Penyesuaian anggaran dasar PT, RUPS, perubahan susunan pengurus, dan legalitas notaris.",
      },
    ],
    status: "Published",
    lastUpdated: "Oktober 2026",
    topicParam: "restrukturisasi-pt",
    waTemplate: "Halo Zhou Consulting, saya ingin konsultasi mengenai perubahan anggaran dasar PT, RUPS, dan legalitas perseroan.",
  },
  {
    id: "SRV-LEGAL-TAX",
    code: "LEGAL_TAX",
    categoryKey: "hukum",
    name: "Legal & Tax Dispute Advisory",
    subtitle: "Pendampingan pemeriksaan pajak, klarifikasi SP2DK, pengajuan keberatan, dan mitigasi risiko regulasi.",
    badge: "ADVOKASI & SENGKETA HUKUM",
    route: "/layanan/hukum",
    scopes: [
      "Pendampingan Pemeriksaan Pajak (Audit Assistance)",
      "Penyusunan Tanggapan Resmi Surat Klarifikasi SP2DK",
      "Pengajuan Permohonan Keberatan Pajak",
      "Advokasi & Banding di Pengadilan Pajak",
    ],
    deliverable: "Risalah Tanggapan Hukum & SPHP, Surat Keberatan / Memori Banding, & Legal Opinion Resmi.",
    pillars: [
      {
        title: "Pendampingan Pemeriksaan Pajak (Audit Assistance)",
        description: "Pendampingan Pemeriksaan Pajak (Audit Assistance)",
      },
    ],
    status: "Published",
    lastUpdated: "Oktober 2026",
    topicParam: "sengketa-hukum-pajak",
    waTemplate: "Halo Zhou Consulting, saya ingin konsultasi mengenai Legal & Tax Dispute Advisory dan pendampingan sengketa hukum.",
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
