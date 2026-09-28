# Spec: Public Web Hardening

Status: aktif
Dibuat: 27 September 2026
Bukti audit: `tests/visual/` (lokal, gitignored). Audit dijalankan dengan Playwright MCP headless terhadap dev server `localhost:3000`, plus uji interaksi nyata.

Spec ini menggantikan `docs/archive/audit-remediation-plan.md` dan `docs/archive/task-007-ux-accessibility-seo-plan.md`.

## 1. Tujuan

Permukaan publik situs GenBI Jatim berjalan lancar menyeluruh:

- tidak ada halaman rusak atau error runtime;
- tidak ada data mock yang tampil seolah-olah fakta;
- tidak ada state kosong/gagal yang membingungkan pengguna;
- setiap perubahan dibuktikan lewat browser (Playwright), bukan lewat asumsi atau "build sukses".

## 2. Batas permukaan

| Permukaan | Isi |
|---|---|
| **Masuk: permukaan publik** | **11 route**: `/`, `/profil`, `/profil/[periode]`, `/commissariat`, `/commissariat/[slug]`, `/program`, `/program/[id]`, `/awardee`, `/news`, `/news/[slug]`, `/contact`, plus komponen bersama (`Navbar`, `Footer`, `Card`, `Button`, `MotionWrapper`, `PageBackground`) |
| **Keluar: permukaan CMS** | seluruh `/admin/*` termasuk `/admin/login`; kontrak dan alur CMS; Proposal/LPJ privat; dokumen sekretaris; posting metadata |
| **Sudah dihapus dari permukaan publik** | `/docs` + `/api/docs` (dokumen jadi urusan sekretaris/CMS) dan `/calendar` + `/calendar/[id]` + `/api/events` (datanya hardcoded, tidak ada model `Event`) |

## 3. Gate penerimaan (berlaku di setiap fase)

1. `npx tsc --noEmit -p apps/web/tsconfig.json` bersih (dan API bila tersentuh).
2. `npm run lint --workspace apps/web` tanpa error.
3. `npm run test --workspace apps/web` hijau.
4. Playwright: **11 route publik** × (1440×900 dan 390×844) menghasilkan **0 error console**, 0 gambar rusak, 0 gambar tanpa `alt`, tepat satu `<h1>` di setiap halaman, dan tidak ada scroll horizontal.
5. Route yang datanya kosong diverifikasi memakai data sementara yang disuntik lalu dihapus, dan penghapusannya dicatat di komentar fase.
6. Alur interaktif yang tersentuh fase diuji dengan klik/ketik nyata, bukan hanya snapshot.
7. Screenshot diperbarui di `tests/visual/`.
8. Tidak ada nilai mock atau data hardcoded **baru** yang masuk ke permukaan publik.

**Kebijakan bukti**: `tests/visual/` disimpan **lokal saja** dan masuk `.gitignore`. Yang masuk repo hanya ringkasan temuan (komentar issue dan laporan).

## 4. Inventaris temuan

| Kode | Severity | Temuan | Bukti |
|---|---|---|---|
| K1 | High | Artefak kompilasi `.js`/`.d.ts` bersebelahan dengan sumber di `apps/api` (39 file berpasangan `.ts` + 1 script scratch tanpa sumber) dan `packages/types` (3 file sisa lama; tsconfig-nya sudah benar, `outDir: dist`) | `apps/api/temp.js`, `apps/api/prisma/seed.js`, `packages/types/src/index.js`, dll. |
| K2 | — | **Selesai**: dua rencana lama dipindah ke `docs/archive/` | `docs/archive/` |
| V1 | Medium | `scripts/e2e-smoke.mjs` belum pernah dijalankan di audit terakhir | `package.json:13` |
| M1 | — | **Selesai**: `COMMISSARIAT_DATA` dihapus. Ternyata punya **tiga** konsumen (Hero, dropdown Komisariat di navbar, fallback mock `program.service`), bukan satu seperti catatan awal. Metrik Beranda kini konstanta statis berlabel sumber sesuai ADR 0001 | `content/home.ts`, `config/site.ts` |
| M8 | — | **Selesai**: `content/sharedEvents.ts` juga korpus mock (KPI karangan seperti "500 Peserta", "90% Tingkat Kepuasan") dan menjadi mati setelah fallback mock dihapus | dihapus |
| M9 | — | **Selesai (bug)**: tautan UPN memakai slug mock `upn-veteran-jatim` di navbar dan footer, sedangkan API melayani `upnvjt`; keduanya 404. Kini keduanya `upnvjt` dan halaman detailnya 200 | `config/site.ts`, `config/footer.ts` |
| M10 | — | **Selesai**: kartu berita Beranda merender tiga kotak galeri kosong padahal API publik hanya menyediakan satu `coverImage`; baris galeri dihapus | `components/home/News.tsx` |
| M2 | High | Beranda mengambil berita lewat service CMS (`services/news.service.ts` → `/news`), bukan service publik (`lib/services/news.service.ts` → `/v1/news`); tipe `AdminNewsItem` bocor ke komponen Beranda | `app/page.tsx:11`, `components/home/News.tsx:7` |
| M3 | Medium | Dua service berita hidup berdampingan. **Keputusan**: permukaan publik hanya memakai service v1; service kedua tetap untuk admin (bukan dihapus) | `lib/services/news.service.ts`, `services/news.service.ts` |
| M4 | Low | `lib/services/google.ts` tidak punya importer | dikonfirmasi via grep |
| M5 | — | **Selesai**: `/calendar`, `/calendar/[id]`, `lib/services/calendar.service.ts`, `/api/events` + `routes/events.ts` dihapus. Navigasi bersih | keputusan pemilik produk |
| M6 | — | **Selesai**: `/docs` publik dan `/api/docs` dihapus (page, client, service, route, mount, tautan navigasi). Dokumen jadi urusan sekretaris/CMS | keputusan pemilik produk |
| M7 | — | **Selesai**: `apps/api/.env` menunjuk `genbi_jatim_initial_production` selama hardening. Awardee menampilkan 619 baris dan struktur komisariat terisi | `apps/api/.env` |
| S1 | High | Error API ditelan menjadi `[]` sehingga halaman tampak kosong tanpa pesan. **Terbukti saat API mati**: `/` tetap 200 dan log hanya menulis `API Fetch Error: ECONNREFUSED` | news/docs-service, log dev server |
| S2 | Medium | Tidak ada `loading.tsx`/`error.tsx` per route publik | hanya root |
| S3 | Medium | `app/error.tsx` memakai `window.location.href` untuk navigasi internal | `app/error.tsx:44` |
| S4 | Medium | `profile.service.ts` punya fallback yang **mengarang nama organisasi** ("GenBI Koordinator Komisariat Jawa Timur") dan menelan error | `lib/services/profile.service.ts:11-17` |
| S5 | Medium | Rantai profil kini **tanpa konsumen**: `getKorkomData` tidak dipakai lagi oleh halaman mana pun (Profil tidak pernah menampilkan data itu). `/api/profile` + service-nya perlu dihapus atau dipertahankan dengan alasan jelas | grep `profile.service` |
| S6 | Medium | **`next build` bergantung pada API yang hidup**: tanpa API, build gagal di `Collecting page data for /program/[id]` (`ECONNREFUSED`). Ditemukan saat Fase 0 | log `npm run build` |
| N1 | High | `/program` menampilkan 139 kartu sekaligus tanpa pencarian/paginasi | matriks audit |
| N2 | Medium | Footer merender "Privacy Policy" dan "Syarat & Ketentuan" sebagai `<span>` dengan `cursor-pointer`: terlihat bisa diklik tetapi tidak melakukan apa pun | `footerBottom.tsx:21-28` |
| N3 | Low | `/commissariat` tidak punya `<h1>` | matriks audit |
| N4 | Medium | Drawer mobile belum punya focus trap dan belum bisa ditutup dengan Escape | `mobileMenu.tsx` |
| A1 | Medium | `useScrollPosition` non-passive dan memicu re-render navbar setiap frame scroll | `hooks/useScrollPosition.ts` |
| A2 | Medium | Form kontak belum mengumumkan error/sukses dan belum memakai `aria-invalid` | `ContactForm.tsx` |
| A3 | Low | `next/image` `fill` tanpa `sizes` di 3 tempat | Hero, mobileMenu, CommissariatDetail |
| A4 | Low | `NewsClient.tsx` memakai `<img>` mentah | `NewsClient.tsx:135` |
| A5 | Low | `index` sebagai `key` pada list yang bisa berubah urutan | statistik Hero, galeri detail program, AboutClient |
| A6 | Low | `{link.isBold}` dirender sebagai boolean tanpa efek | `footerLinks.tsx:66` |
| E1 | High | Metadata khusus hanya ada di `commissariat/[slug]`, `program`, `contact`; sisanya judul default "GenBI Jatim" | grep `generateMetadata` |
| E2 | Medium | Tidak ada `sitemap.ts`, `robots.ts`, atau OG image | glob |
| S7 | Medium | Halaman not-found berita tetap menulis `console.error` dari service saat slug tidak ada, sehingga 404 yang sah tercatat sebagai error console | gate Playwright Fase 0 |
| P1 | Medium | Galeri dokumentasi program (431 file) belum diuji beban dan `sizes` belum diatur | source |
| P2 | Low | Video hero belum aktif (menunggu aset) | `content/home.ts` |
| S8 | Low | Selama pengerjaan Fase 1, MySQL (Laragon) sempat mati sehingga `/api/v1/news` dan `/api/home` mengembalikan 500 dan halaman tetap 200 tanpa pesan. Bukti tambahan untuk S1, bukan bug baru | log dev server |
| P3 | Low | `next.config.ts` `remotePatterns` masih hanya localhost | `next.config.ts` |

## 5. Fase

### Fase 0 — Fondasi build & kebersihan

**Lingkup**: K1, V1
**Deliverable**:
- Hapus 39 artefak berpasangan `.ts` di `apps/api` **dan** script scratch tanpa sumber (`tmp_issue20_documentation_metrics.js`); hapus 3 file sisa di `packages/types/src/`. Jangan sentuh `apps/api/dist` (output build resmi).
- Tambah aturan ignore untuk kedua paket.
- Jalankan `npm run test:e2e` dan catat hasilnya.

**Exit criteria**: tidak ada artefak kompilasi bersebelahan dengan sumber di `apps/web`, `apps/api`, `packages/types`; `tsc` web dan API bersih; `npm run build` sukses; hasil `test:e2e` tercatat.
**Blocked by**: none.

### Fase 1 — Hapus mock dari permukaan publik

**Lingkup**: M1, M2, M3, M4, M8, M9, M10 (selesai)
**Deliverable**:
Semua dikerjakan:
- M1 + M8: mock dihapus; `Hero` memakai konstanta statis dari `content/home.ts`, dropdown Komisariat memakai `siteConfig.commissariatLinks` (nama + slug canonical), `program.service` tidak lagi punya fallback mock, dan `content/commissariatData.ts` serta `content/sharedEvents.ts` dihapus.
- M2: Beranda memakai `getRecentNews(3)` dari `lib/services/news.service.ts`; `components/home/News.tsx` memakai tipe publik (`coverImage`/`publishedAt`/`excerpt`/`byline`) + `newsAssetUrl` (menghapus URL localhost hardcoded).
- M3: `services/news.service.ts` diberi header CMS-only dan fungsi publik mati `getLatestNews` dihapus.
- M4: `lib/services/google.ts` dihapus.
- M9: slug UPN diperbaiki ke `upnvjt` (navbar + footer).
- M10: baris galeri kosong di kartu berita dihapus.

**Exit criteria (terpenuhi)**: `content/commissariatData.ts` dan `content/sharedEvents.ts` terhapus; tidak ada file mock di jalur import halaman publik; `components/home/News.tsx` tidak lagi mengimpor tipe/service CMS; gate §3 lulus (11/12 route bersih, pengecualian N3 dan S7 yang sudah tercatat).
**Blocked by**: Fase 0.

### Fase 2 — State jujur: loading, empty, error

**Lingkup**: S1, S2, S3, S4, S5, S6, S7
**Pendekatan yang disepakati**: service publik **melempar** saat gagal (bukan mengembalikan `[]`); halaman yang menangkap dan memutuskan tampilan. Satu komponen state bersama boleh dibuat; route server memakai `loading.tsx`/`error.tsx`, halaman client memakai state lokal.
**Deliverable**:
- S1: hentikan pola `catch → []` di service publik.
- S2: `loading.tsx`/`error.tsx` untuk route publik yang membutuhkan.
- S3: `app/error.tsx` memakai `reset()`/`useRouter`, bukan `window.location.href`.
- S4: hapus fallback karangan di `profile.service.ts`.
- S6: buat build produksi tidak hard-fail saat API mati, atau dokumentasikan sebagai syarat build (pilih salah satu dan tulis alasannya).
- S7: halaman not-found berita tidak boleh menulis `console.error` untuk slug yang memang tidak ada.
- S5: putuskan dan kerjakan: hapus `/api/profile` + `profile.service.ts` (tanpa konsumen), atau pertahankan dengan alasan tertulis.

**Exit criteria**: dengan API dimatikan, setiap route publik menampilkan pesan gagal yang jelas (bukan area kosong); dengan data kosong menampilkan empty state; keduanya dibuktikan screenshot.
**Blocked by**: Fase 1.

### Fase 3 — Interaksi & navigasi tuntas

**Lingkup**: N1, N2, N3, N4
**Deliverable**:
- N1: pencarian + paginasi server-side `/program` dengan URL param `?q=&page=`, **12 kartu per halaman**, tanpa filter tambahan.
- N2: "Privacy Policy" dan "Syarat & Ketentuan" **dihapus** dari komponen footer dan dari `config/footer.ts` sampai halaman legalnya benar-benar ada.
- N3: `/commissariat` memakai `<h1>`.
- N4: drawer mobile ditutup dengan Escape, fokus terkunci selama terbuka, **tanpa dependency baru**.

**Exit criteria**: pencarian/paginasi diuji dengan klik dan URL berubah sesuai; footer tidak lagi memuat teks yang terlihat bisa diklik tanpa aksi; setiap route publik punya tepat satu `h1`; Escape menutup drawer dan fokus kembali ke tombol pemicu.
**Blocked by**: Fase 2.

### Fase 4 — Aksesibilitas & SEO

**Lingkup**: A1–A6, E1, E2
**Deliverable**:
- E1: metadata untuk route yang belum punya: `/profil`, `/profil/[periode]`, `/commissariat`, `/awardee`, `/news`, `/news/[slug]` (sudah ada: `/`, `/program`, `/commissariat/[slug]`, `/contact`).
- E2: `app/sitemap.ts` (route statis + dinamis dari API, `SITE_URL` dari env dengan fallback localhost), `app/robots.ts`, dan OG image default.
- A1: listener scroll passive + hilangkan re-render navbar per frame.
- A2: `aria-invalid`, `aria-describedby`, `role="alert"` di form kontak.
- A3: `sizes` pada `next/image fill`.
- A4: `<img>` → `next/image`.
- A5: key stabil hanya pada list yang bisa berubah urutan.
- A6: hapus `{link.isBold}`.

**Exit criteria**: `<title>` dan `<meta name="description">` unik per route (dicek dari HTML); `/sitemap.xml` dan `/robots.txt` dapat diakses; form kontak mengumumkan error/sukses; gate §3 lulus.
**Blocked by**: Fase 2 (dapat berjalan paralel dengan Fase 3).

### Fase 5 — Performa & verifikasi akhir

**Lingkup**: P1, P2, P3, V1
**Deliverable**:
- P1: `sizes`/lazy-loading galeri dokumentasi; ukur `/program/[id]` dengan trace Playwright dan catat temuan.
- P2: video hero diaktifkan bila aset tersedia.
- P3: `remotePatterns` disiapkan lewat env dengan placeholder domain produksi.
- V1: **tanpa dependency baru** — perintah loop verifikasi MCP didokumentasikan di spec.

**Exit criteria**: matriks 11 route × 2 viewport bersih; screenshot final tersimpan lokal; laporan akhir memuat temuan tersisa beserta alasannya.
**Blocked by**: Fase 3, Fase 4.

## 6. Non-goals

- Redesign visual atau rebranding.
- Seluruh permukaan CMS (`/admin/*`), kontrak CMS, dan alur approval.
- Dokumen publik dan kalender publik: keduanya sudah dihapus dari permukaan ini.
- Fitur baru di luar daftar temuan §4.
- Mengganti metrik statis Beranda menjadi fetch runtime; ADR 0001 tetap berlaku.

## 7. Cara verifikasi

Playwright MCP headless terhadap dev server:

1. Per route: `navigate` → tunggu navbar → `snapshot` → `take_screenshot` → `console_messages(level=error)` → `evaluate` diagnostik (h1, overflow, gambar rusak, alt, target sentuh).
2. Untuk interaksi: klik/ketik nyata, lalu verifikasi URL, teks state, dan isi DB bila relevan.
3. Bukti disimpan lokal di `tests/visual/` dan `tests/visual/snapshots/`.
4. Uji kegagalan: matikan API, ulangi langkah 1 untuk memastikan state error tampil.

## 8. Risiko

- **Artefak kembali muncul**: `tsconfig` web sudah `noEmit: true`; paket lain belum tentu. Mitigasi: aturan ignore + cek Fase 0.
- **Data uji masuk database**: verifikasi route berita butuh data sementara. Mitigasi: hapus kembali dan catat di komentar fase.
- **Perubahan menyentuh komponen bersama**: Navbar/Footer/Card dipakai seluruh halaman. Mitigasi: gate §3 dijalankan pada 11 route setiap fase.
- **FAQ/testimoni kosong**: DB produksi bersih tidak memuat keduanya, jadi Beranda akan menampilkan state kosong sampai konten diisi lewat CMS. Fase 2 memastikan state itu jujur, bukan rusak.

## 9. Keputusan yang sudah diambil

| Kode | Keputusan |
|---|---|
| M5 | Kalender dihapus total: route, service, endpoint API. Alasan: datanya hardcoded dan tidak ada model `Event`. |
| M6 | Dokumen publik dihapus total; dokumen menjadi akses sekretaris/CMS. |
| M7 | `.env` menunjuk `genbi_jatim_initial_production` selama hardening (bentuk produksi sebenarnya). |
| N2 | Tautan legal dihapus (bukan dibuatkan halaman) sampai konten legal benar-benar ada. |
| V1 | Tanpa dependency baru: verifikasi lewat loop MCP yang didokumentasikan. |
| Bukti | Screenshot disimpan lokal (`tests/visual/`, gitignored). |
