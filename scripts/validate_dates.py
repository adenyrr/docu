#!/usr/bin/env python3
from __future__ import annotations

"""Validate that last_modified frontmatter dates are consistent with git history."""

import datetime as dt
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCS_DIR = ROOT / "docs"

FRONT_MATTER_RE = re.compile(r"^---\n(.*?)\n---", re.S)
LAST_MODIFIED_RE = re.compile(r'^last_modified:\s*["\']?(.+?)["\']?\s*$', re.M)

WARN_THRESHOLD_DAYS = 7
ERROR_THRESHOLD_DAYS = 30


def git_last_modified(path: Path) -> tuple[str | None, str | None]:
    """Returns (iso_date, short_date) or (None, None)."""
    cmd = ["git", "log", "-1", "--date=iso-strict", "--format=%H|%ad", "--", str(path)]
    result = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True, check=False)
    line = result.stdout.strip()
    if result.returncode != 0 or not line or "|" not in line:
        return None, None
    commit_hash, iso_date = line.split("|", 1)
    return commit_hash.strip(), iso_date.strip()


def parse_date(date_str: str) -> dt.date | None:
    """Try to parse a date string into a date object."""
    date_str = date_str.strip().strip('"').strip("'")
    for fmt in ("%Y-%m-%d", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%dT%H:%M:%S%z",
                "%d/%m/%Y", "%d/%m/%Y %H:%M"):
        try:
            dt_obj = dt.datetime.strptime(date_str, fmt)
            return dt_obj.date()
        except ValueError:
            continue
    return None


def main() -> int:
    errors = 0
    warnings = 0

    for md_file in sorted(DOCS_DIR.rglob("*.md")):
        rel = md_file.relative_to(DOCS_DIR).as_posix()
        if "venv" in rel or md_file.parent.name == "tags" or rel.startswith("."):
            continue

        try:
            text = md_file.read_text(encoding="utf-8")
        except Exception:
            continue

        m = FRONT_MATTER_RE.search(text)
        if not m:
            continue

        frontmatter = m.group(1)
        lm_match = LAST_MODIFIED_RE.search(frontmatter)
        if not lm_match:
            continue

        frontmatter_date_str = lm_match.group(1).strip()
        frontmatter_date = parse_date(frontmatter_date_str)

        if frontmatter_date is None:
            print(f"⚠ [{rel}] Could not parse last_modified: '{frontmatter_date_str}'")
            warnings += 1
            continue

        _, git_iso = git_last_modified(md_file)
        if git_iso is None:
            print(f"ℹ [{rel}] No git history for this file, skipping validation")
            continue

        git_date = parse_date(git_iso)
        if git_date is None:
            continue

        diff = abs((frontmatter_date - git_date).days)

        if diff > ERROR_THRESHOLD_DAYS:
            print(f"✗ [{rel}] frontmatter={frontmatter_date} git={git_date} (Δ={diff}d > {ERROR_THRESHOLD_DAYS}d)")
            errors += 1
        elif diff > WARN_THRESHOLD_DAYS:
            print(f"⚠ [{rel}] frontmatter={frontmatter_date} git={git_date} (Δ={diff}d > {WARN_THRESHOLD_DAYS}d)")
            warnings += 1
        else:
            print(f"✓ [{rel}] frontmatter={frontmatter_date} git={git_date} (Δ={diff}d)")

    summary = f"\n{'='*60}\nValidated: {errors} errors, {warnings} warnings\n{'='*60}"
    print(summary)

    return 1 if errors > 0 else 0


if __name__ == "__main__":
    sys.exit(main())