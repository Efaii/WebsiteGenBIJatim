"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
/**
 * @module prisma
 * @description Shared PrismaClient singleton to prevent multiple DB connections.
 */
const prisma = new client_1.PrismaClient();
exports.default = prisma;
