"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WhatsappIcon } from "@/components/icons";
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
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              variant="primary"
              size="lg"
              asChild
              className="w-full sm:w-auto font-semibold text-sm px-8 shadow-sm"
            >
              <Link href="/kontak">
                Hubungi Kami
              </Link>
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              asChild
              className="w-full sm:w-auto font-semibold text-sm px-8 shadow-sm border-success text-success hover:bg-success/5 hover:text-success"
            >
              <a
                href="https://wa.me/6281234567890?text=Halo%20Zhou%20Consulting,%20saya%20ingin%20berkonsultasi%20mengenai%20layanan%20akuntansi%20dan%20pajak."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2"
              >
                <WhatsappIcon className="text-base" />
                <span>Chat WhatsApp</span>
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
