import * as fs from "fs";
import * as path from "path";

const INPUT_DIR = path.join(__dirname, "data/images/Dokumentasi Proker");

function findProkerFolders(dir: string, results: { path: string, files: string[] }[] = []) {
   const items = fs.readdirSync(dir, { withFileTypes: true });
   const files = items.filter(i => !i.isDirectory()).map(i => i.name);
   
   if (files.length > 0) {
       results.push({ path: dir, files });
   }
   
   const subDirs = items.filter(i => i.isDirectory());
   for (const subDir of subDirs) {
       findProkerFolders(path.join(dir, subDir.name), results);
   }
   
   return results;
}

try {
  const folders = findProkerFolders(INPUT_DIR);
  let totalFolders = folders.length;
  let withValidImages = 0;
  let withoutValidImages = 0;
  let invalidExtensionsFound = new Set<string>();
  let noImageFoldersInfo: { name: string, path: string, files: string[] }[] = [];

  const validExts = [".jpg", ".jpeg", ".png", ".arw"];

  for (const folder of folders) {
     let hasValidImage = false;
     const exts = new Set<string>();
     
     for (const file of folder.files) {
         const ext = path.extname(file).toLowerCase();
         exts.add(ext);
         if (validExts.includes(ext)) {
             hasValidImage = true;
         }
     }
     
     if (hasValidImage) {
         withValidImages++;
     } else {
         withoutValidImages++;
         exts.forEach(e => invalidExtensionsFound.add(e));
         noImageFoldersInfo.push({
             name: path.basename(folder.path),
             path: folder.path.replace(INPUT_DIR, ""),
             files: folder.files
         });
     }
  }

  let output = `=== HASIL SCAN FOLDER LOKAL GOOGLE DRIVE ===\n\n`;
  output += `Total Folder Proker (di dalam Drive)       : ${totalFolders} folder\n`;
  output += `Folder yang BERISI format gambar (Valid) : ${withValidImages} folder\n`;
  output += `Folder yang TIDAK berisi gambar          : ${withoutValidImages} folder\n\n`;

  if (withoutValidImages > 0) {
      output += `Format file yang dimuat pada folder "Tanpa Gambar" tersebut: ${Array.from(invalidExtensionsFound).join(", ") || "(Kosong)"}\n\n`;
      output += `Rincian Folder Proker Tanpa Gambar Valid:\n`;
      noImageFoldersInfo.forEach((info, idx) => {
          output += `${idx + 1}. Folder: ${info.name}\n`;
          output += `   Lokasi: ${info.path}\n`;
          output += `   Isi file (${info.files.length}):\n`;
          info.files.forEach(f => output += `     - ${f}\n`);
          output += `\n`;
      });
  }
  
  const reportPath = "C:/Users/Administrator/.gemini/antigravity/brain/dd8db13e-7fbe-4c05-9e7d-1a15920e96b3/report_folder_drive.md";
  fs.writeFileSync(reportPath, output);
  console.log("Drive folder scanning complete. Report written to: " + reportPath);

} catch (e: any) {
  console.error("Error scanning directories:", e.message);
}
