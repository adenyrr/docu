# OpenTofu — Cheat Sheet

> Référence rapide pour l'infrastructure as code avec OpenTofu (fork open-source de Terraform).

---

## Concepts clés

| Concept | Description |
|---|---|
| **Provider** | Plugin d'interaction avec une API (AWS, Proxmox, Docker…) |
| **Resource** | Objet d'infrastructure géré (`resource "type" "nom"`) |
| **Data source** | Lecture d'une ressource existante non gérée par Tofu |
| **Variable** | Paramètre d'entrée du module |
| **Output** | Valeur exportée du module |
| **Module** | Ensemble de ressources réutilisables |
| **State** | Fichier de suivi de l'état de l'infra (`terraform.tfstate`) |
| **Workspace** | Isolation d'environnements (dev/staging/prod) |
| **Backend** | Stockage du state (local, S3, GitLab…) |

---

## CLI — Commandes essentielles

### Cycle de vie de base

```bash
tofu init                          # initialiser le répertoire (télécharger les providers)
tofu init -upgrade                 # mettre à jour les providers
tofu init -backend-config=backend.hcl  # avec config backend externe

tofu validate                      # valider la syntaxe HCL
tofu fmt                           # formater les fichiers .tf
tofu fmt -recursive                # récursif (sous-dossiers)
tofu fmt -check                    # vérifier sans modifier (CI)

tofu plan                          # calculer les changements (dry-run)
tofu plan -out=plan.tfplan         # sauvegarder le plan
tofu plan -var="env=production"    # avec variable
tofu plan -var-file=prod.tfvars    # avec fichier de variables
tofu plan -target=resource.type.name  # cibler une ressource spécifique
tofu plan -refresh=false           # ne pas rafraîchir le state

tofu apply                         # appliquer les changements (confirmation demandée)
tofu apply -auto-approve           # sans confirmation (CI/CD)
tofu apply plan.tfplan             # appliquer un plan sauvegardé
tofu apply -replace=resource.type.name  # forcer la recréation

tofu destroy                       # détruire toutes les ressources
tofu destroy -auto-approve         # sans confirmation
tofu destroy -target=resource.type.name  # détruire une ressource
```

### Gestion du state

```bash
tofu show                          # afficher le state lisiblement
tofu show plan.tfplan              # afficher un plan sauvegardé
tofu state list                    # lister les ressources dans le state
tofu state show resource.type.nom  # détails d'une ressource
tofu state mv src dst              # renommer/déplacer une ressource dans le state
tofu state rm resource.type.nom    # retirer du state (sans détruire)
tofu state pull                    # afficher le state distant brut
tofu state push state.tfstate      # pousser un state local

tofu import resource.type.nom id   # importer une ressource existante
tofu refresh                       # synchroniser le state avec la réalité

tofu output                        # afficher tous les outputs
tofu output nom_output             # output spécifique
tofu output -json                  # format JSON
```

### Workspaces

```bash
tofu workspace list                # lister les workspaces
tofu workspace new staging         # créer un workspace
tofu workspace select production   # changer de workspace
tofu workspace show                # workspace actuel
tofu workspace delete staging      # supprimer (doit être vide)
```

---

## Structure de projet

```
infra/
├── main.tf           # ressources principales
├── variables.tf      # déclarations des variables
├── outputs.tf        # déclarations des outputs
├── providers.tf      # configuration des providers
├── versions.tf       # contraintes de version
├── terraform.tfvars  # valeurs des variables (ne pas committer si secrets)
├── dev.tfvars        # variables pour dev
├── prod.tfvars        # variables pour prod
└── modules/
    ├── lxc/
    │   ├── main.tf
    │   ├── variables.tf
    │   └── outputs.tf
    └── docker-stack/
        ├── main.tf
        ├── variables.tf
        └── outputs.tf
```

---

## Syntaxe HCL

### Providers

```hcl
# versions.tf
terraform {
  required_version = ">= 1.6.0"

  required_providers {
    proxmox = {
      source  = "bpg/proxmox"
      version = "~> 0.50"
    }
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }

  backend "http" {
    address        = "https://gitlab.domain.tld/api/v4/projects/1/terraform/state/homelab"
    lock_address   = "https://gitlab.domain.tld/api/v4/projects/1/terraform/state/homelab/lock"
    unlock_address = "https://gitlab.domain.tld/api/v4/projects/1/terraform/state/homelab/lock"
    lock_method    = "POST"
    unlock_method  = "DELETE"
    username       = "tofu"
    password       = var.gitlab_token
    retry_wait_min = 5
  }
}

# providers.tf
provider "proxmox" {
  endpoint = "https://proxmox.internal:8006"
  username = var.proxmox_user
  password = var.proxmox_password
  insecure = false
}
```

### Variables

```hcl
# variables.tf
variable "environment" {
  type        = string
  description = "Environnement de déploiement"
  default     = "dev"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "L'environnement doit être dev, staging ou prod."
  }
}

variable "vm_count" {
  type    = number
  default = 1
}

variable "tags" {
  type    = list(string)
  default = []
}

variable "config" {
  type = object({
    cpu    = number
    memory = number
    disk   = string
  })
  default = {
    cpu    = 2
    memory = 2048
    disk   = "32G"
  }
}

variable "db_password" {
  type      = string
  sensitive = true           # masqué dans les logs
}
```

```hcl
# terraform.tfvars
environment = "prod"
vm_count    = 3
tags        = ["homelab", "production"]
```

### Ressources

```hcl
# Resource basique
resource "docker_container" "nginx" {
  name  = "nginx"
  image = docker_image.nginx.image_id

  ports {
    internal = 80
    external = 8080
  }

  volumes {
    container_path = "/etc/nginx/conf.d"
    host_path      = "/opt/nginx/conf.d"
    read_only      = true
  }

  labels {
    label = "traefik.enable"
    value = "true"
  }

  restart = "unless-stopped"
}

# LXC sur Proxmox (provider bpg/proxmox)
resource "proxmox_virtual_environment_container" "app" {
  node_name = "pve"
  vm_id     = 200

  description = "App LXC - ${var.environment}"
  tags        = var.tags

  initialization {
    hostname = "lxc-app-${var.environment}"

    ip_config {
      ipv4 {
        address = "10.0.0.20/24"
        gateway = "10.0.0.1"
      }
    }

    user_account {
      keys = [file("~/.ssh/id_ed25519.pub")]
    }
  }

  cpu {
    cores = var.config.cpu
  }

  memory {
    dedicated = var.config.memory
  }

  disk {
    datastore_id = "local-lvm"
    size         = 32
  }

  network_interface {
    name   = "eth0"
    bridge = "vmbr0"
  }

  operating_system {
    template_file_id = "local:vztmpl/debian-12-standard_12.2-1_amd64.tar.zst"
    type             = "debian"
  }

  started   = true
  unprivileged = true
}
```

### Data sources

```hcl
# Lire une ressource existante (non gérée par Tofu)
data "proxmox_virtual_environment_nodes" "nodes" {}

data "docker_image" "nginx" {
  name = "nginx:latest"
}

# Utiliser dans une ressource
resource "docker_container" "nginx" {
  image = data.docker_image.nginx.image_id
  name  = "nginx"
}
```

### Outputs

```hcl
# outputs.tf
output "container_ip" {
  value       = proxmox_virtual_environment_container.app.initialization[0].ip_config[0].ipv4[0].address
  description = "Adresse IP du conteneur LXC"
}

output "container_id" {
  value = proxmox_virtual_environment_container.app.vm_id
}

output "db_connection" {
  value     = "postgres://user:${var.db_password}@${resource.db.host}:5432/app"
  sensitive = true    # masqué dans tofu output
}
```

---

## Meta-arguments et fonctions

### Meta-arguments

```hcl
# count — créer N instances
resource "proxmox_virtual_environment_container" "worker" {
  count = var.vm_count
  vm_id = 300 + count.index

  initialization {
    hostname = "worker-${count.index + 1}"
  }
}

# for_each — itérer sur une map/set
variable "services" {
  default = {
    nginx  = { port = 80 }
    redis  = { port = 6379 }
  }
}

resource "docker_container" "service" {
  for_each = var.services
  name     = each.key

  ports {
    internal = each.value.port
    external = each.value.port
  }
}

# depends_on — dépendance explicite
resource "docker_container" "app" {
  depends_on = [docker_container.db]
}

# lifecycle — contrôler la gestion du cycle de vie
resource "docker_container" "app" {
  lifecycle {
    prevent_destroy       = true          # empêcher la destruction accidentelle
    ignore_changes        = [image]       # ignorer les changements sur image
    replace_triggered_by  = [var.config]  # recréer si cette valeur change
  }
}
```

### Fonctions courantes

```hcl
# Chaînes
"${var.env}-server"              # interpolation
format("server-%03d", count.index)  # formatage
upper("hello")                   # "HELLO"
lower("HELLO")                   # "hello"
replace("hello world", " ", "-") # "hello-world"
split(",", "a,b,c")              # ["a", "b", "c"]
join("-", ["a", "b", "c"])       # "a-b-c"
trimspace("  hello  ")           # "hello"

# Collections
length(var.tags)                 # longueur
contains(var.tags, "prod")       # appartenance
concat(list1, list2)             # fusionner des listes
flatten([[1, 2], [3]])           # [1, 2, 3]
toset(["a", "b", "a"])           # {"a", "b"}
tomap({a = 1, b = 2})

# Conditions
condition ? valeur_si_vrai : valeur_si_faux
var.env == "prod" ? "t3.large" : "t3.micro"

# Fichiers et encodage
file("~/.ssh/id_ed25519.pub")    # lire un fichier
filebase64("cert.pem")           # en base64
base64encode("string")
jsonencode({key = "value"})      # sérialiser en JSON
yamlencode({key = "value"})      # sérialiser en YAML

# Réseau
cidrhost("10.0.0.0/24", 10)     # "10.0.0.10"
cidrsubnet("10.0.0.0/16", 8, 1) # "10.0.1.0/24"
```

---

## Modules

### Créer un module

```hcl
# modules/lxc/variables.tf
variable "hostname" { type = string }
variable "ip_address" { type = string }
variable "cpu" { type = number; default = 2 }
variable "memory" { type = number; default = 2048 }

# modules/lxc/main.tf
resource "proxmox_virtual_environment_container" "this" {
  # ...
}

# modules/lxc/outputs.tf
output "vm_id" {
  value = proxmox_virtual_environment_container.this.vm_id
}
```

### Appeler un module

```hcl
# main.tf
module "nginx_lxc" {
  source = "./modules/lxc"

  hostname   = "lxc-nginx"
  ip_address = "10.0.0.10/24"
  cpu        = 2
  memory     = 1024
}

module "db_lxc" {
  source  = "app.terraform.io/org/lxc/proxmox"  # module distant (registry)
  version = "~> 1.0"

  hostname   = "lxc-db"
  ip_address = "10.0.0.11/24"
}

# Utiliser les outputs d'un module
output "nginx_id" {
  value = module.nginx_lxc.vm_id
}
```

---

## Backends — Stockage du state

### GitLab HTTP Backend

```hcl
terraform {
  backend "http" {
    address        = "https://gitlab.domain.tld/api/v4/projects/PROJECT_ID/terraform/state/STATE_NAME"
    lock_address   = "https://gitlab.domain.tld/api/v4/projects/PROJECT_ID/terraform/state/STATE_NAME/lock"
    unlock_address = "https://gitlab.domain.tld/api/v4/projects/PROJECT_ID/terraform/state/STATE_NAME/lock"
    lock_method    = "POST"
    unlock_method  = "DELETE"
    username       = "tofu"
    password       = var.gitlab_token      # ou TF_HTTP_PASSWORD en env var
    retry_wait_min = 5
  }
}
```

### S3-compatible (Minio, AWS)

```hcl
terraform {
  backend "s3" {
    bucket   = "tofu-state"
    key      = "homelab/terraform.tfstate"
    region   = "us-east-1"
    endpoint = "https://minio.domain.tld"

    access_key = var.minio_access_key
    secret_key = var.minio_secret_key

    skip_credentials_validation = true
    skip_metadata_api_check     = true
    skip_region_validation      = true
    force_path_style            = true
  }
}
```

---

## Bonnes pratiques

- Ne jamais committer `terraform.tfstate` ou `terraform.tfvars` contenant des secrets dans Git.
- Utiliser un backend distant (GitLab, S3/Minio) pour partager le state entre collaborateurs.
- Toujours exécuter `tofu plan` et le relire avant `tofu apply`.
- Marquer les variables sensibles avec `sensitive = true`.
- Utiliser `prevent_destroy = true` sur les ressources critiques (bases de données, volumes).
- Versionner les providers avec `~>` (patch flexible) plutôt que de fixer exactement.

```hcl
# .gitignore recommandé
*.tfstate
*.tfstate.backup
.terraform/
*.tfvars          # si contient des secrets
*.tfplan
.terraform.lock.hcl  # à committer si reproductibilité souhaitée

# Variables sensibles via variables d'environnement
# TF_VAR_db_password=secret tofu apply
# ou dans un fichier non commité :
# echo 'db_password = "secret"' > secrets.auto.tfvars
```
