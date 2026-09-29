"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const prisma_1 = require("../lib/prisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const login = async (req, res) => {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret)
        return res.status(500).json({ message: 'JWT_SECRET is not configured' });
    const { username, password } = req.body;
    if (!username || typeof username !== 'string' || !username.trim()) {
        return res.status(400).json({ message: 'Username is required' });
    }
    if (!password || typeof password !== 'string') {
        return res.status(400).json({ message: 'Password is required' });
    }
    const user = await prisma_1.prisma.user.findUnique({ where: { username } });
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isValid = await bcrypt_1.default.compare(password, user.password);
    if (!isValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username, role: user.role }, jwtSecret, { expiresIn: '1d' });
    res.status(200).json({
        message: 'Login successful',
        token,
        user: {
            id: user.id,
            username: user.username,
            name: user.name,
            role: user.role,
        }
    });
};
exports.login = login;
