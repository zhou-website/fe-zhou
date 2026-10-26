/**
 * Storage & State Management untuk Modul Regulasi & Peraturan Perpajakan Zhou Consulting
 * Data regulasi dan status legal disimpan langsung di database PostgreSQL melalui API Backend.
 * Frontend tidak lagi menyimpan data regulasi ke localStorage browser.
 */

import { isCmsItemDeleted, recordDeletedCmsItem } from "./cmsDeletedStorage";
import { adminCmsApi } from "@/lib/api";

export type RegulationCategory =
  | "Regulasi Zhou"
  | "Undang-Undang"
  | "Peraturan Pemerintah"
  | "Peraturan Menteri"
  | "Peraturan DJP"
  | "Keputusan KMK";

export type RegulationLegalStatus = "Berlaku" | "Diperbarui" | "Tidak Berlaku";
export type RegulationPublicationStatus = "Published" | "Draft" | "Archived";
export type RegulationStatus = RegulationLegalStatus | RegulationPublicationStatus | "Pembaruan";

export interface RegulationLegalMeta {
  status: RegulationLegalStatus;
  replacementRef?: string;
}

export interface StoredRegulationItem {
  id: string;
  docNumber: string;
  title: string;
  category: RegulationCategory | string;
  effectiveDate: string;
  scope: string;
  fileSize: string;
  status: RegulationStatus;
  legalStatus?: RegulationLegalStatus;
  replacementRef?: string;
  downloadUrl?: string;
  fileDataUrl?: string;
  backendId?: number;
}

export const REGULATION_CATEGORIES: string[] = [
  "Semua",
  "Regulasi Zhou",
  "Undang-Undang",
  "Peraturan Pemerintah",
  "Peraturan Menteri",
  "Peraturan DJP",
  "Keputusan KMK",
];

export function mapToRegulationCategory(typeOrCategory?: string, title?: string): RegulationCategory {
  const combined = `${typeOrCategory || ""} ${title || ""}`.toLowerCase().trim();

  if (combined.includes("zhou") || combined.includes("internal") || combined.includes("sop")) {
    return "Regulasi Zhou";
  }
  if (
    combined.includes("undang-undang") ||
    combined.includes("uu ") ||
    combined.includes("uu-") ||
    combined.includes("uu no") ||
    combined === "uu" ||
    (typeOrCategory && typeOrCategory.toUpperCase() === "UU")
  ) {
    return "Undang-Undang";
  }
  if (
    combined.includes("peraturan pemerintah") ||
    combined.includes("pp ") ||
    combined.includes("pp-") ||
    combined.includes("pp no") ||
    combined === "pp" ||
    (typeOrCategory && typeOrCategory.toUpperCase() === "PP")
  ) {
    return "Peraturan Pemerintah";
  }
  if (
    combined.includes("keputusan kmk") ||
    combined.includes("keputusan menteri") ||
    combined.includes("kmk") ||
    (typeOrCategory && typeOrCategory.toUpperCase() === "KMK")
  ) {
    return "Keputusan KMK";
  }
  if (
    combined.includes("peraturan djp") ||
    combined.includes("dirjen") ||
    combined.includes("djp") ||
    combined.includes("direktur jenderal") ||
    combined.includes("perdirjen") ||
    combined.includes("per-") ||
    combined.includes("per ") ||
    combined.includes("se-") ||
    combined.includes("se ") ||
    combined.includes("surat edaran") ||
    (typeOrCategory && (typeOrCategory.toUpperCase() === "PER" || typeOrCategory.toUpperCase() === "SE"))
  ) {
    return "Peraturan DJP";
  }
  return "Peraturan Menteri";
}

export interface KmkCurrencyRate {
  currency: string;
  name: string;
  rate: string;
  change: string;
  trend: "up" | "down" | "flat";
}

export interface StoredKmkData {
  kmkNumber: string;
  period: string;
  effectiveUntil: string;
  officialDjpUrl: string;
  lastUpdated: string;
  rates: KmkCurrencyRate[];
}

export const KMK_RATES_STORAGE_KEY = "zhou_kmk_rates_data_v2";
export const KMK_RATES_EVENT = "zhou_kmk_rates_updated";

export function formatDocNumberFromTitle(title?: string, id?: string | number): string {
  if (!title) return `REG-${id || "NEW"}`;
  const trimmed = title.trim();

  const pmkMatch = trimmed.match(/pmk\s*(?:no\.?|nomor)?\s*(\d+)(?:\s*(?:tahun|th\.?|\/)?\s*(\d{4}))?/i);
  if (pmkMatch) {
    const num = pmkMatch[1];
    const yr = pmkMatch[2] || "2024";
    return `PMK No. ${num}/PMK.03/${yr}`;
  }

  const uuMatch = trimmed.match(/uu\s*(?:no\.?|nomor)?\s*(\d+)(?:\s*(?:tahun|th\.?|\/)?\s*(\d{4}))?/i);
  if (uuMatch) {
    const num = uuMatch[1];
    const yr = uuMatch[2] || "2021";
    return `UU No. ${num} Tahun ${yr}`;
  }

  const ppMatch = trimmed.match(/pp\s*(?:no\.?|nomor)?\s*(\d+)(?:\s*(?:tahun|th\.?|\/)?\s*(\d{4}))?/i);
  if (ppMatch) {
    const num = ppMatch[1];
    const yr = ppMatch[2] || "2023";
    return `PP No. ${num} Tahun ${yr}`;
  }

  const perMatch = trimmed.match(/per\s*(?:no\.?|nomor)?\s*(\d+)(?:\s*(?:tahun|th\.?|\/)?\s*(\d{4}))?/i);
  if (perMatch) {
    const num = perMatch[1];
    const yr = perMatch[2] || "2024";
    return `PER-${num}/PJ/${yr}`;
  }

  return `REG-${id || Date.now().toString().slice(-4)}`;
}

export function inferCategoryFromTitle(title?: string): string {
  if (!title) return "Peraturan Menteri";
  const lower = title.toLowerCase();

  if (lower.includes("uu ") || lower.includes("undang-undang")) return "Undang-Undang";
  if (lower.includes("pp ") || lower.includes("peraturan pemerintah")) return "Peraturan Pemerintah";
  if (lower.includes("pmk") || lower.includes("menteri keuangan")) return "Peraturan Menteri";
  if (lower.includes("per-") || lower.includes("dirjen") || lower.includes("direktur jenderal")) return "Peraturan Dirjen";
  if (lower.includes("surat edaran") || lower.includes("se-")) return "Surat Edaran";

  return "Peraturan Menteri";
}

export const DEFAULT_REGULATIONS: StoredRegulationItem[] = [];

export const REGULATIONS_STORAGE_KEY = "zhou_regulations_data_v2";
export const REGULATIONS_EVENT = "zhou_regulations_updated";

// In-memory runtime state, tanpa localStorage
let memoryRegulations: StoredRegulationItem[] = [];
const memoryRegulationLegalMeta: Record<string, RegulationLegalMeta> = {};

/**
 * Mendapatkan daftar regulasi (in-memory)
 */
export function getStoredRegulations(): StoredRegulationItem[] {
  return memoryRegulations.filter((item) => !isCmsItemDeleted(item.id, item.title, undefined, item.docNumber));
}

/**
 * Menyimpan daftar regulasi (in-memory) dan memancarkan event pembaruan
 */
export function saveStoredRegulations(regulations: StoredRegulationItem[]): void {
  memoryRegulations = regulations;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(REGULATIONS_EVENT, { detail: regulations }));
  }
}

/**
 * Menambahkan regulasi / dokumen peraturan baru (CREATE)
 */
export function addRegulation(
  item: Omit<StoredRegulationItem, "id"> & { id?: string }
): StoredRegulationItem {
  const current = getStoredRegulations();
  const idPrefix = item.category === "Regulasi Zhou" ? "ZHOU-REG" : "REG";
  const newId = item.id || `${idPrefix}-${Date.now().toString().slice(-4)}`;

  const newRegulation: StoredRegulationItem = {
    ...item,
    id: newId,
    status: item.status || "Berlaku",
  };

  const updated = [newRegulation, ...current];
  saveStoredRegulations(updated);
  return newRegulation;
}

/**
 * Memperbarui regulasi / dokumen peraturan (UPDATE)
 */
export function updateRegulation(
  id: string,
  changes: Partial<StoredRegulationItem>
): StoredRegulationItem[] {
  const current = getStoredRegulations();
  const existingIndex = current.findIndex((item) => item.id === id);

  if (existingIndex !== -1) {
    const updated = current.map((item) => {
      if (item.id === id) {
        return { ...item, ...changes };
      }
      return item;
    });
    saveStoredRegulations(updated);
    return updated;
  } else {
    const upserted: StoredRegulationItem = {
      id,
      docNumber: changes.docNumber || id,
      title: changes.title || id,
      category: changes.category || "Peraturan Menteri",
      effectiveDate: changes.effectiveDate || new Date().toLocaleDateString("id-ID"),
      scope: changes.scope || "",
      fileSize: changes.fileSize || "PDF",
      status: changes.status || "Published",
      downloadUrl: changes.downloadUrl,
      ...changes,
    };
    const updated = [upserted, ...current];
    saveStoredRegulations(updated);
    return updated;
  }
}

/**
 * Menghapus regulasi / dokumen peraturan (DELETE)
 */
export function deleteRegulation(idOrTitle: string): StoredRegulationItem[] {
  recordDeletedCmsItem({ id: idOrTitle, title: idOrTitle });
  const current = getStoredRegulations();
  const target = idOrTitle.trim().toLowerCase();
  const targetSlug = target.replace(/[^a-z0-9]+/g, "-");
  const updated = current.filter((item) => {
    if (isCmsItemDeleted(item.id, item.title, undefined, item.docNumber)) return false;
    const rTitle = item.title.trim().toLowerCase();
    const rId = item.id.trim().toLowerCase();
    const rDoc = item.docNumber.trim().toLowerCase();
    return (
      item.id !== idOrTitle &&
      rId !== target &&
      rId !== targetSlug &&
      rTitle !== target &&
      rDoc !== target
    );
  });
  saveStoredRegulations(updated);
  return updated;
}

/**
 * Toggle status antara Berlaku dan Pembaruan
 */
export function toggleRegulationStatus(id: string): StoredRegulationItem[] {
  const current = getStoredRegulations();
  const updated = current.map((item) => {
    if (item.id === id) {
      const nextStatus: RegulationStatus = item.status === "Berlaku" ? "Pembaruan" : "Berlaku";
      return { ...item, status: nextStatus };
    }
    return item;
  });
  saveStoredRegulations(updated);
  return updated;
}

export const DEFAULT_KMK_RATES: KmkCurrencyRate[] = [
  { currency: "USD", name: "Dolar Amerika Serikat", rate: "Rp 15.684,00", change: "+42,00", trend: "up" },
  { currency: "EUR", name: "Euro", rate: "Rp 17.152,45", change: "-18,30", trend: "down" },
  { currency: "SGD", name: "Dolar Singapura", rate: "Rp 12.045,80", change: "+12,50", trend: "up" },
  { currency: "JPY", name: "Yen Jepang (100)", rate: "Rp 10.520,00", change: "-35,00", trend: "down" },
  { currency: "CNY", name: "Yuan Tiongkok", rate: "Rp 2.215,60", change: "+3,40", trend: "up" },
  { currency: "AUD", name: "Dolar Australia", rate: "Rp 10.435,20", change: "-15,80", trend: "down" },
  { currency: "GBP", name: "Poundsterling Inggris", rate: "Rp 20.480,10", change: "+65,00", trend: "up" },
  { currency: "HKD", name: "Dolar Hong Kong", rate: "Rp 2.018,40", change: "+5,20", trend: "up" },
  { currency: "MYR", name: "Ringgit Malaysia", rate: "Rp 3.654,00", change: "+8,10", trend: "up" },
  { currency: "KRW", name: "Won Korea", rate: "Rp 13,23", change: "+0,14", trend: "up" },
];

export const DEFAULT_KMK_DATA: StoredKmkData = {
  kmkNumber: "KMK Nomor 48/MK/EF.2/2026",
  period: "07 Oktober 2026 - 13 Oktober 2026",
  effectiveUntil: "Terupdate Berkala Otomatis (Mingguan)",
  officialDjpUrl: "https://fiskal.kemenkeu.go.id/informasi-publik/kurs-pajak",
  lastUpdated: "Resmi Kementerian Keuangan / DJP",
  rates: DEFAULT_KMK_RATES,
};

let memoryKmkData: StoredKmkData = { ...DEFAULT_KMK_DATA };

export function getStoredKmkRates(): StoredKmkData {
  return { ...memoryKmkData };
}

export function saveStoredKmkRates(data: StoredKmkData): void {
  memoryKmkData = { ...data };
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(KMK_RATES_EVENT));
  }
}

/**
 * Sinkronisasi otomatis dari endpoint DJP resmi (/api/kurs-pajak)
 */
export async function syncKmkRatesFromDjp(): Promise<StoredKmkData> {
  try {
    const res = await fetch("/api/kurs-pajak");
    if (!res.ok) throw new Error("Gagal mengambil data dari /api/kurs-pajak");
    const json = await res.json();

    if (json?.rates && Array.isArray(json.rates) && json.rates.length > 0) {
      const liveData: StoredKmkData = {
        kmkNumber: json.kmkNumber || DEFAULT_KMK_DATA.kmkNumber,
        period: json.period || DEFAULT_KMK_DATA.period,
        effectiveUntil: json.effectiveUntil || DEFAULT_KMK_DATA.effectiveUntil,
        officialDjpUrl: json.officialDjpUrl || DEFAULT_KMK_DATA.officialDjpUrl,
        lastUpdated: json.lastUpdated || new Date().toISOString(),
        rates: json.rates,
      };
      saveStoredKmkRates(liveData);
      return liveData;
    }
  } catch (err) {
    console.warn("syncKmkRatesFromDjp fallback:", err);
  }

  return getStoredKmkRates();
}

export const REGULATION_LEGAL_STATUS_KEY = "zhou_regulations_legal_status_v1";
export const REGULATION_LEGAL_META_KEY = "zhou_regulations_legal_meta_v2";

export function getStoredRegulationLegalMeta(): Record<string, RegulationLegalMeta> {
  return { ...memoryRegulationLegalMeta };
}

export function getStoredRegulationLegalStatus(): Record<string, RegulationLegalStatus> {
  const metaMap = getStoredRegulationLegalMeta();
  const statusMap: Record<string, RegulationLegalStatus> = {};
  Object.entries(metaMap).forEach(([k, v]) => {
    statusMap[k] = v.status;
  });
  return statusMap;
}

export function setStoredRegulationLegalStatus(
  idOrTitle: string,
  status: RegulationLegalStatus | "Pembaruan",
  replacementRef?: string,
  backendId?: number
): void {
  const normalizedStatus: RegulationLegalStatus =
    status === "Pembaruan" || status === "Diperbarui"
      ? "Diperbarui"
      : status === "Tidak Berlaku"
      ? "Tidak Berlaku"
      : "Berlaku";

  const cleanRef = replacementRef ? replacementRef.trim() : "";
  const meta: RegulationLegalMeta = {
    status: normalizedStatus,
    replacementRef: cleanRef || undefined,
  };

  const keyLower = idOrTitle.trim().toLowerCase();
  memoryRegulationLegalMeta[keyLower] = meta;
  memoryRegulationLegalMeta[idOrTitle] = meta;

  // Jika ada backendId, perbarui juga ke database backend via adminCmsApi
  if (backendId) {
    adminCmsApi
      .updateRegulation(backendId, {
        legal_status: normalizedStatus,
        replacement_ref: cleanRef || undefined,
      })
      .catch((err) => {
        console.warn("Gagal update status regulasi ke backend:", err);
      });
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(REGULATIONS_EVENT));
  }
}
