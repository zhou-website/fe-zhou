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
  backendId?: number;
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
  "isOpen": true,
  "closedTitle": "Lowongan Periode Ini Belum Dibuka",
  "closedMessage": "Saat ini seluruh posisi di Zhou Consulting telah terisi dan belum ada lowongan baru yang dibuka untuk publik. Silakan pantau halaman ini secara berkala untuk pembaruan jadwal rekrutmen berikutnya.",
  "closedPeriodNote": "Jadwal penerimaan periode baru akan diumumkan melalui portal resmi dan akun LinkedIn Zhou Consulting.",
  "lastUpdated": "24 September 2026"
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
 * Memperbarui data posisi lowongan karir.
 * Jika tidak ditemukan, upsert agar edit lowongan dari backend juga tersimpan lokal.
 */
export function updateStoredCareerPosition(
  id: string,
  changes: Partial<JobPosition>
): JobPosition[] {
  const settings = getStoredCareerSettings();
  const currentPositions = settings.positions || [];
  const existingIndex = currentPositions.findIndex((pos) => pos.id === id);

  let updatedPositions: JobPosition[];
  if (existingIndex !== -1) {
    updatedPositions = currentPositions.map((pos) =>
      pos.id === id ? { ...pos, ...changes } : pos
    );
  } else {
    // Upsert: backend item not in local, create entry
    const upserted: JobPosition = {
      id,
      title: changes.title || id,
      department: changes.department || "Tax Service Core",
      deptKey: changes.deptKey || "tax",
      type: changes.type || "Senior Associate",
      location: changes.location || "Jakarta",
      experience: changes.experience || "Min. 1-3 tahun",
      summary: changes.summary || "",
      skills: changes.skills || [],
      status: changes.status || "Published",
      ...changes,
    };
    updatedPositions = [upserted, ...currentPositions];
  }

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

/**
 * Pelacak Pengiriman Lamaran Pelamar Kerja & Penyimpanan Lamaran Masuk
 * Memastikan satu email hanya dapat melamar satu kali pada lowongan yang sama.
 */
export interface SubmittedApplicationRecord {
  jobId: string | number;
  email: string;
  appliedAt: string;
}

export interface StoredJobApplication {
  id: number | string;
  job_id: number | string;
  career_id?: number | string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone?: string;
  education?: string;
  linkedin?: string;
  cover_letter?: string;
  cv_file_path: string;
  cv_file_name?: string;
  applied_at: string;
  registration_code?: string;
  status?: string;
  job?: {
    position_code: string;
    position_title: string;
    department?: string;
  };
}

export const APPLICATIONS_TRACKER_STORAGE_KEY = "zhou_submitted_applications";
export const STORED_APPLICATIONS_STORAGE_KEY = "zhou_stored_job_applications_v1";
export const APPLICATIONS_UPDATED_EVENT = "zhou_applications_updated";

export function getSubmittedApplications(): SubmittedApplicationRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(APPLICATIONS_TRACKER_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getStoredJobApplications(): StoredJobApplication[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORED_APPLICATIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function hasAppliedToCareer(jobId: string | number, email: string): boolean {
  if (!email || !jobId) return false;
  const cleanEmail = email.trim().toLowerCase();
  const cleanJobId = String(jobId).trim().toLowerCase();

  // 1. Periksa tracker log
  const list = getSubmittedApplications();
  const isMatchInTracker = list.some(
    (item) =>
      item.email.trim().toLowerCase() === cleanEmail &&
      String(item.jobId).trim().toLowerCase() === cleanJobId
  );
  if (isMatchInTracker) return true;

  // 2. Periksa daftar lamaran tersimpan
  const apps = getStoredJobApplications();
  return apps.some((app) => {
    const appEmail = (app.applicant_email || "").trim().toLowerCase();
    if (appEmail !== cleanEmail) return false;

    const appId = String(app.job_id || app.career_id || "").trim().toLowerCase();
    const appCode = String(app.job?.position_code || "").trim().toLowerCase();
    const appTitle = String(app.job?.position_title || "").trim().toLowerCase();

    return (
      appId === cleanJobId ||
      appCode === cleanJobId ||
      appTitle === cleanJobId
    );
  });
}

export function recordCareerApplication(jobId: string | number, email: string): void {
  if (typeof window === "undefined" || !email || !jobId) return;
  try {
    const list = getSubmittedApplications();
    const cleanEmail = email.trim().toLowerCase();
    const cleanJobId = String(jobId).trim().toLowerCase();
    if (!list.some((item) => item.email === cleanEmail && String(item.jobId) === cleanJobId)) {
      list.push({
        jobId: cleanJobId,
        email: cleanEmail,
        appliedAt: new Date().toISOString(),
      });
      localStorage.setItem(APPLICATIONS_TRACKER_STORAGE_KEY, JSON.stringify(list));
    }
  } catch (err) {
    console.error("Gagal menyimpan rekam lamaran:", err);
  }
}

export function saveStoredJobApplication(app: StoredJobApplication): void {
  if (typeof window === "undefined") return;
  try {
    const list = getStoredJobApplications();
    // Cegah duplikasi ID
    const filtered = list.filter((item) => String(item.id) !== String(app.id));
    const updated = [app, ...filtered];
    localStorage.setItem(STORED_APPLICATIONS_STORAGE_KEY, JSON.stringify(updated));

    // Catat juga ke tracker
    recordCareerApplication(app.job_id, app.applicant_email);
    if (app.job?.position_code) {
      recordCareerApplication(app.job.position_code, app.applicant_email);
    }

    window.dispatchEvent(new Event(APPLICATIONS_UPDATED_EVENT));
  } catch (err) {
    console.error("Gagal menyimpan data lamaran masuk:", err);
  }
}

export function deleteStoredJobApplication(id: number | string): void {
  if (typeof window === "undefined") return;
  try {
    const list = getStoredJobApplications();
    const updated = list.filter((item) => String(item.id) !== String(id));
    localStorage.setItem(STORED_APPLICATIONS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event(APPLICATIONS_UPDATED_EVENT));
  } catch (err) {
    console.error("Gagal menghapus data lamaran masuk:", err);
  }
}

export function clearAllStoredJobApplications(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORED_APPLICATIONS_STORAGE_KEY);
    localStorage.removeItem(APPLICATIONS_TRACKER_STORAGE_KEY);
    window.dispatchEvent(new Event(APPLICATIONS_UPDATED_EVENT));
  } catch (err) {
    console.error("Gagal membersihkan data lamaran masuk:", err);
  }
}


