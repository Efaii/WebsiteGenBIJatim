import assert from 'node:assert/strict';
import { app } from '../index';
import { requestContext } from '../middlewares/request-context.middleware';
import { contactRateLimiter, loginRateLimiter } from '../middlewares/rate-limit.middleware';

assert.equal(typeof app, 'function');
assert.equal(typeof app.get, 'function');

type Layer = { route?: { path?: string }; regexp?: { test?: (value: string) => boolean }; handle?: { stack?: Layer[] } };
const hasRoute = (layers: Layer[] | undefined, path: string): boolean =>
  Boolean(layers?.some((layer) => layer.route?.path === path || hasRoute(layer.handle?.stack, path)));

assert.ok(hasRoute((app as typeof app & { _router?: { stack?: Layer[] } })._router?.stack, '/health'));
assert.ok(hasRoute((app as typeof app & { _router?: { stack?: Layer[] } })._router?.stack, '/ready'));
const registeredPaths: Layer[] = (app as typeof app & { _router?: { stack?: Layer[] } })._router?.stack ?? [];
assert.ok(registeredPaths.some((layer) => layer.regexp?.test?.('/api/v1/auth/login')));
assert.ok(registeredPaths.some((layer) => layer.regexp?.test?.('/api/contact')));
assert.ok(registeredPaths.some((layer) => layer.handle === contactRateLimiter));
assert.ok(registeredPaths.some((layer) => layer.handle === loginRateLimiter));
assert.equal(app.get('trust proxy'), 1);
assert.equal(app.get('x-powered-by'), false);

let status = 0;
let requestIdHeader = '';
const response = {
  locals: { requestId: 'readiness-test-id' },
  status(code: number) { status = code; return this; },
  json() { return undefined; },
  setHeader(name: string, value: string) { if (name === 'x-request-id') requestIdHeader = value; return this; },
} as never;
requestContext({ header: () => 'readiness-test-id' } as never, response, () => undefined);
assert.equal((response as { locals: { requestId: string } }).locals.requestId, 'readiness-test-id');
assert.equal(requestIdHeader, 'readiness-test-id');
assert.equal(status, 0);
