"use client";

export const CMS_STATUS_OVERRIDE_KEY = "zhou_cms_status_overrides_v1";
export const CMS_STATUS_UPDATED_EVENT = "zhou_cms_status_updated";

export type CMSPublicationStatus = "Published" | "Draft";

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
 * Membaca map seluruh override status konten dari localStorage
 */
export function getAllCmsStatusOverrides(): Record<string, CMSPublicationStatus> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(CMS_STATUS_OVERRIDE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

/**
 * Menyimpan status publikasi (Published / Draft) untuk konten tertentu.
 * Merekam ke berbagai variasi identifier agar pencocokan saat refresh selalu akurat.
 */
export function setCmsItemStatus(
  item: {
    id?: string | number | null;
    numericId?: string | number | null;
    title?: string | null;
    code?: string | null;
  },
  status: CMSPublicationStatus
): void {
  if (typeof window === "undefined") return;

  try {
    const currentMap = getAllCmsStatusOverrides();
    const updatedMap = { ...currentMap };

    const recordKey = (val?: string | number | null) => {
      if (!val) return;
      const norm = normalizeStr(val);
      if (norm) {
        updatedMap[norm] = status;
        const stripped = norm.replace(/^(edu|svc|srv|reg|car|tax|app|faq|be|cfg|pos)-/, "");
        if (stripped && stripped !== norm) {
          updatedMap[stripped] = status;
        }
      }
      const slug = slugify(val);
      if (slug) {
        updatedMap[slug] = status;
      }
    };

    recordKey(item.id);
    recordKey(item.numericId);
    recordKey(item.title);
    recordKey(item.code);

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

    localStorage.setItem(CMS_STATUS_OVERRIDE_KEY, JSON.stringify(updatedMap));
    window.dispatchEvent(new CustomEvent(CMS_STATUS_UPDATED_EVENT, { detail: { item, status } }));
    window.dispatchEvent(new StorageEvent("storage", { key: CMS_STATUS_OVERRIDE_KEY }));
  } catch (err) {
    console.error("Gagal menyimpan override status publikasi CMS:", err);
  }
}

/**
 * Membaca status publikasi konten dengan fallback ke nilai default bawaan konten.
 * Jika pernah di-set "Draft" atau "Published" oleh admin, nilai tersebut yang digunakan.
 */
export function getCmsItemStatus(
  id?: string | number | null,
  title?: string | null,
  fallback: CMSPublicationStatus = "Published",
  extraKeys?: (string | number | null | undefined)[]
): CMSPublicationStatus {
  if (typeof window === "undefined") return fallback;

  try {
    const overrides = getAllCmsStatusOverrides();

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
      if (overrides[key] !== undefined) {
        return overrides[key];
      }
    }

    return fallback;
  } catch {
    return fallback;
  }
}
