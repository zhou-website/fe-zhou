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
  id: string; // e.g. "EDU-1", "SVC-2"
  numericId: number;
  section: "edukasi" | "services" | "regulasi" | "kurs" | "karir" | "faqs";
  title: string;
  category: string;
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

function AdminCMSPageContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as CMSTab;
  const [activeTab, setActiveTab] = useState<CMSTab>(
    tabParam && ["all", "edukasi", "services", "regulasi", "kurs", "karir", "applications", "faqs", "kontak"].includes(tabParam)
      ? tabParam
      : "all"
  );

  useEffect(() => {
    if (tabParam && tabParam !== activeTab) {
      if (["all", "edukasi", "services", "regulasi", "kurs", "karir", "applications", "faqs", "kontak"].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }
  }, [tabParam, activeTab]);

  const [cmsItems, setCmsItems] = useState<UnifiedCMSItem[]>([]);
  const [applications, setApplications] = useState<JobApplicationItem[]>([]);
  const [faqs, setFaqs] = useState<ChatbotFaqItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Profile & Contact Settings Form State (Exact backend schema)
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
    category: "Perpajakan",
    question: "",
    answer_template: "",
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load all backend resources
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

      // 1. Education
      if (eduRes.status === "fulfilled" && Array.isArray(eduRes.value.data)) {
        eduRes.value.data.forEach((e: PublicEducationItem) => {
          items.push({
            id: `EDU-${e.id}`,
            numericId: e.id,
            section: "edukasi",
            title: e.title,
            category: e.category,
            summary: e.body ? e.body.slice(0, 140) + "..." : "Artikel edukasi perpajakan",
            status: "Published",
            updatedAt: e.created_at ? new Date(e.created_at).toLocaleDateString("id-ID") : "Terbaru",
            raw: e,
          });
        });
      }

      // 2. Services
      if (srvRes.status === "fulfilled" && Array.isArray(srvRes.value.data)) {
        srvRes.value.data.forEach((s: PublicServiceItem) => {
          items.push({
            id: `SVC-${s.id}`,
            numericId: s.id,
            section: "services",
            title: s.service_name,
            category: s.category || "Layanan",
            summary: s.description || "Layanan konsultasi resmi",
            status: s.is_active ? "Published" : "Draft",
            updatedAt: "Aktif",
            raw: s,
          });
        });
      }

      // 3. Regulations
      if (regRes.status === "fulfilled" && Array.isArray(regRes.value.data)) {
        regRes.value.data.forEach((r: PublicRegulationItem) => {
          items.push({
            id: `REG-${r.id}`,
            numericId: r.id,
            section: "regulasi",
            title: r.title,
            category: r.regulation_type,
            summary: `Berkas: ${r.file_path} (${r.file_size || "PDF"})`,
            status: "Published",
            updatedAt: r.created_at ? new Date(r.created_at).toLocaleDateString("id-ID") : "Terbaru",
            raw: r,
          });
        });
      }

      // 4. Tax rates
      if (rateRes.status === "fulfilled" && Array.isArray(rateRes.value.data)) {
        rateRes.value.data.forEach((t: PublicTaxRateItem) => {
          items.push({
            id: `TAX-${t.id}`,
            numericId: t.id,
            section: "kurs",
            title: `Kurs Valas ${t.currency_code}: Rp ${Number(t.rate_value).toLocaleString("id-ID")}`,
            category: "Kurs KMK",
            summary: `Berlaku: ${t.effective_start_date ? new Date(t.effective_start_date).toLocaleDateString("id-ID") : "-"} s/d ${t.effective_end_date ? new Date(t.effective_end_date).toLocaleDateString("id-ID") : "Seterusnya"}`,
            status: "Published",
            updatedAt: "KMK Aktif",
            raw: t,
          });
        });
      }

      // 5. Careers
      if (carRes.status === "fulfilled" && Array.isArray(carRes.value.data)) {
        carRes.value.data.forEach((c: PublicCareerItem) => {
          items.push({
            id: `CAR-${c.id}`,
            numericId: c.id,
            section: "karir",
            title: c.position_title,
            category: `${c.level} - ${c.location}`,
            summary: c.description || "Lowongan karir aktif di Zhou Consulting",
            status: c.is_active ? "Published" : "Draft",
            updatedAt: "Rekrutmen Buka",
            raw: c,
          });
        });
      }

      // 6. Job Applications
      if (appRes.status === "fulfilled" && Array.isArray(appRes.value.data)) {
        setApplications(appRes.value.data);
      }

      // 7. FAQs
      if (faqRes.status === "fulfilled" && Array.isArray(faqRes.value.data)) {
        setFaqs(faqRes.value.data);
        faqRes.value.data.forEach((f: ChatbotFaqItem) => {
          items.push({
            id: `FAQ-${f.id}`,
            numericId: f.id,
            section: "faqs",
            title: f.question,
            category: f.category,
            summary: f.answer_template.slice(0, 140) + "...",
            status: "Published",
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

      setCmsItems(items);
    } catch (err) {
      console.warn("Gagal sinkronisasi CMS dengan backend:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllCMS();
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
      showToast(`Konten "${item.title.slice(0, 30)}..." berhasil dihapus dari database.`);
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

  // CREATE ITEM Form Submission (Strict backend payload)
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
              category: eduForm.category,
              summary: eduForm.body.slice(0, 140) + "...",
              status: "Published",
              updatedAt: "Baru saja",
            },
            ...prev,
          ]);
        }
      } else if (modalSection === "services") {
        const code = serviceForm.service_code || `SVC-${Date.now().toString().slice(-4)}`;
        const res = await adminCmsApi.createService({
          service_code: code,
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
              category: serviceForm.category,
              summary: serviceForm.description,
              status: serviceForm.is_active ? "Published" : "Draft",
              updatedAt: "Baru saja",
            },
            ...prev,
          ]);
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
              category: regForm.regulation_type,
              summary: `Berkas: ${regForm.file_path} (${regForm.file_size})`,
              status: "Published",
              updatedAt: "Baru saja",
            },
            ...prev,
          ]);
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
              summary: `Berlaku: ${kursForm.effective_start_date} s/d ${kursForm.effective_end_date}`,
              status: "Published",
              updatedAt: "Baru saja",
            },
            ...prev,
          ]);
        }
      } else if (modalSection === "karir") {
        const code = careerForm.position_code || `CAR-${Date.now().toString().slice(-4)}`;
        const res = await adminCmsApi.createCareer({
          position_code: code,
          position_title: careerForm.position_title,
          level: careerForm.level,
          location: careerForm.location,
          description: careerForm.description,
          is_active: careerForm.is_active,
        });
        showToast("Lowongan karir berhasil dibuka!");
        if (res.data && (res.data as Record<string, unknown>).id) {
          const id = Number((res.data as Record<string, unknown>).id);
          setCmsItems((prev) => [
            {
              id: `CAR-${id}`,
              numericId: id,
              section: "karir",
              title: careerForm.position_title,
              category: `${careerForm.level} - ${careerForm.location}`,
              summary: careerForm.description,
              status: careerForm.is_active ? "Published" : "Draft",
              updatedAt: "Baru saja",
            },
            ...prev,
          ]);
        }
      } else if (modalSection === "faqs") {
        const res = await adminCmsApi.createFaq({
          category: faqForm.category,
          question: faqForm.question,
          answer_template: faqForm.answer_template,
        });
        showToast("FAQ chatbot berhasil disimpan!");
        if (res.data && (res.data as Record<string, unknown>).id) {
          const id = Number((res.data as Record<string, unknown>).id);
          setFaqs((prev) => [
            ...prev,
            { id, category: faqForm.category, question: faqForm.question, answer_template: faqForm.answer_template },
          ]);
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
      showToast("Headline Hero Landing Page berhasil diperbarui ke database!");
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
      showToast("Informasi kontak & WhatsApp CS berhasil disimpan!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal memperbarui kontak";
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan kurs";
      showToast(msg);
    }
  };

  const openAddModal = (sec: "edukasi" | "services" | "regulasi" | "kurs" | "karir" | "faqs") => {
    setModalSection(sec);
    setIsAddModalOpen(true);
  };

  const filteredItems = useMemo(() => {
    return cmsItems.filter((item) => {
      const matchesSection = activeTab === "all" || item.section === activeTab;
      const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q);
      return matchesSection && matchesStatus && matchesSearch;
    });
  }, [cmsItems, activeTab, statusFilter, searchQuery]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0B1533] text-white px-5 py-3 rounded-xl shadow-xl border border-primary-light flex items-center gap-3 text-xs animate-in fade-in">
          <CheckCircleIcon className="text-success text-sm shrink-0" />
          <span>{toastMessage}</span>
          <button type="button" onClick={() => setToastMessage(null)} className="text-silver hover:text-white ml-2 p-1">
            <CloseIcon className="text-xs" />
          </button>
        </div>
      )}

      {/* Main Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-primary-light">
        <div>
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
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Satu pintu kelola seluruh publikasi landing page dan portal publik: Edukasi, Layanan, Regulasi, Kurs KMK, Karir, FAQ Bot, dan Profil.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() =>
              openAddModal(
                activeTab === "all" || activeTab === "applications" || activeTab === "kontak"
                  ? "edukasi"
                  : activeTab
              )
            }
            className="text-xs font-semibold h-9 px-4 shadow-sm"
          >
            Tambah Konten Baru
          </Button>
        </div>
      </div>

      {/* UNIFIED TAB NAVIGATION */}
      <div className="border-b border-primary-light flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 text-xs font-semibold">
        {[
          { id: "all", label: `Semua Konten (${cmsItems.length})` },
          { id: "edukasi", label: `Edukasi (${cmsItems.filter((i) => i.section === "edukasi").length})` },
          { id: "services", label: `Layanan (${cmsItems.filter((i) => i.section === "services").length})` },
          { id: "regulasi", label: `Regulasi DJP (${cmsItems.filter((i) => i.section === "regulasi").length})` },
          { id: "kurs", label: "Kurs Pajak KMK" },
          { id: "karir", label: `Karir (${cmsItems.filter((i) => i.section === "karir").length})` },
          { id: "applications", label: `Lamaran Masuk (${applications.length})`, highlight: "bg-blue-600 text-white" },
          { id: "faqs", label: `FAQ Chatbot (${faqs.length})` },
          { id: "kontak", label: "Profil & Kontak Resmi" },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as CMSTab)}
              className={`px-3.5 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
                isActive
                  ? tab.highlight || "bg-primary text-white shadow-xs font-bold"
                  : "bg-white text-text-secondary hover:text-primary hover:bg-surface border border-primary-light"
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT 1: ALL / EDUKASI / SERVICES / REGULASI / KARIR TABLE */}
      {["all", "edukasi", "services", "regulasi", "karir"].includes(activeTab) && (
        <Card className="rounded-2xl border-primary-light bg-white p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-primary">
                {activeTab === "all"
                  ? "Direktori Master Konten Terbit"
                  : activeTab === "edukasi"
                  ? "Manajemen Materi Edukasi Pajak"
                  : activeTab === "services"
                  ? "Katalog Layanan Bisnis & Perpajakan"
                  : activeTab === "regulasi"
                  ? "Pusat Regulasi & Berkas DJP"
                  : "Daftar Lowongan Karir"}
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Kelola status publikasi, sunting isi, atau hapus konten langsung dari database backend.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-2.5 text-text-muted text-xs" />
                <Input
                  type="text"
                  placeholder="Cari judul atau ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 text-xs h-9 w-44 sm:w-56 bg-surface border-primary-light"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs h-9 px-3 rounded-xl border border-primary-light bg-surface text-text-primary focus:bg-white font-medium focus:outline-none"
              >
                <option value="ALL">Semua Status</option>
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-primary-light">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface text-text-muted font-bold uppercase text-[10px] tracking-wider border-b border-primary-light">
                <tr>
                  <th className="py-3 px-4">ID &amp; Judul</th>
                  <th className="py-3 px-4">Modul / Kategori</th>
                  <th className="py-3 px-4">Ringkasan Isi</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-light">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-surface/50 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-primary">
                      <span className="font-mono text-[10px] text-text-muted block">{item.id}</span>
                      <span className="font-semibold text-xs text-primary">{item.title}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-primary-light text-primary font-medium">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-text-secondary text-[11px] max-w-xs truncate">
                      {item.summary}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={item.status === "Published" ? "success" : "silver"}
                        size="sm"
                      >
                        {item.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      {["services", "karir"].includes(item.section) && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(item)}
                          className="text-[11px] h-7 px-2.5"
                        >
                          {item.status === "Published" ? "Draftkan" : "Publikasikan"}
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteItem(item)}
                        className="text-[11px] h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      >
                        <TrashIcon className="text-xs" />
                      </Button>
                    </td>
                  </tr>
                ))}

                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-text-secondary text-xs">
                      {isLoading ? "Sedang memuat data dari database..." : "Tidak ada konten yang cocok dengan pencarian."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB CONTENT 2: KURS PAJAK KMK */}
      {activeTab === "kurs" && (
        <Card className="rounded-2xl border-primary-light bg-white p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-primary-light">
            <div>
              <h2 className="text-base font-bold text-primary">Tabel Kurs Pajak KMK Mingguan</h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Perbarui nilai kurs valas untuk 7 mata uang asing utama yang tertera di widget kurs landing page.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => openAddModal("kurs")}
              className="text-xs h-9 px-3.5"
            >
              Tambah Kurs Tunggal
            </Button>
          </div>

          <form onSubmit={handleSaveBatchKurs} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {kursRates.map((kr, idx) => (
                <div key={kr.currency} className="p-3.5 rounded-xl border border-primary-light bg-surface space-y-1.5">
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

            <div className="pt-2">
              <Button type="submit" variant="primary" size="sm" className="h-9 px-5 text-xs font-semibold">
                Simpan Seluruh 7 Kurs ke Database
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* TAB CONTENT 3: LAMARAN MASUK */}
      {activeTab === "applications" && (
        <Card className="rounded-2xl border-primary-light bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-primary">Daftar Berkas Lamaran Masuk</h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Kandidat yang mendaftar melalui portal karir Zhou Consulting dan tersimpan di database backend.
              </p>
            </div>
            <div className="text-xs text-text-muted">Total: {applications.length} berkas</div>
          </div>

          <div className="space-y-3 text-xs">
            {applications.map((app) => (
              <div
                key={app.id}
                className="p-4 rounded-xl bg-surface border border-primary-light flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-text-muted">ID: #{app.id}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                      {app.job?.position_title || `Posisi ID #${app.job_id || app.career_id || "-"}`}
                    </span>
                    {app.applied_at && (
                      <span className="text-[10px] text-text-muted">
                        {new Date(app.applied_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-primary text-xs">{app.applicant_name}</h4>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-text-secondary">
                    <span>Email: <strong>{app.applicant_email}</strong></span>
                    <span>No. Telp: <strong>{app.applicant_phone || "-"}</strong></span>
                    {app.cv_file_path && (
                      <span>File CV: <strong className="font-mono text-primary">{app.cv_file_path}</strong></span>
                    )}
                  </div>
                </div>

                <a
                  href={
                    app.cv_file_path
                      ? `${process.env.NEXT_PUBLIC_API_URL || "https://43.173.2.162.sslip.io"}${app.cv_file_path}`
                      : "#"
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center px-3 h-8 text-xs font-medium rounded-xl border border-primary-light bg-white hover:bg-surface text-primary shrink-0"
                >
                  Buka Dokumen CV
                </a>
              </div>
            ))}

            {applications.length === 0 && (
              <div className="p-8 text-center text-text-secondary text-xs">
                Belum ada berkas lamaran kerja yang masuk ke backend.
              </div>
            )}
          </div>
        </Card>
      )}

      {/* TAB CONTENT 4: FAQ CHATBOT */}
      {activeTab === "faqs" && (
        <Card className="rounded-2xl border-primary-light bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-primary-light">
            <div>
              <h2 className="text-base font-bold text-primary">Basis Pengetahuan FAQ Chatbot AI</h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Kelola tanya-jawab otomatis yang disajikan kepada pengunjung situs oleh Chatbot Zhou.
              </p>
            </div>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => openAddModal("faqs")}
              className="text-xs h-8 px-3"
            >
              Tambah FAQ Bot
            </Button>
          </div>

          <div className="space-y-3 text-xs">
            {faqs.map((f) => (
              <div
                key={f.id}
                className="p-4 rounded-xl bg-surface border border-primary-light flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-text-muted">FAQ #{f.id}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-primary-light text-primary font-medium">
                      {f.category}
                    </span>
                  </div>
                  <h4 className="font-bold text-primary text-xs">{f.question}</h4>
                  <p className="text-[11px] text-text-secondary leading-relaxed">{f.answer_template}</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      await adminCmsApi.deleteFaq(f.id);
                      setFaqs((prev) => prev.filter((item) => item.id !== f.id));
                      showToast("FAQ berhasil dihapus.");
                    } catch {
                      showToast("Gagal menghapus FAQ.");
                    }
                  }}
                  className="text-xs h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 shrink-0"
                >
                  <TrashIcon className="text-xs" />
                </Button>
              </div>
            ))}

            {faqs.length === 0 && (
              <div className="p-8 text-center text-text-secondary text-xs">
                Belum ada data FAQ chatbot di database.
              </div>
            )}
          </div>
        </Card>
      )}

      {/* TAB CONTENT 5: PROFIL & KONTAK */}
      {activeTab === "kontak" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* HERO BANNER SETTINGS */}
          <Card className="rounded-2xl border-primary-light bg-white p-6 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-primary">Headline Hero Landing Page</h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Teks utama yang tampil di bagian paling atas beranda pengunjung (/hero).
              </p>
            </div>

            <form onSubmit={handleSaveHero} className="space-y-3.5 text-xs">
              <div>
                <Label className="font-semibold text-text-secondary">Headline Utama</Label>
                <Input
                  type="text"
                  value={heroForm.headline}
                  onChange={(e) => setHeroForm((prev) => ({ ...prev, headline: e.target.value }))}
                  className="text-xs h-9 mt-1"
                  required
                />
              </div>

              <div>
                <Label className="font-semibold text-text-secondary">Sub-headline / Deskripsi</Label>
                <Textarea
                  value={heroForm.subheadline}
                  onChange={(e) => setHeroForm((prev) => ({ ...prev, subheadline: e.target.value }))}
                  rows={3}
                  className="text-xs mt-1"
                  required
                />
              </div>

              <Button type="submit" variant="primary" size="sm" className="h-9 px-4 text-xs">
                Simpan Hero Banner
              </Button>
            </form>
          </Card>

          {/* CONTACT & CS SETTINGS */}
          <Card className="rounded-2xl border-primary-light bg-white p-6 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-primary">Kontak Resmi &amp; WhatsApp CS</h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Disinkronkan ke Footer, Floating WhatsApp CTA, dan Halaman Kontak (/kontak).
              </p>
            </div>

            <form onSubmit={handleSaveContact} className="space-y-3 text-xs">
              <div>
                <Label className="font-semibold text-text-secondary">Nama Perusahaan</Label>
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
                  <Label className="font-semibold text-text-secondary">Email Resmi</Label>
                  <Input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="text-xs h-9 mt-1"
                    required
                  />
                </div>
                <div>
                  <Label className="font-semibold text-text-secondary">Telepon Kantor</Label>
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
                <Label className="font-semibold text-text-secondary">Nomor WhatsApp Helpdesk</Label>
                <Input
                  type="text"
                  value={contactForm.whatsapp}
                  onChange={(e) => setContactForm((prev) => ({ ...prev, whatsapp: e.target.value }))}
                  className="text-xs h-9 mt-1"
                  required
                />
              </div>

              <div>
                <Label className="font-semibold text-text-secondary">Alamat Kantor Resmi</Label>
                <Textarea
                  value={contactForm.address}
                  onChange={(e) => setContactForm((prev) => ({ ...prev, address: e.target.value }))}
                  rows={2}
                  className="text-xs mt-1"
                  required
                />
              </div>

              <Button type="submit" variant="primary" size="sm" className="h-9 px-4 text-xs">
                Simpan Pengaturan Kontak
              </Button>
            </form>
          </Card>
        </div>
      )}

      {/* UNIFIED MODAL TAMBAH KONTEN (STRICT BACKEND SCHEMA) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-primary-light max-w-lg w-full p-6 space-y-4 relative max-h-[92vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 text-text-secondary hover:text-primary p-1"
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
                    setModalSection(
                      e.target.value as "edukasi" | "services" | "regulasi" | "kurs" | "karir" | "faqs"
                    )
                  }
                  className="w-full text-xs h-9 px-3 rounded-xl border border-primary-light bg-surface text-text-primary mt-1 focus:bg-white font-medium focus:outline-none"
                >
                  <option value="edukasi">1. Edukasi &amp; Panduan Pajak</option>
                  <option value="services">2. Layanan Bisnis &amp; Pajak</option>
                  <option value="regulasi">3. Regulasi &amp; Dokumen DJP</option>
                  <option value="kurs">4. Kurs Pajak KMK</option>
                  <option value="karir">5. Lowongan Karir</option>
                  <option value="faqs">6. FAQ Chatbot</option>
                </select>
              </div>

              {/* DYNAMIC FORM 1: EDUKASI */}
              {modalSection === "edukasi" && (
                <>
                  <div>
                    <Label className="font-semibold text-primary">Judul Materi Edukasi *</Label>
                    <Input
                      type="text"
                      required
                      placeholder="e.g. Panduan Kepatuhan Coretax 2026"
                      value={eduForm.title}
                      onChange={(e) => setEduForm((prev) => ({ ...prev, title: e.target.value }))}
                      className="text-xs h-9 mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="font-semibold text-primary">Kategori</Label>
                      <Input
                        type="text"
                        required
                        value={eduForm.category}
                        onChange={(e) => setEduForm((prev) => ({ ...prev, category: e.target.value }))}
                        className="text-xs h-9 mt-1"
                      />
                    </div>
                    <div>
                      <Label className="font-semibold text-primary">Tipe Konten</Label>
                      <select
                        value={eduForm.content_type}
                        onChange={(e) =>
                          setEduForm((prev) => ({
                            ...prev,
                            content_type: e.target.value as "ARTICLE" | "GUIDE",
                          }))
                        }
                        className="w-full text-xs h-9 px-3 rounded-xl border border-primary-light bg-surface mt-1"
                      >
                        <option value="ARTICLE">ARTICLE (Artikel Literasi)</option>
                        <option value="GUIDE">GUIDE (Panduan DJP)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label className="font-semibold text-primary">Isi / Uraian Materi *</Label>
                    <Textarea
                      required
                      rows={4}
                      placeholder="Tuliskan isi pembahasan edukasi pajak..."
                      value={eduForm.body}
                      onChange={(e) => setEduForm((prev) => ({ ...prev, body: e.target.value }))}
                      className="text-xs mt-1"
                    />
                  </div>
                  <div>
                    <Label className="font-semibold text-primary">Tautan / URL Berkas PDF (Opsional)</Label>
                    <Input
                      type="text"
                      placeholder="e.g. /docs/panduan.pdf atau https://pajak.go.id"
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
                      <Label className="font-semibold text-primary">Kode Layanan</Label>
                      <Input
                        type="text"
                        placeholder="e.g. TAX_CORE"
                        value={serviceForm.service_code}
                        onChange={(e) => setServiceForm((prev) => ({ ...prev, service_code: e.target.value }))}
                        className="text-xs h-9 mt-1"
                      />
                    </div>
                    <div>
                      <Label className="font-semibold text-primary">Kategori Divisi</Label>
                      <select
                        value={serviceForm.category}
                        onChange={(e) => setServiceForm((prev) => ({ ...prev, category: e.target.value }))}
                        className="w-full text-xs h-9 px-3 rounded-xl border border-primary-light bg-surface mt-1"
                      >
                        <option value="TAX">TAX (Perpajakan)</option>
                        <option value="ACCOUNTING">ACCOUNTING (Akuntansi)</option>
                        <option value="CONSULTING">CONSULTING (Advisory Bisnis)</option>
                        <option value="LEGAL">LEGAL (Hukum Perusahaan)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label className="font-semibold text-primary">Nama Layanan *</Label>
                    <Input
                      type="text"
                      required
                      placeholder="e.g. Tax Compliance & SPT Badan"
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
                      placeholder="Uraian ruang lingkup layanan konsultasi..."
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
                    <Label className="font-semibold text-primary">Judul Dokumen Regulasi *</Label>
                    <Input
                      type="text"
                      required
                      placeholder="e.g. UU No. 7 Tahun 2021 tentang Harmonisasi Peraturan Perpajakan"
                      value={regForm.title}
                      onChange={(e) => setRegForm((prev) => ({ ...prev, title: e.target.value }))}
                      className="text-xs h-9 mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="font-semibold text-primary">Tipe Regulasi</Label>
                      <Input
                        type="text"
                        required
                        value={regForm.regulation_type}
                        onChange={(e) => setRegForm((prev) => ({ ...prev, regulation_type: e.target.value }))}
                        className="text-xs h-9 mt-1"
                      />
                    </div>
                    <div>
                      <Label className="font-semibold text-primary">Ukuran Berkas</Label>
                      <Input
                        type="text"
                        value={regForm.file_size}
                        onChange={(e) => setRegForm((prev) => ({ ...prev, file_size: e.target.value }))}
                        className="text-xs h-9 mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="font-semibold text-primary">Path / Link Berkas PDF *</Label>
                    <Input
                      type="text"
                      required
                      value={regForm.file_path}
                      onChange={(e) => setRegForm((prev) => ({ ...prev, file_path: e.target.value }))}
                      className="text-xs h-9 mt-1"
                    />
                  </div>
                </>
              )}

              {/* DYNAMIC FORM 4: KURS */}
              {modalSection === "kurs" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="font-semibold text-primary">Kode Valuta</Label>
                      <Input
                        type="text"
                        required
                        value={kursForm.currency_code}
                        onChange={(e) => setSingleKursForm((prev) => ({ ...prev, currency_code: e.target.value }))}
                        className="text-xs h-9 mt-1"
                      />
                    </div>
                    <div>
                      <Label className="font-semibold text-primary">Nilai Kurs (Rupiah)</Label>
                      <Input
                        type="number"
                        required
                        value={kursForm.rate_value}
                        onChange={(e) => setSingleKursForm((prev) => ({ ...prev, rate_value: Number(e.target.value) }))}
                        className="text-xs h-9 mt-1"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="font-semibold text-primary">Tanggal Mulai Berlaku</Label>
                      <Input
                        type="date"
                        required
                        value={kursForm.effective_start_date}
                        onChange={(e) => setSingleKursForm((prev) => ({ ...prev, effective_start_date: e.target.value }))}
                        className="text-xs h-9 mt-1"
                      />
                    </div>
                    <div>
                      <Label className="font-semibold text-primary">Tanggal Berakhir (Opsional)</Label>
                      <Input
                        type="date"
                        value={kursForm.effective_end_date}
                        onChange={(e) => setSingleKursForm((prev) => ({ ...prev, effective_end_date: e.target.value }))}
                        className="text-xs h-9 mt-1"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* DYNAMIC FORM 5: KARIR */}
              {modalSection === "karir" && (
                <>
                  <div>
                    <Label className="font-semibold text-primary">Judul Posisi Pekerjaan *</Label>
                    <Input
                      type="text"
                      required
                      placeholder="e.g. Senior Tax Consultant BKP"
                      value={careerForm.position_title}
                      onChange={(e) => setCareerForm((prev) => ({ ...prev, position_title: e.target.value }))}
                      className="text-xs h-9 mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="font-semibold text-primary">Level Pengalaman</Label>
                      <Input
                        type="text"
                        required
                        value={careerForm.level}
                        onChange={(e) => setCareerForm((prev) => ({ ...prev, level: e.target.value }))}
                        className="text-xs h-9 mt-1"
                      />
                    </div>
                    <div>
                      <Label className="font-semibold text-primary">Lokasi Kerja</Label>
                      <Input
                        type="text"
                        required
                        value={careerForm.location}
                        onChange={(e) => setCareerForm((prev) => ({ ...prev, location: e.target.value }))}
                        className="text-xs h-9 mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="font-semibold text-primary">Uraian Kualifikasi &amp; Tanggung Jawab *</Label>
                    <Textarea
                      required
                      rows={3}
                      placeholder="Kualifikasi pendidikan, sertifikasi BKP, dan deskripsi tugas..."
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
                  <div>
                    <Label className="font-semibold text-primary">Kategori FAQ</Label>
                    <Input
                      type="text"
                      required
                      value={faqForm.category}
                      onChange={(e) => setFaqForm((prev) => ({ ...prev, category: e.target.value }))}
                      className="text-xs h-9 mt-1"
                    />
                  </div>
                  <div>
                    <Label className="font-semibold text-primary">Pertanyaan Pengguna *</Label>
                    <Input
                      type="text"
                      required
                      placeholder="e.g. Bagaimana tahapan pendaftaran Coretax bagi WP Badan?"
                      value={faqForm.question}
                      onChange={(e) => setFaqForm((prev) => ({ ...prev, question: e.target.value }))}
                      className="text-xs h-9 mt-1"
                    />
                  </div>
                  <div>
                    <Label className="font-semibold text-primary">Template Jawaban Chatbot *</Label>
                    <Textarea
                      required
                      rows={3}
                      placeholder="Tuliskan jawaban panduan otomatis yang akan dikirimkan oleh bot..."
                      value={faqForm.answer_template}
                      onChange={(e) => setFaqForm((prev) => ({ ...prev, answer_template: e.target.value }))}
                      className="text-xs mt-1"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-primary-light">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-xs h-8"
                >
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="sm" className="text-xs h-8 font-semibold">
                  Simpan ke Database
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
          Memuat Pusat Manajemen CMS...
        </div>
      }
    >
      <AdminCMSPageContent />
    </Suspense>
  );
}
