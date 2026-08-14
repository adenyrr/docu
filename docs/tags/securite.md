---
title: "Tag: sécurité"
description: "Pages marquées "sécurité""
last_modified: 2026-08-14T10:50:50.625908Z
---

# sécurité

Nombre de pages : 6

- [Configuration VLANs réseau](reseau/vlan.md) — 
- [Gateway sécurisé reverse-proxy](reseau/swag.md) — Si certains services comme Ollama peuvent rester uniquement en local, d'autres comme Home Assistant gagnent à être exposés, afin de pouvoir etre utilisés en déplacement.
- [Linux — Cheat Sheet : Kernel & Système](cheats/linux_kernel.md) — Référence rapide pour systemd, journald, dmesg, modules noyau, performances et sécurité système.
- [PKI autorité certification locale](reseau/stepca.md) — Contrairement aux approches traditionnelles qui sécurisent principalement les entrées (pare-feu) et font confiance à tout ce qui est à l'intérieur, le Zero Trust part du principe que la menace peut être partout, y compris à l'intérieur du réseau. Dans cette optique, si un attaquant est *déjà* dans le réseau, il serait de bon ton que tout le traffic interne soit chiffré, y compris entre le proxy et les conteneurs: c'est ici que *step-ca* intervient en nous permettant de déployer une *Private Key Infrastruture* - PKI - avec renouvellement des certificats automatique et chiffrement mTLS entre les points d'exposition.
- [Serveur DNS autoritaire](reseau/dns.md) — L'une des premières choses à mettre en place dans un réseau est un serveur DNS, pour Domain Name Server ou *serveur de nom de domaine*. Ce service servira à *traduire* les noms de domaines en adresse IP utilisable par le matériel réseau. Par défaut les DNS utilisés sont généralement ceux du FAI, en clair, et représentent donc une fuite de donnée potentielle. De plus, les DNS peuvent être *menteurs* (un domaine redirigeant sur un autre) et ne sont pas administrables. Avoir son DNS c'est s'assurer de faire la résolution *où on le souhaite*, et de pouvoir y appliquer ses propres règles y compris pour du filtrage.
- [Sécuriser serveur Debian](virtu/serverconfig.md) — Un serveur a beau être extrêmement léger, et surtout debian sans aucun composant graphique, mais il n'en reste pas moins 'nu', et donc sans aucune mesure de protection mise en place. Voici une liste non-exhaustive de commandes ayant pour but d'augmenter la sécurité et la résilience des serveurs debian.
