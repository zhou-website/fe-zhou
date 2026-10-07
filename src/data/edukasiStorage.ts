"use client";

import { ZHOU_ARTICLES, ZhouArticle } from "./edukasiData";
import { isCmsItemDeleted, recordDeletedCmsItem } from "./cmsDeletedStorage";

export const ZHOU_ARTICLES_STORAGE_KEY = "zhou_articles_data_v2";
export const ZHOU_ARTICLES_EVENT = "zhou_articles_updated";

/**
 * Ekstraksi gambar sampul dan pembersihan teks body materi edukasi.
 * Mendukung tag metadata database `<!--ZHOU_IMAGE:...-->`, markdown image, dan image file path.
 */
export function extractEducationImageAndBody(
  rawBody?: string,
  filePath?: string,
  explicitImage?: string
): {
  image?: string;
  cleanBody: string;
} {
  let image: string | undefined = explicitImage;
  let cleanBody = rawBody || "";

  // 1. Ekstrak dari metadata tag <!--ZHOU_IMAGE:...--> yang tersimpan di kolom body DB
  const tagMatch = cleanBody.match(/<!--ZHOU_IMAGE:(.*?)-->/);
  if (tagMatch) {
    if (!image) {
      image = tagMatch[1].trim();
    }
    cleanBody = cleanBody.replace(/<!--ZHOU_IMAGE:.*?-->\r?\n?/, "").trim();
  }

  // 2. Ekstrak dari markdown image di awal teks body: ![...](...)
  const mdMatch = cleanBody.match(/^!\[.*?\]\((.*?)\)\r?\n?/);
  if (mdMatch) {
    if (!image) {
      image = mdMatch[1].trim();
    }
    cleanBody = cleanBody.replace(/^!\[.*?\]\(.*?\)\r?\n?/, "").trim();
  }

  // 3. Fallback jika filePath adalah image URL atau Base64 Data URL
  if (!image && filePath) {
    const isImg =
      /\.(jpg|jpeg|png|webp|svg|gif)($|\?)/i.test(filePath) ||
      filePath.startsWith("data:image/") ||
      filePath.startsWith("http");
    if (isImg) {
      image = filePath;
    }
  }

  return { image, cleanBody };
}

/**
 * Menyematkan gambar sampul ke dalam kolom body agar tersimpan 100% di database backend
 */
export function formatEducationBodyWithImage(body: string, image?: string): string {
  const clean = body.replace(/<!--ZHOU_IMAGE:.*?-->\r?\n?/, "").trim();
  if (!image) return clean;
  return `<!--ZHOU_IMAGE:${image}-->\n${clean}`;
}

/**
 * Kompresi dan resize gambar di browser client via HTML5 Canvas
 * Mengubah foto 2MB-10MB menjadi ~60-120KB JPEG berkualitas tajam agar muat di kolom TEXT database & request body.
 */
export function compressImageFile(
  file: File,
  maxWidth = 1200,
  maxHeight = 800,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      resolve("");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Mendapatkan daftar artikel/modul edukasi Zhou Consulting.
 * Jika tersedia di localStorage, gunakan data tersebut. Jika belum, gunakan data default (kosong).
 */
export function getStoredZhouArticles(): ZhouArticle[] {
  if (typeof window === "undefined") {
    return ZHOU_ARTICLES;
  }

  try {
    const raw = localStorage.getItem(ZHOU_ARTICLES_STORAGE_KEY);
    const baseList: ZhouArticle[] = raw ? JSON.parse(raw) : ZHOU_ARTICLES;
    if (Array.isArray(baseList)) {
      return baseList
        .filter((item) => !isCmsItemDeleted(item.id, item.title))
        .map((item, idx) => ({
          ...item,
          isFeatured: item.isFeatured !== undefined ? item.isFeatured : idx < 3,
        }));
    }
    return ZHOU_ARTICLES.filter((item) => !isCmsItemDeleted(item.id, item.title));
  } catch (error) {
    console.error("Gagal membaca zhou_articles_data dari localStorage:", error);
    return ZHOU_ARTICLES.filter((item) => !isCmsItemDeleted(item.id, item.title));
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
export function deleteZhouArticle(idOrTitle: string): ZhouArticle[] {
  recordDeletedCmsItem({ id: idOrTitle, title: idOrTitle });
  const current = getStoredZhouArticles();
  const target = idOrTitle.trim().toLowerCase();
  const targetSlug = target.replace(/[^a-z0-9]+/g, "-");
  const updated = current.filter((item) => {
    if (isCmsItemDeleted(item.id, item.title)) return false;
    const itemTitle = item.title.trim().toLowerCase();
    const itemId = item.id.trim().toLowerCase();
    return (
      item.id !== idOrTitle &&
      itemId !== target &&
      itemId !== targetSlug &&
      itemTitle !== target &&
      !itemId.includes(target) &&
      !target.includes(itemId)
    );
  });
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
 * Mengubah status Unggulan Carousel (isFeatured: true <-> false)
 */
export function toggleArticleFeatured(id: string): ZhouArticle[] {
  const current = getStoredZhouArticles();
  const updated = current.map((item) => {
    if (item.id === id) {
      const currentFeatured = item.isFeatured !== undefined ? item.isFeatured : false;
      return { ...item, isFeatured: !currentFeatured };
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

export const GOV_LINKS_STORAGE_KEY = "zhou_gov_links_data_v2";
export const GOV_LINKS_EVENT = "zhou_gov_links_updated";

import { BelajarPajakLink, BELAJAR_PAJAK_LINKS } from "./edukasiData";

export function getStoredBelajarPajakLinks(): BelajarPajakLink[] {
  if (typeof window === "undefined") {
    return BELAJAR_PAJAK_LINKS;
  }
  try {
    const raw = localStorage.getItem(GOV_LINKS_STORAGE_KEY);
    const source: BelajarPajakLink[] = raw ? JSON.parse(raw) : BELAJAR_PAJAK_LINKS;
    if (Array.isArray(source)) {
      return source.filter((l) => !isCmsItemDeleted(l.id, l.title, undefined, l.url));
    }
    return BELAJAR_PAJAK_LINKS.filter((l) => !isCmsItemDeleted(l.id, l.title, undefined, l.url));
  } catch {
    return BELAJAR_PAJAK_LINKS.filter((l) => !isCmsItemDeleted(l.id, l.title, undefined, l.url));
  }
}

export function saveStoredBelajarPajakLinks(links: BelajarPajakLink[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(GOV_LINKS_STORAGE_KEY, JSON.stringify(links));
    window.dispatchEvent(new CustomEvent(GOV_LINKS_EVENT, { detail: links }));
  } catch (error) {
    console.error("Gagal menyimpan zhou_gov_links:", error);
  }
}

export function addStoredBelajarPajakLink(linkData: Omit<BelajarPajakLink, "id"> & { id?: string }): BelajarPajakLink[] {
  const current = getStoredBelajarPajakLinks();
  const newLink: BelajarPajakLink = {
    ...linkData,
    id: linkData.id || `GOV-${Date.now().toString().slice(-4)}`,
  };
  const updated = [newLink, ...current];
  saveStoredBelajarPajakLinks(updated);
  return updated;
}

export function updateStoredBelajarPajakLink(id: string, changes: Partial<BelajarPajakLink>): BelajarPajakLink[] {
  const current = getStoredBelajarPajakLinks();
  const updated = current.map((l) => (l.id === id ? { ...l, ...changes } : l));
  saveStoredBelajarPajakLinks(updated);
  return updated;
}

export function deleteStoredBelajarPajakLink(id: string): BelajarPajakLink[] {
  recordDeletedCmsItem({ id, title: id });
  const current = getStoredBelajarPajakLinks();
  const target = id.trim().toLowerCase();
  const updated = current.filter((l) => {
    if (isCmsItemDeleted(l.id, l.title, undefined, l.url)) return false;
    const lId = l.id.trim().toLowerCase();
    const lTitle = l.title.trim().toLowerCase();
    return l.id !== id && lId !== target && lTitle !== target;
  });
  saveStoredBelajarPajakLinks(updated);
  return updated;
}
