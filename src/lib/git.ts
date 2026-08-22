import { spawnSync } from 'node:child_process';

export interface GitDates {
  created: string;
  updated: string;
}

function datesForPath(relativePath: string): string[] {
  const result = spawnSync('git', ['log', '--follow', '--format=%aI', '--', relativePath], {
    cwd: process.cwd(), encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
  });
  return result.status === 0 ? result.stdout.trim().split('\n').filter(Boolean) : [];
}

export function getGitDates(id: string, fallback: Date): GitDates {
  const current = `src/content/docs/${id}.mdx`;
  const legacy = `docs/${id}.md`;
  const dates = datesForPath(current);
  const legacyDates = datesForPath(legacy);
  const combined = [...new Set([...dates, ...legacyDates])];
  const fallbackIso = fallback.toISOString();
  return {
    updated: combined[0] || fallbackIso,
    created: combined.at(-1) || fallbackIso,
  };
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(value));
}
