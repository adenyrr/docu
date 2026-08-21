---
tags:
  - ansible
  - iac
  - automatisation
  - adminsys
---
# Ansible — Cheat Sheet

> Référence rapide pour l'automatisation avec Ansible : inventaires, playbooks, modules courants, variables et Vault.

---

## Concepts clés

| Concept | Description |
|---|---|
| **Inventory** | Liste des hôtes/groupes à gérer |
| **Playbook** | Fichier YAML décrivant les tâches à exécuter |
| **Task** | Unité d'action (module + paramètres) |
| **Role** | Ensemble structuré de tâches réutilisables |
| **Handler** | Tâche déclenchée par `notify` (ex: restart service) |
| **Variable** | Valeur réutilisable (host_vars, group_vars, defaults) |
| **Fact** | Variable collectée automatiquement sur l'hôte |
| **Template** | Fichier Jinja2 rendu sur les hôtes cibles |
| **Vault** | Chiffrement des données sensibles |

---

## Commandes ad-hoc

```bash
# Syntaxe de base
ansible <hôtes> -m <module> -a "<arguments>"

# Ping de connectivité (module ping)
ansible all -m ping
ansible webservers -m ping

# Exécuter une commande shell
ansible all -m shell -a "uptime"
ansible all -m command -a "uname -r"

# Copier un fichier
ansible all -m copy -a "src=/local/file dest=/remote/path"

# Gestion de paquets
ansible all -m apt -a "name=nginx state=present" --become
ansible all -m dnf -a "name=nginx state=absent" --become

# Redémarrer un service
ansible webservers -m service -a "name=nginx state=restarted" --become

# Gather facts
ansible all -m setup
ansible all -m setup -a "filter=ansible_os_family"
ansible all -m setup -a "filter=ansible_*_mb"       # mémoire

# Commandes utiles
ansible all --list-hosts             # lister les hôtes ciblés
ansible all -m ping -o               # sortie compacte (one-liner)
ansible webservers -m ping -u alice  # avec un utilisateur SSH spécifique
```

---

## Inventaire

### Format INI

```ini
# inventory/hosts

[webservers]
web01.domain.tld
web02.domain.tld ansible_user=ubuntu

[dbservers]
db01.domain.tld ansible_port=2222

[lxc]
lxc-nginx ansible_host=10.0.0.10 ansible_user=root
lxc-db    ansible_host=10.0.0.11

[homelab:children]
webservers
lxc

[homelab:vars]
ansible_user=admin
ansible_ssh_private_key_file=~/.ssh/homelab_ed25519
```

### Format YAML

```yaml
# inventory/hosts.yml
all:
  children:
    webservers:
      hosts:
        web01.domain.tld:
        web02.domain.tld:
          ansible_user: ubuntu
    dbservers:
      hosts:
        db01.domain.tld:
          ansible_port: 2222
  vars:
    ansible_user: admin
    ansible_python_interpreter: /usr/bin/python3
```

### Variables d'inventaire

```text
inventory/
├── hosts.yml
├── group_vars/
│   ├── all.yml          # variables pour tous les hôtes
│   ├── webservers.yml   # variables pour le groupe webservers
│   └── webservers/      # dossier de variables pour webservers
│       ├── vars.yml
│       └── vault.yml    # variables chiffrées
└── host_vars/
    ├── web01.yml        # variables spécifiques à web01
    └── web02.yml
```

---

## Playbooks

### Structure de base

```yaml
---
- name: Configurer les serveurs web
  hosts: webservers
  become: true
  gather_facts: true

  vars:
    nginx_port: 80
    app_user: www-data

  pre_tasks:
    - name: Mettre à jour le cache APT
      apt:
        update_cache: true
        cache_valid_time: 3600

  tasks:
    - name: Installer nginx
      apt:
        name: nginx
        state: present

    - name: Déployer la configuration
      template:
        src: nginx.conf.j2
        dest: /etc/nginx/nginx.conf
        mode: '0644'
      notify: Redémarrer nginx

    - name: S'assurer que nginx est démarré
      service:
        name: nginx
        state: started
        enabled: true

  handlers:
    - name: Redémarrer nginx
      service:
        name: nginx
        state: restarted

  post_tasks:
    - name: Vérifier que nginx répond
      uri:
        url: http://localhost
        status_code: 200
```

### Conditions et boucles

```yaml
# Condition when
- name: Installer sur Debian uniquement
  apt:
    name: vim
    state: present
  when: ansible_os_family == "Debian"

- name: Redémarrer si le noyau a changé
  reboot:
  when: kernel_update.changed

# Boucles
- name: Créer plusieurs utilisateurs
  user:
    name: "{{ item.name }}"
    groups: "{{ item.groups }}"
    state: present
  loop:
    - { name: alice, groups: sudo }
    - { name: bob, groups: docker }

- name: Installer des paquets
  apt:
    name: "{{ item }}"
    state: present
  loop:
    - nginx
    - curl
    - git

# with_items (ancien style, toujours supporté)
- name: Créer des répertoires
  file:
    path: "{{ item }}"
    state: directory
  with_items:
    - /opt/app
    - /opt/app/logs
    - /opt/app/data
```

### Register et debug

```yaml
- name: Vérifier si un fichier existe
  stat:
    path: /etc/myapp/config.yml
  register: config_file

- name: Créer la config si absente
  copy:
    src: config.yml
    dest: /etc/myapp/config.yml
  when: not config_file.stat.exists

- name: Afficher le résultat
  debug:
    msg: "Le fichier existe : {{ config_file.stat.exists }}"

- name: Afficher une variable
  debug:
    var: ansible_default_ipv4.address

- name: Afficher un message formaté
  debug:
    msg: "OS : {{ ansible_distribution }} {{ ansible_distribution_version }}"
```

---

## Modules courants

### Fichiers et répertoires

```yaml
# file — créer, supprimer, définir les permissions
- file:
    path: /opt/app
    state: directory        # directory | file | link | absent
    owner: appuser
    group: appuser
    mode: '0755'
    recurse: true           # pour les répertoires

# copy — copier depuis le contrôleur
- copy:
    src: fichier.conf
    dest: /etc/app/fichier.conf
    owner: root
    mode: '0644'
    backup: true            # sauvegarder l'ancienne version

# template — fichier Jinja2
- template:
    src: app.conf.j2
    dest: /etc/app/app.conf
    mode: '0644'

# fetch — récupérer depuis l'hôte distant
- fetch:
    src: /var/log/app.log
    dest: ./logs/{{ inventory_hostname }}/
    flat: false

# lineinfile — modifier une ligne dans un fichier
- lineinfile:
    path: /etc/ssh/sshd_config
    regexp: '^PasswordAuthentication'
    line: 'PasswordAuthentication no'
    backup: true

# blockinfile — insérer un bloc
- blockinfile:
    path: /etc/hosts
    block: |
      10.0.0.10 lxc-nginx nginx.internal
      10.0.0.11 lxc-db db.internal
```

### Gestion des paquets

```yaml
# apt (Debian/Ubuntu)
- apt:
    name: nginx
    state: present          # present | absent | latest
    update_cache: true
    cache_valid_time: 3600

- apt:
    name:
      - nginx
      - curl
      - git
    state: present

# dnf / yum (RedHat/CentOS)
- dnf:
    name: nginx
    state: present

# package — module générique (auto-détecte)
- package:
    name: nginx
    state: present
```

### Services et systemd

```yaml
- service:
    name: nginx
    state: started          # started | stopped | restarted | reloaded
    enabled: true

- systemd:
    name: nginx
    state: restarted
    daemon_reload: true     # équivalent systemctl daemon-reload
    enabled: true

- systemd:
    daemon_reload: true     # juste recharger les units sans toucher au service
```

### Utilisateurs et groupes

```yaml
- user:
    name: alice
    uid: 1001
    groups:
      - sudo
      - docker
    append: true            # ajouter aux groupes sans retirer les autres
    shell: /bin/bash
    home: /home/alice
    create_home: true
    state: present

- group:
    name: devs
    gid: 2000
    state: present

- authorized_key:
    user: alice
    key: "{{ lookup('file', '~/.ssh/id_ed25519.pub') }}"
    state: present
```

### Commandes

```yaml
# command — pas de shell (pas de pipes, redirections)
- command: /usr/bin/myapp --init
  args:
    chdir: /opt/myapp

# shell — avec shell complet (pipes, etc.)
- shell: "ps aux | grep nginx | grep -v grep"
  register: nginx_procs

# script — exécuter un script local
- script: scripts/init.sh
  args:
    chdir: /opt/app
```

---

## Rôles

### Structure d'un rôle

```text
roles/
└── nginx/
    ├── defaults/
    │   └── main.yml        # variables par défaut (surchargeables)
    ├── vars/
    │   └── main.yml        # variables fixes (non surchargeables)
    ├── tasks/
    │   └── main.yml        # tâches principales
    ├── handlers/
    │   └── main.yml        # handlers
    ├── templates/
    │   └── nginx.conf.j2   # templates Jinja2
    ├── files/
    │   └── index.html      # fichiers statiques
    ├── meta/
    │   └── main.yml        # dépendances du rôle
    └── README.md
```

### Utiliser un rôle

```yaml
# Dans un playbook
- hosts: webservers
  roles:
    - nginx
    - { role: nginx, nginx_port: 8080 }    # avec variables
    - role: nginx
      vars:
        nginx_port: 8080
      when: deploy_nginx | default(true)
```

### Ansible Galaxy

```bash
ansible-galaxy install geerlingguy.nginx          # installer un rôle
ansible-galaxy install -r requirements.yml        # depuis un fichier
ansible-galaxy list                               # rôles installés
ansible-galaxy remove geerlingguy.nginx           # supprimer

# requirements.yml
# roles:
#   - name: geerlingguy.nginx
#     version: 3.0.0
#   - src: https://github.com/user/role
#     name: mon-role
```

---

## Ansible Vault

```bash
# Chiffrer un fichier
ansible-vault encrypt group_vars/all/vault.yml

# Déchiffrer
ansible-vault decrypt group_vars/all/vault.yml

# Modifier un fichier chiffré
ansible-vault edit group_vars/all/vault.yml

# Chiffrer une valeur (inline)
ansible-vault encrypt_string 'MonSecret' --name 'db_password'

# Voir sans déchiffrer
ansible-vault view group_vars/all/vault.yml

# Changer le mot de passe du vault
ansible-vault rekey group_vars/all/vault.yml

# Utiliser le vault dans un playbook
ansible-playbook site.yml --ask-vault-pass
ansible-playbook site.yml --vault-password-file ~/.vault_pass
```

```yaml
# group_vars/all/vault.yml (chiffré)
vault_db_password: "MonSuperSecret"
vault_api_key: "ma-cle-api"

# group_vars/all/vars.yml (clair)
db_password: "{{ vault_db_password }}"
api_key: "{{ vault_api_key }}"
```

---

## ansible-playbook — Options courantes

```bash
ansible-playbook site.yml                          # exécuter
ansible-playbook site.yml -i inventory/hosts.yml   # inventaire explicite
ansible-playbook site.yml --check                  # dry-run (simulation)
ansible-playbook site.yml --diff                   # voir les différences
ansible-playbook site.yml --check --diff           # simulation + diff

ansible-playbook site.yml -l webservers            # limiter aux webservers
ansible-playbook site.yml -l web01,web02           # hôtes spécifiques
ansible-playbook site.yml -t nginx                 # seulement le tag nginx
ansible-playbook site.yml --skip-tags deploy       # exclure un tag
ansible-playbook site.yml --start-at-task "Déployer la config"

ansible-playbook site.yml -v                       # verbeux
ansible-playbook site.yml -vvv                     # très verbeux (debug)
ansible-playbook site.yml -e "env=production"      # variable extra
ansible-playbook site.yml -e @vars/prod.yml        # variables depuis fichier

ansible-playbook site.yml --become                 # sudo
ansible-playbook site.yml --become-user=root
ansible-playbook site.yml -u alice                 # utilisateur SSH
```

---

## Templates Jinja2

```jinja2
{# nginx.conf.j2 #}

user {{ app_user }};
worker_processes {{ ansible_processor_vcpus }};

http {
    server {
        listen {{ nginx_port | default(80) }};
        server_name {{ inventory_hostname }};

        {% if ssl_enabled %}
        listen 443 ssl;
        ssl_certificate {{ ssl_cert_path }};
        {% endif %}

        {% for location in nginx_locations %}
        location {{ location.path }} {
            proxy_pass {{ location.backend }};
        }
        {% endfor %}
    }
}
```

| Filtre Jinja2 | Usage |
|---|---|
| `{{ var \| default('val') }}` | Valeur par défaut |
| `{{ var \| upper }}` | Majuscules |
| `{{ var \| lower }}` | Minuscules |
| `{{ list \| join(', ') }}` | Joindre une liste |
| `{{ var \| bool }}` | Convertir en booléen |
| `{{ var \| int }}` | Convertir en entier |
| `{{ var \| to_json }}` | Sérialiser en JSON |
| `{{ var \| regex_replace('a', 'b') }}` | Remplacer par regex |

---

## Bonnes pratiques

- Utiliser `--check --diff` avant toute exécution sur la production.
- Structurer le code en rôles dès qu'un playbook dépasse une dizaine de tâches.
- Toujours chiffrer les secrets avec Ansible Vault — jamais de mots de passe en clair dans Git.
- Nommer les tâches de manière descriptive (pas `Install package` mais `Installer nginx pour le reverse proxy`).
- Utiliser `state: present/absent` plutôt que des commandes shell pour les modules idempotents.
- Tester les rôles avec Molecule avant de les pousser.

```yaml
# ansible.cfg — configuration projet
[defaults]
inventory = inventory/
roles_path = roles/
host_key_checking = False
retry_files_enabled = False
stdout_callback = yaml
interpreter_python = auto_silent

[privilege_escalation]
become = True
become_method = sudo
become_user = root
```
