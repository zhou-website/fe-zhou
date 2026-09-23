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

export const ZHOU_ARTICLES: ZhouArticle[] = [
  {
    id: "coretax-transisi",
    title: "Panduan Strategis Transisi Coretax DJP 2026 bagi Entitas Bisnis Nasional",
    category: "Coretax DJP 2026",
    categoryKey: "coretax",
    date: "15 September 2026",
    readTime: "7 menit baca",
    author: "Tim Konsultan BKP Zhou Consulting",
    summary:
      "Penelaahan mendalam mengenai pemadanan NIK-NPWP 16 digit, integrasi e-Faktur dan e-Bupot unifikasi terpadu, serta tata kelola akun deposit pajak (Tax Deposit Account) untuk mencegah sanksi administrasi fiskal.",
    takeaways: [
      "Konsolidasi akun wajib pajak (Taxpayer Account Management) mempermudah alokasi saldo lintas jenis pajak nasional.",
      "Prapengisian (pre-populated data) bukti potong unifikasi langsung dari sistem pihak ketiga dan DJP secara real-time.",
      "Kebutuhan mendesak audit validitas master data NPWP 16 digit/NITKU karyawan dan mitra rekanan bisnis.",
      "Penerapan akun deposit pajak yang memerlukan disiplin rekonsiliasi kas sebelum pelaporan SPT Masa.",
    ],
    content: [
      "Sistem Informasi Perpajakan Terpadu (Coretax) dari Direktorat Jenderal Pajak (DJP) membawa revolusi menyeluruh terhadap tata cara wajib pajak badan mengelola kepatuhan fiskal nasional.",
      "Perubahan mendasar mencakup konsolidasi akun wajib pajak (Taxpayer Account Management), integrasi modul bukti potong unifikasi langsung ke modul akuntansi, serta otomatisasi prapengisian SPT Tahunan secara digital.",
      "Berdasarkan PMK 81/2024, seluruh entitas bisnis diwajibkan menyelaraskan sistem pencatatan transaksi sebelum implementasi penuh. Ketidaksesuaian nomor identitas atau format bukti potong dapat berakibat pada penolakan approval faktur pajak masukan.",
      "Zhou Consulting menyarankan setiap entitas bisnis untuk segera melakukan validasi data master perpajakan, menyusun bridging API sistem ERP ke DJP, dan memberikan pelatihan intensif kepada tim akuntansi.",
    ],
    status: "Published",
  },
  {
    id: "mitigasi-sp2dk",
    title: "Manajemen Kepatuhan PPh Badan & Strategi Mitigasi Risiko Surat Klarifikasi SP2DK KPP",
    category: "Mitigasi SP2DK",
    categoryKey: "sp2dk",
    date: "10 September 2026",
    readTime: "6 menit baca",
    author: "Budi Santoso, S.E., BKP",
    summary:
      "Langkah preventif dalam penataan bukti potong, rekonsiliasi fiskal berkala, dan penyusunan kertas kerja ekualisasi omzet komersial vs SPT Tahunan.",
    takeaways: [
      "Ekualisasi berkala antara omzet SPT Masa PPN dengan peredaran bruto SPT Tahunan PPh Badan sebelum tutup buku.",
      "Pencocokan biaya gaji, upah, dan honorarium dengan dasar pemotongan PPh Pasal 21 bulanan.",
      "Penyusunan surat tanggapan tertulis SP2DK berbasis data komparatif tervalidasi konsultan BKP dalam batas 14 hari.",
    ],
    content: [
      "Surat Permintaan Penjelasan atas Data dan/atau Keterangan (SP2DK) umumnya diterbitkan oleh Account Representative (AR) KPP akibat anomali data uji silang antara laporan keuangan dengan data eksternal pihak ketiga (perbankan, bea cukai, ILAP).",
      "Area paling rentan mencakup selisih omzet PPN vs PPh Badan, ekualisasi biaya tenaga kerja dengan PPh Pasal 21, serta transaksi afiliasi antar pemegang saham yang diuji prinsip kewajaran (Arm's Length Principle).",
      "Penyusunan kertas kerja rekonsiliasi fiskal yang terdokumentasi rapi sejak awal tahun buku merupakan langkah mitigasi perusahaan dalam memberikan respon sanggahan resmi yang terstruktur dan akuntabel.",
    ],
    status: "Published",
  },
  {
    id: "tarif-ter-pph21",
    title: "Ketentuan Tarif Efektif Rata-Rata (TER) PPh 21 Berdasarkan PP 58/2023 & PMK 168/2023",
    category: "Kepatuhan PPh & PPN",
    categoryKey: "pph-ppn",
    date: "28 Agustus 2026",
    readTime: "5 menit baca",
    author: "Linda David, S.Ak., BKP",
    summary:
      "Pedoman teknis implementasi skema pemotongan PPh 21 bulanan kategori A, B, C untuk pegawai tetap dan tenaga ahli serta kalkulasi masa pajak terakhir Desember.",
    takeaways: [
      "Penerapan tabel TER Bulanan (Kategori A, B, C) berbasis status PTKP karyawan untuk masa Januari–November.",
      "Penghitungan kembali menggunakan tarif progresif Pasal 17 ayat (1) huruf a UU HPP pada masa pajak Desember.",
      "Otomasi slip gaji dan integrasi modul payroll guna meminimalkan selisih lebih/kurang potong akhir tahun.",
    ],
    content: [
      "Peraturan Pemerintah No. 58 Tahun 2023 menghadirkan simplifikasi penghitungan PPh Pasal 21 melalui skema Tarif Efektif Rata-rata (TER). Mekanisme ini membagi wajib pajak orang pribadi ke dalam Kategori A, B, dan C berdasarkan status PTKP.",
      "Meskipun perhitungan bulanan menjadi lebih sederhana (penghasilan bruto dikalikan persentase TER), tim HR dan Payroll wajib mengantisipasi penyesuaian pada masa pajak Desember di mana pajak dihitung kembali menggunakan tarif progresif Pasal 17.",
      "Zhou Consulting mendampingi perusahaan dalam memetakan formula payroll otomatis dan menerbitkan formulir Bukti Potong 1721-A1 secara tertib.",
    ],
    status: "Published",
  },
  {
    id: "pembukuan-sak-ep",
    title: "Implementasi Standar Akuntansi Keuangan Entitas Privat (SAK EP) bagi Kelayakan Pembiayaan",
    category: "Akuntansi SAK",
    categoryKey: "akuntansi",
    date: "14 Agustus 2026",
    readTime: "8 menit baca",
    author: "Tasya Anggraeni, S.E., Ak.",
    summary:
      "Transisi menyeluruh dari SAK ETAP ke SAK EP, penilaian aset berwujud, perlakuan sewa pembiayaan, dan dampaknya terhadap rasio solvabilitas bank.",
    takeaways: [
      "Kewajiban konvergensi pembukuan berbasis SAK EP untuk entitas akuntabilitas publik non-signifikan.",
      "Penyajian komponen laporan arus kas metode langsung untuk verifikasi komite kredit perbankan.",
      "Pencatatan estimasi liabilitas kontinjensi dan imbalan pascakerja karyawan sesuai ketentuan UU Cipta Kerja.",
    ],
    content: [
      "Ikatan Akuntan Indonesia (IAI) telah menetapkan SAK EP sebagai pengganti resmi SAK ETAP. Standar baru ini mengadopsi prinsip IFRS for SMEs yang lebih komprehensif tanpa membebani entitas privat dengan kompleksitas berlebih.",
      "Bagi perusahaan yang sedang mengajukan fasilitas kredit investasi atau modal kerja, penyajian laporan keuangan berstandar SAK EP meningkatkan nilai skor kredit dan mempercepat persetujuan komite perbankan.",
      "Zhou Consulting mendampingi divisi keuangan dalam menyusun kebijakan akuntansi baru, penyesuaian saldo awal neraca, dan penyusunan catatan atas laporan keuangan (CALK).",
    ],
    status: "Published",
  },
  {
    id: "restrukturisasi-korporat",
    title: "Aspek Legal dan Pajak Pengalihan Hak atas Saham & Aset Korporat",
    category: "Legal Korporat",
    categoryKey: "legal",
    date: "02 Agustus 2026",
    readTime: "6 menit baca",
    author: "Muhamad Dekhsa, S.H., M.Kn.",
    summary:
      "Mitigasi risiko pemotongan PPh final pengalihan saham, penyesuaian anggaran dasar PT melalui AHU Kemenkumham, dan perlindungan pemegang saham minoritas.",
    takeaways: [
      "Penetapan valuasi wajar transaksi afiliasi guna mencegah koreksi fiskal Pasal 18 UU PPh.",
      "Pemberitahuan kepada kreditor dan pengumuman surat kabar sesuai UU Perseroan Terbatas.",
      "Pemenuhan kewajiban pelaporan beneficial ownership pada sistem AHU Kemenkumham.",
    ],
    content: [
      "Aksi korporasi seperti merger, akuisisi, atau restrukturisasi kepemilikan saham melibatkan dua aspek utama yang tak terpisahkan: kepatuhan hukum perseroan dan beban perpajakan yang timbul.",
      "Pengalihan saham yang tidak diantisipasi dengan baik dapat memicu sengketa perpajakan terkait pengakuan laba modal (capital gain) atau pengenaan PPh final.",
      "Zhou Consulting memberikan advis komprehensif yang mengintegrasikan pembuatan perjanjian jual beli saham (CSPA), audit legalitas entitas, hingga perhitungan beban pajak yang paling efisien.",
    ],
    status: "Published",
  },
];

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
