import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

// GET /api/commissariats — Daftar semua komisariat
export const getAllCommissariats = async (req: Request, res: Response) => {
  try {
    const commissariats = await prisma.commissariat.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { programKerja: true },
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

    const commissariat = await prisma.commissariat.findUnique({
      where: { slug },
      include: {
        programKerja: {
          orderBy: { programKe: 'asc' },
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
      proker: commissariat.programKerja.map((p) => ({
        id: p.id,
        programKe: p.programKe,
        title: p.namaProker,
        divisi: p.divisi,
        date: p.tanggalProker.toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        dateIso: p.tanggalProker.toISOString().split('T')[0],
        format: p.formatPelaksanaan,
        status: p.status,
        description: p.deskripsiProker,
        kpiTukTarget: p.kpiTukTarget,
        dampak: p.dampak,
        evaluasi: p.evaluasi,
        gallery: [p.foto1, p.foto2, p.foto3, p.foto4, p.foto5, p.foto6].filter(Boolean),
      })),
      // BPH, awardees, documents → tetap dari mock untuk sekarang
      bph: [],
      divisions: [],
      awardees: [],
      documents: [],
    };

    res.json(result);
  } catch (error) {
    console.error('Error fetching commissariat:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /api/commissariats/:slug/proker/:id — Detail satu program kerja
export const getProgramKerjaById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const proker = await prisma.programKerja.findUnique({
      where: { id },
      include: {
        commissariat: {
          select: { name: true, slug: true },
        },
      },
    });

    if (!proker) {
      return res.status(404).json({ message: 'Program kerja tidak ditemukan' });
    }

    const result = {
      id: proker.id,
      programKe: proker.programKe,
      title: proker.namaProker,
      divisi: proker.divisi,
      commissariat: proker.commissariat.name,
      commissariatSlug: proker.commissariat.slug,
      date: proker.tanggalProker.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      dateIso: proker.tanggalProker.toISOString().split('T')[0],
      format: proker.formatPelaksanaan,
      status: proker.status,
      description: proker.deskripsiProker,
      kpiTukTarget: proker.kpiTukTarget,
      dampak: proker.dampak,
      evaluasi: proker.evaluasi,
      gallery: [proker.foto1, proker.foto2, proker.foto3, proker.foto4, proker.foto5, proker.foto6].filter(Boolean),
    };

    res.json(result);
  } catch (error) {
    console.error('Error fetching program kerja:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /api/commissariats/stats — Statistik agregat semua komisariat
export const getCommissariatStats = async (req: Request, res: Response) => {
  try {
    const [prokerCount, commissariatCount, totalMembers] = await Promise.all([
      prisma.programKerja.count(),
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
