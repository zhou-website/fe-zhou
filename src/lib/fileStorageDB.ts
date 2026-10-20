/**
 * Zhou Consulting - Persistent File Storage Engine (IndexedDB)
 * Menyimpan dan mengambil berkas biner asli (.xlsx, .pdf, .docx, .zip)
 * secara persisten di peramban sehingga tidak hilang saat refresh atau navigasi halaman.
 */

const DB_NAME = "zhou_consulting_file_vault";
const STORE_NAME = "uploaded_files";
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (typeof window === "undefined" || !window.indexedDB) {
    return Promise.reject(new Error("IndexedDB tidak didukung pada lingkungan ini."));
  }

  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      dbPromise = null;
      reject(request.error);
    };
  });

  return dbPromise;
}

/**
 * Menyimpan berkas biner asli ke IndexedDB
 */
export async function savePersistentFileBlob(keys: string | string[], fileBlob: Blob | File): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const db = await getDB();
    const keyList = Array.isArray(keys) ? keys : [keys];

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);

      keyList.forEach((k) => {
        if (!k) return;
        const normalizedKey = k.toLowerCase().trim();
        store.put(fileBlob, normalizedKey);
        if (k !== normalizedKey) {
          store.put(fileBlob, k);
        }
      });

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn("Gagal menyimpan berkas biner ke IndexedDB:", err);
  }
}

/**
 * Mengambil berkas biner asli dari IndexedDB berdasarkan kunci/nama berkas
 */
export async function getPersistentFileBlob(key: string): Promise<Blob | undefined> {
  if (typeof window === "undefined" || !key) return undefined;
  try {
    const db = await getDB();
    const normalizedKey = key.toLowerCase().trim();

    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(normalizedKey);

      const fallbackSearch = () => {
        try {
          const allKeysReq = store.getAllKeys();
          allKeysReq.onsuccess = () => {
            const keys = (allKeysReq.result as string[]) || [];
            const cleanTargetName = normalizedKey.includes(":")
              ? normalizedKey.split(":").pop()!.trim()
              : normalizedKey;

            const matchedKey = keys.find((k) => {
              const kNorm = String(k).toLowerCase().trim();
              if (kNorm === cleanTargetName) return true;
              if (kNorm.endsWith(`:${cleanTargetName}`)) return true;
              if (cleanTargetName.length > 4 && kNorm.includes(cleanTargetName)) return true;
              return false;
            });

            if (matchedKey) {
              const fetchReq = store.get(matchedKey);
              fetchReq.onsuccess = () => resolve((fetchReq.result as Blob) || undefined);
              fetchReq.onerror = () => resolve(undefined);
            } else {
              resolve(undefined);
            }
          };
          allKeysReq.onerror = () => resolve(undefined);
        } catch {
          resolve(undefined);
        }
      };

      req.onsuccess = () => {
        if (req.result) {
          resolve(req.result as Blob);
        } else if (key !== normalizedKey) {
          // Coba kunci asli jika pencarian normalized nihil
          const req2 = store.get(key);
          req2.onsuccess = () => {
            if (req2.result) {
              resolve(req2.result as Blob);
            } else {
              fallbackSearch();
            }
          };
          req2.onerror = () => fallbackSearch();
        } else {
          fallbackSearch();
        }
      };

      req.onerror = () => resolve(undefined);
    });
  } catch (err) {
    console.warn("Gagal membaca berkas dari IndexedDB:", err);
    return undefined;
  }
}

/**
 * Menghapus berkas dari IndexedDB jika diperlukan
 */
export async function removePersistentFileBlob(key: string): Promise<void> {
  if (typeof window === "undefined" || !key) return;
  try {
    const db = await getDB();
    const normalizedKey = key.toLowerCase().trim();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.delete(normalizedKey);
      if (key !== normalizedKey) store.delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {}
}
