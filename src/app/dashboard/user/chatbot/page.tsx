"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  ChatbotIcon,
  SendIcon,
  CheckCircleIcon,
  CheckIcon,
  ShieldTaxIcon,
  CloseIcon,
  TrashIcon,
  UserIcon,
  BriefcaseIcon,
  QuestionCircleIcon,
} from "@/components/icons";

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: string;
  legalRef?: string;
  bulletPoints?: string[];
  options?: string[];
  feedbackGiven?: "helpful" | "escalated" | null;
}

interface PresetTopic {
  id: string;
  title: string;
  question: string;
  keywords: string[];
  answer: string;
  legalRef: string;
  bulletPoints: string[];
}

const PRESET_TOPICS: PresetTopic[] = [
  {
    id: "coretax",
    title: "Kesiapan & Integrasi Coretax DJP 2026",
    question: "Bagaimana ketentuan & jadwal transisi implementasi Coretax DJP 2026?",
    keywords: ["coretax", "djp", "transisi", "2026", "integrasi", "sistem", "deposit"],
    answer:
      "Transisi Sistem Inti Administrasi Perpajakan (Coretax DJP) mengintegrasikan 21 proses bisnis perpajakan (pendaftaran, deposit pajak, pelaporan SPT, penagihan, hingga pengawasan) ke dalam satu ekosistem digital terpadu.",
    legalRef: "PMK No. 81/2024 & PER-06/PJ/2024 tentang Pelaksanaan Coretax DJP",
    bulletPoints: [
      "Wajib Pajak Badan wajib melakukan validasi NIK/NPWP 16 Digit dan sinkronisasi data seluruh pengurus/direksi.",
      "Aktivasi Akun Wajib Pajak Coretax dan registrasi Sertifikat Elektronik / token kripto resmi.",
      "Penyesuaian skema integrasi API faktur komersial dan buku besar ERP perusahaan ke standar XML/JSON DJP.",
      "Pemanfaatan akun deposit pajak terpadu (Tax Deposit Account) untuk mempermudah penyetoran berbagai jenis pajak.",
    ],
  },
  {
    id: "ter-pph21",
    title: "Tarif Efektif Rata-Rata (TER) PPh 21",
    question: "Berapa tarif efektif rata-rata (TER) PPh 21 untuk karyawan tetap?",
    keywords: ["ter", "pph 21", "pph21", "tarif", "karyawan", "gaji", "pp 58", "pmk 168"],
    answer:
      "Pemotongan PPh Pasal 21 untuk Pegawai Tetap pada Masa Pajak Januari s/d November menggunakan skema Tarif Efektif Bulanan (TER), bukan tarif progresif Pasal 17 UU PPh.",
    legalRef: "PP No. 58/2023 & PMK No. 168/2023 tentang Petunjuk Pemotongan PPh 21",
    bulletPoints: [
      "Kategori A (PTKP TK/0, TK/1, K/0): Tarif mulai 0% (bruto s.d. Rp5,4 jt) hingga 34% (bruto di atas Rp1,4 M).",
      "Kategori B (PTKP TK/2, TK/3, K/1, K/2): Tarif mulai 0% (bruto s.d. Rp6,2 jt) hingga 34%.",
      "Kategori C (PTKP K/3): Tarif mulai 0% (bruto s.d. Rp6,6 jt) hingga 34%.",
      "Masa Pajak Terakhir (Desember): PPh 21 dihitung ulang memakai tarif progresif Pasal 17 dikurangi total PPh 21 yang telah dipotong Masa Januari–November.",
    ],
  },
  {
    id: "sp2dk",
    title: "Alur Penanganan Surat SP2DK KPP",
    question: "Apa langkah yang harus dilakukan jika menerima SP2DK dari KPP?",
    keywords: ["sp2dk", "surat", "kpp", "ar", "pemeriksaan", "selisih", "ekualisasi", "klarifikasi"],
    answer:
      "Surat Permintaan Penjelasan atas Data dan/atau Keterangan (SP2DK) diterbitkan AR KPP saat ditemukan ketidaksesuaian data pelaporan SPT dengan data pihak ketiga (ILAP/DJP).",
    legalRef: "Surat Edaran Dirjen Pajak No. SE-05/PJ/2022 tentang Tata Cara Pengawasan Kepatuhan",
    bulletPoints: [
      "Batas Waktu Tanggapan: Wajib Pajak wajib menyampaikan tanggapan tertulis paling lambat 14 (empat belas) hari kalender sejak penerbitan.",
      "Kertas Kerja Ekualisasi: Susun rekonsiliasi antara omzet SPT Masa PPN 1111 dengan SPT Tahunan PPh Badan.",
      "Dokumentasi Bukti: Lengkapi kontrak komersial, mutasi rekening koran, invoice, dan bukti potong PPh 23/Unifikasi.",
      "Pendampingan Kuasa Pajak: Sangat disarankan didampingi Konsultan Berizin BKP saat klarifikasi tatap muka di KPP guna mencegah peningkatan ke pemeriksaan bukti permulaan.",
    ],
  },
  {
    id: "spt-ppn",
    title: "Batas Waktu Pelaporan SPT PPN 1111",
    question: "Berapa batas waktu pelaporan SPT Masa PPN 1111 & sanksi keterlambatan?",
    keywords: ["ppn", "1111", "spt masa", "faktur", "denda", "batas waktu", "sanksi", "terlambat"],
    answer:
      "Penyetoran PPN terutang dan pelaporan SPT Masa PPN 1111 wajib diselesaikan sebelum akhir bulan berikutnya setelah berakhirnya masa pajak yang bersangkutan.",
    legalRef: "UU No. 7/2021 (UU HPP) & PMK No. 18/PMK.03/2021",
    bulletPoints: [
      "Jatuh Tempo: Contoh Masa Pajak Agustus 2026 wajib dilaporkan paling lambat tanggal 30 September 2026.",
      "Denda Administratif Pelaporan: Dikenakan denda Rp500.000 per SPT Masa PPN apabila terlambat lapor (Pasal 7 UU KUP).",
      "Sanksi Keterlambatan Setor: Dikenakan bunga per bulan berdasarkan tarif suku bunga acuan KMK yang berlaku ditambah uplift margin.",
      "Validasi BPE: Pelaporan diakui sah setelah menerima Bukti Penerimaan Elektronik (BPE) dengan QR Code DJP aktif.",
    ],
  },
  {
    id: "sak-ep",
    title: "Prosedur Kompilasi Laporan SAK EP",
    question: "Bagaimana prosedur kompilasi laporan keuangan standar SAK EP?",
    keywords: ["sak", "akuntansi", "neraca", "laba rugi", "calk", "etap", "ep", "laporan keuangan"],
    answer:
      "Standar Akuntansi Keuangan Entitas Privat (SAK EP) telah efektif menggantikan SAK ETAP, memberikan kerangka pelaporan komprehensif bagi korporasi yang tidak memiliki akuntabilitas publik signifikan.",
    legalRef: "Standar Akuntansi Keuangan Entitas Privat (SAK EP) DSAK IAI",
    bulletPoints: [
      "5 Komponen Wajib: Laporan Posisi Keuangan (Neraca), Laporan Laba Rugi Komprehensif, Laporan Perubahan Ekuitas, Laporan Arus Kas, dan Catatan atas Laporan Keuangan (CALK).",
      "Penyelarasan Nilai Wajar: Penilaian aset tetap dan instrumen keuangan sesuai panduan SAK EP terkini.",
      "Rekonsiliasi Komersial-Fiskal: Pemisahan koreksi positif/negatif untuk pelaporan SPT Tahunan PPh Badan.",
      "Pendampingan Audit: Didampingi oleh Akuntan Beregister Negara (Chartered Accountant / CA) Zhou Consulting.",
    ],
  },
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "msg-001",
    sender: "bot",
    text: "Halo! Saya Asisten Virtual Zhou Consulting. Saya siap membantu Anda dengan informasi regulasi fiskal terkini, Coretax DJP 2026, perhitungan TER PPh 21, maupun panduan administrasi lembar kerja.",
    timestamp: "16:30 WIB",
    bulletPoints: [
      "Pilih salah satu topik rekomendasi di bawah untuk jawaban instan.",
      "Atau ketik langsung pertanyaan perpajakan spesifik Anda pada kolom input.",
      "Jika membutuhkan telaah kasus mendalam, Anda dapat mengeskalasikan percakapan ini menjadi tiket konsultasi resmi.",
    ],
  },
];

export default function ClientChatbotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Escalation Modal State
  const [isEscalationModalOpen, setIsEscalationModalOpen] = useState(false);
  const [escalationForm, setEscalationForm] = useState({
    title: "",
    category: "Pajak",
    priority: "Sedang",
    description: "",
  });
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Handle preset topic selection
  const handleSelectPreset = (preset: PresetTopic) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: preset.question,
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: preset.answer,
        legalRef: preset.legalRef,
        bulletPoints: preset.bulletPoints,
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
        feedbackGiven: null,
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 700);
  };

  // Handle free text query
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const query = inputText.trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      const q = query.toLowerCase();

      // Check matching preset
      const matched = PRESET_TOPICS.find((topic) =>
        topic.keywords.some((kw) => q.includes(kw))
      );

      let botMsg: ChatMessage;

      if (matched) {
        botMsg = {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: matched.answer,
          legalRef: matched.legalRef,
          bulletPoints: matched.bulletPoints,
          timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
          feedbackGiven: null,
        };
      } else if (q.includes("tiket") || q.includes("konsultasi") || q.includes("jadwal") || q.includes("hubungi")) {
        botMsg = {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: "Untuk kebutuhan konsultasi mendalam atau pendampingan kasus spesifik, silakan manfaatkan tombol 'Eskalasi ke Konsultan' di bawah ini untuk membuat lembar kerja tiket baru yang langsung terhubung ke konsultan berlisensi BKP/CA kami.",
          legalRef: "SLA Respons Konsultan Zhou Consulting: 1x24 Jam Kerja",
          bulletPoints: [
            "Penugasan langsung ke Tim Ahli Pajak, Akuntan CA, atau Tim Hukum PERADI.",
            "Dilindungi Pakta Integritas Kerahasiaan (NDA) dan UU PDP No. 27/2022.",
            "Monitoring progres pengerjaan real-time di dashboard tiket Anda.",
          ],
          timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
          feedbackGiven: null,
        };
      } else {
        botMsg = {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: `Terima kasih atas pertanyaan Anda mengenai "${query}". Asisten virtual rule-based mendeteksi bahwa kasus ini membutuhkan telaah dokumen atau telaah regulasi spesifik.`,
          legalRef: "Ketentuan Umum Perpajakan & Prinsip Kepatuhan Zhou Consulting",
          bulletPoints: [
            "Anda dapat memilih salah satu topik rekomendasi umum (Coretax, TER PPh 21, SP2DK, atau PPN 1111).",
            "Atau langsung eskalasikan pertanyaan ini ke Konsultan Ahli melalui tombol di bawah untuk telaah kertas kerja resmi.",
          ],
          timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
          feedbackGiven: null,
        };
      }

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 800);
  };

  const handleResetChat = () => {
    setMessages(INITIAL_MESSAGES);
    showToast("Riwayat percakapan chatbot telah dibersihkan.");
  };

  const handleFeedback = (msgId: string, type: "helpful" | "escalated", lastQuestion?: string) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === msgId ? { ...msg, feedbackGiven: type } : msg))
    );

    if (type === "helpful") {
      showToast("Terima kasih atas tanggapan Anda! Senang dapat membantu.");
    } else {
      // Trigger Escalation Modal
      setEscalationForm({
        title: lastQuestion || "Konsultasi Asistensi Kepatuhan Pajak & Coretax",
        category: "Pajak",
        priority: "Tinggi",
        description: `Eskalasi otomatis dari sesi Chatbot Bantuan pada tanggal ${new Date().toLocaleDateString("id-ID")}.\n\nKlien membutuhkan telaah mendalam terkait pembahasan di atas.`,
      });
      setIsEscalationModalOpen(true);
    }
  };

  const handleOpenEscalationDirect = () => {
    setEscalationForm({
      title: "Permohonan Asistensi Teknis & Diskusi Konsultan Ahli",
      category: "Pajak",
      priority: "Sedang",
      description: "Permohonan diajukan melalui tombol eskalasi langsung di Chatbot Bantuan Klien.",
    });
    setIsEscalationModalOpen(true);
  };

  const handleSubmitEscalation = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingTicket(true);

    setTimeout(() => {
      setIsSubmittingTicket(false);
      setIsEscalationModalOpen(false);
      showToast("Tiket konsultasi berhasil dibuat (ID: TK-2026-092). Tim konsultan akan menindaklanjuti dalam 1x24 jam.");

      // Add bot notification message
      const botConfirmMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: `Tiket eskalasi Anda telah berhasil dicatat dengan nomor referensi TK-2026-092 (${escalationForm.title}). Anda dapat memantau perkembangan lembar kerja di menu Tiket Konsultasi.`,
        legalRef: "SLA Penanganan: Maksimal 1x24 Jam Kerja oleh Tim Senior Consultant",
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
      };
      setMessages((prev) => [...prev, botConfirmMsg]);
    }, 900);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary text-white text-xs font-semibold py-3 px-5 rounded-xl shadow-2xl border border-white/20 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircleIcon className="text-success text-base" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-silver hover:text-white ml-2"
          >
            <CloseIcon className="text-xs" />
          </button>
        </div>
      )}

      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-primary-light">
        <div>
          <div className="flex items-center gap-2 text-xs text-text-muted mb-1.5">
            <Link href="/dashboard/user" className="hover:text-primary transition-colors">
              Dashboard Saya
            </Link>
            <span>/</span>
            <span className="text-primary font-bold">Chatbot Bantuan</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
            Chatbot Bantuan Fiskal &amp; Kepatuhan
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-2xl">
            Asisten virtual cerdas berbasis rule-based untuk konsultasi awal seputar Coretax 2026, SPT, PPh 21 TER, dan eskalasi lembar kerja.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetChat}
            className="text-xs h-9 px-3.5 border-primary-light text-text-secondary hover:text-error hover:border-error flex items-center gap-1.5"
          >
            <TrashIcon className="text-xs" />
            <span>Bersihkan Percakapan</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenEscalationDirect}
            className="text-xs h-9 px-4 font-semibold shadow-sm flex items-center gap-1.5"
          >
            <BriefcaseIcon className="text-xs" />
            <span>Eskalasi ke Konsultan</span>
          </Button>
        </div>
      </div>

      {/* MAIN CHAT CONTAINER SHELL */}
      <Card className="rounded-2xl border-primary-light bg-white shadow-sm overflow-hidden flex flex-col h-[680px]">
        {/* Chat Top Status Bar */}
        <CardHeader className="p-4 sm:px-6 sm:py-3.5 border-b border-primary-light bg-surface flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center text-lg shadow-sm">
                <ChatbotIcon />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-success border-2 border-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm sm:text-base font-bold text-primary">
                  Zhou Assistant (Rule-Based)
                </CardTitle>
                <Badge variant="primary" size="sm">
                  Verified BKP
                </Badge>
              </div>
              <CardDescription className="text-[11px] text-text-muted mt-0.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
                <span>Online &bull; Respons Otomatis Berbasis Regulasi 2026</span>
              </CardDescription>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="text-[11px] text-text-muted font-medium">SLA Tiket: 1x24 Jam</span>
          </div>
        </CardHeader>

        {/* Chat Messages Feed */}
        <CardContent className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5 bg-gradient-to-b from-white to-surface/30">
          {/* Date Separator */}
          <div className="flex items-center justify-center my-2">
            <span className="text-[10px] font-semibold text-text-muted px-3 py-1 bg-surface border border-primary-light rounded-full">
              Hari ini, 17 September 2026
            </span>
          </div>

          {messages.map((msg, idx) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === "user" ? "items-end" : "items-start"
              }`}
            >
              {/* Message Bubble */}
              <div className="flex items-start gap-2.5 max-w-[92%] sm:max-w-[78%]">
                {msg.sender === "bot" && (
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs shrink-0 mt-0.5 border border-primary/20 font-bold">
                    Z
                  </div>
                )}

                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-primary text-white rounded-tr-none shadow-sm"
                      : "bg-white border border-primary-light text-text-primary rounded-tl-none shadow-sm space-y-3"
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Bullet Points if available */}
                  {msg.bulletPoints && msg.bulletPoints.length > 0 && (
                    <div className="p-3 bg-surface rounded-xl border border-primary-light text-xs space-y-1.5">
                      <span className="font-bold text-primary block text-[11px] uppercase tracking-wider">
                        Poin Kunci &amp; Panduan Tindakan:
                      </span>
                      <ul className="space-y-1 text-text-secondary">
                        {msg.bulletPoints.map((pt, pIdx) => (
                          <li key={pIdx} className="flex items-start gap-2">
                            <span className="text-primary font-bold mt-0.5">&bull;</span>
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Legal Reference Tag */}
                  {msg.legalRef && (
                    <div className="pt-2 border-t border-primary-light flex items-center gap-1.5 text-[11px] text-text-muted">
                      <ShieldTaxIcon className="text-primary text-xs" />
                      <span className="font-semibold text-primary">Dasar Hukum:</span>
                      <span className="truncate">{msg.legalRef}</span>
                    </div>
                  )}

                  {/* Helpful Feedback Box (for bot messages after initial) */}
                  {msg.sender === "bot" && idx > 0 && (
                    <div className="pt-3 border-t border-primary-light/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-[11px]">
                      <span className="text-text-muted">
                        Apakah jawaban ini membantu Anda?
                      </span>

                      {msg.feedbackGiven === "helpful" ? (
                        <div className="inline-flex items-center gap-1 text-success font-bold text-[11px]">
                          <CheckIcon className="text-xs" />
                          <span>Tanggapan Tersimpan (Membantu)</span>
                        </div>
                      ) : msg.feedbackGiven === "escalated" ? (
                        <div className="inline-flex items-center gap-1 text-primary font-bold text-[11px]">
                          <BriefcaseIcon className="text-xs" />
                          <span>Tiket Dieskalasikan</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleFeedback(msg.id, "helpful")}
                            className="px-2.5 py-1 rounded-md bg-surface hover:bg-emerald-50 text-text-secondary hover:text-success border border-primary-light font-medium transition-colors"
                          >
                            Ya, Cukup Jelas
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFeedback(msg.id, "escalated", msg.text.slice(0, 60))}
                            className="px-2.5 py-1 rounded-md bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/20 font-medium transition-colors"
                          >
                            <span>Eskalasi Tiket</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {msg.sender === "user" && (
                  <div className="w-8 h-8 rounded-lg bg-surface text-text-primary flex items-center justify-center text-xs shrink-0 mt-0.5 border border-primary-light font-bold">
                    <UserIcon />
                  </div>
                )}
              </div>

              {/* Timestamp */}
              <span className="text-[10px] text-text-muted mt-1 px-11">
                {msg.timestamp}
              </span>
            </div>
          ))}

          {/* Typing Indicator Animation */}
          {isTyping && (
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs shrink-0 mt-0.5 border border-primary/20 font-bold">
                Z
              </div>
              <div className="p-3.5 rounded-2xl bg-white border border-primary-light rounded-tl-none shadow-sm flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] text-text-muted ml-2">Menyiapkan jawaban regulasi...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>

        {/* PRESET TOPICS HORIZONTAL SCROLLER */}
        <div className="px-4 sm:px-6 py-2.5 border-t border-primary-light bg-surface/70">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-[11px] text-text-muted font-bold whitespace-nowrap flex items-center gap-1">
              <QuestionCircleIcon className="text-primary text-xs" />
              <span>Topik Cepat:</span>
            </span>
            {PRESET_TOPICS.map((topic) => (
              <button
                key={topic.id}
                type="button"
                onClick={() => handleSelectPreset(topic)}
                disabled={isTyping}
                className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white hover:bg-primary hover:text-white border border-primary-light text-text-primary text-[11px] font-medium transition-all shadow-2xs hover:shadow-xs disabled:opacity-50"
              >
                {topic.title}
              </button>
            ))}
          </div>
        </div>

        {/* CHAT INPUT BAR */}
        <div className="p-3 sm:p-4 border-t border-primary-light bg-white">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2.5">
            <Input
              type="text"
              placeholder="Ketik pertanyaan seputar perpajakan, Coretax, SPT, atau SAK..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isTyping}
              className="flex-1 text-xs sm:text-sm h-10 bg-surface border-primary-light focus:bg-white"
            />
            <Button
              type="submit"
              variant="primary"
              disabled={isTyping || !inputText.trim()}
              className="h-10 px-5 text-xs font-semibold shadow-sm flex items-center gap-2 shrink-0"
            >
              <span>Kirim</span>
              <SendIcon className="text-xs" />
            </Button>
          </form>
        </div>
      </Card>

      {/* COMPLIANCE & LEGAL DISCLAIMER */}
      <div className="p-4 rounded-xl bg-surface border border-primary-light flex items-start gap-3 text-xs text-text-secondary">
        <ShieldTaxIcon className="text-primary text-base shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-primary">Penafian Hukum &amp; Kepatuhan:</strong> Respon Asisten Virtual merupakan panduan kepatuhan umum berbasis peraturan perundang-undangan perpajakan Republik Indonesia yang berlaku. Untuk telaah kasus sengketa spesifik, pendampingan surat SP2DK, dan opini hukum perpajakan berkekuatan hukum, silakan eskalasikan permohonan Anda ke tim Konsultan Berizin BKP Zhou Consulting melalui sistem tiket.
        </p>
      </div>

      {/* MODAL ESKALASI TIKET KONSULTASI BARU */}
      {isEscalationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl border border-primary-light shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-5 border-b border-primary-light flex items-center justify-between bg-surface">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center text-sm font-bold">
                  <BriefcaseIcon />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-primary">
                    Eskalasi ke Konsultan Ahli (Buat Tiket Baru)
                  </h3>
                  <p className="text-[11px] text-text-muted">
                    Hubungkan sesi tanya jawab ini langsung ke lembar kerja konsultan resmi.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEscalationModalOpen(false)}
                className="text-text-muted hover:text-primary p-1 rounded"
              >
                <CloseIcon className="text-base" />
              </button>
            </div>

            <form onSubmit={handleSubmitEscalation} className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-primary">
                  Judul Tiket Konsultasi <span className="text-error">*</span>
                </label>
                <Input
                  type="text"
                  required
                  value={escalationForm.title}
                  onChange={(e) =>
                    setEscalationForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Contoh: Asistensi Klarifikasi SP2DK atas Selisih Omzet PPh/PPN"
                  className="text-xs h-9 bg-surface border-primary-light"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-primary">
                    Divisi Penugasan <span className="text-error">*</span>
                  </label>
                  <Select
                    value={escalationForm.category}
                    onChange={(e) =>
                      setEscalationForm((prev) => ({ ...prev, category: e.target.value }))
                    }
                    className="text-xs h-9 bg-surface border-primary-light"
                  >
                    <option value="Pajak">Tax Service (PPh / PPN / Coretax)</option>
                    <option value="Akuntansi">Accounting Service (SAK EP / Audit)</option>
                    <option value="Legal">Law &amp; Corporate Legal</option>
                    <option value="Bisnis">Business &amp; Financial Advisory</option>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-primary">
                    Tingkat Prioritas <span className="text-error">*</span>
                  </label>
                  <Select
                    value={escalationForm.priority}
                    onChange={(e) =>
                      setEscalationForm((prev) => ({ ...prev, priority: e.target.value }))
                    }
                    className="text-xs h-9 bg-surface border-primary-light"
                  >
                    <option value="Sedang">Sedang (SLA 24 Jam)</option>
                    <option value="Tinggi">Tinggi (SLA 12 Jam)</option>
                    <option value="Darurat">Darurat (SP2DK Jatuh Tempo)</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-primary">
                  Rincian Kebutuhan &amp; Catatan Chat <span className="text-error">*</span>
                </label>
                <Textarea
                  required
                  rows={4}
                  value={escalationForm.description}
                  onChange={(e) =>
                    setEscalationForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Jelaskan pokok persoalan atau kendala spesifik yang dihadapi entitas Anda..."
                  className="text-xs bg-surface border-primary-light"
                />
              </div>

              <div className="p-3 bg-surface rounded-xl border border-primary-light flex items-center gap-2 text-[11px] text-text-secondary">
                <CheckCircleIcon className="text-success text-sm shrink-0" />
                <span>
                  Tiket ini akan otomatis terdaftar di menu <strong className="text-primary">Tiket Konsultasi</strong> dan ditugaskan ke Lead Consultant BKP.
                </span>
              </div>

              <div className="pt-3 flex items-center justify-between border-t border-primary-light">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEscalationModalOpen(false)}
                >
                  Batal
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmittingTicket}
                  className="flex items-center gap-1.5 font-semibold"
                >
                  {isSubmittingTicket ? (
                    <span>Memproses Tiket...</span>
                  ) : (
                    <>
                      <SendIcon className="text-xs" />
                      <span>Kirim Permohonan Eskalasi</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
