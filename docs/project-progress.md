# Zhou Consulting Front-End — Project Progress

## Project Overview

| Information | Details |
|---|---|
| Project | Zhou Consulting – Finance, Accounting, and Tax Partner |
| Repository | `zhou-website/fe-zhou` |
| Framework | Next.js 14.2.35 |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI | shadcn/ui |
| Typography | Open Sans |
| Icons | Font Awesome |
| Current Phase | Figma Page 2 (23 Screens Slicing & Implementation) |
| Overall Progress | 100% `[███████████████]` |
| Last Updated | 18 September 2026 |

---

## Progress Summary

**Overall Progress:** `[████████████████████]` **100%** (23/23 Tasks Completed)

| Metric | Result |
|---|---:|
| Overall Progress | 100% |
| Total Tasks | 23 |
| Completed | 23 |
| In Progress | 0 |
| Not Started | 0 |
| Blocked | 0 |
| Needs Verification | 0 |

---

## Module Progress

| Module | Completed | Total | Progress | Progress Bar | Status |
|---|---:|---:|---:|:---:|---|
| Authentication Flow | 3 | 3 | 100% | `[██████████]` | COMPLETED |
| Public Pages & Layanan | 10 | 10 | 100% | `[██████████]` | COMPLETED |
| Client Advisory Dashboard | 5 | 5 | 100% | `[██████████]` | COMPLETED |
| Admin & Superadmin Operations | 5 | 5 | 100% | `[██████████]` | COMPLETED |

---

## Detailed Task Progress

| ID | Task | Module | Status | Evidence / Notes |
|---|---|---|---|---|
| SCR-01 | Auth - Login (Masuk ke Portal Layanan) | Authentication Flow | COMPLETED | src/app/login/page.tsx: Form otentikasi resmi, toggle show/hide password, RBAC switcher (Klien, Admin, Superadmin), Google OAuth simulation, SSL 256-bit disclaimer. |
| SCR-02 | Auth - Registrasi Klien (Pendaftaran Akun Baru) | Authentication Flow | COMPLETED | src/app/register/page.tsx & /login/register: Form registrasi lengkap (PIC, PT/CV, email korporat, WhatsApp, NPWP 16 digit Coretax, password match), UU PDP & NDA agreement, Google OAuth, interactive success state. |
| SCR-03 | Auth - Lupa Kata Sandi / Reset Kredensial | Authentication Flow | COMPLETED | src/app/login/forgot-password/page.tsx: Form reset kredensial, validasi email, dispatch simulation, resend state, tautan kembali ke login. |
| SCR-04 | Landing Page - Beranda Utama Corporate | Public Pages & Layanan | COMPLETED | src/app/page.tsx: 10 seksi lengkap (Navbar, Hero #060D22 Coretax DJP, About/Profil, Services 2 pilar, Regulations KMK 7 valuta, Education reader modal, Careers CV upload, Contact inquiry form, Footer, Floating WhatsApp CTA). |
| SCR-05 | Layanan - Konsultasi Hukum Korporat & Legal | Public Pages & Layanan | COMPLETED | src/app/layanan/hukum/page.tsx: Breadcrumb token text-breadcrumb, hero banner dual CTA, 4 pilar hukum korporat, workflow 01-04, 4 deliverables klien, profil konsultan legal Advokat PERADI, FAQ accordion, related navigator. |
| SCR-06 | Layanan - Konsultasi Bisnis & Keuangan | Public Pages & Layanan | COMPLETED | src/app/layanan/bisnis/page.tsx: Breadcrumb, hero banner, 4 pilar bisnis & keuangan (Feasibility, Financial Modeling, Health Check, Valuasi), workflow 01-04, kertas kerja klien, profil Linda David S.Ak BKP, FAQ accordion, related navigator. |
| SCR-07 | Layanan - Accounting Service (Standar SAK) | Public Pages & Layanan | COMPLETED | src/app/layanan/akuntansi/page.tsx: Breadcrumb, hero banner, 4 pilar akuntansi SAK (Kompilasi SAK EP/IFRS, Jurnal/Rekonsiliasi Bank bulanan, Review COA, Pendampingan KAP), workflow 01-04, deliverables, profil Akuntan Beregister CA, FAQ accordion. |
| SCR-08 | Layanan - Tax Service Core (SPT & Kepatuhan) | Public Pages & Layanan | COMPLETED | src/app/layanan/tax-service/page.tsx & src/app/layanan/tax-core/page.tsx: Breadcrumb, hero banner, 4 pilar layanan pajak (Kepatuhan SPT Masa/Tahunan PPh & PPN, Administrasi e-Faktur & Bukti Potong Unifikasi, Tax Planning Strategis UU HPP, Pendampingan SP2DK & Asistensi Pemeriksaan), alur penugasan 01-04, deliverable resmi (BPE DJP), profil Konsultan Pajak Beregister BKP, dan FAQ interaktif. Link navigasi Navbar dan Footer terintegrasi. |
| SCR-09 | Portal Peraturan & Kurs Pajak Mingguan KMK | Public Pages & Layanan | COMPLETED | src/app/peraturan/page.tsx & /layanan/coretax: Hero banner, 4 quick metrics, search & filter 5 kategori regulasi, 2 highlight cards (Kurs KMK mingguan & Coretax SP2DK DJP), tabel interaktif regulasi berpaginasi dengan aksi unduh PDF resmi, callout advisory, serta navigasi Navbar dan Footer terintegrasi. |
| SCR-10 | Portal Edukasi & Literasi Kepatuhan Pajak | Public Pages & Layanan | COMPLETED | src/app/edukasi/page.tsx: Hero & featured 2-column article card dengan cover image korporat (/images/education-featured.jpg), Seksi 01 Topik & Kategori Edukasi (pencarian real-time & 6 filter kategori pills, 4 baris topik trending 01-04), Seksi 02 Katalog Artikel Edukasi & Panduan Praktis (6 kartu artikel komprehensif, tag topik, estimasi baca, modal dialog pembaca artikel interaktif dengan poin takeaways & unduh ringkasan PDF), Seksi 03 Banner Corporate In-House Tax Training (#060D22), dan Seksi 04 Form Langganan Buletin Wawasan Fiskal Mingguan dengan feedback interaktif. Terintegrasi penuh ke Navbar dan Footer. |
| SCR-11 | Portal Karir & Rekrutmen Zhou Consulting | Public Pages & Layanan | COMPLETED | src/app/karir/page.tsx: Hero & narasi kultur korporat (#060D22), 2 highlight cards (Sertifikasi Brevet/USKP/Coretax & Skema Kerja Hybrid), katalog lowongan kerja terfilter (Senior Tax Consultant Coretax/SP2DK, Junior Auditor SAK, Corporate Legal Specialist, Tax Compliance Associate), modal kualifikasi detail (Dialog), formulir lamaran online terintegrasi dengan validasi dropzone PDF maksimal 5MB, persetujuan UU PDP 2022, dan notifikasi kode registrasi pelamar. Navigasi Navbar & Footer tersinkronisasi ke /karir. |
| SCR-12 | Kontak & Saluran Operasional Sudirman | Public Pages & Layanan | COMPLETED | src/app/kontak/page.tsx: Hero & detail kantor Menara Sudirman Kav. 21 Lt. 12, peta denah interaktif akses MRT & TransJakarta, jam operasional, kontak telepon & email resmi, formulir permohonan konsultasi dengan nomor tiket otomatis (ZHOU-INQ-2026-XXXX) & SLA 1x24 jam, serta direktori khusus 3 divisi (Pajak, Akuntansi, Legal) dengan hot-line WhatsApp. Navigasi Navbar & Footer tersinkronisasi ke /kontak. |
| SCR-13 | Formulir Permohonan & Jadwal Konsultasi | Public Pages & Layanan | COMPLETED | src/app/konsultasi/page.tsx: Engine reservasi 4-langkah (Bidang Layanan & Format Pertemuan tatap muka di Menara Sudirman / daring Google Meet, Pemilih Tanggal 10 hari kerja & 4 Slot Waktu terindikasi kuota, Data Pemohon dengan NPWP 16-Digit Coretax & Dropzone Dokumen PDF 10MB terproteksi NDA, Pakta Kerahasiaan UU PDP No. 27/2022 & Struk Tiket Resmi ZHOU-CNS-2026-XXXX ber-SLA 1x24 jam), Checklist 4 Dokumen Pra-Konsultasi, serta FAQ interaktif. CTA Hero & Layanan tersinkronisasi ke /konsultasi. |
| SCR-14 | Portal Klien - Dashboard Utama & Metrik Konsultasi | Client Advisory Dashboard | COMPLETED | src/app/dashboard/user/layout.tsx & page.tsx, src/components/dashboard/UserSidebar.tsx: Persistent client portal shell dengan navigasi sidebar (#0B1533) 5 menu (Dashboard, Tiket, Dokumen, Chatbot, Profil), 3 kartu metrik progres (Tiket Aktif 02, Laporan Selesai 04, Dokumen Tersimpan 06), tabel interaktif monitoring tiket dengan filter tabs (Semua/Proses/Selesai) dan modal detail inspeksi lembar kerja 4 tahapan, kartu dokumen pajak terbaru terunduh (BPE PPN, SAK Final, Rekonsiliasi Fiskal), modal buat tiket baru, serta banner bantuan chatbot fiskal. |
| SCR-15 | Portal Klien - Monitoring Tiket & Lembar Kerja | Client Advisory Dashboard | COMPLETED | src/app/dashboard/user/tiket/page.tsx: Halaman mandiri monitoring tiket konsultasi (Figma 71:16 Row 2-2). 3 kartu metrik ringkas (Tiket Aktif 02, Laporan Selesai 04, Dokumen Tersimpan 06), master panel tabel tiket terfilter (tab status, kategori, pencarian real-time, paginasi), detail panel lembar kerja master-detail dinamis dengan visual milestone tracker 3 tahapan (01-03), berkas deliverable XLSX/PDF terunduh berenkripsi, riwayat korespondensi konsultan dengan input klarifikasi, serta modal buat tiket konsultasi baru. |
| SCR-16 | Portal Klien - Manajemen Dokumen Pajak Aman (Vault / NDA) | Client Advisory Dashboard | COMPLETED | src/app/dashboard/user/dokumen/page.tsx: Halaman repositori vault dokumen pajak aman & NDA (Figma 71:17 Row 2-3). 3 kartu metrik ringkasan (Total 06, Pajak & BPE 02, Keuangan & Legal 04), bilah pencarian dan multi-filter (kategori, tahun fiskal, pengurutan file), tabel dokumen interaktif berpaginasi dengan format PDF/XLSX, tautan tiket referensi, status keabsahan terverifikasi, tombol unduh berkas individu & ZIP bulk download, serta modal dialog detail inspeksi hash SHA-256 dan penandatangan resmi. |
| SCR-17 | Portal Klien - Chatbot Bantuan Rule-Based | Client Advisory Dashboard | COMPLETED | src/app/dashboard/user/chatbot/page.tsx: Halaman asistensi chatbot interaktif rule-based portal klien (Figma 71:18 Row 2-4). Chat header dengan status bot online terverifikasi BKP, message feed dengan pembatas tanggal, 5 preset topic buttons (Coretax 2026, TER PPh 21, SP2DK, SPT Masa PPN 1111, SAK EP), simulasi animasi indikator mengetik (bouncing dots), balon percakapan user (navy #0B1533) dan bot (white card berbingkai), dasar hukum regulasi resmi, tombol feedback kepuasan tanggapan, bilah input interaktif, banner penafian hukum & kepatuhan, serta modal dialog eskalasi ke tiket konsultasi baru. |
| SCR-18 | Portal Klien - Pengaturan Profil & Keamanan Akun | Client Advisory Dashboard | COMPLETED | src/app/dashboard/user/profil/page.tsx: Halaman pengaturan profil entitas & keamanan akun klien (Figma 71:19 Row 2-5). Kartu profil legalitas entitas korporat (PT Maju Makmur Sentosa, ID CL-88219, badge Terverifikasi Coretax DJP, NPWP 16 digit, KLU, alamat resmi), 3 status jaminan kepatuhan (SSL 256-bit, NDA, UU PDP No. 27/2022), 3 tab navigasi pengaturan (Tab 1: Form informasi PIC terverifikasi, Tab 2: Keamanan ganti kata sandi dengan real-time password strength meter dan toggle 2FA OTP, Tab 3: Log sesi perangkat terdaftar dengan aksi terminasi sesi lain). |
| SCR-19 | Portal Admin - Public Website CMS Portal | Admin & Superadmin Operations | COMPLETED | src/components/dashboard/AdminSidebar.tsx, src/app/dashboard/admin/layout.tsx & page.tsx: Central Public Website Content Management Portal (#0B1533) dengan profil Linda David S.Ak BKP, 4 kartu metrik eksekutif (Total Konten Publik, Layanan Aktif, Edukasi Pajak 2 Menu, Kurs Pajak KMK), sistem 10 tab manajemen halaman publik (Homepage, Profil, 4 Layanan, Regulasi, Kurs KMK, Edukasi Zhou & Belajar Pajak, Karir, Kontak, dan Lembar Kerja Staf), status lifecycle (Published/Draft/Archived), filter & pencarian real-time, modal dialog adaptif tambah konten baru, modal pratinjau cepat, dan konfirmasi hapus aman. |
| SCR-20 | Portal Admin - CMS Landing Page Editor | Admin & Superadmin Operations | COMPLETED | src/app/dashboard/admin/cms/page.tsx: Halaman manajemen konten landing page terpadu (Figma 71:21 Row 3-2). 3 kartu metrik publikasi (Total Terbit 18, Kurs KMK No. 38/2026, Status Web 100% Live), sistem navigasi 6 tab konten (Semua Konten dengan filter status/pencarian real-time, Editor Profil & Hero Banner, Editor Kurs Valuta KMK 7 mata uang, Editor Regulasi DJP, Editor Artikel Edukasi, dan Editor Lowongan Karir), modal dialog pembuatan konten baru, dan modal dialog pratinjau cepat tampilan artikel. |
| SCR-21 | Portal Admin - Upload Berkas Laporan & Billing Klien | Admin & Superadmin Operations | COMPLETED | src/app/dashboard/admin/upload/page.tsx: Halaman upload deliverable laporan final & billing klien (Figma 71:22 Row 3-3). 4 kartu metrik operasional (Berkas Terunggah 05, Menunggu Pembayaran 02, Billing Lunas 03, Rata-Rata Rilis 1.2 Hari), bilah pencarian real-time & multi-filter kategori/status, tabel master deliverable dengan status SHA-256 dan aksi unduh/faktur/kirim notif, bottom split panel 2 kolom (formulir cepat upload berkas laporan dengan kalkulasi nominal invoice & auto-notifikasi WhatsApp/Email PIC klien, serta panel jaminan integritas enkripsi AES-256/UU PDP), modal faktur billing resmi dengan rincian rekening Mandiri, dan modal dialog upload laporan baru. |
| SCR-22 | Portal Superadmin - Kelola Akun Admin & Staf | Admin & Superadmin Operations | COMPLETED | src/app/dashboard/superadmin/users/page.tsx, src/components/dashboard/SuperadminSidebar.tsx, src/app/dashboard/superadmin/layout.tsx: Halaman manajemen akun admin & staf konsultan (Figma 71:23 Row 4-2). Persistent shell Superadmin (#0B1533) dengan profil Managing Director & Superadmin (Muhamad Dekhsa Afnan, SH.), 3 kartu metrik operasional (Total Staf 08, Staf Aktif 07, Proteksi 2FA 100%), bilah pencarian & multi-filter divisi/status/peran, tabel master 8 akun staf lintas 4 divisi (Tax, Accounting, Business, Legal), status proteksi 2FA, aksi edit, reset kata sandi, toggle status aktif/nonaktif, modal tambah akun staf baru (+ NIP otomatis & 2FA toggle), modal edit peran RBAC, dan modal proteksi audit trail saat penonaktifan akun. |
| SCR-23 | Portal Superadmin - Manajemen Akun Admin & Log Audit | Admin & Superadmin Operations | COMPLETED | src/app/dashboard/superadmin/page.tsx, src/components/dashboard/SuperadminSidebar.tsx, src/app/dashboard/superadmin/layout.tsx: Halaman manajemen audit log & kontrol eksekutif superadmin (Figma 71:24 Row 4-1). Persistent shell Superadmin (#0B1533), 3 kartu metrik integritas sistem (Total Log 28, Perubahan Selesai 18, Integritas Kriptografis SHA-256), bilah pencarian real-time & multi-filter admin/status, tabel master audit trail append-only mutlak, modal inspeksi detail rekam jejak kriptografis, fungsi ekspor CSV, dan ekspor laporan resmi PDF terenkripsi. |

---

## Completed Work

### Front-End Project Setup
Status: `COMPLETED`

Yang sudah tersedia:
- Next.js 14.2.35
- TypeScript
- Tailwind CSS
- App Router
- ESLint
- `src/` structure
- import alias `@/*`
- Git repository
- GitHub remote

### AI Agent Setup & Configuration
Status: `COMPLETED`

Yang sudah tersedia:
- `.agents/rules/zhou-consulting-frontend.md`
- `.agents/agents/zhou-frontend-agent/agent.md`

### Design System Foundation
Status: `COMPLETED`

Yang sudah tersedia:
- Open Sans
- Typography system
- Zhou Consulting color tokens
- Tailwind tokens
- CSS variables
- reusable UI components
- shadcn/ui foundation
- Font Awesome icons
- global styling
- responsive typography foundation

Relevant files include:
- `tailwind.config.ts`
- `src/app/globals.css`
- `src/components/ui/button.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/textarea.tsx`
- `src/components/ui/label.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/badge.tsx`
- `src/components/icons/index.tsx`

### Brand Revision
Status: `COMPLETED`

Current approved palette:
- Primary: `#0B1533`
- Primary Dark: `#060D22`
- White: `#FFFFFF`
- Grey / Silver: `#C5C8D0`
- Secondary Grey: `#667085`
- Primary Light: `#E9EDF5`
- Surface: `#F7F8FA`
- Text: `#172033`
- Success: `#12B76A`
- Error: `#D92D20`

IMPORTANT:
Gold is NOT part of the current brand system.
Verified that old gold values are not present:
- `#B8933C`
- `#A38032`

Do not reintroduce gold.

---

## Landing Page Implementation

| Section | Status |
|---|---|
| Header / Navbar | NOT STARTED |
| Hero | NOT STARTED |
| About / Siapa Kita | NOT STARTED |
| Services / Layanan | NOT STARTED |
| Contact / Hubungi Kami | NOT STARTED |
| Footer | NOT STARTED |

> **Note:** Figma design ≠ Front-End implementation. Landing page slicing will commence under Module: Front-End Slicing & Implementation.

---

## Current Work

> No task is currently in progress.
---

## Full Functionality Audit & End-to-End Flow Verification Report

**Tanggal Audit:** 13 Oktober 2026  
**Cakupan:** 41 Rute Aplikasi, Autentikasi, Konsultasi, Penugasan PIC, CMS, Karir & Lamaran, Chatbot, dan Dokumen Vault.

### 1. Ringkasan Status Modul

| No | Modul / Alur | Cakupan Rute & Komponen | Temuan & Hasil Perbaikan | Status Akhir |
|:---|:---|:---|:---|:---:|
| 1 | **Halaman Publik** | `/`, `/layanan/*`, `/peraturan`, `/edukasi`, `/belajar-pajak`, `/kontak` | Semua link navigasi, breadcrumb, CTA WhatsApp resmi, filter, pagination, dan pencarian berfungsi tanpa login. Tidak ada `href="#"`. | `DONE` |
| 2 | **Autentikasi & RBAC** | `/login`, `/register`, `/reset-password`, `middleware.ts`, `AuthContext.tsx` | Redirection sesuai role (klien -> `/dashboard/user`, admin -> `/dashboard/admin`, superadmin -> `/dashboard/superadmin`). Guard rute memblokir akses tidak sah melalui URL. | `DONE` |
| 3 | **Chatbot Mandiri** | `/components/chatbot/ChatbotWidget.tsx`, `/kontak` | Pengunjung dan klien dapat berinteraksi memilih topik FAQ, melihat dasar hukum, dan diarahkan ke WhatsApp konsultasi tanpa wajib login. | `DONE` |
| 4 | **Konsultasi & Tiket Klien** | `/dashboard/user/tiket`, `/dashboard/user/konsultasi` | Klien dapat membuat tiket baru (masuk antrean penugasan Superadmin), mengunggah berkas tambahan pada tiket aktif, melihat milestone, dan mengunduh berkas resmi. | `DONE` |
| 5 | **Penugasan Superadmin** | `/dashboard/superadmin/penugasan`, `/dashboard/superadmin/users` | Superadmin dapat menetapkan konsultan PIC ke tiket baru, mengalihkan penugasan (*reassignment*), serta mencabut akses PIC lama secara otomatis. | `DONE` |
| 6 | **Tugas Saya & Operasional Admin** | `/dashboard/admin/tugas`, `/dashboard/admin` | Admin PIC hanya melihat tiket miliknya. Fitur unduh berkas klien langsung aktif, dropzone dokumen rapi, pengiriman dokumen/catatan terintegrasi, dan status tersinkronisasi. | `DONE` |
| 7 | **Vault Dokumen Pajak** | `/dashboard/user/dokumen`, `/dashboard/superadmin/upload` | Validasi tipe file & ukuran, enkripsi SHA-256, unduh file resmi/ZIP, dan modal rincian berkas berjalan sesuai hak akses. | `DONE` |
| 8 | **Pusat Manajemen CMS** | `/dashboard/superadmin/cms`, `/dashboard/admin/cms` | Admin diblokir dengan `UnauthorizedAccess`. Superadmin dapat CRUD konten di 10 modul dengan status Draft/Published yang tersinkronisasi ke halaman publik. | `DONE` |
| 9 | **Karir & Rekrutmen Pelamar** | `/karir`, `/dashboard/superadmin/lamaran`, `/api/karir/apply` | Pelamar umum dapat melamar tanpa login, posisi otomatis terisi, validasi PDF CV (maks. 5MB), pencegahan duplikasi email, nomor registrasi resmi, dan modal konfirmasi hapus lamaran superadmin. | `DONE` |
| 10 | **Integrasi Backend & Notifikasi** | `.env`, `src/lib/api.ts` | Fallback penyimpanan persisten lokal saat backend luring; dependensi server SMTP/API email didokumentasikan tanpa simulasi email palsu. | `NEEDS BACKEND` |

---

### 2. Rincian Temuan & Perbaikan

1. **Modal Hapus Lamaran Superadmin (`/dashboard/superadmin/lamaran`)**:
   - *Temuan:* Menggunakan `window.confirm` bawaan browser untuk aksi destruktif penghapusan lamaran.
   - *Solusi:* Diperbarui menggunakan dialog konfirmasi modal in-app dengan tombol Batal dan Hapus Lamaran yang aman, informatif, dan responsif.
   - *File:* `src/app/dashboard/superadmin/lamaran/page.tsx`.

2. **Aksi Unduh Berkas Klien di Tabel Tugas Admin (`/dashboard/admin/tugas`)**:
   - *Temuan:* Klik pada kolom "Dokumen Klien: 1 Berkas" sebelumnya membuka modal detail alih-alih langsung mengakses berkas.
   - *Solusi:* Tombol tabel diubah agar langsung memicu unduhan berkas klien (`handleDirectClientDocClick`), tanpa membuka modal detail.
   - *File:* `src/app/dashboard/admin/tugas/page.tsx`.

3. **Penataan Modal Detail Tugas Konsultasi (`/dashboard/admin/tugas`)**:
   - *Temuan:* Elemen ringkasan klien dan uraian kebutuhan kasus terbungkus kotak tebal bertumpuk; teks log status perikatan bocor ke uraian kebutuhan; tombol kirim tidak sejejer dengan tombol tutup.
   - *Solusi:*
     - Kotak/border pembungkus dilepas agar tampilan lega dan *seamless*.
     - Progres pengerjaan dihapus dari modal detail karena sudah terpantau di tabel utama.
     - Fallback log korespondensi dihapus dari "Uraian Kebutuhan Kasus" sehingga hanya menampilkan deskripsi asli dari klien.
     - Ukuran dan ketebalan font 3 kolom identitas (Klien, Divisi, Kontak) diseragamkan sepenuhnya.
     - Tombol "Kirim Dokumen & Catatan" dipindahkan ke bawah dan disejajarkan berdampingan dengan tombol "Tutup" (`form="detail-send-form"`).
   - *File:* `src/app/dashboard/admin/tugas/page.tsx`.

4. **Validasi Alur Karir & Lamaran (`/karir`)**:
   - *Temuan:* Kebutuhan verifikasi bahwa pelamar baru tidak perlu login dan data otomatis masuk ke Superadmin Lamaran Masuk.
   - *Solusi:* Alur tervalidasi dengan deduplikasi email, pembuatan kode registrasi unik (`ZHOU-REC-YYYY-XXXX`), validasi dropzone PDF 5MB, dan sinkronisasi instan ke storage Superadmin Lamaran Masuk.
   - *File:* `src/app/karir/page.tsx`, `src/app/dashboard/superadmin/lamaran/page.tsx`.

5. **Pemisahan Ruang Lingkup Operasional (Superadmin Perikatan vs Overview Tugas Admin)**:
   - *Permintaan:* Tabel daftar perikatan konsultasi dan ringkasan operasional seluruh klien dipindahkan ke Superadmin; Overview Admin diganti menjadi overview tugas dari masing-masing admin (PIC login).
   - *Solusi:*
     - **Superadmin (`/dashboard/superadmin/perikatan`):** Dibuatkan halaman khusus "Ringkasan Operasional & Perikatan Klien" yang memantau metrik seluruh kantor (Total Konsultasi, Sedang Berjalan, Konsultasi Selesai, Total Klien, Total Dokumen) dan tabel daftar seluruh perikatan klien dengan filter dan tombol penugasan ke `/dashboard/superadmin/penugasan`. Ditambahkan ke navigasi `SuperadminSidebar` dan tab di `/dashboard/superadmin`.
     - **Admin (`/dashboard/admin`):** Halaman overview admin kini sepenuhnya berfokus pada **tugas masing-masing admin yang sedang login** (`getTicketsForAdmin(activeStaffProfile)`). Metrik menampilkan: Total Tugas Saya, Sedang Dikerjakan, Menunggu Respon Klien, Tugas Selesai, dan Dokumen Terkait Tugas. Tabel menyajikan daftar tugas personal dengan progress bar, kelengkapan berkas, estimasi penyelesaian, dan tombol aksi "Buka Lembar Kerja" langsung ke `/dashboard/admin/tugas?id=...`.
     - Label navigasi `AdminSidebar` diperbarui menjadi "Overview Tugas Saya".
   - *File:* [admin/page.tsx](file:///c:/Magang%20Zhou/fe-zhou/src/app/dashboard/admin/page.tsx), [superadmin/perikatan/page.tsx](file:///c:/Magang%20Zhou/fe-zhou/src/app/dashboard/superadmin/perikatan/page.tsx), [superadmin/page.tsx](file:///c:/Magang%20Zhou/fe-zhou/src/app/dashboard/superadmin/page.tsx), [AdminSidebar.tsx](file:///c:/Magang%20Zhou/fe-zhou/src/components/dashboard/AdminSidebar.tsx), [SuperadminSidebar.tsx](file:///c:/Magang%20Zhou/fe-zhou/src/components/dashboard/SuperadminSidebar.tsx).

---

### 3. Hasil Validasi Kualitas Kode & Build

- **TypeScript (`npx tsc --noEmit`):** `0 errors` (Type-safe 100%)
- **ESLint (`npm run lint`):** `✔ No ESLint warnings or errors`
- **Next.js Production Build (`npm run build`):** `Exit Code 0` (43/43 Rute Statis & Dinamis Terkompilasi Bersih)

---

### 4. Dependensi Backend yang Perlu Disiapkan

1. **SMTP Server / Layanan Email Transaksional**:
   - Untuk pengiriman email konfirmasi penerimaan lamaran kerja resmi ke inbox pelamar dan notifikasi tagihan invoice ke klien. (Saat ini dicatat sebagai dependensi backend; frontend tidak menampilkan konfirmasi email palsu).
2. **Koneksi Database & Backend API**:
   - Endpoint backend API (`http://43.173.2.162` / `https://43.173.2.162.sslip.io`) kini berfungsi sebagai **Single Source of Truth** utama untuk seluruh fitur sistem.

---

### 5. Migrasi Menyeluruh ke Backend API & Penghapusan Cache / Mock Persistence

**Tanggal Pelaksanaan:** 15 Oktober 2026  
**Status:** `COMPLETED`

#### A. Kebijakan Penyimpanan Data Baru (Strict Storage Policy)
- **Single Source of Truth:** Semua data operasional (konsultasi, tiket, berkas deliverable, data staf/admin, audit log, lamaran kerja, profil perusahaan, kontak, layanan, dan regulasi) wajib diambil dan dimutasi langsung melalui endpoint Backend API.
- **Batasan Browser Storage (`localStorage` / `sessionStorage`):**
  - **Diizinkan:** Hanya untuk token autentikasi (`zhou_auth_token`), sesi user/peran (`zhou_user_role`), dan preferensi UI (`zhou_language`).
  - **Dihapus/Dilarang:** Tidak ada lagi penyimpanan array mock tiket, dokumen vault, daftar staf admin, riwayat audit trail, atau item CMS yang disimpan atau digabungkan (*merged*) dari browser storage lokal.
- **Cache Invalidation:** Semua permintaan fetch ke backend pada `src/lib/api.ts` dikonfigurasi secara eksplisit dengan `cache: "no-store"` untuk mencegah Next.js dan browser menyajikan respon lama/stale.

#### B. Audit Modul & File yang Dimigrasikan

| Modul / Halaman | File yang Dimigrasikan | Perubahan yang Diterapkan | Status Endpoint Backend |
|---|---|---|---|
| **API Client Core** | `src/lib/api.ts` | Default `cache: "no-store"` pada `apiFetch`. Penambahan endpoint `clientApi.deleteConsultation`, `adminApi.deleteConsultation`, serta validasi `updateCompanyProfile`. | Aktif (`/api/v1/*`) |
| **Portal Klien - Overview** | `src/app/dashboard/user/page.tsx` | Menghapus merge `localStorage`. Mengambil tiket via `clientApi.getConsultations()` dan dokumen via `clientApi.getDocuments()`. Dilengkapi state `isLoading` dan penanganan error. | Terkoneksi Penuh |
| **Portal Klien - Vault Dokumen** | `src/app/dashboard/user/dokumen/page.tsx` | Menghapus pembacaan dari storage lokal. Mengambil dokumen riil klien dari `clientApi.getDocuments()` dan unduhan via `clientApi.getDownloadUrl()`. | Terkoneksi Penuh |
| **Portal Klien - Monitoring Tiket** | `src/app/dashboard/user/tiket/page.tsx` | Pembuatan konsultasi via `clientApi.createConsultation`, upload berkas awal & tambahan via `clientApi.uploadConsultationDocument`, dan hapus tiket via `clientApi.deleteConsultation`. | Terkoneksi Penuh |
| **Portal Admin - Overview Tugas** | `src/app/dashboard/admin/page.tsx` | Mengambil data konsultasi riil melalui `adminApi.getConsultations()`. Menghitung tugas personal PIC yang sedang login. | Terkoneksi Penuh |
| **Portal Admin - Lembar Kerja / Tugas** | `src/app/dashboard/admin/tugas/page.tsx` | Sinkronisasi status konsultasi langsung ke `adminApi.updateConsultationStatus` dan pengiriman dokumen deliverable ke klien via `adminApi.uploadDocument`. | Terkoneksi Penuh |
| **Portal Superadmin - Perikatan & PIC** | `src/app/dashboard/superadmin/perikatan/page.tsx` | Menghapus *smart non-destructive merge* storage. Mengambil konsultasi via `adminApi.getConsultations()` dan daftar admin via `superadminApi.getAdmins()`. Penugasan PIC langsung via `adminApi.assignConsultation` dan hapus via `adminApi.deleteConsultation`. | Terkoneksi Penuh |
| **Portal Superadmin - Upload & Billing** | `src/app/dashboard/superadmin/upload/page.tsx` | Menghapus pembacaan dokumen dari `localStorage`. Menarik berkas deliverable langsung via `adminApi.getAllDocuments()` dan `adminApi.getConsultations()`. Upload via `adminApi.uploadDocument`. | Terkoneksi Penuh |
| **Portal Superadmin - Kelola Admin / Staf** | `src/app/dashboard/superadmin/users/page.tsx` | Menghapus `zhou_superadmin_staff_list`. Menarik admin via `superadminApi.getAdmins()` dan sinkronisasi tugas via `adminApi.getConsultations()`. Mutasi via `createAdmin`, `deactivateAdmin`, dan `deleteAdmin`. | Terkoneksi Penuh |
| **Portal Superadmin - Log Audit Trail** | `src/app/dashboard/superadmin/audit/page.tsx` | Menghapus flag `zhou_audit_logs_cleared` dan mock data. Mengambil data audit log asli langsung melalui `superadminApi.getAuditLogs()` dan ekspor via `superadminApi.exportAuditLogs()`. | Terkoneksi Penuh |
| **Portal Superadmin - Lamaran Kerja** | `src/app/dashboard/superadmin/lamaran/page.tsx` | Menghapus pembacaan dari `getStoredJobApplications` dan `DELETED_APP_IDS_KEY`. Mengambil lamaran riil via `adminCmsApi.getJobApplications()` dan mutasi via `adminCmsApi.deleteJobApplication`. | Terkoneksi Penuh |
| **Portal Superadmin - CMS Manager** | `src/app/dashboard/superadmin/cms/page.tsx` | Menghapus penyimpanan lokal hero & kontak. Mutasi konten dikirim ke `adminCmsApi.updateContactSettings` dan `adminCmsApi.updateCompanyProfile`. | Terkoneksi Penuh |
| **Landing Page & Halaman Publik** | `src/components/landing/Hero.tsx`, `src/app/kontak/page.tsx`, `src/app/karir/page.tsx`, `src/app/edukasi/page.tsx`, `src/app/peraturan/page.tsx` | Menghapus prioritas fallback dari `localStorage`. Memprioritaskan respon backend API langsung dari `publicApi.*`. | Terkoneksi Penuh |
