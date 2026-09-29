import assert from 'node:assert/strict';
import { assertScopeAccess } from '../services/cms-scope.service';

const session = (role: 'SEKRETARIS_UMUM' | 'SEKRETARIS_DIVISI', divisionId?: string) => ({
  cmsAccount: { role, assignments: [{ commissariatId: 'com-1', periodId: 'period-1', divisionId }] },
}) as any;

assert.doesNotThrow(() => assertScopeAccess(session('SEKRETARIS_UMUM'), { commissariatId: 'com-1', periodId: 'period-1' }));
assert.throws(() => assertScopeAccess(session('SEKRETARIS_UMUM'), { commissariatId: 'com-2', periodId: 'period-1' }));
assert.doesNotThrow(() => assertScopeAccess(session('SEKRETARIS_DIVISI', 'division-1'), { commissariatId: 'com-1', periodId: 'period-1', divisionId: 'division-1' }));
assert.throws(() => assertScopeAccess(session('SEKRETARIS_DIVISI', 'division-1'), { commissariatId: 'com-1', periodId: 'period-1', divisionId: 'division-2' }));
