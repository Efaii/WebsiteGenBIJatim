import fs from 'fs/promises';
import path from 'path';
import { assertRuntimeConfig } from './runtime-config';

export const storageRoots = () => {
  const config = assertRuntimeConfig();
  return { publicRoot: config.publicStorageRoot, privateRoot: config.privateStorageRoot };
};

export const ensureStorageRoots = async () => {
  const roots = storageRoots();
  await Promise.all([fs.mkdir(roots.publicRoot, { recursive: true }), fs.mkdir(roots.privateRoot, { recursive: true })]);
  await Promise.all([fs.access(roots.publicRoot, fs.constants.W_OK), fs.access(roots.privateRoot, fs.constants.W_OK)]);
  return roots;
};

const resolveWithin = (root: string, relative: string) => {
  const resolvedRoot = path.resolve(root);
  const resolvedPath = path.resolve(resolvedRoot, relative);
  if (resolvedPath !== resolvedRoot && !resolvedPath.startsWith(`${resolvedRoot}${path.sep}`)) throw new Error('Storage path escapes its configured root.');
  return resolvedPath;
};

export const publicStoragePath = (relative: string) => resolveWithin(storageRoots().publicRoot, relative);
export const privateStoragePath = (relative: string) => resolveWithin(storageRoots().privateRoot, relative);
