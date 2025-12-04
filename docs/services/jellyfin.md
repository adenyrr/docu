## Introduction
### C'est quoi ?

[Jellyfin](https://jellyfin.org/) est une application de streaming multimédia. Elle permet de scanner une bibliothèque de fichiers vidéos, l'organiser dans une interface propre et soignée, reconnaitre et classer le contenu via les métadonnées en complétant celles-ci par la recherche sur des bases de donnes telles que IMDb. En bref, elle transforme n'importe quelle bibliothèque de films et séries en netflix personnel.

!!! quote "Elle se défini elle-même par :"

    Jellyfin est la solution média communautaire, qui vous permet de contrôler vos médias. Diffusez sur n'importe quel appareil à partir de votre propre serveur, sans aucune contrainte. Votre média, votre serveur, votre façon de faire.

!!! question "Pourquoi Jellyfin et pas Plex ?"

    Contrairement à Jellyfin, Plex est propriétaire. Le code n'est pas ouvert, personne ne peut en vérifier le contenu. De plus, Plex demande une clef d'API, payante, pour effectuer du transcodage. Jellyfin est complet et entièrement contrôlé par l'utilisateur.

### Avantages & inconvénients

=== "Avantages"

    * Jellyfin est *vraiment* pratique lorsque l'on a des enfants. Elle permet de configurer des heures d'accessibilité au service facilement, ainsi que l'accès aux classifications PEGI.
    * Contrairement à Netflix ou Disney+, lorsque le film ou la série est terminé.e, aucune bande annonce ne se lance.
    * Jellyfin indique l'heure de fin du média regardé : ça conscientise à la modération
    * Il dispose de clients libres sur quasiment toutes les plateformes (Android, Web, Windows, Mac OS ...)

=== "Inconvénients"

    * Plex est vraiment clef-en-main, parfois plus simple que Jellyfin
    * Plex dispose de plus d'outils communautaires
    * Plex dispose de nombreux clients

### Alternatives

Les alternatives les plus connues sont :

- [Plex](https://plex.tv) : propriétaire
- [Kodi](https://kodi.tv) : open-source
- [Emby](https://emby.media) : propriétaire
  

## Installation


### Prérequis

Un certain nombre de prérequis sont non-négociables :

- CPU avec 2 coeurs
- 4 GB de DDR
- 8 GB de HDD
- un dossier, disque, volume ou partage où se trouve le contenu

Cela vaut pour un serveur léger, sans transcodage. Un Raspberry Pi peut également suffire. Pour bénéficier du transcodage, il faut au moins :

- CPU avec 4 coeurs
- 4 GB de DDR
- 64 à 128 GB de HDD (soit 8 GB pour jellyfin, *et le reste pour les transcodages*)
- Un NAS qui partage un volume où sont les médias
- Une carte graphique

!!! tip "Ma solution"

    J'utilise une machine virtuelle dédié pour le multimédia, avec 4 coeurs, 4 GB de DDR4 et 96 GB de disque. Le transcodage se fait sur une nvidia 1060. J'utilise une instance OMV qui partage plusieurs téras de fichiers sur cette machine. 

### Docker && compose

Une fois docker installé, autant l'utiliser. Jellyfin publie un conteneur, de même que [linuxserver.io](https://docs.linuxserver.io/images/docker-jellyfin/). Le `docker compose` fourni ici est compatible avec [Portainer](https://portainer.io).

!!! info

    On change évidemment les repertoires `(/autre)/chemin/des/medias` par le chemin absolu du repertoire où est le contenu. On peut aussi ajouter ou enlever autant de repertoires qu'on veut, en respectant le même schéma.
    Il faut évidemment que les repertoires existent, et s'ils proviennent d'un partage, qu'ils soient bien montés.

=== "Docker"
    
    ``` bash
    docker run -d \
     --name jellyfin \
     --user 1000:1000 \
     --net=host \
     --volume jellyfin-config:/config
     --volume jellyfin-cache:/cache
     --mount type=bind,source=/chemin/des/medias,target=/media \
     --restart=unless-stopped \
     jellyfin/jellyfin
    ```

=== "Docker Compose"

    ``` yaml
    services:
      jellyfin:
        image: jellyfin/jellyfin
        container_name: jellyfin
        user: 1000:1000
        network_mode: 'host'
        volumes:
          - ./config:/config
          - ./cache:/cache
          - type: bind
            source: /chemin/des/medias
            target: /media
          - type: bind
            source: /autre/chemin/des/medias
            target: /media2
        restart: 'unless-stopped'
        extra_hosts:
          - 'host.docker.internal:host-gateway'
    ```
    On lance ensuite la commande `docker compose up -d` qui installe ça.

### Exécutable

!!! warning "Bonnes pratiques !"

    La solution recommmandée est d'utiliser `docker`. Cependant, sur un serveur dédié au multimédia, on peut installer directement les exécutables fournis par l'équipe de jellyfin. C'est une solution qui *peut* convenir, par exemple sur une machine virtuelle.

Pour installer directement Jellyfin sous Linux, le projet propose un script tout fait :

``` bash
curl https://repo.jellyfin.org/install-debuntu.sh | sudo bash
```

### Home Assistant

Il est également possible d'installer Jellyfin directement depuis Home Assistant, s'il est exécuté en mode `système d'exploitation`. Il suffit de se rendre sur le menu des add-ons, puis d'ajouter le dépôt suivant : `https://github.com/alexbelgium/hassio-addons` ou de cliquer [ici](https://my.home-assistant.io/redirect/supervisor_add_addon_repository/?repository_url=https%3A%2F%2Fgithub.com%2Falexbelgium%2Fhassio-addons).

## Configuration 

On attend que l'appli s'installe et on peut se rendre sur `http://IP:8096` en remplaçant `IP` par l'adresse IP du serveur jellyfin. (Pour trouver l'adresse IP, on peut utiliser `ip -a` sous linux).

On crée un utilisateur qui sera admin, on ajoute le répertoire choisi, on défini le pays et la langue (qui serviront pour les méta-données) et on valide, puis on se reconnecte.

### Skins && add-ons

J'utilise le skin suivant (à ajouter à Tableau de bord > Général > Code CSS personalisé)
```CSS
@import url("https://cdn.jsdelivr.net/gh/lscambo13/ElegantFin@main/Theme/ElegantFin-jellyfin-theme-build-latest-minified.css");
```
Sinon, il en existe d'autres disponibles sur [awesome-jellyfin](https://github.com/awesome-jellyfin/awesome-jellyfin/blob/main/THEMES.md) ou même un ancien plug-in : [skin-Manager](https://github.com/danieladov/jellyfin-plugin-skin-manager)

Je recommande les add-ons suivants, disponibles depuis [awesome-jellyfin](https://github.com/awesome-jellyfin/awesome-jellyfin) :

- LDAP : Centralise les informations de login (si on utilise authentik)
- Intro Skipper : permet de passer introductions, génériques et rappels
- Reports : permet de générer des logs et de les consulter

### Transcodage

Le transcodage permet de lire un média non-compatible sur un périphérique distant ou de modifier le bitrate d'un média. Par exemple, il peut-être intéressant de disposer de ses médias sous le codec `H265` qui prend moins de place que le `H264`, mais qui est incompatible avec de nombreux smartphones. Le transcosage permet à ce dernier de quand même lire le fichier distant, qui sera transformé à la volée par une carte graphique (en fait, une matrice de décodage/encodage) en un flux qui lui, sera compatible. En cas de connexion bridée, le transcodage permet également de diminuer le bitrate, le "débit" de la vidéo. C'est une fonctionnalité qui peut être intéressante, mais qui n'est pas indispensable. Sous windows, la procédure est la même. Plus d'informations sur le [site de jellyfin](https://jellyfin.org/docs/general/administration/hardware-acceleration)

!!! warning "Ressources && conso"

    Le transcodage consomme sensiblement plus de ressources, mais peut être pratique. De fait, il augmente aussi la consommation électrique.

Pour commencer, il faut installer les drivers de la carte graphique (sous debian et debian-like) :

=== "nvidia"

    Les drivers nvidia étant propriétaires, il faut activer les dépots contrib et non-free *avant* d'installer `nvidia-smi`.
    ~~~ bash
    sudo apt install nvidia-smi
    ~~~
    On peut vérifier avec la commande 
    ~~~ bash
    nvidia-smi
    ~~~

=== "AMD"

    Les pilotes sont inclus dans le noyau linux par défaut, rien à faire :)
    On peut vérifier si les drivers sont bien installés en cherchant `renderD128` dans :
    ~~~ bash
    ls /dev/dri
    ~~~

=== "Intel"

    ~~~ bash
    sudo apt install -y intel-opencl-icd
    ~~~
    On peut vérifier si les drivers sont bien installés en cherchant `renderD128` dans :
    ~~~ bash
    ls /dev/dri
    ~~~
    Plus d'informations sur le site de [jellyfin](https://jellyfin.org/docs/general/administration/hardware-acceleration/intel)

=== "RPi"

    Je déconseille l'utilisation du transcodage sur raspberry pi. Les performances sont plus que décevantes. Transcodage (quasi)impossible via Home-Assistant.

Pour une installation via les binaires, c'est tout. On passe directement à la configuration sur le Tableau de bord > Lecture > Transcodage et selectionner la matrice à utiliser (nvidia, AMD, ...). Cocher ensuite les codecs à transcoder (compatibles avec le GPU) et valider.  S'il demande le chemin d'accès du périphérique, il suffit de mettre `/dev/dri/renderD128`. Cocher "utiliser le décodeur ndvec amélioré" si la carte est nvidia. Redemarrer le serveur, et profiter.

Pour une installation depuis docker, il faut suivre le [protocole officiel](https://jellyfin.org/docs/general/administration/hardware-acceleration/nvidia#configure-with-linux-virtualization). 

