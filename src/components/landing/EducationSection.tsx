"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  BookIcon,
  ArrowRightIcon,
  DownloadIcon,
  CheckCircleIcon,
  ClockIcon,
  CalendarIcon,
  ShieldTaxIcon,
} from "@/components/icons";

interface Article {
  id: string;
  title: string;
  category: "Transformasi Digital" | "Kepatuhan Pajak" | "Akuntansi Bisnis";
  categoryKey: "transformasi" | "kepatuhan" | "akuntansi";
  date: string;
  readTime: string;
  summary: string;
  takeaways: string[];
  content: string[];
}

const ARTICLES: Article[] = [
  {
    id: "coretax-transisi",
    title: "Navigasi Coretax: Strategi Transisi Pelaporan Pajak Digital bagi Badan Usaha",
    category: "Transformasi Digital",
    categoryKey: "transformasi",
    date: "September 2026",
    readTime: "5 menit baca",
    summary:
      "Panduan komprehensif memahami pergeseran alur kerja pelaporan SPT tahunan, sinkronisasi Deposit Pajak, dan validasi faktur elektronik terpadu.",
    takeaways: [
      "Konsolidasi akun wajib pajak dan mekanisme Deposit Pajak mempermudah alokasi saldo lintas jenis pajak.",
      "Prapengisian (pre-populated data) bukti potong unifikasi langsung dari sistem pihak ketiga dan DJP.",
      "Kebutuhan audit validitas NPWP 16 digit/NITKU karyawan dan mitra rekanan bisnis.",
    ],
    content: [
      "Sistem Informasi Perpajakan Terpadu (Coretax) dari Direktorat Jenderal Pajak (DJP) membawa revolusi menyeluruh terhadap cara wajib pajak badan mengelola kewajiban fiskal nasional.",
      "Perubahan mendasar mencakup konsolidasi akun wajib pajak (Taxpayer Account Management), integrasi pembuatan bukti potong unifikasi langsung ke modul akuntansi, serta otomatisasi prapengisian SPT Tahunan.",
      "Zhou Consulting menyarankan setiap entitas bisnis untuk segera melakukan validasi data master perpajakan dan memberikan pelatihan operasional kepada tim akuntansi guna mencegah sanksi administratif akibat ketidaksiapan sistem.",
    ],
  },
  {
    id: "mitigasi-sp2dk",
    title: "Manajemen Kepatuhan PPh Badan dan Mitigasi Risiko Penerbitan SP2DK",
    category: "Kepatuhan Pajak",
    categoryKey: "kepatuhan",
    date: "Agustus 2026",
    readTime: "7 menit baca",
    summary:
      "Langkah-langkah preventif dalam penataan bukti potong, rekonsiliasi fiskal berkala, dan penyusunan kertas kerja ekualisasi omzet.",
    takeaways: [
      "Ekualisasi berkala antara omzet SPT Masa PPN dengan peredaran bruto SPT Tahunan PPh Badan.",
      "Pencocokan biaya gaji, upah, dan honorarium dengan dasar pemotongan PPh Pasal 21 bulanan.",
      "Penyusunan tanggapan tertulis SP2DK berbasis data komparatif yang terverifikasi konsultan terdaftar.",
    ],
    content: [
      "Surat Permintaan Penjelasan atas Data dan/atau Keterangan (SP2DK) umumnya terbit akibat anomali data perbandingan laporan keuangan wajib pajak dengan data eksternal pihak ketiga yang dihimpun DJP.",
      "Area paling rentan terhadap pengujian fiskus meliputi selisih omzet PPN vs PPh Badan, ekualisasi biaya tenaga kerja dengan PPh Pasal 21, serta transaksi afiliasi dengan pemegang saham.",
      "Penyusunan kertas kerja rekonsiliasi fiskal yang terdokumentasi rapi sejak awal tahun buku merupakan proteksi terbaik perusahaan dalam memberikan respon sanggahan yang terstruktur dan terpercaya.",
    ],
  },
  {
    id: "pembukuan-sak-umkm",
    title: "Pentingnya Pembukuan SAK bagi Kelayakan Pembiayaan Perbankan UMKM",
    category: "Akuntansi Bisnis",
    categoryKey: "akuntansi",
    date: "Juli 2026",
    readTime: "4 menit baca",
    summary:
      "Bagaimana laporan keuangan terstandar SAK Entitas Privat meningkatkan solvabilitas dan membuka fasilitas kredit investasi institusional.",
    takeaways: [
      "Pemisahan mutlak rekening bank pribadi pemilik dan rekening operasional entitas usaha.",
      "Penyajian rasio keuangan utama: Debt to Equity Ratio (DER) dan Debt Service Coverage Ratio (DSCR).",
      "Kredibilitas laporan keuangan yang diawasi oleh Akuntan Berpraktik (State Registered Accountant).",
    ],
    content: [
      "Banyak entitas usaha potensial mengalami hambatan saat mengajukan plafon kredit modal kerja ke perbankan karena pembukuan internal yang masih bersifat kas sederhana dan belum mengacu standar SAK.",
      "Penerapan sistem pencatatan berpasangan (double-entry) dan penyusunan neraca serta laporan laba rugi berkala membuktikan transparansi arus kas operasional entitas kepada komite kredit bank.",
      "Dengan pendampingan penyusunan laporan keuangan terstandar dari Zhou Consulting, perusahaan dapat mempercepat persetujuan fasilitas kredit dengan tingkat bunga yang jauh lebih efisien.",
    ],
  },
  {
    id: "pmk-168-ter-pph21",
    title: "Penerapan Tarif Efektif Rata-Rata (TER) PPh 21 Berdasarkan PMK 168/2023",
    category: "Kepatuhan Pajak",
    categoryKey: "kepatuhan",
    date: "Juni 2026",
    readTime: "6 menit baca",
    summary:
      "Penerapan skema TER Kategori A, B, C untuk pemotongan bulanan dan teknik perhitungan kembali pada masa pajak terakhir (Desember).",
    takeaways: [
      "Klasifikasi PTKP menentukan penetapan Kategori TER (A, B, atau C) untuk setiap pegawai tetap.",
      "Pemotongan bulanan Januari hingga November menggunakan persentase TER langsung dikalikan penghasilan bruto.",
      "Penghitungan masa Desember tetap mengacu pada tarif progresif Pasal 17 UU PPh untuk penyesuaian akhir.",
    ],
    content: [
      "Peraturan Menteri Keuangan Nomor 168/PMK.03/2023 menyederhanakan mekanisme pemotongan PPh Pasal 21 dengan memperkenalkan metode Tarif Efektif Rata-Rata (TER) bulanan dan harian.",
      "Meskipun skema TER mempermudah kalkulasi payroll bulanan, divisi personalia dan keuangan wajib berhati-hati dalam mengantisipasi lonjakan beban pajak pada masa pajak Desember saat dilakukan perhitungan ulang dengan tarif progresif.",
      "Zhou Consulting mendampingi perusahaan dalam merancang template kalkulator payroll otomatis yang mematuhi ketentuan PMK 168 tanpa mengganggu likuiditas insentif akhir tahun karyawan.",
    ],
  },
];

export function EducationSection() {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("semua");
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const filteredArticles =
    activeCategory === "semua"
      ? ARTICLES
      : ARTICLES.filter((a) => a.categoryKey === activeCategory);

  const handleDownload = () => {
    setDownloadSuccess(true);
    setTimeout(() => {
      setDownloadSuccess(false);
    }, 3500);
  };

  return (
    <section
      id="edukasi"
      aria-label="Pusat Edukasi dan Wawasan Fiskal"
      className="py-16 md:py-20 lg:py-24 bg-surface border-b border-primary-light scroll-mt-20"
    >
      <div className="container-custom space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            <Badge
              variant="silver"
              className="uppercase tracking-wider text-badge font-semibold py-1 px-3 inline-flex items-center gap-1.5"
            >
              <BookIcon className="text-xs" />
              <span>Literasi &amp; Edukasi</span>
            </Badge>
            <h2 className="text-[20px] leading-[28px] sm:text-[21px] sm:leading-[29px] lg:text-section-heading font-bold text-primary tracking-tight text-balance">
              Wawasan Praktis Perpajakan &amp; Tata Kelola Keuangan
            </h2>
            <p className="text-[15px] leading-[24px] sm:text-body-large text-text-secondary leading-relaxed">
              Kumpulan artikel edukatif, panduan teknis kepatuhan fiskal, dan analisis regulasi bisnis yang dikurasi langsung oleh para konsultan berlisensi Zhou Consulting.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedArticle(ARTICLES[0])}
            className="self-start md:self-auto text-xs font-semibold hover:border-primary shrink-0"
          >
            Baca Panduan Coretax 2026
          </Button>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center justify-start overflow-x-auto pb-2">
          <Tabs
            value={activeCategory}
            onValueChange={setActiveCategory}
            className="w-auto"
          >
            <TabsList className="bg-white">
              <TabsTrigger value="semua" className="text-xs">
                Semua Topik ({ARTICLES.length})
              </TabsTrigger>
              <TabsTrigger value="transformasi" className="text-xs">
                Coretax &amp; Digital
              </TabsTrigger>
              <TabsTrigger value="kepatuhan" className="text-xs">
                Kepatuhan Pajak
              </TabsTrigger>
              <TabsTrigger value="akuntansi" className="text-xs">
                Akuntansi Bisnis
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredArticles.map((article) => (
            <Card
              key={article.id}
              className="flex flex-col justify-between hover:border-primary hover:shadow-md transition-all duration-200 group bg-white"
            >
              <CardHeader className="space-y-3 pb-3">
                <div className="flex items-center justify-between text-xs text-text-secondary gap-2">
                  <Badge variant="secondary" size="sm" className="font-semibold text-[11px]">
                    {article.category}
                  </Badge>
                  <span className="inline-flex items-center gap-1 text-[11px] text-text-secondary whitespace-nowrap">
                    <CalendarIcon className="text-[10px]" />
                    {article.date}
                  </span>
                </div>

                <CardTitle
                  onClick={() => setSelectedArticle(article)}
                  className="text-[15px] font-bold text-primary group-hover:text-primary-dark transition-colors cursor-pointer leading-snug line-clamp-2"
                >
                  {article.title}
                </CardTitle>

                <CardDescription className="text-xs text-text-secondary line-clamp-3 leading-relaxed">
                  {article.summary}
                </CardDescription>
              </CardHeader>

              <CardContent className="py-2">
                <div className="space-y-1.5 pt-2 border-t border-primary-light/60">
                  <span className="text-[10px] font-bold text-primary tracking-wider uppercase block">
                    Poin Utama:
                  </span>
                  <p className="text-[11px] text-text-secondary leading-normal line-clamp-2">
                    &bull; {article.takeaways[0]}
                  </p>
                </div>
              </CardContent>

              <CardFooter className="pt-3 border-t border-primary-light flex items-center justify-between mt-2">
                <div className="flex items-center gap-1.5 text-xs text-text-secondary font-medium">
                  <ClockIcon className="text-[11px]" />
                  <span>{article.readTime}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedArticle(article)}
                  className="text-xs font-bold text-primary inline-flex items-center gap-1.5 group-hover:translate-x-0.5 transition-transform focus:outline-none"
                >
                  <span>Selengkapnya</span>
                  <ArrowRightIcon className="text-[10px]" />
                </button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Training / Corporate Education Spotlight Banner */}
        <div className="rounded-lg border border-primary-light bg-white p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
              <ShieldTaxIcon className="text-primary text-sm" />
              <span>Program In-House Training Zhou Consulting</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-primary">
              Butuh Pelatihan Pajak &amp; Coretax Khusus untuk Tim Internal Anda?
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary max-w-2xl leading-relaxed">
              Kami menyelenggarakan workshop praktis perpajakan perusahaan, simulasi Coretax DJP 2026, dan standardisasi pembukuan SAK yang disesuaikan dengan kebutuhan industri Anda.
            </p>
          </div>
          <Button
            variant="primary"
            size="default"
            asChild
            className="w-full md:w-auto shrink-0 text-xs font-bold"
          >
            <a href="#kontak">Jadwalkan In-House Training</a>
          </Button>
        </div>
      </div>

      {/* Accessible Reader Dialog */}
      <Dialog
        open={Boolean(selectedArticle)}
        onOpenChange={(open) => {
          if (!open) setSelectedArticle(null);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedArticle && (
            <>
              <DialogHeader className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                  <Badge variant="silver" size="sm" className="font-bold uppercase tracking-wider">
                    {selectedArticle.category}
                  </Badge>
                  <span className="inline-flex items-center gap-1">
                    <CalendarIcon className="text-[10px]" />
                    {selectedArticle.date}
                  </span>
                  <span>&bull;</span>
                  <span className="inline-flex items-center gap-1">
                    <ClockIcon className="text-[10px]" />
                    {selectedArticle.readTime}
                  </span>
                </div>

                <DialogTitle className="text-lg sm:text-xl font-bold text-primary leading-snug">
                  {selectedArticle.title}
                </DialogTitle>

                <DialogDescription className="text-xs text-text-secondary leading-relaxed">
                  {selectedArticle.summary}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-3 border-y border-primary-light">
                {/* Key Takeaways Box */}
                <div className="p-4 rounded-lg bg-surface border border-primary-light space-y-2">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider block">
                    Poin Kunci Wajib Pajak:
                  </span>
                  <ul className="space-y-1.5">
                    {selectedArticle.takeaways.map((item, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-text-secondary flex items-start gap-2 leading-relaxed"
                      >
                        <CheckCircleIcon className="text-success text-xs mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Article Body */}
                <div className="space-y-3 text-xs sm:text-sm text-text leading-relaxed">
                  {selectedArticle.content.map((paragraph, pIdx) => (
                    <p key={pIdx}>{paragraph}</p>
                  ))}
                </div>
              </div>

              {/* Notification on Download */}
              {downloadSuccess && (
                <div className="p-3 rounded-md bg-success/10 border border-success/30 text-success text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                  <CheckCircleIcon className="text-xs" />
                  <span>Berkas ringkasan panduan PDF berhasil diunduh.</span>
                </div>
              )}

              <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3">
                <div className="text-[11px] text-text-secondary text-center sm:text-left">
                  Disusun oleh <strong>Divisi Riset Fiskal Zhou Consulting</strong>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <DialogClose asChild>
                    <Button variant="outline" size="sm" className="flex-1 sm:flex-none text-xs">
                      Tutup
                    </Button>
                  </DialogClose>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    className="flex-1 sm:flex-none text-xs inline-flex items-center gap-1.5 hover:border-primary"
                  >
                    <DownloadIcon className="text-xs" />
                    <span>Unduh PDF</span>
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    asChild
                    className="flex-1 sm:flex-none text-xs"
                  >
                    <a
                      href="#kontak"
                      onClick={() => setSelectedArticle(null)}
                    >
                      Konsultasikan Topik
                    </a>
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
