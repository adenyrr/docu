export const TAG_ALIASES: Record<string, string> = {
  network: 'réseau',
  conteneurs: 'docker',
  'docker-compose': 'docker',
  vm: 'virtualisation',
  logiciels: 'outils',
  scripts: 'shell',
  fichiers: 'linux',
  kernel: 'linux',
  systemd: 'linux',
  debian: 'linux',
  'base-de-données': 'sql',
  iot: 'domotique',
  hacs: 'home-assistant',
  intégrations: 'home-assistant',
  météo: 'home-assistant',
  médias: 'self-hosting',
  communautés: 'veille',
  youtube: 'veille',
  documentation: 'veille',
  ressources: 'veille',
  opensource: 'veille',
  ec2: 'aws',
  installation: '',
  infrastructure: 'homelab',
  'ci-cd': 'devops',
  ollama: 'llm',
};

export const TAG_FACETS = [
  {
    id: 'domaine',
    label: 'Domaine',
    hint: 'de quoi ça parle',
    tags: ['linux', 'réseau', 'virtualisation', 'docker', 'sécurité', 'domotique', 'cloud', 'sql'],
  },
  {
    id: 'techno',
    label: 'Techno',
    hint: 'l’outil concerné',
    tags: ['proxmox', 'lxc', 'traefik', 'ansible', 'opentofu', 'terraform', 'home-assistant', 'aws', 'gitlab', 'llm', 'jellyfin', 'qbittorrent', 'cisco', 'windows', 'mcp', 'git', 'yaml', 'cloud-init', 'regex', 'dns', 'vlan', 'pki', 'tls', 'reverse-proxy', 'load-balancer'],
  },
  {
    id: 'usage',
    label: 'Usage',
    hint: 'type de contenu',
    tags: ['commandes', 'shell', 'outils', 'adminsys', 'homelab', 'self-hosting', 'iac', 'devops', 'automatisation', 'veille'],
  },
] as const;

export const CANONICAL_TAGS = [...new Set(TAG_FACETS.flatMap((facet) => [...facet.tags]))];
export const ACCEPTED_TAGS = new Set([...CANONICAL_TAGS, ...Object.keys(TAG_ALIASES)]);

export function normalizeTag(tag: string): string | null {
  const key = tag.trim().toLowerCase();
  const canonical = Object.hasOwn(TAG_ALIASES, key) ? TAG_ALIASES[key] : key;
  return canonical || null;
}

export function normalizeTags(tags: string[]): string[] {
  return [...new Set(tags.map(normalizeTag).filter((tag): tag is string => Boolean(tag)))];
}

export function slugifyTag(tag: string): string {
  return tag.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '');
}

export function labelForSlug(slug: string): string {
  return CANONICAL_TAGS.find((tag) => slugifyTag(tag) === slug) ?? slug;
}
