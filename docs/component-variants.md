# Zhou Consulting Front-End — Component Variants Specification (D04)

Dokumentasi resmi spesifikasi dan matriks varian komponen antarmuka pengguna (UI Components) untuk proyek **Zhou Consulting Front-End**. Dokumen ini memenuhi kriteria penerimaan **D04 (Design Handoff — Components: Document Component Variants)** pada Master Checklist.

---

## 1. Ringkasan & Kriteria Penerimaan D04

| Kode | Kategori | Tugas | Kriteria Penerimaan | Status |
|:---:|:---|:---|:---|:---:|
| **D04** | Design Handoff | Components | Document component variants | *Primary, secondary, ghost, disabled, loading, and error variants defined* | **COMPLETED** |

Seluruh varian komponen dibangun di atas pustaka utilitas Tailwind CSS, `class-variance-authority` (CVA), serta terikat ketat dengan token warna resmi Zhou Consulting:
- **Primary Navy**: `#0B1533`
- **Primary Dark**: `#060D22`
- **Primary Light**: `#E9EDF5`
- **Silver / Border**: `#C5C8D0`
- **Surface**: `#F7F8FA`
- **Text Body**: `#172033`
- **Text Secondary**: `#667085`
- **Success State**: `#12B76A`
- **Error / Destructive**: `#D92D20`
- **Disiplin Warna**: 0% emas/kuning/oranye/ungu/cokelat.

---

## 2. Matriks Varian Komponen Button (`src/components/ui/button.tsx`)

Komponen `Button` mendukung variasi visual, ukuran, serta status interaktif lengkap termasuk state `disabled` dan `loading`.

### 2.1 Visual Variants

| Variant Name | Prop Value | Kelas Tailwind Utama | Deskripsi / Penggunaan |
|---|---|---|---|
| **Primary** | `variant="primary"` (default) | `bg-primary text-white hover:bg-primary-dark shadow-sm` | Tombol aksi utama (CTA), kirim formulir, simpan data. |
| **Secondary** | `variant="secondary"` | `bg-primary-light text-primary hover:bg-primary-light/80` | Aksi sekunder, filter pill sekunder, navigasi pendukung. |
| **Silver** | `variant="silver"` | `border border-silver text-primary bg-white hover:bg-surface shadow-sm` | Tombol border netral, login CTA di navbar, opsi alternatif. |
| **Outline** | `variant="outline"` | `border border-primary text-primary bg-transparent hover:bg-surface` | Tombol outline dengan aksen navy resmi. |
| **Ghost** | `variant="ghost"` | `hover:bg-primary-light hover:text-primary` | Aksi minimalis, tombol ikon tabel, navigasi pagination. |
| **Error / Destructive** | `variant="error"` | `bg-error text-white hover:bg-error/90 focus-visible:ring-error shadow-sm` | Aksi berbahaya/pembatalan: hapus akun, batalkan tiket, tolak berkas. |
| **Link** | `variant="link"` | `text-primary underline-offset-4 hover:underline` | Tautan bergaya teks dengan padding tombol. |
| **Card Action** | `variant="card-action"` | `w-full border border-primary-light text-primary bg-white hover:border-primary hover:bg-surface justify-between px-4` | Tombol footer kartu layanan dengan tata letak panah kanan otomatis. |

### 2.2 Size Variants

| Size Name | Prop Value | Dimensi & Padding | Target Penggunaan |
|---|---|---|---|
| **Small** | `size="sm"` | `h-8 px-3 text-xs rounded-md` | Tombol dalam tabel data, navbar drawer, kartu kompak. |
| **Default** | `size="default"` | `h-10 px-5 py-2 text-sm rounded-md` | Standar form input, CTA umum, dialog footer. |
| **Large** | `size="lg"` | `h-12 px-7 text-base rounded-md` | Hero banner CTA, full-width action portal login. |
| **Icon** | `size="icon"` | `h-10 w-10 p-0` | Tombol ikon toggle, filter, modal close action. |

### 2.3 Interactive States (Disabled & Loading)

```tsx
// Contoh Penggunaan State Disabled
<Button variant="primary" disabled>
  Proses Dikunci
</Button>

// Contoh Penggunaan State Loading (Otomatis Render SVG Spinner & Disabled)
<Button variant="primary" loading>
  Menyimpan Data...
</Button>

// Contoh Penggunaan Variant Error / Destructive
<Button variant="error" size="sm">
  Hapus Akun Staf
</Button>
```

- **Disabled State**: Otomatis menerapkan `disabled:pointer-events-none disabled:opacity-50`, memutus trigger mouse click dan interaksi keyboard.
- **Loading State**: Prop `loading={true}` secara otomatis menerapkan `disabled={true}`, menyematkan atribut aksesibilitas `aria-busy="true"`, serta merender ikon SVG spinner animasi (`animate-spin`) di sisi kiri teks.
- **Focus Visible**: Menggunakan ring fokus 2px warna primary navy (`focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`).

---

## 3. Matriks Varian Input & Form Controls (`src/components/ui/input.tsx` & `textarea.tsx`)

Komponen masukan teks dirancang konsisten untuk seluruh formulir publik, otentikasi, dan lembar kerja operasional dashboard.

| State / Variant | Implementasi Props | Visual & Behavior |
|---|---|---|
| **Default** | `<Input placeholder="Nama Perusahaan" />` | Border `border-primary-light` (abu-abu muda), latar putih, teks `#172033`. |
| **Focus State** | `:focus-visible` | Border bertransisi ke `border-primary` (`#0B1533`) dengan ring halus 1px. |
| **Error State** | `<Input error={true} />` atau `<Textarea error={true} />` | Border merah menyala `border-error` (`#D92D20`), ring fokus merah, teks pesan error di bawah input. |
| **Disabled State** | `<Input disabled />` | Latar redup, `disabled:cursor-not-allowed disabled:opacity-50`, input readonly bagi pengguna. |

---

## 4. Matriks Varian Badge (`src/components/ui/badge.tsx`)

Komponen lencana status digunakan untuk menandai kategori layanan, status regulasi, status tiket, dan level akses role.

| Variant Name | Prop Value | Kelas Visual | Penggunaan |
|---|---|---|---|
| **Primary** | `variant="primary"` | `bg-primary text-white` | Kategori utama, label prioritas tinggi. |
| **Secondary** | `variant="secondary"` | `bg-primary-light text-primary` | Kategori sekunder, informasi pendukung. |
| **Silver** | `variant="silver"` | `bg-silver/25 text-text border border-silver/50` | Tag akreditasi (BKP, CA), counter netral. |
| **Success** | `variant="success"` | `bg-success/15 text-success border border-success/30` | Status "Berlaku", tiket "Selesai", Coretax Ready. |
| **Error** | `variant="error"` | `bg-error/15 text-error border border-error/30` | Status "Dicabut", tiket "Ditolak", sanksi pajak. |
| **Outline** | `variant="outline"` | `border border-silver text-text-secondary bg-transparent` | Badge wireframe minimalis. |
| **Dot Indicator** | `dot={true}` | Titik bundar indikator status aktif di sebelah kiri label | Monitoring status server, verifikasi instan. |

---

## 5. Matriks Varian Card (`src/components/ui/card.tsx`)

| Variant Type | Kelas Penerapan | Skenario Penggunaan |
|---|---|---|
| **Default Surface** | `bg-white border border-primary-light rounded-xl` | Kartu ringkasan metrik dashboard, dokumen vault. |
| **Hoverable Action** | `hover:border-primary hover:shadow-md transition-all` | Kartu pilihan layanan publik, kartu artikel edukasi. |
| **Active / Highlighted** | `border-primary/40 bg-primary-light/20 shadow-sm` | Highlight card Kurs Pajak Mingguan KMK & Coretax. |

---

## 6. Pedoman Aksesibilitas & Tipografi (Accessibility & Typography)

1. **Tipografi Wajib**: Seluruh varian komponen menggunakan font keluarga **Open Sans** (`font-family: 'Open Sans', sans-serif`).
2. **Kontras Warna WCAG AA**: Rasio kontras teks putih terhadap navy `#0B1533` adalah **14.2:1** (jauh melampaui standar minimal 4.5:1). Rasio kontras error `#D92D20` terhadap putih adalah **4.6:1**.
3. **Keyboard Reachability**: Semua tombol dan elemen formulir memiliki indikator outline `:focus-visible` yang jelas saat dijelajahi via tombol `Tab`.
4. **ARIA Standards**: Dialog dan drawer menggunakan `role="dialog"`, modal menu menggunakan `aria-expanded`, serta tombol proses menggunakan `aria-busy`.
