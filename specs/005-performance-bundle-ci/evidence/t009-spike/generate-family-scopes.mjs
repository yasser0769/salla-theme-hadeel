import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const safePath = join(root, 'node_modules/@salla.sa/twilight-tailwind-theme/safe-list-css.txt');
const lines = readFileSync(safePath, 'utf8').split(/\r?\n/).map((s) => s.trim()).filter(Boolean);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.(?:twig|js|scss|json)$/.test(name)) out.push(p);
  }
  return out;
}

const sourceFiles = [
  ...walk(join(root, 'src/views')),
  ...walk(join(root, 'src/assets/js')),
  ...walk(join(root, 'src/assets/styles')),
  join(root, 'twilight.json'),
];
const sourceText = sourceFiles.map((p) => readFileSync(p, 'utf8')).join('\n');
const tags = new Set([...sourceText.matchAll(/\bsalla-([a-z0-9-]+)/g)].map((m) => `s-${m[1]}`));
const directTokens = new Set([...sourceText.matchAll(/\bs-[a-z0-9-]+/g)].map((m) => m[0]));

const launchTemplateFiles = sourceFiles.filter((p) => {
  const rel = relative(root, p).replaceAll('\\', '/');
  return rel === 'src/views/layouts/master.twig' ||
    rel.startsWith('src/views/components/') ||
    rel === 'src/views/pages/index.twig' ||
    rel === 'src/views/pages/cart.twig' ||
    rel.startsWith('src/views/pages/product/') ||
    rel.startsWith('src/views/pages/partials/product/') ||
    rel.startsWith('src/views/pages/brands/');
});
const launchText = launchTemplateFiles.map((p) => readFileSync(p, 'utf8')).join('\n');
const launchTags = new Set([...launchText.matchAll(/\bsalla-([a-z0-9-]+)/g)].map((m) => `s-${m[1]}`));

const alwaysFamilies = new Set([
  's-form', 's-input', 's-button', 's-modal', 's-alert', 's-toast', 's-placeholder',
  's-loading', 's-icon', 's-scrollbar', 's-drawer', 's-menu', 's-search',
  's-product-card', 's-add-product-button', 's-quantity-input', 's-slider',
  's-products-slider', 's-cart', 's-price', 's-money', 's-breadcrumb',
]);

const tagPrefixes = [...tags].sort((a, b) => b.length - a.length);
const launchPrefixes = [...launchTags].sort((a, b) => b.length - a.length);
const lineTokens = (line) => [...line.matchAll(/\bs-[a-z0-9-]+/g)].map((m) => m[0]);
const hasFamily = (token, family) => token === family || token.startsWith(`${family}-`);
const directLine = (line) => lineTokens(line).some((token) => directTokens.has(token));
const reachableLine = (line) => {
  const tokens = lineTokens(line);
  return tokens.length === 0 || directLine(line) ||
    tokens.some((token) => tagPrefixes.some((family) => hasFamily(token, family)));
};
const coreLine = (line) => {
  const tokens = lineTokens(line);
  return reachableLine(line) ||
    tokens.some((token) => [...alwaysFamilies].some((family) => hasFamily(token, family)));
};
const launchCoreLine = (line) => {
  const tokens = lineTokens(line);
  return tokens.length === 0 || directLine(line) ||
    tokens.some((token) => launchPrefixes.some((family) => hasFamily(token, family))) ||
    tokens.some((token) => [...alwaysFamilies].some((family) => hasFamily(token, family)));
};
const optionalCommerceFamilies = new Set([
  's-loyalty', 's-gifting', 's-offer', 's-offer-modal', 's-conditional-offer',
  's-tiered-offer', 's-comments', 's-reviews', 's-quick-order',
  's-multiple-bundle-product',
]);
const withoutInferredFamilies = (line, excluded) => {
  if (!launchCoreLine(line)) return false;
  if (directLine(line) || lineTokens(line).length === 0) return true;
  return !lineTokens(line).some((token) => [...excluded].some((family) => hasFamily(token, family)));
};
const loyaltyCartPattern = /(?:widget|panel|cart|modal|reward|exchange|redeem|tabs|slider|back-btn|points-banner|confirmation|prize-item)/;
const launchCoreLoyaltyCartLine = (line) => {
  if (!launchCoreLine(line)) return false;
  const tokens = lineTokens(line);
  const loyalty = tokens.some((token) => hasFamily(token, 's-loyalty'));
  if (!loyalty || directLine(line)) return true;
  return loyaltyCartPattern.test(line);
};

const variants = {
  'theme-direct': lines.filter(directLine),
  'theme-reachable': lines.filter(reachableLine),
  'theme-reachable-core': lines.filter(coreLine),
  'launch-core': lines.filter(launchCoreLine),
  'launch-core-loyalty-cart': lines.filter(launchCoreLoyaltyCartLine),
  'launch-core-no-loyalty-inferred': lines.filter((line) =>
    withoutInferredFamilies(line, new Set(['s-loyalty']))),
  'launch-core-essential': lines.filter((line) =>
    withoutInferredFamilies(line, optionalCommerceFamilies)),
};

for (const [name, kept] of Object.entries(variants)) {
  writeFileSync(join(root, `hdl05-safelist-${name}.txt`), `${kept.join('\n')}\n`);
}

const allFamilies = new Map();
for (const line of lines) {
  const token = lineTokens(line)[0] ?? '(generic)';
  const family = tagPrefixes.find((p) => hasFamily(token, p)) ?? token;
  allFamilies.set(family, (allFamilies.get(family) ?? 0) + 1);
}

const report = {
  safeLines: lines.length,
  sourceFiles: sourceFiles.length,
  sourceTags: [...tags].sort(),
  launchTags: [...launchTags].sort(),
  directTokens: directTokens.size,
  variants: Object.fromEntries(Object.entries(variants).map(([k, v]) => [k, {
    kept: v.length,
    removed: lines.length - v.length,
  }])),
  topFamilies: [...allFamilies].sort((a, b) => b[1] - a[1]).slice(0, 40),
};
writeFileSync(join(root, 'hdl05-family-inventory.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
