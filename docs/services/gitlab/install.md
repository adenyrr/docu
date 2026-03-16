## Introduction
### C'est quoi ?

[GitLab](https://gitlab.com/) est un dépôt Git, particulièrement utilisé pour le DevOps et les CI/CD. Il dispose de nombreuses intégrations et runners, et propose une édition communautaire auto-hébergeable.

!!! question "Pourquoi GitLab ?"

    GitLab est écrit en Go et en Ruby ; il est relativement lourd et peut sembler une usine à gaz. Malgré tout, il est très adapté à l'automatisation et constitue un standard en entreprise. Il est moderne et activement maintenu : un incontournable.

### Alternatives

Les alternatives les plus connues sont :

- [Forgejo](https://forgejo.org) : open-source, fork de [Gitea](https://gitea.io) et propulsant [Codeberg](https://codeberg.org) (alternative recommandée, européen)
- [GitHub](https://github.com) : propriétaire, appartient à Microsoft (américain)
- [GitLab (cloud)](https://gitlab.com) : Gitlab cloud, géré par Gitlab. Limité (runners, ...) et américain.

## Installation


### Prérequis

Une machine virtuelle avec, *au minimum* :

- 2 cœurs CPU
- 6 Go de RAM
- 12 Go SSD (personnellement, je recommande 48 Go)
- Debian (stable)

Le système doit être à jour et [configuré](docs/virtu/vminstall.md)

!!! info "Machine virtuelle"

    Une LXC suffirait, mais étant donné que notre GitLab sera notre source de vérité, il est préférable d'avoir une isolation forte. Certains outils d'analyse ne sont tout simplement pas disponibles sur LXC.

### Procédure :

!!! question "Pourquoi en conteneur Docker ?"

    Pour une simple question de dépendances. Gitlab en contient énormément, la conteneurisation est justement là pour ça.

```bash

```