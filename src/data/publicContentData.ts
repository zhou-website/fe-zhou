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
    "Rapat konsultasi strategis perpajakan & kepatuhan fiskal di Menara Sudirman Kav. 21 Lt. 12, Jakarta Selatan.",
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
  legalEntity: "PT Zhou Konsultan Indonesia",
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

export const INITIAL_SERVICES: ServiceItemContent[] = [
  {
    id: "SRV-HUKUM",
    categoryKey: "hukum",
    name: "Konsultasi Hukum Korporat & Legal",
    subtitle: "Perlindungan hukum komprehensif untuk kontrak bisnis, perizinan OSS RBA, dan kepatuhan regulasi.",
    route: "/layanan/hukum",
    leadConsultant: "Muhamad Dekhsa Afnan, SH., M.Kn. (Advokat PERADI)",
    pillars: [
      { title: "Review & Drafting Kontrak Komersial", description: "Pemeriksaan klausul kontrak kerja sama, NDA, perjanjian sewa, dan pengadaan barang/jasa." },
      { title: "Perizinan Berusaha & Legalitas Korporat", description: "Pengurusan NIB, sertifikasi standar, izin operasional OSS RBA, dan perubahan AD/ART melalui AHU." },
      { title: "Pemeriksaan Kepatuhan Hukum (Legal Audit)", description: "Uji tuntas kepatuhan hukum perusahaan guna memitigasi risiko sengketa perdata maupun pidana bisnis." },
      { title: "Pendampingan Sengketa & Mediasi Bisnis", description: "Asistensi penyelesaian perselisihan komersial di luar pengadilan melalui jalur musyawarah mediasi." },
    ],
    workflow: [
      "Pemeriksaan dokumen awal & legal review",
      "Penyusunan telaah risiko hukum (Legal Opinion)",
      "Kompilasi berkas perbaikan klausul kontrak",
      "Penyerahan dokumen sah bertanda tangan advokat",
    ],
    deliverables: ["Legal Opinion Resmi", "Draft Kontrak Tervalidasi", "Notulensi Mediasi", "Surat Keterangan Kepatuhan Hukum"],
    status: "Published",
    lastUpdated: "16 Sep 2026",
  },
  {
    id: "SRV-BISNIS",
    categoryKey: "bisnis",
    name: "Konsultasi Finansial & Bisnis Strategis",
    subtitle: "Analisis kelayakan investasi, perencanaan arus kas, dan proyeksi keuangan untuk ekspansi bisnis.",
    route: "/layanan/bisnis",
    leadConsultant: "Linda David, S.Ak., BKP",
    pillars: [
      { title: "Studi Kelayakan Bisnis (Feasibility Study)", description: "Evaluasi kelayakan proyek baru, perhitungan NPV, IRR, Payback Period, dan analisis risiko operasional." },
      { title: "Pemodelan Finansial & Proyeksi Arus Kas", description: "Penyusunan anggaran belanja modal (CAPEX), proyeksi pendapatan, dan simulasi skenario sensitivitas." },
      { title: "Health Check Keuangan Korporat", description: "Diagnosis rasio likuiditas, solvabilitas, profitabilitas, dan efisiensi struktur modal kerja." },
      { title: "Valuasi Bisnis & Restrukturisasi Finansial", description: "Penilaian nilai wajar perusahaan untuk keperluan akuisisi, merger, atau suntikan modal investor." },
    ],
    workflow: [
      "Pengumpulan data historis keuangan 3 tahun",
      "Pemodelan proyeksi finansial 5 tahun ke depan",
      "Simulasi skenario sensitivitas (Best, Base, Worst)",
      "Penyusunan executive report & presentasi kelayakan",
    ],
    deliverables: ["Executive Feasibility Study Report", "Financial Model Workbook (.xlsx)", "Slide Presentasi Direksi", "Rekomendasi Struktur Modal"],
    status: "Published",
    lastUpdated: "15 Sep 2026",
  },
  {
    id: "SRV-AKUNTANSI",
    categoryKey: "akuntansi",
    name: "Accounting Services Standar SAK EP / IFRS",
    subtitle: "Penyusunan laporan keuangan komersial yang tertib, akurat, dan siap diaudit oleh KAP independen.",
    route: "/layanan/akuntansi",
    leadConsultant: "Tasya Anggraeni Firdaus, SE., Ak., CA",
    pillars: [
      { title: "Kompilasi Laporan Keuangan Standar SAK", description: "Penyusunan Neraca, Laba Rugi Komprehensif, Perubahan Ekuitas, Arus Kas, dan Catatan atas Laporan Keuangan (CALK)." },
      { title: "Pembukuan Rutin & Jurnal Penyesuaian", description: "Pencatatan mutasi transaksi harian, rekonsiliasi bank, kartu aktiva tetap, dan penyusunan buku besar." },
      { title: "Review & Restrukturisasi Bagan Akun (COA)", description: "Standardisasi Chart of Accounts sesuai industri untuk menghasilkan laporan manajerial yang relevan." },
      { title: "Pendampingan Audit Eksternal KAP", description: "Penyiapan berkas pendukung (audit package), konfirmasi saldo pihak ketiga, dan koordinasi dengan auditor independen." },
    ],
    workflow: [
      "Verifikasi bukti transaksi dan faktur komersial",
      "Posting jurnal buku besar dan rekonsiliasi kas/bank",
      "Penyusunan kertas kerja penutupan buku bulanan",
      "Penerbitan laporan keuangan standar SAK EP",
    ],
    deliverables: ["Laporan Keuangan SAK Lengkap (PDF)", "Kertas Kerja Trial Balance", "Rekonsiliasi Bank Bulanan", "Daftar Penyusutan Aset Tetap"],
    status: "Published",
    lastUpdated: "14 Sep 2026",
  },
  {
    id: "SRV-PAJAK",
    categoryKey: "tax-service",
    name: "Tax Services & Kepatuhan Coretax 2026",
    subtitle: "Pengelolaan kewajiban SPT Masa & Tahunan, administrasi e-Faktur/e-Bupot, dan mitigasi risiko SP2DK.",
    route: "/layanan/tax-service",
    leadConsultant: "Linda David, S.Ak., BKP",
    pillars: [
      { title: "Kepatuhan SPT Masa & Tahunan PPh/PPN", description: "Perhitungan, penyetoran, dan pelaporan SPT PPh 21, 23, 25, 4(2), PPN 1111, dan SPT Tahunan Badan 1771." },
      { title: "Administrasi e-Faktur & e-Bupot Unifikasi", description: "Penerbitan faktur pajak elektronik, approval faktur masukan, dan pembuatan bukti potong unifikasi terpadu." },
      { title: "Perencanaan Pajak Strategis (Tax Planning)", description: "Optimalisasi beban pajak secara legal berlandaskan UU Harmonisasi Peraturan Perpajakan (UU HPP)." },
      { title: "Asistensi SP2DK & Pendampingan Pemeriksaan", description: "Penyusunan kertas kerja ekualisasi dan surat klarifikasi resmi kepada Account Representative (AR) KPP." },
    ],
    workflow: [
      "Ekualisasi omzet komersial vs SPT Masa PPN",
      "Rekonsiliasi biaya gaji dan kredit pajak PPh 21/23",
      "Validasi kode billing SSP & penyetoran kas negara",
      "Pelaporan online dan penerbitan Bukti Penerimaan Elektronik (BPE)",
    ],
    deliverables: ["Bukti Penerimaan Elektronik (BPE) DJP", "Kertas Kerja Rekonsiliasi Fiskal", "Draft Sanggahan SP2DK Resmi", "Arsip Induk SPT Tahunan 1771"],
    status: "Published",
    lastUpdated: "17 Sep 2026",
  },
];

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

export const INITIAL_REGULATIONS: RegulationContentItem[] = [
  {
    id: "REG-01",
    docNumber: "UU No. 7 Tahun 2021",
    title: "Harmonisasi Peraturan Perpajakan (UU HPP)",
    category: "Undang-Undang",
    effectiveDate: "29 Oktober 2021",
    scope: "Reformasi PPh Badan 22%, tarif PPN 11-12%, integrasi NIK 16 digit menjadi NPWP, dan program pengungkapan sukarela.",
    fileSize: "2.4 MB",
    downloadUrl: "#",
    status: "Published",
    lastUpdated: "12 Sep 2026",
  },
  {
    id: "REG-02",
    docNumber: "PMK No. 168/PMK.03/2023",
    title: "Petunjuk Teknis Pemotongan Pajak atas Penghasilan Sehubungan dengan Pekerjaan (PPh 21 TER)",
    category: "Peraturan Menteri",
    effectiveDate: "1 Januari 2024",
    scope: "Penerapan skema Tarif Efektif Rata-Rata (TER) PPh 21 bulanan kategori A, B, C dan TER harian pegawai.",
    fileSize: "1.8 MB",
    downloadUrl: "#",
    status: "Published",
    lastUpdated: "14 Sep 2026",
  },
  {
    id: "REG-03",
    docNumber: "PMK No. 81 Tahun 2024",
    title: "Ketentuan Perpajakan dalam Rangka Pelaksanaan Sistem Inti Administrasi Perpajakan (Coretax)",
    category: "Peraturan Menteri",
    effectiveDate: "1 Januari 2025",
    scope: "Standardisasi akun wajib pajak (TAM), deposit pajak terpadu, e-Bupot unifikasi, dan pemadanan NIK 16 digit.",
    fileSize: "3.7 MB",
    downloadUrl: "#",
    status: "Published",
    lastUpdated: "15 Sep 2026",
  },
  {
    id: "REG-04",
    docNumber: "PP No. 55 Tahun 2022",
    title: "Penyesuaian Pengaturan di Bidang Pajak Penghasilan",
    category: "Peraturan Pemerintah",
    effectiveDate: "20 Desember 2022",
    scope: "Perlakuan natura dan kenikmatan, batasan omzet peredaran bruto tidak kena pajak UMKM Rp500 juta.",
    fileSize: "2.1 MB",
    downloadUrl: "#",
    status: "Published",
    lastUpdated: "10 Sep 2026",
  },
  {
    id: "REG-05",
    docNumber: "PER-04/PJ/2024",
    title: "Petunjuk Teknis Penerbitan Bukti Pemotongan/Pemungutan Unifikasi Elektronik",
    category: "Peraturan DJP",
    effectiveDate: "1 April 2024",
    scope: "Standardisasi format dokumen e-Bupot unifikasi, tanda tangan digital, dan bridging sistem akuntansi internal ke DJP.",
    fileSize: "1.5 MB",
    downloadUrl: "#",
    status: "Published",
    lastUpdated: "08 Sep 2026",
  },
];

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
  kmkNumber: "KMK No. 38/KM.10/2026",
  period: "17 September 2026 – 23 September 2026",
  effectiveUntil: "23 September 2026",
  rates: [
    { currency: "USD", name: "Dolar Amerika Serikat", rate: "Rp 15.825,00", change: "+0.15%", trend: "up", flag: "US" },
    { currency: "EUR", name: "Euro Uni Eropa", rate: "Rp 16.940,00", change: "-0.08%", trend: "down", flag: "EU" },
    { currency: "SGD", name: "Dolar Singapura", rate: "Rp 11.890,00", change: "+0.05%", trend: "up", flag: "SG" },
    { currency: "CNY", name: "Yuan Renminbi Tiongkok", rate: "Rp 2.185,00", change: "+0.10%", trend: "up", flag: "CN" },
    { currency: "JPY", name: "Yen Jepang (100 Yen)", rate: "Rp 10.450,00", change: "-0.22%", trend: "down", flag: "JP" },
    { currency: "GBP", name: "Pound Sterling Inggris", rate: "Rp 20.150,00", change: "+0.18%", trend: "up", flag: "GB" },
    { currency: "AUD", name: "Dolar Australia", rate: "Rp 10.320,00", change: "-0.05%", trend: "down", flag: "AU" },
  ],
  status: "Published",
  lastUpdated: "17 Sep 2026",
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

export const INITIAL_CAREERS: CareerJobItem[] = [
  {
    id: "career-tax-senior",
    title: "Senior Tax Consultant (Coretax & SP2DK Specialist)",
    department: "Tax Service Core",
    deptKey: "tax",
    type: "Full-Time (Hybrid)",
    location: "Menara Sudirman, Jakarta Selatan",
    experience: "Min. 3-5 tahun di KKP/KAP",
    compensation: "Kompensasi Kompetitif + Bonus Kinerja & BPJS",
    summary: "Memimpin audit kepatuhan SPT Masa & Tahunan badan, memandu migrasi data klien ke ekosistem Coretax DJP 2026, dan mendampingi klarifikasi SP2DK hingga pemeriksaan DJP.",
    responsibilities: [
      "Mengelola portofolio kepatuhan perpajakan berkala (PPh 21/26, 23, 4(2), dan PPN) untuk klien multi-sektor.",
      "Memimpin simulasi dan asistensi migrasi data perpajakan korporat ke sistem Coretax DJP 2026.",
      "Menyusun tanggapan resmi dan strategi klarifikasi Surat Klarifikasi SP2DK KPP.",
      "Melakukan review ekualisasi omzet vs DPP PPN dan biaya gaji vs objek PPh 21.",
    ],
    qualifications: [
      "Pendidikan minimal S1 Akuntansi atau Perpajakan dari universitas terakreditasi.",
      "Memiliki sertifikasi Brevet Pajak AB & C, diutamakan sertifikat BKP (Konsultan Pajak).",
      "Pengalaman kerja minimal 3-5 tahun di Kantor Konsultan Pajak (KKP).",
      "Menguasai regulasi UU HPP, PMK 81/2024, dan alur administrasi Coretax DJP.",
    ],
    benefits: [
      "Fasilitas pembiayaan berkelanjutan untuk sertifikasi USKP & PPL berlisensi IKPI.",
      "Skema kerja hybrid fleksibel (3 hari kantor / 2 hari remote).",
      "Asuransi kesehatan swasta dan BPJS Ketenagakerjaan.",
    ],
    skills: ["Coretax DJP 2026", "Mitigasi SP2DK", "Brevet AB / BKP", "Tax Planning", "Ekualisasi SPT"],
    status: "Published",
    lastUpdated: "11 Sep 2026",
  },
  {
    id: "career-audit-junior",
    title: "Junior Auditor SAK & Kompilasi Laporan Keuangan",
    department: "Accounting Service",
    deptKey: "accounting",
    type: "Full-Time",
    location: "Menara Sudirman, Jakarta Selatan",
    experience: "1-2 tahun pengalaman (Fresh graduate berprestasi dipersilakan)",
    compensation: "Gaji Pokok + Uang Saku Lapangan + BPJS",
    summary: "Mendampingi kompilasi laporan keuangan berbasis SAK EP, melakukan posting jurnal penyesuaian, dan rekonsiliasi akun kas/bank komersial.",
    responsibilities: [
      "Melakukan vouching dan verifikasi bukti fisik transaksi kas, bank, dan faktur.",
      "Membantu penataan kertas kerja laporan posisi keuangan dan laba rugi komersial.",
      "Menyusun rekonsiliasi mutasi rekening koran bank dan buku besar umum.",
    ],
    qualifications: [
      "S1 Akuntansi dengan IPK minimal 3.25.",
      "Memahami standar akuntansi keuangan entitas privat (SAK EP) dan PSAK umum.",
      "Mahir mengoperasikan Microsoft Excel tingkat lanjut (Pivot, VLOOKUP, SUMIFS).",
    ],
    benefits: [
      "Bimbingan langsung dari Akuntan Beregister CA dan auditor berpengalaman.",
      "Jenjang karir berjenjang ke posisi Senior Accounting Associate.",
    ],
    skills: ["SAK EP / IFRS", "Rekonsiliasi Bank", "Jurnal Penyesuaian", "Advanced Excel"],
    status: "Published",
    lastUpdated: "05 Sep 2026",
  },
  {
    id: "career-legal-specialist",
    title: "Corporate Legal Specialist",
    department: "Legal & Corporate Secretary",
    deptKey: "legal",
    type: "Full-Time",
    location: "Menara Sudirman, Jakarta Selatan",
    experience: "Min. 2-3 tahun di Law Firm / Corporate Legal",
    compensation: "Kompensasi Kompetitif + Asuransi Kesehatan",
    summary: "Menelaah perjanjian bisnis komersial, perizinan OSS RBA, dan memastikan kepatuhan hukum korporasi sesuai ketentuan UU Perseroan Terbatas.",
    responsibilities: [
      "Melakukan drafting dan review perjanjian kerja sama bisnis, NDA, dan sewa menyewa.",
      "Mengurus proses perizinan berusaha berbasis risiko (OSS RBA) dan pengesahan AHU Kemenkumham.",
      "Memberikan analisis awal kepatuhan hukum atas rencana transaksi bisnis klien.",
    ],
    qualifications: [
      "S1 Ilmu Hukum, diutamakan telah lulus Ujian Profesi Advokat (UPA) PERADI.",
      "Pengalaman minimal 2 tahun di bidang legal korporat atau firma hukum.",
      "Memiliki kemampuan legal drafting dan analisis kontrak komersial yang tajam.",
    ],
    benefits: [
      "Dukungan pengembangan lisensi advokat PERADI.",
      "Lingkungan kerja profesional di kawasan segitiga emas Sudirman.",
    ],
    skills: ["Legal Drafting", "OSS RBA", "Kontrak Bisnis", "Corporate Compliance"],
    status: "Published",
    lastUpdated: "09 Sep 2026",
  },
  {
    id: "career-tax-associate",
    title: "Tax Compliance Associate (e-Faktur & e-Bupot)",
    department: "Tax Service Core",
    deptKey: "tax",
    type: "Full-Time",
    location: "Menara Sudirman, Jakarta Selatan",
    experience: "Min. 1-2 tahun pengalaman",
    compensation: "Gaji Pokok + Tunjangan Makan & Transport + BPJS",
    summary: "Mengelola administrasi faktur pajak elektronik, bukti potong unifikasi, dan pelaporan SPT Masa bulanan klien tepat waktu.",
    responsibilities: [
      "Membuat dan melakukan approval faktur pajak keluaran melalui aplikasi e-Faktur.",
      "Mengadministrasikan bukti potong unifikasi PPh 21, 23, dan 4 ayat (2).",
      "Melakukan ekualisasi berkala antara buku penjualan dengan faktur pajak.",
    ],
    qualifications: [
      "D3 / S1 Perpajakan atau Akuntansi.",
      "Memiliki sertifikat Brevet Pajak A & B.",
      "Terbiasa menggunakan aplikasi DJP Online (e-Faktur, e-Bupot, e-Billing).",
    ],
    benefits: [
      "Pelatihan intensif modul Coretax DJP 2026.",
      "Fasilitas laptop kerja dan tunjangan komunikasi.",
    ],
    skills: ["e-Faktur", "e-Bupot Unifikasi", "e-Billing", "Brevet AB"],
    status: "Published",
    lastUpdated: "12 Sep 2026",
  },
];

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
  officeName: "Menara Sudirman — Kantor Pusat Zhou Consulting",
  address: "Jl. Jenderal Sudirman Kav. 21, Karet Semanggi, Setiabudi",
  floorBuilding: "Lantai 12, Unit 1205",
  city: "Jakarta Selatan, DKI Jakarta 12930",
  email: "consultingzhou@gmail.com",
  phone: "(021) 522-8890",
  operatingHours: "Senin – Jumat: 08.30 – 17.30 WIB (Sabtu, Minggu & Libur Nasional Tutup)",
  transitAccess: "Stasiun MRT Bendungan Hilir (250m) & Halte TransJakarta Karet Sudirman (150m)",
  whatsappHotlines: [
    {
      division: "Divisi Konsultasi Pajak (BKP)",
      personInCharge: "Linda David, S.Ak., BKP",
      number: "+62 812-3456-7890",
      badge: "SLA 15 Menit",
    },
    {
      division: "Divisi Akuntansi & SAK",
      personInCharge: "Tasya Anggraeni Firdaus, SE.",
      number: "+62 813-8890-1234",
      badge: "SLA 30 Menit",
    },
    {
      division: "Divisi Hukum Korporat",
      personInCharge: "Muhamad Dekhsa, SH.",
      number: "+62 811-9988-7766",
      badge: "SLA 30 Menit",
    },
  ],
  consultationSlots: [
    { session: "Sesi Pagi I", time: "09.00 – 10.30 WIB", quotaPerDay: 2, format: "Tatap Muka & Daring" },
    { session: "Sesi Pagi II", time: "11.00 – 12.30 WIB", quotaPerDay: 2, format: "Tatap Muka & Daring" },
    { session: "Sesi Siang I", time: "13.30 – 15.00 WIB", quotaPerDay: 2, format: "Tatap Muka & Daring" },
    { session: "Sesi Siang II", time: "15.30 – 17.00 WIB", quotaPerDay: 2, format: "Tatap Muka & Daring" },
  ],
  status: "Published",
  lastUpdated: "18 Sep 2026",
};

// Unified items mapping for master table in Admin Overview
export function buildInitialPublicCMSItems(): PublicCMSItem[] {
  const items: PublicCMSItem[] = [];

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
    editor: "Muhamad Dekhsa, SH.",
  });

  // Services (4 items)
  INITIAL_SERVICES.forEach((srv) => {
    items.push({
      id: `PUB-${srv.id}`,
      section: "services",
      sectionLabel: `Layanan — ${srv.name}`,
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
      editor: "Muhamad Dekhsa, SH.",
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
      publicRoute: "/edukasi?tab=belajar-pajak#belajar-pajak",
      title: gov.title,
      category: gov.institution === "DJP" ? "Direktorat Jenderal Pajak" : "Kementerian Keuangan RI",
      summary: gov.description,
      status: gov.status || "Published",
      lastUpdated: gov.updatedAt,
      editor: gov.institutionName,
      url: gov.url,
      institution: gov.institution,
      mediaType: gov.type,
      badge: gov.badge,
      points: gov.highlights,
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
    title: `Kantor Sudirman & Saluran Komunikasi Resmi (${INITIAL_CONTACT_CONTENT.email})`,
    category: "Informasi Kantor & CS",
    summary: `${INITIAL_CONTACT_CONTENT.address}, ${INITIAL_CONTACT_CONTENT.city}. Jam: ${INITIAL_CONTACT_CONTENT.operatingHours}`,
    status: INITIAL_CONTACT_CONTENT.status,
    lastUpdated: INITIAL_CONTACT_CONTENT.lastUpdated,
    editor: "Operasional Menara Sudirman",
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
