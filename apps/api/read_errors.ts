import fs from 'fs';
const text = fs.readFileSync('import_errors.log', 'utf16le');
if (text.includes('Error') || text.includes('Gagal')) {
  console.log(text.split('\n').filter(l => l.includes('Gagal') || l.includes('Error')).join('\n'));
} else {
  const txt8 = fs.readFileSync('import_errors.log', 'utf8');
  console.log(txt8.split('\n').filter(l => l.includes('Gagal') || l.includes('Error')).join('\n'));
}
