# 📋 LAPORAN TEKNIS PM: INVESTIGASI BUG INFINITE LOOP & NETWORK SOCKET EXHAUSTION PADA LEMBAR KERJA ADMIN

**Proyek:** Zhou Consulting Platform  
**Disusun Oleh:** Project Manager (Technical Investigation & Incident Root Cause Report)  
**Tanggal:** 27 Oktober 2026  
**Klasifikasi:** Critical Bug / Infinite Re-render Loop & Network Exhaustion  
**Prioritas:** 🔴 **P0 (Critical / Blocker)** - Halaman tidak dapat diakses dan melumpuhkan browser klien  
**Target Tim:** Frontend Developer (`fe-zhou`) & Backend Developer (`be-zhou`)  
**Modul Terdampak:** Lembar Kerja Admin / Tugas Saya (`/dashboard/admin/tugas`)  

---

## 1. Ringkasan Eksekutif & Log Error Lapangan

Saat pengguna dengan role **Admin** membuka halaman **Lembar Kerja Admin / Tugas Saya** (`/dashboard/admin/tugas`), aplikasi mengalami degradasi performa ekstrem:
1. **Layar Berkedip (*Flickering*):** Tampilan halaman terus menerus berkedip antara kondisi *skeleton loading* dan *render* data puluhan kali per detik.
2. **Lonjakan Konsumsi Sumber Daya (*Browser Hang*):** Tab browser mengalami *high CPU usage* dan memori melonjak hingga akhirnya *freeze* atau harus di-force close.
3. **Banjir Log Error pada Konsol:** Ratusan request HTTP gagal secara masif dengan log sebagai berikut:

```text
API Error on [/api/v1/admin/consultations] after 3 attempt(s): 
API Error on [/api/v1/admin/consultations/19/tasks/9] after 1 attempt(s): 
consultations:1  Failed to load resource: net::ERR_INSUFFICIENT_RESOURCES
9:1              Failed to load resource: net::ERR_INSUFFICIENT_RESOURCES
```

---

## 2. Alur Terjadinya Masalah (Architecture & Loop Diagram)

```mermaid
flowchart TD
    subgraph UI ["Komponen React (admin/tugas/page.tsx)"]
        A["Component Mounts"] --> B["loadData() Dijalankan"]
        B --> C["setIsLoading(true)"]
        B --> D["setStaffList(getStoredStaffAdmins())"]
        D -->|JSON.parse buat Array Baru| E["State staffList Menerima Referensi Baru"]
        E --> F["useMemo(activeStaffProfile) Dihitung Ulang"]
        F -->|Objek Profil Baru| G["useCallback(loadData) Berubah Referensi"]
        G --> H["useEffect([loadData]) Terpicu Ulang"]
        H -->|🔁 LOOPING TANPA HENTI| B
    end

    subgraph NetworkAvalanche ["Banjir Request Jaringan (Ratusan Req/Detik)"]
        B --> I["adminApi.getConsultations() -> GET /api/v1/admin/consultations"]
        B --> J["Mapping Tasks: Deteksi Milestone 2 PIC Belum Selesai"]
        J --> K["adminApi.updateTask(19, 9, true) -> PATCH /api/v1/admin/consultations/19/tasks/9"]
    end

    subgraph BrowserLimit ["Batas Resource Browser (Chrome Socket Pool)"]
        I & K --> L{"Antrean Socket Jaringan Penuh?"}
        L -->|Ya (Queue Overwhelmed)| M["🔴 net::ERR_INSUFFICIENT_RESOURCES"]
        M --> N["apiFetch: Retry GET 2x -> Gagal Total (3 attempts)"]
        M --> O["apiFetch: Gagal Eksekusi PATCH (1 attempt)"]
    end
```

---

## 3. Analisis Mendalam Akar Masalah (Root Causes)

### A. Akar Masalah Utama: *Cyclic State Dependency* pada Hook React
Terjadi ketergantungan melingkar (*infinite re-render loop*) di dalam file [`fe-zhou/src/app/dashboard/admin/tugas/page.tsx`](file:///c:/Users/LENOVO/Desktop/Project-Zhou/fe-zhou/src/app/dashboard/admin/tugas/page.tsx):

1. **State Setter di dalam Callback `loadData` (Baris 130–133):**
   ```typescript
   const loadData = React.useCallback(async () => {
     setIsLoading(true);
     const staff = getStoredStaffAdmins();
     setStaffList(staff); // ⚠️ Pemicu awal: setStaffList dipanggil di setiap siklus
     ...
   ```
   Fungsi `getStoredStaffAdmins()` membaca data dari `localStorage` melalui `JSON.parse()`. Operasi ini **selalu menghasilkan instance Array baru di memori** (`staff !== prevStaff`). Pemanggilan `setStaffList(staff)` memicu React untuk menjadwalkan render ulang.

2. **`useMemo` Membentuk Objek Baru (Baris 113–126):**
   ```typescript
   const activeStaffProfile = useMemo(() => {
     return (
       staffList.find((s) => s.email.toLowerCase() === activeAdminEmail.toLowerCase()) || {
         id: "ADM-001",
         name: user?.name || "Linda David, S.Ak., BKP",
         email: activeAdminEmail,
         ...
       }
     );
   }, [staffList, activeAdminEmail, user?.name]);
   ```
   Karena `staffList` berubah referensi, `activeStaffProfile` dievaluasi ulang dan menghasilkan referensi objek baru.

3. **`useCallback` Terus Dibuat Ulang (Baris 351):**
   ```typescript
   }, [activeAdminEmail, user?.name, normalizedUserRole, activeStaffProfile]);
   ```
   Karena `activeStaffProfile` dimasukkan ke dalam dependency array `loadData`, setiap kali `activeStaffProfile` menghasilkan objek baru, referensi fungsi `loadData` ikut berganti.

4. **`useEffect` Berjalan Tanpa Henti (Baris 353–355):**
   ```typescript
   useEffect(() => {
     loadData();
   }, [loadData]);
   ```
   Karena referensi `loadData` baru di setiap render, `useEffect` langsung mengeksekusi `loadData()` kembali. Terciptalah siklus tanpa akhir (*infinite loop*).

5. **Penyebab Tampilan Berkedip (*Flickering*):**
   `loadData()` memanggil `setIsLoading(true)` di awal dan `setIsLoading(false)` di blok `finally`. Pergantian status boolean ini berulang-ulang puluhan kali per detik menyebabkan komponen bertransisi antara tampilan skeleton dan konten secara liar.

---

### B. Akar Masalah Sekunder: *Side-Effect* Mutasi API di dalam Fungsi Query
Pada baris 181–185 di file [`fe-zhou/src/app/dashboard/admin/tugas/page.tsx`](file:///c:/Users/LENOVO/Desktop/Project-Zhou/fe-zhou/src/app/dashboard/admin/tugas/page.tsx):

```typescript
const isPicTask = getMilestoneRank(task.task_name) === 2 || task.task_name.toLowerCase().includes("pic");
const isTaskDone = Boolean(task.is_completed || (isPicTask && hasAssignedPic));

// Otomatis sinkronkan status selesai ke backend database jika belum tercatat
if (isPicTask && hasAssignedPic && !task.is_completed && c.id) {
  adminApi.updateTask(c.id, task.id, true).catch(() => {});
}
```

* **Penjelasan:** Pada tiket perikatan ID `19`, task ID `9` adalah checklist Milestone ke-2 ("Penetapan PIC"). Tiket tersebut sudah memiliki PIC, namun field `is_completed` di database belum bernilai `true`.
* **Dampak:** Karena `loadData` mengalami *infinite loop*, baris di atas dieksekusi terus menerus dan menembakkan ratusan request `PATCH /api/v1/admin/consultations/19/tasks/9` secara paralel dan tanpa henti.
* Ini adalah *anti-pattern* fatal: **Fungsi pembacaan data (query/read) tidak boleh mengeksekusi mutasi (update/write) langsung di dalam mapping loop tanpa pembatas (*guard flag*)**.

---

### C. Mengapa Muncul `net::ERR_INSUFFICIENT_RESOURCES`?
* Setiap peramban web (Chromium/Chrome) memiliki kuota soket jaringan terbatas (maksimal 6 koneksi HTTP paralel per host, serta batasan total antrean soket OS).
* Ketika puluhan request `GET /api/v1/admin/consultations` dan `PATCH /api/v1/admin/consultations/19/tasks/9` dipompa dalam hitungan detik, antrean soket browser langsung habis (*socket pool exhaustion*).
* Browser langsung menolak request baru sebelum sempat dikirim ke jaringan dengan pesan:
  `Failed to load resource: net::ERR_INSUFFICIENT_RESOURCES`
* Modul `apiFetch` pada [`fe-zhou/src/lib/api.ts`](file:///c:/Users/LENOVO/Desktop/Project-Zhou/fe-zhou/src/lib/api.ts#L138-L180) mengonfigurasi retry otomatis 2 kali untuk metode `GET` (total 3 attempts). Karena jaringan browser macet total, seluruh percobaan gagal dan mencetak error beruntun di konsol.

---

## 4. Matriks Dampak & Risiko (Impact Assessment)

| Aspek | Tingkat Keparahan | Deskripsi Dampak |
| :--- | :---: | :--- |
| **Ketersediaan Fitur (Availability)** | **Critical** | Admin tidak dapat membuka lembar kerja tugas konsultasi sama sekali. Halaman terkunci dan tidak responsif. |
| **Klien / Browser Resource** | **Critical** | CPU *throttling*, konsumsi RAM membengkak, dan browser tab *crash* / tidak dapat ditutup secara normal. |
| **Beban Server Backend** | **High** | Backend Node.js / Prisma menerima ratusan request tidak terkontrol per detik (menyerupai serangan *Self-Inflicted DDoS*). Berisiko menghabiskan connection pool PostgreSQL. |
| **Integritas Data** | **Medium** | Potensi *race condition* pada saat penentuan persentase progres tiket akibat request update task beruntun. |

---

## 5. Rencana Tindakan Teknis untuk Tim Developer (Actionable Fixes)

Tim Developer dapat menyelesaikan permasalahan ini secara tuntas dengan 2 langkah refactoring berikut:

### Tindakan 1: Stabilkan Siklus `loadData` & Putus Ketergantungan State
Pisahkan pembacaan `getStoredStaffAdmins()` dari siklus `loadData`, dan hilangkan objek `activeStaffProfile` dari dependency array `loadData`:

```diff
--- a/fe-zhou/src/app/dashboard/admin/tugas/page.tsx
+++ b/fe-zhou/src/app/dashboard/admin/tugas/page.tsx
@@ -60,1 +60,3 @@
-  const [staffList, setStaffList] = useState<StaffAdminProfile[]>([]);
+  // Inisialisasi daftar staf admin lokal hanya satu kali saat mount
+  const [staffList, setStaffList] = useState<StaffAdminProfile[]>(() => 
+    typeof window !== "undefined" ? getStoredStaffAdmins() : []
+  );
@@ -130,4 +132,1 @@
   const loadData = React.useCallback(async () => {
     setIsLoading(true);
-    const staff = getStoredStaffAdmins();
-    setStaffList(staff);
```

Dan gunakan referensi identitas primitif yang stabil (seperti `activeAdminEmail` atau `user?.id`) alih-alih objek `activeStaffProfile` pada dependency `loadData`:

```diff
@@ -350,2 +350,2 @@
     }
-  }, [activeAdminEmail, user?.name, normalizedUserRole, activeStaffProfile]);
+  }, [activeAdminEmail, user?.name, normalizedUserRole]);
```

*(Catatan: Referensi implementasi yang sudah terbukti aman dan stabil dapat dilihat pada [`fe-zhou/src/app/dashboard/admin/page.tsx`](file:///c:/Users/LENOVO/Desktop/Project-Zhou/fe-zhou/src/app/dashboard/admin/page.tsx#L53-L60) dan [`superadmin/perikatan/page.tsx`](file:///c:/Users/LENOVO/Desktop/Project-Zhou/fe-zhou/src/app/dashboard/superadmin/perikatan/page.tsx#L266).)*

---

### Tindakan 2: Hapus Mutasi `adminApi.updateTask` dari Siklus Query
Hapus pemanggilan `updateTask` otomatis di dalam mapping:

```diff
--- a/fe-zhou/src/app/dashboard/admin/tugas/page.tsx
+++ b/fe-zhou/src/app/dashboard/admin/tugas/page.tsx
@@ -181,4 +181,0 @@
-                // Otomatis sinkronkan status selesai ke backend database jika belum tercatat
-                if (isPicTask && hasAssignedPic && !task.is_completed && c.id) {
-                  adminApi.updateTask(c.id, task.id, true).catch(() => {});
-                }
```

* **Penjelasan:** Status penyelesaian Milestone "Penetapan PIC" sudah seharusnya ditandai `is_completed = true` secara otomatis di sisi backend pada controller penugasan PIC (`assignConsultationAdmin` di `be-zhou`), bukan ditebak dan di-patch berulang kali oleh frontend.

---

## 6. Verifikasi & Pengujian Pasca-Perbaikan (QA Acceptance Criteria)

Setelah developer menerapkan perbaikan, lakukan pengujian berikut:

1. **Test Case 1 (Single Fetch):**
   * Buka halaman `/dashboard/admin/tugas`.
   * Periksa tab Network di DevTools: Endpoint `GET /api/v1/admin/consultations` hanya boleh dipanggil **1 kali** saat halaman pertama kali dimuat.
2. **Test Case 2 (No Net Errors):**
   * Tidak boleh ada satupun pesan `net::ERR_INSUFFICIENT_RESOURCES` atau `API Error after 3 attempt(s)`.
3. **Test Case 3 (UI Stability):**
   * Halaman tidak boleh berkedip (*flicker*). Indikator loading muncul sekali, kemudian langsung menampilkan daftar penugasan secara statis.
4. **Test Case 4 (Direct URL Access):**
   * Akses URL dengan parameter spesifik: `/dashboard/admin/tugas?id=19` atau `/dashboard/admin/tugas?id=TK-19`.
   * Modal/drawer lembar kerja perikatan 19 terbuka normal tanpa memicu *request avalanche*.

---

**Status Dokumen:** Siap Ditindaklanjuti oleh Tim Teknis (Ready for Development & QA).
