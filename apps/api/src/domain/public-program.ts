type ProgramPhoto = { filePath: string };

export const programDate = (date: Date | null, label: string | null) => {
  const periodLabel = label || 'Periode 2025/2026';
  return {
    date: date
      ? date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
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

export const isPublicProgram = (program: {
  publicationStatus: string;
  executionStatus: string;
  status: string;
}) => (
  program.publicationStatus === 'PUBLISHED'
  && program.executionStatus !== 'CANCELLED'
  && !['cancelled', 'canceled', 'cancel'].includes(program.status.trim().toLowerCase())
);
