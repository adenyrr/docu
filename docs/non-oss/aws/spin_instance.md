---
title: "Spiner une instance AWS EC2"
description: "Créer et configuration une EC2 dans la console amazon"
last_modified: 2026-04-01
---
# Créer et configurer des instances EC2 sur AWS

## Introduction

## Définitions

## Créer un VPC

## Créer une EC2

### Configurer l'instance

On navigue dans le menu EC2 > Instances > Lancer une instance, qui nous ouvre une interface de configuration.

![Capture d'écran de la console AWS EC2](../../assets/non-oss/aws/spin1.png)

!!! question "Bonnes pratiques"

    Le premier encart est dédié aux noms et balises. Il est recommandé de nommer les instances de manière claire et structurée, en utilisant des balises pour faciliter la gestion et l'organisation des ressources.

!!! example "Nombre d'instances"

    Sur le côté droit, on peut régler le nombre d'instances, ayant la même configuration, à lancer en même temps.

### Choix de la distribution

Chaque distribution a son prix, il faut donc choisir en fonction de ses affinités, de ses besoins, mais aussi des coûts.

Amazon Linux est une distribution de la famille Red-Hat (RHEL) et est généralement la moins chère.

### Type d'instance

t3.micro et t3.small sont éligibles à l'offre gratuite. 

Chaque machine a son prix, sa configuration. Voici les principales familles d'instances :

- General Purpose (t, m) — usage équilibré. Les t sont burstables (crédit CPU), les m ont des ressources fixes. Bon pour du web, des applis standard.
  
- Compute Optimized (c) — ratio CPU élevé, peu de RAM. Idéal pour du calcul intensif, encodage vidéo, batch processing.
  
- Memory Optimized (r, x, z) — grosse RAM. Pour les bases de données in-memory (Redis, SAP HANA), le traitement de gros datasets.
  
- Storage Optimized (i, d, h) — NVMe local 
haute vitesse ou dense HDD. Pour les bases de données NoSQL, data warehouses, systèmes de fichiers distribués.

- Accelerated Computing (p, g, inf, trn) — GPU ou accélérateurs dédiés. p/g pour le ML/deep learning et le rendu, inf/trn pour l'inférence et l'entraînement de modèles Neuron (AWS).
  
- HPC (hpc) — réseau ultra-faible latence (EFA), pour la simulation scientifique et les workloads MPI.


### Paire de clés

On crée (ou si déjà fait, on la selectionne) une paire de clef.

On lui donne un nom, et on choisi un protocole de chiffrement. ED25519 est plus récent et robuste, mais non compatible avec d'anciennes machines. Enfin, le format (.pem sous Linux) permet d'enregistrer la clef pour se connecter, en toute légitimité, à l'instance.

### Paramètres réseau

