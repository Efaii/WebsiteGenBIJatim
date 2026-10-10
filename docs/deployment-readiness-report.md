# Laporan Kesiapan Deployment — Homeserver

**Tanggal:** 11 Oktober 2026
**Basis commit:** `42eb760` — branch `main`, working tree bersih, seluruh commit ter-push ke `origin`
**Status:** Siap eksekusi — menunggu keputusan pemilik produk

## 1. Ringkasan

Seluruh pekerjaan penyiapan produksi sudah selesai dan terverifikasi:

- Aplikasi berhasil di-build menjadi image Docker produksi dan berjalan (smoke test lulus).
- Seluruh rantai migrasi database (13 migrasi) lulus di Linux, bersama seed dan 27 tes API + tes integrasi.
- Server tujuan (homeserver pemilik produk, diakses via Tailscale) sudah diperiksa: Docker + Compose siap, arsitektur cocok, ruang disk cukup.
- Database sumber telah diaudit; ditemukan sisa data uji `[UJI]` yang perlu dibersihkan (setelah backup) sebelum rilis.
- CI GitHub diperbaiki agar mendukung migrasi di Linux.

Deployment tinggal menunggu keputusan pemilik produk (Bagian 4).

## 2. Yang sudah selesai (terverifikasi)

### 2.1 Build & runtime Docker

- `docker compose build api web` → `BUILD_EXIT=0`; image `genbi-jatim-api:local` dan `genbi-jatim-web:local` terbentuk.
- Smoke test runtime: API `GET /ready` → 200, `GET /health` → 200; Web `GET /` → 200 (Next.js standalone).
- Perbaikan yang sudah termasuk dalam image:
  - root `tsconfig.json` ikut di-COPY (build `@repo/types` sebelumnya gagal),
  - `prisma generate` dijalankan di tahap produksi (setelah `npm prune`),
  - `openssl` tersedia di image API (binary Prisma engine),
  - lockfile dilengkapi blok platform Linux untuk `lightningcss`/`@tailwindcss/oxide` (build web di Linux sebelumnya gagal).

### 2.2 Rehearsal CI-parity (Linux, MySQL 8.4)

- `lower_case_table_names=1` (paritas dengan lingkungan Windows pengembangan) → `prisma migrate deploy` **13/13 migrasi berhasil**.
- `seed:e2e` sukses; `npm run test --workspace api` → **27 tes lulus**; `test:integration` lulus.
- CI GitHub diselaraskan (MySQL 8.4 + flag yang sama) sehingga pipeline tidak lagi gagal di migrasi legacy.

### 2.3 Server tujuan (homeserver via Tailscale)

- Akses SSH berhasil (recon read-only; tidak ada perubahan yang dilakukan di server).
- Docker 26.1.4 + Compose v2.27.1; pengguna deploy termasuk grup `docker` (Docker tanpa sudo).
- Arsitektur x86_64 — cocok langsung dengan image yang dibuild di laptop (tanpa rebuild arsitektur).
- Disk mencukupi (ratusan GB tersedia); RAM 3,7 GB memadai untuk stack.
- Port 80 sudah dipakai layanan lain; port 443 bebas → jalur publik akan memakai **Cloudflare Tunnel** (pola yang sudah digunakan server ini untuk layanan lain, jadi tidak perlu membuka port rumah).

### 2.4 Database sumber (audit)

| Tabel | Isi saat ini | Keterangan |
|---|---|---|
| `program_kerja` | 155 baris | 153 resmi (139 `PUBLISHED` + 14 `ARCHIVED`) + **2 data uji `[UJI]`** |
| `program_kerja_photo` | 431 baris | sesuai baseline |
| `membership` | 633 baris | 623 `PUBLISHED` (rilis baru: unair 114, unesa 66) + **10 data uji `[UJI]`** (5 `SUBMITTED` + 5 `DRAFT`, semuanya di upnvjt) |
| `news` | 29 baris | 4 berita asli (`PUBLISHED`) + **25 data uji `[UJI]`** |
| `membership_import_*` | 1 batch + 5 baris | data uji impor |
| Akun CMS | 5 akun development | perlu akun admin produksi |

- Baseline `scripts/verify-initial-production.mjs` masih memakai angka lama (619 membership) → **harus diperbarui** ke rilis 623 sebelum gate dipakai.
- Bukti migrasi di `artifacts/migration/` masih dari September → diregenerasi dari dump final saat eksekusi.

### 2.5 Repositori

- 20 commit berkategori (feat/perf/fix/chore/docs/assets/data) sudah ter-push; `origin/main` == HEAD.

## 3. Rencana eksekusi

### Fase 1 — Privat (persiapan + deploy internal, tanpa akses publik)

1. Backup database sumber (`mysqldump --single-transaction --routines --triggers --events`), lalu bersihkan data uji `[UJI]`.
2. Perbarui baseline verifikasi ke rilis 623 + regenerasi bukti migrasi (`restore-verification.json`, `schema-readiness.json`, `SCHEMA_PLAN_HASH`) dari dump final.
3. Isi `SITE_DOMAIN` final dan `CORS_ORIGIN` di `.env.production`, lalu **rebuild image web** (alamat API di-bake saat build).
4. Transfer image (`docker save` + salin aman), dump database, dan berkas deploy (compose, Caddyfile, `.env.production`) ke homeserver.
5. Jalankan stack internal (db → preflight → api → web). Preflight bersifat *fail-closed*: memverifikasi mode migrasi, schema readiness, dan status migrasi sebelum API dijalankan; database direstore dari dump final.
6. Verifikasi data dengan `verify:initial-production` (harus cocok persis: 153 proker = 139 `PUBLISHED` + 14 `ARCHIVED`, 431 foto, 623 membership) + smoke test internal.

### Fase 2 — Publik

7. Cloudflare: arahkan domain ke Cloudflare, buat tunnel untuk hostname final, arahkan ke Caddy internal → HTTPS otomatis.
8. Smoke test publik menyeluruh (halaman publik, detail, foto, login CMS, unggah berkas).

## 4. Keputusan yang menunggu pemilik produk

1. **Domain:** `codebyreno.web.id` belum aktif di DNS publik. Sudah dimasukkan ke Cloudflare? (atau di registrar mana?)
2. **Alamat final:** rekomendasi `genbijatim.codebyreno.web.id` (atau langsung `codebyreno.web.id`).
3. **Izin pembersihan data uji `[UJI]`** (setelah backup dump).
4. **Akun admin CMS produksi:** username khusus + wajib ganti password saat login pertama.
5. **Izin mulai Fase 1.**

## 5. Catatan penting & risiko

- **Jangan** menjalankan `import.ts` (menghapus data); importer hanya untuk alur yang sudah disepakati.
- **Jangan** mengubah 431 foto program kerja sampai verifikasi produksi selesai (hash verifikasi).
- **Jangan** meng-commit `.env.production` (rahasia; hanya hidup di laptop & server).
- Image web saat ini masih memakai domain placeholder — wajib rebuild setelah domain final ditetapkan.
- Data uji `[UJI]` berasal dari `seed_uji_data.ts` (commit `a3c4a3e`).
- Detail akses server (IP/kredensial) sengaja tidak ditulis di repositori ini.
- Setelah deployment stabil: pindahkan autentikasi SSH dari password ke kunci.

## 6. Fokus berikutnya (setelah laporan ini)

Optimasi website:

- Perampingan aset statis publik dan optimasi gambar berita.
- Optimasi foto program kerja (±108 MB) ditahan sampai verifikasi produksi selesai (hash verifikasi) — direncanakan menyusul.
- Pengukuran kinerja sebelum/sesudah (Lighthouse/PageSpeed).
- Cache & kompresi: `revalidate` 60 detik sudah aktif; kompresi Caddy aktif saat deploy; cache Cloudflare menyusul saat domain aktif.

## 7. Referensi

- `docs/production-deployment.md` — runbook deployment lengkap.
- `docs/initial-production-verification.md` — kriteria verifikasi produksi.
- `docs/adr/0019-docker-compose-vps-deployment.md` — ADR keputusan Docker Compose langsung-produksi.
- `scripts/verify-initial-production.mjs`, `scripts/check-schema-readiness.mjs`, `scripts/check-migration-mode.mjs` — gate verifikasi.
