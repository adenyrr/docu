# Documentation statique

Ce dépôt contient la documentation personnelle d'**Adenyrr**. La pile
technologique est légère et tournée autour de générateurs de sites statiques
pour produire des pages HTML à partir de fichiers Markdown.

Le site est disponible sur https://docu.adenyrr.me
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
pip install "zensical==0.0.15" \
    mkdocs-git-revision-date-localized-plugin \
    mkdocs-glightbox mkdocs-minify-plugin mkdocs-macros-plugin

# lancer un serveur de développement
zensical serve
# ou pour générer le site dans public/
zensical build --clean
```

Le dossier `public/` peut être déployé sur n'importe quel hébergeur de sites
statiques. Le pipeline GitLab s'en charge automatiquement lors des push sur
la branche par défaut.
> La chaîne CI (GitLab) installe Zensical 0.0.15 et les plugins listés
> ci‑dessus avant de lancer `zensical build --clean`.

---

## Mises à jour automatiques des dépendances

Ce dépôt utilise **Renovate** pour gérer automatiquement les mises à jour
des dépendances listées dans `requirements.txt`.

- La configuration de Renovate se trouve dans `renovate.json` à la racine.
- Renovate nécessite un token GitLab (Personal Access Token ou Project
  Access Token) avec l'autorisation API. Stockez ce token dans les variables
  CI/CD sous le nom `PERSONAL_TOKEN`.
- Le job `renovate` dans `.gitlab-ci.yml` invoque l'image officielle
  `renovate/renovate` et lira `PERSONAL_TOKEN` via la variable `RENOVATE_TOKEN`.

Pour activer les mises à jour automatiques :

1. Ajouter la variable CI `PERSONAL_TOKEN` (scope `api`) via *Settings → CI/CD → Variables*.
2. Créer un Schedule (CI/CD → Schedules) pour déclencher périodiquement le job `renovate`.
3. Renovate ouvrira des Merge Requests pour les nouvelles versions; testez et mergez.
---

## Licences et contributions

Le contenu est couvert par la licence indiquée dans `zensical.toml` (Creative
Commons BY‑NC). Le code source du moteur est issu de projets open‑source
(`zensical`, `MkDocs`).
