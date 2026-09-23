"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  ShieldTaxIcon,
  BookIcon,
  BriefcaseIcon,
  BuildingIcon,
  LocationIcon,
  ClockIcon,
  CalendarIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  DocumentIcon,
  CheckCircleIcon,
  CheckIcon,
  CloseIcon,
  DownloadIcon,
  WhatsappIcon,
  QuestionCircleIcon,
} from "@/components/icons";

// Data Model: Layanan Spesialis
interface ServiceCategory {
  id: string;
  title: string;
  leadConsultant: string;
  description: string;
  icon: React.ElementType;
  badge: string;
  subTopics: string[];
}

const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: "tax",
    title: "Perpajakan Korporat & Kesiapan Coretax 2026",
    leadConsultant: "Linda David, S.Ak., BKP & Tim Pajak Berlisensi",
    description:
      "Telaah kepatuhan SPT Masa & Tahunan, mitigasi risiko SP2DK, evaluasi ekualisasi omzet vs faktur, dan pendampingan migrasi Coretax DJP.",
    icon: ShieldTaxIcon,
    badge: "BKP Berlisensi IKPI",
    subTopics: [
      "Kesiapan & Simulasi Coretax DJP 2026",
      "Pendampingan & Respon Surat SP2DK KPP",
      "Ekualisasi & Pelaporan SPT Tahunan Badan",
      "Kompilasi e-Faktur & e-Bupot Unifikasi",
      "Restitusi Pajak Pertambahan Nilai (PPN)",
      "Tax Planning & Kepatuhan Fiskal Strategis",
    ],
  },
  {
    id: "accounting",
    title: "Standar Akuntansi Keuangan SAK EP & IFRS",
    leadConsultant: "Akuntan Beregister CA & Rekan Senior IAPI",
    description:
      "Penyusunan laporan keuangan terstandarisasi, penataan Chart of Accounts (COA), rekonsiliasi fiskal-komersial, dan pendampingan audit.",
    icon: BookIcon,
    badge: "Chartered Accountant (CA)",
    subTopics: [
      "Implementasi Standar SAK Entitas Privat (SAK EP)",
      "Penyusunan Laporan Keuangan Auditable",
      "Review & Perapian Chart of Accounts (COA)",
      "Rekonsiliasi Fiskal vs Komersial",
      "Standard Operating Procedure (SOP) Keuangan",
    ],
  },
  {
    id: "legal",
    title: "Hukum Korporasi, Kontrak Bisnis & OSS-RBA",
    leadConsultant: "Advokat PERADI & Spesialis Hukum Bisnis",
    description:
      "Drafting & telaah kontrak komersial, kepatuhan perlindungan data pribadi (UU PDP No. 27/2022), perizinan OSS-RBA, dan legal due diligence.",
    icon: BriefcaseIcon,
    badge: "Advokat Berlisensi PERADI",
    subTopics: [
      "Drafting & Review Kontrak Komersial / Perjanjian Kerjasama",
      "Audit Kepatuhan UU PDP No. 27 Tahun 2022",
      "Perizinan Usaha Berbasis Risiko (OSS-RBA)",
      "Restrukturisasi Legalitas & Anggaran Dasar PT",
      "Legal Due Diligence Transaksi Bisnis",
    ],
  },
  {
    id: "business",
    title: "Advisori Keuangan, Valuasi & Kelayakan Bisnis",
    leadConsultant: "Senior Financial Partner & Analis Finansial",
    description:
      "Studi kelayakan ekspansi bisnis, penyusunan model proyeksi finansial (financial modeling), valuasi entitas, dan restrukturisasi arus kas.",
    icon: BuildingIcon,
    badge: "Financial Analyst & Partner",
    subTopics: [
      "Studi Kelayakan Usaha & Proyeksi Investasi (Feasibility Study)",
      "Valuasi Bisnis & Persiapan Pendanaan (Due Diligence)",
      "Restrukturisasi Manajemen Modal Kerja & Arus Kas",
      "Perencanaan Anggaran & Pengendalian Biaya Operasional",
      "Advisori Tata Kelola Keuangan Merger & Akuisisi",
    ],
  },
];

// Data Model: Sesi Waktu Harian
interface TimeSlot {
  id: string;
  time: string;
  label: string;
  isAvailable: boolean;
}

const DAILY_TIME_SLOTS: TimeSlot[] = [
  { id: "slot-1", time: "09.00 – 10.30 WIB", label: "Sesi Pagi I", isAvailable: true },
  { id: "slot-2", time: "10.45 – 12.15 WIB", label: "Sesi Pagi II", isAvailable: true },
  { id: "slot-3", time: "13.30 – 15.00 WIB", label: "Sesi Siang I", isAvailable: true },
  { id: "slot-4", time: "15.30 – 17.00 WIB", label: "Sesi Siang II", isAvailable: false },
];

export default function ConsultationPage() {
  // Stepper State: 1 (Layanan & Format), 2 (Jadwal & Waktu), 3 (Data Diri & Kasus), 4 (Konfirmasi & Tiket)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1 State: Bidang Layanan & Format
  const [selectedServiceId, setSelectedServiceId] = useState<string>("tax");
  const [meetingFormat, setMeetingFormat] = useState<"offline" | "online">("offline");

  // Step 2 State: Tanggal & Waktu
  const [selectedDateIndex, setSelectedDateIndex] = useState<number>(0);
  const [selectedSlotId, setSelectedSlotId] = useState<string>("slot-1");

  // Generate 10 hari kerja mendatang (Senin - Jumat)
  const availableWorkDays = useMemo(() => {
    const days: { dateStr: string; dayName: string; formatted: string; isWeekend: boolean }[] = [];
    const today = new Date();
    let count = 0;
    let offset = 1;

    const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const monthNames = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    while (count < 10) {
      const d = new Date(today);
      d.setDate(today.getDate() + offset);
      const dayOfWeek = d.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        days.push({
          dateStr: d.toISOString().split("T")[0],
          dayName: dayNames[dayOfWeek],
          formatted: `${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`,
          isWeekend: false,
        });
        count++;
      }
      offset++;
    }
    return days;
  }, []);

  // Step 3 State: Data Pemohon & Rincian Kasus
  const [clientData, setClientData] = useState({
    picName: "",
    picTitle: "",
    companyName: "",
    npwp: "",
    email: "",
    phone: "",
    subTopic: "",
    notes: "",
  });

  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [uploadedFileSize, setUploadedFileSize] = useState<string>("");

  // Step 4 State: Persetujuan NDA & Submission
  const [agreeNDA, setAgreeNDA] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const [ticketNumber, setTicketNumber] = useState<string>("");
  const [confirmationDate, setConfirmationDate] = useState<string>("");

  // Current Selected Service Object
  const currentService = useMemo(() => {
    return SERVICE_CATEGORIES.find((s) => s.id === selectedServiceId) || SERVICE_CATEGORIES[0];
  }, [selectedServiceId]);

  // Current Selected Slot Object
  const currentSlot = useMemo(() => {
    return DAILY_TIME_SLOTS.find((s) => s.id === selectedSlotId) || DAILY_TIME_SLOTS[0];
  }, [selectedSlotId]);

  const selectedDateObj = availableWorkDays[selectedDateIndex] || availableWorkDays[0];

  // Set default subtopic when service changes
  const handleServiceChange = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    const s = SERVICE_CATEGORIES.find((item) => item.id === serviceId);
    if (s && s.subTopics.length > 0) {
      setClientData((prev) => ({ ...prev, subTopic: s.subTopics[0] }));
    }
  };

  // Handle file attachment simulation
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setFormErrors((prev) => ({ ...prev, file: "Ukuran berkas melebihi batas maksimal 10MB." }));
        return;
      }
      setUploadedFileName(file.name);
      setUploadedFileSize(`${(file.size / (1024 * 1024)).toFixed(2)} MB`);
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next.file;
        return next;
      });
    }
  };

  const removeUploadedFile = () => {
    setUploadedFileName("");
    setUploadedFileSize("");
  };

  // Step Validations
  const validateStep3 = () => {
    const errors: Record<string, string> = {};
    if (!clientData.picName.trim()) {
      errors.picName = "Nama lengkap PIC wajib diisi.";
    }
    if (!clientData.companyName.trim()) {
      errors.companyName = "Nama perusahaan / badan usaha wajib diisi.";
    }
    if (!clientData.email.trim()) {
      errors.email = "Alamat email resmi wajib diisi.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientData.email)) {
      errors.email = "Format alamat email tidak valid.";
    }
    if (!clientData.phone.trim() || clientData.phone.length < 8) {
      errors.phone = "Nomor WhatsApp / telepon aktif wajib diisi.";
    }
    if (clientData.npwp.trim() && !/^\d{15,16}$/.test(clientData.npwp.replace(/\D/g, ""))) {
      errors.npwp = "NPWP harus memuat 16 digit format Coretax (atau 15 digit lama).";
    }
    if (!clientData.notes.trim() || clientData.notes.length < 15) {
      errors.notes = "Rincian kebutuhan konsultasi minimal 15 karakter.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const goToNextStep = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
      window.scrollTo({ top: 400, behavior: "smooth" });
    } else if (currentStep === 2) {
      setCurrentStep(3);
      window.scrollTo({ top: 400, behavior: "smooth" });
    } else if (currentStep === 3) {
      if (validateStep3()) {
        setCurrentStep(4);
        window.scrollTo({ top: 400, behavior: "smooth" });
      }
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 400, behavior: "smooth" });
    }
  };

  // Submit Handler: API04 Integration Simulation
  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreeNDA) {
      setFormErrors((prev) => ({
        ...prev,
        agreeNDA: "Anda wajib menyetujui pakta kerahasiaan NDA & pemrosesan data pribadi.",
      }));
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});

    setTimeout(() => {
      const randomTicket = `ZHOU-CNS-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      setTicketNumber(randomTicket);
      setConfirmationDate(new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }));
      setIsSubmitting(false);
      setIsConfirmed(true);
      window.scrollTo({ top: 350, behavior: "smooth" });
    }, 1200);
  };

  const [receiptDownloaded, setReceiptDownloaded] = useState<boolean>(false);

  const handleDownloadReceipt = () => {
    const content = `======================================================
ZHOU CONSULTING - TANDA TERIMA RESERVASI KONSULTASI
======================================================
Nomor Tiket    : ${ticketNumber}
Tanggal Rilis  : ${confirmationDate}
Status         : Terkonfirmasi (SLA 1x24 Jam)
Divisi Layanan : ${currentService.title}
Konsultan Lead : ${currentService.leadConsultant}
Format Sesi    : ${meetingFormat === "offline" ? "Tatap Muka di Menara Sudirman Kav. 21" : "Video Conference Daring (Google Meet)"}
Jadwal Sesi    : ${selectedDateObj?.formatted || ""} (${currentSlot?.time || ""} WIB)

DATA PEMOHON:
Nama PIC       : ${clientData.picName} (${clientData.picTitle || "Manajemen"})
Perusahaan     : ${clientData.companyName}
NPWP Entitas   : ${clientData.npwp || "Dalam Proses"}
Email Resmi    : ${clientData.email}
WhatsApp       : ${clientData.phone}
Topik          : ${clientData.subTopic}

Keamanan Data  : Terproteksi Pakta Kerahasiaan (NDA) & SSL 256-bit
======================================================`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Tanda_Terima_Konsultasi_${ticketNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setReceiptDownloaded(true);
    setTimeout(() => setReceiptDownloaded(false), 4000);
  };

  const handleResetForm = () => {
    setIsConfirmed(false);
    setCurrentStep(1);
    setSelectedServiceId("tax");
    setMeetingFormat("offline");
    setSelectedDateIndex(0);
    setSelectedSlotId("slot-1");
    setClientData({
      picName: "",
      picTitle: "",
      companyName: "",
      npwp: "",
      email: "",
      phone: "",
      subTopic: "",
      notes: "",
    });
    setUploadedFileName("");
    setUploadedFileSize("");
    setAgreeNDA(false);
    setFormErrors({});
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface font-sans text-text-primary">
      <Navbar />

      <main className="flex-grow pt-24 pb-20">
        {/* Breadcrumb Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex text-xs text-text-secondary" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 sm:space-x-2">
              <li className="inline-flex items-center">
                <Link href="/" className="hover:text-primary transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-1 sm:mx-2 text-silver">/</span>
                  <span className="text-primary font-semibold">
                    Permohonan &amp; Jadwal Konsultasi
                  </span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        {/* Page Header Clean */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <div className="space-y-1.5">
            <Badge
              variant="outline"
              className="bg-primary/5 text-primary border-primary/20 text-xs px-2.5 py-0.5"
            >
              Layanan Permohonan Resmi
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">
              Reservasi Jadwal &amp; Permohonan Konsultasi Ahli
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              Pilih divisi konsultan, tentukan format pertemuan tatap muka di Menara Sudirman atau daring via Google Meet.
            </p>
          </div>
        </div>

        {/* Stepper Progress Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="bg-white rounded-xl border border-navy-light p-4 shadow-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Step 1 Indicator */}
              <div
                className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all ${
                  currentStep === 1
                    ? "bg-primary text-white border-primary shadow-sm"
                    : currentStep > 1
                    ? "bg-white text-primary border-success/40"
                    : "bg-surface text-text-secondary border-navy-light"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    currentStep === 1
                      ? "bg-white text-primary"
                      : currentStep > 1
                      ? "bg-success text-white"
                      : "bg-navy-light text-text-secondary"
                  }`}
                >
                  {currentStep > 1 ? <CheckIcon className="text-xs" /> : "1"}
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wider font-semibold opacity-80">
                    Langkah 1
                  </div>
                  <div className="text-xs font-bold truncate">Bidang &amp; Format</div>
                </div>
              </div>

              {/* Step 2 Indicator */}
              <div
                className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all ${
                  currentStep === 2
                    ? "bg-primary text-white border-primary shadow-sm"
                    : currentStep > 2
                    ? "bg-white text-primary border-success/40"
                    : "bg-surface text-text-secondary border-navy-light"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    currentStep === 2
                      ? "bg-white text-primary"
                      : currentStep > 2
                      ? "bg-success text-white"
                      : "bg-navy-light text-text-secondary"
                  }`}
                >
                  {currentStep > 2 ? <CheckIcon className="text-xs" /> : "2"}
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wider font-semibold opacity-80">
                    Langkah 2
                  </div>
                  <div className="text-xs font-bold truncate">Jadwal &amp; Sesi</div>
                </div>
              </div>

              {/* Step 3 Indicator */}
              <div
                className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all ${
                  currentStep === 3
                    ? "bg-primary text-white border-primary shadow-sm"
                    : currentStep > 3
                    ? "bg-white text-primary border-success/40"
                    : "bg-surface text-text-secondary border-navy-light"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    currentStep === 3
                      ? "bg-white text-primary"
                      : currentStep > 3
                      ? "bg-success text-white"
                      : "bg-navy-light text-text-secondary"
                  }`}
                >
                  {currentStep > 3 ? <CheckIcon className="text-xs" /> : "3"}
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wider font-semibold opacity-80">
                    Langkah 3
                  </div>
                  <div className="text-xs font-bold truncate">Data &amp; Kasus</div>
                </div>
              </div>

              {/* Step 4 Indicator */}
              <div
                className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all ${
                  currentStep === 4
                    ? "bg-primary text-white border-primary shadow-sm"
                    : isConfirmed
                    ? "bg-white text-primary border-success/40"
                    : "bg-surface text-text-secondary border-navy-light"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    currentStep === 4
                      ? "bg-white text-primary"
                      : isConfirmed
                      ? "bg-success text-white"
                      : "bg-navy-light text-text-secondary"
                  }`}
                >
                  {isConfirmed ? <CheckIcon className="text-xs" /> : "4"}
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wider font-semibold opacity-80">
                    Langkah 4
                  </div>
                  <div className="text-xs font-bold truncate">Konfirmasi &amp; Tiket</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Main Form Container (8 Cols) */}
            <div className="lg:col-span-8">
              {/* SUCCESS CONFIRMED STATE */}
              {isConfirmed ? (
                <Card className="border-success/40 bg-white shadow-sm overflow-hidden">
                  <div className="bg-success text-white px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                        <CheckCircleIcon className="text-lg text-white" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold">Permohonan Konsultasi Berhasil Terdaftar</h2>
                        <p className="text-xs text-white/90">
                          Nomor Tiket Resmi: <span className="font-mono font-bold tracking-wider">{ticketNumber}</span>
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-white/20 text-white border-white/40 text-xs hidden sm:inline-block">
                      SLA Respon 1x24 Jam
                    </Badge>
                  </div>

                  <CardContent className="p-6 sm:p-8 space-y-6">
                    {/* Official Receipt Card */}
                    <div className="border border-navy-light rounded-xl p-5 bg-surface/60 space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-navy-light text-xs text-text-secondary">
                        <span className="font-semibold text-primary">TANDA TERIMA RESERVASI KONSULTASI</span>
                        <span>{confirmationDate}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-text-secondary block">Divisi Layanan Terpilih:</span>
                          <span className="font-bold text-primary">{currentService.title}</span>
                          <span className="text-[11px] text-text-secondary block mt-0.5">
                            Lead: {currentService.leadConsultant}
                          </span>
                        </div>
                        <div>
                          <span className="text-text-secondary block">Format Pertemuan:</span>
                          <span className="font-bold text-primary">
                            {meetingFormat === "offline"
                              ? "Tatap Muka di Menara Sudirman Lt. 12"
                              : "Daring (Google Meet / Zoom Terenkripsi)"}
                          </span>
                        </div>
                        <div>
                          <span className="text-text-secondary block">Jadwal Sesi yang Dipesan:</span>
                          <span className="font-bold text-primary">
                            {selectedDateObj.dayName}, {selectedDateObj.formatted}
                          </span>
                          <span className="text-[11px] text-text-secondary block mt-0.5">
                            Pukul {currentSlot.time}
                          </span>
                        </div>
                        <div>
                          <span className="text-text-secondary block">Pemohon &amp; Entitas:</span>
                          <span className="font-bold text-primary">{clientData.picName}</span>
                          <span className="text-[11px] text-text-secondary block mt-0.5">
                            {clientData.companyName} {clientData.picTitle ? `(${clientData.picTitle})` : ""}
                          </span>
                        </div>
                        <div>
                          <span className="text-text-secondary block">Kontak Notifikasi:</span>
                          <span className="font-medium text-text-primary">{clientData.email}</span>
                          <span className="text-[11px] text-text-secondary block mt-0.5">
                            WhatsApp: {clientData.phone}
                          </span>
                        </div>
                        <div>
                          <span className="text-text-secondary block">Sub-Topik Diskusi:</span>
                          <span className="font-medium text-text-primary">{clientData.subTopic || "-"}</span>
                          {uploadedFileName && (
                            <span className="text-[11px] text-success block mt-0.5">
                              Lampiran: {uploadedFileName} ({uploadedFileSize})
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-navy-light flex items-center justify-between text-xs text-text-secondary">
                        <div className="flex items-center gap-1.5 text-success font-semibold">
                          <CheckIcon className="text-xs" />
                          <span>Status: Menunggu Konfirmasi Sekretariat (SLA 1x24 Jam)</span>
                        </div>
                        <span className="text-[11px]">Enkripsi SSL 256-bit</span>
                      </div>
                    </div>

                    {/* Next Steps Notification */}
                    <div className="bg-primary/5 border border-primary/15 rounded-xl p-4 text-xs text-text-primary space-y-2">
                      <div className="font-bold text-primary flex items-center gap-2">
                        <ClockIcon className="text-xs text-primary" />
                        Langkah Selanjutnya dari Tim Zhou Consulting:
                      </div>
                      <p className="text-text-secondary leading-relaxed">
                        1. Tim sekretariat akan melakukan verifikasi ketersediaan ruang sidang eksekutif atau tautan video conference dalam waktu maksimal 1x24 jam kerja.
                      </p>
                      <p className="text-text-secondary leading-relaxed">
                        2. Surat Konfirmasi Jadwal (Appointment Letter) beserta tautan kalender akan dikirimkan ke alamat email <strong className="text-primary">{clientData.email}</strong> dan notifikasi WhatsApp ke <strong className="text-primary">{clientData.phone}</strong>.
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleDownloadReceipt}
                        className="inline-flex items-center gap-2 cursor-pointer shadow-sm"
                      >
                        <DownloadIcon className="text-xs" />
                        <span>{receiptDownloaded ? "Tanda Terima Terunduh!" : "Unduh Konfirmasi Jadwal (File)"}</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="border-success text-success hover:bg-success/10"
                      >
                        <a
                          href={`https://wa.me/6281299887766?text=Halo%20Sekretariat%20Zhou%20Consulting,%20saya%20telah%20mengajukan%20reservasi%20konsultasi%20dengan%20nomor%20tiket%20${ticketNumber}.%20Mohon%20bantuan%20konfirmasi.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2"
                        >
                          <WhatsappIcon className="text-xs" />
                          <span>Hubungi Sekretariat via WA</span>
                        </a>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleResetForm}
                        className="text-text-secondary hover:text-primary ml-auto"
                      >
                        Buat Reservasi Baru
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                /* STEP-BY-STEP RESERVATION FORM */
                <Card className="border-navy-light bg-white shadow-sm">
                  {/* STEP 1: LAYANAN & FORMAT */}
                  {currentStep === 1 && (
                    <div>
                      <CardHeader className="border-b border-navy-light p-6">
                        <Badge variant="outline" className="w-fit text-primary border-primary/30 text-xs mb-1">
                          Langkah 1 dari 4
                        </Badge>
                        <CardTitle className="text-xl font-bold text-primary">
                          Pilih Bidang Layanan &amp; Format Pertemuan
                        </CardTitle>
                        <CardDescription className="text-xs text-text-secondary">
                          Tentukan rumpun keahlian konsultan yang Anda butuhkan serta mekanisme pertemuan yang paling nyaman bagi Anda.
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="p-6 space-y-6">
                        {/* Service Cards Grid */}
                        <div>
                          <Label className="text-xs font-bold text-primary uppercase tracking-wider block mb-3">
                            1. Bidang Layanan Spesialis
                          </Label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            {SERVICE_CATEGORIES.map((service) => {
                              const isSelected = selectedServiceId === service.id;
                              const IconComponent = service.icon;
                              return (
                                <div
                                  key={service.id}
                                  onClick={() => handleServiceChange(service.id)}
                                  className={`cursor-pointer rounded-xl p-4 border transition-all duration-200 flex flex-col justify-between ${
                                    isSelected
                                      ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm"
                                      : "border-navy-light hover:border-primary/40 bg-white"
                                  }`}
                                >
                                  <div>
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                      <div
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                          isSelected
                                            ? "bg-primary text-white"
                                            : "bg-surface text-primary border border-navy-light"
                                        }`}
                                      >
                                        <IconComponent className="text-xs" />
                                      </div>
                                      <span
                                        className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                                          isSelected
                                            ? "bg-primary/10 text-primary border-primary/20"
                                            : "bg-surface text-text-secondary border-navy-light"
                                        }`}
                                      >
                                        {service.badge}
                                      </span>
                                    </div>
                                    <h3 className="text-sm font-bold text-primary mb-1">
                                      {service.title}
                                    </h3>
                                    <p className="text-xs text-text-secondary leading-relaxed mb-3">
                                      {service.description}
                                    </p>
                                  </div>

                                  <div className="pt-2 border-t border-navy-light/60 flex items-center justify-between text-[11px]">
                                    <span className="text-text-secondary font-medium truncate">
                                      Lead: {service.leadConsultant.split("&")[0]}
                                    </span>
                                    <div
                                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                        isSelected
                                          ? "border-primary bg-primary text-white"
                                          : "border-silver bg-white"
                                      }`}
                                    >
                                      {isSelected && <CheckIcon className="text-[9px]" />}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Format Pertemuan Grid */}
                        <div className="pt-4 border-t border-navy-light">
                          <Label className="text-xs font-bold text-primary uppercase tracking-wider block mb-3">
                            2. Format &amp; Media Pertemuan Sesi
                          </Label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            {/* Option 1: Offline / Tatap Muka */}
                            <div
                              onClick={() => setMeetingFormat("offline")}
                              className={`cursor-pointer rounded-xl p-4 border transition-all ${
                                meetingFormat === "offline"
                                  ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm"
                                  : "border-navy-light hover:border-primary/40 bg-white"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                  <LocationIcon className="text-xs" />
                                </div>
                                <div
                                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                    meetingFormat === "offline"
                                      ? "border-primary bg-primary text-white"
                                      : "border-silver bg-white"
                                  }`}
                                >
                                  {meetingFormat === "offline" && <CheckIcon className="text-[9px]" />}
                                </div>
                              </div>
                              <h4 className="text-sm font-bold text-primary mb-1">
                                Tatap Muka di Kantor Pusat
                              </h4>
                              <p className="text-xs text-text-secondary leading-relaxed">
                                Ruang Sidang Eksekutif Menara Sudirman Lt. 12, Kav. 21, Jakarta Pusat. Diskusi tatap muka langsung bersama lead consultant.
                              </p>
                              <div className="mt-3 text-[11px] text-text-secondary flex items-center gap-1.5 font-medium">
                                <CheckIcon className="text-[10px] text-success" />
                                <span>Akses dekat Stasiun MRT Bendungan Hilir &amp; TransJakarta</span>
                              </div>
                            </div>

                            {/* Option 2: Online / Daring */}
                            <div
                              onClick={() => setMeetingFormat("online")}
                              className={`cursor-pointer rounded-xl p-4 border transition-all ${
                                meetingFormat === "online"
                                  ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm"
                                  : "border-navy-light hover:border-primary/40 bg-white"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                  <ClockIcon className="text-xs" />
                                </div>
                                <div
                                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                    meetingFormat === "online"
                                      ? "border-primary bg-primary text-white"
                                      : "border-silver bg-white"
                                  }`}
                                >
                                  {meetingFormat === "online" && <CheckIcon className="text-[9px]" />}
                                </div>
                              </div>
                              <h4 className="text-sm font-bold text-primary mb-1">
                                Video Conference Daring
                              </h4>
                              <p className="text-xs text-text-secondary leading-relaxed">
                                Sesi interaktif via Google Meet atau Zoom terenkripsi end-to-end dengan fasilitas live screen-share telaah laporan fiskal.
                              </p>
                              <div className="mt-3 text-[11px] text-text-secondary flex items-center gap-1.5 font-medium">
                                <CheckIcon className="text-[10px] text-success" />
                                <span>Tautan meeting otomatis terkirim via email resmi</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Step 1 Actions */}
                        <div className="pt-4 flex justify-end">
                          <Button
                            type="button"
                            onClick={goToNextStep}
                            className="px-6"
                          >
                            <span>Lanjutkan</span>
                          </Button>
                        </div>
                      </CardContent>
                    </div>
                  )}

                  {/* STEP 2: JADWAL & SESI WAKTU */}
                  {currentStep === 2 && (
                    <div>
                      <CardHeader className="border-b border-navy-light p-6">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-primary border-primary/30 text-xs">
                            Langkah 2 dari 4
                          </Badge>
                          <span className="text-xs text-text-secondary font-medium">
                            Bidang: <strong className="text-primary">{currentService.title.split("&")[0]}</strong>
                          </span>
                        </div>
                        <CardTitle className="text-xl font-bold text-primary mt-1">
                          Tentukan Tanggal &amp; Sesi Waktu Konsultasi
                        </CardTitle>
                        <CardDescription className="text-xs text-text-secondary">
                          Pilih hari kerja aktif (Senin – Jumat) dan slot waktu yang sesuai dengan agenda manajemen Anda.
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="p-6 space-y-6">
                        {/* Date Picker Grid (10 Work Days) */}
                        <div>
                          <Label className="text-xs font-bold text-primary uppercase tracking-wider block mb-3 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <CalendarIcon className="text-xs text-primary" />
                              <span>1. Pilih Tanggal Konsultasi (Hari Kerja)</span>
                            </span>
                            <span className="text-[11px] font-normal text-text-secondary lowercase">
                              tersedia 10 hari kerja ke depan
                            </span>
                          </Label>

                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                            {availableWorkDays.map((day, idx) => {
                              const isSelected = selectedDateIndex === idx;
                              return (
                                <button
                                  type="button"
                                  key={day.dateStr}
                                  onClick={() => setSelectedDateIndex(idx)}
                                  className={`p-3 rounded-xl border text-left transition-all ${
                                    isSelected
                                      ? "border-primary bg-primary text-white shadow-sm"
                                      : "border-navy-light hover:border-primary/40 bg-white text-text-primary"
                                  }`}
                                >
                                  <div
                                    className={`text-[10px] uppercase font-bold tracking-wider ${
                                      isSelected ? "text-white/80" : "text-text-secondary"
                                    }`}
                                  >
                                    {day.dayName}
                                  </div>
                                  <div className="text-sm font-bold mt-0.5">{day.formatted.split(" ")[0]} {day.formatted.split(" ")[1].slice(0, 3)}</div>
                                  <div
                                    className={`text-[10px] mt-1.5 flex items-center gap-1 ${
                                      isSelected ? "text-white/90" : "text-success"
                                    }`}
                                  >
                                    <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                                    <span>Tersedia</span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Slot Picker Grid */}
                        <div className="pt-4 border-t border-navy-light">
                          <Label className="text-xs font-bold text-primary uppercase tracking-wider block mb-3">
                            2. Pilih Slot Waktu Sesi (Durasi 90 Menit)
                          </Label>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {DAILY_TIME_SLOTS.map((slot) => {
                              const isSelected = selectedSlotId === slot.id;
                              const isAvailable = slot.isAvailable;

                              return (
                                <div
                                  key={slot.id}
                                  onClick={() => {
                                    if (isAvailable) setSelectedSlotId(slot.id);
                                  }}
                                  className={`p-4 rounded-xl border transition-all flex items-center justify-between ${
                                    !isAvailable
                                      ? "bg-surface/80 border-navy-light opacity-60 cursor-not-allowed"
                                      : isSelected
                                      ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm cursor-pointer"
                                      : "border-navy-light hover:border-primary/40 bg-white cursor-pointer"
                                  }`}
                                >
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <ClockIcon className="text-xs text-text-secondary" />
                                      <span className="text-xs font-bold text-primary">{slot.time}</span>
                                    </div>
                                    <div className="text-[11px] text-text-secondary mt-0.5">
                                      {slot.label} &bull; Maks 3 partisipan klien
                                    </div>
                                  </div>

                                  <div>
                                    {isAvailable ? (
                                      <Badge
                                        variant="outline"
                                        className={`text-[10px] px-2 py-0.5 ${
                                          isSelected
                                            ? "bg-primary text-white border-primary"
                                            : "bg-success/15 text-success border-success/30"
                                        }`}
                                      >
                                        {isSelected ? "Terpilih" : "Tersedia"}
                                      </Badge>
                                    ) : (
                                      <Badge
                                        variant="outline"
                                        className="bg-silver/20 text-text-secondary border-silver text-[10px] px-2 py-0.5"
                                      >
                                        Penuh
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Selection Summary Callout */}
                        <div className="bg-surface rounded-xl p-4 border border-navy-light flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                          <div>
                            <span className="text-text-secondary block">Ringkasan Jadwal Terpilih:</span>
                            <span className="font-bold text-primary">
                              {selectedDateObj.dayName}, {selectedDateObj.formatted} &bull; {currentSlot.time}
                            </span>
                            <span className="text-text-secondary text-[11px] block mt-0.5">
                              Format: {meetingFormat === "offline" ? "Tatap Muka di Menara Sudirman" : "Daring (Google Meet)"}
                            </span>
                          </div>

                          <Badge variant="outline" className="bg-white text-primary border-navy-light text-xs shrink-0">
                            Durasi: 90 Menit
                          </Badge>
                        </div>

                        {/* Step 2 Actions */}
                        <div className="pt-4 flex items-center justify-between">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={goToPrevStep}
                            className="border-navy-light text-text-secondary hover:text-primary hover:bg-surface cursor-pointer"
                          >
                            Kembali
                          </Button>

                          <Button
                            type="button"
                            onClick={goToNextStep}
                            className="px-6"
                          >
                            <span>Lanjutkan</span>
                          </Button>
                        </div>
                      </CardContent>
                    </div>
                  )}

                  {/* STEP 3: IDENTITAS KLIEN & KASUS */}
                  {currentStep === 3 && (
                    <div>
                      <CardHeader className="border-b border-navy-light p-6">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-primary border-primary/30 text-xs">
                            Langkah 3 dari 4
                          </Badge>
                          <span className="text-xs text-text-secondary font-medium">
                            Jadwal: <strong className="text-primary">{selectedDateObj.formatted} ({currentSlot.time.split(" ")[0]})</strong>
                          </span>
                        </div>
                        <CardTitle className="text-xl font-bold text-primary mt-1">
                          Informasi Entitas Klien &amp; Rincian Kebutuhan
                        </CardTitle>
                        <CardDescription className="text-xs text-text-secondary">
                          Mohon lengkapi identitas penanggung jawab dan gambaran umum kendala fiskal atau bisnis untuk telaah awal konsultan.
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="p-6 space-y-5">
                        {/* Row 1: PIC Name & Position */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="picName" className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                              <UserIcon className="text-[11px] text-text-secondary" />
                              <span>Nama Lengkap PIC Pemohon</span>
                              <span className="text-error">*</span>
                            </Label>
                            <Input
                              id="picName"
                              placeholder="Contoh: Hendra Wijaya"
                              value={clientData.picName}
                              onChange={(e) => setClientData({ ...clientData, picName: e.target.value })}
                              className={formErrors.picName ? "border-error focus:ring-error" : ""}
                            />
                            {formErrors.picName && (
                              <p className="text-[11px] text-error font-medium">{formErrors.picName}</p>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="picTitle" className="text-xs font-semibold text-text-primary">
                              Jabatan / Posisi dalam Entitas
                            </Label>
                            <Input
                              id="picTitle"
                              placeholder="Contoh: Direktur Keuangan / Tax Manager"
                              value={clientData.picTitle}
                              onChange={(e) => setClientData({ ...clientData, picTitle: e.target.value })}
                            />
                          </div>
                        </div>

                        {/* Row 2: Company Name & NPWP 16 Digit */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="companyName" className="text-xs font-semibold text-text-primary">
                              Nama Perusahaan / Entitas Bisnis <span className="text-error">*</span>
                            </Label>
                            <Input
                              id="companyName"
                              placeholder="Contoh: PT Surya Pratama Logistik"
                              value={clientData.companyName}
                              onChange={(e) => setClientData({ ...clientData, companyName: e.target.value })}
                              className={formErrors.companyName ? "border-error focus:ring-error" : ""}
                            />
                            {formErrors.companyName && (
                              <p className="text-[11px] text-error font-medium">{formErrors.companyName}</p>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="npwp" className="text-xs font-semibold text-text-primary flex items-center justify-between">
                              <span>NPWP 16-Digit (Coretax)</span>
                              <span className="text-[10px] text-text-secondary">Opsional untuk pribadi</span>
                            </Label>
                            <Input
                              id="npwp"
                              placeholder="Contoh: 0123456789012345 (16 angka)"
                              maxLength={16}
                              value={clientData.npwp}
                              onChange={(e) => setClientData({ ...clientData, npwp: e.target.value.replace(/\D/g, "") })}
                              className={formErrors.npwp ? "border-error focus:ring-error" : ""}
                            />
                            {formErrors.npwp && (
                              <p className="text-[11px] text-error font-medium">{formErrors.npwp}</p>
                            )}
                          </div>
                        </div>

                        {/* Row 3: Email & WhatsApp */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                              <EnvelopeIcon className="text-[11px] text-text-secondary" />
                              <span>Alamat Email Resmi</span>
                              <span className="text-error">*</span>
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="nama@perusahaan.co.id"
                              value={clientData.email}
                              onChange={(e) => setClientData({ ...clientData, email: e.target.value })}
                              className={formErrors.email ? "border-error focus:ring-error" : ""}
                            />
                            {formErrors.email && (
                              <p className="text-[11px] text-error font-medium">{formErrors.email}</p>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="phone" className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                              <PhoneIcon className="text-[11px] text-text-secondary" />
                              <span>Nomor WhatsApp / Telepon Aktif</span>
                              <span className="text-error">*</span>
                            </Label>
                            <Input
                              id="phone"
                              placeholder="0812XXXXXXXX atau +62812..."
                              value={clientData.phone}
                              onChange={(e) => setClientData({ ...clientData, phone: e.target.value })}
                              className={formErrors.phone ? "border-error focus:ring-error" : ""}
                            />
                            {formErrors.phone && (
                              <p className="text-[11px] text-error font-medium">{formErrors.phone}</p>
                            )}
                          </div>
                        </div>

                        {/* Row 4: Sub-topic Selector */}
                        <div className="space-y-1.5">
                          <Label htmlFor="subTopic" className="text-xs font-semibold text-text-primary">
                            Fokus Sub-Topik Konsultasi
                          </Label>
                          <Select
                            id="subTopic"
                            value={clientData.subTopic || currentService.subTopics[0]}
                            onChange={(e) => setClientData({ ...clientData, subTopic: e.target.value })}
                            className="bg-white border-navy-light text-xs"
                          >
                            {currentService.subTopics.map((sub, i) => (
                              <option key={i} value={sub}>
                                {sub}
                              </option>
                            ))}
                          </Select>
                        </div>

                        {/* Row 5: Notes & Problem Description */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="notes" className="text-xs font-semibold text-text-primary">
                              Rincian Masalah / Dokumen yang Ingin Ditelaah <span className="text-error">*</span>
                            </Label>
                            <span className="text-[10px] text-text-secondary">
                              {clientData.notes.length} karakter (min. 15)
                            </span>
                          </div>
                          <Textarea
                            id="notes"
                            rows={4}
                            placeholder="Jelaskan secara ringkas kendala perpajakan, rekonsiliasi laporan, atau telaah kontrak yang ingin didiskusikan bersama konsultan..."
                            value={clientData.notes}
                            onChange={(e) => setClientData({ ...clientData, notes: e.target.value })}
                            className={formErrors.notes ? "border-error focus:ring-error" : ""}
                          />
                          {formErrors.notes && (
                            <p className="text-[11px] text-error font-medium">{formErrors.notes}</p>
                          )}
                        </div>

                        {/* Row 6: Optional File Upload Dropzone */}
                        <div className="pt-2">
                          <Label className="text-xs font-semibold text-text-primary block mb-1.5">
                            Unggah Berkas Pendukung Awal (Opsional)
                          </Label>

                          {uploadedFileName ? (
                            <div className="flex items-center justify-between p-3 rounded-lg border border-navy-light bg-surface text-xs">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <DocumentIcon className="text-primary text-sm shrink-0" />
                                <div className="truncate">
                                  <span className="font-bold text-primary block truncate">{uploadedFileName}</span>
                                  <span className="text-[11px] text-text-secondary">{uploadedFileSize} &bull; Terenkripsi</span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={removeUploadedFile}
                                className="text-text-secondary hover:text-error p-1 transition-colors"
                                title="Hapus Berkas"
                              >
                                <CloseIcon className="text-xs" />
                              </button>
                            </div>
                          ) : (
                            <div className="border-2 border-dashed border-navy-light hover:border-primary/40 rounded-xl p-4 text-center transition-all bg-surface/40">
                              <input
                                type="file"
                                id="fileUpload"
                                accept=".pdf,.doc,.docx,.xlsx,.xls"
                                onChange={handleFileUpload}
                                className="hidden"
                              />
                              <label htmlFor="fileUpload" className="cursor-pointer block">
                                <DocumentIcon className="text-xl text-silver mx-auto mb-1.5" />
                                <span className="text-xs font-semibold text-primary block">
                                  Klik untuk memilih berkas pendukung
                                </span>
                                <span className="text-[11px] text-text-secondary block mt-0.5">
                                  Format PDF, Word, atau Excel (Maks. 10MB) &bull; Dilindungi NDA
                                </span>
                              </label>
                            </div>
                          )}
                          {formErrors.file && (
                            <p className="text-[11px] text-error font-medium mt-1">{formErrors.file}</p>
                          )}
                        </div>

                        {/* Step 3 Actions */}
                        <div className="pt-4 flex items-center justify-between">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={goToPrevStep}
                            className="border-navy-light text-text-secondary hover:text-primary hover:bg-surface cursor-pointer"
                          >
                            Kembali
                          </Button>

                          <Button
                            type="button"
                            onClick={goToNextStep}
                            className="px-6"
                          >
                            <span>Lanjutkan</span>
                          </Button>
                        </div>
                      </CardContent>
                    </div>
                  )}

                  {/* STEP 4: KONFIRMASI PAKTA KERAHASIAAN & SUBMIT */}
                  {currentStep === 4 && (
                    <form onSubmit={handleSubmitBooking}>
                      <CardHeader className="border-b border-navy-light p-6">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-primary border-primary/30 text-xs">
                            Langkah 4 dari 4
                          </Badge>
                          <span className="text-xs text-success font-semibold flex items-center gap-1">
                            <CheckIcon className="text-xs" /> Data Terisi Lengkap
                          </span>
                        </div>
                        <CardTitle className="text-xl font-bold text-primary mt-1">
                          Konfirmasi Permohonan &amp; Pakta Kerahasiaan (NDA)
                        </CardTitle>
                        <CardDescription className="text-xs text-text-secondary">
                          Tinjau rincian sesi konsultasi Anda sebelum sistem menerbitkan nomor tiket reservasi resmi.
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="p-6 space-y-6">
                        {/* Summary Verification Card */}
                        <div className="border border-navy-light rounded-xl p-5 bg-surface/50 space-y-4">
                          <div className="text-xs font-bold text-primary uppercase tracking-wider pb-2 border-b border-navy-light">
                            Ringkasan Permohonan Sesi
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div>
                              <span className="text-text-secondary block">Divisi Layanan:</span>
                              <span className="font-bold text-primary">{currentService.title}</span>
                              <span className="text-[11px] text-text-secondary block mt-0.5">
                                Sub-Topik: {clientData.subTopic}
                              </span>
                            </div>

                            <div>
                              <span className="text-text-secondary block">Format &amp; Lokasi:</span>
                              <span className="font-bold text-primary">
                                {meetingFormat === "offline"
                                  ? "Tatap Muka di Menara Sudirman Kav. 21 Lt. 12"
                                  : "Daring (Google Meet Terenkripsi)"}
                              </span>
                            </div>

                            <div>
                              <span className="text-text-secondary block">Jadwal Sesi:</span>
                              <span className="font-bold text-primary">
                                {selectedDateObj.dayName}, {selectedDateObj.formatted}
                              </span>
                              <span className="text-[11px] text-text-secondary block mt-0.5">
                                Pukul {currentSlot.time} (90 Menit)
                              </span>
                            </div>

                            <div>
                              <span className="text-text-secondary block">PIC &amp; Perusahaan:</span>
                              <span className="font-bold text-primary">{clientData.picName}</span>
                              <span className="text-[11px] text-text-secondary block mt-0.5">
                                {clientData.companyName} {clientData.npwp ? `• NPWP: ${clientData.npwp}` : ""}
                              </span>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-navy-light text-xs">
                            <span className="text-text-secondary block mb-1">Rincian Kebutuhan:</span>
                            <p className="text-text-primary bg-white p-3 rounded-lg border border-navy-light leading-relaxed">
                              {clientData.notes}
                            </p>
                            {uploadedFileName && (
                              <div className="mt-2 flex items-center gap-2 text-[11px] text-primary font-medium">
                                <DocumentIcon className="text-xs" />
                                <span>Lampiran: {uploadedFileName} ({uploadedFileSize})</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Legal Agreement Box (NDA & UU PDP) */}
                        <div className="bg-white border border-navy-light rounded-xl p-4 space-y-3">
                          <div className="text-xs font-bold text-primary flex items-center gap-2">
                            <ShieldTaxIcon className="text-xs text-primary" />
                            <span>Pakta Integritas &amp; Kerahasiaan Data (Non-Disclosure Agreement)</span>
                          </div>

                          <p className="text-[11px] text-text-secondary leading-relaxed">
                            Dengan mengirimkan formulir ini, Zhou Consulting berkomitmen mematuhi ketentuan kerahasiaan data
                            fiskal dan komersial sesuai <strong>Undang-Undang No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP)</strong>{" "}
                            serta Kode Etik Konsultan Pajak &amp; Akuntan Indonesia. Seluruh informasi, data omzet, dan dokumen yang Anda serahkan
                            hanya akan digunakan secara terbatas untuk kepentingan telaah konsultasi awal dan tidak akan dibagikan kepada pihak ketiga.
                          </p>

                          <div className="pt-2">
                            <label className="flex items-start gap-2.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={agreeNDA}
                                onChange={(e) => {
                                  setAgreeNDA(e.target.checked);
                                  if (e.target.checked) {
                                    setFormErrors((prev) => {
                                      const next = { ...prev };
                                      delete next.agreeNDA;
                                      return next;
                                    });
                                  }
                                }}
                                className="mt-0.5 h-4 w-4 rounded border-silver text-primary focus:ring-primary shrink-0"
                              />
                              <span className="text-xs text-text-primary">
                                Saya menyatakan data di atas adalah benar dan menyetujui klausul kerahasiaan NDA serta pemrosesan data untuk penjadwalan sesi konsultasi. <span className="text-error">*</span>
                              </span>
                            </label>
                            {formErrors.agreeNDA && (
                              <p className="text-[11px] text-error font-medium mt-1.5 ml-6">
                                {formErrors.agreeNDA}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Step 4 Actions */}
                        <div className="pt-2 flex items-center justify-between">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={goToPrevStep}
                            disabled={isSubmitting}
                            className="border-navy-light text-text-secondary hover:text-primary hover:bg-surface cursor-pointer"
                          >
                            Kembali
                          </Button>

                          <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-2 px-6"
                          >
                            {isSubmitting ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Menerbitkan Tiket...</span>
                              </>
                            ) : (
                              <>
                                <span>Konfirmasi Reservasi</span>
                                <CheckIcon className="text-xs" />
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </form>
                  )}
                </Card>
              )}
            </div>

            {/* Right Sidebar Information (4 Cols) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Office Location & Schedule Card */}
              <Card className="border-navy-light bg-white shadow-sm">
                <CardHeader className="p-5 border-b border-navy-light">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <LocationIcon className="text-xs" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold text-primary">
                        Pusat Operasional Sudirman
                      </CardTitle>
                      <CardDescription className="text-[11px] text-text-secondary">
                        Lokasi Sesi Tatap Muka Resmi
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-5 text-xs text-text-secondary space-y-3">
                  <div>
                    <span className="font-bold text-text-primary block">Menara Sudirman Lantai 12</span>
                    <span>Jl. Jend. Sudirman Kav. 21, Karet Tengsin, Tanah Abang, Jakarta Pusat 10250</span>
                  </div>

                  <div className="pt-2 border-t border-navy-light space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span>Jam Operasional Sesi:</span>
                      <strong className="text-text-primary">08.30 – 17.30 WIB</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Hari Kerja:</span>
                      <strong className="text-text-primary">Senin – Jumat</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Akses Transportasi:</span>
                      <span className="text-primary font-semibold">MRT Bendungan Hilir</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="w-full text-xs border-navy-light hover:bg-surface text-primary"
                    >
                      <Link href="/kontak" className="inline-flex items-center justify-center">
                        <span>Lihat Lokasi</span>
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Checklist Dokumen yang Wajib Disiapkan */}
              <Card className="border-navy-light bg-white shadow-sm">
                <CardHeader className="p-5 border-b border-navy-light">
                  <div className="flex items-center gap-2">
                    <DocumentIcon className="text-xs text-primary" />
                    <CardTitle className="text-sm font-bold text-primary">
                      Checklist Dokumen Pra-Konsultasi
                    </CardTitle>
                  </div>
                  <CardDescription className="text-[11px] text-text-secondary">
                    Dokumen yang disarankan disiapkan agar sesi 90 menit berjalan maksimal:
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5 text-xs text-text-secondary space-y-2.5">
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="text-xs text-success mt-0.5 shrink-0" />
                    <span>Laporan Keuangan (Neraca &amp; Laba Rugi) atau SPT Tahunan Terakhir.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="text-xs text-success mt-0.5 shrink-0" />
                    <span>Surat Permintaan Penjelasan (SP2DK) dari KPP (jika terkait pemeriksaan).</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="text-xs text-success mt-0.5 shrink-0" />
                    <span>Draft Kontrak Komersial atau Akta Perusahaan (khusus perkara hukum bisnis).</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="text-xs text-success mt-0.5 shrink-0" />
                    <span>NPWP 16-Digit Badan dan identitas penanggung jawab entitas.</span>
                  </div>
                </CardContent>
              </Card>

              {/* Fast Track Hotline WhatsApp */}
              <div className="bg-[#060D22] text-white rounded-xl p-5 border border-[#172652] space-y-3">
                <div className="flex items-center gap-2">
                  <WhatsappIcon className="text-success text-base" />
                  <span className="text-xs font-bold text-white">Butuh Jadwal Konsultasi Mendesak?</span>
                </div>
                <p className="text-[11px] text-silver leading-relaxed">
                  Bila kasus Anda memerlukan tindakan mitigasi hari ini (seperti batas waktu respon SP2DK KPP),
                  hubungi Hotline Sekretariat Prioritas via WhatsApp.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="w-full text-xs border-success text-success hover:bg-success/10 font-semibold"
                >
                  <a
                    href="https://wa.me/6281299887766?text=Halo%20Sekretariat%20Zhou%20Consulting,%20saya%20memerlukan%20penjadwalan%20konsultasi%20mendesak%20hari%20ini."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5"
                  >
                    <WhatsappIcon className="text-xs" />
                    <span>Chat WhatsApp Sekretariat</span>
                  </a>
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom Section: FAQ Konsultasi */}
          <div className="mt-14 pt-10 border-t border-navy-light">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <Badge variant="outline" className="text-primary border-primary/30 text-xs mb-2">
                Pertanyaan Umum
              </Badge>
              <h2 className="text-xl sm:text-2xl font-bold text-primary">
                Pertanyaan Seputar Mekanisme Konsultasi
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary mt-1">
                Informasi penting mengenai prosedur, durasi sesi, dan jaminan keamanan berkas klien di Zhou Consulting.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
              {/* FAQ 1 */}
              <div className="bg-white p-5 rounded-xl border border-navy-light shadow-sm">
                <h4 className="text-xs sm:text-sm font-bold text-primary mb-1.5 flex items-center gap-2">
                  <QuestionCircleIcon className="text-xs text-primary" />
                  Apakah ada biaya komitmen untuk permohonan sesi awal?
                </h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Permohonan awal dan telaah ruang lingkup kebutuhan bisnis bersifat bebas biaya komitmen. Apabila kasus membutuhkan analisis mendalam, audit dokumen, atau pendampingan surat tanggapan KPP, tim kami akan menerbitkan Surat Penawaran Jasa Profesional (Proposal of Engagement) resmi sebelum pekerjaan dimulai.
                </p>
              </div>

              {/* FAQ 2 */}
              <div className="bg-white p-5 rounded-xl border border-navy-light shadow-sm">
                <h4 className="text-xs sm:text-sm font-bold text-primary mb-1.5 flex items-center gap-2">
                  <QuestionCircleIcon className="text-xs text-primary" />
                  Bagaimana jika kami berhalangan dan perlu reschedule jadwal?
                </h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Klien dapat mengajukan perubahan jadwal minimal 4 jam sebelum sesi dimulai dengan menghubungi nomor WhatsApp Sekretariat resmi dan menyertakan kode tiket permohonan (<code className="font-mono text-[11px] text-primary font-bold">ZHOU-CNS-XXXX</code>). Jadwal baru akan disesuaikan dengan slot waktu konsultan yang tersedia.
                </p>
              </div>

              {/* FAQ 3 */}
              <div className="bg-white p-5 rounded-xl border border-navy-light shadow-sm">
                <h4 className="text-xs sm:text-sm font-bold text-primary mb-1.5 flex items-center gap-2">
                  <QuestionCircleIcon className="text-xs text-primary" />
                  Apakah data keuangan dan identitas perusahaan kami terjamin aman?
                </h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Seluruh data, nomor NPWP, dan lampiran dokumen dilindungi oleh pakta kerahasiaan NDA serta kepatuhan pada UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP). Zhou Consulting memberlakukan protokol akses terbatas (role-based access) dan enkripsi 256-bit pada seluruh dokumen kerja.
                </p>
              </div>

              {/* FAQ 4 */}
              <div className="bg-white p-5 rounded-xl border border-navy-light shadow-sm">
                <h4 className="text-xs sm:text-sm font-bold text-primary mb-1.5 flex items-center gap-2">
                  <QuestionCircleIcon className="text-xs text-primary" />
                  Berapa lama durasi efektif untuk satu sesi konsultasi?
                </h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Satu sesi konsultasi teralokasi selama 90 menit. Waktu ini mencakup 20 menit pemaparan kendala oleh klien, 50 menit evaluasi regulasi dan solusi teknis oleh lead consultant, serta 20 menit perumusan rencana tindak lanjut (action items).
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
