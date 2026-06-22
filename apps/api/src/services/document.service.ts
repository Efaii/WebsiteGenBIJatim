import prisma from '../lib/prisma';
import { Document } from '@repo/types';

/**
 * @service DocumentService
 * @description Handles CRUD operations for documents linked to organization profiles.
 */
export const DocumentService = {
  /**
   * Get all documents (optionally filtered by organization)
   */
  async getAll(orgId?: string) {
    const where: any = {};
    if (orgId) {
      where.organizationProfileId = orgId;
    }

    return (prisma as any).document.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        organization: {
          select: { name: true }
        }
      }
    });
  },

  /**
   * Get a single document by ID
   */
  async getById(id: string) {
    return (prisma as any).document.findUnique({
      where: { id },
      include: {
        organization: {
          select: { name: true }
        }
      }
    });
  },

  /**
   * Create a new document
   */
  async create(data: Partial<Document> & { organizationProfileId: string }) {
    return (prisma as any).document.create({
      data: {
        title: data.title,
        type: data.type,
        fileType: data.fileType,
        size: data.size,
        date: data.date,
        url: data.url,
        category: data.category,
        period: (data as any).period || "2024/2025",
        isPublic: data.isPublic !== undefined ? data.isPublic : false,
        organizationProfileId: data.organizationProfileId
      }
    });
  },

  /**
   * Update an existing document
   */
  async update(id: string, data: Partial<Document>) {
    return (prisma as any).document.update({
      where: { id },
      data: {
        ...data,
        isPublic: data.isPublic !== undefined ? data.isPublic : undefined
      }
    });
  },

  /**
   * Delete a document
   */
  async delete(id: string) {
    return (prisma as any).document.delete({
      where: { id }
    });
  }
};
