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
import {
  CheckCircleIcon,
  SearchIcon,
  CloseIcon,
  EditIcon,
  TrashIcon,
} from "@/components/icons";
import {
  adminCmsApi,
  publicApi,
  parseContactSettings,
  JobApplicationItem,
  ChatbotFaqItem,
  PublicEducationItem,
  PublicRegulationItem,
  PublicServiceItem,
  PublicCareerItem,
  PublicTaxRateItem,
} from "@/lib/api";

export type CMSTab =
  | "all"
  | "edukasi"
  | "services"
  | "regulasi"
  | "kurs"
  | "karir"
  | "applications"
  | "faqs"
  | "kontak";

export interface UnifiedCMSItem {
  id: string;
  numericId: number;
  section: "edukasi" | "services" | "regulasi" | "kurs" | "karir" | "applications" | "faqs" | "kontak";
  title: string;
  category: "Edukasi" | "Layanan" | "Regulasi" | "Kurs KMK" | "Karir" | "Lamaran Masuk" | "FAQ Chatbot" | "Profil & Kontak";
  subcategory: string;
  summary: string;
  status: "Published" | "Draft";
  updatedAt: string;
  raw?: unknown;
}

const DEFAULT_KURS_LIST = [
  { currency: "USD", name: "Dolar Amerika Serikat", rate: "15.890,00", flag: "🇺🇸" },
  { currency: "EUR", name: "Euro", rate: "17.250,50", flag: "🇪🇺" },
  { currency: "SGD", name: "Dolar Singapura", rate: "11.890,00", flag: "🇸🇬" },
  { currency: "JPY", name: "Yen Jepang (100)", rate: "10.450,00", flag: "🇯🇵" },
  { currency: "GBP", name: "Poundsterling Inggris", rate: "20.120,00", flag: "🇬🇧" },
  { currency: "AUD", name: "Dolar Australia", rate: "10.340,00", flag: "🇦🇺" },
  { currency: "CNY", name: "Yuan Tiongkok", rate: "2.190,00", flag: "🇨🇳" },
];

const TAB_TO_CATEGORY: Record<string, string> = {
  all: "ALL",
  edukasi: "Edukasi",
  services: "Layanan",
  regulasi: "Regulasi",
  kurs: "Kurs KMK",
  karir: "Karir",
  applications: "Lamaran Masuk",
  faqs: "FAQ Chatbot",
  kontak: "Profil & Kontak",
};

// Master Fallbacks when backend database arrays are empty so all 8 categories are always visible
const FALLBACK_EDUCATION: UnifiedCMSItem[] = [
  {
    id: "EDU-1",
    numericId: 1,
    section: "edukasi",
    title: "Panduan Integrasi Coretax DJP 2026",
    category: "Edukasi",
    subcategory: "Coretax DJP",
    summary: "Pedoman teknis integrasi sistem perpajakan terbaru DJP untuk WP Badan dan Orang Pribadi",
    status: "Published",
    updatedAt: "Terbaru",
  },
  {
    id: "EDU-2",
    numericId: 2,
    section: "edukasi",
    title: "Tata Cara Perhitungan PPh 21 Metode TER",
    category: "Edukasi",
    subcategory: "PPh 21 & PPN",
    summary: "Simulasi dan tata cara pemotongan PPh 21 menggunakan Tarif Efektif Rata-Rata (TER) PP 58/2023",
    status: "Published",
    updatedAt: "Terbaru",
  },
  {
    id: "EDU-3",
    numericId: 3,
    section: "edukasi",
    title: "Strategi Menghadapi SP2DK dan Pemeriksaan Pajak",
    category: "Edukasi",
    subcategory: "Mitigasi SP2DK",
    summary: "Langkah mitigasi risiko fiskal dan penyusunan tanggapan resmi SP2DK secara komprehensif",
    status: "Published",
    updatedAt: "Terbaru",
  },
];

const FALLBACK_REGULATIONS: UnifiedCMSItem[] = [
  {
    id: "REG-1",
    numericId: 1,
    section: "regulasi",
    title: "PMK No. 168 Tahun 2023 tentang Petunjuk Pemotongan PPh 21",
    category: "Regulasi",
    subcategory: "PMK",
    summary: "Berkas: /docs/pmk-168-2023.pdf (2.4 MB)",
    status: "Published",
    updatedAt: "Terbaru",
  },
  {
    id: "REG-2",
    numericId: 2,
    section: "regulasi",
    title: "PER-2/PJ/2024 tentang Tata Cara Pembuatan Bukti Potong PPh",
    category: "Regulasi",
    subcategory: "PER",
    summary: "Berkas: /docs/per-02-pj-2024.pdf (1.8 MB)",
    status: "Published",
    updatedAt: "Terbaru",
  },
  {
    id: "REG-3",
    numericId: 3,
    section: "regulasi",
    title: "UU No. 7 Tahun 2021 tentang Harmonisasi Peraturan Perpajakan (UU HPP)",
    category: "Regulasi",
    subcategory: "UU",
    summary: "Berkas: /docs/uu-7-2021-hpp.pdf (4.1 MB)",
    status: "Published",
    updatedAt: "Terbaru",
  },
];

const FALLBACK_APPLICATIONS: UnifiedCMSItem[] = [
  {
    id: "APP-1",
    numericId: 1,
    section: "applications",
    title: "Lamaran: Sarah Maharani",
    category: "Lamaran Masuk",
    subcategory: "Senior Tax Consultant",
    summary: "Email: sarah.maharani@email.com | Telp: +62 812-3456-7890 | CV: cv_sarah_tax.pdf",
    status: "Published",
    updatedAt: "Terbaru",
  },
  {
    id: "APP-2",
    numericId: 2,
    section: "applications",
    title: "Lamaran: Budi Santoso",
    category: "Lamaran Masuk",
    subcategory: "Junior Accounting Staff",
    summary: "Email: budi.santoso@email.com | Telp: +62 813-8899-7711 | CV: cv_budi_accounting.pdf",
    status: "Published",
    updatedAt: "Terbaru",
  },
];

const FALLBACK_FAQS: UnifiedCMSItem[] = [
  {
    id: "FAQ-1",
    numericId: 1,
    section: "faqs",
    title: "Apa saja cakupan Layanan Konsultasi Perpajakan di Zhou Consulting?",
    category: "FAQ Chatbot",
    subcategory: "Layanan Perpajakan",
    summary: "Layanan mencakup Tax Compliance (SPT Masa & Tahunan), integrasi Coretax DJP 2026, Tax Advisory & Planning...",
    status: "Published",
    updatedAt: "Bot Knowledge",
    raw: {
      id: 1,
      category: "Layanan Perpajakan",
      question: "Apa saja cakupan Layanan Konsultasi Perpajakan di Zhou Consulting?",
      answer_template:
        "Layanan Konsultasi Perpajakan Zhou Consulting mencakup Tax Compliance (SPT Masa & Tahunan), asistensi integrasi Coretax DJP 2026, Tax Advisory & Planning, penanganan sengketa & tanggapan SP2DK, asistensi pemeriksaan pajak, serta konsultasi transfer pricing dan kepatuhan perpajakan korporasi.",
    },
  },
  {
    id: "FAQ-2",
    numericId: 2,
    section: "faqs",
    title: "Bagaimana prosedur penelaahan dan validasi dokumen perpajakan?",
    category: "FAQ Chatbot",
    subcategory: "Prosedur & Validasi",
    summary: "Dokumen klien dianalisis melalui 3 tahap telaah: analis, review konsultan BKP, dan pengesahan Lead Partner...",
    status: "Published",
    updatedAt: "Bot Knowledge",
    raw: {
      id: 2,
      category: "Prosedur & Validasi",
      question: "Bagaimana prosedur penelaahan dan validasi dokumen perpajakan?",
      answer_template:
        "Dokumen klien dianalisis melalui 3 tahap telaah: verifikasi kelengkapan berkas oleh analis, review kepatuhan regulasi oleh Konsultan Berizin BKP, dan pengesahan akhir oleh Lead Partner. Seluruh berkas dilindungi enkripsi SHA-256.",
    },
  },
  {
    id: "FAQ-3",
    numericId: 3,
    section: "faqs",
    title: "Bagaimana cara memantau progres status proyek/konsultasi yang sedang berjalan?",
    category: "FAQ Chatbot",
    subcategory: "Konsultasi & Monitoring",
    summary: "Anda dapat memantau alur pengerjaan secara real-time melalui menu Layanan Konsultasi di sidebar portal...",
    status: "Published",
    updatedAt: "Bot Knowledge",
    raw: {
      id: 3,
      category: "Konsultasi & Monitoring",
      question: "Bagaimana cara memantau progres status proyek/konsultasi yang sedang berjalan?",
      answer_template:
        "Anda dapat memantau alur pengerjaan secara real-time melalui menu Layanan Konsultasi di sidebar. Setiap lembar kerja menampilkan tahapan milestone, persentase progres, catatan konsultan lead, dan estimasi waktu penyelesaian.",
    },
  },
  {
    id: "FAQ-4",
    numericId: 4,
    section: "faqs",
    title: "Bagaimana cara mengajukan tiket konsultasi atau permohonan baru?",
    category: "FAQ Chatbot",
    subcategory: "Layanan & Pendaftaran",
    summary: "Anda dapat mengajukan permohonan konsultasi baru langsung melalui menu Layanan Konsultasi di portal ini...",
    status: "Published",
    updatedAt: "Bot Knowledge",
    raw: {
      id: 4,
      category: "Layanan & Pendaftaran",
      question: "Bagaimana cara mengajukan tiket konsultasi atau permohonan baru?",
      answer_template:
        "Anda dapat mengajukan permohonan konsultasi baru langsung melalui menu Layanan Konsultasi atau tombol 'Buka Konsultasi / Projects' di portal ini. Tim konsultan kami akan meninjau kebutuhan penugasan dan segera mengonfirmasi jadwal serta dokumen pendukung.",
    },
  },
];

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
    companyName: "Zhou Consulting Group",
    email: "contact@zhouconsulting.com",
    phone: "+62 21 555 8899",
    address: "Sudirman Central Business District (SCBD) Lot 28, Jakarta Selatan",
    whatsapp: "+6281298765432",
  });

  // Kurs Form
  const [kursRates, setKursRates] = useState(DEFAULT_KURS_LIST);
  const [kmkNumber, setKmkNumber] = useState("KMK No. 44/KM.10/2026");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isHeroModalOpen, setIsHeroModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isBatchKursModalOpen, setIsBatchKursModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<ChatbotFaqItem | null>(null);
  const [modalSection, setModalSection] = useState<"edukasi" | "services" | "regulasi" | "kurs" | "karir" | "faqs">("edukasi");

  // Form states strictly matching backend request bodies:
  // 1. Edukasi
  const [eduForm, setEduForm] = useState({
    title: "",
    category: "Coretax DJP",
    content_type: "ARTICLE" as "ARTICLE" | "GUIDE",
    body: "",
    file_path: "",
  });

  // 2. Services
  const [serviceForm, setServiceForm] = useState({
    service_code: "",
    service_name: "",
    category: "TAX",
    description: "",
    is_active: true,
  });

  // 3. Regulasi
  const [regForm, setRegForm] = useState({
    title: "",
    regulation_type: "Peraturan Menteri Keuangan (PMK)",
    file_path: "/docs/regulasi-pajak.pdf",
    file_size: "1.2 MB",
  });

  // 4. Kurs
  const [kursForm, setSingleKursForm] = useState({
    currency_code: "USD",
    rate_value: 15890,
    effective_start_date: new Date().toISOString().split("T")[0],
    effective_end_date: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
  });

  // 5. Karir
  const [careerForm, setCareerForm] = useState({
    position_code: "",
    position_title: "",
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
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load all backend resources into ONE unified list
  const loadAllCMS = async () => {
    setIsLoading(true);
    try {
      const [
        eduRes,
        srvRes,
        regRes,
        rateRes,
        carRes,
        appRes,
        faqRes,
        profileRes,
        contactRes,
      ] = await Promise.allSettled([
        publicApi.getEducation(),
        publicApi.getServices(),
        publicApi.getRegulations(),
        publicApi.getTaxRates(),
        publicApi.getCareers(),
        adminCmsApi.getJobApplications(),
        adminCmsApi.getFaqs(),
        publicApi.getCompanyProfiles(),
        publicApi.getContactSettings(),
      ]);

      const items: UnifiedCMSItem[] = [];

      // 1. Education (Use backend if available, fallback otherwise)
      if (eduRes.status === "fulfilled" && Array.isArray(eduRes.value.data) && eduRes.value.data.length > 0) {
        eduRes.value.data.forEach((e: PublicEducationItem) => {
          items.push({
            id: `EDU-${e.id}`,
            numericId: e.id,
            section: "edukasi",
            title: e.title,
            category: "Edukasi",
            subcategory: e.category || "Coretax DJP",
            summary: e.body ? e.body.slice(0, 140) + "..." : "Artikel edukasi perpajakan",
            status: "Published",
            updatedAt: e.created_at ? new Date(e.created_at).toLocaleDateString("id-ID") : "Terbaru",
            raw: e,
          });
        });
      } else {
        items.push(...FALLBACK_EDUCATION);
      }

      // 2. Services
      if (srvRes.status === "fulfilled" && Array.isArray(srvRes.value.data) && srvRes.value.data.length > 0) {
        srvRes.value.data.forEach((s: PublicServiceItem) => {
          items.push({
            id: `SVC-${s.id}`,
            numericId: s.id,
            section: "services",
            title: s.service_name,
            category: "Layanan",
            subcategory: s.category || "Akuntansi",
            summary: s.description || "Layanan konsultasi resmi",
            status: s.is_active ? "Published" : "Draft",
            updatedAt: "Aktif",
            raw: s,
          });
        });
      }

      // 3. Regulations (Use backend if available, fallback otherwise)
      if (regRes.status === "fulfilled" && Array.isArray(regRes.value.data) && regRes.value.data.length > 0) {
        regRes.value.data.forEach((r: PublicRegulationItem) => {
          items.push({
            id: `REG-${r.id}`,
            numericId: r.id,
            section: "regulasi",
            title: r.title,
            category: "Regulasi",
            subcategory: r.regulation_type || "PMK",
            summary: `Berkas: ${r.file_path} (${r.file_size || "PDF"})`,
            status: "Published",
            updatedAt: r.created_at ? new Date(r.created_at).toLocaleDateString("id-ID") : "Terbaru",
            raw: r,
          });
        });
      } else {
        items.push(...FALLBACK_REGULATIONS);
      }

      // 4. Tax rates (Always present all 7 KMK foreign exchange currencies)
      if (rateRes.status === "fulfilled" && Array.isArray(rateRes.value.data) && rateRes.value.data.length > 0) {
        rateRes.value.data.forEach((t: PublicTaxRateItem) => {
          items.push({
            id: `TAX-${t.id}`,
            numericId: t.id,
            section: "kurs",
            title: `Kurs Valas ${t.currency_code}: Rp ${Number(t.rate_value).toLocaleString("id-ID")}`,
            category: "Kurs KMK",
            subcategory: t.currency_code,
            summary: `Berlaku: ${t.effective_start_date ? new Date(t.effective_start_date).toLocaleDateString("id-ID") : "-"} s/d ${t.effective_end_date ? new Date(t.effective_end_date).toLocaleDateString("id-ID") : "Seterusnya"}`,
            status: "Published",
            updatedAt: "KMK Aktif",
            raw: t,
          });
        });
      } else {
        DEFAULT_KURS_LIST.forEach((k, idx) => {
          items.push({
            id: `TAX-${k.currency}`,
            numericId: idx + 1,
            section: "kurs",
            title: `Kurs Valas ${k.currency} (${k.name}): Rp ${k.rate}`,
            category: "Kurs KMK",
            subcategory: k.currency,
            summary: `${kmkNumber} Berlaku s/d Akhir Pekan`,
            status: "Published",
            updatedAt: "KMK Aktif",
            raw: k,
          });
        });
      }

      // 5. Careers
      if (carRes.status === "fulfilled" && Array.isArray(carRes.value.data) && carRes.value.data.length > 0) {
        carRes.value.data.forEach((c: PublicCareerItem) => {
          items.push({
            id: `CAR-${c.id}`,
            numericId: c.id,
            section: "karir",
            title: c.position_title,
            category: "Karir",
            subcategory: `${c.level} (${c.location})`,
            summary: c.description || "Lowongan karir aktif di Zhou Consulting",
            status: c.is_active ? "Published" : "Draft",
            updatedAt: "Rekrutmen Buka",
            raw: c,
          });
        });
      }

      // 6. Job Applications
      if (appRes.status === "fulfilled" && Array.isArray(appRes.value.data) && appRes.value.data.length > 0) {
        appRes.value.data.forEach((app: JobApplicationItem) => {
          items.push({
            id: `APP-${app.id}`,
            numericId: app.id,
            section: "applications",
            title: `Lamaran: ${app.applicant_name}`,
            category: "Lamaran Masuk",
            subcategory: app.job?.position_title || `Posisi ID #${app.job_id || app.career_id || "-"}`,
            summary: `Email: ${app.applicant_email} | Telp: ${app.applicant_phone || "-"}${app.cv_file_path ? ` | CV: ${app.cv_file_path}` : ""}`,
            status: "Published",
            updatedAt: app.applied_at ? new Date(app.applied_at).toLocaleDateString("id-ID") : "Terbaru",
            raw: app,
          });
        });
      } else {
        items.push(...FALLBACK_APPLICATIONS);
      }

      // 7. FAQs
      if (faqRes.status === "fulfilled" && Array.isArray(faqRes.value.data) && faqRes.value.data.length > 0) {
        faqRes.value.data.forEach((f: ChatbotFaqItem) => {
          items.push({
            id: `FAQ-${f.id}`,
            numericId: f.id,
            section: "faqs",
            title: f.question,
            category: "FAQ Chatbot",
            subcategory: f.category || "Layanan Perpajakan",
            summary: f.answer_template ? f.answer_template.slice(0, 140) + "..." : "Respon otomatis chatbot",
            status: "Published",
            updatedAt: "Bot Knowledge",
            raw: f,
          });
        });
      } else {
        items.push(...FALLBACK_FAQS);
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

      items.push({
        id: "CFG-HERO",
        numericId: 1,
        section: "kontak",
        title: "Headline Hero Landing Page",
        category: "Profil & Kontak",
        subcategory: "Hero Headline",
        summary: heroForm.headline || "Teks utama headline dan subheadline beranda publik",
        status: "Published",
        updatedAt: "Aktif",
      });

      items.push({
        id: "CFG-CONTACT",
        numericId: 2,
        section: "kontak",
        title: "Informasi Kontak & CS Resmi",
        category: "Profil & Kontak",
        subcategory: "Kontak & Alamat",
        summary: `${contactForm.companyName} | ${contactForm.email} | ${contactForm.phone} | WA: ${contactForm.whatsapp}`,
        status: "Published",
        updatedAt: "Aktif",
      });

      setCmsItems(items);
    } catch (err) {
      console.warn("Gagal sinkronisasi CMS dengan backend:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllCMS();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // DELETE handler
  const handleDeleteItem = async (item: UnifiedCMSItem) => {
    try {
      if (item.section === "edukasi") {
        await adminCmsApi.deleteEducation(item.numericId);
      } else if (item.section === "services") {
        await adminCmsApi.deleteService(item.numericId);
      } else if (item.section === "regulasi") {
        await adminCmsApi.deleteRegulation(item.numericId);
      } else if (item.section === "kurs") {
        await adminCmsApi.deleteTaxRate(item.numericId);
      } else if (item.section === "karir") {
        await adminCmsApi.deleteCareer(item.numericId);
      } else if (item.section === "faqs") {
        await adminCmsApi.deleteFaq(item.numericId);
      }
      setCmsItems((prev) => prev.filter((i) => i.id !== item.id));
      showToast(`Konten "${item.title.slice(0, 30)}..." berhasil dihapus.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menghapus konten";
      showToast(msg);
    }
  };

  // TOGGLE STATUS handler
  const handleToggleStatus = async (item: UnifiedCMSItem) => {
    const nextStatus = item.status === "Published" ? "Draft" : "Published";
    const isActive = nextStatus === "Published";

    try {
      if (item.section === "services") {
        await adminCmsApi.updateService(item.numericId, { is_active: isActive });
      } else if (item.section === "karir") {
        await adminCmsApi.updateCareer(item.numericId, { is_active: isActive });
      }
      setCmsItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: nextStatus } : i))
      );
      showToast(`Status "${item.title.slice(0, 30)}..." diubah ke ${nextStatus}.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengubah status";
      showToast(msg);
    }
  };

  // CREATE / EDIT ITEM Form Submission
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalSection === "edukasi") {
        const res = await adminCmsApi.createEducation({
          title: eduForm.title,
          category: eduForm.category,
          content_type: eduForm.content_type,
          body: eduForm.body,
          file_path: eduForm.file_path || undefined,
        });
        showToast("Materi edukasi berhasil ditambahkan ke database!");
        if (res.data && (res.data as Record<string, unknown>).id) {
          const id = Number((res.data as Record<string, unknown>).id);
          setCmsItems((prev) => [
            {
              id: `EDU-${id}`,
              numericId: id,
              section: "edukasi",
              title: eduForm.title,
              category: "Edukasi",
              subcategory: eduForm.category,
              summary: eduForm.body.slice(0, 140) + "...",
              status: "Published",
              updatedAt: "Baru saja",
              raw: { id, ...eduForm },
            },
            ...prev,
          ]);
        } else {
          loadAllCMS();
        }
      } else if (modalSection === "services") {
        const res = await adminCmsApi.createService({
          service_code: serviceForm.service_code || `SRV-${Date.now().toString().slice(-4)}`,
          service_name: serviceForm.service_name,
          category: serviceForm.category,
          description: serviceForm.description,
          is_active: serviceForm.is_active,
        });
        showToast("Layanan baru berhasil diterbitkan!");
        if (res.data && (res.data as Record<string, unknown>).id) {
          const id = Number((res.data as Record<string, unknown>).id);
          setCmsItems((prev) => [
            {
              id: `SVC-${id}`,
              numericId: id,
              section: "services",
              title: serviceForm.service_name,
              category: "Layanan",
              subcategory: serviceForm.category,
              summary: serviceForm.description,
              status: serviceForm.is_active ? "Published" : "Draft",
              updatedAt: "Baru saja",
              raw: { id, ...serviceForm },
            },
            ...prev,
          ]);
        } else {
          loadAllCMS();
        }
      } else if (modalSection === "regulasi") {
        const res = await adminCmsApi.createRegulation({
          title: regForm.title,
          regulation_type: regForm.regulation_type,
          file_path: regForm.file_path,
          file_size: regForm.file_size,
        });
        showToast("Dokumen regulasi DJP berhasil diunggah!");
        if (res.data && (res.data as Record<string, unknown>).id) {
          const id = Number((res.data as Record<string, unknown>).id);
          setCmsItems((prev) => [
            {
              id: `REG-${id}`,
              numericId: id,
              section: "regulasi",
              title: regForm.title,
              category: "Regulasi",
              subcategory: regForm.regulation_type,
              summary: `Berkas: ${regForm.file_path} (${regForm.file_size})`,
              status: "Published",
              updatedAt: "Baru saja",
              raw: { id, ...regForm },
            },
            ...prev,
          ]);
        } else {
          loadAllCMS();
        }
      } else if (modalSection === "kurs") {
        const res = await adminCmsApi.createTaxRate({
          currency_code: kursForm.currency_code,
          rate_value: Number(kursForm.rate_value),
          effective_start_date: kursForm.effective_start_date,
          effective_end_date: kursForm.effective_end_date,
        });
        showToast("Kurs pajak KMK berhasil disimpan!");
        if (res.data && (res.data as Record<string, unknown>).id) {
          const id = Number((res.data as Record<string, unknown>).id);
          setCmsItems((prev) => [
            {
              id: `TAX-${id}`,
              numericId: id,
              section: "kurs",
              title: `Kurs Valas ${kursForm.currency_code}: Rp ${Number(kursForm.rate_value).toLocaleString("id-ID")}`,
              category: "Kurs KMK",
              subcategory: kursForm.currency_code,
              summary: `Berlaku: ${kursForm.effective_start_date} s/d ${kursForm.effective_end_date}`,
              status: "Published",
              updatedAt: "Baru saja",
              raw: { id, ...kursForm },
            },
            ...prev,
          ]);
        } else {
          loadAllCMS();
        }
      } else if (modalSection === "karir") {
        const res = await adminCmsApi.createCareer({
          position_code: careerForm.position_code || `POS-${Date.now().toString().slice(-4)}`,
          position_title: careerForm.position_title,
          level: careerForm.level,
          location: careerForm.location,
          description: careerForm.description,
          is_active: careerForm.is_active,
        });
        showToast("Lowongan karir baru berhasil dibuka!");
        if (res.data && (res.data as Record<string, unknown>).id) {
          const id = Number((res.data as Record<string, unknown>).id);
          setCmsItems((prev) => [
            {
              id: `CAR-${id}`,
              numericId: id,
              section: "karir",
              title: careerForm.position_title,
              category: "Karir",
              subcategory: `${careerForm.level} (${careerForm.location})`,
              summary: careerForm.description,
              status: careerForm.is_active ? "Published" : "Draft",
              updatedAt: "Baru saja",
              raw: { id, ...careerForm },
            },
            ...prev,
          ]);
        } else {
          loadAllCMS();
        }
      } else if (modalSection === "faqs") {
        if (editingFaq) {
          await adminCmsApi.updateFaq(editingFaq.id, {
            category: faqForm.category,
            question: faqForm.question,
            answer_template: faqForm.answer_template,
          });
          setCmsItems((prev) =>
            prev.map((item) =>
              item.id === `FAQ-${editingFaq.id}`
                ? {
                    ...item,
                    subcategory: faqForm.category,
                    title: faqForm.question,
                    summary: faqForm.answer_template.slice(0, 140) + "...",
                  }
                : item
            )
          );
          showToast("FAQ chatbot berhasil diperbarui!");
        } else {
          const res = await adminCmsApi.createFaq({
            category: faqForm.category,
            question: faqForm.question,
            answer_template: faqForm.answer_template,
          });
          showToast("FAQ chatbot baru berhasil disimpan!");
          if (res.data && (res.data as Record<string, unknown>).id) {
            const id = Number((res.data as Record<string, unknown>).id);
            setCmsItems((prev) => [
              {
                id: `FAQ-${id}`,
                numericId: id,
                section: "faqs",
                title: faqForm.question,
                category: "FAQ Chatbot",
                subcategory: faqForm.category,
                summary: faqForm.answer_template.slice(0, 140) + "...",
                status: "Published",
                updatedAt: "Bot Knowledge",
                raw: { id, ...faqForm },
              },
              ...prev,
            ]);
          } else {
            loadAllCMS();
          }
        }
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
      await adminCmsApi.updateCompanyProfile({
        section_key: "hero",
        title: heroForm.headline,
        content: heroForm.subheadline,
      });
      setCmsItems((prev) =>
        prev.map((item) =>
          item.id === "CFG-HERO"
            ? { ...item, summary: heroForm.headline }
            : item
        )
      );
      showToast("Headline Hero Landing Page berhasil diperbarui ke database!");
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
      showToast(`Seluruh 7 kurs valas KMK (${kmkNumber}) berhasil diperbarui ke database.`);
      setIsBatchKursModalOpen(false);
      loadAllCMS();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan kurs";
      showToast(msg);
    }
  };

  const openAddModal = (sec: "edukasi" | "services" | "regulasi" | "kurs" | "karir" | "faqs") => {
    setEditingFaq(null);
    setModalSection(sec);
    if (sec === "faqs") {
      setFaqForm({
        category: "Layanan Perpajakan",
        question: "",
        answer_template: "",
      });
    }
    setIsAddModalOpen(true);
  };

  const openEditFaq = (f: ChatbotFaqItem) => {
    setEditingFaq(f);
    setFaqForm({
      category: f.category || "Layanan Perpajakan",
      question: f.question,
      answer_template: f.answer_template,
    });
    setModalSection("faqs");
    setIsAddModalOpen(true);
  };

  // Fixed master category list so ALL 8 categories are ALWAYS present in the double dropdown
  const MASTER_CATEGORIES = useMemo(() => [
    "Layanan",
    "Edukasi",
    "Regulasi",
    "Kurs KMK",
    "Karir",
    "Lamaran Masuk",
    "FAQ Chatbot",
    "Profil & Kontak",
  ], []);

  // Build hierarchical category groups with their respective subcategories
  const categoryGroups = useMemo(() => {
    return MASTER_CATEGORIES.map((cat) => {
      const itemsInCat = cmsItems.filter((i) => i.category === cat);
      const subs = Array.from(new Set(itemsInCat.map((i) => i.subcategory).filter(Boolean)));
      return {
        name: cat,
        count: itemsInCat.length,
        subcategories: subs.sort(),
      };
    });
  }, [cmsItems, MASTER_CATEGORIES]);


  // Combined Search and Filtering
  const filteredItems = useMemo(() => {
    return cmsItems.filter((item) => {
      const matchesCategory = categoryFilter === "ALL" || item.category === categoryFilter;
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
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
      <div className="space-y-1 pb-4 border-b border-primary-light">
        <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
          <Link href="/dashboard/admin" className="hover:text-primary transition-colors">
            Dashboard Operasional
          </Link>
          <span>/</span>
          <span className="text-primary font-bold">Pusat Manajemen CMS</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight flex items-center gap-2.5">
          <span>Pusat Manajemen Konten Website (CMS)</span>
          {isLoading && (
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold animate-pulse">
              Sinkronisasi Backend...
            </span>
          )}
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary">
          Satu pintu untuk mengelola seluruh publikasi landing page dan konten public website.
        </p>
      </div>

      {/* 2. CONSOLIDATED TOOLBAR (Search, Double Dropdown Kategori & Subkategori, Status Filter, and Action Button) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-primary-light shadow-2xs">
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

          {/* DOUBLE DROPDOWN KIRI: Dropdown Kategori & Subkategori Berjenjang */}
          <select
            value={
              subcategoryFilter !== "ALL"
                ? `sub:${subcategoryFilter}`
                : categoryFilter !== "ALL"
                ? `cat:${categoryFilter}`
                : "ALL"
            }
            onChange={(e) => {
              const val = e.target.value;
              if (val === "ALL") {
                setCategoryFilter("ALL");
                setSubcategoryFilter("ALL");
              } else if (val.startsWith("cat:")) {
                const cat = val.replace("cat:", "");
                setCategoryFilter(cat);
                setSubcategoryFilter("ALL");
              } else if (val.startsWith("sub:")) {
                const sub = val.replace("sub:", "");
                const parentCat = cmsItems.find((i) => i.subcategory === sub)?.category || "ALL";
                setCategoryFilter(parentCat);
                setSubcategoryFilter(sub);
              }
            }}
            className="text-xs h-9 px-3 rounded-xl border border-primary-light bg-surface text-text-primary focus:bg-white font-medium focus:outline-none min-w-[210px]"
          >
            <option value="ALL">Semua Kategori ({cmsItems.length})</option>
            {categoryGroups.map((grp) => (
              <optgroup key={grp.name} label={`─── ${grp.name} (${grp.count}) ───`}>
                <option value={`cat:${grp.name}`}>Semua di {grp.name} ({grp.count})</option>
                {grp.subcategories.map((sub) => {
                  const subCount = cmsItems.filter((i) => i.category === grp.name && i.subcategory === sub).length;
                  return (
                    <option key={sub} value={`sub:${sub}`}>
                      &nbsp;&nbsp;↳ {sub} ({subCount})
                    </option>
                  );
                })}
              </optgroup>
            ))}
          </select>


          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs h-9 px-3 rounded-xl border border-primary-light bg-surface text-text-primary focus:bg-white font-medium focus:outline-none"
          >
            <option value="ALL">Semua Status</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
          </select>

          {/* Reset Filters button if any filter applied */}
          {(searchQuery || categoryFilter !== "ALL" || subcategoryFilter !== "ALL" || statusFilter !== "ALL") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setCategoryFilter("ALL");
                setSubcategoryFilter("ALL");
                setStatusFilter("ALL");
              }}
              className="text-xs text-text-muted hover:text-primary underline px-1 cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>

        {/* Action Button: Tambah Konten Baru on Toolbar Right */}
        <div className="flex items-center gap-2 self-start lg:self-auto shrink-0 flex-wrap">
          {categoryFilter === "Kurs KMK" && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsBatchKursModalOpen(true)}
              className="text-xs font-semibold h-9 px-3.5 border-primary-light bg-white text-primary"
            >
              Kelola Batch 7 Kurs Valas
            </Button>
          )}

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => {
              const catMap: Record<string, "edukasi" | "services" | "regulasi" | "kurs" | "karir" | "faqs"> = {
                Edukasi: "edukasi",
                Layanan: "services",
                Regulasi: "regulasi",
                "Kurs KMK": "kurs",
                Karir: "karir",
                "FAQ Chatbot": "faqs",
              };
              openAddModal(catMap[categoryFilter] || "edukasi");
            }}
            className="text-xs font-semibold h-9 px-4 shadow-sm"
          >
            + Tambah Konten Baru
          </Button>
        </div>
      </div>

      {/* 3. MASTER CONTENT MANAGEMENT TABLE */}
      <Card className="rounded-2xl border-primary-light bg-white p-6 shadow-xs space-y-4">
        {/* Table Title and Count */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-primary-light">
          <div>
            <h2 className="text-base font-bold text-primary">Daftar Seluruh Konten</h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Seluruh publikasi website (Layanan, Edukasi, Regulasi, Kurs KMK, Karir, Lamaran, FAQ, Profil) terkelola dalam satu tabel master terpadu.
            </p>
          </div>
          <div className="text-xs text-text-muted font-medium bg-surface px-3 py-1 rounded-lg border border-primary-light">
            Menampilkan <span className="font-bold text-primary">{filteredItems.length}</span> dari{" "}
            <span className="font-bold text-primary">{cmsItems.length}</span> konten
          </div>
        </div>

        {/* Master Table */}
        <div className="overflow-x-auto rounded-xl border border-primary-light">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface text-text-muted font-bold uppercase text-[10px] tracking-wider border-b border-primary-light">
              <tr>
                <th className="py-3 px-4 w-28">ID</th>
                <th className="py-3 px-4 min-w-[260px]">Judul</th>
                <th className="py-3 px-4 w-36">Kategori</th>
                <th className="py-3 px-4 w-44">Subkategori</th>
                <th className="py-3 px-4 w-24">Status</th>
                <th className="py-3 px-4 text-right w-44">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-light">
              {filteredItems.map((item) => {
                const isDeletable = ["edukasi", "services", "regulasi", "kurs", "karir", "faqs"].includes(item.section);
                const isStatusToggleable = ["services", "karir"].includes(item.section);
                const isFaq = item.section === "faqs";
                const isKurs = item.section === "kurs";
                const isHero = item.id === "CFG-HERO";
                const isContact = item.id === "CFG-CONTACT";
                const isApplication = item.section === "applications";
                const appRaw = item.raw as JobApplicationItem | undefined;

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
                      <span className="inline-block text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
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
                        variant={item.status === "Published" ? "success" : "silver"}
                        size="sm"
                      >
                        {item.status}
                      </Badge>
                    </td>

                    {/* 6. Aksi */}
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      {/* Toggle Publish / Draft */}
                      {isStatusToggleable && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(item)}
                          className="text-[11px] h-7 px-2.5 border-primary-light"
                        >
                          {item.status === "Published" ? "Draftkan" : "Publikasikan"}
                        </Button>
                      )}

                      {/* Edit FAQ */}
                      {isFaq && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (item.raw) {
                              openEditFaq(item.raw as ChatbotFaqItem);
                            } else {
                              openAddModal("faqs");
                            }
                          }}
                          className="text-[11px] h-7 px-2.5 border-primary-light text-primary hover:bg-white inline-flex items-center gap-1"
                        >
                          <EditIcon className="text-xs" />
                          <span>Edit</span>
                        </Button>
                      )}

                      {/* Edit Kurs */}
                      {isKurs && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setIsBatchKursModalOpen(true)}
                          className="text-[11px] h-7 px-2.5 border-primary-light text-primary hover:bg-white inline-flex items-center gap-1"
                        >
                          <EditIcon className="text-xs" />
                          <span>Edit</span>
                        </Button>
                      )}

                      {/* Edit Hero Banner */}
                      {isHero && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setIsHeroModalOpen(true)}
                          className="text-[11px] h-7 px-2.5 border-primary-light text-primary hover:bg-white inline-flex items-center gap-1"
                        >
                          <EditIcon className="text-xs" />
                          <span>Edit</span>
                        </Button>
                      )}

                      {/* Edit Contact Settings */}
                      {isContact && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setIsContactModalOpen(true)}
                          className="text-[11px] h-7 px-2.5 border-primary-light text-primary hover:bg-white inline-flex items-center gap-1"
                        >
                          <EditIcon className="text-xs" />
                          <span>Edit</span>
                        </Button>
                      )}

                      {/* View Resume CV for Job Application */}
                      {isApplication && (
                        <a
                          href={
                            appRaw?.cv_file_path
                              ? `${process.env.NEXT_PUBLIC_API_URL || "https://43.173.2.162.sslip.io"}${appRaw.cv_file_path}`
                              : "#"
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center px-2.5 h-7 text-[11px] font-medium rounded-lg border border-primary-light bg-white hover:bg-surface text-primary"
                        >
                          Lihat CV
                        </a>
                      )}

                      {/* Delete */}
                      {isDeletable && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteItem(item)}
                          className="text-[11px] h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        >
                          <TrashIcon className="text-xs" />
                        </Button>
                      )}
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
      </Card>

      {/* MODAL 1: ADD / EDIT CONTENT (Edukasi, Layanan, Regulasi, Kurs, Karir, FAQs) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-primary-light max-w-lg w-full p-6 space-y-4 relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 text-text-secondary hover:text-primary p-1 cursor-pointer"
            >
              <CloseIcon className="text-sm" />
            </button>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                Penerbitan Konten Backend
              </span>
              <h3 className="text-base font-bold text-primary mt-0.5">
                {modalSection === "edukasi"
                  ? "Tambah Materi Edukasi Pajak"
                  : modalSection === "services"
                  ? "Tambah Katalog Layanan Bisnis"
                  : modalSection === "regulasi"
                  ? "Tambah Regulasi Perpajakan DJP"
                  : modalSection === "kurs"
                  ? "Tambah Kurs Pajak Tunggal"
                  : modalSection === "karir"
                  ? "Buka Lowongan Karir Baru"
                  : editingFaq
                  ? "Edit FAQ Chatbot"
                  : "Tambah FAQ Chatbot"}
              </h3>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              {/* Section Selector */}
              <div>
                <Label className="text-xs font-semibold text-primary">Modul Target</Label>
                <select
                  value={modalSection}
                  onChange={(e) =>
                    setModalSection(e.target.value as "edukasi" | "services" | "regulasi" | "kurs" | "karir" | "faqs")
                  }
                  disabled={Boolean(editingFaq)}
                  className="w-full text-xs h-9 px-3 rounded-xl border border-primary-light bg-surface text-text-primary mt-1 focus:bg-white"
                >
                  <option value="edukasi">1. Materi Edukasi</option>
                  <option value="services">2. Katalog Layanan</option>
                  <option value="regulasi">3. Regulasi DJP</option>
                  <option value="kurs">4. Kurs Pajak KMK</option>
                  <option value="karir">5. Lowongan Karir</option>
                  <option value="faqs">6. FAQ Chatbot</option>
                </select>
              </div>

              {/* DYNAMIC FORM 1: EDUKASI */}
              {modalSection === "edukasi" && (
                <>
                  <div>
                    <Label className="font-semibold text-primary">Judul Artikel / Modul *</Label>
                    <Input
                      type="text"
                      required
                      placeholder="e.g. Panduan Integrasi Coretax DJP 2026"
                      value={eduForm.title}
                      onChange={(e) => setEduForm((prev) => ({ ...prev, title: e.target.value }))}
                      className="text-xs h-9 mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="font-semibold text-primary">Kategori Topik *</Label>
                      <Input
                        type="text"
                        required
                        placeholder="e.g. Coretax DJP"
                        value={eduForm.category}
                        onChange={(e) => setEduForm((prev) => ({ ...prev, category: e.target.value }))}
                        className="text-xs h-9 mt-1"
                      />
                    </div>
                    <div>
                      <Label className="font-semibold text-primary">Tipe Konten *</Label>
                      <select
                        value={eduForm.content_type}
                        onChange={(e) =>
                          setEduForm((prev) => ({ ...prev, content_type: e.target.value as "ARTICLE" | "GUIDE" }))
                        }
                        className="w-full text-xs h-9 px-3 rounded-xl border border-primary-light bg-surface text-text-primary mt-1"
                      >
                        <option value="ARTICLE">Artikel Wawasan</option>
                        <option value="GUIDE">Buku Panduan / Guide</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label className="font-semibold text-primary">Isi Materi Lengkap *</Label>
                    <Textarea
                      required
                      rows={4}
                      placeholder="Uraikan materi panduan perpajakan..."
                      value={eduForm.body}
                      onChange={(e) => setEduForm((prev) => ({ ...prev, body: e.target.value }))}
                      className="text-xs mt-1"
                    />
                  </div>
                  <div>
                    <Label className="font-semibold text-primary">Path Berkas PDF (Opsional)</Label>
                    <Input
                      type="text"
                      placeholder="e.g. /docs/panduan-coretax.pdf"
                      value={eduForm.file_path}
                      onChange={(e) => setEduForm((prev) => ({ ...prev, file_path: e.target.value }))}
                      className="text-xs h-9 mt-1"
                    />
                  </div>
                </>
              )}

              {/* DYNAMIC FORM 2: SERVICES */}
              {modalSection === "services" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="font-semibold text-primary">Kode Layanan (Opsional)</Label>
                      <Input
                        type="text"
                        placeholder="e.g. TAX-CMPL"
                        value={serviceForm.service_code}
                        onChange={(e) => setServiceForm((prev) => ({ ...prev, service_code: e.target.value }))}
                        className="text-xs h-9 mt-1"
                      />
                    </div>
                    <div>
                      <Label className="font-semibold text-primary">Kategori Layanan *</Label>
                      <Input
                        type="text"
                        required
                        placeholder="e.g. TAX, ACCOUNTING, LEGAL"
                        value={serviceForm.category}
                        onChange={(e) => setServiceForm((prev) => ({ ...prev, category: e.target.value }))}
                        className="text-xs h-9 mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="font-semibold text-primary">Nama Layanan Bisnis *</Label>
                    <Input
                      type="text"
                      required
                      placeholder="e.g. Asistensi Pemeriksaan Pajak & SP2DK"
                      value={serviceForm.service_name}
                      onChange={(e) => setServiceForm((prev) => ({ ...prev, service_name: e.target.value }))}
                      className="text-xs h-9 mt-1"
                    />
                  </div>
                  <div>
                    <Label className="font-semibold text-primary">Deskripsi Layanan *</Label>
                    <Textarea
                      required
                      rows={3}
                      placeholder="Jelaskan ruang lingkup layanan konsultasi ini..."
                      value={serviceForm.description}
                      onChange={(e) => setServiceForm((prev) => ({ ...prev, description: e.target.value }))}
                      className="text-xs mt-1"
                    />
                  </div>
                </>
              )}

              {/* DYNAMIC FORM 3: REGULASI */}
              {modalSection === "regulasi" && (
                <>
                  <div>
                    <Label className="font-semibold text-primary">Nomor &amp; Judul Regulasi *</Label>
                    <Input
                      type="text"
                      required
                      placeholder="e.g. PMK Nomor 168 Tahun 2023 tentang Petunjuk Teknis PPh 21"
                      value={regForm.title}
                      onChange={(e) => setRegForm((prev) => ({ ...prev, title: e.target.value }))}
                      className="text-xs h-9 mt-1"
                    />
                  </div>
                  <div>
                    <Label className="font-semibold text-primary">Tipe Regulasi *</Label>
                    <select
                      value={regForm.regulation_type}
                      onChange={(e) => setRegForm((prev) => ({ ...prev, regulation_type: e.target.value }))}
                      className="w-full text-xs h-9 px-3 rounded-xl border border-primary-light bg-surface text-text-primary mt-1"
                    >
                      <option value="PMK">Peraturan Menteri Keuangan (PMK)</option>
                      <option value="PER">Peraturan Direktur Jenderal Pajak (PER)</option>
                      <option value="PP">Peraturan Pemerintah (PP)</option>
                      <option value="UU">Undang-Undang (UU)</option>
                      <option value="SE">Surat Edaran Dirjen Pajak (SE)</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="font-semibold text-primary">File Path / URL Berkas *</Label>
                      <Input
                        type="text"
                        required
                        placeholder="/docs/pmk-168-2023.pdf"
                        value={regForm.file_path}
                        onChange={(e) => setRegForm((prev) => ({ ...prev, file_path: e.target.value }))}
                        className="text-xs h-9 mt-1"
                      />
                    </div>
                    <div>
                      <Label className="font-semibold text-primary">Ukuran File</Label>
                      <Input
                        type="text"
                        placeholder="e.g. 2.4 MB"
                        value={regForm.file_size}
                        onChange={(e) => setRegForm((prev) => ({ ...prev, file_size: e.target.value }))}
                        className="text-xs h-9 mt-1"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* DYNAMIC FORM 4: KURS */}
              {modalSection === "kurs" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="font-semibold text-primary">Kode Valas (3 Huruf) *</Label>
                      <Input
                        type="text"
                        required
                        maxLength={3}
                        placeholder="USD"
                        value={kursForm.currency_code}
                        onChange={(e) =>
                          setSingleKursForm((prev) => ({ ...prev, currency_code: e.target.value.toUpperCase() }))
                        }
                        className="text-xs h-9 mt-1 uppercase font-mono"
                      />
                    </div>
                    <div>
                      <Label className="font-semibold text-primary">Nilai Kurs (Rupiah) *</Label>
                      <Input
                        type="number"
                        required
                        placeholder="15890"
                        value={kursForm.rate_value}
                        onChange={(e) =>
                          setSingleKursForm((prev) => ({ ...prev, rate_value: Number(e.target.value) }))
                        }
                        className="text-xs h-9 mt-1"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="font-semibold text-primary">Mulai Berlaku *</Label>
                      <Input
                        type="date"
                        required
                        value={kursForm.effective_start_date}
                        onChange={(e) =>
                          setSingleKursForm((prev) => ({ ...prev, effective_start_date: e.target.value }))
                        }
                        className="text-xs h-9 mt-1"
                      />
                    </div>
                    <div>
                      <Label className="font-semibold text-primary">Berakhir Berlaku *</Label>
                      <Input
                        type="date"
                        required
                        value={kursForm.effective_end_date}
                        onChange={(e) =>
                          setSingleKursForm((prev) => ({ ...prev, effective_end_date: e.target.value }))
                        }
                        className="text-xs h-9 mt-1"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* DYNAMIC FORM 5: KARIR */}
              {modalSection === "karir" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="font-semibold text-primary">Kode Lowongan (Opsional)</Label>
                      <Input
                        type="text"
                        placeholder="e.g. TAX-SR-01"
                        value={careerForm.position_code}
                        onChange={(e) => setCareerForm((prev) => ({ ...prev, position_code: e.target.value }))}
                        className="text-xs h-9 mt-1"
                      />
                    </div>
                    <div>
                      <Label className="font-semibold text-primary">Tingkat / Level *</Label>
                      <select
                        value={careerForm.level}
                        onChange={(e) => setCareerForm((prev) => ({ ...prev, level: e.target.value }))}
                        className="w-full text-xs h-9 px-3 rounded-xl border border-primary-light bg-surface text-text-primary mt-1"
                      >
                        <option value="Internship">Internship</option>
                        <option value="Junior Associate">Junior Associate</option>
                        <option value="Associate">Associate</option>
                        <option value="Senior Associate">Senior Associate</option>
                        <option value="Manager">Manager</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label className="font-semibold text-primary">Nama Posisi Karir *</Label>
                    <Input
                      type="text"
                      required
                      placeholder="e.g. Senior Tax Consultant (BKP Level B)"
                      value={careerForm.position_title}
                      onChange={(e) => setCareerForm((prev) => ({ ...prev, position_title: e.target.value }))}
                      className="text-xs h-9 mt-1"
                    />
                  </div>
                  <div>
                    <Label className="font-semibold text-primary">Lokasi Kerja *</Label>
                    <Input
                      type="text"
                      required
                      placeholder="e.g. SCBD Jakarta Selatan (Hybrid)"
                      value={careerForm.location}
                      onChange={(e) => setCareerForm((prev) => ({ ...prev, location: e.target.value }))}
                      className="text-xs h-9 mt-1"
                    />
                  </div>
                  <div>
                    <Label className="font-semibold text-primary">Uraian Kebutuhan &amp; Kualifikasi *</Label>
                    <Textarea
                      required
                      rows={3}
                      placeholder="Uraikan kualifikasi dan tanggung jawab..."
                      value={careerForm.description}
                      onChange={(e) => setCareerForm((prev) => ({ ...prev, description: e.target.value }))}
                      className="text-xs mt-1"
                    />
                  </div>
                </>
              )}

              {/* DYNAMIC FORM 6: FAQS */}
              {modalSection === "faqs" && (
                <>
                  <div className="space-y-1.5">
                    <Label className="font-semibold text-primary">Kategori Topik Pertanyaan *</Label>
                    <Input
                      type="text"
                      required
                      placeholder="e.g. Layanan Perpajakan"
                      value={faqForm.category}
                      onChange={(e) => setFaqForm((prev) => ({ ...prev, category: e.target.value }))}
                      className="text-xs h-9"
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
                          className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors cursor-pointer ${
                            faqForm.category === cat
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
                    <Label className="font-semibold text-primary">Pertanyaan Pengguna / Pertanyaan Umum *</Label>
                    <Input
                      type="text"
                      required
                      placeholder="e.g. Bagaimana tahapan konsultasi dan penelaahan dokumen pajak?"
                      value={faqForm.question}
                      onChange={(e) => setFaqForm((prev) => ({ ...prev, question: e.target.value }))}
                      className="text-xs h-9 mt-1"
                    />
                    <p className="text-[10px] text-text-muted mt-1">
                      Pertanyaan ini akan muncul sebagai tombol pilihan bagi klien di menu Chatbot Bantuan.
                    </p>
                  </div>
                  <div>
                    <Label className="font-semibold text-primary">Template Jawaban Otomatis Chatbot *</Label>
                    <Textarea
                      required
                      rows={4}
                      placeholder="Tuliskan jawaban panduan otomatis yang akan langsung dikirimkan oleh bot..."
                      value={faqForm.answer_template}
                      onChange={(e) => setFaqForm((prev) => ({ ...prev, answer_template: e.target.value }))}
                      className="text-xs mt-1 leading-relaxed"
                    />
                    <p className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1 font-medium">
                      <span>✓</span>
                      <span>Bot akan langsung menjawab dengan teks di atas secara instan tanpa menunggu respon manual admin.</span>
                    </p>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-primary-light">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-xs h-8 cursor-pointer"
                >
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="sm" className="text-xs h-8 font-semibold cursor-pointer">
                  {editingFaq && modalSection === "faqs" ? "Simpan Perubahan FAQ" : "Simpan ke Database"}
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
                <Label className="font-semibold text-text-secondary">Headline Utama *</Label>
                <Input
                  type="text"
                  value={heroForm.headline}
                  onChange={(e) => setHeroForm((prev) => ({ ...prev, headline: e.target.value }))}
                  className="text-xs h-9 mt-1"
                  required
                />
              </div>
              <div>
                <Label className="font-semibold text-text-secondary">Sub-headline / Deskripsi Ringkas *</Label>
                <Textarea
                  value={heroForm.subheadline}
                  onChange={(e) => setHeroForm((prev) => ({ ...prev, subheadline: e.target.value }))}
                  rows={3}
                  className="text-xs mt-1"
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
                <Label className="font-semibold text-text-secondary">Nama Perusahaan *</Label>
                <Input
                  type="text"
                  value={contactForm.companyName}
                  onChange={(e) => setContactForm((prev) => ({ ...prev, companyName: e.target.value }))}
                  className="text-xs h-9 mt-1"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="font-semibold text-text-secondary">Email Resmi *</Label>
                  <Input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="text-xs h-9 mt-1"
                    required
                  />
                </div>
                <div>
                  <Label className="font-semibold text-text-secondary">Telepon Kantor *</Label>
                  <Input
                    type="text"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm((prev) => ({ ...prev, phone: e.target.value }))}
                    className="text-xs h-9 mt-1"
                    required
                  />
                </div>
              </div>
              <div>
                <Label className="font-semibold text-text-secondary">WhatsApp CS Hotline *</Label>
                <Input
                  type="text"
                  value={contactForm.whatsapp}
                  onChange={(e) => setContactForm((prev) => ({ ...prev, whatsapp: e.target.value }))}
                  className="text-xs h-9 mt-1"
                  required
                />
              </div>
              <div>
                <Label className="font-semibold text-text-secondary">Alamat Kantor Resmi *</Label>
                <Textarea
                  value={contactForm.address}
                  onChange={(e) => setContactForm((prev) => ({ ...prev, address: e.target.value }))}
                  rows={2}
                  className="text-xs mt-1"
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

      {/* MODAL 4: BATCH KURS VALAS KMK */}
      {isBatchKursModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-primary-light max-w-2xl w-full p-6 space-y-4 relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsBatchKursModalOpen(false)}
              className="absolute top-5 right-5 text-text-secondary hover:text-primary p-1 cursor-pointer"
            >
              <CloseIcon className="text-sm" />
            </button>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                Pembaruan Kurs Valuta Asing
              </span>
              <h3 className="text-base font-bold text-primary mt-0.5">Kelola Batch 7 Kurs Valas KMK</h3>
            </div>
            <form onSubmit={handleSaveBatchKurs} className="space-y-4 text-xs">
              <div>
                <Label className="text-xs font-semibold text-primary">Nomor Keputusan Menteri Keuangan (KMK)</Label>
                <Input
                  type="text"
                  value={kmkNumber}
                  onChange={(e) => setKmkNumber(e.target.value)}
                  className="text-xs h-9 mt-1"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {kursRates.map((kr, idx) => (
                  <div key={kr.currency} className="p-3 rounded-xl border border-primary-light bg-surface space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-primary flex items-center gap-1.5">
                        <span>{kr.flag}</span>
                        <span>{kr.currency}</span>
                      </span>
                      <span className="text-[10px] text-text-muted">{kr.name}</span>
                    </div>
                    <Input
                      type="text"
                      value={kr.rate}
                      onChange={(e) => {
                        const next = [...kursRates];
                        next[idx].rate = e.target.value;
                        setKursRates(next);
                      }}
                      className="text-xs h-8 bg-white"
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-primary-light">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBatchKursModalOpen(false)}
                  className="text-xs h-8 cursor-pointer"
                >
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="sm" className="text-xs h-8 font-semibold cursor-pointer">
                  Simpan Seluruh 7 Kurs ke Database
                </Button>
              </div>
            </form>
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
