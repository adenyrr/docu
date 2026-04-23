#!/usr/bin/env python3
"""Generate a per-page git revision date index for frontend display."""

from __future__ import annotations

import datetime as dt
import json
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DOCS_DIR = ROOT / "docs"
OUTPUT_FILE = DOCS_DIR / "assets" / "revision-dates.json"


def git_last_change(path: Path) -> tuple[str, str] | None:
    cmd = ["git", "log", "-1", "--date=iso-strict", "--format=%H|%ad", "--", str(path)]
    result = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True, check=False)
    line = result.stdout.strip()
    if result.returncode != 0 or not line or "|" not in line:
        return None
    commit_hash, iso_date = line.split("|", 1)
    return commit_hash.strip(), iso_date.strip()


def iso_to_display(iso_date: str) -> str:
    parsed = dt.datetime.fromisoformat(iso_date.replace("Z", "+00:00"))
    return parsed.strftime("%d/%m/%Y %H:%M")


def markdown_to_html_path(md_path: Path) -> str:
    rel = md_path.relative_to(DOCS_DIR).as_posix()
    return "/" + rel[:-3] + ".html"


def aliases_for(pathname: str) -> list[str]:
    aliases = [pathname]
    if pathname == "/index.html":
        aliases.append("/")
    if pathname.endswith("/index.html"):
        aliases.append(pathname[: -len("index.html")])
    return aliases


def build_index() -> dict:
    pages: dict[str, dict[str, str]] = {}

    for md_file in sorted(DOCS_DIR.rglob("*.md")):
        git_data = git_last_change(md_file)

        if git_data is None:
            mtime = dt.datetime.fromtimestamp(md_file.stat().st_mtime).astimezone()
            commit_hash = ""
            iso_date = mtime.isoformat()
        else:
            commit_hash, iso_date = git_data

        try:
            display_date = iso_to_display(iso_date)
        except ValueError:
            display_date = iso_date

        item = {
            "iso": iso_date,
            "display": display_date,
            "commit": commit_hash,
        }

        html_path = markdown_to_html_path(md_file)
        for alias in aliases_for(html_path):
            pages[alias] = item

    return {
        "generated_at": dt.datetime.now(dt.timezone.utc).isoformat(),
        "pages": pages,
    }


def main() -> None:
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    payload = build_index()
    OUTPUT_FILE.write_text(json.dumps(payload, ensure_ascii=False, sort_keys=True, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote revision index to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
