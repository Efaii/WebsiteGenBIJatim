"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/**
 * @service AuthService
 * @description Authentication logic: user lookup, password verification, token generation.
 */
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_123';
exports.AuthService = {
    async login(username, password) {
        const user = await prisma_1.default.user.findUnique({ where: { username } });
        if (!user)
            return null;
        const isValid = await bcrypt_1.default.compare(password, user.password);
        if (!isValid)
            return null;
        const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
        return {
            token,
            user: { id: user.id, username: user.username, name: user.name, role: user.role },
        };
    },
};
