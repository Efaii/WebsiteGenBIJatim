"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.privateStoragePath = exports.publicStoragePath = exports.ensureStorageRoots = exports.storageRoots = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const runtime_config_1 = require("./runtime-config");
const storageRoots = () => {
    const config = (0, runtime_config_1.assertRuntimeConfig)();
    return { publicRoot: config.publicStorageRoot, privateRoot: config.privateStorageRoot };
};
exports.storageRoots = storageRoots;
const ensureStorageRoots = async () => {
    const roots = (0, exports.storageRoots)();
    await Promise.all([promises_1.default.mkdir(roots.publicRoot, { recursive: true }), promises_1.default.mkdir(roots.privateRoot, { recursive: true })]);
    await Promise.all([promises_1.default.access(roots.publicRoot, promises_1.default.constants.W_OK), promises_1.default.access(roots.privateRoot, promises_1.default.constants.W_OK)]);
    return roots;
};
exports.ensureStorageRoots = ensureStorageRoots;
const resolveWithin = (root, relative) => {
    const resolvedRoot = path_1.default.resolve(root);
    const resolvedPath = path_1.default.resolve(resolvedRoot, relative);
    if (resolvedPath !== resolvedRoot && !resolvedPath.startsWith(`${resolvedRoot}${path_1.default.sep}`))
        throw new Error('Storage path escapes its configured root.');
    return resolvedPath;
};
const publicStoragePath = (relative) => resolveWithin((0, exports.storageRoots)().publicRoot, relative);
exports.publicStoragePath = publicStoragePath;
const privateStoragePath = (relative) => resolveWithin((0, exports.storageRoots)().privateRoot, relative);
exports.privateStoragePath = privateStoragePath;
