import { config } from 'dotenv';
import { resolve } from 'node:path';

// Load monorepo root .env before shared-config validation (dev cwd: apps/api).
config({ path: resolve(process.cwd(), '../../.env') });
