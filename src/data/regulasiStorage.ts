"use client";

import { isCmsItemDeleted, recordDeletedCmsItem } from "./cmsDeletedStorage";

export type RegulationCategory =
  | "Regulasi Zhou"
  | "Undang-Undang"
  | "Peraturan Pemerintah"
  | "Peraturan Menteri"
  | "Peraturan DJP"
  | "Keputusan KMK";

export type RegulationLegalStatus = "Berlaku" | "Diperbarui" | "Tidak Berlaku";
export type RegulationPublicationStatus = "Published" | "Draft" | "Archived";
export type RegulationStatus = RegulationLegalStatus | RegulationPublicationStatus | "Pembaruan";

export interface RegulationLegalMeta {
  status: RegulationLegalStatus;
  replacementRef?: string;
}

export interface StoredRegulationItem {
  id: string;
  docNumber: string;
  title: string;
  category: RegulationCategory;
  effectiveDate: string;
  scope: string;
  fileSize: string;
  status: RegulationStatus;
  legalStatus?: RegulationLegalStatus;
  replacementRef?: string;
  downloadUrl?: string;
  fileDataUrl?: string;
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

export function mapToRegulationCategory(typeOrCategory?: string, title?: string): RegulationCategory {
  const combined = `${typeOrCategory || ""} ${title || ""}`.toLowerCase().trim();

  if (combined.includes("zhou") || combined.includes("internal") || combined.includes("sop")) {
    return "Regulasi Zhou";
  }
  if (
    combined.includes("undang-undang") ||
    combined.includes("uu ") ||
    combined.includes("uu-") ||
    combined.includes("uu no") ||
    combined === "uu" ||
    (typeOrCategory && typeOrCategory.toUpperCase() === "UU")
  ) {
    return "Undang-Undang";
  }
  if (
    combined.includes("peraturan pemerintah") ||
    combined.includes("pp ") ||
    combined.includes("pp-") ||
    combined.includes("pp no") ||
    combined === "pp" ||
    (typeOrCategory && typeOrCategory.toUpperCase() === "PP")
  ) {
    return "Peraturan Pemerintah";
  }
  if (
    combined.includes("keputusan kmk") ||
    combined.includes("keputusan menteri") ||
    combined.includes("kmk") ||
    (typeOrCategory && typeOrCategory.toUpperCase() === "KMK")
  ) {
    return "Keputusan KMK";
  }
  if (
    combined.includes("peraturan djp") ||
    combined.includes("dirjen") ||
    combined.includes("djp") ||
    combined.includes("direktur jenderal") ||
    combined.includes("perdirjen") ||
    combined.includes("per-") ||
    combined.includes("per ") ||
    combined.includes("se-") ||
    combined.includes("se ") ||
    combined.includes("surat edaran") ||
    (typeOrCategory && (typeOrCategory.toUpperCase() === "PER" || typeOrCategory.toUpperCase() === "SE"))
  ) {
    return "Peraturan DJP";
  }
  if (
    combined.includes("menteri") ||
    combined.includes("pmk") ||
    (typeOrCategory && typeOrCategory.toUpperCase() === "PMK")
  ) {
    return "Peraturan Menteri";
  }

  if (typeOrCategory === "Regulasi Zhou") return "Regulasi Zhou";
  if (typeOrCategory === "Undang-Undang") return "Undang-Undang";
  if (typeOrCategory === "Peraturan Pemerintah") return "Peraturan Pemerintah";
  if (typeOrCategory === "Peraturan Menteri") return "Peraturan Menteri";
  if (typeOrCategory === "Peraturan DJP") return "Peraturan DJP";
  if (typeOrCategory === "Keputusan KMK") return "Keputusan KMK";

  return "Peraturan Menteri";
}

export const DEFAULT_REGULATIONS: StoredRegulationItem[] = [
  {
    "id": "ZHOU-REG-01",
    "docNumber": "SOP-ZHOU/TAX/2026/01",
    "title": "Standar Prosedur Operasional Kepatuhan Coretax & Rekonsiliasi SPT Unifikasi Zhou",
    "category": "Regulasi Zhou",
    "effectiveDate": "2 Januari 2026",
    "scope": "Pedoman kerja dan kepatuhan penyusunan rekonsiliasi fiskal, tata kelola akun deposit pajak, dan integrasi modul unifikasi Coretax DJP bagi klien korporat Zhou Consulting.",
    "fileSize": "1.4 MB",
    "status": "Berlaku"
  },
  {
    "id": "ZHOU-REG-02",
    "docNumber": "GUIDE-ZHOU/ACC/2025/03",
    "title": "Panduan Teknis Pelaporan Keuangan Standar SAK EP Entitas Privat & Manufaktur",
    "category": "Regulasi Zhou",
    "effectiveDate": "15 Juli 2025",
    "scope": "Standar operasional konversi pembukuan komersial ke SAK EP, prosedur revaluasi aset tetap, dan pedoman pengungkapan catatan atas laporan keuangan (CALK).",
    "fileSize": "2.2 MB",
    "status": "Berlaku"
  },
  {
    "id": "ZHOU-REG-03",
    "docNumber": "CIRCULAR-ZHOU/TP/2026/02",
    "title": "Surat Edaran Teknis: Tata Kelola Dokumentasi Transfer Pricing (TP Doc Local File)",
    "category": "Regulasi Zhou",
    "effectiveDate": "10 Februari 2026",
    "scope": "Instruksi kerja telaah kepatuhan transaksi hubungan istimewa domestik dan lintas batas, penerapan metode Arm's Length Principle (ALP), serta benchmarking rasio profitabilitas.",
    "fileSize": "1.9 MB",
    "status": "Pembaruan"
  },
  {
    "id": "REG-01",
    "docNumber": "UU No. 7 Tahun 2021",
    "title": "Harmonisasi Peraturan Perpajakan (UU HPP)",
    "category": "Undang-Undang",
    "effectiveDate": "29 Oktober 2021",
    "scope": "Reformasi PPh Badan, kenaikan tarif PPN 11%, integrasi NIK menjadi NPWP, dan program pengungkapan sukarela.",
    "fileSize": "2.4 MB",
    "status": "Berlaku"
  },
  {
    "id": "REG-02",
    "docNumber": "PMK No. 168/PMK.03/2023",
    "title": "Petunjuk Teknis Pemotongan Pajak atas Penghasilan Sehubungan dengan Pekerjaan (PPh 21 TER)",
    "category": "Peraturan Menteri",
    "effectiveDate": "1 Januari 2024",
    "scope": "Penerapan skema Tarif Efektif Rata-Rata (TER) PPh 21 bulanan kategori A, B, C dan TER harian pegawai.",
    "fileSize": "1.8 MB",
    "status": "Berlaku"
  },
  {
    "id": "REG-03",
    "docNumber": "PMK No. 81 Tahun 2024",
    "title": "Ketentuan Perpajakan dalam Rangka Pelaksanaan Sistem Inti Administrasi Perpajakan (Coretax)",
    "category": "Peraturan Menteri",
    "effectiveDate": "1 Januari 2025",
    "scope": "Standardisasi akun wajib pajak, deposit pajak terpadu, e-Bupot unifikasi, dan pemadanan NIK 16 digit.",
    "fileSize": "3.7 MB",
    "status": "Pembaruan"
  },
  {
    "id": "REG-04",
    "docNumber": "PP No. 55 Tahun 2022",
    "title": "Penyesuaian Pengaturan di Bidang Pajak Penghasilan Badan dan Orang Pribadi",
    "category": "Peraturan Pemerintah",
    "effectiveDate": "20 Desember 2022",
    "scope": "Perlakuan natura/kenikmatan, instrumen pencegahan penghindaran pajak (GAAR), dan batasan omzet tidak kena pajak UMKM.",
    "fileSize": "1.9 MB",
    "status": "Berlaku"
  },
  {
    "id": "REG-05",
    "docNumber": "PER-04/PJ/2024",
    "title": "Petunjuk Teknis Administrasi Nomor Pokok Wajib Pajak dan Sertifikat Elektronik Coretax DJP",
    "category": "Peraturan DJP",
    "effectiveDate": "1 Juli 2024",
    "scope": "Tata cara aktivasi akun wajib pajak baru, penataan sertifikat digital, dan otentikasi multi-faktor DJP.",
    "fileSize": "2.1 MB",
    "status": "Berlaku"
  },
  {
    "id": "REG-06",
    "docNumber": "KMK No. 38/KM.10/2026",
    "title": "Nilai Kurs Valuta Asing sebagai Dasar Pelunasan Bea Masuk, PPN, dan PPh",
    "category": "Keputusan KMK",
    "effectiveDate": "15 September 2026",
    "scope": "Penetapan kurs pajak mingguan resmi Kemenkeu untuk konversi transaksi ekspor, impor, dan faktur valas.",
    "fileSize": "850 KB",
    "status": "Berlaku"
  },
  {
    "id": "REG-07",
    "docNumber": "PER-03/PJ/2022 jo PER-11/PJ/2022",
    "title": "Pedoman Teknis Faktur Pajak Elektronik (e-Faktur PPN)",
    "category": "Peraturan DJP",
    "effectiveDate": "1 April 2022",
    "scope": "Ketentuan upload faktur pajak keluaran paling lambat tanggal 15 bulan berikutnya serta mitigasi faktur fiktif.",
    "fileSize": "1.5 MB",
    "status": "Berlaku"
  },
  {
    "id": "REG-08",
    "docNumber": "PER-17/PJ/2021",
    "title": "Tata Cara Pembuatan Bukti Pemotongan/Pemungutan Unifikasi dan Pelaporan SPT Masa PPh Unifikasi",
    "category": "Peraturan DJP",
    "effectiveDate": "1 Januari 2022",
    "scope": "Integrasi pelaporan PPh Pasal 22, 23, 26, dan PPh Final Pasal 4 ayat (2) ke dalam satu format pelaporan digital.",
    "fileSize": "2.8 MB",
    "status": "Berlaku"
  },
  {
    "id": "REG-09",
    "docNumber": "PP No. 44 Tahun 2022",
    "title": "Penerapan Pajak Pertambahan Nilai Barang dan Jasa serta Pajak Penjualan atas Barang Mewah",
    "category": "Peraturan Pemerintah",
    "effectiveDate": "2 Desember 2022",
    "scope": "Penunjukan pemungut PPN PMSE (perdagangan melalui sistem elektronik) dan fasilitas PPN dibebaskan/tidak dipungut.",
    "fileSize": "1.6 MB",
    "status": "Berlaku"
  },
  {
    "id": "REG-10",
    "docNumber": "UU No. 1 Tahun 2022",
    "title": "Hubungan Keuangan antara Pemerintah Pusat dan Pemerintahan Daerah (UU HKPD)",
    "category": "Undang-Undang",
    "effectiveDate": "5 Januari 2022",
    "scope": "Penyelarasan Pajak Daerah dan Retribusi Daerah (PDRD) dengan tarif PBJT korporat serta opsen pajak provinsi/kabupaten.",
    "fileSize": "3.2 MB",
    "status": "Berlaku"
  }
];

export const REGULATIONS_STORAGE_KEY = "zhou_regulations_data_v2";
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
    const source: StoredRegulationItem[] = raw ? JSON.parse(raw) : DEFAULT_REGULATIONS;
    if (Array.isArray(source)) {
      return source.filter((item) => !isCmsItemDeleted(item.id, item.title, undefined, item.docNumber));
    }
    return DEFAULT_REGULATIONS.filter((item) => !isCmsItemDeleted(item.id, item.title, undefined, item.docNumber));
  } catch (error) {
    console.error("Gagal membaca zhou_regulations_data dari localStorage:", error);
    return DEFAULT_REGULATIONS.filter((item) => !isCmsItemDeleted(item.id, item.title, undefined, item.docNumber));
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
 * Memperbarui regulasi / dokumen peraturan (UPDATE).
 * Jika tidak ditemukan, upsert agar edit regulasi dari backend juga tersimpan lokal.
 */
export function updateRegulation(
  id: string,
  changes: Partial<StoredRegulationItem>
): StoredRegulationItem[] {
  const current = getStoredRegulations();
  const existingIndex = current.findIndex((item) => item.id === id);

  if (existingIndex !== -1) {
    const updated = current.map((item) => {
      if (item.id === id) {
        return { ...item, ...changes };
      }
      return item;
    });
    saveStoredRegulations(updated);
    return updated;
  } else {
    // Upsert: backend item not in localStorage
    const upserted: StoredRegulationItem = {
      id,
      docNumber: changes.docNumber || id,
      title: changes.title || id,
      category: changes.category || "Peraturan Menteri",
      effectiveDate: changes.effectiveDate || new Date().toLocaleDateString("id-ID"),
      scope: changes.scope || "",
      fileSize: changes.fileSize || "PDF",
      status: changes.status || "Published",
      downloadUrl: changes.downloadUrl,
      ...changes,
    };
    const updated = [upserted, ...current];
    saveStoredRegulations(updated);
    return updated;
  }
}


/**
 * Menghapus regulasi / dokumen peraturan (DELETE)
 */
export function deleteRegulation(idOrTitle: string): StoredRegulationItem[] {
  recordDeletedCmsItem({ id: idOrTitle, title: idOrTitle });
  const current = getStoredRegulations();
  const target = idOrTitle.trim().toLowerCase();
  const targetSlug = target.replace(/[^a-z0-9]+/g, "-");
  const updated = current.filter((item) => {
    if (isCmsItemDeleted(item.id, item.title, undefined, item.docNumber)) return false;
    const rTitle = item.title.trim().toLowerCase();
    const rId = item.id.trim().toLowerCase();
    const rDoc = item.docNumber.trim().toLowerCase();
    return (
      item.id !== idOrTitle &&
      rId !== target &&
      rId !== targetSlug &&
      rTitle !== target &&
      rDoc !== target
    );
  });
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

export const KMK_RATES_STORAGE_KEY = "zhou_kmk_rates_v3";
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

export const DEFAULT_KMK_RATES: KmkCurrencyRate[] = [
  { currency: "USD", name: "Dolar Amerika Serikat", rate: "Rp 17.935,00", change: "+72,00", trend: "up" },
  { currency: "EUR", name: "Euro", rate: "Rp 20.281,62", change: "-105,91", trend: "down" },
  { currency: "SGD", name: "Dolar Singapura", rate: "Rp 14.031,23", change: "+49,26", trend: "up" },
  { currency: "AUD", name: "Dolar Australia", rate: "Rp 12.496,39", change: "-117,25", trend: "down" },
  { currency: "GBP", name: "Poundsterling Inggris", rate: "Rp 23.742,35", change: "+14,12", trend: "up" },
  { currency: "JPY", name: "Yen Jepang (100)", rate: "Rp 11.379,64", change: "+62,75", trend: "up" },
  { currency: "CNY", name: "Yuan Renminbi Tiongkok", rate: "Rp 2.672,92", change: "+10,15", trend: "up" },
  { currency: "MYR", name: "Ringgit Malaysia", rate: "Rp 4.392,54", change: "+12,21", trend: "up" },
  { currency: "HKD", name: "Dolar Hongkong", rate: "Rp 2.285,74", change: "+8,43", trend: "up" },
  { currency: "CAD", name: "Dolar Kanada", rate: "Rp 12.618,02", change: "-54,05", trend: "down" },
  { currency: "CHF", name: "Franc Swiss", rate: "Rp 21.547,68", change: "-114,70", trend: "down" },
  { currency: "SAR", name: "Riyal Saudi Arabia", rate: "Rp 4.776,86", change: "+19,89", trend: "up" },
  { currency: "THB", name: "Baht Thailand", rate: "Rp 533,78", change: "-2,51", trend: "down" },
  { currency: "KRW", name: "Won Korea", rate: "Rp 13,23", change: "+0,14", trend: "up" },
];

export const DEFAULT_KMK_DATA: StoredKmkData = {
  kmkNumber: "KMK Nomor 48/MK/EF.2/2026",
  period: "07 Oktober 2026 - 13 Oktober 2026",
  effectiveUntil: "Terupdate Berkala Otomatis (Mingguan)",
  officialDjpUrl: "https://fiskal.kemenkeu.go.id/informasi-publik/kurs-pajak",
  lastUpdated: "Resmi Kementerian Keuangan / DJP",
  rates: DEFAULT_KMK_RATES,
};

export function getStoredKmkRates(): StoredKmkData {
  if (typeof window === "undefined") {
    return DEFAULT_KMK_DATA;
  }
  try {
    const raw = localStorage.getItem(KMK_RATES_STORAGE_KEY);
    if (!raw) return DEFAULT_KMK_DATA;
    const parsed = JSON.parse(raw);

    // Validasi agar data korup atau inputan manual lama (< 3 valas atau valas duplikat) tidak merusak tampilan
    const validRates =
      Array.isArray(parsed.rates) && parsed.rates.length >= 3
        ? parsed.rates
        : DEFAULT_KMK_RATES;

    return {
      ...DEFAULT_KMK_DATA,
      ...parsed,
      officialDjpUrl: parsed.officialDjpUrl || DEFAULT_KMK_DATA.officialDjpUrl,
      rates: validRates,
    };
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

/**
 * Sinkronisasi otomatis dari endpoint DJP resmi (/api/kurs-pajak)
 */
export async function syncKmkRatesFromDjp(): Promise<StoredKmkData> {
  if (typeof window === "undefined") return DEFAULT_KMK_DATA;

  try {
    const res = await fetch("/api/kurs-pajak");
    if (!res.ok) throw new Error("Gagal mengambil data dari /api/kurs-pajak");
    const json = await res.json();

    if (json?.rates && Array.isArray(json.rates) && json.rates.length > 0) {
      const liveData: StoredKmkData = {
        kmkNumber: json.kmkNumber || DEFAULT_KMK_DATA.kmkNumber,
        period: json.period || DEFAULT_KMK_DATA.period,
        effectiveUntil: json.effectiveUntil || DEFAULT_KMK_DATA.effectiveUntil,
        officialDjpUrl: json.officialDjpUrl || DEFAULT_KMK_DATA.officialDjpUrl,
        lastUpdated: json.lastUpdated || new Date().toISOString(),
        rates: json.rates,
      };
      saveStoredKmkRates(liveData);
      return liveData;
    }
  } catch (err) {
    console.warn("syncKmkRatesFromDjp fallback ke data tersimpan:", err);
  }

  return getStoredKmkRates();
}

export const REGULATION_LEGAL_STATUS_KEY = "zhou_regulations_legal_status_v1";
export const REGULATION_LEGAL_META_KEY = "zhou_regulations_legal_meta_v2";

export function getStoredRegulationLegalMeta(): Record<string, RegulationLegalMeta> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(REGULATION_LEGAL_META_KEY);
    const parsed: Record<string, RegulationLegalMeta> = raw ? JSON.parse(raw) : {};

    // Fallback baca key status v1 lama
    const rawOld = localStorage.getItem(REGULATION_LEGAL_STATUS_KEY);
    if (rawOld) {
      const oldMap = JSON.parse(rawOld);
      Object.entries(oldMap).forEach(([k, v]) => {
        if (!parsed[k]) {
          const normStatus: RegulationLegalStatus =
            v === "Pembaruan" || v === "Diperbarui"
              ? "Diperbarui"
              : v === "Tidak Berlaku"
              ? "Tidak Berlaku"
              : "Berlaku";
          parsed[k] = { status: normStatus };
        }
      });
    }

    return parsed;
  } catch {
    return {};
  }
}

export function getStoredRegulationLegalStatus(): Record<string, RegulationLegalStatus> {
  const metaMap = getStoredRegulationLegalMeta();
  const statusMap: Record<string, RegulationLegalStatus> = {};
  Object.entries(metaMap).forEach(([k, v]) => {
    statusMap[k] = v.status;
  });
  return statusMap;
}

export function setStoredRegulationLegalStatus(
  idOrTitle: string,
  status: RegulationLegalStatus | "Pembaruan",
  replacementRef?: string
): void {
  if (typeof window === "undefined") return;
  try {
    const normalizedStatus: RegulationLegalStatus =
      status === "Pembaruan" || status === "Diperbarui"
        ? "Diperbarui"
        : status === "Tidak Berlaku"
        ? "Tidak Berlaku"
        : "Berlaku";

    const currentMeta = getStoredRegulationLegalMeta();
    const cleanRef = replacementRef ? replacementRef.trim() : "";
    const meta: RegulationLegalMeta = {
      status: normalizedStatus,
      replacementRef: cleanRef || undefined,
    };

    const keyLower = idOrTitle.trim().toLowerCase();
    currentMeta[keyLower] = meta;
    currentMeta[idOrTitle] = meta;

    localStorage.setItem(REGULATION_LEGAL_META_KEY, JSON.stringify(currentMeta));

    // Sinkronkan juga key v1 untuk backwards compatibility
    const oldStatusMap = getStoredRegulationLegalStatus();
    oldStatusMap[keyLower] = normalizedStatus;
    oldStatusMap[idOrTitle] = normalizedStatus;
    localStorage.setItem(REGULATION_LEGAL_STATUS_KEY, JSON.stringify(oldStatusMap));

    window.dispatchEvent(new CustomEvent(REGULATIONS_EVENT));
  } catch (err) {
    console.error("Gagal menyimpan status legal regulasi:", err);
  }
}

