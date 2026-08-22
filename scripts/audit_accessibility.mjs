import AxeBuilder from '@axe-core/playwright';
import { chromium } from 'playwright';

const baseUrl = (process.argv[2] || 'http://127.0.0.1:4321').replace(/\/$/, '');
const routes = ['/', '/reseau/dns', '/cheats/linux_user', '/tags'];
const themes = ['light', 'dark'];
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

let failures = 0;
try {
  for (const route of routes) {
    for (const theme of themes) {
      const context = await browser.newContext({ colorScheme: theme });
      await context.addInitScript((selectedTheme) => localStorage.setItem('theme', selectedTheme), theme);
      const page = await context.newPage();
      await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle', timeout: 90_000 });
      const { violations } = await new AxeBuilder({ page }).analyze();
      for (const violation of violations) {
        failures += 1;
        console.error(`[${route} · ${theme}] ${violation.id}: ${violation.help}`);
        for (const node of violation.nodes) console.error(`  - ${JSON.stringify(node.target)}`);
      }
      await context.close();
    }
  }
} finally {
  await browser.close();
}

console.log(`Audit axe : ${failures} type(s) de violation sur ${routes.length * themes.length} scénarios.`);
if (failures) process.exitCode = 1;
