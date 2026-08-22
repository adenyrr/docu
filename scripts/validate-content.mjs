import fs from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';
import matter from 'gray-matter';

const root = process.cwd();
const contentRoot = path.join(root, 'src/content/docs');
const files = (await fg('**/*.mdx', { cwd: contentRoot })).sort();
const errors = [];

if (files.length !== 49) errors.push(`49 pages éditoriales attendues, ${files.length} trouvées.`);

const routes = new Set(files.map((file) => {
  const id = file.replace(/\.mdx$/, '');
  return id === 'index' ? '/' : `/${id}`;
}));
routes.add('/tags');

const config = await fs.readFile(path.join(root, 'src/config.ts'), 'utf8');
const navSlugs = new Set([...config.matchAll(/item\('[^']+',\s*'([^']+)'\)/g)].map((match) => match[1]));

for (const file of files) {
  const absolute = path.join(contentRoot, file);
  const source = await fs.readFile(absolute, 'utf8');
  const parsed = matter(source);
  const id = file.replace(/\.mdx$/, '');
  for (const field of ['title', 'description', 'last_modified', 'tags']) {
    if (!parsed.data[field] || (Array.isArray(parsed.data[field]) && !parsed.data[field].length)) errors.push(`${file}: frontmatter ${field} manquant.`);
  }
  if (!navSlugs.has(id)) errors.push(`${file}: page absente de la navigation.`);
  if (/^(?:\s*)(?:!!!|\?\?\?|===)\s+/m.test(parsed.content)) errors.push(`${file}: syntaxe Zensical résiduelle.`);
  const legacyMdLinks = [
    ...[...parsed.content.matchAll(/\]\(([^)\s]+\.md(?:#[^)\s]+)?)/gi)].map((match) => match[1]),
    ...[...parsed.content.matchAll(/href=["']([^"']+\.md(?:#[^"']+)?)/gi)].map((match) => match[1]),
  ].filter((link) => !/^https?:\/\//i.test(link));
  if (legacyMdLinks.length) errors.push(`${file}: lien Markdown hérité en .md.`);

  const links = [
    ...[...parsed.content.matchAll(/\]\((\/[^)#\s]+)(?:#[^)]+)?\)/g)].map((match) => match[1]),
    ...[...parsed.content.matchAll(/href=["'](\/[^"'#]+)(?:#[^"']+)?["']/g)].map((match) => match[1]),
  ];
  for (const link of links) {
    if (link.startsWith('/assets/')) {
      try { await fs.access(path.join(root, 'public', link)); } catch { errors.push(`${file}: ressource absente ${link}.`); }
    } else if (!routes.has(link.replace(/\/$/, '')) && !link.startsWith('/tags/')) {
      errors.push(`${file}: route interne inconnue ${link}.`);
    }
  }
}

if (errors.length) {
  console.error(errors.map((error) => `✗ ${error}`).join('\n'));
  process.exit(1);
}

console.log(`✓ ${files.length} pages MDX · navigation complète · aucun marqueur Zensical · liens locaux valides`);
