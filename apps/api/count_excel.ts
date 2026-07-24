import * as xlsx from "xlsx";
import * as fs from "fs";
import * as path from "path";

const dir = path.resolve(process.cwd(), "./data/excel");
const files = fs.readdirSync(dir).filter(f => f.endsWith('.xlsx') && !f.startsWith('~'));
let totalRows = 0;
let totalFiles = 0;

for (const file of files) {
  const p = path.join(dir, file);
  const wb = xlsx.readFile(p);
  if (wb.Sheets["ALL"]) {
    const data = xlsx.utils.sheet_to_json(wb.Sheets["ALL"]);
    console.log(`${file}: ${data.length} baris`);
    totalRows += data.length;
    totalFiles++;
  } else {
    console.log(`${file}: SHEET ALL TIDAK ADA`);
  }
}
console.log(`\nGRAND TOTAL ROWS: ${totalRows} in ${totalFiles} files.`);
