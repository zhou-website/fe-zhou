"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import {
  CheckCircleIcon,
  CheckIcon,
  DocumentIcon,
  SearchIcon,
  PlusIcon,
  CloseIcon,
  EyeIcon,
  TrashIcon,
  BookIcon,
  BuildingIcon,
  FilterIcon,
} from "@/components/icons";
import {
  ZHOU_ARTICLES,
  BELAJAR_PAJAK_LINKS,
  BelajarPajakLink,
} from "@/data/edukasiData";

export interface CMSItem {
  id: string;
  section: "hero" | "kurs" | "regulasi" | "edukasi-zhou" | "belajar-pajak" | "karir";
  title: string;
  category: string;
  lastUpdated: string;
  editor: string;
  status: "Published" | "Draft";
  summary: string;

  // Edukasi Zhou fields
  author?: string;
  readTime?: string;
  takeaways?: string[];
  content?: string[];

  // Belajar Pajak (Kemenkeu & DJP) fields
  institution?: "DJP" | "Kemenkeu";
  institutionName?: string;
  url?: string;
  mediaType?: "Situs Web" | "Portal Web" | "Simulator DJP" | "Video Tutorial" | "E-Learning" | "Buku Panduan (PDF)";
  badge?: string;
  highlights?: string[];
  isOfficial?: boolean;
}

// Convert initial Zhou articles to CMS items
const INITIAL_ZHOU_CMS: CMSItem[] = ZHOU_ARTICLES.map((a) => ({
  id: `ZHOU-${a.id.toUpperCase()}`,
  section: "edukasi-zhou",
  title: a.title,
  category: a.category,
  lastUpdated: a.date,
  editor: a.author,
  status: a.status || "Published",
  summary: a.summary,
  author: a.author,
  readTime: a.readTime,
  takeaways: a.takeaways,
  content: a.content,
}));

// Convert initial Belajar Pajak links to CMS items
const INITIAL_BELAJAR_CMS: CMSItem[] = BELAJAR_PAJAK_LINKS.map((b) => ({
  id: `GOV-${b.id.toUpperCase()}`,
  section: "belajar-pajak",
  title: b.title,
  category: b.institution === "DJP" ? "Direktorat Jenderal Pajak" : "Kementerian Keuangan RI",
  lastUpdated: b.updatedAt,
  editor: b.institutionName,
  status: b.status || "Published",
  summary: b.description,
  institution: b.institution,
  institutionName: b.institutionName,
  url: b.url,
  mediaType: b.type,
  badge: b.badge,
  highlights: b.highlights,
  isOfficial: b.isOfficial,
}));

// Standard initial CMS items
const INITIAL_OTHER_CMS: CMSItem[] = [
  {
    id: "CMS-01",
    section: "hero",
    title: "Headline Hero Utama: Solusi Terintegrasi Akuntansi, Pajak & Tata Kelola Finansial",
    category: "Hero Banner",
    lastUpdated: "17 Sep 2026",
    editor: "Linda David, S.Ak., BKP",
    status: "Published",
    summary: "Headline pembuka beranda korporat menonjolkan kepatuhan Coretax 2026 dan akreditasi BKP/CA.",
  },
  {
    id: "CMS-02",
    section: "kurs",
    title: "Tabel Kurs Pajak Mingguan KMK No. 38/KM.10/2026 (7 Valuta Utama)",
    category: "Kurs Pajak",
    lastUpdated: "17 Sep 2026",
    editor: "Linda David, S.Ak., BKP",
    status: "Published",
    summary: "Tarif konversi resmi valuta asing untuk pelaporan faktur pajak dan bukti potong DJP.",
  },
  {
    id: "CMS-03",
    section: "regulasi",
    title: "PMK No. 81/2024: Tata Cara Pelaksanaan Hak dan Kewajiban Perpajakan Coretax",
    category: "Regulasi",
    lastUpdated: "15 Sep 2026",
    editor: "Muhamad Dekhsa, SH.",
    status: "Published",
    summary: "Regulasi integrasi Coretax DJP, faktur pajak elektronik, dan bukti potong terpadu.",
  },
  {
    id: "CMS-04",
    section: "regulasi",
    title: "UU No. 7/2021: Harmonisasi Peraturan Perpajakan (UU HPP)",
    category: "Regulasi",
    lastUpdated: "12 Sep 2026",
    editor: "Muhamad Dekhsa, SH.",
    status: "Published",
    summary: "Ketentuan umum perpajakan, tarif PPh Badan 22%, batasan omzet PT KP, dan PPN 11-12%.",
  },
  {
    id: "CMS-08",
    section: "karir",
    title: "Lowongan: Senior Tax Consultant (Coretax & SP2DK Specialist)",
    category: "Karir",
    lastUpdated: "11 Sep 2026",
    editor: "HR & Operasional",
    status: "Published",
    summary: "Kebutuhan tenaga ahli bersertifikat Brevet C / BKP dengan pengalaman pendampingan sengketa.",
  },
  {
    id: "CMS-09",
    section: "karir",
    title: "Lowongan: Junior Auditor SAK & Kompilasi Laporan Keuangan",
    category: "Karir",
    lastUpdated: "05 Sep 2026",
    editor: "HR & Operasional",
    status: "Published",
    summary: "Peluang bagi sarjana akuntansi untuk pendampingan audit komersial dan rekonsiliasi.",
  },
];

const INITIAL_CMS_ITEMS: CMSItem[] = [
  ...INITIAL_ZHOU_CMS,
  ...INITIAL_BELAJAR_CMS,
  ...INITIAL_OTHER_CMS,
];

type CMSTab =
  | "all"
  | "edukasi-zhou"
  | "belajar-pajak"
  | "hero"
  | "kurs"
  | "regulasi"
  | "karir";

function AdminCMSPageContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as CMSTab) || "all";

  const [activeTab, setActiveTab] = useState<CMSTab>(initialTab);
  const [cmsItems, setCmsItems] = useState<CMSItem[]>(INITIAL_CMS_ITEMS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [institutionFilter, setInstitutionFilter] = useState<string>("ALL");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Selected item for preview modal
  const [previewItem, setPreviewItem] = useState<CMSItem | null>(null);

  // Add new item modal state
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
  const [newItemForm, setNewItemForm] = useState({
    section: "edukasi-zhou" as CMSItem["section"],
    title: "",
    category: "Coretax DJP 2026",
    author: "Tim Konsultan BKP Zhou Consulting",
    readTime: "6 menit baca",
    editor: "Linda David, S.Ak., BKP",
    status: "Published" as CMSItem["status"],
    summary: "",
    takeawaysRaw: "",
    contentRaw: "",
    // Belajar Pajak fields
    institution: "DJP" as "DJP" | "Kemenkeu",
    url: "",
    mediaType: "Simulator DJP" as BelajarPajakLink["type"],
    badge: "Simulasi Coretax",
    highlightsRaw: "",
  });

  // Hero Section Form State
  const [heroForm, setHeroForm] = useState({
    headline: "Solusi Terintegrasi Akuntansi, Pajak & Tata Kelola Finansial Bisnis",
    subheadline:
      "Kami menghadirkan pendampingan pajak, keuangan, dan hukum terpadu untuk mendukung bisnis Anda. Melalui strategi menyeluruh, kami memitigasi risiko, memastikan kepatuhan hukum, dan mendorong pertumbuhan perusahaan secara berkelanjutan.",
    metric1: "Akuntansi Standar SAK",
    metric2: "Kepatuhan SPT & Coretax",
    metric3: "Asistensi Regulasi Fiskal",
    metric4: "Konsultan BKP & CA Berlisensi",
    boardroomCaption:
      "Rapat konsultasi strategis perpajakan & kepatuhan fiskal di Menara Sudirman Kav. 21 Lt. 12, Jakarta Selatan.",
  });

  // Kurs KMK Form State
  const [kursForm, setKursForm] = useState({
    kmkNumber: "KMK No. 38/KM.10/2026",
    period: "17 September 2026 – 23 September 2026",
    rates: [
      { currency: "USD", name: "Dolar Amerika Serikat", rate: "Rp 15.825,00", flag: "US" },
      { currency: "EUR", name: "Euro Uni Eropa", rate: "Rp 16.940,00", flag: "EU" },
      { currency: "SGD", name: "Dolar Singapura", rate: "Rp 11.890,00", flag: "SG" },
      { currency: "JPY", name: "Yen Jepang (100 Yen)", rate: "Rp 10.540,00", flag: "JP" },
      { currency: "GBP", name: "Pound Sterling Inggris", rate: "Rp 20.150,00", flag: "GB" },
      { currency: "AUD", name: "Dolar Australia", rate: "Rp 10.420,00", flag: "AU" },
      { currency: "CNY", name: "Yuan Renminbi Tiongkok", rate: "Rp 2.190,00", flag: "CN" },
    ],
  });

  // Sync tab from URL if it changes
  useEffect(() => {
    const tabParam = searchParams.get("tab") as CMSTab;
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [searchParams, activeTab]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Toggle publish status
  const handleToggleStatus = (id: string) => {
    setCmsItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newStatus: CMSItem["status"] =
            item.status === "Published" ? "Draft" : "Published";
          showToast(`Status "${item.title.substring(0, 35)}..." diubah ke ${newStatus}.`);
          return { ...item, status: newStatus };
        }
        return item;
      })
    );
  };

  // Delete item
  const handleDeleteItem = (id: string) => {
    setCmsItems((prev) => prev.filter((item) => item.id !== id));
    showToast("Konten berhasil dihapus dari direktori CMS.");
  };

  // Open modal with preselected section
  const handleOpenAddModal = (section: CMSItem["section"]) => {
    setNewItemForm((prev) => ({
      ...prev,
      section,
      title: "",
      summary: "",
      takeawaysRaw: "",
      contentRaw: "",
      highlightsRaw: "",
      url: section === "belajar-pajak" ? "https://pajak.go.id" : "",
    }));
    setIsNewItemModalOpen(true);
  };

  // Create new content item
  const handleCreateNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemForm.title.trim()) return;

    const todayStr = new Date().toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    let createdItem: CMSItem;

    if (newItemForm.section === "edukasi-zhou") {
      const takeaways = newItemForm.takeawaysRaw
        .split("\n")
        .map((t) => t.trim())
        .filter(Boolean);
      const content = newItemForm.contentRaw
        .split("\n\n")
        .map((c) => c.trim())
        .filter(Boolean);

      createdItem = {
        id: "ZHOU-" + Math.floor(100 + Math.random() * 900),
        section: "edukasi-zhou",
        title: newItemForm.title.trim(),
        category: newItemForm.category,
        lastUpdated: todayStr,
        editor: newItemForm.author || "Tim Konsultan Zhou",
        author: newItemForm.author || "Tim Konsultan BKP Zhou Consulting",
        readTime: newItemForm.readTime || "5 menit baca",
        status: newItemForm.status,
        summary: newItemForm.summary.trim() || "Tidak ada ringkasan materi.",
        takeaways:
          takeaways.length > 0
            ? takeaways
            : ["Penyelarasan bukti potong dan rekonsiliasi data fiskal berkala."],
        content:
          content.length > 0
            ? content
            : [newItemForm.summary.trim() || "Isi artikel lengkap edukasi perpajakan."],
      };
    } else if (newItemForm.section === "belajar-pajak") {
      const highlights = newItemForm.highlightsRaw
        .split("\n")
        .map((h) => h.trim())
        .filter(Boolean);

      createdItem = {
        id: "GOV-" + Math.floor(100 + Math.random() * 900),
        section: "belajar-pajak",
        title: newItemForm.title.trim(),
        category:
          newItemForm.institution === "DJP"
            ? "Direktorat Jenderal Pajak"
            : "Kementerian Keuangan RI",
        lastUpdated: todayStr,
        editor:
          newItemForm.institution === "DJP"
            ? "Direktorat Jenderal Pajak (DJP)"
            : "Kementerian Keuangan RI",
        status: newItemForm.status,
        summary: newItemForm.summary.trim() || "Tautan materi edukasi perpajakan resmi pemerintah.",
        institution: newItemForm.institution,
        institutionName:
          newItemForm.institution === "DJP"
            ? "Direktorat Jenderal Pajak (DJP)"
            : "Kementerian Keuangan RI",
        url: newItemForm.url.trim() || "https://pajak.go.id",
        mediaType: newItemForm.mediaType,
        badge: newItemForm.badge.trim() || "Situs Resmi",
        highlights:
          highlights.length > 0
            ? highlights
            : ["Akses materi dan simulasi resmi langsung dari DJP / Kemenkeu"],
        isOfficial: true,
      };
    } else {
      createdItem = {
        id: "CMS-" + Math.floor(10 + Math.random() * 90),
        section: newItemForm.section,
        title: newItemForm.title.trim(),
        category: newItemForm.category,
        lastUpdated: todayStr,
        editor: newItemForm.editor,
        status: newItemForm.status,
        summary: newItemForm.summary.trim() || "Tidak ada ringkasan deskripsi konten.",
      };
    }

    setCmsItems((prev) => [createdItem, ...prev]);
    setIsNewItemModalOpen(false);

    const sectionLabel =
      createdItem.section === "edukasi-zhou"
        ? "Edukasi Zhou"
        : createdItem.section === "belajar-pajak"
        ? "Belajar Pajak Kemenkeu/DJP"
        : createdItem.section;

    showToast(`Konten baru berhasil diterbitkan ke [${sectionLabel}].`);
  };

  // Save Hero section
  const handleSaveHero = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Konten Profil & Hero Section berhasil diperbarui ke Landing Page.");
  };

  // Save Kurs section
  const handleSaveKurs = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`Tabel ${kursForm.kmkNumber} berhasil diterbitkan secara langsung.`);
  };

  // Counts
  const zhouItems = cmsItems.filter((i) => i.section === "edukasi-zhou");
  const belajarItems = cmsItems.filter((i) => i.section === "belajar-pajak");
  const regulasiItems = cmsItems.filter((i) => i.section === "regulasi");
  const karirItems = cmsItems.filter((i) => i.section === "karir");
  const publishedCount = cmsItems.filter((i) => i.status === "Published").length;
  const draftCount = cmsItems.filter((i) => i.status === "Draft").length;

  // Filtered items for "all" tab
  const filteredAllItems = cmsItems.filter((item) => {
    const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.editor.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  // Filtered items for Edukasi Zhou tab
  const filteredZhouItems = zhouItems.filter((item) => {
    const matchesCategory = categoryFilter === "ALL" || item.category === categoryFilter;
    const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      (item.author && item.author.toLowerCase().includes(q)) ||
      item.id.toLowerCase().includes(q);

    return matchesCategory && matchesStatus && matchesSearch;
  });

  // Filtered items for Belajar Pajak tab
  const filteredBelajarItems = belajarItems.filter((item) => {
    const matchesInstitution =
      institutionFilter === "ALL" || item.institution === institutionFilter;
    const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(q) ||
      (item.url && item.url.toLowerCase().includes(q)) ||
      (item.mediaType && item.mediaType.toLowerCase().includes(q)) ||
      item.id.toLowerCase().includes(q);

    return matchesInstitution && matchesStatus && matchesSearch;
  });

  // Pagination states
  const [overviewPage, setOverviewPage] = useState(1);
  const [zhouPage, setZhouPage] = useState(1);
  const [belajarPage, setBelajarPage] = useState(1);

  // Reset pagination on filter or search changes
  useEffect(() => {
    setOverviewPage(1);
    setZhouPage(1);
    setBelajarPage(1);
  }, [searchQuery, statusFilter, categoryFilter, institutionFilter]);

  const overviewItemsPerPage = 6;
  const totalOverviewPages = Math.ceil(filteredAllItems.length / overviewItemsPerPage) || 1;
  const paginatedAllItems = filteredAllItems.slice(
    (overviewPage - 1) * overviewItemsPerPage,
    overviewPage * overviewItemsPerPage
  );

  const zhouItemsPerPage = 5;
  const totalZhouPages = Math.ceil(filteredZhouItems.length / zhouItemsPerPage) || 1;
  const paginatedZhouItems = filteredZhouItems.slice(
    (zhouPage - 1) * zhouItemsPerPage,
    zhouPage * zhouItemsPerPage
  );

  const belajarItemsPerPage = 6;
  const totalBelajarPages = Math.ceil(filteredBelajarItems.length / belajarItemsPerPage) || 1;
  const paginatedBelajarItems = filteredBelajarItems.slice(
    (belajarPage - 1) * belajarItemsPerPage,
    belajarPage * belajarItemsPerPage
  );

  return (
    <div className="space-y-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0B1533] text-white text-xs font-semibold py-3 px-5 rounded-xl shadow-2xl border border-white/20 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircleIcon className="text-emerald-400 text-base" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-silver hover:text-white ml-2"
          >
            <CloseIcon className="text-xs" />
          </button>
        </div>
      )}

      {/* Top Header & Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-primary-light">
        <div>
          <div className="flex items-center gap-2 text-xs text-text-muted mb-1.5">
            <span className="text-text-muted">Dashboard Staf &amp; Administrasi</span>
            <span>/</span>
            <span className="text-primary font-bold">CMS &amp; Edukasi Pajak</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
            CMS &amp; Pusat Manajemen Edukasi Pajak
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-3xl">
            Kelola dua menu utama Edukasi Pajak: <strong>(1) Edukasi Zhou</strong> (konten &amp;
            artikel internal yang dapat diunggah staf Zhou) dan <strong>(2) Belajar Pajak</strong> (katalog tautan
            pembelajaran resmi terverifikasi dari Kemenkeu &amp; DJP), serta landing page, kurs pajak KMK, dan karir.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleOpenAddModal("edukasi-zhou")}
            className="text-xs font-semibold h-10 px-3.5 border-primary-light flex items-center gap-2 bg-white hover:border-primary text-primary"
          >
            <PlusIcon className="text-xs" />
            <span>Upload Edukasi Zhou</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleOpenAddModal("belajar-pajak")}
            className="text-xs font-semibold h-10 px-3.5 border-amber-300 flex items-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-900"
          >
            <PlusIcon className="text-xs" />
            <span>Tambah Link Kemenkeu/DJP</span>
          </Button>

          <Link
            href="/edukasi"
            target="_blank"
            className="text-xs font-semibold h-10 px-4 rounded-xl bg-primary text-white shadow-sm flex items-center gap-2 hover:bg-primary/90 transition-colors"
          >
            <EyeIcon className="text-xs" />
            <span>Lihat Halaman Edukasi</span>
          </Link>
        </div>
      </div>

      {/* 4 TOP SUMMARY METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Edukasi Zhou */}
        <Card
          onClick={() => setActiveTab("edukasi-zhou")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            activeTab === "edukasi-zhou"
              ? "border-primary ring-2 ring-primary/20 bg-primary/5"
              : "border-primary-light bg-white hover:border-primary/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider">
              1. Edukasi Zhou
            </span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs">
              <BookIcon />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-primary font-mono">
              {zhouItems.length}
            </span>
            <span className="text-xs text-text-secondary">Artikel</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-primary font-medium">
            <CheckIcon className="text-[9px] text-emerald-600" />
            <span>Konten dapat di-upload Zhou</span>
          </div>
        </Card>

        {/* Card 2: Belajar Pajak */}
        <Card
          onClick={() => setActiveTab("belajar-pajak")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            activeTab === "belajar-pajak"
              ? "border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/50"
              : "border-primary-light bg-white hover:border-amber-400"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider">
              2. Belajar Pajak
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800 text-xs">
              <BuildingIcon />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-amber-900 font-mono">
              {belajarItems.length}
            </span>
            <span className="text-xs text-text-secondary">Link Edukasi</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-800 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            <span>Resmi DJP &amp; Kemenkeu RI</span>
          </div>
        </Card>

        {/* Card 3: Total Status Terbit */}
        <Card
          onClick={() => setActiveTab("all")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            activeTab === "all"
              ? "border-primary ring-2 ring-primary/20 bg-primary/5"
              : "border-primary-light bg-white hover:border-primary/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider">
              Total Publikasi CMS
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs">
              <CheckCircleIcon />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-primary font-mono">
              {publishedCount}
            </span>
            <span className="text-xs text-text-secondary">Terbit ({draftCount} Draft)</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
            <CheckIcon className="text-[9px]" />
            <span>Aktif di web publik real-time</span>
          </div>
        </Card>

        {/* Card 4: Kurs Pajak KMK */}
        <Card
          onClick={() => setActiveTab("kurs")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            activeTab === "kurs"
              ? "border-primary ring-2 ring-primary/20 bg-primary/5"
              : "border-primary-light bg-white hover:border-primary/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider">
              Kurs Pajak KMK
            </span>
            <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center text-primary text-xs">
              <DocumentIcon />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-base font-bold text-primary font-mono truncate">
              {kursForm.kmkNumber}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-primary font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>7 Valuta Asing Terbit</span>
          </div>
        </Card>
      </div>

      {/* MULTI-SECTION TAB NAVIGATION */}
      <div className="border-b border-primary-light flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 text-xs font-semibold">
        {[
          { id: "all", label: `Semua Konten (${cmsItems.length})` },
          {
            id: "edukasi-zhou",
            label: `1. Edukasi Zhou (${zhouItems.length})`,
            highlight: "bg-primary text-white",
            tag: "Upload Zhou",
          },
          {
            id: "belajar-pajak",
            label: `2. Belajar Pajak (${belajarItems.length})`,
            highlight: "bg-amber-600 text-white",
            tag: "Link DJP / Kemenkeu",
          },
          { id: "hero", label: "Profil & Hero Banner" },
          { id: "kurs", label: "Kurs Pajak KMK" },
          { id: "regulasi", label: `Regulasi DJP (${regulasiItems.length})` },
          { id: "karir", label: `Lowongan Karir (${karirItems.length})` },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as CMSTab)}
              className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
                isActive
                  ? tab.highlight || "bg-primary text-white shadow-xs font-bold"
                  : "bg-white text-text-secondary hover:text-primary hover:bg-surface border border-primary-light"
              }`}
            >
              <span>{tab.label}</span>
              {tab.tag && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                    isActive ? "bg-white/20 text-white" : "bg-primary-light text-primary"
                  }`}
                >
                  {tab.tag}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: ALL CONTENT (MASTER TABLE) */}
      {activeTab === "all" && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-white rounded-2xl border border-primary-light p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <SearchIcon className="absolute left-3 top-2.5 text-text-muted text-xs" />
              <Input
                type="text"
                placeholder="Cari judul konten, institusi, atau editor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs h-9 bg-surface border-primary-light focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs h-9 px-3 rounded-xl border border-primary-light bg-surface text-text-primary focus:bg-white font-medium focus:outline-none"
              >
                <option value="ALL">Semua Status</option>
                <option value="Published">Published (Terbit)</option>
                <option value="Draft">Draft (Konsep)</option>
              </select>
            </div>
          </div>

          {/* Content Table Card */}
          <Card className="rounded-2xl border-primary-light bg-white shadow-xs overflow-hidden">
            <div className="p-4 bg-surface/60 border-b border-primary-light flex items-center justify-between">
              <span className="text-xs font-bold text-primary">
                Daftar Seluruh Konten &amp; Link Edukasi ({filteredAllItems.length})
              </span>
              <span className="text-[11px] text-text-muted">
                Klik &quot;Pratinjau&quot; untuk melihat rincian sebelum terbit ke publik.
              </span>
            </div>

            <div className="divide-y divide-primary-light">
              {filteredAllItems.length === 0 ? (
                <div className="p-8 text-center text-xs text-text-muted">
                  Tidak ada konten yang sesuai dengan filter pencarian.
                </div>
              ) : (
                paginatedAllItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 hover:bg-surface/50 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-primary bg-primary-light px-2 py-0.5 rounded text-[11px]">
                          {item.id}
                        </span>
                        {item.section === "edukasi-zhou" ? (
                          <span className="bg-primary/10 text-primary border border-primary/20 uppercase text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full">
                            Edukasi Zhou
                          </span>
                        ) : item.section === "belajar-pajak" ? (
                          <span className="bg-amber-100 text-amber-900 border border-amber-300 uppercase text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full">
                            Belajar Pajak ({item.institution})
                          </span>
                        ) : (
                          <span className="text-text-muted uppercase text-[10px] font-bold tracking-wider">
                            [{item.section}]
                          </span>
                        )}
                        <span>&bull;</span>
                        <span className="text-text-secondary font-medium">{item.category}</span>
                        <Badge
                          variant={item.status === "Published" ? "success" : "silver"}
                          size="sm"
                          dot={item.status === "Published"}
                        >
                          {item.status}
                        </Badge>
                      </div>

                      <h4 className="text-sm font-bold text-primary">{item.title}</h4>
                      <p className="text-[11px] text-text-secondary line-clamp-1">
                        {item.summary}
                      </p>

                      {item.url && (
                        <div className="text-[11px] text-amber-900 flex items-center gap-1 font-mono">
                          <span className="font-sans text-text-muted">URL Resmi:</span>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-amber-700 truncate max-w-md"
                          >
                            {item.url}
                          </a>
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-[10px] text-text-muted">
                        <span>Pembaruan: {item.lastUpdated}</span>
                        <span>&bull;</span>
                        <span>
                          {item.section === "edukasi-zhou"
                            ? `Penulis: ${item.author || item.editor}`
                            : `Sumber: ${item.editor}`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] h-8 px-2.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold flex items-center gap-1.5 transition-colors"
                          title="Buka URL resmi pemerintah di tab baru"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                          <span>Buka URL</span>
                        </a>
                      )}

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewItem(item)}
                        className="text-[11px] h-8 px-2.5 border-primary-light text-text-secondary hover:text-primary"
                      >
                        <EyeIcon className="text-xs mr-1" />
                        Pratinjau
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(item.id)}
                        className={`text-[11px] h-8 px-2.5 ${
                          item.status === "Published"
                            ? "text-text-muted hover:text-error hover:border-error"
                            : "text-emerald-700 hover:border-emerald-500"
                        }`}
                      >
                        {item.status === "Published" ? "Tarik ke Draft" : "Terbitkan"}
                      </Button>

                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1.5 text-text-muted hover:text-error rounded-md transition-colors"
                        title="Hapus Konten"
                      >
                        <TrashIcon className="text-xs" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {filteredAllItems.length > 0 && (
              <div className="p-4 bg-surface/40 border-t border-primary-light flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted">
                <span>
                  Menampilkan {(overviewPage - 1) * overviewItemsPerPage + 1} &ndash;{" "}
                  {Math.min(overviewPage * overviewItemsPerPage, filteredAllItems.length)} dari{" "}
                  {filteredAllItems.length} konten
                </span>
                <Pagination
                  currentPage={overviewPage}
                  totalPages={totalOverviewPages}
                  onPageChange={setOverviewPage}
                />
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 2: EDUKASI ZHOU (KONTEN YANG DAPAT DI-UPLOAD ZHOU) */}
      {activeTab === "edukasi-zhou" && (
        <div className="space-y-6">
          {/* Header Banner for Zhou Articles */}
          <Card className="rounded-2xl border-primary bg-gradient-to-r from-[#0B1533] to-[#162758] text-white p-6 shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 text-white">
                    Menu 1 Edukasi Pajak
                  </span>
                  <span className="text-xs text-silver">&bull; Publikasi Mandiri Zhou</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Edukasi Zhou — Konten &amp; Artikel Unggahan Internal
                </h2>
                <p className="text-xs sm:text-sm text-silver leading-relaxed">
                  Kelola dan publikasikan materi edukasi perpajakan yang disusun oleh tim konsultan
                  Zhou Consulting (analisis Coretax, kepatuhan PPh/PPN, strategi SP2DK, dan akuntansi SAK).
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                <Button
                  type="button"
                  onClick={() => handleOpenAddModal("edukasi-zhou")}
                  className="bg-white text-primary hover:bg-white/90 text-xs font-bold h-10 px-4 rounded-xl flex items-center gap-2 shadow-sm"
                >
                  <PlusIcon className="text-xs" />
                  <span>Upload Artikel Baru</span>
                </Button>

                <Link
                  href="/edukasi?tab=edukasi-zhou"
                  target="_blank"
                  className="text-xs font-semibold h-10 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center gap-2 transition-colors"
                >
                  <EyeIcon className="text-xs" />
                  <span>Lihat di Web Publik</span>
                </Link>
              </div>
            </div>
          </Card>

          {/* Search & Category Filter */}
          <div className="bg-white rounded-2xl border border-primary-light p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <SearchIcon className="absolute left-3 top-2.5 text-text-muted text-xs" />
              <Input
                type="text"
                placeholder="Cari judul artikel, topik pembahasan, atau penulis..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs h-9 bg-surface border-primary-light focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <FilterIcon className="text-xs text-text-muted" />
                <span className="text-xs text-text-muted font-medium">Kategori:</span>
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs h-9 px-3 rounded-xl border border-primary-light bg-surface text-text-primary focus:bg-white font-medium focus:outline-none"
              >
                <option value="ALL">Semua Kategori ({zhouItems.length})</option>
                <option value="Coretax DJP 2026">Coretax DJP 2026</option>
                <option value="Kepatuhan PPh & PPN">Kepatuhan PPh &amp; PPN</option>
                <option value="Mitigasi SP2DK">Mitigasi SP2DK</option>
                <option value="Akuntansi SAK">Akuntansi SAK</option>
                <option value="Legal Korporat">Legal Korporat</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs h-9 px-3 rounded-xl border border-primary-light bg-surface text-text-primary focus:bg-white font-medium focus:outline-none"
              >
                <option value="ALL">Semua Status</option>
                <option value="Published">Published (Terbit)</option>
                <option value="Draft">Draft (Konsep)</option>
              </select>
            </div>
          </div>

          {/* Cards Grid for Zhou Articles */}
          <div className="grid grid-cols-1 gap-4">
            {filteredZhouItems.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-primary-light text-xs text-text-muted">
                Tidak ada artikel Zhou yang sesuai dengan filter pencarian.
              </div>
            ) : (
              paginatedZhouItems.map((article) => (
                <Card
                  key={article.id}
                  className="rounded-2xl border-primary-light bg-white p-5 shadow-xs hover:border-primary/50 transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-primary-light/60 pb-3">
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className="font-mono font-bold text-primary bg-primary-light px-2 py-0.5 rounded text-[11px]">
                        {article.id}
                      </span>
                      <Badge variant="primary" size="sm">
                        {article.category}
                      </Badge>
                      <Badge
                        variant={article.status === "Published" ? "success" : "silver"}
                        size="sm"
                        dot={article.status === "Published"}
                      >
                        {article.status}
                      </Badge>
                      <span className="text-[11px] text-text-muted">
                        &bull; {article.readTime || "5 menit baca"}
                      </span>
                    </div>

                    <div className="text-[11px] text-text-muted flex items-center gap-2">
                      <span>Diperbarui: {article.lastUpdated}</span>
                      <span>&bull;</span>
                      <span className="font-semibold text-primary">{article.author || article.editor}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-primary leading-snug">
                      {article.title}
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {article.summary}
                    </p>
                  </div>

                  {/* Takeaways pill box */}
                  {article.takeaways && article.takeaways.length > 0 && (
                    <div className="p-3 bg-surface rounded-xl border border-primary-light text-xs space-y-1.5">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">
                        Poin Kunci Edukasi (Takeaways):
                      </span>
                      <ul className="space-y-1 text-[11px] text-text-secondary">
                        {article.takeaways.slice(0, 2).map((t, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <CheckIcon className="text-emerald-600 text-[10px] mt-0.5 shrink-0" />
                            <span>{t}</span>
                          </li>
                        ))}
                        {article.takeaways.length > 2 && (
                          <li className="text-[10px] text-text-muted italic">
                            +{article.takeaways.length - 2} poin rekomendasi tambahan...
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Card Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-primary-light/60">
                    <div className="text-[11px] text-text-muted">
                      {article.content?.length || 1} Bagian Paragraf Konten Lengkap
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewItem(article)}
                        className="text-xs h-8 px-3 border-primary-light text-text-secondary hover:text-primary"
                      >
                        <EyeIcon className="text-xs mr-1" />
                        Pratinjau Artikel
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(article.id)}
                        className={`text-xs h-8 px-3 ${
                          article.status === "Published"
                            ? "text-text-muted hover:text-error hover:border-error"
                            : "text-emerald-700 hover:border-emerald-500"
                        }`}
                      >
                        {article.status === "Published" ? "Tarik ke Draft" : "Terbitkan"}
                      </Button>

                      <button
                        type="button"
                        onClick={() => handleDeleteItem(article.id)}
                        className="p-1.5 text-text-muted hover:text-error rounded-md transition-colors"
                        title="Hapus Artikel"
                      >
                        <TrashIcon className="text-xs" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {filteredZhouItems.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-text-muted">
              <span>
                Menampilkan {(zhouPage - 1) * zhouItemsPerPage + 1} &ndash;{" "}
                {Math.min(zhouPage * zhouItemsPerPage, filteredZhouItems.length)} dari{" "}
                {filteredZhouItems.length} artikel Zhou
              </span>
              <Pagination
                currentPage={zhouPage}
                totalPages={totalZhouPages}
                onPageChange={setZhouPage}
              />
            </div>
          )}
        </div>
      )}

      {/* TAB 3: BELAJAR PAJAK (LINK EDUKASI DARI KEMENKEU ATAU DJP) */}
      {activeTab === "belajar-pajak" && (
        <div className="space-y-6">
          {/* Header Banner for Government Learning Links */}
          <Card className="rounded-2xl border-amber-300 bg-gradient-to-r from-[#78350F] via-[#92400E] to-[#B45309] text-white p-6 shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 text-white">
                    Menu 2 Edukasi Pajak
                  </span>
                  <span className="text-xs text-amber-100">&bull; DJP &amp; Kemenkeu RI</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Belajar Pajak — Katalog Link Edukasi Resmi Kemenkeu &amp; DJP
                </h2>
                <p className="text-xs sm:text-sm text-amber-100 leading-relaxed">
                  Kelola tautan situs pembelajaran resmi dari Direktorat Jenderal Pajak (DJP) dan
                  Kementerian Keuangan RI, mencakup Simulator Coretax, Kemenkeu Learning Center (KLC),
                  video tutorial, e-learning, dan buku saku pajak.
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                <Button
                  type="button"
                  onClick={() => handleOpenAddModal("belajar-pajak")}
                  className="bg-white text-amber-900 hover:bg-white/90 text-xs font-bold h-10 px-4 rounded-xl flex items-center gap-2 shadow-sm"
                >
                  <PlusIcon className="text-xs" />
                  <span>Tambah Link Edukasi Baru</span>
                </Button>

                <Link
                  href="/edukasi?tab=belajar-pajak#belajar-pajak"
                  target="_blank"
                  className="text-xs font-semibold h-10 px-4 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 flex items-center gap-2 transition-colors"
                >
                  <EyeIcon className="text-xs" />
                  <span>Lihat Tab Belajar Pajak</span>
                </Link>
              </div>
            </div>
          </Card>

          {/* Search & Institution Filter */}
          <div className="bg-white rounded-2xl border border-primary-light p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <SearchIcon className="absolute left-3 top-2.5 text-text-muted text-xs" />
              <Input
                type="text"
                placeholder="Cari nama materi, situs resmi, atau URL Kemenkeu/DJP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs h-9 bg-surface border-primary-light focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <FilterIcon className="text-xs text-text-muted" />
                <span className="text-xs text-text-muted font-medium">Institusi:</span>
              </div>
              <select
                value={institutionFilter}
                onChange={(e) => setInstitutionFilter(e.target.value)}
                className="text-xs h-9 px-3 rounded-xl border border-primary-light bg-surface text-text-primary focus:bg-white font-medium focus:outline-none"
              >
                <option value="ALL">Semua Institusi ({belajarItems.length})</option>
                <option value="DJP">Direktorat Jenderal Pajak (DJP)</option>
                <option value="Kemenkeu">Kementerian Keuangan RI</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs h-9 px-3 rounded-xl border border-primary-light bg-surface text-text-primary focus:bg-white font-medium focus:outline-none"
              >
                <option value="ALL">Semua Status</option>
                <option value="Published">Published (Terbit)</option>
                <option value="Draft">Draft (Konsep)</option>
              </select>
            </div>
          </div>

          {/* Cards Grid for Belajar Pajak Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBelajarItems.length === 0 ? (
              <div className="col-span-2 p-8 text-center bg-white rounded-2xl border border-primary-light text-xs text-text-muted">
                Tidak ada tautan edukasi resmi yang sesuai dengan filter pencarian.
              </div>
            ) : (
              paginatedBelajarItems.map((link) => (
                <Card
                  key={link.id}
                  className="rounded-2xl border-primary-light bg-white p-5 shadow-xs hover:border-amber-400 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded text-[11px] border border-amber-200">
                          {link.id}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            link.institution === "DJP"
                              ? "bg-primary/10 text-primary border border-primary/20"
                              : "bg-amber-100 text-amber-900 border border-amber-300"
                          }`}
                        >
                          {link.institution === "DJP"
                            ? "Direktorat Jenderal Pajak"
                            : "Kementerian Keuangan RI"}
                        </span>
                      </div>

                      <Badge
                        variant={link.status === "Published" ? "success" : "silver"}
                        size="sm"
                        dot={link.status === "Published"}
                      >
                        {link.status}
                      </Badge>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-semibold text-text-muted bg-surface px-2 py-0.5 rounded border border-primary-light">
                          {link.mediaType === "Portal Web" ? "Situs Web" : (link.mediaType || "Situs Web")}
                        </span>
                        {link.badge && (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                            {link.badge}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-primary leading-snug">
                        {link.title}
                      </h3>
                      <p className="text-xs text-text-secondary leading-relaxed mt-1 line-clamp-2">
                        {link.summary}
                      </p>
                    </div>

                    {/* Official URL Box with test link */}
                    {link.url && (
                      <div className="p-2.5 rounded-xl bg-surface border border-primary-light flex items-center justify-between gap-2 text-xs">
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] text-text-muted block font-semibold">
                            Tautan Resmi Terverifikasi:
                          </span>
                          <span className="font-mono text-[11px] text-primary truncate block">
                            {link.url}
                          </span>
                        </div>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 p-1.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors"
                          title="Uji buka tautan resmi di tab baru"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      </div>
                    )}

                    {/* Highlights tags */}
                    {link.highlights && link.highlights.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {link.highlights.slice(0, 2).map((h, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] text-text-secondary bg-surface px-2 py-0.5 rounded-md border border-primary-light"
                          >
                            &bull; {h}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-primary-light/60">
                    <span className="text-[10px] text-text-muted">
                      Verifikasi: {link.lastUpdated}
                    </span>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewItem(link)}
                        className="text-xs h-8 px-2.5 border-primary-light text-text-secondary hover:text-primary"
                      >
                        <EyeIcon className="text-xs mr-1" />
                        Pratinjau
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(link.id)}
                        className={`text-xs h-8 px-2.5 ${
                          link.status === "Published"
                            ? "text-text-muted hover:text-error hover:border-error"
                            : "text-emerald-700 hover:border-emerald-500"
                        }`}
                      >
                        {link.status === "Published" ? "Tarik" : "Terbitkan"}
                      </Button>

                      <button
                        type="button"
                        onClick={() => handleDeleteItem(link.id)}
                        className="p-1.5 text-text-muted hover:text-error rounded-md transition-colors"
                        title="Hapus Tautan"
                      >
                        <TrashIcon className="text-xs" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {filteredBelajarItems.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-text-muted">
              <span>
                Menampilkan {(belajarPage - 1) * belajarItemsPerPage + 1} &ndash;{" "}
                {Math.min(belajarPage * belajarItemsPerPage, filteredBelajarItems.length)} dari{" "}
                {filteredBelajarItems.length} tautan edukasi
              </span>
              <Pagination
                currentPage={belajarPage}
                totalPages={totalBelajarPages}
                onPageChange={setBelajarPage}
              />
            </div>
          )}
        </div>
      )}

      {/* TAB 4: HERO BANNER & PROFIL */}
      {activeTab === "hero" && (
        <form onSubmit={handleSaveHero} className="space-y-6">
          <Card className="rounded-2xl border-primary-light bg-white p-6 shadow-xs space-y-5">
            <div>
              <h3 className="text-base font-bold text-primary">
                Penyuntingan Profil Perusahaan &amp; Hero Section
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Konten ini langsung memengaruhi tampilan utama landing page publik (http://localhost:3000).
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-primary">
                  Headline Utama Hero Section <span className="text-error">*</span>
                </Label>
                <Input
                  type="text"
                  required
                  value={heroForm.headline}
                  onChange={(e) =>
                    setHeroForm((prev) => ({ ...prev, headline: e.target.value }))
                  }
                  className="text-xs bg-surface border-primary-light focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-primary">
                  Subheadline / Ringkasan Value Proposition <span className="text-error">*</span>
                </Label>
                <Textarea
                  rows={3}
                  required
                  value={heroForm.subheadline}
                  onChange={(e) =>
                    setHeroForm((prev) => ({ ...prev, subheadline: e.target.value }))
                  }
                  className="text-xs bg-surface border-primary-light focus:bg-white leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-primary">
                  Deskripsi Foto Eksekutif Boardroom Sudirman
                </Label>
                <Input
                  type="text"
                  value={heroForm.boardroomCaption}
                  onChange={(e) =>
                    setHeroForm((prev) => ({ ...prev, boardroomCaption: e.target.value }))
                  }
                  className="text-xs bg-surface border-primary-light focus:bg-white"
                />
              </div>

              {/* 4 Credibility Metrics */}
              <div className="pt-3 border-t border-primary-light space-y-3">
                <Label className="text-xs font-bold text-primary uppercase tracking-wider block">
                  4 Metrik Kredibilitas Banner:
                </Label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    value={heroForm.metric1}
                    onChange={(e) =>
                      setHeroForm((prev) => ({ ...prev, metric1: e.target.value }))
                    }
                    className="text-xs bg-surface border-primary-light"
                  />
                  <Input
                    value={heroForm.metric2}
                    onChange={(e) =>
                      setHeroForm((prev) => ({ ...prev, metric2: e.target.value }))
                    }
                    className="text-xs bg-surface border-primary-light"
                  />
                  <Input
                    value={heroForm.metric3}
                    onChange={(e) =>
                      setHeroForm((prev) => ({ ...prev, metric3: e.target.value }))
                    }
                    className="text-xs bg-surface border-primary-light"
                  />
                  <Input
                    value={heroForm.metric4}
                    onChange={(e) =>
                      setHeroForm((prev) => ({ ...prev, metric4: e.target.value }))
                    }
                    className="text-xs bg-surface border-primary-light"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-primary-light flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="text-xs h-9 px-5 font-semibold"
              >
                Simpan &amp; Publikasikan Hero Section
              </Button>
            </div>
          </Card>
        </form>
      )}

      {/* TAB 5: KURS PAJAK KMK MINGGUAN */}
      {activeTab === "kurs" && (
        <form onSubmit={handleSaveKurs} className="space-y-6">
          <Card className="rounded-2xl border-primary-light bg-white p-6 shadow-xs space-y-5">
            <div>
              <h3 className="text-base font-bold text-primary">
                Pembaruan Kurs Pajak Mingguan Terbitan DJP (KMK)
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Nilai kurs ini ditayangkan pada tabel seksi peraturan di Landing Page dan rute /peraturan.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-primary">
                  Nomor Keputusan Menteri Keuangan (KMK)
                </Label>
                <Input
                  type="text"
                  required
                  value={kursForm.kmkNumber}
                  onChange={(e) =>
                    setKursForm((prev) => ({ ...prev, kmkNumber: e.target.value }))
                  }
                  className="text-xs bg-surface border-primary-light font-mono font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-primary">Masa Periode Berlaku</Label>
                <Input
                  type="text"
                  required
                  value={kursForm.period}
                  onChange={(e) =>
                    setKursForm((prev) => ({ ...prev, period: e.target.value }))
                  }
                  className="text-xs bg-surface border-primary-light"
                />
              </div>
            </div>

            {/* Currency Rates Table */}
            <div className="space-y-2 pt-2 text-xs">
              <Label className="text-xs font-bold text-primary uppercase tracking-wider block">
                Tarif Konversi Valuta Asing Terhadap Rupiah (IDR):
              </Label>

              <div className="divide-y divide-primary-light border border-primary-light rounded-xl overflow-hidden">
                {kursForm.rates.map((item, idx) => (
                  <div
                    key={item.currency}
                    className="p-3 bg-surface/40 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-12 font-bold font-mono text-primary text-xs bg-primary-light px-2 py-1 rounded text-center">
                        {item.currency}
                      </span>
                      <span className="text-text-secondary text-xs">{item.name}</span>
                    </div>

                    <div className="w-48">
                      <Input
                        type="text"
                        value={item.rate}
                        onChange={(e) => {
                          const updated = [...kursForm.rates];
                          updated[idx].rate = e.target.value;
                          setKursForm((prev) => ({ ...prev, rates: updated }));
                        }}
                        className="text-xs h-8 bg-white border-primary-light font-mono font-bold text-right"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-primary-light flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="text-xs h-9 px-5 font-semibold"
              >
                Simpan &amp; Perbarui Kurs KMK
              </Button>
            </div>
          </Card>
        </form>
      )}

      {/* TAB 6: REGULASI DJP */}
      {activeTab === "regulasi" && (
        <Card className="rounded-2xl border-primary-light bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-primary">Katalog Regulasi &amp; Putusan Fiskal</h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Daftar peraturan resmi yang terhubung dengan tautan unduh PDF pada /peraturan.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleOpenAddModal("regulasi")}
              className="text-xs h-8 px-3 border-primary-light"
            >
              <PlusIcon className="text-xs mr-1" />
              Tambah Regulasi
            </Button>
          </div>

          <div className="space-y-3 text-xs">
            {cmsItems
              .filter((i) => i.section === "regulasi")
              .map((reg) => (
                <div
                  key={reg.id}
                  className="p-4 rounded-xl bg-surface border border-primary-light flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <span className="font-mono text-[10px] text-text-muted">{reg.id}</span>
                    <h4 className="font-bold text-primary text-xs">{reg.title}</h4>
                    <p className="text-[11px] text-text-secondary">{reg.summary}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewItem(reg)}
                    className="text-xs h-8 px-3 shrink-0"
                  >
                    Edit &amp; Detail
                  </Button>
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* TAB 7: LOWONGAN KARIR */}
      {activeTab === "karir" && (
        <Card className="rounded-2xl border-primary-light bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-primary">Katalog Informasi Lowongan Karir</h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Posisi pekerjaan aktif yang dibuka di halaman rekrutmen (/karir).
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleOpenAddModal("karir")}
              className="text-xs h-8 px-3 border-primary-light"
            >
              <PlusIcon className="text-xs mr-1" />
              Buka Posisi Baru
            </Button>
          </div>

          <div className="space-y-3 text-xs">
            {cmsItems
              .filter((i) => i.section === "karir")
              .map((kar) => (
                <div
                  key={kar.id}
                  className="p-4 rounded-xl bg-surface border border-primary-light flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-text-muted">{kar.id}</span>
                      <Badge
                        variant={kar.status === "Published" ? "success" : "silver"}
                        size="sm"
                      >
                        {kar.status}
                      </Badge>
                    </div>
                    <h4 className="font-bold text-primary text-xs">{kar.title}</h4>
                    <p className="text-[11px] text-text-secondary">{kar.summary}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewItem(kar)}
                    className="text-xs h-8 px-3 shrink-0"
                  >
                    Edit &amp; Detail
                  </Button>
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* MODAL: TAMBAH KONTEN BARU */}
      {isNewItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-primary-light max-w-xl w-full p-6 space-y-5 relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsNewItemModalOpen(false)}
              className="absolute top-5 right-5 text-text-secondary hover:text-primary p-1"
              aria-label="Tutup modal"
            >
              <CloseIcon className="text-sm" />
            </button>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                Penerbitan Konten &amp; Materi Edukasi
              </span>
              <h3 className="text-lg font-bold text-primary">
                {newItemForm.section === "edukasi-zhou"
                  ? "Upload Materi Edukasi Zhou Baru"
                  : newItemForm.section === "belajar-pajak"
                  ? "Tambah Tautan Belajar Pajak (Kemenkeu & DJP)"
                  : "Tambah Konten CMS Baru"}
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                {newItemForm.section === "edukasi-zhou"
                  ? "Unggah artikel edukasi praktis yang disusun oleh internal konsultan Zhou Consulting."
                  : newItemForm.section === "belajar-pajak"
                  ? "Daftarkan tautan resmi eksternal dari situs DJP atau Kementerian Keuangan RI."
                  : "Buat materi regulasi, lowongan karir, atau konten landing page baru."}
              </p>
            </div>

            <form onSubmit={handleCreateNewItem} className="space-y-4 text-xs">
              {/* Target Section Selection */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-primary">
                  Menu &amp; Target Halaman <span className="text-error">*</span>
                </Label>
                <select
                  value={newItemForm.section}
                  onChange={(e) =>
                    setNewItemForm((prev) => ({
                      ...prev,
                      section: e.target.value as CMSItem["section"],
                    }))
                  }
                  className="w-full text-xs h-9 px-3 rounded-xl border border-primary-light bg-surface text-text-primary focus:bg-white font-medium focus:outline-none"
                >
                  <option value="edukasi-zhou">
                    1. Edukasi Zhou — Konten yang dapat di-upload Zhou
                  </option>
                  <option value="belajar-pajak">
                    2. Belajar Pajak — Link Edukasi dari Kemenkeu atau DJP
                  </option>
                  <option value="regulasi">Pusat Regulasi (/peraturan)</option>
                  <option value="karir">Karir &amp; Rekrutmen (/karir)</option>
                  <option value="hero">Profil &amp; Hero Banner</option>
                  <option value="kurs">Kurs Pajak KMK</option>
                </select>
              </div>

              {/* Title input */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-primary">
                  {newItemForm.section === "edukasi-zhou"
                    ? "Judul Artikel Edukasi Zhou"
                    : newItemForm.section === "belajar-pajak"
                    ? "Nama Materi / Situs Edukasi DJP & Kemenkeu"
                    : "Judul Konten"}{" "}
                  <span className="text-error">*</span>
                </Label>
                <Input
                  type="text"
                  required
                  placeholder={
                    newItemForm.section === "edukasi-zhou"
                      ? "e.g. Navigasi Kepatuhan Coretax 2026 bagi Entitas Bisnis"
                      : newItemForm.section === "belajar-pajak"
                      ? "e.g. Simulasi Coretax DJP Online Interaktif"
                      : "e.g. Asistensi Pemeriksaan Pajak"
                  }
                  value={newItemForm.title}
                  onChange={(e) => setNewItemForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="text-xs h-9 bg-surface border-primary-light focus:bg-white"
                />
              </div>

              {/* Dynamic inputs for EDUKASI ZHOU */}
              {newItemForm.section === "edukasi-zhou" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-primary">
                        Kategori Artikel <span className="text-error">*</span>
                      </Label>
                      <select
                        value={newItemForm.category}
                        onChange={(e) =>
                          setNewItemForm((prev) => ({ ...prev, category: e.target.value }))
                        }
                        className="w-full text-xs h-9 px-3 rounded-xl border border-primary-light bg-surface text-text-primary focus:bg-white font-medium focus:outline-none"
                      >
                        <option value="Coretax DJP 2026">Coretax DJP 2026</option>
                        <option value="Kepatuhan PPh & PPN">Kepatuhan PPh &amp; PPN</option>
                        <option value="Mitigasi SP2DK">Mitigasi SP2DK</option>
                        <option value="Akuntansi SAK">Akuntansi SAK</option>
                        <option value="Legal Korporat">Legal Korporat</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-primary">
                        Penulis / Konsultan Zhou <span className="text-error">*</span>
                      </Label>
                      <Input
                        type="text"
                        required
                        value={newItemForm.author}
                        onChange={(e) =>
                          setNewItemForm((prev) => ({ ...prev, author: e.target.value }))
                        }
                        placeholder="e.g. Linda David, S.Ak., BKP"
                        className="text-xs h-9 bg-surface border-primary-light focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-primary">
                        Estimasi Waktu Baca
                      </Label>
                      <Input
                        type="text"
                        value={newItemForm.readTime}
                        onChange={(e) =>
                          setNewItemForm((prev) => ({ ...prev, readTime: e.target.value }))
                        }
                        placeholder="e.g. 6 menit baca"
                        className="text-xs h-9 bg-surface border-primary-light focus:bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-primary">
                        Status Publikasi
                      </Label>
                      <select
                        value={newItemForm.status}
                        onChange={(e) =>
                          setNewItemForm((prev) => ({
                            ...prev,
                            status: e.target.value as CMSItem["status"],
                          }))
                        }
                        className="w-full text-xs h-9 px-3 rounded-xl border border-primary-light bg-surface text-text-primary focus:bg-white font-medium focus:outline-none"
                      >
                        <option value="Published">Published (Langsung Terbit ke Web)</option>
                        <option value="Draft">Draft (Simpan Konsep Internal)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-primary">
                      Ringkasan Singkat / Sinopsis <span className="text-error">*</span>
                    </Label>
                    <Textarea
                      rows={2}
                      required
                      placeholder="Ringkasan isi artikel edukasi untuk pratinjau kartu..."
                      value={newItemForm.summary}
                      onChange={(e) =>
                        setNewItemForm((prev) => ({ ...prev, summary: e.target.value }))
                      }
                      className="text-xs bg-surface border-primary-light focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-primary">
                      Poin-Poin Kunci / Takeaways (Pisahkan baris baru per poin)
                    </Label>
                    <Textarea
                      rows={3}
                      placeholder="Ekualisasi omzet berkala sebelum tutup buku&#10;Audit validitas NPWP 16 digit karyawan&#10;Penyusunan kertas kerja rekonsiliasi fiskal"
                      value={newItemForm.takeawaysRaw}
                      onChange={(e) =>
                        setNewItemForm((prev) => ({ ...prev, takeawaysRaw: e.target.value }))
                      }
                      className="text-xs bg-surface border-primary-light focus:bg-white font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-primary">
                      Isi Paragraf Konten Lengkap (Pisahkan baris ganda per paragraf)
                    </Label>
                    <Textarea
                      rows={4}
                      placeholder="Tulis uraian mendalam artikel edukasi di sini..."
                      value={newItemForm.contentRaw}
                      onChange={(e) =>
                        setNewItemForm((prev) => ({ ...prev, contentRaw: e.target.value }))
                      }
                      className="text-xs bg-surface border-primary-light focus:bg-white"
                    />
                  </div>
                </>
              )}

              {/* Dynamic inputs for BELAJAR PAJAK (KEMENKEU & DJP) */}
              {newItemForm.section === "belajar-pajak" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-primary">
                        Institusi Pemerintah <span className="text-error">*</span>
                      </Label>
                      <select
                        value={newItemForm.institution}
                        onChange={(e) =>
                          setNewItemForm((prev) => ({
                            ...prev,
                            institution: e.target.value as "DJP" | "Kemenkeu",
                          }))
                        }
                        className="w-full text-xs h-9 px-3 rounded-xl border border-primary-light bg-surface text-text-primary focus:bg-white font-medium focus:outline-none"
                      >
                        <option value="DJP">Direktorat Jenderal Pajak (DJP)</option>
                        <option value="Kemenkeu">Kementerian Keuangan RI (Kemenkeu)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-primary">
                        Format Media Pembelajaran <span className="text-error">*</span>
                      </Label>
                      <select
                        value={newItemForm.mediaType}
                        onChange={(e) =>
                          setNewItemForm((prev) => ({
                            ...prev,
                            mediaType: e.target.value as BelajarPajakLink["type"],
                          }))
                        }
                        className="w-full text-xs h-9 px-3 rounded-xl border border-primary-light bg-surface text-text-primary focus:bg-white font-medium focus:outline-none"
                      >
                        <option value="Simulator DJP">Simulator DJP</option>
                        <option value="Situs Web">Situs Web</option>
                        <option value="Video Tutorial">Video Tutorial</option>
                        <option value="E-Learning">E-Learning</option>
                        <option value="Buku Panduan (PDF)">Buku Panduan (PDF)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-primary">
                      Tautan URL Resmi Pemerintah <span className="text-error">*</span>
                    </Label>
                    <Input
                      type="url"
                      required
                      placeholder="https://simulator-coretax.pajak.go.id/ atau https://klc2.kemenkeu.go.id/"
                      value={newItemForm.url}
                      onChange={(e) =>
                        setNewItemForm((prev) => ({ ...prev, url: e.target.value }))
                      }
                      className="text-xs h-9 bg-surface border-primary-light focus:bg-white font-mono"
                    />
                    <span className="text-[10px] text-text-muted">
                      Pastikan URL berawalan https:// dan berasal dari domain terpercaya instansi (.go.id).
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-primary">Label Badge Singkat</Label>
                      <Input
                        type="text"
                        value={newItemForm.badge}
                        onChange={(e) =>
                          setNewItemForm((prev) => ({ ...prev, badge: e.target.value }))
                        }
                        placeholder="e.g. Simulator Interaktif"
                        className="text-xs h-9 bg-surface border-primary-light focus:bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-primary">
                        Status Publikasi
                      </Label>
                      <select
                        value={newItemForm.status}
                        onChange={(e) =>
                          setNewItemForm((prev) => ({
                            ...prev,
                            status: e.target.value as CMSItem["status"],
                          }))
                        }
                        className="w-full text-xs h-9 px-3 rounded-xl border border-primary-light bg-surface text-text-primary focus:bg-white font-medium focus:outline-none"
                      >
                        <option value="Published">Published (Langsung Terbit ke Web)</option>
                        <option value="Draft">Draft (Simpan Konsep Internal)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-primary">
                      Deskripsi Panduan / Nilai Pembelajaran <span className="text-error">*</span>
                    </Label>
                    <Textarea
                      rows={2}
                      required
                      placeholder="Jelaskan manfaat materi atau situs bagi wajib pajak..."
                      value={newItemForm.summary}
                      onChange={(e) =>
                        setNewItemForm((prev) => ({ ...prev, summary: e.target.value }))
                      }
                      className="text-xs bg-surface border-primary-light focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-primary">
                      Poin Keunggulan / Fitur Utama (Pisahkan baris baru per poin)
                    </Label>
                    <Textarea
                      rows={3}
                      placeholder="Simulasi faktur pajak tanpa risiko sanksi&#10;Panduan pengisian SPT Masa terpadu&#10;Akses gratis tanpa registrasi rumit"
                      value={newItemForm.highlightsRaw}
                      onChange={(e) =>
                        setNewItemForm((prev) => ({ ...prev, highlightsRaw: e.target.value }))
                      }
                      className="text-xs bg-surface border-primary-light focus:bg-white font-mono"
                    />
                  </div>
                </>
              )}

              {/* Standard inputs for Regulasi & Karir */}
              {newItemForm.section !== "edukasi-zhou" && newItemForm.section !== "belajar-pajak" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-primary">
                        Kategori / Tag <span className="text-error">*</span>
                      </Label>
                      <Input
                        type="text"
                        required
                        value={newItemForm.category}
                        onChange={(e) =>
                          setNewItemForm((prev) => ({ ...prev, category: e.target.value }))
                        }
                        className="text-xs h-9 bg-surface border-primary-light focus:bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-primary">Status Publikasi</Label>
                      <select
                        value={newItemForm.status}
                        onChange={(e) =>
                          setNewItemForm((prev) => ({
                            ...prev,
                            status: e.target.value as CMSItem["status"],
                          }))
                        }
                        className="w-full text-xs h-9 px-3 rounded-xl border border-primary-light bg-surface text-text-primary focus:bg-white font-medium focus:outline-none"
                      >
                        <option value="Published">Published (Langsung Terbit)</option>
                        <option value="Draft">Draft (Simpan Konsep)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-primary">
                      Ringkasan / Sinopsis Konten
                    </Label>
                    <Textarea
                      rows={3}
                      placeholder="Tulis ringkasan isi pokok materi yang akan ditampilkan..."
                      value={newItemForm.summary}
                      onChange={(e) =>
                        setNewItemForm((prev) => ({ ...prev, summary: e.target.value }))
                      }
                      className="text-xs bg-surface border-primary-light focus:bg-white"
                    />
                  </div>
                </>
              )}

              <div className="pt-4 border-t border-primary-light flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsNewItemModalOpen(false)}
                  className="text-xs h-9 px-4 border-primary-light"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="text-xs h-9 px-5 font-semibold"
                >
                  {newItemForm.section === "edukasi-zhou"
                    ? "Unggah & Terbitkan Artikel"
                    : newItemForm.section === "belajar-pajak"
                    ? "Simpan & Daftarkan Tautan"
                    : "Terbitkan Konten"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PRATINJAU CEPAT KONTEN */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-primary-light max-w-xl w-full p-6 space-y-4 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setPreviewItem(null)}
              className="absolute top-5 right-5 text-text-secondary hover:text-primary p-1"
              aria-label="Tutup modal"
            >
              <CloseIcon className="text-sm" />
            </button>

            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[11px] font-bold text-primary bg-primary-light px-2 py-0.5 rounded">
                  {previewItem.id}
                </span>

                {previewItem.section === "edukasi-zhou" ? (
                  <span className="bg-primary/10 text-primary border border-primary/20 uppercase text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full">
                    Edukasi Zhou
                  </span>
                ) : previewItem.section === "belajar-pajak" ? (
                  <span className="bg-amber-100 text-amber-900 border border-amber-300 uppercase text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full">
                    Belajar Pajak ({previewItem.institution})
                  </span>
                ) : (
                  <span className="text-text-muted text-[10px] uppercase font-bold tracking-wider">
                    [{previewItem.section}]
                  </span>
                )}

                <Badge
                  variant={previewItem.status === "Published" ? "success" : "silver"}
                  size="sm"
                >
                  {previewItem.status}
                </Badge>

                {previewItem.mediaType && (
                  <span className="text-[10px] bg-surface text-text-secondary px-2 py-0.5 rounded border border-primary-light font-medium">
                    {previewItem.mediaType}
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold text-primary leading-snug">
                {previewItem.title}
              </h3>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-primary-light space-y-3 text-xs">
              <div className="flex items-center justify-between text-[11px] text-text-muted flex-wrap gap-2">
                <span>
                  Kategori: <strong className="text-primary">{previewItem.category}</strong>
                </span>
                <span>
                  {previewItem.section === "edukasi-zhou" ? "Penulis: " : "Penyedia: "}
                  <strong className="text-primary">
                    {previewItem.author || previewItem.editor}
                  </strong>
                </span>
              </div>

              <div className="text-[11px] text-text-muted">
                Tanggal Terdaftar: {previewItem.lastUpdated}
                {previewItem.readTime && ` &bull; ${previewItem.readTime}`}
              </div>

              <p className="text-text-secondary text-xs leading-relaxed pt-2 border-t border-primary-light">
                {previewItem.summary}
              </p>

              {/* Official URL box for Belajar Pajak */}
              {previewItem.url && (
                <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider">
                      Tautan Eksternal Resmi Pemerintah:
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                      Terverifikasi Resmi
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-amber-950 break-all">
                    {previewItem.url}
                  </div>
                  <a
                    href={previewItem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] text-white bg-amber-700 hover:bg-amber-800 px-3 py-1.5 rounded-lg font-semibold transition-colors"
                  >
                    <span>Buka Tautan Eksternal</span>
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>
              )}

              {/* Takeaways for Zhou article */}
              {previewItem.takeaways && previewItem.takeaways.length > 0 && (
                <div className="p-3 bg-white rounded-xl border border-primary-light text-xs space-y-1.5">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">
                    Poin Rekomendasi Konsultan:
                  </span>
                  <ul className="space-y-1 text-[11px] text-text-secondary">
                    {previewItem.takeaways.map((t, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckIcon className="text-emerald-600 text-[10px] mt-0.5 shrink-0" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Highlights for Belajar Pajak */}
              {previewItem.highlights && previewItem.highlights.length > 0 && (
                <div className="p-3 bg-white rounded-xl border border-primary-light text-xs space-y-1.5">
                  <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">
                    Fitur &amp; Keunggulan Materi:
                  </span>
                  <ul className="space-y-1 text-[11px] text-text-secondary">
                    {previewItem.highlights.map((h, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Content preview for Zhou article */}
              {previewItem.content && previewItem.content.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-primary-light">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">
                    Pratinjau Isi Materi Lengkap:
                  </span>
                  {previewItem.content.map((p, idx) => (
                    <p key={idx} className="text-[11px] text-text-secondary leading-relaxed">
                      {p}
                    </p>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPreviewItem(null)}
                className="text-xs h-8 px-4"
              >
                Tutup Pratinjau
              </Button>

              <div className="flex items-center gap-2">
                {previewItem.section === "edukasi-zhou" && (
                  <Link
                    href="/edukasi"
                    target="_blank"
                    className="text-xs h-8 px-3 rounded-xl border border-primary-light bg-surface text-primary font-semibold hover:bg-primary-light flex items-center gap-1.5 transition-colors"
                  >
                    <span>Lihat di Web</span>
                  </Link>
                )}

                {previewItem.section === "belajar-pajak" && (
                  <Link
                    href="/edukasi?tab=belajar-pajak#belajar-pajak"
                    target="_blank"
                    className="text-xs h-8 px-3 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 font-semibold hover:bg-amber-100 flex items-center gap-1.5 transition-colors"
                  >
                    <span>Lihat di Web</span>
                  </Link>
                )}

                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    handleToggleStatus(previewItem.id);
                    setPreviewItem(null);
                  }}
                  className="text-xs h-8 px-4 font-semibold"
                >
                  {previewItem.status === "Published"
                    ? "Alihkan ke Draft"
                    : "Publikasikan Sekarang"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminCMSPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-text-muted">
          Memuat CMS &amp; Direktori Edukasi Pajak...
        </div>
      }
    >
      <AdminCMSPageContent />
    </Suspense>
  );
}
