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
 * Memeriksa apakah suatu konten merupakan data dummy/mockup/pengujian sebelumnya
 * (seperti bibit data pengujian dengan timestamp, PER-0707, lowongan dummy, dll)
 * Pengecualian: Kurs Pajak (KMK) dan Kontak resmi tidak pernah dianggap dummy.
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
  const file = (item.file_path || "").toLowerCase().trim();
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

  // Kata kunci dummy dan suite pengujian
  if (
    title.includes("dummy") ||
    title.includes("mock") ||
    title.includes("test suite") ||
    title.includes("pengujian") ||
    title.includes("updated srv") ||
    title.includes("updated title") ||
    title.includes("peraturan pengujian") ||
    title === "dd" ||
    title === "wefc" ||
    title === "cvfds" ||
    title === "no1.e" ||
    code.includes("srv-test") ||
    code.includes("job-tst") ||
    code === "tax" ||
    code === "tyuiokm" ||
    code === "axksjfo" ||
    code === "srv-7140" ||
    code === "srv-4845" ||
    file.includes("test-doc") ||
    file.includes("test-edu") ||
    file.includes("typography zhou") ||
    title.includes("pajak1") ||
    title.includes("kepatuhan pajak1") ||
    code.includes("1872") ||
    strId.includes("1872")
  ) {
    return true;
  }

  // Pola timestamp pengujian (misal: 1791...) pada judul artikel atau berkas
  if (/\b17\d{10,12}\b/.test(title) || /\b17\d{10,12}\b/.test(file)) {
    return true;
  }

  // Regulasi dummy dari seed backend
  if (
    title.includes("per-0707") ||
    title.includes("per-6211") ||
    title.includes("per-1907") ||
    title.includes("per-4681") ||
    title.includes("pmk no. 120/pmk.03/2026") ||
    title.includes("panduan praktis pengisian formulir spt 1771")
  ) {
    return true;
  }

  // Lowongan karir dummy dari seed backend & Database Talenta yang sudah dihapus
  if (
    title.includes("junior accounting staff") ||
    title.includes("senior tax consultant") ||
    title.includes("junior tax auditor") ||
    title.includes("database talenta") ||
    title.includes("talent-pool") ||
    title.includes("talent pool") ||
    title.includes("sak ep / psak") ||
    title.includes("penyusunan laporan keuangan sak ep") ||
    code === "job-acc-jr-01" ||
    code === "job-tax-sr-01" ||
    code.includes("talent") ||
    strId.includes("talent")
  ) {
    return true;
  }

  // Perikatan / Tiket dummy
  if (
    title.includes("spt tahunan badan pt maju") ||
    title.includes("pt maju makmur") ||
    code.includes("prj-tax-2026-001") ||
    strId === "1"
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
  // Saring otomatis semua data mockup/dummy yang terdeteksi
  if (isDummyCmsItem({ id, title, rawId, code })) {
    return true;
  }

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
