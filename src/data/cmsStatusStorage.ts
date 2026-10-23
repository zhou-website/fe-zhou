"use client";

export const CMS_STATUS_OVERRIDE_KEY = "zhou_cms_status_overrides_v1";
export const CMS_STATUS_UPDATED_EVENT = "zhou_cms_status_updated";

export type CMSPublicationStatus = "Published" | "Draft";

// Runtime state with safe client-side persistent storage
const memoryStatusOverrides: Record<string, CMSPublicationStatus> = {};

if (typeof window !== "undefined") {
  try {
    const raw = localStorage.getItem(CMS_STATUS_OVERRIDE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === "object" && parsed !== null) {
        Object.assign(memoryStatusOverrides, parsed);
      }
    }
  } catch {}
}

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
 * Membaca map seluruh override status konten (in-memory)
 */
export function getAllCmsStatusOverrides(): Record<string, CMSPublicationStatus> {
  return { ...memoryStatusOverrides };
}

/**
 * Menyimpan status publikasi (Published / Draft) untuk konten tertentu secara in-memory.
 */
export function setCmsItemStatus(
  item: {
    id?: string | number | null;
    numericId?: string | number | null;
    title?: string | null;
    code?: string | null;
    aliases?: (string | number | null | undefined)[];
  },
  status: CMSPublicationStatus
): void {
  try {
    const recordKey = (val?: string | number | null) => {
      if (!val) return;
      const norm = normalizeStr(val);
      if (norm) {
        memoryStatusOverrides[norm] = status;
        const stripped = norm.replace(/^(edu|svc|srv|reg|car|tax|app|faq|be|cfg|pos)[-_]/, "");
        if (stripped && stripped !== norm) {
          memoryStatusOverrides[stripped] = status;
        }
        if (norm.includes("_")) {
          memoryStatusOverrides[norm.replace(/_/g, "-")] = status;
        }
        if (norm.includes("-")) {
          memoryStatusOverrides[norm.replace(/-/g, "_")] = status;
        }
      }
      const slug = slugify(val);
      if (slug) {
        memoryStatusOverrides[slug] = status;
      }
    };

    recordKey(item.id);
    recordKey(item.numericId);
    recordKey(item.title);
    recordKey(item.code);
    if (item.aliases && Array.isArray(item.aliases)) {
      item.aliases.forEach((a) => recordKey(a));
    }

    if (item.numericId !== undefined && item.numericId !== null) {
      const numStr = String(item.numericId);
      recordKey(`edu-${numStr}`);
      recordKey(`svc-${numStr}`);
      recordKey(`srv-${numStr}`);
      recordKey(`reg-${numStr}`);
      recordKey(`car-${numStr}`);
      recordKey(`tax-${numStr}`);
      recordKey(`faq-${numStr}`);
      recordKey(`be-${numStr}`);
    }

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(CMS_STATUS_OVERRIDE_KEY, JSON.stringify(memoryStatusOverrides));
      } catch {}
      window.dispatchEvent(new CustomEvent(CMS_STATUS_UPDATED_EVENT, { detail: { item, status } }));
    }
  } catch (err) {
    console.error("Gagal memperbarui status publikasi CMS:", err);
  }
}

/**
 * Membaca status publikasi konten dengan fallback ke nilai bawaan.
 */
export function getCmsItemStatus(
  id?: string | number | null,
  title?: string | null,
  fallback: CMSPublicationStatus = "Published",
  extraKeys?: (string | number | null | undefined)[]
): CMSPublicationStatus {
  try {
    const keysToCheck: string[] = [];
    const addCheckKey = (val?: string | number | null) => {
      if (!val) return;
      const norm = normalizeStr(val);
      if (norm) {
        keysToCheck.push(norm);
        const stripped = norm.replace(/^(edu|svc|srv|reg|car|tax|app|faq|be|cfg|pos)-/, "");
        if (stripped && stripped !== norm) {
          keysToCheck.push(stripped);
        }
      }
      const slug = slugify(val);
      if (slug) {
        keysToCheck.push(slug);
      }
    };

    addCheckKey(id);
    addCheckKey(title);
    if (extraKeys) {
      extraKeys.forEach((k) => addCheckKey(k));
    }

    for (const key of keysToCheck) {
      if (memoryStatusOverrides[key] !== undefined) {
        return memoryStatusOverrides[key];
      }
    }

    return fallback;
  } catch {
    return fallback;
  }
}

export function clearCmsStatusStorage(): void {
  Object.keys(memoryStatusOverrides).forEach((k) => delete memoryStatusOverrides[k]);
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(CMS_STATUS_OVERRIDE_KEY);
    } catch {}
  }
}
