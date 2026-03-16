## Introduction

[Calamares](https://calamares.io/) c'est quoi ? C'est l'installateur de la plupart des distributions basées Linux. Cette page, tel l'installateur, sera une sorte de guide, mis à jour au fur et à mesure de l'installation de l'infrastructure. Chaque étape sera détaillée dans une page dédiée. Évidemment, je détaille ici *mon infra homelab*: elle est à adapter à chacun !

### Disclaimer

Ce guide détaille notamment comment je construits mes infras. J'essaie autant que possible de respecter les bonnes pratiques *en l'atat actuel de mes connaissances*. SI vous avez des remarques ou suggestions, contactez moi :). 
J'essaierai d'éditer et d'actualiser ce site le plus régulièrement possible.

## L'infra physique

### Hardware

### Réseau

#### Segmentation

#### DNS

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

### Déploiement : semaphoreUI et komo.do

