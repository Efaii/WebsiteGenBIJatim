import { PublicationStatus } from '@prisma/client';
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
