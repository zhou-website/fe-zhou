import { ConsultationItem, adminApi } from "@/lib/api";
import { savePersistentFileBlob, getPersistentFileBlob } from "@/lib/fileStorageDB";

export type ConsultationStatus =
  | "Menunggu Penugasan"
  | "Ditugaskan"
  | "Dalam Proses"
  | "Menunggu Klien"
  | "Selesai"
  | "Dibatalkan";

export interface Milestone {
  taskId?: number;
  step: string;
  title: string;
  status: "completed" | "in_progress" | "pending";
  date: string;
  description: string;
}

export interface Deliverable {
  id: string;
  numericId?: number;
  name: string;
  type: string;
  size: string;
  date: string;
  status: string;
  downloadUrl?: string;
}

export interface Correspondence {
  id: string;
  sender: string;
  role: string;
  date: string;
  message: string;
}

export interface ClientUploadedFile {
  id?: string;
  numericId?: number;
  name: string;
  size: string;
  type: string;
  uploadedAt?: string;
  date?: string;
  uploadedBy?: string;
  description?: string;
  status?: "Diterima PIC" | "Sedang Ditelaah" | "Terverifikasi" | string;
  downloadUrl?: string;
}

export interface StaffAdminProfile {
  id: string;
  numericId?: number;
  name: string;
  email: string;
  nip?: string;
  phone?: string;
  role: "admin" | "superadmin";
  divisions: string[]; // Mendukung penanganan lebih dari satu divisi layanan
  isActive: boolean;
}

export interface ClientTicket {
  id: string;
  numericId?: number;
  title: string;
  category: "Tax Service Core" | "Accounting Service" | "Legal Compliance" | "Business Advisory" | string;
  priority?: "Normal" | "Tinggi" | "Mendesak";
  description?: string;
  status: ConsultationStatus;
  progress: number;
  createdAt: string;
  estimatedCompletion: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  clientCompany?: string;
  clientDocuments?: ClientUploadedFile[];

  // Data Penugasan oleh Superadmin
  assignedAdminId?: string;
  assignedAdminName?: string;
  assignedAdminEmail?: string;
  assignedAdminDivision?: string;
  assignedAt?: string;
  assignmentNotes?: string;
  previousAdminName?: string;
  previousAdminEmail?: string;
  previousAdminDivision?: string;
  reassignedAt?: string;
  consultant: string; // Teks penanggung jawab / konsultan (misal: "Linda David, S.Ak., BKP" atau "Menunggu PIC")

  milestones: Milestone[];
  deliverables: Deliverable[];
  correspondences: Correspondence[];

  // Arsip Status
  isArchived?: boolean;
  archivedAt?: string;
}

export interface AdminUploadedDocument {
  id: string;
  ticketId: string;
  clientName: string;
  clientNpwp: string;
  clientEmail?: string;
  clientId?: string;
  fileName: string;
  fileSize: string;
  fileType: "PDF" | "XLSX" | "DOC" | "ZIP" | string;
  category: "Tax Service Core" | "Accounting Service" | "Business Financial Consulting" | "Legal";
  invoiceNumber: string;
  amount: string;
  billingStatus: "Lunas" | "Menunggu Verifikasi" | "Terkirim";
  uploadDate: string;
  consultant: string;
  sha256: string;
  downloadUrl?: string;
}

export const TICKETS_STORAGE_KEY = "zhou_client_custom_tickets";
export const DOCUMENTS_STORAGE_KEY = "zhou_shared_documents";
export const STAFF_ADMINS_STORAGE_KEY = "zhou_staff_admins_roster";

export const TICKETS_UPDATED_EVENT = "zhou_tickets_updated";
export const DOCUMENTS_UPDATED_EVENT = "zhou_documents_updated";
export const STAFF_UPDATED_EVENT = "zhou_staff_updated";

/**
 * Daftar default tim Admin/PIC Zhou Consulting dengan pemetaan divisi layanan
 */
export const DEFAULT_STAFF_ADMINS: StaffAdminProfile[] = [];

/**
 * Normalisasi status lama menjadi alur status resmi
 */
export function normalizeConsultationStatus(rawStatus?: string, assignedName?: string): ConsultationStatus {
  if (!rawStatus) return assignedName ? "Ditugaskan" : "Menunggu Penugasan";
  const s = rawStatus.trim().toLowerCase();
  if (s.includes("menunggu penugasan") || s === "pending") {
    return assignedName ? "Ditugaskan" : "Menunggu Penugasan";
  }
  if (s.includes("ditugaskan")) return "Ditugaskan";
  if (s.includes("proses") || s === "in progress" || s === "in_progress") return "Dalam Proses";
  if (s.includes("klien") || s.includes("waiting client")) return "Menunggu Klien";
  if (s.includes("selesai") || s === "completed") return "Selesai";
  if (s.includes("batal") || s === "cancelled") return "Dibatalkan";
  return assignedName ? "Ditugaskan" : "Menunggu Penugasan";
}

let memoryStaffAdmins: StaffAdminProfile[] = [];

/**
 * Membaca daftar staff admin dan divisi spesialisasi (in-memory)
 */
export function getStoredStaffAdmins(): StaffAdminProfile[] {
  return [...memoryStaffAdmins];
}

/**
 * Menyimpan pembaruan staff admin (in-memory)
 */
export function saveStoredStaffAdmins(staff: StaffAdminProfile[]): void {
  memoryStaffAdmins = staff;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(STAFF_UPDATED_EVENT));
  }
}

function isDummyTicketRecord(t: { id?: string | number; title?: string }): boolean {
  const code = String(t.id || "").toLowerCase();
  const title = String(t.title || "").toLowerCase();
  return (
    code.includes("prj-tax-2026-001") ||
    (code === "1" && title.includes("spt tahunan badan pt maju")) ||
    (code === "tk-1" && title.includes("spt tahunan badan pt maju")) ||
    title.includes("spt tahunan badan pt maju") ||
    title.includes("pt maju makmur")
  );
}

function isDummyDocumentRecord(d: { fileName?: string; ticketId?: string }): boolean {
  const name = String(d.fileName || "").toLowerCase();
  const pid = String(d.ticketId || "").toLowerCase();
  return (
    name.includes("dummy") ||
    name.includes("mock") ||
    name.includes("spt_tahunan_badan_2025_final") ||
    name.includes("test") ||
    pid === "1" ||
    pid === "proj-1" ||
    pid.includes("prj-tax-2026-001")
  );
}

/**
 * Format tanggal pengajuan konsultasi menjadi format standar DD/MM/YYYY (contoh: 15/10/2026)
 */
export function formatConsultationDate(rawDate?: string): string {
  if (!rawDate || rawDate.trim() === "" || rawDate.toLowerCase() === "hari ini") {
    const now = new Date();
    const d = String(now.getDate()).padStart(2, "0");
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const y = now.getFullYear();
    return `${d}/${m}/${y}`;
  }

  // Jika sudah berformat DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(rawDate.trim())) {
    return rawDate.trim();
  }

  // Jika berupa tanggal ISO atau format lainnya (misal: "2026-10-15")
  const parsed = new Date(rawDate);
  if (!isNaN(parsed.getTime())) {
    const d = String(parsed.getDate()).padStart(2, "0");
    const m = String(parsed.getMonth() + 1).padStart(2, "0");
    const y = parsed.getFullYear();
    return `${d}/${m}/${y}`;
  }

  return rawDate;
}

/**
 * Mengekstrak uraian detail masalah klien yang bersih.
 * Jika deskripsi berasal dari eskalasi bot otomatis (misal mengandung 'Pesan Klien: ...'),
 * ambil isi pesan klien tersebut agar tampil bersih, jelas, dan informatif.
 * Otomatis memisahkan catatan tim konsultan yang mungkin disematkan di bagian bawah.
 */
export function formatTicketDescription(desc?: string): string {
  if (!desc || !desc.trim()) return "";
  let clientText = desc;
  const splitIdx = clientText.search(/(?:\r?\n\r?\n?|\s*)\[(?:CATATAN|TANGGAPAN|INSTRUKSI)\s*(?:KONSULTAN|PENUGASAN|SUPERADMIN)?/i);
  if (splitIdx !== -1) {
    clientText = clientText.substring(0, splitIdx);
  }
  const clientMatch = clientText.match(/Pesan Klien:\s*([\s\S]+)$/i);
  if (clientMatch && clientMatch[1]?.trim()) {
    return clientMatch[1].trim();
  }
  return clientText.trim();
}

/**
 * Mengekstrak semua catatan instruksi penugasan khusus Superadmin dari deskripsi tiket jika ada
 */
export function extractAllAssignmentNotesFromDescription(desc?: string): string[] {
  if (!desc || !desc.trim()) return [];
  const regex = /\[(?:CATATAN|TANGGAPAN|INSTRUKSI)[^\]\r\n]*?(?:Superadmin|Instruksi|Penugasan)[^\]\r\n]*?\]\r?\n([\s\S]*?)(?=(?:\r?\n\[(?:CATATAN|TANGGAPAN|INSTRUKSI))|$)/gi;
  let match: RegExpExecArray | null;
  const notes: string[] = [];
  while ((match = regex.exec(desc)) !== null) {
    if (match[1]?.trim()) {
      notes.push(match[1].trim());
    }
  }
  return notes;
}

/**
 * Mengekstrak catatan instruksi penugasan khusus Superadmin dari deskripsi tiket jika ada
 */
export function extractAssignmentNotesFromDescription(desc?: string): string | undefined {
  const allNotes = extractAllAssignmentNotesFromDescription(desc);
  if (allNotes.length === 0) return undefined;
  return allNotes.join("\n\n---\n\n");
}

export interface SuperadminInstructionItem {
  id: string;
  sender: string;
  date: string;
  message: string;
  attachmentName?: string;
  attachmentSize?: string;
  attachmentType?: string;
}

export interface StoredSuperadminInstruction {
  id: string;
  ticketId: string;
  numericId?: number;
  sender: string;
  date: string;
  message: string;
  attachmentName?: string;
  attachmentSize?: string;
  attachmentType?: string;
  createdAt?: string;
}

export const SUPERADMIN_INSTRUCTIONS_KEY = "zhou_superadmin_instructions_store";

/**
 * Helper komparasi referensi tiket serbaguna (mendukung ID kode seperti TCK-975969,
 * variasi spasi/strip, numeric ID 76, maupun ekstrak digit angka 975969).
 */
export function matchTicketRef(ticket: { id?: string; numericId?: number }, ref: string | number): boolean {
  if (!ref) return false;
  const refStr = String(ref).toLowerCase().trim();
  const refClean = refStr.replace(/[-\s]/g, "");
  const refDigits = refStr.replace(/\D/g, "");

  const tId = (ticket.id || "").toLowerCase().trim();
  const tClean = tId.replace(/[-\s]/g, "");
  const tDigits = tId.replace(/\D/g, "");

  if (tId === refStr) return true;
  if (tClean && tClean === refClean) return true;
  if (typeof ref === "number" && ticket.numericId === ref) return true;
  if (ticket.numericId && String(ticket.numericId) === refStr) return true;
  if (ticket.numericId && refDigits && String(ticket.numericId) === refDigits) return true;
  if (tDigits && refDigits && tDigits === refDigits && tDigits.length >= 4) return true;
  return false;
}

/**
 * Membaca instruksi penugasan Superadmin dari persistent storage browser
 */
export function getSuperadminInstructionsFromStore(ticketRef?: string | number): StoredSuperadminInstruction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SUPERADMIN_INSTRUCTIONS_KEY);
    if (!raw) return [];
    const list: StoredSuperadminInstruction[] = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    if (!ticketRef) return list;

    return list.filter((item) =>
      matchTicketRef({ id: item.ticketId, numericId: item.numericId }, ticketRef)
    );
  } catch (e) {
    console.error("Gagal membaca zhou_superadmin_instructions_store:", e);
    return [];
  }
}

/**
 * Menyimpan instruksi penugasan Superadmin secara persisten & terakumulasi bertahap
 */
export function saveSuperadminInstructionToStore(
  ticketId: string,
  numericId: number | undefined,
  instruction: {
    message: string;
    sender?: string;
    date?: string;
    attachment?: { name: string; size?: string; type?: string };
  }
): StoredSuperadminInstruction {
  const now = new Date();
  const dateFormatted =
    instruction.date ||
    now.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }) + " WIB";

  const newItem: StoredSuperadminInstruction = {
    id: `superadmin-inst-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    ticketId,
    numericId,
    sender: instruction.sender || "Superadmin (Instruksi Superadmin)",
    date: dateFormatted,
    message: instruction.message.trim(),
    attachmentName: instruction.attachment?.name,
    attachmentSize: instruction.attachment?.size,
    attachmentType: instruction.attachment?.type,
    createdAt: now.toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      const current = getSuperadminInstructionsFromStore();
      const exists = current.some(
        (c) =>
          matchTicketRef({ id: c.ticketId, numericId: c.numericId }, ticketId) &&
          c.message.trim().toLowerCase() === newItem.message.toLowerCase() &&
          (!newItem.attachmentName || c.attachmentName === newItem.attachmentName)
      );
      if (!exists) {
        current.push(newItem);
        localStorage.setItem(SUPERADMIN_INSTRUCTIONS_KEY, JSON.stringify(current));
        window.dispatchEvent(new Event("zhou_superadmin_instructions_updated"));
        window.dispatchEvent(new Event(TICKETS_UPDATED_EVENT));
        window.dispatchEvent(new Event("storage"));
      }
    } catch (e) {
      console.error("Gagal menyimpan ke zhou_superadmin_instructions_store:", e);
    }
  }

  return newItem;
}

/**
 * Mengekstrak seluruh daftar instruksi penugasan dari Superadmin untuk PIC/Admin
 * secara lengkap dan kronologis, tanpa ada yang hilang atau tertimpa.
 */
export function extractSuperadminInstructions(ticket?: {
  id?: string;
  numericId?: number;
  description?: string;
  assignmentNotes?: string;
  correspondences?: Correspondence[];
}): SuperadminInstructionItem[] {
  if (!ticket) return [];
  const items: SuperadminInstructionItem[] = [];
  const seenMessages = new Set<string>();

  // 1. Ekstrak dari persistent store jika ada ticket id / numericId
  if (ticket.id || ticket.numericId) {
    const fromStore = getSuperadminInstructionsFromStore(ticket.id || ticket.numericId);
    fromStore.forEach((s) => {
      const clean = s.message.trim();
      const norm = clean.toLowerCase();
      if (clean && !seenMessages.has(norm)) {
        seenMessages.add(norm);
        items.push({
          id: s.id,
          sender: s.sender,
          date: s.date,
          message: clean,
          attachmentName: s.attachmentName,
          attachmentSize: s.attachmentSize,
          attachmentType: s.attachmentType,
        });
      }
    });
  }

  // 2. Ekstrak dari description backend (format resmi [CATATAN KONSULTAN - ... (Instruksi Superadmin)])
  const extracted = extractCorrespondencesFromDescription(ticket.description);
  extracted
    .filter((c) => c.role === "Superadmin" || c.sender.toLowerCase().includes("superadmin") || c.sender.toLowerCase().includes("instruksi"))
    .forEach((c) => {
      const clean = c.message.trim();
      const norm = clean.toLowerCase();
      if (clean && !seenMessages.has(norm)) {
        seenMessages.add(norm);
        items.push({
          id: c.id,
          sender: c.sender,
          date: c.date,
          message: clean,
        });
      }
    });

  // 3. Ekstrak dari correspondences yang tersimpan
  (ticket.correspondences || [])
    .filter((c) => c.role === "Superadmin" || c.sender.toLowerCase().includes("superadmin") || c.sender.toLowerCase().includes("instruksi"))
    .forEach((c) => {
      const clean = c.message.trim();
      const norm = clean.toLowerCase();
      if (clean && !seenMessages.has(norm)) {
        seenMessages.add(norm);
        items.push({
          id: c.id,
          sender: c.sender,
          date: c.date,
          message: clean,
        });
      }
    });

  // 4. Fallback jika ada assignmentNotes yang belum terangkum
  if (ticket.assignmentNotes && ticket.assignmentNotes.trim()) {
    const splitNotes = ticket.assignmentNotes.split("\n\n---\n\n");
    splitNotes.forEach((note, idx) => {
      const clean = note.trim();
      const norm = clean.toLowerCase();
      if (clean && !seenMessages.has(norm)) {
        seenMessages.add(norm);
        items.push({
          id: `fallback-superadmin-note-${idx}`,
          sender: "Superadmin (Instruksi Penugasan)",
          date: "Saat Penugasan",
          message: clean,
        });
      }
    });
  }

  return items;
}

/**
 * Format catatan resmi konsultan untuk disimpan ke deskripsi database backend
 */
export function formatConsultantNoteForStorage(
  noteText: string,
  staffName = "Tim Konsultan Zhou",
  dateString?: string
): string {
  const dateFormatted =
    dateString ||
    new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }) + " WIB";

  return `[CATATAN KONSULTAN - ${dateFormatted} - ${staffName}]\n${noteText.trim()}`;
}

/**
 * Format catatan resmi klien untuk disimpan ke deskripsi database backend
 */
export function formatClientNoteForStorage(
  noteText: string,
  clientName = "Klien",
  dateString?: string
): string {
  const dateFormatted =
    dateString ||
    new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }) + " WIB";

  return `[CATATAN KLIEN - ${dateFormatted} - ${clientName}]\n${noteText.trim()}`;
}

/**
 * Menggabungkan catatan baru klien ke deskripsi perikatan secara aman
 */
export function appendClientNoteToDescription(
  existingDesc?: string,
  formattedNote?: string
): string {
  if (!formattedNote || !formattedNote.trim()) return existingDesc || "";
  if (!existingDesc || !existingDesc.trim()) return formattedNote.trim();
  return `${existingDesc.trim()}\n\n${formattedNote.trim()}`;
}

/**
 * Menggabungkan catatan baru konsultan ke deskripsi perikatan secara aman
 */
export function appendConsultantNoteToDescription(
  existingDesc?: string,
  formattedNote?: string
): string {
  if (!formattedNote || !formattedNote.trim()) return existingDesc || "";
  if (!existingDesc || !existingDesc.trim()) return formattedNote.trim();
  return `${existingDesc.trim()}\n\n${formattedNote.trim()}`;
}

/**
 * Mengekstrak seluruh catatan korespondensi resmi konsultan & superadmin dari deskripsi perikatan backend
 */
export function extractCorrespondencesFromDescription(
  desc?: string,
  fallbackIdPrefix = "c-note"
): Correspondence[] {
  if (!desc || !desc.trim()) return [];

  const notesRegex =
    /\[(?:CATATAN|TANGGAPAN|INSTRUKSI|PESAN)\s*(?:KONSULTAN|PENUGASAN|SUPERADMIN|KLIEN)?\s*-\s*([^\]\r\n]+?)(?:\s*-\s*([^\]\r\n]+?))?\]\r?\n([\s\S]*?)(?=(?:\r?\n\[(?:CATATAN|TANGGAPAN|INSTRUKSI|PESAN))|$)/gi;
  const correspondences: Correspondence[] = [];
  let match: RegExpExecArray | null;
  let idx = 0;

  while ((match = notesRegex.exec(desc)) !== null) {
    idx++;
    const part1 = (match[1] || "").trim();
    const part2 = (match[2] || "").trim();
    const message = (match[3] || "").trim();

    if (!message) continue;

    const isDate = (str: string) =>
      /\d{1,4}/.test(str) &&
      (str.includes("WIB") || str.includes("202") || str.includes("Okt") || str.includes("/"));
    let sender = "Tim Konsultan Zhou";
    let date = "Terbaru";

    if (part2) {
      if (isDate(part1)) {
        date = part1;
        sender = part2;
      } else {
        sender = part1;
        date = part2;
      }
    } else if (part1) {
      if (isDate(part1)) {
        date = part1;
      } else {
        sender = part1;
      }
    }

    const headerTag = (match[0] || "").toUpperCase();
    const isSuperadmin =
      sender.toLowerCase().includes("superadmin") ||
      sender.toLowerCase().includes("instruksi") ||
      headerTag.includes("SUPERADMIN") ||
      headerTag.includes("INSTRUKSI");
    const isClient =
      sender.toLowerCase().includes("klien") ||
      headerTag.includes("CATATAN KLIEN") ||
      headerTag.includes("TANGGAPAN KLIEN");

    const role = isSuperadmin ? "Superadmin" : isClient ? "Klien" : "Konsultan";

    correspondences.unshift({
      id: `${fallbackIdPrefix}-${idx}-${Date.now()}`,
      sender,
      role,
      date,
      message,
    });
  }

  return correspondences;
}

/**
 * Menentukan nama divisi layanan yang akurat dan bersih.
 * Memeriksa pilihan kategori asli klien dari description, title, maupun katalog service resmi,
 * serta menyaring nama-nama dummy/pengujian (seperti "Updated Srv Name", "SRV-TEST", "Pengujian").
 */
export function resolveConsultationCategory(item?: {
  service?: { service_name?: string; category?: string } | null;
  description?: string | null;
  title?: string | null;
  category?: string | null;
}): string {
  if (!item) return "Tax Service Core";

  const isDummyName = (str?: string | null): boolean => {
    if (!str) return true;
    const s = str.trim().toLowerCase();
    return (
      s === "" ||
      s === "-" ||
      s.includes("updated srv") ||
      s.includes("srv-test") ||
      s.includes("layanan pengujian") ||
      s.includes("pengujian khusus") ||
      s.includes("dummy") ||
      s.includes("mock")
    );
  };

  const normalizeDivName = (raw?: string | null): string => {
    if (!raw) return "Tax Service Core";
    const s = raw.trim();
    const lower = s.toLowerCase();
    if (lower.includes("account") || lower.includes("akuntansi")) return "Accounting Service";
    if (lower.includes("business") || lower.includes("bisnis") || lower.includes("financial") || lower.includes("finansial")) return "Business Consulting";
    if (lower.includes("legal") || lower.includes("hukum") || lower.includes("sengketa") || lower.includes("dispute")) return "Legal Compliance";
    if (lower.includes("tax") || lower.includes("pajak") || lower.includes("coretax") || lower.includes("spt")) return "Tax Service Core";
    return s;
  };

  // 1. Prioritaskan kata kunci spesifik pada title (mencegah judul 'konsultasi pajak' tertulis 'Accounting Service')
  if (item.title) {
    const titleMatch = item.title.match(/\(([^)]+)\)/);
    if (titleMatch && titleMatch[1]?.trim() && !isDummyName(titleMatch[1])) {
      const insideParen = titleMatch[1].trim();
      if (insideParen.toLowerCase() !== "umum" && insideParen.toLowerCase() !== "chatbot") {
        return normalizeDivName(insideParen);
      }
    }
    const tLower = item.title.toLowerCase();
    if (tLower.includes("pajak") || tLower.includes("tax") || tLower.includes("spt") || tLower.includes("coretax") || tLower.includes("faktur") || tLower.includes("pph") || tLower.includes("ppn")) {
      return "Tax Service Core";
    }
    if (tLower.includes("account") || tLower.includes("akuntansi") || tLower.includes("pembukuan") || tLower.includes("laporan keuangan") || tLower.includes("neraca") || tLower.includes("jurnal")) {
      return "Accounting Service";
    }
    if (tLower.includes("legal") || tLower.includes("hukum") || tLower.includes("sengketa") || tLower.includes("perizinan") || tLower.includes("akta")) {
      return "Legal Compliance";
    }
    if (tLower.includes("business") || tLower.includes("bisnis") || tLower.includes("financial") || tLower.includes("advisory") || tLower.includes("valuasi")) {
      return "Business Consulting";
    }
  }

  // 2. Ekstrak dari catatan "Kategori: <Divisi Pilihan Klien>" di dalam description
  if (item.description) {
    const catMatch = item.description.match(/Kategori:\s*([^\r\n]+)/i);
    if (catMatch && catMatch[1]?.trim() && !isDummyName(catMatch[1])) {
      return normalizeDivName(catMatch[1]);
    }
  }

  // 3. Cek dari field category bawaan jika sudah berupa divisi valid dan bukan dummy
  if (item.category && !isDummyName(item.category)) {
    return normalizeDivName(item.category);
  }

  // 4. Cek service_name dari objek backend service jika bukan dummy
  if (item.service?.service_name && !isDummyName(item.service.service_name)) {
    return normalizeDivName(item.service.service_name);
  }

  // 5. Cek category bawaan dari service ("Tax", "Akuntansi", dll)
  if (item.service?.category && !isDummyName(item.service.category)) {
    return normalizeDivName(item.service.category);
  }

  return "Tax Service Core";
}

export function getFormattedToday(): string {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, "0");
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const y = now.getFullYear();
  return `${d}/${m}/${y}`;
}

/**
 * Mengembalikan nama PIC resmi yang bertugas atau "Menunggu PIC" jika belum ada PIC yang ditugaskan.
 * Menghilangkan teks placeholder sistem seperti "Menunggu Penugasan PIC oleh Superadmin", "Tim Konsultan Zhou", dsb.
 */
export function getDisplayPicName(ticket?: {
  assignedAdminName?: string;
  consultant?: string;
  status?: string;
} | null): string {
  if (!ticket) return "Menunggu PIC";

  // 1. Jika tiket masih berstatus "Menunggu Penugasan", otomatis belum ada PIC yang ditugaskan
  if (ticket.status === "Menunggu Penugasan") {
    return "Menunggu PIC";
  }

  // 2. Cek assignedAdminName
  const assigned = (ticket.assignedAdminName || "").trim();
  const lowerAssigned = assigned.toLowerCase();
  if (
    assigned &&
    !lowerAssigned.includes("menunggu") &&
    !lowerAssigned.includes("belum") &&
    lowerAssigned !== "tim konsultan zhou" &&
    lowerAssigned !== "konsultan zhou"
  ) {
    return assigned;
  }

  // 3. Cek consultant (hanya jika berupa nama personil asli, bukan placeholder umum)
  const consultant = (ticket.consultant || "").trim();
  const lowerConsultant = consultant.toLowerCase();
  if (
    consultant &&
    !lowerConsultant.includes("menunggu") &&
    !lowerConsultant.includes("belum") &&
    !lowerConsultant.includes("superadmin") &&
    lowerConsultant !== "tim konsultan zhou" &&
    lowerConsultant !== "konsultan zhou" &&
    lowerConsultant !== "tim konsultan zhou (sistem penugasan)"
  ) {
    return consultant;
  }

  return "Menunggu PIC";
}

/**
 * Membaca tiket kustom / booking yang dibuat pengguna
 */
let memoryTickets: ClientTicket[] = [];

export const CLIENT_TICKETS_KEY = "zhou_client_tickets";

/**
 * Membaca tiket kustom / booking yang dibuat pengguna (in-memory & persistent localStorage)
 */
export function getStoredClientTickets(): ClientTicket[] {
  try {
    if (memoryTickets.length === 0 && typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(CLIENT_TICKETS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            memoryTickets = parsed;
          }
        }
      } catch (storageErr) {
        console.warn("Gagal membaca zhou_client_tickets dari localStorage:", storageErr);
      }
    }

    return memoryTickets
      .filter((t) => !isDummyTicketRecord(t) && !isTicketDeleted(t.id) && (!t.numericId || !isTicketDeleted(t.numericId)))
      .map((t) => {
        const normalizedStatus = normalizeConsultationStatus(
          t.status,
          t.assignedAdminName || (t.consultant && !t.consultant.includes("Menunggu") ? t.consultant : undefined)
        );

        const safeMilestones: Milestone[] | undefined = t.milestones;
        let safeProgress = typeof t.progress === "number" ? t.progress : 35;

        if (Array.isArray(safeMilestones) && safeMilestones.length > 0) {
          const completedCount = safeMilestones.filter((m: Milestone) => m.status === "completed").length;
          safeProgress = Math.round((completedCount / safeMilestones.length) * 100);
        }

        let finalStatus = normalizedStatus;
        if (safeProgress === 100) {
          finalStatus = "Selesai";
        } else if (safeProgress > 0) {
          finalStatus = "Dalam Proses";
        } else if (finalStatus === "Selesai" && safeProgress < 100) {
          finalStatus = "Dalam Proses";
        }

        const safeCategory =
          t.category && String(t.category).trim() !== ""
            ? String(t.category).trim()
            : "Tax Service Core";

        return {
          ...t,
          category: safeCategory,
          createdAt: formatConsultationDate(t.createdAt),
          status: finalStatus,
          progress: safeProgress,
          milestones: safeMilestones,
          consultant:
            t.assignedAdminName && getDisplayPicName({ assignedAdminName: t.assignedAdminName }) !== "Menunggu PIC"
              ? t.assignedAdminName
              : t.consultant && getDisplayPicName({ consultant: t.consultant, status: t.status }) !== "Menunggu PIC"
              ? t.consultant
              : "Menunggu PIC",
          clientDocuments: (() => {
            const delivNames = new Set((t.deliverables || []).map((d) => d.name.toLowerCase().trim()));
            const delivIds = new Set((t.deliverables || []).map((d) => String(d.numericId || d.id)));
            return (t.clientDocuments || []).filter(
              (cd) => !delivNames.has(cd.name.toLowerCase().trim()) && !delivIds.has(String(cd.numericId || cd.id))
            );
          })(),
          priority: t.priority || "Normal",
          isArchived: Boolean(t.isArchived || isTicketArchived(t.id)),
          archivedAt: t.archivedAt,
        };
      });
  } catch (err) {
    console.error("Gagal membaca tiket klien in-memory:", err);
    return [];
  }
}

/**
 * Menyimpan tiket ke in-memory & localStorage dan mentrigger event agar dashboard admin dan user langsung tersinkron
 */
export function saveStoredClientTickets(tickets: ClientTicket[]): void {
  const sanitized = tickets.map((t) => {
    const delivNames = new Set((t.deliverables || []).map((d) => d.name.toLowerCase().trim()));
    const delivIds = new Set((t.deliverables || []).map((d) => String(d.numericId || d.id)));
    return {
      ...t,
      clientDocuments: (t.clientDocuments || []).filter(
        (cd) => !delivNames.has(cd.name.toLowerCase().trim()) && !delivIds.has(String(cd.numericId || cd.id))
      ),
    };
  });
  memoryTickets = sanitized;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(CLIENT_TICKETS_KEY, JSON.stringify(sanitized));
    } catch (e) {
      console.warn("Gagal menyimpan ke localStorage zhou_client_tickets:", e);
    }
    window.dispatchEvent(new Event(TICKETS_UPDATED_EVENT));
    window.dispatchEvent(new Event("storage"));
  }
}

/**
 * Menambahkan tiket baru (status awal wajib 'Menunggu Penugasan')
 */
export function addStoredClientTicket(ticket: ClientTicket): void {
  const current = getStoredClientTickets();
  const filtered = current.filter((t) => t.id.toLowerCase() !== ticket.id.toLowerCase());
  const safeCategory =
    ticket.category && String(ticket.category).trim() !== ""
      ? String(ticket.category).trim()
      : "Tax Service Core";
  const newTicket: ClientTicket = {
    ...ticket,
    category: safeCategory,
    createdAt: formatConsultationDate(ticket.createdAt),
    status: ticket.status || "Menunggu Penugasan",
    consultant:
      ticket.assignedAdminName && getDisplayPicName({ assignedAdminName: ticket.assignedAdminName }) !== "Menunggu PIC"
        ? ticket.assignedAdminName
        : ticket.consultant && getDisplayPicName({ consultant: ticket.consultant, status: ticket.status }) !== "Menunggu PIC"
        ? ticket.consultant
        : "Menunggu PIC",
    priority: ticket.priority || "Normal",
    progress: ticket.progress !== undefined ? ticket.progress : 15,
  };
  const updated = [newTicket, ...filtered];
  saveStoredClientTickets(updated);
}

/**
 * Menggabungkan tiket dari backend dengan pembaruan/editan lokal terkini.
 * Editan lokal (status, progres, PIC, deliverable, dokumen klien, catatan) selalu
 * diprioritaskan agar data editan tidak kembali ke data lama saat refresh halaman.
 */
export function mergeTicketsWithLocalOverrides(
  backendTickets: ClientTicket[],
  localTickets: ClientTicket[] = typeof window !== "undefined" ? getStoredClientTickets() : []
): ClientTicket[] {
  const merged: ClientTicket[] = [...backendTickets];

  localTickets.forEach((lt) => {
    const existingIdx = merged.findIndex((mt) => {
      if (matchTicketRef(mt, lt.id)) return true;
      if (lt.numericId && mt.numericId && lt.numericId === mt.numericId) return true;
      if (
        lt.title &&
        mt.title &&
        lt.title.toLowerCase().trim() === mt.title.toLowerCase().trim() &&
        (lt.id.startsWith("TK-") || mt.id.startsWith("TK-"))
      ) {
        return true;
      }
      return false;
    });

    if (existingIdx !== -1) {
      const bt = merged[existingIdx];

      // Gabungkan berkas deliverables tanpa duplikat
      const combinedDeliverables = [...(bt.deliverables || [])];
      (lt.deliverables || []).forEach((ld) => {
        if (!combinedDeliverables.some((d) => d.name.toLowerCase() === ld.name.toLowerCase() || d.id === ld.id)) {
          combinedDeliverables.unshift(ld);
        }
      });

      // Filter deliverables agar tidak pernah tercampur ke clientDocuments
      const deliverableNameSet = new Set(combinedDeliverables.map((d) => d.name.toLowerCase().trim()));

      // Gabungkan berkas dokumen klien tanpa duplikat, dan singkirkan dokumen deliverable resmi
      const combinedClientDocs = (bt.clientDocuments || []).filter(
        (cd) => !deliverableNameSet.has(cd.name.toLowerCase().trim())
      );
      (lt.clientDocuments || []).forEach((lcd) => {
        if (
          !deliverableNameSet.has(lcd.name.toLowerCase().trim()) &&
          !combinedClientDocs.some((d) => d.name.toLowerCase() === lcd.name.toLowerCase() || d.id === lcd.id)
        ) {
          combinedClientDocs.unshift(lcd);
        }
      });

      // Gabungkan lampiran instruksi dari store jika ada
      const storeInstructions = getSuperadminInstructionsFromStore(bt.id || bt.numericId || lt.id || lt.numericId);
      storeInstructions.forEach((si) => {
        if (si.attachmentName && !deliverableNameSet.has(si.attachmentName.toLowerCase().trim())) {
          const alreadyExists = combinedClientDocs.some(
            (d) => d.name.toLowerCase().trim() === si.attachmentName?.toLowerCase().trim()
          );
          if (!alreadyExists) {
            combinedClientDocs.unshift({
              id: `DOC-STORE-${si.id}`,
              name: si.attachmentName,
              size: si.attachmentSize || "1.0 MB",
              type: si.attachmentType || "BERKAS",
              date: si.date.split(" ")[0] || formatConsultationDate(),
              uploadedBy: "Superadmin (Instruksi)",
              status: "Instruksi Superadmin",
            });
          }
        }
      });

      // Gabungkan korespondensi/catatan resmi konsultan
      const fromBackendDesc = extractCorrespondencesFromDescription(bt.description, `bt-note-${bt.id}`);
      const combinedCorrespondences = [...(bt.correspondences || [])];
      fromBackendDesc.forEach((fc) => {
        if (!combinedCorrespondences.some((c) => c.message.trim() === fc.message.trim())) {
          combinedCorrespondences.unshift(fc);
        }
      });
      (lt.correspondences || []).forEach((lc) => {
        if (!combinedCorrespondences.some((c) => c.id === lc.id || (c.message.trim() === lc.message.trim() && c.date === lc.date))) {
          combinedCorrespondences.unshift(lc);
        }
      });

      // Tambahkan instruksi dari persistent store ke korespondensi jika belum ada
      storeInstructions.forEach((si) => {
        const hasMsg = combinedCorrespondences.some((c) => {
          const cMsg = c.message.toLowerCase().trim();
          const sMsg = si.message.toLowerCase().trim();
          return cMsg === sMsg || cMsg.includes(sMsg) || sMsg.includes(cMsg);
        });
        if (!hasMsg) {
          combinedCorrespondences.unshift({
            id: si.id,
            sender: si.sender,
            role: "Superadmin",
            date: si.date,
            message: si.message,
          });
        }
      });

      // Priority: Data live backend didahulukan, tetapi pertahankan checklist milestone & progres staf terbaru jika lebih mutakhir
      const ltCompleted = (lt.milestones || []).filter((m) => m.status === "completed").length;
      const btCompleted = (bt.milestones || []).filter((m) => m.status === "completed").length;
      const resolvedMilestones =
        ltCompleted > btCompleted
          ? lt.milestones
          : (bt.milestones && bt.milestones.length > 0)
          ? bt.milestones
          : lt.milestones;
      const resolvedProgress = Math.max(bt.progress || 0, lt.progress || 0);
      const resolvedStatus =
        resolvedProgress === 100
          ? "Selesai"
          : bt.status === "Selesai"
          ? "Selesai"
          : (lt.status && lt.status !== "Menunggu Penugasan")
          ? lt.status
          : bt.status;

      const storeNotes = storeInstructions.map((s) => s.message).join("\n\n---\n\n");
      const resolvedAssignmentNotes =
        lt.assignmentNotes ||
        storeNotes ||
        bt.assignmentNotes ||
        extractAssignmentNotesFromDescription(bt.description) ||
        extractAssignmentNotesFromDescription(lt.description);

      // Pastikan assignmentNotes juga tercatat di combinedCorrespondences jika belum ada
      if (resolvedAssignmentNotes && resolvedAssignmentNotes.trim()) {
        const noteClean = resolvedAssignmentNotes.trim();
        const hasNoteInCorr = combinedCorrespondences.some((c) =>
          c.message.includes(noteClean) || noteClean.includes(c.message.trim())
        );
        if (!hasNoteInCorr) {
          combinedCorrespondences.unshift({
            id: `assign-note-${bt.id || lt.id}-${Date.now()}`,
            sender: "Superadmin (Instruksi Penugasan)",
            role: "Superadmin",
            date: bt.assignedAt || lt.assignedAt
              ? new Date(bt.assignedAt || lt.assignedAt || Date.now()).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }) + " WIB"
              : "Saat Penugasan",
            message: noteClean,
          });
        }
      }

      // Pastikan deskripsi tidak menimpa catatan konsultan yang sudah ada
      let resolvedDescription = bt.description || lt.description || "";
      if (lt.description && lt.description.includes("[CATATAN KONSULTAN") && !resolvedDescription.includes("[CATATAN KONSULTAN")) {
        resolvedDescription = appendConsultantNoteToDescription(resolvedDescription, lt.description);
      }

      merged[existingIdx] = {
        ...lt,
        ...bt,
        id: bt.id || lt.id,
        numericId: bt.numericId || lt.numericId,
        description: resolvedDescription,
        assignmentNotes: resolvedAssignmentNotes,
        deliverables: combinedDeliverables,
        clientDocuments: combinedClientDocs,
        correspondences: combinedCorrespondences,
        milestones: resolvedMilestones,
        status: resolvedStatus,
        progress: resolvedProgress,
        consultant: (bt.consultant && !bt.consultant.includes("Menunggu"))
          ? bt.consultant
          : (lt.consultant || bt.consultant),
        assignedAdminName: bt.assignedAdminName || lt.assignedAdminName,
        assignedAdminEmail: bt.assignedAdminEmail || lt.assignedAdminEmail,
        assignedAdminId: bt.assignedAdminId || lt.assignedAdminId,
        isArchived: Boolean(bt.isArchived ?? lt.isArchived),
      };
    } else {
      merged.unshift(lt);
    }
  });

  return merged;
}

/**
 * Mengembalikan peringkat urutan kronologis standar tahapan konsultasi
 * 1: Intake & Verifikasi Berkas Awal
 * 2: Penetapan Konsultan PIC & Divisi Terkait
 * 3: Analisis & Pengerjaan Lembar Kerja Fiskal / Pembahasan
 * 4: Finalisasi & Penyampaian Hasil Konsultasi / Laporan Final
 */
export function getMilestoneRank(name?: string): number {
  const lower = (name || "").toLowerCase();
  if (lower.includes("intake") || lower.includes("verifikasi") || lower.includes("permohonan")) return 1;
  if (lower.includes("pic") || lower.includes("penetapan") || lower.includes("penugasan")) return 2;
  if (lower.includes("analisis") || lower.includes("kertas kerja") || lower.includes("lembar kerja") || lower.includes("pembahasan")) return 3;
  if (lower.includes("finalisasi") || lower.includes("penyampaian") || lower.includes("laporan") || lower.includes("selesai")) return 4;
  return 99;
}

/**
 * Mengurutkan array milestone/task agar selalu sesuai dengan urutan alur kerja 1, 2, 3, 4
 * Mencegah anomali task terlempar ke bawah atau ke atas akibat update PostgreSQL tanpa ORDER BY.
 */
export function sortAndNormalizeMilestones<
  T extends { taskId?: number | string; id?: number | string; task_name?: string; title?: string }
>(items: T[]): T[] {
  if (!Array.isArray(items) || items.length === 0) return [];
  return [...items].sort((a, b) => {
    const nameA = a.task_name || a.title || "";
    const nameB = b.task_name || b.title || "";
    const rankA = getMilestoneRank(nameA);
    const rankB = getMilestoneRank(nameB);
    if (rankA !== rankB) return rankA - rankB;
    const idA = typeof a.taskId === "number" ? a.taskId : typeof a.id === "number" ? a.id : 0;
    const idB = typeof b.taskId === "number" ? b.taskId : typeof b.id === "number" ? b.id : 0;
    return idA - idB;
  });
}

/**
 * Menugaskan Admin / PIC ke tiket konsultasi atau Mengalihkan PIC (Kewenangan Khusus Superadmin)
 * Memvalidasi PIC aktif, merekam PIC lama dan PIC baru, serta mencatat audit log korespondensi resmi.
 */
export function assignTicketPic(
  ticketId: string,
  admin: StaffAdminProfile | { id: string; name: string; email: string; division?: string; divisions?: string[]; isActive?: boolean },
  notes?: string,
  fallbackTicket?: ClientTicket
): ClientTicket | null {
  // Validasi PIC harus berstatus aktif
  if ("isActive" in admin && admin.isActive === false) {
    console.warn(`Penugasan ditolak: Admin ${admin.name} berstatus non-aktif.`);
    return null;
  }

  const tickets = getStoredClientTickets();
  let index = tickets.findIndex((t) => {
    if (matchTicketRef(t, ticketId)) return true;
    if (fallbackTicket && matchTicketRef(t, fallbackTicket.id)) return true;
    if (fallbackTicket?.numericId && t.numericId && fallbackTicket.numericId === t.numericId) return true;
    return false;
  });

  if (index === -1) {
    if (fallbackTicket) {
      tickets.unshift(fallbackTicket);
      index = 0;
    } else {
      return null;
    }
  }

  const target = tickets[index];
  const divisionStr =
    "divisions" in admin && Array.isArray(admin.divisions)
      ? admin.divisions.join(", ")
      : ("division" in admin && typeof (admin as { division?: string }).division === "string"
          ? (admin as { division?: string }).division
          : target.category || "Tax Service Core");

  const isReassignment = Boolean(
    target.assignedAdminName &&
    (target.assignedAdminEmail?.toLowerCase() !== admin.email.toLowerCase() ||
      target.assignedAdminId !== admin.id)
  );

  const prevAdminName = target.assignedAdminName || target.consultant || "Belum Ditetapkan";
  const prevAdminEmail = target.assignedAdminEmail || "-";
  const prevAdminDivision = target.assignedAdminDivision || "-";

  // Konsistensi Status & Progres:
  // Jika tiket masih "Menunggu Penugasan", perbarui status menjadi "Ditugaskan" (progres min 35%-50%).
  // Jika tiket sudah berjalan ("Dalam Proses", "Menunggu Klien", "Selesai"), pertahankan status & progres yang ada!
  let newStatus = target.status;
  let newProgress = target.progress || 15;

  if (target.status === "Menunggu Penugasan" || !target.assignedAdminName) {
    newStatus = "Ditugaskan";
    newProgress = Math.max(target.progress || 0, 50);
  }

  const nowFormatted = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }) + " WIB";

  // Simpan instruksi penugasan ke dedicated instruction persistent store agar selalu terakumulasi
  if (notes && notes.trim()) {
    saveSuperadminInstructionToStore(
      ticketId,
      target.numericId || fallbackTicket?.numericId,
      {
        message: notes.trim(),
        sender: "Superadmin (Instruksi Superadmin)",
        date: nowFormatted,
      }
    );
  }

  // Milestone tracking: pastikan milestones terurut dan task penetapan PIC otomatis completed
  const sortedTargetMilestones = sortAndNormalizeMilestones(target.milestones || []);
  const updatedMilestones: Milestone[] = (sortedTargetMilestones.length > 0)
    ? sortedTargetMilestones.map((m, idx) => {
        const isPicMilestone = getMilestoneRank(m.title) === 2 || m.title.toLowerCase().includes("pic") || idx === 1;
        if (idx === 0) return { ...m, status: "completed" as const };
        if (isPicMilestone) {
          return {
            ...m,
            status: "completed" as const,
            title: isReassignment ? `PIC Dialihkan: ${admin.name}` : `PIC Ditetapkan: ${admin.name}`,
            description: isReassignment
              ? `Penugasan dialihkan oleh Superadmin dari ${prevAdminName} kepada ${admin.name} (${divisionStr}).`
              : `Superadmin menetapkan ${admin.name} (${divisionStr}) sebagai konsultan PIC.`,
          };
        }
        return m;
      })
    : [
        {
          step: "01",
          title: "Permohonan Diterima",
          status: "completed",
          date: target.createdAt || "Hari ini",
          description: "Permohonan konsultasi diverifikasi dan dicatat sistem.",
        },
        {
          step: "02",
          title: isReassignment ? `PIC Dialihkan: ${admin.name}` : `PIC Ditetapkan: ${admin.name}`,
          status: "completed",
          date: "Hari ini",
          description: isReassignment
            ? `Penugasan dialihkan oleh Superadmin dari ${prevAdminName} kepada ${admin.name} (${divisionStr}).`
            : `Superadmin menetapkan ${admin.name} (${divisionStr}) sebagai konsultan PIC.`,
        },
        {
          step: "03",
          title: "Pengerjaan & Konsultasi",
          status: newStatus === "Dalam Proses" ? "in_progress" : "pending",
          date: "Proses",
          description: "Konsultan PIC menganalisis kebutuhan klien dan menyusun kertas kerja.",
        },
        {
          step: "04",
          title: "Finalisasi & Penyampaian Hasil",
          status: newStatus === "Selesai" ? "completed" : "pending",
          date: "Final",
          description: "Penerbitan dokumen deliverable resmi.",
        },
      ];

  // Catatan audit resmi korespondensi
  const newCorrespondences: Correspondence[] = [
    {
      id: `assign-${Date.now()}`,
      sender: "Superadmin (Sistem Audit Penugasan)",
      role: "Superadmin",
      date: nowFormatted,
      message: isReassignment
        ? `[AUDIT REASSIGNMENT] Penugasan dialihkan oleh Superadmin dari ${prevAdminName} (${prevAdminDivision}) kepada ${admin.name} (${divisionStr}). Waktu Pengalihan: ${nowFormatted}.${notes ? ` Catatan Pengalihan: "${notes}"` : ""}`
        : `[PENUGASAN RESMI] Konsultasi berhasil ditugaskan oleh Superadmin kepada ${admin.name} (${divisionStr}). Waktu Penugasan: ${nowFormatted}.${notes ? ` Catatan Penugasan: "${notes}"` : ""}`,
    },
  ];

  if (notes && notes.trim()) {
    newCorrespondences.unshift({
      id: `instr-superadmin-${Date.now()}`,
      sender: "Superadmin (Instruksi Superadmin)",
      role: "Superadmin",
      date: nowFormatted,
      message: notes.trim(),
    });
  }

  let mergedAssignmentNotes = target.assignmentNotes || "";
  if (notes && notes.trim()) {
    if (!mergedAssignmentNotes) {
      mergedAssignmentNotes = notes.trim();
    } else if (!mergedAssignmentNotes.includes(notes.trim())) {
      mergedAssignmentNotes = `${mergedAssignmentNotes}\n\n---\n\n${notes.trim()}`;
    }
  }

  let updatedDescription = target.description || "";
  if (notes && notes.trim()) {
    const formattedNote = formatConsultantNoteForStorage(
      notes.trim(),
      "Superadmin (Instruksi Superadmin)",
      nowFormatted
    );
    updatedDescription = appendConsultantNoteToDescription(target.description, formattedNote);
  }

  const updatedTicket: ClientTicket = {
    ...target,
    description: updatedDescription,
    assignedAdminId: admin.id,
    assignedAdminName: admin.name,
    assignedAdminEmail: admin.email,
    assignedAdminDivision: divisionStr,
    assignedAt: isReassignment ? (target.assignedAt || new Date().toISOString()) : new Date().toISOString(),
    reassignedAt: isReassignment ? new Date().toISOString() : undefined,
    previousAdminName: isReassignment ? prevAdminName : target.previousAdminName,
    previousAdminEmail: isReassignment ? prevAdminEmail : target.previousAdminEmail,
    previousAdminDivision: isReassignment ? prevAdminDivision : target.previousAdminDivision,
    assignmentNotes: mergedAssignmentNotes,
    consultant: admin.name,
    status: newStatus,
    progress: newProgress,
    milestones: updatedMilestones,
    correspondences: [...newCorrespondences, ...(target.correspondences || [])],
  };

  tickets[index] = updatedTicket;
  saveStoredClientTickets(tickets);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(STAFF_UPDATED_EVENT));
  }
  return updatedTicket;
}

/**
 * Pengecekan Hak Akses Admin terhadap Tiket Konsultasi
 * Memastikan Admin hanya dapat melihat dan mengerjakan konsultasi yang ditugaskan kepadanya.
 */
export function canAdminAccessTicket(
  ticket: ClientTicket,
  adminUser?: { email?: string; id?: string | number; name?: string; role?: string } | null
): boolean {
  if (!adminUser) return false;
  // Superadmin memiliki akses pengawasan global
  if (adminUser.role === "superadmin") return true;

  const email = String(adminUser.email || "").toLowerCase().trim();
  const name = String(adminUser.name || "").toLowerCase().replace(/\s*\(updated\)/gi, "").trim();
  const id = String(adminUser.id || "").toLowerCase().trim();

  const assignedEmail = String(ticket.assignedAdminEmail || "").toLowerCase().trim();
  const assignedName = String(ticket.assignedAdminName || "").toLowerCase().replace(/\s*\(updated\)/gi, "").trim();
  const assignedId = String(ticket.assignedAdminId || "").toLowerCase().trim();
  const consultant = String(ticket.consultant || "").toLowerCase().replace(/\s*\(updated\)/gi, "").trim();

  // Jika tiket belum ditugaskan ke siapa-siapa, Admin biasa tidak boleh mengakses
  if (!assignedEmail && !assignedId && !assignedName && consultant.includes("menunggu")) {
    return false;
  }

  const matchEmail =
    Boolean(assignedEmail) &&
    (assignedEmail === email ||
      (email.includes("admin@zhouconsulting") && (assignedEmail.includes("konsultan") || assignedEmail.includes("admin@zhou"))) ||
      (email.includes("konsultan") && assignedEmail.includes("admin@zhou")) ||
      (email.includes("ana") && assignedEmail.includes("ana")));

  const matchName =
    (Boolean(assignedName) && (assignedName === name || assignedName.includes(name) || name.includes(assignedName))) ||
    (Boolean(consultant) && (consultant === name || consultant.includes(name) || name.includes(consultant)));

  const matchId =
    Boolean(assignedId) &&
    (assignedId === id ||
      assignedId.endsWith(id) ||
      id.endsWith(assignedId) ||
      (id === "2" && assignedId.includes("002")) ||
      (id === "23" && assignedId.includes("023")));

  return Boolean(matchEmail || matchName || matchId);
}

/**
 * Mengambil tiket dengan validasi otorisasi PIC
 * Jika Admin mencoba mengakses tiket milik PIC lain atau tiket belum ditugaskan, tolak dengan aman tanpa membocorkan data.
 */
export function getTicketByIdForStaff(
  ticketId: string,
  staffUser?: { email?: string; id?: string | number; name?: string; role?: string } | null
): { success: boolean; error?: string; ticket?: ClientTicket } {
  const tickets = getStoredClientTickets();
  const found = tickets.find((t) => matchTicketRef(t, ticketId));
  if (!found) {
    return { success: false, error: `Tiket dengan referensi ${ticketId} tidak ditemukan.` };
  }

  if (!canAdminAccessTicket(found, staffUser)) {
    return {
      success: false,
      error: `Akses Ditolak: Anda tidak memiliki wewenang untuk melihat atau mengelola tiket ${ticketId} karena bukan ditugaskan kepada Anda.`,
    };
  }

  return { success: true, ticket: found };
}

/**
 * Membaca hanya tiket yang ditugaskan kepada Admin yang sedang login
 */
export function getTicketsForAdmin(
  adminUser?: { email?: string; id?: string | number; name?: string; role?: string } | null
): ClientTicket[] {
  const allTickets = getStoredClientTickets();
  if (!adminUser) return [];
  if (adminUser.role === "superadmin") return allTickets;
  return allTickets.filter((t) => canAdminAccessTicket(t, adminUser));
}

/**
 * Membaca tiket milik akun Klien yang sedang login (hanya permohonan konsultasi milik klien bersangkutan)
 */
export function getTicketsForClient(clientEmail?: string | null, clientName?: string | null): ClientTicket[] {
  const allTickets = getStoredClientTickets();
  if (!clientEmail || clientEmail.trim() === "") {
    if (clientName && clientName.trim() !== "") {
      const cleanName = clientName.toLowerCase().trim();
      return allTickets.filter((t) => {
        const cName = String(t.clientName || "").toLowerCase().trim();
        return Boolean(cName && (cName === cleanName || cName.includes(cleanName)));
      });
    }
    return [];
  }

  const cleanEmail = clientEmail.toLowerCase().trim();
  const cleanName = clientName ? clientName.toLowerCase().trim() : "";

  return allTickets.filter((t) => {
    const cEmail = String(t.clientEmail || "").toLowerCase().trim();
    const cName = String(t.clientName || "").toLowerCase().trim();

    if (cEmail && cEmail === cleanEmail) return true;
    if (cleanName && cName && (cName === cleanName || cName.includes(cleanName))) return true;
    return false;
  });
}

/**
 * Memperbarui progres atau status konsultasi oleh Admin / Superadmin
 */
export function updateTicketByStaff(
  ticketId: string,
  staffUser: { email?: string; id?: string | number; name?: string; role?: string },
  updates: {
    status?: ConsultationStatus;
    progress?: number;
    notes?: string;
    milestones?: Milestone[];
  },
  fallbackTicket?: ClientTicket
): { success: boolean; message: string; ticket?: ClientTicket } {
  const tickets = getStoredClientTickets();
  const cleanSearch = ticketId.toLowerCase().trim();
  const numSearch = ticketId.replace(/\D/g, "");
  let index = tickets.findIndex(
    (t) =>
      t.id.toLowerCase() === cleanSearch ||
      (numSearch && t.id.replace(/\D/g, "") === numSearch) ||
      (t.numericId && String(t.numericId) === numSearch) ||
      (cleanSearch.startsWith("tk-") && t.id.toLowerCase().includes(cleanSearch.replace("tk-", "")))
  );

  let target: ClientTicket;
  if (index === -1) {
    if (fallbackTicket) {
      target = { ...fallbackTicket };
      tickets.unshift(target);
      index = 0;
    } else {
      return { success: false, message: "Konsultasi tidak ditemukan." };
    }
  } else {
    target = tickets[index];
  }

  // Batasan akses: Admin tidak boleh mengubah tiket milik PIC lain
  if (staffUser.role !== "superadmin" && !canAdminAccessTicket(target, staffUser)) {
    return {
      success: false,
      message: "Akses ditolak: Anda tidak memiliki wewenang untuk memperbarui konsultasi ini karena ditugaskan ke PIC lain.",
    };
  }

  let updatedMilestones: Milestone[] =
    updates.milestones && updates.milestones.length > 0
      ? [...updates.milestones]
      : target.milestones && target.milestones.length > 0
      ? [...target.milestones]
      : [];

  let newProgress: number;
  if (updatedMilestones.length > 0) {
    const completedCount = updatedMilestones.filter((m) => m.status === "completed").length;
    newProgress = Math.round((completedCount / updatedMilestones.length) * 100);
  } else if (updates.progress !== undefined) {
    newProgress = updates.progress;
  } else {
    newProgress = target.progress || 0;
  }

  let newStatus = updates.status || target.status;
  if (newProgress === 100) {
    newStatus = "Selesai";
    if (updatedMilestones.length > 0) {
      updatedMilestones = updatedMilestones.map((m) => ({ ...m, status: "completed" as const }));
    }
  } else if (newStatus === "Selesai" && newProgress < 100) {
    newStatus = "Dalam Proses";
  } else if (newProgress > 0 && (newStatus === "Menunggu Penugasan" || newStatus === "Ditugaskan")) {
    newStatus = "Dalam Proses";
  }

  const nowFormatted = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }) + " WIB";

  let newCorrespondences = target.correspondences || [];
  if (updates.notes && updates.notes.trim()) {
    const noteEntry: Correspondence = {
      id: `staff-note-${Date.now()}`,
      sender: staffUser.name || "Konsultan PIC",
      role: staffUser.role === "superadmin" ? "Superadmin" : "Konsultan",
      date: nowFormatted,
      message: updates.notes.trim(),
    };
    newCorrespondences = [noteEntry, ...newCorrespondences];
  }

  const updatedTicket: ClientTicket = {
    ...target,
    status: newStatus,
    progress: newProgress,
    milestones: updatedMilestones.length > 0 ? updatedMilestones : target.milestones,
    correspondences: newCorrespondences,
  };

  tickets[index] = updatedTicket;
  saveStoredClientTickets(tickets);
  return { success: true, message: "Status & progres konsultasi berhasil diperbarui.", ticket: updatedTicket };
}

export function updateStoredClientTicketProgress(
  ticketId: string,
  updates: {
    status?: ConsultationStatus;
    progress?: number;
    notes?: string;
    milestones?: Milestone[];
  },
  staffUser: { email?: string; id?: string | number; name?: string; role?: string },
  fallbackTicket?: ClientTicket
): { success: boolean; message: string; ticket?: ClientTicket } {
  return updateTicketByStaff(ticketId, staffUser, updates, fallbackTicket);
}

/**
 * In-memory & IndexedDB cache for live downloaded / uploaded files
 */
const liveBlobCache = new Map<string, Blob>();

export function cacheFileBlob(key: string | string[], blob: Blob): void {
  if (!key) return;
  const keys = Array.isArray(key) ? key : [key];
  keys.forEach((k) => {
    if (!k) return;
    liveBlobCache.set(k.toLowerCase().trim(), blob);
    if (k !== k.toLowerCase().trim()) liveBlobCache.set(k, blob);
  });
  savePersistentFileBlob(keys, blob);
}

export function getCachedFileBlob(key: string): Blob | undefined {
  if (!key) return undefined;
  return liveBlobCache.get(key.toLowerCase().trim()) || liveBlobCache.get(key);
}

export async function getCachedFileBlobAsync(key: string): Promise<Blob | undefined> {
  if (!key) return undefined;
  const inMemory = getCachedFileBlob(key);
  if (inMemory) return inMemory;
  const fromDB = await getPersistentFileBlob(key);
  if (fromDB) {
    liveBlobCache.set(key.toLowerCase().trim(), fromDB);
    return fromDB;
  }
  return undefined;
}

export function formatCorrespondenceMessage(msg?: string): string {
  if (!msg || !msg.trim()) return "";
  const clientMatch = msg.match(/Pesan Klien:\s*([\s\S]+)$/i);
  if (clientMatch && clientMatch[1]?.trim()) {
    return clientMatch[1].trim();
  }
  if (msg.includes("Eskalasi Otomatis dari Chatbot")) {
    return "Permohonan konsultasi diajukan melalui asisten cerdas Zhou Consulting.";
  }
  return msg.trim();
}

/**
 * Klien mengunggah dokumen pendukung tambahan pada konsultasi yang sedang berjalan
 */
export function addSupportingDocumentToTicket(
  ticketId: string,
  doc: ClientUploadedFile,
  clientEmail?: string | null,
  fallbackTicket?: ClientTicket
): { success: boolean; message: string; ticket?: ClientTicket } {
  return addSupportingDocumentsToTicket(ticketId, [doc], clientEmail, fallbackTicket);
}

/**
 * Klien mengunggah satu atau beberapa dokumen pendukung tambahan sekaligus
 */
export function addSupportingDocumentsToTicket(
  ticketId: string,
  docs: ClientUploadedFile[],
  clientEmail?: string | null,
  fallbackTicket?: ClientTicket
): { success: boolean; message: string; ticket?: ClientTicket } {
  if (!docs || docs.length === 0) {
    return { success: false, message: "Tidak ada dokumen yang dipilih untuk diunggah." };
  }

  const tickets = getStoredClientTickets();
  const cleanSearch = ticketId.toLowerCase().trim();
  const numSearch = ticketId.replace(/\D/g, "");
  let index = tickets.findIndex(
    (t) =>
      t.id.toLowerCase() === cleanSearch ||
      (numSearch && t.id.replace(/\D/g, "") === numSearch) ||
      (t.numericId && String(t.numericId) === numSearch) ||
      (cleanSearch.startsWith("tk-") && t.id.toLowerCase().includes(cleanSearch.replace("tk-", "")))
  );

  let target: ClientTicket;
  if (index === -1) {
    if (fallbackTicket) {
      target = { ...fallbackTicket };
    } else {
      target = {
        id: ticketId,
        numericId: parseInt(numSearch, 10) || undefined,
        title: `Konsultasi ${ticketId}`,
        category: "Tax Service Core",
        description: "Konsultasi Klien",
        clientName: "Klien Terdaftar",
        clientEmail: clientEmail || undefined,
        consultant: "Staf Konsultan Zhou",
        milestones: [],
        status: "Dalam Proses",
        progress: 35,
        createdAt: new Date().toISOString(),
        estimatedCompletion: "14 Hari Kerja",
        deliverables: [],
        clientDocuments: [],
        correspondences: [],
      };
    }
    tickets.unshift(target);
    index = 0;
  } else {
    target = tickets[index];
  }

  // Validasi Hak Akses: Klien tidak boleh mengunggah ke konsultasi milik akun lain
  if (clientEmail && clientEmail.trim()) {
    const cleanClientEmail = clientEmail.toLowerCase().trim();
    const targetEmail = String(target.clientEmail || "").toLowerCase().trim();
    if (targetEmail && targetEmail !== cleanClientEmail) {
      return {
        success: false,
        message: "Akses ditolak: Anda tidak memiliki wewenang untuk menambahkan dokumen ke konsultasi milik klien lain.",
      };
    }
  }

  // Validasi Status: Pengunggahan hanya boleh pada konsultasi yang sedang berjalan
  const currentStatus = target.status;
  if (currentStatus === "Selesai" || currentStatus === "Dibatalkan") {
    return {
      success: false,
      message: `Konsultasi ini telah berstatus "${currentStatus}". Penambahan dokumen pendukung baru telah ditutup.`,
    };
  }

  const nowFormatted = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }) + " WIB";

  // Pastikan setiap dokumen memiliki ID unik dan metadata waktu
  const preparedDocs: ClientUploadedFile[] = docs.map((d, i) => ({
    ...d,
    id: d.id || `doc-${Date.now()}-${i}`,
    uploadedAt: d.uploadedAt || new Date().toISOString(),
    date: d.date || nowFormatted,
    uploadedBy: d.uploadedBy || target.clientName || "Klien",
    status: d.status || "Diterima PIC",
  }));

  // Pertahankan dokumen lama (dokumen baru diletakkan di awal)
  const existingDocs = target.clientDocuments || [];
  target.clientDocuments = [...preparedDocs, ...existingDocs];

  // Tambahkan catatan korespondensi log secara otomatis
  const docNamesList = preparedDocs.map((d) => `"${d.name}" (${d.size})`).join(", ");
  const noteEntry: Correspondence = {
    id: `doc-upload-${Date.now()}`,
    sender: target.clientName || "Klien",
    role: "Klien",
    date: nowFormatted,
    message: `Klien mengunggah dokumen pendukung: ${docNamesList}.${
      preparedDocs[0]?.description ? ` Keterangan: "${preparedDocs[0].description}"` : ""
    }`,
  };
  target.correspondences = [noteEntry, ...(target.correspondences || [])];

  tickets[index] = target;
  saveStoredClientTickets(tickets);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("zhou_tickets_updated", { detail: { ticketId: target.id } }));
  }

  return {
    success: true,
    message: `${preparedDocs.length} dokumen berhasil diunggah ke konsultasi ${target.id}.`,
    ticket: target,
  };
}

/**
 * Klien mengirimkan catatan atau tanggapan balasan kepada tim konsultan / PIC
 */
export function addClientNoteToTicket(
  ticketId: string,
  noteText: string,
  clientProfile?: { name?: string; email?: string } | null,
  fallbackTicket?: ClientTicket
): { success: boolean; message: string; ticket?: ClientTicket } {
  if (!noteText || !noteText.trim()) {
    return { success: false, message: "Catatan tidak boleh kosong." };
  }

  const tickets = getStoredClientTickets();
  let index = tickets.findIndex((t) => matchTicketRef(t, ticketId));

  let target: ClientTicket;
  if (index === -1) {
    if (fallbackTicket) {
      target = { ...fallbackTicket };
    } else {
      const numSearch = ticketId.replace(/\D/g, "");
      target = {
        id: ticketId,
        numericId: parseInt(numSearch, 10) || undefined,
        title: `Konsultasi ${ticketId}`,
        category: "Tax Service Core",
        description: "Konsultasi Klien",
        clientName: clientProfile?.name || "Klien Terdaftar",
        clientEmail: clientProfile?.email || undefined,
        consultant: "Staf Konsultan Zhou",
        milestones: [],
        status: "Dalam Proses",
        progress: 35,
        createdAt: new Date().toISOString(),
        estimatedCompletion: "14 Hari Kerja",
        deliverables: [],
        clientDocuments: [],
        correspondences: [],
      };
    }
    tickets.unshift(target);
    index = 0;
  } else {
    target = tickets[index];
  }

  // Validasi Status: Pengiriman catatan hanya boleh jika konsultasi belum selesai / dibatalkan
  const currentStatus = target.status;
  if (currentStatus === "Selesai" || currentStatus === "Dibatalkan") {
    return {
      success: false,
      message: `Konsultasi ini telah berstatus "${currentStatus}". Jalur korespondensi telah ditutup.`,
    };
  }

  const clientName = clientProfile?.name || target.clientName || "Klien";
  const nowFormatted = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }) + " WIB";

  const newCorrespondence: Correspondence = {
    id: `client-note-${Date.now()}`,
    sender: clientName,
    role: "Klien",
    date: nowFormatted,
    message: noteText.trim(),
  };

  const formattedNote = formatClientNoteForStorage(noteText.trim(), clientName, nowFormatted);
  const updatedDesc = appendClientNoteToDescription(target.description, formattedNote);

  // Jika tiket sebelumnya berstatus "Menunggu Klien", saat klien merespons ubah kembali ke "Dalam Proses"
  let newStatus = target.status;
  if (newStatus === "Menunggu Klien") {
    newStatus = "Dalam Proses";
  }

  target.status = newStatus;
  target.description = updatedDesc;
  target.correspondences = [newCorrespondence, ...(target.correspondences || [])];

  tickets[index] = target;
  saveStoredClientTickets(tickets);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("zhou_tickets_updated", { detail: { ticketId: target.id } }));
  }

  return {
    success: true,
    message: "Catatan berhasil dikirimkan ke konsultan.",
    ticket: target,
  };
}

/**
 * Admin / Konsultan PIC mengunggah berkas deliverable untuk Klien
 */
export function addAdminDeliverableToTicket(
  ticketId: string,
  deliverable: {
    name: string;
    size: string;
    type?: string;
    category?: string;
    notes?: string;
    downloadUrl?: string;
  },
  adminProfile?: { name?: string; role?: string; email?: string },
  fallbackTicket?: ClientTicket
): { success: boolean; message: string; ticket?: ClientTicket } {
  const tickets = getStoredClientTickets();
  const cleanSearch = ticketId.toLowerCase().trim();
  const numSearch = ticketId.replace(/\D/g, "");
  let index = tickets.findIndex(
    (t) =>
      t.id.toLowerCase() === cleanSearch ||
      (numSearch && t.id.replace(/\D/g, "") === numSearch) ||
      (t.numericId && String(t.numericId) === numSearch) ||
      (cleanSearch.startsWith("tk-") && t.id.toLowerCase().includes(cleanSearch.replace("tk-", "")))
  );

  let target: ClientTicket;
  if (index === -1) {
    if (fallbackTicket) {
      target = { ...fallbackTicket };
    } else {
      target = {
        id: ticketId,
        numericId: parseInt(numSearch, 10) || undefined,
        title: `Konsultasi ${ticketId}`,
        category: "Tax Service Core",
        description: "Konsultasi Klien",
        clientName: "Klien Terdaftar",
        consultant: adminProfile?.name || "Staf Konsultan Zhou",
        milestones: [],
        status: "Dalam Proses",
        progress: 50,
        createdAt: new Date().toISOString(),
        estimatedCompletion: "14 Hari Kerja",
        deliverables: [],
        clientDocuments: [],
        correspondences: [],
      };
    }
    tickets.unshift(target);
    index = 0;
  } else {
    target = tickets[index];
  }

  const nowFormatted = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }) + " WIB";

  const fileExt = deliverable.name.split(".").pop()?.toUpperCase() || "PDF";
  const newDeliverable: Deliverable = {
    id: `deliv-${Date.now()}`,
    name: deliverable.name,
    size: deliverable.size,
    type: fileExt,
    date: nowFormatted,
    status: "Tersedia",
    downloadUrl: deliverable.downloadUrl || "#",
  };

  const existing = target.deliverables || [];
  target.deliverables = [newDeliverable, ...existing];

  // Otomatis bersihkan duplikasi jika berkas deliverable yang diunggah konsultan sebelumnya ada di clientDocuments
  if (target.clientDocuments && target.clientDocuments.length > 0) {
    const dName = deliverable.name.toLowerCase().trim();
    target.clientDocuments = target.clientDocuments.filter(
      (cd) => cd.name.toLowerCase().trim() !== dName
    );
  }

  // Tambahkan catatan resmi dari konsultan
  const staffName = adminProfile?.name || target.assignedAdminName || "Konsultan PIC";
  const noteMessage = deliverable.notes?.trim()
    ? `Konsultan mengunggah berkas deliverable: "${deliverable.name}". Catatan: "${deliverable.notes.trim()}"`
    : `Konsultan mengunggah berkas deliverable resmi: "${deliverable.name}".`;

  const noteEntry: Correspondence = {
    id: `staff-deliv-${Date.now()}`,
    sender: staffName,
    role: "Konsultan",
    date: nowFormatted,
    message: noteMessage,
  };
  target.correspondences = [noteEntry, ...(target.correspondences || [])];

  // Sinkronkan juga ke addStoredDocument agar masuk ke vault dokumen klien
  const docType = (deliverable.name.toLowerCase().endsWith(".xlsx") || deliverable.name.toLowerCase().endsWith(".xls"))
    ? "XLSX"
    : (deliverable.name.toLowerCase().endsWith(".docx") || deliverable.name.toLowerCase().endsWith(".doc"))
    ? "DOC"
    : "PDF";

  addStoredDocument({
    id: `doc-deliv-${Date.now()}`,
    ticketId: target.id,
    clientName: target.clientName || "Klien Terdaftar",
    clientNpwp: "-",
    clientEmail: target.clientEmail,
    fileName: deliverable.name,
    fileSize: deliverable.size,
    fileType: docType,
    category: (target.category as AdminUploadedDocument["category"]) || "Tax Service Core",
    invoiceNumber: "-",
    amount: "-",
    billingStatus: "Lunas",
    uploadDate: nowFormatted,
    consultant: staffName,
    sha256: Math.random().toString(36).substring(2, 15),
    downloadUrl: deliverable.downloadUrl || "#",
  });

  tickets[index] = target;
  saveStoredClientTickets(tickets);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("zhou_tickets_updated", { detail: { ticketId: target.id } }));
  }

  return {
    success: true,
    message: `Berkas deliverable "${deliverable.name}" berhasil dikirimkan ke Klien.`,
    ticket: target,
  };
}

/**
 * Memperbarui status tiket klien (metode legasi backward-compatible)
 */
export function updateStoredClientTicketStatus(
  idOrCode: string | number,
  status: "Completed" | "In Progress" | "Pending" | string,
  progress?: number
): ClientTicket[] {
  const current = getStoredClientTickets();
  const searchKey = String(idOrCode).trim().toLowerCase();
  const normalized = normalizeConsultationStatus(status);
  const updated = current.map((t) => {
    const tId = t.id.trim().toLowerCase();
    const numOnly = t.id.replace(/\D/g, "");
    if (tId === searchKey || numOnly === searchKey || t.title.trim().toLowerCase() === searchKey) {
      const isDone = normalized === "Selesai";
      return {
        ...t,
        status: normalized,
        progress: progress !== undefined ? progress : isDone ? 100 : 50,
      };
    }
    return t;
  });
  saveStoredClientTickets(updated);
  return updated;
}

/**
 * Mengubah ClientTicket menjadi format ConsultationItem untuk Dashboard Admin & Superadmin
 */
export function convertTicketToConsultationItem(ticket: ClientTicket): ConsultationItem {
  const sLower = ticket.status.toLowerCase();
  const normalizedStatus =
    sLower.includes("selesai") || sLower === "completed"
      ? "COMPLETED"
      : sLower.includes("proses") ||
        sLower.includes("klien") ||
        sLower.includes("ditugaskan") ||
        sLower === "in progress" ||
        sLower === "in_progress"
      ? "IN_PROGRESS"
      : "PENDING";

  const numId = parseInt(ticket.id.replace(/\D/g, ""), 10) || 999;

  // Gabungkan dokumen deliverable dan dokumen pendukung klien agar statistik dokumen akurat
  const allDocs = [
    ...(ticket.deliverables || []).map((d, idx) => ({
      id: idx + 1,
      project_id: numId,
      file_name: d.name,
      file_path: d.downloadUrl || "#",
      file_size: d.size,
      file_type: d.type,
      created_at: new Date().toISOString(),
    })),
    ...(ticket.clientDocuments || []).map((d, idx) => ({
      id: 100 + idx,
      project_id: numId,
      file_name: d.name,
      file_path: "#",
      file_size: d.size,
      file_type: d.type,
      created_at: d.uploadedAt || new Date().toISOString(),
    })),
  ];

  const picName = ticket.assignedAdminName || ticket.consultant || "Belum Ditetapkan";

  return {
    id: numId,
    project_code: ticket.id,
    client_id: 1,
    title: ticket.title,
    description: ticket.description || `Divisi: ${ticket.category}. PIC: ${picName} (${ticket.assignedAdminEmail || "-"}). Estimasi: ${ticket.estimatedCompletion}.`,
    status: normalizedStatus,
    progress_percent: ticket.status === "Selesai" ? 100 : Math.min(ticket.progress || 35, 95),
    created_at: ticket.createdAt && !isNaN(Date.parse(ticket.createdAt)) ? new Date(ticket.createdAt).toISOString() : new Date().toISOString(),
    client: {
      id: 1,
      name: ticket.clientName || "Klien Terdaftar",
      email: ticket.clientEmail || "klien@perusahaan.com",
      company_name: ticket.clientCompany || "Perusahaan Klien",
    },
    service: {
      service_name: ticket.category,
      category: ticket.category,
    },
    tasks: (ticket.milestones || []).map((m, idx) => ({
      id: idx + 1,
      project_id: numId,
      task_name: m.title,
      is_completed: m.status === "completed",
    })),
    documents: allDocs,
  };
}

let memoryDocuments: AdminUploadedDocument[] = [];

/**
 * Membaca dokumen yang diunggah Admin untuk klien (in-memory)
 */
export function getStoredDocuments(): AdminUploadedDocument[] {
  return memoryDocuments.filter(
    (d) => !isDummyDocumentRecord(d) && (!d.ticketId || !isTicketDeleted(d.ticketId))
  );
}

/**
 * Menyimpan daftar dokumen dan mentrigger event sinkronisasi ke user vault (in-memory)
 */
export function saveStoredDocuments(docs: AdminUploadedDocument[]): void {
  memoryDocuments = docs;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(DOCUMENTS_UPDATED_EVENT));
  }
}

/**
 * Menambahkan dokumen baru dari Admin ke Vault klien dan memperbarui deliverable tiket terkait
 */
export function addStoredDocument(doc: AdminUploadedDocument): void {
  // Otomatis lengkapi clientEmail dan clientName dari data tiket jika belum terisi
  const enrichedDoc: AdminUploadedDocument = { ...doc };
  if ((!enrichedDoc.clientEmail || !enrichedDoc.clientName) && enrichedDoc.ticketId) {
    const tickets = getStoredClientTickets();
    const t = tickets.find((tk) => tk.id.toLowerCase() === enrichedDoc.ticketId.toLowerCase());
    if (t) {
      if (!enrichedDoc.clientEmail && t.clientEmail) {
        enrichedDoc.clientEmail = t.clientEmail;
      }
      if (!enrichedDoc.clientName && t.clientName) {
        enrichedDoc.clientName = t.clientName;
      }
    }
  }

  const current = getStoredDocuments();
  const filtered = current.filter((d) => d.id.toLowerCase() !== enrichedDoc.id.toLowerCase());
  const updated = [enrichedDoc, ...filtered];
  saveStoredDocuments(updated);

  // Jika dokumen dihubungkan ke ID tiket tertentu, tambahkan juga ke deliverables tiket tersebut
  if (doc.ticketId) {
    const tickets = getStoredClientTickets();
    const targetIdx = tickets.findIndex(
      (t) => t.id.toLowerCase() === doc.ticketId.toLowerCase()
    );
    if (targetIdx !== -1) {
      const target = tickets[targetIdx];
      const newDeliverable: Deliverable = {
        id: `deliv-${doc.id}`,
        name: doc.fileName,
        type: doc.fileType,
        size: doc.fileSize,
        date: doc.uploadDate,
        status: "Tersedia",
        downloadUrl: doc.downloadUrl || "#",
      };
      const existingDelivs = target.deliverables || [];
      if (!existingDelivs.some((d) => d.name.toLowerCase() === doc.fileName.toLowerCase())) {
        target.deliverables = [newDeliverable, ...existingDelivs];
        target.progress = Math.min(100, (target.progress || 25) + 25);
        tickets[targetIdx] = target;
        saveStoredClientTickets(tickets);
      }
    }
  }
}

/**
 * Membaca dokumen yang diunggah Admin khusus untuk akun Klien yang sedang login.
 * Memastikan dokumen milik Klien A tidak dapat dilihat oleh Klien B.
 */
export function getDocumentsForClient(
  clientEmail?: string | null,
  clientName?: string | null
): AdminUploadedDocument[] {
  const allDocs = getStoredDocuments();
  if (!clientEmail && !clientName) return [];

  const cleanEmail = clientEmail ? clientEmail.toLowerCase().trim() : "";
  const cleanName = clientName ? clientName.toLowerCase().trim() : "";

  // Ambil semua tiket untuk memetakan kepemilikan dokumen berdasarkan ticketId
  const allTickets = getStoredClientTickets();
  const ticketMap = new Map<string, ClientTicket>();
  allTickets.forEach((t) => {
    if (t.id) {
      ticketMap.set(t.id.toLowerCase().trim(), t);
    }
  });

  return allDocs.filter((doc) => {
    const docEmail = String(doc.clientEmail || "").toLowerCase().trim();
    const docName = String(doc.clientName || "").toLowerCase().trim();

    // 1. Cek relasi kepemilikan melalui ticketId
    if (doc.ticketId) {
      const ticket = ticketMap.get(doc.ticketId.toLowerCase().trim());
      if (ticket) {
        const tEmail = String(ticket.clientEmail || "").toLowerCase().trim();
        const tName = String(ticket.clientName || "").toLowerCase().trim();

        // Jika email tiket cocok
        if (cleanEmail && tEmail) {
          return tEmail === cleanEmail;
        }

        // Jika nama tiket cocok
        if (cleanName && tName) {
          return tName === cleanName || tName.includes(cleanName) || cleanName.includes(tName);
        }

        // Tiket ditemukan tetapi milik klien lain -> JANGAN izinkan
        return false;
      }
    }

    // 2. Jika dokumen memiliki clientEmail langsung
    if (cleanEmail && docEmail) {
      return docEmail === cleanEmail;
    }

    // 3. Jika dokumen memiliki clientName langsung
    if (cleanName && docName) {
      return docName === cleanName || docName.includes(cleanName) || cleanName.includes(docName);
    }

    // Dokumen tidak terikat dengan akun klien saat ini
    return false;
  });
}

/**
 * Menghapus dokumen tersimpan berdasarkan ID atau nama berkas
 */
export function deleteStoredDocument(idOrFileName: string): void {
  if (typeof window === "undefined") return;
  const current = getStoredDocuments();
  const searchKey = idOrFileName.toLowerCase().trim();
  const filtered = current.filter(
    (d) => d.id.toLowerCase() !== searchKey && d.fileName.toLowerCase() !== searchKey
  );
  saveStoredDocuments(filtered);

  // Hapus juga deliverable terkait dari tiket klien
  const tickets = getStoredClientTickets();
  let ticketsChanged = false;
  const updatedTickets = tickets.map((t) => {
    if (
      t.deliverables &&
      t.deliverables.some(
        (deliv) =>
          deliv.name.toLowerCase() === searchKey ||
          deliv.id.toLowerCase().includes(searchKey)
      )
    ) {
      ticketsChanged = true;
      return {
        ...t,
        deliverables: t.deliverables.filter(
          (deliv) =>
            deliv.name.toLowerCase() !== searchKey &&
            !deliv.id.toLowerCase().includes(searchKey)
        ),
      };
    }
    return t;
  });
  if (ticketsChanged) {
    saveStoredClientTickets(updatedTickets);
  }
}

/**
 * Menghapus seluruh dokumen yang pernah diunggah
 */
export function clearAllStoredDocuments(): void {
  if (typeof window === "undefined") return;
  saveStoredDocuments([]);
  const tickets = getStoredClientTickets();
  const updatedTickets = tickets.map((t) => ({ ...t, deliverables: [] }));
  saveStoredClientTickets(updatedTickets);
}

export const DELETED_TICKETS_KEY = "zhou_deleted_client_tickets";

let memoryDeletedTickets: string[] = [];

export function getDeletedTicketIds(): string[] {
  return [...memoryDeletedTickets];
}

export function isTicketDeleted(ticketId?: string | number | null): boolean {
  if (ticketId === undefined || ticketId === null || ticketId === "") return false;
  if (memoryDeletedTickets.length === 0) return false;

  const searchStr = String(ticketId).toLowerCase().trim();
  const numericOnly = String(ticketId).replace(/\D/g, "");

  return memoryDeletedTickets.some((id) => {
    const cleanId = String(id).toLowerCase().trim();
    if (cleanId === searchStr) return true;
    if (numericOnly && cleanId === numericOnly) return true;
    const idNum = cleanId.replace(/\D/g, "");
    if (numericOnly && idNum && numericOnly === idNum) return true;
    return false;
  });
}

/**
 * Menghapus satu tiket konsultasi berdasarkan ID / numericId
 */
export function deleteStoredClientTicket(ticketId: string | number): void {
  if (!ticketId) return;
  const rawStr = String(ticketId).toLowerCase().trim();
  const numStr = String(ticketId).replace(/\D/g, "");
  const toAdd = [rawStr, numStr].filter(Boolean);
  memoryDeletedTickets = Array.from(new Set([...memoryDeletedTickets, ...toAdd]));

  // Hapus fisik dan rekod di server database backend jika terdapat ID numerik
  const numericBackendId = parseInt(numStr, 10);
  if (!isNaN(numericBackendId) && numericBackendId > 0) {
    adminApi.deleteConsultation(numericBackendId).catch((err) => {
      console.warn("adminApi.deleteConsultation sinkronisasi:", err);
    });
  }

  const current = getStoredClientTickets();
  const filtered = current.filter((t) => !isTicketDeleted(t.id) && (!t.numericId || !isTicketDeleted(t.numericId)));
  saveStoredClientTickets(filtered);

  // Bersihkan juga dokumen deliverable vault yang terkait dengan sesi tiket yang dihapus
  try {
    const currentDocs = getStoredDocuments();
    const filteredDocs = currentDocs.filter((d) => {
      if (!d.ticketId) return true;
      if (isTicketDeleted(d.ticketId)) return false;
      const docRaw = d.ticketId.toLowerCase().trim();
      if (docRaw === rawStr || (numStr && docRaw.replace(/\D/g, "") === numStr)) return false;
      return true;
    });
    saveStoredDocuments(filteredDocs);
  } catch {}

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("zhou_tickets_cleared"));
    window.dispatchEvent(new Event(DOCUMENTS_UPDATED_EVENT));
  }
}

export const markTicketAsDeleted = deleteStoredClientTicket;

/**
 * Menghapus seluruh tiket konsultasi yang ada
 */
export function clearAllStoredClientTickets(activeTicketIds: (string | number)[] = []): void {
  const current = getStoredClientTickets();
  const toAdd: string[] = [];
  current.forEach((t) => {
    toAdd.push(t.id.toLowerCase().trim());
    if (t.numericId) toAdd.push(String(t.numericId));
    const numOnly = t.id.replace(/\D/g, "");
    if (numOnly) toAdd.push(numOnly);
  });
  activeTicketIds.forEach((id) => {
    if (id !== undefined && id !== null) {
      toAdd.push(String(id).toLowerCase().trim());
      const numOnly = String(id).replace(/\D/g, "");
      if (numOnly) toAdd.push(numOnly);
    }
  });
  memoryDeletedTickets = Array.from(new Set([...memoryDeletedTickets, ...toAdd]));
  saveStoredClientTickets([]);
  saveStoredDocuments([]);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("zhou_tickets_cleared"));
    window.dispatchEvent(new Event(DOCUMENTS_UPDATED_EVENT));
  }
}

export const markAllTicketsAsDeleted = clearAllStoredClientTickets;

export function clearDeletedTicketHistory(): void {
  memoryDeletedTickets = [];
}

export const ARCHIVED_TICKETS_KEY = "zhou_archived_client_tickets";

let memoryArchivedTickets: string[] = [];

export function getArchivedTicketIds(): string[] {
  return [...memoryArchivedTickets];
}

export function isTicketArchived(ticketId: string): boolean {
  if (!ticketId) return false;
  return memoryArchivedTickets.includes(String(ticketId).toLowerCase().trim());
}

/**
 * Mengubah status arsip (Arsip / Pulihkan dari Arsip)
 */
export function toggleArchiveClientTicket(ticketId: string, fallbackTicket?: ClientTicket): boolean {
  const searchKey = ticketId.toLowerCase().trim();
  const isCurrentlyArchived = memoryArchivedTickets.includes(searchKey);
  const nextArchivedState = !isCurrentlyArchived;

  if (nextArchivedState) {
    memoryArchivedTickets = [...memoryArchivedTickets.filter((id) => id !== searchKey), searchKey];
  } else {
    memoryArchivedTickets = memoryArchivedTickets.filter((id) => id !== searchKey);
  }

  // Panggil update arsip ke database server backend jika terdapat ID numerik
  const numId = parseInt(ticketId.replace(/\D/g, ""), 10);
  if (!isNaN(numId) && numId > 0) {
    adminApi.archiveConsultation(numId, nextArchivedState).catch((err) => {
      console.warn("adminApi.archiveConsultation sinkronisasi:", err);
    });
  }

  const tickets = getStoredClientTickets();
  const idx = tickets.findIndex((t) => t.id.toLowerCase() === searchKey);
  if (idx !== -1) {
    tickets[idx] = {
      ...tickets[idx],
      isArchived: nextArchivedState,
      archivedAt: nextArchivedState ? new Date().toISOString() : undefined,
    };
    saveStoredClientTickets(tickets);
  } else if (fallbackTicket) {
    const newEntry: ClientTicket = {
      ...fallbackTicket,
      isArchived: nextArchivedState,
      archivedAt: nextArchivedState ? new Date().toISOString() : undefined,
    };
    tickets.unshift(newEntry);
    saveStoredClientTickets(tickets);
  }

  return nextArchivedState;
}





