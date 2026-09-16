"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  ShieldTaxIcon,
  LocationIcon,
  PhoneIcon,
  EnvelopeIcon,
  WhatsappIcon,
  LinkedinIcon,
  InstagramIcon,
} from "@/components/icons";

export function Footer() {
  const [legalModalType, setLegalModalType] = useState<"privasi" | "syarat" | "kepatuhan" | null>(null);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      aria-label="Footer Informasi Korporat Zhou Consulting"
      className="bg-primary-dark text-white border-t border-white/10 pt-16 pb-12"
    >
      <div className="container-custom space-y-12">
        {/* Upper Grid: Brand & Accreditation + Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Col 1: Brand, Tagline & Official Contact (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-primary font-bold text-xl shadow-sm">
                Z
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-white leading-none">
                  ZHOU CONSULTING
                </span>
                <span className="text-[10px] text-silver tracking-wide uppercase font-medium mt-1">
                  Finance &bull; Accounting &bull; Tax Partner
                </span>
              </div>
            </div>

            <p className="text-xs text-silver leading-relaxed max-w-sm">
              Firma konsultan terpercaya di bidang tata kelola akuntansi, perencanaan perpajakan korporat, dan asistensi kepatuhan sistem Coretax DJP 2026 berlandaskan regulasi fiskal nasional.
            </p>

            {/* Legal Credentials Badges */}
            <div className="flex flex-wrap gap-2 pt-1">
              <Badge variant="outline" size="sm" className="border-white/20 text-silver text-[10px]">
                Konsultan Pajak (BKP)
              </Badge>
              <Badge variant="outline" size="sm" className="border-white/20 text-silver text-[10px]">
                Chartered Accountant (CA)
              </Badge>
              <Badge variant="outline" size="sm" className="border-white/20 text-silver text-[10px]">
                Coretax 2026 Ready
              </Badge>
            </div>

            {/* Contact Details */}
            <div className="space-y-2.5 text-xs text-silver/90 pt-2 border-t border-white/10">
              <div className="flex items-start gap-2.5">
                <LocationIcon className="text-silver text-xs shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Gedung Pusat Bisnis Lantai 8, Jl. Jend. Sudirman Kav. 21, Jakarta Selatan 12920
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <PhoneIcon className="text-silver text-xs shrink-0" />
                <span>(021) 5290-8800 / (021) 5290-8801</span>
              </div>
              <div className="flex items-center gap-2.5">
                <EnvelopeIcon className="text-silver text-xs shrink-0" />
                <span>consult@zhouconsulting.id</span>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp Zhou Consulting"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-success text-white flex items-center justify-center transition-colors text-xs"
              >
                <WhatsappIcon />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn Zhou Consulting"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white hover:text-primary text-white flex items-center justify-center transition-colors text-xs"
              >
                <LinkedinIcon />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Zhou Consulting"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white hover:text-primary text-white flex items-center justify-center transition-colors text-xs"
              >
                <InstagramIcon />
              </a>
            </div>
          </div>

          {/* Col 2: Navigasi Portal (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Navigasi Portal</h4>
            <ul className="space-y-2.5 text-xs text-silver">
              <li>
                <Link href="/#profil" className="hover:text-white transition-colors">
                  Profil Perusahaan
                </Link>
              </li>
              <li>
                <Link href="/#layanan" className="hover:text-white transition-colors">
                  Katalog Layanan
                </Link>
              </li>
              <li>
                <Link href="/#peraturan" className="hover:text-white transition-colors">
                  Regulasi &amp; Kurs KMK
                </Link>
              </li>
              <li>
                <Link href="/#edukasi" className="hover:text-white transition-colors">
                  Wawasan &amp; Edukasi
                </Link>
              </li>
              <li>
                <Link href="/#karir" className="hover:text-white transition-colors">
                  Peluang Karir
                </Link>
              </li>
              <li>
                <Link href="/#kontak" className="hover:text-white transition-colors">
                  Hubungi Kami
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Layanan Konsultasi (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Layanan Konsultasi</h4>
            <ul className="space-y-2.5 text-xs text-silver">
              <li>
                <Link href="/#layanan-hukum" className="hover:text-white transition-colors">
                  Konsultasi Hukum Korporat &amp; Legal
                </Link>
              </li>
              <li>
                <Link href="/#layanan-bisnis" className="hover:text-white transition-colors">
                  Konsultasi Bisnis &amp; Kelayakan Usaha
                </Link>
              </li>
              <li>
                <Link href="/#layanan-akuntansi" className="hover:text-white transition-colors">
                  Accounting Service &amp; Kompilasi SAK
                </Link>
              </li>
              <li>
                <Link href="/#layanan-pajak" className="hover:text-white transition-colors">
                  Tax Service Core &amp; Kepatuhan SPT
                </Link>
              </li>
              <li>
                <Link href="/#layanan-pajak" className="hover:text-white transition-colors">
                  Pendampingan SP2DK &amp; Audit DJP
                </Link>
              </li>
              <li>
                <Link href="/#edukasi" className="hover:text-white transition-colors">
                  In-House Corporate Tax Training
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Akses Sistem & Keamanan (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Akses Portal Klien</h4>
            <ul className="space-y-2.5 text-xs text-silver">
              <li>
                <Link href="/login" className="hover:text-white transition-colors font-medium">
                  Login Portal Klien (Monitoring Tiket)
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors font-medium">
                  Login Admin &amp; Konsultan
                </Link>
              </li>
              <li className="pt-2">
                <div className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-white font-semibold text-[11px]">
                    <ShieldTaxIcon className="text-xs text-silver" />
                    <span>Perjanjian Kerahasiaan (NDA)</span>
                  </div>
                  <p className="text-[11px] text-silver/70 leading-relaxed">
                    Setiap penugasan klien dilindungi dokumen kerahasiaan resmi dan kepatuhan kode etik ikatan konsultan.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Legal Links, and Back to Top */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-footer text-silver/80">
          <div>
            &copy; {new Date().getFullYear()} PT Zhou Konsultan Indonesia (Zhou Consulting). Seluruh hak cipta dilindungi undang-undang.
          </div>

          <div className="flex flex-wrap items-center gap-5 text-xs">
            <button
              type="button"
              onClick={() => setLegalModalType("privasi")}
              className="hover:text-white transition-colors focus:outline-none"
            >
              Kebijakan Privasi
            </button>
            <button
              type="button"
              onClick={() => setLegalModalType("syarat")}
              className="hover:text-white transition-colors focus:outline-none"
            >
              Syarat &amp; Ketentuan
            </button>
            <button
              type="button"
              onClick={() => setLegalModalType("kepatuhan")}
              className="hover:text-white transition-colors focus:outline-none"
            >
              Standar Kepatuhan
            </button>
            <button
              type="button"
              onClick={scrollToTop}
              className="text-silver hover:text-white font-semibold transition-colors focus:outline-none"
            >
              Kembali ke Atas &uarr;
            </button>
          </div>
        </div>
      </div>

      {/* Accessible Informational Legal Dialog */}
      <Dialog
        open={Boolean(legalModalType)}
        onOpenChange={(open) => {
          if (!open) setLegalModalType(null);
        }}
      >
        <DialogContent className="max-w-lg">
          {legalModalType === "privasi" && (
            <>
              <DialogHeader className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs">
                  <Badge variant="silver" size="sm" className="font-bold uppercase">
                    Kerahasiaan Data
                  </Badge>
                </div>
                <DialogTitle className="text-base font-bold text-primary">
                  Kebijakan Privasi &amp; Perlindungan Data
                </DialogTitle>
                <DialogDescription className="text-xs text-text-secondary leading-relaxed">
                  Prinsip pengelolaan kerahasiaan berkas fiskal dan finansial klien Zhou Consulting.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-3 border-y border-primary-light text-xs text-text leading-relaxed">
                <p>
                  1. <strong>Kepatuhan UU PDP</strong>: Zhou Consulting mematuhi ketentuan Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi dalam seluruh tahapan pemrosesan data identitas dan pembukuan klien.
                </p>
                <p>
                  2. <strong>Tujuan Terbatas</strong>: Berkas perpajakan, rekening koran, laporan keuangan, dan NPWP yang diserahkan hanya digunakan untuk kepentingan konsultasi, perhitungan pajak, atau pemenuhan kewajiban perundang-undangan.
                </p>
                <p>
                  3. <strong>Akses Terenkripsi</strong>: Salinan dokumen digital disimpan dalam repositori terenkripsi dengan pembatasan hak akses berbasis peranan (RBAC) hanya bagi tim konsultan penanggung jawab.
                </p>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="primary" size="sm" className="text-xs">
                    Saya Mengerti
                  </Button>
                </DialogClose>
              </DialogFooter>
            </>
          )}

          {legalModalType === "syarat" && (
            <>
              <DialogHeader className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs">
                  <Badge variant="silver" size="sm" className="font-bold uppercase">
                    Ketentuan Layanan
                  </Badge>
                </div>
                <DialogTitle className="text-base font-bold text-primary">
                  Syarat &amp; Ketentuan Konsultasi
                </DialogTitle>
                <DialogDescription className="text-xs text-text-secondary leading-relaxed">
                  Pedoman penugasan profesional antara Zhou Consulting dan Klien.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-3 border-y border-primary-light text-xs text-text leading-relaxed">
                <p>
                  1. <strong>Surat Perikatan (Engagement Letter)</strong>: Setiap penugasan resmi disahkan melalui Surat Perikatan Kerja yang memuat ruang lingkup pekerjaan, jangka waktu, dan kewajiban masing-masing pihak.
                </p>
                <p>
                  2. <strong>Keabsahan Data Klien</strong>: Analisis, rekonsiliasi, dan opini fiskal disusun berdasarkan data, bukti potong, dan laporan yang diberikan oleh klien secara jujur dan lengkap.
                </p>
                <p>
                  3. <strong>Batas Tanggung Jawab</strong>: Opini perpajakan dan akuntansi bersifat advis kepatuhan dan tidak menggantikan keputusan resmi otoritas DJP atau lembaga peradilan pajak.
                </p>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="primary" size="sm" className="text-xs">
                    Saya Mengerti
                  </Button>
                </DialogClose>
              </DialogFooter>
            </>
          )}

          {legalModalType === "kepatuhan" && (
            <>
              <DialogHeader className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs">
                  <Badge variant="silver" size="sm" className="font-bold uppercase">
                    Etika Profesi
                  </Badge>
                </div>
                <DialogTitle className="text-base font-bold text-primary">
                  Standar Kepatuhan &amp; Kode Etik
                </DialogTitle>
                <DialogDescription className="text-xs text-text-secondary leading-relaxed">
                  Komitmen integritas konsultan terdaftar dan akuntan berpraktik.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-3 border-y border-primary-light text-xs text-text leading-relaxed">
                <p>
                  1. <strong>Kode Etik Profesi</strong>: Seluruh konsultan Zhou Consulting terikat pada kode etik Ikatan Konsultan Pajak Indonesia (IKPI) dan Ikatan Akuntan Indonesia (IAI).
                </p>
                <p>
                  2. <strong>Anti-Penyuapan &amp; Integritas</strong>: Zhou Consulting melarang segala bentuk gratifikasi atau transaksi ilegal dalam interaksi dengan aparatur otoritas perpajakan negara.
                </p>
                <p>
                  3. <strong>Pencegahan Konflik Kepentingan</strong>: Kami secara ketat menolak penugasan yang menimbulkan pertentangan kepentingan antara dua klien yang saling berkompetisi langsung.
                </p>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="primary" size="sm" className="text-xs">
                    Saya Mengerti
                  </Button>
                </DialogClose>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </footer>
  );
}
