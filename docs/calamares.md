---
title: "Guide d'installation homelab"
description: "Guide complet d'installation infrastructure personnalisée"
last_modified: 2026-08-14
tags:
  - homelab
  - installation
  - linux
  - infrastructure
---

## Introduction

[Calamares](https://calamares.io/) c'est quoi ? C'est l'installateur de la plupart des distributions basées Linux. Cette page, tel l'installateur, sera une sorte de guide, mis à jour au fur et à mesure de l'installation de l'infrastructure. Chaque étape sera détaillée dans une page dédiée. Évidemment, je détaille ici *mon infra homelab*: elle est à adapter à chacun !

### Disclaimer

Ce guide détaille notamment comment je construits mes infras. J'essaie autant que possible de respecter les bonnes pratiques *en l'atat actuel de mes connaissances*. Si vous avez des remarques ou suggestions, contactez moi :). Le but ultime est de tendre, autant que possible, vers les normes [ANSSI-BP-028](https://messervices.cyber.gouv.fr/guides/en-configuration-recommendations-gnulinux-system) et la conformité [CIS-1/2](https://www.cisecurity.org/cis-benchmarks).

## L'infra physique

### Hardware

J'utilise personnellement des Ryzen de génération 3 à 5, sous DDR4 ainsi qu'un raspberry pi 4 pour Home Assistant. Ce dernier gagne à avoir le wifi et bluetooth directement sur l'appareil et une version de l'OS est dédié à cette machine qui, en plus, ne consomme pratiquement rien.

!!! warning "Coûts d'achats vs entretien"

    Il peut être tentant de récupérer d'ancien serveurs pro, basés sur des Xéon le plus souvent. Bien que l'offre puisse sembler alléchante, ce genre de machines consomme *énormément* plus que des CPU bas de gamme modernes pour les mêmes tâches, en plus du bruit incroyable que produisent ces machines. C'est, généralement, une plutôt mauvaise idée. Des CPU légers, modernes, peuvent souvent faire mieux.

Je dispose actuellement de trois serveurs, ce qui me permet de bénéficier de tous les avantages de la virtualisation (Haute disponibilité, stockage éclaté ...)

### [Le réseau](reseau/intro.md)

[Le réseau](reseau/intro.md) va nous permettre de connecter et discriminer efficacement nos services et machines. Il est primordial de comprendre les implications d'un port ouvert, un réseau mal configuré est une porte ouverte sur nos machines.

#### [Segmentation](reseau/vlan.md)

La segmentation du réseau consistera à créer les vlans, assigner ces derniers et définir les routes qui seront permises ou exclues. C'est ici que se retrouvent la plupart des règles édictées par l'ANSSI.

#### [DNS](reseau/dns.md)

Pour les DNS, j'utilise [Technitium](reseau/dns.md). Il dispose d'un exporter prometheus, laisse le choix de la base de données utilisée et accepte sans consommation des milliers de requêtes par heures. Il me permet de faire du DoT, DoH ou même du Split-DNS.

#### Exposer ses services : WAF et reverse-proxy

## [Virtualisation](virtu/intro.md)

### Proxmox

### Stockage

#### CEPH

#### NAS

### Premières VM et LXC

Une fois le réseau prêt et PVE configuré, on peut créer nos [premières machines virtuelles](virtu/vminstall.md) et nos [premières LXC](virtu/lxcinstall.md) sous Debian.

!!! warning "Bonnes pratiques"

    Une machine fraichement installée est vulnérable. On pense donc à [la configurer](virtu/serverconfig.md) *avant toute autre chose* !

### Cloud Init

## Le management

### Le bastion (relais-ssh)

### La PKI

### [Gitlab](services/gitlab/install.md)

Une fois la PKI prête, on passe au repository git. Celui-ci sera notre *source de vérité* versionnée. C'est là qu'on stockera les scripts, playbooks, fichiers de configuration, ...

### Déploiement : OpenSible et komo.do

