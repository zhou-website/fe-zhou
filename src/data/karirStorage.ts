/**
 * Storage & State Management untuk Pengaturan Status Karir & Rekrutmen Zhou Consulting
 * Memungkinkan Admin mengontrol apakah lowongan dibuka atau ditutup, serta mengubah teks pesan statis.
 */

export interface CareerSettings {
  isOpen: boolean; // true = buka lowongan, false = tidak membuka lowongan
  closedTitle: string; // Judul pengumuman statis saat lowongan belum dibuka
  closedMessage: string; // Deskripsi pesan statis
  closedPeriodNote: string; // Catatan periode / estimasi pembukaan kembali
  lastUpdated: string; // Tanggal pembaruan terakhir
}

export const CAREER_SETTINGS_STORAGE_KEY = "zhou_career_settings_data";
export const CAREER_SETTINGS_EVENT = "zhou_career_settings_updated";

export const DEFAULT_CAREER_SETTINGS: CareerSettings = {
  isOpen: true,
  closedTitle: "Lowongan Periode Ini Belum Dibuka",
  closedMessage:
    "Saat ini seluruh posisi di Zhou Consulting telah terisi dan belum ada lowongan baru yang dibuka untuk publik. Silakan pantau halaman ini secara berkala untuk pembaruan jadwal rekrutmen berikutnya.",
  closedPeriodNote:
    "Jadwal penerimaan periode baru akan diumumkan melalui portal resmi dan akun LinkedIn Zhou Consulting.",
  lastUpdated: "24 September 2026",
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
      localStorage.setItem(
        CAREER_SETTINGS_STORAGE_KEY,
        JSON.stringify(DEFAULT_CAREER_SETTINGS)
      );
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
    localStorage.setItem(
      CAREER_SETTINGS_STORAGE_KEY,
      JSON.stringify(DEFAULT_CAREER_SETTINGS)
    );
    window.dispatchEvent(new Event(CAREER_SETTINGS_EVENT));
  } catch (error) {
    console.error("Gagal mereset zhou_career_settings:", error);
  }
}
