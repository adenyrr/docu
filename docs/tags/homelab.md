---
title: "Tag: homelab"
description: "Pages marquées "homelab""
last_modified: 2026-08-21T17:47:32.018181Z
---

# homelab

Nombre de pages : 6

- [Bienvenue](index.md) — Le but de cette documentation est de regrouper des informations, tutoriels et ressources utiles à propos du self-hosting et de l'informatique en général, en français et le plus possible, accessibles à tous.tes.
- [Configuration VLANs réseau](reseau/vlan.md) — La segmentation découpe le réseau en zones de confiance distinctes. Chaque VLAN
- [Guide d'installation homelab](calamares.md) — Calamares c'est quoi ? C'est l'installateur de la plupart des distributions basées Linux. Cette page, tel l'installateur, sera une sorte de guide, mis à jour au fur et à mesure de l'installation de l'infrastructure. Chaque étape sera détaillée dans une page dédiée. Évidemment, je détaille ici *mon infra homelab*: elle est à adapter à chacun !
- [Proxmox VE hyperviseur](virtu/pve.md) — 
- [Schéma infrastructure homelab](infra.md) — mermaid
- [Serveur DNS autoritaire](reseau/dns.md) — L'une des premières choses à mettre en place dans un réseau est un serveur DNS, pour Domain Name Server ou *serveur de nom de domaine*. Ce service servira à *traduire* les noms de domaines en adresse IP utilisable par le matériel réseau. Par défaut les DNS utilisés sont généralement ceux du FAI, en clair, et représentent donc une fuite de donnée potentielle. De plus, les DNS peuvent être *menteurs* (un domaine redirigeant sur un autre) et ne sont pas administrables. Avoir son DNS c'est s'assurer de faire la résolution *où on le souhaite*, et de pouvoir y appliquer ses propres règles y compris pour du filtrage.
