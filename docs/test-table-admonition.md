# Test Table in Admonition

!!! note "Tableau dans une admonition"

    | Expression | Description | Exemple | Correspond à |
    |---|---|---|---|
    | `^` | Début de ligne | `^Bonjour` | `Bonjour monde` |
    | `$` | Fin de ligne | `monde$` | `Bonjour monde` |
    | `\b` | Frontière de mot | `\bcat\b` | `cat` mais pas `catch` |
    | `\B` | Non-frontière | `\Bcat\B` | `scatter` (cat interne) |
