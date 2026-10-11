# Laporan Kesiapan Deployment — Homeserver

**Tanggal:** 11 Oktober 2026
**Basis snapshot laporan awal:** `42eb760` — catatan branch/worktree pada tanggal laporan; bukan klaim kondisi Git saat ini
**Status:** Persiapan lanjut — domain & topologi ingress sudah dikonfirmasi (Bagian 2.3 & 4). **Belum GO penuh**: sisa gerbang = tunnel + TUNNEL_TOKEN, akun admin CMS produksi, backup off-host terenkripsi, dan lampu hijau pemilik untuk eksekusi Fase 1 (transfer + deploy privat).

## 1. Ringkasan

Laporan ini mencatat rehearsal persiapan yang dilakukan sebelumnya, bukan otorisasi deploy saat ini. Image/test yang pernah berhasil tidak membuktikan runtime detail, konfigurasi ingress baru, atau backup off-host siap; verifikasi tersebut harus diulang terhadap konfigurasi rilis yang disetujui.

- Aplikasi berhasil di-build menjadi image Docker produksi dan berjalan (smoke test lulus).
- Seluruh rantai migrasi database (13 migrasi) lulus di Linux, bersama seed dan 27 tes API + tes integrasi.
- Server tujuan (homeserver pemilik produk, diakses via Tailscale) sudah diperiksa: Docker + Compose siap, arsitektur cocok, ruang disk cukup.
- Database sumber telah dibersihkan dari sisa data uji `[UJI]` setelah backup (11 Okt 2026) — rincian di Bagian 2.4.
- CI GitHub diperbaiki agar mendukung migrasi di Linux.

Deployment menunggu sisa keputusan pemilik produk (Bagian 4) — domain dan topologi ingress sudah diputuskan.

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
- Port 80 dilaporkan sudah dipakai layanan lain; port 443 bebas.
- **Keputusan pemilik (11 Oktober 2026): topologi ingress final = Cloudflare Tunnel.** Compose kini punya service `cloudflared` yang hanya aktif dengan `--profile tunnel`, membaca `TUNNEL_TOKEN` dari environment (bukan argv), dan dipin ke `cloudflare/cloudflared:2026.10.0`; Caddyfile memakai `auto_https {$CADDY_AUTO_HTTPS:on}` sehingga mode tunnel dapat menyajikan HTTP ke origin. Default direct-ingress tidak berubah. Yang masih harus diisi operator: tunnel ID/token (saat setup); hostname publik yang diputuskan: `genbijatim.codebyreno.my.id`; origin target `http://caddy:80` — tidak ada yang dikarang di repositori. Tidak ada port/firewall/TLS/origin yang diubah otomatis.

### 2.4 Database sumber (audit)

| Tabel | Isi saat ini | Keterangan |
|---|---|---|
| `program_kerja` | 153 baris | 139 `PUBLISHED` + 14 `ARCHIVED`; 2 record `[UJI]` dihapus 11 Okt 2026 setelah backup |
| `program_kerja_photo` | 431 baris | sesuai baseline |
| `membership` | 623 baris | rilis 2025/2026 (unair 114, unesa 66); 10 record `[UJI]` dihapus |
| `news` | 4 baris | semuanya berita asli `PUBLISHED`; 25 record uji dihapus |
| `membership_import_*` | 0 baris | batch impor uji (1 preview + 5 baris) dihapus |
| Akun CMS | 5 akun development | perlu akun admin produksi |

- Pembersihan data uji dijalankan lewat `scripts/purge-test-records.mjs` dengan gate approval (`manifestSha256`) + manifest backup wajib; laporan di `backups/purge-report-20261011T140651Z.json`.
- Backup sebelum pembersihan: `backups/genbi_jatim_initial_production-20261011T140638Z.sql` (787.049 byte, SHA-256 `40ee4984dbb4bf07d3d7247cdc60949e402d625d1f10b5bc8c138fe81ca898f3`), plus **7 arsip media + 1 salinan verbatim** dengan hash di `backups/media-20261011T135244Z.backup-manifest.json` (1.001 file / 949 MB). **Belum off-host** — pemilik akan menyalin manual.
- Baseline `scripts/verify-initial-production.mjs` **sudah diperbarui** ke rilis 623 (total 623, 101 tanpa divisi, unair 114, unesa 66); `npm run verify:initial-production` melaporkan `status: verified` dengan 0 selisih.
- 34 file di `apps/api/public/uploads/news` kini tanpa referensi DB (1,85 MB) akibat penghapusan cover asset uji — **sengaja tidak dihapus**; lihat `docs/optimization/orphan-media-report.json`.
- Bukti migrasi di `artifacts/migration/` masih dari September → diregenerasi dari dump final saat eksekusi.

### 2.5 Repositori

- 23 commit berkategori (feat/perf/fix/chore/docs/assets/data) ter-push; `origin/main` == HEAD (per 11 Okt 2026, termasuk pembaruan dokumen ini).
- Batch perubahan tambahan (purge/backup lokal, konfigurasi `cloudflared`, tes) masih di working tree — belum di-commit.

## 3. Rencana eksekusi

### Fase 1 — Privat (persiapan + deploy internal, tanpa akses publik)

1. ~~Backup database sumber, lalu bersihkan data uji `[UJI]`.~~ **Selesai 11 Okt 2026:** dump pra-pembersihan + 7 arsip media + 1 salinan verbatim dibuat & diverifikasi di `backups/` (juga sudah disalin off-host oleh pemilik), lalu pembersihan dijalankan lewat [purge-test-records.mjs](<scripts/purge-test-records.mjs>) yang bergate approval-hash + manifest-backup. Hasil: 153 proker / 431 foto / 623 membership / 4 berita.
2. Baseline verifikasi **sudah diperbarui** ke rilis 623 ([verify-initial-production.mjs](<scripts/verify-initial-production.mjs>)); sisa: regenerasi bukti migrasi (`restore-verification.json`, `schema-readiness.json`, `SCHEMA_PLAN_HASH`) dari dump final saat eksekusi.
3. Setelah pemilik memilih ingress dan domain final, isi `SITE_DOMAIN` dan `SITE_URL` di `.env.production`; review bahwa `CORS_ORIGIN` yang dibentuk Compose dari `SITE_DOMAIN` sesuai izin produk (nilai CORS_ORIGIN template tidak meng-override-nya). `SITE_DOMAIN` dipakai Caddy, sedangkan `SITE_URL` dipakai saat build dan runtime Web. **Rebuild image Web** karena URL metadata/client tertentu dibake saat build; validasi juga runtime `SITE_URL` melalui Compose.
4. Transfer image (`docker save` + salin aman), dump database, dan berkas deploy (compose, Caddyfile, `.env.production`) ke homeserver.
5. Jalankan stack internal (db → preflight → api → web). Preflight bersifat *fail-closed*: memverifikasi mode migrasi, schema readiness, dan status migrasi sebelum API dijalankan; database direstore dari dump final.
6. Verifikasi data dengan `verify:initial-production` (harus cocok persis: 153 proker = 139 `PUBLISHED` + 14 `ARCHIVED`, 431 foto, 623 membership). **Sudah lulus di lokal** (`status: verified`, 0 selisih) dan **Fase 0 smoke runtime sudah lulus 31/31** terhadap API+Web standalone di atas snapshot bersih ([bukti](<artifacts/phase0/phase0-runtime-smoke.json>)); sisa: ulangi smoke yang sama terhadap stack internal yang sudah ter-deploy.

### Fase 2 — Publik

7. Cloudflare Tunnel (topologi terpilih): buat tunnel remote-managed, arahkan origin ke `http://caddy:80`, isi `TUNNEL_TOKEN`, set `CADDY_AUTO_HTTPS=off`, dan **jangan** publikasikan 80/443. Jalankan dengan `--profile tunnel`. Jangan mengasumsikan TLS/origin benar tanpa menguji hostname publik final. Rincian di `docs/production-deployment.md` bagian B1.
8. Smoke test publik menyeluruh (halaman publik, detail, foto, login CMS, unggah berkas).

## 4. Keputusan yang menunggu pemilik produk

1. **Domain:** ✅ `codebyreno.my.id` **aktif di Cloudflare** (NS `jeremy.ns.cloudflare.com` + `magdalena.ns.cloudflare.com`, diverifikasi 11 Okt 2026). `codebyreno.web.id` tidak dipakai untuk rilis ini.
2. **Alamat final:** ✅ `genbijatim.codebyreno.my.id` (disetujui pemilik).
3. ~~**Izin pembersihan data uji `[UJI]`** (setelah backup dump).~~ **Disetujui dan sudah dijalankan** 11 Okt 2026 setelah backup terverifikasi.
4. **Akun admin CMS produksi:** username khusus + wajib ganti password saat login pertama.
5. **Topologi ingress final:** ✅ **Cloudflare Tunnel** (diputuskan 11 Okt 2026). Hostname publik final: `genbijatim.codebyreno.my.id`. Sisa: tunnel ID/token (saat setup), origin `http://caddy:80`.
6. **Backup/restore gate:** owner backup, destination off-host terenkripsi dan credential/access management, cakupan DB+media, jadwal/retensi, serta bukti restore drill. Tidak disiapkan otomatis oleh perubahan ini.
7. **Eksekusi sisa Fase 1** (isi `SITE_DOMAIN`/`SITE_URL` + rebuild image web + transfer + deploy privat). **(menunggu lampu hijau pemilik)**

## 5. Catatan penting & risiko

- **Jangan** menjalankan `import.ts` (menghapus data); importer hanya untuk alur yang sudah disepakati.
- **Jangan** mengubah 431 foto program kerja sampai verifikasi produksi selesai (hash verifikasi).
- **Jangan** meng-commit `.env.production` (rahasia; hanya hidup di laptop & server).
- Image web saat ini masih memakai domain placeholder — wajib rebuild setelah domain final ditetapkan.
- Data uji `[UJI]` berasal dari `seed_uji_data.ts` (commit `a3c4a3e`).
- Detail akses server (IP/kredensial) sengaja tidak ditulis di repositori ini.
- Setelah deployment stabil: pindahkan autentikasi SSH dari password ke kunci.

## 6. Fokus berikutnya (setelah laporan ini)

Optimasi website — status per 11 Oktober 2026:

- ✅ Aset struktur organisasi dikonversi ke WebP (24,96 MB → 1,75 MB, −93%); 11 SVG tak terpakai dihapus (±5,74 MB); image web 891 MB → 834 MB (commit `80f6c0a`).
- ✅ Sisa aset statis (hero/bnsp/background/raker) ditangani optimizer runtime `next/image`; gambar berita sudah `next/image` + `sizes`.
- Foto program kerja (±108 MB) ditahan sampai verifikasi produksi selesai (hash verifikasi) — menyusul.
- Pengukuran kinerja (Lighthouse/PageSpeed) dilewati atas keputusan pemilik.
- Cache & kompresi: `revalidate` 60 detik aktif; kompresi Caddy aktif saat deploy; cache Cloudflare menyusul setelah tunnel publik aktif.

## 7. Referensi

- `docs/production-deployment.md` — runbook deployment lengkap.
- `docs/initial-production-verification.md` — kriteria verifikasi produksi.
- `docs/adr/0019-docker-compose-vps-deployment.md` — ADR keputusan Docker Compose langsung-produksi.
- `scripts/verify-initial-production.mjs`, `scripts/check-schema-readiness.mjs`, `scripts/check-migration-mode.mjs` — gate verifikasi.
