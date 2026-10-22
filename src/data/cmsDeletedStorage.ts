"use client";

export const CMS_DELETED_ITEMS_KEY = "zhou_deleted_cms_items_v3";
export const CMS_DELETED_ITEMS_EVENT = "zhou_deleted_cms_items_updated";

// Hapus data tombstone lama dari localStorage agar peramban selalu membaca data live dari backend API
if (typeof window !== "undefined") {
  try {
    localStorage.removeItem(CMS_DELETED_ITEMS_KEY);
    localStorage.removeItem("zhou_deleted_cms_items_v2");
    localStorage.removeItem("zhou_deleted_cms_items_v1");
  } catch {}
}

let memoryDeletedItems: string[] = [];

/**
 * Normalisasi string untuk pencocokan toleran
 */
function normalizeStr(str?: string | number | null): string {
  if (str === undefined || str === null) return "";
  return String(str).trim().toLowerCase();
}

function slugify(str?: string | number | null): string {
  if (!str) return "";
  return String(str)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Membaca daftar identifier konten yang telah dihapus admin (in-memory)
 */
export function getDeletedCmsIdentifiers(): string[] {
  return [...memoryDeletedItems];
}

/**
 * Merekam satu atau banyak identifier dari konten yang dihapus ke dalam in-memory cache saat runtime.
 */
export function recordDeletedCmsItem(item: {
  id?: string | number | null;
  numericId?: string | number | null;
  title?: string | null;
  code?: string | null;
  rawId?: string | number | null;
  category?: string | null;
}): void {
  try {
    const set = new Set(memoryDeletedItems.map((s) => normalizeStr(s)));

    const addCandidate = (val?: string | number | null) => {
      if (!val) return;
      const norm = normalizeStr(val);
      if (norm) {
        set.add(norm);
        const stripped = norm.replace(/^(edu|svc|srv|reg|car|tax|app|faq|be|cfg)-/, "");
        if (stripped && stripped !== norm) {
          set.add(stripped);
        }
      }
      const slug = slugify(val);
      if (slug) {
        set.add(slug);
      }
    };

    addCandidate(item.id);
    addCandidate(item.numericId);
    addCandidate(item.title);
    addCandidate(item.code);
    addCandidate(item.rawId);

    if (item.numericId !== undefined && item.numericId !== null) {
      const numStr = String(item.numericId);
      addCandidate(`edu-${numStr}`);
      addCandidate(`svc-${numStr}`);
      addCandidate(`srv-${numStr}`);
      addCandidate(`reg-${numStr}`);
      addCandidate(`car-${numStr}`);
      addCandidate(`tax-${numStr}`);
      addCandidate(`app-${numStr}`);
      addCandidate(`faq-${numStr}`);
      addCandidate(`be-${numStr}`);
    }

    memoryDeletedItems = Array.from(set);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(CMS_DELETED_ITEMS_EVENT, { detail: memoryDeletedItems }));
    }
  } catch (err) {
    console.error("Gagal mencatat penghapusan:", err);
  }
}

/**
 * Memeriksa apakah suatu konten merupakan data dummy/mockup/pengujian sebelumnya
 */
export function isDummyCmsItem(item?: {
  id?: string | number | null;
  numericId?: string | number | null;
  rawId?: string | number | null;
  title?: string | null;
  code?: string | null;
  file_path?: string | null;
  category?: string | null;
  description?: string | null;
} | null): boolean {
  if (!item) return false;
  const title = (item.title || "").toLowerCase().trim();
  const code = (item.code || "").toLowerCase().trim();
  const strId = String(item.id || "").toLowerCase().trim();

  // Kurs Pajak dan Kontak resmi Zhou Consulting tidak boleh dianggap dummy
  if (
    strId === "tax-kmk-djp" ||
    title.includes("kurs pajak") ||
    title.includes("menteri keuangan (kmk)") ||
    title.includes("portal & kontak resmi") ||
    title.includes("profil & kontak") ||
    title.includes("solusi terintegrasi perpajakan") ||
    title.includes("zhou consulting")
  ) {
    return false;
  }

  if (
    title === "dd" ||
    title === "wefc" ||
    title === "cvfds" ||
    title === "no1.e" ||
    code === "tax" ||
    code === "tyuiokm" ||
    code === "axksjfo"
  ) {
    return true;
  }

  return false;
}

/**
 * Memeriksa apakah suatu item pernah dihapus oleh admin atau merupakan data dummy
 */
export function isCmsItemDeleted(
  id?: string | number | null,
  title?: string | null,
  rawId?: string | number | null,
  code?: string | null
): boolean {
  if (isDummyCmsItem({ id, title, rawId, code })) {
    return true;
  }

  if (memoryDeletedItems.length === 0) return false;

  const set = new Set(memoryDeletedItems.map((s) => normalizeStr(s)));
  const candidates: string[] = [];

  const checkAndAdd = (val?: string | number | null) => {
    if (!val) return;
    const norm = normalizeStr(val);
    if (norm) {
      candidates.push(norm);
      const stripped = norm.replace(/^(edu|svc|srv|reg|car|tax|app|faq|be|cfg)-/, "");
      if (stripped && stripped !== norm) {
        candidates.push(stripped);
      }
    }
    const slug = slugify(val);
    if (slug) {
      candidates.push(slug);
    }
  };

  checkAndAdd(id);
  checkAndAdd(title);
  checkAndAdd(rawId);
  checkAndAdd(code);

  return candidates.some((c) => set.has(c));
}

/**
 * Menghapus tombstone dari memori
 */
export function clearDeletedCmsTombstones(): void {
  memoryDeletedItems = [];
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CMS_DELETED_ITEMS_EVENT, { detail: [] }));
  }
}
