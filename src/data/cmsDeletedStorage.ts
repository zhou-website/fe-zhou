"use client";

export const CMS_DELETED_ITEMS_KEY = "zhou_deleted_cms_items_v3";
export const CMS_DELETED_ITEMS_EVENT = "zhou_deleted_cms_items_updated";

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
 * Membaca daftar identifier konten yang telah dihapus admin
 */
export function getDeletedCmsIdentifiers(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CMS_DELETED_ITEMS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Merekam satu atau banyak identifier dari konten yang dihapus ke dalam tombstone storage.
 * Mencakup ID asli, prefix variations, slug judul, nama/title lowercase, numeric ID, dsb.
 */
export function recordDeletedCmsItem(item: {
  id?: string | number | null;
  numericId?: string | number | null;
  title?: string | null;
  code?: string | null;
  rawId?: string | number | null;
  category?: string | null;
}): void {
  if (typeof window === "undefined") return;

  try {
    const currentList = getDeletedCmsIdentifiers();
    const set = new Set(currentList.map((s) => normalizeStr(s)));

    const addCandidate = (val?: string | number | null) => {
      if (!val) return;
      const norm = normalizeStr(val);
      if (norm) {
        set.add(norm);
        // Stripped prefix variants (misal: "edu-1" -> "1")
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

    // Tambahkan variasi prefix standar sistem
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

    const updated = Array.from(set);
    localStorage.setItem(CMS_DELETED_ITEMS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(CMS_DELETED_ITEMS_EVENT, { detail: updated }));
  } catch (err) {
    console.error("Gagal menyimpan tombstone penghapusan:", err);
  }
}

/**
 * Memeriksa apakah suatu item pernah dihapus oleh admin
 */
export function isCmsItemDeleted(
  id?: string | number | null,
  title?: string | null,
  rawId?: string | number | null,
  code?: string | null
): boolean {
  if (typeof window === "undefined") return false;

  const deletedList = getDeletedCmsIdentifiers();
  if (!deletedList || deletedList.length === 0) return false;

  const set = new Set(deletedList.map((s) => normalizeStr(s)));

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
 * Menghapus tombstone (jika diperlukan untuk restore)
 */
export function clearDeletedCmsTombstones(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(CMS_DELETED_ITEMS_KEY);
    window.dispatchEvent(new CustomEvent(CMS_DELETED_ITEMS_EVENT, { detail: [] }));
  } catch (err) {
    console.error("Gagal membersihkan tombstone:", err);
  }
}
