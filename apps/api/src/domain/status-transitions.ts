import { CmsRole, PublicationStatus } from '@prisma/client';
import { ApiError } from '../lib/api-error';

const publicationTransitions: Record<PublicationStatus, PublicationStatus[]> = {
  DRAFT: ['SUBMITTED'],
  SUBMITTED: ['APPROVED', 'REJECTED'],
  APPROVED: ['PUBLISHED'],
  PUBLISHED: ['ARCHIVED'],
  REJECTED: ['DRAFT'],
  ARCHIVED: [],
};

export const assertPublicationTransition = (from: PublicationStatus, to: PublicationStatus, rejectionReason?: string | null) => {
  if (!publicationTransitions[from].includes(to)) throw new ApiError('CONFLICT', `Cannot transition publication status from ${from} to ${to}.`, 409);
  if (to === 'REJECTED' && !rejectionReason?.trim()) throw new ApiError('VALIDATION_ERROR', 'A rejection reason is required.', 400, { rejectionReason: ['Required'] });
};

/**
 * Sekretaris hanya boleh mengajukan Program Kerja (ke SUBMITTED); persetujuan,
 * penerbitan, dan pengarsipan tetap milik admin global. Program Kerja lama
 * hasil rekonsiliasi tidak punya jalur transisi sama sekali.
 */
export const assertProgramRoleTransition = (role: CmsRole, to: PublicationStatus) => {
  if (role !== CmsRole.ADMIN_GLOBAL && to !== 'SUBMITTED')
    throw new ApiError('FORBIDDEN', 'Only the publisher can move Program Kerja to this status.', 403);
};

const executionTransitions = {
  PLANNED: ['ONGOING', 'CANCELLED'],
  ONGOING: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
} as const;

export type ExecutionStatus = keyof typeof executionTransitions;

export const assertExecutionTransition = (from: ExecutionStatus, to: ExecutionStatus) => {
  if (!executionTransitions[from].includes(to as never)) throw new ApiError('CONFLICT', `Cannot transition execution status from ${from} to ${to}.`, 409);
};
