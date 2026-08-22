import type { SiteChromeConfig } from '@adenyrr/astro-ui';

export interface DocNavItem {
  label: string;
  slug: string;
}

export interface DocExternalNavItem {
  label: string;
  url: string;
  external: true;
}

export interface DocNavGroup {
  label: string;
  items: Array<DocNavItem | DocExternalNavItem | DocNavGroup>;
}

export const siteChrome: SiteChromeConfig = {
  features: { blog: true, infra: true, docu: true, train: true },
  appearance: { ambientBackground: true },
  header: {
    show: true,
    brandName: 'adenyrr',
    brandHost: '@docu',
    homeUrl: 'https://adenyrr.me',
    navigation: [
      { label: 'home', url: 'https://adenyrr.me/', enabled: true },
      { label: 'blog', url: 'https://adenyrr.me/blog', enabled: true },
      { label: 'infra', url: 'https://adenyrr.me/infra', enabled: true },
      { label: 'docu', url: 'https://docu.adenyrr.me', external: true, active: true, enabled: true },
      { label: 'train', url: 'https://train.adenyrr.me', external: true, enabled: true },
    ],
    socialLinks: [
      { label: 'GitHub', icon: 'Github', url: 'https://github.com/adenyrr', enabled: true },
      { label: 'GitLab', icon: 'Gitlab', url: 'https://gitlab.com/adenyrr', enabled: true },
      { label: 'LinkedIn', icon: 'Linkedin', url: 'https://be.linkedin.com/in/mvanhede', enabled: true },
      { label: 'Discord', icon: 'MessageCircle', url: 'https://discord.gg/NWVukm7zE2', enabled: true },
      { label: 'Email', icon: 'Mail', url: 'mailto:adenyrr@proton.me', enabled: true },
    ],
  },
  footer: {
    show: true,
    copyright: 'Copyleft CC - BY-NC',
    author: 'adenyrr',
    authorUrl: 'https://adenyrr.me',
    signatureCommand: 'echo "thanks for reading"',
    note: 'infrastructure · cloud · open source\nConstruit sobrement, documenté avec intention.',
    navigationLabel: '~/sitemap',
    connectLabel: '~/connect',
    backToTopLabel: 'Haut de page',
    shellPrompt: 'adenyrr@docu',
    branch: 'main',
    poweredBy: [
      { label: 'Astro', url: 'https://astro.build/' },
      { label: 'GitLab', url: 'https://gitlab.com/adenyrr' },
    ],
    rss: 'https://adenyrr.me/rss.xml',
  },
};

const item = (label: string, slug: string): DocNavItem => ({ label, slug });
const externalItem = (label: string, url: string): DocExternalNavItem => ({ label, url, external: true });
const group = (label: string, items: Array<DocNavItem | DocExternalNavItem | DocNavGroup>): DocNavGroup => ({ label, items });

export const docsNavigation: DocNavGroup[] = [
  group('~/home', [item('home.sh', 'index'), externalItem('infra.sh ↗', 'https://adenyrr.me/infra'), item('calamares.sh', 'calamares'), item('tags.sh', 'tags')]),
  group('~/network', [item('intro.sh', 'reseau/intro'), item('segmentation.sh', 'reseau/vlan'), item('dns.sh', 'reseau/dns'), item('pki.sh', 'reseau/stepca'), item('traefik.sh', 'reseau/traefik'), item('swag-proxy.sh', 'reseau/swag')]),
  group('~/virtu', [item('intro.sh', 'virtu/intro'), item('proxmox.sh', 'virtu/pve'), item('vm_install.sh', 'virtu/vminstall'), item('lxc_install.sh', 'virtu/lxcinstall'), item('cloud_init.sh', 'virtu/cloudinit'), item('server_config.sh', 'virtu/serverconfig')]),
  group('~/apps', [
    group('/gitlab', [item('install.sh', 'services/gitlab/install'), item('runner.sh', 'services/gitlab/runner')]),
    group('/llm', [item('openwebui.sh', 'services/llm/openwebui'), item('mcpo.sh', 'services/llm/mcpo')]),
    group('/media', [item('jellyfin.sh', 'services/medias/jellyfin'), item('qbittorrent.sh', 'services/medias/qbit')]),
  ]),
  group('~/assist', [item('installation.sh', 'hassio/install'), item('hacs.sh', 'hassio/hacs'), item('integrations.sh', 'hassio/integrations'), item('meteo.sh', 'hassio/meteo')]),
  group('~/tools', [item('compose_template.sh', 'outils/template'), item('bash.sh', 'outils/commandes'), item('applauncher.sh', 'outils/softwares'), item('external.sh', 'outils/links'), item('ressources.sh', 'outils/ressources'), item('youtube.sh', 'outils/youtube')]),
  group('~/cheats', [item('linux_user.sh', 'cheats/linux_user'), item('linux_admin_base.sh', 'cheats/linux_base'), item('linux_files.sh', 'cheats/linux_files'), item('linux_kernel.sh', 'cheats/linux_kernel'), item('regex-cheats.sh', 'cheats/regex'), item('ansible.sh', 'cheats/ansible'), item('opentofu.sh', 'cheats/opentofu'), item('sql_cheats.sh', 'cheats/sql'), item('cisco_cheats.sh', 'cheats/cisco')]),
  group('~/non-free', [
    group('/aws', [item('spin_instance.sh', 'non-oss/aws/spin_instance'), item('endpoint.sh', 'non-oss/aws/endpoint'), item('bastion.sh', 'non-oss/aws/bastion'), item('guacamole.sh', 'non-oss/aws/guacamole'), item('vpc.sh', 'non-oss/aws/vpc'), item('s3_bucket.sh', 'non-oss/aws/s3_bucket'), item('load_balancer.sh', 'non-oss/aws/load_balancer')]),
    group('/cloudflare', [item('pages.sh', 'non-oss/cloudflare/cf_pages'), item('dns.sh', 'non-oss/cloudflare/dns')]),
    group('/win_server', [item('sysprep.sh', 'non-oss/win_server/sysprep')]),
  ]),
];

export function routeForSlug(slug: string): string {
  return slug === 'index' ? '/' : `/${slug}`;
}

export function flattenNavigation(groups = docsNavigation): DocNavItem[] {
  return groups.flatMap((entry) => entry.items.flatMap((child) => {
    if ('slug' in child) return [child];
    if ('url' in child) return [];
    return flattenNavigation([child]);
  }));
}

export function navigationTrail(slug: string): string[] {
  function visit(groups: DocNavGroup[], trail: string[]): string[] | null {
    for (const entry of groups) {
      const nextTrail = [...trail, entry.label];
      for (const child of entry.items) {
        if ('slug' in child && child.slug === slug) return [...nextTrail, child.label];
        if (!('slug' in child) && !('url' in child)) {
          const found = visit([child], nextTrail);
          if (found) return found;
        }
      }
    }
    return null;
  }
  return visit(docsNavigation, []) ?? [];
}
