"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
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
  DownloadIcon,
  CheckCircleIcon,
  ClockIcon,
  CalendarIcon,
  ShieldTaxIcon,
  SearchIcon,
  CloseIcon,

  DocumentIcon,
} from "@/components/icons";
import {
  ZHOU_ARTICLES,
  BELAJAR_PAJAK_LINKS,
  ZhouArticle,
} from "@/data/edukasiData";
import {
  getStoredZhouArticles,
  ZHOU_ARTICLES_EVENT,
} from "@/data/edukasiStorage";

const CATEGORIES = [
  { id: "all", label: "Semua Topik" },
  { id: "coretax", label: "Coretax DJP 2026" },
  { id: "pph-ppn", label: "Kepatuhan PPh & PPN" },
  { id: "sp2dk", label: "Mitigasi SP2DK" },
  { id: "akuntansi", label: "Akuntansi SAK" },
  { id: "legal", label: "Legal Korporat" },
] as const;

function EducationPortalContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const initialTab = tabParam === "belajar-pajak" ? "belajar-pajak" : "edukasi-zhou";

  // Main Dual Mode Switcher: "edukasi-zhou" vs "belajar-pajak"
  const [mainTab, setMainTab] = useState<"edukasi-zhou" | "belajar-pajak">(initialTab);

  // Dynamic Zhou Articles from storage
  const [articlesList, setArticlesList] = useState<ZhouArticle[]>([]);

  // State for Edukasi Zhou
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeArticleModal, setActiveArticleModal] = useState<ZhouArticle | null>(null);
  const [downloadSuccessModal, setDownloadSuccessModal] = useState<string | null>(null);

  // State for Belajar Pajak (Kemenkeu & DJP)
  const [bpInstitutionFilter, setBpInstitutionFilter] = useState<"all" | "DJP" | "Kemenkeu">("all");
  const [bpTypeFilter, setBpTypeFilter] = useState<string>("all");
  const [bpSearchQuery, setBpSearchQuery] = useState<string>("");

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState<string>("");
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "success" | "error">("idle");

  // Load articles from localStorage on mount and listen to updates
  useEffect(() => {
    setArticlesList(getStoredZhouArticles());

    const handleArticlesUpdate = () => {
      setArticlesList(getStoredZhouArticles());
    };

    window.addEventListener(ZHOU_ARTICLES_EVENT, handleArticlesUpdate);
    window.addEventListener("storage", handleArticlesUpdate);
    return () => {
      window.removeEventListener(ZHOU_ARTICLES_EVENT, handleArticlesUpdate);
      window.removeEventListener("storage", handleArticlesUpdate);
    };
  }, []);

  // Sync tab with URL search parameter
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "belajar-pajak") {
      setMainTab("belajar-pajak");
    } else {
      setMainTab("edukasi-zhou");
    }
  }, [searchParams]);

  // Filtered Zhou Articles
  const filteredArticles = useMemo(() => {
    const source = articlesList.length > 0 ? articlesList : ZHOU_ARTICLES;
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

  // Filtered Belajar Pajak Links
  const filteredBelajarPajak = useMemo(() => {
    return BELAJAR_PAJAK_LINKS.filter((item) => {
      const matchInst =
        bpInstitutionFilter === "all" || item.institution === bpInstitutionFilter;
      const matchType =
        bpTypeFilter === "all" ||
        item.type === bpTypeFilter ||
        (bpTypeFilter === "Situs Web" && item.type === ("Portal Web" as unknown));
      const q = bpSearchQuery.toLowerCase();
      const matchQuery =
        bpSearchQuery === "" ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.institutionName.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q);
      return matchInst && matchType && matchQuery;
    });
  }, [bpInstitutionFilter, bpTypeFilter, bpSearchQuery]);

  const featuredArticle = filteredArticles[0] || (articlesList.length > 0 ? articlesList[0] : ZHOU_ARTICLES[0]);

  const handleDownloadPdf = (articleTitle: string) => {
    setDownloadSuccessModal(articleTitle);
    setTimeout(() => {
      setDownloadSuccessModal(null);
    }, 4000);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) {
      setNewsletterStatus("error");
      return;
    }
    setNewsletterStatus("success");
    setNewsletterEmail("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-text selection:bg-primary selection:text-white">
      {/* 1. Header / Navbar */}
      <Navbar />

      {/* 2. Main Content */}
      <main className="flex-1">
        {/* Breadcrumb Navigation */}
        <div className="bg-surface border-b border-primary-light py-3">
          <div className="container-custom flex items-center gap-2 text-breadcrumb text-text-secondary">
            <Link href="/" className="hover:text-primary transition-colors">
              Beranda
            </Link>
            <span>/</span>
            <Link href="/edukasi" className="hover:text-primary transition-colors">
              Edukasi Pajak
            </Link>
            <span>/</span>
            <span className="text-primary font-semibold">
              {mainTab === "edukasi-zhou"
                ? "Edukasi dari Zhou Consulting"
                : "Belajar Pajak (Kemenkeu & DJP)"}
            </span>
          </div>
        </div>

        {/* Page Header Clean */}
        <div className="py-6 bg-surface border-b border-primary-light">
          <div className="container-custom space-y-1.5">
            <Badge variant="silver" className="uppercase tracking-wider text-badge font-semibold py-0.5 px-2.5">
              Pusat Literasi
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
              Pusat Edukasi Pajak &amp; Belajar Mandiri
            </h1>
          </div>
        </div>

        {/* Dual Mode Switcher Bar (Sticky Sub-Nav) */}
        <div className="bg-white border-b border-primary-light sticky top-20 z-30 shadow-xs">
          <div className="container-custom py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setMainTab("edukasi-zhou")}
                  className={`px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
                    mainTab === "edukasi-zhou"
                      ? "bg-primary text-white shadow-sm"
                      : "bg-surface text-text-secondary hover:text-primary hover:bg-primary-light/50 border border-primary-light"
                  }`}
                >
                  <BookIcon className="text-sm" />
                  <span>Edukasi dari Zhou Consulting</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      mainTab === "edukasi-zhou"
                        ? "bg-white/20 text-white"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {(articlesList.length > 0 ? articlesList.filter((a) => a.status !== "Draft") : ZHOU_ARTICLES).length} Artikel
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setMainTab("belajar-pajak")}
                  id="belajar-pajak"
                  className={`px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
                    mainTab === "belajar-pajak"
                      ? "bg-primary text-white shadow-sm"
                      : "bg-surface text-text-secondary hover:text-primary hover:bg-primary-light/50 border border-primary-light"
                  }`}
                >
                  <ShieldTaxIcon className="text-sm" />
                  <span>Belajar Pajak (Kemenkeu &amp; DJP)</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      mainTab === "belajar-pajak"
                        ? "bg-white/20 text-white"
                        : "bg-emerald-500/15 text-emerald-700 border border-emerald-500/25"
                    }`}
                  >
                    {BELAJAR_PAJAK_LINKS.length} Link Resmi
                  </span>
                </button>
              </div>

              <div className="hidden md:flex items-center gap-1 text-xs text-text-secondary">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>
                  {mainTab === "edukasi-zhou"
                    ? "Menampilkan Konten Publikasi Zhou"
                    : "Menampilkan Tautan Resmi DJP & Kemenkeu"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* BAGIAN 1: EDUKASI DARI ZHOU CONSULTING (KONTEN UPLOAD ZHOU) */}
        {/* ========================================================= */}
        {mainTab === "edukasi-zhou" && (
          <>
            {/* Featured Article Showcase */}
            <section className="py-12 md:py-16 bg-white border-b border-primary-light">
              <div className="container-custom">
                <div className="bg-surface rounded-2xl border border-primary-light p-6 md:p-8 lg:p-10 shadow-sm">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    {/* Visual Cover Kolom Kiri */}
                    <div className="lg:col-span-5 relative w-full h-64 sm:h-72 lg:h-84 rounded-xl overflow-hidden shadow-md group">
                      <Image
                        src="/images/education-featured.jpg"
                        alt="Corporate Boardroom Zhou Consulting"
                        fill
                        sizes="(max-width: 1024px) 100vw, 40vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/80 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <Badge variant="primary" size="sm" className="bg-primary text-white text-[10px]">
                          Publikasi Unggulan Zhou Consulting
                        </Badge>
                      </div>
                    </div>

                    {/* Info & Konten Kolom Kanan */}
                    <div className="lg:col-span-7 space-y-4">
                      <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary">
                        <Badge variant="success" size="sm" dot>
                          {featuredArticle.category}
                        </Badge>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="text-[10px]" />
                          {featuredArticle.date}
                        </span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1">
                          <ClockIcon className="text-[10px]" />
                          {featuredArticle.readTime}
                        </span>
                      </div>

                      <h2 className="text-xl sm:text-2xl lg:text-[26px] font-bold text-primary leading-snug">
                        {featuredArticle.title}
                      </h2>

                      <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                        {featuredArticle.summary}
                      </p>

                      <div className="pt-2">
                        <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                          Poin Kunci Transisi:
                        </div>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-text">
                          {featuredArticle.takeaways.slice(0, 4).map((pt, idx) => (
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
                          onClick={() => setActiveArticleModal(featuredArticle)}
                          className="text-xs font-semibold px-5 shadow-sm"
                        >
                          <span>Baca Artikel</span>
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() => handleDownloadPdf(featuredArticle.title)}
                          className="text-xs font-semibold px-4 border-primary/30 hover:border-primary text-primary inline-flex items-center gap-2"
                        >
                          <DownloadIcon className="text-xs" />
                          <span>Unduh PDF</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Topik & Pencarian Artikel Zhou */}
            <section className="py-12 bg-surface border-b border-primary-light">
              <div className="container-custom space-y-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div className="space-y-1 max-w-2xl">
                    <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                      Kategori Artikel Zhou
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-primary tracking-tight">
                      Katalog Edukasi Praktisi Zhou Consulting
                    </h2>
                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                      Materi dan telaah regulasi yang disusun langsung oleh konsultan pajak berizin (BKP) dan akuntan bersertifikat (CA).
                    </p>
                  </div>

                  {/* Search Bar Input */}
                  <div className="relative w-full md:w-80">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary">
                      <SearchIcon className="text-xs" />
                    </div>
                    <Input
                      type="text"
                      placeholder="Cari artikel / perihal regulasi..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-9 text-xs bg-white"
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

                {/* Category Filter Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
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
              </div>
            </section>

            {/* Articles Grid */}
            <section className="py-14 md:py-18 bg-white border-b border-primary-light">
              <div className="container-custom space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg sm:text-xl font-bold text-primary">
                    Daftar Artikel ({filteredArticles.length})
                  </h3>
                  <span className="text-xs text-text-secondary font-medium">
                    Ditulis oleh Tim Konsultan Zhou
                  </span>
                </div>

                {filteredArticles.length === 0 ? (
                  <div className="p-12 text-center bg-surface rounded-xl border border-primary-light space-y-3">
                    <BookIcon className="text-3xl text-silver mx-auto" />
                    <h3 className="text-base font-semibold text-primary">Tidak Ada Artikel yang Ditemukan</h3>
                    <p className="text-xs text-text-secondary max-w-sm mx-auto">
                      Coba ganti kata kunci pencarian atau pilih kategori topik lain untuk melihat artikel literasi fiskal.
                    </p>
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
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredArticles.map((article) => (
                      <Card
                        key={article.id}
                        className="rounded-xl border-primary-light bg-white hover:border-primary hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                      >
                        <CardHeader className="space-y-3 pb-3">
                          <div className="flex items-center justify-between text-xs text-text-secondary">
                            <Badge variant="outline" size="sm" className="text-[10px] border-primary-light">
                              {article.category}
                            </Badge>
                            <span className="flex items-center gap-1 text-[11px]">
                              <ClockIcon className="text-[9px]" />
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

                        <CardFooter className="pt-3 border-t border-primary-light/60 flex items-center justify-between">
                          <span className="text-[11px] text-text-secondary">
                            {article.date}
                          </span>
                          <Button
                            variant="card-action"
                            size="sm"
                            onClick={() => setActiveArticleModal(article)}
                            className="w-auto px-3 text-xs"
                          >
                            <span>Baca Artikel</span>
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </section>


          </>
        )}

        {/* ========================================================= */}
        {/* BAGIAN 2: BELAJAR PAJAK (LINK EDUKASI KEMENKEU & DJP)     */}
        {/* ========================================================= */}
        {mainTab === "belajar-pajak" && (
          <section className="py-12 md:py-16 bg-white border-b border-primary-light">
            <div className="container-custom space-y-10">
              {/* Header Box Belajar Pajak */}
              <div className="rounded-2xl bg-gradient-to-r from-primary to-primary-dark text-white p-6 sm:p-8 md:p-10 shadow-md relative overflow-hidden">
                <div className="relative z-10 space-y-3 max-w-3xl">
                  <div className="inline-flex items-center gap-2">
                    <Badge variant="silver" className="bg-white/10 text-white border-white/20 text-[10px] uppercase font-bold tracking-wider">
                      Sumber Resmi Pemerintah RI
                    </Badge>
                    <span className="text-xs text-silver font-medium">
                      Direktorat Jenderal Pajak &amp; Kementerian Keuangan
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                    Pusat Tautan &amp; Media Belajar Pajak Resmi
                  </h2>
                  <p className="text-xs sm:text-sm text-silver leading-relaxed">
                    Akses langsung materi literasi perpajakan nasional, simulasi aplikasi Coretax, kanal video resmi, modul e-learning KLC, dan buku pedoman yang disediakan langsung oleh DJP dan Kementerian Keuangan RI.
                  </p>
                </div>
              </div>

              {/* Filters & Search Toolbar */}
              <div className="bg-surface rounded-2xl border border-primary-light p-4 sm:p-5 shadow-xs space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Filter Institusi */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-primary mr-1">Institusi:</span>
                    <button
                      type="button"
                      onClick={() => setBpInstitutionFilter("all")}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        bpInstitutionFilter === "all"
                          ? "bg-primary text-white"
                          : "bg-white text-text-secondary border border-primary-light hover:text-primary"
                      }`}
                    >
                      Semua ({BELAJAR_PAJAK_LINKS.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setBpInstitutionFilter("DJP")}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                        bpInstitutionFilter === "DJP"
                          ? "bg-primary text-white"
                          : "bg-white text-text-secondary border border-primary-light hover:text-primary"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span>DJP (Ditjen Pajak)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBpInstitutionFilter("Kemenkeu")}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                        bpInstitutionFilter === "Kemenkeu"
                          ? "bg-primary text-white"
                          : "bg-white text-text-secondary border border-primary-light hover:text-primary"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-blue-400" />
                      <span>Kementerian Keuangan RI</span>
                    </button>
                  </div>

                  {/* Search input */}
                  <div className="relative w-full lg:w-72">
                    <SearchIcon className="absolute left-3 top-2.5 text-text-muted text-xs" />
                    <Input
                      type="text"
                      placeholder="Cari tautan / materi belajar..."
                      value={bpSearchQuery}
                      onChange={(e) => setBpSearchQuery(e.target.value)}
                      className="pl-8 text-xs h-9 bg-white"
                    />
                    {bpSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setBpSearchQuery("")}
                        className="absolute right-3 top-2.5 text-text-muted hover:text-primary text-xs"
                      >
                        <CloseIcon />
                      </button>
                    )}
                  </div>
                </div>

                {/* Filter Format Media */}
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-primary-light text-xs">
                  <span className="text-text-muted font-medium mr-1.5">Format Materi:</span>
                  {[
                    "all",
                    "Situs Web",
                    "Simulator DJP",
                    "Video Tutorial",
                    "E-Learning",
                    "Buku Panduan (PDF)",
                  ].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setBpTypeFilter(type)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                        bpTypeFilter === type
                          ? "bg-primary-light text-primary font-bold"
                          : "text-text-secondary hover:text-primary hover:bg-white"
                      }`}
                    >
                      {type === "all" ? "Semua Format" : type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid Kartu Belajar Pajak */}
              {filteredBelajarPajak.length === 0 ? (
                <div className="p-12 text-center bg-surface rounded-xl border border-primary-light space-y-3">
                  <ShieldTaxIcon className="text-3xl text-silver mx-auto" />
                  <h3 className="text-base font-semibold text-primary">Tautan Tidak Ditemukan</h3>
                  <p className="text-xs text-text-secondary max-w-sm mx-auto">
                    Coba ubah kata kunci atau bersihkan filter institusi untuk melihat direktori link resmi.
                  </p>
                  <Button
                    variant="silver"
                    size="sm"
                    onClick={() => {
                      setBpInstitutionFilter("all");
                      setBpTypeFilter("all");
                      setBpSearchQuery("");
                    }}
                    className="text-xs"
                  >
                    Reset Filter
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredBelajarPajak.map((item) => (
                    <Card
                      key={item.id}
                      className="rounded-2xl border-primary-light bg-white hover:border-primary hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden"
                    >
                      <CardHeader className="space-y-3 pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="silver"
                              size="sm"
                              className={`text-[10px] font-bold ${
                                item.institution === "DJP"
                                  ? "bg-amber-50 text-amber-900 border-amber-200"
                                  : "bg-blue-50 text-blue-900 border-blue-200"
                              }`}
                            >
                              {item.institutionName}
                            </Badge>
                            <Badge variant="outline" size="sm" className="text-[10px]">
                              {item.type}
                            </Badge>
                          </div>
                          <span className="text-[10px] text-text-muted font-medium">
                            {item.updatedAt}
                          </span>
                        </div>

                        <div>
                          <CardTitle className="text-base font-bold text-primary leading-snug">
                            {item.title}
                          </CardTitle>
                          <CardDescription className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                            {item.description}
                          </CardDescription>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0 space-y-3 flex-1">
                        <div className="bg-surface rounded-xl p-3 border border-primary-light/70 space-y-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
                            Cakupan Materi Pembelajaran:
                          </span>
                          <ul className="space-y-1 text-xs text-text">
                            {item.highlights.map((point, pIdx) => (
                              <li key={pIdx} className="flex items-start gap-2">
                                <CheckCircleIcon className="text-success text-xs flex-shrink-0 mt-0.5" />
                                <span className="text-[11px] leading-tight text-text-secondary">
                                  {point}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>

                      <CardFooter className="pt-3 border-t border-primary-light/60 flex items-center justify-between bg-surface/40">
                        <div className="truncate max-w-[200px] text-[11px] text-text-muted font-mono">
                          {item.url.replace(/^https?:\/\//, "")}
                        </div>

                        <Button
                          variant="primary"
                          size="sm"
                          asChild
                          className="text-xs font-semibold shadow-xs"
                        >
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <span>Buka Situs</span>
                          </a>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}

              {/* Edukasi Notice Box */}
              <div className="p-6 rounded-2xl bg-surface border border-primary-light flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1 max-w-2xl">
                  <h4 className="text-xs sm:text-sm font-bold text-primary">
                    Mengapa Mengakses Sumber Belajar Resmi Kemenkeu &amp; DJP?
                  </h4>
                  <p className="text-[11px] sm:text-xs text-text-secondary leading-relaxed">
                    Materi yang bersumber langsung dari Direktorat Jenderal Pajak dan Kementerian Keuangan memiliki legitimasi hukum fiskal tertinggi, bebas biaya, serta selalu dimutakhirkan mengikuti implementasi Coretax 2026.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="text-xs font-semibold shrink-0"
                >
                  <Link href="/konsultasi">Konsultasi Pendampingan</Link>
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Buletin Wawasan Fiskal Mingguan (Newsletter) */}
        <section className="py-12 md:py-16 bg-surface border-b border-primary-light">
          <div className="container-custom max-w-4xl">
            <div className="rounded-xl bg-primary border border-white/10 p-6 md:p-8 text-white text-center space-y-4 shadow-md">
              <div className="space-y-2">
                <Badge variant="silver" className="bg-white/10 text-white border-white/20 text-[10px]">
                  Buletin Edukasi Mingguan
                </Badge>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  Berlangganan Buletin Wawasan Fiskal Mingguan
                </h3>
                <p className="text-xs text-silver max-w-xl mx-auto leading-relaxed">
                  Dapatkan ringkasan peraturan pajak KMK terbaru, kajian kritis Coretax 2026, dan panduan kepatuhan akuntansi langsung di kotak masuk email Anda setiap Senin pagi.
                </p>
              </div>

              {newsletterStatus === "success" ? (
                <div className="bg-success/20 border border-success/40 text-white p-4 rounded-lg text-xs max-w-md mx-auto space-y-1">
                  <div className="font-bold flex items-center justify-center gap-1.5 text-white">
                    <CheckCircleIcon className="text-success" />
                    <span>Pendaftaran Berhasil!</span>
                  </div>
                  <p className="text-silver text-[11px]">
                    Terima kasih telah bergabung. Edisi buletin wawasan fiskal berikutnya akan dikirimkan ke email Anda.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleNewsletterSubmit}
                  className="flex flex-col sm:flex-row items-center justify-center gap-2.5 max-w-md mx-auto pt-1"
                >
                  <Input
                    type="email"
                    placeholder="Masukkan email korporat Anda..."
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    error={newsletterStatus === "error"}
                    className="bg-white text-text text-xs h-10 w-full"
                    required
                  />
                  <Button
                    type="submit"
                    variant="silver"
                    className="h-10 px-5 text-xs font-semibold w-full sm:w-auto shrink-0 shadow-sm"
                  >
                    Berlangganan
                  </Button>
                </form>
              )}

              <p className="text-[10px] text-silver/70">
                Kami menghormati privasi Anda sesuai ketentuan UU PDP. Anda dapat membatalkan langganan kapan saja.
              </p>
            </div>
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
                <Badge variant="success" size="sm" dot>
                  {activeArticleModal.category}
                </Badge>
                <span className="text-xs text-text-secondary">
                  {activeArticleModal.readTime}
                </span>
                <span className="text-xs text-text-secondary">&bull;</span>
                <span className="text-xs text-text-secondary">
                  {activeArticleModal.date}
                </span>
              </div>
              <DialogTitle className="text-lg sm:text-xl font-bold text-primary leading-snug">
                {activeArticleModal.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-text-secondary">
                Penulis: <strong className="text-primary font-semibold">{activeArticleModal.author}</strong>
              </DialogDescription>
            </DialogHeader>

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
                    onClick={() => handleDownloadPdf(activeArticleModal.attachment!.name)}
                    className="text-xs h-8 px-3 border-primary/40 text-primary hover:border-primary flex items-center gap-1.5 shrink-0"
                  >
                    <DownloadIcon className="text-xs" />
                    <span>Unduh Modul</span>
                  </Button>
                </div>
              )}
            </div>

            <DialogFooter className="pt-4 border-t border-primary-light flex flex-col sm:flex-row items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownloadPdf(activeArticleModal.title)}
                className="w-full sm:w-auto text-xs font-semibold border-primary/30 text-primary hover:border-primary inline-flex items-center gap-1.5"
              >
                <DownloadIcon className="text-xs" />
                <span>Unduh Salinan PDF</span>
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
