import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-primary-dark text-white border-t border-white/10 pt-16 pb-12">
      <div className="container-custom space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Col 1: Brand & Tagline (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-primary font-bold text-lg">
                Z
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                ZHOU CONSULTING
              </span>
            </div>
            <p className="text-xs text-silver leading-relaxed max-w-sm">
              Mitra terpercaya tata kelola keuangan, audit akuntansi, dan kepatuhan perpajakan korporat berstandar regulasi nasional dan sistem digital Coretax DJP.
            </p>
            <div className="text-xs text-silver/80">
              Gedung Pusat Bisnis Lantai 8, Jl. Jend. Sudirman Kav. 21, Jakarta Selatan
            </div>
          </div>

          {/* Col 2: Navigasi Utama */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Navigasi Utama</h4>
            <ul className="space-y-2 text-xs text-silver">
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
                  Peraturan
                </Link>
              </li>
              <li>
                <Link href="/#edukasi" className="hover:text-white transition-colors">
                  Edukasi
                </Link>
              </li>
              <li>
                <Link href="/#karir" className="hover:text-white transition-colors">
                  Karir
                </Link>
              </li>
              <li>
                <Link href="/#kontak" className="hover:text-white transition-colors">
                  Kontak
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Layanan Spesialis */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Layanan Spesialis</h4>
            <ul className="space-y-2 text-xs text-silver">
              <li>
                <Link href="/#layanan-hukum" className="hover:text-white transition-colors">
                  Konsultasi Hukum
                </Link>
              </li>
              <li>
                <Link href="/#layanan-bisnis" className="hover:text-white transition-colors">
                  Konsultasi Business
                </Link>
              </li>
              <li>
                <Link href="/#layanan-akuntansi" className="hover:text-white transition-colors">
                  Accounting Service &amp; SAK
                </Link>
              </li>
              <li>
                <Link href="/#layanan-pajak" className="hover:text-white transition-colors">
                  Tax Service Core &amp; Coretax
                </Link>
              </li>
              <li>
                <Link href="/#layanan-pajak" className="hover:text-white transition-colors">
                  Pendampingan SP2DK &amp; Audit
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Portal & Akses */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Akses Portal</h4>
            <ul className="space-y-2 text-xs text-silver">
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Login Portal Klien
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Login Staf &amp; Admin
                </Link>
              </li>
              <li className="pt-2 text-[11px] text-silver/60">
                Layanan konsultasi resmi berbasis penugasan dan perjanjian kerahasiaan (*NDA*).
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Disclaimer */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-silver/70">
          <div>
            &copy; {new Date().getFullYear()} Zhou Consulting. Seluruh hak cipta dilindungi undang-undang.
          </div>
          <div className="flex gap-6 text-xs">
            <span className="hover:text-white cursor-pointer">Kebijakan Privasi</span>
            <span className="hover:text-white cursor-pointer">Syarat &amp; Ketentuan</span>
            <span className="hover:text-white cursor-pointer">Standar Kepatuhan</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

