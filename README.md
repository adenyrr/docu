# Documentation statique

Ce dépôt contient la documentation personnelle d'**Adenyrr**. La pile
technologique est légère et tournée autour de générateurs de sites statiques
pour produire des pages HTML à partir de fichiers Markdown.

Le site est disponible sur https://docu.adenyrr.be
---

## Stack utilisée

* **Zensical** – un moteur de documentation (basé sur MkDocs) écrit en Python;
  la configuration est définie dans `zensical.toml` à la racine du projet.
* **MkDocs** – sous-jacent à Zensical
* **Python 3** – l'environnement est géré via un `venv` (répertoire `.venv/`).
* Les dépendances sont listées dans `requirements.txt` afin de faciliter les
  mises à jour automatiques via des outils comme Dependabot ou une MR
  programmée.
* **Markdown** – toutes les pages se trouvent dans `docs/` et
  `.md` est l'unique format de contenu.
* CSS et JS additionnels sous `docs/stylesheets/` et
  `docs/javascripts/`.
* Configuration de navigation, thème, anonymisation, etc. dans
  `zensical.toml`.
* Le thème `modern` de Zensical est personnalisé via `docs/overrides`.

### 🎨 Thème et polices

Le site utilise le thème `modern` fourni par Zensical, enrichi de
styles supplémentaires dans `docs/stylesheets/extra.css` et d'une extension du
layout dans `docs/overrides/main.html`.

La feuille de style définit une palette de couleurs clair/sombre inspirée du
look « Hyprland glassmorphism » et de kitty, le terminal et expose des variables CSS pour les accents,
liens, arrière‑plans, etc.

Les polices sont :

* **Inclusive Sans** pour le corps du texte (chargée via CSS externe).
* **JetBrains Mono** pour les blocs de code et l'interface de type terminal.

Ces choix garantissent une apparence cohérente et confortable sur toutes les
pages.

> **Note technique** : Zensical est un wrapper autour de MkDocs Material. Le site
> utilise des fonctionnalités spécifiques à Zensical (thème `modern`, plugin
> offline, extensions d'emoji/glightbox). Une migration vers MkDocs Material
> directement est possible mais nécessiterait :
> - Remplacer le thème `modern` par Material (avec personnalisation CSS équivalente)
> - Remplacer le plugin offline par un service worker manuel
> - Adapter les imports d'emoji et glightbox vers leurs équivalents PyPI
> - Convertir `zensical.toml` en `mkdocs.yml`


---

## Structure du projet

```
/ (racine)
├── zensical.toml       # configuration de la documentation
├── docs/               # contenu Markdown + ressources statiques
│   ├── index.md        # page d'accueil
│   ├── ...             # sous‑dossiers thématiques
│   ├── stylesheets/
│   └── javascripts/
├── public/             # sortie générée (ignorée par git)
├── .gitlab-ci.yml      # pipeline de build/déploiement
├── robots.txt          # fichiers copiés dans la build
├── sitemap.xml
└── README.md           # ce fichier
```

---
## Développement local

```bash
# créer et activer l'environnement Python
python -m venv .venv
source .venv/bin/activate

# installer Zensical et dépendances
pip install --upgrade pip
pip install "zensical==0.0.54" \
  "mkdocs-git-revision-date-localized-plugin==1.5.3" \
  "mkdocs-minify-plugin==0.8.0" \
  "mkdocs-macros-plugin==1.5.0" \
  "mkdocs-redirects==1.2.3"

# lancer un serveur de développement
zensical serve
# ou pour générer le site dans public/
zensical build --clean
```

Le dossier `public/` peut être déployé sur n'importe quel hébergeur de sites
statiques. Le pipeline GitLab s'en charge automatiquement lors des push sur
la branche par défaut.
> La chaîne CI (GitLab) installe Zensical et les plugins listés
> ci‑dessus avant de lancer `zensical build --clean`.

### Scripts de pre‑build

Plusieurs scripts Python sont exécutés avant la génération du site :

| Script | Rôle |
|--------|------|
| `scripts/generate_tags_index.py` | Génère `docs/tags.md` et les pages par tag dans `docs/tags/` |
| `scripts/generate_revision_dates.py` | Génère `docs/assets/revision-dates.json` avec les dates git |
| `scripts/generate_sitemap.py` | Génère `sitemap.xml` dynamique depuis la navigation |
| `scripts/validate_dates.py` | Vérifie la cohérence des dates `last_modified` dans le frontmatter |
| `scripts/validate_internal_links.py` | Vérifie que les liens internes pointent vers des fichiers existants |

Pour exécuter un script manuellement :
```bash
python scripts/<nom_du_script>.py
```

---

## Pipeline CI/CD

Le pipeline GitLab (`.gitlab-ci.yml`) est organisé en 5 stages :

1. **update** – Renovate (mises à jour automatiques des dépendances)
2. **lint** – markdownlint, validation des dates frontmatter
3. **test** – vérification des liens, scan de vulnérabilités (safety, npm audit), audit accessibilité (axe)
4. **build** – génération du site statique + preview sur MR
5. **deploy** – déploiement Cloudflare + health check

Les jobs de test sont en `allow_failure: true` pour ne pas bloquer le pipeline
sur des problèmes non-critiques.

---

## Mises à jour automatiques des dépendances

Ce dépôt utilise **Renovate** pour gérer automatiquement les mises à jour
des dépendances listées dans `requirements.txt`.

- La configuration de Renovate se trouve dans `renovate.json` à la racine.
- Renovate nécessite un token GitLab (Personal Access Token ou Project
  Access Token) avec l'autorisation API. Stockez ce token dans les variables
  CI/CD sous le nom `PERSONAL_TOKEN`.
- Le job `renovate` dans `.gitlab-ci.yml` invoque l'image officielle
  `renovate/renovate`, utilise l'API GitLab de l'instance courante et lira
  `PERSONAL_TOKEN` via la variable `RENOVATE_TOKEN`.

Pour activer les mises à jour automatiques :

1. Ajouter la variable CI `PERSONAL_TOKEN` (scope `api`) via *Settings → CI/CD → Variables*.
2. Créer un Schedule (CI/CD → Schedules) pour déclencher périodiquement le job `renovate` (hebdomadaire ou quotidien). La fréquence du Schedule GitLab pilote les vérifications de Renovate.
3. Renovate ouvrira des Merge Requests pour les nouvelles versions; testez et mergez.

### Token requis

Pour que Renovate fonctionne, vous devez définir une variable CI/CD nommée
`PERSONAL_TOKEN` (ou `RENOVATE_TOKEN`) avec un Personal Access Token GitLab
ayant les permissions `api`. Sans ce token, le job `renovate` échouera.

→ *Settings → CI/CD → Variables → Ajouter `PERSONAL_TOKEN`*

---

## Licences et contributions

Le contenu est couvert par la licence indiquée dans `zensical.toml` (Creative
Commons BY‑NC). Le code source du moteur est issu de projets open‑source
(`zensical`, `MkDocs`).
