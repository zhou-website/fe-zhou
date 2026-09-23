"use client";

import React, { useState, useEffect } from "react";
import { WhatsappIcon, CloseIcon } from "@/components/icons";

export function FloatingWhatsAppCTA() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  // Show after scrolling down 200px
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 150) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  const quickMessages = [
    {
      label: "Konsultasi Pajak & Coretax 2026",
      text: "Halo Zhou Consulting, saya ingin konsultasi mengenai implementasi Coretax dan kepatuhan perpajakan.",
    },
    {
      label: "Pembukuan & Laporan Keuangan SAK",
      text: "Halo Zhou Consulting, saya ingin menanyakan layanan pembukuan dan penyusunan laporan keuangan SAK.",
    },
    {
      label: "Pendampingan SP2DK & Pemeriksaan",
      text: "Halo Zhou Consulting, saya membutuhkan pendampingan terkait surat tanggapan SP2DK dari kantor pajak.",
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end animate-in fade-in slide-in-from-bottom-5 duration-300">
      {/* Quick Greeting Popup */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-88 rounded-xl bg-white border border-primary-light shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-primary p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white text-lg">
                  <WhatsappIcon />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-success border-2 border-primary" />
              </div>
              <div>
                <h4 className="text-xs font-bold leading-none">Customer Service Zhou</h4>
                <span className="text-[10px] text-silver mt-1 block">Online &bull; Respon Cepat</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-silver hover:text-white p-1 focus:outline-none transition-colors cursor-pointer"
              aria-label="Tutup jendela chat"
            >
              <CloseIcon className="text-sm" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3 bg-surface text-xs">
            <div className="rounded-lg bg-white p-3 border border-primary-light/80 shadow-xs space-y-1">
              <p className="font-semibold text-primary text-[11px]">Halo! Ada yang bisa kami bantu?</p>
              <p className="text-text-secondary leading-relaxed text-[11px]">
                Silakan pilih topik konsultasi di bawah untuk langsung terhubung dengan konsultan kami via WhatsApp:
              </p>
            </div>

            <div className="space-y-1.5">
              {quickMessages.map((item, idx) => (
                <a
                  key={idx}
                  href={`https://wa.me/6281234567890?text=${encodeURIComponent(item.text)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between p-2.5 rounded-md bg-white border border-primary-light hover:border-success hover:bg-success/5 transition-all text-[11px] font-medium text-primary shadow-xs"
                >
                  <span className="group-hover:text-success transition-colors">{item.label}</span>
                  <WhatsappIcon className="text-success text-xs shrink-0 ml-2" />
                </a>
              ))}
            </div>
          </div>

          {/* Footer note */}
          <div className="bg-white px-4 py-2.5 border-t border-primary-light text-[10px] text-text-secondary text-center">
            Jam operasional CS: 08.30 &ndash; 17.30 WIB
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <div className="flex items-center gap-2">
        {!isOpen && (
          <span className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-sm border border-primary-light shadow-md text-xs font-semibold text-primary animate-in fade-in">
            Chat WhatsApp CS
          </span>
        )}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Buka WhatsApp Customer Service"
          aria-expanded={isOpen}
          className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-success text-white shadow-xl hover:bg-success/90 hover:scale-105 active:scale-95 transition-all flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-success/30 cursor-pointer"
        >
          {isOpen ? (
            <CloseIcon className="text-xl" />
          ) : (
            <WhatsappIcon className="text-2xl" />
          )}
        </button>
      </div>
    </div>
  );
}
