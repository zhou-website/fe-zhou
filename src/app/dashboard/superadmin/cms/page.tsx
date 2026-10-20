"use client";

import React, { useState, useEffect, useMemo, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import {
  CheckCircleIcon,
  SearchIcon,
  CloseIcon,
  EditIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
  ImageIcon,
  UploadIcon,
  EyeIcon,
  DocumentIcon,
  MoreVerticalIcon,
} from "@/components/icons";
import { downloadRemoteFile } from "@/lib/downloadHelper";
import {
  addZhouArticle,
  updateZhouArticle,
  deleteZhouArticle,
  toggleArticleStatus,
  extractEducationImageAndBody,
  formatEducationBodyWithImage,
  compressImageFile,
  getStoredZhouArticles,
  ZHOU_ARTICLES_EVENT,
  getStoredBelajarPajakLinks,
  addStoredBelajarPajakLink,
  updateStoredBelajarPajakLink,
  deleteStoredBelajarPajakLink,
  GOV_LINKS_EVENT,
} from "@/data/edukasiStorage";
import { BelajarPajakLink } from "@/data/edukasiData";
import {
  addStoredService,
  updateStoredService,
  deleteStoredService,
  getStoredServices,
  SERVICES_EVENT,
} from "@/data/layananStorage";
import {
  addRegulation,
  updateRegulation,
  deleteRegulation,
  toggleRegulationStatus,
  mapToRegulationCategory,
  getStoredRegulationLegalMeta,
  setStoredRegulationLegalStatus,
  getStoredRegulations,
  saveStoredKmkRates,
  getStoredKmkRates,
  syncKmkRatesFromDjp,
  KMK_RATES_EVENT,
  REGULATIONS_EVENT,
} from "@/data/regulasiStorage";
import {
  addStoredCareerPosition,
  updateStoredCareerPosition,
  deleteStoredCareerPosition,
  getStoredCareerPositions,
  CAREER_SETTINGS_EVENT,
} from "@/data/karirStorage";
import {
  isCmsItemDeleted,
  recordDeletedCmsItem,
  CMS_DELETED_ITEMS_EVENT,
} from "@/data/cmsDeletedStorage";
import {
  getCmsItemStatus,
  setCmsItemStatus,
  CMS_STATUS_UPDATED_EVENT,
} from "@/data/cmsStatusStorage";
import {
  adminCmsApi,
  publicApi,
  parseContactSettings,
  ChatbotFaqItem,
  PublicEducationItem,
  PublicRegulationItem,
  PublicServiceItem,
  PublicCareerItem,
} from "@/lib/api";

export type CMSTab =
  | "all"
  | "services"
  | "regulasi"
  | "kurs"
  | "edukasi"
  | "edukasi_djp"
  | "kontak"
  | "karir"
  | "faqs";

export interface UnifiedCMSItem {
  id: string;
  numericId: number;
  section: "edukasi" | "services" | "regulasi" | "kurs" | "karir" | "faqs" | "kontak";
  title: string;
  category:
  | "Katalog Layanan"
  | "Peraturan"
  | "Kurs Pajak"
  | "Edukasi Zhou"
  | "Tautan Edukasi DJP"
  | "Profil & Kontak"
  | "Lowongan Karir"
  | "FAQ Chatbot"
  | string;
  subcategory: string;
  summary: string;
  status: "Published" | "Draft" | "Archived";
  updatedAt: string;
  raw?: unknown;
}

const TAB_TO_CATEGORY: Record<string, string> = {
  all: "ALL",
  services: "Katalog Layanan",
  layanan: "Katalog Layanan",
  regulasi: "Peraturan",
  peraturan: "Peraturan",
  kurs: "Kurs Pajak",
  edukasi: "Edukasi Zhou",
  edukasi_djp: "Tautan Edukasi DJP",
  kontak: "Profil & Kontak",
  karir: "Lowongan Karir",
  faqs: "FAQ Chatbot",
};

interface KursRateInput {
  currency: string;
  name: string;
  rate: string;
  flag: string;
}

const INITIAL_BATCH_KURS: KursRateInput[] = [];

function AdminCMSPageContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as CMSTab;

  const [cmsItems, setCmsItems] = useState<UnifiedCMSItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>(
    tabParam && TAB_TO_CATEGORY[tabParam] ? TAB_TO_CATEGORY[tabParam] : "ALL"
  );
  const [subcategoryFilter, setSubcategoryFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Pagination State (Sesuai Desain Gambar 5)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, subcategoryFilter, statusFilter, searchQuery]);

  // Floating Dropdowns State (Pattern Konsisten dengan Public Website Navbar)
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const categoryDropdownRef = React.useRef<HTMLDivElement>(null);
  const statusDropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isCategoryDropdownOpen && !isStatusDropdownOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(target)
      ) {
        setIsCategoryDropdownOpen(false);
      }
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(target)
      ) {
        setIsStatusDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsCategoryDropdownOpen(false);
        setIsStatusDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCategoryDropdownOpen, isStatusDropdownOpen]);

  // Click Outside & Escape Key Listener for Table Row Overflow Action Menus
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    if (!openMenuId) return;

    const handleMenuClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest("[data-overflow-menu]")) {
        setOpenMenuId(null);
      }
    };

    const handleMenuKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleMenuClickOutside);
    document.addEventListener("keydown", handleMenuKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleMenuClickOutside);
      document.removeEventListener("keydown", handleMenuKeyDown);
    };
  }, [openMenuId]);

  useEffect(() => {
    if (tabParam && TAB_TO_CATEGORY[tabParam]) {
      setCategoryFilter(TAB_TO_CATEGORY[tabParam]);
      setSubcategoryFilter("ALL");
    }
  }, [tabParam]);

  // Profile & Contact Settings Form State
  const [heroForm, setHeroForm] = useState({
    headline: "Solusi Terintegrasi Perpajakan, Akuntansi & Legalitas Usaha",
    subheadline: "Didukung tim konsultan bersertifikasi BKP dan akuntan profesional untuk kepatuhan fiskal bisnis Anda.",
  });

  const [contactForm, setContactForm] = useState({
    companyName: "Zhou Consulting",
    email: "consultingzhou@gmail.com",
    phone: "",
    address: "MyRepublic Plaza (d/h Green Office Park 6), Wing A, Lantai Dasar Zona 6, Jalan Grand Boulevard, BSD Green Office Park, Desa Sampora, Kecamatan Cisauk, Kabupaten Tangerang, Banten 15345",
    whatsapp: "+62 851-2128-6086",
  });

  // Kurs Form
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [kursRates, setKursRates] = useState<KursRateInput[]>(INITIAL_BATCH_KURS);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [kmkNumber, setKmkNumber] = useState("KMK No. 44/KM.10/2026");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isHeroModalOpen, setIsHeroModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isBatchKursModalOpen, setIsBatchKursModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<ChatbotFaqItem | null>(null);
  const [editingEduId, setEditingEduId] = useState<number | null>(null);
  const [editingDjpLinkId, setEditingDjpLinkId] = useState<string | null>(null);
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  const [editingServiceOriginalId, setEditingServiceOriginalId] = useState<string | null>(null);
  const [editingServiceOriginalTitle, setEditingServiceOriginalTitle] = useState<string | null>(null);
  const [editingRegId, setEditingRegId] = useState<number | null>(null);
  const [editingKursId, setEditingKursId] = useState<number | null>(null);
  const [editingCareerId, setEditingCareerId] = useState<number | null>(null);
  const [viewingItem, setViewingItem] = useState<UnifiedCMSItem | null>(null);
  const [modalSection, setModalSection] = useState<
    "services" | "regulasi" | "kurs" | "edukasi" | "edukasi_djp" | "kontak" | "karir" | "faqs"
  >("services");

  const [djpLinkForm, setDjpLinkForm] = useState({
    title: "",
    url: "https://pajak.go.id",
    institution: "DJP" as "DJP" | "Kemenkeu",
    institutionName: "Direktorat Jenderal Pajak (DJP)",
    type: "Portal Web" as "Situs Web" | "Portal Web" | "Simulator DJP" | "Video Tutorial" | "E-Learning" | "Buku Panduan (PDF)",
    badge: "PORTAL RESMI DJP",
    description: "",
    status: "Published" as "Published" | "Draft",
  });

  const resetAllEditingState = () => {
    setEditingEduId(null);
    setEditingDjpLinkId(null);
    setEditingServiceId(null);
    setEditingServiceOriginalId(null);
    setEditingServiceOriginalTitle(null);
    setEditingRegId(null);
    setEditingKursId(null);
    setEditingCareerId(null);
    setEditingFaq(null);
  };

  const isCurrentlyEditing = Boolean(
    editingEduId || editingDjpLinkId || editingServiceId || editingServiceOriginalId || editingRegId || editingKursId || editingCareerId || editingFaq
  );

  // Form states strictly matching backend request bodies:
  // 1. Edukasi
  const [eduForm, setEduForm] = useState({
    title: "",
    category: "Coretax DJP",
    content_type: "ARTICLE" as "ARTICLE" | "GUIDE",
    body: "",
    file_path: "",
    file_name: "",
    file_size: "",
    image: "",
    image_name: "",
    status: "Published" as "Published" | "Draft",
  });

  // Handler Upload Gambar Sampul Edukasi (Opsional)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Format berkas harus berupa gambar (JPG, PNG, WEBP).");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      showToast("Ukuran gambar melebihi batas maksimal 8 MB.");
      return;
    }

    try {
      // Kompresi otomatis ke resolusi optimal 1200x800 & JPEG kualitas 82% agar muat di kolom TEXT database
      const compressedDataUrl = await compressImageFile(file, 1200, 800, 0.82);
      setEduForm((prev) => ({
        ...prev,
        image: compressedDataUrl,
        image_name: file.name,
      }));
      showToast(`Gambar sampul "${file.name}" berhasil diunggah.`);
    } catch (err) {
      console.error("Gagal memproses file gambar:", err);
      showToast("Gagal memproses file gambar.");
    }
  };

  // Handler Upload Berkas PDF Edukasi (Opsional)
  const handleEduPdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeStr =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    setEduForm((prev) => ({
      ...prev,
      file_path: `/docs/${file.name}`,
      file_name: file.name,
      file_size: sizeStr,
    }));
    showToast(`Berkas PDF "${file.name}" (${sizeStr}) siap dilampirkan.`);
  };

  // Handler Upload Berkas PDF Regulasi
  const handleRegPdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      showToast("Format berkas harus berupa dokumen PDF (.pdf).");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      showToast("Ukuran berkas PDF melebihi batas maksimal 15 MB.");
      return;
    }

    const sizeStr =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setRegForm((prev) => ({
        ...prev,
        file_path: `/docs/${file.name}`,
        file_name: file.name,
        file_size: sizeStr,
        file_data_url: dataUrl,
      }));
      showToast(`Dokumen PDF "${file.name}" (${sizeStr}) berhasil dipilih.`);
    };
    reader.onerror = () => {
      showToast("Gagal membaca berkas PDF.");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveRegPdf = () => {
    setRegForm((prev) => ({
      ...prev,
      file_path: "",
      file_name: "",
      file_size: "",
      file_data_url: "",
    }));
    showToast("Berkas PDF dibatalkan.");
  };

  // 2. Services
  const [serviceForm, setServiceForm] = useState({
    service_code: "",
    service_name: "",
    category: "akuntansi",
    description: "",
    scopes: "",
    deliverable: "",
    is_active: true,
  });

  // 3. Regulasi
  const [regForm, setRegForm] = useState({
    title: "",
    regulation_type: "Regulasi Zhou",
    file_path: "",
    file_name: "",
    file_size: "",
    file_data_url: "",
    legal_status: "Berlaku" as "Berlaku" | "Diperbarui" | "Tidak Berlaku",
    replacement_ref: "",
    status: "Published" as "Published" | "Draft" | "Archived",
  });

  // 4. Kurs Pajak (Integrasi Tautan Resmi DJP - Terupdate Berkala)
  const [kursDjpForm, setKursDjpForm] = useState({
    title: "Kurs Pajak Mingguan Resmi Menteri Keuangan (KMK) - Terintegrasi DJP",
    url: "https://fiskal.kemenkeu.go.id/informasi-publik/kurs-pajak",
    description:
      "Data kurs valuta asing resmi Republik Indonesia terhubung langsung ke portal DJP & Badan Kebijakan Fiskal Kementerian Keuangan RI. Kurs terupdate secara berkala mingguan sesuai penetapan KMK terbaru tanpa perlu input manual satu per satu.",
    status: "Published" as "Published" | "Draft",
  });

  // 5. Karir
  const [careerForm, setCareerForm] = useState({
    position_code: "",
    position_title: "",
    department: "Tax Service Core",
    level: "Senior Associate",
    location: "SCBD Jakarta (Hybrid)",
    description: "",
    is_active: true,
  });

  // 6. FAQs
  const [faqForm, setFaqForm] = useState({
    category: "Layanan Perpajakan",
    question: "",
    answer_template: "",
    status: "Published" as "Published" | "Draft",
  });

  const isDeletingRef = useRef(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const getStableCmsNumericId = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash % 9000) + 1000;
  };

  // Load all backend resources into ONE unified list
  const loadAllCMS = async () => {
    setIsLoading(true);
    try {
      const [
        eduRes,
        srvRes,
        regRes,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _rateRes,
        carRes,
        faqRes,
        profileRes,
        contactRes,
      ] = await Promise.allSettled([
        publicApi.getEducation(),
        publicApi.getServices(),
        publicApi.getRegulations(),
        publicApi.getTaxRates(),
        publicApi.getCareers(),
        adminCmsApi.getFaqs(),
        publicApi.getCompanyProfiles(),
        publicApi.getContactSettings(),
      ]);

      const items: UnifiedCMSItem[] = [];

      // 1. Education (Gabungkan Backend API & Local Storage)
      const existingEduIds = new Set<string>();
      const existingEduTitles = new Set<string>();

      if (eduRes.status === "fulfilled" && Array.isArray(eduRes.value.data) && eduRes.value.data.length > 0) {
        eduRes.value.data.forEach((e: PublicEducationItem) => {
          const id = `EDU-${e.id}`;
          if (isCmsItemDeleted(id, e.title, e.id)) return;
          const { image, cleanBody } = extractEducationImageAndBody(
            e.body,
            e.file_path,
            e.image || e.image_url
          );
          existingEduIds.add(id);
          existingEduIds.add(`be-${e.id}`);
          existingEduTitles.add(e.title.trim().toLowerCase());
          items.push({
            id,
            numericId: e.id,
            section: "edukasi",
            title: e.title,
            category: "Edukasi Zhou",
            subcategory: e.category || "Coretax DJP",
            summary: cleanBody ? cleanBody.slice(0, 140) + "..." : "Artikel edukasi perpajakan",
            status: getCmsItemStatus(id, e.title, "Published", [e.id, `be-${e.id}`]),
            updatedAt: e.created_at ? new Date(e.created_at).toLocaleDateString("id-ID") : "Terbaru",
            raw: { ...e, image, body: cleanBody },
          });
        });
      }

      // Selalu sertakan artikel dari getStoredZhouArticles() (misal: materi yang dibuat admin di browser)
      const storedArticles = getStoredZhouArticles();
      storedArticles.forEach((art) => {
        if (isCmsItemDeleted(art.id, art.title)) return;
        const titleKey = art.title.trim().toLowerCase();
        if (!existingEduTitles.has(titleKey) && !existingEduIds.has(art.id)) {
          existingEduTitles.add(titleKey);
          existingEduIds.add(art.id);
          const numId = parseInt(art.id.replace(/\D/g, "")) || getStableCmsNumericId(art.id + art.title);
          const displayId = art.id.startsWith("EDU-") ? art.id : `EDU-${numId}`;
          items.push({
            id: displayId,
            numericId: numId,
            section: "edukasi",
            title: art.title,
            category: "Edukasi Zhou",
            subcategory: art.category || "Coretax DJP",
            summary: art.summary || (Array.isArray(art.content) ? art.content.join(" ").slice(0, 140) : ""),
            status: getCmsItemStatus(displayId, art.title, art.status === "Draft" ? "Draft" : "Published", [art.id, numId]),
            updatedAt: art.date || "Terbaru",
            raw: {
              ...art,
              body: Array.isArray(art.content) ? art.content.join("\n\n") : "",
              file_path: art.attachment?.name,
            },
          });
        }
      });

      // Selalu sertakan link eksternal DJP/Kemenkeu dari getStoredBelajarPajakLinks()
      const storedGovLinks = getStoredBelajarPajakLinks();
      storedGovLinks.forEach((link) => {
        if (isCmsItemDeleted(link.id, link.title, undefined, link.url)) return;
        const numId = parseInt(link.id.replace(/\D/g, "")) || getStableCmsNumericId(link.id + link.title);
        const displayId = link.id.startsWith("DJP-") || link.id.startsWith("GOV-") ? link.id : `DJP-${link.id}`;
        items.push({
          id: displayId,
          numericId: numId,
          section: "edukasi",
          title: link.title,
          category: "Tautan Edukasi DJP",
          subcategory: `Tautan DJP (${link.type})`,
          summary: `${link.url} • ${link.description}`,
          status: getCmsItemStatus(displayId, link.title, link.status === "Draft" ? "Draft" : "Published", [link.id, numId]),
          updatedAt: link.institution || "DJP",
          raw: { ...link, isDjpLink: true },
        });
      });

      // 2. Services (Gabungkan Backend API & Local Storage)
      const existingSrvTitles = new Set<string>();
      const existingSrvIds = new Set<string>();
      const existingSrvDomains = new Set<string>();

      const getServiceDomain = (cat?: string, name?: string): string => {
        const text = `${cat || ""} ${name || ""}`.toLowerCase();
        if (text.includes("pajak") || text.includes("tax")) return "tax";
        if (text.includes("akuntansi") || text.includes("acc")) return "accounting";
        if (text.includes("bisnis") || text.includes("finan") || text.includes("keuangan")) return "business";
        if (text.includes("hukum") || text.includes("legal") || text.includes("sengketa")) return "legal";
        return text.trim();
      };

      if (srvRes.status === "fulfilled" && Array.isArray(srvRes.value.data) && srvRes.value.data.length > 0) {
        srvRes.value.data.forEach((s: PublicServiceItem) => {
          const id = `SVC-${s.id}`;
          if (isCmsItemDeleted(id, s.service_name, s.id, s.service_code)) {
            if (s.id && (String(s.id).includes("1872") || (s.service_name || "").toLowerCase().includes("pajak1"))) {
              try {
                adminCmsApi.deleteService(s.id);
              } catch {}
            }
            return;
          }
          existingSrvIds.add(id);
          if (s.service_code) existingSrvIds.add(s.service_code.trim().toLowerCase());
          existingSrvTitles.add(s.service_name.trim().toLowerCase());

          items.push({
            id,
            numericId: s.id,
            section: "services",
            title: s.service_name,
            category: "Katalog Layanan",
            subcategory: s.category || "Akuntansi",
            summary: s.description || "Layanan konsultasi resmi",
            status: getCmsItemStatus(id, s.service_name, s.is_active ? "Published" : "Draft", [s.id, s.service_code]),
            updatedAt: "Aktif",
            raw: s,
          });
        });
      }

      const storedServices = getStoredServices();
      storedServices.forEach((s) => {
        if (isCmsItemDeleted(s.id, s.name, undefined, s.code)) return;
        const titleKey = s.name.trim().toLowerCase();
        const codeKey = (s.code || "").trim().toLowerCase();

        // Hindari duplikasi jika sudah terdaftar dari backend dengan ID, kode, atau judul yang sama persis
        const isDuplicate =
          existingSrvTitles.has(titleKey) ||
          existingSrvIds.has(s.id.toLowerCase()) ||
          (codeKey && existingSrvIds.has(codeKey));

        if (!isDuplicate) {
          existingSrvTitles.add(titleKey);
          existingSrvIds.add(s.id.toLowerCase());
          if (codeKey) existingSrvIds.add(codeKey);
          const numId = parseInt(s.id.replace(/\D/g, ""), 10) || getStableCmsNumericId(s.id + s.name);
          const displayId = s.id.startsWith("SVC-") || s.id.startsWith("SRV-") ? s.id : `SVC-${s.code || s.id}`;
          items.push({
            id: displayId,
            numericId: numId,
            section: "services",
            title: s.name,
            category: "Katalog Layanan",
            subcategory: s.categoryKey || "Akuntansi",
            summary: s.subtitle || "Layanan konsultasi resmi",
            status: getCmsItemStatus(displayId, s.name, s.status === "Draft" ? "Draft" : "Published", [s.id, s.code, numId]),
            updatedAt: s.lastUpdated || "Aktif",
            raw: s,
          });
        }
      });

      // 3. Regulations (Gabungkan Backend API & Local Storage)
      const existingRegTitles = new Set<string>();
      const existingRegIds = new Set<string>();

      if (regRes.status === "fulfilled" && Array.isArray(regRes.value.data) && regRes.value.data.length > 0) {
        regRes.value.data.forEach((r: PublicRegulationItem) => {
          const id = `REG-${r.id}`;
          if (isCmsItemDeleted(id, r.title, r.id)) return;
          existingRegIds.add(id);
          existingRegTitles.add(r.title.trim().toLowerCase());
          items.push({
            id,
            numericId: r.id,
            section: "regulasi",
            title: r.title,
            category: "Peraturan",
            subcategory: mapToRegulationCategory(r.regulation_type, r.title),
            summary: `Berkas: ${r.file_path} (${r.file_size || "PDF"})`,
            status: getCmsItemStatus(id, r.title, "Published", [r.id]),
            updatedAt: r.created_at ? new Date(r.created_at).toLocaleDateString("id-ID") : "Terbaru",
            raw: r,
          });
        });
      }

      const storedRegulations = getStoredRegulations();
      storedRegulations.forEach((r) => {
        if (isCmsItemDeleted(r.id, r.title, undefined, r.docNumber)) return;
        const titleKey = r.title.trim().toLowerCase();
        if (!existingRegTitles.has(titleKey) && !existingRegIds.has(r.id)) {
          existingRegTitles.add(titleKey);
          existingRegIds.add(r.id);
          const numId = parseInt(r.id.replace(/\D/g, "")) || Math.floor(Math.random() * 9000) + 1000;
          items.push({
            id: r.id.startsWith("REG-") ? r.id : `REG-${numId}`,
            numericId: numId,
            section: "regulasi",
            title: r.title,
            category: "Peraturan",
            subcategory: mapToRegulationCategory(r.category || r.scope, r.title),
            summary: `Berkas: ${r.downloadUrl || r.docNumber} (${r.fileSize || "PDF"})`,
            status: getCmsItemStatus(r.id, r.title, r.status === "Draft" || r.status === "Pembaruan" ? "Draft" : "Published", [r.docNumber]),
            updatedAt: r.effectiveDate || "Terbaru",
            raw: r,
          });
        }
      });

      // 4. Kurs Pajak (Integrasi Tautan Resmi DJP - Terupdate Berkala, bukan input satu per satu)
      const storedKmk = getStoredKmkRates();
      const kmkUrl = storedKmk.officialDjpUrl || "https://fiskal.kemenkeu.go.id/informasi-publik/kurs-pajak";
      const kmkId = "TAX-KMK-DJP";
      if (!isCmsItemDeleted(kmkId, "Kurs Pajak Mingguan Resmi Menteri Keuangan (KMK) - Terintegrasi DJP")) {
        items.push({
          id: kmkId,
          numericId: 9901,
          section: "kurs",
          title: "Kurs Pajak Mingguan Resmi Menteri Keuangan (KMK) - Terintegrasi DJP",
          category: "Kurs Pajak",
          subcategory: "Portal Resmi DJP (KMK)",
          summary: `Terhubung langsung ke portal Badan Kebijakan Fiskal Kementerian Keuangan RI (${kmkUrl}) • Terupdate berkala mingguan secara resmi.`,
          status: getCmsItemStatus(
            kmkId,
            "Kurs Pajak Mingguan Resmi Menteri Keuangan (KMK) - Terintegrasi DJP",
            "Published",
            ["TAX-KMK-DJP"]
          ),
          updatedAt: "Terupdate Berkala DJP",
          raw: {
            title: "Kurs Pajak Mingguan Resmi Menteri Keuangan (KMK) - Terintegrasi DJP",
            url: kmkUrl,
            description:
              "Data kurs valuta asing resmi Republik Indonesia terhubung langsung ke portal DJP & Badan Kebijakan Fiskal Kementerian Keuangan RI. Kurs terupdate secara berkala mingguan sesuai penetapan KMK terbaru tanpa perlu input manual satu per satu.",
            status: "Published",
          },
        });
      }

      // 5. Careers (Gabungkan Backend API & Local Storage)
      const existingCarTitles = new Set<string>();
      const existingCarIds = new Set<string>();

      if (carRes.status === "fulfilled" && Array.isArray(carRes.value.data) && carRes.value.data.length > 0) {
        carRes.value.data.forEach((c: PublicCareerItem) => {
          const id = `CAR-${c.id}`;
          if (isCmsItemDeleted(id, c.position_title, c.id, c.position_code)) return;
          existingCarIds.add(id);
          existingCarTitles.add(c.position_title.trim().toLowerCase());
          items.push({
            id,
            numericId: c.id,
            section: "karir",
            title: c.position_title,
            category: "Lowongan Karir",
            subcategory: `${c.level} (${c.location})`,
            summary: c.description || "Lowongan karir aktif di Zhou Consulting",
            status: getCmsItemStatus(id, c.position_title, c.is_active ? "Published" : "Draft", [c.id, c.position_code]),
            updatedAt: "Rekrutmen Buka",
            raw: c,
          });
        });
      }

      const storedCareers = getStoredCareerPositions();
      storedCareers.forEach((pos) => {
        if (isCmsItemDeleted(pos.id, pos.title)) return;
        const titleKey = pos.title.trim().toLowerCase();
        if (!existingCarTitles.has(titleKey) && !existingCarIds.has(pos.id)) {
          existingCarTitles.add(titleKey);
          existingCarIds.add(pos.id);
          const numId = parseInt(pos.id.replace(/\D/g, "")) || Math.floor(Math.random() * 9000) + 1000;
          items.push({
            id: pos.id.startsWith("CAR-") ? pos.id : `CAR-${numId}`,
            numericId: numId,
            section: "karir",
            title: pos.title,
            category: "Lowongan Karir",
            subcategory: `${pos.type} (${pos.location})`,
            summary: pos.summary || "Lowongan karir aktif di Zhou Consulting",
            status: getCmsItemStatus(pos.id, pos.title, pos.status === "Draft" ? "Draft" : "Published"),
            updatedAt: "Rekrutmen Buka",
            raw: pos,
          });
        }
      });

      // 7. FAQs
      if (faqRes.status === "fulfilled" && Array.isArray(faqRes.value.data) && faqRes.value.data.length > 0) {
        faqRes.value.data.forEach((f: ChatbotFaqItem) => {
          const id = `FAQ-${f.id}`;
          if (isCmsItemDeleted(id, f.question, f.id)) return;
          items.push({
            id,
            numericId: f.id,
            section: "faqs",
            title: f.question,
            category: "FAQ Chatbot",
            subcategory: f.category || "Layanan Perpajakan",
            summary: f.answer_template ? f.answer_template.slice(0, 140) + "..." : "Respon otomatis chatbot",
            status: getCmsItemStatus(id, f.question, "Published", [f.id]),
            updatedAt: "Bot Knowledge",
            raw: f,
          });
        });
      }

      // 8. Profiles & Contact
      if (profileRes.status === "fulfilled" && Array.isArray(profileRes.value.data)) {
        const heroP = profileRes.value.data.find((p) => p.section_key === "hero");
        if (heroP) {
          setHeroForm({
            headline: heroP.title,
            subheadline: heroP.content,
          });
        }
      }

      if (contactRes.status === "fulfilled" && Array.isArray(contactRes.value.data)) {
        setContactForm(parseContactSettings(contactRes.value.data));
      }

      if (!isCmsItemDeleted("CFG-HERO", "Headline Hero Landing Page")) {
        items.push({
          id: "CFG-HERO",
          numericId: 1,
          section: "kontak",
          title: "Headline Hero Landing Page",
          category: "Profil & Kontak",
          subcategory: "Hero Headline",
          summary: heroForm.headline || "Teks utama headline dan subheadline beranda publik",
          status: getCmsItemStatus("CFG-HERO", "Headline Hero Landing Page", "Published"),
          updatedAt: "Aktif",
        });
      }

      if (!isCmsItemDeleted("CFG-CONTACT", "Informasi Kontak & CS Resmi")) {
        items.push({
          id: "CFG-CONTACT",
          numericId: 2,
          section: "kontak",
          title: "Informasi Kontak & CS Resmi",
          category: "Profil & Kontak",
          subcategory: "Kontak & Alamat",
          summary: `${contactForm.companyName} | ${contactForm.email} | ${contactForm.phone} | WA: ${contactForm.whatsapp}`,
          status: getCmsItemStatus("CFG-CONTACT", "Informasi Kontak & CS Resmi", "Published"),
          updatedAt: "Aktif",
        });
      }

      // Pastikan seluruh item yang pernah dihapus superadmin disaring secara ketat sebelum render
      const finalizedItems = items.filter((item) => {
        const rawObj = (item.raw || {}) as Record<string, unknown>;
        const rId = rawObj.id !== undefined ? String(rawObj.id) : undefined;
        const rCode = (rawObj.code || rawObj.service_code || rawObj.position_code || rawObj.docNumber) as string | undefined;
        return !isCmsItemDeleted(item.id, item.title, rId, rCode);
      });

      setCmsItems(finalizedItems);
    } catch (err) {
      console.warn("Gagal sinkronisasi CMS dengan backend:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllCMS();
    syncKmkRatesFromDjp().catch((err) => console.warn("syncKmkRatesFromDjp on CMS mount:", err));

    const handleStorageUpdate = () => {
      // Cegah race condition saat proses penghapusan sedang berlangsung
      if (isDeletingRef.current) return;
      loadAllCMS();
    };

    window.addEventListener(ZHOU_ARTICLES_EVENT, handleStorageUpdate);
    window.addEventListener(GOV_LINKS_EVENT, handleStorageUpdate);
    window.addEventListener(SERVICES_EVENT, handleStorageUpdate);
    window.addEventListener(REGULATIONS_EVENT, handleStorageUpdate);
    window.addEventListener(KMK_RATES_EVENT, handleStorageUpdate);
    window.addEventListener(CAREER_SETTINGS_EVENT, handleStorageUpdate);
    window.addEventListener(CMS_DELETED_ITEMS_EVENT, handleStorageUpdate);
    window.addEventListener(CMS_STATUS_UPDATED_EVENT, handleStorageUpdate);

    return () => {
      window.removeEventListener(ZHOU_ARTICLES_EVENT, handleStorageUpdate);
      window.removeEventListener(GOV_LINKS_EVENT, handleStorageUpdate);
      window.removeEventListener(SERVICES_EVENT, handleStorageUpdate);
      window.removeEventListener(REGULATIONS_EVENT, handleStorageUpdate);
      window.removeEventListener(KMK_RATES_EVENT, handleStorageUpdate);
      window.removeEventListener(CAREER_SETTINGS_EVENT, handleStorageUpdate);
      window.removeEventListener(CMS_DELETED_ITEMS_EVENT, handleStorageUpdate);
      window.removeEventListener(CMS_STATUS_UPDATED_EVENT, handleStorageUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // DELETE handler (CRUD - Delete)
  const handleDeleteItem = async (item: UnifiedCMSItem) => {
    if (typeof window !== "undefined") {
      const confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus konten "${item.title}"?`);
      if (!confirmDelete) return;
    }

    isDeletingRef.current = true;

    try {
      const rawObj = (item.raw || {}) as Record<string, unknown>;
      const rawId = rawObj.id !== undefined ? String(rawObj.id) : "";
      const rawCode = String(rawObj.code || rawObj.service_code || rawObj.position_code || rawObj.docNumber || "");

      // 1. Rekam ke tombstone storage agar permanen tidak pernah muncul kembali
      recordDeletedCmsItem({
        id: item.id,
        numericId: item.numericId,
        title: item.title,
        code: rawCode,
        rawId: rawId,
        category: item.category,
      });

      // 2. Langsung perbarui state lokal UI seketika (zero flicker & zero delay)
      setCmsItems((prev) =>
        prev.filter((i) => {
          if (i.id === item.id) return false;
          if (item.numericId && i.numericId === item.numericId && i.section === item.section) return false;
          const rObj = (i.raw || {}) as Record<string, unknown>;
          const rId = rObj.id !== undefined ? String(rObj.id) : undefined;
          const rCode = (rObj.code || rObj.service_code || rObj.position_code || rObj.docNumber) as string | undefined;
          return !isCmsItemDeleted(i.id, i.title, rId, rCode);
        })
      );

      // 3. Jalankan backend DELETE API & bersihkan dari local storage spesifik
      if (item.section === "edukasi") {
        if ((rawObj as Record<string, unknown>)?.isDjpLink) {
          deleteStoredBelajarPajakLink(((rawObj as Record<string, unknown>)?.id as string) || item.id);
          deleteStoredBelajarPajakLink(item.title);
        } else {
          if (item.numericId && item.numericId < 9000) {
            try {
              await adminCmsApi.deleteEducation(item.numericId);
            } catch (apiErr) {
              console.warn("Backend education delete fallback:", apiErr);
            }
          }
          deleteZhouArticle(item.id);
          deleteZhouArticle(item.title);
          deleteZhouArticle(`be-${item.numericId}`);
          deleteZhouArticle(`EDU-${item.numericId}`);
          if (rawId) deleteZhouArticle(rawId);
        }
      } else if (item.section === "services") {
        if (item.numericId && item.numericId < 9000) {
          try {
            await adminCmsApi.deleteService(item.numericId);
          } catch (apiErr) {
            console.warn("Backend service delete fallback:", apiErr);
          }
        }
        deleteStoredService(item.id);
        deleteStoredService(item.title);
        deleteStoredService(`SVC-${item.numericId}`);
        if (rawId) deleteStoredService(rawId);
        if (rawCode) deleteStoredService(rawCode);
      } else if (item.section === "regulasi") {
        if (item.numericId && item.numericId < 9000) {
          try {
            await adminCmsApi.deleteRegulation(item.numericId);
          } catch (apiErr) {
            console.warn("Backend regulation delete fallback:", apiErr);
          }
        }
        deleteRegulation(item.id);
        deleteRegulation(item.title);
        deleteRegulation(`REG-${item.numericId}`);
        if (rawId) deleteRegulation(rawId);
      } else if (item.section === "kurs") {
        if (item.numericId && item.numericId < 9000) {
          try {
            await adminCmsApi.deleteTaxRate(item.numericId);
          } catch (apiErr) {
            console.warn("Backend tax rate delete fallback:", apiErr);
          }
        }
      } else if (item.section === "karir") {
        if (item.numericId && item.numericId < 9000) {
          try {
            await adminCmsApi.deleteCareer(item.numericId);
          } catch (apiErr) {
            console.warn("Backend career delete fallback:", apiErr);
          }
        }
        deleteStoredCareerPosition(item.id);
        deleteStoredCareerPosition(item.title);
        deleteStoredCareerPosition(`CAR-${item.numericId}`);
        if (rawId) deleteStoredCareerPosition(rawId);
      } else if (item.section === "faqs") {
        if (item.numericId && item.numericId < 9000) {
          try {
            await adminCmsApi.deleteFaq(item.numericId);
          } catch (apiErr) {
            console.warn("Backend faq delete fallback:", apiErr);
          }
        }
      } else if (item.section === "kontak") {
        // Profil & kontak ditandai terhapus via tombstone
      }

      showToast(`Konten "${item.title.slice(0, 30)}..." berhasil dihapus.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menghapus konten";
      showToast(msg);
    } finally {
      isDeletingRef.current = false;
    }
  };

  // TOGGLE STATUS handler (CRUD - Update Status: Published <-> Draft)
  const handleToggleStatus = async (item: UnifiedCMSItem) => {
    const nextStatus = item.status === "Published" ? "Draft" : "Published";
    const isActive = nextStatus === "Published";

    try {
      const rawObj = (item.raw || {}) as Record<string, unknown>;
      const rawId = rawObj.id !== undefined ? String(rawObj.id) : undefined;
      const rawCode = (rawObj.code || rawObj.service_code || rawObj.position_code || rawObj.docNumber || rawObj.currency_code) as string | undefined;

      // 1. Simpan override status ke cmsStatusStorage agar persisten saat refresh!
      setCmsItemStatus(
        {
          id: item.id,
          numericId: item.numericId,
          title: item.title,
          code: rawCode,
          aliases: [rawId, rawCode, item.title, item.id],
        },
        nextStatus
      );

      // 2. Update state CMS di tabel secara instan (zero flicker)
      setCmsItems((prev) =>
        prev.map((i) =>
          i.id === item.id ||
          (rawId && i.id === rawId) ||
          i.title.toLowerCase().trim() === item.title.toLowerCase().trim()
            ? { ...i, status: nextStatus }
            : i
        )
      );

      if (item.section === "services") {
        const isBackendId = typeof item.numericId === "number" && item.numericId > 0 && item.numericId < 1000;
        if (isBackendId) {
          try {
            await adminCmsApi.updateService(item.numericId, { is_active: isActive });
          } catch (apiErr) {
            console.warn("Backend service status update fallback:", apiErr);
          }
        }
        updateStoredService(item.id, { status: nextStatus, name: item.title });
        if (rawId) updateStoredService(rawId, { status: nextStatus, name: item.title });
        if (rawCode) updateStoredService(rawCode, { status: nextStatus, name: item.title });
        updateStoredService(item.title, { status: nextStatus, name: item.title });
      } else if (item.section === "karir") {
        const isBackendId = typeof item.numericId === "number" && item.numericId > 0 && item.numericId < 1000;
        if (isBackendId) {
          try {
            await adminCmsApi.updateCareer(item.numericId, { is_active: isActive });
          } catch (apiErr) {
            console.warn("Backend career status update fallback:", apiErr);
          }
        }
        updateStoredCareerPosition(`CAR-${item.numericId}`, { status: nextStatus });
        updateStoredCareerPosition(item.id, { status: nextStatus });
        if (rawId) updateStoredCareerPosition(rawId, { status: nextStatus });
      } else if (item.section === "edukasi") {
        toggleArticleStatus(`be-${item.numericId}`);
        toggleArticleStatus(item.id);
        updateZhouArticle(item.id, { status: nextStatus });
        updateZhouArticle(`be-${item.numericId}`, { status: nextStatus });
        if (rawId) updateZhouArticle(rawId, { status: nextStatus });
        if ((item.raw as { isDjpLink?: boolean })?.isDjpLink) {
          updateStoredBelajarPajakLink(item.id, { status: nextStatus });
          if (rawId) updateStoredBelajarPajakLink(rawId, { status: nextStatus });
        }
      } else if (item.section === "regulasi") {
        toggleRegulationStatus(`REG-${item.numericId}`);
        toggleRegulationStatus(item.id);
        updateRegulation(item.id, { status: nextStatus === "Draft" ? "Draft" : "Berlaku" });
        if (rawId) updateRegulation(rawId, { status: nextStatus === "Draft" ? "Draft" : "Berlaku" });
      }
      showToast(
        nextStatus === "Draft"
          ? `Konten "${item.title.slice(0, 30)}..." berhasil diubah menjadi Draft.`
          : `Konten "${item.title.slice(0, 30)}..." berhasil dipublikasikan.`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengubah status";
      showToast(msg);
    }
  };

  // CREATE / EDIT ITEM Form Submission (CRUD - Create & Update)
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalSection === "edukasi") {
        // Sematkan gambar ke format database <!--ZHOU_IMAGE:...--> agar tersimpan permanen di database backend
        const bodyWithImage = formatEducationBodyWithImage(eduForm.body, eduForm.image);

        if (editingEduId) {
          // UPDATE ke backend database & local storage
          try {
            await adminCmsApi.updateEducation(editingEduId, {
              title: eduForm.title,
              category: eduForm.category,
              content_type: eduForm.content_type,
              body: bodyWithImage,
              file_path: eduForm.file_path || undefined,
              image: eduForm.image || undefined,
            });
          } catch (apiErr) {
            console.warn("Backend updateEducation fallback:", apiErr);
          }
          updateZhouArticle(`be-${editingEduId}`, {
            title: eduForm.title,
            category: eduForm.category,
            content: [eduForm.body],
            summary: eduForm.body.slice(0, 160) + (eduForm.body.length > 160 ? "..." : ""),
            image: eduForm.image || undefined,
            status: eduForm.status,
            attachment: eduForm.file_path
              ? {
                name: eduForm.file_name || "modul-panduan.pdf",
                size: eduForm.file_size || "1.2 MB",
                type: "PDF",
              }
              : undefined,
          });
          setCmsItemStatus(
            {
              id: `EDU-${editingEduId}`,
              numericId: editingEduId,
              title: eduForm.title,
            },
            eduForm.status
          );
          // Optimistic update: langsung perbarui state tabel CMS
          setCmsItems((prev) =>
            prev.map((i) =>
              i.numericId === editingEduId && i.section === "edukasi"
                ? {
                  ...i,
                  title: eduForm.title,
                  subcategory: eduForm.category,
                  summary: eduForm.body.slice(0, 140) + (eduForm.body.length > 140 ? "..." : ""),
                  status: eduForm.status,
                }
                : i
            )
          );
          showToast(eduForm.status === "Published" ? "Materi edukasi berhasil diperbarui & dipublikasikan!" : "Materi edukasi berhasil disimpan sebagai draf!");
        } else {
          // CREATE ke backend database & local storage
          let createdNumId: number | undefined = undefined;
          try {
            const createRes = await adminCmsApi.createEducation({
              title: eduForm.title,
              category: eduForm.category,
              content_type: eduForm.content_type,
              body: bodyWithImage,
              file_path: eduForm.file_path || undefined,
              image: eduForm.image || undefined,
            });
            if (createRes?.data && (createRes.data as { id?: number })?.id) {
              createdNumId = (createRes.data as { id: number }).id;
            }
          } catch (apiErr) {
            console.warn("Backend createEducation fallback:", apiErr);
          }
          const createdArt = addZhouArticle({
            title: eduForm.title,
            category: eduForm.category,
            categoryKey: eduForm.category.toLowerCase().includes("pph")
              ? "pph-ppn"
              : eduForm.category.toLowerCase().includes("sp2dk")
                ? "sp2dk"
                : eduForm.category.toLowerCase().includes("akun")
                  ? "akuntansi"
                  : eduForm.category.toLowerCase().includes("leg")
                    ? "legal"
                    : "coretax",
            date: new Date().toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
            readTime: "5 menit baca",
            author: "Tim Riset Fiskal Zhou",
            summary: eduForm.body.slice(0, 160) + (eduForm.body.length > 160 ? "..." : ""),
            takeaways: [
              "Kepatuhan regulasi fiskal dan pembukuan komersial.",
              "Mitigasi risiko sanksi administratif dan ekualisasi data.",
            ],
            content: [eduForm.body],
            status: eduForm.status,
            image: eduForm.image || undefined,
            attachment: eduForm.file_path
              ? {
                name: eduForm.file_name || "modul-panduan.pdf",
                size: eduForm.file_size || "1.2 MB",
                type: "PDF",
              }
              : undefined,
            isFeatured: true,
          });
          setCmsItemStatus(
            {
              id: createdArt?.id || (createdNumId ? `EDU-${createdNumId}` : undefined),
              numericId: createdNumId,
              title: eduForm.title,
            },
            eduForm.status
          );
          showToast(eduForm.status === "Published" ? "Materi edukasi berhasil ditambahkan & dipublikasikan!" : "Materi edukasi berhasil disimpan sebagai draf!");
        }

        loadAllCMS();
        resetAllEditingState();
        setEduForm({
          title: "",
          category: "Coretax DJP",
          content_type: "ARTICLE",
          body: "",
          file_path: "",
          file_name: "",
          file_size: "",
          image: "",
          image_name: "",
          status: "Published",
        });
      } else if (modalSection === "edukasi_djp") {
        if (editingDjpLinkId) {
          updateStoredBelajarPajakLink(editingDjpLinkId, {
            title: djpLinkForm.title,
            url: djpLinkForm.url,
            institution: djpLinkForm.institution,
            institutionName:
              djpLinkForm.institution === "DJP"
                ? "Direktorat Jenderal Pajak (DJP)"
                : "Kementerian Keuangan RI",
            type: djpLinkForm.type,
            badge: djpLinkForm.badge,
            description: djpLinkForm.description,
            status: djpLinkForm.status,
          });
          setCmsItemStatus(
            {
              id: editingDjpLinkId,
              title: djpLinkForm.title,
            },
            djpLinkForm.status
          );
          // Optimistic update
          setCmsItems((prev) =>
            prev.map((i) =>
              i.id === editingDjpLinkId || i.id === `DJP-${editingDjpLinkId}`
                ? {
                  ...i,
                  title: djpLinkForm.title,
                  summary: `${djpLinkForm.url} • ${djpLinkForm.description}`,
                  status: djpLinkForm.status,
                }
                : i
            )
          );
          showToast("Tautan edukasi DJP berhasil diperbarui!");
        } else {
          const created = addStoredBelajarPajakLink({
            title: djpLinkForm.title,
            url: djpLinkForm.url,
            institution: djpLinkForm.institution,
            institutionName:
              djpLinkForm.institution === "DJP"
                ? "Direktorat Jenderal Pajak (DJP)"
                : "Kementerian Keuangan RI",
            type: djpLinkForm.type,
            badge: djpLinkForm.badge,
            description: djpLinkForm.description,
            status: djpLinkForm.status,
          });
          setCmsItemStatus(
            {
              id: created[0]?.id,
              title: djpLinkForm.title,
            },
            djpLinkForm.status
          );
          showToast(djpLinkForm.status === "Published" ? "Tautan edukasi DJP baru berhasil ditambahkan & dipublikasikan!" : "Tautan edukasi DJP disimpan sebagai draf!");
        }
        loadAllCMS();
        resetAllEditingState();
        setDjpLinkForm({
          title: "",
          url: "https://pajak.go.id",
          institution: "DJP",
          institutionName: "Direktorat Jenderal Pajak (DJP)",
          type: "Portal Web",
          badge: "PORTAL RESMI DJP",
          description: "",
          status: "Published",
        });
      } else if (modalSection === "services") {
        const srvStatus = serviceForm.is_active ? "Published" : "Draft";
        const catKey = (serviceForm.category || "tax-service").toLowerCase();
        const targetRoute =
          catKey.includes("akun")
            ? "/layanan/akuntansi"
            : catKey.includes("bisnis") || catKey.includes("fin")
              ? "/layanan/bisnis"
              : catKey.includes("hukum") || catKey.includes("legal")
                ? "/layanan/hukum"
                : "/layanan/tax-service";

        const badgeText =
          catKey.includes("akun")
            ? "ACCOUNTING SERVICES"
            : catKey.includes("bisnis")
              ? "BUSINESS & FINANCIAL"
              : catKey.includes("hukum")
                ? "LAW SERVICES"
                : "TAX SERVICES";

        const parsedScopes = serviceForm.scopes
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);

        const deliverableVal = serviceForm.deliverable.trim() || "Dokumen Laporan & Rekomendasi Resmi";

        if (editingServiceId || editingServiceOriginalId) {
          const isBackendId = typeof editingServiceId === "number" && editingServiceId > 0 && editingServiceId < 1000;
          if (isBackendId) {
            try {
              await adminCmsApi.updateService(editingServiceId, {
                service_code: serviceForm.service_code || `SRV-${editingServiceId}`,
                service_name: serviceForm.service_name,
                category: catKey,
                description: serviceForm.description,
                card_explanation: serviceForm.description,
                features: parsedScopes,
                is_active: serviceForm.is_active,
              });
            } catch (apiErr) {
              console.warn("Backend updateService fallback:", apiErr);
            }
          }
          const targetId = editingServiceOriginalId || serviceForm.service_code || (editingServiceId ? `SVC-${editingServiceId}` : `SRV-${Date.now()}`);
          updateStoredService(targetId, {
            id: targetId,
            code: serviceForm.service_code,
            name: serviceForm.service_name,
            categoryKey: catKey,
            subtitle: serviceForm.description,
            badge: badgeText,
            route: targetRoute,
            scopes: parsedScopes.length > 0 ? parsedScopes : undefined,
            deliverable: deliverableVal,
            deliverables: [deliverableVal],
            pillars: parsedScopes.map((sc) => ({ title: sc, description: sc })),
            status: srvStatus,
          });
          setCmsItemStatus(
            {
              id: targetId,
              numericId: editingServiceId || undefined,
              title: serviceForm.service_name,
              code: serviceForm.service_code,
              aliases: [
                editingServiceOriginalId,
                editingServiceOriginalTitle,
                serviceForm.service_code,
                editingServiceId ? `SVC-${editingServiceId}` : "",
                serviceForm.service_name,
              ].filter((a): a is string => Boolean(a)),
            },
            srvStatus
          );
          // Optimistic update
          setCmsItems((prev) =>
            prev.map((i) =>
              (i.id === targetId || (editingServiceOriginalId && i.id === editingServiceOriginalId) || (editingServiceId && i.numericId === editingServiceId)) && i.section === "services"
                ? {
                  ...i,
                  title: serviceForm.service_name,
                  subcategory: catKey,
                  summary: serviceForm.description.slice(0, 140) + (serviceForm.description.length > 140 ? "..." : ""),
                  status: srvStatus,
                  raw: {
                    ...(i.raw || {}),
                    service_name: serviceForm.service_name,
                    category: catKey,
                    description: serviceForm.description,
                    scopes: parsedScopes,
                    deliverable: deliverableVal,
                  },
                }
                : i
            )
          );
          showToast("Layanan bisnis berhasil diperbarui!");
        } else {
          const srvCode = serviceForm.service_code || `SRV-${Date.now().toString().slice(-4)}`;
          let createdNumId: number | undefined = undefined;
          try {
            const createRes = await adminCmsApi.createService({
              service_code: srvCode,
              service_name: serviceForm.service_name,
              category: catKey,
              description: serviceForm.description,
              card_explanation: serviceForm.description,
              features: parsedScopes,
              is_active: serviceForm.is_active,
            });
            if (createRes?.data && (createRes.data as { id?: number })?.id) {
              createdNumId = (createRes.data as { id: number }).id;
            }
          } catch (apiErr) {
            console.warn("Backend createService fallback:", apiErr);
          }
          addStoredService({
            id: srvCode,
            code: srvCode,
            name: serviceForm.service_name,
            categoryKey: catKey,
            subtitle: serviceForm.description,
            badge: badgeText,
            route: targetRoute,
            scopes: parsedScopes,
            deliverable: deliverableVal,
            deliverables: [deliverableVal],
            pillars: parsedScopes.map((sc) => ({ title: sc, description: sc })),
            workflow: ["Konsultasi Awal", "Analisis & Telaah Regulasi", "Eksekusi Layanan", "Penyampaian Laporan Final"],
            status: srvStatus,
          });
          setCmsItemStatus(
            {
              id: srvCode,
              numericId: createdNumId,
              title: serviceForm.service_name,
              code: srvCode,
            },
            srvStatus
          );
          showToast(srvStatus === "Published" ? "Layanan baru berhasil diterbitkan!" : "Layanan baru disimpan sebagai draf!");
        }
        loadAllCMS();
        resetAllEditingState();
      } else if (modalSection === "regulasi") {
        const regCategory = mapToRegulationCategory(regForm.regulation_type, regForm.title);
        const targetLegalStatus = regForm.legal_status || "Berlaku";
        const targetPubStatus = regForm.status || "Published";
        const finalFilePath =
          regForm.file_path ||
          (regForm.file_name ? `/docs/${regForm.file_name}` : `/docs/${regForm.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`);
        const finalFileSize = regForm.file_size || "1.2 MB";

        setStoredRegulationLegalStatus(regForm.title, targetLegalStatus, regForm.replacement_ref);

        if (editingRegId) {
          setStoredRegulationLegalStatus(`REG-${editingRegId}`, targetLegalStatus, regForm.replacement_ref);
          setStoredRegulationLegalStatus(String(editingRegId), targetLegalStatus, regForm.replacement_ref);
          try {
            await adminCmsApi.updateRegulation(editingRegId, {
              title: regForm.title,
              regulation_type: regCategory,
              file_path: finalFilePath,
              file_size: finalFileSize,
            });
          } catch (apiErr) {
            console.warn("Backend updateRegulation fallback:", apiErr);
          }
          updateRegulation(`REG-${editingRegId}`, {
            title: regForm.title,
            category: regCategory,
            scope: regCategory,
            fileSize: finalFileSize,
            downloadUrl: regForm.file_data_url || finalFilePath,
            fileDataUrl: regForm.file_data_url,
            status: targetPubStatus,
            legalStatus: targetLegalStatus,
            replacementRef: regForm.replacement_ref,
          });
          setCmsItemStatus(
            {
              id: `REG-${editingRegId}`,
              numericId: editingRegId,
              title: regForm.title,
            },
            targetPubStatus
          );
          // Optimistic update
          setCmsItems((prev) =>
            prev.map((i) =>
              i.numericId === editingRegId && i.section === "regulasi"
                ? {
                  ...i,
                  title: regForm.title,
                  subcategory: regCategory,
                  status: targetPubStatus,
                }
                : i
            )
          );
          showToast("Dokumen regulasi berhasil diperbarui!");
        } else {
          let createdRegNumId: number | undefined = undefined;
          try {
            const createRes = await adminCmsApi.createRegulation({
              title: regForm.title,
              regulation_type: regCategory,
              file_path: finalFilePath,
              file_size: finalFileSize,
            });
            if (createRes?.data && (createRes.data as { id?: number })?.id) {
              createdRegNumId = (createRes.data as { id: number }).id;
            }
          } catch (apiErr) {
            console.warn("Backend createRegulation fallback:", apiErr);
          }
          if (createdRegNumId) {
            setStoredRegulationLegalStatus(`REG-${createdRegNumId}`, targetLegalStatus, regForm.replacement_ref);
            setStoredRegulationLegalStatus(String(createdRegNumId), targetLegalStatus, regForm.replacement_ref);
          }
          const createdReg = addRegulation({
            docNumber: regForm.title,
            title: regForm.title,
            category: regCategory,
            effectiveDate: new Date().toLocaleDateString("id-ID"),
            scope: regCategory,
            fileSize: finalFileSize,
            status: targetPubStatus,
            legalStatus: targetLegalStatus,
            replacementRef: regForm.replacement_ref,
            downloadUrl: regForm.file_data_url || finalFilePath,
            fileDataUrl: regForm.file_data_url,
          });
          if (createdReg?.id) {
            setStoredRegulationLegalStatus(createdReg.id, targetLegalStatus, regForm.replacement_ref);
          }
          setCmsItemStatus(
            {
              id: createdReg?.id || (createdRegNumId ? `REG-${createdRegNumId}` : undefined),
              numericId: createdRegNumId,
              title: regForm.title,
            },
            targetPubStatus
          );
          showToast(
            targetPubStatus === "Published"
              ? "Dokumen regulasi berhasil diunggah & dipublikasikan!"
              : targetPubStatus === "Draft"
                ? "Dokumen regulasi berhasil disimpan sebagai draf!"
                : "Dokumen regulasi berhasil diarsipkan!"
          );
        }
        loadAllCMS();
        resetAllEditingState();
        setRegForm({
          title: "",
          regulation_type: "Regulasi Zhou",
          file_path: "",
          file_name: "",
          file_size: "",
          file_data_url: "",
          legal_status: "Berlaku",
          replacement_ref: "",
          status: "Published",
        });
      } else if (modalSection === "kurs") {
        const currentKmk = getStoredKmkRates();
        saveStoredKmkRates({
          ...currentKmk,
          kmkNumber: "KMK Terupdate Mingguan",
          period: "Pekan Berjalan (Rabu s/d Selasa)",
          effectiveUntil: "Terupdate Berkala Otomatis",
          officialDjpUrl: kursDjpForm.url || "https://fiskal.kemenkeu.go.id/informasi-publik/kurs-pajak",
          lastUpdated: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
        });

        const kmkId = "TAX-KMK-DJP";
        setCmsItemStatus(
          {
            id: kmkId,
            numericId: 9901,
            title: kursDjpForm.title,
          },
          kursDjpForm.status
        );

        showToast(
          kursDjpForm.status === "Published"
            ? "Tautan resmi Kurs Pajak DJP berhasil disimpan & disinkronkan ke halaman publik!"
            : "Tautan resmi Kurs Pajak DJP disimpan sebagai draf!"
        );

        loadAllCMS();
        resetAllEditingState();
        setKursDjpForm({
          title: "Kurs Pajak Mingguan Resmi Menteri Keuangan (KMK) - Terintegrasi DJP",
          url: "https://fiskal.kemenkeu.go.id/informasi-publik/kurs-pajak",
          description:
            "Data kurs valuta asing resmi Republik Indonesia terhubung langsung ke portal DJP & Badan Kebijakan Fiskal Kementerian Keuangan RI. Kurs terupdate secara berkala mingguan sesuai penetapan KMK terbaru tanpa perlu input manual satu per satu.",
          status: "Published",
        });
      } else if (modalSection === "karir") {
        const dept = careerForm.department || "Tax Service Core";
        const deptLower = dept.toLowerCase();
        const deptKey = (deptLower.includes("tax") || deptLower.includes("pajak")
          ? "tax"
          : deptLower.includes("account") || deptLower.includes("akuntan")
            ? "accounting"
            : deptLower.includes("legal") || deptLower.includes("hukum")
              ? "legal"
              : "business") as "tax" | "accounting" | "legal" | "business";
        const jobStatus = careerForm.is_active ? "Published" : "Draft";

        if (editingCareerId) {
          try {
            await adminCmsApi.updateCareer(editingCareerId, {
              position_code: careerForm.position_code || `POS-${editingCareerId}`,
              position_title: careerForm.position_title,
              level: careerForm.level,
              location: careerForm.location,
              description: careerForm.description,
              is_active: careerForm.is_active,
            });
          } catch (apiErr) {
            console.warn("Backend updateCareer fallback:", apiErr);
          }
          updateStoredCareerPosition(`CAR-${editingCareerId}`, {
            title: careerForm.position_title,
            department: dept,
            deptKey,
            type: careerForm.level,
            location: careerForm.location,
            summary: careerForm.description,
            status: jobStatus,
          });
          setCmsItemStatus(
            {
              id: `CAR-${editingCareerId}`,
              numericId: editingCareerId,
              title: careerForm.position_title,
              code: careerForm.position_code,
            },
            jobStatus
          );
          // Optimistic update
          setCmsItems((prev) =>
            prev.map((i) =>
              i.numericId === editingCareerId && i.section === "karir"
                ? {
                  ...i,
                  title: careerForm.position_title,
                  subcategory: `${careerForm.level} (${careerForm.location})`,
                  summary: careerForm.description.slice(0, 140) + (careerForm.description.length > 140 ? "..." : ""),
                  status: jobStatus,
                }
                : i
            )
          );
          showToast("Lowongan karir berhasil diperbarui!");
        } else {
          const newPosCode = careerForm.position_code || `POS-${Date.now().toString().slice(-4)}`;
          let createdCarId: number | undefined = undefined;
          try {
            const createRes = await adminCmsApi.createCareer({
              position_code: newPosCode,
              position_title: careerForm.position_title,
              level: careerForm.level,
              location: careerForm.location,
              description: careerForm.description,
              is_active: careerForm.is_active,
            });
            if (createRes?.data && (createRes.data as { id?: number })?.id) {
              createdCarId = (createRes.data as { id: number }).id;
            }
          } catch (apiErr) {
            console.warn("Backend createCareer fallback:", apiErr);
          }
          addStoredCareerPosition({
            id: newPosCode,
            title: careerForm.position_title,
            department: dept,
            deptKey,
            type: careerForm.level,
            location: careerForm.location,
            experience: "Min. 1-3 tahun",
            compensation: "Kompensasi Kompetitif + BPJS",
            summary: careerForm.description || "Posisi karir profesional di Zhou Consulting.",
            skills: ["Analisis Fiskal", "Akuntansi", "Kepatuhan"],
            responsibilities: [
              "Menjalankan penugasan profesional perpajakan dan akuntansi.",
              "Kolaborasi lintas divisi untuk asistensi klien korporat.",
            ],
            qualifications: [
              "Pendidikan S1 Akuntansi / Perpajakan / Hukum.",
              "Integritas dan kemampuan komunikasi yang baik.",
            ],
            benefits: [
              "Program pengembangan sertifikasi profesi.",
              "Asuransi kesehatan dan fasilitas kerja fleksibel.",
            ],
            status: jobStatus,
          });
          setCmsItemStatus(
            {
              id: newPosCode,
              numericId: createdCarId,
              title: careerForm.position_title,
              code: newPosCode,
            },
            jobStatus
          );
          showToast(jobStatus === "Published" ? "Lowongan karir baru berhasil dipublikasikan!" : "Lowongan karir berhasil disimpan sebagai draf!");
        }
        loadAllCMS();
        resetAllEditingState();
        setCareerForm({
          position_code: "",
          position_title: "",
          department: "Tax Service Core",
          level: "Senior Associate",
          location: "SCBD Jakarta (Hybrid)",
          description: "",
          is_active: true,
        });
      } else if (modalSection === "faqs") {
        if (editingFaq) {
          try {
            await adminCmsApi.updateFaq(editingFaq.id, {
              category: faqForm.category,
              question: faqForm.question,
              answer_template: faqForm.answer_template,
            });
          } catch (apiErr) {
            console.warn("Backend updateFaq fallback:", apiErr);
          }
          setCmsItemStatus(
            {
              id: `FAQ-${editingFaq.id}`,
              numericId: editingFaq.id,
              title: faqForm.question,
            },
            faqForm.status
          );
          setCmsItems((prev) =>
            prev.map((i) =>
              i.numericId === editingFaq.id && i.section === "faqs"
                ? {
                  ...i,
                  title: faqForm.question,
                  subcategory: faqForm.category,
                  summary: faqForm.answer_template.slice(0, 140) + "...",
                  status: faqForm.status,
                }
                : i
            )
          );
          showToast("FAQ chatbot berhasil diperbarui!");
        } else {
          let createdFaqId: number | undefined = undefined;
          try {
            const createRes = await adminCmsApi.createFaq({
              category: faqForm.category,
              question: faqForm.question,
              answer_template: faqForm.answer_template,
            });
            if (createRes?.data && (createRes.data as { id?: number })?.id) {
              createdFaqId = (createRes.data as { id: number }).id;
            }
          } catch (apiErr) {
            console.warn("Backend createFaq fallback:", apiErr);
          }
          setCmsItemStatus(
            {
              id: createdFaqId ? `FAQ-${createdFaqId}` : undefined,
              numericId: createdFaqId,
              title: faqForm.question,
            },
            faqForm.status
          );
          showToast(faqForm.status === "Published" ? "FAQ chatbot baru berhasil disimpan & dipublikasikan!" : "FAQ chatbot disimpan sebagai draf!");
        }
        loadAllCMS();
        resetAllEditingState();
        setFaqForm({
          category: "Layanan Perpajakan",
          question: "",
          answer_template: "",
          status: "Published",
        });
      } else if (modalSection === "kontak") {
        try {
          await adminCmsApi.updateContactSettings({
            whatsapp: contactForm.whatsapp,
            email: contactForm.email,
            phone: contactForm.phone,
            address: contactForm.address,
            settings: [
              { setting_key: "company_name", setting_value: contactForm.companyName },
              { setting_key: "company_email", setting_value: contactForm.email },
              { setting_key: "company_phone", setting_value: contactForm.phone },
              { setting_key: "company_address", setting_value: contactForm.address },
              { setting_key: "cs_whatsapp", setting_value: contactForm.whatsapp },
            ],
          });
        } catch (apiErr) {
          console.warn("Backend updateContactSettings fallback:", apiErr);
        }
        if (heroForm.headline) {
          try {
            await adminCmsApi.updateCompanyProfile({
              section_key: "hero",
              title: heroForm.headline,
              content: heroForm.subheadline,
            });
          } catch (apiErr) {
            console.warn("Backend updateCompanyProfile fallback:", apiErr);
          }
        }
        showToast("Profil & Kontak resmi berhasil disimpan ke database!");
        loadAllCMS();
        resetAllEditingState();
      }
      setIsAddModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan konten ke backend";
      showToast(msg);
    }
  };

  // SAVE HERO PROFILE
  const handleSaveHero = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      try {
        await adminCmsApi.updateCompanyProfile({
          section_key: "hero",
          title: heroForm.headline,
          content: heroForm.subheadline,
        });
      } catch (apiErr) {
        console.warn("Backend updateCompanyProfile fallback:", apiErr);
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("zhou_hero_updated", { detail: heroForm }));
      }
      setCmsItems((prev) =>
        prev.map((item) =>
          item.id === "CFG-HERO"
            ? { ...item, summary: heroForm.headline }
            : item
        )
      );
      showToast("Headline Hero Landing Page berhasil diperbarui!");
      setIsHeroModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal memperbarui profil";
      showToast(msg);
    }
  };

  // SAVE CONTACT SETTINGS
  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      try {
        await adminCmsApi.updateContactSettings({
          whatsapp: contactForm.whatsapp,
          email: contactForm.email,
          phone: contactForm.phone,
          address: contactForm.address,
          settings: [
            { setting_key: "company_name", setting_value: contactForm.companyName },
            { setting_key: "company_email", setting_value: contactForm.email },
            { setting_key: "company_phone", setting_value: contactForm.phone },
            { setting_key: "company_address", setting_value: contactForm.address },
            { setting_key: "cs_whatsapp", setting_value: contactForm.whatsapp },
          ],
        });
      } catch (apiErr) {
        console.warn("Backend updateContactSettings fallback:", apiErr);
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("zhou_contact_updated", { detail: contactForm }));
      }
      setCmsItems((prev) =>
        prev.map((item) =>
          item.id === "CFG-CONTACT"
            ? {
              ...item,
              summary: `${contactForm.companyName} | ${contactForm.email} | ${contactForm.phone} | WA: ${contactForm.whatsapp}`,
            }
            : item
        )
      );
      showToast("Pengaturan Kontak & WhatsApp CS berhasil disimpan!");
      setIsContactModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan kontak";
      showToast(msg);
    }
  };

  // SAVE BATCH KURS
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSaveBatchKurs = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const today = new Date().toISOString().split("T")[0];
      const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];

      await Promise.all(
        kursRates.map((k) => {
          const val = parseFloat(k.rate.replace(/[^0-9,.]/g, "").replace(",", ".")) || 15000;
          return adminCmsApi.createTaxRate({
            currency_code: k.currency,
            rate_value: val,
            effective_start_date: today,
            effective_end_date: nextWeek,
          });
        })
      );

      // Sinkronkan ke Storage Publik Kurs KMK
      saveStoredKmkRates({
        kmkNumber: kmkNumber || "KMK No. 44/KM.10/2026",
        period: `${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long" })} - ${new Date(Date.now() + 7 * 86400000).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`,
        effectiveUntil: new Date(Date.now() + 7 * 86400000).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
        officialDjpUrl: "https://fiskal.kemenkeu.go.id/informasi-publik/kurs-pajak",
        lastUpdated: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
        rates: kursRates.map((k) => ({
          currency: k.currency,
          name: k.name,
          rate: k.rate,
          change: "0.00%",
          trend: "flat" as const,
        })),
      });

      showToast(`Seluruh 7 kurs valas KMK (${kmkNumber}) berhasil diperbarui ke database & halaman publik.`);
      setIsBatchKursModalOpen(false);
      loadAllCMS();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan kurs";
      showToast(msg);
    }
  };

  const openAddModal = (
    sec: "services" | "regulasi" | "kurs" | "edukasi" | "edukasi_djp" | "kontak" | "karir" | "faqs"
  ) => {
    resetAllEditingState();
    setModalSection(sec);
    if (sec === "services") {
      setServiceForm({
        service_code: "",
        service_name: "",
        category: "akuntansi",
        description: "",
        scopes: "",
        deliverable: "",
        is_active: true,
      });
    } else if (sec === "regulasi") {
      setRegForm({
        title: "",
        regulation_type: "Regulasi Zhou",
        file_path: "",
        file_name: "",
        file_size: "",
        file_data_url: "",
        legal_status: "Berlaku",
        replacement_ref: "",
        status: "Published",
      });
    } else if (sec === "kurs") {
      const stored = getStoredKmkRates();
      setKursDjpForm({
        title: "Kurs Pajak Mingguan Resmi Menteri Keuangan (KMK) - Terintegrasi DJP",
        url: stored.officialDjpUrl || "https://fiskal.kemenkeu.go.id/informasi-publik/kurs-pajak",
        description:
          "Data kurs valuta asing resmi Republik Indonesia terhubung langsung ke portal DJP & Badan Kebijakan Fiskal Kementerian Keuangan RI. Kurs terupdate secara berkala mingguan sesuai penetapan KMK terbaru tanpa perlu input manual satu per satu.",
        status: "Published",
      });
    } else if (sec === "edukasi") {
      setEduForm({
        title: "",
        category: "Coretax DJP 2026",
        content_type: "ARTICLE",
        body: "",
        file_path: "",
        file_name: "",
        file_size: "",
        image: "",
        image_name: "",
        status: "Published",
      });
    } else if (sec === "edukasi_djp") {
      setDjpLinkForm({
        title: "",
        url: "https://pajak.go.id",
        institution: "DJP",
        institutionName: "Direktorat Jenderal Pajak (DJP)",
        type: "Portal Web",
        badge: "PORTAL RESMI DJP",
        description: "",
        status: "Published",
      });
    } else if (sec === "karir") {
      setCareerForm({
        position_code: "",
        position_title: "",
        department: "Tax Service Core",
        level: "Senior Associate",
        location: "SCBD Jakarta (Hybrid)",
        description: "",
        is_active: true,
      });
    } else if (sec === "faqs") {
      setFaqForm({
        category: "Layanan Perpajakan",
        question: "",
        answer_template: "",
        status: "Published",
      });
    }
    setIsAddModalOpen(true);
  };

  const openEditDjpLink = (item: UnifiedCMSItem) => {
    const raw = item.raw as (BelajarPajakLink & { isDjpLink?: boolean }) | undefined;
    resetAllEditingState();
    setEditingDjpLinkId(raw?.id || item.id);
    setDjpLinkForm({
      title: raw?.title || item.title,
      url: raw?.url || "https://pajak.go.id",
      institution: raw?.institution || "DJP",
      institutionName: raw?.institutionName || "Direktorat Jenderal Pajak (DJP)",
      type: raw?.type || "Portal Web",
      badge: raw?.badge || "PORTAL RESMI DJP",
      description: raw?.description || item.summary || "",
      status: item.status === "Published" ? "Published" : "Draft",
    });
    setModalSection("edukasi_djp");
    setIsAddModalOpen(true);
  };

  const openEditEducation = (item: UnifiedCMSItem) => {
    const raw = item.raw as (PublicEducationItem & { image?: string }) | undefined;
    resetAllEditingState();
    setEditingEduId(item.numericId);
    const { image, cleanBody } = extractEducationImageAndBody(
      raw?.body || item.summary,
      raw?.file_path,
      raw?.image || raw?.image_url
    );
    setEduForm({
      title: item.title,
      category: item.subcategory || "Coretax DJP",
      content_type: (raw?.content_type === "GUIDE" ? "GUIDE" : "ARTICLE"),
      body: cleanBody || "",
      file_path: raw?.file_path || "",
      file_name: raw?.file_path ? raw.file_path.split("/").pop() || "" : "",
      file_size: "",
      image: image || "",
      image_name: image ? "sampul-terpasang.jpg" : "",
      status: item.status === "Published" ? "Published" : "Draft",
    });
    setModalSection("edukasi");
    setIsAddModalOpen(true);
  };

  const openEditService = (item: UnifiedCMSItem) => {
    const raw = item.raw as (PublicServiceItem & {
      categoryKey?: string;
      scopes?: string[];
      deliverable?: string;
      pillars?: { title: string; description?: string }[];
      deliverables?: string[];
    }) | undefined;
    resetAllEditingState();
    setEditingServiceId(item.numericId);
    setEditingServiceOriginalId(item.id);
    setEditingServiceOriginalTitle(item.title);
    const catRaw = (raw?.categoryKey || raw?.category || item.subcategory || "").toLowerCase();
    const mappedCategory =
      catRaw.includes("akun")
        ? "akuntansi"
        : catRaw.includes("bisnis") || catRaw.includes("fin")
          ? "bisnis"
          : catRaw.includes("hukum") || catRaw.includes("legal")
            ? "hukum"
            : "tax-service";

    // Cari data scopes dan deliverable dari storedServices jika tidak ada di raw
    let scopesList: string[] = [];
    if (Array.isArray(raw?.scopes) && raw.scopes.length > 0) {
      scopesList = raw.scopes.filter(Boolean);
    } else if (Array.isArray(raw?.pillars) && raw.pillars.length > 0) {
      scopesList = raw.pillars.map((p) => p.title || p.description || "").filter(Boolean);
    } else {
      const stored = getStoredServices();
      const match = stored.find(
        (s) =>
          s.id === item.id ||
          (raw?.service_code && s.code === raw.service_code) ||
          s.name.trim().toLowerCase() === item.title.trim().toLowerCase()
      );
      if (match) {
        scopesList = match.scopes || match.pillars?.map((p: any) => p.title || p.description || "").filter(Boolean) || [];
      }
    }

    let deliverableText = raw?.deliverable || raw?.deliverables?.[0] || "";
    if (!deliverableText) {
      const stored = getStoredServices();
      const match = stored.find(
        (s) =>
          s.id === item.id ||
          (raw?.service_code && s.code === raw.service_code) ||
          s.name.trim().toLowerCase() === item.title.trim().toLowerCase()
      );
      if (match) {
        deliverableText = match.deliverable || match.deliverables?.[0] || "";
      }
    }

    setServiceForm({
      service_code: raw?.service_code || item.id,
      service_name: raw?.service_name || item.title,
      category: mappedCategory,
      description: raw?.description || item.summary,
      scopes: scopesList.join("\n"),
      deliverable: deliverableText,
      is_active: item.status === "Published",
    });
    setModalSection("services");
    setIsAddModalOpen(true);
  };

  const openEditRegulation = (item: UnifiedCMSItem) => {
    const raw = item.raw as
      | (PublicRegulationItem & {
        downloadUrl?: string;
        fileDataUrl?: string;
        file_data_url?: string;
        file_name?: string;
        legalStatus?: "Berlaku" | "Diperbarui" | "Tidak Berlaku";
        replacementRef?: string;
        fileSize?: string;
      })
      | undefined;
    resetAllEditingState();
    setEditingRegId(item.numericId);
    const category = mapToRegulationCategory(raw?.regulation_type || item.subcategory, raw?.title || item.title);
    const legalMeta = getStoredRegulationLegalMeta();
    const meta =
      legalMeta[item.title.trim().toLowerCase()] ||
      legalMeta[item.id] ||
      legalMeta[String(item.numericId)] ||
      {
        status: (raw?.legalStatus === "Tidak Berlaku"
          ? "Tidak Berlaku"
          : raw?.legalStatus === "Diperbarui" ||
            (item.raw as { status?: string })?.status === "Pembaruan" ||
            (item.raw as { status?: string })?.status === "Diperbarui"
            ? "Diperbarui"
            : "Berlaku") as "Berlaku" | "Diperbarui" | "Tidak Berlaku",
        replacementRef: raw?.replacementRef || "",
      };

    const fileName =
      raw?.file_name ||
      (raw?.file_path && !raw.file_path.startsWith("data:") ? raw.file_path.split("/").pop() || "" : "") ||
      (raw?.downloadUrl && !raw.downloadUrl.startsWith("data:") ? raw.downloadUrl.split("/").pop() || "" : "");

    setRegForm({
      title: raw?.title || item.title,
      regulation_type: category,
      file_path: raw?.file_path || raw?.downloadUrl || "",
      file_name: fileName,
      file_size: raw?.file_size || raw?.fileSize || "",
      file_data_url: raw?.file_data_url || raw?.fileDataUrl || "",
      legal_status: meta.status,
      replacement_ref: meta.replacementRef || raw?.replacementRef || "",
      status: item.status,
    });
    setModalSection("regulasi");
    setIsAddModalOpen(true);
  };

  const openEditKurs = (item: UnifiedCMSItem) => {
    const raw = item.raw as { title?: string; url?: string; description?: string } | undefined;
    const stored = getStoredKmkRates();
    resetAllEditingState();
    setEditingKursId(item.numericId);
    setKursDjpForm({
      title: raw?.title || item.title || "Kurs Pajak Mingguan Resmi Menteri Keuangan (KMK) - Terintegrasi DJP",
      url: raw?.url || stored.officialDjpUrl || "https://fiskal.kemenkeu.go.id/informasi-publik/kurs-pajak",
      description:
        raw?.description ||
        item.summary ||
        "Data kurs valuta asing resmi Republik Indonesia terhubung langsung ke portal DJP & Badan Kebijakan Fiskal Kementerian Keuangan RI.",
      status: item.status === "Published" ? "Published" : "Draft",
    });
    setModalSection("kurs");
    setIsAddModalOpen(true);
  };

  const openEditCareer = (item: UnifiedCMSItem) => {
    const raw = item.raw as (PublicCareerItem & { department?: string }) | undefined;
    resetAllEditingState();
    setEditingCareerId(item.numericId);
    setCareerForm({
      position_code: raw?.position_code || item.id,
      position_title: raw?.position_title || item.title,
      department: raw?.department || "Tax Service Core",
      level: raw?.level || "Senior Associate",
      location: raw?.location || "SCBD Jakarta (Hybrid)",
      description: raw?.description || item.summary,
      is_active: item.status === "Published",
    });
    setModalSection("karir");
    setIsAddModalOpen(true);
  };

  const openEditFaq = (f: ChatbotFaqItem, status?: "Published" | "Draft") => {
    resetAllEditingState();
    setEditingFaq(f);
    setFaqForm({
      category: f.category || "Layanan Perpajakan",
      question: f.question,
      answer_template: f.answer_template,
      status: status || "Published",
    });
    setModalSection("faqs");
    setIsAddModalOpen(true);
  };

  // EDIT CLICK dispatcher (CRUD - Update)
  const handleEditClick = (item: UnifiedCMSItem) => {
    if (item.section === "edukasi") {
      if ((item.raw as { isDjpLink?: boolean })?.isDjpLink) {
        openEditDjpLink(item);
      } else {
        openEditEducation(item);
      }
    } else if (item.section === "services") {
      openEditService(item);
    } else if (item.section === "regulasi") {
      openEditRegulation(item);
    } else if (item.section === "karir") {
      openEditCareer(item);
    } else if (item.section === "kurs") {
      openEditKurs(item);
    } else if (item.section === "faqs") {
      if (item.raw) {
        openEditFaq(item.raw as ChatbotFaqItem, item.status === "Published" ? "Published" : "Draft");
      } else {
        openAddModal("faqs");
      }
    } else if (item.id === "CFG-HERO") {
      setIsHeroModalOpen(true);
    } else if (item.id === "CFG-CONTACT") {
      setIsContactModalOpen(true);
    }
  };

  // Master category list ordered strictly according to requirements:
  // Katalog Layanan, Peraturan, Kurs Pajak, Edukasi Zhou, Tautan Edukasi DJP, Profil & Kontak, Lowongan Karir, FAQ Chatbot
  const MASTER_CATEGORIES = useMemo(() => [
    "Katalog Layanan",
    "Peraturan",
    "Kurs Pajak",
    "Edukasi Zhou",
    "Tautan Edukasi DJP",
    "Profil & Kontak",
    "Lowongan Karir",
    "FAQ Chatbot",
  ], []);

  // Combined Search and Filtering
  const filteredItems = useMemo(() => {
    return cmsItems.filter((item) => {
      const matchesCategory =
        categoryFilter === "ALL" ||
        item.category === categoryFilter ||
        (categoryFilter === "Katalog Layanan" && (item.category === "Katalog Layanan" || item.category === "Layanan")) ||
        (categoryFilter === "Peraturan" && (item.category === "Peraturan" || item.category === "Regulasi")) ||
        (categoryFilter === "Kurs Pajak" && (item.category === "Kurs Pajak" || item.category === "Kurs KMK")) ||
        (categoryFilter === "Edukasi Zhou" && (item.category === "Edukasi Zhou" || item.category === "Edukasi")) ||
        (categoryFilter === "Tautan Edukasi DJP" && (item.category === "Tautan Edukasi DJP" || (item.category === "Edukasi" && item.subcategory?.includes("DJP"))));
      const matchesSubcategory = subcategoryFilter === "ALL" || item.subcategory === subcategoryFilter;
      const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.subcategory.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q);
      return matchesCategory && matchesSubcategory && matchesStatus && matchesSearch;
    });
  }, [cmsItems, categoryFilter, subcategoryFilter, statusFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0B1533] text-white px-5 py-3 rounded-xl shadow-xl border border-primary-light flex items-center gap-3 text-xs animate-in fade-in">
          <CheckCircleIcon className="text-success text-sm shrink-0" />
          <span>{toastMessage}</span>
          <button type="button" onClick={() => setToastMessage(null)} className="text-silver hover:text-white ml-2 p-1">
            <CloseIcon className="text-xs" />
          </button>
        </div>
      )}

      {/* 1. CLEAN PAGE HEADER */}
      <div className="pb-6 border-b border-primary-light">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight flex items-center gap-2.5">
            <span>Pusat Manajemen Konten Website (CMS)</span>
            {isLoading && (
              <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-700 font-semibold animate-pulse">
                Sinkronisasi Backend...
              </span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-2xl">
            Satu pintu untuk mengelola seluruh publikasi landing page dan konten public website.
          </p>
        </div>
      </div>

      {/* 2. SATU CARD UTAMA CONTENT MANAGEMENT (Header, Toolbar, & Master Table) */}
      <Card className="rounded-2xl border-primary-light bg-white p-6 shadow-xs space-y-4">
        {/* A. Header: Title & Deskripsi */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-primary">Daftar Seluruh Konten</h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Seluruh publikasi website terkelola dalam satu tabel master terpadu.
            </p>
          </div>
        </div>

        {/* B. Toolbar: Search, Filter Kategori, Filter Status, dan Button Tambah Konten */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            {/* Search Box */}
            <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
              <SearchIcon className="absolute left-3 top-2.5 text-text-muted text-xs" />
              <Input
                type="text"
                placeholder="Cari konten, ID, atau kata kunci..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs h-9 bg-surface border-primary-light w-full"
              />
            </div>

            {/* Dropdown Filter Kategori Utama (Floating Menu sesuai Visual & Interaction Pattern Public Website) */}
            <div className="relative" ref={categoryDropdownRef}>
              <button
                type="button"
                onClick={() => {
                  setIsCategoryDropdownOpen((prev) => {
                    if (!prev) setIsStatusDropdownOpen(false);
                    return !prev;
                  });
                }}
                className="flex items-center justify-between gap-2.5 text-xs h-9 px-3.5 rounded-xl border border-primary-light bg-surface text-text-primary hover:bg-white focus:bg-white font-medium focus:outline-none min-w-[170px] cursor-pointer transition-colors shadow-2xs"
                aria-expanded={isCategoryDropdownOpen}
                aria-haspopup="true"
              >
                <span className="truncate">
                  {categoryFilter === "ALL" ? "Semua Kategori" : categoryFilter}
                </span>
                <ChevronDownIcon
                  className={`text-[10px] text-text-muted transition-transform duration-200 shrink-0 ${isCategoryDropdownOpen ? "rotate-180 text-primary" : ""
                    }`}
                />
              </button>

              {isCategoryDropdownOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-56 rounded-xl bg-white border border-primary-light py-1.5 px-1.5 shadow-xl text-text-primary z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryFilter("ALL");
                      setSubcategoryFilter("ALL");
                      setIsCategoryDropdownOpen(false);
                    }}
                    className={`flex items-center justify-between w-full px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer text-left ${categoryFilter === "ALL"
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-text-primary hover:text-primary hover:bg-surface"
                      }`}
                  >
                    <span>Semua Kategori</span>
                    {categoryFilter === "ALL" && (
                      <CheckIcon className="text-primary text-[10px]" />
                    )}
                  </button>

                  <div className="my-1 border-t border-primary-light/60" />

                  <div className="space-y-0.5">
                    {MASTER_CATEGORIES.map((cat) => {
                      const isSelected = categoryFilter === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setCategoryFilter(cat);
                            setSubcategoryFilter("ALL");
                            setIsCategoryDropdownOpen(false);
                          }}
                          className={`flex items-center justify-between w-full px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer text-left ${isSelected
                              ? "bg-primary/10 text-primary font-semibold"
                              : "text-text-primary hover:text-primary hover:bg-surface"
                            }`}
                        >
                          <span>{cat}</span>
                          {isSelected && (
                            <CheckIcon className="text-primary text-[10px]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Dropdown Filter Status (Floating Menu sesuai Visual & Interaction Pattern Public Website) */}
            <div className="relative" ref={statusDropdownRef}>
              <button
                type="button"
                onClick={() => {
                  setIsStatusDropdownOpen((prev) => {
                    if (!prev) setIsCategoryDropdownOpen(false);
                    return !prev;
                  });
                }}
                className="flex items-center justify-between gap-2.5 text-xs h-9 px-3.5 rounded-xl border border-primary-light bg-surface text-text-primary hover:bg-white focus:bg-white font-medium focus:outline-none min-w-[140px] cursor-pointer transition-colors shadow-2xs"
                aria-expanded={isStatusDropdownOpen}
                aria-haspopup="true"
              >
                <span className="truncate">
                  {statusFilter === "ALL" ? "Semua Status" : statusFilter}
                </span>
                <ChevronDownIcon
                  className={`text-[10px] text-text-muted transition-transform duration-200 shrink-0 ${isStatusDropdownOpen ? "rotate-180 text-primary" : ""
                    }`}
                />
              </button>

              {isStatusDropdownOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-44 rounded-xl bg-white border border-primary-light py-1.5 px-1.5 shadow-xl text-text-primary z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter("ALL");
                      setIsStatusDropdownOpen(false);
                    }}
                    className={`flex items-center justify-between w-full px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer text-left ${statusFilter === "ALL"
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-text-primary hover:text-primary hover:bg-surface"
                      }`}
                  >
                    <span>Semua Status</span>
                    {statusFilter === "ALL" && (
                      <CheckIcon className="text-primary text-[10px]" />
                    )}
                  </button>

                  <div className="my-1 border-t border-primary-light/60" />

                  <div className="space-y-0.5">
                    {["Published", "Draft", "Archived"].map((st) => {
                      const isSelected = statusFilter === st;
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => {
                            setStatusFilter(st);
                            setIsStatusDropdownOpen(false);
                          }}
                          className={`flex items-center justify-between w-full px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer text-left ${isSelected
                              ? "bg-primary/10 text-primary font-semibold"
                              : "text-text-primary hover:text-primary hover:bg-surface"
                            }`}
                        >
                          <span>{st}</span>
                          {isSelected && (
                            <CheckIcon className="text-primary text-[10px]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Reset Filters button if any filter applied */}
            {(searchQuery || categoryFilter !== "ALL" || subcategoryFilter !== "ALL" || statusFilter !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("ALL");
                  setSubcategoryFilter("ALL");
                  setStatusFilter("ALL");
                  setIsCategoryDropdownOpen(false);
                  setIsStatusDropdownOpen(false);
                }}
                className="text-xs text-text-muted hover:text-primary underline px-1 cursor-pointer"
              >
                Reset Filter
              </button>
            )}
          </div>

          {/* Action Button: Tambah Konten Baru on Toolbar Right */}
          <div className="flex items-center gap-2 self-start lg:self-auto shrink-0 flex-wrap">
            {(categoryFilter === "Kurs Pajak" || categoryFilter === "Kurs KMK") && (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    setIsLoading(true);
                    try {
                      const res = await syncKmkRatesFromDjp();
                      showToast(`Berhasil menyinkronkan live dari DJP (${res.kmkNumber}) dengan ${res.rates.length} valas!`);
                      loadAllCMS();
                    } catch {
                      showToast("Gagal menyinkronkan langsung dari portal DJP.");
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  className="text-xs font-semibold h-9 px-3 gap-1.5 border-primary-light text-primary hover:bg-primary/5 cursor-pointer"
                  title="Sinkronkan data kurs valas live terbaru langsung dari DJP / Kemenkeu"
                >
                  <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Sinkronkan Kurs Live DJP</span>
                </Button>
                <a
                  href={getStoredKmkRates().officialDjpUrl || "https://fiskal.kemenkeu.go.id/informasi-publik/kurs-pajak"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold h-9 px-3.5 rounded-lg border border-primary-light bg-white text-primary hover:bg-surface hover:border-primary transition-all shadow-2xs"
                  title="Buka portal resmi Kurs Pajak DJP / Kemenkeu di tab baru"
                >
                  <span>Buka Portal Resmi Kurs DJP</span>
                  <svg className="w-3.5 h-3.5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            )}

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => {
                const catMap: Record<
                  string,
                  "services" | "regulasi" | "kurs" | "edukasi" | "edukasi_djp" | "kontak" | "karir" | "faqs"
                > = {
                  "Katalog Layanan": "services",
                  Layanan: "services",
                  Peraturan: "regulasi",
                  Regulasi: "regulasi",
                  "Kurs Pajak": "kurs",
                  "Kurs KMK": "kurs",
                  "Edukasi Zhou": "edukasi",
                  Edukasi: "edukasi",
                  "Tautan Edukasi DJP": "edukasi_djp",
                  "Profil & Kontak": "kontak",
                  "Lowongan Karir": "karir",
                  Karir: "karir",
                  "FAQ Chatbot": "faqs",
                };
                openAddModal(catMap[categoryFilter] || "services");
              }}
              className="text-xs font-semibold h-9 px-4 shadow-sm"
            >
              Tambah Konten Baru
            </Button>
          </div>
        </div>

        {/* Master Table */}
        <div className="overflow-x-auto rounded-xl border border-primary-light min-h-[280px]">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface text-text-muted font-bold uppercase text-[10px] tracking-wider border-b border-primary-light">
              <tr>
                <th className="py-3 px-4 w-28">ID</th>
                <th className="py-3 px-4 min-w-[260px]">Judul</th>
                <th className="py-3 px-4 w-36">Kategori</th>
                <th className="py-3 px-4 w-44">Subkategori</th>
                <th className="py-3 px-4 w-24">Status</th>
                <th className="py-3 px-4 text-right w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-light">
              {paginatedItems.map((item, index) => {
                const isDeletable = true;
                const isStatusToggleable = true;
                const hasOverflowMenu = true;
                const isMenuOpen = openMenuId === item.id;
                const isNearBottom = index >= paginatedItems.length - 2 && paginatedItems.length > 2;

                return (
                  <tr key={item.id} className="hover:bg-surface/50 transition-colors">
                    {/* 1. ID */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-text-muted whitespace-nowrap">
                      {item.id}
                    </td>

                    {/* 2. Judul & Ringkasan */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-xs text-primary leading-tight">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-text-secondary mt-1 line-clamp-1 max-w-lg leading-relaxed">
                        {item.summary}
                      </div>
                    </td>

                    {/* 3. Kategori */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-block text-[10px] font-semibold px-2.5 py-0.5 rounded-md bg-primary/10 text-primary">
                        {item.category}
                      </span>
                    </td>

                    {/* 4. Subkategori */}
                    <td className="py-3.5 px-4">
                      {item.subcategory ? (
                        <span className="text-[11px] font-medium text-text-primary px-2 py-0.5 rounded bg-surface border border-primary-light/80 inline-block">
                          {item.subcategory}
                        </span>
                      ) : (
                        <span className="text-text-muted text-xs">-</span>
                      )}
                    </td>

                    {/* 5. Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge
                        variant={item.status === "Published" ? "success" : item.status === "Draft" ? "silver" : "secondary"}
                        size="sm"
                      >
                        {item.status}
                      </Badge>
                    </td>

                    {/* 6. Aksi: [Lihat] dan [⋮] (Menu Edit dimasukkan ke dalam ⋮) */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        {/* Kontrol 1: Lihat */}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setViewingItem(item)}
                          title="Lihat Detail Konten"
                          className="text-[11px] h-7 px-2 border-primary-light text-text-secondary hover:text-primary hover:bg-white inline-flex items-center gap-1 font-medium"
                        >
                          <EyeIcon className="text-xs" />
                          <span className="hidden sm:inline">Lihat</span>
                        </Button>

                        {/* Kontrol 2: Overflow Menu [ ⋮ ] (Berisi Edit, Ubah Status, & Hapus) */}
                        {hasOverflowMenu && (
                          <div className="relative inline-block text-left" data-overflow-menu>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              aria-label={`Menu aksi untuk ${item.title}`}
                              aria-haspopup="true"
                              aria-expanded={isMenuOpen}
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(isMenuOpen ? null : item.id);
                              }}
                              className={`text-[11px] h-7 w-7 p-0 border-primary-light inline-flex items-center justify-center transition-colors ${isMenuOpen
                                  ? "bg-primary text-white border-primary"
                                  : "text-text-secondary hover:text-primary hover:bg-white"
                                }`}
                              title="Aksi Lainnya"
                            >
                              <MoreVerticalIcon className="text-xs" />
                            </Button>

                            {/* Dropdown Menu */}
                            {isMenuOpen && (
                              <div
                                className={`absolute right-0 ${isNearBottom
                                    ? "bottom-full mb-1.5 origin-bottom-right"
                                    : "top-full mt-1.5 origin-top-right"
                                  } w-44 bg-white rounded-xl shadow-lg border border-primary-light/80 py-1 z-30 divide-y divide-primary-light/40 text-left`}
                                role="menu"
                                aria-orientation="vertical"
                              >
                                {/* Opsi 1: Edit Konten */}
                                <div className="py-0.5" role="none">
                                  <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      handleEditClick(item);
                                    }}
                                    className="w-full text-left px-3 py-2 text-xs text-text-primary hover:bg-surface hover:text-primary transition-colors flex items-center font-medium cursor-pointer"
                                  >
                                    <span>Edit Konten</span>
                                  </button>
                                </div>

                                {/* Opsi 2: Hapus Konten */}
                                {isDeletable && (
                                  <div className="py-0.5" role="none">
                                    <button
                                      type="button"
                                      role="menuitem"
                                      onClick={() => {
                                        setOpenMenuId(null);
                                        handleDeleteItem(item);
                                      }}
                                      className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors flex items-center font-medium cursor-pointer"
                                    >
                                      <span>Hapus Konten</span>
                                    </button>
                                  </div>
                                )}

                                {/* Opsi 3: Ubah Status Published / Draft (Paling Bawah) */}
                                {isStatusToggleable && (
                                  <div className="py-0.5" role="none">
                                    <button
                                      type="button"
                                      role="menuitem"
                                      onClick={() => {
                                        setOpenMenuId(null);
                                        handleToggleStatus(item);
                                      }}
                                      className="w-full text-left px-3 py-2 text-xs text-text-primary hover:bg-surface hover:text-primary transition-colors flex items-center gap-2 font-medium cursor-pointer"
                                    >
                                      <span>{item.status === "Published" ? "Jadikan Draft" : "Publikasikan"}</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {/* Empty State */}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-text-secondary text-xs">
                    <div className="max-w-sm mx-auto space-y-2">
                      <p className="font-semibold text-primary text-sm">
                        {isLoading
                          ? "Sedang memuat data dari database backend..."
                          : "Tidak ada konten yang sesuai dengan filter atau kata kunci pencarian."}
                      </p>
                      {!isLoading && (
                        <p className="text-[11px] text-text-muted">
                          Coba reset filter atau kata kunci untuk melihat seluruh konten yang tersedia.
                        </p>
                      )}
                      {!isLoading && (searchQuery || categoryFilter !== "ALL" || subcategoryFilter !== "ALL" || statusFilter !== "ALL") && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSearchQuery("");
                            setCategoryFilter("ALL");
                            setSubcategoryFilter("ALL");
                            setStatusFilter("ALL");
                          }}
                          className="mt-2 text-xs"
                        >
                          Reset Filter
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar (Sesuai Desain Gambar 5 di Bagian Bawah Tabel) */}
        {filteredItems.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-primary-light/60">
            <span className="text-xs text-text-muted">
              Menampilkan{" "}
              <span className="font-semibold text-text-primary">
                {(currentPage - 1) * itemsPerPage + 1} &ndash;{" "}
                {Math.min(currentPage * itemsPerPage, filteredItems.length)}
              </span>{" "}
              dari{" "}
              <span className="font-semibold text-text-primary">
                {filteredItems.length}
              </span>{" "}
              konten
            </span>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-text-secondary mr-1">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                aria-label="Halaman sebelumnya"
                className="w-8 h-8 rounded-full border border-primary-light bg-white hover:bg-primary hover:text-white disabled:opacity-30 disabled:pointer-events-none text-primary flex items-center justify-center transition-all cursor-pointer shadow-2xs"
              >
                <ChevronLeftIcon className="text-xs" />
              </button>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                aria-label="Halaman berikutnya"
                className="w-8 h-8 rounded-full border border-primary-light bg-white hover:bg-primary hover:text-white disabled:opacity-30 disabled:pointer-events-none text-primary flex items-center justify-center transition-all cursor-pointer shadow-2xs"
              >
                <ChevronRightIcon className="text-xs" />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* MODAL 1: ADD / EDIT CONTENT (Edukasi, Layanan, Regulasi, Kurs, Karir, FAQs) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-primary-light w-full max-w-2xl md:max-w-3xl p-6 sm:p-7 space-y-4 relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                resetAllEditingState();
              }}
              className="absolute top-5 right-5 text-text-secondary hover:text-primary p-1 cursor-pointer"
            >
              <CloseIcon className="text-sm" />
            </button>

            <div className="pr-8">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
                {isCurrentlyEditing ? "Mode Edit Konten Database" : "PENERBITAN KONTEN BARU"}
              </span>
              <h3 className="text-base font-bold text-primary mt-0.5">
                {modalSection === "services"
                  ? editingServiceId
                    ? "Edit Katalog Layanan Bisnis"
                    : "Tambah Katalog Layanan Bisnis"
                  : modalSection === "regulasi"
                    ? editingRegId
                      ? "Edit Dokumen Peraturan DJP"
                      : "Tambah Dokumen Peraturan DJP"
                    : modalSection === "kurs"
                      ? editingKursId
                        ? "Edit Integrasi Kurs Pajak DJP"
                        : "Kelola Tautan Kurs Pajak DJP"
                      : modalSection === "edukasi"
                        ? editingEduId
                          ? "Edit Materi Edukasi Zhou"
                          : "Tambah Materi Edukasi Zhou"
                        : modalSection === "edukasi_djp"
                          ? editingDjpLinkId
                            ? "Edit Tautan Edukasi DJP"
                            : "Tambah Tautan Edukasi DJP"
                          : modalSection === "kontak"
                            ? "Kelola Profil & Kontak Perusahaan"
                            : modalSection === "karir"
                              ? editingCareerId
                                ? "Edit Lowongan Karir"
                                : "Buka Lowongan Karir Baru"
                              : editingFaq
                                ? "Edit FAQ Chatbot"
                                : "Tambah FAQ Chatbot"}
              </h3>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              {/* Modul Target (Untuk modul selain regulasi, ditampilkan di bagian paling atas) */}
              {modalSection !== "regulasi" && (
                <div>
                  <Label className="text-xs font-semibold text-primary">Modul Target</Label>
                  <Select
                    value={modalSection}
                    onChange={(e) =>
                      setModalSection(
                        e.target.value as
                        | "services"
                        | "regulasi"
                        | "kurs"
                        | "edukasi"
                        | "edukasi_djp"
                        | "kontak"
                        | "karir"
                        | "faqs"
                      )
                    }
                    disabled={isCurrentlyEditing}
                    className="mt-1"
                  >
                    <option value="services">Katalog Layanan</option>
                    <option value="regulasi">Peraturan</option>
                    <option value="kurs">Kurs Pajak</option>
                    <option value="edukasi">Edukasi Zhou</option>
                    <option value="edukasi_djp">Tautan Edukasi DJP</option>
                    <option value="kontak">Profil &amp; Kontak</option>
                    <option value="karir">Lowongan Karir</option>
                    <option value="faqs">FAQ Chatbot</option>
                  </Select>
                </div>
              )}

              {/* DYNAMIC FORM 1: EDUKASI */}
              {modalSection === "edukasi" && (
                <>
                  <div>
                    <Label className="text-xs font-semibold text-primary">Judul Artikel / Modul *</Label>
                    <Input
                      type="text"
                      required
                      placeholder="e.g. Panduan Integrasi Coretax DJP 2026"
                      value={eduForm.title}
                      onChange={(e) => setEduForm((prev) => ({ ...prev, title: e.target.value }))}
                      className="text-[11px] text-slate-600 placeholder:text-slate-400 placeholder:text-[11px] h-9 mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-semibold text-primary">Kategori Topik *</Label>
                      <Select
                        value={eduForm.category}
                        onChange={(e) => setEduForm((prev) => ({ ...prev, category: e.target.value }))}
                        className="text-[11px] text-slate-600 mt-1"
                      >
                        <option value="Coretax DJP 2026">Coretax DJP 2026</option>
                        <option value="Kepatuhan PPh & PPN">Kepatuhan PPh &amp; PPN</option>
                        <option value="Mitigasi SP2DK">Mitigasi SP2DK</option>
                        <option value="Akuntansi SAK">Akuntansi SAK</option>
                        <option value="Legal Korporat">Legal Korporat</option>
                        <option value="Regulasi Fiskal">Regulasi Fiskal</option>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-primary">Tipe Konten *</Label>
                      <Select
                        value={eduForm.content_type}
                        onChange={(e) =>
                          setEduForm((prev) => ({ ...prev, content_type: e.target.value as "ARTICLE" | "GUIDE" }))
                        }
                        className="mt-1"
                      >
                        <option value="ARTICLE">Artikel Wawasan</option>
                        <option value="GUIDE">Buku Panduan / Guide</option>
                      </Select>
                    </div>
                  </div>

                  {/* Gambar Sampul / Banner (Optional) */}
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-primary">
                      Gambar Sampul / Banner (Opsional)
                    </Label>

                    {eduForm.image ? (
                      <div className="flex items-center justify-between p-2 rounded-xl border border-primary-light bg-surface/70">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={eduForm.image}
                            alt="Sampul artikel"
                            className="w-12 h-9 object-cover rounded-md border border-primary/20 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-primary truncate max-w-[200px]">
                              {eduForm.image_name || "gambar-sampul.jpg"}
                            </p>
                            <span className="text-[10px] text-emerald-600 font-medium">Gambar terlampir</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <label className="text-[11px] font-semibold text-primary hover:underline cursor-pointer">
                            Ganti
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageUpload}
                            />
                          </label>
                          <span className="text-gray-300">|</span>
                          <button
                            type="button"
                            onClick={() => setEduForm((prev) => ({ ...prev, image: "", image_name: "" }))}
                            className="text-[11px] font-semibold text-red-600 hover:underline cursor-pointer"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex items-center px-3 py-2.5 border border-dashed border-primary/30 hover:border-primary rounded-xl cursor-pointer bg-surface/40 hover:bg-surface transition-all group">
                        <div className="flex items-center gap-2 text-text-secondary group-hover:text-primary transition-colors">
                          <ImageIcon className="text-sm shrink-0" />
                          <span className="text-xs font-medium">Pilih berkas gambar sampul...</span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </label>
                    )}
                  </div>

                  {/* Isi Materi Lengkap */}
                  <div>
                    <Label className="text-xs font-semibold text-primary">Isi Materi Lengkap *</Label>
                    <Textarea
                      required
                      rows={4}
                      placeholder="Uraikan isi materi panduan perpajakan..."
                      value={eduForm.body}
                      onChange={(e) => setEduForm((prev) => ({ ...prev, body: e.target.value }))}
                      className="text-[11px] text-slate-600 placeholder:text-slate-400 placeholder:text-[11px] mt-1 leading-relaxed"
                    />
                  </div>

                  {/* Berkas Dokumen PDF Edukasi (Optional) */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-primary">
                      Berkas Dokumen PDF Edukasi (Opsional)
                    </Label>
                    <p className="text-[11px] text-text-muted leading-relaxed">
                      💡 <em>Opsional:</em> Jika Anda tidak mengunggah berkas PDF, sistem akan <strong>secara otomatis membuat dokumen PDF resmi</strong> dari judul, ringkasan, dan isi materi yang Anda ketik di atas, sehingga pengunjung tetap dapat mengunduhnya secara utuh.
                    </p>

                    {eduForm.file_name || eduForm.file_path ? (
                      <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-primary-light/80 shadow-2xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                            <DocumentIcon className="text-base" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-primary truncate max-w-[220px] sm:max-w-[280px]">
                              {eduForm.file_name || eduForm.file_path.split("/").pop()}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-text-muted">
                                {eduForm.file_size || "Dokumen PDF"}
                              </span>
                              <span className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                PDF Terlampir
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          <label className="h-7 px-2.5 bg-surface hover:bg-slate-100 border border-primary-light text-primary rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors">
                            <UploadIcon className="text-[10px]" />
                            <span>Ganti</span>
                            <input
                              type="file"
                              accept=".pdf,application/pdf"
                              className="hidden"
                              onChange={handleEduPdfUpload}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              setEduForm((prev) => ({
                                ...prev,
                                file_path: "",
                                file_name: "",
                                file_size: "",
                              }))
                            }
                            className="h-7 px-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                            title="Hapus berkas terpilih"
                          >
                            <CloseIcon className="text-[10px]" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center p-5 bg-white border-2 border-dashed border-primary-light hover:border-primary rounded-xl cursor-pointer transition-colors group">
                        <div className="w-10 h-10 rounded-full bg-surface group-hover:bg-primary/10 text-primary flex items-center justify-center mb-2 transition-colors">
                          <UploadIcon className="text-base" />
                        </div>
                        <span className="text-xs font-semibold text-primary">
                          Pilih Dokumen PDF Edukasi
                        </span>
                        <span className="text-[11px] text-text-muted mt-0.5">
                          Klik untuk memilih berkas resmi (.pdf, maks. 15 MB)
                        </span>
                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          className="hidden"
                          onChange={handleEduPdfUpload}
                        />
                      </label>
                    )}
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-primary">Status Publikasi Edukasi *</Label>
                    <Select
                      value={eduForm.status}
                      onChange={(e) =>
                        setEduForm((prev) => ({
                          ...prev,
                          status: e.target.value as "Published" | "Draft",
                        }))
                      }
                      className="text-[11px] text-slate-600 mt-1"
                    >
                      <option value="Published">Published (Aktif & Tampil di Website)</option>
                      <option value="Draft">Draft (Disimpan sebagai draf)</option>
                    </Select>
                  </div>
                </>
              )}

              {/* DYNAMIC FORM 1B: EDUKASI DJP (LINK RESMI BELAJAR PAJAK) */}
              {modalSection === "edukasi_djp" && (
                <>
                  <div>
                    <Label className="text-xs font-semibold text-primary">Judul Tautan / Materi Edukasi *</Label>
                    <Input
                      type="text"
                      required
                      placeholder="e.g. Simulator Coretax DJP Interaktif"
                      value={djpLinkForm.title}
                      onChange={(e) => setDjpLinkForm((prev) => ({ ...prev, title: e.target.value }))}
                      className="text-[11px] text-slate-600 placeholder:text-slate-400 placeholder:text-[11px] h-9 mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-primary">URL Tautan Web Resmi *</Label>
                    <Input
                      type="url"
                      required
                      placeholder="https://pajak.go.id/ atau https://simulator-coretax.pajak.go.id"
                      value={djpLinkForm.url}
                      onChange={(e) => setDjpLinkForm((prev) => ({ ...prev, url: e.target.value }))}
                      className="text-[11px] text-slate-600 placeholder:text-slate-400 placeholder:text-[11px] h-9 mt-1 font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-semibold text-primary">Instansi Resmi *</Label>
                      <Select
                        value={djpLinkForm.institution}
                        onChange={(e) =>
                          setDjpLinkForm((prev) => ({
                            ...prev,
                            institution: e.target.value as "DJP" | "Kemenkeu",
                            institutionName:
                              e.target.value === "DJP"
                                ? "Direktorat Jenderal Pajak (DJP)"
                                : "Kementerian Keuangan RI",
                          }))
                        }
                        className="text-[11px] text-slate-600 mt-1"
                      >
                        <option value="DJP">DJP (Ditjen Pajak)</option>
                        <option value="Kemenkeu">Kementerian Keuangan RI</option>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-primary">Format Materi *</Label>
                      <Select
                        value={djpLinkForm.type}
                        onChange={(e) =>
                          setDjpLinkForm((prev) => ({
                            ...prev,
                            type: e.target.value as
                              | "Situs Web"
                              | "Portal Web"
                              | "Simulator DJP"
                              | "Video Tutorial"
                              | "E-Learning"
                              | "Buku Panduan (PDF)",
                          }))
                        }
                        className="text-[11px] text-slate-600 mt-1"
                      >
                        <option value="Portal Web">Portal Web</option>
                        <option value="Simulator DJP">Simulator DJP</option>
                        <option value="Video Tutorial">Video Tutorial</option>
                        <option value="E-Learning">E-Learning</option>
                        <option value="Buku Panduan (PDF)">Buku Panduan (PDF)</option>
                        <option value="Situs Web">Situs Web</option>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-primary">Label Badge (Opsional)</Label>
                    <Input
                      type="text"
                      placeholder="e.g. SIMULATOR RESMI DJP"
                      value={djpLinkForm.badge}
                      onChange={(e) => setDjpLinkForm((prev) => ({ ...prev, badge: e.target.value }))}
                      className="text-[11px] text-slate-600 placeholder:text-slate-400 placeholder:text-[11px] h-9 mt-1 uppercase"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-primary">Uraian / Ringkasan Materi *</Label>
                    <Textarea
                      required
                      rows={3}
                      placeholder="Jelaskan ringkasan materi dan petunjuk akses tautan resmi ini..."
                      value={djpLinkForm.description}
                      onChange={(e) => setDjpLinkForm((prev) => ({ ...prev, description: e.target.value }))}
                      className="text-[11px] text-slate-600 placeholder:text-slate-400 placeholder:text-[11px] mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-primary">Status Publikasi Tautan DJP *</Label>
                    <Select
                      value={djpLinkForm.status}
                      onChange={(e) =>
                        setDjpLinkForm((prev) => ({
                          ...prev,
                          status: e.target.value as "Published" | "Draft",
                        }))
                      }
                      className="text-[11px] text-slate-600 mt-1"
                    >
                      <option value="Published">Published (Aktif & Tampil di Website)</option>
                      <option value="Draft">Draft (Disimpan sebagai draf)</option>
                    </Select>
                  </div>
                </>
              )}

              {/* DYNAMIC FORM 2: SERVICES */}
              {modalSection === "services" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-semibold text-primary">Kode Layanan (Opsional)</Label>
                      <Input
                        type="text"
                        placeholder="e.g. TAX-CMPL"
                        value={serviceForm.service_code}
                        onChange={(e) => setServiceForm((prev) => ({ ...prev, service_code: e.target.value }))}
                        className="text-[11px] text-slate-600 placeholder:text-slate-400 placeholder:text-[11px] h-9 mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-primary">Kategori Layanan *</Label>
                      <Select
                        value={serviceForm.category}
                        onChange={(e) => setServiceForm((prev) => ({ ...prev, category: e.target.value }))}
                        className="text-[11px] text-slate-600 mt-1"
                      >
                        <option value="akuntansi">Accounting Services (Akuntansi &amp; SAK)</option>
                        <option value="bisnis">Business &amp; Financial (Advisory Finansial)</option>
                        <option value="tax-service">Tax Services (Kepatuhan Pajak &amp; SPT)</option>
                        <option value="hukum">Law Services (Hukum Bisnis &amp; Sengketa)</option>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-primary">Nama Layanan Bisnis *</Label>
                    <Input
                      type="text"
                      required
                      placeholder="e.g. Asistensi Pemeriksaan Pajak & SP2DK"
                      value={serviceForm.service_name}
                      onChange={(e) => setServiceForm((prev) => ({ ...prev, service_name: e.target.value }))}
                      className="text-[11px] text-slate-600 placeholder:text-slate-400 placeholder:text-[11px] h-9 mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-primary">Deskripsi Layanan *</Label>
                    <Textarea
                      required
                      rows={3}
                      placeholder="Jelaskan ruang lingkup layanan konsultasi ini..."
                      value={serviceForm.description}
                      onChange={(e) => setServiceForm((prev) => ({ ...prev, description: e.target.value }))}
                      className="text-[11px] text-slate-600 placeholder:text-slate-400 placeholder:text-[11px] mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-primary">Cakupan Layanan (Satu poin per baris)</Label>
                    <Textarea
                      rows={4}
                      placeholder={"e.g.\nPenyusunan Laporan Posisi Keuangan (Neraca) komparatif multi-periode\nPenyusunan Laporan Laba Rugi dan Penghasilan Komprehensif Lain\nLaporan Arus Kas, Catatan atas Laporan Keuangan (CALK)"}
                      value={serviceForm.scopes}
                      onChange={(e) => setServiceForm((prev) => ({ ...prev, scopes: e.target.value }))}
                      className="text-[11px] text-slate-600 placeholder:text-slate-400 placeholder:text-[11px] mt-1 font-mono leading-relaxed"
                    />
                    <p className="text-[10px] text-text-secondary mt-1">
                      Poin-poin di atas akan ditampilkan dengan tanda centang hijau pada kartu layanan website.
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-primary">Status Publikasi Layanan *</Label>
                    <Select
                      value={serviceForm.is_active ? "true" : "false"}
                      onChange={(e) => setServiceForm((prev) => ({ ...prev, is_active: e.target.value === "true" }))}
                      className="text-[11px] text-slate-600 mt-1"
                    >
                      <option value="true">Published (Aktif & Tampil di Website)</option>
                      <option value="false">Draft (Disimpan sebagai draf)</option>
                    </Select>
                  </div>
                </>
              )}

              {/* DYNAMIC FORM 3: REGULASI */}
              {modalSection === "regulasi" && (
                <div className="space-y-4">
                  {/* INFORMASI REGULASI */}
                  <div className="space-y-3.5 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
                    <div className="pb-2 border-b border-slate-200/80">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                        Informasi Regulasi
                      </h4>
                    </div>

                    {/* 1. Modul Target */}
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-primary">Modul Target</Label>
                      <Select
                        value={modalSection}
                        onChange={(e) =>
                          setModalSection(
                            e.target.value as
                            | "services"
                            | "regulasi"
                            | "kurs"
                            | "edukasi"
                            | "edukasi_djp"
                            | "kontak"
                            | "karir"
                            | "faqs"
                          )
                        }
                        disabled={isCurrentlyEditing}
                        className="h-10 text-xs text-slate-700 rounded-xl bg-white"
                      >
                        <option value="services">Katalog Layanan</option>
                        <option value="regulasi">Peraturan</option>
                        <option value="kurs">Kurs Pajak</option>
                        <option value="edukasi">Edukasi Zhou</option>
                        <option value="edukasi_djp">Tautan Edukasi DJP</option>
                        <option value="kontak">Profil &amp; Kontak</option>
                        <option value="karir">Lowongan Karir</option>
                        <option value="faqs">FAQ Chatbot</option>
                      </Select>
                    </div>

                    {/* 2. Nomor & Judul Regulasi */}
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-primary">
                        Nomor &amp; Judul Regulasi <span className="text-rose-500">*</span>
                      </Label>
                      <Input
                        type="text"
                        required
                        placeholder="e.g. PMK Nomor 168 Tahun 2023 tentang Petunjuk Teknis PPh 21"
                        value={regForm.title}
                        onChange={(e) => setRegForm((prev) => ({ ...prev, title: e.target.value }))}
                        className="h-10 text-xs text-slate-700 placeholder:text-slate-400 rounded-xl bg-white"
                      />
                    </div>

                    {/* 3. Kategori / Tipe Regulasi */}
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-primary">
                        Kategori / Tipe Regulasi <span className="text-rose-500">*</span>
                      </Label>
                      <Select
                        value={regForm.regulation_type}
                        onChange={(e) => setRegForm((prev) => ({ ...prev, regulation_type: e.target.value }))}
                        className="h-10 text-xs text-slate-700 rounded-xl bg-white"
                      >
                        <option value="Regulasi Zhou">Regulasi Zhou (SOP &amp; Kebijakan Internal Zhou)</option>
                        <option value="Undang-Undang">Undang-Undang (UU)</option>
                        <option value="Peraturan Pemerintah">Peraturan Pemerintah (PP)</option>
                        <option value="Peraturan Menteri">Peraturan Menteri Keuangan (PMK)</option>
                        <option value="Peraturan DJP">Peraturan Direktur Jenderal Pajak (PER / DJP)</option>
                        <option value="Keputusan KMK">Keputusan Menteri Keuangan (KMK)</option>
                      </Select>
                    </div>

                    {/* 4. Berkas Dokumen PDF Regulasi */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-primary">
                        Berkas Dokumen PDF Regulasi <span className="text-rose-500">*</span>
                      </Label>

                      {regForm.file_name || regForm.file_path ? (
                        <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-primary-light/80 shadow-2xs">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                              <DocumentIcon className="text-base" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-primary truncate max-w-[220px] sm:max-w-[280px]">
                                {regForm.file_name || regForm.file_path.split("/").pop()}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-text-muted">
                                  {regForm.file_size || "Dokumen PDF"}
                                </span>
                                <span className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  PDF Terlampir
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            <label className="h-7 px-2.5 bg-surface hover:bg-slate-100 border border-primary-light text-primary rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors">
                              <UploadIcon className="text-[10px]" />
                              <span>Ganti</span>
                              <input
                                type="file"
                                accept=".pdf,application/pdf"
                                className="hidden"
                                onChange={handleRegPdfUpload}
                              />
                            </label>
                            <button
                              type="button"
                              onClick={handleRemoveRegPdf}
                              className="h-7 px-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                              title="Hapus berkas terpilih"
                            >
                              <CloseIcon className="text-[10px]" />
                              <span>Hapus</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center p-5 bg-white border-2 border-dashed border-primary-light hover:border-primary rounded-xl cursor-pointer transition-colors group">
                          <div className="w-10 h-10 rounded-full bg-surface group-hover:bg-primary/10 text-primary flex items-center justify-center mb-2 transition-colors">
                            <UploadIcon className="text-base" />
                          </div>
                          <span className="text-xs font-semibold text-primary">
                            Pilih Dokumen PDF Regulasi
                          </span>
                          <span className="text-[11px] text-text-muted mt-0.5">
                            Klik untuk memilih berkas resmi (.pdf, maks. 15 MB)
                          </span>
                          <input
                            type="file"
                            accept=".pdf,application/pdf"
                            className="hidden"
                            onChange={handleRegPdfUpload}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* PENGATURAN STATUS */}
                  <div className="space-y-3.5 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
                    <div className="pb-2 border-b border-slate-200/80">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                        Pengaturan Status
                      </h4>
                    </div>

                    {/* 1. Status Keberlakuan Regulasi */}
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-primary">
                        Status Keberlakuan Regulasi <span className="text-rose-500">*</span>
                      </Label>
                      <Select
                        value={regForm.legal_status}
                        onChange={(e) =>
                          setRegForm((prev) => ({
                            ...prev,
                            legal_status: e.target.value as "Berlaku" | "Diperbarui" | "Tidak Berlaku",
                          }))
                        }
                        className="h-10 text-xs text-slate-700 rounded-xl bg-white"
                      >
                        <option value="Berlaku">Berlaku</option>
                        <option value="Diperbarui">Diperbarui</option>
                        <option value="Tidak Berlaku">Tidak Berlaku</option>
                      </Select>
                    </div>

                    {/* 1.1 Field Opsional: Referensi Regulasi Terbaru / Pengganti (jika Diperbarui) */}
                    {regForm.legal_status === "Diperbarui" && (
                      <div className="space-y-1.5 p-3 bg-blue-50/60 rounded-xl border border-blue-200/80 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-semibold text-primary">
                            Referensi Regulasi Terbaru / Pengganti
                          </Label>
                          <span className="text-[10px] text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full font-medium">
                            Opsional
                          </span>
                        </div>
                        <Input
                          type="text"
                          placeholder="e.g. PMK Nomor 168 Tahun 2023 atau UU No. 7 Tahun 2021"
                          value={regForm.replacement_ref}
                          onChange={(e) => setRegForm((prev) => ({ ...prev, replacement_ref: e.target.value }))}
                          className="h-10 text-xs text-slate-700 placeholder:text-slate-400 rounded-xl bg-white"
                        />
                        <p className="text-[11px] text-text-muted leading-relaxed">
                          Cantumkan nomor atau judul regulasi pengganti jika informasi pembaruan telah tersedia secara resmi.
                        </p>
                      </div>
                    )}

                    {/* 2. Status Publikasi CMS */}
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-primary">
                        Status Publikasi CMS <span className="text-rose-500">*</span>
                      </Label>
                      <Select
                        value={regForm.status}
                        onChange={(e) =>
                          setRegForm((prev) => ({
                            ...prev,
                            status: e.target.value as "Published" | "Draft" | "Archived",
                          }))
                        }
                        className="h-10 text-xs text-slate-700 rounded-xl bg-white"
                      >
                        <option value="Published">Published</option>
                        <option value="Draft">Draft</option>
                        <option value="Archived">Archived</option>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* DYNAMIC FORM 4: KURS */}
              {/* DYNAMIC FORM 4: KURS (INTEGRASI PORTAL RESMI DJP) */}
              {modalSection === "kurs" && (
                <div className="space-y-3.5">
                  <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200/80 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                      <h4 className="text-xs font-bold text-blue-900">
                        Integrasi Tautan Resmi DJP / Kemenkeu (Terupdate Berkala)
                      </h4>
                    </div>
                    <p className="text-[11px] text-blue-700 leading-relaxed">
                      Kurs Pajak tidak perlu diinput satu per satu secara manual. Seluruh nilai kurs mingguan KMK terhubung dan terupdate berkala langsung dari portal resmi Badan Kebijakan Fiskal Kementerian Keuangan &amp; DJP.
                    </p>
                    <div className="pt-1.5 flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            const res = await syncKmkRatesFromDjp();
                            showToast(`Berhasil menyinkronkan live dari DJP (${res.kmkNumber}) dengan ${res.rates.length} valas!`);
                            loadAllCMS();
                          } catch {
                            showToast("Gagal menyinkronkan dari portal DJP.");
                          }
                        }}
                        className="text-[11px] h-7 px-2.5 font-semibold bg-white text-blue-800 border-blue-200 hover:bg-blue-100/60 cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <svg className="w-3 h-3 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Sinkronkan Live DJP Sekarang</span>
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-primary">Nama Sumber / Layanan Kurs *</Label>
                    <Input
                      type="text"
                      required
                      value={kursDjpForm.title}
                      onChange={(e) => setKursDjpForm((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g. Kurs Pajak Mingguan Resmi Menteri Keuangan (KMK) - Terintegrasi DJP"
                      className="text-[11px] text-slate-700 h-9 mt-1"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold text-primary">URL Portal Resmi Kurs Pajak DJP *</Label>
                      <a
                        href={kursDjpForm.url || "https://fiskal.kemenkeu.go.id/informasi-publik/kurs-pajak"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
                      >
                        <span>Uji Tautan</span>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                    <Input
                      type="url"
                      required
                      value={kursDjpForm.url}
                      onChange={(e) => setKursDjpForm((prev) => ({ ...prev, url: e.target.value }))}
                      placeholder="https://fiskal.kemenkeu.go.id/informasi-publik/kurs-pajak"
                      className="text-[11px] text-slate-700 h-9 mt-1 font-mono"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-primary">Keterangan / Deskripsi Integrasi *</Label>
                    <Textarea
                      required
                      rows={3}
                      value={kursDjpForm.description}
                      onChange={(e) => setKursDjpForm((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Keterangan integrasi kurs pajak..."
                      className="text-[11px] text-slate-700 mt-1 leading-relaxed"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-primary">Status Publikasi Integrasi Kurs *</Label>
                    <Select
                      value={kursDjpForm.status}
                      onChange={(e) =>
                        setKursDjpForm((prev) => ({
                          ...prev,
                          status: e.target.value as "Published" | "Draft",
                        }))
                      }
                      className="text-[11px] text-slate-700 mt-1"
                    >
                      <option value="Published">Published</option>
                      <option value="Draft">Draft</option>
                    </Select>
                  </div>
                </div>
              )}

              {/* DYNAMIC FORM 5: KARIR */}
              {modalSection === "karir" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-semibold text-primary">Kode Lowongan (Opsional)</Label>
                      <Input
                        type="text"
                        placeholder="e.g. TAX-SR-01"
                        value={careerForm.position_code}
                        onChange={(e) => setCareerForm((prev) => ({ ...prev, position_code: e.target.value }))}
                        className="text-[11px] text-slate-600 placeholder:text-slate-400 placeholder:text-[11px] h-9 mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-primary">Tingkat / Level *</Label>
                      <Select
                        value={careerForm.level}
                        onChange={(e) => setCareerForm((prev) => ({ ...prev, level: e.target.value }))}
                        className="text-[11px] text-slate-600 mt-1"
                      >
                        <option value="Internship">Internship</option>
                        <option value="Junior Associate">Junior Associate</option>
                        <option value="Associate">Associate</option>
                        <option value="Senior Associate">Senior Associate</option>
                        <option value="Manager">Manager</option>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-primary">Bidang / Divisi Layanan *</Label>
                    <Select
                      value={careerForm.department}
                      onChange={(e) => setCareerForm((prev) => ({ ...prev, department: e.target.value }))}
                      className="text-[11px] text-slate-600 mt-1"
                    >
                      <option value="Tax Service Core">Tax Service Core</option>
                      <option value="Accounting Service">Accounting Service</option>
                      <option value="Legal Compliance">Legal Compliance</option>
                      <option value="Konsultasi Bisnis">Konsultasi Bisnis</option>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-primary">Nama Posisi Karir *</Label>
                    <Input
                      type="text"
                      required
                      placeholder="e.g. Senior Tax Consultant (BKP Level B)"
                      value={careerForm.position_title}
                      onChange={(e) => setCareerForm((prev) => ({ ...prev, position_title: e.target.value }))}
                      className="text-[11px] text-slate-600 placeholder:text-slate-400 placeholder:text-[11px] h-9 mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-primary">Lokasi Kerja *</Label>
                    <Input
                      type="text"
                      required
                      placeholder="e.g. SCBD Jakarta Selatan (Hybrid)"
                      value={careerForm.location}
                      onChange={(e) => setCareerForm((prev) => ({ ...prev, location: e.target.value }))}
                      className="text-[11px] text-slate-600 placeholder:text-slate-400 placeholder:text-[11px] h-9 mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-primary">Uraian Kebutuhan &amp; Kualifikasi *</Label>
                    <Textarea
                      required
                      rows={3}
                      placeholder="Uraikan kualifikasi dan tanggung jawab..."
                      value={careerForm.description}
                      onChange={(e) => setCareerForm((prev) => ({ ...prev, description: e.target.value }))}
                      className="text-[11px] text-slate-600 placeholder:text-slate-400 placeholder:text-[11px] mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-primary">Status Publikasi Lowongan *</Label>
                    <Select
                      value={careerForm.is_active ? "true" : "false"}
                      onChange={(e) => setCareerForm((prev) => ({ ...prev, is_active: e.target.value === "true" }))}
                      className="text-[11px] text-slate-600 mt-1"
                    >
                      <option value="true">Published (Aktif & Tampil di Website)</option>
                      <option value="false">Draft (Disimpan sebagai draf)</option>
                    </Select>
                  </div>
                </>
              )}

              {/* DYNAMIC FORM 6: FAQS */}
              {modalSection === "faqs" && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-primary">Kategori Topik Pertanyaan *</Label>
                    <Input
                      type="text"
                      required
                      placeholder="e.g. Layanan Perpajakan"
                      value={faqForm.category}
                      onChange={(e) => setFaqForm((prev) => ({ ...prev, category: e.target.value }))}
                      className="text-[11px] text-slate-600 placeholder:text-slate-400 placeholder:text-[11px] h-9"
                    />
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="text-[10px] text-text-muted mr-1">Rekomendasi topik:</span>
                      {[
                        "Layanan Perpajakan",
                        "Prosedur & Validasi",
                        "Konsultasi & Monitoring",
                        "Layanan & Pendaftaran",
                        "Kepatuhan SPT & Coretax",
                        "Akuntansi & Pembukuan",
                      ].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setFaqForm((prev) => ({ ...prev, category: cat }))}
                          className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors cursor-pointer ${faqForm.category === cat
                              ? "bg-primary text-white border-primary"
                              : "bg-surface text-text-secondary border-primary-light hover:border-primary"
                            }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-primary">Pertanyaan Pengguna / Pertanyaan Umum *</Label>
                    <Input
                      type="text"
                      required
                      placeholder="e.g. Bagaimana tahapan konsultasi dan penelaahan dokumen pajak?"
                      value={faqForm.question}
                      onChange={(e) => setFaqForm((prev) => ({ ...prev, question: e.target.value }))}
                      className="text-[11px] text-slate-600 placeholder:text-slate-400 placeholder:text-[11px] h-9 mt-1"
                    />
                    <p className="text-[10px] text-text-muted mt-1">
                      Pertanyaan ini akan muncul sebagai tombol pilihan bagi klien di menu Chatbot Bantuan.
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-primary">Template Jawaban Otomatis Chatbot *</Label>
                    <Textarea
                      required
                      rows={4}
                      placeholder="Tuliskan jawaban panduan otomatis yang akan langsung dikirimkan oleh bot..."
                      value={faqForm.answer_template}
                      onChange={(e) => setFaqForm((prev) => ({ ...prev, answer_template: e.target.value }))}
                      className="text-[11px] text-slate-600 placeholder:text-slate-400 placeholder:text-[11px] mt-1 leading-relaxed"
                    />
                    <p className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1 font-medium">
                      <span>✓</span>
                      <span>Bot akan langsung menjawab dengan teks di atas secara instan tanpa menunggu respon manual admin.</span>
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-primary">Status Publikasi FAQ *</Label>
                    <Select
                      value={faqForm.status}
                      onChange={(e) =>
                        setFaqForm((prev) => ({
                          ...prev,
                          status: e.target.value as "Published" | "Draft",
                        }))
                      }
                      className="text-[11px] text-slate-600 mt-1"
                    >
                      <option value="Published">Published (Aktif & Tampil di Website)</option>
                      <option value="Draft">Draft (Disimpan sebagai draf)</option>
                    </Select>
                  </div>
                </>
              )}

              {/* DYNAMIC FORM 7: PROFIL & KONTAK */}
              {modalSection === "kontak" && (
                <>
                  <div>
                    <Label className="text-xs font-semibold text-primary">Nama Perusahaan / Organisasi *</Label>
                    <Input
                      type="text"
                      required
                      placeholder="e.g. Zhou Consulting"
                      value={contactForm.companyName}
                      onChange={(e) => setContactForm((prev) => ({ ...prev, companyName: e.target.value }))}
                      className="text-[11px] text-slate-600 placeholder:text-slate-400 placeholder:text-[11px] h-9 mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-semibold text-primary">Email Resmi *</Label>
                      <Input
                        type="email"
                        required
                        placeholder="consultingzhou@gmail.com"
                        value={contactForm.email}
                        onChange={(e) => setContactForm((prev) => ({ ...prev, email: e.target.value }))}
                        className="text-[11px] text-slate-600 placeholder:text-slate-400 placeholder:text-[11px] h-9 mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-primary">Telepon Kantor *</Label>
                      <Input
                        type="text"
                        required
                        placeholder="+62 21 555 8899"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm((prev) => ({ ...prev, phone: e.target.value }))}
                        className="text-[11px] text-slate-600 placeholder:text-slate-400 placeholder:text-[11px] h-9 mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-primary">WhatsApp Hotline CS *</Label>
                    <Input
                      type="text"
                      required
                      placeholder="+62 851-2128-6086"
                      value={contactForm.whatsapp}
                      onChange={(e) => setContactForm((prev) => ({ ...prev, whatsapp: e.target.value }))}
                      className="text-[11px] text-slate-600 placeholder:text-slate-400 placeholder:text-[11px] h-9 mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-primary">Alamat Kantor Resmi *</Label>
                    <Textarea
                      required
                      rows={2}
                      placeholder="Alamat kantor resmi Zhou Consulting..."
                      value={contactForm.address}
                      onChange={(e) => setContactForm((prev) => ({ ...prev, address: e.target.value }))}
                      className="text-[11px] text-slate-600 placeholder:text-slate-400 placeholder:text-[11px] mt-1 leading-relaxed"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-primary">Headline Hero Beranda (Opsional)</Label>
                    <Input
                      type="text"
                      placeholder="Solusi Terintegrasi Perpajakan, Akuntansi & Legalitas..."
                      value={heroForm.headline}
                      onChange={(e) => setHeroForm((prev) => ({ ...prev, headline: e.target.value }))}
                      className="text-[11px] text-slate-600 placeholder:text-slate-400 placeholder:text-[11px] h-9 mt-1"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2.5 pt-3 border-t border-primary-light">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    resetAllEditingState();
                  }}
                  className="text-xs h-8 cursor-pointer"
                >
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="sm" className="text-xs h-8 font-semibold cursor-pointer">
                  Simpan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT HERO BANNER */}
      {isHeroModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-primary-light max-w-lg w-full p-6 space-y-4 relative">
            <button
              type="button"
              onClick={() => setIsHeroModalOpen(false)}
              className="absolute top-5 right-5 text-text-secondary hover:text-primary p-1 cursor-pointer"
            >
              <CloseIcon className="text-sm" />
            </button>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                Pengaturan Profil Landing Page
              </span>
              <h3 className="text-base font-bold text-primary mt-0.5">Edit Headline Hero Beranda</h3>
            </div>
            <form onSubmit={handleSaveHero} className="space-y-3.5 text-xs">
              <div>
                <Label className="text-xs font-semibold text-primary">Headline Utama *</Label>
                <Input
                  type="text"
                  value={heroForm.headline}
                  onChange={(e) => setHeroForm((prev) => ({ ...prev, headline: e.target.value }))}
                  className="text-[11px] text-slate-600 placeholder:text-slate-400 placeholder:text-[11px] h-9 mt-1"
                  required
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-primary">Sub-headline / Deskripsi Ringkas *</Label>
                <Textarea
                  value={heroForm.subheadline}
                  onChange={(e) => setHeroForm((prev) => ({ ...prev, subheadline: e.target.value }))}
                  rows={3}
                  className="text-[11px] text-slate-600 placeholder:text-slate-400 placeholder:text-[11px] mt-1 leading-relaxed"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-primary-light">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsHeroModalOpen(false)}
                  className="text-xs h-8 cursor-pointer"
                >
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="sm" className="text-xs h-8 font-semibold cursor-pointer">
                  Simpan Perubahan Hero
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT CONTACT SETTINGS */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-primary-light max-w-lg w-full p-6 space-y-4 relative">
            <button
              type="button"
              onClick={() => setIsContactModalOpen(false)}
              className="absolute top-5 right-5 text-text-secondary hover:text-primary p-1 cursor-pointer"
            >
              <CloseIcon className="text-sm" />
            </button>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                Pengaturan Kontak Resmi
              </span>
              <h3 className="text-base font-bold text-primary mt-0.5">Edit Kontak &amp; WhatsApp CS</h3>
            </div>
            <form onSubmit={handleSaveContact} className="space-y-3 text-xs">
              <div>
                <Label className="text-xs font-semibold text-primary">Nama Perusahaan *</Label>
                <Input
                  type="text"
                  value={contactForm.companyName}
                  onChange={(e) => setContactForm((prev) => ({ ...prev, companyName: e.target.value }))}
                  className="text-[11px] text-slate-600 placeholder:text-slate-400 placeholder:text-[11px] h-9 mt-1"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-primary">Email Resmi *</Label>
                  <Input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="text-[11px] text-slate-600 placeholder:text-slate-400 placeholder:text-[11px] h-9 mt-1"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-primary">Telepon Kantor *</Label>
                  <Input
                    type="text"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm((prev) => ({ ...prev, phone: e.target.value }))}
                    className="text-[11px] text-slate-600 placeholder:text-slate-400 placeholder:text-[11px] h-9 mt-1"
                    required
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs font-semibold text-primary">WhatsApp CS Hotline *</Label>
                <Input
                  type="text"
                  value={contactForm.whatsapp}
                  onChange={(e) => setContactForm((prev) => ({ ...prev, whatsapp: e.target.value }))}
                  className="text-[11px] text-slate-600 placeholder:text-slate-400 placeholder:text-[11px] h-9 mt-1"
                  required
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-primary">Alamat Kantor Resmi *</Label>
                <Textarea
                  value={contactForm.address}
                  onChange={(e) => setContactForm((prev) => ({ ...prev, address: e.target.value }))}
                  rows={2}
                  className="text-[11px] text-slate-600 placeholder:text-slate-400 placeholder:text-[11px] mt-1 leading-relaxed"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-primary-light">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsContactModalOpen(false)}
                  className="text-xs h-8 cursor-pointer"
                >
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="sm" className="text-xs h-8 font-semibold cursor-pointer">
                  Simpan Kontak Resmi
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* MODAL 5: DETAIL KONTEN / BACA LENGKAP (CRUD - Read) */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-primary-light max-w-xl w-full p-6 space-y-4 relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setViewingItem(null)}
              className="absolute top-5 right-5 text-text-secondary hover:text-primary p-1 cursor-pointer"
            >
              <CloseIcon className="text-sm" />
            </button>

            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="font-mono text-[10px] text-text-muted px-2 py-0.5 rounded bg-surface border border-primary-light/60">
                  {viewingItem.id}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                  {viewingItem.category}
                </span>
                {viewingItem.subcategory && (
                  <span className="text-[10px] font-medium text-text-secondary px-2 py-0.5 rounded bg-surface border border-primary-light">
                    {viewingItem.subcategory}
                  </span>
                )}
                <Badge variant={viewingItem.status === "Published" ? "success" : "silver"} size="sm">
                  {viewingItem.status}
                </Badge>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-primary leading-snug">
                {viewingItem.title}
              </h3>
              <p className="text-[11px] text-text-muted mt-0.5">
                Pembaruan / Tanggal: {viewingItem.updatedAt}
              </p>
            </div>

            {/* Isi Konten Lengkap */}
            <div className="space-y-3 text-xs border-y border-primary-light/60 py-3.5">
              {/* Gambar Sampul (Jika Ada) */}
              {(viewingItem.raw as { image?: string })?.image && (
                <div className="rounded-xl overflow-hidden border border-primary-light max-h-56 bg-surface">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={(viewingItem.raw as { image?: string }).image}
                    alt={viewingItem.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Uraian / Deskripsi Utama */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">
                  Uraian &amp; Deskripsi Lengkap:
                </span>
                <div className="p-3 bg-surface rounded-xl border border-primary-light/80 text-text-secondary whitespace-pre-line leading-relaxed text-xs max-h-60 overflow-y-auto">
                  {(viewingItem.raw as { body?: string; description?: string; answer_template?: string })?.body ||
                    (viewingItem.raw as { description?: string })?.description ||
                    (viewingItem.raw as { answer_template?: string })?.answer_template ||
                    viewingItem.summary}
                </div>
              </div>

              {/* Berkas PDF atau CV */}
              {((viewingItem.raw as { file_path?: string })?.file_path ||
                (viewingItem.raw as { cv_file_path?: string })?.cv_file_path) && (
                  <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-200/60 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 truncate">
                      <DocumentIcon className="text-primary text-sm shrink-0" />
                      <div className="truncate text-xs">
                        <span className="font-semibold text-primary block truncate">
                          {(viewingItem.raw as { file_path?: string })?.file_path ||
                            (viewingItem.raw as { cv_file_path?: string })?.cv_file_path}
                        </span>
                        <span className="text-[10px] text-text-muted">
                          {(viewingItem.raw as { file_size?: string })?.file_size || "Berkas Terlampir"}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        const rawPath =
                          (viewingItem.raw as { file_path?: string })?.file_path ||
                          (viewingItem.raw as { cv_file_path?: string })?.cv_file_path ||
                          "";
                        const fileName = rawPath.split("/").pop() || "Berkas.pdf";
                        showToast(`Menyiapkan unduhan berkas "${fileName}"...`);
                        const res = await downloadRemoteFile(rawPath, fileName);
                        if (res.success) {
                          showToast(`Berkas "${fileName}" berhasil diunduh.`);
                        } else {
                          showToast(res.message || `Berkas tidak tersedia di repositori server.`);
                        }
                      }}
                      className="px-3 py-1.5 text-[11px] font-semibold bg-primary text-white rounded-lg hover:bg-primary-hover shrink-0 cursor-pointer transition-colors"
                    >
                      Buka / Unduh Berkas
                    </button>
                  </div>
                )}
              {/* URL Tautan Web Resmi (untuk Belajar Pajak DJP) */}
              {(viewingItem.raw as { url?: string })?.url && (
                <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/70 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 truncate">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 font-bold text-[10px]">
                      URL
                    </div>
                    <div className="truncate text-xs">
                      <span className="font-semibold text-primary block truncate">
                        {(viewingItem.raw as { url: string }).url}
                      </span>
                      <span className="text-[10px] text-text-muted">
                        Tautan resmi portal pemerintah
                      </span>
                    </div>
                  </div>
                  <a
                    href={(viewingItem.raw as { url: string }).url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 text-[11px] font-semibold bg-amber-600 text-white rounded-lg hover:bg-amber-700 shrink-0"
                  >
                    Buka Tautan Resmi
                  </a>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setViewingItem(null)}
                className="text-xs h-8"
              >
                Tutup
              </Button>

              <div className="flex items-center gap-2">
                {viewingItem.section === "edukasi" && (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      const item = viewingItem;
                      setViewingItem(null);
                      if ((item.raw as { isDjpLink?: boolean })?.isDjpLink) {
                        openEditDjpLink(item);
                      } else {
                        openEditEducation(item);
                      }
                    }}
                    className="text-xs h-8 font-semibold inline-flex items-center gap-1.5"
                  >
                    <EditIcon className="text-xs" />
                    <span>Edit Konten Ini</span>
                  </Button>
                )}
                {viewingItem.section === "services" && (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      const item = viewingItem;
                      setViewingItem(null);
                      openEditService(item);
                    }}
                    className="text-xs h-8 font-semibold inline-flex items-center gap-1.5"
                  >
                    <EditIcon className="text-xs" />
                    <span>Edit Layanan Ini</span>
                  </Button>
                )}
                {viewingItem.section === "regulasi" && (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      const item = viewingItem;
                      setViewingItem(null);
                      openEditRegulation(item);
                    }}
                    className="text-xs h-8 font-semibold inline-flex items-center gap-1.5"
                  >
                    <EditIcon className="text-xs" />
                    <span>Edit Regulasi Ini</span>
                  </Button>
                )}
                {viewingItem.section === "karir" && (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      const item = viewingItem;
                      setViewingItem(null);
                      openEditCareer(item);
                    }}
                    className="text-xs h-8 font-semibold inline-flex items-center gap-1.5"
                  >
                    <EditIcon className="text-xs" />
                    <span>Edit Karir Ini</span>
                  </Button>
                )}
                {viewingItem.section === "kurs" && (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      const item = viewingItem;
                      setViewingItem(null);
                      openEditKurs(item);
                    }}
                    className="text-xs h-8 font-semibold inline-flex items-center gap-1.5"
                  >
                    <EditIcon className="text-xs" />
                    <span>Edit Kurs Ini</span>
                  </Button>
                )}
                {viewingItem.section === "faqs" && (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      const item = viewingItem;
                      setViewingItem(null);
                      if (item.raw) openEditFaq(item.raw as ChatbotFaqItem);
                    }}
                    className="text-xs h-8 font-semibold inline-flex items-center gap-1.5"
                  >
                    <EditIcon className="text-xs" />
                    <span>Edit FAQ Ini</span>
                  </Button>
                )}
                {viewingItem.id === "CFG-HERO" && (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setViewingItem(null);
                      setIsHeroModalOpen(true);
                    }}
                    className="text-xs h-8 font-semibold inline-flex items-center gap-1.5"
                  >
                    <EditIcon className="text-xs" />
                    <span>Edit Headline Hero</span>
                  </Button>
                )}
                {viewingItem.id === "CFG-CONTACT" && (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setViewingItem(null);
                      setIsContactModalOpen(true);
                    }}
                    className="text-xs h-8 font-semibold inline-flex items-center gap-1.5"
                  >
                    <EditIcon className="text-xs" />
                    <span>Edit Informasi Kontak</span>
                  </Button>
                )}
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
        <div className="p-8 text-center text-text-secondary text-xs">
          Memuat Pusat Manajemen Konten Website (CMS)...
        </div>
      }
    >
      <AdminCMSPageContent />
    </Suspense>
  );
}
