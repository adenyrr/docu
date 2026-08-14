---
tags:
  - linux
  - fichiers
  - commandes
  - shell
---
# Linux — Cheat Sheet : Opérations sur les fichiers

> Référence rapide pour la création, copie, déplacement, visualisation et manipulation des fichiers et répertoires.

---

## Navigation et listing

```bash
ls                                 # lister le répertoire courant
ls -l                              # format long (permissions, taille, date)
ls -lh                             # tailles human-readable (K, M, G)
ls -la                             # inclure les fichiers cachés
ls -lt                             # trier par date de modification
ls -lS                             # trier par taille
ls -R                              # récursif
ls --color=auto                    # coloration syntaxique
ll                                 # alias courant pour ls -lah

tree                               # arborescence en arbre
tree -L 2                          # limiter à 2 niveaux
tree -d                            # répertoires uniquement
tree -h                            # avec tailles
tree -I "node_modules|.git"        # exclure des patterns
```

---

## Création de fichiers et répertoires

```bash
touch fichier.txt                  # créer un fichier vide (ou MAJ timestamp)
touch -t 202401011200 fichier.txt  # forcer un timestamp (YYYYMMDDhhmm)
touch fichier{1,2,3}.txt           # créer fichier1.txt, fichier2.txt, fichier3.txt

mkdir dossier                      # créer un répertoire
mkdir -p a/b/c                     # créer les parents si nécessaire
mkdir -m 750 dossier               # avec permissions spécifiques
mkdir {logs,config,data}           # créer plusieurs dossiers

# Redirection vers un fichier
echo "contenu" > fichier.txt       # écraser
echo "contenu" >> fichier.txt      # ajouter (append)
cat > fichier.txt << EOF           # heredoc
ligne 1
ligne 2
EOF
```

---

## Copie, déplacement, suppression

### Copie (`cp`)

```bash
cp source.txt dest.txt             # copier un fichier
cp -i source.txt dest.txt          # confirmer si écrasement
cp -r dossier/ copie/              # copier un répertoire (récursif)
cp -a dossier/ copie/              # copier en préservant tout (archive mode)
cp -u source dest                  # copier seulement si source plus récente
cp -v source dest                  # mode verbeux
cp -p source dest                  # préserver permissions, timestamps
cp --backup=numbered src dst       # créer des sauvegardes numérotées

# Copier plusieurs fichiers vers un dossier
cp fichier1.txt fichier2.txt /dest/
cp *.log /var/archive/
```

### Déplacement / renommage (`mv`)

```bash
mv ancien.txt nouveau.txt          # renommer
mv fichier.txt /autre/chemin/      # déplacer
mv -i fichier.txt dest/            # confirmer si écrasement
mv -u fichier.txt dest/            # déplacer seulement si plus récent
mv -v fichier.txt dest/            # mode verbeux
mv dossier/ /nouveau/chemin/       # déplacer un répertoire

# Renommer en masse (sans rename)
for f in *.txt; do mv "$f" "${f%.txt}.md"; done

# Avec la commande rename (Perl)
rename 's/\.txt$/.md/' *.txt       # renommer l'extension
rename 's/prefix_//' prefix_*.txt  # supprimer un préfixe
```

### Suppression (`rm`)

```bash
rm fichier.txt                     # supprimer un fichier
rm -i fichier.txt                  # demander confirmation
rm -f fichier.txt                  # forcer (sans confirmation)
rm -r dossier/                     # récursif (répertoire)
rm -rf dossier/                    # récursif + forcé

rmdir dossier/                     # supprimer un répertoire VIDE
rmdir -p a/b/c                     # supprimer les parents vides

# Suppression sécurisée
shred -vzu fichier.txt             # écraser avant suppression
```

!!! danger "rm -rf irréversible"
    Il n'y a pas de corbeille en ligne de commande. Une suppression est définitive. Toujours vérifier le chemin avant d'exécuter `rm -rf`.

---

## Visualisation de fichiers

### Affichage simple

```bash
cat fichier.txt                    # afficher tout le contenu
cat -n fichier.txt                 # avec numéros de ligne
cat -A fichier.txt                 # afficher les caractères non imprimables
cat fichier1.txt fichier2.txt      # concaténer et afficher

tac fichier.txt                    # afficher en sens inverse (dernière ligne en premier)

head fichier.txt                   # 10 premières lignes (défaut)
head -n 20 fichier.txt             # 20 premières lignes
head -c 100 fichier.txt            # 100 premiers octets

tail fichier.txt                   # 10 dernières lignes (défaut)
tail -n 20 fichier.txt             # 20 dernières lignes
tail -c 100 fichier.txt            # 100 derniers octets
tail -f fichier.log                # suivre en temps réel
tail -F fichier.log                # suivre + réouvrir si rotation
```

### Lecture interactive

```bash
more fichier.txt                   # lecture page par page (basique)
# Espace : page suivante | Entrée : ligne suivante | q : quitter

less fichier.txt                   # lecture avancée
# Espace / PgDn : page suivante | PgUp : page précédente
# /motif : rechercher | n : occurrence suivante | N : précédente
# g : début | G : fin | q : quitter
# F : mode tail (temps réel) | Ctrl+C : quitter le mode tail

less +F fichier.log                # démarrer directement en mode tail
less +/motif fichier.txt           # démarrer à la première occurrence

# Options utiles de less
less -N fichier.txt                # avec numéros de ligne
less -S fichier.txt                # pas de wrapping des longues lignes
less -i fichier.txt                # recherche insensible à la casse
```

### Hexadécimal et binaire

```bash
xxd fichier.bin                    # dump hexadécimal + ASCII
xxd -l 64 fichier.bin             # 64 premiers octets seulement
xxd -c 8 fichier.bin              # 8 octets par ligne
od -x fichier.bin                  # dump octal/hexa (GNU coreutils)
hexdump -C fichier.bin             # format canonique

file fichier.bin                   # détecter le type de fichier
strings fichier.bin                # extraire les chaînes imprimables
strings -n 8 fichier.bin           # chaînes d'au moins 8 caractères
```

---

## Liens

```bash
# Lien symbolique (soft link)
ln -s /chemin/source /chemin/lien  # créer un lien symbolique
ln -sf /nouvelle/source lien       # forcer (écraser si existant)
ls -la                             # voir les liens (-> cible)
readlink lien                      # lire la cible du lien
readlink -f lien                   # cible absolue résolue

# Lien dur (hard link)
ln source.txt lien_dur.txt         # partage le même inode
# Contrainte : même système de fichiers, pas pour les répertoires

# Informations sur les inodes
ls -i fichier.txt                  # numéro d'inode
stat fichier.txt                   # infos complètes (inode, timestamps, etc.)
```

---

## Permissions et attributs

```bash
stat fichier.txt                   # permissions, taille, timestamps, inode
ls -l fichier.txt                  # format court des permissions

# Permissions spéciales
chmod u+s fichier                  # setuid (exécuter avec le uid du owner)
chmod g+s dossier                  # setgid (nouveaux fichiers héritent du groupe)
chmod +t /tmp                      # sticky bit (seul le owner peut supprimer)

# Notation symbolique
chmod u=rwx,g=rx,o= fichier        # définir précisément
chmod a+r fichier                   # tous : ajouter lecture (a = ugo)

# Attributs étendus (ext4)
chattr +i fichier                  # rendre immuable (même root)
chattr -i fichier                  # retirer l'immuabilité
chattr +a fichier                  # append only
lsattr fichier                     # lister les attributs

# ACL (Access Control Lists)
getfacl fichier                    # afficher les ACL
setfacl -m u:alice:rwx fichier     # donner rwx à alice
setfacl -m g:devs:rx fichier       # donner rx au groupe devs
setfacl -x u:alice fichier         # supprimer les ACL d'alice
setfacl -b fichier                 # supprimer toutes les ACL
setfacl -R -m u:alice:rx dossier/  # récursif
```

---

## Recherche de fichiers

```bash
find . -name "*.log"               # par nom (case-sensitive)
find . -iname "*.LOG"              # insensible à la casse
find . -type f                     # fichiers uniquement
find . -type d                     # répertoires uniquement
find . -type l                     # liens symboliques uniquement

find . -size +10M                  # > 10 Mo
find . -size -1k                   # < 1 Ko
find . -size +10M -size -100M      # entre 10 Mo et 100 Mo

find . -mtime -7                   # modifiés dans les 7 derniers jours
find . -mtime +30                  # modifiés il y a plus de 30 jours
find . -newer reference.txt        # plus récents que reference.txt
find . -atime -1                   # accédés dans les dernières 24h

find . -user alice                 # appartenant à alice
find . -group devs                 # appartenant au groupe devs
find . -perm 644                   # permissions exactes
find . -perm /u+x                  # ayant l'exécution pour l'owner

# Combiner et exécuter
find . -name "*.tmp" -delete                    # supprimer
find . -name "*.log" -exec gzip {} \;           # compresser chaque
find . -name "*.sh" -exec chmod +x {} \;        # rendre exécutables
find . -type f -name "*.txt" | xargs grep -l "motif"  # filtrer le contenu
find . -maxdepth 2 -name "config.yml"           # limiter la profondeur
```

---

## Comparaison de fichiers

```bash
diff fichier1.txt fichier2.txt     # différences ligne par ligne
diff -u fichier1.txt fichier2.txt  # format unifié (comme git diff)
diff -r dossier1/ dossier2/        # comparer des répertoires
diff -i fichier1.txt fichier2.txt  # insensible à la casse
diff -w fichier1.txt fichier2.txt  # ignorer les espaces

colordiff fichier1 fichier2        # diff coloré (si installé)
vimdiff fichier1 fichier2          # comparaison côte à côte dans vim
sdiff fichier1 fichier2            # comparaison côte à côte (texte)

cmp fichier1 fichier2              # comparer octet par octet (binaire)
md5sum fichier                     # empreinte MD5
sha256sum fichier                  # empreinte SHA-256
sha256sum -c checksums.txt         # vérifier une liste de checksums
```

---

## Système de fichiers

```bash
mount                              # lister les points de montage
mount /dev/sdb1 /mnt/data          # monter un disque
mount -t ext4 /dev/sdb1 /mnt/data  # avec type explicite
mount -o ro /dev/sdb1 /mnt/data    # en lecture seule
mount -o remount,rw /              # remonter en lecture/écriture
umount /mnt/data                   # démonter
umount -l /mnt/data                # démonter en mode lazy

df -h                              # espace disque (human-readable)
df -hT                             # avec types de FS
du -sh dossier/                    # taille d'un dossier
du -sh * | sort -h                 # tailles triées
du -h --max-depth=1 /var           # tailles à 1 niveau de profondeur
du -ah dossier/ | sort -h | tail -20  # 20 plus gros éléments

lsblk -f                           # blocs avec FS et UUID
blkid                              # UUID et types de FS
findmnt                            # arborescence des montages
findmnt /home                      # info sur un point de montage

# /etc/fstab
UUID=xxxx /mnt/data ext4 defaults,noatime 0 2
# champ 5 : dump (0=non) | champ 6 : fsck order (0=skip, 1=root, 2=autres)
```

---

## Bonnes pratiques

- Utiliser `cp -a` pour préserver propriétaire, permissions et timestamps lors d'une copie.
- Toujours utiliser des guillemets autour des chemins contenant des espaces : `rm "mon fichier.txt"`.
- Préférer `less` à `more` — il est plus puissant et disponible sur tous les systèmes modernes.
- Vérifier les checksums SHA-256 des fichiers téléchargés avant toute installation.
- Utiliser `find … -print0 | xargs -0` pour gérer les noms de fichiers avec espaces.

```bash
# Exemple robuste avec xargs et noms de fichiers avec espaces
find . -name "*.log" -print0 | xargs -0 gzip

# Toujours tester find avant d'ajouter -delete ou -exec rm
find . -name "*.tmp"           # prévisualiser
find . -name "*.tmp" -delete   # supprimer seulement si OK
```
