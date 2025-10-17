# Hackathon - Ynov Toulouse 2025 : Babyfoot du futur - FullStack

## Equipe

- Dev' FullStack 1 : Breton Swan
- Dev' FullStack 2 : Douville Leo
- Dev' FullStack 3 : Mamie Melissa

Et si on réinventait l’expérience babyfoot à Ynov ? L’objectif de ce hackathon est de moderniser et digitaliser l’usage des babyfoots présents dans le Souk pour créer un service _next-gen_, pensé pour près de 1000 étudiants !

Que ce soit via des gadgets connectés, un système de réservation intelligent, des statistiques en temps réel ou des fonctionnalités robustes pour une utilisation massive, nous cherchons des solutions innovantes qui allient créativité et technologie.

Toutes les filières sont invitées à contribuer : Dev, Data, Infra, IoT, Systèmes embarqués… chaque idée compte pour rendre le babyfoot plus fun, plus pratique et plus connecté.

Pour tester le site, une fois le dépôt cloné, il faut réaliser les commandes suivantes : 
- se postionner dans le dossier server ( cd server )
- faire un npm install
- lancer le serveur avec node server.js

Fonctionnalités Implémentées :

- Gestion des tables disponibles : Récupération dynamique des tables babyfoot prêtes à l’usage via une API, avec sélection dans le formulaire de création de match.

- Création de matchs en temps réel : Possibilité pour un joueur connecté de créer un match sur une table disponible.

- Rejoindre une équipe : Les joueurs peuvent rejoindre l’équipe rouge ou bleue d’un match en cours via des boutons interactifs.

- Affichage des matchs en direct : Liste des matchs actifs avec informations sur les joueurs présents dans chaque équipe, le score actuel, et un timer en direct depuis le début du match.

- Mise à jour automatique : Rafraîchissement périodique (toutes les 3 secondes) des matchs en cours pour refléter l’état en temps réel sans avoir besoin de rafraîchir manuellement la page.

- Gestion de session utilisateur : Connexion / déconnexion gérée côté client via sessionStorage avec adaptation dynamique de la navigation.

- Séparation claire front-end / back-end : Utilisation de fetch API pour communiquer avec le serveur local (node.js ou autre) qui gère les données des tables, matchs et joueurs.

Choix Techniques & Démarche :

- Front-end : HTML/CSS/JavaScript vanilla, manipulation du DOM pour rendre les cartes de matchs dynamiques. Utilisation de setInterval pour le timer en direct.

- Back-end : API REST (localisée sur localhost:8000) pour gérer les ressources babyfoot : tables, matchs, joueurs.

- Session : Choix d’utiliser sessionStorage pour conserver les informations utilisateur sur le client sans authentification lourde, suffisant pour le hackathon.

Fonctionnalités Non Implémentées / À Venir : 

- Ajout de points en temps réel : La mise à jour des scores pendant un match (ajouter des points pour chaque équipe) n’est pas encore fonctionnelle.

- Arrêt / fin des matchs : Le système de terminer officiellement un match et enregistrer le résultat final est à développer.








