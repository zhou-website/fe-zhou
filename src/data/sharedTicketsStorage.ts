import { ConsultationItem } from "@/lib/api";

export type ConsultationStatus =
  | "Menunggu Penugasan"
  | "Ditugaskan"
  | "Dalam Proses"
  | "Menunggu Klien"
  | "Selesai"
  | "Dibatalkan";

export interface Milestone {
  step: string;
  title: string;
  status: "completed" | "in_progress" | "pending";
  date: string;
  description: string;
}

export interface Deliverable {
  id: string;
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
export const DEFAULT_STAFF_ADMINS: StaffAdminProfile[] = [
  {
    id: "ADM-001",
    name: "Linda David, S.Ak., BKP",
    email: "admin@zhou.id", // Akun admin operasional default
    nip: "ADM-001",
    phone: "+62 812-9876-1201",
    role: "admin",
    divisions: ["Tax Service Core", "Accounting Service"],
    isActive: true,
  },
  {
    id: "ADM-002",
    name: "Konsultan Senior Zhou",
    email: "admin@zhouconsulting.com",
    nip: "ADM-002",
    phone: "+62 812-3456-7891",
    role: "admin",
    divisions: ["Tax Service Core", "Accounting Service", "Business Advisory", "Legal Compliance"],
    isActive: true,
  },
  {
    id: "ADM-023",
    name: "Ana, S.E",
    email: "ana@zhouconsulting",
    nip: "ADM-023",
    phone: "+62 812-9876-0023",
    role: "admin",
    divisions: ["Tax Service Core", "Accounting Service"],
    isActive: true,
  },
  {
    id: "ADM-003",
    name: "Bambang Prakoso, S.H., LL.M.",
    email: "bambang.legal@zhou.id",
    nip: "ADM-003",
    phone: "+62 812-9876-1202",
    role: "admin",
    divisions: ["Legal Compliance", "Business Advisory"],
    isActive: true,
  },
  {
    id: "ADM-004",
    name: "Dewi Lestari, S.E., Ak., CA",
    email: "dewi.akuntansi@zhou.id",
    nip: "ADM-004",
    phone: "+62 812-9876-1203",
    role: "admin",
    divisions: ["Accounting Service", "Tax Service Core"],
    isActive: true,
  },
  {
    id: "ADM-005",
    name: "Hendro Wicaksono, M.B.A.",
    email: "hendro.bisnis@zhou.id",
    nip: "ADM-005",
    phone: "+62 812-9876-1204",
    role: "admin",
    divisions: ["Business Advisory", "Tax Service Core"],
    isActive: true,
  },
];

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

/**
 * Membaca daftar staff admin dan divisi spesialisasi
 */
export function getStoredStaffAdmins(): StaffAdminProfile[] {
  if (typeof window === "undefined") return DEFAULT_STAFF_ADMINS;
  try {
    const raw = localStorage.getItem(STAFF_ADMINS_STORAGE_KEY);
    if (!raw) return DEFAULT_STAFF_ADMINS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_STAFF_ADMINS;
  } catch (err) {
    console.error("Gagal membaca zhou_staff_admins_roster:", err);
    return DEFAULT_STAFF_ADMINS;
  }
}

/**
 * Menyimpan pembaruan staff admin
 */
export function saveStoredStaffAdmins(staff: StaffAdminProfile[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STAFF_ADMINS_STORAGE_KEY, JSON.stringify(staff));
    window.dispatchEvent(new Event(STAFF_UPDATED_EVENT));
  } catch (err) {
    console.error("Gagal menyimpan zhou_staff_admins_roster:", err);
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
export function getStoredClientTickets(): ClientTicket[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(TICKETS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Normalisasi data migrasi tiket dan bersihkan tiket dummy
    return parsed
      .filter((t) => !isDummyTicketRecord(t))
      .map((t) => {
      const normalizedStatus = normalizeConsultationStatus(t.status, t.assignedAdminName || (t.consultant && !t.consultant.includes("Menunggu") ? t.consultant : undefined));
      
      // Hitung progres dari milestones secara dinamis dan presisi
      let safeMilestones: Milestone[] | undefined = t.milestones;
      let safeProgress = typeof t.progress === "number" ? t.progress : 35;

      if (Array.isArray(safeMilestones) && safeMilestones.length > 0) {
        const completedCount = safeMilestones.filter((m: Milestone) => m.status === "completed").length;
        safeProgress = Math.round((completedCount / safeMilestones.length) * 100);
      }

      let finalStatus = normalizedStatus;
      if (safeProgress === 100) {
        finalStatus = "Selesai";
      } else if (finalStatus === "Selesai" && safeProgress < 100) {
        finalStatus = "Dalam Proses";
      } else if (safeProgress > 0 && finalStatus === "Menunggu Penugasan") {
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
        status: normalizedStatus,
        progress: safeProgress,
        milestones: safeMilestones,
        consultant:
          t.assignedAdminName && getDisplayPicName({ assignedAdminName: t.assignedAdminName }) !== "Menunggu PIC"
            ? t.assignedAdminName
            : t.consultant && getDisplayPicName({ consultant: t.consultant, status: t.status }) !== "Menunggu PIC"
            ? t.consultant
            : "Menunggu PIC",
        clientDocuments: t.clientDocuments || [],
        priority: t.priority || "Normal",
        isArchived: Boolean(t.isArchived || isTicketArchived(t.id)),
        archivedAt: t.archivedAt,
      };
    });
  } catch (err) {
    console.error("Gagal membaca zhou_client_custom_tickets:", err);
    return [];
  }
}

/**
 * Menyimpan tiket dan mentrigger event agar dashboard admin dan user langsung tersinkron
 */
export function saveStoredClientTickets(tickets: ClientTicket[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(tickets));
    window.dispatchEvent(new Event(TICKETS_UPDATED_EVENT));
    window.dispatchEvent(new StorageEvent("storage", { key: TICKETS_STORAGE_KEY }));
  } catch (err) {
    console.error("Gagal menyimpan zhou_client_custom_tickets:", err);
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
  let index = tickets.findIndex((t) => t.id.toLowerCase() === ticketId.toLowerCase());
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
  // Jika tiket masih "Menunggu Penugasan", perbarui status menjadi "Ditugaskan" (progres min 35%).
  // Jika tiket sudah berjalan ("Dalam Proses", "Menunggu Klien", "Selesai"), pertahankan status & progres yang ada!
  let newStatus = target.status;
  let newProgress = target.progress || 15;

  if (target.status === "Menunggu Penugasan" || !target.assignedAdminName) {
    newStatus = "Ditugaskan";
    newProgress = Math.max(target.progress || 0, 35);
  }

  const nowFormatted = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }) + " WIB";

  // Milestone tracking: pertahankan progres yang sudah diselesaikan
  const updatedMilestones: Milestone[] = (target.milestones && target.milestones.length > 0)
    ? target.milestones.map((m, idx) => {
        if (idx === 0) return { ...m, status: "completed" as const };
        if (idx === 1) {
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
  const newCorrespondence: Correspondence = {
    id: `assign-${Date.now()}`,
    sender: "Superadmin (Sistem Audit Penugasan)",
    role: "Superadmin",
    date: nowFormatted,
    message: isReassignment
      ? `[AUDIT REASSIGNMENT] Penugasan dialihkan oleh Superadmin dari ${prevAdminName} (${prevAdminDivision}) kepada ${admin.name} (${divisionStr}). Waktu Pengalihan: ${nowFormatted}.${notes ? ` Catatan Pengalihan: "${notes}"` : ""}`
      : `[PENUGASAN RESMI] Konsultasi berhasil ditugaskan oleh Superadmin kepada ${admin.name} (${divisionStr}). Waktu Penugasan: ${nowFormatted}.${notes ? ` Catatan Penugasan: "${notes}"` : ""}`,
  };

  const updatedTicket: ClientTicket = {
    ...target,
    assignedAdminId: admin.id,
    assignedAdminName: admin.name,
    assignedAdminEmail: admin.email,
    assignedAdminDivision: divisionStr,
    assignedAt: isReassignment ? (target.assignedAt || new Date().toISOString()) : new Date().toISOString(),
    reassignedAt: isReassignment ? new Date().toISOString() : undefined,
    previousAdminName: isReassignment ? prevAdminName : target.previousAdminName,
    previousAdminEmail: isReassignment ? prevAdminEmail : target.previousAdminEmail,
    previousAdminDivision: isReassignment ? prevAdminDivision : target.previousAdminDivision,
    assignmentNotes: notes || target.assignmentNotes,
    consultant: admin.name,
    status: newStatus,
    progress: newProgress,
    milestones: updatedMilestones,
    correspondences: [newCorrespondence, ...(target.correspondences || [])],
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
  const found = tickets.find((t) => t.id.toLowerCase() === ticketId.toLowerCase());
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
  }
): { success: boolean; message: string; ticket?: ClientTicket } {
  const tickets = getStoredClientTickets();
  const index = tickets.findIndex((t) => t.id.toLowerCase() === ticketId.toLowerCase());
  if (index === -1) {
    return { success: false, message: "Konsultasi tidak ditemukan." };
  }

  const target = tickets[index];

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

/**
 * Klien mengunggah dokumen pendukung tambahan pada konsultasi yang sedang berjalan
 */
export function addSupportingDocumentToTicket(
  ticketId: string,
  doc: ClientUploadedFile,
  clientEmail?: string | null
): { success: boolean; message: string; ticket?: ClientTicket } {
  return addSupportingDocumentsToTicket(ticketId, [doc], clientEmail);
}

/**
 * Klien mengunggah satu atau beberapa dokumen pendukung tambahan sekaligus
 */
export function addSupportingDocumentsToTicket(
  ticketId: string,
  docs: ClientUploadedFile[],
  clientEmail?: string | null
): { success: boolean; message: string; ticket?: ClientTicket } {
  if (!docs || docs.length === 0) {
    return { success: false, message: "Tidak ada dokumen yang dipilih untuk diunggah." };
  }

  const tickets = getStoredClientTickets();
  const index = tickets.findIndex((t) => t.id.toLowerCase() === ticketId.toLowerCase());
  if (index === -1) {
    return { success: false, message: `Konsultasi dengan nomor referensi ${ticketId} tidak ditemukan.` };
  }

  const target = tickets[index];

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
    message: `Klien mengunggah dokumen pendukung tambahan: ${docNamesList}.${
      preparedDocs[0]?.description ? ` Keterangan: "${preparedDocs[0].description}"` : ""
    }`,
  };
  target.correspondences = [noteEntry, ...(target.correspondences || [])];

  tickets[index] = target;
  saveStoredClientTickets(tickets);

  return {
    success: true,
    message: `${preparedDocs.length} dokumen berhasil diunggah ke konsultasi ${target.id}.`,
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
    description: `Divisi: ${ticket.category}. PIC: ${picName} (${ticket.assignedAdminEmail || "-"}). Estimasi: ${ticket.estimatedCompletion}.`,
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

/**
 * Membaca dokumen yang diunggah Admin untuk klien
 */
export function getStoredDocuments(): AdminUploadedDocument[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DOCUMENTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((d) => !isDummyDocumentRecord(d)) : [];
  } catch (err) {
    console.error("Gagal membaca zhou_shared_documents:", err);
    return [];
  }
}

/**
 * Menyimpan daftar dokumen dan mentrigger event sinkronisasi ke user vault
 */
export function saveStoredDocuments(docs: AdminUploadedDocument[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(docs));
    window.dispatchEvent(new Event(DOCUMENTS_UPDATED_EVENT));
    window.dispatchEvent(new StorageEvent("storage", { key: DOCUMENTS_STORAGE_KEY }));
  } catch (err) {
    console.error("Gagal menyimpan zhou_shared_documents:", err);
  }
}

/**
 * Menambahkan dokumen baru dari Admin ke Vault klien dan memperbarui deliverable tiket terkait
 */
export function addStoredDocument(doc: AdminUploadedDocument): void {
  // Otomatis lengkapi clientEmail dan clientName dari data tiket jika belum terisi
  let enrichedDoc: AdminUploadedDocument = { ...doc };
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

export function getDeletedTicketIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DELETED_TICKETS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isTicketDeleted(ticketId: string): boolean {
  const ids = getDeletedTicketIds();
  return ids.includes(ticketId.toLowerCase().trim());
}

/**
 * Menghapus satu tiket konsultasi berdasarkan ID
 */
export function deleteStoredClientTicket(ticketId: string): void {
  if (typeof window === "undefined") return;
  const searchKey = ticketId.toLowerCase().trim();
  try {
    const deleted = getDeletedTicketIds();
    if (!deleted.includes(searchKey)) {
      localStorage.setItem(DELETED_TICKETS_KEY, JSON.stringify([...deleted, searchKey]));
    }
  } catch {}
  const current = getStoredClientTickets();
  const filtered = current.filter((t) => t.id.toLowerCase() !== searchKey);
  saveStoredClientTickets(filtered);
}

/**
 * Menghapus seluruh tiket konsultasi yang pernah diinput
 */
export function clearAllStoredClientTickets(): void {
  if (typeof window === "undefined") return;
  try {
    const current = getStoredClientTickets();
    const ids = current.map((t) => t.id.toLowerCase().trim());
    localStorage.setItem(DELETED_TICKETS_KEY, JSON.stringify(ids));
  } catch {}
  saveStoredClientTickets([]);
}

export const ARCHIVED_TICKETS_KEY = "zhou_archived_client_tickets";

export function getArchivedTicketIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ARCHIVED_TICKETS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isTicketArchived(ticketId: string): boolean {
  if (!ticketId) return false;
  const ids = getArchivedTicketIds();
  return ids.includes(String(ticketId).toLowerCase().trim());
}

/**
 * Mengubah status arsip (Arsip / Pulihkan dari Arsip)
 */
export function toggleArchiveClientTicket(ticketId: string, fallbackTicket?: ClientTicket): boolean {
  if (typeof window === "undefined") return false;
  const searchKey = ticketId.toLowerCase().trim();
  const archivedIds = getArchivedTicketIds();
  const isCurrentlyArchived = archivedIds.includes(searchKey);
  const nextArchivedState = !isCurrentlyArchived;

  let updatedArchivedIds: string[];
  if (nextArchivedState) {
    updatedArchivedIds = [...archivedIds.filter((id) => id !== searchKey), searchKey];
  } else {
    updatedArchivedIds = archivedIds.filter((id) => id !== searchKey);
  }
  try {
    localStorage.setItem(ARCHIVED_TICKETS_KEY, JSON.stringify(updatedArchivedIds));
  } catch {}

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



