"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
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
  BuildingIcon,
  SearchIcon,
  PlusIcon,
  CloseIcon,
  EyeIcon,
  TrashIcon,
  BookIcon,
  EditIcon,
  ClockIcon,
  CalendarIcon,
} from "@/components/icons";

import {
  PublicSectionKey,
  ContentStatus,
  PublicCMSItem,
  buildInitialPublicCMSItems,
  INITIAL_HOMEPAGE_CONTENT,
  INITIAL_COMPANY_PROFILE,
  INITIAL_SERVICES,
  INITIAL_KMK_RATES,
  INITIAL_CAREERS,
  INITIAL_CONTACT_CONTENT,
  HomepageContent,
  CompanyProfileContent,
  ServiceItemContent,
  KmkRatesContent,
  CareerJobItem,
  ContactConsultationContent,
} from "@/data/publicContentData";
import { BELAJAR_PAJAK_LINKS, ZhouArticle } from "@/data/edukasiData";
import {
  getStoredZhouArticles,
  addZhouArticle,
  updateZhouArticle,
  deleteZhouArticle,
  toggleArticleStatus,
  toggleArticleFeatured,
  resetZhouArticlesToDefault,
  ZHOU_ARTICLES_EVENT,
} from "@/data/edukasiStorage";
import {
  StoredRegulationItem,
  RegulationCategory,
  RegulationStatus,
  REGULATION_CATEGORIES,
  getStoredRegulations,
  addRegulation,
  updateRegulation,
  deleteRegulation,
  toggleRegulationStatus,
  resetRegulationsToDefault,
  REGULATIONS_EVENT,
} from "@/data/regulasiStorage";
import {
  CareerSettings,
  DEFAULT_CAREER_SETTINGS,
  getStoredCareerSettings,
  saveStoredCareerSettings,
  resetStoredCareerSettings,
  CAREER_SETTINGS_EVENT,
} from "@/data/karirStorage";

// Operational tickets (Preserved from existing functionality)
interface ChecklistItem {
  id: number;
  text: string;
  done: boolean;
}

interface AdminTicket {
  id: string;
  clientName: string;
  clientId: string;
  title: string;
  category: string;
  consultant: string;
  status: "In Progress" | "Completed";
  slaDue: string;
  deliverableFile?: string;
  checklists: ChecklistItem[];
}

const PRESERVED_TICKETS: AdminTicket[] = [
  {
    id: "TK-2026-089",
    clientName: "PT Maju Makmur Sentosa",
    clientId: "CL-88219",
    title: "Pelaporan SPT Tahunan Badan & Ekualisasi Fiskal 2025",
    category: "Tax Service Core",
    consultant: "Linda David, S.Ak., BKP",
    status: "In Progress",
    slaDue: "25 Sep 2026",
    deliverableFile: "Draft_Rekonsiliasi_Fiskal_2025_v1.pdf",
    checklists: [
      { id: 1, text: "Telaah laporan keuangan komersial & jurnal penyesuaian", done: true },
      { id: 2, text: "Kompilasi rekonsiliasi fiskal positif/negatif UU HPP", done: true },
      { id: 3, text: "Verifikasi kredit pajak PPh 22, 23, 25 & bukti potong unifikasi", done: true },
      { id: 4, text: "Finalisasi draft SPT Tahunan & pengunggahan ke sistem Coretax DJP", done: false },
    ],
  },
  {
    id: "TK-2026-092",
    clientName: "CV Borneo Karya Prima",
    clientId: "CL-74102",
    title: "Penyusunan Jurnal Buku Besar & Laporan Laba Rugi Q3 SAK EP",
    category: "Accounting Service",
    consultant: "Tasya Anggraeni Firdaus, SE., Ak., CA",
    status: "In Progress",
    slaDue: "28 Sep 2026",
    checklists: [
      { id: 1, text: "Verifikasi nota transaksi pembelian & penjualan komersial", done: true },
      { id: 2, text: "Posting jurnal umum ke buku besar standar SAK", done: false },
      { id: 3, text: "Rekonsiliasi mutasi kas, giro, & deposito bank", done: false },
    ],
  },
  {
    id: "TK-2026-077",
    clientName: "PT Solusi Niaga Terpadu",
    clientId: "CL-90145",
    title: "Studi Kelayakan Investasi & Proyeksi Finansial Ekspansi",
    category: "Business Financial Consulting",
    consultant: "Linda David, S.Ak., BKP",
    status: "In Progress",
    slaDue: "30 Sep 2026",
    checklists: [
      { id: 1, text: "Pengumpulan data historis arus kas 3 tahun terakhir", done: true },
      { id: 2, text: "Perhitungan simulasi NPV, IRR, dan Payback Period", done: true },
      { id: 3, text: "Penyusunan executive presentation kelayakan modal kerja", done: false },
    ],
  },
];

type AdminNavSection =
  | "overview"
  | "homepage"
  | "company"
  | "services"
  | "regulations"
  | "kurs"
  | "education"
  | "careers"
  | "contact"
  | "tickets";

function AdminDashboardContent() {
  const searchParams = useSearchParams();
  const sectionParam = (searchParams.get("section") as AdminNavSection) || "overview";

  // Navigation state
  const [activeSection, setActiveSection] = useState<AdminNavSection>(sectionParam);

  // Master CMS items state
  const [cmsItems, setCmsItems] = useState<PublicCMSItem[]>(buildInitialPublicCMSItems);

  // Specific state for sections
  const [homepageContent, setHomepageContent] = useState<HomepageContent>(INITIAL_HOMEPAGE_CONTENT);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfileContent>(INITIAL_COMPANY_PROFILE);
  const [servicesList] = useState<ServiceItemContent[]>(INITIAL_SERVICES);
  // Regulations & SOP Zhou CRUD State
  const [regulationsList, setRegulationsList] = useState<StoredRegulationItem[]>([]);
  const [regSearchQuery, setRegSearchQuery] = useState("");
  const [regCategoryFilter, setRegCategoryFilter] = useState("Semua");
  const [regStatusFilter, setRegStatusFilter] = useState("Semua");

  // Regulation Modals
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [regItemToEdit, setRegItemToEdit] = useState<StoredRegulationItem | null>(null);
  const [regItemToDelete, setRegItemToDelete] = useState<StoredRegulationItem | null>(null);

  // Regulation Form State
  const [regForm, setRegForm] = useState<{
    docNumber: string;
    title: string;
    category: RegulationCategory;
    effectiveDate: string;
    scope: string;
    fileSize: string;
    status: RegulationStatus;
  }>({
    docNumber: "",
    title: "",
    category: "Regulasi Zhou",
    effectiveDate: "",
    scope: "",
    fileSize: "1.8 MB",
    status: "Berlaku",
  });
  const [kmkRates, setKmkRates] = useState<KmkRatesContent>(INITIAL_KMK_RATES);
  const [careersList] = useState<CareerJobItem[]>(INITIAL_CAREERS);
  const [careerSettings, setCareerSettings] = useState<CareerSettings>(DEFAULT_CAREER_SETTINGS);
  const [careerSettingsSaved, setCareerSettingsSaved] = useState<boolean>(false);
  const [contactContent, setContactContent] = useState<ContactConsultationContent>(INITIAL_CONTACT_CONTENT);
  const [ticketsList, setTicketsList] = useState<AdminTicket[]>(PRESERVED_TICKETS);
  const [selectedTicket, setSelectedTicket] = useState<AdminTicket>(PRESERVED_TICKETS[0]);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [educationSubTab, setEducationSubTab] = useState<"zhou" | "gov">("zhou");

  // Edukasi Zhou CRUD State
  const [zhouArticles, setZhouArticles] = useState<ZhouArticle[]>([]);
  const [zhouSearchQuery, setZhouSearchQuery] = useState("");
  const [zhouCategoryFilter, setZhouCategoryFilter] = useState("ALL");
  const [zhouStatusFilter, setZhouStatusFilter] = useState("ALL");

  // Edukasi Zhou Modals
  const [isZhouUploadModalOpen, setIsZhouUploadModalOpen] = useState(false);
  const [zhouItemToEdit, setZhouItemToEdit] = useState<ZhouArticle | null>(null);
  const [zhouItemToPreview, setZhouItemToPreview] = useState<ZhouArticle | null>(null);
  const [zhouItemToDelete, setZhouItemToDelete] = useState<ZhouArticle | null>(null);

  // Form state for Upload / Edit Zhou Article
  const [zhouForm, setZhouForm] = useState({
    title: "",
    category: "Coretax DJP 2026",
    categoryKey: "coretax",
    author: "Tim Konsultan BKP Zhou Consulting",
    readTime: "7 menit baca",
    date: "",
    summary: "",
    takeawaysRaw: "",
    contentRaw: "",
    status: "Published" as "Published" | "Draft",
    isFeatured: true,
    hasAttachment: true,
    attachmentName: "Modul_Edukasi_Zhou_2026.pdf",
    attachmentSize: "2.4 MB",
    attachmentType: "PDF",
  });

  // Sync Zhou Articles with localStorage on mount & events
  useEffect(() => {
    setZhouArticles(getStoredZhouArticles());

    const handleUpdate = () => {
      setZhouArticles(getStoredZhouArticles());
    };

    window.addEventListener(ZHOU_ARTICLES_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener(ZHOU_ARTICLES_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // Sync Regulations & SOP Zhou with localStorage on mount & events
  useEffect(() => {
    setRegulationsList(getStoredRegulations());

    const handleRegUpdate = () => {
      setRegulationsList(getStoredRegulations());
    };

    window.addEventListener(REGULATIONS_EVENT, handleRegUpdate);
    window.addEventListener("storage", handleRegUpdate);
    return () => {
      window.removeEventListener(REGULATIONS_EVENT, handleRegUpdate);
      window.removeEventListener("storage", handleRegUpdate);
    };
  }, []);

  // Sync Career Settings with localStorage on mount & events
  useEffect(() => {
    setCareerSettings(getStoredCareerSettings());

    const handleCareerUpdate = () => {
      setCareerSettings(getStoredCareerSettings());
    };

    window.addEventListener(CAREER_SETTINGS_EVENT, handleCareerUpdate);
    window.addEventListener("storage", handleCareerUpdate);
    return () => {
      window.removeEventListener(CAREER_SETTINGS_EVENT, handleCareerUpdate);
      window.removeEventListener("storage", handleCareerUpdate);
    };
  }, []);

  const handleToggleCareerOpenStatus = () => {
    const updated: CareerSettings = {
      ...careerSettings,
      isOpen: !careerSettings.isOpen,
      lastUpdated: new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    };
    setCareerSettings(updated);
    saveStoredCareerSettings(updated);
    setCareerSettingsSaved(true);
    setTimeout(() => setCareerSettingsSaved(false), 3500);
  };

  const handleSaveCareerAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: CareerSettings = {
      ...careerSettings,
      lastUpdated: new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    };
    saveStoredCareerSettings(updated);
    setCareerSettingsSaved(true);
    setTimeout(() => setCareerSettingsSaved(false), 3500);
  };

  const handleResetCareerAnnouncement = () => {
    if (confirm("Reset pengaturan dan teks pengumuman karir ke teks default?")) {
      resetStoredCareerSettings();
      setCareerSettings(DEFAULT_CAREER_SETTINGS);
      setCareerSettingsSaved(true);
      setTimeout(() => setCareerSettingsSaved(false), 3500);
    }
  };

  const handleOpenAddRegulation = (categoryDefault?: RegulationCategory) => {
    const todayStr = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    setRegItemToEdit(null);
    setRegForm({
      docNumber: categoryDefault === "Regulasi Zhou" || !categoryDefault ? "SOP-ZHOU/2026/01" : "PER-05/PJ/2026",
      title: "",
      category: categoryDefault || "Regulasi Zhou",
      effectiveDate: todayStr,
      scope: "",
      fileSize: "1.8 MB",
      status: "Berlaku",
    });
    setIsRegModalOpen(true);
  };

  const handleOpenEditRegulation = (reg: StoredRegulationItem) => {
    setRegItemToEdit(reg);
    setRegForm({
      docNumber: reg.docNumber,
      title: reg.title,
      category: reg.category,
      effectiveDate: reg.effectiveDate,
      scope: reg.scope,
      fileSize: reg.fileSize,
      status: reg.status,
    });
    setIsRegModalOpen(true);
  };

  const handleSaveRegulation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.title.trim() || !regForm.docNumber.trim()) return;

    if (regItemToEdit) {
      updateRegulation(regItemToEdit.id, regForm);
    } else {
      addRegulation(regForm);
    }
    setIsRegModalOpen(false);
    setRegItemToEdit(null);
  };

  const handleConfirmDeleteRegulation = () => {
    if (!regItemToDelete) return;
    deleteRegulation(regItemToDelete.id);
    setRegItemToDelete(null);
  };

  const handleToggleRegStatus = (id: string) => {
    toggleRegulationStatus(id);
  };

  const handleResetRegulations = () => {
    if (window.confirm("Kembalikan daftar regulasi dan SOP ke pengaturan awal (default)?")) {
      resetRegulationsToDefault();
    }
  };

  const filteredAdminRegulations = useMemo(() => {
    return regulationsList.filter((item) => {
      const matchCategory =
        regCategoryFilter === "Semua" || item.category === regCategoryFilter;
      const matchStatus =
        regStatusFilter === "Semua" || item.status === regStatusFilter;
      const q = regSearchQuery.toLowerCase().trim();
      const matchQuery =
        q === "" ||
        item.docNumber.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.scope.toLowerCase().includes(q);
      return matchCategory && matchStatus && matchQuery;
    });
  }, [regulationsList, regCategoryFilter, regStatusFilter, regSearchQuery]);

  const handleOpenUploadZhou = () => {
    const todayStr = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    setZhouItemToEdit(null);
    setZhouForm({
      title: "",
      category: "Coretax DJP 2026",
      categoryKey: "coretax",
      author: "Tim Konsultan BKP Zhou Consulting",
      readTime: "7 menit baca",
      date: todayStr,
      summary: "",
      takeawaysRaw: "Poin rekomendasi kepatuhan fiskal 1\nPoin mitigasi risiko regulasi 2",
      contentRaw: "Paragraf pertama materi edukasi perpajakan Zhou Consulting...\n\nParagraf kedua pembahasan regulasi teknis...",
      status: "Published",
      isFeatured: true,
      hasAttachment: true,
      attachmentName: "Modul_Panduan_Fiskal_Zhou_2026.pdf",
      attachmentSize: "2.4 MB",
      attachmentType: "PDF",
    });
    setIsZhouUploadModalOpen(true);
  };

  const handleOpenEditZhou = (art: ZhouArticle) => {
    setZhouItemToEdit(art);
    setZhouForm({
      title: art.title,
      category: art.category,
      categoryKey: art.categoryKey || "coretax",
      author: art.author,
      readTime: art.readTime,
      date: art.date,
      summary: art.summary,
      takeawaysRaw: art.takeaways ? art.takeaways.join("\n") : "",
      contentRaw: art.content ? art.content.join("\n\n") : "",
      status: art.status || "Published",
      isFeatured: art.isFeatured !== false,
      hasAttachment: !!art.attachment,
      attachmentName: art.attachment?.name || "Modul_Edukasi_Zhou.pdf",
      attachmentSize: art.attachment?.size || "2.4 MB",
      attachmentType: art.attachment?.type || "PDF",
    });
    setIsZhouUploadModalOpen(true);
  };

  const handleSaveZhou = (e: React.FormEvent) => {
    e.preventDefault();
    if (!zhouForm.title.trim()) return;

    const takeaways = zhouForm.takeawaysRaw
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean);

    const content = zhouForm.contentRaw
      .split("\n\n")
      .map((c) => c.trim())
      .filter(Boolean);

    const attachment = zhouForm.hasAttachment && zhouForm.attachmentName.trim()
      ? {
          name: zhouForm.attachmentName.trim(),
          size: zhouForm.attachmentSize.trim() || "2.5 MB",
          type: zhouForm.attachmentType.trim() || "PDF",
        }
      : undefined;

    if (zhouItemToEdit) {
      const updated = updateZhouArticle(zhouItemToEdit.id, {
        title: zhouForm.title.trim(),
        category: zhouForm.category,
        categoryKey: zhouForm.categoryKey,
        author: zhouForm.author.trim(),
        readTime: zhouForm.readTime.trim(),
        date: zhouForm.date.trim(),
        summary: zhouForm.summary.trim(),
        takeaways: takeaways.length > 0 ? takeaways : ["Poin rekomendasi konsultan"],
        content: content.length > 0 ? content : [zhouForm.summary.trim()],
        status: zhouForm.status,
        isFeatured: zhouForm.isFeatured,
        attachment,
      });
      setZhouArticles(updated);
      showToast(`Materi "${zhouForm.title.substring(0, 25)}..." berhasil diperbarui.`);
    } else {
      const todayStr = zhouForm.date.trim() || new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const newArticle = addZhouArticle({
        title: zhouForm.title.trim(),
        category: zhouForm.category,
        categoryKey: zhouForm.categoryKey,
        author: zhouForm.author.trim() || "Tim Konsultan BKP Zhou Consulting",
        readTime: zhouForm.readTime.trim() || "5 menit baca",
        date: todayStr,
        summary: zhouForm.summary.trim(),
        takeaways: takeaways.length > 0 ? takeaways : ["Poin rekomendasi konsultan Zhou"],
        content: content.length > 0 ? content : [zhouForm.summary.trim()],
        status: zhouForm.status,
        isFeatured: zhouForm.isFeatured,
        attachment,
      });
      setZhouArticles((prev) => [newArticle, ...prev]);
      showToast(`Modul/materi "${newArticle.title.substring(0, 25)}..." berhasil di-upload.`);
    }

    setIsZhouUploadModalOpen(false);
    setZhouItemToEdit(null);
  };

  const handleConfirmDeleteZhou = () => {
    if (!zhouItemToDelete) return;
    const updated = deleteZhouArticle(zhouItemToDelete.id);
    setZhouArticles(updated);
    showToast(`Materi "${zhouItemToDelete.title.substring(0, 25)}..." berhasil dihapus.`);
    setZhouItemToDelete(null);
  };

  const handleToggleZhouStatus = (id: string) => {
    const updated = toggleArticleStatus(id);
    setZhouArticles(updated);
    const item = updated.find((a) => a.id === id);
    if (item) {
      showToast(`Status materi dialihkan ke [${item.status}].`);
    }
  };

  const handleToggleZhouFeatured = (id: string) => {
    const updated = toggleArticleFeatured(id);
    setZhouArticles(updated);
    const item = updated.find((a) => a.id === id);
    if (item) {
      showToast(
        item.isFeatured !== false
          ? `Materi "${item.title.substring(0, 25)}..." diaktifkan di Carousel Unggulan.`
          : `Materi "${item.title.substring(0, 25)}..." dilepas dari Carousel Unggulan.`
      );
    }
  };

  const handleResetZhou = () => {
    const defaultList = resetZhouArticlesToDefault();
    setZhouArticles(defaultList);
    showToast("Katalog materi Zhou dikembalikan ke modul default.");
  };

  const filteredZhouArticles = useMemo(() => {
    return zhouArticles.filter((art) => {
      const matchCat =
        zhouCategoryFilter === "ALL" ||
        art.category === zhouCategoryFilter ||
        art.categoryKey === zhouCategoryFilter;
      const matchStatus =
        zhouStatusFilter === "ALL" || (art.status || "Published") === zhouStatusFilter;
      const q = zhouSearchQuery.toLowerCase();
      const matchQ =
        zhouSearchQuery === "" ||
        art.title.toLowerCase().includes(q) ||
        art.summary.toLowerCase().includes(q) ||
        art.author.toLowerCase().includes(q) ||
        art.category.toLowerCase().includes(q);
      return matchCat && matchStatus && matchQ;
    });
  }, [zhouArticles, zhouCategoryFilter, zhouStatusFilter, zhouSearchQuery]);

  // Feedback notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [previewItem, setPreviewItem] = useState<PublicCMSItem | null>(null);
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<PublicCMSItem | null>(null);

  // New item form state
  const [newItemForm, setNewItemForm] = useState({
    section: "services" as PublicSectionKey,
    title: "",
    category: "Pajak",
    summary: "",
    status: "Published" as ContentStatus,
    author: "Linda David, S.Ak., BKP",
    url: "",
    institution: "DJP" as "DJP" | "Kemenkeu",
    mediaType: "Situs Web",
  });

  // Sync active section from URL search params
  useEffect(() => {
    const sec = searchParams.get("section") as AdminNavSection;
    if (sec && sec !== activeSection) {
      setActiveSection(sec);
    }
  }, [searchParams, activeSection]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Toggle Content Status (Draft <-> Published)
  const handleToggleStatus = (id: string) => {
    setCmsItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus: ContentStatus = item.status === "Published" ? "Draft" : "Published";
          showToast(`Status "${item.title.substring(0, 30)}..." dialihkan ke [${nextStatus}].`);
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  };

  // Confirm delete item
  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    setCmsItems((prev) => prev.filter((i) => i.id !== itemToDelete.id));
    showToast(`Konten "${itemToDelete.title.substring(0, 25)}..." berhasil dihapus dari direktori CMS.`);
    setItemToDelete(null);
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

    let route = "/";
    let sectionLabel = "Konten Publik";

    switch (newItemForm.section) {
      case "services":
        route = "/layanan/tax-service";
        sectionLabel = "Layanan";
        break;
      case "regulations":
        route = "/peraturan";
        sectionLabel = "Peraturan";
        break;
      case "education-zhou":
        route = "/edukasi";
        sectionLabel = "Edukasi Zhou";
        break;
      case "education-gov":
        route = "/edukasi?tab=belajar-pajak#belajar-pajak";
        sectionLabel = "Belajar Pajak Gov";
        break;
      case "careers":
        route = "/karir";
        sectionLabel = "Karir";
        break;
      case "contact":
        route = "/kontak";
        sectionLabel = "Kontak";
        break;
      default:
        route = "/";
    }

    const createdItem: PublicCMSItem = {
      id: `PUB-NEW-${Math.floor(100 + Math.random() * 900)}`,
      section: newItemForm.section,
      sectionLabel,
      publicRoute: route,
      title: newItemForm.title.trim(),
      category: newItemForm.category,
      summary: newItemForm.summary.trim() || "Deskripsi ringkas konten publik.",
      status: newItemForm.status,
      lastUpdated: todayStr,
      editor: newItemForm.author,
      author: newItemForm.author,
      url: newItemForm.url,
      institution: newItemForm.institution,
      mediaType: newItemForm.mediaType,
    };

    setCmsItems((prev) => [createdItem, ...prev]);
    setIsNewItemModalOpen(false);
    showToast(`Konten baru "${createdItem.title.substring(0, 30)}..." berhasil didaftarkan ke [${sectionLabel}].`);
  };

  // Filtered CMS items for master overview table
  const filteredMasterItems = useMemo(() => {
    return cmsItems.filter((item) => {
      const matchStatus = statusFilter === "ALL" || item.status === statusFilter;
      const matchSection = activeSection === "overview" || item.section.startsWith(activeSection);
      const q = searchQuery.toLowerCase();
      const matchQuery =
        searchQuery === "" ||
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.sectionLabel.toLowerCase().includes(q) ||
        item.editor.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q);

      return matchStatus && matchSection && matchQuery;
    });
  }, [cmsItems, activeSection, statusFilter, searchQuery]);

  // Pagination states
  const [masterPage, setMasterPage] = useState(1);
  const [zhouPage, setZhouPage] = useState(1);

  useEffect(() => {
    setMasterPage(1);
  }, [activeSection, statusFilter, searchQuery]);

  useEffect(() => {
    setZhouPage(1);
  }, [zhouCategoryFilter, zhouStatusFilter, zhouSearchQuery]);

  const masterItemsPerPage = 6;
  const totalMasterPages = Math.ceil(filteredMasterItems.length / masterItemsPerPage) || 1;
  const paginatedMasterItems = filteredMasterItems.slice(
    (masterPage - 1) * masterItemsPerPage,
    masterPage * masterItemsPerPage
  );

  const zhouItemsPerPage = 5;
  const totalZhouPages = Math.ceil(filteredZhouArticles.length / zhouItemsPerPage) || 1;
  const paginatedZhouArticles = filteredZhouArticles.slice(
    (zhouPage - 1) * zhouItemsPerPage,
    zhouPage * zhouItemsPerPage
  );

  // Counts
  const totalPublished = cmsItems.filter((i) => i.status === "Published").length;
  const totalDrafts = cmsItems.filter((i) => i.status === "Draft").length;
  const zhouEduCount = zhouArticles.length;
  const govEduCount = BELAJAR_PAJAK_LINKS.length;

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0B1533] text-white text-xs font-semibold py-3 px-5 rounded-xl shadow-2xl border border-white/20 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircleIcon className="text-emerald-400 text-base" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-silver hover:text-white ml-2">
            <CloseIcon className="text-xs" />
          </button>
        </div>
      )}

      {/* TOP EXECUTIVE HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-primary-light">
        <div>
          <div className="flex items-center gap-2 text-xs text-text-muted mb-1.5">
            <Link href="/dashboard/admin" className="hover:text-primary transition-colors">
              Admin Portal
            </Link>
            <span>/</span>
            <span className="text-primary font-bold">Public Website Content Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
            Admin Portal — Pengelolaan Konten Website Publik
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-3xl">
            Kelola seluruh konten, informasi, regulasi, materi edukasi, dan layanan yang ditayangkan pada website publik
            Zhou Consulting. Semua perubahan berstatus <strong>Published</strong> langsung tampil pada website live.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setNewItemForm({
                section: "services",
                title: "",
                category: "Pajak",
                summary: "",
                status: "Published",
                author: "Linda David, S.Ak., BKP",
                url: "",
                institution: "DJP",
                mediaType: "Situs Web",
              });
              setIsNewItemModalOpen(true);
            }}
            className="text-xs font-semibold h-10 px-3.5 border-primary-light bg-white hover:border-primary text-primary flex items-center gap-2"
          >
            <PlusIcon className="text-xs" />
            <span>Tambah Konten Publik</span>
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => showToast("Seluruh konten publik telah disinkronkan 100% dengan Public Website.")}
            className="text-xs font-semibold h-10 px-4 bg-primary text-white shadow-sm flex items-center gap-2 hover:bg-primary/90"
          >
            <CheckCircleIcon className="text-xs" />
            <span>Sinkronkan ke Web Live</span>
          </Button>

          <Link
            href="/"
            className="text-xs font-semibold h-10 px-3.5 rounded-xl border border-primary-light bg-surface hover:bg-white text-primary flex items-center gap-1.5 transition-colors"
            title="Kembali dan lihat Public Website"
          >
            <EyeIcon className="text-xs" />
            <span>Lihat Website</span>
          </Link>
        </div>
      </div>

      {/* 4 TOP EXECUTIVE METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <Card
          onClick={() => setActiveSection("overview")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            activeSection === "overview"
              ? "border-primary ring-2 ring-primary/20 bg-primary/5"
              : "border-primary-light bg-white hover:border-primary/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider">
              Total Konten Publik
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs">
              <CheckCircleIcon />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-primary font-mono">{totalPublished}</span>
            <span className="text-xs text-text-secondary">Terbit ({totalDrafts} Draft)</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
            <CheckIcon className="text-[9px]" />
            <span>100% Ditayangkan ke Pengunjung</span>
          </div>
        </Card>

        {/* Metric 2 */}
        <Card
          onClick={() => setActiveSection("services")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            activeSection === "services"
              ? "border-primary ring-2 ring-primary/20 bg-primary/5"
              : "border-primary-light bg-white hover:border-primary/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider">
              Halaman Layanan Aktif
            </span>
            <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center text-primary text-xs">
              <BuildingIcon />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-primary font-mono">{servicesList.length}</span>
            <span className="text-xs text-text-secondary">Divisi Layanan</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-primary font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span>Hukum, Bisnis, Akuntansi &amp; Pajak</span>
          </div>
        </Card>

        {/* Metric 3 */}
        <Card
          onClick={() => setActiveSection("education")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            activeSection === "education"
              ? "border-amber-400 ring-2 ring-amber-400/20 bg-amber-50/50"
              : "border-primary-light bg-white hover:border-amber-400"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider">
              Edukasi Pajak (2 Menu)
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800 text-xs">
              <BookIcon />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-amber-900 font-mono">{zhouEduCount + govEduCount}</span>
            <span className="text-xs text-text-secondary">Materi ({zhouEduCount} Zhou / {govEduCount} Gov)</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-800 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            <span>Artikel Zhou &amp; Link Kemenkeu/DJP</span>
          </div>
        </Card>

        {/* Metric 4 */}
        <Card
          onClick={() => setActiveSection("kurs")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            activeSection === "kurs"
              ? "border-primary ring-2 ring-primary/20 bg-primary/5"
              : "border-primary-light bg-white hover:border-primary/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider">
              Kurs Pajak KMK Mingguan
            </span>
            <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center text-primary text-xs">
              <DocumentIcon />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-base font-bold text-primary font-mono truncate">{kmkRates.kmkNumber}</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Berlaku s/d {kmkRates.effectiveUntil}</span>
          </div>
        </Card>
      </div>

      {/* CENTRAL TAB NAVIGATION BAR */}
      <div className="border-b border-primary-light flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 text-xs font-semibold">
        {[
          { id: "overview", label: "Overview CMS", badge: `${cmsItems.length}` },
          { id: "homepage", label: "1. Beranda / Hero" },
          { id: "company", label: "2. Profil Perusahaan" },
          { id: "services", label: "3. Layanan (4 Divisi)", badge: "4" },
          { id: "regulations", label: "4. Peraturan & Regulasi Zhou", badge: `${regulationsList.length}` },
          { id: "kurs", label: "5. Kurs KMK (7 Valuta)" },
          { id: "education", label: "6. Edukasi Pajak (2 Menu)", badge: `${zhouEduCount + govEduCount}` },
          { id: "careers", label: "7. Karir & Rekrutmen", badge: `${careersList.length}` },
          { id: "contact", label: "8. Kontak & Konsultasi" },
          { id: "tickets", label: "Lembar Kerja Staf", badge: "Operasional" },
        ].map((tab) => {
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSection(tab.id as AdminNavSection)}
              className={`px-3.5 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
                isActive
                  ? "bg-primary text-white shadow-xs font-bold"
                  : "bg-white text-text-secondary hover:text-primary hover:bg-surface border border-primary-light"
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                    isActive ? "bg-white/20 text-white" : "bg-primary-light text-primary"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* =========================================================
          SECTION 1: OVERVIEW & MASTER CONTENT TABLE
         ========================================================= */}
      {activeSection === "overview" && (
        <div className="space-y-5">
          {/* Public Page Health Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {[
              {
                title: "Homepage / Beranda",
                route: "/",
                status: homepageContent.status,
                itemsCount: "5 Komponen Utama",
                linkSection: "homepage",
              },
              {
                title: "Profil Perusahaan",
                route: "/#profil",
                status: companyProfile.status,
                itemsCount: "Legalitas & Profil Entitas",
                linkSection: "company",
              },
              {
                title: "Katalog Layanan",
                route: "/layanan/tax-service",
                status: "Published",
                itemsCount: `${servicesList.length} Divisi Layanan Aktif`,
                linkSection: "services",
              },
              {
                title: "Peraturan & Kurs KMK",
                route: "/peraturan",
                status: "Published",
                itemsCount: `${regulationsList.length} Regulasi & 7 Valuta`,
                linkSection: "regulations",
              },
              {
                title: "Edukasi Zhou (Upload)",
                route: "/edukasi",
                status: "Published",
                itemsCount: `${zhouEduCount} Artikel Riset Konsultan`,
                linkSection: "education",
              },
              {
                title: "Belajar Pajak (Gov)",
                route: "/edukasi?tab=belajar-pajak",
                status: "Published",
                itemsCount: `${govEduCount} Link Resmi DJP & Kemenkeu`,
                linkSection: "education",
              },
              {
                title: "Karir & Rekrutmen",
                route: "/karir",
                status: "Published",
                itemsCount: `${careersList.length} Lowongan Pekerjaan`,
                linkSection: "careers",
              },
              {
                title: "Kontak & Konsultasi",
                route: "/kontak",
                status: contactContent.status,
                itemsCount: "Menara Sudirman & 4 Slot",
                linkSection: "contact",
              },
            ].map((p, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-primary-light p-4 shadow-2xs hover:border-primary/50 transition-all flex flex-col justify-between space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary">{p.title}</span>
                  <Badge variant="success" size="sm" dot>
                    {p.status}
                  </Badge>
                </div>
                <div className="text-[11px] text-text-secondary">{p.itemsCount}</div>
                <div className="flex items-center justify-between pt-2 border-t border-primary-light/60 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setActiveSection(p.linkSection as AdminNavSection)}
                    className="text-primary font-semibold hover:underline"
                  >
                    Kelola Konten
                  </button>
                  <Link href={p.route} target="_blank" className="text-text-muted hover:text-primary">
                    Lihat Web
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Search & Status Filters */}
          <div className="bg-white rounded-2xl border border-primary-light p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <SearchIcon className="absolute left-3 top-2.5 text-text-muted text-xs" />
              <Input
                type="text"
                placeholder="Cari judul konten publik, seksi target, atau editor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs h-9 bg-surface border-primary-light focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted font-medium">Filter Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs h-9 px-3 rounded-xl border border-primary-light bg-surface text-text-primary focus:bg-white font-medium focus:outline-none"
              >
                <option value="ALL">Semua Status ({cmsItems.length})</option>
                <option value="Published">Published ({totalPublished})</option>
                <option value="Draft">Draft ({totalDrafts})</option>
              </select>
            </div>
          </div>

          {/* Master Table of Public Website Content */}
          <Card className="rounded-2xl border-primary-light bg-white shadow-xs overflow-hidden">
            <div className="p-4 bg-surface/60 border-b border-primary-light flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-primary">
                  Daftar Seluruh Konten Public Website ({filteredMasterItems.length})
                </h3>
                <p className="text-[11px] text-text-muted">
                  Perubahan konten dengan status Published langsung terlihat oleh pengunjung website.
                </p>
              </div>
            </div>

            <div className="divide-y divide-primary-light">
              {filteredMasterItems.length === 0 ? (
                <div className="p-8 text-center text-xs text-text-muted">
                  Tidak ada konten publik yang sesuai dengan kriteria filter.
                </div>
              ) : (
                paginatedMasterItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 hover:bg-surface/50 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-primary bg-primary-light px-2 py-0.5 rounded text-[11px]">
                          {item.id}
                        </span>
                        <span className="font-semibold text-text-muted bg-surface px-2 py-0.5 rounded border border-primary-light text-[10px]">
                          {item.sectionLabel}
                        </span>
                        <Badge
                          variant={item.status === "Published" ? "success" : "silver"}
                          size="sm"
                          dot={item.status === "Published"}
                        >
                          {item.status}
                        </Badge>
                        <span className="text-[10px] text-text-muted">&bull; {item.category}</span>
                      </div>

                      <h4 className="text-sm font-bold text-primary leading-snug">{item.title}</h4>
                      <p className="text-[11px] text-text-secondary line-clamp-1">{item.summary}</p>

                      <div className="flex items-center gap-3 text-[10px] text-text-muted">
                        <span>Pembaruan: {item.lastUpdated}</span>
                        <span>&bull;</span>
                        <span>Editor: {item.editor}</span>
                        <span>&bull;</span>
                        <span className="font-mono text-primary">Rute: {item.publicRoute}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
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

                      <Link
                        href={item.publicRoute}
                        target="_blank"
                        className="text-[11px] h-8 px-2.5 rounded-lg border border-primary-light bg-surface hover:bg-white text-primary flex items-center gap-1 transition-colors"
                        title="Buka halaman publik yang memuat konten ini"
                      >
                        <span>Lihat Web</span>
                      </Link>

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
                        onClick={() => setItemToDelete(item)}
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

            {filteredMasterItems.length > 0 && (
              <div className="p-4 bg-surface/40 border-t border-primary-light flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted">
                <span>
                  Menampilkan {(masterPage - 1) * masterItemsPerPage + 1} &ndash;{" "}
                  {Math.min(masterPage * masterItemsPerPage, filteredMasterItems.length)} dari{" "}
                  {filteredMasterItems.length} konten
                </span>
                <Pagination
                  currentPage={masterPage}
                  totalPages={totalMasterPages}
                  onPageChange={setMasterPage}
                />
              </div>
            )}
          </Card>
        </div>
      )}

      {/* =========================================================
          SECTION 2: BERANDA & HERO SECTION EDITOR
         ========================================================= */}
      {activeSection === "homepage" && (
        <div className="space-y-5">
          <Card className="rounded-2xl border-primary-light bg-white p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-primary-light">
              <div>
                <h3 className="text-base font-bold text-primary">Manajemen Konten Beranda &amp; Hero Section</h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Teks headline pembuka, subheadline penawaran nilai, 4 metrik kredibilitas, dan tombol CTA pada rute (/)
                </p>
              </div>
              <Link
                href="/"
                target="_blank"
                className="text-xs font-semibold h-8 px-3 rounded-lg bg-primary-light text-primary hover:bg-primary hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <span>Lihat Beranda</span>
              </Link>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                showToast("Konten Hero & Beranda berhasil diperbarui dan dipublikasikan.");
              }}
              className="space-y-4 text-xs"
            >
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-primary">
                  Headline Utama Hero Banner <span className="text-error">*</span>
                </Label>
                <Input
                  type="text"
                  required
                  value={homepageContent.headline}
                  onChange={(e) => setHomepageContent((prev) => ({ ...prev, headline: e.target.value }))}
                  className="text-xs bg-surface border-primary-light focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-primary">
                  Subheadline / Ringkasan Nilai Keunggulan <span className="text-error">*</span>
                </Label>
                <Textarea
                  rows={3}
                  required
                  value={homepageContent.subheadline}
                  onChange={(e) => setHomepageContent((prev) => ({ ...prev, subheadline: e.target.value }))}
                  className="text-xs bg-surface border-primary-light focus:bg-white leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-primary">Teks Tombol CTA Utama</Label>
                  <Input
                    type="text"
                    value={homepageContent.primaryCtaText}
                    onChange={(e) => setHomepageContent((prev) => ({ ...prev, primaryCtaText: e.target.value }))}
                    className="text-xs bg-surface border-primary-light"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-primary">Target URL Tombol Utama</Label>
                  <Input
                    type="text"
                    value={homepageContent.primaryCtaUrl}
                    onChange={(e) => setHomepageContent((prev) => ({ ...prev, primaryCtaUrl: e.target.value }))}
                    className="text-xs bg-surface border-primary-light font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-primary">Deskripsi Foto Boardroom Menara Sudirman</Label>
                <Input
                  type="text"
                  value={homepageContent.boardroomCaption}
                  onChange={(e) => setHomepageContent((prev) => ({ ...prev, boardroomCaption: e.target.value }))}
                  className="text-xs bg-surface border-primary-light"
                />
              </div>

              {/* 4 Credibility Metrics */}
              <div className="pt-3 border-t border-primary-light space-y-2">
                <Label className="text-xs font-bold text-primary uppercase tracking-wider block">
                  4 Metrik Kredibilitas Banner:
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {homepageContent.metrics.map((m, idx) => (
                    <div key={m.id} className="p-3 rounded-xl bg-surface border border-primary-light space-y-1">
                      <span className="text-[10px] text-text-muted font-bold font-mono">Metrik #{idx + 1}</span>
                      <Input
                        value={m.label}
                        onChange={(e) => {
                          const updated = [...homepageContent.metrics];
                          updated[idx].label = e.target.value;
                          setHomepageContent((prev) => ({ ...prev, metrics: updated }));
                        }}
                        className="text-xs h-8 bg-white border-primary-light font-semibold"
                      />
                      <Input
                        value={m.sub}
                        onChange={(e) => {
                          const updated = [...homepageContent.metrics];
                          updated[idx].sub = e.target.value;
                          setHomepageContent((prev) => ({ ...prev, metrics: updated }));
                        }}
                        className="text-[11px] h-7 bg-white border-primary-light text-text-secondary"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-primary-light flex justify-end">
                <Button type="submit" variant="primary" size="sm" className="text-xs h-9 px-5 font-semibold">
                  Simpan &amp; Publikasikan ke Beranda
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* =========================================================
          SECTION 3: PROFIL PERUSAHAAN EDITOR
         ========================================================= */}
      {activeSection === "company" && (
        <div className="space-y-5">
          <Card className="rounded-2xl border-primary-light bg-white p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-primary-light">
              <div>
                <h3 className="text-base font-bold text-primary">Manajemen Profil Perusahaan</h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Informasi legalitas dan pernyataan profil entitas yang ditayangkan pada seksi Tentang Kami (/#profil)
                </p>
              </div>
              <Link
                href="/#profil"
                target="_blank"
                className="text-xs font-semibold h-8 px-3 rounded-lg bg-primary-light text-primary hover:bg-primary hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <span>Lihat Profil</span>
              </Link>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                showToast("Profil Perusahaan berhasil diperbarui.");
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-primary">Nama Entitas Legal</Label>
                  <Input
                    type="text"
                    value={companyProfile.legalEntity}
                    onChange={(e) => setCompanyProfile((prev) => ({ ...prev, legalEntity: e.target.value }))}
                    className="text-xs bg-surface border-primary-light font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-primary">Nomor Izin BKP / KMK</Label>
                  <Input
                    type="text"
                    value={companyProfile.licenseNumber}
                    onChange={(e) => setCompanyProfile((prev) => ({ ...prev, licenseNumber: e.target.value }))}
                    className="text-xs bg-surface border-primary-light font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-primary">Pernyataan Profil Perusahaan (About Statement)</Label>
                <Textarea
                  rows={4}
                  value={companyProfile.profileStatement}
                  onChange={(e) => setCompanyProfile((prev) => ({ ...prev, profileStatement: e.target.value }))}
                  className="text-xs bg-surface border-primary-light leading-relaxed focus:bg-white"
                />
              </div>

              <div className="pt-4 border-t border-primary-light flex justify-end">
                <Button type="submit" variant="primary" size="sm" className="text-xs h-9 px-5 font-semibold">
                  Simpan &amp; Publikasikan Profil
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* =========================================================
          SECTION 4: LAYANAN 4 DIVISI
         ========================================================= */}
      {activeSection === "services" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-primary">Manajemen 4 Divisi Layanan Publik</h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Kelola bidang layanan, alur penugasan, deliverables, dan profil konsultan pada masing-masing halaman rute /layanan/*
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setNewItemForm({
                  section: "services",
                  title: "",
                  category: "Pajak",
                  summary: "",
                  status: "Published",
                  author: "Linda David, S.Ak., BKP",
                  url: "",
                  institution: "DJP",
                  mediaType: "Situs Web",
                });
                setIsNewItemModalOpen(true);
              }}
              className="text-xs h-8 px-3 border-primary-light"
            >
              <PlusIcon className="text-xs mr-1" />
              Tambah Modul Layanan
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {servicesList.map((srv) => (
              <Card
                key={srv.id}
                className="rounded-2xl border-primary-light bg-white p-5 shadow-xs hover:border-primary/50 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-primary bg-primary-light px-2.5 py-0.5 rounded">
                      {srv.id}
                    </span>
                    <Badge variant={srv.status === "Published" ? "success" : "silver"} size="sm" dot>
                      {srv.status}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-primary">{srv.name}</h4>
                    <p className="text-xs text-text-secondary mt-1">{srv.subtitle}</p>
                    <div className="text-[11px] text-primary font-semibold mt-2">
                      PIC: {srv.leadConsultant}
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-primary-light/60">
                    <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider block">
                      4 Bidang Layanan:
                    </span>
                    <ul className="text-[11px] text-text-secondary space-y-1">
                      {srv.pillars.map((p, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckIcon className="text-emerald-600 text-[10px] mt-0.5 shrink-0" />
                          <span>{p.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-primary-light/60">
                  <span className="text-[10px] text-text-muted">Rute: {srv.route}</span>
                  <div className="flex items-center gap-2">
                    <Link
                      href={srv.route}
                      target="_blank"
                      className="text-xs h-8 px-2.5 rounded-lg border border-primary-light bg-surface hover:bg-white text-primary flex items-center gap-1 transition-colors"
                    >
                      <span>Lihat Halaman</span>
                    </Link>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(`PUB-${srv.id}`)}
                      className="text-xs h-8 px-2.5"
                    >
                      {srv.status === "Published" ? "Draft" : "Terbitkan"}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================
          SECTION 5: PERATURAN & REGULASI ZHOU (FULL CRUD)
         ========================================================= */}
      {activeSection === "regulations" && (
        <div className="space-y-5">
          {/* Header Action Banner */}
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-primary block text-sm">
                Katalog Regulasi &amp; Standar Prosedur Operasional (SOP) Zhou
              </span>
              <span className="text-text-secondary">
                Kelola arsip peraturan UU, PP, PMK, PER DJP serta SOP internal Zhou Consulting yang tampil di rute publik (/peraturan).
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResetRegulations}
                title="Kembalikan daftar regulasi &amp; SOP ke pengaturan awal jika diperlukan"
                className="text-xs h-8 px-2.5 border-primary-light text-text-secondary hover:text-primary"
              >
                Reset Default
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => handleOpenAddRegulation("Regulasi Zhou")}
                className="bg-primary hover:bg-primary-dark text-white text-xs font-semibold h-8 px-3.5 shadow-sm flex items-center gap-1.5"
              >
                <PlusIcon className="text-xs" />
                <span>Tambah Regulasi / SOP Zhou</span>
              </Button>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white p-3.5 rounded-xl border border-primary-light shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[260px]">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs" />
                <Input
                  type="text"
                  placeholder="Cari nomor dokumen, judul, ruang lingkup..."
                  value={regSearchQuery}
                  onChange={(e) => setRegSearchQuery(e.target.value)}
                  className="text-xs pl-8 pr-7 h-8 bg-surface border-primary-light"
                />
                {regSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setRegSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary"
                  >
                    <CloseIcon className="text-[10px]" />
                  </button>
                )}
              </div>

              <select
                value={regCategoryFilter}
                onChange={(e) => setRegCategoryFilter(e.target.value)}
                className="text-xs h-8 px-2.5 rounded-lg border border-primary-light bg-surface text-text-secondary focus:text-primary focus:bg-white cursor-pointer font-medium"
              >
                <option value="Semua">Semua Kategori ({regulationsList.length})</option>
                {REGULATION_CATEGORIES.filter((c) => c !== "Semua").map((cat) => (
                  <option key={cat} value={cat}>
                    {cat} ({regulationsList.filter((r) => r.category === cat).length})
                  </option>
                ))}
              </select>

              <select
                value={regStatusFilter}
                onChange={(e) => setRegStatusFilter(e.target.value)}
                className="text-xs h-8 px-2.5 rounded-lg border border-primary-light bg-surface text-text-secondary focus:text-primary focus:bg-white cursor-pointer font-medium"
              >
                <option value="Semua">Semua Status</option>
                <option value="Berlaku">Status: Berlaku</option>
                <option value="Pembaruan">Status: Pembaruan</option>
              </select>

              {(regSearchQuery || regCategoryFilter !== "Semua" || regStatusFilter !== "Semua") && (
                <button
                  type="button"
                  onClick={() => {
                    setRegSearchQuery("");
                    setRegCategoryFilter("Semua");
                    setRegStatusFilter("Semua");
                  }}
                  className="text-xs text-text-muted hover:text-primary underline px-1 cursor-pointer"
                >
                  Reset Filter
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-text-secondary">
                Menampilkan <strong>{filteredAdminRegulations.length}</strong> dari <strong>{regulationsList.length}</strong> dokumen
              </span>
              <Link
                href="/peraturan"
                target="_blank"
                className="text-xs font-semibold h-8 px-2.5 rounded-lg bg-primary-light text-primary hover:bg-primary hover:text-white flex items-center gap-1 transition-colors"
              >
                <span>Lihat di Web</span>
                <EyeIcon className="text-[10px]" />
              </Link>
            </div>
          </div>

          {/* Cards List */}
          <div className="grid grid-cols-1 gap-3">
            {filteredAdminRegulations.length === 0 ? (
              <Card className="p-8 text-center rounded-2xl border-dashed border-primary-light bg-surface">
                <DocumentIcon className="text-2xl text-text-muted mx-auto mb-2" />
                <p className="font-bold text-primary text-xs">Tidak ada dokumen regulasi yang ditemukan</p>
                <p className="text-[11px] text-text-secondary mt-1">
                  Coba sesuaikan kata kunci pencarian atau reset filter kategori di atas.
                </p>
              </Card>
            ) : (
              filteredAdminRegulations.map((reg) => (
                <Card
                  key={reg.id}
                  className="rounded-2xl border-primary-light bg-white p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/40 transition-colors"
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className="font-mono font-bold text-primary bg-primary-light px-2 py-0.5 rounded text-[11px]">
                        {reg.id}
                      </span>
                      {reg.category === "Regulasi Zhou" ? (
                        <Badge variant="primary" className="bg-primary text-white text-[10px] font-bold shadow-2xs">
                          {reg.category}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] font-medium text-text-primary">
                          {reg.category}
                        </Badge>
                      )}
                      <Badge
                        variant={reg.status === "Berlaku" ? "success" : "secondary"}
                        size="sm"
                        dot
                      >
                        {reg.status}
                      </Badge>
                      <span className="text-[10px] text-text-muted">
                        &bull; Berlaku: {reg.effectiveDate} &bull; Berkas: {reg.fileSize}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-primary">
                      {reg.docNumber}: {reg.title}
                    </h4>
                    <p className="text-[11px] text-text-secondary leading-relaxed">
                      {reg.scope}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                    <Link
                      href="/peraturan"
                      target="_blank"
                      className="text-xs h-8 px-2.5 rounded-lg border border-primary-light bg-surface hover:bg-white text-primary flex items-center gap-1"
                      title="Lihat langsung pada halaman publik /peraturan"
                    >
                      <EyeIcon className="text-[11px]" />
                      <span>Lihat</span>
                    </Link>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEditRegulation(reg)}
                      className="text-xs h-8 px-2.5 border-primary-light text-primary hover:bg-primary-light"
                      title="Edit rincian dokumen regulasi ini"
                    >
                      <EditIcon className="text-[11px] mr-1" />
                      <span>Edit</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleRegStatus(reg.id)}
                      className="text-xs h-8 px-2.5 text-text-secondary hover:text-primary"
                      title="Ganti status antara Berlaku dan Pembaruan"
                    >
                      Toggle Status
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setRegItemToDelete(reg)}
                      className="text-xs h-8 px-2 border-red-200 text-error hover:bg-red-50 hover:border-red-400"
                      title="Hapus dokumen regulasi ini"
                    >
                      <TrashIcon className="text-[11px]" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          SECTION 6: TARIF PAJAK / KURS KMK
         ========================================================= */}
      {activeSection === "kurs" && (
        <div className="space-y-5">
          <Card className="rounded-2xl border-primary-light bg-white p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-primary-light">
              <div>
                <h3 className="text-base font-bold text-primary">Pembaruan Kurs Pajak Mingguan Terbitan DJP (KMK)</h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Tarif konversi resmi valuta asing untuk pelaporan faktur pajak, bukti potong, dan bea cukai pada rute (/peraturan)
                </p>
              </div>
              <Link
                href="/peraturan#kurs-pajak"
                target="_blank"
                className="text-xs font-semibold h-8 px-3 rounded-lg bg-primary-light text-primary hover:bg-primary hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <span>Lihat Kurs</span>
              </Link>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                showToast(`Tabel ${kmkRates.kmkNumber} berhasil diperbarui dan dipublikasikan secara langsung.`);
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-primary">Nomor KMK Resmi</Label>
                  <Input
                    type="text"
                    required
                    value={kmkRates.kmkNumber}
                    onChange={(e) => setKmkRates((prev) => ({ ...prev, kmkNumber: e.target.value }))}
                    className="text-xs bg-surface border-primary-light font-mono font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-primary">Periode Masa Berlaku</Label>
                  <Input
                    type="text"
                    required
                    value={kmkRates.period}
                    onChange={(e) => setKmkRates((prev) => ({ ...prev, period: e.target.value }))}
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
                  {kmkRates.rates.map((item, idx) => (
                    <div key={item.currency} className="p-3 bg-surface/40 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="w-12 font-bold font-mono text-primary text-xs bg-primary-light px-2 py-1 rounded text-center">
                          {item.currency}
                        </span>
                        <span className="text-text-secondary text-xs">{item.name}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-[11px] font-mono ${item.trend === "up" ? "text-emerald-600" : "text-error"}`}>
                          {item.change}
                        </span>
                        <div className="w-44">
                          <Input
                            type="text"
                            value={item.rate}
                            onChange={(e) => {
                              const updated = [...kmkRates.rates];
                              updated[idx].rate = e.target.value;
                              setKmkRates((prev) => ({ ...prev, rates: updated }));
                            }}
                            className="text-xs h-8 bg-white border-primary-light font-mono font-bold text-right"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-primary-light flex justify-end">
                <Button type="submit" variant="primary" size="sm" className="text-xs h-9 px-5 font-semibold">
                  Simpan &amp; Publikasikan Kurs KMK
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* =========================================================
          SECTION 7: EDUKASI PAJAK (2 MENU)
         ========================================================= */}
      {activeSection === "education" && (
        <div className="space-y-5">
          {/* Sub-tab switcher */}
          <div className="flex items-center justify-between border-b border-primary-light pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEducationSubTab("zhou")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  educationSubTab === "zhou"
                    ? "bg-primary text-white shadow-xs"
                    : "bg-surface text-text-secondary hover:bg-white border border-primary-light"
                }`}
              >
                1. Edukasi Zhou (Upload Konten) ({zhouEduCount})
              </button>

              <button
                type="button"
                onClick={() => setEducationSubTab("gov")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  educationSubTab === "gov"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300"
                }`}
              >
                2. Belajar Pajak (Link Kemenkeu/DJP) ({govEduCount})
              </button>
            </div>

            <Link
              href={educationSubTab === "zhou" ? "/edukasi?tab=edukasi-zhou" : "/edukasi?tab=belajar-pajak"}
              target="_blank"
              className="text-xs font-semibold h-8 px-3 rounded-lg bg-primary-light text-primary hover:bg-primary hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <span>Lihat di Halaman Web</span>
            </Link>
          </div>

          {/* Sub-tab 1: Edukasi Zhou (CRUD Modul & Materi) */}
          {educationSubTab === "zhou" && (
            <div className="space-y-4">
              {/* Header Action Banner */}
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-primary block text-sm">
                    Manajemen Modul &amp; Artikel Eksklusif Zhou Consulting
                  </span>
                  <span className="text-text-secondary">
                    Kelola materi, modul PDF, dan telaah fiskal praktis. Data langsung tersinkronisasi ke website publik Zhou.
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResetZhou}
                    title="Kembalikan ke modul awal jika diperlukan"
                    className="text-xs h-8 px-2.5 border-primary-light text-text-secondary hover:text-primary"
                  >
                    Reset Default
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleOpenUploadZhou}
                    className="bg-primary hover:bg-primary-dark text-white text-xs font-semibold h-8 px-3.5 shadow-sm flex items-center gap-1.5"
                  >
                    <PlusIcon className="text-xs" />
                    <span>Upload Modul / Materi Baru</span>
                  </Button>
                </div>
              </div>

              {/* Filter & Search Bar */}
              <div className="bg-white p-3 rounded-xl border border-primary-light shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[260px]">
                  <div className="relative flex-1 min-w-[180px] max-w-sm">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs" />
                    <Input
                      type="text"
                      placeholder="Cari judul materi, penulis, topik..."
                      value={zhouSearchQuery}
                      onChange={(e) => setZhouSearchQuery(e.target.value)}
                      className="text-xs pl-8 pr-7 h-8 bg-surface border-primary-light"
                    />
                    {zhouSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setZhouSearchQuery("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary"
                      >
                        <CloseIcon className="text-[10px]" />
                      </button>
                    )}
                  </div>

                  <select
                    value={zhouCategoryFilter}
                    onChange={(e) => setZhouCategoryFilter(e.target.value)}
                    className="h-8 px-2.5 text-xs rounded-lg border border-primary-light bg-surface text-text-primary focus:outline-none"
                  >
                    <option value="ALL">Semua Kategori Topik</option>
                    <option value="Coretax DJP 2026">Coretax DJP 2026</option>
                    <option value="Kepatuhan PPh & PPN">Kepatuhan PPh & PPN</option>
                    <option value="Mitigasi SP2DK">Mitigasi SP2DK</option>
                    <option value="Akuntansi SAK">Akuntansi SAK</option>
                    <option value="Legal Korporat">Legal Korporat</option>
                  </select>

                  <select
                    value={zhouStatusFilter}
                    onChange={(e) => setZhouStatusFilter(e.target.value)}
                    className="h-8 px-2.5 text-xs rounded-lg border border-primary-light bg-surface text-text-primary focus:outline-none"
                  >
                    <option value="ALL">Semua Status</option>
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>

                <div className="text-[11px] text-text-secondary font-medium">
                  Menampilkan <strong>{filteredZhouArticles.length}</strong> dari <strong>{zhouArticles.length}</strong> materi
                </div>
              </div>

              {/* Grid Cards CRUD */}
              {filteredZhouArticles.length === 0 ? (
                <div className="p-10 text-center bg-white rounded-2xl border border-primary-light space-y-2">
                  <BookIcon className="text-3xl text-silver mx-auto" />
                  <h4 className="text-sm font-bold text-primary">Tidak Ada Materi Zhou yang Ditemukan</h4>
                  <p className="text-xs text-text-secondary">
                    Coba sesuaikan kata kunci pencarian atau ubah filter status/kategori.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3.5">
                  {paginatedZhouArticles.map((art) => (
                    <Card key={art.id} className="rounded-2xl border-primary-light bg-white p-4 sm:p-5 shadow-xs space-y-3 hover:border-primary/50 transition-colors">
                      <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-primary bg-primary-light px-2 py-0.5 rounded text-[11px]">
                            {art.id}
                          </span>
                          <Badge variant="primary" size="sm">
                            {art.category}
                          </Badge>
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              art.status === "Draft"
                                ? "bg-amber-100 text-amber-800 border border-amber-300"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-300"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                art.status === "Draft" ? "bg-amber-500" : "bg-emerald-500"
                              }`}
                            />
                            {art.status || "Published"}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              art.isFeatured !== false
                                ? "bg-amber-50 text-amber-800 border border-amber-300"
                                : "bg-surface text-text-muted border border-primary-light"
                            }`}
                            title={art.isFeatured !== false ? "Aktif di Carousel Unggulan (/edukasi)" : "Tidak tampil di Carousel"}
                          >
                            <span>{art.isFeatured !== false ? "★ Unggulan Carousel" : "☆ Standar"}</span>
                          </span>
                          <span className="text-[11px] text-text-muted flex items-center gap-1">
                            <ClockIcon className="text-[10px]" />
                            {art.readTime}
                          </span>
                        </div>
                        <span className="text-[11px] text-text-muted flex items-center gap-1">
                          <CalendarIcon className="text-[10px]" />
                          {art.date} &bull; <strong className="text-primary font-semibold">{art.author}</strong>
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm sm:text-base font-bold text-primary leading-snug">
                          {art.title}
                        </h4>
                        <p className="text-xs text-text-secondary mt-1 line-clamp-2 leading-relaxed">
                          {art.summary}
                        </p>
                      </div>

                      {/* Attachment file badge if present */}
                      {art.attachment && (
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-surface border border-primary-light text-xs max-w-fit">
                          <DocumentIcon className="text-primary text-xs" />
                          <span className="font-semibold text-primary">{art.attachment.name}</span>
                          <span className="text-[10px] text-text-muted font-mono">({art.attachment.size})</span>
                          <Badge variant="silver" size="sm" className="text-[9px] py-0 px-1.5">
                            {art.attachment.type}
                          </Badge>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-primary-light/60 flex-wrap gap-2">
                        <span className="text-[10px] text-text-muted font-mono">
                          Slug: /edukasi/{art.id.toLowerCase()}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setZhouItemToPreview(art)}
                            className="text-xs h-7 px-2.5 border-primary-light text-primary hover:bg-primary-light/40"
                          >
                            <span>Detail (Read)</span>
                          </Button>

                          <Link
                            href="/edukasi?tab=edukasi-zhou"
                            target="_blank"
                            className="text-xs h-7 px-2.5 rounded-lg border border-primary-light bg-surface hover:bg-white text-primary flex items-center gap-1 transition-colors"
                          >
                            <EyeIcon className="text-[11px]" />
                            <span>Lihat Web</span>
                          </Link>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEditZhou(art)}
                            className="text-xs h-7 px-2.5 border-primary-light text-blue-700 hover:bg-blue-50 flex items-center gap-1"
                          >
                            <EditIcon className="text-[10px]" />
                            <span>Edit</span>
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleZhouFeatured(art.id)}
                            className={`text-xs h-7 px-2 border-primary-light ${
                              art.isFeatured !== false
                                ? "text-amber-800 bg-amber-50 hover:bg-amber-100 border-amber-300 font-semibold"
                                : "text-text-secondary hover:text-primary"
                            }`}
                            title="Atur apakah materi ini ditampilkan di Banner Carousel Unggulan (/edukasi)"
                          >
                            <span>{art.isFeatured !== false ? "Lepas Carousel" : "+ Carousel"}</span>
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleZhouStatus(art.id)}
                            className="text-xs h-7 px-2 border-primary-light text-text-secondary hover:text-primary"
                          >
                            <span>{art.status === "Draft" ? "Terbitkan" : "Jadikan Draft"}</span>
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setZhouItemToDelete(art)}
                            className="text-xs h-7 px-2 border-error/30 text-error hover:bg-error/10 hover:border-error"
                            title="Hapus materi ini"
                          >
                            <TrashIcon className="text-[10px]" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {filteredZhouArticles.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-text-muted">
                  <span>
                    Menampilkan {(zhouPage - 1) * zhouItemsPerPage + 1} &ndash;{" "}
                    {Math.min(zhouPage * zhouItemsPerPage, filteredZhouArticles.length)} dari{" "}
                    {filteredZhouArticles.length} artikel Zhou
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

          {/* Sub-tab 2: Belajar Pajak (Gov) */}
          {educationSubTab === "gov" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-amber-950 block">Direktori Tautan Resmi Kemenkeu &amp; DJP</span>
                  <span className="text-amber-800">
                    Katalog edukasi terverifikasi pemerintah: Simulator Coretax, KLC Kemenkeu, Video YouTube resmi, dan e-book DJP.
                  </span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    setNewItemForm({
                      section: "education-gov",
                      title: "",
                      category: "Direktorat Jenderal Pajak",
                      summary: "",
                      status: "Published",
                      author: "DJP Online",
                      url: "https://pajak.go.id",
                      institution: "DJP",
                      mediaType: "Simulator DJP",
                    });
                    setIsNewItemModalOpen(true);
                  }}
                  className="bg-amber-600 text-white hover:bg-amber-700 text-xs font-semibold h-8 px-3 shrink-0"
                >
                  <PlusIcon className="text-xs mr-1" />
                  Tambah Link Resmi Baru
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {BELAJAR_PAJAK_LINKS.map((gov) => (
                  <Card key={gov.id} className="rounded-2xl border-primary-light bg-white p-4 shadow-xs flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                          {gov.institution}
                        </span>
                        <Badge variant="success" size="sm" dot>
                          Terverifikasi
                        </Badge>
                      </div>
                      <h4 className="text-sm font-bold text-primary">{gov.title}</h4>
                      <p className="text-xs text-text-secondary line-clamp-2">{gov.description}</p>
                      <div className="text-[11px] font-mono text-amber-900 truncate">
                        URL: {gov.url}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-primary-light/60">
                      <span className="text-[10px] text-text-muted">{gov.type}</span>
                      <div className="flex items-center gap-2">
                        <a
                          href={gov.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs h-7 px-2.5 rounded-lg bg-amber-600 text-white hover:bg-amber-700 flex items-center gap-1 font-semibold"
                        >
                          <span>Uji Link</span>
                        </a>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================
          SECTION 8: KARIR & REKRUTMEN
         ========================================================= */}
      {activeSection === "careers" && (
        <div className="space-y-6">
          {/* Card Kontrol Status Lowongan & Teks Statis Periode Kosong */}
          <Card className="rounded-2xl border-primary-light bg-white p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-primary-light">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-primary">
                    Status Penerimaan Lowongan Karir &amp; Pengumuman Statis
                  </h3>
                  <Badge
                    variant={careerSettings.isOpen ? "success" : "silver"}
                    size="sm"
                    dot
                  >
                    {careerSettings.isOpen
                      ? "Penerimaan Terbuka (Aktif Ditampilkan)"
                      : "Penerimaan Ditutup (Pesan Statis Tampil)"}
                  </Badge>
                </div>
                <p className="text-xs text-text-secondary">
                  Kelola apakah Zhou Consulting sedang membuka lowongan karir untuk publik atau tidak. Jika opsi penerimaan ditutup, halaman <code className="text-primary font-mono text-[11px] bg-surface px-1.5 py-0.5 rounded border border-primary-light/60">/karir</code> akan menampilkan pengumuman statis yang Anda atur di bawah ini.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="button"
                  variant={careerSettings.isOpen ? "outline" : "primary"}
                  size="sm"
                  onClick={handleToggleCareerOpenStatus}
                  className="text-xs font-bold h-9 px-4 gap-2"
                >
                  {careerSettings.isOpen ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-error inline-block" />
                      <span>Tutup Penerimaan Lowongan</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-success inline-block" />
                      <span>Buka Kembali Lowongan</span>
                    </>
                  )}
                </Button>
                <Link
                  href="/karir"
                  target="_blank"
                  className="text-xs font-semibold h-9 px-3 rounded-lg border border-primary-light bg-surface hover:bg-white text-primary flex items-center gap-1.5 transition-colors"
                >
                  <EyeIcon className="text-xs" />
                  <span>Lihat /karir</span>
                </Link>
              </div>
            </div>

            {careerSettingsSaved && (
              <div className="p-3.5 rounded-lg bg-success/10 border border-success/30 text-success text-xs font-medium flex items-center justify-between gap-2 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="text-sm shrink-0" />
                  <span>Pengaturan karir dan pengumuman statis berhasil diperbarui dan disinkronkan ke halaman publik (/karir).</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCareerSettingsSaved(false)}
                  className="text-success hover:underline text-xs"
                >
                  Tutup
                </button>
              </div>
            )}

            {/* Form Editor Pengumuman Statis */}
            <form onSubmit={handleSaveCareerAnnouncement} className="space-y-4 pt-1">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">
                  Kustomisasi Teks Pengumuman Statis
                </span>
                <span className="text-[11px] text-text-muted">
                  Terakhir Diperbarui: <strong>{careerSettings.lastUpdated}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="closedTitle" className="text-xs font-bold text-primary block">
                    Judul Pengumuman Statis <span className="text-error">*</span>
                  </Label>
                  <Input
                    id="closedTitle"
                    type="text"
                    value={careerSettings.closedTitle}
                    onChange={(e) =>
                      setCareerSettings({
                        ...careerSettings,
                        closedTitle: e.target.value,
                      })
                    }
                    placeholder="cth. Lowongan Periode Ini Belum Dibuka"
                    className="text-xs bg-surface border-primary-light"
                    required
                  />
                  <p className="text-[11px] text-text-muted">
                    Judul utama yang muncul saat Zhou tidak membuka lowongan.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="closedPeriodNote" className="text-xs font-bold text-primary block">
                    Catatan Periode / Jadwal Pembukaan Berikutnya
                  </Label>
                  <Input
                    id="closedPeriodNote"
                    type="text"
                    value={careerSettings.closedPeriodNote}
                    onChange={(e) =>
                      setCareerSettings({
                        ...careerSettings,
                        closedPeriodNote: e.target.value,
                      })
                    }
                    placeholder="cth. Jadwal penerimaan periode baru akan diumumkan melalui portal resmi."
                    className="text-xs bg-surface border-primary-light"
                  />
                  <p className="text-[11px] text-text-muted">
                    Keterangan periode rekrutmen selanjutnya bagi para pengunjung.
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="closedMessage" className="text-xs font-bold text-primary block">
                  Deskripsi / Pesan Pengumuman Statis <span className="text-error">*</span>
                </Label>
                <Textarea
                  id="closedMessage"
                  rows={3}
                  value={careerSettings.closedMessage}
                  onChange={(e) =>
                    setCareerSettings({
                      ...careerSettings,
                      closedMessage: e.target.value,
                    })
                  }
                  placeholder="Tuliskan keterangan bahwa saat ini seluruh posisi telah terisi..."
                  className="w-full text-xs bg-surface border-primary-light"
                  required
                />
                <p className="text-[11px] text-text-muted">
                  Pesan yang menjelaskan kepada kandidat terkait status lowongan saat ini.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-primary-light/60">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResetCareerAnnouncement}
                  className="text-xs h-8"
                >
                  Reset ke Teks Bawaan
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="text-xs font-bold h-8 px-4"
                >
                  Simpan Perubahan Pengumuman
                </Button>
              </div>
            </form>
          </Card>

          <div className="flex items-center justify-between pt-2">
            <div>
              <h3 className="text-base font-bold text-primary">Daftar Lowongan Karir Aktif (/karir)</h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Kelola posisi pekerjaan aktif, kualifikasi, tanggung jawab, dan tunjangan rekrutmen Zhou Consulting
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setNewItemForm({
                  section: "careers",
                  title: "",
                  category: "Tax Service Core",
                  summary: "",
                  status: "Published",
                  author: "HR & Operasional",
                  url: "",
                  institution: "DJP",
                  mediaType: "Lowongan",
                });
                setIsNewItemModalOpen(true);
              }}
              className="text-xs h-8 px-3 border-primary-light"
            >
              <PlusIcon className="text-xs mr-1" />
              Buka Lowongan Baru
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {careersList.map((job) => (
              <Card key={job.id} className="rounded-2xl border-primary-light bg-white p-5 shadow-xs flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-primary bg-primary-light px-2 py-0.5 rounded text-[11px]">
                      {job.id}
                    </span>
                    <Badge variant={job.status === "Published" ? "success" : "silver"} size="sm" dot>
                      {job.status}
                    </Badge>
                  </div>
                  <h4 className="text-base font-bold text-primary">{job.title}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-text-muted">
                    <span>{job.department}</span>
                    <span>&bull;</span>
                    <span>{job.type}</span>
                  </div>
                  <p className="text-xs text-text-secondary">{job.summary}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-primary-light/60 text-xs">
                  <span className="text-[10px] text-text-muted">{job.experience}</span>
                  <div className="flex items-center gap-2">
                    <Link
                      href="/karir"
                      target="_blank"
                      className="h-8 px-2.5 rounded-lg border border-primary-light bg-surface hover:bg-white text-primary flex items-center gap-1"
                    >
                      Lihat di /karir
                    </Link>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(`PUB-${job.id.toUpperCase()}`)}
                      className="h-8 px-2.5"
                    >
                      Toggle
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================
          SECTION 9: KONTAK & KONSULTASI
         ========================================================= */}
      {activeSection === "contact" && (
        <div className="space-y-5">
          <Card className="rounded-2xl border-primary-light bg-white p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-primary-light">
              <div>
                <h3 className="text-base font-bold text-primary">Manajemen Informasi Kontak &amp; Operasional Kantor</h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Alamat resmi kantor Sudirman, email korporat, jam layanan, dan nomor hotline WhatsApp 3 divisi (/kontak)
                </p>
              </div>
              <Link
                href="/kontak"
                target="_blank"
                className="text-xs font-semibold h-8 px-3 rounded-lg bg-primary-light text-primary hover:bg-primary hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <span>Lihat Kontak</span>
              </Link>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                showToast("Informasi Kontak & Jam Operasional berhasil diperbarui.");
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-primary">Nama Gedung &amp; Kantor</Label>
                  <Input
                    type="text"
                    value={contactContent.officeName}
                    onChange={(e) => setContactContent((prev) => ({ ...prev, officeName: e.target.value }))}
                    className="text-xs bg-surface border-primary-light"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-primary">Email Resmi Korporat</Label>
                  <Input
                    type="email"
                    value={contactContent.email}
                    onChange={(e) => setContactContent((prev) => ({ ...prev, email: e.target.value }))}
                    className="text-xs bg-surface border-primary-light font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-primary">Alamat Lengkap</Label>
                  <Input
                    type="text"
                    value={contactContent.address}
                    onChange={(e) => setContactContent((prev) => ({ ...prev, address: e.target.value }))}
                    className="text-xs bg-surface border-primary-light"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-primary">Kota &amp; Kode Pos</Label>
                  <Input
                    type="text"
                    value={contactContent.city}
                    onChange={(e) => setContactContent((prev) => ({ ...prev, city: e.target.value }))}
                    className="text-xs bg-surface border-primary-light"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-primary">Jam Kerja Operasional</Label>
                <Input
                  type="text"
                  value={contactContent.operatingHours}
                  onChange={(e) => setContactContent((prev) => ({ ...prev, operatingHours: e.target.value }))}
                  className="text-xs bg-surface border-primary-light"
                />
              </div>

              {/* Hotlines WhatsApp 3 Divisi */}
              <div className="pt-3 border-t border-primary-light space-y-2">
                <Label className="text-xs font-bold text-primary uppercase tracking-wider block">
                  3 Hotline WhatsApp Resmi per Divisi:
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {contactContent.whatsappHotlines.map((h, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-surface border border-primary-light space-y-1.5">
                      <span className="text-[10px] font-bold text-primary block">{h.division}</span>
                      <Input
                        value={h.number}
                        onChange={(e) => {
                          const updated = [...contactContent.whatsappHotlines];
                          updated[idx].number = e.target.value;
                          setContactContent((prev) => ({ ...prev, whatsappHotlines: updated }));
                        }}
                        className="text-xs h-8 bg-white border-primary-light font-mono font-bold"
                      />
                      <span className="text-[10px] text-text-muted block">PIC: {h.personInCharge}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-primary-light flex justify-end">
                <Button type="submit" variant="primary" size="sm" className="text-xs h-9 px-5 font-semibold">
                  Simpan Informasi Kontak
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* =========================================================
          SECTION 10: LEMBAR KERJA STAF (PRESERVED OPERATIONAL)
         ========================================================= */}
      {activeSection === "tickets" && (
        <div className="space-y-5">
          <div className="p-4 rounded-xl bg-surface border border-primary-light flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-primary block">Modul Operasional Lembar Kerja Staf Konsultan</span>
              <span className="text-text-secondary">
                Kelola status penugasan tiket internal klien, checklist bertahap, dan pelaporan hasil kerja.
              </span>
            </div>
            <Badge variant="primary" size="sm">
              {ticketsList.length} Tiket Aktif
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Tickets list */}
            <div className="space-y-3">
              {ticketsList.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer text-xs space-y-2 ${
                    selectedTicket.id === t.id
                      ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                      : "border-primary-light bg-white hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-primary">{t.id}</span>
                    <Badge variant={t.status === "In Progress" ? "silver" : "success"} size="sm">
                      {t.status}
                    </Badge>
                  </div>
                  <h4 className="font-bold text-primary">{t.clientName}</h4>
                  <p className="text-[11px] text-text-secondary line-clamp-1">{t.title}</p>
                  <div className="text-[10px] text-text-muted">PIC: {t.consultant}</div>
                </div>
              ))}
            </div>

            {/* Ticket details & checklists */}
            <div className="lg:col-span-2">
              <Card className="rounded-2xl border-primary-light bg-white p-5 shadow-xs space-y-4 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-primary-light">
                  <div>
                    <span className="font-mono font-bold text-primary">{selectedTicket.id}</span>
                    <h3 className="text-base font-bold text-primary mt-0.5">{selectedTicket.title}</h3>
                    <span className="text-[11px] text-text-muted">Klien: {selectedTicket.clientName} ({selectedTicket.clientId})</span>
                  </div>
                  <Badge variant={selectedTicket.status === "In Progress" ? "silver" : "success"}>
                    {selectedTicket.status}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <span className="font-bold text-primary block">Checklist Verifikasi Lembar Kerja:</span>
                  <div className="space-y-2">
                    {selectedTicket.checklists.map((chk) => (
                      <label
                        key={chk.id}
                        className="flex items-center gap-2.5 p-2.5 rounded-lg border border-primary-light bg-surface hover:bg-white cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={chk.done}
                          onChange={() => {
                            const updated = selectedTicket.checklists.map((c) =>
                              c.id === chk.id ? { ...c, done: !c.done } : c
                            );
                            const updatedTicket = { ...selectedTicket, checklists: updated };
                            setSelectedTicket(updatedTicket);
                            setTicketsList((prev) =>
                              prev.map((t) => (t.id === selectedTicket.id ? updatedTicket : t))
                            );
                            showToast(`Checklist task #${chk.id} diperbarui.`);
                          }}
                          className="w-4 h-4 rounded text-primary focus:ring-primary"
                        />
                        <span className={`text-xs ${chk.done ? "line-through text-text-muted" : "text-text-primary font-medium"}`}>
                          {chk.text}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-primary-light flex items-center justify-between text-[11px]">
                  <span className="text-text-muted">Tenggat SLA: {selectedTicket.slaDue}</span>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      const allDone = selectedTicket.checklists.every((c) => c.done);
                      if (!allDone) {
                        showToast("Selesaikan seluruh butir checklist sebelum mengesahkan tiket.");
                        return;
                      }
                      const updated = { ...selectedTicket, status: "Completed" as const };
                      setSelectedTicket(updated);
                      setTicketsList((prev) => prev.map((t) => (t.id === selectedTicket.id ? updated : t)));
                      showToast(`Tiket ${selectedTicket.id} resmi disahkan selesai.`);
                    }}
                    className="text-xs h-8 px-4 font-semibold"
                  >
                    Sahkan Tiket Selesai
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: PRATINJAU KONTEN PUBLIK
         ========================================================= */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-primary-light max-w-xl w-full p-6 space-y-4 relative max-h-[90vh] overflow-y-auto text-xs">
            <button
              onClick={() => setPreviewItem(null)}
              className="absolute top-5 right-5 text-text-secondary hover:text-primary p-1"
              aria-label="Tutup pratinjau"
            >
              <CloseIcon className="text-sm" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[11px] font-bold text-primary bg-primary-light px-2 py-0.5 rounded">
                  {previewItem.id}
                </span>
                <span className="text-[10px] font-bold text-text-muted bg-surface px-2 py-0.5 rounded border border-primary-light uppercase">
                  {previewItem.sectionLabel}
                </span>
                <Badge variant={previewItem.status === "Published" ? "success" : "silver"} size="sm" dot>
                  {previewItem.status}
                </Badge>
              </div>
              <h3 className="text-base font-bold text-primary pt-1">{previewItem.title}</h3>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-primary-light space-y-2.5">
              <div className="flex items-center justify-between text-[11px] text-text-muted">
                <span>Kategori: <strong className="text-primary">{previewItem.category}</strong></span>
                <span>Editor: <strong className="text-primary">{previewItem.editor}</strong></span>
              </div>
              <div className="text-[11px] text-text-muted">
                Target Halaman: <strong className="font-mono text-primary">{previewItem.publicRoute}</strong>
              </div>
              <p className="text-text-secondary leading-relaxed pt-2 border-t border-primary-light">
                {previewItem.summary}
              </p>

              {previewItem.url && (
                <div className="p-2.5 rounded-lg bg-white border border-primary-light text-primary font-mono text-[11px] truncate">
                  Tautan Eksternal: {previewItem.url}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setPreviewItem(null)} className="h-8 px-4">
                Tutup
              </Button>

              <div className="flex items-center gap-2">
                <Link
                  href={previewItem.publicRoute}
                  target="_blank"
                  className="h-8 px-3 rounded-xl border border-primary-light bg-surface hover:bg-white text-primary font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <span>Lihat di Web</span>
                </Link>

                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    handleToggleStatus(previewItem.id);
                    setPreviewItem(null);
                  }}
                  className="h-8 px-4 font-semibold"
                >
                  {previewItem.status === "Published" ? "Alihkan ke Draft" : "Publikasikan Sekarang"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: TAMBAH KONTEN PUBLIK BARU
         ========================================================= */}
      {isNewItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-primary-light max-w-lg w-full p-6 space-y-4 relative max-h-[90vh] overflow-y-auto text-xs">
            <button
              onClick={() => setIsNewItemModalOpen(false)}
              className="absolute top-5 right-5 text-text-secondary hover:text-primary p-1"
              aria-label="Tutup form"
            >
              <CloseIcon className="text-sm" />
            </button>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                Penerbitan Konten Public Website
              </span>
              <h3 className="text-lg font-bold text-primary">Tambah Konten Publik Baru</h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Daftarkan materi layanan, regulasi, artikel edukasi, atau lowongan karir baru untuk ditayangkan ke publik.
              </p>
            </div>

            <form onSubmit={handleCreateNewItem} className="space-y-3.5">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-primary">
                  Target Seksi Halaman Publik <span className="text-error">*</span>
                </Label>
                <select
                  value={newItemForm.section}
                  onChange={(e) =>
                    setNewItemForm((prev) => ({
                      ...prev,
                      section: e.target.value as PublicSectionKey,
                    }))
                  }
                  className="w-full text-xs h-9 px-3 rounded-xl border border-primary-light bg-surface text-text-primary focus:bg-white font-medium focus:outline-none"
                >
                  <option value="services">Layanan (/layanan/*)</option>
                  <option value="regulations">Peraturan &amp; Putusan (/peraturan)</option>
                  <option value="education-zhou">Edukasi Zhou — Upload Artikel (/edukasi)</option>
                  <option value="education-gov">Belajar Pajak — Link Kemenkeu/DJP (/edukasi)</option>
                  <option value="careers">Karir &amp; Rekrutmen (/karir)</option>
                  <option value="contact">Informasi Kontak (/kontak)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-primary">
                  Judul Konten Publik <span className="text-error">*</span>
                </Label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Panduan Restrukturisasi Pajak Korporat"
                  value={newItemForm.title}
                  onChange={(e) => setNewItemForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="text-xs h-9 bg-surface border-primary-light focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-primary">
                    Kategori / Tag <span className="text-error">*</span>
                  </Label>
                  <Input
                    type="text"
                    required
                    value={newItemForm.category}
                    onChange={(e) => setNewItemForm((prev) => ({ ...prev, category: e.target.value }))}
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
                        status: e.target.value as ContentStatus,
                      }))
                    }
                    className="w-full text-xs h-9 px-3 rounded-xl border border-primary-light bg-surface text-text-primary focus:bg-white font-medium focus:outline-none"
                  >
                    <option value="Published">Published (Langsung Terbit ke Web)</option>
                    <option value="Draft">Draft (Simpan Konsep Internal)</option>
                  </select>
                </div>
              </div>

              {newItemForm.section === "education-gov" && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-primary">
                    URL Tautan Resmi Pemerintah (.go.id) <span className="text-error">*</span>
                  </Label>
                  <Input
                    type="url"
                    required
                    placeholder="https://pajak.go.id"
                    value={newItemForm.url}
                    onChange={(e) => setNewItemForm((prev) => ({ ...prev, url: e.target.value }))}
                    className="text-xs h-9 bg-surface border-primary-light font-mono"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-primary">
                  Ringkasan / Sinopsis Konten <span className="text-error">*</span>
                </Label>
                <Textarea
                  rows={3}
                  required
                  placeholder="Tulis uraian ringkas mengenai materi ini..."
                  value={newItemForm.summary}
                  onChange={(e) => setNewItemForm((prev) => ({ ...prev, summary: e.target.value }))}
                  className="text-xs bg-surface border-primary-light focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-primary-light flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsNewItemModalOpen(false)}
                  className="h-9 px-4 border-primary-light"
                >
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="sm" className="h-9 px-5 font-semibold">
                  Daftarkan Konten
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: KONFIRMASI HAPUS (DESTRUCTIVE CONFIRMATION)
         ========================================================= */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-error/30 max-w-sm w-full p-5 space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-error/10 text-error flex items-center justify-center shrink-0">
                <TrashIcon className="text-sm" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-primary">Konfirmasi Hapus Konten</h3>
                <p className="text-text-secondary leading-tight">
                  Apakah Anda yakin ingin menghapus konten &ldquo;{itemToDelete.title}&rdquo; dari direktori public website?
                </p>
              </div>
            </div>

            <div className="p-3 bg-surface rounded-xl border border-primary-light text-[11px] text-text-muted">
              Tindakan ini akan mencabut konten dari penayangan live di Public Website.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setItemToDelete(null)} className="h-8 px-3">
                Batal
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleConfirmDelete}
                className="h-8 px-4 bg-error hover:bg-error/90 text-white font-semibold"
              >
                Hapus Permanen
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* =========================================================
          MODAL: UPLOAD / EDIT MATERI EDUKASI ZHOU (CREATE & UPDATE)
         ========================================================= */}
      {isZhouUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-primary-light max-w-xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-primary-light">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary-light text-primary flex items-center justify-center">
                  <BookIcon className="text-sm" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-primary">
                    {zhouItemToEdit ? "Edit Materi & Modul Edukasi Zhou" : "Upload Konten Materi / Modul Zhou Baru"}
                  </h3>
                  <p className="text-[11px] text-text-secondary">
                    {zhouItemToEdit ? "Perbarui informasi materi modul yang tersimpan." : "Tambah materi modul literasi perpajakan baru ke website."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsZhouUploadModalOpen(false);
                  setZhouItemToEdit(null);
                }}
                className="w-7 h-7 rounded-lg text-text-muted hover:text-primary hover:bg-surface flex items-center justify-center"
              >
                <CloseIcon className="text-xs" />
              </button>
            </div>

            <form onSubmit={handleSaveZhou} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-primary">
                  Judul Modul / Materi <span className="text-error">*</span>
                </Label>
                <Input
                  type="text"
                  required
                  placeholder="Contoh: Panduan Implementasi Bukti Potong Unifikasi Coretax 2026"
                  value={zhouForm.title}
                  onChange={(e) => setZhouForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="text-xs h-9 bg-surface border-primary-light focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-primary">Kategori Topik</Label>
                  <select
                    value={zhouForm.category}
                    onChange={(e) => {
                      const cat = e.target.value;
                      let key = "coretax";
                      if (cat.includes("PPh")) key = "pph-ppn";
                      else if (cat.includes("SP2DK")) key = "sp2dk";
                      else if (cat.includes("Akuntansi")) key = "akuntansi";
                      else if (cat.includes("Legal")) key = "legal";
                      setZhouForm((prev) => ({ ...prev, category: cat, categoryKey: key }));
                    }}
                    className="w-full text-xs h-9 px-3 rounded-xl border border-primary-light bg-surface text-text-primary focus:bg-white font-medium focus:outline-none"
                  >
                    <option value="Coretax DJP 2026">Coretax DJP 2026</option>
                    <option value="Kepatuhan PPh & PPN">Kepatuhan PPh & PPN</option>
                    <option value="Mitigasi SP2DK">Mitigasi SP2DK</option>
                    <option value="Akuntansi SAK">Akuntansi SAK</option>
                    <option value="Legal Korporat">Legal Korporat</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-primary">Status Publikasi</Label>
                  <select
                    value={zhouForm.status}
                    onChange={(e) =>
                      setZhouForm((prev) => ({
                        ...prev,
                        status: e.target.value as "Published" | "Draft",
                      }))
                    }
                    className="w-full text-xs h-9 px-3 rounded-xl border border-primary-light bg-surface text-text-primary focus:bg-white font-medium focus:outline-none"
                  >
                    <option value="Published">Published (Tayang di Web)</option>
                    <option value="Draft">Draft (Konsep Internal)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-primary">Penulis / Ahli</Label>
                  <Input
                    type="text"
                    required
                    placeholder="Tim Konsultan BKP Zhou"
                    value={zhouForm.author}
                    onChange={(e) => setZhouForm((prev) => ({ ...prev, author: e.target.value }))}
                    className="text-xs h-9 bg-surface border-primary-light focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-primary">Durasi Baca / Halaman</Label>
                  <Input
                    type="text"
                    placeholder="7 menit baca / 15 Hal"
                    value={zhouForm.readTime}
                    onChange={(e) => setZhouForm((prev) => ({ ...prev, readTime: e.target.value }))}
                    className="text-xs h-9 bg-surface border-primary-light focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-primary">Tanggal Rilis</Label>
                  <Input
                    type="text"
                    placeholder="22 September 2026"
                    value={zhouForm.date}
                    onChange={(e) => setZhouForm((prev) => ({ ...prev, date: e.target.value }))}
                    className="text-xs h-9 bg-surface border-primary-light focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-primary">
                  Ringkasan / Abstrak Modul <span className="text-error">*</span>
                </Label>
                <Textarea
                  rows={2}
                  required
                  placeholder="Uraian singkat materi modul yang akan tampil pada kartu artikel..."
                  value={zhouForm.summary}
                  onChange={(e) => setZhouForm((prev) => ({ ...prev, summary: e.target.value }))}
                  className="text-xs bg-surface border-primary-light focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-primary">
                  Poin-Poin Kunci / Rekomendasi <span className="text-text-muted font-normal">(1 baris per poin)</span>
                </Label>
                <Textarea
                  rows={3}
                  placeholder="Tulis setiap poin rekomendasi pada baris baru..."
                  value={zhouForm.takeawaysRaw}
                  onChange={(e) => setZhouForm((prev) => ({ ...prev, takeawaysRaw: e.target.value }))}
                  className="text-xs bg-surface border-primary-light focus:bg-white font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-primary">
                  Isi Lengkap Materi / Modul <span className="text-text-muted font-normal">(Pisahkan paragraf dengan baris kosong)</span>
                </Label>
                <Textarea
                  rows={4}
                  placeholder="Tulis materi modul secara mendalam..."
                  value={zhouForm.contentRaw}
                  onChange={(e) => setZhouForm((prev) => ({ ...prev, contentRaw: e.target.value }))}
                  className="text-xs bg-surface border-primary-light focus:bg-white"
                />
              </div>

              {/* Pilihan Tampilkan di Carousel Unggulan Showcase */}
              <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 flex items-center justify-between">
                <Label className="text-xs font-bold text-amber-950 flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={zhouForm.isFeatured}
                    onChange={(e) => setZhouForm((prev) => ({ ...prev, isFeatured: e.target.checked }))}
                    className="rounded text-amber-600 focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                  <span>Tampilkan di Carousel Publikasi Unggulan Utama (/edukasi)</span>
                </Label>
                <span className="text-[10px] text-amber-800 font-semibold">Bisa di-swipe pengunjung</span>
              </div>

              {/* Attachment / File Modul Upload Section */}
              <div className="p-3.5 bg-surface rounded-xl border border-primary-light space-y-2.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-primary flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={zhouForm.hasAttachment}
                      onChange={(e) => setZhouForm((prev) => ({ ...prev, hasAttachment: e.target.checked }))}
                      className="rounded text-primary focus:ring-0"
                    />
                    <span>Sertakan File Dokumen Modul (Downloadable)</span>
                  </Label>
                  <span className="text-[10px] text-text-muted">Format PDF / DOCX</span>
                </div>

                {zhouForm.hasAttachment && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    <div className="sm:col-span-2 space-y-1">
                      <span className="text-[10px] font-semibold text-text-secondary">Nama File Dokumen</span>
                      <Input
                        type="text"
                        placeholder="Contoh: Modul_Panduan_Coretax_2026.pdf"
                        value={zhouForm.attachmentName}
                        onChange={(e) => setZhouForm((prev) => ({ ...prev, attachmentName: e.target.value }))}
                        className="text-xs h-8 bg-white border-primary-light font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold text-text-secondary">Ukuran File</span>
                      <Input
                        type="text"
                        placeholder="2.4 MB"
                        value={zhouForm.attachmentSize}
                        onChange={(e) => setZhouForm((prev) => ({ ...prev, attachmentSize: e.target.value }))}
                        className="text-xs h-8 bg-white border-primary-light font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-primary-light flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsZhouUploadModalOpen(false);
                    setZhouItemToEdit(null);
                  }}
                  className="h-8 px-3.5 border-primary-light"
                >
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="sm" className="h-8 px-5 font-semibold">
                  {zhouItemToEdit ? "Simpan Perubahan" : "Upload & Publikasikan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: DETAIL / PREVIEW MATERI ZHOU (READ)
         ========================================================= */}
      {zhouItemToPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-primary-light max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-primary-light">
              <div className="flex items-center gap-2">
                <Badge variant="primary" size="sm">
                  {zhouItemToPreview.category}
                </Badge>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    zhouItemToPreview.status === "Draft"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {zhouItemToPreview.status || "Published"}
                </span>
                <span className="text-text-muted">&bull;</span>
                <span className="text-text-muted font-mono">{zhouItemToPreview.id}</span>
              </div>
              <button
                type="button"
                onClick={() => setZhouItemToPreview(null)}
                className="w-7 h-7 rounded-lg text-text-muted hover:text-primary hover:bg-surface flex items-center justify-center"
              >
                <CloseIcon className="text-xs" />
              </button>
            </div>

            <div className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-primary leading-snug">
                {zhouItemToPreview.title}
              </h2>
              <div className="flex items-center gap-3 text-text-secondary text-[11px]">
                <span>Penulis: <strong className="text-primary">{zhouItemToPreview.author}</strong></span>
                <span>&bull;</span>
                <span>{zhouItemToPreview.date}</span>
                <span>&bull;</span>
                <span>{zhouItemToPreview.readTime}</span>
              </div>
            </div>

            <div className="p-3 bg-surface rounded-xl border border-primary-light space-y-1">
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">
                Ringkasan Materi:
              </span>
              <p className="text-text-secondary leading-relaxed">{zhouItemToPreview.summary}</p>
            </div>

            {/* Takeaways */}
            {zhouItemToPreview.takeaways && zhouItemToPreview.takeaways.length > 0 && (
              <div className="space-y-1.5 p-3 rounded-xl bg-primary/5 border border-primary/15">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">
                  Poin Rekomendasi Konsultan:
                </span>
                <ul className="space-y-1 text-text">
                  {zhouItemToPreview.takeaways.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircleIcon className="text-success text-xs shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Content Paragraphs */}
            <div className="space-y-2 pt-1 text-text leading-relaxed">
              {zhouItemToPreview.content?.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>

            {/* Attachment preview if present */}
            {zhouItemToPreview.attachment && (
              <div className="p-3 bg-surface rounded-xl border border-primary-light flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <DocumentIcon className="text-primary text-sm" />
                  <div>
                    <span className="font-bold text-primary block">{zhouItemToPreview.attachment.name}</span>
                    <span className="text-[10px] text-text-muted">
                      {zhouItemToPreview.attachment.type} &bull; {zhouItemToPreview.attachment.size}
                    </span>
                  </div>
                </div>
                <Badge variant="silver" size="sm">
                  Tersedia untuk Unduh
                </Badge>
              </div>
            )}

            <div className="pt-3 border-t border-primary-light flex items-center justify-between">
              <Link
                href="/edukasi?tab=edukasi-zhou"
                target="_blank"
                className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
              >
                <span>Buka di Halaman Web Edukasi</span>
                <EyeIcon className="text-[10px]" />
              </Link>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const item = zhouItemToPreview;
                    setZhouItemToPreview(null);
                    handleOpenEditZhou(item);
                  }}
                  className="h-8 px-3 text-xs"
                >
                  <EditIcon className="text-xs mr-1" />
                  Edit Materi
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setZhouItemToPreview(null)}
                  className="h-8 px-4 text-xs"
                >
                  Tutup
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: KONFIRMASI HAPUS MATERI ZHOU (DELETE)
         ========================================================= */}
      {zhouItemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-error/30 max-w-sm w-full p-5 space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-error/10 text-error flex items-center justify-center shrink-0">
                <TrashIcon className="text-sm" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-primary">Hapus Materi Edukasi Zhou?</h3>
                <p className="text-text-secondary leading-tight">
                  Materi &ldquo;{zhouItemToDelete.title}&rdquo; akan dihapus dari katalog edukasi.
                </p>
              </div>
            </div>

            <div className="p-3 bg-surface rounded-xl border border-primary-light text-[11px] text-text-muted">
              Materi ini tidak akan lagi tampil di halaman publik Edukasi Zhou Consulting.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setZhouItemToDelete(null)}
                className="h-8 px-3"
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleConfirmDeleteZhou}
                className="h-8 px-4 bg-error hover:bg-error/90 text-white font-semibold"
              >
                Hapus Permanen
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: TAMBAH / EDIT DOKUMEN REGULASI & SOP ZHOU (CRUD)
         ========================================================= */}
      {isRegModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-primary-light max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-primary-light">
              <div>
                <h3 className="text-base font-bold text-primary">
                  {regItemToEdit ? "Edit Dokumen Regulasi / SOP" : "Tambah Dokumen Regulasi / SOP Baru"}
                </h3>
                <p className="text-[11px] text-text-secondary mt-0.5">
                  {regItemToEdit
                    ? "Perbarui metadata dokumen hukum atau SOP internal. Perubahan langsung tersimpan ke website."
                    : "Tambahkan dokumen hukum resmi atau regulasi internal Zhou Consulting ke sistem."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsRegModalOpen(false);
                  setRegItemToEdit(null);
                }}
                className="w-7 h-7 rounded-lg text-text-muted hover:text-primary hover:bg-surface flex items-center justify-center"
              >
                <CloseIcon className="text-xs" />
              </button>
            </div>

            <form onSubmit={handleSaveRegulation} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-primary">
                    Kategori Regulasi <span className="text-error">*</span>
                  </Label>
                  <select
                    value={regForm.category}
                    onChange={(e) =>
                      setRegForm((prev) => ({
                        ...prev,
                        category: e.target.value as RegulationCategory,
                      }))
                    }
                    className="w-full text-xs h-9 px-3 rounded-xl border border-primary-light bg-surface text-text-primary focus:bg-white font-medium focus:outline-none"
                  >
                    {REGULATION_CATEGORIES.filter((c) => c !== "Semua").map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-primary">Status Dokumen</Label>
                  <select
                    value={regForm.status}
                    onChange={(e) =>
                      setRegForm((prev) => ({
                        ...prev,
                        status: e.target.value as RegulationStatus,
                      }))
                    }
                    className="w-full text-xs h-9 px-3 rounded-xl border border-primary-light bg-surface text-text-primary focus:bg-white font-medium focus:outline-none"
                  >
                    <option value="Berlaku">Berlaku (Aktif)</option>
                    <option value="Pembaruan">Pembaruan (Revisi/Transisi)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label className="text-xs font-semibold text-primary">
                    Nomor Dokumen <span className="text-error">*</span>
                  </Label>
                  <Input
                    type="text"
                    required
                    placeholder="Contoh: SOP-ZHOU/TAX/2026/01 atau PMK No. 81/2024"
                    value={regForm.docNumber}
                    onChange={(e) => setRegForm((prev) => ({ ...prev, docNumber: e.target.value }))}
                    className="text-xs h-9 bg-surface border-primary-light focus:bg-white font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-primary">Ukuran File</Label>
                  <Input
                    type="text"
                    placeholder="1.8 MB"
                    value={regForm.fileSize}
                    onChange={(e) => setRegForm((prev) => ({ ...prev, fileSize: e.target.value }))}
                    className="text-xs h-9 bg-surface border-primary-light focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-primary">
                  Tanggal Berlaku Mulai <span className="text-error">*</span>
                </Label>
                <Input
                  type="text"
                  required
                  placeholder="Contoh: 1 Januari 2026 atau 15 Juli 2025"
                  value={regForm.effectiveDate}
                  onChange={(e) => setRegForm((prev) => ({ ...prev, effectiveDate: e.target.value }))}
                  className="text-xs h-9 bg-surface border-primary-light focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-primary">
                  Judul Regulasi / Dokumen <span className="text-error">*</span>
                </Label>
                <Input
                  type="text"
                  required
                  placeholder="Judul lengkap regulasi atau panduan operasional..."
                  value={regForm.title}
                  onChange={(e) => setRegForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="text-xs h-9 bg-surface border-primary-light focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-primary">
                  Ruang Lingkup &amp; Ringkasan Regulasi <span className="text-error">*</span>
                </Label>
                <Textarea
                  rows={3}
                  required
                  placeholder="Uraikan ruang lingkup, pokok materi, substansi hukum, atau petunjuk teknis terkait..."
                  value={regForm.scope}
                  onChange={(e) => setRegForm((prev) => ({ ...prev, scope: e.target.value }))}
                  className="text-xs bg-surface border-primary-light focus:bg-white leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-primary-light flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsRegModalOpen(false);
                    setRegItemToEdit(null);
                  }}
                  className="h-8 px-3.5 border-primary-light"
                >
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="sm" className="h-8 px-5 font-semibold">
                  {regItemToEdit ? "Simpan Perubahan" : "Simpan Dokumen"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: KONFIRMASI HAPUS DOKUMEN REGULASI (DELETE)
         ========================================================= */}
      {regItemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-error/30 max-w-sm w-full p-5 space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-error/10 text-error flex items-center justify-center shrink-0">
                <TrashIcon className="text-sm" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-primary">Hapus Dokumen Regulasi?</h3>
                <p className="text-text-secondary leading-tight">
                  Dokumen &ldquo;{regItemToDelete.docNumber}: {regItemToDelete.title}&rdquo; akan dihapus.
                </p>
              </div>
            </div>

            <div className="p-3 bg-surface rounded-xl border border-primary-light text-[11px] text-text-muted">
              Dokumen ini tidak akan lagi tampil di tabel regulasi publik website (/peraturan).
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRegItemToDelete(null)}
                className="h-8 px-3"
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleConfirmDeleteRegulation}
                className="h-8 px-4 bg-error hover:bg-error/90 text-white font-semibold"
              >
                Hapus Permanen
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-text-muted">
          Memuat Public Website Content Management...
        </div>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}
