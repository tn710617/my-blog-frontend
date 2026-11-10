#!/usr/bin/env node
// 票 04 ④(決策 9-1):拉正式站全部公開文章,用和 PostBody 同一條 remark/rehype 管線建出 AST,
// 列出實際用到的標籤與屬性,再用 src/Pages/SinglePost/sanitizeSchema.js 過濾一次,
// 把「過濾前後 HTML 序列化不一致」的文章逐篇印出來(含被拿掉 / 被拆掉的節點)。
//
// 用法:node tools/audit-post-html.mjs [API base,預設 https://blog-api.learn-or-die.com/api/v1]
// 不需登入;只打公開的 GET /posts。
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { visit } from 'unist-util-visit';
import { toHtml } from 'hast-util-to-html';
import { postSanitizeSchema, rehypeDropIframesWithoutSrc, rehypeLowercaseUrlScheme } from '../src/Pages/SinglePost/sanitizeSchema.js';

const base = process.argv[2] ?? 'https://blog-api.learn-or-die.com/api/v1';
const locales = ['en', 'zh-TW'];

async function fetchAllPosts() {
  const posts = new Map();
  for (const locale of locales) {
    let page = 1;
    let lastPage = 1;
    do {
      const res = await fetch(`${base}/posts?page=${page}&locale=${locale}`);
      if (!res.ok) throw new Error(`${res.status} fetching page ${page} (${locale})`);
      const body = await res.json();
      for (const p of body.data) posts.set(p.id, p);
      lastPage = body.meta.last_page;
      page += 1;
    } while (page <= lastPage);
  }
  return [...posts.values()];
}

const raw = unified().use(remarkParse).use(remarkGfm).use(remarkRehype, { allowDangerousHtml: true }).use(rehypeRaw);
const clean = unified().use(remarkParse).use(remarkGfm).use(remarkRehype, { allowDangerousHtml: true }).use(rehypeRaw).use(rehypeLowercaseUrlScheme).use(rehypeSanitize, postSanitizeSchema).use(rehypeDropIframesWithoutSrc);

function inventory(tree, into) {
  visit(tree, 'element', (node) => {
    const attrs = Object.keys(node.properties ?? {}).sort().join(',');
    const key = `${node.tagName}[${attrs}]`;
    into.set(key, (into.get(key) ?? 0) + 1);
  });
}

function secretBlocks(tree) {
  const out = [];
  visit(tree, 'element', (node) => {
    if (node.tagName === 'code' && (node.properties?.className ?? []).includes('language-secret')) {
      out.push(node.children.map((c) => c.value ?? '').join(''));
    }
  });
  return out;
}

const posts = await fetchAllPosts();
const used = new Map();
const changed = [];
function audit(id, locale, title, md) {
  const before = raw.runSync(raw.parse(md));
  const after = clean.runSync(clean.parse(md));
  inventory(before, used);
  const a = toHtml(before);
  const b = toHtml(after);
  if (a !== b) {
    const inv = new Map();
    inventory(before, inv);
    const invAfter = new Map();
    inventory(after, invAfter);
    const lost = [...inv].filter(([k, n]) => (invAfter.get(k) ?? 0) < n).map(([k, n]) => `${k}×${n - (invAfter.get(k) ?? 0)}`);
    changed.push({ id, locale, title, lost, textLost: before && textOf(before) !== textOf(after) });
  }
  for (const inner of secretBlocks(before)) audit(`${id}:secret`, locale, title, inner);
}
function textOf(tree) {
  let s = '';
  visit(tree, 'text', (n) => { s += n.value; });
  return s;
}
for (const p of posts) audit(p.id, p.locale, p.post_title, p.post_content ?? '');

console.log(`posts fetched: ${posts.length} (${locales.join(', ')})`);
console.log('\n== tags and attributes used (tag[attrs] × occurrences)');
for (const [k, n] of [...used].sort()) console.log(`${k} × ${n}`);
console.log(`\n== posts whose rendered HTML changes after sanitize: ${changed.length}`);
for (const c of changed) console.log(`post ${c.id} [${c.locale}] ${c.title}\n  removed/unwrapped: ${c.lost.join(' ')}\n  visible text changed: ${c.textLost ? 'YES' : 'no'}`);
