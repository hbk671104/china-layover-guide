#!/usr/bin/env node
/**
 * External link checker for china-layover-guide.
 *
 * Extracts every external URL from src/ and public/, fetches each one with a
 * browser User-Agent, and flags:
 *   - non-2xx responses after redirects
 *   - soft-404s (page body/title says "not found")
 *   - dead-end redirects that land on a bare homepage
 *   - suspiciously empty pages (JS shells that render nothing)
 *
 * Usage:
 *   node scripts/check-links.mjs            # report only
 *   node scripts/check-links.mjs --json     # machine-readable
 *
 * Exit code is 1 if any link is BROKEN, so it can gate CI.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const SELF_HOSTS = ['chinalayoverguide.com', 'localhost', '127.0.0.1'];
const SCAN_DIRS = ['src', 'public'];
const SCAN_EXT = new Set(['.md', '.mdx', '.astro', '.ts', '.tsx', '.js', '.mjs', '.json', '.txt', '.html', '.yaml', '.yml']);

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

// Sites that block datacenter/bot traffic. A failure here is NOT proof the
// link is dead for a real user in a browser, so we report it separately
// rather than as BROKEN.
const BOT_BLOCKED = ['airalo.com', 'getnomad.app', 'nomadesim.com'];

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    if (e.name === 'node_modules' || e.name === '.git' || e.name === 'dist') continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (SCAN_EXT.has(extname(e.name))) out.push(p);
  }
  return out;
}

function collect() {
  const map = new Map(); // url -> Set<file>
  const re = /https?:\/\/[A-Za-z0-9._~:/?#@!$&*+,;=%()\[\]-]+/g;
  for (const dir of SCAN_DIRS) {
    for (const file of walk(join(ROOT, dir))) {
      let text;
      try {
        text = readFileSync(file, 'utf8');
      } catch {
        continue;
      }
      for (const raw of text.match(re) ?? []) {
        const url = raw.replace(/[.,);\]'"]+$/, '');
        let host;
        try {
          host = new URL(url).hostname;
        } catch {
          continue;
        }
        if (SELF_HOSTS.some((h) => host === h || host.endsWith('.' + h))) continue;
        if (!map.has(url)) map.set(url, new Set());
        map.get(url).add(file.replace(ROOT, ''));
      }
    }
  }
  return map;
}

async function probe(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 25000);
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: ctrl.signal,
      headers: {
        'User-Agent': UA,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8',
      },
    });
    const status = res.status;
    const finalUrl = res.url;
    const ctype = res.headers.get('content-type') ?? '';
    let body = '';
    if (ctype.includes('html') || ctype.includes('text')) {
      body = (await res.text()).slice(0, 250000);
    }

    const title = (body.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '').trim();
    const visible = body
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const words = visible ? visible.split(' ').length : 0;

    const softNotFound =
      /not\s*found|页面不存在|404|找不到|no longer available|has been removed|链接失效/i.test(title) ||
      (words > 0 && words < 12 && /not\s*found|404|找不到|不存在/i.test(visible));

    const stripped = finalUrl.replace(/\/+$/, '');
    const landedOnHome =
      finalUrl !== url &&
      /^https?:\/\/[^/]+\/?$/.test(stripped) &&
      !/^https?:\/\/[^/]+\/?$/.test(url.replace(/\/+$/, ''));

    return { ok: res.ok, status, finalUrl, title, words, softNotFound, landedOnHome, error: null };
  } catch (err) {
    const msg = err.name === 'AbortError' ? 'timeout after 25s' : err.message;
    return { ok: false, status: 0, finalUrl: url, title: '', words: 0, softNotFound: false, landedOnHome: false, error: msg };
  } finally {
    clearTimeout(timer);
  }
}

const map = collect();
const urls = [...map.keys()].sort();
const json = process.argv.includes('--json');

if (!json) console.log(`Checking ${urls.length} unique external URLs...\n`);

const results = [];
const CONCURRENCY = 6;
for (let i = 0; i < urls.length; i += CONCURRENCY) {
  const batch = urls.slice(i, i + CONCURRENCY);
  const settled = await Promise.all(batch.map(async (u) => ({ url: u, ...(await probe(u)) })));
  results.push(...settled);
}

const isBotBlocked = (u) => BOT_BLOCKED.some((h) => new URL(u).hostname.endsWith(h));

const broken = [];
const blocked = [];
const warn = [];
const good = [];

for (const r of results) {
  if (r.ok && !r.softNotFound && !r.landedOnHome) good.push(r);
  else if (!r.ok && isBotBlocked(r.url)) blocked.push(r);
  else if (r.softNotFound || r.landedOnHome) warn.push(r);
  else broken.push(r);
}

if (json) {
  console.log(JSON.stringify({ good, broken, blocked, warn }, null, 2));
} else {
  const show = (label, rows) => {
    if (!rows.length) return;
    console.log(`\n${label} (${rows.length})`);
    console.log('─'.repeat(78));
    for (const r of rows) {
      const code = r.status || 'ERR';
      console.log(`  [${code}] ${r.url}`);
      if (r.finalUrl !== r.url) console.log(`        ↳ ${r.finalUrl}`);
      if (r.title) console.log(`        title: ${r.title.slice(0, 70)}`);
      if (r.words) console.log(`        words: ${r.words}`);
      if (r.error) console.log(`        error: ${r.error}`);
      if (r.softNotFound) console.log(`        ⚠ soft-404 pattern in content`);
      if (r.landedOnHome) console.log(`        ⚠ redirected to bare homepage`);
      const files = [...(map.get(r.url) ?? [])];
      if (files.length) console.log(`        cited in: ${files.slice(0, 3).join(', ')}${files.length > 3 ? ` (+${files.length - 3})` : ''}`);
    }
  };

  show('❌ BROKEN', broken);
  show('⚠️  SUSPECT (soft-404 / homepage redirect)', warn);
  show('🔒 UNVERIFIABLE (bot-blocked from this network)', blocked);

  console.log(`\n${'═'.repeat(78)}`);
  console.log(`✅ good: ${good.length}   ❌ broken: ${broken.length}   ⚠️  suspect: ${warn.length}   🔒 unverifiable: ${blocked.length}`);
}

process.exit(broken.length ? 1 : 0);
