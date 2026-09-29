"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cmsPublicationStatus = void 0;
const client_1 = require("@prisma/client");
const cmsPublicationStatus = (value) => typeof value === "string" && Object.values(client_1.PublicationStatus).includes(value)
    ? value
    : undefined;
exports.cmsPublicationStatus = cmsPublicationStatus;
