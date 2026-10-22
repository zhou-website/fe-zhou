# 📌 LAPORAN PM: CATATAN POST-DEPLOY PRODUCTION & PEMBAGIAN TUGAS PERBAIKAN (FE & BE)

**Project:** Zhou Consulting Web Platform  
**Disusun oleh:** Project Manager (PM) Zhou Consulting  
**Tanggal:** 21 Oktober 2026  
**Status Proyek:** Post-Deploy Production Audit & Refinement  
**File Output:** `Project Manager/Laporan_Perbaikan_Post_Deploy_FE_BE.md`

---

## 📋 DAFTAR ISI
1. [Ringkasan Eksekutif & Status Sistem](#1-ringkasan-eksekutif--status-sistem)
2. [Investigasi Mendalam & Akar Masalah 9 Temuan User](#2-investigasi-mendalam--akar-masalah-9-temuan-user)
3. [Matriks Pembagian Tugas Frontend (`fe-zhou`) & Backend (`be-zhou`)](#3-matriks-pembagian-tugas-frontend-fe-zhou--backend-be-zhou)
4. [Laporan Khusus: Audit Modul CMS yang Tidak Berfungsi Normal](#4-laporan-khusus-audit-modul-cms-yang-tidak-berfungsi-normal)
5. [Action Checklist & Timeline Implementasi](#5-action-checklist--timeline-implementasi)

---

## 1. Ringkasan Eksekutif & Status Sistem

Aplikasi telah berhasil dideploy ke lingkungan produksi (Live Domain: `https://www.zhouconsulting.id`). Namun, pasca-deployment ditemukan beberapa kendala fungsional operasional pada alur kerja staf admin, portal tiket, dan panel CMS.

Audit menyeluruh pada kode sumber Frontend (`fe-zhou`) dan Backend (`be-zhou`) menemukan bahwa masalah-masalah ini berakar pada:
1. **Penyimpanan Berkas Fisik & Signed URL**: Jalur berkas (`file_path`) di basis data masih berupa string relatif/lokal dan belum sepenuhnya diselesaikan menjadi signed download URL dari Supabase Storage.
2. **Ketergantungan Pemeriksaan Hak Akses pada `localStorage`**: Fungsi otorisasi unduh berkas di lembar kerja staf admin memeriksa data tiket ke `localStorage`, bukan membaca data tiket live dari API backend.
3. **Pembaruan Milestone/Task yang Tidak Tersimpan ke Database**: Saat Admin mengubah status tahapan kerja, frontend hanya mengupdate state lokal dan memanggil update status global tiket (`IN_PROGRESS`/`COMPLETED`), tanpa memanggil API checklist task atau mengupdate `progress_percent`.
4. **Trigger Otomatis Penugasan PIC**: Controller backend `assignConsultationPic` hanya memperbarui kolom `assigned_admin_id`, namun lupa menandai checklist task kedua ("Penetapan Konsultan PIC & Divisi Terkait") sebagai selesai (`is_completed: true`).
5. **In-Memory Deletion Tombstone pada CMS**: Penghapusan data CMS (layanan dan karir) seringkali gagal di sisi backend karena *foreign key constraint*, lalu ditutupi oleh penanda lokal di memory peramban admin. Akibatnya data hilang di dashboard admin, tetapi tetap muncul bagi pengunjung publik di landing page.
6. **Mismatch Payload Foto & Berkas Edukasi**: Frontend mengirim field `image` (base64) dan string path tiruan `/docs/filename.pdf`, sementara Backend mencari `image_url`/`photo_url` dan memerlukan file biner fisik via `multipart/form-data`.

---

## 2. Investigasi Mendalam & Akar Masalah 9 Temuan User

---

### 1. Logo Perlu Diganti ke Logo Baru
* **Kondisi Saat Ini:**
  Aset logo saat ini statis berada di path [`fe-zhou/public/images/zhou-logo.jpg`](file:///c:/Users/LENOVO/Desktop/Project-Zhou/fe-zhou/public/images/zhou-logo.jpg). Aset ini digunakan di 8 lokasi:
  1. `Navbar.tsx` (Header landing page)
  2. `Footer.tsx` (Footer landing page)
  3. `AdminSidebar.tsx` (Sidebar portal admin)
  4. `SuperadminSidebar.tsx` (Sidebar portal superadmin)
  5. `UserSidebar.tsx` (Sidebar portal klien)
  6. `login/page.tsx` & `register/page.tsx` (Halaman otentikasi)
  7. `layout.tsx` (Favicon, Apple touch icon, OpenGraph metadata)
* **Status:** Menunggu aset logo baru dikirimkan oleh User/Klien.

---

### 2. Admin Tidak Bisa Mendownload File pada Lembar Kerja
*Contoh Kasus: [Admin Portal - Zhou Consulting](https://www.zhouconsulting.id/dashboard/admin/tugas?id=ZHOU-CS-8198-5807)*
* **File Terkait:** [`fe-zhou/src/app/dashboard/admin/tugas/page.tsx`](file:///c:/Users/LENOVO/Desktop/Project-Zhou/fe-zhou/src/app/dashboard/admin/tugas/page.tsx#L593-L650)
* **Akar Masalah (Root Cause):**
  1. **Otorisasi Semu Berbasis LocalStorage:** Pada fungsi `handleDownloadClientDoc`, baris 601:
     ```typescript
     const authCheck = getTicketByIdForStaff(ticketId, activeStaffProfile);
     if (!authCheck.success) {
       showToast("Akses ditolak: Anda tidak memiliki hak akses mengunduh dokumen dari tiket ini.");
       return;
     }
     ```
     Fungsi `getTicketByIdForStaff` di [`sharedTicketsStorage.ts`](file:///c:/Users/LENOVO/Desktop/Project-Zhou/fe-zhou/src/data/sharedTicketsStorage.ts#L786-L804) hanya mencari tiket di `localStorage` peramban staf. Karena tiket `ZHOU-CS-8198-5807` dibuat secara live di server VPS dan tidak tersimpan di `localStorage` admin tersebut, pengecekan gagal dan unduhan langsung dibatalkan.
  2. **Format URL Download Bukan Direct Signed URL:** Pada mapping tiket (baris 190 & 209), properti `downloadUrl` diisi dengan `d.file_path` (string relatif seperti `"documents/1729...pdf"`). Ketika FE memanggil `downloadRemoteFile(downloadUrl)`, peramban melakukan request `GET /dashboard/admin/documents/...` ke domain frontend yang berujung `HTTP 404 Not Found`.
  3. **Backend Tidak Mengembalikan `download_url` di Endpoint List:** Controller `admin.controller.ts` pada query `getConsultations` hanya menyertakan relasi `documents: true`, tanpa men-generate Supabase Signed Download URL untuk masing-masing dokumen.

---

### 3. Admin Tidak Bisa Mengubah Status Alur Pengerjaan (Milestones)
* **File Terkait:** [`fe-zhou/src/app/dashboard/admin/tugas/page.tsx`](file:///c:/Users/LENOVO/Desktop/Project-Zhou/fe-zhou/src/app/dashboard/admin/tugas/page.tsx#L494-L585)
* **Akar Masalah (Root Cause):**
  1. Pada fungsi `handleToggleMilestone(idx)`, FE hanya mengupdate state memori dan memanggil:
     ```typescript
     await adminApi.updateConsultationStatus(rawId, backendStatus);
     ```
     Endpoint ini (`PATCH /api/v1/admin/consultations/:id/status`) hanya menerima string status umum (`IN_PROGRESS` atau `COMPLETED`).
  2. Frontend **TIDAK PERNAH memanggil** `adminApi.updateTask(rawId, taskId, is_completed)` atau `adminApi.updateConsultation(rawId, { progress_percent })`.
  3. Akibatnya, checklist tahapan kerja di database (`project_tasks`) tetap `is_completed: false`. Begitu halaman direfresh atau dibuka kembali, backend mengembalikan status task lama sehingga centang alur kerja kembali seperti semula.

---

### 4. Status Alur Pengerjaan "Penetapan Konsultan PIC" Tidak Otomatis Terupdate Pasca-Penugasan
* **File Terkait:** [`be-zhou/src/controllers/admin.controller.ts`](file:///c:/Users/LENOVO/Desktop/Project-Zhou/be-zhou/src/controllers/admin.controller.ts#L715-L775)
* **Akar Masalah (Root Cause):**
  Di controller Backend `assignConsultationPic`:
  ```typescript
  const updated = await prisma.consultationProject.update({
    where: { id: projectId },
    data: { assigned_admin_id: targetAdminId },
  });
  ```
  Backend hanya mengisi kolom `assigned_admin_id`. Backend **lupa menambahkan logika trigger** untuk mencari task kedua ("Penetapan Konsultan PIC & Divisi Terkait") di tabel `project_tasks` dan mengupdate `is_completed: true` serta menaikkan `progress_percent` dari 15% menjadi minimal 35%-40%.

---

### 5. Hapus Kode Layanan pada CMS Bagian Layanan (Tidak Penting)
* **File Terkait:** [`fe-zhou/src/app/dashboard/superadmin/cms/page.tsx`](file:///c:/Users/LENOVO/Desktop/Project-Zhou/fe-zhou/src/app/dashboard/superadmin/cms/page.tsx#L3320-L3335)
* **Kebutuhan User:** Pengguna/Admin tidak memerlukan input kode manual (`service_code` seperti `TAX-CORE` atau `ACC-01`).
* **Akar Masalah:** Form modal input layanan saat ini mewajibkan kolom `service_code`. Jika dihapus dari form, backend `schema.prisma` memiliki constraint `@unique` pada kolom `service_code`.
* **Solusi:** Frontend menghapus input field tersebut dari form dan tabel, lalu secara otomatis meng-generate slug unik di latar belakang (misal `srv-${slugify(service_name)}`), atau Backend membuat kolom `service_code` opsional/auto-generated.

---

### 6. CMS Bagian Layanan: Item yang Dihapus Malah Tidak Terhapus dan Muncul Kembali
* **File Terkait:** [`be-zhou/src/controllers/cms.controller.ts:1085`](file:///c:/Users/LENOVO/Desktop/Project-Zhou/be-zhou/src/controllers/cms.controller.ts#L1085) & [`fe-zhou/src/data/layananStorage.ts:38-120`](file:///c:/Users/LENOVO/Desktop/Project-Zhou/fe-zhou/src/data/layananStorage.ts)
* **Akar Masalah (Root Cause):**
  1. **Foreign Key Constraint di PostgreSQL:** Pada tabel Prisma `consultations_projects`, terdapat relasi wajib `service_id` yang merujuk ke tabel `services` tanpa `onDelete: Cascade` atau `SetNull`. Jika layanan tersebut pernah dipilih oleh tiket konsultasi apapun (termasuk tiket seed/sample), PostgreSQL menolak penghapusan dengan error `P2003: Foreign key constraint failed`.
  2. **Error Swallowing di Frontend:** Frontend menangkap error dengan `catch (apiErr) { console.warn(...) }` tanpa menampilkan peringatan bahwa backend menolak penghapusan.
  3. **Fallback Hardcoded Data (`DEFAULT_SERVICES`):** Di file `layananStorage.ts`, terdapat 4 layanan bawaan (`SVC-4798`, `SVC-5021`, `SVC-6034`, `SVC-7182`). Setiap kali FE memuat data, layanan ini digabungkan kembali (*merged*) ke dalam state jika tombstone lokal belum terekam.

---

### 7. CMS Edukasi Pajak: Foto Belum Menggunakan Foto yang Diupload Superadmin (Masih Template)
* **File Terkait:** [`fe-zhou/src/app/dashboard/superadmin/cms/page.tsx:1188`](file:///c:/Users/LENOVO/Desktop/Project-Zhou/fe-zhou/src/app/dashboard/superadmin/cms/page.tsx#L1188) & [`be-zhou/src/controllers/cms.controller.ts:490-535`](file:///c:/Users/LENOVO/Desktop/Project-Zhou/be-zhou/src/controllers/cms.controller.ts#L490-L535)
* **Akar Masalah (Root Cause) Kritis:**
  1. **Field Name Mismatch:** Di Frontend (`cms/page.tsx`), gambar sampul dikirimkan dengan key:
     ```typescript
     image: eduForm.image // Base64 dataUrl
     ```
  2. Sementara di Backend Controller (`createEducation` & `updateEducation`):
     ```typescript
     let { title, category, content_type, body: contentBody, file_path, image_url } = body;
     if (!image_url && (body.photo_url || body.imageUrl || body.cover_image)) {
       image_url = body.photo_url || body.imageUrl || body.cover_image;
     }
     ```
     Backend **hanya memeriksa `image_url`, `photo_url`, `imageUrl`, dan `cover_image`**, dan **TIDAK MEMERIKSA `body.image`**!
  3. Karena `image_url` bernilai `undefined`, Backend mengeksekusi fallback bawaan baris 534:
     ```typescript
     image_url: image_url || getEducationDefaultCover(category, Date.now())
     ```
     Fungsi `getEducationDefaultCover` selalu mengembalikan tautan gambar Unsplash template. Foto asli dari Superadmin diabaikan!

---

### 8. CMS Edukasi Pajak: Fitur Unduh File Belum Bisa Mendownload File yang Diupload User
* **File Terkait:** [`fe-zhou/src/app/dashboard/superadmin/cms/page.tsx:371-376`](file:///c:/Users/LENOVO/Desktop/Project-Zhou/fe-zhou/src/app/dashboard/superadmin/cms/page.tsx#L371-L376) & [`fe-zhou/src/app/edukasi/page.tsx:518-555`](file:///c:/Users/LENOVO/Desktop/Project-Zhou/fe-zhou/src/app/edukasi/page.tsx#L518-L555)
* **Akar Masalah (Root Cause) Kritis:**
  1. **File Biner Fisik Tidak Diunggah ke Server:** Saat Superadmin memilih file PDF di form Edukasi (`handleEduPdfUpload`), FE hanya mencatat string statis palsu:
     ```typescript
     setEduForm((prev) => ({
       ...prev,
       file_path: `/docs/${file.name}`, // Hanya string teks tiruan!
     }));
     ```
     File fisik PDF tersebut **tidak pernah dikirim via FormData ke Supabase Storage**.
  2. **Browser Gagal Fetch File Tiruan:** Saat pengunjung di halaman publik `/edukasi` mengklik tombol "Unduh PDF", browser mencoba mengakses URL `/docs/nama-file.pdf`. Karena file tidak ada di server VPS/Next.js (atau bentrok dengan rute API docs `/docs`), request menghasilkan `404 Not Found`.
  3. **Fallback Sintetis:** Karena fetch gagal, sistem terpaksa membuat file canvas PDF palsu darurat di peramban pengguna.

---

### 9. Bagian Karir di Landing Page: Masih Ada Mock Data yang Nyangkut (Di Superadmin Tidak Ada)
* **File Terkait:** [`fe-zhou/src/components/landing/CareerSection.tsx:87-130`](file:///c:/Users/LENOVO/Desktop/Project-Zhou/fe-zhou/src/components/landing/CareerSection.tsx#L87-L130) & [`be-zhou/prisma/seed.ts:220-252`](file:///c:/Users/LENOVO/Desktop/Project-Zhou/be-zhou/prisma/seed.ts#L220-L252)
* **Akar Masalah (Root Cause):**
  1. **Seeding Database Live:** Saat deployment production, skrip seed backend memasukkan 2 lowongan default:
     * `JOB-TAX-SR-01`: "Senior Tax Consultant"
     * `JOB-ACC-JR-01`: "Junior Accounting Staff"
  2. **Tombstone Hapus Bersifat In-Memory:** Ketika Superadmin mengklik "Hapus" pada CMS Karir, FE menyimpannya di variabel memori browser admin (`memoryDeletedItems`). Di layar admin tersebut, lowongan memang hilang.
  3. Namun, request `DELETE /api/v1/admin/cms/careers/:id` ke database backend gagal atau lowongan di database server PostgreSQL tidak terhapus.
  4. Pengunjung publik yang membuka Landing Page tidak memiliki memori tombstone admin tersebut. Komponen `CareerSection` memanggil `GET /api/v1/public/careers` yang membaca langsung dari PostgreSQL, sehingga kedua lowongan bawaan seed tersebut tetap tampil!

---

## 3. Matriks Pembagian Tugas Frontend (`fe-zhou`) & Backend (`be-zhou`)

Berikut adalah pembagian tugas teknis terinci untuk kedua tim developer:

| No | Modul / Isu | Tugas Tim Frontend (`fe-zhou`) | Tugas Tim Backend (`be-zhou`) |
|:---:|:---|:---|:---|
| **1** | **Penggantian Logo** | 1. Siapkan aset logo baru di folder `public/images/`.<br>2. Perbarui seluruh import di `Navbar`, `Footer`, `Sidebar` (Admin, Superadmin, User), auth screens (`login`, `register`), dan metadata favicon di `layout.tsx`. | Tidak ada perubahan kode (cukup pastikan server Nginx menyajikan aset statis dengan benar). |
| **2** | **Download File Lembar Kerja Admin** | 1. Hapus pengecekan otorisasi lokal `getTicketByIdForStaff` di `admin/tugas/page.tsx:601`.<br>2. Ubah `handleDownloadClientDoc` agar selalu memanggil endpoint signed URL backend: `clientApi.getDownloadUrl(docId)` atau `adminApi.getConsultationDocumentDownloadUrl(docId)`.<br>3. Pastikan `downloadUrl` yang diterima dari API langsung dioper ke helper unduh browser. | 1. Pastikan endpoint `GET /api/v1/client/documents/:id/download` dapat diakses oleh peran `ADMIN` dan `SUPERADMIN` tanpa memblokir `client_id`.<br>2. Pada query `getConsultations` di `admin.controller.ts`, sertakan signed download URL dari Supabase untuk setiap file di relasi `documents`. |
| **3** | **Ubah Status Alur Pengerjaan (Milestones)** | 1. Di `admin/tugas/page.tsx:550`, saat admin mencentang tahapan kerja, panggil API backend riil:<br>`adminApi.updateTask(ticketId, taskId, is_completed)` dan `adminApi.updateConsultation(ticketId, { progress_percent })`.<br>2. Hilangkan ketergantungan pada `updateStoredClientTicketProgress` lokal. | 1. Pastikan endpoint `PATCH /api/v1/admin/consultations/:id/tasks/:taskId` berfungsi normal dan memutasi status task di tabel `project_tasks`.<br>2. Buat endpoint batch update jika ingin mengupdate seluruh tahapan pengerjaan sekaligus. |
| **4** | **Auto-Update Alur PIC Pasca-Assign Superadmin** | 1. Pada modal penetapan PIC di `superadmin/perikatan/page.tsx`, setelah sukses panggil `assignConsultationPic`, refresh data tiket agar task milestone terupdate.<br>2. Pastikan stepper progress menampilkan checklist hijau pada poin nomor 2. | Di controller `admin.controller.ts` fungsi `assignConsultationPic`:<br>1. Setelah update `assigned_admin_id`, tambahkan query Prisma untuk menandai task nomor 2 ("Penetapan Konsultan PIC & Divisi Terkait") menjadi `is_completed: true`.<br>2. Naikkan `progress_percent` tiket menjadi minimal `35%` atau `40%`. |
| **5** | **Hapus Kode Layanan di CMS Layanan** | 1. Hapus input field `service_code` dari modal form create/edit layanan di `superadmin/cms/page.tsx:3320-3335`.<br>2. Hapus kolom/badge "Kode Layanan" dari tabel tampilan CMS.<br>3. Buat helper auto-generate kode unik di latar belakang saat payload dikirim ke API: `slugify(service_name)`. | 1. Di controller `cms.controller.ts` fungsi `createService`, buat kolom `service_code` opsional atau otomatis dibuat dari `slugify(service_name)` jika kosong.<br>2. Pastikan validasi Zod schema tidak menolak request tanpa `service_code`. |
| **6** | **Hapus CMS Layanan Kembali Lagi (Perbaikan Hapus)** | 1. Tampilkan pesan error transparan jika backend menolak penghapusan layanan (jangan di-*swallow* di catch).<br>2. Bersihkan `DEFAULT_SERVICES` dari `layananStorage.ts` agar tidak menginjeksi mock data layanan lama.<br>3. Validasi bahwa ID yang dikirim ke API adalah numeric ID asli dari database. | 1. Di controller `deleteService`, tangani dependensi tiket perikatan: jika layanan memiliki relasi dengan `consultations_projects`, lakukan *soft delete* (`is_active: false`) atau pindahkan relasi tiket ke *fallback general service* sebelum menghapus.<br>2. Kembalikan error 400 informatif jika layanan tidak bisa dihapus karena masih memiliki tiket aktif. |
| **7** | **Foto Edukasi Pajak Sesuai Upload Superadmin** | 1. Di `superadmin/cms/page.tsx:1188`, selaraskan nama field pengiriman foto. Kirimkan via `image_url` atau `photo_url` (atau kirim berkas biner asli via `FormData`).<br>2. Tampilkan preview gambar asli yang diunggah di kartu CMS dan modal preview artikel. | 1. Di controller `createEducation` dan `updateEducation` di `cms.controller.ts`, tambahkan pengecekan `body.image`: <br>`image_url = body.image_url \|\| body.photo_url \|\| body.image;`<br>2. Jika menerima base64 dataUrl, simpan file ke Supabase Storage bucket `education` dan simpan public URL-nya ke PostgreSQL. |
| **8** | **Fitur Unduh File Modul Edukasi Pajak** | 1. Ubah form lampiran PDF edukasi di `superadmin/cms/page.tsx`: unggah file biner fisik ke endpoint upload backend `/api/v1/public/upload` atau kirimkan via `FormData` langsung ke `createEducation`.<br>2. Pada `edukasi/page.tsx`, ubah tombol download agar memanggil endpoint backend `publicApi.getEducationDownloadUrl(id)` untuk mendapatkan signed download URL resmi dari Supabase. | 1. Pastikan endpoint `POST /api/v1/admin/cms/education` dan `PUT /api/v1/admin/cms/education/:id` menerima file PDF fisik melalui `flexibleUploadMiddleware` dan mengunggahnya ke bucket `education` di Supabase Storage.<br>2. Rekam path storage asli ke kolom `file_path`. |
| **9** | **Pembersihan Mock Data Karir di Landing Page** | 1. Di `CareerSection.tsx`, pastikan pemuatan data karir 100% hanya membaca respons dari `publicApi.getCareers()`.<br>2. Pastikan tombol hapus di CMS Karir Superadmin memanggil `adminCmsApi.deleteCareer(id)` dan me-refresh daftar secara riil dari database. | 1. Masuk ke database server PostgreSQL via VPS / psql / Supabase Studio dan hapus record data lowongan lama hasil seeding (`JOB-TAX-SR-01` dan `JOB-ACC-JR-01`) jika posisi tersebut memang belum dibuka.<br>2. Pastikan controller `deleteCareer` menangani cascade delete pada tabel relasi `job_applications` jika ada pelamar uji coba. |

---

## 4. Laporan Khusus: Audit Modul CMS yang Tidak Berfungsi Normal

Sesuai permintaan evaluasi menyeluruh (*"cek mana saja cms yang tidak bekerja dengan normal dan laporkan"*), berikut adalah hasil audit mendalam pada seluruh tab CMS Superadmin:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       STATUS FUNGSIONALITAS MODUL CMS                       │
├──────────────────────┬─────────────┬────────────────────────────────────────┤
│ Modul CMS            │ Status      │ Kendala Utama yang Ditemukan           │
├──────────────────────┼─────────────┼────────────────────────────────────────┤
│ 1. CMS Layanan       │ ⚠️ Parsial  │ Hapus gagal (Foreign Key DB);          │
│                      │             │ Kode layanan membingungkan admin;      │
│                      │             │ Workflow & deliverable belum tersimpan.│
├──────────────────────┼─────────────┼────────────────────────────────────────┤
│ 2. CMS Edukasi       │ ❌ Rusak    │ Foto sampul tertimpa template Unsplash;│
│                      │             │ Unduh PDF gagal (file fisik tak ada).  │
├──────────────────────┼─────────────┼────────────────────────────────────────┤
│ 3. CMS Regulasi      │ ⚠️ Parsial  │ Berkas PDF tidak terupload ke Supabase;│
│                      │             │ Kolom doc_number & year belum ada di DB│
├──────────────────────┼─────────────┼────────────────────────────────────────┤
│ 4. CMS Karir         │ ⚠️ Parsial  │ Hapus hanya semu di browser admin;     │
│                      │             │ Data landing page beda dengan CMS.     │
├──────────────────────┼─────────────┼────────────────────────────────────────┤
│ 5. CMS Kurs Pajak    │ ⚠️ Parsial  │ Form hanya simpan 1 valas per request; │
│                      │             │ Belum ada batch sync KMK resmi Kemenkeu│
├──────────────────────┼─────────────┼────────────────────────────────────────┤
│ 6. CMS Profil & Visi │ ✅ Normal   │ Tersimpan baik ke `company_profiles`.  │
├──────────────────────┼─────────────┼────────────────────────────────────────┤
│ 7. CMS Kontak / CS   │ ✅ Normal   │ Tersimpan baik ke `site_settings`.     │
├──────────────────────┼─────────────┼────────────────────────────────────────┤
│ 8. CMS FAQ Chatbot   │ ✅ Normal   │ CRUD tersimpan ke `chatbot_faqs`.      │
└──────────────────────┴─────────────┴────────────────────────────────────────┘
```

### Rincian Masalah Modul CMS Lainnya:

#### A. CMS Regulasi Perpajakan
* **Isu:** Mirip dengan modul edukasi, fungsi upload berkas PDF regulasi di frontend (`handleRegPdfUpload`) membaca file sebagai Data URL dan mencatat `file_path: "/docs/nama-file.pdf"`.
* **Dampak:** Pengunjung yang membuka halaman publik `/peraturan` tidak dapat mengunduh salinan berkas PDF resmi regulasi dari server, melainkan menerima PDF buatan browser.
* **Tindakan:** Kirimkan file PDF regulasi via `FormData` ke endpoint `/api/v1/admin/cms/regulations` agar tersimpan permanen di folder `regulations` Supabase Storage.

#### B. CMS Kurs Pajak (Tax Rates)
* **Isu:** Frontend memiliki fitur otomatis membaca seluruh 10–25 valuta asing dari BKF Kemenkeu. Namun endpoint backend `POST /api/v1/admin/cms/tax-rates` hanya dapat memproses 1 mata uang per pemanggilan HTTP dan tidak menyimpan metadata Nomor KMK.
* **Tindakan:** Tambahkan endpoint `POST /api/v1/admin/cms/tax-rates/batch` di backend yang menerima array valas dan string nomor KMK sekaligus.

---

## 5. Action Checklist & Timeline Implementasi

Untuk memastikan perbaikan selesai dengan teratur dan tervalidasi, berikut urutan eksekusi yang direkomendasikan:

### Tahap 1: Backend Fixes & Database Cleanup (Hari 1)
- [ ] **BE-01:** Di `admin.controller.ts`, perbaiki `assignConsultationPic` agar otomatis mencentang task milestone #2 menjadi `is_completed: true` dan menaikkan progress.
- [ ] **BE-02:** Di `client.controller.ts` & `admin.controller.ts`, pastikan endpoint unduh dokumen klien dapat diakses oleh Admin penanggung jawab dan mengembalikan Supabase Signed URL aktif.
- [ ] **BE-03:** Di `cms.controller.ts`, perbaiki `createEducation` dan `updateEducation` agar menerima key `body.image` dan mengunggahnya ke Supabase Storage.
- [ ] **BE-04:** Di `cms.controller.ts`, perbaiki fungsi `deleteService` dan `deleteCareer` agar menangani relasi foreign key tanpa crash 500.
- [ ] **BE-05:** Di database server VPS, bersihkan record lowongan karir dummy/seed lama (`JOB-TAX-SR-01` dan `JOB-ACC-JR-01`).

### Tahap 2: Frontend Refactoring & Integration (Hari 2)
- [x] **FE-01:** Pada `admin/tugas/page.tsx`, hilangkan pengecekan otorisasi `localStorage` dan sambungkan tombol unduh berkas langsung ke signed URL backend.
- [x] **FE-02:** Pada `admin/tugas/page.tsx`, sambungkan toggle milestone ke endpoint `adminApi.updateTask` dan `adminApi.updateConsultation`.
- [x] **FE-03:** Pada `superadmin/cms/page.tsx`, hapus field input dan kolom tabel "Kode Layanan" di tab Layanan CMS.
- [x] **FE-04:** Pada `superadmin/cms/page.tsx`, sesuaikan form upload Edukasi & Regulasi agar menyimpan foto asli superadmin dan berkas fisik ke database backend.
- [x] **FE-05:** Pada `edukasi/page.tsx` & `EducationSection.tsx`, bersihkan gambar otomatis/template Unsplash dan tampilkan secara presisi foto asli yang diupload superadmin.
- [x] **FE-06:** Pada `CareerSection.tsx`, bersihkan fallback mock data dan pastikan hanya merender lowongan yang aktif di database backend.

### Tahap 3: Brand Asset Update & UAT Final (Hari 3)
- [ ] **FE-07:** Segera setelah logo baru diterima dari user, gantikan file di `fe-zhou/public/images/` dan perbarui seluruh komponen terkait.
- [ ] **QA/PM:** Lakukan pengujian end-to-end (UAT) di portal produksi `https://www.zhouconsulting.id` menggunakan akun admin, superadmin, dan pengunjung publik.

---
*Dokumen ini diterbitkan oleh Project Manager sebagai pedoman resmi perbaikan sprint post-deploy Zhou Consulting.*
