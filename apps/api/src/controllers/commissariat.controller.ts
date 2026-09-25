import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { isPublicProgram, orderProgramsDocumentationFirst, projectPublicProgram, publicProgramWhere } from '../domain/public-program';
import { projectPublicAwardee } from '../domain/public-membership';
import { MEMBERSHIP_RELEASE_PERIOD } from '../domain/membership-release';

const prisma = new PrismaClient();

// GET /api/commissariats — Daftar semua komisariat
export const getAllCommissariats = async (req: Request, res: Response) => {
  try {
    const commissariats = await prisma.commissariat.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            programKerja: {
              where: publicProgramWhere(),
            },
          },
        },
      },
    });

    const result = commissariats.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      university: c.university,
      logo_univ: c.logo,
      logoGenbi: c.logoGenbi,
      coverImage: c.coverImage,
      description: c.description,
      instagram: c.instagram,
      email: c.email,
      memberCount: c.memberCount,
      prokerCount: c._count.programKerja,
    }));

    res.json(result);
  } catch (error) {
    console.error('Error fetching commissariats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /api/commissariats/:slug — Detail komisariat + program kerja
export const getCommissariatBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const periodLabel = typeof req.query.periodLabel === 'string' ? req.query.periodLabel : MEMBERSHIP_RELEASE_PERIOD;

    const commissariat = await prisma.commissariat.findUnique({
      where: { slug },
      include: {
        programKerja: {
          where: publicProgramWhere(),
          orderBy: { programKe: 'asc' },
          include: { photos: { orderBy: { createdAt: 'asc' } } },
        },
        memberships: {
          where: {
            publicationStatus: 'PUBLISHED',
            membershipStatus: 'ACTIVE',
            period: { label: periodLabel },
          },
          select: {
            id: true,
            name: true,
            position: true,
            studyProgram: true,
            division: { select: { name: true } },
            commissariat: { select: { slug: true, name: true } },
            period: { select: { label: true } },
          },
          orderBy: [{ name: 'asc' }, { id: 'asc' }],
        },
      },
    });

    if (!commissariat) {
      return res.status(404).json({ message: 'Komisariat tidak ditemukan' });
    }

    // Transform ke format yang diharapkan frontend
    const result = {
      slug: commissariat.slug,
      name: commissariat.name,
      university: commissariat.university,
      logo_univ: commissariat.logo,
      logo_genbi: commissariat.logoGenbi,
      cover_image: commissariat.coverImage,
      description: commissariat.description,
      socials: {
        instagram: commissariat.instagram || '',
        email: commissariat.email || '',
      },
      memberCount: commissariat.memberCount,
      proker: orderProgramsDocumentationFirst(commissariat.programKerja.filter((p) => isPublicProgram(p))).map(projectPublicProgram),
      // BPH and documents remain outside the Membership release scope.
      bph: [],
      divisions: [],
      awardees: commissariat.memberships.map(projectPublicAwardee),
      documents: [],
    };

    res.json(result);
  } catch (error) {
    console.error('Error fetching commissariat:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /api/commissariats/proker — Daftar semua program kerja
export const getAllProgramKerja = async (_req: Request, res: Response) => {
  try {
    const programs = await prisma.programKerja.findMany({
      where: publicProgramWhere(),
      orderBy: [{ tanggalProker: 'desc' }, { programKe: 'asc' }],
      include: { commissariat: { select: { name: true, slug: true } }, photos: { orderBy: { createdAt: 'asc' } } },
    });

      res.json(orderProgramsDocumentationFirst(programs.filter((proker) => isPublicProgram(proker))).map(projectPublicProgram));
  } catch (error) {
    console.error('Error fetching program kerja list:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /api/commissariats/:slug/proker/:id — Detail satu program kerja
export const getProgramKerjaById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const proker = await prisma.programKerja.findUnique({
      where: { id, ...publicProgramWhere() },
      include: {
        commissariat: {
          select: { name: true, slug: true },
        },
        photos: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!proker) {
      return res.status(404).json({ message: 'Program kerja tidak ditemukan' });
    }

    if (!isPublicProgram(proker)) {
      return res.status(404).json({ message: 'Program kerja tidak ditemukan' });
    }

    res.json(projectPublicProgram(proker));
  } catch (error) {
    console.error('Error fetching program kerja:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /api/commissariats/stats — Statistik agregat semua komisariat
export const getCommissariatStats = async (req: Request, res: Response) => {
  try {
    const [prokerCount, commissariatCount, totalMembers] = await Promise.all([
      prisma.programKerja.count({ where: publicProgramWhere() }),
      prisma.commissariat.count({ where: { isActive: true } }),
      prisma.commissariat.aggregate({
        where: { isActive: true },
        _sum: { memberCount: true },
      }),
    ]);

    res.json({
      totalProker: prokerCount,
      totalCommissariats: commissariatCount,
      totalMembers: totalMembers._sum.memberCount || 0,
    });
  } catch (error) {
    console.error('Error fetching commissariat stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
