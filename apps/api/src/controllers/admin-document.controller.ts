import { Request, Response } from 'express';
import { DocumentService } from '../services/document.service';
import prisma from '../lib/prisma';

/**
 * @controller AdminDocumentController
 * @description Orchestrates admin operations for documents.
 */
const sensitiveKeywords = ['lpj', 'evaluasi', 'internal', 'rapat', 'pertanggungjawaban', 'keuangan'];

const validateDocumentPrivacy = (title: string, category: string, isPublic: boolean) => {
  if (!isPublic) return; // Private is always safe
  
  const content = `${title} ${category}`.toLowerCase();
  const matched = sensitiveKeywords.find(word => content.includes(word));
  if (matched) {
    throw new Error(`Dokumen "${title}" (Kategori: ${category}) mengandung kata kunci "${matched.toUpperCase()}" yang dianggap sensitif. Dokumen ini tidak boleh dipublikasikan secara umum.`);
  }
};

export const AdminDocumentController = {
  /**
   * GET /api/admin/docs
   */
  async getAll(req: Request, res: Response) {
    try {
      const { organizationProfileId } = req.query;
      const docs = await DocumentService.getAll(organizationProfileId as string);
      res.json({ status: 'success', data: docs });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  },

  /**
   * POST /api/admin/docs
   */
  async create(req: Request, res: Response) {
    try {
      const data = { ...req.body };
      
      // Handle file upload (Priority)
      if (req.file) {
        data.url = `/uploads/docs/${req.file.filename}`;
        data.size = `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`;
        data.fileType = req.file.originalname.split('.').pop()?.toUpperCase() || 'FILE';
      } 
      // If no file but URL is provided, we use the URL and other metadata from body
      else if (!data.url) {
        throw new Error('Harap pilih file atau masukkan link dokumen!');
      }

      // Handle boolean conversion (FormData sends it as string)
      if (typeof data.isPublic === 'string') {
        data.isPublic = data.isPublic === 'true';
      }

      // Privacy Validation
      validateDocumentPrivacy(data.title || '', data.category || '', !!data.isPublic);

      // Validate organization exists
      const orgId = data.organizationProfileId;
      if (orgId) {
        const orgExists = await (prisma as any).organizationProfile.findUnique({ where: { id: orgId } });
        if (!orgExists) {
          throw new Error(`Organisasi (ID: ${orgId}) tidak ditemukan di database. Pastikan organisasi sudah terdaftar.`);
        }
      } else {
        throw new Error('Harap pilih organisasi terkait!');
      }

      const doc = await DocumentService.create(data);
      res.status(201).json({ status: 'success', data: doc });
    } catch (error: any) {
      console.error('ADMIN DOC CREATE ERROR:', error);
      console.error('Payload attempted:', JSON.stringify(req.body, null, 2));
      res.status(400).json({ 
        status: 'error', 
        message: error.message,
        details: error.name === 'PrismaClientKnownRequestError' ? error.meta : undefined,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  },

  /**
   * PUT /api/admin/docs/:id
   */
  async update(req: Request, res: Response) {
    try {
      console.log('--- ADMIN DOC CREATE ---');
      console.log('Received fields:', Object.keys(req.body));
      console.log('Values:', JSON.stringify(req.body, null, 2));
      if (req.file) console.log('File attached:', req.file.filename);

      const { id } = req.params;
      const data = { ...req.body };

      if (req.file) {
        data.url = `/uploads/docs/${req.file.filename}`;
        data.size = `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`;
        data.fileType = req.file.originalname.split('.').pop()?.toUpperCase() || 'FILE';
      }

      if (typeof data.isPublic === 'string') {
        data.isPublic = data.isPublic === 'true';
      }
      
      // Privacy Validation
      validateDocumentPrivacy(data.title || '', data.category || '', !!data.isPublic);

      // Validate organization exists if provided
      const orgId = data.organizationProfileId;
      if (orgId) {
        const orgExists = await (prisma as any).organizationProfile.findUnique({ where: { id: orgId } });
        if (!orgExists) {
          throw new Error(`Organisasi (ID: ${orgId}) tidak ditemukan di database.`);
        }
      }

      const doc = await DocumentService.update(id, data);
      res.json({ status: 'success', data: doc });
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  },

  /**
   * DELETE /api/admin/docs/:id
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await DocumentService.delete(id);
      res.json({ status: 'success', message: 'Document deleted successfully' });
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }
};
