# Hackathon - Ynov Toulouse 2025 : Babyfoot du futur - FullStack

## Equipe

- Dev' FullStack 1 : Breton Swan
- Dev' FullStack 2 : Douville Leo
- Dev' FullStack 3 : Mamie Melissa

Et si on réinventait l’expérience babyfoot à Ynov ? L’objectif de ce hackathon est de moderniser et digitaliser l’usage des babyfoots présents dans le Souk pour créer un service _next-gen_, pensé pour près de 1000 étudiants !

Que ce soit via des gadgets connectés, un système de réservation intelligent, des statistiques en temps réel ou des fonctionnalités robustes pour une utilisation massive, nous cherchons des solutions innovantes qui allient créativité et technologie.

Toutes les filières sont invitées à contribuer : Dev, Data, Infra, IoT, Systèmes embarqués… chaque idée compte pour rendre le babyfoot plus fun, plus pratique et plus connecté.

Votre mission : transformer le babyfoot classique en expérience high-tech pour Ynov !

---

> Ce fichier contient les informations spécifiques au développement FullStack de votre projet. Il suffit d'en remplir une seule fois, même si vous êtes plusieurs développeurs FullStack dans l'équipe.


# Installation et lancement

Pour tester le site, une fois le dépôt cloné, il faut réaliser les commandes suivantes : 
```bash
# Se positionner dans le dossier server 
cd server 

# Installer les dépendances
npm install

# Lancer le serveur
node server.js
```

# Site 
Le site constitue la partie visible pour les utilisateurs Ynov.
Il permet de :
- se connecter à son compte joueur,
- s'inscrire pour avoir un compte joueur,
- consulter les informations principales du babyfoot connecté,
- visualiser les matchs en cours ou récents,
- créer et lancer une partie.

## Fonctionnalités Implémentées :

- Gestion des tables disponibles : Récupération dynamique des tables babyfoot prêtes à l’usage via une API, avec sélection dans le formulaire de création de match.

- Création de matchs en temps réel : Possibilité pour un joueur connecté de créer un match sur une table disponible.

- Rejoindre une équipe : Les joueurs peuvent rejoindre l’équipe rouge ou bleue d’un match en cours via des boutons interactifs.

- Affichage des matchs en direct : Liste des matchs actifs avec informations sur les joueurs présents dans chaque équipe, le score actuel, et un timer en direct depuis le début du match.

- Mise à jour automatique : Rafraîchissement périodique (toutes les 3 secondes) des matchs en cours pour refléter l’état en temps réel sans avoir besoin de rafraîchir manuellement la page.

- Gestion de session utilisateur : Connexion / déconnexion gérée côté client via sessionStorage avec adaptation dynamique de la navigation.

- Séparation claire front-end / back-end : Utilisation de fetch API pour communiquer avec le serveur local (node.js ou autre) qui gère les données des tables, matchs et joueurs.

## Fonctionnalités Non Implémentées / À Venir : 

- Ajout de points en temps réel : La mise à jour des scores pendant un match (ajouter des points pour chaque équipe) n’est pas encore fonctionnelle.

- Arrêt / fin des matchs : Le système de terminer officiellement un match et enregistrer le résultat final est à développer.



# Dashboard Administrateur

C'est un espace de gestion dédié aux administrateurs et super-admins.
Il permet de :
- consulter les statistiques globales,
- gérer les utilisateurs,
- modifier/supprimer des babyfoots,
- consulter les détails de chaque table (état, dégâts, statut, etc.)

Le dashboard est statique mais relié à des endpoints mock JSON pour simuler l'interaction avec une API réelle.

## Aperçu du dashboard 

### Connexion
<img width="1218" height="653" alt="connexion" src="https://github.com/user-attachments/assets/f40dbfaa-59e3-46e4-89d2-9482461fb232" />

### Vue d'ensemble des tables et statistiques
<img width="1901" height="1011" alt="status" src="https://github.com/user-attachments/assets/e1be31aa-23ed-458f-aa34-3c49328968c2" />

### Gestion des administrateurs
<img width="1907" height="1007" alt="gestion-admin" src="https://github.com/user-attachments/assets/3c33a26b-d3a3-4669-9fd9-e37e63c6d102" />

### Affichage des babyfoots
<img width="1906" height="1009" alt="babyfoots" src="https://github.com/user-attachments/assets/106ca375-1e9c-4a09-95a2-08e0ff0e2264" />



# Choix Techniques & Démarche :

- Front-end : HTML/CSS/JavaScript vanilla, manipulation du DOM pour rendre les cartes de matchs dynamiques. Utilisation de setInterval pour le timer en direct.

- Back-end : API REST (localisée sur localhost:8000) pour gérer les ressources babyfoot : tables, matchs, joueurs.

- Session : Choix d’utiliser sessionStorage pour conserver les informations utilisateur sur le client sans authentification lourde, suffisant pour le hackathon.

### Démarche
Approche modulaire : séparation claire front / dashboard / serveur, facilitant l'évolutivité et la maintenance du projet.



# L'équipe FullStack au sein du projet
L’équipe FullStack a joué un rôle clé dans la mise en place du socle technique du projet.
Nous avons servi de point de jonction entre toutes les spécialités : 
- en définissant la structure des routes et des données,
- en validant les flux entre le front, la data et les futurs IoT,
- en testant la cohérence des échanges entre les différents modules.

Notre organisation a reposé sur une répartition claire :
   - un membre chargé du front utilisateur et interactions,
   - un membre orienté dashboard administrateur et logique d’administration,
   - un membre concentré sur le back, gestion des routes, connexion a la base de données et systèmes d'affichage des matchs.

Grâce à cette complémentarité, nous avons pu livrer un prototype complet et fonctionnel, démontrant la faisabilité du futur système connecté de gestion des babyfoots Ynov.


