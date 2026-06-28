#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const designPath = path.join(root, 'DESIGN.md');
const cssPath = path.join(
  root,
  'tools/wp-plugins/ttcqn-home-emergency-renderer/assets/ttcqn-home.min.css'
);
const footerCssPath = path.join(
  root,
  'tools/wp-plugins/ttcqn-home-emergency-renderer/assets/ttcqn-shared-footer.css'
);

const tokenMap = {
  colors: {
    primary: '--ttcqn-color-primary',
    primaryHover: '--ttcqn-color-primary-hover',
    primaryBright: '--ttcqn-color-primary-bright',
    secondary: '--ttcqn-color-secondary',
    secondaryHover: '--ttcqn-color-secondary-hover',
    accent: '--ttcqn-color-accent',
    warning: '--ttcqn-color-warning',
    info: '--ttcqn-color-info',
    error: '--ttcqn-color-error',
    success: '--ttcqn-color-success',
    background: '--ttcqn-color-background',
    surface: '--ttcqn-color-surface',
    surfaceMuted: '--ttcqn-color-surface-muted',
    border: '--ttcqn-color-border',
    textPrimary: '--ttcqn-color-text-primary',
    textSecondary: '--ttcqn-color-text-secondary',
    textMuted: '--ttcqn-color-text-muted',
    onDark: '--ttcqn-color-on-dark',
    onDarkMuted: '--ttcqn-color-on-dark-muted',
    dark: '--ttcqn-color-dark',
    darkSecondary: '--ttcqn-color-dark-2',
    darkTertiary: '--ttcqn-color-dark-3',
  },
  shadows: {
    soft: '--ttcqn-shadow-soft',
    card: '--ttcqn-shadow-card',
  },
};

const footerTokenMap = {
  '--footer-bg': 'var(--ttcqn-color-dark-2)',
  '--footer-card': 'var(--ttcqn-color-dark-3)',
  '--footer-card-2':
    'color-mix(in srgb, var(--ttcqn-color-dark-3) 84%, var(--ttcqn-color-secondary) 16%)',
  '--footer-blue': 'color-mix(in srgb, var(--ttcqn-color-secondary) 32%, transparent)',
  '--footer-green': 'var(--ttcqn-color-primary-bright)',
  '--footer-green-2': 'var(--ttcqn-color-primary)',
  '--footer-text': 'var(--ttcqn-color-on-dark)',
  '--footer-text-soft': 'var(--ttcqn-color-on-dark)',
  '--footer-muted': 'var(--ttcqn-color-on-dark-muted)',
};

function readFrontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    throw new Error('DESIGN.md does not contain YAML frontmatter.');
  }
  return match[1];
}

function readSectionMap(frontmatter, sectionName) {
  const lines = frontmatter.split(/\r?\n/);
  const sectionStart = lines.findIndex((line) => line === `${sectionName}:`);
  if (sectionStart === -1) return {};

  const out = {};
  for (let index = sectionStart + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^\S/.test(line)) break;
    const match = line.match(/^  ([A-Za-z0-9_-]+):\s*(.+?)\s*$/);
    if (!match) continue;
    out[match[1]] = match[2].replace(/^["']|["']$/g, '');
  }
  return out;
}

function readCssVars(source) {
  const out = {};
  const regex = /(--ttcqn-(?:color|shadow)-[a-z0-9-]+)\s*:\s*([^;]+);/gi;
  for (const match of source.matchAll(regex)) {
    out[match[1]] = match[2].trim();
  }
  return out;
}

function readCustomProperties(source, prefix) {
  const out = {};
  const regex = new RegExp(`(${prefix}[a-z0-9-]+)\\s*:\\s*([^;]+);`, 'gi');
  for (const match of source.matchAll(regex)) {
    out[match[1]] = match[2].trim();
  }
  return out;
}

function normalize(value) {
  return String(value)
    .trim()
    .replace(/^["']|["']$/g, '')
    .replace(/\s+/g, '')
    .toLowerCase();
}

const design = fs.readFileSync(designPath, 'utf8');
const css = fs.readFileSync(cssPath, 'utf8');
const footerCss = fs.readFileSync(footerCssPath, 'utf8');
const frontmatter = readFrontmatter(design);
const cssVars = readCssVars(css);
const footerVars = readCustomProperties(footerCss, '--footer-');

const failures = [];
const checked = [];

for (const [section, mappings] of Object.entries(tokenMap)) {
  const designTokens = readSectionMap(frontmatter, section);

  for (const [designToken, cssVar] of Object.entries(mappings)) {
    const designValue = designTokens[designToken];
    const cssValue = cssVars[cssVar];

    if (!designValue) {
      failures.push(`Missing DESIGN.md token ${section}.${designToken}`);
      continue;
    }
    if (!cssValue) {
      failures.push(`Missing renderer CSS variable ${cssVar}`);
      continue;
    }
    if (normalize(designValue) !== normalize(cssValue)) {
      failures.push(
        `${section}.${designToken} (${designValue}) does not match ${cssVar} (${cssValue})`
      );
      continue;
    }

    checked.push(`${section}.${designToken} -> ${cssVar}`);
  }
}

const expectedCssVars = new Set(
  Object.values(tokenMap.colors).concat(Object.values(tokenMap.shadows))
);
for (const cssVar of Object.keys(cssVars).sort()) {
  if (!expectedCssVars.has(cssVar)) {
    failures.push(`Renderer CSS variable ${cssVar} has no DESIGN.md mapping.`);
  }
}

for (const [footerVar, expectedValue] of Object.entries(footerTokenMap)) {
  const actualValue = footerVars[footerVar];
  if (!actualValue) {
    failures.push(`Missing shared footer variable ${footerVar}`);
    continue;
  }
  if (normalize(actualValue) !== normalize(expectedValue)) {
    failures.push(
      `${footerVar} (${actualValue}) does not match expected token reference (${expectedValue})`
    );
    continue;
  }
  checked.push(`footer ${footerVar}`);
}

if (failures.length > 0) {
  console.error(JSON.stringify({ ok: false, failures, checked }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, checkedCount: checked.length, checked }, null, 2));
