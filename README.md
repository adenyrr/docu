# Docu

Documentation personnelle publiée sur <https://docu.adenyrr.me>.

Le site est une application statique Astro 7. Les contenus vivent dans la
collection MDX `src/content/docs`, l’interface documentaire dans `src`, et les
ressources publiques dans `public/assets`. Le shell visuel est partagé avec
adenyrr.me par le package `@adenyrr/astro-ui`.

## Développement local

Node 22.12 ou plus récent est requis.

```bash
npm ci
npm run dev -- --host 0.0.0.0
```

Commandes de validation :

```bash
npm run validate:content
npm run lint
npm run check
npm test
npm run build
npm run audit
npm run deploy:dry-run
```

La sortie statique est générée dans `dist`. Le Worker Cloudflare `docu` la
sert sur `docu.adenyrr.me` et canonicalise les anciennes URL `.html` ou avec
slash final vers les routes Astro sans extension. L’ancienne route `/infra`
redirige vers la page dédiée <https://adenyrr.me/infra>.

## Contenu

Le front matter d’une page exige `title`, `description`, `last_modified` et
`tags`. Les seules options sont `draft` et `search.exclude`. Les alias, facettes
et tags autorisés sont définis dans `src/lib/tags.ts`; toute valeur inconnue
fait échouer la validation et le build.

Les syntaxes éditoriales enrichies utilisent les composants MDX de
`src/components/content` : admonitions, disclosures, onglets, Mermaid et
figures. Expressive Code traite les blocs de code. La recherche MiniSearch et
l’explorateur de tags sont produits localement au build, sans service tiers.

## CI/CD

GitLab CI utilise Node 22, avec l’historique Git complet (`GIT_DEPTH: "0"`).
Le pipeline valide le contenu, le MDX, les types, les tests Playwright, axe, le
build et l’audit npm avant le déploiement Worker. Les merge requests disposent
d’un Worker de prévisualisation distinct, supprimé automatiquement après sept
jours. Les variables CI/CD masquées `CLOUDFLARE_API_TOKEN`,
`CLOUDFLARE_ACCOUNT_ID` et `CLOUDFLARE_WORKERS_SUBDOMAIN` sont requises ; le
jeton doit être disponible dans les pipelines de merge request pour produire
les aperçus.

La configuration n’emploie plus Python, MkDocs ni Zensical. Aucun push,
déploiement ou publication de `@adenyrr/astro-ui` ne doit être effectué depuis
un poste local sans validation explicite.

## Licence

Voir [LICENSE](LICENSE).
