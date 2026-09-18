import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * Guards the `updated` dates that drive both the visible "Last updated" line and
 * the sitemap's lastmod signal.
 *
 * Two failure modes this catches, both of which have shipped before:
 *   1. A date in the future (a typo like 2026-09-03 written on the 17th, or a
 *      copy-pasted date that never gets edited).
 *   2. A date that disagrees with the file's own creation date, which makes the
 *      whole lastmod signal uniform and therefore worthless.
 *
 * If either fires, run: python3 scripts/sync-dates.py
 */

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.resolve(HERE, '..', 'content');

const COLLECTIONS = ['guides', 'cities'] as const;

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Calendar date the file was created. APFS preserves birthtime across edits, so
 * it does not move when the file is rewritten — unlike mtime.
 */
async function createdDate(file: string): Promise<string> {
  const stats = await stat(file);
  const created = stats.birthtimeMs || stats.mtimeMs;
  return toIsoDate(new Date(created));
}

async function frontmatterDate(file: string): Promise<string | null> {
  const raw = await readFile(file, 'utf8');
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;

  const updated = match[1].match(/^updated:\s*(.+)$/m);
  if (!updated) return null;

  return updated[1].trim().replace(/^['"]|['"]$/g, '');
}

async function entries(collection: string) {
  const dir = path.join(CONTENT_DIR, collection);
  const files = await readdir(dir);
  return files
    .filter((file) => /\.mdx?$/.test(file))
    .map((file) => ({ file, full: path.join(dir, file) }));
}

describe('content dates', () => {
  for (const collection of COLLECTIONS) {
    describe(collection, () => {
      it('every entry declares an updated date', async () => {
        const all = await entries(collection);
        expect(all.length).toBeGreaterThan(0);

        const missing: string[] = [];
        for (const entry of all) {
          if (!(await frontmatterDate(entry.full))) missing.push(entry.file);
        }

        expect(missing, `entries missing "updated": ${missing.join(', ')}`).toEqual([]);
      });

      it('no updated date is in the future', async () => {
        const today = toIsoDate(new Date());
        const future: string[] = [];

        for (const entry of await entries(collection)) {
          const updated = await frontmatterDate(entry.full);
          if (updated && updated > today) {
            future.push(`${entry.file} (${updated})`);
          }
        }

        expect(future, `dates ahead of today (${today}): ${future.join(', ')}`).toEqual([]);
      });

      it('updated matches each file creation date', async () => {
        const drifted: string[] = [];

        for (const entry of await entries(collection)) {
          const declared = await frontmatterDate(entry.full);
          if (!declared) continue;

          const created = await createdDate(entry.full);
          if (declared !== created) {
            drifted.push(`${entry.file}: declared ${declared}, created ${created}`);
          }
        }

        expect(
          drifted,
          `Run "python3 scripts/sync-dates.py" to fix:\n  ${drifted.join('\n  ')}`,
        ).toEqual([]);
      });
    });
  }

  it('body review dates agree with frontmatter', async () => {
    const mismatched: string[] = [];

    for (const collection of COLLECTIONS) {
      for (const entry of await entries(collection)) {
        const declared = await frontmatterDate(entry.full);
        if (!declared) continue;

        const raw = await readFile(entry.full, 'utf8');
        const body = raw.replace(/^---\r?\n[\s\S]*?\r?\n---/, '');

        for (const match of body.matchAll(/(?:last reviewed on|Reviewed)\s+(\d{4}-\d{2}-\d{2})/g)) {
          if (match[1] !== declared) {
            mismatched.push(`${entry.file}: body ${match[1]} vs frontmatter ${declared}`);
          }
        }
      }
    }

    expect(mismatched, `page contradicts itself:\n  ${mismatched.join('\n  ')}`).toEqual([]);
  });
});

describe('rule data review dates', () => {
  it('lastReviewed is not in the future and not stale', async () => {
    const files = ['visa-rules.ts', 'payment-matrix.ts'];

    for (const file of files) {
      const raw = await readFile(path.join(CONTENT_DIR, '..', 'data', file), 'utf8');
      const match = raw.match(/lastReviewed:\s*'(\d{4}-\d{2}-\d{2})'/);
      expect(match, `${file} should export a lastReviewed date`).not.toBeNull();

      const declared = match![1];
      const today = toIsoDate(new Date());
      expect(declared <= today, `${file}: lastReviewed ${declared} is in the future`).toBe(true);

      // Rule data must be re-verified periodically, not left to rot silently.
      const ageDays = (Date.parse(today) - Date.parse(declared)) / 86_400_000;
      expect(ageDays, `${file}: lastReviewed is ${Math.round(ageDays)} days old`).toBeLessThan(365);
    }
  });
});
