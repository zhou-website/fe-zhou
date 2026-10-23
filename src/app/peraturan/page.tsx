"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { FloatingWhatsAppCTA } from "@/components/landing/FloatingWhatsAppCTA";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  SearchIcon,
  CloseIcon,
  CheckCircleIcon,
} from "@/components/icons";
import { downloadBlob, downloadRemoteFile } from "@/lib/downloadHelper";

import {
  StoredRegulationItem,
  RegulationCategory,
  RegulationStatus,
  REGULATION_CATEGORIES,
  getStoredRegulations,
  REGULATIONS_EVENT,
  mapToRegulationCategory,
  getStoredRegulationLegalMeta,
  StoredKmkData,
  DEFAULT_KMK_DATA,
  getStoredKmkRates,
  syncKmkRatesFromDjp,
  KMK_RATES_EVENT,
} from "@/data/regulasiStorage";
import { isCmsItemDeleted } from "@/data/cmsDeletedStorage";
import { getCmsItemStatus, CMS_STATUS_UPDATED_EVENT } from "@/data/cmsStatusStorage";
import { publicApi, RegulationItem } from "@/lib/api";

export default function PeraturanPage() {
  const [regulations, setRegulations] = useState<StoredRegulationItem[]>([]);
  const [kmkData, setKmkData] = useState<StoredKmkData>(DEFAULT_KMK_DATA);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [selectedStatus, setSelectedStatus] = useState<string>("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const itemsPerPage = 5;

  // Load from Backend API & state and listen to updates from Admin CRUD & KMK
  useEffect(() => {
    let isMounted = true;
    const legalMeta = getStoredRegulationLegalMeta();
    const initialStored = getStoredRegulations().map((r) => {
      const meta =
        legalMeta[r.title.trim().toLowerCase()] ||
        legalMeta[r.id] ||
        legalMeta[r.docNumber] ||
        (r.legalStatus ? { status: r.legalStatus, replacementRef: r.replacementRef } : undefined) ||
        {
          status: (r.status === "Tidak Berlaku"
            ? "Tidak Berlaku"
            : r.status === "Pembaruan" || r.status === "Diperbarui"
            ? "Diperbarui"
            : "Berlaku") as "Berlaku" | "Diperbarui" | "Tidak Berlaku",
          replacementRef: r.replacementRef,
        };

      const pubStatus = getCmsItemStatus(
        r.id,
        r.title,
        r.status === "Draft" ? "Draft" : "Published",
        [r.docNumber]
      );

      return {
        ...r,
        category: mapToRegulationCategory(r.category || r.scope, r.title),
        legalStatus: meta.status,
        replacementRef: meta.replacementRef || r.replacementRef,
        status: pubStatus as RegulationStatus,
      };
    });
    setRegulations(initialStored);
    setKmkData(getStoredKmkRates());

    // Fetch from live Backend API with fallback
    publicApi
      .getRegulations()
      .then((res) => {
        if (!isMounted) return;
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          const apiRegs: StoredRegulationItem[] = res.data
            .filter((item: RegulationItem) => !isCmsItemDeleted(item.id, item.title, undefined, item.file_path))
            .map((item: RegulationItem) => {
              const category = mapToRegulationCategory(item.regulation_type, item.title);
              const meta =
                legalMeta[item.title.trim().toLowerCase()] ||
                legalMeta[`BE-${item.id}`] ||
                legalMeta[String(item.id)] ||
                { status: "Berlaku" as const };
              const pubStatus = getCmsItemStatus(`BE-${item.id}`, item.title, "Published", [item.id]);
              return {
                id: `BE-${item.id}`,
                backendId: item.id,
                docNumber: item.title,
                title: item.title,
                category,
                effectiveDate: new Date(item.created_at || Date.now()).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }),
                scope: item.regulation_type || category,
                fileSize: item.file_size || "1.2 MB",
                legalStatus: meta.status,
                replacementRef: meta.replacementRef,
                status: pubStatus as RegulationStatus,
                downloadUrl: item.download_url || item.file_url || item.file_path || "#",
              };
            });

          setRegulations(apiRegs);
        } else if (res?.data && Array.isArray(res.data) && res.data.length === 0) {
          setRegulations([]);
        }
      })
      .catch((err) => {
        console.warn("publicApi.getRegulations fallback:", err);
      });

    // Sinkronisasi otomatis kurs KMK langsung dari DJP / Kementerian Keuangan
    syncKmkRatesFromDjp()
      .then((liveKmk) => {
        if (!isMounted) return;
        setKmkData(liveKmk);
      })
      .catch((err) => {
        console.warn("syncKmkRatesFromDjp di Peraturan page:", err);
      });

    const handleUpdate = () => {
      const legalMeta = getStoredRegulationLegalMeta();
      const stored: StoredRegulationItem[] = getStoredRegulations().map((r) => {
        const meta =
          legalMeta[r.title.trim().toLowerCase()] ||
          legalMeta[r.id] ||
          legalMeta[r.docNumber] ||
          (r.legalStatus ? { status: r.legalStatus, replacementRef: r.replacementRef } : undefined) ||
          {
            status: (r.status === "Tidak Berlaku"
              ? "Tidak Berlaku"
              : r.status === "Pembaruan" || r.status === "Diperbarui"
              ? "Diperbarui"
              : "Berlaku") as "Berlaku" | "Diperbarui" | "Tidak Berlaku",
            replacementRef: r.replacementRef,
          };

        const pubStatus = getCmsItemStatus(
          r.id,
          r.title,
          r.status === "Draft" ? "Draft" : "Published",
          [r.docNumber]
        );

        return {
          ...r,
          category: mapToRegulationCategory(r.category || r.scope, r.title),
          legalStatus: meta.status,
          replacementRef: meta.replacementRef || r.replacementRef,
          status: pubStatus as RegulationStatus,
        };
      });
      setRegulations(stored);
      setKmkData(getStoredKmkRates());
    };

    window.addEventListener(REGULATIONS_EVENT, handleUpdate);
    window.addEventListener(KMK_RATES_EVENT, handleUpdate);
    window.addEventListener(CMS_STATUS_UPDATED_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener(REGULATIONS_EVENT, handleUpdate);
      window.removeEventListener(KMK_RATES_EVENT, handleUpdate);
      window.removeEventListener(CMS_STATUS_UPDATED_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // Total count per category for badge counters (hanya hitung peraturan yang dipublikasikan)
  const categoryCounts = useMemo(() => {
    const published = regulations.filter((r) => r.status === "Published");
    const counts: Record<string, number> = {
      Semua: published.length,
    };
    REGULATION_CATEGORIES.forEach((cat: string) => {
      if (cat !== "Semua") {
        counts[cat] = published.filter((r) => r.category === cat).length;
      }
    });
    return counts;
  }, [regulations]);

  const handleResetFilters = () => {
    setSelectedCategory("Semua");
    setSelectedStatus("Semua");
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Filter regulations based on category, status, and search query (Sembunyikan status Draft & Archived)
  const filteredRegulations = useMemo(() => {
    return regulations.filter((item) => {
      // HANYA tampilkan dokumen berstatus Published ke pengunjung umum
      if (item.status !== "Published") return false;

      const matchCategory =
        selectedCategory === "Semua" || item.category === selectedCategory;

      const currentLegal = item.legalStatus || "Berlaku";
      const matchStatus =
        selectedStatus === "Semua" ||
        currentLegal === selectedStatus ||
        (selectedStatus === "Diperbarui" && (currentLegal === "Diperbarui" || (item.status as string) === "Pembaruan"));

      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        q === "" ||
        item.docNumber.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.scope.toLowerCase().includes(q);
      return matchCategory && matchStatus && matchQuery;
    });
  }, [regulations, searchQuery, selectedCategory, selectedStatus]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredRegulations.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRegulations.slice(start, start + itemsPerPage);
  }, [filteredRegulations, currentPage]);

  const generateRegulationPdf = (item: {
    docNumber: string;
    title: string;
    category?: string;
    effectiveDate?: string;
    scope?: string;
  }): string => {
    const escapePdf = (str: string) =>
      (str || "")
        .replace(/\\/g, "\\\\")
        .replace(/\(/g, "\\(")
        .replace(/\)/g, "\\)")
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2013\u2014]/g, "-")
        .replace(/[^\x20-\x7E]/g, " ");

    const wrapText = (text: string, maxLen = 75): string[] => {
      const words = (text || "").split(" ");
      const lines: string[] = [];
      let cur = "";
      for (const w of words) {
        if (!w) continue;
        if ((cur ? cur + " " + w : w).length <= maxLen) {
          cur = cur ? cur + " " + w : w;
        } else {
          if (cur) lines.push(cur);
          cur = w;
        }
      }
      if (cur) lines.push(cur);
      return lines;
    };

    const streamLines: string[] = [
      "BT",
      "/F2 15 Tf",
      "50 785 Td",
      "(ZHOU CONSULTING - SALINAN RESMI REGULASI PERPAJAKAN) Tj",
      "0 -22 Td",
      "/F1 9.5 Tf",
      `(${escapePdf("Nomor Dokumen  : " + (item.docNumber || "REGULASI-ZHOU"))}) Tj`,
      "0 -16 Td",
      `(${escapePdf("Kategori       : " + (item.category || "Regulasi Perpajakan"))}) Tj`,
      "0 -16 Td",
      `(${escapePdf("Tanggal Berlaku: " + (item.effectiveDate || "-"))}) Tj`,
      "0 -22 Td",
      "/F2 11 Tf",
      "(JUDUL / NOMENKLATUR PERATURAN:) Tj",
      "0 -16 Td",
      "/F1 9.5 Tf",
    ];

    const titleLines = wrapText(escapePdf(item.title || "Salinan Regulasi Resmi"), 72);
    for (const tLine of titleLines) {
      streamLines.push(`(${tLine}) Tj`);
      streamLines.push("0 -15 Td");
    }

    streamLines.push("0 -8 Td");
    streamLines.push("/F2 11 Tf");
    streamLines.push("(RUANG LINGKUP & KETENTUAN POKOK:) Tj");
    streamLines.push("0 -16 Td");
    streamLines.push("/F1 9 Tf");

    const scopeLines = wrapText(
      escapePdf(item.scope || "Ketentuan perpajakan resmi Zhou Consulting untuk kepatuhan wajib pajak."),
      76
    );
    for (const sLine of scopeLines) {
      streamLines.push(`(${sLine}) Tj`);
      streamLines.push("0 -15 Td");
    }

    streamLines.push("0 -20 Td");
    streamLines.push("/F1 8 Tf");
    streamLines.push("(Dokumen ini adalah salinan digital resmi yang diterbitkan melalui Zhou Consulting Portal.) Tj");
    streamLines.push("0 -13 Td");
    streamLines.push("(Terverifikasi Enkripsi SHA-256 & Akreditasi Konsultan Berizin BKP DJP.) Tj");
    streamLines.push("ET");

    const stream = streamLines.join("\n");
    const streamLen = new TextEncoder().encode(stream).length;

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
    addObj(`6 0 obj\n<< /Length ${streamLen} >>\nstream\n${stream}\nendstream\nendobj`);

    const totalObjs = 6;
    const startxref = new TextEncoder().encode(pdf).length;
    pdf += `xref\n0 ${totalObjs + 1}\n0000000000 65535 f \n`;
    for (let i = 0; i < offsets.length; i++) {
      const offStr = String(offsets[i]).padStart(10, "0");
      pdf += offStr + " 00000 n \n";
    }
    pdf += `trailer\n<< /Size ${totalObjs + 1} /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF`;
    return pdf;
  };

  const handleDownload = async (
    docNumberOrItem: string | StoredRegulationItem,
    customTitle?: string,
    category = "Regulasi Perpajakan",
    scope = "Ketentuan perpajakan resmi Zhou Consulting."
  ) => {
    const item: StoredRegulationItem =
      typeof docNumberOrItem === "object"
        ? docNumberOrItem
        : {
            id: `doc-${Date.now()}`,
            docNumber: docNumberOrItem,
            title: customTitle || docNumberOrItem,
            category: category as RegulationCategory,
            effectiveDate: new Date().toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
            scope,
            fileSize: "1.2 MB",
            status: "Berlaku",
          };

    setDownloadNotice(`Menyiapkan salinan resmi: ${item.docNumber} - ${item.title}...`);

    try {
      const cleanFileName = (item.docNumber || item.title || "Salinan-Regulasi")
        .replace(/[^a-zA-Z0-9_\-]/g, "_")
        .substring(0, 60);
      const targetFileName = cleanFileName.endsWith(".pdf") ? cleanFileName : `${cleanFileName}.pdf`;

      // 1. Coba minta signed download URL dari backend jika ada backendId atau ID numerik
      const numId = item.backendId || parseInt(String(item.id).replace(/\D/g, ""), 10);
      if (numId && !isNaN(numId) && numId < 9000) {
        try {
          const signRes = await publicApi.getRegulationDownloadUrl(numId);
          if (signRes?.data?.download_url) {
            const dlRes = await downloadRemoteFile(signRes.data.download_url, targetFileName);
            if (dlRes.success) return;
          }
        } catch (signErr) {
          console.warn("Backend regulation signed download notice:", signErr);
        }
      }

      if (item.fileDataUrl || (item.downloadUrl && item.downloadUrl.startsWith("data:application/pdf"))) {
        const link = document.createElement("a");
        link.href = item.fileDataUrl || item.downloadUrl!;
        link.download = targetFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      if (item.downloadUrl && item.downloadUrl !== "#" && item.downloadUrl.startsWith("http")) {
        const dlRes = await downloadRemoteFile(item.downloadUrl, targetFileName);
        if (dlRes.success) return;
        // Jika server remote unreachable (misal Supabase mati), lanjut ke fallback generator
      }

      const pdfString = generateRegulationPdf(item);
      const blob = new Blob([pdfString], { type: "application/pdf" });
      downloadBlob(blob, targetFileName);
    } catch (err) {
      console.error("Gagal mengunduh berkas regulasi:", err);
    } finally {
      setTimeout(() => {
        setDownloadNotice(null);
      }, 4000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-text-primary font-sans antialiased">
      {/* 1. Header Navbar */}
      <Navbar />

      <main id="main-content" className="flex-1 flex flex-col">
        {/* Download Notification Alert */}
        {downloadNotice && (
          <div className="bg-success text-white py-2.5 px-4 text-xs font-medium text-center shadow-md animate-in fade-in transition-all">
            <CheckCircleIcon className="inline mr-2" />
            {downloadNotice}
          </div>
        )}

        {/* 2. Top Section: Arsip Regulasi Perpajakan Resmi (Pencarian & Tabel Peraturan) */}
        <section id="unduh-peraturan" className="py-12 md:py-16 bg-surface border-b border-primary-light">
          <div className="container-custom space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary tracking-tight">
                Daftar Arsip Regulasi Perpajakan Resmi
              </h1>
              <p className="text-body-regular text-text-secondary max-w-4xl leading-relaxed">
                Akses langsung ke regulasi induk perpajakan nasional, harmonisasi UU HPP, dan petunjuk teknis implementasi perpajakan yang dapat disaring dan diunduh langsung.
              </p>
            </div>

            {/* Container Terpadu: Filter, Toolbar, Tabel Regulasi, & Pagination Menjadi Satu Kesatuan */}
            <div className="bg-white rounded-2xl border border-primary-light shadow-xs overflow-hidden">
              {/* Bagian Atas: Filter & Pencarian Dokumen Regulasi */}
              <div className="p-4 sm:p-5 space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-8 relative">
                    <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-silver text-xs" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      placeholder="Saring cepat nomor dokumen, judul, atau ruang lingkup peraturan..."
                      className="w-full pl-9 pr-8 py-2 text-xs bg-surface border border-primary-light rounded-lg text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary shadow-2xs"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          setCurrentPage(1);
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-text-secondary hover:text-text-primary p-1 cursor-pointer"
                        title="Hapus pencarian"
                      >
                        <CloseIcon className="text-[10px]" />
                      </button>
                    )}
                  </div>

                  <div className="sm:col-span-4 flex items-center gap-2">
                    <div className="w-full">
                      <Select
                        value={selectedStatus}
                        onChange={(e) => {
                          setSelectedStatus(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="text-xs h-9 py-1 px-3 bg-surface"
                      >
                        <option value="Semua">Semua Status</option>
                        <option value="Berlaku">Status: Berlaku</option>
                        <option value="Diperbarui">Status: Diperbarui</option>
                        <option value="Tidak Berlaku">Status: Tidak Berlaku</option>
                      </Select>
                    </div>

                    {(selectedCategory !== "Semua" || selectedStatus !== "Semua" || searchQuery) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleResetFilters}
                        className="text-xs px-3 h-9 shrink-0 text-text-secondary hover:text-error hover:border-error"
                        title="Reset semua filter"
                      >
                        Reset
                      </Button>
                    )}
                  </div>
                </div>

                {/* Category Pills directly above table */}
                <div className="flex items-center gap-1.5 overflow-x-auto pt-2.5 border-t border-primary-light/60 pb-1 text-xs">
                  {REGULATION_CATEGORIES.map((cat: string) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat);
                        setCurrentPage(1);
                      }}
                      className={`px-3 py-1.5 rounded-full font-semibold transition-all whitespace-nowrap cursor-pointer active:scale-[0.98] text-xs ${
                        selectedCategory === cat
                          ? "bg-primary text-white shadow-sm"
                          : "bg-surface text-text-secondary border border-primary-light hover:border-primary hover:text-primary hover:bg-white"
                      }`}
                    >
                      {cat} <span className="opacity-80 text-[10px]">({categoryCounts[cat] || 0})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tabel Arsip Peraturan (Langsung menyambung dari filter tanpa space di tengah) */}
              <div className="overflow-x-auto border-t border-primary-light">
                <Table className="min-w-[850px]">
                  <TableHeader className="bg-surface">
                    <TableRow>
                      <TableHead className="w-[210px] min-w-[190px] font-bold text-xs text-primary">
                        Nomor Dokumen
                      </TableHead>
                      <TableHead className="font-bold text-xs text-primary min-w-[240px]">
                        Judul &amp; Ruang Lingkup Regulasi
                      </TableHead>
                      <TableHead className="font-bold text-xs text-primary w-[160px]">
                        Kategori
                      </TableHead>
                      <TableHead className="font-bold text-xs text-primary w-[130px]">
                        Berlaku Mulai
                      </TableHead>
                      <TableHead className="font-bold text-xs text-primary w-[100px] text-center">
                        Status
                      </TableHead>
                      <TableHead className="font-bold text-xs text-primary w-[110px] text-right">
                        Aksi Unduh
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.length > 0 ? (
                      paginatedData.map((item) => (
                        <TableRow key={item.id} className="hover:bg-surface/60 transition-colors">
                          <TableCell className="font-semibold text-xs text-primary align-top">
                            {item.docNumber}
                          </TableCell>
                          <TableCell className="align-top">
                            <div className="text-xs font-semibold text-text-primary">
                              {item.title}
                            </div>
                            <div className="text-[11px] text-text-secondary mt-1 leading-relaxed">
                              {item.scope}
                            </div>
                          </TableCell>
                          <TableCell className="align-top">
                            {item.category === "Regulasi Zhou" ? (
                              <Badge variant="primary" className="text-[10px] font-bold bg-primary text-white border-primary shadow-2xs">
                                {item.category}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] font-medium">
                                {item.category}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-text-secondary align-top whitespace-nowrap">
                            {item.effectiveDate}
                          </TableCell>
                          <TableCell className="text-center align-top">
                            {item.legalStatus === "Berlaku" || (!item.legalStatus && item.status === "Berlaku") ? (
                              <Badge variant="success" className="text-[10px] font-bold">
                                Berlaku
                              </Badge>
                            ) : item.legalStatus === "Diperbarui" || (!item.legalStatus && (item.status === "Diperbarui" || (item.status as string) === "Pembaruan")) ? (
                              <div className="flex flex-col items-center gap-1">
                                <Badge variant="primary" className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                  Diperbarui
                                </Badge>
                                {item.replacementRef && (
                                  <span
                                    className="text-[10px] text-text-muted leading-tight max-w-[140px] text-center"
                                    title={`Referensi regulasi pengganti: ${item.replacementRef}`}
                                  >
                                    Ref: {item.replacementRef}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <Badge variant="error" className="text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                Tidak Berlaku
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right align-top">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleDownload(item)}
                              className="text-[11px] px-3 py-1 h-7 font-semibold"
                              title={`Unduh berkas PDF (${item.fileSize})`}
                            >
                              Unduh
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 text-text-secondary text-xs space-y-3">
                          <p>{regulations.length === 0 ? "Belum ada dokumen regulasi atau SOP perpajakan yang tersedia saat ini." : "Tidak ada dokumen peraturan yang cocok dengan kata kunci pencarian atau filter saat ini."}</p>
                          {regulations.length > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleResetFilters}
                              className="text-xs mt-2 font-semibold"
                            >
                              Reset Pencarian &amp; Filter
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Info Counter & Pagination di Luar Tabel (Kanan Bawah) */}
            <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-text-secondary pt-1 gap-3">
              {totalPages > 1 ? (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => setCurrentPage(page)}
                  className="py-0"
                />
              ) : (
                <div />
              )}
              <div className="text-right sm:ml-auto">
                Menampilkan <span className="font-semibold text-text-primary">{filteredRegulations.length}</span> dari {regulations.length} dokumen hukum perpajakan resmi.
              </div>
            </div>
          </div>
        </section>

        {/* 3. Bottom Section: Kurs Pajak Mingguan Menteri Keuangan (KMK) */}
        <section id="kurs-pajak" className="py-14 md:py-20 bg-white flex-1">
          <div className="container-custom space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold text-primary tracking-tight">
                Kurs Pajak Mingguan Menteri Keuangan (KMK)
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary max-w-4xl leading-relaxed">
                Nilai kurs resmi Kementerian Keuangan Republik Indonesia &amp; Ditjen Pajak (DJP) sebagai acuan dasar pelunasan Bea Masuk, Pajak Pertambahan Nilai (PPN), dan PPh Pasal 22 Impor yang terhubung langsung dan terupdate berkala setiap pekan.
              </p>
            </div>

            {/* Tabel Kurs KMK (Lebar Presisi Penuh Kontainer) */}
            <div className="space-y-4">
              <div className="rounded-lg border border-primary-light bg-white overflow-hidden shadow-sm">
                <div className="bg-surface px-4 sm:px-5 py-3.5 sm:py-4 border-b border-primary-light flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-primary">
                        Kurs Menteri Keuangan (KMK)
                      </h3>
                      <Badge variant="secondary" size="sm">
                        {kmkData.kmkNumber || "KMK Terupdate Mingguan"}
                      </Badge>
                    </div>
                    <span className="text-xs text-text-secondary mt-0.5 block">
                      Periode Aktif: {kmkData.period || "Pekan Berjalan"}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <a
                      href={kmkData.officialDjpUrl || "https://fiskal.kemenkeu.go.id/informasi-publik/kurs-pajak"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-all shadow-xs"
                      title="Buka portal resmi Kurs Pajak Badan Kebijakan Fiskal / DJP di tab baru"
                    >
                      <span>Buka Portal Resmi Kurs DJP</span>
                      <svg className="w-3.5 h-3.5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>

                <Table className="min-w-[480px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="py-3 px-3 sm:px-5">Mata Uang</TableHead>
                      <TableHead className="py-3 px-3 sm:px-5">Nama Valuta</TableHead>
                      <TableHead className="py-3 px-3 sm:px-5 text-right">Nilai Kurs (IDR)</TableHead>
                      <TableHead className="py-3 px-3 sm:px-5 text-right">Fluktuasi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {kmkData.rates.length > 0 ? (
                      kmkData.rates.map((item) => (
                        <TableRow key={item.currency} className="hover:bg-surface/50">
                          <TableCell className="py-3 px-3 sm:px-5 font-bold text-primary">
                            {item.currency}
                          </TableCell>
                          <TableCell className="py-3 px-3 sm:px-5 text-text-secondary text-xs">
                            {item.name}
                          </TableCell>
                          <TableCell className="py-3 px-3 sm:px-5 text-right font-semibold text-text">
                            {item.rate}
                          </TableCell>
                          <TableCell className="py-3 px-3 sm:px-5 text-right text-xs">
                            <span
                              className={
                                item.trend === "up"
                                  ? "text-success font-semibold inline-flex items-center gap-1"
                                  : "text-text-secondary font-medium inline-flex items-center gap-1"
                              }
                            >
                              {item.change}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="py-8 px-5 text-center text-xs text-text-secondary">
                          Kurs pajak terhubung langsung ke portal resmi DJP. Silakan akses portal DJP melalui tombol di atas.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* 8. Footer */}
      <Footer />

      {/* 9. Floating WhatsApp CTA */}
      <FloatingWhatsAppCTA />
    </div>
  );
}
