---
title: "Tag: réseau"
description: "Pages marquées "réseau""
last_modified: 2026-08-21T17:47:32.018800Z
---

# réseau

Nombre de pages : 8

- [Cisco IOS — Cheat Sheet : Commandes usuelles](cheats/cisco.md) — Référence rapide des commandes Cisco IOS pour la configuration et le diagnostic de routeurs et commutateurs.
- [Configuration VLANs réseau](reseau/vlan.md) — La segmentation découpe le réseau en zones de confiance distinctes. Chaque VLAN
- [Gateway sécurisé reverse-proxy](reseau/swag.md) — Si certains services comme Ollama peuvent rester uniquement en local, d'autres comme Home Assistant gagnent à être exposés, afin de pouvoir etre utilisés en déplacement.
- [Le load-balancer](non-oss/aws/load_balancer.md) — On commence par créer un Security Group LB-SG pour l'ALB avec comme règle entrante HTTP, n'importe quelle source 0.0.0.0/0.
- [PKI autorité certification locale](reseau/stepca.md) — Contrairement aux approches traditionnelles qui sécurisent principalement les entrées (pare-feu) et font confiance à tout ce qui est à l'intérieur, le Zero Trust part du principe que la menace peut être partout, y compris à l'intérieur du réseau. Dans cette optique, si un attaquant est *déjà* dans le réseau, il serait de bon ton que tout le traffic interne soit chiffré, y compris entre le proxy et les conteneurs: c'est ici que *step-ca* intervient en nous permettant de déployer une *Private Key Infrastruture* - PKI - avec renouvellement des certificats automatique et chiffrement mTLS entre les points d'exposition.
- [Réseau : définitions et méthode](reseau/intro.md) — 
- [Schéma infrastructure homelab](infra.md) — mermaid
- [Serveur DNS autoritaire](reseau/dns.md) — L'une des premières choses à mettre en place dans un réseau est un serveur DNS, pour Domain Name Server ou *serveur de nom de domaine*. Ce service servira à *traduire* les noms de domaines en adresse IP utilisable par le matériel réseau. Par défaut les DNS utilisés sont généralement ceux du FAI, en clair, et représentent donc une fuite de donnée potentielle. De plus, les DNS peuvent être *menteurs* (un domaine redirigeant sur un autre) et ne sont pas administrables. Avoir son DNS c'est s'assurer de faire la résolution *où on le souhaite*, et de pouvoir y appliquer ses propres règles y compris pour du filtrage.
