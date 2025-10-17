# Hackathon - Ynov Toulouse 2025 : Babyfoot du futur - IA & Data

## Equipe

- IA & Data 1 : FOURNET Charly
- IA & Data 2 : RAVEL Arthur

Et si on réinventait l’expérience babyfoot à Ynov ? L’objectif de ce hackathon est de moderniser et digitaliser l’usage des babyfoots présents dans le Souk pour créer un service _next-gen_, pensé pour près de 1000 étudiants !

Que ce soit via des gadgets connectés, un système de réservation intelligent, des statistiques en temps réel ou des fonctionnalités robustes pour une utilisation massive, nous cherchons des solutions innovantes qui allient créativité et technologie.

Toutes les filières sont invitées à contribuer : Dev, Data, Infra, IoT, Systèmes embarqués… chaque idée compte pour rendre le babyfoot plus fun, plus pratique et plus connecté.

Votre mission : transformer le babyfoot classique en expérience high-tech pour Ynov !

---

> Ce fichier contient les informations spécifiques à l'IA/Data de votre projet. Il suffit d'en remplir une seule fois, même si vous êtes plusieurs IA/Data dans l'équipe.

# Requis

Ce README contient les requis fonctionnels de la partie IA Data de votre projet. Il doit compléter le README principal à la racine du projet, et servira la partie de votre note propre à votre spécialité.

Basez-vous sur les spécifications dans [SPECIFICATIONS.md](../SPECIFICATIONS.md) pour remplir ce document.

Décrivez ici les actions que vous avez menées, votre démarche, les choix techniques que vous avez faits, les difficultés rencontrées, etc. Précisez également dans quelle mesure vous avez pu collaborer avec les autres spécialités.

Autrement, il n'y a pas de format imposé, mais essayez de rester clair et concis, je ne vous demande pas de rédiger un roman, passez à l'essentiel, et épargnez-moi de longues pages générées par IA (malusée).

En conclusion, cela doit résumer votre travail en tant qu'expert.e IA Data, et vous permettre de garder un trace écrite de votre contribution au projet.

Merci de votre participation, et bon courage pour la suite du hackathon !

# Travaux effectués

## Traitement des données

Le traitement des données a été effectué initialement avec OpenRefine. Nous avons utilisé la fonction de clustering pour identifier les textes semblables et fusionner les variantes orthographiques (ex. "bleu", "blu", "blue"), ce qui a permis de normaliser les valeurs. Grâce à OpenRefine, nous avons aussi analysé l'ensemble des textes d'une colonne et effectué des remplacements massifs (ex. convertir des évaluations représentées par 3 emojis étoile en la valeur numérique 3, visualisation rapide des problèmes d'encodage sur les colonnes avec un nombre défini de string précis). Enfin, nous avons uniformisé rapidement les formats de date (parsing et mise au même format ISO).

----> tu peux ajouter la partie python charly

> ### Clustering
> <img src="DATA/images/cluster_text.png" alt="Schéma d'architecture" width="100%"/>
>
> ### Analyse des textes et transformation
> <img src="DATA/images/analyse_transformation_text.png" alt="Schéma d'architecture" width="100%"/>
>
> ### Uniformisation des dates
> <img src="DATA/images/transform_date.png" alt="Schéma d'architecture" width="100%"/>


## Analyse
---> Charly

## Mise en place de la BD

Suite à notre analyse des données, nous avons mis en place une base de données robuste. Toutes les spécifications et la documentation se trouvent dans le fichier [db_sql/documentation.md](db_sql/documentation.md).
Niveau technologie nous nous sommes tournés vers SQLite pour la légereté du SGBD qui tournera sur le raspberry avec les spécifications données par l'équipe infra et la connaissance SQL du groupe entier, surtout de la part des dévs.

## Power BI

---> charly

## ChatBot IA

## L'équipe DATA au sein de l'équipe

Pour finir, nous avons pu être les pierres angulaires du groupe. Étant responsables de la partie data, tous les groupes devaient savoir quelles données étaient communiquées et de quelle manière. Grâce à notre expérience professionnelle, nous avons également animé des points réguliers durant ces dernières 48 heures afin de cadrer l’avancée du projet. Enfin, le fait d’être deux nous a permis de nous répartir les tâches : l’un de nous pouvait suivre de près un groupe en particulier afin de les aider et de répondre à leurs éventuelles questions.