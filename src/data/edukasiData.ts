export interface ZhouArticleAttachment {
  name: string;
  size: string;
  type: string;
  url?: string;
  dataUrl?: string;
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
  image?: string;
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
  highlights?: string[];
  isOfficial?: boolean;
  status?: "Published" | "Draft";
  updatedAt?: string;
}

export const ZHOU_ARTICLES: ZhouArticle[] = [
  {
    "id": "coretax-transisi",
    "title": "Panduan Strategis Transisi Coretax DJP 2026 bagi Entitas Bisnis Nasional",
    "category": "Coretax DJP 2026",
    "categoryKey": "coretax",
    "date": "15 September 2026",
    "readTime": "7 menit baca",
    "author": "Tim Konsultan BKP Zhou Consulting",
    "summary": "Penelaahan mendalam mengenai pemadanan NIK-NPWP 16 digit, integrasi e-Faktur dan e-Bupot unifikasi terpadu, serta tata kelola akun deposit pajak (Tax Deposit Account) untuk mencegah sanksi administrasi fiskal.",
    "takeaways": [
      "Konsolidasi akun wajib pajak (Taxpayer Account Management) mempermudah alokasi saldo lintas jenis pajak nasional.",
      "Prapengisian (pre-populated data) bukti potong unifikasi langsung dari sistem pihak ketiga dan DJP secara real-time.",
      "Kebutuhan mendesak audit validitas master data NPWP 16 digit/NITKU karyawan dan mitra rekanan bisnis.",
      "Penerapan akun deposit pajak yang memerlukan disiplin rekonsiliasi kas sebelum pelaporan SPT Masa."
    ],
    "content": [
      "Sistem Informasi Perpajakan Terpadu (Coretax) dari Direktorat Jenderal Pajak (DJP) membawa revolusi menyeluruh terhadap tata cara wajib pajak badan mengelola kepatuhan fiskal nasional.",
      "Perubahan mendasar mencakup konsolidasi akun wajib pajak (Taxpayer Account Management), integrasi modul bukti potong unifikasi langsung ke modul akuntansi, serta otomatisasi prapengisian SPT Tahunan secara digital.",
      "Berdasarkan PMK 81/2024, seluruh entitas bisnis diwajibkan menyelaraskan sistem pencatatan transaksi sebelum implementasi penuh. Ketidaksesuaian nomor identitas atau format bukti potong dapat berakibat pada penolakan approval faktur pajak masukan.",
      "Zhou Consulting menyarankan setiap entitas bisnis untuk segera melakukan validasi data master perpajakan, menyusun bridging API sistem ERP ke DJP, dan memberikan pelatihan intensif kepada tim akuntansi."
    ],
    "status": "Published"
  },
  {
    "id": "mitigasi-sp2dk",
    "title": "Manajemen Kepatuhan PPh Badan & Strategi Mitigasi Risiko Surat Klarifikasi SP2DK KPP",
    "category": "Mitigasi SP2DK",
    "categoryKey": "sp2dk",
    "date": "10 September 2026",
    "readTime": "6 menit baca",
    "author": "Budi Santoso, S.E., BKP",
    "summary": "Langkah preventif dalam penataan bukti potong, rekonsiliasi fiskal berkala, dan penyusunan kertas kerja ekualisasi omzet komersial vs SPT Tahunan.",
    "takeaways": [
      "Ekualisasi berkala antara omzet SPT Masa PPN dengan peredaran bruto SPT Tahunan PPh Badan sebelum tutup buku.",
      "Pencocokan biaya gaji, upah, dan honorarium dengan dasar pemotongan PPh Pasal 21 bulanan.",
      "Penyusunan surat tanggapan tertulis SP2DK berbasis data komparatif tervalidasi konsultan BKP dalam batas 14 hari."
    ],
    "content": [
      "Surat Permintaan Penjelasan atas Data dan/atau Keterangan (SP2DK) umumnya diterbitkan oleh Account Representative (AR) KPP akibat anomali data uji silang antara laporan keuangan dengan data eksternal pihak ketiga (perbankan, bea cukai, ILAP).",
      "Area paling rentan mencakup selisih omzet PPN vs PPh Badan, ekualisasi biaya tenaga kerja dengan PPh Pasal 21, serta transaksi afiliasi antar pemegang saham yang diuji prinsip kewajaran (Arm's Length Principle).",
      "Penyusunan kertas kerja rekonsiliasi fiskal yang terdokumentasi rapi sejak awal tahun buku merupakan langkah mitigasi perusahaan dalam memberikan respon sanggahan resmi yang terstruktur dan akuntabel."
    ],
    "status": "Published"
  },
  {
    "id": "tarif-ter-pph21",
    "title": "Ketentuan Tarif Efektif Rata-Rata (TER) PPh 21 Berdasarkan PP 58/2023 & PMK 168/2023",
    "category": "Kepatuhan PPh & PPN",
    "categoryKey": "pph-ppn",
    "date": "28 Agustus 2026",
    "readTime": "5 menit baca",
    "author": "Linda David, S.Ak., BKP",
    "summary": "Pedoman teknis implementasi skema pemotongan PPh 21 bulanan kategori A, B, C untuk pegawai tetap dan tenaga ahli serta kalkulasi masa pajak terakhir Desember.",
    "takeaways": [
      "Penerapan tabel TER Bulanan (Kategori A, B, C) berbasis status PTKP karyawan untuk masa Januari–November.",
      "Penghitungan kembali menggunakan tarif progresif Pasal 17 ayat (1) huruf a UU HPP pada masa pajak Desember.",
      "Otomasi slip gaji dan integrasi modul payroll guna meminimalkan selisih lebih/kurang potong akhir tahun."
    ],
    "content": [
      "Peraturan Pemerintah No. 58 Tahun 2023 menghadirkan simplifikasi penghitungan PPh Pasal 21 melalui skema Tarif Efektif Rata-rata (TER). Mekanisme ini membagi wajib pajak orang pribadi ke dalam Kategori A, B, dan C berdasarkan status PTKP.",
      "Meskipun perhitungan bulanan menjadi lebih sederhana (penghasilan bruto dikalikan persentase TER), tim HR dan Payroll wajib mengantisipasi penyesuaian pada masa pajak Desember di mana pajak dihitung kembali menggunakan tarif progresif Pasal 17.",
      "Zhou Consulting mendampingi perusahaan dalam memetakan formula payroll otomatis dan menerbitkan formulir Bukti Potong 1721-A1 secara tertib."
    ],
    "status": "Published"
  },
  {
    "id": "pembukuan-sak-ep",
    "title": "Implementasi Standar Akuntansi Keuangan Entitas Privat (SAK EP) bagi Kelayakan Pembiayaan",
    "category": "Akuntansi SAK",
    "categoryKey": "akuntansi",
    "date": "14 Agustus 2026",
    "readTime": "8 menit baca",
    "author": "Tasya Anggraeni, S.E., Ak.",
    "summary": "Transisi menyeluruh dari SAK ETAP ke SAK EP, penilaian aset berwujud, perlakuan sewa pembiayaan, dan dampaknya terhadap rasio solvabilitas bank.",
    "takeaways": [
      "Kewajiban konvergensi pembukuan berbasis SAK EP untuk entitas akuntabilitas publik non-signifikan.",
      "Penyajian komponen laporan arus kas metode langsung untuk verifikasi komite kredit perbankan.",
      "Pencatatan estimasi liabilitas kontinjensi dan imbalan pascakerja karyawan sesuai ketentuan UU Cipta Kerja."
    ],
    "content": [
      "Ikatan Akuntan Indonesia (IAI) telah menetapkan SAK EP sebagai pengganti resmi SAK ETAP. Standar baru ini mengadopsi prinsip IFRS for SMEs yang lebih komprehensif tanpa membebani entitas privat dengan kompleksitas berlebih.",
      "Bagi perusahaan yang sedang mengajukan fasilitas kredit investasi atau modal kerja, penyajian laporan keuangan berstandar SAK EP meningkatkan nilai skor kredit dan mempercepat persetujuan komite perbankan.",
      "Zhou Consulting mendampingi divisi keuangan dalam menyusun kebijakan akuntansi baru, penyesuaian saldo awal neraca, dan penyusunan catatan atas laporan keuangan (CALK)."
    ],
    "status": "Published"
  },
  {
    "id": "restrukturisasi-korporat",
    "title": "Aspek Legal dan Pajak Pengalihan Hak atas Saham & Aset Korporat",
    "category": "Legal Korporat",
    "categoryKey": "legal",
    "date": "02 Agustus 2026",
    "readTime": "6 menit baca",
    "author": "Muhamad Dekhsa, S.H., M.Kn.",
    "summary": "Mitigasi risiko pemotongan PPh final pengalihan saham, penyesuaian anggaran dasar PT melalui AHU Kemenkumham, dan perlindungan pemegang saham minoritas.",
    "takeaways": [
      "Penetapan valuasi wajar transaksi afiliasi guna mencegah koreksi fiskal Pasal 18 UU PPh.",
      "Pemberitahuan kepada kreditor dan pengumuman surat kabar sesuai UU Perseroan Terbatas.",
      "Pemenuhan kewajiban pelaporan beneficial ownership pada sistem AHU Kemenkumham."
    ],
    "content": [
      "Aksi korporasi seperti merger, akuisisi, atau restrukturisasi kepemilikan saham melibatkan dua pilar utama yang tak terpisahkan: kepatuhan hukum perseroan dan beban perpajakan yang timbul.",
      "Pengalihan saham yang tidak diantisipasi dengan baik dapat memicu sengketa perpajakan terkait pengakuan laba modal (capital gain) atau pengenaan PPh final.",
      "Zhou Consulting memberikan advis komprehensif yang mengintegrasikan pembuatan perjanjian jual beli saham (CSPA), audit legalitas entitas, hingga perhitungan beban pajak yang paling efisien."
    ],
    "status": "Published"
  }
];

export const BELAJAR_PAJAK_LINKS: BelajarPajakLink[] = [];
