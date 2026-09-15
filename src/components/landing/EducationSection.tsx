"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookIcon, ArrowRightIcon, CloseIcon, DownloadIcon } from "@/components/icons";

export function EducationSection() {
  const [selectedArticle, setSelectedArticle] = useState<{
    title: string;
    category: string;
    date: string;
    readTime: string;
    content: string[];
  } | null>(null);

  const articles = [
    {
      title: "Navigasi Coretax: Strategi Transisi Pelaporan Pajak Digital bagi Badan Usaha",
      category: "Transformasi Digital",
      date: "September 2026",
      readTime: "5 menit baca",
      summary: "Memahami perubahan alur kerja pelaporan SPT dan validasi faktur elektronik dalam ekosistem Coretax terkini.",
      content: [
        "Sistem Informasi Perpajakan Terpadu (Coretax) dari Direktorat Jenderal Pajak (DJP) membawa revolusi digital menyeluruh terhadap cara wajib pajak badan mengelola kewajiban fiskal.",
        "Perubahan mendasar mencakup konsolidasi akun wajib pajak (Deposit Pajak), integrasi pembuatan bukti potong unifikasi langsung dengan sistem pembukuan, serta otomatisasi prapengisian (pre-populated) SPT.",
        "Zhou Consulting menyarankan setiap entitas bisnis untuk melakukan audit kesiapan data NPWP 16 digit/NITKU dan memastikan staf akuntansi telah menguasai alur pengoperasian modul Coretax demi menghindari sanksi administratif keterlambatan.",
      ],
    },
    {
      title: "Manajemen Kepatuhan PPh Badan dan Mitigasi Risiko Penerbitan SP2DK",
      category: "Kepatuhan Pajak",
      date: "Agustus 2026",
      readTime: "7 menit baca",
      summary: "Langkah-langkah preventif dalam penataan bukti potong dan rekonsiliasi fiskal sebelum penyerahan laporan tahunan.",
      content: [
        "Surat Permintaan Penjelasan atas Data dan/atau Keterangan (SP2DK) umumnya terbit akibat perbedaan data antara laporan keuangan wajib pajak dengan data pihak ketiga yang dimiliki DJP.",
        "Area paling rentan mencakup ekualisasi omzet PPh Badan dengan peredaran bruto PPN, ekualisasi biaya gaji dengan PPh Pasal 21, serta transaksi hubungan istimewa (transfer pricing).",
        "Penyusunan kertas kerja rekonsiliasi fiskal yang terdokumentasi rapi sejak awal tahun buku menjadi kunci utama mitigasi dan pemberian tanggapan yang kredibel kepada Account Representative (AR).",
      ],
    },
    {
      title: "Pentingnya Pembukuan SAK bagi Kelayakan Pembiayaan Perbankan UMKM",
      category: "Akuntansi Bisnis",
      date: "Juli 2026",
      readTime: "4 menit baca",
      summary: "Bagaimana laporan keuangan yang tertib meningkatkan kredibilitas entitas di mata lembaga keuangan.",
      content: [
        "Banyak pelaku usaha menengah mengalami kendala saat mengajukan fasilitas kredit modal kerja karena laporan keuangan internal tidak memenuhi Standar Akuntansi Keuangan (SAK).",
        "Pemisahan tegas rekening pribadi dan rekening operasional perusahaan serta pencatatan jurnal berpasangan memungkinkan penyajian rasio leverage dan debt service coverage ratio (DSCR) yang akurat.",
        "Dengan pendampingan penyusunan laporan keuangan terstandar dari konsultan akuntan terpercaya, entitas dapat membuka akses permodalan skala institusional dengan tingkat suku bunga yang kompetitif.",
      ],
    },
  ];

  return (
    <section id="edukasi" className="py-20 bg-surface border-b border-primary-light scroll-mt-20">
      <div className="container-custom space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <Badge variant="silver" className="uppercase tracking-wider text-[11px] font-bold">
              Literasi &amp; Edukasi
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
              Wawasan Praktis Perpajakan &amp; Tata Kelola Keuangan
            </h2>
            <p className="text-text-secondary text-base leading-relaxed">
              Kumpulan artikel edukatif, panduan praktis, dan literasi kepatuhan fiskal yang dikurasi langsung oleh tim konsultan Zhou Consulting.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedArticle(articles[0])}
            className="self-start sm:self-auto text-xs font-semibold"
          >
            Baca Panduan Utama
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map((item, idx) => (
            <article
              key={idx}
              className="rounded-lg border border-primary-light bg-white p-6 shadow-sm flex flex-col justify-between hover:border-primary transition-all duration-200"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-text-secondary">
                  <Badge variant="secondary" className="text-[11px] font-medium">
                    {item.category}
                  </Badge>
                  <span>{item.date}</span>
                </div>

                <h3
                  onClick={() => setSelectedArticle(item)}
                  className="text-base font-bold text-primary leading-snug hover:text-primary-dark hover:underline cursor-pointer transition-colors"
                >
                  {item.title}
                </h3>

                <p className="text-xs text-text-secondary leading-relaxed">
                  {item.summary}
                </p>
              </div>

              <div className="pt-6 border-t border-primary-light mt-6 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                  <BookIcon className="text-xs" />
                  <span>{item.readTime}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedArticle(item)}
                  className="text-xs font-bold text-primary inline-flex items-center gap-1.5 hover:text-primary-dark transition-colors focus:outline-none"
                >
                  <span>Selengkapnya</span>
                  <ArrowRightIcon className="text-[10px]" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Article Reader Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-dark/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-2xl border border-primary-light max-w-2xl w-full p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute top-4 right-4 text-text-secondary hover:text-primary p-1.5 focus:outline-none"
              aria-label="Tutup artikel"
            >
              <CloseIcon className="text-lg" />
            </button>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs text-text-secondary">
                <Badge variant="silver" className="text-[10px] font-bold uppercase">
                  {selectedArticle.category}
                </Badge>
                <span>&bull; {selectedArticle.date}</span>
                <span>&bull; {selectedArticle.readTime}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-primary leading-tight">
                {selectedArticle.title}
              </h3>
            </div>

            <div className="space-y-4 text-sm text-text leading-relaxed border-y border-primary-light py-5">
              {selectedArticle.content.map((paragraph, pIdx) => (
                <p key={pIdx}>{paragraph}</p>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="text-xs text-text-secondary text-center sm:text-left">
                Dipublikasikan oleh <strong>Divisi Riset Fiskal Zhou Consulting</strong>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedArticle(null)}
                  className="flex-1 sm:flex-none text-xs"
                >
                  Tutup
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1 sm:flex-none text-xs inline-flex items-center gap-2"
                  onClick={() => {
                    alert("Mengunduh salinan berkas panduan edukasi PDF...");
                  }}
                >
                  <DownloadIcon className="text-xs" />
                  <span>Unduh Panduan PDF</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

