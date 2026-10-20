import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 bg-background text-text">
      <div className="space-y-4 max-w-md">
        <span className="inline-block px-3 py-1 text-xs font-semibold text-primary bg-primary-light rounded-full uppercase tracking-wider">
          404 Not Found
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight">
          Halaman Tidak Ditemukan
        </h1>
        <p className="text-sm text-text-secondary leading-relaxed">
          Mohon maaf, tautan atau dokumen perpajakan yang Anda tuju tidak tersedia atau telah dipindahkan.
        </p>
        <div className="pt-4 flex items-center justify-center gap-3">
          <Button variant="primary" asChild>
            <Link href="/">Kembali</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/layanan/tax-service">Layanan</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
