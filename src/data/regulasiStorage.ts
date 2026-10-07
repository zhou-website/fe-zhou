"use client";

import { isCmsItemDeleted, recordDeletedCmsItem } from "./cmsDeletedStorage";

export type RegulationCategory =
  | "Regulasi Zhou"
  | "Undang-Undang"
  | "Peraturan Pemerintah"
  | "Peraturan Menteri"
  | "Peraturan DJP"
  | "Keputusan KMK";

export type RegulationStatus = "Berlaku" | "Pembaruan" | "Draft" | "Published";

export interface StoredRegulationItem {
  id: string;
  docNumber: string;
  title: string;
  category: RegulationCategory;
  effectiveDate: string;
  scope: string;
  fileSize: string;
  status: RegulationStatus;
  downloadUrl?: string;
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

export const DEFAULT_REGULATIONS: StoredRegulationItem[] = [];

export const REGULATIONS_STORAGE_KEY = "zhou_regulations_data_v2";
export const REGULATIONS_EVENT = "zhou_regulations_updated";

/**
 * Mendapatkan daftar regulasi dari localStorage (atau default jika belum ada)
 */
export function getStoredRegulations(): StoredRegulationItem[] {
  if (typeof window === "undefined") {
    return DEFAULT_REGULATIONS;
  }

  try {
    const raw = localStorage.getItem(REGULATIONS_STORAGE_KEY);
    const source: StoredRegulationItem[] = raw ? JSON.parse(raw) : DEFAULT_REGULATIONS;
    if (Array.isArray(source)) {
      return source.filter((item) => !isCmsItemDeleted(item.id, item.title, undefined, item.docNumber));
    }
    return DEFAULT_REGULATIONS.filter((item) => !isCmsItemDeleted(item.id, item.title, undefined, item.docNumber));
  } catch (error) {
    console.error("Gagal membaca zhou_regulations_data dari localStorage:", error);
    return DEFAULT_REGULATIONS.filter((item) => !isCmsItemDeleted(item.id, item.title, undefined, item.docNumber));
  }
}

/**
 * Menyimpan daftar regulasi ke localStorage dan memancarkan event pembaruan
 */
export function saveStoredRegulations(regulations: StoredRegulationItem[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(REGULATIONS_STORAGE_KEY, JSON.stringify(regulations));
    window.dispatchEvent(new CustomEvent(REGULATIONS_EVENT, { detail: regulations }));
  } catch (error) {
    console.error("Gagal menyimpan zhou_regulations_data ke localStorage:", error);
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
  const updated = current.map((item) => {
    if (item.id === id) {
      return {
        ...item,
        ...changes,
      };
    }
    return item;
  });

  saveStoredRegulations(updated);
  return updated;
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

/**
 * Mengembalikan regulasi ke daftar default
 */
export function resetRegulationsToDefault(): StoredRegulationItem[] {
  saveStoredRegulations(DEFAULT_REGULATIONS);
  return DEFAULT_REGULATIONS;
}

export const KMK_RATES_STORAGE_KEY = "zhou_kmk_rates_v2";
export const KMK_RATES_EVENT = "zhou_kmk_rates_updated";

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

export const DEFAULT_KMK_DATA: StoredKmkData = {
  kmkNumber: "-",
  period: "-",
  effectiveUntil: "-",
  officialDjpUrl: "https://fiskal.kemenkeu.go.id/informasi-publik/kurs-pajak",
  lastUpdated: "-",
  rates: [],
};

export function getStoredKmkRates(): StoredKmkData {
  if (typeof window === "undefined") {
    return DEFAULT_KMK_DATA;
  }
  try {
    const raw = localStorage.getItem(KMK_RATES_STORAGE_KEY);
    if (!raw) return DEFAULT_KMK_DATA;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_KMK_DATA;
  }
}

export function saveStoredKmkRates(data: StoredKmkData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KMK_RATES_STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event(KMK_RATES_EVENT));
  } catch (err) {
    console.error("Gagal menyimpan kurs KMK:", err);
  }
}

