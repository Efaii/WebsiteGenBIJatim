import * as fs from "fs";
import * as path from "path";
import { PrismaClient } from "@prisma/client";
import stringSimilarity = require("string-similarity");
import sharp = require("sharp");
import { exiftool } from "exiftool-vendored";

const prisma = new PrismaClient();
const INPUT_DIR = path.join(__dirname, "../../data/images/Dokumentasi Proker");
const OUTPUT_DIR = path.join(__dirname, "../../../web/public/uploads/proker");

// Helper to recursively get leaf directories
function getLeafDirectories(dir: string, leafDirs: string[] = []) {
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    let hasFiles = false;
    for (const item of items) {
      if (item.isDirectory()) {
        getLeafDirectories(path.join(dir, item.name), leafDirs);
      } else {
        const ext = path.extname(item.name).toLowerCase();
        if ([".jpg", ".jpeg", ".png", ".arw"].includes(ext)) {
          hasFiles = true;
        }
      }
    }
    if (hasFiles) {
      leafDirs.push(dir);
    }
  } catch (err) {
    // Ignore permissions or missing folders
  }
  return leafDirs;
}

// Clean prefixes like "PROKER 1_" or "1. " from folder names
function cleanProkerName(name: string) {
  let cleaned = name.replace(/^proker\s*\d+_/i, ""); // PROKER 1_
  cleaned = cleaned.replace(/^\d+[\.\-]\s*/, ""); // 1. or 1-
  return cleaned.trim();
}

async function processImages() {
  console.log("=== Image Processing Pipeline Started ===");
  console.log(`Input Directory: ${INPUT_DIR}`);
  console.log(`Output Directory: ${OUTPUT_DIR}\n`);

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const commissariats = await prisma.commissariat.findMany({
    include: { programKerja: true },
  });

  const topDirs = fs
    .readdirSync(INPUT_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory());

  for (const comDir of topDirs) {
    let bestComMatch = null;
    let bestComScore = 0;

    // Custom overrides to safely map the drive folders to commissariat slugs
    const dirLower = comDir.name.toLowerCase();

    for (const c of commissariats) {
      // Basic match on university name
      const score = stringSimilarity.compareTwoStrings(
        c.university.toLowerCase(),
        dirLower,
      );
      if (score > bestComScore) {
        bestComScore = score;
        bestComMatch = c;
      }
      
      // Manual precision hooks
      if (dirLower.includes("uinsa") && c.slug === "uinsa") { bestComScore = 1; bestComMatch = c; }
      if (dirLower.includes("madura") && c.slug === "uin-madura") { bestComScore = 1; bestComMatch = c; }
      if (dirLower.includes("upnvjt") && c.slug === "upnvjt") { bestComScore = 1; bestComMatch = c; }
      if (dirLower.includes("unair") && c.slug === "unair") { bestComScore = 1; bestComMatch = c; }
      if (dirLower.includes("unesa") && c.slug === "unesa") { bestComScore = 1; bestComMatch = c; }
      if (dirLower.includes("utm") && c.slug === "utm") { bestComScore = 1; bestComMatch = c; }
      if (dirLower.includes("unugiri") && c.slug === "unugiri") { bestComScore = 1; bestComMatch = c; }
      if (dirLower.includes("its") && c.slug === "its") { bestComScore = 1; bestComMatch = c; }
    }

    if (bestComScore < 0.3 || !bestComMatch) {
      console.log(`\n[-] Skipping unidentifiable folder: ${comDir.name}`);
      continue;
    }

    console.log(`\n[+] Processing Commissariat Data for: ${bestComMatch.university}`);

    const leafDirs = getLeafDirectories(path.join(INPUT_DIR, comDir.name));

    for (const leafDir of leafDirs) {
      const folderName = path.basename(leafDir);
      const cleanName = cleanProkerName(folderName);
      const prokers = bestComMatch.programKerja;

      if (prokers.length === 0) continue;

      const prokerNames = prokers.map((p) => p.namaProker);
      const match = stringSimilarity.findBestMatch(cleanName, prokerNames);
      const bestProkerMatch = prokers[match.bestMatchIndex];

      // Lowered rating ceiling because of varying folder naming habits
      if (match.bestMatch.rating > 0.45) {
        console.log(`  -> Matched Proker: "${cleanName}" to "${bestProkerMatch.namaProker}" (Rating: ${match.bestMatch.rating.toFixed(2)})`);

        const files = fs
          .readdirSync(leafDir)
          .filter((f) =>
            [".jpg", ".jpeg", ".png", ".arw"].includes(
              path.extname(f).toLowerCase(),
            ),
          );

        // Max 6 images based on the database columns
        const filesToProcess = files.slice(0, 6);
        let photoIdx = 1;

        const finalOutputDir = path.join(
          OUTPUT_DIR,
          bestComMatch.slug,
          bestProkerMatch.id.toString(),
        );
        if (!fs.existsSync(finalOutputDir)) {
          fs.mkdirSync(finalOutputDir, { recursive: true });
        }

        const photoUrls: Record<string, string> = {};

        for (const file of filesToProcess) {
          const inputPath = path.join(leafDir, file);
          const ext = path.extname(file).toLowerCase();
          const outputFilename = `foto${photoIdx}.webp`;
          const outputPath = path.join(finalOutputDir, outputFilename);

          try {
            if (ext === ".arw") {
              console.log(`     - Extracting Sony RAW (.arw): ${file}...`);
              const tempJpg = path.join(finalOutputDir, `temp_${photoIdx}.jpg`);
              try {
                // Will attempt extraction of the embedded JPG inside the uncompressed RAW
                await exiftool.extractBinaryTag("PreviewImage", inputPath, tempJpg);
                await sharp(tempJpg)
                  .resize(1200, null, { withoutEnlargement: true })
                  .webp({ quality: 80 })
                  .toFile(outputPath);
                fs.unlinkSync(tempJpg);
              } catch (arwErr) {
                 console.log(`     - Failed extracting .arw (possibly missing tag): ${file}`);
                 continue; // Move to next file
              }
            } else {
              console.log(`     - Compressing Image: ${file}...`);
              await sharp(inputPath)
                .resize(1200, null, { withoutEnlargement: true })
                .webp({ quality: 80 })
                .toFile(outputPath);
            }

            photoUrls[`foto${photoIdx}`] = `/uploads/proker/${bestComMatch.slug}/${bestProkerMatch.id}/${outputFilename}`;
            photoIdx++;
          } catch (e: any) {
            console.error(`     - Failed processing ${file}: ${e.message}`);
          }
        }

        // Commit mapped files directly to MySQL
        if (Object.keys(photoUrls).length > 0) {
          await prisma.programKerja.update({
            where: { id: bestProkerMatch.id },
            data: photoUrls,
          });
          console.log(`     [v] Database updated for ${bestProkerMatch.namaProker}`);
        }
      } else {
        console.log(`  -> [!] Unmatched Folder (Rating too low): "${cleanName}" (Closest: "${match.bestMatch.target}" at ${match.bestMatch.rating.toFixed(2)})`);
      }
    }
  }

  // Necessary for exiftool to gracefully kill the perl background process
  await exiftool.end();
  console.log("\n=== Image Processing Pipeline Complete ===");
}

processImages()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
