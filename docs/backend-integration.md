# 📘 Dokumentasi & Ringkasan Integrasi Backend Zhou Consulting

Dokumen ini merangkum seluruh arsitektur, konfigurasi, dan implementasi teknis integrasi frontend **Zhou Consulting** dengan live RESTful backend yang mengacu pada dokumentasi Scalar OpenAPI di [http://43.173.2.162/docs](http://43.173.2.162/docs).

---

## 🌐 1. Spesifikasi Server & Target Lingkungan

- **Live VPS Server Endpoint**: `http://43.173.2.162`
- **Dokumentasi Interaktif**: `http://43.173.2.162/docs` (Scalar API Reference / OpenAPI 3.1.0)
- **Status Layanan**: PostgreSQL terhubung, Redis Cache aktif, JWT Authentication terproteksi.
- **Variabel Lingkungan (`.env.local` & `.env.example`)**:
  ```env
  # Backend Express REST API Endpoint (Live VPS Server)
  NEXT_PUBLIC_API_URL=http://43.173.2.162
  ```

---

## 🔑 2. Kredensial Akun Pengujian (Seed Database RBAC)

Berikut kredensial resmi dari backend database yang disematkan pada tombol *Akses Instan Peran* di halaman login:

| Role (Peran) | Nama Akun | Alamat Email | Kata Sandi | Lingkup Hak Akses |
| :--- | :--- | :--- | :--- | :--- |
| **SUPERADMIN** | Super Administrator Zhou | `superadmin@zhouconsulting.com` | `SuperAdmin123!` | Manajemen staf admin, audit log append-only, seluruh CMS & sistem |
| **ADMIN** | Konsultan Senior Zhou | `admin@zhouconsulting.com` | `Admin123!` | Manajemen perikatan klien, tiket konsultasi, verifikasi dokumen, checklist tugas |
| **USER (Klien)** | Budi Pratama (Direktur) | `klien@perusahaan.com` | `Client123!` | Portal klien, tracking status konsultasi, booking tiket, upload berkas |

---

## 🛠️ 3. Arsitektur Klien API (`src/lib/api.ts`)

File [`src/lib/api.ts`](file:///c:/Magang%20Zhou/fe-zhou/src/lib/api.ts) berfungsi sebagai lapisan komunikasi terpadu (*Single Source of Truth*) antara frontend dan backend dengan fitur:
1. **Otentikasi Otomatis**: Menyematkan header `Authorization: Bearer <token>` dari `localStorage` (`zhou_auth_token`) ke setiap request terproteksi.
2. **Sanitasi Base URL**: Menangani format URL yang fleksibel (`http://43.173.2.162` maupun `http://43.173.2.162/api`) tanpa duplikasi path.
3. **Respon Standar & Error Handling**: Menangani tipe JSON standar `{ success, message, data, error, errors }` dan fallback jika koneksi offline.

### Pemetaan 43 Endpoint Backend:

#### A. Infrastruktur & Sistem
- `GET /api/health` — Memeriksa status kesehatan server, PostgreSQL, dan Redis.

#### B. Autentikasi (`authApi`)
- `POST /api/v1/auth/register` — Registrasi akun klien baru (role `USER`).
- `POST /api/v1/auth/login` — Autentikasi email & kata sandi, mengembalikan token JWT.
- `POST /api/v1/auth/google` — Autentikasi via Google OAuth token.
- `POST /api/v1/auth/forgot-password` — Pengiriman token reset kata sandi ke email.
- `POST /api/v1/auth/reset-password` — Verifikasi token dan pembaruan kata sandi.
- `POST /api/v1/auth/logout` — Pencabutan (*revocation*) token ke Redis Blacklist.

#### C. Pengguna (`userApi`)
- `GET /api/v1/user/profile` — Mengambil data profil pengguna yang sedang login.
- `PUT /api/v1/user/profile` — Memperbarui informasi nama, telepon, dan entitas perusahaan.

#### D. Portal Klien (`clientApi`)
- `GET /api/v1/client/dashboard/overview` — Ringkasan metrik dashboard klien.
- `GET /api/v1/client/consultations` — Riwayat dan daftar perikatan konsultasi aktif klien.
- `GET /api/v1/client/consultations/{id}` — Detail progres dan data konsultasi spesifik.
- `GET /api/v1/client/documents` — Repositori dokumen dan berkas pajak klien.
- `GET /api/v1/client/documents/{id}/download` — Mendapatkan Supabase signed URL dokumen.
- `GET /api/v1/client/chatbot/tree` — Struktur pohon FAQ chatbot otomatis.
- `POST /api/v1/client/chatbot/escalate` — Eskalasi percakapan bot menjadi tiket konsultasi resmi.

#### E. Portal Operasional Admin (`adminApi`)
- `GET /api/v1/admin/dashboard/overview` — Statistik performa konsultasi dan operasional konsultan.
- `GET /api/v1/admin/consultations` — Seluruh tiket perikatan klien.
- `POST /api/v1/admin/consultations` — Pembuatan perikatan konsultasi baru.
- `PATCH /api/v1/admin/consultations/{id}/status` — Perubahan status perikatan (In Progress / Completed).
- `GET /api/v1/admin/consultations/{id}/tasks` — Daftar checklist tugas perikatan.
- `POST /api/v1/admin/consultations/{id}/tasks` — Penambahan checklist tugas baru.
- `PATCH /api/v1/admin/consultations/{id}/tasks/{taskId}` — Toggle penyelesaian checklist tugas.
- `GET /api/v1/admin/consultations/{id}/documents` — Dokumen lampiran spesifik perikatan.
- `POST /api/v1/admin/consultations/{id}/documents` — Pengunggahan dokumen perikatan.
- `GET /api/v1/admin/documents` — Repositori seluruh dokumen global.

#### F. Manajemen CMS Admin (`adminCmsApi`)
- `PUT /api/v1/admin/cms/company-profiles` — Upsert profil perusahaan (visi, misi, nilai).
- `POST /api/v1/admin/cms/services` — Tambah entri katalog layanan pajak & akuntansi.
- `POST /api/v1/admin/cms/tax-rates` — Tambah kurs pajak mingguan (KMK).
- `POST /api/v1/admin/cms/regulations` — Tambah dokumen regulasi perpajakan.
- `POST /api/v1/admin/cms/education` — Tambah materi edukasi dan panduan.
- `POST /api/v1/admin/cms/careers` — Tambah lowongan kerja baru.
- `GET /api/v1/admin/cms/job-applications` — Daftar berkas pelamar kerja.

#### G. Katalog Publik & Formulir Pengunjung (`publicApi`)
- `GET /api/v1/public/company-profiles` — Informasi publik profil perusahaan.
- `GET /api/v1/public/services` — Katalog seluruh layanan yang aktif.
- `GET /api/v1/public/tax-rates/latest` — Kurs pajak mingguan resmi Kemenkeu terbaru.
- `GET /api/v1/public/regulations` — Daftar regulasi dan undang-undang perpajakan.
- `GET /api/v1/public/education` — Artikel dan panduan edukasi publik.
- `GET /api/v1/public/careers` — Lowongan karir yang terbuka.
- `POST /api/v1/public/careers/{id}/apply` — Pengiriman formulir lamaran kerja dan CV.
- `GET /api/v1/public/settings/contact` — Informasi jam operasional & kontak resmi.
- `POST /api/v1/public/contact` — Pengiriman formulir pesan / tiket pertanyaan dari landing page.

#### H. Tata Kelola Superadmin (`superadminApi`)
- `GET /api/v1/superadmin/admins` — Daftar seluruh akun staf administrator.
- `POST /api/v1/superadmin/admins` — Pendaftaran akun admin baru.
- `POST /api/v1/superadmin/admins/{id}/deactivate` — Nonaktifkan hak akses akun admin.
- `DELETE /api/v1/superadmin/admins/{id}` — Penghapusan permanen akun admin.
- `GET /api/v1/superadmin/audit-logs` — Rekam jejak audit trail sistem (append-only log).
- `GET /api/v1/superadmin/audit-logs/export` — Ekspor rekaman audit log.

---

## 🔄 4. Manajemen State Sesi & Autentikasi (`AuthContext.tsx`)

File [`src/context/AuthContext.tsx`](file:///c:/Magang%20Zhou/fe-zhou/src/context/AuthContext.tsx) mengelola siklus hidup sesi pengguna:
1. **`loginWithApi(email, password, redirectUrl)`**: Memanggil `POST /api/v1/auth/login`. Jika sukses:
   - Menyimpan token ke `localStorage` (`zhou_auth_token`).
   - Melakukan normalisasi role (`USER -> user`, `ADMIN -> admin`, `SUPERADMIN -> superadmin`).
   - Menyimpan profil ke `zhou_auth_user` dan mengarahkan pengguna ke dashboard yang sesuai (Role-Based Redirect Matrix).
2. **`registerWithApi(payload, redirectUrl)`**: Memanggil `POST /api/v1/auth/register` dan langsung mengeksekusi login otomatis setelah pendaftaran sukses.
3. **`logout()`**: Memanggil `POST /api/v1/auth/logout` untuk memasukkan token ke Redis blacklist, menghapus data sesi lokal, dan mengarahkan pengguna kembali ke halaman utama (`/`).
4. **Validasi Sesi Saat Mount**: Jika token JWT tersedia, sistem otomatis memverifikasi ke `GET /api/v1/user/profile`. Jika token sudah kedaluwarsa atau dicabut, sesi lokal dibersihkan secara otomatis.

---

## 💻 5. Modifikasi Komponen UI

1. **Halaman Login ([`src/app/login/page.tsx`](file:///c:/Magang%20Zhou/fe-zhou/src/app/login/page.tsx))**:
   - Terintegrasi dengan `loginWithApi`.
   - Menggunakan kredensial seed backend pada tombol switcher RBAC.
   - Menampilkan banner peringatan (*alert banner*) jika terjadi kegagalan otentikasi dari backend.
2. **Halaman Registrasi ([`src/app/register/page.tsx`](file:///c:/Magang%20Zhou/fe-zhou/src/app/register/page.tsx))**:
   - Form registrasi terhubung langsung ke `registerWithApi`.
3. **Halaman Profil Pengguna ([`src/app/dashboard/user/profil/page.tsx`](file:///c:/Magang%20Zhou/fe-zhou/src/app/dashboard/user/profil/page.tsx))**:
   - Memuat data nama, email, perusahaan, dan telepon pengguna langsung dari backend `userApi.getProfile()`.
   - Menyimpan perubahan profil kembali ke server melalui `userApi.updateProfile()`.
4. **Halaman Kontak ([`src/app/kontak/page.tsx`](file:///c:/Magang%20Zhou/fe-zhou/src/app/kontak/page.tsx))**:
   - Formulir pesan dan konsultasi terhubung langsung ke `POST /api/v1/public/contact`.
5. **Indikator Status Koneksi ([`src/components/common/BackendStatusBadge.tsx`](file:///c:/Magang%20Zhou/fe-zhou/src/components/common/BackendStatusBadge.tsx))**:
   - Komponen visual dengan indikator hijau berkedip (*pulsing*) yang disematkan di bagian bawah navigasi sidebar Klien, Admin, dan Superadmin.
   - Memantau status kesehatan PostgreSQL dan Redis secara live setiap 30 detik via `GET /api/health`.

---

## ✅ 6. Hasil Pengujian & Kompilasi

Kompilasi produksi menggunakan Next.js dan TypeScript telah divalidasi dengan hasil:
- **Perintah**: `npm run build`
- **Status**: **Berhasil (Exit Code 0)**
- **Hasil Linting**: Bersih (0 error, 0 warning)
- **Rute Statis**: 31/31 rute berhasil digenerate dan dioptimasi.
