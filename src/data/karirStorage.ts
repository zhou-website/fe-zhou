/**
 * Storage & State Management untuk Pengaturan Status Karir & Rekrutmen Zhou Consulting
 * Data pengaturan karir disimpan langsung di database PostgreSQL melalui API Backend.
 * Frontend tidak lagi menyimpan data bisnis ke localStorage browser.
 */

import { ContentStatus } from "./publicContentData";
import { isCmsItemDeleted, recordDeletedCmsItem } from "./cmsDeletedStorage";
import { adminCmsApi, publicApi } from "@/lib/api";

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
  isOpen: true,
  closedTitle: "Lowongan Periode Ini Belum Dibuka",
  closedMessage:
    "Saat ini seluruh posisi di Zhou Consulting telah terisi dan belum ada lowongan baru yang dibuka untuk publik. Silakan pantau halaman ini secara berkala untuk pembaruan jadwal rekrutmen berikutnya.",
  closedPeriodNote:
    "Jadwal penerimaan periode baru akan diumumkan melalui portal resmi dan akun LinkedIn Zhou Consulting.",
  lastUpdated: "24 September 2026",
  positions: [],
};

// In-memory runtime cache
let memoryCareerSettings: CareerSettings = { ...DEFAULT_CAREER_SETTINGS };
let memoryCareerPositions: JobPosition[] = [];

/**
 * Membaca pengaturan karir (in-memory)
 */
export function getStoredCareerSettings(): CareerSettings {
  return { ...memoryCareerSettings };
}

/**
 * Menyimpan pembaruan pengaturan karir ke Backend Database
 */
export function saveStoredCareerSettings(settings: CareerSettings): void {
  memoryCareerSettings = { ...settings };

  // Kirimkan pembaruan konfigurasi karir langsung ke database backend
  adminCmsApi
    .updateCareerSettings({
      isOpen: settings.isOpen,
      closedTitle: settings.closedTitle,
      closedMessage: settings.closedMessage,
      closedPeriodNote: settings.closedPeriodNote,
    })
    .catch((err) => {
      console.warn("Sinkronisasi pengaturan karir ke backend:", err);
    });

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CAREER_SETTINGS_EVENT));
  }
}

/**
 * Mengatur ulang ke nilai default
 */
export function resetStoredCareerSettings(): void {
  memoryCareerSettings = { ...DEFAULT_CAREER_SETTINGS };
  adminCmsApi
    .updateCareerSettings({
      isOpen: DEFAULT_CAREER_SETTINGS.isOpen,
      closedTitle: DEFAULT_CAREER_SETTINGS.closedTitle,
      closedMessage: DEFAULT_CAREER_SETTINGS.closedMessage,
      closedPeriodNote: DEFAULT_CAREER_SETTINGS.closedPeriodNote,
    })
    .catch(() => {});

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CAREER_SETTINGS_EVENT));
  }
}

/**
 * Membaca posisi lowongan aktif yang disimpan di memori
 */
export function getStoredCareerPositions(): JobPosition[] {
  return memoryCareerPositions.filter((pos) => !isCmsItemDeleted(pos.id, pos.title));
}

/**
 * Menambahkan posisi lowongan karir baru ke memori
 */
export function addStoredCareerPosition(position: JobPosition): JobPosition[] {
  const currentPositions = memoryCareerPositions;
  const filtered = currentPositions.filter((p) => p.id !== position.id);
  const updatedPositions = [position, ...filtered];
  memoryCareerPositions = updatedPositions;

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CAREER_SETTINGS_EVENT));
  }
  return updatedPositions;
}

/**
 * Memperbarui data posisi lowongan karir di memori
 */
export function updateStoredCareerPosition(
  id: string,
  changes: Partial<JobPosition>
): JobPosition[] {
  const currentPositions = memoryCareerPositions;
  const existingIndex = currentPositions.findIndex((pos) => pos.id === id);

  let updatedPositions: JobPosition[];
  if (existingIndex !== -1) {
    updatedPositions = currentPositions.map((pos) =>
      pos.id === id ? { ...pos, ...changes } : pos
    );
  } else {
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

  memoryCareerPositions = updatedPositions;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CAREER_SETTINGS_EVENT));
  }
  return updatedPositions;
}

/**
 * Menghapus posisi lowongan karir dari memori
 */
export function deleteStoredCareerPosition(idOrTitle: string): JobPosition[] {
  recordDeletedCmsItem({ id: idOrTitle, title: idOrTitle });
  const currentPositions = memoryCareerPositions;
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

  memoryCareerPositions = updatedPositions;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CAREER_SETTINGS_EVENT));
  }
  return updatedPositions;
}

/**
 * Pelacak Pengiriman Lamaran Pelamar Kerja & Penyimpanan Lamaran Masuk
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

// In-memory application session trackers
const memorySubmittedApplications: SubmittedApplicationRecord[] = [];
let memoryStoredJobApplications: StoredJobApplication[] = [];

export function getSubmittedApplications(): SubmittedApplicationRecord[] {
  return [...memorySubmittedApplications];
}

export function getStoredJobApplications(): StoredJobApplication[] {
  return [...memoryStoredJobApplications];
}

export function hasAppliedToCareer(jobId: string | number, email: string): boolean {
  if (!email || !jobId) return false;
  const cleanEmail = email.trim().toLowerCase();
  const cleanJobId = String(jobId).trim().toLowerCase();

  return memorySubmittedApplications.some(
    (item) =>
      item.email.trim().toLowerCase() === cleanEmail &&
      String(item.jobId).trim().toLowerCase() === cleanJobId
  );
}

export function recordCareerApplication(jobId: string | number, email: string): void {
  if (!email || !jobId) return;
  const cleanEmail = email.trim().toLowerCase();
  const cleanJobId = String(jobId).trim().toLowerCase();
  if (
    !memorySubmittedApplications.some(
      (item) => item.email === cleanEmail && String(item.jobId) === cleanJobId
    )
  ) {
    memorySubmittedApplications.push({
      jobId: cleanJobId,
      email: cleanEmail,
      appliedAt: new Date().toISOString(),
    });
  }
}

export function saveStoredJobApplication(app: StoredJobApplication): void {
  const filtered = memoryStoredJobApplications.filter(
    (item) => String(item.id) !== String(app.id)
  );
  memoryStoredJobApplications = [app, ...filtered];
  recordCareerApplication(app.job_id, app.applicant_email);
  if (app.job?.position_code) {
    recordCareerApplication(app.job.position_code, app.applicant_email);
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(APPLICATIONS_UPDATED_EVENT));
  }
}

export function deleteStoredJobApplication(id: number | string): void {
  memoryStoredJobApplications = memoryStoredJobApplications.filter(
    (item) => String(item.id) !== String(id)
  );
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(APPLICATIONS_UPDATED_EVENT));
  }
}

export function clearAllStoredJobApplications(): void {
  memoryStoredJobApplications = [];
  memorySubmittedApplications.length = 0;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(APPLICATIONS_UPDATED_EVENT));
  }
}
