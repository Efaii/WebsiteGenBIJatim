# Persiapan & Panduan Deploy Produksi GenBI Jatim

Panduan ini menyiapkan rilis ke satu VPS Linux melalui Docker Compose. Keputusan yang disepakati: image dibangun di laptop dan dikirim melalui SSH/SCP (tanpa registry), lalu langsung produksi (tanpa staging).

> **Belum untuk dijalankan ke server sekarang.** VPS/domain belum tersedia. Panduan ini dokumentasi persiapan, bukan persetujuan untuk migrasi atau restore. Jangan commit, deploy, atau memindahkan dump database/rahasia ke Git. Worktree berisi banyak perubahan user; jangan melakukan `git clean`/reset atau menghapus `dist`. Jangan jalankan importer proker `apps/api/src/scripts/import.ts`, `bootstrap_initial_production.ts`, atau importer membership tanpa prosedur dan persetujuan terpisah.

## Arsitektur singkat

- MySQL dan aplikasi berada di jaringan privat Compose. Caddy satu-satunya service yang membuka port 80/443 dan menangani HTTPS.
- Database tujuan: `genbi_jatim_initial_production`. Sumber data berupa dump database yang sudah diverifikasi, bukan spreadsheet/import.
- 661 foto proker di `apps/web/public/uploads/proker` dibake ke image web. Upload CMS tersimpan pada volume `api_public`/`api_private`, database pada `mysql_data`.
- GET publik di-cache dengan revalidasi 60 detik. CMS tetap segar dan POST kontak tetap tanpa cache. Update publik dapat terlambat sekitar satu menit.
- Rencana VPS: 2 vCPU, 4 GB RAM, SSD 80 GB. Beri ruang untuk image dan backup.

## A. Siapkan laptop Windows

1. Pasang Docker Desktop untuk Windows dan pastikan memakai **Linux containers**. Buka Docker Desktop dan tunggu statusnya berjalan. Di PowerShell dari root repo, jalankan `docker info` dan `docker compose version`; keluaran `docker info` harus memuat bagian `Server`. Jika gagal tersambung ke `dockerDesktopLinuxEngine`, daemon belum hidup—jangan lanjut build.
2. Salin template privat: `Copy-Item .env.production.example .env.production`, lalu buka `notepad .env.production`. Ganti semua teks `replace-with-*` dan `genbi.example.id`. Gunakan password MySQL terpisah dari password login admin. Password admin minimal 16 karakter; `JWT_SECRET` dan `SESSION_COOKIE_SECRET` wajib acak, berbeda, dan masing-masing minimal 32 karakter. Samakan user, password, dan nama DB di `DATABASE_URL` dengan variabel `DATABASE_*` di atasnya. URL-encode karakter khusus pada kredensial DB. Jangan simpan rahasia produksi di `.env.local`; file `.env.production` diabaikan Git.
3. Pastikan `SITE_DOMAIN` hanya host (contoh `www.domain-anda.id`, tanpa `https://` atau path), sedangkan `CORS_ORIGIN` harus `https://` ditambah host itu. Lalu periksa Compose: `docker compose --env-file .env.production config --quiet`. Berhasil tanpa keluaran berarti sintaks dan variabel wajib valid; tidak ada container yang dijalankan. Jangan salin keluaran penuh `config` ke chat/tiket karena memuat nilai rahasia. Ulangi pemeriksaan ini setelah ada perubahan konfigurasi.
4. Pilih tag unik untuk tiap rilis, misalnya `20261009-1`; tag yang sama harus digunakan pada laptop dan VPS. Di PowerShell tetapkan tag dan build: `$env:IMAGE_TAG = "20261009-1"`, lalu `docker compose --env-file .env.production build api web`. Tunggu sampai selesai. Build dilakukan di container Linux agar dependency native sesuai VPS—jangan menyalin `node_modules` Windows. URL API publik serta domain metadata dibake ke Web saat build, sehingga bila domain berubah Web harus dibangun ulang.
5. Buat arsip dan hitung hash transfer:

```powershell
New-Item -ItemType Directory -Force artifacts/deployment | Out-Null
docker save genbi-jatim-api:$env:IMAGE_TAG genbi-jatim-web:$env:IMAGE_TAG -o artifacts/deployment/genbi-jatim-images-$env:IMAGE_TAG.tar
Get-FileHash artifacts/deployment/genbi-jatim-images-$env:IMAGE_TAG.tar -Algorithm SHA256
```

Catat hash. Arsip bisa besar; `artifacts/` dan `*.tar` diabaikan Git.

## B. Siapkan VPS (setelah dibeli)

1. Buat VPS Linux LTS. Arahkan DNS A domain ke IPv4 server. Buat AAAA hanya bila IPv6 benar-benar berfungsi. Tunggu DNS menunjuk ke server sebelum Caddy meminta sertifikat.
2. Buat pengguna non-root, pasang public SSH key laptop, lalu uji login. Simpan akses konsol provider untuk pemulihan. Matikan SSH password/root hanya setelah login key teruji.
3. Pada Ubuntu, aturan firewall minimal:

```sh
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 443/udp
sudo ufw enable
sudo ufw status
```

Batasi firewall provider ke port tersebut juga. **Jangan buka 3306, 5000, atau 3000.** Jika SSH hanya boleh dari IP kantor/rumah tetap, batasi juga port 22 ke IP itu setelah akses console provider siap.
4. Pasang Docker Engine dan plugin Docker Compose resmi sesuai distro, lalu buat folder aplikasi milik akun deploy, misalnya `/opt/genbi-jatim`. Jangan gunakan Swarm.
5. Salin `docker-compose.yml`, `Caddyfile`, dan `.env.production` ke folder tersebut. `.env.production` memuat password, jadi kunci permission-nya (`chmod 600 .env.production`) dan jangan meletakkannya di folder web publik/Git. Nilai secret harus sama dengan saat image Web dibuat untuk domain tersebut. Siapkan direktori bukti migration privat sesuai `MIGRATION_EVIDENCE_DIR`; direktori itu kelak hanya berisi JSON readiness dan restore.
6. Dari PowerShell laptop, kirim arsip dengan SCP ke folder privat. Contoh: `scp artifacts/deployment/genbi-jatim-images-$env:IMAGE_TAG.tar deploy@IP-VPS:/opt/genbi-jatim/`. Kirim hash SHA-256 melalui kanal terpisah yang tepercaya.
7. Sambungkan ke VPS, masuk ke folder itu, cocokkan hash (`sha256sum genbi-jatim-images-TAG.tar`), lalu jalankan `docker load -i genbi-jatim-images-TAG.tar`. `docker load` hanya memasukkan image—belum menyalakan situs.
8. Dari PowerShell laptop, buat Docker context SSH tanpa menjadikannya context default: `docker context create production-vps --docker "host=ssh://deploy@IP-VPS"`, lalu uji `docker --context production-vps info`. Gunakan alamat/akun SSH yang sudah diuji; akun deploy perlu akses Docker pada VPS (akses Docker setara root; lindungi key SSH). Context ini memberi verifikator akses privat ke service Compose—jangan buka 3306 di firewall.

## C. Restore data dan preflight sebelum layanan

Langkah ini hanya berlaku bagi database VPS baru yang kosong.

1. Dari salinan lokal privat, buat dump konsisten dari `genbi_jatim_initial_production` menggunakan `mysqldump --single-transaction --routines --triggers --events`. Pastikan dump tidak kosong dan simpan terenkripsi karena berisi data pribadi anggota. Catat SHA-256; transfer dump hanya lewat SSH/SCP, jangan masukkan ke Git atau image.
2. Start database saja: `docker compose --env-file .env.production up -d db`, lalu `docker compose --env-file .env.production ps`. Tunggu status `healthy`. MySQL membuat DB dan akun hanya saat volume data masih baru. Jika volume sudah pernah digunakan, jangan menganggapnya kosong.
3. Impor ke DB kosong yang baru diinisialisasi. Sebelum restore, inspeksi header dump: jangan jalankan bila terdapat `CREATE DATABASE`, `DROP DATABASE`, `USE`, atau nama database sumber yang tertulis eksplisit—minta tinjauan operator DB dulu. Setelah cocok, dari VPS gunakan `docker compose --env-file .env.production exec -T db sh -c 'exec mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"' < dump.sql`. Cocokkan hash dump sebelum restore. Pastikan target bernama `genbi_jatim_initial_production`; jangan restore ke DB dev/DB berisi data. Simpan bukti backup/restore di lokasi privat. Lakukan gladi restore pada DB terisolasi lebih dulu bila proses ini belum pernah dicoba.
4. **Periksa backup restore dan riwayat migrasi sebelum menjalankan aplikasi.** Repo memiliki 13 migrasi, tetapi backup dapat berasal dari skema legacy/`db push`; jumlah migrasi saja bukan bukti siap. Pada mesin privat yang punya akses MySQL, jalankan dari checkout repo dan set `DATABASE_URL` ke DB sumber `genbi_jatim_initial_production` (hostname/akun yang dapat diakses mesin itu, atau `127.0.0.1` di container DB bila memakai Docker context SSH yang dijelaskan setelah langkah ini; jalankan `node` dari dalam repo). Bila laptop terhubung langsung ke MySQL VPS, gunakan TLS tepercaya; bila port DB tetap tertutup, atur `MYSQL_BIN`/`MYSQL_BIN_ARGS` dengan context SSH sebelum menjalankan script. Jangan kirim kredensial lewat tiket atau shell history bersama. Lalu jalankan `node scripts/legacy-schema-preflight.mjs restore <file-dump.sql> genbi_restore_<nama>` untuk menguji dump tanpa menyentuh sumber. Script menolak target sementara yang sudah ada, membersihkan target sukses, membandingkan struktur/isi tabel, dan mencatat hash dump yang diuji. Simpan `artifacts/migration/restore-verification.json` secara privat; bila pemeriksaan gagal, hentikan rilis. Setelah itu `inspect` (read-only) atau `plan` (hanya mencetak rencana) dapat membantu pemeriksaan. Review hasil lengkap bersama pemilik DB. Jangan jalankan `baseline` atau `apply` di produksi. Bila history hilang/tidak lengkap, skema berbeda, atau ragu, hentikan rilis—jangan pakai `db push`, `migrate resolve`, importer, atau bootstrap untuk memaksa lanjut.

Untuk preflight dari laptop tanpa membuka port MySQL, gunakan Docker context SSH ke VPS yang dibuat pada langkah B. Skrip berjalan pada checkout lokal (agar membaca dump/aset rilis lokal), sedangkan command MySQL dijalankan langsung di container DB jarak jauh:

```powershell
$env:MYSQL_BIN = "docker"
$env:MYSQL_BIN_ARGS = '["--context","production-vps","compose","--project-name","genbi-jatim","--env-file",".env.production","exec","-T","db","mysql"]'
```

Setel `DATABASE_URL` (preflight) atau `INITIAL_PRODUCTION_DATABASE_URL` (verifier) lewat environment rahasia dengan host `127.0.0.1:3306`; nilai itu dipakai mysql client di container DB, bukan koneksi laptop ke port 3306. Gunakan akun DBA hanya untuk `restore` (yang membuat dan menghapus DB sementara terisolasi); akun aplikasi hanya untuk pemeriksaan baca. Prefix di atas memakai context eksplisit—jangan mengganti default Docker context laptop, agar build dan `docker save` tetap memakai engine lokal.

5. Baca hasil `plan` bersama pemilik DB; hasil dapat memuat jumlah/baris atau nama migration dan tetap harus dirahasiakan. `plan` tidak mengubah DB. `verify` hanya membuat file readiness jika riwayat database sudah lengkap dan sama dengan seluruh migration di checkout (tidak ada satu pun migration repo yang pending/failed/unknown), struktur sesuai, dan tidak ada aksi skema tertunda. Artinya verifier ini bukan jalur untuk menyetujui atau menerapkan migration baru. Bila DB hasil `db push`, riwayat tidak lengkap, atau ada migration tertunda, verifikasi harus ditolak dan rilis berhenti untuk prosedur DBA terpisah yang direview. Jalankan `verify` hanya setelah pemilik DB meninjau plan dan bukti restore masih baru. Verifikasi mensyaratkan `SCHEMA_PLAN_HASH` dari plan dan `SCHEMA_MIGRATION_APPROVAL="SETUJUI SCHEMA MIGRASI"`; tanpa keduanya akan ditolak. Jangan jalankan `baseline`/`apply` di produksi dan jangan menganggap `verify` mengaplikasikan migration. Bila verify menolak migration history atau masih ada migration tertunda, hentikan rilis. Setelah status readiness valid, salin kedua berkas JSON dari `artifacts/migration/` ke folder privat yang sama di VPS dan set `MIGRATION_EVIDENCE_DIR` ke folder itu. Set `SCHEMA_PLAN_HASH` ke hash persis yang ditinjau pemilik DB. `SCHEMA_MIGRATION_APPROVAL="SETUJUI SCHEMA MIGRASI"` hanya diset pada proses `verify` terpisah setelah persetujuan final, tidak pernah di `.env.production` atau container Compose. `verify` menulis `schema-readiness.json` ke folder artifact secara default, termasuk manifest nama dan SHA-256 seluruh SQL migration yang ditinjau; digest itu juga tercakup oleh plan hash. Gate Compose membandingkan manifest dengan SQL persis di image; amankan file dan bukti restore. Compose menjalankan service preflight non-mutatif otomatis sebelum API dimulai. Preflight mewajibkan restore/readiness yang baru, plan hash yang disetujui, kecocokan semua SQL migration dengan image, dan hasil `prisma migrate status` up to date. Bila prasyarat tidak terpenuhi—termasuk bila ada migration pending—API gagal mulai dan rilis harus dihentikan. Preflight tidak pernah menjalankan `migrate deploy`. Untuk perubahan schema mendatang, tulis prosedur cutover khusus yang direview DBA sebelum dipakai.

```sh
docker compose --env-file .env.production up -d api web
```

6. Perintah di atas menjalankan database-name guard, readiness+restore guard (termasuk hash SQL migration image), lalu `prisma migrate status` sebagai pemeriksaan read-only sebelum API mulai. Status wajib `up to date`; bila pending, gagal, atau history tidak lengkap, command berhenti dan tidak ada SQL yang diterapkan. Readiness/approval tidak menyetujui migration pending. Target `db push`, history tidak lengkap, atau mismatch struktural memerlukan prosedur DBA terpisah yang direview—hentikan rilis. Periksa `docker compose --env-file .env.production ps` dan log privat; tunggu API dan Web `healthy`. Caddy sengaja belum dimulai, jadi port publik tetap tertutup saat verifier data berjalan.

7. Selagi Caddy belum dimulai dan API/Web sehat, jalankan verifier data dari PowerShell laptop pada checkout persis yang dipakai membangun image dan memiliki `data/proker/Dokumentasi Proker` (186 source image), dengan Docker context dan prefix di atas. Setel `INITIAL_PRODUCTION_DATABASE_URL` berisi kredensial baca DB target serta host `127.0.0.1`, lalu jalankan `npm run verify:initial-production`. Sengaja jangan set `INITIAL_PRODUCTION_API_URL` pada tahap ini; verifier memeriksa DB dan aset lokal, sedangkan pemeriksaan endpoint publik dilakukan setelah layanan dibuka. Baseline mencakup 153 proker (139 PUBLISHED, 14 ARCHIVED), 431 foto child, 619 membership, dan 186 source image. Verifier membandingkan hash foto terhadap `apps/web/public` di checkout lokal, bukan terhadap file di DB; pastikan checkout tidak berubah sejak image Web dibangun. Jangan ubah baseline supaya pemeriksaan lulus. Rahasiakan env dan laporan `artifacts/initial-production/`; bila verifier gagal, jangan mulai Caddy dan hentikan rilis sambil menyelidiki.

8. Hanya setelah verifier lulus dan pemilik DB menyetujui pembukaan layanan, dari VPS mulai Caddy: `docker compose --env-file .env.production up -d caddy`. Periksa `docker compose --env-file .env.production ps` dan `docker compose --env-file .env.production logs --tail=100 caddy`; tunggu HTTPS domain berfungsi. Jika verifikasi sebelumnya gagal, Caddy harus tetap berhenti.

9. Dari koneksi internet luar, cek `https://domain/health` (proses hidup), `https://domain/ready` (API dan DB siap), `https://domain/api/commissariats/proker`, homepage, `/program`, satu detail proker dan fotonya `/uploads/proker/...`, `/profil`, `/news`, `/awardee`, dan `/commissariat`. Lakukan login CMS, upload media kecil, dan kirim formulir kontak uji yang disepakati. Verifikasi perubahan CMS tidak tertahan cache; pembacaan publik boleh revalidasi hingga 60 detik. Pastikan hanya Caddy memetakan port host 80/443 dan cocokkan data sebelum menyatakan berhasil.

## D. Operasi dan pemulihan dasar

- Perintah Compose di bawah dijalankan dari folder yang berisi file Compose, `Caddyfile`, dan `.env.production`. `--env-file` dipakai agar Compose membaca file privat itu.
- Lihat status: `docker compose --env-file .env.production ps`. Ikuti log: `docker compose --env-file .env.production logs -f api`; tekan Ctrl+C hanya untuk menghentikan tampilan log.
- Restart container: `docker compose --env-file .env.production restart api web`. Hentikan layanan tanpa menghapus data: `docker compose --env-file .env.production down`. **Jangan menambahkan `-v`**—opsi itu menghapus volume DB dan media.
- Update: simpan tag lama; backup DB dan volume media; build serta transfer tag baru dengan urutan bagian A/B; verifikasi restore/migrasi; lalu `docker compose --env-file .env.production up -d api web caddy`. Rollback aplikasi berarti kembali ke tag lama, bukan membatalkan migrasi. Skema harus kompatibel; pulihkan backup lama hanya setelah menilai perubahan transaksi sejak backup.
- Volume Docker bukan backup. Simpan backup di luar VPS, terenkripsi, batasi aksesnya, dan uji restore secara terisolasi. Backup/monitoring otomatis belum disiapkan; tetapkan siapa operator, jadwal dan retensi backup sebelum situs menerima data produksi.

## Belum dapat diuji sekarang

VPS/domain belum tersedia, jadi DNS, HTTPS, firewall, kapasitas, restore nyata, dan smoke test internet masih menunggu. Konten Profil juga menunggu path sumber nama-jabatan-foto dari pemilik; jangan mengarang data placeholder.
