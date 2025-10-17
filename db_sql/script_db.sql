/*
Schéma : Base de données "babyfoot"

Tables et description générale
------------------------------
1) babyfoot_table
    - Id_babyfoot_table (INTEGER, PRIMARY KEY AUTOINCREMENT)
      Identifiant unique de la table de baby-foot. AUTOINCREMENT -> SQLite ROWID géré automatiquement.
    - table_location (TEXT, NOT NULL)
      Emplacement / nom du lieu où se trouve la table.
    - table_condition (TEXT)
      État détaillé avec contrainte CHECK (valeurs autorisées : 
      'beer stains', 'broken leg', 'good', 'missing screw', 'needs cleaning', 'new',
      'out of alignment', 'scratched', 'sticky handles', 'worn').
      La colonne peut être NULL (contrainte OR table_condition IS NULL).
    - table_state (TEXT)
      État opérationnel simplifié avec CHECK IN ('ok', 'busy', 'down'). Peut être NULL.
    - table_music (TEXT)
      Référence / description de la musique associée à la table (libre).

    Contraintes :
    - PK sur Id_babyfoot_table.
    - CHECK sur table_condition et table_state pour garantir des valeurs contrôlées.

2) match_
    - Id_match (INTEGER, PRIMARY KEY AUTOINCREMENT)
      Identifiant unique du match.
    - match_date (DATETIME, NOT NULL)
      Date/heure du match. Contraint UNIQUE (un seul match par même date/heure).
    - match_duration (INTEGER)
      Durée du match en unités entières (ex : minutes).
    - match_final_score_red, match_final_score_blue (INTEGER)
      Scores finaux des équipes.
    - match_winner (TEXT)
      Gagnant déclaré avec CHECK IN ('red', 'blue', 'tie').
    - match_rating (INTEGER)
      Note du match, contrainte CHECK BETWEEN 1 AND 5.
    - Id_babyfoot_table (INTEGER, NOT NULL)
      Clé étrangère référant babyfoot_table(Id_babyfoot_table).

    Contraintes :
    - UNIQUE(match_date) empêche deux entrées à la même date exacte.
    - FOREIGN KEY assure la référence à une table existante (aucune action ON DELETE/ON UPDATE explicite).

3) player
    - player_id (INTEGER, PRIMARY KEY)
      Identifiant du joueur.
    - player_pseudo (TEXT, NOT NULL, UNIQUE)
      Pseudo du joueur, unique.
    - player_name (TEXT, NOT NULL, UNIQUE)
      Nom complet / affiché, unique.
    - player_password (TEXT, NOT NULL, UNIQUE)
      Mot de passe (stockage en clair problématique et contrainte UNIQUE inhabituelle).
    - player_birthday (DATE)
      Date de naissance (peut être NULL).

    Remarques :
    - Les colonnes marquées UNIQUE imposent des valeurs distinctes.
    - Stockage des mots de passe : recommander hachage sécurisé (et ne pas forcer l'unicité).

4) play
    - Id_match (INTEGER)
      Référence au match (FOREIGN KEY → match_.Id_match).
    - player_id (INTEGER)
      Référence au joueur (FOREIGN KEY → player.player_id).
    - role (TEXT)
      Rôle du joueur pendant le match, CHECK IN ('attack', 'defense').
    - goal (INTEGER)
      Nombre de buts marqués par le joueur.
    - own_goal (INTEGER)
      Nombre d'autobuts.
    - mood (INTEGER)
      Indicateur d'humeur / score subjectif (aucune contrainte définie).
    - comment (TEXT)
      Commentaire libre sur la performance ou l'événement.
    - team_color (TEXT)
      Couleur de l'équipe, CHECK IN ('red', 'blue').
    - is_substitute (BOOLEAN)
      Indique si le joueur est remplaçant (SQLite n'a pas de type booléen natif; valeur stockée selon affinité).

    Contraintes :
    - PRIMARY KEY (Id_match, player_id) : table d'association many-to-many entre match_ et player, évite doublons joueur/match.
    - FOREIGN KEYS assurent intégrité référentielle (pas d'actions ON DELETE/UPDATE explicites).

Considérations SQLite et recommandations
---------------------------------------
- SQLite est permissif sur les types : vérifier la validation applicative si nécessaire.
- AUTOINCREMENT : utilisé pour garantir monotonie des ROWID (surcharge parfois inutile).
- BOOLEAN n'est pas un type natif strict en SQLite ; utilisez 0/1 ou CHECK pour normaliser.
- UNIQUE sur player_password est probablement indésirable ; plutôt stocker un hash et ne pas imposer l'unicité.
- Pas d'index explicite défini en dehors des PK/UNIQUE ; pour les requêtes fréquentes (date, Id_babyfoot_table, player_pseudo) envisager index additionnel.
- Les FOREIGN KEYS nécessitent PRAGMA foreign_keys = ON pour être appliquées en SQLite — s'assurer qu'elles sont activées au runtime.

Résumé fonctionnel
------------------
- babyfoot_table : inventaire des tables physiques et leur état.
- match_ : enregistrements des matchs (date/score/rating) liés à une table.
- player : catalogue des joueurs.
- play : association match↔joueur avec statistiques et rôle pour chaque participation.
*/
DROP TABLE IF EXISTS babyfoot_table;
CREATE TABLE babyfoot_table (
    Id_babyfoot_table INTEGER PRIMARY KEY AUTOINCREMENT,
    table_location TEXT NOT NULL,
    table_condition TEXT CHECK (
        table_condition IN (
            'beer stains',
            'broken leg',
            'good',
            'missing screw',
            'needs cleaning',
            'new',
            'out of alignment',
            'scratched',
            'sticky handles',
            'worn'
        ) OR table_condition IS NULL
    ),
    table_state TEXT CHECK (table_state IN ('ok', 'busy', 'down')),
    table_music TEXT
);

DROP TABLE IF EXISTS match_;
CREATE TABLE match_ (
    Id_match INTEGER PRIMARY KEY AUTOINCREMENT,
    match_date DATETIME NOT NULL,
    match_duration INTEGER,
    match_final_score_red INTEGER,
    match_final_score_blue INTEGER,
    match_winner TEXT CHECK (match_winner IN ('red', 'blue', 'tie')),
    match_rating INTEGER CHECK (match_rating BETWEEN 1 AND 5),
    Id_babyfoot_table INTEGER NOT NULL,
    UNIQUE (match_date),
    FOREIGN KEY (Id_babyfoot_table) REFERENCES babyfoot_table (Id_babyfoot_table)
);

DROP TABLE IF EXISTS player;
CREATE TABLE player (
    player_id INTEGER PRIMARY KEY,
    player_pseudo TEXT NOT NULL UNIQUE,
    player_name TEXT NOT NULL UNIQUE,
    player_password TEXT NOT NULL UNIQUE,
    player_birthday DATE
);

DROP TABLE IF EXISTS play;
CREATE TABLE play (
    Id_match INTEGER,
    player_id INTEGER,
    role TEXT CHECK (role IN ('attack', 'defense')),
    goal INTEGER,
    own_goal INTEGER,
    mood INTEGER,
    comment TEXT,
    team_color TEXT CHECK (team_color IN ('red', 'blue')),
    is_substitute BOOLEAN,
    PRIMARY KEY (Id_match, player_id),
    FOREIGN KEY (Id_match) REFERENCES match_ (Id_match),
    FOREIGN KEY (player_id) REFERENCES player (player_id)
);
