#!/usr/bin/env node
/**
 * CSS regression harness.
 *
 * Refactoring stylesheets is normally unverifiable without a live browser: you move
 * rules around and hope. This makes it verifiable *offline*.
 *
 * It parses the BUILT public/app.css and emits one normalized line per rule:
 *
 *     @media (max-width:767px) || .kalles-product-overview || display:flex; gap:24px
 *
 * Take a snapshot before a refactor, take another after, and diff them. An empty diff
 * proves the refactor changed no rule. A non-empty diff is the exact list of what you
 * changed — which you then justify line by line, instead of guessing.
 *
 * Usage:
 *   node scripts/css-snapshot.mjs before.txt      # write a snapshot
 *   diff before.txt after.txt
 */

import { readFileSync, writeFileSync } from 'node:fs';
import process from 'node:process';

const CSS = new URL('../public/app.css', import.meta.url).pathname;
const out = process.argv[2];

if (!out) {
  console.error('usage: node scripts/css-snapshot.mjs <output-file>');
  process.exit(2);
}

const css = readFileSync(CSS, 'utf8');

/**
 * Minimal CSS block reader. Walks the text tracking brace depth and string/comment
 * state, so at-rules nest correctly and braces inside quotes or data: URIs are ignored.
 */
function parse(text) {
  const rules = [];
  const stack = []; // active at-rule preludes, outermost first
  let buf = '';
  let i = 0;

  while (i < text.length) {
    const ch = text[i];

    if (ch === '"' || ch === "'") {
      const quote = ch;
      buf += ch;
      i++;
      while (i < text.length) {
        buf += text[i];
        if (text[i] === '\\') { buf += text[i + 1] ?? ''; i += 2; continue; }
        if (text[i] === quote) { i++; break; }
        i++;
      }
      continue;
    }

    if (ch === '/' && text[i + 1] === '*') {
      i = text.indexOf('*/', i + 2);
      i = i === -1 ? text.length : i + 2;
      continue;
    }

    if (ch === '{') {
      const prelude = buf.trim();
      buf = '';
      i++;
      if (prelude.startsWith('@')) {
        // Conditional group rule — descend, its children are real rules.
        if (/^@(media|supports|layer|container|scope)\b/.test(prelude)) {
          stack.push(prelude.replace(/\s+/g, ' '));
        } else {
          // @font-face, @keyframes, … — record whole, skip its body.
          const body = readBalanced(text, i);
          rules.push({ context: stack.join(' && '), selector: prelude, decls: body.content.trim() });
          i = body.end;
        }
        continue;
      }
      const body = readBalanced(text, i);
      const decls = body.content
        .split(';')
        .map((d) => d.trim())
        .filter(Boolean)
        .join('; ');
      for (const sel of splitSelectorList(prelude)) {
        const s = sel.trim().replace(/\s+/g, ' ');
        if (s) rules.push({ context: stack.join(' && '), selector: s, decls });
      }
      i = body.end;
      continue;
    }

    if (ch === '}') {
      stack.pop();
      buf = '';
      i++;
      continue;
    }

    buf += ch;
    i++;
  }
  return rules;
}

/**
 * Split a selector list on top-level commas only. `:where([dir=rtl], [dir=rtl] *)`
 * and `:is(…)` carry their own commas; a naive split tore those rules in half.
 */
function splitSelectorList(prelude) {
  const out = [];
  let depth = 0;
  let buf = '';
  for (const ch of prelude) {
    if (ch === '(' || ch === '[') depth++;
    else if (ch === ')' || ch === ']') depth = Math.max(0, depth - 1);
    if (ch === ',' && depth === 0) { out.push(buf); buf = ''; continue; }
    buf += ch;
  }
  out.push(buf);
  return out;
}

/** Read from just after an opening brace to its matching close. */
function readBalanced(text, start) {
  let depth = 1;
  let i = start;
  while (i < text.length && depth > 0) {
    const ch = text[i];
    if (ch === '"' || ch === "'") {
      const quote = ch;
      i++;
      while (i < text.length) {
        if (text[i] === '\\') { i += 2; continue; }
        if (text[i] === quote) { i++; break; }
        i++;
      }
      continue;
    }
    if (ch === '/' && text[i + 1] === '*') {
      const end = text.indexOf('*/', i + 2);
      i = end === -1 ? text.length : end + 2;
      continue;
    }
    if (ch === '{') depth++;
    if (ch === '}') depth--;
    i++;
  }
  return { content: text.slice(start, i - 1), end: i };
}

const rules = parse(css);

// Sorted so the diff shows real changes, not reordering. Ordering effects are a
// separate concern — this proves the rule SET is intact.
const lines = rules
  .map((r) => `${r.context} || ${r.selector} || ${r.decls}`)
  .sort();

writeFileSync(out, lines.join('\n') + '\n');
console.log(`${rules.length} rules -> ${out}`);
