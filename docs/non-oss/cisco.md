
# Commandes Cisco

Une cheat-sheet des commandes cisco les plus régulières.

## Les commandes de configuration :

### Passer en mode privilégié :

```
Router> enable
```

```
Switch> enable
```



### Passer en mode de configuration globale : 

```
Router# configure terminal
```

```
Switch# configure terminal
```



### Renommer les noms d’hôtes : 

```
Router(config)# hostname ‘Nouveau Nom’
```

```
Switch(config)# hostname ‘Nouveau Nom’
```



###  Configurer l’interface FastEthernet :

```
Router(config)# interface FastEthernet ‘numéro’
```

```
Router(config-if)# ip address ‘@’ ‘masque de sous réseau’
```

```
Router(config-if)# no shutdown
```

```
Router(config-if)# exit
```



### Configurer l’interface Serial : 

```
Router(config)# interface serial ‘numéro’
```

```
Router(config(if)# ip adresse ‘@’ ‘masque’
```

```
Router(config-if)# clock rate ‘nombre’
```

```
Router(config-if)# no shutdown
```

```
Router(config-if)# exit
```



### Attribuer le mot de passe à l’accès par terminal :

```
Router(config)# line console 0
```

```
Router(config-line)# password ‘mot de passe’
```

```
Router(config-line)# login
```

```
Router(config-line)# exit
```



### Attribuer le mot de passe à l’accès par telnet :

```
Router(config)# line vty 0 4
```

```
Router(config-line)# password ‘mot de passe’
```

```
Router(config-line)# login
```

```
Router(config-line)# exit
```



###  Attribuer le mot de passe par mode privilégié (non crypté) :

```
Router(config)# Enable password ‘mot de passe’
```



### Attribuer le mot de passe par mode privilégié (crypté) :

```
Router(config)# Enable secret ‘mot de passe’
```



### Attribuer au routeur la bannière :

```
Router(config)# banner motd # ‘le message’ #
```



### Définir les routes statiques :

```
Router(config)# ip route ‘@ réseau distinataire’ ‘masque’ ‘@ de l’interface suivante’
```



### Configurer le routage dynamique par le protocole de routage ‘RIP’ :

```
Router(config)# router rip
```

```
Router(config-router)# version ‘1/2’
```

```
Router(config-router)# network ‘@ de réseau voisin 1’
```

```
Router(config-router)# network ‘@ de réseau voisin 2’
```

```
Router(config-router)# network ‘@ de réseau voisin n’
```

```
Router(config-router)# exit
```



### Configurer le routage dynamique par le protocole de routage ‘EIGRP’ :

```
Router(config)# router eigrp 1
```

```
Router(config-router)# network ‘@ de réseau voisin 1’ ‘masque générique’
```

```
Router(config-router)# network ‘@ de réseau voisin 2’ ‘masque générique’
```

```
Router(config-router)# network ‘@ de réseau voisin n’ ‘masque générique’
```

```
Router(config-router)# exit
```



### Configurer le routage dynamique par le protocole de routage ‘OSPF’ :

```
Router(config)# router ospf 1
```

```
Router(config-router)# network ‘@ de réseau voisin 1’ ‘masque générique’ area 0
```

```
Router(config-router)# network ‘@ de réseau voisin 2’ ‘masque générique’ area 0
```

```
Router(config-router)# network ‘@ de réseau voisin n’ ‘masque générique’ area 0
```

```
Router(config-router)# exit
```


  
###  Les ACLs Standard :

```
Router(config)# access-list ‘1-99’ ‘permit/deny’ ‘préfixe/any’ ‘masque générique/any’
```

```
Router(config)# interface ‘fastethernet/serial’ ‘numéro’
```

```
Router(config-if)# ip access-group ‘1-99’ ‘in/out’
```

```
Router(config-if)# exit
```



### Les ACLs étendues :

```
Router(config)#access-list ‘100-199’ ‘permit/deny’ ‘protocole’ ‘@IP source/any’ ‘masque générique’ ‘Opérateur’ ‘nom/numéro de port d’un opérant’ ‘@IP destinataire/any’ ‘masque générique’ established 
```

```
Router(config)# interface ‘fastethernet/serial’ ‘numéro’
```

```
Router(config-if)# ip access-group ‘100-199’ ‘in/out’
```

```
Router(config-if)# exit
```



### Les ACLs nommées :

```
Router(config)# ip access-list ‘standard/extended’ ‘1-99/100-199’
```

```
Router(config- std-nacl/ext-nacl)# ‘permit/deny’ ‘préfixe/any’ ‘masque générique/any’ /‘permit/deny’ ‘protocole’ ‘@IP source/any’ ‘masque générique’ ‘Opérateur’ ‘nom/numéro de port d’un opérant’ ‘@IP destinataire/any’ ‘masque générique’ established 
```

```
Router(config)# interface ‘fastethernet/serial’ ‘numéro’
```

```
Router(config-if)# ip access-group ‘1-99/100-199’ ‘in/out’
```

```
Router(config-if)# exit
```



### Créer les VLANs dans un Switch :

```
Switch(config)# vlan ‘numéro’
```

```
Switch(config-vlan)# name ‘nom’
```

```
Switch(config-vlan)# exit
```



### Définir les adresses IP au VLANS :

```
Switch(config)# interface vlan ‘numéro’
```

```
Switch(config-if)# ip address ‘@IP’ ‘masque’
```

```
Switch(config-if)# no shutdown
```

```
Switch(config-if)# exit
```



### Attribuer les ports au VLANs indiquants : 

```
Switch(config)# interface fastethernet ‘numéro’
```

```
Switch(config-if)# switchport access vlan ‘numéro’
```

```
Switch(config-if)# exit
```



### Créer l’agrégation :

```
Switch(config)# interface fastethernet ‘numéro’
```

```
Switch(config-if)# switchport mode trunk
```

```
Switch(config-if)# exit
```



### Créer les sous interfaces dans le routeur :

```
Router(config)# interface fastEthernet ‘numéro d’interface’.‘numéro de vlan’
```

```
Router(config-subif)# encapsulation dot1Q ‘numéro de vlan’
```

```
Router(config-subif)# ip address ‘@IP’ ‘masque’
```

```
Router(config-subif)# no shutdown
```

```
Router(config-subif)# exit
```



### Définir un switch comme un serveur VTP et créer les VLANs :

```
Switch(config)# vtp domain ‘nom de domain’
```

```
Switch(config)# vtp mode server
```

```
Switch(config)# vlan ‘num’
```

```
Switch(config-vlan)# name ‘nom’
```

```
Switch(config-vlan)# exit
```



### Définir un switch comme un client :

```
Switch(config)# vtp domain ‘nom de domain’
```

```
Switch(config)# vtp mode client
```



### Fixer un Switch comme un pont racine :

```
Switch(config)# spanning-tree vlan 1 root primary
```



### Fixer un Switch comme un pont secondaire :

```
Switch(config)# spanning-tree vlan 1 root secondary
```



### Changer la priorité d’un Switch :

```
Switch(config)# spanning-tree vlan 1 priority ‘0-61440’
```



### Changer la priorité d’un port :

```
Switch(config)# interface fastEthernet ‘numéro’
```

```
Switch(config-if)# spanning-tree vlan 1 port-priority ‘0-240’
```

```
Switch(config-if)# exit
```



### Configurer le service DHCP dans un routeur :

```
Router(config)# ip dhcp excluded-address ‘@IP à exclure’
```

```
Router(config)# ip dhcp pool ‘nom de la plage’
```

```
Router(dhcp-config)# network ‘@ réseau’ ‘masque’
```

```
Router(dhcp-config)# default-router ‘@IP de la passerelle’
```

```
Router(dhcp-config)# dns-server ‘@IP du serveur DNS’
```

```
Router(dhcp-config)# exit
```



### Définir le routeur un agent de relais :

```
Router(config)# interface fastEthernet ‘numéro’
```

```
Router(config-if)# ip helper-address ‘@IP du serveur DHCP’
```

```
Router(config-if)# exit
```



### Configurer NAT statique :

```
Router(config)# ip nat inside source static ‘@IP local interne’ ‘@IP globale interne’
```

```
Router(config)# interface fastEthernet ‘numéro’
```

```
Router(config-if)# ip nat inside
```

```
Router(config-if)# exit
```

```
Router(config)# interface serial ‘numéro’
```

```
Router(config-if)# ip nat outside
```

```
Router(config-if)# exit
```



### Configurer NAT dynamique :

```
Router(config)# ip nat pool ‘nom de la plage’ ‘premier @IP de la plage’ ‘dernier @IP de la plage’ netmask ‘masque’
```

```
Router(config)# access-list ‘1-99’ ‘permit/deny’ ‘@IP du réseau à transférer/any’ ‘masque’
```

```
Router(config)# ip nat inside source list ‘1-99’ pool ‘nom de la plage’
```

```
Router(config)# interface fastEthernet ‘numéro’
```

```
Router(config-if)# ip nat inside
```

```
Router(config-if)# exit
```

```
Router(config)# interface serial ‘numéro’
```

```
Router(config-if)# ip nat outside
```

```
Router(config-if)# exit
```



### Configurer la surcharge NAT (PAT) pour une adresse IP publique unique :

```
Router(config)# access-list ‘1-99’ ‘permit/deny’ ‘@IP à transférer/any’ ‘masque générique’
```

```
Router(config)# ip nat inside source list ‘1-99’ interface serial ‘numéro’ overload
```

```
Router(config)# interface fastEthernet ‘numéro’
```

```
Router(config-if)# ip nat inside
```

```
Router(config-if)# exit
```

```
Router(config)# interface serial ‘numéro’
```

```
Router(config-if)# ip nat outside
```

```
Router(config-if)# exit
```



### Configurer la surcharge NAT (PAT) pour une d’adresses IP publique : 

```
Router(config)# access-list ‘1-99’ ‘permit/deny’ ‘@IP à transférer/any’ ‘masque générique’
```

```
Router(config)# ip nat pool ‘nom de la plage’ ‘premier @IP de la plage’ ‘dernier @IP de la plage’ netmask ‘masque’
```

```
Router(config)# ip nat inside source list ‘1-99’ pool ‘nom de la plage’ overload
```

```
Router(config)# interface fastEthernet ‘numéro’
```

```
Router(config-if)# ip nat inside
```

```
Router(config-if)# exit
```

```
Router(config)# interface serial ‘numéro’
```

```
Router(config-if)# ip nat outside
```

```
Router(config-if)# exit
```



### Configurer le protocole PPP avec l’authentification PAP :

```
Router(config)# username ‘nom de deuxième Routeur’ password ‘mot de passe’
```

```
Router(config)# interface serial ‘numéro’
```

```
Router(config-if)# encapsulation ppp
```

```
Router(config-if)# ppp authentication pap
```

```
Router(config-if)# ppp pap sent-username ‘nom de deuxième Routeur’ password ‘mot de passe’
```

```
Router(config-if)# exit
```



### Configurer le protocole PPP avec l’authentification CHAP :

```
Router(config)# username ‘nom de deuxième Routeur’ password ‘mot de passe’
```

```
Router(config)# interface serial ‘numéro’
```

```
Router(config-if)# encapsulation ppp
```

```
Router(config-if)# ppp authentication chap
```

```
Router(config-if)# exit
```



### Configurer les DLCI sous Frame Relay :

```
S0: 102 = R1-R2 S1: 201 = R2-R1 S3: 301 = R3-R1
```

```
103 = R1-R3 203 = R2-R3 302 = R3-R2
```



  
## Configuration de frame relay avec la liaison multi-link : (exemple de 3 routeurs) :
  
### Dans le Routeur 1 :

```
Router1(config)# interface serial ‘numéro’
```

```
Router1(config(if)# ip adresse ‘@’ ‘masque’
```

```
Router1(config-if)# clock rate ‘nombre’
```

```
Router1(config-if)# no shutdown
```

```
Router1(config-if)# encapsulation frame-relay
```

```
Router1(config-if)# frame-relay map ip ‘@de deuxième Routeur’ 102 broadcast
```

```
Router1(config-if)# frame-relay map ip ‘@de troisième Routeur’ 103 broadcast
```

```
Router1(config-if)# exit
```



### Dans le Routeur 2 :

```
Router2(config)# interface serial ‘numéro’
```

```
Router2(config(if)# ip adresse ‘@’ ‘masque’
```

```
Router2(config-if)# clock rate ‘nombre’
```

```
Router2(config-if)# no shutdown
```

```
Router2(config-if)# encapsulation frame-relay
```

```
Router2(config-if)# frame-relay map ip ‘@de deuxième Routeur’ 201 broadcast
```

```
Router2(config-if)# frame-relay map ip ‘@de troisième Routeur’ 203 broadcast
```

```
Router2(config-if)# exit
```



### Dans le Routeur 3 :

```
Router3(config)# interface serial ‘numéro’
```

```
Router3(config(if)# ip adresse ‘@’ ‘masque’
```

```
Router3(config-if)# clock rate ‘nombre’
```

```
Router3(config-if)# no shutdown
```

```
Router3(config-if)# encapsulation frame-relay
```

```
Router3(config-if)# frame-relay map ip ‘@de deuxième Routeur’ 301 broadcast
```

```
Router3(config-if)# frame-relay map ip ‘@de troisième Routeur’ 302 broadcast
```

```
Router3(config-if)# exit
```



## Configuration de frame relay avec la liaison point-to-point :

### Dans le Routeur 1 :

```
Router1(config)# interface serial ‘numéro’
```

```
Router1(config(if)# no ip adresse 
```

```
Router1(config-if)# no shutdown
```

```
Router1(config-if)# encapsulation frame-relay
```

```
Router1(config-if)# exit
```

```
Router1(config)# interface serial ‘numéro’.‘numéro DLCI’ point-to-point
```

```
Router1(config-subif)# ip address ‘@IP’ ‘masque’
```

```
Router1(config-subif)# frame-relay interface-dlci ‘numéro DLCI’ 
```

```
Router1(config-subif)# exit
```



### Dans le Routeur 2 :

```
Router2(config)# interface serial ‘numéro’. ‘numéro DLCI’ point-to-point
```

```
Router2(config-subif)# ip address ‘@IP’ ‘masque’
```

```
Router2(config-subif)# frame-relay interface-dlci ‘numéro DLCI’ 
```

```
Router2(config-subif)# exit
```



### Dans le Routeur 3 :

```
Router3(config)# interface serial ‘numéro’. ‘numéro DLCI’ point-to-point
```

```
Router3(config-subif)# ip address ‘@IP’ ‘masque’
```

```
Router3(config-subif)# frame-relay interface-dlci ‘numéro DLCI’ 
```

```
Router3(config-subif)# exit
```



### Enregistrer les configuration dans NVRAM :

```
Router# copy running-config startup-config
```



## Les commandes d’affichages:

### Afficher la configuration en cours :

```
Router# show running-config
```



### Afficher la configuration enregistrée dans NVRAM :

```
Router# show startup-config
```



### Afficher les interfaces avec leurs informations en brief :

```
Router# show interfaces
```



### Afficher les ACLs :

```
Router# show access-lists ‘1-199’
```



### Afficher toutes les commandes tapées :

```
Router# show history
```



### Afficher la table de routage :

```
Router# show ip route
```



### Afficher la configuration DHCP :

```
Router# show ip dhcp binding
```



### Afficher les informations du service NAT :

```
Router# show ip nat ‘statistics/translations’
```



### Afficher les informations de protocole de routage RIP :

```
Router# show ip rip database
```



### Afficher les informations de protocole de routage OSPF :

```
Router# show ip ospf database
```



### Afficher les informations de protocole de routage EIGRP :

```
Router# show ip eigrp database
```



### Afficher l’heure ainsi que la date du systèème :

```
Router# show clock
```



### Afficher les informations de protocole VTP :

```
Switch# show vtp
```



### Afficher les informations de protocole STP :

```
Switch# show spanning-tree
```



### Afficher les VLANs en brief :

```
Switch# show vlan brief
```



## Pour plus d’infos sur n’importe quelle commande ou bien sur n’importe quelle mode ainsi que leurs commandes :

###  Afficher les commandes du mode privilégié :

```
Router# ?
```

```
Switch# ?
```



###  Exemple :

```
Router# show ?
```

```
Router# show ?
```




