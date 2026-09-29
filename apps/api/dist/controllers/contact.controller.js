"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContactMessage = void 0;
const prisma_1 = require("../lib/prisma");
const createContactMessage = async (req, res) => {
    const { name, email, subject, message } = req.body;
    const errors = [];
    if (!name || typeof name !== 'string' || !name.trim())
        errors.push('Name is required');
    if (!email || typeof email !== 'string' || !email.trim())
        errors.push('Email is required');
    if (!subject || typeof subject !== 'string' || !subject.trim())
        errors.push('Subject is required');
    if (!message || typeof message !== 'string' || !message.trim())
        errors.push('Message is required');
    if (errors.length > 0) {
        return res.status(400).json({ message: 'Validation failed', errors });
    }
    const contactMessage = await prisma_1.prisma.contactMessage.create({
        data: { name, email, subject, message },
    });
    res.status(201).json(contactMessage);
};
exports.createContactMessage = createContactMessage;
