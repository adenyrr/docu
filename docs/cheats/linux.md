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

Change le répertoire courant. `cd ..` remonte d'un niveau, `cd ~` revient au home, `cd -` retourne au dernier répertoire visité.

---

### Lister le contenu d'un répertoire

```sh
ls -lah
```

Affiche les fichiers et dossiers. `-l` en format détaillé, `-a` inclut les fichiers cachés, `-h` affiche les tailles lisibles (Ko, Mo, Go).

---

### Afficher le répertoire courant

```sh
pwd
```

Affiche le chemin absolu du répertoire de travail actuel (*Print Working Directory*).

---

### Créer un répertoire

```sh
mkdir -p /chemin/nouveau/dossier
```

Crée un ou plusieurs répertoires. `-p` crée également tous les parents manquants sans erreur si le chemin existe déjà.

---

### Supprimer fichiers et répertoires

```sh
rm -rf /chemin/cible
```

Supprime fichiers et répertoires. `-r` récursif, `-f` force sans confirmation. ⚠️ Irréversible — à utiliser avec précaution.

---

### Copier fichiers et répertoires

```sh
cp -r source/ destination/
```

Copie un fichier ou un répertoire. `-r` (ou `-R`) copie récursivement un répertoire entier avec son contenu.

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

Concatène et affiche le contenu d'un ou plusieurs fichiers dans le terminal. Pratique pour les fichiers courts.

---

### Parcourir un fichier long

```sh
less fichier.log
```

Affiche le contenu d'un fichier de manière paginée et navigable. Supérieur à `more` : permet de remonter avec les flèches.

---

### Afficher les dernières lignes d'un fichier

```sh
tail -f -n 100 fichier.log
```

Affiche les dernières lignes d'un fichier. `-n` spécifie le nombre de lignes, `-f` suit le fichier en temps réel (idéal pour les logs).

---

### Rechercher dans des fichiers

```sh
grep -rn "motif" /chemin/
```

Recherche un motif (texte ou regex) dans des fichiers. `-r` récursif, `-n` affiche le numéro de ligne, `-i` insensible à la casse.

---

### Trouver des fichiers

```sh
find /chemin -name "*.conf" -type f
```

Recherche des fichiers selon leur nom, type, taille, date de modification, permissions, etc. Très puissant avec des combinaisons de critères.

---

### Droits d'administration

```sh
sudo commande
```

Exécute une commande avec les privilèges superutilisateur. Demande le mot de passe de l'utilisateur courant (s'il est dans le groupe `sudo`).

---

### Changer les permissions d'un fichier

```sh
chmod 755 fichier.sh
```

Modifie les permissions d'accès (lecture, écriture, exécution) pour le propriétaire, le groupe et les autres. Supporte aussi la notation symbolique (`+x`, `u=rw`).

---

### Changer le propriétaire d'un fichier

```sh
chown user:groupe fichier
```

Change le propriétaire et/ou le groupe d'un fichier ou répertoire. `-R` applique le changement récursivement.

---

### Gestion des processus

```sh
ps aux
```

Liste les processus en cours d'exécution. `a` tous les utilisateurs, `u` format orienté utilisateur, `x` inclut les processus sans terminal.

---

### Moniteur de processus interactif

```sh
htop
```

Affiche les processus en temps réel avec utilisation CPU/RAM. Interface interactive permettant de tuer, filtrer et trier les processus.

---

### Terminer un processus

```sh
kill -9 PID
```

Envoie un signal à un processus. `-9` (SIGKILL) force la terminaison immédiate. `killall nom` cible par nom de processus.

---

### Espace disque utilisé

```sh
df -h
```

Affiche l'utilisation de l'espace disque par partition (*Disk Free*). `-h` affiche en unités lisibles (Ko, Mo, Go).

---

### Taille d'un répertoire

```sh
du -sh /chemin/
```

Calcule l'espace disque occupé par un fichier ou répertoire. `-s` résumé total, `-h` tailles lisibles. `du -sh *` liste tous les éléments du dossier courant.

---

### Télécharger un fichier

```sh
wget -O sortie.zip https://example.com/fichier.zip
```

Télécharge un fichier depuis une URL HTTP/HTTPS/FTP. `-O` spécifie le nom de sortie, `-c` reprend un téléchargement interrompu.

---

### Requêtes HTTP en ligne de commande

```sh
curl -sL https://api.example.com/endpoint
```

Transfère des données vers ou depuis un serveur. Supporte HTTP, HTTPS, FTP, SFTP. Indispensable pour tester des APIs et scraper du contenu.

---

### Connexion distante sécurisée

```sh
ssh user@host -p 22
```

Établit une connexion chiffrée à un serveur distant. Supporte la redirection de ports, la copie de clés (`ssh-copy-id`) et le tunneling.

---

### Copie distante sécurisée

```sh
scp -r user@host:/distant/chemin /local/destination
```

Copie des fichiers entre machines via SSH. `-r` pour les répertoires. Alternative moderne : `rsync` pour les transferts incrémentaux.

---

### Synchronisation incrémentale de fichiers

```sh
rsync -avz --progress source/ user@host:/destination/
```

Synchronise des fichiers localement ou à distance, ne transférant que les différences. `-a` archive, `-v` verbeux, `-z` compression.

---

### Gestionnaire de paquets (Debian/Ubuntu)

```sh
apt update && apt upgrade -y
```

Met à jour la liste des paquets puis installe les mises à jour disponibles. `apt install paquet` installe, `apt remove paquet` désinstalle.

---

### Gestion des services systemd

```sh
systemctl status|start|stop|restart|enable nom.service
```

Contrôle les services système avec systemd. `enable` active au démarrage, `disable` désactive, `is-active` vérifie l'état.

---

### Voir les logs système

```sh
journalctl -u service -f --since "1 hour ago"
```

Consulte les journaux systemd. `-u` filtre par unité, `-f` suit en temps réel, `--since` et `--until` filtrent par période.

---

### Variables d'environnement et alias

```sh
export MA_VARIABLE="valeur"
```

Définit ou exporte une variable d'environnement pour le shell courant et ses processus enfants. `env` liste toutes les variables.

---

### Historique des commandes

```sh
history | grep "commande"
```

Affiche l'historique des commandes saisies. `!!` réexécute la dernière commande, `!n` celle à l'index `n`, `Ctrl+R` pour la recherche interactive.

---

*Tip : combiner ces commandes avec des pipes `|`, des redirections `>` / `>>`, et `xargs` démultiplie leur puissance.*