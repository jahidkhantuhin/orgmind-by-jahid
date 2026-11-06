import { defineConfig } from 'vitest/config';
import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const localEnvFile = resolve(rootDirectory, '.env');
if (existsSync(localEnvFile)) loadEnvFile(localEnvFile);
process.env.NODE_ENV = 'test';

export default defineConfig({
  test: {
    exclude: ['**/node_modules/**', '**/dist/**'],
  },
});
