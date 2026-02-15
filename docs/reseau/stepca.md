## Introduction

### Avant-propos

Contrairement aux approches traditionnelles qui sécurisent principalement les entrées (pare-feu) et font confiance à tout ce qui est à l'intérieur, le Zero Trust part du principe que la menace peut être partout, y compris à l'intérieur du réseau. Dans cette optique, si un attaquant est *déjà* dans le réseau, il serait de bon ton que tout le traffic interne soit chiffré, y compris entre le proxy et les conteneurs: c'est ici que *step-ca* intervient en nous permettant de déployer une *Private Key Infrastruture* - PKI - avec renouvellement des certificats automatique et chiffrement mTLS entre les points d'exposition.

### C'est quoi ?

[Step-ca](https://smallstep.com/docs/step-ca/) est un ensemble d'utilitaire pour gérer et administrer une infrastructure de clefs privées automatisée.

!!! quote "Elle se défini elle-même par :"

    Step-ca est une autorité de certification (CA) en ligne qui permet une gestion sécurisée et automatisée des certificats X.509 et SSH. Il s'agit de l'équivalent serveur de step CLI. Il est sécurisé par TLS et offre plusieurs fournisseurs de certificats configurables, des modèles de certificats flexibles et des bases de données backend enfichables pour s'adapter à une grande variété de contextes et de flux de travail. 


### Avantages & inconvénients

=== "Avantages"

    * Chiffrement intégral des communications conteneurs-proxy
    * Le renouvellement des certificats SSL est automatique
    * Le mTLS (*mutual* TLS) tend à devenir le standard
    * On peut aussi générer des certificats SSH

=== "Inconvénients"

    * Malgré son aspect clef-en-main, les concepts de certificat sont complexes à prendre en main
    * Les certificats ne sont valides que localement
    * Le déploiement du mTLS augmente la complexité et la maintenabilité d'une infra

### Alternatives

L'alternative la plus courante est d'utiliser, plus simplement, des certificats Let's Encrypt mais elle ne permet plus de faire du mTLS.
  

## Installation

### Prérequis

Une LXC ou une machine virtuelle, qui ne servira QUE pour ça, très légère (512 Mo de DDR suffiront) sous debian, et quelques paquets utilitaires :

```sh
apt-get update && apt-get install -y --no-install-recommends curl gpg ca-certificates jq openssl
```

### Méthode recommandée : bare-metal

Sous debian (et dérivées), un mini-script disponible sur [le site de smallstep](https://smallstep.com/docs/step-ca/installation/) permet d'ajouter le dépôt officiel et d'installer la dernière version :

```sh
curl -fsSL https://packages.smallstep.com/keys/apt/repo-signing-key.gpg -o /etc/apt/keyrings/smallstep.asc
cat << EOF > /etc/apt/sources.list.d/smallstep.sources
Types: deb
URIs: https://packages.smallstep.com/stable/debian
Suites: debs
Components: main
Signed-By: /etc/apt/keyrings/smallstep.asc
EOF
apt-get update && apt-get -y install step-cli step-ca
```
On vérifie que tout est bien installé : `step version` qui devrait renvoyer : `Smallstep CLI/0.29.0 (linux/amd64)` (le numéro de version peut varier).


## Configuration et génération des certificats

On commence par initialiser notre PKI

!!! tip "Bonnes pratiques !"

    On crée un utilisateur dédié avec des permissions limitées : principe du moindre privilège. Jamais en root !

```sh
# Créer un utilisateur dédié
useradd -r -m -d /etc/step-ca -s /bin/bash step

# Initialiser la CA en tant qu'utilisateur step
su - step
export STEPPATH=/etc/step-ca

# Adapter les valeurs, évidemment
step ca init \
  --name="DOMAIN Internal CA" \
  --dns="acme.domain.internal" \
  --address=":443" \
  --provisioner="admin@domain.internal" \
  --password-file=<(echo "CHANGEZ_CE_MOT_DE_PASSE_FORT") \
  --remote-management

```
!!! danger "Password"

    Le mot de passe choisi DOIT rester secret. Si ce password est compris, c'est toute la PKI qui l'est !

La sortie devrait être du type :

```sh
Generating root certificate... done!
Generating intermediate certificate... done!

✔ Root certificate: /etc/step-ca/certs/root_ca.crt
✔ Root private key: /etc/step-ca/secrets/root_ca_key
✔ Root fingerprint: *REDACTED*
✔ Intermediate certificate: /etc/step-ca/certs/intermediate_ca.crt
✔ Intermediate private key: /etc/step-ca/secrets/intermediate_ca_key
badger 2026/02/15 12:07:15 INFO: All 0 tables opened in 0s
badger 2026/02/15 12:07:15 INFO: Storing value log head: {Fid:0 Len:30 Offset:2949}
badger 2026/02/15 12:07:15 INFO: [Compactor: 173] Running compaction: {level:0 score:1.73 dropPrefixes:[]} for level: 0
badger 2026/02/15 12:07:15 INFO: LOG Compact 0->1, del 1 tables, add 1 tables, took 10.672593ms
badger 2026/02/15 12:07:15 INFO: [Compactor: 173] Compaction for level: 0 DONE
badger 2026/02/15 12:07:15 INFO: Force compaction on level 0 done
✔ Database folder: /etc/step-ca/db
✔ Default configuration: /etc/step-ca/config/defaults.json
✔ Certificate Authority configuration: /etc/step-ca/config/ca.json
✔ Admin provisioner: admin@domain.internal (JWK)
✔ Super admin subject: step

Your PKI is ready to go. To generate certificates for individual services see 'step help ca'.
```

!!! danger "Logs"

    On note la root fingerprint et le mot de passe dans un endroit SECRET et sécurisé ! (Oui, encore ...)

Maintenant que notre PKI est prête, on va déployer ACME pour la génération automatique de certificats.

```sh
step ca provisioner add acme --type=ACME
```
Qui doit renvoyer :
```sh
✔ CA Configuration: /etc/step-ca/config/ca.json
Success! Your `step-ca` config has been updated. To pick up the new configuration SIGHUP (kill -1 <pid>) or restart the step-ca process.
```

On a un fichier de configuration disponible sur `/etc/step-ca/config/ca.json`. On va le modifier en utilisant la commande jq afin de fusionner deux fichiers en les concaténant.
On crée d'abord un fichier en plus :

```sh
cat > /etc/step-ca/config/ca.json.new << 'EOF'
{
  "root": "/etc/step-ca/certs/root_ca.crt",
  "federatedRoots": null,
  "crt": "/etc/step-ca/certs/intermediate_ca.crt",
  "key": "/etc/step-ca/secrets/intermediate_ca_key",
  "address": ":443",
  "dnsNames": [
    "acme.domain.internal"
  ],
  "logger": {
    "format": "text"
  },
  "db": {
    "type": "badgerv2",
    "dataSource": "/etc/step-ca/db",
    "badgerFileLoadingMode": "FileIO"
  },
  "authority": {
    "enableAdmin": true,
    "provisioners": []
  },
  "tls": {
    "cipherSuites": [
      "TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256",
      "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256",
      "TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384",
      "TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384",
      "TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256",
      "TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256"
    ],
    "minVersion": 1.2,
    "maxVersion": 1.3,
    "renegotiation": false
  }
}
EOF
```
On fusionne les deux, on supprime le doublon puis on relance la configuration du serveur ACME en modifiant les durées de certificat.
```sh
# Fusionner la configuration
jq -s '.[0] * .[1]' /etc/step-ca/config/ca.json /etc/step-ca/config/ca.json.new > /etc/step-ca/config/ca.json.tmp
```
```sh
mv /etc/step-ca/config/ca.json.tmp /etc/step-ca/config/ca.json
```
```sh
rm /etc/step-ca/config/ca.json.new
```
```sh
# Configuration des durées de certificats (28j par défaut, max 1 an)
step ca provisioner update acme --x509-default-dur=672h --x509-max-dur=8760h
```

On sort de l'utilisateur `step` avec `exit` pour créer le service systemd en root.

```sh
cat > /etc/systemd/system/step-ca.service << 'EOF'
[Unit]
Description=smallstep Certificate Authority
Documentation=https://smallstep.com/docs/step-ca
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=step
Group=step
Environment=STEPPATH=/etc/step-ca
WorkingDirectory=/etc/step-ca
ExecStart=/usr/bin/step-ca config/ca.json --password-file /etc/step-ca/secrets/password
Restart=on-failure
RestartSec=10
StandardOutput=append:/var/log/step-ca/output.log
StandardError=append:/var/log/step-ca/error.log

# Sécurité
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=full
ProtectHome=true
ReadWritePaths=/etc/step-ca/db

[Install]
WantedBy=multi-user.target
EOF
```
On crée ensuite le fichier de mot de passe, pour systemd (le même que pour la PKI, évidemment):
```sh
mkdir -p /etc/step-ca/secrets
echo "CHANGEZ_CE_MOT_DE_PASSE_FORT" > /etc/step-ca/secrets/password
chmod 600 /etc/step-ca/secrets/password
chown step:step /etc/step-ca/secrets/password
```
Un petit dossier de logs, on ajuste les permissions :
```sh
mkdir -p /var/log/step-ca
chown step:step /var/log/step-ca

chown -R step:step /etc/step-ca
chmod 700 /etc/step-ca/secrets
```
Enfin, on balance systemd :
```sh
systemctl daemon-reload
systemctl enable step-ca
systemctl start step-ca
systemctl status step-ca
```
La sortie devrait alors afficher :
```sh
* step-ca.service - smallstep Certificate Authority
     Loaded: loaded (/etc/systemd/system/step-ca.service; enabled; preset: enabled)
     Active: active (running) since 2026 UTC; 10s ago
        ...
```
