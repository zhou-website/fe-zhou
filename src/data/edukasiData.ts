export interface ZhouArticleAttachment {
  name: string;
  size: string;
  type: string;
}

export interface ZhouArticle {
  id: string;
  title: string;
  category: "Coretax DJP 2026" | "Kepatuhan PPh & PPN" | "Mitigasi SP2DK" | "Akuntansi SAK" | "Legal Korporat" | string;
  categoryKey: "coretax" | "pph-ppn" | "sp2dk" | "akuntansi" | "legal" | string;
  date: string;
  readTime: string;
  author: string;
  summary: string;
  takeaways: string[];
  content: string[];
  status?: "Published" | "Draft";
  attachment?: ZhouArticleAttachment;
  isFeatured?: boolean;
  image?: string;
}

export interface BelajarPajakLink {
  id: string;
  title: string;
  institution: "DJP" | "Kemenkeu";
  institutionName: string;
  url: string;
  type: "Situs Web" | "Portal Web" | "Simulator DJP" | "Video Tutorial" | "E-Learning" | "Buku Panduan (PDF)";
  badge: string;
  description: string;
  highlights: string[];
  isOfficial: boolean;
  status?: "Published" | "Draft";
  updatedAt: string;
}

export const ZHOU_ARTICLES: ZhouArticle[] = [];

export const BELAJAR_PAJAK_LINKS: BelajarPajakLink[] = [];
