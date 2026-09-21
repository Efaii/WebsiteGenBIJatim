import { CmsRole } from '@prisma/client';
import { ApiError } from '../lib/api-error';
import { CmsSession } from '../middlewares/cms-session.middleware';

export type Scope = { commissariatId?: string; periodId?: string; divisionId?: string };

export const assertScopeAccess = (session: CmsSession, scope: Scope, operation: 'read' | 'write' = 'write') => {
  const role = session.cmsAccount.role;
  if (role === CmsRole.ADMIN_GLOBAL) return;
  const assignment = session.cmsAccount.assignments[0];
  if (!assignment) throw new ApiError('FORBIDDEN', 'No active CMS assignment.', 403);
  const matches = assignment.commissariatId === scope.commissariatId && assignment.periodId === scope.periodId;
  const divisionMatches = role === CmsRole.SEKRETARIS_DIVISI && assignment.divisionId === scope.divisionId;
  if (!matches || (role === CmsRole.SEKRETARIS_DIVISI && !divisionMatches) || (role === CmsRole.SEKRETARIS_DIVISI && operation === 'write' && !divisionMatches)) {
    throw new ApiError('FORBIDDEN', 'The requested resource is outside the active CMS scope.', 403);
  }
};
