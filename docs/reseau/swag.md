## Introduction

### Avant-propos

Si certains services comme [Ollama](https://wiki.become.sh/services/ollama/) peuvent rester uniquement en local, d'autres comme [Home Assistant](https://wiki.become.sh/hassio/install.md) gagnent à être exposés, afin de pouvoir etre utilisés en déplacement.
Plusieurs solutions sont possibles comme l’utilisation d'un VPN ou le recours à un reverse-proxy. C'est cette dernière que l'on abordera ici.

### C'est quoi ?

[SWAG](https://docs.linuxserver.io/general/swag/) pour "Secure Web Application Gateway", est une application de reverse-proxy basée sur nginx, incluant certbot pour la création de certificats SSL et fail2ban comme protection primaire. Moddable, le conteneur est édité par [linuxserver.io](https://linuxserver.io) et propose de facilement associer un nom de domaine à un service, en toute sécurité.

!!! quote "Elle se défini elle-même par :"

    SWAG - Secure Web Application Gateway (anciennement connu sous le nom de letsencrypt, sans rapport avec Let's Encrypt™) met en place un serveur web Nginx et un reverse proxy avec un support php et un client certbot intégré qui automatise les processus gratuits de génération et de renouvellement des certificats de serveur SSL (Let's Encrypt et ZeroSSL). Il contient également fail2ban pour la prévention des intrusions.

### Avantages & inconvénients

=== "Avantages"

    * SWAG est une application plutôt clef en main, incluant plusieurs outils fondamentaux.
    * nginx est l'un des reverse-proxy les plus efficace en terme de rapidité et de consommation de ressources
    * Le renouvellement du certificat SSL (permettant de faire du https) est automatique
    * On peut assez facilement renforcer la sécurité

=== "Inconvénients"

    * Malgré son aspect clef-en-main, il demande une configuration manuelle dans tous les cas.
    * Il restera toujours moins sécurisé qu'un accès par VPN uniquement
    * Il est nécessaire d'ouvrir au moins un port sur son routeur (:443)

### Alternatives

Les alternatives les plus connues sont :

- [Traefik](https://doc.traefik.io/traefik/) : open-source
- [HAProxy](https://www.haproxy.org/) : open-source
- [Caddy](https://caddyserver.com/) : open-source
  

## Installation

### Prérequis

Un certain nombre de prérequis sont non-négociables :

- CPU avec 1 coeurs
- 512 Mo de DDR
- 4 GB de HDD
- Accès SSH
- Docker
- Un NDD (Nom de Domaine)
- Le port 443 d'ouvert et redirigé vers l'IP du proxy

### Docker, compose et validation DNS

C'est la *seule* méthode prise en charge. Linuxserver est une communauté basée autour de la publication de conteneurs, il est donc normal de retrouver ceux-ci dans les méthodes recommandées.

!!! warning "Bonnes pratiques :"

    Personnellement, mon serveur proxy est une machine virtuelle dédiée, très légère. Je ne peux que recommander d'utiliser une machine dédiée au serveur proxy, celui-ci étant un point d'entrée pour de potentiels pirates. Ainsi, si le port 443 du routeur est ouvert et redirigé sur l'adresse du serveur proxy, il constitue une surface d'attaque non négligeable. Surface que l'on diminue en ne laissant qu'un seul service accessible.

!!! note "Certificat OVH"

    Le docker & le compose fournis ici sont configurés pour un domaine loué chez OVH. Le   provider peut évidemment changer. Plus d'infos sur la [page dédiée](https://docs.linuxserver.io/general/swag/#authorization-method). La configuration montre donc la demande automatisée d'un certificat SSL permettant de passer au *HTTPS* à partir d'un domaine chez OVH, pour le domaine lui-meme et l'ensemble des sous-domaines. (www.domain.com,photos.domain.com,cloud.domaine.com,...)

Comme d'habitude, le docker-compose est compatible Portainer et Komodo.

=== "Docker"
    
    ``` bash
    docker run -d \
    --name swag \
    --cap-add NET_ADMIN \
    -e PUID=1000 \
    -e PGID=1000 \
    -e TZ=Etc/UTC \
    -e URL=domaine.com \
    -e VALIDATION=dns \
    -e SUBDOMAINS=wildcard \
    -e DNSPLUGIN=ovh \
    -e DOCKER_MODS=linuxserver/mods:swag-dashboard
    -v ./config:/config \
    -p 443:443 \
    -p 81:81 \
    --restart unless-stopped \
    lscr.io/linuxserver/swag:latest
    ```

=== "Docker Compose"

    ``` yaml
    services:
        swag:
            image: lscr.io/linuxserver/swag:latest
            container_name: swag
            cap_add:
            - NET_ADMIN
            environment:
            - PUID=1000
            - PGID=1000
            - TZ=Etc/UTC
            - URL=domaine.com
            - VALIDATION=dns
            - SUBDOMAINS=wildcard
            - DNSPLUGIN=ovh
            - DOCKER_MODS=linuxserver/mods:swag-dashboard
            volumes:
            - ./config:/config
            ports:
            - 443:443
            - 81:81
            restart: unless-stopped
    ```
    On lance ensuite la commande `docker compose up -d` qui installe ça.

Et là, ça échoue. Pas de panique, c'est normal : on ne lui a pas donné les autorisations pour vérifier que le domaine est bien le notre.

On vérifie tout d'abord sur le tableau de bord de son domaine que ce dernier pointe bien sur son adresse IP publique. On peut trouver celle-ci sur [des sites dédiés](https://monip.com). Normalement, on devrait avoir un enregistrement dit *"A"* pour une adresse IPv4. Ensuite, on se rend sur [le site API d'OVH](https://eu.api.ovh.com/createToken/) et on entre les autorisations suivantes :

```
GET /domain/zone/*
PUT /domain/zone/*
POST /domain/zone/*
DELETE /domain/zone/*
```

On défini le temps de validation sur infini. Enfin, on se connecte sur le serveur proxy via SSH (ou on y accède via `docker exec -it swag /bin/bash`) et on cherche le fichier *ovh.ini* dans `./config/dns-conf/ovh.ini` et on le rempli avec les clefs d'API générées sur le site d'OVH.

```bash
# OVH API credentials used by Certbot
dns_ovh_endpoint = ovh-eu
dns_ovh_application_key = MDAwMDAwMDAwMDAw
dns_ovh_application_secret = MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAw
dns_ovh_consumer_key = MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAw
```
On enregistre, on retourne dans le repertoire du `compose.yaml` et on relance (ou on peut relancer directement avec la commande `docker run` donnée au dessus.)

```sh
docker compose up -d
```

Si tout s'est bien passé, on devrait avoir un tableau de bord sur http://IP:81. Celui-ci n'est qu'indicatif et ne permet que de consulter des statistiques.

A ce stade, on devrait avoir un nom de domaine qui pointe vers l'IP du routeur, le routeur qui récupère le port 443 (HTTPS) et le transmet au serveur proxy.

### Configuration du proxy

Une multitude de templates existent déjà pour exposer certains services. Pour ajouter un proxy, il suffit de se rendre dans le repertoire `./config/nginx/proxy-conf/`. Une commande `ls` permet de découvrir plusieurs dizaines de configurations possibles sous le format *.sample*.

Prenons l'exemple de Home Assistant que l'on veut exposer sur `assist.domain.org`. On commence par créer le sous-domaine `assist` *chez OVH* et on le pointe vers l'IP (champ *A*) ou le domaine, si celui-ci pointe déjà sur l'IP publique (Champ *CNAME*). Une fois le délais de propagation passé (de quelques secondes à plusieurs heures), l'adresse choisie devrait répondre sur `http(s)://assist.domain.org` et une page 404 de SWAG devrait apparaitre. Si tel est le cas, c'est parfait : l'adresse arrive bien sur le proxy.

Dans `./config/nginx/proxy-conf/` on trouve `homeassistant.subdomain.conf.sample` et on le renome en le copiant (pour garder l'original) :

```sh
cp homeassistant.subdomain.conf.sample assist.subdomain.conf
```

!!! note "Deux renommages"

    On a renommé ici le `homeassistant` en `assist`, soit le sous domaine choisi *ET* on a enlevé le `.sample`.

On ouvre le fichier avec `nano` et on modifie le fichier pour correspondre à notre infra :

```bash
server {
    listen 443 ssl;
    listen [::]:443 ssl;

    server_name assist.*; ## Ici, on change le sous-domaine par celui désiré

    include /config/nginx/ssl.conf;

    client_max_body_size 0;


    location / {
       
        include /config/nginx/proxy.conf;
        include /config/nginx/resolver.conf;
        set $upstream_app IP; # Ici, on remplace IP par l'adresse de home assistant
        set $upstream_port 8123;
        set $upstream_proto http;
        proxy_pass $upstream_proto://$upstream_app:$upstream_port;

    }

    location ~ ^/(api|local|media)/ {
        include /config/nginx/proxy.conf;
        include /config/nginx/resolver.conf;
        set $upstream_app IP; # Ici, on remplace IP par l'adresse de home assistant
        set $upstream_port 8123;
        set $upstream_proto http;
        proxy_pass $upstream_proto://$upstream_app:$upstream_port;
    }
}

```

On ferme, et ... Après quelques secondes, https://assist.domain.org devrait afficher la page d'acceuil de l'instance Home Assistant. L'instance est maintenant exposée.

## Sécurisation

### Fail2Ban

Par défaut, le conteneur SWAG contient l'outil fail2ban qui permet de bannir une adresse IP en cas de tentative de brute-force. Après 3 tentatives de login incorrectes, f2b va bannir l'adresse IP concernée pour une durée de 600 secondes par défaut.

Pour modifier le nombre de tentatives avant un bannissement ou la durée de celui-ci, il suffit de se rendre dans le fichier `./config/fail2ban/jail.local` et de modifier les valeurs *BANTIME* ou *MAXRETRY*.

!!! warning " Valeurs par défaut "

    Les valeurs par défaut sont idéales pour la protection anti-bot. Les modifier peut entrainer des risques d'attaque, notamment en modifiant la valeur *MAXRETRY*.

### Crowdsec

Un outil formidable pour augmenter la sécurité est [crowdsec](https://www.crowdsec.net/), qui permet de bannir des adresses IP soit à partir d'un comportement anormal tel qu'un scan de ports ouverts ou à partir de listes d'adresses réputées malveillantes.

Pour l'utliser, il faut d'abord modifier le *compose.yaml* ou la commande *docker* exécutée et y ajouter le conteneur `crowdsec` :

```yaml
- DOCKER_MODS=linuxserver/mods:swag-dashboard|DOCKER_MODS=linuxserver/mods:swag-crowdsec
- CROWDSEC_LAPI_URL=http://crowdsec:8080
- CROWDSEC_API_KEY=
# On ajoute un 'pipe' puis le mod à ajouter : crowdsec
# Puis on ajoute, toujours dans cette section, les arguments obligatoires du nouveau conteneur mais en laissant vide l'API pour l'instant.
```

Dans la section `ports`, on ajoute une ligne avec `8080:8080` pour crowdsec.

On relance le compose avec *`docker compose stop && docker compose up -d`* puis on vérifie que crowdsec est bien présent avec `docker ps` qui permet de lister les conteneurs actifs.

Bien que le conteneur soit maintenant présent, il faut lui donner les logs de SWAG à analyser. On modifie le fichier `./config/nginx/nginx.conf` et dans le bas, on ajoute, en dessous de la ligne commentée :

```sh
# Includes virtual hosts configs.
include /etc/nginx/http.d/*.conf;
```

On valide puis on enregistre le *bouncer* (l'analyseur de logs) sur l'API du conteneur crowdsec, qui va renvoyer une valeur à conserver : 

```sh
docker exec -t crowdsec cscli bouncers add bouncer-swag
```

Pour terminer, on reprend une dernière fois notre *compose.yaml* pour y entrer la clef d'API de crowdsec. On modifie donc la ligne concernée puis on relance le compose (ou la commande docker complète) une dernière fois :

```sh
docker compose stop
docker compose up -d
```

Crowdsec est maintenant installé.