#!/usr/bin/env python3
"""Generate docs/tags.md and per-tag pages from markdown frontmatter tags.

Features:
- Collect tags and associated pages
- Extract a short excerpt from each page
- Group tags into categories (heuristic)
- Generate `docs/tags.md` with TOC, counts, collapsible sections and links
- Generate `docs/tags/<slug>.md` per tag with full list
"""
import os
import re
import sys
import datetime
from collections import defaultdict, Counter

ROOT = os.path.dirname(os.path.dirname(__file__))
DOCS_DIR = os.path.join(ROOT, "docs")
TAGS_DIR = os.path.join(DOCS_DIR, "tags")

FRONT_MATTER_RE = re.compile(r"^---\n(.*?)\n---\n", re.S)


def slugify(s: str) -> str:
    s = s.lower().strip()
    s = re.sub(r"[^a-z0-9\- ]+", "", s)
    s = s.replace(" ", "-")
    return s


def parse_frontmatter(path):
    try:
        with open(path, "r", encoding="utf-8") as f:
            text = f.read()
    except Exception:
        return {}
    m = FRONT_MATTER_RE.search(text)
    meta = {}
    body_start = 0
    if m:
        body = m.group(1)
        body_start = m.end()
        # parse simple YAML-like lists for tags
        tags = []
        in_tags = False
        for line in body.splitlines():
            if line.strip().startswith("tags:"):
                in_tags = True
                # handle inline: tags: [a, b]
                inline = line.split(":", 1)[1].strip()
                if inline.startswith("[") and inline.endswith("]"):
                    items = [x.strip().strip('"\'') for x in inline[1:-1].split(",") if x.strip()]
                    tags.extend(items)
                    in_tags = False
                    continue
                continue
            if in_tags:
                s = line.strip()
                if s.startswith("-"):
                    tags.append(s[1:].strip().strip('"\''))
                else:
                    # end of list
                    in_tags = False
        meta["tags"] = tags
    else:
        # no frontmatter
        body_start = 0
    # extract title if present
    title = None
    # try to find title in frontmatter
    if m:
        for line in m.group(1).splitlines():
            if line.strip().startswith("title:"):
                title = line.split(":", 1)[1].strip().strip('"')
                break
    # if no title, fallback to first markdown H1 after frontmatter
    excerpt = ""
    try:
        with open(path, "r", encoding="utf-8") as f:
            text = f.read()
            rest = text[body_start:]
            # find first heading
            if not title:
                m2 = re.search(r"^#\s+(.*)$", rest, re.M)
                if m2:
                    title = m2.group(1).strip()
            # extract first paragraph
            for line in rest.splitlines():
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                excerpt = line
                break
    except Exception:
        pass
    meta.setdefault("title", title)
    meta.setdefault("excerpt", excerpt)
    return meta


def categorize_tag(tag: str) -> str:
    t = tag.lower()
    if any(k in t for k in ("dns", "vlan", "traefik", "proxy", "swag", "reverse", "network", "réseau", "load-balancer", "load_balancer", "aws")):
        return "Réseau"
    if any(k in t for k in ("linux", "debian", "kernel", "shell", "systemd", "proxmox", "virtualisation", "virtualization", "vminstall", "pve")):
        return "Infrastructure"
    if any(k in t for k in ("sec", "sécurité", "tls", "pki", "security", "hardening")):
        return "Sécurité"
    if any(k in t for k in ("ansible", "iac", "terraform", "opentofu", "cloud-init", "cloud", "aws", "devops")):
        return "IaC / DevOps"
    if any(k in t for k in ("docker", "compose", "container", "lxc", "docker-compose", "containers", "k8s")):
        return "Conteneurs / Docker"
    if any(k in t for k in ("home-assistant", "hacs", "domotique", "iot")):
        return "Domotique"
    if any(k in t for k in ("sql", "database", "base-de-données", "db")):
        return "Bases de données"
    return "Autres"


def collect():
    tag_map = defaultdict(list)
    items = []
    for dirpath, dirs, files in os.walk(DOCS_DIR):
        # skip generated tags dir
        if os.path.abspath(dirpath) == os.path.abspath(TAGS_DIR):
            continue
        for fn in files:
            if not fn.endswith(".md"):
                continue
            path = os.path.join(dirpath, fn)
            rel = os.path.relpath(path, DOCS_DIR).replace(os.sep, "/")
            meta = parse_frontmatter(path)
            tags = meta.get("tags", [])
            title = meta.get("title") or os.path.splitext(fn)[0]
            excerpt = meta.get("excerpt", "")
            for t in tags:
                tag_map[t].append({"title": title, "path": rel, "excerpt": excerpt})
    return tag_map


def ensure_tags_dir():
    os.makedirs(TAGS_DIR, exist_ok=True)


def render_per_tag(tag, entries):
    slug = slugify(tag)
    lines = [
        "---",
        f"title: \"Tag: {tag}\"",
        f"description: \"Pages marquées \"{tag}\"\"",
        f"last_modified: {datetime.datetime.utcnow().isoformat()}Z",
        "---",
        "",
        f"# {tag}",
        "",
        f"Nombre de pages : {len(entries)}",
        "",
    ]
    for e in sorted(entries, key=lambda x: x["title"].lower()):
        lines.append(f"- [{e['title']}]({e['path']}) — {e['excerpt']}")
    content = "\n".join(lines) + "\n"
    out = os.path.join(TAGS_DIR, f"{slug}.md")
    with open(out, "w", encoding="utf-8") as f:
        f.write(content)


def render_main(tag_map):
    now = datetime.datetime.utcnow().isoformat() + "Z"
    lines = [
        "---",
        'title: "Tags"',
        'description: "Index des tags généré automatiquement"',
        f"last_modified: {now}",
        "---",
        "",
        "# Tags",
        "",
        "Cette page est générée automatiquement.",
        "",
        "## Sommaire",
        "",
    ]
    # prepare counts and categories
    counts = {t: len(v) for t, v in tag_map.items()}
    categories = defaultdict(list)
    for t in tag_map:
        categories[categorize_tag(t)].append(t)
    # build TOC grouped by category
    for cat in sorted(categories.keys()):
        lines.append(f"### {cat}")
        for t in sorted(categories[cat], key=lambda s: (-counts[s], s.lower())):
            slug = slugify(t)
            lines.append(f"- [{t}](#{slug}) ({counts[t]}) — [page tag](/tags/{slug}.html)")
        lines.append("")
    # sections per tag (collapsible)
    for cat in sorted(categories.keys()):
        lines.append(f"\n### {cat}\n")
        for t in sorted(categories[cat], key=lambda s: (-counts[s], s.lower())):
            slug = slugify(t)
            entries = tag_map[t]
            lines.append(f"<details id=\"{slug}\">\n<summary>{t} ({len(entries)})</summary>\n\n")
            for e in sorted(entries, key=lambda x: x["title"].lower()):
                excerpt = e["excerpt"] or ""
                if len(excerpt) > 140:
                    excerpt = excerpt[:137] + "..."
                lines.append(f"- [{e['title']}]({e['path']}) — {excerpt}")
            lines.append("\n[/details]\n")
    content = "\n".join(lines) + "\n"
    out = os.path.join(DOCS_DIR, "tags.md")
    with open(out, "w", encoding="utf-8") as f:
        f.write(content)


def main():
    tag_map = collect()
    if not tag_map:
        print("No tags found.")
        return 0
    ensure_tags_dir()
    for t, entries in tag_map.items():
        render_per_tag(t, entries)
    render_main(tag_map)
    print("Wrote tags index and per-tag pages")
    return 0


if __name__ == "__main__":
    sys.exit(main())
