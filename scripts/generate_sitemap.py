#!/usr/bin/env python3
from __future__ import annotations

"""Generate sitemap.xml from Zensical navigation config and git revision dates."""

import datetime as dt
import subprocess
import tomllib
from pathlib import Path
from xml.sax.saxutils import escape


ROOT = Path(__file__).resolve().parents[1]
DOCS_DIR = ROOT / "docs"
CONFIG = ROOT / "zensical.toml"
OUTPUT = ROOT / "sitemap.xml"

SITE_URL = "https://docu.adenyrr.me"

PRIORITY_MAP: dict[str, float] = {
    "index": 1.0,
    "infra": 0.8,
    "calamares": 0.7,
    # reseau
    "reseau/": 0.8,
    # virtu
    "virtu/": 0.8,
    # services
    "services/gitlab/": 0.7,
    "services/llm/": 0.7,
    "services/medias/": 0.7,
    # hassio
    "hassio/": 0.7,
    # outils
    "outils/": 0.6,
    # cheats
    "cheats/": 0.6,
    # non-oss
    "non-oss/": 0.5,
}

CHANGEFREQ_DEFAULT = "monthly"


def git_last_modified(md_path: Path) -> str | None:
    cmd = ["git", "log", "-1", "--date=iso-strict", "--format=%ad", "--", str(md_path)]
    result = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True, check=False)
    line = result.stdout.strip()
    if result.returncode != 0 or not line:
        return None
    return line


def markdown_to_url_path(md_path: Path) -> str:
    rel = md_path.relative_to(DOCS_DIR).as_posix()
    if rel == "index.md":
        return "/"
    return "/" + rel[:-3] + "/"


def priority_for(url_path: str) -> float:
    for prefix, prio in PRIORITY_MAP.items():
        if f"/{prefix}" in url_path or url_path.startswith(prefix):
            return prio
    return 0.5


def collect_all_md_files() -> list[Path]:
    """Collect all .md files under docs/ that are in the nav (or index)."""
    files = []
    for md_file in sorted(DOCS_DIR.rglob("*.md")):
        # Skip generated tags and hidden
        if "venv" in str(md_file):
            continue
        if md_file.parent.name == "tags":
            continue
        files.append(md_file)
    return files


def build_sitemap() -> str:
    now = dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]

    md_files = collect_all_md_files()

    for md_path in md_files:
        url_path = markdown_to_url_path(md_path)
        lastmod = git_last_modified(md_path) or now
        priority = priority_for(url_path)
        changefreq = "weekly" if url_path == "/" else CHANGEFREQ_DEFAULT
        loc = f"{SITE_URL}{escape(url_path)}"

        lines.extend([
            "  <url>",
            f"    <loc>{loc}</loc>",
            f"    <lastmod>{escape(lastmod)}</lastmod>",
            f"    <changefreq>{changefreq}</changefreq>",
            f"    <priority>{priority:.1f}</priority>",
            "  </url>",
        ])

    lines.append("</urlset>")
    return "\n".join(lines) + "\n"


def main() -> None:
    content = build_sitemap()
    OUTPUT.write_text(content, encoding="utf-8")
    print(f"Wrote sitemap to {OUTPUT} ({len(content)} bytes)")


if __name__ == "__main__":
    main()
