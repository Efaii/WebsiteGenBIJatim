# 0019. Deploy VPS memakai Docker Compose dan image Linux yang dibangun di laptop

- Status: accepted
- Tanggal: 2026-10-09
- Konteks: persiapan deployment awal Website GenBI Jatim ke VPS kecil, tanpa registry dan tanpa lingkungan staging

## Konteks

Monorepo terdiri atas Next.js, Express, Prisma, dan MySQL; API memerlukan modul native yang sesuai dengan OS target, sedangkan alamat API publik dan domain ditanam ke bundle Next.js saat build. VPS rencana awal memiliki sumber daya terbatas. Sumber produksi awal adalah dump database yang sudah diverifikasi; impor Excel tidak aman karena lebih lama daripada keadaan data yang direkonsiliasi.

## Keputusan

1. Jalankan MySQL, API, Web, dan Caddy sebagai layanan Docker Compose pada satu VPS Linux. Hanya Caddy yang mempublikasikan port 80/443; MySQL, API, dan Web hanya berkomunikasi pada jaringan internal.
2. Bangun API dan Web image pada laptop melalui Linux container. Jangan menyalin `node_modules` dari Windows. Distribusikan versi bertag sebagai arsip Docker melalui SSH/SCP; tidak ada registry. URL API publik dan `SITE_URL` adalah argumen build Web, sehingga perubahan domain memerlukan build image Web baru. Server-side Web memakai `API_URL=http://api:5000/api` melalui jaringan internal; jangan memakai hostname privat itu dalam URL browser.
3. Rilis awal langsung ke produksi tanpa staging, tetapi pertahankan preflight migrasi, backup/restore terverifikasi, pemeriksaan jumlah/hash data, health check, serta smoke test sebagai gerbang operasional.
4. Restore hanya dump database sumber `genbi_jatim_initial_production` yang telah diverifikasi ke DB kosong pada VPS. Sebelum migrasi, wajib lakukan backup-restore verification dan preflight historis/struktural yang ditinjau pemilik DB. Karena skema legacy dapat tidak memiliki migration history, `prisma migrate deploy` hanya setelah status readiness membuktikan histori/skema cocok dan satu kali melalui service profile eksplisit; bila tidak, hentikan rilis untuk prosedur DBA yang direview. Jangan menjalankan importer Program kerja, `db push`, atau `migrate resolve` sebagai jalan pintas.
5. Data MySQL dan media API adalah volume persisten terpisah; file galeri `/uploads/proker` yang disimpan di Web public merupakan bagian image Web. Volume bukan backup; backup terpisah harus disimpan dan diuji restore-nya.
6. Gunakan Caddy untuk HTTPS otomatis, kompresi, reverse proxy, dan cache header statis. Pengambilan data publik di Web dapat direvalidasi dalam 60 detik; request CMS tetap fresh dan mutasi tidak diberi cache publik.

## Alasan

- Linux container menghasilkan modul native untuk sistem operasi server dan menghindari pemasangan Node dependency pada VPS.
- Build di laptop memindahkan kerja kompilasi dari server kecil dan arsip bertag memudahkan transfer maupun pemilihan image rollback tanpa registry.
- Satu ingress TLS membatasi permukaan jaringan, sedangkan volume memisahkan media yang ditulis API dari aset statis versi kode.
- Tidak ada staging yang disepakati untuk rilis awal, tetapi verifikasi data dan skema tetap penting karena release menyentuh database produksi berisi data organisasi.

## Konsekuensi

- Build image, arsip transfer, dan konten foto Web memerlukan ruang disk dan waktu di laptop.
- Perubahan nama domain mengharuskan build Web baru; alamat publik tidak dapat dikoreksi hanya dengan environment runtime.
- Migrasi membutuhkan pemeriksaan skema historis yang dilakukan terpisah sebelum service profile migrasi dapat dijalankan. DB yang dibuat dari `db push` tidak otomatis dianggap kompatibel dengan histori Prisma.
- Operasi backup, restore, firewall, DNS, serta SSH masih manual dan harus dilakukan ketika VPS/domain telah tersedia.
- Tidak ada deployment yang dilakukan oleh keputusan ini; perubahan image/config di repo menyiapkan pelaksanaan mendatang.

## Alternatif yang ditolak

- **Build image di VPS**: mengonsumsi CPU dan RAM VPS kecil serta menambah kebutuhan toolchain pada server.
- **Copy `node_modules` Windows ke server**: tidak kompatibel dengan modul native Linux.
- **Menerbitkan port API/MySQL ke internet**: memperbesar paparan; semua akses aplikasi diarahkan melalui Caddy.
- **Build dari registry publik**: tidak diperlukan untuk rilis awal dan menambah layanan/credential di luar keputusan transfer image langsung.
- **Impor spreadsheet atau `db push` pada restore produksi**: berisiko menghapus data final, merusak riwayat migration, atau mengubah skema tanpa gerbang yang dapat ditinjau.
