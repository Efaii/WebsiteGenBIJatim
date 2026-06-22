"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestimonialService = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
/**
 * @service TestimonialService
 * @description CRUD operations for testimonial entries (DB layer only, no file I/O).
 */
exports.TestimonialService = {
    async getAll() {
        return prisma_1.default.testimonial.findMany({ orderBy: { createdAt: 'desc' } });
    },
    async findById(id) {
        return prisma_1.default.testimonial.findUnique({ where: { id } });
    },
    async create(data) {
        return prisma_1.default.testimonial.create({ data });
    },
    async update(id, data) {
        return prisma_1.default.testimonial.update({ where: { id }, data });
    },
    async delete(id) {
        return prisma_1.default.testimonial.delete({ where: { id } });
    },
};
