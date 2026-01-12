# Quelques commandes utiles : 

## Ajouter les dépots 'contrib' et 'non-free' sur debian

La commande `sed` permet de modifier ou d'ajouter une chaine de caractères dans un fichier. Ici, on l'utilise pour ajouter les dépots 'contrib' et 'non-free' à chaque ligne de notre fichier `/etc/apt/sources.list`. Pour vérifier que la commande a bien édité les lignes, on peut utiliser la commande `cat /etc/apt/sources.list`. Enfin, on actualise les dépots. 

``` bash
sudo sed -i 's/^deb .*/& contrib non-free/g' /etc/apt/sources.list && apt update
```

!!! note " La commande sed ?"

    Une explication de la commande `sed` sur le site d'[ubuntu-fr](https://doc.ubuntu-fr.org/sed).

## Installation de plusieurs paquets de base pour avoir un système opérationnel minimal sur debian (serveurs)

Beaucoup de LXC sont basées sur debian. De même, les serveurs que j'installe sont principalement sous debian, en version minimale. L'équilibre entre le hardening et le confort d'administration est complexe à trouver; c'est pourquoi je préfère utiliser des images minimales, mais installer quelques utilitaires de confort par dessus.

!!! note "su ... do ?"

    La commande sudo permet de lancer des commandes root depuis l'utilisateur actif. Elle n'est pas nécéssaire, les commandes peuvent être lancées depuis l'utilisateur root également.
    Pour ajouter l'utilisateur au groupe sudoers (et donc pouvoir utiliser sudo depuis cet utilisateur), il faut lancer la commande `usermod -aG sudo $user` en changeant $user par le nom de l'utilisateur à ajouter au groupe sudo.

Cette commande installe :

- *btop* : un utilitaire plus joli et complet que top pour voir les processus en cours et leur consommation
- *curl* : un utilitaire permettant de récupérer du contenu distant, similaire à *wget* mais plus complet
- *gpg* : permet d'utiliser des clefs gpg, notamment pour signer des dépots
- *sudo* : permet de lancer des commandes avec les privilèges d'un autre utilisateur, généralement le root
- *ufw* : utilitaire de gestion de pare-feu

 ``` bash
 apt update && apt install btop curl gpg sudo ufw
 ```

!!! warning "ufw !"

    Après l'installation d'ufw, il faut, au risque de perdre l'accès distant à la machine, autoriser l'ouverture du port SSH (22 par défaut).
    `ufw allow ssh` puis un `ufw enable`.

## Ajouter docker et docker compose sur debian

Docker est omniprésent maintenant. Si on veut monter un serveur, c'est une étape obligatoire. Et dans la plupart des cas, tant mieux. Un conteneur contient tout ce dont l'application a besoin, fini les installations fastidieuses et les cassages de dépendances. Une commande, et ça tourne.

L'installation se fait en deux étapes simples : on supprime les anciennes versions ou les autres systèmes de gestion de conteneurs, puis on installe docker. On utilisera le script fourni par [get-docker](https://get.docker.com/) par simplicité. Il vérifie quelle version de l'OS on possède, il ajoute le dépot correspondant et installe docker et ses dépendances. Rien de bien compliqué.

 ``` bash
 curl -fsSL https://get.docker.com install-docker.sh | sudo bash
 ```
