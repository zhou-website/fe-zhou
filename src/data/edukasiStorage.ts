"use client";

import { ZHOU_ARTICLES, ZhouArticle } from "./edukasiData";

export const ZHOU_ARTICLES_STORAGE_KEY = "zhou_articles_data";
export const ZHOU_ARTICLES_EVENT = "zhou_articles_updated";

/**
 * Mendapatkan daftar artikel/modul edukasi Zhou Consulting.
 * Jika tersedia di localStorage, gunakan data tersebut. Jika belum, gunakan data default.
 */
export function getStoredZhouArticles(): ZhouArticle[] {
  if (typeof window === "undefined") {
    return ZHOU_ARTICLES;
  }

  try {
    const raw = localStorage.getItem(ZHOU_ARTICLES_STORAGE_KEY);
    if (!raw) {
      // Inisialisasi awal ke localStorage
      localStorage.setItem(ZHOU_ARTICLES_STORAGE_KEY, JSON.stringify(ZHOU_ARTICLES));
      return ZHOU_ARTICLES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return ZHOU_ARTICLES;
  } catch (error) {
    console.error("Gagal membaca zhou_articles_data dari localStorage:", error);
    return ZHOU_ARTICLES;
  }
}

/**
 * Menyimpan daftar artikel/modul ke localStorage dan mentrigger event pembaruan
 */
export function saveStoredZhouArticles(articles: ZhouArticle[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(ZHOU_ARTICLES_STORAGE_KEY, JSON.stringify(articles));
    window.dispatchEvent(new CustomEvent(ZHOU_ARTICLES_EVENT, { detail: articles }));
  } catch (error) {
    console.error("Gagal menyimpan zhou_articles_data ke localStorage:", error);
  }
}

/**
 * Menambahkan modul / materi baru (CREATE)
 */
export function addZhouArticle(
  articleData: Omit<ZhouArticle, "id"> & { id?: string }
): ZhouArticle {
  const current = getStoredZhouArticles();
  const slugId =
    articleData.id ||
    articleData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .substring(0, 30) ||
    `modul-${Date.now()}`;

  const newArticle: ZhouArticle = {
    ...articleData,
    id: slugId,
    status: articleData.status || "Published",
  };

  const updated = [newArticle, ...current];
  saveStoredZhouArticles(updated);
  return newArticle;
}

/**
 * Memperbarui modul / materi yang ada (UPDATE)
 */
export function updateZhouArticle(
  id: string,
  changes: Partial<ZhouArticle>
): ZhouArticle[] {
  const current = getStoredZhouArticles();
  const updated = current.map((item) => {
    if (item.id === id) {
      return {
        ...item,
        ...changes,
      };
    }
    return item;
  });

  saveStoredZhouArticles(updated);
  return updated;
}

/**
 * Menghapus modul / materi (DELETE)
 */
export function deleteZhouArticle(id: string): ZhouArticle[] {
  const current = getStoredZhouArticles();
  const updated = current.filter((item) => item.id !== id);
  saveStoredZhouArticles(updated);
  return updated;
}

/**
 * Mengubah status Published <-> Draft
 */
export function toggleArticleStatus(id: string): ZhouArticle[] {
  const current = getStoredZhouArticles();
  const updated = current.map((item) => {
    if (item.id === id) {
      const nextStatus: "Published" | "Draft" =
        item.status === "Published" ? "Draft" : "Published";
      return { ...item, status: nextStatus };
    }
    return item;
  });

  saveStoredZhouArticles(updated);
  return updated;
}

/**
 * Mengembalikan artikel ke data default awal
 */
export function resetZhouArticlesToDefault(): ZhouArticle[] {
  if (typeof window !== "undefined") {
    localStorage.removeItem(ZHOU_ARTICLES_STORAGE_KEY);
    localStorage.setItem(ZHOU_ARTICLES_STORAGE_KEY, JSON.stringify(ZHOU_ARTICLES));
    window.dispatchEvent(new CustomEvent(ZHOU_ARTICLES_EVENT, { detail: ZHOU_ARTICLES }));
  }
  return ZHOU_ARTICLES;
}
