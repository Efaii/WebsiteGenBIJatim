"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommissariatStats = exports.getProgramKerjaById = exports.getAllProgramKerja = exports.getCommissariatBySlug = exports.getAllCommissariats = void 0;
const client_1 = require("@prisma/client");
const public_program_1 = require("../domain/public-program");
const public_membership_1 = require("../domain/public-membership");
const membership_release_1 = require("../domain/membership-release");
const prisma = new client_1.PrismaClient();
// GET /api/commissariats — Daftar semua komisariat
const getAllCommissariats = async (req, res) => {
    try {
        const commissariats = await prisma.commissariat.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: {
                        programKerja: {
                            where: (0, public_program_1.publicProgramWhere)(),
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
    }
    catch (error) {
        console.error('Error fetching commissariats:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAllCommissariats = getAllCommissariats;
// GET /api/commissariats/:slug — Detail komisariat + program kerja
const getCommissariatBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const periodLabel = typeof req.query.periodLabel === 'string' ? req.query.periodLabel : membership_release_1.MEMBERSHIP_RELEASE_PERIOD;
        const commissariat = await prisma.commissariat.findUnique({
            where: { slug },
            include: {
                programKerja: {
                    where: (0, public_program_1.publicProgramWhere)(),
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
            proker: (0, public_program_1.orderProgramsDocumentationFirst)(commissariat.programKerja.filter((p) => (0, public_program_1.isPublicProgram)(p))).map(public_program_1.projectPublicProgram),
            // BPH and documents remain outside the Membership release scope.
            bph: [],
            divisions: [],
            awardees: commissariat.memberships.map(public_membership_1.projectPublicAwardee),
            documents: [],
        };
        res.json(result);
    }
    catch (error) {
        console.error('Error fetching commissariat:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getCommissariatBySlug = getCommissariatBySlug;
// GET /api/commissariats/proker — Daftar semua program kerja
const getAllProgramKerja = async (_req, res) => {
    try {
        const programs = await prisma.programKerja.findMany({
            where: (0, public_program_1.publicProgramWhere)(),
            orderBy: [{ tanggalProker: 'desc' }, { programKe: 'asc' }],
            include: { commissariat: { select: { name: true, slug: true } }, photos: { orderBy: { createdAt: 'asc' } } },
        });
        res.json((0, public_program_1.orderProgramsDocumentationFirst)(programs.filter((proker) => (0, public_program_1.isPublicProgram)(proker))).map(public_program_1.projectPublicProgram));
    }
    catch (error) {
        console.error('Error fetching program kerja list:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAllProgramKerja = getAllProgramKerja;
// GET /api/commissariats/:slug/proker/:id — Detail satu program kerja
const getProgramKerjaById = async (req, res) => {
    try {
        const { id } = req.params;
        const proker = await prisma.programKerja.findUnique({
            where: { id, ...(0, public_program_1.publicProgramWhere)() },
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
        if (!(0, public_program_1.isPublicProgram)(proker)) {
            return res.status(404).json({ message: 'Program kerja tidak ditemukan' });
        }
        res.json((0, public_program_1.projectPublicProgram)(proker));
    }
    catch (error) {
        console.error('Error fetching program kerja:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getProgramKerjaById = getProgramKerjaById;
// GET /api/commissariats/stats — Statistik agregat semua komisariat
const getCommissariatStats = async (req, res) => {
    try {
        const [prokerCount, commissariatCount, totalMembers] = await Promise.all([
            prisma.programKerja.count({ where: (0, public_program_1.publicProgramWhere)() }),
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
    }
    catch (error) {
        console.error('Error fetching commissariat stats:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getCommissariatStats = getCommissariatStats;
