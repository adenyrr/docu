---
title: "Serveur DNS autoritaire"
description: "DNS autoritaire local avec blackhole et logging"
last_modified: 2026-05-29
---

## Introduction

### Avant-propos

L'une des premières choses à mettre en place dans un réseau est un serveur DNS, pour Domain Name Server ou *serveur de nom de domaine*. Ce service servira à *traduire* les noms de domaines en adresse IP utilisable par le matériel réseau. Par défaut les DNS utilisés sont généralement ceux du FAI, en clair, et représentent donc une fuite de donnée potentielle. De plus, les DNS peuvent être *menteurs* (un domaine redirigeant sur un autre) et ne sont pas administrables. Avoir son DNS c'est s'assurer de faire la résolution *où on le souhaite*, et de pouvoir y appliquer ses propres règles y compris pour du filtrage.

<figure markdown="span">
  ![Header](/assets/reseau/technitium.png)
</figure>

### C'est quoi ?

[TechnitiumDNS](https://technitium.com/dns/) est un serveur DNS de qualité professionnelle et prenant en charge la majorité des protocoles DNS.

!!! quote "Elle se défini elle-même par :"

    Technitium DNS Server est un serveur DNS de référence et récursif open source qui permet d'héberger soi-même un serveur DNS pour garantir la confidentialité et la sécurité.


### Avantages & inconvénients

=== "Avantages"

    * Très léger, avec une faible empreinte mémoire
    * Serveur DNS authoritaire : possibilité de création de zones DNS complètes
    * Prends en charge nativement la plupart des protocoles DNS, y compris chiffrés
    * Extensible, OIDC, HA ... Résolument tourné pour un usage pro

=== "Inconvénients"

    * Moins clef-en-main qu'un adguard, plus complexe à prendre en main
    * Fouiller les logs peut être un peu fastidieux
    * Ne gère pas les certificats par défaut : plus de configuration à faire

### Alternatives

- AdGuard : Très utilisé mais peine avec de gros volumes de requêtes ou de logs.
- PiHole : Souvent utilisé en homelab, il ne prend pas en charge les protocoles chiffrés (DoT, DoH, DoQ, ...)
- Blocky, AdAway, ...


## Installation

### Prérequis

Une LXC ou une machine virtuelle, qui ne servira QUE pour ça, très légère (512 Mo de DDR, 50% d'un CPU et 16 Go de stockage suffiront) sous debian, et quelques paquets utilitaires :

```sh
apt-get update && apt-get install -y curl gpg ca-certificates jq openssl
```

Pour une sécurité accrue, cette machine aura son propre vlan, indépendant de l'infra ou des services.

Evidemment, les bonnes pratiques sont toujours d'application ici. On pense donc à hardener le système (restriction SSH, ...).

### Méthode recommandée : bare-metal

??? question "Pourquoi ?"

    C'est la méthode recommandée par l'équipe de développement. De plus, dans le cas d'un DNS, on veut réduire au maximum la latence, notamment celle induite par un réseau docker en plus. Enfin, l'usage de l'UDP ou du Quic est plus simple et rapide directement sur le réseau hôte.

!!! warning "firewall"

    On veillera toutefois à avoir un firewall solide et configuré, restreindre l'interface en local et n'ouvrir que les ports nécéssaires.

Une fois la LXC créée et configurée, on installe simplement techniciumDNS via le script fourni par les devs :

```sh
curl -sSL https://download.technitium.com/dns/install.sh | sudo bash
```
On se connecte ensuite sur http://IP:5380 avec `admin`:`admin` et on change immédiatement le mot de passe par défaut. Ensuite, on crée un nouvel user, on le dote des privilèges administrateur, et on se connecte sur cet user nouvellement crée. Enfin, on peut supprimer l'utilisateur `admin` par défaut. On configure l'OIDC avec Authentik.

## Configuration

Le système répond déjà aux requêtes sur IP:53, donc à ce stade, renseigner l'IP de la machine comme serveur DNS principal sur opnsense, ubiquiti, windows ou les serveurs proxmox fonctionnera. Ceci dit, une configuration plus poussée renforcera la via privée et les fonctionnalités de notre serveur DNS.

### Créer une zone DNS

Une zone permet d'ajouter des domaines interne et de leur assigner des champs, exactement comme le ferait un fournisseur de domaine en ligne, mais local.

On va dans `Zones > Add zone` puis on assigne un domaine. Pour un domaine purement local on préfèrera `.internal` comme tld. Deux champs (`NS` et `SOA`) sont créés par défaut. Il suffit d'ajouter des champs A (adresse IPv4) vers les adresses IP internes pour faire correspondre les domaines à ces IP.

### Installation d'un certificat

```sh
# DNS chez Cloudflare
apt install python3-venv -y
python3 -m venv /opt/certbot-env
/opt/certbot-env/bin/pip install certbot certbot-dns-cloudflare "cloudflare>=3.0"

# Créer le fichier de credentials
mkdir /root/.secrets
echo "dns_cloudflare_api_token = CHANGE_ME" \
  > /root/.secrets/cloudflare.ini
chmod 600 /root/.secrets/cloudflare.ini

# Obtenir un wildcard (couvre tous les sous-domaines)
/opt/certbot-env/bin/certbot certonly \
  --dns-cloudflare \
  --dns-cloudflare-credentials /root/.secrets/cloudflare.ini \
  -d "dns.domain.tld"

# Il renverra : `Certificate is saved at: /etc/letsencrypt/live/dns.domain.tld/fullchain.pem` ainsi que `Key is saved at: /etc/letsencrypt/live/dns.domain.tld/privkey.pem`

# Convertir en .pfx
mkdir /etc/technitium
openssl pkcs12 -export \
  -out /etc/technitium/cert.pfx \
  -inkey /etc/letsencrypt/live/dns.domain.tld/privkey.pem \
  -in /etc/letsencrypt/live/dns.domain.tld/fullchain.pem \
  -passout pass:changeme

# Enfin, on règle les droits :
sudo chown root:dns-server /etc/technitium/cert.pfx
sudo chmod 640 /etc/technitium/cert.pfx
```
Une fois le certificat créé, il suffit d'ajouter le chemin `/etc/technitium/cert.pfx` dans la configuration de technitium. Il detecte et recharge le certificat sans devoir reboot : on peut activer la console web HTTPS ainsi que les protocoles utilisant le chiffrement (DoT, DoH, ...)

### Activer le logging

Pour activer les logs et naviguer dedans, on installe l'application SQlite (`Apps > New App`). On peut modifier les valeurs en changeant le fichier de configuration (`Config `) :

```json
{
  "enableLogging": true,
  "maxQueueSize": 200000,
  "maxLogDays": 120,
  "maxLogRecords": 1000000,
  "enableVacuum": false,
  "useInMemoryDb": false,
  "sqliteDbPath": "querylogs.db",
  "connectionString": "Data Source='{sqliteDbPath}'; Cache=Shared;"
}
```

Ensuite, dans `Settings > Logging` on active le paramètre `console` ou `file and console`. Ce dernier permet l'export par la suite de journaux complets.

Pour plus de logs ou les garder plus longtemps, une base de données de type PostgreSQL sera préférable.

### Utiliser le DoT sur Android

Par défaut, les versions récentes d'Android supportent un serveur DNS distant uniquement en DoT (DNS over TLS). Technitium est nativement compatible : une fois un certificat installé, il suffit d'activer le protocole ainsi qu'un port (853 standard).
Dans le routeur, ajouter une règle WAN pour les connexions entrantes vers l'IP interne du DNS (WAN:853 --> IPDNS:853). Autoriser également les récursions pour les connexions externes dans le menu `Settings > Recursion`.

Enfin, utiliser le domaine choisi (ex: dns.domain.tld) pour le certificat (donc un domaine enregistré avec un sous-domaine pointant vers l'IP publique) dans android, sans sheme : `dns.domain.tld`.

Android devrait alors utiliser ce serveur DNS, et uniquement celui-ci. Vérifier dans les logs, en selectionnant le protocole TLS.

### Utilisation du split-dns

Le split-dns permet de modifier les champs renvoyés lors d'une requête, en fonction de son origine.

On installe d'abord l'app via `Apps > App Store` et on trouve `Split Horizon`. 
Une fois installé, on modifie les champs A d'une zone locale en champ APP. L'APP Name est `Split Horizon` et le PATH est `SimpleAddress`.
En lieu et place de l'IPv4 du champ A, on modifie le json déjà présent, en respectant le format:

```json
{
  "public": [
    "1.1.1.1",
    "2.2.2.2"
  ],
  "private": [
    "192.168.1.1",
    "::1"
  ]
}
```

### Utilisation de QUIC et HTTP/3

```sh
wget https://packages.microsoft.com/config/debian/13/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
rm packages-microsoft-prod.deb
sudo apt update
sudo apt install libmsquic
```

Quic est alors installé et on peut se rendre sur la console d'administration de Technitium, puis activer QUIC et HTTP/3, respectivement sur les ports 853 et 443. Il suffira ensuite de les configurer et de les activer dans le reverse-proxy qui va fournir les terminaisons.

