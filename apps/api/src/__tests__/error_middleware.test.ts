import { errorHandler } from '../middlewares/error.middleware';
import { Prisma } from '@prisma/client';
import assert from 'assert';

function mockRes() {
  const res: any = {};
  res.status = (code: number) => {
    res.statusCode = code;
    return res;
  };
  res.json = (body: any) => {
    res.body = body;
    return res;
  };
  return res;
}

async function runTests() {
  // Test P2002 -> 409
  const resP2002 = mockRes();
  const errP2002 = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
    code: 'P2002',
    clientVersion: '5.22.0',
    meta: { target: ['email'] },
  });
  errorHandler(errP2002, {} as any, resP2002, () => {});
  assert.strictEqual(resP2002.statusCode, 409, 'P2002 must return status 409');
  assert.strictEqual(resP2002.body.code, 'P2002');

  // Test P2003 -> 400
  const resP2003 = mockRes();
  const errP2003 = new Prisma.PrismaClientKnownRequestError('FK failed', {
    code: 'P2003',
    clientVersion: '5.22.0',
  });
  errorHandler(errP2003, {} as any, resP2003, () => {});
  assert.strictEqual(resP2003.statusCode, 400, 'P2003 must return status 400');
  assert.strictEqual(resP2003.body.code, 'P2003');

  // Test PrismaClientValidationError -> 400
  const resValidation = mockRes();
  const errValidation = new Prisma.PrismaClientValidationError('Invalid input', { clientVersion: '5.22.0' });
  errorHandler(errValidation, {} as any, resValidation, () => {});
  assert.strictEqual(resValidation.statusCode, 400, 'Validation error must return status 400');

  console.log('All error.middleware unit assertions passed successfully!');
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
