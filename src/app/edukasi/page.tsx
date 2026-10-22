"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { FloatingWhatsAppCTA } from "@/components/landing/FloatingWhatsAppCTA";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  BookIcon,
  CheckCircleIcon,
  ShieldTaxIcon,
  SearchIcon,
  CloseIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentIcon,
} from "@/components/icons";
import { downloadBlob, downloadRemoteFile } from "@/lib/downloadHelper";
import {
  ZHOU_ARTICLES,
  ZhouArticle,
} from "@/data/edukasiData";
import {
  getStoredZhouArticles,
  ZHOU_ARTICLES_EVENT,
  extractEducationImageAndBody,
  getSafeEducationCover,
} from "@/data/edukasiStorage";
import { isCmsItemDeleted } from "@/data/cmsDeletedStorage";
import { getCmsItemStatus, CMS_STATUS_UPDATED_EVENT } from "@/data/cmsStatusStorage";
import { publicApi, EducationItem } from "@/lib/api";

const CATEGORIES = [
  { id: "all", label: "Semua Topik" },
  { id: "coretax", label: "Coretax DJP 2026" },
  { id: "pph-ppn", label: "Kepatuhan PPh & PPN" },
  { id: "sp2dk", label: "Mitigasi SP2DK" },
  { id: "akuntansi", label: "Akuntansi SAK" },
  { id: "legal", label: "Legal Korporat" },
] as const;

interface PdfLineItem {
  text: string;
  font: "/F1" | "/F2"; // /F1 = Helvetica, /F2 = Helvetica-Bold
  size: number;
  height: number;
}

function cleanMarkdown(text: string): string {
  if (!text) return "";
  return text
    .replace(/^#+\s*/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .trim();
}

function escapePdf(str: string): string {
  if (!str) return "";
  return str
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\u2022\u2023]/g, "-")
    .replace(/[^\x20-\x7E]/g, " ");
}

function wrapText(text: string, maxCharsPerLine = 75): string[] {
  if (!text) return [];
  const clean = text.replace(/[\r\n]+/g, " ").trim();
  if (!clean) return [];

  const words = clean.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if (!word) continue;
    if ((currentLine ? currentLine + " " + word : word).length <= maxCharsPerLine) {
      currentLine = currentLine ? currentLine + " " + word : word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

function generateArticlePdf(article: ZhouArticle): string {
  const allLines: PdfLineItem[] = [];

  // 1. Header Instansi Zhou Consulting
  allLines.push({
    text: "ZHOU CONSULTING - PUSAT EDUKASI & LITERASI FISKAL",
    font: "/F2",
    size: 13,
    height: 18,
  });
  allLines.push({
    text: `Kategori: ${article.category || "Edukasi"}   |   Tanggal: ${article.date || "2026"}   |   Penulis: ${article.author || "Tim Riset Fiskal Zhou"}`,
    font: "/F1",
    size: 9,
    height: 14,
  });
  allLines.push({
    text: "------------------------------------------------------------------------------------------------------------------------",
    font: "/F1",
    size: 8,
    height: 16,
  });

  // 2. Judul Artikel
  const titleLines = wrapText(cleanMarkdown(article.title || "Materi Edukasi Perpajakan"), 55);
  for (const tLine of titleLines) {
    allLines.push({
      text: tLine,
      font: "/F2",
      size: 14,
      height: 18,
    });
  }
  allLines.push({ text: "", font: "/F1", size: 6, height: 10 });

  // 3. Ringkasan Artikel
  if (article.summary) {
    allLines.push({
      text: "RINGKASAN EKSEKUTIF:",
      font: "/F2",
      size: 10,
      height: 14,
    });
    const summaryLines = wrapText(cleanMarkdown(article.summary), 75);
    for (const sLine of summaryLines) {
      allLines.push({
        text: sLine,
        font: "/F1",
        size: 9.5,
        height: 13,
      });
    }
    allLines.push({ text: "", font: "/F1", size: 6, height: 10 });
  }

  // 4. Poin Kunci / Takeaways
  if (article.takeaways && article.takeaways.length > 0) {
    allLines.push({
      text: "POIN KUNCI TRANSISI & IMPLIKASI:",
      font: "/F2",
      size: 10,
      height: 14,
    });
    for (const takeaway of article.takeaways) {
      const takeawayLines = wrapText(cleanMarkdown(takeaway), 70);
      takeawayLines.forEach((tLine, idx) => {
        allLines.push({
          text: idx === 0 ? `[+] ${tLine}` : `    ${tLine}`,
          font: "/F1",
          size: 9,
          height: 13,
        });
      });
    }
    allLines.push({ text: "", font: "/F1", size: 6, height: 10 });
  }

  // 5. Isi Lengkap Artikel / Content
  allLines.push({
    text: "PEMBAHASAN LENGKAP ARTIKEL:",
    font: "/F2",
    size: 10,
    height: 15,
  });

  const rawParagraphs =
    article.content && article.content.length > 0
      ? article.content.flatMap((c) => (c ? c.split(/\r?\n\r?\n/) : []))
      : [article.summary || "Materi edukasi disusun langsung oleh praktisi Zhou Consulting."];

  for (const para of rawParagraphs) {
    const cleanPara = cleanMarkdown(para);
    if (!cleanPara) continue;
    const pLines = wrapText(cleanPara, 75);
    for (const pLine of pLines) {
      allLines.push({
        text: pLine,
        font: "/F1",
        size: 9.5,
        height: 13,
      });
    }
    allLines.push({ text: "", font: "/F1", size: 6, height: 8 });
  }

  // 6. Penutup Dokumen & Akreditasi Legal
  allLines.push({
    text: "------------------------------------------------------------------------------------------------------------------------",
    font: "/F1",
    size: 8,
    height: 14,
  });
  allLines.push({
    text: "Dokumen ini dipublikasikan secara resmi melalui portal edukasi Zhou Consulting.",
    font: "/F1",
    size: 8,
    height: 11,
  });
  allLines.push({
    text: "Disusun dan diverifikasi oleh Konsultan Pajak Berizin (BKP) & Akuntan Bersertifikat (CA).",
    font: "/F1",
    size: 8,
    height: 11,
  });
  allLines.push({
    text: "Informasi & Layanan: www.zhouconsulting.co.id | WhatsApp: +62 812-3456-7890",
    font: "/F1",
    size: 8,
    height: 11,
  });

  // 7. Pagination (Tinggi per halaman: 680 pt)
  const pages: PdfLineItem[][] = [];
  let currentPageLines: PdfLineItem[] = [];
  let currentHeightRemaining = 680;

  for (const line of allLines) {
    if (currentHeightRemaining - line.height < 0 && currentPageLines.length > 0) {
      pages.push(currentPageLines);
      currentPageLines = [line];
      currentHeightRemaining = 680 - line.height;
    } else {
      currentPageLines.push(line);
      currentHeightRemaining -= line.height;
    }
  }
  if (currentPageLines.length > 0) {
    pages.push(currentPageLines);
  }

  const totalPages = pages.length;

  // 8. Render PDF Stream per halaman
  const renderStream = (pageLines: PdfLineItem[], pageNum: number): string => {
    const parts: string[] = [];

    // Header atas di y = 808
    parts.push("BT");
    parts.push("/F1 8 Tf");
    parts.push("50 808 Td");
    parts.push(`(${escapePdf("ZHOU CONSULTING - ARSIP PUBLIKASI EDUKASI FISKAL")}) Tj`);
    parts.push("ET");

    // Konten mulai di y = 770
    parts.push("BT");
    parts.push("50 770 Td");
    for (let i = 0; i < pageLines.length; i++) {
      const item = pageLines[i];
      parts.push(`${item.font} ${item.size} Tf`);
      if (item.text) {
        parts.push(`(${escapePdf(item.text)}) Tj`);
      }
      if (i < pageLines.length - 1) {
        parts.push(`0 -${item.height} Td`);
      }
    }
    parts.push("ET");

    // Footer di y = 40
    parts.push("BT");
    parts.push("/F1 8 Tf");
    parts.push("50 40 Td");
    parts.push(
      `(${escapePdf(`Halaman ${pageNum} dari ${totalPages}  |  Salinan Resmi Zhou Consulting  |  Terverifikasi BKP & CA`)}) Tj`
    );
    parts.push("ET");

    return parts.join("\n");
  };

  // 9. Kompilasi Struktur PDF %PDF-1.4
  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];

  const addObj = (str: string) => {
    offsets.push(new TextEncoder().encode(pdf).length);
    pdf += str + "\n";
  };

  addObj("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj");

  const pageObjIds = pages.map((_, idx) => `${5 + idx * 2} 0 R`).join(" ");
  addObj(`2 0 obj\n<< /Type /Pages /Kids [${pageObjIds}] /Count ${totalPages} >>\nendobj`);
  addObj("3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj");
  addObj("4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj");

  for (let idx = 0; idx < totalPages; idx++) {
    const pageId = 5 + idx * 2;
    const contentId = 6 + idx * 2;
    const stream = renderStream(pages[idx], idx + 1);
    const streamLen = new TextEncoder().encode(stream).length;

    addObj(
      `${pageId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>\nendobj`
    );

    addObj(
      `${contentId} 0 obj\n<< /Length ${streamLen} >>\nstream\n${stream}\nendstream\nendobj`
    );
  }

  const totalObjs = 4 + totalPages * 2;
  const startxref = new TextEncoder().encode(pdf).length;
  pdf += `xref\n0 ${totalObjs + 1}\n0000000000 65535 f \n`;
  for (let i = 0; i < offsets.length; i++) {
    const offStr = String(offsets[i]).padStart(10, "0");
    pdf += `${offStr} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${totalObjs + 1} /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF`;

  return pdf;
}

function EducationPortalContent() {
  // Dynamic Zhou Articles from storage
  const [articlesList, setArticlesList] = useState<ZhouArticle[]>([]);

  // State for Edukasi Zhou
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeArticleModal, setActiveArticleModal] = useState<ZhouArticle | null>(null);
  const [downloadSuccessModal, setDownloadSuccessModal] = useState<string | null>(null);

  // Load articles from Backend API & state on mount and listen to updates
  useEffect(() => {
    let isMounted = true;
    setArticlesList(getStoredZhouArticles());

    // Fetch from live backend API
    publicApi
      .getEducation()
      .then((res) => {
        if (!isMounted) return;
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          const apiArticles: ZhouArticle[] = res.data
            .filter((item: EducationItem) => !isCmsItemDeleted(item.id, item.title, undefined, item.file_path))
            .map((item: EducationItem) => {
            const itemAny = item as unknown as { image?: string; image_url?: string; cover_image?: string; photo_url?: string; imageUrl?: string };
            const { image, cleanBody } = extractEducationImageAndBody(
              item.body,
              item.file_path,
              item.image || item.image_url || itemAny.cover_image || itemAny.photo_url || itemAny.imageUrl
            );
            return {
              id: `be-${item.id}`,
              numericId: item.id,
              title: item.title,
              category: item.category || "Coretax DJP 2026",
              categoryKey: (item.category?.toLowerCase().includes("pph")
                ? "pph-ppn"
                : item.category?.toLowerCase().includes("sp2dk")
                ? "sp2dk"
                : item.category?.toLowerCase().includes("akun")
                ? "akuntansi"
                : item.category?.toLowerCase().includes("leg")
                ? "legal"
                : "coretax") as ZhouArticle["categoryKey"],
              date: item.created_at
                ? new Date(item.created_at).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "2026",
              author: "Tim Riset Fiskal Zhou",
              readTime: "5 menit baca",
              summary: cleanBody.slice(0, 160) + (cleanBody.length > 160 ? "..." : ""),
              takeaways: [
                "Kepatuhan regulasi fiskal dan pembukuan komersial.",
                "Mitigasi risiko sanksi administratif dan ekualisasi data.",
              ],
              content: [cleanBody],
              status: getCmsItemStatus(`be-${item.id}`, item.title, "Published", [item.id]) === "Draft" ? "Draft" : "Published",
              image: image,
              attachment: (item.download_url || item.file_url || item.file_path)
                ? {
                    name: `${item.title.replace(/[^a-zA-Z0-9_\-]/g, "_").slice(0, 40)}.pdf`,
                    type: "PDF",
                    size: "1.5 MB",
                    url: item.download_url || item.file_url || item.file_path,
                  }
                : undefined,
            };
          });

          setArticlesList(apiArticles);
        } else if (res?.data && Array.isArray(res.data) && res.data.length === 0) {
          setArticlesList([]);
        }
      })
      .catch((err) => {
        console.warn("publicApi.getEducation fallback:", err);
      });

    const handleArticlesUpdate = () => {
      setArticlesList(getStoredZhouArticles());
    };

    window.addEventListener(ZHOU_ARTICLES_EVENT, handleArticlesUpdate);
    window.addEventListener(CMS_STATUS_UPDATED_EVENT, handleArticlesUpdate);
    window.addEventListener("storage", handleArticlesUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener(ZHOU_ARTICLES_EVENT, handleArticlesUpdate);
      window.removeEventListener(CMS_STATUS_UPDATED_EVENT, handleArticlesUpdate);
      window.removeEventListener("storage", handleArticlesUpdate);
    };
  }, []);

  // Filtered Zhou Articles
  const filteredArticles = useMemo(() => {
    const source = articlesList;
    return source.filter((item) => {
      // Sembunyikan artikel berstatus Draft dari website publik
      if (item.status && item.status !== "Published") return false;
      const matchCategory =
        selectedCategory === "all" || item.categoryKey === selectedCategory;
      const matchQuery =
        searchQuery === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchQuery;
    });
  }, [articlesList, selectedCategory, searchQuery]);

  // Featured articles list for carousel (managed by Admin)
  const featuredArticles = useMemo(() => {
    const source = articlesList;
    const published = source.filter((a) => !a.status || a.status === "Published");
    const featured = published.filter((a) => a.isFeatured !== false);
    return featured.length > 0 ? featured : published.slice(0, 3);
  }, [articlesList]);

  // Carousel Index & Swipe State
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  // Auto-slide every 6s when not hovered or paused
  useEffect(() => {
    if (featuredArticles.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % featuredArticles.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [featuredArticles.length, isPaused]);

  // Reset carousel index if list shrinks
  useEffect(() => {
    if (carouselIndex >= featuredArticles.length) {
      setCarouselIndex(0);
    }
  }, [featuredArticles.length, carouselIndex]);

  // Touch Swipe Handlers for mobile & tablet
  const minSwipeDistance = 50;
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };
  const onTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      setCarouselIndex((prev) => (prev + 1) % featuredArticles.length);
    } else if (isRightSwipe) {
      setCarouselIndex((prev) => (prev - 1 + featuredArticles.length) % featuredArticles.length);
    }
  };

  const handlePrevSlide = () => {
    setCarouselIndex((prev) => (prev - 1 + featuredArticles.length) % featuredArticles.length);
  };

  const handleNextSlide = () => {
    setCarouselIndex((prev) => (prev + 1) % featuredArticles.length);
  };

  const currentFeatured = featuredArticles[carouselIndex] || featuredArticles[0];

  const handleDownloadPdf = async (article: ZhouArticle) => {
    setDownloadSuccessModal(article.title);

    try {
      const cleanBaseName = (article.attachment?.name || article.title || "Materi_Edukasi")
        .replace(/[^a-zA-Z0-9_\-]/g, "_")
        .substring(0, 50);
      const targetFileName = cleanBaseName.toLowerCase().endsWith(".pdf")
        ? cleanBaseName
        : `${cleanBaseName}.pdf`;

      // 1. Coba minta signed download URL dari backend API jika ada ID
      const numId = article.numericId || parseInt(String(article.id).replace(/\D/g, ""), 10);
      if (numId && !isNaN(numId) && numId > 0) {
        try {
          const signRes = await publicApi.getEducationDownloadUrl(numId);
          if (signRes?.data?.download_url) {
            const dlRes = await downloadRemoteFile(signRes.data.download_url, targetFileName);
            if (dlRes.success) return;
          }
        } catch (signErr) {
          console.warn("Backend education signed download notice:", signErr);
        }
      }

      if (article.attachment?.dataUrl) {
        const link = document.createElement("a");
        link.href = article.attachment.dataUrl;
        link.download = targetFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      if (
        article.attachment?.url &&
        article.attachment.url !== "#" &&
        article.attachment.url.startsWith("http")
      ) {
        const dlRes = await downloadRemoteFile(article.attachment.url, targetFileName);
        if (dlRes.success) return;
        // Jika server host tidak dapat dihubungi, lanjut ke fallback generator
      }

      // Otomatis susun dan generate PDF resmi dari teks yang diinput / diketik superadmin
      const pdfString = generateArticlePdf(article);
      const blob = new Blob([pdfString], { type: "application/pdf" });
      downloadBlob(blob, `Zhou_Edukasi_${targetFileName}`);
    } catch (err) {
      console.error("Gagal membuat dan mengunduh berkas PDF edukasi:", err);
    } finally {
      setTimeout(() => {
        setDownloadSuccessModal(null);
      }, 4000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-text selection:bg-primary selection:text-white">
      {/* 1. Header / Navbar */}
      <Navbar />

      {/* 2. Main Content */}
      <main className="flex-1 flex flex-col">
        {/* ========================================================= */}
        {/* BAGIAN 1: PUBLIKASI UNGGULAN ZHOU CAROUSEL SHOWCASE       */}
        {/* ========================================================= */}
        {featuredArticles.length > 0 && currentFeatured && (
          <section
            aria-label="Publikasi Unggulan Zhou Carousel"
            className="py-14 md:py-20 bg-surface border-b border-primary-light"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="container-custom space-y-8">
              <div className="max-w-3xl space-y-3">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary tracking-tight">
                  Pusat Edukasi Pajak &amp; Belajar Mandiri
                </h1>
                <p className="text-body-regular text-text-secondary leading-relaxed">
                  Panduan praktis, analisis regulasi terbaru, dan materi literasi perpajakan komprehensif dari konsultan Zhou Consulting.
                </p>
              </div>

              {/* Top Carousel Navigation Bar */}
              <div className="flex items-center justify-end">

                {/* Prev / Next Buttons & Counter */}
                {featuredArticles.length > 1 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-text-secondary mr-1">
                      {carouselIndex + 1} / {featuredArticles.length}
                    </span>
                    <button
                      type="button"
                      onClick={handlePrevSlide}
                      aria-label="Artikel sebelumnya"
                      className="w-8 h-8 rounded-full border border-primary-light bg-white hover:bg-primary hover:text-white text-primary flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                    >
                      <ChevronLeftIcon className="text-xs" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextSlide}
                      aria-label="Artikel berikutnya"
                      className="w-8 h-8 rounded-full border border-primary-light bg-white hover:bg-primary hover:text-white text-primary flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                    >
                      <ChevronRightIcon className="text-xs" />
                    </button>
                  </div>
                )}
              </div>

              {/* Slide Container with Swipe Touch Listeners */}
              <div
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                className="bg-white rounded-2xl border border-primary-light p-6 md:p-8 lg:p-10 shadow-sm relative overflow-hidden transition-all duration-300"
              >
                <div
                  className={`grid grid-cols-1 ${
                    currentFeatured.image ? "lg:grid-cols-12 gap-8 items-center" : "gap-6"
                  }`}
                >
                  {/* Visual Cover Kolom Kiri (Hanya tampil jika ada gambar unggahan resmi) */}
                  {currentFeatured.image && (
                    <div className="lg:col-span-5 relative w-full h-64 sm:h-72 lg:h-84 rounded-xl overflow-hidden shadow-md group select-none bg-surface">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={currentFeatured.image}
                        alt={currentFeatured.title}
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          target.onerror = null;
                          target.src = getSafeEducationCover(currentFeatured.category, currentFeatured.id);
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/80 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute bottom-4 left-4 z-10">
                        <Badge variant="primary" size="sm" className="bg-primary text-white text-[10px]">
                          {currentFeatured.category}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* Info & Konten Kolom Kanan / Full Width jika tanpa gambar */}
                  <div className={`${currentFeatured.image ? "lg:col-span-7" : "w-full max-w-4xl"} space-y-4`}>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary">
                      <Badge variant="success" size="sm">
                        {currentFeatured.category}
                      </Badge>
                      <span>{currentFeatured.date}</span>
                      <span>{currentFeatured.readTime}</span>
                    </div>

                    <h2 className="text-xl sm:text-2xl lg:text-[26px] font-bold text-primary leading-snug">
                      {currentFeatured.title}
                    </h2>

                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                      {currentFeatured.summary}
                    </p>

                    <div className="pt-2">
                      <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                        Poin Kunci Transisi:
                      </div>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-text">
                        {currentFeatured.takeaways.slice(0, 4).map((pt, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircleIcon className="text-success text-xs flex-shrink-0 mt-0.5" />
                            <span className="leading-snug">{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-4 flex flex-wrap items-center gap-3">
                      <Button
                        variant="primary"
                        onClick={() => setActiveArticleModal(currentFeatured)}
                        className="text-xs font-semibold px-5 shadow-sm"
                      >
                        <span>Baca Artikel</span>
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => handleDownloadPdf(currentFeatured)}
                        className="text-xs font-semibold px-4 border-primary/30 hover:border-primary text-primary"
                      >
                        Unduh
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Dot Indicators at the bottom */}
                {featuredArticles.length > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-6 border-t border-primary-light/60 mt-6">
                    {featuredArticles.map((art, idx) => (
                      <button
                        key={art.id || idx}
                        type="button"
                        onClick={() => setCarouselIndex(idx)}
                        aria-label={`Lihat slide ${idx + 1}: ${art.title}`}
                        className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                          carouselIndex === idx
                            ? "w-8 bg-primary shadow-xs"
                            : "w-2 bg-primary-light hover:bg-primary/50"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

            {/* Katalog Artikel Edukasi Zhou (Filter & Grid Terpadu) */}
            <section id="katalog-artikel" className="py-14 md:py-20 bg-white border-b border-primary-light scroll-mt-20">
              <div className="container-custom space-y-8">
                {/* Header & Filter Search Toolbar */}
                <div className="space-y-6">
                  {/* Title & Description */}
                  <div className="space-y-1 max-w-2xl">
                    <h2 className="text-xl sm:text-2xl font-bold text-primary tracking-tight">
                      Katalog Edukasi Praktisi Zhou Consulting
                    </h2>
                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                      Materi dan telaah regulasi yang disusun langsung oleh konsultan pajak berizin (BKP) dan akuntan bersertifikat (CA).
                    </p>
                  </div>

                  {/* Category Filter Pills & Search Bar (Sejajar) */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Category Filter Pills */}
                    <div className="flex flex-wrap items-center gap-2">
                      {CATEGORIES.map((cat) => {
                        const isActive = selectedCategory === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer ${
                              isActive
                                ? "bg-primary text-white shadow-sm"
                                : "bg-white text-text-secondary border border-primary-light hover:border-silver hover:text-primary"
                            }`}
                          >
                            {cat.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Search Bar Input */}
                    <div className="relative w-full md:w-80 shrink-0">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary">
                        <SearchIcon className="text-xs" />
                      </div>
                      <Input
                        type="text"
                        placeholder="Cari artikel / perihal regulasi..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-9 text-xs bg-white h-9"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery("")}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary hover:text-primary"
                          aria-label="Hapus pencarian"
                        >
                          <CloseIcon className="text-xs" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sub-header counter */}
                <div className="flex items-center justify-between pt-2 border-t border-primary-light">
                  <h3 className="text-base sm:text-lg font-bold text-primary">
                    Daftar Artikel ({filteredArticles.length})
                  </h3>
                  <span className="text-xs text-text-secondary font-medium">
                    Ditulis oleh Tim Konsultan Zhou
                  </span>
                </div>

                {filteredArticles.length === 0 ? (
                  <div className="p-12 text-center bg-surface rounded-xl border border-primary-light space-y-3">
                    <BookIcon className="text-3xl text-silver mx-auto" />
                    <h3 className="text-base font-semibold text-primary">
                      {articlesList.length === 0
                        ? "Belum Ada Artikel yang Dipublikasikan"
                        : "Tidak Ada Artikel yang Ditemukan"}
                    </h3>
                    <p className="text-xs text-text-secondary max-w-sm mx-auto">
                      {articlesList.length === 0
                        ? "Modul dan materi literasi perpajakan resmi akan tampil otomatis setelah ditambahkan oleh admin melalui dashboard."
                        : "Coba ganti kata kunci pencarian atau pilih kategori topik lain untuk melihat artikel literasi fiskal."}
                    </p>
                    {articlesList.length > 0 && (
                      <Button
                        variant="silver"
                        size="sm"
                        onClick={() => {
                          setSelectedCategory("all");
                          setSearchQuery("");
                        }}
                        className="text-xs"
                      >
                        Reset Filter &amp; Pencarian
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredArticles.map((article) => (
                      <Card
                        key={article.id}
                        className="rounded-xl border-primary-light bg-white hover:border-primary hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden"
                      >
                        {article.image && (
                          <div className="relative w-full h-44 overflow-hidden bg-surface border-b border-primary-light shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={article.image}
                              alt={article.title}
                              onError={(e) => {
                                const target = e.currentTarget as HTMLImageElement;
                                target.onerror = null;
                                target.src = getSafeEducationCover(article.category, article.id);
                              }}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <CardHeader className="space-y-3 pb-3">
                          <div className="flex items-center justify-between text-xs text-text-secondary">
                            <Badge variant="outline" size="sm" className="text-[10px] border-primary-light">
                              {article.category}
                            </Badge>
                            <span className="text-[11px]">
                              {article.readTime}
                            </span>
                          </div>
                          <div>
                            <CardTitle className="text-sm sm:text-base font-bold text-primary leading-snug line-clamp-2">
                              {article.title}
                            </CardTitle>
                            <CardDescription className="text-xs text-text-secondary mt-1.5 line-clamp-3 leading-relaxed">
                              {article.summary}
                            </CardDescription>
                          </div>
                        </CardHeader>

                        <CardContent className="pt-0 flex-1 space-y-2">
                          <div className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                            Poin Penting:
                          </div>
                          <ul className="space-y-1.5 text-xs text-text">
                            {article.takeaways.slice(0, 2).map((takeaway, tIdx) => (
                              <li key={tIdx} className="flex items-start gap-2">
                                <CheckCircleIcon className="text-success text-xs flex-shrink-0 mt-0.5" />
                                <span className="line-clamp-2 leading-tight">{takeaway}</span>
                              </li>
                            ))}
                          </ul>

                          {article.attachment && (
                            <div className="pt-2">
                              <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-primary bg-primary-light px-2.5 py-1 rounded-md border border-primary/20">
                                <DocumentIcon className="text-[10px]" />
                                <span className="truncate max-w-[180px]">{article.attachment.name}</span>
                                <span className="text-text-secondary text-[9px]">({article.attachment.size})</span>
                              </div>
                            </div>
                          )}
                        </CardContent>

                        <CardFooter className="pt-3 border-t border-primary-light/60 flex items-center justify-between gap-2">
                          <span className="text-[11px] text-text-secondary">
                            {article.date}
                          </span>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadPdf(article)}
                              className="text-xs px-2.5 h-8 border-primary/30 hover:border-primary text-primary"
                            >
                              Unduh
                            </Button>
                            <Button
                              variant="card-action"
                              size="sm"
                              onClick={() => setActiveArticleModal(article)}
                              className="w-auto px-3 text-xs h-8"
                            >
                              <span>Baca Artikel</span>
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </section>


      </main>

      {/* 3. Floating WhatsApp CTA */}
      <FloatingWhatsAppCTA />

      {/* 4. Footer Korporat */}
      <Footer />

      {/* Interactive Article Reader Modal */}
      {activeArticleModal && (
        <Dialog
          open={!!activeArticleModal}
          onOpenChange={(open) => !open && setActiveArticleModal(null)}
        >
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-white p-6 sm:p-8 rounded-xl border-primary-light">
            <DialogHeader className="space-y-3 pb-2 border-b border-primary-light">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="success" size="sm">
                  {activeArticleModal.category}
                </Badge>
                <span className="text-xs text-text-secondary">
                  {activeArticleModal.date}
                </span>
                <span className="text-xs text-text-secondary">
                  {activeArticleModal.readTime}
                </span>
              </div>
              <DialogTitle className="text-lg sm:text-xl font-bold text-primary leading-snug">
                {activeArticleModal.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-text-secondary">
                Penulis: <strong className="text-primary font-semibold">{activeArticleModal.author}</strong>
              </DialogDescription>
            </DialogHeader>

            {activeArticleModal.image && (
              <div className="relative w-full h-48 sm:h-64 rounded-xl overflow-hidden border border-primary-light my-2 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeArticleModal.image}
                  alt={activeArticleModal.title}
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.onerror = null;
                    target.src = getSafeEducationCover(activeArticleModal.category, activeArticleModal.id);
                  }}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="space-y-4 py-3 text-xs sm:text-sm text-text leading-relaxed">
              {/* Takeaways Box */}
              <div className="bg-surface rounded-lg p-4 border border-primary-light space-y-2">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldTaxIcon className="text-xs text-primary" />
                  <span>Poin Kunci &amp; Implikasi Regulasi</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-text">
                  {activeArticleModal.takeaways.map((takeaway, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircleIcon className="text-success text-xs flex-shrink-0 mt-0.5" />
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Full Content Paragraphs */}
              <div className="space-y-3 pt-1">
                {activeArticleModal.content.map((para, idx) => (
                  <p key={idx} className="leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>

              {/* Module Document Attachment if present */}
              {activeArticleModal.attachment && (
                <div className="p-3.5 bg-surface rounded-xl border border-primary-light flex items-center justify-between gap-3 text-xs mt-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary-light text-primary flex items-center justify-center shrink-0">
                      <DocumentIcon className="text-sm" />
                    </div>
                    <div>
                      <span className="font-bold text-primary block">{activeArticleModal.attachment.name}</span>
                      <span className="text-[11px] text-text-secondary">
                        Format {activeArticleModal.attachment.type} Modul &bull; {activeArticleModal.attachment.size}
                      </span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadPdf(activeArticleModal)}
                    className="text-xs h-8 px-3 border-primary/40 text-primary hover:border-primary shrink-0"
                  >
                    Unduh
                  </Button>
                </div>
              )}
            </div>

            <DialogFooter className="pt-4 border-t border-primary-light flex flex-col sm:flex-row items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownloadPdf(activeArticleModal)}
                className="w-full sm:w-auto text-xs font-semibold border-primary/30 text-primary hover:border-primary"
              >
                Unduh PDF
              </Button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Button variant="primary" size="sm" asChild className="text-xs font-semibold">
                  <Link href="/#kontak">Konsultasikan Isu Ini</Link>
                </Button>
                <DialogClose asChild>
                  <Button variant="silver" size="sm" className="text-xs">
                    Tutup
                  </Button>
                </DialogClose>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Download Notification Toast Simulation */}
      {downloadSuccessModal && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-24 right-6 z-50 bg-primary-dark text-white p-4 rounded-xl border border-white/20 shadow-2xl max-w-sm animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          <div className="flex items-start gap-3">
            <CheckCircleIcon className="text-success text-base shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="text-xs font-bold text-white">
                Dokumen Sedang Diunduh
              </div>
              <div className="text-[11px] text-silver line-clamp-2">
                Salinan PDF: &ldquo;{downloadSuccessModal}&rdquo;
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EducationPortalPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <EducationPortalContent />
    </Suspense>
  );
}
