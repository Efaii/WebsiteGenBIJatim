import fs from 'fs';
const txt = fs.readFileSync('import_errors.log', 'utf8');
const lines = txt.split('\n');
let printNext = false;
for (const line of lines) {
  if (line.includes('Argument')) {
    console.log(line.trim());
  }
}
const txt16 = fs.readFileSync('import_errors.log', 'utf16le');
for (const line of txt16.split('\n')) {
  if (line.includes('Argument')) {
    console.log(line.trim());
  }
}
