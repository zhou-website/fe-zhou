"use client";

import { ContentStatus } from "./publicContentData";
import { adminCmsApi } from "@/lib/api";
import { isCmsItemDeleted, recordDeletedCmsItem } from "./cmsDeletedStorage";

export interface ServicePillar {
  title: string;
  description: string;
}

export interface ServiceFAQ {
  q: string;
  a: string;
}

export interface StoredServiceItem {
  id: string;
  code?: string;
  categoryKey: "hukum" | "bisnis" | "akuntansi" | "tax-service" | string;
  name: string;
  subtitle: string;
  badge?: string;
  route: string;
  leadConsultant?: string;
  pillars?: ServicePillar[];
  scopes?: string[];
  workflow?: string[];
  deliverables?: string[];
  deliverable?: string;
  faqs?: ServiceFAQ[];
  status: ContentStatus;
  lastUpdated: string;
  topicParam?: string;
  waTemplate?: string;
}

export const DEFAULT_SERVICES: StoredServiceItem[] = [
  {
    "id": "SVC-4798",
    "code": "SVC-4798",
    "categoryKey": "akuntansi",
    "name": "Penyusunan Laporan Keuangan & Pembukuan",
    "subtitle": "Penyusunan laporan posisi keuangan (neraca), laba rugi, perubahan ekuitas, dan arus kas standar resmi perbankan & audit.",
    "badge": "ACCOUNTING SERVICES",
    "route": "/layanan/akuntansi",
    "pillars": [
      {
        "title": "Layanan pengelolaan akuntansi berbasis data yang akurat guna menghasilkan laporan keuangan bulanan dan tahunan yang kredibel. Kami memastikan seluruh pencatatan bisnis Anda rapi, patuh regulasi, serta siap digunakan untuk kebutuhan internal maupun eksternal (seperti perbankan dan audit).",
        "description": "Layanan pengelolaan akuntansi berbasis data yang akurat guna menghasilkan laporan keuangan bulanan dan tahunan yang kredibel. Kami memastikan seluruh pencatatan bisnis Anda rapi, patuh regulasi, serta siap digunakan untuk kebutuhan internal maupun eksternal (seperti perbankan dan audit)."
      }
    ],
    "workflow": [],
    "deliverables": [
      "Bundel Laporan Keuangan Lengkap (Audit-ready / Bank-ready) beserta CALK resmi."
    ],
    "status": "Published",
    "lastUpdated": "19 Okt 2026",
    "scopes": [
      "Layanan pengelolaan akuntansi berbasis data yang akurat guna menghasilkan laporan keuangan bulanan dan tahunan yang kredibel. Kami memastikan seluruh pencatatan bisnis Anda rapi, patuh regulasi, serta siap digunakan untuk kebutuhan internal maupun eksternal (seperti perbankan dan audit)."
    ],
    "deliverable": "Bundel Laporan Keuangan Lengkap (Audit-ready / Bank-ready) beserta CALK resmi."
  },
  {
    "id": "FIN_CONS",
    "code": "FIN_CONS",
    "categoryKey": "bisnis",
    "name": "Konsultasi Bisnis & Strategi Finansial",
    "subtitle": "Konsultasi restrukturisasi bisnis, perencanaan keuangan strategis, dan manajemen arus kas perusahaan.",
    "badge": "BUSINESS & FINANCIAL",
    "route": "/layanan/bisnis",
    "leadConsultant": "Konsultan Keuangan & Advisory Bisnis Zhou Consulting",
    "scopes": [
      "Layanan penasihat keuangan dan bisnis strategis untuk membantu eksekutif perusahaan mengidentifikasi peluang pertumbuhan, melakukan efisiensi modal, serta mengelola risiko keuangan. Kami memastikan performa bisnis Anda berjalan optimal dan berkelanjutan."
    ],
    "deliverable": "Laporan Studi Kelayakan Bisnis Resmi, Model Finansial Excel Dinamis, & Rekomendasi Solvabilitas.",
    "pillars": [
      {
        "title": "Layanan penasihat keuangan dan bisnis strategis untuk membantu eksekutif perusahaan mengidentifikasi peluang pertumbuhan, melakukan efisiensi modal, serta mengelola risiko keuangan. Kami memastikan performa bisnis Anda berjalan optimal dan berkelanjutan.",
        "description": "Layanan penasihat keuangan dan bisnis strategis untuk membantu eksekutif perusahaan mengidentifikasi peluang pertumbuhan, melakukan efisiensi modal, serta mengelola risiko keuangan. Kami memastikan performa bisnis Anda berjalan optimal dan berkelanjutan."
      }
    ],
    "workflow": [
      "Diagnostik Finansial & Operasional",
      "Pemodelan Strategis & Skenario",
      "Rekomendasi Kebijakan Bisnis",
      "Pendampingan Implementasi"
    ],
    "deliverables": [
      "Laporan Studi Kelayakan Bisnis Resmi, Model Finansial Excel Dinamis, & Rekomendasi Solvabilitas."
    ],
    "topicParam": "studi-kelayakan",
    "waTemplate": "Halo Zhou Consulting, saya ingin konsultasi mengenai Studi Kelayakan Bisnis (Feasibility Study) dan rencana investasi.",
    "status": "Published",
    "lastUpdated": "19 Okt 2026",
    "faqs": [
      {
        "q": "Bagaimana tahapan awal konsultasi bisnis?",
        "a": "Kami memulai dengan sesi diagnosa komprehensif untuk memetakan tantangan fiskal dan finansial perusahaan Anda."
      }
    ]
  },
  {
    "id": "SRV-TAX-EFK",
    "code": "TAX-EFK",
    "categoryKey": "tax-service",
    "name": "e-Faktur Pajak",
    "subtitle": "Penerbitan, validasi, dan rekonsiliasi faktur pajak keluaran & masukan terintegrasi sistem DJP.",
    "badge": "PPN & FAKTUR ELEKTRONIK",
    "route": "/layanan/tax-service",
    "scopes": [
      "Pembuatan & upload faktur pajak keluaran e-Faktur resmi DJP",
      "Validasi Nomor Seri Faktur Pajak (NSFP) & rekonsiliasi faktur masukan",
      "Penanganan faktur retur, pembatalan faktur, dan troubleshooting error DJP",
      "Ekualisasi omzet SPT Masa PPN 1111 dengan Buku Penjualan perbankan"
    ],
    "deliverable": "Draft SPT Masa PPN 1111, Kertas Kerja Ekualisasi, & Bukti Penerimaan Elektronik (BPE).",
    "pillars": [
      {
        "title": "Pengelolaan e-Faktur PPN",
        "description": "Penerbitan dan validasi faktur pajak keluaran & masukan terintegrasi sistem DJP."
      }
    ],
    "workflow": [
      "Pengumpulan Data Transaksi",
      "Upload & Validasi DJP",
      "Rekonsiliasi Faktur Masukan/Keluaran",
      "Pelaporan SPT PPN"
    ],
    "deliverables": [
      "Draft SPT Masa PPN 1111, Kertas Kerja Ekualisasi, & Bukti Penerimaan Elektronik (BPE)."
    ],
    "topicParam": "e-faktur",
    "waTemplate": "Halo Zhou Consulting, saya ingin konsultasi mengenai pengelolaan dan kepatuhan e-Faktur Pajak (PPN).",
    "status": "Published",
    "lastUpdated": "Oktober 2026"
  },
  {
    "id": "SRV-TAX-B21",
    "code": "TAX-B21",
    "categoryKey": "tax-service",
    "name": "e-Bupot 21/26",
    "subtitle": "Perhitungan PPh 21 skema TER PP 58/2023, bukti potong bulanan & tahunan, dan pelaporan SPT Masa.",
    "badge": "PPH PASAL 21/26",
    "route": "/layanan/tax-service",
    "scopes": [
      "Perhitungan PPh 21 berbasis Tarif Efektif Rata-Rata (TER) Kategori A, B, dan C",
      "Penerbitan Bukti Pemotongan 1721-VIII bulanan dan formulir 1721-A1 tahunan",
      "Penanganan pemotongan PPh 21 bukan pegawai, tenaga ahli, dan komisaris",
      "Rekonsiliasi ekualisasi beban gaji akun laba rugi vs DPP PPh Pasal 21"
    ],
    "deliverable": "File Bukti Potong resmi DJP, formulir 1721-A1, & BPE SPT Masa PPh 21/26.",
    "pillars": [
      {
        "title": "Kepatuhan PPh 21 TER",
        "description": "Perhitungan TER PP 58/2023 dan pelaporan bukti potong 1721 resmi."
      }
    ],
    "workflow": [
      "Perhitungan Payroll Pajak",
      "Generate Bukti Potong",
      "Verifikasi PIC",
      "Pelaporan BPE"
    ],
    "deliverables": [
      "File Bukti Potong resmi DJP, formulir 1721-A1, & BPE SPT Masa PPh 21/26."
    ],
    "topicParam": "e-bupot-21",
    "waTemplate": "Halo Zhou Consulting, saya ingin konsultasi mengenai perhitungan TER dan pelaporan e-Bupot 21/26.",
    "status": "Published",
    "lastUpdated": "Oktober 2026"
  },
  {
    "id": "SRV-TAX-BUN",
    "code": "TAX-BUN",
    "categoryKey": "tax-service",
    "name": "e-Bupot Unifikasi",
    "subtitle": "Penerbitan bukti potong PPh Pasal 22, 23, 15, dan 4 ayat (2) serta pelaporan SPT Masa Unifikasi.",
    "badge": "WITHHOLDING TAX TERPUSAT",
    "route": "/layanan/tax-service",
    "scopes": [
      "Pemotongan PPh 23 atas jasa manajemen, teknik, konsultan, dan sewa harta",
      "Pemotongan PPh Final Pasal 4(2) persewaan tanah/bangunan & jasa konstruksi",
      "Verifikasi keabsahan NPWP/NIK lawan transaksi dan dasar pengenaan pajak (DPP)",
      "Penyampaian SPT Masa Unifikasi satu pintu terstandar PER-24/PJ/2021"
    ],
    "deliverable": "Buku Register Bukti Potong Unifikasi & BPE SPT Masa Unifikasi resmi DJP.",
    "pillars": [
      {
        "title": "Pemotongan Pajak Unifikasi",
        "description": "Penerbitan bukti potong PPh 22, 23, 15, dan Final 4(2) terpusat."
      }
    ],
    "workflow": [
      "Identifikasi Transaksi Vendor",
      "Penentuan Tarif Pemotongan",
      "Penerbitan Bupot",
      "Pelaporan SPT Unifikasi"
    ],
    "deliverables": [
      "Buku Register Bukti Potong Unifikasi & BPE SPT Masa Unifikasi resmi DJP."
    ],
    "topicParam": "e-bupot-unifikasi",
    "waTemplate": "Halo Zhou Consulting, saya ingin konsultasi mengenai pengelolaan bukti potong e-Bupot Unifikasi.",
    "status": "Published",
    "lastUpdated": "Oktober 2026"
  },
  {
    "id": "SRV-TAX-EBL",
    "code": "SRV-TAX-EBL",
    "categoryKey": "tax-service",
    "name": "e-Billing",
    "subtitle": "Penerbitan kode billing setoran pajak tepat waktu dan validasi konfirmasi status wajib pajak.",
    "badge": "TAX SERVICES",
    "route": "/layanan/tax-service",
    "scopes": [
      "Pembuatan kode ID Billing MPN G3 akurat sebelum tanggal jatuh tempo",
      "Verifikasi Kode Akun Pajak (KAP) & Kode Jenis Setoran (KJS) sesuai objek",
      "Validasi Status Wajib Pajak (VSWP / KSWP) untuk kepatuhan perizinan berusaha",
      "Pengecekan Nomor Transaksi Penerimaan Negara (NTPN) bank persepsi"
    ],
    "deliverable": "Berkas ID Billing aktif, konfirmasi NTPN perbankan, & arsip validasi VSWP.",
    "pillars": [
      {
        "title": "Pembuatan kode ID Billing MPN G3 akurat sebelum tanggal jatuh tempo",
        "description": "Pembuatan kode ID Billing MPN G3 akurat sebelum tanggal jatuh tempo"
      },
      {
        "title": "Verifikasi Kode Akun Pajak (KAP) & Kode Jenis Setoran (KJS) sesuai objek",
        "description": "Verifikasi Kode Akun Pajak (KAP) & Kode Jenis Setoran (KJS) sesuai objek"
      },
      {
        "title": "Validasi Status Wajib Pajak (VSWP / KSWP) untuk kepatuhan perizinan berusaha",
        "description": "Validasi Status Wajib Pajak (VSWP / KSWP) untuk kepatuhan perizinan berusaha"
      },
      {
        "title": "Pengecekan Nomor Transaksi Penerimaan Negara (NTPN) bank persepsi",
        "description": "Pengecekan Nomor Transaksi Penerimaan Negara (NTPN) bank persepsi"
      }
    ],
    "workflow": [
      "Validasi KAP & KJS",
      "Generate Kode Billing",
      "Penyetoran Kas Negara",
      "Konfirmasi NTPN"
    ],
    "deliverables": [
      "Berkas ID Billing aktif, konfirmasi NTPN perbankan, & arsip validasi VSWP."
    ],
    "topicParam": "e-billing",
    "waTemplate": "Halo Zhou Consulting, saya ingin konsultasi perihal pembuatan e-Billing dan validasi status pajak (VSWP).",
    "status": "Published",
    "lastUpdated": "19 Okt 2026"
  },
  {
    "id": "SRV-TAX-SPT",
    "code": "SRV-TAX-SPT",
    "categoryKey": "tax-service",
    "name": "Pelaporan SPT",
    "subtitle": "Penelaahan ekualisasi fiskal, verifikasi lampiran, dan penyampaian SPT resmi hingga terbit BPE.",
    "badge": "TAX SERVICES",
    "route": "/layanan/tax-service",
    "scopes": [
      "Ekualisasi peredaran usaha vs DPP PPN dan peredaran bruto SPT Tahunan Badan",
      "Verifikasi lampiran khusus (daftar penyusutan, bukti potong, kredit pajak PPh 22/23/25)",
      "Pengisian SPT Masa PPh/PPN dan SPT Tahunan Badan 1771 secara akurat",
      "Penerbitan dan pengarsipan Bukti Penerimaan Elektronik (BPE) resmi DJP"
    ],
    "deliverable": "Bukti Penerimaan Elektronik (BPE) resmi Kementerian Keuangan & Kertas Kerja Ekualisasi.",
    "pillars": [
      {
        "title": "Ekualisasi peredaran usaha vs DPP PPN dan peredaran bruto SPT Tahunan Badan",
        "description": "Ekualisasi peredaran usaha vs DPP PPN dan peredaran bruto SPT Tahunan Badan"
      },
      {
        "title": "Verifikasi lampiran khusus (daftar penyusutan, bukti potong, kredit pajak PPh 22/23/25)",
        "description": "Verifikasi lampiran khusus (daftar penyusutan, bukti potong, kredit pajak PPh 22/23/25)"
      },
      {
        "title": "Pengisian SPT Masa PPh/PPN dan SPT Tahunan Badan 1771 secara akurat",
        "description": "Pengisian SPT Masa PPh/PPN dan SPT Tahunan Badan 1771 secara akurat"
      },
      {
        "title": "Penerbitan dan pengarsipan Bukti Penerimaan Elektronik (BPE) resmi DJP",
        "description": "Penerbitan dan pengarsipan Bukti Penerimaan Elektronik (BPE) resmi DJP"
      }
    ],
    "workflow": [
      "Rekonsiliasi Fiskal",
      "Verifikasi Kredit Pajak",
      "Finalisasi Form 1771",
      "Submit BPE"
    ],
    "deliverables": [
      "Bukti Penerimaan Elektronik (BPE) resmi Kementerian Keuangan & Kertas Kerja Ekualisasi."
    ],
    "topicParam": "pelaporan-spt",
    "waTemplate": "Halo Zhou Consulting, saya ingin konsultasi perihal penyusunan dan pelaporan SPT resmi DJP.",
    "status": "Published",
    "lastUpdated": "19 Okt 2026"
  },
  {
    "id": "SRV-TAX-CTX",
    "code": "SRV-TAX-CTX",
    "categoryKey": "tax-service",
    "name": "Layanan Mitigasi Pajak",
    "subtitle": "Penyelesaian SP2DK yang Tepat dan Akurat.",
    "badge": "TAX SERVICES",
    "route": "/layanan/tax-service",
    "scopes": [
      "Kami mendampingi Anda dalam menghadapi Fase Pengawasan Awal dari Kantor Pelayanan Pajak (KPP). Tim kami membantu menyusun tanggapan resmi, melakukan rekonsiliasi data, serta mendampingi proses konseling atas Surat Permintaan Penjelasan atas Data dan/atau Keterangan (SP2DK) guna menyelesaikan ketidaksesuaian data secara persuasif sebelum masuk ke ranah pemeriksaan."
    ],
    "deliverable": "Laporan Kesiapan Coretax, Berita Acara Pendampingan, & Draf Resmi Tanggapan SP2DK.",
    "pillars": [
      {
        "title": "Kami mendampingi Anda dalam menghadapi Fase Pengawasan Awal dari Kantor Pelayanan Pajak (KPP). Tim kami membantu menyusun tanggapan resmi, melakukan rekonsiliasi data, serta mendampingi proses konseling atas Surat Permintaan Penjelasan atas Data dan/atau Keterangan (SP2DK) guna menyelesaikan ketidaksesuaian data secara persuasif sebelum masuk ke ranah pemeriksaan.",
        "description": "Kami mendampingi Anda dalam menghadapi Fase Pengawasan Awal dari Kantor Pelayanan Pajak (KPP). Tim kami membantu menyusun tanggapan resmi, melakukan rekonsiliasi data, serta mendampingi proses konseling atas Surat Permintaan Penjelasan atas Data dan/atau Keterangan (SP2DK) guna menyelesaikan ketidaksesuaian data secara persuasif sebelum masuk ke ranah pemeriksaan."
      }
    ],
    "workflow": [
      "Audit Akun Pajak",
      "Simulasi Coretax DJP",
      "Analisis Surat SP2DK",
      "Penyusunan Berkas Tanggapan"
    ],
    "deliverables": [
      "Laporan Kesiapan Coretax, Berita Acara Pendampingan, & Draf Resmi Tanggapan SP2DK."
    ],
    "topicParam": "coretax",
    "waTemplate": "Halo Zhou Consulting, saya ingin konsultasi mengenai Kesiapan Coretax 2026 dan respon surat SP2DK.",
    "status": "Published",
    "lastUpdated": "19 Okt 2026"
  },
  {
    "id": "SRV-LAW-CTR",
    "code": "LAW-CTR",
    "categoryKey": "hukum",
    "name": "Drafting & Review Kontrak Komersial",
    "subtitle": "Penyusunan dan penelaahan perjanjian kerjasama, NDA, MoU, perjanjian pemegang saham, dan kontrak vendor.",
    "badge": "KONTRAK & PERJANJIAN BISNIS",
    "route": "/layanan/hukum",
    "scopes": [
      "Penyusunan klausul mitigasi risiko sengketa perdata & force majeure",
      "Klausul ganti rugi (indemnification), batasan tanggung jawab, & dispute settlement",
      "Review kepatuhan terhadap Kitab Undang-Undang Hukum Perdata (KUHPerdata)",
      "Penyelarasan hak kekayaan intelektual (HAKI) dan kerahasiaan data komersial"
    ],
    "deliverable": "Final Draft Kontrak Bahasa Indonesia / Bilingual & Legal Opinion Ringkas.",
    "pillars": [
      {
        "title": "Drafting Kontrak Komersial",
        "description": "Penyusunan perjanjian kerjasama, NDA, MoU, dan kontrak bisnis dengan mitigasi risiko hukum."
      }
    ],
    "workflow": [
      "Telaah Latar Belakang Bisnis",
      "Penyusunan Draf Kontrak",
      "Review Klausul Kritis",
      "Finalisasi & Legal Opinion"
    ],
    "deliverables": [
      "Final Draft Kontrak Bahasa Indonesia / Bilingual & Legal Opinion Ringkas."
    ],
    "topicParam": "kontrak-komersial",
    "waTemplate": "Halo Zhou Consulting, saya ingin konsultasi mengenai pembuatan dan penelaahan Kontrak Bisnis / Komersial.",
    "status": "Published",
    "lastUpdated": "Oktober 2026"
  },
  {
    "id": "SRV-LAW-OSS",
    "code": "LAW-OSS",
    "categoryKey": "hukum",
    "name": "Perizinan Usaha Berbasis Risiko OSS-RBA",
    "subtitle": "Pendampingan penerbitan NIB, Sertifikat Standar, dan izin operasional komersial melalui sistem OSS terintegrasi.",
    "badge": "PERIZINAN BERUSAHA & KBLI",
    "route": "/layanan/hukum",
    "scopes": [
      "Pemetaan Klasifikasi Baku Lapangan Usaha Indonesia (KBLI) 2020 yang tepat",
      "Penerbitan Nomor Induk Berusaha (NIB) dan pemenuhan persyaratan komitmen",
      "Pengurusan Kesesuaian Kegiatan Pemanfaatan Ruang (KKPR) dan Persetujuan Lingkungan",
      "Migrasi data profil perizinan dan updating penanggung jawab usaha"
    ],
    "deliverable": "NIB Terverifikasi, Sertifikat Standar / Izin Operasional Resmi OSS.",
    "pillars": [
      {
        "title": "Perizinan OSS-RBA",
        "description": "Penerbitan NIB, Sertifikat Standar, dan pemenuhan komitmen izin berusaha terintegrasi."
      }
    ],
    "workflow": [
      "Pemetaan KBLI 2020",
      "Input Data OSS",
      "Pemenuhan Persyaratan KKPR",
      "Penerbitan NIB & Sertifikat Standar"
    ],
    "deliverables": [
      "NIB Terverifikasi, Sertifikat Standar / Izin Operasional Resmi OSS."
    ],
    "topicParam": "perizinan-oss",
    "waTemplate": "Halo Zhou Consulting, saya ingin konsultasi mengenai perizinan usaha OSS-RBA dan penyesuaian KBLI perusahaan.",
    "status": "Published",
    "lastUpdated": "Oktober 2026"
  },
  {
    "id": "SRV-LAW-CORP",
    "code": "LAW-CORP",
    "categoryKey": "hukum",
    "name": "Restrukturisasi Legalitas & Anggaran Dasar PT",
    "subtitle": "Penyesuaian anggaran dasar, peralihan saham, perubahan susunan direksi/komisaris, dan penerbitan akta notaris Kemenkumham.",
    "badge": "HUKUM PERSEROAN TERBATAS",
    "route": "/layanan/hukum",
    "scopes": [
      "Penyelenggaraan Rapat Umum Pemegang Saham (RUPS) fisik maupun sirkuler",
      "Penyusunan risalah RUPS untuk peningkatan modal disetor dan jual beli saham",
      "Pendampingan penerbitan Surat Keputusan (SK) Pengesahan AHU Kemenkumham",
      "Due diligence legalitas perizinan perseroan dan kelengkapan dokumen pendirian"
    ],
    "deliverable": "Risalah RUPS Resmi, Akta Notaris Perubahan, & SK AHU Kemenkumham.",
    "pillars": [
      {
        "title": "Hukum Perseroan Terbatas",
        "description": "Penyesuaian anggaran dasar PT, RUPS, perubahan susunan pengurus, dan legalitas notaris."
      }
    ],
    "workflow": [
      "Konsultasi Struktur Saham",
      "Penyusunan Risalah RUPS",
      "Koordinasi Notaris Rekanan",
      "Penerbitan SK AHU Kemenkumham"
    ],
    "deliverables": [
      "Risalah RUPS Resmi, Akta Notaris Perubahan, & SK AHU Kemenkumham."
    ],
    "topicParam": "restrukturisasi-pt",
    "waTemplate": "Halo Zhou Consulting, saya ingin konsultasi mengenai perubahan anggaran dasar PT, RUPS, dan legalitas perseroan.",
    "status": "Published",
    "lastUpdated": "Oktober 2026"
  },
  {
    "id": "SRV-LEGAL-TAX",
    "code": "LEGAL_TAX",
    "categoryKey": "hukum",
    "name": "Legal & Tax Dispute Advisory",
    "subtitle": "Pendampingan pemeriksaan pajak, klarifikasi SP2DK, pengajuan keberatan, dan mitigasi risiko regulasi.",
    "badge": "ADVOKASI & SENGKETA HUKUM",
    "route": "/layanan/hukum",
    "scopes": [
      "Pendampingan Pemeriksaan Pajak (Audit Assistance)",
      "Penyusunan Tanggapan Resmi Surat Klarifikasi SP2DK",
      "Pengajuan Permohonan Keberatan Pajak",
      "Advokasi & Banding di Pengadilan Pajak"
    ],
    "deliverable": "Risalah Tanggapan Hukum & SPHP, Surat Keberatan / Memori Banding, & Legal Opinion Resmi.",
    "pillars": [
      {
        "title": "Pendampingan Pemeriksaan Pajak (Audit Assistance)",
        "description": "Pendampingan Pemeriksaan Pajak (Audit Assistance)"
      },
      {
        "title": "Penyusunan Tanggapan Resmi Surat Klarifikasi SP2DK",
        "description": "Penyusunan Tanggapan Resmi Surat Klarifikasi SP2DK"
      },
      {
        "title": "Pengajuan Permohonan Keberatan Pajak",
        "description": "Pengajuan Permohonan Keberatan Pajak"
      },
      {
        "title": "Advokasi & Banding di Pengadilan Pajak",
        "description": "Advokasi & Banding di Pengadilan Pajak"
      }
    ],
    "workflow": [
      "Analisis Surat Klarifikasi / Pemeriksaan",
      "Penyusunan Bukti & Argumen Hukum",
      "Asistensi Pembahasan Akhir (Closing)",
      "Evaluasi Tindak Lanjut"
    ],
    "deliverables": [
      "Risalah Tanggapan Hukum & SPHP, Surat Keberatan / Memori Banding, & Legal Opinion Resmi."
    ],
    "topicParam": "sengketa-hukum-pajak",
    "waTemplate": "Halo Zhou Consulting, saya ingin konsultasi mengenai Legal & Tax Dispute Advisory dan pendampingan sengketa hukum.",
    "status": "Published",
    "lastUpdated": "19 Okt 2026"
  }
];

export const SERVICES_STORAGE_KEY = "zhou_services_data_v3";
export const SERVICES_EVENT = "zhou_services_updated";

/**
 * Helper untuk mengambil daftar cakupan layanan (scopes)
 */
export function getServiceScopes(item: Partial<StoredServiceItem>): string[] {
  if (Array.isArray(item.scopes) && item.scopes.length > 0) return item.scopes;
  if (Array.isArray(item.pillars) && item.pillars.length > 0) {
    return item.pillars.map((p) => p.title || p.description);
  }
  return [];
}

/**
 * Helper untuk mengambil teks luaran (deliverable)
 */
export function getServiceDeliverable(item: Partial<StoredServiceItem>): string {
  if (item.deliverable && item.deliverable.trim()) return item.deliverable;
  if (Array.isArray(item.deliverables) && item.deliverables.length > 0) return item.deliverables[0];
  return "Dokumen Laporan & Rekomendasi Resmi";
}

/**
 * Mendapatkan daftar layanan dari localStorage (atau default jika belum ada)
 */
export function getStoredServices(): StoredServiceItem[] {
  if (typeof window === "undefined") {
    return DEFAULT_SERVICES;
  }

  try {
    const MIGRATION_KEY = "zhou_services_v4_migrated";
    const raw = localStorage.getItem(SERVICES_STORAGE_KEY) || localStorage.getItem("zhou_services_data_v1");
    let currentServices: StoredServiceItem[] = raw ? JSON.parse(raw) : [];

    // Hanya inisialisasi default jika belum pernah dimigrasikan atau storage benar-benar kosong
    const isMigrated = localStorage.getItem(MIGRATION_KEY);
    if (!isMigrated || !Array.isArray(currentServices) || currentServices.length === 0) {
      const mergedMap = new Map<string, StoredServiceItem>();

      // Isi dengan DEFAULT_SERVICES terbaru (kecualikan yang sudah pernah dihapus superadmin)
      DEFAULT_SERVICES.forEach((def) => {
        if (!isCmsItemDeleted(def.id, def.name, undefined, def.code)) {
          mergedMap.set(def.id, def);
          if (def.code) mergedMap.set(def.code, def);
        }
      });

      if (Array.isArray(currentServices)) {
        currentServices.forEach((old) => {
          // Abaikan LAW-PDP (Kepatuhan UU Perlindungan) yang telah dihapus & yang tercatat di tombstone
          if (
            old.id === "kepatuhan-pdp" ||
            old.code === "LAW-PDP" ||
            (old.name || "").toLowerCase().includes("perlindungan data pribadi") ||
            isCmsItemDeleted(old.id, old.name, undefined, old.code)
          ) {
            return;
          }

          if (mergedMap.has(old.id)) {
            const def = mergedMap.get(old.id)!;
            mergedMap.set(old.id, { ...def, ...old });
          } else if (old.code && mergedMap.has(old.code)) {
            const def = mergedMap.get(old.code)!;
            mergedMap.set(old.code, { ...def, ...old });
          } else {
            mergedMap.set(old.id, old);
          }
        });
      }

      const uniqueList: StoredServiceItem[] = [];
      const seenIds = new Set<string>();

      DEFAULT_SERVICES.forEach((def) => {
        if (isCmsItemDeleted(def.id, def.name, undefined, def.code)) return;
        const item = mergedMap.get(def.id) || (def.code ? mergedMap.get(def.code) : undefined) || def;
        if (!seenIds.has(item.id)) {
          seenIds.add(item.id);
          uniqueList.push(item);
        }
      });

      mergedMap.forEach((item) => {
        if (isCmsItemDeleted(item.id, item.name, undefined, item.code)) return;
        if (!seenIds.has(item.id)) {
          seenIds.add(item.id);
          uniqueList.push(item);
        }
      });

      localStorage.setItem(MIGRATION_KEY, "true");
      localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(uniqueList));
      return uniqueList;
    }

    return currentServices.filter(
      (s) =>
        s.id !== "kepatuhan-pdp" &&
        s.code !== "LAW-PDP" &&
        !(s.name || "").toLowerCase().includes("perlindungan data pribadi") &&
        !isCmsItemDeleted(s.id, s.name, undefined, s.code)
    );
  } catch (error) {
    console.error("Gagal membaca zhou_services_data dari localStorage:", error);
    return DEFAULT_SERVICES.filter((s) => !isCmsItemDeleted(s.id, s.name, undefined, s.code));
  }
}

/**
 * Menyimpan daftar layanan ke localStorage dan memicu custom event untuk sinkronisasi antar-komponen
 */
export function saveStoredServices(services: StoredServiceItem[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(services));
    window.dispatchEvent(new CustomEvent(SERVICES_EVENT, { detail: services }));
  } catch (error) {
    console.error("Gagal menyimpan zhou_services_data ke localStorage:", error);
  }
}

/**
 * Mengambil layanan berdasarkan categoryKey (misal: "akuntansi", "bisnis", "tax-service", "hukum")
 */
export function getStoredServiceByCategory(categoryKey: string): StoredServiceItem | undefined {
  const services = getStoredServices();
  return services.find(
    (s) => s.categoryKey.toLowerCase() === categoryKey.toLowerCase() && s.status === "Published"
  );
}

/**
 * Menambahkan layanan baru (CREATE)
 */
export function addStoredService(
  serviceData: Omit<StoredServiceItem, "id" | "lastUpdated"> & { id?: string }
): StoredServiceItem {
  const current = getStoredServices();
  const id =
    serviceData.id ||
    `SRV-${Date.now().toString(36).toUpperCase()}`;

  const today = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const newService: StoredServiceItem = {
    ...serviceData,
    id,
    lastUpdated: today,
    status: serviceData.status || "Published",
  };

  const updated = [newService, ...current];
  saveStoredServices(updated);

  // Sambungkan penambahan ke Backend API
  adminCmsApi
    .createService({
      service_code: newService.id,
      service_name: newService.name,
      category: newService.categoryKey,
      description: newService.subtitle,
      is_active: newService.status === "Published",
    })
    .catch((err) => {
      console.warn("adminCmsApi.createService fallback:", err);
    });

  return newService;
}

/**
 * Memperbarui layanan yang ada (UPDATE).
 * Jika tidak ditemukan, upsert (tambah baru) agar edit layanan dari backend juga tersimpan lokal.
 */
export function updateStoredService(
  id: string,
  updates: Partial<StoredServiceItem>
): StoredServiceItem | null {
  const current = getStoredServices();
  const normId = id.trim().toLowerCase();
  const index = current.findIndex((s) => {
    if (s.id.toLowerCase() === normId) return true;
    if (s.code && s.code.toLowerCase() === normId) return true;
    if (updates.code && s.code && s.code.toLowerCase() === updates.code.toLowerCase()) return true;
    if (updates.id && s.id.toLowerCase() === updates.id.toLowerCase()) return true;
    if (updates.name && s.name && s.name.trim().toLowerCase() === updates.name.trim().toLowerCase()) return true;
    if (normId && s.name && s.name.trim().toLowerCase() === normId) return true;
    const sIdClean = s.id.toLowerCase().replace(/^(srv-|svc-)/, "").replace(/[-_]/g, "");
    const targetClean = normId.replace(/^(srv-|svc-)/, "").replace(/[-_]/g, "");
    if (sIdClean && targetClean && sIdClean === targetClean) return true;
    return false;
  });

  const today = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  if (index !== -1) {
    const updatedItem: StoredServiceItem = {
      ...current[index],
      ...updates,
      lastUpdated: today,
    };
    const updatedList = [...current];
    updatedList[index] = updatedItem;
    saveStoredServices(updatedList);

    const numericBackendId = parseInt(String(id).replace(/\D/g, ""), 10);
    if (!isNaN(numericBackendId) && numericBackendId > 0 && numericBackendId < 1000) {
      adminCmsApi
        .updateService(numericBackendId, {
          service_name: updatedItem.name,
          category: updatedItem.categoryKey,
          description: updatedItem.subtitle,
          is_active: updatedItem.status === "Published",
        })
        .catch((err) => {
          console.warn("adminCmsApi.updateService fallback:", err);
        });
    }

    return updatedItem;
  } else {
    // Upsert: backend item not in localStorage, create it
    const upserted: StoredServiceItem = {
      id,
      code: (updates as StoredServiceItem).code,
      categoryKey: (updates as StoredServiceItem).categoryKey || "tax-service",
      name: (updates as StoredServiceItem).name || id,
      subtitle: (updates as StoredServiceItem).subtitle || "",
      badge: (updates as StoredServiceItem).badge || "LAYANAN",
      route: (updates as StoredServiceItem).route || "/layanan",
      pillars: (updates as StoredServiceItem).pillars || [],
      workflow: (updates as StoredServiceItem).workflow || [],
      deliverables: (updates as StoredServiceItem).deliverables || [],
      status: (updates as StoredServiceItem).status || "Published",
      lastUpdated: today,
      ...updates,
    };
    saveStoredServices([upserted, ...current]);
    return upserted;
  }
}

/**
 * Menghapus layanan (DELETE)
 */
export function deleteStoredService(idOrTitle: string): boolean {
  recordDeletedCmsItem({ id: idOrTitle, title: idOrTitle });
  const current = getStoredServices();
  const target = idOrTitle.trim().toLowerCase();
  const targetSlug = target.replace(/[^a-z0-9]+/g, "-");
  const filtered = current.filter((s) => {
    if (isCmsItemDeleted(s.id, s.name, undefined, s.code)) return false;
    const sName = s.name.trim().toLowerCase();
    const sId = s.id.trim().toLowerCase();
    const sCode = (s.code || "").trim().toLowerCase();
    return (
      s.id !== idOrTitle &&
      sId !== target &&
      sId !== targetSlug &&
      sName !== target &&
      sCode !== target
    );
  });

  saveStoredServices(filtered);

  // Sambungkan penghapusan ke Backend API jika memiliki ID numerik backend yang valid
  const numId = parseInt(idOrTitle.replace(/\D/g, ""), 10);
  if (!isNaN(numId) && numId > 0) {
    adminCmsApi.deleteService(numId).catch((err) => {
      console.warn("adminCmsApi.deleteService fallback:", err);
    });
  }

  return true;
}

/**
 * Reset data layanan ke default (kosong)
 */
export function resetServicesToDefault(): void {
  saveStoredServices(DEFAULT_SERVICES);
}
