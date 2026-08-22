import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('les 92 sorties éditoriales et tags sont accessibles', async ({ page, request }) => {
  const response = await request.get('/search-index.json');
  expect(response.ok()).toBeTruthy();
  const documents = await response.json() as Array<{ url: string; tags: string }>;
  const tagSlugs = new Set(documents.flatMap((document) => document.tags.split(/\s+/).filter(Boolean)));
  expect(documents).toHaveLength(49);
  expect(documents.some((document) => document.url === '/infra')).toBeFalsy();
  expect(tagSlugs.size).toBe(42);

  const routes = ['/tags', ...documents.map((document) => document.url), ...[...tagSlugs].map((tag) => `/tags/${tag}`)];
  expect(routes).toHaveLength(92);
  for (const route of routes) {
    const result = await request.get(route);
    expect(result.status(), route).toBe(200);
  }

  await page.goto('/reseau/dns');
  await expect(page).toHaveTitle(/DNS/);

  await page.goto('/');
  await expect(page.locator('.doc-sidebar a[href="https://adenyrr.me/infra"]')).toContainText('infra.sh');

  const legacyInfra = await request.get('/infra', { maxRedirects: 0 });
  expect(legacyInfra.status()).toBe(308);
  expect(legacyInfra.headers().location).toBe('https://adenyrr.me/infra');

  for (const legacyPath of ['/reseau/dns.html', '/reseau/dns/']) {
    const legacyPage = await request.get(legacyPath, { maxRedirects: 0 });
    expect(legacyPage.status(), legacyPath).toBe(308);
    expect(legacyPage.headers().location, legacyPath).toBe('http://127.0.0.1:4322/reseau/dns');
  }
});

test('recherche, partage de requête et surlignage', async ({ page }) => {
  await page.goto('/');
  await page.locator('.doc-search-trigger').click();
  await page.locator('#doc-search-input').fill('DNS');
  await expect(page.locator('[data-search-status]')).toContainText('résultat');
  await expect(page).toHaveURL(/q=DNS/);
  await page.locator('[data-search-results] a').first().click();
  await expect(page.locator('mark[data-search-highlight]').first()).toBeVisible();
});

test('tags AND/OR, compteurs projetés et état URL', async ({ page }) => {
  await page.goto('/tags?mode=or');
  await page.locator('[data-tag="docker"]').click();
  await expect(page).toHaveURL(/tags=docker/);
  await expect(page.locator('[data-tag="docker"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-tag-status]')).toContainText('page');
  await page.locator('[data-tags-reset]').click();
  await expect(page.locator('input[value="and"]')).toBeChecked();
  await expect(page).not.toHaveURL(/tags=/);
});

test('cheats, onglets, disclosures, Mermaid, lightbox et blocs de code', async ({ page }) => {
  await page.goto('/cheats/linux_user');
  await page.locator('#cheat-search').fill('rm -ri');
  await expect(page.locator('.cheat-card:visible')).toHaveCount(1);

  await page.goto('/reseau/dns');
  await expect(page.locator('[role="tab"]')).toHaveCount(2);
  await expect(page.locator('.doc-content details')).toHaveCount(1);
  await expect(page.locator('.expressive-code').first()).toBeVisible();
  await expect(page.locator('.code-copy-button').first()).toBeVisible();
  const selectableBlock = page.locator('.expressive-code:has(.ec-line:nth-child(3))').first();
  const selectableLines = selectableBlock.locator('.ec-line');
  await selectableLines.nth(0).click();
  await selectableLines.nth(2).click({ modifiers: ['Shift'] });
  await expect(selectableBlock.locator('.ec-line.is-selected')).toHaveCount(3);
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await selectableBlock.locator('.code-copy-button').click();
  await expect(selectableBlock.locator('.code-terminal-status')).toContainText('COPIED');
  const copiedLines = await page.evaluate(() => navigator.clipboard.readText());
  expect(copiedLines.split('\n')).toHaveLength(3);
  await selectableLines.nth(0).focus();
  await page.keyboard.press('Escape');
  await page.keyboard.press('Shift+ArrowDown');
  await expect(selectableBlock.locator('.ec-line.is-selected')).toHaveCount(2);
  await page.locator('.doc-content img').first().click();
  await expect(page.locator('[data-lightbox]')).toHaveJSProperty('open', true);
  await page.locator('[data-lightbox] button').click();
  await expect(page.locator('[data-lightbox]')).toHaveJSProperty('open', false);

  await page.goto('/non-oss/aws/guacamole');
  await expect(page.locator('.mermaid-figure.is-rendered')).toHaveCount(1, { timeout: 15_000 });
});

test('thèmes, mode lecture, clavier et mobile restent accessibles', async ({ page }) => {
  await page.goto('/');
  await page.locator('#theme-toggle').click();
  await page.locator('#reading-mode-toggle').click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('html')).toHaveAttribute('data-reading-mode', 'comfortable');

  await page.keyboard.press('/');
  await expect(page.locator('[data-search-dialog]')).toHaveJSProperty('open', true);
  await page.keyboard.press('Escape');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('[data-doc-nav-toggle]').click();
  await expect(page.locator('.doc-sidebar')).toHaveClass(/is-open/);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBeFalsy();
});

test('home, chrome et navigation partagent le même axe', async ({ page }) => {
  await page.setViewportSize({ width: 1642, height: 995 });
  await page.goto('/');
  const home = await page.evaluate(() => {
    const metrics = (selector: string) => {
      const rect = document.querySelector(selector)!.getBoundingClientRect();
      return { width: Math.round(rect.width), center: Math.round(rect.left + rect.width / 2) };
    };
    const sidebar = document.querySelector<HTMLElement>('.doc-sidebar')!;
    const style = getComputedStyle(sidebar);
    return {
      header: metrics('.header-shell'),
      panel: metrics('.doc-panel--home'),
      footer: metrics('.footer-shell'),
      heroCopy: metrics('.docs-home-hero__copy'),
      systemCard: metrics('.docs-system-card'),
      missionCard: metrics('.docs-home-card:nth-child(1)'),
      openSourceCard: metrics('.docs-home-card:nth-child(2)'),
      sidebarScrollable: sidebar.scrollHeight > sidebar.clientHeight,
      scrollbarWidth: style.scrollbarWidth,
      scrollbarColor: style.scrollbarColor,
    };
  });
  expect(home.panel.center).toBe(home.header.center);
  expect(home.panel.center).toBe(home.footer.center);
  expect(home.missionCard).toEqual(home.heroCopy);
  expect(home.openSourceCard).toEqual(home.systemCard);
  expect(home.sidebarScrollable).toBeTruthy();
  expect(home.scrollbarWidth).toBe('thin');
  expect(home.scrollbarColor).not.toBe('auto');

  await page.goto('/reseau/dns');
  const documentationWidth = await page.locator('.doc-panel').evaluate((element) => Math.round(element.getBoundingClientRect().width));
  expect(home.panel.width).toBe(documentationWidth);
});

for (const theme of ['light', 'dark'] as const) {
  test(`axe sans violation sur les types de page en thème ${theme}`, async ({ browser }) => {
    test.setTimeout(60_000);
    const context = await browser.newContext({ colorScheme: theme });
    await context.addInitScript((value) => localStorage.setItem('theme', value), theme);
    const page = await context.newPage();
    for (const route of ['/', '/reseau/dns', '/cheats/linux_user', '/tags']) {
      await page.goto(route);
      const { violations } = await new AxeBuilder({ page }).analyze();
      expect(violations, `${route} · ${theme}`).toEqual([]);
    }
    await context.close();
  });
}
