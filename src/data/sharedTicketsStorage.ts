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
  consultant: string; // Teks penanggung jawab / konsultan (misal: "Linda David, S.Ak., BKP" atau "Menunggu Penugasan PIC oleh Superadmin")

  milestones: Milestone[];
  deliverables: Deliverable[];
  correspondences: Correspondence[];
}

export interface AdminUploadedDocument {
  id: string;
  ticketId: string;
  clientName: string;
  clientNpwp: string;
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
    name: "Bambang Prakoso, S.H., LL.M.",
    email: "bambang.legal@zhou.id",
    nip: "ADM-002",
    phone: "+62 812-9876-1202",
    role: "admin",
    divisions: ["Legal Compliance", "Business Advisory"],
    isActive: true,
  },
  {
    id: "ADM-003",
    name: "Dewi Lestari, S.E., Ak., CA",
    email: "dewi.akuntansi@zhou.id",
    nip: "ADM-003",
    phone: "+62 812-9876-1203",
    role: "admin",
    divisions: ["Accounting Service", "Tax Service Core"],
    isActive: true,
  },
  {
    id: "ADM-004",
    name: "Hendro Wicaksono, M.B.A.",
    email: "hendro.bisnis@zhou.id",
    nip: "ADM-004",
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
    code === "1" ||
    code === "tk-1" ||
    title.includes("pt maju") ||
    title.includes("maju makmur") ||
    title.includes("dummy") ||
    title.includes("mock") ||
    title.includes("test")
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
      let safeProgress = typeof t.progress === "number" ? t.progress : 35;
      if (normalizedStatus === "Selesai") {
        safeProgress = 100;
      } else if (safeProgress >= 100) {
        // Otomatis koreksi data historis jika status bukan selesai tetapi progres tercatat 100%
        safeProgress = normalizedStatus === "Menunggu Klien" ? 50 : 60;
      }

      // Pastikan milestone selaras dengan status
      let safeMilestones = t.milestones;
      if (Array.isArray(safeMilestones) && safeMilestones.length >= 4) {
        if (normalizedStatus === "Selesai") {
          safeMilestones = safeMilestones.map((m: Milestone) => ({ ...m, status: "completed" as const }));
        } else if (safeMilestones[3]?.status === "completed") {
          safeMilestones = safeMilestones.map((m: Milestone, idx: number) => {
            if (idx === 3) return { ...m, status: "pending" as const };
            if (idx === 2) return { ...m, status: "in_progress" as const };
            return m;
          });
        }
      }

      return {
        ...t,
        status: normalizedStatus,
        progress: safeProgress,
        milestones: safeMilestones,
        consultant: t.consultant || (t.assignedAdminName ? t.assignedAdminName : "Menunggu Penugasan PIC oleh Superadmin"),
        clientDocuments: t.clientDocuments || [],
        priority: t.priority || "Normal",
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
  const newTicket: ClientTicket = {
    ...ticket,
    status: ticket.status || "Menunggu Penugasan",
    consultant: ticket.consultant || "Menunggu Penugasan PIC oleh Superadmin",
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
  notes?: string
): ClientTicket | null {
  // Validasi PIC harus berstatus aktif
  if ("isActive" in admin && admin.isActive === false) {
    console.warn(`Penugasan ditolak: Admin ${admin.name} berstatus non-aktif.`);
    return null;
  }

  const tickets = getStoredClientTickets();
  const index = tickets.findIndex((t) => t.id.toLowerCase() === ticketId.toLowerCase());
  if (index === -1) return null;

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
  const name = String(adminUser.name || "").toLowerCase().trim();
  const id = String(adminUser.id || "").toLowerCase().trim();

  const assignedEmail = String(ticket.assignedAdminEmail || "").toLowerCase().trim();
  const assignedName = String(ticket.assignedAdminName || "").toLowerCase().trim();
  const assignedId = String(ticket.assignedAdminId || "").toLowerCase().trim();
  const consultant = String(ticket.consultant || "").toLowerCase().trim();

  // Jika tiket belum ditugaskan ke siapa-siapa, Admin biasa tidak boleh mengakses
  if (!assignedEmail && !assignedId && !assignedName && consultant.includes("Menunggu")) {
    return false;
  }

  return (
    (Boolean(assignedEmail) && assignedEmail === email) ||
    (Boolean(assignedId) && assignedId === id) ||
    (Boolean(assignedName) && assignedName === name) ||
    (Boolean(consultant) && consultant === name)
  );
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
 * Membaca tiket milik akun Klien yang sedang login
 */
export function getTicketsForClient(clientEmail?: string | null): ClientTicket[] {
  const allTickets = getStoredClientTickets();
  if (!clientEmail || clientEmail.trim() === "") return allTickets;
  const cleanEmail = clientEmail.toLowerCase().trim();
  return allTickets.filter((t) => {
    const cEmail = String(t.clientEmail || "").toLowerCase().trim();
    return !cEmail || cEmail === cleanEmail;
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

  const newStatus = updates.status || target.status;
  let newProgress: number;

  if (newStatus === "Selesai") {
    newProgress = 100;
  } else if (updates.progress !== undefined) {
    if (updates.progress >= 100) {
      // Jika status bukan selesai tetapi progres dikirim >= 100 (misal sisa dari status Selesai sebelumnya),
      // otomatis turunkan dan sesuaikan dengan status aktualnya.
      newProgress = newStatus === "Menunggu Klien" ? 50 : 60;
    } else {
      newProgress = Math.min(Math.max(updates.progress, 5), 95);
    }
  } else {
    // updates.progress tidak ditentukan
    if (target.progress && target.progress < 100) {
      newProgress = target.progress;
    } else {
      newProgress = newStatus === "Menunggu Klien" ? 50 : 60;
    }
  }

  // Sinkronkan milestones agar sesuai dengan status baru
  let updatedMilestones: Milestone[] = (target.milestones && target.milestones.length > 0)
    ? [...target.milestones]
    : [];

  if (updatedMilestones.length >= 4) {
    if (newStatus === "Selesai") {
      updatedMilestones = updatedMilestones.map((m) => ({
        ...m,
        status: "completed" as const,
      }));
    } else {
      // Revert tahapan finalisasi jika tiket dikembalikan ke aktif / menunggu
      updatedMilestones = updatedMilestones.map((m, idx) => {
        if (idx === 0 || idx === 1) return { ...m, status: "completed" as const };
        if (idx === 2) {
          return {
            ...m,
            status: "in_progress" as const,
            title: newStatus === "Menunggu Klien" ? "Pengerjaan & Konfirmasi Klien" : "Pengerjaan & Konsultasi",
            description: newStatus === "Menunggu Klien"
              ? "Menunggu kelengkapan data atau konfirmasi dari klien."
              : "Konsultan PIC sedang menyusun kertas kerja dan analisis.",
          };
        }
        if (idx === 3) {
          return {
            ...m,
            status: "pending" as const,
            title: "Finalisasi & Penyampaian Hasil",
            description: "Penyampaian dokumen laporan deliverable resmi.",
          };
        }
        return m;
      });
    }
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
  return { success: true, message: "Status konsultasi berhasil diperbarui.", ticket: updatedTicket };
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
  const current = getStoredDocuments();
  const filtered = current.filter((d) => d.id.toLowerCase() !== doc.id.toLowerCase());
  const updated = [doc, ...filtered];
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

/**
 * Menghapus satu tiket konsultasi berdasarkan ID
 */
export function deleteStoredClientTicket(ticketId: string): void {
  if (typeof window === "undefined") return;
  const current = getStoredClientTickets();
  const searchKey = ticketId.toLowerCase().trim();
  const filtered = current.filter((t) => t.id.toLowerCase() !== searchKey);
  saveStoredClientTickets(filtered);
}

/**
 * Menghapus seluruh tiket konsultasi yang pernah diinput
 */
export function clearAllStoredClientTickets(): void {
  if (typeof window === "undefined") return;
  saveStoredClientTickets([]);
}

