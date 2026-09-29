"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const error_middleware_1 = require("../middlewares/error.middleware");
const client_1 = require("@prisma/client");
const assert_1 = __importDefault(require("assert"));
function mockRes() {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (body) => {
        res.body = body;
        return res;
    };
    return res;
}
async function runTests() {
    // Test P2002 -> 409
    const resP2002 = mockRes();
    const errP2002 = new client_1.Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '5.22.0',
        meta: { target: ['email'] },
    });
    (0, error_middleware_1.errorHandler)(errP2002, {}, resP2002, () => { });
    assert_1.default.strictEqual(resP2002.statusCode, 409, 'P2002 must return status 409');
    assert_1.default.strictEqual(resP2002.body.error.code, 'CONFLICT');
    // Test P2003 -> 400
    const resP2003 = mockRes();
    const errP2003 = new client_1.Prisma.PrismaClientKnownRequestError('FK failed', {
        code: 'P2003',
        clientVersion: '5.22.0',
    });
    (0, error_middleware_1.errorHandler)(errP2003, {}, resP2003, () => { });
    assert_1.default.strictEqual(resP2003.statusCode, 400, 'P2003 must return status 400');
    assert_1.default.strictEqual(resP2003.body.error.code, 'VALIDATION_ERROR');
    // Test PrismaClientValidationError -> 400
    const resValidation = mockRes();
    const errValidation = new client_1.Prisma.PrismaClientValidationError('Invalid input', { clientVersion: '5.22.0' });
    (0, error_middleware_1.errorHandler)(errValidation, {}, resValidation, () => { });
    assert_1.default.strictEqual(resValidation.statusCode, 400, 'Validation error must return status 400');
    console.log('All error.middleware unit assertions passed successfully!');
}
runTests().catch((err) => {
    console.error('Test failed:', err);
    process.exit(1);
});
