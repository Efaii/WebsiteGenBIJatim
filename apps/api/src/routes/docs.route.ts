import { Router, Request, Response } from 'express';
import { Document } from '@repo/types';

/**
 * @route docs.route
 * @description Public read-only routes for documents/guides.
 */

const router = Router();

const DOCUMENTS_DATA: Document[] = [
  {
    id: 1,
    title: "Panduan Beasiswa Bank Indonesia 2024",
    type: "Materi",
    fileType: "PDF",
    size: "2.5 MB",
    date: "10 Jan 2024",
    category: "Panduan",
  },
  {
    id: 2,
    title: "Template Laporan Kegiatan Komisariat",
    type: "Dokumentasi",
    fileType: "DOCX",
    size: "1.2 MB",
    date: "15 Jan 2024",
    category: "Template",
  },
  {
    id: 3,
    title: "SOP Pengajuan Dana Program Kerja",
    type: "SOP",
    fileType: "PDF",
    size: "1.8 MB",
    date: "20 Jan 2024",
    category: "SOP",
  },
];

router.get('/', (req: Request, res: Response) => {
  res.json(DOCUMENTS_DATA);
});

export default router;
