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
9. Setiap route publik punya `og:image` dan `twitter:card`, bukan hanya `og:title`.
10. Daftar dengan identitas stabil memakai key stabil (bukan indeks).

**Kebijakan bukti**: `tests/visual/` disimpan **lokal saja** dan masuk `.gitignore`. Yang masuk repo hanya ringkasan temuan (komentar issue dan laporan).

**Catatan kriteria mode gagal**: saat API benar-benar mati, browser tetap mencatat `ERR_CONNECTION_REFUSED` untuk request yang gagal — itu perilaku browser, bukan kode kita. Karena itu kriteria mode gagal adalah **UI error eksplisit + tidak ada unhandled rejection**, bukan "0 error console" (kriteria 0 error console berlaku saat API hidup).

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
| S1 | — | **Selesai**: service publik melempar (news dengan 404 → `null`, periode, feed Beranda). Beranda menangkap per bagian, dan `/commissariat` (halaman client) tidak lagi menyamarkan kegagalan sebagai "data belum tersedia" | gate mode gagal |
| S2 | — | **Selesai**: `loading.tsx` + `error.tsx` untuk enam segmen route berdata (`program`, `program/[id]`, `commissariat/[slug]`, `profil/[periode]`, `awardee`, `news/[slug]`) lewat komponen bersama `RouteState` | 12 file route |
| S3 | — | **Selesai**: `app/error.tsx` memakai boundary bersama (`reset()` + tautan Beranda), tanpa `window.location` | lint warning hilang |
| S4 | — | **Selesai**: service dihapus bersama S5, jadi fallback karangan itu hilang | dihapus |
| S5 | — | **Selesai (dihapus)**: `/api/profile` ternyata **mock hardcoded** (BPH "Fathir"/"Alya", dokumen `url: "#"`) tanpa konsumen. Route, mount di `index.ts`/`server.ts`, dan `lib/services/profile.service.ts` dihapus | dihapus |
| S6 | — | **Selesai**: `generateStaticParams` di `program/[id]` dan `commissariat/[slug]` mengembalikan daftar kosong bila API mati, sehingga build tidak lagi hard-fail dan route dirender on-demand | log build |
| N1 | — | **Selesai**: `/program` punya pencarian + paginasi URL (`?q=&page=`) dengan **8 kartu per halaman**; 139 program terbagi 18 halaman | gate Fase 3 |
| N2 | — | **Selesai**: teks legal palsu dihapus dari `footerBottom.tsx` **dan** dari `config/footer.ts`; footer kini hanya memuat copyright | gate Fase 3 |
| N3 | — | **Selesai**: `/commissariat` memakai `<h1>` sebagai judul, baik di state normal maupun state gagal | gate Fase 3 |
| N4 | — | **Selesai**: drawer ber-`role="dialog"`/`aria-modal`, fokus terkunci selama terbuka, ditutup dengan Escape, dan fokus kembali ke tombol pemicu. Tanpa dependency baru | gate Fase 3 |
| A1 | — | **Selesai**: hook menyimpan boolean (bukan `scrollY`), dibaca lewat `requestAnimationFrame` dengan listener `passive`; state hanya berubah saat nilainya berubah | gate Fase 4 |
| A2 | — | **Selesai**: `aria-invalid` + `aria-describedby` per field, tiap pesan error `role="alert"`, kartu sukses `role="status"`, dan kegagalan non-field tampil sebagai ringkasan `role="alert"` | uji jalur error |
| A3 | — | **Selesai**: `sizes` ditambahkan di Hero (100vw), logo drawer (32px), dan cover komisariat (100vw); galeri detail program tetap menunggu P1 | gate Fase 4 |
| A4 | — | **Selesai**: memakai `next/image`. Catatan: Next membuang atribut `sizes` selama `unoptimized` dipasang, sehingga manfaat `sizes` di sini belum aktif | terverifikasi dengan data uji |
| A5 | — | **Selesai**: key stabil di statistik Hero, galeri detail program (`key={img}`), Portal (`key={item.title}`), dan dua list AboutClient (`key={item}`, `key={value.title}`). Dua list AboutClient lain tetap memakai indeks karena statis dan tanpa identitas stabil — bukan daftar yang bisa berubah urutan | gate Fase 4.1 |
| A6 | — | **Selesai**: node teks liar itu dihapus; kelas CSS `isBold` tetap dipakai | gate Fase 4 |
| E1 | — | **Selesai**: title/description/openGraph unik untuk `/`, `/profil`, `/profil/[periode]`, `/commissariat`, `/awardee`, `/news`, `/news/[slug]`, dan `/program/[id]` (ditemukan lewat verifikasi). `/commissariat` memakai layout segmen karena halamannya client component | gate Fase 4 |
| E2 | — | **Selesai**: `app/sitemap.ts` (**157 entri**: 7 statis + 9 komisariat + 139 program + 2 periode), `app/robots.ts`, OG image via `next/og`, dan `metadataBase` dari `SITE_URL` | gate Fase 4 |
| S7 | — | **Selesai**: slug berita yang tidak ada mengembalikan `null` tanpa menulis apa pun; gate mode normal kini 0 error console di route itu | gate Playwright |
| P1 | Medium | Galeri dokumentasi program (431 file) belum diuji beban dan `sizes` belum diatur | source |
| P2 | Low | Video hero belum aktif (menunggu aset) | `content/home.ts` |
| S8 | Low | Selama pengerjaan Fase 1, MySQL (Laragon) sempat mati sehingga `/api/v1/news` dan `/api/home` mengembalikan 500 dan halaman tetap 200 tanpa pesan. Bukti tambahan untuk S1, bukan bug baru | log dev server |
| S9 | — | **Selesai (regresi Fase 2)**: navbar memanggil `getPublicPeriods().then()` tanpa `.catch()`, sehingga sejak service melempar setiap halaman mencatat unhandled rejection saat API mati. Kini gagal secara diam dan submenu Profil cukup kehilangan daftar periode | uji mode gagal Fase 3 |
| P3 | Low | `next.config.ts` `remotePatterns` masih hanya localhost | `next.config.ts` |
| M11 | — | **Selesai**: `NewsClient` memakai bentuk data lama (`image`, `image_color`, `snippet`, slug dari judul) padahal API publik mengirim `coverImage`/`excerpt`/`publishedAt`/`slug`; kini memakai bentuk publik | terverifikasi dengan data uji |
| A7 | Low | `sizes` tidak berpengaruh selama gambar berita memakai `unoptimized`; keputusan mengaktifkan optimizer ditunda bersama P3 | gate Fase 4 |
| E4 | — | **Selesai**: blok `openGraph` yang ditambahkan Fase 4 menggantikan objek OG dari root sehingga `og:image` hilang di hampir semua halaman; blok itu dihapus (og:title/description tetap diturunkan otomatis) dan `/news/[slug]` hanya mengisi `openGraph` bila ada cover. Ditemukan lewat analisa pasca-Fase 4, bukan oleh gate saat itu | gate Fase 4.1: og:image ada di 11 route |
| M12 | — | **Selesai**: filter kategori `/news` membandingkan label Title Case dengan enum API yang HURUF BESAR (`EDUKASI`, `WEBINAR`, ...) sehingga kategori selain "All" selalu nol hasil. Kini memakai nilai enum + label tampilan | uji dengan data: Edukasi → 1, Webinar → 1, Semua → 2 |

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

**Rencana pemilik produk untuk Berita (belum dikerjakan, menunggu contoh)**: hanya 5-6 berita; tiap berita punya **4-6 gambar yang bisa digeser** kiri-kanan, lalu isi berita di bawahnya; halaman detail memakai dua kolom — kiri berita + gambarnya, kanan tautan ke berita lain. **Tanpa paginasi.** Ini memerlukan API publik mengekspos aset cover berita (saat ini hanya satu `coverImage`), jadi dicatat sebagai pekerjaan lanjutan, bukan bagian Fase 5.

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

**Bukti mode gagal (Fase 2)**: dengan web berjalan tanpa API, 9 route menampilkan pesan "Konten gagal dimuat", Beranda menampilkan fallback per bagian ("belum dapat dimuat"), `/commissariat` menampilkan pesan gagal + tombol Coba Lagi, dan `/contact` tetap normal.

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

## 10. Status akhir (Fase 5)

**Fase 5 selesai.** Ringkasan hasil dan temuan yang masih terbuka:

| Kode | Status | Catatan |
|---|---|---|
| P1 | Selesai | Semua `next/image` ber-`fill` kini punya `sizes` (**0** tanpa sizes, sebelumnya 13). Galeri dokumentasi memakai `sizes` grid dan lazy default; hero detail program memakai `priority`. Peringatan `missing "sizes"` dan peringatan LCP di console **hilang**. Diukur di mode produksi: `/program/[id]` FCP **164 ms**, load **589 ms**, CLS **0**, total 640 KB (6 gambar, 165 KB); beranda FCP 216 ms, CLS 0; `/awardee` (tabel 619 baris) load 383 ms, 46 KB |
| P2 | Selesai (tanpa perubahan) | Aset video hero tidak ada, jadi tetap `enabled: false`; tidak ada permintaan 404 di console. Bila aset tersedia: taruh `public/assets/videos/hero.mp4`, ubah `enabled` jadi `true` |
| P3 | Selesai | `next.config.ts` membangun `remotePatterns` dari `NEXT_PUBLIC_API_URL` (protocol, host, port ikut env; port default 80/443 tidak ditulis), sehingga domain staging/produksi tidak perlu edit kode |
| V1 | Selesai | Loop verifikasi Playwright MCP didokumentasikan di §7; **tanpa dependency baru** (`@playwright/test` tidak ditambahkan). `scripts/e2e-smoke.mjs` tetap belum dijalankan penuh karena membutuhkan kredensial + DB scratch |
| P4 | **Terbuka** | **Aset gambar publik terlalu besar.** `raker.jpg` sudah dioptimasi **7.270 KB → 322 KB (−96 %)**, tetapi logo SVG komisariat masih sangat besar: `unesa.svg` 4,7 MB, `uinMadura.svg` 1,4 MB, `unair.svg` 1,2 MB, `genbiJatim.svg` 906 KB, `unugiri.svg` 501 KB, `utm.svg` 425 KB; juga `bnsp.JPG` 416 KB. SVG dilewatkan tanpa optimasi oleh `next/image`, jadi Beranda mentransfer ±3,2 MB gambar. **Rekomendasi**: kompres/ekspor ulang SVG (svgo atau ekspor desainer) atau ganti ke PNG/WebP kecil; pertimbangkan menyajikan `raker.jpg` versi `.webp` |
| A7 | Terbuka (Low) | `sizes` inert selama gambar berita memakai `unoptimized`; keputusan mengaktifkan optimizer menunggu domain produksi (P3) |
| A5 (sisa) | Diterima | Dua list AboutClient tetap memakai indeks karena statis tanpa identitas stabil |

**Pekerjaan lanjutan yang sudah diputuskan pemilik produk (belum dikerjakan, menunggu contoh)**: Berita hanya 5-6 item; setiap berita punya 4-6 gambar yang bisa digeser kiri-kanan lalu isi berita; halaman detail dua kolom (kiri berita + gambarnya, kanan tautan berita lain); **tanpa paginasi**. Butuh API publik mengekspos aset gambar berita (kini hanya satu `coverImage`).
