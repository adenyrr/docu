import AxeBuilder from "@axe-core/playwright";
import { chromium } from "playwright";

const targetUrl = process.argv[2];
const maxViolations = Number.parseInt(process.env.AXE_MAX_VIOLATIONS ?? "0", 10);

if (!targetUrl) {
  console.error("Usage: npm run audit:a11y -- <url>");
  process.exit(2);
}

if (!Number.isInteger(maxViolations) || maxViolations < 0) {
  console.error("AXE_MAX_VIOLATIONS must be a non-negative integer");
  process.exit(2);
}

const executablePath = process.env.CHROMIUM_PATH || undefined;
const browser = await chromium.launch({
  executablePath,
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

try {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 90_000 });
  await page.waitForTimeout(1_000);

  const { violations } = await new AxeBuilder({ page }).analyze();

  for (const violation of violations) {
    const impact = violation.impact ?? "unknown";
    console.log(
      `[${impact}] ${violation.id}: ${violation.help} (${violation.nodes.length} nodes)`,
    );
    for (const node of violation.nodes) {
      console.log(`  - ${JSON.stringify(node.target)}`);
    }
  }

  console.log(
    `Accessibility audit: ${violations.length} violation types (maximum allowed: ${maxViolations})`,
  );

  if (violations.length > maxViolations) {
    process.exitCode = 1;
  }
} finally {
  await browser.close();
}
