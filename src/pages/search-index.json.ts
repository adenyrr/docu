import { getCollection } from 'astro:content';
import { routeForSlug } from '../config';
import { normalizeTags, slugifyTag } from '../lib/tags';

export const prerender = true;

function plainText(value: string): string {
  return value
    .replace(/^---[\s\S]*?---/m, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[`*_>#|{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function GET() {
  const entries = (await getCollection('docs', ({ data }) => !data.draft && !data.search?.exclude))
    .map((entry) => ({
      id: entry.id,
      url: routeForSlug(entry.id),
      title: entry.data.title,
      description: entry.data.description,
      tags: normalizeTags(entry.data.tags).map(slugifyTag).join(' '),
      text: plainText(entry.body ?? ''),
    }));
  return new Response(JSON.stringify(entries), {
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
}
