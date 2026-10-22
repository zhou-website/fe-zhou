/**
 * Zhou Consulting - Direct Backend Storage Engine
 * Penggunaan IndexedDB dinonaktifkan agar seluruh berkas dan dokumen
 * langsung menggunakan endpoint resmi dan signed URL dari Backend API.
 */

if (typeof window !== "undefined" && window.indexedDB) {
  try {
    indexedDB.deleteDatabase("zhou_consulting_file_vault");
  } catch {}
}

/**
 * Menyimpan berkas: dinonaktifkan (langsung dikirim ke backend API)
 */
export async function savePersistentFileBlob(_keys: string | string[], _fileBlob: Blob | File): Promise<void> {
  return;
}

/**
 * Mengambil berkas: mengembalikan undefined agar sistem langsung menggunakan URL download backend
 */
export async function getPersistentFileBlob(_key: string): Promise<Blob | undefined> {
  return undefined;
}

/**
 * Menghapus berkas: dinonaktifkan
 */
export async function removePersistentFileBlob(_key: string): Promise<void> {
  return;
}
