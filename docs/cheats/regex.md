# Regex — Cheat Sheet

> Référence rapide des expressions régulières — syntaxe universelle, PCRE, et usages dans les outils Linux courants.

---

## Ancres et positions

| Expression | Description | Exemple | Correspond à |
|---|---|---|---|
| `^` | Début de ligne | `^Bonjour` | `Bonjour monde` |
| `$` | Fin de ligne | `monde$` | `Bonjour monde` |
| `\b` | Frontière de mot | `\bcat\b` | `cat` mais pas `catch` |
| `\B` | Non-frontière | `\Bcat\B` | `scatter` (cat interne) |
| `\A` | Début de chaîne (PCRE) | `\ADebut` | Début absolu |
| `\Z` | Fin de chaîne (PCRE) | `fin\Z` | Fin absolue |

---

## Classes de caractères

| Expression | Description |
|---|---|
| `.` | N'importe quel caractère (sauf newline) |
| `\d` | Chiffre (`[0-9]`) |
| `\D` | Non-chiffre (`[^0-9]`) |
| `\w` | Alphanumérique + underscore (`[a-zA-Z0-9_]`) |
| `\W` | Non-alphanumérique |
| `\s` | Espace blanc (espace, tab, newline) |
| `\S` | Non-espace blanc |
| `\t` | Tabulation |
| `\n` | Saut de ligne |
| `\r` | Retour chariot |

### Classes personnalisées

```regex
[abc]          # a, b ou c
[^abc]         # ni a, ni b, ni c
[a-z]          # toute lettre minuscule
[A-Z]          # toute lettre majuscule
[0-9]          # tout chiffre
[a-zA-Z0-9]   # tout alphanumérique
[a-z&&[^aeiou]]  # consonnes (Java/Perl)
[\u00C0-\u017E]  # lettres latines étendues (Unicode)
```

!!! tip "Le point `.` ne correspond pas aux newlines"
    En mode multi-ligne, utiliser le flag `s` (PCRE: `(?s)`) pour que `.` corresponde à tout caractère y compris `\n`.

---

## Quantificateurs

| Expression | Description | Exemple | Correspond à |
|---|---|---|---|
| `*` | 0 ou plusieurs | `ab*c` | `ac`, `abc`, `abbc` |
| `+` | 1 ou plusieurs | `ab+c` | `abc`, `abbc` (pas `ac`) |
| `?` | 0 ou 1 (optionnel) | `colou?r` | `color`, `colour` |
| `{n}` | Exactement n fois | `\d{4}` | `2024` |
| `{n,}` | Au moins n fois | `\d{2,}` | `12`, `123`, `1234` |
| `{n,m}` | Entre n et m fois | `\d{2,4}` | `12`, `123`, `1234` |

### Quantificateurs paresseux (non-greedy)

Par défaut, les quantificateurs sont **greedy** (prennent le maximum possible).

```regex
.*          # greedy : prend le plus possible
.*?         # lazy : prend le moins possible
.+?         # lazy
.{2,5}?     # lazy

# Exemple avec <b>texte</b><b>autre</b>
<b>.*</b>   # → <b>texte</b><b>autre</b>  (greedy, trop)
<b>.*?</b>  # → <b>texte</b>  (lazy, correct)
```

---

## Groupes et alternance

```regex
(abc)              # groupe capturant
(?:abc)            # groupe non capturant (plus performant)
(?P<nom>abc)       # groupe nommé (Python/PCRE)
(?<nom>abc)        # groupe nommé (PCRE/.NET)

cat|dog            # alternance : cat OU dog
(cat|dog) food     # (cat food) ou (dog food)

# Références arrière (backreferences)
(\w+)\s\1          # mot répété (ex: "le le")
(?P<mot>\w+)\s(?P=mot)  # avec groupe nommé (Python)
```

---

## Lookahead et lookbehind

```regex
# Lookahead positif : suivi de ...
\d+(?= euros)      # chiffres suivis de " euros"

# Lookahead négatif : NON suivi de ...
\d+(?! euros)      # chiffres NOT suivis de " euros"

# Lookbehind positif : précédé de ...
(?<=\$)\d+         # chiffres précédés de "$"

# Lookbehind négatif : NON précédé de ...
(?<!\$)\d+         # chiffres NOT précédés de "$"
```

!!! info "Lookaround = zéro largeur"
    Les lookahead/lookbehind ne consomment pas de caractères. Ils vérifient le contexte sans en faire partie du match.

---

## Flags / Modificateurs

| Flag | PCRE | Python | Description |
|---|---|---|---|
| Insensible casse | `(?i)` | `re.I` | `ABC` ↔ `abc` |
| Multi-ligne | `(?m)` | `re.M` | `^`/`$` sur chaque ligne |
| Dotall | `(?s)` | `re.S` | `.` matche aussi `\n` |
| Verbose | `(?x)` | `re.X` | Espaces et commentaires ignorés |
| Unicode | `(?u)` | `re.U` | `\w`, `\d` étendus à Unicode |

```regex
# Inline flags (PCRE)
(?i)hello          # insensible à la casse depuis ici
(?im)^hello$       # multi-flag

# Mode verbose (commentaires dans la regex)
(?x)
  \d{4}            # année
  [-/]             # séparateur
  \d{2}            # mois
  [-/]
  \d{2}            # jour
```

---

## Caractères spéciaux à échapper

Les caractères suivants ont une signification spéciale et doivent être échappés avec `\` :

```
. * + ? ^ $ { } [ ] | ( ) \
```

```regex
www\.example\.com   # matcher un point littéral
\(texte\)           # matcher des parenthèses littérales
\d+\.\d+            # nombre décimal (ex: 3.14)
```

---

## Patterns courants

### Validation de formats

```regex
# Email (simplifié)
^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$

# IPv4
^(\d{1,3}\.){3}\d{1,3}$

# IPv4 stricte (0-255)
^(25[0-5]|2[0-4]\d|[01]?\d\d?)(\.(25[0-5]|2[0-4]\d|[01]?\d\d?)){3}$

# IPv6 (simplifiée)
^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$

# URL
^https?://[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$

# Date ISO 8601 (YYYY-MM-DD)
^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$

# Heure (HH:MM:SS)
^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$

# Numéro de téléphone belge
^(\+32|0)(4[5-9]\d|[1-9]\d)\d{6}$

# Code postal belge
^[1-9]\d{3}$

# CIDR
^(\d{1,3}\.){3}\d{1,3}\/([0-9]|[1-2][0-9]|3[0-2])$

# UUID v4
^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$

# Hash SHA-256
^[a-f0-9]{64}$

# Adresse MAC
^([0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}$
```

### Extraction et nettoyage

```regex
# Lignes vides
^\s*$

# Espaces en début/fin de ligne
^\s+|\s+$

# Balises HTML
<[^>]+>

# Commentaires C/C++
//.*$|/\*[\s\S]*?\*/

# Adresses IP dans un log
\b\d{1,3}(?:\.\d{1,3}){3}\b

# Numéros de version sémantique
v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?

# Chemins Unix
(/[\w.-]+)+/?

# Variables d'environnement
\$\{?[A-Z_][A-Z0-9_]*\}?
```

---

## Usage dans les outils Linux

### grep

```bash
grep -E "regex+"          # ERE (Extended Regular Expressions)
grep -P "regex(?=lookahead)"  # PCRE (Perl-Compatible)
grep -G "regex\+"         # BRE (Basic, défaut) — + doit être échappé
grep -F "chaine.fixe"     # chaîne fixe, pas de regex

grep -E "^(ERROR|WARN)" app.log      # lignes d'erreur ou warning
grep -P "(\d{1,3}\.){3}\d{1,3}" access.log  # IPs dans un log
grep -Eo "[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}"  # extraire les IPs
```

### sed

```bash
sed 's/pattern/remplacement/'      # BRE par défaut
sed -E 's/pattern+/remplacement/'  # ERE
sed -E 's/(groupe1)(groupe2)/\2\1/' # inverser deux groupes
sed -n '/^ERROR/p'                  # afficher les lignes matchant
sed '/^#/d'                         # supprimer les commentaires
sed -E 's/[[:space:]]+/ /g'        # compresser les espaces
```

### awk

```bash
awk '/^ERROR/ {print $0}'           # lignes matchant
awk '!/^#/ {print $1, $3}'         # exclure les commentaires
awk -F: '$3 > 1000 {print $1}'     # utilisateurs avec UID > 1000
awk 'NR%2==0'                       # lignes paires
```

### find

```bash
find . -regex ".*\.log\.[0-9]+"    # fichiers de log archivés
find . -iregex ".*\.(jpg|png|gif)" # images (insensible casse)
```

---

## PCRE — Syntaxe avancée

```regex
# Assertions conditionnelles
(?(condition)oui|non)

# Possession (atomic groups — PCRE2)
\d++           # chiffres, pas de backtrack
[a-z]++        # lettres, pas de backtrack

# Reset de numérotation de groupe
(?|(\d+)|([a-z]+))   # les deux alternatives partagent le groupe 1

# Récursion (PCRE2)
(?P<expr>\d+|\((?P>expr)[+\-*/](?P>expr)\))

# Unicode properties
\p{Lu}         # lettre majuscule Unicode
\p{Ll}         # lettre minuscule Unicode
\p{N}          # tout chiffre Unicode
\p{L}          # toute lettre Unicode
\P{L}          # tout ce qui N'EST PAS une lettre
```

---

## Bonnes pratiques

- Toujours tester les regex avec des données réelles avant de les utiliser en production.
- Préférer les groupes non-capturants `(?:...)` quand la capture n'est pas nécessaire (performance).
- Éviter les patterns catastrophiques comme `(a+)+` qui causent du backtracking exponentiel.
- Documenter les regex complexes avec des commentaires (flag `(?x)`).
- Utiliser des outils de test visuels pour les regex complexes.

```bash
# Outils de test
echo "test string" | grep -P "votre_regex"       # tester avec grep
echo "test" | sed -E 's/pattern/replacement/'     # tester avec sed

# Débogage Python
python3 -c "
import re
pattern = r'votre_regex'
text = 'votre texte'
m = re.search(pattern, text)
print(m.groups() if m else 'Pas de match')
"
```

!!! warning "Performance"
    Les quantificateurs greedy imbriqués `(.*)*` peuvent provoquer un **ReDoS** (Regular Expression Denial of Service). Préférer les quantificateurs possessifs ou les groupes atomiques quand disponibles.
