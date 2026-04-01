# Le load-balancer

## Introduction

## LB couche 7, HTTP

### Créer les SG

On commence par créer un Security Group `LB-SG` pour l'ALB avec comme règle entrante `HTTP`, n'importe quelle source `0.0.0.0/0`.

Celui-ci permettra d'accepter le traffic wan HTTP sur le *load-balancer*.