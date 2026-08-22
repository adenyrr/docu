#!/usr/bin/env python3
"""Génère l'index de tags : données JSON + page explorateur + pages par tag.

Remplace `generate_tags_index.py`.

Sorties :
  docs/assets/tags.json   données consommées par tags-explorer.js
  docs/tags.md            page hôte de l'explorateur (+ fallback <noscript>)
  docs/tags/<slug>.md     une page par tag, liens corrigés, indexable

Le vocabulaire est piloté par les tables ALIASES / FACETS ci-dessous.
Tout tag inconnu est signalé en sortie mais reste publié (facette "Divers").
Lancer avec --strict en CI pour échouer sur un tag hors vocabulaire.
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import re
import sys
import unicodedata
from collections import Counter, defaultdict

try:
    import tomllib
except ModuleNotFoundError:  # Python < 3.11
    import tomli as tomllib  # type: ignore

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS_DIR = os.path.join(ROOT, "docs")
TAGS_DIR = os.path.join(DOCS_DIR, "tags")
ASSETS_DIR = os.path.join(DOCS_DIR, "assets")
CONFIG = os.path.join(ROOT, "zensical.toml")

FRONT_MATTER_RE = re.compile(r"^---\n(.*?)\n---\n", re.S)
MD_LINK_RE = re.compile(r"\[([^\]]+)\]\([^)]+\)")

# ─────────────────────────────────────────────────────────────────────────────
# 1. Normalisation du vocabulaire
#    alias (tel qu'écrit dans le frontmatter) -> tag canonique
#    C'est ici qu'on écrase les doublons. À ajuster librement.
# ─────────────────────────────────────────────────────────────────────────────
ALIASES: dict[str, str] = {
    "network": "réseau",
    "conteneurs": "docker",
    "docker-compose": "docker",
    "vm": "virtualisation",
    "logiciels": "outils",
    "scripts": "shell",
    "fichiers": "linux",
    "kernel": "linux",
    "systemd": "linux",
    "debian": "linux",
    "base-de-données": "sql",
    "iot": "domotique",
    "hacs": "home-assistant",
    "intégrations": "home-assistant",
    "météo": "home-assistant",
    "médias": "self-hosting",
    "communautés": "veille",
    "youtube": "veille",
    "documentation": "veille",
    "ressources": "veille",
    "opensource": "veille",
    "ec2": "aws",
    "installation": "",   # chaîne vide = tag supprimé (trop générique)
    "infrastructure": "homelab",
    "ci-cd": "devops",
    "ollama": "llm",
}

# ─────────────────────────────────────────────────────────────────────────────
# 2. Facettes : trois axes plutôt qu'une liste plate.
#    L'ordre des tags dans chaque liste = ordre d'affichage.
# ─────────────────────────────────────────────────────────────────────────────
FACETS: list[dict] = [
    {
        "id": "domaine",
        "label": "Domaine",
        "hint": "de quoi ça parle",
        "icon": "layers",
        "tags": [
            "linux", "réseau", "virtualisation", "docker",
            "sécurité", "domotique", "cloud", "sql",
        ],
    },
    {
        "id": "techno",
        "label": "Techno",
        "hint": "l'outil concerné",
        "icon": "wrench",
        "tags": [
            "proxmox", "lxc", "traefik", "ansible", "opentofu", "terraform",
            "home-assistant", "aws", "gitlab", "llm", "jellyfin", "qbittorrent",
            "cisco", "windows", "mcp", "git", "yaml", "cloud-init", "regex",
            "dns", "vlan", "pki", "tls", "reverse-proxy", "load-balancer",
        ],
    },
    {
        "id": "usage",
        "label": "Usage",
        "hint": "type de contenu",
        "icon": "bookmark",
        "tags": [
            "commandes", "shell", "outils", "adminsys", "homelab",
            "self-hosting", "iac", "devops", "automatisation", "veille",
        ],
    },
]

ICONS: dict[str, str] = {
    "linux": "server", "réseau": "network", "sécurité": "shield",
    "docker": "package", "iac": "atom", "homelab": "house",
    "domotique": "plug", "sql": "database", "cloud": "cloud",
    "virtualisation": "layers", "veille": "bookmark", "commandes": "terminal",
}

# ─────────────────────────────────────────────────────────────────────────────


def slugify(s: str) -> str:
    s = unicodedata.normalize("NFKD", s.strip().lower())
    s = s.encode("ascii", "ignore").decode("ascii")
    s = re.sub(r"[^a-z0-9\- ]+", "", s)
    return re.sub(r"\s+", "-", s)


def load_sections() -> list[tuple[str, str]]:
    """Extrait un mapping préfixe de chemin -> nom de section depuis la nav."""
    try:
        with open(CONFIG, "rb") as f:
            cfg = tomllib.load(f)
    except Exception:
        return []
    pairs: list[tuple[str, str]] = []

    def walk(node, section):
        if isinstance(node, list):
            for item in node:
                walk(item, section)
        elif isinstance(node, dict):
            for key, value in node.items():
                if isinstance(value, str) and value.endswith(".md"):
                    pairs.append((value, section))
                else:
                    walk(value, key if section is None else section)

    walk(cfg.get("project", {}).get("nav", []), None)
    return pairs


def parse_page(path: str) -> dict:
    try:
        text = open(path, encoding="utf-8").read()
    except OSError:
        return {}
    m = FRONT_MATTER_RE.search(text)
    body = text[m.end():] if m else text

    tags: list[str] = []
    title = None
    if m:
        in_tags = False
        for line in m.group(1).splitlines():
            stripped = line.strip()
            if stripped.startswith("tags:"):
                inline = line.split(":", 1)[1].strip()
                if inline.startswith("[") and inline.endswith("]"):
                    tags += [x.strip().strip("\"'") for x in inline[1:-1].split(",") if x.strip()]
                else:
                    in_tags = True
                continue
            if stripped.startswith("title:"):
                title = line.split(":", 1)[1].strip().strip("\"'")
                in_tags = False
                continue
            if in_tags:
                if stripped.startswith("-"):
                    tags.append(stripped[1:].strip().strip("\"'"))
                else:
                    in_tags = False

    if not title:
        h1 = re.search(r"^#\s+(.*)$", body, re.M)
        title = h1.group(1).strip() if h1 else None

    excerpt = ""
    for line in body.splitlines():
        line = line.strip()
        if not line or line.startswith(("#", "!!!", "```", "---", "|")):
            continue
        excerpt = line
        break
    excerpt = MD_LINK_RE.sub(r"\1", excerpt).replace("`", "").lstrip("> ")
    excerpt = re.sub(r"[*_]{1,2}", "", excerpt)
    excerpt = re.sub(r"\s+", " ", excerpt).strip()
    if len(excerpt) > 165:
        excerpt = excerpt[:162].rsplit(" ", 1)[0] + "…"

    return {"title": title, "tags": tags, "excerpt": excerpt}


def normalize(raw_tags: list[str]) -> tuple[list[str], list[str]]:
    """Applique les alias. Retourne (tags canoniques dédupliqués, tags inconnus)."""
    known = {t for facet in FACETS for t in facet["tags"]}
    out: list[str] = []
    unknown: list[str] = []
    for raw in raw_tags:
        key = raw.strip().lower()
        canon = ALIASES.get(key, key)
        if not canon:
            continue
        if canon not in out:
            out.append(canon)
        if canon not in known and canon not in unknown:
            unknown.append(canon)
    return out, unknown


def collect() -> tuple[list[dict], Counter, list[str], list[str]]:
    sections = load_sections()
    pages: list[dict] = []
    counts: Counter = Counter()
    untagged: list[str] = []
    unknown_all: list[str] = []

    for dirpath, _dirs, files in os.walk(DOCS_DIR):
        if os.path.abspath(dirpath).startswith(os.path.abspath(TAGS_DIR)):
            continue
        for fn in sorted(files):
            if not fn.endswith(".md"):
                continue
            path = os.path.join(dirpath, fn)
            rel = os.path.relpath(path, DOCS_DIR).replace(os.sep, "/")
            if rel == "tags.md":
                continue

            meta = parse_page(path)
            if not meta:
                continue
            tags, unknown = normalize(meta["tags"])
            unknown_all += [u for u in unknown if u not in unknown_all]

            if not tags:
                untagged.append(rel)
                continue

            section = next((s for prefix, s in sections if prefix == rel), "")
            pages.append({
                "t": meta["title"] or os.path.splitext(fn)[0],
                "u": "/" + rel[:-3] + ".html",
                "s": section,
                "e": meta["excerpt"],
                "g": tags,
            })
            for t in tags:
                counts[t] += 1

    pages.sort(key=lambda p: p["t"].lower())
    return pages, counts, untagged, unknown_all


def build_facets(counts: Counter) -> list[dict]:
    placed = {t for facet in FACETS for t in facet["tags"]}
    out = []
    for facet in FACETS:
        tags = [
            {"s": slugify(t), "l": t, "n": counts[t], "i": ICONS.get(t, "tag")}
            for t in facet["tags"] if counts[t]
        ]
        if tags:
            out.append({"id": facet["id"], "label": facet["label"],
                        "hint": facet["hint"], "tags": tags})
    leftovers = sorted((t for t in counts if t not in placed), key=lambda t: (-counts[t], t))
    if leftovers:
        out.append({
            "id": "divers", "label": "Divers", "hint": "hors vocabulaire",
            "tags": [{"s": slugify(t), "l": t, "n": counts[t], "i": "tag"} for t in leftovers],
        })
    return out


def write_json(pages: list[dict], facets: list[dict]) -> None:
    os.makedirs(ASSETS_DIR, exist_ok=True)
    payload = {
        "generated": dt.datetime.now(dt.UTC).isoformat(timespec="seconds"),
        "facets": facets,
        "pages": [dict(p, g=[slugify(t) for t in p["g"]]) for p in pages],
        "labels": {slugify(t["l"]): t["l"] for f in facets for t in f["tags"]},
    }
    with open(os.path.join(ASSETS_DIR, "tags.json"), "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, separators=(",", ":"))


def write_explorer_page(pages: list[dict], facets: list[dict]) -> None:
    """Page hôte. Le <noscript> contient un vrai index navigable sans JS."""
    now = dt.datetime.now(dt.UTC).isoformat(timespec="seconds")
    lines = [
        "---",
        'title: "Tags"',
        'description: "Explorateur de tags — filtrez la documentation par domaine, techno ou usage."',
        f"last_modified: {now}",
        "search:",
        "  exclude: true",
        "---",
        "",
        "# Tags",
        "",
        f"{len(pages)} pages, {sum(len(f['tags']) for f in facets)} tags. "
        "Combinez plusieurs tags pour affiner : les filtres se cumulent et l'URL suit.",
        "",
        '<div id="tags-explorer" data-src="assets/tags.json"></div>',
        "",
        "<noscript>",
    ]
    for facet in facets:
        lines.append(f"<h2>{facet['label']}</h2>")
        lines.append("<ul>")
        for t in facet["tags"]:
            lines.append(f'<li><a href="tags/{t["s"]}.html">{t["l"]}</a> ({t["n"]})</li>')
        lines.append("</ul>")
    lines += ["</noscript>", ""]
    with open(os.path.join(DOCS_DIR, "tags.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")


def write_tag_pages(pages: list[dict], facets: list[dict]) -> None:
    os.makedirs(TAGS_DIR, exist_ok=True)
    for existing in os.listdir(TAGS_DIR):
        if existing.endswith(".md"):
            os.remove(os.path.join(TAGS_DIR, existing))

    by_tag: dict[str, list[dict]] = defaultdict(list)
    for page in pages:
        for tag in page["g"]:
            by_tag[slugify(tag)].append(page)

    labels = {t["s"]: t["l"] for f in facets for t in f["tags"]}
    now = dt.datetime.now(dt.UTC).isoformat(timespec="seconds")

    for slug, entries in by_tag.items():
        label = labels.get(slug, slug)
        related = Counter()
        for e in entries:
            for other in e["g"]:
                if slugify(other) != slug:
                    related[slugify(other)] += 1

        out = [
            "---",
            f'title: "Tag : {label}"',
            f'description: "Les {len(entries)} pages marquées {label}."',
            f"last_modified: {now}",
            "---",
            "",
            f"# {label}",
            "",
            f"{len(entries)} page{'s' if len(entries) > 1 else ''}. "
            f"[Revenir à l'explorateur](../tags.html#{slug})",
            "",
        ]
        for e in entries:
            # Lien racine-relatif : correct depuis /tags/<slug>.html
            desc = f" — {e['e']}" if e["e"] else ""
            out.append(f"- [{e['t']}]({e['u']}){desc}")
        if related:
            out += ["", "## Tags associés", ""]
            out.append(" · ".join(
                f"[{labels.get(s, s)}]({s}.html) ({n})"
                for s, n in related.most_common(8)
            ))
        with open(os.path.join(TAGS_DIR, f"{slug}.md"), "w", encoding="utf-8") as f:
            f.write("\n".join(out) + "\n")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--strict", action="store_true",
                    help="échoue si un tag est hors vocabulaire ou une page non taguée")
    args = ap.parse_args()

    pages, counts, untagged, unknown = collect()
    if not pages:
        print("Aucun tag trouvé.", file=sys.stderr)
        return 1

    facets = build_facets(counts)
    write_json(pages, facets)
    write_explorer_page(pages, facets)
    write_tag_pages(pages, facets)

    print(f"✓ {len(pages)} pages · {len(counts)} tags · {len(facets)} facettes")
    if unknown:
        print(f"⚠ hors vocabulaire ({len(unknown)}) : {', '.join(sorted(unknown))}")
        print("  → ajoutez-les à FACETS ou mappez-les dans ALIASES")
    if untagged:
        print(f"⚠ pages sans tag ({len(untagged)}) :")
        for p in untagged:
            print(f"    {p}")
    if args.strict and (unknown or untagged):
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())

