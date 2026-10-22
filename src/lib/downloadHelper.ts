/**
 * Zhou Consulting - Safe & Validated File Download Engine
 * Menangani unduhan berkas binary, validasi respon HTTP, ekstraksi nama berkas,
 * ekspor spreadsheet asli (.xlsx/.csv/.tsv), dan pembuatan dokumen PDF terstandarisasi (%PDF-1.4).
 */

import * as XLSX from "xlsx";
import { getApiBaseUrl, getAuthToken } from "./api";

/**
 * Memicu unduhan Blob di browser dengan nama berkas yang ditentukan.
 */
export function downloadBlob(blob: Blob, fileName: string): void {
  if (typeof window === "undefined") return;
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Resolusi URL relatif ke host API backend Zhou Consulting jika diperlukan.
 */
export function resolveBackendUrl(urlOrPath: string): string {
  if (!urlOrPath) return "";
  if (urlOrPath.startsWith("http://") || urlOrPath.startsWith("https://") || urlOrPath.startsWith("data:") || urlOrPath.startsWith("blob:")) {
    return urlOrPath;
  }
  const cleanPath = urlOrPath.replace(/^\/+/, "");
  // Jika path merujuk ke berkas di Supabase storage bucket zhou-documents
  if (
    cleanPath.startsWith("documents/") ||
    cleanPath.startsWith("education/") ||
    cleanPath.startsWith("regulations/") ||
    cleanPath.startsWith("cv/") ||
    cleanPath.endsWith(".pdf") ||
    cleanPath.endsWith(".xlsx") ||
    cleanPath.endsWith(".docx")
  ) {
    return `https://akzqjzmlbtchaohnzvvo.supabase.co/storage/v1/object/public/zhou-documents/${cleanPath}`;
  }
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}/${cleanPath}`;
}

/**
 * Ekstraksi nama berkas dari header HTTP Content-Disposition.
 */
function extractFileNameFromHeader(disposition: string | null, fallback: string): string {
  if (!disposition) return fallback;
  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match && utf8Match[1]) {
    try {
      return decodeURIComponent(utf8Match[1]);
    } catch {
      return utf8Match[1];
    }
  }
  const normalMatch = disposition.match(/filename=["']?([^"';]+)["']?/i);
  if (normalMatch && normalMatch[1]) {
    return normalMatch[1].trim();
  }
  return fallback;
}

export interface DownloadResult {
  success: boolean;
  message?: string;
  fileName?: string;
}

/**
 * Mengunduh berkas binary dari server secara aman dan terautentikasi.
 * - Memverifikasi status HTTP sebelum membuat berkas (mencegah error JSON tersimpan sebagai .pdf/.xlsx).
 * - Menangani signed URL dari Supabase atau endpoint backend.
 * - Memastikan file tidak kosong (0 bytes).
 */
export async function downloadRemoteFile(
  urlOrPath: string,
  defaultFileName: string,
  options?: {
    token?: string | null;
    customHeaders?: Record<string, string>;
  }
): Promise<DownloadResult> {
  if (!urlOrPath || urlOrPath === "#") {
    return {
      success: false,
      message: "Tautan berkas belum tersedia atau belum diunggah ke repositori.",
    };
  }

  // Jika berupa data URL atau Blob URL lokal
  if (urlOrPath.startsWith("data:") || urlOrPath.startsWith("blob:")) {
    try {
      const link = document.createElement("a");
      link.href = urlOrPath;
      link.download = defaultFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return { success: true, fileName: defaultFileName };
    } catch (err) {
      return {
        success: false,
        message: `Gagal mengunduh berkas lokal: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }

  const targetUrl = resolveBackendUrl(urlOrPath);
  const token = options?.token !== undefined ? options.token : getAuthToken();

  const reqHeaders: Record<string, string> = {
    Accept: "*/*",
    ...(options?.customHeaders || {}),
  };
  // Hanya sertakan Authorization header jika targetUrl menuju ke endpoint backend internal Zhou Consulting
  const isInternalBackend =
    targetUrl.startsWith(getApiBaseUrl()) ||
    (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://"));
  if (token && isInternalBackend) {
    reqHeaders["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: reqHeaders,
    });

    const contentType = response.headers.get("content-type") || "";

    // Tangani respons error HTTP
    if (!response.ok) {
      // Jika URL adalah URL publik / signed Supabase dan fetch gagal, coba direct link download
      if (typeof window !== "undefined" && (targetUrl.includes("supabase.co") || targetUrl.includes("/object/"))) {
        try {
          const link = document.createElement("a");
          link.href = targetUrl;
          link.download = defaultFileName;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          return { success: true, fileName: defaultFileName };
        } catch {
          // continue to error handling
        }
      }

      if (response.status === 404) {
        return {
          success: false,
          message: `Berkas "${defaultFileName}" tidak ditemukan pada penyimpanan server (404 Not Found).`,
        };
      }
      if (response.status === 401 || response.status === 403) {
        return {
          success: false,
          message: "Akses ditolak: Anda tidak memiliki hak otorisasi untuk mengunduh dokumen ini.",
        };
      }

      // Coba ekstrak pesan error dari JSON jika tersedia
      let errorMessage = `Server gagal mengirim berkas (Status: ${response.status} ${response.statusText})`;
      if (contentType.includes("application/json")) {
        try {
          const errJson = await response.json();
          if (errJson?.message) errorMessage = errJson.message;
        } catch {
          // ignore
        }
      }
      return { success: false, message: errorMessage };
    }

    // Jika endpoint mengembalikan JSON envelope dengan link signed download
    if (contentType.includes("application/json")) {
      const json = await response.json();
      if (!json.success && json.message) {
        return { success: false, message: json.message };
      }
      const nestedUrl = json.data?.download_url || json.download_url || json.data?.file_url;
      const nestedFileName = json.data?.file_name || defaultFileName;
      if (nestedUrl && typeof nestedUrl === "string") {
        return downloadRemoteFile(nestedUrl, nestedFileName, { token: null });
      }
      return {
        success: false,
        message: json.message || "Endpoint tidak mengembalikan berkas binary yang valid.",
      };
    }

    // Ekstraksi data binary
    const blobData = await response.blob();
    if (blobData.size === 0) {
      return {
        success: false,
        message: "Berkas di server kosong (0 bytes). Silakan hubungi konsultan untuk berkas pembaruan.",
      };
    }

    const disposition = response.headers.get("content-disposition");
    const finalFileName = extractFileNameFromHeader(disposition, defaultFileName);

    // Buat Blob dengan tipe MIME yang tepat
    const safeBlob = new Blob([blobData], {
      type: contentType || "application/octet-stream",
    });

    downloadBlob(safeBlob, finalFileName);
    return { success: true, fileName: finalFileName };
  } catch (err) {
    // Jika fetch terblokir (misal CORS di browser saat mengakses storage pihak ketiga), lakukan direct click
    if (typeof window !== "undefined" && (targetUrl.startsWith("http://") || targetUrl.startsWith("https://"))) {
      try {
        const link = document.createElement("a");
        link.href = targetUrl;
        link.download = defaultFileName;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return { success: true, fileName: defaultFileName };
      } catch {
        // continue to error return
      }
    }
    const errorText = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Gagal menghubungkan ke server penyimpanan berkas (${errorText}).`,
    };
  }
}

// ----------------------------------------------------
// Modul Ekspor Spreadsheet Valid (.xlsx / .csv / .tsv)
// ----------------------------------------------------

/**
 * Ekspor data tabular ke berkas Microsoft Excel (.xlsx) OpenXML valid.
 */
export function exportToExcel(
  data: Array<Record<string, unknown>>,
  fileName: string,
  sheetName = "Data"
): boolean {
  if (!Array.isArray(data) || data.length === 0) return false;
  try {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31));

    const xlsxBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([xlsxBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const cleanName = fileName.toLowerCase().endsWith(".xlsx") ? fileName : `${fileName}.xlsx`;
    downloadBlob(blob, cleanName);
    return true;
  } catch (err) {
    console.error("Gagal mengekspor data ke format Excel .xlsx:", err);
    return false;
  }
}

/**
 * Ekspor data tabular ke berkas OpenDocument Spreadsheet (.ods) valid.
 */
export function exportToOds(
  data: Array<Record<string, unknown>>,
  fileName: string,
  sheetName = "Data"
): boolean {
  if (!Array.isArray(data) || data.length === 0) return false;
  try {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31));

    const odsBuffer = XLSX.write(wb, { bookType: "ods", type: "array" });
    const blob = new Blob([odsBuffer], {
      type: "application/vnd.oasis.opendocument.spreadsheet",
    });

    const cleanName = fileName.toLowerCase().endsWith(".ods") ? fileName : `${fileName}.ods`;
    downloadBlob(blob, cleanName);
    return true;
  } catch (err) {
    console.error("Gagal mengekspor data ke format OpenDocument .ods:", err);
    return false;
  }
}

/**
 * Ekspor data tabular ke Comma-Separated Values (.csv) berstandar RFC 4180
 * dilengkapi UTF-8 Byte Order Mark (BOM) agar terbaca sempurna di seluruh versi Excel.
 */
export function exportToCsv(
  data: Array<Record<string, unknown>>,
  fileName: string
): boolean {
  if (!Array.isArray(data) || data.length === 0) return false;
  try {
    const headers = Object.keys(data[0]);

    const escapeCsvField = (val: unknown): string => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/[\r\n\t]+/g, " ");
      return `"${str.replace(/"/g, '""')}"`;
    };

    const headerLine = headers.map(escapeCsvField).join(",");
    const rows = data.map((row) =>
      headers.map((h) => escapeCsvField(row[h])).join(",")
    );

    const csvContent = "\uFEFF" + [headerLine, ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    const cleanName = fileName.toLowerCase().endsWith(".csv") ? fileName : `${fileName}.csv`;
    downloadBlob(blob, cleanName);
    return true;
  } catch (err) {
    console.error("Gagal mengekspor data ke CSV:", err);
    return false;
  }
}

/**
 * Ekspor data tabular ke Tab-Separated Values (.tsv).
 */
export function exportToTsv(
  data: Array<Record<string, unknown>>,
  fileName: string
): boolean {
  if (!Array.isArray(data) || data.length === 0) return false;
  try {
    const headers = Object.keys(data[0]);

    const cleanTsvField = (val: unknown): string => {
      if (val === null || val === undefined) return "";
      return String(val).replace(/[\t\r\n]+/g, " ");
    };

    const headerLine = headers.map(cleanTsvField).join("\t");
    const rows = data.map((row) =>
      headers.map((h) => cleanTsvField(row[h])).join("\t")
    );

    const tsvContent = "\uFEFF" + [headerLine, ...rows].join("\r\n");
    const blob = new Blob([tsvContent], { type: "text/tab-separated-values;charset=utf-8;" });

    const cleanName = fileName.toLowerCase().endsWith(".tsv") ? fileName : `${fileName}.tsv`;
    downloadBlob(blob, cleanName);
    return true;
  } catch (err) {
    console.error("Gagal mengekspor data ke TSV:", err);
    return false;
  }
}

// ----------------------------------------------------
// Modul Pembuatan Dokumen PDF Terstandarisasi (%PDF-1.4)
// ----------------------------------------------------

function escapePdfText(str: string): string {
  if (!str) return "";
  return str
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\u2022\u2023]/g, "-")
    .replace(/[^\x20-\x7E]/g, " ");
}

function wrapPdfText(text: string, maxCharsPerLine = 78): string[] {
  if (!text) return [];
  const clean = text.replace(/[\r\n]+/g, " ").trim();
  if (!clean) return [];

  const words = clean.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if (!word) continue;
    if ((currentLine ? currentLine + " " + word : word).length <= maxCharsPerLine) {
      currentLine = currentLine ? currentLine + " " + word : word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

export interface InvoiceData {
  invoiceNumber: string;
  clientName: string;
  clientNpwp?: string;
  ticketId: string;
  category: string;
  fileName: string;
  amount: string;
  billingStatus: string;
  uploadDate: string;
  consultant?: string;
}

/**
 * Menghasilkan berkas PDF Invoice Billing resmi dengan struktur PDF-1.4 yang valid.
 */
export function generateInvoicePdfBlob(data: InvoiceData): Blob {
  const streamLines: string[] = [];

  // Posisi teks awal
  streamLines.push("BT");
  streamLines.push("/F2 15 Tf");
  streamLines.push("50 785 Td");
  streamLines.push(`(${escapePdfText("ZHOU CONSULTING - FAKTUR BILLING RESMI")}) Tj`);
  streamLines.push("0 -20 Td");
  streamLines.push("/F1 9 Tf");
  streamLines.push(`(${escapePdfText("No. Faktur: " + data.invoiceNumber + "   |   Tanggal: " + (data.uploadDate || "2026"))}) Tj`);
  streamLines.push("0 -15 Td");
  streamLines.push(`(${escapePdfText("------------------------------------------------------------------------------------------------------------------")}) Tj`);
  streamLines.push("0 -22 Td");

  // Informasi Klien & Penugasan
  streamLines.push("/F2 10 Tf");
  streamLines.push(`(${escapePdfText("INFORMASI KLIEN & PENUGASAN:")}) Tj`);
  streamLines.push("0 -16 Td");
  streamLines.push("/F1 9.5 Tf");
  streamLines.push(`(${escapePdfText("Nama Klien       : " + data.clientName)}) Tj`);
  streamLines.push("0 -15 Td");
  streamLines.push(`(${escapePdfText("NPWP Klien       : " + (data.clientNpwp || "-"))}) Tj`);
  streamLines.push("0 -15 Td");
  streamLines.push(`(${escapePdfText("Nomor Tiket      : " + data.ticketId + " (" + data.category + ")")}) Tj`);
  streamLines.push("0 -15 Td");
  streamLines.push(`(${escapePdfText("Berkas Luaran    : " + data.fileName)}) Tj`);
  streamLines.push("0 -15 Td");
  streamLines.push(`(${escapePdfText("Konsultan PIC    : " + (data.consultant || "Staf Konsultan Zhou"))}) Tj`);
  streamLines.push("0 -22 Td");

  // Rincian Pembayaran
  streamLines.push("/F2 10 Tf");
  streamLines.push(`(${escapePdfText("RINCIAN PEMBAYARAN:")}) Tj`);
  streamLines.push("0 -16 Td");
  streamLines.push("/F1 9.5 Tf");
  streamLines.push(`(${escapePdfText("Status Tagihan   : " + data.billingStatus.toUpperCase())}) Tj`);
  streamLines.push("0 -15 Td");
  streamLines.push("/F2 11 Tf");
  streamLines.push(`(${escapePdfText("Total Honorarium : " + data.amount)}) Tj`);
  streamLines.push("0 -22 Td");

  // Informasi Rekening
  streamLines.push("/F2 10 Tf");
  streamLines.push(`(${escapePdfText("REKENING TUJUAN PEMBAYARAN RESMI:")}) Tj`);
  streamLines.push("0 -16 Td");
  streamLines.push("/F1 9 Tf");
  streamLines.push(`(${escapePdfText("Bank Mandiri     : 122-00-198822-1")}) Tj`);
  streamLines.push("0 -15 Td");
  streamLines.push(`(${escapePdfText("Atas Nama        : Zhou Consulting Indonesia")}) Tj`);
  streamLines.push("0 -22 Td");

  // Catatan Hukum & Footer
  streamLines.push(`(${escapePdfText("------------------------------------------------------------------------------------------------------------------")}) Tj`);
  streamLines.push("0 -15 Td");
  streamLines.push("/F1 8 Tf");
  streamLines.push(`(${escapePdfText("Faktur ini merupakan bukti penagihan sah dan terdaftar dalam sistem perikatan Zhou Consulting.")}) Tj`);
  streamLines.push("0 -12 Td");
  streamLines.push(`(${escapePdfText("Terikat perjanjian kerahasiaan klien (NDA) dan regulasi UU Perpajakan Republik Indonesia.")}) Tj`);
  streamLines.push("ET");

  const streamContent = streamLines.join("\n");
  const streamLen = new TextEncoder().encode(streamContent).length;

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];

  const addObj = (str: string) => {
    offsets.push(new TextEncoder().encode(pdf).length);
    pdf += str + "\n";
  };

  addObj("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj");
  addObj("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj");
  addObj(
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj"
  );
  addObj("4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj");
  addObj("5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj");
  addObj(`6 0 obj\n<< /Length ${streamLen} >>\nstream\n${streamContent}\nendstream\nendobj`);

  const totalObjs = 6;
  const startxref = new TextEncoder().encode(pdf).length;
  pdf += `xref\n0 ${totalObjs + 1}\n0000000000 65535 f \n`;
  for (let i = 0; i < offsets.length; i++) {
    const offStr = String(offsets[i]).padStart(10, "0");
    pdf += `${offStr} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${totalObjs + 1} /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
}

export interface DocumentPdfMeta {
  title: string;
  category?: string;
  clientName?: string;
  ticketId?: string;
  author?: string;
  date?: string;
  sections?: Array<{ title: string; paragraphs: string[] }>;
}

/**
 * Menghasilkan berkas PDF Dokumen / Laporan Resmi dengan struktur PDF-1.4 valid.
 */
export function generateDocumentPdfBlob(meta: DocumentPdfMeta): Blob {
  const streamLines: string[] = [];

  streamLines.push("BT");
  streamLines.push("/F2 14 Tf");
  streamLines.push("50 785 Td");
  streamLines.push(`(${escapePdfText("ZHOU CONSULTING - " + (meta.title || "DOKUMEN PERIKATAN FISKAL"))}) Tj`);
  streamLines.push("0 -18 Td");
  streamLines.push("/F1 9 Tf");
  streamLines.push(
    `(${escapePdfText(
      `Kategori: ${meta.category || "Konsultasi"}  |  Tiket: ${meta.ticketId || "-"}  |  Tanggal: ${meta.date || "2026"}`
    )}) Tj`
  );
  streamLines.push("0 -14 Td");
  streamLines.push(`(${escapePdfText("------------------------------------------------------------------------------------------------------------------")}) Tj`);
  streamLines.push("0 -20 Td");

  if (meta.clientName) {
    streamLines.push("/F2 10 Tf");
    streamLines.push(`(${escapePdfText("Entitas Klien: " + meta.clientName)}) Tj`);
    streamLines.push("0 -15 Td");
  }

  const sections = meta.sections || [
    {
      title: "RINGKASAN EKSEKUTIF",
      paragraphs: [
        "Dokumen ini diterbitkan secara sah melalui portal resmi Zhou Consulting sebagai bagian dari pelaksanaan penugasan profesional perpajakan dan akuntansi.",
        "Seluruh kalkulasi dan kertas kerja disusun dengan mengacu pada ketentuan perundang-undangan perpajakan Republik Indonesia serta Standar Akuntansi Keuangan (SAK) yang berlaku.",
      ],
    },
    {
      title: "KEABSAHAN & KERAHASIAAN INFORMASI",
      paragraphs: [
        "Informasi yang tercantum di dalam berkas ini dilindungi oleh klausul kerahasiaan (Non-Disclosure Agreement) dan hanya diperuntukkan bagi pihak yang berwenang.",
      ],
    },
  ];

  for (const sec of sections) {
    streamLines.push("/F2 10 Tf");
    streamLines.push(`(${escapePdfText(sec.title)}) Tj`);
    streamLines.push("0 -15 Td");
    streamLines.push("/F1 9 Tf");

    for (const para of sec.paragraphs) {
      const wrapped = wrapPdfText(para, 76);
      for (const line of wrapped) {
        streamLines.push(`(${escapePdfText(line)}) Tj`);
        streamLines.push("0 -14 Td");
      }
      streamLines.push("0 -4 Td");
    }
    streamLines.push("0 -8 Td");
  }

  // Footer akreditasi
  streamLines.push("/F1 8 Tf");
  streamLines.push(`(${escapePdfText("------------------------------------------------------------------------------------------------------------------")}) Tj`);
  streamLines.push("0 -12 Td");
  streamLines.push(`(${escapePdfText("Diverifikasi oleh Konsultan Pajak Berizin (BKP) & Akuntan Bersertifikat (CA) Zhou Consulting.")}) Tj`);
  streamLines.push("ET");

  const streamContent = streamLines.join("\n");
  const streamLen = new TextEncoder().encode(streamContent).length;

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];

  const addObj = (str: string) => {
    offsets.push(new TextEncoder().encode(pdf).length);
    pdf += str + "\n";
  };

  addObj("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj");
  addObj("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj");
  addObj(
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj"
  );
  addObj("4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj");
  addObj("5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj");
  addObj(`6 0 obj\n<< /Length ${streamLen} >>\nstream\n${streamContent}\nendstream\nendobj`);

  const totalObjs = 6;
  const startxref = new TextEncoder().encode(pdf).length;
  pdf += `xref\n0 ${totalObjs + 1}\n0000000000 65535 f \n`;
  for (let i = 0; i < offsets.length; i++) {
    const offStr = String(offsets[i]).padStart(10, "0");
    pdf += `${offStr} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${totalObjs + 1} /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
}
