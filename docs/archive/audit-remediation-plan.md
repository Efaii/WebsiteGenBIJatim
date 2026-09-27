# Rencana Remediasi Audit Teknis Website GenBI Jatim

Dokumen ini berisi rencana remediasi dan refactoring komprehensif berdasarkan hasil audit teknis sistem website GenBI Jatim (Monorepo Node.js/Express + Next.js 16 + Prisma MySQL).

---

## 1. Goal & Sasaran Utama

- **Stabilitas & Robustness**: Menghilangkan kegagalan silent-fail, menjamin fallback API-to-Mock yang aman, dan menangani error secara eksplisit.
- **Konsistensi Arsitektur**: Menyamakan standar API response format (`{ success: true, data, message }`), pemisahan controller-service di backend, serta struktur data service di frontend.
- **Integritas Database & Data Seed**: Menjamin sinkronisasi relasi data antara `Commissariat` dan `ProgramKerja`, penanganan transaksi yang atomic saat import data Excel, dan sinkronisasi path gambar.
- **Kesiapan Production**: Memastikan konfigurasi Next.js, image loader, CORS, serta middleware autentikasi dan validasi request aman dan efisien.

---

## 2. Arsitektur Perbaikan

```
[ Frontend (apps/web) ]
    │
    ├── lib/services/ (Dynamic Fetcher with Type Fallbacks)
    └── components/ (Strict UI state handling: Loading/Error/Empty)
            │
            ▼ (HTTP / CORS)
[ Backend (apps/api) ]
    │
    ├── routes/ (Validation Middleware -> Controller)
    ├── controllers/ (Request extraction -> Call Service -> Format Response)
    ├── services/ (Business Logic & Prisma Client Query)
    └── scripts/ (Atomic Excel Data Importer & Image Processor)
            │
            ▼
[ Database (MySQL via Prisma ORM) ]
```

---

## 3. Map File Terdampak

### Backend (`apps/api/`)
- `src/controllers/commissariat.controller.ts`
- `src/controllers/news.controller.ts`
- `src/controllers/testimonial.controller.ts`
- `src/routes/commissariat.route.ts`
- `src/scripts/import.ts`
- `src/scripts/process_images.ts`
- `prisma/schema.prisma`

### Frontend (`apps/web/`)
- `lib/services/program.service.ts`
- `lib/services/commissariat.service.ts`
- `app/program/page.tsx`
- `app/program/[id]/page.tsx`
- `app/komisariat/[slug]/page.tsx`
- `next.config.ts`

---

## 4. Fase Eksekusi (Fase 0 - 6)

### Fase 0: Bootstrap & Fondasi Lingkungan Dev
- Pastikan koneksi database Laragon (`mysql://root:@localhost:3306/genbi_jatim`) berfungsi.
- Eksekusi `npx prisma generate` dan `npx prisma db push` pada backend.
- Verifikasi endpoint `GET /health` mengembalikan status HTTP 200.

### Fase 1: Perapihan Schema & Database Importer
- **Prisma Schema**: Pastikan indeks relasi antara `Commissariat` dan `ProgramKerja` menggunakan kaskade yang sesuai.
- **Import Script (`src/scripts/import.ts`)**: Bungkus proses *wipe and reload* dalam Prisma Transaction (`$transaction`) agar bersifat atomik dan mencegah *partial data loss* saat terjadi error parsing.

### Fase 2: Standardisasi Response & Routing Backend
- Perbaiki urutan pendaftaran endpoint pada `commissariat.route.ts`: daftarkan route statis (`/proker`) sebelum route dinamis (`/proker/:id` dan `:slug`).
- Kembalikan format JSON respons yang konsisten:
  ```json
  {
    "success": true,
    "data": [],
    "message": "Data retrieved successfully"
  }
  ```

### Fase 3: Hardening Service Layer Frontend
- Refactor `program.service.ts` dan `commissariat.service.ts` agar menangani timeout, kegagalan network, dan format data non-200 tanpa menyebabkan crash aplikasi.
- Sediakan fallback data mock secara aman saat API backend luring.

### Fase 4: Perbaikan UI/UX Components & Pages
- Tangani state *Loading*, *Error*, dan *Empty State* secara lugas pada `app/program/page.tsx`, `app/program/[id]/page.tsx`, dan `app/komisariat/[slug]/page.tsx`.
- Cegah masalah hydratasi React 19 akibat render data dinamis/tanggal.

### Fase 5: Media & Image Pipeline
- Validasi skrip `process_images.ts` agar menyelaraskan nama folder proker dengan slug komisariat.
- Sesuaikan `next.config.ts` agar mengizinkan `remotePatterns` dari backend (`localhost:5000` dan domain staging/production).

### Fase 6: Verifikasi Akhir & Integration Smoke Testing
- Jalankan pemeriksaan endpoint backend (`GET /health`, `GET /api/commissariats/proker`).
- Lakukan pengujian navigasi frontend dari halaman utama hingga ke detail program kerja.

---

## 5. Dependency & Lane Implementasi

1. **Lane 1 (Database & Backend Data)**: Dependensi 0 -> Dependensi Fase 1 -> Dependensi Fase 2.
2. **Lane 2 (Frontend Services & Web App)**: Bergantung pada stabilitas API Response dari Fase 2 -> Fase 3 -> Fase 4.
3. **Lane 3 (Asset Pipeline & Config)**: Dapat berjalan independen -> Fase 5.
4. **Lane 4 (Testing & Sign-off)**: Bergantung pada selesainya Fase 1-5 -> Fase 6.

---

## 6. Checklist Penerimaan (Acceptance Criteria)

- [ ] `GET /health` mengembalikan HTTP 200 OK.
- [ ] Skrip `import.ts` berhasil mengimpor data Excel tanpa *data truncation* atau kegagalan transaksi.
- [ ] Endpoint `GET /api/commissariats/proker` dapat diakses dan mengembalikan daftar array program kerja yang valid.
- [ ] Halaman `/program` menampilkan daftar program kerja tanpa error JavaScript console.
- [ ] Detail halaman `/program/[id]` dapat memuat detail data dan galeri foto dengan benar.
- [ ] Gambar dari URL backend/web public tampil tanpa galat CORS atau Next.js Image Security Policy error.
