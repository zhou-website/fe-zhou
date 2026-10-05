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

export const BELAJAR_PAJAK_LINKS: BelajarPajakLink[] = [
  {
    id: "BP-01",
    title: "Edukasi Pajak Terpadu DJP",
    institution: "DJP",
    institutionName: "Direktorat Jenderal Pajak (DJP)",
    url: "https://edukasi.pajak.go.id",
    type: "Situs Web",
    badge: "Situs Resmi DJP",
    description:
      "Pusat edukasi dan literasi perpajakan nasional resmi dari Ditjen Pajak. Berisi materi pengenalan pajak, komik edukasi, modul tata cara perpajakan, dan program inklusi kesadaran pajak.",
    highlights: [
      "Modul edukasi pajak berbasis jenjang pendidikan & umum",
      "Kamus istilah perpajakan resmi Kemenkeu",
      "Materi inklusi kesadaran pajak untuk masyarakat",
      "Akses gratis resmi langsung dari server DJP",
    ],
    isOfficial: true,
    status: "Published",
    updatedAt: "September 2026",
  },
  {
    id: "BP-02",
    title: "Simulator Interaktif Coretax DJP Online",
    institution: "DJP",
    institutionName: "Direktorat Jenderal Pajak (DJP)",
    url: "https://pajak.go.id",
    type: "Simulator DJP",
    badge: "Simulasi Coretax Resmi",
    description:
      "Simulasi interaktif aplikasi Coretax DJP. Membantu wajib pajak dan praktisi akuntansi berlatih membuat bukti potong unifikasi, pembuatan e-Faktur, dan pengisian SPT digital.",
    highlights: [
      "Simulasi pembuatan Bukti Pemotongan PPh Unifikasi",
      "Latihan penerbitan Faktur Pajak Elektronik Coretax",
      "Panduan pendaftaran akun dan aktivasi akun wajib pajak",
      "Lingkungan uji coba resmi tanpa mempengaruhi data pajak asli",
    ],
    isOfficial: true,
    status: "Published",
    updatedAt: "September 2026",
  },
  {
    id: "BP-03",
    title: "Kemenkeu Learning Center (KLC) - Modul Perpajakan",
    institution: "Kemenkeu",
    institutionName: "Kementerian Keuangan RI",
    url: "https://klc2.kemenkeu.go.id",
    type: "E-Learning",
    badge: "Platform Resmi BPPK Kemenkeu",
    description:
      "Platform pembelajaran terbuka dari Badan Pendidikan dan Pelatihan Keuangan (BPPK) Kemenkeu RI. Menyediakan kursus online, video ceramah instruktur, dan materi fiskal komprehensif.",
    highlights: [
      "Materi video pembelajaran perpajakan berdurasi komprehensif",
      "Kajian hukum fiskal dan kebijakan keuangan negara",
      "Modul interaktif dengan kuis pemahaman konsep",
      "Disusun langsung oleh widyaiswara dan praktisi Kemenkeu RI",
    ],
    isOfficial: true,
    status: "Published",
    updatedAt: "Agustus 2026",
  },
  {
    id: "BP-04",
    title: "Saluran Resmi Video Pembelajaran & Tutorial Ditjen Pajak RI",
    institution: "DJP",
    institutionName: "Direktorat Jenderal Pajak (DJP)",
    url: "https://www.youtube.com/@DitjenPajakRI",
    type: "Video Tutorial",
    badge: "Video Resmi DJP",
    description:
      "Kanal video resmi Direktorat Jenderal Pajak. Berisi tutorial teknis langkah-demi-langkah pengisian SPT tahunan, pembuatan e-Billing, asistensi Coretax, serta podcast edukasi pajak terkini.",
    highlights: [
      "Video tutorial pengoperasian aplikasi DJP Online & Coretax",
      "Podcast bincang pajak bersama para pembuat kebijakan fiskal",
      "Panduan visual pelaporan SPT Tahunan Orang Pribadi dan Badan",
      "Pembaruan tips praktis pencegahan penipuan mengatasnamakan DJP",
    ],
    isOfficial: true,
    status: "Published",
    updatedAt: "September 2026",
  },
  {
    id: "BP-05",
    title: "Badan Kebijakan Fiskal (BKF) Kemenkeu - Kajian & Regulasi",
    institution: "Kemenkeu",
    institutionName: "Kementerian Keuangan RI",
    url: "https://fiskal.kemenkeu.go.id",
    type: "Situs Web",
    badge: "Kajian Resmi Fiskal",
    description:
      "Pusat riset, publikasi, dan telaah akademis kebijakan perpajakan nasional dan internasional dari Badan Kebijakan Fiskal Kementerian Keuangan Republik Indonesia.",
    highlights: [
      "Kajian dampak ekonomi makro atas reformasi perpajakan",
      "Laporan insentif perpajakan dan belanja perpajakan (Tax Expenditure)",
      "Dokumen harmonisasi kebijakan perpajakan internasional (Pillar 1 & 2)",
      "Analisis tren penerimaan negara dan proyeksi APBN",
    ],
    isOfficial: true,
    status: "Published",
    updatedAt: "Agustus 2026",
  },
  {
    id: "BP-06",
    title: "Buku Saku Pajak & Panduan Kepatuhan DJP Online",
    institution: "DJP",
    institutionName: "Direktorat Jenderal Pajak (DJP)",
    url: "https://pajak.go.id/id/buku-pajak",
    type: "Buku Panduan (PDF)",
    badge: "Buku Panduan Resmi",
    description:
      "Kumpulan e-book, buklet resmi, dan panduan praktis regulasi perpajakan yang dapat diunduh secara gratis langsung dari situs resmi Direktorat Jenderal Pajak.",
    highlights: [
      "Buku pedoman pengisian SPT Tahunan 1770, 1770S, dan 1771",
      "Panduan lengkap implementasi PMK Nomor 81/PMK.03/2024",
      "Tanya-jawab resmi (FAQ) perpajakan nasional",
      "Format PDF resmi siap cetak untuk panduan internal kantor",
    ],
    isOfficial: true,
    status: "Published",
    updatedAt: "September 2026",
  },
  {
    id: "BP-07",
    title: "Layanan DJP Online (E-Filing, E-Billing, E-Bupot)",
    institution: "DJP",
    institutionName: "Direktorat Jenderal Pajak (DJP)",
    url: "https://djponline.pajak.go.id",
    type: "Situs Web",
    badge: "Layanan Utama DJP",
    description:
      "Situs gerbang utama wajib pajak untuk mengakses aplikasi e-Filing, e-Billing, e-Bupot 21/26, e-Faktur web based, dan pengelolaan profil wajib pajak secara langsung.",
    highlights: [
      "Akses pembuatan kode billing pembayaran pajak secara mandiri",
      "Pelaporan SPT Masa dan SPT Tahunan dengan BPE elektronik resmi",
      "Pengecekan konfirmasi status wajib pajak (KSWP)",
      "Layanan permohonan sertifikat elektronik wajib pajak",
    ],
    isOfficial: true,
    status: "Published",
    updatedAt: "September 2026",
  },
  {
    id: "BP-08",
    title: "Publikasi Data & Informasi Keuangan Kemenkeu RI",
    institution: "Kemenkeu",
    institutionName: "Kementerian Keuangan RI",
    url: "https://kemenkeu.go.id/informasi-publik/publikasi",
    type: "Situs Web",
    badge: "Informasi Publik Kemenkeu",
    description:
      "Layanan keterbukaan informasi publik resmi Kementerian Keuangan. Berisi siaran pers, laporan berkala APBN Kita, dan rilis kebijakan fiskal terbaru dari Menteri Keuangan.",
    highlights: [
      "Laporan realisasi APBN Kita edisi bulanan terkini",
      "Siaran pers resmi mengenai penyesuaian aturan perpajakan",
      "Statistik penerimaan perpajakan dan kepabeanan nasional",
      "Kompilasi peraturan menteri keuangan (PMK) bidang fiskal",
    ],
    isOfficial: true,
    status: "Published",
    updatedAt: "September 2026",
  },
];
