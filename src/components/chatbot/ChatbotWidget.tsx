"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ChatbotIcon,
  BriefcaseIcon,
  DocumentIcon,
  ChevronRightIcon,
  ClockIcon,
  WhatsappIcon,
  LockIcon,
  UserIcon,
} from "@/components/icons";
import { clientApi, publicApi, ChatbotTreeItem } from "@/lib/api";

export interface FAQItem {
  id: string;
  category?: string;
  question: string;
  answer: string;
}

export const DEFAULT_FAQ_LIST: FAQItem[] = [
  {
    id: "faq-1",
    category: "Layanan Perpajakan",
    question: "Apa saja cakupan layanan konsultasi perpajakan di Zhou Consulting?",
    answer:
      "Layanan Konsultasi Perpajakan Zhou Consulting mencakup Tax Compliance (SPT Masa & Tahunan), pendampingan integrasi Coretax DJP 2026, Tax Advisory & Planning, penanganan sengketa & tanggapan SP2DK, asistensi pemeriksaan pajak, serta konsultasi transfer pricing dan kepatuhan perpajakan korporasi.",
  },
  {
    id: "faq-2",
    category: "Prosedur & Validasi",
    question: "Bagaimana prosedur penelaahan dan validasi dokumen perpajakan?",
    answer:
      "Dokumen klien dianalisis melalui 3 tahap telaah: verifikasi kelengkapan berkas oleh tim analis, review kepatuhan regulasi oleh Konsultan Berizin BKP, dan pengesahan akhir oleh Lead Partner. Seluruh berkas dilindungi enkripsi SHA-256 dan pakta kerahasiaan NDA.",
  },
  {
    id: "faq-3",
    category: "Konsultasi & Monitoring",
    question: "Bagaimana cara memantau progres status proyek atau konsultasi yang sedang berjalan?",
    answer:
      "Anda dapat memantau alur pengerjaan secara real-time melalui menu Layanan Konsultasi atau portal klien. Setiap lembar kerja menampilkan tahapan milestone, persentase progres, catatan konsultan lead, dan estimasi waktu penyelesaian.",
  },
  {
    id: "faq-4",
    category: "Layanan & Pendaftaran",
    question: "Bagaimana mekanisme tanda tangan elektronik (e-Sign) laporan resmi?",
    answer:
      "Laporan dan kertas kerja final ditandatangani secara digital menggunakan Sertifikat Elektronik resmi berstandar kriptografi terakreditasi BSrE/Kominfo. Berkas luaran tersimpan secara permanen dan aman di Secured Vault Dokumen Pajak akun Anda.",
  },
  {
    id: "faq-5",
    category: "Kepatuhan SPT & Coretax",
    question: "Bagaimana cara mengajukan tiket konsultasi atau permohonan baru?",
    answer:
      "Anda dapat mengajukan permohonan konsultasi baru langsung melalui formulir Reservasi Konsultasi di website kami. Tim konsultan kami akan meninjau kebutuhan penugasan dan segera mengonfirmasi jadwal serta dokumen pendukung yang diperlukan.",
  },
];

export interface ChatExchange {
  id: string;
  question: string;
  answer: string;
  time: string;
}

export interface ChatbotWidgetProps {
  mode?: "public" | "client";
  isEmbeddedInCard?: boolean;
  whatsappNumber?: string;
  className?: string;
}

export function ChatbotWidget({
  mode = "public",
  isEmbeddedInCard = false,
  whatsappNumber,
  className = "",
}: ChatbotWidgetProps) {
  const [faqs, setFaqs] = useState<FAQItem[]>(DEFAULT_FAQ_LIST);
  const [chatHistory, setChatHistory] = useState<ChatExchange[]>([]);
  const [selectedFaqId, setSelectedFaqId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const rawPhone =
    whatsappNumber || process.env.NEXT_PUBLIC_WA_PHONE || "6285121286086";
  const cleanPhone = rawPhone.replace(/[^0-9]/g, "") || "6285121286086";

  // Sync FAQ tree from backend if available, fallback safely without error
  useEffect(() => {
    let isMounted = true;
    async function loadFaqs() {
      try {
        const res =
          mode === "client"
            ? await clientApi.getChatbotTree()
            : await publicApi.getChatbotTree();
        if (!isMounted) return;
        const rawList = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
          ? res
          : [];
        if (rawList.length > 0) {
          const mapped: FAQItem[] = rawList.map(
            (item: ChatbotTreeItem, idx: number) => ({
              id: `faq-be-${item.id || idx}`,
              category: item.category || "Konsultasi",
              question: item.question,
              answer:
                item.answer_template ||
                item.answer ||
                "Silakan konsultasikan lebih lanjut dengan tim spesialis Zhou Consulting.",
            })
          );
          setFaqs(mapped);
        }
      } catch {
        // Fallback gracefully to DEFAULT_FAQ_LIST without breaking public flow
      }
    }

    loadFaqs();
    return () => {
      isMounted = false;
    };
  }, [mode]);

  const getCurrentTime = () => {
    return (
      new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }) + " WIB"
    );
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isTyping]);

  const handleSelectQuestion = (faq: FAQItem) => {
    setSelectedFaqId(faq.id);
    setIsTyping(true);

    const currentTime = getCurrentTime();

    setTimeout(() => {
      const newExchange: ChatExchange = {
        id: `exch-${Date.now()}`,
        question: faq.question,
        answer: faq.answer,
        time: currentTime,
      };

      setChatHistory((prev) => [...prev, newExchange]);
      setIsTyping(false);
    }, 500);
  };

  const getWaText = (question: string) => {
    if (mode === "client") {
      return `Halo Zhou Consulting, saya klien dan ingin konsultasi lebih lanjut mengenai: "${question}" (Layanan Konsultasi Berbayar).`;
    }
    return `Halo Zhou Consulting, saya ingin konsultasi lebih lanjut mengenai: "${question}".`;
  };

  const content = (
    <>
      {/* Chat Top Header */}
      <div className="p-4 sm:px-6 sm:py-4 border-b border-primary-light bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#060D22] text-white flex items-center justify-center text-lg shadow-sm shrink-0">
            <ChatbotIcon />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-primary">
              Asisten Virtual Zhou Consulting
            </h3>
            <div className="text-[11px] text-text-muted mt-0.5 flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span className="text-emerald-600 font-semibold">Online</span>
              <span>&bull;</span>
              <span>Terverifikasi</span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Persis Gambar 1 */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="text-xs h-8 px-3 border-primary-light text-primary hover:bg-surface font-medium flex items-center gap-1.5"
          >
            <Link href="/kontak">
              <BriefcaseIcon className="text-xs text-text-muted" />
              <span>Buka Konsultasi / Projects</span>
            </Link>
          </Button>

          <Button
            variant="outline"
            size="sm"
            asChild
            className="text-xs h-8 px-3 border-primary-light text-primary hover:bg-surface font-medium flex items-center gap-1.5"
          >
            <Link href="/peraturan">
              <DocumentIcon className="text-xs text-text-muted" />
              <span>Buka Arsip Dokumen</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Chat Feed */}
      <div
        className={`p-4 sm:p-6 space-y-6 bg-white overflow-y-auto ${
          isEmbeddedInCard ? "max-h-[600px] min-h-[480px]" : "min-h-[520px]"
        }`}
      >
        {/* Centered Session Badge Persis Gambar 1 */}
        <div className="flex items-center justify-center my-1">
          <span className="text-[11px] font-medium text-text-muted px-3.5 py-1 bg-surface border border-primary-light/80 rounded-md shadow-2xs">
            Hari ini, Sesi Klien Terverifikasi
          </span>
        </div>

        {/* Initial Bot Welcome Card with Questions List */}
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#060D22] text-white flex items-center justify-center text-sm shrink-0 mt-0.5 shadow-2xs">
            <ChatbotIcon />
          </div>

          <div className="space-y-4 max-w-2xl w-full">
            <div className="p-4 sm:p-4.5 rounded-2xl bg-white border border-primary-light shadow-2xs text-xs sm:text-sm text-text-primary leading-relaxed">
              Halo, saya Asisten Virtual Zhou Consulting. Silakan pilih pertanyaan
              yang tersedia untuk mendapatkan informasi seputar layanan dan
              prosedur perpajakan.
            </div>

            {/* List of Questions */}
            <div className="space-y-2">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-text-muted block px-0.5">
                Silakan pilih topik pertanyaan:
              </span>

              <div className="space-y-2">
                {faqs.map((faq) => {
                  const isSelected = selectedFaqId === faq.id;
                  return (
                    <button
                      key={faq.id}
                      type="button"
                      onClick={() => handleSelectQuestion(faq)}
                      disabled={isTyping}
                      className={`w-full text-left px-3.5 py-3 sm:px-4 sm:py-3.5 rounded-xl border transition-all duration-150 flex items-center justify-between gap-3 shadow-2xs cursor-pointer group ${
                        isSelected
                          ? "bg-slate-50 border-primary/50 text-primary"
                          : "bg-white border-slate-200 hover:border-primary/40 hover:bg-slate-50/60 text-slate-800"
                      }`}
                    >
                      <span className="text-xs sm:text-sm font-medium leading-relaxed group-hover:text-primary transition-colors">
                        {faq.question}
                      </span>
                      <ChevronRightIcon className="text-xs text-slate-400 group-hover:text-primary shrink-0 transition-colors" />
                    </button>
                  );
                })}
              </div>
            </div>

            <span className="text-[10px] text-text-muted block px-0.5">
              09:02 WIB &bull; Zhou Bot
            </span>
          </div>
        </div>

        {/* Interactive Chat History Exchanges */}
        {chatHistory.map((item) => (
          <div key={item.id} className="space-y-6 pt-2">
            {/* User Question Message */}
            <div className="flex items-start justify-end gap-2.5">
              <div className="space-y-1 max-w-xl text-right">
                <div className="p-3.5 sm:p-4 rounded-2xl bg-[#060D22] text-white text-xs sm:text-sm leading-relaxed rounded-tr-none shadow-sm text-left font-medium">
                  {item.question}
                </div>
                <span className="text-[10px] text-text-muted block pr-1">
                  {item.time} &bull; Anda
                </span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-surface border border-primary-light text-text-primary flex items-center justify-center text-xs shrink-0 mt-0.5">
                <UserIcon className="text-text-muted" />
              </div>
            </div>

            {/* Bot Answer Message with WhatsApp Paid CTA Card */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#060D22] text-white flex items-center justify-center text-sm shrink-0 mt-0.5 shadow-2xs">
                <ChatbotIcon />
              </div>

              <div className="space-y-3 max-w-2xl w-full">
                {/* Detailed Answer Bubble */}
                <div className="p-4 sm:p-4.5 rounded-2xl bg-white border border-primary-light shadow-2xs text-xs sm:text-sm text-text-primary leading-relaxed">
                  {item.answer}
                </div>

                {/* WhatsApp Paid Consultation Card */}
                <div className="p-4 sm:p-5 rounded-xl bg-white border border-primary-light shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface border border-primary-light flex items-center justify-center text-primary text-base shrink-0 mt-0.5">
                      <ClockIcon className="text-text-secondary" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs sm:text-sm font-bold text-primary">
                        Belum menemukan jawaban yang Anda butuhkan?
                      </h4>
                      <p className="text-[11px] text-text-secondary leading-relaxed max-w-md">
                        Untuk pertanyaan di luar FAQ, silakan hubungi Zhou
                        Consulting melalui WhatsApp untuk konsultasi lebih
                        lanjut.
                      </p>
                    </div>
                  </div>

                  <a
                    href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                      getWaText(item.question)
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#060D22] hover:bg-[#111e42] text-white text-xs font-bold shadow-sm transition-colors shrink-0 cursor-pointer"
                  >
                    <WhatsappIcon className="text-sm text-white" />
                    <span>Konsultasi via WhatsApp</span>
                  </a>
                </div>

                <span className="text-[10px] text-text-muted block px-0.5">
                  {item.time} &bull; Zhou Bot
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* Typing Animation */}
        {isTyping && (
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#060D22] text-white flex items-center justify-center text-sm shrink-0 mt-0.5 shadow-2xs">
              <ChatbotIcon />
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-primary-light rounded-tl-none shadow-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:0.4s]" />
              <span className="text-[11px] text-text-muted ml-2">
                Menyiapkan jawaban...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Locked Footer Bar */}
      <div className="bg-surface/60 border-t border-primary-light py-3 px-4 text-center text-xs text-text-secondary flex items-center justify-center gap-1.5">
        <LockIcon className="text-xs text-text-muted" />
        <span>
          Asisten Rule-Based Zhou Consulting &bull; Berdasarkan FAQ Resmi
        </span>
      </div>
    </>
  );

  if (isEmbeddedInCard) {
    return (
      <div className={`flex flex-col h-full bg-white ${className}`}>
        {content}
      </div>
    );
  }

  return (
    <Card
      className={`rounded-2xl border-primary-light bg-white shadow-sm overflow-hidden flex flex-col ${className}`}
    >
      {content}
    </Card>
  );
}
