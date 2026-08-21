---
title: "Sécuriser serveur Debian"
description: "Bonnes pratiques essentielles configuration serveur"
last_modified: 2026-08-21
tags:
  - sécurité
  - debian
  - linux
  - adminsys
---

## Introduction

Un serveur a beau être extrêmement léger, et surtout debian sans aucun composant graphique, mais il n'en reste pas moins 'nu', et donc sans aucune mesure de protection mise en place. Voici une liste non-exhaustive de commandes ayant pour but d'augmenter la sécurité et la résilience des serveurs debian.

!!! warning "Bonnes pratiques"

    On insistera jamais assez sur les bonnes pratiques. Une bonne configuration faite dès le départ évite énormément de problèmes par la suite, et évite des risques inutiles liés à la sécurité. Bien qu'aucune infra ne soit complètement inviolable, le respect de ces bonnes pratiques permet de limiter les risques et assurer, autant que possible, la continuité de l'infrastructure.

## Avant quoi que ce soit !

- [x] On vérifie l'IP, le vlan et la connectivité
- [x] On met à jour la liste des paquets
- [x] On installe TOUTES les mises à jour
- [x] On reboot et on se connecte sur une machine avec un kernel à jour

```bash
apt update && apt full-upgrade -y
apt autoremove --purge -y
reboot
```

## Configuration

### users et sudo

sudo sert à lancer une commande en tant qu'un autre utilisateur (souvent le root). Ça permet de lancer en root uniquement les commandes qui ont besoin d'un tel accès.

On crée d'abord un utilisateur non-root :

```bash
adduser <USER>
```
Puis on installe `sudo`

```bash
apt install -y sudo
```
Pour ajouter un utilisateur au groupe 'sudoers' :

```bash
usermod -aG sudo <USER>
```

### Mises à jour critiques

On active les mises à jour automatiques *de sécurité* uniquement.

```bash
apt install -y unattended-upgrades apt-listchanges
dpkg-reconfigure -plow unattended-upgrades
```

### ufw

Ufw est un firewall qui va bloquer les connexions entrantes sur l'ensemble des ports, sauf ceux définis.

```bash
apt install -y ufw
```
!!! warning "Configuration : allow ssh"

    Il est *INDISPENSABLE* d'autoriser le traffic ssh, sans quoi la connexion se rompera et le serveur sera injoignable par cette voie.

On restreint le traffic entrant, autorise le traffic sortant par défaut, on autorise ssh (22/tcp) et on active le pare-feu.

```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw enable
```
Usage : `ufw allow <port>/<protocole>` (Ex: `ufw allow 53/tcp` pour un serveur DNS non chiffré)

### Fail2Ban

Fail2Ban permet de bannir une adresse IP après un nombre défini de tentatives de connexion échouées.

```bash
apt install -y fail2ban
```
Puis on crée le répertoire et le fichier de configuration ...

```bash
mkdir /etc/fail2ban
touch /etc/fail2ban/jail.local
nano /etc/failt2ban/jail.local
```
... et on le peuple. (ban si 3 essais infructueux en 10 min)
```bash
[sshd]
enabled = true
maxretry = 3 #nombre d'essais
bantime  = 24h #durée du ban
findtime = 10m #durée d'écoute des essais
```

### root-ca

Comme on a une PKI, on installe la root-ca pour que le serveur fasse confiance à notre autorité de certification.

```bash
wget https://<acme>.<domain>.<tld>/roots \
     --no-check-certificate \
     -O /usr/local/share/ca-certificates/mkhome-root-ca.crt
```
Les variables sont à modifier en fonction du serveur qui sert la PKI. Ensuite, on ajoute le certificat au store.

```bash
update-ca-certificates
```

### chrony

Avec le temps, l'horloge d'un CPU virtualisé peut prendre du retard sur le *temps universel*. Un moyen de contourner cette dérive est d'utiliser `chrony`, avec un serveur local ou distant.

```bash
apt install -y chrony
systemctl enable --now chrony
```
On vérifie que chrony fonctionne :

```bash
chronyc tracking
```
Le fichier de configuration (avec les serveurs NTP à contacter) est `/etc/chrony/chrony.conf`.

J'utilise `pool.ntp.org` comme serveur NTP principal.
