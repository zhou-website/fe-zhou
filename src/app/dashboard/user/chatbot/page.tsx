"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  ChatbotIcon,
  BriefcaseIcon,
  DocumentIcon,
  QuestionCircleIcon,
  ChevronRightIcon,
  ClockIcon,
  WhatsappIcon,
  LockIcon,
  UserIcon,
} from "@/components/icons";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_LIST: FAQItem[] = [
  {
    id: "faq-1",
    question: "Apa saja cakupan Layanan Konsultasi Perpajakan di Zhou Consulting?",
    answer:
      "Layanan Konsultasi Perpajakan Zhou Consulting mencakup Tax Compliance (SPT Masa & Tahunan), pendampingan integrasi Coretax DJP 2026, Tax Advisory & Planning, penanganan sengketa & tanggapan SP2DK, asistensi pemeriksaan pajak, serta konsultasi transfer pricing dan kepatuhan perpajakan korporasi.",
  },
  {
    id: "faq-2",
    question: "Bagaimana prosedur penelaahan dan validasi dokumen perpajakan?",
    answer:
      "Dokumen klien dianalisis melalui 3 tahap telaah: verifikasi kelengkapan berkas oleh tim analis, review kepatuhan regulasi oleh Konsultan Berizin BKP, dan pengesahan akhir oleh Lead Partner. Seluruh berkas dilindungi enkripsi SHA-256 dan pakta kerahasiaan NDA.",
  },
  {
    id: "faq-3",
    question: "Bagaimana cara memantau progres status proyek/konsultasi yang sedang berjalan?",
    answer:
      "Anda dapat memantau alur pengerjaan secara real-time melalui menu Layanan Konsultasi di sidebar atau tombol 'Buka Konsultasi / Projects' di atas. Setiap lembar kerja menampilkan tahapan milestone, persentase progres, catatan konsultan lead, dan estimasi waktu penyelesaian.",
  },
  {
    id: "faq-4",
    question: "Bagaimana mekanisme tanda tangan elektronik (e-Sign) laporan resmi?",
    answer:
      "Laporan dan kertas kerja final ditandatangani secara digital menggunakan Sertifikat Elektronik resmi berstandar kriptografi terakreditasi BSrE/Kominfo. Berkas luaran tersimpan secara permanen dan aman di Secured Vault Dokumen Pajak akun Anda.",
  },
  {
    id: "faq-5",
    question: "Apakah perusahaan kami bisa mengajukan restitusi PPN luar negeri untuk transaksi di Singapura?",
    answer:
      "Pertanyaan Anda mengenai perlakuan khusus pajak lintas batas memerlukan telaah mendalam. Topik perpajakan lintas batas yurisdiksi Singapura dalam skema restitusi memerlukan pemeriksaan mendalam terhadap tax treaty (P3B) dan bukti potong legal Anda.",
  },
];

interface ChatExchange {
  id: string;
  question: string;
  answer: string;
  time: string;
}

export default function ClientChatbotPage() {
  const [chatHistory, setChatHistory] = useState<ChatExchange[]>([]);
  const [selectedFaqId, setSelectedFaqId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="space-y-6">
      {/* Top Page Heading */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
          Chatbot
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
          Temukan jawaban cepat untuk pertanyaan umum seputar layanan dan proses konsultasi Zhou Consulting.
        </p>
      </div>

      {/* Main Chatbot Shell */}
      <Card className="rounded-2xl border-primary-light bg-white shadow-sm overflow-hidden flex flex-col">
        {/* Chat Top Header */}
        <CardHeader className="p-4 sm:px-6 sm:py-4 border-b border-primary-light bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#060D22] text-white flex items-center justify-center text-lg shadow-sm shrink-0">
              <ChatbotIcon />
            </div>
            <div>
              <CardTitle className="text-sm sm:text-base font-bold text-primary">
                Asisten Virtual Zhou Consulting
              </CardTitle>
              <div className="text-[11px] text-text-muted mt-0.5 flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span className="text-emerald-600 font-semibold">Online</span>
                <span>&bull;</span>
                <span>Terverifikasi</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="text-xs h-8 px-3 border-primary-light text-primary hover:bg-surface font-medium flex items-center gap-1.5"
            >
              <Link href="/dashboard/user/tiket">
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
              <Link href="/dashboard/user/dokumen">
                <DocumentIcon className="text-xs text-text-muted" />
                <span>Buka Arsip Dokumen</span>
              </Link>
            </Button>
          </div>
        </CardHeader>

        {/* Chat Feed */}
        <CardContent className="p-4 sm:p-6 space-y-6 bg-gradient-to-b from-white to-surface/20 min-h-[520px]">
          {/* Centered Session Badge */}
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
                Halo, saya Asisten Virtual Zhou Consulting. Silakan pilih pertanyaan yang tersedia untuk mendapatkan informasi seputar layanan dan prosedur perpajakan.
              </div>

              {/* List of Questions */}
              <div className="space-y-2">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-text-muted block px-0.5">
                  SILAKAN PILIH TOPIK PERTANYAAN:
                </span>

                <div className="space-y-2">
                  {FAQ_LIST.map((faq) => {
                    const isSelected = selectedFaqId === faq.id;
                    return (
                      <button
                        key={faq.id}
                        type="button"
                        onClick={() => handleSelectQuestion(faq)}
                        disabled={isTyping}
                        className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition-all flex items-center justify-between gap-3 shadow-2xs cursor-pointer group ${
                          isSelected
                            ? "bg-primary-light/40 border-primary/50"
                            : "bg-white border-primary-light hover:border-primary/40 hover:bg-surface/50"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <QuestionCircleIcon className="text-text-muted group-hover:text-primary text-sm shrink-0 transition-colors" />
                          <span className="text-xs sm:text-sm font-medium text-primary">
                            {faq.question}
                          </span>
                        </div>
                        <ChevronRightIcon className="text-xs text-text-muted group-hover:text-primary shrink-0 transition-colors" />
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
                          Untuk pertanyaan di luar FAQ, silakan hubungi Zhou Consulting melalui WhatsApp untuk konsultasi lebih lanjut. Konsultasi lanjutan melalui WhatsApp dapat dikenakan biaya sesuai layanan konsultasi yang dipilih.
                        </p>
                      </div>
                    </div>

                    <a
                      href={`https://wa.me/6281234567890?text=${encodeURIComponent(
                        `Halo Zhou Consulting, saya klien dan ingin konsultasi lebih lanjut mengenai: "${item.question}" (Layanan Konsultasi Berbayar).`
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
                <span className="text-[11px] text-text-muted ml-2">Menyiapkan jawaban...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>

        {/* Locked Footer Bar */}
        <div className="bg-surface/60 border-t border-primary-light py-3 px-4 text-center text-xs text-text-secondary flex items-center justify-center gap-1.5">
          <LockIcon className="text-xs text-text-muted" />
          <span>Asisten Rule-Based Zhou Consulting &bull; Berdasarkan FAQ Resmi</span>
        </div>
      </Card>
    </div>
  );
}
