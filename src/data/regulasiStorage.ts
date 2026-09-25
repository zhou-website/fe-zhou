"use client";

export type RegulationCategory =
  | "Regulasi Zhou"
  | "Undang-Undang"
  | "Peraturan Pemerintah"
  | "Peraturan Menteri"
  | "Peraturan DJP"
  | "Keputusan KMK";

export type RegulationStatus = "Berlaku" | "Pembaruan";

export interface StoredRegulationItem {
  id: string;
  docNumber: string;
  title: string;
  category: RegulationCategory;
  effectiveDate: string;
  scope: string;
  fileSize: string;
  status: RegulationStatus;
  downloadUrl?: string;
}

export const REGULATION_CATEGORIES: string[] = [
  "Semua",
  "Regulasi Zhou",
  "Undang-Undang",
  "Peraturan Pemerintah",
  "Peraturan Menteri",
  "Peraturan DJP",
  "Keputusan KMK",
];

export const DEFAULT_REGULATIONS: StoredRegulationItem[] = [
  // Regulasi & SOP Resmi Zhou Consulting
  {
    id: "ZHOU-REG-01",
    docNumber: "SOP-ZHOU/TAX/2026/01",
    title: "Standar Prosedur Operasional Kepatuhan Coretax & Rekonsiliasi SPT Unifikasi Zhou",
    category: "Regulasi Zhou",
    effectiveDate: "2 Januari 2026",
    scope: "Pedoman kerja dan kepatuhan penyusunan rekonsiliasi fiskal, tata kelola akun deposit pajak, dan integrasi modul unifikasi Coretax DJP bagi klien korporat Zhou Consulting.",
    fileSize: "1.4 MB",
    status: "Berlaku",
  },
  {
    id: "ZHOU-REG-02",
    docNumber: "GUIDE-ZHOU/ACC/2025/03",
    title: "Panduan Teknis Pelaporan Keuangan Standar SAK EP Entitas Privat & Manufaktur",
    category: "Regulasi Zhou",
    effectiveDate: "15 Juli 2025",
    scope: "Standar operasional konversi pembukuan komersial ke SAK EP, prosedur revaluasi aset tetap, dan pedoman pengungkapan catatan atas laporan keuangan (CALK).",
    fileSize: "2.2 MB",
    status: "Berlaku",
  },
  {
    id: "ZHOU-REG-03",
    docNumber: "CIRCULAR-ZHOU/TP/2026/02",
    title: "Surat Edaran Teknis: Tata Kelola Dokumentasi Transfer Pricing (TP Doc Local File)",
    category: "Regulasi Zhou",
    effectiveDate: "10 Februari 2026",
    scope: "Instruksi kerja telaah kepatuhan transaksi hubungan istimewa domestik dan lintas batas, penerapan metode Arm's Length Principle (ALP), serta benchmarking rasio profitabilitas.",
    fileSize: "1.9 MB",
    status: "Pembaruan",
  },
  // Regulasi Pemerintah & DJP
  {
    id: "REG-01",
    docNumber: "UU No. 7 Tahun 2021",
    title: "Harmonisasi Peraturan Perpajakan (UU HPP)",
    category: "Undang-Undang",
    effectiveDate: "29 Oktober 2021",
    scope: "Reformasi PPh Badan, kenaikan tarif PPN 11%, integrasi NIK menjadi NPWP, dan program pengungkapan sukarela.",
    fileSize: "2.4 MB",
    status: "Berlaku",
  },
  {
    id: "REG-02",
    docNumber: "PMK No. 168/PMK.03/2023",
    title: "Petunjuk Teknis Pemotongan Pajak atas Penghasilan Sehubungan dengan Pekerjaan (PPh 21 TER)",
    category: "Peraturan Menteri",
    effectiveDate: "1 Januari 2024",
    scope: "Penerapan skema Tarif Efektif Rata-Rata (TER) PPh 21 bulanan kategori A, B, C dan TER harian pegawai.",
    fileSize: "1.8 MB",
    status: "Berlaku",
  },
  {
    id: "REG-03",
    docNumber: "PMK No. 81 Tahun 2024",
    title: "Ketentuan Perpajakan dalam Rangka Pelaksanaan Sistem Inti Administrasi Perpajakan (Coretax)",
    category: "Peraturan Menteri",
    effectiveDate: "1 Januari 2025",
    scope: "Standardisasi akun wajib pajak, deposit pajak terpadu, e-Bupot unifikasi, dan pemadanan NIK 16 digit.",
    fileSize: "3.7 MB",
    status: "Pembaruan",
  },
  {
    id: "REG-04",
    docNumber: "PP No. 55 Tahun 2022",
    title: "Penyesuaian Pengaturan di Bidang Pajak Penghasilan Badan dan Orang Pribadi",
    category: "Peraturan Pemerintah",
    effectiveDate: "20 Desember 2022",
    scope: "Perlakuan natura/kenikmatan, instrumen pencegahan penghindaran pajak (GAAR), dan batasan omzet tidak kena pajak UMKM.",
    fileSize: "1.9 MB",
    status: "Berlaku",
  },
  {
    id: "REG-05",
    docNumber: "PER-04/PJ/2024",
    title: "Petunjuk Teknis Administrasi Nomor Pokok Wajib Pajak dan Sertifikat Elektronik Coretax DJP",
    category: "Peraturan DJP",
    effectiveDate: "1 Juli 2024",
    scope: "Tata cara aktivasi akun wajib pajak baru, penataan sertifikat digital, dan otentikasi multi-faktor DJP.",
    fileSize: "2.1 MB",
    status: "Berlaku",
  },
  {
    id: "REG-06",
    docNumber: "KMK No. 38/KM.10/2026",
    title: "Nilai Kurs Valuta Asing sebagai Dasar Pelunasan Bea Masuk, PPN, dan PPh",
    category: "Keputusan KMK",
    effectiveDate: "15 September 2026",
    scope: "Penetapan kurs pajak mingguan resmi Kemenkeu untuk konversi transaksi ekspor, impor, dan faktur valas.",
    fileSize: "850 KB",
    status: "Berlaku",
  },
  {
    id: "REG-07",
    docNumber: "PER-03/PJ/2022 jo PER-11/PJ/2022",
    title: "Pedoman Teknis Faktur Pajak Elektronik (e-Faktur PPN)",
    category: "Peraturan DJP",
    effectiveDate: "1 April 2022",
    scope: "Ketentuan upload faktur pajak keluaran paling lambat tanggal 15 bulan berikutnya serta mitigasi faktur fiktif.",
    fileSize: "1.5 MB",
    status: "Berlaku",
  },
  {
    id: "REG-08",
    docNumber: "PER-17/PJ/2021",
    title: "Tata Cara Pembuatan Bukti Pemotongan/Pemungutan Unifikasi dan Pelaporan SPT Masa PPh Unifikasi",
    category: "Peraturan DJP",
    effectiveDate: "1 Januari 2022",
    scope: "Integrasi pelaporan PPh Pasal 22, 23, 26, dan PPh Final Pasal 4 ayat (2) ke dalam satu format pelaporan digital.",
    fileSize: "2.8 MB",
    status: "Berlaku",
  },
  {
    id: "REG-09",
    docNumber: "PP No. 44 Tahun 2022",
    title: "Penerapan Pajak Pertambahan Nilai Barang dan Jasa serta Pajak Penjualan atas Barang Mewah",
    category: "Peraturan Pemerintah",
    effectiveDate: "2 Desember 2022",
    scope: "Penunjukan pemungut PPN PMSE (perdagangan melalui sistem elektronik) dan fasilitas PPN dibebaskan/tidak dipungut.",
    fileSize: "1.6 MB",
    status: "Berlaku",
  },
  {
    id: "REG-10",
    docNumber: "UU No. 1 Tahun 2022",
    title: "Hubungan Keuangan antara Pemerintah Pusat dan Pemerintahan Daerah (UU HKPD)",
    category: "Undang-Undang",
    effectiveDate: "5 Januari 2022",
    scope: "Penyelarasan Pajak Daerah dan Retribusi Daerah (PDRD) dengan tarif PBJT korporat serta opsen pajak provinsi/kabupaten.",
    fileSize: "3.2 MB",
    status: "Berlaku",
  },
];

export const REGULATIONS_STORAGE_KEY = "zhou_regulations_data";
export const REGULATIONS_EVENT = "zhou_regulations_updated";

/**
 * Mendapatkan daftar regulasi dari localStorage (atau default jika belum ada)
 */
export function getStoredRegulations(): StoredRegulationItem[] {
  if (typeof window === "undefined") {
    return DEFAULT_REGULATIONS;
  }

  try {
    const raw = localStorage.getItem(REGULATIONS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(REGULATIONS_STORAGE_KEY, JSON.stringify(DEFAULT_REGULATIONS));
      return DEFAULT_REGULATIONS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_REGULATIONS;
  } catch (error) {
    console.error("Gagal membaca zhou_regulations_data dari localStorage:", error);
    return DEFAULT_REGULATIONS;
  }
}

/**
 * Menyimpan daftar regulasi ke localStorage dan memancarkan event pembaruan
 */
export function saveStoredRegulations(regulations: StoredRegulationItem[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(REGULATIONS_STORAGE_KEY, JSON.stringify(regulations));
    window.dispatchEvent(new CustomEvent(REGULATIONS_EVENT, { detail: regulations }));
  } catch (error) {
    console.error("Gagal menyimpan zhou_regulations_data ke localStorage:", error);
  }
}

/**
 * Menambahkan regulasi / dokumen peraturan baru (CREATE)
 */
export function addRegulation(
  item: Omit<StoredRegulationItem, "id"> & { id?: string }
): StoredRegulationItem {
  const current = getStoredRegulations();
  const idPrefix = item.category === "Regulasi Zhou" ? "ZHOU-REG" : "REG";
  const newId = item.id || `${idPrefix}-${Date.now().toString().slice(-4)}`;

  const newRegulation: StoredRegulationItem = {
    ...item,
    id: newId,
    status: item.status || "Berlaku",
  };

  const updated = [newRegulation, ...current];
  saveStoredRegulations(updated);
  return newRegulation;
}

/**
 * Memperbarui regulasi / dokumen peraturan (UPDATE)
 */
export function updateRegulation(
  id: string,
  changes: Partial<StoredRegulationItem>
): StoredRegulationItem[] {
  const current = getStoredRegulations();
  const updated = current.map((item) => {
    if (item.id === id) {
      return {
        ...item,
        ...changes,
      };
    }
    return item;
  });

  saveStoredRegulations(updated);
  return updated;
}

/**
 * Menghapus regulasi / dokumen peraturan (DELETE)
 */
export function deleteRegulation(id: string): StoredRegulationItem[] {
  const current = getStoredRegulations();
  const updated = current.filter((item) => item.id !== id);
  saveStoredRegulations(updated);
  return updated;
}

/**
 * Toggle status antara Berlaku dan Pembaruan
 */
export function toggleRegulationStatus(id: string): StoredRegulationItem[] {
  const current = getStoredRegulations();
  const updated = current.map((item) => {
    if (item.id === id) {
      const nextStatus: RegulationStatus = item.status === "Berlaku" ? "Pembaruan" : "Berlaku";
      return { ...item, status: nextStatus };
    }
    return item;
  });

  saveStoredRegulations(updated);
  return updated;
}

/**
 * Mengembalikan regulasi ke daftar default
 */
export function resetRegulationsToDefault(): StoredRegulationItem[] {
  saveStoredRegulations(DEFAULT_REGULATIONS);
  return DEFAULT_REGULATIONS;
}

export const KMK_RATES_STORAGE_KEY = "zhou_kmk_rates_v1";
export const KMK_RATES_EVENT = "zhou_kmk_rates_updated";

export interface KmkCurrencyRate {
  currency: string;
  name: string;
  rate: string;
  change: string;
  trend: "up" | "down" | "flat";
}

export interface StoredKmkData {
  kmkNumber: string;
  period: string;
  effectiveUntil: string;
  officialDjpUrl: string;
  lastUpdated: string;
  rates: KmkCurrencyRate[];
}

export const DEFAULT_KMK_DATA: StoredKmkData = {
  kmkNumber: "KMK No. 38/KM.10/2026",
  period: "10 September – 16 September 2026",
  effectiveUntil: "16 September 2026",
  officialDjpUrl: "https://fiskal.kemenkeu.go.id/informasi-publik/kurs-pajak",
  lastUpdated: "17 Sep 2026",
  rates: [
    { currency: "USD", name: "US Dollar", rate: "Rp 15.825,00", change: "+0.15%", trend: "up" },
    { currency: "EUR", name: "Euro", rate: "Rp 16.940,00", change: "-0.08%", trend: "down" },
    { currency: "SGD", name: "Singapore Dollar", rate: "Rp 11.890,00", change: "+0.05%", trend: "up" },
    { currency: "CNY", name: "Chinese Yuan", rate: "Rp 2.185,00", change: "+0.10%", trend: "up" },
    { currency: "JPY", name: "Japanese Yen (100)", rate: "Rp 10.450,00", change: "-0.22%", trend: "down" },
    { currency: "GBP", name: "British Pound", rate: "Rp 20.150,00", change: "+0.18%", trend: "up" },
    { currency: "AUD", name: "Australian Dollar", rate: "Rp 10.320,00", change: "-0.05%", trend: "down" },
  ],
};

export function getStoredKmkRates(): StoredKmkData {
  if (typeof window === "undefined") {
    return DEFAULT_KMK_DATA;
  }
  try {
    const raw = localStorage.getItem(KMK_RATES_STORAGE_KEY);
    if (!raw) return DEFAULT_KMK_DATA;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_KMK_DATA;
  }
}

export function saveStoredKmkRates(data: StoredKmkData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KMK_RATES_STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event(KMK_RATES_EVENT));
  } catch (err) {
    console.error("Gagal menyimpan kurs KMK:", err);
  }
}

