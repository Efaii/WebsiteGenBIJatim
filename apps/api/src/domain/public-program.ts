type ProgramPhoto = { filePath: string };

export const isCancelledProgramStatus = (value: string) =>
  value.trim().toLowerCase().includes('cancel');

export const publicProgramWhere = () => ({
  publicationStatus: 'PUBLISHED' as const,
  executionStatus: { not: 'CANCELLED' as const },
  status: { not: { contains: 'cancel' } },
});

type PublicProgramRecord = {
  id: string;
  programKe: number;
  namaProker: string;
  divisi: string;
  tanggalProker: Date | null;
  dateLabel: string | null;
  formatPelaksanaan: string;
  status: string;
  deskripsiProker: string;
  kpiTukTarget: string | null;
  dampak: string | null;
  evaluasi: string | null;
  foto1: string | null;
  foto2: string | null;
  foto3: string | null;
  foto4: string | null;
  foto5: string | null;
  foto6: string | null;
  photos: ProgramPhoto[];
  publicationStatus: string;
  executionStatus: string;
  commissariat?: { name: string; slug: string };
};

export const programDate = (date: Date | null, label: string | null) => {
  const periodLabel = label || 'Periode 2025/2026';
  return {
    date: date
      ? date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })
      : periodLabel,
    dateIso: date ? date.toISOString().split('T')[0] : null,
    dateLabel: date ? null : periodLabel,
  };
};

export const programGallery = (
  legacyPhotos: Array<string | null>,
  photos: ProgramPhoto[],
) => [
  ...new Set(
    [...legacyPhotos, ...photos.map((photo) => photo.filePath)]
      .filter((photo): photo is string => Boolean(photo)),
  ),
];

export const hasProgramDocumentation = (program: Pick<PublicProgramRecord, 'foto1' | 'foto2' | 'foto3' | 'foto4' | 'foto5' | 'foto6' | 'photos'>) =>
  programGallery(
    [program.foto1, program.foto2, program.foto3, program.foto4, program.foto5, program.foto6],
    program.photos,
  ).length > 0;

export const orderProgramsDocumentationFirst = <T extends Pick<PublicProgramRecord, 'foto1' | 'foto2' | 'foto3' | 'foto4' | 'foto5' | 'foto6' | 'photos'>>(programs: T[]) =>
  programs
    .map((program, index) => ({ program, index, hasDocumentation: hasProgramDocumentation(program) }))
    .sort((left, right) => Number(right.hasDocumentation) - Number(left.hasDocumentation) || left.index - right.index)
    .map(({ program }) => program);

export const isPublicProgram = (program: {
  publicationStatus: string;
  executionStatus: string;
  status: string;
}) => (
  program.publicationStatus === 'PUBLISHED'
  && program.executionStatus !== 'CANCELLED'
  && !isCancelledProgramStatus(program.status)
);

export const projectPublicProgram = (program: PublicProgramRecord) => ({
  id: program.id,
  programKe: program.programKe,
  title: program.namaProker,
  divisi: program.divisi,
  ...(program.commissariat
    ? {
        commissariat: program.commissariat.name,
        commissariatSlug: program.commissariat.slug,
      }
    : {}),
  ...programDate(program.tanggalProker, program.dateLabel),
  format: program.formatPelaksanaan,
  status: program.status,
  description: program.deskripsiProker,
  kpiTukTarget: program.kpiTukTarget,
  dampak: program.dampak,
  evaluasi: program.evaluasi,
  gallery: programGallery(
    [program.foto1, program.foto2, program.foto3, program.foto4, program.foto5, program.foto6],
    program.photos,
  ),
});
