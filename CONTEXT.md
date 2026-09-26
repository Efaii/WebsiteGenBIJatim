# GenBI Jatim Platform

Glosarium domain untuk platform GenBI Jatim yang mengelola data komisariat, periode kepengurusan, anggota, program kerja, dan konten publik.

## Organisasi

**Komisariat**:
Satu organisasi GenBI pada perguruan tinggi tertentu. Platform memiliki sembilan komisariat canonical: ITS, PENS, UIN Madura, UINSA, UNAIR, UNESA, UNUGIRI, UPN Veteran Jatim, dan UTM.
_Avoid_: Kampus, universitas, cabang (ketika yang dimaksud adalah organisasi GenBI).

**Periode**:
Satu masa kepengurusan yang diberi label seperti `2025/2026`. Periode menyimpan histori organisasi dan dapat muncul lebih dari satu untuk setiap komisariat.
_Avoid_: Tahun kalender, tahun import.

**Divisi**:
Kelompok kerja dalam satu komisariat pada satu periode. Nama divisi adalah milik scope komisariat-periode dan tidak boleh dinormalisasi secara global tanpa konfirmasi.
_Avoid_: Departemen global, kategori universal.

## Anggota

**Membership**:
Satu record keanggotaan seseorang pada satu komisariat dan periode, dengan jabatan, divisi opsional, dan prodi. Satu orang dapat memiliki beberapa membership pada periode berbeda.
_Avoid_: Akun, user, profil global.

**Person identity**:
Identitas lintas periode yang menghubungkan membership yang dipastikan merujuk pada orang yang sama. Identitas ini tidak boleh ditebak hanya dari nama tanpa review.
_Avoid_: Nama sebagai ID, username.

**Jabatan**:
Peran organisasi yang ditampilkan pada record membership, misalnya Ketua Umum, Sekretaris Divisi, atau Staff Divisi. Nilai tampilan dapat berbeda antar-komisariat; canonical position type hanya digunakan bila sudah disepakati.
_Avoid_: Role aplikasi.

**Prodi**:
Program studi anggota sebagaimana ditampilkan pada data komisariat. Pada fase awal prodi dipertahankan sebagai teks, bukan master lintas komisariat.
_Avoid_: Divisi, jurusan canonical global.

**Anggota tanpa divisi**:
Membership yang tidak memiliki divisi. Pada tampilan publik nilai divisi ditampilkan sebagai `-`, bukan dibuatkan divisi fiktif.
_Avoid_: Divisi Non Staff.

**Status membership**:
Keadaan keanggotaan pada suatu periode: `ACTIVE` atau `INACTIVE`. Histori periode lama tetap disimpan tanpa menggunakan status `ALUMNI`.
_Avoid_: Status publikasi, alumni sebagai status wajib.

## Program Kerja

**Program kerja**:
Satu kegiatan atau inisiatif yang dimiliki divisi pada komisariat dan periode tertentu. Program kerja dapat difilter berdasarkan periode, divisi, status pelaksanaan, dan judul.
_Avoid_: Event umum (kecuali memang dimodelkan sebagai event terpisah).

**Status publikasi**:
Keadaan review dan visibilitas data: `DRAFT`, `SUBMITTED`, `APPROVED`, `PUBLISHED`, `REJECTED`, atau `ARCHIVED`.
_Avoid_: Status pelaksanaan.

**Status pelaksanaan**:
Keadaan kegiatan program kerja, terpisah dari status publikasi: `PLANNED`, `ONGOING`, `COMPLETED`, atau `CANCELLED`.
_Avoid_: Status approval.

**Tanggal kalender tidak tersedia**:
Program kerja pada periode yang diketahui, tetapi sumber data tidak menyediakan tanggal kalender yang dapat dipastikan. Untuk periode 2025/2026, program kerja tetap dapat berstatus `COMPLETED`; tampilan publik memakai label periode, bukan tanggal kalender rekaan.
_Avoid_: Mengisi tanggal sentinel atau menebak tanggal pelaksanaan.

**Legacy-only pada rekonsiliasi**:
Record yang ada di database tetapi tidak muncul pada Excel terbaru. Dalam rekonsiliasi periode 2025/2026, istilah ini menunjukkan perbedaan cakupan source, bukan periode lama; record tetap dipertahankan dan tidak dihapus otomatis.
_Avoid_: Mengarsipkan atau memindahkan record hanya karena tidak ada pada Excel terbaru.

**Proposal/LPJ**:
Artefak privat yang melekat pada program kerja. Proposal dan LPJ dapat dilihat akun CMS setelah program kerja berstatus `APPROVED`, tetapi tidak dapat diakses publik.
_Avoid_: Dokumen publik umum.

## Akses dan Konten

**Admin global**:
Aktor CMS lintas seluruh komisariat yang mengelola akun operator, berita, dan approval data.
_Avoid_: Admin komisariat scoped.

**Sekretaris umum**:
Akun operasional bersama pada scope komisariat dan periode untuk mengelola data anggota.
_Avoid_: Admin global, membership individu.

**Sekretaris divisi**:
Akun operasional bersama pada scope komisariat, periode, dan divisi untuk mengelola program kerja divisinya.
_Avoid_: Divisi sebagai role global.

**Berita**:
Konten publik yang dibuat dan dikelola admin global melalui CMS dengan lifecycle publikasi tersendiri. Data berita dimulai dari database kosong pada release awal.
_Avoid_: Static news fixture sebagai source of truth.

**Akun bersama**:
Akun CMS berbasis scope operasional, bukan identitas personal. Audit hanya dapat mengidentifikasi scope akun; admin global dapat mereset password atau menonaktifkan assignment.
_Avoid_: Registrasi publik, audit individu.

## Kontrak API

**Kontrak API canonical**:
Bentuk request dan response versioned yang menjadi batas resmi antara client, CMS, importer, dan API. Kontrak ini memakai nama domain canonical dan tidak mengekspos bentuk persistence secara langsung.
_Avoid_: Payload database, tipe UI sebagai kontrak runtime.

**Response envelope**:
Wrapper stabil untuk response API yang memuat `data` untuk hasil sukses atau `error` untuk kegagalan, dengan metadata pagination bila relevan. Endpoint baru tidak mengembalikan array/object mentah sebagai bentuk kontrak.
_Avoid_: `success` boolean tanpa error detail, bentuk response per-route yang tidak seragam.

**Validation boundary**:
Lapisan tempat suatu aturan diperiksa: transport memvalidasi bentuk dan tipe input, application memvalidasi authorization dan transition, domain memvalidasi invariant, dan persistence menegakkan constraint penyimpanan.
_Avoid_: Mengandalkan client validation atau database sebagai satu-satunya validator.

**Status publikasi** dan **status pelaksanaan**:
Dua dimensi independen pada Program kerja. Status publikasi mengatur review dan visibilitas (`DRAFT`, `SUBMITTED`, `APPROVED`, `PUBLISHED`, `REJECTED`, `ARCHIVED`), sedangkan status pelaksanaan mengatur keadaan kegiatan (`PLANNED`, `ONGOING`, `COMPLETED`, `CANCELLED`).
_Avoid_: Satu field `status` yang mencampur approval dengan keadaan kegiatan.

**Legacy adapter**:
Komponen kompatibilitas yang membaca payload lama seperti `ProkerData` atau array mentah dan memetakannya ke model canonical pada boundary API/client. Adapter bukan source of truth dan tidak boleh memperluas legacy payload ke endpoint versioned.
_Avoid_: Menjadikan payload legacy sebagai shared domain type baru.

## Batas Konten Publik Komisariat

**Arsip komisariat**:
Konten arsip internal pada halaman detail komisariat, termasuk tab Awardee, Arsip, dan referensi Proposal/LPJ yang bersifat dokumentasi komisariat. Konten ini tidak termasuk release frontend publik dan tidak boleh ditampilkan sebagai bagian dari detail komisariat.
_Avoid_: Menganggap arsip komisariat sebagai sumber akses Proposal/LPJ.

**Dokumentasi program kerja**:
Galeri foto atau dokumentasi kegiatan yang melekat pada satu Program kerja. Dokumentasi ini tetap dapat ditampilkan pada detail Program kerja dan berbeda dari arsip komisariat serta halaman Dokumen umum.
_Avoid_: Menghapus dokumentasi Program kerja ketika menghapus halaman Dokumen umum.

## Presentasi Publik

**Beranda**:
Halaman publik utama (landing page) yang menjadi titik masuk situs: menyusun narasi identitas organisasi, ringkasan metrik, akses ke platform lain, berita terbaru, dan FAQ. Beranda berbeda dari Daftar Program kerja dan Detail Komisariat.
_Avoid_: Menyamakan Beranda dengan halaman daftar Program kerja atau Detail Komisariat.

**Profil**:
Halaman publik tentang organisasi yang menggantikan "Tentang Kami" pada navigasi dan dipilih per periode kepengurusan. Bagian naratif (visi, misi, nilai, pilar) bersifat lintas periode; bagian yang bergantung periode mengikuti periode yang dipilih.
_Avoid_: Menyebut Profil sebagai Tentang Kami, atau mencampur data beberapa periode dalam satu tampilan.

**Struktur organisasi**:
Susunan pengurus satu komisariat pada satu periode, ditampilkan sebagai BPH terlebih dahulu lalu per divisi. Setiap entri memuat nama dan jabatan, dan diturunkan dari Membership; anggota tanpa divisi tidak ditampilkan di sini.
_Avoid_: Menyimpan jabatan di sumber manual terpisah, atau memasukkan anggota tanpa divisi ke struktur.

## Migrasi dan Rilis

**Snapshot hasil rekonsiliasi**:
Keadaan konsisten database, file dokumentasi, dan manifest hash setelah rekonsiliasi Program Kerja selesai. Snapshot ini adalah sumber promosi ke staging; bukan izin untuk menjalankan rekonsiliasi ulang.
_Avoid_: Backup database saja, hasil lokal tanpa manifest file.

**Snapshot ID**:
Identifier yang mengikat dump database, bundle file dokumentasi, dan manifest hash yang dibuat dari satu keadaan sumber yang dibekukan.
_Avoid_: Timestamp file individual, backup hash sebagai satu-satunya identifier.

**Release ID**:
Identifier promosi yang menggabungkan snapshot ID, short commit SHA, timestamp, backup SHA-256, dan manifest SHA-256 untuk audit satu paket deployment.
_Avoid_: Nomor deployment tanpa referensi snapshot.

**Staging acceptance**:
Verifikasi terkontrol pada database dan storage staging baru bahwa schema, migration history, data Program Kerja, file dokumentasi, hash, API, dan CMS access boundary memenuhi expected values sebelum traffic dipindahkan.
_Avoid_: Smoke test lokal, readiness file lokal, technical completion.

**Technical completion**:
Implementasi dan test lokal telah selesai, tetapi belum berarti hasil diterima di staging atau aman dipromosikan ke production.
_Avoid_: Deployment acceptance, production completion.

**Provenance gate**:
Pemeriksaan bahwa snapshot hasil rekonsiliasi benar-benar berasal dari satu keadaan sumber yang frozen, memiliki expected counts dan hash yang cocok, serta memiliki schema dan migration history yang dapat diverifikasi sebelum dipromosikan.
_Avoid_: Validasi setelah promosi, kepercayaan pada hasil lokal tanpa bukti.

**Staging cutover**:
Perpindahan target aktif staging melalui konfigurasi environment atau connection alias setelah snapshot baru lulus acceptance, tanpa rename, overwrite, atau reset database staging lama.
_Avoid_: Rename database, restore langsung ke target lama.

**Promotion runbook**:
Alur reproducible untuk membuat snapshot, memverifikasi provenance, merestore ke staging, memverifikasi file/hash/API, dan menulis promotion manifest dengan default fail-closed.
_Avoid_: Urutan command manual tanpa manifest atau rollback target.

**Akun test staging**:
Akun CMS khusus environment staging yang dipakai untuk authenticated smoke test dan tidak memakai credential personal atau production. Untuk archive retrieval, role canonical yang dipilih adalah `ADMIN_GLOBAL`.
_Avoid_: Akun production, akun personal, anonymous smoke test.

**Expected acceptance metrics**:
Sekumpulan nilai yang diverifikasi per dimensi, bukan dijumlahkan lintas dimensi: 153 total Program Kerja dengan 139 `PUBLISHED` dan 14 `ARCHIVED`; 12 `CANCELLED` sebagai status pelaksanaan; serta 431 child-photo rows, 431 file tersedia dan hash cocok, 207 WebP baru, dan 186 source image tetap utuh.
_Avoid_: Menambahkan 12 cancelled ke total program, menyamakan child-photo rows dengan file unik.

**Promotion artifact retention**:
Kebijakan penyimpanan paket dump, bundle file, manifest, dan evidence setelah promosi. Artifact lengkap disimpan minimal 30 hari; manifest dan evidence dipertahankan lebih lama sesuai kebijakan backup organisasi.
_Avoid_: Menghapus artifact segera setelah cutover.

**Rollback window**:
Periode setelah staging cutover ketika environment staging lama tetap tersedia sebagai target pemulihan. Untuk promosi ini window default adalah 24 jam setelah acceptance berhasil.
_Avoid_: Menghapus staging lama segera setelah switch.

**Deployment acceptance**:
Keadaan ketika provenance, schema, migration history, data, storage, API, authenticated CMS, approval owner, promotion manifest, dan rollback evidence seluruhnya lulus. Issue technical completion belum boleh ditutup sebelum keadaan ini tercapai.
_Avoid_: Test lokal lengkap, schema ready saja, technical completion.

**Promotion approval**:
Persetujuan eksplisit untuk memindahkan snapshot hasil rekonsiliasi ke staging dan melakukan cutover. Database owner menyetujui restore/schema, sedangkan application atau deployment owner menyetujui cutover; automation tidak menggantikan kedua approval tersebut.
_Avoid_: Persetujuan implicit dari pipeline, schema approval saja.

**Snapshot source resmi**:
Database lokal hasil Issue #20 yang telah lulus provenance gate dan dibekukan sebelum dump database, bundle file, serta manifest hash dibuat. Backup sebelum migrasi bukan source resmi untuk promosi ini.
_Avoid_: Database legacy sebelum rekonsiliasi, hasil lokal tanpa freeze.

**Promotion manifest**:
Catatan resmi machine-readable dan human-readable yang mengikat snapshot ID, release ID, source freeze marker, commit, backup/hash manifest, expected acceptance metrics, target staging, approval references, dan rollback target.
_Avoid_: Komentar deployment tanpa hash, daftar file tanpa database identity.

**Restore approval**:
Environment approval phrase exact yang mengizinkan restore snapshot ke target staging baru setelah provenance dan target safety checks lulus. Restore approval tidak mengizinkan cutover.
_Avoid_: Restore otomatis karena pipeline berhasil, cutover approval.

**Cutover approval**:
Environment approval phrase exact yang mengizinkan connection/config alias staging dipindahkan ke target yang sudah lulus deployment acceptance. Cutover approval tidak mengizinkan restore ke target.
_Avoid_: Restore approval, switch otomatis tanpa owner.

**Source freeze marker**:
Bukti operator bahwa write database dan storage source dihentikan pada interval tertentu ketika snapshot dibuat, dengan source identity, operator, waktu, expected metrics, dan completion status.
_Avoid_: Timestamp dump saja, asumsi bahwa database dan file selalu konsisten.

**Run-specific staging target**:
Database dan storage namespace baru yang memuat unique run ID dan tidak pernah serupa dengan target aktif, sehingga restore tidak dapat menimpa environment staging lama atau target sebelumnya.
_Avoid_: Target staging bersama, reset target existing.

**Restore staging approval**:
Phrase exact `SETUJUI RESTORE STAGING` yang diperlukan untuk merestore promotion snapshot ke run-specific staging target. Approval ini terpisah dari schema, data, dan cutover approval.
_Avoid_: Schema approval sebagai izin restore, approval implicit pipeline.

**Staging cutover approval**:
Phrase exact `SETUJUI CUTOVER STAGING` yang diperlukan untuk memindahkan connection/config alias ke staging target yang sudah lulus deployment acceptance.
_Avoid_: Restore approval, switch tanpa owner approval.

**Secure promotion artifact storage**:
Penyimpanan terenkripsi dan terbatas untuk database dump, WebP bundle, manifest, freeze marker, dan evidence promosi. Repository hanya menyimpan tooling, runbook, dan metadata non-rahasia.
_Avoid_: Commit dump ke git, GitHub release asset untuk database snapshot, folder lokal sebagai storage resmi.

**Fail-closed promotion**:
Perilaku promotion tooling yang menghentikan proses sebelum write/restore/cutover ketika freeze marker, expected metrics, hash, approval, atau target safety check tidak valid, sambil mempertahankan evidence diagnosis tanpa overwrite.
_Avoid_: Warning-only promotion, retry yang menyamarkan mismatch, overwrite target.

**Promotion manifest schema**:
Schema minimum manifest yang memuat `snapshotId`, `releaseId`, `sourceDatabase`, `sourceFreezeMarker`, `commitSha`, `backupSha256`, `fileManifestSha256`, `expectedMetrics`, `actualMetrics`, `sourceArtifactLocations`, `targetDatabase`, `targetStorageNamespace`, `approvalReferences`, `rollbackTarget`, `retentionUntil`, dan `status`.
_Avoid_: Manifest tanpa target identity, hash, variance, approval, atau rollback target.

**Freeze sign-off**:
Konfirmasi bersama application owner dan operator bahwa source hasil Issue #20 boleh dibekukan dan dijadikan snapshot source resmi. Database owner tetap menyetujui restore/schema secara terpisah.
_Avoid_: Freeze marker operator-only, schema approval sebagai freeze sign-off.

**Secret-runner credential**:
Credential yang diinjeksikan hanya melalui environment/secret runner untuk source database, secure artifact storage, staging, dan akun test CMS. Credential tidak ditulis ke manifest, log, issue, atau repository.
_Avoid_: Credential di `.env` tracked, prompt interaktif yang tidak diaudit, secret di artifact.

**Verification-only command**:
Command seperti `verify-staging` atau `write-promotion-manifest` yang hanya membaca/menghasilkan evidence. Command ini tidak boleh melakukan cutover; cutover adalah operasi terpisah dengan `SETUJUI CUTOVER STAGING`.
_Avoid_: Verify yang sekaligus switch traffic.

**Dokumentasi kolaboratif**:
Dokumentasi kegiatan yang dipakai oleh lebih dari satu Program kerja karena kegiatan tersebut melibatkan beberapa divisi. Satu file dapat direferensikan oleh beberapa Program kerja tanpa dianggap sebagai duplikasi dalam konteks masing-masing program; duplikasi hanya dicegah ketika file yang sama sudah terhubung ke Program kerja yang sama.
_Avoid_: Menganggap penggunaan lintas divisi sebagai kesalahan atau menghapus salah satu referensi.

**Proposal/LPJ privat**:
Artefak Proposal atau LPJ Program kerja yang diakses melalui endpoint privat terautentikasi setelah kebijakan approval terpenuhi. Artefak ini tidak ditampilkan pada halaman publik komisariat atau sebagai arsip publik.
_Avoid_: Menampilkan Proposal/LPJ pada tab Arsip komisariat atau menaruhnya sebagai static/public asset.

**Awardee**:
Subset atau projection publik dari Membership yang berstatus `ACTIVE` dan `PUBLISHED`, ditampilkan berdasarkan komisariat dan periode. Field tampilan awalnya adalah nama, jabatan, dan prodi; Awardee bukan source data terpisah dari Membership.
_Avoid_: Membuat mock Awardee sebagai source of truth atau mencampur Awardee lintas periode tanpa filter.

**Initial production source**:
Database local baru yang bersih dari record test dan dipakai sebagai sumber initial production setelah schema, Program Kerja, dan Membership menerima verifikasi local. Ini bukan staging environment dan bukan database development yang memuat fixture/test data.
_Avoid_: Mempromosikan database development yang masih berisi komisariat, periode, divisi, atau membership test.

**Membership release 2025/2026**:
Seluruh 619 baris pada workbook anggota resmi dipetakan ke periode `2025/2026` dan boleh dipublikasikan setelah validasi import. Normalisasi sumber yang disepakati adalah `BPH 1`, `BPH 2`, dan `BPH 3` menjadi `BPH`, serta typo `Linkungan` menjadi `Lingkungan`; nama `Media Komunikasi & Hubungan Luar` dipertahankan.
_Avoid_: Menebak periode dari tanggal import atau mempublikasikan data sebelum validasi baris selesai.
