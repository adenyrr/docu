# Quelques commandes utiles : 

## Ajouter les dépots 'contrib' et 'non-free' sur debian

La commande `sed` permet de modifier ou d'ajouter une chaine de caractères dans un fichier. Ici, on l'utilise pour ajouter les dépots 'contrib' et 'non-free' à chaque ligne de notre fichier `/etc/apt/sources.list`. Pour vérifier que la commande a bien édité les lignes, on peut utiliser la commande `cat /etc/apt/sources.list`. Enfin, on actualise les dépots. 

``` bash
sudo sed -i 's/^deb .*/& contrib non-free/g' /etc/apt/sources.list && apt update
```

!!! note " La commande sed ?"

    Une explication de la commande `sed` sur le site d'[ubuntu-fr](https://doc.ubuntu-fr.org/sed).

## Ajouter docker et docker compose sur debian

Docker est omniprésent maintenant. Si on veut monter un serveur, c'est une étape obligatoire. Et dans la plupart des cas, tant mieux. Un conteneur contient tout ce dont l'application a besoin, fini les installations fastidieuses et les cassages de dépendances. Une commande, et ça tourne.

L'installation se fait en deux étapes simples : on supprime les anciennes versions ou les autres systèmes de gestion de conteneurs, puis on installe docker. On utilisera le script fourni par [get-docker](https://get.docker.com/) par simplicité. Il vérifie quelle version de l'OS on possède, il ajoute le dépot correspondant et installe docker et ses dépendances. Rien de bien compliqué.

 ``` bash
 curl -fsSL https://get.docker.com -o install-docker.sh | sudo bash
 ```
