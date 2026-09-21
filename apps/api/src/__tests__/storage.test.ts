import assert from 'node:assert/strict';
import { publicStoragePath, privateStoragePath } from '../lib/storage';

process.env.PUBLIC_STORAGE_ROOT = 'C:/genbi-test/public';
process.env.PRIVATE_STORAGE_ROOT = 'C:/genbi-test/private';
assert.match(publicStoragePath('news/cover.webp'), /genbi-test[\\/]public[\\/]news[\\/]cover\.webp$/);
assert.match(privateStoragePath('news/staged.webp'), /genbi-test[\\/]private[\\/]news[\\/]staged\.webp$/);
assert.throws(() => publicStoragePath('../private/secret.txt'), /escapes its configured root/);
assert.throws(() => privateStoragePath('..\\public\\secret.txt'), /escapes its configured root/);
