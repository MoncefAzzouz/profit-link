/**
 * One-time migration: pull base64 data URLs out of Postgres and write them as
 * files under <backend>/uploads/. Replaces every `data:image/...;base64,...`
 * occurrence in:
 *   - Product.image
 *   - Product.images[]
 *   - StoreSettings.logoUrl
 *   - StoreSettings.config (JSON, deep)
 *   - LandingPage.pageConfig (JSON, deep)
 *
 * Safe to run multiple times: non-data URLs are skipped. Identical images are
 * deduplicated via SHA-1 of the bytes.
 *
 * Usage:
 *   cd backend
 *   PUBLIC_BASE_URL=https://www.easyprofit.org npx ts-node scratch/migrate-base64-images.ts
 *
 * If PUBLIC_BASE_URL is omitted, relative URLs (/uploads/<file>) are stored,
 * which work for same-origin frontends.
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const BASE_URL = (process.env.PUBLIC_BASE_URL || '').replace(/\/$/, '');

const MIME_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
};

const DATA_URL_RE = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/;

let imagesMigrated = 0;
let bytesFreed = 0;
let filesWritten = 0;
const seenHashes = new Set<string>();

function ensureUploadsDir() {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * If `value` is a base64 data URL, write the decoded bytes to /uploads and
 * return the public URL. Otherwise return the input unchanged.
 */
function migrateValue(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  const match = value.match(DATA_URL_RE);
  if (!match) return value;

  const mime = match[1].toLowerCase();
  const b64 = match[2];
  const ext = MIME_EXT[mime] || 'bin';

  let buffer: Buffer;
  try {
    buffer = Buffer.from(b64, 'base64');
  } catch {
    console.warn('Skipping malformed data URL');
    return value;
  }

  const hash = crypto.createHash('sha1').update(buffer).digest('hex');
  const filename = `${hash}.${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);

  if (!seenHashes.has(hash) && !fs.existsSync(filepath)) {
    fs.writeFileSync(filepath, buffer);
    filesWritten++;
  }
  seenHashes.add(hash);

  imagesMigrated++;
  bytesFreed += value.length;
  return `${BASE_URL}/uploads/${filename}`;
}

/**
 * Recursively walk a JSON value, replacing any base64 image strings in place.
 * Returns a new value (object/array) or the original if nothing changed.
 */
function walkJson(value: unknown): unknown {
  if (Array.isArray(value)) {
    let mutated = false;
    const next = value.map(item => {
      const replaced = walkJson(item);
      if (replaced !== item) mutated = true;
      return replaced;
    });
    return mutated ? next : value;
  }
  if (value && typeof value === 'object') {
    let mutated = false;
    const next: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const replaced = walkJson(v);
      if (replaced !== v) mutated = true;
      next[k] = replaced;
    }
    return mutated ? next : value;
  }
  if (typeof value === 'string') {
    return migrateValue(value);
  }
  return value;
}

async function migrateProducts() {
  const batchSize = 100;
  let cursor: string | undefined;
  let scanned = 0;

  while (true) {
    const batch: Array<{ id: string; image: string | null; images: string[] }> =
      await prisma.product.findMany({
        take: batchSize,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        orderBy: { id: 'asc' },
        select: { id: true, image: true, images: true },
      });
    if (batch.length === 0) break;

    for (const product of batch) {
      scanned++;
      const newImage = migrateValue(product.image);
      const newImages = product.images.map(migrateValue) as string[];
      const imageChanged = newImage !== product.image;
      const imagesChanged = newImages.some((v, i) => v !== product.images[i]);

      if (imageChanged || imagesChanged) {
        await prisma.product.update({
          where: { id: product.id },
          data: {
            ...(imageChanged && { image: newImage as string | null }),
            ...(imagesChanged && { images: newImages }),
          },
        });
      }
    }

    cursor = batch[batch.length - 1].id;
    if (batch.length < batchSize) break;
  }

  console.log(`  Products scanned: ${scanned}`);
}

async function migrateStoreSettings() {
  const all = await prisma.storeSettings.findMany({
    select: { id: true, logoUrl: true, config: true },
  });

  for (const s of all) {
    const newLogo = migrateValue(s.logoUrl);
    const newConfig = walkJson(s.config);
    const logoChanged = newLogo !== s.logoUrl;
    const configChanged = newConfig !== s.config;

    if (logoChanged || configChanged) {
      await prisma.storeSettings.update({
        where: { id: s.id },
        data: {
          ...(logoChanged && { logoUrl: newLogo as string | null }),
          ...(configChanged && { config: newConfig as any }),
        },
      });
    }
  }

  console.log(`  StoreSettings scanned: ${all.length}`);
}

async function migrateLandingPages() {
  const batchSize = 100;
  let cursor: string | undefined;
  let scanned = 0;

  while (true) {
    const batch: Array<{ id: string; pageConfig: unknown }> =
      await prisma.landingPage.findMany({
        take: batchSize,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        orderBy: { id: 'asc' },
        select: { id: true, pageConfig: true },
      });
    if (batch.length === 0) break;

    for (const page of batch) {
      scanned++;
      const newConfig = walkJson(page.pageConfig);
      if (newConfig !== page.pageConfig) {
        await prisma.landingPage.update({
          where: { id: page.id },
          data: { pageConfig: newConfig as any },
        });
      }
    }

    cursor = batch[batch.length - 1].id;
    if (batch.length < batchSize) break;
  }

  console.log(`  LandingPages scanned: ${scanned}`);
}

async function main() {
  console.log('Migrating base64 images out of the database...');
  console.log(`  Upload dir: ${UPLOAD_DIR}`);
  console.log(`  Public URL prefix: ${BASE_URL || '(relative)'}`);
  ensureUploadsDir();

  const start = Date.now();

  console.log('\n[1/3] Products');
  await migrateProducts();

  console.log('\n[2/3] StoreSettings');
  await migrateStoreSettings();

  console.log('\n[3/3] LandingPages');
  await migrateLandingPages();

  const seconds = ((Date.now() - start) / 1000).toFixed(1);
  const mbFreed = (bytesFreed / 1024 / 1024).toFixed(2);

  console.log('\n--- Summary ---');
  console.log(`  Images migrated: ${imagesMigrated}`);
  console.log(`  Unique files written: ${filesWritten}`);
  console.log(`  Base64 bytes removed from DB: ${mbFreed} MB`);
  console.log(`  Time: ${seconds}s`);
  console.log('\nDone. Consider running VACUUM FULL in psql to reclaim disk.');
}

main()
  .catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
