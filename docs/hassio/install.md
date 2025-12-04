## Introduction

### Avant-propos

Qui n'a jamais rêvé d'avoir son propre Jarvis ? De contrôler les lumières chez soi, d'un claquement de doigts ou d'une simple phrase ? Home Assistant est probablement ce qui s'en rapproche le plus, tout en restant sous un contrôle absolu.

### C'est quoi ?

[Hassio](https://www.home-assistant.io/) ou Home Assistant OS est un système d'exploitation complet permettant de controler la plupart des appareils connectés, de centraliser des actions et de faciliter l'automatisation en rassemblant toutes ces fonctionnalités dans une seule interface, extensible et personnalisable.

!!! quote "Elle se défini elle-même par :"

    Home assistant est un système d'automatisation domestique open-source qui privilégie le contrôle local et la confidentialité. Créé par et pour la communauté, il est conçu pour tourner sur un serveur local comme sur un Raspberry-Pi.

### Avantages & inconvénients

=== "Avantages"

    * Permet de controler plusieurs appareils, de plusieurs écosystèmes différents en un seul endroit
    * Facilite grandement les automatisations (exemple: éteindre les lumières quand on sort de la maison)
    * Permet de se faire un assistant vocal en combinant plusieurs services
    * Dans la plupart des cas, offre une alternative *locale* aux clouds popriétaires

=== "Inconvénients"

    * Malgré son aspect clef-en-main, il demande une configuration manuelle dans certains cas
    * Résolument open-source et communautaire, certaines technologies propriétaires sont absentes

### Alternatives

Les alternatives les plus connues sont :

- [Google Home](https://home.google.com/intl/fr_fr/welcome/) : propriétaire et cloud-dépendant
- [DomoticZ](https://www.domoticz.com/) : open-source
 

## Installation

!!! note " Plein de méthodes ... "

    Home Assistant est *très* permissif sur ses méthodes d'installation. Il peut etre installé sur raspberry pi, odroid ou directement sur un ordinateur utilisé comme serveur, via docker ou une machine virtuelle complète. Ici, c'est une VM sous [proxmox](https://docs.become.sh/virtu/pve.md) qui sera utilisée. Celle-ci dispose de 2c/4Go/32Go.
    

### Prérequis

