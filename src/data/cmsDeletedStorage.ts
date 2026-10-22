"use client";

export const CMS_DELETED_ITEMS_KEY = "zhou_deleted_cms_items_v3";
export const CMS_DELETED_ITEMS_EVENT = "zhou_deleted_cms_items_updated";

// Bersihkan sisa tombstone dari localStorage agar tidak mengganggu sinkronisasi backend
if (typeof window !== "undefined") {
  try {
    localStorage.removeItem(CMS_DELETED_ITEMS_KEY);
    localStorage.removeItem("zhou_deleted_cms_items_v2");
    localStorage.removeItem("zhou_deleted_cms_items_v1");
  } catch {}
}

export function getDeletedCmsIdentifiers(): string[] {
  return [];
}

export function recordDeletedCmsItem(_item: {
  id?: string | number | null;
  numericId?: string | number | null;
  title?: string | null;
  code?: string | null;
  rawId?: string | number | null;
  category?: string | null;
}): void {
  // Penghapusan ditangani langsung oleh endpoint backend API
}

export function isDummyCmsItem(_item?: {
  id?: string | number | null;
  title?: string | null;
  code?: string | null;
  rawId?: string | number | null;
  file_path?: string | null;
  category?: string | null;
  description?: string | null;
} | null): boolean {
  return false;
}

/**
 * Mengembalikan false agar seluruh data asli dari endpoint backend tampil apa adanya
 */
export function isCmsItemDeleted(
  _id?: string | number | null,
  _title?: string | null,
  _rawId?: string | number | null,
  _code?: string | null
): boolean {
  return false;
}

export function clearDeletedCmsTombstones(): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(CMS_DELETED_ITEMS_KEY);
      localStorage.removeItem("zhou_deleted_cms_items_v2");
      localStorage.removeItem("zhou_deleted_cms_items_v1");
    } catch {}
    window.dispatchEvent(new CustomEvent(CMS_DELETED_ITEMS_EVENT, { detail: [] }));
  }
}
