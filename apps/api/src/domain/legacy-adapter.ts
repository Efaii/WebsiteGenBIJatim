import { ApiError } from '../lib/api-error';

export interface LegacyProgramProjection {
  legacyId: string;
  title: string;
  commissariat?: string;
  division?: string;
  executionStatus?: 'PLANNED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  date?: string;
  description?: string;
  ambiguous: boolean;
}

const executionStatusMap: Record<string, LegacyProgramProjection['executionStatus']> = {
  completed: 'COMPLETED',
  'on-going': 'ONGOING',
  ongoing: 'ONGOING',
  upcoming: 'PLANNED',
  planned: 'PLANNED',
  cancelled: 'CANCELLED',
};

export const adaptLegacyProgram = (input: unknown): LegacyProgramProjection => {
  if (!input || typeof input !== 'object') throw new ApiError('VALIDATION_ERROR', 'Legacy program must be an object.', 400);
  const value = input as Record<string, unknown>;
  const title = typeof value.title === 'string' ? value.title.trim() : typeof value.namaProker === 'string' ? value.namaProker.trim() : '';
  if (!title) throw new ApiError('VALIDATION_ERROR', 'Legacy program title is required.', 400);
  const rawStatus = typeof value.status === 'string' ? value.status.trim().toLowerCase() : '';
  const executionStatus = executionStatusMap[rawStatus];
  const rawDate = typeof value.dateIso === 'string' ? value.dateIso : typeof value.date === 'string' ? value.date : undefined;
  const validDate = rawDate && !Number.isNaN(Date.parse(rawDate)) ? rawDate : undefined;
  return {
    legacyId: String(value.id ?? ''),
    title,
    commissariat: typeof value.commissariat === 'string' ? value.commissariat : undefined,
    division: typeof value.divisi === 'string' ? value.divisi : typeof value.division === 'string' ? value.division : undefined,
    executionStatus,
    date: validDate,
    description: typeof value.description === 'string' ? value.description : typeof value.deskripsiProker === 'string' ? value.deskripsiProker : undefined,
    ambiguous: !executionStatus || !validDate || !value.id,
  };
};

export const adaptLegacyPrograms = (input: unknown): LegacyProgramProjection[] => {
  if (!Array.isArray(input)) throw new ApiError('VALIDATION_ERROR', 'Legacy programs must be an array.', 400);
  return input.map(adaptLegacyProgram);
};
