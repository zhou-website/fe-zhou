"use client";

import { ZHOU_ARTICLES, ZhouArticle, BelajarPajakLink, BELAJAR_PAJAK_LINKS } from "./edukasiData";
import { isCmsItemDeleted, recordDeletedCmsItem } from "./cmsDeletedStorage";

export const ZHOU_ARTICLES_STORAGE_KEY = "zhou_articles_data_v2";
export const ZHOU_ARTICLES_EVENT = "zhou_articles_updated";

export const GOV_LINKS_STORAGE_KEY = "zhou_gov_links_data_v2";
export const GOV_LINKS_EVENT = "zhou_gov_links_updated";

// In-memory runtime cache, tidak lagi menggunakan localStorage
let memoryZhouArticles: ZhouArticle[] = [];
let memoryBelajarPajakLinks: BelajarPajakLink[] = [...BELAJAR_PAJAK_LINKS];

/**
 * Ekstraksi gambar sampul dan pembersihan teks body materi edukasi.
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

  // Prioritas 1: Ambil gambar resmi dari tag khusus <!--ZHOU_IMAGE:...--> yang disematkan saat superadmin upload
  const tagMatch = cleanBody.match(/<!--ZHOU_IMAGE:(.*?)-->/);
  if (tagMatch) {
    const embedded = tagMatch[1].trim();
    if (embedded) {
      image = embedded;
    }
    cleanBody = cleanBody.replace(/<!--ZHOU_IMAGE:.*?-->\r?\n?/, "").trim();
  }

  // Prioritas 2: Markdown image ![alt](url)
  const mdMatch = cleanBody.match(/^!\[.*?\]\((.*?)\)\r?\n?/);
  if (mdMatch) {
    const mdImg = mdMatch[1].trim();
    if (mdImg && !image) {
      image = mdImg;
    }
    cleanBody = cleanBody.replace(/^!\[.*?\]\(.*?\)\r?\n?/, "").trim();
  }

  if (!image && filePath) {
    const lower = filePath.toLowerCase();
    if (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".webp") || lower.endsWith(".gif")) {
      image = filePath;
    }
  }

  // JANGAN memasang gambar otomatis/template (Unsplash dari BE default cover)
  // Hanya gunakan gambar yang benar-benar diunggah oleh superadmin
  if (image && (image.includes("unsplash.com") || image.includes("images.unsplash") || image.includes("placeholder"))) {
    image = undefined;
  }

  return { image, cleanBody };
}

/**
 * Cadangan sampul edukasi: mengembalikan string kosong agar tidak menampilkan gambar template/duplikasi
 */
export function getSafeEducationCover(category?: string, id?: string | number): string {
  return "";
}

/**
 * Menyematkan gambar sampul ke dalam kolom body
 */
export function formatEducationBodyWithImage(body: string, image?: string): string {
  const clean = body.replace(/<!--ZHOU_IMAGE:.*?-->\r?\n?/, "").trim();
  if (!image) return clean;
  return `<!--ZHOU_IMAGE:${image}-->\n${clean}`;
}

/**
 * Kompresi dan resize gambar di browser client via HTML5 Canvas
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
 * Mendapatkan daftar artikel/modul edukasi (in-memory)
 */
export function getStoredZhouArticles(): ZhouArticle[] {
  return memoryZhouArticles
    .filter((item) => !isCmsItemDeleted(item.id, item.title))
    .map((item, idx) => ({
      ...item,
      isFeatured: item.isFeatured !== undefined ? item.isFeatured : idx < 3,
    }));
}

/**
 * Menyimpan daftar artikel/modul ke in-memory dan mentrigger event pembaruan
 */
export function saveStoredZhouArticles(articles: ZhouArticle[]): void {
  memoryZhouArticles = articles;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(ZHOU_ARTICLES_EVENT, { detail: articles }));
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
  const existingIndex = current.findIndex((item) => item.id === id);

  if (existingIndex !== -1) {
    const updated = current.map((item) => {
      if (item.id === id) {
        return { ...item, ...changes };
      }
      return item;
    });
    saveStoredZhouArticles(updated);
    return updated;
  } else {
    const upserted: ZhouArticle = {
      id,
      title: changes.title || id,
      category: changes.category || "Coretax DJP 2026",
      categoryKey: changes.categoryKey || "coretax",
      date: changes.date || new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }),
      author: changes.author || "Tim Riset Fiskal Zhou",
      readTime: changes.readTime || "5 menit baca",
      summary: changes.summary || "",
      takeaways: changes.takeaways || [],
      content: changes.content || [],
      status: changes.status || "Published",
      image: changes.image,
      isFeatured: changes.isFeatured ?? true,
      attachment: changes.attachment,
    };
    const updated = [upserted, ...current];
    saveStoredZhouArticles(updated);
    return updated;
  }
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
 * Mengubah status Unggulan Carousel
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
  memoryZhouArticles = [...ZHOU_ARTICLES];
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(ZHOU_ARTICLES_EVENT, { detail: ZHOU_ARTICLES }));
  }
  return ZHOU_ARTICLES;
}

export function getStoredBelajarPajakLinks(): BelajarPajakLink[] {
  return memoryBelajarPajakLinks.filter((l) => !isCmsItemDeleted(l.id, l.title, undefined, l.url));
}

export function saveStoredBelajarPajakLinks(links: BelajarPajakLink[]): void {
  memoryBelajarPajakLinks = links;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(GOV_LINKS_EVENT, { detail: links }));
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

export function clearAllStoredZhouArticles(): void {
  memoryZhouArticles = [];
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(ZHOU_ARTICLES_EVENT, { detail: [] }));
  }
}

export function clearAllStoredBelajarPajakLinks(): void {
  memoryBelajarPajakLinks = [];
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(GOV_LINKS_EVENT, { detail: [] }));
  }
}
