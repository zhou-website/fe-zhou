import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function RegulationsSection() {
  const taxRates = [
    { currency: "USD", name: "US Dollar", rate: "Rp 15.825", change: "+0.15%" },
    { currency: "EUR", name: "Euro", rate: "Rp 16.940", change: "-0.08%" },
    { currency: "SGD", name: "Singapore Dollar", rate: "Rp 11.890", change: "+0.05%" },
    { currency: "JPY", name: "Japanese Yen (100)", rate: "Rp 10.450", change: "-0.22%" },
    { currency: "CNY", name: "Chinese Yuan", rate: "Rp 2.185", change: "+0.10%" },
  ];

  return (
    <section id="peraturan" className="py-20 bg-white border-b border-primary-light scroll-mt-20">
      <div className="container-custom space-y-12">
        <div className="max-w-2xl space-y-3">
          <Badge variant="silver" className="uppercase tracking-wider text-[11px] font-bold">
            Portal Regulasi &amp; Kurs
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
            Kurs Pajak Mingguan &amp; Referensi Regulasi DJP
          </h2>
          <p className="text-text-secondary text-base leading-relaxed">
            Data kurs konversi resmi Kementerian Keuangan untuk transaksi valas perpajakan serta arsip peraturan terbaru penunjang kepatuhan wajib pajak.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Table Container (2 cols) */}
          <div className="lg:col-span-2 rounded-lg border border-primary-light bg-white overflow-hidden shadow-sm">
            <div className="bg-surface px-6 py-4 border-b border-primary-light flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-primary">Kurs Menteri Keuangan (KMK) Periode Aktif</h3>
                <span className="text-xs text-text-secondary">Berlaku untuk perhitungan PPh, PPN, dan Bea Masuk</span>
              </div>
              <Badge variant="silver" className="text-[11px]">Terverifikasi</Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-primary-light bg-surface/50 text-xs font-semibold text-text-secondary uppercase">
                    <th className="py-3 px-6">Mata Uang</th>
                    <th className="py-3 px-6">Nama Valuta</th>
                    <th className="py-3 px-6 text-right">Nilai Kurs</th>
                    <th className="py-3 px-6 text-right">Fluktuasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-light text-text">
                  {taxRates.map((item) => (
                    <tr key={item.currency} className="hover:bg-surface/60 transition-colors">
                      <td className="py-3.5 px-6 font-bold text-primary">{item.currency}</td>
                      <td className="py-3.5 px-6 text-text-secondary text-xs">{item.name}</td>
                      <td className="py-3.5 px-6 text-right font-semibold text-text">{item.rate}</td>
                      <td className="py-3.5 px-6 text-right text-xs">
                        <span className={item.change.startsWith("+") ? "text-success font-medium" : "text-text-secondary"}>
                          {item.change}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Regulation Quick Links & Downloads */}
          <div className="rounded-lg border border-primary-light bg-surface p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h3 className="text-base font-bold text-primary">Pusat Regulasi &amp; Tautan DJP</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Akses langsung ke regulasi induk, undang-undang harmonisasi peraturan perpajakan, dan petunjuk teknis implementasi Coretax.
              </p>

              <div className="space-y-3 pt-2">
                <a
                  href="https://djponline.pajak.go.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 rounded-md bg-white border border-primary-light hover:border-primary text-xs font-semibold text-primary transition-colors"
                >
                  &bull; Portal Resmi DJP Online &rarr;
                </a>
                <div className="p-3 rounded-md bg-white border border-primary-light text-xs space-y-1">
                  <div className="font-semibold text-primary">UU Harmonisasi Peraturan Perpajakan (HPP)</div>
                  <div className="text-[11px] text-text-secondary">Ringkasan tarif dan penyesuaian regulasi PPh &amp; PPN</div>
                </div>
                <div className="p-3 rounded-md bg-white border border-primary-light text-xs space-y-1">
                  <div className="font-semibold text-primary">Panduan Transisi Sistem Coretax</div>
                  <div className="text-[11px] text-text-secondary">Langkah registrasi dan sinkronisasi data wajib pajak</div>
                </div>
              </div>
            </div>

            <Button variant="outline" size="sm" className="w-full text-xs font-semibold">
              Unduh Arsip Regulasi Perpajakan (PDF)
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
