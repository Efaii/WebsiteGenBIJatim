
import prisma from '../lib/prisma';

/**
 * @service ProkerService
 * @description Handles work program (proker) data operations using the standardized schema.
 */
export const ProkerService = {
  async getAll(orgId?: string, includeInternal = false) {
    const where: any = {};
    if (orgId) {
      where.organizationProfileId = orgId;
    }

    const prokers = await prisma.programKerja.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    if (!includeInternal) {
      // For public view, we might filter by status or omit certain fields
      // In the new schema, we don't have separate evaluation fields, it's all in description
      return prokers;
    }
    return prokers;
  },

  async create(data: any) {
    return prisma.programKerja.create({ data });
  },

  async update(id: string, data: any) {
    return prisma.programKerja.update({
      where: { id },
      data
    });
  },

  async delete(id: string) {
    return prisma.programKerja.delete({
      where: { id }
    });
  },

  async getById(id: string) {
    return prisma.programKerja.findUnique({
      where: { id }
    });
  }
};
