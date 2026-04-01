---
title: "Commandes Linux"
description: "Cheat-sheet des commandes Linux courantes"
last_modified: 2026-04-01
---
# Linux - Commandes de base

---

### Naviguer dans les répertoires

```sh
cd /chemin/vers/dossier
```

Change le répertoire courant.

??? "Arguments principaux"
    - `..` : Remonte d'un niveau
    - `~` : Revient au répertoire personnel
    - `-` : Retourne au dernier répertoire visité
    - `/` : Racine du système de fichiers
    - Aucun argument : Va au répertoire personnel

---

### Lister le contenu d'un répertoire

```sh
ls -lah
```

Affiche les fichiers et dossiers.

??? "Arguments principaux"
    - `-l` : Format détaillé (long format)
    - `-a` : Inclut les fichiers cachés
    - `-h` : Affiche les tailles lisibles (Ko, Mo, Go)
    - `-R` : Récursif, affiche les sous-répertoires
    - `-t` : Trie par date de modification
    - `-S` : Trie par taille

---

### Afficher le répertoire courant

```sh
pwd
```

Affiche le chemin absolu du répertoire de travail actuel (*Print Working Directory*).

??? "Arguments principaux"
    - Pas d'arguments courants
    - `-L` : Affiche les liens symboliques sous forme de liens
    - `-P` : Affiche le chemin physique (résout les liens)

---

### Créer un répertoire

```sh
mkdir -p /chemin/nouveau/dossier
```

Crée un ou plusieurs répertoires.

??? "Arguments principaux"
    - `-p` : Crée les répertoires parents manquants sans erreur
    - `-v` : Mode verbeux, affiche chaque répertoire créé
    - `-m 755` : Définit les permissions à la création

---

### Supprimer fichiers et répertoires

```sh
rm -rf /chemin/cible
```

Supprime fichiers et répertoires. ⚠️ Irréversible — à utiliser avec précaution.

??? "Arguments principaux"
    - `-r` : Récursif, supprime les répertoires et leur contenu
    - `-f` : Force la suppression sans confirmation
    - `-i` : Mode interactif, demande confirmation pour chaque fichier
    - `-v` : Mode verbeux, affiche les fichiers supprimés

---

### Copier fichiers et répertoires

```sh
cp -r source/ destination/
```

Copie un fichier ou un répertoire.

??? "Arguments principaux"
    - `-r` ou `-R` : Copie récursivement un répertoire entier
    - `-a` : Archive (préserve les permissions, propriétaires, liens)
    - `-v` : Mode verbeux, affiche les fichiers copiés
    - `-i` : Mode interactif, demande confirmation avant d'écraser
    - `-p` : Préserve les permissions et timestamps

---

### Déplacer ou renommer

```sh
mv ancien_nom nouveau_nom
```

Déplace un fichier ou répertoire vers une autre destination. Sert également à renommer en changeant uniquement le nom.

---

### Afficher le contenu d'un fichier

```sh
cat fichier.txt
```

Concatenè et affiche le contenu d'un ou plusieurs fichiers dans le terminal.

??? "Arguments principaux"
    - `-n` : Affiche les numéros de lignes
    - `-b` : Numérote uniquement les lignes non vides
    - `-A` : Affiche les caractères non imprimables
    - `-s` : Sépare les lignes vides consécutives par une seule

---

### Parcourir un fichier long

```sh
less fichier.log
```

Affiche le contenu d'un fichier de manière paginée et navigable.

??? "Arguments principaux"
    - `Space` : Page suivante
    - `b` : Page précédente
    - `g` : Debut du fichier
    - `G` : Fin du fichier
    - `/pattern` : Recherche
    - `q` : Quitter

---

### Afficher les dernières lignes d'un fichier

```sh
tail -f -n 100 fichier.log
```

Affiche les dernières lignes d'un fichier.

??? "Arguments principaux"
    - `-n 100` : Affiche les 100 dernières lignes
    - `-f` : Suit le fichier en temps réel (idéal pour les logs)
    - `-F` : Suit même si le fichier est renommé/recyclé
    - `-c 1000` : Affiche les 1000 derniers bytes
    - `+100` : Affiche à partir de la 100e ligne

---

### Rechercher dans des fichiers

```sh
grep -rn "motif" /chemin/
```

Recherche un motif (texte ou regex) dans des fichiers.

??? "Arguments principaux"
    - `-r` : Récursif, explore les sous-répertoires
    - `-n` : Affiche le numéro de ligne des correspondances
    - `-i` : Insensible à la casse
    - `-v` : Inverse, affiche les lignes qui ne correspondent PAS
    - `-l` : Affiche uniquement les noms de fichiers
    - `-c` : Compte le nombre de lignes correspondantes

---

### Trouver des fichiers

```sh
find /chemin -name "*.conf" -type f
```

Recherche des fichiers selon leur nom, type, taille, date de modification, permissions, etc.

??? "Arguments principaux"
    - `-name "pattern"` : Cherche par nom de fichier
    - `-type f` : Cherche uniquement les fichiers (d = répertoires)
    - `-size +100M` : Cherche par taille (+ = plus grand, - = plus petit)
    - `-mtime -7` : Modifié dans les 7 derniers jours
    - `-executable` : Fichiers exécutables
    - `-exec commande {} \;` : Exécute une commande sur les résultats

---

### Droits d'administration

```sh
sudo commande
```

Exécute une commande avec les privilèges superutilisateur.

??? "Arguments principaux"
    - `sudo -l` : Liste les commandes autorisées pour l'utilisateur
    - `sudo -i` : Lance un shell root interactif
    - `sudo -u user commande` : Exécute sous un autre utilisateur
    - `-S` : Lit le mot de passe depuis stdin
    - `NOPASSWD` : Permet d'exécuter sans mot de passe (sudoers)

---

### Changer les permissions d'un fichier

```sh
chmod 755 fichier.sh
```

Modifie les permissions d'accès (lecture, écriture, exécution) pour le propriétaire, le groupe et les autres.

??? "Arguments principaux"
    - `755` : rwx pour propriétaire, rx pour groupe et autres
    - `644` : rw pour propriétaire, r pour groupe et autres
    - `+x` : Ajoute l'exécution (notation symbolique)
    - `u=rw,g=r,o=r` : Définit explicitement les permissions
    - `-R` : Applique récursivement aux répertoires et contenu

---

### Changer le propriétaire d'un fichier

```sh
chown user:groupe fichier
```

Change le propriétaire et/ou le groupe d'un fichier ou répertoire.

??? "Arguments principaux"
    - `user:groupe` : Définit l'utilisateur et le groupe
    - `user` : Seul l'utilisateur
    - `:groupe` : Seul le groupe
    - `-R` : Applique récursivement aux répertoires
    - `-v` : Mode verbeux

---

### Gestion des processus

```sh
ps aux
```

Liste les processus en cours d'exécution.

??? "Arguments principaux"
    - `a` : Tous les utilisateurs
    - `u` : Format orienté utilisateur (CPU, mémoire)
    - `x` : Inclut les processus sans terminal
    - `-e` : Tous les processus
    - `-f` : Format complet avec arboresence
    - `--sort=-%cpu` : Trie par CPU descendant

---

### Moniteur de processus interactif

```sh
htop
```

Affiche les processus en temps réel avec utilisation CPU/RAM.

??? "Arguments principaux"
    - `F4` ou `\` : Filtre par nom
    - `F5` : Arborescence des processus
    - `F6` : Trier par une colonne
    - `F7` ou `,` : Augmente la priorité
    - `F8` ou `.` : Diminue la priorité
    - `F9` : Tue un processus

---

### Terminer un processus

```sh
kill -9 PID
```

Envoie un signal à un processus.

??? "Arguments principaux"
    - `-9` : SIGKILL, force la terminaison immédiate
    - `-15` : SIGTERM, demande une fermeture propre (défaut)
    - `-1` : SIGHUP, recharge le processus
    - `-STOP` : Suspend le processus
    - `-CONT` : Reprend l'exécution
    - `killall nom` : Cible par nom de processus

---

### Espace disque utilisé

```sh
df -h
```

Affiche l'utilisation de l'espace disque par partition.

??? "Arguments principaux"
    - `-h` : Affiche en unités lisibles (Ko, Mo, Go)
    - `-i` : Affiche l'utilisation des inodes
    - `-T` : Affiche le type de système de fichiers
    - `--total` : Affiche un total
    - `-B M` : Affiche en mégabytes

---

### Taille d'un répertoire

```sh
du -sh /chemin/
```

Calcule l'espace disque occupé par un fichier ou répertoire.

??? "Arguments principaux"
    - `-s` : Résumé total (sans détail des sous-dossiers)
    - `-h` : Tailles lisibles (Ko, Mo, Go)
    - `-a` : Affiche tous les fichiers, pas seulement les répertoires
    - `-d 1` : Profondeur 1 (1 niveau de détail)
    - `--max-depth=2` : Limite la profondeur d'affichage

---

### Télécharger un fichier

```sh
wget -O sortie.zip https://example.com/fichier.zip
```

Télécharge un fichier depuis une URL HTTP/HTTPS/FTP.

??? "Arguments principaux"
    - `-O` : Spécifie le nom de sortie
    - `-c` : Reprend un téléchargement interrompu
    - `-q` : Mode silencieux (pas d'affichage de progression)
    - `--limit-rate=500k` : Limite la bande passante
    - `-P chemin/` : Définit le répertoire de sortie

---

### Requêtes HTTP en ligne de commande

```sh
curl -sL https://api.example.com/endpoint
```

Transfère des données vers ou depuis un serveur. Supp orte HTTP, HTTPS, FTP, SFTP.

??? "Arguments principaux"
    - `-s` : Mode silencieux (pas de barre de progression)
    - `-L` : Suit les redirections
    - `-X POST` : Définit la méthode HTTP (GET, POST, PUT, DELETE)
    - `-d 'data'` : Envoie des données
    - `-H 'Header: value'` : Ajoute un entête
    - `-o fichier` : Sauvegarde la réponse dans un fichier

---

### Connexion distante sécurisée

```sh
ssh user@host -p 22
```

Établit une connexion chiffrée à un serveur distant.

??? "Arguments principaux"
    - `-p 22` : Port SSH (22 par défaut)
    - `-i clé_rsa` : Fichier de clé privée
    - `-v` : Mode verbeux pour débogage
    - `-L 8080:localhost:8080` : Port forwarding local
    - `-R 8080:localhost:8080` : Port forwarding distant
    - `-X` : Active le X11 forwarding (GUI distante)

---

### Copie distante sécurisée

```sh
scp -r user@host:/distant/chemin /local/destination
```

Copie des fichiers entre machines via SSH.

??? "Arguments principaux"
    - `-r` : Récursif, pour les répertoires
    - `-p` : Préserve les permissions et timestamps
    - `-P port` : Définit le port SSH
    - `-v` : Mode verbeux
    - Syntaxe : `scp [source] [destination]` (local ou distant)

---

### Synchronisation incrémentale de fichiers

```sh
rsync -avz --progress source/ user@host:/destination/
```

Synchronise des fichiers localement ou à distance, ne transférant que les différences.

??? "Arguments principaux"
    - `-a` : Mode archive (permissions, timestamps, liens)
    - `-v` : Verbeux, affiche les fichiers transférés
    - `-z` : Compression pendant le transfert
    - `--progress` : Affiche la barre de progression
    - `--delete` : Supprime les fichiers absents de la source
    - `-e ssh` : Utilise SSH comme transport

---

### Gestionnaire de paquets (Debian/Ubuntu)

```sh
apt update && apt upgrade -y
```

Met à jour la liste des paquets puis installe les mises à jour disponibles.

??? "Arguments principaux"
    - `update` : Met à jour la liste des paquets
    - `upgrade` : Installe les mises à jour
    - `install paquet` : Installe un paquet
    - `remove paquet` : Désinstalle un paquet
    - `-y` : Répond "oui" automatiquement
    - `search terme` : Cherche un paquet

---

### Gestion des services systemd

```sh
systemctl status|start|stop|restart|enable nom.service
```

Contrôle les services système avec systemd.

??? "Arguments principaux"
    - `status` : Affiche l'état du service
    - `start` : Démarre le service
    - `stop` : Arrête le service
    - `restart` : Redémarre le service
    - `enable` : Active au démarrage
    - `disable` : Désactive au démarrage

---

### Voir les logs système

```sh
journalctl -u service -f --since "1 hour ago"
```

Consulte les journaux systemd.

??? "Arguments principaux"
    - `-u service` : Filtre par unité de service
    - `-f` : Suit en temps réel (tail)
    - `--since "1 hour ago"` : Depuis une date/heure donnée
    - `--until` : Jusqu'à une date/heure
    - `-n 50` : Affiche les 50 dernières lignes
    - `-p err` : Filtre par niveau (err, warning, info, debug)

---

### Variables d'environnement et alias

```sh
export MA_VARIABLE="valeur"
```

Définit ou exporte une variable d'environnement pour le shell courant et ses processus enfants.

??? "Arguments principaux"
    - `export` : Rend la variable accessible aux processus enfants
    - `$MA_VARIABLE` : Récupère la valeur
    - `alias nom='commande'` : Crée un alias de commande
    - `alias` : Liste tous les alias
    - `unalias nom` : Supprime un alias
    - `env` : Liste toutes les variables d'environnement

---

### Historique des commandes

```bash
history | grep "commande"
```

Affiche l'historique des commandes saisies.

??? "Arguments principaux"
    - `!!` : Réexécute la dernière commande
    - `!n` : Exécute la commande à l'index n
    - `!-5` : Exécute l'avant-dernière commande (5 positions en arrière)
    - `Ctrl+R` : Recherche interactive dans l'historique
    - `history -c` : Efface l'historique
    - `export HISTSIZE=10000` : Augmente la taille de l'historique