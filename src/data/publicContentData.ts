/**
 * Single Source of Truth for Public Website Content & Schemas
 * Managed via the Admin Dashboard (/dashboard/admin & /dashboard/admin/cms)
 * Corresponds directly to Figma Page 2 and PRD specifications.
 */

import {
  ZHOU_ARTICLES,
  BELAJAR_PAJAK_LINKS,
} from "./edukasiData";

// Content Status
export type ContentStatus = "Published" | "Draft" | "Archived";

// Public Page Categories
export type PublicSectionKey =
  | "homepage"
  | "company"
  | "services"
  | "regulations"
  | "kurs"
  | "education-zhou"
  | "education-gov"
  | "careers"
  | "contact"
  | "consultation";

// Master CMS Item interface
export interface PublicCMSItem {
  id: string;
  section: PublicSectionKey;
  sectionLabel: string;
  publicRoute: string;
  title: string;
  category: string;
  summary: string;
  status: ContentStatus;
  lastUpdated: string;
  editor: string;

  // Optional contextual fields
  headline?: string;
  subheadline?: string;
  ctaText?: string;
  ctaUrl?: string;
  metrics?: { label: string; value: string }[];
  content?: string[];
  points?: string[];
  takeaways?: string[];
  author?: string;
  readTime?: string;
  url?: string;
  institution?: "DJP" | "Kemenkeu";
  mediaType?: string;
  badge?: string;
  department?: string;
  jobType?: string;
  location?: string;
  qualifications?: string[];
  benefits?: string[];
  contactInfo?: {
    address?: string;
    email?: string;
    phone?: string;
    operatingHours?: string;
    whatsappDivision?: string;
  };
  fileSize?: string;
  effectiveDate?: string;
}

// 1. Homepage & Hero Section Content
export interface HomepageContent {
  headline: string;
  subheadline: string;
  tagline: string;
  primaryCtaText: string;
  primaryCtaUrl: string;
  secondaryCtaText: string;
  secondaryCtaUrl: string;
  metrics: { id: string; label: string; sub: string }[];
  boardroomCaption: string;
  status: ContentStatus;
  lastUpdated: string;
}

export const INITIAL_HOMEPAGE_CONTENT: HomepageContent = {
  headline: "Solusi Terintegrasi Akuntansi, Pajak & Tata Kelola Finansial Bisnis",
  subheadline:
    "Kami menghadirkan pendampingan pajak, keuangan, dan hukum terpadu untuk mendukung bisnis Anda. Melalui strategi menyeluruh, kami memitigasi risiko, memastikan kepatuhan hukum, dan mendorong pertumbuhan perusahaan secara berkelanjutan.",
  tagline: "Finance • Accounting • Tax Partner",
  primaryCtaText: "Konsultasikan Kebutuhan Bisnis",
  primaryCtaUrl: "/#kontak",
  secondaryCtaText: "Jelajahi Katalog Layanan",
  secondaryCtaUrl: "/#layanan",
  metrics: [
    { id: "m1", label: "Akuntansi Standar SAK", sub: "Kepatuhan SAK EP & IFRS" },
    { id: "m2", label: "Kepatuhan SPT & Coretax", sub: "Sistem Baru DJP 2026" },
    { id: "m3", label: "Asistensi Regulasi Fiskal", sub: "Mitigasi Risiko SP2DK" },
    { id: "m4", label: "Konsultan BKP & CA Berlisensi", sub: "Akreditasi Profesional" },
  ],
  boardroomCaption:
    "Rapat konsultasi strategis perpajakan & kepatuhan fiskal di MyRepublic Plaza, BSD Green Office Park, Tangerang.",
  status: "Published",
  lastUpdated: "18 Sep 2026",
};

// 2. Company Profile Content
export interface CompanyProfileContent {
  companyName: string;
  legalEntity: string;
  licenseNumber: string;
  profileStatement: string;
  vision: string;
  mission: string[];
  credibilityPoints: { title: string; description: string }[];
  leadership: { name: string; title: string; credential: string }[];
  status: ContentStatus;
  lastUpdated: string;
}

export const INITIAL_COMPANY_PROFILE: CompanyProfileContent = {
  companyName: "Zhou Consulting",
  legalEntity: "Zhou Consulting",
  licenseNumber: "BKP-2024-8891 / KEP-102/KM.1/2024",
  profileStatement:
    "Kami hadir untuk memastikan ekspansi bisnis Anda berjalan tanpa hambatan regulasi. Dengan memadukan analisis pajak, presisi akuntansi, dan perlindungan hukum, kami membangun benteng pertahanan bisnis yang kokoh sekaligus membuka peluang pertumbuhan baru bagi perusahaan Anda.",
  vision:
    "Menjadi firma konsultan pajak, akuntansi, dan hukum bisnis terpercaya di Indonesia yang memberikan solusi strategis, berintegritas tinggi, dan berkelanjutan.",
  mission: [
    "Memberikan pendampingan kepatuhan perpajakan yang presisi dan transparan sesuai regulasi nasional terkini.",
    "Menyusun pelaporan keuangan berstandar SAK EP dan IFRS yang akuntabel guna mendukung kelayakan pembiayaan.",
    "Melindungi kepentingan hukum korporasi melalui penelaahan kontrak komersial dan mitigasi sengketa bisnis.",
    "Memandu transformasi digital entitas bisnis dalam menghadapi implementasi sistem Coretax DJP.",
  ],
  credibilityPoints: [
    {
      title: "Lisensi BKP & CA Berizin Resmi",
      description: "Seluruh penugasan dipimpin oleh Konsultan Pajak Beregister (BKP) dan Akuntan Beregister Negara (CA).",
    },
    {
      title: "Kerahasiaan Data & Pakta NDA",
      description: "Jaminan perlindungan data klien berlandaskan UU PDP No. 27/2022 dan perjanjian kerahasiaan non-disclosure agreement.",
    },
    {
      title: "Respon Cepat & SLA Terukur",
      description: "Komitmen respon konsultasi awal dalam 1x24 jam kerja dengan pendampingan langsung oleh penanggung jawab penugasan.",
    },
  ],
  leadership: [
    { name: "Linda David, S.Ak., BKP", title: "Senior Tax Partner", credential: "BKP / IAI Member" },
    { name: "Tasya Anggraeni Firdaus, SE., Ak., CA", title: "Accounting & Audit Partner", credential: "Chartered Accountant (CA)" },
    { name: "Muhamad Dekhsa Afnan, SH., M.Kn.", title: "Legal & Corporate Secretary Partner", credential: "Advokat PERADI" },
  ],
  status: "Published",
  lastUpdated: "17 Sep 2026",
};

// 3. Services Content (4 Divisions)
export interface ServiceItemContent {
  id: string;
  categoryKey: "hukum" | "bisnis" | "akuntansi" | "tax-service";
  name: string;
  subtitle: string;
  route: string;
  leadConsultant: string;
  pillars: { title: string; description: string }[];
  workflow: string[];
  deliverables: string[];
  status: ContentStatus;
  lastUpdated: string;
}

export const INITIAL_SERVICES: ServiceItemContent[] = [];


// 4. Regulations Content
export interface RegulationContentItem {
  id: string;
  docNumber: string;
  title: string;
  category: "Undang-Undang" | "Peraturan Pemerintah" | "Peraturan Menteri" | "Peraturan DJP" | "Keputusan KMK";
  effectiveDate: string;
  scope: string;
  fileSize: string;
  downloadUrl?: string;
  status: ContentStatus;
  lastUpdated: string;
}

export const INITIAL_REGULATIONS: RegulationContentItem[] = [];

// 5. Tax Rates / Kurs Pajak KMK Content
export interface KmkRateItem {
  currency: string;
  name: string;
  rate: string;
  change: string;
  trend: "up" | "down" | "flat";
  flag: string;
}

export interface KmkRatesContent {
  kmkNumber: string;
  period: string;
  effectiveUntil: string;
  rates: KmkRateItem[];
  status: ContentStatus;
  lastUpdated: string;
}

export const INITIAL_KMK_RATES: KmkRatesContent = {
  kmkNumber: "-",
  period: "-",
  effectiveUntil: "-",
  rates: [],
  status: "Draft",
  lastUpdated: "-",
};

// 6. Careers Content
export interface CareerJobItem {
  id: string;
  title: string;
  department: string;
  deptKey: "tax" | "accounting" | "legal" | "business";
  type: string;
  location: string;
  experience: string;
  compensation: string;
  summary: string;
  responsibilities: string[];
  qualifications: string[];
  benefits: string[];
  skills: string[];
  status: ContentStatus;
  lastUpdated: string;
}

export const INITIAL_CAREERS: CareerJobItem[] = [];

// 7. Contact & Consultation Content
export interface ContactConsultationContent {
  officeName: string;
  address: string;
  floorBuilding: string;
  city: string;
  email: string;
  phone: string;
  operatingHours: string;
  transitAccess: string;
  whatsappHotlines: {
    division: string;
    personInCharge: string;
    number: string;
    badge: string;
  }[];
  consultationSlots: {
    session: string;
    time: string;
    quotaPerDay: number;
    format: "Tatap Muka & Daring";
  }[];
  status: ContentStatus;
  lastUpdated: string;
}

export const INITIAL_CONTACT_CONTENT: ContactConsultationContent = {
  officeName: "Zhou Consulting",
  address: "MyRepublic Plaza (d/h Green Office Park 6), Wing A, Lantai Dasar Zona 6, Jalan Grand Boulevard, BSD Green Office Park, Desa Sampora, Kecamatan Cisauk, Kabupaten Tangerang, Banten 15345",
  floorBuilding: "Wing A, Lantai Dasar Zona 6",
  city: "Kabupaten Tangerang, Banten 15345",
  email: "consultingzhou@gmail.com",
  phone: "-",
  operatingHours: "Senin – Jumat: 08:30 – 17:30 WIB",
  transitAccess: "Stasiun Cisauk / BSD Link Shuttle",
  whatsappHotlines: [],
  consultationSlots: [],
  status: "Published",
  lastUpdated: "Oktober 2026",
};

// Unified items mapping for master table in Admin Overview
export function buildInitialPublicCMSItems(): PublicCMSItem[] {
  const items: PublicCMSItem[] = [];
  return items;

  // Homepage item
  items.push({
    id: "PUB-HOME",
    section: "homepage",
    sectionLabel: "Beranda / Homepage",
    publicRoute: "/",
    title: INITIAL_HOMEPAGE_CONTENT.headline,
    category: "Hero Banner & Metrik",
    summary: INITIAL_HOMEPAGE_CONTENT.subheadline,
    status: INITIAL_HOMEPAGE_CONTENT.status,
    lastUpdated: INITIAL_HOMEPAGE_CONTENT.lastUpdated,
    editor: "Linda David, S.Ak., BKP",
  });

  // Company Profile item
  items.push({
    id: "PUB-ABOUT",
    section: "company",
    sectionLabel: "Profil Perusahaan",
    publicRoute: "/#profil",
    title: "Profil Korporat: Solusi Terpadu Pajak, Akuntansi & Hukum Bisnis",
    category: "Tentang Kami & Profil",
    summary: INITIAL_COMPANY_PROFILE.profileStatement,
    status: INITIAL_COMPANY_PROFILE.status,
    lastUpdated: INITIAL_COMPANY_PROFILE.lastUpdated,
    editor: "Muhamad Dekhsa Afnan, SH., M.Kn.",
  });

  // Services (4 items)
  INITIAL_SERVICES.forEach((srv) => {
    items.push({
      id: `PUB-${srv.id}`,
      section: "services",
      sectionLabel: `Layanan - ${srv.name}`,
      publicRoute: srv.route,
      title: srv.name,
      category: srv.categoryKey.toUpperCase(),
      summary: srv.subtitle,
      status: srv.status,
      lastUpdated: srv.lastUpdated,
      editor: srv.leadConsultant,
      points: srv.pillars.map((p) => p.title),
    });
  });

  // Regulations (5 items)
  INITIAL_REGULATIONS.forEach((reg) => {
    items.push({
      id: `PUB-${reg.id}`,
      section: "regulations",
      sectionLabel: "Pusat Regulasi",
      publicRoute: "/peraturan",
      title: `${reg.docNumber}: ${reg.title}`,
      category: reg.category,
      summary: reg.scope,
      status: reg.status,
      lastUpdated: reg.lastUpdated,
      editor: "Muhamad Dekhsa Afnan, SH., M.Kn.",
      fileSize: reg.fileSize,
      effectiveDate: reg.effectiveDate,
    });
  });

  // Kurs KMK item
  items.push({
    id: "PUB-KMK-38",
    section: "kurs",
    sectionLabel: "Kurs Pajak KMK Mingguan",
    publicRoute: "/peraturan#kurs-pajak",
    title: `Tabel Kurs Pajak ${INITIAL_KMK_RATES.kmkNumber} (7 Valuta Asing)`,
    category: "Kurs Pajak DJP",
    summary: `Tarif konversi resmi valuta asing periode ${INITIAL_KMK_RATES.period}.`,
    status: INITIAL_KMK_RATES.status,
    lastUpdated: INITIAL_KMK_RATES.lastUpdated,
    editor: "Linda David, S.Ak., BKP",
  });

  // Education Zhou Articles (5 items)
  ZHOU_ARTICLES.forEach((art) => {
    items.push({
      id: `PUB-ZHOU-${art.id.toUpperCase()}`,
      section: "education-zhou",
      sectionLabel: "Edukasi Zhou (Artikel)",
      publicRoute: "/edukasi",
      title: art.title,
      category: art.category,
      summary: art.summary,
      status: art.status || "Published",
      lastUpdated: art.date,
      editor: art.author,
      author: art.author,
      readTime: art.readTime,
      takeaways: art.takeaways,
      content: art.content,
    });
  });

  // Education Gov Links (8 items)
  BELAJAR_PAJAK_LINKS.forEach((gov) => {
    items.push({
      id: `PUB-GOV-${gov.id.toUpperCase()}`,
      section: "education-gov",
      sectionLabel: `Belajar Pajak (${gov.institution})`,
      publicRoute: "/belajar-pajak",
      title: gov.title,
      category: gov.institution === "DJP" ? "Direktorat Jenderal Pajak" : "Kementerian Keuangan RI",
      summary: gov.description,
      status: gov.status || "Published",
      lastUpdated: gov.updatedAt || "Terbaru",
      editor: gov.institutionName,
      url: gov.url,
      institution: gov.institution,
      mediaType: gov.type,
      badge: gov.badge,
      points: gov.highlights || [],
    });
  });

  // Careers (4 items)
  INITIAL_CAREERS.forEach((job) => {
    items.push({
      id: `PUB-${job.id.toUpperCase()}`,
      section: "careers",
      sectionLabel: "Karir & Rekrutmen",
      publicRoute: "/karir",
      title: job.title,
      category: job.department,
      summary: job.summary,
      status: job.status,
      lastUpdated: job.lastUpdated,
      editor: "HR & Talent Acquisition",
      department: job.department,
      jobType: job.type,
      location: job.location,
      qualifications: job.qualifications,
      benefits: job.benefits,
    });
  });

  // Contact item
  items.push({
    id: "PUB-CONTACT",
    section: "contact",
    sectionLabel: "Kontak & Operasional",
    publicRoute: "/kontak",
    title: `Kantor BSD & Saluran Komunikasi Resmi (${INITIAL_CONTACT_CONTENT.email})`,
    category: "Informasi Kantor & CS",
    summary: `${INITIAL_CONTACT_CONTENT.address}. Jam: ${INITIAL_CONTACT_CONTENT.operatingHours}`,
    status: INITIAL_CONTACT_CONTENT.status,
    lastUpdated: INITIAL_CONTACT_CONTENT.lastUpdated,
    editor: "Operasional MyRepublic Plaza BSD",
    contactInfo: {
      address: INITIAL_CONTACT_CONTENT.address,
      email: INITIAL_CONTACT_CONTENT.email,
      phone: INITIAL_CONTACT_CONTENT.phone,
      operatingHours: INITIAL_CONTACT_CONTENT.operatingHours,
    },
  });

  // Consultation Slots item
  items.push({
    id: "PUB-CONSULTATION-SLOTS",
    section: "consultation",
    sectionLabel: "Reservasi Konsultasi",
    publicRoute: "/konsultasi",
    title: "Jadwal Slot Sesi Konsultasi Terjadwal (4 Sesi Harian @90 Menit)",
    category: "Booking Engine",
    summary: "Format pertemuan tatap muka di Menara Sudirman atau daring via Google Meet dengan kuota 2 slot per sesi.",
    status: "Published",
    lastUpdated: "18 Sep 2026",
    editor: "Tim Konsultan BKP / CA",
  });

  return items;
}
