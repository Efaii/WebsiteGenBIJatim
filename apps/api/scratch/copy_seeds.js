const fs = require('fs');
const path = require('path');

const srcDir = 'D:/Fathir/Tumbal Proyek/tumbal project/apps/api/prisma/seed-data';
const destDir = 'E:/website genbi jatim/apps/api/prisma/seed-data';

const files = [
  'proker-pens.ts',
  'proker-its.ts',
  'proker-uinsa.ts',
  'proker-utm.ts',
  'proker-upnvjt.ts',
  'proker-unesa.ts',
  'proker-uin-madura.ts',
  'proker-unugiri.ts',
  'proker-jatim.ts'
];

files.forEach(file => {
  const src = path.join(srcDir, file);
  const dest = path.join(destDir, file);
  try {
    const content = fs.readFileSync(src, 'utf8');
    fs.writeFileSync(dest, content);
    console.log(`Copied ${file}`);
  } catch (err) {
    console.error(`Error copying ${file}:`, err.message);
  }
});
