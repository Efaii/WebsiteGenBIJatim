# Rencana Eksekusi UX, Accessibility, dan SEO Website GenBI Jatim (Task-007)

Dokumen ini berisi rencana eksekusi khusus untuk pembenahan UX, Accessibility (A11y), dan SEO pada aplikasi Next.js 16 (`apps/web`), sesuai hasil audit teknis terbaru.

---

## 1. Lingkup Pekerjaan & Kepemilikan (Ownership)

Pengerjaan dibagi secara ketat antara spesialis `@designer` dan `@fixer` tanpa mengganggu refactoring core API/service yang sedang berjalan:

| Area Fokus | Perubahan Utama | Owner | File Terdampak |
|---|---|---|---|
| **Contact Form & Page** | Pertahankan feedback a11y (error message, aria-invalid, live region), ubah tema dari dark slate/navy ke light design (bg-white/slate-50, text contrast > 4.5:1). | `@designer` | `apps/web/app/contact/page.tsx`, `apps/web/components/features/contact/ContactForm.tsx` |
| **Navbar & Mobile Drawer** | Tambahkan `aria-expanded`, `aria-controls`, `aria-label`, penanganan tombol `Escape`, dan perangkap fokus keyboard dasar pada mobile drawer/accordion. | `@designer` | `apps/web/components/layout/Navbar.tsx` |
| **Primitif Button** | Kanonisasi penggunaan komponen Button. Migrasi dari custom Button berbasis framer-motion (`components/Button.tsx`) ke shadcn UI Button (`components/ui/button.tsx`) dengan mempertahankan kompatibilitas props (`variant`, `size`, `className`, motion capabilities jika dibutuhkan). | `@designer` | `apps/web/components/Button.tsx`, `apps/web/components/ui/button.tsx`, dan komponen konsumen |
| **Dynamic SEO Metadata** | Implementasi `generateMetadata` pada route detail berita untuk SEO dinamis (title, description, OpenGraph). (*Metadata program sudah selesai dan dikecualikan*). | `@fixer` | `apps/web/app/news/[slug]/page.tsx` |

---

## 2. Strategi Pengujian & TDD Baseline (No-Dependency Fallback)

Karena `apps/web` tidak memiliki framework unit testing (seperti Jest/Vitest), verifikasi dilakukan melalui dua mekanisme:

1. **Static Type & Lint Verification**:
   - Jalankan `npx tsc --noEmit` di `apps/web` untuk memastikan type safety.
   - Jalankan `npm run lint` untuk mengecek aturan ESLint/Accessibility (`jsx-a11y`).
2. **Minimum Runnable Node/TS Script Check** (bila dapat dieksekusi tanpa deps baru):
   - Membuat script verifikasi ringan menggunakan native Node.js `assert` untuk menguji logika formatting helper metadata/SEO atau ekspor props Button.

---

## 3. Rencana Eksekusi TDD Berkelanjutan

### Tahap 1: Dynamic SEO Metadata Berita (`app/news/[slug]/page.tsx`) — Owner: `@fixer`

- **Failing Check**:
  - Script/Check: Jalankan static check / script assert yang mengecek apakah `app/news/[slug]/page.tsx` mengekspor `generateMetadata`.
  - Expected Failure: `generateMetadata is not defined` atau `export missing`.
- **Implementation**:
  - Panggil `newsService.getBySlug(slug)` atau service berita terkait.
  - Hasilkan metadata: `title: ${news.title} | GenBI Jatim`, `description`, `openGraph: { title, description, images: [news.image] }`.
- **Passing Check**:
  - `npx tsc --noEmit` sukses dan script verifikasi mengekstrak fungsi `generateMetadata` tanpa error type.

### Tahap 2: Standardisasi & Kanonisasi Button Primitive — Owner: `@designer`

- **Failing Check**:
  - Static Check: `npx tsc --noEmit` atau script check mengecek penggunaan ganda Button primitif yang membingungkan `variants` (`secondary`, `outline`, dsb).
- **Implementation**:
  - Konsolidasikan `components/Button.tsx` menjadi wrapper atau re-export berlainan yang menggunakan `components/ui/button.tsx` (shadcn primitive) dengan variant compatibility map.
  - Pertahankan visual intent, hover state, focus ring (`focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none`).
- **Passing Check**:
  - Seluruh komponen UI merender Button tanpa TypeScript warning/error dan visual intent tetap presisi.

### Tahap 3: Light Theme Contact Form & A11y Feedback — Owner: `@designer`

- **Failing Check**:
  - Visual/A11y Check: `ContactForm.tsx` menggunakan kelas warna gelap (`bg-slate-900`, `text-slate-100`, `border-slate-800`).
- **Implementation**:
  - Ubah palette ke situs light design (`bg-white`, `bg-slate-50`, `text-slate-900`, `border-slate-200`).
  - Pastikan kontras warna teks dan placeholder memenuhi rasio WCAG AA (minimal 4.5:1).
  - Pertahankan elemen accessibility: `aria-invalid`, `aria-describedby`, error alert `role="alert"`.
- **Passing Check**:
  - Tampilan visual selaras dengan konsistensi tema terang situs; masukan keyboard dan error accessibility berfungsi penuh.

### Tahap 4: Navbar Trigger, Drawer, & Accordion Accessibility — Owner: `@designer`

- **Failing Check**:
  - A11y Check: Tombol hamburger navbar tidak memiliki `aria-expanded` yang dinamis dan `aria-controls="mobile-menu"`.
- **Implementation**:
  - Tambahkan atribut `aria-expanded={isOpen}`, `aria-controls="mobile-nav"`, `aria-label="Buka menu navigasi"`.
  - Tambahkan event handler `onKeyDown` untuk menutup drawer saat tombol `Escape` ditekan.
  - Tambahkan `aria-expanded` pada dropdown/accordion komisariat di menu mobile.
- **Passing Check**:
  - Audit atribut HTML navbar via linter/DOM check menunjukkan seluruh atribut accessibility terpasang dengan benar.

---

## 4. Kriteria Penerimaan (Acceptance Criteria)

1. **SEO Berita**: Halaman `/news/[slug]` menghasilkan metadata HTML head secara dinamis sesuai judul berita.
2. **Desain Form Kontak**: Halaman `/contact` mengusung desain light theme sesuai bahasa visual utama situs GenBI Jatim, tanpa merusak pesan galat A11y.
3. **Navigasi Accessible**: Drawer navigasi mobile dapat diakses dengan keyboard (Escape key support, `aria-expanded` akurat).
4. **Button Primitive**: Tidak ada kebingungan antara dua primitif Button; seluruh aplikasi berjalan konsisten menggunakan Button UI yang telah dikanonisasi.
5. **Kesesuaian Tipe**: Pengecekan `npx tsc --noEmit` pada `apps/web` lulus 100% tanpa error.

---

## 5. Risiko & Mitigasi

- **Risiko Breaking Changes pada Import Button**:
  - *Mitigasi*: Menjadikan `components/Button.tsx` sebagai facade/adapter yang mengarah ke `components/ui/button.tsx`, sehingga tidak merusak komponen konsumen yang mengimpor `components/Button`.
- **Risiko Kegagalan Dynamic Metadata pada Data Null**:
  - *Mitigasi*: Sertakan fallback metadata default ("Berita GenBI Jatim") jika berita tidak ditemukan atau terjadi network timeout pada API berita.
- **Konflik Perubahan UI Terkait Dark Mode**:
  - *Mitigasi*: Pastikan perbaikan UI form kontak hanya menyentuh styling kelas Tailwind internal tanpa mengubah handler formulir atau fungsi kirim pesan.

---

## 6. Verifikasi Akhir

- Pengujian Tipe: `cd apps/web && npx tsc --noEmit`
- Pengujian Linting: `cd apps/web && npm run lint`
- Pengujian Runtime (Manual/Browser):
  - Buka `/news/[slug]` → periksa `<title>` dan `<meta name="description">`.
  - Buka `/contact` → periksa tema terang dan pesan error form.
  - Buka layar mobile → periksa interaksi hamburger menu via tombol Tab dan Escape.
