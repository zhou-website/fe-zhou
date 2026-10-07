/**
 * Storage & State Management untuk Pengaturan Status Karir & Rekrutmen Zhou Consulting
 * Memungkinkan Admin mengontrol apakah lowongan dibuka atau ditutup, serta mengubah teks pesan statis.
 */

import { ContentStatus } from "./publicContentData";
import { isCmsItemDeleted, recordDeletedCmsItem } from "./cmsDeletedStorage";

export interface JobPosition {
  id: string;
  title: string;
  department: string;
  deptKey: "all" | "tax" | "accounting" | "legal" | "business";
  type: string;
  location: string;
  experience: string;
  compensation?: string;
  summary: string;
  skills: string[];
  responsibilities?: string[];
  qualifications?: string[];
  benefits?: string[];
  status?: ContentStatus;
}

export interface CareerSettings {
  isOpen: boolean; // true = buka lowongan, false = tidak membuka lowongan
  closedTitle: string; // Judul pengumuman statis saat lowongan belum dibuka
  closedMessage: string; // Deskripsi pesan statis
  closedPeriodNote: string; // Catatan periode / estimasi pembukaan kembali
  lastUpdated: string; // Tanggal pembaruan terakhir
  positions?: JobPosition[]; // Daftar posisi lowongan aktif yang diinput admin
}

export const CAREER_SETTINGS_STORAGE_KEY = "zhou_career_settings_data_v2";
export const CAREER_SETTINGS_EVENT = "zhou_career_settings_updated";

export const DEFAULT_CAREER_SETTINGS: CareerSettings = {
  isOpen: false,
  closedTitle: "Lowongan Periode Ini Belum Dibuka",
  closedMessage:
    "Saat ini seluruh posisi di Zhou Consulting telah terisi dan belum ada lowongan baru yang dibuka untuk publik. Silakan pantau halaman ini secara berkala untuk pembaruan jadwal rekrutmen berikutnya.",
  closedPeriodNote:
    "Jadwal penerimaan periode baru akan diumumkan melalui portal resmi dan akun media sosial resmi Zhou Consulting.",
  lastUpdated: "-",
  positions: [],
};

/**
 * Membaca pengaturan karir dari localStorage (atau default jika belum ada)
 */
export function getStoredCareerSettings(): CareerSettings {
  if (typeof window === "undefined") {
    return DEFAULT_CAREER_SETTINGS;
  }

  try {
    const raw = localStorage.getItem(CAREER_SETTINGS_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_CAREER_SETTINGS;
    }
    return JSON.parse(raw) as CareerSettings;
  } catch (error) {
    console.error("Gagal membaca zhou_career_settings dari localStorage:", error);
    return DEFAULT_CAREER_SETTINGS;
  }
}

/**
 * Menyimpan pembaruan pengaturan karir ke localStorage dan memicu custom event
 */
export function saveStoredCareerSettings(settings: CareerSettings): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(
      CAREER_SETTINGS_STORAGE_KEY,
      JSON.stringify(settings)
    );
    window.dispatchEvent(new Event(CAREER_SETTINGS_EVENT));
  } catch (error) {
    console.error("Gagal menyimpan zhou_career_settings ke localStorage:", error);
  }
}

/**
 * Mengatur ulang ke nilai default
 */
export function resetStoredCareerSettings(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(CAREER_SETTINGS_STORAGE_KEY);
    window.dispatchEvent(new Event(CAREER_SETTINGS_EVENT));
  } catch (error) {
    console.error("Gagal mereset zhou_career_settings:", error);
  }
}

/**
 * Membaca posisi lowongan aktif yang disimpan
 */
export function getStoredCareerPositions(): JobPosition[] {
  const settings = getStoredCareerSettings();
  const list = settings.positions || [];
  return list.filter((pos) => !isCmsItemDeleted(pos.id, pos.title));
}

/**
 * Menambahkan posisi lowongan karir baru
 */
export function addStoredCareerPosition(position: JobPosition): JobPosition[] {
  const settings = getStoredCareerSettings();
  const currentPositions = settings.positions || [];
  const filtered = currentPositions.filter((p) => p.id !== position.id);
  const updatedPositions = [position, ...filtered];
  const shouldOpen = position.status === "Published" ? true : settings.isOpen;
  saveStoredCareerSettings({
    ...settings,
    isOpen: shouldOpen,
    positions: updatedPositions,
    lastUpdated: new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  });
  return updatedPositions;
}

/**
 * Memperbarui data posisi lowongan karir
 */
export function updateStoredCareerPosition(
  id: string,
  changes: Partial<JobPosition>
): JobPosition[] {
  const settings = getStoredCareerSettings();
  const currentPositions = settings.positions || [];
  const updatedPositions = currentPositions.map((pos) =>
    pos.id === id ? { ...pos, ...changes } : pos
  );
  const hasPublished = updatedPositions.some((p) => p.status === "Published");
  saveStoredCareerSettings({
    ...settings,
    isOpen: hasPublished ? true : settings.isOpen,
    positions: updatedPositions,
    lastUpdated: new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  });
  return updatedPositions;
}

/**
 * Menghapus posisi lowongan karir
 */
export function deleteStoredCareerPosition(idOrTitle: string): JobPosition[] {
  recordDeletedCmsItem({ id: idOrTitle, title: idOrTitle });
  const settings = getStoredCareerSettings();
  const currentPositions = settings.positions || [];
  const target = idOrTitle.trim().toLowerCase();
  const targetSlug = target.replace(/[^a-z0-9]+/g, "-");
  const updatedPositions = currentPositions.filter((pos) => {
    if (isCmsItemDeleted(pos.id, pos.title)) return false;
    const pTitle = pos.title.trim().toLowerCase();
    const pId = pos.id.trim().toLowerCase();
    return (
      pos.id !== idOrTitle &&
      pId !== target &&
      pId !== targetSlug &&
      pTitle !== target
    );
  });
  saveStoredCareerSettings({
    ...settings,
    positions: updatedPositions,
    lastUpdated: new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  });
  return updatedPositions;
}
