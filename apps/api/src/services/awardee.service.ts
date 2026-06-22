import prisma from '../lib/prisma';

export interface AwardeeData {
  name: string;
  university: string;
  major: string;
  batch: string;
  period: string;
  organizationProfileId: string;
}

export const getAllAwardees = async (orgId?: string) => {
  const where: any = {};
  if (orgId && orgId !== "all") {
    where.organizationProfileId = orgId;
  }

  return prisma.awardee.findMany({
    where,
    orderBy: { name: 'asc' },
    include: { organization: true }
  });
};

export const createAwardee = async (data: AwardeeData) => {
  return prisma.awardee.create({
    data
  });
};

export const updateAwardee = async (id: string, data: Partial<AwardeeData>) => {
  return prisma.awardee.update({
    where: { id },
    data
  });
};

export const deleteAwardee = async (id: string) => {
  return prisma.awardee.delete({
    where: { id }
  });
};

export const getAwardeeById = async (id: string) => {
  return prisma.awardee.findUnique({
    where: { id },
    include: { organization: true }
  });
};
