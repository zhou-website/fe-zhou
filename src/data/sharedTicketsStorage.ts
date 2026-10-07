import { ConsultationItem, ClientDocumentItem } from "@/lib/api";

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

export interface ClientTicket {
  id: string;
  title: string;
  category: string;
  consultant: string;
  status: "In Progress" | "Completed" | "Pending" | string;
  progress: number;
  createdAt: string;
  estimatedCompletion: string;
  milestones: Milestone[];
  deliverables: Deliverable[];
  correspondences: Correspondence[];
  clientName?: string;
  clientEmail?: string;
  clientCompany?: string;
}

export interface AdminUploadedDocument {
  id: string;
  ticketId: string;
  clientName: string;
  clientNpwp: string;
  fileName: string;
  fileSize: string;
  fileType: "PDF" | "XLSX";
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

export const TICKETS_UPDATED_EVENT = "zhou_tickets_updated";
export const DOCUMENTS_UPDATED_EVENT = "zhou_documents_updated";

/**
 * Membaca tiket kustom / booking yang dibuat pengguna
 */
export function getStoredClientTickets(): ClientTicket[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(TICKETS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
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
 * Menambahkan tiket baru (booking dari landing page atau dashboard user)
 */
export function addStoredClientTicket(ticket: ClientTicket): void {
  const current = getStoredClientTickets();
  const filtered = current.filter((t) => t.id.toLowerCase() !== ticket.id.toLowerCase());
  const updated = [ticket, ...filtered];
  saveStoredClientTickets(updated);
}

/**
 * Memperbarui status tiket klien (misal ditandai selesai oleh admin)
 */
export function updateStoredClientTicketStatus(
  idOrCode: string | number,
  status: "Completed" | "In Progress" | "Pending",
  progress?: number
): ClientTicket[] {
  const current = getStoredClientTickets();
  const searchKey = String(idOrCode).trim().toLowerCase();
  const updated = current.map((t) => {
    const tId = t.id.trim().toLowerCase();
    const numOnly = t.id.replace(/\D/g, "");
    if (tId === searchKey || numOnly === searchKey || t.title.trim().toLowerCase() === searchKey) {
      const isDone = status === "Completed";
      return {
        ...t,
        status,
        progress: progress !== undefined ? progress : isDone ? 100 : 50,
        milestones: t.milestones
          ? t.milestones.map((m, idx) => ({
              ...m,
              status: isDone
                ? ("completed" as const)
                : idx === 0
                ? ("completed" as const)
                : idx === 1
                ? ("in_progress" as const)
                : ("pending" as const),
            }))
          : [],
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
  const normalizedStatus =
    ticket.status.toLowerCase().includes("selesai") || ticket.status.toLowerCase() === "completed"
      ? "COMPLETED"
      : ticket.status.toLowerCase().includes("proses") || ticket.status.toLowerCase() === "in progress"
      ? "IN_PROGRESS"
      : "PENDING";

  const numId = parseInt(ticket.id.replace(/\D/g, ""), 10) || 999;

  return {
    id: numId,
    project_code: ticket.id,
    client_id: 1,
    title: ticket.title,
    description: `Kategori: ${ticket.category}. Estimasi: ${ticket.estimatedCompletion}. Konsultan: ${ticket.consultant}`,
    status: normalizedStatus,
    progress_percent: ticket.progress || 25,
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
    tasks: ticket.milestones.map((m, idx) => ({
      id: idx + 1,
      project_id: 1,
      task_name: m.title,
      is_completed: m.status === "completed",
    })),
    documents: ticket.deliverables.map((d, idx) => ({
      id: idx + 1,
      project_id: 1,
      file_name: d.name,
      file_path: d.downloadUrl || "#",
      file_size: d.size,
      file_type: d.type,
      created_at: new Date().toISOString(),
    })),
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
    return Array.isArray(parsed) ? parsed : [];
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
