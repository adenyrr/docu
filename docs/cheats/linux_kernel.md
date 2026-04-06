# Linux — Cheat Sheet : Kernel & Système

> Référence rapide pour systemd, journald, dmesg, modules noyau, performances et sécurité système.

---

## systemd — Gestion des services

### Contrôle des services

```bash
systemctl start nginx              # démarrer
systemctl stop nginx               # arrêter
systemctl restart nginx            # redémarrer
systemctl reload nginx             # recharger la configuration (sans downtime)
systemctl status nginx             # état du service

systemctl enable nginx             # activer au démarrage
systemctl disable nginx            # désactiver au démarrage
systemctl enable --now nginx       # activer ET démarrer immédiatement
systemctl disable --now nginx      # désactiver ET arrêter

systemctl is-active nginx          # vérifier si actif (exit code 0/1)
systemctl is-enabled nginx         # vérifier si activé au boot
systemctl is-failed nginx          # vérifier si en erreur
```

### Inspection des services

```bash
systemctl list-units --type=service          # services chargés
systemctl list-units --type=service --all    # tous (inactifs compris)
systemctl list-units --failed                # services en échec
systemctl list-unit-files --type=service     # tous les fichiers d'unité

systemctl show nginx                         # propriétés détaillées
systemctl cat nginx                          # afficher le fichier unit
systemctl edit nginx                         # surcharger (drop-in)
systemctl edit --full nginx                  # modifier le fichier complet

systemctl daemon-reload                      # recharger après modification d'un unit
systemctl reset-failed                       # réinitialiser les unités en erreur
```

### Cibles (targets) et boot

```bash
systemctl get-default                        # target par défaut
systemctl set-default multi-user.target      # définir la target par défaut
systemctl isolate rescue.target              # basculer en mode rescue
systemctl isolate graphical.target           # basculer en mode graphique

systemctl reboot                             # redémarrer
systemctl poweroff                           # éteindre
systemctl suspend                            # mettre en veille
systemctl hibernate                          # hiberner

systemctl list-dependencies nginx            # dépendances d'un service
systemctl list-dependencies --reverse nginx  # qui dépend de nginx
```

### Fichiers unit personnalisés

```ini
# /etc/systemd/system/mon-service.service
[Unit]
Description=Mon service personnalisé
After=network.target
Requires=docker.service

[Service]
Type=simple
User=appuser
WorkingDirectory=/opt/mon-app
ExecStart=/opt/mon-app/start.sh
ExecReload=/bin/kill -HUP $MAINPID
Restart=on-failure
RestartSec=5s
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

!!! tip "Drop-in override"
    Utiliser `systemctl edit nginx` pour créer un fichier dans `/etc/systemd/system/nginx.service.d/override.conf` sans modifier le fichier d'origine.

---

## journald — Logs système

### Consultation des logs

```bash
journalctl                         # tous les logs
journalctl -b                      # logs du boot actuel
journalctl -b -1                   # logs du boot précédent
journalctl --list-boots            # liste des boots disponibles

journalctl -u nginx                # logs d'un service
journalctl -u nginx -u php-fpm     # logs de plusieurs services
journalctl -f                      # suivre en temps réel (tail -f)
journalctl -f -u nginx             # temps réel pour nginx

journalctl -n 50                   # 50 dernières lignes
journalctl -n 50 -u nginx          # 50 dernières de nginx
journalctl --since "1 hour ago"    # depuis 1h
journalctl --since "2024-01-01" --until "2024-01-02"
journalctl --since today
journalctl --since yesterday
```

### Filtrage des logs

```bash
journalctl -p err                  # erreurs uniquement
journalctl -p warning..err         # de warning à err
# Niveaux : emerg, alert, crit, err, warning, notice, info, debug

journalctl _PID=1234               # logs d'un PID
journalctl _UID=1000               # logs d'un utilisateur
journalctl _SYSTEMD_UNIT=nginx.service

journalctl -k                      # logs noyau uniquement (= dmesg)
journalctl -t sshd                 # par identifiant syslog

journalctl -o json                 # sortie JSON
journalctl -o json-pretty          # JSON formaté
journalctl -o short-precise        # avec microsecondes
journalctl -o cat                  # messages seuls (sans métadonnées)
```

### Gestion des logs

```bash
journalctl --disk-usage            # espace disque utilisé
journalctl --vacuum-size=500M      # limiter à 500 Mo
journalctl --vacuum-time=30d       # supprimer les logs > 30 jours
journalctl --verify                # vérifier l'intégrité des logs

# Configuration : /etc/systemd/journald.conf
# SystemMaxUse=500M
# MaxRetentionSec=1month
```

---

## dmesg — Messages noyau

```bash
dmesg                              # tous les messages noyau
dmesg -H                           # format human-readable avec couleurs
dmesg -T                           # avec timestamps lisibles
dmesg -w                           # suivre en temps réel
dmesg -l err,crit                  # filtrer par niveau
dmesg | grep -i error              # filtrer par mot-clé
dmesg | grep -i usb                # events USB
dmesg | grep -i eth                # events réseau
dmesg | grep -i sda                # events disque
dmesg | tail -50                   # 50 derniers messages
dmesg -c                           # afficher ET vider le buffer (root)
```

---

## Modules noyau

```bash
lsmod                              # modules chargés
modinfo module_name                # infos sur un module
modprobe module_name               # charger un module (+ dépendances)
modprobe -r module_name            # décharger un module
insmod /path/module.ko             # charger sans gestion des dépendances
rmmod module_name                  # décharger (sans dépendances)

# Chargement automatique au boot
echo "module_name" >> /etc/modules-load.d/custom.conf

# Blacklister un module
echo "blacklist nouveau" >> /etc/modprobe.d/blacklist.conf
update-initramfs -u                # mettre à jour initramfs après
```

---

## Performances et monitoring

### CPU et mémoire

```bash
top                                # moniteur interactif
htop                               # version améliorée
atop                               # avec historique disque/réseau

uptime                             # charge système (load average)
vmstat 1 10                        # stats VM toutes les secondes (10x)
# procs, mémoire, swap, I/O, système, CPU

sar -u 1 5                         # utilisation CPU (sysstat)
sar -r 1 5                         # utilisation mémoire
sar -b 1 5                         # I/O disque
sar -n DEV 1 5                     # stats réseau

mpstat -P ALL 1                    # par cœur CPU
pidstat 1                          # par processus
pidstat -d 1                       # I/O par processus
```

### Disques et I/O

```bash
iostat -x 1                        # stats I/O détaillées
iostat -xz 1 5                     # sans les devices inactifs

iotop                              # I/O par processus (root)
iotop -o                           # uniquement les actifs

lsblk                              # arborescence des blocs
lsblk -f                           # avec systèmes de fichiers
blkid                              # UUID et types de FS

hdparm -I /dev/sda                 # infos SATA du disque
hdparm -tT /dev/sda                # benchmark lecture

smartctl -a /dev/sda               # santé S.M.A.R.T.
smartctl -t short /dev/sda         # test court S.M.A.R.T.
```

### Mémoire

```bash
free -h                            # RAM et swap
cat /proc/meminfo                  # infos détaillées /proc

# Vider les caches (attention en production)
sync && echo 3 > /proc/sys/vm/drop_caches
# 1 = pagecache, 2 = dentries/inodes, 3 = les trois

swapon --show                      # partitions swap actives
swapoff /dev/sda2                  # désactiver le swap
swapon /dev/sda2                   # activer le swap
```

---

## sysctl — Paramètres noyau

```bash
sysctl -a                          # tous les paramètres
sysctl vm.swappiness               # lire un paramètre
sysctl -w vm.swappiness=10         # modifier temporairement
sysctl -p                          # appliquer /etc/sysctl.conf
sysctl -p /etc/sysctl.d/custom.conf

# Persistance : /etc/sysctl.d/99-custom.conf
net.ipv4.ip_forward = 1            # activer le routage IP
vm.swappiness = 10                 # réduire l'usage du swap
net.core.somaxconn = 65535         # connexions en attente max
fs.file-max = 2097152              # limite de fichiers ouverts
kernel.panic = 10                  # reboot auto après kernel panic (10s)
```

---

## Démarrage et boot

```bash
systemd-analyze                    # temps de boot total
systemd-analyze blame              # temps par service (tri décroissant)
systemd-analyze critical-chain     # chemin critique du boot
systemd-analyze plot > boot.svg    # graphique SVG du boot

# GRUB
update-grub                        # régénérer /boot/grub/grub.cfg (Debian)
grub2-mkconfig -o /boot/grub2/grub.cfg  # (RedHat)
grub-install /dev/sda              # réinstaller GRUB

# Noyaux disponibles
dpkg --list | grep linux-image     # Debian/Ubuntu
rpm -qa | grep kernel              # RedHat/CentOS
```

---

## Sécurité et audit

```bash
# Connexions et authentification
last                               # historique des connexions
lastb                              # tentatives échouées
lastlog                            # dernière connexion par utilisateur
who                                # connectés en ce moment
w                                  # connectés + activité

# Audit système
auditctl -l                        # règles d'audit actives
ausearch -k fichier_sensible       # chercher par clé d'audit
aureport --auth                    # rapport d'authentification
aureport --failed                  # échecs

# Fichiers ouverts et sockets
lsof                               # tous les fichiers ouverts
lsof -u alice                      # par utilisateur
lsof -p 1234                       # par PID
lsof -i :80                        # par port
lsof -i TCP:22                     # connexions SSH
lsof +D /var/log                   # fichiers ouverts dans un dossier

# Limites système
ulimit -a                          # limites de la session courante
ulimit -n 65535                    # augmenter les fichiers ouverts
cat /proc/1234/limits              # limites d'un processus
```

---

## /proc et /sys

```bash
cat /proc/cpuinfo                  # informations CPU
cat /proc/meminfo                  # informations mémoire
cat /proc/version                  # version du noyau
cat /proc/uptime                   # durée de fonctionnement en secondes
cat /proc/loadavg                  # charge système
cat /proc/net/dev                  # statistiques réseau par interface
cat /proc/1234/cmdline             # ligne de commande d'un processus
cat /proc/1234/status              # statut d'un processus
ls -la /proc/1234/fd               # descripteurs de fichiers d'un processus

ls /sys/class/net/                 # interfaces réseau
cat /sys/block/sda/queue/rotational  # 0=SSD, 1=HDD
```

---

## Bonnes pratiques

- Ne jamais modifier `/proc` ou `/sys` directement sans comprendre l'impact — passer par `sysctl`.
- Tester les modifications de configuration systemd avec `systemd-analyze verify fichier.service`.
- Utiliser `journalctl --vacuum-size` régulièrement si `SystemMaxUse` n'est pas configuré dans `journald.conf`.
- Préférer `systemctl reload` à `restart` quand disponible pour éviter les interruptions de service.
- Surveiller les logs `dmesg` après toute opération matérielle (ajout RAM, disque, etc.).

```bash
# Vérifier un fichier unit avant de le charger
systemd-analyze verify /etc/systemd/system/mon-service.service

# Tester l'impact d'un paramètre sysctl sans l'écrire
sysctl -w net.ipv4.ip_forward=1   # temporaire, perdu au reboot
# Puis le persister seulement si le comportement est correct
echo "net.ipv4.ip_forward = 1" > /etc/sysctl.d/99-routing.conf
sysctl -p /etc/sysctl.d/99-routing.conf
```
