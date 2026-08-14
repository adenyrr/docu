---
tags:
  - sql
  - base-de-données
  - commandes
  - adminsys
---
# SQL — Cheat Sheet : Manipulation de données

> Référence rapide pour les opérations DML (Data Manipulation Language) et les requêtes courantes.

---

## Sélection de données

### `SELECT` de base

```sql
SELECT colonne1, colonne2 FROM table;
SELECT * FROM table;
SELECT DISTINCT colonne FROM table;        -- valeurs uniques
SELECT colonne AS alias FROM table;        -- renommer la colonne
```

### Filtrage avec `WHERE`

```sql
SELECT * FROM table WHERE colonne = 'valeur';
SELECT * FROM table WHERE age > 18 AND ville = 'Paris';
SELECT * FROM table WHERE statut IN ('actif', 'en_attente');
SELECT * FROM table WHERE nom LIKE 'A%';   -- commence par A
SELECT * FROM table WHERE nom LIKE '%son'; -- finit par "son"
SELECT * FROM table WHERE valeur BETWEEN 10 AND 50;
SELECT * FROM table WHERE colonne IS NULL;
SELECT * FROM table WHERE colonne IS NOT NULL;
```

### Tri et pagination

```sql
SELECT * FROM table ORDER BY colonne ASC;
SELECT * FROM table ORDER BY colonne DESC;
SELECT * FROM table ORDER BY col1 ASC, col2 DESC;

SELECT * FROM table LIMIT 10;             -- 10 premières lignes
SELECT * FROM table LIMIT 10 OFFSET 20;  -- page 3 (rows 21-30)
```

---

## Agrégation

### Fonctions d'agrégat

| Fonction | Description |
|---|---|
| `COUNT(*)` | Nombre de lignes |
| `COUNT(colonne)` | Nombre de valeurs non nulles |
| `SUM(colonne)` | Somme |
| `AVG(colonne)` | Moyenne |
| `MIN(colonne)` | Valeur minimale |
| `MAX(colonne)` | Valeur maximale |

```sql
SELECT COUNT(*), AVG(salaire), MAX(salaire) FROM employes;
```

### `GROUP BY` et `HAVING`

```sql
-- Grouper les résultats
SELECT departement, COUNT(*) AS nb_employes
FROM employes
GROUP BY departement;

-- Filtrer les groupes (≠ WHERE qui filtre les lignes)
SELECT departement, AVG(salaire) AS salaire_moyen
FROM employes
GROUP BY departement
HAVING AVG(salaire) > 3000;
```

!!! tip "Ordre d'exécution"
    `WHERE` filtre **avant** le groupement, `HAVING` filtre **après**.

---

## Jointures

```sql
-- INNER JOIN : lignes communes aux deux tables
SELECT u.nom, c.montant
FROM utilisateurs u
INNER JOIN commandes c ON u.id = c.utilisateur_id;

-- LEFT JOIN : toutes les lignes de gauche, nulls à droite si pas de correspondance
SELECT u.nom, c.montant
FROM utilisateurs u
LEFT JOIN commandes c ON u.id = c.utilisateur_id;

-- RIGHT JOIN : toutes les lignes de droite
SELECT u.nom, c.montant
FROM utilisateurs u
RIGHT JOIN commandes c ON u.id = c.utilisateur_id;

-- FULL OUTER JOIN : toutes les lignes des deux tables
SELECT u.nom, c.montant
FROM utilisateurs u
FULL OUTER JOIN commandes c ON u.id = c.utilisateur_id;

-- SELF JOIN : jointure d'une table sur elle-même
SELECT a.nom AS employe, b.nom AS manager
FROM employes a
JOIN employes b ON a.manager_id = b.id;

-- CROSS JOIN : produit cartésien
SELECT * FROM taille CROSS JOIN couleur;
```

---

## Insertion de données

```sql
-- Insertion d'une ligne
INSERT INTO utilisateurs (nom, email, age)
VALUES ('Alice', 'alice@example.com', 30);

-- Insertion multiple
INSERT INTO utilisateurs (nom, email, age) VALUES
  ('Bob', 'bob@example.com', 25),
  ('Carol', 'carol@example.com', 28);

-- Insertion depuis une requête
INSERT INTO archive_utilisateurs (nom, email)
SELECT nom, email FROM utilisateurs WHERE actif = false;
```

---

## Mise à jour de données

```sql
-- Mettre à jour des lignes
UPDATE utilisateurs
SET email = 'nouveau@example.com', age = 31
WHERE id = 42;

-- Mise à jour avec jointure (PostgreSQL / SQL Server)
UPDATE commandes
SET statut = 'vérifié'
FROM utilisateurs
WHERE commandes.utilisateur_id = utilisateurs.id
  AND utilisateurs.role = 'admin';
```

!!! warning "Toujours utiliser `WHERE`"
    Un `UPDATE` sans clause `WHERE` modifie **toutes** les lignes de la table.

---

## Suppression de données

```sql
-- Supprimer des lignes filtrées
DELETE FROM utilisateurs WHERE actif = false;

-- Vider une table (supprime toutes les lignes)
DELETE FROM table;       -- supprimable ligne par ligne, transactionnel
TRUNCATE TABLE table;    -- plus rapide, non transactionnel sur certains SGBD
```

!!! danger "Pas de `WHERE` = tout supprimer"
    Vérifier la clause `WHERE` avant d'exécuter un `DELETE`.

---

## Sous-requêtes

```sql
-- Dans WHERE
SELECT nom FROM employes
WHERE salaire > (SELECT AVG(salaire) FROM employes);

-- Avec IN
SELECT nom FROM utilisateurs
WHERE id IN (SELECT utilisateur_id FROM commandes WHERE montant > 500);

-- Sous-requête corrélée
SELECT nom, salaire
FROM employes e1
WHERE salaire > (
  SELECT AVG(salaire) FROM employes e2
  WHERE e2.departement = e1.departement
);

-- Dans FROM (table dérivée)
SELECT dept, salaire_moyen
FROM (
  SELECT departement AS dept, AVG(salaire) AS salaire_moyen
  FROM employes
  GROUP BY departement
) AS stats
WHERE salaire_moyen > 4000;
```

---

## Expressions de table communes (CTE)

```sql
-- CTE simple
WITH employes_seniors AS (
  SELECT * FROM employes WHERE anciennete > 5
)
SELECT departement, COUNT(*) FROM employes_seniors
GROUP BY departement;

-- CTE chaînées
WITH
  ventes_2024 AS (
    SELECT * FROM ventes WHERE YEAR(date) = 2024
  ),
  top_produits AS (
    SELECT produit_id, SUM(montant) AS total
    FROM ventes_2024
    GROUP BY produit_id
    HAVING SUM(montant) > 10000
  )
SELECT p.nom, t.total
FROM top_produits t
JOIN produits p ON t.produit_id = p.id;

-- CTE récursive (ex: hiérarchie)
WITH RECURSIVE hierarchie AS (
  SELECT id, nom, manager_id, 0 AS niveau
  FROM employes WHERE manager_id IS NULL

  UNION ALL

  SELECT e.id, e.nom, e.manager_id, h.niveau + 1
  FROM employes e
  JOIN hierarchie h ON e.manager_id = h.id
)
SELECT * FROM hierarchie ORDER BY niveau;
```

---

## Fonctions de fenêtrage

```sql
-- Numérotation
SELECT nom, salaire,
  ROW_NUMBER() OVER (ORDER BY salaire DESC) AS rang,
  RANK()       OVER (ORDER BY salaire DESC) AS rang_ex_aequo,
  DENSE_RANK() OVER (ORDER BY salaire DESC) AS rang_dense
FROM employes;

-- Partitionnement
SELECT nom, departement, salaire,
  RANK() OVER (PARTITION BY departement ORDER BY salaire DESC) AS rang_dept
FROM employes;

-- Agrégats glissants
SELECT date, montant,
  SUM(montant) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS total_7j,
  AVG(montant) OVER (PARTITION BY MONTH(date)) AS moy_mensuelle
FROM ventes;

-- Décalage
SELECT date, montant,
  LAG(montant, 1)  OVER (ORDER BY date) AS montant_precedent,
  LEAD(montant, 1) OVER (ORDER BY date) AS montant_suivant
FROM ventes;
```

---

## Manipulation de chaînes

```sql
UPPER(str)                -- 'hello' → 'HELLO'
LOWER(str)                -- 'HELLO' → 'hello'
LENGTH(str)               -- longueur
TRIM(str)                 -- supprime les espaces en début/fin
LTRIM(str) / RTRIM(str)
SUBSTRING(str, 1, 3)      -- extrait 3 caractères depuis la position 1
CONCAT(a, ' ', b)         -- concaténation
REPLACE(str, 'a', 'b')    -- remplace toutes les occurrences
POSITION('sub' IN str)    -- position de la sous-chaîne
COALESCE(col, 'défaut')   -- retourne la première valeur non nulle
```

---

## Manipulation de dates

```sql
NOW() / CURRENT_TIMESTAMP  -- date et heure actuelles
CURRENT_DATE               -- date du jour
CURRENT_TIME               -- heure actuelle

DATE_ADD(date, INTERVAL 7 DAY)   -- MySQL
date + INTERVAL '7 days'          -- PostgreSQL

DATEDIFF(date1, date2)     -- différence en jours (MySQL)
date1 - date2              -- différence en jours (PostgreSQL)

EXTRACT(YEAR FROM date)    -- extraire l'année
DATE_FORMAT(date, '%Y-%m') -- formater (MySQL)
TO_CHAR(date, 'YYYY-MM')   -- formater (PostgreSQL)
```

---

## Opérations sur les ensembles

```sql
-- Union (dédoublonnée)
SELECT nom FROM clients
UNION
SELECT nom FROM fournisseurs;

-- Union avec doublons
SELECT nom FROM clients
UNION ALL
SELECT nom FROM fournisseurs;

-- Intersection
SELECT nom FROM clients
INTERSECT
SELECT nom FROM fournisseurs;

-- Différence
SELECT nom FROM clients
EXCEPT               -- PostgreSQL / SQL Server
SELECT nom FROM fournisseurs;
-- ou MINUS sur Oracle
```

---

## Expressions conditionnelles

```sql
-- CASE simple
SELECT nom,
  CASE statut
    WHEN 'A' THEN 'Actif'
    WHEN 'I' THEN 'Inactif'
    ELSE 'Inconnu'
  END AS libelle_statut
FROM utilisateurs;

-- CASE recherché
SELECT nom, salaire,
  CASE
    WHEN salaire < 2000 THEN 'Bas'
    WHEN salaire < 4000 THEN 'Moyen'
    ELSE 'Élevé'
  END AS tranche
FROM employes;

-- Raccourcis
COALESCE(a, b, c)        -- premier non NULL
NULLIF(a, b)             -- NULL si a = b, sinon a
IIF(condition, a, b)     -- SQL Server uniquement
```

---

## Transactions

```sql
BEGIN;                   -- ou START TRANSACTION

UPDATE comptes SET solde = solde - 100 WHERE id = 1;
UPDATE comptes SET solde = solde + 100 WHERE id = 2;

COMMIT;                  -- valider
-- ou
ROLLBACK;                -- annuler

-- Point de sauvegarde
SAVEPOINT mon_point;
ROLLBACK TO mon_point;
RELEASE SAVEPOINT mon_point;
```

!!! info "Propriétés ACID"
    Une transaction garantit **Atomicité**, **Cohérence**, **Isolation** et **Durabilité**.

---

## Bonnes pratiques

- Toujours tester un `UPDATE` / `DELETE` avec un `SELECT` équivalent d'abord.
- Utiliser des transactions pour les opérations multi-étapes critiques.
- Préférer les CTEs aux sous-requêtes imbriquées pour la lisibilité.
- Éviter `SELECT *` en production — nommer les colonnes explicitement.
- Indexer les colonnes utilisées dans `WHERE`, `JOIN ON` et `ORDER BY`.
- Utiliser `EXPLAIN` / `EXPLAIN ANALYZE` pour diagnostiquer les performances.

```sql
EXPLAIN ANALYZE
SELECT u.nom, COUNT(c.id)
FROM utilisateurs u
LEFT JOIN commandes c ON u.id = c.utilisateur_id
GROUP BY u.nom;
```
