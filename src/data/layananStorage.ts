"use client";

import { ContentStatus } from "./publicContentData";

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

// Default kosong agar murni dinamis menunggu input dari admin
export const DEFAULT_SERVICES: StoredServiceItem[] = [];

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
    if (!raw) {
      return DEFAULT_SERVICES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
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
  const index = current.findIndex((s) => s.id === id);

  if (index === -1) return null;

  const today = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const updatedItem: StoredServiceItem = {
    ...current[index],
    ...updates,
    lastUpdated: today,
  };

  const updatedList = [...current];
  updatedList[index] = updatedItem;

  saveStoredServices(updatedList);
  return updatedItem;
}

/**
 * Menghapus layanan (DELETE)
 */
export function deleteStoredService(id: string): boolean {
  const current = getStoredServices();
  const filtered = current.filter((s) => s.id !== id);

  if (filtered.length === current.length) return false;

  saveStoredServices(filtered);
  return true;
}

/**
 * Reset data layanan ke default (kosong)
 */
export function resetServicesToDefault(): void {
  saveStoredServices(DEFAULT_SERVICES);
}
