/**
 * Zhou Consulting - Persistent File Storage Engine (IndexedDB)
 * Menyimpan dan mengambil berkas biner asli (.xlsx, .pdf, .docx, .zip)
 * secara persisten di peramban sehingga tidak hilang saat refresh atau navigasi halaman.
 */

// IndexedDB dinonaktifkan sesuai instruksi - seluruh berkas langsung dilayani oleh API backend
if (typeof window !== "undefined" && window.indexedDB) {
  try {
    window.indexedDB.deleteDatabase("zhou_consulting_file_vault");
  } catch {}
}

/**
 * Menyimpan berkas biner asli (No-op: IndexedDB dinonaktifkan)
 */
export async function savePersistentFileBlob(keys: string | string[], fileBlob: Blob | File): Promise<void> {
  return Promise.resolve();
}

/**
 * Mengambil berkas biner asli (No-op: langsung dilayani melalui Signed URL / Endpoint API Backend)
 */
export async function getPersistentFileBlob(key: string): Promise<Blob | undefined> {
  return Promise.resolve(undefined);
}

/**
 * Menghapus berkas dari IndexedDB jika diperlukan (No-op)
 */
export async function removePersistentFileBlob(key: string): Promise<void> {
  return Promise.resolve();
}
