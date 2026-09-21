import { PublicationStatus } from '@prisma/client';
import { ApiError } from '../lib/api-error';

const transitions: Record<PublicationStatus, PublicationStatus[]> = {
  DRAFT: ['SUBMITTED'], SUBMITTED: ['APPROVED', 'REJECTED'], APPROVED: ['PUBLISHED'],
  PUBLISHED: ['DRAFT', 'ARCHIVED'], REJECTED: ['DRAFT'], ARCHIVED: [],
};

export const assertNewsTransition = (from: PublicationStatus, to: PublicationStatus, reason?: string | null) => {
  if (!transitions[from].includes(to)) throw new ApiError('CONFLICT', `Cannot transition News from ${from} to ${to}.`, 409);
  if (to === 'REJECTED' && !reason?.trim()) throw new ApiError('VALIDATION_ERROR', 'Rejection reason is required.', 400, { rejectionReason: ['Required'] });
};

export const normalizeNewsText = (value: unknown, field: string, max: number) => {
  if (typeof value !== 'string') throw new ApiError('VALIDATION_ERROR', `${field} must be text.`, 400);
  if (/<[^>]+>/.test(value)) throw new ApiError('VALIDATION_ERROR', `${field} must be plain text.`, 400, { [field]: ['HTML_NOT_ALLOWED'] });
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (!normalized || normalized.length > max) throw new ApiError('VALIDATION_ERROR', `${field} is invalid.`, 400, { [field]: [`Must be 1-${max} characters`] });
  return normalized;
};

export const newsSlug = (title: string) => title.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 180);
