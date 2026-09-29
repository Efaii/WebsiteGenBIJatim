"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../lib/prisma");
const xlsx = __importStar(require("@e965/xlsx"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function assertSchemaReady() {
    const configuredPath = process.env.SCHEMA_READINESS_PATH;
    const candidates = configuredPath
        ? [path.resolve(configuredPath)]
        : [path.resolve(__dirname, "../../../artifacts/migration/schema-readiness.json"), path.resolve(__dirname, "../../../../artifacts/migration/schema-readiness.json")];
    const evidencePath = candidates.find((candidate) => fs.existsSync(candidate));
    if (!evidencePath)
        throw new Error(`Schema readiness evidence is missing at ${candidates[0]}; data migration is blocked.`);
    let evidence;
    try {
        evidence = JSON.parse(fs.readFileSync(evidencePath, "utf8"));
    }
    catch {
        throw new Error(`Schema readiness evidence is invalid at ${evidencePath}; data migration is blocked.`);
    }
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl)
        throw new Error("DATABASE_URL is required to bind schema readiness evidence; data migration is blocked.");
    const database = decodeURIComponent(new URL(databaseUrl).pathname.replace(/^\//, ""));
    if (evidence.status !== "ready")
        throw new Error(`Schema readiness is ${evidence.status ?? "unknown"}; data migration is blocked. Resolve the schema preflight first.`);
    if (evidence.dataMigrationReady !== true || evidence.migrationApplied !== true)
        throw new Error("Schema readiness does not confirm deployed Prisma migration history; data migration is blocked.");
    if (evidence.schemaApproval !== "SETUJUI SCHEMA MIGRASI")
        throw new Error("Schema readiness is missing exact schema approval evidence; data migration is blocked.");
    if (evidence.database !== database)
        throw new Error(`Schema readiness targets ${evidence.database ?? "unknown"}, not ${database}; data migration is blocked.`);
    if (!evidence.expiresAt || Date.parse(evidence.expiresAt) <= Date.now())
        throw new Error("Schema readiness evidence is expired or missing an expiry; data migration is blocked.");
    if (!evidence.planHash || (process.env.SCHEMA_PLAN_HASH && evidence.planHash !== process.env.SCHEMA_PLAN_HASH))
        throw new Error("Schema readiness planHash is missing or does not match the approved plan; data migration is blocked.");
    const restorePath = process.env.RESTORE_EVIDENCE_PATH
        ? path.resolve(process.env.RESTORE_EVIDENCE_PATH)
        : [path.resolve(__dirname, "../../../artifacts/migration/restore-verification.json"), path.resolve(__dirname, "../../../../artifacts/migration/restore-verification.json")].find((candidate) => fs.existsSync(candidate));
    if (!restorePath || !fs.existsSync(restorePath))
        throw new Error("Backup restore evidence is missing; data migration is blocked.");
    let restoreEvidence;
    try {
        restoreEvidence = JSON.parse(fs.readFileSync(restorePath, "utf8"));
    }
    catch {
        throw new Error("Backup restore evidence is invalid; data migration is blocked.");
    }
    if (restoreEvidence.status !== "verified" || restoreEvidence.sourceDatabase !== database || !restoreEvidence.backupSha256 || !/^[a-f0-9]{64}$/i.test(restoreEvidence.backupSha256) || !restoreEvidence.expiresAt || Date.parse(restoreEvidence.expiresAt) <= Date.now())
        throw new Error("Backup restore evidence is missing, expired, or targets another database; data migration is blocked.");
    if (process.env.DATA_MIGRATION_APPROVAL !== "SETUJUI DATA MIGRASI") {
        throw new Error('Data migration blocked. Set DATA_MIGRATION_APPROVAL="SETUJUI DATA MIGRASI" after reviewing the data migration plan.');
    }
}
// Helper untuk merapikan teks (mengubah "1. Teks  2. Teks" menjadi baris baru)
function formatText(text) {
    if (!text)
        return "";
    const str = String(text);
    // Mencari spasi yang diikuti dengan angka dan titik (misal " 1. ", "  2. ", "\n3. ")
    // dan menggantinya dengan newline \n secara konsisten
    return str.replace(/\s+(?=\d+\.\s)/g, '\n').trim();
}
async function main() {
    assertSchemaReady();
    // Default to ./data/excel if no arg is provided
    const targetDir = process.argv[2] || "./data/excel";
    const absoluteDir = path.resolve(process.cwd(), targetDir);
    if (!fs.existsSync(absoluteDir)) {
        console.error(`Folder tidak ditemukan: ${absoluteDir}`);
        console.error(`Harap buat folder tersebut dan letakkan file excel di dalamnya.`);
        process.exit(1);
    }
    const files = fs.readdirSync(absoluteDir).filter(file => file.endsWith('.xlsx') && !file.startsWith('~'));
    if (files.length === 0) {
        console.warn(`Tidak ada file .xlsx yang ditemukan di dalam folder: ${absoluteDir}`);
        process.exit(0);
    }
    console.log(`Ditemukan ${files.length} file Excel di ${absoluteDir}. Parsing file...`);
    const parsedRecords = [];
    for (const fileName of files) {
        const filePath = path.join(absoluteDir, fileName);
        console.log(`\n=================================================`);
        console.log(`Membaca file: ${fileName}`);
        console.log(`=================================================`);
        const workbook = xlsx.readFile(filePath);
        // Spesifik target sheet "ALL" sesuai instruksi user
        if (!workbook.Sheets["ALL"]) {
            console.warn(`[SKIP] Sheet "ALL" tidak ditemukan di dalam file ${fileName}. Melewati file ini.`);
            continue;
        }
        const worksheet = workbook.Sheets["ALL"];
        const data = xlsx.utils.sheet_to_json(worksheet);
        console.log(`Ditemukan ${data.length} baris data di sheet "ALL".`);
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const komisariatName = typeof row["komisariat"] === "string" ? row["komisariat"] : undefined;
            if (!komisariatName) {
                console.warn(`  [Baris ${i + 2}] Melewati data tanpa nama komisariat.`);
                continue;
            }
            const divisi = typeof row["divisi"] === "string" ? row["divisi"] : undefined;
            const program_ke = row["program_ke"];
            const nama_proker = typeof row["nama_proker"] === "string" ? row["nama_proker"] : undefined;
            const tanggal_proker = row["tanggal_proker"];
            const format_pelaksanaan = typeof row["format_pelaksanaan"] === "string" ? row["format_pelaksanaan"] : undefined;
            const status = typeof row["status"] === "string" ? row["status"] : undefined;
            const deskripsi_proker = row["deskripsi_proker"];
            const kpi_tuk_target = row["kpi_tuk_target"];
            const dampak = row["dampak"];
            const evaluasi = row["evaluasi"];
            const foto1 = typeof row["foto1"] === "string" ? row["foto1"] : null;
            const foto2 = typeof row["foto2"] === "string" ? row["foto2"] : null;
            const foto3 = typeof row["foto3"] === "string" ? row["foto3"] : null;
            const foto4 = typeof row["foto4"] === "string" ? row["foto4"] : null;
            const foto5 = typeof row["foto5"] === "string" ? row["foto5"] : null;
            const foto6 = typeof row["foto6"] === "string" ? row["foto6"] : null;
            // Konversi format tanggal otomatis dari Excel Serial Number atau String biasa
            let parsedDate = null;
            if (tanggal_proker) {
                if (typeof tanggal_proker === "number") {
                    // Konversi dari base 1900 format Excel ke format JS Date
                    parsedDate = new Date(Math.round((tanggal_proker - 25569) * 86400 * 1000));
                }
                else if (typeof tanggal_proker === "string" || tanggal_proker instanceof Date) {
                    parsedDate = new Date(tanggal_proker);
                }
            }
            if (parsedDate && isNaN(parsedDate.getTime()))
                parsedDate = null;
            parsedRecords.push({
                fileName,
                rowIndex: i + 2,
                komisariatName,
                divisi: divisi || "BPH",
                programKe: program_ke ? parseInt(String(program_ke)) : 1,
                namaProker: nama_proker || "Tanpa Nama",
                tanggalProker: parsedDate,
                dateLabel: parsedDate ? null : "Periode 2025/2026",
                formatPelaksanaan: format_pelaksanaan || "Offline",
                status: status || "Completed",
                deskripsiProker: formatText(deskripsi_proker),
                kpiTukTarget: formatText(kpi_tuk_target),
                dampak: formatText(dampak),
                evaluasi: formatText(evaluasi),
                foto1: foto1 || null,
                foto2: foto2 || null,
                foto3: foto3 || null,
                foto4: foto4 || null,
                foto5: foto5 || null,
                foto6: foto6 || null,
            });
        }
    }
    console.log(`\nParsing selesai. Total ${parsedRecords.length} proker valid siap diimport.`);
    console.log("Memulai transaksi database...");
    await prisma_1.prisma.$transaction(async (tx) => {
        console.log("Membersihkan data Program Kerja lama agar tidak terjadi duplikasi...");
        await tx.programKerja.deleteMany();
        console.log("Data lama berhasil dibersihkan! Memasukkan data baru...\n");
        for (const record of parsedRecords) {
            // Cari Commissariat berdasarkan nama (menggunakan contains agar fleksibel)
            let commissariat = await tx.commissariat.findFirst({
                where: {
                    name: {
                        contains: record.komisariatName,
                    },
                },
            });
            // Jika belum ada, auto-create profil komisariat tersebut
            if (!commissariat) {
                console.warn(`  [Baris ${record.rowIndex}] Komisariat '${record.komisariatName}' tidak ditemukan di database. Membuat baru otomatis...`);
                commissariat = await tx.commissariat.create({
                    data: {
                        slug: record.komisariatName.toLowerCase().replace("komisariat ", "").replace(/\s+/g, '-'),
                        name: record.komisariatName,
                        university: record.komisariatName.replace("Komisariat ", ""),
                        description: `Profil resmi dari ${record.komisariatName}.`,
                        logo: "/assets/logos/genbi.svg",
                    }
                });
            }
            await tx.programKerja.create({
                data: {
                    commissariatId: commissariat.id,
                    divisi: record.divisi,
                    programKe: record.programKe,
                    namaProker: record.namaProker,
                    tanggalProker: record.tanggalProker,
                    dateLabel: record.dateLabel,
                    formatPelaksanaan: record.formatPelaksanaan,
                    status: record.status,
                    deskripsiProker: record.deskripsiProker,
                    kpiTukTarget: record.kpiTukTarget,
                    dampak: record.dampak,
                    evaluasi: record.evaluasi,
                    foto1: record.foto1,
                    foto2: record.foto2,
                    foto3: record.foto3,
                    foto4: record.foto4,
                    foto5: record.foto5,
                    foto6: record.foto6,
                },
            });
            console.log(`  [Baris ${record.rowIndex}] ✔️ Sukses import proker: ${record.namaProker}`);
        }
    });
    console.log("\n✅ Semua file excel berhasil diproses dan dikirim ke database!");
}
main()
    .catch((e) => {
    console.error("Terjadi error fatal saat menjalankan import:", e);
    process.exit(1);
})
    .finally(async () => {
    await prisma_1.prisma.$disconnect();
});
