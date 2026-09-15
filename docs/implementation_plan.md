# Implementation Plan — Task M2-D2-T1: Prepare Page & Layout Structure from Figma

This plan implements **Task M2-D2-T1: Prepare page/layout structure from Figma** under Module **Front-End Slicing & Implementation**, using the approved Figma Source of Truth **`DesignRevisi-Zhou-Consulting` (Node ID: 71:2)** and [.agents/rules/zhou-consulting-frontend.md](file:///c:/Magang%20Zhou/fe-zhou/.agents/rules/zhou-consulting-frontend.md).

> [!IMPORTANT]
> **Checklist Benchmark for M2-D2-T1:**
> *"Struktur page/layout sesuai Figma dan route tidak tumpang tindih."*
> (Page/layout structure matches Figma and routes do not overlap.)

---

## Proposed Architectural Structure

### 1. Landing Page Section Hierarchy (`src/components/landing/`)
Each section will be structured as a modular, semantic React component using the approved Design System tokens (Tailwind, Open Sans typography scale, Font Awesome icons, container `.container-custom` max-w-[1200px]):

1. **`Navbar.tsx`** (`<header>` / `<nav>`):
   - Brand logo / title ("Zhou Consulting")
   - Navigation links with smooth anchor targets:
     - Profil Perusahaan (`#profil`)
     - Layanan (`#layanan`)
     - Peraturan & Kurs (`#peraturan`)
     - Edukasi (`#edukasi`)
     - Karir (`#karir`)
     - Kontak (`#kontak`)
   - Direct CTA button ("Masuk / Login" -> `/login`)

2. **`Hero.tsx`** (`<section id="hero">`):
   - Headline: "Solusi Terintegrasi Akuntansi, Pajak, dan Keuangan Bisnis Anda"
   - Subheadline / description highlighting credibility & Coretax compliance
   - Primary & secondary CTA buttons ("Konsultasi Sekarang" -> `#kontak`, "Pelajari Layanan" -> `#layanan`)
   - Metric / trust badge highlights

3. **`AboutSection.tsx`** (`<section id="profil">`):
   - Profil Perusahaan & Visi Misi Zhou Consulting
   - Nilai integritas, kepatuhan fiskal, dan profesionalisme

4. **`ServicesSection.tsx`** (`<section id="layanan">`):
   - Layanan Akuntansi (*Accounting Service*)
   - Konsultasi & Kepatuhan Pajak (*Tax Service Core*)
   - Konsultasi Bisnis & Keuangan (*Financial Consulting*)

5. **`RegulationsSection.tsx`** (`<section id="peraturan">`):
   - Preview tabel kurs pajak mingguan
   - Tautan regulasi & panduan resmi perpajakan

6. **`EducationSection.tsx`** (`<section id="edukasi">`):
   - Artikel literasi kepatuhan pajak & publikasi panduan PDF

7. **`CareerSection.tsx`** (`<section id="karir">`):
   - Informasi lowongan kerja aktif dan persyaratan bergabung

8. **`ContactSection.tsx`** (`<section id="kontak">`):
   - Formulir pesan konsultasi (Nama, Email, Pesan)
   - Tombol cepat WhatsApp Business CS & informasi kantor

9. **`Footer.tsx`** (`<footer>`):
   - Deskripsi singkat perusahaan, navigasi tautan cepat, informasi kontak, dan hak cipta.

---

### 2. Route Architecture & Non-Overlapping Isolation
To strictly fulfill the benchmark requirement that **routes do not overlap**:
- **Public Portal**: Exclusively housed at `/` (`src/app/page.tsx`), utilizing anchor links (`#profil`, `#layanan`, dll.) for in-page navigation without conflicting routes.
- **Authentication Route**: Reserved for `/login` (separate page route).
- **Client & Admin Dashboards**: Reserved for `/dashboard/user`, `/dashboard/admin`, and `/dashboard/superadmin`.
- No nested path collisions between public sections and application dashboards.

---

## Proposed File Changes

### New Components (`src/components/landing/`)
- [NEW] [Navbar.tsx](file:///c:/Magang%20Zhou/fe-zhou/src/components/landing/Navbar.tsx)
- [NEW] [Hero.tsx](file:///c:/Magang%20Zhou/fe-zhou/src/components/landing/Hero.tsx)
- [NEW] [AboutSection.tsx](file:///c:/Magang%20Zhou/fe-zhou/src/components/landing/AboutSection.tsx)
- [NEW] [ServicesSection.tsx](file:///c:/Magang%20Zhou/fe-zhou/src/components/landing/ServicesSection.tsx)
- [NEW] [RegulationsSection.tsx](file:///c:/Magang%20Zhou/fe-zhou/src/components/landing/RegulationsSection.tsx)
- [NEW] [EducationSection.tsx](file:///c:/Magang%20Zhou/fe-zhou/src/components/landing/EducationSection.tsx)
- [NEW] [CareerSection.tsx](file:///c:/Magang%20Zhou/fe-zhou/src/components/landing/CareerSection.tsx)
- [NEW] [ContactSection.tsx](file:///c:/Magang%20Zhou/fe-zhou/src/components/landing/ContactSection.tsx)
- [NEW] [Footer.tsx](file:///c:/Magang%20Zhou/fe-zhou/src/components/landing/Footer.tsx)

### Page & Layout Updates
- [MODIFY] [src/app/page.tsx](file:///c:/Magang%20Zhou/fe-zhou/src/app/page.tsx)
  - Replace current temporary foundation showcase with the assembled landing page section structure.

### Progress Data & Documentation
- [MODIFY] [progress-data.json](file:///c:/Magang%20Zhou/fe-zhou/progress-data.json)
  - Update `M2-D2-T1` status to `COMPLETED` with evidence: `"Struktur page/layout modular landing page dan semantic route architecture diterapkan sesuai Figma tanpa tumpang tindih."`
- [MODIFY] [docs/project-progress.md](file:///c:/Magang%20Zhou/fe-zhou/docs/project-progress.md)
  - Automatically regenerated via `npm run update-progress`.

---

## Verification Plan

### Automated Checks
1. **ESLint**: `npm run lint` (ensure 0 warnings / 0 errors).
2. **Type Checking**: `npx tsc --noEmit` (ensure strict TypeScript type safety).
3. **Build Check**: `npm run build` (ensure clean static generation with no route collisions).
4. **Progress Updater**: `npm run update-progress` (confirm automatic calculation updates to 35 completed tasks, 33% overall progress, and module progression).

### Manual Verification
1. Inspect the running application in browser at `http://localhost:3000`.
2. Confirm header navigation anchor links smoothly scroll to respective sections.
3. Verify all semantic HTML tags (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`) render properly with responsive layout.
