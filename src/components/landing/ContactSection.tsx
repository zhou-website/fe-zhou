"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "@/components/icons";
export function ContactSection() {
  return (
    <section
      id="kontak"
      aria-label="Pusat Konsultasi dan Kontak Kami"
      className="py-16 md:py-24 bg-surface border-b border-primary-light scroll-mt-20"
    >
      <div className="container-custom">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <Badge
            variant="silver"
            className="uppercase tracking-wider text-badge font-semibold py-1 px-3"
          >
            Hubungi Kami
          </Badge>
          
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary tracking-tight text-balance">
            Konsultasikan Kebutuhan Bisnis Anda
          </h2>
          
          <p className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-2xl mx-auto">
            Tim Zhou Consulting siap membantu kebutuhan konsultasi hukum, business, dan tax service Anda.
          </p>
          
          <div className="flex items-center justify-center pt-4">
            <Button
              variant="primary"
              size="lg"
              asChild
              className="w-full sm:w-auto font-semibold text-sm px-8 shadow-sm group"
            >
              <Link href="/kontak" className="inline-flex items-center justify-center gap-2">
                <span>Kontak Lengkap</span>
                <ArrowRightIcon className="text-xs transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
